# Monavi Collection — Editorial Improvements & Reference Case Study

> **Location:** `references/editorial-improvements/`  
> **Purpose:** Permanent repository reference capturing the user's design instructions, technical solutions, prompt engineering rules, and finalized creative assets.

---

## 1. Overview & Context

This reference case study documents the complete transformation of a promotional social media creative for Monavi Collection from an initial generic template into a high-end luxury editorial publication post matching the brand's 8 reference blueprints (`brand/reference-posts/`).

All guidelines, rules, and technical solutions derived from this session have been permanently codified across the repository:
- **Brand Source of Truth:** `brand/FASHION_EDITORIAL_PLAYBOOK.md` & `brand/fashion-knowledge.json`
- **Image Generation Engine:** `scripts/lib/fashion-image-engine.ts`
- **Agents:** `.claude/agents/` and `.agents/agents/`
- **Skills:** `.claude/skills/` and `.agents/skills/`

---

## 2. User Instructions Breakdown & Technical Solutions

| # | User Instruction | Problem Identified | Technical & Creative Solution Implemented |
|---|---|---|---|
| **1** | *"lef right match nhi ho rha hai professional nhi lag rha hai as have in references post"* | Left text card (dark slate) clashed with right photographic lighting; layout felt disconnected. | Unified color harmony and vertical rhythm. Replaced cold studio slate with warm sandstone haveli environment. |
| **2** | *"image me do slip different backgroud lag rha hai images ke background ke according hona chahiye"* | A harsh split boundary divided the image into two disconnected rectangular boxes. | Transitioned to the `overlay` template. The haveli architectural scene now flows continuously edge-to-edge across the canvas with a soft directional shadow scrim on the left. |
| **3** | *"according to clothes, style content should be accordingly perfect"* | Casual/generic copy ("Everyday Style") did not match the royal midnight raw silk and antique gold zari garment. | Rewrote copy to reflect royal Indian heritage, hand-textured raw silk, and bespoke festive styling. |
| **4** | *"with minimal content"* | Excessive text elements (multiple badges, 4-line body copy, oversized subtitles) cluttered the visual space. | Stripped non-essential copy layers. Retained only: Collection Eyebrow, Product Headline, Attribute Triplet, and CTA pill button with 400px+ of clean negative space. |
| **5** | *"product name bhi properly hona chahiye tak user ko samajh aa sake ki kya hai"* | Headline was ambiguous and did not immediately communicate what garment was being sold. | Formulated high-contrast Playfair headline stating the exact product: `"Silk Kurta\nPajama."` for immediate 0.1s comprehension. |
| **6** | *"with little details of clothes"* | Creative lacked specific textile and craft details that high-end fashion buyers look for. | Added concise attribute triplet separated by `' | '`: `"Raw Silk | Antique Zari | Tailored Fit"`. |
| **7** | *"jo product ka ham bol rha hai vo properly dikhna chahiye as we are saying kurta pajama to model kurta pajama pahne dikhana chahiye"* | Image had a waist-up / torso crop that hid the pajama/churidar completely. | Enforced **Complete Garment Visibility Mandate**: Full-length standing shot showing knee-length kurta, ankle-length churidar pajama, and traditional black velvet juttis. |
| **8** | *"image realistic lagni chahiye yesa nhi lagna chahiye ke ai be nayi hai"* | Model had smooth, airbrushed, plastic-looking skin and lacked grounded contact shadows. | Enforced **Zero-AI Photorealism Mandate**: Banned AI trigger words (`8k`, `photorealistic`), specified 50mm f/2.8 lens optics, natural visible skin pores, facial stubble, raw silk fabric slubs, and physical contact shadows under feet. |
| **9** | *"iss chat main maine jis tarah se instruct kiya hai post improment ke lye unse improve skills, agent knowledge for future..."* | Lessons risked being lost in chat history. | Codified rules across `fashion-creative-director`, `fashion-image-generator`, `creative-quality-assurance`, `brand-design-typography`, and all fashion skills. |
| **10** | *"unneccessary things remove or if you to keep for future ref you can keep in to one folder"* | Intermediate draft files and test logs were scattered. | Cleaned up temporary draft files and consolidated all reference briefs, prompts, images, and documentation into this single reference folder. |

---

## 3. The 5 Golden Editorial Principles

1. **Continuous Single-Environment Background:**
   Never use clashing split backgrounds (e.g. cold slate beside warm sandstone haveli). Use `overlay` with natural shadow scrims so architecture flows edge-to-edge.
2. **Complete Garment Visibility Mandate:**
   For multi-piece ethnic wear (kurta pajama, sherwani churidar, lehenga choli), framing must be full-length or 3/4 standing showing top, bottom, and footwear on solid ground. Never crop at the waist.
3. **Zero-AI Photorealism & Optical Fidelity:**
   Ban AI buzzwords (`8k, photorealistic, ultra-detailed, masterpiece`). Enforce physical 50mm f/2.8 lens mechanics, natural skin pores, realistic stubble, raw fabric slub, and directional physical ground contact shadows under feet.
4. **Product Clarity in Headlines:**
   Headline must prominently name the exact featured product (`Silk Kurta\nPajama.`, `Royal\nSherwani.`) for instant 0.1s comprehension.
5. **Minimalist Luxury Layout:**
   Keep image typography minimal with a concise attribute triplet (`Raw Silk | Antique Zari | Tailored Fit`) and at least 400px of clean architectural negative space.

---

## 4. Assets in this Reference Folder

- [`brief.json`](file:///home/vikash/Documents/development/Social-Media-Automation/references/editorial-improvements/brief.json): Complete creative brief configuration.
- [`master-prompt.txt`](file:///home/vikash/Documents/development/Social-Media-Automation/references/editorial-improvements/master-prompt.txt): Optical photography prompt and negative prompt specifications.
- [`model-photo.png`](file:///home/vikash/Documents/development/Social-Media-Automation/references/editorial-improvements/model-photo.png): High-resolution photorealistic master model photography.
- [`ig-feed.jpg`](file:///home/vikash/Documents/development/Social-Media-Automation/references/editorial-improvements/ig-feed.jpg): Final approved 1080×1350 feed creative (Instagram & Facebook).
- [`story.jpg`](file:///home/vikash/Documents/development/Social-Media-Automation/references/editorial-improvements/story.jpg): Final approved 1080×1920 vertical story creative (Instagram, Facebook & WhatsApp Status).
- [`square.jpg`](file:///home/vikash/Documents/development/Social-Media-Automation/references/editorial-improvements/square.jpg): Final approved 1080×1080 square format creative (Instagram, Facebook & WhatsApp).
- [`captions.txt`](file:///home/vikash/Documents/development/Social-Media-Automation/references/editorial-improvements/captions.txt): Platform-tailored captions and hashtag sets for Instagram, Facebook, and WhatsApp.
- [`schedule.json`](file:///home/vikash/Documents/development/Social-Media-Automation/references/editorial-improvements/schedule.json): Buffer multi-platform release schedule plan.
