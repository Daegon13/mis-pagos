export type BetaPriority = "core" | "optional";
export type BetaQuestion = { id: string; section: string; priority: BetaPriority; label: string;
  question: string; options: readonly { id: string; label: string }[] };

export const BETA_SECTIONS = [
  { id: "money", title: "Tu dinero", description: "Lo que te ayudaría a decidir." },
  { id: "automation", title: "Automatización y comodidad", description: "Qué preferís hacer vos." },
  { id: "reminders", title: "Recordatorios", description: "Avisos a tu manera." },
  { id: "space", title: "Tu espacio", description: "Ideas para hacerlo más tuyo." },
  { id: "privacy", title: "Privacidad y dispositivos", description: "Elegí qué te daría tranquilidad." },
  { id: "future", title: "Futuro de Mis Pagos", description: "Qué vale más para vos." },
] as const;

const make = (id: string, section: string, priority: BetaPriority, label: string, question: string,
  options: readonly string[]): BetaQuestion => ({ id, section, priority, label, question,
    options: options.map((text, index) => ({ id: `o${index + 1}`, label: text })) });

export const BETA_QUESTIONS: readonly BetaQuestion[] = [
  make("recurring_payments", "money", "core", "Pagos recurrentes", "¿Te serviría repetir automáticamente alquiler, UTE, Netflix u otros pagos cada mes?", ["Sí, muchísimo", "A veces", "Prefiero cargarlos yo"]),
  make("month_forecast", "money", "core", "Pronóstico de fin de mes", "¿Querrías ver una estimación de cuánto podrías tener al terminar el mes?", ["Sí", "Solo como estimación", "No me interesa"]),
  make("multiple_goals", "money", "optional", "Metas separadas", "¿Usarías metas separadas además de tu reserva?", ["Sí", "Tal vez", "No"]),
  make("multi_currency", "money", "core", "Más de una moneda", "¿Te gustaría manejar más de una moneda?", ["Sí, lo necesito", "Me serviría", "No"]),
  make("bank_connection", "automation", "core", "Conexión bancaria", "Si Mis Pagos pudiera leer movimientos automáticamente, ¿conectarías tu banco?", ["Sí, solo lectura", "Depende de la privacidad", "No conectaría mi banco", "No estoy seguro/a"]),
  make("automation_preference", "automation", "core", "Preferencia de automatización", "¿Cómo preferís usar Mis Pagos?", ["Que sugiera más cosas automáticamente", "Un equilibrio", "Prefiero control manual"]),
  make("scan_bill", "automation", "optional", "Fotografiar factura", "¿Te serviría fotografiar una factura para crear un pago?", ["Sí", "A veces", "No"]),
  make("home_widget", "automation", "core", "Widget", "¿Usarías un widget con tu Disponible real en la pantalla del teléfono?", ["Sí, lo usaría", "Quizás", "No"]),
  make("notification_timing", "reminders", "core", "Momento del aviso", "¿Cuándo preferís que Mis Pagos te recuerde un pago?", ["3 días antes", "1 día antes", "El mismo día", "Quiero elegirlo yo"]),
  make("margin_notifications", "reminders", "optional", "Avisos del margen", "¿Querés avisos cuando tu margen libre cambie bastante?", ["Sí", "Solo cambios importantes", "No"]),
  make("notification_tone", "reminders", "core", "Tono de avisos", "¿Cómo preferís nuestros recordatorios?", ["Amigables y con emojis 💚", "Amigables pero más neutros", "Directos y sin emojis"]),
  make("notification_grouping", "reminders", "core", "Agrupar avisos", "¿Qué preferís cuando hay varias cosas para revisar?", ["Un resumen", "Avisos individuales", "Depende"]),
  make("space_priority", "space", "core", "Personalizar primero", "¿Qué te gustaría personalizar más?", ["Objetos", "Colores", "Paredes", "Iluminación"]),
  make("furniture_customization", "space", "optional", "Muebles", "¿Te gustaría cambiar también muebles y distribución?", ["Sí", "Solo algunos muebles", "No hace falta"]),
  make("style_presets", "space", "core", "Estilos completos", "¿Usarías estilos completos para cambiar Tu espacio de una vez?", ["Sí, me gustaría", "Solo como punto de partida", "Prefiero combinar todo yo"]),
  make("wall_patterns", "space", "optional", "Paredes decoradas", "¿Te gustaría decorar las paredes además de cambiarles el color?", ["Sí", "Solo detalles sutiles", "Prefiero solo colores"]),
  make("discoveries_motivation", "space", "core", "Descubrimientos", "¿Los Descubrimientos te dan ganas de seguir organizando Tu espacio?", ["Sí", "Un poco", "No"]),
  make("reward_visibility", "space", "core", "Próximos desbloqueos", "¿Cómo preferís los próximos desbloqueos?", ["Quiero ver qué voy a conseguir", "Prefiero que sea sorpresa", "Una mezcla de ambos"]),
  make("cloud_backup", "privacy", "core", "Copia en la nube", "¿Te gustaría tener una copia de seguridad de Mis Pagos en la nube?", ["Sí", "Solo si está protegida/cifrada", "Prefiero que todo quede en mi dispositivo", "No estoy seguro/a"]),
  make("multi_device", "privacy", "optional", "Varios dispositivos", "¿Te serviría usar Mis Pagos en más de un dispositivo?", ["Sí", "Tal vez", "No"]),
  make("shared_finances", "privacy", "core", "Planificación compartida", "¿Te gustaría compartir parte de la planificación con tu pareja o familia?", ["Sí", "Solo algunas cosas", "No"]),
  make("privacy_vs_automation", "privacy", "core", "Privacidad y automatización", "¿Qué preferís si tuvieras que elegir?", ["Más automatización", "Más privacidad", "Un equilibrio"]),
  make("monetization_preference", "future", "optional", "Modelo de extras", "Si Mis Pagos tuviera funciones opcionales extra, ¿qué modelo preferirías?", ["Compra única", "Suscripción económica", "Gratis con extras opcionales", "No pagaría por funciones extra"]),
  make("paid_value", "future", "optional", "Valor de extras", "¿Qué tipo de función tendría más valor para vos?", ["Automatización", "Más personalización", "Sincronización entre dispositivos", "Funciones financieras avanzadas", "Ninguna"]),
  make("core_value", "future", "core", "Lo más valioso", "Si mañana Mis Pagos desapareciera, ¿qué extrañarías más?", ["Disponible real", "Plan y reserva", "Recordatorios", "Tu espacio", "Descubrimientos"]),
];

