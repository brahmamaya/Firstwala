/* Screenshots of simulations for visual review.   node tools/e2e/shot.js <outDir> <id[,id...]> [modes=2d,ultra]
   SITE_ROOT=<built site folder> (default: repo root), PORT (default 3230). Needs Chromium + playwright-core. */
const { chromium } = require('playwright-core'); const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = process.env.SITE_ROOT || path.resolve(__dirname, '../..'), PORT = +process.env.PORT || 3230;
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.woff2': 'font/woff2', '.webp': 'image/webp', '.webmanifest': 'application/json' };
const [out, ids = '', modes = '2d,ultra'] = process.argv.slice(2);
const srv = http.createServer((q, r) => { const p = decodeURIComponent(new URL(q.url, 'http://x').pathname); let f = path.join(ROOT, p); if (f.endsWith('/')) f += 'index.html';
  fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'application/octet-stream' }); r.end(d); }); }).listen(PORT);
(async () => {
  fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch({ executablePath: process.env.CHROMIUM || '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  await p.route(/googletagmanager|google-analytics|docs\.google/, r => r.abort());
  await p.goto(`http://localhost:${PORT}/`, { waitUntil: 'load' }); await p.waitForTimeout(5000);
  await p.click('[data-testid=mode-simulations]').catch(() => {}); await p.waitForTimeout(800); await p.click('[data-testid=sim-open]').catch(() => {}); await p.waitForTimeout(2500);
  for (const id of ids.split(',').filter(Boolean)) for (const m of modes.split(',')) {
    await p.evaluate(m => { const e = document.getElementById('mode-' + m); if (e) e.click(); }, m); await p.evaluate(i => { location.hash = '#' + i; }, id); await p.waitForTimeout(1300);
    const c = await p.$('#simulation'); await c.screenshot({ path: path.join(out, `${id}-${m}.png`) });
  }
  await b.close(); srv.close(); console.log('screenshots in ' + out);
})().catch(e => { console.error(e); process.exit(1); });
