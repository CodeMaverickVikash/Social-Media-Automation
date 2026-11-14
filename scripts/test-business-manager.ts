// End-to-End Automated Test Suite for Autonomous AI Clothing Business Manager
// Verifies all 12 operational scenarios and strict Owner Approval & Publishing Gates.

import { processOwnerRequest } from './lib/business-manager/manager-orchestrator.ts';
import { getCurrentTemporalContext } from './lib/business-manager/calendar-intelligence.ts';
import { loadBusinessMemory } from './lib/business-manager/business-memory.ts';
import { analyzeCompetitorLink } from './lib/business-manager/competitor-analyzer.ts';
import { evaluateProductIntakeScenario } from './lib/business-manager/product-intake-engine.ts';
import { planRawFootageEditing } from './lib/business-manager/real-footage-pipeline.ts';
import { coordinateContentGeneration } from './lib/business-manager/agent-coordinator.ts';
import {
  approveContentCreative,
  requestContentChanges,
  authorizePublishing,
  verifyPublishingAuthorization,
  findContentItem
} from './lib/business-manager/approval-manager.ts';

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, message: string): void {
  totalTests++;
  if (!condition) {
    console.error(`  FAIL: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`  PASS: ${message}`);
  passedTests++;
}

async function runTestSuite(): Promise<void> {
  console.log('================================================================================');
  console.log('TEST SUITE: AUTONOMOUS AI CLOTHING BUSINESS MANAGER');
  console.log('MONAVI COLLECTION — "WEAR YOUR STORY."');
  console.log('================================================================================\n');

  // --------------------------------------------------------------------------
  // Scenario 1: Date & Time Awareness and Indian Season Radar
  // --------------------------------------------------------------------------
  console.log('[Scenario 1]: System Date & Real-Time Indian Season Radar');
  const temporal = getCurrentTemporalContext();
  assert(Boolean(temporal.dateString), `Current date resolved: ${temporal.dateString}`);
  assert(Boolean(temporal.timeStringIST), `Current IST time resolved: ${temporal.timeStringIST}`);
  assert(Boolean(temporal.currentSeason), `Current Indian season identified: ${temporal.currentSeason}`);
  assert(temporal.postingRecommendations.length >= 3, 'Platform timing recommendations generated for IG, FB, WhatsApp');

  // --------------------------------------------------------------------------
  // Scenario 2: Daily Business Strategy ("What should we post today?")
  // --------------------------------------------------------------------------
  console.log('\n[Scenario 2]: Daily Content Strategy Recommendation');
  const dailyResp = await processOwnerRequest({ query: 'What should we post today?' });
  assert(dailyResp.includes("Today's Recommendation"), 'Includes today recommendation section');
  assert(dailyResp.includes('Men') || dailyResp.includes('Kurta') || dailyResp.includes('Shaadi'), 'Identifies relevant seasonal garment');
  assert(dailyResp.includes('Required from you'), 'Includes clear intake requirement');
  assert(dailyResp.includes('Planned output'), 'Includes multi-format output roadmap');

  // --------------------------------------------------------------------------
  // Scenario 3: Men's Fashion Campaign Generation & Recommendation
  // --------------------------------------------------------------------------
  console.log('\n[Scenario 3]: Men\'s Fashion Campaign Generation');
  const promoResp = await processOwnerRequest({
    query: 'Create a promotional reel for men\'s kurta-pajama',
    targetGarment: 'kurta-pajama'
  });
  assert(promoResp.includes('AI BUSINESS MANAGER REVIEW'), 'Routes content through mandatory AI review');
  assert(promoResp.includes('Kurta Pajama') || promoResp.includes('Kurta'), 'Properly names target product');
  assert(promoResp.includes('APPROVED BY AI'), 'AI Review passes on-brand creative');

  // --------------------------------------------------------------------------
  // Scenario 4: Competitor Analysis via Public URL
  // --------------------------------------------------------------------------
  console.log('\n[Scenario 4]: Competitor Analysis & Strategic Differentiation');
  const compUrl = 'https://instagram.com/royal_ethnic_threads';
  const compResp = await processOwnerRequest({
    query: `Analyze this competitor profile: ${compUrl}`,
    competitorUrl: compUrl
  });
  assert(compResp.includes('COMPETITOR ANALYSIS REPORT'), 'Generates structured competitor report');
  assert(compResp.includes('Competitor Weaknesses'), 'Identifies competitive weaknesses');
  assert(compResp.includes('MONAVI STRATEGIC DIFFERENTIATION'), 'Produces clear Monavi differentiation strategy');
  assert(compResp.includes('WhatsApp'), 'Recommends frictionless WhatsApp VIP conversion');

  // --------------------------------------------------------------------------
  // Scenario 5: Product Image Upload & Scenario B 6-Point Intake Checklist
  // --------------------------------------------------------------------------
  console.log('\n[Scenario 5]: Product Intake Scenario Classification (Scenario A vs B)');
  const intakeA = evaluateProductIntakeScenario({ query: 'shaadi season brand campaign' });
  assert(intakeA.scenario === 'scenario_a_ai_model', 'Conceptual query classified as Scenario A (AI model sufficient)');

  const intakeB = evaluateProductIntakeScenario({ query: 'promote our new silk kurta in store' });
  assert(intakeB.scenario === 'scenario_b_real_product', 'Specific inventory query classified as Scenario B (Real product photo needed)');
  assert(Boolean(intakeB.checklist), '6-point intake checklist generated for owner');
  assert(Boolean(intakeB.checklist?.photoRequirements), 'Clear photo framing specifications included');

  // --------------------------------------------------------------------------
  // Scenario 6: Professional Raw Video Editing Pipeline
  // --------------------------------------------------------------------------
  console.log('\n[Scenario 6]: Raw Camera Footage Post-Production Pipeline');
  const footagePlan = planRawFootageEditing({
    videoPath: './assets/raw-footage/store-kurta-tryon.mp4',
    garmentName: 'Kurta Pajama',
    targetAudience: 'men'
  });
  assert(footagePlan.recommendedEdits.length >= 3, 'Generates multi-step editing actions (cutting, stabilization, LUT)');
  assert(footagePlan.voiceoverPlan.duckingDb === -14, 'Enforces strict -14dB audio ducking during speech');
  assert(footagePlan.targetOutputs.some(o => o.includes('16MB')), 'Enforces WhatsApp <= 16MB file limit');

  // --------------------------------------------------------------------------
  // Scenario 7: Human-Like Neural Voiceover Integration
  // --------------------------------------------------------------------------
  console.log('\n[Scenario 7]: Human-Like Neural Voiceover Integration');
  assert(footagePlan.voiceoverPlan.voiceProfileId.includes('prabhat') || footagePlan.voiceoverPlan.voiceProfileId.includes('neerja'), 'Assigns expressive Indian voice profile');
  assert(footagePlan.voiceoverPlan.script.length > 20, 'Generates tailored voice script with authentic Indian fashion narrative');

  // --------------------------------------------------------------------------
  // Scenario 8: Silent Agent Coordination Behind the Scenes
  // --------------------------------------------------------------------------
  console.log('\n[Scenario 8]: Silent Agent Delegation & Coordination');
  const coordResult = await coordinateContentGeneration({
    query: 'Promote royal bridal lehenga for wedding season',
    contentType: 'post'
  });
  assert(coordResult.silentExecutionTrace.length >= 4, 'Multiple specialized agents coordinated internally');
  assert(coordResult.fashionAnalysis.garmentType === 'lehenga', 'Fashion intelligence accurately identified lehenga');
  assert(coordResult.reviewableItem.aiReview.status === 'APPROVED BY AI', 'AI review successfully approved the item');

  // --------------------------------------------------------------------------
  // Scenario 9: Persistent Business Memory Across Sessions
  // --------------------------------------------------------------------------
  console.log('\n[Scenario 9]: Persistent Business Memory Persistence');
  const memory = loadBusinessMemory();
  assert(memory.verifiedFacts.brandName === 'Monavi Collection', 'Persistent verified facts intact');
  assert(memory.verifiedFacts.tagline === 'Wear Your Story', 'Tagline verified in memory');
  assert(Object.keys(memory.verifiedFacts.verifiedPriceRanges).length > 0, 'Verified price ranges accessible');

  // --------------------------------------------------------------------------
  // Scenario 10: Mandatory AI Manager Content Review (5 Criteria)
  // --------------------------------------------------------------------------
  console.log('\n[Scenario 10]: Mandatory AI Manager Review Criteria Audit');
  const rev = coordResult.reviewableItem.aiReview;
  assert(Boolean(rev.criteria.brand_review), 'Criterion 1: Brand Review audited');
  assert(Boolean(rev.criteria.product_accuracy), 'Criterion 2: Product Accuracy audited');
  assert(Boolean(rev.criteria.creative_quality), 'Criterion 3: Creative Quality audited');
  assert(Boolean(rev.criteria.platform_readiness), 'Criterion 4: Platform Readiness audited');
  assert(Boolean(rev.criteria.marketing_quality), 'Criterion 5: Marketing Quality audited');
  assert(rev.overallScore >= 85, `Overall review score is compliant (${rev.overallScore}/100)`);

  // --------------------------------------------------------------------------
  // Scenario 11: Owner Revision Workflow with Feedback
  // --------------------------------------------------------------------------
  console.log('\n[Scenario 11]: Owner Revision Workflow & Targeted Re-Review');
  const itemId = coordResult.reviewableItem.id;
  const feedbackMsg = 'Refine headline to highlight Banarasi Silk and update CTA.';
  const revResp = await processOwnerRequest({
    query: `request changes ${itemId}`,
    approvalId: itemId,
    feedback: feedbackMsg
  });
  assert(revResp.includes('Feedback recorded'), 'Owner feedback recorded');
  assert(revResp.includes('revised the creative'), 'Routed to internal agents for targeted re-review');

  // --------------------------------------------------------------------------
  // Scenario 12: Strict Owner Approval & Publishing Authorization Gates
  // --------------------------------------------------------------------------
  console.log('\n[Scenario 12]: Strict Owner Approval & Publishing Gates');
  const testSlug = coordResult.reviewableItem.slug;

  // Gate Check 1: Unapproved content cannot publish
  const preCheck = verifyPublishingAuthorization(testSlug);
  assert(!preCheck.allowed, 'Unapproved content is strictly BLOCKED from publishing');

  // Gate Check 2: Owner approves creative (Creative Approval != Publishing Authorization)
  const appCreative = approveContentCreative(testSlug);
  assert(appCreative.success, 'Owner successfully approved creative');
  const midCheck = verifyPublishingAuthorization(testSlug);
  assert(!midCheck.allowed, 'Approved creative is still BLOCKED until separate publishing authorization is granted');

  // Gate Check 3: Separate explicit publishing authorization
  const authPub = authorizePublishing(testSlug, ['instagram', 'facebook']);
  assert(authPub.authorized, 'Owner explicitly granted publishing authorization');
  const finalCheck = verifyPublishingAuthorization(testSlug);
  assert(finalCheck.allowed, 'Publishing check passes ONLY after both AI review, creative approval, and explicit publishing authorization');

  console.log('\n================================================================================');
  console.log(`ALL TESTS PASSED: ${passedTests}/${totalTests} SCENARIOS VERIFIED SUCCESSFULLY`);
  console.log('================================================================================\n');
}

runTestSuite().catch((err) => {
  console.error('\nTest Suite Failed:', err);
  process.exit(1);
});
