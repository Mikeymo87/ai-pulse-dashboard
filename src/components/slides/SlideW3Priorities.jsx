import { motion } from 'framer-motion';

const MONO = "'JetBrains Mono', 'Fira Code', monospace";
const SANS = "'Plus Jakarta Sans', DM Sans, sans-serif";

const PRIORITIES = [
  {
    num: 1, color: '#2EA84A',
    title: 'Run workflow redesign pilots',
    body: 'Pick recurring team processes and rebuild them with AI in the loop, end to end.',
  },
  {
    num: 2, color: '#59BEC9',
    title: 'Rationalize the tool stack',
    body: 'Clarify the core tools, what each is for, and where exceptions make sense.',
  },
  {
    num: 3, color: '#7DE69B',
    title: 'Fix access and integration',
    body: 'Address blocked tools, file connectivity, and software handoffs slowing adoption.',
  },
  {
    num: 4, color: '#FFCD00',
    title: 'Build role-based enablement',
    body: 'Shift from broad AI education to function-specific labs, examples, and office hours.',
  },
  {
    num: 5, color: '#E5554F',
    title: 'Reset the performance narrative',
    body: 'Make the goal stronger work and better outcomes, not performative AI activity.',
  },
  {
    num: 6, color: '#59BEC9',
    title: 'Create a small R&D lane',
    body: 'Give builders room and budget to test useful tools, GPTs, and automations that can scale.',
  },
];

export default function SlideW3Priorities() {
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
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(46,168,74,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={{ flexShrink: 0, marginBottom: 16 }}>
        <div style={{ fontFamily: MONO, fontSize: 10, color: 'var(--text-support)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 6 }}>
          What leaders and the AI Council should do next
        </div>
        <h1 style={{ fontFamily: SANS, fontSize: 'clamp(26px, 3vw, 38px)', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.025em', lineHeight: 1.1, margin: 0 }}>
          Six priorities that come directly from{' '}
          <span style={{ color: '#2EA84A' }}>what staff said in the survey</span>
        </h1>
      </motion.div>

      {/* 3×2 grid */}
      <div style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gridTemplateRows: 'repeat(2, 1fr)',
        gap: 12,
        minHeight: 0,
        overflow: 'hidden',
      }}>
        {PRIORITIES.map((p, i) => (
          <motion.div
            key={p.num}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.12 + i * 0.07 }}
            style={{
              background: 'var(--card-bg)',
              border: '1px solid rgba(125,230,155,0.1)',
              borderRadius: 12,
              padding: '14px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              overflow: 'hidden',
            }}
          >
            {/* Number badge — top of card */}
            <div style={{
              width: 48, height: 48, borderRadius: '50%',
              background: `${p.color}20`,
              border: `2px solid ${p.color}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: MONO, fontSize: 22, fontWeight: 800, color: p.color,
              flexShrink: 0,
            }}>
              {p.num}
            </div>
            {/* Title */}
            <div style={{ fontFamily: SANS, fontSize: 17, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.01em', lineHeight: 1.2 }}>
              {p.title}
            </div>
            {/* Body */}
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: 'var(--text-bridge)', lineHeight: 1.6, margin: 0, flex: 1 }}>
              {p.body}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Message to staff callout */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.65 }}
        style={{
          marginTop: 14,
          background: 'rgba(125,230,155,0.04)',
          borderLeft: '3px solid rgba(125,230,155,0.4)',
          borderRadius: '0 8px 8px 0',
          padding: '12px 16px',
          flexShrink: 0,
        }}
      >
        <span style={{ fontFamily: SANS, fontSize: 14, fontWeight: 800, color: '#7DE69B' }}>The message to staff  </span>
        <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: 'var(--text-bridge)', lineHeight: 1.6 }}>
          We heard you. We are not just asking for more AI use. We are changing the environment so AI can be used well.
        </span>
      </motion.div>
    </div>
  );
}
