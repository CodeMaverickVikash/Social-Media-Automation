// Central Autonomous AI Clothing Business Manager Types
// Defines the schema for Level 1 (Owner), Level 2 (Manager), and Level 3 (Specialized Agents) orchestration.

export type OwnerIntent =
  | 'daily_strategy'
  | 'product_promotion'
  | 'competitor_analysis'
  | 'festival_campaign'
  | 'raw_footage_edit'
  | 'proactive_opportunity'
  | 'business_status'
  | 'general_consultation'
  | 'review_approval'
  | 'request_changes'
  | 'authorize_publish';

export interface BusinessManagerRequest {
  query: string;
  intent?: OwnerIntent;
  inputPhoto?: string;
  inputVideo?: string;
  competitorUrl?: string;
  targetGarment?: string;
  targetAudience?: string;
  targetPlatforms?: ('instagram' | 'facebook' | 'whatsapp')[];
  campaignTheme?: string;
  ownerNotes?: string;
  currentDate?: Date;
  approvalId?: string;
  feedback?: string;
  authorizedPlatforms?: ('instagram' | 'facebook' | 'whatsapp')[];
}

export type IndianSeason = 'winter' | 'spring' | 'summer' | 'monsoon' | 'festive_autumn';

export interface CalendarEvent {
  id: string;
  name: string;
  type: 'festival' | 'wedding_season' | 'seasonal_shift' | 'national_holiday' | 'commercial_event';
  season: IndianSeason;
  window: { startMonth: number; startDay: number; endMonth: number; endDay: number };
  daysAway: number;
  isCurrent: boolean;
  isUpcoming: boolean;
  urgency: 'immediate' | 'high' | 'planning' | 'informational';
  fashionFocus: string[];
  recommendedGarments: string[];
  recommendedColors: string[];
  marketingAngles: string[];
}

export interface PlatformTimingRecommendation {
  platform: 'instagram' | 'facebook' | 'whatsapp';
  recommendedTimes: string[];
  bestDays: string[];
  audienceActivityLevel: 'peak' | 'high' | 'moderate';
  rationale: string;
}

export interface CompetitorAuditResult {
  url: string;
  platform: 'instagram' | 'facebook' | 'creator_web' | 'unknown';
  handleOrName: string;
  accessibleData: {
    profileSummary: string;
    visualStyle: string;
    keyCategories: string[];
    postingCadence: string;
    topFormats: string[];
    hookThemes: string[];
    publicEngagementObservation: string;
  };
  comparativeAnalysis: {
    strengths: string[];
    weaknesses: string[];
    unmetCustomerNeeds: string[];
  };
  monaviDifferentiation: {
    strategicAngle: string;
    actionableRecommendations: string[];
    suggestedCounterContent: string[];
  };
  authLimitationNoted: boolean;
  limitationAdvice?: string;
  auditedAt: string;
}

export interface ProductIntakeChecklist {
  garmentTypeAndAudience: string;
  keyFeatures: string;
  photoRequirements: string[];
  lightingAndBackground: string;
  optionalCloseups: string;
  commercialDetails: string;
}

export interface ProductIntakeRecommendation {
  scenario: 'scenario_a_ai_model' | 'scenario_b_real_product';
  rationale: string;
  requiresPhotoUpload: boolean;
  checklist?: ProductIntakeChecklist;
}

export interface FootageProcessingPlan {
  rawFilePath: string;
  detectedFormat: {
    aspectRatio?: '9:16' | '16:9' | '1:1' | '4:5';
    durationSeconds?: number;
    hasAudio?: boolean;
    resolution?: string;
  };
  recommendedEdits: string[];
  brandOverlayPlan: {
    logoPlacement: string;
    headlineFont: string;
    colorLUT: string;
    ctaPill: string;
  };
  voiceoverPlan: {
    voiceProfileId: string;
    voiceName: string;
    language: string;
    duckingDb: number;
    script: string;
  };
  targetOutputs: string[];
}

// ============================================================================
// MANDATORY AI BUSINESS MANAGER CONTENT REVIEW & OWNER APPROVAL SYSTEM
// ============================================================================

export type ReviewCriterionName =
  | 'brand_review'
  | 'product_accuracy'
  | 'creative_quality'
  | 'platform_readiness'
  | 'marketing_quality';

export interface ReviewCriterionResult {
  criterion: ReviewCriterionName;
  displayName: string;
  passed: boolean;
  score: number; // 0 - 100
  details: string;
  findings: string[];
  issues: string[];
}

