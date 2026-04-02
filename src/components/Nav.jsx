import { motion } from 'framer-motion';

const TABS = [
  { id: 'story',      label: 'The Story' },
  { id: 'numbers',    label: 'The Numbers' },
  { id: 'team',       label: 'The Team' },
  { id: 'whats-next', label: "What's Next" },
];

export default function Nav({ onOpenChat, onPresent, activeTab, onTabChange }) {
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
      <div style={{ display: 'flex', alignItems: 'center', gap: 0, flexShrink: 0 }}>
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
          letterSpacing: '0.01em',
          fontFamily: 'DM Sans, sans-serif',
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
          fontFamily: 'DM Sans, sans-serif',
        }}>
          AI Pulse
        </span>
      </div>

      {/* Center — tab navigation */}
      <div style={{
        position: 'absolute',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        gap: 4,
      }}>
        {TABS.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              style={{
                position: 'relative',
                padding: '6px 16px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'DM Sans, sans-serif',
                fontSize: 13,
                fontWeight: isActive ? 600 : 400,
                color: isActive ? '#7DE69B' : '#797D80',
                letterSpacing: isActive ? '0.025em' : '0.01em',
                transition: 'color 0.2s',
                outline: 'none',
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = '#b0b5b8'; }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = '#797D80'; }}
            >
              {tab.label}
              {isActive && (
                <motion.div
                  layoutId="tab-indicator"
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 8,
                    right: 8,
                    height: 2,
                    background: '#7DE69B',
                    borderRadius: 1,
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Right — Ask AI button + survey label */}
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
        <span style={{
          fontSize: 11,
          color: '#797D80',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        }}>
          AI Engagement Pulse Survey
        </span>

        {/* Present button */}
        <motion.button
          onClick={onPresent}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 14px',
            background: 'rgba(99,102,241,0.12)',
            border: '1px solid rgba(99,102,241,0.3)',
            borderRadius: 20,
            cursor: 'pointer',
            fontFamily: 'DM Sans, sans-serif',
            fontSize: 12,
            fontWeight: 600,
            color: '#a5b4fc',
            letterSpacing: '0.03em',
            transition: 'background 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.22)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(99,102,241,0.12)'}
        >
          <span style={{ fontSize: 11 }}>⊞</span>
          Present
        </motion.button>

        <motion.button
          onClick={onOpenChat}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            padding: '6px 14px',
            background: 'rgba(46,168,74,0.15)',
            border: '1px solid rgba(125,230,155,0.35)',
            borderRadius: 20,
            cursor: 'pointer',
            fontFamily: 'DM Sans, sans-serif',
            fontSize: 12,
            fontWeight: 600,
            color: '#7DE69B',
            letterSpacing: '0.03em',
            transition: 'background 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(46,168,74,0.25)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(46,168,74,0.15)'}
        >
          <motion.span
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            style={{ fontSize: 10 }}
          >
            ●
          </motion.span>
          Ask AI
        </motion.button>
      </div>
    </div>
  );
}
