import { useCallback, useRef, useState } from "react";
import { AppState } from "react-native";
import { useFocusEffect } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";

import { listPayments } from "@/data/repositories/paymentRepository";
import { advanceSpace } from "@/data/repositories/engagementRepository";
import { spaceStage, type SpaceStage } from "@/domain/engagement";
import { calculateHome, type HomeSummary } from "./homeSummary";

export function useHome(balanceMinor: number, paymentSaved?: string) {
  const db = useSQLiteContext();
  const [summary, setSummary] = useState<HomeSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [stage, setStage] = useState<SpaceStage | null>(null);
  const [spaceError, setSpaceError] = useState(false);
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
        const payments = await listPayments(db);
        const next = calculateHome(balanceMinor, payments);
        if (active && current === request) {
          setSummary(next);
          setError(null);
          if (paymentSaved && handledSave.current !== paymentSaved) {
            handledSave.current = paymentSaved;
            setFeedback({ id: paymentSaved, availableMinor: next.availableMinor });
          }
        }
        if (!active || current !== request) return;
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
  }, [db, balanceMinor, attempt, paymentSaved]));

  const retry = () => { setError(null); setAttempt((value) => value + 1); };
  return { summary, error, retry, stage, spaceError, surprise,
    feedback: feedback?.id === paymentSaved ? feedback : null };
}
