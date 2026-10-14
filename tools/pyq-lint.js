/* Checks the Rank mode past-year question files (rank-pyq-*.js) for structural mistakes:
   answer kinds, option counts, answer index range, exam labels, brace markup, duplicate options, diagram shapes,
   figure mentioned but missing. It cannot judge physics: every new chapter must also get the independent
   solve-it-blind verification pass described in START-HERE.txt ("Quality rules for every chapter").
   Run:  node tools/pyq-lint.js            (exit code 1 if anything is wrong) */
const vm = require('vm'), fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const FILES = fs.readdirSync(root).filter(f => /^rank-pyq-.+\.js$/.test(f) && !f.endsWith('.min.js'));
const LABEL = /^(JEE Main|JEE Advanced|IIT-JEE|AIEEE) (19|20)\d\d( · .+)?$/;
const SHAPES = { l: 4, c: 3, r: 4, t: 2, p: 0 };
let bad = 0, total = 0;
for (const f of FILES) {
  const w = {}; vm.createContext(w); w.window = w; vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), w);
  const key = Object.keys(w).find(k => /^PhysicaRankPyq/.test(k)); const L = w[key] || [];
  L.forEach((q, i) => {
    total++;
    const e = m => { bad++; console.log(`${f} #${i}: ${m}`); };
    if (!LABEL.test(q.y || '')) e('exam label "' + q.y + '"');
    if (!q.tp || !q.st) e('missing topic or sub-topic');
    if (!q.q || !q.s || q.s.length < 20) e('missing question or solution');
    const kinds = (q.o ? 1 : 0) + (q.n != null ? 1 : 0) + (q.a != null ? 1 : 0);
    if (kinds !== 1) e('needs exactly one of o+c, n, a');
    if (q.o) {
      if (q.o.length < 2 || q.o.length > 4) e('option count');
      const cs = [].concat(q.c); if (!cs.length || cs.some(k => !Number.isInteger(k) || k < 0 || k >= q.o.length)) e('answer index out of range');
    }
    for (const s of [q.q, q.s, q.a, ...(q.o || [])].filter(x => typeof x === 'string')) {
      let d = 0; for (const ch of s) { if (ch === '{') d++; if (ch === '}') d--; if (d < 0) break; }
      if (d !== 0) e('unbalanced { } in "' + s.slice(0, 50) + '"');
      if (/undefined|NaN|\[object/.test(s)) e('bad token in "' + s.slice(0, 50) + '"');
    }
    if (q.o && new Set(q.o.map(x => x.trim())).size < q.o.length) e('duplicate options (check the book)');
    if (!q.fig && /\bfigure\b|shown below|as shown|graph (shown|given)|given graph/i.test(q.q)) e('mentions a figure but has none');
    if (q.fig) {
      if (!q.fig.alt || !(q.fig.w > 0) || !(q.fig.h > 0) || !Array.isArray(q.fig.d)) e('diagram needs w, h, alt, d');
      for (const it of q.fig.d || []) {
        const n = SHAPES[it[0]];
        if (n === undefined || (it[0] === 'p' ? typeof it[1] !== 'string' : !it.slice(1, 1 + n).every(v => typeof v === 'number' && isFinite(v)))) e('bad diagram item ' + JSON.stringify(it).slice(0, 50));
      }
    }
  });
}
console.log(`${total} questions checked in ${FILES.length} files, ${bad} problem${bad === 1 ? '' : 's'}`);
process.exit(bad ? 1 : 0);
