# Using this repo from Google Antigravity

Everything that works in Claude Code works from [Google Antigravity](https://antigravity.google/) too: the same skill names, the same one-command flow (photo to PR), the same safety rules. You type a skill, the agent does the work, and you never run `npm` or `git` yourself.

## Start

1. Open this folder as the workspace in Antigravity.
2. Make sure the agent may run terminal commands (Antigravity's terminal command policy). The skills run `npm`, `git` and `gh` for you.
3. In the message box, type a skill and the details as normal text:

```
/setup-social-automation
/plan-social-content next week
/create-social-content D:\shoot\lehenga-01.jpg D:\shoot\lehenga-02.jpg lehenga for bride, wedding season, post on 16 Nov
/create-social-poster Tulsi Vivah greeting for the whole family
/create-social-banner Facebook cover for the wedding collection
/edit-social-content lehenga-wedding-season-2026-11 make the headline shorter
/check-social-status
/clean-social-output
```

You can also just describe what you want. The skills start on their own when a request matches their description. Every command and its use cases are in [SKILLS.md](SKILLS.md).

## What Antigravity reads

| File | For | Where it comes from |
|---|---|---|
| `AGENTS.md` | Project rules: brand, quality bar, one-command flow, safety rules | Generated from `CLAUDE.md` |
| `.agents/skills/<name>/SKILL.md` | The 14 skills (9 user commands and 5 internal steps) | Generated from `.claude/skills/` |
| `.agents/agents/<name>.md` | The 3 sub-agents: `monavi-content-strategist`, `caption-writer`, `monavi-brand-guardian` | Generated from `.claude/agents/` |

Antigravity doesn't read `.claude/` or `CLAUDE.md`, so these are generated copies. **`.claude/` and `CLAUDE.md` stay the source of truth.**

## Keeping both in sync

Whoever changes a skill, an agent or `CLAUDE.md` runs this afterwards, and commits the result:

```bash
npm run sync:antigravity            # regenerate AGENTS.md and .agents/
npm run sync:antigravity -- --check # change nothing, fail if they are out of date
```

The **Content check** in CI runs the `--check` and fails a PR whose Antigravity files are stale, so the two tools can't drift apart. `npm run doctor` warns about it too. When you use Claude Code, Claude does this step itself (the rule is in `CLAUDE.md`).

## Differences from Claude Code

| | Claude Code | Antigravity |
|---|---|---|
| Internal steps (`render-social-post`, …) | Hidden from the `/` menu | **Shown** in the menu. Their description says "Internal step". You only need the 9 user commands |
| Arguments after a skill | Passed to the skill | Not documented by Antigravity. They are read as part of your message, which works the same in practice |
| Sub-agents | Restricted to a tool list | Have **no tool list** here (Antigravity warns that a wrong tool name can hang a sub-agent). "Review only" and "plans only" are rules in their text instead |
| `.claude/` files | Read | Not read. Use the generated `.agents/` copies |
| Looking at rendered images | Read tool | The agent must open each image. This depends on the model being able to view images |

## What is verified and what is not

**Checked against Antigravity's official documentation:** the folder names (`.agents/skills/`, `.agents/agents/`, `AGENTS.md`), that a skill needs only `name` and `description`, that skills are invoked with `/<skill-name>` or automatically, the sub-agent file format, and the 24 KB limit per rules file (`AGENTS.md` is about 8 KB). The generated files were checked against that format: every frontmatter parses and uses only those fields.

**Not verified:** I could not run Antigravity itself, so the first real run inside it is the real test. If something in the flow behaves differently (for example how a sub-agent is invoked, or whether the agent can view images), tell Claude or the Antigravity agent, and the notes in `AGENTS.md` (generated from the script `scripts/sync-antigravity.ts`) can be adjusted in one place.

## Sources
- [Agent skills](https://antigravity.google/docs/skills)
- [Workflows to skills](https://antigravity.google/docs/migration/workflows-to-skills/)
- [Rules](https://antigravity.google/docs/rules)
- [Sub-agents](https://antigravity.google/docs/subagents)
- [Customization discovery](https://antigravity.google/docs/customization-discovery)
