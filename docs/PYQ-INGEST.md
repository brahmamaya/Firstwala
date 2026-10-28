# Importing PYQs from the owner's PDFs (low-credit method)

Goal: the same quality as before (every question, diagrams as original `fig`, keys checked, solutions written for this site) with far fewer model tokens. The expensive parts used to be: a model reading whole page images, hunting for question numbers and answer keys, typing exam tags, and re-checking counts. Those are now done by code (`tools/pyq-ingest/`, no model, ~3-40 s per PDF). A model only does what code cannot: read the small crop of one question, write the entry, write the solution, draw a diagram.

## Steps (do them in this order, nothing else)
1. `node tools/pyq-ingest/ingest.js prep <pdf>` -> `content/pyq-work/<pdf name>/` (git-ignored: it holds book pages, never commit it). Output: `crops/qNNN.png` (one small image per question), `draft.json`, and a summary: questions found, numbers the OCR missed, answer keys found, likely diagram questions.
   - Needs the PDF to have a text layer (phone scans from iOS/Android have one). No text layer -> say so; OCR would be needed.
   - Two columns is the default; use `--cols 1` for single-column books, `--sol-from <page>` if the answer key is not detected, `--first <n>` if numbering does not start at 1.
2. `node tools/pyq-ingest/ingest.js batches <workdir> 12` -> `batch-NN.md` lists (12 questions each: crop path, exam-tag guess, key from the PDF, diagram verdict, rough OCR text).
3. One cheap agent per batch (use `model: "sonnet"`; see `tools/pyq-ingest/AGENT-PROMPT.md`, paste it with the batch path). It reads ONLY the crops of that batch and writes `entries-NN.jsonl` (one entry per line, with `pn` = PDF question number). Run 3-4 batches in parallel. Use the strongest model only for the questions the batch marks `YES` or `drawing-like` (diagram) and for key mismatches.
4. `node tools/pyq-ingest/ingest.js assemble <workdir> rank-pyq-<x>.js PhysicaRankPyq<X>` -> the source file (sorted by `pn`).
5. `node tools/pyq-ingest/ingest.js check <workdir> rank-pyq-<x>.js PhysicaRankPyq<X>` -> must say: not matched 0 (a number the OCR missed shows up here until its entry exists), and every key difference must have a `Note:` in the solution. Then `node tools/pyq-lint.js`, the existing PYQ checks, build, merge flow.

## What the tool does not do (be honest in the report)
- It does not write solutions or fig specs, and it cannot verify physics. A key that differs from the PDF is reported, not fixed.
- The text layer of scans can miss a question number (shown as "missed"); the previous question's crop then also holds it (the batch says so). Never skip it.
- Diagram detection: `YES` = a drawing-like block and the text mentions a figure; `drawing-like` = a block that may be a big formula; `mentions` = text only. The agent looks at the crop and decides.
- Matching `check` against older entry files (no `pn`) uses text similarity; new entries must carry `pn`.

## Measured on the owner's PDFs (regression)
EM Waves (157 questions): all 151 numbers the OCR found were segmented and matched; the 6 missed numbers were reported; 146 of 148 keys equal the existing entries (the 2 others are reported for teacher review). Optics (577 numbered questions): 544 found, 540 matched, 426 of 439 keys equal, the rest listed. `node tools/pyq-ingest/ingest.test.js` (needs Chromium) tests the tool on a synthetic PDF made on the spot: numbering, missing number, crops, keys, diagram flags, exam tags, check and assemble.
