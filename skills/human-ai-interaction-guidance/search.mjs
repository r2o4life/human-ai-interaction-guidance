/**
 * Offline Hybrid Search Engine for Human-AI Interaction (HAII) Guidance.
 * Combines BM25 (k1 = 1.2, b = 0.75) + TF-IDF Cosine Similarity + Domain Synonym
 * Expansion, fused via Reciprocal Rank Fusion (RRF, k = 60).
 * Zero external dependencies — Node.js >= 22 built-ins only.
 */

import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SKILL_DIR = dirname(fileURLToPath(import.meta.url));

export const BM25_K1 = 1.2;
export const BM25_B = 0.75;
export const RRF_K = 60;

const STOPWORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'of', 'to', 'in', 'for', 'with', 'on', 'by',
  'is', 'are', 'be', 'as', 'it', 'this', 'that', 'from', 'at', 'use', 'using',
  'your', 'you', 'can', 'how', 'when', 'which', 'into', 'not', 'must', 'should',
  'will', 'without', 'before', 'after', 'about', 'all', 'any', 'only', 'than'
]);

/**
 * Curated domain synonym and concept expansion map bridging everyday
 * developer terminology to HAII engineering primitives.
 */
export const DOMAIN_SYNONYMS = new Map([
  // D51 Agentic Experience (AX)
  ['approval', ['escrow', 'confirmation', 'autonomy', 'gate', 'supervised', 'countdown']],
  ['approve', ['escrow', 'confirmation', 'autonomy', 'gate', 'supervised']],
  ['confirm', ['confirmation', 'escrow', 'gate', 'handoff', 'deterministic']],
  ['confirmation', ['escrow', 'gate', 'handoff', 'deterministic', '409']],
  ['destructive', ['escrow', 'rollback', '900s', 'legalhold', 'confirmation', 'saga']],
  ['delete', ['escrow', 'rollback', 'legalhold', '409', 'decommission']],
  ['deletion', ['escrow', 'rollback', 'legalhold', '409', 'decommission']],
  ['rollback', ['escrow', 'undo', 'saga', 'compensation', '900s', 'reversible']],
  ['undo', ['escrow', 'rollback', 'reversible', 'receipt', 'popover']],
  ['cooldown', ['escrow', '900s', 'time-locked', 'countdown', 'rollback']],
  ['escrow', ['time-locked', '900s', 'legalhold', '409', 'rollback', 'saga']],
  ['legal', ['legalhold', '409', 'escrow', 'compliance', 'conflict']],
  ['litigation', ['legalhold', '409', 'escrow', 'conflict']],
  ['409', ['legalhold', 'escrow', 'conflict', 'rollback']],
  ['autonomy', ['ladder', 'advisory', 'suggestive', 'supervised', 'autonomous', 'escrow']],
  ['copilot', ['autonomy', 'ladder', 'suggestive', 'supervised', 'advisory']],
  ['hitl', ['supervised', 'autonomy', 'ladder', 'escrow', 'oversight']],
  ['oversight', ['supervised', 'autonomy', 'ladder', 'agentic', 'governance']],
  ['chat', ['conversational', 'handoff', 'deterministic', 'persona', 'payload']],
  ['chatbot', ['conversational', 'handoff', 'deterministic', 'persona']],
  ['persona', ['conversational', 'handoff', 'deterministic']],
  ['handoff', ['conversational', 'deterministic', 'payload', 'show-your-work']],
  ['reasoning', ['derivation', 'show-your-work', 'hypotheses', 'constraints', 'hash']],
  ['explainability', ['derivation', 'show-your-work', 'provenance', 'hypotheses']],
  ['cot', ['derivation', 'show-your-work', 'hypotheses']],
  ['provenance', ['derivation', 'hash', 'storytelling', 'verification']],
  ['oauth', ['obo', 'delegation', 'privilege', 'attenuation', 'scope', 'rfc8693']],
  ['delegation', ['obo', 'privilege', 'attenuation', 'scope', 'ceiling']],
  ['escalation', ['obo', 'privilege', 'attenuation', 'scope', 'ceiling']],
  ['permissions', ['obo', 'privilege', 'attenuation', 'scope', 'ceiling']],
  ['scope', ['obo', 'privilege', 'attenuation', 'risk', 'reversibility']],
  ['recovery', ['exception', 'repair', 'blast-radius', 'dry-run', 'fault']],
  ['fault', ['exception', 'repair', 'blast-radius', 'cascade', 'alarm']],
  ['error', ['exception', 'repair', 'blast-radius', 'dry-run']],
  ['blast', ['exception', 'repair', 'containment', 'dry-run']],
  ['dry', ['dry-run', 'simulation', 'repair', 'exception']],
  ['toast', ['receipt', 'zero-displacement', 'popover', 'manual', 'scroll']],
  ['notification', ['receipt', 'zero-displacement', 'popover', 'alarm']],
  ['scroll', ['zero-displacement', 'receipt', 'jump', 'popover', 'sticky']],
  ['jump', ['zero-displacement', 'receipt', 'popover', 'anchor']],

  // D25 Content Design & Epistemic Submergence
  ['jargon', ['quarantine', 'submergence', 'habitat', 'observatory', 'plumbing', 'lexical']],
  ['acronym', ['quarantine', 'submergence', 'jargon', 'lexical', 'hygiene']],
  ['acronyms', ['quarantine', 'submergence', 'jargon', 'lexical', 'hygiene']],
  ['plumbing', ['quarantine', 'submergence', 'habitat', 'observatory']],
  ['rls', ['quarantine', 'habitat', 'submergence', 'plumbing']],
  ['cedar', ['quarantine', 'habitat', 'submergence', 'plumbing']],
  ['worm', ['quarantine', 'habitat', 'submergence', 'plumbing']],
  ['spiffe', ['quarantine', 'habitat', 'submergence', 'plumbing']],
  ['scim', ['quarantine', 'habitat', 'submergence', 'plumbing']],
  ['jwt', ['quarantine', 'habitat', 'submergence', 'plumbing']],
  ['observatory', ['habitat', 'submergence', 'quarantine']],
  ['cliche', ['anti-cliche', 'lexical', 'hygiene', 'fluff', 'sentence']],
  ['buzzword', ['anti-cliche', 'lexical', 'hygiene', 'fluff']],
  ['buzzwords', ['anti-cliche', 'lexical', 'hygiene', 'fluff']],
  ['fluff', ['anti-cliche', 'lexical', 'hygiene', 'supercharge']],
  ['supercharge', ['anti-cliche', 'lexical', 'hygiene']],
  ['badges', ['three-act', 'storytelling', 'value', 'craft', 'safety']],
  ['storytelling', ['three-act', 'value', 'craft', 'empirical', 'safety']],
  ['narrative', ['three-act', 'storytelling', 'narration', 'lifecycle']],
  ['button', ['imperative', 'affordance', 'grammar', 'fitts', 'target', '44px']],
  ['cta', ['imperative', 'affordance', 'grammar', 'verb', 'object']],
  ['submit', ['imperative', 'affordance', 'grammar', 'verb', 'reversibility']],
  ['crud', ['micro-atomic', 'lifecycle', 'narration', 'inception', 'decommissioning']],
  ['rehydrate', ['micro-atomic', 'lifecycle', 'narration', 'calibration']],
  ['restore', ['micro-atomic', 'lifecycle', 'narration', 'rollback']],
  ['streaming', ['reading-cadence', 'wpm', 'abort', 'stop', 'reveal', 'cls']],
  ['stream', ['reading-cadence', 'wpm', 'abort', 'stop', 'reveal', 'cls']],
  ['llm', ['reading-cadence', 'streaming', 'wpm', 'abort', 'derivation']],
  ['token', ['reading-cadence', 'streaming', 'obo', 'attenuation']],
  ['abort', ['reading-cadence', 'streaming', 'stop', 'cancel']],
  ['stop', ['reading-cadence', 'streaming', 'abort', 'cancel']],

  // D28 Cognitive Ergonomics & High-Acuity UX
  ['touch', ['fitts', 'moat', '44px', '48px', 'target', 'ergonomics']],
  ['target', ['fitts', 'moat', '44px', '48px', 'hick-hyman']],
  ['spacing', ['fitts', 'moat', 'density', 'ergonomics']],
  ['choice', ['hick-hyman', 'miller', 'working-memory', 'chunks']],
  ['choices', ['hick-hyman', 'miller', 'working-memory', 'chunks']],
  ['memory', ['miller', 'hick-hyman', 'working-memory', 'chunks', 'cascade']],
  ['density', ['hick-hyman', 'fitts', 'halved', 'payoff', 'resting']],
  ['sunlight', ['environmental', 'surface', 'archetypes', 'outdoor', 'contrast', 'glance']],
  ['outdoor', ['environmental', 'surface', 'archetypes', 'sunlight', 'contrast']],
  ['vehicle', ['environmental', 'surface', 'archetypes', 'mounted', 'glance']],
  ['wearable', ['environmental', 'surface', 'archetypes', 'embedded', 'glance']],
  ['foldable', ['environmental', 'surface', 'archetypes', 'viewport']],
  ['contrast', ['environmental', 'surface', 'battlestation', '7:1']],
  ['forecast', ['endsley', 'predictive', 'horizon', 'trajectory', 'uncertainty']],
  ['prediction', ['endsley', 'predictive', 'horizon', 'trajectory', 'uncertainty']],
  ['trajectory', ['endsley', 'predictive', 'horizon', 't+15m', 't+30m']],
  ['uncertainty', ['endsley', 'predictive', 'horizon', 'bounds']],
  ['alert', ['cascade', 'alarm', 'rationalization', 'isa-18.2', 'suppression']],
  ['alerts', ['cascade', 'alarm', 'rationalization', 'isa-18.2', 'suppression']],
  ['alarm', ['cascade', 'rationalization', 'isa-18.2', 'suppression', 'root']],
  ['alarms', ['cascade', 'rationalization', 'isa-18.2', 'suppression', 'root']],
  ['fatigue', ['cascade', 'alarm', 'rationalization', 'suppression']],
  ['flood', ['cascade', 'alarm', 'rationalization', 'suppression']],
  ['emergency', ['battlestation', 'stress-adaptive', 'tunnel', '48px', 'simplify']],
  ['outage', ['battlestation', 'stress-adaptive', 'cascade', 'alarm', 'repair']],
  ['crisis', ['battlestation', 'stress-adaptive', 'tunnel', 'simplify']],
  ['stress', ['stress-adaptive', 'battlestation', 'tunnel', 'chunks']],
  ['panic', ['stress-adaptive', 'battlestation', 'tunnel', '48px']],
  ['replay', ['blackbox', 'temporal', 'scrubbing', 'scrubber', 'timeline', '60fps']],
  ['timeline', ['blackbox', 'temporal', 'scrubbing', 'scrubber', 'playback']],
  ['scrubber', ['blackbox', 'temporal', 'scrubbing', '60fps', 'playback']],
  ['playback', ['blackbox', 'temporal', 'scrubbing', '60fps']],
  ['slider', ['blackbox', 'temporal', 'scrubbing', '60fps']],

  // D29 3-Order Progressive Comprehension
  ['sticky', ['split-stage', '3order', 'companion', '58%', '42%']],
  ['sidebar', ['split-stage', '3order', 'companion', 'sticky']],
  ['companion', ['split-stage', '3order', 'layperson', 'tier']],
  ['layperson', ['split-stage', '3order', 'companion', 'tier', 'progressive']],
  ['3-order', ['split-stage', 'companion', 'progressive', 'comprehension']],
  ['order', ['3-order', 'split-stage', 'companion', 'progressive']],
  ['onboarding', ['expertise', 'graduated', 'scaffolding', 'novice', 'expert']],
  ['novice', ['expertise', 'graduated', 'scaffolding', 'expert', 'layperson']],
  ['expert', ['expertise', 'graduated', 'scaffolding', 'fast-track', 'keyboard']],
  ['scaffolding', ['expertise', 'graduated', 'novice', 'expert']],
  ['shortcut', ['expertise', 'graduated', 'scaffolding', 'keyboard']],
  ['shortcuts', ['expertise', 'graduated', 'scaffolding', 'keyboard']],
  ['payoff', ['happy-path', 'value-payoff', 'halved', 'density', 'disclosure']],
  ['benefits', ['happy-path', 'value-payoff', 'three-act', 'storytelling']],
  ['roi', ['happy-path', 'value-payoff', 'disclosure']],
  ['search', ['anchored', 'floating', 'match', 'windows', 'choice', 'until-found']],
  ['autocomplete', ['anchored', 'floating', 'match', 'windows', 'popover']],
  ['typeahead', ['anchored', 'floating', 'match', 'windows', 'popover']],
  ['accordion', ['anchored', 'floating', 'match', 'windows', 'details']],
  ['find', ['until-found', 'hidden', 'anchored', 'floating', 'match']],
  ['ctrl+f', ['until-found', 'hidden', 'anchored', 'floating', 'match']],
  ['floating', ['anchored', 'match', 'windows', 'popover', 'receipt']]
]);

