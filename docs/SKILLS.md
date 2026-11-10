# Skills guide

**Skills are the only interface.** You type a skill command in Claude Code, Claude does the rest: the terminal commands, the rendering, the Git work and the PR. You never run `npm` or `git` yourself. Everything under `scripts/` is a tool the skills use.

You can also just describe what you want in your own words, and Claude picks the right skill. The same commands work in Google Antigravity: see [ANTIGRAVITY.md](ANTIGRAVITY.md). The commands below are the shortcuts.

## At a glance

| I want to… | Command | Changes anything? |
|---|---|---|
| Get ready for the first time, or fix a broken setup | `/setup-social-automation` | Local setup only. Asks before pushing |
| Decide what to post this week or month | `/plan-social-content` | A plan file only. Makes no content |
| **Make posts, stories and a reel from a product photo** | **`/create-social-content`** | Opens a PR. Nothing is scheduled until you merge |
| Make a **poster**: festival greeting, offer, announcement | `/create-social-poster` | Opens a PR. Nothing is scheduled until you merge |
| Make a **banner**: Facebook cover or event banner | `/create-social-banner` | Opens a PR. The cover is set by hand in Facebook |
| Change something that is in an open PR | `/edit-social-content` | Updates the same PR |
| See what is pending, scheduled, or due on WhatsApp today | `/check-social-status` | Read only |
| Free disk space | `/clean-social-output` | Deletes regenerable local files only |
| Post something urgent right now, outside the PR flow | `/publish-social-now` | Goes to Buffer. Asks first |

A normal week uses three of them: **`/create-social-content`** (or the poster or banner command) to make, a review in the PR (plus `/edit-social-content` for changes), and a merge. `/check-social-status` tells you what to share on WhatsApp each day.

---

## `/setup-social-automation`: get ready, or repair

**Use it when**
- This is the first time on this computer or repo.
- A run failed with a missing tool, Buffer channel or GitHub permission error.
- You connected a new Instagram or Facebook account in Buffer (`/setup-social-automation refresh channels`).
- You want to know "is everything ready?" before a busy week.

**Examples**
```
/setup-social-automation
/setup-social-automation refresh channels
```

**What Claude does:** checks Node, dependencies, the renderer, ffmpeg, Buffer channels, GitHub sign-in and write access, and that the repo is public. It installs what is missing and fetches the Buffer channel ids through GitHub on its own. If the tooling isn't on `main` yet, it offers to open a PR for it.

**What you get:** a checklist of ✓ done and ✗ needs you.

**Only you can do these** (Claude tells you each one): get write access to the repo, add `BUFFER_API_KEY` as a GitHub secret (never paste it in chat), connect Instagram and the Facebook Page in Buffer, and give the store's contact details (phone, address, hours).

---

## `/plan-social-content`: what should we post?

**Use it when**
- It's the start of a week or month and you need a calendar.
- A festival or the wedding season is coming and you want content ready 7–10 days before.
- The store staff need a **shoot list**: which pieces to photograph, for whom, how many photos, by when.
- Someone asks "what should we post next?"

**Examples**
```
/plan-social-content December
/plan-social-content Diwali week, men's and kids
/plan-social-content wedding season, bridal and groom
```

**What Claude does:** looks up and checks festival dates, balances bridal, ladies, men's and kids wear, and works out a slug, deliverables and posting day for each piece. It saves the plan as `content/plans/<yyyy-mm>.md`.

**What you get:** a table of the planned posts and a shoot list you can forward to the store. Dates that can't be confirmed are marked `date TBC`, never guessed. Any offer, price or store event the plan needs is listed as something for you to provide.

**Then:** when photos arrive, run `/create-social-content` with the photos. It already knows the product, audience, occasion and date from the plan.

---

## `/create-social-content`: make it (the main command)

**Use it when**
- You have product photos: *"kurta pajama for men, festive"*.
- You want only some platforms: *"lehenga for bride, Instagram and WhatsApp only"*.
- It's a text-only announcement: *"store timing card for WhatsApp"*.
- You have **no photo**: Claude draws a mood illustration for a collection-level campaign post. It makes no claims about a specific piece, fabric, colour or price.
- It's a festival greeting, offer or store update.

