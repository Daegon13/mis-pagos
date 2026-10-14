import type { SQLiteDatabase } from "expo-sqlite";
import { unlockAchievement } from "@/data/repositories/achievementRepository";
import { getPersonalizationPreferences } from "@/data/repositories/personalizationRepository";
import { getCurrentPlan } from "@/data/repositories/spendingPlanRepository";
import { derivableAchievements, type AchievementId } from "@/domain/achievements";
import { readFinancialSnapshot } from "@/data/repositories/paymentLifecycle";
import { notificationDataChanged } from "@/data/notificationChanges";

// Cosmetic writes are deliberately outside financial transactions. A failed write
// can be retried on the next safe evaluation and cannot undo a completed action.
export async function attemptUnlock(db: SQLiteDatabase, id: AchievementId): Promise<"new" | "existing" | "failed"> {
  try { const fresh = await unlockAchievement(db, id); if (fresh) notificationDataChanged();
    return fresh ? "new" : "existing"; }
  catch { return "failed"; }
}

export async function tryUnlock(db: SQLiteDatabase, id: AchievementId): Promise<boolean> {
  return await attemptUnlock(db, id) === "new";
}

export async function deriveExistingAchievements(db: SQLiteDatabase): Promise<void> {
  const [{ payments }, plan, preferences] = await Promise.all([
    readFinancialSnapshot(db), getCurrentPlan(db), getPersonalizationPreferences(db),
  ]);
  for (const id of derivableAchievements(payments, plan !== null && plan.plan.reserveTargetMinor > 0, preferences)) {
    if (await unlockAchievement(db, id)) notificationDataChanged();
  }
}
