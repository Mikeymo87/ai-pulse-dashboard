import Papa from 'papaparse';
import { extractRowThemes } from './themes.js';

// ─── Normalization helpers ──────────────────────────────────────────────────

function normalizeSentiment(v) {
  if (!v) return null;
  v = v.trim();
  if (v === 'Positive') return 'Positive';
  if (v.includes('both positive and negative')) return 'Mixed';
  if (v.includes('not sure how I feel')) return 'Unsure';
  if (v === 'Negative') return 'Negative';
  return null;
}

// Maps raw familiarity string → 1–5 numeric scale
function normalizeFamiliarity(v) {
  if (!v || !v.trim()) return null;
  v = v.trim();
  if (v.includes('unfamiliar')) return 1;
  if (v.includes('heard of them')) return 2;
  if (v.includes('know a bit')) return 3;
  if (v.includes('understand AI tools well')) return 4;
  if (v.includes('highly knowledgeable')) return 5;
  return null;
}

// Maps raw frequency string → standard label
function normalizeFrequency(v) {
  if (!v || !v.trim()) return null;
  v = v.trim();
  if (v === 'Daily') return 'Daily';
  if (v === 'At least once per week') return 'Weekly';
  if (v === 'At least once per month') return 'Monthly';
  if (v === 'Rarely (Less than once per month)') return 'Rarely';
  if (v === 'Never') return 'Never';
  return null; // handles '0.250' data error and blanks
}

/**
 * Maps confidence label → 1–5 numeric.
 * S1 scale tops out at "Very Confident" = 5.
 * S2+S3 scale: "Extremely Confident" = 5, "Very Confident" = 4.
 */
function normalizeConfidence(v, survey) {
  if (!v || !v.trim()) return null;
  v = v.trim();
  if (survey === 1) {
    const map = {
      'Very Confident': 5,
      'Confident': 4,
      'Somewhat confident': 3,
      'Not confident at all': 2,
    };
    return map[v] ?? null;
  }
  const map = {
    'Extremely Confident': 5,
    'Very Confident': 4,
    'Confident': 3,
    'Somewhat confident': 2,
    'Not confident at all': 1,
  };
  return map[v] ?? null;
}

// ─── Wave 4 ladders (builder, team use) → ordinal score, "I'm not sure" → null ──
// Matched by option prefix so light punctuation edits in the form don't break it.
// Each level accepts several prefixes: the live Wave 4 wording first, then the 9/8 draft wording
// so a revert in the form still parses. Dan's 9/9 edits are the live wording.
function straightQuotes(v) { return (v || '').replace(/\u2019/g, "'").trim(); }
function ladder(v, levels) {
  const t = straightQuotes(v).toLowerCase();
  if (!t) return null;
  for (let i = 0; i < levels.length; i++) {
    const prefixes = Array.isArray(levels[i]) ? levels[i] : [levels[i]];
    if (prefixes.some(p => t.startsWith(p.toLowerCase()))) return i + 1;
  }
  return null;
}
// Q5 (4 rungs since Dan's 9/9 cut; the "workflows or automations" rung is gone)
const BUILDER_LEVELS = [
  ['I mainly use AI chat tools', 'I use AI tools to ask'],
  ['I use AI in more structured ways', 'I create reusable AI assistants'],
  ['I build AI agents'],
  ['I build AI solutions that other people'],
];
// Q6 (5 rungs)
const TEAM_LEVELS = [
  ['AI is rarely or not used'],
  ['People mostly use AI on their own'],
  ['We use AI for some common'],
  ['AI is part of some of our regular'],
  ['AI is integrally built into', 'AI is built into how our team'],
];
export const BUILDER_LABELS = { 1: 'Chat tools for one-off tasks', 2: 'Projects, saved prompts, Custom GPTs', 3: 'Builds agents', 4: 'Builds solutions others use' };
export const TEAM_LABELS    = { 1: 'Rarely or not used by team', 2: 'Individual use only', 3: 'Some common team tasks', 4: 'Part of some team workflows', 5: 'Built into team workflows' };

