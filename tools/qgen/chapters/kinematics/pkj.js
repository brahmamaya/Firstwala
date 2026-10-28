/* Kinematics templates: tp pkj = projectile motion (level ground, from a height, horizontal projection, on an incline). g = 10 m/s². */
'use strict';
const { fmt: f, ANG, angNote, bisect } = require('../../lib');
const DEGS = [30, 37, 45, 53, 60], NOTE = d => angNote(d);
const sc = d => ANG[d];
/* step-by-step flight (position update exact for constant g); y0 = launch height above the landing level */
function flight(ux, uy, y0 = 0, dt = 1e-4) {
  let t = 0, x = 0, y = y0, vy = uy, H = y0;
  for (;;) {
    const y2 = y + vy * dt - 5 * dt * dt, vy2 = vy - 10 * dt;
    if (y2 <= 0 && t > 0) { const q = y / (y - y2); return { T: t + q * dt, R: x + ux * q * dt, H, vyEnd: vy + (vy2 - vy) * q }; }
    x += ux * dt; t += dt; y = y2; vy = vy2; if (y > H) H = y;
  }
}
const gen = r => ({ u: r.step(10, 60, 5), deg: r.pick(DEGS) });
const intro = p => `A ball is projected from level ground with a speed of ${p.u} m/s at ${p.deg}° above the horizontal.`;

