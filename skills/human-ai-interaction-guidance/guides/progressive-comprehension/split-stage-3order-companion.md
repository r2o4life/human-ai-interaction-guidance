---
id: split-stage-3order-companion
title: Split-Stage 3-Order Educational Companion
discipline: D29
category: progressive-comprehension
kind: use-case
description: Co-locate a sticky 58%-60% interactive subject column beside a sticky 40%-42% educational companion whose 1st-Order layperson anatomy stays open while 2nd-Order coordination and 3rd-Order sustainment unfold in native disclosures.
keywords:
  - split stage 58 42
  - 3-order comprehension
  - sticky educational companion
  - first exposure layperson anatomy
  - progressive disclosure details
  - bidirectional module sync
  - viewport pinning delta y 0
  - domain lexical isolation
triggers:
  - explaining unfamiliar technical or safety tools right next to interactive controls
  - implementing a sticky two-column split stage with 58-60% subject and 40-42% companion
  - layering novice layperson explanation, group coordination, and long-term maintenance cleanly
  - syncing an educational sidebar live with search filters or item selection without scroll jump
provenance:
  - PARADIGM_22
  - PARADIGM_99
maturity: stable
---

# Split-Stage 3-Order Educational Companion

## Overview

Putting explanations in a separate help tab forces novices to abandon their task; crowding every operational nuance onto cards overwhelms everyone. A **Split-Stage 3-Order Companion** solves this by placing a sticky `40%–42%` educational `<aside>` directly beside a `58%–60%` interactive subject column, keeping a complete plain-English first exposure open at rest while disclosing group coordination and long-horizon sustainment inside native `<details>`.

## Decision Rules

### Rule 1: Enforce `58%–60%` Subject / `40%–42%` Sticky Companion Geometry

On desktop (`@media (min-width: 900px)` / `@container (min-width: 820px)`), render the primary interactive subject or `#1 Query Match` inside `minmax(0, 58fr)` (`58%–60%`) and the `<aside class="cc-education-companion-card">` inside `minmax(300px, 42fr)` (`40%–42%`), with `position: sticky; top: 5.25rem` and `align-self: start` on both columns. Collapse cleanly to one column below `900px`.

### Rule 2: Layer Three Epistemic Comprehension Orders (`Tier 1 -> Tier 2 -> Tier 3`)

- **Tier 1 (Default Open — Complete First Exposure):** Assume zero specialist background. Open with a plain-English hook, a core value proposition, and a 4-part `<dl>` Subject Anatomy translating technical terms into everyday analogies.
- **Tier 2 (Collapsed `<details>` — Contextual Group Coordination):** Reframe comprehension around how a venue lead, team coordinator, or coach helps untrained participants understand and act inside crowded or multi-actor settings.
- **Tier 3 (Collapsed `<details>` — Environmental & Operational Sustainment):** Reframe comprehension around how a steward preserves readiness, physical integrity, lighting visibility, and calibration over long timelines.

### Rule 3: Synchronize dynamically with `0px` focal jump (`withViewportPin`)

When users click module switcher pills (`aria-pressed`), pick a filter chip, or select a subject item, update the companion's Tier 1–3 content immediately in place. Wrap DOM updates in synchronous trigger-relative viewport pinning (`window.scrollBy(0, afterTop - beforeTop)`), so the clicked control never moves under the pointer (`DeltaY_focal = 0px`).

### Rule 4: Quarantine epistemic taxonomy labels off user-facing copy

Never print internal architecture strings (`Tier 1`, `1st-Order`, `2nd-Order`, `3rd-Order`, `CC1`) in the rendered UI. Translate each tier into its real domain role label (`First-Time Resident`, `Campus Coordinator`, `Site Steward`).

## Implementation Pattern

