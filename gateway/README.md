# Physica API gateway

A small Cloudflare Worker that sits between the browser and Supabase. The browser never talks to Supabase once the gateway is on.

## What it does
| Job | How |
|---|---|
| Only known calls get through | allow-list of 16 database functions + email-code login + question images. Table access, OpenAPI, GraphQL, realtime, admin and storage listing all get `404`. |
| Only our website may call it | strict CORS (`ALLOWED_ORIGINS`), preflight answers cached 24 h |
| Bad input stopped early | JSON only, size limits (64 KB for `save_state`, 8 KB others), logged-in token required for private calls |
| Database protected from spikes | per-IP rate limits (login e-mail: 5 per 10 min), load shedding by priority (counters first, then lists, never saves/submits) |
| Less work for the database | `get_status` cached 20 s at the edge, question images cached 1 year, safe reads retried once |
| Nothing leaks | upstream errors are replaced by a generic message; security headers + `x-request-id` on every answer |
| Direct access closed | when enabled, Postgres refuses student calls that do not carry the secret `x-gateway-key` (only a hash is stored) |
| Kill switch | `GATEWAY_OFF=1` returns a polite 503 |

Real security still lives in the database (RLS, exam rules, timers). The gateway is an extra wall and a shock absorber.

## Turn it on (one time, about 15 minutes)
1. `npm i -g wrangler` and `wrangler login` (Cloudflare account; free plan is enough to start).
2. In `gateway/`: `wrangler secret put SUPABASE_ANON_KEY` (the publishable key) and `wrangler secret put GATEWAY_KEY` (a random string of 32+ characters, e.g. `openssl rand -base64 32`).
3. Edit `ALLOWED_ORIGINS` in `wrangler.toml` if your site address differs, then `wrangler deploy`. Attach a custom domain such as `api.physica.in` in the Cloudflare dashboard.
4. Test: `curl -i -X POST https://api.physica.in/rest/v1/rpc/get_status -H "Origin: https://physica.in" -H "Content-Type: application/json" -d '{}'` → `200`.
5. In `series.js` set `GW = 'https://api.physica.in'`, and in `index.html` + `_headers` add that address to `connect-src` and `img-src`. Rebuild and publish.
6. Finally lock the back door: in the Supabase SQL editor run `select private.ops_set_gateway_key('<the same GATEWAY_KEY>');`
   Switch off again with `select private.ops_set_gateway_key(null);` if the gateway ever has to be bypassed.

Run `node gateway/worker.test.js` after any change (also runs in CI).
