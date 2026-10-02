import { useRef, useState } from "react";
import { DateTimePicker } from "@expo/ui/community/datetime-picker";
import { Keyboard, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { useCreatePayment } from "./useCreatePayment";
import type { Payment } from "@/domain/payment";
import { formatBalance, parseBalanceMinor } from "@/features/financial-profile/money";
import { civilDateToPickerDate, formatCivilDate, pickerDateToCivilDate } from "./civilDate";
import { usePersonalization } from "@/features/personalization/PersonalizationProvider";
import type { ThemeTokens } from "@/features/personalization/themes";

interface PaymentFormProps {
  currencyCode: string;
  onSaved: (id: number) => void;
  initial?: Payment;
}

export function PaymentForm({ currencyCode, onSaved, initial }: PaymentFormProps) {
  const { theme } = usePersonalization();
  const styles = createStyles(theme);
  const form = useCreatePayment(initial);
  const amountInput = useRef<TextInput>(null);
  const [showDate, setShowDate] = useState(false);
  const amountMinor = parseBalanceMinor(form.amount);

  function openDate() {
    Keyboard.dismiss();
    setShowDate(true);
  }

  async function submit() {
    const payment = await form.save();
    if (payment !== null) onSaved(payment.id);
  }

  return (
    <View style={styles.form}>
      <Text style={styles.description}>{initial ? "Actualizá tu movimiento" : "Registrá un gasto o ingreso previsto"} en {currencyCode}.</Text>
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
          placeholderTextColor={theme.muted}
          editable={!form.isSaving}
          autoCapitalize="sentences"
          returnKeyType="next"
          submitBehavior="submit"
          onSubmitEditing={() => amountInput.current?.focus()}
        />
        {form.errors.title && <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.error}>{form.errors.title}</Text>}
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Importe ({currencyCode})</Text>
        <TextInput
          ref={amountInput}
          accessibilityLabel={`Importe (${currencyCode})`}
          style={[styles.input, !!form.errors.amount && styles.invalidInput]}
          value={form.amount}
          onChangeText={form.setAmount}
          placeholder="Ej. 1500,50"
          placeholderTextColor={theme.muted}
          keyboardType="decimal-pad"
          editable={!form.isSaving}
          returnKeyType="next"
          onSubmitEditing={openDate}
        />
        {amountMinor !== null && amountMinor > 0 && <Text style={styles.hint}>{formatBalance(amountMinor, currencyCode)}</Text>}
        {form.errors.amount && <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.error}>{form.errors.amount}</Text>}
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Fecha</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Fecha: ${formatCivilDate(form.dueDate)}. Cambiar fecha`}
          accessibilityState={{ disabled: form.isSaving, expanded: showDate }}
          style={[styles.input, !!form.errors.dueDate && styles.invalidInput]}
          onPress={openDate}
          disabled={form.isSaving}
        ><Text style={styles.dateText}>{formatCivilDate(form.dueDate)}</Text></Pressable>
        {showDate && <>
          <DateTimePicker value={civilDateToPickerDate(form.dueDate, Platform.OS)} mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            positiveButton={{ label: "Elegir fecha" }} negativeButton={{ label: "Volver" }}
            onDismiss={() => setShowDate(false)}
            onValueChange={(_, date) => {
              form.setDueDate(pickerDateToCivilDate(date, Platform.OS));
              if (Platform.OS !== "ios") setShowDate(false);
            }} />
          {Platform.OS === "ios" && <Pressable accessibilityRole="button" style={styles.dateDone} onPress={() => setShowDate(false)}>
            <Text style={styles.label}>Listo</Text>
          </Pressable>}
        </>}
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
          placeholder="Algo que quieras recordar"
          placeholderTextColor={theme.muted}
          returnKeyType="done"
          submitBehavior="blurAndSubmit"
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
        <Text style={styles.buttonText}>{form.isSaving ? "Guardando..." : initial ? "Guardar cambios" : "Guardar movimiento"}</Text>
      </Pressable>
    </View>
  );
}

function createStyles(theme: ThemeTokens) { return StyleSheet.create({
  form: { gap: 22 },
  description: { color: theme.textSecondary, fontSize: 17, lineHeight: 25 },
  field: { gap: 10 },
  label: { color: theme.textPrimary, fontSize: 16, fontWeight: "600" },
  types: { flexDirection: "row", gap: 12 },
  type: { flex: 1, minHeight: 52, padding: 14, borderWidth: 1, borderColor: theme.border, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  selected: { backgroundColor: theme.primary, borderColor: theme.primary },
  typeText: { color: theme.textPrimary, fontSize: 17, fontWeight: "600" },
  selectedText: { color: theme.textOnPrimary },
  input: { minHeight: 56, borderWidth: 1, borderColor: theme.border, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 20, color: theme.textPrimary, backgroundColor: theme.surface },
  invalidInput: { borderColor: theme.negative },
  notes: { minHeight: 96, maxHeight: 160 },
  dateText: { fontSize: 18, lineHeight: 28, color: theme.textPrimary },
  dateDone: { minHeight: 48, justifyContent: "center", alignItems: "center" },
  hint: { fontSize: 14, lineHeight: 20, color: theme.textSecondary },
  error: { color: theme.negative, fontSize: 15, lineHeight: 22 },
  button: { minHeight: 56, borderRadius: 14, padding: 16, alignItems: "center", justifyContent: "center", backgroundColor: theme.primary },
  buttonText: { color: theme.textOnPrimary, fontSize: 17, fontWeight: "600" },
  pressed: { opacity: 0.65 },
}); }
