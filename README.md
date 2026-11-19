<p align="center">
  <img src="./assets/logo.svg" alt="Human-AI Interaction Guidance Logo" width="128" height="128" />
</p>

# Human-AI Interaction (HAII) Guidance

[Human-AI Interaction Guidance](https://www.artrgarcia.com/haii-guidance) embeds **27 supervisory AI UX, epistemic submergence, cognitive ergonomics, and 3-order progressive comprehension standards** directly into AI coding agents via the open `agentskills.io` architecture.

*Engineered by [Arturo Roberto Garcia (Parallel Paradigm)](https://www.artrgarcia.com) as a strictly additive, non-overlapping companion to Google's `modern-web-guidance`.*

[Standard & Live Demos](https://www.artrgarcia.com/haii-guidance) · [Source Code](https://github.com/r2o4life/human-ai-interaction-guidance)

## Quickstart

```shell
# Install across Antigravity, Claude Code, Cursor, Codex, Copilot via open skills CLI
npx skills add r2o4life/human-ai-interaction-guidance

# Or run the zero-dependency CLI directly from GitHub
npx -y github:r2o4life/human-ai-interaction-guidance install
```

#### Try it out locally (zero dependencies, 100% offline)

```shell
# Search across all 27 HAII guides using hybrid BM25 + TF-IDF + RRF
node skills/human-ai-interaction-guidance/haii-guidance.mjs search "destructive AI action escrow rollback"

# Retrieve a guide by ID
node skills/human-ai-interaction-guidance/haii-guidance.mjs retrieve "time-locked-autonomy-escrow-gate"

# Audit a codebase against 12 deterministic HAII rules
node skills/human-ai-interaction-guidance/haii-guidance.mjs audit ./src --json
```

## Why HAII?

Google's `modern-web-guidance` defines 232 guidelines across 24 browser-platform disciplines—HTML, CSS, forms, Core Web Vitals, accessibility, and browser APIs—but intentionally leaves **zero guidelines** for how humans supervise autonomous AI systems, comprehend dense computational workflows, or navigate high-stress operational interfaces without jargon fatigue or layout displacement.

Coding agents left unguided routinely generate:
- **Unchecked autonomous mutations** with no escrow cooldown, LegalHold conflict guard, or 1-tap rollback.
- **Habitat A plumbing leaks** exposing `SCIM`, `RLS`, `Cedar`, `WORM`, `SPIFFE`, or `JWT` directly to everyday end users.
- **Cognitive overload & alarm floods** violating Miller's working-memory bounds (`<= 4–7` chunks) and Fitts' Law hit targets.
- **Layout-displacing interactions** that hijack viewport scroll or push content downward when typing in search boxes.

**Human-AI Interaction Guidance closes this 0-guideline gap** with deterministic engineering contracts, vanilla Baseline HTML/CSS/JS patterns, and a zero-dependency local CLI & static scanner.

## Core Disciplines (+27 Guides, 0 Overlap with `modern-web-guidance`)

| Discipline | Focus | Guides |
| :--- | :--- | :---: |
| **`D51` · Agentic Experience (AX)** | 4-tier autonomy ladders, conversational-to-deterministic handoffs, derivation trees, 900s time-locked escrow & LegalHold `409` gates, RFC 8693 OBO privilege attenuation, fault-repair trees, and Choice 1A zero-displacement receipts. | **8** |
| **`D25` · Content Design & Epistemic Submergence** | Habitat A frontstage vs. Habitat B `/_observatory` jargon quarantine, anti-cliché lexical hygiene, 3-act value storytelling, imperative affordance grammar, lifecycle narration, and WPM-paced AI streaming with AbortController stop controls. | **7** |
| **`D28` · Cognitive Ergonomics & High-Acuity UX** | Fitts' moats & Hick-Hyman budgets, environmental surface archetypes, Endsley Level-3 predictive horizons, ANSI/ISA-18.2 >=90% cascade alarm rationalization, stress-adaptive battle-station mode, and 60fps blackbox temporal scrubbing. | **7** |
| **`D29` · 3-Order Progressive Comprehension** | Sticky 58%/42% split-stage 3-order educational companions, expertise-graduated scaffolding, halved-density happy-path value payoffs, and Choice 2B CSS-anchored floating match windows (`hidden="until-found"`). | **5** |

## The Full 27-Guide Catalog

<!-- INJECT_HAII_COVERAGE_START -->
<details open>
<summary><strong>27 Human-AI Interaction guidelines across 4 disciplines</strong></summary>

<h3>D51 · agentic-experience (8 guides)</h3>

- **[agentic-experience](./skills/human-ai-interaction-guidance/guides/agentic-experience/agentic-experience.md)** (`discipline`): Architectural discipline for supervisory human-AI control surfaces: four-tier autonomy ladders, Show-Your-Work derivation trees, 900s escrow gates, OBO privilege attenuation, and zero-displacement receipts.
- **[agentic-obo-privilege-attenuation](./skills/human-ai-interaction-guidance/guides/agentic-experience/agentic-obo-privilege-attenuation.md)** (`use-case`): Display and enforce RFC 8693 On-Behalf-Of agent token scope ceilings so delegated AI copilots cannot escalate past human grants or bypass human escrow.
- **[ax-exception-repair-tree](./skills/human-ai-interaction-guidance/guides/agentic-experience/ax-exception-repair-tree.md)** (`use-case`): Visualize autonomous fault detection, failure classification, blast-radius containment scope, and dry-run saga recovery pathways using interactive accessible repair trees.
- **[conversational-to-deterministic-handoff](./skills/human-ai-interaction-guidance/guides/agentic-experience/conversational-to-deterministic-handoff.md)** (`use-case`): Transition users from an empathetic Layer-1 conversational router into a persona-free Layer-2 deterministic Show-Your-Work payload and explicit confirmation gate.
- **[four-tier-autonomy-ladder](./skills/human-ai-interaction-guidance/guides/agentic-experience/four-tier-autonomy-ladder.md)** (`use-case`): Classify every AI feature into ADVISORY, SUGGESTIVE, SUPERVISED_AUTONOMY, or AUTONOMOUS_GOVERNANCE with matching UI confirmation gates, escrow timers, and stop handles.
- **[show-your-work-derivation-trees](./skills/human-ai-interaction-guidance/guides/agentic-experience/show-your-work-derivation-trees.md)** (`use-case`): Expose AI reasoning lineage—prompt invariant, model family, policy constraints, intermediate hypotheses, and verification hash—inside native exclusive <details name=\"ax-derivations\"> accordions.
- **[time-locked-autonomy-escrow-gate](./skills/human-ai-interaction-guidance/guides/agentic-experience/time-locked-autonomy-escrow-gate.md)** (`use-case`): Gate mutating AI agent proposals in a 900-second holding escrow with live countdown, explicit human principal confirmation, HTTP 409 LegalHold dominance, and one-tap saga rollback.
- **[zero-displacement-agent-receipts](./skills/human-ai-interaction-guidance/guides/agentic-experience/zero-displacement-agent-receipts.md)** (`use-case`): Deliver non-blocking agent mutation and step-up authentication receipts in top-layer popover=\"manual\" notes with DeltaY_focal = 0px, opt-in Jump navigation, and inline Undo.

<h3>D25 · epistemic-submergence (7 guides)</h3>

- **[anti-cliche-lexical-hygiene](./skills/human-ai-interaction-guidance/guides/epistemic-submergence/anti-cliche-lexical-hygiene.md)** (`use-case`): Eliminate generic AI/SaaS marketing fluff, enforce <=14-18 word sentence ceilings, cap Jargon De-Escalation Index <=0.05, and expand necessary domain acronyms on first visual scan.
- **[dual-habitat-jargon-quarantine](./skills/human-ai-interaction-guidance/guides/epistemic-submergence/dual-habitat-jargon-quarantine.md)** (`use-case`): Transduce raw infrastructure tokens (SHA-256, RLS, Cedar, SCIM, JWT, FSM, JSONB, WORM, UI-IR) into human North Stars on Habitat A while quarantining audit receipts to Habitat B with homograph-safe linting.
- **[epistemic-submergence](./skills/human-ai-interaction-guidance/guides/epistemic-submergence/epistemic-submergence.md)** (`discipline`): Architectural discipline for separating everyday human surfaces (Habitat A) from cryptographic and infrastructure verification consoles (Habitat B /_observatory) with zero jargon leakage.
- **[imperative-affordance-grammar](./skills/human-ai-interaction-guidance/guides/epistemic-submergence/imperative-affordance-grammar.md)** (`use-case`): Write unambiguous buttons and action controls following the [Active Imperative Verb] + [Direct Object] + [Risk/Reversibility Scope] syntax, eliminating vague Submit or OK labels.
- **[micro-atomic-lifecycle-narration](./skills/human-ai-interaction-guidance/guides/epistemic-submergence/micro-atomic-lifecycle-narration.md)** (`use-case`): Transform opaque CRUD and session hydration mechanics into causal lifecycle narratives: Inception (Create), Observability Calibration (Read), Causal Metamorphosis (Update), and Capacity-Releasing Decommissioning (Delete).
- **[reading-cadence-ai-streaming](./skills/human-ai-interaction-guidance/guides/epistemic-submergence/reading-cadence-ai-streaming.md)** (`use-case`): Throttle streamed AI text to 250-400 WPM (20-25ms character cadence) with zero layout shift, an immediate Reveal All shortcut, and an instant AbortController Stop control.
- **[three-act-value-storytelling](./skills/human-ai-interaction-guidance/guides/epistemic-submergence/three-act-value-storytelling.md)** (`use-case`): Replace fragmented floating claim badges with cohesive three-act value stories moving from Act I Craft & Provenance to Act II Empirical Truth and Act III Psychological Safety.

<h3>D28 · cognitive-ergonomics (7 guides)</h3>

- **[blackbox-temporal-event-scrubbing](./skills/human-ai-interaction-guidance/guides/cognitive-ergonomics/blackbox-temporal-event-scrubbing.md)** (`use-case`): Build a 60fps bidirectional temporal playback scrubber spanning historical incident bookmarks, live state, and predictive horizons with zero layout reflow and throttled ARIA narration.
- **[cascade-alarm-rationalization](./skills/human-ai-interaction-guidance/guides/cognitive-ergonomics/cascade-alarm-rationalization.md)** (`use-case`): Collapse cascading secondary fault floods into prioritized root causes with >=90% suppression ratios so operator attention stays within working-memory limits.
- **[cognitive-ergonomics](./skills/human-ai-interaction-guidance/guides/cognitive-ergonomics/cognitive-ergonomics.md)** (`discipline`): Apply quantitative biomechanical, attentional, and high-acuity diagnostic ergonomics across AI consoles, operational cockpits, and multi-surface interfaces.
- **[endsley-predictive-horizon-projection](./skills/human-ai-interaction-guidance/guides/cognitive-ergonomics/endsley-predictive-horizon-projection.md)** (`use-case`): Upgrade AI and operational consoles from retrospective Level 1-2 telemetry to Endsley Level 3 trajectory horizons (t+5m, t+15m, t+30m) with uncertainty bounds and pre-execution What-If blast-radius simulation.
- **[environmental-surface-archetypes](./skills/human-ai-interaction-guidance/guides/cognitive-ergonomics/environmental-surface-archetypes.md)** (`use-case`): Adapt luminance contrast (>=7:1), glance word budgets (<=14 words / 300ms), touch targets, and viewport-segment grids across handheld outdoor, desktop studio, mounted vehicle, wearable, and foldable surfaces.
- **[fitts-moat-and-hick-hyman-budgets](./skills/human-ai-interaction-guidance/guides/cognitive-ergonomics/fitts-moat-and-hick-hyman-budgets.md)** (`use-case`): Size interactive targets and pointer-variance collision moats, cap working-memory choice cardinality, maintain resting whitespace equilibrium, and arbitrate a single primary beacon per viewport.
- **[stress-adaptive-battlestation-mode](./skills/human-ai-interaction-guidance/guides/cognitive-ergonomics/stress-adaptive-battlestation-mode.md)** (`use-case`): Simplify operational interfaces under acute crises by marking peripheral chrome inert, capping active chunks at <=3, expanding actuators to >=48px, and elevating contrast to counter tunnel vision.

<h3>D29 · progressive-comprehension (5 guides)</h3>

- **[anchored-floating-match-windows](./skills/human-ai-interaction-guidance/guides/progressive-comprehension/anchored-floating-match-windows.md)** (`use-case`): Preserve zero normal-flow displacement (DeltaB_inflow = 0px) by keeping in-flow details closed during typing and projecting live search matches and hidden="until-found" previews into CSS-anchored top-layer floating match windows.
- **[expertise-graduated-scaffolding](./skills/human-ai-interaction-guidance/guides/progressive-comprehension/expertise-graduated-scaffolding.md)** (`use-case`): Graduate AI onboarding hints, explanation verbosity, micro-density modes, and keyboard fast-track overrides from novice guidance to compact expert views without leaking meta-rubric chrome.
- **[happy-path-value-payoff-disclosure](./skills/human-ai-interaction-guidance/guides/progressive-comprehension/happy-path-value-payoff-disclosure.md)** (`use-case`): Co-locate concrete 6-step happy-path outcome payoffs beside interactive workflows inside halved resting density budgets (HD1-HD6), 8-role typographic hierarchy, and soft-edge previews.
- **[progressive-comprehension](./skills/human-ai-interaction-guidance/guides/progressive-comprehension/progressive-comprehension.md)** (`discipline`): Structure complex interfaces around co-located 3-order educational companions, expertise-graduated scaffolding, happy-path payoff checklists, and zero-displacement Choice 2B search windows.
- **[split-stage-3order-companion](./skills/human-ai-interaction-guidance/guides/progressive-comprehension/split-stage-3order-companion.md)** (`use-case`): Co-locate a sticky 58%-60% interactive subject column beside a sticky 40%-42% educational companion whose 1st-Order layperson anatomy stays open while 2nd-Order coordination and 3rd-Order sustainment unfold in native disclosures.

</details>
<!-- INJECT_HAII_COVERAGE_END -->

## Multi-Agent Installation Methods

<details>
<summary><b>Google Antigravity</b></summary>

```shell
node skills/human-ai-interaction-guidance/haii-guidance.mjs install --target antigravity
```
Installs `plugin.json`, `README.md`, `assets/logo.svg`, `policies/haii-guidance.toml`, and `skills/human-ai-interaction-guidance/` into `~/.gemini/config/plugins/human-ai-interaction-guidance/`.
</details>

<details>
<summary><b>Vercel Skills CLI (<code>npx skills</code>)</b></summary>

```shell
npx skills add r2o4life/human-ai-interaction-guidance
```
</details>

<details>
<summary><b>Claude Code Plugin</b></summary>

```shell
node skills/human-ai-interaction-guidance/haii-guidance.mjs install --target claude
```
</details>

<details>
<summary><b>Cursor / Codex / Workspace</b></summary>

```shell
node skills/human-ai-interaction-guidance/haii-guidance.mjs install --target all
```
</details>

## Eval Benchmark

<!-- INJECT_HAII_EVALS_START -->
| Benchmark | Scope | Result | Threshold | Status |
| :--- | :---: | :---: | :---: | :---: |
| **Hybrid Retrieval (BM25 + TF-IDF + RRF)** | 30 unhinted prompts | Recall@1 **96.7%** · Recall@3 **100.0%** · MRR **0.9833** | Recall@3 >= 95%, MRR >= 0.85 | PASS |
| **Static Audit Recall (`haii-scan`)** | 3 anti-pattern fixtures (12 rules) | **12/12 (100.0%)** detected | >= 95% | PASS |
| **Golden Fixture Precision** | 3 golden fixtures | **0** false positives | 0 FPs | PASS |
| **Manifest & Guide Corpus Integrity** | 27 guides · 13 manifests | **27/27** guides · **13/13** manifests | 100% valid | PASS |
<!-- INJECT_HAII_EVALS_END -->

## License

- Software code (`*.mjs`, CLI, eval harness) is licensed under the [Apache License 2.0](./LICENSE).
- Documentation and guide content under `skills/human-ai-interaction-guidance/guides/` are licensed under [CC-BY 4.0](https://creativecommons.org/licenses/by/4.0/).
