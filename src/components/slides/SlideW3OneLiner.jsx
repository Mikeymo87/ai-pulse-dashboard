import { motion } from 'framer-motion';

const MONO = "'JetBrains Mono', 'Fira Code', monospace";
const SANS = "'Plus Jakarta Sans', DM Sans, sans-serif";

const STAT_CARDS = [
  {
    color: '#2EA84A',
    getVal: (t) => {
      const pos = t.sentimentTrend?.find(e => e.sentiment === 'Positive');
      return pos ? `${Math.round(pos.s3.pct)}%` : '69%';
    },
    label: 'Positive sentiment in Wave 3',
    sub: 'vs. 50% in Wave 1',
  },
  {
    color: '#59BEC9',
    getVal: (t) => {
      const daily = t.frequencyTrend?.[2]?.distribution?.find(d => d.label === 'Daily');
      return daily ? `${Math.round(daily.pct)}%` : '90%';
    },
    label: 'Daily AI use in Wave 3',
    sub: 'vs. 42% in Wave 1',
  },
  {
    color: '#7DE69B',
    getVal: (t) => {
      const adv = ['Integration', 'Transformation'];
      const pct = (t.stageTrend ?? [])
        .filter(e => adv.includes(e.stage))
        .reduce((sum, e) => sum + (e.s3?.pct ?? 0), 0);
      return `${Math.round(pct)}%`;
    },
    label: 'At integration or transformation',
    sub: 'up from 60% in Wave 2',
  },
  {
    color: '#FFCD00',
    getVal: (t) => {
      const imp = t.importanceTrend?.[2];
      if (!imp) return '87%';
      const high = (imp.distribution ?? []).filter(d => d.score >= 4).reduce((s, d) => s + d.pct, 0);
      return `${Math.round(high)}%`;
    },
    label: 'Say AI is highly important',
    sub: 'rate 4 or 5',
  },
];

export default function SlideW3OneLiner({ transforms }) {
  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      padding: '32px 56px 28px',
      boxSizing: 'border-box',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Ambient glow */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 60% 40% at 50% 20%, rgba(46,168,74,0.07) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Eyebrow */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(125,230,155,0.6)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 14, flexShrink: 0 }}
      >
        AI Engagement Pulse · Wave 3 · Baptist Health MarCom
      </motion.div>

      {/* Headline */}
      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.08 }}
        style={{
          fontFamily: SANS, fontSize: 'clamp(24px, 2.8vw, 36px)', fontWeight: 900,
          color: 'var(--text-primary)', letterSpacing: '-0.025em', lineHeight: 1.2,
          margin: '0 0 28px', flexShrink: 0,
        }}
      >
        The story in one line: adoption is strong, but the next phase requires{' '}
        <span style={{ color: '#7DE69B' }}>workflow redesign</span>,{' '}
        <span style={{ color: '#59BEC9' }}>better access</span>, and{' '}
        <span style={{ color: '#FFCD00' }}>more practical enablement</span>.
      </motion.h1>

      {/* Body — fills remaining space */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14, minHeight: 0 }}>

        {/* 4 stat cards */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.18 }}
          style={{ flex: 2, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, minHeight: 0 }}
        >
          {STAT_CARDS.map((card, i) => {
            const val = card.getVal(transforms ?? {});
            return (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.22 + i * 0.08 }}
                style={{
                  background: 'var(--card-bg)',
                  border: `1px solid rgba(125,230,155,0.1)`,
                  borderLeft: `4px solid ${card.color}`,
                  borderRadius: 12,
                  padding: '24px 20px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                <div style={{ fontFamily: SANS, fontSize: 'clamp(40px, 4.5vw, 60px)', fontWeight: 900, color: card.color, lineHeight: 1, letterSpacing: '-0.03em' }}>
                  {val}
                </div>
                <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 16, color: 'var(--text-medium)', fontWeight: 600, lineHeight: 1.3 }}>
                  {card.label}
                </div>
                <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: 'var(--text-support)', marginTop: 2 }}>
                  {card.sub}
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* What this means callout */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.55 }}
          style={{
            flex: 1,
            background: 'rgba(125,230,155,0.05)',
            border: '1px solid rgba(125,230,155,0.18)',
            borderRadius: 12,
            padding: '20px 24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <div style={{ fontFamily: SANS, fontSize: 16, fontWeight: 800, color: 'var(--text-medium)', marginBottom: 8 }}>
            What this means
          </div>
          <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 16, color: 'var(--text-bridge)', lineHeight: 1.65, margin: 0 }}>
            This department has crossed the adoption threshold. The next leadership job is to reduce friction and help teams redesign work so AI creates better outcomes, not just more activity.
          </p>
        </motion.div>

      </div>

      {/* n= caption */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.7 }}
        style={{ fontFamily: MONO, fontSize: 9, color: 'rgba(121,125,128,0.4)', letterSpacing: '0.06em', marginTop: 14, flexShrink: 0 }}
      >
        n = 97 in Wave 1, 106 in Wave 2, 101 in Wave 3
      </motion.div>
    </div>
  );
}
