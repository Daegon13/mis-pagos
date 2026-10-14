import type { SQLiteDatabase } from "expo-sqlite";
import { monthPeriod, reserveTarget, validateAllocations,
  type AllocationInput, type ReserveMode, type SpendingAllocation, type SpendingPlan } from "@/domain/spendingPlan";
import { localCivilDate } from "@/domain/paymentTiming";
import { notificationDataChanged } from "@/data/notificationChanges";

type PlanRow = { id: number; period_start: string; period_end: string; reserve_mode: ReserveMode;
  reserve_percent_basis_points: number | null; reserve_target_minor: number;
  created_from_available_minor: number; created_at: string; updated_at: string };
type AllocationRow = { id: number; spending_plan_id: number; name: string;
  percentage_basis_points: number; sort_order: number };

function planFromRow(row: PlanRow): SpendingPlan {
  return { id: row.id, periodStart: row.period_start, periodEnd: row.period_end,
    reserveMode: row.reserve_mode, reservePercentBasisPoints: row.reserve_percent_basis_points,
    reserveTargetMinor: row.reserve_target_minor, createdFromAvailableMinor: row.created_from_available_minor,
    createdAt: row.created_at, updatedAt: row.updated_at };
}

export async function getCurrentPlan(db: SQLiteDatabase, today = localCivilDate()) {
  const row = await db.getFirstAsync<PlanRow>(`SELECT * FROM spending_plans
    WHERE period_start <= ? AND period_end >= ? ORDER BY period_start DESC LIMIT 1`, today, today);
  if (!row) return null;
  const allocations = await db.getAllAsync<AllocationRow>(`SELECT * FROM spending_allocations
    WHERE spending_plan_id = ? ORDER BY sort_order, id`, row.id);
  return { plan: planFromRow(row), allocations: allocations.map((item): SpendingAllocation => ({
    id: item.id, spendingPlanId: item.spending_plan_id, name: item.name,
    percentageBasisPoints: item.percentage_basis_points, sortOrder: item.sort_order })) };
}

export async function saveCurrentPlan(db: SQLiteDatabase, input: { mode: ReserveMode; value: number;
  availableRealMinor: number; allocations: AllocationInput[]; reserveChanged?: boolean }, today = localCivilDate()) {
  const allocations = validateAllocations(input.allocations);
  const period = monthPeriod(today);
  const timestamp = new Date().toISOString();
  await db.withExclusiveTransactionAsync(async tx => {
    const existing = await tx.getFirstAsync<PlanRow>("SELECT * FROM spending_plans WHERE period_start = ?", period.periodStart);
    const unchanged = existing && input.reserveChanged === false;
    const mode = unchanged ? existing.reserve_mode : input.mode;
    const percent = unchanged ? existing.reserve_percent_basis_points : input.mode === "percentage" ? input.value : null;
    const target = unchanged ? existing.reserve_target_minor : reserveTarget(input.availableRealMinor, input.mode, input.value);
    let id: number;
    if (existing) {
      id = existing.id;
      await tx.runAsync(`UPDATE spending_plans SET reserve_mode = ?, reserve_percent_basis_points = ?,
      reserve_target_minor = ?, updated_at = ? WHERE id = ?`, mode, percent, target, timestamp, id);
    } else {
      await tx.runAsync(`INSERT INTO spending_plans
        (period_start, period_end, reserve_mode, reserve_percent_basis_points, reserve_target_minor,
        created_from_available_minor, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      period.periodStart, period.periodEnd, mode, percent,
      target, input.availableRealMinor, timestamp, timestamp);
      const inserted = await tx.getFirstAsync<{ id: number }>("SELECT last_insert_rowid() AS id");
      if (!inserted) throw new Error("Unable to create plan");
      id = inserted.id;
    }
    await tx.runAsync("DELETE FROM spending_allocations WHERE spending_plan_id = ?", id);
    for (const [index, item] of allocations.entries()) {
      await tx.runAsync(`INSERT INTO spending_allocations
        (spending_plan_id, name, percentage_basis_points, sort_order, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)`, id, item.name, item.percentageBasisPoints, index, timestamp, timestamp);
    }
  });
  notificationDataChanged();
  return getCurrentPlan(db, today);
}

export async function deleteCurrentPlan(db: SQLiteDatabase, today = localCivilDate()) {
  const period = monthPeriod(today);
  await db.runAsync("DELETE FROM spending_plans WHERE period_start = ?", period.periodStart);
  notificationDataChanged();
}
