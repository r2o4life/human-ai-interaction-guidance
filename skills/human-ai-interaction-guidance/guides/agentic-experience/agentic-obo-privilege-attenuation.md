---
id: agentic-obo-privilege-attenuation
title: "Agentic On-Behalf-Of (OBO) Privilege Attenuation"
discipline: D51
category: agentic-experience
kind: use-case
description: "Display and enforce RFC 8693 On-Behalf-Of agent token scope ceilings so delegated AI copilots cannot escalate past human grants or bypass human escrow."
keywords:
  - RFC 8693
  - on-behalf-of
  - OBO delegation
  - privilege attenuation
  - act claim
  - CRUDPA grants
  - scope ceiling
  - zero trust
  - agent permissions
triggers:
  - "showing what permissions an AI agent holds on a user's behalf"
  - "preventing AI privilege escalation or chained agent delegation"
  - "designing OAuth token exchange consent or scope inspection UI"
provenance:
  - PARADIGM_106
  - PARADIGM_109
maturity: stable
---

# Agentic On-Behalf-Of (OBO) Privilege Attenuation

## Overview

An AI copilot acting for a human user must never inherit unrestricted admin authority or mint broader credentials than its delegating principal. Under RFC 8693 On-Behalf-Of (OBO) token exchange, the agent's effective permissions are strictly the intersection of the human's grants, the server-enforced copilot ceiling, and requested verbs (`CRUDPA`), surfaced transparently in the UI.

## Decision Rules

### Rule 1: Attenuate scope as the strict set intersection (`Human ∩ Copilot Ceiling ∩ Requested`)

Never grant an agent permissions the human lacks, and never allow a human admin's full privileges to pass through unattenuated if the copilot ceiling excludes destructive verbs. Compute attenuated grants server-side and ignore any client-supplied `AUTONOMOUS_UNRESTRICTED` override.

### Rule 2: Pin destructive verbs behind escrow and block chained agent escalation

Mark destructive operations (`D` delete, `P` purge) as `escrow_required_verbs` on the minted `act` claim so the agent can only stage proposals, never finalize them. Reject token-exchange requests where the incoming `subject_token` already contains an `act` claim (`403 RFC8693_CHAINED_AGENT_ESCALATION_FORBIDDEN`).

### Rule 3: Disclose exact delegated actor identity, TTL, and excluded rights in the UI

Before a user delegates a task, show a non-technical plain-English scope card alongside an inspectable breakdown: delegating human identity, `agent:*` actor ID, short token TTL (for example `180s`), permitted actions, and explicitly blocked actions.

## Implementation Pattern

```html
<section class="obo-panel" aria-labelledby="obo-title">
  <h2 id="obo-title">Copilot Delegation Scope</h2>
  <p class="obo-lead">
    Your assistant operates on your behalf with narrowed permissions and a 3-minute session limit.
  </p>

  <fieldset class="obo-request-group">
    <legend>Select capabilities to request for this session</legend>
    <label><input type="checkbox" name="obo-verb" value="R" checked> Read inventory &amp; schedules (R)</label>
    <label><input type="checkbox" name="obo-verb" value="C" checked> Stage new draft proposals (C)</label>
    <label><input type="checkbox" name="obo-verb" value="U" checked> Propose parameter updates (U)</label>
    <label><input type="checkbox" name="obo-verb" value="D"> Delete or purge records (D/P — Held in Escrow)</label>
  </fieldset>

  <div class="obo-ceiling-card" role="status" aria-live="polite">
    <h3>Effective Attenuated Token Claims</h3>
    <dl class="obo-dl">
      <dt>Human Principal</dt>
      <dd id="obo-human-sub">operator@northgrid.example</dd>
      <dt>Agent Actor (<code>act.sub</code>)</dt>
      <dd id="obo-agent-sub">agent:copilot_scheduler</dd>
      <dt>Token TTL / Posture</dt>
      <dd id="obo-ttl-posture">180s · HUMAN_IN_THE_LOOP_ESCROW</dd>
      <dt>Granted Direct Verbs</dt>
      <dd id="obo-granted-verbs">R, C, U</dd>
      <dt>Escrow-Gated / Denied</dt>
      <dd id="obo-denied-verbs">D, P (Cannot self-confirm; chained delegation blocked)</dd>
    </dl>
  </div>
</section>
```

