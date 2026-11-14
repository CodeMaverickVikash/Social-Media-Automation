// Central Autonomous AI Clothing Business Manager Orchestrator
// The single conversational interface for the Business Owner in the CLI terminal.
// Understands business requests, checks date/calendar, coordinates internal agents, and presents consolidated briefings.

import type { BusinessManagerRequest, ManagerExecutiveBriefing, OwnerIntent } from './types.ts';
import { getCurrentTemporalContext } from './calendar-intelligence.ts';
import { loadBusinessMemory, loadPendingApprovals } from './business-memory.ts';
import { analyzeCompetitorLink } from './competitor-analyzer.ts';
import { evaluateProductIntakeScenario, validateUploadedProductPhoto } from './product-intake-engine.ts';
import { planRawFootageEditing } from './real-footage-pipeline.ts';
import { coordinateContentGeneration } from './agent-coordinator.ts';
import {
  approveContentCreative,
  requestContentChanges,
  rejectContentCreative,
  authorizePublishing,
  getPendingOwnerApprovals,
  formatCLIContentReviewCard
} from './approval-manager.ts';

/**
 * Detects the owner's primary intent from natural language or explicit parameters.
 */
export function detectOwnerIntent(request: BusinessManagerRequest): OwnerIntent {
  if (request.intent) return request.intent;

  const q = request.query.toLowerCase();

  if (q.includes('authorize') || (q.includes('publish') && !q.includes('what should') && !q.includes('unauthorized'))) {
    return 'authorize_publish';
  }
  if (q.includes('approve') && !q.includes('review') && !q.includes('request')) {
    if (q.includes('publish') || q.includes('schedule')) return 'authorize_publish';
    return 'review_approval';
  }
  if (q.includes('request change') || q.includes('make change') || q.includes('revision') || q.includes('feedback')) {
    return 'request_changes';
  }
  if (q.includes('what should we post') || q.includes('post today') || q.includes('today recommendation') || q.includes('daily')) {
    return 'daily_strategy';
  }
  if (q.includes('competitor') || q.includes('instagram.com') || q.includes('facebook.com') || request.competitorUrl) {
    return 'competitor_analysis';
  }
  if (q.includes('market') || q.includes('trends') || q.includes('fashion landscape')) {
    return 'proactive_opportunity';
  }
  if (q.includes('photo') && (q.includes('need') || q.includes('checklist') || q.includes('require'))) {
    return 'general_consultation';
  }
  if (q.includes('footage') || q.includes('raw video') || q.includes('uploaded video') || request.inputVideo) {
    return 'raw_footage_edit';
  }
  if (q.includes('campaign') || q.includes('wedding season') || q.includes('shaadi') || q.includes('diwali') || q.includes('festival')) {
    return 'festival_campaign';
  }
  if (q.includes('status') || q.includes('performance') || q.includes('previous') || q.includes('memory') || q.includes('history')) {
    return 'business_status';
  }
  if (q.includes('promote') || q.includes('reel') || q.includes('create') || q.includes('post') || request.targetGarment || request.inputPhoto) {
    return 'product_promotion';
  }

  return 'daily_strategy';
}

/**
 * Main execution entry point for the Central AI Clothing Business Manager.
 */
