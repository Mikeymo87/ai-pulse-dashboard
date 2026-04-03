import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useIsMobile } from '../hooks/useIsMobile';

const TABS = [
  { id: 'story',      label: 'The Story' },
  { id: 'numbers',    label: 'The Numbers' },
  { id: 'team',       label: 'The Team' },
  { id: 'whats-next', label: "What's Next" },
  { id: 'playbook',   label: 'The Playbook' },
];

// ── Theme toggle helpers ──────────────────────────────────────────────────────
function getInitialTheme() {
  try {
    const saved = localStorage.getItem('ai-pulse-theme');
    if (saved === 'light' || saved === 'dark') {
      // Apply immediately so CSS vars are correct before first paint
      document.documentElement.setAttribute('data-theme', saved);
      return saved;
    }
  } catch (_) {}
  document.documentElement.setAttribute('data-theme', 'light');
  return 'light';
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  try { localStorage.setItem('ai-pulse-theme', theme); } catch (_) {}
  window.dispatchEvent(new CustomEvent('themechange', { detail: theme }));
}

// Sun icon (light mode indicator)
function SunIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" y1="1" x2="12" y2="3"/>
      <line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/>
      <line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  );
}

// Moon icon (dark mode indicator)
function MoonIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  );
}

export default function Nav({ onOpenChat, onPresent, activeTab, onTabChange }) {
  const [theme, setTheme] = useState(getInitialTheme);
  const isMobile = useIsMobile();

  // Apply theme on mount and whenever it changes
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  function toggleTheme() {
    setTheme(t => t === 'dark' ? 'light' : 'dark');
  }

  function handleTabChange(id) {
    onTabChange(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const isLight = theme === 'light';

  if (isMobile) {
    return (
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'var(--nav-bg)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--nav-border)',
        boxSizing: 'border-box',
      }}>
        {/* Row 1: Brand + actions */}
        <div style={{
          height: 48,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <motion.img
              src="/bh-pineapple.svg"
              alt="Baptist Health"
              animate={{ scale: [1, 1.07, 1], filter: ['drop-shadow(0 0 3px rgba(46,168,74,0.5))', 'drop-shadow(0 0 7px rgba(46,168,74,0.85))', 'drop-shadow(0 0 3px rgba(46,168,74,0.5))'] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              style={{ width: 22, height: 22, flexShrink: 0, display: 'block' }}
            />
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'DM Sans, sans-serif' }}>
              Baptist Health
            </span>
            <span style={{ fontSize: 16, color: 'var(--border)', margin: '0 4px', fontWeight: 300 }}>|</span>
            <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--accent-mint)', fontFamily: 'DM Sans, sans-serif' }}>
              AI Pulse
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <motion.button
              onClick={toggleTheme}
              whileTap={{ scale: 0.9 }}
              title={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 30, height: 30, borderRadius: '50%',
                background: isLight ? 'rgba(46,168,74,0.1)' : 'rgba(125,230,155,0.08)',
                border: isLight ? '1px solid rgba(46,168,74,0.25)' : '1px solid rgba(125,230,155,0.2)',
                cursor: 'pointer', color: isLight ? '#2EA84A' : '#7DE69B', padding: 0,
              }}
            >
              {isLight ? <SunIcon /> : <MoonIcon />}
            </motion.button>
            <motion.button
              onClick={onOpenChat}
              whileTap={{ scale: 0.96 }}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '5px 11px',
                background: 'rgba(46,168,74,0.15)',
                border: '1px solid rgba(125,230,155,0.35)',
                borderRadius: 20, cursor: 'pointer',
                fontFamily: 'DM Sans, sans-serif', fontSize: 11, fontWeight: 600,
                color: 'var(--accent-mint)',
              }}
            >
              <motion.span
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                style={{ fontSize: 9 }}
              >●</motion.span>
              Ask AI
            </motion.button>
          </div>
        </div>

        {/* Row 2: Scrollable tabs */}
        <div style={{
          display: 'flex',
          overflowX: 'auto',
          padding: '0 12px 0',
          gap: 0,
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          borderTop: '1px solid var(--nav-border)',
        }}>
          {TABS.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                style={{
                  position: 'relative',
                  padding: '9px 14px',
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontFamily: 'DM Sans, sans-serif', fontSize: 12,
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? 'var(--accent-mint)' : 'var(--text-support)',
                  whiteSpace: 'nowrap', outline: 'none', flexShrink: 0,
                }}
              >
                {tab.label}
                {isActive && (
                  <motion.div
                    layoutId="tab-indicator-mobile"
                    style={{
                      position: 'absolute', bottom: 0, left: 6, right: 6,
                      height: 2, background: 'var(--accent-mint)', borderRadius: 1,
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      height: 56,
      background: 'var(--nav-bg)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--nav-border)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 40px',
      boxSizing: 'border-box',
    }}>
      {/* Left — brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 0, flexShrink: 0 }}>
        <motion.img
          src="/bh-pineapple.svg"
          alt="Baptist Health"
          animate={{ scale: [1, 1.07, 1], filter: ['drop-shadow(0 0 3px rgba(46,168,74,0.5))', 'drop-shadow(0 0 8px rgba(46,168,74,0.9))', 'drop-shadow(0 0 3px rgba(46,168,74,0.5))'] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          style={{ width: 24, height: 24, flexShrink: 0, display: 'block' }}
        />
        <span style={{
          fontSize: 14,
          fontWeight: 700,
          color: 'var(--text-primary)',
          letterSpacing: '0.01em',
          fontFamily: 'DM Sans, sans-serif',
          marginLeft: 8,
        }}>
          Baptist Health
        </span>
        <span style={{
          fontSize: 18,
          color: 'var(--border)',
          margin: '0 12px',
          lineHeight: 1,
          fontWeight: 300,
        }}>
          |
        </span>
        <span style={{
          fontSize: 13,
          fontWeight: 500,
          color: 'var(--accent-mint)',
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
              onClick={() => handleTabChange(tab.id)}
              style={{
                position: 'relative',
                padding: '6px 16px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'DM Sans, sans-serif',
                fontSize: 13,
                fontWeight: isActive ? 600 : 400,
                color: isActive ? 'var(--accent-mint)' : 'var(--text-support)',
                letterSpacing: isActive ? '0.025em' : '0.01em',
                transition: 'color 0.2s',
                outline: 'none',
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = isLight ? '#2a2d30' : '#b0b5b8'; }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = 'var(--text-support)'; }}
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
                    background: 'var(--accent-mint)',
                    borderRadius: 1,
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Right — theme toggle + Ask AI + Present */}
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <span style={{
          fontSize: 11,
          color: 'var(--text-support)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        }}>
          AI Engagement Pulse Survey
        </span>

        {/* Theme toggle */}
        <motion.button
          onClick={toggleTheme}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          title={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: isLight ? 'rgba(46,168,74,0.1)' : 'rgba(125,230,155,0.08)',
            border: isLight ? '1px solid rgba(46,168,74,0.25)' : '1px solid rgba(125,230,155,0.2)',
            cursor: 'pointer',
            color: isLight ? '#2EA84A' : '#7DE69B',
            transition: 'all 0.2s',
            padding: 0,
          }}
        >
          {isLight ? <SunIcon /> : <MoonIcon />}
        </motion.button>

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
            color: 'var(--accent-mint)',
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