const PHRASE_EXPANSIONS = [
  [/\blegal\s+hold\b/i, ['legalhold', '409', 'escrow', 'time-locked']],
  [/\bshow\s+your\s+work\b/i, ['show-your-work', 'derivation', 'hypotheses']],
  [/\bon\s+behalf\s+of\b/i, ['obo', 'rfc8693', 'delegation', 'privilege', 'attenuation']],
  [/\bblast\s+radius\b/i, ['blast-radius', 'exception', 'repair', 'containment']],
  [/\bdry\s+run\b/i, ['dry-run', 'simulation', 'exception', 'repair']],
  [/\bbattle\s*station\b/i, ['battlestation', 'stress-adaptive', 'tunnel']],
  [/\balarm\s+(?:fatigue|flood|storm)\b/i, ['cascade', 'alarm', 'rationalization', 'isa-18.2']],
  [/\broot\s+cause\b/i, ['cascade', 'alarm', 'rationalization']],
  [/\bworking\s+memory\b/i, ['miller', 'hick-hyman', 'fitts', 'chunks']],
  [/\btouch\s+target/i, ['fitts', 'moat', '44px', '48px']],
  [/\bfind\s+in\s+page\b/i, ['until-found', 'hidden', 'anchored', 'floating', 'match']],
  [/\b3\s*[- ]?order\b|\bthree\s*[- ]?order\b/i, ['3order', 'split-stage', 'companion']],
  [/\bside\s+by\s+side\b|\btwo\s+column\b/i, ['split-stage', '3order', 'companion', 'sticky']],
  [/\bscroll\s+jump\b|\bwithout\s+moving\s+(?:the\s+)?(?:page|viewport|scroll)/i, ['zero-displacement', 'receipt', 'popover']],
  [/\bhappy\s+path\b/i, ['happy-path', 'value-payoff', 'disclosure']]
];

