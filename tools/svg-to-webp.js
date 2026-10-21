/* Turns hand-drawn SVG figures into the small WebP files the Test Series uses (and a PNG preview for reviewers).
   node tools/svg-to-webp.js <svgDir> <webpOutDir> [pngOutDir]    needs Chromium + playwright-core.
   Each SVG must have width and height attributes (e.g. 640 x 360) and should draw its own white background. */
const fs = require('fs'), path = require('path');
const { chromium } = require('playwright-core');
const [src, out, png] = process.argv.slice(2);
if (!src || !out) { console.error('usage: node tools/svg-to-webp.js <svgDir> <webpOutDir> [pngOutDir]'); process.exit(2); }
(async () => {
  fs.mkdirSync(out, { recursive: true }); if (png) fs.mkdirSync(png, { recursive: true });
  const b = await chromium.launch({ executablePath: process.env.CHROMIUM || '/opt/pw-browsers/chromium', args: ['--no-sandbox'] }), p = await b.newPage();
  let n = 0, bad = [];
  for (const f of fs.readdirSync(src).filter(x => x.endsWith('.svg')).sort()) {
    const key = f.slice(0, -4), svg = fs.readFileSync(path.join(src, f), 'utf8');
    if (!/^[A-Za-z0-9_-]{16,64}$/.test(key)) { bad.push(f + ': file name must be 16-64 chars [A-Za-z0-9_-]'); continue; }
    if (/<script|onload=|onerror=|<foreignObject|href="http/i.test(svg)) { bad.push(f + ': script/external reference not allowed'); continue; }
    const w = +(/width="(\d+)/.exec(svg) || [])[1], h = +(/height="(\d+)/.exec(svg) || [])[1];
    if (!w || !h) { bad.push(f + ': needs width and height attributes'); continue; }
    const res = await p.evaluate(async ([s, w, h]) => {
      const img = new Image(); img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(s);
      try { await img.decode(); } catch { return null; }
      const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, w, h); g.drawImage(img, 0, 0, w, h);
      return { webp: c.toDataURL('image/webp', 0.88), png: c.toDataURL('image/png') };
    }, [svg, w, h]);
    if (!res) { bad.push(f + ': SVG did not render (syntax error?)'); continue; }
    fs.writeFileSync(path.join(out, key + '.webp'), Buffer.from(res.webp.split(',')[1], 'base64'));
    if (png) fs.writeFileSync(path.join(png, key + '.png'), Buffer.from(res.png.split(',')[1], 'base64'));
    n++;
  }
  await b.close(); console.log(n + ' figure(s) converted'); if (bad.length) { console.error(bad.join('\n')); process.exit(1); }
})();
