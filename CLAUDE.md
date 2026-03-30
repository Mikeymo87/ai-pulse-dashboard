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

### 🔲 Phase 2 — Hero + Growth Story (NEXT UP)
### 🔲 Phase 3 — Trend Line Charts
### 🔲 Phase 4 — Opportunity Spotlight (Claude API)
### 🔲 Phase 5 — Scatter Plot + Deep Dive
### 🔲 Phase 6 — Tool Ecosystem Bubble Chart
### 🔲 Phase 7 — Claude Chat Panel (Claude API)
### 🔲 Phase 8 — Presentation Mode + Deploy

## To Continue
Say: **"Continue the build — pick up where we left off"**