export type AIReviewStatus = 'APPROVED BY AI' | 'NEEDS IMPROVEMENT' | 'REJECTED' | 'OWNER REVIEW REQUIRED';

export interface ContentReviewResult {
  reviewId: string;
  status: AIReviewStatus;
  overallScore: number; // 0 - 100
  criteria: Record<ReviewCriterionName, ReviewCriterionResult>;
  summary: string;
  remainingLimitations: string[];
  fixRecommendations: string[];
  reviewedAt: string;
}

export type OwnerApprovalStatus = 'pending' | 'approved' | 'changes_requested' | 'rejected';
export type PublishingAuthStatus = 'unauthorized' | 'authorized';

export interface ReviewableContentItem {
  id: string;
  slug: string;
  title: string;
  version: number;
  productKey: string;
  productDisplayName: string;
  campaignTheme: string;
  targetAudience: string;
  platforms: ('instagram' | 'facebook' | 'whatsapp')[];
  contentType: 'post' | 'reel' | 'short_video' | 'campaign';
  workflow: 'workflowA_textOnly' | 'workflowB_productPreserved';
  copy: {
    headline: string;
    eyebrow?: string;
    attributeTriplet: string;
    cta: string;
    instagramHook?: string;
    instagramBody?: string;
    facebookPost?: string;
    whatsappMessage?: string;
    hashtags: string[];
  };
  deliverables: {
    mediaPaths: string[];
    videoPath?: string;
    audioVoicePath?: string;
    captionPaths?: string[];
  };
  aiReview: ContentReviewResult;
  ownerStatus: OwnerApprovalStatus;
  ownerFeedback?: string;
  publishingAuth: PublishingAuthStatus;
  authorizedPlatforms?: ('instagram' | 'facebook' | 'whatsapp')[];
  createdAt: string;
  updatedAt: string;
}

export interface BusinessMemory {
  verifiedFacts: {
    brandName: string;
    wordmark: string;
    descriptor: string;
    tagline: string;
    storeType: string;
    market: string;
    contact: {
      instagram: string;
      facebook: string;
      whatsapp: string;
      phone: string;
      website: string;
      address: string;
      storeHours: string;
    };
    verifiedPriceRanges: Record<string, string>;
    coreCollections: string[];
    lastUpdated: string;
  };
  workingAssumptions: {
    targetDemographics: string[];
    coreCustomerMotivations: string[];
    bestsellingCategories: string[];
    aestheticPreference: string;
    averageOrderCycleDays: number;
    lastUpdated: string;
  };
  temporaryNotes: Array<{
    id: string;
    note: string;
    priority: 'high' | 'medium' | 'low';
    createdAt: string;
    expiresAt?: string;
  }>;
  competitorDossiers: Record<string, CompetitorAuditResult>;
  campaignHistory: Array<{
    slug: string;
    title: string;
    date: string;
    category: string;
    modelComposition?: 'single' | 'duo_couple' | 'family';
    platforms: string[];
    status: 'draft' | 'rendered' | 'approved' | 'published';
    notes?: string;
  }>;
}

export interface ApprovalRequest {
  id: string;
  action: 'publish_to_buffer' | 'spend_budget' | 'send_customer_message' | 'alter_brand_tokens';
  title: string;
  details: string;
  requiresOwnerConfirmation: true;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface ManagerExecutiveBriefing {
  date: string;
  currentTimeIST: string;
  detectedIntent: OwnerIntent;
  executiveSummary: string;
  marketAndCalendarInsight: {
    season: IndianSeason;
    seasonDescription: string;
    activeOrUpcomingEvent: string;
    daysUntilEvent: number;
    opportunityDescription: string;
    timingGuidance: PlatformTimingRecommendation[];
  };
  productStrategy: ProductIntakeRecommendation;
  delegatedActions: Array<{
    agentOrSkill: string;
    actionTaken: string;
    outputSummary: string;
  }>;
  contentReviewItem?: ReviewableContentItem;
  creativeDeliverables?: {
    slug?: string;
    headline?: string;
    formatsAvailable?: string[];
    copySummary?: {
      instagramHook?: string;
      facebookMessage?: string;
      whatsappText?: string;
      hashtags?: string[];
    };
    mediaPaths?: string[];
    voiceSamplePath?: string;
  };
  competitorAudit?: CompetitorAuditResult;
  footagePlan?: FootageProcessingPlan;
  pendingApprovals: ApprovalRequest[];
  nextRecommendedActions: string[];
}