```css
.obo-panel {
  display: grid;
  gap: 1rem;
  padding: 1.25rem;
  border: 1px solid CanvasText;
  border-radius: 12px;
}

.obo-request-group {
  display: grid;
  gap: 0.5rem;
  border: 1px solid CanvasText;
  border-radius: 8px;
  padding: 0.75rem 1rem;
}

.obo-request-group label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-block-size: 36px;
}

.obo-dl {
  display: grid;
  grid-template-columns: minmax(170px, auto) 1fr;
  gap: 0.375rem 1rem;
  margin: 0;
}
```

```js
const HUMAN_GRANTS = new Set(['C', 'R', 'U', 'D']);
const COPILOT_CEILING = new Set(['C', 'R', 'U']); // Server ceiling blocks direct 'D' / 'P' execution.
const ESCROW_REQUIRED = new Set(['D', 'P']);

const checkboxes = document.querySelectorAll('input[name="obo-verb"]');
const grantedEl = document.getElementById('obo-granted-verbs');
const deniedEl = document.getElementById('obo-denied-verbs');

function recomputeAttenuatedScope() {
  const requested = Array.from(checkboxes)
    .filter((box) => box.checked)
    .map((box) => box.value);

  const directGranted = requested.filter((verb) => HUMAN_GRANTS.has(verb) && COPILOT_CEILING.has(verb));
  const escrowOrBlocked = requested.filter((verb) => !directGranted.includes(verb));

  grantedEl.textContent = directGranted.length > 0 ? directGranted.join(', ') : 'None (read-only fallback)';
  deniedEl.textContent = escrowOrBlocked.some((v) => ESCROW_REQUIRED.has(v))
    ? 'D, P blocked from direct execution (must enter 900s human escrow)'
    : 'D, P excluded; chained agent-to-agent exchange disabled';
}

checkboxes.forEach((box) => box.addEventListener('change', recomputeAttenuatedScope));
recomputeAttenuatedScope();
```

## Guidelines

- **DO** compute and display the intersection of human permissions and the copilot ceiling visibly before delegation starts.
- **DO** keep OBO access tokens short-lived (`<= 180s`–`300s`) and attach the `act` actor claim unambiguously.
- **DO** route any destructive verb (`D`, `P`) requested by an agent straight into a `PENDING_HUMAN_ESCROW` staging endpoint rather than direct execution.
- **DON'T** permit agent-to-agent token chaining (`subjectClaims.act` exchanging for another `act` token).
- **DON'T** trust client UI state or `autonomyPosture` flags in request bodies to widen agent capabilities on the server.
- **DON'T** expose raw JWT signatures or OAuth plumbing jargon (`RFC 8693`, `CRUDPA`, `AAL`) in consumer-facing Habitat A views; keep deep claim inspectors in technical audit panels or Habitat B.

## Verification & Fallbacks

- **DOM & Playwright assertions:**
  - Check all capability boxes including `D`, and verify `#obo-granted-verbs` never lists `D` or `P` while `#obo-denied-verbs` explicitly discloses human-escrow containment.
  - Backend integration check: submit a token with an existing `act` claim to the OBO exchange endpoint and assert HTTP `403` (`RFC8693_CHAINED_AGENT_ESCALATION_FORBIDDEN`).
  - Submit `autonomyPosture: "AUTONOMOUS_UNRESTRICTED"` in a delegation request and assert the server forces `HUMAN_IN_THE_LOOP_ESCROW`.
- **Browser fallbacks:** Built entirely on native `<fieldset>`, checkboxes, `<dl>`, and `aria-live="polite"`, requiring zero polyfills or external scripts.

## Related Guides

- `agentic-experience` (via `npx haii-guidance retrieve "agentic-experience"`) — Overall supervisory governance model.
- `four-tier-autonomy-ladder` (via `npx haii-guidance retrieve "four-tier-autonomy-ladder"`) — Mapping attenuated scopes to autonomy tiers.
- `time-locked-autonomy-escrow-gate` (via `npx haii-guidance retrieve "time-locked-autonomy-escrow-gate"`) — How escrow-required verbs (`D`, `P`) execute safely.
- `dual-habitat-jargon-quarantine` (via `npx haii-guidance retrieve "dual-habitat-jargon-quarantine"`) — Separating plain-English scope summaries from cryptographic claim inspection.
