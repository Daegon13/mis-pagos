import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { useCreatePayment } from "./useCreatePayment";

interface PaymentFormProps {
  currencyCode: string;
  onSaved: (id: number) => void;
}

export function PaymentForm({ currencyCode, onSaved }: PaymentFormProps) {
  const form = useCreatePayment();

  async function submit() {
    const payment = await form.save();
    if (payment !== null) onSaved(payment.id);
  }

  return (
    <View style={styles.form}>
      <Text style={styles.description}>Registrá un gasto o ingreso previsto en {currencyCode}.</Text>
      <View style={styles.field}>
        <Text style={styles.label}>Tipo de movimiento</Text>
        <View style={styles.types}>
          {([{ value: "expense", label: "Gasto" }, { value: "income", label: "Ingreso" }] as const).map(({ value, label }) => (
            <Pressable
              key={value}
              accessibilityRole="radio"
              accessibilityLabel={label}
              accessibilityState={{ checked: form.type === value, disabled: form.isSaving }}
              disabled={form.isSaving}
              onPress={() => form.setType(value)}
              style={({ pressed }) => [styles.type, form.type === value && styles.selected, pressed && styles.pressed]}
            >
              <Text style={[styles.typeText, form.type === value && styles.selectedText]}>
                {form.type === value ? "✓ " : ""}{label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Título</Text>
        <TextInput
          accessibilityLabel="Título"
          style={[styles.input, !!form.errors.title && styles.invalidInput]}
          value={form.title}
          onChangeText={form.setTitle}
          placeholder="Ej. Alquiler o Sueldo"
          placeholderTextColor="#697973"
          editable={!form.isSaving}
          autoCapitalize="sentences"
        />
        {form.errors.title && <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.error}>{form.errors.title}</Text>}
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Importe ({currencyCode})</Text>
        <TextInput
          accessibilityLabel={`Importe (${currencyCode})`}
          style={[styles.input, !!form.errors.amount && styles.invalidInput]}
          value={form.amount}
          onChangeText={form.setAmount}
          placeholder="Ej. 1500,50"
          placeholderTextColor="#697973"
          keyboardType="decimal-pad"
          editable={!form.isSaving}
        />
        <Text style={styles.hint}>Mayor que cero, sin separadores de miles.</Text>
        {form.errors.amount && <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.error}>{form.errors.amount}</Text>}
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Fecha</Text>
        <TextInput
          accessibilityLabel="Fecha, AAAA-MM-DD"
          style={[styles.input, !!form.errors.dueDate && styles.invalidInput]}
          value={form.dueDate}
          onChangeText={form.setDueDate}
          placeholder="AAAA-MM-DD"
          placeholderTextColor="#697973"
          autoCorrect={false}
          autoCapitalize="none"
          editable={!form.isSaving}
        />
        <Text style={styles.hint}>AAAA-MM-DD. Por ejemplo: 2026-12-31.</Text>
        {form.errors.dueDate && <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.error}>{form.errors.dueDate}</Text>}
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Notas (opcional)</Text>
        <TextInput
          accessibilityLabel="Notas (opcional)"
          style={[styles.input, styles.notes]}
          value={form.notes}
          onChangeText={form.setNotes}
          multiline
          textAlignVertical="top"
          editable={!form.isSaving}
        />
      </View>
      {form.saveError && <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.error}>{form.saveError}</Text>}
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: form.isSaving, busy: form.isSaving }}
        disabled={form.isSaving}
        onPress={() => { void submit(); }}
        style={({ pressed }) => [styles.button, (pressed || form.isSaving) && styles.pressed]}
      >
        <Text style={styles.buttonText}>{form.isSaving ? "Guardando..." : "Guardar movimiento"}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: 28 },
  description: { color: "#52645C", fontSize: 17, lineHeight: 25 },
  field: { gap: 10 },
  label: { color: "#203D32", fontSize: 16, fontWeight: "600" },
  types: { flexDirection: "row", gap: 12 },
  type: { flex: 1, minHeight: 52, padding: 14, borderWidth: 1, borderColor: "#ABBAB1", borderRadius: 12, alignItems: "center", justifyContent: "center" },
  selected: { backgroundColor: "#163B30", borderColor: "#163B30" },
  typeText: { color: "#203D32", fontSize: 17, fontWeight: "600" },
  selectedText: { color: "#FFFFFF" },
  input: { minHeight: 56, borderWidth: 1, borderColor: "#879B90", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 20, color: "#163B30", backgroundColor: "#FFFFFF" },
  invalidInput: { borderColor: "#A12D26" },
  notes: { minHeight: 108 },
  hint: { fontSize: 14, lineHeight: 20, color: "#52645C" },
  error: { color: "#A12D26", fontSize: 15, lineHeight: 22 },
  button: { minHeight: 56, borderRadius: 14, padding: 16, alignItems: "center", justifyContent: "center", backgroundColor: "#163B30" },
  buttonText: { color: "#FFFFFF", fontSize: 17, fontWeight: "600" },
  pressed: { opacity: 0.65 },
});
