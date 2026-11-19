---
id: four-tier-autonomy-ladder
title: "Four-Tier Autonomy Ladder"
discipline: D51
category: agentic-experience
kind: use-case
description: "Classify every AI feature into ADVISORY, SUGGESTIVE, SUPERVISED_AUTONOMY, or AUTONOMOUS_GOVERNANCE with matching UI confirmation gates, escrow timers, and stop handles."
keywords:
  - autonomy ladder
  - ADVISORY
  - SUGGESTIVE
  - SUPERVISED_AUTONOMY
  - AUTONOMOUS_GOVERNANCE
  - human-in-the-loop
  - MCP annotations
  - readOnlyHint
  - supervisory AI
triggers:
  - "deciding how much confirmation friction an AI action needs"
  - "labeling AI suggestions versus staged automated actions"
  - "designing multi-tier agent autonomy controls or mode switchers"
provenance:
  - PARADIGM_51
  - PARADIGM_106
  - PARADIGM_109
maturity: stable
---

# Four-Tier Autonomy Ladder

## Overview

Every AI-assisted workflow belongs to one of four discrete autonomy tiers: `ADVISORY`, `SUGGESTIVE`, `SUPERVISED_AUTONOMY`, or `AUTONOMOUS_GOVERNANCE`. Binding UI friction, reversibility windows, and server authorization checks directly to these four tiers prevents both silent destructive automation and unnecessary approval fatigue on read-only insights.

## Decision Rules

Pick the tier that matches the blast radius and tool annotation (`readOnlyHint` vs. mutating/destructive).

### Rule 1: `ADVISORY` — Passive guidance with zero state mutation

Use when the model summarizes, classifies, or highlights risk without drafting or executing writes (`readOnlyHint: true`). Render inline recommendations with no mutation CTA and zero background side effects.

### Rule 2: `SUGGESTIVE` — Pre-configured payload awaiting explicit confirmation

Use when an agent prepares a concrete draft, diff, or form prefill with moderate impact. Require an explicit human click on an imperative commit button (`Apply Draft`, `Send Message`) before mutating persistent state.

### Rule 3: `SUPERVISED_AUTONOMY` — Staged execution inside a 900s holding escrow

Use for high-stakes batch updates, scheduling, or resource allocation where speed matters but human veto must remain open. Stage execution into a 900-second holding escrow with a live countdown, prominent `Pull Safety Switch (Undo)` handle, and server-side refusal if an AI principal attempts self-confirmation.

### Rule 4: `AUTONOMOUS_GOVERNANCE` — Closed-loop execution inside hard policy invariants

Use only for bounded closed-loop controls (such as rate throttling or thermal containment) governed by deterministic safety ceilings, multi-signatory pre-authorization, and an immediate `< 1s` kill-switch. Never grant unrestricted autonomy (`AUTONOMOUS_UNRESTRICTED`) to delegated agent tokens.

| Tier | Execution Authority | Reversibility Contract | Primary UI Control |
| :--- | :--- | :--- | :--- |
| `ADVISORY` | Read-only analysis | Not applicable (no write) | Inline insight + derivation disclosure |
| `SUGGESTIVE` | Human executes draft | Standard edit / cancel | Side-by-side diff + explicit Confirm button |
| `SUPERVISED_AUTONOMY` | Escrowed 900s timer | 1-tap instant rollback + saga compensation | Live countdown + Safety Switch + Bypass |
| `AUTONOMOUS_GOVERNANCE` | Policy-bounded loop | Immediate kill-switch (`503` circuit open) | Policy bounds badge + Emergency Halt |

## Implementation Pattern

```html
<section class="autonomy-panel" aria-labelledby="ladder-heading">
  <h2 id="ladder-heading">Autonomy Posture &amp; Control Contract</h2>

  <fieldset class="tier-selector">
    <legend>Select active supervisory tier</legend>
    <label><input type="radio" name="autonomy-tier" value="ADVISORY"> Tier 1 · Advisory</label>
    <label><input type="radio" name="autonomy-tier" value="SUGGESTIVE" checked> Tier 2 · Suggestive</label>
    <label><input type="radio" name="autonomy-tier" value="SUPERVISED_AUTONOMY"> Tier 3 · Supervised Escrow</label>
    <label><input type="radio" name="autonomy-tier" value="AUTONOMOUS_GOVERNANCE"> Tier 4 · Bounded Governance</label>
  </fieldset>

  <div id="tier-contract-card" class="contract-card" aria-live="polite">
    <p id="tier-summary"></p>
    <div class="contract-actions">
      <button type="button" id="tier-primary-action"></button>
      <button type="button" id="tier-halt-action" hidden></button>
    </div>
  </div>
</section>
```

