# Monavi Collection — Fashion Editorial Playbook & Creative Director Standard

This playbook encodes the master design rules, photography guidelines, prompt engineering protocols, and visual hierarchy standards established for **Monavi Collection** ("Wear Your Story"). It serves as the permanent repository reference for all AI agents, skills, and creative directors.

---

## 1. The 5 Golden Editorial Principles

### Principle 1: Continuous Single-Environment Background (Zero Clashing Splits)
* **The Rule:** The background of the entire creative must be unified, cohesive, and continuous with the photography.
* **The Violation:** Placing an arbitrary solid color block (e.g. dark navy) next to a warm sandstone haveli photograph creates an artificial, clashing "two split different backgrounds" look.
* **The Solution:**
  1. **Primary Standard (`overlay`):** The authentic photograph spans 100% of the canvas edge-to-edge. A soft, warm gradient scrim (`rgba(24, 16, 10, 0.92)` fading organically to 0% at 65% width) mimics natural architectural shadow on the left, keeping typography 100% crisp while allowing the palace/haveli courtyard to flow seamlessly behind it.
  2. **Split Standard (`split`):** If a split panel is used, the left panel's color MUST be sampled directly from the photograph's background tones (e.g., warm sandstone cream `#F7EFE4` or deep haveli umber `#1E140C`), NEVER an unrelated clashing hue.

---

### Principle 2: Complete Garment Silhouette Visibility (No Waist/Passport Crops)
* **The Rule:** When advertising a multi-piece or ethnic garment, the model must be visibly seen wearing the **COMPLETE product ensemble**.
* **The Violation:** Waist-up or chest-level crops cut the model off at the belt line, hiding the pajama/churidar and cutting the kurta in half. The viewer cannot tell if it is a kurta, a shirt, or a jacket.
* **The Solution:**
  * **Full-Length / Three-Quarter Framing:** Always frame from head down to knees and ankles/feet.
  * **Kurta Pajama:** Show the knee-length kurta hem, side slits (chaks), the tailored ivory/cream churidar pajama gathers at the ankles, and traditional handcrafted leather juttis.
  * **Sherwani / Indo-Western:** Show the structured knee-length coat, churidar trousers, and regal footwear.
  * **Lehenga / Saree / Anarkali:** Show the full flared skirt, floor-sweeping hemline, and authentic dupatta/pallu drapery.

---

### Principle 3: Zero-AI Raw Commercial Photorealism
* **The Rule:** Images must look like authentic commercial fashion editorial photographs shot on real camera equipment for publications like *GQ India* or *Vogue India* — **NEVER like AI-generated art**.
* **Anti-AI Directives:**
  * **Banned Buzzwords:** Strictly forbid AI trigger words like `8k`, `masterpiece`, `photorealistic`, `hyper-realistic`, `ultra-realistic`, `flawless`. (These trigger over-smoothed, synthetic AI algorithms).
  * **Real Camera Optics:** Prescribe genuine camera optics: `Shot on 50mm lens at f/2.8, shallow optical depth of field, natural 35mm film grain, authentic human color science`.
  * **Matte Human Skin Finish:** Visible natural skin pores, natural light beard stubble with individual hair strands, subtle eye laugh lines, authentic South Asian skin tones. Absolutely no waxy shine, no plastic airbrushing, no uncanny valley eyes.
  * **Physical Textile Physics:** Genuine raw silk showing visible slub weave threads, natural creasing at elbows and shins, gravitational drapery, and hand-stitched antique gold metallic zari thread embroidery with realistic sheen.
  * **Grounded Contact Shadows:** The model must have real, physical ground contact shadows cast under their footwear matching the sun angle (10:00 AM natural morning sunlight). Never produce floating or unanchored models.

---

### Principle 4: Prominent & Unmistakable Product Identity
* **The Rule:** The viewer must instantly understand what the product is within 0.1 seconds of glancing at the post.
* **The Solution:**
  * **Product Headline:** State the exact product name prominently in high-contrast Playfair Display serif:
    * E.g., `Silk Kurta\nPajama.` or `The Royal\nKurta Pajama.` or `Bridal\nLehenga.`
  * **Category Eyebrow:** Position a clean uppercase tracking label above the headline:
    * E.g., `MEN'S ETHNIC COLLECTION` or `ROYAL FESTIVE EDIT`.
  * **Never hide the product identity** behind vague poetic phrases alone (like "Everyday Style" or "Timeless Grace") without explicitly naming the garment.

