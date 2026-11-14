// Platform Video Specifications & Dynamic Duration Calculation Service
// Formula: Maximum Video Duration = MIN(Platform Duration Limit, Publishing API Limit, Video Generation Capability, Processing Limit)
// Supports strictly Instagram, Facebook, and WhatsApp for Monavi Collection.

export type SupportedPlatform = 'instagram' | 'facebook' | 'whatsapp';
export type VideoFormatType = 'reel' | 'story' | 'feed' | 'status';

export interface PlatformVideoSpec {
  platform: SupportedPlatform;
  format: VideoFormatType;
  displayName: string;
  nativeDurationLimitSec: number;
  apiDurationLimitSec: number;
  minDurationSec: number;
  recommendedDurationSec: number;
  aspectRatio: '9:16' | '4:5' | '1:1' | '16:9';
  width: number;
  height: number;
  maxFileSizeMB: number;
  publishingMethod: 'buffer_api' | 'manual_share' | 'direct_download';
  verifiedDocRef: string;
  notes: string;
}

export const PLATFORM_VIDEO_SPECS: Record<string, PlatformVideoSpec> = {
  'instagram:reel': {
    platform: 'instagram',
    format: 'reel',
    displayName: 'Instagram Reel',
    nativeDurationLimitSec: 90,
    apiDurationLimitSec: 90,
    minDurationSec: 3,
    recommendedDurationSec: 15,
    aspectRatio: '9:16',
    width: 1080,
    height: 1920,
    maxFileSizeMB: 100,
    publishingMethod: 'buffer_api',
    verifiedDocRef: 'Instagram Graph API / Reels Publishing Specification 2026',
    notes: 'Max technical limit 90s. Recommended engagement sweet spot 15s–30s.'
  },
  'instagram:story': {
    platform: 'instagram',
    format: 'story',
    displayName: 'Instagram Story',
    nativeDurationLimitSec: 60,
    apiDurationLimitSec: 60,
    minDurationSec: 3,
    recommendedDurationSec: 15,
    aspectRatio: '9:16',
    width: 1080,
    height: 1920,
    maxFileSizeMB: 100,
    publishingMethod: 'buffer_api',
    verifiedDocRef: 'Instagram Stories API 60-Second Video Unsegmented Standard',
    notes: 'Up to 60s single clip without segmentation.'
  },
  'facebook:reel': {
    platform: 'facebook',
    format: 'reel',
    displayName: 'Facebook Reel',
    nativeDurationLimitSec: 90,
    apiDurationLimitSec: 90,
    minDurationSec: 3,
    recommendedDurationSec: 20,
    aspectRatio: '9:16',
    width: 1080,
    height: 1920,
    maxFileSizeMB: 100,
    publishingMethod: 'buffer_api',
    verifiedDocRef: 'Meta Reels API Documentation',
    notes: 'Max technical limit 90s for Facebook Reels via API.'
  },
  'facebook:feed': {
    platform: 'facebook',
    format: 'feed',
    displayName: 'Facebook Feed Video',
    nativeDurationLimitSec: 14400, // 240 mins native
    apiDurationLimitSec: 600, // Buffer API standard video publishing
    minDurationSec: 3,
    recommendedDurationSec: 30,
    aspectRatio: '9:16',
    width: 1080,
    height: 1920,
    maxFileSizeMB: 1000,
    publishingMethod: 'buffer_api',
    verifiedDocRef: 'Meta Graph API Video Publishing Guidelines',
    notes: 'Feed video supports 9:16 or 4:5 vertical presentation.'
  },
  'whatsapp:status': {
    platform: 'whatsapp',
    format: 'status',
    displayName: 'WhatsApp Status',
    nativeDurationLimitSec: 60, // Documented 60s limit for modern WhatsApp Status
    apiDurationLimitSec: 60, // Local prepared file for manual share
    minDurationSec: 3,
    recommendedDurationSec: 15,
    aspectRatio: '9:16',
    width: 1080,
    height: 1920,
    maxFileSizeMB: 16, // Strict 16MB WhatsApp file transfer ceiling
    publishingMethod: 'manual_share',
    verifiedDocRef: 'WhatsApp FAQ Status Video Limits (60s / 16MB payload)',
    notes: 'Prepared in output/whatsapp/<slug>/ for manual sharing. Buffer does not support WhatsApp.'
  }
};

