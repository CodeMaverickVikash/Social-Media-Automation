// Readiness check: is this machine and repo ready for `/create-social-content` to go from photo to PR?
// It runs before any rendering so setup problems show up in seconds, not after a failed PR check.
//
//   node scripts/doctor.ts          exit 1 if anything blocking is missing
//
import { existsSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { ROOT } from './lib/brand.ts';

type Result = { ok: boolean; label: string; fix?: string; blocking?: boolean };
const results: Result[] = [];
const check = (label: string, ok: boolean, fix: string, blocking = true) => results.push({ ok, label, fix, blocking });

const run = (cmd: string, args: string[]) => {
  const r = spawnSync(cmd, args, { cwd: ROOT, encoding: 'utf8' });
  return { ok: r.status === 0, out: (r.stdout ?? '').trim(), err: (r.stderr ?? '').trim() };
};

// 1. Node
const [maj = 0, min = 0] = process.versions.node.split('.').map(Number);
check(`Node ${process.versions.node}`, maj > 22 || (maj === 22 && min >= 18), 'Install Node.js 22.18 or newer (24 recommended).');

// 2. Dependencies + renderer + ffmpeg
check('npm dependencies installed', existsSync(path.join(ROOT, 'node_modules', 'sharp')), 'Run: npm install');
let chromiumOk = false;
try {
  const { chromium } = await import('playwright');
  chromiumOk = existsSync(chromium.executablePath());
} catch { /* reported below */ }
check('Chromium for rendering', chromiumOk, 'Run: npx playwright install chromium');
let ffmpegOk = false;
try {
  const { FFMPEG } = await import('./lib/ffmpeg.ts');
  ffmpegOk = existsSync(FFMPEG);
} catch { /* reported below */ }
check('ffmpeg for reels', ffmpegOk, 'Run: npm rebuild ffmpeg-static');

// 3. Buffer channels
const channelsFile = path.join(ROOT, 'config', 'buffer-channels.json');
let channelsOk = false;
let channelsNote = 'GitHub → Actions → "List Buffer channels" → Run workflow, then save the JSON from the run summary as config/buffer-channels.json and commit it to main.';
if (existsSync(channelsFile)) {
  try {
    const map = JSON.parse(readFileSync(channelsFile, 'utf8')) as Record<string, { id?: string }>;
    const ids = ['instagram', 'facebook'].filter(p => map[p]?.id && !map[p]!.id!.startsWith('<'));
    channelsOk = ids.length > 0;
    if (!channelsOk) channelsNote = 'config/buffer-channels.json has no real channel ids. ' + channelsNote;
  } catch { channelsNote = 'config/buffer-channels.json is not valid JSON. ' + channelsNote; }
}
check('Buffer channels configured', channelsOk, channelsNote);

// 4. Git + GitHub (needed to push the content branch and open the PR)
const remote = run('git', ['remote', 'get-url', 'origin']);
check('git remote "origin"', remote.ok, 'Add the GitHub remote: git remote add origin <url>');
const gh = run('gh', ['auth', 'status']);
check('GitHub CLI signed in', gh.ok, 'Install GitHub CLI and run: gh auth login');
if (gh.ok) {
  const repo = run('gh', ['repo', 'view', '--json', 'visibility,viewerPermission,nameWithOwner']);
  if (repo.ok) {
    const info = JSON.parse(repo.out) as { visibility: string; viewerPermission: string; nameWithOwner: string };
    check(`Repo ${info.nameWithOwner} is public (Buffer fetches media from it)`, info.visibility === 'PUBLIC',
      'Make the repository public, or media links will not work.');
    check(`Your GitHub account can push and open PRs (permission: ${info.viewerPermission})`,
      ['ADMIN', 'MAINTAIN', 'WRITE'].includes(info.viewerPermission),
      'Sign in to gh with an account that has write access (gh auth switch / gh auth login), or ask the owner to add you as a collaborator.');
  } else {
    check('GitHub repo reachable', false, `gh repo view failed: ${repo.err.split('\n')[0]}`);
  }
}

// 5. Branch hygiene (warning only)
const dirty = run('git', ['status', '--porcelain', '--', 'scripts', '.claude', '.github', 'package.json', 'brand']);
check('Tooling changes are committed', dirty.ok && dirty.out === '',
  'Uncommitted changes in scripts/, .claude/, .github/, brand/ or package.json. Merge them to main first, because content PRs are checked with main\'s scripts.', false);

// 6. Antigravity copies match their Claude Code sources (warning only)
const sync = run(process.execPath, ['scripts/sync-antigravity.ts', '--check']);
check('Antigravity files match .claude/ and CLAUDE.md', sync.ok,
  'Run: npm run sync:antigravity, then commit AGENTS.md and .agents/. CI fails on a content PR while they are out of date.', false);

// Report
let blocking = 0;
for (const r of results) {
  const mark = r.ok ? '✓' : r.blocking ? '✗' : '!';
  console.log(`${mark} ${r.label}`);
  if (!r.ok) { console.log(`    → ${r.fix}`); if (r.blocking) blocking++; }
}
console.log(blocking ? `\n${blocking} blocking issue(s). Fix them before making content.` : '\nReady. Run /create-social-content in Claude Code or Antigravity.');
process.exit(blocking ? 1 : 0);
