---
id: anchored-floating-match-windows
title: Anchored Floating Match Windows (Choice 2B) & Hidden-Until-Found Search
discipline: D29
category: progressive-comprehension
kind: use-case
description: Preserve zero normal-flow displacement (DeltaB_inflow = 0px) by keeping in-flow details closed during typing and projecting live search matches and hidden="until-found" previews into CSS-anchored top-layer floating match windows.
keywords:
  - choice 2b floating match window
  - css anchor positioning
  - position-area position-try-fallbacks
  - zero inflow displacement
  - hidden until-found beforematch
  - popover manual search results
  - auto-fill grid track conservation
  - align-items start
triggers:
  - preventing search inputs or focus suggestions from pushing page content downward
  - projecting live search matches next to an active search input in the top layer
  - making collapsed card specs and hidden content searchable without auto-opening accordions
  - stopping single-result grid filters from stretching cards across the entire row
provenance:
  - PARADIGM_96
  - PARADIGM_100
maturity: stable
---

# Anchored Floating Match Windows (Choice 2B) & Hidden-Until-Found Search

## Overview

When typing into a search box auto-expands in-flow `<details>` drawers or reveals normal-flow helper bars (`display: none -> flex`), content below shifts downward (`DeltaB_inflow > 0px`), disorienting the user right at the focal point. Under **Choice 2B**, in-flow disclosures remain closed while typing (`DeltaB_inflow = 0px`), live matches and collapsed `[hidden="until-found"]` snippets project into a **CSS-Anchored Top-Layer Floating Match Window** directly below the search input, and card grids preserve fixed column tracks.

## Decision Rules

### Rule 1: Keep input envelopes and in-flow disclosures constant (`DeltaB_inflow = 0px`)

Maintain identical block padding on search wrappers across rest, `:focus`, and `:not(:placeholder-shown)`. Never auto-open in-flow `<details>` accordions or insert normal-flow suggestion banners during search input.

### Rule 2: Project live matches into a CSS-anchored top-layer `popover="manual"` window

Render live search results, quick-browse chips, and hidden spec previews inside `<div id="floating-match-window" popover="manual">` tethered directly below the active `<input type="search">` via `anchor-name`, `position-anchor`, `position-area: block-end span-inline-end`, and `position-try-fallbacks: flip-block, flip-inline`. Use `popover="manual"` (not `auto`) so typing never loses focus and external keyboard/outside-click handlers stay clean.

### Rule 3: Preserve grid tracks during filtering (`repeat(auto-fill)` + `align-items: start`)

Use `grid-template-columns: repeat(auto-fill, minmax(min(100%, 280px), 1fr))` instead of `auto-fit` so filtering down to `1` matching card never stretches it across `100%` width, and set `align-items: start` so opening one card's `<details>` never stretches sibling cards in the same row.

### Rule 4: Support `hidden="until-found"` with `beforematch` and IME composition safety

Tag deep spec panels with `hidden="until-found"` (without `display: none`) and listen for `beforematch` so browser Find-in-Page (`Ctrl+F` / `Cmd+F`) and fragment links reveal them cleanly. Defer live match filtering during IME composition (`compositionstart` / `compositionend`), and fall back to `getBoundingClientRect()` coordinates when CSS Anchor Positioning is unavailable.

## Implementation Pattern

```html
<section class="c2b-catalog-stage" aria-labelledby="c2b-heading">
  <h2 id="c2b-heading">Searchable Specifications</h2>

  <search class="c2b-search-wrap" id="c2b-search-envelope">
    <label for="c2b-search-input" class="c2b-label">Search modules &amp; specs</label>
    <input
      id="c2b-search-input"
      type="search"
      placeholder="Try thermal, tourniquet, or seal..."
      autocomplete="off"
      aria-controls="c2b-match-window"
      aria-expanded="false"
    >
  </search>

  <!-- Choice 2B Top-Layer Floating Match Window (0px normal-flow push) -->
  <div id="c2b-match-window" popover="manual" role="region" aria-label="Live search matches">
    <div class="c2b-window-head">
      <strong id="c2b-match-count">0 matches</strong>
      <button type="button" id="c2b-close-window" class="c2b-close-btn">Close</button>
    </div>
    <ul id="c2b-match-list" class="c2b-match-list"></ul>
  </div>

  <!-- Track-preserving auto-fill grid with align-items: start -->
  <div class="c2b-card-grid">
    <article class="c2b-card" id="card-bleed" data-search-index="bleeding tourniquet thermal foil">
      <h3>Bleeding Control Pouch</h3>
      <p>Immediate 90-second response pouch for untrained bystanders.</p>
      <details class="c2b-spec-details">
        <summary>Technical storage specs</summary>
        <div class="c2b-spec-body" hidden="until-found">
          <p>Foil vacuum sealed; rated -15°C to +45°C thermal stability.</p>
        </div>
      </details>
    </article>

    <article class="c2b-card" id="card-aed" data-search-index="cardiac aed battery pads">
      <h3>Cardiac AED Unit</h3>
      <p>Voice-guided defibrillator with auto rhythm analysis.</p>
      <details class="c2b-spec-details">
        <summary>Technical storage specs</summary>
        <div class="c2b-spec-body" hidden="until-found">
          <p>4-year standby lithium cell; IP55 dust and splash seal.</p>
        </div>
      </details>
    </article>
  </div>
</section>
```

