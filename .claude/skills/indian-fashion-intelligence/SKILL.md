---
name: indian-fashion-intelligence
description: Understand natural-language fashion requests, categorize garments across Men's, Women's, Kids, Bridal and Festive wear, and assign styling and audience parameters.
user-invocable: true
argument-hint: "<fashion query, garment, or campaign request>"
---

# Indian Fashion Product Understanding Skill

## Purpose
Decodes natural-language fashion descriptions into structured taxonomy, styling directions, demographic targeting, occasion mappings, and brand blueprint references for Monavi Collection.

## Responsibilities
- Identify garment category (Men's, Women's, Kids, Bridal, Festive, Everyday Wear).
- Map garment types (Kurta Pajama, Sherwani, Saree, Lehenga, Anarkali, Sharara, Gharara, Kurti, Palazzo, Co-ord Set, Gowns, Shirts, Trousers, T-shirts, Blazers, Kids Frocks, Boys Kurtas).
- Determine target audience, gender presentation, and age group.
- Prescribe authentic Indian textiles (Banarasi, Kanjeevaram, Chanderi, Raw Silk, Mulmul, Linen, Combed Cotton).
- Prescribe authentic embellishments and craft details (Zardozi, Gota Patti, Mukaish, Chikankari).
- Match requests to one of the 8 approved reference blueprints in `brand/reference-blueprints.json`.

## Step-by-Step Workflow

1. **Intake & Linguistic Analysis**:
   - Receive the user's prompt (e.g. *"Create a promotional post for a men's black kurta pajama"*, *"Create a festive saree campaign"*, *"Create a kids floral dress post"*).
   - Run the fashion intelligence parser:
     ```bash
     # Inspect taxonomy definitions
     cat brand/fashion-knowledge.json
     ```
   - Extract primary garment keywords and detect any implied occasion or audience.

2. **Demographic & Archetype Assignment**:
   - Cross-reference with the taxonomy matrix in `brand/fashion-knowledge.json`:
     - **Kurta Pajama / Sherwani / Men's Shirt / Blazer** -> Category: `mens` / `bridal` (Groom), Audience: `men` / `groom`, Blueprint: `mens-everyday` or `festive-duo`.
     - **Lehenga / Bridal Gown** -> Category: `bridal`, Audience: `bride`, Blueprint: `bridal`.
     - **Saree / Anarkali / Sharara / Gharara** -> Category: `festive`, Audience: `women`, Blueprint: `festive-ladies` or `festive-duo`.
     - **Kurti / Salwar Suit / Co-ord Set** -> Category: `ladies`, Audience: `women`, Blueprint: `ladies-contemporary`.
     - **Frock / Kids Kurta / Floral Dress** -> Category: `kids`, Audience: `kids_girls` / `kids_boys`, Blueprint: `kids-wear`.

3. **Styling & Creative Configuration**:
   - Select the brand color theme (`mens`, `bridal`, `festive`, `ladies`, `kids`, `peach`, `navy`).
   - Select the recommended template (`split` for men's smart casual, `overlay` for festive/bridal, `arch` for kids/product items).
   - Assemble attribute triplets (e.g. `Classic | Modern | Versatile` or `Timeless | Handcrafted | Celebration-ready`).
   - Pick the category badge icon (`shirt`, `dress`, `kids`, `lotus`) and label.

4. **Output Hand-off**:
   - Provide the structured `FashionAnalysis` object to downstream skills: `fashion-image-engine`, `render-social-post`, `fashion-reel-storyboard`, and `fashion-copywriting`.

## Quality Checks & Failure Handling
- **Ambiguity**: If a user enters an ambiguous query without indicating gender or garment type (e.g., *"Make an outfit post"*), ask one clear, polite clarification question before proceeding.
- **New Garments**: For garments not explicitly listed in the catalog, map them dynamically to the closest category and default to `overlay` template with high-end editorial styling.