/**
 * Minimally stem plural English tokens while preserving acronyms and domain slugs.
 */
export function stemWord(word) {
  const len = word.length;
  if (len < 4 || word[len - 1] !== 's') return word;
  const prev = word[len - 2];
  if (prev === 's' || prev === 'u' || prev === 'i') return word;
  if (prev === 'e') {
    if (len > 4 && word[len - 3] === 'i' && word[len - 4] !== 'a' && word[len - 4] !== 'e') {
      return `${word.slice(0, len - 3)}y`;
    }
    if (['a', 'e', 'i', 'o'].includes(word[len - 3])) return word;
    if (word.endsWith('ches') || word.endsWith('shes') || word.endsWith('xes') || word.endsWith('zes')) {
      return word.slice(0, len - 2);
    }
  }
  return word.slice(0, len - 1);
}

/**
 * Tokenize input text into stemmed, stopword-filtered terms.
 * Preserves hyphenated identifiers AND emits component subtokens.
 */
export function tokenize(text) {
  const rawMatches = String(text || '')
    .toLowerCase()
    .match(/[a-z0-9][a-z0-9:+_-]*[a-z0-9]|[a-z0-9]{2,}/g) ?? [];

  const tokens = [];
  for (const raw of rawMatches) {
    const clean = raw.replace(/^[_:-]+|[_:-]+$/g, '');
    if (!clean || clean.length < 2) continue;
    if (!STOPWORDS.has(clean)) {
      tokens.push(stemWord(clean));
    }
    if (clean.includes('-') || clean.includes('_') || clean.includes(':')) {
      for (const part of clean.split(/[-_:]+/)) {
        if (part.length >= 2 && !STOPWORDS.has(part)) {
          tokens.push(stemWord(part));
        }
      }
    }
  }
  return tokens;
}

