import { Redirect, Stack, useRouter } from "expo-router";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useFinancialProfile } from "@/features/financial-profile/useFinancialProfile";
import { PaymentForm } from "@/features/payments/PaymentForm";
import { usePersonalization } from "@/features/personalization/PersonalizationProvider";

export default function NewPayment() {
  const router = useRouter();
  const { profile, isLoading, loadError, retry } = useFinancialProfile();
  const { theme } = usePersonalization();

  if (!isLoading && !loadError && profile === null) return <Redirect href="/" />;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
          <Pressable accessibilityRole="button" accessibilityLabel="Volver a Home" onPress={() => router.dismissTo("/")} style={styles.back}>
            <Text style={[styles.backText, { color: theme.primary }]}>← Volver</Text>
          </Pressable>
          <Text accessibilityRole="header" style={[styles.title, { color: theme.primary }]}>Nuevo movimiento</Text>
          {isLoading ? (
            <Text accessibilityLiveRegion="polite" style={[styles.description, { color: theme.textSecondary }]}>Cargando...</Text>
          ) : loadError ? (
            <>
              <Text accessibilityRole="alert" style={[styles.description, { color: theme.textSecondary }]}>{loadError}</Text>
              <Pressable accessibilityRole="button" onPress={retry} style={styles.back}>
                <Text style={[styles.backText, { color: theme.primary }]}>Reintentar</Text>
              </Pressable>
            </>
          ) : profile !== null ? (
            <PaymentForm
              currencyCode={profile.currencyCode}
              onSaved={(id) => router.dismissTo({ pathname: "/", params: { paymentSaved: String(id) } })}
            />
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F9F5" },
  content: { flexGrow: 1, width: "100%", maxWidth: 560, alignSelf: "center", padding: 24, paddingBottom: 40, gap: 24 },
  back: { alignSelf: "flex-start", minHeight: 48, justifyContent: "center", paddingHorizontal: 12 },
  backText: { color: "#163B30", fontSize: 17, fontWeight: "600" },
  title: { color: "#163B30", fontSize: 30, fontWeight: "700", lineHeight: 37 },
  description: { color: "#52645C", fontSize: 17, lineHeight: 25 },
});
