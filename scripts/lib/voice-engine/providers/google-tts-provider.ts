// Google Cloud Text-to-Speech Voice Provider
// Integrates with Google Cloud Neural2 voices for regional Indian languages and accents.

import { writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import type { IVoiceProvider } from './provider-interface.ts';
import type { SpeechRequest, SpeechResponse, ProviderCapabilities, VoiceIdentity } from '../types.ts';
import { applyPhoneticNormalization, buildSsmlPrompt } from '../phonetics-lexicon.ts';
import { FFMPEG } from '../../ffmpeg.ts';

export class GoogleCloudVoiceProvider implements IVoiceProvider {
  readonly id = 'google';
  readonly name = 'Google Cloud TTS (Neural2 Indian Regional)';

  getCapabilities(): ProviderCapabilities {
    const apiKey = process.env.GOOGLE_TTS_API_KEY;
    return {
      name: this.name,
      isAvailable: Boolean(apiKey && apiKey.trim().length > 0),
      supportsSsml: true,
      supportsEmotion: false,
      supportsPitch: true,
      supportsRate: true,
      supportedLanguages: ['en-IN', 'hi-IN', 'bn-IN', 'mr-IN', 'ta-IN', 'te-IN', 'gu-IN', 'pa-IN'],
      authRequired: true,
      missingKeyEnv: 'GOOGLE_TTS_API_KEY'
    };
  }

  async generateSpeech(request: SpeechRequest): Promise<SpeechResponse> {
    const apiKey = process.env.GOOGLE_TTS_API_KEY;
    if (!apiKey) {
      throw new Error('GOOGLE_TTS_API_KEY environment variable is not set.');
    }

    const { text, identity, outputDir, filename } = request;
    mkdirSync(outputDir, { recursive: true });

    const langCode = identity.language === 'hi-IN' ? 'hi-IN' : 'en-IN';
    const voiceName = identity.voiceId || (identity.gender === 'male' ? `${langCode}-Neural2-B` : `${langCode}-Neural2-A`);

    const ssml = buildSsmlPrompt({
      text,
      voiceId: voiceName,
      language: identity.language,
      rate: identity.rateAdjustment,
      pitch: identity.pitchAdjustment
    });

    const res = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        input: { ssml },
        voice: {
          languageCode: langCode,
          name: voiceName
        },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: identity.rateAdjustment || 1.0,
          sampleRateHertz: 24000
        }
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Google Cloud TTS failed (${res.status}): ${errText}`);
    }

    const data = await res.json() as { audioContent?: string };
    if (!data.audioContent) {
      throw new Error('Google Cloud TTS returned empty audio payload.');
    }

    const buffer = Buffer.from(data.audioContent, 'base64');
    const finalName = filename || `google_${identity.profileId}_${Date.now()}.mp3`;
    const outputPath = path.join(outputDir, finalName);
    writeFileSync(outputPath, buffer);

    const durationSec = this.probeDuration(outputPath);

    return {
      audioFilePath: outputPath,
      durationSec,
      provider: this.id,
      voiceId: voiceName,
      sampleRate: 24000,
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