```html
<section class="cc-split-stage" data-cc-split-stage="true" aria-labelledby="cc-stage-title">
  <div class="cc-subject-pane" data-cc-primary-subject="true">
    <h2 id="cc-stage-title">Response Kit Modules</h2>
    <div class="cc-switcher-pills" role="group" aria-label="Select module to inspect">
      <button type="button" class="cc-module-pill is-active" data-module-id="bleed" aria-pressed="true">
        Bleeding Control
      </button>
      <button type="button" class="cc-module-pill" data-module-id="aed" aria-pressed="false">
        Cardiac AED
      </button>
    </div>
    <article class="cc-subject-card" id="cc-active-subject">
      <h3>Immediate Bleeding Control Pouch</h3>
      <p>Built for neighbors with zero medical training during the critical first 90 seconds.</p>
    </article>
  </div>

  <aside class="cc-education-companion-card" aria-live="polite" aria-label="Module guide">
    <header class="cc-edu-header">
      <span class="cc-edu-badge">Plain-Language Guide</span>
      <h3 id="cc-companion-title">Immediate Bleeding Control Pouch</h3>
    </header>

    <!-- Tier 1: Complete First Exposure (Default Open, zero jargon) -->
    <div class="cc-edu-tier1">
      <p id="cc-tier1-hook">
        Stops severe limb bleeding in under 90 seconds—bridging the gap before emergency responders arrive.
      </p>
      <dl class="cc-anatomy-list" id="cc-anatomy-list">
        <div>
          <dt>Twist-Tight Strap (Windlass Tourniquet)</dt>
          <dd>Works like shutting a garden hose valve above a burst pipe until bright bleeding stops.</dd>
        </div>
        <div>
          <dt>Clotting Sponge Strip (Hemostatic Gauze)</dt>
          <dd>Mineral-coated fabric you press into deep wounds to help blood seal 5x faster than cloth.</dd>
        </div>
      </dl>
    </div>

    <!-- Tier 2: Group & Venue Coordination (Native <details>) -->
    <details class="cc-tier-disclosure">
      <summary>For Venue &amp; Team Leads: Helping Staff Under Crowd Noise</summary>
      <div class="cc-disclosure-body">
        <p id="cc-tier2-copy">
          Picture-first pouches and dual straps let two untrained coaches treat separate injuries simultaneously while corridors clear.
        </p>
      </div>
    </details>

    <!-- Tier 3: Long-Horizon Environmental Sustainment (Native <details>) -->
    <details class="cc-tier-disclosure">
      <summary>For Site Stewards: Maintaining 2:00 AM &amp; Weather Readiness</summary>
      <div class="cc-disclosure-body">
        <p id="cc-tier3-copy">
          Foil vacuum seals and 60-day hydrogel adhesive inspections guarantee the strap and dressing work on the first pull in rain or frost.
        </p>
      </div>
    </details>
  </aside>
</section>
```

```css
.cc-split-stage {
  container-type: inline-size;
  display: grid;
  gap: 1.25rem;
  align-items: start;
  /* MANDATORY: Never apply overflow: hidden or content-visibility: auto here, or sticky stops working */
}

@media (min-width: 900px) {
  .cc-split-stage:has(> .cc-education-companion-card) {
    grid-template-columns: minmax(0, 58fr) minmax(300px, 42fr);
  }
  .cc-split-stage > [data-cc-primary-subject="true"],
  .cc-split-stage > .cc-education-companion-card {
    position: sticky;
    top: 5.25rem;
    align-self: start;
  }
}

/* Fallback for environments without :has() */
@supports not selector(:has(*)) {
  @media (min-width: 900px) {
    .cc-split-stage {
      grid-template-columns: minmax(0, 58fr) minmax(300px, 42fr);
    }
  }
}

.cc-education-companion-card {
  container-type: inline-size;
  display: grid;
  gap: 0.75rem;
  padding: 1rem 1.1rem;
  border-radius: 12px;
  border: 1.5px solid #cbd5e1;
  background: #ffffff;
  color: #0f172a;
}

.cc-switcher-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-block-end: 0.75rem;
}

.cc-module-pill {
  min-block-size: 38px;
  padding: 0.35rem 0.85rem;
  border-radius: 999px;
  border: 1px solid #94a3b8;
  background: #ffffff;
  color: #0f172a;
  font-weight: 600;
  cursor: pointer;
}

.cc-module-pill[aria-pressed="true"] {
  background: #0f766e;
  border-color: #0f766e;
  color: #ffffff;
}

.cc-anatomy-list {
  display: grid;
  gap: 0.5rem;
  margin: 0.5rem 0 0 0;
}

@container (min-width: 480px) {
  .cc-anatomy-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.cc-anatomy-list dt {
  font-weight: 700;
  font-size: 0.88rem;
}

.cc-anatomy-list dd {
  margin: 0.15rem 0 0 0;
  font-size: 0.85rem;
  color: #334155;
}

.cc-tier-disclosure {
  border-top: 1px solid #e2e8f0;
  padding-top: 0.5rem;
}

.cc-tier-disclosure summary {
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  min-block-size: 36px;
  display: flex;
  align-items: center;
}
```

