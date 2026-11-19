#!/usr/bin/env node
/**
 * Human-AI Interaction (HAII) Guidance CLI.
 * Zero external dependencies — Node.js >= 22 built-ins only.
 */

import { cpSync, existsSync, fstatSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir, tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { runHaiiAudit } from './haii-scan.mjs';
import { searchGuides } from './search.mjs';

const [NODE_MAJOR] = process.versions.node.split('.').map(Number);
if (Number.isNaN(NODE_MAJOR) || NODE_MAJOR < 22) {
  console.error(
    `human-ai-interaction-guidance requires Node.js >= 22 (current: ${process.version}).`
  );
  process.exit(1);
}

const SKILL_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(SKILL_DIR, '../..');
const GEN_DIR = join(SKILL_DIR, 'gen');
const GUIDES_DIR = join(SKILL_DIR, 'guides');
const MAX_INLINE_STDOUT_BYTES = 9500;

function readVersion() {
  const pkgPath = join(REPO_ROOT, 'package.json');
  if (existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
      if (pkg.version) return pkg.version;
    } catch {
      // fall through
    }
  }
  const svPath = join(SKILL_DIR, 'skill-version.txt');
  return existsSync(svPath) ? readFileSync(svPath, 'utf8').trim() : '1.0.0';
}

function loadCompiledGuides() {
  const guidesJsonPath = join(GEN_DIR, 'guides.json');
  if (!existsSync(guidesJsonPath)) {
    throw new Error(
      `Compiled guide index missing at ${guidesJsonPath}. Run "npm run build" or "node ${join(SKILL_DIR, 'build-index.mjs')}" first.`
    );
  }
  return JSON.parse(readFileSync(guidesJsonPath, 'utf8'));
}

function isStdoutRedirectedToFile() {
  try {
    return fstatSync(1).isFile();
  } catch {
    return false;
  }
}

function writeTmpGuideBundle(content) {
  const filename = `haii-guide-${process.pid}-${Date.now()}.md`;
  for (const dir of [...new Set([tmpdir(), '/tmp'])]) {
    try {
      if (!existsSync(dir)) continue;
      const outPath = join(dir, filename);
      writeFileSync(outPath, content, 'utf8');
      return outPath;
    } catch {
      // try next candidate
    }
  }
  return null;
}

function printHelp() {
  console.log(`
Usage: haii-guidance <command> [options]

Commands:
  search "<query>"               Hybrid BM25 + TF-IDF + RRF search across HAII guides
  retrieve "<id[,id2]>"          Retrieve full markdown guide(s) by ID(s)
  list                           List all HAII guides grouped by discipline
  audit <path>                   Audit .html/.jsx/.tsx/.js/.ts/.css against 12 HAII rules (alias: haii-scan)
  install                        Install HAII Guidance into Antigravity, Claude, Cursor, Codex, or workspace
  version                        Show package version

Options:
  --limit <n>                    Maximum search results (default: 10)
  --category <category>          Filter by category (agentic-experience, epistemic-submergence, cognitive-ergonomics, progressive-comprehension)
  --discipline <D51|D25|D28|D29> Filter by discipline ID
  --guide <id>                   Filter audit rules to a single guide ID
  --include-docs-and-tests       Include test fixtures during directory audit
  --json                         Emit machine-readable JSON output
  --target <name>                Install target: antigravity | claude | cursor | codex | workspace | all (default: antigravity)
  --dry-run                      Preview install destinations without writing files
  --skill-version <ver>          Skill version metadata passed by agent harness
  -v, --version                  Print version
  -h, --help                     Print help
`);
}

