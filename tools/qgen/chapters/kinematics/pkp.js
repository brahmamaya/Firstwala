/* Kinematics templates: tp pkp = motion in a plane (position vector given as a function of time, constant acceleration in 2-D, path). */
'use strict';
const { fmt: f, deriv } = require('../../lib');

module.exports = [
{ id: 'pkp-speed', tp: 'pkp', st: 'Velocity and acceleration from position', diff: 2, type: ['mcq', 'numeric'], n: 50, tol: 1e-6,
  gen: r => ({ al: r.int(1, 6), be: r.int(1, 4), t: r.int(1, 5) }),
  make: p => { const vy = 2 * p.be * p.t, ans = Math.hypot(p.al, vy); return { q: `The position of a particle is r = (${p.al}t) i + (${p.be}t²) j (metres, t in seconds). Find its speed at t = ${p.t} s.`, ans, unit: 'm/s',
    steps: ['Velocity v = dr/dt, component by component.', `v_x = ${p.al} m/s, v_y = ${2 * p.be}t = ${vy} m/s at t = ${p.t} s.`, `Speed = √(${p.al}² + ${vy}²) = √${p.al * p.al + vy * vy}`, `= ${f(ans)} m/s`],
    wrong: [[p.al + vy, 'added the components'], [Math.hypot(p.al, p.be * p.t), 'differentiated t² to t'], [Math.hypot(p.al * p.t, p.be * p.t * p.t), 'gave the distance from the origin'], [p.al * p.al + vy * vy, 'forgot the square root']] }; },
  check: p => { const x = t => p.al * t, y = t => p.be * t * t; return Math.hypot(deriv(x, p.t, 1e-4), deriv(y, p.t, 1e-4)); } },

{ id: 'pkp-acc', tp: 'pkp', st: 'Velocity and acceleration from position', diff: 2, type: ['mcq', 'numeric'], n: 50, tol: 1e-5,
  gen: r => ({ a: r.int(1, 5), b: r.int(1, 3), t: r.int(1, 5) }),
  make: p => { const ax = 2 * p.a, ay = 6 * p.b * p.t, ans = Math.hypot(ax, ay); return { q: `A particle moves so that x = ${p.a}t² and y = ${p.b}t³ (metres, t in seconds). Find the magnitude of its acceleration at t = ${p.t} s.`, ans, unit: 'm/s²',
    steps: [`a_x = d²x/dt² = ${ax} m/s².`, `a_y = d²y/dt² = ${6 * p.b}t = ${ay} m/s² at t = ${p.t} s.`, `a = √(${ax}² + ${ay}²) = √${ax * ax + ay * ay}`, `a = ${f(ans)} m/s²`],
    wrong: [[ax + ay, 'added the components'], [Math.hypot(ax, 3 * p.b * p.t * p.t), 'used the velocity y-component'], [Math.hypot(p.a, 6 * p.b * p.t), 'differentiated t² to 1'], [Math.hypot(ax, 6 * p.b), 'forgot t in a_y']] }; },
  check: p => { const h = 0.01, sd = (g, t) => (g(t + h) - 2 * g(t) + g(t - h)) / (h * h); return Math.hypot(sd(t => p.a * t * t, p.t), sd(t => p.b * t ** 3, p.t)); } },

{ id: 'pkp-const', tp: 'pkp', st: 'Constant acceleration in a plane', diff: 2, type: ['mcq', 'numeric'], n: 50, tol: 1e-5,
  gen: r => ({ ux: r.int(-8, 8), uy: r.int(0, 8), ax: r.int(-3, 3), ay: r.int(1, 4), t: r.int(1, 6) }),
  make: p => { const vx = p.ux + p.ax * p.t, vy = p.uy + p.ay * p.t, ans = Math.hypot(vx, vy); if (ans === 0) return null; return { q: `A particle has an initial velocity (${f(p.ux)}i + ${p.uy}j) m/s and a constant acceleration (${f(p.ax)}i + ${p.ay}j) m/s². Find its speed after ${p.t} s.`, ans, unit: 'm/s',
    steps: ['Apply v = u + at to each component separately.', `v_x = ${f(p.ux)} + (${f(p.ax)})(${p.t}) = ${f(vx)} m/s`, `v_y = ${p.uy} + ${p.ay} × ${p.t} = ${vy} m/s`, `Speed = √((${f(vx)})² + ${vy}²) = ${f(ans)} m/s`],
    wrong: [[Math.abs(vx) + Math.abs(vy), 'added the components'], [Math.hypot(p.ux, p.uy) + Math.hypot(p.ax, p.ay) * p.t, 'added the magnitudes of u and at'], [Math.hypot(p.ux + p.ax, p.uy + p.ay) * p.t, 'multiplied the velocity by t'], [Math.hypot(vx, p.uy), 'applied the acceleration to x only']] }; },
  check: p => { let vx = p.ux, vy = p.uy; const dt = 1e-3, n = Math.round(p.t / dt); for (let i = 0; i < n; i++) { vx += p.ax * dt; vy += p.ay * dt; } return Math.hypot(vx, vy); } },

{ id: 'pkp-path', tp: 'pkp', st: 'Path of a particle', diff: 2, type: ['mcq', 'numeric'], n: 45, tol: 1e-9,
  gen: r => ({ al: r.int(1, 5), be: r.int(1, 9) }),
  make: p => ({ q: `A particle moves with x = ${p.al}t and y = ${p.be}t² (SI units). Its path has the form y = Kx². Find K.`, ans: p.be / (p.al * p.al), unit: '',
    steps: [`Eliminate t: t = x ÷ ${p.al}.`, `y = ${p.be} × (x ÷ ${p.al})² = {${p.be};${p.al * p.al}}x²`, `K = ${f(p.be / (p.al * p.al), 4)}`],
    wrong: [[p.be / p.al, 'divided by α instead of α²'], [p.be * p.al * p.al, 'multiplied by α²'], [p.al * p.al / p.be, 'inverted the ratio'], [p.be * p.al, 'multiplied by α']] }),
  check: p => { const t = 3, x = p.al * t, y = p.be * t * t; return y / (x * x); } },

{ id: 'pkp-avg-acc', tp: 'pkp', st: 'Other motion in a plane', diff: 2, type: ['mcq', 'numeric'], n: 50, tol: 1e-9,
  gen: r => ({ v1x: r.int(-10, 10), v1y: r.int(-10, 10), v2x: r.int(-10, 10), v2y: r.int(-10, 10), dt: r.int(1, 5) }),
  make: p => { const dx = p.v2x - p.v1x, dy = p.v2y - p.v1y, ans = Math.hypot(dx, dy) / p.dt; if (ans === 0) return null; return { q: `The velocity of a particle changes from (${f(p.v1x)}i ${p.v1y < 0 ? '− ' + -p.v1y : '+ ' + p.v1y}j) m/s to (${f(p.v2x)}i ${p.v2y < 0 ? '− ' + -p.v2y : '+ ' + p.v2y}j) m/s in ${p.dt} s. Find the magnitude of its average acceleration.`, ans, unit: 'm/s²',
    steps: ['Average acceleration = Δv ÷ Δt, with Δv taken as a vector.', `Δv = (${f(p.v2x)} − (${f(p.v1x)}))i + (${f(p.v2y)} − (${f(p.v1y)}))j = (${f(dx)}i ${dy < 0 ? '− ' + -dy : '+ ' + dy}j) m/s`, `|Δv| = √(${dx * dx} + ${dy * dy}) = ${f(Math.hypot(dx, dy))} m/s`, `a = ${f(Math.hypot(dx, dy))} ÷ ${p.dt} = ${f(ans)} m/s²`],
    wrong: [[Math.abs(Math.hypot(p.v2x, p.v2y) - Math.hypot(p.v1x, p.v1y)) / p.dt, 'used the change in speed (scalar)'], [Math.hypot(p.v2x + p.v1x, p.v2y + p.v1y) / p.dt, 'added the velocities'], [Math.hypot(dx, dy), 'forgot to divide by the time'], [(Math.abs(dx) + Math.abs(dy)) / p.dt, 'added the components']] }; },
  check: p => Math.sqrt([[p.v2x, p.v1x], [p.v2y, p.v1y]].reduce((s, [a, b]) => s + ((a - b) / p.dt) ** 2, 0)) },
];