// ─── Q7 Human contributions (new in Wave 4, checkboxes, max 3, Other) ────────
// Each option is "<contribution> - <gloss>"; the gloss has commas, so match on the contribution
// phrase instead of splitting the cell. Write-ins (Other) are whatever is left after removing
// every matched option text.
export const HUMAN_CANON = [
  { label: 'Judgment and decision-making',           s4: 'Judgment and decision-making - knowing what is right, useful or appropriate' },
  { label: 'Strategic thinking',                     s4: 'Strategic thinking - seeing the bigger picture and making connections' },
  { label: 'Creativity and original point of view',  s4: 'Creativity and original point of view - bringing new ideas, perspective and imagination' },
  { label: 'Critical thinking',                      s4: 'Critical thinking - questioning assumptions, evaluating information and knowing when AI may be wrong' },
  { label: 'Empathy and relationship-building',      s4: 'Empathy and relationship-building - understanding people, emotions and context' },
  { label: 'Taste and quality judgment',             s4: 'Taste and quality judgment - recognizing what is strong, distinctive and on-brand' },
  { label: 'Experience and subject-matter expertise',s4: 'Experience and subject-matter expertise - applying knowledge that comes from doing the work' },
  { label: 'Communication and storytelling',         s4: 'Communication and storytelling - influencing, persuading and making ideas meaningful' },
  { label: 'Ethics and accountability',              s4: 'Ethics and accountability - applying human values and taking responsibility for outcomes' },
  { label: 'Curiosity and adaptability',             s4: 'Curiosity and adaptability - continuing to learn and adjust as technology changes' },
  { label: 'Orchestration',                          s4: 'Orchestration - knowing how to combine people, AI and tools to get the best result' },
];
function normalizeHumanContrib(v) {
  const t = straightQuotes(v);
  if (!t) return { picks: [], other: [] };
  const picks = HUMAN_CANON.filter(h => t.includes(h.label)).map(h => h.label);
  let rest = t;
  for (const h of HUMAN_CANON) { rest = rest.replace(h.s4, '').replace(h.label, ''); }
  const other = rest.split(',').map(x => x.trim()).filter(x => x && x !== '-' && x.length > 2);
  return { picks, other };
}

// Tolerant header lookup for the Wave 4 sheet: first column whose title starts with the prefix
// (case-insensitive, curly apostrophes normalized). Wave 1–3 mappers keep exact keys.
function pick(r, ...prefixes) {
  const keys = Object.keys(r);
  for (const prefix of prefixes) {
    const p = straightQuotes(prefix).toLowerCase();
    const k = keys.find(key => straightQuotes(key).toLowerCase().startsWith(p));
    if (k !== undefined) return r[k];
  }
  return undefined;
}

// Maps full stage string → short label (S2 + S3)
function normalizeStage(v) {
  if (!v || !v.trim()) return null;
  v = v.trim();
  if (v.startsWith('Curiosity')) return 'Curiosity';
  if (v.startsWith('Understanding')) return 'Understanding';
  if (v.startsWith('Experimentation')) return 'Experimentation';
  if (v.startsWith('Integration')) return 'Integration';
  if (v.startsWith('Transformation')) return 'Transformation';
  return null;
}

// Maps full momentum string → short label (S3 only)
function normalizeMomentum(v) {
  if (!v || !v.trim()) return null;
  v = v.trim();
  if (v.startsWith('Steady')) return 'Steady';
  if (v.startsWith('Accelerating')) return 'Accelerating';
  if (v.startsWith('Inconsistent')) return 'Inconsistent / Siloed';
  return null;
}

/**
 * Barrier classification — three-pass fuzzy matching:
 *   1. Exact match against the known structured option text
 *   2. Prefix match (handles CSV-truncated long strings)
 *   3. Keyword/substring search (catches free-text and S3 novel phrasing)
 *
 * This ensures equivalent barriers across S1/S2/S3 map to the same
 * category even when the answer option wording changed between surveys.
 */
