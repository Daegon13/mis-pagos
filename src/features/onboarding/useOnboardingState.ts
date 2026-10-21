import { useCallback, useEffect, useRef, useState } from "react";
import { useSQLiteContext } from "expo-sqlite";
import { beginOnboarding, finishOnboarding, getOnboardingState } from "@/data/repositories/onboardingRepository";
import type { OnboardingState } from "./onboardingFlow";

export function useOnboardingState() {
  const db = useSQLiteContext();
  const [state, setState] = useState<OnboardingState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const saving = useRef(false);

  useEffect(() => {
    let active = true;
    getOnboardingState(db).then(value => { if (active) { setState(value); setError(null); } })
      .catch(() => { if (active) setError("No pudimos cargar el tutorial. Intentá de nuevo."); })
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, [db, attempt]);

  const retry = useCallback(() => { setIsLoading(true); setError(null); setAttempt(value => value + 1); }, []);
  const choose = useCallback(async (skip: boolean) => {
    if (saving.current) return;
    saving.current = true;
    setIsSaving(true);
    setError(null);
    try { setState(skip ? await finishOnboarding(db, "skipped") : await beginOnboarding(db)); }
    catch { setError("No pudimos guardar tu elección. Intentá de nuevo."); }
    finally { saving.current = false; setIsSaving(false); }
  }, [db]);

  return { state, isLoading, isSaving, error, retry, choose };
}
