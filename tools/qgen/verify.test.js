/* Proves the verifier catches errors: deliberately broken templates and tampered records must fail with the right code. */
'use strict';
const assert = require('assert');
const { generate } = require('./lib');
const { verifyChapter } = require('./verify');

const good = {
  id: 't-good', tp: 'pke', st: 'Equations of motion', diff: 1, type: ['mcq', 'numeric'], n: 30,
  gen: r => ({ u: r.int(1, 20), a: r.int(2, 9), t: r.int(2, 12) }),
  make: p => ({ q: `A car at ${p.u} m/s speeds up at ${p.a} m/s² for ${p.t} s. Find its final speed.`, ans: p.u + p.a * p.t, unit: 'm/s',
    steps: ['Use v = u + at.', `v = ${p.u} + ${p.a} × ${p.t}`, `v = ${p.u + p.a * p.t} m/s`],
    wrong: [[p.u - p.a * p.t, 'sign error'], [p.a * p.t, 'forgot u'], [p.u + p.a * p.t * p.t, 't squared'], [(p.u + p.a) * p.t, 'multiplied (u + a) by t']] }),
  check: p => Math.sqrt(p.u * p.u + 2 * p.a * (p.u * p.t + 0.5 * p.a * p.t * p.t)),
};
const mk = over => Object.assign({}, good, { id: 't-bad' }, over);
const chapter = ts => ({ topics: { pke: 'x' }, templates: ts });
const codes = (ts, mutate) => { const ch = chapter(ts); const recs = generate(ch, 'test'); if (mutate) mutate(recs); return new Set(verifyChapter(ch, recs).map(e => e.code)); };
let n = 0; const ok = (name, cond) => { n++; assert(cond, 'FAILED: ' + name); console.log('ok  ' + name); };

ok('a correct template passes', codes([good]).size === 0);
ok('solve and check disagree (answer off by 10%)', codes([mk({ check: p => 1.1 * (p.u + p.a * p.t) })]).has('solve-check-mismatch'));
ok('wrong formula in solve (forgot u)', codes([mk({ make: p => Object.assign(good.make(p), { ans: p.a * p.t }) })]).has('solve-check-mismatch'));
ok('negative time is rejected', codes([mk({ make: p => Object.assign(good.make(p), { ans: -(p.u + p.a * p.t) }), check: p => -(p.u + p.a * p.t) })]).has('not-physical'));
ok('NaN answer is rejected', codes([mk({ make: p => Object.assign(good.make(p), { ans: NaN }) })]).has('not-finite'));
ok('Infinity check value is rejected', codes([mk({ check: () => Infinity })]).has('not-finite'));
ok('unresolved placeholder in text', codes([mk({ make: p => Object.assign(good.make(p), { q: `A car at ${p.u} m/s for ${undefined} s, find the speed of the car.` }) })]).has('placeholder'));
ok('template that throws', codes([mk({ make: () => { throw new Error('boom'); } })]).has('template-error'));
ok('same question text for different params (duplicate)', codes([mk({ make: p => Object.assign(good.make(p), { q: 'A car speeds up. Find its final speed after some time.' }) })]).has('dup-question'));
ok('solution too long', codes([mk({ make: p => Object.assign(good.make(p), { steps: Array(12).fill('line of working here') }) })]).has('solution-length'));
ok('solution too short', codes([mk({ make: p => Object.assign(good.make(p), { steps: ['v = 1'] }) })]).has('solution-length'));
ok('bad difficulty / type / topic', ['bad-difficulty', 'bad-type', 'bad-topic'].every(c => codes([mk({ diff: 5 }), mk({ id: 't-b2', type: 'essay' }), mk({ id: 't-b3', tp: 'zzz' })]).has(c)));
ok('distractors that are not named mistakes', codes([mk({ make: p => Object.assign(good.make(p), { wrong: good.make(p).wrong.map(w => [w[0], '']) }) })]).has('no-mistake-reasons'));
ok('too few distinct distractors: no question produced', codes([mk({ make: p => Object.assign(good.make(p), { wrong: [[p.u - p.a * p.t, 'a']] }), type: 'mcq' })]).has('template-error'));
// tampered records (what a bug in the writer would produce)
const tamper = fn => codes([good], recs => fn(recs.find(r => r.out.o)));
ok('marked option is not the correct one', tamper(r => { r.out.c = (r.out.c + 1) % 4; }).has('wrong-key'));
ok('correct option missing', tamper(r => { r.out.o[r.out.c] = r.out.o[(r.out.c + 1) % 4]; r.out.o[(r.out.c + 2) % 4] = '999999 m/s'; }).has('dup-options'));
ok('two options equal to the correct value', tamper(r => { const j = (r.out.c + 1) % 4; r.out.o[j] = r.out.o[r.out.c]; }).has('dup-options'));
ok('options equal as numbers but written differently', tamper(r => { const j = (r.out.c + 1) % 4; r.out.o[j] = r.out.o[r.out.c].replace(/^(\d+)/, '$1.0'); }).has('dup-options'));
ok('option with NaN text', tamper(r => { r.out.o[(r.out.c + 1) % 4] = 'NaN m/s'; }).has('placeholder'));
ok('numeric answer stored wrongly', codes([good], recs => { const r = recs.find(x => x.out.n != null); r.out.n += 5; }).has('wrong-key'));
ok('key collision', codes([good], recs => { recs[1].out.k = recs[0].out.k; }).has('dup-key'));
console.log(`verify.test: ${n} checks passed`);
