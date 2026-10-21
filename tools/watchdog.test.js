/* Proves the watchdog actually catches problems: healthy / tampered file / site down / exposed secret file / backend lockdown. */
'use strict';
const http = require('http'), fs = require('fs'), path = require('path'), { spawn, execFileSync } = require('child_process');
const root = path.join(__dirname, '..');
execFileSync(process.execPath, [path.join(__dirname, 'publish.js')], { cwd: root, stdio: 'ignore' });
const site = path.join(root, '_site');
let mode = {}, lockdown = false, fails = 0;
const web = http.createServer((q, r) => {
  const u = new URL(q.url, 'http://x'); let p = path.join(site, decodeURIComponent(u.pathname)); if (p.endsWith(path.sep) || u.pathname === '/') p = path.join(p, 'index.html');
  if (mode.tamper && p.endsWith('physica.min.js')) { r.writeHead(200); return r.end('/* injected skimmer */' + fs.readFileSync(p)); }
  if (mode.expose && u.pathname === '/supabase/schema.sql') { r.writeHead(200); return r.end('create table secrets();'); }
  fs.readFile(p, (e, d) => { if (e) { r.writeHead(404); return r.end('nope'); } r.writeHead(200); r.end(d); });
});
const api = http.createServer((q, r) => { r.writeHead(200, { 'content-type': 'application/json' }); r.end(JSON.stringify({ lockdown, maintenance: false })); });
const run = (url, supa) => new Promise(res => { const p = spawn(process.execPath, [path.join(__dirname, 'watchdog.js'), url, site], { env: { ...process.env, WATCHDOG_SUPA: supa } }); let out = ''; p.stdout.on('data', d => out += d); p.stderr.on('data', d => out += d); p.on('close', code => res({ code, out })); });
const ok = (c, m) => { console.log((c ? 'PASS  ' : 'FAIL  ') + m); if (!c) fails++; };
web.listen(3311, () => api.listen(3312, async () => {
  const W = 'http://localhost:3311', A = 'http://localhost:3312';
  let r = await run(W, A); ok(r.code === 0 && /"ok":true/.test(r.out), 'healthy site passes');
  mode = { tamper: true }; r = await run(W, A); ok(r.code === 1 && /TAMPERED physica\.min\.js/.test(r.out), 'a modified live file is detected (TAMPERED)');
  mode = { expose: true }; r = await run(W, A); ok(r.code === 1 && /EXPOSED supabase\/schema\.sql/.test(r.out), 'an exposed internal file is detected');
  mode = {}; lockdown = true; r = await run(W, A); ok(r.code === 1 && /LOCKDOWN/.test(r.out), 'panic/lockdown being left on is flagged');
  lockdown = false; r = await run('http://localhost:3399', A); ok(r.code === 1 && /DOWN/.test(r.out), 'an unreachable site is detected (DOWN)');
  r = await run(W, 'http://localhost:3399'); ok(r.code === 1 && /BACKEND/.test(r.out), 'an unreachable backend is detected');
  web.close(); api.close(); fs.rmSync(site, { recursive: true, force: true });
  console.log(fails ? `\n${fails} FAILED` : '\nWATCHDOG TESTS PASSED'); process.exit(fails ? 1 : 0);
}));
