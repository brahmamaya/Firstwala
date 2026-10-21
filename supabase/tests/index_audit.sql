-- (a sequential scan of a tiny temp helper table is fine; only scans of the big tables count)
-- 100,000 students, 200,000 attempts (half submitted), 1,000,000 audit rows, 300,000 integrity rows.
update public.app_settings set max_users = 10000000;   -- the audit seeds 100k accounts; lift the free-plan cap for this scratch database
insert into auth.users (id, email) select gen_random_uuid(), 'u' || g || '@x.test' from generate_series(1, 100000) g;
insert into public.profiles (id) select id from auth.users on conflict do nothing;
do $$ begin if (select count(*) from public.tests) < 2 then raise exception 'need published tests'; end if; end $$;
create temp table u as select id, row_number() over () rn from auth.users; create index on u (rn); analyze u;
create temp table tt as select id, row_number() over () rn from public.tests;
insert into public.attempts (user_id, test_id, started_at, deadline, submitted_at, score, ans, fl, tm)
select u.id, tt.id, now() - interval '5 days', now() - interval '5 days' + interval '3 hours',
       case when u.rn % 2 = 0 then now() - interval '5 days' + interval '2 hours' end, case when u.rn % 2 = 0 then (u.rn * 7 + k) % 720 end,
       array_fill('A'::text, array[180]), '\x00'::bytea, array_fill(1::smallint, array[180])
from u cross join generate_series(1, 2) k join tt on tt.rn = 1 + (u.rn + k) % (select count(*) from public.tests) on conflict do nothing;
insert into public.audit_log (at, actor, action) select now() - (g % 100000) * interval '1 minute', u.id, (array['login','attempt.start','attempt.submit','login.new_device'])[1 + g % 4] from generate_series(1, 1000000) g join u on u.rn = 1 + g % 100000;
insert into public.integrity_events (attempt_id, kind, at) select a.id, 'tab_hidden', now() - (random() * 100000) * interval '1 minute' from (select id from public.attempts limit 100000) a, generate_series(1, 3);
analyze;
create temp table smp as select a.id, a.user_id uid, a.test_id tid from public.attempts a where a.submitted_at is not null limit 1 offset 4000;
create temp table res (q text, plan text, ms numeric);
create or replace function pg_temp.chk(name text, sql text, allow_seq text default '') returns void language plpgsql as $f$
declare p json; txt text; t numeric;
begin
  execute 'explain (analyze, format json) ' || sql into p;
  txt := p::text; t := (p->0->>'Execution Time')::numeric;
  insert into res values (name, case when jsonb_path_exists(p::jsonb, '$.** ? (@."Node Type" == "Seq Scan" && @."Relation Name" like_regex "^(attempts|audit_log|integrity_events|enrollments)$")') then 'SEQ' else 'index' end, t);
end $f$;
\set a 'select id, user_id, test_id from public.attempts where id = (select id from public.attempts limit 1 offset 5000)'
select pg_temp.chk('attempt by id (save_state, get_attempt)', 'select * from public.attempts where id = (select id from smp)');
select pg_temp.chk('my attempt for a test (start_attempt)', 'select id from public.attempts where user_id = (select uid from smp) and test_id = (select tid from smp)');
select pg_temp.chk('my attempts (list_tests, export)', 'select * from public.attempts where user_id = (select uid from smp)');
select pg_temp.chk('rank of one result (get_result)', 'select count(*) filter (where x.score > 300) + 1, count(*) from public.attempts x where x.test_id = (select tid from smp) and x.submitted_at is not null');
select pg_temp.chk('my audit rows (export)', 'select at, action from public.audit_log where actor = (select uid from smp)');
select pg_temp.chk('audit by action and time (admin)', $q$select count(*) from public.audit_log where action = 'login.new_device' and at > now() - interval '24 hours'$q$);
select pg_temp.chk('audit purge by age', $q$select id from public.audit_log where at < now() - interval '400 days'$q$);
select pg_temp.chk('integrity of one attempt (log_event cap)', 'select count(*) from public.integrity_events where attempt_id = (select id from smp)');
select q, plan, ms from res order by q;
do $$ declare bad text; begin
  select string_agg(q, ', ') into bad from res where plan = 'SEQ';
  if bad is not null then raise exception 'INDEX AUDIT FAILED: sequential scan in: %', bad; end if;
  if exists (select 1 from res where ms > 100) then raise exception 'INDEX AUDIT FAILED: a hot query took more than 100 ms'; end if;
  raise notice 'INDEX AUDIT PASS: every hot query uses an index and runs in under 100 ms';
end $$;
