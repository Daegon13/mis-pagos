import { StyleSheet, Text, View } from "react-native";
import type { SpaceStage } from "@/domain/engagement";

const descriptions = ["Un lugar para empezar.", "Tu espacio empieza a tomar forma.", "Un poco más tuyo, paso a paso."];
const scenes = ["Una habitación con una ventana", "Una habitación con ventana y una planta",
  "Una habitación con ventana, planta, mesa y libros"];

export function LivingSpace({ stage, surprise }: { stage: SpaceStage; surprise: boolean }) {
  return (
    <View style={styles.card}>
      <View style={styles.copy}>
        <Text accessibilityRole="header" style={styles.title}>Tu espacio</Text>
        <Text style={styles.caption}>{descriptions[stage]}</Text>
        {surprise && <Text accessibilityLiveRegion="polite" style={styles.surprise}>Algo cambió en tu espacio.</Text>}
      </View>
      <View accessible accessibilityLabel={scenes[stage]} style={styles.scene}>
        <View style={styles.floor} />
        <View style={styles.window}><View style={styles.windowBar} /></View>
        {stage >= 1 && <>
          <View style={styles.stem} /><View style={styles.leafLeft} /><View style={styles.leafRight} />
          <View style={styles.pot} />
        </>}
        {stage >= 2 && <>
          <View style={styles.tableLeg} /><View style={styles.table} />
          <View style={styles.bookOne} /><View style={styles.bookTwo} />
        </>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16, borderRadius: 20, backgroundColor: "#EFECE3" },
  copy: { flex: 1, gap: 6 },
  title: { fontSize: 17, fontWeight: "600", color: "#203D32" },
  caption: { fontSize: 13, lineHeight: 19, color: "#52645C" },
  surprise: { fontSize: 13, lineHeight: 19, color: "#316E49", fontWeight: "600" },
  scene: { width: 120, height: 104, backgroundColor: "#E6DDCB", borderRadius: 12, overflow: "hidden" },
  floor: { position: "absolute", bottom: 0, height: 24, width: "100%", backgroundColor: "#D3C2A9" },
  window: { position: "absolute", top: 12, left: 20, width: 39, height: 43, borderRadius: 18, backgroundColor: "#B8D3CF", borderWidth: 4, borderColor: "#F8F4E9" },
  windowBar: { position: "absolute", left: 14, width: 3, height: "100%", backgroundColor: "#F8F4E9" },
  stem: { position: "absolute", left: 28, bottom: 31, height: 23, width: 2, backgroundColor: "#436B4F" },
  leafLeft: { position: "absolute", left: 16, bottom: 42, width: 14, height: 9, borderRadius: 8, backgroundColor: "#618269", transform: [{ rotate: "30deg" }] },
  leafRight: { position: "absolute", left: 29, bottom: 47, width: 12, height: 9, borderRadius: 8, backgroundColor: "#436B4F", transform: [{ rotate: "-30deg" }] },
  pot: { position: "absolute", left: 20, bottom: 18, width: 19, height: 17, borderBottomLeftRadius: 7, borderBottomRightRadius: 7, backgroundColor: "#B8795E" },
  table: { position: "absolute", left: 55, bottom: 38, width: 49, height: 6, borderRadius: 3, backgroundColor: "#8D7158" },
  tableLeg: { position: "absolute", left: 78, bottom: 16, width: 5, height: 25, backgroundColor: "#8D7158" },
  bookOne: { position: "absolute", left: 67, bottom: 44, width: 24, height: 5, backgroundColor: "#66837A", borderRadius: 1 },
  bookTwo: { position: "absolute", left: 70, bottom: 49, width: 19, height: 4, backgroundColor: "#BC9167", borderRadius: 1 },
});
