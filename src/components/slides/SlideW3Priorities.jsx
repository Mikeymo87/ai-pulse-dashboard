import { motion } from 'framer-motion';

const MONO = "'JetBrains Mono', 'Fira Code', monospace";
const SANS = "'Plus Jakarta Sans', DM Sans, sans-serif";

const PRIORITIES = [
  {
    num: 1, color: '#2EA84A',
    title: 'Run workflow redesign pilots',
    body: '74% of staff are now at Integration or Transformation stage. The next proof point is showing that AI changes how work is done, not just how fast. Start with one recurring process per team and redesign it end to end with AI in the loop.',
  },
  {
    num: 2, color: '#59BEC9',
    title: 'Rationalize the tool stack',
    body: '77% use tools beyond the official stack, and 32% pay for them out of pocket. The risk is not tool usage — it is fragmentation. Define a clear core stack, name the approved exceptions, and reduce decision fatigue.',
  },
  {
    num: 3, color: '#7DE69B',
    title: 'Fix access and integration',
    body: 'Staff are blocked from connecting AI to real work systems — shared files, email, project management. Fixing connectivity is the single change that would turn good prompts into real workflow gains.',
  },
  {
    num: 4, color: '#FFCD00',
    title: 'Build role-based enablement',
    body: 'Familiarity is near-universal (96%) but confidence is unevenly distributed. Generic training has reached its ceiling. The next move is function-specific labs and real-world examples tailored to each team\'s actual work.',
  },
  {
    num: 5, color: '#E5554F',
    title: 'Reset the performance narrative',
    body: "Open text reveals a 'sport mode' phenomenon — staff feel pressure to perform AI use rather than use it practically. Reset the expectation: the goal is stronger work, not visible AI activity.",
  },
  {
    num: 6, color: '#59BEC9',
    title: 'Create a small R&D lane',
    body: 'The department has builders ready to create GPTs, automations, and integrations. Create a lightweight track with budget and permission to experiment — small bets that scale become department-wide tools.',
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
        <div style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(125,230,155,0.6)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 6 }}>
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
