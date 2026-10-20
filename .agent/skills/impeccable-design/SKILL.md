---
name: impeccable-design
description: >-
  Enforce impeccable, high-taste UI design. Eliminates AI-generated visual
  clichés (generic gradients, card clutter, default fonts, icon slop).
  Use when building any UI, landing page, dashboard, component library,
  or design system. Activates Anti-Slop guardrails and a structured 4-phase
  design process: Read → Dials → Guardrails → Execute.
---

# Impeccable Design

You possess impeccable product design skills, high aesthetic discernment,
and deep production-grade craft. Your goal: completely avoid generic,
"AI-generated" visual clichés and commit to a deliberate, high-end direction.

---

## Phase 1: The Design Read (MANDATORY First Step)

Before touching any code or layout, output one line:

> "Reading this as: **[page kind]** for **[audience]**, with a **[vibe]** language, leaning toward **[aesthetic family]**."

Examples:
> "Reading this as: SaaS landing page for technical founders, with a restrained dark luxury language, leaning toward editorial minimalism."
> "Reading this as: portfolio for a motion designer, with a kinetic, expressive language, leaning toward bold neo-brutalism."

If the brief is genuinely ambiguous between two distinct visual directions,
ask **exactly ONE** clarifying question and stop. Otherwise, proceed immediately.

---

## Phase 2: Calibrate Design Dials

Explicitly declare your baseline metrics for this build before writing any code:

| Dial | Scale | Declaration Example |
|------|-------|---------------------|
| **DESIGN_VARIANCE** | 1 = rigid grid, 10 = daring editorial | → 7 |
| **MOTION_INTENSITY** | 1 = fully static, 10 = cinematic | → 4 |
| **VISUAL_DENSITY** | 1 = airy gallery, 10 = info cockpit | → 3 |

These dials must be declared and then adhered to throughout the build.
A page declared as MOTION_INTENSITY=2 should not have gratuitous parallax effects.

---

## Phase 3: Anti-Slop Guardrails (STRICT)

The following are **BANNED** unless explicitly requested by the user.
These are the most common "AI slop" patterns that make interfaces feel
cheap and generated-by-committee:

### 🚫 1. The Typography Trap

**Banned defaults:**
- `font-family: Inter, Roboto, system-ui, sans-serif` as the ONLY choice
- Using the same font family for both display and body
- Uniform font weight throughout (everyone bold or everyone regular)

**Do instead:**
- Purposeful display + body pairing with intentional contrast
- Display: character-forward (Instrument Serif, Fraunces, Chakra Petch, Bebas Neue, Playfair Display)
- Body: readable complement (DM Sans, Manrope, Plus Jakarta Sans, General Sans)
- Utility/mono: JetBrains Mono, Geist Mono, IBM Plex Mono for code/data
- Set a clear type scale: 3–5 sizes with intentional weight/width variation

### 🚫 2. The Color Crutch

**Banned defaults:**
- Blue-to-purple linear gradients on white or gray backgrounds
- Random glowing neon cards on pure black (`#000`)
- "Safe" palettes: Tailwind default blues/grays with zero brand personality
- More than 8 colors in a palette (palette soup)

**Do instead:**
- Cohesive restricted palette: 1 dominant neutral + 1 brand color + 1 accent
- Intentional contrast ratios and dark/light relationship
- Named hex values with a reason for each
- Examples: deep obsidian + amber, warm cream + forest green, slate + coral

### 🚫 3. Card Clutter

**Banned defaults:**
- Identical `rounded-xl border bg-card p-6 shadow` for EVERY section
- Three columns of identical cards everywhere
- "Feature grid" with icon → heading → 2-sentence description, repeated 6 times

**Do instead:**
- Vary layout families per section:
  - Bento/asymmetric grid for features
  - Split-screen typography for value propositions
  - Massive editorial callouts for key stats
  - Text-heavy narrative blocks for storytelling
  - Horizontal scroll or tab interface for comparisons

### 🚫 4. Icon Slop

**Banned defaults:**
- Random floating rounded-square icon tiles above every single heading
- Lucide/HeroIcons used as decorative filler without meaning
- 20+ different icons on one page with no visual system

**Do instead:**
- Use icons purposefully — only when they aid navigation or recognition
- Limit to one icon system; maintain consistent size and weight
- When in doubt, use NO icon and let typography do the work
- Consider custom SVG illustrations instead of icon packs

### 🚫 5. Spacing Soup

**Banned defaults:**
- Uniform `gap-4` or `p-6` on every element
- No clear vertical rhythm between sections
- Identical padding on both mobile and desktop

**Do instead:**
- Intentional rhythm anchored to a base unit (8px or 4px)
- Generous whitespace between major sections (80px–160px desktop)
- `clamp()` for fluid spacing that scales with viewport
- Asymmetric padding where content demands it

### 🚫 6. Generic Hero Patterns

**Banned defaults:**
- Big number + small label + supporting stats + gradient accent
- Centered headline + subheadline + two CTA buttons + hero image below
- Stock photo or generic 3D blob as hero visual

**Do instead:**
- Hero as a thesis: the most characteristic element of the product's world
- Could be: an interactive demo, live data visualization, a bold editorial statement,
  a full-bleed film frame, a product screenshot at 1:1 scale, a moving diagram

---

## Phase 4: Execution Standards

Every implementation must meet these production-grade standards:

### Typography
- Clear hierarchy: H1 → H2 → H3 → body → caption, each visually distinct
- `clamp()` for responsive type: `font-size: clamp(1.25rem, 3vw, 2rem)`
- Line height: 1.4–1.6 for body, 1.0–1.2 for display headings
- Never center-align body paragraphs
- Measure (line length): 60–75 characters for body text

### Color & Surface
- Subtle borders: `border: 1px solid rgba(255,255,255,0.1)` or tonal shift
- Avoid heavy drop shadows — use elevation through color, not shadow
- Consistent opacity scale for disabled/muted states
- Dark mode: never pure black (#000), use deep neutrals (#0a0a0a, #111, #0f0f11)

### Interaction
- Every interactive element has hover, focus-visible, and active states
- Focus ring is visible and matches the brand (not default browser blue)
- `prefers-reduced-motion` respected for all animations
- Touch targets: minimum 44×44px

### Responsive
- Works from 320px to 2560px
- Mobile-first layout with intentional desktop enhancement
- No horizontal overflow at any breakpoint
- Images sized correctly with `aspect-ratio`

### Copy
- ZERO placeholder "Lorem ipsum" text
- Write sharp, specific microcopy appropriate for the product
- Headlines: specific benefit, not generic promise ("Deploy in 3 seconds" not "Fast Deployments")
- CTAs: verb + noun ("Start building" not "Get Started")
- Error messages: specific + actionable

---

## Self-Critique Loop

After building each major section, run this mental audit:

1. **Typography test**: Cover the colors. Does the type hierarchy alone create clear structure?
2. **Color test**: Remove the type. Does the color palette feel cohesive and intentional?
3. **Pattern test**: Have I used the same layout pattern more than twice? Vary it.
4. **Slop test**: Would a senior designer at Linear, Vercel, or Stripe approve this section?
5. **Chanel test**: What one element can I remove to make this stronger?

If using Playwright MCP, take a screenshot after each major section and run this critique visually.
