import type { Payment } from "@/domain/payment";
import { groupMovements, localCivilDate, paymentTiming } from "@/domain/paymentTiming";

export function calculateHome(balanceMinor: number, payments: Payment[], now = new Date()) {
  const groups = groupMovements(payments, now);
  const sum = (type: Payment["type"]) => (type === "expense" ? [...groups.attention, ...groups.next] : groups.next)
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
    attentionCount: groups.attention.length,
    overdueExpenseCount: groups.attention.filter(payment => payment.type === "expense").length,
    overdue: groups.attention.slice(0, 2).map(payment => ({ ...payment, timing: paymentTiming(payment, localCivilDate(now)) })),
    upcoming: groups.next.slice(0, 5).map(payment => ({ ...payment, timing: paymentTiming(payment, localCivilDate(now)) })),
  };
}

export type HomeSummary = ReturnType<typeof calculateHome>;
