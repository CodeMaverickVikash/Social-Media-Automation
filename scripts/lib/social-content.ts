// Multi-Platform Social Media Content & Copywriting Engine
// Generates tailored captions, hooks, hashtags, and metadata for Instagram, Facebook, WhatsApp, and Pinterest.

import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { ROOT } from './brand.ts';
import type { FashionAnalysis } from './fashion-intelligence.ts';

export interface PlatformCopy {
  platform: 'instagram' | 'facebook' | 'whatsapp' | 'pinterest';
  text: string;
  hook?: string;
  hashtags?: string[];
  cta: string;
  metadata?: Record<string, unknown>;
}

export interface MultiPlatformContent {
  slug: string;
  instagram: PlatformCopy;
  facebook: PlatformCopy;
  whatsapp: PlatformCopy;
  pinterest: PlatformCopy;
}

/**
 * Generates platform-tailored social copy based on the fashion analysis.
 */
export function generateMultiPlatformContent(analysis: FashionAnalysis, slug: string): MultiPlatformContent {
  const gName = analysis.garmentDisplayName;
  const fabrics = analysis.styling.fabrics.slice(0, 2).join(' and ');
  const colors = analysis.styling.colors.slice(0, 2).join(' & ');
  const occasion = analysis.occasion;

  // ----------------------------------------------------
  // 1. INSTAGRAM FEED / REEL
  // ----------------------------------------------------
  const igHook = analysis.social.suggestedHook;
  const igBody = `Tailored in ${fabrics} with shades of ${colors}, this ${gName.toLowerCase()} is designed for moments that become memories. Effortless silhouette, refined details, and lasting comfort.`;
  const igCta = `Visit our store or send a DM to explore the collection. Tap the link in bio to discover more.`;
  const igTags = Array.from(new Set([
    '#MonaviCollection',
    '#WearYourStory',
    ...analysis.social.hashtags,
    `#${gName.replace(/[^a-zA-Z0-9]/g, '')}`
  ])).slice(0, 8);

  const instagramCopy: PlatformCopy = {
    platform: 'instagram',
    hook: igHook,
    cta: igCta,
    hashtags: igTags,
    text: `${igHook}\n\n${igBody}\n\n${igCta}\n\n${igTags.join(' ')}`
  };

  // ----------------------------------------------------
  // 2. FACEBOOK FEED
  // ----------------------------------------------------
  const fbP1 = `Looking for the perfect ${occasion} outfit? Our new ${gName.toLowerCase()} brings together timeless Indian craftsmanship with comfortable contemporary cuts.`;
  const fbP2 = `Handpicked ${fabrics} fabrics, tailored for an impeccable fit whether you are attending a family celebration or dressing with confidence for the weekend.`;
  const fbP3 = `Experience the collection in person at Monavi Collection. Send us a message here on Facebook or drop by our boutique to find your size.`;
  const fbTags = ['#MonaviCollection', '#WearYourStory', `#${gName.replace(/[^a-zA-Z0-9]/g, '')}`];

  const facebookCopy: PlatformCopy = {
    platform: 'facebook',
    cta: 'Send us a message or visit the store to try your fit.',
    hashtags: fbTags,
    text: `${fbP1}\n\n${fbP2}\n\n${fbP3}\n\n${fbTags.join(' ')}`
  };

  // ----------------------------------------------------
  // 3. WHATSAPP BROADCAST / STATUS
  // ----------------------------------------------------
  // Rule: 1-3 lines, personal tone, direct CTA, ZERO hashtags, max 2 tasteful emojis
  const waLine1 = `New in at Monavi Collection: ${gName} in ${colors}. ✨`;
  const waLine2 = `Crafted in breathable ${fabrics} for effortless style and all-day comfort.`;
  const waLine3 = `Reply directly to this message to see available sizes or book a visit!`;

  const whatsappCopy: PlatformCopy = {
    platform: 'whatsapp',
    cta: 'Reply to this message to order or reserve your piece.',
    text: `${waLine1}\n${waLine2}\n\n${waLine3}`
  };

  // ----------------------------------------------------
  // 4. PINTEREST PIN
  // ----------------------------------------------------
  const pinTitle = `${gName} | Monavi Collection — Modern Indian Fashion`;
  const pinDesc = `Explore the luxury ${gName.toLowerCase()} from Monavi Collection. Featuring tailored ${fabrics} in shades of ${colors}. Perfect for ${occasion} wear, weddings, and celebrations. Wear your story with timeless Indian design and contemporary grace.`;
  const pinBoard = `${analysis.category === 'bridal' ? 'Indian Bridal Inspiration' : analysis.category === 'mens' ? "Men's Ethnic & Smart Casual" : analysis.category === 'kids' ? 'Kids Fashion & Ethnic Wear' : 'Indian Festive & Contemporary Fashion'}`;

  const pinterestCopy: PlatformCopy = {
    platform: 'pinterest',
    cta: 'Save to your inspiration board or visit monavicollection.in',
    hashtags: ['#IndianFashion', '#EthnicWear', `#${gName.replace(/[^a-zA-Z0-9]/g, '')}`],
    metadata: {
      board: pinBoard,
      title: pinTitle,
      altText: `Monavi Collection ${gName} in ${colors} featuring ${fabrics} fabric`
    },
    text: `TITLE: ${pinTitle}\nBOARD: ${pinBoard}\n\n${pinDesc}\n\nTags: #MonaviCollection #WearYourStory #IndianFashion #EthnicWear`
  };

  return {
    slug,
    instagram: instagramCopy,
    facebook: facebookCopy,
    whatsapp: whatsappCopy,
    pinterest: pinterestCopy
  };
}

/**
 * Writes caption.txt for all supported platform folders in output/<platform>/<slug>/
 */
export function writeAllPlatformCaptions(outputBaseDir: string, slug: string, analysis: FashionAnalysis, overwrite: boolean = false): void {
  const copy = generateMultiPlatformContent(analysis, slug);

  const targets: [string, PlatformCopy][] = [
    ['instagram', copy.instagram],
    ['facebook', copy.facebook],
    ['whatsapp', copy.whatsapp]
  ];

  for (const [platform, data] of targets) {
    const dir = path.join(outputBaseDir, platform, slug);
    mkdirSync(dir, { recursive: true });
    const capFile = path.join(dir, 'caption.txt');
    if (!existsSync(capFile) || overwrite) {
      writeFileSync(capFile, data.text.trim() + '\n', 'utf8');
    }
  }
}
