import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import type { ThemeTokens } from "@/features/personalization/themes";
import { hexToHsv, hsvToHex, type Hsv } from "./colorPicker";

function ColorTrack({ label, value, max, colors, onChange, theme }: {
  label: string; value: number; max: number; colors: string[]; onChange: (value: number) => void;
  theme: ThemeTokens;
}) {
  const [width, setWidth] = useState(1);
  const update = (x: number) => onChange(Math.max(0, Math.min(max, x / width * max)));
  return <View accessible accessibilityRole="adjustable" accessibilityLabel={label}
    accessibilityValue={{ min: 0, max: 100, now: Math.round(value / max * 100) }}
    accessibilityActions={[{ name: "increment" }, { name: "decrement" }]}
    onAccessibilityAction={event => onChange(Math.max(0, Math.min(max,
      value + (event.nativeEvent.actionName === "increment" ? 0.05 : -0.05) * max)))}
    onLayout={event => setWidth(event.nativeEvent.layout.width)}
    onStartShouldSetResponder={() => true} onMoveShouldSetResponder={() => true}
    onResponderGrant={event => update(event.nativeEvent.locationX)}
    onResponderMove={event => update(event.nativeEvent.locationX)}
    style={[styles.track, { borderColor: theme.border }]}>
    {colors.map((color, index) => <View key={index} pointerEvents="none" style={{ flex: 1, backgroundColor: color }} />)}
    <View pointerEvents="none" style={[styles.thumb, { left: `${value / max * 100}%` }]} />
  </View>;
}

export function VisualColorPicker({ label, initialColor, theme, onPreview, onCancel, onApply }: {
  label: string; initialColor: string; theme: ThemeTokens; onPreview: (color: string) => void;
  onCancel: () => void; onApply: (color: string) => Promise<boolean>;
}) {
  const [hsv, setHsv] = useState<Hsv>(() => hexToHsv(initialColor) ?? { hue: 0, saturation: 1, value: 1 });
  const [hex, setHex] = useState(() => hsvToHex(hexToHsv(initialColor) ?? { hue: 0, saturation: 1, value: 1 }));
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const select = (next: Hsv) => {
    const color = hsvToHex(next);
    setHsv(next); setHex(color); setError(""); onPreview(color);
  };
  const editHex = (value: string) => {
    setHex(value); setError("");
    const valid = hexToHsv(value);
    if (valid) { setHsv(valid); onPreview(hsvToHex(valid)); }
  };
  const apply = async () => {
    const valid = hexToHsv(hex);
    if (!valid) { setError("Ingresá un código de 6 dígitos, por ejemplo #D8A2B4."); return; }
    setBusy(true);
    try { if (await onApply(hsvToHex(valid))) setError(""); }
    finally { setBusy(false); }
  };
  const swatch = hsvToHex(hsv);
  return <View style={[styles.panel, { backgroundColor: theme.secondarySurface, borderColor: theme.border }]}>
    <Text style={[styles.label, { color: theme.textPrimary }]}>Elegir color de {label}</Text>
    <View style={[styles.largeSwatch, { backgroundColor: swatch, borderColor: theme.border }]} accessibilityLabel={`Color actual ${swatch}`} />
    <Text style={{ color: theme.textSecondary }}>Tono</Text>
    <ColorTrack label={`Tono de ${label}`} value={hsv.hue} max={360} theme={theme}
      colors={Array.from({ length: 24 }, (_, index) => hsvToHex({ hue: index * 15, saturation: 1, value: 1 }))}
      onChange={hue => select({ ...hsv, hue })} />
    <Text style={{ color: theme.textSecondary }}>Intensidad</Text>
    <ColorTrack label={`Intensidad de ${label}`} value={hsv.saturation} max={1} theme={theme}
      colors={Array.from({ length: 20 }, (_, index) => hsvToHex({ ...hsv, saturation: index / 19 }))}
      onChange={saturation => select({ ...hsv, saturation })} />
    <Text style={{ color: theme.textSecondary }}>Claridad</Text>
    <ColorTrack label={`Claridad de ${label}`} value={hsv.value} max={1} theme={theme}
      colors={Array.from({ length: 20 }, (_, index) => hsvToHex({ ...hsv, value: index / 19 }))}
      onChange={value => select({ ...hsv, value })} />
    <Text style={{ color: theme.textSecondary }}>Código hexadecimal (opcional)</Text>
    <TextInput accessibilityLabel={`Código hexadecimal de ${label}`} value={hex} onChangeText={editHex}
      autoCapitalize="characters" maxLength={7} style={[styles.input, { color: theme.textPrimary,
        backgroundColor: theme.surface, borderColor: error ? theme.negative : theme.border }]} />
    {!!error && <Text accessibilityRole="alert" style={{ color: theme.negative }}>{error}</Text>}
    <View style={styles.actions}>
      <Pressable accessibilityRole="button" onPress={onCancel} style={styles.action}><Text style={{ color: theme.primary }}>Cancelar</Text></Pressable>
      <Pressable accessibilityRole="button" accessibilityState={{ disabled: busy }} disabled={busy} onPress={() => void apply()}
        style={[styles.action, { backgroundColor: theme.primary }]}><Text style={{ color: theme.textOnPrimary }}>Aplicar</Text></Pressable>
    </View>
  </View>;
}

const styles = StyleSheet.create({
  panel: { borderWidth: 1, borderRadius: 14, padding: 12, gap: 7 },
  label: { fontSize: 17, fontWeight: "700" },
  largeSwatch: { height: 64, borderRadius: 10, borderWidth: 1 },
  track: { height: 44, width: "100%", flexDirection: "row", borderWidth: 1, borderRadius: 10,
    overflow: "hidden", marginBottom: 8 },
  thumb: { position: "absolute", top: 2, bottom: 2, width: 4, marginLeft: -2, borderRadius: 2,
    backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#273041" },
  input: { minHeight: 44, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, fontSize: 16 },
  actions: { flexDirection: "row", justifyContent: "flex-end", gap: 8 },
  action: { minHeight: 44, minWidth: 88, alignItems: "center", justifyContent: "center", borderRadius: 10, paddingHorizontal: 14 },
});
