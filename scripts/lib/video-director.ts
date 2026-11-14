// Fashion Video Director Engine for Monavi Collection ("Wear Your Story")
// Master Creative Direction, Dynamic Storyboarding, Pacing, and Scene Sequence Planning

import { analyzeFashionRequest, type FashionAnalysis } from './fashion-intelligence.ts';
import { calculatePlatformVideoDuration, type CalculatedVideoDuration, type SupportedPlatform } from './video-specs.ts';
import type { VideoSceneConfig, CameraTrajectory } from './video-generation-engine.ts';

export interface FashionVideoDirection {
  slug: string;
  concept: string;
  openingHook: string;
  modelCasting: {
    gender: string;
    age: string;
    look: string;
    posture: string;
    styling: string;
  };
  productFocus: {
    garment: string;
    keyDetails: string[];
    silhouette: string;
  };
  environmentAndLighting: {
    setting: string;
    lighting: string;
    atmosphere: string;
  };
  audioDirection: {
    mood: string;
    musicTrack: string;
    voiceoverLines: string[];
  };
  closingCTA: string;
  targetDuration: CalculatedVideoDuration;
  storyboard: VideoSceneConfig[];
}

/**
 * Generates an end-to-end creative direction tailored to the garment category, audience, and platform limits.
 */
