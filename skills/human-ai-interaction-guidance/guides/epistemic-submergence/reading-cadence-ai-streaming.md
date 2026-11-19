---
id: reading-cadence-ai-streaming
title: "Reading-Cadence AI Streaming & Safe Interruption"
discipline: D25
category: epistemic-submergence
kind: use-case
description: "Throttle streamed AI text to 250-400 WPM (20-25ms character cadence) with zero layout shift, an immediate Reveal All shortcut, and an instant AbortController Stop control."
keywords:
  - AI streaming
  - reading cadence
  - 250-400 WPM
  - 280 WPM
  - Reveal All
  - AbortController
  - Stop generating
  - zero CLS
  - aria-busy
triggers:
  - "streaming LLM responses progressively in the UI"
  - "preventing layout shift or unreadable token bursts during AI generation"
  - "adding Stop and Reveal All controls to streaming AI output"
provenance:
  - PARADIGM_54
maturity: stable
---

# Reading-Cadence AI Streaming & Safe Interruption

## Overview

Unthrottled LLM token bursts flash text faster than human eyes can track and push surrounding buttons down the page as lines wrap. Smooth progressive disclosure to human reading speed (`250–400 WPM`, roughly `20–25ms` per 2-character reveal), pin controls above a fixed-footprint output surface (`CLS = 0`), and keep both `Reveal All` and `Stop` immediately clickable.

## Decision Rules

### Rule 1: Throttle token reveal to `250–400 WPM` with `prefers-reduced-motion` bypass

Buffer incoming network chunks and emit characters at `20–25ms` intervals (~`280 WPM` average) so operators read smoothly without erratic token stalls. When `(prefers-reduced-motion: reduce)` matches or the user clicks `Reveal All`, flush the buffered response at once without character-by-character animation.

### Rule 2: Lock control positions above the stream container (`CLS = 0`)

Place `Reveal All` and `Stop` controls in a header row *above* the streaming output box—never below it where growing text pushes buttons away from the user's pointer. Reserve a stable minimum height (`min-block-size`) and `scrollbar-gutter: stable` on the scrollable output container.

### Rule 3: Provide an `AbortController` Stop handle and safe live-region semantics

Wire `Stop Generating` directly to `AbortController.abort()` so network streaming and local timers halt in `< 50ms`. Keep the output container present in the DOM from load with `aria-live="polite"`, set `aria-busy="true"` while tokens stream (preventing screen readers from reading half-words aloud), clear `aria-busy="false"` on completion or abort, and append text strictly via `textContent`—never `innerHTML`.

## Implementation Pattern

```html
<section class="stream-panel" aria-labelledby="stream-heading">
  <header class="stream-toolbar">
    <div>
      <h2 id="stream-heading">Synthesis Summary</h2>
      <span id="stream-cadence-note" class="cadence-note">280 WPM · Calm reading cadence</span>
    </div>
    <div class="stream-controls">
      <button type="button" id="btn-stream-start">Generate Summary</button>
      <button type="button" id="btn-stream-reveal" disabled>Reveal All</button>
      <button type="button" id="btn-stream-stop" disabled>Stop</button>
    </div>
  </header>

  <div id="stream-output" class="stream-output" role="region" aria-label="Generated output"
       aria-live="polite" aria-busy="false"></div>
</section>
```

```css
.stream-panel {
  display: grid;
  gap: 0.75rem;
  padding: 1.25rem;
  border: 1px solid CanvasText;
  border-radius: 12px;
}

.stream-toolbar {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
}

.stream-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.stream-controls button {
  min-block-size: 44px;
  padding: 0.5rem 0.875rem;
  font-weight: 600;
  cursor: pointer;
}

.stream-output {
  box-sizing: border-box;
  min-block-size: 9rem;
  max-block-size: 18rem;
  overflow-y: auto;
  scrollbar-gutter: stable;
  overscroll-behavior: contain;
  padding: 0.875rem 1rem;
  border: 1px solid CanvasText;
  border-radius: 8px;
  line-height: 1.6;
  max-inline-size: 72ch;
  text-wrap: pretty;
}
```

