---
name: create-social-poster
description: "Create a Monavi poster for Instagram, Facebook and WhatsApp (festival greeting, offer, announcement, new-arrival or store-update poster), as feed, story and square images, then open a PR that schedules it in Buffer on merge. Use when asked for a poster, festival greeting, offer or sale poster, announcement, \"new arrivals\" creative, quote card or store-update image. With or without a photo."
argument-hint: "<occasion or message> [photo path] [platforms] [date] e.g. Diwali greeting for the whole family, post on 28 Oct"
---

# Create a social media poster

A poster is a **message-first** creative: a festival wish, an announcement, an offer, a new collection, a store update. It follows the same pipeline as `create-social-content` (one command to a PR, merging is the approval), with these differences.

Read `create-social-content` first for the readiness check, the stop rules and the PR flow. Everything there applies. Only the steps below change.

## Deliverables

| Platform | Files | Posted as |
|---|---|---|
| Instagram | `ig-feed.jpg` (4:5), `story.jpg` (9:16) | feed post and story (scheduled) |
| Facebook | `ig-feed.jpg`, `story.jpg` | feed post and story (scheduled) |
| WhatsApp | `square.jpg` (1:1), `story.jpg` | broadcast and Status (shared by hand) |

Formats: `["ig-feed","story","square"]`. Trim to the platforms the user named. No reel unless asked.

## Pick the layout (`render-social-post`)

| The poster has | Template | Notes |
|---|---|---|
| **No photo** (greeting, offer, announcement, quote) | `card` | Theme `festive` for festivals, `light` or `sage` otherwise. `footnote` holds address, timings or terms |
| A **model photo** | `overlay` | Use the product's theme. Headline on the photo side |
| A **product-only photo** | `arch` | Heritage arch window, copy below |
| A clean product shot with room for text | `split` | `mens` theme works well |

No photo and no clear subject? A `card` poster is the safe default. Don't draw an illustration unless the user wants a mood poster for a collection (see `render-social-post` §1).

## Copy rules for posters

- Headline: 2–4 short lines, sentence case. One idea per poster.
- One CTA at most (`Visit the Store →`, `DM to Order →`, `Explore Collection →`).
- **Offers, discounts, prices, dates, addresses and timings come only from the user or `brand/brand.json → contact`.** If an offer poster has no terms from the user, ask once. If it's still missing, make a non-offer poster and say what's missing. Never invent a percentage, date or price.
- Festival wishes use the festival's real date for the schedule (verify it, don't guess). Post 7–10 days ahead for a greeting that builds anticipation, and the day before or the morning of for the wish itself.

## Slug and PR

Slug: `poster-<topic>-<yyyy-mm>`, e.g. `poster-diwali-greeting-2026-11`. Then follow `create-social-content` §3 from the brief onwards: captions per platform, QA, `monavi-brand-guardian`, schedule and PR.

## Report

The PR link, a preview of `ig-feed.jpg` (Read it), the schedule times, the captions, and what to change in the PR if wanted.
