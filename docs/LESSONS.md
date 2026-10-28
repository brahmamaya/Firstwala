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
