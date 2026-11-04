/* Fails the build if files that must stay private are tracked by git or would be published to the public site.
   The repository is PUBLIC: question banks, generated import SQL and local secrets must live outside it (see docs/PRIVATE-FILES.md). */
'use strict';
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const root = path.join(__dirname, '..');
const BAD = [/^content\//, /^build\//, /^private\//, /\.private\./, /(^|\/)\.dev\.vars$/, /(^|\/)\.env(\..*)?$/, /\.(pem|key)$/, /(^|\/)\.wrangler\//, /^supabase\/\.temp\//,
  /(^|\/)(questions|question-bank|papers)[^/]*\.(json|csv|sql)$/i, /^import-.*\.sql$/i];
const problems = [];
let tracked = [];
try { tracked = execFileSync('git', ['ls-files'], { cwd: root }).toString().split('\n').filter(Boolean); } catch { tracked = []; }
for (const f of tracked) if (BAD.some(re => re.test(f))) problems.push('tracked in git: ' + f);
/* A real test paper is many KB of question text; the committed sample generator and fixtures are tiny. Flag any big .sql/.json that holds question bodies. */
for (const f of tracked) {
  if (!/\.(sql|json)$/.test(f) || !fs.existsSync(path.join(root, f))) continue;
  const st = fs.statSync(path.join(root, f));
  if (st.size > 400000 && !false) problems.push(`large data file (is it a question bank?): ${f} (${Math.round(st.size / 1024)} KB)`);
}
/* Test Series: no server, so every file in tests/ is public. Only free tests 1-3 may exist: the index must list n <= 3 and no file may be outside it. */
try {
  const idx = JSON.parse(fs.readFileSync(path.join(root, 'tests/index.json'), 'utf8')), ok = new Set(['tests/index.json']);
  for (const t of idx.tests || []) { const nn = String(t.n).padStart(2, '0'); if (!(t.n >= 1 && t.n <= 3)) problems.push('paid test in tests/index.json: ' + t.id); ok.add(`tests/${t.exam}/${nn}-${t.p}.json`); ok.add(`tests/${t.exam}/${nn}-${t.p}.key.json`) }
  for (const f of tracked) if (/^tests\//.test(f) && !ok.has(f) && !/^tests\/img\//.test(f)) problems.push('tests/ file not in the free index (tests 1-3 only): ' + f);
} catch (e) { if (e.code !== 'ENOENT') problems.push('tests/index.json unreadable: ' + e.message) }
/* nothing from these folders may reach the public site */
const pub = path.join(root, '_site');
if (fs.existsSync(pub)) {
  const walk = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
  for (const f of walk(pub)) { const r = path.relative(pub, f); if (/^(gateway|supabase|tools|docs|content|build|private|\.github)\//.test(r) || /\.(sql|md|gs)$/.test(r) || BAD.some(re => re.test(r))) problems.push('would be published: ' + r); }
}
if (problems.length) { console.error('\nSTOP: private material is exposed:\n  ' + problems.join('\n  ') + '\n'); process.exit(1); }
console.log('private-guard: ok (' + tracked.length + ' tracked files checked)');
