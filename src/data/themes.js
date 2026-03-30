/**
 * Theme extraction for all open-ended survey responses.
 *
 * Each theme has a key, a display label, and a list of keywords/phrases
 * to match against (case-insensitive substring search).
 *
 * A single response can match multiple themes — that is intentional and
 * correct for open-ended analysis.
 *
 * Raw text is always preserved on each row for the Claude API phases.
 */

// ─── S1 + S2: "How do you see AI changing your work / what do you use it for?" ──
// These responses describe current use cases and future expectations.
// Trend-able across S1 → S2 since it's the same question.

export const USE_CASE_THEMES = [
  {
    key: 'content_writing',
    label: 'Content & Copywriting',
    keywords: [
      'copy', 'copywriting', 'content', 'caption', 'article', 'newsletter',
      'collateral', 'blog', 'headline', 'script', 'brief', 'writing',
      'social media post', 'short blurb', 'talking point',
    ],
  },
  {
    key: 'email_comms',
    label: 'Email & Communications',
    keywords: [
      'email', 'emails', 'memo', 'communication', 'communications',
      'message', 'executive', 'leadership email', 'physician',
    ],
  },
  {
    key: 'editing_polish',
    label: 'Editing & Proofreading',
    keywords: [
      'proof', 'proofreading', 'edit', 'editing', 'grammar', 'refine',
      'polish', 'review copy', 'wordsmith', 'clarity', 'sound more professional',
      'correct', 'grammatically',
    ],
  },
  {
    key: 'brainstorming',
    label: 'Brainstorming & Ideation',
    keywords: [
      'brainstorm', 'brainstorming', 'idea', 'ideas', 'ideation', 'creative',
      'concept', 'out-of-the-box', 'generate', 'jump start', 'starting point',
      'new approach', 'new ways',
    ],
  },
  {
    key: 'research_analysis',
    label: 'Research & Analysis',
    keywords: [
      'research', 'analyz', 'analysis', 'data', 'insight', 'clinical',
      'health topic', 'information', 'investigate', 'learn about', 'understand',
      'topic', 'medical',
    ],
  },
  {
    key: 'summarizing_notes',
    label: 'Summarizing & Meeting Notes',
    keywords: [
      'summar', 'meeting note', 'note taking', 'transcript', 'recap',
      'synthesis', 'highlights', 'action item', 'focus group', 'executive summary',
      'patient feedback', 'crunching data',
    ],
  },
  {
    key: 'seo',
    label: 'SEO & Digital Optimization',
    keywords: [
      'seo', 'search engine', 'geo', 'optimize', 'ranking', 'keyword',
      'organic', 'digital',
    ],
  },
  {
    key: 'presentations',
    label: 'Presentations & Decks',
    keywords: [
      'presentation', 'deck', 'ppt', 'slides', 'powerpoint', 'gamma',
    ],
  },
  {
    key: 'image_design',
    label: 'Image & Visual Creation',
    keywords: [
      'image', 'photo', 'photography', 'visual', 'design', 'graphic',
      'firefly', 'midjourney', 'generative ai', 'illustration',
    ],
  },
  {
    key: 'reporting_data',
    label: 'Reporting & Data Work',
    keywords: [
      'report', 'reporting', 'analytics', 'metrics', 'dashboard',
      'spreadsheet', 'macro', 'excel', 'performance', 'sentiment snapshot',
      'reputation management',
    ],
  },
  {
    key: 'efficiency_time',
    label: 'Efficiency & Time Savings',
    keywords: [
      'efficien', 'faster', 'faster', 'productivity', 'streamline',
      'save time', 'time-saving', 'speed', 'quicker', 'less time',
      'more efficient', 'expedite', 'cut time',
    ],
  },
  {
    key: 'strategy_planning',
    label: 'Strategic Planning',
    keywords: [
      'strateg', 'planning', 'plan', 'thought partner', 'big picture',
      'decision', 'campaign', 'annual planning', 'yearly planning',
    ],
  },
  {
    key: 'video_audio',
    label: 'Video & Audio',
    keywords: [
      'video', 'podcast', 'audio', 'youtube', 'chapter marker', 'voice',
      'ai voice', 'descript', 'recording',
    ],
  },
  {
    key: 'automation_workflows',
    label: 'Automation & Workflows',
    keywords: [
      'workflow', 'automat', 'automation', 'process', 'integrate',
      'custom gpt', 'template', 'repeating', 'opt-out', 'opt out',
    ],
  },
  {
    key: 'translation',
    label: 'Translation & Localization',
    keywords: [
      'translat', 'language', 'spanish', 'bilingual',
    ],
  },
  {
    key: 'project_management',
    label: 'Project Management',
    keywords: [
      'project management', 'task management', 'organize', 'prioritize',
      'calendar', 'scheduling',
    ],
  },
];

