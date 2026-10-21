// node gateway/worker.test.js  (Node 18+; no dependencies)
import { handle, take } from './worker.js';
let pass = 0, fail = 0;
const ok = (c, m) => { c ? pass++ : (fail++, console.log('FAIL', m)); };
const env = { SUPABASE_URL: 'https://up.test', SUPABASE_ANON_KEY: 'anon', GATEWAY_KEY: 'gk', ALLOWED_ORIGINS: 'https://physica.in', MAX_INFLIGHT: '10' };
const O = 'https://physica.in';
let calls = [], upstream = () => new Response('{"ok":1}', { status: 200, headers: { 'content-type': 'application/json' } });
const f = async (u, o) => { calls.push({ u, o }); return upstream(u, o); };
const store = new Map(); const cache = { match: async r => store.get(r.url)?.clone(), put: async (r, v) => { store.set(r.url, v); } };
let n = 0;
const rq = (path, o = {}) => handle(new Request('https://gw.test' + path, { method: 'POST', ...o, headers: { origin: O, 'content-type': 'application/json', authorization: 'Bearer jwt', 'cf-connecting-ip': '9.9.9.' + (o.ip || ++n), ...(o.headers || {}) }, body: o.method === 'GET' ? undefined : (o.body ?? '{}') }), env, { cache }, f);

