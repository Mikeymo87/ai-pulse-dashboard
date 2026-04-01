import { useState } from 'react';
import { motion } from 'framer-motion';

// ─── Intensity helpers ────────────────────────────────────────────────────────
function getIntensity(pct, maxPct) {
  if (!maxPct) return 'low';
  const r = pct / maxPct;
  if (r >= 0.66) return 'high';
  if (r >= 0.33) return 'mid';
  return 'low';
}

// ─── Color maps ───────────────────────────────────────────────────────────────
// Struggle: low mint → mid amber → high coral (friction scale)
const STRUGGLE_COLORS = {
  high: { bg: 'rgba(229,85,79,0.25)',   border: 'rgba(229,85,79,0.55)',   accent: '#E5554F' },
  mid:  { bg: 'rgba(255,205,0,0.18)',   border: 'rgba(255,205,0,0.45)',   accent: '#FFCD00' },
  low:  { bg: 'rgba(125,230,155,0.10)', border: 'rgba(125,230,155,0.28)', accent: '#7DE69B' },
};

// Excitement: low mint → mid BH green → high turquoise (energy scale)
const EXCITEMENT_COLORS = {
  high: { bg: 'rgba(89,190,201,0.25)',  border: 'rgba(89,190,201,0.55)',  accent: '#59BEC9' },
  mid:  { bg: 'rgba(46,168,74,0.20)',   border: 'rgba(46,168,74,0.45)',   accent: '#2EA84A' },
  low:  { bg: 'rgba(125,230,155,0.10)', border: 'rgba(125,230,155,0.25)', accent: '#7DE69B' },
};

// ─── Individual heatmap cell ──────────────────────────────────────────────────
function ThemeCell({ theme, colorMap, maxPct, onEnter, onLeave, delay }) {
  const intensity = getIntensity(theme.pct, maxPct);
  const c = colorMap[intensity];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.32, delay }}
      whileHover={{ filter: 'brightness(1.18)' }}
      onMouseEnter={(e) => onEnter(e, theme)}
      onMouseLeave={onLeave}
      style={{
        background: c.bg,
        border: `1px solid ${c.border}`,
        borderRadius: 10,
        padding: '10px 12px',
        cursor: 'default',
        display: 'flex',
        flexDirection: 'column',
        gap: 5,
        minHeight: 62,
        transition: 'filter 0.15s',
      }}
    >
      <span style={{
        color: '#e0e0e0',
        fontSize: 11.5,
        fontWeight: 600,
        fontFamily: 'Inter, sans-serif',
        lineHeight: 1.35,
      }}>
        {theme.label}
      </span>
      <span style={{
        color: c.accent,
        fontSize: 14,
        fontWeight: 800,
        fontFamily: 'Inter, sans-serif',
        letterSpacing: '-0.01em',
      }}>
        {theme.pct}%
        <span style={{ fontSize: 10, fontWeight: 500, color: '#797D80', marginLeft: 5 }}>
          ({theme.count})
        </span>
      </span>
    </motion.div>
  );
}

// ─── Fixed tooltip ────────────────────────────────────────────────────────────
const TOOLTIP_EST_H = 230;

