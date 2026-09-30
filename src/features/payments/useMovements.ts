import { useCallback, useRef, useState } from "react";
import { AppState } from "react-native";
import { useFocusEffect } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";

import { readFinancialSnapshot } from "@/data/repositories/paymentLifecycle";

export function useMovements() {
  const db = useSQLiteContext();
  const [data, setData] = useState<Awaited<ReturnType<typeof readFinancialSnapshot>> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  useFocusEffect(useCallback(() => {
    void attempt;
    let active = true;
    let request = 0;
    async function load() {
      const current = ++request;
      try {
        const next = await readFinancialSnapshot(db);
        if (active && request === current) { setData(next); setError(null); }
      } catch {
        if (active && request === current) setError("No pudimos cargar tus movimientos. Intentá de nuevo.");
      }
    }
    void load();
    const subscription = AppState.addEventListener("change", state => { if (state === "active") void load(); });
    const timer = setInterval(() => { void load(); }, 60_000);
    return () => { active = false; subscription.remove(); clearInterval(timer); };
  }, [db, attempt]));
  return { db, data, error, reload: () => setAttempt(value => value + 1) };
}

export function useMovementAction() {
  const lock = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  async function run(action: () => Promise<string>, onSuccess?: () => void) {
    if (lock.current) return;
    lock.current = true;
    setBusy(true); setError(null); setFeedback(null);
    try {
      const message = await action();
      setFeedback(message);
      onSuccess?.();
    } catch {
      setError("No pudimos guardar el cambio. Intentá de nuevo.");
    } finally { lock.current = false; setBusy(false); }
  }
  return { busy, error, feedback, run };
}
