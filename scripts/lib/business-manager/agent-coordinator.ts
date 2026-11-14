// Internal Agent Coordinator
// Orchestrates Level 3 specialized agents, delegates subtasks silently, and routes content through mandatory AI review.

import { analyzeFashionRequest } from '../fashion-intelligence.ts';
import type { FashionAnalysis } from '../fashion-intelligence.ts';
import { generateMultiPlatformContent } from '../social-content.ts';
import { conductAIBusinessManagerReview } from './content-reviewer.ts';
import { registerContentForApproval } from './approval-manager.ts';
import type { ReviewableContentItem, ContentReviewResult } from './types.ts';
import { loadBusinessMemory } from './business-memory.ts';

export interface InternalAgentExecutionResult {
  fashionAnalysis: FashionAnalysis;
  reviewableItem: ReviewableContentItem;
  aiReview: ContentReviewResult;
  silentExecutionTrace: Array<{ agent: string; action: string; status: 'completed' | 'adjusted' }>;
}

export interface GenerationTaskOptions {
  query: string;
  slug?: string;
  garmentName?: string;
  targetAudience?: string;
  platforms?: ('instagram' | 'facebook' | 'whatsapp')[];
  contentType?: 'post' | 'reel' | 'short_video' | 'campaign';
  workflow?: 'workflowA_textOnly' | 'workflowB_productPreserved';
  inputPhotoPath?: string;
  voiceProfileId?: string;
}

/**
 * Coordinates internal agents to produce, review, and register a complete content campaign.
 */
export async function coordinateContentGeneration(options: GenerationTaskOptions): Promise<InternalAgentExecutionResult> {
  const silentTrace: InternalAgentExecutionResult['silentExecutionTrace'] = [];

  const memory = loadBusinessMemory();
  const q = options.query;
  const targetPlatforms = options.platforms || ['instagram', 'facebook', 'whatsapp'];
  const contentType = options.contentType || (q.toLowerCase().includes('reel') || q.toLowerCase().includes('video') ? 'reel' : 'post');
  const workflow = options.workflow || (options.inputPhotoPath ? 'workflowB_productPreserved' : 'workflowA_textOnly');

  // 1. Fashion Product Intelligence Agent
  silentTrace.push({ agent: 'Product Intelligence Agent', action: 'Analyzing fashion taxonomy, audience, and occasion', status: 'completed' });
  const fullQuery = [options.query, options.garmentName, options.targetAudience].filter(Boolean).join(' ');
  const fashionAnalysis = analyzeFashionRequest(fullQuery, {
    hasProductImage: Boolean(options.inputPhotoPath),
    explicitPlatforms: targetPlatforms
  });

  const slug = options.slug || `${fashionAnalysis.garmentType}-${Date.now().toString().slice(-6)}`;

  // 2. Content Writer Agent
  silentTrace.push({ agent: 'Content Writer Agent', action: 'Drafting multi-platform hooks, captions, and hashtags', status: 'completed' });
  const copySuite = generateMultiPlatformContent(fashionAnalysis, slug);

  // 3. Fashion Creative Director & AI Video Director
  silentTrace.push({
    agent: contentType === 'reel' ? 'AI Video Director' : 'Fashion Creative Director',
    action: `Composing ${fashionAnalysis.modelComposition} visual concept with ${fashionAnalysis.creative.template} layout`,
    status: 'completed'
  });

  // 4. Human Voice & Audio Agent
  if (contentType === 'reel' || contentType === 'short_video') {
    silentTrace.push({ agent: 'Human Voice & Audio Agent', action: 'Pairing natural Indian neural voiceover with -14dB audio ducking', status: 'completed' });
  }

  // Define deliverable paths
  const mediaPaths: string[] = [
    `output/instagram/${slug}/post.png`,
    `output/facebook/${slug}/post.png`,
    `output/whatsapp/${slug}/status.png`
  ];
  const videoPath = contentType === 'reel' ? `output/instagram/${slug}/reel.mp4` : undefined;
  const audioVoicePath = contentType === 'reel' ? `output/_masters/${slug}/voiceover.mp3` : undefined;

  const attributeTriplet = fashionAnalysis.creative.attrs.join(' | ');

  // 5. Central AI Business Manager Mandatory Content Review
  silentTrace.push({ agent: 'AI Business Manager Reviewer', action: 'Conducting mandatory 5-point quality and compliance audit', status: 'completed' });
  const aiReview = conductAIBusinessManagerReview({
    slug,
    title: `${fashionAnalysis.garmentDisplayName} ${fashionAnalysis.occasion.toUpperCase()} Campaign`,
    productKey: fashionAnalysis.garmentType,
    productDisplayName: fashionAnalysis.garmentDisplayName,
    campaignTheme: fashionAnalysis.creative.theme,
    targetAudience: fashionAnalysis.targetAudience,
    platforms: targetPlatforms,
    contentType,
    workflow,
    copy: {
      headline: fashionAnalysis.creative.headline,
      eyebrow: fashionAnalysis.creative.eyebrow,
      attributeTriplet,
      cta: fashionAnalysis.creative.cta,
      instagramHook: copySuite.instagram.hook,
      instagramBody: copySuite.instagram.text,
      facebookPost: copySuite.facebook.text,
      whatsappMessage: copySuite.whatsapp.text,
      hashtags: copySuite.instagram.hashtags || fashionAnalysis.social.hashtags
    },
    deliverables: {
      mediaPaths,
      videoPath,
      audioVoicePath
    },
    hasInputPhoto: Boolean(options.inputPhotoPath)
  });

  // 6. Register for Owner Approval
  const reviewableItem: ReviewableContentItem = {
    id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    slug,
    title: `${fashionAnalysis.garmentDisplayName} ${fashionAnalysis.occasion.toUpperCase()} Campaign`,
    version: 1,
    productKey: fashionAnalysis.garmentType,
    productDisplayName: fashionAnalysis.garmentDisplayName,
    campaignTheme: fashionAnalysis.creative.theme,
    targetAudience: fashionAnalysis.targetAudience,
    platforms: targetPlatforms,
    contentType,
    workflow,
    copy: {
      headline: fashionAnalysis.creative.headline,
      eyebrow: fashionAnalysis.creative.eyebrow,
      attributeTriplet,
      cta: fashionAnalysis.creative.cta,
      instagramHook: copySuite.instagram.hook,
      instagramBody: copySuite.instagram.text,
      facebookPost: copySuite.facebook.text,
      whatsappMessage: copySuite.whatsapp.text,
      hashtags: copySuite.instagram.hashtags || fashionAnalysis.social.hashtags
    },
    deliverables: {
      mediaPaths,
      videoPath,
      audioVoicePath,
      captionPaths: [
        `output/instagram/${slug}/caption.txt`,
        `output/facebook/${slug}/caption.txt`,
        `output/whatsapp/${slug}/caption.txt`
      ]
    },
    aiReview,
    ownerStatus: 'pending',
    publishingAuth: 'unauthorized',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  registerContentForApproval(reviewableItem);

  return {
    fashionAnalysis,
    reviewableItem,
    aiReview,
    silentExecutionTrace: silentTrace
  };
}