function HoverTooltip({ tooltip }) {
  if (!tooltip) return null;
  const { theme, rect, colorMap, maxPct } = tooltip;
  const intensity = getIntensity(theme.pct, maxPct);
  const c = colorMap[intensity];

  const top = rect.top > TOOLTIP_EST_H + 20
    ? rect.top - TOOLTIP_EST_H - 10
    : rect.bottom + 10;
  const left = Math.min(
    Math.max(8, rect.left + rect.width / 2 - 170),
    window.innerWidth - 348,
  );

  return (
    <div
      style={{
        position: 'fixed',
        top,
        left,
        width: 340,
        background: '#1a1d1e',
        border: `1px solid ${c.border}`,
        borderRadius: 12,
        padding: '14px 16px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.65)',
        pointerEvents: 'none',
        zIndex: 9999,
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <p style={{ color: '#e0e0e0', fontWeight: 700, fontSize: 13.5, margin: '0 0 4px', lineHeight: 1.3 }}>
        {theme.label}
      </p>
      <p style={{ color: c.accent, fontWeight: 800, fontSize: 15, margin: '0 0 10px' }}>
        {theme.count} respondents &middot; {theme.pct}% of team
      </p>
      {theme.quotes?.length > 0 && (
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.08)',
          paddingTop: 10,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}>
          {theme.quotes.slice(0, 3).map((q, i) => (
            <p key={i} style={{
              color: 'rgba(224,224,224,0.78)',
              fontSize: 11,
              fontStyle: 'italic',
              margin: 0,
              lineHeight: 1.5,
              paddingLeft: 9,
              borderLeft: `2px solid ${c.border}`,
            }}>
              &ldquo;{q}&rdquo;
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Intensity legend strip ───────────────────────────────────────────────────
function IntensityLegend({ colorMap }) {
  return (
    <div style={{ display: 'flex', gap: 12, marginTop: 12, alignItems: 'center' }}>
      <span style={{ color: '#797D80', fontSize: 10, fontFamily: 'Inter, sans-serif' }}>
        Intensity:
      </span>
      {['low', 'mid', 'high'].map((level) => {
        const c = colorMap[level];
        return (
          <div key={level} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{
              width: 10, height: 10, borderRadius: 2,
              background: c.bg, border: `1px solid ${c.border}`,
              display: 'inline-block',
            }} />
            <span style={{ color: '#797D80', fontSize: 10, fontFamily: 'Inter, sans-serif', textTransform: 'capitalize' }}>
              {level}
            </span>
          </div>
        );
      })}
    </div>
  );
}

const FONT = 'Inter, sans-serif';

// ─── Main component ───────────────────────────────────────────────────────────
export default function StruggleMap({ transforms }) {
  const {
    struggleThemesS3 = [], excitementThemesS3 = [],
  } = transforms;

  const [tooltip, setTooltip] = useState(null);

  const struggles  = struggleThemesS3;
  const excitement = excitementThemesS3;

  const maxStruggle   = Math.max(...struggles.map(t => t.pct),   1);
  const maxExcitement = Math.max(...excitement.map(t => t.pct),  1);

  const handleEnter = (e, theme, colorMap, maxPct) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({ theme, rect, colorMap, maxPct });
  };
  const handleLeave = () => setTooltip(null);

  if (!struggleThemesS3.length && !excitementThemesS3.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
      style={{ marginTop: 20 }}
    >
      {/* Section header */}
      <div style={{ marginBottom: 16, textAlign: 'center' }}>
        <p style={{
          color: '#7DE69B', fontSize: 11, fontWeight: 700,
          letterSpacing: '0.12em', textTransform: 'uppercase',
          margin: '0 0 6px', fontFamily: FONT,
        }}>
          Struggle Map
        </p>
        <h3 style={{
          color: '#e0e0e0', fontSize: 'clamp(18px, 2.5vw, 24px)',
          fontWeight: 800, margin: 0, fontFamily: FONT, lineHeight: 1.2,
        }}>
          What&rsquo;s in the Way — and What They&rsquo;re Reaching For
        </h3>
        <p style={{
          color: '#797D80', fontSize: 12, margin: '7px 0 0',
          fontFamily: FONT,
        }}>
          Open-text responses thematically coded &middot; Hover any cell to read verbatim quotes
        </p>
      </div>

      {/* Two-panel heatmap card */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 0,
        background: 'rgba(29,77,82,0.35)',
        border: '1px solid rgba(125,230,155,0.15)',
        borderRadius: 16,
        overflow: 'hidden',
      }}>

        {/* ── Left: Struggles ──────────────────────────────────────────────── */}
        <div style={{ padding: '20px 20px 20px 20px', borderRight: '1px solid rgba(125,230,155,0.10)' }}>
          {/* Panel header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
            <span style={{
              width: 3, height: 18, background: '#E5554F',
              borderRadius: 2, display: 'inline-block', flexShrink: 0,
            }} />
            <p style={{
              color: '#e0e0e0', fontWeight: 700, fontSize: 13,
              margin: 0, fontFamily: 'Inter, sans-serif',
            }}>
              What&rsquo;s in the Way
            </p>
            <span style={{
              background: 'rgba(229,85,79,0.14)',
              color: '#E5554F',
              fontSize: 10, fontWeight: 700,
              padding: '2px 8px', borderRadius: 20,
              fontFamily: 'Inter, sans-serif',
              letterSpacing: '0.06em',
            }}>
              STRUGGLES
            </span>
          </div>

          {/* Struggle cells */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {struggles.map((theme, i) => (
              <ThemeCell
                key={theme.key}
                theme={theme}
                colorMap={STRUGGLE_COLORS}
                maxPct={maxStruggle}
                onEnter={(e, t) => handleEnter(e, t, STRUGGLE_COLORS, maxStruggle)}
                onLeave={handleLeave}
                delay={i * 0.04}
              />
            ))}
          </div>

          <IntensityLegend colorMap={STRUGGLE_COLORS} />
        </div>

        {/* ── Right: Excitement ────────────────────────────────────────────── */}
        <div style={{ padding: '20px 20px 20px 20px' }}>
          {/* Panel header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
            <span style={{
              width: 3, height: 18, background: '#59BEC9',
              borderRadius: 2, display: 'inline-block', flexShrink: 0,
            }} />
            <p style={{
              color: '#e0e0e0', fontWeight: 700, fontSize: 13,
              margin: 0, fontFamily: 'Inter, sans-serif',
            }}>
              What They&rsquo;re Reaching For
            </p>
            <span style={{
              background: 'rgba(89,190,201,0.14)',
              color: '#59BEC9',
              fontSize: 10, fontWeight: 700,
              padding: '2px 8px', borderRadius: 20,
              fontFamily: 'Inter, sans-serif',
              letterSpacing: '0.06em',
            }}>
              EXCITEMENT
            </span>
          </div>

          {/* Excitement cells */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {excitement.map((theme, i) => (
              <ThemeCell
                key={theme.key}
                theme={theme}
                colorMap={EXCITEMENT_COLORS}
                maxPct={maxExcitement}
                onEnter={(e, t) => handleEnter(e, t, EXCITEMENT_COLORS, maxExcitement)}
                onLeave={handleLeave}
                delay={i * 0.04}
              />
            ))}
          </div>

          <IntensityLegend colorMap={EXCITEMENT_COLORS} />
        </div>

      </div>

      {/* Insight callout */}
      <div style={{
        marginTop: 12,
        padding: '9px 12px',
        borderLeft: '3px solid rgba(125,230,155,0.55)',
        background: 'rgba(125,230,155,0.06)',
        borderRadius: '0 8px 8px 0',
      }}>
        <p style={{
          color: 'rgba(224,224,224,0.80)', fontSize: 11, fontStyle: 'italic',
          margin: 0, lineHeight: 1.55, fontFamily: 'Inter, sans-serif',
        }}>
          <span style={{ color: '#7DE69B', fontWeight: 700, fontStyle: 'normal', marginRight: 4 }}>
            What this tells us:
          </span>
          The left panel names the friction. The right names the energy already available to overcome it.
          Every struggle has a matching aspiration — the team isn&rsquo;t blocked by doubt,
          they&rsquo;re blocked by access, time, and structure. Those are solvable.
        </p>
      </div>

      {/* Fixed hover tooltip */}
      <HoverTooltip tooltip={tooltip} />
    </motion.div>
  );
}
