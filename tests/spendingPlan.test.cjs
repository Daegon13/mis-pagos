const { test } = require('node:test');
const assert = require('node:assert/strict');
const { DatabaseSync } = require('node:sqlite');
const { load } = require('./helpers/load.cjs');
const { monthPeriod, remainingDays, reserveTarget, planAmounts, validateAllocations,
  allocationAmounts, referencePace, simulateSpending } = load('src/domain/spendingPlan.ts');
const { runMigrations } = load('src/data/db/migrations/index.ts');
const { initialMigration } = load('src/data/db/migrations/001_initial.ts');
const { engagementMigration } = load('src/data/db/migrations/002_engagement.ts');
const { personalizationMigration } = load('src/data/db/migrations/003_personalization.ts');
const { getCurrentPlan, saveCurrentPlan, deleteCurrentPlan } = load('src/data/repositories/spendingPlanRepository.ts');

function fixture() {
  const sqlite = new DatabaseSync(':memory:');
  sqlite.exec('PRAGMA foreign_keys = ON');
  const db = {
    execAsync: async sql => sqlite.exec(sql),
    runAsync: async (sql, ...params) => sqlite.prepare(sql).run(...params),
    getFirstAsync: async (sql, ...params) => sqlite.prepare(sql).get(...params) ?? null,
    getAllAsync: async (sql, ...params) => sqlite.prepare(sql).all(...params),
    withExclusiveTransactionAsync: async callback => {
      sqlite.exec('BEGIN');
      try { await callback(db); sqlite.exec('COMMIT'); }
      catch (error) { sqlite.exec('ROLLBACK'); throw error; }
    },
  };
  return { sqlite, db };
}

test('reserve freezes, handles zero, negative and large safe amounts', () => {
  assert.equal(reserveTarget(3000000, 'percentage', 2000), 600000);
  assert.equal(reserveTarget(2000000, 'percentage', 2000), 400000);
  assert.equal(reserveTarget(-200000, 'percentage', 2000), 0);
  assert.equal(reserveTarget(100, 'percentage', 1000), 10);
  assert.equal(reserveTarget(1, 'percentage', 2000), 0);
  assert.equal(reserveTarget(1, 'percentage', 10000), 1);
  assert.equal(reserveTarget(123, 'percentage', 0), 0);
  assert.equal(reserveTarget(123, 'fixed', 1000), 1000);
  assert.equal(reserveTarget(Number.MAX_SAFE_INTEGER, 'percentage', 10000), Number.MAX_SAFE_INTEGER);
  assert.throws(() => reserveTarget(100, 'percentage', 10001));
  assert.deepEqual(planAmounts(3000000, 600000), { freeToUseMinor: 2400000, reserveShortfallMinor: 0 });
  assert.deepEqual(planAmounts(600000, 600000), { freeToUseMinor: 0, reserveShortfallMinor: 0 });
  assert.deepEqual(planAmounts(400000, 600000), { freeToUseMinor: 0, reserveShortfallMinor: 200000 });
  assert.deepEqual(planAmounts(-200000, 600000), { freeToUseMinor: 0, reserveShortfallMinor: 800000 });
});

test('allocation percentages validate and remainder is assigned deterministically', () => {
  const parts = [{ name: 'A', percentageBasisPoints: 3300 },
    { name: 'B', percentageBasisPoints: 3300 }, { name: 'C', percentageBasisPoints: 3400 }];
  assert.deepEqual(allocationAmounts(100, parts).map(x => x.amountMinor), [33, 33, 34]);
  assert.deepEqual(allocationAmounts(2, parts).map(x => x.amountMinor), [1, 0, 1]);
  assert.deepEqual(allocationAmounts(0, parts).map(x => x.amountMinor), [0, 0, 0]);
  assert.equal(allocationAmounts(999999, parts).reduce((sum, item) => sum + item.amountMinor, 0), 999999);
  assert.deepEqual(validateAllocations([]), []);
  assert.throws(() => validateAllocations([{ name: 'A', percentageBasisPoints: 9900 }]));
  assert.throws(() => validateAllocations([{ name: 'A', percentageBasisPoints: 5000 },
    { name: 'a', percentageBasisPoints: 5000 }]));
});

test('civil month boundaries and inclusive pace rule', () => {
  const cases = [['2025-02-01', '2025-02-28', 28], ['2024-02-01', '2024-02-29', 29],
    ['2026-04-01', '2026-04-30', 30], ['2026-10-01', '2026-10-31', 31],
    ['2026-12-31', '2026-12-31', 1], ['2027-01-01', '2027-01-31', 31]];
  for (const [today, end, count] of cases) {
    assert.equal(monthPeriod(today).periodEnd, end);
    assert.equal(remainingDays(today, end), count);
  }
  assert.equal(remainingDays('2026-11-01', '2026-10-31'), 0);
  assert.equal(referencePace(24000, 20).dailyMinor, 1200);
  assert.deepEqual([referencePace(24000, 20).unit, referencePace(24000, 14).unit], ['week', 'day']);
  assert.equal(referencePace(24000, 20).displayMinor, 8400);
  assert.equal(referencePace(100, 3).dailyMinor, 33);
});

