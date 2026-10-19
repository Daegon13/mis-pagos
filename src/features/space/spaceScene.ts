import type { AchievementId } from "@/domain/achievements";
import type { SpaceStage } from "@/domain/engagement";
import type { InterestId, PersonalizationSelection } from "@/domain/personalization";
import { INTERESTS } from "@/domain/personalization";

export const SCENE_WIDTH = 1448;
export const SCENE_HEIGHT = 1086;

// Semantic depth describes what a layer represents. The legacy zIndex remains the
// static painter order, including deliberate overlaps such as the foreground plant.
export type SpaceDepthBand = "background" | "room" | "window" | "furniture" | "object" | "detail";
export type SpaceDepth = Readonly<{ band: SpaceDepthBand; zIndex: number }>;
export const SCENE_LAYERS = {
  background: { band: "background", zIndex: 0 },
  wall: { band: "room", zIndex: 10 },
  floor: { band: "room", zIndex: 11 },
  window: { band: "window", zIndex: 12 },
  ambient: { band: "room", zIndex: 13 },
} as const satisfies Record<string, SpaceDepth>;

export const SLOTS = {
  floorLeft: { x: 255, y: 1030, maxWidth: 500, maxHeight: 610, anchor: "bottomCenter", zIndex: 60 },
  desk: { x: 800, y: 1040, maxWidth: 1020, maxHeight: 680, anchor: "bottomCenter", zIndex: 30 },
  booksAnchor: { x: 490, y: 510, maxWidth: 190, maxHeight: 155, anchor: "bottomCenter", zIndex: 40 },
  deskLeft: { x: 645, y: 515, maxWidth: 145, maxHeight: 170, anchor: "bottomCenter", zIndex: 40 },
  deskCenter: { x: 820, y: 510, maxWidth: 390, maxHeight: 320, anchor: "bottomCenter", zIndex: 40 },
  deskRight: { x: 1120, y: 515, maxWidth: 165, maxHeight: 170, anchor: "bottomCenter", zIndex: 40 },
  floorRight: { x: 1270, y: 1015, maxWidth: 270, maxHeight: 390, anchor: "bottomCenter", zIndex: 20 },
  detailLeft: { x: 345, y: 510, maxWidth: 220, maxHeight: 245, anchor: "bottomCenter", zIndex: 40 },
  detailCenter: { x: 765, y: 525, maxWidth: 155, maxHeight: 105, anchor: "bottomCenter", zIndex: 50 },
  detailRight: { x: 1250, y: 515, maxWidth: 145, maxHeight: 240, anchor: "bottomCenter", zIndex: 50 },
} as const;
export type SlotId = keyof typeof SLOTS;
export type AssetId = "desk" | "shelf" | "monitor" | "deskLamp" | "plantLarge" | "plantSmall" |
  "books" | "mug" | "gamepad" | "speakerVinyl" | "moonLamp" | "catFigurine" |
  "scentedCandle" | "candleTrio" | "tarotDeck" | "roseQuartz" | "warmLamp" |
  "calicoCat" | "catMug" | "catFrame" | "peonies" | "driedFlowers" |
  "perfume" | "vanityOrganizer" | "floralNotebook" | "jewelryBox" | "vanityMirror";
