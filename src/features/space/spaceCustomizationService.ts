import type { SQLiteDatabase } from "expo-sqlite";
import { listAchievementUnlocks } from "@/data/repositories/achievementRepository";
import { getSpaceStage } from "@/data/repositories/engagementRepository";
import { clearDecorationOverrides, clearRoomPaletteOverride, clearWindowMoodOverride,
  getSpaceVisualPreferences, listSlotOverrides, restoreSlotAutomatic, setRoomPaletteOverride,
  setSlotAssetOverride, setSlotEmpty, setWindowMoodOverride, setCustomSpaceColor,
  setAutomaticVariant, setDecorationMode } from "@/data/repositories/spaceCustomizationRepository";
import { capabilitiesFromUnlocks } from "@/domain/achievementRewards";
import { isAtmosphereId, isThemeId } from "@/domain/personalization";
import { isEditableSlotId, nextAutomaticVariant, normalizeSpaceColor, validateSlotChoice } from "./spaceCustomization";
import type { PersonalizationSelection } from "@/domain/personalization";

export async function chooseCustomColor(db: SQLiteDatabase, zone: "wall" | "ambient", input: string): Promise<void> {
  const color = normalizeSpaceColor(input);
  if (!color) throw new Error("Ingresá un color hexadecimal de 6 caracteres, por ejemplo #8D6FAA.");
  const capability = zone === "wall" ? "roomPaletteOverride" : "windowMoodOverride";
  if (!capabilitiesFromUnlocks((await listAchievementUnlocks(db)).map(row => row.achievement_id)).has(capability))
    throw new Error("Este color todavía no está desbloqueado.");
  await setCustomSpaceColor(db, zone, color);
}

export async function loadSpaceCustomization(db: SQLiteDatabase) {
  const [stage, unlockRows, overrides, visual] = await Promise.all([
    getSpaceStage(db), listAchievementUnlocks(db), listSlotOverrides(db), getSpaceVisualPreferences(db),
  ]);
  return { stage, unlocks: unlockRows.map(row => row.achievement_id), overrides, visual };
}

export async function tryAnotherCombination(db: SQLiteDatabase, selection: PersonalizationSelection): Promise<boolean> {
  let changed = false;
  await db.withExclusiveTransactionAsync(async tx => {
    const { stage, unlocks, visual } = await loadSpaceCustomization(tx);
    if (visual.decorationMode !== "automatic") return;
    const next = nextAutomaticVariant(stage, selection, unlocks, visual.automaticVariant);
    if (next === visual.automaticVariant) return;
    await setAutomaticVariant(tx, next);
    changed = true;
  });
  return changed;
}

export async function chooseDecorationMode(db: SQLiteDatabase, mode: "automatic" | "manual"): Promise<void> {
  await setDecorationMode(db, mode);
}

export async function chooseSlot(db: SQLiteDatabase, slotId: string, assetId: string | null): Promise<void> {
  await db.withExclusiveTransactionAsync(async tx => {
    const { stage, unlocks, overrides } = await loadSpaceCustomization(tx);
    validateSlotChoice(slotId, assetId, stage, unlocks, overrides);
    if (assetId === null) await setSlotEmpty(tx, slotId);
    else await setSlotAssetOverride(tx, slotId, assetId);
  });
}

export async function resetSlot(db: SQLiteDatabase, slotId: string): Promise<void> {
  if (!isEditableSlotId(slotId)) throw new Error("Zona desconocida.");
  await db.withExclusiveTransactionAsync(async tx => {
    const { stage, unlocks } = await loadSpaceCustomization(tx);
    validateSlotChoice(slotId, null, stage, unlocks, []);
    await restoreSlotAutomatic(tx, slotId);
  });
}

export async function resetDecoration(db: SQLiteDatabase): Promise<void> {
  await clearDecorationOverrides(db);
}

export async function choosePalette(db: SQLiteDatabase, paletteId: string | null): Promise<void> {
  if (paletteId !== null && !isThemeId(paletteId)) throw new Error("Paleta desconocida.");
  await db.withExclusiveTransactionAsync(async tx => {
    const unlocks = (await listAchievementUnlocks(tx)).map(row => row.achievement_id);
    if (!capabilitiesFromUnlocks(unlocks).has("roomPaletteOverride")) throw new Error("La paleta propia todavía no está desbloqueada.");
    if (paletteId === null) await clearRoomPaletteOverride(tx);
    else await setRoomPaletteOverride(tx, paletteId);
  });
}

export async function chooseWindowMood(db: SQLiteDatabase, moodId: string | null): Promise<void> {
  if (moodId !== null && !isAtmosphereId(moodId)) throw new Error("Ambiente desconocido.");
  await db.withExclusiveTransactionAsync(async tx => {
    const unlocks = (await listAchievementUnlocks(tx)).map(row => row.achievement_id);
    if (!capabilitiesFromUnlocks(unlocks).has("windowMoodOverride")) throw new Error("El ambiente de ventana todavía no está desbloqueado.");
    if (moodId === null) await clearWindowMoodOverride(tx);
    else await setWindowMoodOverride(tx, moodId);
  });
}
