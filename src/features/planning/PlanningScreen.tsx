import { useCallback, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useFocusEffect } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { SafeAreaView } from "react-native-safe-area-context";

import { readFinancialSnapshot } from "@/data/repositories/paymentLifecycle";
import { deleteCurrentPlan, getCurrentPlan, saveCurrentPlan } from "@/data/repositories/spendingPlanRepository";
import { localCivilDate } from "@/domain/paymentTiming";
import { allocationAmounts, monthPeriod, planAmounts, referencePace, remainingDays,
  reserveTarget, simulateSpending, type ReserveMode } from "@/domain/spendingPlan";
import { formatBalance, minorToInput, parseBalanceMinor } from "@/features/financial-profile/money";
import { calculateHome } from "@/features/home/homeSummary";
import { usePersonalization } from "@/features/personalization/PersonalizationProvider";

type DraftAllocation = { name: string; percent: string };

export function PlanningScreen({ onBack }: { onBack: () => void }) {
  const db = useSQLiteContext();
  const { theme } = usePersonalization();
  const [available, setAvailable] = useState<number | null>(null);
  const [currency, setCurrency] = useState("UYU");
  const [existing, setExisting] = useState<Awaited<ReturnType<typeof getCurrentPlan>>>(null);
  const [mode, setMode] = useState<ReserveMode>("percentage");
  const [value, setValue] = useState("20");
  const [reserveTouched, setReserveTouched] = useState(false);
  const [allocations, setAllocations] = useState<DraftAllocation[]>([]);
  const [spend, setSpend] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const today = localCivilDate();
  const period = monthPeriod(today);
  const days = remainingDays(today, period.periodEnd);
  const money = (amount: number) => formatBalance(amount, currency);

  const reload = useCallback(async () => {
    try {
      const [{ profile, payments }, current] = await Promise.all([readFinancialSnapshot(db), getCurrentPlan(db)]);
      if (!profile) throw new Error("Completá primero tu saldo inicial.");
      setAvailable(calculateHome(profile.availableBalanceMinor, payments).availableMinor);
      setCurrency(profile.currencyCode);
      setExisting(current);
      setReserveTouched(false);
      if (current) {
        setMode(current.plan.reserveMode);
        setValue(current.plan.reserveMode === "percentage"
          ? String((current.plan.reservePercentBasisPoints ?? 0) / 100)
          : minorToInput(current.plan.reserveTargetMinor));
        setAllocations(current.allocations.map(item => ({ name: item.name,
          percent: String(item.percentageBasisPoints / 100) })));
      } else { setMode("percentage"); setValue("20"); setAllocations([]); }
      setError(null);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No pudimos cargar tu plan."); }
    finally { setReady(true); }
  }, [db]);
  useFocusEffect(useCallback(() => { void reload(); }, [reload]));

  let target: number | null = null;
  let inputError: string | null = null;
  if (available !== null) {
    try {
      const parsed = mode === "fixed" ? parseBalanceMinor(value) : Number(value);
      if (parsed === null || !Number.isFinite(parsed) || (mode === "percentage" && !/^\d{1,3}$/.test(value)))
        throw new Error("Ingresá una reserva válida.");
      target = existing && !reserveTouched ? existing.plan.reserveTargetMinor
        : reserveTarget(available, mode, mode === "percentage" ? parsed * 100 : parsed);
    } catch { inputError = mode === "percentage" ? "Elegí un porcentaje entero entre 0% y 100%." : "Ingresá un monto válido desde cero."; }
  }
  const amounts = available !== null && target !== null ? planAmounts(available, target) : null;
  const allocationDraft = allocations.map(item => ({ name: item.name,
    percentageBasisPoints: /^\d{1,3}$/.test(item.percent) ? Number(item.percent) * 100 : -1 }));
  let allocationPreview: ReturnType<typeof allocationAmounts> | null = null;
  let allocationError: string | null = null;
  try { if (amounts) allocationPreview = allocationAmounts(amounts.freeToUseMinor, allocationDraft); }
  catch (cause) { allocationError = cause instanceof Error ? cause.message : "Revisá tus asignaciones."; }
  const hypothetical = parseBalanceMinor(spend);
  const simulation = available !== null && existing && hypothetical !== null && hypothetical > 0
    ? simulateSpending({ availableRealMinor: available, reserveTargetMinor: existing.plan.reserveTargetMinor,
      hypotheticalSpendMinor: hypothetical, remainingDays: days }) : null;
  const pace = amounts ? referencePace(amounts.freeToUseMinor, days) : null;

  async function save() {
    if (available === null || target === null || inputError || allocationError) {
      setError(inputError ?? allocationError ?? "Revisá el plan antes de guardarlo."); return;
    }
    setBusy(true); setError(null);
    try { await saveCurrentPlan(db, { mode, value: mode === "percentage" ? Number(value) * 100 : target,
      availableRealMinor: available, allocations: allocationDraft, reserveChanged: reserveTouched }, today); await reload(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "No pudimos guardar el plan."); }
    finally { setBusy(false); }
  }
  function confirmRemoval() {
    Alert.alert("Eliminar plan de este mes", "Se eliminarán la reserva y sus asignaciones. Tus movimientos y saldo no cambian.", [
      { text: "Cancelar", style: "cancel" }, { text: "Eliminar plan", style: "destructive", onPress: () => {
        setBusy(true);
        void deleteCurrentPlan(db, today).then(reload).catch(() => setError("No pudimos eliminar el plan."))
          .finally(() => setBusy(false));
      } },
    ]);
  }
  const updateAllocation = (index: number, change: Partial<DraftAllocation>) => setAllocations(previous =>
    previous.map((item, at) => at === index ? { ...item, ...change } : item));
  const action = (label: string, onPress: () => void, primary = false) =>
    <Pressable accessibilityRole="button" onPress={onPress} disabled={busy} style={[styles.action,
      { backgroundColor: primary ? theme.primary : theme.primarySurface }]}>
      <Text style={{ color: primary ? theme.textOnPrimary : theme.primary, fontWeight: "600" }}>{label}</Text>
    </Pressable>;

  return <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={["bottom"]}>
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
      <Text accessibilityRole="header" style={[styles.heading, { color: theme.textPrimary }]}>Planeá lo que querés conservar</Text>
      <Text style={{ color: theme.textSecondary }}>Tu disponible real ya descuenta tus compromisos conocidos. Elegí cuánto querés dejar intacto al terminar el mes.</Text>
      {!ready ? <Text>Cargando...</Text> : available === null ? <>{error && <Text accessibilityRole="alert">{error}</Text>}{action("Reintentar", () => void reload())}</> : <>
        <Text style={[styles.subhead, { color: theme.textPrimary }]}>Reserva de cierre · {period.periodEnd}</Text>
        <View style={styles.row}>
          {action("Porcentaje", () => { setMode("percentage"); setValue("20"); setReserveTouched(true); })}
          {action("Monto fijo", () => { setMode("fixed"); setValue(target === null ? "0" : minorToInput(target)); setReserveTouched(true); })}
        </View>
        {mode === "percentage" && <View style={styles.row}>{[0, 10, 20, 30].map(percent =>
          <Pressable key={percent} accessibilityRole="button" onPress={() => { setValue(String(percent)); setReserveTouched(true); }}
            style={[styles.chip, { borderColor: theme.border, backgroundColor: value === String(percent) ? theme.primarySurface : theme.surface }]}>
            <Text style={{ color: theme.textPrimary }}>{percent}%</Text>
          </Pressable>)}</View>}
        <TextInput accessibilityLabel={mode === "percentage" ? "Porcentaje de reserva" : "Monto de reserva"}
          value={value} onChangeText={text => { setValue(text); setReserveTouched(true); }} keyboardType="numeric" style={[styles.input,
            { color: theme.textPrimary, borderColor: theme.border, backgroundColor: theme.surface }]}
          placeholder={mode === "percentage" ? "0 a 100" : "Ej. 6000"} placeholderTextColor={theme.muted} />
        {inputError && <Text accessibilityRole="alert" style={{ color: theme.negative }}>{inputError}</Text>}
        {amounts && target !== null && <View style={[styles.card, { backgroundColor: theme.surface }]}>
          <Text style={{ color: theme.textSecondary }}>Disponible real: {money(available)}</Text>
          <Text style={{ color: theme.textSecondary }}>Reserva objetivo: {money(target)}</Text>
          <Text style={[styles.subhead, { color: theme.textPrimary }]}>Libre para usar: {money(amounts.freeToUseMinor)}</Text>
          {amounts.reserveShortfallMinor > 0 && <Text style={{ color: theme.textSecondary }}>
            Te faltan {money(amounts.reserveShortfallMinor)} para llegar a la reserva. Tu disponible real sigue siendo {money(available)}.
          </Text>}
          {pace && <Text style={{ color: theme.textSecondary }}>Ritmo de referencia: ≈ {money(pace.displayMinor)} por {pace.unit === "day" ? "día" : "semana"}.</Text>}
        </View>}
        <Text style={[styles.subhead, { color: theme.textPrimary }]}>Asignaciones opcionales</Text>
        <Text style={{ color: theme.textSecondary }}>Son una guía para repartir tu margen libre. No clasifican tus movimientos.</Text>
        {allocations.map((item, index) => <View key={index} style={styles.allocation}>
          <TextInput accessibilityLabel={`Nombre asignación ${index + 1}`} value={item.name}
            onChangeText={name => updateAllocation(index, { name })} placeholder="Nombre" placeholderTextColor={theme.muted}
            style={[styles.input, { flex: 2, color: theme.textPrimary, borderColor: theme.border, backgroundColor: theme.surface }]} />
          <TextInput accessibilityLabel={`Porcentaje asignación ${index + 1}`} value={item.percent}
            onChangeText={percent => updateAllocation(index, { percent })} keyboardType="numeric" placeholder="%" placeholderTextColor={theme.muted}
            style={[styles.input, { flex: 1, color: theme.textPrimary, borderColor: theme.border, backgroundColor: theme.surface }]} />
          {action("Quitar", () => setAllocations(previous => previous.filter((_, at) => at !== index)))}
          {allocationPreview?.[index] && <Text style={{ color: theme.textSecondary }}>{money(allocationPreview[index].amountMinor)}</Text>}
        </View>)}
        {allocationError && <Text accessibilityRole="alert" style={{ color: theme.negative }}>{allocationError}</Text>}
        {allocations.length < 6 && action("+ Agregar asignación", () => setAllocations(previous => [...previous, { name: "", percent: "" }]))}
        {error && <Text accessibilityRole="alert" style={{ color: theme.negative }}>{error}</Text>}
        {action(busy ? "Guardando..." : existing ? "Guardar cambios" : "Crear plan", () => void save(), true)}
        {existing && <>
          <Text style={[styles.subhead, { color: theme.textPrimary }]}>¿Puedo gastar esto?</Text>
          <Text style={{ color: theme.textSecondary }}>Simulá un gasto sin cambiar tu saldo, tus movimientos ni tu plan.</Text>
          <TextInput accessibilityLabel="Gasto hipotético" value={spend} onChangeText={setSpend}
            keyboardType="numeric" placeholder="Ej. 3000" placeholderTextColor={theme.muted}
            style={[styles.input, { color: theme.textPrimary, borderColor: theme.border, backgroundColor: theme.surface }]} />
          {simulation && <View accessibilityLiveRegion="polite" style={[styles.card, { backgroundColor: theme.surface }]}>
            <Text style={[styles.subhead, { color: theme.textPrimary }]}>{simulation.outcome === "withinFlexible"
              ? "Tus compromisos conocidos y tu reserva siguen cubiertos."
              : simulation.outcome === "usesReserve" ? "Tus compromisos conocidos siguen cubiertos, pero usarías parte de tu reserva."
                : "Este gasto superaría lo que hoy tenés realmente disponible después de tus compromisos."}</Text>
            {simulation.outcome === "exceedsAvailable" && <Text style={{ color: theme.textSecondary }}>Exceso: {money(simulation.excessAvailableMinor)}.</Text>}
            <Text style={{ color: theme.textSecondary }}>Libre para usar después: {money(simulation.freeToUseMinor)}.</Text>
            <Text style={{ color: theme.textSecondary }}>Faltante para la reserva: {money(simulation.reserveShortfallMinor)}.</Text>
            <Text style={{ color: theme.textSecondary }}>Nuevo ritmo de referencia: ≈ {money(simulation.resultingPace.displayMinor)} por {simulation.resultingPace.unit === "day" ? "día" : "semana"}.</Text>
          </View>}
          {spend.length > 0 && !simulation && <Text style={{ color: theme.textSecondary }}>Ingresá un gasto mayor que cero.</Text>}
          {action("Eliminar plan de este mes", confirmRemoval)}
        </>}
        {action("Volver", onBack)}
      </>}
    </ScrollView>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  content: { width: "100%", maxWidth: 560, alignSelf: "center", padding: 24, paddingBottom: 48, gap: 14 },
  heading: { fontSize: 24, fontWeight: "700" }, subhead: { fontSize: 18, fontWeight: "600" },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  action: { alignSelf: "flex-start", minHeight: 44, paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 12, justifyContent: "center" },
  chip: { paddingHorizontal: 14, paddingVertical: 10, minHeight: 44, borderWidth: 1, borderRadius: 12 },
  input: { minHeight: 48, borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, fontSize: 16 },
  card: { padding: 16, borderRadius: 16, gap: 8 },
  allocation: { flexDirection: "row", flexWrap: "wrap", gap: 8, alignItems: "center" },
});
