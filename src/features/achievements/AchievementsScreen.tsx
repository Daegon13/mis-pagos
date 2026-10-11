import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { listAchievementUnlocks } from "@/data/repositories/achievementRepository";
import { ACHIEVEMENTS, type AchievementId } from "@/domain/achievements";
import { ACHIEVEMENT_REWARDS } from "@/domain/achievementRewards";
import { usePersonalization } from "@/features/personalization/PersonalizationProvider";
import { deriveExistingAchievements } from "./achievementService";
import { ContextualHelp } from "@/features/help/ContextualHelp";

export function AchievementsScreen({ onBack, onOpenSpace }: { onBack: () => void; onOpenSpace: () => void }) {
  const db = useSQLiteContext();
  const { theme } = usePersonalization();
  const [unlocked, setUnlocked] = useState<Set<AchievementId> | null>(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useFocusEffect(useCallback(() => {
    void attempt;
    let active = true;
    deriveExistingAchievements(db).then(() => listAchievementUnlocks(db)).then(rows => {
      if (active) { setUnlocked(new Set(rows.map(row => row.achievement_id))); setError(false); }
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
        <Text style={{ color: theme.textSecondary }}>{unlocked.size} {unlocked.size === 1 ? "descubrimiento" : "descubrimientos"}</Text>
        {ACHIEVEMENTS.map(item => {
          const found = unlocked.has(item.id);
          const reward = ACHIEVEMENT_REWARDS.find(candidate => candidate.achievementId === item.id);
          if (!reward) return null;
          return <View key={item.id} style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.title, { color: theme.textPrimary }]}>{item.title}</Text>
            <Text style={stylesText(theme.textSecondary)}>{reward.howToUnlock}</Text>
            <Text style={[styles.rewardLabel, { color: theme.textSecondary }]}>RECOMPENSA</Text>
            <Text style={[styles.title, { color: theme.textPrimary }]}>{reward.title}</Text>
            <Text style={stylesText(theme.textSecondary)}>{reward.shortDescription}</Text>
            <Text style={{ color: found ? theme.positive : theme.textSecondary }}>
              {found ? "✓ Descubierto" : "Todavía no desbloqueado"}
            </Text>
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
  title: { fontSize: 17, fontWeight: "600" },
  rewardLabel: { fontSize: 11, fontWeight: "700", letterSpacing: 1, marginTop: 6 },
  action: { minHeight: 44, alignSelf: "flex-start", justifyContent: "center", paddingRight: 12 },
});
