# Lessons (the tools and the way of working improve from real jobs)

Rule: at the end of every task ask "did a tool, an agent or my own method misbehave?". If yes: (1) fix the tool so it cannot happen again, (2) add a regression test (or a check that prints a warning), (3) add one line here (date, what went wrong, what changed). At the start of a task of a known kind, grep this file for the keyword (pdf, agent, merge, bundle ...).

| Date | What went wrong | What changed |
|---|---|---|
| 2026-10-28 | PDF import: whole book read as pages by a model was the main credit cost | `tools/pyq-ingest/`: code finds questions, keys, tags, diagram blocks and crops each question (docs/PYQ-INGEST.md) |
| 2026-10-28 | Two-column pages: column boundary guessed wrongly, a skipped question number stopped the whole sequence | boundary by 1-D two-means over all pages; numbers chosen by a best-chain search, missed numbers become gaps; tested on a synthetic PDF |
| 2026-10-28 | Diagram flag was wrong for 64 of 65 questions (big formulas looked like drawings) | flag needs a drawing-like ink block AND a figure word; otherwise `drawing-like` / `mentions` tiers |
| 2026-10-28 | A question running to the bottom of a column lost its second half; cheap agents then "restored" the text from memory | tool now crops the continuation (`crop2`); AGENT-PROMPT forbids inventing; `{pn, gap}` rows are never published (assemble writes gaps.json) |
| 2026-10-28 | Subagent worktrees start from main, not from my branch: they lacked the stubs and tools | merge shared set-up to main first, or tell the agent `git merge <branch>` as its first step |
| 2026-10-28 | Five parallel agents hit the 5-hour usage limit | at most 3-4 agents at a time on sonnet; work saved in worktrees, resume with SendMessage after the reset |
| 2026-10-28 | Five new JEE chapters added +90 KB gzip to the Rank bundle | chapter text is lazy-loaded (`physica-ch-*.min.js`), only figures stay in the main bundle |
| 2026-10-28 | The stop hook kept warning about unpushed commits after squash merges | `node tools/ship.js after-merge` resets the work branch and pushes; compare `git ls-remote` with HEAD before acting |
| 2026-10-28 | Agents committed generated files and caused merge conflicts | agents commit source files only; `ship.js sync` rebuilds generated files after a merge |
| 2026-10-28 | Agents turned multi-part and fill-in questions into made-up numerical/option questions; exam labels came in 6 spellings that pyq-lint rejects | AGENT-PROMPT keeps the original form (multi-part answer in `a`, fill-in as text); `assemble` normalises exam labels; lint accepts `(year not printed)`; the caller reviews every question the agents flag |
| 2026-10-28 | Each new chapter's figures grew the main Rank bundle (+8 KB gzip for 7 figures) | `PhysicaRankFigKit`: new chapters keep figures in their own lazy file; set-up steps and agent prompts saved in docs/CHAPTER-AGENT-PROMPT.md so the next chapter costs a short message |
| 2026-10-28 | Maths PDF: a stray '0.' on the contents page became question 0 | numbers below the first question number are never candidates |
| 2026-10-28 | Set braces `{ }` in PYQ text vanished on the page (Rank page reads them as fraction markup); the prompt wrongly said plain braces were fine | `assemble` converts braces to fullwidth ｛ ｝ (fractions `{a;b}` untouched); AGENT-PROMPT corrected; always look at one rendered question of a new subject before merging |
| 2026-10-28 | An agent misread a set expression ((A∩B∩C)ᶜ read as A∩B∩Cᶜ) and then 'explained' the key away | printed-key disagreements are re-checked by brute force by the caller and against the crop before they ship; Q41 corrected (256 = key) |
- Simulation-page redesign: a CSS/DOM shim must put popups and the drawer directly under body/stage with their own z-index, and run its tests at phone width too (a backdrop hid the drawer until the sidebar moved to body).
| 2026-10-29 | Binomial PYQs: scan crops clipped some exponents and exam years; agents left years out, lint rejected combined exam labels | AGENT-PROMPT 'Maths style v2' (no Step labels, Note: for heavy lines); read clipped values from the crop and the key, add a Note; one exam per label; a chapter without a mock bank uses nomock:1 (hides the Mock tab) |
