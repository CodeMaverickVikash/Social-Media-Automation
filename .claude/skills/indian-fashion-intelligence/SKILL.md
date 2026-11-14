---
name: indian-fashion-intelligence
description: "Understand natural-language fashion requests, categorize garments across Men's, Women's, Kids, Bridal and Festive wear, and assign styling and audience parameters."
user-invocable: true
argument-hint: "<fashion query, garment, or campaign request>"
---

# Indian Fashion Product Understanding Skill

## Purpose
Decodes natural-language fashion descriptions into structured taxonomy, styling directions, demographic targeting, occasion mappings, and brand blueprint references for Monavi Collection, enforcing the principles in `brand/FASHION_EDITORIAL_PLAYBOOK.md`.

## Responsibilities
- Identify garment category (Men's, Women's, Kids, Bridal, Festive, Everyday Wear).
- Map garment types (Kurta Pajama, Sherwani, Saree, Lehenga, Anarkali, Sharara, Gharara, Kurti, Palazzo, Co-ord Set, Gowns, Shirts, Trousers, T-shirts, Blazers, Kids Frocks, Boys Kurtas).
- Determine target audience, gender presentation, and age group.
- Prescribe authentic Indian textiles (Banarasi, Kanjeevaram, Chanderi, Raw Silk, Mulmul, Linen, Combed Cotton).
- Prescribe authentic embellishments and craft details (Zardozi, Gota Patti, Mukaish, Chikankari, Antique Zari).
- **Enforce Product Clarity**: Formulate prominent, crystal-clear product headlines (e.g. `"Silk Kurta\nPajama."`, `"Bridal\nLehenga."`, `"Royal\nSherwani."`) so customers know immediately what is being showcased.
- **Enforce Garment Attribute Triplet**: Synthesize 3 concise garment attributes separated by `' | '` (e.g. `Raw Silk | Antique Zari | Tailored Fit`).
- **Enforce Full-Length Framing**: For any two-piece or multi-piece ethnic ensemble, explicitly command full-length or 3/4 standing framing to prevent waist-crops.
- Match requests to one of the 8 approved reference blueprints in `brand/reference-blueprints.json`.

## Step-by-Step Workflow

1. **Intake & Linguistic Analysis**:
   - Receive the user's prompt (e.g. *"Create a promotional post for a men's black kurta pajama"*, *"Create a festive saree campaign"*, *"Create a kids floral dress post"*).
   - Cross-reference with `brand/fashion-knowledge.json`.
   - Extract primary garment keywords and detect any implied occasion or audience.

2. **Taxonomy & Framing Assignment**:
   - **Kurta Pajama / Sherwani**:
     - Category: `mens` / `bridal` (Groom)
     - Audience: `men` / `groom`
     - Blueprint: `mens-everyday` or `festive-duo`
     - **Framing Directive**: `full-length` (head to ankles, showing both kurta and pajama/churidar with footwear)
     - **Headline**: `"Silk Kurta\nPajama."` or `"Royal\nSherwani."`
     - **Attributes**: `Raw Silk | Antique Zari | Tailored Fit`
   - **Lehenga / Bridal Gown**:
     - Category: `bridal`, Audience: `bride`
     - Blueprint: `bridal`
     - **Framing Directive**: `full-length` (head to toe showing lehenga flare, choli, and dupatta)
     - **Headline**: `"Royal Bridal\nLehenga."`
     - **Attributes**: `Velvet Silk | Zardozi Work | Regal Flare`
   - **Saree / Anarkali / Sharara / Gharara**:
     - Category: `festive`, Audience: `women`
     - Blueprint: `festive-ladies` or `festive-duo`
     - **Framing Directive**: `3/4 standing` or `full-length`
     - **Headline**: `"Heritage\nSaree."`
     - **Attributes**: `Kanjeevaram | Pure Zari Border | Timeless Drape`
   - **Kids Wear (Frock / Kurta)**:
     - Category: `kids`, Audience: `kids_girls` / `kids_boys`
     - Blueprint: `kids-wear`
     - **Headline**: `"Festive Kids\nCollection."`
     - **Attributes**: `Pure Cotton | Breathable Weave | Gentle on Skin`

3. **Styling & Creative Configuration**:
   - Select the brand color theme (`mens`, `bridal`, `festive`, `ladies`, `kids`, `peach`, `navy`, `haveli`).
   - Select the recommended template (`overlay` with architectural shadow scrim for cohesive background, or `split` with matched palette).
   - Pick the category badge icon (`shirt`, `dress`, `kids`, `lotus`) and label.

4. **Output Hand-off**:
   - Pass the structured `FashionAnalysis` object to downstream skills: `fashion-image-engine`, `render-social-post`, and `fashion-copywriting`.
