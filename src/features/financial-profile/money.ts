// This initial MVP uses two minor-unit digits for every currency offered in setup.
export function parseBalanceMinor(value: string): number | null {
  const match = /^(-?)(\d+)(?:[.,](\d{1,2}))?$/.exec(value.trim());
  if (!match) return null;

  const digits = `${match[2]}${(match[3] ?? "").padEnd(2, "0")}`;
  const amountMinor = Number(`${match[1]}${digits}`);
  return Number.isSafeInteger(amountMinor) ? amountMinor : null;
}

export function formatBalance(amountMinor: number, currencyCode: string): string {
  const fraction = String(Math.abs(amountMinor % 100)).padStart(2, "0");
  return new Intl.NumberFormat("es-UY", {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
    .formatToParts(Math.trunc(amountMinor / 100))
    .map((part) => part.type === "fraction" ? fraction : part.value)
    .join("");
}
