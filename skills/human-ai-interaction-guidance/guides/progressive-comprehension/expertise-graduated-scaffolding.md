---
id: expertise-graduated-scaffolding
title: Expertise-Graduated Scaffolding & Fast-Track Overrides
discipline: D29
category: progressive-comprehension
kind: use-case
description: Graduate AI onboarding hints, explanation verbosity, micro-density modes, and keyboard fast-track overrides from novice guidance to compact expert views without leaking meta-rubric chrome.
keywords:
  - expertise graduated scaffolding
  - novice to expert ui
  - progressive onboarding graduation
  - compact density mode
  - fast track override
  - persona relevance lens
  - style container queries
  - zero meta rubric leakage
triggers:
  - adapting onboarding hints and explanation verbosity as users advance across workflow stages
  - letting experienced users bypass sequential tutorials via a reversible fast-track override
  - scaling interface density between standard guided mode and compact analytical mode
  - preventing internal rubric labels or evaluation jargon from leaking into hints
provenance:
  - PARADIGM_59
  - PARADIGM_84
  - PARADIGM_90
maturity: stable
---

# Expertise-Graduated Scaffolding & Fast-Track Overrides

## Overview

Static onboarding banners annoy experienced practitioners on day 30, while stripping all help leaves first-time visitors lost on day 1. Graduate scaffolding cleanly across expertise stages: surface full plain-English hints during initial stages, compress completed guidance into compact summaries once stage mastery (`stage >= 4`) or fast-track override activates, and strip every trace of internal rubric jargon.

## Decision Rules

### Rule 1: Modulate density and hint verbosity by active proficiency stage

Track proficiency explicitly through discrete workflow milestones (`stage 1..5`) or an explicit practitioner mode toggle:

- **Guided Mode (`stage 1–3`):** Render `standard` comfortable padding, active prerequisite focus indicator, and complete plain-English orientation hints (`graduation-state="ACTIVE_PRIMARY"`).
- **Graduated Expert Mode (`stage >= 4` or Fast-Track Active):** Switch zone density to `compact` or `analytical` (`--density-mode: compact`), collapse Stage-1 walkthrough boxes into single-line status cues (`graduation-state="GRADUATED_COMPACT_SUMMARY"`), and expose keyboard command palettes (`Cmd+K` / `Ctrl+K` with `<= 50ms` filter response).

### Rule 2: Provide a reversible 1-tap Fast-Track Override

Never trap returning practitioners behind locked sequential steps. Offer an explicit `[Unlock All Steps]` / `[Restore Guided View]` toggle (`aria-pressed`) so advanced users can bypass tutorial gating immediately while preserving a one-click path back to guided hints.

### Rule 3: Adapt explanations to selected user role (`aria-pressed` lens)

Offer 2–3 domain-authentic role pills (e.g., `First Responder`, `Coordinator`, `Auditor`) that re-prioritize relevant sections (`PRIMARY_FOVEAL` vs `SECONDARY_STAGED`) with non-color status symbols (`● Active`, `◐ Staged`) and `forced-colors: active` borders.

### Rule 4: Enforce zero meta-rubric leakage

Scaffolding copy must explain user actions in everyday terms. Reject internal rubric phrases (`2nd-Order`, `3rd-Order`, `Horizon 1`, `Choice 1A`, `Choice 2B`, `UI-IR`, `Salsa`, `MECE`, `Gradient`) across every hint, badge, and status bar.

## Implementation Pattern

```html
<section class="scaffold-shell" data-density-mode="standard" data-graduation-state="ACTIVE_PRIMARY">
  <header class="scaffold-bar">
    <div class="scaffold-roles" role="group" aria-label="Role View">
      <button type="button" class="scaffold-pill" data-role="novice" aria-pressed="true">
        First-Time Setup
      </button>
      <button type="button" class="scaffold-pill" data-role="lead" aria-pressed="false">
        Operations Lead
      </button>
    </div>

    <div class="scaffold-controls">
      <span id="scaffold-status" class="scaffold-status">
        <span aria-hidden="true">●</span> Guided View · Step 1 of 4
      </span>
      <button type="button" id="btn-fast-track" class="scaffold-btn" aria-pressed="false">
        Unlock All Steps
      </button>
    </div>
  </header>

  <div class="scaffold-hint-box" id="scaffold-hint-box">
    <p class="hint-expanded">
      Start by choosing a coverage target below. Each checkpoint unlocks the next verification step automatically.
    </p>
    <p class="hint-compact" hidden>
      All 4 checkpoints unlocked (Compact Practitioner View · Press / to filter).
    </p>
  </div>
</section>
```

