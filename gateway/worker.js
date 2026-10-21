/* Physica API gateway (Cloudflare Worker). The browser talks ONLY to this; it talks to Supabase.
   It lets through a short allow-list of calls, checks size/type/origin, caches what is safe, protects the database
   from spikes (rate limits + shedding the least important calls first) and hides every Supabase detail.
   Real security stays in the database (RLS, SECURITY DEFINER RPCs); the gateway is an extra wall, not the only one. */

const RPC = {                      // name -> [priority (1 = never shed, 3 = first to go), retry-safe read]
  save_state: [1, 0], submit_attempt: [1, 0], start_attempt: [1, 0], get_attempt: [1, 1], log_event: [3, 0],
  list_tests: [2, 1], get_result: [2, 1], get_review: [2, 1], get_status: [3, 1], get_my_profile: [2, 1], save_profile: [2, 0],
  note_device: [3, 0], list_devices: [2, 1], export_my_data: [2, 0], delete_my_account: [2, 0], track: [3, 0]
};
const AUTH = { 'POST /auth/v1/otp': 1, 'POST /auth/v1/verify': 1, 'POST /auth/v1/token': 1, 'POST /auth/v1/logout': 2, 'GET /auth/v1/user': 2 };
const MAX_BODY = { save_state: 65536, default: 8192 };
const SEC = { 'x-content-type-options': 'nosniff', 'referrer-policy': 'no-referrer', 'cross-origin-resource-policy': 'cross-origin',
  'strict-transport-security': 'max-age=63072000; includeSubDomains; preload', 'cache-control': 'no-store' };

const buckets = new Map();           // per-isolate, best effort; the database has its own authoritative limits
let inflight = 0;

export function take(key, limit, perMs, now = Date.now()) {
  let b = buckets.get(key);
  if (!b || now - b.t >= perMs) { b = { t: now, n: 0 }; buckets.set(key, b); if (buckets.size > 20000) buckets.clear(); }
  return ++b.n <= limit;
}

const json = (status, body, extra = {}) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', ...SEC, ...extra } });

