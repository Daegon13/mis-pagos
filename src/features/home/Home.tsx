import { Pressable, StyleSheet, Text, View } from "react-native";

import type { FinancialProfile } from "@/domain/financialProfile";
import { formatBalance } from "@/features/financial-profile/money";
import { useHome } from "./useHome";

const months = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];

export function Home({ profile, onAdd }: { profile: FinancialProfile; onAdd: () => void }) {
  const { summary, error, retry } = useHome(profile.availableBalanceMinor);
  const money = (amount: number) => formatBalance(amount, profile.currencyCode);

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
            <Text style={styles.description}>{summary.availableMinor < 0
              ? "Tus compromisos superan tu saldo actual."
              : "Lo que te queda después de tus compromisos."}</Text>
            <View style={styles.breakdown}>
              {([
                ["Hoy tenés", summary.balanceMinor],
                ["Comprometido", summary.committedMinor],
                ["Ingresos previstos", summary.incomeMinor],
                ["Proyección próximos 30 días", summary.projectionMinor],
              ] as const).map(([label, amount]) => (
                <View key={label} style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>{label}</Text>
                  <Text style={styles.summaryAmount}>{money(amount)}</Text>
                </View>
              ))}
            </View>
          </View>
          <View style={styles.section}>
            <Text accessibilityRole="header" style={styles.heading}>Próximos movimientos</Text>
            <Text style={styles.caption}>De hoy a dentro de 30 días, inclusive.</Text>
            {summary.upcoming.length === 0 ? (
              <View style={styles.empty}>
                <Text style={styles.title}>No tenés movimientos previstos en estos 30 días.</Text>
                <Text style={styles.description}>Agregá pagos e ingresos futuros para ver cuánto de tu dinero está comprometido.</Text>
              </View>
            ) : summary.upcoming.map((payment) => (
              <View key={payment.id} style={styles.movement}>
                <View style={styles.date}>
                  <Text style={styles.day}>{payment.dueDate.slice(8)}</Text>
                  <Text style={styles.caption}>{months[Number(payment.dueDate.slice(5, 7)) - 1]}</Text>
                </View>
                <View style={styles.details}>
                  <Text style={styles.title}>{payment.title}</Text>
                  <Text style={styles.caption}>{payment.timing}</Text>
                  <Text style={[styles.amount, payment.type === "income" && styles.income]}>
                    {payment.type === "income" ? "+" : "−"}{money(payment.amountMinor)}
                    {payment.type === "income" ? " · Ingreso" : " · Gasto"}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </>
      )}
      <Pressable accessibilityRole="button" onPress={onAdd} style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
        <Text style={styles.buttonText}>+ Agregar movimiento</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  home: { gap: 24 },
  section: { gap: 12 },
  hero: { backgroundColor: "#E8F0E7", borderRadius: 24, padding: 20, gap: 10 },
  horizon: { color: "#52645C", fontSize: 12, fontWeight: "600", letterSpacing: 1 },
  label: { color: "#163B30", fontSize: 20, fontWeight: "600" },
  balance: { color: "#163B30", fontSize: 38, fontWeight: "700", fontVariant: ["tabular-nums"] },
  negative: { color: "#8C4940" },
  description: { color: "#52645C", fontSize: 15, lineHeight: 22 },
  breakdown: { borderTopWidth: 1, borderColor: "#CAD9CC", marginTop: 8, paddingTop: 16, gap: 14 },
  summaryRow: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 6 },
  summaryLabel: { color: "#52645C", fontSize: 14, flexShrink: 1 },
  summaryAmount: { color: "#203D32", fontSize: 16, fontWeight: "600", fontVariant: ["tabular-nums"] },
  heading: { color: "#203D32", fontSize: 21, fontWeight: "600" },
  caption: { color: "#52645C", fontSize: 13, lineHeight: 19 },
  empty: { paddingVertical: 12, gap: 8 },
  title: { color: "#203D32", fontSize: 16, fontWeight: "600" },
  movement: { flexDirection: "row", gap: 14, borderBottomWidth: 1, borderColor: "#DCE3DC", paddingVertical: 12 },
  date: { width: 48, alignItems: "center", paddingTop: 2 },
  day: { color: "#203D32", fontSize: 23, fontWeight: "600" },
  details: { flex: 1, gap: 4 },
  amount: { color: "#203D32", fontSize: 16, fontWeight: "600", fontVariant: ["tabular-nums"] },
  income: { color: "#316E49" },
  button: { minHeight: 56, padding: 16, borderRadius: 14, backgroundColor: "#163B30", alignItems: "center", justifyContent: "center" },
  buttonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
  pressed: { opacity: 0.65 },
});
