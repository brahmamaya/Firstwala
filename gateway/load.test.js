// node gateway/load.test.js [students]   Spike test: everybody presses "start" together, then saves in batches and submits.
// The database is simulated (finite capacity, 15-40 ms per call, queueing), the gateway code is the real one.
import { handle } from './worker.js';
const N = Number(process.argv[2] || 5000), CAP = 150, SAVES = 6;
const env = { SUPABASE_URL: 'https://up.test', SUPABASE_ANON_KEY: 'a', GATEWAY_KEY: 'k', ALLOWED_ORIGINS: 'https://physica.in', MAX_INFLIGHT: '3000' };
let busy = 0; const q = [];
const upstream = async u => { if (busy >= CAP) await new Promise(r => q.push(r)); busy++; await new Promise(r => setTimeout(r, 15 + Math.random() * 25)); busy--; q.shift()?.(); return new Response('{}', { headers: { 'content-type': 'application/json' } }); };
const cache = (() => { const m = new Map(); return { match: async r => m.get(r.url)?.clone(), put: async (r, v) => { m.set(r.url, v); } }; })();
const lat = { crit: [], other: [] }, st = { crit: { ok: 0, bad: 0 }, other: { ok: 0, shed: 0, bad: 0 } };
async function call(ip, rpc, crit, tries = 12) {
  for (let i = 0; i < tries; i++) {
    const t = performance.now();
    const r = await handle(new Request('https://gw.test/rest/v1/rpc/' + rpc, { method: 'POST', headers: { origin: 'https://physica.in', 'content-type': 'application/json', authorization: 'Bearer j', 'cf-connecting-ip': ip }, body: '{}' }), env, { cache }, upstream);
    (crit ? lat.crit : lat.other).push(performance.now() - t);
    if (r.status === 200) { crit ? st.crit.ok++ : st.other.ok++; return true; }
    if (r.status === 503 || r.status === 429) { if (!crit) st.other.shed++; await new Promise(s => setTimeout(s, Math.min(2000, 100 * 2 ** i) * (0.5 + Math.random()))); continue; }
    crit ? st.crit.bad++ : st.other.bad++; return false;
  }
  crit ? st.crit.bad++ : st.other.bad++; return false;
}
async function student(i) {
  await new Promise(r => setTimeout(r, Math.random() * Number(process.env.RAMP_MS ?? 15000)));   // everybody presses start within 15 seconds of 9:00
  const ip = '10.' + (i % 250) + '.' + (i >> 8) + '.1';     // many students share an IP (coaching centres, hostels)
  await call(ip, 'get_status', false); await call(ip, 'list_tests', false); await call(ip, 'start_attempt', true); await call(ip, 'get_attempt', true);
  for (let s = 0; s < SAVES; s++) { await new Promise(r => setTimeout(r, Math.random() * 300)); await call(ip, 'save_state', true); if (s % 3 === 0) await call(ip, 'log_event', false); }
  await call(ip, 'submit_attempt', true); await call(ip, 'get_result', false);
}
const t0 = performance.now(); await Promise.all(Array.from({ length: N }, (_, i) => student(i)));
const p = (a, x) => a.slice().sort((m, n) => m - n)[Math.floor(a.length * x)] | 0;
console.log(`${N} students, simulated database capacity ${CAP} concurrent calls, ${((performance.now() - t0) / 1000).toFixed(1)} s`);
console.log(`critical (start/save/submit): ok ${st.crit.ok}, failed ${st.crit.bad}, p50 ${p(lat.crit, .5)} ms, p95 ${p(lat.crit, .95)} ms, p99 ${p(lat.crit, .99)} ms`);
console.log(`other (status/list/result/log): ok ${st.other.ok}, retried after shed ${st.other.shed}, failed ${st.other.bad}, p95 ${p(lat.other, .95)} ms`);
const pass = st.crit.bad === 0 && st.other.bad <= (st.crit.ok + st.other.ok) * 0.001;
console.log(pass ? `LOAD TEST PASS: every student finished; no save or submit was lost` : 'LOAD TEST FAIL'); process.exit(pass ? 0 : 1);
