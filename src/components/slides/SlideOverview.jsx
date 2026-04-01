import { motion } from 'framer-motion';

export default function SlideOverview({ transforms }) {
  const {
    responseCounts,
    sentimentTrend,
    frequencyTrend,
    confidenceTrend,
    ownPocketS3,
    benefitsS3,
    momentumS3,
  } = transforms;

  const totalN = responseCounts.reduce((sum, s) => sum + (s.n ?? 0), 0);

  const positive   = sentimentTrend.find(e => e.sentiment === 'Positive');
  const s1PosPct   = positive?.s1?.pct ?? 0;
  const s3PosPct   = positive?.s3?.pct ?? 0;
  const sentDelta  = Math.round(s3PosPct - s1PosPct);

  const getDaily = (idx) => frequencyTrend[idx]?.distribution?.find(d => d.label === 'Daily')?.pct ?? 0;
  const s1Daily  = getDaily(0);
  const s3Daily  = getDaily(2);

  const confPct = (idx) =>
    (confidenceTrend[idx]?.distribution ?? [])
      .filter(d => d.score >= 3)
      .reduce((sum, d) => sum + d.pct, 0);
  const s1ConfPct = Math.round(confPct(0));
  const s3ConfPct = Math.round(confPct(2));

  const ownPocketPct    = ownPocketS3?.yesPct ?? 0;
  const topBenefitLabel = benefitsS3?.[0]?.label ?? 'Time savings';
  const topBenefitPct   = benefitsS3?.[0]?.pct ?? 0;

  const METRICS = [
    {
      label: 'Daily Usage',
      before: `${s1Daily}%`,
      after: `${s3Daily}%`,
      delta: `+${s3Daily - s1Daily}pp`,
      color: '#7DE69B',
      note: 'Survey 1 → Survey 3',
    },
    {
      label: 'Positive Sentiment',
      before: `${s1PosPct}%`,
      after: `${s3PosPct}%`,
      delta: sentDelta >= 0 ? `+${sentDelta}pp` : `${sentDelta}pp`,
      color: '#2EA84A',
      note: 'Survey 1 → Survey 3',
    },
    {
      label: 'Confident or Higher',
      before: `${s1ConfPct}%`,
      after: `${s3ConfPct}%`,
      delta: `+${s3ConfPct - s1ConfPct}pp`,
      color: '#FFCD00',
      note: 'Survey 1 → Survey 3',
    },
    {
      label: 'Paying Own Pocket',
      before: null,
      after: `${ownPocketPct}%`,
      delta: topBenefitPct > 0 ? `#1 benefit: ${topBenefitLabel}` : '',
      color: '#E5554F',
      note: 'Survey 3 only',
    },
  ];

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '0 80px',
      boxSizing: 'border-box',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Ambient glow */}
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 600,
        height: 400,
        borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(46,168,74,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Eyebrow */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          fontSize: 11,
          color: '#797D80',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          marginBottom: 18,
          textAlign: 'center',
        }}
      >
        Baptist Health · Marketing &amp; Communications
      </motion.div>

      {/* Headline */}
      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.08 }}
        style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: 'clamp(52px, 6vw, 80px)',
          fontWeight: 900,
          color: '#ffffff',
          letterSpacing: '-0.03em',
          lineHeight: 1.05,
          margin: '0 0 8px',
          textAlign: 'center',
        }}
      >
        AI Adoption
        <span style={{ color: '#7DE69B', display: 'block' }}>In Motion</span>
      </motion.h1>

      {/* Sub */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.18 }}
        style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: 15,
          color: '#797D80',
          margin: '0 0 40px',
          textAlign: 'center',
          letterSpacing: '0.01em',
        }}
      >
        14 months · 3 surveys ·{' '}
        <span style={{ color: '#7DE69B', fontWeight: 700 }}>{totalN} responses</span>
      </motion.p>

      {/* Big 3 stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.26 }}
        style={{
          display: 'flex',
          gap: 0,
          marginBottom: 40,
          position: 'relative',
        }}
      >
        {[
          { value: totalN, label: 'Total Responses', color: '#7DE69B' },
          { value: 3,      label: 'Pulse Surveys',   color: '#59BEC9' },
          { value: 14,     label: 'Months Tracked',  color: '#2EA84A' },
        ].map((stat, i) => (
          <div
            key={stat.label}
            style={{
              padding: '0 48px',
              textAlign: 'center',
              borderRight: i < 2 ? '1px solid rgba(125,230,155,0.1)' : 'none',
            }}
          >
            <div style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 'clamp(48px, 5vw, 72px)',
              fontWeight: 900,
              color: stat.color,
              lineHeight: 1,
              letterSpacing: '-0.03em',
            }}>
              {stat.value}
            </div>
            <div style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 12,
              color: '#797D80',
              marginTop: 6,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              fontWeight: 500,
            }}>
              {stat.label}
            </div>
          </div>
        ))}
      </motion.div>

      {/* 4-metric delta grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.36 }}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 12,
          width: '100%',
          maxWidth: 900,
        }}
      >
        {METRICS.map((m) => (
          <div
            key={m.label}
            style={{
              background: `rgba(255,255,255,0.03)`,
              border: `1px solid ${m.color}22`,
              borderTop: `2px solid ${m.color}`,
              borderRadius: 12,
              padding: '16px 18px',
              boxSizing: 'border-box',
            }}
          >
            <div style={{
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              fontSize: 9,
              color: '#797D80',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: 8,
            }}>
              {m.label}
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
              {m.before && (
                <>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: 'rgba(255,255,255,0.3)', fontWeight: 500 }}>
                    {m.before}
                  </span>
                  <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 11 }}>→</span>
                </>
              )}
              <span style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: m.before ? 22 : 26,
                fontWeight: 900,
                color: m.color,
                lineHeight: 1,
                letterSpacing: '-0.02em',
              }}>
                {m.after}
              </span>
            </div>

            {m.delta && (
              <div style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 11,
                color: `${m.color}bb`,
                marginTop: 6,
                fontWeight: 500,
              }}>
                {m.delta}
              </div>
            )}

            <div style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 10,
              color: 'rgba(121,125,128,0.5)',
              marginTop: 4,
            }}>
              {m.note}
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
