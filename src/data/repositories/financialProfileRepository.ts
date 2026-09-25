import type { SQLiteDatabase } from "expo-sqlite";

import type {
  FinancialProfile,
  SaveFinancialProfileInput,
} from "@/domain/financialProfile";

interface FinancialProfileRow {
  id: number;
  currency_code: string;
  available_balance_minor: number;
  balance_date: string;
  created_at: string;
  updated_at: string;
}

function mapFinancialProfile(row: FinancialProfileRow): FinancialProfile {
  return {
    id: row.id,
    currencyCode: row.currency_code,
    availableBalanceMinor: row.available_balance_minor,
    balanceDate: row.balance_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getFinancialProfile(
  db: SQLiteDatabase,
): Promise<FinancialProfile | null> {
  const row = await db.getFirstAsync<FinancialProfileRow>(
    `SELECT id, currency_code, available_balance_minor, balance_date,
            created_at, updated_at
     FROM financial_profile WHERE id = 1`,
  );

  return row === null ? null : mapFinancialProfile(row);
}

export async function saveFinancialProfile(
  db: SQLiteDatabase,
  input: SaveFinancialProfileInput,
): Promise<FinancialProfile> {
  if (typeof input.currencyCode !== "string") {
    throw new Error("Invalid currencyCode");
  }
  const currencyCode = input.currencyCode.trim().toUpperCase();
  if (currencyCode.length !== 3) {
    throw new Error("Invalid currencyCode: expected exactly 3 characters");
  }

  if (!Number.isSafeInteger(input.availableBalanceMinor)) {
    throw new Error("Financial profile availableBalanceMinor must be a safe integer");
  }

  if (
    typeof input.balanceDate !== "string" ||
    input.balanceDate.length !== 10 ||
    !/^\d{4}-\d{2}-\d{2}$/.test(input.balanceDate)
  ) {
    throw new Error("Invalid financial profile balanceDate: expected YYYY-MM-DD");
  }

  const now = new Date().toISOString();
  await db.runAsync(
    `INSERT INTO financial_profile
      (id, currency_code, available_balance_minor, balance_date, created_at, updated_at)
     VALUES (1, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       currency_code = excluded.currency_code,
       available_balance_minor = excluded.available_balance_minor,
       balance_date = excluded.balance_date,
       updated_at = excluded.updated_at`,
    currencyCode,
    input.availableBalanceMinor,
    input.balanceDate,
    now,
    now,
  );

  const profile = await getFinancialProfile(db);
  if (profile === null) {
    throw new Error("Unable to retrieve financial profile after successful upsert");
  }

  return profile;
}
