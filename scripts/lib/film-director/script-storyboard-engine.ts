// Scriptwriting & Storyboard Engine
// Builds multi-act narrative scripts and dynamic scene-by-scene storyboards for any duration.

import type {
  CharacterReference,
  LocationReference,
  ProductionPlan,
  ScenePlan,
  StoryAnalysis,
  AudioProductionPlan,
  TransitionType,
  CameraAngle
} from './director-types.ts';
import type { CameraTrajectory } from '../video-generation-engine.ts';
import type { FashionAnalysis } from '../fashion-intelligence.ts';

/**
 * Creates full narrative story analysis from the user's prompt and fashion taxonomy.
 */
export function buildStoryAnalysis(options: {
  query: string;
  analysis: FashionAnalysis;
  totalDurationSec: number;
}): StoryAnalysis {
  const { query, analysis, totalDurationSec } = options;
  const gName = analysis.garmentDisplayName;
  const cat = analysis.category;

  let storyline = '';
  let openingHook = '';
  let mainPresentation = '';
  let closingMessage = '';

  if (cat === 'bridal') {
    storyline = `A royal bridal journey exploring the sacred intimacy of heritage craftsmanship, from the delicate hand-woven zari border to the triumphant walk into a lifelong promise.`;
    openingHook = `0.1s visual arrest: Golden sunlight cuts through Rajasthan haveli arches, illuminating shimmering ruby silk and ancient Polki jewels.`;
    mainPresentation = `The bride glides through marble colonnades as gentle breezes move the authentic zari pallu; macro details reveal thousands of meticulous artisanal stitches.`;
    closingMessage = `Monavi Collection honors the bride who carries centuries of tradition with modern majesty.`;
  } else if (cat === 'mens') {
    storyline = `Understated power and bespoke precision: the modern Indian gentleman embraces classic heritage cuts tailored for effortless modern life.`;
    openingHook = `Commanding silhouette: Razor-sharp tailoring emerges against minimalist dark slate architecture in morning light.`;
    mainPresentation = `Dynamic tracking shots reveal raw silk texture, bespoke plackets, and natural athletic poise with unhurried authority.`;
    closingMessage = `Confidence is never loud. It is tailored by Monavi Collection.`;
  } else if (cat === 'kids') {
    storyline = `Celebration through a child's eyes: joyful twirls, vibrant festive hues, and breathable comfort made for unfiltered laughter.`;
    openingHook = `Burst of festive color and twinkling eyes as cheerful laughter fills the sunlit palace terrace.`;
    mainPresentation = `Playful candid movement showcases comfortable stitching and lightweight festive borders that let kids celebrate freely.`;
    closingMessage = `Made for giggles, sunshine, and celebrations that last all day.`;
  } else {
    storyline = `A celebration of personal heritage: contemporary silhouettes interwoven with timeless Indian weaving artistry.`;
    openingHook = `An arresting gaze and dramatic fabric drape capture instant attention in architectural negative space.`;
    mainPresentation = `Fluid movement, elegant turns, and tactile embroidery close-ups highlight effortless day-to-evening versatility.`;
    closingMessage = `Your story, woven into every thread. Wear your story with Monavi Collection.`;
  }

  return {
    mainConcept: `Cinematic Fashion Film: ${gName} — Monavi Collection ("Wear Your Story")`,
    storyline,
    videoObjective: `Establish high-conversion emotional brand connection, highlight authentic garment craftsmanship, and drive collection discovery.`,
    targetAudience: `${analysis.targetAudience.toUpperCase()} | Occasion: ${analysis.occasion.toUpperCase()}`,
    narrativeStructure: {
      act1_hook: `Act I: The Arresting Opening Hook (0.0s – ${Math.round(totalDurationSec * 0.2)}s)`,
      act2_presentation: `Act II: The Craft & Movement Showcase (${Math.round(totalDurationSec * 0.2)}s – ${Math.round(totalDurationSec * 0.7)}s)`,
      act3_climax_reveal: `Act III: The Regal Climax & Emotional Atmosphere (${Math.round(totalDurationSec * 0.7)}s – ${Math.round(totalDurationSec * 0.9)}s)`,
      closing_cta: `Act IV: The Monavi Signature End-Card & Call-to-Action (${Math.round(totalDurationSec * 0.9)}s – ${totalDurationSec}s)`
    },
    openingHook,
    mainPresentation,
    closingMessage,
    ctaText: analysis.creative.cta || 'Explore Collection'
  };
}

