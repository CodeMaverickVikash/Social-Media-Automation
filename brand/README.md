# Monavi Collection — Brand Guide

**MONAVI · COLLECTION · Wear Your Story**

A fashion boutique for the whole family: bridal, festive, ladies, men's and kids wear. The brand mixes Indian heritage with a calm, modern, editorial look: *traditional roots, modern grace.*

Every post, reel and story made in this repo must follow this guide. Machine-readable values live in [brand.json](brand.json), and CSS variables live in [tokens.css](tokens.css). Voice and caption rules are in [voice.md](voice.md).

---

## 1. Folder map

| Path | What it holds |
|---|---|
| `brand.json` | Tokens: colours, type scale, logo variants, formats, video spec. **Single source of truth.** |
| `tokens.css` | The same tokens as CSS variables, plus local `@font-face` rules |
| `voice.md` | Tone, vocabulary, caption formulas, hashtags, CTAs |
| `fonts/` | Playfair Display and Montserrat variable fonts (SIL OFL) |
| `logo/svg/`, `logo/png/` | Official logo lockups. The PNGs are 4K. |
| `elements/` | Palette, typography, icon, pattern, texture and safe-space boards |
| `mockups/` | Bag, tag, box and guideline-book mockups (print reference) |
| `reference-posts/` | Approved poster examples. Match their composition and finish. |

## 2. Colour

| Swatch | Name | Hex | Role |
|---|---|---|---|
| ⬜ | Ivory | `#FAF9F6` | Primary background; logo colour on dark |
| ⬛ | Charcoal | `#1F1F1F` | Text; logo colour on light |
| 🌸 | Rose | `#D9A5A8` | Accent (ladies, bridal, soft highlights) |
| 🌿 | Sage | `#8A987A` | Accent (men's, kids, botanical motifs) |
| 🟫 | Beige | `#DCC8B1` | Secondary background, borders, avatar ring |

**Campaign colours** come from the approved posters. Use them **only** on photo-led creatives: Maroon `#560E24` (CTA pill), Deep Wine `#330C0D` (scrim), Champagne `#F5CDB4` (logo/headline on maroon), Antique Gold `#8E5E38`, Midnight `#06111A` (men's panel).

Rules:
- Use at most one accent per creative (Rose **or** Sage).
- Text sits on Ivory, Beige, Charcoal, or on a photo behind a gradient scrim. Never put text on raw Rose or Sage at small sizes.
- No neon, no pure `#000`, no pure `#FFF` backgrounds.

## 3. Typography

| Use | Font | Notes |
|---|---|---|
| Headlines, collection names | **Playfair Display** 400 | Large, tight leading (1.02–1.05), sentence case, often ends with a full stop: *"Everyday Style. Lasting Confidence."* |
| Sub-lines | Playfair Display 400 | Around 40px at 1080w |
| Attributes row | Montserrat 500 | `Elegant  \|  Comfortable  \|  Timeless`, ~26px |
| Labels, small caps | Montserrat 500, uppercase, tracking 0.32em | e.g. `CLASSIC  \|  MODERN  \|  VERSATILE` |
| CTA | Montserrat 500 | Inside a pill: `Explore Collection →` |

At most two fonts. No script, display or system fonts. Never bold Playfair headlines above 500. The posters get their elegance from regular weight at large size.

## 4. Logo

- The lockup is a 4-point star, a stylised **M** with a swoosh, then **MONAVI**, **COLLECTION**, a hairline rule, and **WEAR YOUR STORY**.
- Default placement on posts: **top-left** at ~300px wide (on a 1080 canvas), or top-centre on symmetric layouts.
- Colour: Charcoal on light, Ivory on dark, Champagne on festive maroon photography.
- Clear space: at least the star's height on every side. Minimum size: 20px web, 8mm print.
- On photos, use the **transparent inline lockup** the renderer generates (`logoSvg()` in `scripts/lib/brand.ts`). Do not use the PNGs, which have an ivory background baked in.
- Never stretch, rotate, outline, shadow, recolour, or re-type the logo.

## 5. Layout DNA (from `reference-posts/`)

Every approved poster uses this structure:

1. **Logo lockup**, top-left
2. **Headline** in Playfair, 2–4 short lines
3. **Sub-line or attributes row** in Montserrat with ` | ` separators
4. **CTA pill** with a right arrow (`Explore Collection →`, `Explore Now →`)
5. **Category badge**, bottom-left: line icon + hairline + "Ladies Wear" / "Men's Wear" / "Kids Wear"
6. **Photography** fills the right side or the full bleed. A soft gradient scrim on the text side keeps type legible.

Three proven compositions:
- **Overlay**: full-bleed photo, scrim from the left or bottom (festive, bridal, ladies)
- **Split**: solid colour panel left (~42%), photo right (men's)
- **Card**: no photo, ivory/beige with a botanical pattern (announcements, offers, greetings, store info)

## 6. Imagery

- Warm, soft, editorial light. Heritage settings: arches, jharokhas, lanterns, marigolds, palms.
- Real garments are the hero. Never distort embroidery or colour of the product.
- **Resolution:** source photos must cover the area they fill at **1× minimum, 2× ideal**. For a full-bleed 4:5 post that means ≥1080×1350 px, ideally 2160×2700. Reels add 1.08× for the zoom. The renderer fails below 1× and warns between 1× and 2× (`scripts/lib/quality.ts`). Finished files are checked by `scripts/check-media.ts`.
- The pattern PNGs in `elements/` are only 748px wide. Use them as reference only. Templates draw botanicals as vectors (`sprigSvg()`) so they stay crisp.

## 7. Platform formats

| Key | Size | Use |
|---|---|---|
| `ig-feed` | 1080×1350 (4:5) | Default IG + FB feed post |
| `ig-feed-3x4` | 1080×1440 (3:4) | IG grid-native portrait |
| `square` | 1080×1080 | Carousels, WhatsApp broadcast |
| `story` | 1080×1920 (9:16) | Stories, WhatsApp Status, reel cover |
| `fb-landscape` | 1200×630 | FB link/event posts |
| Reel / Short | 1080×1920, 30fps, H.264 | 9–15s sweet spot |

Story and reel safe zones: keep text out of the top 250px, the bottom 340px (stories) or 400px (reels), and 72px at each side.

## 8. Quality bar (no pixelation)

- Images render at **2× supersampling**, then downscale with Lanczos to the exact delivery size. Output is a JPEG at quality 95 with 4:4:4 chroma (no colour bleed on maroon/rose text), plus a lossless PNG master.
- Video uses lossless PNG frames encoded to H.264 High, CRF 16, yuv420p, 30fps, `+faststart`, with a 20 Mbps cap. That is the highest quality Instagram and Facebook keep without re-encoding artefacts getting worse.
- Never upload anything smaller than the delivery size. Never upscale a low-res photo to "fit".
