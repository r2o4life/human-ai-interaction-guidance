/**
 * HAII Guidance Automated Evaluation Harness.
 * Verifies:
 *   1. All multi-agent manifests & Antigravity strict plugin.json schema
 *   2. Guide corpus integrity across all 27 guides (D51: 8, D25: 7, D28: 7, D29: 5)
 *   3. 30-prompt natural-language retrieval benchmark (Recall@3 >= 0.95, MRR >= 0.85)
 *   4. Static scanner benchmark against anti-pattern & golden fixtures (0 false positives)
 * Emits evals/latest-eval-report.json.
 */

import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildIndex, parseYamlFrontmatter } from '../skills/human-ai-interaction-guidance/build-index.mjs';
import { runHaiiAudit } from '../skills/human-ai-interaction-guidance/haii-scan.mjs';
import { searchGuides } from '../skills/human-ai-interaction-guidance/search.mjs';

const EVALS_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(EVALS_DIR, '..');
const SKILL_DIR = join(REPO_ROOT, 'skills/human-ai-interaction-guidance');
const REPORT_PATH = join(EVALS_DIR, 'latest-eval-report.json');

const STRICT_ANTIGRAVITY_PLUGIN_KEYS = new Set([
  'name',
  'displayName',
  'description',
  'logo',
  'suggestedPrompts',
  'author',
  'homepage',
  'repository',
  'license',
  'keywords',
  'version'
]);

const EXPECTED_DISCIPLINE_COUNTS = {
  D51: 8,
  D25: 7,
  D28: 7,
  D29: 5
};

const SEEDED_ANTI_PATTERN_RULES = [
  'haii-habitat-a-jargon-leak',
  'haii-destructive-ai-no-escrow',
  'haii-unbounded-stream-no-stop',
  'haii-scroll-jump-displacement',
  'haii-auto-expanding-search-accordion',
  'haii-banned-ai-cliche-copy',
  'haii-ai-output-no-derivation',
  'haii-missing-reduced-motion',
  'haii-undersized-touch-target',
  'haii-unrationalized-alarm-flood',
  'haii-missing-3order-disclosures',
  'haii-generic-button-label'
];

/**
 * 30 realistic developer prompts across D51, D25, D28, and D29.
 * None of these prompts contain any guide ID substring.
 */
