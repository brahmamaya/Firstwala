# Physica Test Series – Supabase backend

1. Create a project at supabase.com (region: Mumbai / `ap-south-1`).
2. SQL editor → run `schema.sql`. Then load the exam patterns and your tests (see "Adding tests" below).
3. Authentication → Providers → Email: enabled. Then **Authentication → Emails → Templates**: edit both "Magic Link" and "Confirm signup"
   so the body shows the code, e.g. `Your Physica login code is <b>{{ .Token }}</b>` (the default templates only send a link, and the app asks for the 6-digit code).
   Authentication → Sign In / Providers → set the OTP length to 6 and expiry to 600 s.
4. **Before launch: Authentication → SMTP Settings → add a custom SMTP** (Resend, Brevo, AWS SES ...). Supabase's built-in mailer is limited to a
   handful of emails per hour and is for testing only; real students will hit the limit immediately.
5. Make yourself admin: `update public.profiles set role = 'admin' where id = '<your auth.users id>';`
6. Put the **Project URL** and **anon key** in the front-end config (both are public by design).
   **Never** put the `service_role` key anywhere in this repo – `tools/secret-guard.js` should be extended to block it.

## How it stays secure
- Students cannot read `questions` / `question_keys` at all (RLS: admin only). They call RPCs:
  `start_attempt`, `get_attempt` (no answers), `save_answer`, `submit_attempt`, `get_result` (after submit only).
- The timer is `attempts.deadline`, set on the server. Late saves are rejected; an expired attempt is auto-submitted.
- Profiles are written only through `save_profile()`; `role` and `parent_consent_at` cannot be forged from the browser. Under-18 students must confirm parental consent before they can start a test.
- Paid tests: set `tests.is_free = false`; a payment webhook (Edge Function, later) inserts into `enrollments`.

## Tests
`tests/rls_checks.sql` exercises all of the above (RLS, leaks, scoring, deadline). To run it locally you need a Postgres with
stub `anon` / `authenticated` roles and an `auth.users` table + `auth.uid()` – see the header of the file for fixtures.

## Security, tests and launch checklist
See `../docs/SECURITY.md` (threat model, how to run the suites, dashboard hardening, legal checklist).
Quick tests: `bash tests/run-local.sh` and `bash tests/stress/run.sh`.

## Adding tests (JEE Main, JEE Advanced, NEET: 30 each)
Patterns live in `patterns.json` (single source). Content is one JSON file per test, validated before it can go live:
```bash
node tools/series-import.js patterns | psql "$DATABASE_URL"                 # exam patterns (re-run after editing patterns.json)
node tools/series-import.js check content/                                   # validates every file, lists every problem
node tools/series-import.js sql content/ --publish > build/import.sql        # then:  psql "$DATABASE_URL" -f build/import.sql
node tools/series-import.js sample /tmp/samples                              # synthetic SAMPLE tests, for trying the app (never publish them)
```
Full format and writing rules: `docs/CONTENT-GUIDE.md`. Series 1-3 of each exam are free, 4-30 paid (derived from the series number).
