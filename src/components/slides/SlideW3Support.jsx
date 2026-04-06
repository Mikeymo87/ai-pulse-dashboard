import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Cell, LabelList, ResponsiveContainer, Tooltip } from 'recharts';

const MONO = "'JetBrains Mono', 'Fira Code', monospace";
const SANS = "'Plus Jakarta Sans', DM Sans, sans-serif";

// Static Wave 3 role confidence data from the readout deck
const ROLE_DATA = [
  { role: 'Specialist', pct: 60, color: '#1a4a5e', n: 45 },
  { role: 'Manager',    pct: 65, color: '#59BEC9', n: 34 },
  { role: 'Director',   pct: 94, color: '#2EA84A', n: 16 },
  { role: 'AVP',        pct: 60, color: '#FFCD00', n: 5  },
];

const FUNCTION_DATA = [
  { fn: 'Paid Media & Precision Marketing', pct: 25, n: 8 },
  { fn: 'Marketing Operations',             pct: 40, n: 5 },
  { fn: 'Creative Services',                pct: 43, n: 7 },
];

const axisStyle = { fill: 'var(--text-medium)', fontSize: 12, fontFamily: 'DM Sans, sans-serif' };

function LockedState() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        style={{
          background: 'var(--card-bg)',
          border: '1px solid rgba(125,230,155,0.15)',
          borderRadius: 16,
          padding: '40px 48px',
          textAlign: 'center',
          maxWidth: 420,
        }}
      >
        <div style={{ fontSize: 36, marginBottom: 16 }}>🔒</div>
        <div style={{ fontFamily: SANS, fontSize: 20, fontWeight: 900, color: 'var(--text-primary)', marginBottom: 8 }}>
          Leadership Vault Required
        </div>
        <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: 'var(--text-support)', marginBottom: 16, lineHeight: 1.6 }}>
          This slide contains role and function confidence data.
        </div>
        <div style={{
          background: 'rgba(125,230,155,0.06)', border: '1px solid rgba(125,230,155,0.18)',
          borderRadius: 8, padding: '10px 14px',
          fontFamily: MONO, fontSize: 10, color: 'rgba(125,230,155,0.6)', letterSpacing: '0.1em',
        }}>
          Exit presentation → unlock vault from dashboard header
        </div>
      </motion.div>
    </div>
  );
}

export default function SlideW3Support({ vaultUnlocked }) {
  if (!vaultUnlocked) return (
    <div style={{ height: '100%', background: 'var(--bg)', position: 'relative' }}>
      <LockedState />
    </div>
  );

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
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 55% 40% at 40% 50%, rgba(46,168,74,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={{ flexShrink: 0, marginBottom: 16 }}>
        <div style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(125,230,155,0.6)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 6 }}>
          Leadership Vault · Role &amp; Function Breakdown
        </div>
        <h1 style={{ fontFamily: SANS, fontSize: 'clamp(26px, 3vw, 38px)', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.025em', lineHeight: 1.1, margin: 0 }}>
          Where support may need <span style={{ color: '#2EA84A' }}>to be more targeted</span>
        </h1>
        <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: 'var(--text-support)', marginTop: 4 }}>
          Use the role and function cuts directionally, not as absolute rankings
        </div>
      </motion.div>

      {/* 2-col */}
      <div style={{ flex: 1, display: 'flex', gap: 28, minHeight: 0, overflow: 'hidden' }}>

        {/* Left — role confidence bars */}
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.12 }}
          style={{ flex: '0 0 52%', display: 'flex', flexDirection: 'column', gap: 10, overflow: 'hidden' }}
        >
          <div style={{ fontFamily: MONO, fontSize: 12, color: 'var(--text-medium)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            Top-2 confidence by role in Wave 3
          </div>
          <div style={{ flex: 1, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ROLE_DATA} layout="vertical" margin={{ top: 4, right: 56, bottom: 4, left: 8 }} barCategoryGap="26%">
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis type="category" dataKey="role" tick={axisStyle} axisLine={false} tickLine={false} width={72} />
                <Tooltip
                  contentStyle={{ background: '#1e2425', border: '1px solid rgba(125,230,155,0.2)', borderRadius: 8, fontFamily: 'DM Sans, sans-serif', fontSize: 11 }}
                  labelStyle={{ color: '#7DE69B', fontWeight: 700 }}
                  formatter={(v, _, item) => [`${v}% top-2 confidence (n=${item.payload.n})`, '']}
                />
                <Bar dataKey="pct" radius={[0, 4, 4, 0]}>
                  {ROLE_DATA.map((d, i) => <Cell key={i} fill={d.color} />)}
                  <LabelList dataKey="pct" position="right"
                    style={{ fill: 'var(--text-medium)', fontSize: 14, fontWeight: 700, fontFamily: 'DM Sans, sans-serif' }}
                    formatter={v => `${v}%`} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={{ fontFamily: MONO, fontSize: 9, color: 'rgba(121,125,128,0.5)', letterSpacing: '0.06em', flexShrink: 0 }}>
            Base sizes: Specialist n=45, Manager n=34, Director n=16, AVP n=5
          </div>

          <div style={{ background: 'rgba(125,230,155,0.04)', border: '1px solid rgba(125,230,155,0.12)', borderRadius: 10, padding: '10px 14px', flexShrink: 0 }}>
            <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 800, color: 'var(--text-medium)' }}>Read on the role pattern  </span>
            <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 15, color: 'var(--text-bridge)', lineHeight: 1.55 }}>
              Directors look furthest along. Specialists and managers are using AI heavily too, but their confidence levels suggest more practical support would help.
            </span>
          </div>
        </motion.div>

        {/* Right — function tiles */}
        <motion.div
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}
        >
          <div style={{ fontFamily: MONO, fontSize: 12, color: 'var(--text-medium)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            Functions that may need targeted support
          </div>

          {FUNCTION_DATA.map((fn, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.28 + i * 0.08 }}
              style={{
                background: 'var(--card-bg)', border: '1px solid rgba(125,230,155,0.1)',
                borderRadius: 10, padding: '14px 16px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}
            >
              <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: 'var(--text-medium)' }}>{fn.fn}</div>
              <div style={{ fontFamily: MONO, fontSize: 11, color: '#797D80', flexShrink: 0, marginLeft: 12, textAlign: 'right', lineHeight: 1.4 }}>
                <span style={{ color: fn.pct <= 30 ? '#E5554F' : fn.pct <= 45 ? '#FFCD00' : '#2EA84A', fontWeight: 700, fontSize: 14 }}>{fn.pct}%</span>
                {' '}top-2 confidence<br />
                <span style={{ fontSize: 10 }}>n={fn.n}</span>
              </div>
            </motion.div>
          ))}

          {/* Treat directionally note */}
          <div style={{ background: 'rgba(255,205,0,0.04)', border: '1px solid rgba(255,205,0,0.2)', borderRadius: 10, padding: '12px 14px', marginTop: 4 }}>
            <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 800, color: '#FFCD00', marginBottom: 7 }}>Treat this directionally</div>
            <ul style={{ margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 5 }}>
              {[
                'Some groups have small bases.',
                'Use this to target pilots, office hours, and examples, not to label winners and losers.',
              ].map((txt, i) => (
                <li key={i} style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 15, color: 'var(--text-bridge)', lineHeight: 1.55, listStyle: 'none' }}>
                  <span style={{ color: '#FFCD00', marginRight: 6 }}>●</span>{txt}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
