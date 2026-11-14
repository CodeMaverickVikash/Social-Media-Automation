// Voiceover & Audio Production Engine for Monavi Collection
// Seamlessly routes through the AI Human Voice Engine for multi-provider synthesis,
// emotion styling, multilingual phonetics, and broadcast mastering.

import { VoiceMixer, type TimedDialogueCue } from '../voice-engine/voice-mixer.ts';
import { VoiceDirector } from '../voice-engine/voice-director.ts';
import type { VoiceIdentity } from '../voice-engine/types.ts';

export interface VoiceoverCue {
  text: string;
  startSec: number;
  durationSec: number;
}

/**
 * Synthesizes a timed, continuous vocal voiceover track with ambient royal music.
 */
export async function createFilmVoiceoverTrack(options: {
  slug: string;
  totalDurationSec: number;
  cues: VoiceoverCue[];
  outputPath: string;
  category?: string;
  identity?: VoiceIdentity;
}): Promise<string> {
  const { slug, totalDurationSec, cues, outputPath, category = 'bridal' } = options;

  const baseIdentity = options.identity || VoiceDirector.createIdentityFromContext({
    fashionCategory: category,
    sceneEnvironment: 'royal palace',
    emotionalContext: 'luxury',
    preferredLanguage: 'en-IN'
  });

  const timedCues: TimedDialogueCue[] = cues.map((c, i) => ({
    text: c.text,
    startSec: c.startSec,
    durationSec: c.durationSec,
    sceneIndex: i
  }));

  const result = await VoiceMixer.mixFilmAudio({
    slug,
    totalDurationSec,
    cues: timedCues,
    baseIdentity,
    duckMusicDb: -14,
    outputPath
  });

  return result.outputPath;
}