export interface DurationCalculationOptions {
  platform: SupportedPlatform;
  format?: VideoFormatType;
  preference?: 'max' | 'recommended' | number;
  providerMaxDurationSec?: number;
  processingCeilingSec?: number;
}

export interface CalculatedVideoDuration {
  platform: SupportedPlatform;
  format: VideoFormatType;
  targetDurationSec: number;
  isMaxSupported: boolean;
  isEngagementOptimized: boolean;
  platformLimitSec: number;
  apiLimitSec: number;
  providerCapabilitySec: number;
  processingLimitSec: number;
  maxFileSizeMB: number;
  explanation: string;
}

/**
 * Calculates the exact dynamic video duration based on the master formula:
 * Maximum Video Duration = MIN(Platform Duration Limit, Publishing API Limit, Video Generation Capability, Processing Limit)
 */
export function calculatePlatformVideoDuration(options: DurationCalculationOptions): CalculatedVideoDuration {
  const { platform, preference = 'recommended' } = options;
  const format: VideoFormatType = options.format ?? (platform === 'whatsapp' ? 'status' : 'reel');
  const key = `${platform}:${format}`;
  const spec = PLATFORM_VIDEO_SPECS[key] || PLATFORM_VIDEO_SPECS[`${platform}:reel`] || PLATFORM_VIDEO_SPECS['instagram:reel']!;

  // 1. Identify Limits
  const platformLimit = spec.nativeDurationLimitSec;
  const apiLimit = spec.apiDurationLimitSec;
  const providerCapability = options.providerMaxDurationSec ?? 90;
  const processingLimit = options.processingCeilingSec ?? 120;

  // 2. Maximum Technical Duration
  const maxTechnicalDuration = Math.min(platformLimit, apiLimit, providerCapability, processingLimit);

  // 3. User Target Duration Resolution
  let targetDuration: number;
  let isMax = false;
  let isOptimized = false;

  if (preference === 'max') {
    targetDuration = maxTechnicalDuration;
    isMax = true;
  } else if (typeof preference === 'number') {
    targetDuration = Math.max(spec.minDurationSec, Math.min(preference, maxTechnicalDuration));
    if (targetDuration === maxTechnicalDuration) isMax = true;
  } else {
    // 'recommended' engagement duration
    targetDuration = Math.min(spec.recommendedDurationSec, maxTechnicalDuration);
    isOptimized = true;
  }

  // Round to 1 decimal place
  targetDuration = Math.round(targetDuration * 10) / 10;

  const explanation = [
    `Target duration for ${spec.displayName}: ${targetDuration}s.`,
    isMax ? `(Maximum technically publishable ceiling enforced)` : `(Optimized for engagement: recommended ${spec.recommendedDurationSec}s)`,
    `Limits: Native ${platformLimit}s, API ${apiLimit}s, AI Provider ${providerCapability}s, Processing ${processingLimit}s. Max payload: ${spec.maxFileSizeMB}MB.`
  ].join(' ');

  return {
    platform,
    format,
    targetDurationSec: targetDuration,
    isMaxSupported: isMax,
    isEngagementOptimized: isOptimized,
    platformLimitSec: platformLimit,
    apiLimitSec: apiLimit,
    providerCapabilitySec: providerCapability,
    processingLimitSec: processingLimit,
    maxFileSizeMB: spec.maxFileSizeMB,
    explanation
  };
}

/**
 * Calculates separate optimized durations across all requested platforms.
 */
export function calculateMultiPlatformDurations(
  platforms: SupportedPlatform[],
  preference: 'max' | 'recommended' | number = 'recommended'
): Record<SupportedPlatform, CalculatedVideoDuration> {
  const result = {} as Record<SupportedPlatform, CalculatedVideoDuration>;
  for (const p of platforms) {
    result[p] = calculatePlatformVideoDuration({ platform: p, preference });
  }
  return result;
}
