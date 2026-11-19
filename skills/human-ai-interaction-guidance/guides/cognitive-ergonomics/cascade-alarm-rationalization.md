---
id: cascade-alarm-rationalization
title: ANSI/ISA-18.2 Cascade Alarm Rationalization
discipline: D28
category: cognitive-ergonomics
kind: use-case
description: Collapse cascading secondary fault floods into prioritized root causes with >=90% suppression ratios so operator attention stays within working-memory limits.
keywords:
  - ansi isa-18.2
  - alarm rationalization
  - cascade alarm suppression
  - alarm fatigue
  - root cause clustering
  - working memory millers law
  - diagnostic triage
  - alert flood suppression
triggers:
  - handling alert storms where one failure triggers dozens of downstream warnings
  - implementing ANSI/ISA-18.2 alarm flood suppression in AI or telemetry consoles
  - capping simultaneous top-level alerts inside working-memory limits
  - keeping suppressed secondary symptoms auditable without cluttering primary view
provenance:
  - PARADIGM_61
  - PARADIGM_77
maturity: stable
---

# ANSI/ISA-18.2 Cascade Alarm Rationalization

## Overview

During a primary system fault, cascading downstream checks often fire 30–50 redundant alarms within seconds. Presenting a flat chronological feed destroys operator situation awareness and induces alarm blindness. Group causal chains dynamically under ANSI/ISA-18.2 principles, suppressing `>= 90%` of symptomatic child alerts into an auditable disclosure while surfacing `<= 4–7` prioritized root causes.

## Decision Rules

### Rule 1: Cluster alerts by causal lineage, not arrival timestamp

Never dump raw telemetry events straight into top-level alert banners. Map each incoming signal to a `rootCauseId` (or causal dependency edge). Promote only the root cause to the primary alert list and move correlated downstream symptoms into a collapsed child group.

### Rule 2: Enforce `>= 90%` cascade suppression during fault floods

Compute `suppressionRatio = suppressedCount / totalRawCount`. During multi-fault cascades (`totalRawCount >= 10`), suppress secondary voltage, heartbeat, or timeout echoes so active root-cause cards stay strictly within working-memory limits (`<= 4` critical chunks; max `7`).

### Rule 3: Preserve lossless auditability inside native `<details>`

Suppression is never deletion. Render a clear suppression badge (`1 Root Cause · 41 Secondary Alarms Suppressed · 97.6%`) paired with a collapsed `<details>` disclosure containing every child timestamp and node ID for post-triage verification.

### Rule 4: Pair color severity with non-color cues and calm live announcements

Indicate priority with both text rank (`P1 CRITICAL`, `P2 WARNING`) and distinct shape/icon glyphs (`aria-hidden="true"`). Route only new unacknowledged root causes—never suppressed child echoes—to `aria-live="assertive"`.

## Implementation Pattern

```html
<section class="alarm-console" aria-labelledby="alarm-console-title">
  <header class="alarm-header">
    <div>
      <h2 id="alarm-console-title">Rationalized Root Alarms</h2>
      <p id="alarm-summary" class="alarm-summary">
        Loading alert stream…
      </p>
    </div>
    <span id="alarm-isa-badge" class="alarm-badge">ISA-18.2 ACTIVE</span>
  </header>

  <ul id="alarm-root-list" class="alarm-root-list"></ul>
  <div id="alarm-live-region" class="visually-hidden" aria-live="assertive"></div>
</section>
```

```css
.alarm-console {
  display: grid;
  gap: 1rem;
  padding: 1.25rem;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  background: #ffffff;
  color: #0f172a;
}

.alarm-header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
}

.alarm-badge {
  padding: 0.25rem 0.65rem;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 700;
  background: #e0f2fe;
  color: #075985;
  border: 1px solid #7dd3fc;
}

.alarm-root-list {
  display: grid;
  gap: 0.75rem;
  list-style: none;
  margin: 0;
  padding: 0;
}

.alarm-root-card {
  display: grid;
  gap: 0.5rem;
  padding: 0.9rem 1rem;
  border-radius: 10px;
  border: 1.5px solid #cbd5e1;
  border-inline-start: 5px solid #b91c1c;
  background: #fef2f2;
}

.alarm-children {
  margin-block-start: 0.25rem;
  border-top: 1px solid rgba(15, 23, 42, 0.12);
  padding-block-start: 0.45rem;
}

.alarm-children summary {
  cursor: pointer;
  font-weight: 600;
  min-block-size: 36px;
  display: flex;
  align-items: center;
}

.visually-hidden {
  position: absolute;
  clip-path: inset(50%);
  overflow: hidden;
  width: 1px;
  height: 1px;
  white-space: nowrap;
}
```