const BARRIER_CATEGORIES = [
  {
    label: 'No barriers',
    exact: [
      'None; I feel there are no barriers',
      'None, I feel there are no barriers',
      'None',
      'I feel there are no barriers',
      "None. I don't currently face meaningful barriers",
      "I use it as a resource so currently haven't encountered any barriers",
    ],
    keywords: ['no barrier', 'feel there are no', "haven't encountered any barrier", 'meaningful barriers'],
  },
  {
    label: 'Lack of training',
    exact: ['Lack of understanding or training', 'Lack of training or knowledge'],
    keywords: ['lack of understanding', 'lack of training', 'lack of knowledge', 'need.*training', 'need.*education', 'fully understanding', 'improper training', 'better trained'],
  },
  {
    label: 'Limited access',
    exact: ['Limited access to AI tools', 'Limited access to the AI tools I need'],
    keywords: ['limited access', 'access to ai tools', 'gain access', 'access to certain tools', 'cost of.*tools', 'pay for.*tools'],
  },
  {
    label: 'Accuracy concerns',
    exact: ['Concerns about accuracy or reliability', 'IP concerns', 'Concerns about AI accuracy or reliability'],
    keywords: ['accuracy', 'reliability', 'accurate', 'reliable', 'ip concern', 'not 100%', 'human judgment'],
  },
  {
    label: 'Fear of mistakes',
    exact: ['Fear of making mistakes with AI', 'Fear of making a mistake when using AI'],
    keywords: ['fear of making mistakes', 'fear of mistakes', 'making mistakes with ai', 'fear of making a mistake', 'making a mistake when using ai'],
  },
  {
    label: 'Manager support',
    exact: ["My manager doesn't use AI and isn't encouraging it", 'My manager does not regularly use or encourage AI'],
    keywords: ['my manager', 'manager does not', "manager doesn't", 'manager support'],
  },
  {
    label: 'Job security',
    exact: [
      'I am afraid that it will negatively affect my job',
      'I am afraid AI will replace me',
      "I'm concerned AI could negatively affect my job",
      "I'm concerned AI could eventually replace my job",
    ],
    keywords: ['replace me', 'negatively affect my job', 'afraid ai will', 'take my job', 'job security', 'replace my job'],
  },
  {
    label: 'Workflow resistance',
    exact: [
      'I am not ready to make that kind of change to my workflow',
      'Unsure of the best way to integrate AI into my workflow',
      "I'm not ready to change my current workflow",
    ],
    keywords: ['not ready.*change', 'change to my workflow', 'unsure of the best way', 'integrate ai into my workflow', 'hesitation', 'adoption.*team'],
  },
  {
    label: 'Old habits',
    exact: ['Hard to break old habits', "It's hard to break old habits or change the way I work"],
    keywords: ['old habit', 'break.*habit', 'hard to break'],
  },
  {
    label: 'Not relevant',
    exact: [
      "I don't see AI as relevant to my work",       // straight apostrophe
      "I don\u2019t see AI as relevant to my work",  // curly apostrophe (Google Forms export)
    ],
    keywords: ['not relevant', "don't see ai as relevant", "don\u2019t see ai as relevant", 'how ai is relevant', 'relevant to my work'],
  },
  {
    label: 'Unaware of permissions',
    exact: ['I was not aware that I was allowed to use AI', "I'm not sure what AI use is allowed", "I\u2019m not sure what AI use is allowed"],
    keywords: ['not aware.*allowed', 'allowed to use ai', "didn't know i could", 'what ai use is allowed'],
  },
  {
    label: 'Lack of time',
    exact: ['Lack of time / competing priorities', 'Lack of time or competing priorities'],
    keywords: [
      'lack of time', 'competing priorities', 'not enough time', 'too busy',
      'limited time', 'making the time', 'time to learn', 'time to really',
      'time to focus', 'finding time', 'requires time',
    ],
  },
  {
    label: 'Privacy / compliance',
    exact: ['Concerns about privacy / PHI / compliance', 'Privacy, PHI, security or compliance concerns'],
    keywords: ['privacy', 'phi', 'compliance', 'hipaa', 'patient data', 'sensitive data', 'data upload'],
  },
  {
    label: 'Too many tools',
    exact: ['Too many tools/not sure which to use', "There are too many tools and I'm not sure which ones to use"],
    keywords: ['too many tools', 'not sure which tool', 'which tool to use', 'too many options', 'overwhelm.*tool', 'grow too rapid', 'tools grow'],
  },
  {
    label: 'IT / access blocks',
    exact: [],
    keywords: [
      't&d', 't & d', 'network control', '3rd party', 'third party',
      'blocked by', 'prohibit', 'restrict.*download', 'bhsf network',
      'integration across', 'not allowing 3rd', 'baptist health block',
      'it block', 'system integrat', 'constrained by', 'connectors',
    ],
  },
  {
    label: 'Unclear guidelines',
    exact: ["Unclear guidelines on what's allowed (policy/guardrails)", 'Unclear policies or guardrails'],
    keywords: ['unclear guidelines', 'guardrail', 'what.*allowed', 'legalities', 'company policy', 'bh rules', 'figuring out when', 'when to use', 'to what extent'],
  },
];

