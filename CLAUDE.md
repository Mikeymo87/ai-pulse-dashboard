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
- **Survey CSVs:** `public/data/survey1.csv` (97), `survey2.csv` (106), `survey3.csv` (87)
- **⚠️ Survey 3 is still in progress** — replace CSV when final version is ready

## Tech Stack
React + Vite · Tailwind CSS · Recharts · Framer Motion · Papa Parse · Claude API (claude-sonnet-4-6)

## Current Phase Status

### ✅ Phase 0 — Setup (COMPLETE)
GitHub repo created, React app scaffolded, all dependencies installed, CSVs copied to `public/data/`, pushed to GitHub, imported into Replit.

### 🔲 Phase 1 — Data Layer (NEXT UP)
Create:
- `src/data/parseCSVs.js` — Papa Parse + normalization logic
- `src/data/transforms.js` — aggregate stats for all charts
- `src/hooks/useSurveyData.js` — React hook exposing clean data

Normalization rules:
- Confidence: map all surveys to 1–5 scale (S1: Very Confident=5, Confident=4, Somewhat confident=3, Not confident at all=2. S2+S3: Extremely Confident=5, Very Confident=4)
- Frequency: normalize to Daily / Weekly / Monthly / Rarely / Never
- Barriers: fuzzy-match reworded options to shared category names
- Multi-select fields: split comma-separated strings into arrays

Verify: console shows 97 / 106 / 87 responses and correct sample stats.

### 🔲 Phase 2 — Hero + Growth Story
### 🔲 Phase 3 — Trend Line Charts
### 🔲 Phase 4 — Opportunity Spotlight (Claude API)
### 🔲 Phase 5 — Scatter Plot + Deep Dive
### 🔲 Phase 6 — Tool Ecosystem Bubble Chart
### 🔲 Phase 7 — Claude Chat Panel (Claude API)
### 🔲 Phase 8 — Presentation Mode + Deploy

## To Continue
Say: **"Continue the build — pick up where we left off"**
