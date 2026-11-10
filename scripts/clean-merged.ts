// Removes content that is finished: merged to main, and every post already went out.
// It stages the deletions with `git rm` and nothing else. The skill commits them and opens a cleanup PR.
//
//   node scripts/clean-merged.ts                     list what is finished, change nothing
//   node scripts/clean-merged.ts --apply             stage the deletions (only on a cleanup/* branch)
//   node scripts/clean-merged.ts --grace <days>      wait this long after the last post (default 7)
//   node scripts/clean-merged.ts --slug <slug>       only that slug
//   node scripts/clean-merged.ts --prs-file <json>   read PRs from a file instead of GitHub (for tests)
//
// A slug is finished when ALL of these hold:
//   - a content/<slug> pull request is merged, and none is open for the same slug
//   - its schedule plan exists and EVERY item has a fixed time that is more than <grace> days ago, and none is a
//     Buffer draft. (Queue-slot items and drafts have no known send time, so they are kept.)
//     With no schedule plan at all (a Facebook cover), the PR must have been merged 30+ days ago.
//   - no other brief still uses its photos
// What goes (tracked files only): the briefs, assets/photos/<slug>/, output/<platform>/<slug>/, output/_masters/<slug>/
// What stays: content/schedule/<slug>.json (merged plans are immutable records that CI checks), and git history,
// so anything can be brought back with `git revert` or by checking out the old commit.
import { existsSync, readFileSync, statSync } from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
import path from 'node:path';
import { ROOT } from './lib/brand.ts';
import { PLATFORMS, assertSlug } from './lib/output.ts';
import { imageRefs } from './lib/briefs.ts';

const USAGE = `Usage: npm run clean:merged -- [--apply] [--grace <days>] [--slug <slug>]

  (no flags)       list finished content, change nothing
  --apply          stage the deletions with git rm (needs a cleanup/* branch)
  --grace <days>   wait this long after the last post goes out (default 7)
  --slug <slug>    only that slug
  --help           show this help

Kept always: content/schedule/** (records), anything not merged, queue or draft items, git history.`;

const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) { console.log(USAGE); process.exit(0); }
const takes = new Set(['--grace', '--slug', '--prs-file']);
const valueIdx = new Set<number>();
args.forEach((a, i) => { if (takes.has(a)) valueIdx.add(i + 1); });
const unknown = args.filter((a, i) => !valueIdx.has(i) && !['--apply', ...takes].includes(a));
const val = (flag: string): string | undefined => { const i = args.indexOf(flag); return i >= 0 ? args[i + 1] : undefined; };
const missingValue = [...takes].some(f => args.includes(f) && (!val(f) || val(f)!.startsWith('--')));
if (unknown.length || missingValue) {
  console.error(`Unknown or incomplete arguments: ${unknown.join(' ') || 'a flag is missing its value'}\n${USAGE}`);
  process.exit(1);
}
const apply = args.includes('--apply');
const grace = Number(val('--grace') ?? 7);
if (!Number.isFinite(grace) || grace < 0) { console.error('--grace must be a number of days (0 or more).'); process.exit(1); }
const onlySlug = val('--slug') === undefined ? undefined : assertSlug(val('--slug'));
const NO_PLAN_DAYS = 30;
const DAY = 86_400_000;

const git = (...a: string[]): string => execFileSync('git', a, { cwd: ROOT, encoding: 'utf8' }).trim();
const rel = (p: string) => path.relative(ROOT, p).split(path.sep).join('/');

if (apply) {
  const branch = git('branch', '--show-current');
  if (!branch.startsWith('cleanup/')) {
    console.error(`--apply only runs on a cleanup/* branch (you are on "${branch}"). The skill creates one from main first.`);
    process.exit(1);
  }
  if (git('status', '--porcelain')) { console.error('The working tree has uncommitted changes. Stop here so nothing unrelated is mixed in.'); process.exit(1); }
}

// Pull requests: merged and open, from GitHub (or a fixture file for tests).
type Pr = { headRefName: string; mergedAt?: string | null };
let merged: Pr[]; let open: Pr[];
const fixture = val('--prs-file');
if (fixture) {
  const j = JSON.parse(readFileSync(fixture, 'utf8')) as { merged: Pr[]; open: Pr[] };
  merged = j.merged; open = j.open;
} else {
  const run = (state: string) => spawnSync('gh', ['pr', 'list', '--state', state, '--limit', '300', '--json', 'headRefName,mergedAt'], { cwd: ROOT, encoding: 'utf8' });
  const m = run('merged'); const o = run('open');
  if (m.status !== 0 || o.status !== 0) {
    console.error('Could not read pull requests from GitHub (gh). Without them nothing can be proven finished, so nothing was changed.');
    process.exit(1);
  }
  merged = JSON.parse(m.stdout) as Pr[]; open = JSON.parse(o.stdout) as Pr[];
}
const openSlugs = new Set(open.filter(p => p.headRefName.startsWith('content/')).map(p => p.headRefName.slice(8)));
const mergedAt = new Map<string, number>();
for (const p of merged) {
  if (!p.headRefName.startsWith('content/') || !p.mergedAt) continue;
  const s = p.headRefName.slice(8);
  mergedAt.set(s, Math.max(mergedAt.get(s) ?? 0, new Date(p.mergedAt).getTime()));
}

