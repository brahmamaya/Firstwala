/* Performance budget: fails if the files a student downloads grow past a limit (gzip, as served by Netlify / GitHub Pages / Cloudflare).
   Numbers are today's size + ~5% headroom; raise them deliberately, never by accident. */
'use strict';
const fs = require('fs'), zlib = require('zlib'), path = require('path');
const root = path.join(__dirname, '..');
const BUDGET = { 'physica-series.min.js': 16000, 'physica-series-exam.min.js': 12000, 'ga.js': 4000, 'physica-core.min.js': 12500, 'physica.min.js': 365000, 'styles.min.css': 33000, 'index.html': 8000,
  'physica-rank.min.js': 225000 /* carries the PYQ index (~4.6 KB gzip); raised from 210000 for the JEE Current Electricity chapter (~17 KB gzip of text) */, 'physica-pyq-es.min.js': 170000 /* largest PYQ chapter bundle; every other physica-pyq-*.min.js is held to the same cap */ };
for (const f of fs.readdirSync(root)) if (/^physica-pyq-.*\.min\.js$/.test(f) && !(f in BUDGET)) BUDGET[f] = 170000;
let bad = 0;
for (const [f, max] of Object.entries(BUDGET)) {
  const gz = zlib.gzipSync(fs.readFileSync(path.join(root, f)), { level: 9 }).length;
  const okk = gz <= max; if (!okk) bad++;
  console.log(`${okk ? 'PASS' : 'FAIL'}  ${f.padEnd(24)} ${String(gz).padStart(7)} B gzip  (budget ${max})`);
}
/* generated question bank: fetched lazily, one chunk (<= 500 questions of one topic) at a time; the index is read first */
const QDIR = path.join(root, 'qbank');
if (fs.existsSync(QDIR)) {
  const walk = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
  for (const p of walk(QDIR)) {
    const rel = path.relative(root, p).split(path.sep).join('/'), max = rel === 'qbank/index.json' ? 6000 : 40000, gz = zlib.gzipSync(fs.readFileSync(p), { level: 9 }).length;
    if (gz > max) { bad++; console.log(`FAIL  ${rel.padEnd(34)} ${String(gz).padStart(7)} B gzip  (budget ${max})`); }
  }
  console.log('PASS  qbank chunks and index within budget (chunk <= 40000 B gzip, index <= 6000 B gzip)');
}
process.exit(bad ? 1 : 0);
