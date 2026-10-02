import type { SpaceStage } from "./engagement";

export const THEMES = [
  { id: "bosque", label: "Bosque" }, { id: "oceano", label: "Océano" },
  { id: "lavanda", label: "Lavanda" }, { id: "terracota", label: "Terracota" },
  { id: "noche", label: "Noche" }, { id: "arena", label: "Arena" },
] as const;
export type ThemeId = (typeof THEMES)[number]["id"];

export const INTERESTS = [
  { id: "naturaleza", label: "Naturaleza" }, { id: "libros", label: "Libros" },
  { id: "gaming", label: "Gaming" }, { id: "musica", label: "Música" },
  { id: "animales", label: "Animales" }, { id: "cafe", label: "Café" },
  { id: "viajes", label: "Viajes" }, { id: "arte", label: "Arte" },
  { id: "noche", label: "Noche" }, { id: "tecnologia", label: "Tecnología" },
  { id: "hogar", label: "Hogar" }, { id: "minimalismo", label: "Minimalismo" },
] as const;
export type InterestId = (typeof INTERESTS)[number]["id"];

export const ATMOSPHERES = [
  { id: "calido", label: "Cálido" }, { id: "natural", label: "Natural" },
  { id: "minimalista", label: "Minimalista" }, { id: "nocturno", label: "Nocturno" },
  { id: "colorido", label: "Colorido" },
] as const;
export type AtmosphereId = (typeof ATMOSPHERES)[number]["id"];

export interface PersonalizationSelection {
  themeId: ThemeId;
  interestIds: InterestId[];
  atmosphereId: AtmosphereId;
  spaceName: string;
}

export interface PersonalizationPreferences extends PersonalizationSelection {
  createdAt: string;
  updatedAt: string;
}

export const DEFAULT_SELECTION: PersonalizationSelection = {
  themeId: "bosque", interestIds: [], atmosphereId: "natural", spaceName: "",
};
export const MAX_INTERESTS = 3;
export const MAX_SPACE_NAME_LENGTH = 24;

export function isThemeId(value: unknown): value is ThemeId {
  return THEMES.some((theme) => theme.id === value);
}
export function isAtmosphereId(value: unknown): value is AtmosphereId {
  return ATMOSPHERES.some((atmosphere) => atmosphere.id === value);
}
export function isInterestId(value: unknown): value is InterestId {
  return INTERESTS.some((interest) => interest.id === value);
}

export function normalizeStoredSelection(value: {
  themeId: unknown; interestIds: unknown; atmosphereId: unknown; spaceName: unknown;
}): PersonalizationSelection {
  const interests = Array.isArray(value.interestIds) ? value.interestIds : [];
  return {
    themeId: isThemeId(value.themeId) ? value.themeId : DEFAULT_SELECTION.themeId,
    interestIds: [...new Set(interests.filter(isInterestId))].slice(0, MAX_INTERESTS),
    atmosphereId: isAtmosphereId(value.atmosphereId) ? value.atmosphereId : DEFAULT_SELECTION.atmosphereId,
    spaceName: typeof value.spaceName === "string"
      ? value.spaceName.trim().slice(0, MAX_SPACE_NAME_LENGTH) : "",
  };
}

export function validateSelection(value: PersonalizationSelection): PersonalizationSelection {
  if (!isThemeId(value.themeId) || !isAtmosphereId(value.atmosphereId)) {
    throw new Error("Elegí una apariencia y un ambiente válidos.");
  }
  if (!Array.isArray(value.interestIds) || value.interestIds.length > MAX_INTERESTS ||
    new Set(value.interestIds).size !== value.interestIds.length ||
    !value.interestIds.every(isInterestId)) {
    throw new Error("Elegí hasta tres intereses distintos.");
  }
  return { ...value, interestIds: [...value.interestIds],
    spaceName: value.spaceName.trim().slice(0, MAX_SPACE_NAME_LENGTH) };
}

export type SceneDetail = "foliage" | "books" | "monitor" | "record" | "animal" |
  "mug" | "map" | "frame" | "moon" | "device" | "lamp";

const detailByInterest: Partial<Record<InterestId, SceneDetail>> = {
  naturaleza: "foliage", libros: "books", gaming: "monitor", musica: "record",
  animales: "animal", cafe: "mug", viajes: "map", arte: "frame",
  noche: "moon", tecnologia: "device", hogar: "lamp",
};

// Pure composition: preferences choose decoration; stage keeps its existing milestones.
export function composeSpace(selection: PersonalizationSelection, stage: SpaceStage) {
  const minimal = selection.interestIds.includes("minimalismo") || selection.atmosphereId === "minimalista";
  const details = selection.interestIds.flatMap((id) => {
    const detail = detailByInterest[id];
    return detail ? [detail] : [];
  });
  return {
    stage,
    atmosphereId: selection.atmosphereId,
    minimal,
    primaryDetail: details[0] ?? null,
    secondaryDetail: minimal ? null : details[1] ?? null,
    ambientDetail: minimal ? null : details[2] ?? null,
  };
}
