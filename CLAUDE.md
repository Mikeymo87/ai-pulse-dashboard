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

### 🔲 Phase 3 — Trend Line Charts (NEXT UP)
Build `src/components/TrendCharts.jsx` and add to `App.jsx` after `<GrowthStory />`.
Full spec in master plan. 4 charts in a 2×2 grid:
1. Sentiment Shift — LineChart (Positive=bh-green, Mixed=yellow, Negative=coral)
2. AI Familiarity — AreaChart gradient turquoise, Y-axis 1–5
3. Frequency of Use — LineChart (Daily %=mint solid, Never %=coral dashed)
4. Importance to Role — AreaChart gradient bh-green, Y-axis 1–5
Section id="trends", tag "14-MONTH TREND", H2 "The Trend Lines Tell the Story"

### 🔲 Phase 4 — Opportunity Spotlight (Claude API)
### 🔲 Phase 5 — Scatter Plot + Deep Dive
### 🔲 Phase 6 — Tool Ecosystem Bubble Chart
### 🔲 Phase 7 — Claude Chat Panel (Claude API)
### 🔲 Phase 8 — Presentation Mode + Deploy

## To Continue
Say: **"Continue the build — pick up where we left off"**
