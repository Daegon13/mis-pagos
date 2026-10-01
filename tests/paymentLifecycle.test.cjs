const { test } = require('node:test');
const assert = require('node:assert/strict');
const { DatabaseSync } = require('node:sqlite');
const { load } = require('./helpers/load.cjs');
const lifecycle = load('src/data/repositories/paymentLifecycle.ts');
const repository = load('src/data/repositories/paymentRepository.ts');
const profiles = load('src/data/repositories/financialProfileRepository.ts');
const { initialMigration } = load('src/data/db/migrations/001_initial.ts');
const { engagementMigration } = load('src/data/db/migrations/002_engagement.ts');
const { calculateHome } = load('src/features/home/homeSummary.ts');
const { groupMovements, localCivilDate, paymentTiming, isCivilDate } = load('src/domain/paymentTiming.ts');
const { parseBalanceMinor, minorToInput } = load('src/features/financial-profile/money.ts');
const now = new Date(2026, 8, 29, 23, 59);
const payment = (id, type, dueDate, status = 'pending', updatedAt = '2026-09-29T10:00:00Z') =>
  ({ id, type, dueDate, status, updatedAt, amountMinor: 100, title: `Movement ${id}` });

async function fixture() {
  const sqlite = new DatabaseSync(':memory:');
  let transaction = false;
  const tx = {
    execAsync: async sql => sqlite.exec(sql),
    runAsync: async (sql, ...params) => {
      const result = sqlite.prepare(sql).run(...params);
      return { changes: result.changes, lastInsertRowId: result.lastInsertRowid };
    },
    getFirstAsync: async (sql, ...params) => sqlite.prepare(sql).get(...params) ?? null,
    getAllAsync: async (sql, ...params) => sqlite.prepare(sql).all(...params),
  };
  // Reject using the outer connection from an exclusive transaction callback.
  const db = Object.fromEntries(Object.entries(tx).map(([name, fn]) => [name, async (...args) => {
    assert.equal(transaction, false, 'must use transaction connection'); return fn(...args);
  }]));
  db.withExclusiveTransactionAsync = async callback => {
    assert.equal(transaction, false); transaction = true; sqlite.exec('BEGIN IMMEDIATE');
    try { await callback(tx); sqlite.exec('COMMIT'); }
    catch (error) { sqlite.exec('ROLLBACK'); throw error; }
    finally { transaction = false; }
  };
  await initialMigration.up(db); await engagementMigration.up(db);
  await profiles.saveFinancialProfile(db, { currencyCode: 'UYU', availableBalanceMinor: 30000, balanceDate: '2026-09-20' });
  const add = (type = 'expense', overrides = {}) => repository.createPayment(db,
    { type, title: 'Alquiler', amountMinor: 10000, dueDate: '2026-09-28', ...overrides });
  return { db, sqlite, add, close: () => sqlite.close() };
}

test('overdue expense stays committed, overdue income never inflates projection, future boundaries and inactive statuses', () => {
  const payments = [payment(1, 'expense', '2020-01-01'), payment(2, 'income', '2026-09-28'),
    payment(3, 'expense', '2026-09-29'), payment(4, 'income', '2026-10-29'),
    payment(5, 'expense', '2026-10-30'), payment(6, 'income', '2026-10-30'),
    payment(7, 'expense', '2020-01-01', 'completed'), payment(8, 'expense', '2026-09-29', 'cancelled')];
  const summary = calculateHome(1000, payments, now);
  assert.deepEqual([summary.committedMinor, summary.availableMinor, summary.incomeMinor, summary.projectionMinor, summary.attentionCount],
    [200, 800, 100, 900, 2]);
  assert.deepEqual(summary.upcoming.map(p => p.id), [3, 4]);
});

