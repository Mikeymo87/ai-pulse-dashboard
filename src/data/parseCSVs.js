import Papa from 'papaparse';
import { extractRowThemes } from './themes';

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
  };
  return map[v] ?? null;
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
      "I use it as a resource so currently haven't encountered any barriers",
    ],
    keywords: ['no barrier', 'feel there are no', "haven't encountered any barrier"],
  },
  {
    label: 'Lack of training',
    exact: ['Lack of understanding or training'],
    keywords: ['lack of understanding', 'lack of training', 'lack of knowledge', 'need.*training', 'need.*education'],
  },
  {
    label: 'Limited access',
    exact: ['Limited access to AI tools'],
    keywords: ['limited access', 'access to ai tools', 'gaining access', 'access to certain tools'],
  },
  {
    label: 'Accuracy concerns',
    exact: ['Concerns about accuracy or reliability', 'IP concerns'],
    keywords: ['accuracy', 'reliability', 'accurate', 'reliable', 'ip concern', 'not 100%'],
  },
  {
    label: 'Fear of mistakes',
    exact: ['Fear of making mistakes with AI'],
    keywords: ['fear of making mistakes', 'fear of mistakes', 'making mistakes with ai'],
  },
  {
    label: 'Job security',
    exact: [
      'I am afraid that it will negatively affect my job',
      'I am afraid AI will replace me',
    ],
    keywords: ['replace me', 'negatively affect my job', 'afraid ai will', 'take my job', 'job security'],
  },
  {
    label: 'Workflow resistance',
    exact: [
      'I am not ready to make that kind of change to my workflow',
      'Unsure of the best way to integrate AI into my workflow',
    ],
    keywords: ['not ready.*change', 'change to my workflow', 'unsure of the best way', 'integrate ai into my workflow'],
  },
  {
    label: 'Old habits',
    exact: ['Hard to break old habits'],
    keywords: ['old habit', 'break.*habit', 'hard to break'],
  },
  {
    label: 'Not relevant',
    exact: ["I don't see AI as relevant to my work"],
    keywords: ['not relevant', "don't see ai as relevant"],
  },
  {
    label: 'Unaware of permissions',
    exact: ['I was not aware that I was allowed to use AI'],
    keywords: ['not aware.*allowed', 'allowed to use ai', "didn't know i could"],
  },
  {
    label: 'Lack of time',
    exact: ['Lack of time / competing priorities'],
    keywords: [
      'lack of time', 'competing priorities', 'not enough time', 'too busy',
      'limited time', 'making the time', 'time to learn', 'time to really',
      'time to focus', 'finding time',
    ],
  },
  {
    label: 'Privacy / compliance',
    exact: ['Concerns about privacy / PHI / compliance'],
    keywords: ['privacy', 'phi', 'compliance', 'hipaa', 'patient data', 'sensitive data', 'data upload'],
  },
  {
    label: 'Too many tools',
    exact: ['Too many tools/not sure which to use'],
    keywords: ['too many tools', 'not sure which tool', 'which tool to use', 'too many options', 'overwhelm.*tool'],
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
    exact: ["Unclear guidelines on what's allowed (policy/guardrails)"],
    keywords: ['unclear guidelines', 'guardrail', 'what.*allowed', 'legalities', 'company policy', 'bh rules'],
  },
];

function classifyBarrierSegment(segment) {
  segment = segment.trim();
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
  if (t === 'Claud (Anthropic)') return 'Claude (Anthropic)';
  if (t === 'NotebookLM.Google' || t === 'Notebook LM') return 'NotebookLM';
  if (t === 'google AI studio') return 'Google AI Studio';
  if (t === 'Answer The Public' || t === 'AnswerThePublic') return 'AnswerThePublic';
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
const BENEFIT_PREFIXES = [
  'Saves time / reduces busywork',
  'Improves quality / polish',
  'Idea generation / creative acceleration',
  'Research and synthesis',
  'Strategic thought partner',
  'Communication clarity',
  'Speed to decision',
  'Learning / upskilling',
  'Enablement of new capabilities',
  'Collaboration',
];

function normalizeBenefits(v) {
  if (!v || !v.trim()) return [];
  return BENEFIT_PREFIXES.filter(prefix => v.includes(prefix));
}

// S3 role normalization
function normalizeRole(v) {
  if (!v || !v.trim()) return null;
  v = v.trim();
  if (v.toLowerCase() === 'designer') return 'Designer';
  if (v.toLowerCase() === 'ea') return 'EA';
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
  return v;
}

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

// ─── Main export ─────────────────────────────────────────────────────────────

export async function parseAllSurveys() {
  const [raw1, raw2, raw3] = await Promise.all([
    fetchParsed('/data/survey1.csv'),
    fetchParsed('/data/survey2.csv'),
    fetchParsed('/data/survey3.csv'),
  ]);

  const survey1 = mapS1(raw1);
  const survey2 = mapS2(raw2);
  const survey3 = mapS3(raw3);

  if (import.meta.env.DEV) {
    console.log(`[Survey Data] S1: ${survey1.length} | S2: ${survey2.length} | S3: ${survey3.length} | Total: ${survey1.length + survey2.length + survey3.length}`);
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
    all: [...survey1, ...survey2, ...survey3],
  };
}
