import type { AchievementId } from "@/domain/achievements";
import type { SpaceStage } from "@/domain/engagement";
import type { InterestId, PersonalizationSelection } from "@/domain/personalization";

export const SCENE_WIDTH = 1448;
export const SCENE_HEIGHT = 1086;

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
  "books" | "mug" | "gamepad" | "speakerVinyl" | "moonLamp" | "catFigurine";
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
};

export interface SpaceSceneObject {
  assetId: AssetId; slotId: SlotId; x: number; y: number; width: number; height: number;
  zIndex: number; source: "anchor" | "interest" | "achievement" | "manual";
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
    width, height, zIndex: asset.zIndex, source };
}

const primaryByInterest: Partial<Record<InterestId, AssetId>> = {
  naturaleza: "plantSmall", libros: "shelf", gaming: "monitor", musica: "speakerVinyl",
  animales: "catFigurine", cafe: "mug", noche: "moonLamp", tecnologia: "monitor", hogar: "deskLamp",
};

export function resolveSpaceScene(stage: SpaceStage, selection: PersonalizationSelection,
  achievementUnlocks: readonly AchievementId[] = [], availableAssets?: ReadonlySet<AssetId>): SpaceScene {
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
    for (const interest of selection.interestIds) {
      if (optional >= optionalLimit) break;
      const id = primaryByInterest[interest];
      if (id && add(id, "interest")) optional++;
    }
    if (optional < optionalLimit && selection.interestIds.includes("gaming") && add("gamepad", "interest")) optional++;
    if (optional < optionalLimit && selection.interestIds.includes("hogar") && add("plantSmall", "interest")) optional++;
    const unlocked = [...new Set(achievementUnlocks)];
    const detailPool: AssetId[] = selection.atmosphereId === "nocturno"
      ? ["moonLamp", "plantSmall", "mug"] : ["mug", "plantSmall", "moonLamp"];
    let discovery = 0;
    const discoveryLimit = Math.min(unlocked.length, minimal ? 1 : 3);
    for (const id of detailPool) {
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
