import { Stack, useRouter } from "expo-router";
import { SpaceScreen } from "@/features/space/SpaceScreen";

export default function SpaceRoute() {
  const router = useRouter();
  return <>
    <Stack.Screen options={{ headerShown: false }} />
    <SpaceScreen onBack={() => router.canGoBack() ? router.back() : router.replace("/")} onAchievements={() => router.push("/achievements")}
      onPersonalize={() => router.push("/personalize")} />
  </>;
}
