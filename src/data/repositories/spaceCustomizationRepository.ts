import type { SQLiteDatabase } from "expo-sqlite";

export type StoredSlotOverride = { slotId: string; assetId: string | null; updatedAt: string };
export type StoredVisualPreferences = { roomPaletteId: string | null; windowMoodId: string | null };

export async function listSlotOverrides(db: SQLiteDatabase): Promise<StoredSlotOverride[]> {
  const rows = await db.getAllAsync<{ slot_id: string; asset_id: string | null; updated_at: string }>(
    "SELECT slot_id, asset_id, updated_at FROM space_slot_overrides ORDER BY slot_id");
  return rows.map(row => ({ slotId: row.slot_id, assetId: row.asset_id, updatedAt: row.updated_at }));
}

async function upsertSlot(db: SQLiteDatabase, slotId: string, assetId: string | null): Promise<void> {
  const timestamp = new Date().toISOString();
  await db.runAsync(`INSERT INTO space_slot_overrides (slot_id, asset_id, updated_at)
    VALUES (?, ?, ?) ON CONFLICT(slot_id) DO UPDATE SET
    asset_id = excluded.asset_id, updated_at = excluded.updated_at`, slotId, assetId, timestamp);
}

export async function setSlotAssetOverride(db: SQLiteDatabase, slotId: string, assetId: string): Promise<void> {
  await upsertSlot(db, slotId, assetId);
}

export async function setSlotEmpty(db: SQLiteDatabase, slotId: string): Promise<void> {
  await upsertSlot(db, slotId, null);
}

export async function restoreSlotAutomatic(db: SQLiteDatabase, slotId: string): Promise<void> {
  await db.runAsync("DELETE FROM space_slot_overrides WHERE slot_id = ?", slotId);
}

export async function clearDecorationOverrides(db: SQLiteDatabase): Promise<void> {
  await db.runAsync("DELETE FROM space_slot_overrides");
}

export async function getSpaceVisualPreferences(db: SQLiteDatabase): Promise<StoredVisualPreferences> {
  const row = await db.getFirstAsync<{ room_palette_id: string | null; window_mood_id: string | null }>(
    "SELECT room_palette_id, window_mood_id FROM space_visual_preferences WHERE id = 1");
  if (!row) throw new Error("Missing space visual preferences");
  return { roomPaletteId: row.room_palette_id, windowMoodId: row.window_mood_id };
}

export async function setRoomPaletteOverride(db: SQLiteDatabase, paletteId: string): Promise<void> {
  await db.runAsync("UPDATE space_visual_preferences SET room_palette_id = ?, updated_at = ? WHERE id = 1",
    paletteId, new Date().toISOString());
}

export async function clearRoomPaletteOverride(db: SQLiteDatabase): Promise<void> {
  await db.runAsync("UPDATE space_visual_preferences SET room_palette_id = NULL, updated_at = ? WHERE id = 1",
    new Date().toISOString());
}

export async function setWindowMoodOverride(db: SQLiteDatabase, moodId: string): Promise<void> {
  await db.runAsync("UPDATE space_visual_preferences SET window_mood_id = ?, updated_at = ? WHERE id = 1",
    moodId, new Date().toISOString());
}

export async function clearWindowMoodOverride(db: SQLiteDatabase): Promise<void> {
  await db.runAsync("UPDATE space_visual_preferences SET window_mood_id = NULL, updated_at = ? WHERE id = 1",
    new Date().toISOString());
}
