import { useEffect } from "react";
import { usePathname } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { AppState, Platform } from "react-native";
import { queueNotificationRefresh } from "./notificationScheduler";
import { subscribeNotificationChanges } from "@/data/notificationChanges";

export function NotificationCoordinator() {
  const db = useSQLiteContext();
  const path = usePathname();
  useEffect(() => {
    if (Platform.OS === "web") return;
    queueNotificationRefresh(db);
    return subscribeNotificationChanges(() => queueNotificationRefresh(db));
  }, [db]);
  useEffect(() => { if (Platform.OS !== "web") queueNotificationRefresh(db); }, [db, path]);
  useEffect(() => {
    if (Platform.OS === "web") return;
    const subscription = AppState.addEventListener("change", state => {
      if (state === "active") queueNotificationRefresh(db);
    });
    return () => subscription.remove();
  }, [db]);
  return null;
}
