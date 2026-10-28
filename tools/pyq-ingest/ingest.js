#!/usr/bin/env node
/* PDF -> per-question crops + draft data, with ZERO model calls.
   Uses the PDF's own text layer (word boxes from pdftotext -bbox) to find question numbers, the exam tag, the answer key and
   likely diagram questions, then crops every question to a small PNG with pdftoppm. A model then only has to read the small
   crops (about 20x fewer image tokens than whole pages) and write the entries.
   usage: node tools/pyq-ingest/ingest.js prep <pdf> [outdir (default content/pyq-work/<pdf name>, git-ignored)] [--dpi 110] [--first 1] [--sol-from <page>] [--cols 2]
          node tools/pyq-ingest/ingest.js check <outdir> <entries.js> [globalName]   (completeness + key audit)
          node tools/pyq-ingest/ingest.js batches <outdir> [size 12]                  (agent work lists)
          node tools/pyq-ingest/ingest.js assemble <outdir> <rank-pyq-x.js> <PhysicaRankPyqX>   (entries-*.jsonl -> source file) */
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process');
const sh = (c, a) => cp.execFileSync(c, a, { maxBuffer: 1 << 28 });
const opt = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 ? process.argv[i + 1] : d; };

function words(pdf) {
  const html = sh('pdftotext', ['-bbox', pdf, '-']).toString('utf8'), pages = [];
  for (const blk of html.split('<page ').slice(1)) {
    const w = +/width="([\d.]+)"/.exec(blk)[1], h = +/height="([\d.]+)"/.exec(blk)[1], ws = [];
    for (const m of blk.matchAll(/<word xMin="([\d.]+)" yMin="([\d.]+)" xMax="([\d.]+)" yMax="([\d.]+)">([^<]*)<\/word>/g))
      ws.push({ x0: +m[1], y0: +m[2], x1: +m[3], y1: +m[4], t: m[5].replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&') });
    pages.push({ w, h, ws });
  }
  return pages;
}
const KEY = /^\(([a-e]|[a-e](?:[,;&]\s*[a-e])+|[1-5]|-?\d+(?:\.\d+)?)\)[:.]?$/i;
const NUM = /^(\d{1,3})[.:]?$/, BARE = /^\d{1,3}$/;    // OCR sometimes drops the full stop: a bare number counts only when it is exactly the next expected one

/* column boundary = the widest gap between the x positions of number-like words (two-column pages), else single column */
function colsOf(pg, ncols) {
  if (ncols === 1) return [[0, pg.w]];
  if (pg.bound === undefined) {
    if (pg.gbound) { pg.bound = pg.gbound; return [[0, pg.bound], [pg.bound, pg.w]] }
    const xs = pg.ws.filter(w => NUM.test(w.t) && /[.:]$/.test(w.t) && (!pg.cutY || w.y0 < pg.cutY)).map(w => w.x0).sort((p, q) => p - q), avg = a => a.reduce((s, v) => s + v, 0) / a.length, sse = a => { const m = avg(a); return a.reduce((s, v) => s + (v - m) ** 2, 0) };
    let best = Infinity, at = pg.w;      // 1-D two-means (Otsu): two clusters of marker x positions = two columns
    for (let i = 3; i <= xs.length - 3; i++) { const l = xs.slice(0, i), r = xs.slice(i), e = sse(l) + sse(r); if (e < best && avg(r) - avg(l) > 150) { best = e; at = (xs[i - 1] + xs[i]) / 2 } }
    pg.bound = at;
  }
  return [[0, pg.bound], [pg.bound, pg.w]];
}

/* markers: words like "40." at the left edge of a column. */
function markers(pg, ncols) {
  const out = [];
  colsOf(pg, ncols).forEach(([a, b], c) => {
    const cand = pg.ws.filter(w => w.x0 >= a && w.x0 < b && NUM.test(w.t) && (!pg.cutY || w.y0 < pg.cutY));
    if (!cand.length) return;
    const dotted = cand.filter(w => !BARE.test(w.t)), xs = (dotted.length ? dotted : cand).map(w => w.x0).sort((p, q) => p - q), left = xs[Math.floor(xs.length * 0.25)];   // typical left edge
    for (const w of cand) if (Math.abs(w.x0 - left) <= 14) out.push({ n: +NUM.exec(w.t)[1], col: c, x: w.x0, y: w.y0, b, bare: BARE.test(w.t) });
  });
  return out;
}
const keyAfter = (pg, m) => { const ln = pg.ws.filter(w => Math.abs(w.y0 - m.y) < 5 && w.x0 > m.x + 8 && w.x0 < m.x + 70 && KEY.test(w.t)).sort((p, q) => p.x0 - q.x0)[0]; return ln ? KEY.exec(ln.t)[1].toLowerCase() : null };

/* a diagram = a big blob of ink that is not text (needs python3 + Pillow + numpy; without them the keyword guess stays) */
function figScan(qs, out, dpi) {
  try {
    const s = dpi / 72, items = qs.map(q => ({ dpi, file: path.join(out, q.crop), words: q.words.map(w => [(w.x0 - q.box.x0) * s, (w.y0 - q.box.y0) * s, (w.x1 - q.box.x0) * s, (w.y1 - q.box.y0) * s]) }));
    fs.writeFileSync(path.join(out, 'figscan-in.json'), JSON.stringify(items));
    const r = JSON.parse(cp.execFileSync('python3', [path.join(__dirname, 'figscan.py'), path.join(out, 'figscan-in.json')], { maxBuffer: 1 << 26 }).toString());
    for (const q of qs) { const v = r[path.join(out, q.crop)]; if (v) { q.scanned = true; q.blobBig = v.fig; q.fig = v.fig && q.kw; q.maybe = v.fig && !q.kw; q.blob = v.blob } }
    fs.unlinkSync(path.join(out, 'figscan-in.json'));
  } catch (e) { console.log('figure scan skipped (' + String(e.message).split('\n')[0] + '): using the keyword guess only') }
}
function prep(pdf, out) {
  const dpi = +opt('dpi', 110), first = +opt('first', 1), ncols = +opt('cols', 2), pages = words(pdf), P = pages.length;
  fs.mkdirSync(path.join(out, 'crops'), { recursive: true });
  pages.forEach(pg => colsOf(pg, ncols));
  const ok = pages.filter(pg => pg.bound < pg.w).map(pg => pg.bound).sort((a, b) => a - b), gb = ok.length ? ok[Math.floor(ok.length / 2)] : 0;   // typical column boundary of the whole book
  pages.forEach(pg => { if (gb && Math.abs(pg.bound - gb) > 25) pg.bound = gb; });
  const all = pages.map(pg => markers(pg, ncols));
  // answer section starts on the first page where most markers carry an answer key on the same line
  let sol = +opt('sol-from', 0);
  const pairs = pg => { let n = 0; for (const w of pg.ws) if (NUM.test(w.t) && /[.:]$/.test(w.t) && pg.ws.some(z => Math.abs(z.y0 - w.y0) < 4 && z.x0 > w.x1 - 1 && z.x0 < w.x1 + 22 && KEY.test(z.t))) n++; return n };
  if (!sol) for (let i = 0; i < P; i++) if (pairs(pages[i]) >= 6) { sol = i + 1; break }   // a page full of 'N. (x)' pairs is the answer key
  if (!sol) for (let i = 0; i < P; i++) { const m = all[i].filter(x => !x.bare); if (m.length >= 4 && m.filter(x => keyAfter(pages[i], x)).length / m.length >= 0.5) { sol = i + 1; break } }
  if (!sol) sol = P + 1;
  if (sol <= P) { const W = pages[sol - 1].ws, h = W.find((w, j) => /^ANSWER$/i.test(w.t) && /^KEY$/i.test(W[j + 1]?.t || '')); if (h) { pages[sol - 1].cutY = h.y0 - 2; pages[sol - 1].bound = undefined; all[sol - 1] = markers(pages[sol - 1], ncols) } }
  // questions: the best chain of markers with increasing numbers in reading order (dynamic programming). Spurious numbers
  // (table rows, list items, page numbers) fall out of the chain; numbers the OCR missed become gaps, not stops.
  const C = [];
  for (let i = 0; i < Math.min(sol, P); i++) for (const x of all[i].sort((p, q) => p.col - q.col || p.y - q.y)) if (!(i === sol - 1 && x.bare)) C.push({ ...x, orig: x, page: i + 1, w: x.bare ? 0.5 : 1 });
  const sc = new Array(C.length), from = new Array(C.length).fill(-1);
  for (let j = 0; j < C.length; j++) {
    sc[j] = C[j].w - (C[j].n > first ? 0.2 * Math.min(C[j].n - first, 5) : 0);
    for (let i = 0; i < j; i++) { const d = C[j].n - C[i].n; if (d >= 1 && d <= 40) { const v = sc[i] + C[j].w - 0.2 * (d - 1); if (v > sc[j]) { sc[j] = v; from[j] = i } } }
  }
  let end = 0; sc.forEach((v, j) => { if (v > sc[end]) end = j });
  const chain = []; for (let j = end; j >= 0; j = from[j]) chain.unshift(C[j]);
  const qs = []; let prev = chain.length ? chain[0].n - 1 : first - 1;
  for (const x of chain) { for (let g = prev + 1; g < x.n; g++) qs.push({ n: g, missing: true, page: x.page }); qs.push({ n: x.n, page: x.page, m: x.orig }); prev = x.n }
  const rx = all.flatMap(a => a.filter(x => x.col === 1).map(x => x.x)).sort((p, r) => p - r), grx = rx.length ? rx[Math.floor(rx.length / 2)] : 300;   // typical left edge of the right column
  // regions
  for (let k = 0; k < qs.length; k++) {
    const q = qs[k]; if (q.missing) continue; const pg = pages[q.page - 1], m = q.m, rights = all[q.page - 1].filter(x => x.col === 1).map(x => x.x).sort((p, r) => p - r), edge = rights.length ? rights[Math.floor(rights.length / 2)] : grx;
    const below = all[q.page - 1].filter(x => x.col === m.col && x.y > m.y + 4 && qs.some(z => z.m === x)).sort((p, r) => p.y - r.y)[0];
    const hdr = 36, ftr = pg.h - 30, y0 = Math.max(hdr, m.y - 4), y1 = below ? below.y - 3 : ftr;
    q.box = { x0: Math.max(0, m.x - 6), x1: m.col === 0 && ncols === 2 ? edge - 8 : pg.w - 12, y0, y1 };
    q.endsAtColumnBottom = !below;
    const inb = pg.ws.filter(w => w.x0 >= q.box.x0 && w.x1 <= q.box.x1 + 2 && w.y0 >= y0 - 1 && w.y1 <= y1 + 1).sort((p, r) => Math.abs(p.y0 - r.y0) < 4 ? p.x0 - r.x0 : p.y0 - r.y0);
    let ln = [], cur = null, lastY = -99;
    for (const w of inb) { if (Math.abs(w.y0 - lastY) > 4) { cur = []; ln.push(cur) } cur.push(w.t); lastY = w.y0 }
    q.words = inb; q.ocr = ln.map(l => l.join(' ')).join('\n').replace(/^\d{1,3}[.:]\s*/, '');
    const tag = /\(\s*((?:Main|JEE|Adv|AIEEE|IIT|NEET|AIPMT|CBSE)[^)]{3,60})\)/i.exec(q.ocr); q.y = tag ? tag[1].replace(/\s+/g, ' ') : null;
    const optCount = (q.ocr.match(/\(\s*[a-d]\s*\)/gi) || []).length;
    q.options = optCount; q.type = optCount >= 3 ? 'mcq' : /\(\s*[A-E]\s*\)|Column|Match|Statement/i.test(q.ocr) ? 'mixed' : 'numeric?';
    const area = (q.box.x1 - q.box.x0) * (y1 - y0), cover = inb.reduce((s, w) => s + (w.x1 - w.x0) * (w.y1 - w.y0), 0);
    q.kw = /\b(figure|fig\.|shown|graph|circuit|diagram|arrangement|plot|as in)\b/i.test(q.ocr); q.fig = q.kw;   // refined by the ink scan below
  }
  qs.forEach((q, k) => { if (q.missing) { let j = k - 1; while (j >= 0 && qs[j].missing) j--; if (j >= 0) (qs[j].also = qs[j].also || []).push(q.n) } });   // the neighbour's crop also holds a number the OCR missed
  // render crops
  const need = qs.filter(q => q.box);
  for (const q of need) {
    const s = dpi / 72, f = path.join(out, 'crops', 'q' + String(q.n).padStart(3, '0'));
    sh('pdftoppm', ['-r', String(dpi), '-f', String(q.page), '-l', String(q.page), '-x', String(Math.round(q.box.x0 * s)), '-y', String(Math.round(q.box.y0 * s)), '-W', String(Math.round((q.box.x1 - q.box.x0) * s)), '-H', String(Math.round((q.box.y1 - q.box.y0) * s)), '-png', '-singlefile', pdf, f]);
    q.crop = 'crops/q' + String(q.n).padStart(3, '0') + '.png';
  }
  figScan(need, out, dpi);
  // answer keys
  const keys = {};     // every 'N. (x)' pair in the answer section (answer-key grid first, then the explanations); first one wins
  for (let i = sol - 1; i < P; i++) { const ws = pages[i].ws;
    for (const w of ws) { const mm = NUM.exec(w.t); if (!mm || !/[.:]$/.test(w.t)) continue; const k = ws.filter(z => Math.abs(z.y0 - w.y0) < 4 && z.x0 > w.x1 - 1 && z.x0 < w.x1 + 22 && KEY.test(z.t))[0]; if (k && keys[+mm[1]] === undefined) keys[+mm[1]] = KEY.exec(k.t)[1].toLowerCase() } }
  const draft = qs.map(q => ({ n: q.n, page: q.page, missing: !!q.missing || undefined, y: q.y || undefined, type: q.type, options: q.options, fig: q.fig, figMaybe: q.maybe || undefined, figMention: q.scanned && q.kw && !q.blobBig ? true : undefined, blob: q.blob, continues: q.endsAtColumnBottom || undefined, also: q.also, key: keys[q.n] ?? null, crop: q.crop, ocr: q.ocr }));
  fs.writeFileSync(path.join(out, 'draft.json'), JSON.stringify({ pdf: path.basename(pdf), pages: P, solFrom: sol, draft }, null, 1));
  const miss = draft.filter(d => d.missing).map(d => d.n), nokey = draft.filter(d => d.key === null).map(d => d.n);
  console.log(`pages ${P}, answer section from page ${sol}, questions found ${draft.length - miss.length}, last n ${draft.at(-1)?.n}`);
  console.log(`numbers the text layer missed (read from the page by hand): ${miss.join(',') || 'none'}`);
  console.log(`with answer key ${draft.length - nokey.length}, without ${nokey.length}${nokey.length ? ': ' + nokey.slice(0, 30).join(',') : ''}`);
  console.log(`likely diagram questions ${draft.filter(d => d.fig).length}, exam tag found ${draft.filter(d => d.y).length}`);
}

function load(file, g) { const w = {}; new Function('window', fs.readFileSync(file, 'utf8'))(w); return w[g || Object.keys(w)[0]] }
/* Entries should carry pn = the question number in the PDF. Older files have none: then every PDF question is matched to the
   entry with the most similar words (OCR text vs entry text), which is also the regression test of this tool. */
const toks = t => new Set(String(t).toLowerCase().replace(/[^a-z0-9.]+/g, ' ').split(' ').filter(x => x.length > 2));
function check(out, entries, g) {
  const D = JSON.parse(fs.readFileSync(path.join(out, 'draft.json'), 'utf8')).draft, E = load(entries, g), ABC = 'abcde', bad = [], miss = [], weak = [], used = new Set();
  const withPn = E.some(e => e.pn != null), byN = new Map(E.map((e, i) => [e.pn, i])), ET = withPn ? null : E.map(e => toks(e.q + ' ' + (e.o || []).join(' ')));
  let agree = 0, compared = 0;
  for (const d of D) {
    let i = withPn ? byN.get(d.n) : undefined, sc = 1;
    if (!withPn && !d.missing) { const T = toks(d.ocr); let best = 0; ET.forEach((s, j) => { if (used.has(j)) return; let n = 0; for (const x of T) if (s.has(x)) n++; const v = n / Math.max(8, Math.min(T.size, s.size)); if (v > best) { best = v; i = j } }); sc = best; if (best < 0.45) i = undefined }
    if (i === undefined) { miss.push(d.n); continue } used.add(i);
    const e = E[i]; if (sc < 0.6) weak.push(d.n);
    if (d.fig && !e.fig && withPn) bad.push(`Q${d.n}: looks like a diagram question but has no fig`);
    if (d.key != null) { compared++; const mine = e.o ? [].concat(e.c ?? []).map(x => ABC[x]).join(',') : String(e.n ?? e.a), want = e.o ? String(d.key).replace(/[;&\s]/g, '').replace(/,+/g, ',') : d.key;
      const same = mine === want || (!e.o && isFinite(+mine) && isFinite(+want) && Math.abs(+mine - +want) <= 1e-6 * Math.max(1, Math.abs(+want)));
      if (same) agree++; else if (!/note:/i.test(e.s || '')) bad.push(`Q${d.n}: key in PDF ${d.key}, entry ${mine}, no Note: in the solution`) } }
  console.log(`PDF questions ${D.length}, matched ${D.length - miss.length}${withPn ? ' (by pn)' : ' (by text similarity)'}, not matched ${miss.length}${miss.length ? ': ' + miss.join(',') : ''}`);
  console.log(`answer keys compared ${compared}, equal ${agree}${weak.length ? '; weak text match (look at these) ' + weak.join(',') : ''}`);
  bad.forEach(x => console.log('  ' + x)); process.exitCode = miss.length || bad.length ? 1 : 0;
}

function batches(out, size) {
  const D = JSON.parse(fs.readFileSync(path.join(out, 'draft.json'), 'utf8')).draft, files = [];
  for (let i = 0; i < D.length; i += size) { const part = D.slice(i, i + size), f = path.join(out, `batch-${String(i / size + 1).padStart(2, '0')}.md`);
    fs.writeFileSync(f, `# Questions ${part[0].n}-${part.at(-1).n}\nRead ONLY the crop of each question (path below); the OCR text is a rough hint (maths is often wrong).\n\n` + part.map(d => `## Q${d.n}${d.missing ? ' (no crop: the number is inside the previous crop)' : ''}\ncrop: ${out}/${d.crop || '(none)'}\nexam tag guess: ${d.y || '?'} | type guess: ${d.type} | key in PDF: ${d.key ?? 'none'} | diagram: ${d.fig ? 'YES (drawing found and the text mentions a figure): give a fig' : d.figMaybe ? 'a drawing-like block was found (may be a big formula): draw a fig only if the crop really has a diagram' : d.figMention ? 'text mentions a figure but no drawing found: check the crop' : 'none seen'}${d.continues ? ' | may continue in next column/page' : ''}${d.also ? ' | THIS CROP ALSO HOLDS Q' + d.also.join(', Q') + ' (number not found by OCR)' : ''}\nocr: ${(d.ocr || '').replace(/\n/g, ' ').slice(0, 400)}\n`).join('\n')); files.push(f) }
  console.log(files.length + ' batch files in ' + out);
}
/* assemble: entries-*.jsonl (one JSON entry per line, each with pn) -> the rank-pyq-<chapter>.js source file, sorted by pn */
function assemble(dir, outFile, g, header) {
  const rows = fs.readdirSync(dir).filter(f => /^entries.*\.jsonl$/.test(f)).flatMap(f => fs.readFileSync(path.join(dir, f), 'utf8').split('\n').filter(l => l.trim()).map((l, i) => { try { return JSON.parse(l) } catch (e) { throw new Error(f + ' line ' + (i + 1) + ': ' + e.message) } }));
  const seen = new Set(), dup = rows.filter(r => seen.has(r.pn) || !seen.add(r.pn)).map(r => r.pn).filter((v, i, a) => a.indexOf(v) === i && rows.filter(r => r.pn === v).length > 1);
  if (dup.length) throw new Error('duplicate pn: ' + dup.join(','));
  rows.sort((p, q) => p.pn - q.pn);
  fs.writeFileSync(outFile, `/* ${header || 'Past-year questions for Rank mode'} */\nwindow.${g}=[\n` + rows.map(r => JSON.stringify(r)).join(',\n') + '\n];\n');
  console.log(rows.length + ' entries written to ' + outFile);
}
const [cmd, a, b, c, d] = process.argv.slice(2);
const dflt = f => path.join('content', 'pyq-work', path.basename(f, '.pdf').replace(/[^A-Za-z0-9._-]+/g, '-'));     // content/ is git-ignored and guarded: never commit book pages
if (cmd === 'prep' && !b && a) { const o = dflt(a); console.log('work dir: ' + o); prep(a, o) } else if (cmd === 'assemble') assemble(a, b, c, d); else if (cmd === 'prep') prep(a, b); else if (cmd === 'check') check(a, b, c); else if (cmd === 'batches') batches(a, +b || 12); else console.log(fs.readFileSync(__filename, 'utf8').split('*/')[0]);
