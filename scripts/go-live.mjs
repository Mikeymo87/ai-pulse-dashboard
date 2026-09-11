// Survey 4 go-live: one command that takes the published-CSV link of the Wave 4 responses sheet
// and does every step that can be done without a human, in order, stopping at the first problem.
//
//   node scripts/go-live.mjs --s4-url=<published csv url>            wire + verify (check-data, smoke, build)
//   node scripts/go-live.mjs --s4-url=<url> --dry-run                 everything except writing S4_URL
//   node scripts/go-live.mjs --s4-url=<url> --skip-smoke              skip the headless UI pass (not on Monday)
//   node scripts/go-live.mjs --s4-url=<url> --watch                   after wiring: print the live response count every 60s
//
// What it refuses: a URL that is not a Google "publish to web" CSV link, a sheet whose header row does not
// map every Wave 4 field, or writing a local/sample path into S4_URL. Exit code is non-zero on any failure.
import { readFileSync, writeFileSync } from 'node:fs';
import { spawn, spawnSync } from 'node:child_process';
import Papa from 'papaparse';
import { MAPPERS, parseCsvText, s4HeaderReport } from '../src/data/parseCSVs.js';
import { LIVE_MIN_N } from '../src/data/transforms.js';

const arg = (k) => process.argv.find(a => a.startsWith(`--${k}=`))?.slice(k.length + 3);
const has = (k) => process.argv.includes(`--${k}`);
const url = arg('s4-url');
const dryRun = has('dry-run'), skipSmoke = has('skip-smoke'), watch = has('watch');
const PARSER = 'src/data/parseCSVs.js';
const PUBLISHED = /^https:\/\/docs\.google\.com\/spreadsheets\/d\/e\/2PACX-[\w-]+\/pub\?.*output=csv/;

const log = (m) => console.log(m);
const ok = (m) => log('  ok    ' + m);
const fail = (m) => { log('  FAIL  ' + m); process.exit(1); };
const warn = (m) => log('  warn  ' + m);

if (!url) fail('missing --s4-url=<published csv url>');
const isHttp = /^https?:/i.test(url);
log(`\n[1/6] source`);
if (isHttp) {
  if (!PUBLISHED.test(url)) fail(`not a Google "publish to web" CSV link. Expected https://docs.google.com/spreadsheets/d/e/2PACX-.../pub?...output=csv, got: ${url}`);
  if (!/[?&]gid=\d+/.test(url)) warn('no gid= in the link: the whole document was published, the first tab will be read. Prefer publishing only the responses tab.');
  if (!/single=true/.test(url)) warn('no single=true in the link; Google normally adds it when one tab is published.');
  ok('link shape is a published CSV');
} else {
  if (!dryRun) fail('a local path is only allowed with --dry-run');
  ok(`local file (dry run): ${url}`);
}

async function loadText() {
  if (!isHttp) return readFileSync(url, 'utf8');
  const r = await fetch(url, { redirect: 'follow' });
  if (!r.ok) fail(`fetch ${r.status} ${r.statusText}. If the sheet was just published, wait a minute and retry; if 401/403, the tab is not published to the web.`);
  return r.text();
}

log(`\n[2/6] header row`);
const text = await loadText();
if (!text.trim()) fail('empty response: the published tab has no header row yet. Link the form to the sheet first (Responses tab > Sheets icon).');
const headers = Papa.parse(text, { header: false, skipEmptyLines: true }).data[0] ?? [];
if (headers[0] !== 'Timestamp') fail(`first column is "${headers[0]}", expected "Timestamp". This is not a Google Forms responses tab.`);
const report = s4HeaderReport(headers);
const missing = report.filter(r => r.matched === null);
for (const { field, matched } of report) log(`  ${matched ? 'ok   ' : 'FAIL '} ${field.padEnd(13)} <- ${matched ? JSON.stringify(matched.slice(0, 70)) : 'MISSING'}`);
if (missing.length) fail(`${missing.length} Wave 4 field(s) have no column: ${missing.map(m => m.field).join(', ')}. A question title changed in the form; update the prefix in S4_COLUMNS + mapS4 (src/data/parseCSVs.js).`);
const extra = headers.filter(h => !report.some(r => r.matched === h));
if (extra.length) warn(`${extra.length} column(s) not read by the app (ignored): ${extra.map(h => JSON.stringify(h.slice(0, 50))).join(', ')}`);
ok(`${headers.length} columns, all ${report.length} Wave 4 fields mapped`);

