---
name: create-social-content
description: Create the full Monavi social media set from a product photo: feed post, story, square and reel for Instagram, Facebook and WhatsApp, with captions, then open a PR that schedules it in Buffer on merge. The user gives a photo and says what it is and who it is for (e.g. "kurta pajama for men", "lehenga for bride", "kids frock"). Use for product posts, stories, reels and campaigns. For a poster (greeting, offer, announcement) use create-social-poster, for a Facebook cover or wide banner use create-social-banner.
argument-hint: "<photo paths…> <product> for <men|women|bride|groom|kids> [occasion] [platforms] [dates/times] [facts: price, offer…]"
---

# Make content for each platform

**One command → a ready-to-merge PR.** Like `/new-blog` in the automation repo, this skill runs end to end **without stopping for approval**: import → plan → render → captions → QA → brand review → schedule plan → branch `content/<slug>` → push → PR. Invoking it is the user's go-ahead to push the content branch and open the PR. **The PR is the review step.** The user checks the images and captions in "Files changed", edits captions and times on GitHub, or runs `/edit-social-content` for anything else (see §4), and **merging is the approval** that schedules it in Buffer. Nothing reaches Buffer before the merge.

Example: `/create-social-content D:\shoot\kurta-01.jpg D:\shoot\kurta-02.jpg kurta pajama for men, festive, Instagram + WhatsApp, post on 20 Nov`

**Posters and banners have their own skills:** a greeting, offer or announcement poster goes to `create-social-poster`, and a Facebook cover or wide banner goes to `create-social-banner`. If the request is one of those, switch to it. Both follow this pipeline.

**Rule: every Monavi post and reel is made through the skills.** Never hand-write HTML, edit images in an ad-hoc script, or encode video outside `scripts/render-*.ts`. If the templates can't do something, extend them inside the matching skill's workflow and keep the quality gate. Don't work around it.

## 0. Readiness check (always first, takes seconds)

Run `npm run doctor` before importing or rendering anything.
- **✗ (blocking):** stop. Tell the user each item and its fix in plain words, and don't render. Rendering first would only end in a failed push or a failed PR check.
- **! (warning):** mention it in one line and continue.

## 1. Intake: photo + product + who it's for

The user may simply provide a product name or text (e.g. *"kurta pajama"*, *"festive lehenga"*, *"kids frock"*). **Autonomously decide the audience, collection, reference archetype, and badge** from the garment type without pausing or asking questions.

### Autonomous Audience & Archetype Decision Matrix

