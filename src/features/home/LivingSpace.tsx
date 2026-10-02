import { Pressable, StyleSheet, Text, View } from "react-native";

import type { SpaceStage } from "@/domain/engagement";
import { composeSpace, type PersonalizationSelection, type SceneDetail } from "@/domain/personalization";
import { usePersonalization } from "@/features/personalization/PersonalizationProvider";
import { themeFor } from "@/features/personalization/themes";

const descriptions = ["Un lugar para empezar.", "Tu espacio empieza a tomar forma.", "Un poco más tuyo, paso a paso."];
const stageDescriptions = ["ventana", "ventana y planta", "ventana, planta, mesa y libros"];
const glyphs: Record<SceneDetail, string> = {
  foliage: "✿", books: "▥", monitor: "▣", record: "◎", animal: "♧",
  mug: "♨", map: "▤", frame: "▧", moon: "☾", device: "▣", lamp: "◕",
};
const detailLabels: Record<SceneDetail, string> = {
  foliage: "naturaleza", books: "libros", monitor: "gaming", record: "música",
  animal: "animales", mug: "café", map: "viajes", frame: "arte",
  moon: "noche", device: "tecnología", lamp: "hogar",
};

function Detail({ kind, slot, color, background }: {
  kind: SceneDetail; slot: "primary" | "secondary" | "ambient"; color: string; background: string;
}) {
  const position = slot === "primary" ? styles.primarySlot : slot === "secondary" ? styles.secondarySlot : styles.ambientSlot;
  return <View style={[styles.detail, position, { backgroundColor: background, borderColor: color }]}>
    <Text accessible={false} style={[styles.glyph, { color }]}>{glyphs[kind]}</Text>
  </View>;
}

export function LivingSpace({ stage, surprise, onPersonalize, selection: override, preview = false }: {
  stage: SpaceStage; surprise: boolean; onPersonalize?: () => void;
  selection?: PersonalizationSelection; preview?: boolean;
}) {
  const { preferences } = usePersonalization();
  const selection = override ?? preferences;
  const theme = themeFor(selection.themeId);
  const scene = composeSpace(selection, stage);
  const wall = scene.atmosphereId === "nocturno" ? "#263A57" :
    scene.atmosphereId === "calido" ? "#F1D9BF" :
      scene.atmosphereId === "minimalista" ? "#E7E7E2" :
        scene.atmosphereId === "colorido" ? "#E5D8EB" : theme.sceneWall;
  const floor = scene.atmosphereId === "nocturno" ? "#354B69" : theme.sceneFloor;
  const details = [scene.primaryDetail, scene.secondaryDetail, scene.ambientDetail].filter(Boolean) as SceneDetail[];
  const label = `Habitación con ${stageDescriptions[stage]}, ambiente ${scene.atmosphereId}` +
    (details.length ? ` y detalles de ${details.map((detail) => detailLabels[detail]).join(", ")}` : "");

  return <View style={[styles.card, { backgroundColor: theme.secondarySurface }]}>
    <View style={styles.copy}>
      <Text accessibilityRole="header" style={[styles.title, { color: theme.textPrimary }]}>
        {preview ? "Vista previa" : selection.spaceName || "Tu espacio"}
      </Text>
      <Text style={[styles.caption, { color: theme.textSecondary }]}>{descriptions[stage]}</Text>
      {surprise && <Text accessibilityLiveRegion="polite" style={[styles.surprise, { color: theme.positive }]}>Algo cambió en tu espacio.</Text>}
      {onPersonalize && <Pressable accessibilityRole="button" onPress={onPersonalize} style={styles.personalize}>
        <Text style={[styles.personalizeText, { color: theme.primary }]}>Personalizar →</Text>
      </Pressable>}
    </View>
    <View accessible accessibilityLabel={label} style={[styles.scene, { backgroundColor: wall }]}>
      <View style={[styles.floor, { backgroundColor: floor }]} />
      <View style={[styles.window, { backgroundColor: theme.sceneWindow, borderColor: theme.surface }]}>
        <View style={[styles.windowBar, { backgroundColor: theme.surface }]} />
      </View>
      {stage >= 1 && <>
        <View style={[styles.stem, { backgroundColor: theme.sceneLeaf }]} />
        <View style={[styles.leafLeft, { backgroundColor: theme.sceneLeaf }]} />
        <View style={[styles.leafRight, { backgroundColor: theme.sceneLeaf }]} />
        <View style={[styles.pot, { backgroundColor: theme.accent }]} />
      </>}
      {stage >= 2 && <>
        <View style={[styles.tableLeg, { backgroundColor: theme.sceneFurniture }]} />
        <View style={[styles.table, { backgroundColor: theme.sceneFurniture }]} />
        <View style={[styles.bookOne, { backgroundColor: theme.accent }]} />
        <View style={[styles.bookTwo, { backgroundColor: theme.primary }]} />
      </>}
      {scene.primaryDetail && <Detail kind={scene.primaryDetail} slot="primary" color={theme.primary} background={theme.surface} />}
      {scene.secondaryDetail && <Detail kind={scene.secondaryDetail} slot="secondary" color={theme.primary} background={theme.surface} />}
      {scene.ambientDetail && <Detail kind={scene.ambientDetail} slot="ambient" color={theme.primary} background={theme.surface} />}
    </View>
  </View>;
}

const styles = StyleSheet.create({
  card: { flexDirection: "row", alignItems: "center", gap: 10, padding: 14, borderRadius: 20 },
  copy: { flex: 1, gap: 5 },
  title: { fontSize: 17, fontWeight: "600" },
  caption: { fontSize: 13, lineHeight: 19 },
  surprise: { fontSize: 13, lineHeight: 19, fontWeight: "600" },
  personalize: { minHeight: 44, alignSelf: "flex-start", justifyContent: "center" },
  personalizeText: { fontSize: 13, fontWeight: "700" },
  scene: { width: 148, height: 108, borderRadius: 12, overflow: "hidden" },
  floor: { position: "absolute", bottom: 0, height: 23, width: "100%" },
  window: { position: "absolute", top: 12, left: 15, width: 38, height: 42, borderRadius: 17, borderWidth: 4 },
  windowBar: { position: "absolute", left: 13, width: 3, height: "100%" },
  stem: { position: "absolute", left: 27, bottom: 28, height: 22, width: 2 },
  leafLeft: { position: "absolute", left: 16, bottom: 41, width: 13, height: 9, borderRadius: 8, transform: [{ rotate: "30deg" }] },
  leafRight: { position: "absolute", left: 28, bottom: 46, width: 12, height: 9, borderRadius: 8, transform: [{ rotate: "-30deg" }] },
  pot: { position: "absolute", left: 20, bottom: 17, width: 18, height: 15, borderBottomLeftRadius: 6, borderBottomRightRadius: 6 },
  table: { position: "absolute", left: 63, bottom: 38, width: 58, height: 6, borderRadius: 3 },
  tableLeg: { position: "absolute", left: 88, bottom: 16, width: 5, height: 25 },
  bookOne: { position: "absolute", left: 71, bottom: 44, width: 23, height: 5, borderRadius: 1 },
  bookTwo: { position: "absolute", left: 74, bottom: 49, width: 18, height: 4, borderRadius: 1 },
  primarySlot: { right: 6, bottom: 25 },
  secondarySlot: { right: 38, bottom: 25 },
  ambientSlot: { right: 7, top: 5 },
  detail: { position: "absolute", width: 28, height: 28, alignItems: "center", justifyContent: "center", borderRadius: 7, borderWidth: 2 },
  glyph: { fontSize: 20, lineHeight: 24, fontWeight: "700" },
});
