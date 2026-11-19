---
id: zero-displacement-agent-receipts
title: "Zero-Displacement Agent & Auth Receipts (Choice 1A)"
discipline: D51
category: agentic-experience
kind: use-case
description: "Deliver non-blocking agent mutation and step-up authentication receipts in top-layer popover=\"manual\" notes with DeltaY_focal = 0px, opt-in Jump navigation, and inline Undo."
keywords:
  - zero displacement
  - Choice 1A
  - popover manual
  - agent receipt
  - scroll jump
  - progressive auth
  - undo toast
  - top layer
  - allow-discrete
triggers:
  - "notifying users after an AI stages or updates an item without scrolling them away"
  - "preventing layout shift when showing mutation confirmations or passkey prompts"
  - "adding Jump to Workspace and Undo controls to non-blocking receipts"
provenance:
  - PARADIGM_98
  - PARADIGM_51
maturity: stable
---

# Zero-Displacement Agent & Auth Receipts (Choice 1A)

## Overview

When an operator clicks an action button—staging an AI proposal, applying a tier, or triggering step-up sign-in—automatically scrolling the viewport away or injecting normal-flow banners breaks reading context (`DeltaY_focal != 0`). Keep the camera pinned (`0px` scroll displacement) and project a top-layer `popover="manual"` receipt offering an opt-in `[Jump to Workspace]` button and immediate `[Undo]`.

## Decision Rules

### Rule 1: Decouple state mutation (`ADDRESS` / `MUTATE`) from camera movement (`TRAVERSE`)

Never call `scrollIntoView()` or inject normal-flow confirmation banners above the viewport fold after an action click. Keep `window.scrollY` and the clicked trigger's viewport offset invariant (`DeltaY_focal = 0px`).

### Rule 2: Render receipts in top-layer `popover="manual"` without stealing focus

Use `popover="manual"` so the receipt does not light-dismiss while the operator continues inspecting other items, and never steal focus onto the popover when it opens. Announce the confirmation text via `ariaNotify()` (or a polite `aria-live="polite"` region), pause any auto-hide timer while pointer hover or keyboard focus is inside the popover, and include an explicit `Dismiss` control.

### Rule 3: Provide opt-in Jump and Undo actions only as shortcuts

Every action inside the receipt (`Jump to Workspace` and `Undo`) must mirror controls that already exist durably in the page, ensuring nothing is lost once the popover is dismissed.

## Implementation Pattern

```html
<main>
  <article class="proposal-card">
    <h2>Feeder Rebalance Proposal</h2>
    <p>Predicted savings: $420/day within safety bounds.</p>
    <button type="button" id="stage-proposal-btn">Stage Proposal in Escrow</button>
  </article>

  <section id="workspace-section" class="workspace-section" tabindex="-1">
    <h2>Active Escrow Workspace</h2>
    <p id="workspace-summary">No staged proposals yet.</p>
    <button type="button" id="workspace-undo-btn" hidden>Undo Staged Proposal</button>
  </section>
</main>

<div id="agent-receipt-popover" popover="manual" role="region" aria-label="Action receipts" hidden>
  <p id="receipt-status-text" role="status" aria-live="polite"></p>
  <div class="receipt-actions">
    <button type="button" id="receipt-jump-btn">Jump to Workspace &darr;</button>
    <button type="button" id="receipt-undo-btn">Undo</button>
    <button type="button" popovertarget="agent-receipt-popover" popovertargetaction="hide" id="receipt-close-btn">
      Close
    </button>
  </div>
</div>
```

```css
#agent-receipt-popover:is(:popover-open, .\:popover-open) {
  position: fixed;
  inset: auto 1.25rem 1.25rem auto;
  margin: 0;
  display: grid;
  gap: 0.625rem;
  max-inline-size: min(420px, calc(100vw - 2rem));
  padding: 0.875rem 1rem;
  border: 1px solid CanvasText;
  border-radius: 12px;
  background: Canvas;
  color: CanvasText;
  opacity: 1;
  transform: translateY(0);
  transition: opacity 180ms ease, transform 180ms ease, display 180ms, overlay 180ms;
  transition-behavior: allow-discrete;
}

@starting-style {
  #agent-receipt-popover:is(:popover-open, .\:popover-open) {
    opacity: 0;
    transform: translateY(8px);
  }
}

#agent-receipt-popover[hidden],
#agent-receipt-popover:not(:is(:popover-open, .\:popover-open)) {
  pointer-events: none;
}

.receipt-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.receipt-actions button {
  min-block-size: 36px;
  padding: 0.375rem 0.75rem;
  cursor: pointer;
}

@media (prefers-reduced-motion: reduce) {
  #agent-receipt-popover {
    transition: none !important;
  }
}
```

