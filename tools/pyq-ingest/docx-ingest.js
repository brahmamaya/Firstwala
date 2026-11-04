#!/usr/bin/env node
/* Word (.docx) paper -> draft PYQ entries, by code (no model reads pages). For papers that come as an editable Word file with real text.
   usage:  node tools/pyq-ingest/docx-ingest.js <paper.docx> <workdir> [--opts 1234|abcd]                 extract + segment + write batches for the tagging agents
           node tools/pyq-ingest/docx-ingest.js <paper.docx> <workdir> --tags <tags.jsonl...>   merge the agents' tags into entries-01.jsonl
   Reads: paragraphs, Word auto-numbering, tables, tabs, sub/superscripts, Word equations (OMML -> plain unicode), pictures (saved to <workdir>/media/).
   Segments "N. question", options (1)-(4) / (A)-(D), "Answer (n)" / "Answer: (n)", "Sol." and the solution; subject headings (PHYSICS ...).
   Writes <workdir>/entries-docx.jsonl (one draft entry per question; `s` is the publisher's text and `raw:1`: it must be rewritten before it goes on the site)
   and <workdir>/batches/tag-NN.md (12 questions each) for `NEET-DOCX-TAG-PROMPT.md` agents, who write tags-NN.jsonl {pn,sub,ch,st,s} (s = solution in new words).
   Draft entries have ch:"?" and are not accepted by neet-assemble.js until tagged and rewritten. */
'use strict';
const fs = require('fs'), path = require('path'), zlib = require('zlib');

/* ---------- zip reader (stored or deflate; no dependency) ---------- */
function readZip(buf) {
  let e = buf.length - 22; while (e >= 0 && buf.readUInt32LE(e) !== 0x06054b50) e--;
  if (e < 0) throw new Error('not a zip / docx file');
  const n = buf.readUInt16LE(e + 10), files = new Map(); let p = buf.readUInt32LE(e + 16);
  for (let i = 0; i < n; i++) {
    if (buf.readUInt32LE(p) !== 0x02014b50) throw new Error('bad zip directory');
    const method = buf.readUInt16LE(p + 10), cs = buf.readUInt32LE(p + 20), nl = buf.readUInt16LE(p + 28), el = buf.readUInt16LE(p + 30), cl = buf.readUInt16LE(p + 32), lho = buf.readUInt32LE(p + 42), name = buf.toString('utf8', p + 46, p + 46 + nl);
    const ds = lho + 30 + buf.readUInt16LE(lho + 26) + buf.readUInt16LE(lho + 28), raw = buf.subarray(ds, ds + cs);
    files.set(name, () => method === 0 ? raw : zlib.inflateRawSync(raw)); p += 46 + nl + el + cl;
  }
  return files;
}

