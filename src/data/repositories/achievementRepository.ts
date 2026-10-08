import type { SQLiteDatabase } from "expo-sqlite";
import { ACHIEVEMENTS, type AchievementId } from "@/domain/achievements";

export async function listAchievementUnlocks(db: SQLiteDatabase) {
  return db.getAllAsync<{ achievement_id: AchievementId; unlocked_at: string }>(
    "SELECT achievement_id, unlocked_at FROM achievement_unlocks ORDER BY unlocked_at, achievement_id");
}

export async function unlockAchievement(db: SQLiteDatabase, id: AchievementId): Promise<boolean> {
  if (!ACHIEVEMENTS.some(item => item.id === id)) throw new Error("Unknown achievement");
  const result = await db.runAsync(
    "INSERT OR IGNORE INTO achievement_unlocks (achievement_id, unlocked_at) VALUES (?, ?)",
    id, new Date().toISOString());
  return result.changes === 1;
}
