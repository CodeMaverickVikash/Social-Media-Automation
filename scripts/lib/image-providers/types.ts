// Free & Local Image Generation Provider Layer Types
// 100% Free, Local-First, Zero-API Architecture for Monavi Collection.

export type ImageProviderId = 'local_editorial';

export type FashionModelPresentation =
  | 'single_male'
  | 'single_female'
  | 'single_bride'
  | 'single_groom'
  | 'single_child_girl'
  | 'single_child_boy'
  | 'duo_couple'
  | 'family'
  | 'group_runway'
  | 'mannequin_showroom'
  | 'ghost_mannequin';

export type FashionPoseMovement =
  | 'standing_poised'
  | 'walking_towards_camera'
  | 'runway_walk_turn'
  | 'seated_royal_armchair'
  | 'back_view_embroidery'
  | 'twirling_flare'
  | 'macro_fabric_closeup';

export interface ImageGenerationOptions {
  slug: string;
  prompt: string;
  negativePrompt?: string;
  aspectRatio: '4:5' | '9:16' | '1:1' | '16:9';
  targetWidth: number;
  targetHeight: number;
  numberOfImages?: number;
  outputFormat?: 'png' | 'jpeg';
  referenceImagePath?: string;
  workflowMode: 'workflowA_textOnly' | 'workflowB_productPreserved';
  modelPresentation?: FashionModelPresentation;
  poseMovement?: FashionPoseMovement;
  garmentDisplayName?: string;
  garmentCategory?: string;
  cameraSettings?: string;
  lightingSetup?: string;
  environmentSetting?: string;
  seed?: number;
  preferredProvider?: ImageProviderId;
}

export interface GeneratedImageFile {
  filePath: string;
  relativeFilePath: string;
  width: number;
  height: number;
  format: 'png' | 'jpeg';
  buffer?: Buffer;
}

export interface ImageProviderResult {
  success: boolean;
  provider: ImageProviderId;
  model: string;
  images: GeneratedImageFile[];
  latencyMs: number;
  isAiGenerated: boolean;
  provenance: {
    generator: string;
    model: string;
    prompt: string;
    referencePreserved?: boolean;
    timestamp: string;
  };
  error?: string;
  warning?: string;
}

export interface ImageProviderCapabilities {
  id: ImageProviderId;
  name: string;
  models: string[];
  defaultModel: string;
  supportsReferenceImages: boolean;
  supportsInpainting: boolean;
  supportsPersonGeneration: boolean;
  supportsMultiModelComposition: boolean;
  maxResolution: string;
  aspectRatiosSupported: string[];
  latencyTier: 'fast' | 'moderate' | 'slow';
  costTier: 'free_local';
  isConfigured: boolean;
  credentialEnvVar: string;
  description: string;
}
