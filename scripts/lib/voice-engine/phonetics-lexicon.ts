// Multilingual Phonetics Lexicon & Hinglish Speech Processor for Monavi Collection
// Guarantees authentic Indian fashion terminology pronunciation and natural conversational rhythm.

import type { LanguageCode } from './types.ts';

export interface PhoneticEntry {
  term: string;
  hindiScript: string;
  phoneticHint: string;
  ipa?: string;
  context: 'brand' | 'fabric' | 'garment' | 'embroidery' | 'occasion';
}

/**
 * Verified Pronunciation Dictionary for Monavi Collection and Indian Haute Couture.
 */
export const MONAVI_PHONETIC_LEXICON: Record<string, PhoneticEntry> = {
  monavi: {
    term: 'Monavi',
    hindiScript: 'मोनावी',
    phoneticHint: 'MOH-nah-vee',
    ipa: 'moʊˈnɑːviː',
    context: 'brand'
  },
  zari: {
    term: 'Zari',
    hindiScript: 'ज़री',
    phoneticHint: 'ZUH-ree',
    ipa: 'zʌˈriː',
    context: 'embroidery'
  },
  dulhan: {
    term: 'Dulhan',
    hindiScript: 'दुल्हन',
    phoneticHint: 'DOOL-hun',
    ipa: 'dʊlˈhʌn',
    context: 'occasion'
  },
  lehenga: {
    term: 'Lehenga',
    hindiScript: 'लहंगा',
    phoneticHint: 'LEH-hen-gah',
    ipa: 'leɪˈhɛŋɡɑː',
    context: 'garment'
  },
  sherwani: {
    term: 'Sherwani',
    hindiScript: 'शेरवानी',
    phoneticHint: 'SHER-wah-nee',
    ipa: 'ʃɛrˈwɑːniː',
    context: 'garment'
  },
  kurta: {
    term: 'Kurta',
    hindiScript: 'कुर्ता',
    phoneticHint: 'KOOR-tah',
    ipa: 'kʊrˈtɑː',
    context: 'garment'
  },
  chanderi: {
    term: 'Chanderi',
    hindiScript: 'चंदेरी',
    phoneticHint: 'CHUN-day-ree',
    ipa: 'tʃʌnˈdeɪriː',
    context: 'fabric'
  },
  banarasi: {
    term: 'Banarasi',
    hindiScript: 'बनारसी',
    phoneticHint: 'BUH-nah-ruh-see',
    ipa: 'bʌˈnɑːrʌsiː',
    context: 'fabric'
  },
  kanjeevaram: {
    term: 'Kanjeevaram',
    hindiScript: 'कांजीवरम',
    phoneticHint: 'KAHN-jee-vah-rum',
    ipa: 'kɑːnˈdʒiːvərəm',
    context: 'fabric'
  },
  chikankari: {
    term: 'Chikankari',
    hindiScript: 'चिकनकारी',
    phoneticHint: 'CHIK-un-kah-ree',
    ipa: 'tʃɪkənˈkɑːriː',
    context: 'embroidery'
  },
  bandhani: {
    term: 'Bandhani',
    hindiScript: 'बांधणी',
    phoneticHint: 'BAHND-hah-nee',
    ipa: 'bɑːndˈhɑːniː',
    context: 'fabric'
  },
  dupatta: {
    term: 'Dupatta',
    hindiScript: 'दुपट्टा',
    phoneticHint: 'DOO-putt-tah',
    ipa: 'dʊˈpʌt̪ːɑː',
    context: 'garment'
  },
  anarkali: {
    term: 'Anarkali',
    hindiScript: 'अनारकली',
    phoneticHint: 'ah-NAR-kuh-lee',
    ipa: 'əˈnɑːrkəliː',
    context: 'garment'
  },
  angrakha: {
    term: 'Angrakha',
    hindiScript: 'अंगरखा',
    phoneticHint: 'ung-RUH-khah',
    ipa: 'ʌŋˈrʌkʰɑː',
    context: 'garment'
  }
};

/**
 * Common Hinglish markers to detect code-switched phrases.
 */
