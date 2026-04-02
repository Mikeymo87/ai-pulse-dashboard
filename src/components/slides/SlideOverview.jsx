import { motion } from 'framer-motion';

const MONO = "'JetBrains Mono', 'Fira Code', monospace";
const SANS = "'Plus Jakarta Sans', DM Sans, sans-serif";

function hexToRgb(hex) {
  const c = hex.replace('#', '');
  return [parseInt(c.slice(0,2),16), parseInt(c.slice(2,4),16), parseInt(c.slice(4,6),16)].join(',');
}

function SpeakerNote({ text }) {
  return (
    <div style={{
      borderTop: '1px solid rgba(125,230,155,0.08)',
      paddingTop: 10,
      flexShrink: 0,
      display: 'flex',
      alignItems: 'flex-start',
      gap: 12,
    }}>
      <span style={{
        fontFamily: MONO,
        fontSize: 9,
        color: 'rgba(125,230,155,0.45)',
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        flexShrink: 0,
        marginTop: 2,
        whiteSpace: 'nowrap',
      }}>
        Say this
      </span>
      <p style={{
        fontFamily: 'DM Sans, sans-serif',
        fontSize: 12,
        color: 'rgba(255,255,255,0.3)',
        fontStyle: 'italic',
        margin: 0,
        lineHeight: 1.55,
      }}>
        {text}
      </p>
    </div>
  );
}

const CARD_CONTEXT = [
  "Corporate average: ~30% daily. This team is now 3× that — and climbing.",
  "Fewer than 5 in 10 were positive at the start. Now it's 7 in 10. That's a culture shift.",
  "Nearly every respondent rates themselves capable or above. Confidence didn't just grow — it normalized.",
  "One in three isn't waiting for budget approval. They invest with their own money — that's belief.",
];

function TransformCard({ before, after, label, delta, color, context, delay = 0 }) {
  const rgb = hexToRgb(color);
  const afterNum = parseFloat(String(after).replace('%', ''));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      style={{
        background: `rgba(${rgb},0.05)`,
        border: `1px solid rgba(${rgb},0.15)`,
        borderTop: `3px solid ${color}`,
        borderRadius: 12,
        padding: '20px 22px',
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      {/* Label */}
      <div style={{
        fontFamily: MONO,
        fontSize: 9,
        color: '#797D80',
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        marginBottom: 12,
      }}>
        {label}
      </div>

      {/* Numbers */}
      {before ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
          <span style={{
            fontFamily: SANS,
            fontSize: 'clamp(24px, 2.5vw, 32px)',
            fontWeight: 900,
            color: 'rgba(255,255,255,0.22)',
            lineHeight: 1,
            letterSpacing: '-0.03em',
          }}>
            {before}
          </span>
          <span style={{ color: `rgba(${rgb},0.5)`, fontSize: 18, fontWeight: 300 }}>→</span>
          <span style={{
            fontFamily: SANS,
            fontSize: 'clamp(34px, 4vw, 50px)',
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
          fontFamily: SANS,
          fontSize: 'clamp(34px, 4vw, 50px)',
          fontWeight: 900,
          color: color,
          lineHeight: 1,
          letterSpacing: '-0.03em',
          marginBottom: 8,
        }}>
          {after}
        </div>
      )}

      {/* Delta badge */}
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
          marginBottom: 14,
        }}>
          {delta}
        </div>
      )}

      {/* Context fill — grows to fill remaining space */}
      <p style={{
        fontFamily: 'DM Sans, sans-serif',
        fontSize: 13,
        color: '#797D80',
        lineHeight: 1.65,
        margin: '0 0 14px',
        flex: 1,
      }}>
        {context}
      </p>

      {/* Progress bar */}
      <div style={{
        height: 4,
        borderRadius: 4,
        background: 'rgba(255,255,255,0.07)',
        overflow: 'hidden',
        flexShrink: 0,
      }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(afterNum, 100)}%` }}
          transition={{ duration: 0.8, delay: delay + 0.3, ease: 'easeOut' }}
          style={{
            height: '100%',
            background: `linear-gradient(90deg, rgba(${rgb},0.6), ${color})`,
            borderRadius: 4,
          }}
        />
      </div>
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

  const CARDS = [
    {
      label: 'Daily Usage',
      before: `${s1Daily}%`,
      after: `${s3Daily}%`,
      delta: `+${s3Daily - s1Daily}pp over 14 months`,
      color: '#7DE69B',
    },
    {
      label: 'Positive Sentiment',
      before: `${s1PosPct}%`,
      after: `${s3PosPct}%`,
      delta: sentDelta >= 0 ? `+${sentDelta}pp growth` : `${sentDelta}pp`,
      color: '#2EA84A',
    },
    {
      label: 'Confident or Higher',
      before: `${s1ConfPct}%`,
      after: `${s3ConfPct}%`,
      delta: `+${s3ConfPct - s1ConfPct}pp confidence lift`,
      color: '#59BEC9',
    },
    {
      label: 'Paying Their Own Pocket',
      before: null,
      after: `${ownPocketPct}%`,
      delta: `#1 benefit: ${topBenefitLabel}`,
      color: '#E5554F',
    },
  ];

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      padding: '32px 56px 24px',
      boxSizing: 'border-box',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Ambient glow */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(ellipse 60% 50% at 50% 40%, rgba(46,168,74,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ marginBottom: 24, flexShrink: 0 }}
      >
        <div style={{
          fontFamily: MONO,
          fontSize: 10,
          color: 'rgba(125,230,155,0.6)',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          marginBottom: 10,
        }}>
          The Full Picture — 14 Months · 3 Surveys · {totalN} Voices
        </div>
        <h1 style={{
          fontFamily: SANS,
          fontSize: 'clamp(36px, 5vw, 58px)',
          fontWeight: 900,
          color: '#ffffff',
          letterSpacing: '-0.035em',
          lineHeight: 1.0,
          margin: '0 0 8px',
        }}>
          14 months changed{' '}
          <span style={{ color: '#7DE69B' }}>everything.</span>
        </h1>
        <p style={{
          fontFamily: 'DM Sans, sans-serif',
          fontSize: 15,
          color: '#797D80',
          margin: 0,
          lineHeight: 1.5,
        }}>
          From curiosity to conviction. From 42% to {s3Daily}% daily usage. This is the transformation arc.
        </p>
      </motion.div>

      {/* 4 transformation cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 14,
        flex: 1,
        minHeight: 0,
      }}>
        {CARDS.map((card, i) => (
          <TransformCard
            key={card.label}
            {...card}
            context={CARD_CONTEXT[i]}
            delay={0.12 + i * 0.08}
          />
        ))}
      </div>

      {/* Speaker note */}
      <div style={{ marginTop: 16, flexShrink: 0 }}>
        <SpeakerNote text={`"This slide is the whole story in one breath. Let the numbers land. ${s1Daily} to ${s3Daily}. That's not incremental — that's transformation." Then ask: "What kind of team does that?"`} />
      </div>
    </div>
  );
}
