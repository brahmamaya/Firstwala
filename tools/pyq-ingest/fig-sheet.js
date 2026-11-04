#!/usr/bin/env node
/* Renders PhysicaFig specs to one PNG so a drawing can be compared with the printed page.
   usage: NODE_PATH=/tmp/nm CHROMIUM=/opt/pw-browsers/chromium node tools/pyq-ingest/fig-sheet.js <figs.json> <out.png> [pn,pn,...]
   figs.json = { "<pn>": { "fig": {w,h,alt,d:[...]}, "sfig": {...} } }. Each drawing is shown at the size the site uses (max 520 px wide), white on black like the dark theme. */
'use strict';
const fs = require('fs'), path = require('path');
const [src, out, only] = process.argv.slice(2);
const F = JSON.parse(fs.readFileSync(src, 'utf8')), want = only ? only.split(',') : Object.keys(F);
const { chromium } = require(process.env.PW || 'playwright-core');
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROMIUM || '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
  const pg = await b.newPage({ viewport: { width: 1100, height: 800 } });
  await pg.setContent('<body style="background:#000;color:#fff;font-family:system-ui;margin:12px"></body>');
  await pg.addScriptTag({ path: path.join(__dirname, '..', '..', 'phys-fig.js') });
  await pg.evaluate(({ F, want }) => {
    for (const pn of want) for (const k of ['fig', 'sfig']) {
      if (!F[pn]?.[k]) continue;
      const box = document.createElement('div'); box.style.cssText = 'display:inline-block;vertical-align:top;margin:8px;padding:6px;border:1px solid #345;width:540px';
      const cap = document.createElement('div'); cap.style.cssText = 'font:12px system-ui;color:#7cc0ff;margin-bottom:4px'; cap.textContent = 'Q' + pn + (k === 'sfig' ? ' · solution figure' : ' · question figure') + ' — ' + (F[pn][k].alt || '');
      const g = window.PhysicaFig(F[pn][k]); if (g) { g.style.cssText = 'width:100%;height:auto;color:#fff;display:block'; box.append(cap, g) } else { cap.style.color = '#f66'; cap.textContent += ' — NOT RENDERED (check the spec)'; box.append(cap) }
      document.body.append(box);
    }
  }, { F, want });
  await pg.screenshot({ path: out, fullPage: true }); await b.close(); console.log('wrote ' + out);
})();
