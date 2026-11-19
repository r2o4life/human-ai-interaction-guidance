/**
 * Zero-dependency HAII Guide Compiler & Search Index Builder.
 * Parses YAML frontmatter and H2 sections across all guides under `guides/`,
 * validates required schema fields, and emits `gen/guides.json` + `gen/search-index.json`.
 */

import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { BM25_B, BM25_K1, clearSearchCache, tokenize } from './search.mjs';

const SKILL_DIR = dirname(fileURLToPath(import.meta.url));
const GUIDES_DIR = join(SKILL_DIR, 'guides');
const GEN_DIR = join(SKILL_DIR, 'gen');
const VERSION_PATH = join(SKILL_DIR, 'skill-version.txt');

const REQUIRED_FIELDS = [
  'id',
  'title',
  'discipline',
  'category',
  'kind',
  'description',
  'keywords',
  'triggers',
  'provenance',
  'maturity'
];

const DISCIPLINE_META = {
  D51: {
    id: 'D51',
    category: 'agentic-experience',
    title: 'Agentic Experience (AX) & Supervisory Governance'
  },
  D25: {
    id: 'D25',
    category: 'epistemic-submergence',
    title: 'Content Design & Epistemic Submergence'
  },
  D28: {
    id: 'D28',
    category: 'cognitive-ergonomics',
    title: 'Quantitative Human Factors & Cognitive Ergonomics'
  },
  D29: {
    id: 'D29',
    category: 'progressive-comprehension',
    title: 'Instructional Design & 3-Order Progressive Comprehension'
  }
};

function stripQuotes(val) {
  const trimmed = val.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

/**
 * Minimal deterministic YAML frontmatter parser supporting scalar strings,
 * inline arrays (`[a, b]`), dash-list arrays, and folded/literal multiline strings.
 */
export function parseYamlFrontmatter(rawText, filePath = '<guide>') {
  const normalized = rawText.replace(/\r\n/g, '\n');
  if (!normalized.startsWith('---\n')) {
    throw new Error(`${filePath}: missing opening YAML frontmatter delimiter '---'`);
  }
  const endIdx = normalized.indexOf('\n---\n', 4);
  if (endIdx === -1) {
    throw new Error(`${filePath}: missing closing YAML frontmatter delimiter '---'`);
  }

  const fmText = normalized.slice(4, endIdx);
  const body = normalized.slice(endIdx + 5);
  const lines = fmText.split('\n');
  const data = {};

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim() || line.trimStart().startsWith('#')) {
      i++;
      continue;
    }

    const kvMatch = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!kvMatch) {
      throw new Error(`${filePath}: invalid frontmatter line ${i + 2}: "${line}"`);
    }

    const [, key, restRaw] = kvMatch;
    const rest = restRaw.trim();

    if (rest === '|' || rest === '>') {
      const blockLines = [];
      i++;
      while (i < lines.length && (/^\s+/.test(lines[i]) || lines[i].trim() === '')) {
        blockLines.push(lines[i].replace(/^\s{2}/, ''));
        i++;
      }
      data[key] =
        rest === '>'
          ? blockLines.map((l) => l.trim()).filter(Boolean).join(' ')
          : blockLines.join('\n').trim();
      continue;
    }

    if (rest.startsWith('[') && rest.endsWith(']')) {
      const inner = rest.slice(1, -1).trim();
      data[key] = inner
        ? inner.split(',').map((item) => stripQuotes(item)).filter(Boolean)
        : [];
      i++;
      continue;
    }

    if (rest === '') {
      const items = [];
      let j = i + 1;
      while (j < lines.length) {
        const nextLine = lines[j];
        if (!nextLine.trim()) {
          j++;
          continue;
        }
        const itemMatch = nextLine.match(/^\s*-\s+(.+)$/);
        if (itemMatch) {
          items.push(stripQuotes(itemMatch[1]));
          j++;
        } else {
          break;
        }
      }
      data[key] = items;
      i = j;
      continue;
    }

    data[key] = stripQuotes(rest);
    i++;
  }

  return { frontmatter: data, body, rawMarkdown: normalized };
}

/**
 * Split Markdown body by H1 and top-level H2 headings while ignoring code fences.
 */