---

### Principle 5: Minimalist Luxury Layout & Little Clothes Details
* **The Rule:** High-end luxury fashion advertising requires restraint, breathing room, and concise garment details.
* **The Formula:**
  1. **Brand Mark (Top Left):** Monavi stacked star logo + wordmark + hairline rule + `WEAR YOUR STORY`.
  2. **Calm Negative Space (Middle):** Expansive, unencumbered space showing the sunlit haveli architecture (at least 400-500px of vertical breathing room).
  3. **Product Headline & Eyebrow (Lower Third):**
     * Eyebrow: `MEN'S ETHNIC COLLECTION`
     * Headline: `Silk Kurta\nPajama.`
  4. **Little Details of Clothes (`attrs`):** A single elegant attribute row separated by ` | ` detailing fabric, embroidery craft, and silhouette:
     * E.g., `Raw Silk | Antique Zari | Tailored Fit`
  5. **CTA Button:** A minimalist rounded pill button with champagne gold hairline border (`border: 2px solid #DCC8B1`):
     * E.g., `Explore Collection →`
  6. **No Clutter:** Omit redundant badges, paragraphs, or multiple competing labels that make the creative look like an e-commerce brochure.

---

### Principle 6: Autonomous Single vs Multiple Human-Ready Model Mandate & Zero Abstract Silhouettes
* **The Rule:** The AI agent autonomously determines whether a campaign requires a **Single Model** or **Multiple Models (Duo / Couple / Family)** based on the prompt scope, and enforces 100% **Human-Ready Real Model Photography** across all creative outputs.
* **Zero Incomprehensible Abstract Shapes Mandate ("kuch samajh nhi aata hai"):** Flat 2D geometric vector silhouettes, solid white circular/oval heads, stick-figure limbs, or cartoon placeholders are strictly prohibited. In fashion retail, customers need immediate product clarity — authentic fabric weave, embroidery craft, neckline, silhouette cut, and human models with realistic facial anatomy, eyes, and expressions. Default campaign imagery must always resolve from curated high-resolution photographic model plates (`assets/models/`) or AI photography engines, composited onto continuous architectural environments with soft directional scrims.
* **Autonomous Decision Protocol:**
  * **Single Model:** Selected when marketing an individual garment or gender-specific product (e.g., *"Men's Kurta Pajama"*, *"Dulhan Bridal Saree"*, *"Kids Frock"*).
  * **Multiple Models (Duo / Couple):** Selected for collection-level marketing posts, festive campaigns, or wedding edits for a clothing business (e.g., *"Shaadi Season Marketing Post for clothing business"*), where presenting a Royal Bride & Groom Duo communicates full boutique wardrobe versatility matching `brand/reference-posts/festive-collection-duo.png`.
* **Human-Ready Photorealism Standard:** Output imagery must feature genuine, high-resolution photographic human models with authentic South Asian skin texture, natural facial anatomy, real eyes, and physical garment drapery on continuous haveli/palace backgrounds.

---

### Principle 7: Commercial Marketing Campaign & Poster Intent Standard ("Post = Campaign / Poster")
* **The Rule:** Whenever the user requests a "post" (e.g., *"create a post for X"*, *"post for shaadi season"*, *"marketing post"*), the AI assistant must always treat and engineer it as a full-scale **Commercial Marketing Campaign & Promotional Poster**.
* **Core Requirements:**
  1. **Campaign Typography Hierarchy:** Prominent uppercase category/campaign eyebrow (e.g. `SHAADI SEASON 2026`, `THE WEDDING EDIT`), Playfair Display headline ending in a period for poise, Montserrat attribute triplet (`Men's | Ladies | Kids | Custom Fits`), and high-converting pill CTA button.
  2. **Luxury Editorial Layout:** Framed using `overlay`, `split`, or `arch` matching the 8 brand reference blueprints.
  3. **Product Manager Conversion Copywriting:** High-engagement hook, clear value proposition, scannable bullet points, and frictionless low-barrier CTA (e.g., *"DM 'FAMILY'"*, WhatsApp *"Reply 'TRIAL'"*).
  4. **Multi-Format Campaign Deliverables:** Automatically produces 4:5 Feed Portrait (`ig-feed`), 9:16 Full Story/Status (`story`), and 1:1 Square (`square`).

