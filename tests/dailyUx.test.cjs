const { test } = require('node:test');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const { load } = require('./helpers/load.cjs');
const { calculateHome } = load('src/features/home/homeSummary.ts');
const { financialFeedback } = load('src/features/home/homeFeedback.ts');
const { parseBalanceMinor, minorToInput, formatBalance } = load('src/features/financial-profile/money.ts');
const now = new Date(2026, 8, 30, 23, 59);
const payment = (id, type = 'expense', dueDate = '2026-09-30', status = 'pending') =>
  ({ id, type, dueDate, status, amountMinor: 100, title: `Movement ${id}`, updatedAt: 'stamp' });

test('one contextual state: overdue wins over covered, empty and shortfall', () => {
  for (const type of ['expense', 'income']) {
    for (const balance of [1000, 0, -100]) {
      const feedback = financialFeedback(calculateHome(balance, [payment(1, type, '2026-09-29')], now));
      assert.equal(feedback.kind, 'overdue');
      assert.equal(feedback.title, 'Tenés movimientos por revisar');
      assert.doesNotMatch(feedback.description, /Todo bajo control/);
      assert.equal(feedback.description.includes('gastos vencidos'), type === 'expense');
    }
  }
});

test('context: insufficient balance, healthy, no commitments and irrelevant movements', () => {
  const insufficient = financialFeedback(calculateHome(50, [payment(1)], now));
  assert.equal(insufficient.kind, 'shortfall');
  assert.equal(insufficient.shortfallMinor, 50);
  assert.equal(financialFeedback(calculateHome(100, [payment(1)], now)).kind, 'covered');
  for (const payments of [[], [payment(1, 'income')], [payment(1, 'expense', '2026-12-01')],
    [payment(1, 'expense', '2026-09-29', 'cancelled')]]) {
    assert.equal(financialFeedback(calculateHome(100, payments, now)).kind, 'unplanned');
  }
});

test('overdue preview: two oldest, signed types and relative labels; no upcoming duplicates', () => {
  const result = calculateHome(1000, [payment(4), payment(3, 'expense', '2026-09-29'),
    payment(2, 'income', '2026-09-29'), payment(1, 'expense', '2026-09-28')], now);
  assert.equal(result.attentionCount, 3);
  assert.deepEqual(result.overdue.map(p => [p.id, p.type, p.timing]),
    [[1, 'expense', 'Venció hace 2 días'], [2, 'income', 'Debía entrar ayer']]);
  assert.deepEqual(result.upcoming.map(p => p.id), [4]);
  assert.equal(result.committedMinor, 300);
  assert.equal(result.incomeMinor, 0);
});

test('exact natural amounts, grouping, decimals, signs and safe-integer limits', () => {
  for (const [input, expected] of [['1500', 150000], ['1500,50', 150050], ['1500.50', 150050],
    ['1.500', 150000], ['1.500,50', 150050], ['1,500.50', 150050], ['1.234.567,89', 123456789],
    ['1,234,567.89', 123456789], ['  1500,5  ', 150050], ['0', 0], ['-0,01', -1],
    ['-1.500,50', -150050], ['90.071.992.547.409,91', Number.MAX_SAFE_INTEGER]]) {
    assert.equal(parseBalanceMinor(input), expected, input);
    assert.equal(parseBalanceMinor(minorToInput(expected)), expected);
    assert.ok(formatBalance(expected, 'UYU').length > 0);
  }
  for (const input of ['', 'abc', '1,500', '12.34.56', '1.23,45', '1,23.45', '1.500,500',
    '1.2345', '1..500', '1,', '.50', '1 500', '1e3', '--1', 'NaN', 'Infinity',
    '90.071.992.547.409,92']) assert.equal(parseBalanceMinor(input), null, input);
});

test('civil display and native picker roundtrip have no timezone day shift', () => {
  for (const zone of ['America/Montevideo', 'America/New_York', 'Pacific/Kiritimati', 'Pacific/Pago_Pago', 'UTC']) {
    execFileSync(process.execPath, ['-e', `
      const assert = require('node:assert/strict');
      const { load } = require('./tests/helpers/load.cjs');
      const d = load('src/features/payments/civilDate.ts');
      const { localCivilDate } = load('src/domain/paymentTiming.ts');
      assert.match(d.formatCivilDate('2026-09-30'), /^30 de sep?tiembre de 2026$/);
      for (const value of ['2026-09-30', '2026-03-08', '2026-11-01', '2028-02-29', '2026-12-31']) {
        assert.equal(localCivilDate(d.civilDateToLocalDate(value)), value);
        for (const platform of ['android', 'ios', 'web']) {
          assert.equal(d.pickerDateToCivilDate(d.civilDateToPickerDate(value, platform), platform), value);
        }
      }
      assert.equal(d.pickerDateToCivilDate(new Date('2026-09-30T00:00:00.000Z'), 'android'), '2026-09-30');
      assert.equal(d.pickerDateToCivilDate(new Date(2026, 8, 30, 23, 59), 'ios'), '2026-09-30');
      assert.throws(() => d.formatCivilDate('2026-02-30'));
    `], { env: { ...process.env, TZ: zone }, stdio: 'pipe' });
  }
});
