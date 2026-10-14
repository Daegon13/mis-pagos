import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { deriveExistingAchievements } from "@/features/achievements/achievementService";
import { usePersonalization } from "@/features/personalization/PersonalizationProvider";
import { ATMOSPHERES, INTERESTS, THEMES } from "@/domain/personalization";
import { capabilitiesFromUnlocks, EDITABLE_SPACE_SLOTS, rewardForCapability } from "@/domain/achievementRewards";
import type { AchievementId } from "@/domain/achievements";
import type { SpaceStage } from "@/domain/engagement";
import type { StoredSlotOverride, StoredVisualPreferences } from "@/data/repositories/spaceCustomizationRepository";
import { effectiveAppearance, eligibleAssetsForSlot } from "./spaceCustomization";
import { chooseCustomColor, chooseDecorationMode, choosePalette, chooseSlot, chooseWindowMood,
  loadSpaceCustomization, resetDecoration, resetSlot, tryAnotherCombination } from "./spaceCustomizationService";
import { SpaceRenderer } from "./SpaceRenderer";
import { ASSET_LABELS, recommendationLabels, SPACE_ASSETS, type AssetId } from "./spaceScene";
import { themeFor } from "@/features/personalization/themes";

type SpaceState = { stage: SpaceStage; unlocks: AchievementId[]; overrides: StoredSlotOverride[];
  visual: StoredVisualPreferences };
