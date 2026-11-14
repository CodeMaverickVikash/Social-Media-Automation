// Intelligent Fashion Product Understanding & Taxonomy Engine
// Analyzes natural-language requests into rich fashion metadata, audience, occasion,
// styling, prompt parameters, and creative blueprints.

import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { ROOT } from './brand.ts';

export type FashionCategory = 'mens' | 'ladies' | 'kids' | 'bridal' | 'festive' | 'everyday';
export type TargetAudience = 'men' | 'women' | 'bride' | 'groom' | 'couple' | 'kids' | 'kids_boys' | 'kids_girls' | 'family';
export type ModelComposition = 'single' | 'duo_couple' | 'family';
export type AgeGroup = 'adult' | 'young_adult' | 'child' | 'toddler';
export type Occasion = 'wedding' | 'bridal' | 'festive' | 'everyday' | 'smart_casual' | 'cocktail' | 'summer' | 'party';

export interface FashionAnalysis {
  category: FashionCategory;
  modelComposition: ModelComposition;
  garmentType: string;
  garmentDisplayName: string;
  targetAudience: TargetAudience;
  genderPresentation: 'male' | 'female' | 'unisex' | 'child_boy' | 'child_girl';
  ageGroup: AgeGroup;
  occasion: Occasion;
  styling: {
    fabrics: string[];
    embellishments: string[];
    accessories: string[];
    colors: string[];
    silhouette: string;
  };
  photography: {
    environment: string;
    lighting: string;
    modelPose: string;
    composition: string;
    negativeSpace: 'left' | 'bottom' | 'center';
  };
  creative: {
    theme: string;
    template: 'overlay' | 'split' | 'arch' | 'card' | 'banner';
    blueprintKey: string;
    eyebrow: string;
    headline: string;
    subline?: string;
    attrs: string[];
    cta: string;
    badge: { icon: string; label: string };
  };
  social: {
    platforms: string[];
    formats: string[];
    hashtags: string[];
    suggestedHook: string;
  };
  needsClarification: boolean;
  clarificationQuestion?: string;
}

interface FashionKnowledge {
  brand: Record<string, unknown>;
  paletteRules: Record<string, { primary: string; secondary: string; background: string; accent: string; text: string; mood: string }>;
  garmentTaxonomy: Record<string, {
    category: FashionCategory;
    audience: string;
    collection: string;
    theme: string;
    festiveTheme?: string;
    icon: string;
    badge: string;
    template: 'overlay' | 'split' | 'arch' | 'card' | 'banner';
    alternativeTemplate?: 'overlay' | 'split' | 'arch' | 'card' | 'banner';
    referenceBlueprint: string;
    attrs: string[];
    fabrics: string[];
    colors: string[];
    occasions: string[];
    hashtags: string[];
  }>;
}

let KNOWLEDGE_CACHE: FashionKnowledge | null = null;
function getKnowledge(): FashionKnowledge {
  if (KNOWLEDGE_CACHE) return KNOWLEDGE_CACHE;
  const f = path.join(ROOT, 'brand', 'fashion-knowledge.json');
  if (existsSync(f)) {
    KNOWLEDGE_CACHE = JSON.parse(readFileSync(f, 'utf8')) as FashionKnowledge;
  } else {
    KNOWLEDGE_CACHE = { brand: {}, paletteRules: {}, garmentTaxonomy: {} } as FashionKnowledge;
  }
  return KNOWLEDGE_CACHE;
}

/**
 * Intelligent parser that converts natural language request into fashion direction.
 */
