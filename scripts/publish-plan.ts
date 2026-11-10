// Schedule plans: content/schedule/<slug>.json → Buffer, driven by PRs.
//
//   PR check:  node scripts/publish-plan.ts validate --base origin/main      (validates plans added in the PR)
//              node scripts/publish-plan.ts validate content/schedule/<slug>.json
//   On merge:  node scripts/publish-plan.ts run --since <before-sha>          (schedules plans ADDED since that commit)
//              node scripts/publish-plan.ts run --files content/schedule/<slug>.json [--skip post:instagram] [--dry-run]
//
// Plans are immutable once merged: only newly added plan files are scheduled, so re-runs and later
// edits never create duplicate Buffer posts. To change a scheduled post, edit it in Buffer.
import { readFileSync, existsSync, readdirSync, appendFileSync } from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
import path from 'node:path';
import { ROOT, parseArgs } from './lib/brand.ts';
import { OUTPUT, PLATFORMS, assertSlug } from './lib/output.ts';
import { KINDS, assertPublishable, buildPostInput, checkMediaUrl, createPost, isBufferPlatform, loadChannelMap, logPublish, readCaption } from './lib/buffer-api.ts';
import type { Kind } from './lib/buffer-api.ts';
import { hostMedia } from './lib/media-host.ts';

interface PlanItem {
  kind: Kind;
  /** File name inside output/<platform>/<slug>/ (default: ig-feed.jpg | story.jpg | reel.mp4) */
  file?: string;
  platforms: string[];
  /** ISO 8601 with offset, e.g. 2026-11-20T19:00:00+05:30. Omit to add to the Buffer queue. */
  at?: string;
  draft?: boolean;
  firstComment?: string;
}
interface Plan { slug: string; items: PlanItem[] }

const DEFAULT_FILE: Record<Kind, string> = { post: 'ig-feed.jpg', story: 'story.jpg', reel: 'reel.mp4' };
const SCHEDULE_DIR = path.join(ROOT, 'content', 'schedule');
const args = parseArgs(process.argv.slice(2));
const cmd = args._[0];

const git = (...a: string[]) => execFileSync('git', a, { cwd: ROOT, encoding: 'utf8' }).trim();
const relPath = (p: string) => path.relative(ROOT, path.resolve(ROOT, p)).split(path.sep).join('/');

function loadPlan(file: string): Plan {
  const plan = JSON.parse(readFileSync(path.resolve(ROOT, file), 'utf8')) as Plan;
  assertSlug(plan.slug);
  if (path.basename(file, '.json') !== plan.slug) throw new Error(`${relPath(file)}: file name must be <slug>.json (slug is "${plan.slug}")`);
  if (!Array.isArray(plan.items) || !plan.items.length) throw new Error(`${relPath(file)}: "items" must be a non-empty array`);
  return plan;
}

/** Returns a list of problems (empty = valid). Never calls external services. */
function validatePlan(file: string): string[] {
  const errors: string[] = [];
  let plan: Plan;
  try { plan = loadPlan(file); } catch (e) { return [(e as Error).message]; }
  const { slug } = plan;
  const mediaFiles = new Set<string>();
  const channelMap = loadChannelMap();

  plan.items.forEach((it, i) => {
    const where = `${slug} item ${i + 1} (${it.kind})`;
    if (!KINDS.includes(it.kind)) { errors.push(`${where}: kind must be post, reel or story`); return; }
    if (!it.platforms?.length) errors.push(`${where}: platforms is empty`);
    for (const p of it.platforms ?? []) {
      if (!(PLATFORMS as readonly string[]).includes(p)) { errors.push(`${where}: unknown platform "${p}"`); continue; }
      const media = path.join(OUTPUT, p, slug, it.file ?? DEFAULT_FILE[it.kind]);
      if (!existsSync(media)) errors.push(`${where}: missing ${relPath(media)}`);
      else mediaFiles.add(media);
      try { readCaption(p, slug); } catch (e) { errors.push(`${where}: ${(e as Error).message}`); }
      if (isBufferPlatform(p) && !channelMap[p]?.id) errors.push(`${where}: no Buffer channel for ${p} in config/buffer-channels.json (run: npm run buffer -- channels --save, then commit)`);
    }
    if (it.at !== undefined) {
      if (!/([+-]\d{2}:\d{2}|Z)$/.test(it.at)) errors.push(`${where}: "at" must include a timezone offset, e.g. 2026-11-20T19:00:00+05:30`);
      else if (Number.isNaN(new Date(it.at).getTime())) errors.push(`${where}: "at" is not a valid date`);
      else if (new Date(it.at).getTime() < Date.now() + 10 * 60_000) errors.push(`${where}: "at" (${it.at}) must be at least 10 minutes in the future`);
    }
    if (it.platforms?.some(isBufferPlatform)) {
      try { assertPublishable(slug, it.kind); } catch (e) { errors.push(`${where}: ${(e as Error).message}`); }
    }
  });

  if (mediaFiles.size) {
    const qa = spawnSync(process.execPath, [path.join(ROOT, 'scripts', 'check-media.ts'), ...mediaFiles], { encoding: 'utf8' });
    if (qa.status !== 0) errors.push(`${slug}: media QA failed:\n${(qa.stdout + qa.stderr).split('\n').filter(l => l.startsWith('✗')).join('\n')}`);
  }
  return errors;
}

function summary(md: string): void {
  console.log(md);
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, md + '\n');
}

