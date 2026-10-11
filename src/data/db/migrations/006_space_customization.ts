import type { SQLiteDatabase } from "expo-sqlite";

export const spaceCustomizationMigration = {
  version: 6,
  name: "006_space_customization",
  async up(db: SQLiteDatabase): Promise<void> {
    await db.execAsync(`
      CREATE TABLE space_slot_overrides (
        slot_id TEXT PRIMARY KEY NOT NULL,
        asset_id TEXT,
        updated_at TEXT NOT NULL
      );
      CREATE TABLE space_visual_preferences (
        id INTEGER PRIMARY KEY NOT NULL CHECK (id = 1),
        room_palette_id TEXT,
        window_mood_id TEXT,
        updated_at TEXT NOT NULL
      );
      INSERT INTO space_visual_preferences (id, room_palette_id, window_mood_id, updated_at)
      VALUES (1, NULL, NULL, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'));
    `);
  },
};
