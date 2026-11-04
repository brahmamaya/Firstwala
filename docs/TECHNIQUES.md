# Techniques that worked (read this first in a new session; short on purpose)

## Working with the owner
- Replies: Hinglish, point form, short. All website text: English only. Merge finished work to main without asking. Say plainly what was NOT tested.
- Save credits: sonnet agents (opus only for chemistry structures), 3-5 at a time, one build/check/e2e at the end, `node tools/ship.js build|check [--e2e]|commit`.

## Git / merge routine (squash merges make the stop hook lie)
1. `git fetch origin main && git checkout -B ccr-28bb352c-9s4xnw origin/main` before new work.
2. `node tools/ship.js commit "msg"`, then `git merge -s ours "$(git ls-remote origin <branch>|cut -f1)"`, `git push -u origin <branch>`, create PR, squash merge. If "merge conflicts": merge origin/main, `git checkout --ours` the generated files (min.js, index.html, LESSONS), rebuild, push.
3. The stop hook's "N unpushed commits" after a squash merge is a false alarm: compare `git ls-remote` with `git rev-parse HEAD`. Untracked/uncommitted files ARE real: commit them.
4. Force pushes are blocked; settings files need explicit permission.

## PYQ import (docs/PYQ-INGEST.md has the commands)
- Text PDF: `ingest.js prep` -> batches -> agents -> `assemble` -> `check`.
- Image-only PDF (NEET 2026): pages as JPEG, one agent per ~6 pages (`NEET-AGENT-PROMPT.md`), overlap pages = free cross-check, then BLIND verifier agents for text and for figures. They found real errors (Q61 cis/trans swapped, stray bracket, a missed solution figure). Always verify; first-pass agents are not enough.
- Word file with text: `docx-ingest.js` (cheapest, no model reads pages). Solutions are always rewritten in new words (copyright); the assembler refuses `raw`.
- Diagrams: `PhysicaFig` specs (lines, paths, circles, boxes, text) drawn by agents, rendered with `fig-sheet.js`, compared with the page by a second agent. Options that are drawings: all four in one figure labelled (1)-(4).
- Printed answers are kept as printed ("No option is correct", "*"); a contradiction is a `Note:` line, never a silent change.

## Rank mode (NEET)
- Chapter key `Subject: Chapter`; one lazy file per chapter; year bundles `physica-neetyear-<year>.min.js` built for the "Previous year papers" button; PDF (A4, black on white, Arial, 1x JPEG pages) and Word (.docx, no library) from `rank-export.js` `makePaper` / `makeDocx`.
- Size budget: `tools/perf-budget.js` (rank bundle budget was raised deliberately; styles.min.css is tight: reuse existing classes instead of adding CSS).

## Testing tips
- Playwright cannot click an element that animates forever: use `{force:true}` or `$eval(e=>e.click())`. A modal that stays open blocks clicks.
- Layout in 2D simulations: safe canvas area is about x<=660, y>=75; check with `tools/e2e/shot.js`.
- Export speed: measure first. Drawing ~25 ms/page, JPEG encoding ~260 ms/page (worker pool now). No promise of speed without a measurement.
- Round-trip tests are strong: our own Word download read back by `docx-ingest.js` gave 180/180 identical.

## Security alerts (CodeQL on every PR; read the PR review comments with `pull_request_read get_review_comments`)
- Test/dev servers: `path.resolve(root,'.'+url)` and refuse paths outside root. Temp files: `fs.mkdtempSync` folder, never a fixed name in /tmp. No check-then-read (`existsSync` then `readFileSync`): read and catch ENOENT. Workers: check `e.origin` (empty or our origin) in `onmessage`.

## Privacy / legal (never invent facts)
- ga.js: STANDARD by default, `anonymize_ip: true`, privacy.html section 6 lists exactly what Google Analytics receives; keep both in sync. Owner has no lawyer: legal text is unreviewed, say so.
