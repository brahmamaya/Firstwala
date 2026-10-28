# Working agreements for this repository (Physica)

Read `docs/DEFINITION-OF-DONE.md` before and after **every** task. For any change, think about *all* of: security, privacy/law
(India: DPDP Act 2023, IT Act, CERT-In; audience mostly students 15-18), accessibility, speed on slow phones, reliability/incident
readiness, tests, docs. Do not optimise one at the expense of another; if there is a conflict, say so.

## Owner's credit rule (always)
- Work ONLY on the files the task names. Do not scan the whole repo, re-read whole conversations or unrelated files; open only what the task needs (use grep for a symbol, read only the needed lines). Scanning wastes the owner's credits.
- Do only what is asked: no extra audits, extra refactors or extra checks. Merge finished work to main without asking; do not repeat explanations or the same check twice.
- PYQ imports from the owner's PDFs: use the low-credit method in `docs/PYQ-INGEST.md` (`tools/pyq-ingest/ingest.js prep` -> crops + draft keys, cheap agents per batch of crops, `assemble`, `check`). Do not read whole PDF pages with a model.
- PYQ imports from the owner's PDFs (`rank-pyq-*.js`): include EVERY question, including diagram questions (draw an original `fig`, never copy the publisher's art), match-the-column, paragraph and tail questions. Never skip a question because it is hard or the key looks wrong: add it with the answer you establish by solving, put a short 'Note:' in its solution, and tell the owner in the report. Finish by counting PDF questions against entries (target: zero missing).
- Credit saving is a standing target (about half the credits per task, same quality): read `docs/CREDIT-SAVING.md`. Use `node tools/ship.js check|commit|sync|after-merge` for the repeated chores, quiet output, one build/check/e2e at the end, subagents on `sonnet`. If a kind of task repeats and has no tool, build a tested tool first. Tell the owner when part of a task is better done in ChatGPT (drafts of long text, brainstorming).
- Code you write: short, using the newest built-ins of Node 22 and Python 3.13 and no new dependencies (list in `docs/CREDIT-SAVING.md`).
- Learn from every job: when a tool, an agent or the method misbehaves, fix the tool, add a regression test, and add one line to `docs/LESSONS.md` (read the relevant lines before a task of that kind). Never repeat a mistake that is already in that file.
- Pending work list: `docs/NEXT-WORK.md` (when the owner says "NEXT-WORK.md ka kaam shuru karo", start it at once, no explanation).

## Map
- `index.html`, `*.js` sources, `tools/build.js`: static lab. Build with `ESBUILD=<esbuild 0.24.2> node tools/build.js` (that version reproduces the committed minified files byte-for-byte).
- `series.js` (+ `series-loader.js`) -> `physica-series.min.js`: Test Series UI. Never use `innerHTML`; build DOM with `textContent`/`createElement`.
- `ga.js`: Google Analytics in 3 modes: STANDARD (default, owner's decision to see visits / new users / daily users: GA first-party cookie, 90-day expiry, signals and ad personalisation off, page/simulation views only, nothing while the Test Series is open, off on DNT/GPC), NO COOKIES (page views only, random ID per load) and OFF. Never add custom events, ads features or personal data; keep the privacy page text in sync with ga.js. Owner was told about the DPDP s.9 risk for minors and chose STANDARD; a lawyer should review. `stats.js` (GoatCounter) is inactive until its site code is set.
- No backend: Physica is static (GitHub Pages). Test Series runs on the student's device from public JSON in `tests/` (free tests 1-3 only; see `docs/CONTENT-GUIDE.md`). Exam patterns: `tools/patterns.json`. Content tool: `tools/series-import.js`. Browser e2e: `tools/e2e/`. `docs/`: security, content guide, private files.
- Test Series files: `series.js` (hub, login, results) + `series-exam.js` (the exam screen, loaded only when a test starts) + `series-loader.js` (entry points: Rank-mode pills, landing notice).
- `tools/qgen/` + `qbank/`: generated practice-question bank (templates with independent verification; see `docs/QBANK.md`). Rank mode shows a Question bank tab for chapters in `qbank/index.json`.
- SEO: `tools/seo.js` + `tools/seo-pages.js` generate sim pages, hub pages, JEE chapter pages and the sitemap; run them after adding a simulation or a Rank chapter, then `tools/seo.test.js` (see `docs/SEO.md`).
- `tools/watchdog.js`: live-site integrity monitor. `tools/perf-budget.js`: size budget. `tools/secret-guard.js`: blocks secrets.

## Commands that must pass before pushing
```
node tools/series-import.test.js            # content tool
node tools/watchdog.test.js                 # watchdog catches tamper/outage
node tools/pyq-ingest/ingest.test.js     # PDF import tool (needs Chromium: NODE_PATH=/tmp/nm CHROMIUM=/opt/pw-browsers/chromium PW=playwright-core)
node tools/qgen/verify.test.js; node tools/qgen/verify.js   # question generator: verifier test + all generated questions + qbank/ is up to date (regenerate: node tools/qgen/build.js)
node tools/perf-budget.js                   # gzip size budgets
node tools/private-guard.js                 # nothing private tracked
node tools/security-guard.js --self && node tools/security-guard.js   # CSP on every page, no HTML sinks, safe workflows, no key files
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
