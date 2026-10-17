import { Pressable, StyleSheet, Text, View } from "react-native";

import type { AchievementId } from "@/domain/achievements";
import type { SpaceStage } from "@/domain/engagement";
import type { PersonalizationSelection } from "@/domain/personalization";
import type { StoredSlotOverride, StoredVisualPreferences } from "@/data/repositories/spaceCustomizationRepository";
import { usePersonalization } from "@/features/personalization/PersonalizationProvider";
import { themeFor } from "@/features/personalization/themes";
import { SpaceRenderer } from "@/features/space/SpaceRenderer";
import { effectiveAppearance, EMPTY_VISUAL_PREFERENCES } from "@/features/space/spaceCustomization";
import { ContextualHelp } from "@/features/help/ContextualHelp";

const descriptions = ["Un lugar para empezar.", "Tu espacio empieza a tomar forma.", "Un poco más tuyo, paso a paso."];

export function LivingSpace({ stage, surprise, onPersonalize, onAchievements, achievementCount,
  achievementUnlocks = [], selection: override, preview = false, onOpenSpace, slotOverrides, visualPreferences }: {
  stage: SpaceStage; surprise: boolean; onPersonalize?: () => void; onAchievements?: () => void; onOpenSpace?: () => void;
  achievementCount?: number | null; achievementUnlocks?: readonly AchievementId[];
  selection?: PersonalizationSelection; preview?: boolean; slotOverrides?: readonly StoredSlotOverride[];
  visualPreferences?: StoredVisualPreferences;
}) {
  const { preferences } = usePersonalization();
  const selection = override ?? preferences;
  const theme = themeFor(selection.themeId);
  const appearance = effectiveAppearance(selection, achievementUnlocks, visualPreferences ?? EMPTY_VISUAL_PREFERENCES);
  const label = `Tu espacio, etapa ${stage}, paleta ${appearance.paletteId}, ambiente ${appearance.moodId}`;
  return <View style={[styles.card, { backgroundColor: theme.secondarySurface }]}>
    <View style={styles.copy}>
      <View style={styles.titleRow}><Text accessibilityRole="header" style={[styles.title, { color: theme.textPrimary }]}>
        {preview ? "Vista previa" : selection.spaceName || "Tu espacio"}
      </Text>{!preview && <ContextualHelp topicId="space" />}</View>
      <Text style={[styles.caption, { color: theme.textSecondary }]}>{descriptions[stage]}</Text>
      {surprise && <Text accessibilityLiveRegion="polite" style={[styles.surprise, { color: theme.positive }]}>Tu espacio tomó forma: apareció el escritorio.</Text>}
      {onOpenSpace && <Pressable accessibilityRole="button" onPress={onOpenSpace} style={styles.link}>
        <Text style={[styles.linkText, { color: theme.primary }]}>Abrir Tu espacio →</Text>
      </Pressable>}
      {onAchievements && <Pressable accessibilityRole="button" onPress={onAchievements} style={styles.link}>
        <Text style={[styles.linkText, { color: theme.primary }]}>
          {achievementCount === null || achievementCount === undefined ? "Ver descubrimientos →" :
            `${achievementCount} ${achievementCount === 1 ? "descubrimiento" : "descubrimientos"} →`}
        </Text>
      </Pressable>}
      {onPersonalize && <Pressable accessibilityRole="button" onPress={onPersonalize} style={styles.link}>
        <Text style={[styles.linkText, { color: theme.primary }]}>Personalizar →</Text>
      </Pressable>}
    </View>
    <View accessible accessibilityLabel={label} style={styles.scene}>
      <SpaceRenderer stage={stage} selection={selection} achievementUnlocks={achievementUnlocks} width={148}
        slotOverrides={slotOverrides} visualPreferences={visualPreferences} />
    </View>
  </View>;
}

const styles = StyleSheet.create({
  card: { flexDirection: "row", alignItems: "center", gap: 10, padding: 14, borderRadius: 20 },
  copy: { flex: 1, gap: 5 },
  titleRow: { flexDirection: "row", flexWrap: "wrap", alignItems: "center" },
  title: { fontSize: 17, fontWeight: "600" },
  caption: { fontSize: 13, lineHeight: 19 },
  surprise: { fontSize: 13, lineHeight: 19, fontWeight: "600" },
  link: { minHeight: 44, alignSelf: "flex-start", justifyContent: "center" },
  linkText: { fontSize: 13, fontWeight: "700" },
  scene: { width: 148, height: 111, borderRadius: 12, overflow: "hidden" },
});
