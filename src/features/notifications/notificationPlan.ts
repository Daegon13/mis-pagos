import type { Payment } from "@/domain/payment";
import { localCivilDate } from "@/domain/paymentTiming";
import type { NotificationCategory, NotificationPreferences } from "@/data/repositories/notificationRepository";

export type NotificationCandidate = { day: string; category: NotificationCategory; priority: number;
  title: string; body: string; at: Date };
type Inputs = { now: Date; payments: readonly Payment[]; planEnd: string | null;
  discoveries: readonly { achievement_id: string; unlocked_at: string }[]; preferences: NotificationPreferences };

function localDay(day: string, hour: number): Date {
  const [year, month, date] = day.split("-").map(Number);
  return new Date(year, month - 1, date, hour);
}
function offsetDay(now: Date, offset: number): string {
  const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset);
  return localCivilDate(date);
}
function variation(day: string, count: number): number {
  return day.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0) % count;
}

// All dates are local civil dates. A date becomes an instant only when a notification needs an hour.
export function planNotifications({ now, payments, planEnd, discoveries, preferences }: Inputs): NotificationCandidate[] {
  if (!preferences.enabled) return [];
  const candidates: NotificationCandidate[] = [];
  const pending = payments.filter(payment => payment.status === "pending");
  const today = localCivilDate(now);
  const overdue = pending.filter(payment => payment.dueDate < today);
  for (let offset = 0; offset <= 7; offset++) {
    const day = offsetDay(now, offset);
    const target = localDay(day, preferences.startHour + 1);
    if (day === today && target.getTime() <= now.getTime()) {
      target.setTime(now.getTime() + 30 * 60_000);
      if (localCivilDate(target) !== day || target.getHours() >= preferences.endHour) continue;
    }
    const add = (category: NotificationCategory, priority: number, title: string, body: string) => {
      if (preferences.categories[category]) candidates.push({ day, category, priority, title, body, at: new Date(target) });
    };
    if (overdue.length && offset > 0 && offset % 3 === 1) {
      add("overdue", 100, "Pendientes para revisar 📌", overdue.length === 1
        ? ["Tenés un movimiento vencido. Revisalo cuando puedas.", "Hay un pendiente vencido que conviene revisar."][variation(day, 2)]
        : `Hay ${overdue.length} movimientos vencidos. Revisalos cuando puedas.`);
    }
    const expenses = pending.filter(payment => payment.type === "expense" &&
      (payment.dueDate === offsetDay(localDay(day, 0), 1) ||
        (payment.dueDate === day && localCivilDate(new Date(payment.createdAt)) === day)));
    if (expenses.length) add("dueSoon", 80, "Se acerca un vencimiento 📅", expenses.length === 1
      ? ["Tenés un movimiento próximo. Mirá la fecha en Mis Pagos.", "Un compromiso se acerca. Podés revisarlo en la app."][variation(day, 2)]
      : `Tenés ${expenses.length} compromisos próximos. Podés revisarlos en la app.`);
    const incomes = pending.filter(payment => payment.type === "income" && payment.dueDate === day);
    if (incomes.length) add("income", 70, "Ingreso previsto 💫", incomes.length === 1
      ? "Hoy tenés un ingreso previsto. Confirmalo cuando se refleje en tu saldo."
      : `Hoy tenés ${incomes.length} ingresos previstos. Confirmalos cuando se reflejen.`);
    if (planEnd && day <= planEnd && offset > 0 && localDay(day, 0).getDay() === 0) add("planReview", 40, "Una mirada a tu plan 🌿",
      ["Si te sirve, revisá tu reserva y tu ritmo para este mes.", "Tu plan está disponible para una revisión tranquila."][variation(day, 2)]);
    if (offset === 0 && discoveries.some(item => {
      const age = now.getTime() - Date.parse(item.unlocked_at);
      return age >= 0 && age < 48 * 60 * 60_000;
    })) add("discoveries", 30, "Tu espacio tiene algo nuevo ✨", "Abrí Descubrimientos para ver qué control se habilitó.");
    if (offset === 7) add("reengagement", 10, "Tu espacio te espera 🌱",
      "Cuando quieras, podés volver a revisar tus movimientos y tu plan.");
  }
  const chosen = new Map<string, NotificationCandidate>();
  for (const item of candidates.sort((a, b) => b.priority - a.priority)) {
    if (!chosen.has(item.day)) chosen.set(item.day, item);
  }
  return [...chosen.values()].sort((a, b) => a.day.localeCompare(b.day));
}
