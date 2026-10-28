# Generated question bank (qbank)

Goal: a very large, chapter-wise practice bank (target 1 lakh questions) with step-by-step solutions, with **no paid API and no backend**.
Instead of writing questions one by one, we write **templates** (code). Each template draws random parameters, computes the answer and the
solution in code, and builds MCQ distractors from common mistakes. A **different-method check** verifies every single question before it is written.
Pilot: JEE Mains Physics, Kinematics (103 templates, about 4,500 questions).

```
tools/qgen/lib.js            seeded RNG, number formatting, helpers, generate()
tools/qgen/chapters/<chapter>.js   one file per chapter (topics + list of template files)
tools/qgen/chapters/<chapter>/<tp>.js   templates of one Rank topic (tp key)
tools/qgen/verify.js         independent verification (also: node tools/qgen/verify.js)
tools/qgen/verify.test.js    proves the verifier catches deliberately broken templates
tools/qgen/build.js          generate + verify + write qbank/  (--check = write nothing)
tools/qgen/sizes.js          raw/gzip size per chunk
qbank/index.json             per subject > chapter > topic: counts, difficulty counts, chunk list, version hash
qbank/<subject>/<chapter>/<n>.json   chunks of <= 500 questions of ONE topic, compact keys
```

Only `qbank/` is published (`tools/publish.js`). The generator sources stay in `tools/` (not published, 404 on Netlify through `_redirects`).
`sw.js` does not cache `/qbank/`. Nothing is added to the main or Rank bundles except a small loader (about 1.7 KB gzip in `rank-neet.js`).

