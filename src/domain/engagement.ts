import type { Payment } from "./payment";
import type { AchievementId } from "./achievements";

export type SpaceStage = 0 | 1 | 2;

const FINANCIAL_DISCOVERIES: ReadonlySet<AchievementId> = new Set([
  "FIRST_COMMITMENT", "FIRST_EXPECTED_INCOME", "FIRST_RESOLVED_MOVEMENT",
  "FIRST_OVERDUE_RESOLVED", "FIRST_RESERVE", "FIRST_SPENDING_SIMULATION",
]);

// Stage 1 keeps the original pending-date rule. Stage 2 uses distinct persisted
// financial discoveries, never amounts, movement counts or personalization.
export function spaceStage(payments: Payment[], unlocks: readonly AchievementId[] = [],
  now = new Date()): SpaceStage {
  if (new Set(unlocks.filter(id => FINANCIAL_DISCOVERIES.has(id))).size >= 2) return 2;
  const today = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0")].join("-");
  const planned = payments.filter((payment) => payment.status === "pending" && payment.dueDate >= today);
  return planned.some(payment => payment.type === "expense" || payment.type === "income") ? 1 : 0;
}