// ─── S3: "What's your biggest struggle with AI right now?" ───────────────────
// Gives nuanced qualitative depth beyond the structured barriers question.

export const STRUGGLE_THEMES = [
  {
    key: 'time_bandwidth',
    label: 'Not enough time / bandwidth',
    keywords: [
      'time', 'busy', 'bandwidth', 'workload', 'work volume', 'competing',
      'carve out', 'finding time', 'dedicated time', 'hours in a day', 'pace',
    ],
  },
  {
    key: 'it_access_blocks',
    label: 'IT / T&D access blocks',
    keywords: [
      't&d', 'it block', 'network', 'download', '3rd party', 'blocked',
      'restrict', 'prohibit', 'baptist health', 'access', 'unable to use',
      'constrained', 'locked',
    ],
  },
  {
    key: 'tool_overwhelm',
    label: 'Too many tools / keeping up',
    keywords: [
      'too many', 'which tool', 'keep up', 'so many', 'overwhelm',
      'all of them', 'rapidly', 'options', 'different tools', 'all the tools',
    ],
  },
  {
    key: 'accuracy_reliability',
    label: 'Accuracy & reliability',
    keywords: [
      'accurate', 'accuracy', 'reliable', 'reliability', 'errors',
      '100%', 'review', 'hallucin', 'double check', 'go back and forth',
    ],
  },
  {
    key: 'team_adoption',
    label: 'Team adoption & human judgment',
    keywords: [
      'adoption', 'teammates', 'colleague', 'others', 'consensus',
      'human element', 'still needs to review', 'team', 'everyone',
      'department', 'explaining', 'buy-in',
    ],
  },
  {
    key: 'learning_curve',
    label: 'Learning curve / upskilling',
    keywords: [
      'learn', 'training', 'upskill', 'familiar', 'experiment',
      'practice', 'educati', 'knowledge', 'still learning', 'proficient',
    ],
  },
  {
    key: 'system_integration',
    label: 'System / software integration',
    keywords: [
      'integrat', 'connect', 'outlook', 'workfront', 'office', 'platform',
      'single platform', 'business files', 'software', 'connect with',
    ],
  },
  {
    key: 'custom_gpt_agents',
    label: 'Building Custom GPTs / Agents',
    keywords: [
      'custom gpt', 'agent', 'custom gpts', 'finalize', 'build', 'developing',
      'create agent', 'automation build',
    ],
  },
  {
    key: 'cost_personal',
    label: 'Personal cost / out-of-pocket',
    keywords: [
      'cost', 'pay', 'pocket', 'fund', 'expense', 'subscri', 'personal cost',
    ],
  },
  {
    key: 'scaling_structure',
    label: 'Scaling AI across the team',
    keywords: [
      'scaling', 'structured', 'sustainable', 'department-wide',
      'cohesive', 'standardize', 'align', 'governance',
    ],
  },
  {
    key: 'old_habits',
    label: 'Breaking old habits',
    keywords: [
      'old habit', 'habit', 'routine', 'used to', 'break', 'muscle memory',
      'default', 'set in',
    ],
  },
];

// ─── S3: "What are you most excited about when it comes to AI?" ──────────────
// Forward-looking signals about department energy and direction.

