import { USE_CASE_THEMES, STRUGGLE_THEMES, EXCITEMENT_THEMES, USE_CASE_LABEL, STRUGGLE_LABEL, EXCITEMENT_LABEL } from './themes';

// ─── Utility helpers ─────────────────────────────────────────────────────────

/** Count occurrences of each scalar value for a given field across rows. */
function countField(rows, field) {
  const counts = {};
  for (const row of rows) {
    const v = row[field];
    if (v !== null && v !== undefined) {
      counts[v] = (counts[v] || 0) + 1;
    }
  }
  return counts;
}

/** Count items in an array field across all rows. */
function countArrayField(rows, field) {
  const counts = {};
  for (const row of rows) {
    for (const item of row[field] || []) {
      if (item) counts[item] = (counts[item] || 0) + 1;
    }
  }
  return counts;
}

/** Average of a numeric field, skipping nulls. Returns null if no valid values. */
function avgField(rows, field) {
  const vals = rows.map(r => r[field]).filter(v => v !== null && v !== undefined);
  if (!vals.length) return null;
  return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 100) / 100;
}

/**
 * Convert a counts object to a sorted array of { label, count, pct }.
 * pct is percentage of the given total, rounded to nearest integer.
 */
function toDistribution(counts, total) {
  return Object.entries(counts)
    .map(([label, count]) => ({
      label,
      count,
      pct: total ? Math.round((count / total) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);
}

// ─── Display ordering constants ───────────────────────────────────────────────

const SENTIMENT_ORDER = ['Positive', 'Mixed', 'Unsure', 'Negative'];
const FREQ_ORDER = ['Daily', 'Weekly', 'Monthly', 'Rarely', 'Never'];
const STAGE_ORDER = ['Curiosity', 'Understanding', 'Experimentation', 'Integration', 'Transformation'];

// Human-readable confidence labels per survey scale
const CONFIDENCE_LABELS = {
  s1: { 5: 'Very Confident', 4: 'Confident', 3: 'Somewhat confident', 2: 'Not confident at all' },
  s2: { 4: 'Very Confident', 3: 'Confident', 2: 'Somewhat confident' },
  s3: { 5: 'Extremely Confident', 4: 'Very Confident', 3: 'Confident', 2: 'Somewhat confident' },
};

const FAMILIARITY_LABELS = {
  5: 'Expert',
  4: 'Experimented',
  3: 'Know a bit',
  2: 'Heard of',
  1: 'Unfamiliar',
};

// ─── Main transform builder ───────────────────────────────────────────────────

export function buildTransforms({ survey1, survey2, survey3 }) {
  const surveys = [
    { key: 's1', num: 1, label: 'Survey 1', period: 'Jan–Feb 2025', rows: survey1, n: survey1.length },
    { key: 's2', num: 2, label: 'Survey 2', period: 'Aug–Sep 2025', rows: survey2, n: survey2.length },
    { key: 's3', num: 3, label: 'Survey 3', period: 'Mar 2026',     rows: survey3, n: survey3.length },
  ];

  // ── Response counts per survey ───────────────────────────────────────────
  const responseCounts = surveys.map(s => ({
    label: s.label,
    period: s.period,
    n: s.n,
  }));

  // ── Sentiment trend (S1 → S2 → S3) ──────────────────────────────────────
  // Only includes sentiment values that appear in at least one survey.
  // Percentages are based on respondents who answered that question (not total n).
  const sentimentTrend = SENTIMENT_ORDER
    .map(sentiment => {
      const entry = { sentiment };
      for (const s of surveys) {
        const answered = s.rows.filter(r => r.sentiment !== null).length;
        const count = s.rows.filter(r => r.sentiment === sentiment).length;
        entry[s.key] = { count, pct: answered ? Math.round((count / answered) * 100) : 0 };
      }
      return entry;
    })
    .filter(e => surveys.some(s => e[s.key].count > 0));

  // ── Confidence trend ─────────────────────────────────────────────────────
  // NOTE: Each survey uses a different scale (see CONFIDENCE_LABELS above).
  // Averages are on that survey's native scale and should not be compared
  // as absolute numbers — use them to show within-survey distribution.
  const confidenceTrend = surveys.map(s => {
    const validRows = s.rows.filter(r => r.confidence !== null);
    const vals = validRows.map(r => r.confidence);
    const avg = vals.length ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 100) / 100 : null;
    const counts = countField(validRows, 'confidence');
    const distribution = Object.entries(counts)
      .map(([scoreStr, count]) => {
        const score = Number(scoreStr);
        return {
          score,
          label: CONFIDENCE_LABELS[s.key][score] || `Score ${score}`,
          count,
          pct: vals.length ? Math.round((count / vals.length) * 100) : 0,
        };
      })
      .sort((a, b) => b.score - a.score);
    return { label: s.label, period: s.period, avg, n: vals.length, distribution };
  });

  // ── Frequency trend ──────────────────────────────────────────────────────
  const frequencyTrend = surveys.map(s => {
    const validRows = s.rows.filter(r => r.frequency !== null);
    const n = validRows.length;
    const counts = countField(validRows, 'frequency');
    const distribution = FREQ_ORDER
      .filter(f => counts[f] !== undefined)
      .map(f => ({
        label: f,
        count: counts[f],
        pct: n ? Math.round((counts[f] / n) * 100) : 0,
      }));
    return { label: s.label, period: s.period, n, distribution };
  });

  // ── Familiarity trend ────────────────────────────────────────────────────
  const familiarityTrend = surveys.map(s => {
    const validRows = s.rows.filter(r => r.familiarity !== null);
    const vals = validRows.map(r => r.familiarity);
    const avg = vals.length ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 100) / 100 : null;
    const counts = countField(validRows, 'familiarity');
    const distribution = [5, 4, 3, 2, 1]
      .map(score => ({
        score,
        label: FAMILIARITY_LABELS[score],
        count: counts[score] || 0,
        pct: vals.length ? Math.round(((counts[score] || 0) / vals.length) * 100) : 0,
      }))
      .filter(d => d.count > 0);
    return { label: s.label, period: s.period, avg, n: vals.length, distribution };
  });

  // ── Importance trend ─────────────────────────────────────────────────────
  const importanceTrend = surveys.map(s => {
    const validRows = s.rows.filter(r => r.importance !== null);
    const vals = validRows.map(r => r.importance);
    const avg = vals.length ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 100) / 100 : null;
    const counts = countField(validRows, 'importance');
    const distribution = [5, 4, 3, 2, 1]
      .map(score => ({
        score,
        count: counts[score] || 0,
        pct: vals.length ? Math.round(((counts[score] || 0) / vals.length) * 100) : 0,
      }))
      .filter(d => d.count > 0);
    return { label: s.label, period: s.period, avg, n: vals.length, distribution };
  });

  // ── AI Journey Stage trend (S2 + S3 only) ────────────────────────────────
  // Use only respondents who answered the stage question as the denominator.
  // S2 has 1 blank; S3 has 0 blanks — this handles both correctly.
  const s2StageAnswered = survey2.filter(r => r.stage !== null).length;
  const s3StageAnswered = survey3.filter(r => r.stage !== null).length;

  const stageTrend = STAGE_ORDER
    .map(stage => ({
      stage,
      s2: {
        count: survey2.filter(r => r.stage === stage).length,
        pct: s2StageAnswered ? Math.round((survey2.filter(r => r.stage === stage).length / s2StageAnswered) * 100) : 0,
      },
      s3: {
        count: survey3.filter(r => r.stage === stage).length,
        pct: s3StageAnswered ? Math.round((survey3.filter(r => r.stage === stage).length / s3StageAnswered) * 100) : 0,
      },
    }))
    .filter(e => e.s2.count > 0 || e.s3.count > 0);

  // ── Barriers trend (all 3 surveys) ───────────────────────────────────────
  // Collects all classified barrier categories then builds cross-survey counts
  const allBarriers = new Set();
  for (const s of surveys) {
    for (const row of s.rows) {
      for (const b of row.barriers) allBarriers.add(b);
    }
  }

  const barriersTrend = [...allBarriers]
    .map(barrier => {
      const entry = { barrier };
      for (const s of surveys) {
        const count = s.rows.filter(r => r.barriers.includes(barrier)).length;
        entry[s.key] = { count, pct: s.n ? Math.round((count / s.n) * 100) : 0 };
      }
      return entry;
    })
    .sort((a, b) => {
      const totalA = surveys.reduce((t, s) => t + a[s.key].count, 0);
      const totalB = surveys.reduce((t, s) => t + b[s.key].count, 0);
      return totalB - totalA;
    });

  // ── Tools used in S2 (structured multi-select) ───────────────────────────
  const toolCountsS2 = countArrayField(survey2, 'tools');
  const toolsS2 = toDistribution(toolCountsS2, survey2.length);

  // ── Non-endorsed tools in S3 (personal / free tools) ────────────────────
  // Exclude respondents who only use officially endorsed tools
  const s3WithPersonalTools = survey3.filter(r =>
    r.tools.length > 0 && !r.tools.some(t => t.startsWith('None'))
  );
  const toolCountsS3 = countArrayField(s3WithPersonalTools, 'tools');
  const toolsS3 = toDistribution(toolCountsS3, survey3.length);

  // ── Benefits experienced (S3 only) ───────────────────────────────────────
  const benefitCounts = countArrayField(survey3, 'benefits');
  const benefitsS3 = toDistribution(benefitCounts, survey3.length);

  // ── Departmental momentum (S3 only) ─────────────────────────────────────
  const momentumCounts = countField(survey3.filter(r => r.momentum), 'momentum');
  const momentumS3 = toDistribution(momentumCounts, survey3.filter(r => r.momentum).length);

  // ── Own pocket spending (S3 only) ────────────────────────────────────────
  const pocketRows = survey3.filter(r => r.ownPocket !== null);
  const pocketYes = pocketRows.filter(r => r.ownPocket === true).length;
  const pocketNo  = pocketRows.filter(r => r.ownPocket === false).length;
  const ownPocketS3 = {
    yes: pocketYes,
    no: pocketNo,
    total: pocketRows.length,
    yesPct: pocketRows.length ? Math.round((pocketYes / pocketRows.length) * 100) : 0,
    noPct:  pocketRows.length ? Math.round((pocketNo  / pocketRows.length) * 100) : 0,
  };

  // ── S3 breakdown by Role ─────────────────────────────────────────────────
  const roleCounts = countField(survey3.filter(r => r.role), 'role');
  const byRole = toDistribution(roleCounts, survey3.length).map(({ label, count, pct }) => {
    const roleRows = survey3.filter(r => r.role === label);
    return {
      role: label,
      count,
      pct,
      confidenceAvg: avgField(roleRows, 'confidence'),
      importanceAvg: avgField(roleRows, 'importance'),
      familiarityAvg: avgField(roleRows, 'familiarity'),
      frequencyDist: countField(roleRows.filter(r => r.frequency), 'frequency'),
    };
  });

  // ── S3 breakdown by Function ─────────────────────────────────────────────
  const functionCounts = countField(survey3.filter(r => r.function), 'function');
  const byFunction = toDistribution(functionCounts, survey3.length).map(({ label, count, pct }) => {
    const fnRows = survey3.filter(r => r.function === label);
    return {
      function: label,
      count,
      pct,
      confidenceAvg: avgField(fnRows, 'confidence'),
      importanceAvg: avgField(fnRows, 'importance'),
      familiarityAvg: avgField(fnRows, 'familiarity'),
      stageDist: countField(fnRows.filter(r => r.stage), 'stage'),
      frequencyDist: countField(fnRows.filter(r => r.frequency), 'frequency'),
    };
  });

  // ── Use-case theme frequencies (S1 + S2 open-ended) ─────────────────────
  // Shows what tasks people are actually doing with AI, trend-able S1→S2.
  // Denominator = respondents who wrote something (not total survey takers).
  const s1OpenEndedN = survey1.filter(r => r.openEnded).length;
  const s2OpenEndedN = survey2.filter(r => r.openEnded).length;

  const useCaseThemesTrend = USE_CASE_THEMES.map(({ key, label }) => {
    const s1Count = survey1.filter(r => r.useCaseThemes?.includes(key)).length;
    const s2Count = survey2.filter(r => r.useCaseThemes?.includes(key)).length;
    return {
      key,
      label,
      s1: { count: s1Count, pct: s1OpenEndedN ? Math.round((s1Count / s1OpenEndedN) * 100) : 0 },
      s2: { count: s2Count, pct: s2OpenEndedN ? Math.round((s2Count / s2OpenEndedN) * 100) : 0 },
      total: s1Count + s2Count,
    };
  }).filter(t => t.total > 0).sort((a, b) => b.total - a.total);

  // ── Struggle themes (S3 open-ended) ─────────────────────────────────────
  // Qualitative depth on top of the structured barriers question.
  const s3StruggleN = survey3.filter(r => r.struggle && !/^n\/?a$|^none$|^no\b/i.test(r.struggle.trim())).length;

  const struggleThemesS3 = STRUGGLE_THEMES.map(({ key, label }) => {
    const matching = survey3.filter(r => r.struggleThemes?.includes(key));
    const count = matching.length;
    const quotes = matching
      .map(r => (r.struggle || '').trim())
      .filter(q => q.length > 15 && !/^n\/?a$|^none$|^no\b/i.test(q))
      .slice(0, 3);
    return {
      key,
      label,
      count,
      pct: s3StruggleN ? Math.round((count / s3StruggleN) * 100) : 0,
      quotes,
    };
  }).filter(t => t.count > 0).sort((a, b) => b.count - a.count);

  // ── Excitement themes (S3 open-ended) ────────────────────────────────────
  // Forward-looking signals — what's energizing the department.
  const s3ExcitementN = survey3.filter(r => r.excitement && r.excitement.trim()).length;

  const excitementThemesS3 = EXCITEMENT_THEMES.map(({ key, label }) => {
    const matching = survey3.filter(r => r.excitementThemes?.includes(key));
    const count = matching.length;
    const quotes = matching
      .map(r => (r.excitement || '').trim())
      .filter(q => q.length > 15)
      .slice(0, 3);
    return {
      key,
      label,
      count,
      pct: s3ExcitementN ? Math.round((count / s3ExcitementN) * 100) : 0,
      quotes,
    };
  }).filter(t => t.count > 0).sort((a, b) => b.count - a.count);

  // ── Raw open-ended text collections (for Claude API phases 4 + 7) ────────
  const openEndedText = {
    s1: survey1.filter(r => r.openEnded).map(r => r.openEnded),
    s2: survey2.filter(r => r.openEnded).map(r => r.openEnded),
    s3Struggle:   survey3.filter(r => r.struggle).map(r => r.struggle),
    s3Excitement: survey3.filter(r => r.excitement).map(r => r.excitement),
    // Struggle text from own-pocket respondents that specifically mentions paying/purchasing
    s3OwnPocketQuotes: (() => {
      const payKeywords = ['pay', 'paid', 'paying', 'pocket', 'cost', 'subscription',
        'afford', 'budget', 'purchase', 'fund', 'money', 'personal', 'own', 'expense', 'dime'];
      return survey3
        .filter(r => r.ownPocket === true && r.struggle && r.struggle.trim().length > 15)
        .map(r => r.struggle.trim())
        .filter(q => payKeywords.some(kw => q.toLowerCase().includes(kw)));
    })(),
  };

  // ── Archetype classification — Claritas-style multi-dimensional affinity scoring ──
  //
  // Every S3 respondent receives a score (0–100) for each of the 5 archetypes.
  // The archetype with the highest score is assigned. No binary gates — all 16
  // dimensions contribute to at least one scorer. Near-ties promote the more
  // advanced archetype (higher _adoptionScore).
  //
  // HOW TO TUNE AFTER EACH NEW SURVEY WAVE:
  //   1. Log archetype counts (see console output in dev mode below).
  //      Flag any archetype below 5% or above 45% of respondents.
  //   2. Adjust ***PRIMARY*** weights first — supporting weights only if needed.
  //   3. No single signal should exceed 40 pts — over-weighting reverts to a waterfall.
  //   4. Add a dated comment next to any weight you change, e.g.:
  //      frequency_daily: 30, // S4 2026-09: was 28, daily users over-landing in Experimenter
  //   5. The `benefits` stubs in ARCHETYPE_WEIGHTS.multiplier are ready to activate for S4.
  //   6. Re-run on all survey waves after any weight change to check for drift.

  const ARCHETYPE_WEIGHTS = {

    // Multiplier — builder/architect. Uses AI as infrastructure, not just a tool.
    // DESIGN NOTE: all 4 primary gates must be met — daily use, own-pocket spend,
    // max importance, AND systems-level open text. Missing any one primary triggers
    // a stiff penalty that drops the score below what competing archetypes can reach.
    multiplier: {
      // ***PRIMARY*** — 4 required gates; base weights kept modest; penalties do the filtering
      frequency_daily:          15,  // must use daily — gate enforced by penalty_not_daily
      stage_advanced:            5,  // Integration or Transformation; supporting only
      own_pocket:               22,  // revealed financial commitment — highest conviction signal
      importance_5:             18,  // max-importance declaration
      voice_systems:            15,  // open text contains systems-level keywords (strict list)
      voice_systems_count:       6,  // +per additional keyword hit, capped at 3
      // Supporting signals
      confidence_high:           5,  // confidence >= 4
      familiarity_high:          4,  // familiarity >= 4
      excitement_themes_auto:    3,  // excitementThemes includes 'automation_agents'
      momentum_accelerating:     3,
      role_director_bonus:       2,  // role === 'Director'
      function_web_bonus:        2,  // function === 'Web & Technology'
      // S4-ready benefit stubs (uncomment and assign after observing S4 distribution):
      // benefits_strategic:     4,  // 'Strategic thought partner' in benefits
      // benefits_enablement:    4,  // 'Enablement of new capabilities' in benefits
      // Missing-primary penalties — hard gates; any absent primary makes Multiplier un-winnable
      penalty_not_daily:       -30,  // S3 2026: not daily disqualifies — Multipliers are daily users
      penalty_no_own_pocket:   -40,  // ownPocket !== true: hard disqualifier
      penalty_no_importance_5: -28,  // importance < 5: hard disqualifier
      penalty_no_voice:        -22,  // no systems-level keywords: hard disqualifier
      // Other penalties
      penalty_rarely_never:    -20,
      penalty_curiosity_stage: -12,
      penalty_no_tools:        -10,  // tools.length === 0
    },

    // Experimenter — curious explorer. Multi-tool trialler, learning curve is the barrier.
    experimenter: {
      // ***PRIMARY***
      stage_experimentation:    30,  // S3: boosted from 22 — core identity signal
      stage_understanding:      16,  // S3: boosted from 14
      tools_2plus:              22,  // S3: boosted from 18 — breadth of tool use is key
      tools_3plus:               6,  // bonus, additive with tools_2plus
      barrier_learning:         12,  // S3: boosted from 10
      barrier_too_many_tools:    8,  // S3: boosted from 6
      // Supporting signals
      frequency_weekly:          8,
      frequency_daily:           5,  // daily experimenters exist — softened from penalty to mild reward
      frequency_monthly:         4,
      struggle_learning_curve:   5,  // struggleThemes includes 'learning_curve'
      excitement_personal_growth: 4, // excitementThemes includes 'personal_growth'
      confidence_moderate:       4,  // confidence === 3
      familiarity_moderate:      3,  // familiarity === 3
      // Penalties
      penalty_advanced_stage:  -18,  // S3: strengthened from -15 — Integration/Transformation disqualifies
      penalty_own_pocket:       -8,
    },

    // Blocked Believer — enthusiast stopped by org friction. Positive + blocked = signature.
    'blocked-believer': {
      // ***PRIMARY*** — positive sentiment + org-friction barrier = the signature combination
      sentiment_positive:       20,
      importance_4plus:         16,  // importance >= 4
      barrier_it_access:        18,  // 'IT / access blocks'
      barrier_privacy:          10,  // 'Privacy / compliance'
      barrier_unclear_guidelines: 8,
      barrier_limited_access:    6,
      // Supporting signals
      frequency_weekly:         10,
      frequency_monthly:         5,
      excitement_access_tools:   5,  // excitementThemes includes 'access_tools'
      struggle_it_blocks:        5,  // struggleThemes includes 'it_access_blocks'
      confidence_high:           3,
      // Penalties
      penalty_daily:            -5,
      penalty_negative_sentiment: -20,
      penalty_no_barrier:       -28,  // No org barriers = definitively not Blocked Believer
    },

    // Thoughtful Skeptic — active user with earned critical distance. Text richness is key.
    'thoughtful-skeptic': {
      // ***PRIMARY*** — mixed/negative sentiment + active use + detailed open-text
      sentiment_mixed:          24,
      sentiment_negative:       18,
      frequency_daily:           8,  // daily skeptic = most informed critic
      frequency_weekly:         14,
      frequency_monthly:         8,
      barrier_accuracy:         12,  // 'Accuracy concerns'
      barrier_fear_mistakes:     6,
      text_length_long:          8,  // combined struggle+excitement > 150 chars
      text_length_very_long:     4,  // bonus > 300 chars, additive with above
      struggle_accuracy:         6,  // struggleThemes includes 'accuracy_reliability'
      barrier_count_2plus:       4,  // 2+ barriers listed
      familiarity_moderate:      3,  // familiarity 3–4
      // Penalties
      penalty_positive_sentiment: -18,
      penalty_never_rarely:      -16,
      penalty_importance_1_2:     -8,  // importance <= 2
    },

    // Confident Bystander — aware, not activated. No barriers + no action = the paradox.
    'confident-bystander': {
      // ***PRIMARY*** — low frequency + no barriers + no investment
      frequency_rarely:         30,  // S3: boosted from 24 — rarely is the strongest signal
      frequency_never:          30,  // S3: boosted from 20
      frequency_monthly:        12,
      barrier_none:             25,  // S3: boosted from 18 — no barriers is the defining paradox
      own_pocket_no:            14,  // S3: boosted from 10
      confidence_moderate_high:  8,  // confidence >= 3 while using rarely/never
      tools_zero:               10,  // S3: boosted from 8
      stage_curiosity:           6,
      importance_1_3:            5,  // S3: boosted from 4
      // Penalties
      penalty_daily_weekly:    -28,  // S3: strengthened from -20
      penalty_advanced_stage:  -22,  // S3: strengthened from -18
      penalty_own_pocket:      -16,  // S3: strengthened from -12
      penalty_blocked_barrier: -20,  // S3: strengthened from -10 — org barriers = Blocked Believer territory
    },
  };

  // Org-friction barriers (used in Blocked Believer and Bystander penalty)
  const ORG_BLOCK_BARRIERS = ['IT / access blocks', 'Privacy / compliance', 'Unclear guidelines', 'Limited access'];

  // Systems-level language in open text — "I build with it", not just "I use it"
  // STRICT: only terms a builder/architect would use; "build", "gpt", "scaling" removed as too generic
  const VOICE_KEYWORDS = [
    'agent', 'agentic', 'workflow', 'automat', 'integrat',
    'pipeline', 'orchestrat', 'custom gpt', 'deploy', 'mapping',
  ];

  function voiceKeywordCount(r) {
    const text = ((r.struggle || '') + ' ' + (r.excitement || '')).toLowerCase();
    return VOICE_KEYWORDS.filter(kw => text.includes(kw)).length;
  }

  function combinedTextLength(r) {
    return ((r.struggle || '') + ' ' + (r.excitement || '')).trim().length;
  }

  // ── Five scorer functions ─────────────────────────────────────────────────

  function scoreMultiplier(r) {
    const W = ARCHETYPE_WEIGHTS.multiplier;
    let score = 0;
    if (r.frequency === 'Daily')                                          score += W.frequency_daily;
    if (r.stage === 'Integration' || r.stage === 'Transformation')        score += W.stage_advanced;
    if (r.ownPocket === true)                                             score += W.own_pocket;
    if (r.importance === 5)                                               score += W.importance_5;
    const kwCount = voiceKeywordCount(r);
    if (kwCount >= 1)                                                     score += W.voice_systems;
    score += Math.min(kwCount, 3) * (W.voice_systems_count / 3);
    if ((r.confidence ?? 0) >= 4)                                         score += W.confidence_high;
    if ((r.familiarity ?? 0) >= 4)                                        score += W.familiarity_high;
    if (r.excitementThemes?.includes('automation_agents'))                score += W.excitement_themes_auto;
    if (r.momentum === 'Accelerating')                                    score += W.momentum_accelerating;
    if (r.role === 'Director')                                            score += W.role_director_bonus;
    if (r.function === 'Web & Technology')                                score += W.function_web_bonus;
    // Missing-primary penalties — any absent primary makes Multiplier score un-winnable
    if (r.frequency !== 'Daily')                                          score += W.penalty_not_daily;
    if (r.ownPocket !== true)                                             score += W.penalty_no_own_pocket;
    if ((r.importance ?? 0) < 5)                                          score += W.penalty_no_importance_5;
    if (kwCount === 0)                                                    score += W.penalty_no_voice;
    if (r.frequency === 'Rarely' || r.frequency === 'Never')              score += W.penalty_rarely_never;
    if (r.stage === 'Curiosity')                                          score += W.penalty_curiosity_stage;
    if (r.tools.length === 0)                                             score += W.penalty_no_tools;
    return Math.max(0, Math.min(100, score));
  }

  function scoreExperimenter(r) {
    const W = ARCHETYPE_WEIGHTS.experimenter;
    let score = 0;
    if (r.stage === 'Experimentation')                                    score += W.stage_experimentation;
    if (r.stage === 'Understanding')                                      score += W.stage_understanding;
    if (r.tools.length >= 2)                                              score += W.tools_2plus;
    if (r.tools.length >= 3)                                              score += W.tools_3plus;
    if (r.barriers.includes('Lack of training'))                          score += W.barrier_learning;
    if (r.barriers.includes('Too many tools'))                            score += W.barrier_too_many_tools;
    if (r.frequency === 'Daily')                                          score += W.frequency_daily;
    if (r.frequency === 'Weekly')                                         score += W.frequency_weekly;
    if (r.frequency === 'Monthly')                                        score += W.frequency_monthly;
    if (r.struggleThemes?.includes('learning_curve'))                     score += W.struggle_learning_curve;
    if (r.excitementThemes?.includes('personal_growth'))                  score += W.excitement_personal_growth;
    if (r.confidence === 3)                                               score += W.confidence_moderate;
    if (r.familiarity === 3)                                              score += W.familiarity_moderate;
    if (r.stage === 'Integration' || r.stage === 'Transformation')        score += W.penalty_advanced_stage;
    if (r.ownPocket === true)                                             score += W.penalty_own_pocket;
    return Math.max(0, Math.min(100, score));
  }

  function scoreBlockedBeliever(r) {
    const W = ARCHETYPE_WEIGHTS['blocked-believer'];
    let score = 0;
    if (r.sentiment === 'Positive')                                       score += W.sentiment_positive;
    if ((r.importance ?? 0) >= 4)                                         score += W.importance_4plus;
    if (r.barriers.includes('IT / access blocks'))                        score += W.barrier_it_access;
    if (r.barriers.includes('Privacy / compliance'))                      score += W.barrier_privacy;
    if (r.barriers.includes('Unclear guidelines'))                        score += W.barrier_unclear_guidelines;
    if (r.barriers.includes('Limited access'))                            score += W.barrier_limited_access;
    if (r.frequency === 'Weekly')                                         score += W.frequency_weekly;
    if (r.frequency === 'Monthly')                                        score += W.frequency_monthly;
    if (r.excitementThemes?.includes('access_tools'))                     score += W.excitement_access_tools;
    if (r.struggleThemes?.includes('it_access_blocks'))                   score += W.struggle_it_blocks;
    if ((r.confidence ?? 0) >= 4)                                         score += W.confidence_high;
    if (r.frequency === 'Daily')                                          score += W.penalty_daily;
    if (r.sentiment === 'Negative')                                       score += W.penalty_negative_sentiment;
    const noBarrier = r.barriers.length === 0 || r.barriers.includes('No barriers');
    if (noBarrier)                                                        score += W.penalty_no_barrier;
    return Math.max(0, Math.min(100, score));
  }

  function scoreThoughtfulSkeptic(r) {
    const W = ARCHETYPE_WEIGHTS['thoughtful-skeptic'];
    let score = 0;
    if (r.sentiment === 'Mixed')                                          score += W.sentiment_mixed;
    if (r.sentiment === 'Negative')                                       score += W.sentiment_negative;
    if (r.frequency === 'Daily')                                          score += W.frequency_daily;
    if (r.frequency === 'Weekly')                                         score += W.frequency_weekly;
    if (r.frequency === 'Monthly')                                        score += W.frequency_monthly;
    if (r.barriers.includes('Accuracy concerns'))                         score += W.barrier_accuracy;
    if (r.barriers.includes('Fear of mistakes'))                          score += W.barrier_fear_mistakes;
    const textLen = combinedTextLength(r);
    if (textLen > 150)                                                    score += W.text_length_long;
    if (textLen > 300)                                                    score += W.text_length_very_long;
    if (r.struggleThemes?.includes('accuracy_reliability'))               score += W.struggle_accuracy;
    if (r.barriers.length >= 2)                                           score += W.barrier_count_2plus;
    if ((r.familiarity ?? 0) >= 3 && (r.familiarity ?? 0) <= 4)          score += W.familiarity_moderate;
    if (r.sentiment === 'Positive')                                       score += W.penalty_positive_sentiment;
    if (r.frequency === 'Rarely' || r.frequency === 'Never')              score += W.penalty_never_rarely;
    if (r.importance !== null && (r.importance ?? 99) <= 2)              score += W.penalty_importance_1_2;
    return Math.max(0, Math.min(100, score));
  }

  function scoreConfidentBystander(r) {
    const W = ARCHETYPE_WEIGHTS['confident-bystander'];
    let score = 0;
    if (r.frequency === 'Rarely')                                         score += W.frequency_rarely;
    if (r.frequency === 'Never')                                          score += W.frequency_never;
    if (r.frequency === 'Monthly')                                        score += W.frequency_monthly;
    const noBarrier = r.barriers.length === 0 || r.barriers.includes('No barriers');
    if (noBarrier)                                                        score += W.barrier_none;
    if (r.ownPocket === false)                                            score += W.own_pocket_no;
    if ((r.confidence ?? 0) >= 3)                                         score += W.confidence_moderate_high;
    if (r.tools.length === 0)                                             score += W.tools_zero;
    if (r.stage === 'Curiosity')                                          score += W.stage_curiosity;
    if (r.importance !== null && (r.importance ?? 99) <= 3)              score += W.importance_1_3;
    if (r.frequency === 'Daily' || r.frequency === 'Weekly')              score += W.penalty_daily_weekly;
    if (r.stage === 'Integration' || r.stage === 'Transformation')        score += W.penalty_advanced_stage;
    if (r.ownPocket === true)                                             score += W.penalty_own_pocket;
    if (r.barriers.some(b => ORG_BLOCK_BARRIERS.includes(b)))            score += W.penalty_blocked_barrier;
    return Math.max(0, Math.min(100, score));
  }

  // ── Classify: highest affinity score wins; tie → more advanced archetype ──

  // Internal adoption order for tiebreaking — never displayed in UI
  const ARCHETYPE_ADOPTION_ORDER = {
    multiplier: 5, experimenter: 4, 'blocked-believer': 3,
    'thoughtful-skeptic': 2, 'confident-bystander': 1,
  };

  function classifyRow(r) {
    const scores = {
      multiplier:            scoreMultiplier(r),
      experimenter:          scoreExperimenter(r),
      'blocked-believer':    scoreBlockedBeliever(r),
      'thoughtful-skeptic':  scoreThoughtfulSkeptic(r),
      'confident-bystander': scoreConfidentBystander(r),
    };
    const ranked = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const [topKey, topScore] = ranked[0];
    const [secondKey] = ranked[1];
    const secondScore = ranked[1][1];
    // Near-tie within 10%: promote to the more advanced archetype
    if (topScore > 0 && (topScore - secondScore) <= topScore * 0.10) {
      return ARCHETYPE_ADOPTION_ORDER[topKey] >= ARCHETYPE_ADOPTION_ORDER[secondKey]
        ? topKey : secondKey;
    }
    return topKey;
  }

  const ARCHETYPE_KEYS = ['multiplier', 'blocked-believer', 'thoughtful-skeptic', 'experimenter', 'confident-bystander'];

  const archetypeGroups = {};
  for (const key of ARCHETYPE_KEYS) archetypeGroups[key] = [];

  for (const row of survey3) {
    const key = classifyRow(row);
    archetypeGroups[key].push(row);
  }

  if (import.meta.env.DEV) {
    const n3 = survey3.length;
    console.log('[Archetypes] Distribution:');
    for (const k of ARCHETYPE_KEYS) {
      const c = archetypeGroups[k].length;
      console.log(`  ${k}: ${c} (${n3 ? Math.round(c/n3*100) : 0}%)`);
    }
    // Log Multiplier profiles for inspection
    console.log('[Archetypes] Multiplier profiles:');
    archetypeGroups.multiplier.forEach(r =>
      console.log(`  freq=${r.frequency} stage=${r.stage} pocket=${r.ownPocket} imp=${r.importance} kw=${voiceKeywordCount(r)}`)
    );
  }

  const archetypes = {};
  for (const key of ARCHETYPE_KEYS) {
    const rows = archetypeGroups[key];
    const n = survey3.length;

    // Pull 1 representative quote (struggle or excitement, whichever is more specific)
    const quotes = rows
      .map(r => (r.excitement || r.struggle || '').trim())
      .filter(q => q.length > 20)
      .sort((a, b) => b.length - a.length); // prefer more detailed quotes

    // Behavioral stats for pill generation
    const dailyPct = n ? Math.round((rows.filter(r => r.frequency === 'Daily').length / rows.length) * 100) : 0;
    const ownPocketPct = rows.length ? Math.round((rows.filter(r => r.ownPocket === true).length / rows.length) * 100) : 0;
    const positivePct = rows.length ? Math.round((rows.filter(r => r.sentiment === 'Positive').length / rows.length) * 100) : 0;
    const topBarrier = (() => {
      const bc = {};
      for (const r of rows) for (const b of r.barriers) if (b !== 'No barriers') bc[b] = (bc[b] || 0) + 1;
      const sorted = Object.entries(bc).sort((a, b) => b[1] - a[1]);
      return sorted[0]?.[0] || null;
    })();
    const toolCount = rows.length ? Math.round(rows.reduce((s, r) => s + r.tools.length, 0) / rows.length * 10) / 10 : 0;

    archetypes[key] = {
      key,
      count: rows.length,
      pct: n ? Math.round((rows.length / n) * 100) : 0,
      rows,
      quotes: quotes.slice(0, 5),
      stats: { dailyPct, ownPocketPct, positivePct, topBarrier, toolCount },
    };
  }

  // ── Open Text Intelligence — 4 cross-dimensional insights from S3 ───────────
  //
  // Patterns visible only when cross-referencing open text with behavioral data
  // on the same respondent. No aggregation reveals these — they require looking
  // at the whole person.

  const TEAM_KEYWORDS = [
    'team', 'colleague', 'teammate', 'others ', 'staff',
    'getting my', 'getting the ', 'getting others', 'co-worker', 'coworker',
    'department', 'buy-in', 'buy in', 'help others', 'others to use',
    'peers', 'group', 'members to', 'everyone to',
  ];

  // 1. Aspiration-Action Gap: rich excitement text + low frequency
  const aspirationGapRows = survey3.filter(r =>
    r.excitement && r.excitement.trim().length > 80 &&
    (r.frequency === 'Monthly' || r.frequency === 'Rarely' || r.frequency === 'Never')
  );
  const aspirationGap = {
    count: aspirationGapRows.length,
    pct: survey3.length ? Math.round((aspirationGapRows.length / survey3.length) * 100) : 0,
    byFreq: ['Monthly', 'Rarely', 'Never'].map(f => ({
      freq: f,
      count: aspirationGapRows.filter(r => r.frequency === f).length,
    })).filter(d => d.count > 0),
    quotes: aspirationGapRows
      .map(r => ({ text: r.excitement.trim(), freq: r.frequency }))
      .filter(q => q.text.length > 30)
      .slice(0, 4),
  };

  // 2. Tool-to-Mindset Link: Claude vs ChatGPT — different mental models of what AI is FOR
  const toolMindset = (() => {
    const claudeRows = survey3.filter(r => r.tools.some(t => /claude/i.test(t)));
    const chatgptRows = survey3.filter(r => r.tools.some(t => /chatgpt/i.test(t)));
    return {
      claude: {
        count: claudeRows.length,
        quotes: claudeRows
          .map(r => (r.excitement || '').trim())
          .filter(q => q.length > 30)
          .slice(0, 3),
      },
      chatgpt: {
        count: chatgptRows.length,
        quotes: chatgptRows
          .map(r => (r.excitement || '').trim())
          .filter(q => q.length > 30)
          .slice(0, 3),
      },
      bothCount: survey3.filter(r =>
        r.tools.some(t => /claude/i.test(t)) && r.tools.some(t => /chatgpt/i.test(t))
      ).length,
    };
  })();

  // 3. Leadership Voices: struggle text reveals informal adoption leaders
  const leadershipRows = survey3.filter(r =>
    r.struggle && TEAM_KEYWORDS.some(kw => r.struggle.toLowerCase().includes(kw))
  );
  const leadershipVoices = {
    count: leadershipRows.length,
    pct: survey3.length ? Math.round((leadershipRows.length / survey3.length) * 100) : 0,
    quotes: leadershipRows
      .map(r => r.struggle.trim())
      .filter(q => q.length > 20)
      .slice(0, 4),
  };

  // 4. Blocked Investors: paying out of pocket AND facing org friction barriers
  const blockedInvestorRows = survey3.filter(r =>
    r.ownPocket === true &&
    r.barriers.some(b => ORG_BLOCK_BARRIERS.includes(b))
  );
  const blockedInvestors = {
    count: blockedInvestorRows.length,
    pct: survey3.length ? Math.round((blockedInvestorRows.length / survey3.length) * 100) : 0,
    quotes: blockedInvestorRows
      .map(r => (r.struggle || '').trim())
      .filter(q => q.length > 20)
      .slice(0, 4),
  };

  const openTextInsights = { aspirationGap, toolMindset, leadershipVoices, blockedInvestors };

  return {
    // Cross-survey trends (the core story)
    responseCounts,
    sentimentTrend,
    confidenceTrend,
    frequencyTrend,
    familiarityTrend,
    importanceTrend,
    stageTrend,
    barriersTrend,
    // Open-ended theme analysis
    useCaseThemesTrend,
    struggleThemesS3,
    excitementThemesS3,
    openEndedText,
    // S2-specific
    toolsS2,
    // S3-specific (standalone + correlation layer)
    toolsS3,
    benefitsS3,
    momentumS3,
    ownPocketS3,
    byRole,
    byFunction,
    // S3 persona clustering
    archetypes,
    // S3 open text intelligence (cross-dimensional hidden insights)
    openTextInsights,
  };
}
