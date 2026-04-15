import { motion } from 'framer-motion';

const MONO = "'JetBrains Mono', 'Fira Code', monospace";
const SANS = "'Plus Jakarta Sans', DM Sans, sans-serif";

function getFamVals(familiarityTrend) {
  const colors = ['#2EA84A', '#59BEC9', '#7DE69B'];
  return (familiarityTrend ?? []).map((wave, i) => {
    const top2 = (wave.distribution ?? []).filter(d => d.score >= 4).reduce((s, d) => s + d.pct, 0);
    return { val: Math.round(top2), color: colors[i], label: `Wave ${i + 1}` };
  });
}

function getConfVals(confidenceTrend) {
  const colors = ['#E5554F', '#FFCD00', '#2EA84A'];
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
      style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14, overflow: 'hidden' }}
    >
      {/* Top: label + cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1, justifyContent: 'space-between' }}>
        <div style={{ fontFamily: MONO, fontSize: 10, color: 'var(--text-support)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>{title}</div>
        {items.map((s, i) => (
          <div key={i} style={{
            background: 'var(--card-bg)', border: `1px solid rgba(125,230,155,0.1)`,
            borderLeft: `5px solid ${s.color}`, borderRadius: 12,
            padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 16,
            minHeight: 90,
          }}>
            <div style={{ fontFamily: SANS, fontSize: 'clamp(44px, 5.5vw, 68px)', fontWeight: 900, color: s.color, lineHeight: 1, minWidth: 80 }}>
              {s.val}%
            </div>
            <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 16, fontWeight: 600, color: 'var(--text-medium)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Bottom: callout */}
      <div style={{
        background: 'var(--card-bg)',
        borderLeft: `4px solid ${calloutColor}`,
        borderRadius: 10, padding: '14px 16px',
      }}>
        <div style={{ fontFamily: SANS, fontSize: 18, fontWeight: 800, color: 'var(--text-medium)', marginBottom: 8 }}>{calloutTitle}</div>
        <ul style={{ margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {bullets.map((txt, i) => (
            <li key={i} style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 18, color: 'var(--text-bridge)', lineHeight: 1.55, listStyle: 'none' }}>
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
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={{ flexShrink: 0, marginBottom: 12 }}>
        <div style={{ fontFamily: MONO, fontSize: 10, color: 'var(--text-support)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 6 }}>
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
        <div style={{ width: 1, background: 'rgba(125,230,155,0.2)', flexShrink: 0 }} />
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
