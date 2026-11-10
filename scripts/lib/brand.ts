// Shared brand helpers: tokens, inline logo lockups, line icons, themes, paths.
import { readFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

export interface FormatSpec {
  w: number;
  h: number;
  ratio: string;
  platforms: string[];
  use: string;
  safe?: { top: number; bottom: number; side: number };
}
export interface Format extends FormatSpec {
  key: string;
  safe: { top: number; bottom: number; side: number };
}

export interface Brand {
  name: string;
  tagline: string;
  contact: Record<string, string>;
  formats: Record<string, FormatSpec>;
  video: { w: number; h: number; fps: number; safe: { top: number; bottom: number; side: number } };
  [k: string]: unknown;
}

export const BRAND: Brand = JSON.parse(readFileSync(path.join(ROOT, 'brand', 'brand.json'), 'utf8'));

export function formatKeys(): string[] {
  return Object.keys(BRAND.formats).filter(k => !k.startsWith('$'));
}

export function resolveFormat(key: string): Format {
  const f = BRAND.formats[key];
  if (!f || key.startsWith('$')) throw new Error(`Unknown format "${key}". Use one of: ${formatKeys().join(', ')}`);
  return { key, ...f, safe: f.safe ?? { top: 72, bottom: 72, side: 72 } };
}

export function resolvePath(p: string, baseDir: string = ROOT): string {
  if (/^https?:\/\//.test(p)) {
    throw new Error(`Remote images are not allowed in renders ("${p}"). Download to assets/ first so the quality check can inspect it.`);
  }
  return path.isAbsolute(p) ? p : path.resolve(baseDir, p);
}

export const fileUrl = (p: string): string => pathToFileURL(p).href;

export const esc = (s: unknown): string =>
  String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Newlines in briefs become line breaks; everything else is escaped. */
export const lines = (s: unknown): string => esc(s).replace(/\n/g, '<br>');

// ---------- Logo (vector, transparent, same geometry as brand/logo/svg) ----------
const MARK = `
  <path d="M0 -135 C4 -115 10 -109 30 -105 C10 -101 4 -95 0 -75 C-4 -95 -10 -101 -30 -105 C-10 -109 -4 -115 0 -135 Z"/>
  <text x="0" y="95" text-anchor="middle" font-family="'Playfair Display', Georgia, serif" font-size="250" font-weight="700">M</text>
  <path d="M -12 98 Q 45 -30 125 -80 Q 55 5 18 98 Z"/>`;

const WORDS = (c: string) => `
  <text x="6" y="235" text-anchor="middle" fill="${c}" font-family="'Playfair Display', Georgia, serif" font-size="96" font-weight="500" letter-spacing="8">MONAVI</text>
  <text x="8" y="295" text-anchor="middle" fill="${c}" font-family="'Montserrat', sans-serif" font-size="28" font-weight="500" letter-spacing="13">COLLECTION</text>`;

const TAG = (c: string) => `
  <line x1="-220" y1="335" x2="220" y2="335" stroke="${c}" stroke-width="2" opacity="0.45"/>
  <text x="6" y="380" text-anchor="middle" fill="${c}" font-family="'Montserrat', sans-serif" font-size="20" font-weight="500" letter-spacing="9">WEAR YOUR STORY</text>`;

export type LogoVariant = 'stacked' | 'compact' | 'monogram';

const VIEWBOX: Record<LogoVariant, [number, number, number, number]> = {
  stacked: [-260, -150, 520, 550],
  compact: [-260, -150, 520, 460],
  monogram: [-135, -150, 270, 255],
};

/** Transparent inline SVG lockup. `width` is the rendered width in CSS px. */
export function logoSvg(variant: LogoVariant = 'stacked', color = '#1F1F1F', width = 300): string {
  const vb = VIEWBOX[variant];
  if (!vb) throw new Error(`Unknown logo variant ${variant}`);
  const h = Math.round((width * vb[3]) / vb[2]);
  const body = variant === 'monogram' ? '' : WORDS(color) + (variant === 'stacked' ? TAG(color) : '');
  return `<svg class="logo" xmlns="http://www.w3.org/2000/svg" viewBox="${vb.join(' ')}" width="${width}" height="${h}" role="img" aria-label="Monavi Collection">
  <g fill="${color}">${MARK}</g>${body}</svg>`;
}

// ---------- Category line icons (48x48 grid, stroke only, matches the brand icon board) ----------
const ICONS = {
  dress: '<path d="M18 6h12M19 6l-2 9 4 3-9 24h24l-9-24 4-3-2-9"/>',
  shirt: '<path d="M17 7l-9 5 3 8 5-2v22h16V18l5 2 3-8-9-5c-1 3-4 5-7 5s-6-2-7-5z"/>',
  kids: '<path d="M18 8l-8 5 3 6 4-2v9l-3 14h8l2-9 2 9h8l-3-14v-9l4 2 3-6-8-5c-1 2-3 4-6 4s-5-2-6-4z"/>',
  lotus: '<path d="M24 38c-6-4-8-11-8-17 3 2 6 6 8 10 2-4 5-8 8-10 0 6-2 13-8 17zM24 38c-9 0-16-4-19-11 5 0 10 2 14 6M24 38c9 0 16-4 19-11-5 0-10 2-14 6M24 31c-2-6-2-13 0-21 2 8 2 15 0 21z"/>',
  bag: '<path d="M10 16h28l-2 26H12zM18 16v-4a6 6 0 0 1 12 0v4"/>',
  sparkle: '<path d="M24 6c1 10 4 14 14 18-10 4-13 8-14 18-1-10-4-14-14-18 10-4 13-8 14-18z"/>',
  store: '<path d="M8 20h32M10 20l3-10h22l3 10M12 20v20h24V20M20 40V30h8v10"/>',
} as const;
export type IconName = keyof typeof ICONS;

export function iconSvg(name: string, color = 'currentColor', size = 56): string {
  const p = (ICONS as Record<string, string>)[name];
  if (!p) throw new Error(`Unknown icon "${name}". Available: ${Object.keys(ICONS).join(', ')}`);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="${size}" height="${size}" fill="none" stroke="${color}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
}

/** Vector botanical sprig (stays crisp at any size, unlike the 748px pattern PNGs). */
export function sprigSvg(color: string, width = 420, opacity = 0.5): string {
  const leaf = (x: number, y: number, r: number, s = 1) =>
    `<path transform="translate(${x} ${y}) rotate(${r}) scale(${s})" d="M0 0 C 18 -22 52 -26 78 -10 C 52 6 20 8 0 0 Z M0 0 L 66 -11"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 420" width="${width}" height="${Math.round(width * 1.4)}" fill="none" stroke="${color}" stroke-width="1.4" stroke-linecap="round" opacity="${opacity}">
    <path d="M150 410 C 140 320 150 220 175 120 C 185 80 200 45 220 15"/>
    ${leaf(146, 360, -150, 1.1)}${leaf(150, 330, -30, 1.05)}${leaf(150, 280, -155, 1)}${leaf(156, 250, -25, 1)}
    ${leaf(162, 205, -160, 0.95)}${leaf(170, 175, -20, 0.9)}${leaf(178, 130, -165, 0.85)}${leaf(188, 100, -18, 0.8)}
    ${leaf(200, 62, -170, 0.7)}${leaf(208, 45, -15, 0.65)}
  </svg>`;
}

// ---------- Themes: colour roles per creative mood ----------
export interface Theme {
  text: string;
  logo: string;
  /** "r,g,b" used in gradient scrims */
  scrim: string;
  ctaBg: string;
  ctaFg: string;
  ctaBorder?: string;
  panel: string;
  accent: string;
}

export const THEMES: Record<string, Theme> = {
  light:   { text: '#1F1F1F', logo: '#1F1F1F', scrim: '250,249,246', ctaBg: '#1F1F1F', ctaFg: '#FAF9F6', panel: '#FAF9F6', accent: '#D9A5A8' },
  ladies:  { text: '#1F1F1F', logo: '#1F1F1F', scrim: '250,240,232', ctaBg: '#560E24', ctaFg: '#FAF9F6', panel: '#FAF9F6', accent: '#D9A5A8' },
  dark:    { text: '#FAF9F6', logo: '#FAF9F6', scrim: '31,31,31',    ctaBg: '#FAF9F6', ctaFg: '#1F1F1F', panel: '#1F1F1F', accent: '#DCC8B1' },
  festive: { text: '#FBEBDD', logo: '#F5CDB4', scrim: '51,12,13',    ctaBg: '#FAF9F6', ctaFg: '#1F1F1F', panel: '#330C0D', accent: '#F5CDB4' },
  mens:    { text: '#FAF9F6', logo: '#FAF9F6', scrim: '6,17,26',     ctaBg: 'transparent', ctaFg: '#FAF9F6', ctaBorder: '#DCC8B1', panel: '#06111A', accent: '#DCC8B1' },
  kids:    { text: '#1F1F1F', logo: '#1F1F1F', scrim: '250,249,246', ctaBg: '#1F1F1F', ctaFg: '#F5CDB4', panel: '#FAF9F6', accent: '#8A987A' },
  sage:    { text: '#1F1F1F', logo: '#1F1F1F', scrim: '250,249,246', ctaBg: '#8A987A', ctaFg: '#FAF9F6', panel: '#FAF9F6', accent: '#8A987A' },
};

export function theme(name = 'light'): Theme {
  const t = THEMES[name];
  if (!t) throw new Error(`Unknown theme "${name}". Available: ${Object.keys(THEMES).join(', ')}`);
  return t;
}

/** Minimal `--flag value` / `--bool` parser. Repeated flags become arrays. */
export function parseArgs(argv: string[]): { _: string[]; [k: string]: string | boolean | string[] } {
  const out: { _: string[]; [k: string]: string | boolean | string[] } = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]!;
    if (!a.startsWith('--')) { out._.push(a); continue; }
    const key = a.slice(2);
    const next = argv[i + 1];
    const val: string | boolean = next !== undefined && !next.startsWith('--') ? (i++, next) : true;
    const prev = out[key];
    if (prev === undefined) out[key] = val;
    else out[key] = ([] as string[]).concat(prev as string | string[], String(val));
  }
  return out;
}
