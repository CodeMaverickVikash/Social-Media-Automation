# Monavi Collection — Social Media Automation

Creates on-brand posts, stories and reels for **Monavi Collection** (family fashion boutique, India). Content is reviewed in a **PR**; **merging to main** runs a GitHub Action that schedules everything in **Buffer** (Instagram + Facebook). WhatsApp files are prepared for manual sharing because Buffer has no WhatsApp support. See README.md for the full guide.

## Layout

- `brand/`: brand source of truth. `brand.json` (tokens + **product catalogue**), `tokens.css`, `README.md`, `voice.md`, `fonts/`, `logo/`, `elements/`, `mockups/`, `reference-posts/`
- `content/posts|reels/<slug>.json`: creative briefs · `content/schedule/<slug>.json`: Buffer schedule plans (immutable after merge)
- `assets/photos/<slug>/`: imported product photos · `assets/audio/`: licensed music
- `scripts/`: TypeScript run directly by Node ≥ 22.18 (type stripping, no build step)
  - `import-photo.ts`, `render-post.ts`, `render-reel.ts`, `check-media.ts`, `publish-plan.ts`, `buffer.ts`
  - `lib/` (brand, quality, output, ffmpeg, buffer-api, media-url: jsDelivr links to committed files, since the repo is public) · `templates/` (post.ts: overlay/arch/split/card · reel.ts)
- `output/<platform>/<slug>/`: delivery files + caption.txt (**committed** in content PRs) · `output/_masters/<slug>/`: manifests (committed), 2× PNG masters (ignored)
- `.github/workflows/`: `content-check.yml` (PR validation + dry run) · `schedule-on-merge.yml` (Buffer scheduling)
- `.claude/skills/`: `social-content` (entry point) → `monavi-brand`, `social-post`, `social-reel`, `social-caption`, `content-pr`, `buffer-publish`

## Commands

```bash
npm run import:photo -- "<photo>" --slug <slug>
npm run render:post -- content/posts/<slug>.json [--formats ig-feed,story]
npm run render:reel -- content/reels/<slug>.json [--draft]
npm run check:media -- output/instagram/<slug>
npm run plan -- validate content/schedule/<slug>.json
npm run plan -- run --files content/schedule/<slug>.json --dry-run
npm run typecheck
```
Buffer channel ids: GitHub → Actions → "List Buffer channels" → commit the JSON to `config/buffer-channels.json`.

## Rules

- **All posts and reels are made through the skills only.** Start every content request with `social-content`: product photo + product + audience → per-platform deliverables → captions → QA → `content-pr`. No ad-hoc HTML, image edits or video encodes outside `scripts/render-*.ts`.
- **Quality bar:** never upscale photos and never ship below platform size. The quality gate failing is a blocker. `--allow-lowres`/`--draft` renders are marked `draftOnly` and cannot be published (both the CLI and the CI refuse them).
- Scheduling happens on merge via GitHub Actions. Push and open PRs only after the user confirms. Never publish directly to Buffer without a dry run and the user's go-ahead.
- Buffer `isAiGenerated` is never sent unless `--ai-disclosure` is passed.
- No `.env` file. `BUFFER_API_KEY` lives only as a GitHub repository secret. Never write it to any file (the repo is public).
- Never invent prices, offers, addresses or store hours (`brand.json → contact` is the only source).
- TypeScript must stay erasable-only (no `enum`, `namespace` or parameter properties), and imports use `.ts` extensions. Run `npm run typecheck` after edits.
