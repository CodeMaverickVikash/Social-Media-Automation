---
name: fashion-reel-storyboard
description: "Generate cinematic 5-scene vertical Reel storyboards, motion transitions, text overlays, voiceover scripts, and scene-by-scene prompts for fashion reels."
user-invocable: true
argument-hint: "<slug> <garment or collection concept>"
---

# Fashion Reel Storyboard Skill

## Purpose
Transforms fashion campaign concepts into high-engagement, cinematic vertical video experiences (1080×1920 @ 30fps) using Monavi Collection's deterministic 5-scene narrative framework.

## 5-Scene Narrative Framework
1. **Scene 1: Visual Hook (2.2s, `zoom-in`)**:
   - Atmospheric establishing shot setting the heritage mood, architectural environment, and ambient lighting.
   - Text overlay: Eyebrow label + Collection Hook.
2. **Scene 2: Garment Silhouette Reveal (2.8s, `pan-right`)**:
   - Medium tracking shot highlighting the flow, drapery, and tailored silhouette in motion.
   - Text overlay: Garment Name + Subline.
3. **Scene 3: Craftsmanship & Macro Detail (2.2s, `zoom-in`)**:
   - Tactile close-up of intricate embroidery, zari threadwork, seams, or buttons.
   - Text overlay: Attribute triplets (`Classic | Modern | Versatile`).
4. **Scene 4: Hero Editorial Pose (2.6s, `zoom-out`)**:
   - Full-portrait shot showcasing model confidence, emotional connection, and lifestyle elegance.
   - Text overlay: Campaign Headline.
5. **Scene 5: Brand Signature End Card (2.4s)**:
   - Clean end card with Monavi 4-point star mark, wordmark `MONAVI COLLECTION`, tagline `WEAR YOUR STORY`, and actionable CTA button.

## Step-by-Step Workflow

1. **Intake & Concept Formulation**:
   - Determine campaign mood, category, and target platforms (Instagram Reels, Facebook Reels, WhatsApp Status).
   - Formulate musical mood (e.g. *Contemporary Sitar Fusion with Ambient Beats* or *Acoustic Lo-Fi*).
   - Write a 4-line voiceover script matching the brand voice in `brand/voice.md`.

2. **Generate Scene Imagery & Brief**:
   - Ensure scene photos are imported or generated at >= 1167×2074 to accommodate Ken Burns zoom without pixelation.
   - Write the reel brief into `content/reels/<slug>.json`.

3. **Deterministic Rendering**:
   - Render the reel using Playwright and FFmpeg:
     ```bash
     node scripts/render-reel.ts content/reels/<slug>.json
     ```
   - Pipeline verifies H.264 High, yuv420p, BT.709 color matrix, 30fps, 20 Mbps bitrate cap, and AAC audio.

4. **Media Validation**:
   - Verify output:
     ```bash
     npm run check:media -- output/instagram/<slug>/reel.mp4
     ```
