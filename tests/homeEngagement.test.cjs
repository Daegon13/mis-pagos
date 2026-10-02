const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const { DatabaseSync } = require('node:sqlite');

function load(path, requireModule = require) {
  const exports = {};
  new Function('exports', 'require', ts.transpileModule(fs.readFileSync(path, 'utf8'),
    { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText)(exports, requireModule);
  return exports;
}
const { calculateHome } = require('./helpers/load.cjs').load('src/features/home/homeSummary.ts');
const { financialFeedback } = load('src/features/home/homeFeedback.ts');
const { spaceStage } = load('src/domain/engagement.ts');
const { advanceSpace } = load('src/data/repositories/engagementRepository.ts');
const { initialMigration } = load('src/data/db/migrations/001_initial.ts');
const { engagementMigration } = load('src/data/db/migrations/002_engagement.ts');
const { personalizationMigration } = load('src/data/db/migrations/003_personalization.ts');
const { runMigrations } = load('src/data/db/migrations/index.ts', (name) =>
  name === './001_initial' ? { initialMigration } :
    name === './002_engagement' ? { engagementMigration } : { personalizationMigration });
const now = new Date(2026, 8, 28, 23, 59);
const payment = (type, overrides = {}) => ({ id: 1, type, amountMinor: 100,
  dueDate: '2026-09-28', status: 'pending', ...overrides });

test('interpretation: empty, income-only, exactly covered, shortfall and negative opening balance', () => {
  assert.equal(financialFeedback(calculateHome(100, [], now)).kind, 'unplanned');
  assert.equal(financialFeedback(calculateHome(100, [payment('income')], now)).kind, 'unplanned');
  assert.equal(financialFeedback(calculateHome(100, [payment('expense')], now)).kind, 'covered');
  const deficit = financialFeedback(calculateHome(50, [payment('expense'), payment('income')], now));
  assert.equal(deficit.kind, 'shortfall');
  assert.equal(deficit.shortfallMinor, 50); // Expected income cannot cover current shortfall.
  assert.equal(financialFeedback(calculateHome(-100, [], now)).kind, 'unplanned');
  assert.equal(financialFeedback(calculateHome(-100, [payment('expense')], now)).shortfallMinor, 200);
});

test('three milestones ignore money, repeated/split transactions, past and inactive payments', () => {
  assert.equal(spaceStage([], now), 0);
  for (const type of ['expense', 'income']) {
    assert.equal(spaceStage([payment(type)], now), 1);
    assert.equal(spaceStage(Array.from({ length: 100 }, () => payment(type, { amountMinor: 1 })), now), 1);
    assert.equal(spaceStage([payment(type, { amountMinor: Number.MAX_SAFE_INTEGER })], now), 1);
  }
  assert.equal(spaceStage([payment('expense'), payment('income', { dueDate: '2027-01-01' })], now), 2);
  assert.equal(spaceStage([payment('expense', { dueDate: '2026-09-27' }),
    payment('expense', { status: 'completed' }), payment('income', { status: 'cancelled' })], now), 0);
  assert.equal(spaceStage([payment('expense', { dueDate: '2026-09-28' })], new Date(2026, 8, 29)), 0);
});

test('forward migration, atomic non-regression, one surprise, and financial independence on SQLite', async () => {
  const sqlite = new DatabaseSync(':memory:');
  const db = {
    execAsync: async sql => sqlite.exec(sql),
    runAsync: async (sql, ...params) => sqlite.prepare(sql).run(...params),
    getFirstAsync: async (sql, ...params) => sqlite.prepare(sql).get(...params) ?? null,
    withExclusiveTransactionAsync: async callback => {
      sqlite.exec('BEGIN');
      try { await callback(db); sqlite.exec('COMMIT'); }
      catch (error) { sqlite.exec('ROLLBACK'); throw error; }
    },
  };
  try {
    await initialMigration.up(db);
    sqlite.exec("PRAGMA user_version=1; INSERT INTO financial_profile VALUES(1,'UYU',-100,'2026-09-28','stamp','stamp'); INSERT INTO payments VALUES(1,'expense','Rent',123,'2026-09-29','pending',NULL,'stamp','stamp');");
    const before = ['financial_profile', 'payments'].map(table => sqlite.prepare(`SELECT * FROM ${table}`).all());
    await runMigrations(db);
    await runMigrations(db); // Reopening the app cannot reset the table.
    assert.equal(sqlite.prepare('PRAGMA user_version').get().user_version, 3);
    assert.deepEqual(await advanceSpace(db, 0), { stage: 0, surprise: false });
    assert.deepEqual(await advanceSpace(db, 1), { stage: 1, surprise: false });
    assert.deepEqual(await advanceSpace(db, 0), { stage: 1, surprise: false });
    assert.deepEqual(await advanceSpace(db, 2), { stage: 2, surprise: true });
    for (const next of [2, 1, 0, 2]) assert.deepEqual(await advanceSpace(db, next), { stage: 2, surprise: false });
    assert.deepEqual(['financial_profile', 'payments'].map(table => sqlite.prepare(`SELECT * FROM ${table}`).all()), before);
    assert.throws(() => sqlite.exec('UPDATE engagement_progress SET stage=3'));
    assert.throws(() => sqlite.exec('UPDATE engagement_progress SET stage=1.5'));
  } finally { sqlite.close(); }
});
