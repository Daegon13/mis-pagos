import { useState } from "react";
import { Text, TextInput, View } from "react-native";

import { updateCurrentBalance } from "@/data/repositories/paymentLifecycle";
import { localCivilDate } from "@/domain/paymentTiming";
import { Action, Feedback, MovementScreen, styles } from "@/features/payments/MovementScreen";
import { useMovementAction, useMovements } from "@/features/payments/useMovements";
import { formatBalance, parseBalanceMinor } from "./money";
import { formatCivilDate } from "@/features/payments/civilDate";

export function BalanceUpdate({ onBack, onSaved }: { onBack: () => void; onSaved: () => void }) {
  const { db, data, error, reload } = useMovements();
  const action = useMovementAction();
  const [value, setValue] = useState("");
  const [inputError, setInputError] = useState<string | null>(null);
  const parsed = parseBalanceMinor(value);
  function save() {
    const amount = parseBalanceMinor(value);
    if (amount === null) { setInputError("Ingresá un saldo válido. Por ejemplo: 1.500,50 o -500."); return; }
    setInputError(null);
    void action.run(async () => { await updateCurrentBalance(db, amount); return "Saldo actualizado."; }, onSaved);
  }
  return <MovementScreen title="Actualizar saldo" onBack={onBack}>
    {error ? <><Feedback error message={error} /><Action label="Reintentar" onPress={reload} /></>
      : !data ? <Text style={styles.text}>Cargando...</Text>
      : !data.profile ? <Text style={styles.text}>Completá primero tu saldo inicial.</Text> : <>
        <Text style={styles.text}>Saldo actual</Text>
        <Text style={styles.amount}>{formatBalance(data.profile.availableBalanceMinor, data.profile.currencyCode)}</Text>
        <Text style={styles.title}>Nuevo saldo ({data.profile.currencyCode})</Text>
        <TextInput accessibilityLabel="Nuevo saldo" value={value} onChangeText={(text) => { setValue(text); setInputError(null); }} keyboardType="numeric"
          returnKeyType="done" onSubmitEditing={save}
          editable={!action.busy} style={styles.input} placeholder="Ej. 30000" placeholderTextColor="#697973" />
        <Text style={styles.text}>Ingresá el dinero que tenés hoy. Puede ser cero o negativo.</Text>
        {parsed !== null && <View style={styles.card}>
          <Text style={styles.text}>Tu saldo quedará en</Text>
          <Text style={styles.amount}>{formatBalance(parsed, data.profile.currencyCode)}</Text>
        </View>}
        <Text style={styles.text}>Hoy · {formatCivilDate(localCivilDate())}</Text>
        <Feedback error message={inputError ?? action.error} />
        <Action primary disabled={action.busy} label={action.busy ? "Guardando..." : "Guardar"} onPress={save} />
      </>}
  </MovementScreen>;
}
