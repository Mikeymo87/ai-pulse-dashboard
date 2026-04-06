import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, LabelList, ResponsiveContainer, Tooltip } from 'recharts';

const MONO = "'JetBrains Mono', 'Fira Code', monospace";
const SANS = "'Plus Jakarta Sans', DM Sans, sans-serif";

const STAGE_COLORS = {
  Awareness:       '#FFCD00',
  Experimentation: '#59BEC9',
  Integration:     '#1a4a5e',
  Transformation:  '#2EA84A',
};

function getMaturityData(stageTrend) {
  const stages = ['Awareness', 'Experimentation', 'Integration', 'Transformation'];
  const s2 = { name: 'Wave 2' };
  const s3 = { name: 'Wave 3' };
  stages.forEach(st => {
    const row = stageTrend?.find(e => e.stage === st);
    s2[st] = Math.round(row?.s2?.pct ?? 0);
    s3[st] = Math.round(row?.s3?.pct ?? 0);
  });
  return [s2, s3];
}

function getIntTrans(stageTrend) {
  const adv = ['Integration', 'Transformation'];
  const s2 = (stageTrend ?? []).filter(e => adv.includes(e.stage)).reduce((s, e) => s + (e.s2?.pct ?? 0), 0);
  const s3 = (stageTrend ?? []).filter(e => adv.includes(e.stage)).reduce((s, e) => s + (e.s3?.pct ?? 0), 0);
  return { s2: Math.round(s2), s3: Math.round(s3) };
}

function getMomentum(momentumS3) {
  const find = (label) => momentumS3?.find(m => m.label?.toLowerCase().includes(label))?.pct ?? 0;
  return [
    { val: Math.round(find('inconsistent') || find('siloed') || 25), label: 'Inconsistent or siloed', color: '#E5554F' },
    { val: Math.round(find('steady') || 42), label: 'Steady', color: '#59BEC9' },
    { val: Math.round(find('accelerat') || 34), label: 'Accelerating', color: '#2EA84A' },
  ];
}

const axisStyle = { fill: 'var(--text-medium)', fontSize: 13, fontFamily: 'DM Sans, sans-serif' };

