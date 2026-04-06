import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Cell, LabelList, ResponsiveContainer, Tooltip } from 'recharts';

const MONO = "'JetBrains Mono', 'Fira Code', monospace";
const SANS = "'Plus Jakarta Sans', DM Sans, sans-serif";

const W1_FALLBACK = [
  { label: 'Accuracy / reliability', pct: 38, color: '#FFCD00' },
  { label: 'Limited access to AI tools', pct: 38, color: '#59BEC9' },
  { label: 'Lack of understanding / training', pct: 37, color: '#2EA84A' },
  { label: 'No barriers', pct: 21, color: '#797D80' },
  { label: 'Fear of mistakes', pct: 10, color: '#E5554F' },
];

const W3_FALLBACK = [
  { label: 'Lack of time / competing priorities', pct: 34, color: '#E5554F' },
  { label: 'No barriers', pct: 31, color: '#797D80' },
  { label: 'Accuracy / reliability', pct: 21, color: '#FFCD00' },
  { label: 'Too many tools / not sure which', pct: 16, color: '#1a4a5e' },
  { label: 'Limited access to AI tools', pct: 11, color: '#59BEC9' },
];

function getBarriersForWave(barriersTrend, waveKey) {
  if (!barriersTrend?.length) return waveKey === 's1' ? W1_FALLBACK : W3_FALLBACK;

  const BARRIER_COLORS = {
    'Accuracy': '#FFCD00',
    'Limited access': '#59BEC9',
    'Lack of understanding': '#2EA84A',
    'No barriers': '#797D80',
    'Fear of mistakes': '#E5554F',
    'Lack of time': '#E5554F',
    'Too many tools': '#1a4a5e',
  };

  const getColor = (label) => {
    for (const [key, color] of Object.entries(BARRIER_COLORS)) {
      if (label?.toLowerCase().includes(key.toLowerCase())) return color;
    }
    return '#797D80';
  };

  return barriersTrend
    .map(b => ({ label: b.barrier, pct: Math.round(b[waveKey]?.pct ?? 0), color: getColor(b.barrier) }))
    .filter(b => b.pct > 0)
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 5);
}

const axisStyle = { fill: 'var(--text-medium)', fontSize: 12, fontFamily: 'DM Sans, sans-serif' };

function BarPanel({ title, data, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, overflow: 'hidden' }}
    >
      <div style={{
        fontFamily: MONO, fontSize: 12, color: 'var(--text-medium)',
        letterSpacing: '0.12em', textTransform: 'uppercase',
      }}>{title}</div>
      <div style={{ flex: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 4, right: 44, bottom: 4, left: 4 }} barCategoryGap="22%">
            <XAxis type="number" domain={[0, 45]} hide />
            <YAxis type="category" dataKey="label" tick={axisStyle} axisLine={false} tickLine={false} width={175}
              tickFormatter={v => v.length > 28 ? v.slice(0, 27) + '…' : v} />
            <Tooltip
              contentStyle={{ background: '#1e2425', border: '1px solid rgba(125,230,155,0.2)', borderRadius: 8, fontFamily: 'DM Sans, sans-serif', fontSize: 11 }}
              labelStyle={{ color: '#7DE69B', fontWeight: 700 }}
              formatter={(v) => [`${v}%`, '']}
            />
            <Bar dataKey="pct" radius={[0, 4, 4, 0]}>
              {data.map((d, i) => <Cell key={i} fill={d.color} />)}
              <LabelList dataKey="pct" position="right"
                style={{ fill: 'var(--text-medium)', fontSize: 13, fontWeight: 700, fontFamily: 'DM Sans, sans-serif' }}
                formatter={v => `${v}%`} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

export default function SlideW3Barriers({ transforms }) {
  const w1Data = getBarriersForWave(transforms?.barriersTrend, 's1');
  const w3Data = getBarriersForWave(transforms?.barriersTrend, 's3');

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
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 50% 35% at 50% 40%, rgba(229,85,79,0.04) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={{ flexShrink: 0, marginBottom: 16 }}>
        <div style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(125,230,155,0.6)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 6 }}>
          Barriers to AI Use · Wave 1 vs. Wave 3
        </div>
        <h1 style={{ fontFamily: SANS, fontSize: 'clamp(26px, 3vw, 38px)', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.025em', lineHeight: 1.1, margin: 0 }}>
          The barriers <span style={{ color: '#2EA84A' }}>have changed</span>
        </h1>
        <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: 'var(--text-support)', marginTop: 4 }}>
          From literacy and access gaps to time pressure, tool sprawl, and workflow friction
        </div>
      </motion.div>

      {/* 2-col charts */}
      <div style={{ flex: 1, display: 'flex', gap: 20, minHeight: 0, overflow: 'hidden' }}>
        <BarPanel title="Wave 1 barriers" data={w1Data} delay={0.12} />
        <div style={{ width: 1, background: 'rgba(125,230,155,0.08)', flexShrink: 0 }} />
        <BarPanel title="Wave 3 barriers" data={w3Data} delay={0.22} />
      </div>

      {/* What changed callout */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.5 }}
        style={{
          marginTop: 14,
          background: 'rgba(125,230,155,0.04)',
          border: '1px solid rgba(125,230,155,0.14)',
          borderRadius: 10,
          padding: '12px 16px',
          flexShrink: 0,
        }}
      >
        <span style={{ fontFamily: SANS, fontSize: 15, fontWeight: 800, color: 'var(--text-medium)' }}>What changed  </span>
        <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 15, color: 'var(--text-bridge)', lineHeight: 1.6 }}>
          Earlier barriers were more about learning and access. Now the largest blocker is time, followed by reliability questions and too many tools. That is a sign of adoption maturing faster than the operating environment.
        </span>
      </motion.div>
    </div>
  );
}
