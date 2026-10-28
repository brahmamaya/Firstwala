#!/usr/bin/env node
/* Screenshots of one Rank-mode JEE chapter (for visual checks), served from the current checkout. No model calls.
   SUBJ=Maths (for a Maths chapter) NODE_PATH=/tmp/nm CHROMIUM=/opt/pw-browsers/chromium node tools/chapter-shot.js "<chapter name>" <outdir> [figName,figName,...] [light|dark]
   Writes: tab-guide/formulas/revise/asked.png (desktop 900 px, first screen of each tab) and figs.png (every named figure on the page
   background, in the chosen theme) so figure text, overlaps and clipping can be looked at. Prints page errors. */
'use strict';
const fs = require('fs'), http = require('http'), path = require('path');
const { chromium } = require(process.env.PW || 'playwright-core');
const [chap, out, figs, theme] = process.argv.slice(2);
if (!chap || !out) { console.log(fs.readFileSync(__filename, 'utf8').split('*/')[0]); process.exit(0) }
fs.mkdirSync(out, { recursive: true });
const root = path.join(__dirname, '..'), mt = { '.js': 'text/javascript', '.html': 'text/html', '.css': 'text/css', '.json': 'application/json' };
const srv = http.createServer((q, r) => { let f = path.join(root, decodeURIComponent(q.url.split('?')[0])); if (f.endsWith('/')) f += 'index.html'; fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end() } else { r.writeHead(200, { 'content-type': mt[path.extname(f)] || 'application/octet-stream' }); r.end(d) } }) }).listen(0, async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROMIUM }), p = await b.newPage({ viewport: { width: 900, height: 1000 } });
  p.on('pageerror', e => console.log('PAGE ERROR', e.message)); p.on('console', m => { if (m.type() === 'error') console.log('CONSOLE ERROR', m.text()) });
  await p.goto('http://localhost:' + srv.address().port + '/'); await p.waitForTimeout(3000); await p.click('.sn-x').catch(() => {});
  await p.click('.land-rank'); await p.waitForTimeout(700); await p.click('text=JEE Mains'); await p.waitForTimeout(1200); if (process.env.SUBJ) { await p.click(`button:has-text("${process.env.SUBJ}")`); await p.waitForTimeout(500) } await p.click('text=' + chap, { timeout: 8000 }); await p.waitForTimeout(1500);
  if (theme) await p.evaluate(t => { document.documentElement.dataset.theme = t }, theme);
  for (const [tab, label] of [['guide', 'Guide'], ['formulas', 'Formulas'], ['revise', 'Revise'], ['asked', 'Most asked']]) { await p.click(`button:has-text("${label}")`).catch(() => {}); await p.waitForTimeout(900); await p.screenshot({ path: path.join(out, 'tab-' + tab + '.png') }) }
  const n = await p.evaluate(() => document.querySelectorAll('.rank-ov .rk-fig, .rank-ov svg.rk-hand, .rank-ov svg.rk-fig').length); console.log('figures drawn on the last tab: ' + n);
  if (figs) { await p.evaluate(list => { const d = document.createElement('div'); d.id = 'figsheet'; d.style.cssText = 'display:grid;grid-template-columns:repeat(3,1fr);gap:10px;padding:10px;background:var(--bg,#0b1020)'; for (const k of list) { const f = window.PhysicaRankFigs[k]; if (!f) { console.log('missing figure ' + k); continue } const w = document.createElement('div'); w.className = 'rk-card'; w.append(f()); d.append(w) } document.querySelector('.rank-ov').append(d) }, figs.split(','));
    await p.waitForTimeout(400); await p.locator('#figsheet').screenshot({ path: path.join(out, 'figs.png') }) }
  await b.close(); srv.close();
});