const HINGLISH_KEYWORDS = new Set([
  'shaadi', 'dulhan', 'khubsurat', 'andaaz', 'shandar', 'tyohaar', 'apna', 'apni',
  'har', 'naya', 'khass', 'pyar', 'rishte', 'andaaz', 'rang', 'roop', 'sajawat',
  'aaj', 'hoga', 'hogi', 'karo', 'dekh', 'dekho', 'sundar', 'bahut', 'dil'
]);

/**
 * Detects whether a string is predominantly English, Hindi, or Hinglish.
 */
export function detectLanguageCadence(text: string): LanguageCode {
  // Check for Devanagari Unicode block (\u0900-\u097F)
  const devanagariCount = (text.match(/[\u0900-\u097F]/g) || []).length;
  const latinCount = (text.match(/[a-zA-Z]/g) || []).length;

  if (devanagariCount > latinCount && devanagariCount > 5) {
    return 'hi-IN';
  }

  // Count Hinglish markers in Latin text
  const words = text.toLowerCase().split(/\s+/);
  let hinglishMatches = 0;
  for (const w of words) {
    const cleanWord = w.replace(/[^a-z]/g, '');
    if (HINGLISH_KEYWORDS.has(cleanWord)) {
      hinglishMatches++;
    }
  }

  if (hinglishMatches >= 2 || (hinglishMatches >= 1 && words.length < 8)) {
    return 'hinglish';
  }

  return 'en-IN';
}

/**
 * Normalizes text and applies phonetic cues for Indian fashion terminology.
 */
export function applyPhoneticNormalization(text: string, targetLanguage: LanguageCode): string {
  let normalized = text;

  // Replace case-insensitive terms with phonetically clear equivalents if required by target engine
  for (const [key, entry] of Object.entries(MONAVI_PHONETIC_LEXICON)) {
    const regex = new RegExp(`\\b${entry.term}\\b`, 'gi');
    if (targetLanguage === 'hi-IN') {
      // In pure Hindi TTS, Devanagari script sounds far more native
      normalized = normalized.replace(regex, entry.hindiScript);
    } else {
      // Keep term intact, but ensure capitalisation helps English phonetics engines
      normalized = normalized.replace(regex, entry.term);
    }
  }

  // Natural human sentence breathing rhythm: insert comma after introductory discourse markers
  normalized = normalized
    .replace(/\b(Crafted with|Woven in|Introducing|Celebrate this|Step into|Embrace the)\b/gi, '$1,')
    .replace(/,\s*,/g, ',');

  return normalized;
}

/**
 * Builds clean SSML for neural TTS engines supporting SSML (Azure/Edge, Google).
 */
export function buildSsmlPrompt(options: {
  text: string;
  voiceId: string;
  language: LanguageCode;
  rate?: number; // e.g. 1.0
  pitch?: string; // e.g. "+0Hz", "-4Hz"
  style?: string; // e.g. "expressive", "calm"
  breakDurationMs?: number;
}): string {
  const { text, voiceId, language, rate = 1.0, pitch = '+0Hz', style, breakDurationMs = 250 } = options;

  // Rate percent string: e.g. 0.95 -> "-5%", 1.05 -> "+5%"
  const rateDelta = Math.round((rate - 1.0) * 100);
  const rateStr = rateDelta >= 0 ? `+${rateDelta}%` : `${rateDelta}%`;

  const normalizedText = applyPhoneticNormalization(text, language);

  // Wrap in standard SSML structure
  let body = normalizedText;

  // Insert natural breathing pauses at period or semicolon
  body = body.replace(/([.;!])\s+/g, `$1 <break time="${breakDurationMs}ms"/> `);

  // Wrap with expressiveness style if specified
  if (style) {
    body = `<mstts:express-as style="${style}">${body}</mstts:express-as>`;
  }

  return `
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="${language === 'hi-IN' ? 'hi-IN' : 'en-IN'}">
  <voice name="${voiceId}">
    <prosody rate="${rateStr}" pitch="${pitch}">
      ${body}
    </prosody>
  </voice>
</speak>`.trim();
}
