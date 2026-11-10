// Buffer publishing via the public GraphQL API (https://developers.buffer.com).
//
//   node --env-file=.env scripts/buffer.ts channels [--save]
//   node --env-file=.env scripts/buffer.ts post --slug <slug> --kind post|reel|story \
//        --platforms instagram,facebook --media-url <https url> [--media-url <url> ...] \
//        [--queue | --at 2026-11-20T13:30:00+05:30 | --now | --draft] [--first-comment "..."] [--dry-run]
//
// Captions are read from output/<platform>/<slug>/caption.txt (one per platform).
// Buffer does NOT support WhatsApp — those files stay in output/whatsapp/<slug>/ for manual sharing.
// Buffer needs PUBLIC, non-expiring media URLs (it has no upload endpoint).
import { readFileSync, writeFileSync, existsSync, appendFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { ROOT, parseArgs } from './lib/brand.ts';
import { OUTPUT, assertSlug } from './lib/output.ts';

const API = 'https://api.buffer.com';
const CHANNELS_FILE = path.join(ROOT, 'config', 'buffer-channels.json');
type Kind = 'post' | 'reel' | 'story';
const SUPPORTED = ['instagram', 'facebook'] as const;

const args = parseArgs(process.argv.slice(2));
const cmd = args._[0];

async function gql<T>(query: string, variables: Record<string, unknown> = {}, retry = true): Promise<T> {
  const key = process.env.BUFFER_API_KEY;
  if (!key) throw new Error('BUFFER_API_KEY is not set. Create one at https://publish.buffer.com/settings/api and put it in .env');
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

// ------------------------------------------------------------------ channels
async function channels(): Promise<void> {
  const { account } = await gql<{ account: { organizations: { id: string; name: string }[] } }>(
    `query { account { organizations { id name } } }`);
  const map: Record<string, { id: string; name: string; organization: string }> = {};
  for (const org of account.organizations) {
    const { channels } = await gql<{ channels: { id: string; name: string; displayName: string; service: string; isQueuePaused: boolean }[] }>(
      `query($input: ChannelsInput!) { channels(input: $input) { id name displayName service isQueuePaused } }`,
      { input: { organizationId: org.id } });
    for (const c of channels) {
      console.log(`${c.service.padEnd(12)} ${c.id}  ${c.displayName || c.name}  (org: ${org.name})${c.isQueuePaused ? '  [QUEUE PAUSED]' : ''}`);
      if ((SUPPORTED as readonly string[]).includes(c.service) && !map[c.service]) map[c.service] = { id: c.id, name: c.displayName || c.name, organization: org.name };
    }
  }
  if (args.save) {
    mkdirSync(path.dirname(CHANNELS_FILE), { recursive: true });
    writeFileSync(CHANNELS_FILE, JSON.stringify(map, null, 2) + '\n');
    console.log(`Saved ${Object.keys(map).join(', ') || 'no supported channels'} → config/buffer-channels.json`);
  }
}

// ------------------------------------------------------------------ media URL checks
async function checkMediaUrl(url: string, kind: Kind): Promise<string> {
  if (!/^https:\/\//.test(url)) throw new Error(`Media must be a public https URL (got ${url}). Buffer cannot read local files.`);
  if (/[?&](X-Amz-Signature|X-Amz-Expires|Signature|Expires|se|sig|token)=/i.test(url)) {
    throw new Error(`Media URL looks signed/expiring (${url}). Buffer fetches media at publish time — use a permanent public URL.`);
  }
  const res = await fetch(url, { method: 'HEAD' }).catch(e => { throw new Error(`Media URL unreachable: ${url} (${e.message})`); });
  if (!res.ok) throw new Error(`Media URL returned HTTP ${res.status}: ${url}`);
  const type = res.headers.get('content-type') ?? '';
  if (kind === 'reel' && !type.startsWith('video/')) console.warn(`[warn] ${url} content-type is "${type}", expected video/*`);
  return type;
}

// ------------------------------------------------------------------ post
function readCaption(platform: string, slug: string): string {
  const f = path.join(OUTPUT, platform, slug, 'caption.txt');
  if (!existsSync(f)) throw new Error(`Missing caption: output/${platform}/${slug}/caption.txt — write it first (social-caption skill).`);
  const text = readFileSync(f, 'utf8').trim();
  if (platform === 'instagram' && text.length > 2200) throw new Error('Instagram caption exceeds 2,200 characters');
  if (platform === 'instagram' && (text.match(/#[\p{L}\p{N}_]+/gu)?.length ?? 0) > 30) throw new Error('Instagram allows at most 30 hashtags');
  return text;
}

function reelThumbOffset(slug: string): number | undefined {
  const m = path.join(OUTPUT, '_masters', slug, 'manifest-reel.json');
  if (!existsSync(m)) return undefined;
  return JSON.parse(readFileSync(m, 'utf8')).coverThumbnailOffsetMs;
}

async function post(): Promise<void> {
  const slug = assertSlug(args.slug);
  const kind = String(args.kind ?? 'post') as Kind;
  if (!['post', 'reel', 'story'].includes(kind)) throw new Error('--kind must be post, reel or story');
  const platforms = String(args.platforms ?? 'instagram,facebook').split(',').map(s => s.trim());
  const media = ([] as string[]).concat((args['media-url'] as string | string[] | undefined) ?? []);
  if (!media.length) throw new Error('Provide at least one --media-url (public https URL of the file in output/<platform>/<slug>/)');
  if (kind !== 'post' && media.length > 1) throw new Error(`A ${kind} takes exactly one media file`);

  if (platforms.includes('whatsapp')) {
    console.log(`ℹ WhatsApp is not supported by Buffer. Share manually from output/whatsapp/${slug}/ (media + caption.txt).`);
  }
  const targets = platforms.filter(p => (SUPPORTED as readonly string[]).includes(p));
  if (!targets.length) return;

  const channelMap: Record<string, { id: string }> = existsSync(CHANNELS_FILE) ? JSON.parse(readFileSync(CHANNELS_FILE, 'utf8')) : {};
  const dryRun = Boolean(args['dry-run']);
  if (!dryRun) for (const u of media) await checkMediaUrl(u, kind);

  // Scheduling mode
  let mode = 'addToQueue';
  let dueAt: string | undefined;
  if (typeof args.at === 'string') {
    const d = new Date(args.at);
    if (Number.isNaN(d.getTime())) throw new Error(`--at is not a valid date: ${args.at}`);
    if (d.getTime() < Date.now() + 60_000) throw new Error('--at must be in the future');
    mode = 'customScheduled';
    dueAt = d.toISOString();
  } else if (args.now) mode = 'shareNow';

  const thumbOffset = kind === 'reel' ? (Number(args['thumb-offset']) || reelThumbOffset(slug)) : undefined;
  const assets = media.map(url => (kind === 'reel' || /\.(mp4|mov)(\?|$)/i.test(url)
    ? { video: { url, ...(thumbOffset ? { metadata: { thumbnailOffset: thumbOffset } } : {}) } }
    : { image: { url } }));

  for (const platform of targets) {
    const channelId = channelMap[platform]?.id ?? (dryRun ? `<${platform}-channel-id>` : undefined);
    if (!channelId) throw new Error(`No Buffer channel saved for ${platform}. Run: npm run buffer -- channels --save`);

    const metadata: Record<string, unknown> =
      platform === 'instagram'
        ? { instagram: { type: kind, shouldShareToFeed: kind !== 'story', ...(args['first-comment'] ? { firstComment: String(args['first-comment']) } : {}) } }
        : { facebook: { type: kind, ...(args['first-comment'] ? { firstComment: String(args['first-comment']) } : {}) } };
    // AI label: never sent unless explicitly requested with --ai-disclosure.
    if (args['ai-disclosure'] && platform === 'instagram') (metadata.instagram as Record<string, unknown>).isAiGenerated = true;

    const input = {
      channelId,
      text: readCaption(platform, slug),
      schedulingType: 'automatic',
      mode,
      ...(dueAt ? { dueAt } : {}),
      ...(args.draft ? { saveToDraft: true } : {}),
      assets,
      metadata,
    };

    if (dryRun) {
      console.log(`--- DRY RUN ${platform} ---\n${JSON.stringify(input, null, 2)}`);
      continue;
    }

    const data = await gql<{ createPost: { __typename: string; post?: { id: string; dueAt: string | null }; message?: string } }>(
      `mutation($input: CreatePostInput!) {
        createPost(input: $input) {
          __typename
          ... on PostActionSuccess { post { id dueAt } }
          ... on MutationError { message }
        }
      }`, { input });
    const r = data.createPost;
    const logLine = { at: new Date().toISOString(), slug, platform, kind, mode, dueAt, result: r };
    const logDir = path.join(OUTPUT, '_masters', slug);
    mkdirSync(logDir, { recursive: true });
    appendFileSync(path.join(logDir, 'publish-log.jsonl'), JSON.stringify(logLine) + '\n');
    if (r.post) console.log(`✓ ${platform}: Buffer post ${r.post.id}${args.draft ? ' (draft)' : ''} ${r.post.dueAt ? `due ${r.post.dueAt}` : ''}`);
    else throw new Error(`${platform}: ${r.__typename} — ${r.message}`);
  }
}

if (cmd === 'channels') await channels();
else if (cmd === 'post') await post();
else {
  console.error('Commands: channels [--save] | post --slug <slug> --kind post|reel|story --platforms instagram,facebook --media-url <url> [...]');
  process.exit(1);
}
