/* Smoke test of EVERY simulation in the lab: each is opened in the 2D and the Ultra-Realistic view, with the sliders at their
   initial values, all at minimum and all at maximum. Fails on a page error, a console error, "NaN / Infinity / undefined" in
   the controls or readouts, or an empty canvas.   node tools/e2e/lab-smoke.js [subject] [idPrefix]   (needs Chromium + playwright-core) */
const http = require('http'), fs = require('fs'), path = require('path');
const { chromium } = require('playwright-core');
const ROOT = process.env.SITE_ROOT || path.resolve(__dirname, '../..');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.woff2': 'font/woff2', '.webmanifest': 'application/json' };
const only = process.argv[2] || '', prefix = process.argv[3] || '';
const srv = http.createServer((q, r) => { const p = decodeURIComponent(new URL(q.url, 'http://x').pathname); let f = path.join(ROOT, p); if (f.endsWith('/')) f += 'index.html';
  fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'application/octet-stream' }); r.end(d); }); }).listen(+process.env.PORT || 3211);
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROMIUM || '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
  const page = await b.newPage({ viewport: { width: 1200, height: 900 } }); const errs = [];
  page.on('pageerror', e => errs.push('pageerror: ' + e.message)); page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|favicon|manifest/.test(m.text())) errs.push('console: ' + m.text().slice(0, 200)); });
  await page.route(/googletagmanager|google-analytics|docs\.google/, r => r.abort());
  await page.goto('http://localhost:' + (+process.env.PORT || 3211) + '/', { waitUntil: 'load' }); await page.waitForTimeout(6000);
  await page.evaluate(() => { try { localStorage.setItem('physica-analytics', '0'); } catch {} });
  const sims = await page.evaluate(() => window.PhysicaSims.map(s => ({ id: s.id, subject: s.subject })));
  const ids = (process.env.IDS || '').split(',').filter(Boolean);
  const list = sims.filter(s => (!only || s.subject === only) && s.id.startsWith(prefix) && (!ids.length || ids.includes(s.id)));
  const bad = []; let n = 0;
  const blank = () => page.evaluate(() => { const c = document.getElementById('simulation'), g = c.getContext('2d'), d = g.getImageData(0, 0, c.width, c.height).data, seen = new Set(); for (let i = 0; i < d.length; i += 4 * 211) { seen.add((d[i] >> 4) * 256 + (d[i + 1] >> 4) * 16 + (d[i + 2] >> 4)); if (seen.size > 6) return false; } return true; });
  const texts = () => page.evaluate(() => (document.querySelector('.lab-layout') || document.body).innerText.split('\n').filter(t => /NaN|Infinity|undefined|\[object|null\b/.test(t)).slice(0, 3));
  const setSliders = which => page.evaluate(w => { for (const el of document.querySelectorAll('#controls input[type=range]')) { el.value = w === 'min' ? el.min : w === 'max' ? el.max : el.defaultValue; el.dispatchEvent(new Event('input', { bubbles: true })); } for (const s of document.querySelectorAll('#controls select')) { s.selectedIndex = w === 'max' ? s.options.length - 1 : 0; s.dispatchEvent(new Event('change', { bubbles: true })); } }, which);
  for (const mode of (process.env.MODES || '2d,ultra').split(',')) {
    await page.evaluate(m => { document.getElementById('mode-' + m).click(); }, mode);
    for (const s of list) {
      n++; const before = errs.length;
      await page.evaluate(id => { location.hash = '#' + id; }, s.id); await page.waitForTimeout(90);
      for (const st of ['init', 'min', 'max']) {
        if (st !== 'init') await setSliders(st); await page.waitForTimeout(40);
        const t = await texts(), bl = await blank();
        if (t.length) bad.push(`${s.id} [${mode}/${st}] text: ${t.join(' | ').slice(0, 160)}`);
        if (bl) bad.push(`${s.id} [${mode}/${st}] canvas looks empty`);
      }
      if (errs.length > before) bad.push(`${s.id} [${mode}] ${errs.slice(before).join(' || ').slice(0, 300)}`);
    }
  }
  console.log(`${n} simulation views checked in 2D + Ultra, 3 slider states each`);
  const uniq = [...new Set(bad)]; for (const x of uniq) console.log('FAIL ' + x);
  console.log(uniq.length ? `\n${uniq.length} PROBLEM(S)` : '\nALL SIMULATIONS OK'); await b.close(); srv.close(); process.exit(uniq.length ? 1 : 0);
})().catch(e => { console.error('CRASH', e); process.exit(2); });