export default function SlideW3Journey({ transforms }) {
  const chartData = getMaturityData(transforms?.stageTrend);
  const intTrans = getIntTrans(transforms?.stageTrend);
  const momentum = getMomentum(transforms?.momentumS3);

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
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 55% 40% at 50% 50%, rgba(46,168,74,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={{ flexShrink: 0, marginBottom: 16 }}>
        <div style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(125,230,155,0.6)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 6 }}>
          AI Maturity · Department Journey
        </div>
        <h1 style={{ fontFamily: SANS, fontSize: 'clamp(26px, 3vw, 38px)', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.025em', lineHeight: 1.1, margin: 0 }}>
          Where staff are on <span style={{ color: '#2EA84A' }}>the AI journey</span>
        </h1>
        <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: 'var(--text-support)', marginTop: 4 }}>
          Momentum is real, but it is not yet fully consistent across teams
        </div>
      </motion.div>

      {/* 2-col body */}
      <div style={{ flex: 1, display: 'flex', gap: 28, minHeight: 0, overflow: 'hidden' }}>

        {/* Left */}
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.12 }}
          style={{ flex: '0 0 55%', display: 'flex', flexDirection: 'column', gap: 10, overflow: 'hidden' }}
        >
          <div style={{ fontFamily: MONO, fontSize: 12, color: 'var(--text-medium)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Stage of AI maturity</div>
          <div style={{ flex: 1, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 40, bottom: 4, left: 8 }} barCategoryGap="30%">
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis type="category" dataKey="name" tick={axisStyle} axisLine={false} tickLine={false} width={52} />
                <Tooltip
                  contentStyle={{ background: '#1e2425', border: '1px solid rgba(125,230,155,0.2)', borderRadius: 8, fontFamily: 'DM Sans, sans-serif', fontSize: 11 }}
                  labelStyle={{ color: '#7DE69B', fontWeight: 700 }}
                  itemStyle={{ color: '#c0c8d0' }}
                />
                {Object.entries(STAGE_COLORS).map(([stage, color]) => (
                  <Bar key={stage} dataKey={stage} stackId="a" fill={color}>
                    <LabelList dataKey={stage} position="center"
                      style={{ fill: stage === 'Experimentation' || stage === 'Awareness' ? '#1a1d1e' : '#fff', fontSize: 13, fontWeight: 700, fontFamily: 'DM Sans, sans-serif' }}
                      formatter={v => v > 8 ? `${v}%` : ''} />
                  </Bar>
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', flexShrink: 0 }}>
            {Object.entries(STAGE_COLORS).map(([stage, color]) => (
              <div key={stage} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: color }} />
                <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: 'var(--text-support)' }}>{stage}</span>
              </div>
            ))}
          </div>

          {/* Integration + Transformation comparison */}
          <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
            {[{ val: intTrans.s2, label: 'Wave 2', color: '#59BEC9' }, { val: intTrans.s3, label: 'Wave 3', color: '#2EA84A', delta: true }].map((s, i) => (
              <div key={i} style={{
                flex: 1, background: 'var(--card-bg)', border: `1px solid rgba(125,230,155,0.1)`,
                borderLeft: `4px solid ${s.color}`, borderRadius: 10, padding: '10px 12px',
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <div style={{ fontFamily: SANS, fontSize: 'clamp(24px, 2.8vw, 34px)', fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.val}%</div>
                <div>
                  <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: 'var(--text-support)' }}>{s.label}</div>
                  {s.delta && <div style={{ fontFamily: MONO, fontSize: 9, color: '#2EA84A', marginTop: 2 }}>+{intTrans.s3 - intTrans.s2}pts</div>}
                </div>
              </div>
            ))}
          </div>

          {/* What changed callout */}
          <div style={{ background: 'rgba(125,230,155,0.04)', border: '1px solid rgba(125,230,155,0.12)', borderRadius: 10, padding: '10px 14px', flexShrink: 0 }}>
            <span style={{ fontFamily: SANS, fontSize: 15, fontWeight: 800, color: 'var(--text-medium)' }}>What changed  </span>
            <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 15, color: 'var(--text-bridge)', lineHeight: 1.55 }}>
              Staff are moving up the maturity curve. The biggest gain is in integration and transformation.
            </span>
          </div>
        </motion.div>

        {/* Right */}
        <motion.div
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}
        >
          <div style={{ fontFamily: MONO, fontSize: 12, color: 'var(--text-medium)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            How Wave 3 describes department momentum
          </div>

          {momentum.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 + i * 0.08 }}
              style={{
                background: 'var(--card-bg)', border: `1px solid rgba(125,230,155,0.1)`,
                borderLeft: `4px solid ${m.color}`, borderRadius: 10,
                padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14,
              }}
            >
              <div style={{ fontFamily: SANS, fontSize: 'clamp(28px, 3vw, 38px)', fontWeight: 900, color: m.color, lineHeight: 1, minWidth: 64 }}>
                {m.val}%
              </div>
              <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: 'var(--text-medium)', fontWeight: 600 }}>{m.label}</div>
            </motion.div>
          ))}

          {/* Plainspoken takeaway */}
          <div style={{ background: 'rgba(125,230,155,0.04)', border: '1px solid rgba(125,230,155,0.14)', borderRadius: 10, padding: '12px 14px', marginTop: 4 }}>
            <div style={{ fontFamily: SANS, fontSize: 15, fontWeight: 800, color: 'var(--text-medium)', marginBottom: 6 }}>Plainspoken takeaway</div>
            <ul style={{ margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 5 }}>
              {[
                'The department has momentum.',
                'But one in four still experiences AI as inconsistent or siloed.',
                'That is the gap between individual wins and team-level operating change.',
              ].map((txt, i) => (
                <li key={i} style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: 'var(--text-bridge)', lineHeight: 1.5, listStyle: 'none' }}>
                  <span style={{ color: '#7DE69B', marginRight: 6 }}>●</span>{txt}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
