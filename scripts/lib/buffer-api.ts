// Buffer GraphQL API client + post building, shared by the CLI (scripts/buffer.ts)
// and the merge-to-main scheduler (scripts/publish-plan.ts).
// Docs: https://developers.buffer.com
import { readFileSync, existsSync, appendFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { ROOT } from './brand.ts';
import { OUTPUT } from './output.ts';

const API = 'https://api.buffer.com';
export const CHANNELS_FILE = path.join(ROOT, 'config', 'buffer-channels.json');
export const BUFFER_PLATFORMS = ['instagram', 'facebook'] as const;
export type Kind = 'post' | 'reel' | 'story';
export const KINDS: readonly Kind[] = ['post', 'reel', 'story'];

export const isBufferPlatform = (p: string): boolean => (BUFFER_PLATFORMS as readonly string[]).includes(p);

export async function gql<T>(query: string, variables: Record<string, unknown> = {}, retry = true): Promise<T> {
  const key = process.env.BUFFER_API_KEY;
  if (!key) throw new Error('BUFFER_API_KEY is not set. It lives only as a GitHub repository secret (Settings → Secrets and variables → Actions). For a rare local run, set it in the shell for that session only: PowerShell  $env:BUFFER_API_KEY="..."');
  const res = await fetch(API, {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });
  if (res.status === 429 && retry) {
    const wait = Number(res.headers.get('retry-after') ?? 60);
    console.warn(`Rate limited by Buffer — retrying in ${wait}s`);
    await new Promise(r => setTimeout(r, wait * 1000));
    return gql<T>(query, variables, false);
  }
  const body = (await res.json().catch(() => ({}))) as { data?: T; errors?: { message: string; extensions?: { code?: string } }[] };
  if (!res.ok || body.errors?.length) {
    const msg = body.errors?.map(e => `${e.extensions?.code ?? ''} ${e.message}`.trim()).join('; ') ?? res.statusText;
    throw new Error(`Buffer API ${res.status}: ${msg}`);
  }
  return body.data as T;
}

export interface Channel { id: string; name: string; displayName: string; service: string; isQueuePaused: boolean; organization: string }

export async function listChannels(): Promise<Channel[]> {
  const { account } = await gql<{ account: { organizations: { id: string; name: string }[] } }>(`query { account { organizations { id name } } }`);
  const all: Channel[] = [];
  for (const org of account.organizations) {
    // Inline argument, exactly as in Buffer's documented example.
    const { channels } = await gql<{ channels: Omit<Channel, 'organization'>[] }>(
      `query { channels(input: { organizationId: ${JSON.stringify(org.id)} }) { id name displayName service isQueuePaused } }`);
    all.push(...channels.map(c => ({ ...c, organization: org.name })));
  }
  return all;
}

export function loadChannelMap(): Record<string, { id: string; name?: string }> {
  return existsSync(CHANNELS_FILE) ? JSON.parse(readFileSync(CHANNELS_FILE, 'utf8')) : {};
}

export function readCaption(platform: string, slug: string): string {
  const f = path.join(OUTPUT, platform, slug, 'caption.txt');
  if (!existsSync(f)) throw new Error(`Missing caption: output/${platform}/${slug}/caption.txt — write it with the social-caption skill.`);
  const text = readFileSync(f, 'utf8').trim();
  if (!text) throw new Error(`Empty caption: output/${platform}/${slug}/caption.txt`);
  if (platform === 'instagram' && text.length > 2200) throw new Error('Instagram caption exceeds 2,200 characters');
  if (platform === 'instagram' && (text.match(/#[\p{L}\p{N}_]+/gu)?.length ?? 0) > 30) throw new Error('Instagram allows at most 30 hashtags');
  return text;
}

function readManifest(slug: string, kind: Kind): Record<string, unknown> | null {
  const m = path.join(OUTPUT, '_masters', slug, `manifest-${kind === 'reel' ? 'reel' : 'post'}.json`);
  return existsSync(m) ? JSON.parse(readFileSync(m, 'utf8')) : null;
}

const aiNoticeShown = new Set<string>();

/** Blocks publishing of anything not rendered by the pipeline, or rendered as a draft. */
export function assertPublishable(slug: string, kind: Kind, dryRun = false): void {
  const m = readManifest(slug, kind);
  if (!m) throw new Error(`No render manifest for ${slug} (${kind}). Render it with the skills before publishing.`);
  // Informational only — the AI label stays opt-in (aiDisclosure / --ai-disclosure).
  if (m.aiGenerated && !aiNoticeShown.has(`${slug}:${kind}`)) {
    aiNoticeShown.add(`${slug}:${kind}`);
    console.warn(`ℹ ${slug} ${kind} uses AI-generated imagery. Meta asks creators to label photorealistic AI content (and may label it itself); set "aiDisclosure": true on the plan item (or --ai-disclosure) to send the label. Copy must stay mood/campaign-level.`);
  }
  if (m.draftOnly) {
    const msg = `${slug} ${kind} was rendered as a DRAFT (--allow-lowres or --draft). Re-render at full quality before publishing.`;
    if (!dryRun) throw new Error(msg);
    console.warn(`⚠ ${msg} (dry run continues)`);
  }
}

export function reelThumbOffset(slug: string): number | undefined {
  return readManifest(slug, 'reel')?.coverThumbnailOffsetMs as number | undefined;
}

export async function checkMediaUrl(url: string, kind: Kind): Promise<void> {
  if (!/^https:\/\//.test(url)) throw new Error(`Media must be a public https URL (got ${url}). Buffer cannot read local files.`);
  if (/[?&](X-Amz-Signature|X-Amz-Expires|Signature|Expires|se|sig|token)=/i.test(url)) {
    throw new Error(`Media URL looks signed/expiring (${url}). Buffer fetches media at publish time — use a permanent public URL.`);
  }
  const res = await fetch(url, { method: 'HEAD' }).catch((e: Error) => { throw new Error(`Media URL unreachable: ${url} (${e.message})`); });
  if (!res.ok) throw new Error(`Media URL returned HTTP ${res.status}: ${url}`);
  const type = res.headers.get('content-type') ?? '';
  if (kind === 'reel' && !type.startsWith('video/')) console.warn(`[warn] ${url} content-type is "${type}", expected video/*`);
}

export interface PostRequest {
  platform: string;
  slug: string;
  kind: Kind;
  mediaUrls: string[];
  /** ISO datetime with offset; omit for queue */
  at?: string;
  now?: boolean;
  draft?: boolean;
  firstComment?: string;
  /** Only when explicitly requested — the default is no AI label. */
  aiDisclosure?: boolean;
  thumbOffsetMs?: number;
}

export function buildPostInput(r: PostRequest, channelId: string): Record<string, unknown> {
  if (!isBufferPlatform(r.platform)) throw new Error(`${r.platform} is not publishable through Buffer`);
  if (r.kind !== 'post' && r.mediaUrls.length !== 1) throw new Error(`A ${r.kind} takes exactly one media file`);

  let mode = 'addToQueue';
  let dueAt: string | undefined;
  if (r.at) {
    const d = new Date(r.at);
    if (Number.isNaN(d.getTime())) throw new Error(`Invalid date: ${r.at}`);
    if (d.getTime() < Date.now() + 60_000) throw new Error(`Scheduled time ${r.at} is in the past (or under 1 minute away)`);
    mode = 'customScheduled';
    dueAt = d.toISOString();
  } else if (r.now) mode = 'shareNow';

  const thumb = r.kind === 'reel' ? (r.thumbOffsetMs ?? reelThumbOffset(r.slug)) : undefined;
  const assets = r.mediaUrls.map(url => (r.kind === 'reel' || /\.(mp4|mov)(\?|$)/i.test(url)
    ? { video: { url, ...(thumb ? { metadata: { thumbnailOffset: thumb } } : {}) } }
    : { image: { url } }));

  const fc = r.firstComment ? { firstComment: r.firstComment } : {};
  const metadata: Record<string, Record<string, unknown>> = r.platform === 'instagram'
    ? { instagram: { type: r.kind, shouldShareToFeed: r.kind !== 'story', ...fc } }
    : { facebook: { type: r.kind, ...fc } };
  // AI label: never sent unless explicitly requested.
  if (r.aiDisclosure && r.platform === 'instagram') metadata.instagram!.isAiGenerated = true;

  return {
    channelId,
    text: readCaption(r.platform, r.slug),
    schedulingType: 'automatic',
    mode,
    ...(dueAt ? { dueAt } : {}),
    ...(r.draft ? { saveToDraft: true } : {}),
    assets,
    metadata,
  };
}

export async function createPost(input: Record<string, unknown>): Promise<{ id: string; dueAt: string | null }> {
  const data = await gql<{ createPost: { __typename: string; post?: { id: string; dueAt: string | null }; message?: string } }>(
    `mutation($input: CreatePostInput!) {
      createPost(input: $input) {
        __typename
        ... on PostActionSuccess { post { id dueAt } }
        ... on MutationError { message }
      }
    }`, { input });
  const r = data.createPost;
  if (!r.post) throw new Error(`${r.__typename}: ${r.message}`);
  return r.post;
}

export function logPublish(slug: string, entry: Record<string, unknown>): void {
  const dir = path.join(OUTPUT, '_masters', slug);
  mkdirSync(dir, { recursive: true });
  appendFileSync(path.join(dir, 'publish-log.jsonl'), JSON.stringify({ at: new Date().toISOString(), slug, ...entry }) + '\n');
}
