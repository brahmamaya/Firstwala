# Adding tests (GitHub-only Test Series)

Physica has no server and no database. A test is two small public files in the `tests/` folder of this repository; the site reads them and
marks the test on the student's own phone. Results stay on that device. **Everything in `tests/` is public, including the answer key,** so only the
**free tests 1-3** of each exam can be added this way (the tool refuses tests 4-30). Paid tests need a server, which Physica does not have.

## 1. Write a test (on your computer, outside the repository)
One JSON file per test, e.g. `content/NEET/01.json`, `content/JEE_MAIN/02.json`, `content/JEE_ADV/01-p2.json` (paper 2):
```json
{ "exam": "NEET", "series": 1, "paper": 1, "pattern": "NEET_2027", "title": null,
  "q": [ { "b": "question text", "o": ["A text","B text","C text","D text"], "k": "B", "e": "solution", "f": "figure-key", "fa": "figure description" }, ... ] }
```
- `exam`: `NEET`, `JEE_MAIN`, `JEE_ADV`. `pattern`: `NEET_2027`, `JEE_MAIN_2027`, `JEE_ADV_2027` (see `tools/patterns.json`).
- Exactly the right number of questions in order, section after section: NEET 180 (Physics 45, Chemistry 45, Botany 45, Zoology 45); JEE Main 75; JEE Advanced 48 per paper.
- `k`: single-correct `"B"`; multiple-correct `"AC"` (sorted); numerical `"12.5"` or a range `"12.3:12.7"`; `"*"` = bonus (everyone gets the marks).
- Plain text only. `x_2`, `x^2`, `v_{0}` become subscripts and superscripts. Use Unicode symbols (α ∫ √ ≤ ½ ²). No HTML.
- Figures: `"f"` = a 16-64 character key (letters, digits, `-`, `_`) and `"fa"` = alt text for blind students. Put the picture at `content/img/<key>.webp` (WebP, 10-40 KB).
- Original questions only: do not paste copyrighted books, coaching material or past papers you do not have the right to publish.

## 2. Check and export
```
node tools/series-import.js check  content          # every problem listed with the question number
node tools/series-import.js static content          # writes tests/index.json, tests/<EXAM>/NN-P.json (paper), NN-P.key.json (answers), tests/img/
```
Then commit the `tests/` folder and push to `main`. The site updates in about a minute. Until a test exists its card says "Coming soon".

## 3. What the student gets
Real-exam screen (palette, Save & Next, timer, submit summary), a motivational quote before the start, a scorecard with subject/section analysis and a question-by-question
review. The answer file is downloaded only after submitting. Honest limits: a determined person can read the answers from the repository or the network tab, the
timer lives on the student's device, and there is no rank list or login. Say so if asked.

## Exam patterns
`tools/patterns.json` holds each exam's format. They follow publicly reported 2027 formats and are **not confirmed by the exam agencies**: check the official NTA / JEE Advanced bulletin when it is released and edit the numbers.
