import { motion } from 'framer-motion';

const MONO = "'JetBrains Mono', 'Fira Code', monospace";
const SANS = "'Plus Jakarta Sans', DM Sans, sans-serif";

const EXCITED_QUOTES = [
  {
    quote: 'Far more creative, innovative work.',
    theme: 'Creative Impact',
    context: 'Reflects the 35% who selected idea generation as a top benefit',
    color: '#2EA84A',
  },
  {
    quote: 'Doing better work faster; transforming comms to drive our mission.',
    theme: 'Quality + Speed',
    context: 'Mirrors the 53% who cited quality/polish as their top AI benefit',
    color: '#59BEC9',
  },
  {
    quote: "I'm most excited about the potential to reimagine how we work as a team.",
    theme: 'Team Redesign',
    context: "Echoes Wave 3's push for workflow redesign at the team level",
    color: '#7DE69B',
  },
  {
    quote: 'Use AI as leverage for strategic judgment, not just productivity.',
    theme: 'Strategic Leverage',
    context: 'Connects to the 42% naming AI as a strategic thought partner',
    color: '#FFCD00',
  },
];

const STRUGGLING_QUOTES = [
  {
    quote: 'Not being able to connect with business files and other software (blocked by IT).',
    theme: 'Access Blocked',
    context: 'The 11% citing limited access as a barrier — but more appear in open text',
    color: '#E5554F',
  },
  {
    quote: "The biggest challenge right now is scaling it in a way that\u2019s structured and sustainable across teams.",
    theme: 'Scaling Gap',
    context: 'Consistent with 25% reporting AI as inconsistent or siloed across teams',
    color: '#59BEC9',
  },
  {
    quote: "It\u2019s starting to feel more like a \u2018sport mode\u2019 environment \u2026 more performative than practical.",
    theme: 'Performativity Pressure',
    context: 'Surfaces the gap between visible AI use and practical value creation',
    color: '#FFCD00',
  },
  {
    quote: 'AI has not consistently created efficiencies at a team or departmental level \u2026 we would need to rethink or rebuild existing workflows.',
    theme: 'Workflow Friction',
    context: 'Points directly to Priority #1: run workflow redesign pilots',
    color: '#7DE69B',
  },
];

const CONFIG = {
  excited: {
    eyebrow: 'Staff Voice · Wave 3 · Open Text',
    title: 'What staff ',
    titleAccent: 'are excited about',
    subtitle: 'The emotional energy around AI is constructive and high-value',
    quotes: EXCITED_QUOTES,
    calloutTitle: 'Why this matters',
    calloutColor: '#7DE69B',
    calloutBg: 'rgba(125,230,155,0.04)',
    calloutBorder: 'rgba(125,230,155,0.18)',
    calloutBody: 'People are not just hoping AI makes them faster. They are imagining better work, more strategic thinking, and more space for creativity. That is the kind of energy leadership should convert into visible workflow improvements.',
  },
  struggling: {
    eyebrow: 'Staff Voice · Wave 3 · Open Text',
    title: 'What staff say they ',
    titleAccent: 'are struggling with',
    subtitle: 'The open text makes the next set of needs much more concrete',
    quotes: STRUGGLING_QUOTES,
    calloutTitle: 'What these comments are really saying',
    calloutColor: '#7DE69B',
    calloutBg: 'rgba(125,230,155,0.04)',
    calloutBorder: 'rgba(125,230,155,0.18)',
    calloutBody: 'Give us better access, better integration, and clearer expectations. Keep the focus on practical value, not performative AI behavior.',
  },
};

function QuoteCard({ quote, theme, context, color, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.18 + index * 0.09 }}
      style={{
        background: 'var(--card-bg)',
        border: `1px solid rgba(125,230,155,0.1)`,
        borderTop: `3px solid ${color}`,
        borderRadius: 12,
        padding: '16px 20px 14px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        overflow: 'hidden',
      }}
    >
      {/* Theme title — dominant label */}
      <div style={{
        fontFamily: SANS,
        fontSize: 'clamp(14px, 1.6vw, 18px)',
        fontWeight: 900,
        color: color,
        letterSpacing: '-0.01em',
        lineHeight: 1.1,
      }}>
        {theme}
      </div>
      {/* Divider */}
      <div style={{ height: 1, background: `${color}30`, flexShrink: 0 }} />
      {/* Quote */}
      <p style={{
        fontFamily: SANS,
        fontSize: 'clamp(13px, 1.5vw, 17px)',
        fontWeight: 500,
        fontStyle: 'italic',
        color: 'var(--text-primary)',
        lineHeight: 1.55,
        margin: 0,
        flex: 1,
      }}>
        <span style={{ color: color, fontSize: '1.4em', lineHeight: 0, verticalAlign: '-0.2em', marginRight: 4, fontStyle: 'normal' }}>&ldquo;</span>
        {quote}
      </p>
      {/* Context line */}
      <p style={{
        fontFamily: 'DM Sans, sans-serif',
        fontSize: 11,
        color: 'var(--text-support)',
        lineHeight: 1.4,
        margin: 0,
        opacity: 0.8,
      }}>
        {context}
      </p>
    </motion.div>
  );
}

export default function SlideW3Quotes({ type = 'excited' }) {
  const cfg = CONFIG[type] ?? CONFIG.excited;

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
      <div style={{
        position: 'absolute', inset: 0,
        background: type === 'excited'
          ? 'radial-gradient(ellipse 55% 40% at 50% 30%, rgba(46,168,74,0.06) 0%, transparent 70%)'
          : 'radial-gradient(ellipse 55% 40% at 50% 30%, rgba(229,85,79,0.04) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={{ flexShrink: 0, marginBottom: 16 }}>
        <div style={{ fontFamily: MONO, fontSize: 10, color: 'var(--text-support)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 6 }}>
          {cfg.eyebrow}
        </div>
        <h1 style={{ fontFamily: SANS, fontSize: 'clamp(26px, 3vw, 38px)', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.025em', lineHeight: 1.1, margin: 0 }}>
          {cfg.title}<span style={{ color: '#2EA84A' }}>{cfg.titleAccent}</span>
        </h1>
        <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: 'var(--text-support)', marginTop: 4 }}>
          {cfg.subtitle}
        </div>
      </motion.div>

      {/* 2×2 quote grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gridTemplateRows: '1fr 1fr',
        gap: 14,
        flex: 1,
        minHeight: 0,
        overflow: 'hidden',
      }}>
        {cfg.quotes.map((q, i) => (
          <QuoteCard key={i} quote={q.quote} theme={q.theme} context={q.context} color={q.color} index={i} />
        ))}
      </div>

      {/* Bottom callout */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.58 }}
        style={{
          marginTop: 14,
          background: cfg.calloutBg,
          border: `1px solid ${cfg.calloutBorder}`,
          borderRadius: 10,
          padding: '12px 16px',
          flexShrink: 0,
        }}
      >
        <span style={{ fontFamily: SANS, fontSize: 14, fontWeight: 800, color: cfg.calloutColor }}>
          {cfg.calloutTitle}{' '}
        </span>
        <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: 'var(--text-bridge)', lineHeight: 1.6 }}>
          {cfg.calloutBody}
        </span>
      </motion.div>
    </div>
  );
}
