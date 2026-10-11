import { Stack, useRouter } from "expo-router";
import { HelpScreen } from "@/features/help/HelpScreen";

export default function HelpRoute() {
  const router = useRouter();
  return <><Stack.Screen options={{ headerShown: false }} /><HelpScreen onBack={() => router.back()} /></>;
}