export const ASSET_LABELS: Record<AssetId, string> = {
  desk: "Escritorio", shelf: "Estantería", monitor: "Monitor", deskLamp: "Lámpara de escritorio",
  plantLarge: "Planta grande", plantSmall: "Planta pequeña", books: "Libros", mug: "Taza",
  gamepad: "Control de juego", speakerVinyl: "Vinilo y parlante", moonLamp: "Lámpara de luna",
  catFigurine: "Figura de gato", scentedCandle: "Vela aromática", candleTrio: "Trío de velas",
  tarotDeck: "Tarot", roseQuartz: "Cuarzo rosa", warmLamp: "Lámpara cálida",
  calicoCat: "Gatito de cerámica", catMug: "Taza gatito", catFrame: "Marco con gato",
  peonies: "Peonías", driedFlowers: "Flores secas", perfume: "Perfume",
  vanityOrganizer: "Tocador", floralNotebook: "Cuaderno floral", jewelryBox: "Joyero",
  vanityMirror: "Espejo",
};
export const AUTOMATIC_VARIANT_COUNT = 60;
type AssetDefinition = {
  canonicalSourceFilename: string; runtimeFilename: string; source: number; aspectRatio: number;
  preferredWidth: number; allowedSlots: readonly SlotId[]; interestTags: readonly InterestId[];
  minimumEngagementStage: SpaceStage; priority: number; zIndex: number;
};

