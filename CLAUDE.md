# Working agreements for this repository (Physica)

Read `docs/DEFINITION-OF-DONE.md` before and after **every** task. For any change, think about *all* of: security, privacy/law
(India: DPDP Act 2023, IT Act, CERT-In; audience mostly students 15-18), accessibility, speed on slow phones, reliability/incident
readiness, tests, docs. Do not optimise one at the expense of another; if there is a conflict, say so.

## Map
- `index.html`, `*.js` sources, `tools/build.js`: static lab. Build with `ESBUILD=<esbuild 0.24.2> node tools/build.js` (that version reproduces the committed minified files byte-for-byte).
- `series.js` (+ `series-loader.js`) -> `physica-series.min.js`: Test Series UI. Never use `innerHTML`; build DOM with `textContent`/`createElement`.
- `ga.js`: anonymous first-party counters + opt-in Google Analytics (18+). Never enable analytics for minors.
- `supabase/schema.sql`: the whole backend (RLS + RPC). Exam patterns: `supabase/patterns.json`. Content tool: `tools/series-import.js`. `supabase/tests/`: security suite, stress/fuzz/load, browser e2e. `docs/`: security, incident response, content guide, cost/storage.
- Test Series files: `series.js` (hub, login, results) + `series-exam.js` (the exam screen, loaded only when a test starts) + `series-loader.js` (entry points: Rank-mode pills, landing notice).
- `tools/watchdog.js`: live-site integrity monitor. `tools/perf-budget.js`: size budget. `tools/secret-guard.js`: blocks secrets.

## Commands that must pass before pushing
```
bash supabase/tests/run-local.sh            # ~170 DB security assertions
bash supabase/tests/stress/run.sh           # concurrency, lock race, fuzz, 300-student load
node tools/watchdog.test.js                 # watchdog catches tamper/outage
node tools/perf-budget.js                   # gzip size budgets
node -e "require('./tools/secret-guard.js')('.')"
```
Browser e2e + axe + speed (~160 checks, ~4 min): `cd supabase/tests/e2e && npm i && bash db.sh && node e2e.js`.

## Design rules for the Test Series
- Real-exam feel first: Save & Next semantics, 5-status palette, subject/section tabs, instructions page, submit summary. Keep the exam chunk small (see `tools/perf-budget.js`).
- Cost/storage: one compact row per attempt; marks live in the exam pattern; no per-answer rows; batch saves. See `docs/COST-AND-STORAGE.md` before touching `attempts`.
- Free vs paid is derived from `series_no` (1-3 free). Never trust the screen for it: the server decides.

## Hard rules
- Never commit a Supabase `sb_secret_*` / `service_role` key or any token. Only the publishable key is public.
- Correct answers/solutions never reach the browser before submission. Admin power requires MFA (aal2).
- Keep `private.current_terms()` (SQL), `TERMS` (series.js) and the version line in `privacy.html` / `terms.html` identical.
- `[[PLACEHOLDER]]` text in legal pages must be filled by the owner and reviewed by a lawyer before launch; never invent legal facts.
- Do not claim a thing was tested unless it was run. Report failures plainly.
