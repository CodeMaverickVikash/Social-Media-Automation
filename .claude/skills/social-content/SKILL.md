---
name: social-content
description: Single entry point for creating Monavi social media content — the user gives a product photo and says what it is and who it's for (e.g. "kurta pajama for men", "lehenga for bride", "kids frock"), or an occasion ("Diwali post", "store timings"), and this skill produces the right posts, stories and reels for Instagram, Facebook and WhatsApp, then raises a PR that schedules them in Buffer on merge. Use for ANY request to make, plan or prepare posts, reels, stories, statuses or campaigns.
argument-hint: "<photo paths…> <product> for <men|women|bride|groom|kids> [occasion] [platforms] [dates/times] [facts: price, offer…]"
---

# Make content for each platform

**One command → a ready-to-merge PR.** Like `/new-blog` in the automation repo, this skill runs end to end **without stopping for approval**: import → plan → render → captions → QA → brand review → schedule plan → branch `content/<slug>` → push → PR. Invoking it is the user's go-ahead to push the content branch and open the PR. **The PR is the review step.** The user checks the images and captions in "Files changed", edits anything (see §4), and **merging is the approval** that schedules it in Buffer. Nothing reaches Buffer before the merge.

Example: `/social-content D:\shoot\kurta-01.jpg D:\shoot\kurta-02.jpg kurta pajama for men, festive, Instagram + WhatsApp, post on 20 Nov`

**Rule: every Monavi post and reel is made through the skills.** Never hand-write HTML, edit images in an ad-hoc script, or encode video outside `scripts/render-*.ts`. If the templates can't do something, extend them inside the matching skill's workflow and keep the quality gate. Don't work around it.

## 1. Intake: photo + product + who it's for

The typical request is: *"[photo] kurta pajama for men, festive"*. Collect:

| Input | How |
|---|---|
| **Product photo(s)** | A file path the user gives, or an image they attach. Import every photo (this copies it without re-compressing and reports which layouts it is big enough for): `npm run import:photo -- "<path>" [more…] --slug <slug>`. **No photo:** Claude draws an illustration locally with `npm run draw:product` (see `social-post` §1). This is for mood/campaign posts only, with collection-level copy |
| **Product** | Match it to a key in `brand/brand.json → products` (kurta-pajama, sherwani, nehru-jacket, mens-shirt, lehenga, saree, anarkali, kurti, salwar-suit, gown, kids-ethnic-set, kids-kurta-pajama, kids-frock). That gives `collection`, `theme`, `icon`, default `template`, `attrs`, `hashtags`. If the product isn't listed, add an entry to `brand.json → products` in the same style, then continue |
| **For whom** | men / women / bride / groom / kids, from the user's words or the product entry. It decides the badge label (Men's Wear / Ladies Wear / Kids Wear / Bridal) and the copy angle |
| **Occasion** (optional) | festive / wedding / everyday / offer. Festive or wedding switches the theme to `festive` (use `festiveTheme` where present) |
| **Photo type** | Look at the photo (Read it). **Model wearing it** → `overlay` template. **Product only** (hanger, mannequin, flat lay, plain background) → `arch` template. Clean product on a strong background with room for text → `split` |
| **Facts** | prices, offer dates, address. Only take them from the user or `brand.json → contact`. Never invent them |

Slug: `<product>-<occasion|topic>-<yyyy-mm>`, e.g. `kurta-pajama-festive-2026-11`.

**Planning a week, month or season** (no single photo or product yet)? Run the **`monavi-content-strategist`** agent first. It returns a table of slugs with occasions, deliverables, photo status and suggested times. Then make each slug through this skill, one at a time.

Use the import report to decide the deliverables: any layout marked ✗ is not allowed. If the reel line is ✗, skip the reel (or ask for more and bigger photos). Never use `--allow-lowres` for real content.

## 2. Plan the deliverables per platform