test('simulation has three exact outcomes and leaves input unchanged', () => {
  const input = { availableRealMinor: 30000, reserveTargetMinor: 6000, hypotheticalSpendMinor: 5000, remainingDays: 20 };
  const original = structuredClone(input);
  const a = simulateSpending(input);
  assert.equal(a.outcome, 'withinFlexible');
  assert.equal(a.freeToUseMinor, 19000);
  assert.equal(a.resultingPace.displayMinor, 6650);
  const b = simulateSpending({ ...input, hypotheticalSpendMinor: 27000 });
  assert.equal(b.outcome, 'usesReserve');
  assert.equal(b.reserveShortfallMinor, 3000);
  assert.equal(b.freeToUseMinor, 0);
  const c = simulateSpending({ ...input, hypotheticalSpendMinor: 32000 });
  assert.equal(c.outcome, 'exceedsAvailable');
  assert.equal(c.excessAvailableMinor, 2000);
  assert.equal(simulateSpending({ ...input, hypotheticalSpendMinor: 24000 }).outcome, 'withinFlexible');
  assert.equal(simulateSpending({ ...input, hypotheticalSpendMinor: 30000 }).outcome, 'usesReserve');
  assert.equal(simulateSpending({ ...input, availableRealMinor: -1000 }).outcome, 'exceedsAvailable');
  assert.throws(() => simulateSpending({ ...input, hypotheticalSpendMinor: 0 }));
  assert.deepEqual(input, original);
});

test('v3 upgrade preserves finance, engagement and personalization; plan persists, edits and expires', async () => {
  const { sqlite, db } = fixture();
  try {
    await initialMigration.up(db);
    await engagementMigration.up(db);
    await personalizationMigration.up(db);
    sqlite.exec(`INSERT INTO financial_profile VALUES (1,'UYU',30000,'2026-10-08','stamp','stamp');
      INSERT INTO payments VALUES (1,'expense','Rent',1000,'2026-10-10','pending',NULL,'stamp','stamp');
      UPDATE engagement_progress SET stage=2;
      UPDATE personalization_preferences SET theme_id='noche';
      PRAGMA user_version=3;`);
    const before = ['financial_profile', 'payments', 'engagement_progress', 'personalization_preferences']
      .map(table => sqlite.prepare(`SELECT * FROM ${table}`).all());
    await runMigrations(db);
    assert.equal(sqlite.prepare('PRAGMA user_version').get().user_version, 10);
    assert.equal(await getCurrentPlan(db, '2026-10-08'), null);
    await saveCurrentPlan(db, { mode: 'percentage', value: 2000, availableRealMinor: 29000,
      allocations: [{ name: 'A', percentageBasisPoints: 5000 }, { name: 'B', percentageBasisPoints: 5000 }] }, '2026-10-08');
    const created = await getCurrentPlan(db, '2026-10-08');
    assert.equal(created.plan.reserveTargetMinor, 5800);
    assert.equal(created.plan.createdFromAvailableMinor, 29000);
    assert.equal(created.allocations.length, 2);
    await saveCurrentPlan(db, { mode: 'percentage', value: 2000, availableRealMinor: 20000,
      reserveChanged: false, allocations: [{ name: 'Other', percentageBasisPoints: 10000 }] }, '2026-10-09');
    const unchanged = await getCurrentPlan(db, '2026-10-09');
    assert.equal(unchanged.plan.reserveTargetMinor, 5800);
    assert.equal(unchanged.plan.createdFromAvailableMinor, 29000);
    assert.deepEqual(unchanged.allocations.map(item => item.name), ['Other']);
    await saveCurrentPlan(db, { mode: 'fixed', value: 7000, availableRealMinor: 20000,
      reserveChanged: true, allocations: [] }, '2026-10-09');
    assert.equal((await getCurrentPlan(db, '2026-10-09')).plan.reserveTargetMinor, 7000);
    assert.equal((await getCurrentPlan(db, '2026-10-09')).plan.createdFromAvailableMinor, 29000);
    assert.equal(await getCurrentPlan(db, '2026-11-01'), null);
    assert.deepEqual(['financial_profile', 'payments', 'engagement_progress', 'personalization_preferences']
      .map(table => sqlite.prepare(`SELECT * FROM ${table}`).all()), before);
    await deleteCurrentPlan(db, '2026-10-09');
    assert.equal(await getCurrentPlan(db, '2026-10-09'), null);
    assert.equal(sqlite.prepare('SELECT COUNT(*) AS n FROM spending_allocations').get().n, 0);
  } finally { sqlite.close(); }
});

test('fresh database reaches v10 with no default plan and failed allocation replacement rolls back', async () => {
  const { sqlite, db } = fixture();
  try {
    await runMigrations(db);
    assert.equal(sqlite.prepare('PRAGMA user_version').get().user_version, 10);
    assert.equal(sqlite.prepare('SELECT COUNT(*) AS n FROM spending_plans').get().n, 0);
    await saveCurrentPlan(db, { mode: 'fixed', value: 1000, availableRealMinor: 0,
      allocations: [{ name: 'Original', percentageBasisPoints: 10000 }] }, '2026-10-08');
    const before = await getCurrentPlan(db, '2026-10-08');
    await assert.rejects(saveCurrentPlan(db, { mode: 'fixed', value: 2000, availableRealMinor: 0,
      allocations: [{ name: 'x', percentageBasisPoints: 9900 }] }, '2026-10-08'));
    assert.deepEqual(await getCurrentPlan(db, '2026-10-08'), before);
    sqlite.exec(`CREATE TRIGGER fail_second_allocation BEFORE INSERT ON spending_allocations
      WHEN NEW.name = 'Second' BEGIN SELECT RAISE(ABORT, 'test failure'); END;`);
    await assert.rejects(saveCurrentPlan(db, { mode: 'fixed', value: 2000, availableRealMinor: 0,
      allocations: [{ name: 'First', percentageBasisPoints: 5000 },
        { name: 'Second', percentageBasisPoints: 5000 }] }, '2026-10-08'));
    assert.deepEqual(await getCurrentPlan(db, '2026-10-08'), before);
  } finally { sqlite.close(); }
});
