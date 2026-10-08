const { test } = require('node:test');
const assert = require('node:assert/strict');
const { DatabaseSync } = require('node:sqlite');
const { load } = require('./helpers/load.cjs');

const { ACHIEVEMENTS, derivableAchievements, isPersonalized } = load('src/domain/achievements.ts');
const { DEFAULT_SELECTION } = load('src/domain/personalization.ts');
const { runMigrations } = load('src/data/db/migrations/index.ts');
const { initialMigration } = load('src/data/db/migrations/001_initial.ts');
const { engagementMigration } = load('src/data/db/migrations/002_engagement.ts');
const { personalizationMigration } = load('src/data/db/migrations/003_personalization.ts');
const { spendingPlanMigration } = load('src/data/db/migrations/004_spending_plan.ts');
const { unlockAchievement, listAchievementUnlocks } = load('src/data/repositories/achievementRepository.ts');
const { tryUnlock, attemptUnlock, deriveExistingAchievements } = load('src/features/achievements/achievementService.ts');
const { createPayment, deletePayment } = load('src/data/repositories/paymentRepository.ts');
const { completePayment, cancelPendingPayment } = load('src/data/repositories/paymentLifecycle.ts');

function fixture() {
  const sqlite = new DatabaseSync(':memory:');
  sqlite.exec('PRAGMA foreign_keys = ON');
  const db = {
    execAsync: async sql => sqlite.exec(sql),
    runAsync: async (sql, ...params) => {
      const result = sqlite.prepare(sql).run(...params);
      return { changes: result.changes, lastInsertRowId: result.lastInsertRowid };
    },
    getFirstAsync: async (sql, ...params) => sqlite.prepare(sql).get(...params) ?? null,
    getAllAsync: async (sql, ...params) => sqlite.prepare(sql).all(...params),
    withExclusiveTransactionAsync: async callback => {
      sqlite.exec('BEGIN');
      try { await callback(db); sqlite.exec('COMMIT'); }
      catch (error) { sqlite.exec('ROLLBACK'); throw error; }
    },
  };
  return { db, sqlite };
}

test('registry has seven stable unique ordered IDs', () => {
  assert.deepEqual(ACHIEVEMENTS.map(x => x.id), [
    'FIRST_COMMITMENT', 'FIRST_EXPECTED_INCOME', 'FIRST_RESOLVED_MOVEMENT',
    'FIRST_OVERDUE_RESOLVED', 'FIRST_RESERVE', 'FIRST_SPENDING_SIMULATION',
    'FIRST_PERSONALIZED_SPACE',
  ]);
  assert.equal(new Set(ACHIEVEMENTS.map(x => x.id)).size, 7);
});

test('fresh v5 unlocks persist once and never change other tables', async () => {
  const { db, sqlite } = fixture();
  try {
    await runMigrations(db);
    assert.equal(sqlite.prepare('PRAGMA user_version').get().user_version, 5);
    assert.equal((await listAchievementUnlocks(db)).length, 0);
    const before = ['financial_profile', 'payments', 'engagement_progress',
      'personalization_preferences', 'spending_plans', 'spending_allocations']
      .map(table => sqlite.prepare(`SELECT * FROM ${table}`).all());
    assert.equal(await unlockAchievement(db, 'FIRST_RESERVE'), true);
    assert.equal(await unlockAchievement(db, 'FIRST_RESERVE'), false);
    assert.equal(await unlockAchievement(db, 'FIRST_SPENDING_SIMULATION'), true);
    assert.equal(await attemptUnlock(db, 'FIRST_SPENDING_SIMULATION'), 'existing');
    assert.equal((await listAchievementUnlocks(db)).length, 2);
    assert.deepEqual(['financial_profile', 'payments', 'engagement_progress',
      'personalization_preferences', 'spending_plans', 'spending_allocations']
      .map(table => sqlite.prepare(`SELECT * FROM ${table}`).all()), before);
    assert.equal(await tryUnlock({ runAsync: async () => { throw Error('disk'); } }, 'FIRST_RESERVE'), false);
    assert.equal(await attemptUnlock({ runAsync: async () => { throw Error('disk'); } }, 'FIRST_RESERVE'), 'failed');
  } finally { sqlite.close(); }
});

