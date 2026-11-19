---
id: dual-habitat-jargon-quarantine
title: "Dual-Habitat Jargon Quarantine & Homograph-Safe Linting"
discipline: D25
category: epistemic-submergence
kind: use-case
description: "Transduce raw infrastructure tokens (SHA-256, RLS, Cedar, SCIM, JWT, FSM, JSONB, WORM, UI-IR) into human North Stars on Habitat A while quarantining audit receipts to Habitat B with homograph-safe linting."
keywords:
  - jargon quarantine
  - Habitat A
  - Habitat B
  - observatory
  - homograph safe
  - SHA-256
  - RLS
  - Cedar
  - WORM
  - SCIM
triggers:
  - "translating security or database jargon into user-facing copy"
  - "linting frontend copy for leaked backend acronyms without false positives"
  - "routing technical audit hashes to an observatory view"
provenance:
  - PARADIGM_20
  - PARADIGM_90
  - PARADIGM_101
maturity: stable
---

# Dual-Habitat Jargon Quarantine & Homograph-Safe Linting

## Overview

End-user screens lose trust and comprehension when they surface backend acronyms like `SHA-256`, `RLS`, `Cedar`, `SCIM`, `JWT`, `FSM`, `JSONB`, `WORM`, or `UI-IR`. Transduce each mechanism into its everyday human North Star on Habitat A, route verifiable receipts to Habitat B (`/_observatory`), and lint copy with homograph-safe rules so legitimate words like "earthworm", "Cedar Street", or "church spire" never trigger false positives.

## Decision Rules

### Rule 1: Transduce every backend primitive into its human North Star on Habitat A

Never display raw database, auth, or compiler vocabulary on consumer or frontline surfaces. Map each mechanism to what it protects for the person using the interface:

| Submerged Plumbing Token | Habitat A Human North Star | Habitat B (`/_observatory`) Proof |
| :--- | :--- | :--- |
| `SHA-256` / `WORM` | "Tamper-proof activity record" | Ed25519 + Merkle chain height & root digest |
| `RLS` | "Visible only inside your workspace" | Tenant-scoped PostgreSQL `FORCE ROW LEVEL SECURITY` proof |
| `Cedar` / `OpenFGA` | "Checked against your team's safety rules" | Policy decision log & authorization rule ID |
| `SCIM` / `JWT` | "Verified teammate session" | Token issuer, `act` claim, and directory sync trace |
| `FSM` / `JSONB` | "Predictable step-by-step progress" | State machine transition ledger & snapshot schema |
| `UI-IR` / `@steer:` | *Completely submerged (zero frontstage output)* | Compiler discipline provenance manifest |

### Rule 2: Enforce homograph-safe matching in static copy linters

Naive substring or case-insensitive word matching produces false alarms on legitimate domain terms (`canine worm`, `heartworm`, `Pacific red cedar`, `Cedar Street`, `church spire`). Restrict ambiguous tokens (`worm`, `cedar`, `spire`) to uppercase acronyms (`/\bWORM\b/`, `/\bSPIRE\b/`) or technical collocations (`worm audit`, `Cedar policy`, `SPIFFE/SPIRE`).

### Rule 3: Exclude quarantined Habitat B slots before Habitat A verification

Ignore `<script>`, `<style>`, `<svg>`, `<template>`, `[hidden]`, and `[data-meta-quarantined="true"]` elements when extracting Habitat A visible text, while keeping Habitat B panels strictly separate under `/_observatory`.

## Implementation Pattern

