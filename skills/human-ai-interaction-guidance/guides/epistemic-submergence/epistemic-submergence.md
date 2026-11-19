---
id: epistemic-submergence
title: "Content Design & Epistemic Submergence"
discipline: D25
category: epistemic-submergence
kind: discipline
description: "Architectural discipline for separating everyday human surfaces (Habitat A) from cryptographic and infrastructure verification consoles (Habitat B /_observatory) with zero jargon leakage."
keywords:
  - epistemic submergence
  - Habitat A
  - Habitat B
  - observatory
  - jargon quarantine
  - plain English
  - content design
  - substrate submergence
  - North Star copy
triggers:
  - "keeping backend acronyms and hashes off customer-facing UI"
  - "separating end-user value copy from auditor verification dashboards"
  - "writing clear non-technical AI UX labels and lifecycle narration"
provenance:
  - PARADIGM_20
  - PARADIGM_53
  - PARADIGM_90
maturity: stable
---

# Content Design & Epistemic Submergence

## Overview

Epistemic Submergence prevents internal database, cryptographic, and compiler mechanics from leaking onto everyday human interfaces. Partition every experience into two co-compiled habitats: **Habitat A** speaks the user's lived domain language with zero engineering jargon, while **Habitat B** (`/_observatory`) houses full audit logs, policy proofs, and verification hashes for technical reviewers.

## Decision Rules

### Rule 1: Submerge plumbing on Habitat A; preserve truth in Habitat B

Never force patients, shoppers, or frontline operators to read tokens such as `RLS`, `Cedar`, `JWT`, `WORM`, `SHA-256`, `SCIM`, `JSONB`, or `UI-IR` in primary workflows. Translate every engineering guarantee into a concrete everyday promise on Habitat A, and link optionally to Habitat B (`observatory.html`) for cryptographic proof.

### Rule 2: Enforce brevity, active imperatives, and three-act cohesion

Cap Habitat A prose at `<= 18` words per sentence (and `<= 14` words on badges and glance summaries), pair every interactive control with `[Active Verb] + [Object] + [Risk Scope]`, and weave fragmented feature claims into three-act human narratives (Provenance -> Empirical Truth -> Psychological Safety).

### Rule 3: Respect human reading cadence during AI synthesis

Never dump walls of generated text or fire raw 100+ token/sec bursts that jitter layout or overwhelm readers. Throttle progressive text reveals to `250–400 WPM` (`20–25ms` cadence) inside fixed-footprint containers with immediate `Reveal All` and `Stop` controls.

## Implementation Pattern

```html
<!-- Habitat A: Everyday Human Surface (0 leaked engineering acronyms) -->
<section class="habitat-a-card" aria-labelledby="habitat-a-title">
  <h2 id="habitat-a-title">Protected Family Care Plan</h2>
  <p class="north-star-copy">
    Your household records stay private to your family and can be exported anytime.
  </p>
  <div class="habitat-actions">
    <button type="button" id="habitat-save-btn">
      Save Care Plan (Editable Anytime)
    </button>
    <a href="/_observatory" class="observatory-link" data-habitat="B">
      View independent safety log &rarr;
    </a>
  </div>
</section>
```

```css
.habitat-a-card {
  display: grid;
  gap: 0.75rem;
  max-inline-size: 68ch;
  padding: 1.25rem;
  border: 1px solid CanvasText;
  border-radius: 12px;
}

.north-star-copy {
  margin: 0;
  line-height: 1.6;
  text-wrap: pretty;
}

.habitat-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem 1rem;
}

.habitat-actions button,
.observatory-link {
  display: inline-flex;
  align-items: center;
  min-block-size: 44px;
}
```

```js
// Build-time or CI gate stripping hidden/quarantined blocks before auditing Habitat A text.
export function extractVisibleHabitatAText(rootEl) {
  const clone = rootEl.cloneNode(true);
  clone.querySelectorAll('script, style, svg, template, [hidden], [data-meta-quarantined="true"]')
    .forEach((node) => node.remove());
  return (clone.textContent || '').replace(/\s+/g, ' ').trim();
}
```

## Guidelines

- **DO** co-compile Habitat A promises and Habitat B proofs from the same source contract so plain-English guarantees and audit evidence never drift apart.
- **DO** strip hidden, script, SVG, and `[data-meta-quarantined="true"]` subtrees before running Habitat A jargon and sentence-length audits.
- **DO** anchor every technical benefit to a tangible outcome: who owns the data, what stays reversible, and what stops errors.
- **DON'T** leak internal framework or compiler meta-language (`UI-IR`, `@steer:`, `Choice 1A`, `3rd-Order`) into visible Habitat A labels.
- **DON'T** replace missing domain substance with marketing clichés ("seamless", "magic", "revolutionary", "next-gen").
- **DON'T** force users into Habitat B (`/observatory.html`) just to complete everyday tasks or undo a mistake.

## Verification & Fallbacks

- **DOM & Playwright assertions:**
  - Extract visible text from all Habitat A views (`extractVisibleHabitatAText(document.body)`) and assert `0` banned plumbing tokens (`RLS`, `Cedar`, `SCIM`, `JWT`, `WORM`, `JSONB`, `SHA-256`, `OSCAL`, `SPIFFE`) and `maxWordsPerSentence <= 18`.
  - Verify the Habitat B link (`a[href="/_observatory"]`) resolves cleanly (HTTP `200`) when institutional audit access is enabled, or is cleanly gated in non-auditor builds without dead `href="#"` stubs.
- **Browser fallbacks:** `text-wrap: pretty` degrades silently in older browsers while `max-inline-size: 68ch` preserves comfortable reading measure everywhere.

## Related Guides

- `dual-habitat-jargon-quarantine` (via `npx haii-guidance retrieve "dual-habitat-jargon-quarantine"`) — Homograph-safe jargon detection and Habitat A/B transduction table.
- `anti-cliche-lexical-hygiene` (via `npx haii-guidance retrieve "anti-cliche-lexical-hygiene"`) — Sentence ceilings, cliché bans, and Jargon De-Escalation Index.
- `three-act-value-storytelling` (via `npx haii-guidance retrieve "three-act-value-storytelling"`) — Merging scattered badges into three-act human narratives.
- `imperative-affordance-grammar` (via `npx haii-guidance retrieve "imperative-affordance-grammar"`) — Active verb + object + risk scope control labeling.
- `micro-atomic-lifecycle-narration` (via `npx haii-guidance retrieve "micro-atomic-lifecycle-narration"`) — Narrating CRUD and session restoration meaningfully.
- `reading-cadence-ai-streaming` (via `npx haii-guidance retrieve "reading-cadence-ai-streaming"`) — Calibrating AI token reveal cadence (`250–400 WPM`).
- `agentic-experience` (via `npx haii-guidance retrieve "agentic-experience"`) — Pairing plain-English Habitat A clarity with supervisory AI controls.
