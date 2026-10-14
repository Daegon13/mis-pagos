import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { listAchievementUnlocks } from "@/data/repositories/achievementRepository";
import { ACHIEVEMENTS, type AchievementId } from "@/domain/achievements";
import { ACHIEVEMENT_REWARDS, EDITABLE_SPACE_SLOTS } from "@/domain/achievementRewards";
import { usePersonalization } from "@/features/personalization/PersonalizationProvider";
import { deriveExistingAchievements } from "./achievementService";
import { ContextualHelp } from "@/features/help/ContextualHelp";
import { loadSpaceCustomization } from "@/features/space/spaceCustomizationService";
import { SPACE_ASSETS, type AssetId } from "@/features/space/spaceScene";
import type { StoredSlotOverride, StoredVisualPreferences } from "@/data/repositories/spaceCustomizationRepository";
import { themeFor } from "@/features/personalization/themes";

const rewardPreview: Partial<Record<AchievementId, AssetId>> = {
  FIRST_PERSONALIZED_SPACE: "monitor", FIRST_COMMITMENT: "mug",
  FIRST_EXPECTED_INCOME: "speakerVinyl", FIRST_RESOLVED_MOVEMENT: "gamepad",
  FIRST_OVERDUE_RESOLVED: "moonLamp",
};

function rewardInUse(id: AchievementId, overrides: readonly StoredSlotOverride[], visual: StoredVisualPreferences): boolean {
  const reward = ACHIEVEMENT_REWARDS.find(item => item.achievementId === id);
  if (!reward) return false;
  return reward.capabilityIds.some(capability =>
    capability === "roomPaletteOverride" ? visual.roomPaletteId !== null || visual.wallColor !== null :
      capability === "windowMoodOverride" ? visual.windowMoodId !== null || visual.ambientColor !== null :
        overrides.some(row => EDITABLE_SPACE_SLOTS.some(slot => slot.capabilityId === capability && slot.id === row.slotId)));
}