```js
// Homograph-safe Habitat A jargon validator (zero dependencies).
const UNCONDITIONAL_PLUMBING = [
  'scim', 'sdek', 'rls', 'oscal', 'etag', 'spiffe', 'odata', 'opencost',
  'pkcs11', 'ml-dsa', 'clickhouse', 'debezium', 'zarf', 'tetragon', 'ebpf',
  'oidc', 'saml', 'jwt', 'jsonb', 'fsm', 'postgres', 'postgresql', 'sha-256',
  'ui-ir', 'cryptoshred'
];

function isAmbiguousPlumbingLeak(token, text) {
  if (token === 'worm') {
    return /\bWORM\b/.test(text) ||
      /\bworm[\s_-]+(?:audit|ledger|storage|retention|compliance|log|rules?|immutable)\b/i.test(text) ||
      /\bwrite[- ]once[- ]read[- ]many\b/i.test(text);
  }
  if (token === 'cedar') {
    return /\bCedar\s+(?:policy|policies|ABAC|RBAC|PDP|engine|schema|guard|rules?)\b/i.test(text) ||
      /\bAWS\s+Cedar\b/i.test(text);
  }
  if (token === 'spire') {
    return /\bSPIRE\b/.test(text) ||
      /\bSPIFFE\s*[/&-]\s*SPIRE\b/i.test(text) ||
      /\bspire[\s_-]+(?:agent|server|workload|svid)\b/i.test(text);
  }
  return false;
}

export function lintHabitatACopy(visibleText) {
  const leaks = [];
  for (const token of UNCONDITIONAL_PLUMBING) {
    const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    if (new RegExp(`\\b${escaped}\\b`, 'i').test(visibleText)) {
      leaks.push(token);
    }
  }
  for (const homograph of ['worm', 'cedar', 'spire']) {
    if (isAmbiguousPlumbingLeak(homograph, visibleText)) {
      leaks.push(homograph);
    }
  }
  return { passed: leaks.length === 0, leaks };
}
```

## Guidelines

- **DO** verify copy against both unconditional plumbing tokens and homograph-safe contextual regexes before publishing Habitat A copy.
- **DO** inspect actual rendered DOM text (`document.body.innerText` on visible nodes) as well as source templates, because dynamic error handlers often leak raw server codes (`ETag mismatch`, `RLS violation`) into alerts.
- **DO** keep an explicit human translation table for every compliance and security guarantee surfaced in product copy.
- **DON'T** block legitimate veterinary, botanical, or geographic domain copy (`earthworm`, `Cedar St`, `cathedral spire`) with brittle substring blacklists.
- **DON'T** mark visible Habitat A marketing copy with `data-meta-quarantined="true"` to evade the linter; only genuine hidden or `/_observatory` blocks belong behind quarantine.
- **DON'T** show raw `0x...` hex hashes or state enum strings (`TRANSIT_INSPECTION`) inside primary action cards.

## Verification & Fallbacks

- **DOM & Playwright assertions:**
  - Run `lintHabitatACopy(visibleText)` on every Habitat A route (`/` and primary user flows) and assert `passed === true` (`leaks.length === 0`).
  - Run unit assertions confirming `"Prevent heartworm on Cedar Street"` passes (`leaks.length === 0`) while `"Protected by WORM audit and Cedar policy"` fails (`leaks` includes `'worm'` and `'cedar'`).
  - Navigate to `/_observatory` (Habitat B) and assert technical receipts render intact without breaking Habitat A isolation.
- **Browser fallbacks:** Pure standard regular expressions and DOM node filtering work identically across all JavaScript runtimes (Node >= 22 and every browser).

## Related Guides

- `epistemic-submergence` (via `npx haii-guidance retrieve "epistemic-submergence"`) — Architectural discipline overview.
- `anti-cliche-lexical-hygiene` (via `npx haii-guidance retrieve "anti-cliche-lexical-hygiene"`) — Sentence word caps and acronym expansion rules.
- `three-act-value-storytelling` (via `npx haii-guidance retrieve "three-act-value-storytelling"`) — Structuring human North Star copy into 3 acts.
- `show-your-work-derivation-trees` (via `npx haii-guidance retrieve "show-your-work-derivation-trees"`) — Progressive technical disclosure when users ask to inspect proof.
