import { useEffect, useRef, useState } from "react";
import { AccessibilityInfo, Animated, BackHandler, Pressable, ScrollView, StyleSheet, Text, View, findNodeHandle } from "react-native";
import { formatBalance } from "@/features/financial-profile/money";
import type { ThemeTokens } from "@/features/personalization/themes";
import { DEMO, DEMO_STEPS, nextStep, type DemoStep } from "./onboardingFlow";

export function OnboardingDemo({ initialStep, replay, currencyCode, theme, onStep, onFinish, onSkip }: {
  initialStep: DemoStep;
  replay: boolean;
  currencyCode: string;
  theme: ThemeTokens;
  onStep: (step: DemoStep) => Promise<void>;
  onFinish: (register: boolean) => Promise<void>;
  onSkip: () => Promise<void>;
}) {
  const [step, setStep] = useState<DemoStep>(initialStep);
  const [revealed, setRevealed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reducedMotion, setReducedMotion] = useState(true);
  const lock = useRef(false);
  const scroll = useRef<ScrollView>(null);
  const heading = useRef<Text>(null);
  const [opacity] = useState(() => new Animated.Value(1));
  const money = (minor: number) => formatBalance(minor, currencyCode);
  const index = DEMO_STEPS.indexOf(step);

  useEffect(() => {
    let active = true;
    void AccessibilityInfo.isReduceMotionEnabled().then(value => { if (active) setReducedMotion(value); })
      .catch(() => { if (active) setReducedMotion(true); });
    const subscription = AccessibilityInfo.addEventListener("reduceMotionChanged", setReducedMotion);
    return () => { active = false; subscription.remove(); };
  }, []);

  useEffect(() => {
    if (reducedMotion) { opacity.setValue(1); return; }
    opacity.setValue(0);
    const animation = Animated.timing(opacity, { toValue: 1, duration: 240, useNativeDriver: true });
    animation.start();
    return () => animation.stop();
  }, [step, revealed, reducedMotion, opacity]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const node = findNodeHandle(heading.current);
      if (node !== null) AccessibilityInfo.setAccessibilityFocus(node);
    }, 100);
    return () => clearTimeout(timer);
  }, [step]);

  async function guarded(action: () => Promise<void>) {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError(null);
    try { await action(); }
    catch { setError("No pudimos guardar el progreso. Intentá de nuevo."); }
    finally { lock.current = false; setBusy(false); }
  }

  function changeStep(next: DemoStep) {
    void guarded(async () => {
      await onStep(next);
      setStep(next);
      setRevealed(false);
      scroll.current?.scrollTo({ y: 0, animated: false });
    });
  }

  function back() {
    if (index === 0) { void guarded(onSkip); return; }
    changeStep(DEMO_STEPS[index - 1]);
  }

  useEffect(() => {
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      if (!busy) back();
      return true;
    });
    return () => subscription.remove();
  });

  return <View style={[styles.screen, { backgroundColor: theme.background }]}>
  <ScrollView ref={scroll} style={styles.scroll} contentContainerStyle={styles.content}>
    <View style={styles.topRow}>
      <Text style={[styles.progress, { color: theme.textSecondary }]}>Paso {index + 2} de 6</Text>
      <Pressable accessibilityRole="button" accessibilityLabel={replay ? "Salir del tutorial y volver a Ayuda" : "Omitir tutorial"}
        accessibilityState={{ disabled: busy }} disabled={busy} onPress={() => { void guarded(onSkip); }} style={styles.topAction}>
        <Text style={[styles.link, { color: theme.primary }]}>{replay ? "Salir" : "Omitir tutorial"}</Text>
      </Pressable>
    </View>
    <Animated.View style={{ opacity }}>
      {step === "today" && <View style={styles.section}>
        <Text ref={heading} accessibilityRole="header" style={[styles.title, { color: theme.primary }]}>Tu dinero de hoy</Text>
        <Text style={[styles.body, { color: theme.textSecondary }]}>{replay ? "Empecemos con un saldo de ejemplo." : "Tu saldo ya quedó guardado. Para aprender, usemos un ejemplo distinto de tus datos."}</Text>
        <View style={[styles.hero, { backgroundColor: theme.primary }]}>
          <Text style={[styles.heroLabel, { color: theme.heroMuted }]}>Ejemplo · Hoy tenés</Text>
          <Text style={[styles.heroAmount, { color: theme.textOnPrimary }]}>{money(DEMO.balanceMinor)}</Text>
        </View>
        <ActionButton label="¿Qué representa?" theme={theme} busy={busy} onPress={() => setRevealed(true)} />
        {revealed && <Text accessibilityLiveRegion="polite" style={[styles.body, { color: theme.textPrimary }]}>Es el saldo registrado para hoy. Podés actualizarlo cuando cambie. Un gasto pendiente no modifica directamente este saldo.</Text>}
      </View>}
      {step === "commitments" && <View style={styles.section}>
        <Text ref={heading} accessibilityRole="header" style={[styles.title, { color: theme.primary }]}>Tus compromisos</Text>
        <Text style={[styles.demoTag, { color: theme.primary, backgroundColor: theme.primarySurface }]}>Ejemplo · no se guarda</Text>
        <Text style={[styles.body, { color: theme.textSecondary }]}>Imaginá que hoy tenés {money(DEMO.balanceMinor)} y sabés que pronto vence un gasto.</Text>
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.cardLabel, { color: theme.textSecondary }]}>Hoy tenés</Text>
          <Text style={[styles.amount, { color: theme.textPrimary }]}>{money(DEMO.balanceMinor)}</Text>
          <Text style={[styles.cardLabel, { color: theme.textSecondary }]}>Comprometido</Text>
          <Text accessibilityLiveRegion="polite" style={[styles.amount, { color: theme.primary }]}>{money(revealed ? DEMO.expenseMinor : 0)}</Text>
          {revealed && <Text style={[styles.body, { color: theme.textPrimary }]}>Alquiler · pendiente · vence dentro de 30 días</Text>}
        </View>
        <ActionButton label={revealed ? "Gasto de ejemplo agregado" : "Agregar gasto de ejemplo"} theme={theme} busy={busy} onPress={() => setRevealed(true)} />
      </View>}
      {step === "available" && <View style={styles.section}>
        <Text ref={heading} accessibilityRole="header" style={[styles.title, { color: theme.primary }]}>Disponible real</Text>
        <Text style={[styles.demoTag, { color: theme.primary, backgroundColor: theme.primarySurface }]}>Ejemplo · no se guarda</Text>
        <Text style={[styles.body, { color: theme.textSecondary }]}>Restamos los gastos pendientes vencidos y los de los próximos 30 días.</Text>
        <View style={[styles.hero, { backgroundColor: theme.primary }]}>
          <Text style={[styles.heroLabel, { color: theme.heroMuted }]}>{money(DEMO.balanceMinor)} − {money(DEMO.expenseMinor)}</Text>
          <Text accessibilityLiveRegion="polite" style={[styles.heroAmount, { color: theme.textOnPrimary }]}>{revealed ? `= ${money(DEMO.availableMinor)}` : "= ?"}</Text>
          {revealed && <Text style={[styles.heroLabel, { color: theme.heroMuted }]}>Esto te queda después de tus compromisos.</Text>}
        </View>
        <ActionButton label="Ver qué queda" theme={theme} busy={busy} onPress={() => setRevealed(true)} />
      </View>}
      {step === "projection" && <View style={styles.section}>
        <Text ref={heading} accessibilityRole="header" style={[styles.title, { color: theme.primary }]}>Proyección</Text>
        <Text style={[styles.demoTag, { color: theme.primary, backgroundColor: theme.primarySurface }]}>Ejemplo · no se guarda</Text>
        <View style={[styles.hero, { backgroundColor: theme.primary }]}>
          <Text style={[styles.heroLabel, { color: theme.heroMuted }]}>Disponible real</Text>
          <Text style={[styles.heroAmount, { color: theme.textOnPrimary }]}>{money(DEMO.availableMinor)}</Text>
        </View>
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.cardLabel, { color: theme.textSecondary }]}>Ingreso futuro: {money(DEMO.incomeMinor)}</Text>
          <Text accessibilityLiveRegion="polite" style={[styles.amount, { color: theme.primary }]}>Proyección: {money(revealed ? DEMO.projectionMinor : DEMO.availableMinor)}</Text>
        </View>
        <ActionButton label="Sumar ingreso futuro al ejemplo" theme={theme} busy={busy} onPress={() => setRevealed(true)} />
        {revealed && <Text style={[styles.body, { color: theme.textPrimary }]}>Ese ingreso todavía no llegó. Cambia la Proyección, pero no aumenta tu Disponible real de hoy.</Text>}
      </View>}
      {step === "action" && <View style={styles.section}>
        <Text ref={heading} accessibilityRole="header" style={[styles.title, { color: theme.primary }]}>Ya podés empezar</Text>
        <Text style={[styles.body, { color: theme.textSecondary }]}>Agregá un gasto o ingreso que tengas previsto. También podés explorar la app y hacerlo más tarde.</Text>
        <ActionButton label="Registrar mi primer movimiento" theme={theme} busy={busy} primary onPress={() => { void guarded(() => onFinish(true)); }} />
        <ActionButton label={replay ? "Volver a Ayuda" : "Explorar Mis Pagos"} theme={theme} busy={busy} onPress={() => { void guarded(() => onFinish(false)); }} />
      </View>}
    </Animated.View>
    {error && <Text accessibilityRole="alert" style={[styles.body, { color: theme.negative }]}>{error}</Text>}
  </ScrollView>
    <View style={[styles.navigation, { backgroundColor: theme.background }]}>
      <ActionButton label="Volver" theme={theme} busy={busy} onPress={back} />
      {step !== "action" && <ActionButton label="Seguir" theme={theme} busy={busy} primary onPress={() => changeStep(nextStep(step))} />}
    </View>
  </View>;
}

