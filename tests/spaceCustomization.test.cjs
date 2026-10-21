const { test } = require('node:test');
const assert = require('node:assert/strict');
const { DatabaseSync } = require('node:sqlite');
const { load } = require('./helpers/load.cjs');

const { runMigrations } = load('src/data/db/migrations/index.ts');
const { initialMigration } = load('src/data/db/migrations/001_initial.ts');
const { engagementMigration } = load('src/data/db/migrations/002_engagement.ts');
const { personalizationMigration } = load('src/data/db/migrations/003_personalization.ts');
const { spendingPlanMigration } = load('src/data/db/migrations/004_spending_plan.ts');
const { achievementsMigration } = load('src/data/db/migrations/005_achievements.ts');
const { spaceCustomizationMigration } = load('src/data/db/migrations/006_space_customization.ts');
const { spaceColorsMigration } = load('src/data/db/migrations/007_space_colors.ts');
const { notificationsMigration } = load('src/data/db/migrations/008_notifications.ts');
const { DEFAULT_SELECTION } = load('src/domain/personalization.ts');
const { ACHIEVEMENTS } = load('src/domain/achievements.ts');
const { ACHIEVEMENT_REWARDS, capabilitiesFromUnlocks } = load('src/domain/achievementRewards.ts');
const { resolveSpaceScene, recommendationLabels, SPACE_ASSETS } = load('src/features/space/spaceScene.ts');
const { resolveFinalSpaceScene, effectiveAppearance, eligibleAssetsForSlot, nextAutomaticVariant, EMPTY_VISUAL_PREFERENCES } =
  load('src/features/space/spaceCustomization.ts');
const { chooseSlot, resetSlot, resetDecoration, choosePalette, chooseWindowMood, chooseCustomColor,
  chooseDecorationMode, tryAnotherCombination, loadSpaceCustomization } =
  load('src/features/space/spaceCustomizationService.ts');

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
  return { db, sqlite };
}

const row = (slotId, assetId) => ({ slotId, assetId, updatedAt: 'stamp' });
const selection = (interestIds = [], atmosphereId = 'natural', themeId = 'bosque') =>
  ({ ...DEFAULT_SELECTION, interestIds, atmosphereId, themeId });
const manualVisual = { ...EMPTY_VISUAL_PREFERENCES, decorationMode: 'manual' };

test('v5 to v11 preserves financial, planning, engagement, personalization and unlock rows', async () => {
  const { db, sqlite } = fixture();
  try {
    for (const migration of [initialMigration, engagementMigration, personalizationMigration,
      spendingPlanMigration, achievementsMigration]) await migration.up(db);
    sqlite.exec(`PRAGMA user_version=5;
      INSERT INTO financial_profile VALUES(1,'UYU',12345,'2026-10-11','stamp','stamp');
      INSERT INTO payments VALUES(1,'expense','Rent',500,'2026-10-12','pending',NULL,'stamp','stamp');
      INSERT INTO spending_plans VALUES(1,'2026-10-01','2026-10-31','fixed',NULL,1000,12345,'stamp','stamp');
      INSERT INTO spending_allocations VALUES(1,1,'Comida',10000,0,'stamp','stamp');
      UPDATE engagement_progress SET stage=2 WHERE id=1;
      UPDATE personalization_preferences SET theme_id='oceano', space_name='Mi rincón' WHERE id=1;
      INSERT INTO achievement_unlocks VALUES('FIRST_RESERVE','stamp');`);
    const preserved = ['financial_profile', 'payments', 'spending_plans', 'spending_allocations', 'engagement_progress',
      'personalization_preferences', 'achievement_unlocks'].map(name => sqlite.prepare(`SELECT * FROM ${name}`).all());
    await runMigrations(db);
    assert.equal(sqlite.prepare('PRAGMA user_version').get().user_version, 11);
    assert.deepEqual(['financial_profile', 'payments', 'spending_plans', 'spending_allocations', 'engagement_progress',
      'personalization_preferences', 'achievement_unlocks'].map(name => sqlite.prepare(`SELECT * FROM ${name}`).all()), preserved);
    const state = await loadSpaceCustomization(db);
    assert.deepEqual(state.overrides, []);
    assert.deepEqual(state.visual, EMPTY_VISUAL_PREFERENCES);
    assert.deepEqual(resolveFinalSpaceScene(2, selection(), state.unlocks, state.overrides, state.visual),
      resolveSpaceScene(2, selection(), state.unlocks));
  } finally { sqlite.close(); }
});

