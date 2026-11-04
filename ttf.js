/* Minimal TrueType reader + subsetter for the vector PDF export (no dependency).
   parseTTF(bytes)  -> { upem, ascent, descent, bbox, numGlyphs, cmap: Map(codepoint -> glyph id), advance(gid), glyph(gid) -> bytes, table(tag) -> bytes }
   subsetTTF(font, gids, { cmap }) -> bytes of a new font that keeps the glyph ids but holds outlines only for `gids` (plus composite parts).
   Used twice: tools/make-paper-fonts.js (build time: keep the characters the papers can use) and the PDF writer (run time: keep only the glyphs of this paper). */
(() => {
'use strict';
const u16 = (b, o) => (b[o] << 8) | b[o + 1], i16 = (b, o) => (u16(b, o) << 16) >> 16, u32 = (b, o) => ((b[o] << 24) | (b[o + 1] << 16) | (b[o + 2] << 8) | b[o + 3]) >>> 0;

function parseTTF(b) {
  const n = u16(b, 4), T = {};
  for (let i = 0; i < n; i++) { const o = 12 + i * 16; T[String.fromCharCode(b[o], b[o + 1], b[o + 2], b[o + 3])] = { off: u32(b, o + 8), len: u32(b, o + 12) } }
  for (const k of ['head', 'hhea', 'maxp', 'hmtx', 'loca', 'glyf', 'cmap']) if (!T[k]) throw new Error('font without ' + k);
  const head = T.head.off, hhea = T.hhea.off, numGlyphs = u16(b, T.maxp.off + 4), nHM = u16(b, hhea + 34), longLoca = i16(b, head + 50) === 1;
  const loca = g => longLoca ? u32(b, T.loca.off + g * 4) : u16(b, T.loca.off + g * 2) * 2;
  const cmap = new Map(), c0 = T.cmap.off, sub = u16(b, c0 + 2); let best = null;
  for (let i = 0; i < sub; i++) { const pid = u16(b, c0 + 4 + i * 8), eid = u16(b, c0 + 6 + i * 8), o = c0 + u32(b, c0 + 8 + i * 8), f = u16(b, o); if ((pid === 3 && eid === 10 && f === 12) || (pid === 3 && eid === 1 && f === 4 && (!best || best.f !== 12)) || (pid === 0 && f === 4 && !best)) best = { o, f } }
  if (!best) throw new Error('no usable cmap');
  const o = best.o;
  if (best.f === 4) {
    const sc = u16(b, o + 6) / 2, E = o + 14, S = E + sc * 2 + 2, D = S + sc * 2, R = D + sc * 2;
    for (let s = 0; s < sc; s++) { const e = u16(b, E + s * 2), st = u16(b, S + s * 2), d = i16(b, D + s * 2), r = u16(b, R + s * 2); for (let c = st; c <= e && c < 0xFFFF; c++) { let g; if (!r) g = (c + d) & 0xFFFF; else { g = u16(b, R + s * 2 + r + (c - st) * 2); if (g) g = (g + d) & 0xFFFF } if (g) cmap.set(c, g) } }
  } else { const ng = u32(b, o + 12); for (let k = 0; k < ng; k++) { const p = o + 16 + k * 12, s = u32(b, p), e = u32(b, p + 4), g = u32(b, p + 8); for (let c = s; c <= e; c++) cmap.set(c, g + c - s) } }
  return {
    bytes: b, tables: T, upem: u16(b, head + 18), bbox: [i16(b, head + 36), i16(b, head + 38), i16(b, head + 40), i16(b, head + 42)], ascent: i16(b, hhea + 4), descent: i16(b, hhea + 6), numGlyphs, cmap,
    advance: g => u16(b, T.hmtx.off + Math.min(g, nHM - 1) * 4),
    glyph: g => b.subarray(T.glyf.off + loca(g), T.glyf.off + loca(g + 1)),
    table: t => b.subarray(T[t].off, T[t].off + T[t].len),
  };
}

function parts(gl) {   // glyph ids a composite glyph is made of
  const out = []; if (gl.length < 10 || i16(gl, 0) >= 0) return out;
  let p = 10, f;
  do { f = u16(gl, p); out.push(u16(gl, p + 2)); p += 4 + (f & 1 ? 4 : 2); if (f & 8) p += 2; else if (f & 0x40) p += 4; else if (f & 0x80) p += 8 } while (f & 0x20);
  return out;
}

function subsetTTF(font, gids, opt = {}) {
  const keep = new Set([0, ...gids]); for (const g of [...keep]) { const st = [g]; while (st.length) for (const c of parts(font.glyph(st.pop()))) if (!keep.has(c)) { keep.add(c); st.push(c) } }
  const chunks = [], loca = new Uint8Array((font.numGlyphs + 1) * 4), lv = new DataView(loca.buffer); let off = 0;
  for (let g = 0; g < font.numGlyphs; g++) { lv.setUint32(g * 4, off); if (keep.has(g)) { const d = font.glyph(g); if (d.length) { chunks.push(d); off += d.length; const pad = (4 - (off & 3)) & 3; if (pad) { chunks.push(new Uint8Array(pad)); off += pad } } } }
  lv.setUint32(font.numGlyphs * 4, off);
  const glyf = new Uint8Array(off); let p = 0; for (const c of chunks) { glyf.set(c, p); p += c.length }
  const head = new Uint8Array(font.table('head')); head[8] = head[9] = head[10] = head[11] = 0; head[50] = 0; head[51] = 1;   // long loca, checksum adjustment filled below
  const tabs = { glyf, head, hhea: font.table('hhea'), hmtx: font.table('hmtx'), loca, maxp: font.table('maxp') }; if (opt.cmap) tabs.cmap = font.table('cmap');
  const tags = Object.keys(tabs).sort(), nt = tags.length; let dirLen = 12 + nt * 16, total = dirLen; for (const t of tags) total += (tabs[t].length + 3) & ~3;
  const out = new Uint8Array(total), dv = new DataView(out.buffer); dv.setUint32(0, 0x00010000); dv.setUint16(4, nt); let sr = 1, es = 0; while (sr * 2 <= nt) { sr *= 2; es++ } dv.setUint16(6, sr * 16); dv.setUint16(8, es); dv.setUint16(10, nt * 16 - sr * 16);
  let pos = dirLen, headPos = 0;
  const sum = (a, o, l) => { let s = 0; for (let i = 0; i < l; i += 4) s = (s + (((a[o + i] << 24) | ((a[o + i + 1] || 0) << 16) | ((a[o + i + 2] || 0) << 8) | (a[o + i + 3] || 0)) >>> 0)) >>> 0; return s };
  tags.forEach((t, i) => { const d = tabs[t], r = 12 + i * 16; for (let k = 0; k < 4; k++) out[r + k] = t.charCodeAt(k); out.set(d, pos); if (t === 'head') headPos = pos; dv.setUint32(r + 4, sum(out, pos, (d.length + 3) & ~3)); dv.setUint32(r + 8, pos); dv.setUint32(r + 12, d.length); pos += (d.length + 3) & ~3 });
  dv.setUint32(headPos + 8, (0xB1B0AFBA - sum(out, 0, total)) >>> 0);
  return out;
}
const api = { parseTTF, subsetTTF };
if (typeof module !== 'undefined') module.exports = api;
if (typeof window !== 'undefined') window.PhysicaTTF = api;
})();