export const SPACE_ASSETS: Record<AssetId, AssetDefinition> = {
  desk: { canonicalSourceFilename: "Escritorio escandinavo de madera clara.png", runtimeFilename: "desk.png", source: require("../../../assets/space/runtime/desk.png"), aspectRatio: 600 / 392, preferredWidth: 1020, allowedSlots: ["desk"], interestTags: [], minimumEngagementStage: 2, priority: 100, zIndex: 30 },
  shelf: { canonicalSourceFilename: "Estantería modular de madera clara.png", runtimeFilename: "shelf.png", source: require("../../../assets/space/runtime/shelf.png"), aspectRatio: 600 / 399, preferredWidth: 250, allowedSlots: ["detailLeft", "floorRight"], interestTags: ["libros"], minimumEngagementStage: 2, priority: 55, zIndex: 20 },
  monitor: { canonicalSourceFilename: "Monitor moderno minimalista en fondo transparente.png", runtimeFilename: "monitor.png", source: require("../../../assets/space/runtime/monitor.png"), aspectRatio: 600 / 479, preferredWidth: 320, allowedSlots: ["deskCenter"], interestTags: ["gaming", "tecnologia"], minimumEngagementStage: 2, priority: 80, zIndex: 40 },
  deskLamp: { canonicalSourceFilename: "Lámpara de escritorio verde oliva.png", runtimeFilename: "desk-lamp.png", source: require("../../../assets/space/runtime/desk-lamp.png"), aspectRatio: 263 / 360, preferredWidth: 145, allowedSlots: ["detailLeft", "deskLeft"], interestTags: ["hogar"], minimumEngagementStage: 2, priority: 65, zIndex: 40 },
  plantLarge: { canonicalSourceFilename: "Planta frondosa en maceta crema.png", runtimeFilename: "plant-large.png", source: require("../../../assets/space/runtime/plant-large.png"), aspectRatio: 575 / 600, preferredWidth: 500, allowedSlots: ["floorLeft"], interestTags: ["naturaleza"], minimumEngagementStage: 1, priority: 100, zIndex: 60 },
  plantSmall: { canonicalSourceFilename: "Planta pothos en maceta cerámica.png", runtimeFilename: "plant-small.png", source: require("../../../assets/space/runtime/plant-small.png"), aspectRatio: 360 / 323, preferredWidth: 145, allowedSlots: ["deskRight", "detailRight", "deskLeft"], interestTags: ["naturaleza", "hogar"], minimumEngagementStage: 2, priority: 60, zIndex: 40 },
  books: { canonicalSourceFilename: "Pila de libros en tonos cálidos.png", runtimeFilename: "books.png", source: require("../../../assets/space/runtime/books.png"), aspectRatio: 360 / 221, preferredWidth: 175, allowedSlots: ["booksAnchor"], interestTags: ["libros"], minimumEngagementStage: 2, priority: 100, zIndex: 40 },
  mug: { canonicalSourceFilename: "Taza cerámica bicolor sobre fondo transparente.png", runtimeFilename: "mug.png", source: require("../../../assets/space/runtime/mug.png"), aspectRatio: 360 / 291, preferredWidth: 88, allowedSlots: ["detailRight", "deskRight", "deskLeft"], interestTags: ["cafe", "hogar"], minimumEngagementStage: 2, priority: 55, zIndex: 50 },
  gamepad: { canonicalSourceFilename: "Controlador gamer moderno en grafito.png", runtimeFilename: "gamepad.png", source: require("../../../assets/space/runtime/gamepad.png"), aspectRatio: 360 / 230, preferredWidth: 135, allowedSlots: ["detailCenter"], interestTags: ["gaming"], minimumEngagementStage: 2, priority: 55, zIndex: 50 },
  speakerVinyl: { canonicalSourceFilename: "Altavoz moderno y disco de vinilo.png", runtimeFilename: "speaker-vinyl.png", source: require("../../../assets/space/runtime/speaker-vinyl.png"), aspectRatio: 360 / 325, preferredWidth: 205, allowedSlots: ["floorRight"], interestTags: ["musica"], minimumEngagementStage: 2, priority: 55, zIndex: 50 },
  moonLamp: { canonicalSourceFilename: "Lámpara de luna sobre base de madera.png", runtimeFilename: "moon-lamp.png", source: require("../../../assets/space/runtime/moon-lamp.png"), aspectRatio: 292 / 360, preferredWidth: 95, allowedSlots: ["detailRight", "deskRight"], interestTags: ["noche"], minimumEngagementStage: 2, priority: 55, zIndex: 50 },
  catFigurine: { canonicalSourceFilename: "Gato cerámico minimalista y sereno.png", runtimeFilename: "cat-figurine.png", source: require("../../../assets/space/runtime/cat-figurine.png"), aspectRatio: 206 / 360, preferredWidth: 160, allowedSlots: ["detailRight", "floorRight"], interestTags: ["animales"], minimumEngagementStage: 2, priority: 55, zIndex: 50 },
  scentedCandle: { canonicalSourceFilename: "Vela aromática minimalista en tonos cálidos.png", runtimeFilename: "scented-candle.png", source: require("../../../assets/space/runtime/scented-candle.png"), aspectRatio: 294 / 320, preferredWidth: 90, allowedSlots: ["deskRight", "detailCenter"], interestTags: ["noche", "hogar"], minimumEngagementStage: 2, priority: 60, zIndex: 50 },
  candleTrio: { canonicalSourceFilename: "Trío de velas cálidas y acogedoras.png", runtimeFilename: "candle-trio.png", source: require("../../../assets/space/runtime/candle-trio.png"), aspectRatio: 285 / 320, preferredWidth: 125, allowedSlots: ["detailCenter", "detailRight"], interestTags: ["noche", "hogar"], minimumEngagementStage: 2, priority: 60, zIndex: 50 },
  tarotDeck: { canonicalSourceFilename: "Mazo de tarot místico con sol y luna.png", runtimeFilename: "tarot-deck.png", source: require("../../../assets/space/runtime/tarot-deck.png"), aspectRatio: 320 / 263, preferredWidth: 125, allowedSlots: ["deskLeft"], interestTags: ["arte", "noche", "libros"], minimumEngagementStage: 2, priority: 70, zIndex: 40 },
  roseQuartz: { canonicalSourceFilename: "Cristal de cuarzo rosa sobre base de piedra.png", runtimeFilename: "rose-quartz.png", source: require("../../../assets/space/runtime/rose-quartz.png"), aspectRatio: 204 / 320, preferredWidth: 95, allowedSlots: ["detailCenter", "deskRight"], interestTags: ["naturaleza", "noche"], minimumEngagementStage: 2, priority: 65, zIndex: 50 },
  warmLamp: { canonicalSourceFilename: "Lámpara minimalista de luz cálida.png", runtimeFilename: "warm-lamp.png", source: require("../../../assets/space/runtime/warm-lamp.png"), aspectRatio: 241 / 320, preferredWidth: 125, allowedSlots: ["deskLeft"], interestTags: ["noche", "hogar"], minimumEngagementStage: 2, priority: 65, zIndex: 40 },
  calicoCat: { canonicalSourceFilename: "Gato de cerámica sereno estilo calicó.png", runtimeFilename: "calico-cat.png", source: require("../../../assets/space/runtime/calico-cat.png"), aspectRatio: 208 / 320, preferredWidth: 115, allowedSlots: ["detailRight", "floorRight"], interestTags: ["animales"], minimumEngagementStage: 2, priority: 70, zIndex: 50 },
  catMug: { canonicalSourceFilename: "Taza de gato con orejas rosa y crema.png", runtimeFilename: "cat-mug.png", source: require("../../../assets/space/runtime/cat-mug.png"), aspectRatio: 320 / 248, preferredWidth: 92, allowedSlots: ["deskRight"], interestTags: ["animales", "cafe"], minimumEngagementStage: 2, priority: 65, zIndex: 40 },
  catFrame: { canonicalSourceFilename: "Marco de madera con gato sereno.png", runtimeFilename: "cat-frame.png", source: require("../../../assets/space/runtime/cat-frame.png"), aspectRatio: 273 / 320, preferredWidth: 120, allowedSlots: ["detailLeft", "detailRight"], interestTags: ["animales", "arte"], minimumEngagementStage: 2, priority: 60, zIndex: 40 },
  peonies: { canonicalSourceFilename: "Ramo de peonías en jarrón cerámico.png", runtimeFilename: "peonies.png", source: require("../../../assets/space/runtime/peonies.png"), aspectRatio: 320 / 304, preferredWidth: 150, allowedSlots: ["detailRight", "floorRight"], interestTags: ["naturaleza", "hogar"], minimumEngagementStage: 2, priority: 75, zIndex: 50 },
  driedFlowers: { canonicalSourceFilename: "Arreglo seco en jarrón beige.png", runtimeFilename: "dried-flowers.png", source: require("../../../assets/space/runtime/dried-flowers.png"), aspectRatio: 241 / 320, preferredWidth: 135, allowedSlots: ["detailRight", "floorRight"], interestTags: ["naturaleza", "hogar"], minimumEngagementStage: 2, priority: 65, zIndex: 50 },
  perfume: { canonicalSourceFilename: "Perfume esférico rosa con tapón marfil.png", runtimeFilename: "perfume.png", source: require("../../../assets/space/runtime/perfume.png"), aspectRatio: 259 / 320, preferredWidth: 95, allowedSlots: ["deskRight"], interestTags: ["hogar"], minimumEngagementStage: 2, priority: 60, zIndex: 40 },
  vanityOrganizer: { canonicalSourceFilename: "Organizador de tocador en tonos cálidos.png", runtimeFilename: "vanity-organizer.png", source: require("../../../assets/space/runtime/vanity-organizer.png"), aspectRatio: 312 / 320, preferredWidth: 135, allowedSlots: ["deskRight"], interestTags: ["hogar"], minimumEngagementStage: 2, priority: 65, zIndex: 40 },
  floralNotebook: { canonicalSourceFilename: "Cuaderno floral con banda rosada.png", runtimeFilename: "floral-notebook.png", source: require("../../../assets/space/runtime/floral-notebook.png"), aspectRatio: 317 / 320, preferredWidth: 100, allowedSlots: ["deskLeft"], interestTags: ["libros", "arte"], minimumEngagementStage: 2, priority: 60, zIndex: 40 },
  jewelryBox: { canonicalSourceFilename: "Joyero oval de terciopelo rosado y dorado.png", runtimeFilename: "jewelry-box.png", source: require("../../../assets/space/runtime/jewelry-box.png"), aspectRatio: 320 / 227, preferredWidth: 115, allowedSlots: ["detailCenter", "deskRight"], interestTags: ["hogar"], minimumEngagementStage: 2, priority: 60, zIndex: 50 },
  vanityMirror: { canonicalSourceFilename: "Espejo de tocador dorado con base de piedra.png", runtimeFilename: "vanity-mirror.png", source: require("../../../assets/space/runtime/vanity-mirror.png"), aspectRatio: 225 / 320, preferredWidth: 115, allowedSlots: ["detailRight"], interestTags: ["arte", "hogar"], minimumEngagementStage: 2, priority: 65, zIndex: 40 },
};

