# Anti-Slop Curatorial Philosophy: Design & Copywriting Rules

> "A great UI tells its story through imagery, motion, and visceral atmosphere — not walls of developer-sounding marketing jargon."

When building high-end landing pages, the biggest enemy is **"AI Visual Slop"**: the predictable, generic templates churned out by default prompts. This document details the exact rules and curatorial filters learned through real-world design sessions.

---

## 1. The Banned List: What NEVER Enters the Page

| Banned Cliché | Why It Fails | What to Replace It With |
| :--- | :--- | :--- |
| **"Scroll to Explore" / "Keep Scrolling" Pills** | Instructing the user how to operate their own browser feels patronizing and clutters the viewport. | Let the visual composition naturally invite descent through layered depth, sticky stages, or armillary rings. |
| **3-Column Metric Fluff Cards** ("99.9% Purity", "50,000+ Sanctuaries", "10x Speed") | Generic SaaS filler. Customers shopping for luxury or bespoke experiences don't care about synthetic numbers. | **Living Curatorial Dossiers**: Specimen / model switcher displaying provenance, botanical or material origins, and serial numbers. |
| **Corporate Buzzwords** ("Revolutionize your journey", "Cutting-edge craftsmanship") | Sounds like a dev team talking to investors rather than an atelier speaking to a patron. | **Poetic Whispers**: Understated, evocative, short phrases (8–12 words max) that set an emotional mood. |
| **Robotic Symmetric Grids** | Looks like a bootstrap template or an e-commerce catalog. | **Asynchronous Floating Drift**: Individual elements staggered with gentle, bounded parallax offsets. |
| **Bulky Dev-Style Navbar Badges** (like black bullets `● Bespoke Inquiry`) | Looks like an internal terminal or unstyled code tag. | Clean typographic marks, Roman numerals, or delicate golden hairline borders. |

---

## 2. The 4 Curatorial Pillars

### Pillar I: The Living Curatorial Dossier
Instead of static feature cards, present items as **archival specimens** or **masterpiece records**:

```html
<!-- BAD: Generic AI feature card -->
<div class="feature-card">
  <h3>Rare Flora Preservation</h3>
  <p>We preserve flowers using advanced vacuum dehydration for long-lasting display.</p>
</div>

<!-- GOOD: Living Curatorial Dossier -->
<div class="specimen-dossier">
  <span class="dossier-code">SPECIMEN // 01 · ARCHIVE</span>
  <h3 class="dossier-name">Velvet Damask Rose</h3>
  <p class="dossier-origin">Harvested at first light · Kyoto Alpine Sanctuary</p>
  <div class="dossier-selector">
    <button class="active">01 · Rose</button>
    <button>02 · Peony</button>
    <button>03 · Meconopsis</button>
  </div>
</div>
```

---

### Pillar II: Poetic Micro-Copy Whispers
Write for an audience with taste. Never write more than 2 short sentences per section:

- **Bad (Dev/SaaS speak)**:
  > *"Our proprietary botanical preservation methodology captures the cellular structure of flowers harvested from heritage locations to prevent color fading."*
- **Good (Haute Editorial whisper)**:
  > *"Where botanical fragility transcends into sculptural permanence. Preserved in perpetual suspended reverie."*

---

### Pillar III: Bounded Harmonic Motion (Never Break Frame)
When adding scroll animations, floating particles, or hover transforms:

1. **Strictly Bound Transforms**: Parallax drift must never push images outside their viewport clipping bounds or distort layout grids.
2. **Sub-300ms Tactile Feedback**: All hover, click, and switch states must trigger immediately (0ms input latency) with spring curves like `cubic-bezier(0.16, 1, 0.3, 1)`.
3. **Gentle Real-Time Feedback**: Click interactions should spawn delicate micro-animations (e.g. a soft fading floral ring, a subtle gold shimmer, or a ripple of light) that vanish naturally within 800ms without blocking UI interactions.

---

### Pillar IV: Real Photography Over Synthetic Vectors
- **"Vẽ nhựa quá" (Too plastic/synthetic)**: AI-generated SVGs, flat CSS gradients, or stylized 2D illustrations often look cheap and artificial.
- **The Rule**: Always anchor the visual core with **real, high-resolution photography** or **photorealistic frame sequences**. Real lighting, cellular texture, organic imperfections, and deep blacks convey authenticity that synthetic vectors cannot replicate.

---

## 3. The Curatorial Checklist

Before delivering any landing page, run this checklist:

- [ ] Does any text mention the word "scroll", "swipe", or "click here"? *(If yes, remove immediately).*
- [ ] Are there any 3-column metric cards with fake statistics? *(If yes, replace with an interactive dossier or archival specimen view).*
- [ ] Are headings written like marketing pitches or like an exhibition catalog? *(Rewrite to read like an art catalog).*
- [ ] Do images jump, clip, or stutter during scroll? *(Apply bounded lerp physics and test at 60Hz and 120Hz).*
- [ ] Is there real photo texture instead of generic vector graphics? *(Enforce real photography).*
