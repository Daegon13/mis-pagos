export type PaymentType = "expense" | "income";

export type PaymentStatus = "pending" | "completed" | "cancelled";

export interface Payment {
  id: number;
  type: PaymentType;
  title: string;
  amountMinor: number;
  dueDate: string;
  status: PaymentStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentInput {
  type: PaymentType;
  title: string;
  amountMinor: number;
  dueDate: string;
  notes?: string | null;
}

export interface UpdatePaymentInput {
  type: PaymentType;
  title: string;
  amountMinor: number;
  dueDate: string;
  status: PaymentStatus;
  notes?: string | null;
}
