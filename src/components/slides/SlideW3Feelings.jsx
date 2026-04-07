import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Cell, LabelList, ResponsiveContainer, Tooltip } from 'recharts';

const MONO = "'JetBrains Mono', 'Fira Code', monospace";
const SANS = "'Plus Jakarta Sans', DM Sans, sans-serif";

function getChartData(sentimentTrend) {
  const waves = [
    { name: 'Wave 1', key: 's1' },
    { name: 'Wave 2', key: 's2' },
    { name: 'Wave 3', key: 's3' },
  ];
  return waves.map(({ name, key }) => {
    const pos = sentimentTrend?.find(e => e.sentiment === 'Positive')?.[key]?.pct ?? 0;
    const mix = sentimentTrend?.find(e => e.sentiment === 'Mixed')?.[key]?.pct ?? 0;
    const neg = sentimentTrend?.find(e => e.sentiment === 'Negative')?.[key]?.pct ?? 0;
    return { name, Positive: Math.round(pos), Mixed: Math.round(mix), Negative: Math.round(neg) };
  });
}

function getImportanceVals(importanceTrend) {
  return (importanceTrend ?? []).map((wave, i) => {
    const pct = (wave.distribution ?? []).filter(d => d.score >= 4).reduce((s, d) => s + d.pct, 0);
    return { pct: Math.round(pct), color: ['#2EA84A', '#59BEC9', '#1a4a5e'][i], label: `Wave ${i + 1}` };
  });
}

const axisStyle = { fill: 'var(--text-medium)', fontSize: 13, fontFamily: 'DM Sans, sans-serif' };