// Tracked files per slug.
const tracked = git('ls-files', '-z', '--', 'content', 'assets', 'output').split('\0').filter(Boolean);
const filesFor = (slug: string): string[] => tracked.filter(f =>
  f === `content/posts/${slug}.json` || f === `content/reels/${slug}.json` ||
  f.startsWith(`assets/photos/${slug}/`) ||
  f.startsWith(`output/_masters/${slug}/`) ||
  PLATFORMS.some(p => f.startsWith(`output/${p}/${slug}/`)));

// Photos still used by briefs that are not being deleted.
function photoUsedElsewhere(slug: string, finished: Set<string>): boolean {
  const prefix = `assets/photos/${slug}/`;
  for (const f of tracked.filter(t => /^content\/(posts|reels)\/.+\.json$/.test(t))) {
    const other = path.basename(f, '.json');
    if (other === slug || finished.has(other)) continue;
    try {
      const refs = imageRefs(JSON.parse(readFileSync(path.join(ROOT, f), 'utf8'))).map(r => r.replace(/\\/g, '/'));
      if (refs.some(r => r.startsWith(prefix))) return true;
    } catch { /* an unreadable brief is reported by clean:content */ }
  }
  return false;
}

const kept: string[] = [];
const done: { slug: string; last: number | undefined; files: string[]; bytes: number; mergedOn: number }[] = [];
const candidates = [...mergedAt.keys()].filter(s => !onlySlug || s === onlySlug).sort();

for (const slug of candidates) {
  const files = filesFor(slug);
  if (!files.length) continue;                          // already removed, or nothing tracked
  if (openSlugs.has(slug)) { kept.push(`${slug}  (a pull request for it is still open)`); continue; }

  const planFile = path.join(ROOT, 'content', 'schedule', `${slug}.json`);
  let last: number | undefined;
  if (existsSync(planFile)) {
    let items: { at?: string; draft?: boolean }[];
    try { items = (JSON.parse(readFileSync(planFile, 'utf8')) as { items?: { at?: string; draft?: boolean }[] }).items ?? []; }
    catch { kept.push(`${slug}  (its schedule plan can't be read)`); continue; }
    if (!items.length) { kept.push(`${slug}  (its schedule plan has no items)`); continue; }
    if (items.some(i => i.draft)) { kept.push(`${slug}  (has a Buffer draft that is still waiting for you)`); continue; }
    if (items.some(i => !i.at || Number.isNaN(new Date(i.at).getTime()))) { kept.push(`${slug}  (has a queue-slot item with no fixed send time)`); continue; }
    last = Math.max(...items.map(i => new Date(i.at!).getTime()));
    if (Date.now() < last + grace * DAY) {
      kept.push(`${slug}  (last post ${new Date(last).toISOString().slice(0, 10)} + ${grace} days is not over yet)`); continue;
    }
  } else if (Date.now() < mergedAt.get(slug)! + NO_PLAN_DAYS * DAY) {
    kept.push(`${slug}  (nothing was scheduled; kept until ${NO_PLAN_DAYS} days after the merge so a cover can be uploaded)`); continue;
  }
  const bytes = files.reduce((n, f) => n + (existsSync(path.join(ROOT, f)) ? statSync(path.join(ROOT, f)).size : 0), 0);
  done.push({ slug, last, files, bytes, mergedOn: mergedAt.get(slug)! });
}

// Keep photos that another live brief still uses.
const finished = new Set(done.map(d => d.slug));
for (const d of done) {
  if (photoUsedElsewhere(d.slug, finished)) {
    const prefix = `assets/photos/${d.slug}/`;
    const photos = d.files.filter(f => f.startsWith(prefix));
    d.files = d.files.filter(f => !f.startsWith(prefix));
    d.bytes -= photos.reduce((n, f) => n + (existsSync(path.join(ROOT, f)) ? statSync(path.join(ROOT, f)).size : 0), 0);
    if (d.files.length) kept.push(`${d.slug}/photos  (another brief still uses these photos, so only the rest of ${d.slug} goes)`);
  }
}
for (let i = done.length - 1; i >= 0; i--) if (!done[i]!.files.length) done.splice(i, 1);   // nothing left to remove

const mb = (n: number) => (n / 1024 / 1024).toFixed(1);
for (const d of done) {
  console.log(`${apply ? 'removing' : 'would remove'}  ${d.slug}  ${d.files.length} file(s), ${mb(d.bytes)} MB  (merged ${new Date(d.mergedOn).toISOString().slice(0, 10)}${d.last ? `, last post ${new Date(d.last).toISOString().slice(0, 10)}` : ', nothing scheduled'})`);
}
for (const k of kept) console.log(`kept         ${k}`);

const total = done.reduce((n, d) => n + d.files.length, 0);
if (apply && total) {
  const all = done.flatMap(d => d.files);
  for (let i = 0; i < all.length; i += 100) git('rm', '-q', '--', ...all.slice(i, i + 100));
}
console.log(`\n${apply ? 'Staged the removal of' : 'Would remove'} ${total} file(s), ${mb(done.reduce((n, d) => n + d.bytes, 0))} MB from ${done.length} finished slug(s). content/schedule/ stays.`);
if (apply && total) console.log('Next: commit these changes and open the cleanup PR. Git history keeps everything.');
