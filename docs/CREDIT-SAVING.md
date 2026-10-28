# Credit saving (target: about half the credits per task, same quality)

Rule for every task: first ask "can code do this once, so no model is needed next time?" If yes, write the tool, test it, document it, and use it from then on.

## Habits (every task)
1. Open only the files the task names; use grep for a symbol; no repo scans, no re-reading old conversation.
2. Quiet commands: `| tail -3`, or the wrapper below. Never print whole test logs, only failures.
3. One build, one check, one e2e per task, at the END (not after every edit). Screenshots only for visible UI changes, one pass per theme, small viewport.
4. Merge chores are one-liners: `node tools/ship.js check [--e2e]` / `commit "msg"` / `sync` / (PR with the GitHub tool) / `after-merge`. This replaces ~10 manual tool calls and the stale "unpushed commits" warning loop.
5. Subagents only for big parallel work, with `model: "sonnet"` (or haiku for mechanical edits), a short prompt that names the files, and "report in 3 lines". The strongest model only for diagrams, physics checking, or hard design.
6. No explanation or recap in the answer beyond what the owner needs (short Hinglish bullets).

## What is already code (use it, do not redo by hand)
| Task | Tool |
|---|---|
| Import PYQs from a PDF | `tools/pyq-ingest/` (docs/PYQ-INGEST.md) |
| Practice questions in bulk | `tools/qgen/` templates + independent verification (docs/QBANK.md): the model writes templates once, code makes thousands of questions |
| Test Series content | `tools/series-import.js` |
| SEO pages, sitemap | `tools/seo.js` |
| Merge/checks/branch sync | `tools/ship.js` |
| Size, secrets, private files, live-site integrity | `tools/perf-budget.js`, `secret-guard.js`, `private-guard.js`, `watchdog.js` |

## Which tasks to move to ChatGPT (free of Claude credits)
Good for ChatGPT, then paste the result for Claude to wire in (Claude then only edits, does not draft):
- First drafts of long text: study-guide paragraphs, "common mistakes" and "revise" notes, Hinglish voice-tutor lines, blog/SEO text, WhatsApp/Play-store descriptions.
- Brainstorming: question ideas per topic, mnemonics, names, app-store copy.
- Reading a scanned page when the PDF has no text layer (give it the page image, ask for plain text), then the tool takes over.
Keep with Claude (needs the repo or exact checking): any code change, merge/CI, diagrams (`fig`), keys and physics verification, anything touching security, privacy or the Test Series logic.
Rule when moving work: ChatGPT output is a draft; the answer keys and formulas in it must still pass the tool checks (`check`, qgen verifier) before they ship.

## How to check the saving
At the end of a big task, report one line: tool calls used, subagents used, and whether a tool was reused or newly made. If a task type repeats twice and has no tool yet, build the tool next time first.
