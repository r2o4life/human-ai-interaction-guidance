---
id: endsley-predictive-horizon-projection
title: Endsley Level 3 Predictive Horizon Projection & Consequence Sandboxes
discipline: D28
category: cognitive-ergonomics
kind: use-case
description: Upgrade AI and operational consoles from retrospective Level 1-2 telemetry to Endsley Level 3 trajectory horizons (t+5m, t+15m, t+30m) with uncertainty bounds and pre-execution What-If blast-radius simulation.
keywords:
  - endsley level 3 situation awareness
  - predictive horizon
  - t+5m t+15m t+30m
  - confidence interval uncertainty bounds
  - cascade probability
  - depletion time
  - what-if consequence sandbox
  - blast radius simulation
  - shift handover debrief
triggers:
  - building an AI forecasting or operational telemetry dashboard
  - preventing retrospective dashboards from hiding upcoming failures or resource exhaustion
  - simulating blast radius and life-safety protection before an irreversible dispatch action
  - designing crew shift handover summaries that preserve future trajectory awareness
provenance:
  - PARADIGM_61
maturity: stable
---

# Endsley Level 3 Predictive Horizon Projection & Consequence Sandboxes

## Overview

Dashboards that report only raw current telemetry (Endsley Level 1 Perception) and status summaries (Level 2 Comprehension) force operators to run error-prone mental simulations to guess what breaks next. Upgrade high-acuity AI consoles to **Endsley Level 3 (Projection)**: explicit forward horizons at `t+5m`, `t+15m`, and `t+30m` paired with calibrated uncertainty bounds, pre-execution What-If consequence sandboxes, and verifiable crew handovers.

## Decision Rules

### Rule 1: Render three explicit time-horizon checkpoints (`t+5m`, `t+15m`, `t+30m`)

Never show a bare sparkline or single-point forecast without temporal anchors and risk intervals:

- Always display **three discrete projection horizons** (`t+5m`, `t+15m`, `t+30m`) alongside estimated time-to-depletion (`t_depletion`) and cascade risk probability (`P_cascade`).
- Pair every projected metric with an explicit **confidence interval or uncertainty band** (e.g., `95% CI: 59.88–59.98 Hz`) that widens cleanly over longer horizons so operators never confuse a forecast with measured ground truth.

### Rule 2: Gate high-impact interventions with a What-If consequence sandbox

Before committing destructive or load-affecting actions (such as load shedding, rate throttling, or circuit isolation), provide a live simulation slider/input (`#slider-what-if`) calculating downstream impact and explicitly certifying protected life-safety facilities (e.g., `Ward A: 100% Protected`) with zero live side effects during simulation.

### Rule 3: Preserve predictive awareness across crew shift handovers

Compile active projections, open warnings, and simulated mitigations into a structured handover dossier requiring explicit outgoing and incoming operator acknowledgement before transfer closes.

## Implementation Pattern

```html
<section class="sa-horizon-cockpit" aria-labelledby="sa-l3-heading">
  <header class="sa-header">
    <h2 id="sa-l3-heading">Predictive Trajectory Horizon (Endsley Level 3)</h2>
    <p class="sa-meta">
      Est. Reserve Depletion: <strong id="sa-depletion">42.5m</strong> ·
      Cascade Risk: <strong id="sa-cascade-prob">1.2%</strong> ·
      Confidence: <strong>95% Interval</strong>
    </p>
  </header>

  <!-- Explicit 3-step forward horizon with widening uncertainty bounds -->
  <table class="sa-horizon-table">
    <caption>Projected system headroom and uncertainty envelope</caption>
    <thead>
      <tr>
        <th scope="col">Horizon</th>
        <th scope="col">Projected Reserve</th>
        <th scope="col">95% Uncertainty Band</th>
        <th scope="col">Risk State</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <th scope="row">t+5m</th>
        <td class="num">92%</td>
        <td class="num">±1.2%</td>
        <td>Nominal</td>
      </tr>
      <tr>
        <th scope="row">t+15m</th>
        <td class="num">78%</td>
        <td class="num">±3.4%</td>
        <td>Monitor Thermal</td>
      </tr>
      <tr>
        <th scope="row">t+30m</th>
        <td class="num">61%</td>
        <td class="num">±6.8%</td>
        <td>Rebalance Window</td>
      </tr>
    </tbody>
  </table>

  <!-- Pre-execution What-If consequence sandbox (zero live mutation) -->
  <div class="sa-sandbox" aria-labelledby="sa-sandbox-heading">
    <h3 id="sa-sandbox-heading">Pre-Execution Consequence Sandbox (What-If)</h3>
    <div class="sa-slider-row">
      <label for="sa-shed-slider">Simulated Load Curtailment (MW):</label>
      <output id="sa-shed-output" for="sa-shed-slider">15 MW</output>
    </div>
    <input id="sa-shed-slider" type="range" min="0" max="50" value="15" step="1">
    <p id="sa-blast-readout" class="sa-impact" role="status" aria-live="polite">
      Life-Safety Circuits: 100% Protected · Auxiliary Impact: $0 critical disruption.
    </p>
  </div>
</section>
```

