// Comprehensive Reusable Human Voice Profiles Library for Monavi Collection
// Defines specialized male, female, kids, and narrative profiles with cross-provider mappings.

import type { VoiceProfile, VoiceProfileId, VoiceIdentity } from './types.ts';

export const MONAVI_VOICE_PROFILES: Record<VoiceProfileId, VoiceProfile> = {
  // ─── FEMALE PROFILES ────────────────────────────────────────────────────────
  female_premium: {
    id: 'female_premium',
    name: 'Royal Monavi Sovereign (Female Premium)',
    gender: 'female',
    age: 'mature',
    description: 'Sophisticated, royal, velvety and graceful with rich aristocratic presence for bridal and couture.',
    defaultLanguage: 'en-IN',
    supportedLanguages: ['en-IN', 'hi-IN', 'hinglish'],
    defaultEmotion: 'luxury',
    recommendedCategories: ['bridal', 'lehenga', 'banarasi', 'kanjeevaram', 'royal_festive'],
    providerConfigs: {
      edge: {
        voiceId: 'en-IN-NeerjaExpressiveNeural',
        rate: 0.94,
        pitch: '-2Hz',
        style: 'expressive'
      },
      openai: {
        voiceId: 'nova',
        rate: 0.92
      },
      elevenlabs: {
        voiceId: '21m00Tcm4TlvDq8ikWAM', // Rachel / Luxury female
        stability: 0.75,
        similarityBoost: 0.85
      },
      google: {
        voiceId: 'en-IN-Neural2-A',
        rate: 0.92,
        pitch: '-2st'
      }
    }
  },

  female_young: {
    id: 'female_young',
    name: 'Modern Festive Chic (Female Young)',
    gender: 'female',
    age: 'young',
    description: 'Friendly, youthful, expressive, and sparkling. Perfect for modern festive and casual ethnic lines.',
    defaultLanguage: 'en-IN',
    supportedLanguages: ['en-IN', 'hi-IN', 'hinglish'],
    defaultEmotion: 'excitement',
    recommendedCategories: ['festive', 'sharara', 'kurtis', 'contemporary_ethnic', 'casual'],
    providerConfigs: {
      edge: {
        voiceId: 'en-IN-NeerjaExpressiveNeural',
        rate: 1.04,
        pitch: '+2Hz',
        style: 'cheerful'
      },
      openai: {
        voiceId: 'shimmer',
        rate: 1.02
      },
      elevenlabs: {
        voiceId: 'EXAVITQu4vr4xnSDxMaL', // Bella
        stability: 0.65,
        similarityBoost: 0.80
      },
      google: {
        voiceId: 'en-IN-Neural2-D',
        rate: 1.02,
        pitch: '+1st'
      }
    }
  },

  female_mature: {
    id: 'female_mature',
    name: 'Confident Heritage Matron (Female Mature)',
    gender: 'female',
    age: 'mature',
    description: 'Poised, confident, articulate, and deeply trustworthy. Great for heirloom sarees and classic handlooms.',
    defaultLanguage: 'en-IN',
    supportedLanguages: ['en-IN', 'hi-IN', 'hinglish'],
    defaultEmotion: 'confidence',
    recommendedCategories: ['sarees', 'chanderi', 'handloom', 'traditional', 'formal'],
    providerConfigs: {
      edge: {
        voiceId: 'en-IN-NeerjaNeural',
        rate: 0.96,
        pitch: '-1Hz'
      },
      openai: {
        voiceId: 'alloy',
        rate: 0.96
      },
      elevenlabs: {
        voiceId: 'AZnzlk1XvdvUeBnXmlld', // Domi
        stability: 0.80,
        similarityBoost: 0.75
      },
      google: {
        voiceId: 'en-IN-Neural2-A',
        rate: 0.96
      }
    }
  },

  female_casual: {
    id: 'female_casual',
    name: 'Boutique Stylist (Female Casual)',
    gender: 'female',
    age: 'young',
    description: 'Warm, relatable, conversational, like chatting with your personal in-store fashion advisor.',
    defaultLanguage: 'en-IN',
    supportedLanguages: ['en-IN', 'hi-IN', 'hinglish'],
    defaultEmotion: 'happiness',
    recommendedCategories: ['everyday', 'casual', 'kurtas', 'workwear', 'fusion'],
    providerConfigs: {
      edge: {
        voiceId: 'en-IN-NeerjaNeural',
        rate: 1.00,
        pitch: '+0Hz'
      },
      openai: {
        voiceId: 'nova',
        rate: 1.00
      },
      elevenlabs: {
        voiceId: '21m00Tcm4TlvDq8ikWAM',
        stability: 0.65,
        similarityBoost: 0.75
      },
      google: {
        voiceId: 'en-IN-Neural2-D',
        rate: 1.00
      }
    }
  },

  // ─── MALE PROFILES ──────────────────────────────────────────────────────────
  male_premium: {
    id: 'male_premium',
    name: 'Heritage Royalty (Male Premium)',
    gender: 'male',
    age: 'mature',
    description: 'Deep, resonant, aristocratic baritone with royal poise. Designed for sherwanis, bandhgalas and groomswear.',
    defaultLanguage: 'en-IN',
    supportedLanguages: ['en-IN', 'hi-IN', 'hinglish'],
    defaultEmotion: 'luxury',
    recommendedCategories: ['sherwani', 'bandhgala', 'groomswear', 'silk_kurta', 'tuxedo'],
    providerConfigs: {
      edge: {
        voiceId: 'en-IN-PrabhatNeural',
        rate: 0.93,
        pitch: '-4Hz'
      },
      openai: {
        voiceId: 'onyx',
        rate: 0.92
      },
      elevenlabs: {
        voiceId: 'VR6AewLTigWG4xSOukaG', // Arnold / Deep baritone
        stability: 0.85,
        similarityBoost: 0.85
      },
      google: {
        voiceId: 'en-IN-Neural2-B',
        rate: 0.92,
        pitch: '-3st'
      }
    }
  },

  male_young: {
    id: 'male_young',
    name: 'Modern Dapper (Male Young)',
    gender: 'male',
    age: 'young',
    description: 'Energetic, charismatic, and stylishly conversational. Suited for modern menswear, festive kurtas and indo-western.',
    defaultLanguage: 'en-IN',
    supportedLanguages: ['en-IN', 'hi-IN', 'hinglish'],
    defaultEmotion: 'excitement',
    recommendedCategories: ['kurta_pajama', 'indo_western', 'shirts', 'festive_men', 'casual'],
    providerConfigs: {
      edge: {
        voiceId: 'en-IN-PrabhatNeural',
        rate: 1.03,
        pitch: '+1Hz'
      },
      openai: {
        voiceId: 'fable',
        rate: 1.02
      },
      elevenlabs: {
        voiceId: 'ErXwobaYiN019PkySvjV', // Antoni
        stability: 0.70,
        similarityBoost: 0.80
      },
      google: {
        voiceId: 'en-IN-Neural2-C',
        rate: 1.02,
        pitch: '+1st'
      }
    }
  },

  male_mature: {
    id: 'male_mature',
    name: 'Patriarch Elegance (Male Mature)',
    gender: 'male',
    age: 'mature',
    description: 'Confident, dignified, natural, and authoritative with a reassuring tone.',
    defaultLanguage: 'en-IN',
    supportedLanguages: ['en-IN', 'hi-IN', 'hinglish'],
    defaultEmotion: 'confidence',
    recommendedCategories: ['formal', 'heritage_men', 'nehru_jackets', 'suits'],
    providerConfigs: {
      edge: {
        voiceId: 'en-IN-PrabhatNeural',
        rate: 0.96,
        pitch: '-2Hz'
      },
      openai: {
        voiceId: 'echo',
        rate: 0.95
      },
      elevenlabs: {
        voiceId: 'pNInz6obpgDQGcFmaJgB', // Adam
        stability: 0.80,
        similarityBoost: 0.80
      },
      google: {
        voiceId: 'en-IN-Neural2-B',
        rate: 0.96
      }
    }
  },

  male_casual: {
    id: 'male_casual',
    name: 'Urban Casual (Male Casual)',
    gender: 'male',
    age: 'young',
    description: 'Relatable, everyday, easygoing tone for dailywear, shirts, and casual weekend fashion.',
    defaultLanguage: 'en-IN',
    supportedLanguages: ['en-IN', 'hi-IN', 'hinglish'],
    defaultEmotion: 'happiness',
    recommendedCategories: ['shirts', 'trousers', 't_shirts', 'casual_men'],
    providerConfigs: {
      edge: {
        voiceId: 'en-IN-PrabhatNeural',
        rate: 1.02,
        pitch: '+0Hz'
      },
      openai: {
        voiceId: 'alloy',
        rate: 1.00
      },
      elevenlabs: {
        voiceId: 'TX3LPaxmHKxFdv7VOQHJ', // Liam
        stability: 0.65,
        similarityBoost: 0.75
      },
      google: {
        voiceId: 'en-IN-Neural2-C',
        rate: 1.00
      }
    }
  },

  // ─── KIDS PROFILE ───────────────────────────────────────────────────────────
  kid_playful: {
    id: 'kid_playful',
    name: 'Joyful Childhood (Kids)',
    gender: 'child',
    age: 'child',
    description: 'Cheerful, playful, and bright synthetic voice for kids festival lehengas, kurtas and party frocks.',
    defaultLanguage: 'en-IN',
    supportedLanguages: ['en-IN', 'hi-IN', 'hinglish'],
    defaultEmotion: 'happiness',
    recommendedCategories: ['kids_frock', 'kids_kurta', 'kids_festive', 'boys_suit', 'girls_lehenga'],
    providerConfigs: {
      edge: {
        voiceId: 'en-IN-NeerjaNeural',
        rate: 1.10,
        pitch: '+12Hz'
      },
      openai: {
        voiceId: 'shimmer',
        rate: 1.12
      },
      elevenlabs: {
        voiceId: 'MF3mGyEYCl7XYWbV9V6O', // Elli
        stability: 0.60,
        similarityBoost: 0.75
      },
      google: {
        voiceId: 'en-IN-Neural2-D',
        rate: 1.10,
        pitch: '+6st'
      }
    }
  },

  // ─── NARRATOR PROFILES ──────────────────────────────────────────────────────
  narrator_luxury: {
    id: 'narrator_luxury',
    name: 'Haute Couture Storyteller (Luxury Ad)',
    gender: 'female',
    age: 'mature',
    description: 'Intimate, majestic, slow-cadence narration with breathless elegance for flagship campaigns.',
    defaultLanguage: 'en-IN',
    supportedLanguages: ['en-IN', 'hi-IN', 'hinglish'],
    defaultEmotion: 'luxury',
    recommendedCategories: ['bridal', 'couture', 'campaign_film', 'handloom_documentary'],
    providerConfigs: {
      edge: {
        voiceId: 'en-IN-NeerjaExpressiveNeural',
        rate: 0.90,
        pitch: '-3Hz',
        style: 'calm'
      },
      openai: {
        voiceId: 'nova',
        rate: 0.88
      },
      elevenlabs: {
        voiceId: '21m00Tcm4TlvDq8ikWAM',
        stability: 0.85,
        similarityBoost: 0.90
      },
      google: {
        voiceId: 'en-IN-Neural2-A',
        rate: 0.88,
        pitch: '-3st'
      }
    }
  },

  narrator_brand: {
    id: 'narrator_brand',
    name: 'Wear Your Story Voice (Brand Signature)',
    gender: 'female',
    age: 'mature',
    description: 'The definitive voice of Monavi Collection: poetic, proud, warm, celebrating heritage and individuality.',
    defaultLanguage: 'en-IN',
    supportedLanguages: ['en-IN', 'hi-IN', 'hinglish'],
    defaultEmotion: 'storytelling',
    recommendedCategories: ['all', 'brand_manifesto', 'festive_launch'],
    providerConfigs: {
      edge: {
        voiceId: 'en-IN-NeerjaExpressiveNeural',
        rate: 0.94,
        pitch: '-1Hz',
        style: 'expressive'
      },
      openai: {
        voiceId: 'nova',
        rate: 0.93
      },
      elevenlabs: {
        voiceId: '21m00Tcm4TlvDq8ikWAM',
        stability: 0.78,
        similarityBoost: 0.85
      },
      google: {
        voiceId: 'en-IN-Neural2-A',
        rate: 0.93
      }
    }
  },

  narrator_fashion_presenter: {
    id: 'narrator_fashion_presenter',
    name: 'Runway Host (Fashion Presenter)',
    gender: 'female',
    age: 'young',
    description: 'Dynamic, crisp, glamorous host introducing collections, textures, and trend styling tips.',
    defaultLanguage: 'en-IN',
    supportedLanguages: ['en-IN', 'hi-IN', 'hinglish'],
    defaultEmotion: 'confidence',
    recommendedCategories: ['reels', 'collection_drops', 'styling_guide', 'trends'],
    providerConfigs: {
      edge: {
        voiceId: 'en-IN-NeerjaExpressiveNeural',
        rate: 1.05,
        pitch: '+1Hz',
        style: 'cheerful'
      },
      openai: {
        voiceId: 'alloy',
        rate: 1.04
      },
      elevenlabs: {
        voiceId: 'EXAVITQu4vr4xnSDxMaL',
        stability: 0.65,
        similarityBoost: 0.80
      },
      google: {
        voiceId: 'en-IN-Neural2-D',
        rate: 1.04
      }
    }
  },

  narrator_storytelling: {
    id: 'narrator_storytelling',
    name: 'Artisan Chronicler (Storytelling)',
    gender: 'female',
    age: 'mature',
    description: 'Emotional, rich, and immersive narrative voice weaving family bonds and cultural memories.',
    defaultLanguage: 'en-IN',
    supportedLanguages: ['en-IN', 'hi-IN', 'hinglish'],
    defaultEmotion: 'storytelling',
    recommendedCategories: ['wedding_moments', 'family_heritage', 'diwali_stories'],
    providerConfigs: {
      edge: {
        voiceId: 'en-IN-NeerjaExpressiveNeural',
        rate: 0.92,
        pitch: '-1Hz',
        style: 'expressive'
      },
      openai: {
        voiceId: 'nova',
        rate: 0.90
      },
      elevenlabs: {
        voiceId: '21m00Tcm4TlvDq8ikWAM',
        stability: 0.75,
        similarityBoost: 0.85
      },
      google: {
        voiceId: 'en-IN-Neural2-A',
        rate: 0.90
      }
    }
  },

  narrator_promotional: {
    id: 'narrator_promotional',
    name: 'Celebration Offers (Promotional)',
    gender: 'male',
    age: 'young',
    description: 'High energy, persuasive, crisp and exciting for limited festival discounts and announcements.',
    defaultLanguage: 'en-IN',
    supportedLanguages: ['en-IN', 'hi-IN', 'hinglish'],
    defaultEmotion: 'promotion',
    recommendedCategories: ['festival_sale', 'limited_offers', 'announcements'],
    providerConfigs: {
      edge: {
        voiceId: 'en-IN-PrabhatNeural',
        rate: 1.08,
        pitch: '+1Hz'
      },
      openai: {
        voiceId: 'fable',
        rate: 1.06
      },
      elevenlabs: {
        voiceId: 'ErXwobaYiN019PkySvjV',
        stability: 0.60,
        similarityBoost: 0.75
      },
      google: {
        voiceId: 'en-IN-Neural2-C',
        rate: 1.06
      }
    }
  },

  narrator_customer_facing: {
    id: 'narrator_customer_facing',
    name: 'Concierge Greeting (Customer Facing)',
    gender: 'female',
    age: 'young',
    description: 'Welcoming, polite, comforting and attentive, perfect for store hours and bridal consult invitations.',
    defaultLanguage: 'en-IN',
    supportedLanguages: ['en-IN', 'hi-IN', 'hinglish'],
    defaultEmotion: 'happiness',
    recommendedCategories: ['store_visit', 'whatsapp_greetings', 'custom_fitting'],
    providerConfigs: {
      edge: {
        voiceId: 'en-IN-NeerjaNeural',
        rate: 0.98,
        pitch: '+0Hz'
      },
      openai: {
        voiceId: 'alloy',
        rate: 0.98
      },
      elevenlabs: {
        voiceId: 'EXAVITQu4vr4xnSDxMaL',
        stability: 0.70,
        similarityBoost: 0.75
      },
      google: {
        voiceId: 'en-IN-Neural2-D',
        rate: 0.98
      }
    }
  }
};

/**
 * Creates a persistent VoiceIdentity object from a profile ID and optional overrides.
 */
export function createVoiceIdentity(
  profileId: VoiceProfileId,
  options?: Partial<VoiceIdentity>
): VoiceIdentity {
  const profile = MONAVI_VOICE_PROFILES[profileId] ?? MONAVI_VOICE_PROFILES.narrator_brand;
  const edgeCfg = profile.providerConfigs.edge ?? { voiceId: 'en-IN-NeerjaExpressiveNeural', rate: 1.0 };

  return {
    id: options?.id ?? `voice_${profile.id}_${Date.now()}`,
    profileId: profile.id,
    provider: options?.provider ?? 'auto',
    voiceId: options?.voiceId ?? edgeCfg.voiceId,
    gender: options?.gender ?? profile.gender,
    language: options?.language ?? profile.defaultLanguage,
    pitchAdjustment: options?.pitchAdjustment ?? edgeCfg.pitch ?? '+0Hz',
    rateAdjustment: options?.rateAdjustment ?? edgeCfg.rate ?? 1.0,
    emotion: options?.emotion ?? profile.defaultEmotion,
    intensity: options?.intensity ?? 0.85,
    metadata: {
      profileName: profile.name,
      ...options?.metadata
    }
  };
}
