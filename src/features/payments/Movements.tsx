import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import type { Payment, PaymentStatus } from "@/domain/payment";
import { groupMovements, paymentTiming } from "@/domain/paymentTiming";
import { formatBalance } from "@/features/financial-profile/money";
import { Action, Feedback, MovementScreen, useMovementStyles } from "./MovementScreen";
import { useMovements } from "./useMovements";

export function Movements({ onBack, onOpen, deleted, onDismiss }: {
  onBack: () => void; onOpen: (id: number) => void; deleted?: string; onDismiss: () => void;
}) {
  const styles = useMovementStyles();
  const { data, error, reload } = useMovements();
  const [tab, setTab] = useState<PaymentStatus>("pending");
  const groups = groupMovements(data?.payments ?? []);
  const sections: { title: string; payments: Payment[] }[] = tab === "pending" ? [
    { title: "Requieren atención", payments: groups.attention },
    { title: "Próximos 30 días", payments: groups.next },
    { title: "Más adelante", payments: groups.later },
  ] : [{ title: tab === "completed" ? "Completados" : "Cancelados", payments: groups[tab] }];
  return <MovementScreen title="Movimientos" onBack={onBack}>
    {deleted && <View><Feedback message="Movimiento eliminado." /><Action label="Entendido" onPress={onDismiss} /></View>}
    <View style={styles.tabs}>
      {([{ value: "pending", label: "Pendientes" }, { value: "completed", label: "Completados" },
        { value: "cancelled", label: "Cancelados" }] as const).map(({ value, label }) =>
        <Pressable key={value} accessibilityRole="tab" accessibilityState={{ selected: tab === value }}
          onPress={() => setTab(value)} style={[styles.action, tab === value && styles.primary]}>
          <Text style={[styles.actionText, tab === value && styles.white]}>{label}</Text>
        </Pressable>)}
    </View>
    {error ? <><Feedback message={error} error /><Action label="Reintentar" onPress={reload} /></>
      : !data ? <Text style={styles.text}>Cargando...</Text>
      : sections.every(s => s.payments.length === 0) ? <Text style={styles.text}>No tenés movimientos en esta sección.</Text>
      : sections.filter(s => s.payments.length > 0).map(section => <View key={section.title} style={styles.section}>
        <Text accessibilityRole="header" style={styles.title}>{section.title}</Text>
        {section.payments.map(payment => <Pressable key={payment.id} accessibilityRole="button"
          onPress={() => onOpen(payment.id)} style={styles.row}>
          <Text style={styles.title}>{payment.title}</Text>
          <Text style={styles.text}>{payment.type === "expense" ? "−" : "+"}{formatBalance(payment.amountMinor, data.profile?.currencyCode ?? "UYU")}</Text>
          <Text style={styles.text}>{payment.dueDate} · {paymentTiming(payment)}</Text>
        </Pressable>)}
      </View>)}
  </MovementScreen>;
}
