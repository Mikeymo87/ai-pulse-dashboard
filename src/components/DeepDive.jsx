import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';

// ─── Tool category detection ─────────────────────────────────────────────────
const TOOL_CATEGORIES = {
  'Microsoft':    { color: '#59BEC9', keywords: ['copilot', 'microsoft', 'bing', 'azure'] },
  'Google':       { color: '#7DE69B', keywords: ['gemini', 'google', 'notebooklm', 'bard'] },
  'OpenAI':       { color: '#2EA84A', keywords: ['chatgpt', 'openai', 'dall-e', 'dall·e', 'sora'] },
  'Anthropic':    { color: '#b388ff', keywords: ['claude', 'anthropic'] },
  'Adobe':        { color: '#ffab40', keywords: ['adobe', 'firefly'] },
  'Image/Video':  { color: '#f48fb1', keywords: ['midjourney', 'stable diffusion', 'ideogram', 'runway', 'heygen', 'synthesia', 'invideo', 'luma'] },
  'Writing AI':   { color: '#FFCD00', keywords: ['grammarly', 'jasper', 'copy.ai', 'writesonic', 'rytr', 'wordtune'] },
  'Research AI':  { color: '#80deea', keywords: ['perplexity', 'you.com', 'consensus', 'elicit', 'answerthepublic'] },
};

function getToolCategory(name) {
  const n = name.toLowerCase();
  for (const [cat, { keywords }] of Object.entries(TOOL_CATEGORIES)) {
    if (keywords.some(k => n.includes(k))) return cat;
  }
  return 'Other';
}
function getToolColor(name) {
  const cat = getToolCategory(name);
  return TOOL_CATEGORIES[cat]?.color ?? '#797D80';
}

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
      fontFamily: 'DM Sans, sans-serif',
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
          fontFamily: 'DM Sans, sans-serif',
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

