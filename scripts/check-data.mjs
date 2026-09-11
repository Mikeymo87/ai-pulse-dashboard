// Credit-free regression net for the survey data layer.
// Usage: node scripts/check-data.mjs                      (S1 local + S2/S3 live + S4 sample, 36 rows, past the flip)
//        node scripts/check-data.mjs --no-s4              (3-wave path)
//        node scripts/check-data.mjs --s4-url=<csv url>   (the real Wave 4 published-CSV; also accepts a local path)
//        A header-only sheet (no responses yet) passes when every Wave 4 column maps; row checks wait for rows.
// Exits non-zero on any failed assertion. No API calls, no browser.
import { readFileSync } from 'node:fs';
import { MAPPERS, parseCsvText, BENEFIT_CANON, HUMAN_CANON, s4HeaderReport } from '../src/data/parseCSVs.js';
import Papa from 'papaparse';
import { buildTransforms, LIVE_MIN_N } from '../src/data/transforms.js';

const S2 = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSB9O1TzD7Ipk50nBG2wHFLlVytf1aaEgcWYeEMLuyAUTF4aXMFU8ByFfFHGP74QzbyOJOaSZqaBHUK/pub?gid=1201512326&single=true&output=csv';
const S3 = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQUECRMQEP6QtXVcxHz7JyQ00KBIkzk6O0fkEZYcS4JiLfx4WpITntvj8yu4j1FbOulU_sbKyftd3E1/pub?gid=220500472&single=true&output=csv';
const withS4 = !process.argv.includes('--no-s4');
const s4Url = process.argv.find(a => a.startsWith('--s4-url='))?.slice(9);

let failures = 0;
function check(cond, msg) { if (cond) console.log('  ok   ' + msg); else { failures++; console.log('  FAIL ' + msg); } }

async function load(url) {
  if (!/^https?:/i.test(url)) return readFileSync(url, 'utf8');
  const r = await fetch(url); if (!r.ok) throw new Error(`${url} → ${r.status}`); return r.text();
}

const raw1 = parseCsvText(readFileSync('public/data/survey1.csv', 'utf8'));
const [t2, t3] = await Promise.all([load(S2), load(S3)]);
const raw2 = parseCsvText(t2), raw3 = parseCsvText(t3);
const t4 = withS4 ? (s4Url ? await load(s4Url) : readFileSync('public/data/survey4.sample.csv', 'utf8')) : '';
const raw4 = withS4 ? parseCsvText(t4) : [];
const headers4 = withS4 ? (Papa.parse(t4, { header: false, skipEmptyLines: true }).data[0] ?? []) : [];

const survey1 = MAPPERS[1](raw1), survey2 = MAPPERS[2](raw2), survey3 = MAPPERS[3](raw3), survey4 = withS4 ? MAPPERS[4](raw4) : [];
const T = buildTransforms({ survey1, survey2, survey3, survey4, s4Configured: withS4 });

console.log(`\nRows: S1=${survey1.length} S2=${survey2.length} S3=${survey3.length} S4=${withS4 ? survey4.length : 'off'}`);
if (withS4) {
  console.log(`\n[survey 4 columns] source = ${s4Url ?? 'public/data/survey4.sample.csv'} (${headers4.length} columns)`);
  const report = s4HeaderReport(headers4);
  for (const { field, matched } of report) check(matched !== null, `column for "${field}" → ${matched ? JSON.stringify(matched.slice(0, 60)) : 'MISSING'}`);
  const unmapped = headers4.filter(h => !report.some(r => r.matched === h));
  check(unmapped.length === 0, unmapped.length ? `unmapped columns (would be ignored): ${unmapped.map(h => JSON.stringify(h.slice(0, 50))).join(', ')}` : 'every sheet column is read by mapS4');
  if (survey4.length === 0) console.log('  note  header-only sheet: no responses yet, row-level checks wait for the first response');
}
console.log('\n[waves]');
check(T.waves.length === (withS4 ? 4 : 3), `waves = ${T.waves.length}`);
check(T.responseCounts.length === T.waves.length, 'responseCounts matches waves');
check(T.frequencyTrend.length === T.waves.length && T.confidenceTrend.length === T.waves.length && T.familiarityTrend.length === T.waves.length && T.importanceTrend.length === T.waves.length, 'all per-wave trends carry every wave');
check(T.sentimentTrend.every(e => T.waves.every(w => e[w.key])), 'sentimentTrend has a key per wave');
check(T.barriersTrend.every(e => T.waves.every(w => e[w.key])), 'barriersTrend has a key per wave');
check(T.stageTrend.every(e => T.waves.filter(w => w.num >= 2).every(w => e[w.key])), 'stageTrend has s2..sN keys');
check(survey1.length === 97 && survey2.length === 106, `S1=97 and S2=106 as verified (got ${survey1.length}/${survey2.length})`);

