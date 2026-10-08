import type { SQLiteDatabase } from "expo-sqlite";

export const spendingPlanMigration = {
  version: 4,
  name: "004_spending_plan",
  async up(db: SQLiteDatabase): Promise<void> {
    await db.execAsync(`
      CREATE TABLE spending_plans (
        id INTEGER PRIMARY KEY NOT NULL,
        period_start TEXT NOT NULL UNIQUE,
        period_end TEXT NOT NULL,
        reserve_mode TEXT NOT NULL CHECK (reserve_mode IN ('percentage', 'fixed')),
        reserve_percent_basis_points INTEGER CHECK (reserve_percent_basis_points BETWEEN 0 AND 10000),
        reserve_target_minor INTEGER NOT NULL CHECK (reserve_target_minor >= 0),
        created_from_available_minor INTEGER NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      CREATE TABLE spending_allocations (
        id INTEGER PRIMARY KEY NOT NULL,
        spending_plan_id INTEGER NOT NULL REFERENCES spending_plans(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        percentage_basis_points INTEGER NOT NULL CHECK (percentage_basis_points BETWEEN 0 AND 10000),
        sort_order INTEGER NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      CREATE INDEX spending_allocations_plan_idx ON spending_allocations(spending_plan_id, sort_order);
    `);
  },
};
