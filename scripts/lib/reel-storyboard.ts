// Reel & Video Creative Engine
// Converts fashion requests and analysis into complete 5-scene storyboards,
// scene-by-scene image prompts, motion directions, voiceover scripts, and renderable ReelBriefs.

import type { ReelBrief, ReelScene } from '../templates/reel.ts';
import type { FashionAnalysis } from './fashion-intelligence.ts';

export interface StoryboardSceneDef extends ReelScene {
  sceneNumber: number;
  name: string;
  creativeIntent: string;
  generationPrompt: string;
}

export interface FashionReelStoryboard {
  slug: string;
  concept: string;
  visualDirection: string;
  audioMood: string;
  musicSuggestion: string;
  voiceoverScript: string[];
  scenes: StoryboardSceneDef[];
  brief: ReelBrief;
}

/**
 * Generates a full cinematic reel storyboard tailored to the fashion garment and occasion.
 */
export function generateFashionReelStoryboard(analysis: FashionAnalysis, slug: string, photos: string[]): FashionReelStoryboard {
  const gName = analysis.garmentDisplayName;
  const cat = analysis.category;

  // 1. Audio Mood & Music Suggestion
  let audioMood = 'Contemporary Indian Fusion: Acoustic sitar with ambient electronic pads and gentle bass';
  let musicSuggestion = 'assets/audio/festive-ambient.mp3';
  if (cat === 'bridal') {
    audioMood = 'Opulent Royal Shehnai & Sitar Orchestral Swell with cinematic strings';
    musicSuggestion = 'assets/audio/bridal-regal.mp3';
  } else if (cat === 'mens') {
    audioMood = 'Modern Lo-Fi Beat with subtle tabla groove and confident acoustic guitar';
    musicSuggestion = 'assets/audio/mens-urban.mp3';
  } else if (cat === 'kids') {
    audioMood = 'Playful, uplifting acoustic ukulele and light flute melody';
    musicSuggestion = 'assets/audio/kids-playful.mp3';
  }

  // 2. Voiceover Script
  const voiceoverScript: string[] = [];
  if (cat === 'bridal') {
    voiceoverScript.push(
      "Every thread holds a promise.",
      `The Monavi Bridal Collection — handcrafted ${analysis.styling.fabrics[0]} woven with royal zari.`,
      "For moments that turn into forever.",
      "Wear your story."
    );
  } else if (cat === 'mens') {
    voiceoverScript.push(
      "Confidence isn't loud. It's tailored.",
      `The new ${gName} from Monavi Collection.`,
      "Classic Indian roots, modern precision.",
      "Everyday style. Lasting confidence."
    );
  } else if (cat === 'kids') {
    voiceoverScript.push(
      "Made for sunshine, celebrations, and big smiles.",
      `Introducing playful ${gName} styles from Monavi.`,
      "Pure comfort, effortless charm.",
      "Little styles, big smiles."
    );
  } else {
    voiceoverScript.push(
      "Some colours carry a celebration within them.",
      `Discover our ${analysis.occasion} ${gName} collection.`,
      "Graceful silhouettes for every chapter of your journey.",
      "Wear your story."
    );
  }

  // 3. 5-Scene Storyboard
  const photo1 = photos[0] || `assets/photos/${slug}/scene-1.png`;
  const photo2 = photos[1] || photos[0] || `assets/photos/${slug}/scene-2.png`;
  const photo3 = photos[2] || photos[0] || `assets/photos/${slug}/scene-3.png`;
  const photo4 = photos[3] || photos[1] || photos[0] || `assets/photos/${slug}/scene-4.png`;

  const scenes: StoryboardSceneDef[] = [
    {
      sceneNumber: 1,
      name: 'Visual Hook',
      creativeIntent: 'Atmospheric opening establishing the heritage mood and high-end aesthetic.',
      photo: photo1,
      duration: 2.2,
      motion: 'zoom-in',
      eyebrow: analysis.creative.eyebrow,
      headline: analysis.creative.headline.split('\n')[0] || gName,
      focus: 'center',
      generationPrompt: `Cinematic wide establishing shot of an elegant Indian model in ${analysis.photography.environment}. Warm soft lighting catching fabric silhouette.`
    },
    {
      sceneNumber: 2,
      name: 'Garment Reveal',
      creativeIntent: 'Mid-length motion reveal highlighting the fall, tailoring, and movement of the garment.',
      photo: photo2,
      duration: 2.8,
      motion: 'pan-right',
      headline: gName,
      subline: analysis.styling.fabrics.slice(0, 2).join(' & '),
      attrs: analysis.creative.attrs,
      focus: 'center 40%',
      generationPrompt: `Medium tracking shot of an Indian model showcasing the drape and movement of a luxury ${gName}. Soft directional light.`
    },
    {
      sceneNumber: 3,
      name: 'Craftsmanship Detail',
      creativeIntent: 'Macro close-up capturing tactile craftsmanship, zari, seam work, and premium textiles.',
      photo: photo3,
      duration: 2.2,
      motion: 'zoom-in',
      eyebrow: 'CRAFTSMANSHIP',
      headline: analysis.styling.embellishments[0] || 'Handcrafted Detail',
      attrs: analysis.styling.fabrics,
      focus: 'center 35%',
      generationPrompt: `Macro 100mm lens close-up of intricate ${analysis.styling.embellishments.join(', ')} embroidery on ${analysis.styling.fabrics[0]} fabric.`
    },
    {
      sceneNumber: 4,
      name: 'Hero Editorial Pose',
      creativeIntent: 'Iconic lifestyle confidence portrait delivering the campaign emotional payoff.',
      photo: photo4,
      duration: 2.6,
      motion: 'zoom-out',
      headline: analysis.creative.headline,
      focus: 'center 40%',
      generationPrompt: `Full portrait shot of Indian model in ${gName} looking confident and graceful. 85mm lens f/1.4.`
    }
  ];

  // 4. Renderable ReelBrief
  const brief: ReelBrief = {
    slug,
    theme: analysis.creative.theme,
    transition: 0.6,
    scenes: scenes.map(s => ({
      photo: s.photo,
      duration: s.duration,
      motion: s.motion,
      eyebrow: s.eyebrow,
      headline: s.headline,
      subline: s.subline,
      attrs: s.attrs,
      focus: s.focus
    })),
    endCard: {
      duration: 2.4,
      headline: 'MONAVI COLLECTION',
      line: 'WEAR YOUR STORY',
      cta: analysis.creative.cta,
      dark: analysis.creative.theme === 'mens' || analysis.creative.theme === 'dark' || analysis.creative.theme === 'festive'
    },
    platforms: ['instagram', 'facebook', 'whatsapp']
  };

  return {
    slug,
    concept: `Editorial fashion showcase of ${gName} celebrating Indian heritage through modern tailoring and cinematography.`,
    visualDirection: `${analysis.photography.environment} with ${analysis.photography.lighting}.`,
    audioMood,
    musicSuggestion,
    voiceoverScript,
    scenes,
    brief
  };
}