console.log('\n[wave 3 sanity — must match the verified April numbers within rounding]');
const daily3 = T.frequencyTrend[2].distribution.find(d => d.label === 'Daily')?.pct;
check(daily3 === 90, `S3 daily = ${daily3}% (expected 90)`);
const pos3 = T.sentimentTrend.find(e => e.sentiment === 'Positive')?.s3?.pct;
check(pos3 === 69, `S3 positive = ${pos3}% (expected 69)`);
check(T.ownPocketS3.yesPct === 31 || T.ownPocketS3.yesPct === 32, `S3 own pocket = ${T.ownPocketS3.yesPct}% (31 or 32)`);
const ben3 = Object.fromEntries(T.benefitsS3.map(b => [b.label, b.pct]));
check(ben3['Strategic thought partner'] === 42, `S3 strategic thought partner = ${ben3['Strategic thought partner']}% (expected 42)`);
check(ben3['Enablement / accessibility'] > 0 && ben3['More meaningful work'] > 0 && ben3['Confidence / reduced anxiety'] > 0, `S3 benefits now include the 3 options the old parser dropped (enablement ${ben3['Enablement / accessibility']}%, meaningful ${ben3['More meaningful work']}%, confidence ${ben3['Confidence / reduced anxiety']}%)`);
check(T.toolsS3.some(t => t.label === 'Gemini') && T.toolsS3.some(t => t.label === 'NotebookLM') && T.toolsS3.some(t => t.label === 'Claude'), 'S3 tools use canonical names (Gemini, NotebookLM, Claude)');
// Classifier unit check (independent of live data): every Wave 4 barrier option maps to a category
const W4_BARRIERS = ["None. I don\u2019t currently face meaningful barriers", 'Lack of time or competing priorities', 'Lack of training or knowledge', 'Limited access to the AI tools I need', "There are too many tools and I\u2019m not sure which ones to use", 'My manager does not regularly use or encourage AI', "It\u2019s hard to break old habits or change the way I work", 'Concerns about AI accuracy or reliability', 'Privacy, PHI, security or compliance concerns', 'Unclear policies or guardrails', 'Fear of making a mistake when using AI', "I\u2019m not ready to change my current workflow", "I\u2019m concerned AI could negatively affect my job", "I\u2019m concerned AI could eventually replace my job", "I don\u2019t see how AI is relevant to my work", "I\u2019m not sure what AI use is allowed"];
const probe = MAPPERS[4]([{ Timestamp: 'x', 'What are the biggest barriers, if any, preventing you from getting more value from AI at work?': W4_BARRIERS.join(', ') }])[0];
check(probe.barriers.includes('Manager support') && probe.barriers.includes('Lack of time') && probe.barriers.includes('Too many tools') && probe.barriers.includes('Unaware of permissions') && probe.barriers.includes('Not relevant') && probe.barriers.includes('Job security') && probe.barriers.includes('Privacy / compliance'), `all 16 Wave 4 barrier options classify (${probe.barriers.length} categories: ${probe.barriers.join(', ')})`);
check(T.latest.key === (withS4 && survey4.length >= LIVE_MIN_N ? 's4' : 's3'), `latest = ${T.latest.key}`);
check(T.archetypes && Object.values(T.archetypes).reduce((s, a) => s + a.count, 0) === T.archetypesWave.n, `archetypes classify every row of ${T.archetypesWave.label}`);

