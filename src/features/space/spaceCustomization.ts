import type { AchievementId } from "@/domain/achievements";
import { capabilitiesFromUnlocks, EDITABLE_SPACE_SLOTS, type EditableSlotId } from "@/domain/achievementRewards";
import type { SpaceStage } from "@/domain/engagement";
import { isAtmosphereId, isThemeId, type PersonalizationSelection } from "@/domain/personalization";
import type { StoredSlotOverride, StoredVisualPreferences } from "@/data/repositories/spaceCustomizationRepository";
import { placeAsset, resolveSpaceScene, SPACE_ASSETS, type AssetId, type SpaceScene } from "./spaceScene";

export const STRUCTURAL_ASSETS: ReadonlySet<AssetId> = new Set(["plantLarge", "desk", "books"]);
export const EMPTY_VISUAL_PREFERENCES: StoredVisualPreferences = { roomPaletteId: null, windowMoodId: null };

export function isEditableSlotId(value: string): value is EditableSlotId {
  return EDITABLE_SPACE_SLOTS.some(slot => slot.id === value);
}

export function isAssetId(value: string): value is AssetId {
  return Object.prototype.hasOwnProperty.call(SPACE_ASSETS, value);
}

export function eligibleAssetsForSlot(slotId: EditableSlotId, stage: SpaceStage): AssetId[] {
  if (stage < 2) return [];
  return (Object.keys(SPACE_ASSETS) as AssetId[]).filter(id => !STRUCTURAL_ASSETS.has(id) &&
    SPACE_ASSETS[id].allowedSlots.includes(slotId) && SPACE_ASSETS[id].minimumEngagementStage <= stage);
}

export function validateSlotChoice(slotId: string, assetId: string | null, stage: SpaceStage,
  unlocks: readonly AchievementId[], existing: readonly StoredSlotOverride[]): asserts slotId is EditableSlotId {
  if (!isEditableSlotId(slotId)) throw new Error("Zona desconocida.");
  const capability = EDITABLE_SPACE_SLOTS.find(slot => slot.id === slotId)?.capabilityId;
  if (!capability || !capabilitiesFromUnlocks(unlocks).has(capability)) throw new Error("Este control todavía no está desbloqueado.");
  if (stage < 2) throw new Error("La decoración se habilita cuando aparece el escritorio.");
  if (assetId === null) return;
  if (!isAssetId(assetId) || !eligibleAssetsForSlot(slotId, stage).includes(assetId))
    throw new Error("Ese objeto no corresponde a esta zona.");
  if (existing.some(row => row.slotId !== slotId && row.assetId === assetId))
    throw new Error("Ese objeto ya está elegido en otra zona.");
}

export function effectiveAppearance(selection: PersonalizationSelection, unlocks: readonly AchievementId[],
  visual: StoredVisualPreferences) {
  const capabilities = capabilitiesFromUnlocks(unlocks);
  return {
    paletteId: capabilities.has("roomPaletteOverride") && isThemeId(visual.roomPaletteId)
      ? visual.roomPaletteId : selection.themeId,
    moodId: capabilities.has("windowMoodOverride") && isAtmosphereId(visual.windowMoodId)
      ? visual.windowMoodId : selection.atmosphereId,
  };
}

export function resolveFinalSpaceScene(stage: SpaceStage, selection: PersonalizationSelection,
  unlocks: readonly AchievementId[], overrides: readonly StoredSlotOverride[] = [],
  visual: StoredVisualPreferences = EMPTY_VISUAL_PREFERENCES): SpaceScene {
  const automatic = resolveSpaceScene(stage, selection, unlocks);
  const capabilities = capabilitiesFromUnlocks(unlocks);
  const applied = new Map<EditableSlotId, AssetId | null>();
  const used = new Set<AssetId>();
  for (const row of overrides) {
    if (!isEditableSlotId(row.slotId) || applied.has(row.slotId)) continue;
    const capability = EDITABLE_SPACE_SLOTS.find(slot => slot.id === row.slotId)?.capabilityId;
    if (!capability || !capabilities.has(capability) || stage < 2) continue;
    if (row.assetId !== null) {
      if (!isAssetId(row.assetId) || !eligibleAssetsForSlot(row.slotId, stage).includes(row.assetId) ||
        used.has(row.assetId)) continue;
      used.add(row.assetId);
    }
    applied.set(row.slotId, row.assetId);
  }
  const objects = automatic.objects.filter(object => !applied.has(object.slotId as EditableSlotId) &&
    !used.has(object.assetId));
  for (const [slotId, assetId] of applied) {
    if (assetId !== null) objects.push(placeAsset(assetId, slotId, "manual"));
  }
  objects.sort((a, b) => a.zIndex - b.zIndex || a.assetId.localeCompare(b.assetId));
  const { moodId } = effectiveAppearance(selection, unlocks, visual);
  const treatments = moodId === selection.atmosphereId ? automatic.treatments :
    resolveSpaceScene(stage, { ...selection, atmosphereId: moodId }, unlocks).treatments;
  return { treatments, objects };
}
