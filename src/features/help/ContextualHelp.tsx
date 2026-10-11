import { useRouter } from "expo-router";
import { Alert, Pressable, Text } from "react-native";

import { usePersonalization } from "@/features/personalization/PersonalizationProvider";
import { getHelpTopic } from "./helpContent";

export function ContextualHelp({ topicId, inverse = false }: { topicId: string; inverse?: boolean }) {
  const router = useRouter();
  const { theme } = usePersonalization();
  const topic = getHelpTopic(topicId);
  if (!topic) return null;
  return <Pressable accessibilityRole="button" accessibilityLabel={`Ayuda sobre ${topic.title}`}
    accessibilityHint="Muestra una explicación breve y un enlace a la ayuda completa"
    onPress={() => Alert.alert(topic.title, topic.shortDescription, [
      { text: "Cerrar", style: "cancel" },
      { text: "Ver más", onPress: () => router.push({ pathname: "/help", params: { topic: topic.id } }) },
    ])}
    style={{ minWidth: 44, minHeight: 44, alignItems: "center", justifyContent: "center" }}>
    <Text style={{ color: inverse ? theme.textOnPrimary : theme.primary, fontSize: 18, fontWeight: "600" }}>ⓘ</Text>
  </Pressable>;
}
