const { test } = require('node:test');
const assert = require('node:assert/strict');
const { DatabaseSync } = require('node:sqlite');
const { load } = require('./helpers/load.cjs');

const { runMigrations } = load('src/data/db/migrations/index.ts');
const { getNotificationPreferences, setNotificationEnabled, setNotificationCategory, setNotificationHours } =
  load('src/data/repositories/notificationRepository.ts');
const { planNotifications } = load('src/features/notifications/notificationPlan.ts');

function fixture() {
  const sqlite = new DatabaseSync(':memory:');
  const db = {
    execAsync: async sql => sqlite.exec(sql),
    runAsync: async (sql, ...args) => {
      const result = sqlite.prepare(sql).run(...args);
      return { changes: result.changes, lastInsertRowId: result.lastInsertRowid };
    },
    getFirstAsync: async (sql, ...args) => sqlite.prepare(sql).get(...args) ?? null,
    getAllAsync: async (sql, ...args) => sqlite.prepare(sql).all(...args),
    withExclusiveTransactionAsync: async callback => {
      sqlite.exec('BEGIN');
      try { await callback(db); sqlite.exec('COMMIT'); }
      catch (error) { sqlite.exec('ROLLBACK'); throw error; }
    },
  };
  return { sqlite, db };
}

test('notification preferences start off, persist categories and reject invalid hours', async () => {
  const { sqlite, db } = fixture();
  try {
    await runMigrations(db);
    let prefs = await getNotificationPreferences(db);
    assert.equal(prefs.enabled, false);
    assert.equal(prefs.startHour, 9);
    await setNotificationEnabled(db, true);
    await setNotificationCategory(db, 'overdue', false);
    await setNotificationHours(db, 11, 21);
    await assert.rejects(setNotificationHours(db, 23, 7), /válido/);
    prefs = await getNotificationPreferences(db);
    assert.equal(prefs.enabled, true);
    assert.equal(prefs.categories.overdue, false);
    assert.equal(prefs.endHour, 21);
  } finally { sqlite.close(); }
});

test('one prioritized notification per day, no completed or disabled category, within window', () => {
  const now = new Date(2026, 9, 13, 8);
  const prefs = { enabled: true, startHour: 9, endHour: 20,
    categories: { dueSoon: true, overdue: true, income: true, planReview: true,
      discoveries: true, reengagement: true } };
  const payment = (id, type, dueDate, status = 'pending') =>
    ({ id, type, dueDate, status, title: 'Example', amountMinor: 100,
      notes: null, createdAt: new Date(2026, 9, 10).toISOString(), updatedAt: '' });
  const inputs = { now, preferences: prefs, planEnd: '2026-10-31', discoveries: [], payments: [
    payment(1, 'expense', '2026-10-11'), payment(2, 'expense', '2026-10-14'),
    payment(3, 'income', '2026-10-13'), payment(4, 'expense', '2026-10-14', 'completed'),
  ] };
  const items = planNotifications(inputs);
  assert.equal(items.length, new Set(items.map(item => item.day)).size);
  assert.equal(items.find(item => item.day === '2026-10-14').category, 'overdue');
  assert.ok(items.every(item => item.at.getHours() >= prefs.startHour && item.at.getHours() < prefs.endHour));
  assert.ok(items.every(item => !item.body.includes('Example')));
  assert.ok(planNotifications({ ...inputs, preferences: { ...prefs, enabled: false } }).length === 0);
  assert.ok(planNotifications({ ...inputs, preferences: { ...prefs,
    categories: { ...prefs.categories, overdue: false } } }).every(item => item.category !== 'overdue'));
  const late = planNotifications({ ...inputs, now: new Date(2026, 9, 13, 23, 45) });
  assert.ok(late.every(item => item.day !== '2026-10-13'));
});
