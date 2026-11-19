---
id: three-act-value-storytelling
title: "Three-Act Value Storytelling"
discipline: D25
category: epistemic-submergence
kind: use-case
description: "Replace fragmented floating claim badges with cohesive three-act value stories moving from Act I Craft & Provenance to Act II Empirical Truth and Act III Psychological Safety."
keywords:
  - three-act storytelling
  - CVSM
  - claim badges
  - cognitive density fracture
  - provenance
  - empirical truth
  - psychological safety
  - narrative arc
triggers:
  - "eliminating cluttered pill clouds or floating claim chips on cards"
  - "structuring product, model, or action cards to build human trust"
  - "connecting verifiable metrics directly to safety guarantees"
provenance:
  - PARADIGM_21
  - PARADIGM_17
maturity: stable
---

# Three-Act Value Storytelling

## Overview

Scattering isolated claim pills across a screen—`[0% Fee]`, `[1-Tap Hold]`, `[Verified]`, `[Local]`—forces the user's working memory to assemble a fragmented puzzle across five or more visual fixations. Replace floating badge clutter with a disciplined three-act value narrative on each card: **Craft & Provenance**, **Empirical Truth**, and **Psychological Safety**.

## Decision Rules

### Rule 1: Ban unanchored floating claim badges

Never stack three or more disconnected marketing pills on a card or hero strip without causal prose connecting them. Every quantitative or safety claim must sit inside a unified narrative flow paired with its proof anchor.

### Rule 2: Follow the three-act causal arc inside `<= 45` words

Structure every primary card narrative across three sequential beats:
- **Act I (Craft & Provenance):** Who created or verified the item and its real-world context.
- **Act II (Empirical Truth):** Transparent pricing, measured outcome, or exact operating metric with units.
- **Act III (Psychological Safety):** Clear reversibility, cancel window, or zero-penalty guarantee.

### Rule 3: Match narrative density to scan horizon

Keep Tier-1 glance chips at `<= 14` words (`<= 300ms` scan) and Tier-2 three-act card narratives at `<= 45` words (`< 3s` scan), linking deeper numerical formulas to an expandable disclosure or companion rail.

## Implementation Pattern

```html
<article class="three-act-card" aria-labelledby="card-story-title">
  <header class="card-story-header">
    <h2 id="card-story-title">Fresh Pasture Batch · Cedar Valley Kitchen</h2>
    <p class="story-act-kicker">Prepared locally 6 hours ago from audited pasture farms.</p>
  </header>

  <ol class="three-act-arc">
    <li>
      <span class="act-label">Provenance</span>
      <span>Small-batch kitchen run #418 verified before sealing.</span>
    </li>
    <li>
      <span class="act-label">Direct Value</span>
      <span>$38.00 direct price — zero broker markup added.</span>
    </li>
    <li>
      <span class="act-label">Safety Guarantee</span>
      <span>15-minute flexible hold; cancel in one tap at zero fee.</span>
    </li>
  </ol>

  <footer class="card-story-actions">
    <button type="button">Reserve Batch #418 (1-Tap Reversible)</button>
  </footer>
</article>
```

```css
.three-act-card {
  display: grid;
  gap: 0.875rem;
  max-inline-size: 46ch;
  padding: 1.25rem;
  border: 1px solid CanvasText;
  border-radius: 12px;
}

.story-act-kicker {
  margin: 0.25rem 0 0;
  font-size: 0.9375rem;
}

.three-act-arc {
  display: grid;
  gap: 0.5rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.three-act-arc li {
  display: grid;
  grid-template-columns: 9.5rem 1fr;
  gap: 0.5rem;
  padding-block: 0.375rem;
  border-top: 1px solid color-mix(in srgb, CanvasText 18%, transparent);
  font-variant-numeric: tabular-nums;
}

.act-label {
  font-weight: 700;
  font-size: 0.8125rem;
}

.card-story-actions button {
  min-block-size: 44px;
  padding: 0.5rem 1rem;
  font-weight: 600;
  cursor: pointer;
}

@media (max-width: 480px) {
  .three-act-arc li {
    grid-template-columns: 1fr;
    gap: 0.125rem;
  }
}
```

## Guidelines

- **DO** bind Act II metrics to verifiable proofs (lot IDs, direct pricing arithmetic, measurable latency) rather than vague adjectives.
- **DO** finish every transactional card on Act III (Psychological Safety) right next to the primary CTA so risk anxiety is resolved before the click.
- **DO** keep card word budgets tight (`<= 45` words across the three acts) so the entire arc scans in one pass.
- **DON'T** render orphaned floating pill rows (`[Verified] [0% Fee] [Fast] [Safe]`) disconnected from human explanation.
- **DON'T** leak internal narrative labels like "Act I: Provenance" or "CVSM Tier 2" into customer-facing headings; use natural domain cues like `Provenance`, `Direct Value`, and `Safety Guarantee`.
- **DON'T** bury cancellation or refund safety terms inside fine-print footer links when the decision happens on the card.

## Verification & Fallbacks

- **DOM & Playwright assertions:**
  - Count detached status badges inside `.three-act-card` and verify each card holds `<= 2` status chips while expressing all three narrative beats (`Provenance`, `Direct Value` / quantitative truth, `Safety Guarantee`).
  - Assert total narrative copy inside `.three-act-arc` stays `<= 45` words and `maxWordsPerSentence <= 18`.
  - Check responsive layout at `390px` width to ensure `.three-act-arc li` stacks into a single column with zero text clipping or horizontal overflow.
- **Browser fallbacks:** `color-mix(in srgb, ...)` can be paired with a fallback `border-top: 1px solid currentColor` or static neutral rule prior to the `color-mix` line for legacy CSS engines.

## Related Guides

- `epistemic-submergence` (via `npx haii-guidance retrieve "epistemic-submergence"`) — Parent Content Design discipline.
- `anti-cliche-lexical-hygiene` (via `npx haii-guidance retrieve "anti-cliche-lexical-hygiene"`) — Sentence length and cliché enforcement inside each act.
- `imperative-affordance-grammar` (via `npx haii-guidance retrieve "imperative-affordance-grammar"`) — Structuring the card's final Act III CTA button.
- `happy-path-value-payoff-disclosure` (via `npx haii-guidance retrieve "happy-path-value-payoff-disclosure"`) — Connecting card narratives to multi-step outcome payoffs.
