# Credit saving (target: about half the credits per task, same quality)

Rule for every task: first ask "can code do this once, so no model is needed next time?" If yes, write the tool, test it, document it, and use it from then on.

## Habits (every task)
1. Open only the files the task names; use grep for a symbol; no repo scans, no re-reading old conversation.
2. Quiet commands: `| tail -3`, or the wrapper below. Never print whole test logs, only failures.
3. One build, one check, one e2e per task, at the END (not after every edit). Screenshots only for visible UI changes, one pass per theme, small viewport.
4. Merge chores are one-liners: `node tools/ship.js check [--e2e]` / `commit "msg"` / `sync` / (PR with the GitHub tool) / `after-merge`. This replaces ~10 manual tool calls and the stale "unpushed commits" warning loop.
5. Subagents only for big parallel work, with `model: "sonnet"` (or haiku for mechanical edits), a short prompt that names the files, and "report in 3 lines". The strongest model only for diagrams, physics checking, or hard design.
6. No explanation or recap in the answer beyond what the owner needs (short Hinglish bullets).

## Write short code with the newest built-ins (fewer tokens, no new dependencies)
Checked here: Node 22.22 and Python 3.13. Prefer these over hand-written helpers or npm/pip packages:
- Node: `node:test` + `assert` for tests, `util.parseArgs` for options, `fs.globSync`, `fs/promises`, `fetch`, `Object.groupBy`, `Array.prototype.toSorted/toReversed/at/findLast`, `structuredClone`, `Promise.withResolvers`, `Array.fromAsync`, optional chaining and `??`, `import.meta`/`node:` prefixed modules. Run one-off checks with `node -e`.
- Python: `pathlib`, `dataclasses`, `itertools.batched`/`pairwise`, `statistics.fmean`, `collections.Counter`, `json`/`csv`/`argparse` from the standard library, f-strings, `match`, type hints only where they help. Pillow and numpy are already installed (see `tools/pyq-ingest/figscan.py`); install nothing else.
- Keep a script to what the job needs: no classes, no config files, no wrappers around one call; reuse `tools/ship.js` and the other tools instead of writing a new script.

## What is already code (use it, do not redo by hand)
| Task | Tool |
|---|---|
| Import PYQs from a PDF | `tools/pyq-ingest/` (docs/PYQ-INGEST.md) |
| Practice questions in bulk | `tools/qgen/` templates + independent verification (docs/QBANK.md): the model writes templates once, code makes thousands of questions |
| Test Series content | `tools/series-import.js` |
| SEO pages, sitemap | `tools/seo.js` |
| Merge/checks/branch sync | `tools/ship.js` |
| Size, secrets, private files, live-site integrity | `tools/perf-budget.js`, `secret-guard.js`, `private-guard.js`, `watchdog.js` |

## Which tasks to move to ChatGPT (free of AI credits)
Good for ChatGPT, then paste the result for the assistant to wire in (the assistant then only edits, does not draft):
- First drafts of long text: study-guide paragraphs, "common mistakes" and "revise" notes, Hinglish voice-tutor lines, blog/SEO text, WhatsApp/Play-store descriptions.
- Brainstorming: question ideas per topic, mnemonics, names, app-store copy.
- Reading a scanned page when the PDF has no text layer (give it the page image, ask for plain text), then the tool takes over.
Keep with the assistant (needs the repo or exact checking): any code change, merge/CI, diagrams (`fig`), keys and physics verification, anything touching security, privacy or the Test Series logic.
Rule when moving work: ChatGPT output is a draft; the answer keys and formulas in it must still pass the tool checks (`check`, qgen verifier) before they ship.

## How to check the saving
At the end of a big task, report one line: tool calls used, subagents used, and whether a tool was reused or newly made. If a task type repeats twice and has no tool yet, build the tool next time first.

## Why a paper cost much more (measured 2026-11-06) and the rules that fix it
Counted from the agents' own token reports: NEET 2025 about 2.7 M tokens, NEET 2026 about 2.2 M, NEET 2024 transcription alone 1.2 M, plus every run that died on the 5-hour limit and had to be repeated (it saved nothing). Causes: (1) two checking passes were added (a reader per ~30 questions and a figure checker), about +45% per paper; (2) 12-17 agents were started at once, which hit the 5-hour limit twice, so the same work was paid twice; (3) each 4-page agent re-reads the same prompt and chapter files (~15-25 k tokens of fixed cost); (4) the strongest model was used for chemistry figures and their checks; (5) the main conversation grew huge and every agent hand-back and every "unpushed commits" hook woke it again (about 150 extra turns).
Rules: for a text PDF run textcheck.js with --min 0.85 --sol 2 and give agents only the flagged, figure and maths-like questions (NEET 2024: 89 of 200); at most 5 agents at once and never more than the limit allows; sonnet only (the strongest model only to redo one figure that a checker marked FIX); 6-8 pages per transcription agent; for a paper WITH a text layer run `node tools/pyq-ingest/textcheck.js <pdf> <entries.jsonl>` first (free: it checks every printed key) and send a reader only the questions with maths, figures or a flag; check figures with ONE agent per paper, not three; answer agent hand-backs in one line, no recap; start a fresh session per paper so the conversation stays small; turn off the Stop hook that reports "unpushed commits" (it compares with the old branch and is always a false alarm).
