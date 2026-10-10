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
  spaceWall: string;
  spaceFloorTint: string;
  spaceWindowTint: string;
  spaceAmbientTint: string;
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
    spaceWall: "#D9E5D7", spaceFloorTint: "#BEA987", spaceWindowTint: "#B4D8CE", spaceAmbientTint: "#F5DDBA",
  },
  oceano: {
    ...shared, primary: "#153E57", primarySurface: "#E3EFF3", accent: "#32728D",
    background: "#F4F8FA", secondarySurface: "#E9F1F3", textPrimary: "#19374B",
    textSecondary: "#506575", heroMuted: "#D8E9EF", muted: "#506575",
    border: "#A9BDC7", sceneWall: "#D9EAF0", sceneFloor: "#B9D3DB",
    sceneWindow: "#A4CEE0", sceneFurniture: "#517589", sceneLeaf: "#477C72",
    spaceWall: "#D7EAF1", spaceFloorTint: "#A8C4CE", spaceWindowTint: "#9FCDE0", spaceAmbientTint: "#D3EBF4",
  },
  lavanda: {
    ...shared, primary: "#48345E", primarySurface: "#EEE8F4", accent: "#756091",
    background: "#FAF8FC", secondarySurface: "#F0EBF3", textPrimary: "#382B47",
    textSecondary: "#665D72", heroMuted: "#E5DBEB", muted: "#665D72",
    border: "#BDB1C8", sceneWall: "#EAE0EC", sceneFloor: "#D6C3DB",
    sceneWindow: "#C7C3E1", sceneFurniture: "#81677E", sceneLeaf: "#6B8068",
    spaceWall: "#E7D9EE", spaceFloorTint: "#CAB6D2", spaceWindowTint: "#C4C3E4", spaceAmbientTint: "#EADCF1",
  },
  terracota: {
    ...shared, primary: "#6A3D2F", primarySurface: "#F3E7DF", accent: "#9A5944",
    background: "#FCF8F5", secondarySurface: "#F5ECE4", textPrimary: "#493228",
    textSecondary: "#6B5B53", heroMuted: "#F1DCD0", muted: "#6B5B53",
    border: "#C5B2A7", sceneWall: "#F1DDCB", sceneFloor: "#D7B393",
    sceneWindow: "#D5C6AF", sceneFurniture: "#9B644F", sceneLeaf: "#66784B",
    spaceWall: "#F0D4C2", spaceFloorTint: "#D29F79", spaceWindowTint: "#F1CDAE", spaceAmbientTint: "#F6D2AD",
  },
  noche: {
    ...shared, primary: "#203454", primarySurface: "#E5EAF3", accent: "#526995",
    background: "#F5F7FB", secondarySurface: "#E9EDF5", textPrimary: "#1E2B42",
    textSecondary: "#566276", heroMuted: "#DCE4F1", muted: "#566276",
    border: "#ADB8CC", sceneWall: "#233752", sceneFloor: "#304563",
    sceneWindow: "#7290BA", sceneFurniture: "#8290AD", sceneLeaf: "#83A58B",
    spaceWall: "#53607A", spaceFloorTint: "#4D5777", spaceWindowTint: "#6986B6", spaceAmbientTint: "#4B618B",
  },
  arena: {
    ...shared, primary: "#5D4935", primarySurface: "#F1EDE4", accent: "#8B6C49",
    background: "#FBF9F4", secondarySurface: "#F0EBE1", textPrimary: "#3C3529",
    textSecondary: "#665E50", heroMuted: "#E9DFC9", muted: "#665E50",
    border: "#C2B9A9", sceneWall: "#EDE4D0", sceneFloor: "#D5C3A2",
    sceneWindow: "#C9D8D5", sceneFurniture: "#8C7556", sceneLeaf: "#637B5B",
    spaceWall: "#E8DCC9", spaceFloorTint: "#C9B18E", spaceWindowTint: "#C4D8D3", spaceAmbientTint: "#F3E0C4",
  },
  peonia: {
    ...shared, primary: "#674352", primarySurface: "#F4E8EC", accent: "#9B697A",
    background: "#FCF8F9", secondarySurface: "#F4EBEB", textPrimary: "#49353E",
    textSecondary: "#705D65", heroMuted: "#F1DDE4", muted: "#705D65",
    border: "#CDB8BF", sceneWall: "#F0DFDA", sceneFloor: "#D8BEB2",
    sceneWindow: "#D8D3D9", sceneFurniture: "#9A786E", sceneLeaf: "#6D8066",
    spaceWall: "#EDDBDF", spaceFloorTint: "#D0B4A9", spaceWindowTint: "#E3D7DB", spaceAmbientTint: "#F7E1D6",
  },
  ciruela: {
    ...shared, primary: "#503651", primarySurface: "#EEE5EF", accent: "#805A7B",
    background: "#FAF7FA", secondarySurface: "#F1EAF0", textPrimary: "#392C3B",
    textSecondary: "#675969", heroMuted: "#E9DCE9", muted: "#675969",
    border: "#C2B2C3", sceneWall: "#E6D9E2", sceneFloor: "#C5AFBF",
    sceneWindow: "#C6C4D8", sceneFurniture: "#826A79", sceneLeaf: "#6E806B",
    spaceWall: "#DCCBD9", spaceFloorTint: "#BCA2B3", spaceWindowTint: "#C6C0D7", spaceAmbientTint: "#E9D6E6",
  },
};

export function themeFor(id: ThemeId): ThemeTokens { return THEMES_BY_ID[id]; }
