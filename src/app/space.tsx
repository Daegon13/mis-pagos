import { Stack, useRouter } from "expo-router";
import { SpaceScreen } from "@/features/space/SpaceScreen";

export default function SpaceRoute() {
  const router = useRouter();
  return <>
    <Stack.Screen options={{ title: "Tu espacio" }} />
    <SpaceScreen onBack={() => router.back()} onAchievements={() => router.push("/achievements")}
      onPersonalize={() => router.push("/personalize")} />
  </>;
}
