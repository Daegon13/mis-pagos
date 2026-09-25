import { Stack } from "expo-router";
import { SQLiteProvider } from "expo-sqlite";

import { DATABASE_NAME, initializeDatabase } from "@/data/db/database";

export default function RootLayout() {
  return (
    <SQLiteProvider databaseName={DATABASE_NAME} onInit={initializeDatabase}>
      <Stack />
    </SQLiteProvider>
  );
}
