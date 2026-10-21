import type { SQLiteDatabase } from "expo-sqlite";
import { DEMO_STEPS, type DemoStep, type OnboardingState, type OnboardingStatus } from "@/features/onboarding/onboardingFlow";

type Row = { status: string; step_id: string | null };

export async function getOnboardingState(db: SQLiteDatabase): Promise<OnboardingState | null> {
  const row = await db.getFirstAsync<Row>("SELECT status, step_id FROM onboarding_state WHERE id = 1");
  if (!row) return null;
  if (!["active", "completed", "skipped", "legacy"].includes(row.status)) throw new Error("Invalid onboarding state");
  if (row.step_id !== null && row.step_id !== "setup" && !DEMO_STEPS.includes(row.step_id as DemoStep))
    throw new Error("Invalid onboarding step");
  return { status: row.status as OnboardingStatus, stepId: row.step_id as OnboardingState["stepId"] };
}

export async function beginOnboarding(db: SQLiteDatabase): Promise<OnboardingState | null> {
  await db.runAsync("INSERT OR IGNORE INTO onboarding_state (id, status, step_id, updated_at) VALUES (1, 'active', 'setup', ?)", new Date().toISOString());
  return getOnboardingState(db);
}

export async function advanceOnboarding(db: SQLiteDatabase, step: DemoStep): Promise<OnboardingState | null> {
  await db.runAsync("UPDATE onboarding_state SET step_id = ?, updated_at = ? WHERE id = 1 AND status = 'active'",
    step, new Date().toISOString());
  return getOnboardingState(db);
}

export async function finishOnboarding(db: SQLiteDatabase, status: "completed" | "skipped"): Promise<OnboardingState | null> {
  await db.runAsync(`INSERT INTO onboarding_state (id, status, step_id, updated_at)
    VALUES (1, ?, NULL, ?) ON CONFLICT(id) DO UPDATE SET
      status = excluded.status, step_id = NULL, updated_at = excluded.updated_at
    WHERE onboarding_state.status = 'active'`, status, new Date().toISOString());
  return getOnboardingState(db);
}
