import { Redirect, Stack } from "expo-router";
import { CalibrationScreen } from "@/features/space/CalibrationScreen";

export default function SpaceCalibrationRoute() {
  if (!__DEV__) return <Redirect href="/" />;
  return <><Stack.Screen options={{ title: "Calibración" }} /><CalibrationScreen /></>;
}
