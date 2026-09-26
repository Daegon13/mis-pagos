import { useCallback, useState } from "react";
import { AppState } from "react-native";
import { useFocusEffect } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";

import { listPayments } from "@/data/repositories/paymentRepository";
import { calculateHome, type HomeSummary } from "./homeSummary";

export function useHome(balanceMinor: number) {
  const db = useSQLiteContext();
  const [summary, setSummary] = useState<HomeSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

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
  }, [db, balanceMinor, attempt]));

  const retry = () => { setError(null); setAttempt((value) => value + 1); };
  return { summary, error, retry };
}
