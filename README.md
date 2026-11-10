# Monavi Collection — Social Media Automation

Make on-brand **posts, stories and reels** for Instagram, Facebook and WhatsApp from a product photo. Review them in a **pull request**, and when the PR is **merged**, GitHub Actions **schedules them in Buffer** automatically.

```
 Product photo + "kurta pajama for men, festive"
          │
          ▼  (Claude Code skills)
 ┌──────────────────────────────────────────────────────────────┐
 │ import photo → render post/story/square → render reel       │
 │ → captions per platform → quality check → PR                │
 └──────────────────────────────────────────────────────────────┘
          │  review creatives + captions + times in the PR
          ▼  merge to main
 GitHub Action → Buffer (media served from this public repo via jsDelivr) → Instagram + Facebook
                                       └─ WhatsApp files listed for manual sharing
```

---

## 1. Quick start: make content (the normal way)

Open this repo in **Claude Code** and just ask, attaching or pointing to the photo:

> *"Make a festive post and reel for this kurta pajama for men: `D:\photos\kurta-01.jpg`, `D:\photos\kurta-02.jpg`"*

> *"Lehenga for bride, wedding season, Instagram and WhatsApp only: `C:\shoot\lehenga.jpg`"*

> *"Store timing update card for WhatsApp: open 11am–9pm, closed Tuesday"*

Claude uses the **`social-content`** skill, which:
1. Imports your photos and tells you which layouts they are big enough for
2. Looks up the product in the catalogue (theme, icon, words, hashtags)
3. Shows you a per-platform plan
4. Renders everything, checks it visually and with automated QA
5. Writes a separate caption for each platform
6. Gets a **monavi-brand-guardian** review (required pass before any PR)
7. Shows you the result for approval
8. Opens a **PR** with a schedule, without stopping to ask (default posting times unless you gave dates)

**One command, then merge**, the same as `/new-blog` in the automation repo:

```
/social-content D:\shoot\kurta-01.jpg D:\shoot\kurta-02.jpg kurta pajama for men, festive, post on 20 Nov
```

Review the PR's **Files changed** tab. Edit captions (`caption.txt`) or times (`content/schedule/<slug>.json`) right on GitHub. For image changes such as headline, layout or photo, ask Claude (*"change the headline on <slug> to …"*). It re-renders and pushes to the same PR. **Merging schedules it in Buffer.**

**Rule:** posts and reels are always made through the skills, never by hand.

### What you get

```
output/
├── instagram/<slug>/  ig-feed.jpg  story.jpg  square.jpg  reel.mp4  reel-cover.jpg  caption.txt
├── facebook/<slug>/   ig-feed.jpg  story.jpg  square.jpg  reel.mp4  reel-cover.jpg  caption.txt
├── whatsapp/<slug>/   story.jpg  square.jpg  reel.mp4  reel-cover.jpg  caption.txt
└── _masters/<slug>/   manifest-post.json  manifest-reel.json  (+ 2× PNG masters, not committed)
```

| File | Size | Used for |
|---|---|---|
| `ig-feed.jpg` | 1080×1350 (4:5) | Instagram and Facebook feed post |
| `story.jpg` | 1080×1920 (9:16) | Instagram/Facebook Story, WhatsApp Status |
| `square.jpg` | 1080×1080 | WhatsApp broadcast / catalogue, carousels |
| `reel.mp4` | 1080×1920, H.264, 30fps | Instagram/Facebook Reel, WhatsApp Status video |

---

## 2. Skills

| Skill | What it does |
|---|---|
| **`social-content`** | **Start here.** Photo + product + audience → full per-platform set → PR |
| `monavi-brand` | Brand rules (colours, fonts, logo, voice) and review checklist |
| `social-post` | Image posts: `overlay` (model photo), `arch` (product-only photo), `split`, `card` (text-only) |
| `social-reel` | 7–30s reels with motion, text animation and a logo end card |
| `social-caption` | Captions + hashtags per platform → `caption.txt` |
| `content-pr` | Schedule plan + branch + PR (merge = schedule in Buffer) |
| `buffer-publish` | Local Buffer CLI: channel setup, urgent one-off posts |

