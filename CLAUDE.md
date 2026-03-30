# AI Pulse Survey Dashboard — Claude Code Session File

> This file auto-loads at the start of every Claude Code session when opened from this folder.
> Full master plan lives at: /Users/michaelmora/Desktop/Claude/AI Pulse Survey Dashboard Plan.md
> Keep BOTH files updated at the end of every phase.

---

## Project Summary
Dashboard showing 14 months of AI adoption data across 3 pulse surveys (290 responses) for the Baptist Health Marketing & Communications department. Built in React + Vite, deployed via GitHub → Replit.

- **User:** Michael Mora — not a coder; plain English only
- **GitHub:** https://github.com/Mikeymo87/ai-pulse-dashboard
- **Project folder:** `/Users/michaelmora/Desktop/Claude/ai-pulse-dashboard/`
- **Survey CSVs:** `public/data/survey1.csv` (97), `survey2.csv` (106), `survey3.csv` (89 as of Mar 30 2026)
- **⚠️ Survey 3 is still in progress** — replace CSV when final version is ready; no code changes needed

## Tech Stack
React + Vite · Tailwind CSS · Recharts · Framer Motion · Papa Parse · Claude API (claude-sonnet-4-6)

## Current Phase Status

### ✅ Phase 0 — Setup (COMPLETE)
GitHub repo created, React app scaffolded, all dependencies installed, CSVs copied to `public/data/`, pushed to GitHub, imported into Replit.

### ✅ Phase 1 — Data Layer (COMPLETE)
Files built: `src/data/parseCSVs.js`, `src/data/transforms.js`, `src/data/themes.js`, `src/hooks/useSurveyData.js`

Critical implementation notes:
- S3 struggle column uses curly apostrophe `\u2019` (Google Forms export) — must keep exact string in mapS3
- Barriers use 3-pass fuzzy matching (exact → prefix → keyword) so S1/S2/S3 wording variants all map correctly
- All blank responses excluded per-field from averages/distributions — no skew
- Confidence scale differs: S1 max=5 "Very Confident", S2+S3 max=5 "Extremely Confident" (Very=4)
- Open-ended text preserved on every row for Claude API (Phases 4+7)
- `useSurveyData()` returns `{ surveys, transforms, loading, error }`
- Verified: S1=97 · S2=106 · S3=89 · Total=292

### ✅ Phase 2 — Hero + Growth Story (COMPLETE)
Files: `src/components/Hero.jsx`, `src/components/GrowthStory.jsx`, `src/components/Nav.jsx`

Key details:
- Hero: pulsing BH-green ambient glow, staggered headline animation, 3 animated count-up stat cards, 3-paragraph politician-style exec summary with dynamic own-pocket (coral) + benefit data
- GrowthStory: cinematic 3-wave scroll, 44px/900-weight number stat pills, inline delta badges (% not pp), Wave 3 gets 2 extra pills — "Paying Own Pocket" (coral) + "See Momentum Accelerating" (mint)
- Nav: sticky top nav with section anchor links
- index.css: BH brand CSS variables added under `:root`, background `#1a1d1e`
- Color rule enforced: coral = negative/warning ONLY, yellow = stable, green/mint = positive, turquoise = neutral

### ✅ Phase 3 — Trend Line Charts (COMPLETE)
Files: `src/components/TrendCharts.jsx`, `src/data/parseCSVs.js`

- 7 charts: Sentiment, Familiarity, Frequency, Importance, Confidence, Journey Stage, Top 5 Barriers
- Custom two-line XAxis tick: "Survey N" bold + "(date)" gray; `interval={0}` forces all 3 labels
- Auto-padded Y-axis via `autoDomain(values, pad, clampMin, clampMax)` helper
- All 7 insight callouts are fully data-driven (live % from transforms, not hardcoded)
- Barrier normalization fixes: curly apostrophe `\u2019` bug on "Not relevant"; 12+ new write-in keywords; filter "No barriers" from chart; sort by S3 % descending
- `barSize={10}`, `barCategoryGap="25%"`, height 360px on horizontal barriers chart
- Stage chart uses `barriersTrend` filtered to actual blockers only

### ✅ Phase 4 — Opportunity Spotlight (Claude API, COMPLETE)
Files: `src/components/OpportunitySpotlight.jsx`, `src/App.jsx`

- Section id="spotlight", tag "AI-POWERED INSIGHTS", H2 "Where the Opportunity Lives"
- 4 Claude-generated cards in 2×2 grid — categories: ENABLEMENT, ADOPTION, RISK, MOMENTUM
- Each card: category badge, bold headline, 2–3 sentence insight body, → recommendation block, supporting stat
- Model: `claude-sonnet-4-6`, key: `import.meta.env.VITE_ANTHROPIC_API_KEY`
- Direct browser fetch to Anthropic API; header `anthropic-dangerous-direct-browser-access: true`
- Called once on mount via `useEffect([], [])` — result stored in `useState`, never re-called
- Prompt passes pre-computed stats JSON → Claude returns `[{category, headline, body, action, stat}]` × 4
- Response parsing strips markdown code fences before `JSON.parse()` — handles Claude wrapping output in ```json
- Loading state: 4 pulsing skeleton cards (Framer Motion opacity loop)
- Error state: single fallback card with retry message

### 🔲 Phase 5 — Scatter Plot + Deep Dive (NEXT UP)
### 🔲 Phase 6 — Tool Ecosystem Bubble Chart
### 🔲 Phase 7 — Claude Chat Panel (Claude API)
### 🔲 Phase 8 — Presentation Mode + Deploy

## To Continue
Say: **"Continue the build — pick up where we left off"**
