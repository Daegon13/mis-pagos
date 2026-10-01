import type { PropsWithChildren } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export function MovementScreen({ title, onBack, children }: PropsWithChildren<{ title: string; onBack: () => void }>) {
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
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled: !!disabled }} disabled={disabled}
    onPress={onPress} style={({ pressed }) => [styles.action, primary && styles.primary, (pressed || disabled) && styles.dim]}>
    <Text style={[styles.actionText, primary && styles.white, destructive && styles.error]}>{label}</Text>
  </Pressable>;
}

export function Feedback({ message, error = false }: { message?: string | null; error?: boolean }) {
  return message ? <View style={styles.card}><Text accessibilityRole={error ? "alert" : undefined}
    accessibilityLiveRegion="polite" style={error ? styles.error : styles.text}>{message}</Text></View> : null;
}

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F9F5" },
  content: { flexGrow: 1, width: "100%", maxWidth: 560, alignSelf: "center", padding: 24, paddingBottom: 40, gap: 18 },
  heading: { color: "#163B30", fontSize: 28, fontWeight: "700" },
  title: { color: "#203D32", fontSize: 19, fontWeight: "600" },
  text: { color: "#52645C", fontSize: 16, lineHeight: 24 },
  amount: { color: "#163B30", fontSize: 30, fontWeight: "700", fontVariant: ["tabular-nums"] },
  card: { backgroundColor: "#E8F0E7", borderRadius: 16, padding: 16, gap: 8 },
  section: { gap: 10 },
  row: { paddingVertical: 14, borderBottomWidth: 1, borderColor: "#DEE5DC", gap: 6 },
  tabs: { flexDirection: "row", flexWrap: "wrap", gap: 4 },
  action: { minHeight: 48, paddingHorizontal: 12, paddingVertical: 12, justifyContent: "center", borderRadius: 14 },
  actionText: { color: "#163B30", fontSize: 16, fontWeight: "600" },
  primary: { backgroundColor: "#163B30" },
  white: { color: "#FFFFFF", textAlign: "center" },
  error: { color: "#A12D26", fontSize: 16, lineHeight: 24 },
  dim: { opacity: 0.65 },
  input: { minHeight: 56, borderWidth: 1, borderColor: "#879B90", borderRadius: 12, padding: 14, fontSize: 24, color: "#163B30", backgroundColor: "#FFFFFF" },
  deletion: { borderTopWidth: 1, borderColor: "#DEE5DC", paddingTop: 16, marginTop: 12 },
});
