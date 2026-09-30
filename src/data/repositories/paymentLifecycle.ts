import type { SQLiteDatabase } from "expo-sqlite";

import type { CreatePaymentInput, Payment } from "@/domain/payment";
import { isCivilDate, localCivilDate } from "@/domain/paymentTiming";
import { getPaymentById, listPayments, updatePayment } from "./paymentRepository";
import { getFinancialProfile, saveFinancialProfile } from "./financialProfileRepository";

async function pendingPayment(db: SQLiteDatabase, id: number): Promise<Payment> {
  const payment = await getPaymentById(db, id);
  if (!payment || payment.status !== "pending") throw new Error("Movement is no longer pending");
  return payment;
}

export async function readFinancialSnapshot(db: SQLiteDatabase) {
  let snapshot: { profile: Awaited<ReturnType<typeof getFinancialProfile>>; payments: Payment[] } | undefined;
  await db.withExclusiveTransactionAsync(async tx => {
    snapshot = { profile: await getFinancialProfile(tx), payments: await listPayments(tx) };
  });
  if (!snapshot) throw new Error("Unable to load financial snapshot");
  return snapshot;
}

export async function editPendingPayment(db: SQLiteDatabase, id: number, input: CreatePaymentInput) {
  if (!isCivilDate(input.dueDate)) throw new Error("Invalid civil date");
  let saved: Payment | null = null;
  await db.withExclusiveTransactionAsync(async tx => {
    await pendingPayment(tx, id);
    saved = await updatePayment(tx, id, { ...input, status: "pending" });
    if (!saved) throw new Error("Missing movement");
  });
  return saved;
}

export async function cancelPendingPayment(db: SQLiteDatabase, id: number) {
  await db.withExclusiveTransactionAsync(async tx => {
    const payment = await pendingPayment(tx, id);
    await updatePayment(tx, id, { ...payment, status: "cancelled" });
  });
}

export async function completePayment(db: SQLiteDatabase, id: number, adjustBalance: boolean, now = new Date()) {
  let result: { payment: Payment; balanceMinor: number; currencyCode: string } | undefined;
  await db.withExclusiveTransactionAsync(async tx => {
    // Read inside the transaction: stale screens/double taps cannot apply twice.
    const payment = await pendingPayment(tx, id);
    const profile = await getFinancialProfile(tx);
    if (!profile) throw new Error("Missing financial profile");
    const balanceMinor = profile.availableBalanceMinor + (adjustBalance
      ? payment.amountMinor * (payment.type === "expense" ? -1 : 1) : 0);
    if (!Number.isSafeInteger(balanceMinor)) throw new Error("Balance exceeds safe integer range");
    if (adjustBalance) {
      await saveFinancialProfile(tx, { ...profile, availableBalanceMinor: balanceMinor,
        balanceDate: localCivilDate(now) });
    }
    const completed = await updatePayment(tx, id, { ...payment, status: "completed" });
    if (!completed) throw new Error("Missing movement");
    result = { payment: completed, balanceMinor, currencyCode: profile.currencyCode };
  });
  if (!result) throw new Error("Unable to complete movement");
  return result;
}

export async function updateCurrentBalance(db: SQLiteDatabase, amountMinor: number, now = new Date()) {
  await db.withExclusiveTransactionAsync(async tx => {
    const profile = await getFinancialProfile(tx);
    if (!profile) throw new Error("Missing financial profile");
    await saveFinancialProfile(tx, { ...profile, availableBalanceMinor: amountMinor,
      balanceDate: localCivilDate(now) });
  });
}
