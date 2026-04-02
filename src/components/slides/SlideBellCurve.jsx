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
        style={{ flexShrink: 0, marginBottom: 10 }}
      >
        <div style={{
          fontFamily: MONO,
          fontSize: 10,
          color: 'rgba(125,230,155,0.6)',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          marginBottom: 8,
        }}>
          The Adoption Arc — Survey 1 → Survey 2 → Survey 3
        </div>
        <h1 style={{
          fontFamily: SANS,
          fontSize: 'clamp(28px, 3.5vw, 44px)',
          fontWeight: 900,
          color: '#ffffff',
          letterSpacing: '-0.03em',
          lineHeight: 1.0,
          margin: '0 0 8px',
        }}>
          The bell curve didn't just shift right —{' '}
          <span style={{ color: '#7DE69B' }}>it collapsed left.</span>
        </h1>

        {/* Narrative */}
        <div style={{
          borderLeft: '3px solid rgba(125,230,155,0.35)',
          paddingLeft: 14,
        }}>
          <p style={{
            fontFamily: 'DM Sans, sans-serif',
            fontSize: 13,
            color: 'rgba(255,255,255,0.58)',
            fontStyle: 'italic',
            lineHeight: 1.65,
            margin: 0,
          }}>
            As AI moved from novelty to necessity, the adoption profile of this team transformed. Watch the curve's peak shift left — from late majority toward early majority, and then toward the innovator edge. In 14 months, the shape of this team's relationship with AI changed completely.
          </p>
        </div>
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
        <AdoptionCurve familiarityTrend={transforms?.familiarityTrend ?? []} />
      </motion.div>
    </div>
  );
}