// ─── Tool bubble chart ────────────────────────────────────────────────────────
function ToolBubbles({ tools, totalN }) {
  const [hovered, setHovered] = useState(null);
  const max = tools[0]?.count || 1;
  const MIN_SIZE = 52;
  const MAX_SIZE = 128;

  return (
    <div>
      {/* Bubble field */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 12,
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 0 16px',
        minHeight: 180,
      }}>
        {tools.map((tool, i) => {
          const size = Math.round(MIN_SIZE + ((tool.count / max) * (MAX_SIZE - MIN_SIZE)));
          const color = getToolColor(tool.label);
          const isHovered = hovered === tool.label;
          const pct = totalN ? Math.round((tool.count / totalN) * 100) : tool.pct;
          const showLabel = size >= 72;
          return (
            <motion.div
              key={tool.label}
              initial={{ opacity: 0, scale: 0.6 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.04 }}
              onMouseEnter={() => setHovered(tool.label)}
              onMouseLeave={() => setHovered(null)}
              style={{
                position: 'relative',
                width: size,
                height: size,
                borderRadius: '50%',
                background: isHovered ? `${color}30` : `${color}18`,
                border: `2px solid ${color}${isHovered ? 'cc' : '55'}`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'default',
                transition: 'background 0.2s, border-color 0.2s',
                flexShrink: 0,
              }}
            >
              {showLabel ? (
                <>
                  <span style={{
                    fontFamily: 'DM Sans, sans-serif',
                    fontSize: Math.max(9, Math.min(12, size / 9)),
                    fontWeight: 700,
                    color,
                    textAlign: 'center',
                    lineHeight: 1.2,
                    padding: '0 6px',
                    wordBreak: 'break-word',
                  }}>
                    {tool.label}
                  </span>
                  <span style={{
                    fontFamily: 'DM Sans, sans-serif',
                    fontSize: Math.max(9, Math.min(11, size / 10)),
                    fontWeight: 500,
                    color: '#797D80',
                    marginTop: 2,
                  }}>
                    {pct}%
                  </span>
                </>
              ) : (
                <span style={{
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize: 9,
                  fontWeight: 700,
                  color,
                  textAlign: 'center',
                  padding: '0 4px',
                  lineHeight: 1.2,
                  wordBreak: 'break-word',
                }}>
                  {tool.label.split(' ')[0]}
                </span>
              )}

              {/* Hover tooltip */}
              {isHovered && (
                <div style={{
                  position: 'absolute',
                  bottom: size / 2 + 12,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: '#1e2425',
                  border: `1px solid ${color}40`,
                  borderRadius: 8,
                  padding: '8px 12px',
                  whiteSpace: 'nowrap',
                  zIndex: 10,
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize: 12,
                  pointerEvents: 'none',
                }}>
                  <div style={{ fontWeight: 700, color, marginBottom: 2 }}>{tool.label}</div>
                  <div style={{ color: '#b0b8c0' }}>{tool.count} respondents · {pct}%</div>
                  <div style={{ color: '#797D80', fontSize: 10, marginTop: 2 }}>{getToolCategory(tool.label)}</div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Category legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 16px', marginTop: 8, justifyContent: 'center' }}>
        {[...new Set(tools.map(t => getToolCategory(t.label)))].map(cat => (
          <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: TOOL_CATEGORIES[cat]?.color ?? '#797D80', flexShrink: 0 }} />
            <span style={{ fontSize: 10, color: '#797D80', fontFamily: 'DM Sans, sans-serif' }}>{cat}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function DeepDive({ surveys, transforms }) {
  const [groupBy, setGroupBy] = useState('role');
  const [toolSurvey, setToolSurvey] = useState('s3');

  const s3Rows = surveys?.survey3 ?? [];
  const { byRole, byFunction, toolsS2, toolsS3 } = transforms;

  // ── Tool data ─────────────────────────────────────────────────────────────
  // S2: all tools used (structured multi-select, n=106)
  // S3: personal/non-endorsed tools only (free-text, n=89) — filter count >= 2
  const s2Tools = (toolsS2 ?? []).filter(t => t.count >= 2).slice(0, 20);
  const s3Tools = (toolsS3 ?? []).filter(t => t.count >= 2).slice(0, 20);
  const activeTools = toolSurvey === 's2' ? s2Tools : s3Tools;
  const activeN = toolSurvey === 's2' ? 106 : 89;

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
        padding: '96px 32px 80px',
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
        style={{ marginBottom: 56, textAlign: 'center' }}
      >
        <span style={{
          display: 'inline-block',
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.13em',
          color: '#7DE69B',
          textTransform: 'uppercase',
          marginBottom: 12,
        }}>
          Survey 3 Deep Dive
        </span>
        <h2 style={{
          margin: '0 0 16px',
          fontSize: 'clamp(30px, 4vw, 44px)',
          fontWeight: 800,
          color: '#f0f2f4',
          lineHeight: 1.1,
          letterSpacing: '-0.025em',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}>
          Who's Ready, Who Needs Support
        </h2>
        <p style={{
          margin: 0,
          fontSize: 16,
          color: '#797D80',
          maxWidth: 560,
          marginInline: 'auto',
          lineHeight: 1.65,
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
          padding: '32px 36px 28px',
          marginBottom: 48,
        }}
      >
        <p style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 800, color: '#f0f2f4', letterSpacing: '0.01em' }}>
          Confidence vs. Importance
        </p>
        <p style={{ margin: '0 0 24px', fontSize: 15, color: '#797D80', lineHeight: 1.6 }}>
          Each dot = one Survey 3 respondent. X = how important AI is to their role; Y = how confident they feel using it.
        </p>

        {/* Quadrant labels overlay */}
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', top: 8, right: 40, zIndex: 1, textAlign: 'right' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#7DE69B', opacity: 0.6, letterSpacing: '0.07em', textTransform: 'uppercase' }}>Ready to Lead</div>
          </div>
          <div style={{ position: 'absolute', top: 8, left: 40, zIndex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#FFCD00', opacity: 0.6, letterSpacing: '0.07em', textTransform: 'uppercase' }}>Quiet Users</div>
          </div>
          <div style={{ position: 'absolute', bottom: 36, right: 40, zIndex: 1, textAlign: 'right' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#E5554F', opacity: 0.6, letterSpacing: '0.07em', textTransform: 'uppercase' }}>Needs Support</div>
          </div>
          <div style={{ position: 'absolute', bottom: 36, left: 40, zIndex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#797D80', opacity: 0.6, letterSpacing: '0.07em', textTransform: 'uppercase' }}>Not Engaged</div>
          </div>

          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                type="number" dataKey="x" name="Importance"
                domain={[0.5, 5.5]} ticks={[1, 2, 3, 4, 5]}
                tick={{ fill: '#797D80', fontSize: 11, fontFamily: 'DM Sans, sans-serif' }}
                tickLine={false} axisLine={false}
                label={{ value: 'Importance to Role →', position: 'insideBottom', offset: -8, fill: '#797D80', fontSize: 11, fontFamily: 'DM Sans, sans-serif' }}
              />
              <YAxis
                type="number" dataKey="y" name="Confidence"
                domain={[0.5, 5.5]} ticks={[1, 2, 3, 4, 5]}
                tick={{ fill: '#797D80', fontSize: 11, fontFamily: 'DM Sans, sans-serif' }}
                tickLine={false} axisLine={false}
                label={{ value: 'Confidence →', angle: -90, position: 'insideLeft', offset: 10, fill: '#797D80', fontSize: 11, fontFamily: 'DM Sans, sans-serif' }}
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
                <span style={{ fontSize: 11, color: '#b0b8c0', fontFamily: 'DM Sans, sans-serif' }}>{role}</span>
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
            <p style={{ margin: '0 0 2px', fontSize: 16, fontWeight: 800, color: '#f0f2f4', letterSpacing: '0.01em' }}>Team Breakdown</p>
            <p style={{ margin: 0, fontSize: 15, color: '#797D80', lineHeight: 1.5 }}>Average scores across Confidence, Importance, and Familiarity (scale 1–5)</p>
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
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: '0.03em',
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

      {/* ── Tool Ecosystem ────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        style={{ marginTop: 48 }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
          <div>
            <p style={{ margin: '0 0 2px', fontSize: 16, fontWeight: 800, color: '#f0f2f4', letterSpacing: '0.01em' }}>
              What Tools Are They Using?
            </p>
            <p style={{ margin: 0, fontSize: 15, color: '#797D80', lineHeight: 1.5 }}>
              {toolSurvey === 's2'
                ? 'Survey 2 — all AI tools used at work (structured list, 106 respondents)'
                : 'Survey 3 — personal & non-endorsed tools only (free-text, 89 respondents)'}
            </p>
          </div>
          <div style={{
            display: 'flex',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(125,230,155,0.12)',
            borderRadius: 10,
            padding: 3,
            gap: 2,
          }}>
            {[{ key: 's2', label: 'Survey 2' }, { key: 's3', label: 'Survey 3' }].map(opt => (
              <button
                key={opt.key}
                onClick={() => setToolSurvey(opt.key)}
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
                  background: toolSurvey === opt.key ? 'rgba(125,230,155,0.15)' : 'transparent',
                  color: toolSurvey === opt.key ? '#7DE69B' : '#797D80',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{
          background: 'rgba(29,77,82,0.35)',
          border: '1px solid rgba(125,230,155,0.15)',
          borderRadius: 16,
          padding: '20px 24px 24px',
        }}>
          {activeTools.length > 0
            ? <ToolBubbles tools={activeTools} totalN={activeN} />
            : <p style={{ textAlign: 'center', color: '#797D80', fontFamily: 'DM Sans, sans-serif', fontSize: 15, padding: '32px 0', lineHeight: 1.6 }}>No tool data available for this survey.</p>
          }
        </div>
      </motion.div>
    </section>
  );
}
