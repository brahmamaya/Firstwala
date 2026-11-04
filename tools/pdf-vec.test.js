#!/usr/bin/env node
/* Test of the vector PDF writer (ttf.js + pdf-vec.js) without a browser: text with subscripts, Greek, math signs and a fallback-font character comes out as real,
   copyable text with embedded subset fonts, a small file, a figure and a picture. Uses poppler's pdftotext/pdffonts/pdfinfo when they are installed. */
'use strict';
const fs = require('fs'), os = require('os'), path = require('path'), assert = require('assert'), { execFileSync } = require('child_process');
const { parseTTF, subsetTTF } = require('./../ttf.js'), { PdfDoc } = require('./../pdf-vec.js');
const F = n => parseTTF(new Uint8Array(fs.readFileSync(path.join(__dirname, '..', 'fonts', n))));
(async () => {
  const sans = F('pp-sans.ttf'); assert(sans.cmap.has(0x41) && sans.cmap.has(0x3bc) && sans.advance(sans.cmap.get(0x41)) > 0, 'font parsed: Latin and Greek');
  const sub = parseTTF(subsetTTF(sans, [sans.cmap.get(0x41)], { cmap: true })); assert(sub.numGlyphs === sans.numGlyphs && sub.glyph(sans.cmap.get(0x41)).length > 0 && sub.glyph(sans.cmap.get(0x42)).length === 0, 'subset keeps only the asked glyphs');
  const doc = new PdfDoc({ sans, sansBold: F('pp-sans-bold.ttf'), fallback: F('pp-fallback.ttf'), fallbackBold: F('pp-fallback-bold.ttf') });
  const c = doc.page(); c.font = '700 40px Arial'; c.fillText('NEET 2026', 90, 96); c.font = '22px Arial';
  let x = 90; for (const w of ['Ratio', 'of', 'H₂SO₄', 'at', '10⁻⁶', 'K:', 'μ₀ε₀', '≈', '√2', '→', 'Fe³⁺', '∝', '⇌']) { c.fillText(w, x, 200); x += c.measureText(w).width + 7 }
  c.strokeStyle = '#000'; c.lineWidth = 2; c.beginPath(); c.moveTo(90, 230); c.lineTo(400, 230); c.stroke();
  c.drawFig({ w: 100, h: 60, d: [['c', 30, 30, 20, 'f'], ['l', 55, 30, 95, 30, 'a'], ['p', 'M10 55 A20 20 0 0 1 50 55', 'd'], ['t', 50, 12, 'A₁', 'm']] }, 90, 300, 200);
  const cv = { width: 4, height: 4, getContext: () => ({ getImageData: () => ({ data: new Uint8ClampedArray(64).fill(0).map((v, i) => i % 4 === 3 ? 255 : 0), }) }) }; c.drawImage(cv, 90, 400, 40, 40);
  const bytes = Buffer.from(await (await doc.finish('Test paper')).arrayBuffer());
  assert(bytes.slice(0, 5).toString() === '%PDF-' && bytes.length < 120000, 'small file: ' + bytes.length);
  const f = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'physica-pdf-')), 't.pdf'); fs.writeFileSync(f, bytes);
  try {
    const txt = execFileSync('pdftotext', [f, '-'], { encoding: 'utf8' });
    assert(/NEET 2026/.test(txt) && /Ratio of H₂SO₄ at 10⁻⁶ K: μ₀ε₀ ≈ √2 → Fe³⁺ ∝ ⇌/.test(txt), 'text can be copied, with spaces and the fallback-font signs: ' + JSON.stringify(txt.slice(0, 120)));
    const fonts = execFileSync('pdffonts', [f], { encoding: 'utf8' }); assert(/LiberationSans/.test(fonts) && /DejaVuSans/.test(fonts) && !/\bno\b\s+\w+\s+\w+\s+\d+ +0$/m.test(fonts.split('\n').slice(2).join('\n').replace(/yes yes yes/g, '')), 'subset fonts embedded: ' + fonts);
    assert(/Pages:\s+1/.test(execFileSync('pdfinfo', [f], { encoding: 'utf8' })), 'one page');
    console.log('pdf-vec test OK (text, fonts, page checked with poppler)');
  } catch (e) { if (e.code !== 'ENOENT') throw e; console.log('pdf-vec test OK (structure only: poppler not installed)') }
})();