### Agents (`.claude/agents/`)

| Agent | What it does |
|---|---|
| `monavi-content-strategist` | Plans a week, month or season: occasions (festival dates verified), product/audience mix, slugs, deliverables, posting times. Plans only. Ask *"plan December's posts"* |
| `caption-writer` | Writes `caption.txt` per platform by following `social-caption`. Useful for captioning several slugs in parallel |
| `monavi-brand-guardian` | Reviews a slug's renders, captions and facts, and runs `check:media`. Returns PASS / CHANGES-REQUIRED / ESCALATE. **A PASS is required before `content-pr`** |

## 3. Supported products

Defined in [`brand/brand.json → products`](brand/brand.json). Add more any time.

| Men | Women | Kids |
|---|---|---|
| Kurta Pajama · Sherwani · Nehru Jacket · Shirt | Lehenga · Saree · Anarkali · Kurti · Salwar Suit · Gown | Ethnic Set · Kurta Pajama · Frock |

## 4. Photo requirements (no pixelation)

Output is never upscaled. If a photo is too small, the render **stops** rather than producing a blurry image.

| Use | Minimum photo | Best |
|---|---|---|
| Feed post with a model (full-bleed) | 1080×1350 | 2160×2700+ |
| Story / Status (full-bleed) | 1080×1920 | 2160×3840+ |
| Product in arch frame | ~1000 px on the short side | 2000 px+ |
| Reel (each scene) | **1166×2074 portrait** | 2333×4147+ |

Tips: send **original camera files** (not WhatsApp-forwarded or screenshot copies), and shoot portrait for stories and reels.
`npm run import:photo -- "<photo>" --slug <slug>` tells you exactly what each photo can be used for.

**No photo?** Claude draws the garment locally as a vector fashion illustration: `npm run draw:product -- --slug <slug> --product sherwani --occasion wedding`. There's no external service or API key. It suits the `arch` layout. It's an illustration, not a photo, so it's for **mood/campaign posts only**, with collection-level copy. For the photo-led look of the reference posters, use a real photo. Each drawn or AI image has a `.ai.json` sidecar.

---

## 5. Setup

### Local machine (one time)
```bash
# Node.js ≥ 22.18 (24 recommended)
npm install                       # also downloads ffmpeg
npx playwright install chromium   # renderer
```
No `.env` file is used. The Buffer API key lives **only** in GitHub (see below).

### Buffer
1. Connect your Instagram (Business/Creator) and Facebook Page in Buffer.
2. Create an API key: https://publish.buffer.com/settings/api
3. Save it as the GitHub secret `BUFFER_API_KEY` (next section). Don't put it in any file.
4. GitHub → **Actions → List Buffer channels → Run workflow**. Copy the JSON from the run summary into `config/buffer-channels.json` and commit it (channel ids are not secret). Re-run this whenever you connect a new account in Buffer.

### Media hosting: none needed (public repo)
Buffer can only publish media from a **public URL**. Because this repository is public, the committed files are served through the **jsDelivr CDN**, pinned to the merge commit:
```
https://cdn.jsdelivr.net/gh/<owner>/<repo>@<commit>/output/instagram/<slug>/reel.mp4
```
These links are permanent, cached, and served with the correct `image/*` / `video/mp4` types.
- The repo **must stay public**. If it goes private, Buffer can't fetch the media.
- jsDelivr serves files up to **20 MB**. `check:media` enforces this; keep reels ≤ ~30s (typically 5–10 MB).
- Don't delete or rewrite (force-push) commits that scheduled posts point to before those posts are published.

### GitHub repository secret
Settings → Secrets and variables → Actions → **New repository secret**:

