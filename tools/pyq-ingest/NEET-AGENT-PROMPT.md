# Prompt for a NEET page-transcription agent (image-only PDF with questions AND solutions)

You transcribe NEET questions for Physica Rank mode. Work ONLY on the page range named below. Do not scan the repo. Open only: the page images `content/pyq-work/<paper>/pages/pNN.jpg` of your range (Read tool, one page at a time) and `tools/pyq-ingest/neet-chapters.json`.

The PDF has no text layer. Each question is followed by `Answer (n)` and `Sol.` (the publisher's solution). Booklet order: Physics 1-45, Chemistry 46-90, Botany 91-135, Zoology 136-180; confirm from the printed subject headings (they switch the subject). A question that starts on your last page may continue on the next page: read that one page too. Skip a question that started before your first page (the previous batch owns it), except that you own the question whose number is the first one that STARTS on your first page.

Write one JSON object per line into `entries-NN.jsonl` (NN = batch number) in the paper folder:
`{"pn":<number printed>,"sub":"Physics|Chemistry|Botany|Zoology","ch":"<chapter, EXACTLY as in neet-chapters.json for that subject>","st":"<NCERT sub-topic, 2-5 words, consistent wording across questions>","q":"<question text>","o":["<option 1>","<option 2>","<option 3>","<option 4>"],"c":<0-based index of the printed answer>,"s":"<solution>"}`

Rules (accuracy is the first priority; never guess):
1. Text: plain unicode, `\n` for line breaks. Keep every symbol exactly: subscripts/superscripts (H₂SO₄, Fe³⁺, SO₄²⁻, x², vₓ), Greek letters, fractions as (a)/(b), roots √, vectors, arrows → ⇌, units. Chemical formulas and charges must be exact.
2. Options: the four options in printed order without the "(1)" labels. A table or match-the-column question: put the table as lines in `q` (`A. ... — I. ...`) and the four option combinations in `o`. Assertion-Reason and statement questions: keep the full statements.
3. `c` = printed Answer number minus 1. If the printed answer is "No option is correct", "Bonus" or similar: set `"c":null`, `"a":"<exactly what the PDF says>"` and add `"flag":"<one line>"`.
4. Solution `s`: keep EVERY step and formula of the publisher's solution, in your own clean wording (do not copy sentences word for word), one idea per line separated by `\n`, short sentences for ages 15-18. Do not shorten the working, do not add new physics/chemistry/biology. If the publisher gives only a one-line reason, keep it that short. Numerical working must show the same numbers.
5. If your own check of a numerical answer or the reasoning disagrees with the printed answer, keep the PRINTED answer in `c`, and add `"flag":"printed answer X; my working gives Y because ..."`. Never silently change an answer.
6. Diagrams: if the question (or the solution) contains a picture (circuit, graph, ray diagram, structure, biological diagram, table drawn as image), do not draw it. Add `"dia":"<precise description: every label, value, direction, axis, position, so it can be redrawn exactly>"` and, for a solution picture, `"sdia":"..."`. Describe only what is printed.
7. Unreadable or missing text (blurred, cut off): do not invent it. Write `{"pn":<n>,"gap":"what is missing"}` instead of the entry.
8. `ch` must come from the question's own subject list. If no chapter fits, set `"ch":"?"` and explain in `flag`.
9. Final report (4 lines max): entries written, pn range, questions with `dia`, list of `flag` and `gap` pn values.
