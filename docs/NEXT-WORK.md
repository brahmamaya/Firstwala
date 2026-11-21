# NEXT WORK (do in this order; no explanation needed, just execute)

Owner rules: merge to main without asking, in batches of 10 sims. After each batch: screenshot check, phone-fps check, PR, squash merge. Commit after every finished sim. Never edit physica3d.js, biokit.js, labkit.js. No new libraries. Do not touch physics, Rank, Test Series unless the task says so.

## Setup (container is fresh each time)
1. `cd /home/user/firstwala`, work on branch `ccr-28bb352c-9s4xnw`: `git fetch origin main && git checkout -B ccr-28bb352c-9s4xnw origin/main`.
2. esbuild 0.24.2: `mkdir -p /tmp/esb/v0.24.2 && cd /tmp/esb/v0.24.2 && npm i esbuild@0.24.2`; build = `ESBUILD=/tmp/esb/v0.24.2/node_modules/.bin/esbuild node tools/build.js`.
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

- NEET (done 2026-11-04): Rank mode -> NEET has Physics, Chemistry, Botany, Zoology with NCERT chapters (`tools/pyq-ingest/neet-chapters.json`); NEET 2026 (21 Jun re-exam) is in 73 chapter files `rank-pyq-neet-*`. Next NEET years: follow docs/PYQ-INGEST.md (NEET section), same chapter files, no UI work. Chapter content (Guide, Formulas, Revise, mock) for NEET chapters is NOT written (owner's rule). Botany/Zoology split of mixed Biology questions was decided by content: owner may reassign.

## NEET 2019 and older (owner: when he says "2019 ka kaam karo", start at once, no explanation)
- Source: one PDF with several papers: /root/.claude/uploads/b34dc11d-6edd-5769-91fe-4c8d33dce462/bad2cca0-Neet_2023-2016.pdf (567 pages; ask the owner to re-upload if the file is gone). Done and merged: all NEET papers 2016-2023 (both AIPMT 2016 sets as codes 2016 and 2016b). Nothing left of this PDF. Old list: 2016 AIPMT 1 May (449-509, 180 q), 2016 AIPMT 24 Jul (510-567, 180 q; needs year codes 2016 and 2016b, labels and pills like 2022r in rank-neet.js / rank-export.js / tools/e2e/neet-pyq.js pill count).
- Method (docs/PYQ-INGEST.md text-layer paragraph; tools/pyq-ingest/CP-AGENT-PROMPT.md): `careerpoint-prep.js <pdf> content/pyq-work/neet<year> <first> <last> --batch 25` (drafts exist for all, but work dirs are git-ignored: re-run prep) -> page images `pdftoppm -r 110 -jpeg -f F -l L <pdf> pages/p` then rename p-NNN.jpg to pNNN.jpg -> one sonnet agent, two 25-question batches at a time -> `textcheck.js --min 0.85 --pages F L` -> figure agent (NEET-FIG-PROMPT.md, Textbook look + Book polish) -> text+figure verifier agents on the flagged list -> `neet-assemble.js content/pyq-work/neet<year> "<label>" <code> <n> --write` -> `ESBUILD=/tmp/esb/v0.24.2/node_modules/.bin/esbuild node tools/ship.js build` -> `ship.js check --e2e` -> download-PDF smoke test -> commit, merge main, take ours for generated files, grep for conflict markers, push, PR, squash merge.

## JEE Main PYQ queue (owner, order matters; "no compromise": book-like diagrams, exact equations, clear solutions with diagrams where they help; merge without asking)
1. Current Electricity: /root/.claude/uploads/b34dc11d-6edd-5769-91fe-4c8d33dce462/f81490ba-Currenttt.pdf (68 pp, OCR text layer; `ingest.js prep` found 416 questions, answer section from p37). Add a rank-pyq-ce.js (global PhysicaRankPyqCe) and set `q:'PhysicaRankPyqCe'` in the CHAPS entry 'Current Electricity' in rank-neet.js; follow docs/PYQ-INGEST.md (prep -> batches -> agents -> assemble -> check) and the em/es files as the model.
2. Magnetic Effects of Current and Magnetism: /root/.claude/uploads/b34dc11d-6edd-5769-91fe-4c8d33dce462/d036a031-Magnetic_effect_of_current_and_magnetism_jee_mains_pyqs.pdf (67 pp). Same method; global PhysicaRankPyqMag.

## Current Electricity (JEE Main) PAUSED by owner until he says "continue" (state 2026-11-12)
- Writing is DONE: content/pyq-work/Currenttt/ (git-ignored, local only) has entries-01..36.jsonl (430 questions incl. gaps Q174 [stem cut in the book: add with Note, original wording "voltmeter of resistance 400 Ω ... across each resistor", gives 40 V = option b] and Q258 [circuit figure not printed in the book: keep as gap, tell owner]) and figs-01..36.json (fig/sfig specs). Duplicate Q73 already removed from entries-06.
- Code (NOT merged; the patch is saved as docs/rank-neet-ce.patch.txt, apply with git apply): rank-neet.js needs the TN topic labels (cdrf, cres, ccmb, ccel, ckir, cpot, cheat, crc) and CHAPS q:'PhysicaRankPyqCe'. Still to do: create rank-pyq-ce.js with `node tools/pyq-ingest/ingest.js assemble content/pyq-work/Currenttt rank-pyq-ce.js PhysicaRankPyqCe` (figs must be merged into the entries first: entry.fig = figs-NN[pn].fig, entry.sfig likewise), then build, ship.js check --e2e, merge.
- Verification (prompt /tmp/ce-ver.txt; recreate if /tmp is gone): 5 verifier agents (pn 1-40, 41-80, 81-120, 121-160, 161-200 ...) did NOT finish (usage limit). Things to settle: Q1 (no key, working 2.5 Ω), Q18, Q148/Q150/Q152, Q196, Q212, Q219, Q238, Q265, Q286 (agent working differs from printed key), Q292 (key 160 Ω vs working 10 Ω), Q313, Q324, Q380 (no option fits, a-form), Q383/Q385 (10.04 vs 10.4 V), cell polarities chosen to match the key (Q169, 182, 184, 186, 187, 194, 201, 203-205, 211, 216, 236, 237, 242, 244, 250, 251, 255, 259, 262): re-read at 220-400 dpi from /tmp/Currenttt.pdf (original: /root/.claude/uploads/b34dc11d-6edd-5769-91fe-4c8d33dce462/f81490ba-Currenttt.pdf).
- Wave interference lab (waves2d.js, sim id wave-interference): whole-stage 2D lab with two lasers, probes + E(t) graph, tape, screen intensity; more media (water, sound) and slits could be added later.
- Young's double slit (youngs2d.js, sim id doubleslit) rebuilt as a whole-stage 2D lab; shared wave helpers live in wavekit.js (used by waves2d.js too).
- Labs 2026-11-14: Young's double slit has views Before / After / One slit / Realistic + a 3D Ultra-Realistic bench scene; well pulley has a boy or girl with a name board (tap to rename); Hide info works in all four wave/pulley labs; incline pulley is back in the lab list (removed from DROP in app.js).
- JEE Current Electricity (430 q, rank-pyq-ce.js) merged 2026-11-14. Next in queue: Magnetic Effects PDF (see queue above). Perf budget for physica-pyq-ce.min.js is 215000.