/**
 * Dynamically plans scenes based on total requested duration.
 * Supports short advertisements (30s) up to long-form feature films (3m, 5m, 10m+).
 */
export function buildFilmStoryboard(options: {
  slug: string;
  totalDurationSec: number;
  story: StoryAnalysis;
  characters: Record<string, CharacterReference>;
  locations: Record<string, LocationReference>;
  analysis: FashionAnalysis;
  baseImagePath: string;
  detailImagePath?: string;
}): ScenePlan[] {
  const { totalDurationSec, story, characters, locations, analysis, baseImagePath, detailImagePath } = options;

  const charId = Object.keys(characters)[0] || 'char_protagonist';
  const locIds = Object.keys(locations);
  const primaryLoc = locIds[0] || 'loc_primary';
  const secondaryLoc = locIds.length > 1 ? locIds[1]! : primaryLoc;

  const endCardDuration = 2.5;
  const liveContentDuration = Math.max(3.0, totalDurationSec - endCardDuration);

  // Each AI clip typically runs 3.0s to 5.0s for maximum visual stability and cinematic pacing
  const targetClipDuration = totalDurationSec <= 20 ? 3.2 : totalDurationSec <= 60 ? 3.8 : 4.5;
  const rawSceneCount = Math.max(2, Math.round(liveContentDuration / targetClipDuration));
  const perSceneDuration = Math.round((liveContentDuration / rawSceneCount) * 10) / 10;

  const trajectories: CameraTrajectory[] = ['dolly-in', 'pan-right', 'macro-shimmer', 'pedestal-up', 'hero-sway', 'pan-left', 'dolly-out'];
  const angles: CameraAngle[] = ['wide-establishing', 'medium-three-quarter', 'close-up-detail', 'low-angle-hero', 'medium-three-quarter', 'close-up-detail'];
  const transitions: TransitionType[] = ['dissolve', 'cut', 'dissolve', 'cut', 'match-cut', 'dissolve'];

  const scenes: ScenePlan[] = [];

  const beatTemplates = [
    {
      title: 'The Hook: Royal Reveal',
      angle: 'wide-establishing',
      traj: 'dolly-in',
      loc: primaryLoc,
      isDetail: false,
      action: 'Model emerges through carved archway into the morning sun, calm regal gaze toward lens.',
      vo: `Every masterpiece begins with an intention. Introducing ${analysis.garmentDisplayName}.`,
      eyebrow: analysis.creative.eyebrow,
      headline: analysis.creative.headline.split('\n')[0]
    },
    {
      title: 'Tactile Craftsmanship: Zari & Weave',
      angle: 'close-up-detail',
      traj: 'macro-shimmer',
      loc: primaryLoc,
      isDetail: true,
      action: 'Macro lens tracks along authentic embroidery border; light catches metallic gold zari thread work.',
      vo: `Handcrafted with heritage weaves that carry centuries of royal Indian artistry.`,
      eyebrow: 'HERITAGE WEAVE',
      headline: 'Authentic Detail.',
      attrs: analysis.creative.attrs
    },
    {
      title: 'Silhouette & Fluid Movement',
      angle: 'medium-three-quarter',
      traj: 'pan-right',
      loc: secondaryLoc,
      isDetail: false,
      action: 'Model turns gracefully along the shaded colonnade, fabric drapes with weightless fluid momentum.',
      vo: `Silhouettes engineered for effortless grace and unmatched comfort.`,
      eyebrow: 'THE EDIT',
      headline: 'Bespoke Fit.'
    },
    {
      title: 'Atmospheric Grandeur',
      angle: 'low-angle-hero',
      traj: 'hero-sway',
      loc: primaryLoc,
      isDetail: false,
      action: 'Slow upward tilt capturing the interplay of architectural stone lattice and garment symmetry.',
      vo: `Designed for celebrations that turn into timeless memories.`,
      eyebrow: 'ROYAL PALACE',
      headline: 'Timeless Grace.'
    },
    {
      title: 'Intimate Embroidery Detail',
      angle: 'close-up-detail',
      traj: 'pan-left',
      loc: secondaryLoc,
      isDetail: true,
      action: 'Delicate close-up of the pallu drape and hemline stitching in soft diffused daylight.',
      vo: `Every thread holds a story waiting to be worn.`,
      eyebrow: 'BESPOKE FINISH',
      headline: 'Purity of Form.'
    },
    {
      title: 'The Climax: Confident Hero Pose',
      angle: 'medium-three-quarter',
      traj: 'dolly-out',
      loc: primaryLoc,
      isDetail: false,
      action: 'Model pauses at the palace center, dignified smile and grounded posture as the wind gently sways the fabric.',
      vo: `Wear your heritage. Wear your journey. Wear your story.`,
      eyebrow: 'MONAVI COLLECTION',
      headline: 'Wear Your Story.'
    }
  ];

  for (let i = 0; i < rawSceneCount; i++) {
    const template = beatTemplates[i % beatTemplates.length]!;
    const useDetail = template.isDetail && Boolean(detailImagePath);
    const sourceImage = useDetail ? detailImagePath! : baseImagePath;
    const traj = trajectories[i % trajectories.length]!;
    const angle = angles[i % angles.length]!;
    const trans = i === rawSceneCount - 1 ? 'fade-to-black' : transitions[i % transitions.length]!;

    scenes.push({
      sceneId: `scene_${String(i + 1).padStart(2, '0')}`,
      clipIndex: i + 1,
      objective: template.title,
      durationSec: perSceneDuration,
      characterId: charId,
      locationId: template.loc,
      cameraAngle: angle,
      cameraTrajectory: traj,
      lightingSetup: 'golden-hour',
      actionDescription: template.action,
      dialogueOrVoiceover: template.vo,
      soundEffects: ['ambient-palace-breeze.wav', 'subtle-silk-sway.wav'],
      transitionToNext: trans,
      eyebrow: template.eyebrow,
      headline: template.headline,
      attributes: template.attrs,
      sourceImagePath: sourceImage,
      status: 'pending'
    });
  }

  return scenes;
}

