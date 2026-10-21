#!/usr/bin/env node
/* Test Series content tool. No dependencies.
     node tools/series-import.js check  <dir>              -> validate every content file under <dir>, print problems, exit 1 on any
     node tools/series-import.js static <dir> [--out tests] -> validate, then write the public site files: tests/index.json, tests/<EXAM>/<NN>-<paper>.json (questions),
                                                              tests/<EXAM>/<NN>-<paper>.key.json (answers + solutions, fetched only after submit), tests/img/*.webp
     node tools/series-import.js sample <dir> [exam ...]   -> write synthetic full-size SAMPLE tests (for demos / tests only, never publish them)
   GitHub-only mode: everything under tests/ is public (anyone can read the answers), so ONLY free tests 1-3 are accepted. Paid tests need a server.
   One file per test, e.g. content/NEET/01.json, content/JEE_ADV/02-p2.json:
     { "exam": "NEET", "series": 1, "paper": 1, "pattern": "NEET_2027", "title": null,
       "q": [ { "b": "question text", "o": ["opt A","opt B","opt C","opt D"], "k": "B", "e": "solution", "f": "figure-key", "fa": "figure alt text" }, ... ] }
   k: MCQ "B" | MULTI "AC" (sorted) | NUM "12.5" or a range "12.3:12.7" | "*" = bonus (everyone gets the marks).
   Text rules: plain text. Write x_2 / x^2 / v_{0} for sub/superscripts, use Unicode for symbols (α ∫ √ ≤ ½ ²). No HTML.
   Figures: put <dir>/img/<figure-key>.webp (small, 10-40 KB); it is copied to tests/img/. */
'use strict';
const fs = require('fs'), path = require('path');
const PAT = JSON.parse(fs.readFileSync(path.join(__dirname, 'patterns.json'), 'utf8')).patterns;
let FREE_ONLY = false;
const total = p => p.sections.reduce((a, s) => a + s.n, 0);

function* walk(d) { for (const f of fs.readdirSync(d).sort()) { const p = path.join(d, f); fs.statSync(p).isDirectory() ? yield* walk(p) : /\.json$/.test(f) && (yield p); } }

function validate(t, file) {
  const errs = [], E = m => errs.push(`${file}: ${m}`);
  const pat = PAT[t.pattern]; if (!pat) { E(`unknown pattern "${t.pattern}"`); return errs; }
  if (pat.exam !== t.exam) E(`pattern ${t.pattern} is for ${pat.exam}, not ${t.exam}`);
  if (!Number.isInteger(t.series) || t.series < 1 || t.series > 30) E('series must be 1..30');
  else if (t.series > 3 && FREE_ONLY) E('series ' + t.series + ' is a paid test: GitHub-only mode publishes answers to everyone, so only free tests 1-3 are accepted');
  const paper = t.paper || 1; if (paper < 1 || paper > pat.papers) E(`paper must be 1..${pat.papers}`);
  if (!Array.isArray(t.q)) { E('"q" must be an array'); return errs; }
  if (t.q.length !== total(pat)) E(`needs exactly ${total(pat)} questions for ${t.pattern}, has ${t.q.length}`);
  let gi = 0; const seen = new Map();
  for (const sec of pat.sections) for (let i = 0; i < sec.n; i++, gi++) {
    const q = t.q[gi], where = `Q${gi + 1} (${sec.id} ${sec.t})`; if (!q) continue;
    if (typeof q.b !== 'string' || !q.b.trim() || q.b.length > 4000) E(`${where}: text 1-4000 chars`);
    if (/[<>]/.test(q.b || '')) E(`${where}: "<" or ">" found; the app shows text as-is, write plain text`);
    if (seen.has(q.b)) E(`${where}: same text as Q${seen.get(q.b)} (repeated data)`); else seen.set(q.b, gi + 1);
    if (typeof q.k !== 'string') { E(`${where}: missing key "k"`); continue; }
    if (sec.t === 'NUM') {
      if (q.o) E(`${where}: numerical questions have no options`);
      if (q.k !== '*') { if (!/^-?\d+(\.\d+)?(:-?\d+(\.\d+)?)?$/.test(q.k)) E(`${where}: numerical key "${q.k}"`); else if (q.k.includes(':')) { const [a, b] = q.k.split(':').map(Number); if (a > b) E(`${where}: range reversed`); } }
    } else {
      if (!Array.isArray(q.o) || q.o.length < 2 || q.o.length > 6) { E(`${where}: needs 2-6 options`); continue; }
      q.o.forEach((o, j) => { if (typeof o !== 'string' || !o.trim() || o.length > 600) E(`${where}: option ${'ABCDEF'[j]} empty or too long`); if (/[<>]/.test(o)) E(`${where}: "<" / ">" in option ${'ABCDEF'[j]}`); });
      const last = String.fromCharCode(64 + q.o.length);
      if (q.k !== '*') {
        if (sec.t === 'MCQ' && !new RegExp(`^[A-${last}]$`).test(q.k)) E(`${where}: key "${q.k}" must be one letter A-${last}`);
        if (sec.t === 'MULTI' && (!new RegExp(`^[A-${last}]+$`).test(q.k) || q.k !== [...new Set(q.k)].sort().join(''))) E(`${where}: key "${q.k}" must be sorted distinct letters A-${last}`);
      }
    }
    if (q.f && !/^[A-Za-z0-9_-]{16,64}$/.test(q.f)) E(`${where}: figure key must be 16-64 chars [A-Za-z0-9_-]`);
    if (q.f && !(q.fa || '').trim()) E(`${where}: figure needs alt text "fa" (for blind and low-vision students)`);
    if ((q.e || '').length > 5000) E(`${where}: solution too long`);
  }
  return errs;
}

