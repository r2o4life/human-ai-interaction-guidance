---
id: progressive-comprehension
title: Progressive Comprehension and Instructional Design
discipline: D29
category: progressive-comprehension
kind: discipline
description: Structure complex interfaces around co-located 3-order educational companions, expertise-graduated scaffolding, happy-path payoff checklists, and zero-displacement Choice 2B search windows.
keywords:
  - progressive comprehension
  - instructional design
  - 3-order comprehension
  - split stage 58 42
  - expertise graduated scaffolding
  - happy path payoff
  - halved density hd1 hd6
  - choice 2b floating match window
  - until-found disclosure
triggers:
  - helping novice users understand complex AI or technical interfaces on first exposure
  - keeping resting pages clean while preserving deep guidance and searchability
  - adapting onboarding hints and verbosity as users gain expertise
  - preventing search inputs or filter interactions from pushing page layout downward
provenance:
  - PARADIGM_59
  - PARADIGM_84
  - PARADIGM_99
  - PARADIGM_100
maturity: stable
---

# Progressive Comprehension and Instructional Design

## Overview

Complex tools fail novices when they bury foundational explanations inside distant documentation tabs, and fail experts when they clutter resting screens with permanent tutorial banners. Progressive Comprehension (`D29`) solves both simultaneously by pairing spatial co-location (`58%–60%` subject beside a `40%–42%` sticky companion) with halved resting information density (`>= 50%` reduction via native `<details>`, `[popover]`, and `hidden="until-found"`), expertise-graduated scaffolding, and `0px` inflow layout displacement.

Use this discipline whenever an interface must teach unfamiliar concepts cleanly on first exposure while staying fast, searchable, and uncluttered for returning practitioners.

## Decision Rules

Select the specialized guide that fits the comprehension challenge:

### Rule 1: First-time users cannot decode a complex subject (`split-stage-3order-companion`)

Apply when interactive calculators, configuration tools, or technical items need immediate plain-English explanation without pushing content below the fold. Render a sticky `58%–60%` subject column beside a `40%–42%` educational companion: Tier 1 layperson anatomy open by default, with Tier 2 multi-actor coordination and Tier 3 long-horizon sustainment folded inside native `<details>`.

### Rule 2: Onboarding prose slows down experienced operators (`expertise-graduated-scaffolding`)

Apply when returning users already know the workflow and want compact controls or keyboard fast-tracks. Graduate hint verbosity across expertise stages (`Onboarding -> Guided -> Graduated Compact`) with a reversible fast-track toggle while stripping all internal meta-rubric labels.

### Rule 3: Multi-step workflows obscure the end benefit (`happy-path-value-payoff-disclosure`)

Apply when users see isolated form controls or rows without understanding how the steps combine. Co-locate a 6-step concrete happy-path checklist culminating in an explicit Core Value Payoff inside halved resting density budgets (`HD1..HD6`) and a constant 8-role typographic hierarchy.

### Rule 4: Typing or filtering jumps the page layout (`anchored-floating-match-windows`)

Apply whenever a user focuses a search or prompt field or filters a card grid. Enforce Choice 2B (`DeltaB_inflow = 0px`): keep in-flow `<details>` collapsed at rest, project live matches and `hidden="until-found"` previews into a CSS-anchored top-layer floating window, and lock grid tracks with `repeat(auto-fill, ...)`.

## Implementation Pattern

Combine a split-stage container, native `<details>` disclosures with `interpolate-size: allow-keywords`, and a constant typographic ladder (`h1 > h2 > subtitle > button > h3 > h4 > p >= 14.2px > microtext`) so education scales smoothly without bloating resting viewport slices.

```html
<section class="d29-split-stage" aria-labelledby="d29-subject-title">
  <div class="d29-subject-column">
    <h2 id="d29-subject-title">Interactive Configuration Stage</h2>
    <p class="d29-subtitle">Adjust parameters on the left; plain-English guidance updates beside it.</p>
    <div class="d29-control-group">
      <button type="button" class="d29-action-btn" data-topic="escrow">Inspect Hold Rules</button>
      <button type="button" class="d29-action-btn" data-topic="alerts">Inspect Alert Grouping</button>
    </div>
  </div>

  <aside class="d29-companion-aside" aria-label="Progressive Comprehension Companion">
    <span class="d29-micro-eyebrow">Quick Guide</span>
    <h3>How Hold Rules Work</h3>
    <p id="d29-tier1-summary">
      Changes wait in a temporary holding zone so you can undo mistakes with zero penalty.
    </p>
    <details class="d29-disclosure">
      <summary>Team Coordination Context</summary>
      <p>Shared reviewers see pending holds in one queue before final approval locks them.</p>
    </details>
    <details class="d29-disclosure">
      <summary>Long-Horizon Audit &amp; Maintenance</summary>
      <p>Completed holds archive automatically for 60-day review without manual log cleanup.</p>
    </details>
  </aside>
</section>
```

