import type { SQLiteDatabase } from "expo-sqlite";

export const onboardingMigration = {
  version: 11,
  name: "011_onboarding",
  async up(db: SQLiteDatabase): Promise<void> {
    await db.execAsync(`
      CREATE TABLE onboarding_state (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        status TEXT NOT NULL CHECK (status IN ('active', 'completed', 'skipped', 'legacy')),
        step_id TEXT,
        updated_at TEXT NOT NULL
      );
      INSERT INTO onboarding_state (id, status, step_id, updated_at)
        SELECT 1, 'legacy', NULL, strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
        WHERE EXISTS (SELECT 1 FROM financial_profile WHERE id = 1);
    `);
  },
};
