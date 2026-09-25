import type { SQLiteDatabase } from "expo-sqlite";

import { runMigrations } from "./migrations";

export const DATABASE_NAME = "mis-pagos.db";

export async function initializeDatabase(db: SQLiteDatabase): Promise<void> {
  await db.execAsync("PRAGMA foreign_keys = ON;");
  await db.execAsync("PRAGMA journal_mode = WAL;");
  await runMigrations(db);
}
