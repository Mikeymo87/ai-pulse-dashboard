import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

const CATEGORY_CONFIG = {
  ENABLEMENT: { color: '#7DE69B', bg: 'rgba(125,230,155,0.1)',  icon: '◈' },
  ADOPTION:   { color: '#59BEC9', bg: 'rgba(89,190,201,0.1)',   icon: '◎' },
  RISK:       { color: '#E5554F', bg: 'rgba(229,85,79,0.1)',    icon: '◉' },
  MOMENTUM:   { color: '#2EA84A', bg: 'rgba(46,168,74,0.1)',    icon: '◆' },
  READINESS:  { color: '#b388ff', bg: 'rgba(179,136,255,0.1)',  icon: '◇' },
};

function SkeletonCard({ delay = 0 }) {
  return (
    <motion.div
      animate={{ opacity: [0.35, 0.6, 0.35] }}
      transition={{ repeat: Infinity, duration: 1.6, delay }}
      style={{
        background: 'rgba(29,77,82,0.3)',
        border: '1px solid rgba(125,230,155,0.12)',
        borderRadius: 14,
        padding: '20px 22px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        overflow: 'hidden',
      }}
    >
      <div style={{ width: 80, height: 18, background: 'rgba(255,255,255,0.08)', borderRadius: 20 }} />
      <div style={{ width: '75%', height: 18, background: 'rgba(255,255,255,0.06)', borderRadius: 5 }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        <div style={{ width: '100%', height: 11, background: 'rgba(255,255,255,0.04)', borderRadius: 3 }} />
        <div style={{ width: '88%',  height: 11, background: 'rgba(255,255,255,0.04)', borderRadius: 3 }} />
        <div style={{ width: '65%',  height: 11, background: 'rgba(255,255,255,0.04)', borderRadius: 3 }} />
      </div>
      <div style={{ marginTop: 'auto', width: '50%', height: 13, background: 'rgba(255,255,255,0.05)', borderRadius: 3 }} />
    </motion.div>
  );
}

function InsightCard({ card, index }) {
  const cfg = CATEGORY_CONFIG[card.category] || CATEGORY_CONFIG.MOMENTUM;
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.1 }}
      style={{
        background: 'rgba(29,77,82,0.28)',
        border: `1px solid rgba(125,230,155,0.12)`,
        borderTop: `2px solid ${cfg.color}60`,
        borderRadius: 14,
        padding: '18px 20px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        overflow: 'hidden',
      }}
    >
      {/* Badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 5,
          background: cfg.bg,
          border: `1px solid ${cfg.color}35`,
          borderRadius: 20,
          padding: '2px 10px 2px 8px',
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: '0.12em',
          color: cfg.color,
          fontFamily: 'Inter, sans-serif',
          textTransform: 'uppercase',
        }}>
          <span style={{ fontSize: 7 }}>{cfg.icon}</span>
          {card.category}
        </span>
      </div>

      {/* Headline */}
      <p style={{
        margin: 0,
        fontFamily: 'Inter, sans-serif',
        fontSize: 15,
        fontWeight: 800,
        color: '#f0f2f4',
        lineHeight: 1.3,
        overflow: 'hidden',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
      }}>
        {card.headline}
      </p>

      {/* Body */}
      <p style={{
        margin: 0,
        fontFamily: 'Inter, sans-serif',
        fontSize: 12,
        fontWeight: 400,
        color: '#9aa4b0',
        lineHeight: 1.6,
        flex: 1,
        overflow: 'hidden',
        display: '-webkit-box',
        WebkitLineClamp: 3,
        WebkitBoxOrient: 'vertical',
      }}>
        {card.body}
      </p>

      {/* Recommendation */}
      {card.action && (
        <div style={{
          background: `${cfg.color}0d`,
          border: `1px solid ${cfg.color}22`,
          borderRadius: 8,
          padding: '8px 11px',
          display: 'flex',
          gap: 6,
          alignItems: 'flex-start',
          flexShrink: 0,
        }}>
          <span style={{ color: cfg.color, fontSize: 10, fontWeight: 700, flexShrink: 0, paddingTop: 1 }}>→</span>
          <p style={{
            margin: 0,
            fontFamily: 'Inter, sans-serif',
            fontSize: 11,
            fontWeight: 500,
            color: '#c8d4e0',
            lineHeight: 1.5,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}>
            {card.action}
          </p>
        </div>
      )}

      {/* Stat */}
      <div style={{
        paddingTop: 10,
        borderTop: '1px solid rgba(255,255,255,0.06)',
        fontFamily: 'Inter, sans-serif',
        fontSize: 11,
        fontWeight: 600,
        color: cfg.color,
        letterSpacing: '0.02em',
        flexShrink: 0,
      }}>
        {card.stat}
      </div>
    </motion.div>
  );
}