| Secret | Value |
|---|---|
| `BUFFER_API_KEY` | Buffer API key |

Secrets stay private in a public repo: values are encrypted, never shown, masked as `***` in logs, and not given to PRs from forks. Only give write access to people you trust, and protect `main`.

Recommended: protect `main` (require a PR and a passing **Content check**).

---

## 6. Publishing flow (PR → merge → Buffer)

1. The `content-pr` skill adds a schedule plan, `content/schedule/<slug>.json`:
   ```json
   {
     "slug": "kurta-pajama-festive-2026-11",
     "items": [
       { "kind": "post",  "platforms": ["instagram", "facebook"], "at": "2026-11-20T19:00:00+05:30" },
       { "kind": "story", "platforms": ["instagram", "facebook", "whatsapp"], "at": "2026-11-20T19:05:00+05:30" },
       { "kind": "reel",  "platforms": ["instagram", "facebook", "whatsapp"], "at": "2026-11-21T19:30:00+05:30" }
     ]
   }
   ```
   Leave out `at` to use the next free Buffer queue slot. Add `"draft": true` to create a Buffer draft instead.
2. **PR opened** → the **Content check** action validates the plan: files, captions, media QA, future times, no draft renders, channels configured. It then shows a dry run of what will be scheduled.
3. **Review** the images and video in the PR's *Files changed* tab.
4. **Merge** → the **Schedule content in Buffer** action creates the Buffer posts (media links point to the merged commit) and lists the WhatsApp files to share by hand in the run summary.

Important:
- **Plans are immutable once merged.** Only *new* plan files are scheduled, so edits never create duplicate posts. To change a scheduled post, edit it in Buffer.
- If a run partly fails, re-run it from Actions → *Schedule content in Buffer* → **Run workflow**, with `skip` set to the items that already succeeded.
- **WhatsApp:** Buffer doesn't support it. Share `output/whatsapp/<slug>/` files manually (Status / broadcast / catalogue).
- **AI label:** the AI-generated flag is never sent to Buffer by default (opt in with `--ai-disclosure`). Meta can still apply its own "AI info" label based on its detection, and Meta requires disclosure for photorealistic AI video.

---

## 7. Commands reference

```bash
npm run import:photo -- "<photo>" [...] --slug <slug>     # import + resolution report (--ai-generated for AI images)
npm run draw:product -- --slug <slug> --product <id>         # Claude-drawn illustration when there is no photo
npm run render:post  -- content/posts/<slug>.json          # render images (all formats in the brief)
npm run render:reel  -- content/reels/<slug>.json [--draft] # render reel (--draft = fast preview, not publishable)
npm run check:media  -- output/instagram/<slug>             # QA delivered files
npm run plan -- validate content/schedule/<slug>.json       # validate a schedule plan
npm run plan -- run --files content/schedule/<slug>.json --dry-run
npm run buffer -- channels [--save]                         # list / save Buffer channels
npm run buffer -- post --slug <slug> --kind post --platforms instagram --dry-run   # one-off (files must be pushed)
npm run typecheck
```

## 8. Repository layout

```
brand/            brand.json (tokens + products), tokens.css, README.md (guide), voice.md, fonts/, logo/, elements/, mockups/, reference-posts/
content/          posts/, reels/ (creative briefs) · schedule/ (Buffer plans)
assets/           photos/<slug>/ (imported photos) · audio/ (licensed music only)
output/           instagram/ facebook/ whatsapp/ (delivery files + captions) · _masters/
scripts/          TypeScript tooling (run directly by Node, no build)
.claude/skills/   Claude Code skills
.claude/agents/   Claude Code agents (monavi-content-strategist, caption-writer, monavi-brand-guardian)
.github/workflows content-check.yml · schedule-on-merge.yml
config/           buffer-channels.json (Buffer channel ids)
```

Brand guide: [brand/README.md](brand/README.md) · Voice and captions: [brand/voice.md](brand/voice.md)