---

## 2. Standard Prompt Formulation for Fashion Photography (Workflow A)

When generating fashion campaign images from text prompts:

```text
[Camera & Optics]:
Raw commercial fashion editorial photograph for GQ India / Vogue India, shot on a 50mm lens at f/2.8. Authentic natural optical depth of field, subtle 35mm film grain, authentic human color rendition. Clean unretouched editorial look.

[Model Realism]:
Real 28-year-old Indian male model with authentic South Asian skin tone, genuine visible skin pores, natural light beard stubble with individual hair strands, natural laugh lines, matte skin texture without waxy airbrushing or digital smoothing. Relaxed, candid, masculine royal posture. Realistic hands with natural fingers and nails.

[Garment & Silhouette]:
Full-length standing shot showing complete ethnic ensemble from head down to ankles/shoes. Wearing authentic luxury Indian Kurta Pajama: knee-length tailored midnight black raw silk kurta with visible woven slubs, natural fabric creasing at elbows and side slits, intricate hand-stitched antique gold metallic zari embroidery on mandarin collar and placket. Beneath the kurta, tailored off-white/ivory silk churidar pajama with natural gather creasing at shins and ankles. Handcrafted black leather juttis.

[Environment & Lighting]:
Model is positioned on the right half (~45-50% width). The left 50-55% is open negative space showing an authentic sunlit Rajasthani sandstone haveli courtyard in Jaipur with carved stone arches, weathered architectural stone patina, and natural 10:00 AM morning sunlight casting realistic directional ground contact shadows under the juttis.

[Negative Directives]:
waist-cut passport crop, cropped legs, missing pajama, missing trousers, floating feet without ground shadows, plastic waxy skin, airbrushed face, 3D CGI rendering, cartoon, digital illustration, oversaturated neon glow, crowd in background, watermark, logo on cloth.
```

---

## 3. Reference Blueprints Cross-Mapping

| Product Category | Recommended Template | Theme Key | Scrim / Panel Tone | Typical Headline | Typical Attrs |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Men's Kurta Pajama** | `overlay` (side: `left`) | `haveli` | `24, 16, 10` (Haveli umber) | `Silk Kurta\nPajama.` | `Raw Silk | Antique Zari | Tailored Fit` |
| **Men's Sherwani** | `overlay` (side: `left`) | `haveli` | `24, 16, 10` (Haveli umber) | `Royal\nSherwani.` | `Bespoke Cut | Dabka Embroidery | Pure Silk` |
| **Men's Casual Wear** | `split` (ratio: 44/56) | `mens` | `linear-gradient(#0A1C2C, #040D15)` | `Everyday\nStyle.` | `Classic | Modern | Versatile` |
| **Bridal Lehenga** | `overlay` (side: `left`) | `bridal` | `51, 12, 13` (Deep wine) | `Bridal\nLehenga.` | `Velvet Silk | Handcrafted Zari | Royal Flair` |
| **Festive Saree** | `overlay` (side: `left`) | `festive` | `51, 12, 13` (Deep wine) | `Festive\nSaree.` | `Pure Silk | Zari Border | Timeless Drape` |
| **Ladies Contemporary**| `split` or `overlay` | `ladies` | `249, 215, 190` (Warm peach) | `Contemporary\nKurti.` | `Breathable Cotton | Hand Block Print | Easy Fit` |
| **Kids Ethnic Wear** | `arch` or `overlay` | `kids` / `kidsYellow` | `247, 245, 233` (Soft ivory) | `Kids Festive\nCollection.` | `Gentle Cotton | Soft Linings | Playful Comfort` |

---

## 4. Multi-Platform Delivery Specifications

