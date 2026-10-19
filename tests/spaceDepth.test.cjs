const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const { load } = require('./helpers/load.cjs');

const { SCENE_WIDTH, SCENE_HEIGHT, SCENE_LAYERS, SPACE_ASSETS, placeAsset, resolveSpaceScene } =
  load('src/features/space/spaceScene.ts');
const { resolveFinalSpaceScene, EMPTY_VISUAL_PREFERENCES } =
  load('src/features/space/spaceCustomization.ts');
const { DEFAULT_SELECTION } = load('src/domain/personalization.ts');
const selection = (interestIds = [], atmosphereId = 'natural', themeId = 'bosque') =>
  ({ ...DEFAULT_SELECTION, interestIds, atmosphereId, themeId });

// These hashes were recorded from pro-development before semantic depth was added.
// Strip only new metadata: placements, ordering, treatments and selection must match.
function staticSignature(scene) {
  const legacyScene = { ...scene, objects: scene.objects.map(({ depth, ...object }) => object) };
  return createHash('sha256').update(JSON.stringify(legacyScene)).digest('hex');
}

test('all renderable layers expose stable semantic depth without changing painter order', () => {
  assert.deepEqual([SCENE_WIDTH, SCENE_HEIGHT], [1448, 1086]);
  assert.deepEqual(Object.values(SCENE_LAYERS).map(layer => layer.zIndex), [0, 10, 11, 12, 13]);
  assert.deepEqual(Object.values(SCENE_LAYERS).map(layer => layer.band),
    ['background', 'room', 'room', 'window', 'room']);
  for (const [assetId, asset] of Object.entries(SPACE_ASSETS)) {
    for (const slotId of asset.allowedSlots) {
      const { depth, zIndex } = placeAsset(assetId, slotId, 'manual');
      assert.ok(['furniture', 'object', 'detail'].includes(depth.band), assetId);
      assert.equal(depth.zIndex, zIndex);
      assert.equal(zIndex, asset.zIndex);
      assert.deepEqual(depth, placeAsset(assetId, slotId, 'interest').depth);
    }
  }
});

test('static scenes match the legacy composition across stages, rewards and recombination', () => {
  const cases = [
    [0, selection(), [], 0, '9e75d3f73a2ad55ad3eac3242b348d1fdd804369703353d0aa2bb701ab630e5d'],
    [1, selection(['naturaleza']), [], 0, 'b8b95d24c569fc02ab16e6f0a91eca3a2bbf2b6f49eb30037bd2eecd222a04b6'],
    [2, selection(['gaming', 'musica', 'animales'], 'nocturno'), ['FIRST_RESERVE'], 0,
      'a4936c0195be16d59b7f33c9a21ea7cabead03a2b79f542398a5f2c616fe47ee'],
    [2, selection(['minimalismo', 'gaming', 'musica'], 'minimalista'), ['FIRST_RESERVE'], 0,
      'e90bf2bf436c54bba2ee70ff4e0019a07812749904c5aa6acd1623ebaa3292db'],
    [2, selection(['naturaleza', 'hogar'], 'calido', 'peonia'), ['FIRST_RESERVE'], 3,
      'd83c8c9b9c4ba62ff81556cb0fadf592745b9e506ecc716fa59b405883762d80'],
  ];
  for (const [stage, profile, rewards, variant, expected] of cases) {
    assert.equal(staticSignature(resolveSpaceScene(stage, profile, rewards, undefined, variant)), expected);
  }
});

test('manual selection preserves legacy static output and uses the same depth metadata', () => {
  const scene = resolveFinalSpaceScene(2, selection(['gaming', 'musica']), ['FIRST_RESERVE'],
    [{ slotId: 'deskCenter', assetId: 'monitor' }],
    { ...EMPTY_VISUAL_PREFERENCES, decorationMode: 'manual' });
  assert.equal(staticSignature(scene), '07b4cd0f4791aea4c3f1922088161a7dd88ef8bb60bc756556b74c33cf9ca2c2');
  assert.ok(scene.objects.every(object => object.depth.zIndex === object.zIndex));
});
