import type { SQLiteDatabase } from "expo-sqlite";

export const spaceColorsMigration = {
  version: 7,
  name: "007_space_colors",
  async up(db: SQLiteDatabase): Promise<void> {
    await db.execAsync(`
      ALTER TABLE space_visual_preferences ADD COLUMN wall_color TEXT;
      ALTER TABLE space_visual_preferences ADD COLUMN ambient_color TEXT;
    `);
  },
};
