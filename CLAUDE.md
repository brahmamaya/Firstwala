# Working agreements for this repository (Physica)

Read `docs/DEFINITION-OF-DONE.md` before and after **every** task. For any change, think about *all* of: security, privacy/law
(India: DPDP Act 2023, IT Act, CERT-In; audience mostly students 15-18), accessibility, speed on slow phones, reliability/incident
readiness, tests, docs. Do not optimise one at the expense of another; if there is a conflict, say so.

## Owner's credit rule (always)
- Work ONLY on the files the task names. Do not scan the whole repo, re-read whole conversations or unrelated files; open only what the task needs (use grep for a symbol, read only the needed lines). Scanning wastes the owner's credits.
- Do only what is asked: no extra audits, extra refactors or extra checks. Merge finished work to main without asking; do not repeat explanations or the same check twice.
- Pending work list: `docs/NEXT-WORK.md` (when the owner says "NEXT-WORK.md ka kaam shuru karo", start it at once, no explanation).

## Map
- `index.html`, `*.js` sources, `tools/build.js`: static lab. Build with `ESBUILD=<esbuild 0.24.2> node tools/build.js` (that version reproduces the committed minified files byte-for-byte).
- `series.js` (+ `series-loader.js`) -> `physica-series.min.js`: Test Series UI. Never use `innerHTML`; build DOM with `textContent`/`createElement`.
- `ga.js`: Google Analytics in 3 modes: BASIC (default, owner's decision: page/simulation views only, no cookie, random ID per page load, signals/ads off, nothing while the Test Series is open, off on DNT/GPC), FULL (cookies, opt-in, 18+ only) and OFF. Never add cookies, lasting IDs, custom events or personal data for minors; keep the privacy page text in sync with ga.js. `stats.js` (GoatCounter) is inactive until its site code is set.
- No backend: Physica is static (GitHub Pages). Test Series runs on the student's device from public JSON in `tests/` (free tests 1-3 only; see `docs/CONTENT-GUIDE.md`). Exam patterns: `tools/patterns.json`. Content tool: `tools/series-import.js`. Browser e2e: `tools/e2e/`. `docs/`: security, content guide, private files.
- Test Series files: `series.js` (hub, login, results) + `series-exam.js` (the exam screen, loaded only when a test starts) + `series-loader.js` (entry points: Rank-mode pills, landing notice).
- `tools/watchdog.js`: live-site integrity monitor. `tools/perf-budget.js`: size budget. `tools/secret-guard.js`: blocks secrets.

## Commands that must pass before pushing
```
node tools/series-import.test.js            # content tool
node tools/watchdog.test.js                 # watchdog catches tamper/outage
node tools/perf-budget.js                   # gzip size budgets
node tools/private-guard.js                 # nothing private tracked
node -e "require('./tools/secret-guard.js')('.')"
```
Browser e2e + axe + phone (~60 checks, ~3 min): `cd tools/e2e && npm i && node e2e.js` (needs Chromium).

## Design rules for the Test Series
- Real-exam feel first: Save & Next semantics, 5-status palette, subject/section tabs, instructions page, submit summary. Keep the exam chunk small (see `tools/perf-budget.js`).
- No server, so everything in `tests/` is public: only free tests 1-3 may be published (the tool enforces it); the answer file is fetched only after submit.
- Results live only in the student's localStorage; never add a network call that sends student data anywhere.

## Hard rules
- Never commit a token or key. Never commit private question banks (`content/`).
- The answer file of a test is not requested before submission.
- Legal pages: never invent legal facts (names, addresses, cities); a lawyer should review them before launch.
- Do not claim a thing was tested unless it was run. Report failures plainly.
