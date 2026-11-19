---
id: cognitive-ergonomics
title: Cognitive Ergonomics and Human Factors
discipline: D28
category: cognitive-ergonomics
kind: discipline
description: Apply quantitative biomechanical, attentional, and high-acuity diagnostic ergonomics across AI consoles, operational cockpits, and multi-surface interfaces.
keywords:
  - cognitive ergonomics
  - human factors
  - domain 8 ergonomics
  - fitts law
  - hick-hyman law
  - millers law
  - endsley situation awareness
  - isa-18.2 alarm rationalization
  - battlestation mode
  - temporal scrubbing
triggers:
  - designing an AI console or operational dashboard for human operators
  - reducing cognitive load and alarm fatigue in high-acuity workflows
  - sizing interactive targets, spacing moats, and surface contrast budgets
  - adapting interfaces across mobile, desktop, vehicle, wearable, and foldable surfaces
provenance:
  - PARADIGM_18
  - PARADIGM_61
  - PARADIGM_62
  - PARADIGM_77
  - PARADIGM_78
maturity: stable
---

# Cognitive Ergonomics and Human Factors

## Overview

High-consequence AI and operational interfaces fail when they treat the human operator as an unbounded processor with uniform visual acuity, steady hands, and infinite attention. Quantitative cognitive ergonomics (`D28`) enforces measurable biomechanical bounds, working-memory budgets, surface-specific luminance and glance constraints, and crisis-time interface simplification.

Use this discipline to align layout geometry, motion damping, alert triage, predictive forecasting, and temporal playback with real human sensory and motor limits.

## Decision Rules

Select the specialized guide that resolves the primary ergonomic bottleneck in your interface:

### Rule 1: Motor precision, choice overload, or visual clutter (`fitts-moat-and-hick-hyman-budgets`)

Apply when users mis-tap adjacent controls, hesitate over oversized toolbars, or confront dense walls of cards and nested borders. Enforce pointer-variance collision moats (`d_moat`), `>= 44x44px` touch / `>= 48x48px` emergency targets, Miller/Halford `<= 4–7` chunks, `W_density` in `[0.22, 0.45]`, and single-beacon viewport arbitration.

### Rule 2: Physical form factor or harsh lighting mismatch (`environmental-surface-archetypes`)

Apply when the same UI runs across outdoor sunlight mobile, desktop studios, vehicle consoles, wearables, or dual-screen foldables. Enforce `>= 7:1` outdoor contrast, `<= 14`-word / `300ms` glance budgets, thumb-zone escapes, and `viewport-segments` fold avoidance.

### Rule 3: Retrospective telemetry hiding future risk (`endsley-predictive-horizon-projection`)

Apply when dashboards only report past or current state (Endsley Levels 1–2). Upgrade to explicit `t+5m`, `t+15m`, and `t+30m` trajectory horizons with calibrated confidence intervals, pre-execution What-If blast-radius sandboxes, and dual-signatory shift handovers.

### Rule 4: Secondary alert storms drowning root causes (`cascade-alarm-rationalization`)

Apply when a single upstream fault triggers dozens of downstream warnings. Enforce ANSI/ISA-18.2 cascade suppression (`>= 90%` alarm reduction) to collapse secondary floods into prioritized root causes within working-memory limits.

### Rule 5: Acute crisis or operator tunnel vision (`stress-adaptive-battlestation-mode`)

Apply when operators must stabilize a live anomaly under physiological stress. Provide an instant Battle-Station mode that dims or marks peripheral panels `inert`, caps active chunks at `<= 3`, expands actuators to `>= 48px`, and boosts chromatic contrast.

### Rule 6: Post-incident diagnosis or trajectory verification (`blackbox-temporal-event-scrubbing`)

Apply when operators need to trace what preceded a fault or project forward momentum. Render a `60fps` (`<= 16ms` seek) bidirectional scrubber spanning historical black-box frames, live telemetry, and predictive projections without layout reflow.

## Implementation Pattern

Anchor every D28 interface around shared ergonomic custom properties and a single-authority viewport beacon arbitrator so motor spacing, touch minimums, and focal hierarchy adapt automatically to input modality and scroll position.

```html
<main class="ergo-workspace" data-surface-archetype="DESKTOP_OPERATOR_STUDIO">
  <section class="ergo-band" aria-labelledby="dispatch-heading">
    <header class="ergo-band-header">
      <h1 id="dispatch-heading">Feeder Stabilization</h1>
      <p class="ergo-glance-summary">Two feeders healthy; one inverter running warm.</p>
    </header>

    <div class="ergo-action-cluster" role="group" aria-label="Primary dispatch controls">
      <button type="button" class="ergo-actuator" data-ui-ir-focus-tier="TIER_1_GOAL_BEACON">
        Isolate Feeder 4B
      </button>
      <button type="button" class="ergo-actuator" data-ui-ir-focus-tier="TIER_3_COEXISTING_CAPABILITY">
        Inspect Thermal Trend
      </button>
    </div>
  </section>
</main>
```