const RETRIEVAL_PROMPTS = [
  {
    prompt: 'user triggers bulk customer deletion from AI tool needs 15 minute cooldown timer and undo window',
    expected: ['time-locked-autonomy-escrow-gate']
  },
  {
    prompt: 'decide when AI assistant should only suggest changes versus acting automatically with human approval',
    expected: ['four-tier-autonomy-ladder']
  },
  {
    prompt: 'convert freeform chatbot reply into structured confirmation payload stripping friendly persona',
    expected: ['conversational-to-deterministic-handoff']
  },
  {
    prompt: 'show operator the model version constraints tested hypotheses and verification hash behind AI output',
    expected: ['show-your-work-derivation-trees']
  },
  {
    prompt: 'stop AI worker from escalating OAuth permissions beyond logged in user token scope ceiling',
    expected: ['agentic-obo-privilege-attenuation']
  },
  {
    prompt: 'when automated workflow step fails midway preview blast radius and offer dry run recovery path',
    expected: ['ax-exception-repair-tree']
  },
  {
    prompt: 'display floating confirmation toast after background mutation with undo button and zero scroll jump',
    expected: ['zero-displacement-agent-receipts']
  },
  {
    prompt: 'architecture principles for supervising autonomous agents with clear human control gates',
    expected: ['agentic-experience']
  },
  {
    prompt: 'stop leaking RLS Cedar WORM SPIFFE and SCIM acronyms into consumer UI copy',
    expected: ['dual-habitat-jargon-quarantine']
  },
  {
    prompt: 'separate plain language user frontstage from technical audit observatory screen',
    expected: ['epistemic-submergence', 'dual-habitat-jargon-quarantine']
  },
  {
    prompt: 'strip AI marketing buzzwords like supercharge and unlock and keep sentences under 18 words',
    expected: ['anti-cliche-lexical-hygiene']
  },
  {
    prompt: 'replace floating marketing trust badges with three act craft empirical truth and safety story',
    expected: ['three-act-value-storytelling']
  },
  {
    prompt: 'rewrite generic Submit and OK buttons to name verb target object and reversibility risk',
    expected: ['imperative-affordance-grammar']
  },
  {
    prompt: 'narrate create update delete and session restore states as human lifecycle steps instead of CRUD',
    expected: ['micro-atomic-lifecycle-narration']
  },
  {
    prompt: 'pace token by token LLM streaming output at comfortable reading cadence with instant cancel button',
    expected: ['reading-cadence-ai-streaming']
  },
  {
    prompt: 'size touch buttons at 44px minimum add hit moats and cap choices for human working memory',
    expected: ['fitts-moat-and-hick-hyman-budgets']
  },
  {
    prompt: 'adapt contrast ratio above 7 to 1 and glance readability for outdoor sunlit tablets and vehicle screens',
    expected: ['environmental-surface-archetypes']
  },
  {
    prompt: 'add 15 minute and 30 minute forward trajectory forecast bands with uncertainty intervals to operator view',
    expected: ['endsley-predictive-horizon-projection']
  },
  {
    prompt: 'suppress storm of secondary alerts into single root cause summary within working memory limits',
    expected: ['cascade-alarm-rationalization']
  },
  {
    prompt: 'simplify interface during active production crisis hiding sidebars and enlarging emergency buttons to 48px',
    expected: ['stress-adaptive-battlestation-mode']
  },
  {
    prompt: 'build smooth 60fps incident replay timeline slider scrubbing historical bookmarks and future forecast',
    expected: ['blackbox-temporal-event-scrubbing']
  },
  {
    prompt: 'quantitative human factors standard for operator workload contrast and decision speed',
    expected: ['cognitive-ergonomics']
  },
  {
    prompt: 'create sticky two column layout with interactive workbench left and three tier explainer sidebar right',
    expected: ['split-stage-3order-companion']
  },
  {
    prompt: 'gradually fade onboarding hints for expert operators while keeping keyboard shortcuts quiet',
    expected: ['expertise-graduated-scaffolding']
  },
  {
    prompt: 'present concrete multi step user benefits alongside interactive controls inside halved resting density',
    expected: ['happy-path-value-payoff-disclosure']
  },
  {
    prompt: 'project live search matches in CSS anchored floating popover instead of auto opening accordions',
    expected: ['anchored-floating-match-windows']
  },
  {
    prompt: 'layered instructional design standard progressing from layperson to multi actor coordinator to steward',
    expected: ['progressive-comprehension', 'split-stage-3order-companion']
  },
  {
    prompt: 'return 409 conflict when active compliance hold blocks agent rollback or destructive purge',
    expected: ['time-locked-autonomy-escrow-gate']
  },
  {
    prompt: 'ensure closed technical detail sections still open automatically on browser Ctrl F find in page',
    expected: ['anchored-floating-match-windows']
  },
  {
    prompt: 'keep viewport completely stationary when staging changes while offering opt in jump link inside receipt',
    expected: ['zero-displacement-agent-receipts']
  }
];

