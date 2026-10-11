import { DEFAULT_SELECTION, type PersonalizationSelection } from "./personalization";
import type { Payment } from "./payment";

export const ACHIEVEMENTS = [
  { id: "FIRST_COMMITMENT", title: "Primer compromiso organizado", description: "Ya empezaste a ponerle forma a lo que viene.", visibility: "visible" },
  { id: "FIRST_EXPECTED_INCOME", title: "Primer ingreso previsto", description: "También sabés qué dinero está por llegar.", visibility: "visible" },
  { id: "FIRST_RESOLVED_MOVEMENT", title: "Primer movimiento resuelto", description: "Una parte de tu historia ya encontró su lugar.", visibility: "visible" },
  { id: "FIRST_OVERDUE_RESOLVED", title: "Un pendiente resuelto", description: "Atendiste algo que había quedado atrás.", visibility: "visible" },
  { id: "FIRST_RESERVE", title: "Primera reserva", description: "Elegiste cuánto querés conservar para vos.", visibility: "visible" },
  { id: "FIRST_SPENDING_SIMULATION", title: "Primera simulación", description: "Miraste la consecuencia antes de decidir.", visibility: "visible" },
  { id: "FIRST_PERSONALIZED_SPACE", title: "Un espacio más tuyo", description: "Elegiste un detalle que te representa.", visibility: "visible" },
] as const;

export type AchievementId = (typeof ACHIEVEMENTS)[number]["id"];

export function isPersonalized(selection: PersonalizationSelection): boolean {
  return selection.themeId !== DEFAULT_SELECTION.themeId ||
    selection.atmosphereId !== DEFAULT_SELECTION.atmosphereId ||
    selection.interestIds.length > 0 || selection.spaceName.trim().length > 0;
}

export function derivableAchievements(payments: Payment[], hasCurrentPlan: boolean,
  selection: PersonalizationSelection): AchievementId[] {
  const ids: AchievementId[] = [];
  if (payments.some(p => p.type === "expense" && (p.status === "pending" || p.status === "completed"))) ids.push("FIRST_COMMITMENT");
  if (payments.some(p => p.type === "income" && (p.status === "pending" || p.status === "completed"))) ids.push("FIRST_EXPECTED_INCOME");
  if (payments.some(p => p.status === "completed")) ids.push("FIRST_RESOLVED_MOVEMENT");
  if (hasCurrentPlan) ids.push("FIRST_RESERVE");
  if (isPersonalized(selection)) ids.push("FIRST_PERSONALIZED_SPACE");
  return ids;
}
