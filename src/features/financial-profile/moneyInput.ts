import { Platform, type TextInputProps } from "react-native";

// Web needs a text input so typing or pasting either decimal separator is preserved.
// inputMode only hints the mobile keyboard; parsing remains in money.ts.
export const moneyInputProps: Pick<TextInputProps, "inputMode" | "keyboardType"> =
  Platform.OS === "web" ? { inputMode: "decimal" } : { keyboardType: "decimal-pad" };

export const percentInputProps: Pick<TextInputProps, "inputMode" | "keyboardType"> =
  Platform.OS === "web" ? { inputMode: "numeric" } : { keyboardType: "number-pad" };
