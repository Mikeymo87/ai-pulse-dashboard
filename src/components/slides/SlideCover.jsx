import { motion } from 'framer-motion';

export default function SlideCover({ transforms }) {
  const totalN = transforms?.responseCounts?.reduce((s, r) => s + (r.n ?? 0), 0) ?? 292;

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
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 35% 30% at 72% 30%, rgba(125,230,155,0.04) 0%, transparent 65%)',
      }} />

      {/* Thin horizontal rule top */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(125,230,155,0.4), transparent)',
          transformOrigin: 'center',
        }}
      />

      {/* Department tag */}
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
          marginBottom: 40,
          textAlign: 'center',
        }}
      >
        Baptist Health · Marketing &amp; Communications
      </motion.div>

      {/* Giant title */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.75, delay: 0.22 }}
        style={{ textAlign: 'center', marginBottom: 28 }}
      >
        <div style={{
          fontFamily: "'Plus Jakarta Sans', DM Sans, sans-serif",
          fontSize: 'clamp(68px, 9vw, 112px)',
          fontWeight: 900,
          color: 'var(--text-primary)',
          lineHeight: 0.95,
          letterSpacing: '-0.04em',
        }}>
          AI Adoption
        </div>
        <div style={{
          fontFamily: "'Plus Jakarta Sans', DM Sans, sans-serif",
          fontSize: 'clamp(68px, 9vw, 112px)',
          fontWeight: 900,
          color: '#7DE69B',
          lineHeight: 0.95,
          letterSpacing: '-0.04em',
          marginTop: 8,
        }}>
          In Motion
        </div>
      </motion.div>

      {/* Stat triptych */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.45 }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 0,
          marginBottom: 52,
        }}
      >
        {[
          { value: '14', label: 'Months' },
          { value: '3',  label: 'Surveys' },
          { value: totalN, label: 'Voices' },
        ].map((item, i) => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ textAlign: 'center', padding: '0 32px' }}>
              <div style={{
                fontFamily: 'DM Sans, sans-serif',
                fontSize: 'clamp(36px, 4vw, 52px)',
                fontWeight: 900,
                color: 'var(--text-medium)',
                lineHeight: 1,
                letterSpacing: '-0.03em',
              }}>
                {item.value}
              </div>
              <div style={{
                fontFamily: 'DM Sans, sans-serif',
                fontSize: 12,
                color: '#797D80',
                marginTop: 5,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}>
                {item.label}
              </div>
            </div>
            {i < 2 && (
              <div style={{ width: 1, height: 36, background: 'rgba(125,230,155,0.15)' }} />
            )}
          </div>
        ))}
      </motion.div>

      {/* Opening line */}
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, delay: 0.62 }}
        style={{
          fontFamily: 'DM Sans, sans-serif',
          fontSize: 'clamp(15px, 1.6vw, 19px)',
          color: 'var(--text-bridge)',
          lineHeight: 1.7,
          textAlign: 'center',
          maxWidth: 640,
          margin: 0,
          fontStyle: 'italic',
        }}
      >
        "This is not a report.
        <br />
        This is the story of a department that chose to lead."
      </motion.p>

      {/* Bottom date */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.82 }}
        style={{
          position: 'absolute',
          bottom: 36,
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 11,
          color: 'var(--text-support)',
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
        }}
      >
        January 2025 — March 2026
      </motion.div>

      {/* Bottom rule */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.2, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(125,230,155,0.2), transparent)',
          transformOrigin: 'center',
        }}
      />
    </div>
  );
}