/**
 * Expand a user query into weighted term entries using raw tokens + domain synonyms.
 */
export function expandQueryTerms(query) {
  const weights = new Map();
  const addTerm = (term, w) => {
    for (const tok of tokenize(term)) {
      const prev = weights.get(tok) ?? 0;
      if (w > prev) weights.set(tok, w);
    }
  };

  const baseTokens = tokenize(query);
  for (const tok of baseTokens) {
    weights.set(tok, Math.max(weights.get(tok) ?? 0, 1.0));
    const syns = DOMAIN_SYNONYMS.get(tok);
    if (syns) {
      for (const syn of syns) addTerm(syn, 0.55);
    }
  }

  for (const [pattern, expansions] of PHRASE_EXPANSIONS) {
    if (pattern.test(query)) {
      for (const exp of expansions) addTerm(exp, 0.75);
    }
  }

  return weights;
}

let cachedData = null;

function resolveGenDir() {
  return join(SKILL_DIR, 'gen');
}

function loadSearchAssets() {
  if (cachedData) return cachedData;
  const genDir = resolveGenDir();
  const indexPath = join(genDir, 'search-index.json');
  const guidesPath = join(genDir, 'guides.json');

  if (!existsSync(indexPath) || !existsSync(guidesPath)) {
    throw new Error(
      `Search index not built yet. Run "node ${join(SKILL_DIR, 'build-index.mjs')}" first.`
    );
  }

  const searchIndex = JSON.parse(readFileSync(indexPath, 'utf8'));
  const guidesPayload = JSON.parse(readFileSync(guidesPath, 'utf8'));
  const guideMap = new Map(guidesPayload.guides.map((g) => [g.id, g]));

  cachedData = { searchIndex, guidesPayload, guideMap };
  return cachedData;
}

