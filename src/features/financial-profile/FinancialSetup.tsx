import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { parseBalanceMinor } from "./money";
import { usePersonalization } from "@/features/personalization/PersonalizationProvider";
import type { ThemeTokens } from "@/features/personalization/themes";

const CURRENCIES = ["UYU", "ARS", "BRL", "CLP", "COP", "MXN", "USD"];

interface FinancialSetupProps {
  isSaving: boolean;
  error: string | null;
  onSave: (currencyCode: string, availableBalanceMinor: number) => Promise<void>;
}

export function FinancialSetup({ isSaving, error, onSave }: FinancialSetupProps) {
  const { theme } = usePersonalization();
  const styles = createStyles(theme);
  const [currency, setCurrency] = useState("UYU");
  const [balance, setBalance] = useState("");
  const [inputError, setInputError] = useState<string | null>(null);

  function submit() {
    if (isSaving) return;
    const amountMinor = parseBalanceMinor(balance);
    if (amountMinor === null) {
      setInputError("Ingresá un saldo válido, sin separadores de miles y con hasta 2 decimales.");
      return;
    }
    setInputError(null);
    void onSave(currency, amountMinor);
  }

  return (
    <View style={styles.form}>
      <View style={styles.intro}>
        <Text accessibilityRole="header" style={styles.title}>Empecemos por tu dinero disponible.</Text>
        <Text style={styles.description}>Elegí tu moneda principal y decinos cuánto dinero tenés disponible hoy.</Text>
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Moneda principal</Text>
        <View style={styles.currencies}>
          {CURRENCIES.map((code) => (
            <Pressable
              key={code}
              accessibilityRole="radio"
              accessibilityLabel={code}
              accessibilityState={{ selected: currency === code, disabled: isSaving }}
              disabled={isSaving}
              onPress={() => setCurrency(code)}
              style={({ pressed }) => [styles.currency, currency === code && styles.selected, pressed && styles.pressed]}
            >
              <Text style={[styles.currencyText, currency === code && styles.selectedText]}>{code}</Text>
            </Pressable>
          ))}
        </View>
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Saldo disponible</Text>
        <TextInput
          accessibilityLabel="Saldo disponible"
          style={[styles.input, inputError !== null && styles.invalidInput]}
          value={balance}
          onChangeText={(value) => { setBalance(value); setInputError(null); }}
          placeholder="Ej. 30000"
          placeholderTextColor={theme.muted}
          keyboardType="numeric"
          editable={!isSaving}
          onSubmitEditing={submit}
        />
        <Text style={styles.hint}>Sin separadores de miles. Puede ser cero o negativo.</Text>
        {inputError && <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.error}>{inputError}</Text>}
      </View>
      {error && <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.error}>{error}</Text>}
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: isSaving, busy: isSaving }}
        disabled={isSaving}
        onPress={submit}
        style={({ pressed }) => [styles.button, (pressed || isSaving) && styles.pressed]}
      >
        <Text style={styles.buttonText}>{isSaving ? "Guardando..." : "Continuar"}</Text>
      </Pressable>
    </View>
  );
}

function createStyles(theme: ThemeTokens) { return StyleSheet.create({
  form: { gap: 28 },
  intro: { gap: 12 },
  title: { color: theme.primary, fontSize: 30, fontWeight: "700", lineHeight: 37 },
  description: { color: theme.textSecondary, fontSize: 17, lineHeight: 25 },
  field: { gap: 10 },
  label: { color: theme.textPrimary, fontSize: 16, fontWeight: "600" },
  currencies: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  currency: { minWidth: 64, minHeight: 48, paddingHorizontal: 14, paddingVertical: 13, borderWidth: 1, borderColor: theme.border, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  selected: { backgroundColor: theme.primary, borderColor: theme.primary },
  currencyText: { color: theme.textPrimary, fontSize: 15, fontWeight: "600" },
  selectedText: { color: theme.textOnPrimary },
  input: { minHeight: 60, borderWidth: 1, borderColor: theme.border, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 24, color: theme.textPrimary, backgroundColor: theme.surface },
  invalidInput: { borderColor: theme.negative },
  hint: { fontSize: 14, lineHeight: 20, color: theme.textSecondary },
  error: { color: theme.negative, fontSize: 15, lineHeight: 22 },
  button: { minHeight: 56, borderRadius: 14, padding: 16, alignItems: "center", justifyContent: "center", backgroundColor: theme.primary },
  buttonText: { color: theme.textOnPrimary, fontSize: 17, fontWeight: "600" },
  pressed: { opacity: 0.65 },
}); }
