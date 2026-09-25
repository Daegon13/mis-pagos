import { useCallback, useEffect, useRef, useState } from "react";
import { useSQLiteContext } from "expo-sqlite";

import {
  getFinancialProfile,
  saveFinancialProfile,
} from "@/data/repositories/financialProfileRepository";
import type { FinancialProfile } from "@/domain/financialProfile";

export function useFinancialProfile() {
  const db = useSQLiteContext();
  const [profile, setProfile] = useState<FinancialProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const saving = useRef(false);

  useEffect(() => {
    let active = true;
    getFinancialProfile(db)
      .then((loaded) => {
        if (active) setProfile(loaded);
      })
      .catch(() => {
        if (active) setLoadError("No pudimos cargar tus datos. Intentá de nuevo.");
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => { active = false; };
  }, [db, loadAttempt]);

  const retry = useCallback(() => {
    setIsLoading(true);
    setLoadError(null);
    setLoadAttempt((attempt) => attempt + 1);
  }, []);

  const save = useCallback(async (currencyCode: string, availableBalanceMinor: number) => {
    if (saving.current) return;
    saving.current = true;
    setIsSaving(true);
    setSaveError(null);
    try {
      const today = new Date();
      const balanceDate = [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, "0"),
        String(today.getDate()).padStart(2, "0"),
      ].join("-");
      const saved = await saveFinancialProfile(db, {
        currencyCode, availableBalanceMinor, balanceDate,
      });
      setProfile(saved);
    } catch {
      setSaveError("No pudimos guardar tu saldo. Intentá de nuevo.");
    } finally {
      saving.current = false;
      setIsSaving(false);
    }
  }, [db]);

  return { profile, isLoading, isSaving, loadError, saveError, retry, save };
}