**Examples**
```
/create-social-content D:\shoot\kurta-01.jpg D:\shoot\kurta-02.jpg kurta pajama for men, festive, post on 20 Nov
/create-social-content C:\shoot\lehenga.jpg lehenga for bride, wedding season, Instagram and WhatsApp only
/create-social-content Diwali greeting for the whole family, no photo
/create-social-content store timing update card for WhatsApp: open 11am–9pm, closed Tuesday
```

**What Claude does, without stopping to ask:** readiness check → photo import (and a check that each photo is big enough) → per-platform plan → renders post, story, square and reel → one caption per platform → quality check → brand review → schedule with default times unless you gave dates → branch → **PR**.

**What you get:**

| Deliverable | Instagram | Facebook | WhatsApp |
|---|---|---|---|
| Feed post | ✓ | ✓ | square for broadcast and catalogue |
| Story / Status | ✓ | ✓ | ✓ |
| Reel (with 2 or more good photos) | ✓ | ✓ | ✓ as a Status video |
| Caption | hook + hashtags | warmer, 2–4 hashtags | short, no hashtags |

Plus a PR link and a preview image. **Merging the PR schedules Instagram and Facebook in Buffer.** WhatsApp is shared by hand.

**It stops and tells you instead of pushing when**
- A photo is too small for every layout (ask for the original camera file; it never upscales).
- The brand review fails twice, or needs a decision from you.
- The post needs a price, offer or address you haven't given and the store details don't have. It never invents one.
- The readiness check finds something blocking (then run `/setup-social-automation`).

**Defaults you can change in the PR:** all platforms, evening posting times in India time (post at 19:00, story 5 minutes later, reel the next day at 19:30), and festive or wedding content 7–10 days ahead.

---

## `/create-social-poster`: greetings, offers, announcements

**Use it when**
- A **festival or occasion greeting**: Diwali, Eid, Navratri, Raksha Bandhan, New Year.
- An **offer or sale** announcement (you give the terms).
- A **new collection** or "new arrivals" message.
- A **store update**: new timings, a store event, a holiday closure.
- A **quote card** or brand message.
- You have **no photo**. A text poster needs none.

**Examples**
```
/create-social-poster Diwali greeting for the whole family, post on 28 Oct
/create-social-poster new bridal collection announcement, photo D:\shoot\bride-01.jpg
/create-social-poster store open till 10pm this week for Diwali shopping
```

**What Claude does:** the same one-command flow as `/create-social-content`, with poster layouts: a text poster (`card`) when there is no photo, or a photo poster (`overlay`, `arch` or `split`) when there is one. It renders the feed (4:5), story (9:16) and WhatsApp square (1:1) versions, writes a caption per platform, runs the quality and brand checks, schedules it and opens the PR.

**What you get:** the three sizes for each platform, captions, and a PR. Merging schedules Instagram and Facebook. WhatsApp is shared by hand.

**It never invents** a discount, price, date, address or timing. If an offer poster has no terms, Claude asks once, and if they're still missing it makes a non-offer poster and says what was left out.

---

## `/create-social-banner`: Facebook cover and event banners

**Use it when**
- You want a **Facebook Page cover** (`fb-cover`, 1640×624), for example a new season cover.
- You want an **event or sale banner** for a Facebook post (`fb-landscape`, 1200×630).
- You want a wide header image with text on the left and a photo on the right.

**Examples**
```
/create-social-banner Facebook cover for the wedding collection
/create-social-banner Facebook cover, men's wear, photo D:\shoot\kurta-01.jpg
/create-social-banner event banner for the Diwali exhibition on 2 Nov
```

**What Claude does:** the same flow as `/create-social-content`, with the wide `banner` layout: text on the left, the photo on the right fading into the panel. With no photo, botanical sprigs fill the right side. The cover's safe zone is built in, so text stays inside the centre 1280 px that mobile always shows.