export default function SlideW3Feelings({ transforms }) {
  const chartData = getChartData(transforms?.sentimentTrend);
  const impVals = getImportanceVals(transforms?.importanceTrend);

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
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 50% 35% at 30% 30%, rgba(89,190,201,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={{ flexShrink: 0, marginBottom: 16 }}>
        <div style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(125,230,155,0.6)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 6 }}>
          Sentiment &amp; Importance
        </div>
        <h1 style={{ fontFamily: SANS, fontSize: 'clamp(26px, 3vw, 38px)', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.025em', lineHeight: 1.1, margin: 0 }}>
          How staff feel about AI,{' '}
          <span style={{ color: '#2EA84A' }}>and how important it has become</span>
        </h1>
        <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: 'var(--text-support)', marginTop: 4 }}>
          Wave 3 shows a more engaged and more optimistic department
        </div>
      </motion.div>

      {/* 2-col body */}
      <div style={{ flex: 1, display: 'flex', gap: 28, minHeight: 0, overflow: 'hidden' }}>

        {/* Left — stacked bar chart */}
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.12 }}
          style={{ flex: '0 0 54%', display: 'flex', flexDirection: 'column', gap: 10, overflow: 'hidden' }}
        >
          <div style={{ fontFamily: MONO, fontSize: 12, color: 'var(--text-medium)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Feelings about AI</div>
          <div style={{ flex: 1, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 40, bottom: 4, left: 8 }} barCategoryGap="28%">
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis type="category" dataKey="name" tick={axisStyle} axisLine={false} tickLine={false} width={52} />
                <Tooltip
                  contentStyle={{ background: '#1e2425', border: '1px solid rgba(125,230,155,0.2)', borderRadius: 8, fontFamily: 'DM Sans, sans-serif', fontSize: 11 }}
                  labelStyle={{ color: '#7DE69B', fontWeight: 700 }}
                  itemStyle={{ color: '#c0c8d0' }}
                />
                <Bar dataKey="Positive" stackId="a" fill="#2EA84A" radius={[0,0,0,0]}>
                  <LabelList dataKey="Positive" position="center" style={{ fill: '#fff', fontSize: 13, fontWeight: 700, fontFamily: 'DM Sans, sans-serif' }}
                    formatter={v => v > 8 ? `${v}%` : ''} />
                </Bar>
                <Bar dataKey="Mixed" stackId="a" fill="#FFCD00">
                  <LabelList dataKey="Mixed" position="center" style={{ fill: '#1a1d1e', fontSize: 13, fontWeight: 700, fontFamily: 'DM Sans, sans-serif' }}
                    formatter={v => v > 8 ? `${v}%` : ''} />
                </Bar>
                <Bar dataKey="Negative" stackId="a" fill="#E5554F" radius={[0,4,4,0]}>
                  <LabelList dataKey="Negative" position="insideRight" style={{ fill: '#fff', fontSize: 13, fontWeight: 700, fontFamily: 'DM Sans, sans-serif' }}
                    formatter={v => v > 3 ? `${v}%` : ''} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', gap: 16, flexShrink: 0 }}>
            {[['#2EA84A','Positive'],['#FFCD00','Mixed'],['#E5554F','Negative / unsure']].map(([c,l]) => (
              <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: c }} />
                <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: 'var(--text-support)' }}>{l}</span>
              </div>
            ))}
          </div>

          {/* Read on chart callout */}
          <div style={{
            background: 'rgba(125,230,155,0.04)',
            border: '1px solid rgba(125,230,155,0.12)',
            borderRadius: 10,
            padding: '10px 14px',
            flexShrink: 0,
          }}>
            <span style={{ fontFamily: SANS, fontSize: 15, fontWeight: 800, color: 'var(--text-medium)' }}>Read on the chart  </span>
            <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 15, color: 'var(--text-bridge)', lineHeight: 1.55 }}>
              Positive sentiment rose from 49% in Wave 1 to 69% in Wave 3. Mixed feelings remain, but outright negativity is minimal.
            </span>
          </div>
        </motion.div>

        {/* Right — importance stats + callouts */}
        <motion.div
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, overflow: 'hidden' }}
        >
          <div style={{ fontFamily: MONO, fontSize: 12, color: 'var(--text-medium)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>AI rated 4 or 5 in importance</div>

          {/* 3 stat boxes */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
            {impVals.map((s, i) => (
              <div key={i} style={{
                background: 'var(--card-bg)', border: `1px solid rgba(125,230,155,0.1)`,
                borderLeft: `4px solid ${s.color}`, borderRadius: 10,
                padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 14,
              }}>
                <div style={{ fontFamily: SANS, fontSize: 'clamp(28px, 3.2vw, 40px)', fontWeight: 900, color: s.color, lineHeight: 1, minWidth: 64 }}>
                  {s.pct}%
                </div>
                <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 15, color: 'var(--text-support)' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Outside context callout */}
          <div style={{
            background: 'rgba(125,230,155,0.04)', border: '1px solid rgba(125,230,155,0.14)',
            borderRadius: 10, padding: '10px 14px',
          }}>
            <div style={{ fontFamily: SANS, fontSize: 15, fontWeight: 800, color: 'var(--text-medium)', marginBottom: 5 }}>Outside context</div>
            <ul style={{ margin: 0, paddingLeft: 14, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {[
                'Pew 2025: 52% of workers say they feel worried about future AI use in the workplace.',
                'This department looks more engaged and more positive than that broader picture.',
              ].map((txt, i) => (
                <li key={i} style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: 'var(--text-bridge)', lineHeight: 1.5, listStyle: 'none', paddingLeft: 0 }}>
                  <span style={{ color: '#7DE69B', marginRight: 6 }}>●</span>{txt}
                </li>
              ))}
            </ul>
          </div>

          {/* Why it matters callout */}
          <div style={{
            background: 'rgba(255,205,0,0.05)', border: '1px solid rgba(255,205,0,0.22)',
            borderRadius: 10, padding: '10px 14px',
          }}>
            <span style={{ fontFamily: SANS, fontSize: 15, fontWeight: 800, color: '#FFCD00' }}>Why it matters  </span>
            <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 15, color: 'var(--text-bridge)', lineHeight: 1.55 }}>
              AI is moving into core capability territory here, not optional side experimentation.
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
