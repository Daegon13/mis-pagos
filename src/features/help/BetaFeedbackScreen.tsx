import { useEffect, useRef, useState } from "react";
import { Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSQLiteContext } from "expo-sqlite";
import { usePersonalization } from "@/features/personalization/PersonalizationProvider";
import { loadBetaFeedback, saveBetaAnswer, saveBetaComment } from "@/data/repositories/betaFeedbackRepository";
import { BETA_QUESTIONS, BETA_SECTIONS, FEATURED_QUESTION_IDS, betaEmailBody, betaProgress,
  type BetaAnswers, type BetaQuestion } from "./betaFeedbackQuestions";

const SUPPORT_EMAIL = "mispagos.soporte@gmail.com";

export function BetaFeedbackScreen({ onBack }: { onBack: () => void }) {
  const db = useSQLiteContext();
  const { theme } = usePersonalization();
  const [answers, setAnswers] = useState<BetaAnswers>({});
  const [comment, setComment] = useState("");
  const [ready, setReady] = useState(false);
  const [sectionId, setSectionId] = useState<string | null>(null);
  const [showOptional, setShowOptional] = useState(false);
  const [message, setMessage] = useState("");
  const scrollRef = useRef<ScrollView>(null);
  const writes = useRef<Promise<void>>(Promise.resolve());
  useEffect(() => { scrollRef.current?.scrollTo({ y: 0, animated: false }); }, [sectionId]);
  const queue = (write: () => Promise<void>) => {
    writes.current = writes.current.catch(() => {}).then(write);
    void writes.current.catch(() => setMessage("No pudimos guardar tu respuesta. Intentá de nuevo."));
  };

  useEffect(() => {
    let active = true;
    void loadBetaFeedback(db).then(data => { if (active) {
      setAnswers(data.answers); setComment(data.comment); setReady(true);
    } }).catch(() => { if (active) setMessage("No pudimos cargar tus respuestas. Volvé a abrir esta pantalla."); });
    return () => { active = false; };
  }, [db]);

  const choose = (questionId: string, optionId: string) => {
    setAnswers(current => ({ ...current, [questionId]: optionId }));
    setMessage("Gracias 💚 Esto nos ayuda a decidir qué construir después.");
    queue(() => saveBetaAnswer(db, questionId, optionId));
  };
  const changeComment = (value: string) => {
    setComment(value);
    queue(() => saveBetaComment(db, value));
  };
  const send = async () => {
    try {
      await writes.current;
      const url = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("[Mis Pagos Beta] Respuestas")}`
        + `&body=${encodeURIComponent(betaEmailBody(answers, comment))}`;
      await Linking.openURL(url);
    } catch {
      setMessage("No encontramos una app de correo para abrir el mensaje. Tus respuestas siguen guardadas acá.");
    }
  };
  const card = { backgroundColor: theme.surface, borderColor: theme.border };
  const primary = { color: theme.textPrimary };
  const secondary = { color: theme.textSecondary };
  const progress = betaProgress(answers);
  const questions = sectionId === "featured"
    ? BETA_QUESTIONS.filter(q => FEATURED_QUESTION_IDS.some(id => id === q.id))
    : BETA_QUESTIONS.filter(q => q.section === sectionId && (showOptional || q.priority === "core"));
  const questionCard = (q: BetaQuestion) => <View key={q.id} style={[styles.card, card]}>
    <Text style={[styles.question, primary]}>{q.question}</Text>
    {q.options.map(option => {
      const selected = answers[q.id] === option.id;
      return <Pressable key={option.id} accessibilityRole="radio" accessibilityState={{ selected }}
        accessibilityLabel={option.label} onPress={() => choose(q.id, option.id)}
        style={[styles.option, { backgroundColor: selected ? theme.primarySurface : theme.background,
          borderColor: selected ? theme.primary : theme.border }]}>
        <Text style={[styles.optionText, { color: selected ? theme.primary : theme.textPrimary }]}>
          {selected ? "✓ " : ""}{option.label}</Text>
      </Pressable>;
    })}
  </View>;

  return <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={["bottom"]}>
    <ScrollView ref={scrollRef} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Pressable accessibilityRole="button" onPress={() => sectionId ? setSectionId(null) : onBack()} style={styles.back}>
        <Text style={{ color: theme.primary }}>← Volver</Text>
      </Pressable>
      <Text accessibilityRole="header" style={[styles.heading, primary]}>
        {sectionId === "featured" ? "Preguntas principales" : BETA_SECTIONS.find(s => s.id === sectionId)?.title ?? "Ayudanos a decidir"}
      </Text>
      {ready && (sectionId ? <>
        <Text style={secondary}>Podés cambiar cualquier respuesta cuando quieras.</Text>
        {sectionId !== "featured" && <Text style={secondary}>
          {betaProgress(answers, BETA_QUESTIONS.filter(q => q.section === sectionId).map(q => q.id)).answered} de {BETA_QUESTIONS.filter(q => q.section === sectionId).length} respondidas
        </Text>}
        {questions.map(questionCard)}
        {sectionId !== "featured" && <Pressable accessibilityRole="button" onPress={() => setShowOptional(value => !value)} style={[styles.card, card]}>
          <Text style={{ color: theme.primary, fontWeight: "600" }}>{showOptional ? "Ocultar preguntas opcionales" : "Más preguntas →"}</Text>
        </Pressable>}
      </> : <>
        <Text style={[styles.lead, secondary]}>Probamos ideas para las próximas versiones. Elegí qué te serviría y ayudanos a decidir qué construir.</Text>
        <Text style={secondary}>Tus respuestas quedan en este dispositivo hasta que decidas enviarlas.</Text>
        <Pressable accessibilityRole="button" onPress={() => { setShowOptional(false); setSectionId("featured"); }} style={[styles.card, { backgroundColor: theme.primarySurface, borderColor: theme.border }]}>
          <Text style={[styles.question, primary]}>Preguntas principales →</Text>
          <Text style={secondary}>{progress.answered} de {progress.total} respondidas · Empezá por las que quieras</Text>
        </Pressable>
        {BETA_SECTIONS.map(section => {
          const ids = BETA_QUESTIONS.filter(q => q.section === section.id).map(q => q.id);
          const count = betaProgress(answers, ids);
          return <Pressable key={section.id} accessibilityRole="button" onPress={() => { setShowOptional(false); setSectionId(section.id); }} style={[styles.card, card]}>
            <Text style={[styles.question, primary]}>{section.title} →</Text>
            <Text style={secondary}>{section.description}</Text>
            <Text style={{ color: theme.primary }}>{count.answered} de {count.total} respondidas</Text>
          </Pressable>;
        })}
        <View style={[styles.card, card]}>
          <Text style={[styles.question, primary]}>¿Hay algo que no te preguntamos?</Text>
          <Text style={secondary}>Contanos cualquier idea, problema o cosa que te gustaría cambiar. Evitá incluir datos financieros personales.</Text>
          <TextInput accessibilityLabel="Comentario opcional" multiline maxLength={1000} value={comment}
            onChangeText={changeComment} placeholder="Escribí si querés..." placeholderTextColor={theme.textSecondary}
            style={[styles.input, { color: theme.textPrimary, borderColor: theme.border, backgroundColor: theme.background }]} />
          <Text style={secondary}>{comment.length}/1000</Text>
        </View>
        <Text style={secondary}>Podés revisar el mensaje antes de enviarlo. No incluimos tus datos financieros de la app; revisá también tu comentario.</Text>
        <Pressable accessibilityRole="button" onPress={() => void send()} style={[styles.send, { backgroundColor: theme.primary }]}>
          <Text style={{ color: theme.textOnPrimary, fontWeight: "700" }}>Enviar mis respuestas</Text>
        </Pressable>
      </>)}
      {!!message && <Text accessibilityRole="alert" style={[styles.notice, secondary]}>{message}</Text>}
      {!ready && !message && <Text style={secondary}>Cargando respuestas...</Text>}
    </ScrollView>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  content: { width: "100%", maxWidth: 560, alignSelf: "center", padding: 20, paddingBottom: 48, gap: 12 },
  back: { minHeight: 44, justifyContent: "center", alignSelf: "flex-start", paddingRight: 20 },
  heading: { fontSize: 27, lineHeight: 34, fontWeight: "700" },
  lead: { fontSize: 16, lineHeight: 24 },
  card: { padding: 16, borderRadius: 16, borderWidth: 1, gap: 10 },
  question: { fontSize: 18, lineHeight: 25, fontWeight: "600" },
  option: { minHeight: 48, borderWidth: 1, borderRadius: 12, padding: 12, justifyContent: "center" },
  optionText: { fontSize: 16, lineHeight: 23 },
  input: { minHeight: 100, borderRadius: 12, borderWidth: 1, padding: 12, textAlignVertical: "top", fontSize: 16 },
  send: { minHeight: 48, borderRadius: 12, alignItems: "center", justifyContent: "center", padding: 12 },
  notice: { fontSize: 14, lineHeight: 20 },
});