```javascript
const MODULE_BLUEPRINTS = {
  bleed: {
    title: 'Immediate Bleeding Control Pouch',
    hook: 'Stops severe limb bleeding in under 90 seconds—bridging the gap before emergency responders arrive.',
    anatomy: [
      ['Twist-Tight Strap (Windlass Tourniquet)', 'Works like shutting a garden hose valve above a burst pipe until bleeding stops.'],
      ['Clotting Sponge Strip (Hemostatic Gauze)', 'Mineral-coated fabric you press firmly into deep wounds to speed clotting 5x.']
    ],
    tier2: 'Picture-first pouches and dual straps let two untrained coaches treat separate injuries simultaneously while corridors clear.',
    tier3: 'Foil vacuum seals and 60-day hydrogel adhesive inspections guarantee every strap works on the first pull in rain or frost.'
  },
  aed: {
    title: 'Talking Heart-Restart Unit (AED)',
    hook: 'Reads heart rhythm automatically and speaks calm step-by-step instructions—it never delivers a shock unless needed.',
    anatomy: [
      ['Two Peel-and-Stick Pads', 'Pre-diagrammed chest pads placed over bare skin just like large adhesive bandages.'],
      ['Automatic Voice Pacer', 'Guides chest compressions and signals clearly when to stand back.']
    ],
    tier2: 'High-volume voice prompts cut through gymnasium chatter so any chaperone can take turns during CPR.',
    tier3: 'Monthly green status-light checks and spare-battery expiry tags keep outdoor cabinets ready through cold nights.'
  }
};

function withViewportPin(triggerEl, mutateFn) {
  const beforeTop = triggerEl?.getBoundingClientRect().top ?? 0;
  mutateFn();
  if (triggerEl) {
    const deltaY = triggerEl.getBoundingClientRect().top - beforeTop;
    if (Math.abs(deltaY) > 1) window.scrollBy({ top: deltaY, left: 0, behavior: 'instant' });
  }
}

document.querySelectorAll('.cc-module-pill').forEach((pill) => {
  pill.addEventListener('click', () => {
    const mod = MODULE_BLUEPRINTS[pill.dataset.moduleId];
    if (!mod) return;

    withViewportPin(pill, () => {
      document.querySelectorAll('.cc-module-pill').forEach((btn) => {
        const active = btn === pill;
        btn.setAttribute('aria-pressed', String(active));
        btn.classList.toggle('is-active', active);
      });

      document.getElementById('cc-companion-title').textContent = mod.title;
      document.getElementById('cc-tier1-hook').textContent = mod.hook;
      document.getElementById('cc-tier2-copy').textContent = mod.tier2;
      document.getElementById('cc-tier3-copy').textContent = mod.tier3;

      const dl = document.getElementById('cc-anatomy-list');
      dl.replaceChildren(...mod.anatomy.map(([term, desc]) => {
        const wrap = document.createElement('div');
        const dt = document.createElement('dt');
        dt.textContent = term;
        const dd = document.createElement('dd');
        dd.textContent = desc;
        wrap.append(dt, dd);
        return wrap;
      }));
    });
  });
});
```

## Guidelines

- **DO** render Tier-1 first-exposure comprehension open immediately (`0` clicks required) with household analogies and a structured `<dl>` anatomy.
- **DO** keep Tier-2 and Tier-3 inside collapsed `<details>` elements so resting vertical length remains compact.
- **DO** wrap companion state swaps in `withViewportPin(triggerEl, ...)` so clicking pills or filter chips shifts the trigger by `0px`.
- **DON'T** wrap `.cc-split-stage` in an ancestor with `overflow: hidden` or `content-visibility: auto`, which breaks `position: sticky`.
- **DON'T** print internal framework jargon (`1st-Order`, `2nd-Order`, `3rd-Order`, `Meta-Comprehension`) on user-facing companion labels.

## Verification & Fallbacks

1. **Column Ratio & Sticky Check (Playwright):** At `1440x900`, compute `subjectRect.width / stageRect.width` (`0.54–0.61`) and `companionRect.width / stageRect.width` (`0.38–0.44`), then scroll `600px` down and confirm `companionRect.top` remains pinned near `84px` (`5.25rem`).
2. **Initial Disclosure State:** Assert both `.cc-tier-disclosure` `<details>` elements start with `open === false` while `.cc-edu-tier1` is visible (`height > 0`).
3. **Sync & Pin Check:** Click `.cc-module-pill[data-module-id="aed"]` and assert `#cc-companion-title` updates while `Math.abs(pillAfterTop - pillBeforeTop) <= 1`.

Fallbacks: When CSS `:has()` is unsupported (`@supports not selector(:has(*))`), apply the `58fr 42fr` grid via class selector directly. Below `900px`, both columns flatten cleanly into a single vertical stack with zero duplicate DOM.

## Related Guides

- `progressive-comprehension` (via `npx haii-guidance retrieve "progressive-comprehension"`)
- `happy-path-value-payoff-disclosure` (via `npx haii-guidance retrieve "happy-path-value-payoff-disclosure"`)
- `expertise-graduated-scaffolding` (via `npx haii-guidance retrieve "expertise-graduated-scaffolding"`)
- `anchored-floating-match-windows` (via `npx haii-guidance retrieve "anchored-floating-match-windows"`)