function parseMarkdownSections(body, filePath) {
  const lines = body.split('\n');
  let h1Title = '';
  const sections = new Map();
  let currentHeading = null;
  let currentLines = [];
  let inFence = false;

  const flush = () => {
    if (currentHeading !== null) {
      sections.set(currentHeading, currentLines.join('\n').trim());
    }
  };

  for (const line of lines) {
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
    }
    if (!inFence) {
      const h1Match = line.match(/^#\s+(.+)$/);
      if (h1Match && !h1Title) {
        h1Title = h1Match[1].trim();
        continue;
      }
      const h2Match = line.match(/^##\s+(.+)$/);
      if (h2Match) {
        flush();
        currentHeading = h2Match[1].trim();
        currentLines = [];
        continue;
      }
    }
    if (currentHeading !== null) {
      currentLines.push(line);
    }
  }
  flush();

  if (!h1Title) {
    throw new Error(`${filePath}: missing top-level '# <Title>' heading`);
  }

  const getSection = (...candidates) => {
    for (const [heading, content] of sections.entries()) {
      const norm = heading.toLowerCase().replace(/\s+/g, ' ').trim();
      if (candidates.some((c) => norm === c)) return content;
    }
    return '';
  };

  const overview = getSection('overview');
  const decisionRulesMarkdown = getSection('decision rules');
  const implementationPatternMarkdown = getSection('implementation pattern');
  const guidelinesMarkdown = getSection('guidelines');
  const verificationMarkdown = getSection('verification & fallbacks', 'verification and fallbacks');
  const relatedGuidesRaw = getSection('related guides');

  const missing = [];
  if (!overview) missing.push('## Overview');
  if (!decisionRulesMarkdown) missing.push('## Decision Rules');
  if (!implementationPatternMarkdown) missing.push('## Implementation Pattern');
  if (!guidelinesMarkdown) missing.push('## Guidelines');
  if (!verificationMarkdown) missing.push('## Verification & Fallbacks');
  if (!relatedGuidesRaw) missing.push('## Related Guides');

  if (missing.length > 0) {
    throw new Error(`${filePath}: missing required section(s): ${missing.join(', ')}`);
  }

  return {
    h1Title,
    overview,
    decisionRulesMarkdown,
    implementationPatternMarkdown,
    guidelinesMarkdown,
    verificationMarkdown,
    relatedGuidesRaw
  };
}

function extractRelatedGuideIds(relatedMarkdown, selfId, validIds) {
  const candidates = new Set();

  for (const match of relatedMarkdown.matchAll(/retrieve\s+["'`]([^"'`]+)["'`]/gi)) {
    for (const token of match[1].split(/[\s,;]+/)) {
      if (token) candidates.add(token.trim());
    }
  }

  for (const match of relatedMarkdown.matchAll(/`([a-z0-9]+(?:-[a-z0-9]+)+)`/g)) {
    candidates.add(match[1]);
  }

  for (const match of relatedMarkdown.matchAll(/\*\*([a-z0-9]+(?:-[a-z0-9]+)+)\*\*/g)) {
    candidates.add(match[1]);
  }

  const resolved = [];
  for (const id of candidates) {
    if (id !== selfId && validIds.has(id)) {
      resolved.push(id);
    }
  }
  return resolved;
}

function collectGuideFiles(dir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      files.push(...collectGuideFiles(full));
    } else if (st.isFile() && entry.endsWith('.md')) {
      files.push(full);
    }
  }
  return files.sort();
}

function buildSearchIndex(guides) {
  const docFreq = new Map();
  const bm25Docs = [];

  for (const g of guides) {
    const weightedSegments = [
      { text: `${g.id} ${g.title}`, weight: 4 },
      { text: `${g.keywords.join(' ')} ${g.triggers.join(' ')} ${g.description}`, weight: 3 },
      { text: `${g.overview} ${g.discipline} ${g.category}`, weight: 2 },
      { text: `${g.decisionRulesMarkdown}\n${g.guidelinesMarkdown}\n${g.verificationMarkdown}`, weight: 1 }
    ];

    const freqs = new Map();
    let totalLen = 0;

    for (const seg of weightedSegments) {
      const tokens = tokenize(seg.text);
      for (const tok of tokens) {
        freqs.set(tok, (freqs.get(tok) ?? 0) + seg.weight);
        totalLen += seg.weight;
      }
    }

    for (const term of freqs.keys()) {
      docFreq.set(term, (docFreq.get(term) ?? 0) + 1);
    }

    bm25Docs.push({
      id: g.id,
      discipline: g.discipline,
      category: g.category,
      length: totalLen,
      freqs: Object.fromEntries(freqs)
    });
  }

  const N = bm25Docs.length || 1;
  const avgDocLength = bm25Docs.reduce((acc, d) => acc + d.length, 0) / N;

  const idfMap = new Map();
  for (const [term, df] of docFreq.entries()) {
    idfMap.set(term, Math.log(1 + N / df));
  }

  const tfidfDocs = bm25Docs.map((doc) => {
    const rawWeights = new Map();
    let normSq = 0;

    for (const [term, tf] of Object.entries(doc.freqs)) {
      const idf = idfMap.get(term) ?? 0;
      const w = (1 + Math.log(tf)) * idf;
      rawWeights.set(term, w);
      normSq += w * w;
    }

    const norm = Math.sqrt(normSq) || 1;
    const normalizedWeights = {};
    for (const [term, w] of rawWeights.entries()) {
      normalizedWeights[term] = Number((w / norm).toFixed(6));
    }

    return {
      id: doc.id,
      weights: normalizedWeights
    };
  });

  return {
    bm25: {
      k1: BM25_K1,
      b: BM25_B,
      avgDocLength: Number(avgDocLength.toFixed(4)),
      docFreq: Object.fromEntries(docFreq),
      docs: bm25Docs
    },
    tfidf: {
      idf: Object.fromEntries([...idfMap.entries()].map(([k, v]) => [k, Number(v.toFixed(6))])),
      docs: tfidfDocs
    }
  };
}

/**
 * Compile all guide markdown files into `gen/guides.json` and `gen/search-index.json`.
 */
export function buildIndex() {
  const version = readFileSync(VERSION_PATH, 'utf8').trim();
  const files = collectGuideFiles(GUIDES_DIR);
  if (files.length === 0) {
    throw new Error(`No guide markdown files found under ${GUIDES_DIR}`);
  }

  const parsedDrafts = [];
  const seenIds = new Set();

  for (const filePath of files) {
    const rel = relative(GUIDES_DIR, filePath);
    const raw = readFileSync(filePath, 'utf8');
    const { frontmatter, body, rawMarkdown } = parseYamlFrontmatter(raw, rel);

    for (const field of REQUIRED_FIELDS) {
      const val = frontmatter[field];
      if (
        val === undefined ||
        val === null ||
        (typeof val === 'string' && !val.trim()) ||
        (Array.isArray(val) && val.length === 0)
      ) {
        throw new Error(`${rel}: missing or empty required frontmatter field '${field}'`);
      }
    }

    const expectedId = basename(filePath, '.md');
    if (frontmatter.id !== expectedId) {
      throw new Error(`${rel}: frontmatter id '${frontmatter.id}' does not match filename '${expectedId}'`);
    }
    if (seenIds.has(frontmatter.id)) {
      throw new Error(`${rel}: duplicate guide id '${frontmatter.id}'`);
    }
    seenIds.add(frontmatter.id);

    const expectedCategory = basename(dirname(filePath));
    if (frontmatter.category !== expectedCategory) {
      throw new Error(`${rel}: frontmatter category '${frontmatter.category}' does not match directory '${expectedCategory}'`);
    }

    const disciplineMeta = DISCIPLINE_META[frontmatter.discipline];
    if (!disciplineMeta) {
      throw new Error(`${rel}: unsupported discipline '${frontmatter.discipline}'`);
    }
    if (disciplineMeta.category !== frontmatter.category) {
      throw new Error(`${rel}: discipline '${frontmatter.discipline}' requires category '${disciplineMeta.category}', got '${frontmatter.category}'`);
    }

    if (!['discipline', 'use-case'].includes(frontmatter.kind)) {
      throw new Error(`${rel}: kind must be 'discipline' or 'use-case', got '${frontmatter.kind}'`);
    }

    const sections = parseMarkdownSections(body, rel);
    parsedDrafts.push({ frontmatter, sections, rawMarkdown });
  }

  const guides = parsedDrafts.map(({ frontmatter, sections, rawMarkdown }) => ({
    id: frontmatter.id,
    title: frontmatter.title,
    discipline: frontmatter.discipline,
    category: frontmatter.category,
    kind: frontmatter.kind,
    description: frontmatter.description,
    keywords: Array.isArray(frontmatter.keywords) ? frontmatter.keywords : [String(frontmatter.keywords)],
    triggers: Array.isArray(frontmatter.triggers) ? frontmatter.triggers : [String(frontmatter.triggers)],
    provenance: Array.isArray(frontmatter.provenance) ? frontmatter.provenance : [String(frontmatter.provenance)],
    maturity: frontmatter.maturity,
    overview: sections.overview,
    decisionRulesMarkdown: sections.decisionRulesMarkdown,
    implementationPatternMarkdown: sections.implementationPatternMarkdown,
    guidelinesMarkdown: sections.guidelinesMarkdown,
    verificationMarkdown: sections.verificationMarkdown,
    relatedGuides: extractRelatedGuideIds(sections.relatedGuidesRaw, frontmatter.id, seenIds),
    rawMarkdown
  }));

  const disciplineCounts = new Map();
  for (const g of guides) {
    disciplineCounts.set(g.discipline, (disciplineCounts.get(g.discipline) ?? 0) + 1);
  }

  const disciplines = Object.values(DISCIPLINE_META).map((meta) => ({
    ...meta,
    count: disciplineCounts.get(meta.id) ?? 0
  }));

  const generatedAt = new Date().toISOString();
  const guidesPayload = {
    version,
    generatedAt,
    totalGuides: guides.length,
    disciplines,
    guides
  };

  const searchIndexPayload = {
    version,
    generatedAt,
    totalDocs: guides.length,
    ...buildSearchIndex(guides)
  };

  mkdirSync(GEN_DIR, { recursive: true });
  writeFileSync(join(GEN_DIR, 'guides.json'), JSON.stringify(guidesPayload, null, 2) + '\n', 'utf8');
  writeFileSync(join(GEN_DIR, 'search-index.json'), JSON.stringify(searchIndexPayload) + '\n', 'utf8');
  clearSearchCache();

  return { guidesPayload, searchIndexPayload };
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  try {
    const { guidesPayload } = buildIndex();
    const counts = guidesPayload.disciplines.map((d) => `${d.id}=${d.count}`).join(', ');
    console.log(`Built HAII index: ${guidesPayload.totalGuides} guides (${counts})`);
  } catch (err) {
    console.error(`build-index failed: ${err.message}`);
    process.exit(1);
  }
}
