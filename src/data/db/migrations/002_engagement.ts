import type { SQLiteDatabase } from "expo-sqlite";

export const engagementMigration = {
  version: 2,
  name: "002_engagement",
  async up(db: SQLiteDatabase): Promise<void> {
    await db.execAsync(`
      CREATE TABLE engagement_progress (
        id INTEGER PRIMARY KEY NOT NULL CHECK (id = 1),
        stage INTEGER NOT NULL CHECK (typeof(stage) = 'integer' AND stage BETWEEN 0 AND 2)
      );
      INSERT INTO engagement_progress (id, stage) VALUES (1, 0);
    `);
  },
};
