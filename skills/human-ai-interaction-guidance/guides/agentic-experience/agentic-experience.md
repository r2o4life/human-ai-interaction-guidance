---
id: agentic-experience
title: "Agentic Experience (AX) & Supervisory Governance"
discipline: D51
category: agentic-experience
kind: discipline
description: "Architectural discipline for supervisory human-AI control surfaces: four-tier autonomy ladders, Show-Your-Work derivation trees, 900s escrow gates, OBO privilege attenuation, and zero-displacement receipts."
keywords:
  - agentic experience
  - supervisory control
  - autonomy ladder
  - human-in-the-loop
  - escrow gate
  - show your work
  - RFC 8693 OBO
  - exception repair
  - zero displacement
  - MCP safety hints
triggers:
  - "designing AI agent approval or supervisory UI"
  - "replacing opaque AI chatbot automation with governed actions"
  - "adding undo, escrow, or delegation controls to AI workflows"
  - "auditing autonomous UI actions for human oversight"
provenance:
  - PARADIGM_51
  - PARADIGM_98
  - PARADIGM_106
  - PARADIGM_109
maturity: stable
---

# Agentic Experience (AX) & Supervisory Governance

## Overview

Agentic Experience (AX) treats AI systems as bounded operators under continuous human supervision rather than opaque conversational black boxes. Every agentic workflow pairs natural-language intent intake with deterministic execution previews, time-locked reversibility, attenuated credentials, and non-displacing status receipts.

## Decision Rules

### Rule 1: Classify every AI action on the four-tier autonomy ladder

Never collapse passive suggestions, prefilled drafts, staged mutations, and policy-bounded loops into a single generic "AI Magic" button. Map each capability explicitly to `ADVISORY`, `SUGGESTIVE`, `SUPERVISED_AUTONOMY`, or `AUTONOMOUS_GOVERNANCE` and enforce matching confirmation friction.

### Rule 2: Separate conversational routing from deterministic execution

Use conversational UI only to gather ambiguous intent and clarify parameters. Once an operation targets live state, shed conversational persona into a deterministic "Show Your Work" payload displaying exact parameters, derivation lineage, and an explicit confirm or abort trigger.

### Rule 3: Enforce non-bypassable reversibility, delegation limits, and legal precedence

Stage mutating agent actions inside a 900-second time-locked escrow window with one-tap rollback and saga compensation, attenuate agent permissions via RFC 8693 On-Behalf-Of (`act` claim) scope ceilings, and fail closed with HTTP `409` whenever an active `LegalHold` protects the target record.

## Implementation Pattern

A unified supervisory cockpit combines four native web primitives: an autonomy tier badge, a `<details name="ax-derivations">` lineage drawer, a 900-second escrow control bar, and a `popover="manual"` non-displacing receipt.

```html
<section class="ax-cockpit" aria-labelledby="ax-cockpit-title">
  <header class="ax-header">
    <h2 id="ax-cockpit-title">Proposed Inventory Rebalance</h2>
    <span class="ax-tier-badge" data-tier="SUPERVISED_AUTONOMY">
      Tier 3 · Supervised Escrow (15:00 Hold)
    </span>
  </header>

  <details name="ax-derivations" class="ax-derivation">
    <summary>Show your work · Model, policy bounds, and verification digest</summary>
    <dl class="ax-proof-grid">
      <dt>Delegated Scope</dt>
      <dd><code>inventory:read, escrow:stage</code> (RFC 8693 OBO attenuated; no direct delete)</dd>
      <dt>Policy Bounds</dt>
      <dd>Max delta &le; 15% per batch; LegalHold check clear</dd>
      <dt>Verification Hash</dt>
      <dd><code>sha256:9f2c...81e4</code></dd>
    </dl>
  </details>

  <div class="ax-actions">
    <button type="button" id="ax-stage-btn">Stage Rebalance in 15m Escrow</button>
    <button type="button" id="ax-abort-btn" hidden>Pull Safety Switch (0 Cost Undo)</button>
  </div>

  <div id="ax-receipt" popover="manual" role="status" aria-live="polite" hidden>
    <p id="ax-receipt-text"></p>
    <button type="button" id="ax-receipt-undo">Undo</button>
    <button type="button" popovertarget="ax-receipt" popovertargetaction="hide">Dismiss</button>
  </div>
</section>
```

```css
.ax-cockpit {
  display: grid;
  gap: 1rem;
  padding: 1.25rem;
  border: 1px solid CanvasText;
  border-radius: 12px;
}

.ax-tier-badge {
  display: inline-block;
  font-size: 0.8125rem;
  font-weight: 600;
  padding: 0.25rem 0.625rem;
  border-radius: 999px;
  border: 1px solid currentColor;
}

.ax-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.ax-actions button,
#ax-receipt button {
  min-block-size: 44px;
  min-inline-size: 44px;
  padding: 0.5rem 1rem;
  cursor: pointer;
}

#ax-receipt:is(:popover-open, .\:popover-open) {
  position: fixed;
  inset: auto 1.25rem 1.25rem auto;
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
  max-inline-size: min(420px, calc(100vw - 2rem));
  padding: 0.875rem 1rem;
  border-radius: 10px;
}

@media (prefers-reduced-motion: reduce) {
  .ax-cockpit,
  #ax-receipt {
    transition: none !important;
    animation: none !important;
  }
}
```

