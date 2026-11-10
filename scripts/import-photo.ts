// Import a user-supplied product/model photo and report what it is good enough for.
//
//   node scripts/import-photo.ts <path-to-photo> [<more photos>...] --slug <slug>
//
// Copies each photo (auto-rotated, original pixels, no re-compression for JPEG/PNG) to
// assets/photos/<slug>/, then prints which placements it can fill without upscaling.
import { copyFileSync, mkdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { ROOT, parseArgs } from './lib/brand.ts';
import { assertSlug } from './lib/output.ts';
import { MAX_ZOOM } from './templates/reel.ts';

const args = parseArgs(process.argv.slice(2));
const slug = assertSlug(args.slug);
if (!args._.length) {
  console.error('Usage: node scripts/import-photo.ts <photo> [...] --slug <slug>');
  process.exit(1);
}

// Boxes each placement must fill (CSS px at 1x delivery). Arch window sizes match templates/post.ts.
const PLACEMENTS: { name: string; w: number; h: number }[] = [
  { name: 'overlay ig-feed (1080×1350)', w: 1080, h: 1350 },
  { name: 'overlay story (1080×1920)', w: 1080, h: 1920 },
  { name: 'overlay square (1080×1080)', w: 1080, h: 1080 },
  { name: 'arch ig-feed (680×~760)', w: 680, h: 760 },
  { name: 'arch story (820×~1150)', w: 820, h: 1150 },
  { name: 'split ig-feed (605×1350)', w: 605, h: 1350 },
  { name: `reel scene (1080×1920 @${MAX_ZOOM}× zoom)`, w: Math.ceil(1080 * MAX_ZOOM), h: Math.ceil(1920 * MAX_ZOOM) },
];

const dir = path.join(ROOT, 'assets', 'photos', slug);
mkdirSync(dir, { recursive: true });

const report: { file: string; width: number; height: number; fits: Record<string, string> }[] = [];
for (const src of args._) {
  if (!existsSync(src)) throw new Error(`Photo not found: ${src}`);
  const ext = path.extname(src).toLowerCase();
  if (!['.jpg', '.jpeg', '.png', '.webp', '.heic', '.tif', '.tiff'].includes(ext)) throw new Error(`Unsupported photo type ${ext}`);
  const base = path.basename(src, ext).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'photo';
  const meta = await sharp(src).metadata();
  const rotated = (meta.orientation ?? 1) >= 5;
  const w = rotated ? meta.height! : meta.width!, h = rotated ? meta.width! : meta.height!;

  // Keep original pixels: plain copy when no rotation is needed and the format is web-safe;
  // otherwise auto-orient into a lossless PNG (never a lossy re-encode).
  let dest: string;
  if (!rotated && ['.jpg', '.jpeg', '.png'].includes(ext)) {
    dest = path.join(dir, base + (ext === '.jpeg' ? '.jpg' : ext));
    copyFileSync(src, dest);
  } else {
    dest = path.join(dir, base + '.png');
    await sharp(src).autoOrient().png({ compressionLevel: 6 }).toFile(dest);
  }

  console.log(`\n${path.relative(ROOT, dest).split(path.sep).join('/')}  ${w}×${h}  (${(w * h / 1e6).toFixed(1)} MP)`);
  const fits: Record<string, string> = {};
  for (const p of PLACEMENTS) {
    const cover = Math.max(p.w / w, p.h / h);   // CSS px per source px
    const srcPerOut = 1 / cover;                 // source px per delivered px
    const verdict = srcPerOut >= 2 ? '✓ crisp (2×)' : srcPerOut >= 1 ? '✓ ok (1×–2×)' : `✗ too small (${srcPerOut.toFixed(2)}×)`;
    fits[p.name] = verdict;
    console.log(`  ${verdict.padEnd(20)} ${p.name}`);
  }
  report.push({ file: path.relative(ROOT, dest).split(path.sep).join('/'), width: w, height: h, fits });
}

const anyTooSmall = report.some(r => Object.values(r.fits).some(v => v.startsWith('✗')));
if (anyTooSmall) console.log('\nPlacements marked ✗ would pixelate — use another layout or ask for the original camera photo.');
