---
name: emil-kowalski
description: >-
  Apply Emil Kowalski's UI engineering philosophy: purposeful animation,
  tactile micro-interactions, spring physics, and sub-300ms timing rules.
  Activate when building interactive UI components, implementing animations,
  hover states, button feedback, popovers, tooltips, or any motion design.
  Also use when auditing existing UI for "motion slop" or stiff interactions.
---

# Emil Kowalski Design Engineering

## Core Animation Philosophy

**Motion must solve a UX problem.** Valid reasons to animate:
- Establishing spatial awareness (e.g. a drawer slides from where it belongs)
- Providing immediate feedback (button press confirms action)
- Indicating state changes (loading → success → error)
- Preventing jarring content shifts (layout transitions)

**Do NOT** animate just for decoration. Every animation must justify its existence.

---

## The <300ms Rule

UI animations MUST execute under 300ms. This creates perceived performance
and makes the interface feel deeply connected to user intent. Anything longer
feels sluggish and detached from the click/tap.

| Duration | Use Case |
|----------|---------|
| 50–100ms | Button `:active` state, instant feedback |
| 100–200ms | Tooltips, small popovers, badges |
| 150–250ms | Modal open/close, dropdowns, sheet slide-in |
| 250–300ms | Page transitions, complex layout shifts |
| 300ms+ | Onboarding flows, celebrations — use sparingly |

---

## Easing Rules

| Scenario | Easing | Reason |
|----------|--------|--------|
| Element **entering** the screen | `ease-out` | Fast start = immediate feedback, decelerates to rest |
| Element **leaving** the screen | `ease-in` | Accelerates away, feels intentional |
| **NEVER** for entrances | `ease-in` | Starts slow = feels laggy when eyes are locked on it |
| Generic CSS `ease` | Avoid | Lacks personality and punch |
| `linear` | Only for infinite loops | Feels mechanical for one-shot animations |

**Always prefer custom cubic-bezier curves:**

```css
/* Snappy entrance — the Emil signature curve */
transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);

/* Smooth exit */
transition: all 0.15s cubic-bezier(0.7, 0, 1, 1);

/* Spring-like bounce (for playful moments) */
transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
```

---

## Micro-Interactions Checklist

### ✅ Buttons — The `:active` State

Interfaces must feel like they are "listening." The moment a user clicks,
they need physical confirmation. Add tactile feedback:

```css
button {
  transition: transform 0.1s cubic-bezier(0.16, 1, 0.3, 1),
              opacity 0.1s ease;
}

button:active {
  transform: scale(0.97);
}

/* For icon buttons */
.icon-button:active {
  transform: scale(0.9);
}
```

### ✅ Scale Entrances — NEVER from `scale(0)`

Objects appearing from nothing feel unnatural and cheap. Real-world objects
retain their shape even when deflated — they shrink but don't disappear.

```css
/* ❌ Wrong — element appears from nothing */
@keyframes enter-wrong {
  from { transform: scale(0); opacity: 0; }
  to   { transform: scale(1); opacity: 1; }
}

/* ✅ Correct — element exists but is small */
@keyframes enter-correct {
  from { transform: scale(0.93); opacity: 0; }
  to   { transform: scale(1);    opacity: 1; }
}

/* For elements that drop in from above */
@keyframes enter-from-top {
  from { transform: translateY(-8px) scale(0.96); opacity: 0; }
  to   { transform: translateY(0)    scale(1);    opacity: 1; }
}
```

### ✅ Tooltips — Intentional Delay + Instant Switching

```css
/* First hover: slight delay to prevent accidental trigger */
[data-tooltip] {
  --tooltip-delay: 300ms;
}

/* Once user is actively navigating tooltips: zero delay */
.tooltip-active-zone [data-tooltip] {
  --tooltip-delay: 0ms;
}
```

In JavaScript/React:
```tsx
// Track if user has recently seen a tooltip
const [hasSeenTooltip, setHasSeenTooltip] = useState(false);

<Tooltip
  delayDuration={hasSeenTooltip ? 0 : 300}
  onOpenChange={(open) => { if (open) setHasSeenTooltip(true); }}
>
```

### ✅ Popovers — Origin-Based Scaling

Popovers must scale FROM their trigger element, not from the center of the screen.

```css
/* Trigger is at top-left of popover */
.popover[data-side="bottom"] {
  transform-origin: top center;
}
.popover[data-side="top"] {
  transform-origin: bottom center;
}
.popover[data-side="left"] {
  transform-origin: right center;
}
.popover[data-side="right"] {
  transform-origin: left center;
}

@keyframes popover-in {
  from { transform: scale(0.95); opacity: 0; }
  to   { transform: scale(1);    opacity: 1; }
}

.popover[data-state="open"] {
  animation: popover-in 0.18s cubic-bezier(0.16, 1, 0.3, 1);
}
```

### ✅ Hover States — Subtle, Not Dramatic

```css
/* Cards */
.card {
  transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1),
              box-shadow 0.2s ease;
}
.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0,0,0,0.12);
}

/* Links */
a {
  transition: opacity 0.15s ease;
}
a:hover {
  opacity: 0.7;
}
```

---

## Spring Physics

Use spring physics for organic, physical motion. Preferred: Framer Motion.

```tsx
// Framer Motion — snappy UI control
transition={{ type: "spring", stiffness: 400, damping: 30 }}

// Framer Motion — playful bounce
transition={{ type: "spring", stiffness: 300, damping: 20 }}

// Framer Motion — heavy, satisfying
transition={{ type: "spring", stiffness: 200, damping: 40, mass: 1.2 }}
```

Tuning guide:
| Feel | Stiffness | Damping | Mass |
|------|-----------|---------|------|
| Snappy, crisp | 400–600 | 30–40 | 1 |
| Smooth, fluid | 200–300 | 25–35 | 1 |
| Bouncy, playful | 150–250 | 10–20 | 0.8 |
| Heavy, satisfying | 150–200 | 40–60 | 1.5 |

---

## GPU Performance Rules

**ONLY animate GPU-accelerated properties:**
- ✅ `transform` (translate, scale, rotate, skew)
- ✅ `opacity`
- ✅ `filter` (with care — compositing)
- ❌ `width`, `height` → triggers layout
- ❌ `top`, `left`, `margin`, `padding` → triggers layout
- ❌ `background-color` → triggers paint (use opacity trick instead)

```css
/* ❌ Expensive — triggers layout reflow */
.wrong { transition: width 0.3s ease; }

/* ✅ GPU-accelerated equivalent */
.right { transition: transform 0.3s ease; transform: scaleX(1); }
```

Use `will-change: transform` **sparingly** — only for elements that animate
frequently (e.g., a persistent sidebar). Overusing it wastes GPU memory.

---

## Frequency-Based Design

| Action Frequency | Animation Approach | Max Duration |
|-----------------|-------------------|--------------|
| 100+ times/day (clicking main button) | Minimal: subtle scale only | 100ms |
| 10–50 times/day (opening dropdowns) | Moderate: scale + fade | 200ms |
| 1–10 times/day (opening modal) | Expressive: spring slide | 250ms |
| Rare (onboarding, empty state) | Cinematic: spring bounce | 400ms |
| Once (first login) | Choreographed sequence | 600ms+ |
