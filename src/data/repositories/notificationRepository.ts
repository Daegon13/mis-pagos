import type { SQLiteDatabase } from "expo-sqlite";

export const NOTIFICATION_CATEGORIES = ["dueSoon", "overdue", "income", "planReview", "discoveries", "reengagement"] as const;
export type NotificationCategory = typeof NOTIFICATION_CATEGORIES[number];
export type NotificationPreferences = { enabled: boolean; startHour: number; endHour: number;
  categories: Record<NotificationCategory, boolean>; lastOpenedAt: string | null };

type Row = { enabled: number; due_soon: number; overdue: number; income: number; plan_review: number;
  discoveries: number; reengagement: number; start_hour: number; end_hour: number; last_opened_at: string | null };
const columns: Record<NotificationCategory, string> = { dueSoon: "due_soon", overdue: "overdue",
  income: "income", planReview: "plan_review", discoveries: "discoveries", reengagement: "reengagement" };

export async function getNotificationPreferences(db: SQLiteDatabase): Promise<NotificationPreferences> {
  const row = await db.getFirstAsync<Row>("SELECT * FROM notification_preferences WHERE id = 1");
  if (!row) throw new Error("Missing notification preferences");
  return { enabled: !!row.enabled, startHour: row.start_hour, endHour: row.end_hour,
    lastOpenedAt: row.last_opened_at, categories: { dueSoon: !!row.due_soon, overdue: !!row.overdue,
      income: !!row.income, planReview: !!row.plan_review, discoveries: !!row.discoveries,
      reengagement: !!row.reengagement } };
}
export async function setNotificationEnabled(db: SQLiteDatabase, enabled: boolean) {
  await db.runAsync("UPDATE notification_preferences SET enabled = ? WHERE id = 1", enabled ? 1 : 0);
}
export async function setNotificationCategory(db: SQLiteDatabase, category: NotificationCategory, enabled: boolean) {
  await db.runAsync(`UPDATE notification_preferences SET ${columns[category]} = ? WHERE id = 1`, enabled ? 1 : 0);
}
export async function setNotificationHours(db: SQLiteDatabase, startHour: number, endHour: number) {
  if (!Number.isInteger(startHour) || startHour < 7 || startHour > 18 || !Number.isInteger(endHour) ||
    endHour < 19 || endHour > 22 || startHour >= endHour) throw new Error("Horario no válido.");
  await db.runAsync("UPDATE notification_preferences SET start_hour = ?, end_hour = ? WHERE id = 1", startHour, endHour);
}
export async function markNotificationOpened(db: SQLiteDatabase, now: Date) {
  await db.runAsync("UPDATE notification_preferences SET last_opened_at = ? WHERE id = 1", now.toISOString());
}
export async function getNotificationDayHistory(db: SQLiteDatabase) {
  return db.getAllAsync<{ civil_date: string; scheduled_at: string }>("SELECT civil_date, scheduled_at FROM notification_days");
}
export async function recordNotificationDay(db: SQLiteDatabase, day: string, scheduledAt: Date) {
  await db.runAsync(`INSERT INTO notification_days (civil_date, scheduled_at) VALUES (?, ?)
    ON CONFLICT(civil_date) DO UPDATE SET scheduled_at = excluded.scheduled_at`, day, scheduledAt.toISOString());
}
