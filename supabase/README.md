# Physica Test Series – Supabase backend

1. Create a project at supabase.com (region: Mumbai / `ap-south-1`).
2. SQL editor → run `schema.sql`, then (optionally) `seed.sql`.
3. Authentication → Providers → enable Email (OTP / magic link). Turn OFF "Confirm email" only if you use OTP codes.
4. Make yourself admin: `update public.profiles set role = 'admin' where id = '<your auth.users id>';`
5. Put the **Project URL** and **anon key** in the front-end config (both are public by design).
   **Never** put the `service_role` key anywhere in this repo – `tools/secret-guard.js` should be extended to block it.

## How it stays secure
- Students cannot read `questions` / `question_keys` at all (RLS: admin only). They call RPCs:
  `start_attempt`, `get_attempt` (no answers), `save_answer`, `submit_attempt`, `get_result` (after submit only).
- The timer is `attempts.deadline`, set on the server. Late saves are rejected; an expired attempt is auto-submitted.
- `profiles.role` and `parent_consent_at` cannot be edited by the user (column-level grants).
- Paid tests: set `tests.is_free = false`; a payment webhook (Edge Function, later) inserts into `enrollments`.

## Tests
`tests/rls_checks.sql` exercises all of the above (RLS, leaks, scoring, deadline). To run it locally you need a Postgres with
stub `anon` / `authenticated` roles and an `auth.users` table + `auth.uid()` – see the header of the file for fixtures.
