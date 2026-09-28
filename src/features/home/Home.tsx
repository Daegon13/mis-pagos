import { Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";

import type { FinancialProfile } from "@/domain/financialProfile";
import { formatBalance } from "@/features/financial-profile/money";
import { useHome } from "./useHome";
import { financialFeedback } from "./homeFeedback";
import { LivingSpace } from "./LivingSpace";

const months = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];

export function Home({ profile, onAdd, paymentSaved, onDismissFeedback }: {
  profile: FinancialProfile; onAdd: () => void; paymentSaved?: string; onDismissFeedback: () => void;
}) {
  const { summary, error, retry, stage, spaceError, surprise, feedback } = useHome(profile.availableBalanceMinor, paymentSaved);
  const { fontScale, width } = useWindowDimensions();
  const money = (amount: number) => formatBalance(amount, profile.currencyCode);
  const interpretation = summary && financialFeedback(summary);

  return (
    <View style={styles.home}>
      {error ? (
        <View style={styles.section}>
          <Text accessibilityRole="alert" style={styles.description}>{error}</Text>
          <Pressable accessibilityRole="button" onPress={retry} style={styles.button}>
            <Text style={styles.buttonText}>Reintentar</Text>
          </Pressable>
        </View>
      ) : summary === null ? <Text accessibilityLiveRegion="polite" style={styles.description}>Cargando movimientos...</Text> : (
        <>
          <View style={styles.hero}>
            <Text style={styles.horizon}>PRÓXIMOS 30 DÍAS · {profile.currencyCode}</Text>
            <Text accessibilityRole="header" style={styles.label}>Disponible real</Text>
            <Text style={[styles.balance, summary.availableMinor < 0 && styles.negative]}>{money(summary.availableMinor)}</Text>
            <Text style={styles.heroDescription}>Lo que te queda después de tus compromisos</Text>
            <View style={styles.breakdown}>
              <View style={styles.fact}>
                <Text style={styles.summaryLabel}>Hoy tenés</Text>
                <Text style={styles.summaryAmount}>{money(summary.balanceMinor)}</Text>
              </View>
              <Text accessible={false} style={styles.minus}>−</Text>
              <View style={styles.fact}>
                <Text style={styles.summaryLabel}>Comprometido</Text>
                <Text style={styles.summaryAmount}>{money(summary.committedMinor)}</Text>
              </View>
            </View>
          </View>
          {feedback && <View accessibilityLiveRegion="polite" style={styles.confirmation}>
            <Text style={styles.title}>Listo. Ya lo estamos teniendo en cuenta.</Text>
            <Text style={styles.description}>Tu disponible real ahora es {money(summary.availableMinor)}.</Text>
            <Pressable accessibilityRole="button" accessibilityLabel="Cerrar confirmación" onPress={onDismissFeedback} style={styles.dismiss}>
              <Text style={styles.link}>Entendido</Text>
            </Pressable>
          </View>}
          {interpretation && <View style={styles.section}>
            <Text style={styles.title}>{interpretation.title}</Text>
            <Text style={styles.description}>{interpretation.kind === "shortfall"
              ? `Tus compromisos superan tu saldo actual en ${money(interpretation.shortfallMinor)}.`
              : interpretation.description}</Text>
          </View>}
          {summary.incomeMinor > 0 ? <View style={styles.projection}>
            <View style={styles.summaryRow}>
              <Text style={styles.description}>Ingresos previstos</Text>
              <Text style={styles.income}>+{money(summary.incomeMinor)}</Text>
            </View>
            <Text style={styles.caption}>Con esos ingresos, tu proyección para los próximos 30 días es:</Text>
            <Text style={styles.projectionAmount}>{money(summary.projectionMinor)}</Text>
            <Text style={styles.caption}>Ese dinero todavía no está disponible.</Text>
          </View> : <Text style={styles.caption}>Sin ingresos previstos en estos 30 días.</Text>}
          <Pressable accessibilityRole="button" onPress={onAdd} style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
            <Text style={styles.buttonText}>+ Agregar movimiento</Text>
          </Pressable>
          <View style={styles.section}>
            <Text accessibilityRole="header" style={styles.heading}>Próximos movimientos</Text>
            <Text style={styles.caption}>De hoy a dentro de 30 días, inclusive.</Text>
            {summary.upcoming.length === 0 ? (
              <View style={styles.empty}>
                <Text style={styles.title}>No tenés movimientos previstos en estos 30 días.</Text>
              </View>
            ) : summary.upcoming.map((payment) => (
              <View key={payment.id} style={styles.movement}>
                <View style={styles.date}>
                  <Text style={styles.day}>{payment.dueDate.slice(8)}</Text>
                  <Text style={styles.caption}>{months[Number(payment.dueDate.slice(5, 7)) - 1]}</Text>
                </View>
                <View style={styles.details}>
                  <View style={[styles.summaryRow, (fontScale > 1.2 || width < 360) && styles.stacked]}>
                    <Text style={styles.movementTitle}>{payment.title}</Text>
                    <Text style={[styles.amount, payment.type === "income" && styles.income]}>
                      {payment.type === "income" ? "+" : "−"}{money(payment.amountMinor)}
                    </Text>
                  </View>
                  <Text style={styles.caption}>{payment.timing}</Text>
                </View>
              </View>
            ))}
          </View>
        </>
      )}
      {(error || summary === null) && <Pressable accessibilityRole="button" onPress={onAdd} style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
        <Text style={styles.buttonText}>+ Agregar movimiento</Text>
      </Pressable>}
      {stage !== null && <LivingSpace stage={stage} surprise={surprise} />}
      {spaceError && <View style={styles.section}>
        <Text style={styles.caption}>No pudimos actualizar tu espacio. Tus datos financieros siguen disponibles.</Text>
        <Pressable accessibilityRole="button" onPress={retry} style={styles.dismiss}>
          <Text style={styles.link}>Reintentar espacio</Text>
        </Pressable>
      </View>}
    </View>
  );
}

