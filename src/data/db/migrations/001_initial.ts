import type { SQLiteDatabase } from "expo-sqlite";

// Immutable once applied or published. Evolve the schema in a new migration.
export const initialMigration = {
  version: 1,
  name: "001_initial",
  async up(db: SQLiteDatabase): Promise<void> {
    // Financial dates are civil YYYY-MM-DD strings; audit timestamps are ISO UTC.
    await db.execAsync(`
      CREATE TABLE financial_profile (
        id INTEGER PRIMARY KEY NOT NULL CHECK (id = 1),
        currency_code TEXT NOT NULL CHECK (length(currency_code) = 3),
        available_balance_minor INTEGER NOT NULL
          CHECK (typeof(available_balance_minor) = 'integer'),
        balance_date TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE payments (
        id INTEGER PRIMARY KEY NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('expense', 'income')),
        title TEXT NOT NULL CHECK (length(trim(title)) > 0),
        amount_minor INTEGER NOT NULL
          CHECK (typeof(amount_minor) = 'integer' AND amount_minor > 0),
        due_date TEXT NOT NULL,
        status TEXT NOT NULL
          CHECK (status IN ('pending', 'completed', 'cancelled')),
        notes TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);
  },
};
