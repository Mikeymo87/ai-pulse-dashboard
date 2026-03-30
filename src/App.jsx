import './index.css';
import { useSurveyData } from './hooks/useSurveyData';

const S = {
  page:    { minHeight: '100vh', background: '#0f172a', color: '#e2e8f0', fontFamily: 'Inter, sans-serif', padding: 32 },
  h1:      { fontSize: 22, fontWeight: 700, color: '#818cf8', marginBottom: 4 },
  sub:     { fontSize: 12, color: '#475569', marginBottom: 40 },
  section: { marginBottom: 48 },
  h2:      { fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 16 },
  grid3:   { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 },
  grid4:   { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 },
  card:    { background: '#1e293b', borderRadius: 10, padding: '16px 20px' },
  big:     { fontSize: 28, fontWeight: 700, lineHeight: 1 },
  label:   { fontSize: 12, color: '#94a3b8', marginTop: 4 },
  small:   { fontSize: 11, color: '#475569', marginTop: 2 },
  row:     { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #1e293b' },
  pill:    { fontSize: 11, background: '#1e293b', borderRadius: 20, padding: '2px 10px', color: '#94a3b8' },
  tag:     { display: 'inline-block', fontSize: 11, background: '#312e81', color: '#a5b4fc', borderRadius: 4, padding: '2px 8px', margin: '2px 3px' },
};

function Card({ color = '#818cf8', value, label, detail }) {
  return (
    <div style={S.card}>
      <div style={{ ...S.big, color }}>{value}</div>
      <div style={S.label}>{label}</div>
      {detail && <div style={S.small}>{detail}</div>}
    </div>
  );
}

function SectionTitle({ children }) {
  return <h2 style={S.h2}>{children}</h2>;
}

function Table({ headers, rows, colors }) {
  return (
    <div style={{ background: '#1e293b', borderRadius: 10, overflow: 'hidden' }}>
      <div style={{ display: 'grid', gridTemplateColumns: `2fr ${headers.slice(1).map(() => '1fr').join(' ')}`, background: '#0f172a', padding: '8px 16px' }}>
        {headers.map((h, i) => <div key={i} style={{ fontSize: 11, color: '#475569', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>{h}</div>)}
      </div>
      {rows.map((row, ri) => (
        <div key={ri} style={{ display: 'grid', gridTemplateColumns: `2fr ${headers.slice(1).map(() => '1fr').join(' ')}`, padding: '9px 16px', borderTop: '1px solid #0f172a', alignItems: 'center' }}>
          {row.map((cell, ci) => (
            <div key={ci} style={{ fontSize: 13, color: ci === 0 ? '#e2e8f0' : (colors?.[ci - 1] || '#94a3b8') }}>{cell}</div>
          ))}
        </div>
      ))}
    </div>
  );
}

function BarRow({ label, s1, s2, s3 }) {
  const max = Math.max(s1?.pct || 0, s2?.pct || 0, s3?.pct || 0, 1);
  const bar = (pct, color) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
      <div style={{ height: 8, width: `${Math.round((pct / max) * 100)}%`, background: color, borderRadius: 4, minWidth: pct > 0 ? 4 : 0 }} />
      <span style={{ fontSize: 11, color: '#94a3b8', whiteSpace: 'nowrap' }}>{pct}%{s1 !== undefined && ` (${pct === (s1?.pct) ? s1?.count : pct === (s2?.pct) ? s2?.count : s3?.count})`}</span>
    </div>
  );
  return (
    <div style={{ padding: '8px 0', borderBottom: '1px solid #1e293b' }}>
      <div style={{ fontSize: 12, color: '#cbd5e1', marginBottom: 4 }}>{label}</div>
      <div style={{ display: 'flex', gap: 8 }}>
        {s1 !== undefined && <div style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 1 }}><span style={{ fontSize: 10, color: '#6366f1', width: 20 }}>S1</span>{bar(s1?.pct || 0, '#6366f1')}</div>}
        {s2 !== undefined && <div style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 1 }}><span style={{ fontSize: 10, color: '#a78bfa', width: 20 }}>S2</span>{bar(s2?.pct || 0, '#a78bfa')}</div>}
        {s3 !== undefined && <div style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 1 }}><span style={{ fontSize: 10, color: '#34d399', width: 20 }}>S3</span>{bar(s3?.pct || 0, '#34d399')}</div>}
      </div>
    </div>
  );
}

function SingleBar({ label, count, pct, color = '#818cf8', total }) {
  return (
    <div style={{ padding: '7px 0', borderBottom: '1px solid #1e293b' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 12, color: '#cbd5e1' }}>{label}</span>
        <span style={{ fontSize: 12, color: '#64748b' }}>{count} &nbsp;<span style={{ color }}>{pct}%</span></span>
      </div>
      <div style={{ height: 6, background: '#0f172a', borderRadius: 4 }}>
        <div style={{ height: 6, width: `${pct}%`, background: color, borderRadius: 4 }} />
      </div>
    </div>
  );
}