export async function handle(req, env, ctx = {}, fetchImpl = fetch) {
  const url = new URL(req.url), rid = crypto.randomUUID();
  const origins = String(env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
  const origin = req.headers.get('origin') || '';
  const okOrigin = origins.includes(origin);
  const cors = okOrigin ? { 'access-control-allow-origin': origin, vary: 'Origin', 'access-control-expose-headers': 'x-request-id, retry-after' } : { vary: 'Origin' };
  const out = (status, body, extra) => json(status, body, { ...cors, 'x-request-id': rid, ...extra });

  if (req.method === 'OPTIONS') {
    if (!okOrigin) return new Response(null, { status: 403, headers: SEC });
    return new Response(null, { status: 204, headers: { ...SEC, ...cors, 'access-control-allow-methods': 'GET, POST', 'access-control-allow-headers': 'authorization, content-type, x-client-info', 'access-control-max-age': '86400' } });
  }
  if (env.GATEWAY_OFF === '1') return out(503, { error: 'maintenance' }, { 'retry-after': '120' });

  const path = url.pathname, ip = req.headers.get('cf-connecting-ip') || 'x';
  let kind, name = '', prio = 2, readOnly = false, cacheable = false;
  const rpc = path.match(/^\/rest\/v1\/rpc\/([a-z_]{1,40})$/);
  if (rpc && req.method === 'POST' && RPC[rpc[1]]) { kind = 'rpc'; name = rpc[1]; [prio, readOnly] = RPC[name]; cacheable = name === 'get_status'; }
  else if (AUTH[req.method + ' ' + path]) { kind = 'auth'; name = path.split('/').pop(); prio = AUTH[req.method + ' ' + path]; }
  else if (req.method === 'GET' && /^\/storage\/v1\/object\/public\/q\/[A-Za-z0-9_-]{1,64}\.webp$/.test(path)) { kind = 'img'; prio = 3; readOnly = true; }
  else return out(404, { error: 'not_found' });

  if (!okOrigin && kind !== 'img') return out(403, { error: 'origin' });

  let body = null;
  if (req.method === 'POST') {
    if (!/^application\/json/i.test(req.headers.get('content-type') || '')) return out(415, { error: 'content_type' });
    const max = MAX_BODY[name] || MAX_BODY.default;
    if (Number(req.headers.get('content-length') || 0) > max) return out(413, { error: 'too_large' });
    body = await req.text();
    if (body.length > max) return out(413, { error: 'too_large' });
    try { const j = JSON.parse(body || '{}'); if (j === null || typeof j !== 'object') throw 0; } catch { return out(400, { error: 'bad_json' }); }
  }
  if (kind === 'rpc' && name !== 'track' && name !== 'get_status' && !(req.headers.get('authorization') || '').startsWith('Bearer ')) return out(401, { error: 'auth' });

  /* rate limits: generous for exam traffic (batched saves), strict for login e-mails, which cost money and can be abused */
  const lim = kind === 'auth' && name === 'otp' ? [5, 600000] : kind === 'auth' ? [30, 60000] : prio === 1 ? [1500, 60000] : [120, 60000];
  if (!take(`${ip}|${kind}|${name}`, lim[0], lim[1])) return out(429, { error: 'rate_limited' }, { 'retry-after': '30' });

  /* load shedding: when this isolate is busy, drop the least important calls first. Saves/submits are never shed. */
  const cap = Number(env.MAX_INFLIGHT || 400);
  if (prio === 3 && inflight > cap * 0.5 || prio === 2 && inflight > cap * 0.8 || inflight > cap * 2) return out(503, { error: 'busy' }, { 'retry-after': String(5 + Math.floor(Math.random() * 10)) });

  const cache = ctx.cache || (typeof caches !== 'undefined' ? caches.default : null);
  const ck = cacheable || kind === 'img' ? new Request(`https://cache.invalid${path}${kind === 'img' ? '' : '?' + (body || '')}`) : null;
  if (ck && cache) { const hit = await cache.match(ck); if (hit) { const r = new Response(hit.body, hit); for (const [k, v] of Object.entries({ ...cors, 'x-request-id': rid, 'x-cache': 'hit' })) r.headers.set(k, v); return r; } }

  const headers = new Headers({ apikey: env.SUPABASE_ANON_KEY, 'x-gateway-key': env.GATEWAY_KEY || '', accept: 'application/json' });
  const a = req.headers.get('authorization'); if (a) headers.set('authorization', a); else if (kind !== 'img') headers.set('authorization', 'Bearer ' + env.SUPABASE_ANON_KEY);
  if (body !== null) headers.set('content-type', 'application/json');
  const target = env.SUPABASE_URL + path + url.search;

  inflight++;
  let res;
  try {
    for (let i = 0; ; i++) {
      const ac = new AbortController(), to = setTimeout(() => ac.abort(), kind === 'img' ? 8000 : 9000);
      try { res = await fetchImpl(target, { method: req.method, headers, body, signal: ac.signal, redirect: 'manual' }); clearTimeout(to); }
      catch (e) { clearTimeout(to); if (i === 0 && readOnly) continue; return out(504, { error: 'upstream_timeout' }, { 'retry-after': '3' }); }
      if (res.status >= 500 && i === 0 && readOnly) continue;
      break;
    }
  } finally { inflight--; }

  const h = { ...SEC, ...cors, 'x-request-id': rid, 'content-type': res.headers.get('content-type') || 'application/json' };
  if (res.status >= 500) return out(502, { error: 'upstream' }, { 'retry-after': '5' });   // never forward upstream error text
  if (kind === 'img' && res.ok) h['cache-control'] = 'public, max-age=31536000, immutable';
  else if (cacheable && res.ok) h['cache-control'] = 'public, max-age=20';
  if (res.status === 429) h['retry-after'] = res.headers.get('retry-after') || '10';
  const r = new Response(res.body, { status: res.status, headers: h });
  if (ck && cache && res.ok) { const c = r.clone(); const put = cache.put(ck, c); if (ctx.waitUntil) ctx.waitUntil(put); }
  return r;
}

export default { fetch: (req, env, ctx) => handle(req, env, ctx) };
