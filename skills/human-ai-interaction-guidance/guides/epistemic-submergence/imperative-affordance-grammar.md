---
id: imperative-affordance-grammar
title: "Imperative Affordance Grammar for Action Controls"
discipline: D25
category: epistemic-submergence
kind: use-case
description: "Write unambiguous buttons and action controls following the [Active Imperative Verb] + [Direct Object] + [Risk/Reversibility Scope] syntax, eliminating vague Submit or OK labels."
keywords:
  - imperative affordance
  - button labels
  - risk scope
  - reversibility scope
  - microcopy
  - Submit anti-pattern
  - verb-first syntax
  - accessible names
triggers:
  - "writing labels for AI action buttons, confirmations, or destructive controls"
  - "replacing vague Submit, Confirm, Proceed, or OK buttons"
  - "communicating reversibility and cost directly inside interactive controls"
provenance:
  - PARADIGM_53
maturity: stable
---

# Imperative Affordance Grammar for Action Controls

## Overview

Generic button labels like `Submit`, `OK`, `Execute`, or `Confirm` force operators to guess what entity will change and whether the change can be undone. Format every mutating or supervisory control using **`[Active Imperative Verb] + [Direct Object] + [Risk / Reversibility Scope]`** so users know the exact consequence before clicking.

## Decision Rules

### Rule 1: Construct every action label from three explicit parts

Follow the exact syntactic structure on buttons, menu commands, and modal triggers:
- **Active Imperative Verb:** `Stage`, `Apply`, `Hold`, `Pull`, `Pause`, `Decommission`, `Restore`, `Send` (never passive voice or bare `Submit` / `Click here`).
- **Direct Object:** Concrete domain entity (`Batch #418`, `Feeder Cap`, `Draft Reply`, `Care Plan`).
- **Risk / Reversibility Scope:** Explicit cost or recovery envelope in a compact subordinate cue (`1-Tap Undo`, `0 Penalty`, `Reversible 15m`, `Irreversible` or `Permanent`).

### Rule 2: Differentiate low-risk staging from irreversible commitment

Keep reversible staging labels calm and reassuring (`Stage Schedule Change (Reversible 15m)`), while marking permanent actions unambiguously (`Permanently Delete Draft (Cannot Undo)`). Keep button copy concise (`<= 8` words) so controls never wrap awkwardly or overflow `390px` containers.

### Rule 3: Preserve accessible-name congruence

Ensure the visible button text matches the accessible name announced by screen readers (`textContent`), rather than overriding an unclear icon or generic `Go` label solely with `aria-label`.

## Implementation Pattern

```html
<section class="affordance-bar" aria-labelledby="affordance-heading">
  <h2 id="affordance-heading">Batch Dispatch Controls</h2>

  <div class="affordance-row">
    <button type="button" class="btn-safe-stage">
      <span>Stage Schedule Draft</span>
      <span class="scope-tag">(Reversible 15m)</span>
    </button>

    <button type="button" class="btn-rollback">
      <span>Pull Safety Switch</span>
      <span class="scope-tag">(1-Tap Undo · 0 Fee)</span>
    </button>

    <button type="button" class="btn-destructive" command="show-modal" commandfor="purge-confirm-dialog">
      <span>Decommission Inactive Unit</span>
      <span class="scope-tag">(Releases Capacity)</span>
    </button>
  </div>
</section>

<dialog id="purge-confirm-dialog" closedby="any" aria-labelledby="purge-title">
  <h2 id="purge-title">Decommission Inactive Unit?</h2>
  <p>This frees 45 kW back to the shared pool and writes an immutable log entry.</p>
  <form method="dialog" class="dialog-actions">
    <button value="cancel" autofocus>Keep Unit Active (No Change)</button>
    <button value="decommission">Confirm Decommission (Logs Tombstone)</button>
  </form>
</dialog>
```

```css
.affordance-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.affordance-row button,
.dialog-actions button {
  display: inline-flex;
  align-items: baseline;
  gap: 0.375rem;
  min-block-size: 44px;
  max-inline-size: 100%;
  padding: 0.5rem 0.875rem;
  font-weight: 600;
  cursor: pointer;
}

.scope-tag {
  font-weight: 400;
  font-size: 0.8125em;
  opacity: 0.85;
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
const GENERIC_BANNED_LABELS = /^(?:ok|submit|confirm|proceed|execute|go|apply|save|delete|yes|no|click here)$/i;

export function lintButtonAffordances(root = document) {
  const violations = [];
  root.querySelectorAll('button, [role="button"], input[type="submit"]').forEach((el) => {
    const label = (el.textContent || el.value || el.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim();
    if (!label || GENERIC_BANNED_LABELS.test(label) || label.split(/\s+/).length < 2) {
      violations.push({ element: el.tagName, id: el.id || null, label });
    }
  });
  return { passed: violations.length === 0, violations };
}
```

## Guidelines

- **DO** start every action label with a clear active verb and name the exact affected entity.
- **DO** include the risk or reversibility boundary directly inside the control or its immediate `<dialog>` pair (`(Reversible 15m)`, `(0 Fee)`, `(Permanent)`).
- **DO** put `autofocus` on the safe retention option (`Keep Unit Active`) in destructive dialogs so accidental `Enter` presses never destroy state.
- **DON'T** ship standalone `Submit`, `OK`, `Yes`, `Proceed`, or `Delete` buttons without object and risk context.
- **DON'T** stuff full multi-sentence explanations (`> 10` words) inside a button; keep buttons concise and place extended rules above the button row.
- **DON'T** override a visible `Save` button with a different hidden `aria-label` (WCAG 2.5.3 Label in Name).

## Verification & Fallbacks

- **DOM & Playwright assertions:**
  - Run `lintButtonAffordances(document)` on active views and assert `violations.length === 0`.
  - Verify every button inside `.affordance-row` renders both verb+object and risk scope visibly without ellipsis clipping at `390px` viewport width and passes `min-block-size >= 44px`.
  - Open `#purge-confirm-dialog` and assert `document.activeElement.value === 'cancel'`.
- **Browser fallbacks:** Native `<button>` controls with nested `<span>` text render one unified accessible name across all browsers and assistive technologies. Add a `showModal()` click fallback when `!('commandForElement' in HTMLButtonElement.prototype)`.

## Related Guides

- `epistemic-submergence` (via `npx haii-guidance retrieve "epistemic-submergence"`) — Parent content discipline.
- `anti-cliche-lexical-hygiene` (via `npx haii-guidance retrieve "anti-cliche-lexical-hygiene"`) — Word-count discipline and active voice across microcopy.
- `micro-atomic-lifecycle-narration` (via `npx haii-guidance retrieve "micro-atomic-lifecycle-narration"`) — Naming CRUD lifecycle transitions behind imperative controls.
- `time-locked-autonomy-escrow-gate` (via `npx haii-guidance retrieve "time-locked-autonomy-escrow-gate"`) — Backing reversible scope labels with real escrow timers.