let r = await rq('/rest/v1/rpc/list_tests');
ok(r.status === 200 && calls[0].u === 'https://up.test/rest/v1/rpc/list_tests', 'allowed rpc is forwarded');
ok(calls[0].o.headers.get('apikey') === 'anon' && calls[0].o.headers.get('x-gateway-key') === 'gk' && calls[0].o.headers.get('authorization') === 'Bearer jwt', 'keys added, user token passed through');
ok(r.headers.get('access-control-allow-origin') === O && r.headers.get('x-request-id') && r.headers.get('x-content-type-options') === 'nosniff', 'cors + security headers + request id');
for (const p of ['/rest/v1/profiles', '/rest/v1/attempts?select=*', '/rest/v1/rpc/ops_panic', '/rest/v1/rpc/admin_stats', '/rest/v1/', '/graphql/v1', '/realtime/v1/websocket', '/auth/v1/admin/users', '/storage/v1/object/list/q', '/storage/v1/object/public/private/x.webp', '/rest/v1/rpc/Save_State', '/rest/v1/rpc/save_state/../x']) {
  calls = []; r = await rq(p); ok(r.status === 404 && calls.length === 0, 'blocked: ' + p);
}
calls = []; r = await rq('/rest/v1/rpc/list_tests', { headers: { origin: 'https://evil.test' } });
ok(r.status === 403 && !r.headers.get('access-control-allow-origin') && calls.length === 0, 'foreign origin rejected, no CORS header');
r = await rq('/rest/v1/rpc/list_tests', { headers: { origin: '' } }); ok(r.status === 403, 'missing origin rejected for rpc');
r = await handle(new Request('https://gw.test/rest/v1/rpc/list_tests', { method: 'OPTIONS', headers: { origin: O } }), env, {}, f); ok(r.status === 204 && r.headers.get('access-control-max-age') === '86400', 'preflight cached 24h');
r = await handle(new Request('https://gw.test/rest/v1/rpc/list_tests', { method: 'OPTIONS', headers: { origin: 'https://evil.test' } }), env, {}, f); ok(r.status === 403, 'preflight from foreign origin refused');
r = await rq('/rest/v1/rpc/list_tests', { headers: { 'content-type': 'text/plain' } }); ok(r.status === 415, 'wrong content type');
r = await rq('/rest/v1/rpc/list_tests', { body: '{bad' }); ok(r.status === 400, 'bad json');
r = await rq('/rest/v1/rpc/list_tests', { body: '[1]' }); ok(r.status === 200 || r.status === 400, 'array body handled');
r = await rq('/rest/v1/rpc/list_tests', { body: '"x"' }); ok(r.status === 400, 'scalar body refused');
r = await rq('/rest/v1/rpc/list_tests', { body: JSON.stringify({ a: 'x'.repeat(9000) }) }); ok(r.status === 413, 'oversize body');
r = await rq('/rest/v1/rpc/save_state', { body: JSON.stringify({ a: 'x'.repeat(9000) }) }); ok(r.status === 200, 'save_state may be larger');
r = await rq('/rest/v1/rpc/list_tests', { headers: { authorization: '' } }); ok(r.status === 401, 'no token, no private rpc');
calls = []; r = await rq('/rest/v1/rpc/track', { headers: { authorization: '' } }); ok(r.status === 200, 'anonymous counters need no token');
r = await rq('/auth/v1/token?grant_type=refresh_token', { headers: { authorization: '' }, body: '{"refresh_token":"x"}' }); ok(r.status === 200, 'refresh token call allowed');
// otp limit
let codes = []; for (let i = 0; i < 7; i++) codes.push((await rq('/auth/v1/otp', { ip: 'otp1', headers: { authorization: '' }, body: '{"email":"a@b.c"}' })).status);
ok(codes.slice(0, 5).every(c => c === 200) && codes[5] === 429 && codes[6] === 429, 'login e-mail limited to 5 / 10 min per IP: ' + codes);
// cache
store.clear(); calls = [];
await rq('/rest/v1/rpc/get_status', { body: '{}' }); r = await rq('/rest/v1/rpc/get_status', { body: '{}' });
ok(calls.length === 1 && r.headers.get('x-cache') === 'hit', 'get_status served from edge cache the second time');
calls = []; await rq('/rest/v1/rpc/list_tests'); await rq('/rest/v1/rpc/list_tests', { ip: 'zz' }); ok(calls.length === 2, 'per-user data is never cached');
calls = []; r = await rq('/storage/v1/object/public/q/abc_1-2.webp', { method: 'GET', headers: { origin: '' } });
ok(r.status === 200 && /immutable/.test(r.headers.get('cache-control')), 'question images: long immutable cache, no origin needed');
// errors hidden
upstream = () => new Response('secret db error: password=hunter2', { status: 500 });
r = await rq('/rest/v1/rpc/save_state'); const t = await r.text(); ok(r.status === 502 && !/hunter2|secret/.test(t), 'upstream error text never forwarded');
calls = []; r = await rq('/rest/v1/rpc/list_tests'); ok(calls.length === 2, 'read retried once'); calls = []; await rq('/rest/v1/rpc/submit_attempt'); ok(calls.length === 1, 'submit never retried');
upstream = () => { throw new Error('boom'); }; r = await rq('/rest/v1/rpc/submit_attempt'); ok(r.status === 504, 'timeout/network -> 504');
upstream = () => new Response('{"code":"x"}', { status: 400, headers: { 'content-type': 'application/json' } }); r = await rq('/rest/v1/rpc/get_attempt'); ok(r.status === 400, 'client errors pass through so the app can explain them');
// shedding
let release; const gate = new Promise(res => release = res); upstream = async () => { await gate; return new Response('{}', { headers: { 'content-type': 'application/json' } }); };
const slow = []; for (let i = 0; i < 9; i++) slow.push(rq('/rest/v1/rpc/save_state'));
await new Promise(s => setTimeout(s, 20));
const low = await rq('/rest/v1/rpc/get_status', { body: '{"x":1}' }); const mid = await rq('/rest/v1/rpc/get_result'); const crit = rq('/rest/v1/rpc/submit_attempt');
ok(low.status === 503 && !!low.headers.get('retry-after'), 'busy: low-priority call shed first (9/10 in flight)');
ok(mid.status === 503, 'busy: mid-priority shed above 80%');
release(); const done = await Promise.all([...slow, crit]); ok(done.every(x => x.status === 200), 'critical saves/submits are never shed');
upstream = () => new Response('{}', { headers: { 'content-type': 'application/json' } });
r = await handle(new Request('https://gw.test/rest/v1/rpc/list_tests', { method: 'POST', headers: { origin: O, 'content-type': 'application/json', authorization: 'Bearer j' }, body: '{}' }), { ...env, GATEWAY_OFF: '1' }, {}, f); ok(r.status === 503, 'kill switch');
ok(take('k', 2, 1000, 0) && take('k', 2, 1000, 1) && !take('k', 2, 1000, 2) && take('k', 2, 1000, 1001), 'token window resets');
console.log(`gateway tests: ${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
