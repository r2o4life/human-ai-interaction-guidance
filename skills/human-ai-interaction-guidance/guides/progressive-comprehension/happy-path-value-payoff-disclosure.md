---
id: happy-path-value-payoff-disclosure
title: Happy-Path Value Payoff Disclosure & Halved Density Budgets
discipline: D29
category: progressive-comprehension
kind: use-case
description: Co-locate concrete 6-step happy-path outcome payoffs beside interactive workflows inside halved resting density budgets (HD1-HD6), 8-role typographic hierarchy, and soft-edge previews.
keywords:
  - happy path payoff
  - halved resting density hd1 hd6
  - 8-role typographic hierarchy
  - core value payoff
  - soft edge mask preview
  - progressive disclosure details
  - 44 word panel cap
  - meta text-scale
triggers:
  - reducing dense multi-step pages by 50% or more without losing functional capability
  - showing users the concrete end payoff alongside a multi-step calculator or planner
  - enforcing a strict monotonic 8-role typographic hierarchy across every section
  - previewing long comparison tables cleanly with soft-edge fade and expandable overflow
provenance:
  - PARADIGM_99
  - PARADIGM_100
maturity: stable
---

# Happy-Path Value Payoff Disclosure & Halved Density Budgets

## Overview

Showing raw configuration inputs without the human payoff makes multi-step tools feel tedious, while packing every instruction, comparison row, and footnote onto the screen at rest creates exhausting ink walls. Co-locate a concrete **6-Step Happy-Path Companion** ending in an explicit **Core Value Payoff** (`58% / 42%` split stage) while cutting resting page ink and word load by `>= 50%` (`HD1..HD6`) under a constant 8-role typographic scale.

## Decision Rules

### Rule 1: Co-locate a 6-step Happy-Path Companion ending in a concrete payoff

Inside interactive workflows (calculators, planners, account onboarding), render an adjacent `<aside class="happy-path-companion-card">` (`58% / 42%` at `@container (min-width: 680px)`) with a numbered `<ol>` of 6 concise steps culminating in Step 6 (`data-happy-path-payoff="true"`, pill `Core Value Payoff`) describing the real-world human reward. Highlight completed steps via `data-*` state attributes with `0px` box-size change.

### Rule 2: Halve resting text ink density (`HD1` / `HD4`)

Fold secondary walkthrough details, overflow cards (`4..N`), and long methodology notes into native `<details>` disclosures capped at `<= 44` words per panel. For large comparison tables, show only the top 3 resting rows with a subtle bottom `mask-image` soft-edge fade and an explicit toggle (`Show all N rows`) to reveal the rest without reflowing unrelated bands.

### Rule 3: Lock the 8-Role Constant Typographic Hierarchy (`HD3`)

Enforce strictly descending sizes across every section (`h1 > h2 > subtitle > button > h3 > h4 > p >= 14.2px (line-height >= 1.48) > microtext`), include `<meta name="text-scale" content="scale">`, keep fluid `clamp()` ranges within `max <= 2.5 * min` (WCAG 1.4.4), apply `text-wrap: balance` only on unboxed headings, `text-wrap: pretty` on paragraphs, and `text-box: trim-both cap alphabetic` on microtext badges.

## Implementation Pattern

