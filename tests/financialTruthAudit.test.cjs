const { test } = require('node:test');
const assert = require('node:assert/strict');
const { DatabaseSync } = require('node:sqlite');
const { mkdtempSync, rmdirSync, unlinkSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { join } = require('node:path');
const { load } = require('./helpers/load.cjs');

const { calculateHome } = load('src/features/home/homeSummary.ts');
const { planAmounts, allocationAmounts, referencePace, remainingDays,
  simulateSpending } = load('src/domain/spendingPlan.ts');
const { runMigrations } = load('src/data/db/migrations/index.ts');
const { saveFinancialProfile, getFinancialProfile } = load('src/data/repositories/financialProfileRepository.ts');
const { createPayment, listPayments } = load('src/data/repositories/paymentRepository.ts');
const { saveCurrentPlan, getCurrentPlan } = load('src/data/repositories/spendingPlanRepository.ts');
const { unlockAchievement, listAchievementUnlocks } = load('src/data/repositories/achievementRepository.ts');
const { setSlotAssetOverride, listSlotOverrides } = load('src/data/repositories/spaceCustomizationRepository.ts');

const today = new Date(2026, 9, 12, 23, 59);
const payment = (id, type, amountMinor, dueDate, status = 'pending') =>
  ({ id, type, amountMinor, dueDate, status, title: `Movement ${id}` });

test('Home, plan and simulation use the same availability across timing and status boundaries', () => {
  const cases = [
    ['positive empty', 10000, [], 0, 0, 10000],
    ['zero empty', 0, [], 0, 0, 0],
    ['negative empty', -100, [], 0, 0, -100],
    ['expense today', 10000, [payment(1, 'expense', 300, '2026-10-12')], 300, 0, 9700],
    ['expense tomorrow', 10000, [payment(1, 'expense', 300, '2026-10-13')], 300, 0, 9700],
    ['expense final day', 10000, [payment(1, 'expense', 300, '2026-11-11')], 300, 0, 9700],
    ['expense outside', 10000, [payment(1, 'expense', 300, '2026-11-12')], 0, 0, 10000],
    ['overdue expense', 10000, [payment(1, 'expense', 300, '2026-10-11')], 300, 0, 9700],
    ['income today', 10000, [payment(1, 'income', 500, '2026-10-12')], 0, 500, 10000],
    ['income final day', 10000, [payment(1, 'income', 500, '2026-11-11')], 0, 500, 10000],
    ['overdue income', 10000, [payment(1, 'income', 500, '2026-10-11')], 0, 0, 10000],
    ['inactive', 10000, [payment(1, 'expense', 300, '2026-10-12', 'completed'),
      payment(2, 'income', 500, '2026-10-12', 'cancelled')], 0, 0, 10000],
    ['mixed shortfall', 100, [payment(1, 'expense', 300, '2026-10-11'),
      payment(2, 'expense', 200, '2026-10-13'), payment(3, 'income', 700, '2026-11-11'),
      payment(4, 'income', 900, '2026-10-11')], 500, 700, -400],
  ];
  for (const [name, balance, payments, committed, income, available] of cases) {
    const home = calculateHome(balance, payments, today);
    assert.equal(home.committedMinor, committed, name);
    assert.equal(home.incomeMinor, income, name);
    assert.equal(home.availableMinor, available, name);
    assert.equal(home.projectionMinor, available + income, name);
    const plan = planAmounts(home.availableMinor, 0);
    assert.equal(plan.freeToUseMinor, Math.max(0, available), name);
    assert.equal(plan.reserveShortfallMinor, Math.max(0, -available), name);
    if (available > 0) {
      const simulated = simulateSpending({ availableRealMinor: home.availableMinor,
        reserveTargetMinor: 0, hypotheticalSpendMinor: 1, remainingDays: 20 });
      assert.equal(simulated.resultingAvailableRealMinor, available - 1, name);
      assert.equal(simulated.freeToUseMinor, planAmounts(available - 1, 0).freeToUseMinor, name);
    }
  }
});

test('reserve, allocations, pace and all simulation outcomes remain tied to Home availability', () => {
  const home = calculateHome(50000, [payment(1, 'expense', 20000, '2026-10-12'),
    payment(2, 'income', 5000, '2026-10-13')], today);
  assert.deepEqual([home.availableMinor, home.projectionMinor], [30000, 35000]);
  const split = [{ name: 'A', percentageBasisPoints: 3333 },
    { name: 'B', percentageBasisPoints: 3333 }, { name: 'C', percentageBasisPoints: 3334 }];
  for (const [reserve, free, shortfall] of [[6000, 24000, 0], [30000, 0, 0], [32000, 0, 2000]]) {
    const amounts = planAmounts(home.availableMinor, reserve);
    assert.deepEqual(amounts, { freeToUseMinor: free, reserveShortfallMinor: shortfall });
    assert.equal(allocationAmounts(free, split).reduce((sum, item) => sum + item.amountMinor, 0), free);
  }
  assert.equal(referencePace(24000, remainingDays('2026-10-01', '2026-10-31')).unit, 'week');
  assert.equal(referencePace(24000, remainingDays('2026-10-31', '2026-10-31')).unit, 'day');
  for (const [spend, outcome, resulting, free, shortfall] of [
    [24000, 'withinFlexible', 6000, 0, 0],
    [27000, 'usesReserve', 3000, 0, 3000],
    [32000, 'exceedsAvailable', -2000, 0, 8000],
  ]) {
    const simulation = simulateSpending({ availableRealMinor: home.availableMinor,
      reserveTargetMinor: 6000, hypotheticalSpendMinor: spend, remainingDays: 20 });
    assert.deepEqual([simulation.outcome, simulation.resultingAvailableRealMinor,
      simulation.freeToUseMinor, simulation.reserveShortfallMinor],
    [outcome, resulting, free, shortfall]);
  }
});

test('schema v11 persists representative state across reopen and enforces singleton, uniqueness and FK constraints', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'mis-pagos-audit-'));
  const filename = join(directory, 'audit.db');
  const open = () => {
    const sqlite = new DatabaseSync(filename);
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
        sqlite.exec('BEGIN IMMEDIATE');
        try { await callback(db); sqlite.exec('COMMIT'); }
        catch (error) { sqlite.exec('ROLLBACK'); throw error; }
      },
    };
    return { sqlite, db };
  };
  let connection;
  try {
    connection = open();
    await runMigrations(connection.db);
    await saveFinancialProfile(connection.db, { currencyCode: 'UYU', availableBalanceMinor: 30000,
      balanceDate: '2026-10-12' });
    await createPayment(connection.db, { type: 'expense', title: 'Rent', amountMinor: 1000,
      dueDate: '2026-10-13', notes: '' });
    await saveCurrentPlan(connection.db, { mode: 'fixed', value: 5000,
      availableRealMinor: 29000, allocations: [{ name: 'Needs', percentageBasisPoints: 10000 }] }, '2026-10-12');
    assert.equal(await unlockAchievement(connection.db, 'FIRST_RESERVE'), true);
    assert.equal(await unlockAchievement(connection.db, 'FIRST_RESERVE'), false);
    await setSlotAssetOverride(connection.db, 'deskCenter', 'monitor');
    await setSlotAssetOverride(connection.db, 'deskCenter', 'monitor');
    assert.throws(() => connection.sqlite.exec("INSERT INTO financial_profile VALUES (2,'UYU',0,'2026-10-12','stamp','stamp')"));
    assert.throws(() => connection.sqlite.exec("INSERT INTO spending_allocations (spending_plan_id,name,percentage_basis_points,sort_order,created_at,updated_at) VALUES (999,'Bad',10000,0,'stamp','stamp')"));
    connection.sqlite.close();
    connection = open();
    await runMigrations(connection.db);
    assert.equal(connection.sqlite.prepare('PRAGMA user_version').get().user_version, 11);
    assert.equal(connection.sqlite.prepare('PRAGMA integrity_check').get().integrity_check, 'ok');
    assert.deepEqual(connection.sqlite.prepare('PRAGMA foreign_key_check').all(), []);
    assert.equal((await getFinancialProfile(connection.db)).availableBalanceMinor, 30000);
    assert.equal((await listPayments(connection.db)).length, 1);
    assert.equal((await getCurrentPlan(connection.db, '2026-10-12')).plan.reserveTargetMinor, 5000);
    assert.equal((await listAchievementUnlocks(connection.db)).length, 1);
    assert.deepEqual((await listSlotOverrides(connection.db)).map(row => row.slotId), ['deskCenter']);
  } finally {
    if (connection) connection.sqlite.close();
    unlinkSync(filename);
    rmdirSync(directory);
  }
});
