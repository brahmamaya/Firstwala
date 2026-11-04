/* Vector PDF writer for the paper download: real text (selectable, copyable, searchable, sharp at any zoom), embedded subsetted fonts, tiny files.
   PdfDoc collects pages; PdfCtx is a drawing context with the few CanvasRenderingContext2D members the typesetter in rank-export.js uses
   (font, fillStyle, strokeStyle, lineWidth, fillText, measureText, fillRect, drawImage, beginPath/moveTo/lineTo/stroke), so the same layout code draws either on a canvas or into the PDF.
   Fonts: parsed TrueType fonts from ttf.js: { sans, sansBold, fallback, fallbackBold } (Liberation Sans, DejaVu Sans for the characters Liberation lacks). */
(() => {
'use strict';
const T = () => (typeof window !== 'undefined' ? window.PhysicaTTF : require('./ttf.js'));
const enc = new TextEncoder(), h4 = n => n.toString(16).padStart(4, '0'), num = n => (Math.round(n * 1000) / 1000).toString();
async function deflate(u8) {
  if (typeof CompressionStream === 'undefined') return null;
  const cs = new CompressionStream('deflate'), w = cs.writable.getWriter(); w.write(u8); w.close();
  return new Uint8Array(await new Response(cs.readable).arrayBuffer());
}
const color = s => { const m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(String(s)); if (!m) return '0 0 0'; let h = m[1]; if (h.length === 3) h = [...h].map(c => c + c).join(''); return [0, 2, 4].map(i => num(parseInt(h.slice(i, i + 2), 16) / 255)).join(' ') };


/* ---- PhysicaFig specs as PDF vector drawing (see phys-fig.js for the format) ---- */
function arcBez(x1, y1, rx, ry, phi, fa, fs, x2, y2) {   // SVG endpoint arc -> cubic segments [[c1x,c1y,c2x,c2y,x,y],...]
  if (!rx || !ry || (x1 === x2 && y1 === y2)) return [[x1, y1, x2, y2, x2, y2]];
  rx = Math.abs(rx); ry = Math.abs(ry); const cp = Math.cos(phi), sp = Math.sin(phi), dx = (x1 - x2) / 2, dy = (y1 - y2) / 2, x1p = cp * dx + sp * dy, y1p = -sp * dx + cp * dy;
  const lam = (x1p * x1p) / (rx * rx) + (y1p * y1p) / (ry * ry); if (lam > 1) { const k = Math.sqrt(lam); rx *= k; ry *= k }
  const sgn = fa === fs ? -1 : 1, num_ = rx * rx * ry * ry - rx * rx * y1p * y1p - ry * ry * x1p * x1p, den = rx * rx * y1p * y1p + ry * ry * x1p * x1p, co = sgn * Math.sqrt(Math.max(0, num_ / den));
  const cxp = co * (rx * y1p / ry), cyp = co * (-ry * x1p / rx), cx = cp * cxp - sp * cyp + (x1 + x2) / 2, cy = sp * cxp + cp * cyp + (y1 + y2) / 2;
  const ang = (ux, uy, vx, vy) => { const a = Math.atan2(ux * vy - uy * vx, ux * vx + uy * vy); return a };
  const th1 = ang(1, 0, (x1p - cxp) / rx, (y1p - cyp) / ry); let dth = ang((x1p - cxp) / rx, (y1p - cyp) / ry, (-x1p - cxp) / rx, (-y1p - cyp) / ry);
  if (!fs && dth > 0) dth -= 2 * Math.PI; else if (fs && dth < 0) dth += 2 * Math.PI;
  const n = Math.max(1, Math.ceil(Math.abs(dth) / (Math.PI / 2))), d = dth / n, t = 4 / 3 * Math.tan(d / 4), out = [];
  for (let i = 0; i < n; i++) {
    const a1 = th1 + i * d, a2 = a1 + d, pt = (a, k) => { const ex = rx * Math.cos(a), ey = ry * Math.sin(a), dx_ = -rx * Math.sin(a) * k, dy_ = ry * Math.cos(a) * k; return [cp * (ex + dx_) - sp * (ey + dy_) + cx, sp * (ex + dx_) + cp * (ey + dy_) + cy] };
    const c1 = pt(a1, t), c2 = pt(a2, -t), e = [cp * rx * Math.cos(a2) - sp * ry * Math.sin(a2) + cx, sp * rx * Math.cos(a2) + cp * ry * Math.sin(a2) + cy]; out.push([...c1, ...c2, ...e]);
  }
  return out;
}
function svgOps(d) {   // SVG path data -> { ops: PDF path operators, end: [x, y], dir: [dx, dy] of the last segment }
  const tk = String(d).match(/[MmLlHhVvCcSsQqTtAaZz]|-?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/gi) || [], ops = []; let i = 0, cmd = 'M', x = 0, y = 0, sx = 0, sy = 0, lc = null, lq = null, dir = [1, 0];
  const N = () => +tk[i++], P = (a, b) => num(a) + ' ' + num(b), seg = (c1x, c1y, c2x, c2y, nx, ny) => { ops.push(P(c1x, c1y) + ' ' + P(c2x, c2y) + ' ' + P(nx, ny) + ' c'); dir = [nx - c2x || nx - c1x, ny - c2y || ny - c1y]; x = nx; y = ny };
  const line = (nx, ny) => { ops.push(P(nx, ny) + ' l'); dir = [nx - x, ny - y]; x = nx; y = ny };
  while (i < tk.length) {
    if (/[A-Za-z]/.test(tk[i])) cmd = tk[i++]; const rel = cmd === cmd.toLowerCase(), C = cmd.toUpperCase(), ox = rel ? x : 0, oy = rel ? y : 0;
    if (C === 'Z') { ops.push('h'); x = sx; y = sy; lc = lq = null; continue }
    if (C === 'M') { const nx = N() + ox, ny = N() + oy; ops.push(P(nx, ny) + ' m'); x = sx = nx; y = sy = ny; cmd = rel ? 'l' : 'L'; lc = lq = null }
    else if (C === 'L') { line(N() + ox, N() + oy); lc = lq = null }
    else if (C === 'H') { line(N() + ox, y); lc = lq = null } else if (C === 'V') { line(x, N() + oy); lc = lq = null }
    else if (C === 'C') { const a = N() + ox, b = N() + oy, c = N() + ox, e = N() + oy, f = N() + ox, g = N() + oy; seg(a, b, c, e, f, g); lc = [c, e]; lq = null }
    else if (C === 'S') { const c = N() + ox, e = N() + oy, f = N() + ox, g = N() + oy, r = lc ? [2 * x - lc[0], 2 * y - lc[1]] : [x, y]; seg(r[0], r[1], c, e, f, g); lc = [c, e]; lq = null }
    else if (C === 'Q') { const a = N() + ox, b = N() + oy, f = N() + ox, g = N() + oy; seg(x + 2 / 3 * (a - x), y + 2 / 3 * (b - y), f + 2 / 3 * (a - f), g + 2 / 3 * (b - g), f, g); lq = [a, b]; lc = null }
    else if (C === 'T') { const f = N() + ox, g = N() + oy, q = lq ? [2 * x - lq[0], 2 * y - lq[1]] : [x, y]; seg(x + 2 / 3 * (q[0] - x), y + 2 / 3 * (q[1] - y), f + 2 / 3 * (q[0] - f), g + 2 / 3 * (q[1] - g), f, g); lq = q; lc = null }
    else if (C === 'A') { const rx = N(), ry = N(), rot = N(), fa = N(), fs = N(), nx = N() + ox, ny = N() + oy; for (const b of arcBez(x, y, rx, ry, rot * Math.PI / 180, !!fa, !!fs, nx, ny)) seg(...b); lc = lq = null }
    else break;
  }
  return { ops, end: [x, y], dir };
}
function figOps(doc, ctx, spec, x, y, w) {
  const page = ctx.page, a = w / (spec.w || 240), out = page.ops, K = .5523;
  out.push('q ' + num(a) + ' 0 0 ' + num(a) + ' ' + num(x) + ' ' + num(y) + ' cm 0 0 0 rg 0 0 0 RG 1 j 1 J');
  const arrow = (ex, ey, dx, dy, sw) => { const L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L, tx = ex + ux * .7 * sw, ty = ey + uy * .7 * sw, bx = ex - ux * 6.3 * sw, by = ey - uy * 6.3 * sw, hw = 3.5 * sw; out.push(num(tx) + ' ' + num(ty) + ' m ' + num(bx - uy * hw) + ' ' + num(by + ux * hw) + ' l ' + num(bx + uy * hw) + ' ' + num(by - ux * hw) + ' l h f') };
  for (const it of spec.d || []) {
    if (!Array.isArray(it)) continue; const t = it[0];
    if (t === 't') { const [tx, ty, str, o = ''] = it.slice(1); if (typeof tx !== 'number' || typeof ty !== 'number') continue; ctx.font = (o.includes('s') ? 10 : 12) + 'px Arial'; ctx.textAlign = o.includes('m') ? 'center' : o.includes('e') ? 'right' : 'left'; ctx.fillStyle = '#000'; ctx.fillText(String(str ?? ''), tx, ty); ctx.textAlign = 'left'; continue }
    const n = { l: 4, c: 3, r: 4, p: 0 }[t]; if (n === undefined) continue; const o = String(t === 'p' ? it[2] || '' : it[n + 1] || ''), sw = o.includes('B') ? 2.6 : 1.6;
    let path = '', end = null, start = null, sdir = null;
    if (t === 'l') { const [x1, y1, x2, y2] = it.slice(1, 5); if (![x1, y1, x2, y2].every(v => typeof v === 'number')) continue; path = num(x1) + ' ' + num(y1) + ' m ' + num(x2) + ' ' + num(y2) + ' l'; end = [x2, y2, x2 - x1, y2 - y1]; start = [x1, y1, x1 - x2, y1 - y2] }
    else if (t === 'c') { const [cx, cy, r] = it.slice(1, 4); if (![cx, cy, r].every(v => typeof v === 'number')) continue; const k = r * K; path = num(cx + r) + ' ' + num(cy) + ' m ' + [[cx + r, cy + k, cx + k, cy + r, cx, cy + r], [cx - k, cy + r, cx - r, cy + k, cx - r, cy], [cx - r, cy - k, cx - k, cy - r, cx, cy - r], [cx + k, cy - r, cx + r, cy - k, cx + r, cy]].map(q => q.map(num).join(' ') + ' c').join(' ') + ' h' }
    else if (t === 'r') { const [rx, ry, rw, rh] = it.slice(1, 5); if (![rx, ry, rw, rh].every(v => typeof v === 'number')) continue; path = [rx, ry, rw, rh].map(num).join(' ') + ' re' }
    else { if (typeof it[1] !== 'string' || !/^[MLHVCSQTAZmlhvcsqtaz0-9.,\s-]+$/.test(it[1])) continue; const r = svgOps(it[1]); path = r.ops.join(' '); end = [r.end[0], r.end[1], r.dir[0], r.dir[1]]; const m0 = /^\s*[Mm]\s*(-?[\d.]+)[\s,]+(-?[\d.]+)/.exec(it[1]); start = m0 ? [+m0[1], +m0[2], 0, 0] : null }
    if (o.includes('F')) out.push('0 g ' + path + ' f 0 G');
    else if (o.includes('f')) out.push('0.84 g ' + path + ' f 0 g');
    out.push(num(sw) + ' w ' + (o.includes('d') ? '[5 4] 0 d ' : '[] 0 d ') + path + ' S [] 0 d');
    if ((o.includes('a') || o.includes('b')) && end) arrow(end[0], end[1], end[2], end[3], sw);
    if (o.includes('b') && start && t === 'l') arrow(start[0], start[1], start[2], start[3], sw);
  }
  out.push('Q');
}

class PdfDoc {
  constructor(fonts, { pageW = 595.28, pageH = 841.89, unitW = 1240 } = {}) {
    this.W = pageW; this.H = pageH; this.s = pageW / unitW; this.pages = []; this.images = []; this.imgOf = new WeakMap();
    const mk = (font, key, name) => ({ font, key, name, used: new Set(), uni: new Map(), id: 'F' + key });
    this.faces = { S: mk(fonts.sans, 'S', 'LiberationSans'), SB: mk(fonts.sansBold, 'SB', 'LiberationSans-Bold'), F: mk(fonts.fallback, 'F', 'DejaVuSans'), FB: mk(fonts.fallbackBold, 'FB', 'DejaVuSans-Bold') };
  }
  page() { const p = { ops: [] }; this.pages.push(p); return new PdfCtx(this, p) }
  meter() { return new PdfCtx(this, null) }   // measures text with the font metrics, draws nothing
  async finish(title) {
    const objs = [], add = d => { objs.push(d); return objs.length }, ref = n => n + ' 0 R';
    const stream = async (extra, bytes) => { const z = await deflate(bytes), b = z || bytes; return { dict: '<< ' + extra + ' /Length ' + b.length + (z ? ' /Filter /FlateDecode' : '') + ' >>', bytes: b } };
    add(null); add(null); add(null);   // 1 catalog, 2 pages, 3 resources (filled at the end)
    const fontRefs = {}, usedFaces = Object.values(this.faces).filter(f => f.used.size);
    let fi = 0;
    for (const f of usedFaces) {
      fi++; const { subsetTTF } = T(), gids = [...f.used].sort((a, b) => a - b), data = subsetTTF(f.font, gids), pre = String.fromCharCode(64 + fi).repeat(6) + '+';
      const ff = add(await stream('/Length1 ' + data.length, data)), sc = 1000 / f.font.upem, widths = gids.map(g => g + ' [' + num(f.font.advance(g) * sc) + ']').join(' '), bb = f.font.bbox.map(v => Math.round(v * sc)).join(' ');
      const fd = add('<< /Type /FontDescriptor /FontName /' + pre + f.name + ' /Flags 32 /FontBBox [' + bb + '] /ItalicAngle 0 /Ascent ' + Math.round(f.font.ascent * sc) + ' /Descent ' + Math.round(f.font.descent * sc) + ' /CapHeight ' + Math.round(f.font.ascent * sc * .75) + ' /StemV ' + (/Bold/.test(f.name) ? 140 : 80) + ' /FontFile2 ' + ref(ff) + ' >>');
      let cm = '/CIDInit /ProcSet findresource begin 12 dict begin begincmap /CIDSystemInfo << /Registry (Adobe) /Ordering (UCS) /Supplement 0 >> def /CMapName /Adobe-Identity-UCS def /CMapType 2 def 1 begincodespacerange <0000> <FFFF> endcodespacerange\n';
      for (let i = 0; i < gids.length; i += 100) { const part = gids.slice(i, i + 100); cm += part.length + ' beginbfchar\n' + part.map(g => { const c = f.uni.get(g) || 0x3f; return '<' + h4(g) + '> <' + (c > 0xffff ? h4(0xd800 + ((c - 0x10000) >> 10)) + h4(0xdc00 + ((c - 0x10000) & 0x3ff)) : h4(c)) + '>' }).join('\n') + '\nendbfchar\n' }
      cm += 'endcmap CMapName currentdict /CMap defineresource pop end end';
      const tu = add(await stream('', enc.encode(cm)));
      const cid = add('<< /Type /Font /Subtype /CIDFontType2 /BaseFont /' + pre + f.name + ' /CIDSystemInfo << /Registry (Adobe) /Ordering (Identity) /Supplement 0 >> /FontDescriptor ' + ref(fd) + ' /DW 0 /W [' + widths + '] /CIDToGIDMap /Identity >>');
      fontRefs[f.id] = add('<< /Type /Font /Subtype /Type0 /BaseFont /' + pre + f.name + ' /Encoding /Identity-H /DescendantFonts [' + ref(cid) + '] /ToUnicode ' + ref(tu) + ' >>');
    }
    const imgRefs = {};
    for (let i = 0; i < this.images.length; i++) { const im = this.images[i], am = add(await stream('/Type /XObject /Subtype /Image /Width ' + im.w + ' /Height ' + im.h + ' /ColorSpace /DeviceGray /BitsPerComponent 8', im.gray)); imgRefs['Im' + (i + 1)] = add(await stream('/Type /XObject /Subtype /Image /Width 1 /Height 1 /ColorSpace /DeviceGray /BitsPerComponent 8 /SMask ' + ref(am), new Uint8Array([0]))) }
    const pageRefs = [];
    for (const p of this.pages) {
      const body = enc.encode(num(this.s) + ' 0 0 ' + num(-this.s) + ' 0 ' + num(this.H) + ' cm\n' + p.ops.join('\n')), c = add(await stream('', body));
      pageRefs.push(add('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ' + num(this.W) + ' ' + num(this.H) + '] /Resources 3 0 R /Contents ' + ref(c) + ' >>'));
    }
    const info = add('<< /Title (' + String(title || 'Physica').replace(/[^\x20-\x7e]/g, '').replace(/[()\\]/g, '') + ') /Producer (physica.in) /Creator (physica.in) >>');
    objs[0] = '<< /Type /Catalog /Pages 2 0 R >>'; objs[1] = '<< /Type /Pages /Kids [' + pageRefs.map(ref).join(' ') + '] /Count ' + pageRefs.length + ' >>';
    objs[2] = '<< /Font << ' + Object.entries(fontRefs).map(([k, v]) => '/' + k + ' ' + ref(v)).join(' ') + ' >> /XObject << ' + Object.entries(imgRefs).map(([k, v]) => '/' + k + ' ' + ref(v)).join(' ') + ' >> /ProcSet [/PDF /Text /ImageB] >>';
    const parts = [], offs = []; let len = 0; const put = x => { const b = typeof x === 'string' ? enc.encode(x) : x; parts.push(b); len += b.length };
    put('%PDF-1.5\n%\xe2\xe3\xcf\xd3\n');
    objs.forEach((o, i) => { offs[i] = len; put((i + 1) + ' 0 obj\n'); if (typeof o === 'string') put(o); else { put(o.dict); put('\nstream\n'); put(o.bytes); put('\nendstream') } put('\nendobj\n') });
    const xr = len; put('xref\n0 ' + (objs.length + 1) + '\n0000000000 65535 f \n'); for (const o of offs) put(String(o).padStart(10, '0') + ' 00000 n \n');
    put('trailer\n<< /Size ' + (objs.length + 1) + ' /Root 1 0 R /Info ' + info + ' 0 R >>\nstartxref\n' + xr + '\n%%EOF\n');
    return new Blob(parts, { type: 'application/pdf' });
  }
}

class PdfCtx {
  constructor(doc, page) { this.doc = doc; this.page = page; this.font = '12px Arial'; this.fillStyle = '#000'; this.strokeStyle = '#000'; this.lineWidth = 1; this.lineJoin = 'miter'; this.lineCap = 'butt'; this.textAlign = 'left'; this.textBaseline = 'alphabetic'; this._p = []; this._last = null }
  _fs() { const m = /([\d.]+)px/.exec(this.font); return { size: m ? +m[1] : 12, bold: /(^|\s)(700|800|900|bold)(\s|$)/.test(this.font) } }
  _glyphs(s, bold) {   // [{face, gid, cp}] : the main font, else the fallback font, else '?'
    const F = this.doc.faces, main = bold ? F.SB : F.S, fb = bold ? F.FB : F.F, out = [];
    for (const ch of String(s)) { let cp = ch.codePointAt(0); if (cp === 10 || cp === 13) continue; if (cp === 0xa0 || (cp >= 0x2000 && cp <= 0x200a)) cp = 32; if (cp === 0x200b || cp === 0xfeff) continue;
      let f = main, g = main.font.cmap.get(cp); if (g === undefined) { g = fb.font.cmap.get(cp); f = fb } if (g === undefined) { cp = 0x3f; f = main; g = main.font.cmap.get(cp) } out.push({ f, g, cp }) }
    return out;
  }
  _width(gl, size) { let w = 0; for (const x of gl) w += x.f.font.advance(x.g) * size / x.f.font.upem; return w }
  measureText(s) { const { size, bold } = this._fs(); return { width: this._width(this._glyphs(s, bold), size) } }
  fillText(s, x, y) {
    const { size, bold } = this._fs(), gl = this._glyphs(s, bold); if (!gl.length) return;
    let w = this._width(gl, size); if (this.textAlign === 'center') x -= w / 2; else if (this.textAlign === 'right') x -= w;
    if (!this.page) return;
    const col = color(this.fillStyle), L = this._last;
    if (L && Math.abs(L.y - y) < 1 && x - L.x1 > size * .12 && L.sp) { this.page.ops[L.idx] = this.page.ops[L.idx].replace(/> Tj ET$/, h4(L.sp) + '> Tj ET'); L.sp = 0 }   // a gap between words: put a space in the text so copy-paste keeps words apart
    let cx = x;
    for (let i = 0; i < gl.length;) {
      let j = i; while (j < gl.length && gl[j].f === gl[i].f) j++;
      const f = gl[i].f, run = gl.slice(i, j), hex = run.map(r => { f.used.add(r.g); if (!f.uni.has(r.g)) f.uni.set(r.g, r.cp); return h4(r.g) }).join(''), rw = this._width(run, size);
      const idx = this.page.ops.push(col + ' rg BT /' + f.id + ' ' + num(size) + ' Tf 1 0 0 -1 ' + num(cx) + ' ' + num(y) + ' Tm <' + hex + '> Tj ET') - 1;
      const sp = f.font.cmap.get(32); if (sp !== undefined) { f.used.add(sp); f.uni.set(sp, 32) }
      this._last = { idx, y, x1: cx + rw, sp: sp || 0 }; cx += rw; i = j;
    }
  }
  fillRect(x, y, w, h) { if (this.page) this.page.ops.push(color(this.fillStyle) + ' rg ' + num(x) + ' ' + num(y) + ' ' + num(w) + ' ' + num(h) + ' re f') }
  beginPath() { this._p = [] }
  moveTo(x, y) { this._p.push(num(x) + ' ' + num(y) + ' m') }
  lineTo(x, y) { this._p.push(num(x) + ' ' + num(y) + ' l') }
  stroke() { if (this.page && this._p.length) this.page.ops.push(color(this.strokeStyle) + ' RG ' + num(this.lineWidth) + ' w ' + (this.lineJoin === 'round' ? '1 j 1 J ' : '') + this._p.join(' ') + ' S') }
  drawFig(spec, x, y, w) { if (this.page) figOps(this.doc, this, spec, x, y, w) }
  drawImage(cv, x, y, w, h) {
    if (!this.page) return; const d = this.doc; let k = d.imgOf.get(cv);
    if (k === undefined) { const cw = cv.width, ch = cv.height, px = cv.getContext('2d').getImageData(0, 0, cw, ch).data, u = new Uint32Array(px.buffer, px.byteOffset, cw * ch), gray = new Uint8Array(cw * ch); for (let i = 0; i < gray.length; i++) { const a = u[i] >>> 24; gray[i] = a < 4 ? 0 : a } /* the pictures are black ink on a transparent canvas: the alpha channel is the picture (little-endian RGBA), kept as a soft mask of a black pixel, so nothing is painted around the ink */ d.images.push({ w: cw, h: ch, gray }); k = d.images.length; d.imgOf.set(cv, k) }
    this.page.ops.push('q ' + num(w) + ' 0 0 ' + num(-h) + ' ' + num(x) + ' ' + num(y + h) + ' cm /Im' + k + ' Do Q');
  }
}
const api = { PdfDoc, PdfCtx };
if (typeof module !== 'undefined') module.exports = api;
if (typeof window !== 'undefined') window.PhysicaPdf = api;
})();
