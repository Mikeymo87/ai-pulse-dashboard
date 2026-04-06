import { motion } from 'framer-motion';

const MONO = "'JetBrains Mono', 'Fira Code', monospace";
const SANS = "'Plus Jakarta Sans', DM Sans, sans-serif";

export default function SlideW3Closing() {
  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 80px',
      boxSizing: 'border-box',
      overflow: 'hidden',
      position: 'relative',
      textAlign: 'center',
    }}>
      {/* Large ambient glow — mirrors SlideCover */}
      <motion.div
        animate={{ scale: [1, 1.06, 1], opacity: [0.25, 0.45, 0.25] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(46,168,74,0.12) 0%, transparent 65%)',
          pointerEvents: 'none',
        }}
      />
      {/* Top accent line */}
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 2,
          background: 'linear-gradient(90deg, transparent, #2EA84A, #7DE69B, transparent)',
          transformOrigin: 'center',
        }}
      />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 680 }}>
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(125,230,155,0.55)', letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 28 }}
        >
          What success looks like by Wave 4
        </motion.div>

        {/* Line 1 */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
          style={{
            fontFamily: SANS,
            fontSize: 'clamp(28px, 4vw, 52px)',
            fontWeight: 900,
            color: 'var(--text-primary)',
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
            marginBottom: 6,
          }}
        >
          The next milestone is not more AI activity.
        </motion.div>

        {/* Line 2 — mint */}
        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55, delay: 0.42, ease: [0.22, 1, 0.36, 1] }}
          style={{
            fontFamily: SANS,
            fontSize: 'clamp(28px, 4vw, 52px)',
            fontWeight: 900,
            color: '#7DE69B',
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
            marginBottom: 32,
          }}
        >
          It is better work.
        </motion.div>

        {/* Body */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.68 }}
          style={{
            fontFamily: 'DM Sans, sans-serif',
            fontSize: 'clamp(14px, 1.6vw, 18px)',
            color: 'var(--text-bridge)',
            lineHeight: 1.7,
            margin: 0,
          }}
        >
          If the next wave shows stronger workflows, clearer operating standards, and more visible team-level efficiencies, that is the sign the department has moved from adoption to real AI enablement.
        </motion.p>

        {/* Bottom rule */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
          style={{
            height: 1,
            background: 'linear-gradient(90deg, transparent, rgba(125,230,155,0.3), transparent)',
            marginTop: 36,
            transformOrigin: 'center',
          }}
        />
      </div>
    </div>
  );
}
