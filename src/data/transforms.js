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
  };
}
