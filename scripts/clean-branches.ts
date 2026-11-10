// Tidies the local git branches that the content workflow leaves behind (one content/<slug> branch per piece).
//
//   node scripts/clean-branches.ts             delete finished branches, prune stale remote refs
//   node scripts/clean-branches.ts --dry-run   list what would happen, change nothing
//
// A local branch is deleted ONLY when all of these hold:
//   - its name starts with content/, tooling/ or cleanup/   (other branches, such as main or test, are never touched)
//   - it is not the branch you are on
//   - its work is already in main: either git says it is merged, or its pull request was merged on GitHub
//     with exactly the same last commit (this covers squash and rebase merges, which git can't see)
// A branch with any commit that is not in main is kept and listed. Remote branches are never deleted here.
//
// Also reports (never changes): content PRs open for more than 14 days.
import { execFileSync, spawnSync } from 'node:child_process';
import { ROOT } from './lib/brand.ts';

const USAGE = 'Usage: npm run clean:branches -- [--dry-run]\n\n  --dry-run   list what would happen, change nothing\n  --help      show this help';
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) { console.log(USAGE); process.exit(0); }
const unknown = args.filter(a => a !== '--dry-run');
if (unknown.length) { console.error(`Unknown arguments: ${unknown.join(' ')}\n${USAGE}`); process.exit(1); }
const dryRun = args.includes('--dry-run');

const git = (...a: string[]): string => execFileSync('git', a, { cwd: ROOT, encoding: 'utf8' }).trim();
const tryGit = (...a: string[]) => spawnSync('git', a, { cwd: ROOT, encoding: 'utf8' });

// 1. Stale remote-tracking refs (branches GitHub already deleted).
try {
  if (dryRun) {
    const out = git('remote', 'prune', 'origin', '--dry-run');
    const stale = out.split('\n').filter(l => l.includes('[would prune]'));
    console.log(stale.length ? stale.join('\n') : 'No stale remote refs.');
  } else {
    git('fetch', '--prune', 'origin');
    console.log('Fetched and pruned stale remote refs.');
  }
} catch {
  console.log('Could not reach GitHub, so remote refs were not refreshed. Local branches are checked against the last fetch.');
}

// 2. Local branches that are finished.
const base = tryGit('rev-parse', '--verify', '--quiet', 'origin/main').status === 0 ? 'origin/main' : 'main';
const current = git('branch', '--show-current');
const branches = git('for-each-ref', '--format=%(refname:short)', 'refs/heads/content', 'refs/heads/tooling', 'refs/heads/cleanup').split('\n').filter(Boolean);

type MergedPr = { headRefName: string; headRefOid: string };
let merged: MergedPr[] | undefined;
const gh = spawnSync('gh', ['pr', 'list', '--state', 'merged', '--limit', '200', '--json', 'headRefName,headRefOid'], { cwd: ROOT, encoding: 'utf8' });
if (gh.status === 0) merged = JSON.parse(gh.stdout) as MergedPr[];
else console.log('Could not read pull requests from GitHub (gh). Squash-merged branches will be kept this time.');

let deleted = 0;
const kept: string[] = [];
for (const b of branches) {
  if (b === current) { kept.push(`${b}  (you are on it)`); continue; }
  const tip = git('rev-parse', b);
  const inMain = tryGit('merge-base', '--is-ancestor', b, base).status === 0;
  const prMerged = merged?.some(p => p.headRefName === b && p.headRefOid === tip) ?? false;
  if (inMain || prMerged) {
    console.log(`${dryRun ? 'would delete' : 'deleted'}  ${b}  (${inMain ? `merged into ${base}` : 'its pull request was merged'})`);
    if (!dryRun) git('branch', '-D', b);
    deleted++;
  } else {
    kept.push(`${b}  (has work that is not in main yet)`);
  }
}
for (const k of kept) console.log(`kept         ${k}`);
console.log(`\n${dryRun ? 'Would delete' : 'Deleted'} ${deleted} finished branch(es). Kept ${kept.length}.`);

// 3. Report only: content PRs left open for a long time.
const open = spawnSync('gh', ['pr', 'list', '--state', 'open', '--limit', '100', '--json', 'number,title,headRefName,createdAt'], { cwd: ROOT, encoding: 'utf8' });
if (open.status === 0) {
  const cutoff = Date.now() - 14 * 86_400_000;
  const old = (JSON.parse(open.stdout) as { number: number; title: string; headRefName: string; createdAt: string }[])
    .filter(p => p.headRefName.startsWith('content/') && new Date(p.createdAt).getTime() < cutoff);
  for (const p of old) console.log(`Open for more than 14 days: #${p.number} ${p.title} (${p.headRefName}). Merge it or cancel it.`);
}