```html
<div class="hp-split-stage">
  <section class="hp-tool-pane" aria-labelledby="hp-tool-h2">
    <h2 id="hp-tool-h2" class="hd-h2">Plan Your Coverage Window</h2>
    <p class="hd-subtitle">Pick dates once; your calendar stays accurate all season.</p>

    <button type="button" id="btn-save-plan-step" class="hd-btn">
      Add Check-In Date to Plan
    </button>

    <!-- Soft-edge 3-row preview table folding rows 4..N -->
    <div class="hp-table-preview" data-expanded="false">
      <table>
        <caption>Upcoming schedule milestones</caption>
        <thead>
          <tr><th scope="col">Date</th><th scope="col">Session</th></tr>
        </thead>
        <tbody>
          <tr><td>Jun 17</td><td>Opening Orientation</td></tr>
          <tr><td>Jul 04</td><td>Mid-Season Audit</td></tr>
          <tr><td>Aug 19</td><td>Wrap-Up Review</td></tr>
          <tr class="hp-overflow-row"><td>Sep 02</td><td>Archive Export</td></tr>
        </tbody>
      </table>
    </div>
    <button type="button" id="btn-toggle-rows" class="hd-btn hd-btn--ghost" aria-expanded="false">
      Show all 4 milestones
    </button>
  </section>

  <aside class="happy-path-companion-card" data-step-saved="false" aria-label="Ideal Path">
    <span class="hd-micro">Ideal Path · Schedule Plan</span>
    <h3 class="hd-h3">From First Click to Stress-Free Readiness</h3>
    <ol class="happy-path-step-list">
      <li class="happy-path-step-item" data-step="1">
        <strong>1. Save a Target Date</strong>
        <span>Tap Add Check-In Date to start a private plan on this device.</span>
      </li>
      <li class="happy-path-step-item" data-step="2">
        <strong>2. Adjust Anytime</strong>
        <span>Swap or remove dates freely with zero account lock-in.</span>
      </li>
      <li class="happy-path-step-item" data-step="3">
        <strong>3. Export One Calendar File</strong>
        <span>Download a standard schedule file compatible with any calendar app.</span>
      </li>
      <li class="happy-path-step-item" data-step="4">
        <strong>4. Import in One Tap</strong>
        <span>Open the file to sync reminders into your phone or desktop calendar.</span>
      </li>
      <li class="happy-path-step-item" data-step="5">
        <strong>5. Receive Gentle Alerts</strong>
        <span>Get timely notifications ahead of key deadlines automatically.</span>
      </li>
      <li class="happy-path-step-item" data-happy-path-payoff="true" data-step="6">
        <strong>6. Stress-Free Participation <span class="hp-payoff-pill">Core Value Payoff</span></strong>
        <span>Show up prepared and on time all season without hunting through emails.</span>
      </li>
    </ol>
  </aside>
</div>
```

```css
/* Constant 8-Role Hierarchy (HD3): h1 > h2 > subtitle > button > h3 > h4 > p >= 14.2px > micro */
.hd-h2 { font-size: clamp(1.5rem, 2.2vw, 2rem); line-height: 1.22; text-wrap: balance; margin: 0; }
.hd-subtitle { font-size: clamp(1.09rem, 1.3vw, 1.28rem); line-height: 1.42; text-wrap: pretty; margin: 0; }
.hd-btn { font-size: clamp(0.98rem, 1.05vw, 1.06rem); line-height: 1.38; min-block-size: 44px; padding: 0.5rem 1rem; border-radius: 8px; cursor: pointer; }
.hd-h3 { font-size: clamp(0.95rem, 1.02vw, 1.02rem); line-height: 1.42; text-wrap: balance; margin: 0; }
p, li span { font-size: clamp(0.89rem, 0.96vw, 0.96rem); line-height: 1.5; text-wrap: pretty; }
.hd-micro { font-size: clamp(0.72rem, 0.78vw, 0.8rem); line-height: 1.35; text-box: trim-both cap alphabetic; text-transform: uppercase; font-weight: 700; }

.hp-split-stage {
  container-type: inline-size;
  display: grid;
  gap: 1.25rem;
  align-items: start;
}

@container (min-width: 680px) {
  .hp-split-stage {
    grid-template-columns: minmax(0, 58fr) minmax(280px, 42fr);
  }
}

@media (min-width: 900px) {
  .hp-split-stage {
    grid-template-columns: minmax(0, 58fr) minmax(280px, 42fr);
  }
}

.hp-table-preview[data-expanded="false"] .hp-overflow-row {
  display: none;
}

.hp-table-preview[data-expanded="false"] {
  -webkit-mask-image: linear-gradient(180deg, #000 72%, transparent 100%);
  mask-image: linear-gradient(180deg, #000 72%, transparent 100%);
}

.happy-path-companion-card {
  display: grid;
  gap: 0.65rem;
  padding: 1rem;
  border-radius: 12px;
  border: 1px solid #cbd5e1;
  background: #f8fafc;
}

.happy-path-step-list {
  display: grid;
  gap: 0.5rem;
  list-style: none;
  margin: 0;
  padding: 0;
}

.happy-path-step-item {
  display: grid;
  gap: 0.15rem;
  padding: 0.55rem 0.7rem;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
}

.happy-path-step-item[data-happy-path-payoff="true"] {
  border-color: #0f766e;
  background: #ecfdf5;
}

/* Live progress cue with zero geometry shift */
.happy-path-companion-card[data-step-saved="true"] .happy-path-step-item[data-step="1"] {
  border-color: #0f766e;
  box-shadow: inset 3px 0 0 #0f766e;
}

.hp-payoff-pill {
  display: inline-block;
  margin-inline-start: 0.35rem;
  padding: 0.1rem 0.45rem;
  border-radius: 999px;
  font-size: 0.68rem;
  background: #0f766e;
  color: #ffffff;
}
```

