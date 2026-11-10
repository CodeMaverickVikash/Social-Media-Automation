// Tidies content/ without ever touching what is committed or what CI depends on.
//
//   node scripts/clean-content.ts                   delete finished monthly plans, report the rest
//   node scripts/clean-content.ts --drafts          also delete abandoned draft briefs (ask the user first)
//   node scripts/clean-content.ts --slug <slug>     only look at that slug's briefs
//   node scripts/clean-content.ts --dry-run         list what would happen, change nothing
//
// DELETED automatically:
//   content/plans/<yyyy-mm>.md   not committed, the month is over, and every slug row is marked "made"
// DELETED only with --drafts:
//   content/posts|reels/<slug>.json   not committed, no output anywhere, untouched for 7+ days
// NEVER touched:
//   anything committed to git, content/schedule/** (merged plans are immutable records, and CI checks them),
//   and example-* briefs (reference examples for the skills)
// REPORTED only:
//   briefs whose photo file is missing or whose JSON is invalid, schedule plans with no brief,
//   old plans that still have pieces not made
import { existsSync, readdirSync, readFileSync, rmSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { ROOT } from './lib/brand.ts';
import { OUTPUT, PLATFORMS, assertSlug } from './lib/output.ts';
import { imageRefs } from './lib/briefs.ts';

const USAGE = `Usage: npm run clean:content -- [--drafts] [--slug <slug>] [--dry-run]

  (no flags)       delete finished monthly plans, report everything else
  --drafts         also delete abandoned draft briefs (untracked, no output, 7+ days old)
  --slug <slug>    only look at that slug's briefs
  --dry-run        list what would happen, change nothing
  --help           show this help

Never touched: committed files, content/schedule/**, example-* briefs.`;

const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) { console.log(USAGE); process.exit(0); }
const slugIdx = args.indexOf('--slug');
const slugArg = slugIdx >= 0 ? args[slugIdx + 1] : undefined;
const unknown = args.filter((a, i) => !['--drafts', '--slug', '--dry-run'].includes(a) && !(slugIdx >= 0 && i === slugIdx + 1));
if (unknown.length || (slugIdx >= 0 && (!slugArg || slugArg.startsWith('--')))) {
  console.error(`Unknown or incomplete arguments: ${unknown.join(' ') || '--slug needs a value'}\n${USAGE}`);
  process.exit(1);
}
const dryRun = args.includes('--dry-run');
const drafts = args.includes('--drafts');
const onlySlug = slugArg === undefined ? undefined : assertSlug(slugArg);

const CONTENT = path.join(ROOT, 'content');
if (!existsSync(CONTENT)) { console.log('content/ does not exist. Nothing to clean.'); process.exit(0); }
const rel = (p: string) => path.relative(ROOT, p).split(path.sep).join('/');
const list = (dir: string, ext: string): string[] =>
  existsSync(dir) ? readdirSync(dir).filter(f => f.endsWith(ext)).map(f => path.join(dir, f)) : [];

// Files git tracks under content/. If git can't answer, stop: guessing could delete committed work.
let tracked: Set<string>;
try {
  tracked = new Set(execFileSync('git', ['ls-files', '-z', '--', 'content'], { cwd: ROOT, encoding: 'utf8' }).split('\0').filter(Boolean));
} catch {
  console.error('Could not read the list of committed files from git. Nothing was deleted.');
  process.exit(1);
}

const DAY = 86_400_000;
const hasOutput = (slug: string): boolean =>
  existsSync(path.join(OUTPUT, '_masters', slug)) ||
  PLATFORMS.some(p => { const d = path.join(OUTPUT, p, slug); return existsSync(d) && readdirSync(d).length > 0; });

let deleted = 0;
const remove = (file: string, why: string) => {
  console.log(`${dryRun ? 'would delete' : 'deleted'}  ${rel(file)}  (${why})`);
  if (!dryRun) rmSync(file, { force: true });
  deleted++;
};

// 1. Monthly plans (content/plans/<yyyy-mm>.md) that are finished.
const thisMonth = new Date().toISOString().slice(0, 7);
if (!onlySlug) {
  for (const f of list(path.join(CONTENT, 'plans'), '.md')) {
    const month = path.basename(f, '.md');
    if (tracked.has(rel(f)) || !/^\d{4}-\d{2}$/.test(month) || month >= thisMonth) continue;
    // Rows keyed by a slug (first cell like kurta-pajama-festive-2026-11). The shoot list has no slug cells.
    const rows = readFileSync(f, 'utf8').split('\n')
      .filter(l => l.trim().startsWith('|'))
      .filter(l => /^[a-z0-9][a-z0-9-]*-\d{4}-\d{2}$/.test((l.split('|')[1] ?? '').replace(/[`*\s]/g, '')));
    const open = rows.filter(r => !/made/i.test(r));
    if (rows.length && !open.length) remove(f, `plan for ${month}: all ${rows.length} piece(s) made`);
    else console.log(`kept         ${rel(f)}  (${rows.length ? `${open.length} of ${rows.length} piece(s) not made yet` : 'no slug rows to check'})`);
  }
}

// 2. Briefs.
const briefs = [...list(path.join(CONTENT, 'posts'), '.json'), ...list(path.join(CONTENT, 'reels'), '.json')]
  .filter(f => !path.basename(f).startsWith('example-'))
  .filter(f => !onlySlug || path.basename(f, '.json') === onlySlug);

const stale: string[] = [];
for (const f of briefs) {
  const slug = path.basename(f, '.json');
  let json: unknown;
  try { json = JSON.parse(readFileSync(f, 'utf8')); }
  catch { console.log(`problem      ${rel(f)}  (not valid JSON)`); continue; }
  const missing = imageRefs(json).filter(p => !existsSync(path.isAbsolute(p) ? p : path.join(ROOT, p)));
  if (missing.length) console.log(`problem      ${rel(f)}  (photo not found: ${missing.join(', ')}). A render would fail.`);
  const isTracked = tracked.has(rel(f));
  const idle = (Date.now() - statSync(f).mtimeMs) / DAY;
  if (!isTracked && !hasOutput(slug) && idle >= 7) stale.push(f);
}

for (const f of stale) {
  if (drafts) remove(f, 'abandoned draft: not committed, no output, untouched for 7+ days');
  else console.log(`draft        ${rel(f)}  (abandoned: not committed, no output, untouched for 7+ days). Run with --drafts to delete.`);
}

// 3. Schedule plans whose brief is gone (report only).
if (!onlySlug) {
  for (const f of list(path.join(CONTENT, 'schedule'), '.json')) {
    const slug = path.basename(f, '.json');
    if (!existsSync(path.join(CONTENT, 'posts', `${slug}.json`)) && !existsSync(path.join(CONTENT, 'reels', `${slug}.json`))) {
      console.log(`note         ${rel(f)}  (no brief for this slug). Left alone: merged plans are records.`);
    }
  }
}

console.log(`\n${dryRun ? 'Would delete' : 'Deleted'} ${deleted} file(s). Committed files, content/schedule/ and example-* briefs are never touched.`);
