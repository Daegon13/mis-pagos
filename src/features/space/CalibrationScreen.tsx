import { useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";

import { DEFAULT_SELECTION, type PersonalizationSelection } from "@/domain/personalization";
import { SpaceRenderer, type CalibrationOffset } from "./SpaceRenderer";
import { resolveSpaceScene, SCENE_HEIGHT, SCENE_WIDTH, type AssetId } from "./spaceScene";

const master = __DEV__ ? require("../../../assets/space/calibration/master-reference.jpg") : null;
const profiles: { name: string; selection: PersonalizationSelection }[] = [
  { name: "Naturaleza + Hogar", selection: { ...DEFAULT_SELECTION, interestIds: ["naturaleza", "hogar"] } },
  { name: "Gaming + Música", selection: { ...DEFAULT_SELECTION, themeId: "noche", atmosphereId: "nocturno", interestIds: ["gaming", "tecnologia", "musica"] } },
  { name: "Libros + Café", selection: { ...DEFAULT_SELECTION, themeId: "terracota", atmosphereId: "calido", interestIds: ["libros", "cafe"] } },
  { name: "Animales + Noche", selection: { ...DEFAULT_SELECTION, themeId: "ciruela", atmosphereId: "nocturno", interestIds: ["animales", "noche"] } },
];

export function CalibrationScreen() {
  const { width } = useWindowDimensions();
  const [profileIndex, setProfileIndex] = useState(0);
  const [sceneOpacity, setSceneOpacity] = useState(0.7);
  const [selected, setSelected] = useState<AssetId>("desk");
  const [offsets, setOffsets] = useState<CalibrationOffset>({});
  const selection = profiles[profileIndex].selection;
  const objects = resolveSpaceScene(2, selection).objects;
  const active = objects.find(object => object.assetId === selected) ?? objects[0];
  const offset = offsets[active.assetId] ?? { x: 0, y: 0, width: 0, zIndex: 0 };
  const sceneWidth = Math.min(width - 24, 650);
  const sceneHeight = sceneWidth * SCENE_HEIGHT / SCENE_WIDTH;
  const adjust = (field: "x" | "y" | "width" | "zIndex", amount: number) => {
    setOffsets(previous => ({ ...previous, [active.assetId]: {
      x: previous[active.assetId]?.x ?? 0, y: previous[active.assetId]?.y ?? 0,
      width: previous[active.assetId]?.width ?? 0, zIndex: previous[active.assetId]?.zIndex ?? 0,
      [field]: (previous[active.assetId]?.[field] ?? 0) + amount,
    } }));
  };
  if (!master) return null;
  return <ScrollView contentContainerStyle={styles.page}>
    <Text style={styles.title}>Calibración de Tu espacio</Text>
    <Text>Solo desarrollo · coordenadas canónicas 1448×1086</Text>
    <View style={styles.row}>{profiles.map((profile, index) => <Pressable key={profile.name}
      onPress={() => setProfileIndex(index)} style={[styles.button, index === profileIndex && styles.active]}>
      <Text>{profile.name}</Text>
    </Pressable>)}</View>
    <View style={{ width: sceneWidth, height: sceneHeight }}>
      <Image source={master} resizeMode="stretch" style={{ width: sceneWidth, height: sceneHeight, position: "absolute" }} />
      <View style={{ opacity: sceneOpacity, position: "absolute" }}>
        <SpaceRenderer stage={2} selection={selection} width={sceneWidth} calibrationOffsets={offsets} />
      </View>
    </View>
    <View style={styles.row}>{[0, 0.25, 0.5, 0.75, 1].map(value => <Pressable key={value}
      onPress={() => setSceneOpacity(value)} style={[styles.button, sceneOpacity === value && styles.active]}>
      <Text>Escena {Math.round(value * 100)}%</Text>
    </Pressable>)}</View>
    <Text style={styles.title}>Objeto</Text>
    <View style={styles.row}>{objects.map(object => <Pressable key={object.assetId}
      onPress={() => setSelected(object.assetId)} style={[styles.button, active.assetId === object.assetId && styles.active]}>
      <Text>{object.assetId}</Text>
    </Pressable>)}</View>
    <Text>{active.assetId} · x {Math.round(active.x + offset.x)} · y {Math.round(active.y + offset.y)} · ancho {Math.round(active.width + offset.width)} · z {active.zIndex + offset.zIndex}</Text>
    {(["x", "y", "width", "zIndex"] as const).map(field => <View key={field} style={styles.row}>
      <Text style={styles.field}>{field}</Text>
      {[-10, -5, -1, 1, 5, 10].map(amount => <Pressable key={amount} onPress={() => adjust(field, amount)} style={styles.button}>
        <Text>{amount > 0 ? "+" : ""}{amount}</Text>
      </Pressable>)}
    </View>)}
    <Text>Los ajustes son temporales. Copiá los valores aceptados al registro estático.</Text>
  </ScrollView>;
}

const styles = StyleSheet.create({
  page: { padding: 12, gap: 12, alignItems: "flex-start" },
  title: { fontSize: 18, fontWeight: "700" },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 6, alignItems: "center" },
  field: { width: 52, fontWeight: "700" },
  button: { borderWidth: 1, borderColor: "#bbb", paddingHorizontal: 9, paddingVertical: 8, borderRadius: 8 },
  active: { backgroundColor: "#ded8c8" },
});