```javascript
export function rationalizeAlarms(rawAlerts, maxRootCards = 4) {
  const groups = new Map();

  for (const alert of rawAlerts) {
    const rootId = alert.rootCauseId || alert.id;
    if (!groups.has(rootId)) {
      groups.set(rootId, { root: null, children: [] });
    }
    const bucket = groups.get(rootId);
    if (alert.isRoot || alert.id === rootId) {
      bucket.root = alert;
    } else {
      bucket.children.push(alert);
    }
  }

  const ordered = [...groups.values()]
    .map((g) => ({
      root: g.root || g.children[0],
      suppressed: g.root ? g.children : g.children.slice(1)
    }))
    .sort((a, b) => (a.root.priority ?? 99) - (b.root.priority ?? 99));

  const visibleRoots = ordered.slice(0, maxRootCards);
  const suppressedTotal = rawAlerts.length - visibleRoots.length;
  const suppressionRatio = rawAlerts.length > 0 ? suppressedTotal / rawAlerts.length : 0;

  return { visibleRoots, totalRaw: rawAlerts.length, suppressedTotal, suppressionRatio };
}

export function renderRationalizedAlarms(rawAlerts) {
  const { visibleRoots, totalRaw, suppressedTotal, suppressionRatio } = rationalizeAlarms(rawAlerts);
  const pct = (suppressionRatio * 100).toFixed(1);

  document.getElementById('alarm-summary').textContent =
    `${visibleRoots.length} root cause (${suppressedTotal} of ${totalRaw} secondary alerts suppressed · ${pct}%)`;

  const list = document.getElementById('alarm-root-list');
  list.replaceChildren();

  for (const { root, suppressed } of visibleRoots) {
    const li = document.createElement('li');
    li.className = 'alarm-root-card';

    const title = document.createElement('strong');
    title.textContent = `[P${root.priority} CRITICAL] ${root.title}`;

    const action = document.createElement('p');
    action.textContent = root.recommendedAction;

    li.append(title, action);

    if (suppressed.length > 0) {
      const details = document.createElement('details');
      details.className = 'alarm-children';
      const summary = document.createElement('summary');
      summary.textContent = `Inspect ${suppressed.length} suppressed downstream alerts`;
      const ul = document.createElement('ul');
      for (const child of suppressed) {
        const item = document.createElement('li');
        item.textContent = `${child.timestamp} — ${child.title}`;
        ul.append(item);
      }
      details.append(summary, ul);
      li.append(details);
    }
    list.append(li);
  }

  const live = document.getElementById('alarm-live-region');
  if (visibleRoots[0]) {
    live.textContent = `Priority ${visibleRoots[0].root.priority} root fault: ${visibleRoots[0].root.title}. ${suppressedTotal} cascade alerts suppressed.`;
  }
}
```

## Guidelines

- **DO** cap active root-cause cards at `<= 4` (`<= 7` hard ceiling) and display both raw count and suppression percentage transparently.
- **DO** preserve suppressed secondary events in a closed `<details>` disclosure so investigators can audit cascade propagation without blocking immediate remediation.
- **DO** combine priority labels (`P1`, `P2`), icons, and high-contrast borders rather than color-coded dots alone.
- **DON'T** emit every suppressed child alarm into an `aria-live` region; screen-reader speech queues will lag seconds behind live faults.
- **DON'T** delete or drop suppressed child telemetry from logs or audit trails—rationalization suppresses visual attention clutter, not ground-truth history.

## Verification & Fallbacks

1. **Suppression Ratio Assertion:** Feed 42 synthetic cascade events (1 root + 41 downstream echoes) into `rationalizeAlarms()` and assert `visibleRoots.length === 1` and `suppressionRatio >= 0.90`.
2. **Working-Memory Cap Assertion:** Assert top-level `.alarm-root-card` count in DOM never exceeds `4` at rest and `<details class="alarm-children">` starts collapsed (`!details.open`).
3. **ARIA Flood Check:** Verify `#alarm-live-region` announces `1` concise root-cause string per burst rather than `42` queued messages.

Fallbacks: If causal metadata (`rootCauseId`) is absent on an incoming event stream, fall back to time-window (`<= 5s`) + subsystem deduplication and mark the summary as `[Grouped by Subsystem]` until exact topology edges arrive.

## Related Guides

- `cognitive-ergonomics` (via `npx haii-guidance retrieve "cognitive-ergonomics"`)
- `endsley-predictive-horizon-projection` (via `npx haii-guidance retrieve "endsley-predictive-horizon-projection"`)
- `stress-adaptive-battlestation-mode` (via `npx haii-guidance retrieve "stress-adaptive-battlestation-mode"`)
- `blackbox-temporal-event-scrubbing` (via `npx haii-guidance retrieve "blackbox-temporal-event-scrubbing"`)
