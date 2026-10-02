import type { SQLiteDatabase } from "expo-sqlite";

export const personalizationMigration = {
  version: 3,
  name: "003_personalization",
  async up(db: SQLiteDatabase): Promise<void> {
    await db.execAsync(`
      CREATE TABLE personalization_preferences (
        id INTEGER PRIMARY KEY NOT NULL CHECK (id = 1),
        theme_id TEXT NOT NULL,
        interests_json TEXT NOT NULL,
        atmosphere_id TEXT NOT NULL,
        space_name TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      INSERT INTO personalization_preferences
        (id, theme_id, interests_json, atmosphere_id, space_name, created_at, updated_at)
      VALUES (1, 'bosque', '[]', 'natural', '',
        strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now'));
    `);
  },
};
