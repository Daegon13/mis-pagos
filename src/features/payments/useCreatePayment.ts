import { useRef, useState } from "react";
import { useSQLiteContext } from "expo-sqlite";

import { createPayment } from "@/data/repositories/paymentRepository";
import type { PaymentType } from "@/domain/payment";
import { parseBalanceMinor } from "@/features/financial-profile/money";

function localToday(): string {
  const today = new Date();
  return [
    String(today.getFullYear()).padStart(4, "0"),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");
}

function isCivilDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  if (year < 1 || month < 1 || month > 12) return false;
  const leapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const days = [31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return day >= 1 && day <= days[month - 1];
}

interface FormErrors {
  title?: string;
  amount?: string;
  dueDate?: string;
}

export function useCreatePayment() {
  const db = useSQLiteContext();
  const [type, setType] = useState<PaymentType>("expense");
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState(localToday);
  const [notes, setNotes] = useState("");
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
      nextErrors.amount = "Ingresá un importe mayor que cero, sin separadores de miles y con hasta 2 decimales.";
    }
    if (!isCivilDate(dueDate)) {
      nextErrors.dueDate = "Ingresá una fecha válida con formato AAAA-MM-DD.";
    }
    setErrors(nextErrors);
    setSaveError(null);
    if (Object.keys(nextErrors).length > 0 || amountMinor === null) return null;

    // Lock synchronously, including the interval between persistence and navigation.
    saving.current = true;
    setIsSaving(true);
    try {
      return await createPayment(db, {
        type, title: title.trim(), amountMinor, dueDate, notes,
      });
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