function ActionButton({ label, theme, busy, primary = false, onPress }: {
  label: string; theme: ThemeTokens; busy: boolean; primary?: boolean; onPress: () => void;
}) {
  return <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled: busy }} disabled={busy}
    onPress={onPress} style={[styles.button, { borderColor: theme.border }, primary && { backgroundColor: theme.primary, borderColor: theme.primary }]}>
    <Text style={[styles.buttonText, { color: primary ? theme.textOnPrimary : theme.primary }]}>{label}</Text>
  </Pressable>;
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scroll: { flex: 1 },
  content: { flexGrow: 1, width: "100%", maxWidth: 560, alignSelf: "center", padding: 24, gap: 20 },
  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  progress: { fontSize: 14, fontWeight: "600" },
  topAction: { minHeight: 48, justifyContent: "center", paddingHorizontal: 12 },
  link: { fontSize: 15, fontWeight: "600" },
  section: { gap: 18 },
  title: { fontSize: 30, lineHeight: 37, fontWeight: "700" },
  body: { fontSize: 17, lineHeight: 25 },
  demoTag: { alignSelf: "flex-start", paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10, fontSize: 14, fontWeight: "700" },
  hero: { padding: 22, borderRadius: 20, gap: 12 },
  heroLabel: { fontSize: 16, lineHeight: 24 },
  heroAmount: { fontSize: 31, lineHeight: 39, fontWeight: "700" },
  card: { padding: 20, borderRadius: 18, borderWidth: 1, gap: 10 },
  cardLabel: { fontSize: 15 },
  amount: { fontSize: 25, lineHeight: 32, fontWeight: "700" },
  button: { minHeight: 50, padding: 12, borderWidth: 1, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  buttonText: { fontSize: 16, lineHeight: 22, fontWeight: "700", textAlign: "center" },
  navigation: { width: "100%", maxWidth: 560, alignSelf: "center", paddingHorizontal: 24, paddingBottom: 24, gap: 10 },
});
