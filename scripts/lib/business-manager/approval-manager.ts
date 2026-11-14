// Central Owner Approval & Revision Workflow Engine
// Enforces mandatory AI Manager review gate, owner final decision options, and separate publishing authorization.

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { ROOT } from '../brand.ts';
import type {
  ReviewableContentItem,
  OwnerApprovalStatus,
  PublishingAuthStatus
} from './types.ts';
import { recordCampaign } from './business-memory.ts';

const CONTENT_REGISTRY_PATH = path.join(ROOT, 'brand', 'content-review-registry.json');

/**
 * Loads the registry of reviewable content items.
 */
export function loadContentRegistry(): Record<string, ReviewableContentItem> {
  if (!existsSync(CONTENT_REGISTRY_PATH)) return {};
  try {
    const raw = readFileSync(CONTENT_REGISTRY_PATH, 'utf8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

/**
 * Saves the registry of reviewable content items.
 */
export function saveContentRegistry(registry: Record<string, ReviewableContentItem>): void {
  writeFileSync(CONTENT_REGISTRY_PATH, JSON.stringify(registry, null, 2), 'utf8');
}

/**
 * Registers newly reviewed content into the central approval system.
 */
export function registerContentForApproval(item: ReviewableContentItem): ReviewableContentItem {
  const registry = loadContentRegistry();
  registry[item.id] = item;
  saveContentRegistry(registry);

  // Also record in business memory campaign history
  recordCampaign({
    slug: item.slug,
    title: item.title,
    date: new Date().toISOString().split('T')[0]!,
    category: item.productKey,
    platforms: item.platforms,
    status: item.ownerStatus === 'approved' ? 'approved' : 'draft',
    notes: `AI Review: ${item.aiReview.status} (Score: ${item.aiReview.overallScore}/100)`
  });

  return item;
}

/**
 * Finds a content item by ID or Slug.
 */
export function findContentItem(idOrSlug: string): ReviewableContentItem | null {
  const registry = loadContentRegistry();
  if (registry[idOrSlug]) return registry[idOrSlug];
  return Object.values(registry).find(item => item.slug === idOrSlug) || null;
}

/**
 * Gets all items currently awaiting owner review.
 */
export function getPendingOwnerApprovals(): ReviewableContentItem[] {
  const registry = loadContentRegistry();
  return Object.values(registry).filter(item => item.ownerStatus === 'pending');
}

/**
 * Owner decision: APPROVE content creative.
 * NOTE: Approving the creative does NOT authorize publishing!
 */
export function approveContentCreative(idOrSlug: string): { success: boolean; item?: ReviewableContentItem; message: string } {
  const item = findContentItem(idOrSlug);
  if (!item) {
    return { success: false, message: `Content "${idOrSlug}" not found in review registry.` };
  }

  if (item.aiReview.status !== 'APPROVED BY AI' && item.aiReview.status !== 'OWNER REVIEW REQUIRED') {
    return {
      success: false,
      message: `Cannot approve content "${item.slug}" because AI Review status is "${item.aiReview.status}". Internal checks must pass first.`
    };
  }

  item.ownerStatus = 'approved';
  item.updatedAt = new Date().toISOString();

  const registry = loadContentRegistry();
  registry[item.id] = item;
  saveContentRegistry(registry);

  recordCampaign({
    slug: item.slug,
    title: item.title,
    date: new Date().toISOString().split('T')[0]!,
    category: item.productKey,
    platforms: item.platforms,
    status: 'approved',
    notes: 'Approved by Business Owner. Awaiting separate publishing authorization.'
  });

  return {
    success: true,
    item,
    message: `Content creative for "${item.title}" (v${item.version}) has been APPROVED by Business Owner.\nNOTE: Publishing authorization is separate and currently UNAUTHORIZED.`
  };
}

/**
 * Owner decision: REQUEST CHANGES on content.
 */
export function requestContentChanges(
  idOrSlug: string,
  feedback: string
): { success: boolean; item?: ReviewableContentItem; message: string } {
  const item = findContentItem(idOrSlug);
  if (!item) {
    return { success: false, message: `Content "${idOrSlug}" not found.` };
  }

  item.ownerStatus = 'changes_requested';
  item.ownerFeedback = feedback;
  item.updatedAt = new Date().toISOString();

  const registry = loadContentRegistry();
  registry[item.id] = item;
  saveContentRegistry(registry);

  return {
    success: true,
    item,
    message: `Feedback recorded for "${item.title}": "${feedback}". Routing revision to internal agents...`
  };
}

/**
 * Owner decision: REJECT content.
 */
export function rejectContentCreative(idOrSlug: string, reason?: string): { success: boolean; item?: ReviewableContentItem; message: string } {
  const item = findContentItem(idOrSlug);
  if (!item) {
    return { success: false, message: `Content "${idOrSlug}" not found.` };
  }

  item.ownerStatus = 'rejected';
  item.ownerFeedback = reason || 'Rejected by Business Owner.';
  item.updatedAt = new Date().toISOString();

  const registry = loadContentRegistry();
  registry[item.id] = item;
  saveContentRegistry(registry);

  return {
    success: true,
    item,
    message: `Content creative for "${item.title}" has been REJECTED and archived.`
  };
}

/**
 * Owner decision: SEPARATE PUBLISHING AUTHORIZATION.
 * Explicitly authorizes publishing or scheduling for specified platforms.
 */
export function authorizePublishing(
  idOrSlug: string,
  platforms: ('instagram' | 'facebook' | 'whatsapp')[]
): { authorized: boolean; message: string; item?: ReviewableContentItem } {
  const item = findContentItem(idOrSlug);
  if (!item) {
    return { authorized: false, message: `Content "${idOrSlug}" not found.` };
  }

  if (item.ownerStatus !== 'approved') {
    return {
      authorized: false,
      message: `BLOCKED: Content creative "${item.slug}" has not been approved by the Owner yet (current status: ${item.ownerStatus}). Creative approval is required before publishing authorization.`
    };
  }

  item.publishingAuth = 'authorized';
  item.authorizedPlatforms = platforms;
  item.updatedAt = new Date().toISOString();

  const registry = loadContentRegistry();
  registry[item.id] = item;
  saveContentRegistry(registry);

  recordCampaign({
    slug: item.slug,
    title: item.title,
    date: new Date().toISOString().split('T')[0]!,
    category: item.productKey,
    platforms,
    status: 'published',
    notes: `Authorized by Owner for publishing to: ${platforms.join(', ')}.`
  });

  return {
    authorized: true,
    item,
    message: `PUBLISHING AUTHORIZED: Content "${item.slug}" is authorized for deployment to [${platforms.join(', ')}].`
  };
}

/**
 * Verifies if publishing is strictly authorized.
 */
export function verifyPublishingAuthorization(slug: string): { allowed: boolean; reason: string } {
  const item = findContentItem(slug);
  if (!item) {
    return {
      allowed: false,
      reason: `BLOCKED: Slug "${slug}" has no registered AI Business Manager review record. All content must go through central review first.`
    };
  }

  if (item.aiReview.status !== 'APPROVED BY AI' && item.aiReview.status !== 'OWNER REVIEW REQUIRED') {
    return {
      allowed: false,
      reason: `BLOCKED: AI Review status is "${item.aiReview.status}". Only AI-approved content can be reviewed or published.`
    };
  }

  if (item.ownerStatus !== 'approved') {
    return {
      allowed: false,
      reason: `BLOCKED: Content creative has not been approved by the Business Owner (Current Owner Status: ${item.ownerStatus}).`
    };
  }

  if (item.publishingAuth !== 'authorized') {
    return {
      allowed: false,
      reason: `BLOCKED: Owner approved the creative, but explicit PUBLISHING AUTHORIZATION has not been granted. Run "npm run manager -- --authorize-publish ${slug}" first.`
    };
  }

  return { allowed: true, reason: 'Content is verified, owner-approved, and authorized for publishing.' };
}

/**
 * Formats a clean, professional CLI review card for the business owner.
 */
export function formatCLIContentReviewCard(item: ReviewableContentItem): string {
  const rev = item.aiReview;
  const lines: string[] = [];

  lines.push(`================================================================================`);
  lines.push(`AI BUSINESS MANAGER REVIEW & OWNER APPROVAL DESK`);
  lines.push(`================================================================================`);
  lines.push(`Campaign:  ${item.title} (v${item.version})`);
  lines.push(`Slug:      ${item.slug}`);
  lines.push(`Product:   ${item.productDisplayName} | Target: ${item.targetAudience.toUpperCase()}`);
  lines.push(`Platforms: ${item.platforms.join(', ').toUpperCase()} | Type: ${item.contentType.toUpperCase()}`);
  lines.push(`--------------------------------------------------------------------------------`);
  lines.push(`AI Review: [ ${rev.status} ] (Score: ${rev.overallScore}/100)`);
  lines.push(`- Brand Review:         ${rev.criteria.brand_review.passed ? 'PASSED' : 'FLAGGED'} (${rev.criteria.brand_review.score}/100)`);
  lines.push(`- Product Accuracy:     ${rev.criteria.product_accuracy.passed ? 'PASSED' : 'FLAGGED'} (${rev.criteria.product_accuracy.score}/100)`);
  lines.push(`- Creative Quality:     ${rev.criteria.creative_quality.passed ? 'PASSED' : 'FLAGGED'} (${rev.criteria.creative_quality.score}/100)`);
  lines.push(`- Platform Readiness:   ${rev.criteria.platform_readiness.passed ? 'PASSED' : 'FLAGGED'} (${rev.criteria.platform_readiness.score}/100)`);
  lines.push(`- Marketing Quality:    ${rev.criteria.marketing_quality.passed ? 'PASSED' : 'FLAGGED'} (${rev.criteria.marketing_quality.score}/100)`);
  lines.push(`--------------------------------------------------------------------------------`);
  lines.push(`[DELIVERABLE FILE PATHS]`);
  if (item.deliverables.videoPath) {
    lines.push(`- Video Reel (9:16 MP4):     ${item.deliverables.videoPath}`);
  }
  for (const m of item.deliverables.mediaPaths) {
    lines.push(`- High-Res Image:            ${m}`);
  }
  if (item.deliverables.audioVoicePath) {
    lines.push(`- Neural Voiceover (MP3):    ${item.deliverables.audioVoicePath}`);
  }
  lines.push(`--------------------------------------------------------------------------------`);
  lines.push(`[CAMPAIGN COPYWRITING]`);
  lines.push(`Headline:  ${item.copy.headline.replace(/\n/g, ' ')}`);
  lines.push(`Triplet:   ${item.copy.attributeTriplet}`);
  lines.push(`CTA:       ${item.copy.cta}`);
  if (item.copy.instagramHook) {
    lines.push(`IG Hook:   ${item.copy.instagramHook}`);
  }
  lines.push(`Hashtags:  ${item.copy.hashtags.slice(0, 6).join(' ')}`);
  lines.push(`--------------------------------------------------------------------------------`);
  lines.push(`AI Review is complete. Please review the final content and confirm your decision:\n`);
  lines.push(`  [1] APPROVE         - Approve content creative for the next step`);
  lines.push(`  [2] REQUEST CHANGES - Provide revision feedback for internal agents`);
  lines.push(`  [3] REJECT          - Discard this version`);
  lines.push(`  [4] REGENERATE      - Create a fresh concept`);
  lines.push(`================================================================================`);

  return lines.join('\n');
}
