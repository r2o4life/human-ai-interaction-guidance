---
id: anti-cliche-lexical-hygiene
title: "Anti-Cliche Lexical Hygiene & Sentence Ceilings"
discipline: D25
category: epistemic-submergence
kind: use-case
description: "Eliminate generic AI/SaaS marketing fluff, enforce <=14-18 word sentence ceilings, cap Jargon De-Escalation Index <=0.05, and expand necessary domain acronyms on first visual scan."
keywords:
  - anti-cliche
  - lexical hygiene
  - jargon de-escalation index
  - sentence length
  - acronym expansion
  - plain language
  - microcopy bounds
  - zero fluff
triggers:
  - "auditing AI-generated UI copy for generic SaaS buzzwords"
  - "enforcing readable word ceilings on buttons, cards, and headings"
  - "handling unavoidable industry acronyms cleanly on first scan"
provenance:
  - PARADIGM_53
  - PARADIGM_17
maturity: stable
---

# Anti-Cliche Lexical Hygiene & Sentence Ceilings

## Overview

AI-generated interfaces routinely pad empty substance with hollow marketing adjectives ("seamless", "magic", "revolutionary", "supercharge") and sprawling multi-clause sentences. Enforce crisp lexical hygiene: zero banned clichés, a `<= 14–18` word ceiling per visible sentence, and a Jargon De-Escalation Index `J_index <= 0.05` with immediate first-scan expansion of any mandatory domain acronym.

## Decision Rules

### Rule 1: Ban hollow AI/SaaS clichés and placeholder strings

Reject visible copy containing empty marketing fluff (`seamless`, `delightful`, `supercharge`, `effortless`, `magic`, `game-changer`, `revolutionary`, `frictionless`, `paradigm-shifting`, `next-gen`, `synergy`, `best-in-class`) or unfinished placeholder strings (such as dummy Latin text or "coming soon" stubs). Replace every adjective with a measurable fact, rule, or user benefit.

### Rule 2: Enforce `<= 14` word microcopy and `<= 18` word prose ceilings

Cap tier-1 glance badges, card summaries, and action explanations at `<= 14` words (`<= 300ms` saccadic scan). Cap standard Habitat A explanatory sentences at `<= 18` words (`maxWordsPerSentence <= 18`). Split compound sentences with periods rather than nested semicolons.

### Rule 3: Keep Jargon De-Escalation Index `J_index <= 0.05` with first-scan expansion

Measure `J_index = unexpandedTechnicalAcronyms / totalVisibleWords`. Whenever a regulated domain acronym is genuinely required (for example `NERC`, `HIPAA`, `FDA`, `OTP`), spell it out in plain English on first visual appearance inside the active card or `<abbr>` pairing (for example `One-Time Passcode (OTP)`), never hidden behind a hover-only tooltip.

## Implementation Pattern

```html
<article class="hygiene-card" aria-labelledby="hygiene-title">
  <h2 id="hygiene-title">Verified Prescription Refill Schedule</h2>
  <p class="hygiene-body">
    A licensed pharmacist checks each refill request before shipment.
    Hold any scheduled delivery with one tap at zero fee.
  </p>
  <p class="hygiene-acronym-note">
    <abbr title="Protected Health Information">Protected Health Information (PHI)</abbr> stays locked to your clinic.
  </p>
</article>
```

```js
const BANNED_FLUFF_PATTERNS = [
  /\b(?:seamless|delightful|supercharge|effortless|magic|game-changer|game-changing|revolutionary|frictionless|paradigm-shifting|next-gen|next-generation|synergy|best-in-class|industry-leading|coming soon|placeholder)\b/gi
];

export function auditLexicalHygiene(visibleText, { maxWordsPerSentence = 18, maxJIndex = 0.05 } = {}) {
  const clean = String(visibleText || '').replace(/\s+/g, ' ').trim();
  const sentences = clean.split(/[.!?]+/).map((s) => s.trim()).filter(Boolean);
  const words = clean.split(/\s+/).filter(Boolean);

  const clicheHits = [];
  for (const re of BANNED_FLUFF_PATTERNS) {
    const matches = clean.match(re);
    if (matches) clicheHits.push(...matches.map((m) => m.toLowerCase()));
  }

  const longSentences = sentences
    .map((sentence) => ({ sentence, wordCount: sentence.split(/\s+/).filter(Boolean).length }))
    .filter((entry) => entry.wordCount > maxWordsPerSentence);

  // Detect uppercase 2-6 char acronyms lacking adjacent "(ACRONYM)" first-scan expansion.
  const acronyms = clean.match(/\b[A-Z]{2,6}\b/g) || [];
  const unexpandedAcronyms = acronyms.filter((acr) => !new RegExp(`\\(${acr}\\)`).test(clean));
  const jIndex = words.length > 0 ? unexpandedAcronyms.length / words.length : 0;

  return {
    passed: clicheHits.length === 0 && longSentences.length === 0 && jIndex <= maxJIndex,
    clicheHits: [...new Set(clicheHits)],
    longSentences,
    jIndex: Number(jIndex.toFixed(4)),
    unexpandedAcronyms: [...new Set(unexpandedAcronyms)]
  };
}
```

## Guidelines

- **DO** replace generic claims ("Save money with frictionless AI") with concrete mechanisms ("Cut peak utility surcharges by shifting 200 kW automatically").
- **DO** place full acronym expansions inline on first visual scan (`Protected Health Information (PHI)`) so mobile, touch, and screen-magnifier users read them immediately.
- **DO** use `text-wrap: balance` on headings and `text-wrap: pretty` on short prose blocks to preserve even typographic cadence.
- **DON'T** hide acronym definitions exclusively inside `title="..."` attributes or hover-only tooltips, which fail touch and keyboard-only users.
- **DON'T** string three clauses into a 28-word sentence just to cram product claims into a card subtitle.
- **DON'T** leave scaffolding placeholders (`Coming soon`, `[insert value]`, unfinished stubs) anywhere in shipped copy.

## Verification & Fallbacks

- **DOM & Playwright assertions:**
  - Run `auditLexicalHygiene(visibleText)` across rendered Habitat A copy and assert `clicheHits.length === 0`, `longSentences.length === 0`, and `jIndex <= 0.05`.
  - Verify glance badges and summary pills stay `<= 14` words.
  - Confirm every `<abbr>` or uppercase domain acronym has a visible parenthetical expansion in the same section.
- **Browser fallbacks:** Inline parenthetical expansions require no JavaScript or CSS popover support and work uniformly across desktop, mobile, print, and screen readers.

## Related Guides

- `epistemic-submergence` (via `npx haii-guidance retrieve "epistemic-submergence"`) — Overall Habitat A copy discipline.
- `dual-habitat-jargon-quarantine` (via `npx haii-guidance retrieve "dual-habitat-jargon-quarantine"`) — Detecting submerged backend tokens safely.
- `three-act-value-storytelling` (via `npx haii-guidance retrieve "three-act-value-storytelling"`) — Packing rich meaning into `<= 45`-word 3-act narratives.
- `imperative-affordance-grammar` (via `npx haii-guidance retrieve "imperative-affordance-grammar"`) — Keeping interactive button labels crisp and active.