```js
const startBtn = document.getElementById('btn-stream-start');
const revealBtn = document.getElementById('btn-stream-reveal');
const stopBtn = document.getElementById('btn-stream-stop');
const outputEl = document.getElementById('stream-output');
const cadenceNote = document.getElementById('stream-cadence-note');

let abortController = null;
let paceTimer = null;
let targetBuffer = '';
let renderedCount = 0;

function stopPlayback(statusSuffix = '') {
  clearInterval(paceTimer);
  paceTimer = null;
  if (abortController) {
    abortController.abort();
    abortController = null;
  }
  if (statusSuffix) {
    outputEl.textContent = `${outputEl.textContent}${statusSuffix}`;
  }
  outputEl.setAttribute('aria-busy', 'false');
  revealBtn.disabled = true;
  stopBtn.disabled = true;
  startBtn.disabled = false;
}

function startStream(fullSourceText) {
  stopPlayback();
  targetBuffer = fullSourceText;
  renderedCount = 0;
  outputEl.textContent = '';

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) {
    outputEl.textContent = targetBuffer; // Instant non-animated output when reduced motion is preferred.
    cadenceNote.textContent = 'Instant reveal (reduced motion active)';
    return;
  }

  abortController = new AbortController();
  outputEl.setAttribute('aria-busy', 'true');
  revealBtn.disabled = false;
  stopBtn.disabled = false;
  startBtn.disabled = true;

  // Reveal 2 characters every 22ms (~280 WPM calm cadence).
  paceTimer = setInterval(() => {
    if (abortController?.signal.aborted) return;
    if (renderedCount >= targetBuffer.length) {
      stopPlayback();
      return;
    }
    renderedCount = Math.min(targetBuffer.length, renderedCount + 2);
    outputEl.textContent = targetBuffer.slice(0, renderedCount);
  }, 22);
}

revealBtn.addEventListener('click', () => {
  if (!targetBuffer) return;
  outputEl.textContent = targetBuffer;
  stopPlayback();
});

stopBtn.addEventListener('click', () => {
  stopPlayback(' [Stopped by operator]');
});

startBtn.addEventListener('click', () => {
  startStream(
    'Substation B can shift 200 kW safely during afternoon peak hours. ' +
    'This change stays inside a 15-minute holding window with zero penalty to cancel.'
  );
});
```

## Guidelines

- **DO** place `Reveal All` and `Stop` in a stable toolbar above `#stream-output` so controls never drift beneath growing text.
- **DO** assign streamed tokens exclusively via `textContent` or `append(textNode)` to block prompt-injected HTML or XSS execution.
- **DO** set `aria-busy="true"` while tokens stream and clear it to `"false"` on finish, `Reveal All`, or `Stop`.
- **DO** inspect `prefers-reduced-motion: reduce` and skip character-by-character animation automatically when reduced motion is enabled.
- **DON'T** use `innerHTML += chunk` while streaming model output.
- **DON'T** move keyboard focus inside `#stream-output` during streaming.
- **DON'T** let rapid token updates resize surrounding layout columns (`scrollbar-gutter: stable` + bounded `max-block-size` prevent horizontal jitter).

## Verification & Fallbacks

- **DOM & Playwright assertions:**
  - Start streaming and record `btnStop.getBoundingClientRect().top` at `t=50ms` and `t=400ms`; assert `0px` vertical button shift while text populates `#stream-output`.
  - Verify `outputEl.getAttribute('aria-busy') === 'true'` during active streaming and `'false'` after clicking `Reveal All` or `Stop`.
  - Under emulated `prefers-reduced-motion: reduce`, click `#btn-stream-start` and assert complete text appears synchronously without `22ms` timer animation.
- **Browser fallbacks:** `AbortController`, `setInterval`, `aria-busy`, and `prefers-reduced-motion` are universally supported. If `scrollbar-gutter: stable` or `text-wrap: pretty` is unsupported in legacy browsers, padding and `line-height: 1.6` preserve clean visual framing.

## Related Guides

- `epistemic-submergence` (via `npx haii-guidance retrieve "epistemic-submergence"`) — Parent content discipline.
- `anti-cliche-lexical-hygiene` (via `npx haii-guidance retrieve "anti-cliche-lexical-hygiene"`) — Sentence ceilings inside streamed AI responses.
- `conversational-to-deterministic-handoff` (via `npx haii-guidance retrieve "conversational-to-deterministic-handoff"`) — Handing off from streamed synthesis to deterministic execution.
- `zero-displacement-agent-receipts` (via `npx haii-guidance retrieve "zero-displacement-agent-receipts"`) — Preserving `0px` scroll stability when actions accompany streamed summaries.