export function SpaceScreen({ onBack, onAchievements, onPersonalize }: {
  onBack: () => void; onAchievements: () => void; onPersonalize: () => void;
}) {
  const db = useSQLiteContext();
  const { preferences, theme } = usePersonalization();
  const { width } = useWindowDimensions();
  const previewWidth = Math.min(512, Math.max(240, width - 48));
  const [state, setState] = useState<SpaceState | null>(null);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [wallDraft, setWallDraft] = useState("");
  const [ambientDraft, setAmbientDraft] = useState("");
  const [combinationNote, setCombinationNote] = useState<string | null>(null);
  const refresh = useCallback(async () => {
    await deriveExistingAchievements(db);
    const loaded = await loadSpaceCustomization(db);
    setState(loaded);
    setWallDraft(loaded.visual.wallColor ?? "");
    setAmbientDraft(loaded.visual.ambientColor ?? "");
    setError(null);
  }, [db]);
  useFocusEffect(useCallback(() => {
    void attempt;
    let active = true;
    (async () => {
      try {
        await deriveExistingAchievements(db);
        const loaded = await loadSpaceCustomization(db);
        if (active) { setState(loaded); setWallDraft(loaded.visual.wallColor ?? "");
          setAmbientDraft(loaded.visual.ambientColor ?? ""); setError(null); }
      } catch { if (active) setError("No pudimos cargar Tu espacio. Intentá de nuevo."); }
    })();
    return () => { active = false; };
  }, [db, attempt]));
  const change = async (action: () => Promise<void>) => {
    try { await action(); await refresh(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "No pudimos guardar el cambio."); }
  };
  const capabilities = capabilitiesFromUnlocks(state?.unlocks ?? []);
  const appearance = state ? effectiveAppearance(preferences, state.unlocks, state.visual) : null;
  const button = (label: string, selected: boolean, action: () => void, key: string, swatch?: string) =>
    <Pressable key={key} accessibilityRole="button" accessibilityState={{ selected }} accessibilityLabel={label}
      onPress={action} style={[styles.choice, { backgroundColor: selected ? theme.primarySurface : theme.surface,
        borderColor: selected ? theme.primary : theme.border }]}>
      <View style={styles.choiceContent}>{swatch && <View style={[styles.swatch, { backgroundColor: swatch }]} />}
        <Text style={{ color: theme.textPrimary, fontWeight: selected ? "700" : "500" }}>{label}</Text></View>
    </Pressable>;
  const locked = (capability: Parameters<typeof rewardForCapability>[0]) => {
    const reward = rewardForCapability(capability);
    return <View style={[styles.locked, { backgroundColor: theme.secondarySurface }]}>
      <Text style={{ color: theme.textPrimary, fontWeight: "600" }}>Control bloqueado: {reward.title}</Text>
      <Text style={{ color: theme.textSecondary }}>Se desbloquea con: {reward.howToUnlock}</Text>
      <Pressable accessibilityRole="button" onPress={onAchievements} style={styles.touch}>
        <Text style={{ color: theme.primary, fontWeight: "700" }}>Ver Descubrimientos →</Text>
      </Pressable>
    </View>;
  };

  return <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={["bottom"]}>
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Pressable accessibilityRole="button" onPress={onBack} style={styles.touch}><Text style={{ color: theme.primary }}>← Volver</Text></Pressable>
      <Text accessibilityRole="header" style={[styles.heading, { color: theme.textPrimary }]}>{preferences.spaceName || "Tu espacio"}</Text>
      <Text style={{ color: theme.textSecondary }}>Elegí los colores, la luz y los detalles de tu habitación.</Text>
      {state && <>
        <View accessible accessibilityLabel={`Tu espacio, etapa ${state.stage}, paleta ${appearance?.paletteId}, ambiente ${appearance?.moodId}`}
          style={[styles.preview, { width: previewWidth, height: previewWidth * 3 / 4 }]}>
          <SpaceRenderer stage={state.stage} selection={preferences} achievementUnlocks={state.unlocks}
            slotOverrides={state.overrides} visualPreferences={state.visual} width={previewWidth} />
        </View>
        <Text style={{ color: theme.textSecondary }}>Etapa {state.stage} · Pared {appearance?.wallColor ?? THEMES.find(item => item.id === appearance?.paletteId)?.label} · Luz {appearance?.ambientColor ?? ATMOSPHERES.find(item => item.id === appearance?.moodId)?.label}</Text>
        <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text accessibilityRole="header" style={[styles.cardTitle, { color: theme.textPrimary }]}>Pared</Text>
          <Text style={{ color: theme.textSecondary }}>Elegí el color que querés para la habitación.</Text>
          {capabilities.has("roomPaletteOverride") ? <View style={styles.choices}>
            {button("Seguir tema de la app", state.visual.roomPaletteId === null && !state.visual.wallColor,
              () => void change(() => choosePalette(db, null)), "palette-auto", themeFor(preferences.themeId).spaceWall)}
            {THEMES.map(item => button(item.label, !state.visual.wallColor && state.visual.roomPaletteId === item.id,
              () => void change(() => choosePalette(db, item.id)), `palette-${item.id}`, themeFor(item.id).spaceWall))}
            <Text style={{ color: theme.textSecondary }}>Personalizado · escribí un color hexadecimal (#RRGGBB).</Text>
            <View style={styles.colorRow}>
              <TextInput accessibilityLabel="Color personalizado de pared" value={wallDraft} onChangeText={setWallDraft}
                autoCapitalize="characters" maxLength={7} placeholder="#8D6FAA" placeholderTextColor={theme.muted}
                style={[styles.colorInput, { color: theme.textPrimary, backgroundColor: theme.background, borderColor: theme.border }]} />
              {button("Aplicar pared", !!state.visual.wallColor, () => void change(() => chooseCustomColor(db, "wall", wallDraft)), "wall-custom",
                state.visual.wallColor ?? undefined)}
            </View>
          </View> : locked("roomPaletteOverride")}
        </View>
        <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text accessibilityRole="header" style={[styles.cardTitle, { color: theme.textPrimary }]}>Ambiente e iluminación</Text>
          <Text style={{ color: theme.textSecondary }}>Cambiá la sensación de luz y el ambiente del espacio. Es independiente de la pared.</Text>
          {capabilities.has("windowMoodOverride") ? <View style={styles.choices}>
            {button("Seguir atmósfera actual", state.visual.windowMoodId === null && !state.visual.ambientColor,
              () => void change(() => chooseWindowMood(db, null)), "mood-auto")}
            {ATMOSPHERES.map(item => button(item.label, !state.visual.ambientColor && state.visual.windowMoodId === item.id,
              () => void change(() => chooseWindowMood(db, item.id)), `mood-${item.id}`))}
            <Text style={{ color: theme.textSecondary }}>Personalizado · luz y ventana (#RRGGBB).</Text>
            <View style={styles.colorRow}>
              <TextInput accessibilityLabel="Color personalizado de ambiente" value={ambientDraft} onChangeText={setAmbientDraft}
                autoCapitalize="characters" maxLength={7} placeholder="#8D6FAA" placeholderTextColor={theme.muted}
                style={[styles.colorInput, { color: theme.textPrimary, backgroundColor: theme.background, borderColor: theme.border }]} />
              {button("Aplicar ambiente", !!state.visual.ambientColor, () => void change(() => chooseCustomColor(db, "ambient", ambientDraft)), "ambient-custom",
                state.visual.ambientColor ?? undefined)}
            </View>
          </View> : locked("windowMoodOverride")}
        </View>
        <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text accessibilityRole="header" style={[styles.cardTitle, { color: theme.textPrimary }]}>Decoración</Text>
          <Text style={{ color: theme.textSecondary }}>Elegí los objetos o dejá que Mis Pagos los combine según tus intereses.</Text>
          <Text style={{ color: theme.textSecondary }}>Tus intereses: {preferences.interestIds.length
            ? preferences.interestIds.slice(0, 3).map(id => INTERESTS.find(item => item.id === id)?.label ?? id).join(" · ")
            : "ninguno por ahora"}</Text>
          <Pressable accessibilityRole="button" onPress={onPersonalize} style={styles.touch}>
            <Text style={{ color: theme.primary, fontWeight: "600" }}>Cambiar intereses →</Text>
          </Pressable>
          <View style={styles.choices}>
            {button("Automático", state.visual.decorationMode === "automatic",
              () => void change(() => chooseDecorationMode(db, "automatic")), "mode-automatic")}
            {button("Manual", state.visual.decorationMode === "manual",
              () => void change(() => chooseDecorationMode(db, "manual")), "mode-manual")}
          </View>
          {state.visual.decorationMode === "automatic" ? <>
            <Text style={{ color: theme.textSecondary }}>Usamos tus intereses para crear distintas versiones de tu espacio.</Text>
            {preferences.interestIds.length > 0 && <Text style={{ color: theme.primary, fontWeight: "600" }}>Basado en tus intereses</Text>}
            <Pressable accessibilityRole="button" onPress={() => void change(async () => {
              const changed = await tryAnotherCombination(db, preferences);
              setCombinationNote(changed ? null : "No hay otra combinación disponible por ahora.");
            })} style={[styles.primary, { backgroundColor: theme.primary }]}>
              <Text style={{ color: theme.textOnPrimary, fontWeight: "700" }}>Probar otra combinación</Text>
            </Pressable>
            {combinationNote && <Text accessibilityLiveRegion="polite" style={{ color: theme.textSecondary }}>{combinationNote}</Text>}
          </> : <>
            <Text style={{ color: theme.textSecondary }}>Elegí objeto por objeto en las zonas desbloqueadas. Las recomendaciones no limitan tus opciones.</Text>
            <Pressable accessibilityRole="button" onPress={() => setEditing(value => !value)} style={styles.touch}>
              <Text style={{ color: theme.primary, fontWeight: "700" }}>{editing ? "Ocultar objetos" : "Elegir objetos"}</Text>
            </Pressable>
          </>}
        </View>
        {state.visual.decorationMode === "manual" && editing && <>
          <Text style={{ color: theme.textSecondary }}>Vacío deja libre la zona. Planta, escritorio y libros permanecen según la etapa.</Text>
          {EDITABLE_SPACE_SLOTS.map(slot => {
            const current = state.overrides.find(row => row.slotId === slot.id);
            const unlocked = capabilities.has(slot.capabilityId);
            const eligible = eligibleAssetsForSlot(slot.id, state.stage);
            return <View key={slot.id} style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>{slot.title}</Text>
              {unlocked && state.stage >= 2 ? <>
                <Text style={{ color: theme.textSecondary }}>Actual: {current === undefined ? "Automático" : current.assetId === null ? "Vacío" :
                  eligible.includes(current.assetId as AssetId) ? ASSET_LABELS[current.assetId as AssetId] :
                    "Objeto no disponible; se muestra Automático"}</Text>
                <View style={styles.choices}>
                  {button("Automático", current === undefined, () => void change(() => resetSlot(db, slot.id)), `${slot.id}-auto`)}
                  {button("Vacío", current?.assetId === null, () => void change(() => chooseSlot(db, slot.id, null)), `${slot.id}-empty`)}
                </View>
                <View style={styles.choices}>{eligible.map(id => {
                  const usedElsewhere = state.overrides.some(row => row.slotId !== slot.id && row.assetId === id);
                  const recommendations = recommendationLabels(id);
                  return <Pressable key={id} accessibilityRole="button" accessibilityState={{ selected: current?.assetId === id, disabled: usedElsewhere }}
                    accessibilityLabel={`${ASSET_LABELS[id]}, ${slot.title}${usedElsewhere ? ", elegido en otra zona" : ""}`}
                    disabled={usedElsewhere} onPress={() => void change(() => chooseSlot(db, slot.id, id))}
                    style={[styles.asset, { backgroundColor: current?.assetId === id ? theme.primarySurface : theme.secondarySurface,
                      borderColor: current?.assetId === id ? theme.primary : theme.border, opacity: usedElsewhere ? 0.55 : 1 }]}>
                    <Image source={SPACE_ASSETS[id].source} resizeMode="contain" style={styles.thumbnail} />
                    <Text style={{ color: theme.textPrimary, textAlign: "center", fontSize: 12, fontWeight: "600" }}>{ASSET_LABELS[id]}</Text>
                    {recommendations.length > 0 && <Text style={{ color: theme.textSecondary, textAlign: "center", fontSize: 11 }}>
                      Recomendado por: {recommendations.join(" · ")}</Text>}
                  </Pressable>;
                })}</View>
              </> : unlocked ? <Text style={{ color: theme.textSecondary }}>Las zonas de decoración aparecen con el escritorio en la etapa 2.</Text> : locked(slot.capabilityId)}
            </View>;
          })}
          {state.stage >= 2 && <Pressable accessibilityRole="button" onPress={() => void change(() => resetDecoration(db))} style={styles.touch}>
            <Text style={{ color: theme.primary, fontWeight: "700" }}>Restablecer decoración sugerida</Text>
          </Pressable>}
        </>}
      </>}
      {error && <View><Text accessibilityRole="alert" style={{ color: theme.negative }}>{error}</Text>
        {!state && <Pressable accessibilityRole="button" onPress={() => setAttempt(value => value + 1)} style={styles.touch}>
          <Text style={{ color: theme.primary }}>Reintentar</Text>
        </Pressable>}</View>}
      {!state && !error && <Text style={{ color: theme.textSecondary }}>Cargando Tu espacio...</Text>}
    </ScrollView>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  content: { width: "100%", maxWidth: 560, alignSelf: "center", padding: 24, paddingBottom: 56, gap: 14 },
  touch: { minHeight: 44, alignSelf: "flex-start", justifyContent: "center", paddingHorizontal: 4 },
  heading: { fontSize: 28, fontWeight: "700" }, sectionTitle: { fontSize: 22, fontWeight: "700", marginTop: 12 },
  preview: { borderRadius: 18, overflow: "hidden", alignSelf: "center" },
  primary: { minHeight: 48, alignSelf: "flex-start", justifyContent: "center", paddingHorizontal: 20, borderRadius: 24 },
  section: { borderWidth: 1, borderRadius: 16, padding: 16, gap: 12 }, cardTitle: { fontSize: 17, fontWeight: "700" },
  locked: { padding: 12, borderRadius: 12, gap: 6 }, choices: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  choice: { minHeight: 44, borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, justifyContent: "center" },
  choiceContent: { flexDirection: "row", alignItems: "center", gap: 8 },
  colorRow: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8 },
  swatch: { width: 22, height: 22, borderRadius: 11, borderWidth: 1, borderColor: "#809088" },
  colorInput: { minWidth: 122, minHeight: 44, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, fontSize: 16 },
  asset: { width: 132, minHeight: 160, borderWidth: 1, borderRadius: 12, padding: 8, alignItems: "center", justifyContent: "center", gap: 4 },
  thumbnail: { width: 72, height: 72 },
});