## Commands
```
node tools/qgen/build.js          # generate, verify, write qbank/. Fails (writes nothing) if any question fails verification.
node tools/qgen/build.js --check  # fails if qbank/ on disk differs from a fresh build
node tools/qgen/verify.js         # verify every generated question + qbank/ is current  (CI)
node tools/qgen/verify.test.js    # the verifier must catch the broken templates         (CI)
node tools/qgen/sizes.js          # size report
```
Output is deterministic: same seed (`SEED` in `build.js`) and same templates give identical files. Change the seed only on purpose
(it changes every `k` key, so students' "seen" lists in their browsers start again).

## Writing a template
```js
{ id: 'pke-v', tp: 'pke', st: 'Equations of motion', diff: 1, type: ['mcq', 'numeric'], n: 50,
  gen:  r => ({ u: r.int(0, 20), a: r.int(2, 9), t: r.int(2, 12) }),        // parameters, nice numbers
  make: p => ({ q: `A car at ${p.u} m/s ...`, ans: p.u + p.a * p.t, unit: 'm/s', dp: 2,
                steps: ['v = u + at', `v = ${p.u} + ${p.a} × ${p.t}`, `v = ${...} m/s`],         // 2 to 8 lines
                wrong: [[p.u - p.a * p.t, 'sign error'], [p.a * p.t, 'forgot u'], ...] }),       // value + NAME of the mistake
  check: p => Math.sqrt(p.u*p.u + 2*p.a*(p.u*p.t + 0.5*p.a*p.t*p.t)) }                         // other method
```
Rules:
* `tp` is the Rank topic key (`pkd`, `pke`, `pkv`, `pkr`, `pkp`, `pkj`, `pkc` for Kinematics) and must exist in the chapter's `topics`. `st` is the sub-topic name.
* `type`: `'mcq'`, `'numeric'` or `['mcq','numeric']` (60 % / 40 %). `diff`: 1 easy, 2 medium, 3 hard. `n`: how many unique questions to aim for (dedupe is by template + parameters; a template whose parameter space is too small fails the build with "produced only N").
* `gen` returns parameters (return `null` to reject a draw). Choose parameters so the answer is clean. When it cannot be clean, the question says "correct to 2 decimal places" automatically (`dp`). Helpers: `r.int`, `r.step`, `r.pick`, `ANG` (30/37/45/53/60 with the exam convention sin 37 = 0.6; the question must say so, `angNote()`), `TRIPLES` (Pythagorean triples), `fmt()` (real minus sign, no trailing zeros).
* `make` returns question, exact answer (not rounded), unit, solution lines and **at least 3 distractors, each a named common mistake** (wrong sign, missing factor 2, mixing units, wrong formula). Distractors within 2 % of the answer are dropped automatically.
* `check` must use a **different method** (numerical integration or stepping simulation, finite differences, vector components, an alternative formula). If it just repeats the formula in `make`, the verifier proves nothing. Set `tol` (relative, default 1e-6) for simulations. `pos: false` allows negative or zero answers; the default demands a positive answer (times, distances, speeds).
* Maths markup in text is the site's: `{num;den}` fractions, unicode super/subscripts, `\n` between lines (the template joins `steps`). Avoid `a/b` between plain letters in text (the site turns it into a fraction); write units as `m/s`, `m/s²`, `km h⁻¹`.
* Question text must stand alone: give g = 10 m/s² and any angle convention. No diagrams yet (describe graphs in words).

What the verifier checks for **every** question: solve vs check agree; stored answer matches the check value; the correct option is present exactly once and the 4 options are distinct (also as numbers); no NaN/Infinity; answers are positive when they must be; no `undefined`/`NaN`/`${` in the text; 2 to 8 solution lines; every distractor has a named mistake; no duplicate question text; no key collisions.

## Adding a chapter
1. Create `tools/qgen/chapters/<name>.js` exporting `{ subject, key, name, topics: {tp: 'Topic name'}, templates }`. `name` must equal the Rank chapter name (for example `'Laws of Motion'`); `topics` should use the same tp keys as `rank-pyq-<x>.js` so the topic names match the PYQ tab.
2. Write templates in `tools/qgen/chapters/<name>/<tp>.js`.
3. `node tools/qgen/build.js`, then `node tools/qgen/verify.test.js`, then read 25 questions with solutions yourself (`dump` them) before merging.
4. Commit `qbank/`. The Rank UI shows the **Question bank** tab for any chapter present in `qbank/index.json`: no UI change needed.

## How the Rank UI uses it
`rank-neet.js` (JEE chapters): on opening a chapter it fetches `qbank/index.json` (about 0.9 KB gzip). If the chapter is in it, a **Question bank** tab appears after PYQs.
The tab (topic list, counts and difficulty filter) is drawn from the index alone. A "Practice 10 / 25" tap fetches only the chunks it needs (one topic chunk; the mixed choice
fetches up to three) with the same skeleton and retry card as the PYQ tab, then runs the normal `runSet` player. Generated questions are labelled "Practice question".
"New set" never repeats: seen question keys (5 characters each, newest 3,000 per chapter, at most 15 KB) are kept in `localStorage` key `physica-qb-seen`.
When every question in the selection has been seen, the set is a revision set and the title says so. Nothing leaves the device.
The bank does **not** feed the Practice / Mock pools: those pools are fixed, hand-written and tied to the Physica tutor pack, and mixing generated questions in would change mock-test statistics and size.

## Size (Kinematics pilot, 4,497 questions)
About 400 KB raw and **50 KB gzip per 1,000 questions**; one chunk (500 questions) is 11 to 28 KB gzip. Total pilot: 1.79 MB raw, 226 KB gzip, but a student downloads only the chunks they open.
`tools/perf-budget.js` fails when any chunk exceeds 40,000 B gzip or the index exceeds 6,000 B gzip.
At 1 lakh questions: about 5 MB gzip in total, about 200 chunks. The index grows by about 1 KB gzip per chapter; when it passes 6 KB split it per subject.

## Scale-up plan: one chapter per agent run
Each run: write templates for one chapter (about 80 to 100 templates, 3,000 to 5,000 questions), run build + verify, read 25 questions, commit. The 19 remaining JEE chapters at about 5,000 questions each reach 1 lakh.
Templates are cheapest where the physics is formula-driven. Chapters that depend on diagrams (Optics ray diagrams, Electrostatics field lines, Experimental Skills) need figure support (`fig` spec) before their templates can be as good; plan that as a framework step.

| Rank chapter (JEE Mains Physics) | Templates now | Still to write (target) |
|---|---|---|
| Units and Measurements | 0 | 70 (dimensions, errors, significant figures, vernier/screw gauge) |
| **Kinematics** | **103** | 0 (add graph-reading with figures later) |
| Laws of Motion | 0 | 90 |
| Work, Energy and Power | 0 | 90 |
| Rotational Motion | 0 | 100 |
| Gravitation | 0 | 80 |
| Properties of Solids and Liquids | 0 | 100 |
| Thermodynamics | 0 | 90 |
| Kinetic Theory of Gases | 0 | 70 |
| Oscillations and Waves | 0 | 100 |
| Electrostatics | 0 | 100 |
| Current Electricity | 0 | 100 |
| Magnetic Effects of Current and Magnetism | 0 | 90 |
| Electromagnetic Induction and Alternating Current | 0 | 90 |
| Electromagnetic Waves | 0 | 40 |
| Optics | 0 | 100 |
| Dual Nature of Matter and Radiation | 0 | 70 |
| Atoms and Nuclei | 0 | 80 |
| Electronic Devices | 0 | 50 |
| Experimental Skills | 0 | 50 |

Total still to write: about 1,560 templates. The same chapter files can later also serve NEET (different `exam` and difficulty mix) with no new framework code.

## Honest limits
* Verification proves the answer is right for the question as written, by two methods. It cannot prove the wording is good: read samples of every new chapter.
* Many templates are parametric variants of textbook patterns. They train the method; they are not a copy of any exam paper.
* Angles 37 and 53 use the exam convention (sin 37 = 0.6); questions say so.
* No diagrams in generated questions yet.