```css
:root {
  --ergo-target-min: 28px;
  --ergo-d-moat: 6px;
  --ergo-d1-intra: 6px;
  --ergo-d2-inter: 14px;
  --ergo-d3-moat: 28px;
  --ergo-surface: #ffffff;
  --ergo-ink: #0f172a;
  --ergo-beacon-bg: #0f766e;
  --ergo-beacon-ink: #ffffff;
}

@media (pointer: coarse) {
  :root {
    --ergo-target-min: 44px;
    --ergo-d-moat: 10px;
  }
}

.ergo-workspace {
  display: grid;
  gap: var(--ergo-d3-moat);
  padding: clamp(1rem, 2.5vw, 2rem);
  background: var(--ergo-surface);
  color: var(--ergo-ink);
}

.ergo-band {
  display: grid;
  gap: var(--ergo-d2-inter);
  max-inline-size: 72ch;
}

.ergo-action-cluster {
  display: flex;
  flex-wrap: wrap;
  gap: max(var(--ergo-d-moat), var(--ergo-d1-intra));
}

.ergo-actuator {
  min-block-size: var(--ergo-target-min);
  min-inline-size: var(--ergo-target-min);
  padding: 0.55rem 1rem;
  border-radius: 8px;
  border: 1px solid #94a3b8;
  background: transparent;
  color: inherit;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}

.ergo-actuator[data-ui-ir-focus-tier="TIER_1_GOAL_BEACON"] {
  background: var(--ergo-beacon-bg);
  border-color: var(--ergo-beacon-bg);
  color: var(--ergo-beacon-ink);
}

.ergo-actuator:focus-visible {
  outline: 3px solid #0284c7;
  outline-offset: 3px;
}

@media (prefers-reduced-motion: reduce) {
  .ergo-workspace *,
  .ergo-workspace *::before,
  .ergo-workspace *::after {
    transition: none !important;
    animation: none !important;
  }
}
```

```javascript
// Enforce <= 1 active TIER_1_GOAL_BEACON across visible viewport bands
export function arbitrateViewportGoalBeacon(root = document) {
  const candidates = [...root.querySelectorAll('[data-ui-ir-focus-tier="TIER_1_GOAL_BEACON"], [data-ui-ir-focus-tier="TIER_2_STANDBY_SECTION_BEACON"]')];
  if (candidates.length === 0) return;

  let winner = null;
  let bestScore = -1;

  for (const el of candidates) {
    const rect = el.getBoundingClientRect();
    const visible = rect.bottom > 0 && rect.top < window.innerHeight && rect.width > 0 && rect.height > 0;
    if (!visible) continue;
    const centerDist = Math.abs((rect.top + rect.bottom) / 2 - window.innerHeight * 0.45);
    const score = 1 / (1 + centerDist);
    if (score > bestScore) {
      bestScore = score;
      winner = el;
    }
  }

  for (const el of candidates) {
    el.setAttribute(
      'data-ui-ir-focus-tier',
      el === winner ? 'TIER_1_GOAL_BEACON' : 'TIER_2_STANDBY_SECTION_BEACON'
    );
  }
}
```

## Guidelines

- **DO** bind interactive target sizes (`--ergo-target-min`) and inter-control collision moats (`--ergo-d-moat`) to real pointer precision (`@media (pointer: coarse)` vs fine desktop).
- **DO** enforce strict resting density equilibrium (`W_density` in `[0.22, 0.45]`, `<= 4–7` working-memory chunks per view) so critical signals stand out without visual congestion.
- **DO** isolate emergency or primary actions with a single `TIER_1_GOAL_BEACON` per viewport rather than rendering competing solid-fill primary buttons.
- **DON'T** rely on raw past/current metrics alone in high-risk interfaces; pair them with forward projection horizons (`t+5m`, `t+15m`, `t+30m`) and uncertainty intervals.
- **DON'T** dump ungrouped secondary alarms or hover-only tooltips onto operational views; rationalize cascades and keep every critical actuator keyboard-reachable.

## Verification & Fallbacks

Run automated DOM geometry checks at both desktop (`1440x900`, fine pointer) and mobile (`390x844`, coarse pointer):

1. **Target & Moat Audit:** Assert `rect.width >= 44 && rect.height >= 44` for every interactive button/control when `(pointer: coarse)` is emulated, and assert minimum edge-to-edge separation `>= d_moat` (`8px` mobile, `4px` desktop) between sibling hitboxes.
2. **Single-Beacon Audit:** Assert `document.querySelectorAll('[data-ui-ir-focus-tier="TIER_1_GOAL_BEACON"]')` intersecting the viewport has length `<= 1` across scroll stops (`0%` to `100%` scroll height).
3. **Zero Overflow:** Assert `document.documentElement.scrollWidth <= document.documentElement.clientWidth` at `320px`, `390px`, and `1440px`.

Fallbacks: When `@media (pointer: coarse)` is unsupported or hybrid touch-laptops switch input modes, default emergency/dispatch actuators to `>= 44px` via `min-block-size` and expand via padding rather than fixed heights so OS font scaling never clips labels.

## Related Guides

- `fitts-moat-and-hick-hyman-budgets` (via `npx haii-guidance retrieve "fitts-moat-and-hick-hyman-budgets"`)
- `environmental-surface-archetypes` (via `npx haii-guidance retrieve "environmental-surface-archetypes"`)
- `endsley-predictive-horizon-projection` (via `npx haii-guidance retrieve "endsley-predictive-horizon-projection"`)
- `cascade-alarm-rationalization` (via `npx haii-guidance retrieve "cascade-alarm-rationalization"`)
- `stress-adaptive-battlestation-mode` (via `npx haii-guidance retrieve "stress-adaptive-battlestation-mode"`)
- `blackbox-temporal-event-scrubbing` (via `npx haii-guidance retrieve "blackbox-temporal-event-scrubbing"`)
