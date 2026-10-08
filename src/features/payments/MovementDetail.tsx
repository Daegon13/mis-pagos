import { useState } from "react";
import { Alert, Text, View } from "react-native";

import { cancelPendingPayment, completePayment } from "@/data/repositories/paymentLifecycle";
import { deletePayment } from "@/data/repositories/paymentRepository";
import { paymentStatusLabel, paymentTiming } from "@/domain/paymentTiming";
import { formatBalance } from "@/features/financial-profile/money";
import { PaymentForm } from "./PaymentForm";
import { Action, Feedback, MovementScreen, useMovementStyles } from "./MovementScreen";
import { useMovementAction, useMovements } from "./useMovements";
import { formatCivilDate } from "./civilDate";
import { attemptUnlock } from "@/features/achievements/achievementService";
import type { AchievementId } from "@/domain/achievements";

export function MovementDetail({ id, onBack, onDeleted }: { id: number; onBack: () => void; onDeleted: () => void }) {
  const styles = useMovementStyles();
  const { db, data, error, reload } = useMovements();
  const action = useMovementAction();
  const [editing, setEditing] = useState(false);
  const [reconcile, setReconcile] = useState(false);
  const [edited, setEdited] = useState(false);
  const [discovery, setDiscovery] = useState<string | null>(null);
  const [pendingDiscoveries, setPendingDiscoveries] = useState<AchievementId[]>([]);
  const payment = data?.payments.find(p => p.id === id);
  const profile = data?.profile;
  const back = () => { if (editing) setEditing(false); else if (reconcile) setReconcile(false); else onBack(); };
  if (error || !data || !payment || !profile) return <MovementScreen title="Movimiento" onBack={onBack}>
    <Feedback error={!!error} message={error ?? (!data ? "Cargando..." : "Este movimiento ya no está disponible.")} />
    {error && <Action label="Reintentar" onPress={reload} />}
  </MovementScreen>;
  const expense = payment.type === "expense";
  const money = (amount: number) => formatBalance(amount, profile.currencyCode);
  const resolved = expense ? "pagado" : "cobrado";
  async function recordDiscovery(id: AchievementId) {
    const result = await attemptUnlock(db, id);
    if (result === "failed") setPendingDiscoveries(previous => previous.includes(id) ? previous : [...previous, id]);
    else setPendingDiscoveries(previous => previous.filter(value => value !== id));
    return result === "new";
  }
  async function retryDiscoveries() {
    for (const id of pendingDiscoveries) {
      if (await recordDiscovery(id)) setDiscovery(id === "FIRST_OVERDUE_RESOLVED"
        ? "Un pendiente resuelto" : "Primer movimiento resuelto");
    }
  }
  function complete(adjust: boolean) {
    void action.run(async () => {
      const result = await completePayment(db, id, adjust);
      const first = await recordDiscovery("FIRST_RESOLVED_MOVEMENT");
      const overdue = result.wasOverdue && await recordDiscovery("FIRST_OVERDUE_RESOLVED");
      setDiscovery(overdue ? "Un pendiente resuelto" : first ? "Primer movimiento resuelto" : null);
      return `Listo. ${result.payment.title} quedó ${result.payment.type === "expense" ? "pagado" : "cobrado"}.`
        + (adjust ? ` Tu saldo actual ahora es ${formatBalance(result.balanceMinor, result.currencyCode)}.` : "");
    }, () => { setReconcile(false); setEdited(false); reload(); });
  }
  function cancel() {
    Alert.alert("¿Cancelar este movimiento?", "Dejará de incluirse en tus cálculos, pero seguirá apareciendo en tu historial.", [
      { text: "Volver", style: "cancel" },
      { text: "Cancelar movimiento", onPress: () => { void action.run(async () => {
        const result = await cancelPendingPayment(db, id);
        const overdue = result.wasOverdue && await recordDiscovery("FIRST_OVERDUE_RESOLVED");
        setDiscovery(overdue ? "Un pendiente resuelto" : null);
        return "Movimiento cancelado.";
      }, () => { setEdited(false); reload(); }); } },
    ]);
  }
  function remove() {
    Alert.alert("Eliminar definitivamente", "Esta acción no se puede deshacer. El saldo actual no cambiará.", [
      { text: "Volver", style: "cancel" },
      { text: "Eliminar", style: "destructive", onPress: () => { void action.run(async () => {
        await deletePayment(db, id); return "Movimiento eliminado.";
      }, onDeleted); } },
    ]);
  }
  return <MovementScreen title={editing ? "Editar movimiento" : payment.title} onBack={back}>
    {editing && payment.status === "pending" ? <PaymentForm key={payment.id} currencyCode={profile.currencyCode} initial={payment}
      onSaved={() => { setEditing(false); setEdited(true); reload(); }} /> : <>
      <Text style={styles.text}>{expense ? "Gasto" : "Ingreso"} · {paymentStatusLabel(payment)}</Text>
      <Text style={styles.amount}>{money(payment.amountMinor)}</Text>
      <Text style={styles.text}>Fecha: {formatCivilDate(payment.dueDate)}</Text>
      <Text style={styles.text}>{paymentTiming(payment)}</Text>
      {payment.notes && <View style={styles.section}><Text style={styles.title}>Notas</Text><Text style={styles.text}>{payment.notes}</Text></View>}
      <Feedback message={edited ? "Cambios guardados." : action.feedback} />
      <Feedback message={discovery ? `Nuevo descubrimiento: ${discovery}.` : null} />
      {pendingDiscoveries.length > 0 && <View style={styles.section}>
        <Feedback message="El movimiento se guardó, pero faltó guardar un descubrimiento." />
        <Action label="Reintentar descubrimiento" onPress={() => { void retryDiscoveries(); }} />
      </View>}
      <Feedback error message={action.error} />
      {payment.status === "pending" && (reconcile ? <View style={styles.card}>
        <Text style={styles.title}>¿Este {expense ? "pago" : "ingreso"} ya está reflejado en tu saldo actual?</Text>
        <Text style={styles.text}>Saldo actual: {money(profile.availableBalanceMinor)}</Text>
        <Action primary disabled={action.busy} label={`${expense ? "Descontar" : "Sumar"} ${money(payment.amountMinor)} ${expense ? "del" : "al"} saldo`}
          onPress={() => complete(true)} />
        <Action disabled={action.busy} label="Ya está reflejado" onPress={() => complete(false)} />
        <Action disabled={action.busy} label="Volver al detalle" onPress={() => setReconcile(false)} />
      </View> : <View style={styles.section}>
        <Action primary disabled={action.busy} label={`Marcar como ${resolved}`} onPress={() => { setEdited(false); setReconcile(true); }} />
        <Action disabled={action.busy} label="Editar" onPress={() => setEditing(true)} />
        <Action disabled={action.busy} label="Cancelar movimiento" onPress={cancel} />
      </View>)}
      {!reconcile && <View style={styles.deletion}>
        <Action destructive disabled={action.busy} label="Eliminar" onPress={remove} />
        <Text style={styles.text}>Elimina el registro definitivamente. Tu saldo no cambia.</Text>
      </View>}
    </>}
  </MovementScreen>;
}
