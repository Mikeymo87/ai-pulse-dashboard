import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';

// ─── Wave data ────────────────────────────────────────────────────────────────
// S1 + S2 hardcoded from beating_the_curve.md
// S3 computed live from familiarityTrend (score 5 = Innovators, 4 = Pragmatists, 1–3 = Laggards)

const WAVE_META = [
  { label: 'Survey 1', date: 'Jan–Feb 2025' },
  { label: 'Survey 2', date: 'Aug–Sep 2025' },
  { label: 'Survey 3', date: 'Mar 2026' },
];

// ─── Inverse Gaussian helpers ────────────────────────────────────────────────
// The peak (mu) shifts left as Innovators grow and Laggards shrink.
// Clip-path boundaries and divider lines follow from the per-wave mu.
function invErf(x) {
  const a = 0.147;
  const ln = Math.log(1 - x * x);
  const term = 2 / (Math.PI * a) + ln / 2;
  return Math.sign(x) * Math.sqrt(Math.sqrt(term * term - ln / a) - term);
}

// Maps a cumulative proportion (0–1) → SVG x coordinate given a peak position
function percentToX(p, mu) {
  const clamped = Math.max(0.001, Math.min(0.999, p));
  return mu + SIGMA * Math.SQRT2 * invErf(2 * clamped - 1);
}

// Weighted centroid: Innovators anchor ~100px left, Pragmatists ~300px center,
// Laggards ~500px right — mu drifts left as Innovators grow.
function waveMu(innovPct, pragPct, lagPct) {
  return Math.round((innovPct * 100 + pragPct * 300 + lagPct * 500) / 100);
}

// Returns { mu, div1X, div2X } for a given wave's percentages
function buildConfig(innovPct, pragPct, lagPct) {
  const mu = waveMu(innovPct, pragPct, lagPct);
  return {
    mu,
    div1X: Math.round(Math.max(20, Math.min(580, percentToX(innovPct / 100, mu)))),
    div2X: Math.round(Math.max(80, Math.min(590, percentToX((innovPct + pragPct) / 100, mu)))),
  };
}

