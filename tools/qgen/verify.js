/* Independent verification of generated questions.
   Every template has solve (make().ans, closed form) and check() (a different method: simulation, integration, another formula).
   This file asserts, for ALL generated records: both agree, the stored answer matches check(), the correct option is present
   exactly once, options are distinct, nothing is NaN/Infinity, answers are physically sensible, no unresolved placeholders,
   2-8 solution lines, no duplicate questions. Any error fails the build. */
'use strict';
const { BAD_TEXT } = require('./lib');

const num = s => parseFloat(String(s).replace('−', '-'));
const decimals = s => { const m = /[.](\d+)/.exec(String(s).split(' ')[0]); return m ? m[1].length : 0; };

function verifyChapter(chapter, recs) {
  const errs = [], add = (code, r, msg) => errs.push({ code, t: r.t, msg });
  const byId = new Map(chapter.templates.map(t => [t.id, t])), texts = new Map(), keys = new Set(), per = {};
  const ids = new Set();
  for (const t of chapter.templates) {
    if (ids.has(t.id)) add('dup-template-id', t, 'template id used twice');
    ids.add(t.id);
    for (const f of ['id', 'tp', 'st', 'gen', 'make', 'check']) if (t[f] == null) add('bad-template', t, 'missing ' + f);
    if (![1, 2, 3].includes(t.diff)) add('bad-difficulty', t, 'diff must be 1, 2 or 3');
    const ty = Array.isArray(t.type) ? t.type : [t.type];
    if (!ty.length || ty.some(x => x !== 'mcq' && x !== 'numeric')) add('bad-type', t, 'type must be mcq or numeric');
    if (chapter.topics && !chapter.topics[t.tp]) add('bad-topic', t, 'tp ' + t.tp + ' not in chapter topics');
  }
  for (const r of recs) {
    if (r.error) { add('template-error', r, r.error); continue; }
    const t = byId.get(r.t);
    per[r.t] = (per[r.t] || 0) + 1;
    const o = r.out;
    // numbers sane
    for (const [k, v] of Object.entries({ ans: r.ans, chk: r.chk })) if (!Number.isFinite(v)) add('not-finite', r, k + ' = ' + v);
    for (const [k, v] of Object.entries(r.p || {})) if (typeof v === 'number' && !Number.isFinite(v)) add('not-finite', r, 'param ' + k);
    if (!Number.isFinite(r.ans) || !Number.isFinite(r.chk)) continue;
    // solve vs check (different method)
    const tol = (t.tol || 1e-6) * Math.max(1, Math.abs(r.ans));
    if (Math.abs(r.ans - r.chk) > tol) add('solve-check-mismatch', r, `solve ${r.ans} vs check ${r.chk} for ${JSON.stringify(r.p)}`);
    if (r.pos && !(r.ans > 0)) add('not-physical', r, 'answer must be positive: ' + r.ans);
    if (Math.abs(r.ans) > 1e7) add('not-physical', r, 'absurd magnitude ' + r.ans);
    // stored answer against the independent value
    const slack = 0.5 * Math.pow(10, -r.dp) + tol + 1e-9;
    if (o.o) {
      if (!Array.isArray(o.o) || o.o.length !== 4) { add('bad-options', r, 'need 4 options'); continue; }
      if (!(o.c >= 0 && o.c < 4)) { add('no-correct', r, 'c out of range'); continue; }
      if (new Set(o.o).size !== 4) add('dup-options', r, o.o.join(' | '));
      const vals = o.o.map(num);
      if (vals.some(v => !Number.isFinite(v))) add('not-finite', r, 'option text ' + o.o.join(' | '));
      const hits = vals.filter(v => Math.abs(v - r.chk) <= slack).length;
      if (hits !== 1) add('correct-count', r, `${hits} options match the check value ${r.chk}: ${o.o.join(' | ')}`);
      if (!(Math.abs(vals[o.c] - r.chk) <= slack)) add('wrong-key', r, `marked option ${o.o[o.c]} but check says ${r.chk}`);
      if (new Set(vals.map(v => v.toFixed(6))).size !== 4) add('dup-options', r, 'numerically equal options');
      if (r.pos && vals.some(v => v <= 0)) add('not-physical', r, 'non-positive option ' + o.o.join(' | '));
      if (!/^[\d.−-]+( .+)?$/.test(o.o[0])) add('bad-options', r, 'option is not "number unit": ' + o.o[0]);
      if (o.n != null) add('bad-options', r, 'mcq has n');
    } else {
      if (!Number.isFinite(o.n)) add('not-finite', r, 'n');
      else if (Math.abs(o.n - r.chk) > slack) add('wrong-key', r, `stored ${o.n} but check says ${r.chk}`);
    }
    // text
    for (const f of [o.q, o.s, ...(o.o || [])]) if (BAD_TEXT.test(String(f))) add('placeholder', r, 'bad text: ' + String(f).slice(0, 80));
    if (!o.q || o.q.length < 15) add('empty-text', r, 'question too short');
    const lines = String(o.s || '').split('\n').filter(Boolean);
    if (lines.length < 2 || lines.length > 8) add('solution-length', r, lines.length + ' solution lines (need 2 to 8)');
    if (t && (r.why.length < 3 || r.why.some(w => !w)) && o.o) add('no-mistake-reasons', r, 'every distractor needs a named common mistake');
    // duplicates
    const tk = o.q + '|' + (o.o ? o.o.join('|') : o.n);
    if (texts.has(o.q)) add('dup-question', r, 'same text as ' + texts.get(o.q)); else texts.set(o.q, r.t);
    if (keys.has(o.k)) add('dup-key', r, 'key collision ' + o.k); keys.add(o.k);
    void tk;
  }
  for (const t of chapter.templates) if (!per[t.id] && !errs.some(e => e.t === t.id)) add('empty-template', t, 'produced no questions');
  return errs;
}
module.exports = { verifyChapter };

if (require.main === module) {
  const { generate } = require('./lib');
  const { loadChapters, SEED, writeAll } = require('./build');
  let bad = 0;
  for (const ch of loadChapters()) {
    const recs = generate(ch, SEED), errs = verifyChapter(ch, recs);
    console.log(`verify ${ch.subject}/${ch.key}: ${recs.length} questions, ${ch.templates.length} templates, ${errs.length} errors`);
    for (const e of errs.slice(0, 20)) console.log('  FAIL', e.code, e.t, e.msg);
    bad += errs.length;
  }
  // the committed files must be exactly what the verified templates produce
  const diff = writeAll(true);
  if (diff.length) { bad += diff.length; for (const d of diff) console.log('  FAIL stale-output', d); }
  else console.log('verify: committed qbank/ files match a fresh build');
  process.exit(bad ? 1 : 0);
}
