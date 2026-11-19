---
id: stress-adaptive-battlestation-mode
title: Stress-Adaptive Battle-Station Mode
discipline: D28
category: cognitive-ergonomics
kind: use-case
description: Simplify operational interfaces under acute crises by marking peripheral chrome inert, capping active chunks at <=3, expanding actuators to >=48px, and elevating contrast to counter tunnel vision.
keywords:
  - stress adaptive ui
  - battlestation mode
  - perceptual narrowing tunnel vision
  - cognitive load <=3 chunks
  - oversized actuators 48px
  - inert peripheral chrome
  - high contrast crisis ui
  - emergency simplification
triggers:
  - designing an emergency or crisis override mode for high-stress operator tasks
  - preventing tunnel vision and tremor mis-taps during critical system faults
  - suppressing non-essential analytics and dashboards while preserving safe abort controls
  - making critical emergency buttons >=48px with high contrast and keyboard isolation
provenance:
  - PARADIGM_61
  - PARADIGM_92
maturity: stable
---

# Stress-Adaptive Battle-Station Mode

## Overview

Under acute operational crises, human operators suffer perceptual narrowing (tunnel vision), degraded fine motor steadiness, and working-memory collapse. Leaving full analytical chrome, decorative metrics, and small `28px` buttons on screen slows triage and raises mis-click risk. Provide an explicit **Battle-Station Mode** that isolates `<= 3` critical decision chunks, marks non-essential regions `inert`, expands actuators to `>= 48x48px`, and boosts contrast cleanly.

## Decision Rules

### Rule 1: Suppress peripheral regions cleanly with `inert` and dimmed styling

Visual dimming (`opacity: 0.25`) alone leaves hidden/dimmed buttons reachable via keyboard <kbd>Tab</kbd> and screen readers. When Battle-Station mode engages, mark every non-critical sibling region `inert` alongside visual dimming so focus moves strictly between the critical fault readout and safe emergency actuators.

### Rule 2: Cap active chunks at `<= 3` and expand actuators to `>= 48x48px`

Limit visible primary focal blocks inside Battle-Station mode to `<= 3` critical items (root fault summary, stabilization actuator, and safe exit/undo). Expand all active actuators to `min-block-size: 48px; min-inline-size: 48px` (`12px+` collision moat) and `>= 1rem` typography.

### Rule 3: Elevate contrast without destructive color-only ambiguity

Switch to a high-contrast dark obsidian or light high-contrast palette (`>= 7:1` text contrast, `>= 1.85` focal border salience ratio) and respect `@media (forced-colors: active)` and `prefers-reduced-motion: reduce`. Never obscure the toggle needed to exit Battle-Station mode.

### Rule 4: Require deliberate toggle or reversible confirmation

Never swap layouts unexpectedly mid-pointer-hover without clear status announcement (`aria-live="assertive"`). Keep the mode reversible in one tap (`Disengage Battle-Station`) so operators retain full control.

## Implementation Pattern

```html
<div class="ops-shell" id="ops-shell" data-ergo-mode="nominal">
  <header class="ops-header">
    <h1>Operations Console</h1>
    <button
      type="button"
      id="btn-toggle-battlestation"
      class="ergo-control ergo-control--toggle"
      aria-pressed="false"
    >
      Engage Emergency Battle-Station
    </button>
  </header>

  <div id="battlestation-live" class="visually-hidden" aria-live="assertive"></div>

  <div class="ops-grid">
    <!-- Peripheral widgets: dimmed & marked inert during Battle-Station -->
    <aside class="ops-panel ops-panel--peripheral" data-peripheral-chrome="true" aria-label="Historical Analytics">
      <h2>30-Day Efficiency Trend</h2>
      <p>Monthly average utilization: 84.2%.</p>
    </aside>

    <!-- Focused crisis cockpit: <= 3 critical chunks -->
    <section class="ops-panel ops-panel--critical" aria-labelledby="critical-title">
      <h2 id="critical-title">Primary Fault Isolation</h2>
      <p class="critical-chunk">Root Cause: Feeder 4B Inverter Thermal Drift (+14°C above safe band).</p>
      <div class="critical-actuators">
        <button type="button" class="ergo-control ergo-control--primary">
          Isolate Feeder 4B Now
        </button>
        <button type="button" class="ergo-control ergo-control--safe">
          Transfer Load to Reserve
        </button>
      </div>
    </section>
  </div>
</div>
```

