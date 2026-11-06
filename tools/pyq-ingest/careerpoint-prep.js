#!/usr/bin/env node
/* Model-free first pass over a "Paper & Solution" PDF that has a text layer (Career Point style: "Q.n", options "(1)..(4)", "Ans. [k]", "Sol.").
     node tools/pyq-ingest/careerpoint-prep.js <paper.pdf> <workdir> [firstPage lastPage] [--batch 12]
   Writes  <workdir>/drafts.jsonl   one line per question: {pn, page, q, o:[4], key, sol, maths, figpage}
           <workdir>/batches/b-NN.md  the same, in groups, for a text-only agent (tag the chapter, rewrite the solution, fix maths from the page image ONLY when `maths` is set)
   Why: the printed words, options and keys are copied by code instead of being read from a picture by a model (same quality, far fewer tokens).
   `maths`  = the text layer is probably damaged here (Greek letters, roots, integrals, or many one-letter fragments): the agent must open the page image.
   `fig` / `thin` = the question may have a picture / the solution text is nearly empty: the agent opens the page image for those too. `figpage` (a big image somewhere on the page) is kept only as a hint.
   Limits: needs sequential question numbers; a question whose options are not (1)-(4) in order gets o:[] and is listed in the report for a person. */
'use strict';
const { execFileSync } = require('child_process'), fs = require('fs'), path = require('path');
const a = process.argv.slice(2), bi = a.indexOf('--batch'), size = bi >= 0 ? +a.splice(bi, 2)[1] : 12;
const [pdf, work, f1 = 1, f2] = a;
if (!pdf || !work) { console.error('usage: careerpoint-prep.js <paper.pdf> <workdir> [firstPage lastPage] [--batch 12]'); process.exit(2) }
const range = f2 ? ['-f', String(f1), '-l', String(f2)] : [];
const pages = execFileSync('pdftotext', ['-layout', ...range, pdf, '-'], { encoding: 'utf8', maxBuffer: 1 << 28 }).split('\f');
// pages that hold a real picture (the logo images are 69x80 and 191x228 and are ignored)
const bigPages = new Set(); for (const l of execFileSync('pdfimages', ['-list', ...range, pdf], { encoding: 'utf8', maxBuffer: 1 << 26 }).split('\n').slice(2)) { const c = l.trim().split(/\s+/); if (c.length > 4 && +c[3] > 80 && +c[4] > 80 && !(c[3] === '69' && c[4] === '80') && !(c[3] === '191' && c[4] === '228')) bigPages.add(+c[0]) }
const JUNK = /^\s*(CAREER POINT|Students may find similar|\[\s*Chapter\s*:)|CAREER POINT Ltd|www\.careerpoint|^\s*\d{1,3}\s*$/;   // header, footer, promo lines, bare page numbers
const MATHS = /[α-ωΑ-Ω∫√∑∞≈≠≤≥±∝∆∇→⇌]/;
const rows = []; let cur = null, mode = 'q', pg = +f1 - 1;
for (const page of pages) {
  pg++; if (!page.trim()) continue;
  for (const raw of page.split('\n')) {
    if (JUNK.test(raw)) continue; const line = raw.replace(/\s+$/, ''); if (!line.trim()) continue;
    // "Q.12 text" or (some papers, e.g. Re-NEET 2022 Q101-150) a bare "101.  text"; the bare form only counts when it is exactly the next number
    const qd = /^\s*Q\.\s*(\d+)\s*(.*)$/.exec(line), qb = !qd && /^\s{0,12}(\d{1,3})\.\s+(.*)$/.exec(line), q = qd || (qb && rows.length && +qb[1] === rows[rows.length - 1].pn + 1 ? qb : null);
    if (q && (!rows.length || +q[1] === rows[rows.length - 1].pn + 1 || +q[1] === 1 || !cur)) { cur = { pn: +q[1], page: pg, body: [q[2]], sol: [], figpage: bigPages.has(pg) }; rows.push(cur); mode = 'q'; continue }
    if (!cur) continue; if (bigPages.has(pg)) cur.figpage = true;
    const k = /^\s*Ans\.?\s*\[([^\]]*)\]\s*(.*)$/.exec(line); if (k) { cur.key = k[1].trim(); mode = 's'; continue }
    const s = /^\s*Sol\.?\s*(.*)$/.exec(line); if (s && mode !== 'q') { mode = 's'; if (s[1]) cur.sol.push(s[1]); continue }
    (mode === 'q' ? cur.body : cur.sol).push(mode === 'q' ? line : line.trim());
  }
}
const out = rows.map(r => {
  const body = r.body.join('\n'), marks = [...body.matchAll(/\(\s*([1-4])\s*\)/g)];
  let at = -1; for (let i = marks.length - 4; i >= 0; i--) if (marks.slice(i, i + 4).every((m, j) => +m[1] === j + 1)) { at = i; break }   // the LAST sequential (1)(2)(3)(4) group are the options; earlier (1)(2) lists belong to the stem
  let o = [], q = body.trim();
  if (at >= 0) { const m = marks.slice(at, at + 4); q = body.slice(0, m[0].index).trim(); o = m.map((x, j) => body.slice(x.index + x[0].length, j < 3 ? m[j + 1].index : undefined).replace(/\s*\n\s*/g, ' ').trim()) }
  const sol = r.sol.join('\n'), short = (sol.match(/^.{1,3}$/gm) || []).length;
  // fig = the question probably has a picture (a cue word, or an option that is empty because it is a drawing); thin = the solution text is nearly empty (it is probably a picture)
  const fig = /figure|diagram|graph|plot|circuit|curve|as shown|shown in|structure|arrow|\bpath\b/i.test(q + ' ' + o.join(' ')) || o.some(x => x.length < 2) || o.length !== 4, thin = sol.replace(/\s/g, '').length < 25;
  return { pn: r.pn, page: r.page, q, o, key: r.key ?? null, sol, maths: MATHS.test(q + o.join(' ') + sol) || short >= 3, fig, thin, figpage: r.figpage }
});
fs.mkdirSync(path.join(work, 'batches'), { recursive: true });
fs.writeFileSync(path.join(work, 'drafts.jsonl'), out.map(r => JSON.stringify(r)).join('\n') + '\n');
for (let i = 0; i < out.length; i += size) fs.writeFileSync(path.join(work, 'batches', `b-${String(i / size + 1).padStart(2, '0')}.md`), out.slice(i, i + size).map(r => `## Q${r.pn} (pdf page ${r.page})${[r.maths && 'maths', r.fig && 'picture?', r.thin && 'solution is thin'].filter(Boolean).map(x => ' [OPEN PAGE IMAGE: ' + x + ']').join('')}\n${r.q}\n${r.o.map((x, j) => `(${j + 1}) ${x}`).join('\n')}\nAns. [${r.key}]\nSol. ${r.sol}\n`).join('\n'));
const bad = out.filter(r => r.o.length !== 4 || r.key === null).map(r => r.pn), gaps = []; for (let n = 1; n <= (out.length ? Math.max(...out.map(r => r.pn)) : 0); n++) if (!out.some(r => r.pn === n)) gaps.push(n);
console.log(`questions ${out.length}; numbers missing ${gaps.join(',') || 'none'}; without 4 options or key ${bad.join(',') || 'none'}; image needed for ${out.filter(r => r.maths || r.fig || r.thin).length} (maths ${out.filter(r => r.maths).length}, picture? ${out.filter(r => r.fig).length}, thin solution ${out.filter(r => r.thin).length}); batches ${Math.ceil(out.length / size)}`);
