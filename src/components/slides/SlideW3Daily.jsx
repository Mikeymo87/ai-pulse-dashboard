import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, LabelList, ResponsiveContainer, Tooltip } from 'recharts';

const MONO = "'JetBrains Mono', 'Fira Code', monospace";
const SANS = "'Plus Jakarta Sans', DM Sans, sans-serif";

function getFreqData(frequencyTrend) {
  return (frequencyTrend ?? []).map((wave, i) => {
    const dist = wave.distribution ?? [];
    const get = (label) => Math.round(dist.find(d => d.label === label)?.pct ?? 0);
    return {
      name: `Wave ${i + 1}`,
      'Never / rarely': get('Never') + get('Rarely'),
      'Monthly': get('Monthly'),
      'Weekly': get('Weekly'),
      'Daily': get('Daily'),
    };
  });
}

function getDailyPct(frequencyTrend) {
  return Math.round(frequencyTrend?.[2]?.distribution?.find(d => d.label === 'Daily')?.pct ?? 90);
}

const axisStyle = { fill: 'var(--text-medium)', fontSize: 13, fontFamily: 'DM Sans, sans-serif' };
const FREQ_COLORS = { 'Never / rarely': '#E5554F', 'Monthly': '#FFCD00', 'Weekly': '#59BEC9', 'Daily': '#1a4a5e' };

export default function SlideW3Daily({ transforms }) {
  const chartData = getFreqData(transforms?.frequencyTrend);
  const dailyPct = getDailyPct(transforms?.frequencyTrend);

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 56px 20px',
      boxSizing: 'border-box',
      overflow: 'hidden',
      position: 'relative',
    }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 55% 40% at 30% 50%, rgba(26,74,94,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={{ flexShrink: 0, marginBottom: 16 }}>
        <div style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(125,230,155,0.6)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 6 }}>
          Usage Frequency · Three Waves
        </div>
        <h1 style={{ fontFamily: SANS, fontSize: 'clamp(26px, 3vw, 38px)', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.025em', lineHeight: 1.1, margin: 0 }}>
          AI use is now part of{' '}
          <span style={{ color: '#2EA84A' }}>the department's daily rhythm</span>
        </h1>
        <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: 'var(--text-support)', marginTop: 4 }}>
          That changes what success should look like from here
        </div>
      </motion.div>

      {/* 2-col body */}
      <div style={{ flex: 1, display: 'flex', gap: 28, minHeight: 0, overflow: 'hidden' }}>

        {/* Left — chart */}
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.12 }}
          style={{ flex: '0 0 56%', display: 'flex', flexDirection: 'column', gap: 10, overflow: 'hidden' }}
        >
          <div style={{ fontFamily: MONO, fontSize: 12, color: 'var(--text-medium)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Usage frequency by wave</div>
          <div style={{ flex: 1, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 40, bottom: 4, left: 8 }} barCategoryGap="28%">
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis type="category" dataKey="name" tick={axisStyle} axisLine={false} tickLine={false} width={52} />
                <Tooltip
                  contentStyle={{ background: '#1e2425', border: '1px solid rgba(125,230,155,0.2)', borderRadius: 8, fontFamily: 'DM Sans, sans-serif', fontSize: 11 }}
                  labelStyle={{ color: '#7DE69B', fontWeight: 700 }}
                  itemStyle={{ color: '#c0c8d0' }}
                />
                {Object.entries(FREQ_COLORS).map(([key, color]) => (
                  <Bar key={key} dataKey={key} stackId="a" fill={color}>
                    <LabelList dataKey={key} position="center"
                      style={{ fill: key === 'Monthly' || key === 'Weekly' ? '#1a1d1e' : '#fff', fontSize: 13, fontWeight: 700, fontFamily: 'DM Sans, sans-serif' }}
                      formatter={v => v > 8 ? `${v}%` : ''} />
                  </Bar>
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', gap: 14, flexShrink: 0 }}>
            {Object.entries(FREQ_COLORS).map(([label, color]) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: color }} />
                <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: 'var(--text-support)' }}>{label}</span>
              </div>
            ))}
          </div>

          {/* The shift to watch */}
          <div style={{ background: 'rgba(125,230,155,0.04)', border: '1px solid rgba(125,230,155,0.12)', borderRadius: 10, padding: '10px 14px', flexShrink: 0 }}>
            <span style={{ fontFamily: SANS, fontSize: 15, fontWeight: 800, color: 'var(--text-medium)' }}>The shift to watch  </span>
            <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 15, color: 'var(--text-bridge)', lineHeight: 1.55 }}>
              Daily use doubled between Wave 1 and Wave 2, then climbed again to 90% in Wave 3. At this point, usage volume is no longer the most useful success metric.
            </span>
          </div>
        </motion.div>

        {/* Right */}
        <motion.div
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}
        >
          {/* 2 big stats */}
          <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
            <div style={{ flex: 1, background: 'var(--card-bg)', border: '1px solid rgba(26,74,94,0.5)', borderLeft: '4px solid #1a4a5e', borderRadius: 12, padding: '16px 14px' }}>
              <div style={{ fontFamily: SANS, fontSize: 'clamp(34px, 4vw, 52px)', fontWeight: 900, color: '#59BEC9', lineHeight: 1 }}>{dailyPct}%</div>
              <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 15, color: 'var(--text-support)', marginTop: 4 }}>Wave 3 daily use</div>
            </div>
            <div style={{ flex: 1, background: 'var(--card-bg)', border: '1px solid rgba(89,190,201,0.2)', borderLeft: '4px solid #59BEC9', borderRadius: 12, padding: '16px 14px' }}>
              <div style={{ fontFamily: SANS, fontSize: 'clamp(34px, 4vw, 52px)', fontWeight: 900, color: '#FFCD00', lineHeight: 1 }}>42%</div>
              <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 15, color: 'var(--text-support)', marginTop: 4 }}>Slack 2025: desk workers using AI at least weekly</div>
            </div>
          </div>

          {/* Benchmark context */}
          <div style={{ background: 'rgba(125,230,155,0.04)', border: '1px solid rgba(125,230,155,0.14)', borderRadius: 10, padding: '12px 14px' }}>
            <div style={{ fontFamily: SANS, fontSize: 15, fontWeight: 800, color: 'var(--text-medium)', marginBottom: 7 }}>Benchmark context</div>
            <ul style={{ margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                { color: '#2EA84A', txt: 'Microsoft 2024: 75% of global knowledge workers use AI at work.' },
                { color: '#59BEC9', txt: 'Slack 2025: 60% of desk workers use AI, and 42% use it at least weekly.' },
                { color: '#7DE69B', txt: 'This department appears well ahead on regular use.' },
              ].map((b, i) => (
                <li key={i} style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 15, color: 'var(--text-bridge)', lineHeight: 1.55, listStyle: 'none' }}>
                  <span style={{ color: b.color, marginRight: 6 }}>●</span>{b.txt}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
