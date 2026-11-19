---
id: time-locked-autonomy-escrow-gate
title: "Time-Locked Autonomy Escrow Gate"
discipline: D51
category: agentic-experience
kind: use-case
description: "Gate mutating AI agent proposals in a 900-second holding escrow with live countdown, explicit human principal confirmation, HTTP 409 LegalHold dominance, and one-tap saga rollback."
keywords:
  - time locked escrow
  - AutonomyEscrowGate
  - 900s holding window
  - reversible rollback
  - undo
  - LegalHold
  - HTTP 409
  - saga compensation
  - human confirmation
triggers:
  - "building an approval countdown or undo safety window for AI actions"
  - "preventing an AI agent from confirming or deleting records under legal hold"
  - "implementing reversible escrow and compensating rollback for agent mutations"
provenance:
  - PARADIGM_51
  - PARADIGM_109
maturity: stable
---

# Time-Locked Autonomy Escrow Gate

## Overview

High-impact AI proposals must never mutate canonical records silently or permanently on first dispatch. Stage every mutating agent proposal inside a `900`-second (15-minute) holding escrow (`PENDING_HUMAN_ESCROW`) that refuses agent self-confirmation, yields strictly to active `LegalHold` locks with HTTP `409`, and preserves one-tap abort or post-execution saga compensation.

## Decision Rules

### Rule 1: Hold pending mutations in a 900-second time-locked escrow window

When an agent proposes a `CREATE`, `UPDATE`, or `DELETE` operation, stage a pending escrow record with a `900s` expiry (`expiresAtUtc`) and surface a live `tabular-nums` countdown. If the window expires unconfirmed, transition cleanly to `EXPIRED_ABORTED` (`410 ESCROW_PROPOSAL_EXPIRED`) with zero state mutation.

### Rule 2: Enforce human principal confirmation and `LegalHold` HTTP `409` dominance

Reject confirmation calls from delegated agent tokens carrying an `act` claim (`403 AGENT_SELF_CONFIRM_ESCROW_FORBIDDEN`); only an authenticated human principal may confirm. Before staging, updating, or purging any record, check `LegalHold`: an active hold dominates all escrow staging, updates, and deletions, returning HTTP `409` (`K0_05_LEGAL_HOLD_ACTIVE_BLOCKS_ESCROW` / `_MUTATION` / `_PURGE`).

### Rule 3: Separate pre-commit abort from post-commit saga compensation

During `PENDING_HUMAN_ESCROW`, one-tap rollback marks the proposal `ROLLED_BACK_ABORTED` with zero side effects. Once `HUMAN_CONFIRMED_EXECUTED`, refuse fake no-op aborts (`409`) and trigger explicit saga reverse compensation from the captured `preMutationRecordSnapshot` (`ROLLED_BACK_COMPENSATED`), or block rollback honestly (`409 ESCROW_ALREADY_EXECUTED_IRREVERSIBLE`) if irreversible erasure already ran.

## Implementation Pattern

```html
<section id="escrow-gate-panel" class="escrow-panel" aria-labelledby="escrow-title">
  <header class="escrow-header">
    <div>
      <h2 id="escrow-title">Safety Holding Window</h2>
      <p id="escrow-subtitle">Staged proposal #esc_4091 awaits human review or rollback.</p>
    </div>
    <output id="ax-escrow-countdown" class="escrow-timer" for="btn-ax-execute-confirm">15:00</output>
  </header>

  <div class="escrow-controls">
    <label class="hold-toggle">
      <input type="checkbox" id="legal-hold-checkbox">
      Record protected by active LegalHold
    </label>
  </div>

  <div class="escrow-actions">
    <button type="button" id="btn-ax-abort-rollback">
      Pull Safety Switch (1-Tap Undo · 0 Cost)
    </button>
    <button type="button" id="btn-ax-execute-confirm">
      Confirm Staged Change (Human Principal)
    </button>
  </div>

  <p id="escrow-status-line" role="status" aria-live="polite"></p>
</section>
```

```css
.escrow-panel {
  display: grid;
  gap: 0.875rem;
  padding: 1.25rem;
  border: 1px solid CanvasText;
  border-radius: 12px;
}

.escrow-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  gap: 1rem;
}

.escrow-timer {
  font-variant-numeric: tabular-nums;
  font-weight: 700;
  font-size: 1.125rem;
  padding: 0.25rem 0.625rem;
  border: 1px solid currentColor;
  border-radius: 8px;
}

.escrow-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.escrow-actions button {
  min-block-size: 44px;
  padding: 0.5rem 1rem;
  font-weight: 600;
  cursor: pointer;
}
```