const FURNITURE_ASSETS: ReadonlySet<AssetId> = new Set(["desk", "shelf"]);
const DETAIL_ASSETS: ReadonlySet<AssetId> = new Set([
  "mug", "gamepad", "moonLamp", "catFigurine", "scentedCandle", "candleTrio",
  "tarotDeck", "roseQuartz", "calicoCat", "catMug", "catFrame", "perfume",
  "floralNotebook", "jewelryBox",
]);

export function depthForAsset(assetId: AssetId): SpaceDepth {
  return { band: FURNITURE_ASSETS.has(assetId) ? "furniture" :
    DETAIL_ASSETS.has(assetId) ? "detail" : "object", zIndex: SPACE_ASSETS[assetId].zIndex };
}

export interface SpaceSceneObject {
  assetId: AssetId; slotId: SlotId; x: number; y: number; width: number; height: number;
  zIndex: number; depth: SpaceDepth; source: "anchor" | "interest" | "achievement" | "manual";
}
export interface SpaceScene {
  treatments: { atmosphereId: PersonalizationSelection["atmosphereId"];
    wallOpacity: number; floorOpacity: number; windowOpacity: number; ambientOpacity: number };
  objects: SpaceSceneObject[];
}

export function placeAsset(assetId: AssetId, slotId: SlotId, source: SpaceSceneObject["source"]): SpaceSceneObject {
  const asset = SPACE_ASSETS[assetId];
  const slot = SLOTS[slotId];
  if (!asset.allowedSlots.includes(slotId)) throw new Error(`Invalid slot ${slotId} for ${assetId}`);
  const width = Math.min(asset.preferredWidth, slot.maxWidth, slot.maxHeight * asset.aspectRatio);
  const height = width / asset.aspectRatio;
  return { assetId, slotId, x: slot.x - width / 2, y: slot.y - height,
    width, height, zIndex: asset.zIndex, depth: depthForAsset(assetId), source };
}

