// Character and Location Consistency Engine
// Ensures characters, garments, environments, and locations remain 100% consistent across multi-clip productions.

import { existsSync } from 'node:fs';
import path from 'node:path';
import { ROOT } from '../brand.ts';
import type { CharacterReference, LocationReference } from './director-types.ts';
import { analyzeFashionRequest, type FashionAnalysis } from '../fashion-intelligence.ts';
import { preparePreservedGarmentAsset, type ProductPreservationResult } from '../product-preservation.ts';

/**
 * Creates and registers characters for the film production with permanent identity anchors.
 */
export async function initializeFilmCharacters(options: {
  slug: string;
  query: string;
  inputPhotoPath?: string;
  analysis: FashionAnalysis;
}): Promise<Record<string, CharacterReference>> {
  const { slug, query, inputPhotoPath, analysis } = options;

  let preservation: ProductPreservationResult | null = null;
  if (inputPhotoPath && existsSync(path.isAbsolute(inputPhotoPath) ? inputPhotoPath : path.join(ROOT, inputPhotoPath))) {
    preservation = await preparePreservedGarmentAsset({
      slug,
      inputPhotoPath,
      userHint: query
    });
  }

  const cat = analysis.category;
  const gender = (analysis.targetAudience === 'men' || analysis.genderPresentation === 'male')
    ? 'male'
    : (analysis.targetAudience === 'kids' || analysis.category === 'kids')
      ? 'child'
      : 'female';

  // Extract preserved product attributes if available
  const primaryHex = preservation?.features.dominantColors[0]?.hex || (gender === 'male' ? '#1B2A4A' : '#8B1E28');
  const secondaryHex = preservation?.features.dominantColors[1]?.hex || '#D4AF37';
  const fabric = preservation?.features.fabricTexture || analysis.styling.fabrics[0] || 'Heritage Silk';
  const embroidery = preservation?.features.embroideryType || analysis.styling.embellishments[0] || 'Antique Zari';

  const characters: Record<string, CharacterReference> = {};

  if (gender === 'female') {
    const isBridal = cat === 'bridal';
    const charId = isBridal ? 'char_priya_bride' : 'char_ananya_muse';
    characters[charId] = {
      characterId: charId,
      name: isBridal ? 'Priya (Royal Bride)' : 'Ananya (Monavi Muse)',
      gender: 'female',
      ageRange: isBridal ? '24-26' : '23-27',
      appearance: {
        faceDetails: 'Oval face, defined high cheekbones, almond brown eyes, warm undertones, radiant natural dewy skin',
        hairstyle: isBridal ? 'Low floral gajra bun with delicate loose tendrils' : 'Polished center-parted silky waves draped over shoulder',
        skinTone: 'Warm olive South Asian skin with natural pores, zero airbrushed plastic texture',
        eyes: 'Deep kohl-rimmed expressive eyes with confident, serene gaze',
        bodyProportions: '5ft 7in, poised posture, fluid graceful movements'
      },
      clothing: {
        outfitName: analysis.garmentDisplayName,
        garmentType: analysis.garmentType,
        primaryColorHex: primaryHex,
        secondaryColorHex: secondaryHex,
        fabric,
        embroidery,
        silhouette: analysis.styling.silhouette
      },
      accessories: isBridal
        ? ['Polki & Kundan choker', 'delicate maang tikka', 'traditional bridal chooda', 'matching gold jhumkas']
        : ['Subtle heritage gold earrings', 'delicate thin bangle', 'minimal footwear'],
      personality: isBridal ? 'Serene, regal, deeply emotive, joyous royal bride' : 'Modern, graceful, dignified, discerning elegance',
      role: 'Protagonist Model',
      movementStyle: 'Slow poised walking, elegant drapery turns, calm confident eye contact',
      promptConsistencyBlock: `[CHARACTER IDENTIFIER: ${charId}] Authentic 25yo Indian female fashion model, ${isBridal ? 'regal bride' : 'modern Indian muse'}, warm olive skin with natural skin pores, wearing exact ${analysis.garmentDisplayName} in hex ${primaryHex} with ${secondaryHex} ${embroidery} embroidery.`
    };
  } else if (gender === 'male') {
    const charId = 'char_kabir_gentleman';
    characters[charId] = {
      characterId: charId,
      name: 'Kabir (Monavi Gentleman)',
      gender: 'male',
      ageRange: '28-30',
      appearance: {
        faceDetails: 'Chiseled jawline, neat groomed stubble, confident warm dark eyes, masculine symmetry',
        hairstyle: 'Classic neat gentleman side-sweep taper fade',
        skinTone: 'Rich warm honey Indian skin texture',
        eyes: 'Focused, charismatic, discerning gaze',
        bodyProportions: '6ft, athletic tailored build, upright commanding stance'
      },
      clothing: {
        outfitName: analysis.garmentDisplayName,
        garmentType: analysis.garmentType,
        primaryColorHex: primaryHex,
        secondaryColorHex: secondaryHex,
        fabric,
        embroidery,
        silhouette: 'Bespoke tailored bandhgala / kurta pajama cut'
      },
      accessories: ['Handcrafted mojris in distressed brown leather', 'minimal brass pocket detail'],
      personality: 'Understated luxury, effortless confidence, culturally rooted gentleman',
      role: 'Protagonist Model',
      movementStyle: 'Deliberate strides, hands casually resting, natural shoulder sway',
      promptConsistencyBlock: `[CHARACTER IDENTIFIER: ${charId}] Authentic 28yo Indian male model, neat groomed stubble, athletic build, wearing bespoke tailored ${analysis.garmentDisplayName} in ${primaryHex} with subtle ${secondaryHex} details.`
    };
  } else {
    const charId = 'char_aarav_junior';
    characters[charId] = {
      characterId: charId,
      name: 'Aarav (Monavi Junior)',
      gender: 'child',
      ageRange: '6-8',
      appearance: {
        faceDetails: 'Bright cheerful smile, sparkling expressive eyes, cherubic cheeks',
        hairstyle: 'Neat side-combed soft hair',
        skinTone: 'Radiant warm fair-to-medium Indian skin',
        eyes: 'Playful, twinkling eyes',
        bodyProportions: 'Healthy, active child build'
      },
      clothing: {
        outfitName: analysis.garmentDisplayName,
        garmentType: analysis.garmentType,
        primaryColorHex: primaryHex,
        secondaryColorHex: secondaryHex,
        fabric: 'Soft breathable cotton-silk blend',
        embroidery: 'Lightweight festive border',
        silhouette: 'Comfortable relaxed fit'
      },
      accessories: ['Comfortable soft-soled festive footwear'],
      personality: 'Joyful, lively, celebratory, candid laughter',
      role: 'Protagonist Child Model',
      movementStyle: 'Spontaneous twirls, laughing turns, festive celebration hops',
      promptConsistencyBlock: `[CHARACTER IDENTIFIER: ${charId}] 7yo cheerful Indian child model, sparkling eyes, wearing comfortable festive ${analysis.garmentDisplayName} in ${primaryHex}.`
    };
  }

  return characters;
}

