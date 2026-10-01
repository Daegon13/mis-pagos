import { isCivilDate, localCivilDate } from "@/domain/paymentTiming";

// Construct in local time. Noon also avoids midnight daylight-saving transitions.
export function civilDateToLocalDate(value: string): Date {
  if (!isCivilDate(value)) throw new Error("Invalid civil date");
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(0);
  date.setFullYear(year, month - 1, day);
  date.setHours(12, 0, 0, 0);
  return date;
}

export function formatCivilDate(value: string): string {
  return new Intl.DateTimeFormat("es-UY", {
    day: "numeric", month: "long", year: "numeric",
  }).format(civilDateToLocalDate(value));
}

// Expo UI's Android Material picker transports calendar fields as UTC midnight,
// not as a local instant. Adapt only at this native boundary, in both directions.
export function civilDateToPickerDate(value: string, platform: string): Date {
  const local = civilDateToLocalDate(value);
  if (platform !== "android") return local;
  const picker = new Date(0);
  picker.setUTCFullYear(local.getFullYear(), local.getMonth(), local.getDate());
  picker.setUTCHours(0, 0, 0, 0);
  return picker;
}

export function pickerDateToCivilDate(date: Date, platform: string): string {
  if (platform !== "android") return localCivilDate(date);
  return [String(date.getUTCFullYear()).padStart(4, "0"),
    String(date.getUTCMonth() + 1).padStart(2, "0"), String(date.getUTCDate()).padStart(2, "0")].join("-");
}
