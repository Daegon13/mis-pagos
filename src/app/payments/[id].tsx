import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { MovementDetail } from "@/features/payments/MovementDetail";

export default function MovementDetailRoute() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  return <><Stack.Screen options={{ headerShown: false }} />
    <MovementDetail key={id} id={Number(id)}
      onBack={() => router.canGoBack() ? router.back() : router.replace("/payments")}
      onDeleted={() => router.dismissTo({ pathname: "/payments", params: { deleted: String(Date.now()) } })} />
  </>;
}
