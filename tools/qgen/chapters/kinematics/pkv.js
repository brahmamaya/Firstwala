/* Kinematics templates: tp pkv = vectors (addition, subtraction, dot and cross product, components). */
'use strict';
const { fmt: f, ANG, TRIPLES } = require('../../lib');
/* [A, B, angle between them (deg), |A + B|] with exact integer results */
const ADD = [[3, 5, 60, 7], [5, 8, 120, 7], [7, 8, 60, 13], [3, 8, 120, 7], [7, 15, 120, 13], ...TRIPLES.map(t => [t[0], t[1], 90, t[2]])];
const rad = d => d * Math.PI / 180;
const vec = (m, d) => [m * Math.cos(rad(d)), m * Math.sin(rad(d))];
const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
const len = v => Math.hypot(v[0], v[1]);

module.exports = [
{ id: 'pkv-resultant', tp: 'pkv', st: 'Vector addition and subtraction', diff: 1, type: ['mcq', 'numeric'], n: 50, tol: 1e-9,
  gen: r => { const [A, B, th, R] = r.pick(ADD), k = r.int(1, 5); return r.int(0, 1) ? { A: A * k, B: B * k, th, R: R * k } : { A: B * k, B: A * k, th, R: R * k }; },
  make: p => ({ q: `Two forces of ${p.A} N and ${p.B} N act at a point with an angle of ${p.th}° between them. Find the magnitude of their resultant.`, ans: p.R, unit: 'N',
    steps: ['R² = A² + B² + 2AB cos θ', `R² = ${p.A}² + ${p.B}² + 2 × ${p.A} × ${p.B} × cos ${p.th}°`, `R² = ${p.A * p.A + p.B * p.B} + ${f(2 * p.A * p.B * Math.cos(rad(p.th)))} = ${p.R * p.R}`, `R = ${p.R} N`],
    wrong: [[p.A + p.B, 'added the magnitudes (θ = 0° case)'], [Math.abs(p.A - p.B), 'subtracted the magnitudes (θ = 180° case)'], [Math.sqrt(p.A * p.A + p.B * p.B), 'used Pythagoras for a non-right angle'], [p.R * p.R, 'forgot the square root']] }),
  check: p => len(add(vec(p.A, 0), vec(p.B, p.th))) },

{ id: 'pkv-diff', tp: 'pkv', st: 'Vector addition and subtraction', diff: 2, type: ['mcq', 'numeric'], n: 50, tol: 1e-9,
  gen: r => { const [A, B, th, R] = r.pick(ADD.filter(x => x[2] !== 90)), k = r.int(1, 5); return { A: A * k, B: B * k, th: 180 - th, R: R * k }; },
  make: p => ({ q: `Two vectors of magnitudes ${p.A} and ${p.B} make an angle of ${p.th}° with each other. Find the magnitude of their difference A − B.`, ans: p.R, unit: '',
    steps: ['|A − B|² = A² + B² − 2AB cos θ', `= ${p.A}² + ${p.B}² − 2 × ${p.A} × ${p.B} × cos ${p.th}°`, `= ${p.A * p.A + p.B * p.B} − (${f(2 * p.A * p.B * Math.cos(rad(p.th)))}) = ${p.R * p.R}`, `|A − B| = ${p.R}`],
    wrong: [[Math.sqrt(p.A * p.A + p.B * p.B + 2 * p.A * p.B * Math.cos(rad(p.th))), 'used the formula for A + B'], [Math.abs(p.A - p.B), 'subtracted the magnitudes'], [p.A + p.B, 'added the magnitudes'], [Math.sqrt(p.A * p.A + p.B * p.B), 'used Pythagoras']] }),
  check: p => len(add(vec(p.A, 0), vec(p.B, p.th).map(x => -x))) },

{ id: 'pkv-comp', tp: 'pkv', st: 'Components and unit vectors', diff: 1, type: ['mcq', 'numeric'], n: 50, tol: 1e-9,
  gen: r => ({ F: r.step(10, 100, 5), deg: r.pick([30, 37, 45, 53, 60]), axis: r.pick(['x', 'y']) }),
  make: p => { const { s, c } = ANG[p.deg], ans = p.axis === 'x' ? p.F * c : p.F * s; return { q: `A force of ${p.F} N acts at ${p.deg}° above the positive x-axis. Find its ${p.axis}-component.${p.deg === 37 || p.deg === 53 ? ' (Take sin 37° = cos 53° = 0.6, cos 37° = sin 53° = 0.8.)' : ''}`, ans, unit: 'N',
    steps: [`The component along x is F cos θ and along y is F sin θ (θ measured from the x-axis).`, `${p.axis === 'x' ? 'F cos' : 'F sin'} ${p.deg}° = ${p.F} × ${f(p.axis === 'x' ? c : s, 3)}`, `= ${f(ans)} N`],
    wrong: [[p.axis === 'x' ? p.F * s : p.F * c, 'swapped sine and cosine'], [p.F, 'took the whole force'], [p.F * Math.tan(rad(p.deg)), 'used the tangent'], [p.F / (p.axis === 'x' ? c : s), 'divided instead of multiplying']] }; },
  check: p => { const { s, c } = ANG[p.deg]; const v = [p.F * c, p.F * s]; return p.axis === 'x' ? v[0] : v[1]; } },

{ id: 'pkv-dot', tp: 'pkv', st: 'Dot and cross product', diff: 1, type: ['mcq', 'numeric'], n: 50, tol: 1e-9, pos: false,
  gen: r => { const a = [r.int(-6, 6), r.int(-6, 6)], b = [r.int(-6, 6), r.int(-6, 6)]; if (!a[0] && !a[1] || !b[0] && !b[1]) return null; return { a1: a[0], a2: a[1], b1: b[0], b2: b[1] }; },
  make: p => { const V = (x, y) => `${f(x)}i ${y < 0 ? '− ' + -y : '+ ' + y}j`; return { q: `Find the scalar (dot) product of A = (${V(p.a1, p.a2)}) and B = (${V(p.b1, p.b2)}).`, ans: p.a1 * p.b1 + p.a2 * p.b2, unit: '',
    steps: ['A · B = A_x B_x + A_y B_y', `A · B = (${f(p.a1)})(${f(p.b1)}) + (${f(p.a2)})(${f(p.b2)})`, `= ${f(p.a1 * p.b1)} + (${f(p.a2 * p.b2)})`, `= ${p.a1 * p.b1 + p.a2 * p.b2}`],
    wrong: [[p.a1 * p.b2 - p.a2 * p.b1, 'computed the cross product'], [p.a1 * p.b2 + p.a2 * p.b1, 'multiplied the wrong components'], [p.a1 + p.b1 + p.a2 + p.b2, 'added all components'], [p.a1 * p.b1 * p.a2 * p.b2, 'multiplied everything together']] }; },
  check: p => { const A = [p.a1, p.a2], B = [p.b1, p.b2], th = Math.atan2(B[1], B[0]) - Math.atan2(A[1], A[0]); return len(A) * len(B) * Math.cos(th); } },

{ id: 'pkv-cross', tp: 'pkv', st: 'Dot and cross product', diff: 2, type: ['mcq', 'numeric'], n: 50, tol: 1e-9,
  gen: r => { const a = [r.int(-6, 6), r.int(-6, 6)], b = [r.int(-6, 6), r.int(-6, 6)]; if (a[0] * b[1] - a[1] * b[0] === 0) return null; return { a1: a[0], a2: a[1], b1: b[0], b2: b[1] }; },
  make: p => { const c = p.a1 * p.b2 - p.a2 * p.b1; return { q: `Two vectors in the xy-plane are A = (${p.a1}, ${p.a2}) and B = (${p.b1}, ${p.b2}) (x- and y-components). Find the magnitude of the vector product A × B.`, ans: Math.abs(c), unit: '',
    steps: ['A × B points along z; its size is |A_x B_y − A_y B_x|.', `= |(${f(p.a1)})(${f(p.b2)}) − (${f(p.a2)})(${f(p.b1)})|`, `= |${f(p.a1 * p.b2)} − (${f(p.a2 * p.b1)})|`, `= ${Math.abs(c)}`],
    wrong: [[Math.abs(p.a1 * p.b1 + p.a2 * p.b2), 'computed the dot product'], [Math.abs(p.a1 * p.b2 + p.a2 * p.b1), 'added instead of subtracting'], [Math.abs(p.a1 * p.b2) + Math.abs(p.a2 * p.b1), 'added the absolute values'], [Math.abs(c) * Math.hypot(p.a1, p.a2), 'multiplied by |A|']] }; },
  check: p => { const A = [p.a1, p.a2], B = [p.b1, p.b2], th = Math.atan2(B[1], B[0]) - Math.atan2(A[1], A[0]); return Math.abs(len(A) * len(B) * Math.sin(th)); } },

{ id: 'pkv-proj', tp: 'pkv', st: 'Components and unit vectors', diff: 2, type: ['mcq', 'numeric'], n: 50, tol: 1e-9, pos: false,
  gen: r => { const [a, b] = r.pick([[3, 4], [4, 3], [5, 12], [12, 5], [6, 8], [8, 6]]), m = r.int(1, 2); return { a1: r.int(-9, 9), a2: r.int(-9, 9), b1: a * m, b2: b * m, bl: Math.hypot(a, b) * m }; },
  make: p => { const ans = (p.a1 * p.b1 + p.a2 * p.b2) / p.bl; return { q: `Find the component of A = (${p.a1}, ${p.a2}) along the direction of B = (${p.b1}, ${p.b2}) (components along x and y).`, ans, unit: '',
    steps: ['Component of A along B = {A · B;|B|}.', `A · B = (${f(p.a1)})(${f(p.b1)}) + (${f(p.a2)})(${f(p.b2)}) = ${f(p.a1 * p.b1 + p.a2 * p.b2)}`, `|B| = √(${p.b1}² + ${p.b2}²) = ${p.bl}`, `Component = ${p.a1 * p.b1 + p.a2 * p.b2} ÷ ${p.bl} = ${f(ans)}`],
    wrong: [[p.a1 * p.b1 + p.a2 * p.b2, 'forgot to divide by |B|'], [(p.a1 * p.b2 - p.a2 * p.b1) / p.bl, 'used the cross product (perpendicular component)'], [(p.a1 * p.b1 + p.a2 * p.b2) / (p.bl * p.bl), 'divided by |B|²'], [(p.a1 + p.a2) * p.bl / 2, 'guessed']] }; },
  check: p => { const phiA = Math.atan2(p.a2, p.a1), phiB = Math.atan2(p.b2, p.b1); return Math.hypot(p.a1, p.a2) * Math.cos(phiA - phiB); } },

{ id: 'pkv-perp', tp: 'pkv', st: 'Dot and cross product', diff: 2, type: ['mcq', 'numeric'], n: 40, tol: 1e-9, pos: false,
  gen: r => { const a1 = r.pick([1, 2, 3, 4, 5, 6]), q = r.int(-5, 5), a2 = r.int(-8, 8), b2 = a1 * q; if (!a2 || !b2) return null; return { a1, a2, b2 }; },
  make: p => { const ans = -p.a2 * p.b2 / p.a1; return { q: `For what value of p are the vectors A = (${p.a1}, ${p.a2}) and B = (p, ${p.b2}) (x- and y-components) perpendicular to each other?`, ans, unit: '',
    steps: ['Perpendicular vectors have zero dot product.', `A · B = ${p.a1}p + (${f(p.a2)})(${f(p.b2)}) = 0`, `${p.a1}p = ${f(-p.a2 * p.b2)}`, `p = ${f(ans)}`],
    wrong: [[p.a2 * p.b2 / p.a1, 'sign error'], [-p.a1 * p.b2 / p.a2, 'swapped the components of A'], [-p.a2 / p.b2 * p.a1, 'inverted the ratio'], [p.a1 * p.a2 * p.b2, 'multiplied instead of dividing']] }; },
  check: p => { const lam = p.b2 / p.a1; return -p.a2 * lam; } },
];
