import { Stack, useRouter } from "expo-router";
import { BalanceUpdate } from "@/features/financial-profile/BalanceUpdate";

export default function BalanceRoute() {
  const router = useRouter();
  return <><Stack.Screen options={{ headerShown: false }} />
    <BalanceUpdate onBack={() => router.dismissTo("/")}
      onSaved={() => router.dismissTo({ pathname: "/", params: { balanceSaved: String(Date.now()) } })} />
  </>;
}
