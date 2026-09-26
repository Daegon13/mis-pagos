import type { Payment } from "@/domain/payment";

export function calculateHome(balanceMinor: number, payments: Payment[], now = new Date()) {
  // Local civil dates, today through today + 30 inclusive. Calendar stepping
  // also keeps relative day counts correct across daylight-saving changes.
  const dates = Array.from({ length: 31 }, (_, offset) => {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset, 12);
    return [String(date.getFullYear()).padStart(4, "0"),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0")].join("-");
  });
  const pending = payments.filter((payment) => payment.status === "pending"
    && payment.dueDate >= dates[0] && payment.dueDate <= dates[30])
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate) || a.id - b.id);
  const sum = (type: Payment["type"]) => pending
    .filter((payment) => payment.type === type)
    .reduce((total, payment) => {
      const next = total + payment.amountMinor;
      if (!Number.isSafeInteger(next)) throw new Error("Home amount exceeds safe integer range");
      return next;
    }, 0);
  const committedMinor = sum("expense");
  const incomeMinor = sum("income");
  const availableMinor = balanceMinor - committedMinor;
  const projectionMinor = availableMinor + incomeMinor;
  if (![availableMinor, projectionMinor].every(Number.isSafeInteger)) {
    throw new Error("Home amount exceeds safe integer range");
  }
  return {
    balanceMinor, committedMinor, incomeMinor, availableMinor, projectionMinor,
    upcoming: pending.slice(0, 5).map((payment) => {
      const days = dates.indexOf(payment.dueDate);
      const verb = payment.type === "expense" ? "vence" : "entra";
      return { ...payment, timing: `${verb} ${days === 0 ? "hoy" : days === 1 ? "mañana" : `en ${days} días`}` };
    }),
  };
}

export type HomeSummary = ReturnType<typeof calculateHome>;
