---
name: product-reference-preservation
description: "Analyze uploaded product photos, extract physical garment attributes, and enforce 100% preservation of authentic colors, embroidery, fabrics, and tailoring during video and image generation."
---

# Product Reference Preservation — Monavi Collection

Enforces **PRODUCT ACCURACY > CREATIVE FREEDOM** for all Workflow B operations across Monavi Collection creative pipelines.

## Purpose

When a user supplies a product photograph, the uploaded image is the primary source of truth. The AI must never invent, replace, or alter the authentic garment design.

## Preservation Checklist

1. **Colors & Tones**:
   - Extract raw hex values from the uploaded photo.
   - Ban unauthorized color shifting, desaturation, or heavy filters that alter garment shade.
2. **Fabric & Texture**:
   - Preserve natural fabric slubs, weave densities, and material sheen (e.g. raw silk, georgette, velvet, cotton).
3. **Embroidery & Embellishments**:
   - Keep 100% of authentic zari motifs, zardozi needlework, and gota patti borders intact.
4. **Cuts & Silhouettes**:
   - Maintain exact neckline depth, collar shape, sleeve lengths, and hemline gathers without distortion.
5. **No AI Hallucinations**:
   - Never replace the user's authentic garment with a generic AI concept.

## Code Usage

```typescript
import { analyzeUploadedProductImage, preparePreservedGarmentAsset } from './scripts/lib/product-preservation.ts';

// Extract garment physical features
const features = await analyzeUploadedProductImage(inputPhotoPath, "Women's Red Saree");

// Prepare composite asset
const result = await preparePreservedGarmentAsset({
  slug: 'womens-red-saree-2026-11',
  inputPhotoPath,
  userHint: "Women's Red Saree"
});
```
