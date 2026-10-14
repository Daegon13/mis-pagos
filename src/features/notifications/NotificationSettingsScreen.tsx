import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getNotificationPreferences, NOTIFICATION_CATEGORIES, setNotificationCategory,
  setNotificationEnabled, setNotificationHours, type NotificationPreferences } from "@/data/repositories/notificationRepository";
import { usePersonalization } from "@/features/personalization/PersonalizationProvider";
import { notificationDataChanged } from "@/data/notificationChanges";

const labels = { dueSoon: "Vencimientos próximos", overdue: "Movimientos vencidos", income: "Ingresos previstos",
  planReview: "Revisión del plan y reserva", discoveries: "Descubrimientos y Tu espacio",
  reengagement: "Volver cuando quieras" } as const;

export function NotificationSettingsScreen({ onBack }: { onBack: () => void }) {
  const db = useSQLiteContext();
  const { theme } = usePersonalization();
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const load = useCallback(async () => setPreferences(await getNotificationPreferences(db)), [db]);
  useFocusEffect(useCallback(() => { void load().catch(() => setError("No pudimos cargar las preferencias.")); }, [load]));
  const change = async (action: () => Promise<void>) => {
    setBusy(true); setError(null);
    try { await action(); await load(); notificationDataChanged(); }
    catch { setError("No pudimos guardar el cambio."); }
    finally { setBusy(false); }
  };
  const toggleGlobal = () => void change(async () => {
    if (!preferences || Platform.OS === "web") return;
    if (preferences.enabled) { await setNotificationEnabled(db, false); return; }
    const Notifications = await import("expo-notifications");
    let permission = await Notifications.getPermissionsAsync();
    if (!permission.granted) permission = await Notifications.requestPermissionsAsync();
    if (!permission.granted) { setError("El permiso está desactivado. Podés habilitarlo desde los ajustes del dispositivo."); return; }
    await setNotificationEnabled(db, true);
  });
  const choice = (label: string, active: boolean, onPress: () => void) => <Pressable accessibilityRole="switch"
    accessibilityState={{ checked: active, disabled: busy }} disabled={busy} onPress={onPress}
    style={[styles.choice, { borderColor: theme.border, backgroundColor: active ? theme.primarySurface : theme.surface }]}>
    <Text style={{ color: theme.textPrimary, flex: 1 }}>{label}</Text><Text style={{ color: theme.primary }}>{active ? "Sí" : "No"}</Text>
  </Pressable>;
  return <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={["bottom"]}>
    <ScrollView contentContainerStyle={styles.content}>
      <Pressable accessibilityRole="button" onPress={onBack} style={styles.touch}><Text style={{ color: theme.primary }}>← Volver</Text></Pressable>
      <Text accessibilityRole="header" style={[styles.heading, { color: theme.textPrimary }]}>Notificaciones</Text>
      <Text style={{ color: theme.textSecondary }}>Recordatorios locales y tranquilos. Tu información se queda en este dispositivo.</Text>
      {Platform.OS === "web" ? <Text style={{ color: theme.textSecondary }}>Los avisos del dispositivo se configuran en Android.</Text> : preferences && <>
        {choice("Activar notificaciones", preferences.enabled, toggleGlobal)}
        <Text style={{ color: theme.textSecondary }}>Podés elegir los temas aunque los avisos estén apagados.</Text>
        {NOTIFICATION_CATEGORIES.map(category => <View key={category}>
          {choice(labels[category], preferences.categories[category], () => void change(() =>
            setNotificationCategory(db, category, !preferences.categories[category])))}
        </View>)}
        <Text accessibilityRole="header" style={[styles.subheading, { color: theme.textPrimary }]}>Horario permitido</Text>
        <Text style={{ color: theme.textSecondary }}>Sin avisos fuera de la ventana elegida.</Text>
        <View style={styles.hours}>
          {[9, 10, 11, 12].map(hour => <Pressable key={hour} accessibilityRole="button"
            accessibilityState={{ selected: preferences.startHour === hour }} disabled={busy}
            onPress={() => void change(() => setNotificationHours(db, hour, preferences.endHour))}
            style={[styles.hour, { borderColor: preferences.startHour === hour ? theme.primary : theme.border }]}>
            <Text style={{ color: theme.textPrimary }}>Desde {hour}:00</Text></Pressable>)}
        </View>
        <View style={styles.hours}>
          {[19, 20, 21, 22].map(hour => <Pressable key={hour} accessibilityRole="button"
            accessibilityState={{ selected: preferences.endHour === hour }} disabled={busy}
            onPress={() => void change(() => setNotificationHours(db, preferences.startHour, hour))}
            style={[styles.hour, { borderColor: preferences.endHour === hour ? theme.primary : theme.border }]}>
            <Text style={{ color: theme.textPrimary }}>Hasta {hour}:00</Text></Pressable>)}
        </View>
      </>}
      {error && <Text accessibilityRole="alert" style={{ color: theme.negative }}>{error}</Text>}
    </ScrollView>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  content: { width: "100%", maxWidth: 560, alignSelf: "center", padding: 24, gap: 14, paddingBottom: 48 },
  touch: { minHeight: 44, justifyContent: "center" }, heading: { fontSize: 28, fontWeight: "700" },
  subheading: { fontSize: 18, fontWeight: "700", marginTop: 12 },
  choice: { minHeight: 52, borderWidth: 1, borderRadius: 12, padding: 12, flexDirection: "row", alignItems: "center", gap: 12 },
  hours: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  hour: { minHeight: 44, paddingHorizontal: 10, justifyContent: "center", borderWidth: 1, borderRadius: 10 },
});