test('groups chronological pending and recently updated history without mutating input', () => {
  const payments = [payment(9, 'income', '2026-10-30'), payment(3, 'income', '2026-09-29'),
    payment(2, 'expense', '2026-09-29'), payment(1, 'expense', '2026-09-25'),
    payment(5, 'income', '2026-09-28'), payment(6, 'expense', '2026-10-29'),
    payment(7, 'expense', '2020-01-01', 'completed'), payment(8, 'income', '2020-01-01', 'completed', '2026-09-30T00:00:00Z'),
    payment(10, 'income', '2026-09-29', 'cancelled')];
  const groups = groupMovements(payments, now);
  assert.deepEqual(Object.fromEntries(Object.entries(groups).map(([key, items]) => [key, items.map(p => p.id)])),
    { attention: [1, 5], next: [2, 3, 6], later: [9], completed: [8, 7], cancelled: [10] });
  assert.equal(payments[0].id, 9);
  assert.equal(paymentTiming(payments[3], '2026-09-29'), 'Venció hace 4 días');
  assert.equal(paymentTiming(payments[4], '2026-09-29'), 'Debía entrar ayer');
});

test('civil dates remain local near midnight, across DST, leap day and year end', () => {
  const previous = process.env.TZ;
  try {
    process.env.TZ = 'America/Montevideo';
    assert.equal(localCivilDate(new Date('2026-09-30T01:00:00Z')), '2026-09-29');
    const p = payment(1, 'expense', '2026-09-29');
    assert.equal(groupMovements([p], new Date('2026-09-30T01:00:00Z')).next.length, 1);
    assert.equal(groupMovements([p], new Date('2026-09-30T03:00:00Z')).attention.length, 1);
    process.env.TZ = 'America/New_York';
    assert.equal(paymentTiming(payment(1, 'income', '2026-03-07'), '2026-03-09'), 'Debía entrar hace 2 días');
    assert.equal(paymentTiming(payment(1, 'expense', '2028-02-28'), '2028-03-01'), 'Venció hace 2 días');
    assert.equal(paymentTiming(payment(1, 'expense', '2026-12-31'), '2027-01-01'), 'Venció ayer');
    assert.equal(isCivilDate('2026-02-29'), false); assert.equal(isCivilDate('2028-02-29'), true);
  } finally { if (previous === undefined) delete process.env.TZ; else process.env.TZ = previous; }
});

for (const type of ['expense', 'income']) for (const adjust of [false, true]) {
  test(`${type} completion adjust=${adjust}: balance, date, status, no duplicate adjustment`, async () => {
    const f = await fixture();
    try {
      const p = await f.add(type);
      const result = await lifecycle.completePayment(f.db, p.id, adjust, now);
      const snapshot = await lifecycle.readFinancialSnapshot(f.db);
      const expected = 30000 + (adjust ? (type === 'expense' ? -10000 : 10000) : 0);
      assert.equal(result.balanceMinor, expected);
      assert.equal(snapshot.profile.availableBalanceMinor, expected);
      assert.equal(snapshot.profile.balanceDate, adjust ? '2026-09-29' : '2026-09-20');
      assert.equal(snapshot.payments[0].status, 'completed');
      assert.equal(calculateHome(expected, snapshot.payments, now).committedMinor, 0);
      await assert.rejects(lifecycle.completePayment(f.db, p.id, true, now));
      await assert.rejects(lifecycle.cancelPendingPayment(f.db, p.id));
      await assert.rejects(lifecycle.editPendingPayment(f.db, p.id, { ...p, title: 'Cannot edit' }));
      assert.equal((await profiles.getFinancialProfile(f.db)).availableBalanceMinor, expected);
    } finally { f.close(); }
  });
}

for (const type of ['expense', 'income']) for (const failedTable of ['payments', 'financial_profile']) {
  test(`${type}: failure writing ${failedTable} rolls back the entire reconciliation`, async () => {
    const f = await fixture();
    try {
      const p = await f.add(type);
      const before = await lifecycle.readFinancialSnapshot(f.db);
      f.sqlite.exec(`CREATE TRIGGER fail_write BEFORE UPDATE ON ${failedTable} BEGIN SELECT RAISE(ABORT, 'forced failure'); END`);
      await assert.rejects(lifecycle.completePayment(f.db, p.id, true, now));
      assert.deepEqual(await lifecycle.readFinancialSnapshot(f.db), before);
      f.sqlite.exec('DROP TRIGGER fail_write');
      await lifecycle.completePayment(f.db, p.id, true, now); // retry succeeds
    } finally { f.close(); }
  });
}