export function clearSearchCache() {
  cachedData = null;
}

function rankBm25(bm25, weightedQueryTerms, allowedIds) {
  const N = bm25.docs.length;
  const k1 = bm25.k1 ?? BM25_K1;
  const b = bm25.b ?? BM25_B;
  const avgLen = bm25.avgDocLength || 1;
  const scored = [];

  for (const doc of bm25.docs) {
    if (allowedIds && !allowedIds.has(doc.id)) continue;
    let score = 0;
    for (const [term, qWeight] of weightedQueryTerms.entries()) {
      const tf = doc.freqs[term];
      if (!tf) continue;
      const df = bm25.docFreq[term] ?? 0;
      const idf = Math.log(1 + (N - df + 0.5) / (df + 0.5));
      const num = tf * (k1 + 1);
      const den = tf + k1 * (1 - b + b * (doc.length / avgLen));
      score += qWeight * idf * (num / den);
    }
    if (score > 0) scored.push({ id: doc.id, score });
  }

  scored.sort((a, bDoc) => bDoc.score - a.score || a.id.localeCompare(bDoc.id));
  return scored;
}

function rankCosine(tfidf, weightedQueryTerms, allowedIds) {
  const qVec = new Map();
  let qNormSq = 0;

  for (const [term, qWeight] of weightedQueryTerms.entries()) {
    const idf = tfidf.idf[term];
    if (!idf) continue;
    const w = qWeight * idf;
    qVec.set(term, w);
    qNormSq += w * w;
  }

  const qNorm = Math.sqrt(qNormSq);
  if (qNorm === 0) return [];

  const scored = [];
  for (const doc of tfidf.docs) {
    if (allowedIds && !allowedIds.has(doc.id)) continue;
    let dot = 0;
    for (const [term, qVal] of qVec.entries()) {
      const dVal = doc.weights[term];
      if (dVal) dot += (qVal / qNorm) * dVal;
    }
    if (dot > 0) scored.push({ id: doc.id, score: dot });
  }

  scored.sort((a, bDoc) => bDoc.score - a.score || a.id.localeCompare(bDoc.id));
  return scored;
}

