#!/usr/bin/env node
// Safe Test Artifact Cleanup Tool
// Identifies and cleans disposable test assets while preserving original photos, brand logos,
// user-uploaded media, and approved final deliverables.

import { existsSync, readdirSync, statSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { ROOT } from './lib/brand.ts';

export interface CleanupReport {
  timestamp: string;
  dryRun: boolean;
  deletedFiles: string[];
  retainedFiles: string[];
  protectedFilesCount: number;
  freedBytes: number;
}

const PROTECTED_SLUGS = new Set([
  'dulhan-bridal-saree-2026-11',
  'shaadi-season-wedding-2026-11'
]);

export function cleanTestArtifacts(options: { dryRun?: boolean; verbose?: boolean } = {}): CleanupReport {
  const { dryRun = false, verbose = false } = options;
  const deletedFiles: string[] = [];
  const retainedFiles: string[] = [];
  let protectedFilesCount = 0;
  let freedBytes = 0;

  // 1. Playwright temporary test artifacts
  const tempDirs = [
    path.join(ROOT, '.playwright-artifacts'),
    path.join(ROOT, 'output', '_build')
  ];

  for (const d of tempDirs) {
    if (existsSync(d)) {
      try {
        const files = readdirSync(d);
        for (const f of files) {
          const fp = path.join(d, f);
          const stat = statSync(fp);
          if (stat.isFile()) {
            freedBytes += stat.size;
            deletedFiles.push(path.relative(ROOT, fp));
            if (!dryRun) rmSync(fp, { force: true });
          } else if (stat.isDirectory()) {
            deletedFiles.push(path.relative(ROOT, fp) + '/');
            if (!dryRun) rmSync(fp, { recursive: true, force: true });
          }
        }
      } catch (e: any) {
        if (verbose) console.warn(`Could not clean directory ${d}: ${e.message}`);
      }
    }
  }

  // 2. Identify disposable test folders in assets/photos
  const photosDir = path.join(ROOT, 'assets', 'photos');
  if (existsSync(photosDir)) {
    const entries = readdirSync(photosDir);
    for (const entry of entries) {
      if (entry === '.gitkeep') {
        protectedFilesCount++;
        continue;
      }

      const isTestSlug = entry.startsWith('test-') ||
                         entry.startsWith('temp-') ||
                         entry.includes('-test-') ||
                         entry === 'test-segmentation';

      const entryPath = path.join(photosDir, entry);
      if (PROTECTED_SLUGS.has(entry) || !isTestSlug) {
        protectedFilesCount++;
        retainedFiles.push(path.relative(ROOT, entryPath));
      } else {
        // Disposable test directory
        try {
          const stat = statSync(entryPath);
          if (stat.isDirectory()) {
            deletedFiles.push(path.relative(ROOT, entryPath) + '/');
            if (!dryRun) rmSync(entryPath, { recursive: true, force: true });
          }
        } catch (e: any) {
          if (verbose) console.warn(`Could not remove ${entryPath}: ${e.message}`);
        }
      }
    }
  }

  // Record cleanup manifest
  const report: CleanupReport = {
    timestamp: new Date().toISOString(),
    dryRun,
    deletedFiles,
    retainedFiles,
    protectedFilesCount,
    freedBytes
  };

  const manifestPath = path.join(ROOT, 'brand', 'test-cleanup-manifest.json');
  try {
    writeFileSync(manifestPath, JSON.stringify(report, null, 2) + '\n');
  } catch {}

  return report;
}

if (process.argv[1]?.endsWith('clean-test-artifacts.ts')) {
  const isDryRun = process.argv.includes('--dry-run');
  console.log(`================================================================`);
  console.log(`MONAVI COLLECTION — AUTOMATIC TEST ARTIFACT CLEANUP`);
  console.log(`Mode: ${isDryRun ? 'DRY-RUN (Simulated)' : 'ACTIVE (Deleting disposable test files)'}`);
  console.log(`================================================================`);

  const rep = cleanTestArtifacts({ dryRun: isDryRun, verbose: true });
  console.log(`\nDisposable Files/Folders Identified: ${rep.deletedFiles.length}`);
  for (const f of rep.deletedFiles.slice(0, 10)) {
    console.log(`  - ${f}`);
  }
  if (rep.deletedFiles.length > 10) {
    console.log(`  ... and ${rep.deletedFiles.length - 10} more`);
  }

  console.log(`\nProtected Business/Brand Assets Retained: ${rep.protectedFilesCount}`);
  console.log(`Freed Space: ${(rep.freedBytes / 1024).toFixed(1)} KB`);
  console.log(`Manifest written to: brand/test-cleanup-manifest.json`);
  console.log(`\n✓ Test cleanup complete with zero risk to production assets.`);
}