export async function processOwnerRequest(request: BusinessManagerRequest): Promise<string> {
  const temporal = getCurrentTemporalContext(request.currentDate);
  const memory = loadBusinessMemory();
  const intent = detectOwnerIntent(request);

  // --------------------------------------------------------------------------
  // 1. OWNER DECISION: APPROVE CONTENT CREATIVE
  // --------------------------------------------------------------------------
  if (intent === 'review_approval' && request.approvalId) {
    const res = approveContentCreative(request.approvalId);
    return `AI BUSINESS MANAGER RESPONSE:\n\n${res.message}\n\nTo authorize publishing to social channels, run:\nnpm run manager -- --authorize-publish ${request.approvalId} --platforms instagram,facebook`;
  }

  // --------------------------------------------------------------------------
  // 2. OWNER DECISION: REQUEST CHANGES / REVISION
  // --------------------------------------------------------------------------
  if (intent === 'request_changes' && request.approvalId) {
    const feedback = request.feedback || request.ownerNotes || 'Refine headline and emphasize pure silk authenticity.';
    const res = requestContentChanges(request.approvalId, feedback);

    // Re-run internal agent revision silently
    const reGen = await coordinateContentGeneration({
      query: `Revise ${request.approvalId} based on owner feedback: ${feedback}`,
      slug: request.approvalId,
      contentType: 'reel'
    });

    const card = formatCLIContentReviewCard(reGen.reviewableItem);
    return `AI BUSINESS MANAGER RESPONSE:\n\n${res.message}\n\nInternal agents revised the creative to v${reGen.reviewableItem.version} and re-submitted for AI Review.\n\n${card}`;
  }

  // --------------------------------------------------------------------------
  // 3. OWNER DECISION: SEPARATE PUBLISHING AUTHORIZATION
  // --------------------------------------------------------------------------
  if (intent === 'authorize_publish' && request.approvalId) {
    const platforms = request.authorizedPlatforms || ['instagram', 'facebook'];
    const res = authorizePublishing(request.approvalId, platforms);
    if (!res.authorized) {
      return `AI BUSINESS MANAGER RESPONSE:\n\n${res.message}`;
    }
    return `AI BUSINESS MANAGER RESPONSE:\n\n${res.message}\n\nNext Step: GitHub Action workflow will queue this content in Buffer for [${platforms.join(', ')}]. WhatsApp delivery assets are prepared in output/whatsapp/${request.approvalId}/ for direct broadcast.`;
  }

  // --------------------------------------------------------------------------
  // 4. COMPETITOR ANALYSIS & PUBLIC LINK AUDIT
  // --------------------------------------------------------------------------
  if (intent === 'competitor_analysis' || request.competitorUrl) {
    const url = request.competitorUrl || request.query.match(/https?:\/\/[^\s]+/)?.[0] || 'https://instagram.com/competitor_fashion';
    const audit = analyzeCompetitorLink({ url, notes: request.ownerNotes });

    const lines: string[] = [];
    lines.push(`================================================================================`);
    lines.push(`AI CLOTHING BUSINESS MANAGER — COMPETITOR ANALYSIS REPORT`);
    lines.push(`================================================================================`);
    lines.push(`Target Profile:     ${audit.handleOrName} (${audit.platform.toUpperCase()})`);
    lines.push(`URL:                ${audit.url}`);
    lines.push(`Audit Timestamp:    ${temporal.dateString}, ${temporal.timeStringIST}`);
    lines.push(`--------------------------------------------------------------------------------`);
    lines.push(`[ACCESSIBLE PUBLIC DATA & OBSERVATIONS]`);
    lines.push(`- Profile Focus:    ${audit.accessibleData.profileSummary}`);
    lines.push(`- Visual Style:     ${audit.accessibleData.visualStyle}`);
    lines.push(`- Content Formats:  ${audit.accessibleData.topFormats.join(', ')}`);
    lines.push(`- Cadence & Hooks:  ${audit.accessibleData.postingCadence} | Hooks: ${audit.accessibleData.hookThemes.join(', ')}`);
    lines.push(`- Engagement Note:  ${audit.accessibleData.publicEngagementObservation}`);
    lines.push(`--------------------------------------------------------------------------------`);
    lines.push(`[COMPARATIVE EVALUATION VS MONAVI COLLECTION]`);
    lines.push(`Competitor Weaknesses Identified:`);
    for (const w of audit.comparativeAnalysis.weaknesses) lines.push(`  • ${w}`);
    lines.push(`Unmet Customer Needs in Category:`);
    for (const u of audit.comparativeAnalysis.unmetCustomerNeeds) lines.push(`  • ${u}`);
    lines.push(`--------------------------------------------------------------------------------`);
    lines.push(`[MONAVI STRATEGIC DIFFERENTIATION & ACTION PLAN]`);
    lines.push(`Core Angle: ${audit.monaviDifferentiation.strategicAngle}`);
    for (const r of audit.monaviDifferentiation.actionableRecommendations) lines.push(`  ${r}`);
    lines.push(`--------------------------------------------------------------------------------`);
    lines.push(`Recommended Counter-Campaign to Deploy:`);
    for (const c of audit.monaviDifferentiation.suggestedCounterContent) lines.push(`  → ${c}`);
    lines.push(`================================================================================`);

    return lines.join('\n');
  }

  // --------------------------------------------------------------------------
  // 5. REAL CAMERA FOOTAGE EDITING WORKFLOW
  // --------------------------------------------------------------------------
  if (intent === 'raw_footage_edit' || request.inputVideo) {
    const videoPath = request.inputVideo || './assets/raw-footage/store-kurta-clip.mp4';
    const plan = planRawFootageEditing({
      videoPath,
      garmentName: request.targetGarment || "Men's Kurta-Pajama",
      targetAudience: request.targetAudience || 'men'
    });

    const lines: string[] = [];
    lines.push(`================================================================================`);
    lines.push(`AI CLOTHING BUSINESS MANAGER — RAW FOOTAGE POST-PRODUCTION PLAN`);
    lines.push(`================================================================================`);
    lines.push(`Input Footage:       ${plan.rawFilePath}`);
    lines.push(`Detected Format:     ${plan.detectedFormat.aspectRatio} | Resolution: ${plan.detectedFormat.resolution}`);
    lines.push(`--------------------------------------------------------------------------------`);
    lines.push(`[INTERNAL POST-PRODUCTION ACTIONS]`);
    for (const edit of plan.recommendedEdits) lines.push(`  • ${edit}`);
    lines.push(`--------------------------------------------------------------------------------`);
    lines.push(`[BRANDING & OPTICAL SPECIFICATIONS]`);
    lines.push(`- Logo Lockup:       ${plan.brandOverlayPlan.logoPlacement}`);
    lines.push(`- Typography:        ${plan.brandOverlayPlan.headlineFont}`);
    lines.push(`- Color LUT:         ${plan.brandOverlayPlan.colorLUT}`);
    lines.push(`- CTA Pill:          ${plan.brandOverlayPlan.ctaPill}`);
    lines.push(`--------------------------------------------------------------------------------`);
    lines.push(`[AI NEURAL VOICEOVER INTEGRATION]`);
    lines.push(`- Voice Profile:     ${plan.voiceoverPlan.voiceName} (${plan.voiceoverPlan.language})`);
    lines.push(`- Audio Ducking:     ${plan.voiceoverPlan.duckingDb}dB during speech`);
    lines.push(`- Voiceover Script:  "${plan.voiceoverPlan.script}"`);
    lines.push(`--------------------------------------------------------------------------------`);
    lines.push(`[PLANNED PLATFORM EXPORTS]`);
    for (const out of plan.targetOutputs) lines.push(`  ✓ ${out}`);
    lines.push(`================================================================================`);
    lines.push(`Status: Video assembly planned. Submit footage or approve rendering with "npm run manager -- --promote 'men's kurta-pajama' --input-video ${videoPath}".`);

    return lines.join('\n');
  }

  // --------------------------------------------------------------------------
  // 6. BUSINESS STATUS & MEMORY INSPECTION
  // --------------------------------------------------------------------------
  if (intent === 'business_status') {
    const pending = getPendingOwnerApprovals();
    const lines: string[] = [];
    lines.push(`================================================================================`);
    lines.push(`MONAVI COLLECTION — AI BUSINESS MANAGER STATUS OVERVIEW`);
    lines.push(`================================================================================`);
    lines.push(`Current Date & Time: ${temporal.dateString}, ${temporal.timeStringIST}`);
    lines.push(`Active Season:       ${temporal.currentSeason.toUpperCase()} — ${temporal.seasonDescription}`);
    lines.push(`Primary Focus:       ${temporal.primaryEvent.name} (${temporal.primaryEvent.urgency.toUpperCase()})`);
    lines.push(`--------------------------------------------------------------------------------`);
    lines.push(`[PERSISTENT BUSINESS MEMORY SNAPSHOT]`);
    lines.push(`- Brand:             ${memory.verifiedFacts.brandName} ("${memory.verifiedFacts.tagline}")`);
    lines.push(`- Verified Prices:   ${Object.keys(memory.verifiedFacts.verifiedPriceRanges).length} categories catalogued`);
    lines.push(`- Competitor Dossiers: ${Object.keys(memory.competitorDossiers).length} brands analyzed`);
    lines.push(`- Campaign History:  ${memory.campaignHistory.length} campaigns recorded`);
    lines.push(`--------------------------------------------------------------------------------`);
    lines.push(`[PENDING OWNER APPROVALS: ${pending.length} ITEMS]`);
    if (pending.length === 0) {
      lines.push(`✓ No content awaiting review. System is ready for today's recommendations.`);
    } else {
      for (const p of pending) {
        lines.push(`  • [${p.id}] ${p.title} (${p.slug}) — AI Review: ${p.aiReview.status} (v${p.version})`);
      }
      lines.push(`\nReview any item by running: npm run manager -- --review-approvals`);
    }
    lines.push(`================================================================================`);
    return lines.join('\n');
  }

  // --------------------------------------------------------------------------
  // 7. PRODUCT PROMOTION OR FESTIVAL CAMPAIGN (CREATIVE GENERATION + AI REVIEW)
  // --------------------------------------------------------------------------
  if (intent === 'product_promotion' || intent === 'festival_campaign') {
    const intake = evaluateProductIntakeScenario({
      query: request.query,
      garmentName: request.targetGarment,
      hasInputPhoto: Boolean(request.inputPhoto),
      inputPhotoPath: request.inputPhoto
    });

    // If Scenario B and no photo provided yet: present checklist
    if (intake.scenario === 'scenario_b_real_product' && intake.requiresPhotoUpload && intake.checklist) {
      const lines: string[] = [];
      lines.push(`AI CLOTHING BUSINESS MANAGER:`);
      lines.push(``);
      lines.push(`Product Promotion Requirement: Scenario B (Real Product Photography Required)`);
      lines.push(`Rationale: ${intake.rationale}`);
      lines.push(``);
      lines.push(`Please provide the product photo using the 6-Point Intake Checklist:`);
      lines.push(`1. Garment & Audience:   ${intake.checklist.garmentTypeAndAudience}`);
      lines.push(`2. Key Features:         ${intake.checklist.keyFeatures}`);
      lines.push(`3. Photo Framing:        ${intake.checklist.photoRequirements.join(' ')}`);
      lines.push(`4. Lighting/Background:  ${intake.checklist.lightingAndBackground}`);
      lines.push(`5. Macro Close-Ups:      ${intake.checklist.optionalCloseups}`);
      lines.push(`6. Commercial Details:   ${intake.checklist.commercialDetails}`);
      lines.push(``);
      lines.push(`Run: npm run manager -- --promote "${request.targetGarment || 'kurta-pajama'}" --input-photo "./path/to/garment.jpg"`);
      return lines.join('\n');
    }

    // Coordinate internal agents silently to draft & review content
    const genResult = await coordinateContentGeneration({
      query: request.query,
      garmentName: request.targetGarment,
      targetAudience: request.targetAudience,
      platforms: request.targetPlatforms,
      inputPhotoPath: request.inputPhoto
    });

    const card = formatCLIContentReviewCard(genResult.reviewableItem);
    return `AI CLOTHING BUSINESS MANAGER:\n\n${card}`;
  }

  // --------------------------------------------------------------------------
  // 8. DAILY BUSINESS STRATEGY ("What should we post today?")
  // --------------------------------------------------------------------------
  const primaryEvent = temporal.primaryEvent;
  const timing = temporal.postingRecommendations[0]!;

  const lines: string[] = [];
  lines.push(`AI CLOTHING BUSINESS MANAGER:`);
  lines.push(``);
  lines.push(`Today's Recommendation (${temporal.dateString}):`);
  lines.push(``);
  lines.push(`Product:    Men's Silk Kurta-Pajama & Festive Nehru Jacket`);
  lines.push(`Platform:   Instagram + Facebook + WhatsApp`);
  lines.push(`Format:     High-Impact Editorial Fashion Reel (9:16) + Feed Master (4:5)`);
  lines.push(`Objective:  Commercial Shaadi Season & Festive Wardrobe Consideration`);
  lines.push(``);
  lines.push(`Why:`);
  lines.push(`Active Season: ${temporal.currentSeason.toUpperCase()} — ${primaryEvent.name}.`);
  lines.push(`Wedding shopping intent is at peak volume across North & Central India.`);
  lines.push(`Optimal posting window today: ${timing.recommendedTimes[0]}.`);
  lines.push(``);
  lines.push(`Creative & Model Direction:`);
  lines.push(`- Model Protocol: Duo/Couple Composition (Handsome groom model in ivory silk kurta accompanied by bride in wine lehenga).`);
  lines.push(`- Optical Standard: 50mm f/2.8 lens aesthetics with warm sandstone haveli courtyard lighting.`);
  lines.push(`- Audio: Prabhat Neural (Regal Indian English) voiceover with -14dB background sitar ducking.`);
  lines.push(``);
  lines.push(`Required from you:`);
  lines.push(`- Scenario A applies (Autonomous photorealistic campaign visuals ready).`);
  lines.push(`- If you have an exclusive in-store arrival to promote instead, reply with its photo path.`);
  lines.push(``);
  lines.push(`Planned output:`);
  lines.push(`- 1080×1920 MP4 Fashion Reel (Instagram/Facebook)`);
  lines.push(`- 1080×1350 High-Contrast Editorial Feed Post`);
  lines.push(`- Compressed WhatsApp Status (<= 16MB)`);
  lines.push(`- Product-Manager grade caption with frictionless WhatsApp Concierge CTA`);
  lines.push(``);
  lines.push(`To generate this campaign creative for mandatory AI review, run:`);
  lines.push(`npm run manager -- --promote "men's kurta-pajama" --campaign "shaadi-season"`);

  return lines.join('\n');
}
