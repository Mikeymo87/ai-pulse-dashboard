import { motion } from 'framer-motion';
import AdoptionCurve from '../AdoptionCurve';

const MONO = "'JetBrains Mono', 'Fira Code', monospace";
const SANS = "'Plus Jakarta Sans', DM Sans, sans-serif";

export default function SlideBellCurve({ transforms }) {
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
        background: 'radial-gradient(ellipse 60% 40% at 50% 30%, rgba(125,230,155,0.06) 0%, transparent 70%)',
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
          color: 'rgba(125,230,155,0.6)',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          marginBottom: 6,
        }}>
          The Adoption Arc — Survey 1 → Survey 2 → Survey 3
        </div>
        <h1 style={{
          fontFamily: SANS,
          fontSize: 'clamp(24px, 3vw, 38px)',
          fontWeight: 900,
          color: 'var(--text-primary)',
          letterSpacing: '-0.03em',
          lineHeight: 1.0,
          margin: '0 0 8px',
        }}>
          The bell curve didn't just shift right —{' '}
          <span style={{ color: '#7DE69B' }}>it collapsed left.</span>
        </h1>
        <p style={{
          fontFamily: 'DM Sans, sans-serif',
          fontSize: 12,
          color: 'var(--text-dim)',
          fontStyle: 'italic',
          lineHeight: 1.5,
          margin: 0,
        }}>
          Watch the peak shift left across three surveys — from late majority toward innovators. Use the buttons below to step through each wave.
        </p>
      </motion.div>

      {/* AdoptionCurve fills the rest */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        style={{
          flex: 1,
          minHeight: 0,
          overflow: 'hidden',
          margin: '0 -56px',
        }}
      >
        <AdoptionCurve familiarityTrend={transforms?.familiarityTrend ?? []} compact={true} />
      </motion.div>
    </div>
  );
}
