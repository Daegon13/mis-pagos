import { Stack, useRouter } from "expo-router";

import { PersonalizationScreen } from "@/features/personalization/PersonalizationScreen";

export default function PersonalizeRoute() {
  const router = useRouter();
  return <>
    <Stack.Screen options={{ headerShown: false }} />
    <PersonalizationScreen onClose={() => router.dismissTo("/")} />
  </>;
}
