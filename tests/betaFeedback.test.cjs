const { test } = require('node:test');
const assert = require('node:assert/strict');
const { DatabaseSync } = require('node:sqlite');
const { load } = require('./helpers/load.cjs');

const { BETA_QUESTIONS, BETA_SECTIONS, FEATURED_QUESTION_IDS, betaProgress, betaEmailBody } =
  load('src/features/help/betaFeedbackQuestions.ts');
const { runMigrations } = load('src/data/db/migrations/index.ts');
const { loadBetaFeedback, saveBetaAnswer, saveBetaComment } =
  load('src/data/repositories/betaFeedbackRepository.ts');

test('beta registry has stable unique question and option IDs with twelve featured core questions', () => {
  assert.equal(BETA_QUESTIONS.length, 25);
  assert.equal(new Set(BETA_QUESTIONS.map(q => q.id)).size, 25);
  assert.equal(FEATURED_QUESTION_IDS.length, 12);
  for (const q of BETA_QUESTIONS) {
    assert.ok(BETA_SECTIONS.some(s => s.id === q.section));
    assert.equal(new Set(q.options.map(o => o.id)).size, q.options.length);
  }
  for (const id of FEATURED_QUESTION_IDS)
    assert.equal(BETA_QUESTIONS.find(q => q.id === id)?.priority, 'core');
});

test('beta answers persist, can change, preserve answeredAt, and progress counts valid choices', async () => {
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
  try {
    await runMigrations(db);
    await saveBetaAnswer(db, 'core_value', 'o1', new Date('2026-10-14T10:00:00Z'));
    await saveBetaAnswer(db, 'core_value', 'o2', new Date('2026-10-14T11:00:00Z'));
    await saveBetaComment(db, 'Una idea');
    await assert.rejects(saveBetaAnswer(db, 'core_value', 'bad'), /válida/);
    const row = sqlite.prepare('SELECT * FROM beta_feedback_answers WHERE question_id = ?').get('core_value');
    assert.equal(row.answered_at, '2026-10-14T10:00:00.000Z');
    assert.equal(row.updated_at, '2026-10-14T11:00:00.000Z');
    const loaded = await loadBetaFeedback(db);
    assert.equal(loaded.answers.core_value, 'o2');
    assert.equal(loaded.comment, 'Una idea');
    assert.deepEqual(betaProgress(loaded.answers), { answered: 1, total: 12 });
  } finally { sqlite.close(); }
});

test('email export is deterministic, sectioned and uses only registry values plus explicit comment', () => {
  const answers = { core_value: 'o1', recurring_payments: 'o2', unknown: 'secret balance 12345' };
  const body = betaEmailBody(answers, 'Una idea');
  assert.equal(body, betaEmailBody(answers, 'Una idea'));
  assert.match(body, /TU DINERO\nPagos recurrentes: A veces/);
  assert.match(body, /FUTURO DE MIS PAGOS\nLo más valioso: Disponible real/);
  assert.match(body, /COMENTARIO OPCIONAL\nUna idea/);
  assert.doesNotMatch(body, /secret balance 12345/);
  assert.doesNotMatch(body, /amountMinor|saldo actual|movimientos:/i);
});
