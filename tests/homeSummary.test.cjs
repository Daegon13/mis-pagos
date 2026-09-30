const { test } = require('node:test');
const assert = require('node:assert/strict');
const { load } = require('./helpers/load.cjs');
const { calculateHome } = load('src/features/home/homeSummary.ts');
const now = new Date(2026, 8, 26, 23, 59);
const payment = (id, type, amountMinor, dueDate = '2026-09-26', status = 'pending') =>
  ({ id, type, amountMinor, dueDate, status, title: `Movement ${id}` });

test('empty, income only, expense only, mixed and negative balance', () => {
  for (const [payments, available, income, committed, projection] of [
    [[], 10000, 0, 0, 10000],
    [[payment(1, 'income', 5000)], 10000, 5000, 0, 15000],
    [[payment(1, 'expense', 3000)], 7000, 0, 3000, 7000],
    [[payment(1, 'expense', 15000), payment(2, 'income', 8000)], -5000, 8000, 15000, 3000],
  ]) {
    const s = calculateHome(10000, payments, now);
    assert.deepEqual([s.availableMinor, s.incomeMinor, s.committedMinor, s.projectionMinor],
      [available, income, committed, projection]);
  }
  assert.equal(calculateHome(-100, [], now).availableMinor, -100);
});

test('inclusive local horizon retains overdue expenses and excludes day 31, completed and cancelled', () => {
  const s = calculateHome(10000, [
    payment(1, 'expense', 100, '2026-09-26'),
    payment(2, 'expense', 200, '2026-10-26'),
    payment(3, 'expense', 400, '2026-09-25'),
    payment(4, 'income', 800, '2026-10-27'),
    payment(5, 'expense', 1600, '2026-09-26', 'completed'),
    payment(6, 'income', 3200, '2026-09-26', 'cancelled'),
  ], now);
  assert.equal(s.committedMinor, 700);
  assert.equal(s.attentionCount, 1);
  assert.equal(s.incomeMinor, 0);
  assert.deepEqual(s.upcoming.map(p => p.id), [1, 2]);
});

test('nearest five sorted by civil date and id; totals include all pending', () => {
  const payments = Array.from({ length: 8 }, (_, i) => payment(8 - i, 'expense', 101, '2026-09-27'));
  const s = calculateHome(10000, payments, now);
  assert.deepEqual(s.upcoming.map(p => p.id), [1, 2, 3, 4, 5]);
  assert.equal(s.committedMinor, 808);
  assert.equal(payments[0].id, 8);
});

test('relative timing uses calendar days, including leap day and DST', () => {
  for (const [date, due, timing] of [
    [now, '2026-09-26', 'hoy'], [now, '2026-09-27', 'mañana'],
    [now, '2026-10-26', 'en 30 días'],
    [new Date(2028, 1, 28), '2028-03-01', 'en 2 días'],
    [new Date(2026, 2, 7), '2026-03-09', 'en 2 días'],
    [new Date(2026, 11, 31), '2027-01-01', 'mañana'],
  ]) {
    for (const [type, verb] of [['income', 'entra'], ['expense', 'vence']]) {
      assert.equal(calculateHome(0, [payment(1, type, 1, due)], date).upcoming[0].timing, `${verb} ${timing}`);
    }
  }
});

test('unsafe aggregates fail rather than display rounded financial totals', () => {
  assert.throws(() => calculateHome(0, [payment(1, 'expense', Number.MAX_SAFE_INTEGER), payment(2, 'expense', 1)], now));
});
