---
id: fitts-moat-and-hick-hyman-budgets
title: "Fitts's Moat, Hick-Hyman Choice Caps & Single-Beacon Arbitration"
discipline: D28
category: cognitive-ergonomics
kind: use-case
description: Size interactive targets and pointer-variance collision moats, cap working-memory choice cardinality, maintain resting whitespace equilibrium, and arbitrate a single primary beacon per viewport.
keywords:
  - fitts law
  - collision moat d_moat
  - hick-hyman law
  - millers law working memory
  - touch target 44px 48px
  - spring overshoot damping
  - information density W_density
  - single beacon arbitration
  - TIER_1_GOAL_BEACON
triggers:
  - preventing accidental mis-clicks or fat-finger errors between adjacent buttons
  - choosing between toggle, segmented control, popover menu, or combobox by item count
  - reducing dense UI clutter into 4-7 working-memory chunks and balanced whitespace
  - fixing competing primary CTA buttons across a single viewport
provenance:
  - PARADIGM_77
  - PARADIGM_78
  - PARADIGM_92
  - PARADIGM_97
maturity: stable
---

# Fitts's Moat, Hick-Hyman Choice Caps & Single-Beacon Arbitration

## Overview

Adjacent buttons cause accidental clicks when spacing ignores pointer positional variance (`sigma_p`), and dense toolbars stall operator decisions when visible options exceed human working-memory limits (`C_WM <= 4–7` chunks). Combining Fitts's Law moats (`d_moat`), Hick-Hyman morphology thresholds, balanced resting density (`W_density` in `[0.22, 0.45]`), and strict single-beacon arbitration eliminates motor slips and visual competition simultaneously.

## Decision Rules

### Rule 1: Scale hitboxes and collision moats (`d_moat`) to pointer variance

Derive target dimensions and spacing from Fitts's Index of Difficulty (`ID = log2(2D / W_eff)`) and pointer variance (`d_moat >= k * sigma_p`):

- **Coarse Touch (`pointer: coarse`):** Minimum `44x44px` hitbox (`48x48px` for primary/emergency actions), `8–12px` collision moat (`d_moat`), and `16px` outer screen-edge bleed.
- **Fine Desktop (`pointer: fine`):** Minimum `24x24px` (`26–28px` recommended), `4–6px` collision moat (`d_moat`), and `24–40px` macro-gutters.
- **Emergency / High-Stress Actuators:** Minimum `48x48px` regardless of pointer type, with `>= 12px` moat from any destructive sibling control.
- **Topological Spacing Hierarchy:** Keep intra-entity gaps smaller than inter-tuple gaps and inter-operator moats (`d_1 < d_2 < d_3`, e.g., `6px < 14px < 28px`).

### Rule 2: Clamp spring overshoot against the collision moat

Never allow animated transitions to swing an element into a neighbor's moat during flight. Enforce peak excursion `A_overshoot <= 0.5 * d_moat`. If an underdamped elastic spring (`zeta < 1.0`) produces `deltaX * exp(-pi * zeta / sqrt(1 - zeta^2)) > 0.5 * d_moat`, automatically clamp damping to `zeta >= 1.0` (critically damped, zero overshoot).

### Rule 3: Select control morphology by Hick-Hyman cardinality (`N`)

Hick-Hyman decision latency grows logarithmically with options (`H = log2(N + 1)`). Route option sets deterministically by cardinality `N` and cap working-memory chunks at `C_WM <= 4` propositions per band (`<= 7` max) and `<= 24` characters per wayfinding chip:

- `N = 2`: Binary toggle switch, checkbox, or two-option `<fieldset>` radio pair.
- `2 < N <= 5`: Inline segmented control or radio group (`<= 1` unclipped row on desktop).
- `6 <= N <= 20`: Collapsed native `[popover]` menu or `<select>`.
- `N > 20`: Searchable filterable combobox or Choice 2B floating match window.

### Rule 4: Maintain resting density equilibrium and single-beacon salience