function classifyBarrierSegment(segment) {
  segment = straightQuotes(segment);
  if (!segment) return null;
  const lower = segment.toLowerCase();

  for (const cat of BARRIER_CATEGORIES) {
    // Pass 1: exact match
    if (cat.exact.includes(segment)) return cat.label;

    // Pass 2: prefix match (handles truncated CSV strings)
    if (cat.exact.some(e => segment.startsWith(e) || e.startsWith(segment))) return cat.label;

    // Pass 3: keyword/substring fuzzy match (supports simple .* patterns)
    if (cat.keywords.some(kw => {
      if (kw.includes('.*')) {
        try { return new RegExp(kw, 'i').test(lower); } catch { return false; }
      }
      return lower.includes(kw.toLowerCase());
    })) return cat.label;
  }

  return null; // genuinely unclassifiable
}

/**
 * Splits a multi-select barrier field (comma-separated) and normalizes
 * each segment. Deduplicates so "None, I feel there are no barriers"
 * doesn't double-count "No barriers".
 */
function normalizeBarriers(v) {
  if (!v || !v.trim()) return [];
  const segments = v.split(',').map(s => s.trim()).filter(Boolean);
  const categories = segments.map(classifyBarrierSegment).filter(Boolean);
  return [...new Set(categories)];
}

// Fix known tool name typos/variants so counts consolidate correctly
function normalizeTool(t) {
  t = t.trim();
  if (!t) return null;
  // Filter out non-tool strings (sentence fragments, "None" variants, filler)
  const lower = t.toLowerCase();
  if (lower.startsWith('none')) return null;
  if (lower.startsWith('and ')) return null;
  if (lower.startsWith('suite of')) return null;
  if (lower.startsWith('nano banana')) return null;
  if (t.length > 50) return null; // too long to be a tool name
  // Normalize variants — one canonical label per tool across all waves
  if (t === 'Claud (Anthropic)' || t === 'Claude (Anthropic)' || t === 'Anthropic Claude') return 'Claude';
  if (t === 'NotebookLM.Google' || t === 'Notebook LM' || /^Gemini Notebook/i.test(t)) return 'NotebookLM';
  if (t === 'Gemini (Google)' || t === 'Google Gemini') return 'Gemini';
  if (t === 'Grok (xAI)' || t === 'xAI Grok' || t === 'SpaceXAi Grok') return 'Grok';
  if (t === 'Llama (Meta AI)' || t === 'Meta Llama') return 'Llama';
  if (t === 'Copilot (Microsoft)') return 'Copilot';
  if (t === 'ChatGPT (OpenAI)') return 'ChatGPT';
  if (t === 'WISPR Flow' || t === 'Wispr' || t === 'VSPR Flow') return 'Wispr Flow';
  if (t === 'google AI studio') return 'Google AI Studio';
  if (t === 'Answer The Public' || t === 'AnswerThePublic') return 'AnswerThePublic';
  if (t === 'CODEX') return 'Codex';
  if (t === 'Genny Lovo AI' || t === 'Genny LOVO') return 'Genny (LOVO)';
  if (t === 'Eleven Labs' || t === 'ElevenLabs') return 'ElevenLabs';
  if (t === 'N8N') return 'n8n';
  if (t === 'Perplexity AI') return 'Perplexity';
  return t;
}

function normalizeTools(v) {
  if (!v || !v.trim()) return [];
  return v.split(',').map(s => normalizeTool(s.trim())).filter(Boolean);
}

/**
 * S3 benefits: Use prefix matching against known options because the
 * long benefit strings themselves contain commas, making split-by-comma
 * unreliable for parsing.
 */
