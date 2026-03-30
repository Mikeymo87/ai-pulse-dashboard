import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// ─── Category config ──────────────────────────────────────────────────────────
const CATEGORY_CONFIG = {
  ENABLEMENT: { color: '#7DE69B', bg: 'rgba(125,230,155,0.12)', icon: '◈' },
  ADOPTION:   { color: '#59BEC9', bg: 'rgba(89,190,201,0.12)',  icon: '◎' },
  RISK:       { color: '#E5554F', bg: 'rgba(229,85,79,0.12)',   icon: '◉' },
  MOMENTUM:   { color: '#2EA84A', bg: 'rgba(46,168,74,0.12)',   icon: '◆' },
};

// ─── Skeleton card ────────────────────────────────────────────────────────────
function SkeletonCard({ delay = 0 }) {
  return (
    <motion.div
      animate={{ opacity: [0.4, 0.75, 0.4] }}
      transition={{ repeat: Infinity, duration: 1.6, delay }}
      style={{
        background: 'rgba(29,77,82,0.35)',
        border: '1px solid rgba(125,230,155,0.15)',
        borderRadius: 16,
        padding: '28px 28px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        minHeight: 220,
      }}
    >
      {/* badge row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 90, height: 20, background: 'rgba(255,255,255,0.08)', borderRadius: 20 }} />
      </div>
      {/* headline */}
      <div style={{ width: '80%', height: 22, background: 'rgba(255,255,255,0.07)', borderRadius: 6 }} />
      {/* body lines */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ width: '100%', height: 13, background: 'rgba(255,255,255,0.05)', borderRadius: 4 }} />
        <div style={{ width: '92%',  height: 13, background: 'rgba(255,255,255,0.05)', borderRadius: 4 }} />
        <div style={{ width: '70%',  height: 13, background: 'rgba(255,255,255,0.05)', borderRadius: 4 }} />
      </div>
      {/* stat */}
      <div style={{ marginTop: 'auto', width: '55%', height: 16, background: 'rgba(255,255,255,0.06)', borderRadius: 4 }} />
    </motion.div>
  );
}

