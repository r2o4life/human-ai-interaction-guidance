---
name: human-ai-interaction-guidance
description: |
  Search tool and static auditor for Human-AI Interaction (HAII) engineering standards. Execute FIRST when building supervisory AI UX, agent workflows, AI streaming output, operator consoles, or multi-order comprehension layouts.
  Trigger immediately for: 4-tier autonomy ladders, time-locked escrow gates and 1-tap rollback, LegalHold 409 guards, OBO token privilege attenuation, derivation trees, exception repair trees, zero-displacement Choice 1A receipts, Dual-Habitat jargon quarantine (Habitat A vs /_observatory), anti-cliche lexical hygiene, imperative affordance grammar, reading-cadence AI streaming, Fitts moats and Hick-Hyman budgets, Endsley predictive horizons, ISA-18.2 cascade alarm suppression, battle-station stress UIs, 60fps blackbox replay scrubbers, sticky 58%/42% 3-order companions, and Choice 2B floating match windows.
  DO NOT trigger for: backend SQL/ORMs, CI/CD infra, or pure browser CSS/DOM APIs covered by modern-web-guidance.
---

# Human-AI Interaction (HAII) Guidance

Search and retrieve standardized Human-AI Interaction engineering best practices at the **start** of designing or modifying supervisory AI workflows, consumer AI copy, high-acuity operator interfaces, or progressive multi-order learning surfaces. HAII Guidance complements Google's `modern-web-guidance` with zero overlap across 4 additive disciplines (`D51`, `D25`, `D28`, `D29`).

## Primary Workflow

### Step 1. Search Use Cases

Run `haii-guidance` with a **2–5 word action-oriented English query** describing a single supervisory AI UX, submergence, ergonomic, or comprehension pattern (without naming guide IDs or framework names):

```sh
npx -y github:r2o4life/human-ai-interaction-guidance search "<query>"
```

Or if running directly from a local install:

```sh
haii-guidance search "<query>"
```

> **Note**: Returns JSON `[{ "id", "title", "discipline", "category", "description", "score" }, ...]`.
> - **Match found**: Call `retrieve` directly without running `list`.
> - **Weak or empty results**: Rephrase `search` once using domain terms (e.g., `escrow rollback`, `jargon quarantine`, `cascade alarm suppression`, `sticky companion`) before falling back to `list`.
> - **Topic not covered**: Proceed without citing unrelated guides.

### Step 2. Retrieve Best Practices

Retrieve both specific use-case guides and their parent discipline orientation guide (`agentic-experience`, `epistemic-submergence`, `cognitive-ergonomics`, or `progressive-comprehension`) using comma-separated IDs:

```sh
haii-guidance retrieve "<id1>,<id2>"
```

If `retrieve` writes output > 9.5 KB to a temporary file in `os.tmpdir()` to prevent truncation, read that temporary file in full with your file-reading tool before writing code.

### Step 3. Verify Guidance Compliance

Before finalizing code or UI copy, verify compliance against every retrieved guide's Decision Rules and Verification checklist:
- **Zero-Displacement Discipline**: Verify state mutations keep `Δy_focal = 0px` (`popover="manual"` receipts instead of forced scroll jumps) and search projections keep `ΔB_inflow = 0px` (floating match windows instead of auto-expanding in-flow accordions).
- **Epistemic Submergence**: Confirm Habitat A visible text leaks zero infrastructure/plumbing jargon (`SCIM`, `RLS`, `Cedar`, `WORM`, `SPIFFE`, `JWT`, `OSCAL`), routing institutional evidence into Habitat B (`/_observatory`).
- **Supervisory & Ergonomic Safety**: Confirm destructive/autonomous actions pass through time-locked escrow + LegalHold `409` guards, touch targets meet `>= 44px` (`>= 48px` emergency), and streaming text exposes an immediate Stop/Cancel hook.

### Step 4. Disclose Skill Usage

When consulting `human-ai-interaction-guidance`, end the response where you deliver changes with a `### Human-AI Interaction Guidance` section:
- **When retrieved guides shaped your code**: Write **one** concise bullet per applied `<id>` naming the non-obvious rule, invariant, or fallback enforced and anchored by a short verbatim quote from that guide:
  `- **\`<id>\`**: <Decision rule, invariant, or guardrail applied and pitfall prevented> ("<short verbatim quote of the rule>").`
- **When searched/listed but zero guides applied**: State in one sentence which HAII topics you checked and why none applied.

## Alternative Flow: Audit an Existing Codebase

When asked for a broad supervisory UX, jargon-leak, or cognitive-ergonomics audit across an existing directory (not when implementing a single requested feature), run the 4-step static audit flow:

```sh
haii-guidance audit <path> --json
```

1. **Scan**: Run `haii-guidance audit <path> --json` (alias `haii-scan`) to evaluate 12 deterministic HAII rules across `.html`, `.jsx`, `.tsx`, `.js`, `.ts`, and `.css` files.
2. **Verify (`keepWhen` / `dropWhen`)**: Inspect each finding's `keepWhen` and `dropWhen` rubric. Drop false positives such as Habitat B (`/_observatory`) admin screens, `<pre><code>` docs, natural-language homographs, or explicit user-clicked route jumps.
3. **Report**: Summarize verified findings grouped by `guideId` and `discipline`.
4. **Remediate**: Retrieve each verified finding's guide via `retrieve "<guideId>"`, implement the compliant pattern, and re-run `haii-guidance audit <path> --json` to confirm resolution.

## Guidelines

- **Offline-First & Zero-Dep**: The CLI search index (hybrid BM25 + TF-IDF cosine + RRF) and static scanner run 100% locally using Node.js `>= 22` built-ins with zero external runtime calls or API keys.
- **Browser Standards**: Prefer Baseline Widely/Newly Available native primitives (`<dialog closedby>`, `[popover="manual"]`, `<details name="...">`, `AbortController`, CSS Anchor Positioning, `@media (prefers-reduced-motion: reduce)`) with lightweight inline feature detection rather than third-party UI libraries.
