/* Kinematics templates: tp pkc = circular motion basics (v = ωr, centripetal and tangential acceleration, angular displacement). */
'use strict';
const { fmt: f, TRIPLES } = require('../../lib');
const PI7 = 22 / 7;

module.exports = [
{ id: 'pkc-ac', tp: 'pkc', st: 'Centripetal acceleration and speed', diff: 1, type: ['mcq', 'numeric'], n: 50, tol: 1e-9,
  gen: r => ({ v: r.int(2, 30), r: r.pick([2, 4, 5, 8, 10, 20, 25, 40, 50]) }),
  make: p => ({ q: `A car moves at a constant speed of ${p.v} m/s on a circular track of radius ${p.r} m. Find its centripetal acceleration.`, ans: p.v * p.v / p.r, unit: 'm/s²',
    steps: ['a = {v²;r}, directed towards the centre.', `a = {${p.v}²;${p.r}} = {${p.v * p.v};${p.r}}`, `a = ${f(p.v * p.v / p.r)} m/s²`],
    wrong: [[p.v / p.r, 'used v ÷ r'], [p.v * p.v * p.r, 'multiplied by r'], [p.v * p.v / (2 * p.r), 'added a factor ½ (from kinetic energy)'], [p.v * p.r, 'used v × r']] }),
  check: p => { const w = p.v / p.r; return w * w * p.r; } },

{ id: 'pkc-rim', tp: 'pkc', st: 'Centripetal acceleration and speed', diff: 1, type: ['mcq', 'numeric'], n: 45, tol: 1e-9,
  gen: r => ({ m: r.int(1, 9), j: r.int(1, 12) }),
  make: p => { const R = 7 * p.m, N = 15 * p.j, ans = 11 * p.m * p.j; return { q: `A wheel of radius ${R} cm turns at ${N} revolutions per minute. Find the speed of a point on its rim. (Take π = 22/7.)`, ans, unit: 'cm/s',
    steps: [`ω = 2πN ÷ 60 = 2 × {22;7} × ${N} ÷ 60 = ${f(2 * PI7 * N / 60, 3)} rad/s.`, 'v = ωR', `v = ${f(2 * PI7 * N / 60, 3)} × ${R}`, `v = ${f(ans)} cm/s`],
    wrong: [[2 * PI7 * N * R, 'forgot to change minutes to seconds'], [PI7 * N * R / 60, 'missed the factor 2 in 2π'], [2 * PI7 * N / 60, 'gave ω instead of v'], [ans / R * 60, 'mixed up the conversion']] }; },
  check: p => { const w = 2 * PI7 * (15 * p.j) / 60; return w * 7 * p.m; } },

{ id: 'pkc-period', tp: 'pkc', st: 'Centripetal acceleration and speed', diff: 1, type: ['mcq', 'numeric'], n: 45, tol: 1e-9,
  gen: r => ({ m: r.int(1, 9), T: r.pick([2, 4, 11, 22, 44]) }),
  make: p => { const R = 7 * p.m, ans = 44 * p.m / p.T; return { q: `A stone tied to a string moves in a circle of radius ${R} m and completes one revolution in ${p.T} s. Find its speed. (Take π = 22/7.)`, ans, unit: 'm/s',
    steps: ['In one period it covers the circumference 2πR.', `v = {2πR;T} = {2 × 22 × ${R};7 × ${p.T}}`, `= {${44 * p.m};${p.T}}`, `v = ${f(ans)} m/s`],
    wrong: [[2 * PI7 * R * p.T, 'multiplied by T'], [PI7 * R / p.T, 'used πR instead of 2πR'], [2 * PI7 * p.T / R, 'inverted R and T'], [R / p.T, 'used R ÷ T']] }; },
  check: p => { const w = 2 * PI7 / p.T; return w * 7 * p.m; } },

{ id: 'pkc-theta', tp: 'pkc', st: 'Non-uniform circular motion', diff: 1, type: ['mcq', 'numeric'], n: 45, tol: 1e-9,
  gen: r => ({ al: r.pick([0.5, 1, 1.5, 2, 3, 4]), t: r.int(2, 10) }),
  make: p => { const ans = 0.5 * p.al * p.t * p.t; return { q: `A wheel starts from rest and speeds up with a constant angular acceleration of ${f(p.al)} rad/s². Through what angle (in radians) does it turn in ${p.t} s?`, ans, unit: 'rad',
    steps: ['Rotational analogue of s = ut + ½at²: θ = ω₀t + ½αt².', `ω₀ = 0, so θ = ½ × ${f(p.al)} × ${p.t}²`, `θ = ${f(ans)} rad`],
    wrong: [[p.al * p.t * p.t, 'missed the ½'], [p.al * p.t, 'gave the final angular speed'], [0.5 * p.al * p.t, 'used t instead of t²'], [0.5 * p.al * p.t * p.t * p.t, 'used t³']] }; },
  check: p => { let w = 0, th = 0; const dt = 1e-4, n = Math.round(p.t / dt); for (let i = 0; i < n; i++) { th += w * dt + 0.5 * p.al * dt * dt; w += p.al * dt; } return th; }, },

{ id: 'pkc-total-a', tp: 'pkc', st: 'Non-uniform circular motion', diff: 3, type: ['mcq', 'numeric'], n: 45, tol: 1e-9,
  gen: r => { const [a, b, c] = r.pick(TRIPLES), k = r.int(1, 2), ac = b * k, j = r.int(1, 3); return { at: a * k, ac, j, c: c * k }; },
  make: p => { const v = p.ac * p.j, R = p.ac * p.j * p.j; return { q: `A particle moves on a circle of radius ${R} m. At a certain instant its speed is ${v} m/s and the speed is increasing at ${p.at} m/s². Find the magnitude of its total acceleration at that instant.`, ans: p.c, unit: 'm/s²',
    steps: [`Centripetal acceleration a_c = {v²;R} = {${v * v};${R}} = ${p.ac} m/s².`, `Tangential acceleration a_t = ${p.at} m/s² (rate of change of speed).`, 'The two are perpendicular: a = √(a_c² + a_t²)', `a = √(${p.ac * p.ac} + ${p.at * p.at}) = ${p.c} m/s²`],
    wrong: [[p.ac + p.at, 'added the magnitudes'], [p.ac, 'took only the centripetal part'], [p.at, 'took only the tangential part'], [p.ac * p.ac + p.at * p.at, 'forgot the square root']] }; },
  check: p => { const v = p.ac * p.j, R = p.ac * p.j * p.j; return Math.hypot(v * v / R, p.at); } },

{ id: 'pkc-dv', tp: 'pkc', st: 'Change in velocity', diff: 2, type: ['mcq', 'numeric'], n: 45, tol: 1e-9,
  gen: r => ({ v: r.int(2, 30), phi: r.pick([60, 90, 120, 180]) }),
  make: p => { const ans = 2 * p.v * Math.sin(p.phi * Math.PI / 360); return { q: `A particle moves in a circle at a constant speed of ${p.v} m/s. Find the magnitude of the change in its velocity when it has turned through ${p.phi}°.`, ans, unit: 'm/s',
    steps: ['The speed is unchanged but the direction changes, so Δv is a vector difference.', '|Δv| = 2v sin(φ/2)', `|Δv| = 2 × ${p.v} × sin ${p.phi / 2}°`, `|Δv| = ${f(ans)} m/s`],
    wrong: [[0, 'thought no change because the speed is constant'], [2 * p.v, 'took the half-turn value for every angle'], [p.v * p.phi * Math.PI / 180, 'used the arc length v × φ'], [2 * p.v * Math.cos(p.phi * Math.PI / 360) + p.v / 7, 'used cosine']] }; },
  check: p => { const a = p.phi * Math.PI / 180, v1 = [p.v, 0], v2 = [p.v * Math.cos(a), p.v * Math.sin(a)]; return Math.hypot(v2[0] - v1[0], v2[1] - v1[1]); } },

{ id: 'pkc-ratio', tp: 'pkc', st: 'Centripetal acceleration and speed', diff: 2, type: ['mcq', 'numeric'], n: 40, tol: 1e-9,
  gen: r => { const r1 = r.int(1, 9), r2 = r.int(1, 9); if (r1 === r2) return null; return { r1, r2, same: r.pick(['angular speed', 'speed']) }; },
  make: p => { const ans = p.same === 'speed' ? p.r2 / p.r1 : p.r1 / p.r2; return { q: `Two particles A and B move in circles of radii ${p.r1} m and ${p.r2} m with the same ${p.same === 'speed' ? 'linear speed' : 'angular speed'}. Find the ratio a(A) ÷ a(B) of their centripetal accelerations.`, ans, unit: '',
    steps: p.same === 'speed' ? ['With the same v, a = v²/r gives a ∝ 1/r.', `a(A) ÷ a(B) = r(B) ÷ r(A) = {${p.r2};${p.r1}}`, `= ${f(ans, 3)}`] : ['With the same ω, a = ω²r gives a ∝ r.', `a(A) ÷ a(B) = r(A) ÷ r(B) = {${p.r1};${p.r2}}`, `= ${f(ans, 3)}`],
    wrong: [[1 / ans, 'inverted the ratio'], [ans * ans, 'squared the ratio'], [Math.sqrt(ans), 'took the square root'], [1, 'assumed equal accelerations']] }; },
  check: p => { const w = 3, v = 3, a = r => p.same === 'speed' ? v * v / r : w * w * r; return a(p.r1) / a(p.r2); } },
];