test('seven fixed discoveries grant exactly their specified capabilities without duplicate state', () => {
  assert.equal(ACHIEVEMENT_REWARDS.length, 7);
  assert.deepEqual(new Set(ACHIEVEMENT_REWARDS.map(item => item.achievementId)),
    new Set(ACHIEVEMENTS.map(item => item.id)));
  const expected = {
    FIRST_PERSONALIZED_SPACE: 'editCoreDecor', FIRST_COMMITMENT: 'editDeskLeft',
    FIRST_EXPECTED_INCOME: 'editFloorRight', FIRST_RESOLVED_MOVEMENT: 'editDetailCenter',
    FIRST_OVERDUE_RESOLVED: 'editDetailRight', FIRST_RESERVE: 'roomPaletteOverride',
    FIRST_SPENDING_SIMULATION: 'windowMoodOverride',
  };
  for (const item of ACHIEVEMENT_REWARDS) {
    assert.deepEqual(item.capabilityIds, [expected[item.achievementId]]);
    assert.deepEqual([...capabilitiesFromUnlocks([item.achievementId, item.achievementId])], item.capabilityIds);
    assert.equal(capabilitiesFromUnlocks([]).has(item.capabilityIds[0]), false);
  }
});

test('slot writes distinguish Automatic, asset and Empty, validate entitlements and duplicates', async () => {
  const { db, sqlite } = fixture();
  try {
    await runMigrations(db);
    await assert.rejects(chooseSlot(db, 'deskCenter', 'monitor'), /desbloqueado/);
    sqlite.exec(`UPDATE engagement_progress SET stage=2;
      INSERT INTO achievement_unlocks VALUES('FIRST_PERSONALIZED_SPACE','stamp');
      INSERT INTO achievement_unlocks VALUES('FIRST_COMMITMENT','stamp');`);
    await assert.rejects(chooseSlot(db, 'unknown', 'monitor'), /desconocida/);
    await assert.rejects(chooseSlot(db, 'deskCenter', 'obsolete'), /no corresponde/);
    await assert.rejects(chooseSlot(db, 'deskCenter', 'mug'), /no corresponde/);
    await chooseSlot(db, 'deskCenter', 'monitor');
    assert.equal((await loadSpaceCustomization(db)).overrides[0].assetId, 'monitor');
    await chooseSlot(db, 'deskLeft', 'tarotDeck');
    assert.equal((await loadSpaceCustomization(db)).overrides.find(item => item.slotId === 'deskLeft').assetId, 'tarotDeck');
    await chooseSlot(db, 'deskRight', 'plantSmall');
    await assert.rejects(chooseSlot(db, 'deskLeft', 'plantSmall'), /otra zona/);
    await chooseSlot(db, 'deskRight', null);
    assert.equal((await loadSpaceCustomization(db)).overrides.find(item => item.slotId === 'deskRight').assetId, null);
    await resetSlot(db, 'deskRight');
    assert.equal((await loadSpaceCustomization(db)).overrides.some(item => item.slotId === 'deskRight'), false);
    await resetDecoration(db);
    assert.deepEqual((await loadSpaceCustomization(db)).overrides, []);
    assert.equal(sqlite.prepare('SELECT stage FROM engagement_progress').get().stage, 2);
    assert.equal(sqlite.prepare('SELECT COUNT(*) AS n FROM achievement_unlocks').get().n, 2);
  } finally { sqlite.close(); }
});

test('scene merge keeps anchors, manual choices, minimalism and deterministic fallback', () => {
  const unlocks = ['FIRST_PERSONALIZED_SPACE', 'FIRST_COMMITMENT'];
  const profile = selection(['gaming', 'minimalismo'], 'minimalista');
  const automatic = resolveSpaceScene(2, profile, unlocks);
  assert.deepEqual(resolveFinalSpaceScene(2, profile, unlocks), automatic);
  const overrides = [row('deskCenter', 'monitor'), row('deskRight', null), row('deskLeft', 'mug')];
  const scene = resolveFinalSpaceScene(2, profile, unlocks, overrides, manualVisual);
  assert.deepEqual(scene, resolveFinalSpaceScene(2, profile, unlocks, overrides, manualVisual));
  assert.ok(scene.objects.some(item => item.assetId === 'books' && item.slotId === 'booksAnchor'));
  assert.ok(scene.objects.some(item => item.assetId === 'desk'));
  assert.ok(scene.objects.some(item => item.assetId === 'plantLarge'));
  assert.equal(scene.objects.find(item => item.slotId === 'deskCenter').source, 'manual');
  assert.equal(scene.objects.find(item => item.slotId === 'deskLeft').assetId, 'mug');
  assert.equal(scene.objects.some(item => item.slotId === 'deskRight'), false);
  assert.equal(scene.objects.filter(item => item.assetId === 'monitor').length, 1);
  assert.deepEqual(resolveFinalSpaceScene(2, profile, [], overrides, manualVisual), resolveSpaceScene(2, profile));
  assert.deepEqual(resolveFinalSpaceScene(2, profile, unlocks, [row('deskCenter', 'retired')], manualVisual), automatic);
  assert.deepEqual(resolveFinalSpaceScene(0, profile, unlocks, overrides, manualVisual).objects, []);
  assert.deepEqual(resolveFinalSpaceScene(1, profile, unlocks, overrides, manualVisual).objects.map(item => item.assetId), ['plantLarge']);
  const changedInterests = resolveFinalSpaceScene(2, selection(['naturaleza']), unlocks, overrides, manualVisual);
  assert.ok(changedInterests.objects.some(item => item.assetId === 'monitor' && item.source === 'manual'));
  const relocated = resolveFinalSpaceScene(2, selection(['naturaleza']), unlocks, [row('deskLeft', 'plantSmall')], manualVisual);
  assert.equal(relocated.objects.filter(item => item.assetId === 'plantSmall').length, 1);
  assert.equal(relocated.objects.find(item => item.assetId === 'plantSmall').slotId, 'deskLeft');
  assert.ok(eligibleAssetsForSlot('deskCenter', 2).includes('monitor'));
  assert.ok(eligibleAssetsForSlot('detailRight', 2).includes('vanityMirror'));
  assert.ok(resolveFinalSpaceScene(2, selection(['minimalismo']), unlocks,
    [row('deskLeft', 'tarotDeck')], manualVisual).objects.some(item => item.assetId === 'tarotDeck' && item.source === 'manual'));
});