export function directFashionVideo(options: {
  slug: string;
  query: string;
  platform: SupportedPlatform;
  inputPhotoPath?: string;
  durationPreference?: 'max' | 'recommended' | number;
}): FashionVideoDirection {
  const { slug, query, platform, inputPhotoPath, durationPreference = 'recommended' } = options;

  const targetDuration = calculatePlatformVideoDuration({
    platform,
    preference: durationPreference
  });

  const analysis = analyzeFashionRequest(query, {
    hasProductImage: Boolean(inputPhotoPath),
    explicitPlatforms: [platform]
  });

  const cat = analysis.category;
  const gName = analysis.garmentDisplayName;

  // 1. Model Casting & Demographics
  let modelCasting = {
    gender: 'female',
    age: '25-year-old',
    look: 'South Asian elegance, refined natural skin, gentle smile',
    posture: 'Poised, graceful, confident royal demeanor',
    styling: `Authentic ${analysis.styling.accessories.join(', ')}`
  };

  if (analysis.targetAudience === 'men' || analysis.genderPresentation === 'male') {
    modelCasting = {
      gender: 'male',
      age: '28-year-old',
      look: 'Dignified Indian male model, groomed stubble, confident gaze',
      posture: 'Athletic, relaxed, commanding natural presence',
      styling: 'Traditional handcrafted footwear and bespoke tailoring'
    };
  } else if (analysis.targetAudience === 'kids' || analysis.category === 'kids') {
    modelCasting = {
      gender: 'child',
      age: '6-8 years old',
      look: 'Joyful, spirited smile, expressive twinkling eyes',
      posture: 'Playful, candid, natural celebratory movements',
      styling: 'Breathable, comfortable festive accessories'
    };
  } else if (cat === 'bridal') {
    modelCasting = {
      gender: 'female',
      age: '24-26 years old',
      look: 'Regal Indian bride, classic kohl eyes, radiant dewy glow',
      posture: 'Aristocratic poise, graceful drapery gestures, serene smile',
      styling: 'Heirloom Kundan and Polki jewelry, traditional maang tikka, bridal chooda'
    };
  }

  // 2. Audio & Voiceover Direction
  let audioDirection = {
    mood: 'Contemporary Indian Instrumental with ambient sitar and warm bass',
    musicTrack: 'assets/audio/festive-ambient.mp3',
    voiceoverLines: [
      `Some colours carry a celebration in them.`,
      `Introducing the new ${gName} from Monavi Collection.`,
      `Graceful silhouettes crafted for your journey.`,
      `Wear your story.`
    ]
  };

  if (cat === 'bridal') {
    audioDirection = {
      mood: 'Opulent Royal Shehnai & Sitar Orchestral Swell with cinematic strings',
      musicTrack: 'assets/audio/bridal-regal.mp3',
      voiceoverLines: [
        `Every thread holds a promise of forever.`,
        `The Monavi Bridal Collection — timeless heritage drapes woven with royal grace.`,
        `Made for moments that become memories.`,
        `Wear your story.`
      ]
    };
  } else if (cat === 'mens') {
    audioDirection = {
      mood: 'Modern Lo-Fi Beat with subtle tabla groove and confident acoustic guitar',
      musicTrack: 'assets/audio/mens-urban.mp3',
      voiceoverLines: [
        `Confidence isn't loud. It's tailored.`,
        `The new ${gName} edit from Monavi Collection.`,
        `Classic Indian roots, effortless modern precision.`,
        `Wear your story.`
      ]
    };
  } else if (cat === 'kids') {
    audioDirection = {
      mood: 'Playful, uplifting acoustic ukulele and light flute melody',
      musicTrack: 'assets/audio/kids-playful.mp3',
      voiceoverLines: [
        `Made for celebrations, sunshine, and joyful giggles.`,
        `Introducing playful ${gName} styles from Monavi.`,
        `Pure comfort, endless smiles.`,
        `Wear your story.`
      ]
    };
  }

  // 3. Dynamic Storyboard Generation based on duration
  const totalSeconds = targetDuration.targetDurationSec;
  const endCardSec = 2.5;
  const contentSec = Math.max(3, totalSeconds - endCardSec);

  // Divide into 3 to 6 scenes depending on duration
  const sceneCount = totalSeconds <= 12 ? 3 : totalSeconds <= 25 ? 4 : totalSeconds <= 50 ? 5 : 6;
  const perSceneSec = Math.round((contentSec / sceneCount) * 10) / 10;

  const basePhoto = inputPhotoPath || `assets/photos/${slug}/model-bridal-saree.png`;
  const detailPhoto = `assets/photos/${slug}/model-bridal-saree-detail.png`;

  const trajectories: CameraTrajectory[] = ['dolly-in', 'pan-right', 'macro-shimmer', 'pedestal-up', 'hero-sway', 'dolly-out'];

  const sceneTitles = [
    { title: 'The Opening Hook', eyebrow: analysis.creative.eyebrow, headline: analysis.creative.headline.split('\n')[0] },
    { title: 'Model Movement & Silhouette', eyebrow: 'THE EDIT', headline: gName },
    { title: 'Craftsmanship & Texture', eyebrow: 'HERITAGE DETAILS', headline: analysis.styling.embellishments[0] || 'Artisanal Weave' },
    { title: 'Hero Pose & Emotion', eyebrow: 'CELEBRATION READY', headline: analysis.creative.headline },
    { title: 'Atmospheric Walk', eyebrow: 'MONAVI BESPOKE', headline: 'Crafted for You' },
    { title: 'Grand Reveal', eyebrow: 'NEW ARRIVALS', headline: 'Wear Your Story' }
  ];

  const storyboard: VideoSceneConfig[] = [];
  for (let i = 0; i < sceneCount; i++) {
    const meta = sceneTitles[i % sceneTitles.length]!;
    const traj = trajectories[i % trajectories.length]!;
    const useDetail = (i === 2 || i === 4) && detailPhoto;

    storyboard.push({
      sceneIndex: i + 1,
      name: meta.title,
      durationSec: perSceneSec,
      trajectory: traj,
      sourceImagePath: useDetail ? detailPhoto : basePhoto,
      eyebrow: meta.eyebrow,
      headline: meta.headline,
      attrs: i === 1 ? analysis.creative.attrs : undefined
    });
  }

  return {
    slug,
    concept: `Cinematic fashion campaign film for Monavi Collection featuring ${gName} (${cat}) optimized for ${platform}.`,
    openingHook: `0.1s visual arrest with regal ${gName} reveal in authentic heritage lighting.`,
    modelCasting,
    productFocus: {
      garment: gName,
      keyDetails: analysis.styling.embellishments,
      silhouette: analysis.styling.silhouette
    },
    environmentAndLighting: {
      setting: analysis.photography.environment,
      lighting: analysis.photography.lighting,
      atmosphere: 'Luxury Indian boutique editorial with calm negative space'
    },
    audioDirection,
    closingCTA: analysis.creative.cta,
    targetDuration,
    storyboard
  };
}
