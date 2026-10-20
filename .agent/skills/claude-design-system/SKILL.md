---
name: claude-design-system
description: Enforce Anthropic Claude's signature editorial design system, warm parchment aesthetic, elegant typography, and 3-tier design token architecture. Use when styling UI, web applications, components, landing pages, or whenever the user asks for Claude-style UI, Claude theme, or editorial frontend design.
---

# Claude Design System & Editorial Theme

Apply Anthropic's signature aesthetic: warm, literary, editorial, tactile, and thoughtfully composed—the direct antithesis of cold-blue, generic AI SaaS templates.

## 1. Visual Philosophy & Identity

Claude's interface design draws inspiration from classic publishing, book design, and high-end print editorial layout:
- **Warm, tactile surfaces** that evoke archival parchment and heavy stock paper rather than harsh glowing screens.
- **Thoughtful typographic pairings** contrasting characterful literary serif headlines with ultra-clean, readable humanist sans-serif body copy.
- **Terracotta & earthy accents** used with disciplined restraint as deliberate focal points.
- **Airy, intentional spacing rhythms** adhering to a 4px / 8px baseline grid with generous line heights.

---

## 2. Color Palette & Design Tokens

### Core Neutral Palette
- **Parchment Base (Background)**: `#faf9f5` (warm cream/paper; avoid pure `#ffffff`)
- **Parchment Dark / Card Surface**: `#f5f4ed` (subtle contrast card background)
- **Charcoal (Primary Text)**: `#141413` (rich warm black; avoid harsh `#000000`)
- **Muted Charcoal (Secondary Text)**: `#5c5b56` (high legibility, WCAG AAA compliant)
- **Subtle Gray (Muted / Placeholder)**: `#807d77`
- **Hairline Border**: `#e8e6dc` (delicate, tactile border lines)
- **Hover / Active Surface**: `#edebe3`

### Accent Palette
- **Claude Terracotta / Rust (Primary Accent)**: `#d97757` or `#c96442`
  - Hover: `#c26546`
  - Active: `#ab5437`
  - Soft Tint / Badge: `#faece6`
- **Slate Sky (Secondary Accent)**: `#6a9bcc`
  - Soft Tint: `#edf4fa`
- **Sage Olive (Tertiary Accent)**: `#788c5d`
  - Soft Tint: `#f1f4ed`
- **Amber Gold (Highlight / Warning)**: `#cf9d39`

### Dark Mode Tokens (Warm Editorial Dark)
- **Dark Base (Background)**: `#1c1b18` (deep warm graphite; never cold `#0f172a`)
- **Dark Surface / Card**: `#262522`
- **Dark Border**: `#383632`
- **Dark Primary Text**: `#f4f3ef`
- **Dark Secondary Text**: `#a6a49c`
- **Dark Accent**: `#e08365`

---

## 3. Typography Hierarchy

### Font Families
- **Display / Headings**:
  - Primary: `Lora`, `Newsreader`, `Playfair Display`, or `Georgia` (literary serif).
  - Alternative Modern: `Poppins`, `Plus Jakarta Sans` (editorial geometric).
  - CSS Fallback: `'Lora', 'Georgia', 'Cambria', serif`.
- **Body & Interface**:
  - Primary: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`.
  - Reading flow: Line-height `1.6` to `1.75`.
- **Code & Data**:
  - Primary: `'JetBrains Mono', 'Fira Code', 'SF Mono', Consolas, monospace`.

### Type Scale
- **H1 (Hero)**: `clamp(2.5rem, 5vw, 3.75rem)` | Font-weight: `500` or `600` | Line-height: `1.15` | Tracking: `-0.02em`
- **H2 (Section)**: `clamp(1.75rem, 3.5vw, 2.5rem)` | Font-weight: `500` | Line-height: `1.2`
- **H3 (Subheading)**: `1.375rem` (22px) | Font-weight: `600` | Line-height: `1.35`
- **Body Regular**: `1rem` (16px) | Font-weight: `400` | Line-height: `1.65`
- **Caption / Meta**: `0.875rem` (14px) | Font-weight: `400` | Color: `#5c5b56`

---

## 4. UI Component Patterns

### Buttons
- **Primary Button**:
  - Background: `#141413` (Charcoal) with text `#faf9f5`, or Terracotta `#d97757` with text `#ffffff`.
  - Border radius: `6px` or `8px` (refined, slight rounding; avoid pill shape unless explicitly requested).
  - Padding: `0.625rem 1.25rem` (10px 20px).
  - Hover: Subtle elevation, background `#2b2a27` (or `#c26546`).
- **Secondary Button**:
  - Background: `transparent`.
  - Border: `1px solid #e8e6dc`.
  - Text: `#141413`.
  - Hover: Background `#f5f4ed`, border `#d5d2c7`.

### Cards & Surfaces
- Flat or subtle paper elevation:
  - Background: `#faf9f5` or `#ffffff`.
  - Border: `1px solid #e8e6dc`.
  - Shadow: `0 1px 3px rgba(20, 20, 19, 0.04), 0 1px 2px rgba(20, 20, 19, 0.02)` (gentle tactile shadow, never heavy black blur).

### Code Blocks & Artifacts
- Background: `#f5f4ed` (Light) or `#181715` (Dark).
- Border: `1px solid #e8e6dc`.
- Header bar: Discreet language tag, copy button in secondary text style.

---

## 5. CSS / Tailwind Quick Reference

### CSS Custom Properties
```css
:root {
  --claude-bg: #faf9f5;
  --claude-surface: #f5f4ed;
  --claude-text: #141413;
  --claude-text-muted: #5c5b56;
  --claude-border: #e8e6dc;
  --claude-terracotta: #d97757;
  --claude-terracotta-hover: #c26546;
  --claude-terracotta-soft: #faece6;
  --claude-font-serif: 'Lora', 'Georgia', serif;
  --claude-font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --claude-font-mono: 'JetBrains Mono', monospace;
}
```

### Tailwind Config Preset Snippet
```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        claude: {
          bg: '#faf9f5',
          surface: '#f5f4ed',
          text: '#141413',
          muted: '#5c5b56',
          border: '#e8e6dc',
          terracotta: {
            DEFAULT: '#d97757',
            hover: '#c26546',
            soft: '#faece6',
          },
          slate: '#6a9bcc',
          olive: '#788c5d',
        }
      },
      fontFamily: {
        serif: ['Lora', 'Georgia', 'serif'],
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      }
    }
  }
}
```

---

## 6. Anti-Patterns & Rules to Follow
1. **NEVER use generic purple-to-indigo or blue gradients** (`from-indigo-500 to-purple-600`).
2. **NEVER use pure black (`#000000`) text on pure stark white (`#ffffff`) background**.
3. **NEVER use default AI bootstrap look** (e.g. cold blue `#2563eb` buttons, standard uncurated Inter font everywhere).
4. **DO pair serif headlines with clean body copy** to give products a curated, authorial personality.
5. **DO prioritize readability, high contrast, and tactile restraint.**
