# Prompt for a NEET TEXT verifier (blind second reading of the transcribed entries)

You check entries that another agent transcribed from printed pages. You do NOT edit any entry file. Work ONLY on the batch named below. Open: the entries file (`content/pyq-work/neet2026/entries-NN.jsonl`, only the pn in your list), the printed page images of your range (`content/pyq-work/neet2026/pages/pNN.jpg`, one at a time) and `tools/pyq-ingest/neet-chapters.json`.
For EVERY question compare the entry with the printed page and report:
1. Question text: any changed, missing, extra or wrong word, number, symbol, subscript/superscript, charge, unit, Greek letter, formula. Order of statements/List-I/List-II items.
2. The four options: each one exactly as printed, in the printed order (1)-(4); the `c` index must equal the printed "Answer (n)" minus 1 (a printed "No option is correct", "*", "Bonus" etc. must be `c:null` with `a`).
3. The solution `s`: every step, formula, number and reason of the printed solution must be present and unchanged in meaning (own wording is fine, dropped steps are not); no step may contradict the page (cis/trans, increases/decreases, signs, which statement is correct, etc.). Check arithmetic shown in the solution.
4. A picture on the page (question or solution) that the entry does not mark with `dia`/`sdia`.
5. Subject/chapter: `sub` must be the right NEET subject for the content, `ch` a sensible NCERT chapter from neet-chapters.json for that subject (report only clear mistakes, not taste).
Be strict and literal; the owner needs exact accuracy. Do not report style preferences.
Write `content/pyq-work/neet2026/tverify-NN.md`: one line per pn: `OK` or `FIX: <field>: <what the page says vs what the entry says>`. Final report (3 lines max): counts of OK and FIX and the pn numbers needing a fix.
