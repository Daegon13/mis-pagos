import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Movements } from "@/features/payments/Movements";

export default function MovementsRoute() {
  const router = useRouter();
  const { deleted } = useLocalSearchParams<{ deleted?: string }>();
  return <><Stack.Screen options={{ headerShown: false }} />
    <Movements deleted={deleted} onDismiss={() => router.setParams({ deleted: undefined })}
      onBack={() => router.dismissTo("/")}
      onOpen={id => router.push({ pathname: "/payments/[id]", params: { id: String(id) } })} />
  </>;
}
