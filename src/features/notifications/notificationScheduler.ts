import type { SQLiteDatabase } from "expo-sqlite";
import { Platform } from "react-native";
import { readFinancialSnapshot } from "@/data/repositories/paymentLifecycle";
import { getCurrentPlan } from "@/data/repositories/spendingPlanRepository";
import { listAchievementUnlocks } from "@/data/repositories/achievementRepository";
import { getNotificationDayHistory, getNotificationPreferences, markNotificationOpened,
  recordNotificationDay } from "@/data/repositories/notificationRepository";
import { planNotifications } from "./notificationPlan";

const PREFIX = "mispagos-local:";
let inFlight = Promise.resolve();

export function queueNotificationRefresh(db: SQLiteDatabase): void {
  inFlight = inFlight.then(() => refreshNotifications(db)).catch(error => {
    console.warn("No pudimos actualizar los recordatorios locales.", error);
  });
}

export async function refreshNotifications(db: SQLiteDatabase): Promise<void> {
  if (Platform.OS === "web") return;
  const Notifications = await import("expo-notifications");
  const now = new Date();
  const preferences = await getNotificationPreferences(db);
  const scheduled = (await Notifications.getAllScheduledNotificationsAsync())
    .filter(item => item.identifier.startsWith(PREFIX));
  const cancel = async (identifier: string) => Notifications.cancelScheduledNotificationAsync(identifier);
  if (!preferences.enabled) {
    await Promise.all(scheduled.map(item => cancel(item.identifier)));
    return;
  }
  const permission = await Notifications.getPermissionsAsync();
  if (!permission.granted) {
    await Promise.all(scheduled.map(item => cancel(item.identifier)));
    return;
  }
  if (Platform.OS === "android") await Notifications.setNotificationChannelAsync("recordatorios", {
    name: "Recordatorios", importance: Notifications.AndroidImportance.DEFAULT,
  });
  const [{ profile, payments }, plan, discoveries, history] = await Promise.all([
    readFinancialSnapshot(db), getCurrentPlan(db), listAchievementUnlocks(db), getNotificationDayHistory(db),
  ]);
  const pastDays = new Set(history.filter(item => Date.parse(item.scheduled_at) <= now.getTime())
    .map(item => item.civil_date));
  const desired = profile ? planNotifications({ now, payments, planEnd: plan?.plan.periodEnd ?? null,
    discoveries, preferences }).filter(item => !pastDays.has(item.day)) : [];
  const byId = new Map(scheduled.map(item => [item.identifier, item]));
  const wanted = new Set(desired.map(item => PREFIX + item.day));
  for (const old of scheduled) if (!wanted.has(old.identifier)) await cancel(old.identifier);
  for (const item of desired) {
    const identifier = PREFIX + item.day;
    const signature = `${item.category}|${item.title}|${item.body}|${item.at.toISOString()}`;
    if (byId.get(identifier)?.content.data?.signature === signature) continue;
    if (byId.has(identifier)) await cancel(identifier);
    await Notifications.scheduleNotificationAsync({ identifier,
      content: { title: item.title, body: item.body, data: { signature, category: item.category }, sound: "default" },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: item.at,
        ...(Platform.OS === "android" ? { channelId: "recordatorios" } : {}) },
    });
    await recordNotificationDay(db, item.day, item.at);
  }
  await markNotificationOpened(db, now);
}
