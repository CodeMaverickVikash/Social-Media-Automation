// Render a reel brief to a platform-ready MP4.
//
//   node scripts/render-reel.ts content/reels/<slug>.json [--draft] [--allow-lowres]
//
// Quality pipeline:
//   1. Every photo is checked against the size it must fill at max Ken Burns zoom.
//      Below 1x -> render refused (would pixelate). Then pre-scaled with Lanczos so the
//      browser never has to resample by more than the zoom factor.
//   2. Frames are captured losslessly (PNG) at 2x and downscaled by ffmpeg with Lanczos
//      (--draft captures at 1x for speed).
//   3. H.264 High, CRF 16, yuv420p, BT.709, 30fps, 2s GOP, 20 Mbps cap, AAC 192k 48kHz, +faststart.
import { readFileSync, writeFileSync, statSync } from 'node:fs';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { chromium } from 'playwright';
import sharp from 'sharp';
import { FFMPEG as ffmpegPath } from './lib/ffmpeg.ts';
import { BRAND, fileUrl, parseArgs, resolvePath } from './lib/brand.ts';
import { checkPhotoResolution, waitForAssets } from './lib/quality.ts';
import { assertSlug, buildDir, cleanBuild, distribute, masterDir, rel, writeManifest } from './lib/output.ts';
import { MAX_ZOOM, reelHtml } from './templates/reel.ts';
import type { ReelBrief } from './templates/reel.ts';

const args = parseArgs(process.argv.slice(2));
const briefPath = args._[0];
if (!briefPath) {
  console.error('Usage: node scripts/render-reel.ts <brief.json> [--draft] [--allow-lowres]');
  process.exit(1);
}

const brief: ReelBrief = JSON.parse(readFileSync(briefPath, 'utf8'));
const slug = assertSlug(brief.slug);
if (!brief.scenes?.length) throw new Error('Reel brief needs at least one scene');

const { w: W, h: H, safe } = BRAND.video;
const fps = brief.fps ?? BRAND.video.fps;
const SS = args.draft ? 1 : 2;
const strict = !args['allow-lowres'];
const build = buildDir(slug);
const masters = masterDir(slug);

// ---- 1. Photo resolution gate + Lanczos pre-scale -------------------------------------
const photoUrls: string[] = [];
for (const [i, s] of brief.scenes.entries()) {
  const src = resolvePath(s.photo);
  const meta = await sharp(src).metadata();
  const nw = meta.autoOrient?.width ?? meta.width!, nh = meta.autoOrient?.height ?? meta.height!;
  const need1x = Math.max((W * MAX_ZOOM) / nw, (H * MAX_ZOOM) / nh); // >1 means upscaling
  if (need1x > 1) {
    const msg = `${path.basename(src)} is ${nw}×${nh}; scene ${i + 1} needs ≥ ${Math.ceil(nw * need1x)}×${Math.ceil(nh * need1x)} to fill 1080×1920 at ${MAX_ZOOM}× zoom without upscaling.`;
    if (strict) throw new Error(`Quality gate failed: ${msg} Use a larger original (or --allow-lowres for internal drafts).`);
    console.warn(`[quality:error→allowed] ${msg}`);
  } else if (need1x * 2 > 1) {
    console.warn(`[quality:warn] ${path.basename(src)} is sharp at 1080p but below 2× supersampling — fine, a larger original would be crisper.`);
  }
  // Downscale only (never enlarge) to exactly what the 2x canvas needs at max zoom.
  const target = Math.min(1, need1x * SS);
  const out = path.join(build, `scene-${i}.png`);
  await sharp(src).autoOrient()
    .resize(Math.ceil(nw * target), Math.ceil(nh * target), { kernel: 'lanczos3', withoutEnlargement: true })
    .png({ compressionLevel: 1 })
    .toFile(out);
  photoUrls.push(fileUrl(out));
}

// ---- 2. Capture frames ----------------------------------------------------------------
const htmlFile = path.join(build, 'reel.html');
writeFileSync(htmlFile, reelHtml(brief, photoUrls, W, H, safe));

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: SS });
await page.goto(fileUrl(htmlFile));
await waitForAssets(page);
await page.evaluate(() => {
  for (const s of document.querySelectorAll<HTMLElement>('.scene')) { s.style.opacity = '1'; s.style.visibility = 'visible'; }
});
await checkPhotoResolution(page, { deliveryScale: 1, masterScale: SS, extraZoom: MAX_ZOOM, strict });

