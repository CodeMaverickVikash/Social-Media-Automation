// Static post templates. Each returns a full HTML document sized to the format.
// Compositions mirror brand/reference-posts: logo top-left, Playfair headline,
// Montserrat attribute row, CTA pill, category badge bottom-left.
import { ROOT, esc, lines, fileUrl, iconSvg, logoSvg, sprigSvg, theme, resolvePath } from '../lib/brand.ts';
import type { Format, Theme } from '../lib/brand.ts';
import path from 'node:path';

export type PostTemplate = 'overlay' | 'split' | 'card';

export interface PostBrief {
  slug: string;
  template: PostTemplate;
  theme?: string;
  formats?: string[];
  /** Local path (relative to repo root) to a high-resolution photo */
  photo?: string;
  /** CSS object-position for the photo, e.g. "70% 30%" */
  focus?: string;
  /** Small uppercase label above the headline, e.g. "NEW ARRIVALS" */
  eyebrow?: string;
  /** Use \n for line breaks */
  headline: string;
  subline?: string;
  attrs?: string[];
  cta?: string;
  badge?: { icon: string; label: string };
  /** Card template only: small text at the bottom (address, timings, offer terms) */
  footnote?: string;
  /** Overlay template: which side the text and scrim sit on */
  side?: 'left' | 'bottom';
}

const tokensHref = fileUrl(path.join(ROOT, 'brand', 'tokens.css'));

function page(f: Format, css: string, body: string): string {
  return `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="${tokensHref}">
<style>
  :root { --w: ${f.w}px; --h: ${f.h}px; --safe-top: ${f.safe.top}px; --safe-bottom: ${f.safe.bottom}px; --side: ${f.safe.side}px; }
  html, body { width: var(--w); height: var(--h); overflow: hidden; }
  body { position: relative; font-family: var(--font-body); }
  .eyebrow { font: 500 var(--fs-label)/1.2 var(--font-body); letter-spacing: .32em; text-transform: uppercase; margin-bottom: 26px; }
  .headline { font-family: var(--font-heading); font-weight: 400; letter-spacing: -0.01em; }
  .subline { font: 400 var(--fs-subhead)/1.2 var(--font-heading); margin-top: 26px; }
  .attrs { font: 500 var(--fs-attrs)/1.3 var(--font-body); margin-top: 30px; letter-spacing: .02em; white-space: nowrap; }
  .attrs .sep { font-style: normal; opacity: .7; margin: 0 .55em; }
  .cta { display: inline-flex; align-items: center; gap: 18px; margin-top: 44px; padding: 22px 44px; border-radius: 999px;
         font: 500 var(--fs-cta)/1 var(--font-body); letter-spacing: .01em; white-space: nowrap; }
  .cta .arrow { width: 1.1em; height: 1.1em; }
  .badge { display: flex; align-items: center; gap: 22px; font: 500 26px/1 var(--font-body); }
  .badge .rule { width: 1.5px; height: 48px; opacity: .55; }
  .headline, .subline, .eyebrow { white-space: nowrap; }
  .text { width: 100%; }
  .text > * { max-width: 100%; }
  ${css}
</style>
<script>
  // Auto-fit: shrink type until every line fits its column, then until the column fits vertically.
  // Returns anything that still overflows so the renderer can warn.
  window.__fit = () => {
    const issues = [];
    const over = el => el.scrollWidth > el.clientWidth + 1;
    const size = el => parseFloat(getComputedStyle(el).fontSize);
    for (const el of document.querySelectorAll('.headline, .subline, .attrs, .eyebrow, .cta')) {
      let n = 0;
      while (over(el) && n++ < 40) el.style.fontSize = size(el) * 0.97 + 'px';
      if (over(el)) issues.push('text too wide: ' + el.className);
    }
    for (const col of document.querySelectorAll('.col')) {
      const h = col.querySelector('.headline');
      let n = 0;
      while (h && col.scrollHeight > col.clientHeight + 1 && n++ < 30) h.style.fontSize = size(h) * 0.96 + 'px';
      if (col.scrollHeight > col.clientHeight + 1) issues.push('copy too long for the canvas height');
    }
    return issues;
  };
</script></head><body>${body}</body></html>`;
}

const ARROW = `<svg class="arrow" viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12h17M14 6l6 6-6 6"/></svg>`;

function attrsHtml(attrs?: string[]): string {
  if (!attrs?.length) return '';
  return `<div class="attrs">${attrs.map(esc).join('<i class="sep">|</i>')}</div>`;
}

function ctaHtml(t: Theme, cta?: string): string {
  if (!cta) return '';
  const border = t.ctaBorder ? `border: 2px solid ${t.ctaBorder};` : '';
  return `<div class="cta" style="background:${t.ctaBg};color:${t.ctaFg};${border}">${esc(cta)}${ARROW}</div>`;
}

function badgeHtml(t: Theme, badge?: PostBrief['badge']): string {
  if (!badge) return '';
  return `<div class="badge" style="color:${t.text}">${iconSvg(badge.icon, t.text, 58)}<span class="rule" style="background:${t.text}"></span>${esc(badge.label)}</div>`;
}

function photoTag(b: PostBrief): string {
  if (!b.photo) throw new Error(`Template "${b.template}" needs a "photo"`);
  const src = fileUrl(resolvePath(b.photo));
  return `<img data-photo src="${src}" style="object-position:${esc(b.focus ?? 'center')}">`;
}

/** Headline size adapts to canvas height so square posts don't overflow. */
const headlineSize = (f: Format, max = 112) => Math.round(Math.min(max, f.h * 0.083));
const logoWidth = (f: Format) => (f.h <= 1080 ? 250 : 300);

