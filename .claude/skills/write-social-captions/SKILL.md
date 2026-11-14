---
name: write-social-captions
description: "Write on-brand Monavi captions, hashtags and first comments tailored per platform (Instagram, Facebook, WhatsApp) and save them as caption.txt in each output/<platform>/<slug>/ folder. Use when asked for captions, copy, hashtags, post text, WhatsApp broadcast/status text, or after rendering a post or reel."
user-invocable: false
---

# Write captions

## 0. Load voice & Simple English Mandate

Read `brand/voice.md` (tone, formula, hashtag bank, per-platform rules) and `brand/brand.json → contact`, `collections`.

**Simple English Mandate ("Simple, Clear & Natural English"):**
- All captions MUST be written in **simple, natural, conversational English** with short, clear sentences (under 15 words).
- Strictly ban overly complex, archaic, or pretentious vocabulary (e.g. `opulent`, `ineffable`, `ethereal`, `splendorous`, `transcendental`, `connoisseur`).
- Tone: warm, friendly boutique stylist talking directly to a customer.
- 100% Clothes-to-Copy Alignment: captions must describe the exact garments, fabrics, and colors visible in the creative.

## 1. Inputs

- The `slug`, and the brief in `content/posts/<slug>.json` or `content/reels/<slug>.json`. Read it so the caption matches the creative.
- Which platforms have folders: `ls output/*/<slug>/`.
- Facts from the user: prices, offer dates, address, booking method. **Never invent them.** If one is needed and missing, ask, or write the caption without it.

## 2. Write one caption per platform

Follow the formula in `voice.md`: hook → specifics → CTA → hashtags.

| Platform | File | Shape |
|---|---|---|
| Instagram post | `output/instagram/<slug>/caption.txt` | Hook line ≤ 125 chars (shows before "more"), 1–2 lines of detail, CTA, blank line, 5–10 hashtags. Always include `#MonaviCollection #WearYourStory` |
| Instagram reel | same file | 1–2 lines + CTA + 3–6 hashtags. The video carries the message |
| Facebook | `output/facebook/<slug>/caption.txt` | 1–3 short paragraphs, warmer and more informative (address/hours if known), 2–4 hashtags |
| WhatsApp | `output/whatsapp/<slug>/caption.txt` | 1–3 lines, personal ("Hi! ✨ Our festive anarkalis are here…"), clear action ("Reply to book a trial"), **no hashtags** |

Hard limits: Instagram ≤ 2,200 characters and ≤ 30 hashtags (the publish script enforces both). ≤ 2 emoji per caption, and never stack them.

## 3. Save and show

Write each file as UTF-8 plain text (no Markdown) with the Write tool. Then show the user all captions together for approval before publishing. Offer an optional `firstComment` (extra hashtags or store details) for `publish-social-now --first-comment`.

## Examples

**Instagram, festive post**
```
Some colours carry a celebration in them. ✨
Our new festive anarkalis in deep maroon with zari detailing, made for evenings that become memories.
Visit the store or DM us to reserve yours.

#MonaviCollection #WearYourStory #FestiveWear #Anarkali #EthnicWear #FestiveCollection
```

**WhatsApp**
```
Hi! ✨ Our Festive Collection has just arrived at Monavi: new anarkalis, lehengas & sarees.
Reply to this message to book a trial or visit us this week.
```
