import { useEffect } from "react";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { FinancialSetup } from "@/features/financial-profile/FinancialSetup";
import { Home } from "@/features/home/Home";
import { useFinancialProfile } from "@/features/financial-profile/useFinancialProfile";

export default function Index() {
  const router = useRouter();
  const { paymentSaved } = useLocalSearchParams<{ paymentSaved?: string }>();
  const { profile, isLoading, isSaving, loadError, saveError, retry, save } = useFinancialProfile();

  useEffect(() => {
    if (!paymentSaved) return;
    const timeout = setTimeout(() => router.setParams({ paymentSaved: undefined }), 4000);
    return () => clearTimeout(timeout);
  }, [paymentSaved, router]);

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
            {paymentSaved && <Text accessibilityLiveRegion="polite" style={styles.confirmation}>Movimiento guardado.</Text>}
            <Home profile={profile} onAdd={() => router.push("/payments/new")} />
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
  content: { flexGrow: 1, width: "100%", maxWidth: 560, alignSelf: "center", padding: 24, paddingBottom: 40, gap: 24 },
  brand: { color: "#163B30", fontSize: 21, fontWeight: "700" },
  home: { gap: 16 },
  confirmation: { color: "#163B30", backgroundColor: "#E1EDE3", padding: 16, borderRadius: 12, fontSize: 16, fontWeight: "600" },
  section: { gap: 12 },
  description: { color: "#52645C", fontSize: 16, lineHeight: 24 },
  retry: { alignSelf: "flex-start", minHeight: 48, justifyContent: "center", paddingHorizontal: 20, borderRadius: 12, backgroundColor: "#163B30" },
  retryText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
});
