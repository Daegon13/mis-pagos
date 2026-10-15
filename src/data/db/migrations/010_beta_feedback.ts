import type { SQLiteDatabase } from "expo-sqlite";

export const betaFeedbackMigration = {
  version: 10,
  name: "010_beta_feedback",
  async up(db: SQLiteDatabase): Promise<void> {
    await db.execAsync(`
      CREATE TABLE beta_feedback_answers (
        question_id TEXT PRIMARY KEY,
        option_id TEXT NOT NULL,
        answered_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      CREATE TABLE beta_feedback_comment (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        body TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);
  },
};
