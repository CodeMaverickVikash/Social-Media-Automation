---
name: fashion-image-engine
description: Formulate photorealistic fashion campaign photography prompts (Workflow A) or preserve and composite uploaded garment photos into luxury editorial settings (Workflow B).
user-invocable: true
argument-hint: "--slug <slug> --query '<description>' [--input-photo <path>]"
---

# Fashion Image Generation & Product Preservation Skill

## Purpose
Directs both **Workflow A** (Text-to-Photorealism when no product image is supplied) and **Workflow B** (Garment Preservation & Editorial Setting when a user provides a product photo), generating 2× supersampled images ready for the Monavi rendering pipeline in full alignment with `brand/FASHION_EDITORIAL_PLAYBOOK.md`.

## Core Editorial Principles

1. **Complete Garment Visibility Mandate (Full-Length / 3-Quarter Framing)**:
   - For two-piece or multi-piece Indian ensembles (Kurta Pajama, Sherwani Churidar, Lehenga Choli, Saree, Safari Suit), prompts MUST demand **full-length standing or 3/4 standing framing**.
   - **Never crop at the waist, hips, or torso**. Both top (kurta/sherwani) and bottom (pajama/churidar) must be fully visible.
   - The model must be standing firmly on solid ground (sandstone paving, polished marble) with traditional footwear (embroidered juttis, mojaris).

2. **Continuous Single-Environment Background**:
   - The background must feel like a single cohesive editorial environment. Avoid harsh split color mismatches.
   - Compose settings with spacious negative space on the copy side (left 45-50% for left-aligned layouts).

3. **Zero-AI Photorealism & Optical Camera Specifications**:
   - **Banned AI Trigger Words**: Never include `photorealistic`, `ultra-realistic`, `hyper-detailed`, `masterpiece`, `8k`, `smooth skin`.
   - **Physical Camera Mechanics**: Specify `50mm f/2.8 prime lens or 85mm f/1.4`, `natural visible skin pores`, `authentic facial stubble`, `tangible fabric slub weave and gravity creasing`, and `directional ground contact shadows under footwear`.
   - **Negative Prompt Directives**: `plastic waxy skin, airbrushed, cartoon, CGI, 3D render, smooth porcelain skin, distorted hands, extra fingers, floating feet, no ground contact shadow, blurred embroidery`.

---

## Workflows

### Workflow A: User Does NOT Provide a Product Image
When the user requests a fashion post or campaign (e.g., *"Create an Instagram post for a men's black kurta pajama"*):

1. **Identify Garment & Demographics**:
   - Men's ethnic wear -> Indian male model with confident, poised demeanor and athletic posture.
   - Kids' wear -> Indian child model with joyful, natural expressions and playful posture.
   - Bridal wear -> Indian bridal model in regal stance with dewy skin, kohl-rimmed eyes, and intricate jewellery.

2. **Formulate Master Editorial Prompt**:
   - Structure prompt:
     `[Framing] [Model Demographics & Pose] wearing [Garment Description with Fabric & Craft Details], standing in [Heritage Architectural Setting], [Optical Specifications & Lighting], [Ground Contact & Footwear], [Negative Space Directive]`.
   - Example for Kurta Pajama:
     > Full-length commercial fashion photograph of a handsome 28-year-old Indian male model standing poised in an open sandstone haveli courtyard during golden hour. He is wearing a midnight black raw silk knee-length kurta with antique gold zari embroidery on the mandarin collar, paired with a fitted ivory churidar pajama and traditional black velvet juttis. Shot with a 50mm f/2.8 lens at eye level. Natural visible skin pores, subtle authentic facial stubble, sharp focus on raw silk fabric texture and gravity folds. Physical directional contact shadows cast naturally on the sandstone floor beneath his feet. Left 45% of frame features soft architectural colonnade in soft focus providing calm negative space.

3. **Execution**:
   ```bash
   node scripts/fashion-image.ts --slug <slug> --query "<prompt>" --aspect 4:5
   ```
   Writes `<photo>.ai.json` provenance sidecar and verifies placement suitability.

### Workflow B: User PROVIDES a Product Image
When the user supplies a garment photograph:

1. **Garment Pixel Preservation (Zero Alteration Rule)**:
   - Treat the uploaded image as the product source of truth.
   - Retain exact physical garment colors, fabric textures, embroidery motifs, and cut without alteration.
   - Never replace the product with an unrelated garment.

2. **Editorial Setting Enhancement**:
   - Build a luxury ambient architectural background with directional lighting and soft shadows around the authentic garment.
   - Composite using Sharp with Lanczos3 resampling at 2× supersampling.

3. **Execution**:
   ```bash
   node scripts/fashion-image.ts --slug <slug> --query "<description>" --input-photo "<path>" --aspect 4:5
   ```

---

## Quality Checklist
- **Framing**: Full ensemble visible (kurta + pajama, sherwani + churidar, etc.). No waist crops on two-piece sets.
- **Anatomy**: Correct hands and fingers (5 fingers per hand, natural joints).
- **Surface Contact**: Physical contact shadows under feet/footwear.
- **Skin Texture**: Natural skin pores and texture, zero plastic or airbrushed sheen.
- **Resolution**: 2× supersampling (at least 2160×2700 for 4:5 feed, 2160×3840 for 9:16 story/reel).
- **Profile**: sRGB color profile, no banding, no blown-out highlights.
- **Sidecar**: Valid `<photo>.ai.json` must be present next to the image.
