import type { SQLiteDatabase } from "expo-sqlite";
import {
  DEFAULT_SELECTION, normalizeStoredSelection, validateSelection,
  type PersonalizationPreferences, type PersonalizationSelection,
} from "@/domain/personalization";

type Row = {
  theme_id: string; interests_json: string; atmosphere_id: string;
  space_name: string; created_at: string; updated_at: string;
};

export async function getPersonalizationPreferences(db: SQLiteDatabase): Promise<PersonalizationPreferences> {
  const row = await db.getFirstAsync<Row>(
    "SELECT theme_id, interests_json, atmosphere_id, space_name, created_at, updated_at FROM personalization_preferences WHERE id = 1",
  );
  if (row === null) return { ...DEFAULT_SELECTION, interestIds: [], createdAt: "", updatedAt: "" };
  let storedInterests: unknown;
  try { storedInterests = JSON.parse(row.interests_json); } catch { storedInterests = []; }
  return {
    ...normalizeStoredSelection({ themeId: row.theme_id, interestIds: storedInterests,
      atmosphereId: row.atmosphere_id, spaceName: row.space_name }),
    createdAt: row.created_at, updatedAt: row.updated_at,
  };
}

export async function savePersonalizationPreferences(db: SQLiteDatabase, input: PersonalizationSelection) {
  const selection = validateSelection(input);
  const timestamp = new Date().toISOString();
  await db.runAsync(`INSERT INTO personalization_preferences
    (id, theme_id, interests_json, atmosphere_id, space_name, created_at, updated_at)
    VALUES (1, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      theme_id = excluded.theme_id, interests_json = excluded.interests_json,
      atmosphere_id = excluded.atmosphere_id, space_name = excluded.space_name,
      updated_at = excluded.updated_at`,
  selection.themeId, JSON.stringify(selection.interestIds), selection.atmosphereId,
  selection.spaceName, timestamp, timestamp);
  return getPersonalizationPreferences(db);
}
