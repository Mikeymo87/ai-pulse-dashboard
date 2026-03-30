import { motion } from 'framer-motion';

export default function Nav() {
  return (
    <div style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      height: 56,
      background: 'rgba(26,29,30,0.92)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(125,230,155,0.08)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 40px',
      boxSizing: 'border-box',
    }}>
      {/* Left — brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
        {/* Glowing green dot */}
        <motion.div
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: '#2EA84A',
            boxShadow: '0 0 10px rgba(46,168,74,0.8)',
            flexShrink: 0,
          }}
        />
        <span style={{
          fontSize: 14,
          fontWeight: 700,
          color: '#ffffff',
          letterSpacing: '-0.01em',
          fontFamily: 'Inter, sans-serif',
          marginLeft: 10,
        }}>
          Baptist Health
        </span>
        <span style={{
          fontSize: 18,
          color: 'rgba(125,230,155,0.2)',
          margin: '0 12px',
          lineHeight: 1,
          fontWeight: 300,
        }}>
          |
        </span>
        <span style={{
          fontSize: 13,
          fontWeight: 500,
          color: '#7DE69B',
          letterSpacing: '0.01em',
          fontFamily: 'Inter, sans-serif',
        }}>
          AI Pulse
        </span>
      </div>

      {/* Right — survey label */}
      <div style={{ marginLeft: 'auto' }}>
        <span style={{
          fontSize: 11,
          color: '#797D80',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        }}>
          AI Engagement Pulse Survey
        </span>
      </div>
    </div>
  );
}
