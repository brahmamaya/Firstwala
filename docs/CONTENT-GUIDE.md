# Adding the 90 tests (30 each for JEE Main, JEE Advanced, NEET)

You write one JSON file per test. A tool checks every file, then loads it. A test **cannot go live** unless its content is complete
(the database re-checks it when you publish). Series 1-3 of each exam are free; 4-30 are paid (this follows from the number, nobody can set it wrongly).

## 1. One-time setup
```bash
# Supabase: run supabase/schema.sql in the SQL editor first. Then, from your computer (DATABASE_URL = Settings -> Database -> connection string):
node tools/series-import.js patterns | psql "$DATABASE_URL"
```
`supabase/patterns.json` holds the official format of each exam (questions per section, marks, negative marking, partial marking).
Check the numbers against the official bulletin of the year and edit them there; re-run the command above. Marks are stored once per pattern, never per question.

## 2. A test file
Folder layout (any layout works, the content decides): `content/NEET/01.json`, `content/JEE_MAIN/07.json`, `content/JEE_ADV/12-p2.json` (paper 2).
```json
{
  "exam": "NEET", "series": 4, "paper": 1, "pattern": "NEET_2026", "title": null, "price": null,
  "q": [
    { "b": "A body of mass m_1 moves with speed v^2 = 9 ...", "o": ["first", "second", "third", "fourth"], "k": "B", "e": "Because ...", "f": null, "fa": null },
    ...
  ]
}
```
- `q` must have **exactly** the number of questions of the pattern, in paper order (section after section: NEET 45 Physics, 45 Chemistry, 45 Botany, 45 Zoology; JEE Main 20 MCQ + 5 numerical per subject; ...).
- **Single-correct (MCQ):** `"o"` 2-6 options, key `"k": "B"`.
- **Multiple-correct (JEE Advanced):** key = sorted distinct letters, e.g. `"AC"`. Marks: all right = full, some right and none wrong = +p per option, any wrong = negative.
- **Numerical:** no `"o"`; key `"12.5"` or an accepted range `"12.3:12.7"`.
- **Bonus / dropped question:** key `"*"`: every student gets the full marks (even unattempted).
- `e` = the solution shown after submit (optional but strongly recommended; max 5000 chars). `b` max 4000 chars, options max 600.
- `price`: optional, rupees, only informational until payments exist. `title`: optional; the app shows "Test 7" otherwise.

## 3. Writing the text
Plain text only. No HTML. Use `x_2`, `x^2`, `v_{0}`, `10^-3` for sub/superscripts (they are drawn properly) and Unicode for symbols:
`α β γ Δ θ λ μ π ρ σ τ φ ω Ω ∫ ∑ √ ∞ ≈ ≠ ≤ ≥ ± × ÷ → ⃗ ½ ² ³ ° ‰`. For vectors write `A⃗` or "vector A". Line breaks are kept.
Complex equations/diagrams: use a **figure** (below), not ASCII art.

## 4. Figures (circuits, graphs, ray diagrams)
1. Make a **WebP** image, at most ~800 px wide, quality 75-80 (a diagram is usually 10-40 KB). Use the same file for the same diagram everywhere (repetition wastes storage).
2. Give it a random name of 16-64 characters from `A-Z a-z 0-9 _ -` (for example from `openssl rand -base64 18 | tr '+/' '-_'`). Nobody can guess it.
3. Upload it to Supabase Storage: bucket **`q`**, set to **public** (Storage -> New bucket -> Public), file name `<key>.webp`.
4. In the question: `"f": "<key>", "fa": "alt text a blind student can use, e.g. 'Circuit: 6 V battery, 2 ohm and 4 ohm in series'"`.
**Alt text is mandatory** (accessibility); the check refuses a figure without it.

## 5. Check, load, publish
```bash
node tools/series-import.js check content/                       # every problem in every file, with the question number. Nothing is written.
node tools/series-import.js sql content/ > build/import.sql      # review it if you like
psql "$DATABASE_URL" -f build/import.sql                          # loads/updates tests as DRAFTS
node tools/series-import.js sql content/ --publish > build/live.sql && psql "$DATABASE_URL" -f build/live.sql   # makes them live (the database validates again)
```
Re-running with a corrected file safely **updates** that test (it never duplicates). Editing a live test is allowed, but the new content must still be complete,
or the change is refused. Students who already finished a test keep their result; the review shows the current key and solution.
To take a test off: `update public.tests set published = false where exam = 'NEET' and series_no = 7;`

## 6. Quality checklist for each test (do not skip: students trust the rank)
- [ ] A second person solved every question independently and the keys match.
- [ ] Numerical keys have the accepted precision (use a range when rounding can differ).
- [ ] No question is repeated within the test (the tool warns) or from test to test.
- [ ] Difficulty and chapter spread follow the real paper of that exam (ask a teacher).
- [ ] Every figure has alt text and opens correctly on a phone.
- [ ] Solutions are correct and short.
- [ ] Original or properly licensed content only. Do not copy questions or solutions from coaching institutes, books or other test-series (copyright). Past-year questions may be rewritten in your own words; ask your lawyer where unsure.

## 7. Try it without real content
`node tools/series-import.js sample /tmp/samples` writes synthetic SAMPLE tests (series 1-5 of every exam, right size, nonsense text). Load them into a **test** project only.
