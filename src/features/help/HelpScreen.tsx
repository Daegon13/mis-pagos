import { useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { usePersonalization } from "@/features/personalization/PersonalizationProvider";
import { HELP_CATEGORIES, HELP_TOPICS, getHelpTopic, type HelpCategoryId } from "./helpContent";

const SUPPORT_EMAIL = "mispagos.soporte@gmail.com";
const PUBLIC_PRIVACY_URL = "https://mis-pagos-website.vercel.app/privacidad";
const FEEDBACK_BODY = [
  "¿Qué estabas intentando hacer?", "¿Qué esperabas que ocurriera?", "¿Qué ocurrió?",
  "¿Hubo algo que no entendieras?", "¿Qué te gustaría que Mis Pagos hiciera automáticamente?",
  "", "Por favor, evitá incluir información financiera sensible.",
].join("\n\n");
const ERROR_BODY = [
  "¿Qué estabas haciendo?", "¿Qué ocurrió?", "¿Podés repetirlo?",
  "Modelo de teléfono / versión de Android, si la sabés:",
  "", "Por favor, evitá incluir información financiera sensible.",
].join("\n\n");

function openFeedback(subject: string, body: string) {
  const email = SUPPORT_EMAIL.trim();
  if (!email) return;
  void Linking.openURL(`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
}

export function HelpScreen({ onBack }: { onBack: () => void }) {
  const { topic: linkedTopic } = useLocalSearchParams<{ topic?: string }>();
  const { theme } = usePersonalization();
  const [category, setCategory] = useState<HelpCategoryId | "glossary" | "privacy" | null>(null);
  const [topicId, setTopicId] = useState<string | null>(linkedTopic && getHelpTopic(linkedTopic) ? linkedTopic : null);
  const topic = topicId ? getHelpTopic(topicId) : undefined;
  const back = () => {
    if (topic && !category) onBack();
    else if (topic) setTopicId(null);
    else if (category) setCategory(null);
    else onBack();
  };
  const heading = { color: theme.textPrimary };
  const body = { color: theme.textSecondary };
  const link = { color: theme.primary };

  return <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={["bottom"]}>
    <ScrollView contentContainerStyle={styles.content}>
      <Pressable accessibilityRole="button" accessibilityLabel={topic || category ? "Volver en Ayuda" : "Volver a la pantalla anterior"}
        onPress={back} style={styles.back}><Text style={link}>← Volver</Text></Pressable>
      {topic ? <>
        <Text style={[styles.eyebrow, body]}>{HELP_CATEGORIES.find(item => item.id === topic.category)?.title}</Text>
        <Text accessibilityRole="header" style={[styles.heading, heading]}>{topic.title}</Text>
        <Text style={[styles.lead, body]}>{topic.shortDescription}</Text>
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.body, heading]}>{topic.body}</Text>
        </View>
        {!!topic.relatedTopicIds?.length && <>
          <Text accessibilityRole="header" style={[styles.subhead, heading]}>También puede ayudarte</Text>
          {topic.relatedTopicIds.map(id => {
            const related = getHelpTopic(id);
            return related && <Pressable key={id} accessibilityRole="button" onPress={() => setTopicId(id)} style={styles.row}>
              <Text style={[styles.rowText, link]}>{related.title} →</Text>
            </Pressable>;
          })}
        </>}
      </> : category === "privacy" ? <>
        <Text accessibilityRole="header" style={[styles.heading, heading]}>Privacidad</Text>
        <Text style={[styles.lead, body]}>Cómo se manejan tus datos en Mis Pagos.</Text>
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.body, heading]}>Tus saldos, movimientos, planes, preferencias y descubrimientos se guardan en la base de datos de este dispositivo. Mis Pagos no tiene cuenta, sincronización bancaria ni nube propia.</Text>
          <Text style={[styles.body, heading]}>Las funciones principales se pueden usar sin conexión. El paquete incluye componentes de Expo y React Native con capacidad de red; su comportamiento de red final se verifica antes de completar la declaración de privacidad de Google Play. No incluyas datos financieros sensibles al enviar comentarios.</Text>
          <Text style={[styles.body, heading]}>Podés eliminar movimientos y planes desde la app. Desinstalarla elimina sus datos locales del dispositivo; las copias del sistema operativo, si están activadas, pueden tener sus propias reglas de conservación. Mis Pagos no ofrece exportación ni respaldo dentro de la app.</Text>
          <Text style={[styles.body, heading]}>Responsable: Diego Marin. Contacto de privacidad: {SUPPORT_EMAIL}.</Text>
          <Pressable accessibilityRole="link" accessibilityLabel="Abrir política de privacidad completa" onPress={() => void Linking.openURL(PUBLIC_PRIVACY_URL)} style={styles.row}>
            <Text style={[styles.rowText, link]}>Leer la política de privacidad completa →</Text>
          </Pressable>
        </View>
      </> : category === "glossary" ? <>
        <Text accessibilityRole="header" style={[styles.heading, heading]}>Glosario</Text>
        <Text style={[styles.lead, body]}>Palabras que usamos en Mis Pagos, en pocas líneas.</Text>
        {HELP_TOPICS.filter(item => item.glossaryDefinition).map(item => <Pressable key={item.id}
          accessibilityRole="button" accessibilityLabel={`${item.glossaryTitle ?? item.title}. ${item.glossaryDefinition} Ver explicación completa`}
          onPress={() => setTopicId(item.id)} style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.subhead, heading]}>{item.glossaryTitle ?? item.title}</Text>
          <Text style={[styles.body, body]}>{item.glossaryDefinition}</Text>
        </Pressable>)}
      </> : category ? <>
        <Text accessibilityRole="header" style={[styles.heading, heading]}>{HELP_CATEGORIES.find(item => item.id === category)?.title}</Text>
        <Text style={[styles.lead, body]}>{HELP_CATEGORIES.find(item => item.id === category)?.introduction}</Text>
        {HELP_TOPICS.filter(item => item.category === category).map(item => <Pressable key={item.id}
          accessibilityRole="button" accessibilityLabel={`Leer sobre ${item.title}`} onPress={() => setTopicId(item.id)}
          style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.subhead, heading]}>{item.title}</Text>
          <Text style={[styles.body, body]}>{item.shortDescription}</Text>
        </Pressable>)}
      </> : <>
        <Text accessibilityRole="header" style={[styles.heading, heading]}>Cómo funciona Mis Pagos</Text>
        <Text style={[styles.lead, body]}>¿Qué querés entender mejor?</Text>
        {HELP_CATEGORIES.map(item => <Pressable key={item.id} accessibilityRole="button"
          accessibilityLabel={`Abrir ${item.title}`} onPress={() => setCategory(item.id)}
          style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.subhead, heading]}>{item.title} →</Text>
          <Text style={[styles.body, body]}>{item.introduction}</Text>
        </Pressable>)}
        <Pressable accessibilityRole="button" accessibilityLabel="Abrir glosario" onPress={() => setCategory("glossary")}
          style={[styles.card, { backgroundColor: theme.primarySurface, borderColor: theme.border }]}>
          <Text style={[styles.subhead, heading]}>Glosario →</Text>
          <Text style={[styles.body, body]}>Encontrá una definición rápida.</Text>
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Abrir privacidad" onPress={() => setCategory("privacy")}
          style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.subhead, heading]}>Privacidad →</Text>
          <Text style={[styles.body, body]}>Cómo se guardan y gestionan tus datos.</Text>
        </Pressable>
        {SUPPORT_EMAIL.trim() ? <>
          <Pressable accessibilityRole="button" onPress={() => openFeedback("[Mis Pagos Beta] Comentario", FEEDBACK_BODY)}
            style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.subhead, heading]}>Enviar comentarios →</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={() => openFeedback("[Mis Pagos Beta] Error", ERROR_BODY)}
            style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.subhead, heading]}>Reportar un error →</Text>
          </Pressable>
        </> : null}
      </>}
    </ScrollView>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  content: { width: "100%", maxWidth: 560, alignSelf: "center", padding: 24, paddingBottom: 48, gap: 12 },
  back: { minHeight: 44, alignSelf: "flex-start", justifyContent: "center", paddingRight: 16 },
  eyebrow: { fontSize: 13, fontWeight: "600" },
  heading: { fontSize: 27, lineHeight: 34, fontWeight: "700" },
  lead: { fontSize: 16, lineHeight: 24, marginBottom: 6 },
  card: { padding: 16, borderRadius: 16, borderWidth: 1, gap: 7, minHeight: 60 },
  subhead: { fontSize: 18, lineHeight: 24, fontWeight: "600" },
  body: { fontSize: 15, lineHeight: 23 },
  row: { minHeight: 44, justifyContent: "center", paddingHorizontal: 4 },
  rowText: { fontSize: 15, fontWeight: "600" },
});
