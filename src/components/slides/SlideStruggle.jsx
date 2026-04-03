import { motion } from 'framer-motion';
import StruggleMap from '../StruggleMap';

const MONO = "'JetBrains Mono', 'Fira Code', monospace";
const SANS = "'Plus Jakarta Sans', DM Sans, sans-serif";

export default function SlideStruggle({ transforms }) {
  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      padding: '28px 56px 20px',
      boxSizing: 'border-box',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Ambient glow */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(ellipse 50% 35% at 30% 40%, rgba(89,190,201,0.05) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        style={{ flexShrink: 0, marginBottom: 8 }}
      >
        <div style={{
          fontFamily: MONO,
          fontSize: 10,
          color: 'rgba(89,190,201,0.7)',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          marginBottom: 8,
        }}>
          Friction &amp; Excitement — Survey 3 · Verbatim Responses
        </div>
        <h1 style={{
          fontFamily: SANS,
          fontSize: 'clamp(26px, 3.2vw, 40px)',
          fontWeight: 900,
          color: 'var(--text-primary)',
          letterSpacing: '-0.03em',
          lineHeight: 1.0,
          margin: '0 0 8px',
        }}>
          The team that leads in adoption{' '}
          <span style={{ color: '#59BEC9' }}>knows its own friction.</span>
        </h1>

        {/* Narrative */}
        <div style={{
          borderLeft: '3px solid rgba(89,190,201,0.35)',
          paddingLeft: 14,
        }}>
          <p style={{
            fontFamily: 'DM Sans, sans-serif',
            fontSize: 13,
            color: 'var(--text-dim)',
            fontStyle: 'italic',
            lineHeight: 1.65,
            margin: 0,
          }}>
            These are the honest answers — what holds them back and what pulls them forward. A team this far ahead in adoption doesn't hide its struggles; it names them clearly. Understanding both sides is how you sustain and accelerate this momentum. Hover any cell to read the actual words.
          </p>
        </div>
      </motion.div>

      {/* StruggleMap fills the rest */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        style={{
          flex: 1,
          minHeight: 0,
          overflow: 'hidden',
          margin: '0 -56px -20px',
        }}
      >
        <StruggleMap transforms={transforms} />
      </motion.div>
    </div>
  );
}
