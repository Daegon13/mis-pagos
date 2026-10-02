import type { SQLiteDatabase } from "expo-sqlite";

import { initialMigration } from "./001_initial";
import { engagementMigration } from "./002_engagement";
import { personalizationMigration } from "./003_personalization";

type Migration = {
  readonly version: number;
  readonly name: string;
  readonly up: (db: SQLiteDatabase) => Promise<void>;
};

// Keep migrations ordered. Applied migrations are immutable and forward-only.
const migrations: readonly Migration[] = [initialMigration, engagementMigration, personalizationMigration];

export const DATABASE_VERSION = migrations[migrations.length - 1].version;

export async function runMigrations(db: SQLiteDatabase): Promise<void> {
  const result = await db.getFirstAsync<{ user_version: number }>(
    "PRAGMA user_version;",
  );

  if (result === null) {
    throw new Error("Unable to read the database schema version.");
  }

  const currentVersion = result.user_version;

  if (currentVersion > DATABASE_VERSION) {
    throw new Error(
      `Database schema version ${currentVersion} is newer than the supported version ${DATABASE_VERSION}.`,
    );
  }

  if (currentVersion === DATABASE_VERSION) {
    return;
  }

  for (const migration of migrations) {
    if (migration.version > currentVersion) {
      await db.withExclusiveTransactionAsync(async (txn) => {
        await migration.up(txn);
        await txn.execAsync(`PRAGMA user_version = ${migration.version};`);
      });
    }
  }
}
