import type { ThemeId } from "@/domain/personalization";

export interface ThemeTokens {
  primary: string;
  primarySurface: string;
  accent: string;
  background: string;
  surface: string;
  secondarySurface: string;
  textPrimary: string;
  textSecondary: string;
  textOnPrimary: string;
  heroMuted: string;
  positive: string;
  negative: string;
  negativeOnPrimary: string;
  muted: string;
  border: string;
  sceneWall: string;
  sceneFloor: string;
  sceneWindow: string;
  sceneFurniture: string;
  sceneLeaf: string;
}

const shared = {
  surface: "#FFFFFF", textOnPrimary: "#FFFFFF", positive: "#276644",
  negative: "#9B352A", negativeOnPrimary: "#FFD8C6",
} as const;

export const THEMES_BY_ID: Record<ThemeId, ThemeTokens> = {
  bosque: {
    ...shared, primary: "#163B30", primarySurface: "#E8F0E7", accent: "#316E49",
    background: "#F7F9F5", secondarySurface: "#EFECE3", textPrimary: "#203D32",
    textSecondary: "#52645C", heroMuted: "#D2E0D4", muted: "#52645C",
    border: "#ABBAB1", sceneWall: "#E6DDCB", sceneFloor: "#D3C2A9",
    sceneWindow: "#B8D3CF", sceneFurniture: "#8D7158", sceneLeaf: "#436B4F",
  },
  oceano: {
    ...shared, primary: "#153E57", primarySurface: "#E3EFF3", accent: "#32728D",
    background: "#F4F8FA", secondarySurface: "#E9F1F3", textPrimary: "#19374B",
    textSecondary: "#506575", heroMuted: "#D8E9EF", muted: "#506575",
    border: "#A9BDC7", sceneWall: "#D9EAF0", sceneFloor: "#B9D3DB",
    sceneWindow: "#A4CEE0", sceneFurniture: "#517589", sceneLeaf: "#477C72",
  },
  lavanda: {
    ...shared, primary: "#48345E", primarySurface: "#EEE8F4", accent: "#756091",
    background: "#FAF8FC", secondarySurface: "#F0EBF3", textPrimary: "#382B47",
    textSecondary: "#665D72", heroMuted: "#E5DBEB", muted: "#665D72",
    border: "#BDB1C8", sceneWall: "#EAE0EC", sceneFloor: "#D6C3DB",
    sceneWindow: "#C7C3E1", sceneFurniture: "#81677E", sceneLeaf: "#6B8068",
  },
  terracota: {
    ...shared, primary: "#6A3D2F", primarySurface: "#F3E7DF", accent: "#9A5944",
    background: "#FCF8F5", secondarySurface: "#F5ECE4", textPrimary: "#493228",
    textSecondary: "#6B5B53", heroMuted: "#F1DCD0", muted: "#6B5B53",
    border: "#C5B2A7", sceneWall: "#F1DDCB", sceneFloor: "#D7B393",
    sceneWindow: "#D5C6AF", sceneFurniture: "#9B644F", sceneLeaf: "#66784B",
  },
  noche: {
    ...shared, primary: "#203454", primarySurface: "#E5EAF3", accent: "#526995",
    background: "#F5F7FB", secondarySurface: "#E9EDF5", textPrimary: "#1E2B42",
    textSecondary: "#566276", heroMuted: "#DCE4F1", muted: "#566276",
    border: "#ADB8CC", sceneWall: "#233752", sceneFloor: "#304563",
    sceneWindow: "#7290BA", sceneFurniture: "#8290AD", sceneLeaf: "#83A58B",
  },
  arena: {
    ...shared, primary: "#5D4935", primarySurface: "#F1EDE4", accent: "#8B6C49",
    background: "#FBF9F4", secondarySurface: "#F0EBE1", textPrimary: "#3C3529",
    textSecondary: "#665E50", heroMuted: "#E9DFC9", muted: "#665E50",
    border: "#C2B9A9", sceneWall: "#EDE4D0", sceneFloor: "#D5C3A2",
    sceneWindow: "#C9D8D5", sceneFurniture: "#8C7556", sceneLeaf: "#637B5B",
  },
};

export function themeFor(id: ThemeId): ThemeTokens { return THEMES_BY_ID[id]; }
