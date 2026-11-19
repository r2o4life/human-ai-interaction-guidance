---
id: environmental-surface-archetypes
title: Environmental Surface Archetypes & Foldable Viewport Segments
discipline: D28
category: cognitive-ergonomics
kind: use-case
description: Adapt luminance contrast (>=7:1), glance word budgets (<=14 words / 300ms), touch targets, and viewport-segment grids across handheld outdoor, desktop studio, mounted vehicle, wearable, and foldable surfaces.
keywords:
  - surface archetypes
  - handheld outdoor sunlight contrast
  - desktop operator studio
  - mounted vehicle console
  - embedded wearable
  - foldable horizontal-viewport-segments
  - glance budget 14 words 300ms
  - thumb zone escapability
  - safe area insets
triggers:
  - designing mobile interfaces used outdoors in high glare or direct sunlight
  - building in-vehicle consoles, wrist wearables, or field-mounted displays
  - preventing content and controls from splitting across a foldable device hinge
  - setting glance word budgets and thumb-zone abort actions by hardware posture
provenance:
  - PARADIGM_18
  - PARADIGM_52
  - PARADIGM_92
  - PARADIGM_93
maturity: stable
---

# Environmental Surface Archetypes & Foldable Viewport Segments

## Overview

Treating every viewport as a generic responsive breakpoint (`@media (min-width: 768px)`) ignores physical glare, motion vibration, thumb reach, and dual-screen hinges. A pedestrian reading outdoors under glare cannot parse a low-contrast multi-column table, and an operator on a foldable tablet cannot tap a button straddling the physical hinge crease. Bind rendering to explicit physical surface archetypes (`surface.schema.json`) and foldable viewport segments.

## Decision Rules

Apply the rules matching the target hardware and physical environment:

| Archetype | Contrast Floor | Target Floor | Glance & Decision Budget | Structural Rule |
| :--- | :--- | :--- | :--- | :--- |
| `HANDHELD_OUTDOOR_HIGH_LUMINANCE` | `>= 7:1` (AAA) | `>= 44x44px` | `<= 14` words / `300ms`; `<= 3.0s` digest | Bottom thumb-zone primary + `1-tap` abort; `safe-area-inset-*` |
| `DESKTOP_OPERATOR_STUDIO` | `>= 4.5:1` (AA) | `>= 24x24px` (`28px` ideal) | Multi-column `60–75ch` measure | Keyboard shortcuts + multi-pane preview inspectors |
| `MOUNTED_OPERATIONAL_CONSOLE` | `>= 7:1` | `>= 48–56px` | Immediate peripheral readability | Zero hover-only UI; oversized step controls for vibration |
| `EMBEDDED_MINIATURE_WEARABLE` | `>= 7:1` | `>= 48px` | `1` status chip + `1` abort/ack action | Suppress multi-row prose and nested scrolling |
| `FOLDABLE_DUAL_SCREEN` | Surface-matched | `>= 44px` | Split left/right logical panes | Align columns to `viewport-segment-width`; never span hinge |

### Rule 1: Enforce outdoor luminance and glance ceilings

When operating outdoors or in motion (`HANDHELD_OUTDOOR_HIGH_LUMINANCE`, `MOUNTED_OPERATIONAL_CONSOLE`), clamp primary status chips to `<= 14` words (`300ms` peripheral glance budget) and elevate text/surface contrast to `>= 7:1` rather than translucent muted grays.

### Rule 2: Keep primary and abort controls inside the thumb zone

On handheld and mounted surfaces, anchor primary progression and `1-tap` hard-abort actions to the bottom reach zone padded by `env(safe-area-inset-bottom, 0px)` and pair `scroll-padding-bottom` so focused elements are never obscured by fixed bars (WCAG 2.4.11).

### Rule 3: Respect physical folds with `viewport-segments`

