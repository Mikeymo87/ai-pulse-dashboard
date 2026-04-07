import { useTheme } from '../hooks/useTheme';
import { useIsMobile } from '../hooks/useIsMobile';

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 's1',       label: 'Survey 1', sub: 'Jan–Feb 2025' },
  { key: 's2',       label: 'Survey 2', sub: 'Aug–Sep 2025' },
  { key: 's3',       label: 'Survey 3', sub: 'Mar 2026' },
];

export default function NumbersSubNav({ active, onChange }) {
  const theme    = useTheme();
  const isLight  = theme === 'light';
  const isMobile = useIsMobile();

  return (
    <div style={{
      borderBottom: `1px solid ${isLight ? 'rgba(46,168,74,0.12)' : 'rgba(125,230,155,0.10)'}`,
      marginBottom: 32,
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: isMobile ? 'flex-start' : 'center',
        gap: 4,
        padding: isMobile ? '0 8px' : '0 32px',
        maxWidth: 1360,
        margin: '0 auto',
        overflowX: isMobile ? 'auto' : 'visible',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        WebkitOverflowScrolling: 'touch',
      }}>
        {TABS.map(tab => {
          const isActive = active === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => onChange(tab.key)}
              style={{
                background: 'none',
                border: 'none',
                borderBottom: isActive
                  ? '2px solid #7DE69B'
                  : '2px solid transparent',
                padding: isMobile ? '10px 14px 11px' : '10px 16px 11px',
                cursor: 'pointer',
                fontFamily: 'DM Sans, sans-serif',
                fontSize: isMobile ? 12 : 13,
                fontWeight: isActive ? 700 : 500,
                color: isActive ? 'var(--accent-mint)' : 'var(--text-support)',
                letterSpacing: '0.01em',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1,
                transition: 'color 0.15s, border-color 0.15s',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              {tab.label}
              {tab.sub && !isMobile && (
                <span style={{
                  fontSize: 10,
                  fontWeight: 400,
                  color: isActive ? 'rgba(125,230,155,0.65)' : 'var(--text-dim)',
                  letterSpacing: '0.01em',
                }}>
                  {tab.sub}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
