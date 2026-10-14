import { Stack, useRouter } from "expo-router";
import { NotificationSettingsScreen } from "@/features/notifications/NotificationSettingsScreen";

export default function NotificationsRoute() {
  const router = useRouter();
  return <><Stack.Screen options={{ headerShown: false }} />
    <NotificationSettingsScreen onBack={() => router.back()} /></>;
}
