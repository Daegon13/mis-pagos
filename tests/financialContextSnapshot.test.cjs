const { test } = require('node:test');
const assert = require('node:assert/strict');
const { load } = require('./helpers/load.cjs');

const { buildFinancialContextSnapshot: build } = load('src/features/financial-context/financialContextSnapshot.ts');
const { calculateHome } = load('src/features/home/homeSummary.ts');
const { planAmounts, referencePace, remainingDays, simulateSpending } = load('src/domain/spendingPlan.ts');
const now = new Date(2026, 9, 12, 23, 59);
const profile = balance => ({ currencyCode: 'UYU', availableBalanceMinor: balance });
const payment = (id, type, amountMinor, dueDate, status = 'pending') => ({
  id, type, amountMinor, dueDate, status, title: `PRIVATE TITLE ${id}`, notes: 'PRIVATE NOTE',
  createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z',
});
const plan = { periodStart: '2026-10-01', periodEnd: '2026-10-31', reserveTargetMinor: 6000 };

test('snapshot matches Home across balance, due-date, status and overdue boundaries', () => {
  const cases = [
    [0, []], [-100, []], [10000, [payment(1, 'expense', 300, '2026-10-11')]],
    [10000, [payment(1, 'income', 500, '2026-10-11')]],
    [10000, [payment(1, 'expense', 300, '2026-11-11'), payment(2, 'income', 500, '2026-11-11')]],
    [10000, [payment(1, 'expense', 300, '2026-11-12'), payment(2, 'income', 500, '2026-11-12')]],
    [10000, [payment(1, 'expense', 300, '2026-10-12', 'completed'),
      payment(2, 'income', 500, '2026-10-12', 'cancelled')]],
    [100, [payment(1, 'expense', 300, '2026-10-10'), payment(2, 'expense', 200, '2026-10-13'),
      payment(3, 'income', 700, '2026-10-13'), payment(4, 'income', 900, '2026-10-11')]],
  ];
  for (const [balance, payments] of cases) {
    const before = structuredClone(payments);
    const snapshot = build({ profile: profile(balance), payments, now });
    const home = calculateHome(balance, payments, now);
    assert.deepEqual(payments, before);
    assert.equal(snapshot.version, 1);
    assert.equal(snapshot.asOfDate, '2026-10-12');
    assert.equal(snapshot.horizonEndDate, '2026-11-11');
    assert.equal(snapshot.currentBalanceMinor, home.balanceMinor);
    assert.equal(snapshot.committedExpenses.amountMinor, home.committedMinor);
    assert.equal(snapshot.expectedIncome.amountMinor, home.incomeMinor);
    assert.equal(snapshot.availableRealMinor, home.availableMinor);
    assert.equal(snapshot.projectionMinor, home.projectionMinor);
    assert.equal(snapshot.plan, null);
    assert.equal(snapshot.simulation, null);
    assert.doesNotMatch(JSON.stringify(snapshot), /PRIVATE TITLE|PRIVATE NOTE|createdAt|updatedAt/);
    assert.deepEqual(build({ profile: profile(balance), payments, now }), snapshot);
  }
});

test('overdue expense remains committed, overdue income is excluded, and counts include all rows', () => {
  const payments = [payment(1, 'expense', 300, '2026-10-11'),
    payment(2, 'expense', 200, '2026-10-10'), payment(3, 'income', 900, '2026-10-11'),
    payment(4, 'income', 700, '2026-10-13'), payment(5, 'expense', 400, '2026-10-14'),
    payment(6, 'expense', 500, '2026-11-12')];
  const snapshot = build({ profile: profile(100), payments, now });
  assert.deepEqual(snapshot.committedExpenses, {
    amountMinor: 900, count: 3, overdueCount: 2, oldestOverdueDate: '2026-10-10',
  });
  assert.deepEqual(snapshot.expectedIncome, { amountMinor: 700, count: 1 });
  assert.equal(snapshot.overdueIncomeCount, 1);
  assert.equal(snapshot.upcomingCount, 2);
  assert.equal(snapshot.nextUpcomingDate, '2026-10-13');
  assert.equal(snapshot.availableRealMinor, -800);
  assert.equal(snapshot.projectionMinor, -100);
});

test('active reserve, pace and explicit simulation reuse plan domain results', () => {
  const payments = [payment(1, 'expense', 20000, '2026-10-12')];
  for (const spend of [24000, 27000, 32000]) {
    const snapshot = build({ profile: profile(50000), payments, now, plan, hypotheticalSpendMinor: spend });
    const days = remainingDays('2026-10-12', plan.periodEnd);
    const amounts = planAmounts(30000, 6000);
    assert.deepEqual(snapshot.plan, { periodEnd: plan.periodEnd, reserveTargetMinor: 6000,
      ...amounts, remainingDays: days, referencePace: referencePace(amounts.freeToUseMinor, days) });
    assert.deepEqual(snapshot.simulation, { hypotheticalSpendMinor: spend,
      result: simulateSpending({ availableRealMinor: 30000, reserveTargetMinor: 6000,
        hypotheticalSpendMinor: spend, remainingDays: days }) });
  }
  const shortfall = build({ profile: profile(4000), payments: [], now, plan });
  assert.deepEqual([shortfall.plan.freeToUseMinor, shortfall.plan.reserveShortfallMinor], [0, 2000]);
  assert.equal(shortfall.simulation, null);
});

test('stale plan is omitted, simulation requires an active plan, and invalid amounts are rejected', () => {
  const stale = { ...plan, periodStart: '2026-09-01', periodEnd: '2026-09-30' };
  assert.equal(build({ profile: profile(100), payments: [], now, plan: stale }).plan, null);
  assert.throws(() => build({ profile: profile(100), payments: [], now, plan: stale,
    hypotheticalSpendMinor: 1 }), /current spending plan/);
  assert.throws(() => build({ profile: profile(100), payments: [], now, plan,
    hypotheticalSpendMinor: 0 }), /Invalid hypothetical amount/);
});
