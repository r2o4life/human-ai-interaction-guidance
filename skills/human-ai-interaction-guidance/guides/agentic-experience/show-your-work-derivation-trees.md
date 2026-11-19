---
id: show-your-work-derivation-trees
title: "Show-Your-Work Derivation Trees"
discipline: D51
category: agentic-experience
kind: use-case
description: "Expose AI reasoning lineage—prompt invariant, model family, policy constraints, intermediate hypotheses, and verification hash—inside native exclusive <details name=\"ax-derivations\"> accordions."
keywords:
  - show your work
  - derivation tree
  - details name
  - exclusive accordion
  - prompt invariant
  - verification hash
  - AI explainability
  - progressive disclosure
triggers:
  - "explaining how an AI calculated a number or recommendation"
  - "building an inspectable AI reasoning trace without clutter"
  - "auditing model parameters and policy bounds in the UI"
provenance:
  - PARADIGM_51
maturity: stable
---

# Show-Your-Work Derivation Trees

## Overview

Black-box AI scores and recommendations erode operator trust because users cannot verify inputs, constraints, or math. Surface the complete calculation lineage—prompt invariant, model metadata, policy bounds, intermediate steps, and verification digest—inside native `<details name="ax-derivations">` accordions that stay collapsed at rest and unfold cleanly on demand.

## Decision Rules

### Rule 1: Surface all six lineage nodes inside the derivation disclosure

Every non-trivial AI calculation or policy decision must disclose: (1) prompt invariant or rule objective, (2) model family and deterministic parameters (such as temperature), (3) enforced policy constraints, (4) intermediate hypotheses or arithmetic steps, (5) rejected alternatives where relevant, and (6) the verification digest.

### Rule 2: Use native `<details name="ax-derivations">` for single-open step inspection

Group derivation panels with a shared `name="ax-derivations"` attribute so browsers enforce single-open exclusivity without custom JavaScript state machines. Never nest `<h2>`–`<h6>` elements inside `<summary>`, because screen readers expose `<summary>` with button semantics and strip child heading roles.

### Rule 3: Keep derivation prose scannable and DOM-safe

Render intermediate values with `font-variant-numeric: tabular-nums` inside semantic `<dl>` or `<ol>` lists, and populate model-supplied steps strictly via `textContent`.

## Implementation Pattern

```html
<section class="ax-lineage" aria-labelledby="lineage-heading">
  <h2 id="lineage-heading">Allocation Calculation &amp; Lineage</h2>

  <div class="ax-lineage-list">
    <details name="ax-derivations" class="ax-step-card">
      <summary class="ax-step-summary">
        <span class="ax-step-title">Step 1 · Prompt Invariant &amp; Model Envelope</span>
        <span class="ax-step-status">Verified</span>
      </summary>
      <dl class="ax-step-dl">
        <dt>Prompt Invariant</dt>
        <dd>Minimize peak tariff surcharge while preserving 20% emergency battery reserve.</dd>
        <dt>Model &amp; Determinism</dt>
        <dd><code>planner-v4 · temperature=0.0 · seed=4091</code></dd>
        <dt>Policy Constraints</dt>
        <dd>Feeder ceiling &le; 850 kW; LegalHold inactive; OBO scope read+stage</dd>
      </dl>
    </details>

    <details name="ax-derivations" class="ax-step-card">
      <summary class="ax-step-summary">
        <span class="ax-step-title">Step 2 · Intermediate Hypotheses &amp; Math</span>
        <span class="ax-step-status">+$120,700/yr Net</span>
      </summary>
      <ol class="ax-step-ol">
        <li>Baseline peak yield: <code>850 kW × $0.18/kWh &rarr; $142,000/yr</code></li>
        <li>Escrow buffer reserve (10%): <code>-$14,200/yr</code></li>
        <li>Thermal safety margin (5%): <code>-$7,100/yr</code></li>
        <li>Net retained outcome: <code>$120,700/yr</code></li>
      </ol>
    </details>

    <details name="ax-derivations" class="ax-step-card">
      <summary class="ax-step-summary">
        <span class="ax-step-title">Step 3 · Deterministic Verification Digest</span>
        <span class="ax-step-status"><code>sha256:8f4a...c91b</code></span>
      </summary>
      <p class="ax-hash-note">
        Input snapshot and output arithmetic match the signed verification digest.
      </p>
    </details>
  </div>
</section>
```

