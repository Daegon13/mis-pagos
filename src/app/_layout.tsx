import { Stack } from "expo-router";
import { SQLiteProvider } from "expo-sqlite";
import { StatusBar } from "expo-status-bar";

import { DATABASE_NAME, initializeDatabase } from "@/data/db/database";
import { PersonalizationProvider, usePersonalization } from "@/features/personalization/PersonalizationProvider";

function ThemedNavigation() {
  const { theme } = usePersonalization();
  return <>
    <StatusBar style="dark" />
    <Stack screenOptions={{ contentStyle: { backgroundColor: theme.background },
      headerStyle: { backgroundColor: theme.background }, headerTintColor: theme.primary }} />
  </>;
}

export default function RootLayout() {
  return (
    <SQLiteProvider databaseName={DATABASE_NAME} onInit={initializeDatabase}>
      <PersonalizationProvider><ThemedNavigation /></PersonalizationProvider>
    </SQLiteProvider>
  );
}
