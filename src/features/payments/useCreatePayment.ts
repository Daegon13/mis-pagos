import { useRef, useState } from "react";
import { useSQLiteContext } from "expo-sqlite";

import { createPayment } from "@/data/repositories/paymentRepository";
import { editPendingPayment } from "@/data/repositories/paymentLifecycle";
import type { Payment, PaymentType } from "@/domain/payment";
import { isCivilDate, localCivilDate } from "@/domain/paymentTiming";
import { minorToInput, parseBalanceMinor } from "@/features/financial-profile/money";

interface FormErrors {
  title?: string;
  amount?: string;
  dueDate?: string;
}

export function useCreatePayment(initial?: Payment) {
  const db = useSQLiteContext();
  const [type, setType] = useState<PaymentType>(initial?.type ?? "expense");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [amount, setAmount] = useState(initial ? minorToInput(initial.amountMinor) : "");
  const [dueDate, setDueDate] = useState(initial?.dueDate ?? localCivilDate());
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [errors, setErrors] = useState<FormErrors>({});
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const saving = useRef(false);

  async function save() {
    if (saving.current) return null;
    const amountMinor = parseBalanceMinor(amount);
    const nextErrors: FormErrors = {};
    if (!title.trim()) nextErrors.title = "Ingresá un nombre para el movimiento.";
    if (amountMinor === null || amountMinor <= 0) {
      nextErrors.amount = "Ingresá un importe mayor que cero. Por ejemplo: 1.500,50.";
    }
    if (!isCivilDate(dueDate)) {
      nextErrors.dueDate = "Elegí una fecha para el movimiento.";
    }
    setErrors(nextErrors);
    setSaveError(null);
    if (Object.keys(nextErrors).length > 0 || amountMinor === null) return null;

    // Lock synchronously, including the interval between persistence and navigation.
    saving.current = true;
    setIsSaving(true);
    try {
      const input = { type, title: title.trim(), amountMinor, dueDate, notes };
      return initial ? await editPendingPayment(db, initial.id, input) : await createPayment(db, input);
    } catch {
      setSaveError("No pudimos guardar el movimiento.");
      saving.current = false;
      setIsSaving(false);
      return null;
    }
  }

  return {
    type, setType, title, setTitle, amount, setAmount, dueDate, setDueDate,
    notes, setNotes, errors, saveError, isSaving, save,
  };
}