On dual-screen or foldable devices (`(horizontal-viewport-segments: 2)` or `(vertical-viewport-segments: 2)`), map layout grids explicitly to the physical segment boundary using `env(viewport-segment-width 0 0)` and `env(viewport-segment-left 1 0)` so dialogs, charts, and primary buttons never cross the fold hinge.

## Implementation Pattern

```html
<div class="surface-shell" data-surface-archetype="DESKTOP_OPERATOR_STUDIO">
  <section class="surface-pane surface-pane--primary" aria-labelledby="surface-status-title">
    <h1 id="surface-status-title">Route Status</h1>
    <!-- <= 14-word peripheral glance chip -->
    <p class="surface-glance-chip" data-glance-words="9">
      All 4 checkpoints clear. Next handoff at 14:20.
    </p>
  </section>

  <section class="surface-pane surface-pane--controls" aria-label="Thumb-zone actions">
    <div class="surface-thumb-dock">
      <button type="button" class="surface-btn surface-btn--primary">Confirm Check-In</button>
      <button type="button" class="surface-btn surface-btn--abort">Abort Hold</button>
    </div>
  </section>
</div>
```

```css
:root {
  --surface-bg: #ffffff;
  --surface-ink: #0f172a;
  --surface-contrast-border: #334155;
  --surface-target-min: 28px;
}

/* Outdoor sunlight & mounted console high-luminance floor (>= 7:1 contrast) */
[data-surface-archetype="HANDHELD_OUTDOOR_HIGH_LUMINANCE"],
[data-surface-archetype="MOUNTED_OPERATIONAL_CONSOLE"],
[data-surface-archetype="EMBEDDED_MINIATURE_WEARABLE"] {
  --surface-bg: #ffffff;
  --surface-ink: #020617;
  --surface-target-min: 48px;
  background: var(--surface-bg);
  color: var(--surface-ink);
}

@media (prefers-color-scheme: dark) {
  [data-surface-archetype="MOUNTED_OPERATIONAL_CONSOLE"],
  [data-surface-archetype="EMBEDDED_MINIATURE_WEARABLE"] {
    --surface-bg: #020617;
    --surface-ink: #ffffff;
  }
}

.surface-shell {
  display: grid;
  gap: 1rem;
  min-block-size: 100dvh;
  padding: max(1rem, env(safe-area-inset-top, 0px))
           max(1rem, env(safe-area-inset-right, 0px))
           max(1rem, env(safe-area-inset-bottom, 0px))
           max(1rem, env(safe-area-inset-left, 0px));
}

.surface-glance-chip {
  font-weight: 700;
  font-size: clamp(1rem, 2.2vw, 1.25rem);
  padding: 0.75rem 1rem;
  border: 2px solid var(--surface-contrast-border);
  border-radius: 10px;
}

.surface-thumb-dock {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

[data-surface-archetype="HANDHELD_OUTDOOR_HIGH_LUMINANCE"] .surface-thumb-dock {
  position: sticky;
  inset-block-end: max(0.75rem, env(safe-area-inset-bottom, 0px));
  background: var(--surface-bg);
  padding-block: 0.5rem;
}

.surface-btn {
  min-block-size: var(--surface-target-min);
  min-inline-size: var(--surface-target-min);
  padding: 0.65rem 1.2rem;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 90ms ease;
}

.surface-btn:active {
  transform: scale(0.98);
}

.surface-btn--primary {
  background: #0f766e;
  color: #ffffff;
  border: 2px solid #0f766e;
}

.surface-btn--abort {
  background: #ffffff;
  color: #991b1b;
  border: 2px solid #991b1b;
}

/* Foldable dual-screen segment alignment: zero controls crossing hinge */
@media (horizontal-viewport-segments: 2) {
  .surface-shell {
    grid-template-columns: env(viewport-segment-width 0 0, 50%) 1fr;
    column-gap: calc(env(viewport-segment-left 1 0, 50%) - env(viewport-segment-width 0 0, 50%));
  }
}

@media (vertical-viewport-segments: 2) {
  .surface-shell {
    grid-template-rows: env(viewport-segment-height 0 0, 50%) 1fr;
    row-gap: calc(env(viewport-segment-top 1 0, 50%) - env(viewport-segment-height 0 0, 50%));
  }
}
```

