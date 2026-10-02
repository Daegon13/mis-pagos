import { Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";

import type { FinancialProfile } from "@/domain/financialProfile";
import { formatBalance } from "@/features/financial-profile/money";
import { useHome } from "./useHome";
import { financialFeedback } from "./homeFeedback";
import { LivingSpace } from "./LivingSpace";
import { usePersonalization } from "@/features/personalization/PersonalizationProvider";
import type { ThemeTokens } from "@/features/personalization/themes";

const months = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];

export function Home({ profile, onAdd, paymentSaved, onDismissFeedback, onAll, onOpen, onBalance, balanceSaved, onPersonalize }: {
  profile: FinancialProfile; onAdd: () => void; paymentSaved?: string; onDismissFeedback: () => void;
  onAll: () => void; onOpen: (id: number) => void; onBalance: () => void; onPersonalize: () => void; balanceSaved?: string;
}) {
  const { theme } = usePersonalization();
  const styles = createStyles(theme);
  const { summary, error, retry, stage, spaceError, surprise, feedback } = useHome(paymentSaved);
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
            <Text style={styles.horizon}>{summary.overdueExpenseCount > 0 ? "VENCIDOS + PRÓXIMOS 30 DÍAS" : "PRÓXIMOS 30 DÍAS"} · {profile.currencyCode}</Text>
            <Text accessibilityRole="header" style={styles.label}>Disponible real</Text>
            <Text style={[styles.balance, summary.availableMinor < 0 && styles.negative]}>{money(summary.availableMinor)}</Text>
            <Text style={styles.heroDescription}>Lo que te queda después de tus compromisos</Text>
            <View style={styles.breakdown}>
              <View style={styles.fact}>
                <Text style={styles.summaryLabel}>Hoy tenés</Text>
                <View style={styles.balanceRow}>
                  <Text style={styles.summaryAmount}>{money(summary.balanceMinor)}</Text>
                  <Pressable accessibilityRole="button" accessibilityLabel="Actualizar saldo actual" onPress={onBalance} style={styles.dismiss}>
                    <Text style={styles.balanceLink}>Actualizar</Text>
                  </Pressable>
                </View>
              </View>
              <Text accessible={false} style={styles.minus}>−</Text>
              <View style={styles.fact}>
                <Text style={styles.summaryLabel}>Comprometido</Text>
                <Text style={styles.summaryAmount}>{money(summary.committedMinor)}</Text>
              </View>
            </View>
          </View>
          {(feedback || balanceSaved) && <View accessibilityLiveRegion="polite" style={styles.confirmation}>
            <Text style={styles.title}>{balanceSaved ? "Saldo actualizado." : "Listo. Ya lo estamos teniendo en cuenta."}</Text>
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
            {interpretation.kind === "overdue" && <>
              {summary.overdue.map(payment => <View key={payment.id} style={styles.overdue}>
                <View style={[styles.summaryRow, (fontScale > 1.2 || width < 360) && styles.stacked]}>
                  <Text style={styles.movementTitle}>{payment.title}</Text>
                  <Text style={[styles.amount, payment.type === "income" && styles.income]}>
                    {payment.type === "income" ? "+" : "−"}{money(payment.amountMinor)}
                  </Text>
                </View>
                <Text style={styles.caption}>{payment.timing}</Text>
              </View>)}
              <Pressable accessibilityRole="button" onPress={onAll} style={styles.dismiss}><Text style={styles.link}>Revisar movimientos</Text></Pressable>
            </>}
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
            <View style={styles.summaryRow}>
              <Text accessibilityRole="header" style={styles.heading}>Próximos movimientos</Text>
              <Pressable accessibilityRole="button" onPress={onAll} style={styles.dismiss}><Text style={styles.link}>Ver todos</Text></Pressable>
            </View>
            <Text style={styles.caption}>De hoy a dentro de 30 días, inclusive.</Text>
            {summary.upcoming.length === 0 ? (
              <View style={styles.empty}>
                <Text style={styles.title}>No tenés movimientos previstos en estos 30 días.</Text>
              </View>
            ) : summary.upcoming.map((payment) => (
              <Pressable key={payment.id} accessibilityRole="button" onPress={() => onOpen(payment.id)} style={styles.movement}>
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
              </Pressable>
            ))}
          </View>
        </>
      )}
      {(error || summary === null) && <Pressable accessibilityRole="button" onPress={onAdd} style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
        <Text style={styles.buttonText}>+ Agregar movimiento</Text>
      </Pressable>}
      {stage !== null && <LivingSpace stage={stage} surprise={surprise} onPersonalize={onPersonalize} />}
      {spaceError && <View style={styles.section}>
        <Text style={styles.caption}>No pudimos actualizar tu espacio. Tus datos financieros siguen disponibles.</Text>
        <Pressable accessibilityRole="button" onPress={retry} style={styles.dismiss}>
          <Text style={styles.link}>Reintentar espacio</Text>
        </Pressable>
      </View>}
    </View>
  );
}

