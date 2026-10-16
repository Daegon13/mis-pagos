import { Stack, useLocalSearchParams, useRouter, type Href } from "expo-router";
import { Pressable, ScrollView, Text, View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { FinancialSetup } from "@/features/financial-profile/FinancialSetup";
import { Home } from "@/features/home/Home";
import { useFinancialProfile } from "@/features/financial-profile/useFinancialProfile";
import { usePersonalization } from "@/features/personalization/PersonalizationProvider";

export default function Index() {
  const router = useRouter();
  const { paymentSaved, balanceSaved, discovery } = useLocalSearchParams<{ paymentSaved?: string; balanceSaved?: string; discovery?: string }>();
  const { profile, isLoading, isSaving, loadError, saveError, retry, save } = useFinancialProfile();
  const { theme } = usePersonalization();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text accessibilityRole="header" style={[styles.brand, { color: theme.primary }]}>Mis Pagos</Text>
          {profile && <Pressable accessibilityRole="button" accessibilityLabel="Cómo funciona Mis Pagos"
            onPress={() => router.push("/help")}
            style={[styles.help, { borderColor: theme.border }]}>
            <Text style={{ color: theme.primary, fontSize: 19, fontWeight: "600" }}>?</Text>
          </Pressable>}
          {profile && <Pressable accessibilityRole="button" accessibilityLabel="Preferencias de notificaciones"
            onPress={() => router.push("/notifications" as Href)} style={[styles.help, { borderColor: theme.border }]}>
            <Text style={{ color: theme.primary, fontSize: 19 }}>🔔</Text>
          </Pressable>}
        </View>
        {isLoading ? (
          <Text accessibilityLiveRegion="polite" style={[styles.description, { color: theme.textSecondary }]}>Cargando...</Text>
        ) : loadError ? (
          <View style={styles.section}>
            <Text accessibilityRole="alert" style={[styles.description, { color: theme.textSecondary }]}>{loadError}</Text>
            <Pressable accessibilityRole="button" onPress={retry} style={[styles.retry, { backgroundColor: theme.primary }]}>
              <Text style={[styles.retryText, { color: theme.textOnPrimary }]}>Reintentar</Text>
            </Pressable>
          </View>
        ) : profile === null ? (
          <FinancialSetup isSaving={isSaving} error={saveError} onSave={save} />
        ) : (
          <Home profile={profile} paymentSaved={paymentSaved} balanceSaved={balanceSaved} discovery={discovery === "1"}
            onAll={() => router.push("/payments")}
            onOpen={id => router.push({ pathname: "/payments/[id]", params: { id: String(id) } })}
            onBalance={() => router.push("/balance")}
            onDismissFeedback={() => router.setParams({ paymentSaved: undefined, balanceSaved: undefined, discovery: undefined })}
            onPersonalize={() => router.push("/personalize")}
            onAchievements={() => router.push("./achievements")}
            onOpenSpace={() => router.push("/space")}
            onBetaFeedback={() => router.push("/help/beta-feedback")}
            onPlan={() => router.push("./plan")}
            onAdd={() => router.push("/payments/new")} />
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
  content: { flexGrow: 1, width: "100%", maxWidth: 560, alignSelf: "center", padding: 24, paddingBottom: 40, gap: 24 },
  header: { flexDirection: "row", gap: 12, alignItems: "center" },
  help: { width: 44, height: 44, borderWidth: 1, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  brand: { color: "#163B30", fontSize: 21, fontWeight: "700" },
  section: { gap: 12 },
  description: { color: "#52645C", fontSize: 16, lineHeight: 24 },
  retry: { alignSelf: "flex-start", minHeight: 48, justifyContent: "center", paddingHorizontal: 20, borderRadius: 12, backgroundColor: "#163B30" },
  retryText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
});