/**
 * Hybrid search over compiled HAII guides.
 * @param {string} query
 * @param {{ limit?: number, category?: string, discipline?: string }} [options]
 */
export function searchGuides(query, options = {}) {
  const { limit = 10, category, discipline } = options;
  const trimmed = String(query || '').trim();
  if (!trimmed) return [];

  const { searchIndex, guidesPayload, guideMap } = loadSearchAssets();

  let allowedIds = null;
  if (category || discipline) {
    allowedIds = new Set(
      guidesPayload.guides
        .filter((g) => (!category || g.category === category) && (!discipline || g.discipline === discipline))
        .map((g) => g.id)
    );
  }

  const weightedQueryTerms = expandQueryTerms(trimmed);
  if (weightedQueryTerms.size === 0) return [];

  const bm25Ranked = rankBm25(searchIndex.bm25, weightedQueryTerms, allowedIds);
  const cosineRanked = rankCosine(searchIndex.tfidf, weightedQueryTerms, allowedIds);

  const bm25Map = new Map(bm25Ranked.map((r, idx) => [r.id, { rank: idx, score: r.score }]));
  const cosineMap = new Map(cosineRanked.map((r, idx) => [r.id, { rank: idx, score: r.score }]));

  const candidateIds = new Set([...bm25Map.keys(), ...cosineMap.keys()]);
  const fused = [];

  for (const id of candidateIds) {
    let rrfScore = 0;
    const bEntry = bm25Map.get(id);
    const cEntry = cosineMap.get(id);
    if (bEntry) rrfScore += 1 / (RRF_K + bEntry.rank + 1);
    if (cEntry) rrfScore += 1 / (RRF_K + cEntry.rank + 1);

    const guide = guideMap.get(id);
    if (!guide) continue;

    fused.push({
      id: guide.id,
      title: guide.title,
      discipline: guide.discipline,
      category: guide.category,
      kind: guide.kind,
      description: guide.description,
      score: Number(rrfScore.toFixed(6)),
      bm25Score: Number((bEntry?.score ?? 0).toFixed(4)),
      cosineScore: Number((cEntry?.score ?? 0).toFixed(4))
    });
  }

  fused.sort((a, b) => b.score - a.score || b.bm25Score - a.bm25Score || a.id.localeCompare(b.id));
  return fused.slice(0, Math.max(1, limit));
}
