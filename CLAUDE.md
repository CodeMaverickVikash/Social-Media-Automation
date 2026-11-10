# Monavi Collection — Social Media Automation

Creates on-brand posts, stories and reels for **Monavi Collection** (family fashion boutique, India). Content is reviewed in a **PR**; **merging to main** runs a GitHub Action that schedules everything in **Buffer** (Instagram + Facebook). WhatsApp files are prepared for manual sharing because Buffer has no WhatsApp support. See README.md for the full guide.

## Layout

- `brand/`: brand source of truth. `brand.json` (tokens + **product catalogue**), `tokens.css`, `README.md`, `voice.md`, `fonts/`, `logo/`, `elements/`, `mockups/`, `reference-posts/`
- `content/posts|reels/<slug>.json`: creative briefs · `content/schedule/<slug>.json`: Buffer schedule plans (immutable after merge)
- `assets/photos/<slug>/`: imported product photos · `assets/audio/`: licensed music
- `scripts/`: TypeScript run directly by Node ≥ 22.18 (type stripping, no build step)
  - `import-photo.ts`, `draw-product.ts` (Claude-drawn vector illustration when there's no photo), `render-post.ts`, `render-reel.ts`, `check-media.ts`, `publish-plan.ts`, `buffer.ts`, `doctor.ts` (readiness), `clean-output.ts` + `clean-content.ts` + `clean-merged.ts` + `clean-branches.ts` (safe cleanup)
  - `lib/` (brand, quality, output, ffmpeg, buffer-api, media-url: jsDelivr links to committed files, since the repo is public) · `templates/` (post.ts: overlay/arch/split/card/banner · reel.ts · illustration.ts)
- `output/<platform>/<slug>/`: delivery files + caption.txt (**committed** in content PRs) · `output/_masters/<slug>/`: manifests (committed), 2× PNG masters (ignored)
- `.github/workflows/`: `content-check.yml` (PR validation + dry run) · `schedule-on-merge.yml` (Buffer scheduling)
- `.claude/skills/`: **user commands** `setup-social-automation` · `plan-social-content` · `create-social-content` (main) · `create-social-poster` · `create-social-banner` · `edit-social-content` · `check-social-status` · `clean-social-output` · `publish-social-now`. **Internal steps** (hidden from `/`): `monavi-brand-rules`, `render-social-post`, `render-social-reel`, `write-social-captions`, `open-content-pr`. Use cases for each: `docs/SKILLS.md`
- `.claude/agents/`: `monavi-content-strategist` (plans slugs and dates, writes nothing) · `caption-writer` (runs `write-social-captions`) · `monavi-brand-guardian` (review only, **required PASS before `open-content-pr`**)

## Commands

```bash
npm run import:photo -- "<photo>" --slug <slug> [--ai-generated]
npm run draw:product -- --slug <slug> --product <sherwani|kurta-pajama> [--occasion wedding|festive|everyday]
npm run render:post -- content/posts/<slug>.json [--formats ig-feed,story]
npm run render:reel -- content/reels/<slug>.json [--draft]
npm run check:media -- output/instagram/<slug>
npm run plan -- validate content/schedule/<slug>.json
npm run plan -- run --files content/schedule/<slug>.json --dry-run
npm run doctor                                   # readiness check (create-social-content runs it first)
npm run clean:output -- [--slug <slug>] [--dry-run]   # safe file cleanup: never touches committed files or captions
npm run clean:content -- [--drafts] [--slug <slug>] [--dry-run]   # finished plans; --drafts only after the user agrees; never content/schedule or committed files
npm run clean:merged -- [--apply] [--grace <days>] [--slug <slug>]   # finished (merged + posted) content; --apply only on a cleanup/* branch, via a PR the user agrees to
npm run clean:branches -- [--dry-run]                 # delete local content/tooling/cleanup branches whose PR is merged
npm run typecheck
```
Buffer channel ids: GitHub → Actions → "List Buffer channels" → commit the JSON to `config/buffer-channels.json`.

## Rules

- **Skills are the user's only interface; Claude Code AI does everything.** The user types a skill command (or plain words) and never runs `npm` or `git` themselves. Do all terminal, Git and `gh` work yourself, and use `scripts/` as your own tools. Never answer with "run this command". Do it, or say what only the user can do (repo write access, the `BUFFER_API_KEY` secret, Buffer account connections, store contact details). When you add or change a user-facing capability, add or update its skill **and** its use cases in `docs/SKILLS.md`.
- **All posts and reels are made through the skills only.** Start every content request with the matching create skill (`create-social-content` for posts, stories and reels, `create-social-poster`, `create-social-banner`): product photo + product + audience → per-platform deliverables → captions → QA → `monavi-brand-guardian` PASS → `open-content-pr`. Agents never render or edit creatives; fixes go back through the skills. No ad-hoc HTML, image edits or video encodes outside `scripts/render-*.ts`.
- **Quality bar:** never upscale photos and never ship below platform size. The quality gate failing is a blocker. `--allow-lowres`/`--draft` renders are marked `draftOnly` and cannot be published (both the CLI and the CI refuse them).
- **One command → PR, like automation's `/new-blog`.** A `create-social-content` request runs end to end without approval pauses and pushes a `content/<slug>` branch with a PR; that request is the go-ahead. The PR is where the user reviews and edits, and **merging is the approval** that schedules it in Buffer through GitHub Actions. It stops before pushing on a quality-gate failure, a brand-guardian `ESCALATE` or failure after 2 fix rounds, or a missing fact. Any other push or PR still needs the user's confirmation. Never publish directly to Buffer without a dry run and the user's go-ahead.
- Buffer `isAiGenerated` is never sent unless `--ai-disclosure` is passed (or `"aiDisclosure": true` on a plan item).
- **Everything is made and edited locally** (photos, posts, reels): no external image services or API keys. **No photo → `draw:product`** (vector illustration, `arch` template). It's for **mood/campaign posts only**: copy stays collection-level, with no claims about a specific piece, fabric, colour or price. Keep the `<photo>.ai.json` sidecar; it flags the render as AI.
- No `.env` file. `BUFFER_API_KEY` lives only as a GitHub repository secret. Never write it to any file (the repo is public).
- Never invent prices, offers, addresses or store hours (`brand.json → contact` is the only source).
- TypeScript must stay erasable-only (no `enum`, `namespace` or parameter properties), and imports use `.ts` extensions. Run `npm run typecheck` after edits.
