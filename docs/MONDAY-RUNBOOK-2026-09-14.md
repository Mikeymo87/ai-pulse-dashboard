# Survey 4 go-live runbook, Monday September 14, 2026

Goal for the day: Mike shares the responses-sheet link, Claude wires it, Mike republishes, everyone watches the site fill in live. Everything else was done on Friday 9/11 (see "Verified Friday" at the bottom).

## Mike: create and publish the responses sheet (3 minutes, can be done before Monday)

1. Open the Wave 4 form editor: https://docs.google.com/forms/d/1pYw7vMWbdM55dFVjacgvzPYAWi0efppbIODZNc65Erk/edit
2. Responses tab, click the green Sheets icon ("Link to Sheets"), choose "Create a new spreadsheet", Create. The sheet opens with the header row already in place (Timestamp plus the 16 question titles), even with zero responses.
3. In that sheet: File, Share, Publish to web. In the first dropdown pick the responses tab (not "Entire document"), in the second pick "Comma-separated values (.csv)". Publish, confirm.
4. Copy the URL it shows (looks like `https://docs.google.com/spreadsheets/d/e/2PACX-.../pub?gid=...&single=true&output=csv`) and paste it to Claude.

Doing this Friday or over the weekend is better than Monday: Claude can run the header check against the real sheet with zero rows in it, and the only thing left for Monday is the republish.

## Claude: wire, verify, push (one command, about 4 minutes)

Skill: `ai-pulse-wave-golive` (auto-loads when the link is pasted). It runs:

    cd ~/Desktop/Claude/ai-pulse-dashboard && node scripts/go-live.mjs --s4-url=<the csv url>

which, in order: validates the link shape, fetches the sheet, checks every one of the 17 columns against the `S4_COLUMNS` contract (`src/data/parseCSVs.js`), counts rows (zero is fine before launch), writes `S4_URL`, runs `check-data`, runs `smoke-ui` in all four states, runs `vite build`, and prints the commit and Replit lines. It stops at the first problem and names the fix. `--dry-run` shows the header report without writing anything. Then Claude commits and pushes `src/data/parseCSVs.js`.

To watch responses land from the terminal after wiring: `node scripts/go-live.mjs --s4-url=<url> --skip-smoke --watch` (count every 60 seconds with the flip state).

## Mike: republish on Replit (2 minutes)

1. Open the Repl. In the Shell: `git fetch origin && git reset --hard origin/main` (if the Git pane shows a Pull button, that does the same).
2. Click Republish / Deploy. Wait for the deploy to finish, open the published URL.
3. Expected on day one: the hero pill reads "Survey 4 opens Sep 14" until the first response, then "Survey 4 live · n responses so far". Wave 4 shows everywhere with "so far" badges. The headline numbers, the trend badge and the scorecard stay on Wave 3 until 30 responses, then flip to Wave 4 automatically. No second republish is needed for the flip.

## How live is live

- Google republishes the CSV about every 5 minutes. The app re-fetches every 5 minutes while Survey 4 is configured, and on every page load. Tab state and the vault unlock survive a refresh.
- Below 30 responses: Wave 4 visible everywhere with "n so far", Wave 3 stays the headline (Dan's call 9/11, `LIVE_MIN_N = 30` in `src/data/transforms.js`).
- At 30 and beyond: headline numbers, scorecard, story beat, chat context and the What's Next scorecard all read Wave 4, and keep moving with every poll.

## If something looks wrong

- A column shows blank everywhere (a barrier, a ladder, the tools chart): Dan renamed a question title. Run `node scripts/check-data.mjs --s4-url=<url>`, it names the missing field. Fix the prefix in `S4_COLUMNS` and `mapS4`, push, republish.
- A new answer option lands under "Other": an option was added to Q8, Q9 or Q11 after Friday. Add its canonical label in `parseCSVs.js`.
- Site still shows three waves after the republish: the Repl did not pull the new commit (check `git log -1` in the Repl shell) or `S4_URL` is empty in the deployed build.
- Wording freeze: from the first response on, do not edit the checkbox questions (Q7, Q8, Q9, Q11). They match on exact option text.

## Verified Friday 9/11

- Form re-read in the responder view: 16 questions, all options match `AI Pulse Survey Data/Wave 4/WAVE4-QUESTIONS.md`.
- Sheet shape confirmed against the live Wave 2 and Wave 3 sheets: Timestamp plus question titles in form order. The Wave 4 sample header row equals the live form's titles, 17 columns.
- `check-data` green in four modes: solid sample (36 rows, headline = s4), early (14 rows, headline = s3), empty (header only, headline = s3), three waves.
- `smoke-ui` green in four states: 3 waves, empty, early, solid. `vite build` green.
- `scripts/go-live.mjs` dry-run green against the header-only and early samples; refuses editor links and local paths outside dry-run; wrote nothing.
- `LIVE_MIN_N = 30`.
