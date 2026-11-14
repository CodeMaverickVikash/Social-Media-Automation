---
name: check-social-status
description: "Show where all Monavi content stands: planned, waiting for review in a PR, scheduled in Buffer, and what to share manually on WhatsApp today. Use when asked for status, what's pending, what's going out, what to post on WhatsApp today, or \"what's next\"."
argument-hint: "(nothing needed) or: today | this week"
---

# Content status

Gather, then report one short table per section. This is read-only: change nothing.

1. **Planned:** `content/plans/*.md` if any (slugs not yet marked made).
2. **Waiting for review:** `gh pr list --state open --search "head:content/"` with title, URL and whether the Content check passed (`gh pr checks <n>`).
3. **Scheduled:** run `git fetch origin`, then read the plan files on `main` (`git show origin/main:content/schedule/<slug>.json`) and list the items whose `at` is in the future: slug, kind, platforms, IST time. For Buffer post ids, point to the *Schedule content in Buffer* run summary (`gh run list --workflow schedule-on-merge.yml --limit 5`).
4. **WhatsApp to share by hand (the one manual step):** every `whatsapp` item due today (or in the period asked), with the exact files in `output/whatsapp/<slug>/` and the `caption.txt` text, ready to copy. Say clearly if a file isn't on disk and a `git pull` is needed.
5. **Problems:** failed runs, or a PR whose Content check failed, with the reason in one line.

End with the single most useful next action (for example "2 PRs wait for review" or "3 WhatsApp Status posts to share at 7 pm").