```css
.sa-horizon-cockpit {
  display: grid;
  gap: 1rem;
  padding: 1.25rem;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  background: #ffffff;
  color: #0f172a;
}

.sa-horizon-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.92rem;
}

.sa-horizon-table th,
.sa-horizon-table td {
  padding: 0.55rem 0.75rem;
  border-bottom: 1px solid #e2e8f0;
  text-align: start;
}

.sa-horizon-table .num,
.sa-meta strong,
#sa-shed-output {
  font-variant-numeric: tabular-nums;
}

.sa-sandbox {
  display: grid;
  gap: 0.5rem;
  padding: 0.9rem;
  border-radius: 8px;
  background: #f8fafc;
  border: 1px solid #cbd5e1;
}

.sa-slider-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 0.75rem;
}

#sa-shed-slider {
  inline-size: 100%;
  min-block-size: 44px;
  cursor: pointer;
}

.sa-impact {
  margin: 0;
  padding: 0.55rem 0.75rem;
  border-inline-start: 4px solid #0f766e;
  background: #ecfdf5;
  color: #064e3b;
  font-weight: 600;
}

.sa-impact[data-risk="elevated"] {
  border-inline-start-color: #b45309;
  background: #fffbeb;
  color: #78350f;
}
```

```javascript
const slider = document.getElementById('sa-shed-slider');
const output = document.getElementById('sa-shed-output');
const readout = document.getElementById('sa-blast-readout');

slider?.addEventListener('input', () => {
  const mw = Number(slider.value) || 0;
  output.textContent = `${mw} MW`;
  if (mw <= 30) {
    readout.removeAttribute('data-risk');
    readout.textContent = `Life-Safety Circuits: 100% Protected · Non-critical curtailment incentive: $${mw * 120}.`;
  } else {
    readout.setAttribute('data-risk', 'elevated');
    const penalty = (mw - 30) * 450;
    readout.textContent = `Warning: Auxiliary labs throttled ($${penalty} SLA impact). Life-Safety Ward A remains 100% protected.`;
  }
});
```

## Guidelines

- **DO** present `t+5m`, `t+15m`, and `t+30m` projections using `font-variant-numeric: tabular-nums` so streaming numeric updates never jitter horizontally.
- **DO** show wider uncertainty margins at `t+30m` than `t+5m` to communicate forecast decay honestly.
- **DO** isolate What-If simulation controls from live dispatch execution—sliding a parameter must preview consequences without dispatching side effects.
- **DON'T** display model projections as deterministic point values without confidence bounds or horizon timestamps.
- **DON'T** allow shift handovers to close silently when projected risks (`t_depletion < 60m` or `P_cascade >= 0.05`) are unresolved; require explicit dual sign-off.

## Verification & Fallbacks

1. **Horizon Presence Check:** Assert DOM contains distinct `t+5m`, `t+15m`, and `t+30m` headers/rows with non-empty numeric uncertainty intervals (`±` or `[low, high]`).
2. **Sandbox Isolation Check:** Sweep `#sa-shed-slider` across `0 -> 50` in Playwright and assert `#sa-blast-readout` updates live (`textContent` changes) while issuing `0` mutating network `POST` requests.
3. **Tabular Numeric Stability:** Verify `getBoundingClientRect().width` of table columns changes by `0px` across forecast updates.

Fallbacks: When live WebSocket/SSE telemetry drops, freeze the last verified projection timestamp, mark the horizon header `[STALE · LAST SYNC <time>]`, and prevent blind reliance on stale extrapolated curves.

## Related Guides

- `cognitive-ergonomics` (via `npx haii-guidance retrieve "cognitive-ergonomics"`)
- `cascade-alarm-rationalization` (via `npx haii-guidance retrieve "cascade-alarm-rationalization"`)
- `blackbox-temporal-event-scrubbing` (via `npx haii-guidance retrieve "blackbox-temporal-event-scrubbing"`)
- `time-locked-autonomy-escrow-gate` (via `npx haii-guidance retrieve "time-locked-autonomy-escrow-gate"`)