const styles = StyleSheet.create({
  home: { gap: 20 },
  section: { gap: 8 },
  hero: { backgroundColor: "#163B30", borderRadius: 24, padding: 22, gap: 10 },
  horizon: { color: "#B8CFC0", fontSize: 11, fontWeight: "600", letterSpacing: 1 },
  label: { color: "#F6F4E9", fontSize: 20, fontWeight: "500", marginTop: 8 },
  balance: { color: "#FFFFFF", fontSize: 42, fontWeight: "700", fontVariant: ["tabular-nums"], letterSpacing: -1 },
  negative: { color: "#F0C7AD" },
  heroDescription: { color: "#D2E0D4", fontSize: 14, lineHeight: 21 },
  description: { color: "#52645C", fontSize: 14, lineHeight: 21 },
  breakdown: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", marginTop: 10, gap: 12 },
  fact: { flexGrow: 1, flexShrink: 1, gap: 4 },
  minus: { fontSize: 22, color: "#B8CFC0" },
  summaryRow: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", alignItems: "baseline", gap: 6 },
  stacked: { flexDirection: "column", alignItems: "flex-start" },
  summaryLabel: { color: "#B8CFC0", fontSize: 12 },
  summaryAmount: { color: "#F6F4E9", fontSize: 16, fontWeight: "500", fontVariant: ["tabular-nums"] },
  projection: { gap: 6, paddingLeft: 14, borderLeftWidth: 3, borderColor: "#CAD9CC" },
  projectionAmount: { color: "#203D32", fontSize: 24, fontWeight: "600", fontVariant: ["tabular-nums"] },
  heading: { color: "#203D32", fontSize: 21, fontWeight: "600" },
  caption: { color: "#52645C", fontSize: 13, lineHeight: 19 },
  empty: { paddingVertical: 12, gap: 8 },
  title: { color: "#203D32", fontSize: 16, fontWeight: "600" },
  movementTitle: { color: "#203D32", fontSize: 15, fontWeight: "600", flexShrink: 1 },
  movement: { flexDirection: "row", gap: 12, paddingVertical: 12 },
  date: { minWidth: 46, alignItems: "center", padding: 6, backgroundColor: "#EEEFE6", borderRadius: 12, alignSelf: "flex-start" },
  day: { color: "#203D32", fontSize: 23, fontWeight: "600" },
  details: { flex: 1, gap: 4 },
  amount: { color: "#6D5747", fontSize: 15, fontWeight: "600", fontVariant: ["tabular-nums"] },
  income: { color: "#316E49", fontSize: 15, fontWeight: "600" },
  button: { alignSelf: "flex-start", minHeight: 48, paddingHorizontal: 18, paddingVertical: 12, borderRadius: 24, backgroundColor: "#163B30", alignItems: "center", justifyContent: "center" },
  confirmation: { backgroundColor: "#E8F0E7", borderRadius: 16, padding: 16, gap: 6 },
  dismiss: { minHeight: 44, justifyContent: "center", alignSelf: "flex-start", paddingHorizontal: 4 },
  link: { color: "#163B30", fontSize: 14, fontWeight: "600" },
  buttonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
  pressed: { opacity: 0.65 },
});