export default function App() {
  const { surveys, transforms, loading, error } = useSurveyData();

  if (loading) return (
    <div style={{ ...S.page, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
      <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#818cf8', boxShadow: '0 0 20px rgba(129,140,248,0.8)' }} />
      <p style={{ color: '#475569', fontSize: 13 }}>Loading survey data…</p>
    </div>
  );

  if (error) return (
    <div style={{ ...S.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#ef4444' }}>Error loading data — check console.</p>
    </div>
  );

  const {
    responseCounts, sentimentTrend, confidenceTrend, frequencyTrend,
    familiarityTrend, importanceTrend, stageTrend, barriersTrend,
    useCaseThemesTrend, struggleThemesS3, excitementThemesS3, openEndedText,
    toolsS2, toolsS3, benefitsS3, momentumS3, ownPocketS3, byRole, byFunction,
  } = transforms;

  return (
    <div style={S.page}>
      <h1 style={S.h1}>AI Pulse Dashboard — Phase 1 Data Verification</h1>
      <p style={S.sub}>All 289 responses parsed and transformed. This panel will be replaced by the full dashboard UI in Phase 2.</p>

      {/* ── Response Counts ── */}
      <section style={S.section}>
        <SectionTitle>Response Counts</SectionTitle>
        <div style={{ ...S.grid4 }}>
          {responseCounts.map(s => <Card key={s.label} color="#818cf8" value={s.n} label={s.label} detail={s.period} />)}
          <Card color="#34d399" value={responseCounts.reduce((t, s) => t + s.n, 0)} label="Total Responses" detail="117-person dept" />
        </div>
      </section>

      {/* ── Sentiment ── */}
      <section style={S.section}>
        <SectionTitle>Sentiment — How respondents feel about AI</SectionTitle>
        <div style={{ background: '#1e293b', borderRadius: 10, padding: '16px 20px' }}>
          {sentimentTrend.map(e => (
            <BarRow key={e.sentiment} label={e.sentiment} s1={e.s1} s2={e.s2} s3={e.s3} />
          ))}
        </div>
      </section>

      {/* ── Confidence ── */}
      <section style={S.section}>
        <SectionTitle>Confidence in using AI effectively (per-survey scale)</SectionTitle>
        <div style={S.grid3}>
          {confidenceTrend.map(s => (
            <div key={s.label} style={S.card}>
              <div style={{ fontSize: 11, color: '#64748b', marginBottom: 8 }}>{s.label} · {s.period} · avg <span style={{ color: '#f59e0b' }}>{s.avg}</span></div>
              {s.distribution.map(d => <SingleBar key={d.label} label={d.label} count={d.count} pct={d.pct} color="#f59e0b" />)}
            </div>
          ))}
        </div>
      </section>

      {/* ── Frequency ── */}
      <section style={S.section}>
        <SectionTitle>Usage Frequency — How often respondents use AI at work</SectionTitle>
        <div style={{ background: '#1e293b', borderRadius: 10, padding: '16px 20px' }}>
          {['Daily', 'Weekly', 'Monthly', 'Rarely', 'Never'].map(freq => {
            const entries = frequencyTrend.map(s => ({ ...s, d: s.distribution.find(d => d.label === freq) }));
            if (entries.every(e => !e.d)) return null;
            return <BarRow key={freq} label={freq}
              s1={entries[0].d} s2={entries[1].d} s3={entries[2].d} />;
          })}
        </div>
      </section>

      {/* ── Familiarity ── */}
      <section style={S.section}>
        <SectionTitle>Familiarity with AI tools (1 = Unfamiliar → 5 = Expert)</SectionTitle>
        <div style={S.grid3}>
          {familiarityTrend.map(s => (
            <div key={s.label} style={S.card}>
              <div style={{ fontSize: 11, color: '#64748b', marginBottom: 8 }}>{s.label} · avg <span style={{ color: '#22d3ee' }}>{s.avg}</span></div>
              {s.distribution.map(d => <SingleBar key={d.label} label={`${d.score} – ${d.label}`} count={d.count} pct={d.pct} color="#22d3ee" />)}
            </div>
          ))}
        </div>
      </section>

      {/* ── Importance ── */}
      <section style={S.section}>
        <SectionTitle>Importance of AI to individual/team success (1–5)</SectionTitle>
        <div style={{ background: '#1e293b', borderRadius: 10, padding: '16px 20px' }}>
          <div style={{ display: 'flex', gap: 32, marginBottom: 12 }}>
            {importanceTrend.map(s => (
              <div key={s.label}>
                <span style={{ fontSize: 11, color: '#64748b' }}>{s.label} avg: </span>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#22d3ee' }}>{s.avg}</span>
              </div>
            ))}
          </div>
          {[5, 4, 3, 2, 1].map(score => {
            const entries = importanceTrend.map(s => ({ ...s, d: s.distribution.find(d => d.score === score) }));
            if (entries.every(e => !e.d)) return null;
            return <BarRow key={score} label={`Score ${score}`}
              s1={entries[0].d} s2={entries[1].d} s3={entries[2].d} />;
          })}
        </div>
      </section>

      {/* ── AI Journey Stage ── */}
      <section style={S.section}>
        <SectionTitle>AI Journey Stage (S2 + S3 only)</SectionTitle>
        <div style={{ background: '#1e293b', borderRadius: 10, padding: '16px 20px' }}>
          {stageTrend.map(e => (
            <div key={e.stage} style={{ padding: '8px 0', borderBottom: '1px solid #0f172a' }}>
              <div style={{ fontSize: 12, color: '#cbd5e1', marginBottom: 4 }}>{e.stage}</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
                  <span style={{ fontSize: 10, color: '#a78bfa', width: 20 }}>S2</span>
                  <div style={{ height: 8, width: `${e.s2.pct}%`, background: '#a78bfa', borderRadius: 4, minWidth: e.s2.count > 0 ? 4 : 0 }} />
                  <span style={{ fontSize: 11, color: '#64748b' }}>{e.s2.pct}% ({e.s2.count})</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
                  <span style={{ fontSize: 10, color: '#34d399', width: 20 }}>S3</span>
                  <div style={{ height: 8, width: `${e.s3.pct}%`, background: '#34d399', borderRadius: 4, minWidth: e.s3.count > 0 ? 4 : 0 }} />
                  <span style={{ fontSize: 11, color: '#64748b' }}>{e.s3.pct}% ({e.s3.count})</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Barriers ── */}
      <section style={S.section}>
        <SectionTitle>Barriers to using AI effectively (multi-select — % of respondents who mentioned)</SectionTitle>
        <div style={{ background: '#1e293b', borderRadius: 10, padding: '16px 20px' }}>
          {barriersTrend.map(e => (
            <BarRow key={e.barrier} label={e.barrier} s1={e.s1} s2={e.s2} s3={e.s3} />
          ))}
        </div>
      </section>

      {/* ── Use-Case Themes (S1 + S2 open-ended) ── */}
      <section style={S.section}>
        <SectionTitle>Use-Case Themes from open-ended responses — S1 ({openEndedText.s1.length} wrote something) vs S2 ({openEndedText.s2.length})</SectionTitle>
        <div style={{ background: '#1e293b', borderRadius: 10, padding: '16px 20px' }}>
          {useCaseThemesTrend.map(e => (
            <div key={e.key} style={{ padding: '8px 0', borderBottom: '1px solid #0f172a' }}>
              <div style={{ fontSize: 12, color: '#cbd5e1', marginBottom: 4 }}>{e.label}</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
                  <span style={{ fontSize: 10, color: '#6366f1', width: 20 }}>S1</span>
                  <div style={{ height: 8, width: `${e.s1.pct}%`, background: '#6366f1', borderRadius: 4, minWidth: e.s1.count > 0 ? 4 : 0 }} />
                  <span style={{ fontSize: 11, color: '#64748b' }}>{e.s1.pct}% ({e.s1.count})</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
                  <span style={{ fontSize: 10, color: '#a78bfa', width: 20 }}>S2</span>
                  <div style={{ height: 8, width: `${e.s2.pct}%`, background: '#a78bfa', borderRadius: 4, minWidth: e.s2.count > 0 ? 4 : 0 }} />
                  <span style={{ fontSize: 11, color: '#64748b' }}>{e.s2.pct}% ({e.s2.count})</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── S3 Struggle Themes ── */}
      <section style={S.section}>
        <SectionTitle>S3 Struggle Themes — qualitative depth on top of structured barriers</SectionTitle>
        <div style={{ background: '#1e293b', borderRadius: 10, padding: '16px 20px' }}>
          {struggleThemesS3.map(t => <SingleBar key={t.key} label={t.label} count={t.count} pct={t.pct} color="#fb923c" />)}
        </div>
      </section>

      {/* ── S3 Excitement Themes ── */}
      <section style={S.section}>
        <SectionTitle>S3 Excitement Themes — forward-looking energy signals</SectionTitle>
        <div style={{ background: '#1e293b', borderRadius: 10, padding: '16px 20px' }}>
          {excitementThemesS3.map(t => <SingleBar key={t.key} label={t.label} count={t.count} pct={t.pct} color="#34d399" />)}
        </div>
      </section>

      {/* ── Tools S2 ── */}
      <section style={S.section}>
        <SectionTitle>Tools used in S2 (structured multi-select)</SectionTitle>
        <div style={{ background: '#1e293b', borderRadius: 10, padding: '16px 20px' }}>
          {toolsS2.slice(0, 15).map(t => <SingleBar key={t.label} label={t.label} count={t.count} pct={t.pct} color="#60a5fa" />)}
        </div>
      </section>

      {/* ── Tools S3 (non-endorsed) ── */}
      <section style={S.section}>
        <SectionTitle>S3 Personal / non-endorsed tools used outside company subscription</SectionTitle>
        <div style={{ background: '#1e293b', borderRadius: 10, padding: '16px 20px' }}>
          {toolsS3.slice(0, 15).map(t => <SingleBar key={t.label} label={t.label} count={t.count} pct={t.pct} color="#f472b6" />)}
        </div>
      </section>

      {/* ── Benefits S3 ── */}
      <section style={S.section}>
        <SectionTitle>S3 Benefits experienced most (top 3 multi-select)</SectionTitle>
        <div style={{ background: '#1e293b', borderRadius: 10, padding: '16px 20px' }}>
          {benefitsS3.map(t => <SingleBar key={t.label} label={t.label} count={t.count} pct={t.pct} color="#a78bfa" />)}
        </div>
      </section>

      {/* ── Momentum + Own Pocket ── */}
      <section style={S.section}>
        <SectionTitle>S3 Departmental Momentum &amp; Out-of-Pocket Spending</SectionTitle>
        <div style={{ display: 'flex', gap: 16 }}>
          <div style={{ ...S.card, flex: 2 }}>
            <div style={{ fontSize: 11, color: '#64748b', marginBottom: 8 }}>Momentum perception</div>
            {momentumS3.map(t => <SingleBar key={t.label} label={t.label} count={t.count} pct={t.pct} color="#22d3ee" />)}
          </div>
          <div style={{ ...S.card, flex: 1 }}>
            <div style={{ fontSize: 11, color: '#64748b', marginBottom: 12 }}>Paying out of own pocket</div>
            <div style={{ ...S.big, color: '#f59e0b' }}>{ownPocketS3.yesPct}%</div>
            <div style={S.label}>Yes ({ownPocketS3.yes} people)</div>
            <div style={{ marginTop: 12, ...S.big, color: '#475569', fontSize: 22 }}>{ownPocketS3.noPct}%</div>
            <div style={S.label}>No ({ownPocketS3.no} people)</div>
          </div>
        </div>
      </section>

      {/* ── S3 By Role ── */}
      <section style={S.section}>
        <SectionTitle>S3 Breakdown by Role</SectionTitle>
        <div style={{ background: '#1e293b', borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr', background: '#0f172a', padding: '8px 16px' }}>
            {['Role', 'Count', 'Confidence avg', 'Importance avg', 'Familiarity avg'].map(h => (
              <div key={h} style={{ fontSize: 10, color: '#475569', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>{h}</div>
            ))}
          </div>
          {byRole.map(r => (
            <div key={r.role} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr', padding: '9px 16px', borderTop: '1px solid #0f172a' }}>
              <div style={{ fontSize: 13, color: '#e2e8f0' }}>{r.role}</div>
              <div style={{ fontSize: 13, color: '#94a3b8' }}>{r.count} <span style={{ color: '#475569' }}>({r.pct}%)</span></div>
              <div style={{ fontSize: 13, color: '#f59e0b' }}>{r.confidenceAvg ?? '—'}</div>
              <div style={{ fontSize: 13, color: '#22d3ee' }}>{r.importanceAvg ?? '—'}</div>
              <div style={{ fontSize: 13, color: '#34d399' }}>{r.familiarityAvg ?? '—'}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── S3 By Function ── */}
      <section style={S.section}>
        <SectionTitle>S3 Breakdown by Function</SectionTitle>
        <div style={{ background: '#1e293b', borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', background: '#0f172a', padding: '8px 16px' }}>
            {['Function', 'Count', 'Confidence avg', 'Importance avg'].map(h => (
              <div key={h} style={{ fontSize: 10, color: '#475569', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>{h}</div>
            ))}
          </div>
          {byFunction.map(f => (
            <div key={f.function} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', padding: '9px 16px', borderTop: '1px solid #0f172a' }}>
              <div style={{ fontSize: 13, color: '#e2e8f0' }}>{f.function}</div>
              <div style={{ fontSize: 13, color: '#94a3b8' }}>{f.count} <span style={{ color: '#475569' }}>({f.pct}%)</span></div>
              <div style={{ fontSize: 13, color: '#f59e0b' }}>{f.confidenceAvg ?? '—'}</div>
              <div style={{ fontSize: 13, color: '#22d3ee' }}>{f.importanceAvg ?? '—'}</div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