module.exports = [
{ id: 'pkj-range', tp: 'pkj', st: 'Time of flight, range and height', diff: 1, type: ['mcq', 'numeric'], n: 50, tol: 1e-3,
  gen, make: p => { const { s, c } = sc(p.deg), ans = 2 * p.u * p.u * s * c / 10; return { q: `${intro(p)} Find its horizontal range. (g = 10 m/s².)${NOTE(p.deg)}`, ans, unit: 'm',
    steps: ['Range R = {u² sin 2θ;g} = {2u² sin θ cos θ;g}.', `sin ${p.deg}° = ${f(s, 3)}, cos ${p.deg}° = ${f(c, 3)}`, `R = {2 × ${p.u * p.u} × ${f(s, 3)} × ${f(c, 3)};10}`, `R = ${f(ans)} m`],
    wrong: [[p.u * p.u * s * c / 10, 'missing the factor 2 in sin 2θ'], [p.u * p.u * s / 10, 'used sin θ instead of sin 2θ'], [p.u * p.u * s * s / 20, 'gave the maximum height'], [p.u * p.u / 10 * Math.sin(Math.PI * p.deg / 180) * 2 * c * 0.5 + p.u, 'added u']] }; },
  check: p => { const { s, c } = sc(p.deg); return flight(p.u * c, p.u * s).R; } },

{ id: 'pkj-height', tp: 'pkj', st: 'Time of flight, range and height', diff: 1, type: ['mcq', 'numeric'], n: 50, tol: 1e-3,
  gen, make: p => { const { s } = sc(p.deg), ans = p.u * p.u * s * s / 20; return { q: `${intro(p)} Find the maximum height it reaches. (g = 10 m/s².)${NOTE(p.deg)}`, ans, unit: 'm',
    steps: ['Only the vertical component matters: u sin θ at the start and 0 at the top.', 'H = {u² sin² θ;2g}', `H = {${p.u * p.u} × ${f(s * s, 3)};20}`, `H = ${f(ans)} m`],
    wrong: [[p.u * p.u * s * s / 10, 'missing the 2 in 2g'], [p.u * p.u * s / 20, 'sin θ not squared'], [p.u * p.u * Math.sqrt(1 - s * s) ** 2 / 20, 'used cos θ instead of sin θ'], [p.u * p.u / 20, 'ignored the angle']] }; },
  check: p => { const { s, c } = sc(p.deg); return flight(p.u * c, p.u * s).H; } },

{ id: 'pkj-time', tp: 'pkj', st: 'Time of flight, range and height', diff: 1, type: ['mcq', 'numeric'], n: 50, tol: 1e-3,
  gen, make: p => { const { s } = sc(p.deg), ans = 2 * p.u * s / 10; return { q: `${intro(p)} Find the total time of flight. (g = 10 m/s².)${NOTE(p.deg)}`, ans, unit: 's',
    steps: ['Vertical motion: it returns to the same level when displacement = 0.', 'T = {2u sin θ;g}', `T = {2 × ${p.u} × ${f(s, 3)};10}`, `T = ${f(ans)} s`],
    wrong: [[p.u * s / 10, 'gave the time to the top only'], [2 * p.u * Math.sqrt(1 - s * s) / 10, 'used cos θ instead of sin θ'], [2 * p.u / 10, 'ignored the angle'], [4 * p.u * s / 10, 'doubled twice']] }; },
  check: p => { const { s, c } = sc(p.deg); return flight(p.u * c, p.u * s).T; } },

{ id: 'pkj-top-speed', tp: 'pkj', st: 'Speed, energy and momentum of a projectile', diff: 1, type: ['mcq', 'numeric'], n: 50, tol: 1e-6,
  gen, make: p => { const { c } = sc(p.deg), ans = p.u * c; return { q: `${intro(p)} What is its speed at the highest point of the path?${NOTE(p.deg)}`, ans, unit: 'm/s',
    steps: ['At the top the vertical velocity is zero.', 'Only the horizontal component remains, and it never changes.', `v = u cos θ = ${p.u} × ${f(c, 3)}`, `v = ${f(ans)} m/s`],
    wrong: [[p.u * Math.sqrt(1 - c * c), 'used u sin θ (the vertical component)'], [0, 'thought the speed is zero at the top'], [p.u, 'took the full launch speed'], [p.u * c / 2, 'halved the horizontal component']] }; },
  check: p => { const { s, c } = sc(p.deg); return Math.sqrt(p.u * p.u - (p.u * s) ** 2); } },

{ id: 'pkj-hproj-t', tp: 'pkj', st: 'Horizontal projection', diff: 1, type: ['mcq', 'numeric'], n: 45, tol: 2e-3,
  gen: r => ({ u: r.step(5, 40, 5), h: r.step(5, 320, 5) }),
  make: p => { const ans = Math.sqrt(p.h / 5); return { q: `A stone is thrown horizontally at ${p.u} m/s from the top of a ${p.h} m high cliff. How long does it take to reach the ground? (g = 10 m/s².)`, ans, unit: 's',
    steps: ['The horizontal speed does not affect the fall time.', 'Vertically it starts from rest: h = ½gt².', `${p.h} = 5t², so t² = ${f(p.h / 5)}`, `t = ${f(ans)} s`],
    wrong: [[p.h / p.u, 'divided height by the horizontal speed'], [Math.sqrt(p.h / 10), 'forgot the 2 in h = ½gt²'], [p.h / 5, 'forgot the square root'], [Math.sqrt(2 * p.h / 10) * 2, 'doubled the fall time']] }; },
  check: p => flight(p.u, 0, p.h).T },

{ id: 'pkj-hproj-range', tp: 'pkj', st: 'Horizontal projection', diff: 2, type: ['mcq', 'numeric'], n: 50, tol: 2e-3,
  gen: r => ({ u: r.int(4, 40), t: r.int(1, 8) }),
  make: p => { const h = 5 * p.t * p.t; return { q: `A ball rolls off the edge of a horizontal table ${h} m above the floor at ${p.u} m/s. How far from the edge, measured horizontally, does it hit the floor? (g = 10 m/s².)`, ans: p.u * p.t, unit: 'm',
    steps: [`Fall time: ${h} = 5t², so t = ${p.t} s.`, 'Horizontally the speed is constant: x = ut.', `x = ${p.u} × ${p.t}`, `x = ${p.u * p.t} m`],
    wrong: [[p.u * Math.sqrt(h / 10), 'forgot the 2 in h = ½gt²'], [p.u * h / 10, 'used t = h ÷ g'], [p.u + 10 * p.t, 'added speeds instead of using x = ut'], [p.u * h / 5, 'used t = h ÷ 5']] }; },
  check: p => flight(p.u, 0, 5 * p.t * p.t).R },

{ id: 'pkj-hproj-speed', tp: 'pkj', st: 'Horizontal projection', diff: 2, type: ['mcq', 'numeric'], n: 50, tol: 2e-3,
  gen: r => ({ u: r.int(5, 40), t: r.int(1, 8) }),
  make: p => { const h = 5 * p.t * p.t, ans = Math.hypot(p.u, 10 * p.t); return { q: `A stone is thrown horizontally at ${p.u} m/s from the top of a ${h} m high tower. Find its speed just before it hits the ground. (g = 10 m/s².)`, ans, unit: 'm/s',
    steps: [`Vertical speed on landing: v_y = √(2gh) = √${20 * h} = ${10 * p.t} m/s.`, `Horizontal speed stays ${p.u} m/s.`, `v = √(${p.u}² + ${(10 * p.t) ** 2}) = √${p.u * p.u + (10 * p.t) ** 2}`, `v = ${f(ans)} m/s`],
    wrong: [[p.u + 10 * p.t, 'added the components'], [10 * p.t, 'took only the vertical speed'], [p.u * p.u + 100 * p.t * p.t, 'forgot the square root'], [Math.hypot(p.u, 5 * p.t), 'used the average vertical speed']] }; },
  check: p => { const r = flight(p.u, 0, 5 * p.t * p.t); return Math.hypot(p.u, r.vyEnd); } },

{ id: 'pkj-tan-fall', tp: 'pkj', st: 'Horizontal projection', diff: 2, type: ['mcq', 'numeric'], n: 45, tol: 2e-3,
  gen: r => ({ u: r.int(5, 40), t: r.int(1, 8) }),
  make: p => { const h = 5 * p.t * p.t; return { q: `A ball is thrown horizontally at ${p.u} m/s from a height of ${h} m. If φ is the angle its velocity makes with the horizontal just before landing, find tan φ. (g = 10 m/s².)`, ans: 10 * p.t / p.u, unit: '',
    steps: [`Vertical speed on landing = gt = 10 × ${p.t} = ${10 * p.t} m/s (the fall takes ${p.t} s).`, `Horizontal speed = ${p.u} m/s.`, `tan φ = {v_y;v_x} = {${10 * p.t};${p.u}}`, `tan φ = ${f(10 * p.t / p.u)}`],
    wrong: [[p.u / (10 * p.t), 'inverted the ratio'], [5 * p.t / p.u, 'used half the vertical speed'], [(10 * p.t) / Math.hypot(p.u, 10 * p.t), 'gave sin φ'], [p.u / Math.hypot(p.u, 10 * p.t), 'gave cos φ']] }; },
  check: p => { const r = flight(p.u, 0, 5 * p.t * p.t); return -r.vyEnd / p.u; } },

{ id: 'pkj-speed-t', tp: 'pkj', st: 'Speed, energy and momentum of a projectile', diff: 2, type: ['mcq', 'numeric'], n: 50, tol: 1e-6,
  gen: r => { const deg = r.pick([37, 53]), u = r.step(10, 60, 5); return { u, deg, t: r.int(1, Math.max(1, Math.floor(u * sc(deg).s / 10))) }; },
  make: p => { const { s, c } = sc(p.deg), vx = p.u * c, vy = p.u * s - 10 * p.t, ans = Math.hypot(vx, vy); return { q: `A projectile is launched at ${p.u} m/s at ${p.deg}° above the horizontal. Find its speed ${p.t} s after launch. (g = 10 m/s², sin 37° = cos 53° = 0.6, cos 37° = sin 53° = 0.8.)`, ans, unit: 'm/s',
    steps: [`v_x = u cos ${p.deg}° = ${f(vx)} m/s (constant).`, `v_y = u sin ${p.deg}° − gt = ${f(p.u * s)} − ${10 * p.t} = ${f(vy)} m/s.`, `v = √(${f(vx)}² + ${f(vy)}²) = √${f(vx * vx + vy * vy)}`, `v = ${f(ans)} m/s`],
    wrong: [[vx + Math.abs(vy), 'added the components'], [Math.hypot(vx, p.u * s + 10 * p.t), 'added gt instead of subtracting'], [Math.hypot(p.u * s, vy), 'used u sin θ for the horizontal part'], [Math.abs(vy), 'took only the vertical component']] }; },
  check: p => { const { s, c } = sc(p.deg); let vy = p.u * s, t = 0; const dt = 1e-4, n = Math.round(p.t / dt); for (let i = 0; i < n; i++) vy -= 10 * dt; return Math.sqrt((p.u * c) ** 2 + vy * vy); } },

{ id: 'pkj-speed-h', tp: 'pkj', st: 'Speed, energy and momentum of a projectile', diff: 2, type: ['mcq', 'numeric'], n: 50, tol: 1e-3,
  gen: r => { const deg = r.pick(DEGS), u = r.step(10, 60, 5), Hm = u * u * sc(deg).s ** 2 / 20, h = Math.floor(Hm * 0.8); if (h < 2) return null; return { u, deg, h: r.int(1, h) }; },
  make: p => { const ans = Math.sqrt(p.u * p.u - 20 * p.h); return { q: `${intro(p)} Find its speed when it is ${p.h} m above the ground. (g = 10 m/s².)${NOTE(p.deg)}`, ans, unit: 'm/s',
    steps: ['Gravity is the only force, so v² = u² − 2gh whatever the angle.', `v² = ${p.u}² − 2 × 10 × ${p.h} = ${p.u * p.u} − ${20 * p.h}`, `v² = ${p.u * p.u - 20 * p.h}`, `v = ${f(ans)} m/s`],
    wrong: [[p.u - 20 * p.h / p.u, 'subtracted linearly'], [Math.sqrt(p.u * p.u - 10 * p.h), 'used gh instead of 2gh'], [Math.sqrt(p.u * p.u + 20 * p.h), 'added the height term'], [p.u * sc(p.deg).c, 'gave the speed at the top']] }; },
  check: p => { const { s, c } = sc(p.deg); const y = t => p.u * s * t - 5 * t * t, t1 = bisect(x => y(x) - p.h, 0, p.u * s / 10); return Math.hypot(p.u * c, p.u * s - 10 * t1); } },

{ id: 'pkj-ke-top', tp: 'pkj', st: 'Speed, energy and momentum of a projectile', diff: 2, type: ['mcq', 'numeric'], n: 50, tol: 1e-6,
  gen: r => ({ m: r.pick([0.1, 0.2, 0.5, 1, 2, 4]), u: r.step(10, 40, 5), deg: r.pick(DEGS) }),
  make: p => { const { c } = sc(p.deg), ans = 0.5 * p.m * (p.u * c) ** 2; return { q: `A ${f(p.m)} kg ball is projected at ${p.u} m/s at ${p.deg}° above the horizontal. Find its kinetic energy at the highest point.${NOTE(p.deg)}`, ans, unit: 'J',
    steps: [`At the top the speed is only the horizontal component: v = u cos ${p.deg}° = ${f(p.u * c, 3)} m/s.`, 'KE = ½mv²', `KE = ½ × ${f(p.m)} × ${f((p.u * c) ** 2, 3)}`, `KE = ${f(ans)} J`],
    wrong: [[0.5 * p.m * p.u * p.u, 'used the launch speed'], [0.5 * p.m * (p.u * Math.sqrt(1 - c * c)) ** 2, 'used the vertical component'], [0.5 * p.m * p.u * c * p.u * c * 2, 'forgot the ½'], [0.5 * p.m * p.u * c, 'did not square the speed']] }; },
  check: p => { const { s, c } = sc(p.deg), m = p.m, E0 = 0.5 * m * p.u * p.u, Ey = 0.5 * m * (p.u * s) ** 2; return E0 - Ey; } },

{ id: 'pkj-ratio-h', tp: 'pkj', st: 'Time of flight, range and height', diff: 2, type: ['mcq', 'numeric'], n: 40, tol: 1e-6,
  gen: r => ({ pair: r.pick([[30, 60], [37, 53], [53, 37], [60, 30]]), u: r.step(10, 60, 5) }),
  make: p => { const [a, b] = p.pair, ans = (sc(a).s / sc(b).s) ** 2; return { q: `Two balls are projected with the same speed ${p.u} m/s, one at ${a}° and the other at ${b}° to the horizontal. Find the ratio (maximum height at ${a}°) ÷ (maximum height at ${b}°).${NOTE(37)}`, ans, unit: '',
    steps: ['H = {u² sin² θ;2g}, so for the same speed H ∝ sin² θ.', `Ratio = {sin² ${a}°;sin² ${b}°} = {${f(sc(a).s ** 2, 4)};${f(sc(b).s ** 2, 4)}}`, `Ratio = ${f(ans)}`, 'The two balls have the same range, because sin 2θ is equal for θ and 90° − θ.'],
    wrong: [[sc(a).s / sc(b).s, 'did not square the sines'], [1 / ans, 'inverted the ratio'], [(sc(a).c / sc(b).c) ** 2, 'used cosines'], [1, 'assumed equal heights because the ranges are equal']] }; },
  check: p => { const [a, b] = p.pair, h = d => Math.pow(p.u * sc(d).s, 2) / 20; return h(a) / h(b); } },

{ id: 'pkj-scale', tp: 'pkj', st: 'Time of flight, range and height', diff: 1, type: ['mcq', 'numeric'], n: 40, tol: 1e-9,
  gen: r => ({ R: r.int(2, 30) * 5, k: r.pick([2, 3, 4, 1.5, 2.5]), deg: r.pick(DEGS) }),
  make: p => ({ q: `A ball projected at ${p.deg}° to the horizontal has a range of ${p.R} m. If it is projected at the same angle with ${f(p.k)} times the speed, what is the new range?`, ans: p.k * p.k * p.R, unit: 'm',
    steps: ['R = {u² sin 2θ;g}, so for the same angle R ∝ u².', `The speed becomes ${f(p.k)} times, so R becomes ${f(p.k * p.k)} times.`, `R' = ${f(p.k * p.k)} × ${p.R}`, `R' = ${f(p.k * p.k * p.R)} m`],
    wrong: [[p.k * p.R, 'took R proportional to u'], [p.k * p.k * p.k * p.R, 'took R proportional to u³'], [p.R / (p.k * p.k), 'divided instead of multiplying'], [Math.sqrt(p.k) * p.R, 'took R proportional to √u']] }),
  check: p => { const u = 10, R1 = u * u * Math.sin(2 * p.deg * Math.PI / 180) / 10, R2 = (p.k * u) ** 2 * Math.sin(2 * p.deg * Math.PI / 180) / 10; return p.R * R2 / R1; } },

{ id: 'pkj-rmax-u', tp: 'pkj', st: 'Time of flight, range and height', diff: 1, type: ['mcq', 'numeric'], n: 40, tol: 1e-9,
  gen: r => ({ u: r.int(5, 60) }),
  make: p => ({ q: `A cricketer can throw a ball to a maximum horizontal distance of ${p.u * p.u / 10 === Math.round(p.u * p.u / 10) ? p.u * p.u / 10 : f(p.u * p.u / 10)} m. With what speed does he throw it? (g = 10 m/s².)`, ans: p.u, unit: 'm/s',
    steps: ['The maximum range occurs at 45°: R(max) = {u²;g}.', `u² = g × R(max) = 10 × ${f(p.u * p.u / 10)} = ${p.u * p.u}`, `u = √${p.u * p.u}`, `u = ${p.u} m/s`],
    wrong: [[p.u * p.u / 10, 'used u = R'], [p.u / Math.SQRT2, 'used u² = 2gR'], [p.u * Math.SQRT2, 'used u² = gR/2'], [p.u * p.u / 20, 'divided R by 2g']] }),
  check: p => { let best = 0; for (let d = 1; d < 90; d += 0.5) best = Math.max(best, p.u * p.u * Math.sin(2 * d * Math.PI / 180) / 10); return Math.sqrt(10 * best); }, tol: 1e-4 },

{ id: 'pkj-tan4h', tp: 'pkj', st: 'Equation of trajectory', diff: 2, type: ['mcq', 'numeric'], n: 50, tol: 1e-3,
  gen: r => ({ u: r.step(10, 60, 5), deg: r.pick(DEGS) }),
  make: p => { const { s, c } = sc(p.deg), H = p.u * p.u * s * s / 20, R = 2 * p.u * p.u * s * c / 10, ans = s / c; return { q: `A projectile reaches a maximum height of ${f(H)} m and has a horizontal range of ${f(R)} m. Find the tangent of its angle of projection.`, ans, unit: '',
    steps: ['H = {u² sin² θ;2g} and R = {2u² sin θ cos θ;g}.', 'Dividing: {H;R} = {tan θ;4}, so tan θ = {4H;R}.', `tan θ = {4 × ${f(H)};${f(R)}}`, `tan θ = ${f(ans)}`],
    wrong: [[R / (4 * H), 'inverted the formula'], [H / R, 'forgot the factor 4'], [2 * H / R, 'used 2 instead of 4'], [4 * R / H, 'put R on top']] }; },
  check: p => { const { s, c } = sc(p.deg), r = flight(p.u * c, p.u * s); return 4 * r.H / r.R; } },

{ id: 'pkj-trajectory', tp: 'pkj', st: 'Equation of trajectory', diff: 2, type: ['mcq', 'numeric'], n: 50, tol: 2e-3,
  gen: r => { const u = r.step(10, 40, 5), deg = r.pick([30, 37, 45, 53, 60]), { s, c } = sc(deg), R = 2 * u * u * s * c / 10, x = r.int(2, Math.floor(R * 0.9)); if (R < 8) return null; return { u, deg, x }; },
  make: p => { const { s, c } = sc(p.deg), ans = p.x * s / c - 10 * p.x * p.x / (2 * p.u * p.u * c * c); return { q: `${intro(p)} Find the height of the ball when it has travelled ${p.x} m horizontally. (g = 10 m/s².)${NOTE(p.deg)}`, ans, unit: 'm',
    steps: ['Trajectory: y = x tan θ − {g x²;2u² cos² θ}.', `tan ${p.deg}° = ${f(s / c, 3)}, cos² ${p.deg}° = ${f(c * c, 3)}`, `y = ${p.x} × ${f(s / c, 3)} − {10 × ${p.x * p.x};2 × ${p.u * p.u} × ${f(c * c, 3)}}`, `y = ${f(ans)} m`],
    wrong: [[p.x * s / c, 'dropped the gravity term'], [p.x * s / c + 10 * p.x * p.x / (2 * p.u * p.u * c * c), 'added the gravity term'], [p.x * s / c - 10 * p.x * p.x / (p.u * p.u * c * c), 'forgot the 2 in 2u²'], [p.x * s / c - 10 * p.x * p.x / (2 * p.u * p.u), 'forgot cos² θ']] }; },
  check: p => { const { s, c } = sc(p.deg), t = p.x / (p.u * c); return p.u * s * t - 5 * t * t; } },

{ id: 'pkj-cliff-range', tp: 'pkj', st: 'Projectile on a slope and special cases', diff: 3, type: ['mcq', 'numeric'], n: 40, tol: 2e-3,
  gen: r => { const deg = r.pick([37, 53]), u = r.step(10, 40, 5), uy = u * sc(deg).s, t = r.int(Math.floor(uy / 5) + 1, Math.floor(uy / 5) + 5); return { u, deg, t }; },
  make: p => { const { s, c } = sc(p.deg), uy = p.u * s, h = 5 * p.t * p.t - uy * p.t; return { q: `A stone is thrown from the top of a ${f(h)} m high tower at ${p.u} m/s, ${p.deg}° above the horizontal. How far from the foot of the tower does it land? (g = 10 m/s², sin 37° = cos 53° = 0.6, cos 37° = sin 53° = 0.8.)`, ans: p.u * c * p.t, unit: 'm',
    steps: [`Vertical: −${f(h)} = (${f(uy)})t − 5t², i.e. 5t² − ${f(uy)}t − ${f(h)} = 0, which gives t = ${p.t} s.`, `Horizontal speed = ${p.u} cos ${p.deg}° = ${f(p.u * c)} m/s.`, `Range = ${f(p.u * c)} × ${p.t}`, `Range = ${f(p.u * c * p.t)} m`],
    wrong: [[p.u * s * p.t, 'used the vertical component for the horizontal motion'], [2 * p.u * s * p.u * c / 10, 'used the level-ground range formula'], [p.u * p.t, 'used the full speed horizontally'], [p.u * c * Math.sqrt(2 * h / 10), 'used the horizontal-projection time']] }; },
  check: p => { const { s, c } = sc(p.deg), h = 5 * p.t * p.t - p.u * s * p.t; return flight(p.u * c, p.u * s, h).R; } },

{ id: 'pkj-bomb', tp: 'pkj', st: 'Horizontal projection', diff: 2, type: ['mcq', 'numeric'], n: 40, tol: 2e-3,
  gen: r => ({ k: r.int(2, 10), t: r.int(3, 9) }),
  make: p => { const v = 18 * p.k, h = 5 * p.t * p.t; return { q: `A helicopter flying horizontally at ${v} km h⁻¹ at a height of ${h} m drops a food packet. At what horizontal distance, measured ahead of the point of release, does the packet land? (g = 10 m/s², ignore air.)`, ans: 5 * p.k * p.t, unit: 'm',
    steps: [`Speed = ${v} km h⁻¹ × {5;18} = ${5 * p.k} m/s (the packet keeps this horizontal speed).`, `Fall time: ${h} = 5t², so t = ${p.t} s.`, `Distance = ${5 * p.k} × ${p.t}`, `= ${5 * p.k * p.t} m`],
    wrong: [[v * p.t, 'did not convert km h⁻¹ to m/s'], [0, 'thought it falls straight down'], [5 * p.k * Math.sqrt(h / 10), 'forgot the 2 in h = ½gt²'], [v / 3.6 / 3.6 * p.t, 'divided by 3.6 twice']] }; },
  check: p => flight(18 * p.k * 1000 / 3600, 0, 5 * p.t * p.t).R },

{ id: 'pkj-perp-time', tp: 'pkj', st: 'Projectile on a slope and special cases', diff: 3, type: ['mcq', 'numeric'], n: 36, tol: 1e-3,
  gen: r => ({ deg: r.pick(DEGS), u: r.step(10, 60, 5) }),
  make: p => { const { s } = sc(p.deg), ans = p.u / (10 * s); return { q: `${intro(p)} At what time after launch is its velocity perpendicular to the initial velocity? (g = 10 m/s².)${NOTE(p.deg)}`, ans, unit: 's',
    steps: ['Perpendicular means the dot product of v and u is zero.', 'u = (u cos θ, u sin θ), v = (u cos θ, u sin θ − gt).', 'u² cos² θ + u² sin² θ − g t u sin θ = 0, so t = {u;g sin θ}.', `t = {${p.u};10 × ${f(s, 3)}} = ${f(ans)} s`],
    wrong: [[p.u * s / 10, 'gave the time to the top'], [2 * p.u * s / 10, 'gave the total flight time'], [p.u / (10 * Math.sqrt(1 - s * s)), 'used cos θ instead of sin θ'], [p.u / 10, 'ignored the angle']] }; },
  check: p => { const { s, c } = sc(p.deg); return bisect(t => (p.u * c) * (p.u * c) + (p.u * s) * (p.u * s - 10 * t), 0, 3 * p.u); } },

{ id: 'pkj-incline-h', tp: 'pkj', st: 'Projectile on a slope and special cases', diff: 3, type: ['mcq', 'numeric'], n: 40, tol: 2e-3,
  gen: r => ({ deg: r.pick([37, 53]), u: r.int(2, 16) }),
  make: p => { const tn = p.deg === 37 ? 0.75 : 4 / 3, cs = p.deg === 37 ? 0.8 : 0.6, t = 2 * p.u * tn / 10, ans = p.u * t / cs; return { q: `A ball is thrown horizontally at ${p.u} m/s from a point on a long smooth incline of angle ${p.deg}° with the horizontal; it falls on the incline below the point of projection. Find the distance from the launch point to the landing point measured along the incline. (g = 10 m/s², tan 37° = 3/4, tan 53° = 4/3, cos 37° = 0.8, cos 53° = 0.6.)`, ans, unit: 'm',
    steps: [`Take the launch point as origin. The incline is the line y = −x tan ${p.deg}°.`, `Ball: x = ut, y = −5t². Landing: 5t² = u t tan ${p.deg}°, so t = {2u tan ${p.deg}°;g} = ${f(t)} s.`, `Horizontal distance x = ${p.u} × ${f(t)} = ${f(p.u * t)} m.`, `Distance along the incline = x ÷ cos ${p.deg}° = ${f(p.u * t)} ÷ ${cs} = ${f(ans)} m`],
    wrong: [[p.u * t, 'gave the horizontal distance'], [p.u * t * cs, 'multiplied by cos instead of dividing'], [p.u * t / (p.deg === 37 ? 0.6 : 0.8), 'divided by sin instead of cos'], [p.u * Math.sqrt(2 * p.u * tn / 10), 'used an incorrect time']] }; },
  check: p => { const a = p.deg === 37 ? Math.atan2(3, 4) : Math.atan2(4, 3); let x = 0, y = 0, t = 0; const dt = 1e-5; while (-y < x * Math.tan(a) || t === 0) { t += dt; x = p.u * t; y = -5 * t * t; if (t > 100) break; } return Math.hypot(x, y); }, },

{ id: 'pkj-incline-perp', tp: 'pkj', st: 'Projectile on a slope and special cases', diff: 3, type: ['mcq', 'numeric'], n: 40, tol: 2e-3,
  gen: r => ({ deg: r.pick([37, 53]), u: r.int(4, 48) }),
  make: p => { const s = p.deg === 37 ? 0.6 : 0.8, c = p.deg === 37 ? 0.8 : 0.6, T = 2 * p.u / (10 * c), ans = 0.5 * 10 * s * T * T; return { q: `A ball is thrown at ${p.u} m/s perpendicular to a smooth incline of angle ${p.deg}° and later strikes the incline. Find the distance along the incline between the launch point and the point of impact. (g = 10 m/s², sin 37° = cos 53° = 0.6, cos 37° = sin 53° = 0.8.)`, ans, unit: 'm',
    steps: [`Use axes along and perpendicular to the incline. Perpendicular: initial speed ${p.u}, acceleration −g cos ${p.deg}° = −${f(10 * c)} m/s².`, `Time of flight T = {2u;g cos ${p.deg}°} = ${f(T)} s.`, `Along the incline: initial speed 0, acceleration g sin ${p.deg}° = ${f(10 * s)} m/s².`, `Distance = ½ × ${f(10 * s)} × ${f(T)}² = ${f(ans)} m`],
    wrong: [[0.5 * 10 * c * T * T, 'swapped sine and cosine'], [0.5 * 10 * T * T, 'used g instead of g sin θ along the incline'], [p.u * T, 'used the launch speed along the incline'], [0.5 * 10 * s * (T / 2) ** 2, 'used half the flight time']] }; },
  check: p => { const a = p.deg === 37 ? Math.atan2(3, 4) : Math.atan2(4, 3); const ux = -p.u * Math.sin(a), uy = p.u * Math.cos(a); let t = 0, x = 0, y = 0, vy = uy; const dt = 1e-5; for (;;) { t += dt; x = ux * t; y = uy * t - 5 * t * t; if (t > 1e-3 && y < x * Math.tan(a)) break; if (t > 100) break; } return Math.hypot(x, y); } },
];
