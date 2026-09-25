export interface FinancialProfile {
  id: number;
  currencyCode: string;
  availableBalanceMinor: number;
  balanceDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface SaveFinancialProfileInput {
  currencyCode: string;
  availableBalanceMinor: number;
  balanceDate: string;
}