Every content creative must deliver high-resolution assets for the 3 active brand channels (Instagram, Facebook, and WhatsApp):

1. **Feed Creative (4:5, 1080×1350):** Flagship vertical post format for Instagram and Facebook feeds.
2. **Story / WhatsApp Status (9:16, 1080×1920):** Full-bleed vertical immersion with safe zones (top 160px / bottom 200px reserved for platform UI).
3. **Square Feed (1:1, 1080×1080):** Classic balanced grid format for Instagram, Facebook, and WhatsApp catalog/broadcasts.

Each format must be accompanied by its tailored `caption.txt` incorporating:
* Platform-specific hook and narrative tone.
* Authentic garment details (fabric, craftsmanship, fit).
* Actionable store visit / DM / WhatsApp inquiry CTA.
* High-intent, categorized hashtag banks.

---

## 5. Autonomous Character, Model & Background Decision Protocol

When creating fashion campaign content without an uploaded photo, the AI agent has full creative autonomy to make character, model, and background decisions for the best user experience while keeping brand theming strictly intact:

1. **Autonomous Model & Demographic Casting:**
   * **Bridal (`bride`):** Regal 24–27 year old Indian bride model, delicate traditional kohl eyeliner, radiant dewy skin, graceful poise, authentic bridal jewelry (maang tikka, jhumkas, chooda).
   * **Groom (`groom`):** Regal 28–30 year old Indian groom model, manicured royal stubble/beard, dignified serene expression.
   * **Festive / Ladies (`women`):** Sophisticated 25–28 year old Indian female model, natural grace, contemporary elegance.
   * **Men's Ethnic (`men`):** Handsome 27–29 year old Indian male model, athletic poised posture.
   * **Kids (`kids`):** Cheerful, candid 6–8 year old child models in natural celebratory expressions.

2. **Autonomous Background & Lighting Direction:**
   * Curate authentic Indian architectural environments (sunlit Rajasthani sandstone haveli, Jaipur palace courtyards, carved marble jharokha arches, warm amber lantern glow).
   * Directional physical ground contact shadows matching natural golden-hour / 10:00 AM sunlight.
   * Ensure ample calibrated negative space (minimum 400px on text side) with smooth cinematic falloff so brand typography remains pristine.

3. **Invariable Brand Theming & Layout Integrity:**
   * In all cases, core brand rules remain non-negotiable: vector Monavi star mark + wordmark lockup, Playfair Display headlines, Montserrat attribute triplets (` | ` separated), rounded pill CTA buttons, exact platform delivery dimensions (1080×1350, 1080×1920, 1080×1080), and strict `check:media` quality standards.

---

## 6. Simple English & Clothes-to-Copy Alignment Mandate ("mujhe baar baar bolna na pade")

1. **Simple, Clear & Natural English for Creatives & Captions**:
   - **Canvas Text (Headlines, Eyebrows, Attrs, Badges, CTAs)**: Must be written in simple, clear, everyday English. Strictly ban complex, archaic, or pretentious vocabulary (`opulent`, `ineffable`, `ethereal`, `splendorous`, `transcendental`, `connoisseur`). Use direct terms Indian shoppers immediately understand: *"Royal Wedding Collection"*, *"Pure Silk Saree"*, *"Silk Kurta Pajama"*, *"Comfortable Fit"*, *"Shop Now"*, *"Visit Store"*.
   - **Social Captions (Instagram, Facebook, WhatsApp)**: Must use simple, natural conversational English with short sentences (under 15 words). Warm boutique stylist tone. Light Hinglish is welcome for festive warmth (*"Shaadi season is here ✨"*).

2. **Zero Incomprehensible Abstract Shapes Mandate ("kuch samajh nhi aata hai")**:
   - Strictly ban 2D vector silhouettes, stick-figure legs, blank oval/circle heads, or geometric dummies.
   - Always feature authentic photorealistic Indian models (from `assets/models/`) or real garment preservation.

3. **100% Clothes-to-Copy Alignment Mandate**:
   - Canvas text and captions must describe the exact garments depicted in the image. Banned generic placeholders: `Classic | Modern | Versatile` or `Everyday Style`.

