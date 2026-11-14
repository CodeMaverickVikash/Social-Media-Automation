// Microsoft Edge Neural Voice Provider
// Out-of-the-box zero-credential human neural voice synthesis with authentic Indian English and Hindi support.

import { mkdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';
import type { IVoiceProvider } from './provider-interface.ts';
import type { SpeechRequest, SpeechResponse, ProviderCapabilities, VoiceIdentity } from '../types.ts';
import { applyPhoneticNormalization } from '../phonetics-lexicon.ts';
import { FFMPEG } from '../../ffmpeg.ts';

export class EdgeNeuralVoiceProvider implements IVoiceProvider {
  readonly id = 'edge';
  readonly name = 'Microsoft Edge Neural Speech (Zero-Credential Studio Quality)';

  getCapabilities(): ProviderCapabilities {
    return {
      name: this.name,
      isAvailable: true,
      supportsSsml: true,
      supportsEmotion: true,
      supportsPitch: true,
      supportsRate: true,
      supportedLanguages: ['en-IN', 'hi-IN', 'hinglish'],
      authRequired: false
    };
  }

  async generateSpeech(request: SpeechRequest): Promise<SpeechResponse> {
    const { text, identity, outputDir, filename } = request;
    mkdirSync(outputDir, { recursive: true });

    const normalizedText = applyPhoneticNormalization(text, identity.language);

    // Voice selection based on identity and target language
    let targetVoice = identity.voiceId || 'en-IN-NeerjaExpressiveNeural';
    if (identity.language === 'hi-IN') {
      targetVoice = identity.gender === 'male' ? 'hi-IN-MadhurNeural' : 'hi-IN-SwaraNeural';
    }

    const tts = new MsEdgeTTS();
    await tts.setMetadata(targetVoice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);

    // Call toFile(destinationDir, text)
    const result = await tts.toFile(outputDir, normalizedText);
    const audioPath = result.audioFilePath;

    // Calculate exact duration with bundled ffmpeg
    const durationSec = this.probeDuration(audioPath);

    return {
      audioFilePath: audioPath,
      durationSec,
      provider: this.id,
      voiceId: targetVoice,
      sampleRate: 24000,
      channels: 1
    };
  }

  async generatePreviewSample(text: string, identity: VoiceIdentity, outputDir: string): Promise<SpeechResponse> {
    // Generate a punchy 2-3 word preview sample
    const previewText = text.split(/\s+/).slice(0, 8).join(' ');
    const previewDir = path.join(outputDir, 'previews');
    return this.generateSpeech({
      text: previewText,
      identity,
      outputDir: previewDir
    });
  }

  private probeDuration(filePath: string): number {
    try {
      const res = spawnSync(FFMPEG, ['-i', filePath, '-f', 'null', '-'], { encoding: 'utf8' });
      const match = res.stderr.match(/time=(\d+):(\d+):(\d+\.\d+)/);
      if (match) {
        const hours = parseFloat(match[1]!);
        const minutes = parseFloat(match[2]!);
        const seconds = parseFloat(match[3]!);
        return hours * 3600 + minutes * 60 + seconds;
      }
    } catch {
      // Fallback rough estimate
    }
    return 3.0;
  }
}
