import { Stack, useRouter } from "expo-router";
import { PlanningScreen } from "@/features/planning/PlanningScreen";

export default function PlanRoute() {
  const router = useRouter();
  return <><Stack.Screen options={{ title: "Tu plan" }} /><PlanningScreen onBack={() => router.back()} /></>;
}
