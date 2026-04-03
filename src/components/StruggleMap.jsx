import { useState } from 'react';
import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';

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
  mid:  { bg: 'rgba(255,205,0,0.18)',   border: 'rgba(255,205,0,0.45)',   accent: 'var(--accent-yellow)' },
  low:  { bg: 'rgba(125,230,155,0.10)', border: 'rgba(125,230,155,0.28)', accent: 'var(--accent-mint)' },
};

// Excitement: low mint → mid BH green → high turquoise (energy scale)
const EXCITEMENT_COLORS = {
  high: { bg: 'rgba(89,190,201,0.25)',  border: 'rgba(89,190,201,0.55)',  accent: 'var(--accent-turq)' },
  mid:  { bg: 'rgba(46,168,74,0.20)',   border: 'rgba(46,168,74,0.45)',   accent: '#2EA84A' },
  low:  { bg: 'rgba(125,230,155,0.10)', border: 'rgba(125,230,155,0.25)', accent: 'var(--accent-mint)' },
};

// ─── Individual heatmap cell ──────────────────────────────────────────────────
function ThemeCell({ theme, colorMap, maxPct, onEnter, onLeave, delay }) {
  const intensity = getIntensity(theme.pct, maxPct);
  const c = colorMap[intensity];
  const IconComponent = theme.icon ? LucideIcons[theme.icon] : null;

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
        display: 'flex',
        alignItems: 'center',
        gap: 5,
        color: 'var(--text-medium)',
        fontSize: 'var(--text-sm)',
        fontWeight: 600,
        fontFamily: 'DM Sans, sans-serif',
        lineHeight: 1.35,
      }}>
        {IconComponent && (
          <IconComponent
            size={13}
            strokeWidth={1.75}
            style={{ color: c.accent, opacity: 0.75, flexShrink: 0 }}
          />
        )}
        {theme.label}
      </span>
      <span style={{
        color: c.accent,
        fontSize: 'var(--text-base)',
        fontWeight: 800,
        fontFamily: 'DM Sans, sans-serif',
        letterSpacing: '-0.01em',
      }}>
        {theme.pct}%
        <span style={{ fontSize: 'var(--text-xs)', fontWeight: 500, color: 'var(--text-support)', marginLeft: 5 }}>
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
        background: 'var(--tooltip-bg)',
        border: `1px solid ${c.border}`,
        borderRadius: 12,
        padding: '14px 16px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.65)',
        pointerEvents: 'none',
        zIndex: 9999,
        fontFamily: 'DM Sans, sans-serif',
      }}
    >
      <p style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: 'var(--text-base)', margin: '0 0 4px', lineHeight: 1.3 }}>
        {theme.label}
      </p>
      <p style={{ color: c.accent, fontWeight: 800, fontSize: 'var(--text-md)', margin: '0 0 10px' }}>
        {theme.count} respondents &middot; {theme.pct}% of team
      </p>
      {theme.quotes?.length > 0 && (
        <div style={{
          borderTop: '1px solid var(--border)',
          paddingTop: 10,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}>
          {theme.quotes.slice(0, 3).map((q, i) => (
            <p key={i} style={{
              color: 'var(--text-muted)',
              fontSize: 'var(--text-sm)',
              fontStyle: 'italic',
              margin: 0,
              lineHeight: 1.55,
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
      <span style={{ color: 'var(--text-support)', fontSize: 'var(--text-sm)', fontFamily: 'DM Sans, sans-serif' }}>
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
            <span style={{ color: 'var(--text-support)', fontSize: 'var(--text-sm)', fontFamily: 'DM Sans, sans-serif', textTransform: 'capitalize' }}>
              {level}
            </span>
          </div>
        );
      })}
    </div>
  );
}

const FONT = 'DM Sans, sans-serif';

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
      {/* ── Panel 1: What's Still in the Way ─────────────────────────────── */}
      <div style={{
        background: 'var(--surface-green)',
        border: '1px solid var(--border)',
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 20,
      }}>
        {/* Panel header */}
        <div style={{
          padding: '20px 24px 16px',
          borderBottom: '1px solid rgba(229,85,79,0.12)',
          background: 'rgba(229,85,79,0.04)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <span style={{
              width: 4, height: 20, background: '#E5554F',
              borderRadius: 2, display: 'inline-block', flexShrink: 0,
            }} />
            <span style={{
              background: 'rgba(229,85,79,0.14)',
              color: '#E5554F',
              fontSize: 'var(--text-xs)', fontWeight: 700,
              padding: '3px 10px', borderRadius: 20,
              fontFamily: 'DM Sans, sans-serif',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}>
              Barriers &amp; Friction
            </span>
          </div>
          <h3 style={{
            color: 'var(--text-primary)', fontWeight: 800,
            fontSize: 'var(--text-xl)',
            margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif",
            lineHeight: 1.2, letterSpacing: '-0.01em',
          }}>
            What&rsquo;s Still in the Way
          </h3>
          <p style={{
            color: 'var(--text-support)', fontSize: 'var(--text-base)',
            margin: '6px 0 0', fontFamily: FONT, lineHeight: 1.6,
          }}>
            Open-text responses thematically coded &middot; Hover any cell to read verbatim quotes
          </p>
          {/* Editorial anecdote */}
          <p style={{
            color: 'var(--text-bridge)',
            fontSize: 'var(--text-base)',
            fontStyle: 'italic',
            lineHeight: 1.75,
            margin: '12px 0 0',
            fontFamily: FONT,
            borderLeft: '3px solid rgba(229,85,79,0.40)',
            paddingLeft: 12,
          }}>
            Time is the constraint that effort alone can't fix. Nearly half the team says they want to go
            deeper — the will is there, the skill is growing — but the day-to-day workload doesn't leave
            room for real practice. The people who are most enthusiastic are often the most stretched.
            Protecting space to learn isn't a perk. It's the next infrastructure decision.
          </p>
        </div>

        {/* Struggle cells grid */}
        <div style={{ padding: '20px 24px 24px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: 10,
          }}>
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
      </div>

      {/* ── Panel 2: What's Working ───────────────────────────────────────── */}
      <div style={{
        background: 'var(--surface-green)',
        border: '1px solid var(--border)',
        borderRadius: 16,
        overflow: 'hidden',
      }}>
        {/* Panel header */}
        <div style={{
          padding: '20px 24px 16px',
          borderBottom: '1px solid rgba(89,190,201,0.12)',
          background: 'rgba(89,190,201,0.04)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <span style={{
              width: 4, height: 20, background: 'var(--accent-turq)',
              borderRadius: 2, display: 'inline-block', flexShrink: 0,
            }} />
            <span style={{
              background: 'rgba(89,190,201,0.14)',
              color: 'var(--accent-turq)',
              fontSize: 'var(--text-xs)', fontWeight: 700,
              padding: '3px 10px', borderRadius: 20,
              fontFamily: 'DM Sans, sans-serif',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}>
              Benefits &amp; Excitement
            </span>
          </div>
          <h3 style={{
            color: 'var(--text-primary)', fontWeight: 800,
            fontSize: 'var(--text-xl)',
            margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif",
            lineHeight: 1.2, letterSpacing: '-0.01em',
          }}>
            What&rsquo;s Working
          </h3>
          <p style={{
            color: 'var(--text-support)', fontSize: 'var(--text-base)',
            margin: '6px 0 0', fontFamily: FONT, lineHeight: 1.6,
          }}>
            What staff report gaining from AI &middot; Hover any cell to read verbatim quotes
          </p>
          {/* Editorial anecdote */}
          <p style={{
            color: 'var(--text-bridge)',
            fontSize: 'var(--text-base)',
            fontStyle: 'italic',
            lineHeight: 1.75,
            margin: '12px 0 0',
            fontFamily: FONT,
            borderLeft: '3px solid rgba(89,190,201,0.45)',
            paddingLeft: 12,
          }}>
            Efficiency and quality top the list — but what the open-text responses reveal is something
            more personal. Staff aren't just saving time. They're producing work they're proud of.
            The most common thread isn't "AI made this faster." It's "AI helped me do something I
            couldn't have done alone." That's a different kind of result, and it's the one that sticks.
          </p>
        </div>

        {/* Excitement cells grid */}
        <div style={{ padding: '20px 24px 24px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: 10,
          }}>
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
        marginTop: 16,
        padding: '11px 16px',
        borderLeft: '3px solid rgba(125,230,155,0.55)',
        background: 'rgba(125,230,155,0.06)',
        borderRadius: '0 8px 8px 0',
      }}>
        <p style={{
          color: 'var(--text-dim)', fontSize: 'var(--text-sm)', fontStyle: 'italic',
          margin: 0, lineHeight: 1.65, fontFamily: 'DM Sans, sans-serif',
        }}>
          <span style={{ color: 'var(--accent-mint)', fontWeight: 700, fontStyle: 'normal', marginRight: 4 }}>
            What this tells us:
          </span>
          The top panel names the friction. The bottom names the energy already available to overcome it.
          Every struggle has a matching aspiration — the team isn&rsquo;t blocked by doubt,
          they&rsquo;re blocked by access, time, and structure. Those are solvable.
        </p>
      </div>

      {/* Fixed hover tooltip */}
      <HoverTooltip tooltip={tooltip} />
    </motion.div>
  );
}
