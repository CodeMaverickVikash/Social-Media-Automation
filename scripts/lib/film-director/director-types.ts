// Core Type Definitions for Autonomous AI Film Director & End-to-End Video Production System
// Enforces TypeScript erasable syntax (unions instead of enums, no parameter properties)

import type { SupportedPlatform } from '../video-specs.ts';
import type { CameraTrajectory } from '../video-generation-engine.ts';

export type TransitionType = 'cut' | 'dissolve' | 'fade-to-black' | 'whip-pan' | 'match-cut';
export type CameraAngle = 'wide-establishing' | 'medium-three-quarter' | 'close-up-detail' | 'low-angle-hero' | 'high-angle-overview' | 'over-the-shoulder';
export type LightingCondition = 'golden-hour' | 'soft-editorial-diffused' | 'dramatic-chiaroscuro' | 'candlelit-palace' | 'high-key-studio';
export type ClipQualityStatus = 'pending' | 'evaluating' | 'approved' | 'rejected' | 'regenerated';

export interface CharacterReference {
  characterId: string;
  name: string;
  gender: 'female' | 'male' | 'child' | 'ensemble';
  ageRange: string;
  appearance: {
    faceDetails: string;
    hairstyle: string;
    skinTone: string;
    eyes: string;
    bodyProportions: string;
  };
  clothing: {
    outfitName: string;
    garmentType: string;
    primaryColorHex: string;
    secondaryColorHex: string;
    fabric: string;
    embroidery: string;
    silhouette: string;
  };
  accessories: string[];
  personality: string;
  role: string;
  movementStyle: string;
  referenceImagePath?: string;
  promptConsistencyBlock: string;
}

export interface LocationReference {
  locationId: string;
  name: string;
  environmentType: 'palace-courtyard' | 'traditional-haveli' | 'luxury-studio' | 'boutique-interior' | 'royal-garden' | 'heritage-verandah';
  architecture: string;
  backgroundDescription: string;
  lighting: LightingCondition;
  colorPalette: string[];
  props: string[];
  cameraPositioning: string;
  referenceImagePath?: string;
  promptConsistencyBlock: string;
}

export interface ScenePlan {
  sceneId: string;
  clipIndex: number;
  objective: string;
  durationSec: number;
  characterId: string;
  locationId: string;
  cameraAngle: CameraAngle;
  cameraTrajectory: CameraTrajectory;
  lightingSetup: LightingCondition;
  actionDescription: string;
  dialogueOrVoiceover: string;
  soundEffects: string[];
  transitionToNext: TransitionType;
  eyebrow?: string;
  headline?: string;
  subline?: string;
  attributes?: string[];
  sourceImagePath: string;
  clipVideoPath?: string;
  status: ClipQualityStatus;
  evaluationNotes?: string[];
  regenerationCount?: number;
}

export interface StoryAnalysis {
  mainConcept: string;
  storyline: string;
  videoObjective: string;
  targetAudience: string;
  narrativeStructure: {
    act1_hook: string;
    act2_presentation: string;
    act3_climax_reveal: string;
    closing_cta: string;
  };
  openingHook: string;
  mainPresentation: string;
  closingMessage: string;
  ctaText: string;
}

export interface AudioProductionPlan {
  musicTrack: string;
  mood: string;
  tempoBpm: number;
  voiceoverScript: {
    sceneId: string;
    line: string;
    startSec: number;
    durationSec: number;
  }[];
  musicVolumeDuckDb: number;
  soundEffectsTimeline: {
    timeSec: number;
    effectName: string;
  }[];
}

export interface TimelineClipSegment {
  clipIndex: number;
  sourcePath: string;
  sourceStartSec: number;
  sourceDurationSec: number;
  timelineStartSec: number;
  transitionIn: TransitionType;
  transitionDurationSec: number;
  colorGradingProfile: string;
  speedMultiplier: number;
}

export interface ProductionPlan {
  planId: string;
  slug: string;
  title: string;
  requestedQuery: string;
  targetDurationSec: number;
  isUnlimitedOrLongForm: boolean;
  story: StoryAnalysis;
  characters: Record<string, CharacterReference>;
  locations: Record<string, LocationReference>;
  scenes: ScenePlan[];
  audio: AudioProductionPlan;
  estimatedClipsCount: number;
  createdAt: string;
}

export interface ClipEvaluationResult {
  clipIndex: number;
  sceneId: string;
  passed: boolean;
  score: number; // 0 to 100
  checks: {
    characterIdentityConsistent: boolean;
    productAccurate: boolean;
    backgroundConsistent: boolean;
    lightingContinuity: boolean;
    motionFluidity: boolean;
    humanAnatomyPlausible: boolean;
  };
  detectedIssues: string[];
  recommendedAction: 'approve' | 'regenerate' | 'color-correct' | 'trim-speed';
  correctedPrompt?: string;
}

export interface PlatformVersionOutput {
  platform: SupportedPlatform;
  format: string;
  videoPath: string;
  coverPath: string;
  durationSec: number;
  fileSizeBytes: number;
  width: number;
  height: number;
  fps: number;
  passedQA: boolean;
  notes: string;
}

export interface FinalFilmProductionOutput {
  slug: string;
  title: string;
  plan: ProductionPlan;
  masterVideoPath: string;
  masterDurationSec: number;
  totalClipsGenerated: number;
  clipsRegenerated: number;
  platformVersions: Record<string, PlatformVersionOutput>;
  evaluationReport: ClipEvaluationResult[];
  qaPassed: boolean;
}
