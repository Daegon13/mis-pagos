const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { load } = require('./helpers/load.cjs');

const { SCENE_WIDTH, SCENE_HEIGHT, SLOTS, SPACE_ASSETS, placeAsset, resolveSpaceScene } =
  load('src/features/space/spaceScene.ts');
const { DEFAULT_SELECTION } = load('src/domain/personalization.ts');
const selection = (interestIds = [], atmosphereId = 'natural', themeId = 'bosque') =>
  ({ ...DEFAULT_SELECTION, interestIds, atmosphereId, themeId });
const objects = scene => scene.objects.map(object => object.assetId);

test('asset and slot registries preserve contract IDs, source mapping and bounded geometry', () => {
  assert.equal(SCENE_WIDTH, 1448);
  assert.equal(SCENE_HEIGHT, 1086);
  const ids = Object.keys(SPACE_ASSETS);
  assert.equal(new Set(ids).size, ids.length);
  assert.deepEqual(ids.sort(), ['desk', 'shelf', 'monitor', 'deskLamp', 'plantLarge', 'plantSmall',
    'books', 'mug', 'gamepad', 'speakerVinyl', 'moonLamp', 'catFigurine'].sort());
  assert.equal(new Set(Object.keys(SLOTS)).size, 10);
  for (const [id, asset] of Object.entries(SPACE_ASSETS)) {
    assert.ok(fs.existsSync(path.join('assets/assets mis pagos', asset.canonicalSourceFilename)), id);
    assert.ok(fs.existsSync(path.join('assets/space/runtime', asset.runtimeFilename)), id);
    assert.equal(typeof asset.source, 'number');
    assert.ok(asset.aspectRatio > 0 && asset.preferredWidth > 0);
    for (const slotId of asset.allowedSlots) {
      const object = placeAsset(id, slotId, 'interest');
      assert.ok(object.x >= 0 && object.y >= 0 && object.x + object.width <= SCENE_WIDTH &&
        object.y + object.height <= SCENE_HEIGHT, `${id} outside scene`);
      assert.ok(Math.abs(object.width / object.height - asset.aspectRatio) < 1e-9, id);
    }
  }
  for (const slot of Object.values(SLOTS)) {
    assert.ok(slot.x >= 0 && slot.x <= SCENE_WIDTH && slot.y >= 0 && slot.y <= SCENE_HEIGHT);
    assert.ok(slot.maxWidth > 0 && slot.maxHeight > 0);
  }
});

test('stages preserve anchors, composition is deterministic, themes do not change progression', () => {
  const profile = selection(['gaming', 'tecnologia', 'musica'], 'nocturno');
  assert.deepEqual(objects(resolveSpaceScene(0, profile)), []);
  assert.deepEqual(objects(resolveSpaceScene(1, profile)), ['plantLarge']);
  const stage2 = resolveSpaceScene(2, profile);
  assert.deepEqual(stage2, resolveSpaceScene(2, profile));
  assert.ok(objects(stage2).includes('desk'));
  assert.ok(objects(stage2).includes('books'));
  assert.ok(objects(stage2).includes('monitor'));
  assert.ok(objects(stage2).includes('speakerVinyl'));
  assert.deepEqual(objects(stage2), objects(resolveSpaceScene(2, selection(profile.interestIds,
    profile.atmosphereId, 'ciruela'))));
});

test('interest priority, slot collision, density and unavailable optional assets', () => {
  const profile = selection(['animales', 'musica', 'cafe']);
  const scene = resolveSpaceScene(2, profile);
  assert.ok(objects(scene).includes('catFigurine'));
  assert.ok(objects(scene).includes('speakerVinyl'));
  assert.equal(new Set(scene.objects.map(object => object.slotId)).size, scene.objects.length);
  assert.ok(scene.objects.filter(object => object.source === 'interest').length <= 4);
  const reinforced = resolveSpaceScene(2, selection(['gaming', 'musica', 'animales']));
  assert.ok(['monitor', 'speakerVinyl', 'catFigurine', 'gamepad'].every(id => objects(reinforced).includes(id)));
  const minimal = resolveSpaceScene(2, selection(['minimalismo', 'gaming', 'musica'], 'minimalista'));
  assert.ok(minimal.objects.filter(object => object.source === 'interest').length <= 1);
  const available = new Set(Object.keys(SPACE_ASSETS).filter(id => id !== 'catFigurine'));
  assert.ok(!objects(resolveSpaceScene(2, profile, [], available)).includes('catFigurine'));
  assert.ok(objects(resolveSpaceScene(2, profile, [], available)).includes('speakerVinyl'));
});

test('featured interests have a visible stage-two object without changing stage anchors', () => {
  const expected = {
    libros: 'shelf', gaming: 'monitor', musica: 'speakerVinyl', cafe: 'mug',
    naturaleza: 'plantSmall', animales: 'catFigurine',
  };
  for (const [interest, asset] of Object.entries(expected)) {
    const stageOne = resolveSpaceScene(1, selection([interest]));
    assert.deepEqual(objects(stageOne), ['plantLarge']);
    const stageTwo = resolveSpaceScene(2, selection([interest]));
    assert.ok(stageTwo.objects.some(object => object.assetId === asset && object.source === 'interest'), interest);
    assert.ok(objects(stageTwo).includes('books'));
  }
  const mixed = resolveSpaceScene(2, selection(['libros', 'musica', 'animales']));
  assert.ok(['shelf', 'speakerVinyl', 'catFigurine'].every(id => objects(mixed).includes(id)));
});

test('achievements are deduplicated secondary details and cannot advance stage', () => {
  const unlocked = ['FIRST_RESERVE', 'FIRST_RESERVE', 'FIRST_SPENDING_SIMULATION'];
  assert.deepEqual(objects(resolveSpaceScene(0, selection(), unlocked)), []);
  assert.deepEqual(objects(resolveSpaceScene(1, selection(), unlocked)), ['plantLarge']);
  const scene = resolveSpaceScene(2, selection(), unlocked);
  assert.ok(scene.objects.some(object => object.source === 'achievement'));
  assert.ok(scene.objects.filter(object => object.source === 'achievement').length <= 2);
  assert.equal(new Set(objects(scene)).size, scene.objects.length);
  assert.deepEqual(unlocked, ['FIRST_RESERVE', 'FIRST_RESERVE', 'FIRST_SPENDING_SIMULATION']);
  assert.ok(resolveSpaceScene(2, selection(['minimalismo']), unlocked).objects
    .filter(object => object.source === 'achievement').length <= 1);
});
