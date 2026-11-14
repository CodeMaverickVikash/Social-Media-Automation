---
name: plan-social-content
description: "Plan a week, month or season of Monavi social content around Indian festivals and the wedding season. Produces a shoot list (which products, which audience, how many photos, which date) that the user can hand to the store, then makes each piece when the photos arrive. Use when asked what to post, to plan posts for a month, week or festival, or to make a content calendar or shoot list."
argument-hint: "<period or occasion> e.g. December, Diwali week, wedding season"
---

# Plan content

1. Run the **`monavi-content-strategist`** agent with the period or occasion. It verifies festival dates by web search and returns a table: `slug | product | audience | occasion | deliverables | photos needed | suggested IST date`.
2. Save the plan as `content/plans/<yyyy-mm>.md` (create the folder if needed): the table, then a **Shoot list** section that is easy to forward to store staff (piece, who it's for, how many portrait photos, original camera files, date needed by). Don't commit it unless the user asks.
3. Show the user the table and the shoot list. List anything the plan needs that `brand.json` doesn't have (offers, prices, store events), and ask for those facts. Never fill them in.
4. Nothing is made at this step.

## Turning the plan into content

When the user sends photos for a slug from the plan, run `create-social-content` with the plan's slug, product, audience, occasion and date, so the user doesn't have to repeat them. After each slug is made, mark its row `made — PR #<n>` in the plan file. The word `made` matters: `/clean-social-output` deletes a finished monthly plan only when every slug row says it.
