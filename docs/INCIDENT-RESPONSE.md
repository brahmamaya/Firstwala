# Incident response: "something is wrong" playbook

You are a solo founder, so this is written to be followed at 2 a.m. when you are stressed.
**Rule: if in doubt, press the panic button first and investigate afterwards.** Downtime costs minutes; a breach costs trust.

## 0. The five-minute version
| # | Do this | How |
|---|---|---|
| 1 | **Stop the damage** | Supabase → SQL editor → `select private.ops_panic(true);` Every student session is killed, every student API call and new sign-up is refused, and the site shows "Back soon". (Students' saved answers are safe.) |
| 2 | **Don't destroy evidence** | Do not delete rows, users or logs. Screenshot what you see. |
| 3 | **See what happened** | `select * from private.ops_events(48);` and `select * from private.ops_suspicious(48);` plus Supabase → Logs (Auth, API, Postgres). |
| 4 | **Contain** | Follow the matching playbook in section 2. |
| 5 | **Tell the right people in time** | Section 3 (CERT-In 6 hours; users; Data Protection Board). |
| 6 | **Recover** | `select private.ops_panic(false);` when you are confident. Check `docs/SECURITY.md` §5 is still true. |
| 7 | **Learn** | Write the post-mortem (section 6) within 3 days. Add a test so it can never repeat. |

Tools you have (all in the Supabase SQL editor, they are not reachable from the public API):
```sql
select private.ops_panic(true);                       -- LOCKDOWN ON (kills sessions, refuses all student calls + signups)
select private.ops_panic(false);                      -- lockdown off
select private.ops_set_status(true, null, null, 'We are fixing something. Back at 9 pm.');  -- maintenance notice + no NEW tests
select private.ops_set_status(null, false, null, null);   -- stop new tests only      (exams_open = false)
select private.ops_set_status(null, null, false, null);   -- stop new sign-ups only   (signups_open = false)
select private.ops_lock_user('student@example.com', 'reason');   -- lock one account + kill its sessions
select private.ops_unlock_user('student@example.com');
select private.ops_revoke_sessions('student@example.com');       -- log one user out everywhere
select * from private.ops_events(24);                -- what happened (counts per action)
select * from private.ops_suspicious(24);            -- too-fast attempts, many new devices, integrity spikes
select * from public.audit_log order by at desc limit 500;        -- raw trail (ids + actions only)
```

## 1. How you will find out (detection)
| Signal | What it means | Where |
|---|---|---|
| **GitHub issue "ALERT: Physica watchdog failed"** + email | Live site differs from `main` (defacement / injected script), site down, TLS expiring, backend down or left in lockdown | `.github/workflows/watchdog.yml` (every 30 min). Set the repo variable `WATCHDOG_URL=https://physica.in` to enable. |
| In-app "New sign-in on another device" banner | Somebody (maybe the student) logged in from a new browser | shown to the owner of the account; also `login.new_device` in the audit log |
| `ops_suspicious()` rows | Many new devices on one account (sharing / takeover), copy/tab spikes, impossibly fast tests | run it every Monday (section 5) |
| Student or parent email to easy@physica.in | "Someone else used my account", "my result changed" | treat every such mail as a possible incident, answer within 24 h |
| Supabase security / performance advisor emails | Misconfiguration (a table without RLS, an exposed function) | Dashboard → Advisors |
| GitHub Dependabot / secret-scanning alerts | Leaked key, vulnerable dependency | GitHub → Security |
| Spikes in Supabase → Logs (auth 4xx/429, API 5xx) | Credential stuffing, OTP flooding, DDoS | Dashboard → Logs |

## 2. Playbooks
### A. One student says "someone logged into my account" (account takeover)
1. `select private.ops_lock_user('their@email', 'reported takeover');` (locks the account and kills sessions.)
2. Check `select * from public.audit_log where actor = '<their id>' order by at desc;` and the new-device events.
3. Ask them to confirm they control the email inbox (a takeover almost always means the **email account** was compromised: there are no passwords to steal). Tell them to secure the email (password + 2-step) first.
4. When they confirm: `ops_unlock_user`, ask them to log in again and use *Account → Log out on all devices*.
5. If their attempt/result was tampered with: attempts are write-protected, so check `ops_suspicious` and `integrity_events`; void the attempt if needed (`update public.attempts set ...` as owner, and log why).

### B. Forced logins / credential stuffing / OTP flooding (many login attempts)
Passwords do not exist here, so "forced login" means: guessing 6-digit codes, or flooding people with OTP emails.
1. Supabase → Logs → Auth: look for a spike in `otp` / `verify` and 429s. Auth already rate-limits per email and per IP.
2. Turn on **CAPTCHA** (Auth → Attack Protection → Turnstile/hCaptcha) and add its host to the CSP (see `docs/SECURITY.md` §5.4).
3. `select private.ops_set_status(null, null, false, null);` pauses **new** sign-ups while keeping existing students working.
4. Put Cloudflare in front (rate-limit rules on `/auth/v1/otp` and `/auth/v1/verify`, "Under Attack" mode if needed).
5. If specific accounts were hit, lock them (Playbook A).

### C. Admin account compromised
1. `ops_panic(true)`.
2. Supabase → Authentication → Users → the admin → remove MFA factors; `update public.profiles set role='student' where id='<id>';`
3. Rotate: Settings → API → **regenerate the JWT secret** (every token in the world dies), change the owner password, revoke Supabase / GitHub personal tokens.
4. Review `select * from public.audit_log where action like 'admin.%' order by at desc;` for content changes. Restore tests/questions from a backup if needed (Database → Backups / PITR).
5. Re-enrol MFA with a passkey / hardware key before re-promoting any admin.

### D. The website shows something wrong / the watchdog says TAMPERED
1. `ops_panic(true)` (the lockdown also protects tokens a malicious script may have stolen).
2. Take the site offline: GitHub → Settings → Pages → unpublish (or Netlify → stop publishing).
3. Find the cause: `git log -p` on `main`; GitHub → Settings → Collaborators, deploy keys, Actions workflow runs; DNS records at the registrar; Netlify deploy log.
4. Restore from a known-good commit (`git revert` or reset **main** to it, then redeploy). Rotate every token the pipeline could read. Turn on branch protection if it was off.
5. Purge CDN/browser caches (new deploy changes `?v=` hashes; Cloudflare "Purge everything").
6. Treat it as a **cyber incident**: report to CERT-In (section 3). If personal data could have been exposed, follow Playbook F too.

### E. A secret key was committed / leaked (`sb_secret_…`, `service_role`, GitHub token)
1. Regenerate it in Supabase (Settings → API) **before** cleaning git. The old one is public forever.
2. Check Supabase Logs for use of the old key. Remove the file from history only after rotating.
3. If the service-role key leaked, assume full database read/write: do Playbook F.

### F. Personal data may have been seen by someone who should not (data breach)
1. `ops_panic(true)`. Record the time you became aware: **the CERT-In 6-hour clock starts then**.
2. Scope it: which table, which rows, which period (Supabase API/Postgres logs; `audit_log`; `ops_events`).
3. Contain: rotate keys, fix the hole, add a regression test to `supabase/tests/security_suite.sql`.
4. Notify: CERT-In (6 h), the Data Protection Board of India and every affected user/parent without delay (section 3), using the templates below.
5. Keep all logs for at least 180 days.

### G. Traffic flood (site slow or down)
The site is static (CDN), so the Test Series backend is the weak spot. Put Cloudflare in front (free), enable "Under Attack" and rate limits; `ops_set_status(true, null, null, 'High traffic, please retry in a few minutes')`; in Supabase scale up compute temporarily. Tests in progress keep working because saves are tiny and rate-limited per user.

### H. Question paper leaked / cheating wave
Every page carries the student's email as a faint watermark. Find the leaked copy, read the email, `ops_lock_user`, void that attempt, notify the student/parent, rotate the leaked test (new questions), and review `ops_suspicious` for related accounts.

### I. Bad migration or deleted data
Supabase → Database → Backups: restore (PITR if enabled) to a new project, compare, then copy rows back. Practise this once a quarter (section 5).

### J. A parent/student complaint or data request
Acknowledge within 48 hours, resolve within 30 days (Privacy Policy §10). *Account → Download my data / Delete my account* covers access and erasure; for a parent, verify they control the email on file first.

## 3. Who must be told, and when (India)
| Who | When | What |
|---|---|---|
| **CERT-In** | **within 6 hours** of noticing a reportable cyber incident (website defacement, data breach/leak, unauthorised access, attacks on servers/apps…) | Email incident@cert-in.org.in (check cert-in.org.in for the current form/address); include time, systems, what you know, logs |
| **Data Protection Board of India** + each affected person | Without delay once a *personal data breach* is known; a detailed report follows (the DPDP Rules phase in from 13 May 2027; keep this ready now) | What happened, when, whose data, what you did, contact |
| Parents of affected under-18 students | Same time as the students | Plain-language note (below) |
| Supabase / hosting provider | While investigating | They hold logs you may need |
| Your lawyer | Early, for any breach involving personal data | Privileged advice on notification wording |
*(Sources for the timelines are secondary summaries; confirm against the official texts with your lawyer.)*

### Message templates
**To affected students/parents (English)**
> Subject: Important security notice about your Physica account
> We found that [what happened] on [date/time]. This may have exposed [exactly which data, e.g. your email and test results]. It did NOT expose [e.g. passwords: Physica has none; payment details: we hold none]. We have [what you did]. What you should do: [e.g. be careful with emails pretending to be Physica; sign out of all devices from Your account]. Questions: easy@physica.in. We are sorry.

**Hinglish version**
> Physica account ke baare mein zaroori suraksha suchna. [Date/time] ko humne dekha ki [kya hua]. Isse [kaunsa data, jaise email aur test results] ka dikhne ka khatra tha. [Password: Physica mein hota hi nahi, payment details: hum rakhte hi nahi] par asar NAHI pada. Humne [kya kiya]. Aap [kya karein, jaise "Your account" se saare devices se logout]. Sawal: easy@physica.in. Hume khed hai.

## 4. Decide in advance (so you do not have to think at 2 a.m.)
- Lockdown is **always allowed** if you suspect unauthorised access, even without proof.
- Never pay anyone, never negotiate; preserve evidence; tell your lawyer.
- Do not announce speculation. Announce facts, the time, the data involved, and what users should do.

## 5. Routines that prevent incidents
| When | What |
|---|---|
| Every Monday (10 min) | `ops_events(168)`, `ops_suspicious(168)`, Supabase Advisors, GitHub Security tab, open watchdog issues |
| Monthly | Verify the retention cron jobs ran (`system.purge_inactive` in the audit log); review who has access (Supabase org, GitHub, registrar, Google); confirm 2FA everywhere |
| Quarterly | **Restore drill** from a backup; **panic drill** (`ops_panic(true)` then `false`, confirm the app shows the banner and recovers); rotate the Supabase JWT secret and any tokens; dependency updates |
| Before every release | Run all test suites (docs/SECURITY.md §4) and `node tools/perf-budget.js` |

## 6. Post-mortem template
```
Title / date / duration
Impact: who, how many, what data
Timeline (UTC+5:30): detected, contained, recovered, notified
Root cause (5 whys)
What worked / what did not
Actions: owner, due date, test added? (a post-mortem without a new test is unfinished)
```