| Garment Keyword in Prompt | Inferred Audience (`for`) | Badge & Icon | Reference Archetype (`brand/reference-posts/`) | Layout & Theme Default |
|---|---|---|---|---|
| **Kurta Pajama, Kurta, Sherwani, Nehru Jacket, Men's Shirt, Pathani** | `men` (or `kids` if "boy/child" mentioned) | `Men's Wear` (`shirt`) or `Kids Wear` (`kids`) | `mens-everyday-style.png` (everyday/smart) or `festive-collection-duo.png` (festive) | `split` (dark/midnight) or `overlay` (`festive`) |
| **Lehenga, Bridal Gown, Heavy Saree, Trousseau** | `bride` / `women` | `Bridal` (`lotus`) | `bridal-collection.png` | `overlay` (`festive` deep wine/maroon) |
| **Saree, Anarkali, Salwar Suit, Festive Saree** | `women` | `Ladies Wear` (`dress`) | `festive-collection-single.png` | `overlay` (`festive`) |
| **Kurti, Everyday Dress, Cotton Suit** | `women` | `Ladies Wear` (`dress`) | `ladies-wear-style-that-feels-like-you.png` | `overlay` (`ladies`) or `split` |
| **Frock, Kids Ethnic Set, Kids Kurta, Little Ghagra** | `kids` (boys or girls) | `Kids Wear` (`kids`) | `kids-wear-little-styles.jpeg` | `arch` or `overlay` (`kids` / `sage`) |

Collect & set:

| Input | How |
|---|---|
| **Product photo(s)** | A file path the user gives, or an image they attach. Import every photo: `npm run import:photo -- "<path>" [more…] --slug <slug>`. **No photo:** Claude draws an illustration locally with `npm run draw:product` or pairs with an approved reference post mood visual. |
| **Product** | Match to `brand/brand.json → products`. If not listed, add it with appropriate attributes and hashtags. |
| **For whom** | Autonomously deduced using the matrix above (Men, Women, Kids/Boys/Girls, Bridal). Decides badge, icons, and tone. |
| **Occasion** | Autonomously deduced from context: wedding, festive, everyday, or celebration. |
| **Photo type** | **Model photo** → `overlay` template. **Product only** (hanger/mannequin/flat lay) → `arch` template. **Clean product/editorial** → `split`. Always mirror the finish of the matched reference archetype. |
| **Facts** | Prices, dates, address. Only take from `brand.json → contact` or user input. Never invent. |

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

1. **`monavi-brand-rules`**: load the rules, and look at the matching `brand/reference-posts/`.
2. **`render-social-post`**: write `content/posts/<slug>.json`. Use the product entry for `theme`, `badge.icon`, `attrs`, and the right template for the photo type. Formats: `["ig-feed","story","square"]`. Render it, review every image, and fix anything that fails.
3. **`render-social-reel`** (if planned): write `content/reels/<slug>.json` from the same photos. Use the same headline wording so the set feels like one campaign. Render, then review the frames.
4. **`write-social-captions`**: write a separate `caption.txt` for each platform folder. Add the product entry's `hashtags` to `#MonaviCollection #WearYourStory`. You can delegate this step to the **`caption-writer`** agent (it follows the same skill), for example when captioning several slugs in parallel.
5. **QA:** `npm run check:media -- output/instagram/<slug> output/facebook/<slug> output/whatsapp/<slug>` must pass.
6. **Brand review (required):** run the **`monavi-brand-guardian`** agent on the slug. Fix every blocking issue yourself through the matching skill (re-render or rewrite, never by hand), then run the agent again. Allow at most **2 fix rounds**.
7. **`open-content-pr`** (straight away, no approval pause): write `content/schedule/<slug>.json`. Use the user's dates if given. Otherwise pick the defaults from `publish-social-now` "Good posting times": the post at the next 19:00 IST that is at least 24 h away, the story 5 min after it, and the reel the next day at 19:30. For a festival or wedding occasion with a known date, post 7–10 days before it. Validate and dry-run the plan, then branch, commit, push and open the PR. **Merging the PR schedules Instagram and Facebook in Buffer through GitHub Actions.** WhatsApp is shared manually from `output/whatsapp/<slug>/`.
8. **Report:** the PR URL, a preview of the key image (Read it), the plan table with the chosen times, the captions, the brand-review verdict, and any defaults the user may want to change. End with: *"Review and edit in the PR. Merging schedules it."*
   - Use `publish-social-now` (the local CLI) only for urgent one-off posts the user explicitly wants without a PR.

### When to stop instead of pushing

Like `/new-blog` stopping at `draft`, **don't push** in these cases. Leave everything local, say what's wrong and what's needed, and continue once the user answers:
- An import or the quality gate fails (photo too small for every layout). Ask for a bigger original. Never use `--allow-lowres`.
- `monavi-brand-guardian` returns `ESCALATE`, or still isn't `PASS` after 2 fix rounds.
- The creative needs a fact the user didn't give and `brand.json → contact` doesn't have (price, offer dates, store event). Never invent one. If the piece works without it, drop it and carry on.
- The render uses AI imagery (`aiGenerated: true`). Say once that Meta requires disclosure for realistic AI, push with `aiDisclosure` off (the default), and let the user change it in the PR.

## 4. Editing after the PR is open

Until it's merged, everything in the PR can be changed. Captions and times can be edited right on GitHub (Files changed → ⋯ → Edit file). For anything else, the user runs **`/edit-social-content <slug> <change>`** (see the `edit-social-content` skill). It pulls the branch, re-renders through the skills, repeats QA and the brand review, and pushes to the same PR. Tell the user this in the final report.

## 5. Platform-specific variations (only when it helps)

- **Offers or contact details for WhatsApp**: a `card` post (`square` + `story`) with a `footnote` holding the store info, as a separate slug `<slug>-wa`.
- **Facebook event or store opening**: add `fb-landscape` to the post formats.
- **Instagram carousel**: render 2–5 post briefs sharing a theme (`<slug>-1`, `<slug>-2`, …).

## Quality bar (never relaxed)

The quality gate blocks low-resolution photos. If a photo fails, ask for a bigger original. Every delivered file is exactly the platform size and passes `check:media`. The PR check enforces all of this again before anything can be scheduled.