// A short first pass. Every other core question remains available in its section.
export const FEATURED_QUESTION_IDS = ["recurring_payments", "month_forecast", "multi_currency",
  "bank_connection", "automation_preference", "home_widget", "notification_timing", "notification_tone",
  "space_priority", "discoveries_motivation", "cloud_backup", "core_value"] as const;

export type BetaAnswers = Record<string, string>;
export function betaProgress(answers: BetaAnswers, ids: readonly string[] = FEATURED_QUESTION_IDS) {
  return { answered: ids.filter(id => BETA_QUESTIONS.some(q => q.id === id && q.options.some(o => o.id === answers[id]))).length,
    total: ids.length };
}

export function betaEmailBody(answers: BetaAnswers, comment: string) {
  const lines = ["MIS PAGOS — BETA FEEDBACK"];
  for (const section of BETA_SECTIONS) {
    const entries = BETA_QUESTIONS.filter(q => q.section === section.id)
      .map(q => ({ q, option: q.options.find(o => o.id === answers[q.id]) }))
      .filter(({ option }) => !!option);
    if (!entries.length) continue;
    lines.push("", section.title.toUpperCase());
    for (const { q, option } of entries) lines.push(`${q.label}: ${option!.label}`);
  }
  if (comment.trim()) lines.push("", "COMENTARIO OPCIONAL", comment.trim().slice(0, 1000));
  return lines.join("\n");
}
