// Provider Registry & Fallback Orchestrator for Voice Engine
// Manages provider selection, capability querying, and resilient fallback chains.

import type { IVoiceProvider } from './provider-interface.ts';
import { EdgeNeuralVoiceProvider } from './edge-neural-provider.ts';
import { OpenAIVoiceProvider } from './openai-provider.ts';
import { ElevenLabsVoiceProvider } from './elevenlabs-provider.ts';
import { GoogleCloudVoiceProvider } from './google-tts-provider.ts';
import type { SpeechRequest, SpeechResponse, VoiceIdentity, ProviderCapabilities } from '../types.ts';

export class VoiceProviderRegistry {
  private static instance: VoiceProviderRegistry;
  private providers = new Map<string, IVoiceProvider>();

  private constructor() {
    this.register(new EdgeNeuralVoiceProvider());
    this.register(new OpenAIVoiceProvider());
    this.register(new ElevenLabsVoiceProvider());
    this.register(new GoogleCloudVoiceProvider());
  }

  static getInstance(): VoiceProviderRegistry {
    if (!VoiceProviderRegistry.instance) {
      VoiceProviderRegistry.instance = new VoiceProviderRegistry();
    }
    return VoiceProviderRegistry.instance;
  }

  register(provider: IVoiceProvider): void {
    this.providers.set(provider.id, provider);
  }

  getProvider(id: string): IVoiceProvider | undefined {
    return this.providers.get(id);
  }

  listCapabilities(): Record<string, ProviderCapabilities> {
    const caps: Record<string, ProviderCapabilities> = {};
    for (const [id, provider] of this.providers.entries()) {
      caps[id] = provider.getCapabilities();
    }
    return caps;
  }

  /**
   * Resolves the best available provider for a given voice request.
   * If the requested provider is unavailable or fails, falls back through the priority chain:
   * [Requested Provider] -> elevenlabs/openai (if keyed) -> edge (always available).
   */
  async synthesizeWithFallback(request: SpeechRequest): Promise<SpeechResponse> {
    const requestedId = request.identity.provider;
    const candidates: IVoiceProvider[] = [];

    // 1. Explicit provider if specified and not 'auto'
    if (requestedId && requestedId !== 'auto') {
      const p = this.providers.get(requestedId);
      if (p) candidates.push(p);
    }

    // 2. High-fidelity cloud providers if credentials exist
    const elevenlabs = this.providers.get('elevenlabs');
    if (elevenlabs && elevenlabs.getCapabilities().isAvailable && !candidates.includes(elevenlabs)) {
      candidates.push(elevenlabs);
    }

    const openai = this.providers.get('openai');
    if (openai && openai.getCapabilities().isAvailable && !candidates.includes(openai)) {
      candidates.push(openai);
    }

    // 3. Robust zero-credential default: Microsoft Edge Neural TTS
    const edge = this.providers.get('edge');
    if (edge && !candidates.includes(edge)) {
      candidates.push(edge);
    }

    let lastError: Error | null = null;
    for (const provider of candidates) {
      try {
        const response = await provider.generateSpeech(request);
        return response;
      } catch (err: any) {
        console.warn(`[VoiceRegistry] Provider "${provider.id}" failed: ${err.message}. Trying next fallback...`);
        lastError = err;
      }
    }

    throw new Error(`All voice synthesis providers failed. Last error: ${lastError?.message || 'Unknown'}`);
  }
}
