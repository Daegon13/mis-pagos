import { isCivilDate } from "./paymentTiming";

export type ReserveMode = "percentage" | "fixed";
export type AllocationInput = { name: string; percentageBasisPoints: number };
export type SpendingPlan = {
  id: number; periodStart: string; periodEnd: string; reserveMode: ReserveMode;
  reservePercentBasisPoints: number | null; reserveTargetMinor: number;
  createdFromAvailableMinor: number; createdAt: string; updatedAt: string;
};
export type SpendingAllocation = AllocationInput & { id: number; spendingPlanId: number; sortOrder: number };

function safe(value: number): number {
  if (!Number.isSafeInteger(value)) throw new Error("Amount exceeds safe integer range");
  return value;
}

export function monthPeriod(today: string) {
  if (!isCivilDate(today)) throw new Error("Invalid civil date");
  const [year, month] = today.split("-").map(Number);
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const length = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1];
  return { periodStart: `${today.slice(0, 7)}-01`, periodEnd: `${today.slice(0, 7)}-${length}` };
}

export function remainingDays(today: string, periodEnd: string): number {
  if (!isCivilDate(today) || !isCivilDate(periodEnd)) throw new Error("Invalid civil date");
  // Gregorian civil ordinals avoid daylight-saving and UTC boundary shifts.
  const ordinal = (value: string) => {
    let [year, month, day] = value.split("-").map(Number);
    year -= month <= 2 ? 1 : 0;
    const era = Math.floor(year / 400);
    const y = year - era * 400;
    month += month > 2 ? -3 : 9;
    return era * 146097 + y * 365 + Math.floor(y / 4) - Math.floor(y / 100)
      + Math.floor((153 * month + 2) / 5) + day;
  };
  return Math.max(0, ordinal(periodEnd) - ordinal(today) + 1);
}

export function reserveTarget(availableRealMinor: number, mode: ReserveMode, value: number): number {
  safe(availableRealMinor);
  if (mode === "fixed") {
    if (!Number.isSafeInteger(value) || value < 0) throw new Error("Invalid reserve amount");
    return value;
  }
  if (!Number.isInteger(value) || value < 0 || value > 10_000) throw new Error("Invalid reserve percentage");
  const result = (BigInt(Math.max(0, availableRealMinor)) * BigInt(value) + 5_000n) / 10_000n;
  return safe(Number(result));
}

export function planAmounts(availableRealMinor: number, reserveTargetMinor: number) {
  safe(availableRealMinor); safe(reserveTargetMinor);
  if (reserveTargetMinor < 0) throw new Error("Invalid reserve amount");
  const difference = safe(availableRealMinor - reserveTargetMinor);
  return { freeToUseMinor: Math.max(0, difference), reserveShortfallMinor: Math.max(0, -difference) };
}

export function validateAllocations(input: AllocationInput[]): AllocationInput[] {
  if (input.length > 6) throw new Error("Usá hasta 6 asignaciones.");
  const names = new Set<string>();
  const allocations = input.map(item => {
    const name = item.name.trim();
    if (!name || name.length > 32 || names.has(name.toLocaleLowerCase("es"))) throw new Error("Revisá los nombres de las asignaciones.");
    names.add(name.toLocaleLowerCase("es"));
    if (!Number.isInteger(item.percentageBasisPoints) || item.percentageBasisPoints < 0 || item.percentageBasisPoints > 10_000)
      throw new Error("Porcentaje de asignación inválido.");
    return { name, percentageBasisPoints: item.percentageBasisPoints };
  });
  if (allocations.length && allocations.reduce((sum, item) => sum + item.percentageBasisPoints, 0) !== 10_000)
    throw new Error("Las asignaciones deben sumar 100%.");
  return allocations;
}

export function allocationAmounts(freeToUseMinor: number, input: AllocationInput[]) {
  safe(freeToUseMinor);
  if (freeToUseMinor < 0) throw new Error("Invalid flexible amount");
  const allocations = validateAllocations(input);
  const parts = allocations.map((item, index) => {
    const product = BigInt(freeToUseMinor) * BigInt(item.percentageBasisPoints);
    return { ...item, index, amountMinor: Number(product / 10_000n), remainder: Number(product % 10_000n) };
  });
  let leftover = freeToUseMinor - parts.reduce((sum, part) => sum + part.amountMinor, 0);
  for (const part of [...parts].sort((a, b) => b.remainder - a.remainder || a.index - b.index)) {
    if (leftover-- <= 0) break;
    part.amountMinor += 1;
  }
  return parts.map(({ name, percentageBasisPoints, amountMinor }) => ({ name, percentageBasisPoints, amountMinor }));
}

export function referencePace(freeToUseMinor: number, days: number) {
  safe(freeToUseMinor);
  if (!Number.isInteger(days) || days < 1) throw new Error("Invalid remaining days");
  const dailyMinor = Number(BigInt(freeToUseMinor) / BigInt(days));
  const weeklyMinor = days > 14 ? safe(Number(BigInt(freeToUseMinor) * 7n / BigInt(days))) : null;
  return { dailyMinor, weeklyMinor, unit: days <= 14 ? "day" as const : "week" as const,
    displayMinor: days <= 14 ? dailyMinor : weeklyMinor! };
}

export function simulateSpending(input: { availableRealMinor: number; reserveTargetMinor: number;
  hypotheticalSpendMinor: number; remainingDays: number }) {
  const { availableRealMinor, reserveTargetMinor, hypotheticalSpendMinor, remainingDays: days } = input;
  if (!Number.isSafeInteger(hypotheticalSpendMinor) || hypotheticalSpendMinor <= 0) throw new Error("Invalid hypothetical amount");
  const { freeToUseMinor } = planAmounts(availableRealMinor, reserveTargetMinor);
  const resultingAvailableRealMinor = safe(availableRealMinor - hypotheticalSpendMinor);
  const result = planAmounts(resultingAvailableRealMinor, reserveTargetMinor);
  const outcome = hypotheticalSpendMinor <= freeToUseMinor ? "withinFlexible"
    : hypotheticalSpendMinor <= availableRealMinor ? "usesReserve" : "exceedsAvailable";
  return { outcome, resultingAvailableRealMinor, ...result,
    excessAvailableMinor: Math.max(0, safe(hypotheticalSpendMinor - availableRealMinor)),
    resultingPace: referencePace(result.freeToUseMinor, days) };
}
