// Provenance for AI-generated photos: a sidecar "<photo>.ai.json" next to the image.
//
// Written by draw-product.ts (and import-photo.ts --ai-generated). The renderers copy it into
// the manifest so the publish step knows the creative contains AI imagery. Never strip it.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolvePath } from './brand.ts';

export interface AiPhotoInfo {
  aiGenerated: true;
  /** "claude-illustration" for draw-product.ts, "external" for images the user made elsewhere */
  generator: string;
  model?: string;
  prompt?: string;
  createdAt: string;
  /** Policy reminder: AI garments are not real stock. */
  usage: 'mood/campaign only';
}

export const sidecarPath = (photo: string): string => resolvePath(photo) + '.ai.json';

export function writeAiSidecar(photo: string, info: Omit<AiPhotoInfo, 'aiGenerated' | 'usage' | 'createdAt'>): void {
  const data: AiPhotoInfo = { aiGenerated: true, ...info, createdAt: new Date().toISOString(), usage: 'mood/campaign only' };
  writeFileSync(sidecarPath(photo), JSON.stringify(data, null, 2) + '\n');
}

export function readAiSidecar(photo: string): AiPhotoInfo | null {
  const f = sidecarPath(photo);
  return existsSync(f) ? JSON.parse(readFileSync(f, 'utf8')) as AiPhotoInfo : null;
}

/** Subset of the given photo paths that are AI-generated (as written in the brief). */
export const aiPhotosIn = (photos: (string | undefined)[]): string[] =>
  photos.filter((p): p is string => Boolean(p) && readAiSidecar(p!) !== null);