log(`\n[3/6] rows`);
const rows = MAPPERS[4](parseCsvText(text));
const n = rows.length;
if (n === 0) ok('0 responses yet (header-only sheet). Row-level checks start with the first response.');
else ok(`${n} response${n === 1 ? '' : 's'} parsed`);
log(`  info  headline wave right now: ${n >= LIVE_MIN_N ? 'Wave 4 (past the flip)' : `Wave 3 (${n}/${LIVE_MIN_N} toward the flip)`}`);

log(`\n[4/6] S4_URL in ${PARSER}`);
const src = readFileSync(PARSER, 'utf8');
const m = src.match(/^const S4_URL = '([^']*)';$/m);
if (!m) fail('could not find `const S4_URL = \'...\';` in parseCSVs.js');
if (dryRun) {
  ok(`dry run: would set S4_URL (currently ${m[1] ? JSON.stringify(m[1].slice(0, 60)) : 'empty'})`);
} else if (m[1] === url) {
  ok('S4_URL already set to this link');
} else {
  if (m[1] && !m[1].startsWith('/data/')) warn(`replacing an existing S4_URL: ${m[1].slice(0, 70)}`);
  writeFileSync(PARSER, src.replace(m[0], `const S4_URL = '${url}';`));
  ok('S4_URL written');
}

function run(label, cmd, args, opts = {}) {
  log(`\n  > ${label}`);
  const r = spawnSync(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'], encoding: 'utf8', ...opts });
  const out = (r.stdout ?? '') + (r.stderr ?? '');
  const tail = out.trim().split('\n').slice(-6).map(l => '      ' + l).join('\n');
  if (r.status !== 0) { log(tail); fail(`${label} failed (exit ${r.status})`); }
  log(tail);
  return out;
}

log(`\n[5/6] regression net`);
run('check-data', 'node', ['scripts/check-data.mjs', `--s4-url=${url}`]);
if (skipSmoke) warn('smoke-ui skipped (--skip-smoke)');
else {
  const vite = spawn('npx', ['vite', '--port', '5010', '--strictPort'], { stdio: 'ignore', detached: true });
  let up = false;
  for (let i = 0; i < 40 && !up; i++) {
    await new Promise(r => setTimeout(r, 1000));
    try { up = (await fetch('http://localhost:5010/')).ok; } catch {}
  }
  if (!up) { try { process.kill(-vite.pid); } catch {} fail('dev server did not come up on :5010 (port busy? another vite running?)'); }
  try { run('smoke-ui (3 waves, empty, early, solid)', 'node', ['scripts/smoke-ui.mjs']); }
  finally { try { process.kill(-vite.pid); } catch {} }
}
run('vite build', 'npx', ['vite', 'build']);

log(`\n[6/6] hand-off`);
if (dryRun) {
  ok('dry run complete. Nothing written. Re-run without --dry-run to wire the link.');
} else {
  ok('wired and verified. Now commit + push, then Mike republishes on Replit:');
  log(`      git add src/data/parseCSVs.js && git commit -m "Survey 4: wire the live responses sheet" && git push origin HEAD`);
  log(`      Repl shell: git fetch origin && git reset --hard origin/main   then Republish`);
  log(`      After the republish: the hero pill reads "Survey 4 opens Sep 14" until the first response, then "Survey 4 live · n responses so far".`);
}

if (watch) {
  log(`\n[watch] polling every 60s, Ctrl-C to stop (Google republishes the CSV about every 5 minutes)`);
  let last = -1;
  for (;;) {
    let count = last;
    try { count = MAPPERS[4](parseCsvText(await loadText())).length; } catch (e) { log(`  ${new Date().toLocaleTimeString()}  fetch error: ${e.message}`); }
    const delta = last >= 0 && count > last ? `  +${count - last}` : '';
    const state = count >= LIVE_MIN_N ? 'Wave 4 is the headline' : `Wave 3 headline, ${count}/${LIVE_MIN_N} toward the flip`;
    log(`  ${new Date().toLocaleTimeString()}  ${String(count).padStart(4)} responses${delta}   ${state}`);
    last = count;
    await new Promise(r => setTimeout(r, 60000));
  }
}
