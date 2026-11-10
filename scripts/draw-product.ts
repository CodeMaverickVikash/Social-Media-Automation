// Claude draws the product when the user has no photo (mood / campaign posts only).
//
//   node scripts/draw-product.ts --slug <slug> --product <catalogue-id>
//        [--occasion wedding|festive|everyday] [--garment "#hex"] [--accent "#hex"] [--stole "#hex"]
//        [--backdrop "#top,#bottom"] [--stage wide|tall] [--width 3240]
//
// Renders a vector fashion illustration (templates/illustration.ts) to a lossless PNG in
// assets/photos/<slug>/drawn-<product>-<n>.png with a .ai.json provenance sidecar, then prints
// the placement report. Vector source → rendered at full size, nothing is ever upscaled.
// No external service, no API key. Use it in the `arch` post template.
import { mkdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { ROOT, parseArgs } from './lib/brand.ts';
import { assertSlug, rel } from './lib/output.ts';
import { reportPlacements } from './lib/placements.ts';
import { writeAiSidecar } from './lib/ai-photo.ts';
import { PRESETS, illustrationSvg } from './templates/illustration.ts';
import type { Occasion } from './templates/illustration.ts';

const args = parseArgs(process.argv.slice(2));
const str = (k: string): string | undefined => (typeof args[k] === 'string' ? args[k] as string : undefined);
const slug = assertSlug(args.slug);
const productId = str('product') ?? '';
const preset = PRESETS[productId];
if (!preset) {
  console.error(`Usage: node scripts/draw-product.ts --slug <slug> --product <${Object.keys(PRESETS).join('|')}> [--occasion wedding|festive|everyday]`);
  console.error(productId ? `No illustration for "${productId}" yet — add a garment to scripts/templates/illustration.ts.` : '');
  process.exit(1);
}

const occasion = (str('occasion') ?? (productId === 'sherwani' ? 'wedding' : 'everyday')) as Occasion;
if (!['wedding', 'festive', 'everyday'].includes(occasion)) throw new Error('--occasion must be wedding, festive or everyday');
const hex = (v: string | undefined, name: string): string | undefined => {
  if (v !== undefined && !/^#[0-9a-fA-F]{6}$/.test(v)) throw new Error(`--${name} must be a #RRGGBB colour`);
  return v;
};
const backdrop = str('backdrop')?.split(',');
const palette = {
  ...preset.palette,
  ...(hex(str('garment'), 'garment') ? { garment: str('garment')! } : {}),
  ...(hex(str('accent'), 'accent') ? { accent: str('accent')! } : {}),
  ...(hex(str('stole'), 'stole') ? { stole: str('stole')! } : {}),
  ...(backdrop ? { backdrop: [hex(backdrop[0], 'backdrop')!, hex(backdrop[1], 'backdrop')!] as [string, string] } : {}),
};
const stage = (str('stage') ?? 'wide') as 'wide' | 'tall';
if (!['wide', 'tall'].includes(stage)) throw new Error('--stage must be wide or tall');
const width = Number(str('width') ?? (stage === 'wide' ? 3240 : 2160));
if (!(width >= 1080 && width <= 4800)) throw new Error('--width must be between 1080 and 4800');

const svg = illustrationSvg({ garment: preset.garment, occasion, palette, width, stage });

const dir = path.join(ROOT, 'assets', 'photos', slug);
mkdirSync(dir, { recursive: true });
let n = 1;
while (existsSync(path.join(dir, `drawn-${productId}-${n}.png`))) n++;
const dest = path.join(dir, `drawn-${productId}-${n}.png`);

await sharp(Buffer.from(svg)).withIccProfile('srgb').png({ compressionLevel: 9 }).toFile(dest);
writeAiSidecar(rel(dest), { generator: 'claude-illustration', prompt: JSON.stringify({ product: productId, occasion, stage, palette }) });

const meta = await sharp(dest).metadata();
reportPlacements(rel(dest), meta.width!, meta.height!, '  [Claude-drawn illustration: mood/campaign only]');
console.log('\nUse it with the `arch` template. Keep the copy collection-level: no specific piece, fabric, colour or price claims.');
