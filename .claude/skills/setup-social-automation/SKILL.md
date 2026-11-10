---
name: setup-social-automation
description: One-time (and repair) setup for the Monavi social automation. Checks the machine, GitHub access and Buffer channels, fixes everything Claude can fix itself, and tells the user exactly what only they can do. Use when asked to set up, get ready, check or fix the automation, when a first run fails, or when a new Buffer account is connected.
argument-hint: "(nothing needed) or: refresh channels"
---

# Set up the automation

The user runs `/setup-social-automation` and Claude does everything it can. The user is never asked to run a terminal command.

## 1. Check

Run `npm run doctor`. It reports each item as ✓, ✗ (blocking) or ! (warning).

## 2. Fix what Claude can

| Problem | Claude's fix |
|---|---|
| Dependencies missing | `npm install` |
| Chromium missing | `npx playwright install chromium` |
| ffmpeg missing | `npm rebuild ffmpeg-static` |
| `config/buffer-channels.json` missing, or `refresh channels` was asked | See "Buffer channels" below |

Run `npm run doctor` again after the fixes and report the final state.

### Buffer channels (done by Claude)
1. `gh workflow run buffer-channels.yml`, then find the run with `gh run list --workflow buffer-channels.yml --limit 1`.
2. `gh run watch <id> --exit-status`.
3. `gh run download <id> -n buffer-channels -D <scratch dir>`. Check it has real ids (no `<` placeholders), then copy it to `config/buffer-channels.json`.
4. The file reaches `main` through a PR like any other change (it belongs in the tooling PR if one is open). Channel ids are not secret.
- If the run fails with a Buffer key error, the secret `BUFFER_API_KEY` is missing or wrong. See the next section.

## 3. What only the user can do

Say each of these once, in plain words, and offer to wait:
- **Write access to the repo.** The signed-in GitHub account needs it to push and open PRs. Fix: the repo owner adds the account as a collaborator, or the user signs in with `gh auth login` using an account that has write access.
- **`BUFFER_API_KEY`.** Create the key at https://publish.buffer.com/settings/api and add it in GitHub → Settings → Secrets and variables → Actions → New repository secret. **Never ask the user to paste the key into the chat, and never write it to any file.**
- **Connect Instagram (Business/Creator) and the Facebook Page in Buffer.**
- **Contact details.** If `brand/brand.json → contact` has empty fields, say that captions can't include an address, phone or hours until the user gives them. Offer to fill them in from what the user says. Never invent them.
- **Auto-delete merged branches.** GitHub → Settings → General → Pull Requests → tick "Automatically delete head branches". Otherwise a `content/<slug>` branch stays on GitHub after every merge. (`/clean-social-output` only tidies local branches.)
- **Protect `main`** (require a PR and the passing Content check). Recommended, in GitHub → Settings → Branches.

## 4. Tooling must be on `main`

Content PRs are checked with `main`'s scripts. If `git status` shows uncommitted or unmerged tooling changes (`scripts/`, `.claude/`, `.github/`, `brand/`, `package.json`), offer to put them on a branch `tooling/<short-name>` and open a PR. **Confirm before pushing**, since this is not content.

## 5. Report

A short checklist of ✓ done / ✗ needs the user. When nothing blocks, end with: *"Ready. Run /create-social-content with your photos."*
