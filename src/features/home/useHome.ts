import { useCallback, useRef, useState } from "react";
import { AppState } from "react-native";
import { useFocusEffect } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";

import { readFinancialSnapshot } from "@/data/repositories/paymentLifecycle";
import { advanceSpace } from "@/data/repositories/engagementRepository";
import { spaceStage, type SpaceStage } from "@/domain/engagement";
import { calculateHome, type HomeSummary } from "./homeSummary";
import { getCurrentPlan } from "@/data/repositories/spendingPlanRepository";
import { deriveExistingAchievements } from "@/features/achievements/achievementService";
import { listAchievementUnlocks } from "@/data/repositories/achievementRepository";
import type { AchievementId } from "@/domain/achievements";
import { getSpaceVisualPreferences, listSlotOverrides, type StoredSlotOverride,
  type StoredVisualPreferences } from "@/data/repositories/spaceCustomizationRepository";

export function useHome(paymentSaved?: string) {
  const db = useSQLiteContext();
  const [summary, setSummary] = useState<HomeSummary | null>(null);
  const [planning, setPlanning] = useState<Awaited<ReturnType<typeof getCurrentPlan>>>(null);
  const [planningError, setPlanningError] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [stage, setStage] = useState<SpaceStage | null>(null);
  const [spaceError, setSpaceError] = useState(false);
  const [achievementCount, setAchievementCount] = useState<number | null>(null);
  const [achievementUnlocks, setAchievementUnlocks] = useState<AchievementId[]>([]);
  const [slotOverrides, setSlotOverrides] = useState<StoredSlotOverride[]>([]);
  const [visualPreferences, setVisualPreferences] = useState<StoredVisualPreferences>({ roomPaletteId: null, windowMoodId: null });
  const [surprise, setSurprise] = useState(false);
  const [feedback, setFeedback] = useState<{ id: string; availableMinor: number } | null>(null);
  const handledSave = useRef<string | null>(null);

  useFocusEffect(useCallback(() => {
    // A retry starts a fresh focus-scoped request cycle.
    void attempt;
    let active = true;
    let request = 0;
    async function load() {
      const current = ++request;
      try {
        const { payments, profile } = await readFinancialSnapshot(db);
        if (!profile) throw new Error("Missing financial profile");
        const next = calculateHome(profile.availableBalanceMinor, payments);
        if (active && current === request) {
          setSummary(next);
          setError(null);
          if (paymentSaved && handledSave.current !== paymentSaved) {
            handledSave.current = paymentSaved;
            setFeedback({ id: paymentSaved, availableMinor: next.availableMinor });
          }
        }
        if (!active || current !== request) return;
        try {
          const nextPlan = await getCurrentPlan(db);
          if (active && current === request) { setPlanning(nextPlan); setPlanningError(false); }
        } catch {
          if (active && current === request) { setPlanning(null); setPlanningError(true); }
        }
        // Cosmetic persistence must never block the financial summary.
        try {
          const progress = await advanceSpace(db, spaceStage(payments));
          if (active && current === request) {
            setStage((previous) => Math.max(previous ?? 0, progress.stage) as SpaceStage);
            setSpaceError(false);
            if (progress.surprise) setSurprise(true);
          }
        } catch {
          if (active && current === request) setSpaceError(true);
        }
        try {
          await deriveExistingAchievements(db);
          const unlocks = await listAchievementUnlocks(db);
          if (active && current === request) {
            setAchievementCount(unlocks.length);
            setAchievementUnlocks(unlocks.map(unlock => unlock.achievement_id));
          }
        } catch {
          if (active && current === request) { setAchievementCount(null); setAchievementUnlocks([]); }
        }
        try {
          const [slots, visual] = await Promise.all([listSlotOverrides(db), getSpaceVisualPreferences(db)]);
          if (active && current === request) { setSlotOverrides(slots); setVisualPreferences(visual); }
        } catch {
          if (active && current === request) { setSlotOverrides([]); setVisualPreferences({ roomPaletteId: null, windowMoodId: null }); }
        }
      } catch {
        if (active && current === request) {
          setSummary(null);
          setError("No pudimos cargar tus movimientos. Intentá de nuevo.");
        }
      }
    }
    void load();
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") void load();
    });
    // Refresh the civil horizon if Home remains open past midnight.
    const interval = setInterval(() => { void load(); }, 60_000);
    return () => { active = false; subscription.remove(); clearInterval(interval); };
  }, [db, attempt, paymentSaved]));

  const retry = () => { setError(null); setAttempt((value) => value + 1); };
  return { summary, planning, planningError, error, retry, stage, spaceError, surprise, achievementCount, achievementUnlocks,
    slotOverrides, visualPreferences,
    feedback: feedback?.id === paymentSaved ? feedback : null };
}