**What you get:** `fb-cover.jpg` and/or `fb-landscape.jpg` in `output/facebook/<slug>/`, and a PR to review.

**One manual step:** Buffer cannot change a Page cover. After merging, upload the file yourself: Facebook Page → Edit cover photo. An event banner (`fb-landscape`) *is* scheduled as a normal Facebook post. Instagram and WhatsApp have no banner slot, so no banner files are made for them.

---

## `/edit-social-content`: change it

**Use it when**
- You want a different **headline, layout, photo or reel**.
- You want to change a **caption or hashtags**.
- You want to **move the date or time**, or drop a platform.
- You want to **cancel** a PR before merging.
- A post is **already merged** and needs a change.

**Examples**
```
/edit-social-content kurta-pajama-festive-2026-11 make the headline shorter
/edit-social-content PR 12 move the post to Saturday 7pm
/edit-social-content sherwani-wedding-2026-11 drop the reel from Facebook
/edit-social-content PR 12 cancel
```

**What Claude does:** pulls the PR branch (including any edits you made directly on GitHub), applies the change through the matching skill, re-renders when the image changes, repeats the quality and brand checks, and pushes to the **same PR**.

**Quick edits you can make yourself on GitHub, without Claude:** caption text (`output/<platform>/<slug>/caption.txt`) and times (`content/schedule/<slug>.json`). Image changes always go through Claude, because the images are rendered locally.

**After the merge:** scheduled posts can't be changed by editing the plan (merged plans are never re-posted). Claude explains what to change in Buffer, and offers a new version `<slug>-v2` if the content itself needs to change.

---

## `/check-social-status`: where is everything?

**Use it when**
- You start the day and want to know what to share on **WhatsApp today** (the one manual step).
- You want to know which PRs are waiting for review.
- You want to know what is scheduled in Buffer and when.
- You wonder why something didn't go out (a failed check or run).

**Examples**
```
/check-social-status
/check-social-status today
/check-social-status this week
```

**What you get:** five short tables: planned, waiting for review, scheduled, **WhatsApp to share** (with the exact files and caption text ready to copy), and problems. It ends with the one most useful next action. It changes nothing.

---

## `/clean-social-output`: tidy up

**Use it when**
- The `output/` folder is taking too much space (2× master images and reels are large).
- Content that is **already merged and posted** is still sitting in the repo and you want it gone.
- Old `content/...` branches have piled up after many merges (one is left behind for every piece).
- Old monthly plans and half-started drafts are cluttering `content/`.
- You want a health check: a brief that points to a missing photo, unused photo folders, or PRs that have sat open too long.

**Examples**
```
/clean-social-output
/clean-social-output kurta-pajama-festive-2026-11
```

**What Claude does:** previews every clean-up, tells you what will go, then runs them. It asks you only when something is someone's work or changes `main`.

| Cleaned | How it is kept safe |
|---|---|
| **`output/`:** render scratch, 2× masters, renders not committed yet | Only what can be regenerated. Asks first if it includes an uncommitted delivery file |
| **`content/plans/`:** a monthly plan whose month is over and every piece is marked made | The information lives on in the PRs. A plan with unmade pieces stays |
| **`content/`:** draft briefs that were never committed, have no output, and sat untouched for 7+ days | **Only after you say yes** |
| **Merged and posted content:** the slug's briefs, photos, images and videos | **Only after you say yes**, through a cleanup PR that you merge. See below |
| **Git:** local `content/...`, `tooling/...` and `cleanup/...` branches **whose PR is merged** | Only if all of its work is already in `main`. It also catches squash and rebase merges |
| **Git:** stale references to branches GitHub already deleted | Local bookkeeping only |

### Merged and posted content
A slug counts as finished only when **all** of this is true:
- Its PR is merged, and no new PR is open for it.
- Its schedule plan gives a **fixed time for every item**, none is a Buffer draft, and the last post went out **more than 7 days ago**. (A Facebook cover has no schedule, so it waits 30 days after the merge, for you to upload it.)
- No other brief still uses its photos.

