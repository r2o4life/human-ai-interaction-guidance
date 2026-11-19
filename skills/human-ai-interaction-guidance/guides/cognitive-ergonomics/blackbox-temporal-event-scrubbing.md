---
id: blackbox-temporal-event-scrubbing
title: Black-Box Temporal Event Scrubbing & Deterministic Replay
discipline: D28
category: cognitive-ergonomics
kind: use-case
description: Build a 60fps bidirectional temporal playback scrubber spanning historical incident bookmarks, live state, and predictive horizons with zero layout reflow and throttled ARIA narration.
keywords:
  - temporal scrubbing
  - black box flight recorder
  - deterministic event replay
  - incident bookmarks
  - predictive horizon scrub
  - 60fps 16ms seek
  - zero reflow tabular nums
  - aria-valuetext
triggers:
  - building a timeline scrubber to replay historical AI or telemetry incidents
  - jumping directly to incident onset, mitigation, and stabilization bookmarks
  - preventing layout jitter or screen-reader speech flooding while scrubbing ranges
  - unifying past event replay, live state, and future projection on one timeline
provenance:
  - PARADIGM_62
maturity: stable
---

# Black-Box Temporal Event Scrubbing & Deterministic Replay

## Overview

Interfaces locked to the ephemeral present force operators to guess what sequence of events triggered a fault. A **Multi-Scale Temporal Scrubber** (`MSTS`) pairs a continuous black-box flight recorder with sub-frame seek latency (`<= 16ms`, `60fps`), one-click incident bookmarks, variable-speed playback (`1x`, `5x`, `30x`), and forward predictive horizon exploration—without layout jitter or screen-reader flooding.

## Decision Rules

### Rule 1: Unify past replay, live present (`t=0`), and predictive horizon on one continuous axis

Span negative historical offsets (e.g., `-60m` to `0s`) through `t=0 (LIVE)` into positive predictive projections (`+30m`). Color-code and text-tag the regime badge distinctly (`HISTORICAL REPLAY`, `LIVE STREAMING`, `PREDICTIVE PROJECTION`) so operators never confuse a replayed fault or simulation with live system state.

### Rule 2: Lock seek latency (`<= 16ms`) and guarantee zero horizontal or vertical reflow

Keep frame lookup `O(1)` against an indexed ring buffer of recorded snapshots, coalesce rapid slider `input` events with `requestAnimationFrame`, and apply `font-variant-numeric: tabular-nums` with fixed `min-inline-size` (`ch` units) on time/value readouts so numbers never cause surrounding controls to jump.

### Rule 3: Provide one-click incident bookmarks and accessible throttled ARIA feedback

Surface key anomaly bookmarks (`Thermal Drift`, `Fault Onset`, `Stabilized`) beside the scrubber for instant jumps (`0` guesswork dragging). Update `aria-valuetext` on every step, but throttle `aria-live="polite"` announcements (`>= 450ms` debounce) so rapid keyboard or pointer scrubbing does not overload screen readers.

## Implementation Pattern

```html
<section class="blackbox-scrubber" aria-labelledby="scrubber-heading">
  <header class="scrubber-header">
    <div>
      <h2 id="scrubber-heading">Black-Box Temporal Replay</h2>
      <span id="scrub-mode-badge" class="scrub-badge" data-mode="live">LIVE TELEMETRY</span>
    </div>
    <div class="scrub-controls">
      <button type="button" id="btn-scrub-step-back" class="scrub-btn">-5m</button>
      <output id="scrub-time-readout" class="scrub-time" for="temporal-slider">LIVE (t+0s)</output>
      <button type="button" id="btn-scrub-step-fwd" class="scrub-btn">+5m</button>
      <button type="button" id="btn-scrub-play" class="scrub-btn" aria-pressed="false">Play 5x</button>
    </div>
  </header>

  <div class="scrub-bookmarks" role="group" aria-label="Incident bookmarks">
    <button type="button" class="scrub-bookmark" data-offset="-2400">14:02 Thermal Drift</button>
    <button type="button" class="scrub-bookmark" data-offset="-1200">14:05 Fault Isolation</button>
    <button type="button" class="scrub-bookmark" data-offset="0">Live Present (t=0)</button>
    <button type="button" class="scrub-bookmark" data-offset="900">+15m Horizon</button>
  </div>

  <label for="temporal-slider" class="visually-hidden">Scrub timeline offset in seconds</label>
  <input
    type="range"
    id="temporal-slider"
    class="temporal-range"
    min="-3600"
    max="1800"
    step="60"
    value="0"
    aria-valuetext="LIVE (t plus 0 seconds)"
  >

  <dl class="scrub-metrics">
    <div>
      <dt>Frame Anchor</dt>
      <dd id="scrub-frame-anchor">Block #14,920</dd>
    </div>
    <div>
      <dt>System Metric</dt>
      <dd id="scrub-metric-val">60.00 Hz</dd>
    </div>
    <div>
      <dt>Event Note</dt>
      <dd id="scrub-event-note">Operating nominal across primary nodes.</dd>
    </div>
  </dl>

  <div id="scrub-aria-announcer" class="visually-hidden" aria-live="polite"></div>
</section>
```

