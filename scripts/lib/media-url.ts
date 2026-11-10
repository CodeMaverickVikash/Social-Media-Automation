// Public media URLs for Buffer, served straight from this PUBLIC GitHub repo via the jsDelivr CDN.
//
//   https://cdn.jsdelivr.net/gh/<owner>/<repo>@<commit-sha>/output/<platform>/<slug>/<file>
//
// Why jsDelivr instead of raw.githubusercontent.com: raw serves .mp4 as application/octet-stream,
// jsDelivr serves correct types (image/jpeg, video/mp4) from a CDN. Pinning to a commit SHA makes the
// URL permanent and immutable — exactly what Buffer needs, since it fetches media at publish time.
// Limit: jsDelivr serves GitHub files up to 20 MB (enforced by scripts/check-media.ts).
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { ROOT } from './brand.ts';

export const MAX_MEDIA_BYTES = 20 * 1024 * 1024;

const git = (...a: string[]) => execFileSync('git', a, { cwd: ROOT, encoding: 'utf8' }).trim();

/** "owner/repo" — from GitHub Actions, else parsed from the origin remote (works with ssh host aliases). */
export function repoSlug(): string {
  if (process.env.GITHUB_REPOSITORY) return process.env.GITHUB_REPOSITORY;
  const url = git('remote', 'get-url', 'origin');
  const m = url.match(/[:/]([^/:]+)\/([^/]+?)(?:\.git)?$/);
  if (!m) throw new Error(`Cannot parse GitHub owner/repo from origin remote "${url}"`);
  return `${m[1]}/${m[2]}`;
}

/** Commit the files are read from — in CI the merge commit, locally HEAD (must be pushed). */
export function mediaCommit(): string {
  return process.env.GITHUB_SHA ?? git('rev-parse', 'HEAD');
}

/** Permanent public URL of a committed file. */
export function publicMediaUrl(file: string, commit = mediaCommit()): string {
  const rel = path.relative(ROOT, path.resolve(ROOT, file)).split(path.sep).map(encodeURIComponent).join('/');
  if (rel.startsWith('..')) throw new Error(`${file} is outside the repository`);
  return `https://cdn.jsdelivr.net/gh/${repoSlug()}@${commit}/${rel}`;
}

/** Local-only guard: the commit must already be on GitHub, otherwise the CDN can't see the files. */
export function assertCommitPushed(commit = mediaCommit()): void {
  if (process.env.GITHUB_ACTIONS) return;
  const remotes = git('branch', '-r', '--contains', commit);
  if (!remotes) throw new Error(`Commit ${commit.slice(0, 7)} is not pushed to GitHub yet — push it first so the media URLs resolve.`);
}
