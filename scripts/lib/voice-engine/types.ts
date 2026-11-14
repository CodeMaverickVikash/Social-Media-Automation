// AI Human Voice Engine - Core Type Definitions
// Supports multi-provider natural human voice synthesis, emotion styling,
// multilingual pronunciations (Hindi, Indian English, Hinglish), and broadcast mastering.

export type LanguageCode =
  | 'en-IN'
  | 'hi-IN'
  | 'hinglish'
  | 'bn-IN'
  | 'mr-IN'
  | 'ta-IN'
  | 'te-IN'
  | 'gu-IN'
  | 'pa-IN';

export type VoiceGender = 'male' | 'female' | 'child' | 'neutral';

export type AgePresentation = 'young' | 'mature' | 'senior' | 'child';

export type EmotionStyle =
  | 'excitement'
  | 'confidence'
  | 'elegance'
  | 'happiness'
  | 'romance'
  | 'luxury'
  | 'storytelling'
  | 'promotion'
  | 'neutral';

export type VoiceProfileId =
  // Male profiles
  | 'male_young'
  | 'male_mature'
  | 'male_premium'
  | 'male_casual'
  // Female profiles
  | 'female_young'
  | 'female_mature'
  | 'female_premium'
  | 'female_casual'
  // Kids profiles
  | 'kid_playful'
  // Role & Narrator profiles
  | 'narrator_fashion_presenter'
  | 'narrator_brand'
  | 'narrator_luxury'
  | 'narrator_storytelling'
  | 'narrator_promotional'
  | 'narrator_customer_facing';

export interface ProviderVoiceConfig {
  voiceId: string;
  rate?: number; // 0.5 to 2.0 (default 1.0)
  pitch?: string; // e.g. "+0Hz", "-4Hz", "+12Hz"
  style?: string; // provider specific expressive style (e.g. "expressive", "calm")
  stability?: number; // 0.0 - 1.0 (for ElevenLabs)
  similarityBoost?: number;
}

export interface VoiceProfile {
  id: VoiceProfileId;
  name: string;
  gender: VoiceGender;
  age: AgePresentation;
  description: string;
  defaultLanguage: LanguageCode;
  supportedLanguages: LanguageCode[];
  defaultEmotion: EmotionStyle;
  recommendedCategories: string[];
  providerConfigs: Record<string, ProviderVoiceConfig>;
}

export interface VoiceIdentity {
  id: string; // Persistent ID for campaign consistency
  profileId: VoiceProfileId;
  provider: 'edge' | 'openai' | 'elevenlabs' | 'google' | 'auto';
  voiceId: string;
  gender: VoiceGender;
  language: LanguageCode;
  pitchAdjustment: string;
  rateAdjustment: number;
  emotion: EmotionStyle;
  intensity: number; // 0.0 - 1.0
  metadata?: Record<string, any>;
}

export interface VoiceDirectorContext {
  characterRole?: string;
  agePresentation?: AgePresentation;
  gender?: VoiceGender;
  fashionCategory?: string;
  videoPurpose?: 'promotional' | 'storytelling' | 'brand_awareness' | 'festive_sale' | 'product_launch';
  sceneEnvironment?: string;
  emotionalContext?: EmotionStyle;
  dialogueOrScript?: string;
  targetAudience?: string;
  preferredLanguage?: LanguageCode;
  naturalLanguageInstruction?: string;
}

export interface VoiceDirectorAnalysis {
  category: string;
  targetAudience: string;
  emotionalTone: EmotionStyle;
  language: LanguageCode;
  recommendedProfile: VoiceProfileId;
  recommendedRate: number;
  recommendedPitch: string;
  rationale: string;
}

export interface SpeechRequest {
  text: string;
  identity: VoiceIdentity;
  outputDir: string;
  filename?: string;
  format?: 'mp3' | 'aac' | 'wav';
  applyMastering?: boolean;
}

export interface SpeechResponse {
  audioFilePath: string;
  durationSec: number;
  provider: string;
  voiceId: string;
  sampleRate: number;
  channels: number;
}

export interface VoiceQAResult {
  passed: boolean;
  peakDbfs: number;
  hasClipping: boolean;
  durationSec: number;
  expectedDurationSec?: number;
  pronunciationWarnings: string[];
  issues: string[];
}

export interface ProviderCapabilities {
  name: string;
  isAvailable: boolean;
  supportsSsml: boolean;
  supportsEmotion: boolean;
  supportsPitch: boolean;
  supportsRate: boolean;
  supportedLanguages: LanguageCode[];
  authRequired: boolean;
  missingKeyEnv?: string;
}