```css
.ax-lineage-list {
  display: grid;
  gap: 0.5rem;
}

.ax-step-card {
  border: 1px solid CanvasText;
  border-radius: 10px;
  padding: 0.25rem 0.875rem;
}

.ax-step-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  min-block-size: 44px;
  cursor: pointer;
  font-weight: 600;
  list-style: none;
}

.ax-step-summary::-webkit-details-marker {
  display: none;
}

.ax-step-status {
  font-variant-numeric: tabular-nums;
  font-size: 0.8125rem;
}

.ax-step-dl {
  display: grid;
  grid-template-columns: minmax(140px, auto) 1fr;
  gap: 0.375rem 1rem;
  margin: 0 0 0.75rem;
}

.ax-step-ol {
  margin: 0 0 0.75rem;
  padding-inline-start: 1.25rem;
  font-variant-numeric: tabular-nums;
}

@media (prefers-reduced-motion: no-preference) {
  .ax-step-card::details-content {
    transition: block-size 180ms ease, content-visibility 180ms allow-discrete;
  }
}
```

## Guidelines

- **DO** include units, formulas, and numerical intermediate steps rather than vague confidence percentages alone.
- **DO** keep `<summary>` text plain (using `<span>` elements for title/status) and enforce `min-block-size: 44px` for comfortable touch and keyboard activation.
- **DO** use `font-variant-numeric: tabular-nums` on every numerical derivation row so digits align cleanly.
- **DON'T** place heading elements (`<h2>`, `<h3>`, etc.) inside `<summary>`; VoiceOver, JAWS, and TalkBack suppress child heading roles inside disclosure buttons.
- **DON'T** invent fake verification hashes or static confidence strings disconnected from actual computed values.
- **DON'T** auto-expand in-flow derivation `<details>` panels while a user is typing in a nearby search field (route live search matches to a top-layer anchored popover instead).

## Verification & Fallbacks

- **DOM & Playwright assertions:**
  - Verify all `<details name="ax-derivations">` elements remain collapsed (`open === false`) on initial load, preserving compact resting height.
  - Click Step 1's `<summary>`, assert `step1.open === true`; click Step 2's `<summary>`, assert `step2.open === true` and `step1.open === false` in browsers supporting `[name]` exclusive `<details>`.
  - Assert zero `<h1>`–`<h6>` descendants exist inside any `<summary>` element.
- **Browser fallbacks:** Native `<details name="...">` exclusive accordions are Baseline Newly Available (2024). In older engines that ignore `name`, each `<details>` still opens and closes cleanly as an independent disclosure, or a 6-line `toggle` capture listener can close sibling `details[name="ax-derivations"]` items if strict single-open behavior is required.

## Related Guides

- `agentic-experience` (via `npx haii-guidance retrieve "agentic-experience"`) — Parent supervisory AX architecture.
- `conversational-to-deterministic-handoff` (via `npx haii-guidance retrieve "conversational-to-deterministic-handoff"`) — Where derivation trees sit inside Layer-2 execution review.
- `dual-habitat-jargon-quarantine` (via `npx haii-guidance retrieve "dual-habitat-jargon-quarantine"`) — Keeping cryptographic hashes out of non-technical consumer flows while keeping them inspectable on demand.
- `split-stage-3order-companion` (via `npx haii-guidance retrieve "split-stage-3order-companion"`) — Pairing interactive calculators with sticky educational companions.