test('edit all pending fields, cancel retains history, hard delete every status never adjusts balance or space', async () => {
  const f = await fixture();
  try {
    f.sqlite.exec('UPDATE engagement_progress SET stage=2');
    const p = await f.add();
    await lifecycle.editPendingPayment(f.db, p.id, { type: 'income', title: '  Sueldo  ', amountMinor: 12345, dueDate: '2026-10-01', notes: '  nota  ' });
    const edited = await repository.getPaymentById(f.db, p.id);
    assert.deepEqual([edited.type, edited.title, edited.amountMinor, edited.dueDate, edited.notes], ['income', 'Sueldo', 12345, '2026-10-01', 'nota']);
    assert.equal(calculateHome(30000, [edited], now).projectionMinor, 42345);
    await lifecycle.cancelPendingPayment(f.db, p.id);
    assert.equal((await repository.getPaymentById(f.db, p.id)).status, 'cancelled');
    const snapshot = await lifecycle.readFinancialSnapshot(f.db);
    assert.equal(calculateHome(30000, snapshot.payments, now).projectionMinor, 30000);
    await assert.rejects(lifecycle.editPendingPayment(f.db, p.id, edited));
    await assert.rejects(lifecycle.completePayment(f.db, p.id, true));
    await assert.rejects(lifecycle.cancelPendingPayment(f.db, p.id));
    const pending = await f.add(); const completed = await f.add();
    await lifecycle.completePayment(f.db, completed.id, false);
    for (const id of [p.id, pending.id, completed.id]) {
      assert.equal(await repository.deletePayment(f.db, id), true);
      assert.equal(await repository.getPaymentById(f.db, id), null);
    }
    assert.equal((await profiles.getFinancialProfile(f.db)).availableBalanceMinor, 30000);
    assert.equal(f.sqlite.prepare('SELECT stage FROM engagement_progress').get().stage, 2);
  } finally { f.close(); }
});

test('manual balance uses exact parser, allows zero/negative and refreshes calculations without changing movements', async () => {
  const f = await fixture();
  try {
    const p = await f.add();
    for (const [value, amount] of [['0', 0], ['-0,01', -1], ['-100.50', -10050], ['123.45', 12345]]) {
      assert.equal(parseBalanceMinor(value), amount);
      assert.equal(parseBalanceMinor(minorToInput(amount)), amount);
      await lifecycle.updateCurrentBalance(f.db, parseBalanceMinor(value), now);
      const snapshot = await lifecycle.readFinancialSnapshot(f.db);
      assert.equal(snapshot.profile.availableBalanceMinor, amount);
      assert.equal(snapshot.profile.balanceDate, '2026-09-29');
      assert.deepEqual(snapshot.payments, [p]);
      assert.equal(calculateHome(amount, snapshot.payments, now).availableMinor, amount - p.amountMinor);
    }
    assert.equal(parseBalanceMinor('1.234,56'), 123456);
    assert.equal(parseBalanceMinor('1.001'), 100100);
    for (const value of ['1.23,456', '1.0001', 'abc', '', '9007199254740992']) assert.equal(parseBalanceMinor(value), null);
    await assert.rejects(lifecycle.updateCurrentBalance(f.db, 0.5));
    const huge = await f.add('income', { amountMinor: Number.MAX_SAFE_INTEGER });
    await assert.rejects(lifecycle.completePayment(f.db, huge.id, true));
    assert.equal((await repository.getPaymentById(f.db, huge.id)).status, 'pending');
  } finally { f.close(); }
});
