# Working agreements for this repository (Physica)

Read `docs/DEFINITION-OF-DONE.md` before and after **every** task. For any change, think about *all* of: security, privacy/law
(India: DPDP Act 2023, IT Act, CERT-In; audience mostly students 15-18), accessibility, speed on slow phones, reliability/incident
readiness, tests, docs. Do not optimise one at the expense of another; if there is a conflict, say so.

## Map
- `index.html`, `*.js` sources, `tools/build.js`: static lab. Build with `ESBUILD=<esbuild 0.24.2> node tools/build.js` (that version reproduces the committed minified files byte-for-byte).
- `series.js` (+ `series-loader.js`) -> `physica-series.min.js`: Test Series UI. Never use `innerHTML`; build DOM with `textContent`/`createElement`.
- `ga.js`: anonymous first-party counters + opt-in Google Analytics (18+). Never enable analytics for minors.
- `supabase/schema.sql`: the whole backend (RLS + RPC). `supabase/tests/`: security suite, stress/fuzz, load. `docs/`: security, incident response.
- `tools/watchdog.js`: live-site integrity monitor. `tools/perf-budget.js`: size budget. `tools/secret-guard.js`: blocks secrets.

## Commands that must pass before pushing
```
bash supabase/tests/run-local.sh            # ~170 DB security assertions
bash supabase/tests/stress/run.sh           # concurrency, lock race, fuzz, 300-student load
node tools/watchdog.test.js                 # watchdog catches tamper/outage
node tools/perf-budget.js                   # gzip size budgets
node -e "require('./tools/secret-guard.js')('.')"
```
Browser e2e + axe + speed: `cd supabase/tests/e2e && npm i && bash db.sh && node e2e.js`.

## Hard rules
- Never commit a Supabase `sb_secret_*` / `service_role` key or any token. Only the publishable key is public.
- Correct answers/solutions never reach the browser before submission. Admin power requires MFA (aal2).
- Keep `private.current_terms()` (SQL), `TERMS` (series.js) and the version line in `privacy.html` / `terms.html` identical.
- `[[PLACEHOLDER]]` text in legal pages must be filled by the owner and reviewed by a lawyer before launch; never invent legal facts.
- Do not claim a thing was tested unless it was run. Report failures plainly.