function validateManifests() {
  const checks = [];

  const checkJson = (relPath, validator) => {
    const full = join(REPO_ROOT, relPath);
    try {
      if (!existsSync(full)) throw new Error('File does not exist');
      const parsed = JSON.parse(readFileSync(full, 'utf8'));
      validator(parsed);
      checks.push({ path: relPath, valid: true });
    } catch (err) {
      checks.push({ path: relPath, valid: false, error: err.message });
    }
  };

  checkJson('package.json', (pkg) => {
    if (pkg.name !== 'human-ai-interaction-guidance') throw new Error('Invalid package name');
    if (pkg.type !== 'module') throw new Error('package.json must have type: module');
    if (!pkg.bin?.['haii-guidance']) throw new Error('Missing bin.haii-guidance');
    if (!pkg.engines?.node?.includes('22')) throw new Error('Missing Node >= 22 engine constraint');
  });

  checkJson('plugin.json', (plugin) => {
    const keys = Object.keys(plugin);
    for (const k of keys) {
      if (!STRICT_ANTIGRAVITY_PLUGIN_KEYS.has(k)) {
        throw new Error(`Disallowed unknown key in plugin.json: "${k}"`);
      }
    }
    for (const req of ['name', 'displayName', 'description', 'logo', 'suggestedPrompts', 'author', 'homepage', 'repository', 'license', 'keywords', 'version']) {
      if (!(req in plugin)) throw new Error(`Missing required key "${req}" in plugin.json`);
    }
    if (!Array.isArray(plugin.suggestedPrompts) || plugin.suggestedPrompts.length !== 3) {
      throw new Error('plugin.json suggestedPrompts must contain exactly 3 strings');
    }
  });

  checkJson('gemini-extension.json', (m) => {
    if (m.name !== 'human-ai-interaction-guidance') throw new Error('Invalid name');
  });
  checkJson('.claude-plugin/plugin.json', (m) => {
    if (m.name !== 'human-ai-interaction-guidance') throw new Error('Invalid name');
  });
  checkJson('.claude-plugin/marketplace.json', (m) => {
    if (!Array.isArray(m.plugins) || m.plugins.length === 0) throw new Error('Missing plugins array');
  });
  checkJson('.codex-plugin/plugin.json', (m) => {
    if (m.name !== 'human-ai-interaction-guidance' || !m.interface?.displayName) {
      throw new Error('Missing name or interface');
    }
  });
  checkJson('.cursor-plugin/plugin.json', (m) => {
    if (m.name !== 'human-ai-interaction-guidance') throw new Error('Invalid name');
  });
  checkJson('.github/plugin/plugin.json', (m) => {
    if (m.name !== 'human-ai-interaction-guidance') throw new Error('Invalid name');
  });
  checkJson('.agents/plugins/marketplace.json', (m) => {
    if (!Array.isArray(m.plugins) || m.plugins.length === 0) throw new Error('Missing plugins array');
  });

  // Validate SKILL.md frontmatter
  try {
    const skillText = readFileSync(join(SKILL_DIR, 'SKILL.md'), 'utf8');
    const { frontmatter } = parseYamlFrontmatter(skillText, 'SKILL.md');
    if (frontmatter.name !== 'human-ai-interaction-guidance') {
      throw new Error('SKILL.md frontmatter name mismatch');
    }
    if (!frontmatter.description || frontmatter.description.length > 1024) {
      throw new Error(`SKILL.md description missing or > 1024 chars (${frontmatter.description?.length})`);
    }
    checks.push({ path: 'skills/human-ai-interaction-guidance/SKILL.md', valid: true });
  } catch (err) {
    checks.push({ path: 'skills/human-ai-interaction-guidance/SKILL.md', valid: false, error: err.message });
  }

  // Validate policy & logo & LICENSE
  for (const [relPath, mustContain] of [
    ['policies/haii-guidance.toml', 'haii-guidance'],
    ['assets/logo.svg', '<svg'],
    ['LICENSE', 'Apache License']
  ]) {
    try {
      const content = readFileSync(join(REPO_ROOT, relPath), 'utf8');
      if (!content.includes(mustContain)) throw new Error(`Missing expected marker "${mustContain}"`);
      checks.push({ path: relPath, valid: true });
    } catch (err) {
      checks.push({ path: relPath, valid: false, error: err.message });
    }
  }

  const validManifests = checks.filter((c) => c.valid).length;
  return {
    totalManifests: checks.length,
    validManifests,
    passed: validManifests === checks.length,
    checks
  };
}

function runRetrievalBenchmark(allGuideIds) {
  let hitsAt1 = 0;
  let hitsAt3 = 0;
  let reciprocalRankSum = 0;
  const failures = [];

  for (const item of RETRIEVAL_PROMPTS) {
    for (const id of allGuideIds) {
      if (item.prompt.toLowerCase().includes(id.toLowerCase())) {
        throw new Error(`Eval prompt leaks guide ID "${id}": "${item.prompt}"`);
      }
    }

    const results = searchGuides(item.prompt, { limit: 10 });
    const rankIdx = results.findIndex((r) => item.expected.includes(r.id));
    if (rankIdx === 0) hitsAt1 += 1;
    if (rankIdx >= 0 && rankIdx < 3) hitsAt3 += 1;
    if (rankIdx >= 0) reciprocalRankSum += 1 / (rankIdx + 1);

    if (rankIdx === -1 || rankIdx >= 3) {
      failures.push({
        prompt: item.prompt,
        expected: item.expected,
        top3: results.slice(0, 3).map((r) => r.id)
      });
    }
  }

  const totalPrompts = RETRIEVAL_PROMPTS.length;
  const recallAt1 = Number((hitsAt1 / totalPrompts).toFixed(4));
  const recallAt3 = Number((hitsAt3 / totalPrompts).toFixed(4));
  const mrr = Number((reciprocalRankSum / totalPrompts).toFixed(4));

  return {
    totalPrompts,
    recallAt1,
    recallAt3,
    mrr,
    passed: recallAt3 >= 0.95 && mrr >= 0.85,
    failures
  };
}

