---
name: create-social-banner
description: Create a Monavi banner for Facebook: the Page cover banner (1640×624) or a wide event or link banner (1200×630), with or without a photo. Use when asked for a banner, Facebook cover, page cover, cover photo, event banner or wide header image. Opens a PR; the cover itself is set in Facebook by hand.
argument-hint: "<what it says> [photo path] [cover | event] e.g. Facebook cover for the wedding collection"
---

# Create a social media banner

A banner is a **wide** creative: text on the left, an optional photo on the right. It follows the same pipeline as `create-social-content` (readiness check, brief, render, brand review, PR). Read that skill first. Only the steps below change.

## Which banner

| The user wants | Format | File | How it goes live |
|---|---|---|---|
| **Facebook Page cover** ("cover", "page banner", "header") | `fb-cover` 1640×624 | `output/facebook/<slug>/fb-cover.jpg` | **By hand**: Facebook Page → Edit cover photo. Buffer can't change a cover |
| **Event, sale or link banner** ("event banner", "wide post") | `fb-landscape` 1200×630 | `output/facebook/<slug>/fb-landscape.jpg` | Scheduled as a Facebook post (`"file": "fb-landscape.jpg"` in the plan) |

If it isn't clear which one, make the Page cover, and say that `fb-landscape` can be added.
Instagram and WhatsApp have no banner slot, so don't produce banner files for them. For a wide image on those, use `create-social-poster`.

## Layout (`render-social-post`, template `banner`)

```json
{
  "slug": "banner-wedding-collection-2026-11",
  "template": "banner",
  "theme": "festive",
  "formats": ["fb-cover"],
  "platforms": ["facebook"],
  "photo": "assets/photos/<slug>/bride-01.jpg",
  "focus": "50% 30%",
  "eyebrow": "Bridal Collection",
  "headline": "Timeless Elegance\nfor Your Special Day.",
  "cta": "Visit the Store"
}
```

- **With a photo:** it sits in the right 42% and fades into the panel. A portrait photo with the subject near the top works best (adjust `focus`). Needs about 700 px of photo width at 1×.
- **Without a photo:** botanical sprigs fill the right side. This is the safe default for a brand or festival cover.
- Fields: `eyebrow`, `headline` (2 short lines), `subline` **or** `attrs`, `cta`. There is no badge on banners.
- The `fb-cover` safe zone is built in: text stays inside the centre 1280 px, because mobile crops the sides and the profile photo covers the lower left on desktop.
- The renderer refuses the `banner` template on portrait or square formats, and refuses other templates on `fb-cover`.

Themes: `light`, `ladies`, `dark`, `festive`, `mens`, `kids`, `sage`. Photo-led covers look best on the product's own theme.

## Copy rules

- Short. A cover is seen for a second: one headline and at most one CTA.
- No prices, offers, addresses or timings unless the user gave them or they're in `brand/brand.json → contact`.
- A cover is evergreen, so prefer brand or season lines ("Traditional Roots, Modern Grace.") over dated offers, which go stale.

## Slug, caption and PR

Slug: `banner-<topic>-<yyyy-mm>`.
- **Cover only:** there is nothing to caption or schedule. Skip the schedule plan. The PR just carries the files for review, and merging schedules nothing. In the report, say clearly: *"Set it yourself: Facebook Page → Edit cover photo → upload `output/facebook/<slug>/fb-cover.jpg`."*
- **`fb-landscape` as a post:** write a Facebook caption (`write-social-captions`), add a plan item for `facebook` with `"file": "fb-landscape.jpg"`, and open the PR as usual.

## Report

The PR link, a preview of the banner (Read it), what to do by hand if it's a cover, and any photo-size warnings.
