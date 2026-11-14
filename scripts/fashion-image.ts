// CLI tool to generate photorealistic fashion campaign imagery or preserve uploaded product imagery.
//
// Usage:
//   node scripts/fashion-image.ts --slug <slug> --query "<description>" [--input-photo <path>] [--aspect 4:5|9:16|1:1]
//
import { parseArgs } from './lib/brand.ts';
import { assertSlug } from './lib/output.ts';
import { generateFashionCampaignImage } from './lib/fashion-image-engine.ts';

const args = parseArgs(process.argv.slice(2));
const slug = assertSlug(typeof args.slug === 'string' ? args.slug : (args._[0] ?? ''));
const query = typeof args.query === 'string' ? args.query : (args._.slice(1).join(' ') || 'Festive Indian Fashion');
const inputPhoto = typeof args['input-photo'] === 'string' ? args['input-photo'] : undefined;
const aspect = (args.aspect === '9:16' || args.aspect === '1:1' ? args.aspect : '4:5') as '4:5' | '9:16' | '1:1';

if (!slug) {
  console.error('Usage: node scripts/fashion-image.ts --slug <slug> --query "<prompt>" [--input-photo <path>] [--aspect 4:5|9:16|1:1]');
  process.exit(1);
}

console.log(`Generating fashion imagery for "${slug}"...`);
console.log(`Query: ${query}`);
if (inputPhoto) console.log(`Input Photo: ${inputPhoto} (Workflow B: Garment Preservation)`);
else console.log(`Workflow A: Photorealistic Campaign Generation`);

const result = await generateFashionCampaignImage({
  slug,
  query,
  inputPhotoPath: inputPhoto,
  aspectRatio: aspect
});

console.log(`\n✓ Generated: ${result.relativeFilePath} (${result.width}×${result.height})`);
console.log(`\nCamera: ${result.promptBundle.cameraSettings}`);
console.log(`Lighting: ${result.promptBundle.lightingSetup}`);
console.log(`\nMaster AI Prompt:\n${result.promptBundle.positivePrompt}\n`);