```css
.blackbox-scrubber {
  display: grid;
  gap: 0.9rem;
  padding: 1.25rem;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  background: #ffffff;
  color: #0f172a;
}

.scrubber-header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
}

.scrub-badge {
  display: inline-block;
  margin-block-start: 0.25rem;
  padding: 0.2rem 0.55rem;
  border-radius: 999px;
  font-size: 0.74rem;
  font-weight: 700;
}

.scrub-badge[data-mode="live"] { background: #dcfce7; color: #14532d; }
.scrub-badge[data-mode="history"] { background: #fef3c7; color: #78350f; }
.scrub-badge[data-mode="future"] { background: #e0f2fe; color: #075985; }

.scrub-controls,
.scrub-bookmarks {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}

.scrub-time {
  min-inline-size: 18ch;
  text-align: center;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.scrub-btn,
.scrub-bookmark {
  min-block-size: 40px;
  padding: 0.35rem 0.75rem;
  border-radius: 8px;
  border: 1px solid #94a3b8;
  background: #f8fafc;
  color: #0f172a;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}

@media (pointer: coarse) {
  .scrub-btn,
  .scrub-bookmark {
    min-block-size: 44px;
  }
}

.temporal-range {
  inline-size: 100%;
  min-block-size: 44px;
  accent-color: #0284c7;
  cursor: pointer;
}

.scrub-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 180px), 1fr));
  gap: 0.75rem;
  margin: 0;
}

.scrub-metrics dd {
  margin: 0.2rem 0 0 0;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  min-block-size: 2.5em;
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
const slider = document.getElementById('temporal-slider');
const timeOut = document.getElementById('scrub-time-readout');
const badge = document.getElementById('scrub-mode-badge');
const anchorEl = document.getElementById('scrub-frame-anchor');
const metricEl = document.getElementById('scrub-metric-val');
const noteEl = document.getElementById('scrub-event-note');
const announcer = document.getElementById('scrub-aria-announcer');

let rafId = 0;
let liveTimer = 0;
let playTimer = 0;

function renderFrame(offsetSec) {
  const mins = Math.round(offsetSec / 60);
  let label = 'LIVE (t+0s)';
  let mode = 'live';
  let badgeText = 'LIVE TELEMETRY';
  let metric = '60.00 Hz';
  let note = 'Operating nominal across primary nodes.';

  if (offsetSec < 0) {
    mode = 'history';
    badgeText = 'HISTORICAL REPLAY';
    label = `${mins}m (Replay)`;
    metric = offsetSec <= -1800 ? '59.92 Hz (Thermal)' : '58.82 Hz (Transient)';
    note = offsetSec <= -1800 ? 'Transformer thermal drift flagged; cascade alerts suppressed.' : 'Reserve bus bridged transient fault in 840ms.';
  } else if (offsetSec > 0) {
    mode = 'future';
    badgeText = 'PREDICTIVE HORIZON';
    label = `+${mins}m (Forecast)`;
    metric = '59.95 Hz (±0.08)';
    note = 'Kalman projection: 42.5m reserve headroom at 95% confidence.';
  }

  slider.value = String(offsetSec);
  slider.setAttribute('aria-valuetext', `${badgeText}: ${label}, ${metric}`);
  timeOut.textContent = label;
  badge.setAttribute('data-mode', mode);
  badge.textContent = badgeText;
  anchorEl.textContent = `Block #${14920 + Math.round(offsetSec / 60)}`;
  metricEl.textContent = metric;
  noteEl.textContent = note;

  clearTimeout(liveTimer);
  liveTimer = setTimeout(() => {
    announcer.textContent = `${badgeText} at ${label}: ${metric}. ${note}`;
  }, 450);
}

