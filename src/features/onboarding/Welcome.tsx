import { Pressable, StyleSheet, Text, View } from "react-native";
import type { ThemeTokens } from "@/features/personalization/themes";

export function Welcome({ theme, busy, onBegin, onSkip }: {
  theme: ThemeTokens; busy: boolean; onBegin: () => void; onSkip: () => void;
}) {
  return <View style={[styles.container, { backgroundColor: theme.primarySurface, borderColor: theme.border }]}>
    <Text style={[styles.eyebrow, { color: theme.accent }]}>MIS PAGOS</Text>
    <Text accessibilityRole="header" style={[styles.title, { color: theme.primary }]}>Bienvenido a Mis Pagos.{"\n"}Descubrí cuánto dinero tenés realmente disponible.</Text>
    <Pressable accessibilityRole="button" accessibilityState={{ disabled: busy }} disabled={busy}
      onPress={onBegin} style={[styles.primary, { backgroundColor: theme.primary }]}>
      <Text style={[styles.primaryText, { color: theme.textOnPrimary }]}>Comenzar</Text>
    </Pressable>
    <Pressable accessibilityRole="button" accessibilityState={{ disabled: busy }} disabled={busy}
      onPress={onSkip} style={styles.secondary}>
      <Text style={[styles.secondaryText, { color: theme.primary }]}>Omitir tutorial</Text>
    </Pressable>
    <Text style={[styles.body, { color: theme.textSecondary }]}>Organizá lo que viene y mirá con claridad cuánto te queda hoy. El recorrido es breve y podés omitirlo.</Text>
    <View style={[styles.example, { backgroundColor: theme.surface }]}>
      <Text style={[styles.exampleText, { color: theme.textPrimary }]}>Hoy tenés  −  Compromisos  =  Disponible real</Text>
    </View>
    <Text style={[styles.caption, { color: theme.textSecondary }]}>En ambos casos, primero vas a elegir tu moneda y cargar tu saldo.</Text>
  </View>;
}

const styles = StyleSheet.create({
  container: { padding: 20, borderRadius: 22, borderWidth: 1, gap: 14 },
  eyebrow: { fontSize: 13, fontWeight: "700", letterSpacing: 2 },
  title: { fontSize: 29, lineHeight: 37, fontWeight: "700" },
  body: { fontSize: 17, lineHeight: 25 },
  example: { borderRadius: 14, padding: 16 },
  exampleText: { fontSize: 15, lineHeight: 23, fontWeight: "600" },
  primary: { minHeight: 54, alignItems: "center", justifyContent: "center", borderRadius: 14, padding: 12 },
  primaryText: { fontSize: 17, fontWeight: "700" },
  secondary: { minHeight: 48, alignItems: "center", justifyContent: "center", padding: 8 },
  secondaryText: { fontSize: 16, fontWeight: "600" },
  caption: { fontSize: 13, lineHeight: 20 },
});
