# Go-live checklist for the Test Series (about 20 minutes)

The code is merged but **switched off**: the Test Series buttons say "opens very soon" until you do the steps below.

1. **Database.** Supabase dashboard → SQL editor → paste all of `supabase/schema.sql` → Run. Then run `node tools/series-import.js patterns > build/patterns.sql` and run that file too. (`build/` is git-ignored: your files stay private.)
2. **Login e-mails.** Supabase → Authentication → SMTP: add a free SMTP (Brevo 300/day or Resend 100/day). The built-in mailer only sends a few e-mails per hour. In Authentication → URL configuration set the Site URL to `https://physica.in`. Under Providers → Email enable "Confirm email"/OTP (6-digit code) and set the code length/expiry (10 min).
3. **Admin.** Create your own account, then in SQL: `update public.profiles set role='admin' where id = (select id from auth.users where email='YOU@example.com');` and enrol an authenticator app (MFA) in Supabase.
4. **Clean-up jobs.** Run the `pg_cron` snippet from `docs/COST-AND-STORAGE.md`.
5. **Add tests.** Follow `docs/CONTENT-GUIDE.md`. Tests 1-3 of each exam are free. Publish only after `private.validate_test` passes.
6. **Switch on.** In `series-loader.js` change `const LIVE = false;` to `true`, run `node tools/build.js`, commit, push to `main`.
7. **Check.** Take test 1 yourself on your phone; look at `select * from private.ops_storage();` and the watchdog workflow (green).
8. **Optional gateway** (only on Cloudflare Workers Paid, US$5/month): see `gateway/README.md`.

Before real launch also: lawyer review of `privacy.html` / `terms.html`, fill the grievance officer name and registered address once your entity exists, and parental-consent e-mail verification before 13 May 2027.
