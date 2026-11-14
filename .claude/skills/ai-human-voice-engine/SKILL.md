---
name: ai-human-voice-engine
description: "AI Human Voice Engine specialist generating natural, realistic human voices, multi-provider neural speech, multilingual Hinglish/Hindi/English audio, and broadcast soundtrack mixing for Monavi Collection."
---

# AI Human Voice Creation Engine – Monavi Collection

Generates authentic, broadcast-grade, natural-sounding human voices for Monavi Collection fashion advertisements, product promotions, reels, status videos, and cinematic films. Replaces robotic text-to-speech with expressive neural voices, human speaking cadence, multilingual Indian phonetics, and dynamic music ducking.

**Brand:** MONAVI COLLECTION  
**Tagline:** WEAR YOUR STORY.

---

## 1. Core Architecture & Modules

The voice engine is located at `scripts/lib/voice-engine/` with direct CLI access via `npm run voice:cli` and automated testing via `npm run test:voice`:

- `voice-director.ts`: Intelligent Voice Director understanding character, age, gender, fashion category, occasion, and natural language instructions.
- `profiles-library.ts`: 15 specialized reusable voice profiles across male, female, kids, and narrative archetypes.
- `phonetics-lexicon.ts`: Multilingual pronunciation dictionary for Indian couture (`Monavi`, `Zari`, `Dulhan`, `Banarasi`, `Lehenga`, `Sherwani`, etc.) and Hinglish code-switching processor.
- `emotion-engine.ts`: Emotion and Speaking Style Engine modulating rate, pitch offsets, and dynamic cadence per scene.
- `providers/`: Provider abstraction layer supporting Microsoft Edge Neural TTS (zero-credential default), OpenAI TTS (`OPENAI_API_KEY`), ElevenLabs (`ELEVENLABS_API_KEY`), and Google Cloud TTS (`GOOGLE_TTS_API_KEY`).
- `voice-qa.ts`: Broadcast audio quality gatekeeper validating peak headroom (< -0.5 dBFS), absence of clipping, and timing compliance.
- `voice-mixer.ts`: Multi-cue audio synchronization with background royal instrumentation, -14dB music ducking, and 48kHz stereo AAC mastering.

---

## 2. Reusable Voice Profiles Library

| Profile ID | Persona | Gender | Tone & Mood | Default Lang | Recommended Categories |
|---|---|---|---|---|---|
| `female_premium` | Royal Monavi Sovereign | Female | Velvety, aristocratic, royal poise | `en-IN` | Bridal, Banarasi, Kanjeevaram, Couture |
| `female_young` | Modern Festive Chic | Female | Bright, expressive, youthful | `en-IN` | Festive, Sharara, Kurtis, Fusion |
| `female_mature` | Confident Heritage Matron | Female | Poised, articulate, trustworthy | `en-IN` | Classic Sarees, Handlooms, Chanderi |
| `female_casual` | Boutique Stylist | Female | Warm, conversational, welcoming | `en-IN` | Everyday wear, Casual kurtas |
| `male_premium` | Heritage Royalty | Male | Deep, resonant baritone, stately | `en-IN` | Sherwanis, Bandhgalas, Groomswear |
| `male_young` | Modern Dapper | Male | Energetic, stylish, charismatic | `en-IN` | Festive Kurtas, Indo-Western, Shirts |
| `male_mature` | Patriarch Elegance | Male | Authoritative, dignified, calm | `en-IN` | Formalwear, Nehru Jackets, Classic Suits |
| `male_casual` | Urban Casual | Male | Relatable, easygoing, street | `en-IN` | Everyday shirts, Trousers, T-shirts |
| `kid_playful` | Joyful Childhood | Child | Cheerful, bright, playful | `en-IN` | Kids frocks, Kids kurtas, Festival partywear |
| `narrator_luxury` | Haute Couture Storyteller | Female | Breathless elegance, atmospheric | `en-IN` | High-end campaign films, Bridal launch |
| `narrator_brand` | Wear Your Story Voice | Female | Poetic, proud, celebratory | `en-IN` | Brand manifestos, Season openings |
| `narrator_fashion_presenter`| Runway Host | Female | Dynamic, glamorous, upbeat | `en-IN` | Trend styling guides, Collection drops |
| `narrator_storytelling` | Artisan Chronicler | Female | Emotive, rich cultural narrative | `en-IN` | Artisan heritage stories, Wedding sagas |
| `narrator_promotional` | Celebration Offers | Male | High energy, punchy, persuasive | `en-IN` | Festive discounts, Limited-time offers |
| `narrator_customer_facing` | Concierge Greeting | Female | Helpful, polite, reassuring | `en-IN` | Store visits, Bridal consults |

