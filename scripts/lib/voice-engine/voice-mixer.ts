// Multi-Clip Voice & Soundtrack Mixing Engine for Monavi Collection
// Harmonizes dialogue cues, background instrumentation, -14dB music ducking, and 48kHz AAC mastering.

import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import type { VoiceIdentity, VoiceProfileId } from './types.ts';
import { VoiceProviderRegistry } from './providers/provider-registry.ts';
import { VoiceQA } from './voice-qa.ts';
import { modulateEmotionForScene } from './emotion-engine.ts';
import { FFMPEG } from '../ffmpeg.ts';

export interface TimedDialogueCue {
  text: string;
  startSec: number;
  durationSec?: number;
  identity?: VoiceIdentity;
  sceneIndex?: number;
}

export interface MixFilmAudioOptions {
  slug: string;
  totalDurationSec: number;
  cues: TimedDialogueCue[];
  baseIdentity: VoiceIdentity;
  backgroundMusicPath?: string;
  duckMusicDb?: number; // default -14dB
  outputPath: string;
}

export class VoiceMixer {
  /**
   * Synthesizes all timed cues and mixes them with background music and ducking.
   */
  static async mixFilmAudio(options: MixFilmAudioOptions): Promise<{ outputPath: string; cueAudios: string[] }> {
    const {
      slug,
      totalDurationSec,
      cues,
      baseIdentity,
      backgroundMusicPath,
      duckMusicDb = -14,
      outputPath
    } = options;

    const registry = VoiceProviderRegistry.getInstance();
    const scratchDir = path.join(process.cwd(), 'assets', 'photos', slug, '_voice_scratch');
    mkdirSync(scratchDir, { recursive: true });
    mkdirSync(path.dirname(outputPath), { recursive: true });

    // 1. Synthesize all dialogue cues with scene-aware emotion modulation
    const cueFiles: { file: string; startSec: number; duration: number }[] = [];

    for (let i = 0; i < cues.length; i++) {
      const cue = cues[i]!;
      const cueDir = path.join(scratchDir, `cue_${i}`);
      mkdirSync(cueDir, { recursive: true });

      // Modulate emotion for this scene position
      const modulated = modulateEmotionForScene(baseIdentity.emotion, i, cues.length);
      const cueIdentity: VoiceIdentity = {
        ...baseIdentity,
        ...(cue.identity || {}),
        rateAdjustment: (cue.identity?.rateAdjustment || baseIdentity.rateAdjustment) * modulated.rateMultiplier,
        pitchAdjustment: `${modulated.pitchOffsetHz >= 0 ? '+' : ''}${modulated.pitchOffsetHz}Hz`
      };

      const speechRes = await registry.synthesizeWithFallback({
        text: cue.text,
        identity: cueIdentity,
        outputDir: cueDir,
        filename: `cue_${i}.mp3`
      });

      // Voice QA audit on cue
      const qa = VoiceQA.auditAudio(speechRes.audioFilePath, {
        expectedDurationSec: cue.durationSec,
        maxAllowedDurationSec: cue.durationSec ? cue.durationSec + 0.5 : undefined
      });

      if (!qa.passed) {
        console.warn(`[VoiceMixer] Voice QA warning on cue ${i}: ${qa.issues.join('; ')}`);
      }

      cueFiles.push({
        file: speechRes.audioFilePath,
        startSec: cue.startSec,
        duration: speechRes.durationSec
      });
    }

    // 2. Build FFmpeg audio mix graph with background drone/music & ducking
    const ffmpegArgs: string[] = ['-y', '-hide_banner', '-loglevel', 'error'];

    // Input 0: Ambient music or synthesised Indian drone
    let useGeneratedDrone = true;
    if (backgroundMusicPath && path.isAbsolute(backgroundMusicPath)) {
      ffmpegArgs.push('-i', backgroundMusicPath);
      useGeneratedDrone = false;
    } else {
      ffmpegArgs.push('-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=stereo');
    }

    // Inputs 1..N: Synthesized voice cues
    cueFiles.forEach(c => {
      ffmpegArgs.push('-i', c.file);
    });

    const filterParts: string[] = [];

    // Background track setup
    if (useGeneratedDrone) {
      filterParts.push(
        `sine=f=138.59:d=${totalDurationSec}[s0];` +
        `sine=f=207.65:d=${totalDurationSec}[s1];` +
        `sine=f=277.18:d=${totalDurationSec}[s2];` +
        `[s0][s1][s2]amix=inputs=3,volume=0.14,aecho=0.8:0.7:120:0.35,lowpass=f=1800[bg]`
      );
    } else {
      filterParts.push(`[0:a]volume=0.35,lowpass=f=4000[bg]`);
    }

    // Delay each voice cue to its exact timestamp
    const delayedVoTags: string[] = [];
    for (let i = 0; i < cueFiles.length; i++) {
      const c = cueFiles[i]!;
      const delayMs = Math.max(0, Math.round(c.startSec * 1000));
      const tag = `[vo${i}]`;
      filterParts.push(`[${i + 1}:a]aresample=48000,adelay=${delayMs}|${delayMs},volume=1.35${tag}`);
      delayedVoTags.push(tag);
    }

    // Mix dialogue cues into unified vocal track with broadcast mastering EQ
    filterParts.push(
      `${delayedVoTags.join('')}amix=inputs=${cueFiles.length}:dropout_transition=0,` +
      `volume=1.45,highpass=f=100,equalizer=f=3200:t=q:w=1.2:g=3.0,aecho=0.6:0.4:35:0.2[clean_vox]`
    );

    // Dynamic mix with background ducking and smooth end fade
    filterParts.push(
      `[bg][clean_vox]amix=inputs=2:weights=0.35 1.0:dropout_transition=0,` +
      `alimiter=limit=0.92,afade=t=out:st=${Math.max(0, totalDurationSec - 1.2).toFixed(2)}:d=1.2[outa]`
    );

    ffmpegArgs.push(
      '-filter_complex', filterParts.join(';'),
      '-map', '[outa]',
      '-c:a', 'aac',
      '-b:a', '192k',
      '-ar', '48000',
      '-ac', '2',
      '-t', totalDurationSec.toFixed(3),
      outputPath
    );

    await new Promise<void>((resolve, reject) => {
      const proc = spawn(FFMPEG, ffmpegArgs, { stdio: 'inherit' });
      proc.on('close', code => {
        if (code === 0) resolve();
        else reject(new Error(`VoiceMixer FFmpeg process exited with code ${code}`));
      });
    });

    return {
      outputPath,
      cueAudios: cueFiles.map(c => c.file)
    };
  }
}
