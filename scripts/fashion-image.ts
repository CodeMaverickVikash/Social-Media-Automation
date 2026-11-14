// CLI tool to generate photorealistic fashion campaign imagery or preserve uploaded product imagery.
// 100% Free, Local-First, Zero-API Architecture for Monavi Collection.
//
// Usage:
//   node scripts/fashion-image.ts --slug <slug> --query "<description>" [--input-photo <path>] [--aspect 4:5|9:16|1:1] [--model <type>] [--pose <type>]
//   node scripts/fashion-image.ts --list-models
//
import { parseArgs } from './lib/brand.ts';
import { assertSlug } from './lib/output.ts';
import { generateFashionCampaignImage } from './lib/fashion-image-engine.ts';

const args = parseArgs(process.argv.slice(2));

if (args['list-models']) {
  console.log(`================================================================`);
  console.log(`MONAVI COLLECTION — AUTONOMOUS MODEL & POSE SELECTION CATALOGUE`);
  console.log(`================================================================`);
  console.log(`\n[MODEL PRESENTATIONS (--model)]`);
  console.log(`  • single_male        : 28yo athletic Indian male with well-groomed stubble`);
  console.log(`  • single_female      : 26yo regal Indian female with natural dewy elegance`);
  console.log(`  • single_bride       : 25yo royal Indian bride with delicate kohl & maang tikka`);
  console.log(`  • single_groom       : 29yo regal Indian groom with groomed beard in sherwani`);
  console.log(`  • single_child_girl  : 6yo joyful Indian girl in festive lehenga/dress`);
  console.log(`  • single_child_boy   : 7yo cheerful Indian boy in festive kurta`);
  console.log(`  • duo_couple         : Royal Bride & Groom Duo standing poised together`);
  console.log(`  • family             : Father, Mother, and Child in coordinated festive ensembles`);
  console.log(`  • mannequin_showroom : Tailored headless mannequin on brass pedestal in boutique`);
  console.log(`  • ghost_mannequin    : Invisible 3D ghost mannequin with natural drapery & interior collar`);
  console.log(`\n[FASHION POSES & MOVEMENTS (--pose)]`);
  console.log(`  • standing_poised        : Regal grounded stance with full-length footwear visibility`);
  console.log(`  • walking_towards_camera : Confident dynamic runway stride with natural fabric motion`);
  console.log(`  • runway_walk_turn       : Deliberate 3/4 turn showcasing front and back drape`);
  console.log(`  • seated_royal_armchair  : Poised on antique carved velvet armchair in palace haveli`);
  console.log(`  • back_view_embroidery   : Graceful 3/4 back view showcasing neckline, latkans & embroidery`);
  console.log(`  • twirling_flare         : Circular rotational movement showcasing ghera flare`);
  console.log(`  • macro_fabric_closeup   : Macro 1:1 framing on hand-woven zari & fabric slub`);
  console.log(`================================================================`);
  process.exit(0);
}

const slug = assertSlug(typeof args.slug === 'string' ? args.slug : (args._[0] ?? ''));
const query = typeof args.query === 'string' ? args.query : (args._.slice(1).join(' ') || 'Festive Indian Fashion');
const inputPhoto = typeof args['input-photo'] === 'string' ? args['input-photo'] : undefined;
const aspect = (args.aspect === '9:16' || args.aspect === '1:1' ? args.aspect : '4:5') as '4:5' | '9:16' | '1:1';
const modelPresentation = typeof args.model === 'string' ? args.model as any : undefined;
const poseMovement = typeof args.pose === 'string' ? args.pose as any : undefined;

if (!slug) {
  console.error('Usage: node scripts/fashion-image.ts --slug <slug> --query "<prompt>" [--input-photo <path>] [--aspect 4:5|9:16|1:1] [--model <type>] [--pose <type>]');
  console.error('Run "node scripts/fashion-image.ts --list-models" to see all model and pose options.');
  process.exit(1);
}

console.log(`Generating fashion imagery for "${slug}"...`);
console.log(`Engine: Local Monavi Editorial Compositor (100% Free, Zero-API, Local CPU)`);
console.log(`Query: ${query}`);
if (modelPresentation) console.log(`Model Presentation: ${modelPresentation}`);
if (poseMovement) console.log(`Pose / Movement: ${poseMovement}`);
if (inputPhoto) console.log(`Input Photo: ${inputPhoto} (Workflow B: Garment Preservation)`);
else console.log(`Workflow A: Photorealistic Campaign Generation`);

const result = await generateFashionCampaignImage({
  slug,
  query,
  inputPhotoPath: inputPhoto,
  aspectRatio: aspect,
  modelPresentation,
  poseMovement
});

console.log(`\n✓ Generated: ${result.relativeFilePath} (${result.width}×${result.height})`);
console.log(`\nCamera: ${result.promptBundle.cameraSettings}`);
console.log(`Lighting: ${result.promptBundle.lightingSetup}`);
console.log(`\nMaster AI Prompt:\n${result.promptBundle.positivePrompt}\n`);