test('v4 upgrade preserves rows and derives only supported history', async () => {
  const { db, sqlite } = fixture();
  try {
    for (const migration of [initialMigration, engagementMigration, personalizationMigration, spendingPlanMigration]) {
      await migration.up(db);
    }
    sqlite.exec(`PRAGMA user_version=4;
      INSERT INTO financial_profile VALUES(1,'UYU',-100,'2026-10-08','stamp','stamp');
      INSERT INTO payments VALUES(1,'expense','Rent',100,'2026-10-01','completed',NULL,'stamp','stamp');
      INSERT INTO payments VALUES(2,'income','Pay',200,'2026-10-09','pending',NULL,'stamp','stamp');
      UPDATE engagement_progress SET stage=2 WHERE id=1;
      UPDATE personalization_preferences SET theme_id='oceano' WHERE id=1;
      INSERT INTO spending_plans (period_start,period_end,reserve_mode,reserve_percent_basis_points,reserve_target_minor,created_from_available_minor,created_at,updated_at)
        VALUES('2026-10-01','2026-10-31','fixed',NULL,50,-100,'stamp','stamp');`);
    const before = ['financial_profile', 'payments', 'engagement_progress', 'personalization_preferences', 'spending_plans']
      .map(table => sqlite.prepare(`SELECT * FROM ${table}`).all());
    await runMigrations(db);
    assert.equal(sqlite.prepare('PRAGMA user_version').get().user_version, 5);
    assert.equal((await listAchievementUnlocks(db)).length, 0);
    await deriveExistingAchievements(db);
    await deriveExistingAchievements(db);
    assert.deepEqual(new Set((await listAchievementUnlocks(db)).map(row => row.achievement_id)), new Set([
      'FIRST_COMMITMENT', 'FIRST_EXPECTED_INCOME', 'FIRST_RESOLVED_MOVEMENT',
      'FIRST_RESERVE', 'FIRST_PERSONALIZED_SPACE',
    ]));
    assert.deepEqual(['financial_profile', 'payments', 'engagement_progress', 'personalization_preferences', 'spending_plans']
      .map(table => sqlite.prepare(`SELECT * FROM ${table}`).all()), before);
  } finally { sqlite.close(); }
});

test('retroactive rules exclude cancelled and unsupported event history', () => {
  const item = (type, status) => ({ type, status });
  assert.deepEqual(derivableAchievements([item('expense', 'cancelled')], false, DEFAULT_SELECTION), []);
  const ids = derivableAchievements([item('income', 'completed')], false, DEFAULT_SELECTION);
  assert.deepEqual(ids, ['FIRST_EXPECTED_INCOME', 'FIRST_RESOLVED_MOVEMENT']);
  assert.equal(isPersonalized(DEFAULT_SELECTION), false);
  assert.equal(isPersonalized({ ...DEFAULT_SELECTION, spaceName: '  Mi rincón ' }), true);
});

test('overdue eligibility is captured immediately before successful resolution', async () => {
  const { db, sqlite } = fixture();
  try {
    await runMigrations(db);
    sqlite.exec("INSERT INTO financial_profile VALUES(1,'UYU',10000,'2026-10-08','stamp','stamp')");
    const old = await createPayment(db, { type: 'expense', title: 'Old', amountMinor: 100,
      dueDate: '2026-10-07', notes: '' });
    const future = await createPayment(db, { type: 'income', title: 'Future', amountMinor: 100,
      dueDate: '2026-10-09', notes: '' });
    const deleted = await createPayment(db, { type: 'expense', title: 'Delete', amountMinor: 100,
      dueDate: '2026-10-07', notes: '' });
    assert.equal((await completePayment(db, old.id, false, new Date(2026, 9, 8))).wasOverdue, true);
    assert.equal((await cancelPendingPayment(db, future.id, new Date(2026, 9, 8))).wasOverdue, false);
    await deletePayment(db, deleted.id);
    assert.equal((await listAchievementUnlocks(db)).length, 0);
    assert.equal(await unlockAchievement(db, 'FIRST_OVERDUE_RESOLVED'), true);
    assert.equal(await unlockAchievement(db, 'FIRST_OVERDUE_RESOLVED'), false);
    const old2 = await createPayment(db, { type: 'expense', title: 'Old 2', amountMinor: 100,
      dueDate: '2026-10-07', notes: '' });
    assert.equal((await cancelPendingPayment(db, old2.id, new Date(2026, 9, 8))).wasOverdue, true);
    assert.equal(await unlockAchievement(db, 'FIRST_OVERDUE_RESOLVED'), false);
  } finally { sqlite.close(); }
});

test('cosmetic write failure after completion leaves financial success committed', async () => {
  const { db, sqlite } = fixture();
  try {
    await runMigrations(db);
    sqlite.exec("INSERT INTO financial_profile VALUES(1,'UYU',10000,'2026-10-08','stamp','stamp')");
    const payment = await createPayment(db, { type: 'expense', title: 'Bill', amountMinor: 100,
      dueDate: '2026-10-08', notes: '' });
    await completePayment(db, payment.id, true, new Date(2026, 9, 8));
    assert.equal(await tryUnlock({ runAsync: async () => { throw Error('disk'); } }, 'FIRST_RESOLVED_MOVEMENT'), false);
    assert.equal(sqlite.prepare('SELECT status FROM payments WHERE id=?').get(payment.id).status, 'completed');
    assert.equal(sqlite.prepare('SELECT available_balance_minor FROM financial_profile').get().available_balance_minor, 9900);
    assert.equal((await listAchievementUnlocks(db)).length, 0);
  } finally { sqlite.close(); }
});