Default matrix. Trim it to the requested platforms. Print the plan as one short table and **carry on without waiting**. Anything the user didn't specify takes the default here, and they can change it in the PR:

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
4. **`social-caption`**: write a separate `caption.txt` for each platform folder. Add the product entry's `hashtags` to `#MonaviCollection #WearYourStory`. You can delegate this step to the **`caption-writer`** agent (it follows the same skill), for example when captioning several slugs in parallel.
5. **QA:** `npm run check:media -- output/instagram/<slug> output/facebook/<slug> output/whatsapp/<slug>` must pass.
6. **Brand review (required):** run the **`monavi-brand-guardian`** agent on the slug. Fix every blocking issue yourself through the matching skill (re-render or rewrite, never by hand), then run the agent again. Allow at most **2 fix rounds**.
7. **`content-pr`** (straight away, no approval pause): write `content/schedule/<slug>.json`. Use the user's dates if given. Otherwise pick the defaults from `buffer-publish` "Good posting times": the post at the next 19:00 IST that is at least 24 h away, the story 5 min after it, and the reel the next day at 19:30. For a festival or wedding occasion with a known date, post 7–10 days before it. Validate and dry-run the plan, then branch, commit, push and open the PR. **Merging the PR schedules Instagram and Facebook in Buffer through GitHub Actions.** WhatsApp is shared manually from `output/whatsapp/<slug>/`.
8. **Report:** the PR URL, a preview of the key image (Read it), the plan table with the chosen times, the captions, the brand-review verdict, and any defaults the user may want to change. End with: *"Review and edit in the PR. Merging schedules it."*
   - Use `buffer-publish` (the local CLI) only for urgent one-off posts the user explicitly wants without a PR.

### When to stop instead of pushing

Like `/new-blog` stopping at `draft`, **don't push** in these cases. Leave everything local, say what's wrong and what's needed, and continue once the user answers:
- An import or the quality gate fails (photo too small for every layout). Ask for a bigger original. Never use `--allow-lowres`.
- `monavi-brand-guardian` returns `ESCALATE`, or still isn't `PASS` after 2 fix rounds.
- The creative needs a fact the user didn't give and `brand.json → contact` doesn't have (price, offer dates, store event). Never invent one. If the piece works without it, drop it and carry on.
- The render uses AI imagery (`aiGenerated: true`). Say once that Meta requires disclosure for realistic AI, push with `aiDisclosure` off (the default), and let the user change it in the PR.

## 4. Editing after the PR is open

Until it's merged, everything in the PR can be changed:

| What to change | How |
|---|---|
| Caption text, hashtags | Edit `output/<platform>/<slug>/caption.txt` directly on GitHub (PR → Files changed → ⋯ → Edit file), or ask Claude |
| Dates, times, platforms, draft/AI flags | Edit `content/schedule/<slug>.json` directly on GitHub, or ask Claude |
| Headline, attrs, CTA, layout, theme, photos, reel | **Ask Claude** (e.g. *"change the headline on kurta-pajama-festive-2026-11 to …"*). The images are rendered locally, so editing the brief JSON on GitHub does **not** update them |

The **Content check** runs again on every push to the PR. When the user asks for a change to an open PR:
1. `git fetch origin && git switch content/<slug> && git pull --ff-only`. This pulls in any edits the user made on GitHub.
2. Make the change through the matching skill: edit the brief, then re-render (`social-post`/`social-reel`) or rewrite captions (`social-caption`).
3. QA plus `monavi-brand-guardian` again, then `npm run plan -- validate content/schedule/<slug>.json`.
4. `git commit -m "content: <slug> - <what changed>"` and `git push`. The open PR updates. Don't open a new PR.

## 5. Platform-specific variations (only when it helps)

- **Offers or contact details for WhatsApp**: a `card` post (`square` + `story`) with a `footnote` holding the store info, as a separate slug `<slug>-wa`.
- **Facebook event or store opening**: add `fb-landscape` to the post formats.
- **Instagram carousel**: render 2–5 post briefs sharing a theme (`<slug>-1`, `<slug>-2`, …).

## Quality bar (never relaxed)

The quality gate blocks low-resolution photos. If a photo fails, ask for a bigger original. Every delivered file is exactly the platform size and passes `check:media`. The PR check enforces all of this again before anything can be scheduled.
