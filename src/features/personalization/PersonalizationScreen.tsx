import { useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ATMOSPHERES, INTERESTS, MAX_INTERESTS, MAX_SPACE_NAME_LENGTH,
  THEMES, type InterestId, type PersonalizationSelection } from "@/domain/personalization";
import { LivingSpace } from "@/features/home/LivingSpace";
import { usePersonalization } from "./PersonalizationProvider";
import { themeFor } from "./themes";

export function PersonalizationScreen({ onClose }: { onClose: () => void }) {
  const { preferences, save, error: loadError, reload } = usePersonalization();
  const [draft, setDraft] = useState<PersonalizationSelection | null>(null);
  const [busy, setBusy] = useState(false);
  const saving = useRef(false);
  const [interestError, setInterestError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const selection = draft ?? preferences;
  const theme = themeFor(selection.themeId);

  function changeInterest(id: InterestId) {
    setInterestError(null);
    if (selection.interestIds.includes(id)) {
      setDraft({ ...selection, interestIds: selection.interestIds.filter((selected) => selected !== id) });
    } else if (selection.interestIds.length >= MAX_INTERESTS) {
      setInterestError("Elegí hasta 3 intereses. Quitá uno para agregar otro.");
    } else {
      setDraft({ ...selection, interestIds: [...selection.interestIds, id] });
    }
  }

  async function submit() {
    if (saving.current) return;
    saving.current = true;
    setBusy(true);
    setSaveError(null);
    try { await save(selection); onClose(); }
    catch { setSaveError("No pudimos guardar tu espacio. Intentá de nuevo."); }
    finally { saving.current = false; setBusy(false); }
  }

  return <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
        <Pressable accessibilityRole="button" onPress={onClose} style={styles.skip}>
          <Text style={[styles.link, { color: theme.primary }]}>Omitir / Volver</Text>
        </Pressable>
        <Text accessibilityRole="header" style={[styles.heading, { color: theme.textPrimary }]}>Hagamos Mis Pagos un poco más tuyo</Text>
        <Text style={[styles.description, { color: theme.textSecondary }]}>Elegí lo que te guste. Podés cambiarlo cuando quieras.</Text>
        {loadError && <View style={styles.section}>
          <Text accessibilityRole="alert" style={{ color: theme.negative }}>No pudimos cargar tus preferencias.</Text>
          <Pressable accessibilityRole="button" onPress={reload}><Text style={[styles.link, { color: theme.primary }]}>Reintentar</Text></Pressable>
        </View>}
        <View style={styles.section}>
          <Text accessibilityRole="header" style={[styles.sectionTitle, { color: theme.textPrimary }]}>Apariencia</Text>
          <View style={styles.options}>
            {THEMES.map((option) => <Pressable key={option.id} accessibilityRole="radio"
              accessibilityState={{ selected: selection.themeId === option.id }}
              onPress={() => setDraft({ ...selection, themeId: option.id })}
              style={[styles.themeChoice, { backgroundColor: theme.surface, borderColor: selection.themeId === option.id ? theme.primary : theme.border }]}>
              <View style={[styles.swatch, { backgroundColor: themeFor(option.id).primary }]} />
              <Text style={[styles.choiceText, { color: theme.textPrimary }]}>{option.label}{selection.themeId === option.id ? " ✓" : ""}</Text>
            </Pressable>)}
          </View>
        </View>
        <View style={styles.section}>
          <Text accessibilityRole="header" style={[styles.sectionTitle, { color: theme.textPrimary }]}>Intereses</Text>
          <Text style={[styles.description, { color: theme.textSecondary }]}>Opcional · elegí hasta 3 ({selection.interestIds.length}/3)</Text>
          <View style={styles.options}>
            {INTERESTS.map((option) => {
              const selected = selection.interestIds.includes(option.id);
              return <Pressable key={option.id} accessibilityRole="checkbox" accessibilityState={{ checked: selected }}
                onPress={() => changeInterest(option.id)}
                style={[styles.chip, { backgroundColor: selected ? theme.primary : theme.surface,
                  borderColor: selected ? theme.primary : theme.border }]}>
                <Text style={[styles.choiceText, { color: selected ? theme.textOnPrimary : theme.textPrimary }]}>
                  {selected ? "✓ " : ""}{option.label}</Text>
              </Pressable>;
            })}
          </View>
          {interestError && <Text accessibilityRole="alert" accessibilityLiveRegion="polite"
            style={{ color: theme.negative }}>{interestError}</Text>}
        </View>
        <View style={styles.section}>
          <Text accessibilityRole="header" style={[styles.sectionTitle, { color: theme.textPrimary }]}>Ambiente</Text>
          <View style={styles.options}>
            {ATMOSPHERES.map((option) => <Pressable key={option.id} accessibilityRole="radio"
              accessibilityState={{ selected: selection.atmosphereId === option.id }}
              onPress={() => setDraft({ ...selection, atmosphereId: option.id })}
              style={[styles.chip, { backgroundColor: selection.atmosphereId === option.id ? theme.primary : theme.surface,
                borderColor: selection.atmosphereId === option.id ? theme.primary : theme.border }]}>
              <Text style={[styles.choiceText, { color: selection.atmosphereId === option.id ? theme.textOnPrimary : theme.textPrimary }]}>
                {selection.atmosphereId === option.id ? "✓ " : ""}{option.label}</Text>
            </Pressable>)}
          </View>
        </View>
        <View style={styles.section}>
          <Text accessibilityRole="header" style={[styles.sectionTitle, { color: theme.textPrimary }]}>Nombre de tu espacio</Text>
          <TextInput accessibilityLabel="Nombre de tu espacio" value={selection.spaceName}
            onChangeText={(spaceName) => setDraft({ ...selection, spaceName })}
            maxLength={MAX_SPACE_NAME_LENGTH} placeholder="Tu espacio · Ej. Mi rincón"
            placeholderTextColor={theme.muted} style={[styles.input, { color: theme.textPrimary,
              backgroundColor: theme.surface, borderColor: theme.border }]} />
          <Text style={[styles.description, { color: theme.textSecondary }]}>Opcional · hasta {MAX_SPACE_NAME_LENGTH} caracteres.</Text>
        </View>
        <LivingSpace stage={0} surprise={false} selection={selection} preview />
        {saveError && <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={{ color: theme.negative }}>{saveError}</Text>}
        <Pressable accessibilityRole="button" accessibilityState={{ disabled: busy, busy }} disabled={busy}
          onPress={() => { void submit(); }} style={[styles.save, { backgroundColor: theme.primary }, busy && styles.dim]}>
          <Text style={[styles.saveText, { color: theme.textOnPrimary }]}>{busy ? "Guardando..." : "Guardar apariencia"}</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flexGrow: 1, maxWidth: 560, width: "100%", alignSelf: "center", padding: 24, paddingBottom: 48, gap: 20 },
  skip: { minHeight: 44, alignSelf: "flex-start", justifyContent: "center" },
  link: { fontSize: 16, fontWeight: "600" },
  heading: { fontSize: 28, lineHeight: 35, fontWeight: "700" },
  description: { fontSize: 14, lineHeight: 21 },
  section: { gap: 10 },
  sectionTitle: { fontSize: 18, fontWeight: "600" },
  options: { flexDirection: "row", flexWrap: "wrap", gap: 9 },
  themeChoice: { flexDirection: "row", alignItems: "center", gap: 8, minHeight: 52,
    minWidth: "46%", padding: 10, borderWidth: 2, borderRadius: 12 },
  swatch: { width: 22, height: 22, borderRadius: 11 },
  choiceText: { fontSize: 15, fontWeight: "600" },
  chip: { minHeight: 46, borderRadius: 13, paddingHorizontal: 12, paddingVertical: 10,
    borderWidth: 1, justifyContent: "center" },
  input: { minHeight: 52, borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, fontSize: 17 },
  save: { minHeight: 54, borderRadius: 14, alignItems: "center", justifyContent: "center", padding: 14 },
  saveText: { fontSize: 17, fontWeight: "700" },
  dim: { opacity: 0.65 },
});
