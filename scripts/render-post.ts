// Render a static post brief into every requested format.
//
//   node scripts/render-post.ts content/posts/<slug>.json [--formats ig-feed,story] [--allow-lowres]
//
// Pipeline per format: HTML at 2x device scale -> lossless PNG master -> Lanczos downscale
// to the exact platform size -> JPEG q95 with 4:4:4 chroma (no colour bleed) + sRGB profile.
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import sharp from 'sharp';
import { parseArgs, resolveFormat } from './lib/brand.ts';
import { checkPhotoResolution, waitForAssets } from './lib/quality.ts';
import { assertSlug, buildDir, cleanBuild, distribute, masterDir, rel, writeManifest } from './lib/output.ts';
import { POST_TEMPLATES } from './templates/post.ts';
import type { PostBrief } from './templates/post.ts';

const SUPERSAMPLE = 2;

const args = parseArgs(process.argv.slice(2));
const briefPath = args._[0];
if (!briefPath) {
  console.error('Usage: node scripts/render-post.ts <brief.json> [--formats ig-feed,story] [--allow-lowres]');
  process.exit(1);
}

const brief: PostBrief = JSON.parse(readFileSync(briefPath, 'utf8'));
const slug = assertSlug(brief.slug);
const tpl = POST_TEMPLATES[brief.template];
if (!tpl) throw new Error(`Unknown template "${brief.template}". Use: ${Object.keys(POST_TEMPLATES).join(', ')}`);

const formatKeys = typeof args.formats === 'string' ? args.formats.split(',') : (brief.formats ?? ['ig-feed']);
const strict = !args['allow-lowres'];

const build = buildDir(slug);
const masters = masterDir(slug);
const browser = await chromium.launch();
const results: Record<string, unknown>[] = [];

try {
  for (const key of formatKeys) {
    const f = resolveFormat(key.trim());
    const page = await browser.newPage({ viewport: { width: f.w, height: f.h }, deviceScaleFactor: SUPERSAMPLE });
    const htmlFile = path.join(build, `${f.key}.html`);
    writeFileSync(htmlFile, tpl(brief, f));
    await page.goto('file:///' + htmlFile.replace(/\\/g, '/'));
    await waitForAssets(page);
    const quality = await checkPhotoResolution(page, { deliveryScale: 1, masterScale: SUPERSAMPLE, strict });

    // Auto-fit copy to its column; anything still overflowing is reported.
    const layoutIssues = await page.evaluate(() => (window as unknown as { __fit: () => string[] }).__fit());
    for (const i of layoutIssues) console.warn(`[layout:warn] ${f.key}: ${i} — shorten the copy.`);

    const png = await page.screenshot({ type: 'png', omitBackground: false });
    await page.close();

    const masterFile = path.join(masters, `${f.key}@2x.png`);
    await sharp(png).withIccProfile('srgb').png({ compressionLevel: 9 }).toFile(masterFile);

    const deliveryFile = path.join(build, `${f.key}.jpg`);
    await sharp(png)
      .resize(f.w, f.h, { kernel: 'lanczos3', fit: 'fill' })
      .withIccProfile('srgb')
      .jpeg({ quality: 95, chromaSubsampling: '4:4:4', mozjpeg: true })
      .toFile(deliveryFile);

    const targets = f.platforms.filter(p => !brief.platforms || brief.platforms.includes(p));
    if (!targets.length) console.warn(`[platform:warn] ${f.key} suits ${f.platforms.join('/')} but brief.platforms is ${brief.platforms?.join('/')} — nothing delivered for this format.`);
    const delivered = distribute(deliveryFile, slug, targets);
    results.push({ format: f.key, size: `${f.w}x${f.h}`, master: rel(masterFile), files: delivered.map(rel), photos: quality.items, warnings: quality.problems });
    console.log(`✓ ${f.key} ${f.w}×${f.h} → ${delivered.map(rel).join(', ')}`);
  }
} finally {
  await browser.close();
  cleanBuild(slug);
}

// draftOnly: rendered with the low-res override — buffer.ts refuses to publish it.
writeManifest(slug, 'post', { brief: rel(path.resolve(briefPath)), renderedAt: new Date().toISOString(), draftOnly: !strict, outputs: results });
