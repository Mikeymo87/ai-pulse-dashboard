import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';

// ─── Role colors (same palette as DeepDive) ───────────────────────────────────
const ROLE_PALETTE = [
  '#7DE69B', '#59BEC9', '#FFCD00', '#2EA84A',
  '#b388ff', '#80deea', '#ffab40', '#f48fb1',
  '#a5d6a7', '#90caf9',
];
function roleColor(role, roleList) {
  const idx = roleList.indexOf(role);
  return ROLE_PALETTE[idx % ROLE_PALETTE.length] ?? '#797D80';
}

// ─── Deterministic jitter ──────────────────────────────────────────────────────
function jitter(i, axis) {
  const seed = axis === 'x' ? i * 13 + 7 : i * 19 + 3;
  return ((seed % 21) - 10) / 10 * 0.22;
}

// ─── Custom tooltip ───────────────────────────────────────────────────────────
function ScatterTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  return (
    <div style={{
      background: '#1e2425',
      border: '1px solid rgba(125,230,155,0.2)',
      borderRadius: 8,
      padding: '8px 12px',
      fontFamily: 'DM Sans, sans-serif',
      fontSize: 11,
      color: '#e0e0e0',
      lineHeight: 1.6,
    }}>
      {d.role && <div style={{ fontWeight: 700, color: d.color, marginBottom: 3 }}>{d.role}</div>}
      <div>Importance: <strong>{d.rawX}</strong> / 5</div>
      <div>Confidence: <strong>{d.rawY}</strong> / 5</div>
    </div>
  );
}

// ─── Quadrant label ───────────────────────────────────────────────────────────
function QuadLabel({ style, text, color }) {
  return (
    <div style={{
      position: 'absolute',
      fontSize: 9,
      fontWeight: 700,
      letterSpacing: '0.1em',
      color,
      textTransform: 'uppercase',
      opacity: 0.5,
      fontFamily: 'DM Sans, sans-serif',
      pointerEvents: 'none',
      lineHeight: 1.3,
      textAlign: 'center',
      ...style,
    }}>
      {text}
    </div>
  );
}

const axisStyle = { fill: '#797D80', fontSize: 10, fontFamily: 'DM Sans, sans-serif' };
const gridStyle = { stroke: 'rgba(125,230,155,0.07)', strokeDasharray: '3 3' };