```js
const stageBtn = document.getElementById('stage-proposal-btn');
const workspaceSummary = document.getElementById('workspace-summary');
const workspaceUndoBtn = document.getElementById('workspace-undo-btn');
const receiptPopover = document.getElementById('agent-receipt-popover');
const receiptText = document.getElementById('receipt-status-text');
const jumpBtn = document.getElementById('receipt-jump-btn');
const receiptUndoBtn = document.getElementById('receipt-undo-btn');
const closeBtn = document.getElementById('receipt-close-btn');

let autoHideTimer = null;
let receiptPinnedByUser = false;

function hideReceipt() {
  clearTimeout(autoHideTimer);
  receiptPopover.classList.remove(':popover-open');
  if ('popover' in HTMLElement.prototype && receiptPopover.matches(':popover-open')) {
    receiptPopover.hidePopover();
  }
  receiptPopover.hidden = true;
}

function scheduleAutoHide() {
  clearTimeout(autoHideTimer);
  if (receiptPinnedByUser) return;
  autoHideTimer = setTimeout(hideReceipt, 5500);
}

function showReceipt(message) {
  receiptText.textContent = message;
  receiptPopover.hidden = false;
  if ('popover' in HTMLElement.prototype) {
    if (!receiptPopover.matches(':popover-open')) receiptPopover.showPopover();
  } else {
    receiptPopover.classList.add(':popover-open');
  }
  if (typeof document.ariaNotify === 'function') {
    document.ariaNotify(`${message} Actions available.`);
  }
  scheduleAutoHide();
}

receiptPopover.addEventListener('mouseenter', () => {
  receiptPinnedByUser = true;
  clearTimeout(autoHideTimer);
});
receiptPopover.addEventListener('mouseleave', () => {
  receiptPinnedByUser = false;
  scheduleAutoHide();
});
receiptPopover.addEventListener('focusin', () => {
  receiptPinnedByUser = true;
  clearTimeout(autoHideTimer);
});
receiptPopover.addEventListener('focusout', (event) => {
  if (!receiptPopover.contains(event.relatedTarget)) {
    receiptPinnedByUser = false;
    scheduleAutoHide();
  }
});

stageBtn.addEventListener('click', () => {
  workspaceSummary.textContent = '1 proposal staged in 15-minute holding escrow.';
  workspaceUndoBtn.hidden = false;
  showReceipt('Staged in escrow. Reading position pinned.');
});

function undoStage() {
  workspaceSummary.textContent = 'No staged proposals yet.';
  workspaceUndoBtn.hidden = true;
  showReceipt('Proposal cancelled with zero changes.');
}

receiptUndoBtn.addEventListener('click', undoStage);
workspaceUndoBtn.addEventListener('click', undoStage);
closeBtn.addEventListener('click', hideReceipt);

jumpBtn.addEventListener('click', () => {
  const workspace = document.getElementById('workspace-section');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  workspace.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  workspace.focus({ preventScroll: true });
});
```

## Guidelines

- **DO** declare `transition-behavior: allow-discrete` as a separate property after `transition` so older browsers still run opacity/transform transitions instead of dropping the entire rule.
- **DO** combine `:popover-open` and `.\:popover-open` inside `:is(...)` so fallback styling works seamlessly.
- **DO** pause the receipt auto-hide timer whenever keyboard focus or pointer hover enters the popover.
- **DO** return focus cleanly to the triggering control if a user manually dismisses a currently focused receipt popover.
- **DON'T** display background receipts while a blocking `<dialog>` modal is open (`showModal()` marks the outside DOM inert).
- **DON'T** steal focus onto `#agent-receipt-popover` when it opens—the user is staying put at their current coordinate.
- **DON'T** put unique irreversible actions solely inside a temporary toast receipt; always keep the same undo/review link durable in the workspace.

## Verification & Fallbacks

- **DOM & Playwright assertions:**
  - Scroll down so `#stage-proposal-btn` is mid-viewport, record `scrollBefore = window.scrollY`, click `#stage-proposal-btn`, and assert `Math.abs(window.scrollY - scrollBefore) === 0` and `document.activeElement === stageBtn`.
  - Assert `#agent-receipt-popover:popover-open` is visible in the top layer and does not increase `document.documentElement.scrollHeight` (`DeltaB_inflow === 0`).
  - Focus `#receipt-undo-btn` and wait > 6s to verify the receipt does not vanish under keyboard focus.
- **Browser fallbacks:** Native Popover (`popover="manual"`) is Baseline Newly Available (2025-01). When `!('popover' in HTMLElement.prototype)`, toggling `hidden = false` and `.\:popover-open` renders the same `position: fixed` bottom-end receipt without external scripts. Use an `aria-live="polite"` node alongside optional `ariaNotify()` so all screen readers announce receipts cleanly.

## Related Guides

- `agentic-experience` (via `npx haii-guidance retrieve "agentic-experience"`) — Supervisory AX architecture.
- `time-locked-autonomy-escrow-gate` (via `npx haii-guidance retrieve "time-locked-autonomy-escrow-gate"`) — Backing receipt Undo controls with real escrow rollback.
- `anchored-floating-match-windows` (via `npx haii-guidance retrieve "anchored-floating-match-windows"`) — Companion Choice 2B zero-reflow pattern for search/input popovers.
- `imperative-affordance-grammar` (via `npx haii-guidance retrieve "imperative-affordance-grammar"`) — Writing unambiguous Jump and Undo receipt labels.