function runInstall(targetName, dryRun) {
  const validTargets = ['antigravity', 'claude', 'cursor', 'codex', 'workspace', 'all'];
  const target = (targetName || 'antigravity').toLowerCase();
  if (!validTargets.includes(target)) {
    console.error(`Unknown install target "${target}". Valid: ${validTargets.join(', ')}`);
    process.exit(1);
  }

  const chosen =
    target === 'all'
      ? ['antigravity', 'claude', 'cursor', 'codex', 'workspace']
      : [target];

  const home = homedir();
  const plan = [];

  for (const t of chosen) {
    if (t === 'antigravity') {
      const dest = join(home, '.gemini/config/plugins/human-ai-interaction-guidance');
      plan.push({
        target: t,
        dest,
        actions: [
          { src: join(REPO_ROOT, 'plugin.json'), dst: join(dest, 'plugin.json') },
          { src: join(REPO_ROOT, 'README.md'), dst: join(dest, 'README.md') },
          { src: join(REPO_ROOT, 'LICENSE'), dst: join(dest, 'LICENSE') },
          { src: join(REPO_ROOT, 'assets/logo.svg'), dst: join(dest, 'assets/logo.svg') },
          { src: join(REPO_ROOT, 'policies/haii-guidance.toml'), dst: join(dest, 'policies/haii-guidance.toml') },
          { src: SKILL_DIR, dst: join(dest, 'skills/human-ai-interaction-guidance'), dir: true }
        ]
      });
    } else if (t === 'claude') {
      const dest = join(home, '.claude/skills/human-ai-interaction-guidance');
      plan.push({ target: t, dest, actions: [{ src: SKILL_DIR, dst: dest, dir: true }] });
    } else if (t === 'cursor') {
      const dest = join(home, '.cursor/skills/human-ai-interaction-guidance');
      plan.push({ target: t, dest, actions: [{ src: SKILL_DIR, dst: dest, dir: true }] });
    } else if (t === 'codex') {
      const dest = join(home, '.codex/skills/human-ai-interaction-guidance');
      plan.push({ target: t, dest, actions: [{ src: SKILL_DIR, dst: dest, dir: true }] });
    } else if (t === 'workspace') {
      const dest = join(process.cwd(), '.agents/skills/human-ai-interaction-guidance');
      plan.push({ target: t, dest, actions: [{ src: SKILL_DIR, dst: dest, dir: true }] });
    }
  }

  for (const entry of plan) {
    console.log(`[${dryRun ? 'dry-run' : 'install'}] target=${entry.target} -> ${entry.dest}`);
    for (const act of entry.actions) {
      if (!existsSync(act.src)) {
        throw new Error(`Missing source asset for install: ${act.src}`);
      }
      if (dryRun) {
        console.log(`  would copy ${act.dir ? '(dir)' : '(file)'} ${act.src} -> ${act.dst}`);
      } else {
        mkdirSync(dirname(act.dst), { recursive: true });
        cpSync(act.src, act.dst, { recursive: Boolean(act.dir), force: true });
        console.log(`  installed ${act.dst}`);
      }
    }
  }
}