const assetsByInterest: Partial<Record<InterestId, readonly AssetId[]>> = {
  naturaleza: ["peonies", "driedFlowers", "roseQuartz", "plantSmall"],
  libros: ["shelf", "floralNotebook", "tarotDeck"],
  gaming: ["monitor", "gamepad"], musica: ["speakerVinyl"],
  animales: ["calicoCat", "catMug", "catFrame", "catFigurine"],
  cafe: ["mug", "catMug"],
  arte: ["tarotDeck", "catFrame", "floralNotebook", "vanityMirror"],
  noche: ["scentedCandle", "tarotDeck", "roseQuartz", "warmLamp", "candleTrio", "moonLamp"],
  tecnologia: ["monitor"],
  hogar: ["warmLamp", "vanityOrganizer", "jewelryBox", "vanityMirror", "perfume",
    "candleTrio", "driedFlowers", "scentedCandle", "deskLamp", "plantSmall"],
};
const paletteAffinity: Partial<Record<PersonalizationSelection["themeId"], readonly AssetId[]>> = {
  peonia: ["peonies", "calicoCat", "catMug", "roseQuartz", "jewelryBox", "perfume"],
  ciruela: ["tarotDeck", "roseQuartz", "candleTrio", "catFrame", "vanityMirror"],
  terracota: ["driedFlowers", "warmLamp", "scentedCandle", "vanityOrganizer"],
  arena: ["driedFlowers", "warmLamp", "vanityOrganizer", "vanityMirror"],
  noche: ["scentedCandle", "tarotDeck", "roseQuartz", "candleTrio", "warmLamp"],
};