// ------------------------------------------------------------------ validate
async function validate(): Promise<void> {
  let files = args._.slice(1);
  if (typeof args.base === 'string') {
    const changes = git('diff', '--name-status', `${args.base}...HEAD`, '--', 'content/schedule/').split('\n').filter(Boolean);
    const immutable = changes.filter(l => /^[MR]/.test(l));
    if (immutable.length) {
      console.error(`✗ Merged schedule plans are immutable (they were already sent to Buffer):\n  ${immutable.join('\n  ')}\n  Add a NEW plan file instead, or change the post in Buffer.`);
      process.exit(1);
    }
    files = changes.filter(l => l.startsWith('A')).map(l => l.split('\t')[1]!);
  } else if (!files.length && existsSync(SCHEDULE_DIR)) {
    files = readdirSync(SCHEDULE_DIR).filter(f => f.endsWith('.json')).map(f => path.join('content', 'schedule', f));
  }
  if (!files.length) { console.log('No schedule plans to validate.'); return; }

  let failed = 0;
  for (const f of files) {
    const errs = validatePlan(f);
    if (errs.length) { failed++; console.error(`✗ ${relPath(f)}\n  - ${errs.join('\n  - ')}`); }
    else {
      const plan = loadPlan(f);
      console.log(`✓ ${relPath(f)}`);
      for (const it of plan.items) console.log(`    ${it.kind.padEnd(5)} ${it.platforms.join(',').padEnd(28)} ${it.at ?? 'next free queue slot'}${it.draft ? ' (draft)' : ''}`);
    }
  }
  if (failed) process.exit(1);
}

// ------------------------------------------------------------------ run
async function run(): Promise<void> {
  const dryRun = Boolean(args['dry-run']);
  let files: string[] = [];
  if (typeof args.files === 'string') files = args.files.split(',');
  else if (typeof args.since === 'string') {
    const since = /^0+$/.test(args.since) ? `${git('rev-parse', 'HEAD')}~1` : args.since;
    files = git('diff', '--diff-filter=A', '--name-only', since, 'HEAD', '--', 'content/schedule/').split('\n').filter(Boolean);
  } else throw new Error('run needs --since <sha> or --files <plan.json,...>');
  const skip = new Set(typeof args.skip === 'string' ? args.skip.split(',') : []);

  if (!files.length) { summary('No new schedule plans in this push — nothing to schedule.'); return; }

  // Validate everything first so a bad plan never half-publishes.
  const problems = files.flatMap(f => validatePlan(f).map(e => `${relPath(f)}: ${e}`));
  if (problems.length) throw new Error(`Refusing to schedule — validation failed:\n- ${problems.join('\n- ')}`);

  const channelMap = loadChannelMap();
  const rows: string[] = [];
  const manual: string[] = [];
  let failures = 0;

  for (const f of files) {
    const plan = loadPlan(f);
    for (const it of plan.items) {
      for (const platform of it.platforms) {
        const key = `${it.kind}:${platform}`;
        const media = path.join(OUTPUT, platform, plan.slug, it.file ?? DEFAULT_FILE[it.kind]);
        if (!isBufferPlatform(platform)) { manual.push(`\`${relPath(media)}\` + caption.txt (${it.kind}${it.at ? ` · ${it.at}` : ''})`); continue; }
        if (skip.has(key)) { rows.push(`| ${plan.slug} | ${platform} | ${it.kind} | ${it.at ?? 'queue'} | ⏭ skipped |`); continue; }
        try {
          const url = dryRun ? `https://<media-host>/${plan.slug}/${path.basename(media)}` : await hostMedia(media, plan.slug);
          if (!dryRun) await checkMediaUrl(url, it.kind);
          const input = buildPostInput({ platform, slug: plan.slug, kind: it.kind, mediaUrls: [url], at: it.at, draft: it.draft, firstComment: it.firstComment },
            channelMap[platform]?.id ?? `<${platform}-channel-id>`);
          if (dryRun) { rows.push(`| ${plan.slug} | ${platform} | ${it.kind} | ${it.at ?? 'queue'} | dry run |`); continue; }
          const res = await createPost(input);
          logPublish(plan.slug, { platform, kind: it.kind, source: 'github-action', bufferPostId: res.id, dueAt: res.dueAt, url });
          rows.push(`| ${plan.slug} | ${platform} | ${it.kind} | ${res.dueAt ?? 'queue'} | ✅ ${res.id}${it.draft ? ' (draft)' : ''} |`);
        } catch (e) {
          failures++;
          rows.push(`| ${plan.slug} | ${platform} | ${it.kind} | ${it.at ?? 'queue'} | ❌ ${(e as Error).message.replace(/\|/g, '/')} |`);
        }
      }
    }
  }

  summary(`## Buffer scheduling${dryRun ? ' (dry run)' : ''}\n\n| Slug | Platform | Kind | When | Result |\n|---|---|---|---|---|\n${rows.join('\n')}\n`);
  if (manual.length) summary(`### WhatsApp — share manually (not supported by Buffer)\n\n${manual.map(m => `- ${m}`).join('\n')}\n`);
  if (failures) {
    summary(`\n**${failures} item(s) failed.** Fix the cause, then re-run only the failed items via *Actions → Schedule content in Buffer → Run workflow* with \`--skip\` for the ones that succeeded.`);
    process.exit(1);
  }
}

if (cmd === 'validate') await validate();
else if (cmd === 'run') await run();
else {
  console.error('Commands: validate [--base <ref>] [plan.json ...] | run (--since <sha> | --files a.json,b.json) [--skip kind:platform,...] [--dry-run]');
  process.exit(1);
}
