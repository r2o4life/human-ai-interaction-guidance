---
id: ax-exception-repair-tree
title: "AX Exception Repair Tree & Blast-Radius Containment"
discipline: D51
category: agentic-experience
kind: use-case
description: "Visualize autonomous fault detection, failure classification, blast-radius containment scope, and dry-run saga recovery pathways using interactive accessible repair trees."
keywords:
  - exception repair tree
  - blast radius
  - fault classification
  - dry-run simulation
  - saga recovery
  - zero data loss
  - containment
  - incident triage
triggers:
  - "designing error recovery for failed AI workflows or tool calls"
  - "showing operators what failed and what stayed safely contained"
  - "adding dry-run fault simulation to an autonomous console"
provenance:
  - PARADIGM_51
maturity: stable
---

# AX Exception Repair Tree & Blast-Radius Containment

## Overview

When an AI-orchestrated step fails mid-flight, generic "Something went wrong" banners hide both the blast radius and the automated recovery path. Render an interactive exception repair tree linking each failure condition to its exact containment boundary, zero-data-loss saga compensation step, and safe dry-run fault simulation buttons.

## Decision Rules

### Rule 1: Map every failure branch to three concrete fields

Every exception branch must state: (1) trigger rule or threshold breached, (2) exact blast-radius containment scope (for example `Single Batch`, `Draft Only`, `Substation B`), and (3) deterministic saga recovery action guaranteeing zero data loss.

### Rule 2: Provide non-destructive dry-run simulation triggers

Include explicit fault-simulation buttons (`Simulate Latency Spike`, `Simulate Checksum Drift`) that highlight the matching tree branch, compute the dry-run compensation outcome, and update an accessible status summary without mutating production data.

### Rule 3: Pair visual tree graphics with semantic list or table fallbacks

Keep SVG repair diagrams clean and keyboard-accessible by syncing simulated selections to a semantic HTML status region and structured branch list so screen readers and narrow viewports read every path effortlessly.

## Implementation Pattern

```html
<section class="repair-cockpit" aria-labelledby="repair-title">
  <header class="repair-header">
    <div>
      <h2 id="repair-title">Automatic Step-by-Step Recovery</h2>
      <p>Dry-run fault containment shows how failures isolate without data loss.</p>
    </div>
    <div class="repair-sim-bar" role="group" aria-label="Simulate fault dry runs">
      <button type="button" class="btn-sim-fault" data-fault="THERMAL_LIMIT" aria-pressed="false">
        Simulate Thermal Drift
      </button>
      <button type="button" class="btn-sim-fault" data-fault="CHECKSUM_MISMATCH" aria-pressed="false">
        Simulate Proof Drift
      </button>
      <button type="button" class="btn-sim-fault" data-fault="PACKET_LOSS" aria-pressed="false">
        Simulate Link Drop
      </button>
    </div>
  </header>

  <ol class="repair-tree-list" id="repair-tree-list">
    <li data-fault-branch="THERMAL_LIMIT">
      <strong>Thermal Threshold (&ge; 74&deg;F)</strong>
      <span>Contained Scope: Local Unit Only</span>
      <span>Recovery: Pause batch in 140 ms and keep baseline steady</span>
    </li>
    <li data-fault-branch="CHECKSUM_MISMATCH">
      <strong>Verification Proof Mismatch</strong>
      <span>Contained Scope: Single Draft Contract</span>
      <span>Recovery: Hold in escrow and revert draft at zero penalty</span>
    </li>
    <li data-fault-branch="PACKET_LOSS">
      <strong>Telemetry Drop (&gt; 3%)</strong>
      <span>Contained Scope: Worker Queue</span>
      <span>Recovery: Buffer locally and fail over to standby route</span>
    </li>
  </ol>

  <div id="repair-callout" class="repair-callout" role="status" aria-live="polite">
    Nominal supervision active. No faults simulated.
  </div>
</section>
```

