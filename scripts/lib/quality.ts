// Resolution gate: stops a render if any photo would be upscaled (= visible pixelation).
//
// For every <img data-photo> in the page we compute how many source pixels land on each
// output pixel, accounting for object-fit: cover, the supersample factor and any extra
// zoom (Ken Burns in reels). Fewer than 1 source px per output px means the photo is stretched.
import type { Page } from 'playwright';

interface PhotoMeasure {
  src: string;
  natural: [number, number];
  box: [number, number];
  /** CSS px per source px, worst case including zoom */
  scale: number;
}

export interface QualityReport {
  items: (PhotoMeasure & { sourcePxPerOutputPx: number })[];
  problems: { level: 'error' | 'warn'; msg: string }[];
}

export async function checkPhotoResolution(
  page: Page,
  { deliveryScale = 1, masterScale = 2, extraZoom = 1, strict = true } = {},
): Promise<QualityReport> {
  const measured = await page.evaluate((zoom: number): PhotoMeasure[] =>
    [...document.querySelectorAll<HTMLImageElement>('img[data-photo]')].map(img => {
      const r = img.getBoundingClientRect();
      const cover = Math.max(r.width / img.naturalWidth, r.height / img.naturalHeight);
      return {
        src: decodeURIComponent(img.src.split('/').pop() ?? img.src),
        natural: [img.naturalWidth, img.naturalHeight],
        box: [Math.round(r.width), Math.round(r.height)],
        scale: cover * zoom,
      };
    }), extraZoom);

  const report: QualityReport = { items: [], problems: [] };
  for (const it of measured) {
    const atDelivery = 1 / (it.scale * deliveryScale);
    const atMaster = 1 / (it.scale * masterScale);
    report.items.push({ ...it, sourcePxPerOutputPx: +atDelivery.toFixed(2) });
    if (atDelivery < 1) {
      const need = it.natural.map(n => Math.ceil(n / atDelivery)).join('×');
      report.problems.push({
        level: 'error',
        msg: `${it.src} is ${it.natural.join('×')} but needs ≥ ${need} to fill ${it.box.join('×')} without upscaling (would be stretched ${(1 / atDelivery).toFixed(2)}×). Use a larger original.`,
      });
    } else if (atMaster < 1) {
      report.problems.push({
        level: 'warn',
        msg: `${it.src} is sharp at delivery size but below 2× supersampling (${atDelivery.toFixed(2)} source px per output px). A larger original will look crisper.`,
      });
    }
  }
  for (const p of report.problems) (p.level === 'error' ? console.error : console.warn)(`[quality:${p.level}] ${p.msg}`);
  if (strict && report.problems.some(p => p.level === 'error')) {
    throw new Error('Quality gate failed: source photo resolution too low (see messages above). Pass --allow-lowres only for internal drafts.');
  }
  return report;
}

/** Waits for brand fonts and every image to be fully decoded before capture. */
export async function waitForAssets(page: Page): Promise<void> {
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(
      [...document.images].map(i =>
        i.complete ? i.decode().catch(() => {}) : new Promise<void>(r => { i.onload = i.onerror = () => r(); }),
      ),
    );
    const missing = [...document.images].filter(i => !i.naturalWidth).map(i => i.src);
    if (missing.length) throw new Error('Images failed to load: ' + missing.join(', '));
    for (const f of ['Playfair Display', 'Montserrat']) {
      await document.fonts.load(`32px "${f}"`);
      if (!document.fonts.check(`32px "${f}"`)) throw new Error(`Font not loaded: ${f}`);
    }
  });
}
