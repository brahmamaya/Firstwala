/* qgen core: seeded RNG, number formatting, physics helpers, generation of question records.
   No dependencies. Same seed + same templates = byte-identical output. */
'use strict';
const MINUS = '−';
const hash = s => { let h = 2166136261 >>> 0; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
/* mulberry32; r.int(lo,hi) inclusive, r.step(lo,hi,s) multiples of s from lo, r.pick(array) */
function rng(seed) {
  let a = typeof seed === 'string' ? hash(seed) : seed >>> 0;
  const next = () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const r = { next,
    int: (lo, hi) => lo + Math.floor(next() * (hi - lo + 1)),
    step: (lo, hi, s) => lo + s * Math.floor(next() * (Math.floor((hi - lo) / s + 1e-9) + 1)),
    pick: arr => arr[Math.floor(next() * arr.length)],
    shuffle: arr => { arr = arr.slice(); for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(next() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; } return arr; } };
  return r;
}
/* number -> text with a real minus sign, at most dp decimals, no trailing zeros, never "-0" */
function fmt(x, dp = 2) {
  if (!Number.isFinite(x)) return String(x);
  let s = Number(x.toFixed(dp)).toString();
  if (s === '-0') s = '0';
  return s.replace('-', MINUS);
}
/* smallest number of decimals (0..dp) that shows x exactly, or dp when x has to be rounded */
function decimalsFor(x, dp = 2) {
  for (let d = 0; d <= dp; d++) if (Math.abs(x - Number(x.toFixed(d))) < 1e-9 * Math.max(1, Math.abs(x))) return { d, exact: true };
  return { d: dp, exact: false };
}
const round = (x, d = 2) => Number(x.toFixed(d));
/* angles with the conventional exam values: 37 and 53 use the 3-4-5 triangle (sin37 = 0.6), the question says so */
const ANG = { 30: { s: 0.5, c: Math.sqrt(3) / 2 }, 37: { s: 0.6, c: 0.8 }, 45: { s: Math.SQRT1_2, c: Math.SQRT1_2 }, 53: { s: 0.8, c: 0.6 }, 60: { s: Math.sqrt(3) / 2, c: 0.5 } };
const angNote = deg => deg === 37 || deg === 53 ? ' (Take sin 37° = cos 53° = 0.6, cos 37° = sin 53° = 0.8.)' : '';
/* Pythagorean triples (a,b,c) for clean 2-D answers */
const TRIPLES = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [7, 24, 25], [9, 12, 15], [12, 16, 20], [15, 20, 25], [20, 21, 29]];
/* numeric helpers used by check() functions (a method different from the closed-form solve) */
const simpson = (f, a, b, n = 2000) => { const h = (b - a) / n; let s = f(a) + f(b); for (let i = 1; i < n; i++) s += f(a + i * h) * (i % 2 ? 4 : 2); return s * h / 3; };
const deriv = (f, x, h = 1e-4) => (f(x + h) - f(x - h)) / (2 * h);
const bisect = (f, lo, hi, it = 200) => { let flo = f(lo); for (let i = 0; i < it; i++) { const m = (lo + hi) / 2, fm = f(m); if ((fm < 0) === (flo < 0)) { lo = m; flo = fm; } else hi = m; } return (lo + hi) / 2; };
/* first time f(t) changes sign, scanning from t0 in steps of dt (then refined) */
const firstCross = (f, t0, dt, tmax) => { let t = t0, v = f(t); while (t < tmax) { const t2 = t + dt, v2 = f(t2); if ((v <= 0) !== (v2 <= 0)) return bisect(f, t, t2); t = t2; v = v2; } return NaN; };
/* g = 10 m/s² everywhere (exam convention); every question that uses g says so */
const G = 10;
const BAD_TEXT = /undefined|NaN|Infinity|\$\{|\[object|\bnull\b|%s|\{\{/;

/* turn a template + params into one record, or null when it cannot make a good question from these params */
function instantiate(t, p, type, r) {
  const m = t.make(p);
  if (!m) return null;
  const ans = m.ans, chk = t.check(p);
  const dpMax = m.dp == null ? 2 : m.dp, { d, exact } = decimalsFor(ans, dpMax);
  const unit = m.unit || '', ud = unit ? ' ' + unit : '';
  const rec = { t: t.id, tp: t.tp, st: t.st, d: t.diff, type, p, ans, chk, unit, dp: d, exact, pos: t.pos !== false, why: (m.wrong || []).map(w => w[1]) };
  let q = m.q;
  if (type === 'numeric') {
    q += (unit ? '\nGive the answer in ' + unit : '\nGive the answer as a number') + (exact ? '.' : ', correct to ' + dpMax + ' decimal place' + (dpMax > 1 ? 's' : '') + '.');
    rec.out = { q, n: round(ans, d) };
  } else {
    const correct = fmt(ans, d) + ud, seen = new Set([correct]), cands = [];
    for (const w of m.wrong || []) {
      const v = w[0];
      if (!Number.isFinite(v)) continue;
      if (rec.pos && Number(v.toFixed(d)) <= 0) continue;
      if (Math.abs(v - ans) < Math.max(2 * Math.pow(10, -d), 0.02 * Math.abs(ans))) continue; /* a distractor must not be confusable with the answer */
      const s = fmt(v, d) + ud;
      if (seen.has(s)) continue;
      seen.add(s); cands.push(s);
    }
    if (cands.length < 3) return null;
    const three = r.shuffle(cands).slice(0, 3);
    const pos = r.int(0, 3), o = three.slice(); o.splice(pos, 0, correct);
    if (!exact) q += '\n(Options are rounded to ' + dpMax + ' decimal place' + (dpMax > 1 ? 's' : '') + '.)';
    rec.out = { q, o, c: pos };
  }
  rec.out.s = m.steps.join('\n');
  rec.out.d = t.diff;
  rec.out.k = hash(t.id + JSON.stringify(p)).toString(36).padStart(5, '0').slice(-5);
  rec.k = rec.out.k;
  return rec;
}

/* all records of one chapter definition. Deterministic. Errors thrown inside a template become {error} records
   so that verify.js can report them instead of crashing. */
function generate(chapter, seed = 'physica-qbank-1') {
  const recs = [];
  for (const t of chapter.templates) {
    const types = Array.isArray(t.type) ? t.type : [t.type], want = t.n || 50;
    const r = rng(seed + '|' + t.id), seen = new Set();
    let got = 0, tries = 0;
    while (got < want && tries < want * 60) {
      tries++;
      let rec = null, p = null;
      try {
        p = t.gen(r);
        if (!p) continue;
        const key = JSON.stringify(p);
        if (seen.has(key)) continue;
        seen.add(key);
        const type = types.length === 2 ? (got % 5 < 3 ? types[0] : types[1]) : types[0];
        rec = instantiate(t, p, type, r);
      } catch (e) { recs.push({ t: t.id, error: 'template threw: ' + e.message, p }); break; }
      if (!rec) continue;
      recs.push(rec); got++;
    }
    if (got < Math.min(want, t.min || 20)) recs.push({ t: t.id, error: 'template produced only ' + got + ' questions (wanted ' + want + ')' });
  }
  return recs;
}
module.exports = { rng, hash, fmt, round, decimalsFor, ANG, angNote, TRIPLES, simpson, deriv, bisect, firstCross, G, MINUS, BAD_TEXT, instantiate, generate };
