// Intelligent Voice Director for Monavi Collection
// Understands video context, character archetypes, fashion categories, and natural language instructions.

import type {
  VoiceDirectorContext,
  VoiceDirectorAnalysis,
  VoiceProfileId,
  LanguageCode,
  EmotionStyle,
  VoiceIdentity
} from './types.ts';
import { MONAVI_VOICE_PROFILES, createVoiceIdentity } from './profiles-library.ts';
import { detectLanguageCadence } from './phonetics-lexicon.ts';

export class VoiceDirector {
  /**
   * Analyzes context and selects the optimal human voice profile and prosody.
   */
  static analyzeAndSelect(context: VoiceDirectorContext): VoiceDirectorAnalysis {
    const rawInstruction = (context.naturalLanguageInstruction || '').toLowerCase();
    const category = (context.fashionCategory || '').toLowerCase();
    const role = (context.characterRole || '').toLowerCase();
    const dialogue = context.dialogueOrScript || '';

    // 1. Detect target language
    let language: LanguageCode = context.preferredLanguage || 'en-IN';
    if (rawInstruction.includes('hindi') || rawInstruction.includes('हिंदी')) {
      language = 'hi-IN';
    } else if (rawInstruction.includes('hinglish')) {
      language = 'hinglish';
    } else if (dialogue.length > 0) {
      language = detectLanguageCadence(dialogue);
    }

    // 2. Determine gender & profile
    let profileId: VoiceProfileId = 'narrator_brand';
    let emotion: EmotionStyle = context.emotionalContext || 'luxury';
    let rate = 1.0;
    let pitch = '+0Hz';
    let rationale = '';

    // Check natural language explicit requests first
    if (rawInstruction.includes('kid') || rawInstruction.includes('child') || category.includes('kid')) {
      profileId = 'kid_playful';
      emotion = 'happiness';
      rate = 1.10;
      pitch = '+12Hz';
      rationale = 'Selected Joyful Childhood profile for kidswear festive line.';
    } else if (rawInstruction.includes('male') || role.includes('groom') || role.includes('man') || category.includes('sherwani') || category.includes('kurta')) {
      if (rawInstruction.includes('young') || rawInstruction.includes('energetic') || category.includes('indo_western')) {
        profileId = 'male_young';
        emotion = 'excitement';
        rate = 1.03;
        pitch = '+1Hz';
        rationale = 'Selected Modern Dapper male young profile for contemporary menswear.';
      } else if (rawInstruction.includes('casual') || category.includes('shirt') || category.includes('trouser')) {
        profileId = 'male_casual';
        emotion = 'happiness';
        rate = 1.02;
        rationale = 'Selected Urban Casual male profile for everyday menswear.';
      } else if (rawInstruction.includes('mature') || rawInstruction.includes('dignified')) {
        profileId = 'male_mature';
        emotion = 'confidence';
        rate = 0.96;
        pitch = '-2Hz';
        rationale = 'Selected Patriarch Elegance male mature profile for classic formal wear.';
      } else {
        profileId = 'male_premium';
        emotion = 'luxury';
        rate = 0.93;
        pitch = '-4Hz';
        rationale = 'Selected Heritage Royalty male premium baritone for royal groomswear / sherwanis.';
      }
    } else if (category.includes('bridal') || category.includes('saree') || category.includes('lehenga') || rawInstruction.includes('luxury') || rawInstruction.includes('premium')) {
      profileId = 'female_premium';
      emotion = 'luxury';
      rate = 0.94;
      pitch = '-2Hz';
      rationale = 'Selected Royal Monavi Sovereign female premium profile for bridal couture.';
    } else if (rawInstruction.includes('presenter') || rawInstruction.includes('runway')) {
      profileId = 'narrator_fashion_presenter';
      emotion = 'confidence';
      rate = 1.05;
      pitch = '+1Hz';
      rationale = 'Selected Runway Host profile for dynamic fashion drops.';
    } else if (rawInstruction.includes('story') || rawInstruction.includes('heritage')) {
      profileId = 'narrator_storytelling';
      emotion = 'storytelling';
      rate = 0.92;
      pitch = '-1Hz';
      rationale = 'Selected Artisan Chronicler profile for heritage storytelling.';
    } else if (rawInstruction.includes('sale') || rawInstruction.includes('offer') || rawInstruction.includes('promo')) {
      profileId = 'narrator_promotional';
      emotion = 'promotion';
      rate = 1.08;
      pitch = '+1Hz';
      rationale = 'Selected Celebration Offers profile for high-conversion promotion.';
    } else {
      profileId = 'female_young';
      emotion = 'happiness';
      rate = 1.02;
      pitch = '+1Hz';
      rationale = 'Selected Modern Festive Chic profile for welcoming, elegant presentation.';
    }

    // Apply natural language rate/speed tweaks
    if (rawInstruction.includes('reduce speed') || rawInstruction.includes('slow') || rawInstruction.includes('slower')) {
      rate = Math.max(0.80, rate * 0.90);
      rationale += ' Adjusted speaking rate slower per user request.';
    } else if (rawInstruction.includes('faster') || rawInstruction.includes('quick')) {
      rate = Math.min(1.25, rate * 1.10);
      rationale += ' Adjusted speaking rate faster per user request.';
    }

    return {
      category: category || 'fashion',
      targetAudience: context.targetAudience || 'Monavi luxury shoppers',
      emotionalTone: emotion,
      language,
      recommendedProfile: profileId,
      recommendedRate: rate,
      recommendedPitch: pitch,
      rationale
    };
  }

  /**
   * Generates a fully configured VoiceIdentity ready for consistent multi-clip synthesis.
   */
  static createIdentityFromContext(context: VoiceDirectorContext): VoiceIdentity {
    const analysis = this.analyzeAndSelect(context);
    return createVoiceIdentity(analysis.recommendedProfile, {
      language: analysis.language,
      rateAdjustment: analysis.recommendedRate,
      pitchAdjustment: analysis.recommendedPitch,
      emotion: analysis.emotionalTone,
      metadata: {
        analysisRationale: analysis.rationale,
        category: analysis.category
      }
    });
  }
}