```css
:root {
  interpolate-size: allow-keywords;
}

.d29-split-stage {
  container-type: inline-size;
  display: grid;
  gap: 1.25rem;
  align-items: start;
}

@media (min-width: 900px) {
  .d29-split-stage {
    grid-template-columns: minmax(0, 58fr) minmax(290px, 42fr);
  }
  .d29-subject-column,
  .d29-companion-aside {
    position: sticky;
    top: 5.25rem;
  }
}

.d29-companion-aside {
  display: grid;
  gap: 0.65rem;
  padding: 1rem;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  background: #f8fafc;
}

.d29-micro-eyebrow {
  font-size: clamp(0.72rem, 0.8vw, 0.8rem);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  text-box: trim-both cap alphabetic;
}

.d29-companion-aside h3 {
  font-size: clamp(1rem, 1.3vw, 1.15rem);
  text-wrap: balance;
  margin: 0;
}

.d29-companion-aside p {
  font-size: clamp(0.9rem, 1vw, 0.96rem);
  line-height: 1.5;
  text-wrap: pretty;
  margin: 0;
}

.d29-disclosure {
  border-top: 1px solid #e2e8f0;
  padding-top: 0.5rem;
}

.d29-disclosure summary {
  cursor: pointer;
  font-weight: 600;
  min-block-size: 36px;
  display: flex;
  align-items: center;
}

.d29-disclosure::details-content {
  block-size: 0;
  overflow: hidden;
  transition: block-size 200ms ease, content-visibility 200ms allow-discrete;
}

.d29-disclosure[open]::details-content {
  block-size: auto;
}

@media (prefers-reduced-motion: reduce) {
  .d29-disclosure::details-content {
    transition: none !important;
  }
}
```

## Guidelines

- **DO** keep Tier-1 plain-English comprehension open by default and fold Tier-2/Tier-3 contexts inside native `<details>` disclosures (`<= 44` words per panel at rest).
- **DO** co-locate educational companions adjacent to the interactive subject (`58%–60%` / `40%–42%`) rather than burying instructions at the bottom of the page.
- **DO** preserve `0px` inflow layout displacement when users search, filter, or switch topics (`Choice 2B` + `Choice 1A`).
- **DON'T** expose internal authoring labels (`Tier 1`, `2nd-Order`, `3rd-Order`, `HD1`, `Choice 2B`, `UI-IR`) in visible end-user interface text.
- **DON'T** apply `overflow: hidden` or `content-visibility: auto` directly on split-stage grid ancestors of `position: sticky` columns, which disables sticky pinning.

## Verification & Fallbacks

1. **Split-Stage Sticky Audit (Playwright):** At `1440x900`, verify `.d29-subject-column` width ratio `<= 60%`, `.d29-companion-aside` computed `position === 'sticky'`, and both columns sit side-by-side (`asideBox.left >= subjectBox.right`).
2. **Resting Density Audit:** Verify `<details class="d29-disclosure">` elements start closed (`open === false`), keeping resting visible prose concise (`>= 50%` lower ink load than flat uncollapsed essays).
3. **Zero Meta-Leakage Check:** Assert rendered innerText contains zero occurrences of `2nd-Order`, `3rd-Order`, `HD1`, `Choice 2B`, or `UI-IR`.

Fallbacks: Browsers without `::details-content` or `interpolate-size: allow-keywords` expand `<details>` instantaneously with full keyboard and screen-reader fidelity. Below `900px` viewport width, the layout stacks linearly into one readable column with zero horizontal overflow.

## Related Guides

- `split-stage-3order-companion` (via `npx haii-guidance retrieve "split-stage-3order-companion"`)
- `expertise-graduated-scaffolding` (via `npx haii-guidance retrieve "expertise-graduated-scaffolding"`)
- `happy-path-value-payoff-disclosure` (via `npx haii-guidance retrieve "happy-path-value-payoff-disclosure"`)
- `anchored-floating-match-windows` (via `npx haii-guidance retrieve "anchored-floating-match-windows"`)
- `dual-habitat-jargon-quarantine` (via `npx haii-guidance retrieve "dual-habitat-jargon-quarantine"`)
