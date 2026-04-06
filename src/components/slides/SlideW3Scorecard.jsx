import { motion } from 'framer-motion';

const MONO = "'JetBrains Mono', 'Fira Code', monospace";
const SANS = "'Plus Jakarta Sans', DM Sans, sans-serif";

// Static Wave 4 targets
const SCORECARD_ROWS = [
  { metric: 'Integration + Transformation', target: 'Move above 80%', getW3: (t) => {
    const adv = ['Integration', 'Transformation'];
    const pct = (t.stageTrend ?? []).filter(e => adv.includes(e.stage)).reduce((s, e) => s + (e.s3?.pct ?? 0), 0);
    return { val: `${Math.round(pct)}%`, meets: Math.round(pct) >= 74 };
  }},
  { metric: 'Very / extremely confident', target: 'Move above 75%', getW3: (t) => {
    const pct = (t.confidenceTrend?.[2]?.distribution ?? []).filter(d => d.score >= 4).reduce((s, d) => s + d.pct, 0);
    return { val: `${Math.round(pct)}%`, meets: Math.round(pct) >= 60 };
  }},
  { metric: 'Time / priorities as a barrier', target: 'Pull below 25%', getW3: (t) => {
    const row = (t.barriersTrend ?? []).find(b => b.barrier?.toLowerCase().includes('time'));
    const pct = row?.s3?.pct ?? 33.7;
    return { val: `${Math.round(pct)}%`, meets: false };
  }},
  { metric: 'Too many tools as a barrier', target: 'Pull below 10%', getW3: (t) => {
    const row = (t.barriersTrend ?? []).find(b => b.barrier?.toLowerCase().includes('too many'));
    const pct = row?.s3?.pct ?? 15.8;
    return { val: `${Math.round(pct)}%`, meets: false };
  }},
  { metric: 'Strategic thought partner benefit', target: 'Move above 50%', getW3: (t) => {
    const row = (t.benefitsS3 ?? []).find(b => b.label?.toLowerCase().includes('strategic') || b.benefit?.toLowerCase().includes('strategic'));
    const pct = row?.pct ?? 41.6;
    return { val: `${Math.round(pct)}%`, meets: false };
  }},
  { metric: 'Out-of-pocket tool spend', target: 'Reduce by expanding sanctioned support', getW3: () => ({ val: 'Reduce', meets: false, neutral: true }) },
  { metric: 'Open-text evidence', target: 'More proof of redesigned workflows and team-level gains', getW3: () => ({ val: 'Mixed', meets: false, neutral: true }) },
];

export default function SlideW3Scorecard({ transforms }) {
  const rows = SCORECARD_ROWS.map(r => ({ ...r, w3: r.getW3(transforms ?? {}) }));

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      padding: '22px 56px 18px',
      boxSizing: 'border-box',
      overflow: 'hidden',
      position: 'relative',
    }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 55% 40% at 30% 50%, rgba(46,168,74,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={{ flexShrink: 0, marginBottom: 14 }}>
        <div style={{ fontFamily: MONO, fontSize: 10, color: '#2EA84A', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 4, fontWeight: 700 }}>
          WAVE 4
        </div>
        <h1 style={{ fontFamily: SANS, fontSize: 'clamp(24px, 2.8vw, 34px)', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.025em', lineHeight: 1.1, margin: 0 }}>
          What success should look like <span style={{ color: '#2EA84A' }}>by the next survey wave</span>
        </h1>
        <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: 'var(--text-support)', marginTop: 4 }}>
          The goal is not merely more usage. The goal is better work, less friction, and clearer evidence of impact.
        </div>
      </motion.div>

      {/* 2-col body */}
      <div style={{ flex: 1, display: 'flex', gap: 24, minHeight: 0, overflow: 'hidden' }}>

        {/* Left — scorecard table */}
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.12 }}
          style={{ flex: '0 0 62%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
        >
          {/* Table header */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 90px 1fr',
            background: '#2EA84A', borderRadius: '10px 10px 0 0',
            padding: '10px 14px', gap: 8, flexShrink: 0,
          }}>
            {['Metric', 'Wave 3', 'Wave 4 success signal'].map((h, i) => (
              <div key={i} style={{ fontFamily: SANS, fontSize: 13, fontWeight: 800, color: '#fff', textAlign: i === 1 ? 'center' : 'left' }}>{h}</div>
            ))}
          </div>
          {/* Table rows */}
          <div style={{ flex: 1, overflow: 'hidden', border: '1px solid rgba(125,230,155,0.15)', borderTop: 'none', borderRadius: '0 0 10px 10px', display: 'flex', flexDirection: 'column' }}>
            {rows.map((row, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.18 + i * 0.06 }}
                style={{
                  display: 'grid', gridTemplateColumns: '1fr 90px 1fr',
                  padding: '11px 14px', gap: 8,
                  borderBottom: i < rows.length - 1 ? '1px solid rgba(125,230,155,0.08)' : 'none',
                  background: i % 2 === 0 ? 'transparent' : 'rgba(125,230,155,0.02)',
                  alignItems: 'center',
                  flex: 1,
                }}
              >
                <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: 'var(--text-medium)' }}>{row.metric}</div>
                <div style={{
                  fontFamily: MONO, fontSize: 13, fontWeight: 700, textAlign: 'center',
                  color: row.w3.neutral ? '#797D80' : row.w3.meets ? '#2EA84A' : '#E5554F',
                }}>
                  {row.w3.val}
                </div>
                <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: 'var(--text-bridge)', lineHeight: 1.4 }}>{row.target}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right — callouts */}
        <motion.div
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.22 }}
          style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}
        >
          <div style={{ background: 'rgba(89,190,201,0.06)', border: '1px solid rgba(89,190,201,0.25)', borderLeft: '3px solid #59BEC9', borderRadius: 10, padding: '12px 14px' }}>
            <div style={{ fontFamily: SANS, fontSize: 15, fontWeight: 800, color: '#59BEC9', marginBottom: 5 }}>What to watch for</div>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 15, color: 'var(--text-bridge)', lineHeight: 1.6, margin: 0 }}>
              The next wave should tell us whether AI is simply being used more, or whether work itself is being redesigned and improved.
            </p>
          </div>

          <div style={{ background: 'rgba(46,168,74,0.05)', border: '1px solid rgba(46,168,74,0.22)', borderLeft: '3px solid #2EA84A', borderRadius: 10, padding: '12px 14px' }}>
            <div style={{ fontFamily: SANS, fontSize: 15, fontWeight: 800, color: '#2EA84A', marginBottom: 5 }}>Best indicator of progress</div>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 15, color: 'var(--text-bridge)', lineHeight: 1.6, margin: 0 }}>
              Fewer comments about access and tool confusion. More comments about team workflows, automation, quality, and reclaimed time.
            </p>
          </div>

          {/* Pull quote */}
          <div style={{
            background: 'rgba(125,230,155,0.06)', border: '1px solid rgba(125,230,155,0.15)',
            borderRadius: 10, padding: '14px 16px', marginTop: 'auto',
          }}>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: 28, lineHeight: 0.8, color: '#7DE69B', opacity: 0.7, marginBottom: 8 }}>&#8220;</div>
            <p style={{ fontFamily: SANS, fontSize: 15, fontStyle: 'italic', color: 'var(--text-medium)', lineHeight: 1.6, margin: 0 }}>
              The value in daily and weekly use is less about quantity of activity and more about quality of output.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
