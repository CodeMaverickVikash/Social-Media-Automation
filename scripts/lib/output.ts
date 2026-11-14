// Output layout — everything lands in one folder, split by social platform:
//
//   output/
//     instagram/<slug>/   delivery files + caption.txt
//     facebook/<slug>/
//     whatsapp/<slug>/
//     _masters/<slug>/    2x lossless masters, manifest.json (not for upload)
//
import { mkdirSync, writeFileSync, copyFileSync, rmSync } from 'node:fs';
import path from 'node:path';
import { ROOT } from './brand.ts';

export const OUTPUT = path.join(ROOT, 'output');
export const PLATFORMS = ['instagram', 'facebook', 'whatsapp', 'pinterest'] as const;
export type Platform = (typeof PLATFORMS)[number];

export function assertSlug(slug: unknown): string {
  if (typeof slug !== 'string' || !/^[a-z0-9][a-z0-9-]{1,80}$/.test(slug)) {
    throw new Error(`Brief needs a "slug" in kebab-case (a-z, 0-9, -), got ${JSON.stringify(slug)}`);
  }
  return slug;
}

export function platformDir(platform: Platform, slug: string): string {
  const d = path.join(OUTPUT, platform, slug);
  mkdirSync(d, { recursive: true });
  return d;
}

export function masterDir(slug: string): string {
  const d = path.join(OUTPUT, '_masters', slug);
  mkdirSync(d, { recursive: true });
  return d;
}

export function buildDir(slug: string): string {
  const d = path.join(OUTPUT, '_build', slug);
  rmSync(d, { recursive: true, force: true });
  mkdirSync(d, { recursive: true });
  return d;
}

export function cleanBuild(slug: string): void {
  rmSync(path.join(OUTPUT, '_build', slug), { recursive: true, force: true });
}

/** Copies one finished file into each platform folder; returns the destination paths. */
export function distribute(file: string, slug: string, platforms: readonly string[], name = path.basename(file)): string[] {
  return platforms
    .filter((p): p is Platform => (PLATFORMS as readonly string[]).includes(p))
    .map(p => {
      const dest = path.join(platformDir(p, slug), name);
      copyFileSync(file, dest);
      return dest;
    });
}

export function writeManifest(slug: string, kind: 'post' | 'reel', data: unknown): string {
  const f = path.join(masterDir(slug), `manifest-${kind}.json`);
  writeFileSync(f, JSON.stringify(data, null, 2));
  return f;
}

export const rel = (p: string): string => path.relative(ROOT, p).split(path.sep).join('/');
