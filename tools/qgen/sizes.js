/* node tools/qgen/sizes.js : raw and gzip size of every qbank chunk, and per 1,000 questions. */
'use strict';
const fs = require('fs'), path = require('path'), zlib = require('zlib');
const root = path.join(__dirname, '..', '..', 'qbank'), idx = JSON.parse(fs.readFileSync(path.join(root, 'index.json'), 'utf8'));
const gz = b => zlib.gzipSync(b, { level: 9 }).length;
let raw = 0, zip = 0, n = 0;
for (const [sub, chs] of Object.entries(idx.subjects)) for (const [key, ch] of Object.entries(chs)) {
  for (const c of ch.ch) {
    const b = fs.readFileSync(path.join(root, sub, key, c.f)), g = gz(b);
    console.log(`${sub}/${key}/${c.f}`.padEnd(32), c.tp.padEnd(4), String(c.n).padStart(4), 'q', String(b.length).padStart(7), 'B raw', String(g).padStart(6), 'B gzip');
    raw += b.length; zip += g; n += c.n;
  }
}
const ib = fs.readFileSync(path.join(root, 'index.json'));
console.log(`index.json: ${ib.length} B raw, ${gz(ib)} B gzip`);
console.log(`total: ${n} questions, ${raw} B raw, ${zip} B gzip; per 1,000 questions: ${Math.round(raw / n * 1000)} B raw, ${Math.round(zip / n * 1000)} B gzip`);