```js
const countdownEl = document.getElementById('ax-escrow-countdown');
const holdCheckbox = document.getElementById('legal-hold-checkbox');
const abortBtn = document.getElementById('btn-ax-abort-rollback');
const confirmBtn = document.getElementById('btn-ax-execute-confirm');
const statusLine = document.getElementById('escrow-status-line');

const state = {
  escrowStatus: 'PENDING_HUMAN_ESCROW', // PENDING_HUMAN_ESCROW | HUMAN_CONFIRMED_EXECUTED | ROLLED_BACK_ABORTED | ROLLED_BACK_COMPENSATED
  remainingSec: 900,
  preMutationSnapshot: { allocationKw: 250, status: 'ACTIVE' },
  liveRecord: { allocationKw: 250, status: 'ACTIVE' }
};

function formatClock(totalSeconds) {
  const mins = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const secs = String(totalSeconds % 60).padStart(2, '0');
  return `${mins}:${secs}`;
}

const timerId = setInterval(() => {
  if (state.escrowStatus !== 'PENDING_HUMAN_ESCROW') return;
  if (state.remainingSec <= 1) {
    state.remainingSec = 0;
    state.escrowStatus = 'EXPIRED_ABORTED';
    countdownEl.textContent = '00:00';
    statusLine.textContent = 'Escrow window expired (410). Proposal aborted with zero changes.';
    clearInterval(timerId);
    return;
  }
  state.remainingSec -= 1;
  countdownEl.textContent = formatClock(state.remainingSec);
}, 1000);

confirmBtn.addEventListener('click', () => {
  if (holdCheckbox.checked) {
    statusLine.textContent = 'Blocked (HTTP 409 LEGAL_HOLD_ACTIVE): Active preservation hold overrides execution.';
    return;
  }
  if (state.escrowStatus !== 'PENDING_HUMAN_ESCROW') {
    statusLine.textContent = `Refused (HTTP 409): Proposal already resolved (${state.escrowStatus}).`;
    return;
  }
  state.preMutationSnapshot = { ...state.liveRecord };
  state.liveRecord = { allocationKw: 400, status: 'DISPATCHED' };
  state.escrowStatus = 'HUMAN_CONFIRMED_EXECUTED';
  abortBtn.textContent = 'Run Saga Reverse Compensation (Restore Prior Snapshot)';
  statusLine.textContent = 'Human principal confirmed. Pre-mutation snapshot preserved for saga reversal.';
});

abortBtn.addEventListener('click', () => {
  if (state.escrowStatus === 'PENDING_HUMAN_ESCROW') {
    state.escrowStatus = 'ROLLED_BACK_ABORTED';
    statusLine.textContent = 'Pending escrow aborted cleanly. Zero records changed.';
    return;
  }
  if (state.escrowStatus === 'HUMAN_CONFIRMED_EXECUTED') {
    state.liveRecord = { ...state.preMutationSnapshot };
    state.escrowStatus = 'ROLLED_BACK_COMPENSATED';
    statusLine.textContent = 'Saga reverse compensation complete. Prior snapshot restored.';
  }
});
```

## Guidelines

- **DO** display the remaining escrow duration using `font-variant-numeric: tabular-nums` so countdown digits never jitter horizontally every second.
- **DO** enforce `LegalHold` checks before both escrow staging and final commit/purge, surfacing HTTP `409` status explanations immediately in an accessible live region.
- **DO** record a deep copy of `preMutationRecordSnapshot` on commit so post-confirmation rollback runs authentic compensating writes and emits a compensation event.
- **DO** separate the `Pull Safety Switch` abort button from `Confirm` with clear visual spacing (`>= 12px`) to prevent accidental slip clicks.
- **DON'T** auto-commit `DELETE` or `PURGE` actions when the 900s timer reaches `00:00`; expiration must fail safe to `EXPIRED_ABORTED`.
- **DON'T** allow an agent token (`claims.act`) to invoke the confirmation or post-commit compensation endpoint.
- **DON'T** report an already-executed mutation as "Aborted without side effects"; always distinguish `ROLLED_BACK_ABORTED` from `ROLLED_BACK_COMPENSATED`.

## Verification & Fallbacks

- **DOM & Playwright assertions:**
  - Verify initial countdown renders `15:00` (`900s`) in `#ax-escrow-countdown` and ticks downward while `PENDING_HUMAN_ESCROW`.
  - Toggle `#legal-hold-checkbox` ON, click `#btn-ax-execute-confirm`, and assert HTTP `409` / `LEGAL_HOLD_ACTIVE` message appears in `#escrow-status-line` while `state.liveRecord` remains untouched.
  - Toggle `#legal-hold-checkbox` OFF, confirm, then click `#btn-ax-abort-rollback` and assert `#escrow-status-line` confirms saga reverse compensation restored the pre-mutation snapshot.
- **Browser fallbacks:** `<output>`, `role="status"`, and `font-variant-numeric: tabular-nums` work across all modern browsers. In environments with `prefers-reduced-motion: reduce`, update the text timer at 1-second or 15-second cadence without animated progress rings.

## Related Guides

- `agentic-experience` (via `npx haii-guidance retrieve "agentic-experience"`) — Discipline-level supervisory guarantees.
- `four-tier-autonomy-ladder` (via `npx haii-guidance retrieve "four-tier-autonomy-ladder"`) — When `SUPERVISED_AUTONOMY` escrow is mandatory.
- `agentic-obo-privilege-attenuation` (via `npx haii-guidance retrieve "agentic-obo-privilege-attenuation"`) — Rejecting agent self-confirmation via RFC 8693 `act` claims.
- `zero-displacement-agent-receipts` (via `npx haii-guidance retrieve "zero-displacement-agent-receipts"`) — Projecting escrow receipts in top-layer popovers without scroll jumps.
- `imperative-affordance-grammar` (via `npx haii-guidance retrieve "imperative-affordance-grammar"`) — Labeling abort vs. confirm handles clearly.
