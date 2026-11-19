---
id: conversational-to-deterministic-handoff
title: "Conversational-to-Deterministic Handoff"
discipline: D51
category: agentic-experience
kind: use-case
description: "Transition users from an empathetic Layer-1 conversational router into a persona-free Layer-2 deterministic Show-Your-Work payload and explicit confirmation gate."
keywords:
  - conversational UI
  - deterministic handoff
  - Layer-1 router
  - Layer-2 execution
  - show your work
  - structured payload
  - persona shedding
  - confirmation dialog
triggers:
  - "turning a chat prompt into a live system change or booking"
  - "preventing LLM chatbot hallucinations during transactions"
  - "designing AI triage before form or API execution"
provenance:
  - PARADIGM_51
  - PARADIGM_109
maturity: stable
---

# Conversational-to-Deterministic Handoff

## Overview

Pure chat interfaces obscure exact parameters behind conversational prose, while bare multi-field forms intimidate users who still have ambiguous goals. Solve both by pairing a natural-language Layer-1 router that clarifies intent with a strict Layer-2 handoff that drops all chat persona and renders a deterministic payload, policy citation, and explicit confirm button.

## Decision Rules

### Rule 1: Use Layer 1 strictly for intent disambiguation and parameter extraction

Keep conversational bubbles focused on clarifying constraints, missing fields, and operational boundaries. Never execute state mutations, payments, deletions, or external dispatches directly from a free-form chat reply.

### Rule 2: Shed persona completely at Layer 2 handoff

When intent resolves to an actionable command, transition into a utilitarian execution card or native `<dialog>`. Replace first-person AI phrasing ("I went ahead and scheduled...") with exact typed parameters, quantitative derivations, rule citations, and an explicit confirm or cancel trigger.

### Rule 3: Preserve two-way escapability across the handoff boundary

Allow operators to jump back from Layer 2 to Layer 1 to revise parameters without losing prior context, and never trap focus or scroll position during handoff transitions.

## Implementation Pattern

```html
<section class="handoff-stage" aria-labelledby="handoff-title">
  <h2 id="handoff-title">Dispatch Intent &amp; Verification</h2>

  <!-- Layer 1: Conversational Router -->
  <form id="l1-router-form" class="l1-router">
    <label for="intent-prompt">Describe what you want to schedule or change</label>
    <div class="l1-input-row">
      <input id="intent-prompt" name="prompt" type="text" required
             placeholder="Shift 200 kW from Substation B during peak hours">
      <button type="submit">Prepare Exact Plan</button>
    </div>
    <p id="l1-boundary-hint" class="hint" aria-live="polite"></p>
  </form>

  <!-- Layer 2: Deterministic Show-Your-Work Execution Card (Persona Shed) -->
  <section id="l2-execution-card" class="l2-card" aria-labelledby="l2-heading" hidden>
    <header class="l2-header">
      <h3 id="l2-heading">Execution Payload Preview</h3>
      <button type="button" id="l2-back-btn">Revise Request</button>
    </header>

    <dl class="l2-spec-list">
      <dt>Target Resource</dt>
      <dd id="l2-target"></dd>
      <dt>Computed Delta</dt>
      <dd id="l2-delta"></dd>
      <dt>Rule Citation</dt>
      <dd id="l2-citation"></dd>
    </dl>

    <pre id="l2-json-preview" class="l2-json" tabindex="0"></pre>

    <div class="l2-actions">
      <button type="button" command="show-modal" commandfor="l2-confirm-dialog" id="l2-open-confirm">
        Commit Plan in 15-Minute Escrow
      </button>
    </div>
  </section>

  <dialog id="l2-confirm-dialog" closedby="any" aria-labelledby="l2-dialog-title">
    <h2 id="l2-dialog-title">Confirm Staged Execution?</h2>
    <p id="l2-dialog-summary"></p>
    <form method="dialog" class="dialog-actions">
      <button value="cancel" autofocus>Cancel</button>
      <button value="confirm">Stage in Escrow</button>
    </form>
  </dialog>
</section>
```

```css
.handoff-stage {
  display: grid;
  gap: 1rem;
}

.l1-input-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.375rem;
}

.l1-input-row input {
  flex: 1 1 240px;
  min-block-size: 44px;
  padding: 0.5rem 0.75rem;
}

.l1-input-row button,
.l2-actions button,
.l2-header button,
.dialog-actions button {
  min-block-size: 44px;
  padding: 0.5rem 1rem;
  cursor: pointer;
}

.l2-card {
  padding: 1rem;
  border: 1px solid CanvasText;
  border-radius: 10px;
}

.l2-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.l2-spec-list {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.375rem 1rem;
}

.l2-json {
  overflow-x: auto;
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid CanvasText;
  font-size: 0.8125rem;
}

dialog:modal {
  overscroll-behavior: contain;
}

dialog::backdrop {
  overflow: hidden;
  overscroll-behavior: contain;
}
```