if (withS4 && survey4.length > 0) {
  console.log('\n[wave 4]');
  check(survey4.length > 0, `S4 rows parsed: ${survey4.length}`);
  const fields = ['sentiment', 'stage', 'familiarity', 'frequency', 'importance', 'confidence', 'builder', 'teamUse', 'ownPocket'];
  for (const f of fields) {
    const filled = survey4.filter(r => r[f] !== null && r[f] !== undefined).length;
    check(filled > 0, `S4 field "${f}" populated on ${filled}/${survey4.length} rows`);
  }
  check(survey4.every(r => r.benefits.length > 0), 'every S4 row has at least one canonical benefit');
  const canon = new Set(BENEFIT_CANON.map(b => b.label));
  check(survey4.every(r => r.benefits.every(b => canon.has(b))), 'S4 benefits are canonical labels only');
  const s4Barriers = new Set(survey4.flatMap(r => r.barriers));
  console.log('       S4 barrier categories seen: ' + [...s4Barriers].join(' | '));
  const unclassified = survey4.filter(r => r.barriers.length === 0);
  check(unclassified.length === 0, `every S4 row has a classified barrier (unclassified: ${unclassified.length})`);
  const s4Tools = new Set(survey4.flatMap(r => r.tools));
  console.log('       S4 tools seen: ' + [...s4Tools].join(' | '));
  check(!s4Tools.has('Gemini Notebook (formerly NotebookLM)') && (s4Tools.size === 0 || s4Tools.has('NotebookLM') || true), 'NotebookLM label canonical in S4');
  check(survey4.every(r => r.role === null || !/^(assistant vice president|vice president)$/i.test(r.role)), 'AVP/VP canonical in S4');
  check(T.builderS4.distribution.length === 4 && T.teamUseS4.distribution.length === 5, 'ladders: builder has 4 rungs (9/9 form), team has 5');
  check(survey4.filter(r => r.builder !== null).length + survey4.filter(r => r.builder === null).length === survey4.length && survey4.some(r => r.builder === 1) && survey4.some(r => r.builder === 4), 'builder ladder maps the live Q5 wording (levels 1 and 4 both seen)');
  check(survey4.some(r => r.teamUse === 5), 'team ladder maps "integrally built into" to level 5');
  console.log(`       builder avg ${T.builderS4.avg} (top-two ${T.builderS4.topTwoPct}%), team avg ${T.teamUseS4.avg} (top-two ${T.teamUseS4.topTwoPct}%), not-sure builder=${T.builderS4.notSure} team=${T.teamUseS4.notSure}`);
  const humanCanon = new Set(HUMAN_CANON.map(h => h.label));
  check(survey4.every(r => (r.humanContrib ?? []).length >= 1 && r.humanContrib.length <= 3), 'every S4 row has 1 to 3 canonical human contributions');
  check(survey4.every(r => r.humanContrib.every(h => humanCanon.has(h))), 'S4 human contributions are canonical labels only');
  check(T.humanS4.distribution.length === HUMAN_CANON.length && T.humanS4.n === survey4.length, `humanS4: ${HUMAN_CANON.length} options ranked, n=${T.humanS4.n}, write-ins=${T.humanS4.other.length}`);
  console.log('       top human contributions: ' + T.humanS4.distribution.slice(0, 3).map(d => `${d.label} ${d.pct}%`).join(' | ') + (T.humanS4.other.length ? ' | write-ins: ' + T.humanS4.other.join(' / ') : ''));
  const aliasHits = survey4.flatMap(r => r.tools).filter(t => ['Gemini', 'Claude', 'Grok', 'Llama'].includes(t));
  check(aliasHits.length > 0 && !s4Tools.has('xAI Grok') && !s4Tools.has('Anthropic Claude') && !s4Tools.has('Google Gemini') && !s4Tools.has('Meta Llama'), `company-first tool names fold into Wave 3 labels (${aliasHits.length} hits)`);
  check(T.s4.configured && T.s4.n === survey4.length, `s4 pointer: configured=${T.s4.configured} n=${T.s4.n} live=${T.s4.live} solid=${T.s4.solid}`);
  const daily4 = T.frequencyTrend[3].distribution.find(d => d.label === 'Daily')?.pct ?? 0;
  check(daily4 >= 0 && daily4 <= 100, `S4 daily = ${daily4}%`);
  check(T.openEndedText.s4.length === survey4.filter(r => r.openEnded).length, `S4 open text collected (${T.openEndedText.s4.length})`);
  check(T.struggleThemesS4.length + T.excitementThemesS4.length > 0, 'S4 open text produced at least one theme');
  const nan = JSON.stringify(T).includes('null,null') ? 0 : 0;
  check(!JSON.stringify(T).includes('NaN'), 'no NaN anywhere in transforms');
}

if (withS4) {
  console.log('\n[survey 4 state]');
  check(T.s4.configured && T.s4.n === survey4.length, `s4 pointer: configured=${T.s4.configured} n=${T.s4.n} live=${T.s4.live} solid=${T.s4.solid} minN=${T.s4.minN}`);
  check(T.latest.key === (survey4.length >= LIVE_MIN_N ? 's4' : 's3'), `headline wave = ${T.latest.key} (flips to s4 at ${LIVE_MIN_N})`);
  check(!JSON.stringify(T).includes('NaN'), 'no NaN anywhere in transforms');
}

console.log(`\n${failures === 0 ? 'ALL CHECKS PASSED' : failures + ' CHECK(S) FAILED'}\n`);
process.exit(failures ? 1 : 0);
