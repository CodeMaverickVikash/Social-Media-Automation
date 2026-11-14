// AI Human Voice Engine CLI for Monavi Collection
// Provides command-line voice synthesis, profile inspection, and sample previews.

import path from 'node:path';
import {
  MONAVI_VOICE_PROFILES,
  createVoiceIdentity,
  VoiceProviderRegistry,
  VoiceDirector,
  VoiceQA
} from './lib/voice-engine/index.ts';
import type {
  VoiceProfileId,
  EmotionStyle,
  LanguageCode
} from './lib/voice-engine/index.ts';

function printHelp() {
  console.log(`
Monavi AI Human Voice Engine CLI

Usage:
  node scripts/voice-engine-cli.ts --profiles
  node scripts/voice-engine-cli.ts --providers
  node scripts/voice-engine-cli.ts --sample --text "<text>" [--profile <id>] [--lang <lang>] [--output <dir>]
  node scripts/voice-engine-cli.ts --generate --text "<text>" --output <path> [--profile <id>] [--emotion <emotion>] [--provider <name>]

Options:
  --profiles         List all available reusable human voice profiles
  --providers        Display status and capabilities of voice providers (Edge, OpenAI, ElevenLabs, Google)
  --sample           Generate a short sample preview of speech
  --generate         Synthesize complete high-fidelity speech audio
  --text "<string>"  Input dialogue or voiceover script
  --profile <id>     Voice profile ID (e.g. female_premium, male_premium, kid_playful)
  --lang <code>      Target language: en-IN, hi-IN, hinglish (default: auto/en-IN)
  --emotion <style>  Emotion: luxury, elegance, excitement, happiness, confidence, romance, storytelling, promotion
  --provider <name>  Provider: edge, openai, elevenlabs, google, auto (default: auto)
  --output <path>    Output destination path
`);
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    printHelp();
    return;
  }

  const registry = VoiceProviderRegistry.getInstance();

  if (args.includes('--profiles')) {
    console.log('\n=== Monavi Reusable Human Voice Profiles ===\n');
    for (const [id, p] of Object.entries(MONAVI_VOICE_PROFILES)) {
      console.log(`• [${id}] - ${p.name}`);
      console.log(`  Gender: ${p.gender} | Age: ${p.age} | Default Emotion: ${p.defaultEmotion}`);
      console.log(`  Languages: ${p.supportedLanguages.join(', ')}`);
      console.log(`  Description: ${p.description}`);
      console.log(`  Recommended for: ${p.recommendedCategories.join(', ')}\n`);
    }
    return;
  }

  if (args.includes('--providers')) {
    console.log('\n=== Voice Engine Provider Capabilities ===\n');
    const caps = registry.listCapabilities();
    for (const [id, cap] of Object.entries(caps)) {
      console.log(`• Provider: ${cap.name} (${id})`);
      console.log(`  Available: ${cap.isAvailable ? '✓ YES' : '✗ NO (Missing key: ' + cap.missingKeyEnv + ')'}`);
      console.log(`  SSML: ${cap.supportsSsml ? 'Yes' : 'No'} | Emotion: ${cap.supportsEmotion ? 'Yes' : 'No'}`);
      console.log(`  Languages: ${cap.supportedLanguages.join(', ')}\n`);
    }
    return;
  }

  // Parse arguments
  const getArg = (flag: string): string | undefined => {
    const idx = args.indexOf(flag);
    return idx !== -1 && idx + 1 < args.length ? args[idx + 1] : undefined;
  };

  const text = getArg('--text') || 'Monavi Collection. Wear your story.';
  const profileArg = (getArg('--profile') || 'female_premium') as VoiceProfileId;
  const langArg = (getArg('--lang') || 'en-IN') as LanguageCode;
  const emotionArg = (getArg('--emotion') || 'luxury') as EmotionStyle;
  const providerArg = (getArg('--provider') || 'auto') as 'edge' | 'openai' | 'elevenlabs' | 'google' | 'auto';
  const outputArg = getArg('--output') || path.join(process.cwd(), 'output', 'voice_sample.mp3');

  const identity = createVoiceIdentity(profileArg, {
    language: langArg,
    emotion: emotionArg,
    provider: providerArg
  });

  if (args.includes('--sample')) {
    console.log(`Generating preview sample with profile "${profileArg}"...`);
    const provider = registry.getProvider(providerArg === 'auto' ? 'edge' : providerArg) || registry.getProvider('edge')!;
    const previewDir = path.dirname(outputArg);
    const res = await provider.generatePreviewSample(text, identity, previewDir);
    console.log(`✓ Preview sample created at: ${res.audioFilePath} (${res.durationSec.toFixed(2)}s)`);
    return;
  }

  if (args.includes('--generate')) {
    console.log(`Synthesizing speech with profile "${profileArg}" (${identity.gender}, ${identity.language})...`);
    const res = await registry.synthesizeWithFallback({
      text,
      identity,
      outputDir: path.dirname(outputArg),
      filename: path.basename(outputArg)
    });

    console.log(`✓ Speech generated: ${res.audioFilePath} (${res.durationSec.toFixed(2)}s) via [${res.provider}]`);

    // Voice QA Check
    const qa = VoiceQA.auditAudio(res.audioFilePath);
    if (qa.passed) {
      console.log(`✓ Voice QA Passed: Peak ${qa.peakDbfs.toFixed(1)} dBFS, zero clipping.`);
    } else {
      console.warn(`! Voice QA Issues: ${qa.issues.join('; ')}`);
    }
  }
}

main().catch(err => {
  console.error('[VoiceEngineCLI Error]:', err);
  process.exit(1);
});