test('automatic variants change when possible, persist and leave manual choices intact', async () => {
  const { db, sqlite } = fixture();
  try {
    await runMigrations(db);
    sqlite.exec(`UPDATE engagement_progress SET stage=2;
      INSERT INTO achievement_unlocks VALUES('FIRST_PERSONALIZED_SPACE','stamp');`);
    const profile = selection(['animales', 'noche', 'hogar'], 'natural', 'peonia');
    await chooseDecorationMode(db, 'manual');
    await chooseSlot(db, 'deskRight', 'catMug');
    await chooseDecorationMode(db, 'automatic');
    let state = await loadSpaceCustomization(db);
    const originalVisual = state.visual;
    const originalStage = state.stage;
    const originalUnlocks = state.unlocks;
    const before = resolveFinalSpaceScene(2, profile, state.unlocks, state.overrides, state.visual);
    assert.equal(await tryAnotherCombination(db, profile), true);
    state = await loadSpaceCustomization(db);
    const after = resolveFinalSpaceScene(2, profile, state.unlocks, state.overrides, state.visual);
    assert.notDeepEqual(after.objects, before.objects);
    assert.equal(state.visual.automaticVariant, nextAutomaticVariant(2, profile, state.unlocks, 0));
    assert.deepEqual({ ...state.visual, automaticVariant: 0 }, originalVisual);
    assert.equal(state.stage, originalStage);
    assert.deepEqual(state.unlocks, originalUnlocks);
    assert.equal(state.overrides[0].assetId, 'catMug');
    assert.deepEqual((await loadSpaceCustomization(db)).visual, state.visual);
    await chooseDecorationMode(db, 'manual');
    state = await loadSpaceCustomization(db);
    assert.equal(resolveFinalSpaceScene(2, profile, state.unlocks, state.overrides, state.visual)
      .objects.find(item => item.slotId === 'deskRight').source, 'manual');
    assert.equal(await tryAnotherCombination(db, profile), false);
    assert.equal((await loadSpaceCustomization(db)).visual.automaticVariant, state.visual.automaticVariant);
  } finally { sqlite.close(); }
});

test('v8 upgrade keeps existing manual decoration selected', async () => {
  const { db, sqlite } = fixture();
  try {
    for (const migration of [initialMigration, engagementMigration, personalizationMigration,
      spendingPlanMigration, achievementsMigration, spaceCustomizationMigration, spaceColorsMigration,
      notificationsMigration]) await migration.up(db);
    sqlite.exec(`PRAGMA user_version=8;
      UPDATE engagement_progress SET stage=2;
      INSERT INTO achievement_unlocks VALUES('FIRST_PERSONALIZED_SPACE','stamp');
      INSERT INTO space_slot_overrides VALUES('deskCenter','monitor','stamp');`);
    await runMigrations(db);
    const state = await loadSpaceCustomization(db);
    assert.equal(state.visual.decorationMode, 'manual');
    assert.equal(state.visual.automaticVariant, 0);
    assert.equal(state.overrides[0].assetId, 'monitor');
    assert.equal(resolveFinalSpaceScene(2, selection(['naturaleza']), state.unlocks, state.overrides, state.visual)
      .objects.find(item => item.slotId === 'deskCenter').source, 'manual');
  } finally { sqlite.close(); }
});

