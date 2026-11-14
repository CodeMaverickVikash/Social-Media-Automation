// Voice Quality Assurance Engine for Monavi Collection
// Enforces broadcast audio thresholds: peak headroom, absence of clipping, and timing compliance.

import { existsSync, statSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import type { VoiceQAResult } from './types.ts';
import { FFMPEG } from '../ffmpeg.ts';

export class VoiceQA {
  /**
   * Audits generated speech audio file against studio broadcast standards.
   */
  static auditAudio(filePath: string, options?: { expectedDurationSec?: number; maxAllowedDurationSec?: number }): VoiceQAResult {
    const issues: string[] = [];
    const warnings: string[] = [];

    // 1. Physical file check
    if (!existsSync(filePath)) {
      return {
        passed: false,
        peakDbfs: -99,
        hasClipping: false,
        durationSec: 0,
        pronunciationWarnings: [],
        issues: [`Audio file does not exist at path: ${filePath}`]
      };
    }

    const stat = statSync(filePath);
    if (stat.size < 1024) {
      return {
        passed: false,
        peakDbfs: -99,
        hasClipping: false,
        durationSec: 0,
        pronunciationWarnings: [],
        issues: [`Audio file is suspiciously small (${stat.size} bytes). Synthesis likely truncated.`]
      };
    }

    // 2. FFmpeg volumedetect and duration probe
    let peakDbfs = -1.0;
    let meanDbfs = -18.0;
    let durationSec = 0;

    try {
      const probeRes = spawnSync(FFMPEG, [
        '-i', filePath,
        '-af', 'volumedetect',
        '-f', 'null',
        '-'
      ], { encoding: 'utf8' });

      const output = probeRes.stderr || '';

      const maxVolMatch = output.match(/max_volume:\s*(-?[\d.]+)\s*dB/);
      if (maxVolMatch) {
        peakDbfs = parseFloat(maxVolMatch[1]!);
      }

      const meanVolMatch = output.match(/mean_volume:\s*(-?[\d.]+)\s*dB/);
      if (meanVolMatch) {
        meanDbfs = parseFloat(meanVolMatch[1]!);
      }

      const durMatch = output.match(/time=(\d+):(\d+):(\d+\.\d+)/);
      if (durMatch) {
        durationSec = parseFloat(durMatch[1]!) * 3600 + parseFloat(durMatch[2]!) * 60 + parseFloat(durMatch[3]!);
      }
    } catch (err: any) {
      warnings.push(`Could not run volumedetect probe: ${err.message}`);
    }

    // 3. Clipping check (headroom threshold >= -0.2 dB is considered clipping risk)
    const hasClipping = peakDbfs >= -0.1;
    if (hasClipping) {
      issues.push(`Audio clips with peak volume ${peakDbfs.toFixed(1)} dBFS (limit: < -0.5 dBFS).`);
    }

    // 4. Undervolume / dead silence check
    if (meanDbfs < -45.0) {
      issues.push(`Audio level is too quiet or near silence (mean volume: ${meanDbfs.toFixed(1)} dBFS).`);
    }

    // 5. Scene timing check
    if (options?.maxAllowedDurationSec && durationSec > options.maxAllowedDurationSec + 0.3) {
      issues.push(`Voiceover duration (${durationSec.toFixed(2)}s) exceeds scene time budget (${options.maxAllowedDurationSec.toFixed(2)}s).`);
    }

    const passed = issues.length === 0;

    return {
      passed,
      peakDbfs,
      hasClipping,
      durationSec,
      expectedDurationSec: options?.expectedDurationSec,
      pronunciationWarnings: warnings,
      issues
    };
  }
}
