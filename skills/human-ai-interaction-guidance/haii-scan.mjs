/**
 * Deterministic Static Codebase Auditor for Human-AI Interaction (HAII) Standards.
 * Scans .html, .jsx, .tsx, .js, .ts, .css files against 12 HAII engineering rules.
 * Zero external dependencies — Node.js >= 22 built-ins only.
 */

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join, relative, resolve } from 'node:path';

const SCANNABLE_EXTENSIONS = new Set(['.html', '.jsx', '.tsx', '.js', '.ts', '.css']);
const SKIP_DIR_NAMES = new Set(['node_modules', '.git', 'dist', 'build', 'gen', '.next', 'coverage']);

function maskSpanPreservingNewlines(text) {
  return text.replace(/[^\n]/g, ' ');
}

function stripNonVisibleHtmlRegions(raw) {
  let out = raw
    .replace(/<!--[\s\S]*?-->/g, maskSpanPreservingNewlines)
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, maskSpanPreservingNewlines)
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, maskSpanPreservingNewlines)
    .replace(/<svg\b[^>]*>[\s\S]*?<\/svg>/gi, maskSpanPreservingNewlines)
    .replace(/<template\b[^>]*>[\s\S]*?<\/template>/gi, maskSpanPreservingNewlines)
    .replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, maskSpanPreservingNewlines)
    .replace(/<pre\b[^>]*>[\s\S]*?<\/pre>/gi, maskSpanPreservingNewlines)
    .replace(/<code\b[^>]*>[\s\S]*?<\/code>/gi, maskSpanPreservingNewlines);

  for (let pass = 0; pass < 3; pass++) {
    out = out.replace(
      /<([a-z0-9-]+)\b[^>]*(?:\bhidden(?:\s*=\s*["'][^"']*["'])?(?=[\s>])|data-meta-quarantined\s*=\s*["']true["']|data-habitat\s*=\s*["']b["']|id\s*=\s*["'][^"']*observatory[^"']*["'])[^>]*>[\s\S]*?<\/\1>/gi,
      maskSpanPreservingNewlines
    );
  }
  return out;
}

function lineNumberAt(text, index) {
  let line = 1;
  for (let i = 0; i < index && i < text.length; i++) {
    if (text.charCodeAt(i) === 10) line++;
  }
  return line;
}

function getLineSnippet(lines, lineNum) {
  return (lines[lineNum - 1] ?? '').trim().slice(0, 180);
}

const PLUMBING_PATTERNS = [
  { token: 'SCIM', re: /\bSCIM\b/ },
  { token: 'SDEK', re: /\bSDEK\b/ },
  { token: 'RLS', re: /\bRLS\b/ },
  { token: 'OSCAL', re: /\bOSCAL\b/ },
  { token: 'SPIFFE', re: /\bSPIFFE\b/ },
  { token: 'SPIRE', re: /\bSPIRE\b|\bspire[\s_-]+(?:agent|server|workload|svid|attestation)\b/i },
  { token: 'WORM', re: /\bWORM\b|\bworm[\s_-]+(?:audit|ledger|storage|retention|log|immutable)\b/i },
  { token: 'Cedar policy', re: /\bCedar\s+(?:policy|policies|ABAC|RBAC|PDP|engine|schema|guard|rules?)\b/i },
  { token: 'ClickHouse', re: /\bClickHouse\b/ },
  { token: 'Debezium', re: /\bDebezium\b/ },
  { token: 'Tetragon', re: /\bTetragon\b/ },
  { token: 'eBPF', re: /\beBPF\b/ },
  { token: 'JSONB', re: /\bJSONB\b/ },
  { token: 'PostgreSQL', re: /\bPostgreSQL\b|\bPostgres\b/ },
  { token: 'CryptoShred', re: /\bCryptoShred\b/i },
  { token: 'JWT', re: /\bJWT\b/ },
  { token: 'OIDC', re: /\bOIDC\b/ },
  { token: 'SAML', re: /\bSAML\b/ }
];

const BANNED_CLICHE_PATTERNS = [
  /\bsupercharge\b/i,
  /\brevolutionize\b/i,
  /\bgame[- ]changer\b/i,
  /\bunlock the power\b/i,
  /\bseamless synergy\b/i,
  /\bdelve into\b/i,
  /\bnext[- ]gen AI\b/i,
  /\bcutting[- ]edge AI\b/i,
  /\bempower your workflow\b/i,
  /\bparadigm shift\b/i,
  /\bunleash your\b/i,
  /\bhyper[- ]personalized\b/i
];

function extractUiTextCandidates(ext, content) {
  if (ext === '.html') {
    const visibleHtml = stripNonVisibleHtmlRegions(content);
    const textOnly = visibleHtml.replace(/<[^>]+>/g, (tag) => maskSpanPreservingNewlines(tag));
    return textOnly.split('\n').map((text, idx) => ({ line: idx + 1, text }));
  }

  const lines = content.split('\n');
  const candidates = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
      continue;
    }
    if (/habitatB|observatory|quarantin/i.test(line)) continue;

    if (
      /(?:textContent|innerText|aria-label|title|label|message|headline|subtitle|cta|copy|description)\s*[:=]/i.test(line) ||
      />[^<>{}\n]{3,}</.test(line)
    ) {
      candidates.push({ line: i + 1, text: line });
    }
  }
  return candidates;
}

