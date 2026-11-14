// OpenAI Text-to-Speech Voice Provider
// Integrates with OpenAI tts-1 / tts-1-hd for ultra-realistic studio speech.

import { writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import type { IVoiceProvider } from './provider-interface.ts';
import type { SpeechRequest, SpeechResponse, ProviderCapabilities, VoiceIdentity } from '../types.ts';
import { applyPhoneticNormalization } from '../phonetics-lexicon.ts';
import { FFMPEG } from '../../ffmpeg.ts';

export class OpenAIVoiceProvider implements IVoiceProvider {
  readonly id = 'openai';
  readonly name = 'OpenAI TTS (Neural HD Speech)';

  getCapabilities(): ProviderCapabilities {
    const apiKey = process.env.OPENAI_API_KEY;
    return {
      name: this.name,
      isAvailable: Boolean(apiKey && apiKey.trim().length > 0),
      supportsSsml: false,
      supportsEmotion: true,
      supportsPitch: false,
      supportsRate: true,
      supportedLanguages: ['en-IN', 'hi-IN', 'hinglish'],
      authRequired: true,
      missingKeyEnv: 'OPENAI_API_KEY'
    };
  }

  async generateSpeech(request: SpeechRequest): Promise<SpeechResponse> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is not set.');
    }

    const { text, identity, outputDir, filename } = request;
    mkdirSync(outputDir, { recursive: true });

    const voice = identity.voiceId || (identity.gender === 'male' ? 'onyx' : 'nova');
    const speed = Math.min(2.0, Math.max(0.25, identity.rateAdjustment || 1.0));
    const normalizedText = applyPhoneticNormalization(text, identity.language);

    const res = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'tts-1-hd',
        input: normalizedText,
        voice,
        speed,
        response_format: 'mp3'
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`OpenAI TTS request failed (${res.status}): ${errText}`);
    }

    const buffer = Buffer.from(await res.arrayBuffer());
    const finalName = filename || `openai_${identity.profileId}_${Date.now()}.mp3`;
    const outputPath = path.join(outputDir, finalName);
    writeFileSync(outputPath, buffer);

    const durationSec = this.probeDuration(outputPath);

    return {
      audioFilePath: outputPath,
      durationSec,
      provider: this.id,
      voiceId: voice,
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
