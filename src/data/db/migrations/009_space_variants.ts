import type { SQLiteDatabase } from "expo-sqlite";

export const spaceVariantsMigration = {
  version: 9,
  name: "009_space_variants",
  async up(db: SQLiteDatabase): Promise<void> {
    await db.execAsync(`
      ALTER TABLE space_visual_preferences ADD COLUMN automatic_variant INTEGER NOT NULL DEFAULT 0;
      ALTER TABLE space_visual_preferences ADD COLUMN decoration_mode TEXT NOT NULL DEFAULT 'automatic'
        CHECK (decoration_mode IN ('automatic', 'manual'));
      UPDATE space_visual_preferences SET decoration_mode = 'manual'
        WHERE EXISTS (SELECT 1 FROM space_slot_overrides);
    `);
  },
};