```css
.tier-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem 1.25rem;
  border: 1px solid CanvasText;
  border-radius: 10px;
  padding: 0.75rem 1rem;
}

.contract-card {
  margin-top: 1rem;
  padding: 1rem;
  border-radius: 10px;
  border: 1px solid CanvasText;
}

.contract-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 0.75rem;
}

.contract-actions button {
  min-block-size: 44px;
  padding: 0.5rem 1rem;
  font-weight: 600;
}

.tier-selector input:focus-visible,
.contract-actions button:focus-visible {
  outline: 3px solid Highlight;
  outline-offset: 2px;
}
```

```js
const TIER_CONTRACTS = Object.freeze({
  ADVISORY: {
    summary: 'Read-only diagnostic analysis. Agent proposes rationale only; zero writes permitted.',
    primaryLabel: 'Inspect Recommendation Rationale',
    haltLabel: null
  },
  SUGGESTIVE: {
    summary: 'Agent prepared a structured payload diff. Human click required before commit.',
    primaryLabel: 'Review and Commit Suggested Change',
    haltLabel: 'Discard Draft (No Change)'
  },
  SUPERVISED_AUTONOMY: {
    summary: 'Action enters a 900s safety holding window with 1-tap rollback before final commit.',
    primaryLabel: 'Stage in 15-Minute Holding Escrow',
    haltLabel: 'Pull Safety Switch (1-Tap Undo)'
  },
  AUTONOMOUS_GOVERNANCE: {
    summary: 'Policy-bounded loop active within pre-approved limits. Emergency halt stays pinned.',
    primaryLabel: 'Verify Policy Ceiling Envelope',
    haltLabel: 'Engage Immediate Kill-Switch'
  }
});

const summaryEl = document.getElementById('tier-summary');
const primaryBtn = document.getElementById('tier-primary-action');
const haltBtn = document.getElementById('tier-halt-action');

function applyTierContract(tierKey) {
  const contract = TIER_CONTRACTS[tierKey] || TIER_CONTRACTS.SUGGESTIVE;
  summaryEl.textContent = contract.summary;
  primaryBtn.textContent = contract.primaryLabel;
  if (contract.haltLabel) {
    haltBtn.hidden = false;
    haltBtn.textContent = contract.haltLabel;
  } else {
    haltBtn.hidden = true;
  }
}

document.querySelector('.tier-selector').addEventListener('change', (event) => {
  if (event.target.name === 'autonomy-tier') {
    applyTierContract(event.target.value);
  }
});

applyTierContract('SUGGESTIVE');
```

## Guidelines

- **DO** expose all four tiers as visible radio options (`2–5` mutually exclusive choices) when operators configure workspace posture, rather than hiding posture behind opaque settings.
- **DO** bind UI tier contracts to server-enforced policy ceilings; the server must remain authoritative over what an agent token can commit.
- **DO** pair `SUPERVISED_AUTONOMY` and `AUTONOMOUS_GOVERNANCE` states with a continuously accessible abort or kill-switch control (`>= 44px` hitbox).
- **DON'T** execute `SUPERVISED_AUTONOMY` mutations directly without staging a reversible escrow window (`>= 900s`) unless an authenticated human principal explicitly confirms.
- **DON'T** accept client-supplied `autonomyPosture: "AUTONOMOUS_UNRESTRICTED"` overrides in API payloads or MCP calls.
- **DON'T** label `ADVISORY` read-only insights with mutation verbs like "Auto-Fixed" or "Applied".

## Verification & Fallbacks

- **DOM & Playwright assertions:**
  - Verify switching between all four radio inputs updates `#tier-summary`, `#tier-primary-action`, and `#tier-halt-action` visibility synchronously with `0` console errors.
  - Assert that `ADVISORY` hides `#tier-halt-action` and never fires mutating `POST`/`PATCH`/`DELETE` requests.
  - Assert that `SUPERVISED_AUTONOMY` and `AUTONOMOUS_GOVERNANCE` expose a visible `#tier-halt-action` button whose bounding box meets `width >= 44` and `height >= 44`.
- **Browser fallbacks:** Native `<fieldset>`, `<legend>`, `<input type="radio">`, and `[hidden]` work in all browsers without polyfills. Always use explicit `textContent` updates instead of HTML templates.

## Related Guides

- `agentic-experience` (via `npx haii-guidance retrieve "agentic-experience"`) — Discipline overview for supervisory AI governance.
- `conversational-to-deterministic-handoff` (via `npx haii-guidance retrieve "conversational-to-deterministic-handoff"`) — Moving from Tier 1/2 chat intake to structured execution.
- `time-locked-autonomy-escrow-gate` (via `npx haii-guidance retrieve "time-locked-autonomy-escrow-gate"`) — Implementing the Tier 3 `900s` holding escrow countdown.
- `agentic-obo-privilege-attenuation` (via `npx haii-guidance retrieve "agentic-obo-privilege-attenuation"`) — Enforcing server-authoritative scope ceilings across tiers.
- `imperative-affordance-grammar` (via `npx haii-guidance retrieve "imperative-affordance-grammar"`) — Writing risk-scoped button labels for each tier.
