// Intelligent Product Photo & Video Requirement Engine
// Distinguishes between Scenario A (AI model sufficient) and Scenario B (Real product photo required with 6-point intake checklist).

import { existsSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { ROOT } from '../brand.ts';
import type { ProductIntakeRecommendation, ProductIntakeChecklist } from './types.ts';
import { analyzeUploadedProductImage, type PreservedGarmentFeatures } from '../product-preservation.ts';

export interface ProductIntakeDecisionOptions {
  query: string;
  garmentName?: string;
  hasInputPhoto?: boolean;
  inputPhotoPath?: string;
}

/**
 * Determines whether a campaign needs a real product photo or if an AI-generated model visual suffices.
 */
export function evaluateProductIntakeScenario(options: ProductIntakeDecisionOptions): ProductIntakeRecommendation {
  const { query, garmentName, hasInputPhoto, inputPhotoPath } = options;
  const q = query.toLowerCase();

  // If a photo was explicitly supplied or query specifically points to an actual physical product in inventory
  const isSpecificInventoryProduct =
    hasInputPhoto ||
    Boolean(inputPhotoPath) ||
    q.includes('our new') ||
    q.includes('in store') ||
    q.includes('this lehenga') ||
    q.includes('this kurta') ||
    q.includes('new arrival in stock') ||
    q.includes('uploaded') ||
    q.includes('preserve');

  const gName = garmentName || 'Indian Ethnic Garment';

  if (isSpecificInventoryProduct) {
    const checklist: ProductIntakeChecklist = {
      garmentTypeAndAudience: `Exact garment identification (e.g. "${gName}" for Groom/Men/Women/Kids).`,
      keyFeatures: 'Distinctive embellishments: fabric type (e.g. Banarasi raw silk), zardozi embroidery, collar style, and primary color palette.',
      photoRequirements: [
        'Front full-length or 3/4 standing photo showing top, bottom, and footwear on solid ground.',
        'Well-lit natural or studio daylight without harsh shadows or color filters.',
        'High resolution (minimum 1080px width, sharp focus on fabric texture).'
      ],
      lightingAndBackground: 'Clean solid or neutral architectural background with zero distractions.',
      optionalCloseups: 'High-detail macro close-up of embroidery, zari threads, or fabric weave.',
      commercialDetails: 'Optional: Verified price range, available size runs, or promotional timeline (leave blank if strictly concierge inquiry).'
    };

    return {
      scenario: 'scenario_b_real_product',
      rationale: `Promoting a specific physical inventory piece requires 100% garment pixel preservation. Scenario B is active to ensure the customer sees the authentic handcrafted garment.`,
      requiresPhotoUpload: !hasInputPhoto && !inputPhotoPath,
      checklist
    };
  }

  // Scenario A: AI visual is sufficient
  return {
    scenario: 'scenario_a_ai_model',
    rationale: `Broad campaign storytelling, festive greeting, or seasonal awareness ("${query}"). Scenario A applies: Photorealistic Indian human models can be generated autonomously without requiring a store photo shoot.`,
    requiresPhotoUpload: false
  };
}

/**
 * Validates an uploaded product image against the Monavi quality and preservation standards.
 */
export async function validateUploadedProductPhoto(photoPath: string): Promise<{
  valid: boolean;
  width?: number;
  height?: number;
  aspectRatio?: string;
  garmentAttributes?: PreservedGarmentFeatures;
  issues: string[];
}> {
  const fullPath = path.isAbsolute(photoPath) ? photoPath : path.resolve(ROOT, photoPath);
  if (!existsSync(fullPath)) {
    return { valid: false, issues: [`File not found at path: ${photoPath}`] };
  }

  const issues: string[] = [];
  try {
    const metadata = await sharp(fullPath).metadata();
    const w = metadata.width || 0;
    const h = metadata.height || 0;

    if (w < 1080 || h < 1080) {
      issues.push(`Resolution ${w}x${h} is below platform master standard (min 1080x1080). May cause pixelation.`);
    }

    const ratio = (w / h).toFixed(2);
    const garmentAttributes = await analyzeUploadedProductImage(photoPath);

    return {
      valid: issues.length === 0,
      width: w,
      height: h,
      aspectRatio: ratio,
      garmentAttributes,
      issues
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { valid: false, issues: [`Failed to inspect image: ${message}`] };
  }
}