async function main() {
  const { values, positionals } = parseArgs({
    args: process.argv.slice(2),
    options: {
      help: { type: 'boolean', short: 'h' },
      version: { type: 'boolean', short: 'v' },
      json: { type: 'boolean' },
      limit: { type: 'string' },
      category: { type: 'string' },
      discipline: { type: 'string' },
      guide: { type: 'string' },
      'include-docs-and-tests': { type: 'boolean' },
      target: { type: 'string' },
      'dry-run': { type: 'boolean' },
      'skill-version': { type: 'string' }
    },
    allowPositionals: true,
    strict: false
  });

  if (values.version || positionals[0] === 'version') {
    console.log(readVersion());
    return;
  }

  if (values.help || positionals.length === 0 || positionals[0] === 'help') {
    printHelp();
    process.exit(values.help || positionals[0] === 'help' ? 0 : 1);
  }

  const command = positionals[0];
  const rest = positionals.slice(1);

  if (command === 'search') {
    const query = rest.join(' ').trim();
    if (!query) {
      console.error('Error: search requires a non-empty query string.');
      process.exit(1);
    }
    const limit = values.limit ? parseInt(String(values.limit), 10) : 10;
    const results = searchGuides(query, {
      limit: Number.isFinite(limit) && limit > 0 ? limit : 10,
      category: typeof values.category === 'string' ? values.category : undefined,
      discipline: typeof values.discipline === 'string' ? values.discipline : undefined
    });
    console.log(JSON.stringify(results, null, 2));
    return;
  }

  if (command === 'list') {
    const data = loadCompiledGuides();
    let guides = data.guides;
    if (typeof values.category === 'string') {
      guides = guides.filter((g) => g.category === values.category);
    }
    if (typeof values.discipline === 'string') {
      guides = guides.filter((g) => g.discipline === values.discipline);
    }

    if (values.json) {
      const compact = guides.map(({ id, title, discipline, category, kind, description }) => ({
        id,
        title,
        discipline,
        category,
        kind,
        description
      }));
      console.log(JSON.stringify(compact, null, 2));
      return;
    }

    console.log(`Human-AI Interaction Guidance v${data.version} — ${guides.length} guides\n`);
    for (const g of guides) {
      console.log(`[${g.discipline}/${g.category}] ${g.id} (${g.kind}) — ${g.description}`);
    }
    return;
  }

  if (command === 'retrieve') {
    const rawIds = rest.join(' ');
    const ids = [
      ...new Set(
        rawIds
          .split(/[\s,;]+/)
          .map((s) => s.replace(/^["']+|["']+$/g, '').trim())
          .filter(Boolean)
      )
    ];

    if (ids.length === 0) {
      console.error('Error: retrieve requires at least one guide ID.');
      process.exit(1);
    }

    const data = loadCompiledGuides();
    const guideMap = new Map(data.guides.map((g) => [g.id, g]));
    const sections = [];
    let hasMissing = false;

    for (const id of ids) {
      const meta = guideMap.get(id);
      if (!meta) {
        console.error(`Guide not found: ${id}`);
        hasMissing = true;
        continue;
      }
      const mdPath = join(GUIDES_DIR, meta.category, `${id}.md`);
      const content = existsSync(mdPath) ? readFileSync(mdPath, 'utf8') : meta.rawMarkdown;
      sections.push(`--- Guide for ${id} ---\n${content.trim()}`);
    }

    if (sections.length > 0) {
      const combined = sections.join('\n\n') + '\n';
      const totalBytes = Buffer.byteLength(combined, 'utf8');
      if (totalBytes > MAX_INLINE_STDOUT_BYTES && !isStdoutRedirectedToFile()) {
        const tmpPath = writeTmpGuideBundle(combined);
        if (tmpPath) {
          const lineCount = combined.split('\n').length - 1;
          const sizeKb = (totalBytes / 1024).toFixed(1);
          console.log(
            `Output (${sizeKb} KB, ${lineCount} lines) saved to ${tmpPath} to prevent CLI stdout truncation.\nRead ${tmpPath} in full using your file-reading tool (${lineCount} lines total).`
          );
        } else {
          console.log(combined);
        }
      } else {
        console.log(combined);
      }
    }

    if (hasMissing) process.exit(1);
    return;
  }

  if (command === 'audit' || command === 'haii-scan') {
    const targetPath = rest[0] || '.';
    const report = runHaiiAudit(targetPath, {
      cwd: process.cwd(),
      guideId: typeof values.guide === 'string' ? values.guide : undefined,
      includeDocsAndTests: Boolean(values['include-docs-and-tests'])
    });

    if (values.json) {
      console.log(JSON.stringify(report, null, 2));
      return;
    }

    console.log(
      `HAII Audit (${report.targetDir}): scanned ${report.scannedFiles} file(s) across ${report.ruleCount} rules -> ${report.totalFindings} finding(s).\n`
    );
    for (const f of report.findings) {
      console.log(
        `[${f.severity.toUpperCase()}] ${f.ruleId} (${f.discipline} / ${f.guideId}) @ ${f.file}:${f.line}`
      );
      console.log(`  ${f.message}`);
      console.log(`  keepWhen: ${f.keepWhen}`);
      console.log(`  dropWhen: ${f.dropWhen}\n`);
    }
    return;
  }

  if (command === 'install') {
    runInstall(
      typeof values.target === 'string' ? values.target : 'antigravity',
      Boolean(values['dry-run'])
    );
    return;
  }

  console.error(`Unknown command: ${command}`);
  printHelp();
  process.exit(1);
}

main().catch((err) => {
  console.error(`haii-guidance failed: ${err.message}`);
  process.exit(1);
});
