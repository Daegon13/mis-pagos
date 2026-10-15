import { Stack, useRouter } from "expo-router";
import { BetaFeedbackScreen } from "@/features/help/BetaFeedbackScreen";

export default function BetaFeedbackRoute() {
  const router = useRouter();
  return <><Stack.Screen options={{ headerShown: false }} /><BetaFeedbackScreen onBack={() => router.back()} /></>;
}