// Each canonical label maps to its Wave 3 option prefix and its Wave 4 option text.
export const BENEFIT_CANON = [
  { label: 'Saves time / reduces busywork',            s3: 'Saves time / reduces busywork',            s4: 'Saves me time or reduces busywork' },
  { label: 'Improves quality / polish',                s3: 'Improves quality / polish',                s4: 'Improves the quality or polish of my work' },
  { label: 'Idea generation / creative acceleration', s3: 'Idea generation / creative acceleration', s4: 'Helps me generate ideas or accelerate creative work' },
  { label: 'Research and synthesis',                   s3: 'Research and synthesis',                   s4: 'Helps with research, synthesis or understanding information' },
  { label: 'Strategic thought partner',                s3: 'Strategic thought partner',                s4: 'Serves as a strategic thought partner' },
  { label: 'Speed to decision',                        s3: 'Speed to decision',                        s4: 'Helps me make decisions faster' },
  { label: 'Communication clarity',                    s3: 'Communication clarity',                    s4: 'Improves the clarity of my communications' },
  { label: 'Confidence / reduced anxiety',             s3: 'Confidence / reduced anxiety',             s4: 'Increases my confidence or reduces anxiety about a task' },
  { label: 'Learning / upskilling',                    s3: 'Learning / upskilling',                    s4: 'Helps me learn or build new skills' },
  { label: 'Collaboration',                            s3: 'Collaboration',                            s4: 'Improves collaboration' },
  { label: 'Enablement / accessibility',               s3: 'Enablement / accessibility',               s4: 'Makes work or information more accessible' },
  { label: 'More meaningful work',                     s3: 'More meaningful work',                     s4: 'Allows me to spend more time on meaningful or higher-value work' },
  { label: 'No meaningful benefits',                   s3: 'I have found no benefits from AI',         s4: 'I have not experienced meaningful benefits' },
];

function normalizeBenefits(v) {
  if (!v || !v.trim()) return [];
  const t = straightQuotes(v);
  return BENEFIT_CANON.filter(b => t.includes(b.s3) || t.includes(b.s4)).map(b => b.label);
}

// S3 role normalization
function normalizeRole(v) {
  if (!v || !v.trim()) return null;
  v = v.trim();
  if (v.toLowerCase() === 'designer') return 'Designer';
  if (v.toLowerCase() === 'ea') return 'EA';
  if (/^assistant vice president$/i.test(v)) return 'AVP';
  if (/^vice president$/i.test(v)) return 'VP';
  return v;
}

// S3 function normalization — collapse noise/free-text to null
function normalizeFunction(v) {
  if (!v || !v.trim()) return null;
  v = v.trim();
  const noise = [
    'n/a',
    'we work across almost all of these areas!',
    'department leader',
    'comms',
  ];
  if (noise.includes(v.toLowerCase())) return null;
  // Merge Hospital / Hospital Care / Hospital Marketing variants
  if (['hospital', 'hospital care', 'hospital marketing'].includes(v.toLowerCase())) {
    return 'Hospital Marketing';
  }
  if (/^social media & reputation( management)?$/i.test(v)) return 'Social Media & Reputation';
  return v;
}

// ─── Data sources ────────────────────────────────────────────────────────────
// S1: local CSV — the Google Sheet has extra rows not in the original 97-response export.
//     Keep as local file to preserve the verified 97-response dataset.
// S2: live Google Sheet — 106 responses, matches verified count.
// S3: live Google Sheet — survey closed April 2026; data is final (101 responses).

// S4: live Google Sheet — survey in the field Sep 14–25, 2026. Paste the published-CSV URL into
//     S4_URL below (same pattern as s2/s3). Until then S4 is off and the app renders 3 waves.
//     Dev overrides: ?s4=sample (36 synthetic rows, past the flip), ?s4=early (14 rows, below the flip),
//     ?s4=empty (header only, the Monday-morning state). Never deploy with any of these as the source.
const S4_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTrL_H8F6IgLLRILHWiwOuJQUHQM-8w9QNViNoWbvLPb7P0ai0tnuhIYdwxoyMw8iePib9KRr57K47t/pub?gid=1894577232&single=true&output=csv';

function resolveS4Source() {
  // Dev-server only (import.meta.env.DEV): the ?s4= switches let the smoke test exercise every state
  // regardless of what S4_URL holds. Production builds ignore the query string entirely.
  const isDev = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV;
  if (isDev && typeof window !== 'undefined') {
    const q = new URLSearchParams(window.location.search).get('s4');
    if (q === 'off')    return null;                              // force the 3-wave dashboard
    if (q === 'sample') return '/data/survey4.sample.csv';        // 36 synthetic rows: past the headline flip
    if (q === 'early')  return '/data/survey4.sample-early.csv';  // 14 synthetic rows: in the field, below the flip
    if (q === 'empty')  return '/data/survey4.sample-empty.csv';  // header only: linked sheet, no responses yet
    if (q && /^https?:/.test(q)) return q;
  }
  const env = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_S4_URL) || '';
  if (env) return env;
  if (S4_URL) return S4_URL;
  return null;
}

