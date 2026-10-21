/* Performance budget: fails if the files a student downloads grow past a limit (gzip, as served by Netlify / GitHub Pages / Cloudflare).
   Numbers are today's size + ~5% headroom; raise them deliberately, never by accident. */
'use strict';
const fs = require('fs'), zlib = require('zlib'), path = require('path');
const root = path.join(__dirname, '..');
const BUDGET = { 'physica-series.min.js': 14000, 'ga.js': 4000, 'physica-core.min.js': 12500, 'physica.min.js': 350000, 'styles.min.css': 33000, 'index.html': 8000 };
let bad = 0;
for (const [f, max] of Object.entries(BUDGET)) {
  const gz = zlib.gzipSync(fs.readFileSync(path.join(root, f)), { level: 9 }).length;
  const okk = gz <= max; if (!okk) bad++;
  console.log(`${okk ? 'PASS' : 'FAIL'}  ${f.padEnd(24)} ${String(gz).padStart(7)} B gzip  (budget ${max})`);
}
process.exit(bad ? 1 : 0);
