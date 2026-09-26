/* Fifth set — a fresh batch of Class 11 & 12 simulations that reuse the shared
   experiment renderer, so they inherit the theme, metrics panel and layout. */
(() => {
'use strict';
const { C, text, line, rr, dot, arrow, arc, measure, wrap, path, chart } = window.PhysicaDrawing;
const TAU = Math.PI * 2, g = 9.8, F = (v, n = 2) => Number(v).toFixed(n), clamp = (x, a, b) => Math.max(a, Math.min(b, x)), mod = (x, n) => ((x % n) + n) % n;
const R = (key, label, min, max, step, initial, unit = '', digits = 0) => ({ key, label, min, max, step, initial, unit, digits });
const S = (key, label, initial, options) => ({ key, label, initial, options });
const N = (label, value) => ({ label, value: String(value) });
const entries = [];
const add = (base, id, title, description, formula, observe, tryText, controls, metrics, renderer) => entries.push({ base, id, title, description, formula, observe, try: tryText, controls, metrics, draw: id, renderer });
function bars(c, items, unit) {
  const max = Math.max(...items.map(i => Math.abs(i[1])), 1e-9);
  items.forEach((it, i) => { const y = 150 + i * 76, w = it[1] / max * 430; text(c, it[0], 120, y - 30, C.muted, 14); rr(c, 120, y - 16, 430, 26, '#102638', C.line, 4); rr(c, 120, y - 16, Math.max(2, Math.abs(w)), 26, it[2] || C.mint, null, 4); text(c, `${F(it[1], 2)} ${unit || ''}`, 560, y - 3, it[2] || C.mint, 15, 'right'); });
}
function ballAt(c, x, y, r, col) { const grd = c.createRadialGradient(x - r * .3, y - r * .3, 1, x, y, r); grd.addColorStop(0, col); grd.addColorStop(1, col + 'aa'); c.beginPath(); c.arc(x, y, r, 0, TAU); c.fillStyle = grd; c.fill(); c.strokeStyle = C.white; c.lineWidth = 1.5; c.stroke(); }

/* ===== Kinematics ===== */
add('kinematics', 'free-fall-drop', 'Free fall from a height', 'Drop an object from rest and time its fall to the ground.', 'h = ½gt²; v = √(2gh)', 'Fall time grows with the square root of height, not linearly.', 'Quadruple the height and see the fall time double.',
  [R('height', 'Drop height', 5, 80, 1, 20, 'm'), R('gravity', 'Gravity', 2, 20, .1, 9.8, 'm/s²', 1)],
  (p, t) => { const T = Math.sqrt(2 * p.height / p.gravity), q = mod(t, T + .8); return [N('Fall time', `${F(T)} s`), N('Impact speed', `${F(Math.sqrt(2 * p.gravity * p.height))} m/s`), N('Elapsed', `${F(Math.min(q, T))} s`)]; },
  (c, p, t) => { const T = Math.sqrt(2 * p.height / p.gravity), q = Math.min(mod(t, T + .8), T), y = 120 + (q * q * .5 * p.gravity) / p.height * 250; line(c, 90, 370, 620, 370, C.muted, 3); line(c, 150, 110, 150, 370, C.line, 1, [4, 4]); ballAt(c, 150, y, 15, C.gold); arrow(c, 200, y, 200, Math.min(365, y + p.gravity * q * 4 + 20), C.mint, 2); measure(c, 100, 120, 100, 370, `${p.height} m`, C.gold); text(c, `t = ${F(q)} s`, 260, 110, C.white, 22); }
);
add('kinematics', 'vt-area', 'Area under a v–t graph', 'Read displacement as the area beneath a velocity–time graph.', 'displacement = area under v–t', 'A constant velocity gives a rectangle; steady acceleration adds a triangle.', 'Set acceleration to zero and read the rectangular area.',
  [R('u', 'Initial velocity', 0, 20, 1, 5, 'm/s'), R('a', 'Acceleration', -3, 4, .5, 2, 'm/s²', 1), R('time', 'Duration', 2, 10, 1, 6, 's')],
  p => { const s = p.u * p.time + .5 * p.a * p.time * p.time; return [N('Displacement', `${F(s)} m`), N('Final velocity', `${F(p.u + p.a * p.time)} m/s`), N('Average velocity', `${F(s / p.time)} m/s`)]; },
  (c, p, t) => { const vmax = Math.max(p.u, p.u + p.a * p.time, 1), x0 = 110, y0 = 380, w = 470, h = 250; arrow(c, x0, y0, x0 + w + 12, y0, C.muted); arrow(c, x0, y0, x0, y0 - h - 14, C.muted); const X = q => x0 + q / p.time * w, Y = v => y0 - clamp(v / vmax, 0, 1.05) * h; c.beginPath(); c.moveTo(X(0), y0); c.lineTo(X(0), Y(p.u)); c.lineTo(X(p.time), Y(p.u + p.a * p.time)); c.lineTo(X(p.time), y0); c.closePath(); c.fillStyle = '#42d9ca33'; c.fill(); path(c, [[X(0), Y(p.u)], [X(p.time), Y(p.u + p.a * p.time)]], C.mint, 3); text(c, 'v', x0 - 20, y0 - h, C.muted, 15); text(c, 't', x0 + w, y0 + 22, C.muted, 15); text(c, 'Shaded area = displacement', 120, 110, C.gold, 17); }
);

/* ===== Motion in a plane ===== */
add('projectile', 'range-vs-angle', 'Range versus launch angle', 'Sweep the launch angle and find where the range is greatest.', 'R = v²sin(2θ)/g', 'Maximum range occurs at 45°; complementary angles share the same range.', 'Compare 30° and 60° at the same speed.',
  [R('speed', 'Launch speed', 10, 40, 1, 25, 'm/s'), R('angle', 'Launch angle', 5, 85, 1, 40, '°')],
  p => { const th = p.angle * Math.PI / 180; return [N('Range', `${F(p.speed ** 2 * Math.sin(2 * th) / g)} m`), N('Best angle', '45°'), N('Max range', `${F(p.speed ** 2 / g)} m`)]; },
  (c, p, t) => { const vmax = p.speed ** 2 / g; chart(c, { fn: a => p.speed ** 2 * Math.sin(2 * a * Math.PI / 180) / g, xmax: 90, ymax: vmax * 1.05, xlabel: 'Launch angle / °', ylabel: 'Range / m', marker: p.angle }); text(c, `θ = ${p.angle}°`, 110, 110, C.gold, 18); }
);
add('projectile', 'horizontal-launch', 'Horizontal projectile', 'Launch a ball horizontally from a cliff and watch its parabolic drop.', 'y = ½gt²; x = v·t', 'Horizontal and vertical motions are independent.', 'Increase the launch speed and see the landing point move out.',
  [R('speed', 'Launch speed', 5, 30, 1, 15, 'm/s'), R('height', 'Cliff height', 10, 60, 5, 30, 'm')],
  p => { const T = Math.sqrt(2 * p.height / g); return [N('Flight time', `${F(T)} s`), N('Horizontal range', `${F(p.speed * T)} m`), N('Impact speed', `${F(Math.hypot(p.speed, g * T))} m/s`)]; },
  (c, p, t) => { const T = Math.sqrt(2 * p.height / g), q = mod(t, T + .6), sx = 460 / (p.speed * T), sy = 250 / p.height; line(c, 90, 120, 130, 120, C.muted, 4); line(c, 130, 120, 130, 380, '#33506388', 6); line(c, 90, 380, 600, 380, C.muted, 3); const pts = []; for (let i = 0; i <= 60; i++) { const q2 = T * i / 60; pts.push([130 + p.speed * q2 * sx, 120 + .5 * g * q2 * q2 * sy]); } path(c, pts, '#478e98', 2, [6, 6]); const tt = Math.min(q, T); ballAt(c, 130 + p.speed * tt * sx, 120 + .5 * g * tt * tt * sy, 13, C.gold); text(c, `${p.height} m`, 70, 250, C.gold, 15); }
);

/* ===== Laws of motion ===== */
add('forces', 'connected-blocks', 'Two connected blocks', 'Pull a pair of blocks joined by a string and find the shared acceleration.', 'a = F/(m₁+m₂); T = m₂a', 'The string tension only has to accelerate the block behind it.', 'Swap which block the force is applied to.',
  [R('m1', 'Front block', 1, 8, 1, 3, 'kg'), R('m2', 'Rear block', 1, 8, 1, 2, 'kg'), R('force', 'Applied force', 5, 60, 1, 20, 'N')],
  p => { const a = p.force / (p.m1 + p.m2); return [N('Acceleration', `${F(a)} m/s²`), N('String tension', `${F(p.m2 * a)} N`)]; },
  (c, p, t) => { const a = p.force / (p.m1 + p.m2), x = 160 + Math.min(300, .5 * a * mod(t, 4) ** 2 * 30); line(c, 60, 330, 620, 330, C.muted, 3); rr(c, x, 270, 30 + p.m1 * 10, 60, '#216069', C.mint, 6); rr(c, x + 40 + p.m1 * 10, 275, 30 + p.m2 * 10, 55, '#1d5662', C.gold, 6); line(c, x + 30 + p.m1 * 10, 300, x + 40 + p.m1 * 10, 300, C.white, 3); arrow(c, x + 70 + p.m1 * 10 + p.m2 * 10, 300, x + 130 + p.m1 * 10 + p.m2 * 10, 300, C.gold, 4); text(c, `a = ${F(a)} m/s²`, 70, 110, C.white, 24); text(c, `m₁ ${p.m1}kg`, x, 255, C.mint, 13); text(c, `m₂ ${p.m2}kg`, x + 45 + p.m1 * 10, 258, C.gold, 13); }
);
add('forces', 'banked-turn', 'Banked road turn', 'Bank a circular road so a car can turn without friction.', 'tanθ = v²/(rg)', 'A banked track lets the road provide the centripetal force.', 'Increase the bank angle and see the safe speed rise.',
  [R('angle', 'Bank angle', 5, 45, 1, 20, '°'), R('radius', 'Turn radius', 20, 200, 10, 80, 'm')],
  p => { const v = Math.sqrt(p.radius * g * Math.tan(p.angle * Math.PI / 180)); return [N('No-friction speed', `${F(v)} m/s`), N('In km/h', `${F(v * 3.6)} km/h`)]; },
  (c, p, t) => { const a = p.angle * Math.PI / 180, x = 330, y = 320; c.beginPath(); c.moveTo(x - 220, y); c.lineTo(x + 220, y - 440 * Math.tan(a)); c.lineTo(x + 220, y - 440 * Math.tan(a) + 22); c.lineTo(x - 220, y + 22); c.closePath(); c.fillStyle = '#1e5a63'; c.fill(); c.strokeStyle = C.mint; c.stroke(); const px = x, py = y - 220 * Math.tan(a); c.save(); c.translate(px, py); c.rotate(-a); rr(c, -26, -24, 52, 24, '#b0844f', C.gold, 4); arrow(c, 0, -6, 42, -6, C.blue, 3); c.restore(); arc(c, x - 220, y, 60, -a, 0, C.gold, 2); text(c, `θ = ${p.angle}°`, x - 150, y - 10, C.gold, 16); text(c, 'Normal + weight give the centripetal force', 70, 110, C.muted, 15); }
);

/* ===== Work, energy, power ===== */
add('energy', 'work-angle', 'Work done by a force at an angle', 'Change the direction of a force and see how much work it does.', 'W = Fd cosθ', 'Only the component along the motion does work; a perpendicular force does none.', 'Set the angle to 90° — the work drops to zero.',
  [R('force', 'Force', 5, 50, 1, 20, 'N'), R('distance', 'Distance', 1, 10, 1, 5, 'm'), R('angle', 'Angle to motion', 0, 90, 5, 30, '°')],
  p => { const W = p.force * p.distance * Math.cos(p.angle * Math.PI / 180); return [N('Work done', `${F(W)} J`), N('Useful component', `${F(p.force * Math.cos(p.angle * Math.PI / 180))} N`)]; },
  (c, p, t) => { const a = p.angle * Math.PI / 180, x = 150 + mod(t, 5) * 60; line(c, 80, 340, 600, 340, C.muted, 3); rr(c, x, 300, 70, 40, '#216069', C.mint, 6); arrow(c, x + 35, 320, x + 35 + p.force * 3 * Math.cos(a), 320 - p.force * 3 * Math.sin(a), C.gold, 4); arrow(c, x + 35, 320, x + 35 + p.force * 3 * Math.cos(a), 320, C.mint, 2); text(c, 'F', x + 40 + p.force * 3 * Math.cos(a), 316 - p.force * 3 * Math.sin(a), C.gold, 18); text(c, `θ = ${p.angle}°`, 90, 110, C.gold, 20); text(c, `W = ${F(p.force * p.distance * Math.cos(a))} J`, 90, 145, C.white, 22); }
);
add('energy', 'spring-pe', 'Elastic potential energy', 'Compress a spring and read the energy stored as a function of compression.', 'U = ½kx²', 'Stored energy grows with the square of the compression.', 'Double the compression — the energy becomes four times larger.',
  [R('k', 'Spring constant', 50, 400, 10, 150, 'N/m'), R('x', 'Compression', 1, 30, 1, 12, 'cm')],
  p => [N('Stored energy', `${F(.5 * p.k * (p.x / 100) ** 2)} J`), N('Spring force', `${F(p.k * p.x / 100)} N`)],
  (c, p, t) => { chart(c, { fn: x => .5 * p.k * (x / 100) ** 2, xmax: 30, ymax: .5 * p.k * .09, xlabel: 'Compression / cm', ylabel: 'Energy / J', marker: p.x }); text(c, 'U ∝ x²', 110, 110, C.gold, 18); }
);

/* ===== Rotation ===== */
add('rotation', 'inertia-shapes', 'Moment of inertia of shapes', 'Compare how mass distribution changes rotational inertia.', 'I = k·mR²', 'A hoop resists spinning more than a solid disc of the same mass and radius.', 'Notice the sphere is the easiest to spin up.',
  [R('mass', 'Mass', 1, 10, 1, 4, 'kg'), R('radius', 'Radius', .2, 1.5, .1, .8, 'm', 1)],
  p => { const mr = p.mass * p.radius ** 2; return [N('Hoop  mR²', `${F(mr)} kg·m²`), N('Disc  ½mR²', `${F(.5 * mr)} kg·m²`), N('Sphere  ⅖mR²', `${F(.4 * mr)} kg·m²`)]; },
  (c, p, t) => { const mr = p.mass * p.radius ** 2; bars(c, [['Hoop (mR²)', mr, C.gold], ['Disc (½mR²)', .5 * mr, C.mint], ['Sphere (⅖mR²)', .4 * mr, C.blue]], 'kg·m²'); text(c, 'Mass farther out ⇒ larger I', 120, 108, C.muted, 16); }
);
add('rotation', 'flywheel-energy', 'Rotational kinetic energy', 'Spin a flywheel and store energy in its rotation.', 'KE = ½Iω²', 'A faster spin stores much more energy because of the square law.', 'Double the angular speed and compare the stored energy.',
  [R('inertia', 'Moment of inertia', 1, 20, 1, 6, 'kg·m²'), R('omega', 'Angular speed', 1, 30, 1, 10, 'rad/s')],
  p => [N('Rotational KE', `${F(.5 * p.inertia * p.omega ** 2)} J`), N('Angular momentum', `${F(p.inertia * p.omega)} kg·m²/s`)],
  (c, p, t) => { const cx = 330, cy = 250, r = 120, a = t * p.omega * .25; arc(c, cx, cy, r, 0, TAU, C.blue, 4); for (let k = 0; k < 10; k++) { const q = k * TAU / 10 + a; line(c, cx, cy, cx + r * Math.cos(q), cy + r * Math.sin(q), '#4d7388', 3); } dot(c, cx, cy, 12, C.white); dot(c, cx + r * Math.cos(a), cy + r * Math.sin(a), 8, C.gold, true); text(c, `KE = ${F(.5 * p.inertia * p.omega ** 2)} J`, 70, 110, C.white, 22); }
);

/* ===== Gravitation ===== */
add('gravity', 'weight-planets', 'Your weight across the Solar System', 'See how the same mass weighs differently on each world.', 'W = mg_world', 'Weight follows the local gravity; your mass never changes.', 'Compare the Moon with Jupiter for the same mass.',
  [R('mass', 'Your mass', 20, 120, 5, 60, 'kg')],
  p => [N('On Earth', `${F(p.mass * 9.8, 0)} N`), N('On the Moon', `${F(p.mass * 1.62, 0)} N`), N('On Jupiter', `${F(p.mass * 24.8, 0)} N`)],
  (c, p, t) => { bars(c, [['Moon (1.6)', p.mass * 1.62, C.blue], ['Earth (9.8)', p.mass * 9.8, C.mint], ['Mars (3.7)', p.mass * 3.7, C.gold], ['Jupiter (24.8)', p.mass * 24.8, C.purple]], 'N'); text(c, 'Same mass, different weight', 120, 108, C.muted, 16); }
);
add('gravity', 'orbital-energy', 'Energy of a circular orbit', 'Raise a satellite and split its energy into kinetic and potential parts.', 'E = −GMm/2r', 'A higher orbit has more total energy but a slower speed.', 'Raise the altitude and watch the total energy climb toward zero.',
  [R('altitude', 'Altitude', 200, 3000, 100, 800, 'km')],
  p => { const r = 6371 + p.altitude, mu = 3.986e5; return [N('Orbital speed', `${F(Math.sqrt(mu / r))} km/s`), N('Total energy /kg', `${F(-mu / (2 * r) * 1e6 / 1e6)} MJ/kg`)]; },
  (c, p, t) => { const r = 6371 + p.altitude, mu = 3.986e5, rad = 90 + (p.altitude - 200) / 25, cx = 330, cy = 250, a = t * .4; dot(c, cx, cy, 60, C.blue); arc(c, cx, cy, rad, 0, TAU, '#456679', 2); dot(c, cx + rad * Math.cos(a), cy + rad * Math.sin(a), 9, C.gold, true); text(c, `v = ${F(Math.sqrt(mu / r))} km/s`, 70, 110, C.white, 20); text(c, `altitude ${p.altitude} km`, 70, 142, C.mint, 15); }
);

/* ===== Mechanical properties of solids ===== */
add('hooke', 'stress-strain', 'Stress–strain curve', 'Load a wire and trace it through its elastic and plastic regions.', 'Y = stress / strain', 'The straight elastic region ends at the yield point, after which the wire deforms permanently.', 'Load just past the yield point and back off.',
  [R('load', 'Applied load', 0, 100, 2, 40, '%')],
  p => [N('Region', p.load < 55 ? 'Elastic' : p.load < 88 ? 'Plastic' : 'Near fracture'), N('Recoverable', p.load < 55 ? 'Yes' : 'No')],
  (c, p, t) => { const x0 = 110, y0 = 380, w = 480, h = 260; arrow(c, x0, y0, x0 + w + 10, y0, C.muted); arrow(c, x0, y0, x0, y0 - h - 12, C.muted); const pts = []; for (let i = 0; i <= 100; i++) { const s = i / 100; let str = s < .55 ? s * 1.4 : s < .88 ? .77 + (s - .55) * .55 : .95 - (s - .88) * .3; pts.push([x0 + s * w, y0 - clamp(str, 0, 1.05) * h]); } path(c, pts, C.mint, 3); const s = p.load / 100, xi = x0 + s * w; dot(c, xi, pts[Math.round(p.load)][1], 7, C.gold, true); line(c, x0 + .55 * w, y0, x0 + .55 * w, y0 - h, C.line, 1, [4, 4]); text(c, 'Yield', x0 + .55 * w + 6, 130, C.muted, 13); text(c, 'stress', x0 - 10, y0 - h - 4, C.mint, 14); text(c, 'strain', x0 + w, y0 + 22, C.muted, 14); }
);

/* ===== Fluids ===== */
add('buoyancy', 'hydraulic-lift', 'Hydraulic lift (Pascal)', 'Press a small piston and lift a big load on the wide piston.', 'F₂ = F₁·A₂/A₁', 'Pressure spreads equally, so a larger area multiplies the force.', 'Widen the output piston and lift a heavier load.',
  [R('force', 'Input force', 10, 200, 10, 60, 'N'), R('a1', 'Input area', 1, 10, 1, 2, 'cm²'), R('a2', 'Output area', 5, 60, 5, 30, 'cm²')],
  p => [N('Output force', `${F(p.force * p.a2 / p.a1)} N`), N('Pressure', `${F(p.force / (p.a1 / 1e4) / 1000, 1)} kPa`), N('Force gain', `${F(p.a2 / p.a1)}×`)],
  (c, p, t) => { const osc = Math.sin(t * 2) * 8; rr(c, 120, 300, 90, 80, '#153746', C.blue, 4); rr(c, 400, 260, 150, 120, '#153746', C.blue, 4); line(c, 210, 360, 400, 360, '#153746', 40); rr(c, 130, 300 + osc, 70, 20, C.gold); rr(c, 410, 260 - osc * p.a1 / p.a2, 130, 20, C.mint); arrow(c, 165, 290 + osc, 165, 260 + osc, C.gold, 3); arrow(c, 475, 250, 475, 210, C.mint, 4); text(c, `${p.force} N`, 130, 270, C.gold, 15); text(c, `${F(p.force * p.a2 / p.a1)} N`, 410, 190, C.mint, 18); }
);

/* ===== Thermal properties ===== */
add('expansion', 'specific-heat', 'Heating with specific heat', 'Add heat to a substance and compute its temperature rise.', 'Q = mcΔT', 'Water needs far more heat than metals for the same temperature rise.', 'Compare water with iron for the same heat input.',
  [R('mass', 'Mass', .1, 3, .1, 1, 'kg', 1), R('heat', 'Heat added', 1, 200, 5, 40, 'kJ'), S('mat', 'Material', 4186, [[4186, 'Water'], [900, 'Aluminium'], [385, 'Copper'], [450, 'Iron']])],
  p => { const dT = p.heat * 1000 / (p.mass * Number(p.mat)); return [N('Temperature rise', `${F(dT, 1)} °C`), N('Specific heat', `${p.mat} J/kg·K`)]; },
  (c, p, t) => { const dT = p.heat * 1000 / (p.mass * Number(p.mat)), h = clamp(dT, 0, 80); rr(c, 260, 150, 140, 220, '#142d40', C.line, 6); rr(c, 270, 360 - h * 2.4, 120, h * 2.4, C.red + '77', null, 3); for (let i = 0; i < 12; i++) dot(c, 285 + mod(i * 43 + t * dT, 100), 200 + mod(i * 57 + t * 40, 150), 2, C.gold); text(c, `ΔT = ${F(dT, 1)} °C`, 90, 110, C.white, 22); text(c, `${p.heat} kJ into ${p.mass} kg`, 90, 145, C.muted, 15); }
);

/* ===== Thermodynamics ===== */
add('thermo', 'first-law', 'First law of thermodynamics', 'Add heat and let the gas do work; track its internal energy.', 'ΔU = Q − W', 'Energy is conserved: heat in either warms the gas or is spent doing work.', 'Add heat while the gas does an equal amount of work — ΔU stays zero.',
  [R('heat', 'Heat added Q', -100, 200, 10, 120, 'J'), R('work', 'Work by gas W', -100, 200, 10, 40, 'J')],
  p => [N('Change in internal energy', `${p.heat - p.work} J`), N('Interpretation', (p.heat - p.work) > 0 ? 'Gas warms' : (p.heat - p.work) < 0 ? 'Gas cools' : 'No change')],
  (c, p, t) => { bars(c, [['Heat in Q', p.heat, C.red], ['Work by gas W', p.work, C.gold], ['ΔU = Q − W', p.heat - p.work, C.mint]], 'J'); text(c, 'Energy is conserved', 120, 108, C.muted, 16); }
);
add('thermo', 'engine-efficiency', 'Heat engine efficiency', 'Split the heat drawn from the hot reservoir into work and waste heat.', 'η = W/Q_h', 'Only part of the input heat becomes useful work; the rest is rejected.', 'Raise the efficiency and watch the wasted heat shrink.',
  [R('qh', 'Heat input', 100, 1000, 50, 500, 'J'), R('eff', 'Efficiency', 10, 70, 5, 35, '%')],
  p => [N('Useful work', `${F(p.qh * p.eff / 100, 0)} J`), N('Waste heat', `${F(p.qh * (1 - p.eff / 100), 0)} J`)],
  (c, p, t) => { const w = p.qh * p.eff / 100, waste = p.qh - w; rr(c, 90, 140, 150, 70, '#5a2a2a', C.red, 6); text(c, `Q_h ${p.qh} J`, 165, 175, C.white, 16, 'center'); rr(c, 320, 220, 120, 100, '#1e5a63', C.mint, 8); text(c, 'ENGINE', 380, 270, C.mint, 15, 'center'); rr(c, 500, 300, 150, 60, '#22303a', C.blue, 6); arrow(c, 240, 175, 320, 250, C.red, 4); arrow(c, 440, 250, 590, 250, C.gold, 5); arrow(c, 440, 300, 500, 330, C.blue, 4); text(c, `W ${F(w, 0)} J`, 470, 235, C.gold, 16); text(c, `waste ${F(waste, 0)} J`, 505, 345, C.blue, 14); }
);

/* ===== Kinetic theory ===== */
add('kinetic', 'gay-lussac', 'Pressure vs temperature', 'Heat a sealed rigid container and watch the pressure climb.', 'P/T = constant', 'At fixed volume, pressure is proportional to absolute temperature.', 'Double the absolute temperature and see the pressure double.',
  [R('temperature', 'Temperature', 100, 600, 10, 300, 'K'), R('p0', 'Pressure at 300 K', 50, 200, 10, 100, 'kPa')],
  p => [N('Pressure', `${F(p.p0 * p.temperature / 300, 0)} kPa`)],
  (c, p, t) => { chart(c, { fn: T => p.p0 * T / 300, xmax: 600, ymax: p.p0 * 2, xlabel: 'Temperature / K', ylabel: 'Pressure / kPa', marker: p.temperature }); text(c, 'Straight line through the origin', 110, 110, C.gold, 16); }
);

/* ===== Oscillations ===== */
add('pendulum', 'shm-phasors', 'Displacement, velocity, acceleration', 'Follow the three SHM curves and see how they line up in phase.', 'x=A cosωt; v=−Aω sinωt; a=−ω²x', 'Velocity leads displacement by a quarter cycle; acceleration is opposite to displacement.', 'Pause where velocity is zero and check the acceleration.',
  [R('amplitude', 'Amplitude', .2, 2, .1, 1, 'm', 1), R('period', 'Period', 1, 6, .5, 3, 's', 1)],
  (p, t) => { const w = TAU / p.period; return [N('x', `${F(p.amplitude * Math.cos(w * t))} m`), N('v', `${F(-p.amplitude * w * Math.sin(w * t))} m/s`), N('a', `${F(-p.amplitude * w * w * Math.cos(w * t))} m/s²`)]; },
  (c, p, t) => { const w = TAU / p.period, y0 = 250, h = 70; line(c, 80, y0, 610, y0, C.line, 1); for (const [fn, col, lab, sc] of [[q => Math.cos(w * q), C.mint, 'x', 1], [q => -Math.sin(w * q), C.gold, 'v', 1], [q => -Math.cos(w * q), C.blue, 'a', 1]]) { const pts = []; for (let i = 0; i <= 200; i++) { const q = t + i / 200 * 3 * p.period; pts.push([80 + i * 2.65, y0 - fn(q) * h]); } path(c, pts, col, 2.5); text(c, lab, 620, y0 - fn(t) * h, col, 15); } text(c, 'x mint · v gold · a blue', 90, 110, C.muted, 15); }
);
add('pendulum', 'shm-energy', 'Energy exchange in SHM', 'Watch kinetic and potential energy trade places as a mass oscillates.', 'E = ½kA² (constant)', 'Total energy stays constant while KE and PE swap twice each cycle.', 'Pause at the extreme — all the energy is potential there.',
  [R('k', 'Stiffness', 10, 80, 5, 30, 'N/m'), R('amplitude', 'Amplitude', .1, .6, .05, .3, 'm', 2), R('mass', 'Mass', .5, 3, .5, 1, 'kg', 1)],
  (p, t) => { const w = Math.sqrt(p.k / p.mass), E = .5 * p.k * p.amplitude ** 2, pe = E * Math.cos(w * t) ** 2; return [N('Total energy', `${F(E, 3)} J`), N('Potential', `${F(pe, 3)} J`), N('Kinetic', `${F(E - pe, 3)} J`)]; },
  (c, p, t) => { const w = Math.sqrt(p.k / p.mass), x = 330 + Math.cos(w * t) * p.amplitude * 300, E = .5 * p.k * p.amplitude ** 2, pe = E * Math.cos(w * t) ** 2; line(c, 60, 220, 610, 220, C.muted, 2); rr(c, x - 30, 195, 60, 50, '#245766', C.mint, 6); line(c, 330, 180, 330, 260, C.gold, 1, [4, 4]); rr(c, 150, 320, 350, 24, '#182d41', C.line); rr(c, 150, 320, 350 * pe / E, 24, C.blue, null); rr(c, 150 + 350 * pe / E, 320, 350 * (1 - pe / E), 24, C.gold, null); text(c, 'PE (blue) · KE (gold)', 150, 300, C.muted, 15); }
);

/* ===== Waves ===== */
add('wave', 'superposition', 'Superposition of two waves', 'Add two travelling waves and watch the resultant form.', 'y = y₁ + y₂', 'Where crests meet they reinforce; a crest over a trough cancels.', 'Shift the phase to 180° for cancellation.',
  [R('a1', 'Amplitude 1', .2, 2, .1, 1, '', 1), R('a2', 'Amplitude 2', .2, 2, .1, 1, '', 1), R('phase', 'Phase of wave 2', 0, 360, 10, 90, '°')],
  p => [N('Peak resultant', `${F(Math.hypot(p.a1 + p.a2 * Math.cos(p.phase * Math.PI / 180), p.a2 * Math.sin(p.phase * Math.PI / 180)))}`), N('Type', p.phase > 150 && p.phase < 210 ? 'Cancelling' : p.phase < 30 || p.phase > 330 ? 'Reinforcing' : 'Partial')],
  (c, p, t) => { const ph = p.phase * Math.PI / 180, y0 = 250; const w1 = [], w2 = [], sum = []; for (let i = 0; i <= 260; i++) { const x = i / 260 * 8 * Math.PI, X = 80 + i * 2, y1 = p.a1 * Math.sin(x - t * 2), y2 = p.a2 * Math.sin(x - t * 2 + ph); w1.push([X, y0 - 40 - y1 * 22]); w2.push([X, y0 + 40 - y2 * 22]); sum.push([X, y0 + 130 - (y1 + y2) * 22]); } path(c, w1, '#4d7388', 2); path(c, w2, '#4d7388', 2); path(c, sum, C.mint, 3); text(c, 'Resultant', 90, y0 + 160, C.mint, 15); text(c, 'Wave 1 & Wave 2', 90, 110, C.muted, 15); }
);
add('wave', 'sound-intensity', 'Sound intensity level', 'Move away from a source and watch the loudness fall.', 'L = 10 log(I/I₀)', 'Doubling the distance drops the intensity to a quarter (−6 dB).', 'Double the distance and read the drop in decibels.',
  [R('power', 'Source power', 0.001, 1, .001, .05, 'W', 3), R('distance', 'Distance', 1, 30, 1, 5, 'm')],
  p => { const I = p.power / (4 * Math.PI * p.distance ** 2), L = 10 * Math.log10(I / 1e-12); return [N('Intensity', `${I.toExponential(2)} W/m²`), N('Sound level', `${F(L, 1)} dB`)]; },
  (c, p, t) => { chart(c, { fn: d => 10 * Math.log10(p.power / (4 * Math.PI * d * d) / 1e-12), xmax: 30, ymax: 130, xlabel: 'Distance / m', ylabel: 'Level / dB', marker: p.distance }); dot(c, 90, 250, 9, C.gold, true); text(c, 'Inverse-square falloff', 110, 110, C.gold, 16); }
);

/* ===== Electric charges & fields ===== */
add('electrostatic', 'coulomb-distance', 'Coulomb force vs separation', 'Slide two charges apart and watch the force weaken.', 'F = kq₁q₂/r²', 'Doubling the distance quarters the force — an inverse-square law.', 'Halve the separation and see the force quadruple.',
  [R('q1', 'Charge 1', 1, 10, 1, 4, 'µC'), R('q2', 'Charge 2', 1, 10, 1, 3, 'µC'), R('r', 'Separation', 5, 60, 1, 20, 'cm')],
  p => [N('Force', `${F(8.988e9 * p.q1 * p.q2 * 1e-12 / (p.r / 100) ** 2)} N`)],
  (c, p, t) => { chart(c, { fn: r => 8.988e9 * p.q1 * p.q2 * 1e-12 / (r / 100) ** 2, xmax: 60, ymax: 8.988e9 * p.q1 * p.q2 * 1e-12 / .05 ** 2, xlabel: 'Separation / cm', ylabel: 'Force / N', marker: p.r }); text(c, 'F ∝ 1/r²', 110, 110, C.gold, 18); }
);

/* ===== Capacitance ===== */
add('capacitor', 'cap-energy', 'Energy stored in a capacitor', 'Charge a capacitor and read the energy versus voltage.', 'U = ½CV²', 'Stored energy grows with the square of the voltage.', 'Double the voltage — the stored energy becomes four times larger.',
  [R('cap', 'Capacitance', 1, 100, 1, 22, 'µF'), R('volt', 'Voltage', 1, 24, 1, 12, 'V')],
  p => [N('Stored energy', `${F(.5 * p.cap * 1e-6 * p.volt ** 2 * 1e3, 3)} mJ`), N('Charge', `${F(p.cap * p.volt, 0)} µC`)],
  (c, p, t) => { chart(c, { fn: v => .5 * p.cap * 1e-6 * v * v * 1e3, xmax: 24, ymax: .5 * p.cap * 1e-6 * 576 * 1e3, xlabel: 'Voltage / V', ylabel: 'Energy / mJ', marker: p.volt }); text(c, 'U ∝ V²', 110, 110, C.gold, 18); }
);

/* ===== Current electricity ===== */
add('circuit', 'power-vs-resistance', 'Power delivered vs resistance', 'Change the resistance and watch the power dissipated at fixed voltage.', 'P = V²/R', 'At a fixed voltage, a smaller resistance draws more current and more power.', 'Halve the resistance to double the power.',
  [R('volt', 'Voltage', 2, 24, 1, 12, 'V'), R('res', 'Resistance', 2, 50, 1, 10, 'Ω')],
  p => [N('Current', `${F(p.volt / p.res)} A`), N('Power', `${F(p.volt ** 2 / p.res, 1)} W`)],
  (c, p, t) => { chart(c, { fn: R => p.volt ** 2 / R, xmax: 50, ymax: p.volt ** 2 / 2, xlabel: 'Resistance / Ω', ylabel: 'Power / W', marker: p.res }); text(c, 'P = V²/R', 110, 110, C.gold, 18); }
);

/* ===== Magnetism ===== */
add('lorentz', 'force-on-wire', 'Force on a current-carrying wire', 'Pass a current through a wire in a field and measure the force.', 'F = BIL', 'The force is largest when the wire is perpendicular to the field.', 'Reverse the current to flip the force direction.',
  [R('field', 'Magnetic field', .1, 2, .1, .5, 'T', 1), R('current', 'Current', -10, 10, 1, 5, 'A'), R('length', 'Wire length', .1, 1, .1, .4, 'm', 1)],
  p => [N('Force', `${F(p.field * Math.abs(p.current) * p.length)} N`), N('Direction', p.current > 0 ? 'Up' : p.current < 0 ? 'Down' : 'None')],
  (c, p, t) => { for (let x = 120; x < 560; x += 45) for (let y = 150; y < 360; y += 45) text(c, '×', x, y, '#3b6782', 18); line(c, 330, 130, 330, 380, C.gold, 8); if (p.current) { for (let i = 0; i < 4; i++) dot(c, 330, 150 + mod(-t * p.current * 12 + i * 60, 220), 4, C.mint); const F0 = p.field * Math.abs(p.current) * p.length; arrow(c, 330, 255, 330 + Math.sign(p.current) * (60 + F0 * 40), 255, C.white, 4); } text(c, `F = ${F(p.field * Math.abs(p.current) * p.length)} N`, 90, 110, C.white, 20); text(c, 'B into page', 90, 380, C.blue, 15); }
);
add('lorentz', 'cyclotron-frequency', 'Cyclotron frequency', 'Change the field and see how fast a charged particle circles.', 'f = qB/(2πm)', 'The circulation frequency depends only on the field, not on the speed.', 'Double the field to double the frequency.',
  [R('field', 'Magnetic field', .1, 2, .1, .5, 'T', 1), S('particle', 'Particle', 'proton', [['proton', 'Proton'], ['electron', 'Electron']])],
  p => { const m = p.particle === 'electron' ? 9.109e-31 : 1.673e-27, f = 1.602e-19 * p.field / (TAU * m); return [N('Cyclotron frequency', `${(f / 1e6).toFixed(2)} MHz`), N('Period', `${(1e9 / f).toFixed(2)} ns`)]; },
  (c, p, t) => { const cx = 330, cy = 250, r = 110, spd = p.field * 2, a = t * spd; arc(c, cx, cy, r, 0, TAU, '#5c8b9d', 2); dot(c, cx + r * Math.cos(a), cy + r * Math.sin(a), 10, C.gold, true); for (let x = 120; x < 560; x += 50) for (let y = 150; y < 360; y += 50) dot(c, x, y, 1.5, C.blue); text(c, `f = ${(1.602e-19 * p.field / (TAU * (p.particle === 'electron' ? 9.109e-31 : 1.673e-27)) / 1e6).toFixed(2)} MHz`, 70, 110, C.white, 20); }
);

/* ===== Electromagnetic induction ===== */
add('induction', 'faraday-rate', 'Faraday: emf from changing flux', 'Change the flux quickly or slowly and read the induced emf.', 'ε = −N dΦ/dt', 'A faster flux change or more turns gives a larger induced emf.', 'Double the rate of change and compare the emf.',
  [R('turns', 'Coil turns', 10, 500, 10, 100), R('dflux', 'Flux change', .01, .5, .01, .1, 'Wb', 2), R('dt', 'Time taken', .05, 1, .05, .2, 's', 2)],
  p => [N('Induced emf', `${F(p.turns * p.dflux / p.dt, 1)} V`), N('Rate of change', `${F(p.dflux / p.dt, 2)} Wb/s`)],
  (c, p, t) => { for (let i = 0; i < 6; i++) { c.beginPath(); c.ellipse(300 + i * 16, 250, 20, 80, 0, 0, TAU); c.strokeStyle = C.gold; c.lineWidth = 3; c.stroke(); } const emf = p.turns * p.dflux / p.dt; dot(c, 480, 250, 22, Math.min(1, emf / 100) > .2 ? C.gold : '#3c4d55', emf > 20); line(c, 396, 250, 458, 250, C.blue, 3); text(c, `ε = ${F(emf, 1)} V`, 90, 110, C.white, 22); text(c, `${p.turns} turns`, 90, 145, C.mint, 15); }
);

/* ===== Alternating current ===== */
add('ac', 'reactance-frequency', 'Reactance versus frequency', 'Sweep the frequency and compare inductive and capacitive reactance.', 'X_L = 2πfL; X_C = 1/(2πfC)', 'Inductors block high frequencies; capacitors block low frequencies.', 'Find the frequency where the two reactances are equal.',
  [R('L', 'Inductance', 1, 100, 1, 40, 'mH'), R('C', 'Capacitance', 1, 100, 1, 40, 'µF'), R('freq', 'Frequency', 10, 500, 10, 120, 'Hz')],
  p => { const XL = TAU * p.freq * p.L / 1000, XC = 1 / (TAU * p.freq * p.C / 1e6); return [N('Inductive X_L', `${F(XL)} Ω`), N('Capacitive X_C', `${F(XC)} Ω`), N('Resonance', `${F(1 / (TAU * Math.sqrt(p.L / 1000 * p.C / 1e6)), 0)} Hz`)]; },
  (c, p, t) => { const x0 = 100, y0 = 380, w = 500, h = 270, ymax = 200; arrow(c, x0, y0, x0 + w + 10, y0, C.muted); arrow(c, x0, y0, x0, y0 - h - 12, C.muted); const L = p.L / 1000, Cc = p.C / 1e6; const pl = [], pc = []; for (let i = 1; i <= 200; i++) { const f = i / 200 * 500; pl.push([x0 + f / 500 * w, y0 - clamp(TAU * f * L / ymax, 0, 1.05) * h]); pc.push([x0 + f / 500 * w, y0 - clamp(1 / (TAU * f * Cc) / ymax, 0, 1.05) * h]); } path(c, pl, C.gold, 3); path(c, pc, C.blue, 3); text(c, 'X_L (gold) rises · X_C (blue) falls', 110, 110, C.muted, 15); const fx = x0 + p.freq / 500 * w; line(c, fx, y0, fx, y0 - h, C.mint, 1, [4, 4]); }
);

/* ===== EM waves ===== */
add('emwave', 'photon-energy', 'Photon energy across the spectrum', 'Pick a frequency and read the energy carried by each photon.', 'E = hf', 'Higher-frequency light carries more energy per photon.', 'Move from radio to X-rays and watch the energy soar.',
  [R('exponent', 'Frequency power of ten', 6, 20, 1, 14, 'log₁₀(Hz)')],
  p => { const f = 10 ** p.exponent, E = 6.626e-34 * f / 1.602e-19; return [N('Frequency', `${f.toExponential(1)} Hz`), N('Photon energy', `${E < 1 ? (E * 1000).toFixed(2) + ' meV' : E.toExponential(2) + ' eV'}`)]; },
  (c, p, t) => { chart(c, { fn: e => Math.log10(6.626e-34 * 10 ** e / 1.602e-19 + 1e-12), xmax: 20, ymax: 6, xlabel: 'log₁₀(frequency)', ylabel: 'log₁₀(E / eV)', marker: p.exponent }); text(c, 'E = hf', 110, 110, C.gold, 18); }
);

/* ===== Ray optics ===== */
add('lens', 'concave-mirror', 'Image in a concave mirror', 'Move an object in front of a concave mirror and locate its image.', '1/f = 1/v + 1/u', 'Beyond the centre of curvature the image is small and inverted; inside the focus it is virtual.', 'Move the object inside the focal length.',
  [R('u', 'Object distance', 5, 60, 1, 30, 'cm'), R('f', 'Focal length', 8, 30, 1, 15, 'cm')],
  p => { const v = p.u === p.f ? Infinity : 1 / (1 / p.f - 1 / p.u); return [N('Image distance', Number.isFinite(v) ? `${F(v, 1)} cm` : 'At infinity', ), N('Magnification', Number.isFinite(v) ? `${F(-v / p.u, 2)}×` : '∞'), N('Image', v > 0 ? 'Real, inverted' : 'Virtual, upright')]; },
  (c, p, t) => { const cx = 470, cy = 250, sc = 4, v = p.u === p.f ? 1e4 : 1 / (1 / p.f - 1 / p.u); line(c, 90, cy, 620, cy, '#608295', 2); c.beginPath(); c.arc(cx + 120, cy, 160, Math.PI - .7, Math.PI + .7); c.strokeStyle = C.blue; c.lineWidth = 3; c.stroke(); const ox = cx - p.u * sc; arrow(c, ox, cy, ox, cy - 60, C.gold, 3); for (const fx of [cx - p.f * sc]) { dot(c, fx, cy, 4, C.gold); text(c, 'F', fx, cy + 20, C.gold, 13, 'center'); } const ix = cx - v * sc; if (Number.isFinite(v) && Math.abs(v) < 200) arrow(c, ix, cy, ix, cy + 60 * (v > 0 ? 1 : -1) * (v / p.u), C.mint, 3); text(c, v > 0 ? 'Real image' : 'Virtual image', 90, 110, C.mint, 18); }
);

/* ===== Wave optics ===== */
add('doubleslit', 'fringe-width', 'Fringe width in Young’s experiment', 'Change the geometry and see the bright-fringe spacing respond.', 'β = λD/d', 'Wider slit separation squeezes the fringes closer together.', 'Halve the slit separation and watch the fringes spread.',
  [R('wavelength', 'Wavelength', 400, 700, 10, 550, 'nm'), R('slit', 'Slit separation', .1, 1, .05, .3, 'mm', 2), R('D', 'Screen distance', .5, 3, .1, 1.5, 'm', 1)],
  p => [N('Fringe width', `${F(p.wavelength * 1e-9 * p.D / (p.slit * 1e-3) * 1000, 2)} mm`)],
  (c, p, t) => { const beta = p.wavelength * 1e-9 * p.D / (p.slit * 1e-3) * 1000, sp = clamp(beta * 22, 8, 80); rr(c, 320, 120, 26, 260, '#243e50', C.blue, 4); for (let y = 125; y < 375; y += 2) { const I = Math.cos(Math.PI * (y - 250) / sp) ** 2; c.fillStyle = `rgba(255,195,107,${I})`; c.fillRect(324, y, 18, 2); } dot(c, 120, 250, 9, C.gold); for (let k = 0; k < 4; k++) { const r = mod(t * 60 + k * 40, 200); c.beginPath(); c.arc(120, 250, r + 1, -.5, .5); c.strokeStyle = '#ffc36b55'; c.stroke(); } text(c, `β = ${F(beta, 2)} mm`, 90, 110, C.white, 22); }
);

/* ===== Dual nature ===== */
add('photoelectric', 'stopping-potential', 'Stopping potential vs frequency', 'Shine different frequencies on a metal and read the stopping voltage.', 'eV₀ = hf − φ', 'Below the threshold frequency no electrons escape, whatever the intensity.', 'Change the metal and watch the threshold shift.',
  [R('freq', 'Light frequency', 4, 15, .5, 8, '×10¹⁴ Hz', 1), R('work', 'Work function', 1.5, 4.5, .1, 2.2, 'eV', 1)],
  p => { const E = 4.1357 * p.freq / 10, V0 = Math.max(0, E - p.work); return [N('Photon energy', `${F(E)} eV`), N('Stopping potential', `${F(V0)} V`), N('Emission', E >= p.work ? 'Yes' : 'No')]; },
  (c, p, t) => { const x0 = 110, y0 = 340, w = 480, h = 220, thr = p.work / .41357; arrow(c, x0, y0, x0 + w + 10, y0, C.muted); arrow(c, x0, y0 + 40, x0, y0 - h - 12, C.muted); const X = f => x0 + f / 15 * w, Y = V => y0 - V / 3 * h; path(c, [[X(thr), y0], [X(15), Y(4.1357 * 15 / 10 - p.work)]], C.mint, 3); dot(c, X(thr), y0, 6, C.gold); dot(c, X(p.freq), Y(Math.max(0, 4.1357 * p.freq / 10 - p.work)), 7, C.gold, true); text(c, 'V₀', x0 - 20, y0 - h, C.mint, 15); text(c, 'f', x0 + w, y0 + 22, C.muted, 15); text(c, `threshold ≈ ${F(thr)}×10¹⁴ Hz`, 130, 110, C.gold, 15); }
);

/* ===== Atoms ===== */
add('bohr', 'energy-levels', 'Hydrogen energy-level ladder', 'Pick a jump and calculate the photon it emits.', 'Eₙ = −13.6/n² eV', 'Jumps ending on n=2 make visible Balmer lines.', 'Compare a 3→2 and a 4→2 transition.',
  [R('ni', 'From level', 2, 6, 1, 3), R('nf', 'To level', 1, 5, 1, 2)],
  p => { const dE = 13.6 * (1 / p.nf ** 2 - 1 / p.ni ** 2); return [N('Photon energy', `${F(Math.abs(dE))} eV`), N('Wavelength', `${F(1240 / Math.abs(dE), 0)} nm`), N('Series', p.nf === 1 ? 'Lyman' : p.nf === 2 ? 'Balmer' : 'Infra-red')]; },
  (c, p, t) => { const map = n => 380 - 300 * (1 - 1 / n ** 2); for (let n = 1; n <= 6; n++) { const y = map(n), on = n === p.ni || n === p.nf; line(c, 150, y, 470, y, on ? C.mint : C.line, on ? 2.5 : 1.5); text(c, `n=${n}`, 490, y, C.muted, 13); } const yi = map(p.ni), yf = map(p.nf); if (p.ni > p.nf) { arrow(c, 300, yi, 300, yf, C.gold, 3); const q = mod(t, 3) / 3; dot(c, 300, yi + (yf - yi) * q, 6, C.gold, true); } text(c, `photon ${F(Math.abs(13.6 * (1 / p.nf ** 2 - 1 / p.ni ** 2)))} eV`, 90, 110, C.white, 20); }
);

/* ===== Nuclei ===== */
add('nuclear', 'binding-curve', 'Binding energy per nucleon', 'Slide across the mass number and read where nuclei are most stable.', 'Peak stability near A ≈ 56', 'Iron and nickel sit at the peak; both fusion and fission release energy toward it.', 'Compare a light nucleus with a very heavy one.',
  [R('A', 'Mass number', 2, 240, 1, 56)],
  p => { const be = 8.8 * (1 - Math.exp(-p.A / 20)) - p.A / 400 - (p.A < 20 ? (20 - p.A) * .08 : 0); return [N('Binding energy / nucleon', `${F(Math.max(0, be))} MeV`), N('Process toward stability', p.A < 56 ? 'Fusion releases energy' : 'Fission releases energy')]; },
  (c, p, t) => { chart(c, { fn: A => Math.max(0, 8.8 * (1 - Math.exp(-A / 20)) - A / 400 - (A < 20 ? (20 - A) * .08 : 0)), xmax: 240, ymax: 10, xlabel: 'Mass number A', ylabel: 'BE/A / MeV', marker: p.A }); text(c, 'Peak near A ≈ 56 (iron)', 110, 110, C.gold, 16); }
);

/* ===== Semiconductors ===== */
add('diode', 'iv-curve', 'Diode I–V characteristic', 'Sweep the voltage across a diode and trace its current.', 'I = I₀(e^(V/Vт) − 1)', 'Current rises sharply once forward voltage passes the knee; reverse current is tiny.', 'Move through the knee voltage around 0.7 V.',
  [R('voltage', 'Applied voltage', -1, 1, .02, .6, 'V', 2), R('knee', 'Knee voltage', .2, .8, .05, .7, 'V', 2)],
  p => { const I = p.voltage > 0 ? 5 * (Math.exp((p.voltage - p.knee) / .05) - 1) : -0.02; return [N('Current', `${p.voltage > p.knee ? F(Math.min(I, 200), 1) + ' mA' : p.voltage > 0 ? '≈ 0 mA' : '≈ −0.02 mA'}`), N('State', p.voltage > p.knee ? 'Conducting' : p.voltage < 0 ? 'Reverse blocked' : 'Below knee')]; },
  (c, p, t) => { const cx = 350, cy = 250, sx = 240, sy = 1; arrow(c, cx - sx, cy, cx + sx, cy, C.muted); arrow(c, cx, cy + 120, cx, cy - 200, C.muted); const pts = []; for (let v = -1; v <= 1; v += .01) { const I = v > 0 ? 5 * (Math.exp((v - p.knee) / .05) - 1) : -1.5; pts.push([cx + v * sx, cy - clamp(I, -3, 190) * sy]); } path(c, pts, C.mint, 3); const cv = p.voltage, ci = cv > 0 ? 5 * (Math.exp((cv - p.knee) / .05) - 1) : -1.5; dot(c, cx + cv * sx, cy - clamp(ci, -3, 190) * sy, 7, C.gold, true); text(c, 'V', cx + sx - 4, cy + 22, C.muted, 14); text(c, 'I', cx + 14, cy - 190, C.muted, 14); text(c, `knee ≈ ${F(p.knee, 2)} V`, 100, 110, C.gold, 16); }
);

/* ---- register ---- */
window.ExtraSimulations.push(...entries);
const previous = window.PhysicsDraw.draw, byId = new Map(entries.map(s => [s.id, s]));
window.PhysicsDraw.draw = (c, id, p, t) => { const s = byId.get(id); if (!s) return previous(c, id, p, t); window.PhysicaRenderExperiment(c, s, p, t, s.renderer); };
window.PhysicsDraw.available.push(...byId.keys());
})();
