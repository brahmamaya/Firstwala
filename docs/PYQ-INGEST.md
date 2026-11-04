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

## NEET papers (image-only PDF with questions AND solutions, e.g. NEET 2026)
NEET is organised Subject -> NCERT chapter (`tools/pyq-ingest/neet-chapters.json`: Physics, Chemistry, Botany, Zoology; key `Subject: Chapter`). Each chapter has its own lazy file `rank-pyq-neet-<subject>-<chapter>.js` (global `PhysicaRankPyqNeet_<subject>_<chapter>`), holding every year, so a new PDF only adds lines.
1. No text layer -> `pdfimages -j <pdf> pages/raw`, rename to `pNN.jpg` in `content/pyq-work/<paper>/pages/` (git-ignored). The `prep` tool cannot segment these PDFs.
2. One sonnet agent per ~6 pages with `tools/pyq-ingest/NEET-AGENT-PROMPT.md` -> `entries-NN.jsonl` (chapter, sub-topic, question, 4 options, printed answer index, solution in the same steps, `dia`/`sdia` = description of every picture, `flag` for any doubt). Overlapping pages give a free cross-check (compare the duplicated questions, then delete one copy).
3. Diagrams: agents with `tools/pyq-ingest/NEET-FIG-PROMPT.md` draw `PhysicaFig` specs into `figs-<ID>.json`; `tools/pyq-ingest/fig-sheet.js` renders them to a PNG to compare with the page (chemistry structures: strongest model). Merge the parts into `figs.json` ({pn:{fig,sfig}}).
4. `node tools/pyq-ingest/neet-assemble.js <workdir> "<exam label>" <year> <count> [--write]`: checks counts, chapters, 4 options, answers; ids `neet-<year>-qNNN`; re-running replaces the same paper and keeps other years; text duplicates of older entries are skipped and listed.
5. `node tools/ship.js build` (new files are picked up; a file that does not match a chapter fails the build), then check/e2e as usual.
Keys the PDF prints as "No option is correct" / "*" are kept as printed (`a` text, no `c`) with a `Note:` line; an answer the solution contradicts is never changed silently.
`node tools/ship.js build` also writes `physica-neetyear-<year>.min.js` (every question of that year, in paper order) for the "Previous year papers" button in Rank mode -> NEET (years 2026-2005; years without a file say "not added yet"). `makePaper` in `rank-export.js` draws it as a VECTOR PDF (`ttf.js` + `pdf-vec.js`): real selectable and copyable text with embedded subset fonts (`fonts/pp-*.ttf`, built by `tools/make-paper-fonts.js` from Liberation Sans + DejaVu Sans; licences in `fonts/`), figure specs as vector lines/text, A4, black on white, year + logo (soft-masked picture) on every page, no per-question labels. NEET 2026: 180 KB questions only, 335 KB with solutions, about 0.3 s to make (the old raster pages were 6 MB and 11 MB). If the fonts cannot be fetched it falls back to raster JPEG pages. Slides (`make`) are still raster.

## A paper that comes as a Word file (.docx with real text): `tools/pyq-ingest/docx-ingest.js`
Far cheaper than page images: code reads the text, so no model reads pages (and no transcription slips).
1. `node tools/pyq-ingest/docx-ingest.js <paper.docx> content/pyq-work/<paper> [--opts 1234|abcd]` (NEET labels options (1)-(4), use `abcd` for (a)-(d)). It reads paragraphs, Word auto-numbering, tables, tabs, sub/superscripts, Word equations (to plain unicode, fractions as `(a)/(b)`) and pictures (saved in `media/`). It prints the question count, gaps in the numbering, questions without 4 options or without an answer, and writes `entries-docx.jsonl` (draft: `ch:"?"`, `raw:1` = the publisher's solution text) plus `batches/tag-NN.md`.
2. One sonnet agent per batch with `NEET-DOCX-TAG-PROMPT.md` (text only): writes `tags-NN.jsonl` {pn, sub, ch, st, s} = chapter, sub-topic and the solution rewritten in new words (every step kept).
3. `node tools/pyq-ingest/docx-ingest.js <paper.docx> <workdir> --tags <workdir>/tags-*.jsonl` -> `entries-01.jsonl` (lists untagged questions). `neet-assemble.js` refuses any entry that still has `raw:1`.
4. Pictures: `dia`/`sdia` name the image files in `media/`; the figure agents (`NEET-FIG-PROMPT.md`) read those small images instead of whole pages; verify with `NEET-FIG-VERIFY-PROMPT.md` as before. Then continue with step 4 of the NEET section (assemble).
Checked on a real file: our own NEET 2026 Word download (180 questions, 43 pictures) read back with all 180 questions, all 4 options each and all 180 answers identical to the entries. Files made by other tools or by converting a scanned PDF can differ: read the printed summary first.
