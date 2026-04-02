import { motion } from 'framer-motion';

function hexToRgb(hex) {
  const c = hex.replace('#', '');
  return [parseInt(c.slice(0,2),16), parseInt(c.slice(2,4),16), parseInt(c.slice(4,6),16)].join(',');
}

function TransformCard({ before, after, label, delta, color, delay = 0 }) {
  const rgb = hexToRgb(color);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      style={{
        background: `rgba(${rgb},0.05)`,
        border: `1px solid rgba(${rgb},0.15)`,
        borderLeft: `3px solid ${color}`,
        borderRadius: 12,
        padding: '20px 22px',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        boxSizing: 'border-box',
      }}
    >
      <div style={{
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        fontSize: 9,
        color: '#797D80',
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
      }}>
        {label}
      </div>

      {before ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <span style={{
            fontFamily: "'Plus Jakarta Sans', DM Sans, sans-serif",
            fontSize: 'clamp(28px, 3vw, 38px)',
            fontWeight: 900,
            color: 'rgba(255,255,255,0.28)',
            lineHeight: 1,
            letterSpacing: '-0.03em',
          }}>
            {before}
          </span>
          <span style={{ color: `rgba(${rgb},0.4)`, fontSize: 20, fontWeight: 300 }}>→</span>
          <span style={{
            fontFamily: "'Plus Jakarta Sans', DM Sans, sans-serif",
            fontSize: 'clamp(36px, 4vw, 52px)',
            fontWeight: 900,
            color: color,
            lineHeight: 1,
            letterSpacing: '-0.03em',
          }}>
            {after}
          </span>
        </div>
      ) : (
        <div style={{
          fontFamily: "'Plus Jakarta Sans', DM Sans, sans-serif",
          fontSize: 'clamp(36px, 4vw, 52px)',
          fontWeight: 900,
          color: color,
          lineHeight: 1,
          letterSpacing: '-0.03em',
        }}>
          {after}
        </div>
      )}

      {delta && (
        <div style={{
          display: 'inline-flex',
          alignSelf: 'flex-start',
          fontFamily: 'DM Sans, sans-serif',
          fontSize: 11,
          fontWeight: 700,
          color: color,
          background: `rgba(${rgb},0.1)`,
          border: `1px solid rgba(${rgb},0.2)`,
          borderRadius: 20,
          padding: '3px 10px',
        }}>
          {delta}
        </div>
      )}
    </motion.div>
  );
}

export default function SlideOverview({ transforms }) {
  const {
    responseCounts,
    sentimentTrend,
    frequencyTrend,
    confidenceTrend,
    ownPocketS3,
    benefitsS3,
  } = transforms;

  const totalN = responseCounts.reduce((sum, s) => sum + (s.n ?? 0), 0);

  const positive  = sentimentTrend.find(e => e.sentiment === 'Positive');
  const s1PosPct  = positive?.s1?.pct ?? 0;
  const s3PosPct  = positive?.s3?.pct ?? 0;
  const sentDelta = Math.round(s3PosPct - s1PosPct);

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

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      padding: '44px 64px 40px',
      boxSizing: 'border-box',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Ambient glow */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(46,168,74,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Eyebrow + headline */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ marginBottom: 32, flexShrink: 0 }}
      >
        <div style={{
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          fontSize: 10,
          color: 'rgba(125,230,155,0.6)',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          marginBottom: 12,
        }}>
          The Full Picture — 14 Months · 3 Surveys · {totalN} Voices
        </div>
        <h1 style={{
          fontFamily: "'Plus Jakarta Sans', DM Sans, sans-serif",
          fontSize: 'clamp(38px, 5vw, 60px)',
          fontWeight: 900,
          color: '#ffffff',
          letterSpacing: '-0.03em',
          lineHeight: 1.05,
          margin: 0,
        }}>
          14 months changed{' '}
          <span style={{ color: '#7DE69B' }}>everything.</span>
        </h1>
        <p style={{
          fontFamily: 'DM Sans, sans-serif',
          fontSize: 16,
          color: '#797D80',
          margin: '10px 0 0',
          lineHeight: 1.5,
        }}>
          From curiosity to conviction. From 42% to 92% daily usage. This is the transformation arc.
        </p>
      </motion.div>

      {/* Transformation grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 16,
        flex: 1,
        alignContent: 'stretch',
      }}>
        <TransformCard
          before={`${s1Daily}%`}
          after={`${s3Daily}%`}
          label="Daily Usage"
          delta={`+${s3Daily - s1Daily}pp over 14 months`}
          color="#7DE69B"
          delay={0.15}
        />
        <TransformCard
          before={`${s1PosPct}%`}
          after={`${s3PosPct}%`}
          label="Positive Sentiment"
          delta={sentDelta >= 0 ? `+${sentDelta}pp growth` : `${sentDelta}pp`}
          color="#2EA84A"
          delay={0.22}
        />
        <TransformCard
          before={`${s1ConfPct}%`}
          after={`${s3ConfPct}%`}
          label="Confident or Higher"
          delta={`+${s3ConfPct - s1ConfPct}pp confidence lift`}
          color="#59BEC9"
          delay={0.29}
        />
        <TransformCard
          before={null}
          after={`${ownPocketPct}%`}
          label="Paying Their Own Pocket"
          delta={`#1 benefit: ${topBenefitLabel}`}
          color="#E5554F"
          delay={0.36}
        />
      </div>

      {/* Bottom conviction line */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        style={{
          marginTop: 22,
          borderTop: '1px solid rgba(125,230,155,0.1)',
          paddingTop: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 32,
          flexShrink: 0,
        }}
      >
        {[
          { n: '3', label: 'surveys' },
          { n: '14', label: 'months' },
          { n: totalN, label: 'total responses' },
        ].map(({ n, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{
              fontFamily: "'Plus Jakarta Sans', DM Sans, sans-serif",
              fontSize: 22,
              fontWeight: 900,
              color: '#f0f4f8',
              letterSpacing: '-0.02em',
            }}>{n}</span>
            <span style={{
              fontFamily: 'DM Sans, sans-serif',
              fontSize: 11,
              color: '#797D80',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}>{label}</span>
          </div>
        ))}
        <div style={{ marginLeft: 'auto' }}>
          <span style={{
            fontFamily: 'DM Sans, sans-serif',
            fontSize: 13,
            color: '#9ca8b4',
            fontStyle: 'italic',
          }}>
            "This team chose to lead."
          </span>
        </div>
      </motion.div>
    </div>
  );
}
