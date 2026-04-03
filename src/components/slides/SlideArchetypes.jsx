import { motion } from 'framer-motion';

const MONO = "'JetBrains Mono', 'Fira Code', monospace";
const SANS = "'Plus Jakarta Sans', DM Sans, sans-serif";

const ARCHETYPES = [
  {
    key: 'confident-bystander',
    roman: 'I',
    name: 'The Confident\nBystander',
    tagline: 'Nothing stopping them. Nothing moving them.',
    tension: 'Untapped potential',
    accentColor: '#A78BFA',
  },
  {
    key: 'thoughtful-skeptic',
    roman: 'II',
    name: 'The Thoughtful\nSceptic',
    tagline: "Not resistant because they don't understand — because they do.",
    tension: 'Earned skepticism',
    accentColor: '#60A5FA',
  },
  {
    key: 'blocked-believer',
    roman: 'III',
    name: 'The Blocked\nBeliever',
    tagline: 'Enthusiastic people slowed by organizational friction.',
    tension: 'System failure',
    accentColor: '#59BEC9',
  },
  {
    key: 'experimenter',
    roman: 'IV',
    name: 'The\nExperimenter',
    tagline: 'Curious, multi-tool, moveable — highest training ROI.',
    tension: 'Motion without traction',
    accentColor: '#7DE69B',
  },
  {
    key: 'multiplier',
    roman: 'V',
    name: 'The\nMultiplier',
    tagline: 'Pulling the department forward — with or without a mandate.',
    tension: 'Voluntary conviction',
    accentColor: '#FFCD00',
  },
];

function hexToRgb(hex) {
  const c = hex.replace('#', '');
  return [parseInt(c.slice(0,2),16), parseInt(c.slice(2,4),16), parseInt(c.slice(4,6),16)].join(',');
}

function ArchetypeCard({ archetype, data, delay = 0 }) {
  const { roman, name, tagline, tension, accentColor } = archetype;
  const rgb   = hexToRgb(accentColor);
  const count = data?.count ?? 0;
  const pct   = data?.pct   ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      style={{
        background: `rgba(${rgb},0.05)`,
        border: `1px solid rgba(${rgb},0.15)`,
        borderTop: `3px solid ${accentColor}`,
        borderRadius: 12,
        padding: '18px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        boxSizing: 'border-box',
        flex: 1,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: `radial-gradient(ellipse 80% 50% at 50% 0%, rgba(${rgb},0.06) 0%, transparent 70%)`, pointerEvents: 'none' }} />

      <div style={{ fontFamily: MONO, fontSize: 12, color: `rgba(${rgb},0.8)`, letterSpacing: '0.2em' }}>{roman}</div>

      <div style={{ fontFamily: SANS, fontSize: 'clamp(13px, 1.3vw, 16px)', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2, letterSpacing: '-0.01em', whiteSpace: 'pre-line' }}>
        {name}
      </div>

      {/* Big count */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ fontFamily: SANS, fontSize: 'clamp(32px, 3.8vw, 48px)', fontWeight: 900, color: accentColor, lineHeight: 1, letterSpacing: '-0.03em' }}>
          {count}
        </div>
        <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: '#797D80', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 3 }}>
          people · {pct}% of team
        </div>
      </div>

      <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: 'var(--text-bridge)', fontStyle: 'italic', lineHeight: 1.5, margin: 0 }}>
        {tagline}
      </p>

      <div style={{
        display: 'inline-flex', alignSelf: 'flex-start',
        fontFamily: 'DM Sans, sans-serif', fontSize: 10, fontWeight: 700,
        color: accentColor, background: `rgba(${rgb},0.1)`,
        border: `1px solid rgba(${rgb},0.22)`,
        borderRadius: 20, padding: '3px 10px', letterSpacing: '0.04em',
      }}>
        {tension}
      </div>
    </motion.div>
  );
}

export default function SlideArchetypes({ transforms }) {
  const archetypes  = transforms?.archetypes ?? {};
  const totalVoices = ARCHETYPES.reduce((sum, a) => sum + (archetypes[a.key]?.count ?? 0), 0);

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      padding: '28px 56px 24px',
      boxSizing: 'border-box',
      overflow: 'hidden',
      position: 'relative',
    }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 40% at 50% 60%, rgba(89,190,201,0.04) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        style={{ marginBottom: 18, flexShrink: 0 }}
      >
        <div style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(125,230,155,0.6)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 8 }}>
          The Team — {totalVoices} Voices · 16 Behavioral Dimensions · 5 Personas
        </div>
        <h1 style={{ fontFamily: SANS, fontSize: 'clamp(30px, 4vw, 50px)', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1.0, margin: '0 0 10px' }}>
          Meet the team{' '}
          <span style={{ color: '#7DE69B' }}>behind the data.</span>
        </h1>

        {/* Narrative */}
        <div style={{ borderLeft: '3px solid rgba(125,230,155,0.3)', paddingLeft: 14 }}>
          <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: 'var(--text-dim)', fontStyle: 'italic', lineHeight: 1.6, margin: 0 }}>
            Five archetypes, scored from 16 behavioral dimensions — not self-reported, not assumed. Every person on this team was placed by their actual usage patterns, sentiment, and investment signals. Each one has a different reason for being where they are, and a different path forward.
          </p>
        </div>
      </motion.div>

      {/* 5 archetype cards */}
      <div style={{ display: 'flex', gap: 10, flex: 1, minHeight: 0, overflow: 'hidden' }}>
        {ARCHETYPES.map((a, i) => (
          <ArchetypeCard key={a.key} archetype={a} data={archetypes[a.key]} delay={0.1 + i * 0.08} />
        ))}
      </div>

      {/* Distribution bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.55 }}
        style={{ marginTop: 12, flexShrink: 0 }}
      >
        <div style={{ display: 'flex', borderRadius: 6, overflow: 'hidden', height: 7, gap: 1 }}>
          {ARCHETYPES.map((a) => {
            const pct = archetypes[a.key]?.pct ?? 0;
            return pct > 0 ? (
              <div key={a.key} title={`${a.name.replace('\n',' ')}: ${pct}%`} style={{ width: `${pct}%`, background: a.accentColor }} />
            ) : null;
          })}
        </div>
        <div style={{ display: 'flex', gap: 16, marginTop: 7, flexWrap: 'wrap' }}>
          {ARCHETYPES.map((a) => {
            const pct = archetypes[a.key]?.pct ?? 0;
            const label = a.name.split('\n').filter(Boolean).pop();
            return (
              <span key={a.key} style={{ fontSize: 11, color: '#797D80', fontFamily: 'DM Sans, sans-serif' }}>
                <span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: 2, background: a.accentColor, marginRight: 5, verticalAlign: 'middle' }} />
                {label} <strong style={{ color: a.accentColor }}>{pct}%</strong>
              </span>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
