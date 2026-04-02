import { motion } from 'framer-motion';

const MONO = "'JetBrains Mono', 'Fira Code', monospace";
const SANS = "'Plus Jakarta Sans', DM Sans, sans-serif";

const ARCHETYPES = [
  {
    key: 'confident-bystander',
    roman: 'I',
    name: 'The Confident\nBystander',
    tagline: 'Nothing stopping them.\nNothing moving them.',
    tension: 'Untapped potential',
    accentColor: '#A78BFA',
  },
  {
    key: 'thoughtful-skeptic',
    roman: 'II',
    name: 'The Thoughtful\nSceptic',
    tagline: 'Not resistant because they don\'t understand — because they do.',
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

function SpeakerNote({ text }) {
  return (
    <div style={{
      borderTop: '1px solid rgba(125,230,155,0.08)',
      paddingTop: 10,
      flexShrink: 0,
      display: 'flex',
      alignItems: 'flex-start',
      gap: 12,
    }}>
      <span style={{
        fontFamily: MONO,
        fontSize: 9,
        color: 'rgba(125,230,155,0.45)',
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        flexShrink: 0,
        marginTop: 2,
        whiteSpace: 'nowrap',
      }}>
        Say this
      </span>
      <p style={{
        fontFamily: 'DM Sans, sans-serif',
        fontSize: 12,
        color: 'rgba(255,255,255,0.3)',
        fontStyle: 'italic',
        margin: 0,
        lineHeight: 1.55,
      }}>
        {text}
      </p>
    </div>
  );
}

function ArchetypeCard({ archetype, data, delay = 0 }) {
  const { roman, name, tagline, tension, accentColor } = archetype;
  const rgb = hexToRgb(accentColor);
  const count = data?.count ?? 0;
  const pct   = data?.pct ?? 0;

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
        padding: '20px 18px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        boxSizing: 'border-box',
        flex: 1,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Subtle glow */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        background: `radial-gradient(ellipse 80% 50% at 50% 0%, rgba(${rgb},0.06) 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      {/* Roman numeral */}
      <div style={{
        fontFamily: MONO,
        fontSize: 13,
        color: `rgba(${rgb},0.7)`,
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
      }}>
        {roman}
      </div>

      {/* Name */}
      <div style={{
        fontFamily: SANS,
        fontSize: 'clamp(14px, 1.4vw, 17px)',
        fontWeight: 800,
        color: '#ffffff',
        lineHeight: 1.2,
        letterSpacing: '-0.01em',
        whiteSpace: 'pre-line',
      }}>
        {name}
      </div>

      {/* Count + pct — the big hero number */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{
          fontFamily: SANS,
          fontSize: 'clamp(36px, 4vw, 52px)',
          fontWeight: 900,
          color: accentColor,
          lineHeight: 1,
          letterSpacing: '-0.03em',
        }}>
          {count}
        </div>
        <div style={{
          fontFamily: 'DM Sans, sans-serif',
          fontSize: 11,
          color: '#797D80',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          marginTop: 4,
        }}>
          people · {pct}% of team
        </div>
      </div>

      {/* Tagline */}
      <p style={{
        fontFamily: 'DM Sans, sans-serif',
        fontSize: 12,
        color: '#9ca8b4',
        fontStyle: 'italic',
        lineHeight: 1.55,
        margin: 0,
      }}>
        {tagline}
      </p>

      {/* Tension pill */}
      <div style={{
        display: 'inline-flex',
        alignSelf: 'flex-start',
        fontFamily: 'DM Sans, sans-serif',
        fontSize: 10,
        fontWeight: 700,
        color: accentColor,
        background: `rgba(${rgb},0.1)`,
        border: `1px solid rgba(${rgb},0.22)`,
        borderRadius: 20,
        padding: '3px 10px',
        letterSpacing: '0.04em',
      }}>
        {tension}
      </div>
    </motion.div>
  );
}

export default function SlideArchetypes({ transforms }) {
  const archetypes = transforms?.archetypes ?? {};
  const totalVoices = ARCHETYPES.reduce((sum, a) => sum + (archetypes[a.key]?.count ?? 0), 0);

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      padding: '32px 56px 24px',
      boxSizing: 'border-box',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Ambient glow */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(ellipse 70% 40% at 50% 60%, rgba(89,190,201,0.05) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ marginBottom: 22, flexShrink: 0 }}
      >
        <div style={{
          fontFamily: MONO,
          fontSize: 10,
          color: 'rgba(125,230,155,0.6)',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          marginBottom: 10,
        }}>
          The Team — {totalVoices} Voices · 16 Behavioral Dimensions · 5 Personas
        </div>
        <h1 style={{
          fontFamily: SANS,
          fontSize: 'clamp(34px, 4.5vw, 54px)',
          fontWeight: 900,
          color: '#ffffff',
          letterSpacing: '-0.035em',
          lineHeight: 1.0,
          margin: '0 0 8px',
        }}>
          Meet the team{' '}
          <span style={{ color: '#7DE69B' }}>behind the data.</span>
        </h1>
        <p style={{
          fontFamily: 'DM Sans, sans-serif',
          fontSize: 15,
          color: '#797D80',
          margin: 0,
        }}>
          Five archetypes. Every person assigned by behavioral pattern — not self-report.
        </p>
      </motion.div>

      {/* 5 archetype cards */}
      <div style={{
        display: 'flex',
        gap: 12,
        flex: 1,
        minHeight: 0,
        overflow: 'hidden',
      }}>
        {ARCHETYPES.map((a, i) => (
          <ArchetypeCard
            key={a.key}
            archetype={a}
            data={archetypes[a.key]}
            delay={0.12 + i * 0.08}
          />
        ))}
      </div>

      {/* Distribution bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        style={{ marginTop: 14, flexShrink: 0 }}
      >
        <div style={{
          display: 'flex',
          borderRadius: 6,
          overflow: 'hidden',
          height: 8,
          gap: 1,
        }}>
          {ARCHETYPES.map((a) => {
            const pct = archetypes[a.key]?.pct ?? 0;
            return pct > 0 ? (
              <div
                key={a.key}
                title={`${a.name.replace('\n', ' ')}: ${pct}%`}
                style={{
                  width: `${pct}%`,
                  background: a.accentColor,
                  transition: 'width 0.8s ease',
                }}
              />
            ) : null;
          })}
        </div>
        <div style={{ display: 'flex', gap: 14, marginTop: 8, flexWrap: 'wrap' }}>
          {ARCHETYPES.map((a) => {
            const pct = archetypes[a.key]?.pct ?? 0;
            return (
              <span key={a.key} style={{ fontSize: 10, color: '#797D80', fontFamily: 'DM Sans, sans-serif' }}>
                <span style={{
                  display: 'inline-block', width: 7, height: 7,
                  borderRadius: 2, background: a.accentColor,
                  marginRight: 5, verticalAlign: 'middle',
                }} />
                {a.name.split('\n')[1] || a.name.split('\n')[0]} <strong style={{ color: a.accentColor }}>{pct}%</strong>
              </span>
            );
          })}
        </div>
      </motion.div>

      {/* Speaker note */}
      <div style={{ marginTop: 12, flexShrink: 0 }}>
        <SpeakerNote text={`"This isn't a categorization. It's a diagnostic." Walk through each card. "Every one of these people is on your team — right now. The question isn't which archetype is best. It's what does each one need to go further?"`} />
      </div>
    </div>
  );
}