/**
 * Designs the complete audio production plan including music track, mood, and voiceover timeline.
 */
export function buildAudioPlan(options: {
  analysis: FashionAnalysis;
  scenes: ScenePlan[];
}): AudioProductionPlan {
  const { analysis, scenes } = options;
  const cat = analysis.category;

  let mood = 'Contemporary Indian Instrumental with ambient sitar and warm bass';
  let musicTrack = 'assets/audio/festive-ambient.mp3';
  let tempoBpm = 85;

  if (cat === 'bridal') {
    mood = 'Opulent Royal Shehnai & Sitar Orchestral Swell with cinematic strings';
    musicTrack = 'assets/audio/bridal-regal.mp3';
    tempoBpm = 72;
  } else if (cat === 'mens') {
    mood = 'Modern Lo-Fi Beat with subtle acoustic tabla and confident guitar groove';
    musicTrack = 'assets/audio/mens-urban.mp3';
    tempoBpm = 90;
  } else if (cat === 'kids') {
    mood = 'Joyful uplifting acoustic ukulele and playful bamboo flute';
    musicTrack = 'assets/audio/kids-playful.mp3';
    tempoBpm = 108;
  }

  let currentSec = 0.5;
  const voiceoverScript = scenes.map(s => {
    const item = {
      sceneId: s.sceneId,
      line: s.dialogueOrVoiceover,
      startSec: currentSec,
      durationSec: Math.min(s.durationSec - 0.4, 2.8)
    };
    currentSec += s.durationSec;
    return item;
  });

  return {
    musicTrack,
    mood,
    tempoBpm,
    voiceoverScript,
    musicVolumeDuckDb: -14, // Dips background music by 14dB during voiceover
    soundEffectsTimeline: [
      { timeSec: 0.1, effectName: 'palace_ambient_birds' },
      { timeSec: 2.5, effectName: 'silk_sway_whoosh' }
    ]
  };
}
