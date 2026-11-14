// CLI: Autonomous AI Film Director & End-to-End Video Production System
// Controls the complete lifecycle: Story, Character/Location Consistency, Multi-Clip Assembly,
// Clip Review & Targeted Regeneration, Timeline Editing, Audio Mixing, Master & Platform Rendering.
//
// Usage:
//   node scripts/film-director.ts --slug <slug> --query "<prompt>" [--input-photo <path>] [--duration <seconds>] [--platforms instagram,facebook,whatsapp]
//
import path from 'node:path';
import { parseArgs, ROOT } from './lib/brand.ts';
import { assertSlug } from './lib/output.ts';
import { directAndProduceFilm } from './lib/film-director/autonomous-film-director.ts';
import type { SupportedPlatform } from './lib/video-specs.ts';

const args = parseArgs(process.argv.slice(2));
const slug = assertSlug(typeof args.slug === 'string' ? args.slug : (args._[0] ?? ''));
const query = typeof args.query === 'string' ? args.query : (args._.slice(1).join(' ') || 'Festive Indian Fashion Campaign');
const inputPhoto = typeof args['input-photo'] === 'string' ? args['input-photo'] : undefined;
const durationArg = Number(args.duration) || 30;
const platformsArg = typeof args.platforms === 'string' ? args.platforms.split(',').map(p => p.trim()) : ['instagram', 'facebook', 'whatsapp'];

if (!slug) {
  console.error('Usage: node scripts/film-director.ts --slug <slug> --query "<prompt>" [--input-photo <path>] [--duration <seconds>] [--platforms instagram,facebook,whatsapp]');
  process.exit(1);
}

const validPlatforms: SupportedPlatform[] = platformsArg.filter(p => ['instagram', 'facebook', 'whatsapp'].includes(p)) as SupportedPlatform[];
if (validPlatforms.length === 0) {
  console.error('Error: Only instagram, facebook, and whatsapp are supported.');
  process.exit(1);
}

try {
  const result = await directAndProduceFilm({
    slug,
    query,
    inputPhotoPath: inputPhoto,
    durationSec: durationArg,
    platforms: validPlatforms
  });

  console.log('Production Summary:');
  console.log(`- Master Film:      ${result.masterVideoPath} (${result.masterDurationSec.toFixed(1)}s)`);
  console.log(`- Clips Generated:  ${result.totalClipsGenerated}`);
  console.log(`- Regenerated:      ${result.clipsRegenerated}`);
  console.log(`- QA Status:        ${result.qaPassed ? 'ALL PASSED' : 'FLAGGED'}`);
  process.exit(0);
} catch (err: any) {
  console.error('\n❌ Film Director Execution Failed:', err.message);
  process.exit(1);
}