function orderedForPalette(ids: readonly AssetId[], paletteId: PersonalizationSelection["themeId"]): AssetId[] {
  const preferred = paletteAffinity[paletteId] ?? [];
  return [...ids].sort((a, b) => Number(preferred.includes(b)) - Number(preferred.includes(a)) ||
    ids.indexOf(a) - ids.indexOf(b));
}

export function recommendationLabels(assetId: AssetId): string[] {
  return SPACE_ASSETS[assetId].interestTags.slice(0, 3).map(tag =>
    INTERESTS.find(interest => interest.id === tag)?.label ?? tag);
}

function rotate<T>(items: readonly T[], variant: number): T[] {
  if (!items.length) return [];
  const offset = variant % items.length;
  return [...items.slice(offset), ...items.slice(0, offset)];
}

export function resolveSpaceScene(stage: SpaceStage, selection: PersonalizationSelection,
  achievementUnlocks: readonly AchievementId[] = [], availableAssets?: ReadonlySet<AssetId>, variant = 0): SpaceScene {
  const minimal = selection.interestIds.includes("minimalismo") || selection.atmosphereId === "minimalista";
  const objects: SpaceSceneObject[] = [];
  const occupied = new Set<SlotId>();
  const selected = new Set<AssetId>();
  const add = (id: AssetId, source: SpaceSceneObject["source"]): boolean => {
    if (selected.has(id) || stage < SPACE_ASSETS[id].minimumEngagementStage ||
      (availableAssets && !availableAssets.has(id))) return false;
    const slot = SPACE_ASSETS[id].allowedSlots.find(candidate => !occupied.has(candidate));
    if (!slot) return false;
    objects.push(placeAsset(id, slot, source));
    occupied.add(slot); selected.add(id);
    return true;
  };
  if (stage >= 1) add("plantLarge", "anchor");
  if (stage >= 2) { add("desk", "anchor"); add("books", "anchor"); }
  let optional = 0;
  // A fourth detail can reinforce a selected interest without displacing the other three.
  const optionalLimit = minimal ? 1 : 4;
  if (stage >= 2) {
    const interestPools = selection.interestIds.map(interest =>
      rotate(orderedForPalette(assetsByInterest[interest] ?? [], selection.themeId), variant));
    // Give each selected interest a first choice, then fill free zones with companions.
    for (let index = 0; index < interestPools.length && optional < optionalLimit; index++) {
      if (interestPools[index].some(id => {
        if (!add(id, "interest")) return false;
        optional++;
        return true;
      })) continue;
    }
    for (let depth = 1; depth < 10 && optional < optionalLimit; depth++) {
      for (const pool of interestPools) {
        if (optional >= optionalLimit) break;
        const id = pool[depth];
        if (id && add(id, "interest")) optional++;
      }
    }
    const unlocked = [...new Set(achievementUnlocks)];
    const detailPool: AssetId[] = selection.atmosphereId === "nocturno"
      ? ["moonLamp", "plantSmall", "mug"] : ["mug", "plantSmall", "moonLamp"];
    let discovery = 0;
    const discoveryLimit = Math.min(unlocked.length, minimal ? 1 : 3);
    for (const id of rotate(detailPool, variant)) {
      if (discovery >= discoveryLimit) break;
      if (add(id, "achievement")) discovery++;
    }
  }
  objects.sort((a, b) => a.zIndex - b.zIndex || a.assetId.localeCompare(b.assetId));
  return {
    treatments: { atmosphereId: selection.atmosphereId,
      wallOpacity: selection.atmosphereId === "nocturno" ? 0.58 : 0.48,
      floorOpacity: 0.12, windowOpacity: selection.atmosphereId === "nocturno" ? 0.42 : 0.3,
      ambientOpacity: selection.atmosphereId === "calido" ? 0.12 : selection.atmosphereId === "nocturno" ? 0.09 : 0 },
    objects,
  };
}