export function AchievementsScreen({ onBack, onOpenSpace }: { onBack: () => void; onOpenSpace: () => void }) {
  const db = useSQLiteContext();
  const { theme } = usePersonalization();
  const [unlocked, setUnlocked] = useState<Set<AchievementId> | null>(null);
  const [customization, setCustomization] = useState<Awaited<ReturnType<typeof loadSpaceCustomization>> | null>(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useFocusEffect(useCallback(() => {
    void attempt;
    let active = true;
    deriveExistingAchievements(db).then(() => Promise.all([listAchievementUnlocks(db), loadSpaceCustomization(db)])).then(([rows, space]) => {
      if (active) { setUnlocked(new Set(rows.map(row => row.achievement_id))); setCustomization(space); setError(false); }
    }).catch(() => { if (active) setError(true); });
    return () => { active = false; };
  }, [db, attempt]));

  return <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={["bottom"]}>
    <ScrollView contentContainerStyle={styles.content}>
      <Pressable accessibilityRole="button" onPress={onBack} style={styles.back}>
        <Text style={{ color: theme.primary }}>← Volver</Text>
      </Pressable>
      <View style={styles.titleRow}><Text accessibilityRole="header" style={[styles.heading, { color: theme.textPrimary }]}>Descubrimientos</Text>
        <ContextualHelp topicId="discoveries" /></View>
      <Text style={{ color: theme.textSecondary }}>Una historia de lo que fuiste organizando, a tu ritmo.</Text>
      {error ? <View style={styles.card}>
        <Text accessibilityRole="alert" style={{ color: theme.textSecondary }}>No pudimos cargar tus descubrimientos.</Text>
        <Pressable accessibilityRole="button" onPress={() => setAttempt(value => value + 1)} style={styles.back}>
          <Text style={{ color: theme.primary }}>Reintentar</Text>
        </Pressable>
      </View> : unlocked === null ? <Text style={{ color: theme.textSecondary }}>Cargando...</Text> : <>
        <Text style={{ color: theme.textSecondary }}>{unlocked.size} de {ACHIEVEMENTS.length} descubrimientos · En uso significa que elegiste ese control en Tu espacio.</Text>
        {ACHIEVEMENTS.map(item => {
          const found = unlocked.has(item.id);
          const reward = ACHIEVEMENT_REWARDS.find(candidate => candidate.achievementId === item.id);
          if (!reward) return null;
          const inUse = found && customization ? rewardInUse(item.id, customization.overrides, customization.visual) : false;
          const preview = rewardPreview[item.id];
          return <View key={item.id} style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.topRow}>
              {preview ? <View style={[styles.preview, { backgroundColor: theme.secondarySurface }]}>
                <Image source={SPACE_ASSETS[preview].source} resizeMode="contain" style={styles.previewImage} />
              </View> : <View style={[styles.preview, { backgroundColor: theme.primarySurface, borderColor: theme.border, borderWidth: 1 }]}>
                {item.id === "FIRST_RESERVE" ? <View style={styles.swatches}>
                  {(["bosque", "terracota", "lavanda"] as const).map(id => <View key={id}
                    style={[styles.colorSample, { backgroundColor: themeFor(id).spaceWall }]} />)}
                  {customization?.visual.wallColor && <View style={[styles.colorSample,
                    { backgroundColor: customization.visual.wallColor }]} />}
                </View> : <View style={[styles.windowSample,
                  { backgroundColor: customization?.visual.ambientColor ?? theme.spaceWindowTint }]}>
                  <Text style={{ color: theme.primary, fontSize: 22 }}>☼</Text>
                </View>}
              </View>}
              <View style={styles.topText}>
                <Text style={[styles.title, { color: theme.textPrimary }]}>{item.title}</Text>
                <Text style={{ color: inUse ? theme.positive : found ? theme.primary : theme.textSecondary, fontWeight: "700" }}>
                  {inUse ? "En uso" : found ? "Desbloqueado" : "Bloqueado"}</Text>
              </View>
            </View>
            <Text style={stylesText(theme.textSecondary)}>Para desbloquear · {reward.howToUnlock}</Text>
            <View style={[styles.rewardBlock, { backgroundColor: theme.secondarySurface }]}>
              <Text style={[styles.rewardLabel, { color: theme.textSecondary }]}>EN TU ESPACIO</Text>
              <Text style={[styles.title, { color: theme.textPrimary }]}>{reward.title}</Text>
              <Text style={stylesText(theme.textSecondary)}>{reward.shortDescription}</Text>
              {preview && <Text style={stylesText(theme.textSecondary)}>Ejemplo de objeto que podés elegir en esa zona.</Text>}
            </View>
            {found && <Pressable accessibilityRole="button" onPress={onOpenSpace} style={styles.action}>
              <Text style={{ color: theme.primary, fontWeight: "600" }}>{reward.ctaLabel} →</Text>
            </Pressable>}
          </View>;
        })}
      </>}
    </ScrollView>
  </SafeAreaView>;
}

const stylesText = (color: string) => ({ color, lineHeight: 21 });

const styles = StyleSheet.create({
  content: { width: "100%", maxWidth: 560, alignSelf: "center", padding: 24, paddingBottom: 48, gap: 14 },
  back: { minHeight: 44, alignSelf: "flex-start", justifyContent: "center" },
  heading: { fontSize: 28, fontWeight: "700" },
  titleRow: { flexDirection: "row", flexWrap: "wrap", alignItems: "center" },
  card: { padding: 16, borderRadius: 16, borderWidth: 1, gap: 7 },
  topRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  topText: { flex: 1, gap: 4 },
  preview: { width: 68, height: 68, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  previewImage: { width: 60, height: 60 },
  swatches: { flexDirection: "row", gap: 2 },
  colorSample: { width: 16, height: 40, borderRadius: 5, borderWidth: 1, borderColor: "#809088" },
  windowSample: { width: 43, height: 43, borderRadius: 9, borderWidth: 3, borderColor: "#809088", alignItems: "center", justifyContent: "center" },
  rewardBlock: { padding: 12, borderRadius: 12, gap: 4 },
  title: { fontSize: 17, fontWeight: "600" },
  rewardLabel: { fontSize: 11, fontWeight: "700", letterSpacing: 1, marginTop: 6 },
  action: { minHeight: 44, alignSelf: "flex-start", justifyContent: "center", paddingRight: 12 },
});