Queue-slot items, drafts and anything recent are **kept**, because no send time is known and Buffer may still need the files.

Claude lists the finished slugs with their sizes, explains the effects, and asks. If you agree, it opens a **cleanup PR** from a separate copy of `main`, so your own work isn't disturbed. **You merge it.** Then:
- **Removed:** the briefs, `assets/photos/<slug>/`, `output/<platform>/<slug>/` and the manifests.
- **Kept:** the schedule plan (merged plans are records that the checks depend on).
- **Nothing is lost:** git history keeps every file. Reverting the cleanup PR brings it all back, and links Buffer already holds keep working.
- **Trade-offs:** a removed slug can't be edited or re-run from Actions. For a similar post, make a new one. Clones still download the old files, so this tidies the project and doesn't shrink it.

**Reported, never changed:** a brief whose photo is missing or whose JSON is broken, photo folders that have no brief, an old plan that still has unmade pieces, and content PRs open for more than 14 days.

**Never deleted:** merged schedule plans (`content/schedule/`), the `example-*` briefs, captions in live slugs, the Buffer publish log, a branch with work that isn't in `main`, other branches (`main`, `test`, the one you're on), remote branches on GitHub, and Playwright's browser cache.

`/create-social-content` and `/edit-social-content` already clean their own slug's files after the PR, so you rarely need this for files. It is mostly for finished content, branches, plans and drafts.

---

## `/publish-social-now`: urgent one-off posts

**Use it when**
- Something must go out **now or today**, and waiting for a PR review and merge is too slow (a flash notice, a store closure).
- You want to save something as a **Buffer draft** to finish in the Buffer app.

**Examples**
```
/publish-social-now post kurta-pajama-festive-2026-11 to Instagram now
/publish-social-now save the sherwani reel as a Buffer draft
```

**Rules:** Claude does a dry run first and publishes only after you say go. The files must already be committed and pushed, because Buffer fetches them from the public repo. Render drafts are refused. For normal content, use `/create-social-content` instead.

---

## Behind the scenes (you don't type these)

These run as steps inside the commands above. They are hidden from the `/` menu, but you can still ask for them in plain words, for example *"write a new caption for sherwani-wedding-2026-11"*.

| Step | What it does | Used by |
|---|---|---|
| `monavi-brand-rules` | Brand rules: colours, fonts, logo, voice, quality bar | every creative |
| `render-social-post` | Renders image posts: `overlay` (model photo), `arch` (product-only), `split`, `card` (text-only posters), `banner` (wide: Facebook cover, event) | `/create-social-content`, `/create-social-poster`, `/create-social-banner`, `/edit-social-content` |
| `render-social-reel` | Renders 7–30 second reels with motion and a logo end card | `/create-social-content`, `/edit-social-content` |
| `write-social-captions` | Writes one caption per platform | `/create-social-content`, `/edit-social-content` |
| `open-content-pr` | Writes the schedule, makes the branch and opens the PR | `/create-social-content`, `/edit-social-content` |

And three agents that skills call on:

| Agent | Role |
|---|---|
| `monavi-content-strategist` | Plans: occasions, mix, dates, shoot list. Writes nothing else |
| `caption-writer` | Writes captions, many slugs in parallel if needed |
| `monavi-brand-guardian` | Reviews renders, captions and facts. **A PASS is required before any PR.** Never edits anything itself |

## Rules that hold for every skill

- Posts and reels are made **only through the skills**, never by hand-editing images or video.
- The quality gate is never relaxed: no upscaled photos, nothing below platform size, no draft renders published.
- Prices, offers, addresses and hours are **never invented**. They come from you or from `brand/brand.json`.
- Nothing reaches Buffer before you merge a PR (except `/publish-social-now`, which asks first).
- The Buffer API key lives only as a GitHub secret. It is never written to a file or pasted in chat.
- The AI label (`isAiGenerated`) is not sent to Buffer unless you opt in.
