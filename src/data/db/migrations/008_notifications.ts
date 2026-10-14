import type { SQLiteDatabase } from "expo-sqlite";

export const notificationsMigration = {
  version: 8,
  name: "008_notifications",
  async up(db: SQLiteDatabase): Promise<void> {
    await db.execAsync(`
      CREATE TABLE notification_preferences (
        id INTEGER PRIMARY KEY NOT NULL CHECK (id = 1),
        enabled INTEGER NOT NULL DEFAULT 0 CHECK (enabled IN (0, 1)),
        due_soon INTEGER NOT NULL DEFAULT 1 CHECK (due_soon IN (0, 1)),
        overdue INTEGER NOT NULL DEFAULT 1 CHECK (overdue IN (0, 1)),
        income INTEGER NOT NULL DEFAULT 1 CHECK (income IN (0, 1)),
        plan_review INTEGER NOT NULL DEFAULT 1 CHECK (plan_review IN (0, 1)),
        discoveries INTEGER NOT NULL DEFAULT 1 CHECK (discoveries IN (0, 1)),
        reengagement INTEGER NOT NULL DEFAULT 1 CHECK (reengagement IN (0, 1)),
        start_hour INTEGER NOT NULL DEFAULT 9 CHECK (start_hour BETWEEN 7 AND 18),
        end_hour INTEGER NOT NULL DEFAULT 20 CHECK (end_hour BETWEEN 19 AND 22),
        last_opened_at TEXT
      );
      INSERT INTO notification_preferences (id) VALUES (1);
      CREATE TABLE notification_days (
        civil_date TEXT PRIMARY KEY NOT NULL,
        scheduled_at TEXT NOT NULL
      );
    `);
  },
};
