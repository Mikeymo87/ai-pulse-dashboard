import { motion } from 'framer-motion';

export default function SlideThankYou() {
  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
      overflow: 'hidden',
      padding: '0 80px',
      boxSizing: 'border-box',
    }}>

      {/* Layered ambient glows */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 70% 55% at 50% 45%, rgba(46,168,74,0.09) 0%, transparent 70%)',
      }} />
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 40% 35% at 30% 70%, rgba(89,190,201,0.05) 0%, transparent 65%)',
      }} />

      {/* Top rule */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(125,230,155,0.4), transparent)',
          transformOrigin: 'center',
        }}
      />

      {/* Eyebrow */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        style={{
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          fontSize: 11,
          fontWeight: 600,
          color: '#797D80',
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          marginBottom: 52,
          textAlign: 'center',
        }}
      >
        AI Engagement Pulse · Wave 3 · Baptist Health MarCom
      </motion.div>

      {/* Giant headline */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.75, delay: 0.22 }}
        style={{ textAlign: 'center', marginBottom: 48 }}
      >
        <div style={{
          fontFamily: "'Plus Jakarta Sans', DM Sans, sans-serif",
          fontSize: 'clamp(72px, 10vw, 120px)',
          fontWeight: 900,
          color: 'var(--text-primary)',
          lineHeight: 0.95,
          letterSpacing: '-0.04em',
        }}>
          Thank you.
        </div>
        <div style={{
          fontFamily: "'Plus Jakarta Sans', DM Sans, sans-serif",
          fontSize: 'clamp(44px, 6vw, 72px)',
          fontWeight: 900,
          color: '#7DE69B',
          lineHeight: 1.0,
          letterSpacing: '-0.04em',
          marginTop: 16,
        }}>
          Questions welcome.
        </div>
      </motion.div>

      {/* Next wave note */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 0,
        }}
      >
        <div style={{
          width: 6, height: 6, borderRadius: '50%',
          background: '#2EA84A',
          boxShadow: '0 0 8px rgba(46,168,74,0.6)',
        }} />
        <div style={{
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          fontSize: 13,
          color: 'var(--text-support)',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
        }}>
          Wave 4 · Fall 2026
        </div>
      </motion.div>

      {/* Bottom footnote */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.72 }}
        style={{
          position: 'absolute',
          bottom: 36,
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 11,
          color: 'var(--text-support)',
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          textAlign: 'center',
        }}
      >
        January 2025 — March 2026 · n = 304 total responses
      </motion.div>

      {/* Bottom rule */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.2, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: 'absolute',
          bottom: 0, left: 0, right: 0, height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(125,230,155,0.2), transparent)',
          transformOrigin: 'center',
        }}
      />
    </div>
  );
}
