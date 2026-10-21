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
| Retention | forever | inactive accounts purged after 24 months, security log 12 months (`private.purge_inactive`, `purge_audit`) | |
| Figures | each question has its own copy | one WebP per diagram, shared by key, public CDN-cached bucket | ~10-40 KB each |

## Rough monthly picture (Supabase, Mumbai)
- **Beta / first thousands of students:** the Free plan (500 MB database, 5 GB egress) is enough to start and to test with real students. Note Free projects pause after a week of inactivity; do not launch on Free.
- **Launch:** Pro plan (about US$25/month: 8 GB database, 250 GB egress, daily backups, no pausing). 10,000 students taking 30 tests uses ~0.7 GB database and ~20 GB egress, far inside that.
- **Static site** (the lab, the pack files): free on GitHub Pages / Netlify / Cloudflare. The Test Series pack is 12 KB and the exam screen 7 KB, fetched only when used.
- Budget extras you may want later: custom SMTP for login codes (Resend / Brevo have free tiers), Cloudflare (free), a payment gateway (a percentage per sale), point-in-time recovery.

## Habits that keep it cheap
1. Never add a per-answer table back. Anything per-question goes into the arrays on the attempt.
2. Do not add columns to `attempts` casually: every row is read and rewritten while a student answers.
3. Do not call the API on a timer for decoration; batch it.
4. Reuse figures instead of uploading copies. Keep them WebP and small.
5. Check `docs/COST-AND-STORAGE.md` numbers (the stress test prints them) before and after any schema change.
