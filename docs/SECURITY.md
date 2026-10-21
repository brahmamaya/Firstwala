# Physica Test Series: security & compliance notes

Honest status: nothing connected to the internet is "unhackable". This system is built so that the *common and the clever*
attacks fail, one mistake does not expose everything, and what is left over is written down below. Re-run the tests after every change.

## 1. What we protect
| Asset | Why it matters |
|---|---|
| Question bank, answers, solutions | The product. A leak ends its value. |
| Student data: email, name, under-18 flag, parent email, results | Personal data of mostly minors: DPDP Act 2023 (fines up to ₹200 crore for children's-data breaches). |
| Result integrity (timer, scores) | Students must trust the rank. |
| Availability during a test | A crash at test time is a business event. |
| Admin accounts | Whoever controls them controls everything above. |

## 2. Architecture in one picture
```
Browser (static site, strict CSP, no 3rd-party scripts in Test Series)
   │  HTTPS + publishable key only
   ▼
Supabase (Mumbai): Auth (email code)  ──►  PostgREST ──► RPC functions ──► tables (RLS on, no direct student access)
                                                          └─ private schema (helpers, rate limits)  [not exposed]
```
There is no application server of ours to patch: all logic runs inside Postgres (`supabase/schema.sql`).

## 3. Threats and controls
| # | Threat | Controls in place | Test that proves it | Residual risk |
|---|---|---|---|---|
| 1 | Student reads answers/solutions early | Keys in a separate table with no student access; `get_attempt` never returns them; solutions only after submit | suite D, stress M (1500 hostile calls, 0 leaks) | A student can photograph the screen. Watermark + integrity log make it traceable, not impossible. |
| 2 | Student edits timer / score / deadline | Deadline set in DB; all writes via RPC; direct UPDATE denied | suite B, D | none known |
| 3 | IDOR: open or change someone else's attempt | Every RPC filters on `auth.uid()`; other users' rows invisible | suite D (IDOR block) | none known |
| 4 | Privilege escalation to admin | `role` not writable by users; `is_admin()` needs MFA (aal2) | suite B, G | Admin's phone/TOTP compromise |
| 5 | SQL injection | No dynamic SQL; parameters only; strict per-type input validation | suite D (payloads), stress M | none known |
| 6 | Race conditions (double submit, save-vs-submit) | Row locks (`FOR UPDATE` / `FOR SHARE`), idempotent finalize | stress L (incl. mutant-checked lock race) | none known |
| 7 | Stored/DOM XSS via question content | DOM built with `textContent`; no `innerHTML`; CSP `script-src 'self'` | e2e §4 | If someone later adds `innerHTML`, tests fail |
| 8 | Token theft | Token lives in the tab only (`sessionStorage`) unless "Keep me signed in"; CSP blocks injected scripts; "log out everywhere" | e2e §2, §5 | A successful XSS could still read the token. Keep CSP strict and dependencies at zero. |
| 9 | Account takeover | Email one-time code (no passwords to phish/stuff); Supabase auth rate limits | n/a (provider) | If a student's email is hacked, the account is. |
| 10 | Brute force / abuse / cost attacks | DB rate limits per user; Supabase limits; payload size caps | suite I, stress L3 | Large botnet DDoS: put Cloudflare in front |
| 11 | Insider / leaked admin credentials | MFA-gated admin, audit log of all content edits, least privilege | suite G | Owner of the Supabase project is all-powerful: use 2FA + a hardware key |
| 12 | Accidental exposure of a new table/function | Default privileges revoked; every table RLS-on (catalog test); definer functions pin `search_path` (catalog test) | suite A | none: a new unsafe object fails CI |
| 13 | Secrets in git | `tools/secret-guard.js` (also blocks Supabase secret / service_role keys); `.gitignore` | CI | n/a |
| 14 | Children's data / consent | Under-18 flag, parent contact + consent timestamp recorded server-side; no analytics; GA opt-in 18+ only | suite C, e2e §1, §6 | **Consent is not yet independently verified** (see §5) |
| 16 | Unauthorised login / forced login / stolen session | Email-code login (no passwords to stuff), auth rate limits, new-device alerts + audit, "log out everywhere", per-account **lock** and global **panic** that act within seconds (even before the JWT expires), idle logout, tab-scoped tokens | suite M, e2e §10 | Email account compromise is outside our control (students are told to secure it) |
| 17 | Site defaced / malicious script injected via hosting or pipeline | Strict CSP, watchdog compares every live file to the published build every 30 min, alert issue + email, exposed-file checks, branch protection (owner step) | `tools/watchdog.test.js` | Detection is within 30 min, not instant |
| 18 | Operator mistakes / slow response | Runbook `docs/INCIDENT-RESPONSE.md`, one-line SQL tools, drills, DoD checklist | n/a | The human in the loop |
| 15 | Data-subject rights | `export_my_data`, `delete_my_account`, inactive-account purge, audit purge | suite J, K | Backups keep deleted data for the provider's backup window |

## 3b. Visitor statistics without tracking people
The owner still sees how many visits there are and which simulations are opened, with no personal data:
- The page sends only `{event: visit|view, key: simulation-slug}` to `public.track` (no cookie, no id, no referrer, skipped on Do-Not-Track / GPC).
- The database keeps one counter per `(day, event, key)` in `analytics_daily`. There is no per-visitor row, so nobody can be identified or followed. This is why it is safe to run for children's visits too.
- A "visit" = one browser-tab session, not one person (counting people exactly would need an identifier; we chose privacy over precision).
- Read it (admin with MFA, in the Supabase SQL editor or via the `admin_stats(days)` RPC):
```sql
select day, n as visits from public.analytics_daily where event='visit' and key='' order by day desc limit 30;
select key as simulation, sum(n) as views from public.analytics_daily where event='view' and day > current_date - 30 group by key order by views desc limit 20;
```
- Google Analytics stays available but is **off unless an 18+ visitor opts in**. You can delete it completely if you prefer one system.

## 4. How to run every test (do this before each release)
```bash
bash supabase/tests/run-local.sh                       # ~120 assertions on a throwaway Postgres
bash supabase/tests/stress/run.sh                      # concurrency, lock race, 1500-call fuzz (npm i inside stress/ once)
node tools/watchdog.test.js && node tools/perf-budget.js
(cd supabase/tests/e2e && npm i && bash db.sh && node e2e.js)   # browser: login, exam, XSS, axe accessibility, incidents, slow-4G speed (~95 checks)
```
CI (`.github/workflows/security-tests.yml`) runs the first two on every push that touches the backend or front-end.

## 5. Things only a human can finish (do before launch)
**Supabase dashboard (project "Pehlawala")**
1. Authentication → Emails → templates: put `{{ .Token }}` in "Magic Link" and "Confirm signup". OTP length 6, expiry 600 s.
2. Authentication → SMTP: custom SMTP (Resend / SES / Brevo). The built-in mailer is for testing only.
3. Authentication → **MFA**: enable TOTP, enrol every admin account, then promote the admin in SQL (`update public.profiles set role='admin' ...`). Admin actions work only in an aal2 session.
4. Authentication → Rate limits: keep defaults or tighten; enable **CAPTCHA** (Cloudflare Turnstile) if you see abuse. Enabling it needs `challenges.cloudflare.com` added to `script-src`, `frame-src`, `connect-src` in the CSP; do that deliberately.
5. Database → Backups: turn on **Point-in-Time Recovery** (paid) and note the backup retention in the Privacy Policy (`[[BACKUP_DAYS]]`).
6. Settings → API: confirm the exposed schema is only `public`. If you do not use GraphQL, `revoke usage on schema graphql_public from anon, authenticated` (or drop `pg_graphql`).
7. Settings → Database: enforce SSL; restrict network access if you will only connect from known IPs. Enable log drain / keep logs ≥ **180 days** (CERT-In).
8. Run **Security Advisor** and **Performance Advisor** after applying the schema; fix anything flagged.
9. Schedule retention (SQL editor, needs `pg_cron`):
```sql
select cron.schedule('purge-inactive-accounts', '0 3 1 * *', $$select private.purge_inactive(24)$$);
select cron.schedule('purge-old-audit',         '30 3 1 * *', $$select private.purge_audit(365)$$);
```
**Accounts & hosting**
10. 2FA (preferably a passkey/hardware key) on: GitHub, Supabase, the email account used for it, the domain registrar, Google (Forms/Analytics), Netlify/Cloudflare.
11. GitHub: protect `main` (PR + passing "Security tests"), enable Dependabot + secret scanning + push protection.
12. Put Cloudflare (free) in front of physica.in for DDoS/WAF/bot protection and to send the real security headers (`frame-ancestors`, HSTS preload). GitHub Pages cannot send headers; `<meta>` CSP is already set but cannot carry `frame-ancestors`.

**Legal (see §6)**
13. Fill every `[[...]]` in `privacy.html` and `terms.html` (search the files for `[[`). Have an Indian lawyer review both before launch. These pages were drafted with the DPDP Act 2023, the DPDP Rules 2025, the IT Act 2000 and CERT-In Directions 2022 in mind but are not legal advice.
14. Appoint a Grievance Officer (name, email, address) and publish it. Acknowledge in 48 h, resolve in 30 days.
15. Sign / accept the data-processing terms of Supabase, your email provider and Google.
16. **Before 13 May 2027** (DPDP Rules, children's-data rules take effect): add *verifiable* parental consent: e.g. an email/OTP confirmation to the parent, and ultimately a Government-authorised token (DigiLocker) as the Rules allow. Today the parent is asked to confirm and their contact is stored, which is good practice but not yet "verified".
17. Write a one-page incident plan: who decides, CERT-In report within **6 hours**, notify the Data Protection Board and affected users as the Rules require, preserve logs.

## 6. Law checklist (India), plain version
| Law / rule | What it asks | Where we meet it |
|---|---|---|
| DPDP Act 2023 s.4-6 | Lawful purpose, notice, free/specific/informed consent, easy withdrawal | Privacy Policy §3, signup consent, delete account |
| DPDP s.8 | Reasonable security safeguards, breach notification, erase when purpose ends, grievance redress | §3 table above; purge jobs; Grievance Officer |
| DPDP s.9 + Rule 10 | Verifiable parental consent for under-18; **no tracking, behavioural monitoring or targeted ads for children** | Consent + parent contact; GA off by default; no ads; analytics hard-off in Test Series |
| DPDP s.11-14 | Rights: access, correction, erasure, grievance, nomination | `export_my_data`, `delete_my_account`, Privacy Policy §9-10 |
| DPDP s.16 | Cross-border transfer allowed except to restricted countries | DB in Mumbai; processors listed |
| IT Act 2000 (s.43A / SPDI Rules 2011 until DPDP replaces them) | Reasonable security practices; privacy policy | Policy + this document |
| CERT-In Directions 2022 | Report incidents in 6 h; keep logs 180 days in India; sync clocks | Audit log, ≥180 d purge floor, Supabase Mumbai; incident plan §5.17 |
| Consumer Protection (E-Commerce) Rules 2020 | Grievance Officer, 48 h acknowledgement, 1-month redress, clear prices & refund policy (when paid) | Terms §7, §12, Privacy §10 |
| Indian Contract Act 1872 | Minors cannot contract | Terms §1: parent/guardian accepts on the student's behalf |

## 7. Related
- `docs/INCIDENT-RESPONSE.md`: what to do when something is wrong (panic button, playbooks, who to notify)
- `docs/DEFINITION-OF-DONE.md`: checklist applied to every change
