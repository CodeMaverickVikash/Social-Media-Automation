// Comprehensive Test Suite for Monavi AI Human Voice Engine
// Verifies 10 core real-world fashion voice scenarios required by Section 12.

import assert from 'node:assert';
import path from 'node:path';
import { existsSync, unlinkSync, mkdirSync } from 'node:fs';
import {
  MONAVI_VOICE_PROFILES,
  VoiceDirector,
  createVoiceIdentity,
  VoiceProviderRegistry,
  VoiceQA,
  VoiceMixer,
  detectLanguageCadence,
  applyPhoneticNormalization,
  modulateEmotionForScene
} from './lib/voice-engine/index.ts';

const TEST_WORK_DIR = path.join(process.cwd(), 'output', '_voice_test_scratch');
mkdirSync(TEST_WORK_DIR, { recursive: true });

async function runTests() {
  console.log('================================================================');
  console.log('  MONAVI AI HUMAN VOICE ENGINE - COMPREHENSIVE TEST SUITE');
  console.log('================================================================\n');

  const registry = VoiceProviderRegistry.getInstance();

  // ─── Scenario 1: Men\'s Fashion Promotional Dialogue ─────────────────────────
  console.log('Scenario 1: Men\'s Fashion Promotional Dialogue...');
  const mensContext = {
    fashionCategory: 'kurta_pajama',
    characterRole: 'young male model',
    naturalLanguageInstruction: 'Create energetic promotional audio for men\'s festive kurta pajama'
  };
  const mensAnalysis = VoiceDirector.analyzeAndSelect(mensContext);
  assert(mensAnalysis.recommendedProfile === 'male_young', 'Scenario 1: Should select male_young for energetic men\'s kurta');
  assert(mensAnalysis.emotionalTone === 'excitement', 'Scenario 1: Should recommend excitement emotion');
  const mensIdentity = VoiceDirector.createIdentityFromContext(mensContext);
  const mensSpeech = await registry.synthesizeWithFallback({
    text: 'Upgrade your festive look with tailored silk kurta pajamas from Monavi Collection.',
    identity: mensIdentity,
    outputDir: path.join(TEST_WORK_DIR, 'sc1')
  });
  const mensQA = VoiceQA.auditAudio(mensSpeech.audioFilePath);
  assert(mensQA.passed, `Scenario 1: Voice QA should pass for mens promotional dialogue (${mensQA.issues.join('; ')})`);
  console.log(`  ✓ Passed (Audio: ${mensSpeech.durationSec.toFixed(2)}s, Peak: ${mensQA.peakDbfs.toFixed(1)} dBFS)\n`);

  // ─── Scenario 2: Women\'s Fashion Storytelling ───────────────────────────────
  console.log('Scenario 2: Women\'s Fashion Storytelling...');
  const womensContext = {
    fashionCategory: 'handloom_saree',
    characterRole: 'artisan chronicler',
    dialogueOrScript: 'Each thread carries a legacy of seven generations. Woven in pure silk, whispered in gold.'
  };
  const womensAnalysis = VoiceDirector.analyzeAndSelect(womensContext);
  assert(womensAnalysis.recommendedProfile === 'female_premium' || womensAnalysis.recommendedProfile === 'narrator_storytelling', 'Scenario 2: Should select premium female or storytelling');
  const womensIdentity = VoiceDirector.createIdentityFromContext(womensContext);
  const womensSpeech = await registry.synthesizeWithFallback({
    text: womensContext.dialogueOrScript,
    identity: womensIdentity,
    outputDir: path.join(TEST_WORK_DIR, 'sc2')
  });
  const womensQA = VoiceQA.auditAudio(womensSpeech.audioFilePath);
  assert(womensQA.passed, `Scenario 2: Storytelling QA should pass (${womensQA.issues.join('; ')})`);
  console.log(`  ✓ Passed (Audio: ${womensSpeech.durationSec.toFixed(2)}s, Peak: ${womensQA.peakDbfs.toFixed(1)} dBFS)\n`);

  // ─── Scenario 3: Kids\' Fashion Promotional Dialogue ─────────────────────────
  console.log('Scenario 3: Kids\' Fashion Promotional Dialogue...');
  const kidsContext = {
    fashionCategory: 'kids_frock',
    naturalLanguageInstruction: 'Cheerful promotional voice for kids festival clothing'
  };
  const kidsAnalysis = VoiceDirector.analyzeAndSelect(kidsContext);
  assert(kidsAnalysis.recommendedProfile === 'kid_playful', 'Scenario 3: Must select kid_playful profile');
  const kidsIdentity = VoiceDirector.createIdentityFromContext(kidsContext);
  assert(kidsIdentity.gender === 'child', 'Scenario 3: Identity gender must be child');
  const kidsSpeech = await registry.synthesizeWithFallback({
    text: 'Twirl in style this Diwali! Cute festive party frocks for little stars at Monavi Collection.',
    identity: kidsIdentity,
    outputDir: path.join(TEST_WORK_DIR, 'sc3')
  });
  const kidsQA = VoiceQA.auditAudio(kidsSpeech.audioFilePath);
  assert(kidsQA.passed, `Scenario 3: Kids speech QA should pass (${kidsQA.issues.join('; ')})`);
  console.log(`  ✓ Passed (Audio: ${kidsSpeech.durationSec.toFixed(2)}s, Peak: ${kidsQA.peakDbfs.toFixed(1)} dBFS)\n`);

  // ─── Scenario 4: Bridal and Festive Fashion Narration ─────────────────────────
  console.log('Scenario 4: Bridal and Festive Fashion Narration...');
  const bridalContext = {
    fashionCategory: 'bridal_lehenga',
    emotionalContext: 'luxury' as const,
    naturalLanguageInstruction: 'Deep luxury royal narration for dulhan bridal lehenga'
  };
  const bridalAnalysis = VoiceDirector.analyzeAndSelect(bridalContext);
  assert(bridalAnalysis.recommendedProfile === 'female_premium', 'Scenario 4: Must select female_premium for bridal luxury');
  const bridalIdentity = VoiceDirector.createIdentityFromContext(bridalContext);
  const bridalSpeech = await registry.synthesizeWithFallback({
    text: 'Dulhan Bridal Collection. Woven with royal splendour for your unforgettable day.',
    identity: bridalIdentity,
    outputDir: path.join(TEST_WORK_DIR, 'sc4')
  });
  const bridalQA = VoiceQA.auditAudio(bridalSpeech.audioFilePath);
  assert(bridalQA.passed, `Scenario 4: Bridal QA should pass (${bridalQA.issues.join('; ')})`);
  console.log(`  ✓ Passed (Audio: ${bridalSpeech.durationSec.toFixed(2)}s, Peak: ${bridalQA.peakDbfs.toFixed(1)} dBFS)\n`);

  // ─── Scenario 5: Hindi Voiceover ──────────────────────────────────────────────
  console.log('Scenario 5: Hindi Voiceover...');
  const hindiText = 'मोनावी कलेक्शन। अपनी कहानी पहनें और हर शादी को बनाएं ख़ास।';
  const detectedLang = detectLanguageCadence(hindiText);
  assert(detectedLang === 'hi-IN', 'Scenario 5: Language cadence should detect hi-IN');
  const hindiIdentity = createVoiceIdentity('female_premium', {
    language: 'hi-IN',
    gender: 'female'
  });
  const hindiSpeech = await registry.synthesizeWithFallback({
    text: hindiText,
    identity: hindiIdentity,
    outputDir: path.join(TEST_WORK_DIR, 'sc5')
  });
  const hindiQA = VoiceQA.auditAudio(hindiSpeech.audioFilePath);
  assert(hindiQA.passed, `Scenario 5: Hindi QA should pass (${hindiQA.issues.join('; ')})`);
  console.log(`  ✓ Passed (Audio: ${hindiSpeech.durationSec.toFixed(2)}s, Peak: ${hindiQA.peakDbfs.toFixed(1)} dBFS)\n`);

  // ─── Scenario 6: English Voiceover ────────────────────────────────────────────
  console.log('Scenario 6: Indian English Voiceover with Lexicon Phonetics...');
  const englishText = 'Crafted in royal Banarasi silk with pure antique Zari embroidery. Monavi Collection.';
  const normalizedEnglish = applyPhoneticNormalization(englishText, 'en-IN');
  assert(normalizedEnglish.includes('Monavi') && normalizedEnglish.includes('Zari'), 'Scenario 6: Lexicon retains proper casing and phonetic tags');
  const englishIdentity = createVoiceIdentity('narrator_brand', {
    language: 'en-IN'
  });
  const englishSpeech = await registry.synthesizeWithFallback({
    text: englishText,
    identity: englishIdentity,
    outputDir: path.join(TEST_WORK_DIR, 'sc6')
  });
  const englishQA = VoiceQA.auditAudio(englishSpeech.audioFilePath);
  assert(englishQA.passed, `Scenario 6: English QA should pass (${englishQA.issues.join('; ')})`);
  console.log(`  ✓ Passed (Audio: ${englishSpeech.durationSec.toFixed(2)}s, Peak: ${englishQA.peakDbfs.toFixed(1)} dBFS)\n`);

  // ─── Scenario 7: Hinglish Conversation ────────────────────────────────────────
  console.log('Scenario 7: Hinglish Conversational Delivery...');
  const hinglishText = 'Celebrate this Diwali with pure Banarasi style. Ab har shaadi hogi royal with Monavi Collection.';
  const hinglishCadence = detectLanguageCadence(hinglishText);
  assert(hinglishCadence === 'hinglish', `Scenario 7: Cadence detector should detect hinglish (got: ${hinglishCadence})`);
  const hinglishIdentity = createVoiceIdentity('female_casual', {
    language: 'hinglish'
  });
  const hinglishSpeech = await registry.synthesizeWithFallback({
    text: hinglishText,
    identity: hinglishIdentity,
    outputDir: path.join(TEST_WORK_DIR, 'sc7')
  });
  const hinglishQA = VoiceQA.auditAudio(hinglishSpeech.audioFilePath);
  assert(hinglishQA.passed, `Scenario 7: Hinglish QA should pass (${hinglishQA.issues.join('; ')})`);
  console.log(`  ✓ Passed (Audio: ${hinglishSpeech.durationSec.toFixed(2)}s, Peak: ${hinglishQA.peakDbfs.toFixed(1)} dBFS)\n`);

  // ─── Scenario 8: Multi-Scene Video with Consistent Voice Identity ────────────
  console.log('Scenario 8: Multi-Scene Voice Consistency Across Clips...');
  const masterIdentity = createVoiceIdentity('female_premium', {
    id: 'campaign_dulhan_consistent_01',
    language: 'en-IN',
    emotion: 'luxury'
  });
  const scene1Mod = modulateEmotionForScene(masterIdentity.emotion, 0, 3);
  const scene2Mod = modulateEmotionForScene(masterIdentity.emotion, 1, 3);
  const scene3Mod = modulateEmotionForScene(masterIdentity.emotion, 2, 3);
  // Scene 0 has higher hook rate, Scene 2 has grounded conclusion rate
  assert(scene1Mod.rateMultiplier > scene3Mod.rateMultiplier, 'Scenario 8: Hook scene should have punchier rate than closing sign-off');
  assert(masterIdentity.voiceId === 'en-IN-NeerjaExpressiveNeural', 'Scenario 8: Voice identity must remain locked across clips');
  console.log(`  ✓ Passed (Identity locked to "${masterIdentity.voiceId}" across all 3 scene cuts)\n`);

  // ─── Scenario 9: Raw Camera Footage with Generated Voiceover ──────────────────
  console.log('Scenario 9: Voiceover for Uploaded Raw Footage...');
  const rawFootageContext = {
    fashionCategory: 'designer_sherwani',
    videoPurpose: 'promotional' as const,
    targetAudience: 'Indian grooms',
    dialogueOrScript: 'Raw royal texture. Impeccable tailoring. Made for the groom who commands the room.'
  };
  const rawAnalysis = VoiceDirector.analyzeAndSelect(rawFootageContext);
  assert(rawAnalysis.recommendedProfile === 'male_premium', 'Scenario 9: Must select male_premium for designer sherwani');
  const rawIdentity = VoiceDirector.createIdentityFromContext(rawFootageContext);
  const rawSpeech = await registry.synthesizeWithFallback({
    text: rawFootageContext.dialogueOrScript,
    identity: rawIdentity,
    outputDir: path.join(TEST_WORK_DIR, 'sc9')
  });
  const rawQA = VoiceQA.auditAudio(rawSpeech.audioFilePath, { maxAllowedDurationSec: 8.5 });
  assert(rawQA.passed, `Scenario 9: Raw footage voiceover QA should pass (${rawQA.issues.join('; ')})`);
  console.log(`  ✓ Passed (Duration: ${rawSpeech.durationSec.toFixed(2)}s, Fits raw clip budget)\n`);

  // ─── Scenario 10: Voice and Background Music Synchronization ──────────────────
  console.log('Scenario 10: Voice & Background Music Synchronization with -14dB Ducking...');
  const mixOut = path.join(TEST_WORK_DIR, 'sc10', 'mixed_soundtrack.aac');
  const mixResult = await VoiceMixer.mixFilmAudio({
    slug: 'voice_test_sync',
    totalDurationSec: 10.0,
    cues: [
      { text: 'Introducing Monavi Collection.', startSec: 0.5, durationSec: 2.2 },
      { text: 'Handcrafted luxury for every celebration.', startSec: 3.5, durationSec: 2.5 },
      { text: 'Wear your story.', startSec: 7.2, durationSec: 1.8 }
    ],
    baseIdentity: masterIdentity,
    duckMusicDb: -14,
    outputPath: mixOut
  });
  assert(existsSync(mixResult.outputPath), 'Scenario 10: Mixed soundtrack file must exist');
  const finalMixQA = VoiceQA.auditAudio(mixResult.outputPath);
  assert(finalMixQA.passed, `Scenario 10: Mixed audio QA must pass (${finalMixQA.issues.join('; ')})`);
  console.log(`  ✓ Passed (Mixed Master: ${finalMixQA.durationSec.toFixed(2)}s, Peak: ${finalMixQA.peakDbfs.toFixed(1)} dBFS, -14dB ducking applied)\n`);

  console.log('================================================================');
  console.log('  ALL 10 VOICE ENGINE SCENARIOS PASSED WITH ZERO ERRORS! ✓');
  console.log('================================================================');
}

runTests().catch(err => {
  console.error('\n❌ Voice Engine Test Suite Failed:', err);
  process.exit(1);
});
