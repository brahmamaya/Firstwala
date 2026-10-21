# Cost and storage: how the Test Series is kept small and cheap

Measured on the real code (see `supabase/tests/stress/`), not guessed. Re-run `bash supabase/tests/stress/run.sh` after any change.

## What dominates, and what we did about it
| Cost driver | Naive design | This design | Measured |
|---|---|---|---|
| Rows per attempt | one row per answer: 180 rows per NEET attempt | **one row per attempt** (answers, flags, seconds as arrays) | NEET attempt = **1.1 KB** |
| Database size at scale | 10,000 students x 30 tests = 300,000 attempts -> ~5.5 GB (row-per-answer estimate) | compact rows, no redundant indexes | **~650 MB** for 300,000 attempts (including indexes) |
| Write load | a request per click | like the real exam: only on Save & Next / Mark / Clear, batched, and navigation only every ~12 s | 180 answers = ~30 requests; 15 quick clicks = 2 requests |
| Question storage | one row + marks + type + subject repeated on every question | content is one jsonb per test; marks/negative/type live **once** in the exam pattern | 90 tests = a few MB |
| Exam-start spike (thousands at once) | aggregate 180 rows per student | read one pre-built row | p95 **75-85 ms** with 300 students together, ~1,800 calls/s on a laptop |
| Download per test | | one call returns the paper (gzip ~ 20-30 KB real content) | sample 180-question paper = 33 KB raw |
| Result page | a big payload with all solutions | scorecard first (tiny); solutions for **one section** only when you open it | |
| Rank | a stored leaderboard | computed on demand from a partial index, nothing stored | |
| Realtime / websockets | | not used | 0 |
| Indexes | many | only what hot queries use (the unique key serves `user_id` lookups; one partial rank index) | |
| Retention | forever | inactive accounts purged after 24 months, security log 180 days, answers compacted after 30 days (`private.purge_inactive`, `purge_audit`) | |
| Figures | each question has its own copy | one WebP per diagram, shared by key, public CDN-cached bucket | ~10-40 KB each |

## Staying on the free plans: hard cap of 10,000 students
Supabase Free limits: **500 MB database, 1 GB file storage, 5 GB egress / month, 50,000 monthly users**. Cloudflare Workers Free: 100,000 requests / day. Everything below is designed around those.

| Limit | Worst case at 10,000 students | How we stay inside |
|---|---|---|
| Database 500 MB | 10,000 x 30 tests = 300,000 attempts x 1.1 KB = 330 MB, plus ~0.6 KB of audit log each = 180 MB, i.e. over the limit if everything stayed forever | `private.compact_attempts(30)` drops per-question answers 30 days after submit (1.1 KB -> ~0.25 KB per attempt; score, rank and section detail stay), also clears old integrity events. `private.purge_audit(180)` keeps the security log for the 180-day CERT-In minimum only. Realistic steady state (a test a week per student): **about 250-300 MB**. Check any time: `select * from private.ops_storage();` |
| File storage 1 GB | only diagrams (WebP, 10-40 KB each) | ~25,000+ diagrams fit. Questions themselves are text in the database, not files. Keep figures small and shared. |
| Egress 5 GB / month | one paper download = ~15-30 KB gzip; 10,000 students x 30 tests = 4.5-9 GB if every student took every test in one month | Real use is far lower (a test a week = ~1.5-3 GB). Diagrams add to it, so keep them under 30 KB and only where the question needs one. Watch usage in the Supabase dashboard (Usage). |
| 50,000 monthly users | 10,000 | fine |
| Free projects pause after 1 week without activity | | the 15-minute watchdog (GitHub Actions) calls the public status function, which counts as activity. Keep it enabled. |
| Login e-mails | 10,000 students x 1-2 codes | Supabase's built-in mailer allows only a few e-mails per hour. Put a free SMTP in front (Brevo free: 300 e-mails / day, Resend free: 100 / day), and encourage "Keep me signed in" on personal phones. If launch day needs more than 300 logins a day, stagger sign-ups or move to a paid SMTP (a few dollars). |
| Cloudflare Workers Free 100,000 requests / day | a student makes ~60-120 requests per test; 1,000 students testing on one day already exceeds it | **Do not enable the API gateway on the free Workers plan for exams.** It ships switched off (`GW = ''`); students talk to Supabase directly, protected by the database rules and rate limits. Turn the gateway on only on Workers Paid (US$5/month) if you ever need it. |

### Schedule the clean-up (once, in the Supabase SQL editor)
```sql
create extension if not exists pg_cron;
select cron.schedule('physica-compact', '30 21 * * *', $$select private.compact_attempts(30)$$);   -- 03:00 IST daily
select cron.schedule('physica-audit',   '40 21 * * 0', $$select private.purge_audit(180)$$);        -- weekly
select cron.schedule('physica-inactive','50 21 1 * *', $$select private.purge_inactive(24)$$);      -- monthly
```
Review text in the app says "kept for 30 days" accordingly (see `review_expired` in `series.js`). Alert yourself when `ops_storage()` shows more than 70 %.

If the real numbers ever approach a limit, the order to act is: shorten compaction (14 days is the minimum), then shorten audit retention to 180, then move to Pro (US$25 / month, 8 GB).

## Habits that keep it cheap
1. Never add a per-answer table back. Anything per-question goes into the arrays on the attempt.
2. Do not add columns to `attempts` casually: every row is read and rewritten while a student answers.
3. Do not call the API on a timer for decoration; batch it.
4. Reuse figures instead of uploading copies. Keep them WebP and small.
5. Check `docs/COST-AND-STORAGE.md` numbers (the stress test prints them) before and after any schema change.
