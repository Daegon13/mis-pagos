import { normalizeSpaceColor } from "./spaceCustomization";

export type Hsv = { hue: number; saturation: number; value: number };

export function hsvToHex({ hue, saturation, value }: Hsv): string {
  const h = ((hue % 360) + 360) % 360;
  const s = Math.max(0, Math.min(1, saturation));
  const v = Math.max(0, Math.min(1, value));
  const chroma = v * s;
  const x = chroma * (1 - Math.abs((h / 60) % 2 - 1));
  const m = v - chroma;
  const sectors = [[chroma, x, 0], [x, chroma, 0], [0, chroma, x],
    [0, x, chroma], [x, 0, chroma], [chroma, 0, x]];
  return `#${sectors[Math.floor(h / 60)].map(channel => Math.round((channel + m) * 255)
    .toString(16).padStart(2, "0")).join("").toUpperCase()}`;
}

export function hexToHsv(input: string): Hsv | null {
  const hex = normalizeSpaceColor(input);
  if (!hex) return null;
  const [r, g, b] = [1, 3, 5].map(index => parseInt(hex.slice(index, index + 2), 16) / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  let hue = 0;
  if (delta && max === r) hue = 60 * (((g - b) / delta) % 6);
  else if (delta && max === g) hue = 60 * ((b - r) / delta + 2);
  else if (delta) hue = 60 * ((r - g) / delta + 4);
  return { hue: (hue + 360) % 360, saturation: max ? delta / max : 0, value: max };
}
