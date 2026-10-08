import { Stack, useRouter } from "expo-router";
import { AchievementsScreen } from "@/features/achievements/AchievementsScreen";

export default function AchievementsRoute() {
  const router = useRouter();
  return <>
    <Stack.Screen options={{ headerShown: false }} />
    <AchievementsScreen onBack={() => router.back()} />
  </>;
}