export function analyzeFashionRequest(query: string, options?: { hasProductImage?: boolean; explicitPlatforms?: string[] }): FashionAnalysis {
  const q = query.toLowerCase();
  const k = getKnowledge();

  // 1. Detect Category, Audience & Garment Type
  let detectedGarmentKey = '';
  let category: FashionCategory = 'everyday';
  let audience: TargetAudience = 'women';
  let gender: 'male' | 'female' | 'unisex' | 'child_boy' | 'child_girl' = 'female';
  let age: AgeGroup = 'adult';
  let occasion: Occasion = 'everyday';

  // Check specific high-priority keywords
  const isKid = /\b(kid|kids|child|children|boy|boys|girl|girls|toddler|baby|little|frock)\b/i.test(q);
  const isMen = /\b(man|men|mens|men's|boy|groom|sherwani|kurta pajama|kurta pyjama|nehru jacket|bandhgala|blazer|shirt|trousers|pant|t-shirt|tee|jeans|pathani)\b/i.test(q);
  const isBridal = /\b(bride|bridal|groom|wedding|trousseau|shaadi|shaad|dulhan|dulha|varmala)\b/i.test(q);
  const isFestive = /\b(festive|festival|diwali|eid|navratri|durga|karwa|puja|celebration|mehendi|sangeet|seasion|season)\b/i.test(q);

  // Autonomous Single vs Multiple Model Composition Detection:
  // - Single Model: when the user explicitly requests a specific single garment or single gender (e.g. "for men", "for bride", "kids frock").
  // - Multiple Models (Duo / Couple): when the prompt is a broad campaign/marketing post for a clothing business for wedding/festive without restricting to one gender, or explicitly requests couple/duo/jodi.
  // - Multiple Models (Family): when family celebrations, whole family, or parents and kids are mentioned.
  const isCoupleExplicit = /\b(couple|duo|pair|both|bride and groom|groom and bride|husband and wife|jodi)\b/i.test(q);
  const isFamily = /\b(family|familly|puri\s*familly|puri\s*family|whole\s*family|parents\s*and\s*kids|family\s*wedding|family\s*collection)\b/i.test(q);
  const hasSpecificSingleGender = /\b(for men|for man|for groom|for women|for woman|for bride|for girl|for boy|for kid|only bride|only groom|him|her)\b/i.test(q);
  const isBroadCampaignOrStore = /\b(marketing post|campaign|clothing business|clothing store|clothing brand|boutique|wedding edit|shaadi edit|shaadi session|shaadi season|wedding season)\b/i.test(q);

  let modelComposition: ModelComposition = 'single';
  if (isFamily) {
    modelComposition = 'family';
  } else if (isCoupleExplicit || (isBroadCampaignOrStore && !hasSpecificSingleGender && (isBridal || isFestive))) {
    modelComposition = 'duo_couple';
  }

  // Match against known garment taxonomy in fashion-knowledge.json
  for (const [key, item] of Object.entries(k.garmentTaxonomy)) {
    const rawName = item.badge.toLowerCase();
    const keyMatch = key.replace(/-/g, ' ');
    if (q.includes(keyMatch) || q.includes(key) || (item.attrs && item.attrs.some(a => q.includes(a.toLowerCase())))) {
      detectedGarmentKey = key;
      break;
    }
  }

  // Refined direct garment keyword searches if not yet matched
  if (!detectedGarmentKey) {
    if (q.includes('kurta pajama') || q.includes('kurta pyjama') || (q.includes('kurta') && isMen && !isKid)) {
      detectedGarmentKey = 'kurta-pajama';
    } else if (q.includes('sherwani') || q.includes('bandhgala')) {
      detectedGarmentKey = 'sherwani';
    } else if (q.includes('t-shirt') || q.includes('tshirt') || q.includes('tee')) {
      detectedGarmentKey = 'mens-tshirt';
    } else if (q.includes('shirt') && isMen && !isKid) {
      detectedGarmentKey = 'mens-shirt';
    } else if (q.includes('trouser') || q.includes('pant') || q.includes('chino')) {
      detectedGarmentKey = 'mens-trouser';
    } else if (q.includes('blazer') || q.includes('suit') && isMen) {
      detectedGarmentKey = 'mens-blazer';
    } else if (q.includes('jeans') || q.includes('denim')) {
      detectedGarmentKey = 'mens-jeans';
    } else if (q.includes('nehru jacket') || q.includes('bandi') || q.includes('waistcoat')) {
      detectedGarmentKey = 'nehru-jacket';
    } else if (q.includes('sharara')) {
      detectedGarmentKey = 'sharara';
    } else if (q.includes('gharara')) {
      detectedGarmentKey = 'gharara';
    } else if (q.includes('lehenga') || q.includes('ghagra')) {
      detectedGarmentKey = 'lehenga';
    } else if (q.includes('saree') || q.includes('sari')) {
      detectedGarmentKey = 'saree';
    } else if (q.includes('anarkali')) {
      detectedGarmentKey = 'anarkali';
    } else if (q.includes('co-ord') || q.includes('coord') || q.includes('co ord')) {
      detectedGarmentKey = 'co-ord-set';
    } else if (q.includes('palazzo')) {
      detectedGarmentKey = 'palazzo';
    } else if (q.includes('kurti') || q.includes('tunic')) {
      detectedGarmentKey = 'kurti';
    } else if (q.includes('gown')) {
      detectedGarmentKey = 'gown';
    } else if (isKid && (q.includes('dress') || q.includes('frock') || q.includes('floral'))) {
      detectedGarmentKey = 'kids-floral-dress';
    } else if (isKid && q.includes('kurta')) {
      detectedGarmentKey = 'kids-kurta-pajama';
    } else if (isKid) {
      detectedGarmentKey = 'kids-ethnic-set';
    }
  }

  // Determine Audience & Category
  if (modelComposition === 'family') {
    category = (isBridal || q.includes('shaad') || q.includes('wedding')) ? 'bridal' : 'festive';
    audience = 'family';
    gender = 'unisex';
    age = 'adult';
    detectedGarmentKey = (isBridal || q.includes('shaad') || q.includes('wedding'))
      ? 'shaadi-family-collection'
      : 'festive-family-collection';
  } else if (modelComposition === 'duo_couple') {
    category = isBridal ? 'bridal' : 'festive';
    audience = 'couple';
    gender = 'unisex';
    age = 'adult';
    detectedGarmentKey = detectedGarmentKey || (isBridal ? 'shaadi-couple-collection' : 'festive-couple-duo');
  } else if (isKid) {
    category = 'kids';
    age = 'child';
    if (/\b(girl|girls|daughter|frock|dress)\b/i.test(q)) {
      audience = 'kids_girls';
      gender = 'child_girl';
    } else if (/\b(boy|boys|son)\b/i.test(q)) {
      audience = 'kids_boys';
      gender = 'child_boy';
    } else {
      audience = 'kids';
      gender = 'unisex';
    }
  } else if (isBridal) {
    if (/\b(groom|dulha|man|men)\b/i.test(q)) {
      category = 'bridal';
      audience = 'groom';
      gender = 'male';
    } else {
      category = 'bridal';
      audience = 'bride';
      gender = 'female';
    }
  } else if (isMen) {
    category = isFestive ? 'festive' : 'mens';
    audience = 'men';
    gender = 'male';
  } else if (isFestive) {
    category = 'festive';
    audience = 'women';
    gender = 'female';
  } else {
    category = 'ladies';
    audience = 'women';
    gender = 'female';
  }

  // Determine Occasion
  if (isBridal || q.includes('wedding') || q.includes('shaadi') || q.includes('reception')) {
    occasion = 'wedding';
  } else if (isFestive || q.includes('diwali') || q.includes('eid') || q.includes('puja') || q.includes('sangeet')) {
    occasion = 'festive';
  } else if (q.includes('cocktail') || q.includes('evening') || q.includes('party')) {
    occasion = 'cocktail';
  } else if (q.includes('summer') || q.includes('breeze') || q.includes('floral')) {
    occasion = 'summer';
  } else if (q.includes('casual') || q.includes('weekend') || q.includes('t-shirt') || q.includes('jeans')) {
    occasion = 'smart_casual';
  } else {
    occasion = 'everyday';
  }

  // Look up or synthesize garment metadata
  const garmentInfo = k.garmentTaxonomy[detectedGarmentKey] ?? {
    category,
    audience: String(audience),
    collection: category,
    theme: category === 'mens' ? 'mens' : category === 'bridal' ? 'bridal' : category === 'festive' ? 'festive' : category === 'kids' ? 'kids' : 'ladies',
    icon: category === 'mens' ? 'shirt' : category === 'kids' ? 'kids' : category === 'bridal' ? 'lotus' : 'dress',
    badge: category === 'mens' ? "Men's Wear" : category === 'kids' ? "Kids Wear" : category === 'bridal' ? "Bridal" : "Ladies Wear",
    template: (category === 'mens' && !isFestive) ? 'split' : category === 'kids' ? 'arch' : 'overlay',
    referenceBlueprint: category === 'mens' ? 'mens-everyday' : category === 'bridal' ? 'bridal' : category === 'kids' ? 'kids-wear' : isFestive ? 'festive-ladies' : 'ladies-contemporary',
    attrs: category === 'mens' ? ['Classic', 'Modern', 'Versatile'] : category === 'kids' ? ['Comfortable', 'Playful', 'Everyday'] : category === 'bridal' ? ['Timeless', 'Handcrafted look', 'Celebration-ready'] : ['Elegant', 'Comfortable', 'Timeless'],
    fabrics: ['Cotton Silk', 'Fine Chanderi', 'Breathable Linen', 'Georgette'],
    colors: ['Ivory', 'Maroon', 'Navy', 'Rose Pink', 'Sage Green'],
    occasions: [occasion],
    hashtags: ['#MonaviCollection', '#WearYourStory', '#IndianFashion', '#ContemporaryStyle']
  };

  // Determine Display Name
  let garmentDisplayName = detectedGarmentKey
    ? detectedGarmentKey.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    : 'Fashion Collection';

  if (modelComposition === 'duo_couple') {
    garmentDisplayName = (isBridal || occasion === 'wedding') ? 'Royal Shaadi Collection' : 'Festive Couple Collection';
  } else if (modelComposition === 'family') {
    garmentDisplayName = 'Festive Family Collection';
  }

  // Determine Photography & Setting Direction
  let environment = 'Minimal luxury studio with soft architectural shadows and warm limestone textures';
  let lighting = 'Commercial editorial lighting, large softbox octabank, gentle warm rim light';
  let modelPose = 'Poised and confident posture, natural eye contact, elegant stance';
  let negativeSpace: 'left' | 'bottom' | 'center' = 'left';

  if (modelComposition === 'family') {
    environment = 'Regal Indian heritage haveli courtyard with carved sandstone pillars and warm festive lantern glow';
    lighting = 'Cinematic warm amber golden hour lighting, rich specular highlights on silks and zari';
    modelPose = 'Joyful royal Indian family (Father, Mother, Children) standing poised together in celebratory elegance with warm authentic smiles';
    negativeSpace = 'left';
  } else if (modelComposition === 'duo_couple') {
    environment = 'Regal Indian heritage palace courtyard, subtle jharokha arches, warm ambient lantern glow';
    lighting = 'Cinematic warm amber lighting, golden hour highlights catching metallic zari embroidery';
    modelPose = 'Royal Indian wedding couple (Duo) standing poised together: groom in tailored sherwani, bride in flared bridal lehenga with serene grace';
    negativeSpace = 'left';
  } else if (category === 'bridal') {
    environment = 'Regal Indian heritage palace courtyard, subtle jharokha arches, warm ambient lantern glow';
    lighting = 'Cinematic warm amber lighting, golden hour highlights catching metallic zari embroidery';
    modelPose = 'Graceful and regal royal bridal posture, head slightly tilted, serene celebratory confidence';
    negativeSpace = 'left';
  } else if (category === 'festive') {
    environment = 'Warm heritage courtyard with marigold floral decor and carved sandstone pillars';
    lighting = 'Warm golden hour ambient light, rich specular reflections on silks';
    modelPose = 'Radiant, festive smile, poised celebratory stance with natural garment movement';
    negativeSpace = 'left';
  } else if (category === 'mens') {
    environment = occasion === 'wedding'
      ? 'Royal haveli interior with arched doorways and deep moody tones'
      : 'Contemporary architectural studio with midnight slate paneling, stone plinths, and clean geometric lines';
    lighting = 'Structured directional lighting with high-contrast chiaroscuro shadows defining shoulders and jawline';
    modelPose = 'Standing tall with relaxed confidence, one hand in pocket, sharp masculine silhouette';
    negativeSpace = 'left';
  } else if (category === 'kids') {
    environment = 'Sun-drenched botanical garden lawn or bright airy sunroom with natural light';
    lighting = 'Bright, soft, diffused daylight with gentle pastel reflections';
    modelPose = 'Joyful, spontaneous candid moment, cheerful natural laugh, happy twirl or playful posture';
    negativeSpace = 'bottom';
  } else if (category === 'ladies') {
    environment = 'Warm sunlit boutique patio with terracotta pots and cream-washed textured walls';
    lighting = 'Soft natural daylight with gentle bounce fill, delicate shadows highlighting fabric drape';
    modelPose = 'Relaxed and graceful posture, natural elegance, effortless charm';
    negativeSpace = 'left';
  }

  // Determine Headline, Subline & Copy
  let eyebrow = category === 'mens' ? "MEN'S COLLECTION"
    : category === 'bridal' ? 'BRIDAL COUTURE'
    : category === 'festive' ? 'FESTIVE COLLECTION'
    : category === 'kids' ? 'LITTLE ONES'
    : 'NEW ARRIVALS';

  let headline = 'Style That Feels\nLike You.';
  let cta = 'Explore Collection';
  let attrs = garmentInfo.attrs || ['Classic', 'Comfortable', 'Timeless'];

  if (modelComposition === 'family') {
    eyebrow = (isBridal || occasion === 'wedding' || q.includes('shaad')) ? 'SHAADI SEASON 2026' : 'FESTIVE COLLECTION';
    headline = 'Family Wedding\nCollection.';
    attrs = ['Men\'s | Ladies | Kids | Custom Fits'];
    cta = 'Explore Family Edit';
    garmentDisplayName = 'Royal Family Shaadi Collection';
  } else if (modelComposition === 'duo_couple') {
    eyebrow = (isBridal || occasion === 'wedding') ? 'SHAADI SEASON 2026' : 'FESTIVE COLLECTION';
    headline = (isBridal || occasion === 'wedding') ? 'Royal Wedding\nCollection.' : 'The Festive\nDuo.';
    attrs = (isBridal || occasion === 'wedding')
      ? ['Bridal & Groom', 'Royal Heritage', 'Bespoke Fit']
      : ['Lehengas | Kurtas | Festive Edit'];
    cta = 'Explore The Edit';
  } else if (category === 'mens') {
    if (occasion === 'wedding' || detectedGarmentKey === 'sherwani') {
      headline = 'Traditional Roots,\nModern Grace.';
      attrs = ['Regal', 'Tailored', 'Wedding-ready'];
      cta = 'Explore Collection';
    } else {
      headline = 'Everyday Style.\nLasting Confidence.';
      attrs = ['Classic', 'Modern', 'Versatile'];
      cta = 'Explore Collection';
    }
  } else if (category === 'bridal') {
    headline = 'Timeless Elegance\nfor Your Special Day.';
    attrs = ['Lehengas', 'Sarees', 'Gowns', 'Custom Fits'];
    cta = 'Book a Styling Session';
  } else if (category === 'kids') {
    headline = 'Little Styles,\nBig Smiles.';
    attrs = ['Comfortable', 'Playful', 'Everyday'];
    cta = 'Explore Collection';
  } else if (category === 'festive') {
    headline = 'Festive\nCollection';
    cta = 'Explore Now';
  }

  // Social & Platforms
  const requestedPlatforms = options?.explicitPlatforms && options.explicitPlatforms.length > 0
    ? options.explicitPlatforms
    : ['instagram', 'facebook', 'whatsapp'];

  const formats = ['ig-feed', 'story', 'square'];

  // Suggested Hook
  let suggestedHook = `Experience the timeless grace of our new ${garmentDisplayName.toLowerCase()} collection. ✨`;
  if (modelComposition === 'family') {
    suggestedHook = `Celebrate shaadi season together in harmonized style. Discover complete wedding collections for the entire family. ✨👨‍👩‍👧‍👦`;
  } else if (modelComposition === 'duo_couple') {
    suggestedHook = `For the celebrations that unite two stories into one. Discover the Royal Shaadi Collection at Monavi. ✨💍`;
  } else if (category === 'bridal') {
    suggestedHook = `Crafted for moments you'll cherish forever. Discover the regal Monavi Bridal Collection. 💍✨`;
  } else if (category === 'mens') {
    suggestedHook = `Tailored for everyday confidence and classic Indian sophistication. 👔✨`;
  } else if (category === 'kids') {
    suggestedHook = `Comfortable styles made for smiles, celebrations, and playful days. 🌸👶`;
  } else if (category === 'festive') {
    suggestedHook = `Some colours carry a celebration in them. Step into the festive season with Monavi. ✨🪔`;
  }

  return {
    category,
    modelComposition,
    garmentType: detectedGarmentKey || 'ethnic-wear',
    garmentDisplayName,
    targetAudience: audience,
    genderPresentation: gender,
    ageGroup: age,
    occasion,
    styling: {
      fabrics: garmentInfo.fabrics || ['Silk Blend', 'Cotton Chanderi'],
      embellishments: category === 'bridal' || isFestive ? ['Zardozi', 'Mukaish', 'Gota Patti'] : ['Clean Tailoring', 'Fine Contrast Stitching'],
      accessories: category === 'bridal' ? ['Kundan Jewellery', 'Embroidered Dupatta'] : category === 'mens' ? ['Pocket Square', 'Leather Mojaris'] : ['Minimalist Earrings'],
      colors: garmentInfo.colors || ['Burgundy', 'Navy', 'Ivory', 'Sage'],
      silhouette: (garmentInfo.attrs && garmentInfo.attrs[0]) || 'Contemporary Tailored'
    },
    photography: {
      environment,
      lighting,
      modelPose,
      composition: (garmentInfo.template === 'split') ? 'Model on right side with solid panel left' : 'Full-bleed portrait with left gradient scrim',
      negativeSpace
    },
    creative: {
      theme: garmentInfo.theme || 'festive',
      template: options?.hasProductImage ? (garmentInfo.template === 'split' ? 'split' : 'overlay') : garmentInfo.template,
      blueprintKey: garmentInfo.referenceBlueprint || 'festive-duo',
      eyebrow,
      headline,
      attrs,
      cta,
      badge: {
        icon: garmentInfo.icon || 'shirt',
        label: garmentInfo.badge || "Men's Wear"
      }
    },
    social: {
      platforms: requestedPlatforms,
      formats,
      hashtags: garmentInfo.hashtags || ['#MonaviCollection', '#WearYourStory'],
      suggestedHook
    },
    needsClarification: false
  };
}