const duration: number = await page.evaluate(() => (window as unknown as { __duration: number }).__duration);
const totalFrames = Math.round(duration * fps);
const audio = brief.audio ? resolvePath(brief.audio) : null;
const mp4 = path.join(build, 'reel.mp4');

const ff = spawn(ffmpegPath, [
  '-y', '-hide_banner', '-loglevel', 'error',
  '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'png', '-i', '-',
  ...(audio ? ['-i', audio] : ['-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=stereo']),
  '-map', '0:v', '-map', '1:a',
  '-vf', `scale=${W}:${H}:flags=lanczos+accurate_rnd+full_chroma_int:out_color_matrix=bt709:out_range=tv,format=yuv420p`,
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-maxrate', '20M', '-bufsize', '40M',
  '-profile:v', 'high', '-level:v', '4.2', '-g', String(fps * 2), '-r', String(fps),
  '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709', '-color_range', 'tv',
  '-af', `apad,afade=t=out:st=${Math.max(0, duration - 1).toFixed(2)}:d=1`,
  '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-ac', '2',
  '-t', duration.toFixed(3), '-movflags', '+faststart', mp4,
], { stdio: ['pipe', 'inherit', 'inherit'] });
const ffDone = new Promise<void>((res, rej) => ff.on('close', c => (c === 0 ? res() : rej(new Error(`ffmpeg exited ${c}`)))));

const coverAt = brief.coverAt ?? 1.4;
const coverFrame = Math.min(totalFrames - 1, Math.round(coverAt * fps));
let coverPng: Buffer | null = null;
const t0 = Date.now();
const cdp = await page.context().newCDPSession(page);
const spent = { seek: 0, capture: 0, encode: 0 };
try {
  for (let f = 0; f < totalFrames; f++) {
    let ts = performance.now();
    await page.evaluate((t: number) => (window as unknown as { __seek: (t: number) => void }).__seek(t), f / fps);
    spent.seek += performance.now() - ts; ts = performance.now();
    // Lossless PNG via CDP (optimizeForSpeed = faster zlib level, same pixels).
    const { data } = await cdp.send('Page.captureScreenshot', { format: 'png', optimizeForSpeed: true });
    const png = Buffer.from(data, 'base64');
    spent.capture += performance.now() - ts; ts = performance.now();
    if (f === coverFrame) coverPng = png;
    if (!ff.stdin.write(png)) await new Promise(r => ff.stdin.once('drain', r));
    spent.encode += performance.now() - ts;
    if (f % fps === 0) process.stdout.write(`\rframes ${f}/${totalFrames}`);
  }
  if (process.env.REEL_PROFILE) console.log('\nms per frame:', Object.fromEntries(Object.entries(spent).map(([k, v]) => [k, Math.round(v / totalFrames)])));
} finally {
  ff.stdin.end();
  await browser.close();
}
await ffDone;
process.stdout.write(`\rframes ${totalFrames}/${totalFrames} in ${((Date.now() - t0) / 1000).toFixed(0)}s\n`);

// ---- 3. Cover image + distribute ------------------------------------------------------
const cover = path.join(build, 'reel-cover.jpg');
await sharp(coverPng!).resize(W, H, { kernel: 'lanczos3', fit: 'fill' }).withIccProfile('srgb')
  .jpeg({ quality: 95, chromaSubsampling: '4:4:4', mozjpeg: true }).toFile(cover);
await sharp(coverPng!).withIccProfile('srgb').png().toFile(path.join(masters, 'reel-cover@2x.png'));

const platforms = brief.platforms ?? ['instagram', 'facebook', 'whatsapp'];
if (platforms.includes('whatsapp') && duration > 60) console.warn('[platform:warn] WhatsApp Status clips are limited to 60s — this reel will be split or trimmed by WhatsApp.');
const files = [...distribute(mp4, slug, platforms), ...distribute(cover, slug, platforms)];
const size = statSync(mp4).size;
writeManifest(slug, 'reel', {
  brief: rel(path.resolve(briefPath)), renderedAt: new Date().toISOString(),
  // Draft-only output (low-res override or 1x frames) — buffer.ts refuses to publish it.
  draftOnly: !strict || SS < 2,
  duration, fps, frames: totalFrames, supersample: SS, bytes: size,
  coverThumbnailOffsetMs: Math.round(coverAt * 1000),
  audio: audio ? rel(audio) : 'silent', files: files.map(rel),
});
cleanBuild(slug);
console.log(`✓ reel ${W}×${H} ${duration.toFixed(1)}s ${(size / 1e6).toFixed(1)} MB → ${files.map(rel).join(', ')}`);
