import type { Payment } from "./payment";

export type SpaceStage = 0 | 1 | 2;

// Milestones use direction and pending civil dates, never amounts or counts.
// Include today and all future dates, even beyond Home's financial horizon.
export function spaceStage(payments: Payment[], now = new Date()): SpaceStage {
  const today = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0")].join("-");
  const planned = payments.filter((payment) => payment.status === "pending" && payment.dueDate >= today);
  const expense = planned.some((payment) => payment.type === "expense");
  const income = planned.some((payment) => payment.type === "income");
  return expense && income ? 2 : expense || income ? 1 : 0;
}