const DATA_SOURCES = {
  s1: '/data/survey1.csv',
  s2: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSB9O1TzD7Ipk50nBG2wHFLlVytf1aaEgcWYeEMLuyAUTF4aXMFU8ByFfFHGP74QzbyOJOaSZqaBHUK/pub?gid=1201512326&single=true&output=csv',
  s3: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQUECRMQEP6QtXVcxHz7JyQ00KBIkzk6O0fkEZYcS4JiLfx4WpITntvj8yu4j1FbOulU_sbKyftd3E1/pub?gid=220500472&single=true&output=csv',
};

// ─── CSV fetch ──────────────────────────────────────────────────────────────

function fetchParsed(url) {
  return new Promise((resolve, reject) => {
    Papa.parse(url, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: ({ data }) => resolve(data),
      error: err => reject(err),
    });
  });
}

// ─── Per-survey row mappers ─────────────────────────────────────────────────

function mapS1(raw) {
  return raw
    .filter(r => r['Timestamp']?.trim())
    .map(r => {
      const row = {
        survey: 1,
        period: 'Jan–Feb 2025',
        timestamp: r['Timestamp'].trim(),
        sentiment: normalizeSentiment(r['How would you describe your current feelings about Artificial Intelligence (AI)?']),
        familiarity: normalizeFamiliarity(r['How would you best describe your familiarity with AI tools and their applications in marketing & communications?']),
        frequency: normalizeFrequency(r['How often do you currently use AI tools (e.g., ChatGPT, Grammarly, Microsoft Copilot) in your work? Choose the option that most closely reflects your usage.']),
        barriers: normalizeBarriers(r['What do you think are the biggest barriers to using AI effectively in your role? (Select up to 2 options)']),
        importance: parseInt(r['How important is AI to the success of your individual or team work over the next 12 months?'], 10) || null,
        confidence: normalizeConfidence(r['How confident are you today in your ability to use AI tools effectively in your role?'], 1),
        openEnded: r['How do you see AI tools changing the way you work in the future? If you already use AI, what specific tasks or processes do you currently use it for?']?.trim() || null,
        // Fields that exist only in later surveys
        stage: null,
        momentum: null,
        tools: [],
        benefits: [],
        ownPocket: null,
        role: null,
        function: null,
        struggle: null,
        excitement: null,
      };
      return { ...row, ...extractRowThemes(row) };
    });
}

function mapS2(raw) {
  return raw
    .filter(r => r['Timestamp']?.trim())
    .map(r => {
      const row = {
        survey: 2,
        period: 'Aug–Sep 2025',
        timestamp: r['Timestamp'].trim(),
        sentiment: normalizeSentiment(r['How would you describe your current feelings about Artificial Intelligence (AI)?']),
        familiarity: normalizeFamiliarity(r['How would you best describe your familiarity with AI tools and their applications in marketing & communications?']),
        frequency: normalizeFrequency(r['How often do you currently use AI tools (e.g., ChatGPT, Grammarly, Microsoft Copilot) in your work? Choose the option that most closely reflects your usage.']),
        barriers: normalizeBarriers(r['What do you think are the biggest barriers to using AI effectively in your role? (Select up to 2 options)']),
        importance: parseInt(r['How important is AI to the success of your individual or team work over the next 12 months?'], 10) || null,
        confidence: normalizeConfidence(r['How confident are you today in your ability to use AI tools effectively in your role?'], 2),
        openEnded: r['How do you see AI tools changing the way you work in the future? If you already use AI, what specific tasks or processes do you currently use it for?']?.trim() || null,
        stage: normalizeStage(r['Which stage best describes your current progress on the AI journey?']),
        momentum: null,
        tools: normalizeTools(r['Which AI tools do you currently use in your work? (Select all that apply)']),
        benefits: [],
        ownPocket: null,
        role: null,
        function: null,
        struggle: null,
        excitement: null,
      };
      return { ...row, ...extractRowThemes(row) };
    });
}