```javascript
export function resolveSurfaceArchetype() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const hasFoldSegments =
    window.matchMedia('(horizontal-viewport-segments: 2), (vertical-viewport-segments: 2)').matches ||
    (window.viewport?.segments?.length ?? 1) > 1;

  if (width <= 260 && height <= 320) return 'EMBEDDED_MINIATURE_WEARABLE';
  if (hasFoldSegments) return 'FOLDABLE_DUAL_SCREEN';
  if (coarse && width < 768) return 'HANDHELD_OUTDOOR_HIGH_LUMINANCE';
  return 'DESKTOP_OPERATOR_STUDIO';
}

export function applySurfaceArchetype(shellEl) {
  const archetype = resolveSurfaceArchetype();
  shellEl.setAttribute('data-surface-archetype', archetype);

  // Enforce <= 14-word glance ceiling on outdoor/wearable chips
  const maxWords = archetype === 'EMBEDDED_MINIATURE_WEARABLE' ? 6 : 14;
  shellEl.querySelectorAll('.surface-glance-chip').forEach((chip) => {
    const words = chip.textContent.trim().split(/\s+/);
    if (words.length > maxWords && archetype !== 'DESKTOP_OPERATOR_STUDIO') {
      chip.textContent = `${words.slice(0, maxWords).join(' ')}…`;
    }
  });
}
```

## Guidelines

- **DO** enforce `>= 7:1` contrast (solid high-contrast ink/canvas tokens) for outdoor handheld, vehicle-mounted, and wearable surfaces—avoid semi-transparent frosted glass over busy backgrounds.
- **DO** cap Tier-1 glance chips at `<= 14` words (`<= 6` words on wearables) and pad fixed bars with `env(safe-area-inset-*)`.
- **DO** bind dual-pane layouts to `@media (horizontal-viewport-segments: 2)` and `env(viewport-segment-width 0 0)` so controls stay cleanly inside one physical display segment.
- **DON'T** require hover (`:hover`) to reveal labels or status explanations on touch, mounted, or foldable surfaces.
- **DON'T** use `scroll-padding-bottom: 0` when rendering bottom thumb-zone bars; keyboard focus must stay unobscured.

## Verification & Fallbacks

1. **Contrast & Target Verification:** Audit computed foreground/background contrast (`>= 7.0:1` for outdoor/mounted/wearable, `>= 4.5:1` desktop) and target boxes (`>= 44x44px` coarse, `>= 48px` mounted/wearable).
2. **Foldable Segment Check:** Emulate dual-segment posture (`width: 1114px` or `horizontal-viewport-segments: 2`) in Playwright and verify primary buttons sit strictly left or right of the hinge offset (`x + width <= left_segment_width || x >= right_segment_left`).
3. **Glance Budget Check:** Assert `.surface-glance-chip` word count `<= 14` on mobile/outdoor postures.

Fallbacks: Standard single-screen browsers ignore `@media (horizontal-viewport-segments: 2)` and `env(viewport-segment-*)` and fall back to the single-column `1fr` / `auto-fit` grid cleanly; add a `@media (min-width: 900px)` two-column layout if desktop side-by-side panes are also desired.

## Related Guides

- `cognitive-ergonomics` (via `npx haii-guidance retrieve "cognitive-ergonomics"`)
- `fitts-moat-and-hick-hyman-budgets` (via `npx haii-guidance retrieve "fitts-moat-and-hick-hyman-budgets"`)
- `stress-adaptive-battlestation-mode` (via `npx haii-guidance retrieve "stress-adaptive-battlestation-mode"`)
- `split-stage-3order-companion` (via `npx haii-guidance retrieve "split-stage-3order-companion"`)
