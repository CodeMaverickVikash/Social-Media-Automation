// Pre-publish QA for finished files. Fails on anything that would look worse after upload.
//
//   node scripts/check-media.ts output/instagram/<slug>          (a folder)
//   node scripts/check-media.ts output/instagram/<slug>/reel.mp4 (a file)
//
// Images: exact platform size, sRGB, ≤ 8 MB, JPEG/PNG.
// Video:  1080×1920, H.264 + yuv420p, 30fps, AAC, 3–90s, ≤ 300 MB, faststart.
import { readdirSync, statSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import sharp from 'sharp';
import { FFMPEG as ffmpegPath } from './lib/ffmpeg.ts';
import { BRAND, formatKeys } from './lib/brand.ts';

const targets = process.argv.slice(2);
if (!targets.length) { console.error('Usage: node scripts/check-media.ts <file-or-folder> [...]'); process.exit(1); }

const files = targets.flatMap(t => statSync(t).isDirectory() ? readdirSync(t).map(f => path.join(t, f)) : [t]);
const sizes = new Set(formatKeys().map(k => `${BRAND.formats[k]!.w}x${BRAND.formats[k]!.h}`));
let failed = 0;

const fail = (f: string, m: string) => { failed++; console.error(`✗ ${f}: ${m}`); };
const ok = (f: string, m: string) => console.log(`✓ ${f}: ${m}`);

for (const f of files) {
  const ext = path.extname(f).toLowerCase();
  const bytes = statSync(f).size;
  if (['.jpg', '.jpeg', '.png'].includes(ext)) {
    const m = await sharp(f).metadata();
    const dim = `${m.width}x${m.height}`;
    const issues: string[] = [];
    if (!sizes.has(dim)) issues.push(`size ${dim} is not a platform format (${[...sizes].join(', ')})`);
    if (bytes > 8 * 1024 * 1024) issues.push(`${(bytes / 1e6).toFixed(1)} MB > 8 MB limit`);
    if (m.space !== 'srgb') issues.push(`colour space ${m.space}, expected sRGB`);
    if (ext !== '.png' && m.chromaSubsampling && m.chromaSubsampling !== '4:4:4') issues.push(`chroma ${m.chromaSubsampling} (use 4:4:4 to keep text edges clean)`);
    issues.length ? fail(f, issues.join('; ')) : ok(f, `${dim}, ${(bytes / 1e6).toFixed(2)} MB`);
  } else if (['.mp4', '.mov'].includes(ext)) {
    const probe = spawnSync(ffmpegPath, ['-hide_banner', '-i', f], { encoding: 'utf8' }).stderr;
    const v = probe.match(/Video: (\w+).*?, (\w+)\(?.*?, (\d+)x(\d+).*?, (?:[\d.]+ kb\/s, )?([\d.]+) fps/);
    const a = probe.match(/Audio: (\w+)/);
    const d = probe.match(/Duration: (\d+):(\d+):([\d.]+)/);
    const secs = d ? +d[1]! * 3600 + +d[2]! * 60 + +d[3]! : 0;
    const issues: string[] = [];
    if (!v) issues.push('no video stream');
    else {
      if (v[1] !== 'h264') issues.push(`codec ${v[1]}, expected h264`);
      if (!v[2]!.startsWith('yuv420p')) issues.push(`pixel format ${v[2]}, expected yuv420p`);
      if (`${v[3]}x${v[4]}` !== `${BRAND.video.w}x${BRAND.video.h}`) issues.push(`size ${v[3]}x${v[4]}, expected 1080x1920`);
      if (Math.abs(+v[5]! - BRAND.video.fps) > 0.5) issues.push(`${v[5]} fps, expected ${BRAND.video.fps}`);
    }
    if (!a) issues.push('no audio track (add licensed music or a silent track)');
    else if (a[1] !== 'aac') issues.push(`audio ${a[1]}, expected aac`);
    if (secs < 3 || secs > 90) issues.push(`duration ${secs.toFixed(1)}s outside 3–90s`);
    if (bytes > 300 * 1024 * 1024) issues.push(`${(bytes / 1e6).toFixed(0)} MB > 300 MB`);
    const head = readFileSync(f).subarray(0, 64 * 1024).toString('latin1');
    if (head.indexOf('moov') === -1 || head.indexOf('moov') > head.indexOf('mdat')) issues.push('moov atom not at start (needs +faststart)');
    issues.length ? fail(f, issues.join('; ')) : ok(f, `1080x1920 h264 ${secs.toFixed(1)}s ${(bytes / 1e6).toFixed(1)} MB`);
  } else if (ext === '.txt') {
    const t = readFileSync(f, 'utf8');
    t.trim() ? ok(f, `${t.length} chars`) : fail(f, 'empty caption');
  }
}

if (failed) { console.error(`\n${failed} file(s) failed QA — fix before publishing.`); process.exit(1); }
console.log('\nAll files passed QA.');
