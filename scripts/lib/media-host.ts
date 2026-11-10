// Public media hosting for Buffer (Buffer has no upload endpoint; it fetches public URLs at publish time).
// Provider: Cloudflare R2 (S3-compatible, free egress, permanent public URLs).
//
// Required env (GitHub secrets in CI, .env locally):
//   R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET
//   MEDIA_PUBLIC_BASE_URL   e.g. https://media.example.com  or  https://pub-xxxx.r2.dev
//
// Keys are content-addressed (<slug>/<sha256-12>-<file>) so a changed file always gets a new URL
// and re-uploading identical content is skipped.
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { S3Client, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';

const TYPES: Record<string, string> = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.mp4': 'video/mp4', '.mov': 'video/quicktime' };

function env(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} is not set (needed to host media publicly for Buffer). See README → Publishing setup.`);
  return v;
}

let client: S3Client | null = null;
function s3(): S3Client {
  client ??= new S3Client({
    region: 'auto',
    endpoint: `https://${env('R2_ACCOUNT_ID')}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId: env('R2_ACCESS_KEY_ID'), secretAccessKey: env('R2_SECRET_ACCESS_KEY') },
  });
  return client;
}

export function mediaKey(file: string, slug: string): string {
  const hash = createHash('sha256').update(readFileSync(file)).digest('hex').slice(0, 12);
  return `${slug}/${hash}-${path.basename(file)}`;
}

export function publicUrl(key: string): string {
  return `${env('MEDIA_PUBLIC_BASE_URL').replace(/\/$/, '')}/${key}`;
}

/** Uploads (if not already present) and returns the permanent public URL. */
export async function hostMedia(file: string, slug: string): Promise<string> {
  const key = mediaKey(file, slug);
  const Bucket = env('R2_BUCKET');
  const exists = await s3().send(new HeadObjectCommand({ Bucket, Key: key })).then(() => true, () => false);
  if (!exists) {
    const ContentType = TYPES[path.extname(file).toLowerCase()] ?? 'application/octet-stream';
    await s3().send(new PutObjectCommand({ Bucket, Key: key, Body: readFileSync(file), ContentType, CacheControl: 'public, max-age=31536000, immutable' }));
  }
  return publicUrl(key);
}