function mapS3(raw) {
  return raw
    .filter(r => r['Timestamp']?.trim())
    .map(r => {
      const row = {
        survey: 3,
        period: 'Mar 2026',
        timestamp: r['Timestamp'].trim(),
        sentiment: normalizeSentiment(r['How would you describe your current feelings about Artificial Intelligence (AI)?']),
        familiarity: normalizeFamiliarity(r['How would you best describe your familiarity with AI tools and their applications in marketing & communications?']),
        frequency: normalizeFrequency(r['How often do you currently use AI tools in your work? Choose the option that most closely reflects your usage.']),
        barriers: normalizeBarriers(r['What do you think are the biggest barriers to using AI effectively in your role? (Select 1-3 options)']),
        importance: parseInt(r['How important is AI to the success of your individual or team work over the next 12 months?'], 10) || null,
        confidence: normalizeConfidence(r['How confident are you today in your ability to use AI tools effectively in your role?'], 3),
        openEnded: null, // S3 splits open-ended into struggle + excitement
        stage: normalizeStage(r['Which stage best describes your current progress on the AI journey?']),
        momentum: normalizeMomentum(r['Which statement best describes the current momentum of AI adoption within Marketing & Communications?']),
        tools: normalizeTools(r["Besides the AI tools the company officially endorses with a paid subscription (OpenAI ChatGPT, Microsoft Copilot, Adobe Firefly, etc.), what other AI tools do you most often use to assist with your work (whether a free version or one you pay out of your own pocket for)?"]),
        benefits: normalizeBenefits(r['When you use AI at work, which benefits are you experiencing most? (Select your top 3)']),
        ownPocket: (() => {
          const v = r['Are you currently paying out of your own pocket for any AI tools you use for work?']?.trim().toLowerCase();
          if (v === 'yes') return true;
          if (v === 'no') return false;
          return null; // blank — excluded from ownPocket analysis
        })(),
        role: normalizeRole(r['What is your role?']),
        function: normalizeFunction(r['What is your function?']),
        // \u2019 = curly right-single-quote as exported by Google Forms — straight ' fails silently
        struggle:   r['What\u2019s your biggest struggle with AI right now, if at all?']?.trim() || null,
        excitement: r['What are you most excited about when it comes to AI?']?.trim() || null,
      };
      return { ...row, ...extractRowThemes(row) };
    });
}

// Wave 4 column contract: every field mapS4 reads, with the header prefixes it accepts.
// Used by scripts/check-data.mjs to verify a freshly linked responses sheet (header row only,
// before the first response lands) maps completely. Keep in sync with mapS4 below.
export const S4_COLUMNS = [
  { field: 'timestamp',    prefixes: ['Timestamp'] },
  { field: 'sentiment',    prefixes: ['How would you describe your current feelings'] },
  { field: 'stage',        prefixes: ['Which stage best describes'] },
  { field: 'familiarity',  prefixes: ['How would you best describe your familiarity'] },
  { field: 'frequency',    prefixes: ['How often do you currently use AI'] },
  { field: 'builder',      prefixes: ['What is the most advanced thing'] },
  { field: 'teamUse',      prefixes: ['How is AI being used on your team'] },
  { field: 'humanContrib', prefixes: ['As AI takes on more tasks'] },
  { field: 'benefits',     prefixes: ['Which benefits have you personally experienced'] },
  { field: 'tools',        prefixes: ['In addition to the AI tools officially provided'] },
  { field: 'ownPocket',    prefixes: ['Are you currently paying out of your own pocket'] },
  { field: 'barriers',     prefixes: ['What are the biggest barriers'] },
  { field: 'importance',   prefixes: ['How important is AI to the success'] },
  { field: 'confidence',   prefixes: ['How confident are you today'] },
  { field: 'openEnded',    prefixes: ['What is one thing helping', 'Anything else you'] },
  { field: 'role',         prefixes: ['What is your current role level', 'What is your role'] },
  { field: 'function',     prefixes: ['Which Marketing and Communications function', 'What is your function'] },
];

// Given the header row of a Wave 4 CSV, report which contract fields matched which column.
export function s4HeaderReport(headers) {
  const norm = h => straightQuotes(String(h ?? '')).toLowerCase();
  return S4_COLUMNS.map(({ field, prefixes }) => {
    const hit = headers.find(h => prefixes.some(p => norm(h).startsWith(norm(p))));
    return { field, matched: hit ?? null };
  });
}

