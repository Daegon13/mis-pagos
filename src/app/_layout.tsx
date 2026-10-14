import { Stack } from "expo-router";
import { SQLiteProvider } from "expo-sqlite";
import { StatusBar } from "expo-status-bar";

import { DATABASE_NAME, initializeDatabase } from "@/data/db/database";
import { PersonalizationProvider, usePersonalization } from "@/features/personalization/PersonalizationProvider";
import { NotificationCoordinator } from "@/features/notifications/NotificationCoordinator";

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
      <PersonalizationProvider><NotificationCoordinator /><ThemedNavigation /></PersonalizationProvider>
    </SQLiteProvider>
  );
}
