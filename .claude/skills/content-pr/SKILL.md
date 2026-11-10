---
name: content-pr
description: Package finished Monavi content (briefs, photos, rendered posts/reels, captions) with a schedule plan into a GitHub pull request; when the PR is merged to main, a GitHub Action schedules everything in Buffer for Instagram and Facebook. Use when content is ready to go live, or when asked to schedule, raise/open a PR, send for approval or queue posts/reels for the week.
---

# Content PR → merge → Buffer

```
content/<kind>/<slug>.json ─┐
assets/photos/<slug>/       ├─ PR (review creatives + captions + times) ─ merge to main ─▶ GitHub Action
output/<platform>/<slug>/   │                                                           ├─ media URLs = jsDelivr links to the merge commit (public repo)
content/schedule/<slug>.json┘                                                           ├─ create Buffer posts (IG + FB)
                                                                                        └─ list WhatsApp files to share manually
```

- **PR check** (`.github/workflows/content-check.yml`) validates the plan: files exist, captions exist, media QA passes, times are in the future, nothing was rendered as a draft, Buffer channels are configured. It then shows a dry run.
- **On merge** (`.github/workflows/schedule-on-merge.yml`) only plan files **added** by that merge are scheduled. Merged plans are immutable, so editing one never re-posts it. To change a scheduled post, edit it in Buffer or add a new plan.

## Steps

### 1. Pre-flight
- The content was made through `social-content` (renders + captions exist and QA passes).
- No `--allow-lowres` or `--draft` renders. The PR check rejects them anyway.
- The **`monavi-brand-guardian`** agent returned `VERDICT: PASS` for this slug, and nothing changed since that review. If it hasn't run, or the content changed after it ran, run it now and don't open the PR until it passes.
- `config/buffer-channels.json` exists. If not, still open the PR (the Content check will fail on this one item), and tell the user to run GitHub → Actions → **List Buffer channels**, save the JSON from the run summary to that file on `main`, then re-run the check. Channel ids are not secret.

### 2. Write the schedule plan: `content/schedule/<slug>.json`

```json
{
  "slug": "kurta-pajama-festive-2026-11",
  "items": [
    { "kind": "post",  "platforms": ["instagram", "facebook"], "at": "2026-11-20T19:00:00+05:30" },
    { "kind": "story", "platforms": ["instagram", "facebook", "whatsapp"], "at": "2026-11-20T19:05:00+05:30" },
    { "kind": "reel",  "platforms": ["instagram", "facebook", "whatsapp"], "at": "2026-11-21T19:30:00+05:30", "firstComment": "#MensEthnicWear #FestiveLook" }
  ]
}
```
- `kind`: `post` (uses `ig-feed.jpg`), `story` (`story.jpg`), `reel` (`reel.mp4`). Override with `"file": "square.jpg"`.
- `at`: ISO time **with offset** (IST = `+05:30`). Omit it to use the next free Buffer queue slot. If the user gives no times, use the defaults from `social-content` §3.7 without asking. The user can edit them in the PR.
- `"draft": true` creates a Buffer draft instead of scheduling it.
- `"aiDisclosure": true` sends Instagram's AI label. It's off by default. If the render uses AI imagery (its manifest has `aiGenerated: true`), mention Meta's disclosure rule to the user once, then follow their decision.
- `whatsapp` items are not sent to Buffer. They appear in the Action summary as a manual-share list.

Validate locally:
```bash
npm run plan -- validate content/schedule/<slug>.json
npm run plan -- run --files content/schedule/<slug>.json --dry-run
```

### 3. Branch, commit, PR

**When called from `social-content`, don't ask. Push and open the PR.** The user's `social-content` request is the go-ahead, and the PR is their review step (merging is the approval). Called on its own, confirm before pushing unless the user already asked for a PR.

If the branch `content/<slug>` already has an open PR (`gh pr list --head content/<slug>`), don't create a new one. Switch to the branch, commit the changes and push, which updates the existing PR (see `social-content` §4).

```bash
git switch main && git pull --ff-only
git switch -c content/<slug>
git add content/posts/<slug>.json content/reels/<slug>.json content/schedule/<slug>.json \
        assets/photos/<slug>/ output/instagram/<slug>/ output/facebook/<slug>/ output/whatsapp/<slug>/ \
        output/_masters/<slug>/manifest-*.json
git commit -m "content: <slug>"
git push -u origin content/<slug>
gh pr create --base main --title "Content: <human title>" --body-file <tmp body file>
```
Only add files that exist (e.g. skip `content/reels/...` when there's no reel). Don't add unrelated changes.

PR body template (write it to a temp file):
```markdown
## <Title>, <product> for <audience>

| When (IST) | Kind | Platforms |
|---|---|---|
| 20 Nov 7:00 pm | Post | Instagram, Facebook |
| … | … | … |

**Previews:** `output/instagram/<slug>/ig-feed.jpg` · `story.jpg` · `reel.mp4`

### Captions
**Instagram:** …
**Facebook:** …
**WhatsApp (manual):** …

**Brand review:** monavi-brand-guardian PASS (<date>)

Merging this PR schedules the Instagram and Facebook items in Buffer via GitHub Actions.
```
Then end the PR body with the attribution line from the system reminder.

### 4. After opening
Give the user the PR URL. Tell them: review the images in the PR's "Files changed" tab, wait for the **Content check** to pass, then merge. After merging, the **Schedule content in Buffer** run summary shows the Buffer post ids and the WhatsApp files to share.

## One-time repository setup (tell the user if missing)

GitHub → Settings → Secrets and variables → Actions → **New repository secret**:
`BUFFER_API_KEY` (the only secret needed).
Recommended: protect `main` (require a PR and a passing **Content check**).

Media hosting: the repo is **public**, so Buffer fetches the committed files through jsDelivr (`https://cdn.jsdelivr.net/gh/<owner>/<repo>@<merge-sha>/output/...`). The repo must stay public, each file must be ≤ 20 MB (enforced by `check:media`), and merged commits must not be force-pushed away before their posts go out.

## If a scheduled run partly fails
The summary marks ❌ items. Fix the cause (e.g. a secret), then go to Actions → *Schedule content in Buffer* → **Run workflow**. Set `plans` to the plan path, `skip` to the items that already succeeded (e.g. `post:instagram,post:facebook`), and untick dry run.