function createStyles(theme: ThemeTokens) { return StyleSheet.create({
  home: { gap: 20 },
  section: { gap: 8 },
  hero: { backgroundColor: theme.primary, borderRadius: 24, padding: 22, gap: 10 },
  horizon: { color: theme.heroMuted, fontSize: 11, fontWeight: "600", letterSpacing: 1 },
  label: { color: theme.textOnPrimary, fontSize: 20, fontWeight: "500", marginTop: 8 },
  balance: { color: theme.textOnPrimary, fontSize: 42, fontWeight: "700", fontVariant: ["tabular-nums"], letterSpacing: -1 },
  negative: { color: theme.negativeOnPrimary },
  heroDescription: { color: theme.heroMuted, fontSize: 14, lineHeight: 21 },
  description: { color: theme.textSecondary, fontSize: 14, lineHeight: 21 },
  breakdown: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", marginTop: 10, gap: 12 },
  fact: { flexGrow: 1, flexShrink: 1, gap: 4 },
  minus: { fontSize: 22, color: theme.heroMuted },
  summaryRow: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", alignItems: "baseline", gap: 6 },
  stacked: { flexDirection: "column", alignItems: "flex-start" },
  summaryLabel: { color: theme.heroMuted, fontSize: 12 },
  summaryAmount: { color: theme.textOnPrimary, fontSize: 16, fontWeight: "500", fontVariant: ["tabular-nums"] },
  balanceRow: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8 },
  balanceLink: { color: theme.heroMuted, fontSize: 12, textDecorationLine: "underline" },
  overdue: { paddingVertical: 8, gap: 4 },
  projection: { gap: 6, paddingLeft: 14, borderLeftWidth: 3, borderColor: theme.border },
  projectionAmount: { color: theme.textPrimary, fontSize: 24, fontWeight: "600", fontVariant: ["tabular-nums"] },
  heading: { color: theme.textPrimary, fontSize: 21, fontWeight: "600" },
  caption: { color: theme.textSecondary, fontSize: 13, lineHeight: 19 },
  empty: { paddingVertical: 12, gap: 8 },
  title: { color: theme.textPrimary, fontSize: 16, fontWeight: "600" },
  movementTitle: { color: theme.textPrimary, fontSize: 15, fontWeight: "600", flexShrink: 1 },
  movement: { flexDirection: "row", gap: 12, paddingVertical: 12 },
  date: { minWidth: 46, alignItems: "center", padding: 6, backgroundColor: theme.secondarySurface, borderRadius: 12, alignSelf: "flex-start" },
  day: { color: theme.textPrimary, fontSize: 23, fontWeight: "600" },
  details: { flex: 1, gap: 4 },
  amount: { color: theme.textPrimary, fontSize: 15, fontWeight: "600", fontVariant: ["tabular-nums"] },
  income: { color: theme.positive, fontSize: 15, fontWeight: "600" },
  button: { alignSelf: "flex-start", minHeight: 48, paddingHorizontal: 18, paddingVertical: 12, borderRadius: 24, backgroundColor: theme.primary, alignItems: "center", justifyContent: "center" },
  confirmation: { backgroundColor: theme.primarySurface, borderRadius: 16, padding: 16, gap: 6 },
  dismiss: { minHeight: 44, justifyContent: "center", alignSelf: "flex-start", paddingHorizontal: 4 },
  link: { color: theme.primary, fontSize: 14, fontWeight: "600" },
  buttonText: { color: theme.textOnPrimary, fontSize: 16, fontWeight: "600" },
  pressed: { opacity: 0.65 },
}); }