```css
.scaffold-shell {
  display: grid;
  gap: 0.75rem;
  padding: 1rem;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  background: #ffffff;
  color: #0f172a;
}

[data-density-mode="standard"] { --density-mode: standard; }
[data-density-mode="compact"] { --density-mode: compact; }

/* Zero-specificity :where() fallback + @container style() progressive enhancement */
:where([data-density-mode="standard"]) .scaffold-hint-box {
  padding: 0.85rem 1rem;
}

:where([data-density-mode="compact"]) .scaffold-hint-box {
  padding: 0.45rem 0.75rem;
  border-style: dashed;
}

@container style(--density-mode: compact) {
  .scaffold-hint-box {
    padding: 0.45rem 0.75rem;
  }
}

.scaffold-bar {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 0.6rem;
}

.scaffold-roles,
.scaffold-controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}

.scaffold-pill,
.scaffold-btn {
  min-block-size: 38px;
  padding: 0.35rem 0.8rem;
  border-radius: 999px;
  border: 1px solid #94a3b8;
  background: #f8fafc;
  color: #0f172a;
  font: inherit;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
}

.scaffold-pill[aria-pressed="true"],
.scaffold-btn[aria-pressed="true"] {
  background: #0f766e;
  border-color: #0f766e;
  color: #ffffff;
}

.scaffold-hint-box {
  border-radius: 8px;
  border: 1px solid color-mix(in oklab, #0f766e 35%, #cbd5e1);
  background: #f0fdfa;
  color: #0f172a;
}

.scaffold-hint-box p {
  margin: 0;
  line-height: 1.48;
}

@media (forced-colors: active) {
  .scaffold-pill[aria-pressed="true"],
  .scaffold-btn[aria-pressed="true"] {
    border: 2px solid Highlight;
    color: CanvasText;
  }
  .scaffold-hint-box {
    border: 2px solid CanvasText;
  }
}
```

```javascript
const shell = document.querySelector('.scaffold-shell');
const fastTrackBtn = document.getElementById('btn-fast-track');
const statusEl = document.getElementById('scaffold-status');
const expandedHint = document.querySelector('.hint-expanded');
const compactHint = document.querySelector('.hint-compact');

function setGraduatedState(graduated) {
  shell.setAttribute('data-density-mode', graduated ? 'compact' : 'standard');
  shell.setAttribute('data-graduation-state', graduated ? 'GRADUATED_COMPACT_SUMMARY' : 'ACTIVE_PRIMARY');
  fastTrackBtn.setAttribute('aria-pressed', String(graduated));
  fastTrackBtn.textContent = graduated ? 'Restore Guided View' : 'Unlock All Steps';
  expandedHint.hidden = graduated;
  compactHint.hidden = !graduated;
  statusEl.textContent = graduated
    ? '● Full View Unlocked · Compact Mode'
    : '● Guided View · Step 1 of 4';
}

fastTrackBtn?.addEventListener('click', () => {
  const isGraduated = fastTrackBtn.getAttribute('aria-pressed') === 'true';
  setGraduatedState(!isGraduated);
});

document.querySelectorAll('.scaffold-pill').forEach((pill) => {
  pill.addEventListener('click', () => {
    document.querySelectorAll('.scaffold-pill').forEach((p) => {
      p.setAttribute('aria-pressed', String(p === pill));
    });
    setGraduatedState(pill.dataset.role === 'lead');
  });
});
```

## Guidelines

- **DO** keep `[Unlock All Steps]` and `[Restore Guided View]` reversible in one click (`aria-pressed`) without losing unsaved form inputs.
- **DO** include non-color glyphs (`●`, `◐`, `✓`) and explicit `@media (forced-colors: active)` rules on graduated state banners.
- **DO** verify every hint sentence uses plain human language (`<= 18` words) free of compiler/rubric labels.
- **DON'T** abruptly delete helpful summaries when a user advances; collapse them cleanly into a 1-line compact banner with an opt-back toggle.
- **DON'T** lock keyboard-only fast-track shortcuts onto modified single letters while focus is inside `<input>`, `<textarea>`, or `<select>`.

## Verification & Fallbacks

1. **Graduation State Toggle:** Click `#btn-fast-track` in Playwright and verify `data-density-mode` switches `standard -> compact`, `.hint-expanded` becomes hidden, `.hint-compact` is visible, and clicking again restores `ACTIVE_PRIMARY`.
2. **Meta-Rubric Leakage Audit:** Run regex `/2nd-Order|3rd-Order|Horizon 1|Choice 1A|Choice 2B|UI-IR|MECE|Salsa/i` against rendered scaffolding text and assert `0` matches.
3. **Forced-Colors Parity:** Emulate `forcedColors: 'active'` and assert active pills remain distinguishable via border thickness/system keywords.

Fallbacks: Style queries (`@container style(--density-mode: compact)`) work progressively in Chromium/Safari; pairing them with zero-specificity `:where([data-density-mode="compact"])` rules ensures identical compact rendering in Firefox and older engines.

## Related Guides

- `progressive-comprehension` (via `npx haii-guidance retrieve "progressive-comprehension"`)
- `split-stage-3order-companion` (via `npx haii-guidance retrieve "split-stage-3order-companion"`)
- `happy-path-value-payoff-disclosure` (via `npx haii-guidance retrieve "happy-path-value-payoff-disclosure"`)
- `anti-cliche-lexical-hygiene` (via `npx haii-guidance retrieve "anti-cliche-lexical-hygiene"`)
