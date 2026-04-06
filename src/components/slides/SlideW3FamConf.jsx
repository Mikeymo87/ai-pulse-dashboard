import { motion } from 'framer-motion';

const MONO = "'JetBrains Mono', 'Fira Code', monospace";
const SANS = "'Plus Jakarta Sans', DM Sans, sans-serif";

function getFamVals(familiarityTrend) {
  const colors = ['#2EA84A', '#59BEC9', '#1a4a5e'];
  return (familiarityTrend ?? []).map((wave, i) => {
    const top2 = (wave.distribution ?? []).filter(d => d.score >= 4).reduce((s, d) => s + d.pct, 0);
    return { val: Math.round(top2), color: colors[i], label: `Wave ${i + 1}` };
  });
}

function getConfVals(confidenceTrend) {
  const colors = ['#E5554F', '#FFCD00', '#1a4a5e'];
  return (confidenceTrend ?? []).map((wave, i) => {
    const veryConf = (wave.distribution ?? []).filter(d => d.score >= 4).reduce((s, d) => s + d.pct, 0);
    return { val: Math.round(veryConf), color: colors[i], label: `Wave ${i + 1}` };
  });
}

function StatColumn({ title, items, calloutTitle, calloutColor, bullets }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, overflow: 'hidden' }}
    >
      <div style={{ fontFamily: MONO, fontSize: 10, color: '#797D80', letterSpacing: '0.12em', textTransform: 'uppercase', flexShrink: 0 }}>{title}</div>
      {/* Cards stretch to fill available height */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, minHeight: 0 }}>
        {items.map((s, i) => (
          <div key={i} style={{
            flex: 1,
            background: 'var(--card-bg)', border: `1px solid rgba(125,230,155,0.1)`,
            borderLeft: `5px solid ${s.color}`, borderRadius: 12,
            padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 20,
          }}>
            <div style={{ fontFamily: SANS, fontSize: 'clamp(52px, 6vw, 80px)', fontWeight: 900, color: s.color, lineHeight: 1, minWidth: 100 }}>
              {s.val}%
            </div>
            <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 16, fontWeight: 600, color: 'var(--text-medium)' }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{
        background: `rgba(125,230,155,0.04)`,
        border: `1px solid ${calloutColor}33`,
        borderRadius: 10, padding: '14px 16px', flexShrink: 0,
      }}>
        <div style={{ fontFamily: SANS, fontSize: 14, fontWeight: 800, color: 'var(--text-medium)', marginBottom: 8 }}>{calloutTitle}</div>
        <ul style={{ margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {bullets.map((txt, i) => (
            <li key={i} style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: 'var(--text-bridge)', lineHeight: 1.55, listStyle: 'none' }}>
              <span style={{ color: calloutColor, marginRight: 8 }}>●</span>{txt}
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}

export default function SlideW3FamConf({ transforms }) {
  const famVals = getFamVals(transforms?.familiarityTrend);
  const confVals = getConfVals(transforms?.confidenceTrend);

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 56px 20px',
      boxSizing: 'border-box',
      overflow: 'hidden',
      position: 'relative',
    }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(89,190,201,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={{ flexShrink: 0, marginBottom: 20 }}>
        <div style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(125,230,155,0.6)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 6 }}>
          Familiarity &amp; Confidence — Three Waves
        </div>
        <h1 style={{ fontFamily: SANS, fontSize: 'clamp(26px, 3vw, 38px)', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.025em', lineHeight: 1.1, margin: 0 }}>
          Familiarity is high.{' '}
          <span style={{ color: '#2EA84A' }}>Confidence is climbing.</span>
        </h1>
        <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: 'var(--text-support)', marginTop: 4 }}>
          The next support model should shift from AI 101 to role-based application
        </div>
      </motion.div>

      {/* 2-col body */}
      <div style={{ flex: 1, display: 'flex', gap: 32, minHeight: 0, overflow: 'hidden' }}>
        <StatColumn
          title="Top-2 familiarity levels"
          items={famVals}
          calloutTitle="What this means"
          calloutColor="#7DE69B"
          bullets={[
            'The literacy floor has risen sharply.',
            'Generic awareness sessions are now lower value than function-specific use cases.',
            'Most people understand AI tools well enough to benefit from more practical support.',
          ]}
        />
        <div style={{ width: 1, background: 'rgba(125,230,155,0.08)', flexShrink: 0 }} />
        <StatColumn
          title="Very or extremely confident"
          items={confVals}
          calloutTitle="Why confidence still needs context"
          calloutColor="#59BEC9"
          bullets={[
            'Confidence is rising fast, but advanced capability is still unevenly distributed.',
            'That argues for a two-track model: practical integration for most people and builder support for the advanced group.',
          ]}
        />
      </div>
    </div>
  );
}
