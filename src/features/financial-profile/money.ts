// This initial MVP uses two minor-unit digits for every currency offered in setup.
export function minorToInput(amountMinor: number): string {
  return `${amountMinor < 0 ? "-" : ""}${Math.trunc(Math.abs(amountMinor) / 100)}.${String(Math.abs(amountMinor % 100)).padStart(2, "0")}`;
}

export function parseBalanceMinor(value: string): number | null {
  const match = /^(-?)(\d[\d.,]*)$/.exec(value.trim());
  if (!match) return null;
  const unsigned = match[2];
  const separator = unsigned.includes(",") && unsigned.includes(".")
    ? unsigned.lastIndexOf(",") > unsigned.lastIndexOf(".") ? "," : "."
    : /[.,]\d{1,2}$/.test(unsigned) ? unsigned.match(/[.,](?=\d+$)/)![0] : null;
  const split = separator ? unsigned.lastIndexOf(separator) : -1;
  const whole = split < 0 ? unsigned : unsigned.slice(0, split);
  const fraction = split < 0 ? "" : unsigned.slice(split + 1);
  if (separator && !/^\d{1,2}$/.test(fraction)) return null;
  // Grouping must be consistent and complete; a single comma with three digits
  // is ambiguous in our locale and is deliberately rejected.
  const grouping = separator === "." ? "," : ".";
  const grouped = grouping === "." ? /^\d{1,3}(?:\.\d{3})+$/ : /^\d{1,3}(?:,\d{3})+$/;
  if (!/^\d+$/.test(whole) && !grouped.test(whole)) return null;
  const digits = `${whole.replace(/[.,]/g, "")}${fraction.padEnd(2, "0")}`;
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