export const EXCITEMENT_THEMES = [
  {
    key: 'efficiency_time',
    label: 'Efficiency & time savings',
    keywords: [
      'efficien', 'time', 'faster', 'productivity', 'streamline',
      'save', 'bandwidth', 'repetitive', 'routine', 'mundane',
      'offload', 'less time',
    ],
  },
  {
    key: 'quality_creativity',
    label: 'Elevated quality & creativity',
    keywords: [
      'creative', 'creativity', 'innovation', 'quality', 'polish',
      'elevate', 'better work', 'sharper', 'stronger', 'meaningful',
      'possibilities', 'imagine', 'artistic',
    ],
  },
  {
    key: 'strategic_thinking',
    label: 'AI as a strategic thought partner',
    keywords: [
      'strateg', 'thought partner', 'decision', 'big picture',
      'reimagine', 'transform work', 'pressure-test', 'partner',
    ],
  },
  {
    key: 'future_capabilities',
    label: 'Future capabilities / evolution',
    keywords: [
      'future', 'next', 'evolv', 'capabilit', 'update', 'what comes next',
      'advancing', 'next level', 'what\'s coming', 'upcoming',
    ],
  },
  {
    key: 'dept_transformation',
    label: 'Department-wide transformation',
    keywords: [
      'department', 'team', 'together', 'collaborat', 'entire',
      'organization', 'everyone', 'at large', 'our work', 'how we work',
    ],
  },
  {
    key: 'personal_growth',
    label: 'Personal growth & learning',
    keywords: [
      'learn', 'grow', 'skill', 'knowledge', 'proficient', 'expert',
      'upskill', 'opportunity', 'continuing to learn', 'building',
    ],
  },
  {
    key: 'doing_more_less',
    label: 'Doing more with less',
    keywords: [
      'more with less', 'doing more', 'accomplish', "couldn't do before",
      'possible', 'new capabilit', 'expand', 'go beyond', 'exceed',
    ],
  },
  {
    key: 'automation_agents',
    label: 'Automation & AI agents',
    keywords: [
      'automat', 'agent', 'custom gpt', 'workflow automat',
      'repetitive tasks', 'offload', 'ai employees', 'agentic',
    ],
  },
  {
    key: 'access_tools',
    label: 'Getting full access to tools',
    keywords: [
      'access', 'full access', 'tools we need', 'endorsed', 'more tools',
      'granted', 'approved',
    ],
  },
];

// ─── Core extraction function ─────────────────────────────────────────────────

/**
 * Returns an array of matched theme keys for a given text and theme set.
 * A single response can match multiple themes.
 * Returns [] for blank/null responses.
 */
function extractThemesFromText(text, themeSet) {
  if (!text || !text.trim()) return [];
  const lower = text.toLowerCase();
  return themeSet
    .filter(theme =>
      theme.keywords.some(kw => lower.includes(kw.toLowerCase()))
    )
    .map(theme => theme.key);
}

/**
 * Extracts all theme keys from a row's open-ended fields.
 * Called during parse so themes are on every row alongside raw text.
 *
 * Returns:
 *   useCaseThemes   — from S1/S2 openEnded (same question both surveys)
 *   struggleThemes  — from S3 struggle
 *   excitementThemes — from S3 excitement
 */
export function extractRowThemes(row) {
  return {
    useCaseThemes:    extractThemesFromText(row.openEnded, USE_CASE_THEMES),
    struggleThemes:   extractThemesFromText(row.struggle,  STRUGGLE_THEMES),
    excitementThemes: extractThemesFromText(row.excitement, EXCITEMENT_THEMES),
  };
}

/**
 * Lookup maps for label resolution in transforms and UI.
 */
export const USE_CASE_LABEL   = Object.fromEntries(USE_CASE_THEMES.map(t => [t.key, t.label]));
export const STRUGGLE_LABEL   = Object.fromEntries(STRUGGLE_THEMES.map(t => [t.key, t.label]));
export const EXCITEMENT_LABEL = Object.fromEntries(EXCITEMENT_THEMES.map(t => [t.key, t.label]));
