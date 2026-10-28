/* Regression test for tools/pyq-ingest/ingest.js on a synthetic two-column PDF made here (no real book is stored in the repo).
   Needs Chromium: NODE_PATH=/tmp/nm CHROMIUM=/opt/pw-browsers/chromium node tools/pyq-ingest/ingest.test.js */
'use strict';
const fs = require('fs'), os = require('os'), path = require('path'), cp = require('child_process');
const { chromium } = require(process.env.PW || 'playwright-core');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ingest-')), pdf = path.join(tmp, 'book.pdf'), out = path.join(tmp, 'out');
const N = 30, KEYS = 'abcd', SKIP = 17;           // question 17 is rendered WITHOUT its number, to test gap handling
const fig = n => n % 7 === 0;
(async () => {
  let h = '<style>@page{size:595pt 842pt;margin:40pt 30pt}body{font:11pt sans-serif;margin:0}.c{column-count:2;column-gap:40pt}.q{break-inside:avoid;margin:0 0 12pt}.k{page-break-before:always}</style><div class="c">';
  for (let n = 1; n <= N; n++) h += `<div class="q">${n === SKIP ? '' : n + '. '}A body of mass ${n} kg moves with speed ${n + 2} m/s. Find the momentum number ${n}.${fig(n) ? '<br><svg width="150" height="90"><rect x="5" y="5" width="140" height="80" fill="none" stroke="#000"/><circle cx="75" cy="45" r="30" fill="#999"/></svg><br>As shown in the figure.' : ''}<br>(a) 1 (b) 2<br>(c) 3 (d) 4<br>(Main ${2000 + n}, 1st Jan Shift 1)</div>`;
  h += '</div><div class="k"><h2>ANSWER KEY</h2><p>' + Array.from({ length: N }, (_, i) => `${i + 1}. (${KEYS[(i + 1) % 4]}) `).join(' ') + '</p></div>';
  const b = await chromium.launch({ executablePath: process.env.CHROMIUM }), p = await b.newPage(); await p.setContent(h); await p.pdf({ path: pdf, preferCSSPageSize: true }); await b.close();
  const run = (...a) => cp.execFileSync('node', [path.join(__dirname, 'ingest.js'), ...a], { encoding: 'utf8' });
  const log = run('prep', pdf, out), D = JSON.parse(fs.readFileSync(path.join(out, 'draft.json'), 'utf8')).draft;
  let fail = 0; const t = (ok, m) => { console.log((ok ? 'PASS ' : 'FAIL ') + m); if (!ok) fail++ };
  t(D.length === N, `all ${N} numbers present in order (got ${D.length})`);
  t(D.filter(d => d.missing).map(d => d.n).join() === String(SKIP), 'the one number without a marker is reported as missing');
  t(D.find(d => d.n === SKIP - 1)?.also?.includes(SKIP), 'its neighbour crop is told that it also holds that question');
  t(D.every(d => d.missing || (d.crop && fs.statSync(path.join(out, d.crop)).size > 500)), 'a crop PNG exists for every found question');
  t(D.filter(d => !d.missing).every(d => d.key === KEYS[d.n % 4]), 'answer keys read correctly from the key page');
  t(D.filter(d => !d.missing).every(d => d.fig === fig(d.n)), 'diagram questions flagged exactly (' + D.filter(d => d.fig).map(d => d.n).join(',') + ')');
  t(D.filter(d => !d.missing).every(d => d.y === `Main ${2000 + d.n}, 1st Jan Shift 1`), 'exam tag read from the text layer');
  t(D.filter(d => !d.missing).every(d => d.options >= 4), 'option markers counted');
  // check(): entries that match the PDF pass; a wrong key and a missing question are reported
  const ent = D.filter(d => !d.missing).map(d => ({ pn: d.n, q: 'x', o: ['1', '2', '3', '4'], c: KEYS.indexOf(d.key), s: 's', fig: fig(d.n) ? { t: 'x' } : undefined }));
  const f = path.join(tmp, 'e.js'); const wr = e => fs.writeFileSync(f, 'window.PhysicaRankPyqTest=' + JSON.stringify(e));
  wr(ent); let r = cp.spawnSync('node', [path.join(__dirname, 'ingest.js'), 'check', out, f], { encoding: 'utf8' });
  t(/not matched 1: 17/.test(r.stdout) && !/key in PDF/.test(r.stdout), 'check: complete entries pass except the missing number');
  const bad = ent.map((e, i) => i === 3 ? { ...e, c: (e.c + 1) % 4 } : e).filter(e => e.pn !== 5); wr(bad); r = cp.spawnSync('node', [path.join(__dirname, 'ingest.js'), 'check', out, f], { encoding: 'utf8' });
  t(/Q4: key in PDF/.test(r.stdout) && /not matched 2: 5,17/.test(r.stdout) && r.status === 1, 'check: wrong key and missing entry are reported, exit code 1');
  fs.writeFileSync(path.join(out, 'entries-b.jsonl'), ent.slice(10).map(e => JSON.stringify(e)).join('\n')); fs.writeFileSync(path.join(out, 'entries-a.jsonl'), ent.slice(0, 10).map(e => JSON.stringify(e)).join('\n') + '\n');
  const asm = path.join(tmp, 'rank-pyq-test.js'); run('assemble', out, asm, 'PhysicaRankPyqTest', 'test'); const w = {}; new Function('window', fs.readFileSync(asm, 'utf8'))(w);
  t(w.PhysicaRankPyqTest.length === ent.length && w.PhysicaRankPyqTest.every((e, i, a) => !i || a[i - 1].pn < e.pn), 'assemble: entries from several files are merged and sorted by pn');
  const nb = run('batches', out, '10'); t(/3 batch files/.test(nb), 'batch work lists written');
  fs.rmSync(tmp, { recursive: true, force: true }); console.log(fail ? fail + ' FAILED' : 'ALL INGEST CHECKS PASSED'); process.exit(fail ? 1 : 0);
})();