```css
.ops-shell {
  padding: 1.25rem;
  background: #ffffff;
  color: #0f172a;
}

.ops-header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  margin-block-end: 1rem;
}

.ops-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr));
  gap: 1rem;
  align-items: start;
}

.ops-panel {
  padding: 1rem;
  border-radius: 12px;
  border: 1px solid #cbd5e1;
}

.ergo-control {
  min-block-size: 38px;
  min-inline-size: 44px;
  padding: 0.5rem 0.95rem;
  border-radius: 8px;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.critical-actuators {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

/* Battle-Station Active State: high contrast, peripheral dim, >=48px actuators */
.ops-shell[data-ergo-mode="battlestation"] {
  background: #050505;
  color: #ffffff;
}

.ops-shell[data-ergo-mode="battlestation"] [data-peripheral-chrome="true"] {
  opacity: 0.22;
  pointer-events: none;
  user-select: none;
}

.ops-shell[data-ergo-mode="battlestation"] .ops-panel--critical {
  border: 2px solid #ef4444;
  background: #111827;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.35);
}

.ops-shell[data-ergo-mode="battlestation"] .ergo-control {
  min-block-size: 48px;
  min-inline-size: 48px;
  font-size: 1rem;
  padding: 0.75rem 1.25rem;
}

.ops-shell[data-ergo-mode="battlestation"] .ergo-control--primary {
  background: #dc2626;
  border: 2px solid #fecaca;
  color: #ffffff;
}

.ops-shell[data-ergo-mode="battlestation"] .ergo-control--safe {
  background: #0f172a;
  border: 2px solid #38bdf8;
  color: #f8fafc;
}

@media (forced-colors: active) {
  .ops-shell[data-ergo-mode="battlestation"] .ops-panel--critical {
    border: 3px solid Highlight;
  }
}

.visually-hidden {
  position: absolute;
  clip-path: inset(50%);
  overflow: hidden;
  width: 1px;
  height: 1px;
  white-space: nowrap;
}
```

```javascript
const shell = document.getElementById('ops-shell');
const toggleBtn = document.getElementById('btn-toggle-battlestation');
const live = document.getElementById('battlestation-live');

toggleBtn?.addEventListener('click', () => {
  const nextActive = shell.getAttribute('data-ergo-mode') !== 'battlestation';
  shell.setAttribute('data-ergo-mode', nextActive ? 'battlestation' : 'nominal');
  toggleBtn.setAttribute('aria-pressed', String(nextActive));
  toggleBtn.textContent = nextActive ? 'Disengage Battle-Station Mode' : 'Engage Emergency Battle-Station';

  // Critical a11y invariant: block Tab focus from dimmed peripheral widgets
  shell.querySelectorAll('[data-peripheral-chrome="true"]').forEach((panel) => {
    panel.inert = nextActive;
  });

  live.textContent = nextActive
    ? 'Emergency battle-station mode active. Peripheral panels locked; critical controls enlarged to 48px.'
    : 'Nominal console layout restored.';
});
```

## Guidelines

- **DO** set `element.inert = true` on suppressed peripheral panels so keyboard users and screen readers stay inside the critical cockpit.
- **DO** expand every critical actuator and exit toggle to `>= 48x48px` with `>= 12px` spacing and `1rem+` text.
- **DO** cap focal items inside the crisis panel at `<= 3` chunks (Fault, Action 1, Safe Alternative/Exit).
- **DON'T** move the toggle button under the cursor when Battle-Station activates (`0px` displacement of `#btn-toggle-battlestation` or clear opt-out label).
- **DON'T** trap the user with `pointer-events: none` on the disengage control or hide status feedback from assistive tech.

## Verification & Fallbacks

1. **Inert & Focus Check:** Engage Battle-Station in Playwright and verify `panel.inert === true` on all `[data-peripheral-chrome="true"]` containers and that pressing <kbd>Tab</kbd> never focuses a peripheral link or button.
2. **Actuator Geometry Check:** Assert every visible `.ergo-control` has `box.width >= 48 && box.height >= 48` when `[data-ergo-mode="battlestation"]` is active.
3. **Chunk & Contrast Check:** Verify visible foreground/background contrast `>= 7:1` inside `.ops-panel--critical` and `<= 3` critical chunks rendered.

Fallbacks: `HTMLElement.prototype.inert` is Baseline Widely Available (since 2023). On ultra-legacy browsers without `inert`, pair `aria-hidden="true"` with storing/restoring `tabindex="-1"` on descendant focusables inside peripheral panels.

## Related Guides

- `cognitive-ergonomics` (via `npx haii-guidance retrieve "cognitive-ergonomics"`)
- `fitts-moat-and-hick-hyman-budgets` (via `npx haii-guidance retrieve "fitts-moat-and-hick-hyman-budgets"`)
- `cascade-alarm-rationalization` (via `npx haii-guidance retrieve "cascade-alarm-rationalization"`)
- `time-locked-autonomy-escrow-gate` (via `npx haii-guidance retrieve "time-locked-autonomy-escrow-gate"`)
