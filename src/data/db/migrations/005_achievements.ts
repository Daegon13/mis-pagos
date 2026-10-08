import type { SQLiteDatabase } from "expo-sqlite";

export const achievementsMigration = {
  version: 5,
  name: "005_achievements",
  async up(db: SQLiteDatabase): Promise<void> {
    await db.execAsync(`CREATE TABLE achievement_unlocks (
      achievement_id TEXT PRIMARY KEY NOT NULL,
      unlocked_at TEXT NOT NULL
    );`);
  },
};
