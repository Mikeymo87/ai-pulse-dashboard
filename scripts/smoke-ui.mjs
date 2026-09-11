// Headless UI smoke test (no API calls). Requires the dev server: npx vite --port 5010 --strictPort
// Usage: node scripts/smoke-ui.mjs [baseUrl]
// Loads the app in 3-wave mode and in the three Survey 4 states (empty sheet, early, past the flip), clicks through every tab,
// fails on any console error / uncaught exception, and asserts key text per mode.
import puppeteer from 'puppeteer';

const base = process.argv[2] ?? 'http://localhost:5010';
let failures = 0;
const ok = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) failures++; };

async function run(mode, url, expects, absent) {
  console.log(`\n[${mode}] ${url}`);
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('console.error: ' + m.text()); });
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
  await page.waitForFunction(() => !document.body.innerText.includes('Loading survey data'), { timeout: 30000 });
  const texts = {};
  const tabs = ['The Story', 'The Numbers', 'The Team', "What's Next", 'The Playbook'];
  for (const tab of tabs) {
    const btn = (await page.evaluateHandle((t) => [...document.querySelectorAll('button')].find(b => b.innerText.trim() === t), tab)).asElement();
    if (btn) { await btn.click(); await new Promise(r => setTimeout(r, 700)); }
    if (tab === 'The Numbers') {
      texts['numbers:overview'] = await page.evaluate(() => document.body.innerText);
      // click every numbers sub-tab too
      const subs = await page.evaluate(() => [...document.querySelectorAll('button')].map(b => b.innerText.trim()).filter(t => /^Survey \d/.test(t.split('\n')[0])));
      for (const s of subs) {
        const sb = (await page.evaluateHandle((t) => [...document.querySelectorAll('button')].find(b => b.innerText.trim().split('\n')[0] === t.split('\n')[0]), s)).asElement();
        if (sb) { await sb.click(); await new Promise(r => setTimeout(r, 600)); texts[`numbers:${s.split('\n')[0]}`] = await page.evaluate(() => document.body.innerText); }
      }
    }
    texts[tab] = await page.evaluate(() => document.body.innerText);
  }
  // innerText reflects CSS text-transform (many labels render uppercase), so compare case-insensitively
  const allRaw = Object.values(texts).join('\n');
  const all = allRaw.toLowerCase();
  for (const e of expects) ok(all.includes(e.toLowerCase()), `text present: "${e}"`);
  for (const a of absent ?? []) ok(!allRaw.includes(a), `text absent (case-sensitive): "${a}"`);
  // Known baseline (pre-dates this work): framer-motion SVG attributes on the bell curve log
  // "Expected length/moveto ... undefined" on the first animation frame. Everything else fails the run.
  const BASELINE = /<(rect|path|line)> attribute (width|d|x1|x2|height|x): Expected/;
  const real = errors.filter(e => !BASELINE.test(e));
  ok(real.length === 0, `no console errors / exceptions beyond the known SVG baseline (${real.length} real, ${errors.length - real.length} baseline)`);
  real.slice(0, 8).forEach(e => console.log('       ' + e.slice(0, 200)));
  await browser.close();
  return texts;
}

await run('3 waves', `${base}/`,
  ['Three Waves, One Story', 'January 2025 to March 2026', 'Survey 3', 'By March 2026, daily usage reached 90%', '14-Month Trend', 'Adoption Scorecard — Survey 3 Snapshot', 'Leadership Vault'],
  ['Survey 4', 'Four Waves', 'NaN', 'undefined']);

// Monday morning: sheet linked and published, zero responses. Wave 4 is announced, nothing is counted.
await run('S4 empty (linked, 0 responses)', `${base}/?s4=empty`,
  ['Survey 4 opens Sep 14', 'Survey 4 opens Monday, September 14', 'switches to live Wave 4 numbers at 30 responses', 'Adoption Scorecard — Survey 3 Snapshot', 'Leadership Vault'],
  ['Now · W4', 'NaN', 'undefined']);

// First hours: responses landing, below the headline flip. Wave 4 shows everywhere with "so far", Wave 3 stays the headline
// (so the trend badge still reads 14-Month and the scorecard is still the Survey 3 snapshot; both flip at LIVE_MIN_N).
const e = await run('S4 early (14 responses, below the flip)', `${base}/?s4=early`,
  ['Four Waves, One Story', 'January 2025 to September 2026', 'The Team Sport', 'Survey 4 is in the field, 14 responses', 'Survey 4 live · 14 responses so far', '14-Month Trend', 'Adoption Scorecard — Survey 3 Snapshot', 'Building With AI', 'AI on Your Team', 'Human Contributions', 'In Their Words', 'switches to live Wave 4 numbers at 30 responses', 'Leadership Vault'],
  ['Now · W4', 'NaN', 'undefined']);
const earlyTab = (e['numbers:Survey 4'] ?? '').toLowerCase();
ok(earlyTab.includes('14 responses so far') && earlyTab.includes('live · in the field'), 'Survey 4 snapshot tab renders with live badge (early)');

// Past the flip: Wave 4 is the headline everywhere.
const t = await run('S4 sample (36 responses, past the flip)', `${base}/?s4=sample`,
  ['Four Waves, One Story', 'January 2025 to September 2026', 'The Team Sport', 'Survey 4 is in the field, 36 responses', 'Survey 4 live · 36 responses so far', '20-Month Trend', 'Adoption Scorecard — Survey 4 Snapshot', 'Building With AI', 'AI on Your Team', 'Human Contributions', 'In Their Words', 'Now · W4', 'From individual fluency to a team sport', 'Survey 4 is at', 'Leadership Vault'],
  ['NaN', 'undefined']);
const s4tab = (t['numbers:Survey 4'] ?? '').toLowerCase();
ok(s4tab.includes('36 responses so far') && s4tab.includes('live · in the field'), 'Survey 4 snapshot tab renders with live badge (solid)');

console.log(`\n${failures ? failures + ' UI CHECK(S) FAILED' : 'ALL UI CHECKS PASSED'}\n`);
process.exit(failures ? 1 : 0);
