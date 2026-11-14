// ElevenLabs Voice Provider
// Integrates with ElevenLabs Multilingual v2 for human-like timbre and emotional inflection.

import { writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import type { IVoiceProvider } from './provider-interface.ts';
import type { SpeechRequest, SpeechResponse, ProviderCapabilities, VoiceIdentity } from '../types.ts';
import { applyPhoneticNormalization } from '../phonetics-lexicon.ts';
import { EMOTION_PROFILES } from '../emotion-engine.ts';
import { FFMPEG } from '../../ffmpeg.ts';

export class ElevenLabsVoiceProvider implements IVoiceProvider {
  readonly id = 'elevenlabs';
  readonly name = 'ElevenLabs (Multilingual Neural Generative Voice)';

  getCapabilities(): ProviderCapabilities {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    return {
      name: this.name,
      isAvailable: Boolean(apiKey && apiKey.trim().length > 0),
      supportsSsml: false,
      supportsEmotion: true,
      supportsPitch: false,
      supportsRate: true,
      supportedLanguages: ['en-IN', 'hi-IN', 'hinglish'],
      authRequired: true,
      missingKeyEnv: 'ELEVENLABS_API_KEY'
    };
  }

  async generateSpeech(request: SpeechRequest): Promise<SpeechResponse> {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      throw new Error('ELEVENLABS_API_KEY environment variable is not set.');
    }

    const { text, identity, outputDir, filename } = request;
    mkdirSync(outputDir, { recursive: true });

    // Curated default voices: 21m00Tcm4TlvDq8ikWAM (Rachel) / VR6AewLTigWG4xSOukaG (Arnold)
    const voiceId = identity.voiceId || (identity.gender === 'male' ? 'VR6AewLTigWG4xSOukaG' : '21m00Tcm4TlvDq8ikWAM');
    const normalizedText = applyPhoneticNormalization(text, identity.language);

    const emotionMod = EMOTION_PROFILES[identity.emotion] ?? EMOTION_PROFILES.luxury;

    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg'
      },
      body: JSON.stringify({
        text: normalizedText,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.75,
          similarity_boost: 0.85,
          style: emotionMod.elevenLabsStyleExaggeration,
          use_speaker_boost: true
        }
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`ElevenLabs TTS failed (${res.status}): ${errText}`);
    }

    const buffer = Buffer.from(await res.arrayBuffer());
    const finalName = filename || `elevenlabs_${identity.profileId}_${Date.now()}.mp3`;
    const outputPath = path.join(outputDir, finalName);
    writeFileSync(outputPath, buffer);

    const durationSec = this.probeDuration(outputPath);

    return {
      audioFilePath: outputPath,
      durationSec,
      provider: this.id,
      voiceId,
      sampleRate: 44100,
      channels: 1
    };
  }

  async generatePreviewSample(text: string, identity: VoiceIdentity, outputDir: string): Promise<SpeechResponse> {
    const previewText = text.split(/\s+/).slice(0, 8).join(' ');
    return this.generateSpeech({
      text: previewText,
      identity,
      outputDir: path.join(outputDir, 'previews')
    });
  }

  private probeDuration(filePath: string): number {
    try {
      const res = spawnSync(FFMPEG, ['-i', filePath, '-f', 'null', '-'], { encoding: 'utf8' });
      const match = res.stderr.match(/time=(\d+):(\d+):(\d+\.\d+)/);
      if (match) {
        return parseFloat(match[1]!) * 3600 + parseFloat(match[2]!) * 60 + parseFloat(match[3]!);
      }
    } catch {}
    return 3.0;
  }
}
