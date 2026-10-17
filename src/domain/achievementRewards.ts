import type { AchievementId } from "./achievements";

export type SpaceCapabilityId = "editCoreDecor" | "editDeskLeft" | "editFloorRight" |
  "editDetailCenter" | "editDetailRight" | "roomPaletteOverride" | "windowMoodOverride";

export type EditableSlotId = "deskCenter" | "deskRight" | "detailLeft" | "deskLeft" |
  "floorRight" | "detailCenter" | "detailRight";

export interface AchievementRewardDefinition {
  achievementId: AchievementId;
  title: string;
  shortDescription: string;
  howToUnlock: string;
  capabilityIds: readonly SpaceCapabilityId[];
  ctaLabel: string;
}

export const ACHIEVEMENT_REWARDS: readonly AchievementRewardDefinition[] = [
  { achievementId: "FIRST_PERSONALIZED_SPACE", title: "Personalización del escritorio",
    shortDescription: "Elegí objetos para el centro y la derecha del escritorio, y el detalle izquierdo.",
    howToUnlock: "Personalizá Tu espacio con un tema, interés, ambiente o nombre.",
    capabilityIds: ["editCoreDecor"], ctaLabel: "Usar en Tu espacio" },
  { achievementId: "FIRST_COMMITMENT", title: "Decoración izquierda del escritorio",
    shortDescription: "Elegí cómo decorar el lado izquierdo del escritorio.",
    howToUnlock: "Registrá tu primer gasto pendiente o completado.",
    capabilityIds: ["editDeskLeft"], ctaLabel: "Usar en Tu espacio" },
  { achievementId: "FIRST_EXPECTED_INCOME", title: "Decoración del rincón derecho",
    shortDescription: "Elegí un detalle para la zona derecha del piso.",
    howToUnlock: "Registrá tu primer ingreso pendiente o completado.",
    capabilityIds: ["editFloorRight"], ctaLabel: "Usar en Tu espacio" },
  { achievementId: "FIRST_RESOLVED_MOVEMENT", title: "Detalle central",
    shortDescription: "Elegí un objeto para el detalle central.",
    howToUnlock: "Completá tu primer movimiento.",
    capabilityIds: ["editDetailCenter"], ctaLabel: "Usar en Tu espacio" },
  { achievementId: "FIRST_OVERDUE_RESOLVED", title: "Detalle derecho",
    shortDescription: "Elegí un objeto para el detalle derecho.",
    howToUnlock: "Completá o cancelá un movimiento que ya estaba vencido.",
    capabilityIds: ["editDetailRight"], ctaLabel: "Usar en Tu espacio" },
  { achievementId: "FIRST_RESERVE", title: "Paleta propia para Tu espacio",
    shortDescription: "Elegí un preset o color personalizado para la pared sin cambiar el tema de la app.",
    howToUnlock: "Creá una reserva objetivo positiva en el plan del mes.",
    capabilityIds: ["roomPaletteOverride"], ctaLabel: "Usar en Tu espacio" },
  { achievementId: "FIRST_SPENDING_SIMULATION", title: "Ambiente de ventana",
    shortDescription: "Elegí el ambiente o un color personalizado para la luz y la ventana.",
    howToUnlock: "Hacé tu primera simulación válida en ¿Puedo gastar esto?",
    capabilityIds: ["windowMoodOverride"], ctaLabel: "Usar en Tu espacio" },
];

export const EDITABLE_SPACE_SLOTS: readonly { id: EditableSlotId; title: string; capabilityId: SpaceCapabilityId }[] = [
  { id: "deskCenter", title: "Centro del escritorio", capabilityId: "editCoreDecor" },
  { id: "deskRight", title: "Derecha del escritorio", capabilityId: "editCoreDecor" },
  { id: "detailLeft", title: "Detalle izquierdo", capabilityId: "editCoreDecor" },
  { id: "deskLeft", title: "Izquierda del escritorio", capabilityId: "editDeskLeft" },
  { id: "floorRight", title: "Derecha del espacio", capabilityId: "editFloorRight" },
  { id: "detailCenter", title: "Detalle central", capabilityId: "editDetailCenter" },
  { id: "detailRight", title: "Detalle derecho", capabilityId: "editDetailRight" },
];

export function rewardForCapability(id: SpaceCapabilityId): AchievementRewardDefinition {
  const reward = ACHIEVEMENT_REWARDS.find(item => item.capabilityIds.includes(id));
  if (!reward) throw new Error(`Missing reward for ${id}`);
  return reward;
}

export function capabilitiesFromUnlocks(unlocks: readonly AchievementId[]): ReadonlySet<SpaceCapabilityId> {
  const unlocked = new Set(unlocks);
  return new Set(ACHIEVEMENT_REWARDS.filter(item => unlocked.has(item.achievementId))
    .flatMap(item => item.capabilityIds));
}