```css
.c2b-search-wrap {
  display: grid;
  gap: 0.35rem;
  max-inline-size: 34rem;
  /* Constant envelope spacing across rest and :focus (DeltaB_inflow = 0px) */
  padding: 0.5rem 0;
  margin-block-end: 1rem;
}

#c2b-search-input {
  anchor-name: --c2b-search-anchor;
  min-block-size: 44px;
  padding: 0.55rem 0.85rem;
  border: 1.5px solid #94a3b8;
  border-radius: 10px;
  font: inherit;
}

/* Top-Layer Floating Match Window with @starting-style & allow-discrete */
#c2b-match-window {
  position: fixed;
  inset: 4.5rem auto auto 1rem;
  margin: 0;
  inline-size: min(520px, calc(100dvw - 2rem));
  max-block-size: min(360px, 50dvh);
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-gutter: stable;
  padding: 0.8rem 0.95rem;
  border-radius: 12px;
  border: 1px solid #cbd5e1;
  background: #ffffff;
  color: #0f172a;
  box-shadow: 0 18px 36px -12px rgba(15, 23, 42, 0.25);
  transition: opacity 150ms ease, transform 150ms ease, display 150ms, overlay 150ms;
  transition-behavior: allow-discrete;
}

@supports (position-area: block-end span-inline-end) {
  #c2b-match-window {
    inset: auto;
    position-anchor: --c2b-search-anchor;
    position-area: block-end span-inline-end;
    position-try-fallbacks: flip-block, flip-inline, flip-block flip-inline;
    margin-block-start: 6px;
  }
}

#c2b-match-window:is(:popover-open, .\:popover-open) {
  display: grid;
  gap: 0.6rem;
  opacity: 1;
  transform: translateY(0);
}

@starting-style {
  #c2b-match-window:is(:popover-open, .\:popover-open) {
    opacity: 0;
    transform: translateY(-4px);
  }
}

.c2b-window-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 0.45rem;
}

.c2b-match-list {
  display: grid;
  gap: 0.45rem;
  list-style: none;
  margin: 0;
  padding: 0;
}

.c2b-match-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.65rem;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
}

/* auto-fill keeps column track width constant even on 1-match filters */
.c2b-card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 280px), 1fr));
  gap: 1rem;
  align-items: start;
}

.c2b-card {
  padding: 1rem;
  border-radius: 12px;
  border: 1px solid #cbd5e1;
  background: #ffffff;
}

@media (prefers-reduced-motion: reduce) {
  #c2b-match-window {
    transition: none !important;
  }
}
```