---

## 3. Multilingual Support & Lexicon Phonetics

### Supported Languages:
- `en-IN`: Indian English with natural cadence and authentic accents.
- `hi-IN`: Natural Hindi pronunciation utilizing native Devanagari script routing.
- `hinglish`: Conversational code-switching with natural micro-pauses at clause boundaries.
- Future extensibility for `bn-IN`, `mr-IN`, `ta-IN`, `te-IN`, `gu-IN`, `pa-IN`.

### Pronunciation Lexicon:
- **Monavi:** Always pronounced `MOH-nah-vee` (/moʊˈnɑːviː/).
- **Zari:** `ZUH-ree` (/zʌˈriː/).
- **Dulhan:** `DOOL-hun` (/dʊlˈhʌn/).
- **Lehenga:** `LEH-hen-gah` (/leɪˈhɛŋɡɑː/).
- **Sherwani:** `SHER-wah-nee` (/ʃɛrˈwɑːniː/).
- **Banarasi:** `BUH-nah-ruh-see` (/bʌˈnɑːrʌsiː/).

---

## 4. Emotion & Style Modulations

Modulates speaking rate, pitch offset, and pause lengths dynamically:
- **Luxury:** Rate 0.92×, Pitch -3Hz, Pause 380ms, velvety calm.
- **Elegance:** Rate 0.95×, Pitch -1Hz, Pause 320ms, expressive grace.
- **Excitement:** Rate 1.08×, Pitch +3Hz, Pause 180ms, cheerful punch.
- **Happiness:** Rate 1.02×, Pitch +1Hz, Pause 240ms, warm smile.
- **Confidence:** Rate 0.98×, Pitch -1Hz, Pause 260ms, clear assertive.
- **Romance:** Rate 0.93×, Pitch -2Hz, Pause 350ms, gentle intimacy.
- **Storytelling:** Rate 0.94×, Pitch -1Hz, Pause 340ms, dramatic cadence.
- **Promotion:** Rate 1.06×, Pitch +2Hz, Pause 200ms, energetic conversion.

Scene-to-scene variation prevents repetitive monotony: hook scenes receive +3% rate boost, closing CTA scenes receive grounded confidence.

---

## 5. Audio Mastering & Ducking Pipeline

1. **Vocal EQ & De-essing:** High-pass filter at 100Hz eliminates low-end rumble; presence boost at 3.2kHz (+3dB) enhances vocal clarity; gentle de-essing preserves warmth.
2. **Background Ducking:** Ambient background music/drone is dipped by **-14dB** during dialogue delivery and restored during visual pauses.
3. **Limiting & Headroom:** Dynamic brickwall limiter set at -0.92 dBFS guarantees zero digital clipping.
4. **Format Specs:** 48kHz, 192kbps stereo AAC.

---

## 6. CLI Usage & Commands

```bash
# List all profiles
npm run voice:cli -- --profiles

# Check provider status
npm run voice:cli -- --providers

# Generate a 2-second preview sample
npm run voice:cli -- --sample --text "Monavi Collection. Wear your story." --profile female_premium

# Synthesize speech to file
npm run voice:cli -- --generate --text "Dulhan Bridal Sarees woven in antique zari." --profile female_premium --output output/sample.mp3

# Run complete 10-scenario test suite
npm run test:voice
```
