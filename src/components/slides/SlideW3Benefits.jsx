import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Cell, LabelList, ResponsiveContainer, Tooltip } from 'recharts';

const MONO = "'JetBrains Mono', 'Fira Code', monospace";
const SANS = "'Plus Jakarta Sans', DM Sans, sans-serif";

const FALLBACK_BENEFITS = [
  { label: 'Improves quality / polish', pct: 53 },
  { label: 'Saves time / reduces busywork', pct: 51 },
  { label: 'Strategic thought partner', pct: 42 },
  { label: 'Communication clarity', pct: 36 },
  { label: 'Idea generation / creative acceleration', pct: 35 },
  { label: 'Research and synthesis', pct: 21 },
  { label: 'Enablement / accessibility', pct: 18 },
  { label: 'More meaningful work', pct: 16 },
];

const BAR_COLORS = ['#2EA84A','#1a4a5e','#59BEC9','#FFCD00','#7DE69B','rgba(26,74,94,0.7)','rgba(26,74,94,0.5)','#797D80'];

function getBenefits(benefitsS3) {
  if (!benefitsS3?.length) return FALLBACK_BENEFITS;
  return benefitsS3.slice(0, 8).map(b => ({ label: b.label ?? b.benefit, pct: Math.round(b.pct) }));
}

const axisStyle = { fill: 'var(--text-medium)', fontSize: 12, fontFamily: 'DM Sans, sans-serif' };

export default function SlideW3Benefits({ transforms }) {
  const data = getBenefits(transforms?.benefitsS3);

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
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 55% 40% at 35% 50%, rgba(46,168,74,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={{ flexShrink: 0, marginBottom: 16 }}>
        <div style={{ fontFamily: MONO, fontSize: 10, color: 'var(--text-support)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 6 }}>
          Top Benefits · Wave 3
        </div>
        <h1 style={{ fontFamily: SANS, fontSize: 'clamp(26px, 3vw, 38px)', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.025em', lineHeight: 1.1, margin: 0 }}>
          The value story <span style={{ color: '#2EA84A' }}>is maturing</span>
        </h1>
        <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: 'var(--text-support)', marginTop: 4 }}>
          Staff are getting more than speed from AI
        </div>
      </motion.div>

      {/* 2-col body */}
      <div style={{ flex: 1, display: 'flex', gap: 28, minHeight: 0, overflow: 'hidden' }}>

        {/* Left — horizontal bar chart */}
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.12 }}
          style={{ flex: '0 0 57%', display: 'flex', flexDirection: 'column', gap: 8, overflow: 'hidden' }}
        >
          <div style={{ fontFamily: MONO, fontSize: 12, color: 'var(--text-medium)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Top benefits selected in Wave 3</div>
          <div style={{ flex: 1, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} layout="vertical" margin={{ top: 4, right: 44, bottom: 4, left: 4 }} barCategoryGap="18%">
                <XAxis type="number" domain={[0, 60]} hide />
                <YAxis type="category" dataKey="label" tick={axisStyle} axisLine={false} tickLine={false} width={190}
                  tickFormatter={v => v.length > 26 ? v.slice(0, 25) + '…' : v} />
                <Tooltip
                  contentStyle={{ background: '#1e2425', border: '1px solid rgba(125,230,155,0.2)', borderRadius: 8, fontFamily: 'DM Sans, sans-serif', fontSize: 11 }}
                  labelStyle={{ color: '#7DE69B', fontWeight: 700 }}
                  formatter={(v) => [`${v}%`, '']}
                />
                <Bar dataKey="pct" radius={[0, 4, 4, 0]}>
                  {data.map((_, i) => <Cell key={i} fill={BAR_COLORS[i] ?? '#797D80'} />)}
                  <LabelList dataKey="pct" position="right"
                    style={{ fill: 'var(--text-medium)', fontSize: 13, fontWeight: 700, fontFamily: 'DM Sans, sans-serif' }}
                    formatter={v => `${v}%`} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Right */}
        <motion.div
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
        >
          <div style={{ fontFamily: SANS, fontSize: 'clamp(20px, 2.4vw, 28px)', fontWeight: 900, color: '#2EA84A', lineHeight: 1.2, letterSpacing: '-0.01em', flexShrink: 0 }}>
            This is no longer just a speed story
          </div>

          <div style={{ background: 'rgba(125,230,155,0.04)', border: '1px solid rgba(125,230,155,0.14)', borderRadius: 10, padding: '14px 16px', flexShrink: 0 }}>
            <div style={{ fontFamily: SANS, fontSize: 18, fontWeight: 800, color: 'var(--text-medium)', marginBottom: 9 }}>What stands out</div>
            <ul style={{ margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                'Quality / polish edges out time savings.',
                'Strategic thought partnership is already a top-three benefit.',
                'Communication clarity and idea generation are strong secondary gains.',
              ].map((txt, i) => (
                <li key={i} style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 19, color: 'var(--text-bridge)', lineHeight: 1.55, listStyle: 'none' }}>
                  <span style={{ color: '#7DE69B', marginRight: 6 }}>●</span>{txt}
                </li>
              ))}
            </ul>
          </div>

          <div style={{ background: 'rgba(255,205,0,0.05)', border: '1px solid rgba(255,205,0,0.22)', borderRadius: 10, padding: '14px 16px', flexShrink: 0 }}>
            <span style={{ fontFamily: SANS, fontSize: 18, fontWeight: 800, color: '#FFCD00' }}>Leadership implication  </span>
            <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 18, color: 'var(--text-bridge)', lineHeight: 1.55 }}>
              The next move is to capture and spread the highest-value use cases, not just the fastest ones.
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
