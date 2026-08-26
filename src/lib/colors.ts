function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
    }
    h /= 6;
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

function hslToRgb(h: number, s: number, l: number): string {
  const sNorm = s / 100;
  const lNorm = l / 100;
  const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm;
  const hPrime = h / 60;
  const x = c * (1 - Math.abs((hPrime % 2) - 1));
  let [r, g, b] = [0, 0, 0];

  if (hPrime >= 0 && hPrime < 1) [r, g, b] = [c, x, 0];
  else if (hPrime < 2) [r, g, b] = [x, c, 0];
  else if (hPrime < 3) [r, g, b] = [0, c, x];
  else if (hPrime < 4) [r, g, b] = [0, x, c];
  else if (hPrime < 5) [r, g, b] = [x, 0, c];
  else if (hPrime <= 6) [r, g, b] = [c, 0, x];

  const m = lNorm - c / 2;
  const toByte = (v: number) => Math.round((v + m) * 255);

  return `${toByte(r)} ${toByte(g)} ${toByte(b)}`;
}

const SHADE_LIGHTNESS_OFFSETS: Record<string, number> = {
  "50": 40,
  "100": 34,
  "400": 10,
  "500": 4,
  "600": 0,
  "700": -8,
  "900": -25,
};

export const BRAND_SHADE_KEYS = ["50", "100", "400", "500", "600", "700", "900"] as const;

export function isValidHexColor(value: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(value);
}

export function generateBrandShades(hex: string): Record<string, string> {
  const { h, s, l } = hexToHsl(hex);
  const shades: Record<string, string> = {};

  for (const key of BRAND_SHADE_KEYS) {
    const offset = SHADE_LIGHTNESS_OFFSETS[key];
    const targetL = Math.min(97, Math.max(3, l + offset));
    // Los tintes muy claros quedan mejor con un poco menos de saturación.
    const targetS = offset > 20 ? s * 0.7 : s;
    shades[key] = hslToRgb(h, targetS, targetL);
  }

  return shades;
}
