---
name: landing-page-skill
description: "Master toolkit for engineering world-class, ultra-luxury, high-performance cinematic landing pages. Features a 120 FPS continuous scroll canvas engine with sub-frame dual-blend optical crossfade, Emil Kowalski spring lerp physics, video-to-WebP frame extractor CLI, Anti-Slop curatorial copywriting, and 4 pre-built industry archetypes (Haute Horlogerie, High-Tech Hardware/EV, Minimalist Architecture, Haute Perfumery). Eliminates AI marketing clichés, plastic procedural vectors, and laggy video scrubbing."
---

# Landing Page Skill: Cinematic Haute Editorial Architecture

This skill provides an end-to-end framework and technical toolkit for building award-winning, artistic, and buttery-smooth landing pages across any industry.

> **Core Philosophy**: A world-class landing page tells its story through imagery, motion, and visceral atmosphere — not walls of developer-sounding marketing jargon or generic AI cards.

---

## When to Activate This Skill

Activate this skill whenever:
- The user requests a high-end, luxury, artistic, or "cinematic" landing page.
- The user wants a scroll-driven product reveal (like Apple, Leica, Porsche, or luxury watchmakers).
- The user complains that UI feels "nhựa" (plastic/synthetic), "nói chuyện như dev" (sounds like dev jargon), or has laggy/stuttering animations.
- The project needs an interactive 120 FPS frame scrub engine powered by real photography rather than laggy `<video>` tags.

---

## Repository Structure & Assets

```
landing-page-skill/
├── SKILL.md                                 # This master instruction manual
├── scripts/
│   └── extract_frames.py                    # Multi-threaded Video-to-WebP CLI optimizer
├── templates/
│   ├── scroll-sequence-engine.js            # Drop-in 120 FPS Canvas Sequence Engine
│   ├── cinematic-landing-boilerplate.html   # Clean luxury semantic HTML template
│   └── cinematic-landing.css                # Gold/dark curation tokens & layout
└── references/
    ├── cinematic-scroll-canvas.md           # Deep technical guide on canvas vs video
    ├── anti-slop-curation.md                # Anti-slop rules, banned clichés & living dossiers
    ├── industry-archetypes.md               # 4 complete style tokens & narrative blueprints
    └── prompt-alignment-playbook.md         # Translating visceral user feedback to technical code
```

---

## The 4 Golden Rules (Anti-Slop Guardrails)

1. **Never Mention Scroll in UI**: Banish *"Scroll to explore"*, *"Scroll down"*, or mouse wheel indicators. Let sticky viewports and rotational armillary geometry guide the user instinctively.
2. **Real Photo Sequences Over Synthetic Vectors**: Complex organic or mechanical subjects must use real photographic frames, never flat CSS shapes or cartoon SVGs ("nhựa").
3. **No 3-Column Metric Fluff**: Eliminate fake numbers (*"99.9% Purity"*, *"10x Faster"*). Use **Living Curatorial Dossiers** (interactive specimen/model switchers with authentic provenance).
4. **Poetic Whispers (Max 8–12 Words)**: Replace technical taxonomies with understated, evocative curation.

---

## 4-Phase Implementation Workflow

### Phase 1: Determine Industry Archetype & Voice
Consult `references/industry-archetypes.md` and select the archetype matching the product:
- **Haute Horlogerie & High Jewelry**: Deep obsidian `#0a0908`, champagne gold `#c5a059`, Cormorant Garamond, mechanical escapement pacing.
- **High-Tech & EV Hardware**: Monolithic black `#050608`, luminescent cobalt `#00f0ff`, Syncopate + Plus Jakarta Sans, aerodynamic drag pacing.
- **Minimalist Architecture**: Warm travertine `#f6f5f0`, raw charcoal `#1c1b18`, Italiana + Inter, raking sunlight pacing.
- **Haute Perfumery & Botanical Alchemy**: Deep moss `#070807`, amber `#e5a952`, Cinzel + Cormorant Garamond, cold extraction vapor pacing.

---

### Phase 2: Frame Extraction with `extract_frames.py`
To avoid the broken 8–10 FPS seek stutter of `<video currentTime>`, convert the source video into an ultra-optimized WebP sequence using the bundled CLI:

```bash
# Example: Extract 300 frames, 640x640, quality 82, with dark background enhancement
python scripts/extract_frames.py \
  --input source_video.mp4 \
  --output ./assets/sequence_frames \
  --target-frames 300 \
  --width 640 \
  --height 640 \
  --quality 82 \
  --crop center \
  --darken-bg
```

This outputs:
- `frame_000.webp` ... `frame_299.webp` (~22 KB per frame, ~6.6 MB total).
- `manifest.json` containing pre-calculated strides, aspect ratios, and lerp constants.

---

### Phase 3: Deploy 120 FPS `ScrollSequenceEngine`
Import `templates/scroll-sequence-engine.js` into the project:

```javascript
import { ScrollSequenceEngine } from './scroll-sequence-engine.js';

const engine = new ScrollSequenceEngine({
  canvas: '#sequenceCanvas',
  container: '#scrubSequence', // Sticky section (e.g. height: 300vh)
  totalFrames: 300,
  framePattern: (i) => `./assets/sequence_frames/frame_${String(i).padStart(3, '0')}.webp`,
  keyframeStride: 4,          // Sparse keyframes loaded first (<150ms)
  lerpFactor: 0.18,           // Emil Kowalski spring momentum
  opticalCrossfade: true,     // Sub-frame dual-blend (continuous fluid flow)
  milestones: [
    { at: 0.00, tag: 'Phase I', title: 'The Genesis', desc: 'Poetic description...' },
    { at: 0.30, tag: 'Phase II', title: 'The Expansion', desc: 'Poetic description...' },
    { at: 0.65, tag: 'Phase III', title: 'The Climax', desc: 'Poetic description...' },
    { at: 0.88, tag: 'Phase IV', title: 'Perpetual Stasis', desc: 'Poetic description...' }
  ],
  onProgress: (progress, currentFrame) => {
    // Sync external overlays, celestial rings, or counters
    counterEl.textContent = `${Math.round(currentFrame) + 1} / 300`;
  },
  onMilestone: (milestone) => {
    // Fade in corresponding curatorial text
    titleEl.textContent = milestone.title;
  }
});
```

---

### Phase 4: Curatorial Polish & Anti-Slop Audit
Before presenting to the user, run the audit checklist from `references/anti-slop-curation.md`:
1. **Search & Destroy Text**: Search codebase for `"scroll"` — purge any UI copy containing it.
2. **Check Frame Bounds**: Ensure floating cards use clamped offsets (`Math.max(-20, Math.min(20, delta))`) so they never clip outside layout frames.
3. **Verify 0ms Tactile Micro-Interactions**: Pointerdown triggers instant ripple/flower accent; hover transitions use `cubic-bezier(0.16, 1, 0.3, 1)` under 300ms.
4. **Test Retina DPI**: Confirm canvas stays pin-sharp on high-density displays via DPR scaling.

---

## Detailed References

- Technical canvas architecture: [cinematic-scroll-canvas.md](file:///references/cinematic-scroll-canvas.md)
- Anti-slop curation rulebook: [anti-slop-curation.md](file:///references/anti-slop-curation.md)
- Industry archetypes & tokens: [industry-archetypes.md](file:///references/industry-archetypes.md)
- User feedback translation playbook: [prompt-alignment-playbook.md](file:///references/prompt-alignment-playbook.md)