// ─── Gaussian bell curve path ─────────────────────────────────────────────────
// mu: center peak x, sigma: spread, H: max height, baseline: y floor
// xMin/xMax: x range to draw (wider than viewport so shift doesn't show edges)
function gaussianPath(mu, sigma, H, baseline, xMin, xMax, steps = 300) {
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const x = xMin + (xMax - xMin) * (i / steps);
    const y = baseline - H * Math.exp(-((x - mu) ** 2) / (2 * sigma ** 2));
    pts.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(2)},${y.toFixed(2)}`);
  }
  pts.push(`L ${xMax},${baseline} L ${xMin},${baseline} Z`);
  return pts.join(' ');
}

// Curve parameters — peak (mu) shifts per wave; SIGMA/H/BASE_Y stay fixed.
// SIGMA=90 means tails reach ~0 within the viewport for all three wave mus
// (S1 mu≈318, S2 mu≈256, S3 mu≈226 — all ≥2.5σ from both edges).
const SIGMA   = 90;
const H       = 218;   // max height in px
const BASE_Y  = 272;   // baseline y
const X_MIN   = -50;   // extend path past left edge for clean clip
const X_MAX   = 650;   // extend path past right edge for clean clip

// ─── S3 computation from familiarityTrend ────────────────────────────────────
function computeS3Segments(familiarityTrend) {
  const s3 = familiarityTrend?.find(s => s.period === 'Mar 2026');
  if (!s3 || !s3.distribution?.length) {
    return { Innovators: 38, Pragmatists: 61, Laggards: 1 }; // fallback
  }
  const total       = s3.distribution.reduce((sum, d) => sum + d.count, 0);
  const innovators  = s3.distribution.filter(d => d.score === 5).reduce((s, d) => s + d.count, 0);
  const pragmatists = s3.distribution.filter(d => d.score === 4).reduce((s, d) => s + d.count, 0);
  const laggards    = s3.distribution.filter(d => d.score <= 3).reduce((s, d) => s + d.count, 0);
  return {
    Innovators:  Math.round((innovators  / total) * 100),
    Pragmatists: Math.round((pragmatists / total) * 100),
    Laggards:    Math.round((laggards    / total) * 100),
  };
}

// ─── Segment metadata (label, color, sublabel from beating_the_curve.md) ─────
const SEGMENTS = [
  {
    key: 'Innovators',
    color: '#7DE69B',
    label: 'AI INNOVATORS',
    sub: ['Highly knowledgeable', 'and use AI regularly'],
    gradId: 'grad-inn',
  },
  {
    key: 'Pragmatists',
    color: '#59BEC9',
    label: 'AI PRAGMATISTS',
    sub: ['Understand AI tools well', 'and have experimented'],
    gradId: 'grad-prag',
  },
  {
    key: 'Laggards',
    color: '#FFCD00',
    label: 'AI LAGGARDS',
    sub: ['Know a bit, heard of,', 'or unfamiliar with AI'],
    gradId: 'grad-lag',
  },
];

// ─── Styles ───────────────────────────────────────────────────────────────────
const FONT = 'Inter, sans-serif';

const waveBtn = (active) => ({
  padding: '7px 16px',
  borderRadius: 20,
  border: active ? '1.5px solid #7DE69B' : '1.5px solid rgba(125,230,155,0.2)',
  background: active ? 'rgba(125,230,155,0.1)' : 'rgba(255,255,255,0.03)',
  color: active ? '#7DE69B' : '#797D80',
  fontSize: 12,
  fontWeight: active ? 700 : 500,
  fontFamily: FONT,
  cursor: 'pointer',
  transition: 'all 0.2s',
  whiteSpace: 'nowrap',
});

// ─── Component ────────────────────────────────────────────────────────────────
export default function AdoptionCurve({ familiarityTrend }) {
  const containerRef  = useRef(null);
  const inView        = useInView(containerRef, { once: true, margin: '-80px' });
  const autoPlayedRef = useRef(false);
  const [wave, setWave]     = useState(0);
  const [hasEntered, setHasEntered] = useState(false);

  // Compute all 3 waves of segment data
  const s3 = computeS3Segments(familiarityTrend);
  const WAVES = [
    { Innovators: 16, Pragmatists: 59, Laggards: 25 },
    { Innovators: 27, Pragmatists: 68, Laggards: 5  },
    s3,
  ];

  // Auto-play on scroll-in (once)
  useEffect(() => {
    if (!inView || autoPlayedRef.current) return;
    autoPlayedRef.current = true;
    setHasEntered(true);
    setWave(0);
    const t1 = setTimeout(() => setWave(1), 1600);
    const t2 = setTimeout(() => setWave(2), 3200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [inView]);

  function handleWave(i) {
    autoPlayedRef.current = true; // stop any pending auto-play
    setWave(i);
  }

  const cfg      = buildConfig(WAVES[wave].Innovators, WAVES[wave].Pragmatists, WAVES[wave].Laggards);
  const bellPath = gaussianPath(cfg.mu, SIGMA, H, BASE_Y, X_MIN, X_MAX);
  const data = WAVES[wave];
  const meta = WAVE_META[wave];

  // Delta vs previous wave (null for S1 — it's the baseline)
  const prev   = wave > 0 ? WAVES[wave - 1] : null;
  const deltas = prev ? {
    Innovators:  data.Innovators  - prev.Innovators,
    Pragmatists: data.Pragmatists - prev.Pragmatists,
    Laggards:    data.Laggards    - prev.Laggards,
  } : null;
  // arrow + absolute % — for Laggards fewer is good (inverted)
  function deltaArrow(n, invert) { return (invert ? n < 0 : n > 0) ? '↑' : '↓'; }
  function deltaColor(n, invert) { return (invert ? n < 0 : n > 0) ? '#7DE69B' : '#E5554F'; }
  function deltaBadge(n, invert) { return `${deltaArrow(n, invert)}${Math.abs(n)}%`; }

  // Label x-center positions — clamped so they stay readable inside the viewbox
  const labInnovX = Math.max(40, cfg.div1X / 2);
  const labPragX  = (cfg.div1X + cfg.div2X) / 2;
  const labLagX   = Math.min(570, (cfg.div2X + 600) / 2);
  // Region widths — used to decide whether to show the name tag (hide when too narrow)
  const innovW = cfg.div1X;
  const lagW   = 600 - cfg.div2X;

  return (
    <div ref={containerRef}>

      {/* ── Section header ─────────────────────────────────────────────────── */}
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <p style={{
          color: '#7DE69B', fontSize: 11, fontWeight: 700,
          letterSpacing: '0.12em', textTransform: 'uppercase',
          margin: '0 0 8px', fontFamily: FONT,
        }}>
          The Technology Adoption Curve
        </p>
        <h3 style={{
          color: '#e0e0e0', fontSize: 'clamp(16px, 2.5vw, 20px)',
          fontWeight: 800, margin: 0, fontFamily: FONT, lineHeight: 1.2,
        }}>
          We're Beating the Curve
        </h3>
        <p style={{ color: '#797D80', fontSize: 13, margin: '6px 0 0', fontFamily: FONT }}>
          Baptist Health MarCom AI adoption — shifting left across 14 months
        </p>
      </div>

      {/* ── Wave buttons ───────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 20, flexWrap: 'wrap' }}>
        {WAVE_META.map((m, i) => (
          <button key={i} style={waveBtn(wave === i)} onClick={() => handleWave(i)}>
            {m.label}
            <span style={{ opacity: 0.6, fontWeight: 400, marginLeft: 6 }}>{m.date}</span>
          </button>
        ))}
      </div>

      {/* ── Bell curve SVG ─────────────────────────────────────────────────── */}
      <div style={{ position: 'relative', width: '100%', overflow: 'hidden' }}>
        <svg
          viewBox="0 0 600 300"
          width="100%"
          style={{ display: 'block', overflow: 'hidden' }}
        >
          <defs>
            {/* ── Vertical gradients — light at peak, saturated mid, fade at base ── */}
            <linearGradient id="grad-inn" x1="0" y1="54" x2="0" y2="272" gradientUnits="userSpaceOnUse">
              <stop offset="0%"   stopColor="#a8f5c0" stopOpacity={0.55} />
              <stop offset="38%"  stopColor="#7DE69B" stopOpacity={0.92} />
              <stop offset="100%" stopColor="#4eaa6a" stopOpacity={0.40} />
            </linearGradient>
            <linearGradient id="grad-prag" x1="0" y1="54" x2="0" y2="272" gradientUnits="userSpaceOnUse">
              <stop offset="0%"   stopColor="#8adde8" stopOpacity={0.55} />
              <stop offset="38%"  stopColor="#59BEC9" stopOpacity={0.90} />
              <stop offset="100%" stopColor="#2d8ea0" stopOpacity={0.40} />
            </linearGradient>
            <linearGradient id="grad-lag" x1="0" y1="54" x2="0" y2="272" gradientUnits="userSpaceOnUse">
              <stop offset="0%"   stopColor="#ffe97a" stopOpacity={0.55} />
              <stop offset="38%"  stopColor="#FFCD00" stopOpacity={0.92} />
              <stop offset="100%" stopColor="#c49a00" stopOpacity={0.40} />
            </linearGradient>

            {/* ── Clip regions — boundaries animate with the wave ── */}
            <clipPath id="ac-clip-inn">
              <motion.rect
                x={0} y={0} height={300}
                animate={{ width: cfg.div1X }}
                transition={{ duration: 0.75, ease: 'easeInOut' }}
              />
            </clipPath>
            <clipPath id="ac-clip-prag">
              <motion.rect
                y={0} height={300}
                animate={{ x: cfg.div1X, width: cfg.div2X - cfg.div1X }}
                transition={{ duration: 0.75, ease: 'easeInOut' }}
              />
            </clipPath>
            <clipPath id="ac-clip-lag">
              <motion.rect
                y={0} height={300} width={600}
                animate={{ x: cfg.div2X }}
                transition={{ duration: 0.75, ease: 'easeInOut' }}
              />
            </clipPath>
          </defs>

          {/* Subtle grid baseline */}
          <line x1={0} y1={BASE_Y} x2={600} y2={BASE_Y} stroke="rgba(125,230,155,0.08)" strokeWidth={1} />

          {/* ── Curve group — peak shifts left wave-to-wave via animated path ── */}
          <g>
            {/* Innovators fill — mint gradient */}
            <motion.path animate={{ d: bellPath }} transition={{ duration: 0.75, ease: 'easeInOut' }}
              fill="url(#grad-inn)" clipPath="url(#ac-clip-inn)" />
            {/* Pragmatists fill — turquoise gradient */}
            <motion.path animate={{ d: bellPath }} transition={{ duration: 0.75, ease: 'easeInOut' }}
              fill="url(#grad-prag)" clipPath="url(#ac-clip-prag)" />
            {/* Laggards fill — yellow gradient */}
            <motion.path animate={{ d: bellPath }} transition={{ duration: 0.75, ease: 'easeInOut' }}
              fill="url(#grad-lag)" clipPath="url(#ac-clip-lag)" />
            {/* Curve outline */}
            <motion.path animate={{ d: bellPath }} transition={{ duration: 0.75, ease: 'easeInOut' }}
              fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth={1.5} />
          </g>

          {/* ── Divider lines ─────────────────────────────────────────────── */}
          <motion.line
            x1={cfg.div1X} x2={cfg.div1X} y1={50} y2={BASE_Y}
            stroke="rgba(255,255,255,0.25)" strokeWidth={1.5} strokeDasharray="4 3"
            animate={{ x1: cfg.div1X, x2: cfg.div1X }}
            transition={{ duration: 0.75, ease: 'easeInOut' }}
          />
          <motion.line
            x1={cfg.div2X} x2={cfg.div2X} y1={50} y2={BASE_Y}
            stroke="rgba(255,255,255,0.25)" strokeWidth={1.5} strokeDasharray="4 3"
            animate={{ x1: cfg.div2X, x2: cfg.div2X }}
            transition={{ duration: 0.75, ease: 'easeInOut' }}
          />

          {/* ── Segment labels: light narrow pill, % + delta centered under header ── */}

          {/* Innovators */}
          <motion.g animate={{ x: labInnovX }} transition={{ duration: 0.75, ease: 'easeInOut' }}>
            <AnimatePresence mode="wait">
              <motion.g key={`inn-${wave}`}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <rect x={-55} y={innovW > 100 ? 140 : innovW > 60 ? 143 : 158}
                  width={110}
                  height={innovW > 100 ? 65 : innovW > 60 ? 38 : 24}
                  rx={9} fill="rgba(20,24,26,0.42)" />
                {innovW > 60 && (
                  <text x={0} y={152} textAnchor="middle"
                    fill={SEGMENTS[0].color} fontSize={8} fontWeight={800} fontFamily={FONT}
                    letterSpacing="0.1em">
                    {SEGMENTS[0].label}
                  </text>
                )}
                <text x={0} y={172} textAnchor="middle"
                  fill="rgba(255,255,255,0.97)" fontSize={24} fontWeight={900} fontFamily={FONT}>
                  {data.Innovators}%
                </text>
                {deltas && (
                  <text x={22} y={163} textAnchor="start"
                    fill={deltaColor(deltas.Innovators, false)} fontSize={9.5} fontWeight={800} fontFamily={FONT}>
                    {deltaBadge(deltas.Innovators, false)}
                  </text>
                )}
                {innovW > 100 && (
                  <>
                    <text x={0} y={186} textAnchor="middle"
                      fill="rgba(255,255,255,0.65)" fontSize={7.5} fontFamily={FONT}>
                      {SEGMENTS[0].sub[0]}
                    </text>
                    <text x={0} y={197} textAnchor="middle"
                      fill="rgba(255,255,255,0.65)" fontSize={7.5} fontFamily={FONT}>
                      {SEGMENTS[0].sub[1]}
                    </text>
                  </>
                )}
              </motion.g>
            </AnimatePresence>
          </motion.g>

          {/* Pragmatists */}
          <motion.g animate={{ x: labPragX }} transition={{ duration: 0.75, ease: 'easeInOut' }}>
            <AnimatePresence mode="wait">
              <motion.g key={`prag-${wave}`}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <rect x={-55} y={140} width={110} height={65} rx={9} fill="rgba(20,24,26,0.42)" />
                <text x={0} y={152} textAnchor="middle"
                  fill={SEGMENTS[1].color} fontSize={8} fontWeight={800} fontFamily={FONT}
                  letterSpacing="0.1em">
                  {SEGMENTS[1].label}
                </text>
                <text x={0} y={172} textAnchor="middle"
                  fill="rgba(255,255,255,0.97)" fontSize={24} fontWeight={900} fontFamily={FONT}>
                  {data.Pragmatists}%
                </text>
                {deltas && (
                  <text x={22} y={163} textAnchor="start"
                    fill={deltaColor(deltas.Pragmatists, false)} fontSize={9.5} fontWeight={800} fontFamily={FONT}>
                    {deltaBadge(deltas.Pragmatists, false)}
                  </text>
                )}
                <text x={0} y={186} textAnchor="middle"
                  fill="rgba(255,255,255,0.65)" fontSize={7.5} fontFamily={FONT}>
                  {SEGMENTS[1].sub[0]}
                </text>
                <text x={0} y={197} textAnchor="middle"
                  fill="rgba(255,255,255,0.65)" fontSize={7.5} fontFamily={FONT}>
                  {SEGMENTS[1].sub[1]}
                </text>
              </motion.g>
            </AnimatePresence>
          </motion.g>

          {/* Laggards */}
          <motion.g animate={{ x: labLagX }} transition={{ duration: 0.75, ease: 'easeInOut' }}>
            <AnimatePresence mode="wait">
              <motion.g key={`lag-${wave}`}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <rect x={-55} y={lagW > 100 ? 140 : lagW > 60 ? 143 : 158}
                  width={110}
                  height={lagW > 100 ? 65 : lagW > 60 ? 38 : 24}
                  rx={9} fill="rgba(20,24,26,0.42)" />
                {lagW > 60 && (
                  <text x={0} y={152} textAnchor="middle"
                    fill={SEGMENTS[2].color} fontSize={8} fontWeight={800} fontFamily={FONT}
                    letterSpacing="0.1em">
                    {SEGMENTS[2].label}
                  </text>
                )}
                <text x={0} y={172} textAnchor="middle"
                  fill="rgba(255,255,255,0.97)" fontSize={24} fontWeight={900} fontFamily={FONT}>
                  {data.Laggards}%
                </text>
                {deltas && (
                  <text x={22} y={163} textAnchor="start"
                    fill={deltaColor(deltas.Laggards, true)} fontSize={9.5} fontWeight={800} fontFamily={FONT}>
                    {deltaBadge(deltas.Laggards, true)}
                  </text>
                )}
                {lagW > 100 && (
                  <>
                    <text x={0} y={186} textAnchor="middle"
                      fill="rgba(255,255,255,0.65)" fontSize={7.5} fontFamily={FONT}>
                      {SEGMENTS[2].sub[0]}
                    </text>
                    <text x={0} y={197} textAnchor="middle"
                      fill="rgba(255,255,255,0.65)" fontSize={7.5} fontFamily={FONT}>
                      {SEGMENTS[2].sub[1]}
                    </text>
                  </>
                )}
              </motion.g>
            </AnimatePresence>
          </motion.g>

          {/* ── X-axis labels ──────────────────────────────────────────────── */}
          <text x={30}  y={290} fill="#797D80" fontSize={9.5} fontFamily={FONT} fontWeight={600}>
            ← More Innovative
          </text>
          <text x={570} y={290} textAnchor="end" fill="#797D80" fontSize={9.5} fontFamily={FONT} fontWeight={600}>
            Less Innovative →
          </text>
        </svg>
      </div>

      {/* ── Slider ─────────────────────────────────────────────────────────── */}
      <div style={{ marginTop: 16, padding: '0 8px' }}>
        <style>{`
          .ac-slider {
            -webkit-appearance: none;
            width: 100%;
            height: 4px;
            border-radius: 2px;
            background: rgba(125,230,155,0.15);
            outline: none;
            cursor: pointer;
          }
          .ac-slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background: #7DE69B;
            box-shadow: 0 0 8px rgba(125,230,155,0.5);
            cursor: pointer;
          }
          .ac-slider::-moz-range-thumb {
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background: #7DE69B;
            border: none;
            box-shadow: 0 0 8px rgba(125,230,155,0.5);
            cursor: pointer;
          }
        `}</style>
        <input
          type="range"
          className="ac-slider"
          min={0}
          max={2}
          step={1}
          value={wave}
          onChange={e => handleWave(Number(e.target.value))}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
          {WAVE_META.map((m, i) => (
            <span key={i} style={{
              fontSize: 9.5,
              color: wave === i ? '#7DE69B' : '#797D80',
              fontFamily: FONT,
              fontWeight: wave === i ? 700 : 400,
              transition: 'color 0.2s',
            }}>
              {m.label}
            </span>
          ))}
        </div>
      </div>

      {/* ── Survey label ───────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.p
          key={wave}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.25 }}
          style={{
            textAlign: 'center', marginTop: 12,
            color: '#e0e0e0', fontSize: 13, fontWeight: 700,
            fontFamily: FONT,
          }}
        >
          {meta.label}
          <span style={{ color: '#797D80', fontWeight: 400, marginLeft: 8 }}>
            {meta.date}
          </span>
        </motion.p>
      </AnimatePresence>

      {/* ── Insight callout ────────────────────────────────────────────────── */}
      <div style={{
        marginTop: 16,
        padding: '9px 12px',
        borderLeft: '3px solid rgba(125,230,155,0.55)',
        background: 'rgba(125,230,155,0.06)',
        borderRadius: '0 8px 8px 0',
      }}>
        <p style={{
          color: 'rgba(224,224,224,0.80)', fontSize: 11, fontStyle: 'italic',
          margin: 0, lineHeight: 1.55, fontFamily: FONT,
        }}>
          <span style={{ color: '#7DE69B', fontWeight: 700, fontStyle: 'normal', marginRight: 4 }}>
            What this tells us:
          </span>
          The team shifted left — faster than most organizations ever do. Innovators grew from 16% → {s3.Innovators}% while Laggards virtually disappeared ({`25% → ${s3.Laggards}%`}). In Survey 3, even the Pragmatist group shrank — not because people fell behind, but because they graduated forward into Innovators. The curve isn't just shifting. It's changing shape.
        </p>
      </div>

    </div>
  );
}