test('variants respect empty scenes, minimalism, unique slots and catalogue recommendations', () => {
  assert.equal(nextAutomaticVariant(1, selection(['animales']), [], 0), 0);
  assert.equal(nextAutomaticVariant(2, selection(), [], 0), 0);
  for (const interests of [['animales'], ['animales', 'noche', 'hogar']]) {
    const profile = selection(interests);
    let current = 0;
    for (let press = 0; press < 8; press++) {
      const next = nextAutomaticVariant(2, profile, [], current);
      assert.notDeepEqual(resolveSpaceScene(2, profile, [], undefined, next).objects,
        resolveSpaceScene(2, profile, [], undefined, current).objects);
      current = next;
    }
  }
  for (const interests of [[], ['noche'], ['animales', 'noche', 'hogar'], ['minimalismo', 'animales']]) {
    const profile = selection(interests);
    const next = nextAutomaticVariant(2, profile, ['FIRST_RESERVE'], 0);
    const scene = resolveSpaceScene(2, profile, ['FIRST_RESERVE'], undefined, next);
    assert.equal(new Set(scene.objects.map(item => item.slotId)).size, scene.objects.length);
    assert.equal(new Set(scene.objects.map(item => item.assetId)).size, scene.objects.length);
    if (interests.includes('minimalismo'))
      assert.ok(scene.objects.filter(item => item.source === 'interest').length <= 1);
  }
  assert.deepEqual(recommendationLabels('calicoCat'), ['Animales']);
  assert.deepEqual(recommendationLabels('tarotDeck'), ['Arte', 'Noche', 'Libros']);
  assert.deepEqual(recommendationLabels('desk'), []);
  assert.deepEqual(SPACE_ASSETS.tarotDeck.interestTags, ['arte', 'noche', 'libros']);
});

test('palette and mood follow defaults, then override independently when unlocked', async () => {
  const { db, sqlite } = fixture();
  try {
    await runMigrations(db);
    await assert.rejects(choosePalette(db, 'oceano'), /desbloqueada/);
    await assert.rejects(chooseWindowMood(db, 'nocturno'), /desbloqueado/);
    sqlite.exec(`INSERT INTO achievement_unlocks VALUES('FIRST_RESERVE','stamp');
      INSERT INTO achievement_unlocks VALUES('FIRST_SPENDING_SIMULATION','stamp');`);
    await choosePalette(db, 'oceano');
    await chooseWindowMood(db, 'nocturno');
    const state = await loadSpaceCustomization(db);
    const profile = selection([], 'natural', 'bosque');
    assert.deepEqual(effectiveAppearance(profile, state.unlocks, state.visual),
      { paletteId: 'oceano', moodId: 'nocturno', wallColor: null, ambientColor: null });
    assert.equal(resolveFinalSpaceScene(2, profile, state.unlocks, [], state.visual).treatments.atmosphereId, 'nocturno');
    assert.equal(sqlite.prepare('SELECT theme_id FROM personalization_preferences').get().theme_id, 'bosque');
    await choosePalette(db, null);
    await chooseWindowMood(db, null);
    assert.deepEqual(effectiveAppearance(profile, state.unlocks, (await loadSpaceCustomization(db)).visual),
      { paletteId: 'bosque', moodId: 'natural', wallColor: null, ambientColor: null });
    await assert.rejects(choosePalette(db, 'bogus'), /desconocida/);
    await assert.rejects(chooseWindowMood(db, 'bogus'), /desconocido/);
  } finally { sqlite.close(); }
});

test('custom wall and ambient colors persist independently and presets clear only their own custom value', async () => {
  const { db, sqlite } = fixture();
  try {
    await runMigrations(db);
    await assert.rejects(chooseCustomColor(db, 'wall', '#abcdef'), /desbloqueado/);
    sqlite.exec(`INSERT INTO achievement_unlocks VALUES('FIRST_RESERVE','stamp');
      INSERT INTO achievement_unlocks VALUES('FIRST_SPENDING_SIMULATION','stamp');`);
    await assert.rejects(chooseCustomColor(db, 'wall', '#bad'), /hexadecimal/);
    await chooseCustomColor(db, 'wall', 'abcdef');
    await chooseCustomColor(db, 'ambient', '#123456');
    let visual = (await loadSpaceCustomization(db)).visual;
    assert.equal(visual.wallColor, '#ABCDEF');
    assert.equal(visual.ambientColor, '#123456');
    await choosePalette(db, 'oceano');
    visual = (await loadSpaceCustomization(db)).visual;
    assert.equal(visual.wallColor, null);
    assert.equal(visual.ambientColor, '#123456');
    await chooseWindowMood(db, null);
    assert.equal((await loadSpaceCustomization(db)).visual.ambientColor, null);
  } finally { sqlite.close(); }
});
