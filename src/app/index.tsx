import { Stack } from "expo-router";
import { Pressable, ScrollView, Text, View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { FinancialSetup } from "@/features/financial-profile/FinancialSetup";
import { formatBalance } from "@/features/financial-profile/money";
import { useFinancialProfile } from "@/features/financial-profile/useFinancialProfile";

export default function Index() {
  const { profile, isLoading, isSaving, loadError, saveError, retry, save } = useFinancialProfile();

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text accessibilityRole="header" style={styles.brand}>Mis Pagos</Text>
        {isLoading ? (
          <Text accessibilityLiveRegion="polite" style={styles.description}>Cargando...</Text>
        ) : loadError ? (
          <View style={styles.section}>
            <Text accessibilityRole="alert" style={styles.description}>{loadError}</Text>
            <Pressable accessibilityRole="button" onPress={retry} style={styles.retry}>
              <Text style={styles.retryText}>Reintentar</Text>
            </Pressable>
          </View>
        ) : profile === null ? (
          <FinancialSetup isSaving={isSaving} error={saveError} onSave={save} />
        ) : (
          <View style={styles.home}>
            <View style={styles.section}>
              <Text style={styles.label}>Disponible hoy</Text>
              <Text style={styles.balance}>{formatBalance(profile.availableBalanceMinor, profile.currencyCode)}</Text>
              <Text style={styles.currency}>{profile.currencyCode}</Text>
            </View>
            <View style={styles.movements}>
              <Text accessibilityRole="header" style={styles.heading}>Próximos movimientos</Text>
              <View style={styles.section}>
                <Text style={styles.emptyTitle}>Todavía no agregaste movimientos.</Text>
                <Text style={styles.description}>Cuando registres pagos e ingresos futuros, van a aparecer acá.</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F9F5",
  },
  content: { flexGrow: 1, width: "100%", maxWidth: 560, alignSelf: "center", padding: 24, paddingBottom: 40, gap: 36 },
  brand: { color: "#163B30", fontSize: 21, fontWeight: "700" },
  home: { gap: 48 },
  section: { gap: 12 },
  label: { color: "#52645C", fontSize: 18 },
  balance: { color: "#163B30", fontSize: 42, fontWeight: "700", fontVariant: ["tabular-nums"] },
  currency: { color: "#52645C", fontSize: 16, fontWeight: "600" },
  movements: { borderTopWidth: 1, borderColor: "#DCE3DC", paddingTop: 28, gap: 28 },
  heading: { color: "#203D32", fontSize: 21, fontWeight: "600" },
  emptyTitle: { color: "#203D32", fontSize: 17, fontWeight: "500" },
  description: { color: "#52645C", fontSize: 16, lineHeight: 24 },
  retry: { alignSelf: "flex-start", minHeight: 48, justifyContent: "center", paddingHorizontal: 20, borderRadius: 12, backgroundColor: "#163B30" },
  retryText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
});