function runAuditBenchmark() {
  const antiDir = join(EVALS_DIR, 'fixtures/anti-patterns');
  const goldenDir = join(EVALS_DIR, 'fixtures/golden');

  const antiFiles = readdirSync(antiDir).length;
  const goldenFiles = readdirSync(goldenDir).length;

  const antiAudit = runHaiiAudit('evals/fixtures/anti-patterns', {
    cwd: REPO_ROOT,
    includeDocsAndTests: true
  });
  const detectedRules = new Set(antiAudit.findings.map((f) => f.ruleId));
  const detectedViolations = SEEDED_ANTI_PATTERN_RULES.filter((r) => detectedRules.has(r)).length;
  const totalSeededViolations = SEEDED_ANTI_PATTERN_RULES.length;
  const recallRate = Number((detectedViolations / totalSeededViolations).toFixed(4));

  const goldenAudit = runHaiiAudit('evals/fixtures/golden', {
    cwd: REPO_ROOT,
    includeDocsAndTests: true
  });
  const falsePositives = goldenAudit.totalFindings;

  return {
    antiPatternFiles: antiFiles,
    totalSeededViolations,
    detectedViolations,
    recallRate,
    goldenFiles,
    falsePositives,
    passed: recallRate >= 0.95 && falsePositives === 0,
    missedRules: SEEDED_ANTI_PATTERN_RULES.filter((r) => !detectedRules.has(r)),
    goldenFindings: goldenAudit.findings
  };
}

async function main() {
  const manifestChecks = validateManifests();
  const { guidesPayload } = buildIndex();

  const disciplineMismatch = [];
  for (const [disc, expectedCount] of Object.entries(EXPECTED_DISCIPLINE_COUNTS)) {
    const found = guidesPayload.disciplines.find((d) => d.id === disc)?.count ?? 0;
    if (found !== expectedCount) {
      disciplineMismatch.push(`${disc}: expected ${expectedCount}, found ${found}`);
    }
  }

  const allGuideIds = guidesPayload.guides.map((g) => g.id);
  const retrievalBench = runRetrievalBenchmark(allGuideIds);
  const auditBench = runAuditBenchmark();

  const corpusPassed = guidesPayload.totalGuides === 27 && disciplineMismatch.length === 0;
  const overallPassed =
    corpusPassed && manifestChecks.passed && retrievalBench.passed && auditBench.passed;

  const report = {
    version: guidesPayload.version,
    timestamp: new Date().toISOString(),
    totalGuides: guidesPayload.totalGuides,
    retrievalBench: {
      totalPrompts: retrievalBench.totalPrompts,
      recallAt1: retrievalBench.recallAt1,
      recallAt3: retrievalBench.recallAt3,
      mrr: retrievalBench.mrr,
      passed: retrievalBench.passed
    },
    auditBench: {
      antiPatternFiles: auditBench.antiPatternFiles,
      totalSeededViolations: auditBench.totalSeededViolations,
      detectedViolations: auditBench.detectedViolations,
      recallRate: auditBench.recallRate,
      goldenFiles: auditBench.goldenFiles,
      falsePositives: auditBench.falsePositives,
      passed: auditBench.passed
    },
    manifestChecks: {
      totalManifests: manifestChecks.totalManifests,
      validManifests: manifestChecks.validManifests,
      passed: manifestChecks.passed
    },
    overallPassed
  };

  writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2) + '\n', 'utf8');

  console.log('=== HAII Guidance Eval Summary ===');
  console.log(`Guides: ${guidesPayload.totalGuides}/27 (${guidesPayload.disciplines.map((d) => `${d.id}:${d.count}`).join(', ')})`);
  console.log(`Manifests: ${manifestChecks.validManifests}/${manifestChecks.totalManifests} valid`);
  console.log(
    `Retrieval (${retrievalBench.totalPrompts} prompts): Recall@1=${(retrievalBench.recallAt1 * 100).toFixed(1)}%, Recall@3=${(retrievalBench.recallAt3 * 100).toFixed(1)}%, MRR=${retrievalBench.mrr}`
  );
  console.log(
    `Static Audit: ${auditBench.detectedViolations}/${auditBench.totalSeededViolations} seeded rules (${(auditBench.recallRate * 100).toFixed(1)}%), Golden FP=${auditBench.falsePositives}`
  );

  if (disciplineMismatch.length > 0) {
    console.error('Discipline mismatches:', disciplineMismatch.join('; '));
  }
  if (!manifestChecks.passed) {
    console.error('Manifest failures:', manifestChecks.checks.filter((c) => !c.valid));
  }
  if (retrievalBench.failures.length > 0) {
    console.error('Retrieval misses (outside Top-3):', JSON.stringify(retrievalBench.failures, null, 2));
  }
  if (auditBench.missedRules.length > 0) {
    console.error('Missed audit rules:', auditBench.missedRules);
  }
  if (auditBench.goldenFindings.length > 0) {
    console.error('Golden false positives:', JSON.stringify(auditBench.goldenFindings, null, 2));
  }

  if (!overallPassed) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(`Eval runner error: ${err.message}`);
  process.exit(1);
});