export const HAII_SCAN_RULES = [
  {
    ruleId: 'haii-habitat-a-jargon-leak',
    guideId: 'dual-habitat-jargon-quarantine',
    discipline: 'D25',
    severity: 'high',
    extensions: ['.html', '.jsx', '.tsx', '.js', '.ts'],
    keepWhen:
      'Consumer-facing Habitat A UI text displays raw infrastructure, policy, or crypto acronyms (SCIM, RLS, Cedar policy, WORM, SPIFFE, JWT, JSONB) without plain-English transduction.',
    dropWhen:
      'Token resides inside Habitat B (/_observatory), <pre>/<code> documentation, HTML comments, or a natural-language homograph (e.g., "Pacific red cedar", "heartworm").',
    scanFile({ relPath, ext, content, lines }) {
      if (/observatory|_observatory|habitat-b/i.test(relPath)) return [];
      const findings = [];
      for (const candidate of extractUiTextCandidates(ext, content)) {
        for (const { token, re } of PLUMBING_PATTERNS) {
          if (re.test(candidate.text)) {
            findings.push({
              line: candidate.line,
              snippet: getLineSnippet(lines, candidate.line),
              message: `Habitat A visible copy leaks backend plumbing token "${token}"; quarantine to /_observatory (Habitat B) or transduce to everyday user outcomes.`
            });
            break;
          }
        }
      }
      return findings;
    }
  },
  {
    ruleId: 'haii-destructive-ai-no-escrow',
    guideId: 'time-locked-autonomy-escrow-gate',
    discipline: 'D51',
    severity: 'critical',
    extensions: ['.html', '.jsx', '.tsx', '.js', '.ts'],
    keepWhen:
      'Destructive or autonomous AI mutations (bulkDelete, purge, dropTable, wireTransfer, autoExecute, DELETE fetch) execute directly without a time-locked escrow gate, confirmation modal, or rollback path.',
    dropWhen:
      'Handler stages proposals through an AutonomyEscrowGate, <dialog> confirmation, rollback timer, or LegalHold 409 guard.',
    scanFile({ content, lines }) {
      const hasEscrowSafeguard =
        /\b(?:AutonomyEscrowGate|escrow|holdSeconds|undoWindow|rollback|LegalHold|LEGAL_HOLD_ACTIVE|showModal\(|command=["']show-modal["']|confirmModal)\b/i.test(
          content
        );
      if (hasEscrowSafeguard) return [];

      const dangerRe =
        /\b(?:deleteAll|bulkDelete|purgeRecords|dropTable|executeAutonomous|autoExecute|wireTransfer|revokeAllTokens|decommissionCluster)\b|fetch\([^)]*method\s*:\s*['"]DELETE['"]/g;
      const findings = [];
      for (const m of content.matchAll(dangerRe)) {
        const line = lineNumberAt(content, m.index);
        findings.push({
          line,
          snippet: getLineSnippet(lines, line),
          message: `Destructive or autonomous action "${m[0]}" executes with no time-locked escrow gate, explicit confirmation, or reversible rollback.`
        });
      }
      return findings;
    }
  },
  {
    ruleId: 'haii-unbounded-stream-no-stop',
    guideId: 'reading-cadence-ai-streaming',
    discipline: 'D25',
    severity: 'high',
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.html'],
    keepWhen:
      'AI streaming loop (getReader, EventSource, ReadableStream, streamText) writes unbounded tokens directly to DOM with no AbortController stop signal.',
    dropWhen:
      'An AbortController, .abort() handler, or explicit Stop/Cancel stream button is wired in the component.',
    scanFile({ content, lines }) {
      const streamRe = /(?:\.getReader\s*\(|new\s+EventSource\s*\(|new\s+ReadableStream\s*\(|\bonTokenChunk\s*\(|\bstreamTokens\s*\()/g;
      const match = streamRe.exec(content);
      if (!match) return [];

      const hasStopGuard =
        /\b(?:AbortController|abortController|\.abort\(|stopStream|cancelStream|stopGenerating|data-stop-stream)\b/i.test(
          content
        );
      if (hasStopGuard) return [];

      const line = lineNumberAt(content, match.index);
      return [
        {
          line,
          snippet: getLineSnippet(lines, line),
          message:
            'Streaming AI output lacks an AbortController signal and immediate Stop/Cancel user control.'
        }
      ];
    }
  },
  {
    ruleId: 'haii-scroll-jump-displacement',
    guideId: 'zero-displacement-agent-receipts',
    discipline: 'D51',
    severity: 'high',
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.html'],
    keepWhen:
      'Action feedback, toast notification, or mutation handler calls window.scrollTo or scrollIntoView, forcibly moving the user viewport away from their focal coordinate (DeltaY_focal != 0).',
    dropWhen:
      'Scrolling is explicitly initiated by a user clicking a [Jump to ...] link or during top-level SPA route navigation.',
    scanFile({ content, lines }) {
      const findings = [];
      for (let i = 0; i < lines.length; i++) {
        const windowContext = lines.slice(Math.max(0, i - 5), Math.min(lines.length, i + 4)).join('\n');
        const lineText = lines[i];
        if (!/\b(?:window\.scrollTo|\.scrollIntoView)\s*\(/.test(lineText)) continue;

        const isRouteOrExplicitJump = /\b(?:applyRoute|popstate|jumpTo|onJump|explicitJump|handleJumpLink|scroll-jump-opt-in)/i.test(
          windowContext
        );
        const isMutationContext = /\b(?:toast|receipt|stage|apply|mutate|notify|feedback|onSuccess|handleApply|handleStage|save|delete|bulkDelete|status|banner|popover)/i.test(
          windowContext
        );

        if (isMutationContext && !isRouteOrExplicitJump) {
          findings.push({
            line: i + 1,
            snippet: lineText.trim().slice(0, 180),
            message:
              'Involuntary viewport scroll coupled to mutation/feedback handler; use a Choice 1A top-layer popover="manual" receipt with opt-in Jump link instead.'
          });
        }
      }
      return findings;
    }
  },
  {
    ruleId: 'haii-auto-expanding-search-accordion',
    guideId: 'anchored-floating-match-windows',
    discipline: 'D29',
    severity: 'high',
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.html'],
    keepWhen:
      'Search input handler programmatically sets details.open = true or injects in-flow display:block/flex matches that push downstream layout downward (DeltaB_inflow > 0).',
    dropWhen:
      'Matches render in a Top-Layer [popover] floating match window anchored beneath the search field.',
    scanFile({ content, lines }) {
      const findings = [];
      const hasSearchInputContext = /\b(?:searchInput|onSearch|filterQuery|type=["']search["']|addEventListener\(\s*['"]input['"])\b/i.test(
        content
      );
      if (!hasSearchInputContext) return [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const block = lines.slice(Math.max(0, i - 6), Math.min(lines.length, i + 6)).join('\n');
        const opensAccordion = /\.open\s*=\s*true\b/.test(line) && /details|accordion|search|match/i.test(block);
        const expandsInflowPanel =
          /\.style\.display\s*=\s*['"](?:block|flex|grid)['"]/.test(line) &&
          /search|match|result|suggest/i.test(block) &&
          !/popover|showPopover/i.test(block);

        if (opensAccordion || expandsInflowPanel) {
          findings.push({
            line: i + 1,
            snippet: line.trim().slice(0, 180),
            message:
              'Search input auto-expands in-flow accordion/panel and shifts downstream content; project matches into a Choice 2B top-layer [popover] window.'
          });
        }
      }
      return findings;
    }
  },
  {
    ruleId: 'haii-banned-ai-cliche-copy',
    guideId: 'anti-cliche-lexical-hygiene',
    discipline: 'D25',
    severity: 'medium',
    extensions: ['.html', '.jsx', '.tsx', '.js', '.ts'],
    keepWhen:
      'User-facing copy contains vague promotional AI buzzwords ("supercharge", "revolutionize", "game-changer", "unlock the power", "seamless synergy") instead of concrete operational capabilities.',
    dropWhen:
      'Phrase appears inside comments, static linter definitions, or historical critiques.',
    scanFile({ ext, content, lines }) {
      const findings = [];
      for (const candidate of extractUiTextCandidates(ext, content)) {
        for (const re of BANNED_CLICHE_PATTERNS) {
          const match = candidate.text.match(re);
          if (match) {
            findings.push({
              line: candidate.line,
              snippet: getLineSnippet(lines, candidate.line),
              message: `Banned AI marketing cliche "${match[0]}" detected; replace with concrete, <=14-18 word factual capability statement.`
            });
            break;
          }
        }
      }
      return findings;
    }
  },
  {
    ruleId: 'haii-ai-output-no-derivation',
    guideId: 'show-your-work-derivation-trees',
    discipline: 'D51',
    severity: 'medium',
    extensions: ['.html', '.jsx', '.tsx'],
    keepWhen:
      'AI recommendation or decision container renders conclusions with no expandable <details> derivation tree, constraints, model provenance, or verification hash.',
    dropWhen:
      'Container includes or references an inspectable <details> derivation disclosure or Show-Your-Work trace.',
    scanFile({ content, lines }) {
      const aiOutputRe = /(?:data-ai-output|class\s*=\s*["'][^"']*\b(?:ai-response|ai-recommendation|agent-verdict|ai-suggestion)\b[^"']*["'])/g;
      const match = aiOutputRe.exec(content);
      if (!match) return [];

      const hasDerivationDisclosure =
        /<details\b|ax-derivations|data-derivation|show[- ]your[- ]work|derivation-tree/i.test(content);
      if (hasDerivationDisclosure) return [];

      const line = lineNumberAt(content, match.index);
      return [
        {
          line,
          snippet: getLineSnippet(lines, line),
          message:
            'AI decision/output container lacks a progressive <details> derivation tree showing constraints, model, and verification trace.'
        }
      ];
    }
  },
  {
    ruleId: 'haii-missing-reduced-motion',
    guideId: 'stress-adaptive-battlestation-mode',
    discipline: 'D28',
    severity: 'medium',
    extensions: ['.css', '.html'],
    keepWhen:
      'Stylesheet defines @keyframes or continuous animations without any @media (prefers-reduced-motion: reduce) safeguard.',
    dropWhen:
      '@media (prefers-reduced-motion) rule is present in the stylesheet or shared design token layer.',
    scanFile({ ext, content, lines }) {
      const cssScope = ext === '.html' ? (content.match(/<style\b[^>]*>[\s\S]*?<\/style>/gi) ?? []).join('\n') : content;
      if (!cssScope) return [];

      const animMatch = /@keyframes\s+[A-Za-z0-9_-]+|animation(?:-name)?\s*:\s*(?!none\b)[A-Za-z0-9_-]+/i.exec(
        cssScope
      );
      if (!animMatch) return [];

      if (/prefers-reduced-motion\s*:\s*reduce/i.test(content)) return [];

      const absMatch = /@keyframes\s+[A-Za-z0-9_-]+|animation(?:-name)?\s*:\s*(?!none\b)[A-Za-z0-9_-]+/i.exec(
        content
      );
      const line = absMatch ? lineNumberAt(content, absMatch.index) : 1;
      return [
        {
          line,
          snippet: getLineSnippet(lines, line),
          message:
            'Animations/@keyframes defined without @media (prefers-reduced-motion: reduce) attenuation.'
        }
      ];
    }
  },
  {
    ruleId: 'haii-undersized-touch-target',
    guideId: 'fitts-moat-and-hick-hyman-budgets',
    discipline: 'D28',
    severity: 'high',
    extensions: ['.css', '.html', '.jsx', '.tsx'],
    keepWhen:
      'Interactive button or emergency actuator explicitly sets height/width/min-height/min-width below 44px (or <48px for emergency actuators) with no coarse-pointer override or hit-area pseudo-element.',
    dropWhen:
      'Dimension applies to decorative icons/badges or is expanded via ::after hit target or @media (pointer: coarse).',
    scanFile({ content, lines }) {
      if (/@media\s*\(\s*pointer\s*:\s*coarse\s*\)/i.test(content)) return [];
      const findings = [];
      const blockRe = /([^{}\n]*\b(?:button|\.btn|\[role=["']button["']\]|\.cta|\.actuator|\.emergency-action)\b[^{]*)\{([^}]*)\}/gi;
      for (const m of content.matchAll(blockRe)) {
        const selector = m[1];
        const body = m[2];
        if (/::after|::before/.test(selector)) continue;
        const sizeMatches = [...body.matchAll(/\b(?:min-)?(?:height|width)\s*:\s*(\d+(?:\.\d+)?)px/gi)];
        const isEmergency = /emergency|battlestation|abort|stop/i.test(selector);
        const minRequired = isEmergency ? 48 : 44;

        for (const sm of sizeMatches) {
          const px = parseFloat(sm[1]);
          if (px > 0 && px < minRequired) {
            const line = lineNumberAt(content, m.index);
            findings.push({
              line,
              snippet: getLineSnippet(lines, line),
              message: `Interactive target "${selector.trim()}" specifies ${sm[0]} (< ${minRequired}px minimum Fitts touch target).`
            });
            break;
          }
        }
      }
      return findings;
    }
  },
  {
    ruleId: 'haii-unrationalized-alarm-flood',
    guideId: 'cascade-alarm-rationalization',
    discipline: 'D28',
    severity: 'high',
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.html'],
    keepWhen:
      'Loop over alerts/alarms/faults broadcasts 1:1 UI notifications/toasts/banners per event without ANSI/ISA-18.2 cascade suppression or root-cause grouping.',
    dropWhen:
      'Alert stream deduplicates, groups by rootCause, suppresses secondary cascade noise, or caps visible items to <= 3.',
    scanFile({ content, lines }) {
      const hasRationalization =
        /\b(?:rootCause|dedup|deduplicate|suppressCascade|rationalize|groupBy|collapseCascade|maxVisible)\b/i.test(
          content
        );
      if (hasRationalization) return [];

      const floodRe =
        /(?:alerts|alarms|faults|incidents|warnings)\s*\.\s*(?:forEach|map)\s*\([^)]*\)\s*(?:=>\s*)?\{?[\s\S]{0,220}?(?:new\s+Notification|toast\.(?:error|warn)|addAlert|pushAlarm|createBanner|appendAlert)\b/g;
      const match = floodRe.exec(content);
      if (!match) return [];

      const line = lineNumberAt(content, match.index);
      return [
        {
          line,
          snippet: getLineSnippet(lines, line),
          message:
            'Unrationalized 1:1 alarm broadcast loop detected; apply ANSI/ISA-18.2 cascade suppression and group under root cause (<= 3 working-memory chunks).'
        }
      ];
    }
  },
  {
    ruleId: 'haii-missing-3order-disclosures',
    guideId: 'split-stage-3order-companion',
    discipline: 'D29',
    severity: 'medium',
    extensions: ['.html', '.jsx', '.tsx'],
    keepWhen:
      'Dense interactive subject stage exposes multiple operational controls without a co-located educational companion (<aside> or tiered <details>).',
    dropWhen:
      'Stage pairs an adjacent <aside> companion or progressive <details> Tier-1/2/3 disclosure.',
    scanFile({ content, lines }) {
      const stageMatch = /(?:data-subject-stage|class\s*=\s*["'][^"']*\b(?:subject-stage|ai-workbench|decision-simulator)\b[^"']*["'])/i.exec(
        content
      );
      if (!stageMatch) return [];

      const controlCount = (content.match(/<(?:button|input|select|textarea)\b/gi) ?? []).length;
      const hasCompanion = /<aside\b|<details\b|3order-companion|education-companion/i.test(content);
      if (controlCount < 2 || hasCompanion) return [];

      const line = lineNumberAt(content, stageMatch.index);
      return [
        {
          line,
          snippet: getLineSnippet(lines, line),
          message:
            'Interactive subject stage with multiple controls omits a co-located 3-order educational companion (<aside> + progressive <details> tiers).'
        }
      ];
    }
  },
  {
    ruleId: 'haii-generic-button-label',
    guideId: 'imperative-affordance-grammar',
    discipline: 'D25',
    severity: 'medium',
    extensions: ['.html', '.jsx', '.tsx'],
    keepWhen:
      'Action button uses an opaque generic label (Submit, OK, Execute, Proceed, Click Here, Run) without naming the target object or reversibility scope.',
    dropWhen:
      'Button carries an explicit descriptive aria-label or sits inside a native <form method="dialog"> cancel button.',
    scanFile({ content, lines }) {
      const findings = [];
      const btnRe = /<button\b([^>]*)>\s*(Submit|Click Here|OK|Go|Proceed|Do It|Execute|Run)\s*<\/button>/gi;
      for (const m of content.matchAll(btnRe)) {
        const attrs = m[1] || '';
        if (/\baria-label\s*=/.test(attrs)) continue;
        const line = lineNumberAt(content, m.index);
        findings.push({
          line,
          snippet: getLineSnippet(lines, line),
          message: `Generic button label "${m[2]}" violates Imperative Affordance Grammar ([Verb] + [Direct Object] + [Risk/Reversibility Scope]).`
        });
      }
      return findings;
    }
  }
];

function collectTargetFiles(targetPath, { includeDocsAndTests = false, explicitTarget = false } = {}) {
  const st = statSync(targetPath);
  if (st.isFile()) {
    return SCANNABLE_EXTENSIONS.has(extname(targetPath).toLowerCase()) ? [targetPath] : [];
  }

  const results = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      const entryStat = statSync(full);
      if (entryStat.isDirectory()) {
        if (SKIP_DIR_NAMES.has(entry)) continue;
        if (!includeDocsAndTests && !explicitTarget && (entry === 'fixtures' || entry === 'evals')) {
          continue;
        }
        walk(full);
      } else if (entryStat.isFile()) {
        if (SCANNABLE_EXTENSIONS.has(extname(entry).toLowerCase())) {
          results.push(full);
        }
      }
    }
  };
  walk(targetPath);
  return results.sort();
}

/**
 * Run deterministic HAII static scan over a file or directory.
 */
export function runHaiiAudit(target = '.', options = {}) {
  const cwd = options.cwd ?? process.cwd();
  const resolvedTarget = resolve(cwd, target);

  if (!existsSync(resolvedTarget)) {
    throw new Error(`Target path not found: ${target}`);
  }

  const normalizedRelTarget = relative(cwd, resolvedTarget).replace(/\\/g, '/');
  const explicitFixtureTarget =
    options.includeDocsAndTests === true ||
    normalizedRelTarget.includes('fixtures') ||
    statSync(resolvedTarget).isFile();

  const files = collectTargetFiles(resolvedTarget, {
    includeDocsAndTests: Boolean(options.includeDocsAndTests),
    explicitTarget: explicitFixtureTarget
  });

  const activeRules = options.guideId
    ? HAII_SCAN_RULES.filter((r) => r.guideId === options.guideId)
    : HAII_SCAN_RULES;

  if (options.guideId && activeRules.length === 0) {
    throw new Error(`No static audit rule registered for guideId "${options.guideId}"`);
  }

  const findings = [];
  for (const filePath of files) {
    const ext = extname(filePath).toLowerCase();
    const content = readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const relPath = (relative(cwd, filePath) || filePath).replace(/\\/g, '/');

    for (const rule of activeRules) {
      if (!rule.extensions.includes(ext)) continue;
      const matches = rule.scanFile({ filePath, relPath, ext, content, lines });
      for (const m of matches) {
        findings.push({
          ruleId: rule.ruleId,
          guideId: rule.guideId,
          discipline: rule.discipline,
          severity: rule.severity,
          file: relPath,
          line: m.line,
          snippet: m.snippet,
          message: m.message,
          keepWhen: rule.keepWhen,
          dropWhen: rule.dropWhen
        });
      }
    }
  }

  findings.sort(
    (a, b) => a.file.localeCompare(b.file) || a.line - b.line || a.ruleId.localeCompare(b.ruleId)
  );

  const byRule = {};
  const byGuide = {};
  for (const f of findings) {
    byRule[f.ruleId] = (byRule[f.ruleId] ?? 0) + 1;
    byGuide[f.guideId] = (byGuide[f.guideId] ?? 0) + 1;
  }

  return {
    targetDir: target,
    scannedFiles: files.length,
    ruleCount: activeRules.length,
    totalFindings: findings.length,
    byRule,
    byGuide,
    findings
  };
}
