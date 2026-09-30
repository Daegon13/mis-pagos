import type { Payment } from "./payment";

export function localCivilDate(now = new Date()): string {
  return [String(now.getFullYear()).padStart(4, "0"),
    String(now.getMonth() + 1).padStart(2, "0"), String(now.getDate()).padStart(2, "0")].join("-");
}

export function isCivilDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  if (year < 1 || month < 1 || month > 12) return false;
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  return day >= 1 && day <= [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1];
}

export function planningHorizon(now = new Date()) {
  const end = new Date(now);
  end.setDate(end.getDate() + 30);
  return { today: localCivilDate(now), end: localCivilDate(end) };
}

export function isOverdue(payment: Payment, today = localCivilDate()) {
  return payment.status === "pending" && payment.dueDate < today;
}

// Gregorian civil-day ordinal: no timezone or elapsed-hour conversion.
function civilDay(value: string): number {
  let [year, month, day] = value.split("-").map(Number);
  year -= month <= 2 ? 1 : 0;
  const era = Math.floor(year / 400);
  const y = year - era * 400;
  month += month > 2 ? -3 : 9;
  return era * 146097 + y * 365 + Math.floor(y / 4) - Math.floor(y / 100)
    + Math.floor((153 * month + 2) / 5) + day;
}

export function paymentStatusLabel(payment: Payment) {
  return payment.status === "pending" ? "Pendiente" : payment.status === "cancelled"
    ? "Cancelado" : payment.type === "expense" ? "Pagado" : "Cobrado";
}

export function paymentTiming(payment: Payment, today = localCivilDate()) {
  if (payment.status !== "pending") return paymentStatusLabel(payment);
  const days = civilDay(payment.dueDate) - civilDay(today);
  if (days < 0) {
    const verb = payment.type === "expense" ? "Venció" : "Debía entrar";
    return `${verb} ${days === -1 ? "ayer" : `hace ${-days} días`}`;
  }
  const verb = payment.type === "expense" ? "vence" : "entra";
  return `${verb} ${days === 0 ? "hoy" : days === 1 ? "mañana" : `en ${days} días`}`;
}

export function groupMovements(payments: Payment[], now = new Date()) {
  const { today, end } = planningHorizon(now);
  const pending = payments.filter(p => p.status === "pending")
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate) || a.id - b.id);
  const history = (status: Payment["status"]) => payments.filter(p => p.status === status)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt) || b.id - a.id);
  return {
    attention: pending.filter(p => isOverdue(p, today)),
    next: pending.filter(p => p.dueDate >= today && p.dueDate <= end),
    later: pending.filter(p => p.dueDate > end),
    completed: history("completed"), cancelled: history("cancelled"),
  };
}
