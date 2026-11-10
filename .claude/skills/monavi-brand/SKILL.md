---
name: monavi-brand
description: Monavi Collection brand guardian — colours, typography, logo rules, layout DNA, voice and the no-pixelation quality bar. Use before creating, reviewing or editing ANY Monavi creative (post, reel, story, caption, banner, WhatsApp message), when asked "is this on-brand?", or when changing brand tokens, logos or fonts.
user-invocable: false
---

# Monavi brand guardian

Monavi Collection ("MONAVI · COLLECTION · Wear Your Story") is a family fashion boutique selling bridal, festive, ladies, men's and kids wear. The look is Indian heritage with calm, editorial modern finishing.

## Source of truth: read before acting

| File | Read when |
|---|---|
| `brand/brand.json` | Always. It holds the tokens, formats, logo variants, video spec and contact info |
| `brand/README.md` | Designing or reviewing visuals |
| `brand/voice.md` | Writing any words: headlines, captions, CTAs, hashtags |
| `brand/reference-posts/*` | Look at 1–2 that match the category before designing. They are the approved finish level |

Never hard-code a colour, font or size that isn't in `brand.json`/`tokens.css`. To change a token, edit `brand/brand.json`, then mirror the change in `brand/tokens.css`, `scripts/lib/brand.ts` (THEMES) and `brand/README.md` in the same change.

## Non-negotiables

1. **Palette:** Ivory `#FAF9F6`, Charcoal `#1F1F1F`, Rose `#D9A5A8`, Sage `#8A987A`, Beige `#DCC8B1`. Campaign colours (Maroon, Deep Wine, Champagne, Antique Gold, Midnight) only on photo-led creatives. One accent per creative.
2. **Type:** Playfair Display (headlines, weight 400–500) + Montserrat (everything else). No third font.
3. **Logo:** Use the inline vector lockup from `scripts/lib/brand.ts → logoSvg()`. Never use the PNGs over photos, because they have a baked ivory background. No stretching, recolouring, shadows or re-typing. Keep the clear space equal to the star's height.
4. **Layout DNA:** logo top-left → Playfair headline → Montserrat attrs with ` | ` → CTA pill with arrow → category badge bottom-left.
5. **Quality:** no pixelation, ever. Source photos must cover their box at ≥1× (the renderer refuses below 1×, and 2× is ideal). Never upscale a small photo. Never ship anything smaller than the platform size. `--allow-lowres` is for internal drafts only and must never be published.
6. **Facts:** never invent prices, discounts, addresses, phone numbers, store hours, fabric claims or stock. Use `brand.json → contact` or ask the user. If a contact field is empty, leave it out and tell the user.

## Review checklist (use when asked to check a creative)

Open the image (Read tool) and check each item:
- [ ] Correct logo lockup, legible, unobstructed, with clear space
- [ ] Only brand fonts; headline in Playfair; no faux-bold
- [ ] Colours from the palette or an approved campaign colour
- [ ] Text contrast is readable on the photo (scrim present)
- [ ] Story/reel: no text in the top 250px, bottom 340px (story) / 400px (reel), or the 72px side margins
- [ ] No pixelation, banding or blur on the product. Embroidery detail stays crisp
- [ ] Copy matches `voice.md` (no shouting, no invented facts, ≤2 emoji in captions)
- [ ] Output files sit in `output/<platform>/<slug>/` and pass `npm run check:media -- output/<platform>/<slug>`

Report failures as a short list with the fix for each.

## Related skills

`social-post` (images) · `social-reel` (video) · `social-caption` (copy) · `buffer-publish` (scheduling)