```javascript
document.getElementById('btn-save-plan-step')?.addEventListener('click', () => {
  document.querySelector('.happy-path-companion-card')?.setAttribute('data-step-saved', 'true');
});

const toggleRowsBtn = document.getElementById('btn-toggle-rows');
const previewBox = document.querySelector('.hp-table-preview');
toggleRowsBtn?.addEventListener('click', () => {
  const expanded = previewBox.getAttribute('data-expanded') === 'true';
  previewBox.setAttribute('data-expanded', String(!expanded));
  toggleRowsBtn.setAttribute('aria-expanded', String(!expanded));
  toggleRowsBtn.textContent = !expanded ? 'Show top 3 milestones' : 'Show all 4 milestones';
});
```

## Guidelines

- **DO** include `<meta name="text-scale" content="scale">` in `<head>` and avoid overriding root `html` font-size in pixels so OS text scaling works cleanly.
- **DO** keep Step 6 (`data-happy-path-payoff="true"`) phrased as a tangible human benefit ("Show up relaxed and prepared"), not an internal feature metric.
- **DO** cap resting `<details>` explanation panels at `<= 44` words each and soft-fade truncated comparison previews via `mask-image`.
- **DON'T** break monotonic typographic descent (`h2 > subtitle > button > h3 > p >= 14.2px > micro`) inside any section.
- **DON'T** animate step completion by changing borders from `1px` to `4px` or altering padding, which shifts sibling items; use `box-shadow: inset` or color updates instead (`0px` displacement).

## Verification & Fallbacks

1. **Monotonic Font Scale Check (Playwright):** Measure `parseFloat(getComputedStyle(el).fontSize)` across `.hd-h2`, `.hd-subtitle`, `.hd-btn`, `.hd-h3`, `p`, and `.hd-micro` and assert strictly non-increasing values with `p >= 14.2px`.
2. **Payoff & Zero-Shift Check:** Verify `[data-happy-path-payoff="true"]` exists inside `.happy-path-companion-card`, click `#btn-save-plan-step`, and assert step list `height` changes by `0px`.
3. **Resting Density Check:** Assert overflow table rows start hidden (`data-expanded="false"`) and visible resting word count stays compact.

Fallbacks: Browsers without `text-box: trim-both cap alphabetic` or `mask-image` ignore those properties gracefully while keeping full semantic table rows, clean padding, and clear expansion buttons intact.

## Related Guides

- `progressive-comprehension` (via `npx haii-guidance retrieve "progressive-comprehension"`)
- `split-stage-3order-companion` (via `npx haii-guidance retrieve "split-stage-3order-companion"`)
- `fitts-moat-and-hick-hyman-budgets` (via `npx haii-guidance retrieve "fitts-moat-and-hick-hyman-budgets"`)
- `three-act-value-storytelling` (via `npx haii-guidance retrieve "three-act-value-storytelling"`)