function sample(dir, exams) {
  const rnd = (seed => () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296)(7);
  const jobs = [['JEE_MAIN', 'JEE_MAIN_2027'], ['NEET', 'NEET_2027'], ['JEE_ADV', 'JEE_ADV_2027']].filter(j => !exams.length || exams.includes(j[0]));
  for (const [exam, pid] of jobs) {
    const pat = PAT[pid];
    for (let series = 1; series <= 5; series++) for (let paper = 1; paper <= pat.papers; paper++) {
      const q = []; let gi = 0;
      for (const sec of pat.sections) for (let i = 0; i < sec.n; i++, gi++) {
        const o = { b: `SAMPLE ${exam} test ${series}${pat.papers > 1 ? ' paper ' + paper : ''}, ${sec.s.toLowerCase()} ${sec.nm}, question ${i + 1}: a body of mass m_${i + 1} moves with speed v^2 = ${i + 3}.` };
        if (sec.t === 'NUM') { o.k = String(Math.floor(rnd() * 90) + 1); }
        else { o.o = ['first option', 'second option', 'third option', 'fourth option']; o.k = sec.t === 'MCQ' ? 'ABCD'[Math.floor(rnd() * 4)] : [...new Set(Array.from({ length: 1 + Math.floor(rnd() * 3) }, () => 'ABCD'[Math.floor(rnd() * 4)]))].sort().join(''); }
        o.e = `Sample solution ${gi + 1}.`;
        if (gi % 40 === 7) { o.f = 'fig' + exam.replace('_', '') + series + 'x' + gi + 'abcdefghij'; o.fa = 'A sample circuit diagram'; }
        q.push(o);
      }
      const f = path.join(dir, exam, String(series).padStart(2, '0') + (pat.papers > 1 ? '-p' + paper : '') + '.json');
      fs.mkdirSync(path.dirname(f), { recursive: true });
      fs.writeFileSync(f, JSON.stringify({ exam, series, paper, pattern: pid, title: `SAMPLE ${series}`, q }));
    }
  }
}

const [cmd, dir, ...rest] = process.argv.slice(2);
if (cmd === 'check' || cmd === 'static') {
  if (!dir) { console.error('give the content folder'); process.exit(2); }
  FREE_ONLY = cmd === 'static';
  const errs = [], good = []; const keys = new Set();
  for (const f of walk(dir)) {
    let t; try { t = JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { errs.push(`${f}: not valid JSON (${e.message})`); continue; }
    const id = `${t.exam}/${t.series}/${t.paper || 1}`; if (keys.has(id)) errs.push(`${f}: duplicate test ${id}`); keys.add(id);
    const e = validate(t, path.relative(dir, f)); errs.push(...e);
    if (!e.length) {
      for (const q of t.q) if (q.f && cmd === 'static' && !fs.existsSync(path.join(dir, 'img', q.f + '.webp'))) errs.push(`${path.relative(dir, f)}: figure file img/${q.f}.webp not found`);
      good.push(t);
    }
  }
  if (errs.length) { console.error(errs.join('\n') + `\n\n${errs.length} problem(s). Nothing was written.`); process.exit(1); }
  if (cmd === 'check') console.log(`OK: ${good.length} test file(s) are valid.`);
  else {
    const oi = rest.indexOf('--out'), out = oi >= 0 ? rest[oi + 1] : 'tests';
    fs.rmSync(out, { recursive: true, force: true });
    const patterns = {}, tests = [];
    for (const t of good.sort((a, b) => a.exam.localeCompare(b.exam) || a.series - b.series || (a.paper || 1) - (b.paper || 1))) {
      const p = t.paper || 1, nn = String(t.series).padStart(2, '0'), pat = PAT[t.pattern];
      patterns[t.pattern] = { label: pat.label, minutes: pat.minutes, papers: pat.papers, sections: pat.sections };
      fs.mkdirSync(path.join(out, t.exam), { recursive: true });
      fs.writeFileSync(path.join(out, t.exam, `${nn}-${p}.json`), JSON.stringify({ qs: t.q.map(q => { const o = { b: q.b }; if (q.o) o.o = q.o; if (q.f) { o.f = q.f; o.a = q.fa; } return o; }) }));
      fs.writeFileSync(path.join(out, t.exam, `${nn}-${p}.key.json`), JSON.stringify({ ks: t.q.map(q => { const o = { k: q.k }; if (q.e) o.e = q.e; return o; }) }));
      tests.push({ id: `${t.exam}-${t.series}-${p}`, exam: t.exam, n: t.series, p, pat: t.pattern, t: t.title || undefined });
      for (const q of t.q) if (q.f) { fs.mkdirSync(path.join(out, 'img'), { recursive: true }); fs.copyFileSync(path.join(dir, 'img', q.f + '.webp'), path.join(out, 'img', q.f + '.webp')); }
    }
    fs.mkdirSync(out, { recursive: true });
    fs.writeFileSync(path.join(out, 'index.json'), JSON.stringify({ patterns, tests }));
    console.log(`${good.length} test(s) written to ${out}/`);
  }
} else if (cmd === 'sample') { if (!dir) { console.error('give an output folder'); process.exit(2); } sample(dir, rest); console.log('sample tests written to ' + dir); }
else { console.error(fs.readFileSync(__filename, 'utf8').split('\n').slice(1, 6).join('\n')); process.exit(2); }
