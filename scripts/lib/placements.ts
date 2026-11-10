// Which layouts a photo of a given size can fill without upscaling (shared by import-photo
// and draw-product). Arch window sizes match templates/post.ts.
import { MAX_ZOOM } from '../templates/reel.ts';

export const PLACEMENTS: { name: string; w: number; h: number }[] = [
  { name: 'overlay ig-feed (1080×1350)', w: 1080, h: 1350 },
  { name: 'overlay story (1080×1920)', w: 1080, h: 1920 },
  { name: 'overlay square (1080×1080)', w: 1080, h: 1080 },
  { name: 'arch ig-feed (680×~760)', w: 680, h: 760 },
  { name: 'arch story (820×~1150)', w: 820, h: 1150 },
  { name: 'split ig-feed (605×1350)', w: 605, h: 1350 },
  { name: `reel scene (1080×1920 @${MAX_ZOOM}× zoom)`, w: Math.ceil(1080 * MAX_ZOOM), h: Math.ceil(1920 * MAX_ZOOM) },
];

/** Prints the ✓/✗ table for one photo and returns the verdict per placement. */
export function reportPlacements(file: string, w: number, h: number, note = ''): Record<string, string> {
  console.log(`\n${file}  ${w}×${h}  (${(w * h / 1e6).toFixed(1)} MP)${note}`);
  const fits: Record<string, string> = {};
  for (const p of PLACEMENTS) {
    const srcPerOut = 1 / Math.max(p.w / w, p.h / h); // source px per delivered px (object-fit: cover)
    const verdict = srcPerOut >= 2 ? '✓ crisp (2×)' : srcPerOut >= 1 ? '✓ ok (1×–2×)' : `✗ too small (${srcPerOut.toFixed(2)}×)`;
    fits[p.name] = verdict;
    console.log(`  ${verdict.padEnd(20)} ${p.name}`);
  }
  return fits;
}

export const anyTooSmall = (reports: Record<string, string>[]): boolean =>
  reports.some(r => Object.values(r).some(v => v.startsWith('✗')));