/* ---------- tiny XML tree (enough for OMML) ---------- */
const dec = s => s.replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos);/gi, (_, k) => k[0] === '#' ? String.fromCodePoint(k[1].toLowerCase() === 'x' ? parseInt(k.slice(2), 16) : +k.slice(1)) : ({ amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" })[k.toLowerCase()]);
function parseXml(s) {
  const root = { tag: '#', a: {}, c: [] }, st = [root], re = /<(\/?)([\w:.-]+)((?:\s+[\w:.-]+="[^"]*")*)\s*(\/?)>|([^<]+)/g; let m;
  while ((m = re.exec(s))) {
    if (m[5] !== undefined) { st[st.length - 1].c.push({ t: dec(m[5]) }); continue }
    if (m[1]) { st.pop(); continue }
    const a = {}; for (const x of m[3].matchAll(/([\w:.-]+)="([^"]*)"/g)) a[x[1]] = dec(x[2]);
    const n = { tag: m[2], a, c: [] }; st[st.length - 1].c.push(n); if (!m[4]) st.push(n);
  }
  return root;
}
const kids = (n, tag) => n.c.filter(x => x.tag === tag), kid = (n, tag) => kids(n, tag)[0], txt = n => n.c.map(x => x.t !== undefined ? x.t : txt(x)).join('');

/* ---------- sub/superscripts ---------- */
const SUP = Object.fromEntries([...'0123456789+-=()ni'].map((c, i) => [c, '⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻⁼⁽⁾ⁿⁱ'[i]])), SUB = Object.fromEntries([...'0123456789+-=()aeoxhklmnpst'].map((c, i) => [c, '₀₁₂₃₄₅₆₇₈₉₊₋₌₍₎ₐₑₒₓₕₖₗₘₙₚₛₜ'[i]]));
const sup = s => { s = s.replace(/−/g, '-'); return [...s].every(c => SUP[c]) ? [...s].map(c => SUP[c]).join('') : '^(' + s + ')' };
const sub = s => { s = s.replace(/−/g, '-'); return [...s].every(c => SUB[c]) ? [...s].map(c => SUB[c]).join('') : '_(' + s + ')' };

/* ---------- OMML (Word equations) -> plain unicode ---------- */
function omml(n) {
  const all = () => n.c.map(omml).join(''), g = t => { const k = kid(n, t); return k ? omml(k) : '' };
  switch (n.tag) {
    case undefined: return n.t || '';
    case 'm:t': return txt(n);
    case 'm:f': return '(' + g('m:num') + ')/(' + g('m:den') + ')';   // the site's fraction markup
    case 'm:sSup': return g('m:e') + sup(g('m:sup'));
    case 'm:sSub': return g('m:e') + sub(g('m:sub'));
    case 'm:sSubSup': return g('m:e') + sub(g('m:sub')) + sup(g('m:sup'));
    case 'm:rad': { const d = g('m:deg'); return (d && d !== '2' ? sup(d) : '') + '√(' + g('m:e') + ')' }
    case 'm:d': { const pr = kid(n, 'm:dPr'), ch = t => { const x = pr && kid(pr, t); return x && x.a['m:val'] !== undefined ? x.a['m:val'] : null }, b = ch('m:begChr') ?? '(', e = ch('m:endChr') ?? ')', sp = ch('m:sepChr') ?? '|'; return b + kids(n, 'm:e').map(omml).join(sp) + e }
    case 'm:nary': { const pr = kid(n, 'm:naryPr'), c = pr && kid(pr, 'm:chr'), ch = c ? c.a['m:val'] : '∫', lo = g('m:sub'), hi = g('m:sup'); return ch + (lo ? '_(' + lo + ')' : '') + (hi ? '^(' + hi + ')' : '') + ' ' + g('m:e') }
    case 'm:func': return g('m:fName') + g('m:e');
    case 'm:limLow': return g('m:e') + '_(' + g('m:lim') + ')';
    case 'm:limUpp': return g('m:e') + '^(' + g('m:lim') + ')';
    case 'm:eqArr': return kids(n, 'm:e').map(omml).join('\n');
    case 'm:m': return '[' + kids(n, 'm:mr').map(r => kids(r, 'm:e').map(omml).join(' ')).join('; ') + ']';
    case 'm:bar': return g('m:e') + '̅';
    case 'm:dPr': case 'm:rPr': case 'm:ctrlPr': case 'm:naryPr': case 'm:radPr': case 'm:fPr': case 'w:rPr': return '';
    default: return all();
  }
}

/* ---------- docx -> lines ---------- */
const NUMFMT = { decimal: n => String(n), lowerLetter: n => String.fromCharCode(96 + n), upperLetter: n => String.fromCharCode(64 + n), lowerRoman: n => ['', 'i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x'][n] || String(n), upperRoman: n => (['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'][n] || String(n)) };
function docxLines(file, media) {
  const z = readZip(fs.readFileSync(file)), get = n => z.has(n) ? z.get(n)().toString('utf8') : '';
  const body = get('word/document.xml'); if (!body) throw new Error('no word/document.xml');
  const rels = {}; for (const m of get('word/_rels/document.xml.rels').matchAll(/<Relationship\b[^>]*>/g)) { const id = /Id="([^"]+)"/.exec(m[0]), t = /Target="([^"]+)"/.exec(m[0]); if (id && t) rels[id[1]] = t[1] }
  // numbering
  const abs = {}, nums = {}; const nx = get('word/numbering.xml');
  for (const a of nx.matchAll(/<w:abstractNum\b[^>]*w:abstractNumId="(\d+)"[^>]*>([\s\S]*?)<\/w:abstractNum>/g)) { abs[a[1]] = {}; for (const l of a[2].matchAll(/<w:lvl\b[^>]*w:ilvl="(\d+)"[^>]*>([\s\S]*?)<\/w:lvl>/g)) abs[a[1]][l[1]] = { fmt: (/<w:numFmt w:val="(\w+)"/.exec(l[2]) || [])[1] || 'decimal', text: (/<w:lvlText w:val="([^"]*)"/.exec(l[2]) || [])[1] ?? '%1.', start: +((/<w:start w:val="(\d+)"/.exec(l[2]) || [])[1] || 1) } }
  for (const n of nx.matchAll(/<w:num\b[^>]*w:numId="(\d+)"[^>]*>([\s\S]*?)<\/w:num>/g)) nums[n[1]] = (/<w:abstractNumId w:val="(\d+)"/.exec(n[2]) || [])[1];
  const ctr = {};
  const label = (id, lv) => { const a = abs[nums[id]]; if (!a || !a[lv]) return ''; const c = ctr[id] || (ctr[id] = {}); c[lv] = (c[lv] ?? a[lv].start - 1) + 1; for (const k of Object.keys(c)) if (+k > +lv) delete c[k]; return a[lv].text.replace(/%(\d)/g, (_, k) => { const i = +k - 1, f = (a[i] || a[lv]).fmt; return c[i] === undefined ? '' : (NUMFMT[f] || NUMFMT.decimal)(c[i]) }) };
  let imgN = 0; const imgOf = rid => { const t = rels[rid]; if (!t || !z.has('word/' + t)) return ''; const out = 'media/' + path.basename(t); if (!fs.existsSync(path.join(media, '..', out))) { fs.mkdirSync(media, { recursive: true }); fs.writeFileSync(path.join(media, '..', out), z.get('word/' + t)()) } imgN++; return '[[IMG:' + out + ']]' };
  const para = x => {
    let out = '';
    for (const m of x.matchAll(/<m:oMath\b[\s\S]*?<\/m:oMath>|<w:r\b[\s\S]*?<\/w:r>|<w:tab\/>|<w:br\/>/g)) {
      const s = m[0];
      if (s.startsWith('<m:oMath')) { out += omml(parseXml(s).c[0]); continue }
      if (s === '<w:tab/>') { out += '\t'; continue }
      if (s === '<w:br/>') { out += '\n'; continue }
      let t = ''; for (const k of s.matchAll(/<w:t\b[^>]*>([^<]*)<\/w:t>|<w:tab\/>|<w:br\/>|r:embed="([^"]+)"|<v:imagedata[^>]*r:id="([^"]+)"/g)) t += k[1] !== undefined ? dec(k[1]) : k[0] === '<w:tab/>' ? '\t' : k[0] === '<w:br/>' ? '\n' : imgOf(k[2] || k[3]);
      const va = /<w:vertAlign w:val="(superscript|subscript)"/.exec(s); out += va ? (va[1] === 'superscript' ? sup(t) : sub(t)) : t;
    }
    const np = /<w:numPr>[\s\S]*?<\/w:numPr>/.exec(x), lab = np ? label((/<w:numId w:val="(\d+)"/.exec(np[0]) || [])[1], (/<w:ilvl w:val="(\d+)"/.exec(np[0]) || [, '0'])[1]) : '';
    return (lab && !/^\s*(\(?\d+[.)]|\(?[A-Da-d][.)])/.test(out) ? lab + ' ' : '') + out;
  };
  const lines = [];
  for (const m of body.matchAll(/<w:tbl>[\s\S]*?<\/w:tbl>|<w:p[ >][\s\S]*?<\/w:p>/g)) {
    if (m[0].startsWith('<w:tbl>')) { for (const r of m[0].matchAll(/<w:tr\b[\s\S]*?<\/w:tr>/g)) lines.push([...r[0].matchAll(/<w:tc\b[\s\S]*?<\/w:tc>/g)].map(c => [...c[0].matchAll(/<w:p[ >][\s\S]*?<\/w:p>/g)].map(p => para(p[0]).trim()).filter(Boolean).join(' ')).join(' | ')) }
    else for (const l of para(m[0]).split('\n')) lines.push(l);
  }
  return lines.map(l => l.replace(/[  ]+/g, ' ').trimEnd()).filter(l => l.trim());
}

/* ---------- segmentation ---------- */
const SUBJ = /^\s*(PHYSICS|CHEMISTRY|BOTANY|ZOOLOGY|BIOLOGY)\b[\s:.-]*$/i, QRE = /^\s*(?:Q(?:uestion)?\.?\s*)?(\d{1,3})\s*[.)]\s+(.*)$/i, ANS = /^\s*(?:Answer|Ans\.?|Key)\s*[:\-]?\s*(.*)$/i, SOL = /^\s*Sol(?:ution)?\.?\s*[:\-]?\s*(.*)$/i;
let STYLE = '1234';   // option labels: '1234' (NEET) or 'abcd' ((a)-(d) / (A)-(D), JEE)
const OPTS = ['1', '2', '3', '4'], idx = l => ({ 1: 0, 2: 1, 3: 2, 4: 3, a: 0, b: 1, c: 2, d: 3 })[String(l).toLowerCase()];
function splitOptions(line, want) {   // a line may hold several options: "(1) 3   (2) 2"
  const out = []; let pos = 0, w = want;
  for (;;) {
    const re = new RegExp('(?:^|\\s)\\(?(' + (w < 4 ? (STYLE === '1234' ? OPTS[w] : 'abcd'[w] + '|' + 'ABCD'[w]) : 'X') + ')[).]\\s+', 'g'); re.lastIndex = pos; const m = re.exec(line);
    if (!m) break; out.push({ i: w, at: m.index + (/^\s/.test(m[0]) ? 1 : 0), end: m.index + m[0].length }); pos = m.index + m[0].length; w++;
  }
  return out.map((o, k) => ({ i: o.i, text: line.slice(o.end, k + 1 < out.length ? out[k + 1].at : undefined).trim() }));
}
function segment(lines) {
  const Q = [], subjOf = {}; let cur = null, sub = '', mode = 'q', next = 1;
  const strip = t => { const imgs = [...t.matchAll(/\[\[IMG:([^\]]+)\]\]/g)].map(m => m[1]); return { t: t.replace(/\s*\[\[IMG:[^\]]+\]\]\s*/g, ' ').trim(), imgs } };
  for (const line of lines) {
    const sm = SUBJ.exec(line); if (sm) { sub = sm[1][0].toUpperCase() + sm[1].slice(1).toLowerCase(); continue }
    const qm = QRE.exec(line);
    if (qm && +qm[1] === next && (!cur || mode !== 'o' || cur.o.length === 0 || cur.o.length >= 4 || mode === 's')) { cur = { pn: +qm[1], sub: sub === 'Biology' ? '' : sub, q: qm[2], o: [], figfiles: [], sfigfiles: [], s: '' }; Q.push(cur); mode = 'q'; next++; continue }
    if (!cur) continue;
    const am = ANS.exec(line), so = SOL.exec(line);
    if (mode !== 's' && am) { cur.ans = am[1]; mode = 'a'; continue }
    if (so) { mode = 's'; cur.s += (cur.s ? '\n' : '') + so[1]; continue }
    if (mode === 's') { cur.s += '\n' + line; continue }
    if (mode === 'a') { cur.s += (cur.s ? '\n' : '') + line; mode = 's'; continue }
    if (mode === 'o' && cur.o.length && (STYLE === '1234' ? /^\s*\(?1[).]\s+/ : /^\s*\(?[aA][).]\s+/).test(line)) { cur.q += '\n' + cur.o.map((o, k) => '(' + (k + 1) + ') ' + o).join('\n'); cur.o = [] }   // statements numbered (1)-(n) came first: they belong to the stem, the last (1)-(4) group is the options
    const os = splitOptions(line, cur.o.length);
    if (os.length) { for (const o of os) cur.o.push(o.text); mode = 'o'; continue }
    if (mode === 'o' && cur.o.length) cur.o[cur.o.length - 1] += ' ' + line.trim();
    else cur.q += '\n' + line;
  }
  for (const q of Q) {
    const a = strip(q.q); q.q = a.t; q.figfiles.push(...a.imgs); q.o = q.o.map(o => { const r = strip(o); q.figfiles.push(...r.imgs); return r.t });
    const sres = strip(q.s || ''); q.s = sres.t; q.sfigfiles.push(...sres.imgs);
    const ans = q.ans || ''; delete q.ans;
    const L = '[1-4A-Da-d](?![A-Za-z0-9])', lead = new RegExp('^\\s*\\(?' + L + '\\)?(?:\\s*(?:,|and|&|;)\\s*\\(?' + L + '\\)?)*').exec(ans), star = /^\s*\(?\*\)?/.test(ans) || /^\s*\(?[1-4A-Da-d]\)?(?:\s*\/\s*\(?[1-4A-Da-d]\)?)*\s*\*/.test(ans), nums = lead ? [...lead[0].matchAll(/\(?\b([1-4A-Da-d])\b\)?/g)].map(m => idx(m[1])).filter(x => x !== undefined) : [];   // only the leading label(s): the text after them may contain digits
    if (star || (!lead && /no option|bonus|\bnone\b/i.test(ans))) { q.c = null; q.a = ans.replace(/\s+/g, ' ').trim(); q.flag = 'printed answer: ' + q.a } else if (nums.length === 1) q.c = nums[0]; else if (nums.length > 1) q.c = [...new Set(nums)]; else { q.c = null; q.flag = 'no answer found in the file' }
    if (q.figfiles.length) q.dia = 'picture(s) in the file: ' + q.figfiles.join(', ');
    if (q.sfigfiles.length) q.sdia = 'picture(s) in the file: ' + q.sfigfiles.join(', ');
    q.ch = '?'; q.st = ''; q.raw = 1;
  }
  return Q;
}

/* ---------- main ---------- */
function extract(file, work) {
  fs.mkdirSync(path.join(work, 'batches'), { recursive: true });
  const Q = segment(docxLines(file, path.join(work, 'media')));
  fs.writeFileSync(path.join(work, 'entries-docx.jsonl'), Q.map(q => JSON.stringify(q)).join('\n') + '\n');
  for (let i = 0; i < Q.length; i += 12) {
    const nn = String(i / 12 + 1).padStart(2, '0');
    fs.writeFileSync(path.join(work, 'batches', `tag-${nn}.md`), `# tag batch ${nn}\nWrite tags-${nn}.jsonl: one line per question {"pn","sub","ch","st","s"}. See tools/pyq-ingest/NEET-DOCX-TAG-PROMPT.md.\n\n` + Q.slice(i, i + 12).map(q => `## Q${q.pn}${q.sub ? ' (' + q.sub + ')' : ''}\n${q.q}\n${q.o.map((o, k) => `(${k + 1}) ${o}`).join('\n')}\nAnswer: ${q.c === null ? q.a : [].concat(q.c).map(k => '(' + (k + 1) + ')').join(', ')}\nPublisher solution (rewrite in new words, keep every step):\n${q.s}\n${q.dia ? '[question picture] ' + q.dia + '\n' : ''}${q.sdia ? '[solution picture] ' + q.sdia + '\n' : ''}`).join('\n'));
  }
  const miss = []; for (let n = 1; n <= (Q.length ? Q[Q.length - 1].pn : 0); n++) if (!Q.some(q => q.pn === n)) miss.push(n);
  const odd = Q.filter(q => q.o.length !== 4).map(q => q.pn), noans = Q.filter(q => q.c === null && !q.a).map(q => q.pn);
  console.log(`questions ${Q.length}; numbers missing in the sequence: ${miss.join(',') || 'none'}; not exactly 4 options: ${odd.join(',') || 'none'}; no answer: ${noans.join(',') || 'none'}; with pictures: ${Q.filter(q => q.dia || q.sdia).length}; batches ${Math.ceil(Q.length / 12)}`);
  return Q;
}
function applyTags(work, tagFiles) {
  const Q = fs.readFileSync(path.join(work, 'entries-docx.jsonl'), 'utf8').split('\n').filter(Boolean).map(JSON.parse), T = new Map();
  for (const f of tagFiles) for (const l of fs.readFileSync(f, 'utf8').split('\n').filter(Boolean)) { const t = JSON.parse(l); T.set(t.pn, t) }
  const missing = []; const out = Q.map(q => { const t = T.get(q.pn); if (!t || !t.ch || !t.s || !t.sub) { missing.push(q.pn); return null } const { raw, figfiles, sfigfiles, ...e } = q; return { ...e, sub: t.sub, ch: t.ch, st: t.st || e.st, s: t.s } }).filter(Boolean);
  fs.writeFileSync(path.join(work, 'entries-01.jsonl'), out.map(e => JSON.stringify(e)).join('\n') + '\n');
  console.log(`merged ${out.length} of ${Q.length}; still untagged or without a rewritten solution: ${missing.join(',') || 'none'} -> entries-01.jsonl`);
  return missing;
}
module.exports = { readZip, docxLines, segment, omml, parseXml, splitOptions, extract, applyTags };
if (require.main === module) {
  const argv = process.argv.slice(2), oi = argv.indexOf('--opts'); if (oi >= 0) { STYLE = argv[oi + 1] === 'abcd' ? 'abcd' : '1234'; argv.splice(oi, 2) }
  const [file, work, flag, ...tags] = argv;
  if (!file || !work) { console.error('usage: docx-ingest.js <paper.docx> <workdir> [--tags tags.jsonl ...]'); process.exit(2) }
  fs.mkdirSync(work, { recursive: true });
  if (flag === '--tags') process.exit(applyTags(work, tags).length ? 1 : 0); else extract(file, work);
}
