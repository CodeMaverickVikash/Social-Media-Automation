// Buffer CLI for one-off / manual publishing. The normal path is a PR + merge (scripts/publish-plan.ts).
//
//   npm run buffer -- channels [--save]
//   npm run buffer -- post --slug <slug> --kind post|reel|story --platforms instagram,facebook \
//        (--media-url <https url> ... | --host) [--queue | --at <ISO> | --now | --draft] [--first-comment "..."] [--dry-run]
//
// --host uploads the matching file from output/<platform>/<slug>/ to R2 and uses its public URL.
import { writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { parseArgs } from './lib/brand.ts';
import { OUTPUT, assertSlug } from './lib/output.ts';
import { CHANNELS_FILE, KINDS, assertPublishable, buildPostInput, checkMediaUrl, createPost, isBufferPlatform, listChannels, loadChannelMap, logPublish } from './lib/buffer-api.ts';
import type { Kind } from './lib/buffer-api.ts';
import { hostMedia } from './lib/media-host.ts';

const args = parseArgs(process.argv.slice(2));
const cmd = args._[0];
const DEFAULT_FILE: Record<Kind, string> = { post: 'ig-feed.jpg', story: 'story.jpg', reel: 'reel.mp4' };

async function channels(): Promise<void> {
  const list = await listChannels();
  const map: Record<string, { id: string; name: string; organization: string }> = {};
  for (const c of list) {
    console.log(`${c.service.padEnd(12)} ${c.id}  ${c.displayName || c.name}  (org: ${c.organization})${c.isQueuePaused ? '  [QUEUE PAUSED]' : ''}`);
    if (isBufferPlatform(c.service) && !map[c.service]) map[c.service] = { id: c.id, name: c.displayName || c.name, organization: c.organization };
  }
  if (args.save) {
    mkdirSync(path.dirname(CHANNELS_FILE), { recursive: true });
    writeFileSync(CHANNELS_FILE, JSON.stringify(map, null, 2) + '\n');
    console.log(`Saved ${Object.keys(map).join(', ') || 'no supported channels'} → config/buffer-channels.json (commit it; ids are not secret)`);
  }
}

async function post(): Promise<void> {
  const slug = assertSlug(args.slug);
  const kind = String(args.kind ?? 'post') as Kind;
  if (!KINDS.includes(kind)) throw new Error('--kind must be post, reel or story');
  const platforms = String(args.platforms ?? 'instagram,facebook').split(',').map(s => s.trim());
  const dryRun = Boolean(args['dry-run']);

  if (platforms.includes('whatsapp')) console.log(`ℹ WhatsApp is not supported by Buffer. Share manually from output/whatsapp/${slug}/ (media + caption.txt).`);
  const targets = platforms.filter(isBufferPlatform);
  if (!targets.length) return;
  assertPublishable(slug, kind, dryRun);

  const channelMap = loadChannelMap();
  for (const platform of targets) {
    const channelId = channelMap[platform]?.id ?? (dryRun ? `<${platform}-channel-id>` : undefined);
    if (!channelId) throw new Error(`No Buffer channel saved for ${platform}. Run: npm run buffer -- channels --save`);

    let mediaUrls = ([] as string[]).concat((args['media-url'] as string | string[] | undefined) ?? []);
    if (args.host) {
      const file = path.join(OUTPUT, platform, slug, DEFAULT_FILE[kind]);
      mediaUrls = dryRun ? [`<public url of ${path.relative(OUTPUT, file)}>`] : [await hostMedia(file, slug)];
    }
    if (!mediaUrls.length) throw new Error('Provide --media-url <https url> or --host');
    if (!dryRun) for (const u of mediaUrls) await checkMediaUrl(u, kind);

    const input = buildPostInput({
      platform, slug, kind, mediaUrls,
      at: typeof args.at === 'string' ? args.at : undefined,
      now: Boolean(args.now), draft: Boolean(args.draft),
      firstComment: typeof args['first-comment'] === 'string' ? args['first-comment'] : undefined,
      aiDisclosure: Boolean(args['ai-disclosure']),
      thumbOffsetMs: Number(args['thumb-offset']) || undefined,
    }, channelId);

    if (dryRun) { console.log(`--- DRY RUN ${platform} ---\n${JSON.stringify(input, null, 2)}`); continue; }
    const res = await createPost(input);
    logPublish(slug, { platform, kind, source: 'cli', bufferPostId: res.id, dueAt: res.dueAt });
    console.log(`✓ ${platform}: Buffer post ${res.id}${args.draft ? ' (draft)' : ''} ${res.dueAt ? `due ${res.dueAt}` : ''}`);
  }
}

if (cmd === 'channels') await channels();
else if (cmd === 'post') await post();
else {
  console.error('Commands: channels [--save] | post --slug <slug> --kind post|reel|story --platforms instagram,facebook (--media-url <url> | --host) [...]');
  process.exit(1);
}
