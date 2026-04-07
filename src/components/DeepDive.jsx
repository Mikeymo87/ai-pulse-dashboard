import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { useTheme } from '../hooks/useTheme';
import { useIsMobile } from '../hooks/useIsMobile';

// ─── Color palette for roles ──────────────────────────────────────────────────
const ROLE_PALETTE = [
  '#7DE69B', '#59BEC9', '#FFCD00', '#2EA84A',
  '#b388ff', '#80deea', '#ffab40', '#f48fb1',
  '#a5d6a7', '#90caf9',
];
function roleColor(role, roleList) {
  const idx = roleList.indexOf(role);
  return ROLE_PALETTE[idx % ROLE_PALETTE.length] ?? '#797D80';
}

// ─── Deterministic jitter so dots don't stack on integer grid ─────────────────
function jitter(i, axis) {
  const seed = axis === 'x' ? i * 13 + 7 : i * 19 + 3;
  return ((seed % 21) - 10) / 10 * 0.22;
}

// ─── Custom scatter tooltip ───────────────────────────────────────────────────
function ScatterTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  return (
    <div style={{
      background: 'var(--tooltip-bg)',
      border: '1px solid rgba(125,230,155,0.2)',
      borderRadius: 10,
      padding: '10px 14px',
      fontFamily: 'DM Sans, sans-serif',
      fontSize: 12,
      color: 'var(--text-medium)',
      lineHeight: 1.7,
      minWidth: 160,
    }}>
      {d.role && <div style={{ fontWeight: 700, color: d.color, marginBottom: 2 }}>{d.role}</div>}
      {d.fn && <div style={{ fontSize: 11, color: 'var(--text-support)', marginBottom: 6 }}>{d.fn}</div>}
      <div>Importance: <strong>{d.rawX}</strong> / 5</div>
      <div>Confidence: <strong>{d.rawY}</strong> / 5</div>
      {d.frequency && <div>Frequency: <strong>{d.frequency}</strong></div>}
    </div>
  );
}

// ─── Quadrant label component ─────────────────────────────────────────────────
function QuadLabel({ x, y, text, color }) {
  return (
    <div style={{
      position: 'absolute',
      left: x,
      top: y,
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: '0.08em',
      color,
      textTransform: 'uppercase',
      opacity: 0.55,
      fontFamily: 'DM Sans, sans-serif',
      pointerEvents: 'none',
      lineHeight: 1.3,
      textAlign: 'center',
    }}>
      {text}
    </div>
  );
}

// ─── Metric bar row ───────────────────────────────────────────────────────────
function MetricBar({ label, value, max = 5, color }) {
  const pct = value ? Math.round((value / max) * 100) : 0;
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        fontFamily: 'DM Sans, sans-serif', fontSize: 11, marginBottom: 4,
      }}>
        <span style={{ color: 'var(--text-support)', fontWeight: 500 }}>{label}</span>
        <span style={{ color, fontWeight: 700 }}>{value ? value.toFixed(1) : '—'}</span>
      </div>
      <div style={{ height: 5, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${pct}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          style={{ height: '100%', background: color, borderRadius: 3 }}
        />
      </div>
    </div>
  );
}

// ─── Role/Function breakdown card ────────────────────────────────────────────
function GroupCard({ name, data, color, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay: index * 0.06 }}
      style={{
        background: 'var(--card-bg)',
        border: '1px solid var(--border)',
        borderRadius: 14,
        padding: '20px 20px 16px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <p style={{
          margin: 0,
          fontFamily: 'DM Sans, sans-serif',
          fontSize: 13,
          fontWeight: 700,
          color: 'var(--text-primary)',
          lineHeight: 1.3,
          maxWidth: '75%',
        }}>{name}</p>
        <span style={{
          background: `${color}18`,
          border: `1px solid ${color}35`,
          borderRadius: 20,
          padding: '2px 9px',
          fontSize: 10,
          fontWeight: 700,
          color,
          fontFamily: 'DM Sans, sans-serif',
          flexShrink: 0,
        }}>n={data.count}</span>
      </div>
      <MetricBar label="Confidence" value={data.confidenceAvg} color="#FFCD00" />
      <MetricBar label="Importance" value={data.importanceAvg} color="#7DE69B" />
      <MetricBar label="Familiarity" value={data.familiarityAvg} color="#59BEC9" />
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
const SORT_OPTIONS = [
  { key: 'confidence', label: 'Confidence' },
  { key: 'importance', label: 'Importance' },
  { key: 'familiarity', label: 'Familiarity' },
  { key: 'alpha', label: 'A → Z' },
];