slider?.addEventListener('input', () => {
  const next = Number(slider.value) || 0;
  cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(() => renderFrame(next));
});

document.querySelectorAll('.scrub-bookmark').forEach((btn) => {
  btn.addEventListener('click', () => renderFrame(Number(btn.dataset.offset) || 0));
});

document.getElementById('btn-scrub-step-back')?.addEventListener('click', () => {
  renderFrame(Math.max(-3600, (Number(slider.value) || 0) - 300));
});

document.getElementById('btn-scrub-step-fwd')?.addEventListener('click', () => {
  renderFrame(Math.min(1800, (Number(slider.value) || 0) + 300));
});

const playBtn = document.getElementById('btn-scrub-play');
playBtn?.addEventListener('click', () => {
  const playing = playBtn.getAttribute('aria-pressed') === 'true';
  clearInterval(playTimer);
  if (playing) {
    playBtn.setAttribute('aria-pressed', 'false');
    playBtn.textContent = 'Play 5x';
    return;
  }
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const stepMs = reduced ? 1200 : 400;
  playBtn.setAttribute('aria-pressed', 'true');
  playBtn.textContent = 'Pause Replay';
  playTimer = setInterval(() => {
    const next = (Number(slider.value) || 0) + 60;
    renderFrame(next > 1800 ? -3600 : next);
  }, stepMs);
});
```

## Guidelines

- **DO** isolate the active timeline mode (`live`, `history`, `future`) with explicit visible text badges as well as color so operators never mistake replay for live control.
- **DO** throttle `aria-live` updates during continuous pointer drags while keeping `aria-valuetext` synchronous on every frame.
- **DO** enforce `tabular-nums` and reserved block/inline sizes (`min-inline-size` in `ch`, `min-block-size` on `.scrub-metrics dd`) so text updates cause `0px` layout shift.
- **DON'T** mutate live state or dispatch commands while scrubbed away from `t=0`; block destructive dispatch unless returning explicitly to `LIVE`.
- **DON'T** animate auto-replay frames rapidly when `prefers-reduced-motion: reduce` is active—slow cadence or step explicitly.

## Verification & Fallbacks

1. **Seek Latency & Reflow Check:** Scrub `#temporal-slider` from `-3600` to `+1800` in Playwright; verify update completes in `< 16ms` and `document.body.scrollHeight` / button `y` coordinates shift by `0px`.
2. **Bookmark Accuracy Check:** Click each `.scrub-bookmark` button and assert `#scrub-mode-badge` switches accurately (`history`, `live`, `future`) and `slider.getAttribute('aria-valuetext')` reflects the new offset.
3. **ARIA Throttle Check:** Dispatch 10 rapid `input` events within 100ms and confirm `#scrub-aria-announcer` emits once after the `450ms` quiet window.

Fallbacks: Standard `<input type="range">` works natively in all browsers with keyboard arrows (<kbd>Left</kbd>/<kbd>Right</kbd>, <kbd>PageUp</kbd>/<kbd>PageDown</kbd>, <kbd>Home</kbd>/<kbd>End</kbd>); if `requestAnimationFrame` coalescing is unnecessary for static logs, invoke `renderFrame` directly.

## Related Guides

- `cognitive-ergonomics` (via `npx haii-guidance retrieve "cognitive-ergonomics"`)
- `endsley-predictive-horizon-projection` (via `npx haii-guidance retrieve "endsley-predictive-horizon-projection"`)
- `cascade-alarm-rationalization` (via `npx haii-guidance retrieve "cascade-alarm-rationalization"`)
- `reading-cadence-ai-streaming` (via `npx haii-guidance retrieve "reading-cadence-ai-streaming"`)
