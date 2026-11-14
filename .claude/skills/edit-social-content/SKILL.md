---
name: edit-social-content
description: "Change content that is already in an open pull request (headline, layout, photo, caption, hashtags, date or time, platforms), withdraw it, or handle a post that has already been merged. Re-renders through the skills and pushes to the same PR. Use when asked to edit, change, fix, redo, reschedule, replace or cancel a post, reel or caption."
argument-hint: "<slug or PR number> <what to change> e.g. kurta-pajama-festive-2026-11 make the headline shorter"
---

# Edit content in an open PR

Everything in an open PR can be changed until it is merged. Don't open a new PR for a change.

## Find it
Resolve the slug from the user's words, a PR number (`gh pr view <n> --json headRefName`) or the open `content/*` PRs (`gh pr list`). If more than one matches, show the short list and ask which.

## Is it merged?
- **Open:** continue below.
- **Merged, and the post time has not passed:** merged plans are immutable, so don't edit the plan file. The Buffer post is changed in Buffer's app. For new text or images, offer a **new slug** (`<slug>-v2`) through `create-social-content`, and tell the user the old Buffer post must be deleted in Buffer.
- **Merged, and already posted:** say so, and offer a new post.

## Change it
1. `git fetch origin && git switch content/<slug> && git pull --ff-only`. This pulls in edits the user made directly on GitHub (captions and times can be edited there, in the PR's Files changed tab).
2. Apply the change through the matching skill. The images are rendered locally, so editing a brief JSON on GitHub doesn't change them.

| Change | Do |
|---|---|
| Headline, attrs, CTA, layout, theme, photo | Edit `content/posts/<slug>.json` (and `content/reels/<slug>.json` so the set stays consistent), then `render-social-post` / `render-social-reel` to re-render |
| Caption, hashtags | `write-social-captions` for the affected platforms |
| Date, time, platforms, draft, AI flag | Edit `content/schedule/<slug>.json` |

3. `npm run check:media -- output/instagram/<slug> output/facebook/<slug> output/whatsapp/<slug>`, then the **`monavi-brand-guardian`** agent (same rules as `create-social-content`: at most 2 fix rounds). Then `npm run plan -- validate content/schedule/<slug>.json`.
4. `git commit -m "content: <slug> - <what changed>"` and `git push`. The open PR and its Content check update.
5. `npm run clean:output -- --slug <slug>`.
6. Report: what changed, a preview of the new key image (Read it), and the PR link.

## Withdraw it
To cancel before merge: confirm with the user, then `gh pr close <n> --delete-branch`. Nothing was scheduled. Local files stay until `clean-social-output`.
