#!/usr/bin/env node
/* One-off (rerun only to change the character ranges): builds the four small fonts the vector PDF export embeds, from Liberation Sans (SIL OFL 1.1) and, for
   characters Liberation lacks (superscript minus, some subscript letters, ∝ ⇌ ...), DejaVu Sans (Bitstream Vera licence). Glyph ids are kept, so the original cmap still works.
   usage: node tools/make-paper-fonts.js [dir with the TTFs: default /usr/share/fonts/truetype]   -> fonts/pp-sans.ttf, pp-sans-bold.ttf, pp-fallback.ttf, pp-fallback-bold.ttf */
'use strict';
const fs = require('fs'), path = require('path'), { parseTTF, subsetTTF } = require('../ttf.js');
const base = process.argv[2] || '/usr/share/fonts/truetype', out = path.join(__dirname, '..', 'fonts');
const RANGES = [[0x20, 0x7e], [0xa0, 0x17f], [0x2c6, 0x2dd], [0x300, 0x36f], [0x370, 0x3ff], [0x2000, 0x206f], [0x2070, 0x209f], [0x20a0, 0x20bf], [0x2100, 0x214f], [0x2150, 0x218f], [0x2190, 0x21ff], [0x2200, 0x22ff], [0x2300, 0x23ff], [0x25a0, 0x25ff], [0x2600, 0x26ff], [0x2713, 0x2718], [0xfb00, 0xfb06]];
const inR = c => RANGES.some(([a, b]) => c >= a && c <= b);
const jobs = [['liberation/LiberationSans-Regular.ttf', 'pp-sans.ttf', null], ['liberation/LiberationSans-Bold.ttf', 'pp-sans-bold.ttf', null], ['dejavu/DejaVuSans.ttf', 'pp-fallback.ttf', 'liberation/LiberationSans-Regular.ttf'], ['dejavu/DejaVuSans-Bold.ttf', 'pp-fallback-bold.ttf', 'liberation/LiberationSans-Bold.ttf']];
fs.mkdirSync(out, { recursive: true });
for (const [src, name, primary] of jobs) {
  const f = parseTTF(new Uint8Array(fs.readFileSync(path.join(base, src)))), P = primary && parseTTF(new Uint8Array(fs.readFileSync(path.join(base, primary))));
  const gids = []; for (const [c, g] of f.cmap) if (inR(c) && (!P || !P.cmap.has(c))) gids.push(g);
  const bytes = subsetTTF(f, gids, { cmap: true }); fs.writeFileSync(path.join(out, name), bytes);
  console.log(name, gids.length + ' glyphs', Math.round(bytes.length / 1024) + ' KB');
}
