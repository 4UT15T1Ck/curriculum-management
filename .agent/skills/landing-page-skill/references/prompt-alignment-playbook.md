# Prompt Alignment & Feedback Playbook

This playbook documents how to interpret visceral, real-world user feedback and translate it into precise engineering and aesthetic solutions. These insights were forged through real production iterations.

---

## Translation Matrix: From User Pain to Technical Fix

### Case 1: "Đừng có nhắc tới scroll trong UI" (Don't mention scroll in the UI)
* **The Root Cause**: Devs often add badges like *"Scroll to explore"*, *"Scroll down for details"*, or animated mouse icons with down arrows. To high-end clients, this feels like an instructional manual and ruins the illusion of effortless immersion.
* **The Fix**:
  1. Remove all text containing the word "scroll", "swipe", or "mouse".
  2. Use visual architecture to signal depth: sticky viewports, celestial orbital rings that hint at rotation, and layered z-index compositions.
  3. Ensure the initial viewport has a subtle visible lower edge cut (e.g. 10% of the next section peeking above the fold) which naturally invites natural finger rolling.

---

### Case 2: "Hiệu ứng bạn tự vẽ hơi nhựa, cần ảnh thật" (Too plastic/synthetic, use real photography)
* **The Root Cause**: Programmatic SVG paths, Canvas radial gradients, or CSS bloom filters look sterile, flat, and cartoonish ("nhựa").
* **The Fix**:
  1. Never simulate organic complex subjects (flowers, cars, luxury watches, human skin) with mathematical bezier curves or procedural shapes.
  2. Use **real photographic assets** extracted from ultra-high-definition video or studio photographic scans.
  3. Pre-process the real photo sequence into 240–320 optimized WebP frames with black background thresholding for seamless blending with dark canvas surfaces.

---

### Case 3: "UI nói chuyện như dev với nhau á, làm cho văn thơ chút" (Sounds like devs talking, make it poetic)
* **The Root Cause**: AI and engineers default to descriptive taxonomy: *"The Anatomy of Eternal Flora"*, *"System Performance Index"*, *"Specimen Database"*.
* **The Fix**:
  1. Adopt the voice of an **art curator** or **master perfumer/horologist**.
  2. Replace taxonomy with mystery and poetic reverence:
     - ❌ *"The Anatomy of Eternal Flora"* ➔ ✅ *"Where botanical fragility transcends into sculptural permanence."*
     - ❌ *"The Sensory Index"* ➔ ✅ *"Suspended Floral Reverie."*
     - ❌ *"Features & Specifications"* ➔ ✅ *"Terroir of Origin · Heritage Sanctuaries."*
  3. Keep poetic whispers short (max 8–12 words). Long poetic paragraphs become tedious.

---

### Case 4: "Khách hàng không quan tâm số liệu đâu, họ quan tâm vẻ đẹp" (Clients don't care about metrics)
* **The Root Cause**: Tech landing page templates always shove 3-column metric grids (*"99.9% Preservation", "50,000+ Sanctuaries", "10x Longevity"*). In luxury and art, synthetic numbers cheapen the brand.
* **The Fix**:
  1. Eliminate all generic numeric counter cards.
  2. Replace them with **Living Curatorial Dossiers**: an interactive specimen selector with genuine provenance details (e.g. *Specimen No. 01 · Rosa Damascena · Private Kyoto Sanctuary*).
  3. Allow patrons to switch specimens interactively to feel a sense of discovery and connoisseurship.

---

### Case 5: "Navbar có dấu chấm nhìn dev thế này" (Navbar bullet looks like developer code)
* **The Root Cause**: Badges like `● Bespoke Inquiry` or `[Status: Online]` look like GitHub status indicators or terminal prompts.
* **The Fix**:
  1. Ban the black bullet `●` or code syntax from luxury headers.
  2. Use delicate Roman numerals (*Est. MMXXVI*), subtle gold hairline borders, or minimalist monograms.
  3. If organic ornamentation is requested, use microscopic floral crests or bespoke SVG filigree instead of bulky cartoon flower illustrations.

---

### Case 6: "Di chuột vào giật như điên, bị mất khung hình" (Mouse hover jitters crazily, cards clip out of frame)
* **The Root Cause**: Unbounded parallax math where `mouseY * factor` moves elements outside their CSS `overflow: hidden` containers, or listening to `mousemove` without `requestAnimationFrame` debouncing, causing layout thrashing.
* **The Fix**:
  1. Always clamp parallax offsets to safe bounds (e.g., maximum $\pm 18\text{px}$ drift).
  2. Use `will-change: transform` and CSS `transform: translate3d(x, y, 0)` for hardware acceleration.
  3. Never attach direct DOM updates to raw pointermove listeners. Use spring interpolation with lerp damping.
  4. Ensure cards have fixed aspect ratios and proper flex/grid containment so they can never pop out of the viewport.

---

### Case 7: "Hơi ít frame nên khựng và lag, cho nhiều frame lên" (Stuttering/laggy, needs more frames)
* **The Root Cause**: 70–80 frames over a 300vh scroll container means each frame is stretched over ~40px of scrolling. Small steps are visible to the human eye.
* **The Fix**:
  1. Extract a full 300-frame sequence (25–30 FPS temporal resolution).
  2. Implement **Sub-Frame Dual-Blend Optical Crossfade**:
     `base = Math.floor(currentFrame)`
     `next = base + 1`
     `blend = currentFrame - base`
     Draw `base` at alpha 1.0, then draw `next` at alpha `blend`.
  3. This generates continuous sub-pixel blending, eliminating visible stepping and delivering a buttery **120 FPS optical flow**.