```javascript
const input = document.getElementById('c2b-search-input');
const matchWin = document.getElementById('c2b-match-window');
const matchCount = document.getElementById('c2b-match-count');
const matchList = document.getElementById('c2b-match-list');
const closeBtn = document.getElementById('c2b-close-window');
let composing = false;

function positionFallback() {
  if (CSS.supports('position-area', 'block-end span-inline-end')) return;
  const rect = input.getBoundingClientRect();
  matchWin.style.top = `${Math.min(window.innerHeight - 220, rect.bottom + 6)}px`;
  matchWin.style.left = `${Math.max(16, Math.min(rect.left, window.innerWidth - 360))}px`;
}

function showWindow() {
  positionFallback();
  if ('popover' in HTMLElement.prototype && typeof matchWin.showPopover === 'function') {
    if (!matchWin.matches(':popover-open')) matchWin.showPopover();
  } else {
    matchWin.classList.add(':popover-open');
    matchWin.hidden = false;
  }
  input.setAttribute('aria-expanded', 'true');
}

function hideWindow() {
  if ('popover' in HTMLElement.prototype && typeof matchWin.hidePopover === 'function') {
    if (matchWin.matches(':popover-open')) matchWin.hidePopover();
  } else {
    matchWin.classList.remove(':popover-open');
    matchWin.hidden = true;
  }
  input.setAttribute('aria-expanded', 'false');
}

function renderMatches(query) {
  const q = query.trim().toLowerCase();
  if (!q) {
    hideWindow();
    return;
  }

  const hits = [...document.querySelectorAll('.c2b-card')].filter((card) => {
    const hay = `${card.dataset.searchIndex || ''} ${card.textContent}`.toLowerCase();
    return hay.includes(q);
  });

  matchCount.textContent = `${hits.length} live ${hits.length === 1 ? 'match' : 'matches'} (0px layout jump)`;
  matchList.replaceChildren();

  if (hits.length === 0) {
    const li = document.createElement('li');
    li.className = 'c2b-match-item';
    li.textContent = 'No matching specs yet — try another keyword.';
    matchList.append(li);
  } else {
    for (const card of hits) {
      const li = document.createElement('li');
      li.className = 'c2b-match-item';
      const title = document.createElement('strong');
      title.textContent = card.querySelector('h3')?.textContent || 'Match';
      const previewBtn = document.createElement('button');
      previewBtn.type = 'button';
      previewBtn.textContent = 'Reveal Spec';
      previewBtn.addEventListener('click', () => {
        hideWindow();
        const details = card.querySelector('details');
        if (details) details.open = true;
        card.querySelector('[hidden="until-found"]')?.removeAttribute('hidden');
        card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
      li.append(title, previewBtn);
      matchList.append(li);
    }
  }
  showWindow();
}

input?.addEventListener('compositionstart', () => { composing = true; });
input?.addEventListener('compositionend', () => { composing = false; renderMatches(input.value); });
input?.addEventListener('input', () => { if (!composing) renderMatches(input.value); });
closeBtn?.addEventListener('click', hideWindow);

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') hideWindow();
});

// Sync parent <details> when browser Find-in-Page matches hidden="until-found"
document.addEventListener('beforematch', (e) => {
  const details = e.target.closest?.('details');
  if (details) details.open = true;
});

if (!('onbeforematch' in HTMLElement.prototype)) {
  document.querySelectorAll('[hidden="until-found"]').forEach((el) => {
    el.removeAttribute('hidden');
  });
}
```

## Guidelines

- **DO** keep padding, borders, and sibling heights invariant when a search input receives focus or input (`DeltaB_inflow = 0px`).
- **DO** apply `repeat(auto-fill, minmax(min(100%, 280px), 1fr))` and `align-items: start` on filterable grids to prevent card width ballooning and sibling row stretch.
- **DO** put `hidden="until-found"` on an inner child wrapper (`.c2b-spec-body`), never directly on a padded/bordered parent or alongside `display: none`.
- **DON'T** auto-expand in-flow `<details>` accordions inside the document flow during live search keystrokes.
- **DON'T** omit the `getBoundingClientRect()` fallback for browsers without CSS Anchor Positioning (`position-area`).

## Verification & Fallbacks

1. **Zero In-Flow Displacement (`DeltaB_inflow = 0px`):** Measure `.c2b-card-grid` `getBoundingClientRect().top` before focusing `#c2b-search-input`, after focusing, and after typing `"thermal"`. Assert `Math.abs(afterTop - beforeTop) === 0` and verify all `<details>` in `.c2b-card-grid` remain `open === false`.
2. **Track Conservation Check:** Hide all cards except 1 and verify the remaining `.c2b-card` maintains `<= 50%` container width inside a wide (`1200px`) desktop grid (`auto-fill`, not `auto-fit`).
3. **Overlay Dismissal Check:** Press <kbd>Esc</kbd> or click `#c2b-close-window` and confirm `#c2b-match-window` closes cleanly (`matches(':popover-open') === false`).

Fallbacks: When `CSS.supports('position-area', 'block-end span-inline-end')` is false (Firefox / Safari), `positionFallback()` anchors the top-layer popover right below `input.getBoundingClientRect().bottom`. When `onbeforematch` is absent, unwrap `hidden="until-found"` inside the `<details>` container so content remains searchable inside native `<details>`.

## Related Guides

- `progressive-comprehension` (via `npx haii-guidance retrieve "progressive-comprehension"`)
- `split-stage-3order-companion` (via `npx haii-guidance retrieve "split-stage-3order-companion"`)
- `zero-displacement-agent-receipts` (via `npx haii-guidance retrieve "zero-displacement-agent-receipts"`)
- `fitts-moat-and-hick-hyman-budgets` (via `npx haii-guidance retrieve "fitts-moat-and-hick-hyman-budgets"`)
