// CLI: Generate realistic AI-powered fashion promotional videos for Monavi Collection
// Supports Workflow A (Text-to-Video) and Workflow B (Image-to-Video)
// Supported platforms: Instagram (Reels & Stories), Facebook (Reels & Feed), WhatsApp (Status).
//
// Usage:
//   node scripts/fashion-video.ts --slug <slug> --query "<description>" [--input-photo <path>] [--platforms instagram,facebook,whatsapp] [--duration max|recommended|<seconds>]
//
import path from 'node:path';
import { parseArgs, ROOT } from './lib/brand.ts';
import { assertSlug } from './lib/output.ts';
import { directFashionVideo } from './lib/video-director.ts';
import { generateFashionVideo, type VideoGenerationOutput } from './lib/video-generation-engine.ts';
import { calculateMultiPlatformDurations, type SupportedPlatform } from './lib/video-specs.ts';
import { analyzeFashionRequest } from './lib/fashion-intelligence.ts';
import { writeAllPlatformCaptions } from './lib/social-content.ts';

const args = parseArgs(process.argv.slice(2));
const slug = assertSlug(typeof args.slug === 'string' ? args.slug : (args._[0] ?? ''));
const query = typeof args.query === 'string' ? args.query : (args._.slice(1).join(' ') || 'Festive Indian Fashion');
const inputPhoto = typeof args['input-photo'] === 'string' ? args['input-photo'] : undefined;
const platformsArg = typeof args.platforms === 'string' ? args.platforms.split(',').map(p => p.trim()) : ['instagram', 'facebook', 'whatsapp'];
const durationPref = (args.duration === 'max' || args.duration === 'recommended' ? args.duration : (Number(args.duration) || 'recommended')) as 'max' | 'recommended' | number;

if (!slug) {
  console.error('Usage: node scripts/fashion-video.ts --slug <slug> --query "<prompt>" [--input-photo <path>] [--platforms instagram,facebook,whatsapp] [--duration max|recommended|<seconds>]');
  process.exit(1);
}

// Validate supported platforms strictly
const validPlatforms: SupportedPlatform[] = platformsArg.filter(p => ['instagram', 'facebook', 'whatsapp'].includes(p)) as SupportedPlatform[];
if (validPlatforms.length === 0) {
  console.error('Error: Only instagram, facebook, and whatsapp are supported.');
  process.exit(1);
}

console.log('================================================================');
console.log('🎬 MONAVI COLLECTION — AI FASHION VIDEO GENERATION SYSTEM');
console.log('   "WEAR YOUR STORY"');
console.log('================================================================\n');

console.log(`Campaign Slug:     ${slug}`);
console.log(`Request Query:     "${query}"`);
console.log(`Workflow Mode:     ${inputPhoto ? 'Workflow B (Image-to-Video: Product Preserved)' : 'Workflow A (Text-to-Video: Model Synthesized)'}`);
if (inputPhoto) console.log(`Uploaded Image:    ${inputPhoto}`);
console.log(`Target Platforms:  ${validPlatforms.join(', ')}`);
console.log(`Duration Strategy: ${durationPref === 'max' ? 'Maximum Platform-Supported Limit' : durationPref === 'recommended' ? 'Recommended Engagement Sweetspot' : `${durationPref}s Fixed`}\n`);

// 1. Dynamic Platform Duration Service
console.log('--- 1. Dynamic Duration Calculation ---');
const durations = calculateMultiPlatformDurations(validPlatforms, durationPref);
for (const p of validPlatforms) {
  const d = durations[p]!;
  console.log(`• ${p.toUpperCase().padEnd(10)}: ${d.targetDurationSec}s target (Platform Limit: ${d.platformLimitSec}s, API Limit: ${d.apiLimitSec}s, Max Payload: ${d.maxFileSizeMB}MB)`);
}
console.log();

// 2. Creative Direction & Storyboard
console.log('--- 2. Fashion Video Director Creative Blueprint ---');
const analysis = analyzeFashionRequest(query, { hasProductImage: Boolean(inputPhoto) });
const direction = directFashionVideo({
  slug,
  query,
  platform: validPlatforms[0]!,
  inputPhotoPath: inputPhoto,
  durationPreference: durationPref
});

console.log(`Concept:           ${direction.concept}`);
console.log(`Model Casting:     ${direction.modelCasting.gender}, ${direction.modelCasting.age} (${direction.modelCasting.look})`);
console.log(`Setting:           ${direction.environmentAndLighting.setting}`);
console.log(`Audio Direction:   ${direction.audioDirection.mood}`);
console.log(`Closing CTA:       "${direction.closingCTA}"`);
console.log(`Storyboard Plan:   ${direction.storyboard.length} dynamic scene(s):\n`);

for (const s of direction.storyboard) {
  console.log(`  [Scene ${s.sceneIndex}] ${s.name.padEnd(30)} | ${s.durationSec}s | Trajectory: ${s.trajectory}`);
}
console.log();

// 3. Render Platform-Specific Optimized Videos
console.log('--- 3. Video Generation & Platform Rendering ---');
const outputs: VideoGenerationOutput[] = [];

for (const p of validPlatforms) {
  console.log(`Generating video for ${p}...`);
  const out = await generateFashionVideo({
    slug,
    query,
    platform: p,
    inputPhotoPath: inputPhoto,
    durationPreference: durationPref,
    scenes: direction.storyboard
  });
  outputs.push(out);
  console.log(`✓ ${p}: ${out.width}×${out.height} @ ${out.fps}fps | ${out.durationSec}s → ${out.videoFilePath}`);
}
console.log();

// 4. Generate Platform Captions
console.log('--- 4. Multi-Platform Captions ---');
const outputBase = path.join(ROOT, 'output');
writeAllPlatformCaptions(outputBase, slug, analysis);
console.log(`✓ Captions and hashtags written for: ${validPlatforms.join(', ')}\n`);

console.log('================================================================');
console.log('✨ Video Generation Complete for Monavi Collection!');
console.log('================================================================');