// ---------------------------------------------------------------- overlay
function overlay(b: PostBrief, f: Format): string {
  const t = theme(b.theme ?? 'festive');
  const side = b.side ?? 'left';
  const scrim = side === 'left'
    ? `linear-gradient(90deg, rgba(${t.scrim},.94) 0%, rgba(${t.scrim},.82) 30%, rgba(${t.scrim},.35) 52%, rgba(${t.scrim},0) 68%),
       linear-gradient(0deg, rgba(${t.scrim},.35) 0%, rgba(${t.scrim},0) 25%)`
    : `linear-gradient(0deg, rgba(${t.scrim},.95) 0%, rgba(${t.scrim},.8) 38%, rgba(${t.scrim},0) 66%),
       linear-gradient(180deg, rgba(${t.scrim},.55) 0%, rgba(${t.scrim},0) 24%)`;
  const colW = side === 'left' ? 600 : f.w - 2 * f.safe.side;
  const css = `
    img[data-photo] { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
    .scrim { position: absolute; inset: 0; background: ${scrim}; }
    .col { position: absolute; left: var(--side); top: var(--safe-top); bottom: var(--safe-bottom); width: ${colW}px;
           display: flex; flex-direction: column; color: ${t.text}; }
    .text { margin-top: auto; padding-bottom: 56px; }
    .headline { font-size: ${headlineSize(f)}px; line-height: 1.02; }`;
  return page(f, css, `
    ${photoTag(b)}<div class="scrim"></div>
    <div class="col">
      ${logoSvg('stacked', t.logo, logoWidth(f))}
      <div class="text">
        ${b.eyebrow ? `<div class="eyebrow">${esc(b.eyebrow)}</div>` : ''}
        <div class="headline">${lines(b.headline)}</div>
        ${b.subline ? `<div class="subline">${lines(b.subline)}</div>` : ''}
        ${attrsHtml(b.attrs)}
        ${ctaHtml(t, b.cta)}
      </div>
      ${badgeHtml(t, b.badge)}
    </div>`);
}

// ---------------------------------------------------------------- split
function split(b: PostBrief, f: Format): string {
  const t = theme(b.theme ?? 'mens');
  const panelW = Math.round(f.w * 0.44);
  const css = `
    .panel { position: absolute; left: 0; top: 0; bottom: 0; width: ${panelW}px; background: ${t.panel}; }
    .photo { position: absolute; left: ${panelW}px; right: 0; top: 0; bottom: 0; overflow: hidden; }
    img[data-photo] { width: 100%; height: 100%; object-fit: cover; display: block; }
    .col { position: absolute; left: 56px; top: var(--safe-top); bottom: var(--safe-bottom); width: ${panelW - 100}px;
           display: flex; flex-direction: column; color: ${t.text}; }
    .col .logo { align-self: center; }
    .text { margin-top: auto; padding-bottom: 52px; }
    .headline { font-size: ${Math.round(headlineSize(f, 92) * 0.92)}px; line-height: 1.04; }
    .attrs { font-size: 21px; letter-spacing: .18em; text-transform: uppercase; }
    .cta { font-size: 27px; padding: 20px 36px; }`;
  return page(f, css, `
    <div class="panel"></div>
    <div class="photo">${photoTag(b)}</div>
    <div class="col">
      ${logoSvg('stacked', t.logo, Math.min(logoWidth(f), panelW - 140))}
      <div class="text">
        ${b.eyebrow ? `<div class="eyebrow">${esc(b.eyebrow)}</div>` : ''}
        <div class="headline">${lines(b.headline)}</div>
        ${b.subline ? `<div class="subline">${lines(b.subline)}</div>` : ''}
        ${attrsHtml(b.attrs)}
        ${ctaHtml(t, b.cta)}
      </div>
      ${badgeHtml(t, b.badge)}
    </div>`);
}

// ---------------------------------------------------------------- card (no photo)
function card(b: PostBrief, f: Format): string {
  const t = theme(b.theme ?? 'light');
  const bg = t.panel;
  const css = `
    body { background: ${bg}; }
    .frame { position: absolute; inset: 36px; border: 1.5px solid ${t.accent}; opacity: .7; }
    .sprig { position: absolute; }
    .sprig.br { right: -40px; bottom: -60px; }
    .sprig.tl { left: -60px; top: -40px; transform: rotate(180deg); }
    .col { position: absolute; inset: var(--safe-top) var(--side) var(--safe-bottom); display: flex; flex-direction: column;
           align-items: center; text-align: center; color: ${t.text}; }
    .text { margin: auto 0; display: flex; flex-direction: column; align-items: center; }
    .headline { font-size: ${headlineSize(f, 104)}px; line-height: 1.04; }
    .foot { font: 500 24px/1.5 var(--font-body); letter-spacing: .04em; opacity: .85; white-space: pre-line; }`;
  return page(f, css, `
    <div class="frame"></div>
    <div class="sprig br">${sprigSvg(t.accent, 380, 0.75)}</div>
    <div class="sprig tl">${sprigSvg(t.accent, 300, 0.5)}</div>
    <div class="col">
      ${logoSvg('stacked', t.logo, logoWidth(f) - 20)}
      <div class="text">
        ${b.eyebrow ? `<div class="eyebrow">${esc(b.eyebrow)}</div>` : ''}
        <div class="headline">${lines(b.headline)}</div>
        ${b.subline ? `<div class="subline">${lines(b.subline)}</div>` : ''}
        ${attrsHtml(b.attrs)}
        ${ctaHtml(t, b.cta)}
      </div>
      ${b.footnote ? `<div class="foot">${esc(b.footnote)}</div>` : ''}
    </div>`);
}

export const POST_TEMPLATES: Record<PostTemplate, (b: PostBrief, f: Format) => string> = { overlay, split, card };