export default function SlideTeam({ surveys, transforms }) {
  const s3Rows = surveys?.survey3 ?? [];

  const allRoles = useMemo(() => {
    return [...new Set(s3Rows.map(r => r.role).filter(Boolean))].sort();
  }, [s3Rows]);

  const scatterData = useMemo(() =>
    s3Rows
      .filter(r => r.confidence !== null && r.importance !== null)
      .map((r, i) => ({
        x:     r.importance + jitter(i, 'x'),
        y:     r.confidence + jitter(i, 'y'),
        rawX:  r.importance,
        rawY:  r.confidence,
        role:  r.role ?? 'Unknown',
        color: r.role ? roleColor(r.role, allRoles) : '#797D80',
      })),
  [s3Rows, allRoles]);

  const scatterByRole = useMemo(() => {
    const map = {};
    for (const d of scatterData) {
      if (!map[d.role]) map[d.role] = [];
      map[d.role].push(d);
    }
    return Object.entries(map);
  }, [scatterData]);

  // Quadrant insight
  const readyToLead = scatterData.filter(d => d.rawX >= 3 && d.rawY >= 3).length;
  const readyPct    = scatterData.length > 0 ? Math.round((readyToLead / scatterData.length) * 100) : 0;

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      padding: '28px 40px 24px',
      boxSizing: 'border-box',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        style={{ marginBottom: 16, flexShrink: 0 }}
      >
        <div style={{
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          fontSize: 10,
          color: '#7DE69B',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          marginBottom: 4,
        }}>
          Team Readiness · Survey 3
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
          <h2 style={{
            fontFamily: 'DM Sans, sans-serif',
            fontSize: 24,
            fontWeight: 800,
            color: '#ffffff',
            letterSpacing: '-0.02em',
            margin: 0,
          }}>
            Confidence × Importance
          </h2>
          <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#797D80' }}>
            {scatterData.length} respondents · colored by role
          </span>
        </div>
      </motion.div>

      {/* 2-column */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        style={{
          flex: 1,
          display: 'flex',
          gap: 28,
          minHeight: 0,
          overflow: 'hidden',
        }}
      >
        {/* Left — scatter plot */}
        <div style={{ flex: '0 0 65%', position: 'relative', overflow: 'hidden' }}>
          {/* Quadrant labels */}
          <QuadLabel style={{ top: 4, right: 32 }}  text={'Ready to Lead'}  color="#7DE69B" />
          <QuadLabel style={{ top: 4, left: 60 }}   text={'Quiet Users'}    color="#59BEC9" />
          <QuadLabel style={{ bottom: 50, right: 32 }} text={'Needs Support'} color="#FFCD00" />
          <QuadLabel style={{ bottom: 50, left: 60 }} text={'Not Engaged'}   color="#797D80" />

          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 10, right: 16, bottom: 20, left: -10 }}>
              <CartesianGrid {...gridStyle} />
              <XAxis
                type="number" dataKey="x"
                name="Importance" domain={[0.5, 5.5]}
                tick={axisStyle} tickLine={false} axisLine={false}
                label={{ value: 'Importance to Role →', position: 'insideBottom', offset: -12, fill: '#797D80', fontSize: 10, fontFamily: 'DM Sans' }}
              />
              <YAxis
                type="number" dataKey="y"
                name="Confidence" domain={[0.5, 5.5]}
                tick={axisStyle} tickLine={false} axisLine={false}
                label={{ value: 'Confidence →', angle: -90, position: 'insideLeft', offset: 16, fill: '#797D80', fontSize: 10, fontFamily: 'DM Sans' }}
              />
              <ReferenceLine x={3} stroke="rgba(125,230,155,0.12)" strokeDasharray="4 4" />
              <ReferenceLine y={3} stroke="rgba(125,230,155,0.12)" strokeDasharray="4 4" />
              <Tooltip content={<ScatterTooltip />} />
              {scatterByRole.map(([role, points]) => (
                <Scatter
                  key={role}
                  name={role}
                  data={points}
                  fill={roleColor(role, allRoles)}
                  opacity={0.85}
                  r={5}
                />
              ))}
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* Right — legend + insight */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          overflow: 'hidden',
          minWidth: 0,
        }}>
          {/* Key insight callout */}
          <div style={{
            background: 'rgba(125,230,155,0.06)',
            border: '1px solid rgba(125,230,155,0.15)',
            borderRadius: 12,
            padding: '14px 16px',
            flexShrink: 0,
          }}>
            <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 28, fontWeight: 900, color: '#7DE69B', lineHeight: 1 }}>
              {readyPct}%
            </div>
            <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: '#797D80', marginTop: 4 }}>
              of respondents are in the "Ready to Lead" quadrant (Importance ≥ 3 + Confidence ≥ 3)
            </div>
          </div>

          {/* Role legend */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
          }}>
            <div style={{
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              fontSize: 9,
              color: '#797D80',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: 4,
              flexShrink: 0,
            }}>
              Roles
            </div>
            {scatterByRole.map(([role, points]) => (
              <div key={role} style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                <div style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: roleColor(role, allRoles),
                  flexShrink: 0,
                }} />
                <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: '#c0c8d0', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {role}
                </span>
                <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 10, color: '#797D80', flexShrink: 0 }}>
                  n={points.length}
                </span>
              </div>
            ))}
          </div>

          {/* Quadrant key */}
          <div style={{
            borderTop: '1px solid rgba(125,230,155,0.08)',
            paddingTop: 12,
            flexShrink: 0,
          }}>
            <div style={{
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              fontSize: 9,
              color: '#797D80',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: 8,
            }}>
              Quadrant Key
            </div>
            {[
              { label: 'Ready to Lead',  desc: 'High importance + confidence', color: '#7DE69B' },
              { label: 'Quiet Users',    desc: 'Confident but less invested',   color: '#59BEC9' },
              { label: 'Needs Support',  desc: 'Invested but not yet confident',color: '#FFCD00' },
              { label: 'Not Engaged',    desc: 'Low importance + confidence',   color: '#797D80' },
            ].map(q => (
              <div key={q.label} style={{ display: 'flex', gap: 7, marginBottom: 6 }}>
                <div style={{ width: 7, height: 7, borderRadius: 2, background: q.color, marginTop: 2, flexShrink: 0 }} />
                <div>
                  <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 10, fontWeight: 700, color: q.color }}>{q.label}</span>
                  <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 10, color: '#797D80' }}> — {q.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
