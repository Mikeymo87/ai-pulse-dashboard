import { motion } from 'framer-motion';

const MONO = "'JetBrains Mono', 'Fira Code', monospace";
const SANS = "'Plus Jakarta Sans', DM Sans, sans-serif";

const QUADRANTS = [
  {
    num: '1', color: '#2EA84A',
    title: 'What is working',
    body: 'Staff clearly see the value. Sentiment, usage, confidence, and perceived importance all moved in the right direction.',
  },
  {
    num: '2', color: '#59BEC9',
    title: 'What is changing',
    body: 'The barrier mix is shifting from literacy and access toward time pressure, tool sprawl, and workflow friction.',
  },
  {
    num: '3', color: '#E5554F',
    title: 'What staff is asking for',
    body: 'More integration with real systems, more practical standards, and less performative pressure around AI use.',
  },
  {
    num: '4', color: '#FFCD00',
    title: 'What leaders should do',
    body: 'Move from broad encouragement to targeted enablement: redesign workflows, rationalize tools, and create room to build.',
  },
];

export default function SlideW3BigPicture() {
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
        background: 'radial-gradient(ellipse 55% 60% at 20% 50%, rgba(46,168,74,0.07) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />

      {/* Eyebrow */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ fontFamily: MONO, fontSize: 10, color: 'var(--text-support)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 12, flexShrink: 0 }}
      >
        The big picture · The clearest read on this wave
      </motion.div>

      {/* Main 2-col layout */}
      <div style={{ flex: 1, display: 'flex', gap: 32, minHeight: 0, overflow: 'hidden' }}>

        {/* Left — hero statement, fills full height */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{
            flex: '0 0 36%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: 24,
          }}
        >
          {/* Hero headline */}
          <div>
            <div style={{
              fontFamily: SANS,
              fontSize: 'clamp(28px, 3.6vw, 48px)',
              fontWeight: 900,
              color: 'var(--text-primary)',
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
            }}>
              Adoption is no longer the issue.
            </div>
            <div style={{
              fontFamily: SANS,
              fontSize: 'clamp(28px, 3.6vw, 48px)',
              fontWeight: 900,
              color: '#7DE69B',
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
              marginTop: 4,
            }}>
              Enablement is.
            </div>
          </div>

          {/* Divider */}
          <div style={{ width: 48, height: 3, background: 'rgba(125,230,155,0.35)', borderRadius: 2 }} />

          {/* Body */}
          <p style={{
            fontFamily: 'DM Sans, sans-serif',
            fontSize: 'clamp(15px, 1.6vw, 18px)',
            color: 'var(--text-bridge)',
            lineHeight: 1.7,
            margin: 0,
          }}>
            We do not need another awareness campaign. We need stronger workflow design, clearer tool strategy, and practical support that helps staff use AI well.
          </p>

          {/* Bottom tag */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 14px',
            background: 'rgba(125,230,155,0.06)',
            border: '1px solid rgba(125,230,155,0.2)',
            borderRadius: 8,
            alignSelf: 'flex-start',
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#2EA84A', flexShrink: 0 }} />
            <span style={{ fontFamily: MONO, fontSize: 11, color: 'rgba(125,230,155,0.7)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Wave 3 · Baptist Health MarCom
            </span>
          </div>
        </motion.div>

        {/* Right — 2×2 quadrant cards filling full height */}
        <div style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gridTemplateRows: '1fr 1fr',
          gap: 14,
          minHeight: 0,
        }}>
          {QUADRANTS.map((q, i) => (
            <motion.div
              key={q.num}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.18 + i * 0.09 }}
              style={{
                background: 'var(--card-bg)',
                border: `1px solid ${q.color}22`,
                borderTop: `3px solid ${q.color}`,
                borderRadius: 12,
                padding: '20px 20px 18px',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                overflow: 'hidden',
              }}
            >
              {/* Number badge inline with title */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: `${q.color}20`,
                  border: `2px solid ${q.color}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: MONO, fontSize: 15, fontWeight: 800, color: q.color,
                  flexShrink: 0,
                }}>
                  {q.num}
                </div>
                <div style={{
                  fontFamily: SANS,
                  fontSize: 'clamp(14px, 1.6vw, 18px)',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.01em',
                  lineHeight: 1.2,
                }}>
                  {q.title}
                </div>
              </div>
              <p style={{
                fontFamily: 'DM Sans, sans-serif',
                fontSize: 'clamp(13px, 1.4vw, 16px)',
                color: 'var(--text-bridge)',
                lineHeight: 1.6,
                margin: 0,
                flex: 1,
              }}>
                {q.body}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer callout */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.65 }}
        style={{
          marginTop: 12,
          borderLeft: '3px solid rgba(125,230,155,0.35)',
          paddingLeft: 14,
          flexShrink: 0,
        }}
      >
        <span style={{
          fontFamily: 'DM Sans, sans-serif',
          fontSize: 15,
          color: 'var(--text-support)',
          fontStyle: 'italic',
          lineHeight: 1.5,
        }}>
          The next phase is making individual adoption consistent and scalable across teams.
        </span>
      </motion.div>
    </div>
  );
}
