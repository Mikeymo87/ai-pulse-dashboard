import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Cell, LabelList, ResponsiveContainer, Tooltip } from 'recharts';

const MONO = "'JetBrains Mono', 'Fira Code', monospace";
const SANS = "'Plus Jakarta Sans', DM Sans, sans-serif";

const FALLBACK_TOOLS = [
  { label: 'Gemini', pct: 44 },
  { label: 'NotebookLM', pct: 43 },
  { label: 'Claude', pct: 27 },
  { label: 'Only official tools', pct: 23 },
  { label: 'Otter.ai', pct: 17 },
  { label: 'WISPR Flow', pct: 14 },
  { label: 'Perplexity', pct: 12 },
  { label: 'Gamma', pct: 12 },
];

function getTools(toolsS3) {
  if (!toolsS3?.length) return FALLBACK_TOOLS;
  return toolsS3.slice(0, 8).map(t => ({ label: t.label ?? t.tool, pct: Math.round(t.pct) }));
}

function getOwnPocket(ownPocketS3) {
  return Math.round(ownPocketS3?.yesPct ?? 32);
}

const axisStyle = { fill: 'var(--text-medium)', fontSize: 12, fontFamily: 'DM Sans, sans-serif' };

export default function SlideW3Tools({ transforms }) {
  const data = getTools(transforms?.toolsS3);
  const ownPocketPct = getOwnPocket(transforms?.ownPocketS3);

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
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 55% 40% at 35% 50%, rgba(229,85,79,0.04) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={{ flexShrink: 0, marginBottom: 16 }}>
        <div style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(125,230,155,0.6)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 6 }}>
          Tool Ecosystem · Wave 3
        </div>
        <h1 style={{ fontFamily: SANS, fontSize: 'clamp(26px, 3vw, 38px)', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.025em', lineHeight: 1.1, margin: 0 }}>
          Tool demand is outrunning <span style={{ color: '#2EA84A' }}>the official stack</span>
        </h1>
        <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: 'var(--text-support)', marginTop: 4 }}>
          That is producing both innovation and fragmentation
        </div>
      </motion.div>

      {/* 2-col body */}
      <div style={{ flex: 1, display: 'flex', gap: 28, minHeight: 0, overflow: 'hidden' }}>

        {/* Left — chart */}
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.12 }}
          style={{ flex: '0 0 57%', display: 'flex', flexDirection: 'column', gap: 8, overflow: 'hidden' }}
        >
          <div style={{ fontFamily: MONO, fontSize: 12, color: 'var(--text-medium)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Most-used non-endorsed tools in Wave 3</div>
          <div style={{ flex: 1, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} layout="vertical" margin={{ top: 4, right: 44, bottom: 4, left: 4 }} barCategoryGap="18%">
                <XAxis type="number" domain={[0, 50]} hide />
                <YAxis type="category" dataKey="label" tick={axisStyle} axisLine={false} tickLine={false} width={120} />
                <Tooltip
                  contentStyle={{ background: '#1e2425', border: '1px solid rgba(125,230,155,0.2)', borderRadius: 8, fontFamily: 'DM Sans, sans-serif', fontSize: 11 }}
                  labelStyle={{ color: '#7DE69B', fontWeight: 700 }}
                  formatter={(v) => [`${v}%`, '']}
                />
                <Bar dataKey="pct" radius={[0, 4, 4, 0]}>
                  {data.map((d, i) => (
                    <Cell key={i} fill={d.label?.toLowerCase().includes('official') ? '#797D80' : '#2EA84A'} />
                  ))}
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
          style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}
        >
          {/* 2 big stats */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flexShrink: 0 }}>
            <div style={{ background: 'var(--card-bg)', border: '1px solid rgba(229,85,79,0.2)', borderLeft: '4px solid #E5554F', borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ fontFamily: SANS, fontSize: 'clamp(32px, 3.8vw, 48px)', fontWeight: 900, color: '#E5554F', lineHeight: 1, minWidth: 64 }}>77%</div>
              <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 15, color: 'var(--text-support)', lineHeight: 1.4 }}>use tools beyond the official stack</div>
            </div>
            <div style={{ background: 'var(--card-bg)', border: '1px solid rgba(255,205,0,0.2)', borderLeft: '4px solid #FFCD00', borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ fontFamily: SANS, fontSize: 'clamp(32px, 3.8vw, 48px)', fontWeight: 900, color: '#FFCD00', lineHeight: 1, minWidth: 64 }}>{ownPocketPct}%</div>
              <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 15, color: 'var(--text-support)', lineHeight: 1.4 }}>pay out of pocket for AI tools used at work</div>
            </div>
          </div>

          {/* Why this matters */}
          <div style={{ background: 'rgba(125,230,155,0.04)', border: '1px solid rgba(125,230,155,0.14)', borderRadius: 10, padding: '12px 14px' }}>
            <div style={{ fontFamily: SANS, fontSize: 15, fontWeight: 800, color: 'var(--text-medium)', marginBottom: 7 }}>Why this matters</div>
            <ul style={{ margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                'People are trying to solve real work problems.',
                'The risk is tool sprawl, unclear standards, and uneven access.',
                'Leaders need a clearer core stack and faster decisions on justified exceptions.',
              ].map((txt, i) => (
                <li key={i} style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 15, color: 'var(--text-bridge)', lineHeight: 1.55, listStyle: 'none' }}>
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
