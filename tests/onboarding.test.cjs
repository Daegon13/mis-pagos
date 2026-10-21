const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { DatabaseSync } = require('node:sqlite');
const { load } = require('./helpers/load.cjs');

const { runMigrations, DATABASE_VERSION } = load('src/data/db/migrations/index.ts');
const { getOnboardingState, beginOnboarding, advanceOnboarding, finishOnboarding } =
  load('src/data/repositories/onboardingRepository.ts');
const { entryFor, resumeStep, nextStep, DEMO } = load('src/features/onboarding/onboardingFlow.ts');

function openDb() {
  const sqlite = new DatabaseSync(':memory:');
  const db = {
    execAsync: async sql => sqlite.exec(sql),
    runAsync: async (sql, ...args) => sqlite.prepare(sql).run(...args),
    getFirstAsync: async (sql, ...args) => sqlite.prepare(sql).get(...args) ?? null,
    getAllAsync: async (sql, ...args) => sqlite.prepare(sql).all(...args),
    withExclusiveTransactionAsync: async callback => {
      sqlite.exec('BEGIN');
      try { await callback(db); sqlite.exec('COMMIT'); }
      catch (error) { sqlite.exec('ROLLBACK'); throw error; }
    },
  };
  return { db, sqlite };
}

test('fresh install: welcome, setup, demo, skip, completion and safe resume', async () => {
  const { db, sqlite } = openDb();
  try {
    await runMigrations(db);
    assert.equal(DATABASE_VERSION, 11);
    assert.equal(await getOnboardingState(db), null);
    assert.equal(entryFor(false, null), 'welcome');
    const active = await beginOnboarding(db);
    assert.equal(entryFor(false, active), 'setup');
    assert.equal(entryFor(true, active), 'demo');
    assert.equal(resumeStep(active), 'today');
    await advanceOnboarding(db, 'commitments');
    assert.equal(resumeStep(await getOnboardingState(db)), 'commitments');
    assert.equal(nextStep('commitments'), 'available');
    assert.equal(resumeStep(await getOnboardingState(db)), 'commitments'); // simulated cold reopen
    const done = await finishOnboarding(db, 'completed');
    assert.equal(entryFor(true, done), 'home');
    assert.equal((await beginOnboarding(db)).status, 'completed');
    assert.equal((await advanceOnboarding(db, 'projection')).status, 'completed');
    assert.equal((await finishOnboarding(db, 'skipped')).status, 'completed');
  } finally { sqlite.close(); }
});

test('omitting before setup persists and never auto-opens the demo', async () => {
  const { db, sqlite } = openDb();
  try {
    await runMigrations(db);
    const skipped = await finishOnboarding(db, 'skipped');
    assert.equal(entryFor(false, skipped), 'setup');
    assert.equal(entryFor(true, skipped), 'home');
    assert.equal((await getOnboardingState(db)).status, 'skipped');
  } finally { sqlite.close(); }
});

test('v10 upgrade marks a configured user legacy without touching existing data', async () => {
  const { db, sqlite } = openDb();
  try {
    await runMigrations(db);
    sqlite.exec(`DROP TABLE onboarding_state; PRAGMA user_version = 10;
      INSERT INTO financial_profile VALUES (1,'UYU',-12345,'2026-10-19','stamp','stamp');
      INSERT INTO payments VALUES (1,'expense','Alquiler',800000,'2026-10-25','pending',NULL,'stamp','stamp');
      INSERT INTO achievement_unlocks VALUES ('FIRST_COMMITMENT','stamp');
      INSERT INTO beta_feedback_answers VALUES ('core_value','o1','stamp','stamp');
      INSERT INTO spending_plans VALUES (1,'2026-10-01','2026-10-31','fixed',NULL,10000,100000,'stamp','stamp');`);
    const tables = ['financial_profile', 'payments', 'achievement_unlocks', 'beta_feedback_answers',
      'spending_plans', 'personalization_preferences'];
    const before = tables.map(table => sqlite.prepare(`SELECT * FROM ${table}`).all());
    await runMigrations(db);
    assert.deepEqual(tables.map(table => sqlite.prepare(`SELECT * FROM ${table}`).all()), before);
    const legacy = await getOnboardingState(db);
    assert.deepEqual(legacy, { status: 'legacy', stepId: null });
    assert.equal(entryFor(true, legacy), 'home');
    assert.equal((await beginOnboarding(db)).status, 'legacy');
    assert.equal((await finishOnboarding(db, 'completed')).status, 'legacy');
    assert.equal(sqlite.prepare('PRAGMA user_version').get().user_version, 11);
  } finally { sqlite.close(); }
});

test('v10 without a profile remains eligible for welcome', async () => {
  const { db, sqlite } = openDb();
  try {
    await runMigrations(db);
    sqlite.exec('DROP TABLE onboarding_state; PRAGMA user_version = 10;');
    await runMigrations(db);
    assert.equal(await getOnboardingState(db), null);
    assert.equal(entryFor(false, null), 'welcome');
  } finally { sqlite.close(); }
});

test('demo values are isolated and replay bypasses historic writes', () => {
  assert.equal(DEMO.balanceMinor - DEMO.expenseMinor, DEMO.availableMinor);
  assert.equal(DEMO.availableMinor + DEMO.incomeMinor, DEMO.projectionMinor);
  const demo = fs.readFileSync('src/features/onboarding/OnboardingDemo.tsx', 'utf8');
  assert.doesNotMatch(demo, /useSQLiteContext|createPayment|saveFinancialProfile|achievementRepository|NotificationCoordinator/);
  const route = fs.readFileSync('src/app/onboarding.tsx', 'utf8');
  assert.match(route, /if \(replay\) return;[\s\S]*advanceOnboarding/);
  assert.match(route, /if \(replay\) \{[\s\S]*return;[\s\S]*finishOnboarding/);
  const help = fs.readFileSync('src/features/help/HelpScreen.tsx', 'utf8');
  assert.match(help, /Ver tutorial de Mis Pagos/);
  assert.match(help, /onboarding\?mode=replay/);
});
