import type { FinancialProfile } from "@/domain/financialProfile";
import type { Payment } from "@/domain/payment";
import { groupMovements, localCivilDate, planningHorizon } from "@/domain/paymentTiming";
import { planAmounts, referencePace, remainingDays, simulateSpending,
  type SpendingPlan } from "@/domain/spendingPlan";
import { calculateHome } from "@/features/home/homeSummary";

/** Version 1 contains aggregate financial facts only. It is safe to serialize without raw records. */
export type FinancialContextSnapshot = {
  version: 1;
  asOfDate: string;
  horizonEndDate: string;
  currencyCode: string;
  currentBalanceMinor: number;
  availableRealMinor: number;
  committedExpenses: { amountMinor: number; count: number; overdueCount: number; oldestOverdueDate: string | null };
  expectedIncome: { amountMinor: number; count: number };
  projectionMinor: number;
  overdueIncomeCount: number;
  upcomingCount: number;
  nextUpcomingDate: string | null;
  plan: null | {
    periodEnd: string;
    reserveTargetMinor: number;
    freeToUseMinor: number;
    reserveShortfallMinor: number;
    remainingDays: number;
    referencePace: ReturnType<typeof referencePace>;
  };
  simulation: null | { hypotheticalSpendMinor: number; result: ReturnType<typeof simulateSpending> };
};

export function buildFinancialContextSnapshot(input: {
  profile: Pick<FinancialProfile, "currencyCode" | "availableBalanceMinor">;
  payments: Payment[];
  now: Date;
  plan?: Pick<SpendingPlan, "periodStart" | "periodEnd" | "reserveTargetMinor"> | null;
  hypotheticalSpendMinor?: number;
}): FinancialContextSnapshot {
  const { profile, payments, now } = input;
  const { today, end } = planningHorizon(now);
  const groups = groupMovements(payments, now);
  const home = calculateHome(profile.availableBalanceMinor, payments, now);
  const overdueExpenses = groups.attention.filter(payment => payment.type === "expense");
  const activePlan = input.plan && input.plan.periodStart <= today && input.plan.periodEnd >= today
    ? input.plan : null;
  const days = activePlan ? remainingDays(today, activePlan.periodEnd) : null;
  const amounts = activePlan ? planAmounts(home.availableMinor, activePlan.reserveTargetMinor) : null;
  if (input.hypotheticalSpendMinor !== undefined && !activePlan) {
    throw new Error("A current spending plan is required for simulation");
  }

  return {
    version: 1,
    asOfDate: localCivilDate(now),
    horizonEndDate: end,
    currencyCode: profile.currencyCode,
    currentBalanceMinor: home.balanceMinor,
    availableRealMinor: home.availableMinor,
    committedExpenses: {
      amountMinor: home.committedMinor,
      count: overdueExpenses.length + groups.next.filter(payment => payment.type === "expense").length,
      overdueCount: overdueExpenses.length,
      oldestOverdueDate: overdueExpenses[0]?.dueDate ?? null,
    },
    expectedIncome: {
      amountMinor: home.incomeMinor,
      count: groups.next.filter(payment => payment.type === "income").length,
    },
    projectionMinor: home.projectionMinor,
    overdueIncomeCount: groups.attention.filter(payment => payment.type === "income").length,
    upcomingCount: groups.next.length,
    nextUpcomingDate: groups.next[0]?.dueDate ?? null,
    plan: activePlan && amounts && days !== null ? {
      periodEnd: activePlan.periodEnd,
      reserveTargetMinor: activePlan.reserveTargetMinor,
      ...amounts,
      remainingDays: days,
      referencePace: referencePace(amounts.freeToUseMinor, days),
    } : null,
    simulation: activePlan && days !== null && input.hypotheticalSpendMinor !== undefined ? {
      hypotheticalSpendMinor: input.hypotheticalSpendMinor,
      result: simulateSpending({ availableRealMinor: home.availableMinor,
        reserveTargetMinor: activePlan.reserveTargetMinor,
        hypotheticalSpendMinor: input.hypotheticalSpendMinor, remainingDays: days }),
    } : null,
  };
}
