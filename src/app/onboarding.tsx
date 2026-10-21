import { Redirect, Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { SafeAreaView } from "react-native-safe-area-context";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useFinancialProfile } from "@/features/financial-profile/useFinancialProfile";
import { usePersonalization } from "@/features/personalization/PersonalizationProvider";
import { getOnboardingState, advanceOnboarding, finishOnboarding } from "@/data/repositories/onboardingRepository";
import { resumeStep, type DemoStep, type OnboardingState } from "@/features/onboarding/onboardingFlow";
import { OnboardingDemo } from "@/features/onboarding/OnboardingDemo";
import { useEffect, useState } from "react";

export default function OnboardingRoute() {
  const router = useRouter();
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const replay = mode === "replay";
  const db = useSQLiteContext();
  const { theme } = usePersonalization();
  const { profile, isLoading: profileLoading, loadError: profileError, retry: retryProfile } = useFinancialProfile();
  const [state, setState] = useState<OnboardingState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    getOnboardingState(db).then(value => { if (active) { setState(value); setError(false); } })
      .catch(() => { if (active) setError(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [db, attempt]);

  async function move(step: DemoStep) {
    if (replay) return;
    const updated = await advanceOnboarding(db, step);
    if (updated?.status !== "active") throw new Error("Onboarding no longer active");
    setState(updated);
  }

  async function exit(completed: boolean, register = false) {
    if (replay) {
      if (register) router.replace("/payments/new");
      else router.dismissTo("/help");
      return;
    }
    const updated = await finishOnboarding(db, completed ? "completed" : "skipped");
    if (updated?.status !== (completed ? "completed" : "skipped")) throw new Error("Unable to finish onboarding");
    if (register) router.replace("/payments/new");
    else router.replace("/");
  }

  if (!loading && !profileLoading && !error && !profileError && (!profile || (!replay && state?.status !== "active")))
    return <Redirect href="/" />;

  return <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
    <Stack.Screen options={{ headerShown: false }} />
    {loading || profileLoading ? <Text style={[styles.message, { color: theme.textSecondary }]}>Cargando tutorial...</Text>
      : error || profileError ? <View style={styles.error}>
        <Text accessibilityRole="alert" style={[styles.message, { color: theme.textPrimary }]}>{profileError || "No pudimos cargar el tutorial."}</Text>
        <Pressable accessibilityRole="button" onPress={() => { retryProfile(); setLoading(true); setAttempt(value => value + 1); }} style={styles.retry}>
          <Text style={{ color: theme.primary }}>Reintentar</Text>
        </Pressable>
      </View> : profile && <OnboardingDemo key={replay ? "replay" : "first"} initialStep={replay ? "today" : resumeStep(state)}
        replay={replay} theme={theme} currencyCode={profile.currencyCode}
        onStep={move} onFinish={register => exit(true, register)} onSkip={() => exit(false)} />}
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  container: { flex: 1 }, message: { padding: 24, fontSize: 17 }, error: { padding: 24, gap: 12 },
  retry: { minHeight: 48, justifyContent: "center" },
});
