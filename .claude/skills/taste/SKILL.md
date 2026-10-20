---
name: taste
description: >-
  Develop and apply refined aesthetic taste when evaluating or creating visual
  design. Use when critiquing existing UI, choosing between design directions,
  selecting typography/color combinations, or when the user asks for a
  "tasteful", "refined", "elegant", "high-end", or "world-class" aesthetic.
  Also use for design audits and when the user wants to avoid AI-generated clichés.
---

# Taste — The Art of Deliberate Design Choices

## What Is Taste in UI Design?

Taste is not a fixed set of rules — it's a calibrated judgment that allows you to:

1. **Recognize** what makes a design feel generic vs. distinctive
2. **Choose** purposefully among infinite equal-looking options
3. **Restrain** — knowing what NOT to add is as powerful as what to add
4. **Justify** every visual decision with a reason tied to this specific brief
5. **Reference** the best-in-class work and understand why it works

> "Taste is the ability to make the right choice without being able to fully explain why it's right — and then being able to explain it anyway."

---

## The Taste Audit Framework

When evaluating any design (yours or someone else's), run through these lenses:

### Lens 1: Signal vs. Noise

- Does every element earn its place on this screen?
- Would removing any element make the design stronger?
- Is there one clear focal point, or is attention scattered?
- What percentage of the screen is "decoration" vs. "information"?

### Lens 2: Distinctiveness

- Could this design belong to any other brand/product? (Bad)
- Does it feel like it could ONLY be this product? (Good)
- Is it memorable for a reason that connects to what the product does?
- If you saw a screenshot with the logo removed, would you recognize the brand?

### Lens 3: Craft Level

- Are spacing decisions intentional or accidental-looking?
- Is the typographic hierarchy clear at a glance (5-second test)?
- Do color relationships feel deliberate (intentional harmony/contrast)?
- Are interactive states (hover, focus, active, disabled) as refined as default?
- Is the responsive behavior graceful or merely functional?

### Lens 4: Cohesion

- Does the design have a single consistent "voice" throughout?
- Do all sections feel like they belong to the same design system?
- Is the motion language consistent (same easing, similar durations)?
- Would the 10th page/screen feel like it belongs to the same product as the 1st?

---

## Aesthetic Families Reference

Understanding which aesthetic family a design belongs to — and whether it fits the brief — is core to taste.

| Aesthetic | Characteristics | Works for | Avoid when |
|-----------|----------------|-----------|------------|
| **Editorial Minimalism** | Maximum whitespace, 1–2 colors, strong typography, long-form readable | Design studios, journalism, portfolios | Feature-heavy SaaS, B2B dashboards |
| **Dark Luxury** | Deep backgrounds (#0a0a0a–#1a1a1a), gold/amber/sand accents, refined micro-details | Premium products, creative tools, high-end SaaS | Consumer apps, casual/playful products |
| **Warm Functional** | Earthy tones (cream, terracotta, sage), humanist sans-serif, approachable | Consumer products, community tools, wellness | Enterprise, financial, B2B |
| **Neo-Brutalist** | High-contrast borders, flat offset shadows, raw grid, high saturation accents | Developer tools, indie products, counter-culture brands | Luxury, healthcare, finance |
| **Kinetic / Expressive** | Motion-first, bold color transitions, typography in motion, alive-feeling | Creative agencies, entertainment, portfolios | Information-dense products, accessibility-critical |
| **Enterprise Clarity** | Dense information hierarchy, strict grid, muted palette, data-forward | B2B SaaS, dashboards, analytics | Consumer-facing, creative |
| **Soft Modernism** | Rounded corners with purpose, light neutrals, generous whitespace, friendly type | Consumer apps, productivity, health tech | Luxury, raw/brutalist creative |

---

## Typography as the Primary Taste Signal

Typography is where taste is most visible — and most often fumbled.

### The Pairing Principle

Every typographic system needs at minimum:
- **Display face**: character-forward, used sparingly at large sizes (headlines, hero)
- **Body face**: readable, neutral, complementary (paragraphs, UI labels)

The pairing should have **intentional contrast** — not just two similar sans-serifs.

| Pairing Type | Example | Mood |
|-------------|---------|------|
| Serif display + geometric sans body | Fraunces + Manrope | Editorial, warm intellectual |
| Monospace display + humanist body | JetBrains Mono + DM Sans | Technical, precise |
| Condensed display + regular body | Bebas Neue + Inter | Bold, impactful, modern |
| Old-style serif + grotesque body | Playfair + Neue Haas | Classic, authoritative |
| Variable serif + variable sans | Instrument Serif + Plus Jakarta Sans | Contemporary, flexible |

### Type Scale Rules

- Use a **mathematical scale** (Major Third: 1.25×, Perfect Fourth: 1.333×)
- Minimum 4 distinct sizes in hierarchy
- Weights must be intentional: bold for emphasis, not decoration
- Line height: 1.4–1.6 body, 1.0–1.2 display
- Letter spacing: tighten large display (-0.02em to -0.04em), loosen small caps (+0.05em)

---

## Color as a Taste Signal

A high-taste color system is **minimal and intentional**:

### The 5-Color Rule

1. **Dominant neutral** (background + surface): 40–60% of screen area
2. **Secondary neutral** (cards, borders, subtle surfaces): 20–30%
3. **Primary brand color** (CTAs, key highlights): 5–10% — maximum impact through scarcity
4. **Accent** (interactive states, links, secondary CTAs): 3–7%
5. **Semantic** (success green, warning amber, error red): used only for state

Total: 4–6 named colors maximum. If you have 20 colors, you have no palette.

### Color Relationship Types

| Relationship | Effect | Risk |
|-------------|--------|------|
| **Monochromatic** (tints/shades of one hue) | Cohesive, sophisticated | Can feel flat |
| **Analogous** (neighboring hues) | Harmonious, natural | Can lack contrast |
| **Complementary** (opposite hues) | High energy, vibrant | Can feel garish |
| **Split-complementary** | Vibrant but balanced | Complex to manage |
| **Neutral + one accent** | Safe, professional, timeless | Can feel generic |

---

## The Restraint Principle (Chanel's Rule)

> "Before leaving the house, look in the mirror and remove one accessory."

Applied to UI design:

- Before shipping, identify **one element to remove** from each section
- Over-designed interfaces feel anxious and unconfident
- Restraint communicates mastery and security
- The most lasting designs are often the most reduced

**Practical application:**
After completing any section, ask: "If I had to cut one thing here — one decoration, one animation, one color, one icon — what would it be?" Then cut it.

---

## Taste in Motion

Animation has taste too. High-taste motion:
- Is purposeful (solves a UX problem, not decorative)
- Is proportional (quick for frequent actions, expressive for rare ones)
- Uses spring physics for organic feel
- Never calls attention to itself
- Makes the interface feel **alive without feeling busy**

Low-taste motion:
- Scroll-triggered animations on every paragraph
- Elements flying in from all four directions
- Hover animations that take longer than 500ms
- Animations that delay the user from their goal

---

## Reference Brands (Aspirational Taste Benchmarks)

When calibrating taste level, reference these brands as quality benchmarks:

| Brand | What to study |
|-------|--------------|
| **Linear** | Type hierarchy, motion choreography, dark mode craft |
| **Vercel** | Editorial minimalism, monochrome mastery |
| **Stripe** | Information density with elegance, documentation design |
| **Loom** | Warm modernism, approachable without being casual |
| **Figma** | Tool UI done with taste, icon system, color |
| **Arc Browser** | Personality + function balance, gradient use |
| **Fey** | Data visualization taste, chart elegance |
| **Raycast** | Dark luxury for developer tools |
