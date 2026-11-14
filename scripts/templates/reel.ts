// Reel / Short / Status video template (1080x1920).
// The page exposes window.__seek(t): every frame is a pure function of time, so renders are
// deterministic and frame-accurate (no wall-clock CSS animations).
import { ROOT, esc, lines, fileUrl, logoSvg, theme } from '../lib/brand.ts';
import type { Theme } from '../lib/brand.ts';
import path from 'node:path';

export type Motion = 'zoom-in' | 'zoom-out' | 'pan-left' | 'pan-right';

export interface ReelScene {
  /** Local photo path (relative to repo root). Use high-res originals. */
  photo: string;
  /** Seconds this scene holds (excluding the crossfade into it). */
  duration: number;
  eyebrow?: string;
  headline?: string;
  subline?: string;
  attrs?: string[];
  focus?: string;
  motion?: Motion;
}

export interface ReelBrief {
  slug: string;
  theme?: string;
  fps?: number;
  /** Crossfade seconds between scenes (default 0.6) */
  transition?: number;
  scenes: ReelScene[];
  endCard?: { duration?: number; headline?: string; cta?: string; line?: string; dark?: boolean };
  /** Local audio file (licensed!). If absent a silent track is added. */
  audio?: string;
  /** Second at which the cover frame is taken (default 1.4) */
  coverAt?: number;
  /** Caption-side metadata for publishing; not drawn on video */
  platforms?: string[];
}

export const MAX_ZOOM = 1.08;

const tokensHref = fileUrl(path.join(ROOT, 'brand', 'tokens.css'));

function sceneHtml(s: ReelScene, i: number, photoUrl: string, t: Theme): string {
  const attrs = s.attrs?.length ? `<div class="attrs r">${s.attrs.map(esc).join('<i class="sep">|</i>')}</div>` : '';
  return `<section class="scene" id="s${i}" style="z-index:${i + 1}">
    <img data-photo src="${photoUrl}" style="object-position:${esc(s.focus ?? 'center')}">
    <div class="scrim"></div>
    <div class="copy" style="color:${t.text}">
      ${s.eyebrow ? `<div class="eyebrow r">${esc(s.eyebrow)}</div>` : ''}
      ${s.headline ? `<div class="headline r">${lines(s.headline)}</div>` : ''}
      ${s.subline ? `<div class="subline r">${lines(s.subline)}</div>` : ''}
      ${attrs}
    </div>
  </section>`;
}