Keep resting surface ink density `W_density` within `[0.22, 0.45]` (interstitial openness `W_interstitial >= 0.55`) and nested border depth `D_nest <= 2` (avoid card-inside-card-inside-card boxing). Crown at most ONE active `TIER_1_GOAL_BEACON` across any active viewport window; demote off-focus section CTAs to `TIER_2_STANDBY_SECTION_BEACON` (outlined accent) and peripheral utilities to `TIER_4_AMBIENT_UTILITY`.

## Implementation Pattern

```html
<section class="ergo-card-band" aria-labelledby="triage-title">
  <div class="ergo-card-header">
    <h2 id="triage-title">Confirm Action Tier</h2>
    <p class="ergo-sub">Keep primary controls clear of adjacent destructive actions.</p>
  </div>

  <!-- N=3 inline segmented control (2 < N <= 5) with >= d_moat spacing -->
  <div class="ergo-segmented" role="radiogroup" aria-label="Operating posture">
    <label class="ergo-seg-option">
      <input type="radio" name="posture" value="advisory" checked>
      <span>Advisory</span>
    </label>
    <label class="ergo-seg-option">
      <input type="radio" name="posture" value="supervised">
      <span>Supervised</span>
    </label>
    <label class="ergo-seg-option">
      <input type="radio" name="posture" value="hold">
      <span>Escrow Hold</span>
    </label>
  </div>

  <div class="ergo-actuator-bar">
    <button type="button" class="ergo-btn ergo-btn--beacon" data-ui-ir-focus-tier="TIER_1_GOAL_BEACON">
      Stage Approved Plan
    </button>
    <button type="button" class="ergo-btn ergo-btn--destructive" data-ui-ir-focus-tier="TIER_3_COEXISTING_CAPABILITY">
      Discard Draft
    </button>
  </div>
</section>
```

```css
:root {
  --ergo-d1: 6px;
  --ergo-d2: 14px;
  --ergo-d3: 28px;
  --ergo-d-moat: 6px;
  --ergo-hitbox: 28px;
  --ergo-emergency-hitbox: 48px;
}

@media (pointer: coarse) {
  :root {
    --ergo-d-moat: 10px;
    --ergo-hitbox: 44px;
  }
}

.ergo-card-band {
  display: grid;
  gap: var(--ergo-d2);
  padding: clamp(1rem, 2.5vw, 1.5rem);
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  max-inline-size: 64ch;
}

.ergo-segmented {
  display: inline-flex;
  flex-wrap: wrap;
  gap: var(--ergo-d-moat);
}

.ergo-seg-option {
  display: inline-flex;
  align-items: center;
  gap: var(--ergo-d1);
  min-block-size: var(--ergo-hitbox);
  padding-inline: 0.75rem;
  border: 1px solid #cbd5e1;
  border-radius: 999px;
  cursor: pointer;
}

.ergo-seg-option:has(input:checked) {
  border-color: #0f766e;
  background: color-mix(in oklab, #0f766e 12%, #ffffff);
  font-weight: 600;
}

.ergo-actuator-bar {
  display: flex;
  flex-wrap: wrap;
  /* Enforce Fitts collision moat between safe beacon and destructive sibling */
  gap: max(var(--ergo-d-moat), 12px);
  padding-block-start: var(--ergo-d1);
}

.ergo-btn {
  min-block-size: var(--ergo-emergency-hitbox);
  min-inline-size: var(--ergo-emergency-hitbox);
  padding: 0.6rem 1.1rem;
  border-radius: 8px;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
  /* Critically damped transition (zero overshoot into adjacent moat) */
  transition: background-color 140ms cubic-bezier(0.2, 0, 0, 1), border-color 140ms cubic-bezier(0.2, 0, 0, 1);
}

.ergo-btn[data-ui-ir-focus-tier="TIER_1_GOAL_BEACON"] {
  background: #0f766e;
  border: 1px solid #0f766e;
  color: #ffffff;
}

.ergo-btn[data-ui-ir-focus-tier="TIER_2_STANDBY_SECTION_BEACON"] {
  background: transparent;
  border: 1.5px solid #0f766e;
  color: #0f766e;
}

.ergo-btn--destructive {
  background: transparent;
  border: 1px solid #b91c1c;
  color: #b91c1c;
}
```

