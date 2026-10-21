# Keeping private files private

The GitHub repository `brahmamaya/Firstwala` is **public**, and so is everything on the live site. So:

| Material | Where it lives | Never |
|---|---|---|
| Question papers, solutions, answer keys | your own computer / a **private** repo, imported into Supabase with `tools/series-import.js` (they then sit behind login in Postgres, answers only visible after submit) | in this repo, in `content/` or `build/` (git-ignored and blocked by `tools/private-guard.js`) |
| Generated import SQL | `build/` (git-ignored) | committed |
| Supabase `service_role` / secret key, Cloudflare token, `GATEWAY_KEY` | Cloudflare/Supabase secret stores or a password manager | any file in the repo (`tools/secret-guard.js` blocks the build) |
| `.env`, `.dev.vars`, `*.key`, `*.pem` | local only | committed |

Automatic guards: `.gitignore`; `tools/secret-guard.js` (keys/tokens); `tools/private-guard.js` (tracked private paths, large data files, anything outside the public whitelist in `_site`); `tools/publish.js` whitelist (only `*.min.js`, HTML, fonts, icons go online); `tools/lockdown.js` 404 rules; the watchdog checks every 15 min that `supabase/`, `gateway/`, `content/`, `.env`, `.git` are not readable on the live site.

If something private was ever committed, deleting it is **not enough**: rotate the secret (or treat the paper as leaked) and then clean the history.
