// Import a user-supplied product/model photo and report what it is good enough for.
//
//   node scripts/import-photo.ts <path-to-photo> [<more photos>...] --slug <slug> [--ai-generated]
//
// Copies each photo (auto-rotated, original pixels, no re-compression for JPEG/PNG) to
// assets/photos/<slug>/, then prints which placements it can fill without upscaling.
// --ai-generated: the image was made with an AI tool elsewhere. Writes a <photo>.ai.json
// provenance sidecar (mood/campaign use only), same as draw-product.ts.
import { copyFileSync, mkdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { ROOT, parseArgs } from './lib/brand.ts';
import { assertSlug, rel } from './lib/output.ts';
import { anyTooSmall, reportPlacements } from './lib/placements.ts';
import { writeAiSidecar } from './lib/ai-photo.ts';

const args = parseArgs(process.argv.slice(2));
const slug = assertSlug(args.slug);
if (!args._.length) {
  console.error('Usage: node scripts/import-photo.ts <photo> [...] --slug <slug> [--ai-generated]');
  process.exit(1);
}

const dir = path.join(ROOT, 'assets', 'photos', slug);
mkdirSync(dir, { recursive: true });

const reports: Record<string, string>[] = [];
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

  if (args['ai-generated']) writeAiSidecar(rel(dest), { generator: 'external' });
  reports.push(reportPlacements(rel(dest), w, h, args['ai-generated'] ? '  [AI-generated: mood/campaign only]' : ''));
}

if (anyTooSmall(reports)) console.log('\nPlacements marked ✗ would pixelate — use another layout or ask for the original camera photo.');
