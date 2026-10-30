# NEXT WORK (do in this order; no explanation needed, just execute)

Owner rules: merge to main without asking, in batches of 10 sims. After each batch: screenshot check, phone-fps check, PR, squash merge. Commit after every finished sim. Never edit physica3d.js, biokit.js, labkit.js. No new libraries. Do not touch physics, Rank, Test Series unless the task says so.

## Setup (container is fresh each time)
1. `cd /home/user/firstwala`, work on branch `ccr-28bb352c-9s4xnw`: `git fetch origin main && git checkout -B ccr-28bb352c-9s4xnw origin/main`.
2. esbuild 0.24.2: `mkdir -p /tmp/claude-0/esb/v0.24.2 && cd /tmp/claude-0/esb/v0.24.2 && npm i esbuild@0.24.2`; build = `ESBUILD=/tmp/claude-0/esb/v0.24.2/node_modules/.bin/esbuild node tools/build.js`.
3. Playwright: `ln -sfn /opt/node22/lib/node_modules/playwright /tmp/nm/playwright-core` (mkdir /tmp/nm first); env for tools: `NODE_PATH=/tmp/nm CHROMIUM=/opt/pw-browsers/chromium`.
4. Screenshot: `PORT=<free> node tools/e2e/shot.js <outDir> id1,id2 ultra` (also `2d`), then view the PNG. Smoke: `MODES=2d,ultra PORT=<free> IDS=id1,id2 node tools/e2e/lab-smoke.js "" bio-` (or `chem-`).
5. Phone fps check: Playwright context `{viewport:{width:390,height:800},hasTouch:true,isMobile:true,deviceScaleFactor:3}`, CDP `Emulation.setCPUThrottlingRate` rate 4, open the sim (`click text=Simulations`, `click text=Voice tutor, demos and quiz`, `location.hash='#<id>'`), measure rAF fps over 2 s. Must be >= 55.
6. Merge flow: build, `node tools/perf-budget.js` (0 FAIL), `git add -A . ':!.claude'`, commit, `git fetch origin main && git merge origin/main`, on conflicts in index.html / *.min.js run `git checkout --ours <files>` then rebuild and commit, push, create PR to main, squash merge. The stop hook's "unpushed commits" warning is a stale ref, ignore it.
7. Spawn at most 2 agents at a time (isolation worktree), each told first to `git fetch origin main && git merge --ff-only origin/main`, to commit after EACH sim, and to LOOK at screenshots before and after.
8. SEO pages: after adding or renaming a sim (and after the build) run `NODE_PATH=/tmp/nm CHROMIUM=/opt/pw-browsers/chromium node tools/seo.js` and commit `sim/` and `sitemap.xml` (add `--og` only to redraw `og.png`). It reads the sims from the built site; `node tools/seo.test.js` checks the result.

## A/B. Visuals: remaining sims (all others are DONE and merged)
- Chemistry: all 50 done.
- Biology: 5 left to redo (flat ecology/biotech diagrams, same style as bio-predator-prey / bio-energy-pyramid): bio-latitudinal-gradient, bio-bt-cotton, bio-insulin-rdna, bio-cockroach (skip if it needs a full organ-coordinate rebuild), bio-genetic-drift (judged decent; only if clearly crude). Also 15 biology sims were judged fine and skipped (see git log), and bio-fluid-mosaic etc. are done.
- Per sim: BEFORE screenshot, iterate, commit after each, lab-smoke for the ids, then merge flow above.

## C. 2D mode of bio/chem sims
For every redesigned sim, open `2d` screenshot; if the model is small, side-on or flat, fix the default 2D camera/yaw/scale in that sim so it is front-facing and fills the stage (edit only the sim's own file).

## D. Audit leftovers
- Audit and fix the 15 biology sims never audited: bio-five-kingdoms, bio-bacterial-growth, bio-bacteriophage, the two microbes-in-human-welfare sims, the ecology sims in bio5.js (write findings into docs/audit-botany.md or docs/audit-zoology.md, fix high/medium).
- Botany low-severity items: see docs/audit-botany.md. Zoology low-severity items: see docs/audit-zoology.md.
- Skip anything marked FLAG FOR REVIEW (needs a subject teacher): chem-sn1-sn2 relative rates, chem-dipole-moment NF3 arrow, chem-phenol-acidity picric acid pKa.
- Check bio-meiosis Kekulé-view and chem-benzene-resonance Kekulé view visually.

## E. Rank formula diagrams
~262 of 335 formulas have no figure. Add figures in rank-figs.js (SVG via createElementNS only, never innerHTML) for the remaining geometry/graph formulas, chapter by chapter; verify in Rank mode Formulas tab, dark and light theme; keep rank bundle growth small (consider per-chapter lazy loading of figures if it exceeds +25 KB gzip). Verify the hemispherical-shell fact in electrostatics (E = sigma/(4 eps0) at centre of the flat face, V = kQ/R).

## F. Test Series content (only when the owner supplies/approves)
JEE Main and JEE Advanced Test 1, NEET/JEE Tests 2 and 3: original questions only (never copy coaching papers), `content/` is private, run `node tools/series-import.js check content` then `static content`; follow docs/CONTENT-GUIDE.md.

## G. Blocked on owner (do not start)
- Jan/April 2026 JEE Main and NEET PYQs: needs the paper text and the right to use it from the owner.
- Legal review of privacy.html / terms.html by a lawyer.
- Custom domain physica.in: owner sets it in repo Settings -> Pages.
- Chemistry, Botany and Zoology PYQs are coming soon (owner, 2026-10-30): same method (docs/PYQ-INGEST.md, PYQs only, stub chapter file unless the owner asks for content); they need the Rank mode subject and chapter lists extended first (Botany/Zoology are NEET subjects). The promo poster says 'jaldi' for them; update it when they are live.