```js
const routerForm = document.getElementById('l1-router-form');
const promptInput = document.getElementById('intent-prompt');
const hintEl = document.getElementById('l1-boundary-hint');
const l2Card = document.getElementById('l2-execution-card');
const backBtn = document.getElementById('l2-back-btn');
const confirmDialog = document.getElementById('l2-confirm-dialog');
const openConfirmBtn = document.getElementById('l2-open-confirm');

function compileDeterministicPlan(rawPrompt) {
  const matchKw = rawPrompt.match(/(\d+)\s*kw/i);
  const kw = matchKw ? Number(matchKw[1]) : 200;
  if (kw <= 0 || kw > 850) {
    return { valid: false, reason: 'Requested load must stay between 1 kW and 850 kW feeder capacity.' };
  }
  return {
    valid: true,
    target: 'Substation B · Feeder 02',
    delta: `-${kw} kW peak shed (45 min window)`,
    citation: 'Operational Cap §4.2 (Max 850 kW)',
    payload: { action: 'STAGE_LOAD_SHED', targetId: 'sub_b_f02', kilowatts: kw, escrowTtlSec: 900 }
  };
}

routerForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const plan = compileDeterministicPlan(promptInput.value);
  if (!plan.valid) {
    hintEl.textContent = plan.reason;
    promptInput.setAttribute('aria-invalid', 'true');
    return;
  }
  promptInput.removeAttribute('aria-invalid');
  hintEl.textContent = '';
  document.getElementById('l2-target').textContent = plan.target;
  document.getElementById('l2-delta').textContent = plan.delta;
  document.getElementById('l2-citation').textContent = plan.citation;
  document.getElementById('l2-json-preview').textContent = JSON.stringify(plan.payload, null, 2);
  document.getElementById('l2-dialog-summary').textContent =
    `${plan.target}: ${plan.delta} under ${plan.citation}. Reversible for 15 minutes.`;
  l2Card.hidden = false;
  document.getElementById('l2-heading').setAttribute('tabindex', '-1');
  document.getElementById('l2-heading').focus({ preventScroll: true });
});

backBtn.addEventListener('click', () => {
  l2Card.hidden = true;
  promptInput.focus({ preventScroll: true });
});

if (!('commandForElement' in HTMLButtonElement.prototype)) {
  openConfirmBtn.addEventListener('click', () => confirmDialog.showModal());
}

confirmDialog.addEventListener('close', () => {
  const choice = confirmDialog.returnValue;
  confirmDialog.returnValue = '';
  if (choice === 'confirm') {
    hintEl.textContent = 'Staged in 15-minute holding escrow.';
  }
});
```

## Guidelines

- **DO** validate parsed parameters against deterministic schema and domain bounds before rendering the Layer-2 card.
- **DO** expose the exact JSON payload or structured field table so operators verify what the backend will receive, not an AI paraphrase.
- **DO** put `autofocus` on the safe `Cancel` button inside the final `<dialog>` confirmation and reset `dialog.returnValue = ''` on `close`.
- **DO** return focus to `#intent-prompt` via `focus({ preventScroll: true })` when the user clicks `Revise Request`.
- **DON'T** keep conversational humor, emojis, or speculative filler inside Layer-2 execution cards.
- **DON'T** execute writes straight from an LLM text response without a deterministic review step.
- **DON'T** discard the user's Layer-1 prompt when stepping back from Layer 2 to edit an input.

## Verification & Fallbacks

- **DOM & Playwright assertions:**
  - Submit an out-of-bounds prompt (e.g., `1200 kW`) and assert `#l1-boundary-hint` explains the bound, `aria-invalid="true"` is set, and `#l2-execution-card` stays `hidden`.
  - Submit a valid prompt and assert `#l2-execution-card` becomes visible, `#l2-json-preview` renders valid JSON via `textContent`, and clicking `#l2-back-btn` restores focus to `#intent-prompt` with its text intact.
  - Open `#l2-confirm-dialog` and assert `Esc` dismissal sets `returnValue === ''` without executing commit logic.
- **Browser fallbacks:** Feature-detect `'commandForElement' in HTMLButtonElement.prototype` and attach a direct `showModal()` click handler when Invoker Commands are unavailable. If `closedby="any"` is unsupported, guard backdrop clicks with pointer coordinate bounds on `pointerdown`/`pointerup`.

## Related Guides

- `four-tier-autonomy-ladder` (via `npx haii-guidance retrieve "four-tier-autonomy-ladder"`) — Choosing confirmation vs. escrow at handoff.
- `show-your-work-derivation-trees` (via `npx haii-guidance retrieve "show-your-work-derivation-trees"`) — Expanding Layer-2 rationale into an exclusive derivation accordion.
- `time-locked-autonomy-escrow-gate` (via `npx haii-guidance retrieve "time-locked-autonomy-escrow-gate"`) — Backing the staged Layer-2 commit with a 900s safety window.
- `imperative-affordance-grammar` (via `npx haii-guidance retrieve "imperative-affordance-grammar"`) — Structuring Layer-2 button labels.