// Wave 4 (Sep 2026). Column titles are the Google Form question titles; matched by prefix via pick().
export function mapS4(raw) {
  return raw
    .filter(r => (r['Timestamp'] ?? '').trim())
    .map(r => {
      const pocket = (pick(r, 'Are you currently paying out of your own pocket') ?? '').trim().toLowerCase();
      const human  = normalizeHumanContrib(pick(r, 'As AI takes on more tasks'));
      const row = {
        survey: 4,
        period: 'Sep 2026',
        timestamp: r['Timestamp'].trim(),
        sentiment:   normalizeSentiment(pick(r, 'How would you describe your current feelings')),
        familiarity: normalizeFamiliarity(pick(r, 'How would you best describe your familiarity')),
        frequency:   normalizeFrequency(pick(r, 'How often do you currently use AI')),
        barriers:    normalizeBarriers(pick(r, 'What are the biggest barriers')),
        importance:  parseInt(pick(r, 'How important is AI to the success'), 10) || null,
        confidence:  normalizeConfidence(pick(r, 'How confident are you today'), 4),
        stage:       normalizeStage(pick(r, 'Which stage best describes')),
        momentum:    null,
        tools:       normalizeTools(pick(r, 'In addition to the AI tools officially provided')),
        benefits:    normalizeBenefits(pick(r, 'Which benefits have you personally experienced')),
        ownPocket:   pocket === 'yes' ? true : pocket === 'no' ? false : null,
        role:        normalizeRole(pick(r, 'What is your current role level', 'What is your role')),
        function:    normalizeFunction(pick(r, 'Which Marketing and Communications function', 'What is your function')),
        // Wave 4 ladders (new): builder 1–4, team 1–5, null when "I'm not sure"
        builder:     ladder(pick(r, 'What is the most advanced thing'), BUILDER_LEVELS),
        teamUse:     ladder(pick(r, 'How is AI being used on your team'), TEAM_LEVELS),
        // Wave 4 Q7 (new): most important human contributions, up to three, plus write-ins
        humanContrib:      human.picks,
        humanContribOther: human.other,
        // One open-ended question this wave: what is helping or getting in the way
        openEnded:   (pick(r, 'What is one thing helping', 'Anything else you') ?? '').trim() || null,
        struggle:    null,
        excitement:  null,
      };
      return { ...row, ...extractRowThemes(row) };
    });
}

// Row mappers by wave number (used by the check script and tests)
export const MAPPERS = { 1: mapS1, 2: mapS2, 3: mapS3, 4: mapS4 };

// Parse CSV text (no network) — for node checks and tests
export function parseCsvText(text) {
  return Papa.parse(text, { header: true, skipEmptyLines: true }).data;
}

// ─── Main export ─────────────────────────────────────────────────────────────

export async function parseAllSurveys() {
  const s4Source = resolveS4Source();
  const [raw1, raw2, raw3, raw4] = await Promise.all([
    fetchParsed(DATA_SOURCES.s1),
    fetchParsed(DATA_SOURCES.s2),
    fetchParsed(DATA_SOURCES.s3),
    s4Source ? fetchParsed(s4Source).catch(err => { console.error('[Survey Data] S4 fetch failed:', err); return []; }) : Promise.resolve([]),
  ]);

  const survey1 = mapS1(raw1);
  const survey2 = mapS2(raw2);
  const survey3 = mapS3(raw3);
  const survey4 = s4Source ? mapS4(raw4) : [];

  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV) {
    console.log(`[Survey Data] S1: ${survey1.length} | S2: ${survey2.length} | S3: ${survey3.length} | S4: ${s4Source ? survey4.length : 'off'} | Total: ${survey1.length + survey2.length + survey3.length + survey4.length}`);
    // Spot-check confidence averages
    const avg = (rows, field) => {
      const vals = rows.map(r => r[field]).filter(v => v !== null);
      return vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2) : 'n/a';
    };
    console.log(`[Confidence avg] S1: ${avg(survey1, 'confidence')} | S2: ${avg(survey2, 'confidence')} | S3: ${avg(survey3, 'confidence')}`);
    console.log(`[Importance avg] S1: ${avg(survey1, 'importance')} | S2: ${avg(survey2, 'importance')} | S3: ${avg(survey3, 'importance')}`);
  }

  return {
    survey1,
    survey2,
    survey3,
    survey4,
    s4Configured: Boolean(s4Source),
    s4Source,
    all: [...survey1, ...survey2, ...survey3, ...survey4],
  };
}
