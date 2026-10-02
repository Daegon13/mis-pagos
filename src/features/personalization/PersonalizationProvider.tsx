import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react";
import { useSQLiteContext } from "expo-sqlite";

import { getPersonalizationPreferences, savePersonalizationPreferences } from "@/data/repositories/personalizationRepository";
import { DEFAULT_SELECTION, type PersonalizationPreferences, type PersonalizationSelection } from "@/domain/personalization";
import { themeFor } from "./themes";

type ContextValue = {
  preferences: PersonalizationPreferences;
  theme: ReturnType<typeof themeFor>;
  error: boolean;
  reload: () => void;
  save: (selection: PersonalizationSelection) => Promise<void>;
};

const PersonalizationContext = createContext<ContextValue | null>(null);
const defaultPreferences: PersonalizationPreferences = {
  ...DEFAULT_SELECTION, interestIds: [], createdAt: "", updatedAt: "",
};

export function PersonalizationProvider({ children }: PropsWithChildren) {
  const db = useSQLiteContext();
  const [preferences, setPreferences] = useState(defaultPreferences);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    getPersonalizationPreferences(db)
      .then((saved) => { if (active) { setPreferences(saved); setError(false); } })
      .catch(() => { if (active) setError(true); });
    return () => { active = false; };
  }, [db, attempt]);
  const reload = useCallback(() => setAttempt((value) => value + 1), []);
  const save = useCallback(async (selection: PersonalizationSelection) => {
    const saved = await savePersonalizationPreferences(db, selection);
    setPreferences(saved);
    setError(false);
  }, [db]);
  const value = useMemo(() => ({ preferences, theme: themeFor(preferences.themeId),
    error, reload, save }), [preferences, error, reload, save]);
  return <PersonalizationContext.Provider value={value}>{children}</PersonalizationContext.Provider>;
}

export function usePersonalization() {
  const value = useContext(PersonalizationContext);
  if (value === null) throw new Error("Missing PersonalizationProvider");
  return value;
}
