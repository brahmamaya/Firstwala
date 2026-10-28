/* node tools/qgen/build.js          generate, verify (fails on any error), write qbank/<subject>/<chapter>/<n>.json + qbank/index.json
   node tools/qgen/build.js --check  same, but write nothing; exit 1 when the files on disk differ
   Deterministic: same SEED and templates give byte-identical files. */
'use strict';
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const { generate, rng } = require('./lib');
const { verifyChapter } = require('./verify');
const SEED = 'physica-qbank-1', CHUNK = 500;
const ROOT = path.join(__dirname, '..', '..', 'qbank');
const md5 = s => crypto.createHash('md5').update(s).digest('hex').slice(0, 8);

function loadChapters() {
  const dir = path.join(__dirname, 'chapters');
  return fs.readdirSync(dir).filter(f => /\.js$/.test(f)).sort().map(f => require(path.join(dir, f)));
}

/* -> { files: {relpath: text}, stats } for all chapters; throws when verification fails */
function render() {
  const files = {}, index = { v: 1, seed: SEED, subjects: {} }, stats = [];
  for (const ch of loadChapters()) {
    const recs = generate(ch, SEED), errs = verifyChapter(ch, recs);
    if (errs.length) { const e = new Error(`${ch.subject}/${ch.key}: ${errs.length} verification errors, first: ${errs[0].code} ${errs[0].t} ${errs[0].msg}`); e.errs = errs; throw e; }
    const r = rng(SEED + '|order|' + ch.key), chunks = [], topics = {};
    for (const tp of Object.keys(ch.topics)) {
      const mine = r.shuffle(recs.filter(x => x.tp === tp));
      if (!mine.length) continue;
      const sts = [...new Set(ch.templates.filter(t => t.tp === tp).map(t => t.st))];
      const dc = [0, 0, 0];
      mine.forEach(x => dc[x.d - 1]++);
      topics[tp] = { nm: ch.topics[tp], n: mine.length, d: dc, st: sts, c: [] };
      for (let i = 0; i < mine.length; i += CHUNK) {
        const part = mine.slice(i, i + CHUNK).map(x => Object.assign({ u: sts.indexOf(x.st) }, x.out));
        const body = JSON.stringify(part) + '\n', n = chunks.length + 1;
        files[`${ch.subject}/${ch.key}/${n}.json`] = body;
        chunks.push({ f: n + '.json', tp, n: part.length, h: md5(body) });
        topics[tp].c.push(n - 1);
      }
    }
    const sub = index.subjects[ch.subject] || (index.subjects[ch.subject] = {});
    const total = recs.length, mc = recs.filter(x => x.type === 'mcq').length;
    sub[ch.key] = { name: ch.name, n: total, tp: topics, ch: chunks, h: md5(JSON.stringify([topics, chunks])) };
    stats.push({ chapter: ch.key, templates: ch.templates.length, total, mcq: mc, numeric: total - mc, diff: [1, 2, 3].map(d => recs.filter(x => x.d === d).length), chunks: chunks.length });
  }
  files['index.json'] = JSON.stringify(index) + '\n';
  return { files, stats };
}

function listDisk(dir, base = '') {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const f of fs.readdirSync(dir)) { const p = path.join(dir, f), rel = base ? base + '/' + f : f; if (fs.statSync(p).isDirectory()) out.push(...listDisk(p, rel)); else out.push(rel); }
  return out;
}
/* checkOnly -> returns a list of differences; otherwise writes the files */
function writeAll(checkOnly) {
  const { files, stats } = render(), diffs = [], disk = listDisk(ROOT);
  if (checkOnly) {
    for (const [f, body] of Object.entries(files)) { const p = path.join(ROOT, f); if (!fs.existsSync(p)) diffs.push('missing ' + f); else if (fs.readFileSync(p, 'utf8') !== body) diffs.push('differs ' + f); }
    for (const f of disk) if (!(f in files)) diffs.push('extra ' + f);
    return diffs;
  }
  fs.rmSync(ROOT, { recursive: true, force: true });
  for (const [f, body] of Object.entries(files)) { const p = path.join(ROOT, f); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, body); }
  return stats;
}
module.exports = { loadChapters, writeAll, render, SEED };

if (require.main === module) {
  try {
    if (process.argv.includes('--check')) { const d = writeAll(true); console.log(d.length ? d.join('\n') : 'qbank is up to date'); process.exit(d.length ? 1 : 0); }
    const stats = writeAll(false);
    for (const s of stats) console.log(`qgen ${s.chapter}: ${s.templates} templates, ${s.total} questions (${s.mcq} mcq / ${s.numeric} numeric), difficulty ${s.diff.join('/')}, ${s.chunks} chunks`);
  } catch (e) { console.error('qgen FAILED: ' + e.message); for (const x of (e.errs || []).slice(0, 25)) console.error('  ' + x.code + ' ' + x.t + ' ' + x.msg); process.exit(1); }
}