export default function SlideSpotlight({ transforms }) {
  const [cards, setCards]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(false);
  const fetchedRef          = useRef(false);

  const fetchInsights = useCallback(async () => {
    const {
      sentimentTrend, familiarityTrend, frequencyTrend,
      importanceTrend, confidenceTrend, stageTrend,
      barriersTrend, ownPocketS3, momentumS3, benefitsS3,
    } = transforms;

    const s1PosPct = sentimentTrend.find(e => e.sentiment === 'Positive')?.s1.pct ?? 0;
    const s2PosPct = sentimentTrend.find(e => e.sentiment === 'Positive')?.s2.pct ?? 0;
    const s3PosPct = sentimentTrend.find(e => e.sentiment === 'Positive')?.s3.pct ?? 0;
    const s1NegPct = sentimentTrend.find(e => e.sentiment === 'Negative')?.s1.pct ?? 0;
    const s3NegPct = sentimentTrend.find(e => e.sentiment === 'Negative')?.s3.pct ?? 0;

    const getFreqPct = (idx, label) => frequencyTrend[idx]?.distribution.find(d => d.label === label)?.pct ?? 0;
    const s1Daily = getFreqPct(0, 'Daily');
    const s2Daily = getFreqPct(1, 'Daily');
    const s3Daily = getFreqPct(2, 'Daily');
    const s1Never = getFreqPct(0, 'Never');
    const s3Never = getFreqPct(2, 'Never');

    const confPct = (idx) =>
      (confidenceTrend[idx]?.distribution ?? []).filter(d => d.score >= 3).reduce((sum, d) => sum + d.pct, 0);

    const ADVANCED = ['Experimentation', 'Integration', 'Transformation'];
    const s2AdvPct = stageTrend.filter(e => ADVANCED.includes(e.stage)).reduce((sum, e) => sum + e.s2.pct, 0);
    const s3AdvPct = stageTrend.filter(e => ADVANCED.includes(e.stage)).reduce((sum, e) => sum + e.s3.pct, 0);

    const top5 = [...barriersTrend].filter(b => b.barrier !== 'No barriers')
      .sort((a, b) => b.s3.pct - a.s3.pct).slice(0, 5)
      .map(b => ({ barrier: b.barrier, s1: b.s1.pct, s2: b.s2.pct, s3: b.s3.pct }));

    const roleBreakdown = (transforms.byRole ?? []).map(r => ({
      role: r.role, n: r.count,
      confidenceAvg: r.confidenceAvg, importanceAvg: r.importanceAvg, familiarityAvg: r.familiarityAvg,
    }));
    const functionBreakdown = (transforms.byFunction ?? []).map(f => ({
      function: f.function, n: f.count,
      confidenceAvg: f.confidenceAvg, importanceAvg: f.importanceAvg, familiarityAvg: f.familiarityAvg,
    }));

    const ctx = {
      totalResponses: 292,
      surveys: [
        { name: 'Survey 1', period: 'Jan–Feb 2025', n: 97 },
        { name: 'Survey 2', period: 'Aug–Sep 2025', n: 106 },
        { name: 'Survey 3', period: 'Mar 2026', n: 89 },
      ],
      sentiment: { s1PosPct, s2PosPct, s3PosPct, s1NegPct, s3NegPct },
      familiarity: { s1Avg: familiarityTrend[0]?.avg ?? 0, s2Avg: familiarityTrend[1]?.avg ?? 0, s3Avg: familiarityTrend[2]?.avg ?? 0 },
      importance: { s1Avg: importanceTrend[0]?.avg ?? 0, s2Avg: importanceTrend[1]?.avg ?? 0, s3Avg: importanceTrend[2]?.avg ?? 0 },
      frequency: { s1Daily, s2Daily, s3Daily, s1Never, s3Never },
      confidence: { s1ConfidentPct: confPct(0), s2ConfidentPct: confPct(1), s3ConfidentPct: confPct(2) },
      stage: { s2ExperimentationOrHigherPct: s2AdvPct, s3ExperimentationOrHigherPct: s3AdvPct },
      barriers: top5,
      ownPocket: { yesPct: ownPocketS3.yesPct },
      momentum: momentumS3.slice(0, 4),
      topBenefits: benefitsS3.slice(0, 3),
      teamReadiness: { byRole: roleBreakdown, byFunction: functionBreakdown },
    };

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': import.meta.env.VITE_ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 1800,
          system: `You are a strategic advisor for Baptist Health's Marketing & Communications department.
Return ONLY a valid JSON array of exactly 4 insight objects. No explanation, no markdown, no wrapper text.
Each object: { "category": string, "headline": string, "body": string, "action": string, "stat": string }
category must be one of: ENABLEMENT, ADOPTION, RISK, MOMENTUM
headline: 8–12 words, punchy, declarative, present-tense
body: 2–3 sentences, strictly data-grounded — no invented numbers
action: 1–2 sentences, specific and actionable
stat: one key data point as a short string`,
          messages: [{
            role: 'user',
            content: `Generate 4 insight cards (ENABLEMENT, ADOPTION, RISK, MOMENTUM) from this survey data:\n\n${JSON.stringify(ctx, null, 2)}`,
          }],
        }),
      });

      if (!res.ok) throw new Error(`API error ${res.status}`);
      const data = await res.json();
      const rawText = data.content?.[0]?.text ?? '';
      const text = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
      const parsed = JSON.parse(text);
      if (!Array.isArray(parsed) || parsed.length < 4) throw new Error('Unexpected shape');
      setCards(parsed.slice(0, 4));
    } catch (err) {
      console.error('SlideSpotlight error:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [transforms]);

  // Fetch once on mount
  if (!fetchedRef.current) {
    fetchedRef.current = true;
    fetchInsights();
  }

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      padding: '28px 40px 24px',
      boxSizing: 'border-box',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        style={{ marginBottom: 16, flexShrink: 0 }}
      >
        <div style={{
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          fontSize: 10,
          color: '#7DE69B',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          marginBottom: 4,
        }}>
          Claude AI · Opportunity Spotlight
        </div>
        <h2 style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: 24,
          fontWeight: 800,
          color: '#ffffff',
          letterSpacing: '-0.02em',
          margin: 0,
        }}>
          Where the Opportunity Lives
        </h2>
      </motion.div>

      {/* Card grid */}
      <div style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gridTemplateRows: '1fr 1fr',
        gap: 12,
        minHeight: 0,
        overflow: 'hidden',
      }}>
        {loading && [0, 1, 2, 3].map(i => <SkeletonCard key={i} delay={i * 0.15} />)}

        {error && (
          <div style={{
            gridColumn: '1 / -1',
            gridRow: '1 / -1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: 12,
          }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#E5554F' }}>
              Could not load insights — check your API key.
            </p>
            <button
              onClick={() => { setError(false); setLoading(true); fetchedRef.current = false; fetchInsights(); }}
              style={{
                padding: '8px 18px',
                background: 'rgba(229,85,79,0.12)',
                border: '1px solid rgba(229,85,79,0.35)',
                borderRadius: 20,
                color: '#E5554F',
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && cards?.slice(0, 4).map((card, i) => (
          <InsightCard key={card.category} card={card} index={i} />
        ))}
      </div>
    </div>
  );
}
