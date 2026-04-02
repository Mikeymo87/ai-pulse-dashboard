import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

// ─── Adoption segments derived from familiarity scores ────────────────────────
// Innovators  = score 4–5 (Experimented + Expert)
// Pragmatists = score 2–3 (Heard of + Know a bit)
// Laggards    = score 1   (Unfamiliar)

const SEGMENTS = ['Innovators', 'Pragmatists', 'Laggards'];

const SEG_CONFIG = {
  Innovators:  { color: '#7DE69B', textColor: '#0a1a0f' },
  Pragmatists: { color: '#59BEC9', textColor: '#071417' },
  Laggards:    { color: '#E5554F', textColor: '#1a0807' },
};

// ─── Layout constants ─────────────────────────────────────────────────────────
const BANDS_H = 240;
const LABEL_W  = 82;
const COL_W    = 86;
const GAP_W    = 90;

const COL_X = [
  LABEL_W,
  LABEL_W + COL_W + GAP_W,
  LABEL_W + (COL_W + GAP_W) * 2,
];
const VB_W = COL_X[2] + COL_W + 6;
const VB_H = BANDS_H + 50;

const COLUMN_META = [
  { label: 'Survey 1', date: 'Jan–Feb 2025' },
  { label: 'Survey 2', date: 'Aug–Sep 2025' },
  { label: 'Survey 3', date: 'Mar 2026' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function computeSegments(survey) {
  const dist = survey.distribution;
  const total = dist.reduce((s, d) => s + d.count, 0);
  if (!total) return { Innovators: 0, Pragmatists: 0, Laggards: 0 };

  const innovators  = dist.filter(d => d.score >= 4).reduce((s, d) => s + d.count, 0);
  const pragmatists = dist.filter(d => d.score >= 2 && d.score <= 3).reduce((s, d) => s + d.count, 0);
  const laggards    = dist.filter(d => d.score === 1).reduce((s, d) => s + d.count, 0);

  return {
    Innovators:  Math.round((innovators  / total) * 100),
    Pragmatists: Math.round((pragmatists / total) * 100),
    Laggards:    Math.round((laggards    / total) * 100),
  };
}

function buildStack(segPcts) {
  let y = 0;
  return SEGMENTS.map(seg => {
    const pct = segPcts[seg] ?? 0;
    const h   = (pct / 100) * BANDS_H;
    const band = { seg, y, h, pct };
    y += h;
    return band;
  });
}

function makeConnectors(leftStack, rightStack, leftColX, rightColX) {
  const lx = leftColX + COL_W;
  const rx = rightColX;
  const midX = (lx + rx) / 2;

  return SEGMENTS.map(seg => {
    const l = leftStack.find(b => b.seg === seg);
    const r = rightStack.find(b => b.seg === seg);
    if (!l || !r || (l.h < 1 && r.h < 1)) return null;

    const path = [
      `M ${lx},${l.y}`,
      `C ${midX},${l.y} ${midX},${r.y} ${rx},${r.y}`,
      `L ${rx},${r.y + r.h}`,
      `C ${midX},${r.y + r.h} ${midX},${l.y + l.h} ${lx},${l.y + l.h}`,
      'Z',
    ].join(' ');

    return { seg, path, color: SEG_CONFIG[seg].color };
  }).filter(Boolean);
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function StageFlow({ familiarityTrend }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  const surveySegments = familiarityTrend.map(computeSegments);
  const stacks = surveySegments.map(buildStack);

  const connectors1 = makeConnectors(stacks[0], stacks[1], COL_X[0], COL_X[1]);
  const connectors2 = makeConnectors(stacks[1], stacks[2], COL_X[1], COL_X[2]);

  const s1Inn  = surveySegments[0]?.Innovators  ?? 0;
  const s3Inn  = surveySegments[2]?.Innovators  ?? 0;
  const s1Lag  = surveySegments[0]?.Laggards    ?? 0;
  const s3Lag  = surveySegments[2]?.Laggards    ?? 0;
  const s2Prag = surveySegments[1]?.Pragmatists ?? 0;
  const s3Prag = surveySegments[2]?.Pragmatists ?? 0;
  const pragDelta = s3Prag - s2Prag;

  return (
    <div ref={ref}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
        style={{ textAlign: 'center', marginBottom: 24 }}
      >
        <p style={{
          color: '#7DE69B', fontSize: 11, fontWeight: 700,
          letterSpacing: '0.12em', textTransform: 'uppercase',
          margin: '0 0 8px', fontFamily: 'DM Sans, sans-serif',
        }}>
          Adoption Migration · 14 Months
        </p>
        <h3 style={{
          color: '#e0e0e0', fontSize: 'clamp(16px, 2.5vw, 20px)',
          fontWeight: 800, margin: 0, fontFamily: 'DM Sans, sans-serif', lineHeight: 1.2,
        }}>
          Innovators grew from {s1Inn}% → {s3Inn}%
        </h3>
        <p style={{
          color: '#797D80', fontSize: 13, margin: '6px 0 0',
          fontFamily: 'DM Sans, sans-serif', fontWeight: 400,
        }}>
          The team shifted left — Survey 1 through Survey 3
        </p>
      </motion.div>

      {/* ── SVG Alluvial ───────────────────────────────────────────────────── */}
      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        width="100%"
        style={{ overflow: 'visible', display: 'block' }}
      >
        {/* Stage name labels — left of first column */}
        {stacks[0].map(({ seg, y, h }) =>
          h > 8 ? (
            <motion.text
              key={`lbl-${seg}`}
              x={LABEL_W - 8}
              y={y + h / 2}
              textAnchor="end"
              dominantBaseline="middle"
              fill={SEG_CONFIG[seg].color}
              fontSize={10}
              fontWeight={700}
              fontFamily="DM Sans, sans-serif"
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
            >
              {seg}
            </motion.text>
          ) : null
        )}

        {/* Bezier connector fills — S1 → S2 */}
        {connectors1.map(({ seg, path, color }) => (
          <motion.path
            key={`c1-${seg}`}
            d={path}
            fill={color}
            initial={{ fillOpacity: 0 }}
            animate={inView ? { fillOpacity: 0.18 } : { fillOpacity: 0 }}
            transition={{ duration: 0.7, delay: 0.8 }}
          />
        ))}

        {/* Bezier connector fills — S2 → S3 */}
        {connectors2.map(({ seg, path, color }) => (
          <motion.path
            key={`c2-${seg}`}
            d={path}
            fill={color}
            initial={{ fillOpacity: 0 }}
            animate={inView ? { fillOpacity: 0.18 } : { fillOpacity: 0 }}
            transition={{ duration: 0.7, delay: 0.95 }}
          />
        ))}

        {/* Column bands */}
        {stacks.map((stack, colIdx) =>
          stack.map(({ seg, y, h, pct }, bandIdx) => (
            <g key={`${colIdx}-${seg}`}>
              <motion.rect
                x={COL_X[colIdx]}
                y={y}
                width={COL_W}
                rx={4}
                fill={SEG_CONFIG[seg].color}
                initial={{ height: 0 }}
                animate={inView ? { height: h } : { height: 0 }}
                transition={{ duration: 0.6, delay: bandIdx * 0.08, ease: 'easeOut' }}
              />
              {h > 18 && (
                <motion.text
                  x={COL_X[colIdx] + COL_W / 2}
                  y={y + h / 2}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={SEG_CONFIG[seg].textColor}
                  fontSize={11}
                  fontWeight={800}
                  fontFamily="DM Sans, sans-serif"
                  initial={{ opacity: 0 }}
                  animate={inView ? { opacity: 1 } : { opacity: 0 }}
                  transition={{ duration: 0.3, delay: 0.6 + bandIdx * 0.08 }}
                >
                  {pct}%
                </motion.text>
              )}
            </g>
          ))
        )}

        {/* Column labels (Survey N + date) below bands */}
        {COLUMN_META.map(({ label, date }, i) => (
          <g key={`col-lbl-${i}`}>
            <text
              x={COL_X[i] + COL_W / 2}
              y={BANDS_H + 22}
              textAnchor="middle"
              fill="#e0e0e0"
              fontSize={11}
              fontWeight={700}
              fontFamily="DM Sans, sans-serif"
            >
              {label}
            </text>
            <text
              x={COL_X[i] + COL_W / 2}
              y={BANDS_H + 36}
              textAnchor="middle"
              fill="#797D80"
              fontSize={9.5}
              fontFamily="DM Sans, sans-serif"
            >
              ({date})
            </text>
          </g>
        ))}
      </svg>

      {/* ── Legend ─────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 20, justifyContent: 'center', marginTop: 12 }}>
        {SEGMENTS.map(seg => (
          <div key={seg} style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'DM Sans, sans-serif' }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: SEG_CONFIG[seg].color, flexShrink: 0 }} />
            <span style={{ color: '#797D80', fontSize: 10, fontWeight: 500 }}>{seg}</span>
          </div>
        ))}
      </div>

      {/* ── Hidden story callout ────────────────────────────────────────────── */}
      <div style={{
        marginTop: 16,
        padding: '9px 12px',
        borderLeft: '3px solid rgba(125,230,155,0.55)',
        background: 'rgba(125,230,155,0.06)',
        borderRadius: '0 8px 8px 0',
      }}>
        <p style={{
          color: 'rgba(224,224,224,0.80)', fontSize: 11, fontStyle: 'italic',
          margin: 0, lineHeight: 1.55, fontFamily: 'DM Sans, sans-serif',
        }}>
          <span style={{ color: '#7DE69B', fontWeight: 700, fontStyle: 'normal', marginRight: 4 }}>
            What this tells us:
          </span>
          Innovators nearly tripled from {s1Inn}% to {s3Inn}%. Laggards dropped from {s1Lag}% to {s3Lag}%.
          {pragDelta < 0
            ? ` The Pragmatist group also shrank (${s2Prag}% → ${s3Prag}%) — not because people fell back, but because they graduated forward into Innovators. The curve isn't just shifting. It's changing shape.`
            : ` The team's entire center of gravity has moved left across all three surveys.`}
        </p>
      </div>

    </div>
  );
}