```javascript
// Verify A_overshoot <= 0.5 * d_moat before permitting elastic spring animations
export function clampSpringDampingForMoat({ requestedZeta = 0.72, displacementPx = 24, moatPx = 8 }) {
  if (requestedZeta >= 1.0) return { zeta: requestedZeta, clamped: false, overshootPx: 0 };
  const ratio = Math.exp((-Math.PI * requestedZeta) / Math.sqrt(1 - requestedZeta * requestedZeta));
  const overshootPx = Math.abs(displacementPx) * ratio;
  if (overshootPx > 0.5 * moatPx) {
    return { zeta: 1.0, clamped: true, overshootPx: 0 };
  }
  return { zeta: requestedZeta, clamped: false, overshootPx };
}

// Measure inter-target moat gap and verify >= minMoatPx
export function auditCollisionMoat(container, minMoatPx = 8) {
  const targets = [...container.querySelectorAll('button, a[href], input, select')];
  const violations = [];
  for (let i = 0; i < targets.length; i += 1) {
    const a = targets[i].getBoundingClientRect();
    for (let j = i + 1; j < targets.length; j += 1) {
      const b = targets[j].getBoundingClientRect();
      const sameRow = Math.min(a.bottom, b.bottom) > Math.max(a.top, b.top);
      if (!sameRow) continue;
      const gap = Math.max(b.left - a.right, a.left - b.right);
      if (gap >= 0 && gap < minMoatPx) {
        violations.push({ gapPx: Number(gap.toFixed(1)), requiredPx: minMoatPx });
      }
    }
  }
  return violations;
}
```

## Guidelines

- **DO** wrap radio/checkbox labels around their `<input>` and size the `<label>` to `--ergo-hitbox` (`>= 44px` on coarse touch) so the entire control meets Fitts's floor.
- **DO** cap resting propositions per band at `<= 4` (`<= 7` max), chip labels at `<= 24` chars, and nested borders at `D_nest <= 2`.
- **DO** enforce `>= 12px` edge-to-edge gap between positive confirmation actuators and destructive (`Discard`, `Delete`) buttons.
- **DON'T** render two solid-fill `TIER_1_GOAL_BEACON` buttons simultaneously inside the same viewport; demote non-focal section actions to `TIER_2_STANDBY_SECTION_BEACON`.
- **DON'T** apply bouncy underdamped springs (`zeta < 1`) to controls whose peak overshoot exceeds `0.5 * d_moat`.

## Verification & Fallbacks

1. **Hitbox & Moat Check (Playwright):** Emulate `{ hasTouch: true }` and assert every interactive target satisfies `box.width >= 44 && box.height >= 44` (`>= 48` for emergency/primary actuators) and `auditCollisionMoat(root, 8).length === 0`.
2. **Density & Chunk Check:** Verify section whitespace openness `>= 0.55` (`W_density` in `[0.22, 0.45]`), visible propositions per sub-band `<= 4`, and nested bordered container depth `<= 2`.
3. **Single-Beacon Check:** Verify `document.querySelectorAll('[data-ui-ir-focus-tier="TIER_1_GOAL_BEACON"]')` in viewport is `<= 1`.

Fallbacks: When `:has(input:checked)` is unavailable on legacy engines, bind a lightweight `change` listener toggling `.is-selected` on the parent `.ergo-seg-option`; CSS `gap` and `min-block-size` already guarantee Fitts moats cleanly everywhere.

## Related Guides

- `cognitive-ergonomics` (via `npx haii-guidance retrieve "cognitive-ergonomics"`)
- `stress-adaptive-battlestation-mode` (via `npx haii-guidance retrieve "stress-adaptive-battlestation-mode"`)
- `environmental-surface-archetypes` (via `npx haii-guidance retrieve "environmental-surface-archetypes"`)
- `happy-path-value-payoff-disclosure` (via `npx haii-guidance retrieve "happy-path-value-payoff-disclosure"`)