export default function DeepDive({ surveys, transforms }) {
  const [groupBy, setGroupBy] = useState('role');
  const [sortBy, setSortBy] = useState('confidence');
  const [cardFilter, setCardFilter] = useState('all');
  const [scatterFilter, setScatterFilter] = useState('all');
  const isMobile = useIsMobile();

  // Reset cross-filter whenever the primary grouping switches
  useEffect(() => { setCardFilter('all'); }, [groupBy]);
  const theme = useTheme();
  const isLight = theme === 'light';
  const axisColor = isLight ? '#555a60' : '#797D80';
  const gridStroke = isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.05)';
  const refLineStroke = isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.08)';

  const s3Rows = surveys?.survey3 ?? [];

  // ── Scatter dimension lists ───────────────────────────────────────────────
  const allRoles = useMemo(() =>
    [...new Set(s3Rows.map(r => r.role).filter(Boolean))].sort()
  , [s3Rows]);

  const allFunctions = useMemo(() =>
    [...new Set(s3Rows.map(r => r.function).filter(Boolean))].sort()
  , [s3Rows]);

  // ── All scatter dots (unfiltered) ─────────────────────────────────────────
  const scatterData = useMemo(() =>
    s3Rows
      .filter(r => r.confidence !== null && r.importance !== null)
      .map((r, i) => ({
        x: r.importance + jitter(i, 'x'),
        y: r.confidence + jitter(i, 'y'),
        rawX: r.importance,
        rawY: r.confidence,
        role: r.role ?? 'Unknown',
        fn: r.function ?? null,
        frequency: r.frequency,
        color: r.role ? roleColor(r.role, [...new Set(s3Rows.map(rr => rr.role).filter(Boolean))].sort()) : '#797D80',
      })),
  [s3Rows]);

  // ── Apply filter, then group by role for Recharts series (color per role) ──
  const scatterByGroup = useMemo(() => {
    let filtered = scatterData;
    if (scatterFilter.startsWith('role:')) {
      const val = scatterFilter.slice(5);
      filtered = scatterData.filter(d => d.role === val);
    } else if (scatterFilter.startsWith('fn:')) {
      const val = scatterFilter.slice(3);
      filtered = scatterData.filter(d => d.fn === val);
    }
    // Always color by role
    const map = {};
    for (const d of filtered) {
      if (!map[d.role]) map[d.role] = [];
      map[d.role].push(d);
    }
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  }, [scatterData, scatterFilter]);

  // ── Legend — roles present in the current filtered set ───────────────────
  const scatterLegend = useMemo(() =>
    scatterByGroup.map(([role, dots]) => ({ name: role, color: dots[0]?.color ?? '#797D80' }))
  , [scatterByGroup]);

  // ── Breakdown data — cross-filtered from raw rows, then sorted ───────────
  const groupData = useMemo(() => {
    // Apply cross-filter to raw rows
    let rows = s3Rows;
    if (cardFilter.startsWith('role:')) {
      const val = cardFilter.slice(5);
      rows = rows.filter(r => r.role === val);
    } else if (cardFilter.startsWith('fn:')) {
      const val = cardFilter.slice(3);
      rows = rows.filter(r => r.function === val);
    }

    // Helper: average a numeric field over an array of rows
    const avg = (arr, field) => {
      const vals = arr.map(r => r[field]).filter(v => v !== null && v !== undefined);
      return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
    };

    // Group by the primary dimension
    const grouped = {};
    for (const r of rows) {
      const key = groupBy === 'role' ? r.role : r.function;
      if (!key) continue;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(r);
    }

    const raw = Object.entries(grouped).map(([name, group]) => ({
      name,
      data: {
        count: group.length,
        confidenceAvg: avg(group, 'confidence'),
        importanceAvg: avg(group, 'importance'),
        familiarityAvg: avg(group, 'familiarity'),
      },
    }));

    return raw.sort((a, b) => {
      if (sortBy === 'alpha') return (a.name ?? '').localeCompare(b.name ?? '');
      if (sortBy === 'confidence') return (b.data.confidenceAvg ?? 0) - (a.data.confidenceAvg ?? 0);
      if (sortBy === 'importance') return (b.data.importanceAvg ?? 0) - (a.data.importanceAvg ?? 0);
      if (sortBy === 'familiarity') return (b.data.familiarityAvg ?? 0) - (a.data.familiarityAvg ?? 0);
      return 0;
    });
  }, [groupBy, sortBy, cardFilter, s3Rows]);

  return (
    <section
      id="deepdive"
      style={{
        padding: isMobile ? '40px 16px 48px' : '96px 32px 80px',
        maxWidth: 1360,
        margin: '0 auto',
        fontFamily: 'DM Sans, sans-serif',
      }}
    >
      {/* Section header */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        style={{ marginBottom: 56 }}
      >
        <div style={{
          display: 'inline-block',
          padding: '4px 12px',
          borderRadius: 20,
          background: 'var(--accent-mint-bg)',
          border: '1px solid rgba(125,230,155,0.25)',
          color: 'var(--accent-mint)',
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          marginBottom: 16,
          fontFamily: 'DM Sans, sans-serif',
        }}>
          Survey 3 Deep Dive
        </div>
        <h2 style={{
          margin: '0 0 12px',
          fontSize: 'clamp(28px, 4vw, 40px)',
          fontWeight: 900,
          color: 'var(--text-primary)',
          lineHeight: 1.15,
          letterSpacing: '-0.02em',
          fontFamily: 'DM Sans, sans-serif',
        }}>
          Who's Ready, Who Needs Support
        </h2>
        <p style={{
          margin: 0,
          fontSize: 15,
          color: 'var(--text-support)',
          maxWidth: 520,
          lineHeight: 1.7,
          fontFamily: 'DM Sans, sans-serif',
        }}>
          Role and function data is from Survey 3 only — Surveys 1 &amp; 2 were anonymous.
        </p>
      </motion.div>

      {/* ── Scatter Plot ──────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.55 }}
        style={{
          background: 'var(--card-bg)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          padding: '32px 36px 28px',
          marginBottom: 48,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 4, flexWrap: 'wrap', flexDirection: isMobile ? 'column' : 'row' }}>
          <p style={{ margin: 0, fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '0.01em' }}>
            Confidence vs. Importance
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, width: isMobile ? '100%' : 'auto' }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-support)', fontFamily: 'DM Sans, sans-serif', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Filter</span>
            <select
              value={scatterFilter}
              onChange={e => setScatterFilter(e.target.value)}
              style={{
                background: 'var(--card-bg-dark)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                padding: '5px 28px 5px 10px',
                fontFamily: 'DM Sans, sans-serif',
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--text-primary)',
                cursor: 'pointer',
                outline: 'none',
                appearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23797D80' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 8px center',
              }}
            >
              <option value="all">All respondents</option>
              <optgroup label="── By Role">
                {allRoles.map(r => <option key={r} value={`role:${r}`}>{r}</option>)}
              </optgroup>
              <optgroup label="── By Function">
                {allFunctions.map(f => <option key={f} value={`fn:${f}`}>{f}</option>)}
              </optgroup>
            </select>
          </div>
        </div>
        <p style={{ margin: '0 0 24px', fontSize: 13, color: 'var(--text-support)', lineHeight: 1.6 }}>
          Each dot = one respondent. X = importance to role; Y = confidence using AI.
        </p>

        {/* Quadrant labels overlay */}
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', top: 8, right: isMobile ? 8 : 40, zIndex: 1, textAlign: 'right' }}>
            <div style={{ fontSize: isMobile ? 9 : 11, fontWeight: 700, color: '#7DE69B', opacity: 0.6, letterSpacing: '0.07em', textTransform: 'uppercase' }}>Ready to Lead</div>
          </div>
          <div style={{ position: 'absolute', top: 8, left: isMobile ? 8 : 40, zIndex: 1 }}>
            <div style={{ fontSize: isMobile ? 9 : 11, fontWeight: 700, color: '#FFCD00', opacity: 0.6, letterSpacing: '0.07em', textTransform: 'uppercase' }}>Quiet Users</div>
          </div>
          <div style={{ position: 'absolute', bottom: 36, right: isMobile ? 8 : 40, zIndex: 1, textAlign: 'right' }}>
            <div style={{ fontSize: isMobile ? 9 : 11, fontWeight: 700, color: '#E5554F', opacity: 0.6, letterSpacing: '0.07em', textTransform: 'uppercase' }}>Needs Support</div>
          </div>
          <div style={{ position: 'absolute', bottom: 36, left: isMobile ? 8 : 40, zIndex: 1 }}>
            <div style={{ fontSize: isMobile ? 9 : 11, fontWeight: 700, color: '#797D80', opacity: 0.6, letterSpacing: '0.07em', textTransform: 'uppercase' }}>Not Engaged</div>
          </div>

          <ResponsiveContainer width="100%" height={isMobile ? 280 : 400}>
            <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis
                type="number" dataKey="x" name="Importance"
                domain={[0.5, 5.5]} ticks={[1, 2, 3, 4, 5]}
                tick={{ fill: axisColor, fontSize: 11, fontFamily: 'DM Sans, sans-serif' }}
                tickLine={false} axisLine={false}
                label={{ value: 'Importance to Role →', position: 'insideBottom', offset: -8, fill: axisColor, fontSize: 11, fontFamily: 'DM Sans, sans-serif' }}
              />
              <YAxis
                type="number" dataKey="y" name="Confidence"
                domain={[0.5, 5.5]} ticks={[1, 2, 3, 4, 5]}
                tick={{ fill: axisColor, fontSize: 11, fontFamily: 'DM Sans, sans-serif' }}
                tickLine={false} axisLine={false}
                label={{ value: 'Confidence →', angle: -90, position: 'insideLeft', offset: 10, fill: axisColor, fontSize: 11, fontFamily: 'DM Sans, sans-serif' }}
              />
              <Tooltip content={<ScatterTooltip />} cursor={{ strokeDasharray: '3 3', stroke: 'rgba(125,230,155,0.2)' }} />
              {/* Quadrant dividers */}
              <ReferenceLine x={3} stroke={refLineStroke} strokeDasharray="4 4" />
              <ReferenceLine y={3} stroke={refLineStroke} strokeDasharray="4 4" />
              {scatterByGroup.map(([groupName, dots]) => (
                <Scatter
                  key={groupName}
                  name={groupName}
                  data={dots}
                  fill={dots[0]?.color ?? '#7DE69B'}
                  opacity={0.85}
                  r={5}
                />
              ))}
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* Dynamic legend */}
        {scatterLegend.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 16px', marginTop: 12 }}>
            {scatterLegend.map(({ name, color }) => (
              <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
                <span style={{ fontSize: 11, color: 'var(--text-medium)', fontFamily: 'DM Sans, sans-serif' }}>{name}</span>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* ── Role & Function Breakdown ─────────────────────────────────────── */}
      <div>
        {/* Toggle + sort controls */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 12, flexDirection: isMobile ? 'column' : 'row' }}>
            <div>
              <p style={{ margin: '0 0 2px', fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '0.01em' }}>Team Breakdown</p>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--text-support)', lineHeight: 1.5 }}>
                {cardFilter === 'all'
                  ? 'Average scores across Confidence, Importance, and Familiarity (scale 1–5)'
                  : <>Showing <strong style={{ color: 'var(--accent-mint)' }}>{cardFilter.startsWith('role:') ? cardFilter.slice(5) : cardFilter.slice(3)}</strong> only — averages recalculated for this subset</>
                }
              </p>
            </div>
            {/* Group toggle */}
            <div style={{
              display: 'flex',
              background: 'var(--card-bg-dark)',
              border: '1px solid var(--border)',
              borderRadius: 10,
              padding: 3,
              gap: 2,
              flexShrink: 0,
            }}>
              {['role', 'function'].map(opt => (
                <button
                  key={opt}
                  onClick={() => setGroupBy(opt)}
                  style={{
                    padding: '6px 18px',
                    borderRadius: 8,
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: 'DM Sans, sans-serif',
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: '0.03em',
                    transition: 'all 0.2s',
                    background: groupBy === opt ? 'rgba(125,230,155,0.15)' : 'transparent',
                    color: groupBy === opt ? 'var(--accent-mint)' : 'var(--text-support)',
                  }}
                >
                  By {opt.charAt(0).toUpperCase() + opt.slice(1)}
                </button>
              ))}
            </div>
          </div>
          {/* Sort + cross-filter row */}
          <div style={{ display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', gap: isMobile ? 10 : 16, flexWrap: 'wrap', flexDirection: isMobile ? 'column' : 'row' }}>
            {/* Sort pills */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-support)', fontFamily: 'DM Sans, sans-serif', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Sort</span>
              {SORT_OPTIONS.map(opt => (
                <button
                  key={opt.key}
                  onClick={() => setSortBy(opt.key)}
                  style={{
                    padding: '4px 12px',
                    borderRadius: 20,
                    border: `1px solid ${sortBy === opt.key ? 'rgba(125,230,155,0.4)' : 'var(--border)'}`,
                    cursor: 'pointer',
                    fontFamily: 'DM Sans, sans-serif',
                    fontSize: 11,
                    fontWeight: 600,
                    transition: 'all 0.18s',
                    background: sortBy === opt.key ? 'rgba(125,230,155,0.12)' : 'transparent',
                    color: sortBy === opt.key ? 'var(--accent-mint)' : 'var(--text-support)',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Cross-filter: when viewing By Role → filter by function; By Function → filter by role */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-support)', fontFamily: 'DM Sans, sans-serif', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                {groupBy === 'role' ? 'Filter by function' : 'Filter by role'}
              </span>
              <select
                value={cardFilter}
                onChange={e => setCardFilter(e.target.value)}
                style={{
                  background: cardFilter !== 'all' ? 'rgba(125,230,155,0.08)' : 'var(--card-bg-dark)',
                  border: `1px solid ${cardFilter !== 'all' ? 'rgba(125,230,155,0.35)' : 'var(--border)'}`,
                  borderRadius: 8,
                  padding: '5px 28px 5px 10px',
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize: 12,
                  fontWeight: 600,
                  color: cardFilter !== 'all' ? 'var(--accent-mint)' : 'var(--text-primary)',
                  cursor: 'pointer',
                  outline: 'none',
                  appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23797D80' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 8px center',
                  minWidth: 160,
                }}
              >
                {groupBy === 'role' ? (
                  <>
                    <option value="all">All functions</option>
                    {allFunctions.map(f => <option key={f} value={`fn:${f}`}>{f}</option>)}
                  </>
                ) : (
                  <>
                    <option value="all">All roles</option>
                    {allRoles.map(r => <option key={r} value={`role:${r}`}>{r}</option>)}
                  </>
                )}
              </select>
            </div>
          </div>
        </div>

        {/* Cards grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: 16,
        }}>
          {groupData.map(({ name, data }, i) => (
            <GroupCard
              key={name}
              name={name}
              data={data}
              color={ROLE_PALETTE[i % ROLE_PALETTE.length]}
              index={i}
            />
          ))}
        </div>
      </div>

    </section>
  );
}