// ─── Insight card ─────────────────────────────────────────────────────────────
function InsightCard({ card, index }) {
  const cfg = CATEGORY_CONFIG[card.category] || CATEGORY_CONFIG.MOMENTUM;
  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.55, delay: index * 0.12, ease: 'easeOut' }}
      style={{
        background: 'rgba(29,77,82,0.35)',
        border: `1px solid rgba(125,230,155,0.15)`,
        borderRadius: 16,
        padding: '28px 28px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
      }}
    >
      {/* category badge + icon */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          background: cfg.bg,
          border: `1px solid ${cfg.color}40`,
          borderRadius: 20,
          padding: '3px 12px 3px 9px',
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '0.12em',
          color: cfg.color,
          fontFamily: 'Inter, sans-serif',
          textTransform: 'uppercase',
        }}>
          <span style={{ fontSize: 8 }}>{cfg.icon}</span>
          {card.category}
        </span>
      </div>

      {/* headline */}
      <p style={{
        margin: 0,
        fontFamily: 'Inter, sans-serif',
        fontSize: 17,
        fontWeight: 800,
        color: '#f0f2f4',
        lineHeight: 1.35,
      }}>
        {card.headline}
      </p>

      {/* body */}
      <p style={{
        margin: 0,
        fontFamily: 'Inter, sans-serif',
        fontSize: 13.5,
        fontWeight: 400,
        color: '#b0b8c0',
        lineHeight: 1.65,
        flex: 1,
      }}>
        {card.body}
      </p>

      {/* supporting stat */}
      <div style={{
        marginTop: 4,
        paddingTop: 14,
        borderTop: '1px solid rgba(255,255,255,0.07)',
        fontFamily: 'Inter, sans-serif',
        fontSize: 12,
        fontWeight: 600,
        color: cfg.color,
        letterSpacing: '0.03em',
      }}>
        {card.stat}
      </div>
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function OpportunitySpotlight({ transforms }) {
  const [cards, setCards] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchInsights() {
      const {
        sentimentTrend,
        familiarityTrend,
        frequencyTrend,
        importanceTrend,
        confidenceTrend,
        stageTrend,
        barriersTrend,
        ownPocketS3,
        momentumS3,
        benefitsS3,
      } = transforms;

      // ── Compute stats for prompt ──────────────────────────────────────────
      const s1PosPct = sentimentTrend.find(e => e.sentiment === 'Positive')?.s1.pct ?? 0;
      const s2PosPct = sentimentTrend.find(e => e.sentiment === 'Positive')?.s2.pct ?? 0;
      const s3PosPct = sentimentTrend.find(e => e.sentiment === 'Positive')?.s3.pct ?? 0;
      const s1NegPct = sentimentTrend.find(e => e.sentiment === 'Negative')?.s1.pct ?? 0;
      const s3NegPct = sentimentTrend.find(e => e.sentiment === 'Negative')?.s3.pct ?? 0;

      const getFreqPct = (idx, label) =>
        frequencyTrend[idx]?.distribution.find(d => d.label === label)?.pct ?? 0;
      const s1Daily = getFreqPct(0, 'Daily');
      const s2Daily = getFreqPct(1, 'Daily');
      const s3Daily = getFreqPct(2, 'Daily');
      const s1Never = getFreqPct(0, 'Never');
      const s3Never = getFreqPct(2, 'Never');

      const confPct = (idx) =>
        (confidenceTrend[idx]?.distribution ?? [])
          .filter(d => d.score >= 3)
          .reduce((sum, d) => sum + d.pct, 0);
      const s1ConfPct = confPct(0);
      const s2ConfPct = confPct(1);
      const s3ConfPct = confPct(2);

      const ADVANCED = ['Experimentation', 'Integration', 'Transformation'];
      const s2AdvPct = stageTrend
        .filter(e => ADVANCED.includes(e.stage))
        .reduce((sum, e) => sum + e.s2.pct, 0);
      const s3AdvPct = stageTrend
        .filter(e => ADVANCED.includes(e.stage))
        .reduce((sum, e) => sum + e.s3.pct, 0);

      const top5 = [...barriersTrend]
        .filter(b => b.barrier !== 'No barriers')
        .sort((a, b) => b.s3.pct - a.s3.pct)
        .slice(0, 5)
        .map(b => ({ barrier: b.barrier, s1: b.s1.pct, s2: b.s2.pct, s3: b.s3.pct }));

      const ctx = {
        totalResponses: 292,
        surveys: [
          { name: 'Survey 1', period: 'Jan–Feb 2025', n: 97 },
          { name: 'Survey 2', period: 'Aug–Sep 2025', n: 106 },
          { name: 'Survey 3', period: 'Mar 2026',     n: 89  },
        ],
        sentiment: { s1PosPct, s2PosPct, s3PosPct, s1NegPct, s3NegPct },
        familiarity: {
          s1Avg: familiarityTrend[0]?.avg ?? 0,
          s2Avg: familiarityTrend[1]?.avg ?? 0,
          s3Avg: familiarityTrend[2]?.avg ?? 0,
          scale: '1=Unfamiliar, 5=Expert',
        },
        importance: {
          s1Avg: importanceTrend[0]?.avg ?? 0,
          s2Avg: importanceTrend[1]?.avg ?? 0,
          s3Avg: importanceTrend[2]?.avg ?? 0,
          scale: '1–5',
        },
        frequency: { s1Daily, s2Daily, s3Daily, s1Never, s3Never },
        confidence: {
          s1ConfidentPct: s1ConfPct,
          s2ConfidentPct: s2ConfPct,
          s3ConfidentPct: s3ConfPct,
          note: 'Pct scoring Confident or higher (normalized across different scale versions)',
        },
        stage: {
          s2ExperimentationOrHigherPct: s2AdvPct,
          s3ExperimentationOrHigherPct: s3AdvPct,
          note: 'S2 and S3 only — stage question not in Survey 1',
        },
        barriers: top5,
        ownPocket: { yesPct: ownPocketS3.yesPct, note: 'S3 only — % paying out of pocket for AI tools' },
        momentum: momentumS3.slice(0, 4),
        topBenefits: benefitsS3.slice(0, 3),
      };

      // ── API call ──────────────────────────────────────────────────────────
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
            max_tokens: 1024,
            system: `You are a data analyst for Baptist Health's Marketing & Communications department.
You will receive structured survey data from 3 pulse surveys (Jan–Feb 2025, Aug–Sep 2025, Mar 2026)
covering AI adoption across the department (292 total responses).
Return ONLY a valid JSON array of exactly 4 insight objects. No explanation, no markdown, no wrapper text.
Each object must have: { "category": string, "headline": string, "body": string, "stat": string }
category must be one of: ENABLEMENT, ADOPTION, RISK, MOMENTUM
headline: 8–12 words, punchy, declarative, present-tense
body: 2–3 sentences grounded strictly in the data provided — no invented numbers, no extrapolation
stat: one key supporting data point as a short string, e.g. "↑ 34% daily use in Survey 3"`,
            messages: [{
              role: 'user',
              content: `Here is the structured survey data. Generate 4 insight cards — one per category (ENABLEMENT, ADOPTION, RISK, MOMENTUM):\n\n${JSON.stringify(ctx, null, 2)}`,
            }],
          }),
        });

        if (!res.ok) throw new Error(`API error ${res.status}`);
        const data = await res.json();
        const text = data.content?.[0]?.text ?? '';
        const parsed = JSON.parse(text);
        if (!Array.isArray(parsed) || parsed.length !== 4) throw new Error('Unexpected response shape');
        setCards(parsed);
      } catch (err) {
        console.error('OpportunitySpotlight API error:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchInsights();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <section
      id="spotlight"
      style={{
        padding: '96px 24px 80px',
        maxWidth: 1120,
        margin: '0 auto',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      {/* Section header */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        style={{ marginBottom: 52, textAlign: 'center' }}
      >
        <span style={{
          display: 'inline-block',
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '0.18em',
          color: '#7DE69B',
          textTransform: 'uppercase',
          marginBottom: 14,
        }}>
          AI-Powered Insights
        </span>
        <h2 style={{
          margin: '0 0 14px',
          fontSize: 'clamp(28px, 4vw, 40px)',
          fontWeight: 900,
          color: '#f0f2f4',
          lineHeight: 1.15,
          letterSpacing: '-0.02em',
        }}>
          Where the Opportunity Lives
        </h2>
        <p style={{
          margin: 0,
          fontSize: 15,
          color: '#797D80',
          maxWidth: 520,
          marginInline: 'auto',
          lineHeight: 1.6,
        }}>
          Claude analyzed 14 months of survey data to surface the patterns that matter most.
        </p>
      </motion.div>

      {/* Card grid */}
      {loading && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))',
          gap: 24,
        }}>
          {[0, 1, 2, 3].map(i => <SkeletonCard key={i} delay={i * 0.2} />)}
        </div>
      )}

      {error && (
        <div style={{
          background: 'rgba(29,77,82,0.25)',
          border: '1px solid rgba(125,230,155,0.1)',
          borderRadius: 16,
          padding: '32px 28px',
          color: '#797D80',
          fontFamily: 'Inter, sans-serif',
          fontSize: 14,
          textAlign: 'center',
        }}>
          Insights unavailable — check your API key in <code style={{ color: '#7DE69B', fontSize: 12 }}>.env</code> or refresh to try again.
        </div>
      )}

      {cards && !error && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))',
          gap: 24,
        }}>
          {cards.map((card, i) => (
            <InsightCard key={card.category} card={card} index={i} />
          ))}
        </div>
      )}
    </section>
  );
}
