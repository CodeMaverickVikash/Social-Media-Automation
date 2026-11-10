// Helpers for reading creative briefs (content/posts|reels/<slug>.json).

/** Every local image path a brief points to (posts use `photo`, reels use `scenes[].photo`). Remote URLs are ignored. */
export function imageRefs(v: unknown, out: string[] = []): string[] {
  if (typeof v === 'string') { if (/\.(jpe?g|png|webp)$/i.test(v) && !/^https?:/.test(v)) out.push(v); }
  else if (Array.isArray(v)) v.forEach(x => imageRefs(x, out));
  else if (v && typeof v === 'object') Object.values(v).forEach(x => imageRefs(x, out));
  return out;
}
