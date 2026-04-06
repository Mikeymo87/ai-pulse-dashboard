import { motion } from 'framer-motion';

const MONO = "'JetBrains Mono', 'Fira Code', monospace";
const SANS = "'Plus Jakarta Sans', DM Sans, sans-serif";

const QUADRANTS = [
  {
    num: '1', color: '#2EA84A',
    title: 'What is working',
    body: 'Staff clearly see the value. Sentiment, usage, confidence, and perceived importance all moved in the right direction. 90% use AI daily, 96% are familiar with it, and 69% feel positive about where it is headed.',
  },
  {
    num: '2', color: '#59BEC9',
    title: 'What is changing',
    body: 'The barrier mix is shifting from literacy and access toward time pressure, tool sprawl, and workflow friction. 77% now use tools beyond the official stack — a signal that demand has outpaced the operating environment.',
  },
  {
    num: '3', color: '#E5554F',
    title: 'What staff is asking for',
    body: 'More integration with real work systems, clearer tool standards, and less performative pressure around AI use. Open text surfaces a "sport mode" pattern — staff want practical value, not visible AI activity.',
  },
  {
    num: '4', color: '#FFCD00',
    title: 'What leaders should do',
    body: 'Move from broad encouragement to targeted enablement: redesign workflows with AI in the loop, rationalize the tool stack, fix access bottlenecks, and create room for builders to experiment at small scale.',
  },
];

function getBottomStats(t) {
  // 98% weekly or daily (Wave 3)
  const freq = t.frequencyTrend?.[2]?.distribution ?? [];
  const weeklyDaily = freq.filter(d => ['Weekly', 'Daily'].includes(d.label)).reduce((s, d) => s + d.pct, 0);

  // 96% top-2 familiarity (Wave 3)
  const famTop2 = (t.familiarityTrend?.[2]?.distribution ?? []).filter(d => d.score >= 4).reduce((s, d) => s + d.pct, 0);

  // 93% confident or better (Wave 3) — score >= 3
  const confPct = (t.confidenceTrend?.[2]?.distribution ?? []).filter(d => d.score >= 3).reduce((s, d) => s + d.pct, 0);

  return [
    { val: `${Math.round(weeklyDaily)}%`, label: 'weekly or daily use' },
    { val: `${Math.round(famTop2)}%`, label: 'top-2 familiarity levels' },
    { val: `${Math.round(confPct)}%`, label: 'confident or better' },
  ];
}

export default function SlideW3BigPicture({ transforms }) {
  const stats = getBottomStats(transforms ?? {});

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
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 55% 45% at 25% 50%, rgba(46,168,74,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Eyebrow */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(125,230,155,0.6)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 12, flexShrink: 0 }}
      >
        The big picture · The clearest read on this wave
      </motion.div>

      {/* Main 2-col layout */}
      <div style={{ flex: 1, display: 'flex', gap: 28, minHeight: 0, overflow: 'hidden' }}>

        {/* Left — hero statement */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{ flex: '0 0 38%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 16 }}
        >
          <div>
            <div style={{ fontFamily: SANS, fontSize: 'clamp(24px, 3vw, 40px)', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1.15, letterSpacing: '-0.025em' }}>
              Adoption is no longer the issue.
            </div>
            <div style={{ fontFamily: SANS, fontSize: 'clamp(24px, 3vw, 40px)', fontWeight: 900, color: '#7DE69B', lineHeight: 1.15, letterSpacing: '-0.025em' }}>
              Enablement is.
            </div>
          </div>
          <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 16, color: 'var(--text-bridge)', lineHeight: 1.65, margin: 0 }}>
            We do not need another awareness campaign. We need stronger workflow design, clearer tool strategy, and practical support that helps staff use AI well.
          </p>

          {/* 3 mini stat pills */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {stats.map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  fontFamily: SANS, fontSize: 'clamp(24px, 2.8vw, 32px)', fontWeight: 900,
                  color: ['#2EA84A', '#59BEC9', '#FFCD00'][i], lineHeight: 1, minWidth: 64,
                }}>
                  {s.val}
                </div>
                <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: 'var(--text-support)', lineHeight: 1.3 }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right — 2×2 quadrant cards */}
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 12, minHeight: 0 }}>
          {QUADRANTS.map((q, i) => (
            <motion.div
              key={q.num}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.2 + i * 0.09 }}
              style={{
                background: 'var(--card-bg)',
                border: '1px solid rgba(125,230,155,0.1)',
                borderRadius: 12,
                padding: '16px 18px',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                overflow: 'hidden',
              }}
            >
              <div style={{
                width: 44, height: 44, borderRadius: '50%',
                background: `${q.color}22`,
                border: `2px solid ${q.color}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: MONO, fontSize: 20, fontWeight: 800, color: q.color,
                flexShrink: 0, marginBottom: 4,
              }}>
                {q.num}
              </div>
              <div style={{ fontFamily: SANS, fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.01em', lineHeight: 1.2 }}>
                {q.title}
              </div>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 15, color: 'var(--text-bridge)', lineHeight: 1.6, margin: 0 }}>
                {q.body}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Leadership takeaway callout */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.6 }}
        style={{
          marginTop: 14,
          background: 'rgba(125,230,155,0.04)',
          borderLeft: '3px solid rgba(125,230,155,0.4)',
          borderRadius: '0 8px 8px 0',
          padding: '12px 16px',
          flexShrink: 0,
        }}
      >
        <span style={{ fontFamily: SANS, fontSize: 15, fontWeight: 700, color: '#7DE69B' }}>Leadership takeaway  </span>
        <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 15, color: 'var(--text-bridge)', lineHeight: 1.6 }}>
          The department has enough individual adoption to prove the value. The next phase is making that value consistent and scalable across teams.
        </span>
      </motion.div>
    </div>
  );
}
