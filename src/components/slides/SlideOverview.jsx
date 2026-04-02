import { motion } from 'framer-motion';

const MONO = "'JetBrains Mono', 'Fira Code', monospace";
const SANS = "'Plus Jakarta Sans', DM Sans, sans-serif";
const TOTAL = 117; // total MarCom team size

function hexToRgb(hex) {
  const c = hex.replace('#', '');
  return [parseInt(c.slice(0,2),16), parseInt(c.slice(2,4),16), parseInt(c.slice(4,6),16)].join(',');
}

const CARD_CONTEXT = [
  "Corporate average: ~30% daily. This team is now 3× that — and climbing.",
  "Fewer than 5 in 10 were positive at the start. Now it's 7 in 10. That's a culture shift.",
  "Nearly every respondent rates themselves capable or above. Confidence didn't just grow — it normalized.",
  "One in three isn't waiting for budget approval. They invest with their own money — that's conviction.",
];

function TransformCard({ before, after, label, delta, color, context, delay = 0 }) {
  const rgb = hexToRgb(color);
  const afterNum = parseFloat(String(after).replace('%', ''));

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay }}
      style={{
        background: `rgba(${rgb},0.05)`,
        border: `1px solid rgba(${rgb},0.15)`,
        borderTop: `3px solid ${color}`,
        borderRadius: 12,
        padding: '18px 20px',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      <div style={{ fontFamily: MONO, fontSize: 9, color: '#797D80', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 10 }}>
        {label}
      </div>

      {before ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
          <span style={{ fontFamily: SANS, fontSize: 'clamp(22px, 2.3vw, 30px)', fontWeight: 900, color: 'rgba(255,255,255,0.22)', lineHeight: 1, letterSpacing: '-0.03em' }}>{before}</span>
          <span style={{ color: `rgba(${rgb},0.5)`, fontSize: 16, fontWeight: 300 }}>→</span>
          <span style={{ fontFamily: SANS, fontSize: 'clamp(32px, 3.5vw, 46px)', fontWeight: 900, color: color, lineHeight: 1, letterSpacing: '-0.03em' }}>{after}</span>
        </div>
      ) : (
        <div style={{ fontFamily: SANS, fontSize: 'clamp(32px, 3.5vw, 46px)', fontWeight: 900, color: color, lineHeight: 1, letterSpacing: '-0.03em', marginBottom: 6 }}>{after}</div>
      )}

      {delta && (
        <div style={{ display: 'inline-flex', alignSelf: 'flex-start', fontFamily: 'DM Sans, sans-serif', fontSize: 11, fontWeight: 700, color: color, background: `rgba(${rgb},0.1)`, border: `1px solid rgba(${rgb},0.2)`, borderRadius: 20, padding: '2px 9px', marginBottom: 12 }}>
          {delta}
        </div>
      )}

      <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#797D80', lineHeight: 1.65, margin: '0 0 12px', flex: 1 }}>
        {context}
      </p>

      <div style={{ height: 4, borderRadius: 4, background: 'rgba(255,255,255,0.07)', overflow: 'hidden', flexShrink: 0 }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(afterNum, 100)}%` }}
          transition={{ duration: 0.9, delay: delay + 0.35, ease: 'easeOut' }}
          style={{ height: '100%', background: `linear-gradient(90deg, rgba(${rgb},0.5), ${color})`, borderRadius: 4 }}
        />
      </div>
    </motion.div>
  );
}

function ParticipationPod({ survey, n, accent, delay = 0 }) {
  const pct = Math.round((n / TOTAL) * 100);
  const rgb = hexToRgb(accent);
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      style={{
        flex: 1,
        background: `rgba(${rgb},0.05)`,
        border: `1px solid rgba(${rgb},0.15)`,
        borderRadius: 10,
        padding: '14px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}
    >
      <div style={{ fontFamily: MONO, fontSize: 9, color: '#797D80', letterSpacing: '0.12em', textTransform: 'uppercase' }}>{survey}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span style={{ fontFamily: SANS, fontSize: 32, fontWeight: 900, color: accent, lineHeight: 1, letterSpacing: '-0.03em' }}>{pct}%</span>
        <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: '#797D80' }}>{n} of {TOTAL}</span>
      </div>
      <div style={{ height: 4, borderRadius: 4, background: 'rgba(255,255,255,0.07)', overflow: 'hidden' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, delay: delay + 0.2, ease: 'easeOut' }}
          style={{ height: '100%', background: accent, borderRadius: 4 }}
        />
      </div>
    </motion.div>
  );
}

export default function SlideOverview({ transforms }) {
  const { responseCounts, sentimentTrend, frequencyTrend, confidenceTrend, ownPocketS3, benefitsS3 } = transforms;

  const totalN   = responseCounts.reduce((sum, s) => sum + (s.n ?? 0), 0);
  const s1n      = responseCounts[0]?.n ?? 97;
  const s2n      = responseCounts[1]?.n ?? 106;
  const s3n      = responseCounts[2]?.n ?? 89;

  const positive  = sentimentTrend.find(e => e.sentiment === 'Positive');
  const s1PosPct  = positive?.s1?.pct ?? 0;
  const s3PosPct  = positive?.s3?.pct ?? 0;
  const sentDelta = Math.round(s3PosPct - s1PosPct);

  const getDaily = (idx) => frequencyTrend[idx]?.distribution?.find(d => d.label === 'Daily')?.pct ?? 0;
  const s1Daily  = getDaily(0);
  const s3Daily  = getDaily(2);

  const confPct = (idx) => (confidenceTrend[idx]?.distribution ?? []).filter(d => d.score >= 3).reduce((sum, d) => sum + d.pct, 0);
  const s1ConfPct = Math.round(confPct(0));
  const s3ConfPct = Math.round(confPct(2));

  const ownPocketPct    = ownPocketS3?.yesPct ?? 0;
  const topBenefitLabel = benefitsS3?.[0]?.label ?? 'Time savings';

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      padding: '28px 56px 24px',
      boxSizing: 'border-box',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Ambient glow */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 60% 50% at 50% 40%, rgba(46,168,74,0.05) 0%, transparent 70%)',
      }} />

      {/* ── PARTICIPATION STORY ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        style={{ flexShrink: 0, marginBottom: 18 }}
      >
        <div style={{
          fontFamily: MONO, fontSize: 10, color: 'rgba(125,230,155,0.6)',
          letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 10,
        }}>
          They showed up. Three times. — {totalN} total voices
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <ParticipationPod survey="Survey 1 · Jan–Feb 2025"  n={s1n} accent="#59BEC9" delay={0.08} />
          <ParticipationPod survey="Survey 2 · Aug–Sep 2025"  n={s2n} accent="#2EA84A" delay={0.14} />
          <ParticipationPod survey="Survey 3 · Mar 2026"      n={s3n} accent="#7DE69B" delay={0.20} />
        </div>

        {/* Narrative */}
        <div style={{ borderLeft: '3px solid rgba(125,230,155,0.3)', paddingLeft: 14, marginTop: 12 }}>
          <p style={{
            fontFamily: 'DM Sans, sans-serif', fontSize: 13,
            color: 'rgba(255,255,255,0.55)', fontStyle: 'italic',
            lineHeight: 1.6, margin: 0,
          }}>
            Most organizations can't get half their team to answer one survey. This team did it three times — over 14 months — with response rates above 76% every round. The data below only exists because of the people above.
          </p>
        </div>
      </motion.div>

      {/* Divider */}
      <div style={{ height: 1, background: 'rgba(125,230,155,0.08)', marginBottom: 18, flexShrink: 0 }} />

      {/* ── TRANSFORMATION HEADLINE ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.1 }}
        style={{ flexShrink: 0, marginBottom: 16 }}
      >
        <h1 style={{
          fontFamily: SANS, fontSize: 'clamp(28px, 3.8vw, 46px)',
          fontWeight: 900, color: '#ffffff',
          letterSpacing: '-0.03em', lineHeight: 1.0, margin: 0,
        }}>
          14 months changed{' '}
          <span style={{ color: '#7DE69B' }}>everything.</span>
        </h1>
      </motion.div>

      {/* ── 4 TRANSFORMATION CARDS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, flex: 1, minHeight: 0 }}>
        {[
          { label: 'Daily Usage',           before: `${s1Daily}%`,   after: `${s3Daily}%`,   delta: `+${s3Daily - s1Daily}pp over 14 months`,          color: '#7DE69B' },
          { label: 'Positive Sentiment',    before: `${s1PosPct}%`,  after: `${s3PosPct}%`,  delta: sentDelta >= 0 ? `+${sentDelta}pp growth` : `${sentDelta}pp`, color: '#2EA84A' },
          { label: 'Confident or Higher',   before: `${s1ConfPct}%`, after: `${s3ConfPct}%`, delta: `+${s3ConfPct - s1ConfPct}pp confidence lift`,      color: '#59BEC9' },
          { label: 'Paying Their Own Pocket', before: null,          after: `${ownPocketPct}%`, delta: `#1 benefit: ${topBenefitLabel}`,               color: '#E5554F' },
        ].map((card, i) => (
          <TransformCard key={card.label} {...card} context={CARD_CONTEXT[i]} delay={0.18 + i * 0.07} />
        ))}
      </div>
    </div>
  );
}
