import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';

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
      background: '#1e2425',
      border: '1px solid rgba(125,230,155,0.2)',
      borderRadius: 10,
      padding: '10px 14px',
      fontFamily: 'Inter, sans-serif',
      fontSize: 12,
      color: '#e0e0e0',
      lineHeight: 1.7,
    }}>
      {d.role && <div style={{ fontWeight: 700, color: d.color, marginBottom: 4 }}>{d.role}</div>}
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
      fontFamily: 'Inter, sans-serif',
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
        fontFamily: 'Inter, sans-serif', fontSize: 11, marginBottom: 4,
      }}>
        <span style={{ color: '#797D80', fontWeight: 500 }}>{label}</span>
        <span style={{ color, fontWeight: 700 }}>{value ? value.toFixed(1) : '—'}</span>
      </div>
      <div style={{ height: 5, background: 'rgba(255,255,255,0.07)', borderRadius: 3, overflow: 'hidden' }}>
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
        background: 'rgba(29,77,82,0.35)',
        border: '1px solid rgba(125,230,155,0.15)',
        borderRadius: 14,
        padding: '20px 20px 16px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <p style={{
          margin: 0,
          fontFamily: 'Inter, sans-serif',
          fontSize: 13,
          fontWeight: 700,
          color: '#f0f2f4',
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
          fontFamily: 'Inter, sans-serif',
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
export default function DeepDive({ surveys, transforms }) {
  const [groupBy, setGroupBy] = useState('role');

  const s3Rows = surveys?.survey3 ?? [];
  const { byRole, byFunction } = transforms;

  // ── Scatter data ─────────────────────────────────────────────────────────
  const allRoles = useMemo(() => {
    const roles = [...new Set(s3Rows.map(r => r.role).filter(Boolean))].sort();
    return roles;
  }, [s3Rows]);

  const scatterData = useMemo(() =>
    s3Rows
      .filter(r => r.confidence !== null && r.importance !== null)
      .map((r, i) => ({
        x: r.importance + jitter(i, 'x'),
        y: r.confidence + jitter(i, 'y'),
        rawX: r.importance,
        rawY: r.confidence,
        role: r.role ?? 'Unknown',
        frequency: r.frequency,
        color: r.role ? roleColor(r.role, allRoles) : '#797D80',
      })),
  [s3Rows, allRoles]);

  // ── Breakdown data ────────────────────────────────────────────────────────
  const groupData = groupBy === 'role'
    ? byRole.map(d => ({ name: d.role, data: d }))
    : byFunction.map(d => ({ name: d.function, data: d }));

  // ── Scatter dot by role ───────────────────────────────────────────────────
  // Group dots by role so we can render one <Scatter> per role (for legend)
  const scatterByRole = useMemo(() => {
    const map = {};
    for (const d of scatterData) {
      if (!map[d.role]) map[d.role] = [];
      map[d.role].push(d);
    }
    return Object.entries(map);
  }, [scatterData]);

  return (
    <section
      id="deepdive"
      style={{
        padding: '96px 24px 80px',
        maxWidth: 1120,
        margin: '0 auto',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      {/* Section header */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        style={{ marginBottom: 52, textAlign: 'center' }}
      >
        <span style={{
          display: 'inline-block',
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '0.18em',
          color: '#7DE69B',
          textTransform: 'uppercase',
          marginBottom: 14,
        }}>
          Survey 3 Deep Dive
        </span>
        <h2 style={{
          margin: '0 0 14px',
          fontSize: 'clamp(28px, 4vw, 40px)',
          fontWeight: 900,
          color: '#f0f2f4',
          lineHeight: 1.15,
          letterSpacing: '-0.02em',
        }}>
          Who's Ready, Who Needs Support
        </h2>
        <p style={{
          margin: 0,
          fontSize: 15,
          color: '#797D80',
          maxWidth: 520,
          marginInline: 'auto',
          lineHeight: 1.6,
        }}>
          Role and function data is from Survey 3 only — Surveys 1 & 2 were anonymous.
        </p>
      </motion.div>

      {/* ── Scatter Plot ──────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.55 }}
        style={{
          background: 'rgba(29,77,82,0.35)',
          border: '1px solid rgba(125,230,155,0.15)',
          borderRadius: 16,
          padding: '28px 28px 20px',
          marginBottom: 40,
        }}
      >
        <p style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 800, color: '#f0f2f4' }}>
          Confidence vs. Importance
        </p>
        <p style={{ margin: '0 0 24px', fontSize: 13, color: '#797D80' }}>
          Each dot = one Survey 3 respondent. X = how important AI is to their role; Y = how confident they feel using it.
        </p>

        {/* Quadrant labels overlay */}
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', top: 8, right: 40, zIndex: 1, textAlign: 'right' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#7DE69B', opacity: 0.6, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Ready to Lead</div>
          </div>
          <div style={{ position: 'absolute', top: 8, left: 40, zIndex: 1 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#FFCD00', opacity: 0.6, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Quiet Users</div>
          </div>
          <div style={{ position: 'absolute', bottom: 36, right: 40, zIndex: 1, textAlign: 'right' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#E5554F', opacity: 0.6, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Needs Support</div>
          </div>
          <div style={{ position: 'absolute', bottom: 36, left: 40, zIndex: 1 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#797D80', opacity: 0.6, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Not Engaged</div>
          </div>

          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                type="number" dataKey="x" name="Importance"
                domain={[0.5, 5.5]} ticks={[1, 2, 3, 4, 5]}
                tick={{ fill: '#797D80', fontSize: 11, fontFamily: 'Inter, sans-serif' }}
                tickLine={false} axisLine={false}
                label={{ value: 'Importance to Role →', position: 'insideBottom', offset: -8, fill: '#797D80', fontSize: 11, fontFamily: 'Inter, sans-serif' }}
              />
              <YAxis
                type="number" dataKey="y" name="Confidence"
                domain={[0.5, 5.5]} ticks={[1, 2, 3, 4, 5]}
                tick={{ fill: '#797D80', fontSize: 11, fontFamily: 'Inter, sans-serif' }}
                tickLine={false} axisLine={false}
                label={{ value: 'Confidence →', angle: -90, position: 'insideLeft', offset: 10, fill: '#797D80', fontSize: 11, fontFamily: 'Inter, sans-serif' }}
              />
              <Tooltip content={<ScatterTooltip />} cursor={{ strokeDasharray: '3 3', stroke: 'rgba(125,230,155,0.2)' }} />
              {/* Quadrant dividers */}
              <ReferenceLine x={3} stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" />
              <ReferenceLine y={3} stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" />
              {/* One scatter series per role for color grouping */}
              {scatterByRole.map(([role, dots]) => (
                <Scatter
                  key={role}
                  name={role}
                  data={dots}
                  fill={roleColor(role, allRoles)}
                  opacity={0.85}
                  r={5}
                />
              ))}
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* Role legend */}
        {allRoles.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 16px', marginTop: 12 }}>
            {allRoles.map(role => (
              <div key={role} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: roleColor(role, allRoles), flexShrink: 0 }} />
                <span style={{ fontSize: 11, color: '#b0b8c0', fontFamily: 'Inter, sans-serif' }}>{role}</span>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* ── Role & Function Breakdown ─────────────────────────────────────── */}
      <div>
        {/* Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <p style={{ margin: '0 0 2px', fontSize: 16, fontWeight: 800, color: '#f0f2f4' }}>Team Breakdown</p>
            <p style={{ margin: 0, fontSize: 13, color: '#797D80' }}>Average scores across Confidence, Importance, and Familiarity (scale 1–5)</p>
          </div>
          <div style={{
            display: 'flex',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(125,230,155,0.12)',
            borderRadius: 10,
            padding: 3,
            gap: 2,
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
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 12,
                  fontWeight: 600,
                  transition: 'all 0.2s',
                  background: groupBy === opt ? 'rgba(125,230,155,0.15)' : 'transparent',
                  color: groupBy === opt ? '#7DE69B' : '#797D80',
                }}
              >
                By {opt.charAt(0).toUpperCase() + opt.slice(1)}
              </button>
            ))}
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
