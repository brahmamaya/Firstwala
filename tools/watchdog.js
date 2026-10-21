/* Physica watchdog: is the LIVE site exactly what we published, is it up, is TLS healthy, is the backend answering?
   Usage: node tools/watchdog.js <https://site> [localDir=_site]
   The expected hashes come from a fresh `node tools/publish.js` of the repo (so an attacker who edits the live host AND any
   manifest on it still cannot hide). Exit 0 = healthy, 1 = problem (tamper / outage / expiring certificate / backend down).
   Prints one JSON line summary at the end. No dependencies. */
'use strict';
const fs = require('fs'), path = require('path'), crypto = require('crypto'), https = require('https'), http = require('http');
const base = (process.argv[2] || '').replace(/\/+$/, '');
const dir = path.resolve(process.argv[3] || '_site');
if (!base) { console.error('usage: node tools/watchdog.js <https://site> [localDir]'); process.exit(2); }
const SUPA = process.env.WATCHDOG_SUPA || 'https://lbyqvwkichjvrrzcddtq.supabase.co', PUB = 'sb_publishable_E3vG7C6UN13-1PoWwJNauA_uq7zvZxi';
const sha = b => crypto.createHash('sha256').update(b).digest('hex');
const problems = [], notes = [];

function get(url, { headers, method = 'GET', body, timeout = 20000 } = {}) {
  return new Promise(resolve => {
    const u = new URL(url), lib = u.protocol === 'https:' ? https : http, t0 = Date.now();
    const req = lib.request(u, { method, headers, timeout }, res => {
      const chunks = []; res.on('data', c => chunks.push(c));
      res.on('end', () => resolve({ status: res.statusCode, body: Buffer.concat(chunks), ms: Date.now() - t0, socket: req.socket }));
    });
    req.on('timeout', () => { req.destroy(new Error('timeout')); });
    req.on('error', e => resolve({ status: 0, error: e.message, body: Buffer.alloc(0), ms: Date.now() - t0 }));
    if (body) req.write(body);
    req.end();
  });
}
function* walk(d, rel = '') { for (const f of fs.readdirSync(d)) { const p = path.join(d, f), r = rel ? rel + '/' + f : f; fs.statSync(p).isDirectory() ? yield* walk(p, r) : yield r; } }

(async () => {
  if (!fs.existsSync(dir)) { console.error(`expected files not found in ${dir}; run "node tools/publish.js" first`); process.exit(2); }
  const files = [...walk(dir)].filter(f => f !== '.nojekyll');
  const bust = '?wd=' + Date.now();
  let checked = 0;
  const queue = [...files];
  await Promise.all(Array.from({ length: 6 }, async () => {
    while (queue.length) {
      const f = queue.shift();
      const want = sha(fs.readFileSync(path.join(dir, f)));
      const r = await get(`${base}/${f}${bust}`, { headers: { 'Cache-Control': 'no-cache' } });
      checked++;
      if (r.status !== 200) problems.push(`DOWN ${f}: HTTP ${r.status || r.error}`);
      else if (sha(r.body) !== want) problems.push(`TAMPERED ${f}: live content differs from the published build`);
      else if (f === 'index.html' && r.ms > 4000) notes.push(`slow index.html: ${r.ms}ms`);
    }
  }));
  // pages that must not exist publicly
  for (const f of ['supabase/schema.sql', '.env', '.git/config', 'tools/build.js', 'docs/SECURITY.md', 'gateway/worker.js', 'gateway/wrangler.toml', 'content/', 'build/patterns.sql']) {
    const r = await get(`${base}/${f}${bust}`);
    if (r.status === 200 && r.body.length && !/<!doctype html/i.test(r.body.slice(0, 200).toString())) problems.push(`EXPOSED ${f} is publicly readable`);
  }
  // TLS expiry
  if (base.startsWith('https:')) {
    const cert = await new Promise(res => { const req = https.get(base + '/', { timeout: 15000 }, r => { const c = req.socket.getPeerCertificate(); r.resume(); res(c); }); req.on('error', () => res(null)); });
    if (cert && cert.valid_to) { const days = Math.floor((Date.parse(cert.valid_to) - Date.now()) / 864e5); notes.push(`TLS valid for ${days} more days`); if (days < 14) problems.push(`TLS certificate expires in ${days} days`); }
  }
  // backend alive (public status; contains nothing sensitive)
  const st = await get(`${SUPA}/rest/v1/rpc/get_status`, { method: 'POST', headers: { apikey: PUB, 'Content-Type': 'application/json' }, body: '{}' });
  if (st.status !== 200) problems.push(`BACKEND get_status failed: HTTP ${st.status || st.error}`);
  else { try { const j = JSON.parse(st.body.toString()); notes.push(`backend ok (${st.ms}ms)` + (j.lockdown ? ' [LOCKDOWN ON]' : '') + (j.maintenance ? ' [maintenance]' : '')); if (j.lockdown) problems.push('BACKEND is in LOCKDOWN mode (panic switch is on)'); } catch { problems.push('BACKEND get_status returned non-JSON'); } }

  const out = { ok: problems.length === 0, checked, problems, notes };
  console.log(JSON.stringify(out));
  if (problems.length) console.error('\n' + problems.map(p => ' - ' + p).join('\n'));
  process.exit(problems.length ? 1 : 0);
})();
