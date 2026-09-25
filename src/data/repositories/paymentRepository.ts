import type { SQLiteDatabase } from "expo-sqlite";

import type {
  CreatePaymentInput,
  Payment,
  PaymentStatus,
  PaymentType,
  UpdatePaymentInput,
} from "@/domain/payment";

interface PaymentRow {
  id: number;
  type: PaymentType;
  title: string;
  amount_minor: number;
  due_date: string;
  status: PaymentStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

function mapPayment(row: PaymentRow): Payment {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    amountMinor: row.amount_minor,
    dueDate: row.due_date,
    status: row.status,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function validatePaymentId(id: number): void {
  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new Error("Payment id must be a positive safe integer");
  }
}

function normalizePaymentInput(input: CreatePaymentInput) {
  if (input.type !== "expense" && input.type !== "income") {
    throw new Error("Invalid payment type");
  }

  if (typeof input.title !== "string" || input.title.trim() === "") {
    throw new Error("Payment title must not be empty");
  }

  if (!Number.isSafeInteger(input.amountMinor) || input.amountMinor <= 0) {
    throw new Error("Payment amountMinor must be a positive safe integer");
  }

  if (
    typeof input.dueDate !== "string" ||
    input.dueDate.length !== 10 ||
    !/^\d{4}-\d{2}-\d{2}$/.test(input.dueDate)
  ) {
    throw new Error("Invalid payment dueDate: expected YYYY-MM-DD");
  }

  if (input.notes != null && typeof input.notes !== "string") {
    throw new Error("Payment notes must be text or null");
  }

  return {
    type: input.type,
    title: input.title.trim(),
    amountMinor: input.amountMinor,
    dueDate: input.dueDate,
    notes: input.notes?.trim() || null,
  };
}

export async function createPayment(
  db: SQLiteDatabase,
  input: CreatePaymentInput,
): Promise<Payment> {
  const payment = normalizePaymentInput(input);
  const now = new Date().toISOString();
  const result = await db.runAsync(
    `INSERT INTO payments
      (type, title, amount_minor, due_date, status, notes, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    payment.type,
    payment.title,
    payment.amountMinor,
    payment.dueDate,
    "pending",
    payment.notes,
    now,
    now,
  );

  const created = await getPaymentById(db, result.lastInsertRowId);
  if (created === null) {
    throw new Error("Unable to retrieve payment after successful insert");
  }

  return created;
}

export async function getPaymentById(
  db: SQLiteDatabase,
  id: number,
): Promise<Payment | null> {
  validatePaymentId(id);
  const row = await db.getFirstAsync<PaymentRow>(
    `SELECT id, type, title, amount_minor, due_date, status, notes,
            created_at, updated_at
     FROM payments WHERE id = ?`,
    id,
  );

  return row === null ? null : mapPayment(row);
}

export async function listPayments(db: SQLiteDatabase): Promise<Payment[]> {
  const rows = await db.getAllAsync<PaymentRow>(
    `SELECT id, type, title, amount_minor, due_date, status, notes,
            created_at, updated_at
     FROM payments ORDER BY due_date ASC, id ASC`,
  );

  return rows.map(mapPayment);
}

export async function updatePayment(
  db: SQLiteDatabase,
  id: number,
  input: UpdatePaymentInput,
): Promise<Payment | null> {
  validatePaymentId(id);
  const payment = normalizePaymentInput(input);
  if (
    input.status !== "pending" &&
    input.status !== "completed" &&
    input.status !== "cancelled"
  ) {
    throw new Error("Invalid payment status");
  }

  const result = await db.runAsync(
    `UPDATE payments
     SET type = ?, title = ?, amount_minor = ?, due_date = ?, status = ?,
         notes = ?, updated_at = ?
     WHERE id = ?`,
    payment.type,
    payment.title,
    payment.amountMinor,
    payment.dueDate,
    input.status,
    payment.notes,
    new Date().toISOString(),
    id,
  );

  return result.changes === 0 ? null : getPaymentById(db, id);
}

// Explicit deletion is permanent; status "cancelled" retains the record.
export async function deletePayment(
  db: SQLiteDatabase,
  id: number,
): Promise<boolean> {
  validatePaymentId(id);
  const result = await db.runAsync("DELETE FROM payments WHERE id = ?", id);
  return result.changes === 1;
}