/**
 * Creates and registers cinematic locations for the film with architectural anchors.
 */
export function initializeFilmLocations(options: {
  analysis: FashionAnalysis;
}): Record<string, LocationReference> {
  const { analysis } = options;
  const cat = analysis.category;

  const locations: Record<string, LocationReference> = {};

  if (cat === 'bridal' || cat === 'festive') {
    // Primary Location: Royal Heritage Haveli Courtyard
    locations['loc_heritage_haveli'] = {
      locationId: 'loc_heritage_haveli',
      name: 'Jaipur Royal Heritage Haveli Courtyard',
      environmentType: 'palace-courtyard',
      architecture: 'Intricately hand-carved Rajasthan sandstone arches, fluted Mughal pillars, jali stone lattices',
      backgroundDescription: 'Opulent palace central courtyard with polished marble floor reflecting golden sunlight, stone fountain adorned with fresh marigold petals, lush tropical palm foliage in bronze planters',
      lighting: 'golden-hour',
      colorPalette: ['#C89D7C', '#F3E5D8', '#8B1E28', '#2C4C38'],
      props: ['Brass oil urns', 'marigold floral garlands', 'carved wooden palace swing with raw silk cushions'],
      cameraPositioning: 'Low-to-eye level on central courtyard axis, shooting through arches for framing depth',
      promptConsistencyBlock: `[LOCATION IDENTIFIER: loc_heritage_haveli] Ancient Jaipur royal palace courtyard, carved pink sandstone Mughal arches, marble flooring with subtle reflections, fresh marigold garlands, warm 5000K golden-hour illumination.`
    };

    // Secondary Location: Royal Verandah & Jharokha
    locations['loc_royal_verandah'] = {
      locationId: 'loc_royal_verandah',
      name: 'Amber Fort Royal Jharokha Verandah',
      environmentType: 'heritage-verandah',
      architecture: 'Stone balustrade with panoramic view of Aravalli hills, cusped archways, antique brass lanterns',
      backgroundDescription: 'Shaded stone verandah opening out into hazy sun-kissed hill landscape, gentle breeze moving sheer ivory linen drapes',
      lighting: 'soft-editorial-diffused',
      colorPalette: ['#DFD3C3', '#C7B198', '#A27B5C'],
      props: ['Antique brass standing mirror', 'ornate floor cushions'],
      cameraPositioning: 'Side-profile tracking along the stone corridor with natural architectural framing',
      promptConsistencyBlock: `[LOCATION IDENTIFIER: loc_royal_verandah] Heritage palace stone verandah, Amber Fort jharokha balcony, sheer linen curtains drifting in breeze, soft diffused daylight.`
    };
  } else if (cat === 'mens') {
    // Location 1: Luxury Minimalist Boutique Verandah
    locations['loc_modern_heritage'] = {
      locationId: 'loc_modern_heritage',
      name: 'Contemporary Heritage Atrium',
      environmentType: 'boutique-interior',
      architecture: 'Exposed dark slate stone walls paired with teak wood panels and floor-to-ceiling glass atrium',
      backgroundDescription: 'Minimalist high-end bespoke lounge, architectural indoor ficus tree, clean negative space',
      lighting: 'soft-editorial-diffused',
      colorPalette: ['#1F2421', '#404E4D', '#F4F4F2'],
      props: ['Mid-century teak lounger', 'brass geometric floor lamp'],
      cameraPositioning: 'Eye-level wide and medium tracking shots emphasizing sharp tailored vertical lines',
      promptConsistencyBlock: `[LOCATION IDENTIFIER: loc_modern_heritage] Minimalist luxury boutique atrium, dark slate stone and warm teak panels, diffuse architectural natural lighting.`
    };
  } else {
    // Location: Sunlit Festive Lawn & Terrace
    locations['loc_festive_terrace'] = {
      locationId: 'loc_festive_terrace',
      name: 'Sunlit Heritage Palace Terrace',
      environmentType: 'royal-garden',
      architecture: 'Stone terrace bordered with decorative balustrade and blooming bougainvillea vines',
      backgroundDescription: 'Bright sunny open-air terrace, festive celebration atmosphere, natural blue sky and emerald foliage',
      lighting: 'high-key-studio',
      colorPalette: ['#FAF0D7', '#8CC0DE', '#FFD966'],
      props: ['Festive brass platters', 'terracotta flower pots'],
      cameraPositioning: 'Dynamic walking follow-shots capturing playful light and natural movement',
      promptConsistencyBlock: `[LOCATION IDENTIFIER: loc_festive_terrace] Sunny open-air heritage garden terrace, bougainvillea blossoms, clear skies, bright festive natural daylight.`
    };
  }

  return locations;
}