export function reelHtml(b: ReelBrief, photoUrls: string[], W: number, H: number, safe: { top: number; bottom: number; side: number }): string {
  const t = theme(b.theme ?? 'festive');
  const end = { duration: 2.6, dark: true, ...(b.endCard ?? {}) };
  const endBg = end.dark ? (t.panel || '#1F1F1F') : '#FAF9F6';
  const endFg = end.dark ? (t.text || '#FAF9F6') : '#1F1F1F';
  const endCtaBg = t.ctaBg || '#D4AF37';
  const endCtaFg = t.ctaFg || '#FAF9F6';
  const timeline = {
    tr: b.transition ?? 0.6,
    scenes: b.scenes.map(s => ({ d: s.duration, motion: s.motion ?? 'zoom-in' })),
    end: end.duration,
    maxZoom: MAX_ZOOM,
  };

  return `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="${tokensHref}">
<style>
  html, body { width: ${W}px; height: ${H}px; overflow: hidden; background: #000; }
  .scene, .end { position: absolute; inset: 0; overflow: hidden; opacity: 0; }
  .scene img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transform-origin: 50% 40%; will-change: transform; }
  .scrim { position: absolute; inset: 0; background:
      linear-gradient(0deg, rgba(${t.scrim},.94) 0%, rgba(${t.scrim},.72) 32%, rgba(${t.scrim},0) 58%),
      linear-gradient(180deg, rgba(${t.scrim},.82) 0%, rgba(${t.scrim},.52) 18%, rgba(${t.scrim},0) 32%); }
  .copy { position: absolute; left: ${safe.side}px; right: ${safe.side}px; bottom: ${safe.bottom + 40}px; }
  .r { opacity: 0; will-change: transform, opacity; }
  .eyebrow { font: 500 24px/1.2 var(--font-body); letter-spacing: .32em; text-transform: uppercase; margin-bottom: 26px; }
  .headline { font: 400 118px/1.02 var(--font-heading); letter-spacing: -.01em; }
  .subline { font: 400 44px/1.2 var(--font-heading); margin-top: 28px; }
  .attrs { font: 500 30px/1.3 var(--font-body); margin-top: 30px; }
  .attrs .sep { font-style: normal; opacity: .7; margin: 0 .55em; }
  .brand { position: absolute; left: ${safe.side}px; top: ${safe.top - 60}px; z-index: 900; filter: drop-shadow(0 4px 18px rgba(0,0,0,0.85)); }
  .end { z-index: 1000; background: radial-gradient(circle at 50% 42%, rgba(${t.scrim},0.98) 0%, ${endBg} 70%, #0A0203 100%); color: ${endFg}; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 0 ${safe.side}px ${safe.bottom - safe.top}px; }
  .end .headline { font-size: 72px; margin-top: 70px; }
  .end .cta { margin-top: 56px; display: inline-flex; align-items: center; gap: 18px; padding: 26px 52px; border-radius: 999px;
              font: 500 34px/1 var(--font-body); background: ${endCtaBg}; color: ${endCtaFg}; box-shadow: 0 8px 32px rgba(0,0,0,0.45); }
  .end .line { margin-top: 36px; font: 500 26px/1.4 var(--font-body); letter-spacing: .06em; opacity: .85; }
</style></head><body>
  ${b.scenes.map((s, i) => sceneHtml(s, i, photoUrls[i]!, t)).join('\n')}
  <div class="brand" id="brand">${logoSvg('compact', t.logo || '#FAF9F6', 240)}</div>
  <section class="end" id="end">
    <div class="r" id="endLogo">${logoSvg('stacked', endFg, 480)}</div>
    ${end.headline ? `<div class="headline r">${lines(end.headline)}</div>` : ''}
    ${end.cta ? `<div class="cta r">${esc(end.cta)}<svg viewBox="0 0 24 24" width="1.1em" height="1.1em" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12h17M14 6l6 6-6 6"/></svg></div>` : ''}
    ${end.line ? `<div class="line r">${esc(end.line)}</div>` : ''}
  </section>
<script>
  const T = ${JSON.stringify(timeline)};
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const easeOut = x => 1 - Math.pow(1 - x, 3);
  const easeInOut = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  const starts = []; let acc = 0;
  for (const s of T.scenes) { starts.push(acc); acc += s.d; }
  const endStart = acc;
  window.__duration = acc + T.end;

  function reveal(els, t0, t) {
    els.forEach((el, k) => {
      const p = easeOut(clamp((t - t0 - k * 0.14) / 0.7));
      el.style.opacity = p;
      el.style.transform = 'translateY(' + (1 - p) * 34 + 'px)';
    });
  }

  window.__seek = t => {
    T.scenes.forEach((s, i) => {
      const el = document.getElementById('s' + i);
      const a = i === 0 ? 0 : starts[i] - T.tr;           // visible from (fades in over previous scene)
      const b = i === T.scenes.length - 1 ? endStart : starts[i + 1];
      const vis = t >= a && t <= b + 0.001;
      el.style.visibility = vis ? 'visible' : 'hidden';
      if (!vis) return;
      el.style.opacity = i === 0 ? 1 : easeInOut(clamp((t - a) / T.tr));
      const p = clamp((t - a) / (b - a));
      const z = T.maxZoom - 1, img = el.querySelector('img');
      const m = s.motion;
      let tf;
      if (m === 'zoom-out') tf = 'scale(' + (T.maxZoom - z * easeInOut(p)) + ')';
      else if (m === 'pan-left' || m === 'pan-right') {
        const dir = m === 'pan-left' ? -1 : 1;
        tf = 'scale(' + T.maxZoom + ') translateX(' + dir * (easeInOut(p) - .5) * (z / T.maxZoom) * 100 * .9 + '%)';
      } else tf = 'scale(' + (1 + z * easeInOut(p)) + ')';
      img.style.transform = tf;
      reveal([...el.querySelectorAll('.r')], (i === 0 ? 0.25 : starts[i] - T.tr * .2), t);
    });
    const e = document.getElementById('end');
    const ep = easeInOut(clamp((t - (endStart - T.tr)) / T.tr));
    e.style.opacity = ep;
    e.style.visibility = ep > 0 ? 'visible' : 'hidden';
    document.getElementById('brand').style.opacity = 1 - ep;
    const lp = easeOut(clamp((t - endStart + 0.1) / 0.8));
    const logo = document.getElementById('endLogo');
    logo.style.opacity = lp; logo.style.transform = 'scale(' + (0.96 + 0.04 * lp) + ')';
    reveal([...e.querySelectorAll('.r:not(#endLogo)')], endStart + 0.35, t);
  };
  window.__seek(0);
</script></body></html>`;
}
