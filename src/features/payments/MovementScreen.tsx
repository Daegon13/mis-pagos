import type { PropsWithChildren } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { usePersonalization } from "@/features/personalization/PersonalizationProvider";
import type { ThemeTokens } from "@/features/personalization/themes";

export function useMovementStyles() {
  const { theme } = usePersonalization();
  return createStyles(theme);
}

export function MovementScreen({ title, onBack, children }: PropsWithChildren<{ title: string; onBack: () => void }>) {
  const styles = useMovementStyles();
  return <SafeAreaView style={styles.container}>
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
        <Action label="← Volver" onPress={onBack} />
        <Text accessibilityRole="header" style={styles.heading}>{title}</Text>
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>;
}

export function Action({ label, onPress, disabled, primary, destructive }: {
  label: string; onPress: () => void; disabled?: boolean; primary?: boolean; destructive?: boolean;
}) {
  const styles = useMovementStyles();
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled: !!disabled }} disabled={disabled}
    onPress={onPress} style={({ pressed }) => [styles.action, primary && styles.primary, (pressed || disabled) && styles.dim]}>
    <Text style={[styles.actionText, primary && styles.white, destructive && styles.error]}>{label}</Text>
  </Pressable>;
}

export function Feedback({ message, error = false }: { message?: string | null; error?: boolean }) {
  const styles = useMovementStyles();
  return message ? <View style={styles.card}><Text accessibilityRole={error ? "alert" : undefined}
    accessibilityLiveRegion="polite" style={error ? styles.error : styles.text}>{message}</Text></View> : null;
}

function createStyles(theme: ThemeTokens) { return StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  content: { flexGrow: 1, width: "100%", maxWidth: 560, alignSelf: "center", padding: 24, paddingBottom: 40, gap: 18 },
  heading: { color: theme.primary, fontSize: 28, fontWeight: "700" },
  title: { color: theme.textPrimary, fontSize: 19, fontWeight: "600" },
  text: { color: theme.textSecondary, fontSize: 16, lineHeight: 24 },
  amount: { color: theme.textPrimary, fontSize: 30, fontWeight: "700", fontVariant: ["tabular-nums"] },
  card: { backgroundColor: theme.primarySurface, borderRadius: 16, padding: 16, gap: 8 },
  section: { gap: 10 },
  row: { paddingVertical: 14, borderBottomWidth: 1, borderColor: theme.border, gap: 6 },
  tabs: { flexDirection: "row", flexWrap: "wrap", gap: 4 },
  action: { minHeight: 48, paddingHorizontal: 12, paddingVertical: 12, justifyContent: "center", borderRadius: 14 },
  actionText: { color: theme.primary, fontSize: 16, fontWeight: "600" },
  primary: { backgroundColor: theme.primary },
  white: { color: theme.textOnPrimary, textAlign: "center" },
  error: { color: theme.negative, fontSize: 16, lineHeight: 24 },
  dim: { opacity: 0.65 },
  input: { minHeight: 56, borderWidth: 1, borderColor: theme.border, borderRadius: 12, padding: 14, fontSize: 24, color: theme.textPrimary, backgroundColor: theme.surface },
  deletion: { borderTopWidth: 1, borderColor: theme.border, paddingTop: 16, marginTop: 12 },
}); }
