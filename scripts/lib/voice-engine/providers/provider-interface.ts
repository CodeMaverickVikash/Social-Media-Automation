// Voice Provider Abstraction Interface
// Decouples AI voice engines (Edge Neural, OpenAI, ElevenLabs, Google Cloud) from production code.

import type { SpeechRequest, SpeechResponse, ProviderCapabilities, VoiceIdentity } from '../types.ts';

export interface IVoiceProvider {
  readonly id: string;
  readonly name: string;

  getCapabilities(): ProviderCapabilities;

  generateSpeech(request: SpeechRequest): Promise<SpeechResponse>;

  generatePreviewSample(text: string, identity: VoiceIdentity, outputDir: string): Promise<SpeechResponse>;
}
