// Emotion & Speaking Style Engine for Monavi Collection
// Dynamically modulates vocal cadence, prosody, pitch offset, and pause timing.

import type { EmotionStyle } from './types.ts';

export interface EmotionModulation {
  rateMultiplier: number;
  pitchOffsetHz: number;
  edgeStyle?: string;
  elevenLabsStyleExaggeration: number;
  pauseDurationMs: number;
  emphasisKeywords: string[];
}

export const EMOTION_PROFILES: Record<EmotionStyle, EmotionModulation> = {
  luxury: {
    rateMultiplier: 0.92,
    pitchOffsetHz: -3,
    edgeStyle: 'calm',
    elevenLabsStyleExaggeration: 0.25,
    pauseDurationMs: 380,
    emphasisKeywords: ['pure', 'royal', 'bespoke', 'heritage', 'handcrafted', 'luxury']
  },
  elegance: {
    rateMultiplier: 0.95,
    pitchOffsetHz: -1,
    edgeStyle: 'expressive',
    elevenLabsStyleExaggeration: 0.20,
    pauseDurationMs: 320,
    emphasisKeywords: ['grace', 'elegance', 'timeless', 'artistry', 'splendour']
  },
  excitement: {
    rateMultiplier: 1.08,
    pitchOffsetHz: +3,
    edgeStyle: 'cheerful',
    elevenLabsStyleExaggeration: 0.40,
    pauseDurationMs: 180,
    emphasisKeywords: ['celebrate', 'now', 'exclusive', 'arrival', 'stunning', 'special']
  },
  happiness: {
    rateMultiplier: 1.02,
    pitchOffsetHz: +1,
    edgeStyle: 'cheerful',
    elevenLabsStyleExaggeration: 0.25,
    pauseDurationMs: 240,
    emphasisKeywords: ['joy', 'love', 'family', 'together', 'moments', 'smile']
  },
  confidence: {
    rateMultiplier: 0.98,
    pitchOffsetHz: -1,
    edgeStyle: 'expressive',
    elevenLabsStyleExaggeration: 0.15,
    pauseDurationMs: 260,
    emphasisKeywords: ['crafted', 'guaranteed', 'authentic', 'signature', 'stand out']
  },
  romance: {
    rateMultiplier: 0.93,
    pitchOffsetHz: -2,
    edgeStyle: 'gentle',
    elevenLabsStyleExaggeration: 0.30,
    pauseDurationMs: 350,
    emphasisKeywords: ['forever', 'together', 'dream', 'heart', 'sacred', 'eternal']
  },
  storytelling: {
    rateMultiplier: 0.94,
    pitchOffsetHz: -1,
    edgeStyle: 'expressive',
    elevenLabsStyleExaggeration: 0.35,
    pauseDurationMs: 340,
    emphasisKeywords: ['journey', 'tradition', 'story', 'generations', 'legacy', 'weaves']
  },
  promotion: {
    rateMultiplier: 1.06,
    pitchOffsetHz: +2,
    edgeStyle: 'cheerful',
    elevenLabsStyleExaggeration: 0.30,
    pauseDurationMs: 200,
    emphasisKeywords: ['limited', 'festive', 'offer', 'visit', 'shop now', 'today']
  },
  neutral: {
    rateMultiplier: 1.0,
    pitchOffsetHz: 0,
    edgeStyle: undefined,
    elevenLabsStyleExaggeration: 0.0,
    pauseDurationMs: 250,
    emphasisKeywords: []
  }
};

/**
 * Dynamically modulates vocal style across sequential scenes to prevent mechanical monotony.
 */
export function modulateEmotionForScene(
  baseEmotion: EmotionStyle,
  sceneIndex: number,
  totalScenes: number
): EmotionModulation {
  const base = { ...EMOTION_PROFILES[baseEmotion] };

  // First scene (opening hook): slightly more energetic and punchy
  if (sceneIndex === 0) {
    base.rateMultiplier = Math.min(1.10, base.rateMultiplier * 1.03);
    base.pauseDurationMs = Math.max(160, base.pauseDurationMs - 40);
    return base;
  }

  // Final scene (call to action / brand sign-off): grounded, confident, clear
  if (sceneIndex === totalScenes - 1) {
    base.rateMultiplier = Math.max(0.90, base.rateMultiplier * 0.96);
    base.pitchOffsetHz -= 1;
    base.pauseDurationMs = Math.max(280, base.pauseDurationMs + 40);
    return base;
  }

  // Middle scenes: natural rhythmic variation based on alternating scenes
  if (sceneIndex % 2 === 1) {
    base.rateMultiplier *= 0.98; // slightly slower contemplative pace for details
    base.pauseDurationMs += 20;
  } else {
    base.rateMultiplier *= 1.01;
  }

  return base;
}