```js
const stageBtn = document.getElementById('ax-stage-btn');
const abortBtn = document.getElementById('ax-abort-btn');
const receipt = document.getElementById('ax-receipt');
const receiptText = document.getElementById('ax-receipt-text');
const undoBtn = document.getElementById('ax-receipt-undo');

let activeEscrowId = null;

function openReceipt(message) {
  receiptText.textContent = message; // Never assign AI strings via innerHTML.
  receipt.hidden = false;
  if ('popover' in HTMLElement.prototype) {
    if (!receipt.matches(':popover-open')) receipt.showPopover();
  } else {
    receipt.classList.add(':popover-open');
  }
}

stageBtn.addEventListener('click', () => {
  activeEscrowId = 'esc_4091';
  abortBtn.hidden = false;
  openReceipt('Held in 15-minute safety window (#esc_4091). Scroll position unchanged.');
});

function triggerRollback() {
  if (!activeEscrowId) return;
  const cancelledId = activeEscrowId;
  activeEscrowId = null;
  abortBtn.hidden = true;
  openReceipt(`Cancelled ${cancelledId} with zero ledger side effects.`);
}

abortBtn.addEventListener('click', triggerRollback);
undoBtn.addEventListener('click', triggerRollback);
```

## Guidelines

- **DO** assign every agent capability an explicit autonomy tier, reversibility duration (`>= 900s` for staged writes), and clear human escalation path.
- **DO** enforce `readOnlyHint: true` vs. mutating tool annotations on the server so read actions cannot silently write state.
- **DO** expose the model version, prompt invariant, policy bounds, and verification hash inside progressive `<details>` disclosures rather than burying them or dumping them inline.
- **DO** use `textContent` or DOM element constructors for all streamed or structured model output.
- **DON'T** let an AI agent confirm its own escrow proposal or escalate its own delegated OBO permissions.
- **DON'T** jump the viewport scroll position or inject normal-flow banners when an agent stages, mutates, or rolls back state.
- **DON'T** bypass `LegalHold` locks via agent confirmation, deletion, or purge buttons.

## Verification & Fallbacks

- **DOM & Playwright assertions:**
  - Verify mutating agent proposals enter a pending escrow state and expose a visible rollback trigger with `min-height >= 44px`.
  - Assert `Math.abs(scrollAfterAction - scrollBeforeAction) === 0` when staging or undoing an agent action.
  - Confirm `LegalHold`-protected records reject agent staging/mutation requests with HTTP `409` and display the statutory block reason in `#ax-receipt`.
  - Assert that `[data-tier]` never reports `AUTONOMOUS_UNRESTRICTED` when `act` (delegated OBO agent) claims are present.
- **Browser fallbacks:** Feature-detect `'popover' in HTMLElement.prototype` before calling `showPopover()` and toggle a `.\:popover-open` class with fixed bottom-end placement when native Popover is absent. Treat `<details name="ax-derivations">` as progressive enhancement; older browsers simply keep multiple panels independent without breaking disclosure access.

## Related Guides

- `four-tier-autonomy-ladder` (via `npx haii-guidance retrieve "four-tier-autonomy-ladder"`) — Exact tier thresholds, badges, and UI interaction contracts.
- `conversational-to-deterministic-handoff` (via `npx haii-guidance retrieve "conversational-to-deterministic-handoff"`) — Transitioning from chat intake to deterministic payload review.
- `show-your-work-derivation-trees` (via `npx haii-guidance retrieve "show-your-work-derivation-trees"`) — Native `<details name="ax-derivations">` lineage UI.
- `time-locked-autonomy-escrow-gate` (via `npx haii-guidance retrieve "time-locked-autonomy-escrow-gate"`) — 900s holding escrow, `LegalHold` `409` dominance, and saga rollback.
- `agentic-obo-privilege-attenuation` (via `npx haii-guidance retrieve "agentic-obo-privilege-attenuation"`) — RFC 8693 OBO delegation ceilings.
- `ax-exception-repair-tree` (via `npx haii-guidance retrieve "ax-exception-repair-tree"`) — Fault classification and dry-run blast-radius containment.
- `zero-displacement-agent-receipts` (via `npx haii-guidance retrieve "zero-displacement-agent-receipts"`) — Choice 1A `popover="manual"` receipts.
- `epistemic-submergence` (via `npx haii-guidance retrieve "epistemic-submergence"`) — Keeping backend plumbing off everyday customer views.
