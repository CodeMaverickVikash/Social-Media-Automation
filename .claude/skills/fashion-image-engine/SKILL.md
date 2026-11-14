---
name: fashion-image-engine
description: Formulate photorealistic fashion campaign photography prompts (Workflow A) or preserve and composite uploaded garment photos into luxury editorial settings (Workflow B).
user-invocable: true
argument-hint: "--slug <slug> --query '<description>' [--input-photo <path>]"
---

# Fashion Image Generation & Product Preservation Skill

## Purpose
Directs both **Workflow A** (Text-to-Photorealism when no product image is supplied) and **Workflow B** (Garment Preservation & Editorial Setting when a user provides a product photo), generating 2× supersampled images ready for the Monavi rendering pipeline.

## Workflows

### Workflow A: User Does NOT Provide a Product Image
When the user only enters a product name or campaign concept (e.g., *"Create an Instagram post for a men's black kurta pajama"*):
1. **Identify Product & Model Demographics**:
   - Men's ethnic wear -> Indian male model with confident, poised demeanor and athletic posture.
   - Kids' wear -> Indian child model with joyful, natural expressions and playful posture.
   - Bridal wear -> Indian bridal model in regal stance with dewy skin, kohl-rimmed eyes, and intricate jewellery.
2. **Fabric & Garment Details**:
   - Specify exact weave, texture, buttons, and drapery (e.g., raw silk weave, zari border catchlights, fine mulmul cotton).
3. **Setting & Lighting Setup**:
   - Culturally authentic background: Sandstone jharokhas, heritage havelis, sunlit manicured lawns, or minimalist slate studios.
   - Commercial fashion lighting: Large softbox octabank with subtle rim light and natural micro-shadows.
4. **Mandatory Negative Space**:
   - Reserve the left 40% (or lower 30%) for typographic text overlays and the Monavi logo lockup.
5. **Execution**:
   ```bash
   node scripts/fashion-image.ts --slug <slug> --query "<prompt>" --aspect 4:5
   ```
   Writes `<photo>.ai.json` provenance sidecar and prints placement suitability.

### Workflow B: User PROVIDES a Product Image
When the user supplies a garment photograph:
1. **Garment Preservation (Zero Modification Rule)**:
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

## Quality Checklist
- **Anatomy**: Correct hands and fingers (5 fingers per hand, natural joints).
- **Resolution**: 2× supersampling (at least 2160×2700 for 4:5 feed, 2160×3840 for 9:16 story/reel).
- **Profile**: sRGB color profile, no banding, no blown-out highlights.
- **Sidecar**: Valid `<photo>.ai.json` must be present next to the image.