```css
.repair-cockpit {
  display: grid;
  gap: 1rem;
  padding: 1.25rem;
  border: 1px solid CanvasText;
  border-radius: 12px;
}

.repair-header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: start;
  gap: 0.75rem;
}

.repair-sim-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.btn-sim-fault {
  min-block-size: 44px;
  padding: 0.5rem 0.875rem;
  cursor: pointer;
}

.btn-sim-fault[aria-pressed="true"] {
  font-weight: 700;
  outline: 2px solid currentColor;
}

.repair-tree-list {
  display: grid;
  gap: 0.5rem;
  margin: 0;
  padding-inline-start: 1.25rem;
}

.repair-tree-list li {
  display: grid;
  gap: 0.25rem;
  padding: 0.625rem 0.75rem;
  border-radius: 8px;
  border: 1px solid CanvasText;
}

.repair-tree-list li[data-active="true"] {
  outline: 3px solid Highlight;
}

.repair-callout {
  padding: 0.625rem 0.875rem;
  border-radius: 8px;
  border: 1px dashed currentColor;
}
```

```js
const FAULT_REPAIR_MAP = Object.freeze({
  THERMAL_LIMIT: 'Dry-run simulation: Local Unit isolated in 140 ms. Zero data or safety loss.',
  CHECKSUM_MISMATCH: 'Dry-run simulation: Draft Contract halted in escrow. Zero ledger changes committed.',
  PACKET_LOSS: 'Dry-run simulation: Staged payload buffered safely; standby worker route engaged.'
});

const simButtons = document.querySelectorAll('.btn-sim-fault');
const branchNodes = document.querySelectorAll('[data-fault-branch]');
const calloutEl = document.getElementById('repair-callout');

simButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const selectedFault = btn.getAttribute('data-fault');
    simButtons.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
    branchNodes.forEach((li) => {
      li.setAttribute('data-active', String(li.getAttribute('data-fault-branch') === selectedFault));
    });
    calloutEl.textContent = FAULT_REPAIR_MAP[selectedFault] || 'Fault isolated.';
  });
});
```

## Guidelines

- **DO** isolate dry-run simulations from live state so operators can rehearse failure recovery safely at any time.
- **DO** show both what stopped (blast radius) and what survived intact (`zero data loss`) on every fault branch.
- **DO** reflect active simulated branches via `aria-pressed="true"` on the simulation trigger and text updates in a live region (`role="status"`).
- **DON'T** expose raw stack traces, internal SQL exceptions, or database table names in frontstage recovery trees.
- **DON'T** rely on color alone (red vs. green boxes) to distinguish faulted vs. repaired branches; always include explicit status words and borders.
- **DON'T** trap users in a dead-end error modal with only "Dismiss"; always offer the next safe repair step (`Retry Safely`, `Switch Backup`, or `Revert Draft`).

## Verification & Fallbacks

- **DOM & Playwright assertions:**
  - Click each `.btn-sim-fault` trigger and assert `aria-pressed="true"` shifts exclusively to the clicked button, the corresponding `[data-fault-branch]` sets `data-active="true"`, and `#repair-callout` announces the dry-run containment summary.
  - Assert zero network `POST`/`DELETE` mutations are dispatched when running dry-run simulations.
  - Verify all simulation buttons satisfy `min-block-size >= 44px` on `390px` mobile and `1440px` desktop viewports with `0px` horizontal overflow.
- **Browser fallbacks:** Semantic `<ol>` branch cards degrade cleanly at any viewport width without requiring complex SVG layout math; if you pair an SVG diagram above the list, mark decorative path edges `aria-hidden="true"` and mirror branch state into the semantic `<ol>`.

## Related Guides

- `agentic-experience` (via `npx haii-guidance retrieve "agentic-experience"`) — Parent supervisory AX principles.
- `time-locked-autonomy-escrow-gate` (via `npx haii-guidance retrieve "time-locked-autonomy-escrow-gate"`) — Reversible rollback and saga compensation backing the repair tree.
- `cascade-alarm-rationalization` (via `npx haii-guidance retrieve "cascade-alarm-rationalization"`) — Collapsing cascading fault floods into a single root-cause tree.
- `zero-displacement-agent-receipts` (via `npx haii-guidance retrieve "zero-displacement-agent-receipts"`) — Reporting non-blocking recovery receipts without jumping scroll.
