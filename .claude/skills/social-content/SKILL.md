---
name: social-content
description: Single entry point for creating Monavi social media content — the user gives a product photo and says what it is and who it's for (e.g. "kurta pajama for men", "lehenga for bride", "kids frock"), or an occasion ("Diwali post", "store timings"), and this skill produces the right posts, stories and reels for Instagram, Facebook and WhatsApp, then raises a PR that schedules them in Buffer on merge. Use for ANY request to make, plan or prepare posts, reels, stories, statuses or campaigns.
---

# Make content for each platform

**Rule: every Monavi post and reel is made through the skills.** Never hand-write HTML, edit images in an ad-hoc script, or encode video outside `scripts/render-*.ts`. If the templates can't do something, extend them inside the matching skill's workflow and keep the quality gate. Don't work around it.

## 1. Intake: photo + product + who it's for

The typical request is: *"[photo] kurta pajama for men, festive"*. Collect:

| Input | How |
|---|---|
| **Product photo(s)** | A file path the user gives, or an image they attach. Import every photo (this copies it without re-compressing and reports which layouts it is big enough for): `npm run import:photo -- "<path>" [more…] --slug <slug>` |
| **Product** | Match it to a key in `brand/brand.json → products` (kurta-pajama, sherwani, nehru-jacket, mens-shirt, lehenga, saree, anarkali, kurti, salwar-suit, gown, kids-ethnic-set, kids-kurta-pajama, kids-frock). That gives `collection`, `theme`, `icon`, default `template`, `attrs`, `hashtags`. If the product isn't listed, add an entry to `brand.json → products` in the same style, then continue |
| **For whom** | men / women / bride / groom / kids, from the user's words or the product entry. It decides the badge label (Men's Wear / Ladies Wear / Kids Wear / Bridal) and the copy angle |
| **Occasion** (optional) | festive / wedding / everyday / offer. Festive or wedding switches the theme to `festive` (use `festiveTheme` where present) |
| **Photo type** | Look at the photo (Read it). **Model wearing it** → `overlay` template. **Product only** (hanger, mannequin, flat lay, plain background) → `arch` template. Clean product on a strong background with room for text → `split` |
| **Facts** | prices, offer dates, address. Only take them from the user or `brand.json → contact`. Never invent them |

Slug: `<product>-<occasion|topic>-<yyyy-mm>`, e.g. `kurta-pajama-festive-2026-11`.

Use the import report to decide the deliverables: any layout marked ✗ is not allowed. If the reel line is ✗, skip the reel (or ask for more and bigger photos). Never use `--allow-lowres` for real content.

## 2. Plan the deliverables per platform

Default matrix. Trim it to the requested platforms and show the user the plan in one short table before rendering:

| Platform | Post | Story / Status | Reel / video | Caption style |
|---|---|---|---|---|
| **Instagram** | `ig-feed` 4:5 | `story` 9:16 | `reel.mp4` 7–15s + cover | hook + details + CTA + 5–10 hashtags |
| **Facebook** | `ig-feed` 4:5 (`fb-landscape` for events) | `story` 9:16 | same `reel.mp4` | warmer, more informative, 2–4 hashtags |
| **WhatsApp** | `square` 1:1 (broadcast / catalogue) | `story` 9:16 (Status) | `reel.mp4` ≤ 60s | personal, 1–3 lines, no hashtags |

- **One photo:** post + story + square (no reel; a reel needs ≥ 2 strong photos to feel alive).
- **2–4 photos:** post + story + square + reel.
- One slug covers the whole set, so all the files for a platform land together in `output/<platform>/<slug>/`.

## 3. Produce, using the other skills in order

1. **`monavi-brand`**: load the rules, and look at the matching `brand/reference-posts/`.
2. **`social-post`**: write `content/posts/<slug>.json`. Use the product entry for `theme`, `badge.icon`, `attrs`, and the right template for the photo type. Formats: `["ig-feed","story","square"]`. Render it, review every image, and fix anything that fails.
3. **`social-reel`** (if planned): write `content/reels/<slug>.json` from the same photos. Use the same headline wording so the set feels like one campaign. Render, then review the frames.
4. **`social-caption`**: write a separate `caption.txt` for each platform folder. Add the product entry's `hashtags` to `#MonaviCollection #WearYourStory`.
5. **QA:** `npm run check:media -- output/instagram/<slug> output/facebook/<slug> output/whatsapp/<slug>` must pass.
6. **Hand-off:** show the user, per platform, the files, a preview of the key image (Read it), and the captions. Ask for changes or approval.
7. **`content-pr`** (after approval): write `content/schedule/<slug>.json` with the dates and times, validate it, and open a PR. **Merging the PR schedules Instagram and Facebook in Buffer through GitHub Actions.** WhatsApp is shared manually from `output/whatsapp/<slug>/`.
   - Use `buffer-publish` (the local CLI) only for urgent one-off posts the user explicitly wants without a PR.

## 4. Platform-specific variations (only when it helps)

- **Offers or contact details for WhatsApp**: a `card` post (`square` + `story`) with a `footnote` holding the store info, as a separate slug `<slug>-wa`.
- **Facebook event or store opening**: add `fb-landscape` to the post formats.
- **Instagram carousel**: render 2–5 post briefs sharing a theme (`<slug>-1`, `<slug>-2`, …).

## Quality bar (never relaxed)

The quality gate blocks low-resolution photos. If a photo fails, ask for a bigger original. Every delivered file is exactly the platform size and passes `check:media`. The PR check enforces all of this again before anything can be scheduled.
