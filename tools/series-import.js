#!/usr/bin/env node
/* Test Series content tool. No dependencies.
     node tools/series-import.js patterns                 -> SQL that creates/updates the exam patterns (from supabase/patterns.json)
     node tools/series-import.js check  <dir>             -> validate every content file under <dir>, print problems, exit 1 on any
     node tools/series-import.js sql    <dir> [--publish] -> SQL that loads every test under <dir> (add --publish to also make them live)
     node tools/series-import.js sample <dir> [exam ...]  -> write synthetic full-size SAMPLE tests (for demos / tests only, never publish them)
   Run the printed SQL in Supabase with:  psql "$DATABASE_URL" -f out.sql     (the SQL editor also works for small files)
   One file per test, e.g. content/NEET/04.json, content/JEE_ADV/07-p2.json:
     { "exam": "NEET", "series": 4, "paper": 1, "pattern": "NEET_2026", "title": null, "price": null,
       "q": [ { "b": "question text", "o": ["opt A","opt B","opt C","opt D"], "k": "B", "e": "solution", "f": "figure-key", "fa": "figure alt text" }, ... ] }
   k: MCQ "B" | MULTI "AC" (sorted) | NUM "12.5" or a range "12.3:12.7" | "*" = bonus (everyone gets the marks).
   Text rules: plain text. Write x_2 / x^2 / v_{0} for sub/superscripts, use Unicode for symbols (α ∫ √ ≤ ½ ²). No HTML. */
'use strict';
const fs = require('fs'), path = require('path');
const PAT = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'supabase', 'patterns.json'), 'utf8')).patterns;
const lit = s => "'" + String(s).replace(/'/g, "''") + "'";
const total = p => p.sections.reduce((a, s) => a + s.n, 0);

function* walk(d) { for (const f of fs.readdirSync(d).sort()) { const p = path.join(d, f); fs.statSync(p).isDirectory() ? yield* walk(p) : /\.json$/.test(f) && (yield p); } }

function validate(t, file) {
  const errs = [], E = m => errs.push(`${file}: ${m}`);
  const pat = PAT[t.pattern]; if (!pat) { E(`unknown pattern "${t.pattern}"`); return errs; }
  if (pat.exam !== t.exam) E(`pattern ${t.pattern} is for ${pat.exam}, not ${t.exam}`);
  if (!Number.isInteger(t.series) || t.series < 1 || t.series > 30) E('series must be 1..30');
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

function testSql(t, publish) {
  const pat = PAT[t.pattern], paper = t.paper || 1, tag = '$j' + Math.random().toString(36).slice(2, 8) + '$';
  const qs = t.q.map(q => { const o = { b: q.b }; if (q.o) o.o = q.o; if (q.f) { o.f = q.f; o.a = q.fa; } return o; });
  const ks = t.q.map(q => { const o = { k: q.k }; if (q.e) o.e = q.e; return o; });
  const q1 = JSON.stringify(qs), k1 = JSON.stringify(ks);
  if (q1.includes(tag) || k1.includes(tag)) throw new Error('dollar tag clash');
  const sel = `(select id from public.tests where exam = ${lit(t.exam)} and series_no = ${t.series} and paper = ${paper})`;
  return `-- ${t.exam} test ${t.series}${paper > 1 ? ' paper ' + paper : ''}\n` +
    `insert into public.tests (exam, pattern_id, series_no, paper, title, price_paise) values (${lit(t.exam)}, ${lit(t.pattern)}, ${t.series}, ${paper}, ${t.title ? lit(t.title) : 'null'}, ${t.price == null ? 'null' : Math.round(t.price * 100)})\n` +
    `  on conflict (exam, series_no, paper) do update set pattern_id = excluded.pattern_id, title = excluded.title, price_paise = excluded.price_paise;\n` +
    `insert into public.test_content (test_id, qs) values (${sel}, ${tag}${q1}${tag}::jsonb) on conflict (test_id) do update set qs = excluded.qs;\n` +
    `insert into public.test_keys (test_id, ks) values (${sel}, ${tag}${k1}${tag}::jsonb) on conflict (test_id) do update set ks = excluded.ks;\n` +
    (publish ? `update public.tests set published = true where id = ${sel};\n` : '') + '\n';
}

function sample(dir, exams) {
  const rnd = (seed => () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296)(7);
  const jobs = [['JEE_MAIN', 'JEE_MAIN_2026'], ['NEET', 'NEET_2026'], ['JEE_ADV', 'JEE_ADV_2026']].filter(j => !exams.length || exams.includes(j[0]));
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
if (cmd === 'patterns') {
  let out = '-- exam patterns (generated by tools/series-import.js from supabase/patterns.json)\n';
  for (const [id, p] of Object.entries(PAT)) {
    for (const s of p.sections) if (!['MCQ', 'MULTI', 'NUM'].includes(s.t) || s.w > 0 || s.n < 1) { console.error(`bad section ${id}/${s.id}`); process.exit(1); }
    out += `insert into public.exam_patterns (id, exam, label, minutes, papers, sections) values (${lit(id)}, ${lit(p.exam)}, ${lit(p.label)}, ${p.minutes}, ${p.papers}, $s$${JSON.stringify(p.sections)}$s$::jsonb)\n  on conflict (id) do update set exam = excluded.exam, label = excluded.label, minutes = excluded.minutes, papers = excluded.papers, sections = excluded.sections;\n`;
  }
  process.stdout.write(out);
} else if (cmd === 'check' || cmd === 'sql') {
  if (!dir) { console.error('give the content folder'); process.exit(2); }
  const errs = []; let sql = '-- generated by tools/series-import.js\nbegin;\n', n = 0; const keys = new Set();
  for (const f of walk(dir)) {
    let t; try { t = JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { errs.push(`${f}: not valid JSON (${e.message})`); continue; }
    const id = `${t.exam}/${t.series}/${t.paper || 1}`; if (keys.has(id)) errs.push(`${f}: duplicate test ${id}`); keys.add(id);
    const e = validate(t, path.relative(dir, f)); errs.push(...e); if (!e.length) { sql += testSql(t, rest.includes('--publish')); n++; }
  }
  if (errs.length) { console.error(errs.join('\n') + `\n\n${errs.length} problem(s). Nothing was written.`); process.exit(1); }
  if (cmd === 'check') console.log(`OK: ${n} test file(s) are valid.`); else process.stdout.write(sql + 'commit;\n');
} else if (cmd === 'sample') { if (!dir) { console.error('give an output folder'); process.exit(2); } sample(dir, rest); console.log('sample tests written to ' + dir); }
else { console.error(fs.readFileSync(__filename, 'utf8').split('\n').slice(1, 8).join('\n')); process.exit(2); }
