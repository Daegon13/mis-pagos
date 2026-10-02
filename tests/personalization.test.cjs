const { test } = require('node:test');
const assert = require('node:assert/strict');
const { DatabaseSync } = require('node:sqlite');
const { load } = require('./helpers/load.cjs');

const {
  DEFAULT_SELECTION, INTERESTS, THEMES, ATMOSPHERES, MAX_SPACE_NAME_LENGTH,
  normalizeStoredSelection, validateSelection, composeSpace,
} = load('src/domain/personalization.ts');
const { themeFor } = load('src/features/personalization/themes.ts');
const { runMigrations } = load('src/data/db/migrations/index.ts');
const { initialMigration } = load('src/data/db/migrations/001_initial.ts');
const { engagementMigration } = load('src/data/db/migrations/002_engagement.ts');
const { advanceSpace } = load('src/data/repositories/engagementRepository.ts');
const { getPersonalizationPreferences, savePersonalizationPreferences } =
  load('src/data/repositories/personalizationRepository.ts');
const { calculateHome } = load('src/features/home/homeSummary.ts');

function contrast(a, b) {
  const luminance = hex => {
    const channels = hex.slice(1).match(/../g).map(part => parseInt(part, 16) / 255)
      .map(value => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
    return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
  };
  const x = luminance(a); const y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

function fixture() {
  const sqlite = new DatabaseSync(':memory:');
  const db = {
    execAsync: async sql => sqlite.exec(sql),
    runAsync: async (sql, ...params) => sqlite.prepare(sql).run(...params),
    getFirstAsync: async (sql, ...params) => sqlite.prepare(sql).get(...params) ?? null,
    withExclusiveTransactionAsync: async callback => {
      sqlite.exec('BEGIN');
      try { await callback(db); sqlite.exec('COMMIT'); }
      catch (error) { sqlite.exec('ROLLBACK'); throw error; }
    },
  };
  return { sqlite, db };
}

test('default and invalid stored choices are safe; curated themes have semantic tokens', () => {
  assert.equal(DEFAULT_SELECTION.themeId, 'bosque');
  assert.equal(DEFAULT_SELECTION.atmosphereId, 'natural');
  assert.deepEqual(DEFAULT_SELECTION.interestIds, []);
  assert.equal(THEMES.length, 6);
  assert.equal(ATMOSPHERES.length, 5);
  assert.equal(INTERESTS.length, 12);
  for (const item of THEMES) {
    const theme = themeFor(item.id);
    for (const key of ['primary', 'primarySurface', 'accent', 'background', 'surface',
      'secondarySurface', 'textPrimary', 'textSecondary', 'textOnPrimary', 'positive',
      'negative', 'muted', 'border']) assert.match(theme[key], /^#[0-9a-f]{6}$/i);
    for (const [foreground, background] of [
      [theme.textPrimary, theme.background], [theme.textSecondary, theme.background],
      [theme.textOnPrimary, theme.primary], [theme.heroMuted, theme.primary],
      [theme.negativeOnPrimary, theme.primary], [theme.positive, theme.background],
      [theme.negative, theme.background],
    ]) assert.ok(contrast(foreground, background) >= 4.5,
      `${item.label}: ${foreground} on ${background} has insufficient contrast`);
  }
  assert.deepEqual(normalizeStoredSelection({ themeId: 'unknown', interestIds: ['libros', 'fake',
    'libros', 'cafe', 'arte', 'gaming'], atmosphereId: 'unknown', spaceName: 3 }),
  { themeId: 'bosque', interestIds: ['libros', 'cafe', 'arte'], atmosphereId: 'natural', spaceName: '' });
});

test('interest limit, blank name, custom name and length are enforced', () => {
  for (const interestIds of [[], ['libros'], ['libros', 'cafe', 'arte']]) {
    assert.deepEqual(validateSelection({ ...DEFAULT_SELECTION, interestIds }).interestIds, interestIds);
  }
  assert.throws(() => validateSelection({ ...DEFAULT_SELECTION,
    interestIds: ['libros', 'cafe', 'arte', 'gaming'] }));
  assert.throws(() => validateSelection({ ...DEFAULT_SELECTION, interestIds: ['libros', 'libros'] }));
  assert.equal(validateSelection({ ...DEFAULT_SELECTION, spaceName: '  ' }).spaceName, '');
  assert.equal(validateSelection({ ...DEFAULT_SELECTION, spaceName: '  Mi rincón  ' }).spaceName, 'Mi rincón');
  assert.equal(validateSelection({ ...DEFAULT_SELECTION, spaceName: 'x'.repeat(100) }).spaceName.length,
    MAX_SPACE_NAME_LENGTH);
});

test('scene composition is deterministic, distinct for three profiles, and stage remains independent', () => {
  const a = { themeId: 'bosque', interestIds: ['naturaleza', 'hogar'], atmosphereId: 'natural', spaceName: '' };
  const b = { themeId: 'noche', interestIds: ['gaming', 'tecnologia', 'musica'], atmosphereId: 'nocturno', spaceName: 'Base' };
  const c = { themeId: 'terracota', interestIds: ['libros', 'cafe', 'arte'], atmosphereId: 'calido', spaceName: '' };
  assert.deepEqual(composeSpace(a, 2), composeSpace(a, 2));
  assert.equal(composeSpace(a, 0).primaryDetail, 'foliage');
  assert.equal(composeSpace(b, 0).primaryDetail, 'monitor');
  assert.equal(composeSpace(b, 0).ambientDetail, 'record');
  assert.equal(composeSpace(c, 0).primaryDetail, 'books');
  assert.equal(composeSpace(c, 0).secondaryDetail, 'mug');
  assert.notDeepEqual(composeSpace(a, 2), composeSpace(b, 2));
  assert.notDeepEqual(composeSpace(b, 2), composeSpace(c, 2));
  assert.equal(composeSpace(b, 0).stage, 0);
  assert.equal(composeSpace(b, 2).stage, 2);
  assert.equal(composeSpace({ ...a, interestIds: ['minimalismo', 'naturaleza'] }, 2).secondaryDetail, null);
});

test('alpha v2 upgrade preserves financial rows and engagement stage; preferences persist independently', async () => {
  const { sqlite, db } = fixture();
  try {
    await initialMigration.up(db);
    await engagementMigration.up(db);
    sqlite.exec(`PRAGMA user_version = 2;
      INSERT INTO financial_profile VALUES (1, 'UYU', 123456, '2026-10-02', 'stamp', 'stamp');
      INSERT INTO payments VALUES (1, 'expense', 'Alquiler', 54321, '2026-10-15', 'pending', NULL, 'stamp', 'stamp');`);
    await advanceSpace(db, 2);
    const before = ['financial_profile', 'payments', 'engagement_progress'].map(
      table => sqlite.prepare(`SELECT * FROM ${table}`).all());
    const payments = [{ id: 1, type: 'expense', title: 'Alquiler', amountMinor: 54321,
      dueDate: '2026-10-15', status: 'pending', notes: null, createdAt: 'stamp', updatedAt: 'stamp' }];
    const homeBefore = calculateHome(123456, payments, new Date(2026, 9, 2));
    await runMigrations(db);
    await runMigrations(db);
    assert.equal(sqlite.prepare('PRAGMA user_version').get().user_version, 3);
    assert.equal((await getPersonalizationPreferences(db)).themeId, 'bosque');
    await savePersonalizationPreferences(db, { themeId: 'noche',
      interestIds: ['gaming', 'tecnologia', 'musica'], atmosphereId: 'nocturno', spaceName: 'Base' });
    const reloaded = await getPersonalizationPreferences(db);
    assert.deepEqual([reloaded.themeId, reloaded.interestIds, reloaded.atmosphereId, reloaded.spaceName],
      ['noche', ['gaming', 'tecnologia', 'musica'], 'nocturno', 'Base']);
    assert.deepEqual(['financial_profile', 'payments', 'engagement_progress'].map(
      table => sqlite.prepare(`SELECT * FROM ${table}`).all()), before);
    assert.deepEqual(calculateHome(123456, payments, new Date(2026, 9, 2)), homeBefore);
    sqlite.exec("UPDATE personalization_preferences SET theme_id='unknown', atmosphere_id='unknown', interests_json='broken' WHERE id=1");
    const fallback = await getPersonalizationPreferences(db);
    assert.equal(fallback.themeId, 'bosque');
    assert.equal(fallback.atmosphereId, 'natural');
    assert.deepEqual(fallback.interestIds, []);
  } finally { sqlite.close(); }
});

test('fresh installation creates safe defaults without financial rows', async () => {
  const { sqlite, db } = fixture();
  try {
    await runMigrations(db);
    assert.equal(sqlite.prepare('PRAGMA user_version').get().user_version, 3);
    const saved = await getPersonalizationPreferences(db);
    assert.equal(saved.themeId, 'bosque');
    assert.deepEqual(saved.interestIds, []);
    assert.equal(saved.atmosphereId, 'natural');
    assert.equal(saved.spaceName, '');
    assert.equal(sqlite.prepare('SELECT COUNT(*) AS n FROM payments').get().n, 0);
  } finally { sqlite.close(); }
});
