-- Assertion-based security suite for supabase/schema.sql. Any failed assertion aborts the run (psql ON_ERROR_STOP).
-- Run with:  bash supabase/tests/run-local.sh
\set ON_ERROR_STOP on
\set QUIET on
set client_min_messages = notice;

create schema t;
grant usage on schema t to anon, authenticated;
create function t.ok(c boolean, msg text) returns void language plpgsql as $$
begin if c is not true then raise exception 'FAIL: %', msg; end if; raise notice 'PASS  %', msg; end $$;
-- expects `stmt` to fail with a message containing `expect`
create function t.err(stmt text, expect text, msg text) returns void language plpgsql as $$
declare m text;
begin
  begin execute stmt; exception when others then m := sqlerrm; end;
  if m is null then raise exception 'FAIL (no error raised): %', msg; end if;
  if position(expect in m) = 0 then raise exception 'FAIL (got "%", wanted "%"): %', m, expect, msg; end if;
  raise notice 'PASS  %', msg;
end $$;
create function t.as_user(u uuid, aal text default 'aal1') returns void language plpgsql as $$
begin
  perform set_config('role', 'authenticated', false);
  perform set_config('request.jwt.claim.sub', u::text, false);
  perform set_config('request.jwt.claims', json_build_object('sub', u, 'aal', aal)::text, false);
end $$;
grant execute on all functions in schema t to anon, authenticated;

\set minor  '''11111111-1111-1111-1111-111111111111'''
\set adult  '''22222222-2222-2222-2222-222222222222'''
\set admin  '''33333333-3333-3333-3333-333333333333'''
\set other  '''44444444-4444-4444-4444-444444444444'''
\set s1 '''a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1'''
\set s2 '''a2a2a2a2-a2a2-a2a2-a2a2-a2a2a2a2a2a2'''
\set s3 '''a3a3a3a3-a3a3-a3a3-a3a3-a3a3a3a3a3a3'''
\set s4 '''a4a4a4a4-a4a4-a4a4-a4a4-a4a4a4a4a4a4'''
\set T1 101
\set T2 102
\set T3 103
\set T4 104
\set T5 105
\set T6 106
\set T7 107

-- ---------------------------------------------------------------- fixtures (superuser)
insert into auth.users (id, email) values (:minor, 'minor@x.test'), (:adult, 'adult@x.test'), (:admin, 'admin@x.test'), (:other, 'other@x.test'),
  (:s1, 's1@x.test'), (:s2, 's2@x.test'), (:s3, 's3@x.test'), (:s4, 's4@x.test');
update public.profiles set role = 'admin' where id = :admin;
update public.profiles set is_minor = false, display_name = 'Scorer', terms_version = '2026-10-21', terms_accepted_at = now() where id in (:s1, :s2, :s3, :s4);
-- a small pattern with one section of each type: MCQ x2 (+4/-1), MULTI x2 (+4/-2, +1 per right option when partly right), NUM x2 (+4/-1)
insert into public.exam_patterns (id, exam, label, minutes, papers, sections) values
  ('T_MIX', 'JEE_MAIN', 'Test pattern', 30, 1, '[{"id":"S1","s":"PHYSICS","nm":"Section A","t":"MCQ","n":2,"c":4,"w":-1},{"id":"S2","s":"CHEMISTRY","nm":"Section B","t":"MULTI","n":2,"c":4,"w":-2,"p":1},{"id":"S3","s":"MATHS","nm":"Section C","t":"NUM","n":2,"c":4,"w":-1}]'),
  ('T_ADV', 'JEE_ADV', 'Adv pattern', 30, 2, '[{"id":"S1","s":"PHYSICS","nm":"Section 1","t":"MCQ","n":1,"c":3,"w":-1}]');
insert into public.tests (id, exam, pattern_id, series_no, paper, published, opens_at, closes_at) overriding system value values
  (101, 'JEE_MAIN', 'T_MIX', 1, 1, false, null, null),
  (102, 'JEE_MAIN', 'T_MIX', 4, 1, false, null, null),
  (103, 'JEE_MAIN', 'T_MIX', 5, 1, false, null, null),
  (104, 'JEE_MAIN', 'T_MIX', 2, 1, false, null, null),
  (105, 'JEE_MAIN', 'T_MIX', 6, 1, false, now() + interval '1 day', null),
  (106, 'JEE_MAIN', 'T_MIX', 7, 1, false, null, now() - interval '1 day'),
  (107, 'JEE_MAIN', 'T_MIX', 3, 1, false, null, null);
-- same content for every test: Q1 MCQ key B, Q2 MCQ key C, Q3 MULTI key AC, Q4 MULTI key ABD, Q5 NUM key 10, Q6 NUM key 12.3:12.7
insert into public.test_content (test_id, qs) select id, '[{"b":"Unit of force?","o":["J","N","W","Pa"]},{"b":"Derivative of x^2?","o":["x","2x","x2","2"]},{"b":"Right statements","o":["a","b","c","d"]},{"b":"More right statements","o":["a","b","c","d"]},{"b":"Compute 2*5"},{"b":"Value near 12.5"}]'::jsonb from public.tests where id between 101 and 107;
insert into public.test_keys (test_id, ks) select id, '[{"k":"B","e":"SECRET-EXPL-1"},{"k":"C","e":"SECRET-EXPL-2"},{"k":"AC","e":"SECRET-EXPL-3"},{"k":"ABD","e":"SECRET-EXPL-4"},{"k":"10","e":"SECRET-EXPL-5"},{"k":"12.3:12.7","e":"SECRET-EXPL-6"}]'::jsonb from public.tests where id between 101 and 107;
update public.test_keys set ks = jsonb_set(ks, '{0,k}', '"*"') where test_id = 107;       -- Q1 of test 107 is a bonus question
update public.tests set published = true where id in (101, 102, 104, 105, 106, 107);
truncate public.audit_log;

\echo
\echo '=== A. static hardening (catalog checks) ==='
select t.ok(not exists (select 1 from pg_class c join pg_namespace n on n.oid = c.relnamespace
                         where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity), 'every public table has RLS enabled');
select t.ok(not exists (select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
                         where n.nspname in ('public', 'private') and p.prosecdef
                           and not coalesce(array_to_string(p.proconfig, ',') ilike '%search_path=""%', false)), 'every SECURITY DEFINER function pins search_path to empty');
select t.ok(not exists (select 1 from information_schema.role_table_grants where grantee = 'anon' and table_schema in ('public', 'private')), 'anon holds no table privileges');
select t.ok((select array_agg(routine_name::text order by routine_name::text) from information_schema.role_routine_grants
              where grantee in ('anon', 'public', 'PUBLIC') and routine_schema in ('public', 'private') and routine_name <> 'handle_new_user') = array['get_status','track'],
            'the ONLY functions anon / PUBLIC can execute are public.track and public.get_status');
select t.ok(not exists (select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname = 'public'
                         and p.proname in ('finalize', 'points', 'to_num', 'rate_limit', 'audit', 'purge_inactive', 'current_terms', 'validate_test', 'pattern_total')), 'internal helpers are not in the API-exposed schema');
select t.ok(not exists (select 1 from information_schema.role_routine_grants where grantee = 'authenticated' and routine_schema = 'private'), 'authenticated cannot execute private.*');

\echo
\echo '=== B. access control as a student ==='
reset role; select t.as_user(:minor);
select t.ok((select count(*) from public.test_content) = 0, 'student sees 0 question rows via REST');
select t.ok((select count(*) from public.test_keys) = 0,    'student sees 0 answer-key rows via REST');
select t.ok((select count(*) from public.tests) = 0,        'student cannot list the tests table directly (only via list_tests)');
select t.ok((select count(*) from public.audit_log) = 0 and (select count(*) from public.integrity_events) = 0, 'student cannot read audit log or integrity events');
select t.err('select * from public.exam_patterns', 'permission denied', 'exam_patterns not readable directly');
select t.err('insert into public.attempts (user_id, test_id, deadline, ans, fl, tm) values (''11111111-1111-1111-1111-111111111111'', 101, now() + interval ''9 day'', ''{}'', ''\x'', ''{}'')', 'permission denied', 'cannot insert attempts directly');
select t.err('insert into public.enrollments (user_id, test_id) values (''11111111-1111-1111-1111-111111111111'', 102)', 'permission denied', 'cannot grant self paid access');
select t.err('update public.profiles set role = ''admin''', 'permission denied', 'cannot self-promote to admin');
select t.err('update public.profiles set parent_consent_at = now()', 'permission denied', 'cannot forge parental consent');
select t.err('update public.attempts set deadline = now() + interval ''9 day''', 'permission denied', 'cannot extend a deadline');
select t.err('update public.attempts set score = 999', 'permission denied', 'cannot edit own score');
select t.err('delete from public.attempts', 'permission denied', 'cannot delete attempts');
select t.err('insert into public.tests (exam, pattern_id, series_no) values (''JEE_MAIN'', ''T_MIX'', 9)', 'row-level security', 'student cannot create tests');
do $$ declare n int; begin update public.test_keys set ks = '[]'; get diagnostics n = row_count; perform t.ok(n = 0, 'student cannot edit answer keys (0 rows affected)'); end $$;
select t.err('insert into public.audit_log (action) values (''forged'')', 'permission denied', 'cannot write audit log');
select t.err('select private.finalize(gen_random_uuid())', 'permission denied', 'private schema unreachable');
select t.err('select * from private.rate_limits', 'permission denied', 'rate-limit table unreachable');
reset role; set role anon;
select t.err('select count(*) from public.tests', 'permission denied', 'anon cannot read tests');
select t.err('select public.start_attempt(101)', 'permission denied', 'anon cannot call start_attempt');
select t.err('select public.list_tests(''NEET'')', 'permission denied', 'anon cannot list tests');
select t.err('select public.export_my_data()', 'permission denied', 'anon cannot export data');
select t.err('select public.delete_my_account()', 'permission denied', 'anon cannot delete accounts');

\echo
\echo '=== C. profile, consent and terms gates ==='
reset role; select t.as_user(:minor);
select t.err('select public.start_attempt(101)', 'profile_incomplete', 'cannot start before profile');
select t.err('select public.save_profile(''Ravi'', true, false, ''dad@x.test'', ''2026-10-21'')', 'consent_required', 'minor without consent rejected');
select t.err('select public.save_profile(''Ravi'', true, true, null, ''2026-10-21'')', 'invalid_parent_email', 'minor without parent email rejected');
select t.err(format('select public.save_profile(''Ravi'', true, true, %L, ''2026-10-21'')', e), 'invalid_parent_email', 'bad parent email rejected: ' || e)
  from (values ('a'), ('a@b'), ('a b@c.d'), ('@c.d'), ('a@'), (repeat('x', 250) || '@y.zz')) v(e);
select t.err('select public.save_profile('''', false, false, null, ''2026-10-21'')', 'invalid_name', 'empty name rejected');
select t.err(format('select public.save_profile(%L, false, false, null, ''2026-10-21'')', repeat('n', 81)), 'invalid_name', 'over-long name rejected');
select t.err('select public.save_profile(''Ravi'', null, false, null, ''2026-10-21'')', 'invalid_age', 'age must be answered');
select t.err('select public.save_profile(''Ravi'', false, false, null, ''1999-01-01'')', 'terms_outdated', 'old terms version rejected');
select t.err('select public.save_profile(''Ravi'', false, false, null, null)', 'terms_outdated', 'missing terms version rejected');
select public.save_profile('Ravi', true, true, '  Dad@X.TEST ', '2026-10-21');
select t.ok((select parent_email = 'dad@x.test' and parent_consent_at is not null and terms_version = '2026-10-21' and is_minor from public.profiles where id = :minor), 'minor profile saved with normalised parent email + consent + terms version');
select t.as_user(:adult); select public.save_profile('Asha', false, false, 'ignored@x.test', '2026-10-21');
select t.ok((select parent_email is null and parent_consent_at is null and not is_minor from public.profiles where id = :adult), 'adult profile stores no parent data');
select t.as_user(:other); select public.save_profile('Omar', false, false, null, '2026-10-21');

\echo
\echo '=== D. list, start, resume, free / paid ==='
reset role; select t.as_user(:minor);
select t.ok(jsonb_array_length(public.list_tests('JEE_MAIN') -> 'tests') = 6, 'list_tests returns the 6 published JEE Main tests in ONE call');
select t.ok(public.list_tests('NEET') -> 'tests' = '[]'::jsonb, 'an exam with no published tests lists none');
select t.err('select public.list_tests(''SAT'')', 'invalid_exam', 'unknown exam rejected');
select t.ok((select bool_and((x ->> 'f')::boolean = ((x ->> 'n')::int <= 3)) from jsonb_array_elements(public.list_tests('JEE_MAIN') -> 'tests') x), 'free flag is exactly "series 1-3 free, 4-30 paid"');
select t.ok((select (x ->> 'lk')::boolean from jsonb_array_elements(public.list_tests('JEE_MAIN') -> 'tests') x where (x ->> 'n')::int = 4)
        and not coalesce((select (x ->> 'lk')::boolean from jsonb_array_elements(public.list_tests('JEE_MAIN') -> 'tests') x where (x ->> 'n')::int = 1), false), 'paid test 4 is locked, free test 1 is not');
select t.ok(public.list_tests('JEE_MAIN')::text !~* 'SECRET|"k"|"qs"', 'list_tests contains no questions or keys');
select public.start_attempt(:T1) as a1 \gset
select t.ok(:'a1'::uuid = public.start_attempt(:T1), 'start_attempt is idempotent (resume)');
select t.err('select public.start_attempt(102)', 'not_enrolled', 'paid test blocked without enrolment');
select t.err('select public.start_attempt(103)', 'test_not_found', 'unpublished test invisible');
select t.err('select public.start_attempt(105)', 'test_not_open', 'future test blocked');
select t.err('select public.start_attempt(106)', 'test_closed', 'closed test blocked');
select t.err('select public.start_attempt(9999)', 'test_not_found', 'unknown test id');
reset role; insert into public.enrollments (user_id, test_id) values (:minor, 102); select t.as_user(:minor);
select t.ok(not (select (x ->> 'lk')::boolean from jsonb_array_elements(public.list_tests('JEE_MAIN') -> 'tests') x where (x ->> 'n')::int = 4), 'enrolment unlocks the paid test in the list');
select public.start_attempt(102) as a_paid \gset
select t.ok(:'a_paid' is not null, 'enrolled student can start the paid test');
reset role;
select t.err('update public.tests set is_free = true where id = 102', 'is_free', 'free/paid is derived: it cannot be edited into a wrong value');
select t.err('insert into public.tests (exam, pattern_id, series_no, paper) values (''JEE_MAIN'', ''T_MIX'', 31, 1)', 'check', 'series number must be 1..30');
select t.err('insert into public.tests (exam, pattern_id, series_no, paper) values (''JEE_MAIN'', ''T_MIX'', 1, 1)', 'duplicate', 'a series number exists once per exam and paper');

\echo
\echo '=== E. the paper: nothing secret, compact state ==='
select t.as_user(:minor);
select t.ok(public.get_attempt(:'a1')::text !~* 'SECRET|"k"|correct|explanation', 'get_attempt leaks no answers or solutions');
select t.ok(jsonb_array_length(public.get_attempt(:'a1') -> 'qs') = 6 and (public.get_attempt(:'a1') #>> '{pat,s,0,t}') = 'MCQ' and (public.get_attempt(:'a1') #>> '{pat,m}') = '30', 'paper + pattern + duration are returned');
select t.ok(public.get_attempt(:'a1') #>> '{state,fl}' = '000000000000' and jsonb_array_length(public.get_attempt(:'a1') #> '{state,ans}') = 6, 'fresh state: 6 empty answers, 6 flag bytes');
select t.ok((select pg_column_size(a.ans) + pg_column_size(a.fl) + pg_column_size(a.tm) from public.attempts a where a.id = :'a1'::uuid) < 200, 'the whole attempt state of a 6-question paper is under 200 bytes');

\echo
\echo '=== F. save_state: strict validation, batch, atomic ==='
select t.err(format('select public.save_state(%L, %L::jsonb)', :'a1', v), m, 'rejected: ' || left(v, 40))
  from (values
    ('[[0,"A",1,0]]', 'invalid_answer'), ('[[7,"A",1,0]]', 'invalid_answer'), ('[[1,"G",1,0]]', 'invalid_answer'), ('[[1,"AB",1,0]]', 'invalid_answer'),
    ('[[1,"a",1,0]]', 'invalid_answer'), ('[[3,"CA",1,0]]', 'invalid_answer'), ('[[3,"AA",1,0]]', 'invalid_answer'), ('[[3,"A1",1,0]]', 'invalid_answer'),
    ('[[5,"abc",1,0]]', 'invalid_answer'), ('[[5,"1e5",1,0]]', 'invalid_answer'), ('[[5," 5",1,0]]', 'invalid_answer'), ('[[5,"--1",1,0]]', 'invalid_answer'),
    ('[[5,"१२",1,0]]', 'invalid_answer'), ('[[5,"<img src=x onerror=1>",1,0]]', 'invalid_answer'), ('[[5,"1; drop table x",1,0]]', 'invalid_answer'),
    ('[[5,"123456789012345678901234567890",1,0]]', 'invalid_answer'), ('[[1,"A",4,0]]', 'invalid_answer'), ('[[1,"A",-1,0]]', 'invalid_answer'),
    ('[[1,"A",1]]', 'invalid_answer'), ('{"a":1}', 'invalid_answer'), ('"x"', 'invalid_answer'), ('null', 'invalid_answer'),
    ('[["x","A",1,0]]', 'invalid input syntax'), ('[[1.5,"A",1,0]]', 'invalid input syntax')) v(v, m);
select t.err(format('select public.save_state(%L, (select jsonb_agg(jsonb_build_array(1, ''A'', 1, 0)) from generate_series(1, 101)))', :'a1'), 'invalid_answer', 'more than 100 items in one call rejected');
select t.ok((select ans from public.attempts where id = :'a1'::uuid) = array_fill(null::text, array[6]), 'nothing was stored by any rejected call (atomic)');
select public.save_state(:'a1', '[[1,"A",1,3],[2,"C",1,4],[3,"AC",3,2]]');
select public.save_state(:'a1', '[[1,"B",1,10],[4,"ABD",1,5],[5,"10",1,1],[6,"12.5",1,1]]');
select t.ok((select ans from public.attempts where id = :'a1'::uuid) = array['B','C','AC','ABD','10','12.5'], 'valid batches stored (later save overwrites)');
select t.ok((select tm[1] from public.attempts where id = :'a1'::uuid) = 13 and (select get_byte(fl, 2) from public.attempts where id = :'a1'::uuid) = 3, 'time accumulates (3+10) and flags persist (visited+marked = 3)');
select public.save_state(:'a1', '[[2,null,1,0],[3,null,1,99999]]');
select t.ok((select ans[2] is null and tm[3] = 3602 and get_byte(fl, 1) = 1 from public.attempts where id = :'a1'::uuid), 'clearing an answer keeps "visited"; one save can add at most 1 hour per question');
select public.save_state(:'a1', '[[2,"C",1,0],[3,"AC",1,0]]');
select t.ok(public.get_attempt(:'a1') #>> '{state,fl}' = '010101010101' and (public.get_attempt(:'a1') #>> '{state,ans,0}') = 'B', 'get_attempt returns the saved state (resume)');

\echo '--- IDOR: another student cannot touch this attempt ---'
select t.as_user(:other);
select t.err(format('select public.save_state(%L, ''[[1,"A",1,0]]'')', :'a1'), 'attempt_not_found', 'IDOR save_state');
select t.err(format('select public.get_attempt(%L)', :'a1'), 'attempt_not_found', 'IDOR get_attempt');
select t.err(format('select public.get_result(%L)', :'a1'), 'attempt_not_found', 'IDOR get_result');
select t.err(format('select public.get_review(%L, 0)', :'a1'), 'attempt_not_found', 'IDOR get_review');
select t.err(format('select public.submit_attempt(%L)', :'a1'), 'attempt_not_found', 'IDOR submit_attempt');
select t.err(format('select public.log_event(%L, ''tab_hidden'')', :'a1'), 'attempt_closed', 'IDOR log_event');
select t.ok((select count(*) from public.attempts) = 0, 'other student sees none of those rows via REST');

\echo '--- the result and the review stay locked until submit ---'
select t.as_user(:minor);
select t.err(format('select public.get_result(%L)', :'a1'), 'attempt_in_progress', 'no scorecard while in progress');
select t.err(format('select public.get_review(%L, 0)', :'a1'), 'attempt_in_progress', 'no solutions while in progress');

\echo '--- deadline grace window ---'
reset role; update public.attempts set deadline = now() - interval '2 seconds' where id = :'a1';
select t.as_user(:minor); select public.save_state(:'a1', '[[1,"B",1,0]]'); select t.ok(true, 'save accepted within 5s grace');
reset role; update public.attempts set deadline = now() - interval '10 seconds' where id = :'a1';
select t.as_user(:minor);
select t.err(format('select public.save_state(%L, ''[[1,"A",1,0]]'')', :'a1'), 'attempt_closed', 'save rejected after grace');
select t.err(format('select public.log_event(%L, ''tab_hidden'')', :'a1'), 'attempt_closed', 'log_event rejected after deadline');
select t.ok((public.get_attempt(:'a1') ->> 'submitted')::boolean, 'expired attempt is auto-submitted on next read');
select t.ok((select score from public.attempts where id = :'a1'::uuid) = 24, 'auto-submit scored the saved answers: all six right = 24');
select t.ok(public.submit_attempt(:'a1') = 24, 'submit after auto-submit is idempotent');
select t.err(format('select public.save_state(%L, ''[[1,"A",1,0]]'')', :'a1'), 'attempt_closed', 'save rejected after submit');

\echo
\echo '=== G. scoring matrix (through the real API) ==='
select t.as_user(:s1); select public.start_attempt(:T4) as sa1 \gset
select public.save_state(:'sa1', '[[1,"B",1,1],[2,"C",1,1],[3,"AC",1,1],[4,"ABD",1,1],[5,"10",1,1],[6,"12.5",1,1]]');
select t.ok(public.submit_attempt(:'sa1') = 24, 'all right = 6 x 4 = 24');
select t.as_user(:s2); select public.start_attempt(:T4) as sa2 \gset
select public.save_state(:'sa2', '[[1,"A",1,1],[3,"AB",1,1],[4,"AB",1,1],[5,"11",1,1],[6,"13",1,1]]');
select t.ok(public.submit_attempt(:'sa2') = -3, 'wrong MCQ -1, blank 0, multi with a wrong option -2, multi partly right +2, wrong NUM -1, wrong NUM -1 = -3');
select t.as_user(:s3); select public.start_attempt(:T4) as sa3 \gset
select public.save_state(:'sa3', '[[1,"B",1,1],[2,"C",1,1],[3,"A",1,1],[4,"ABD",1,1],[5,"10.0000001",1,1],[6,"12.3",1,1]]');
select t.ok(public.submit_attempt(:'sa3') = 21, 'one right option of a multi = +1 partial, full multi +4, numerical tolerance, range edge = 21');
select t.as_user(:s4); select public.start_attempt(:T4) as sa4 \gset
select public.save_state(:'sa4', '[[3,"ACD",1,1],[4,"D",1,1],[5,"10.00",1,1],[6,"12.7000001",1,1]]');
select t.ok(public.submit_attempt(:'sa4') = 7, 'multi with a wrong option -2, one right option +1, 10.00 ok, 12.7000001 ok = 7');
select t.as_user(:s1); select public.start_attempt(:T7) as sb \gset
select t.ok(public.submit_attempt(:'sb') = 4, 'bonus question: unattempted still gets full marks (4)');
select t.as_user(:s1);
select t.ok((public.get_result(:'sa1') ->> 'score')::int = 24 and (public.get_result(:'sa1') ->> 'total')::int = 24, 'scorecard: 24 / 24');
select t.ok(jsonb_array_length(public.get_result(:'sa1') -> 'sections') = 3 and (public.get_result(:'sa1') #>> '{sections,1,sc}') = '8' and (public.get_result(:'sa1') #>> '{sections,0,ok}') = '2', 'per-section summary: 3 sections, 8 marks each, 2 right');
select t.ok((public.get_result(:'sa1') ->> 'rank')::int = 1 and (public.get_result(:'sa1') ->> 'of')::int = 4, 'rank 1 of the 4 who finished this test');
select t.as_user(:s2); select t.ok((public.get_result(:'sa2') ->> 'rank')::int = 4, 'the lowest score ranks last');
select t.ok((public.get_result(:'sa2') #>> '{sections,0,skip}') = '1' and (public.get_result(:'sa2') #>> '{sections,0,bad}') = '1', 'section summary counts skipped and wrong');

\echo '--- review (per section, only after submit) ---'
select t.as_user(:s1);
select t.ok(jsonb_array_length(public.get_review(:'sa1', 0)) = 2 and public.get_review(:'sa1', 0)::text like '%SECRET-EXPL-1%', 'review of section 0 returns 2 questions with solutions');
select t.ok((public.get_review(:'sa1', 1) #>> '{0,k}') = 'AC' and (public.get_review(:'sa1', 1) #>> '{0,pt}') = '4' and (public.get_review(:'sa1', 1) #>> '{0,i}') = '3', 'review carries the key, marks and global question number');
select t.err(format('select public.get_review(%L, 3)', :'sa1'), 'invalid_section', 'section out of range rejected');
select t.err(format('select public.get_review(%L, -1)', :'sa1'), 'invalid_section', 'negative section rejected');
select t.err(format('select public.get_review(%L, null)', :'sa1'), 'invalid_section', 'null section rejected');
select t.as_user(:s2);
select t.ok((public.get_review(:'sa2', 1) #>> '{1,pt}') = '2', 'partial credit shows as +2 in the review');

\echo
\echo '=== H. publish gate: a broken test can never go live ==='
reset role;
insert into public.tests (id, exam, pattern_id, series_no, paper) overriding system value values (108, 'JEE_MAIN', 'T_MIX', 8, 1);
select t.err('update public.tests set published = true where id = 108', 'content or keys missing', 'cannot publish without content');
insert into public.test_content (test_id, qs) values (108, '[{"b":"a","o":["a","b"]}]');
insert into public.test_keys (test_id, ks) values (108, '[{"k":"A"}]');
select t.err('update public.tests set published = true where id = 108', 'expected 6 questions', 'cannot publish with the wrong number of questions');
create function t.try(p_qs text, p_ks text, p_expect text, p_msg text) returns void language plpgsql as $$
begin
  update public.test_content set qs = p_qs::jsonb where test_id = 108;
  update public.test_keys set ks = p_ks::jsonb where test_id = 108;
  perform t.err('update public.tests set published = true where id = 108', p_expect, p_msg);
end $$;
select t.try('[{"b":"q","o":["a","b","c","d"]},{"b":"q","o":["a","b","c","d"]},{"b":"q","o":["a","b","c","d"]},{"b":"q","o":["a","b","c","d"]},{"b":"q"},{"b":"q"}]',
             '[{"k":"E"},{"k":"A"},{"k":"A"},{"k":"A"},{"k":"1"},{"k":"1"}]', 'is not an option', 'MCQ key outside the options');
select t.try('[{"b":"q","o":["a","b","c","d"]},{"b":"q","o":["a","b","c","d"]},{"b":"q","o":["a","b","c","d"]},{"b":"q","o":["a","b","c","d"]},{"b":"q"},{"b":"q"}]',
             '[{"k":"A"},{"k":"A"},{"k":"CA"},{"k":"A"},{"k":"1"},{"k":"1"}]', 'sorted distinct', 'MULTI key not sorted');
select t.try('[{"b":"q","o":["a","b","c","d"]},{"b":"q","o":["a","b","c","d"]},{"b":"q","o":["a","b","c","d"]},{"b":"q","o":["a","b","c","d"]},{"b":"q"},{"b":"q"}]',
             '[{"k":"A"},{"k":"A"},{"k":"AA"},{"k":"A"},{"k":"1"},{"k":"1"}]', 'sorted distinct', 'MULTI key with repeated letters');
select t.try('[{"b":"q","o":["a","b","c","d"]},{"b":"q","o":["a","b","c","d"]},{"b":"q","o":["a","b","c","d"]},{"b":"q","o":["a","b","c","d"]},{"b":"q"},{"b":"q"}]',
             '[{"k":"A"},{"k":"A"},{"k":"A"},{"k":"A"},{"k":"ten"},{"k":"1"}]', 'numerical key', 'NUM key not a number');
select t.try('[{"b":"q","o":["a","b","c","d"]},{"b":"q","o":["a","b","c","d"]},{"b":"q","o":["a","b","c","d"]},{"b":"q","o":["a","b","c","d"]},{"b":"q"},{"b":"q"}]',
             '[{"k":"A"},{"k":"A"},{"k":"A"},{"k":"A"},{"k":"1"},{"k":"13:12"}]', 'reversed', 'NUM range reversed');
select t.try('[{"b":"q","o":["a"]},{"b":"q","o":["a","b","c","d"]},{"b":"q","o":["a","b","c","d"]},{"b":"q","o":["a","b","c","d"]},{"b":"q"},{"b":"q"}]',
             '[{"k":"A"},{"k":"A"},{"k":"A"},{"k":"A"},{"k":"1"},{"k":"1"}]', '2-6 options', 'a question with one option');
select t.try('[{"b":"q"},{"b":"q","o":["a","b","c","d"]},{"b":"q","o":["a","b","c","d"]},{"b":"q","o":["a","b","c","d"]},{"b":"q"},{"b":"q"}]',
             '[{"k":"A"},{"k":"A"},{"k":"A"},{"k":"A"},{"k":"1"},{"k":"1"}]', 'needs options', 'MCQ without options');
select t.try('[{"b":"q","o":["a","b","c","d"]},{"b":"q","o":["a","b","c","d"]},{"b":"q","o":["a","b","c","d"]},{"b":"q","o":["a","b","c","d"]},{"b":"q","o":["a","b"]},{"b":"q"}]',
             '[{"k":"A"},{"k":"A"},{"k":"A"},{"k":"A"},{"k":"1"},{"k":"1"}]', 'must not have options', 'numerical question with options');
select t.try('[{"b":"q","o":["a","b","c","d"],"f":"abcdefghijklmnopqrstuv"},{"b":"q","o":["a","b","c","d"]},{"b":"q","o":["a","b","c","d"]},{"b":"q","o":["a","b","c","d"]},{"b":"q"},{"b":"q"}]',
             '[{"k":"A"},{"k":"A"},{"k":"A"},{"k":"A"},{"k":"1"},{"k":"1"}]', 'alt text', 'a figure without alt text (accessibility)');
select t.try('[{"b":"q","o":["a","b","c","d"],"f":"../../x","a":"x"},{"b":"q","o":["a","b","c","d"]},{"b":"q","o":["a","b","c","d"]},{"b":"q","o":["a","b","c","d"]},{"b":"q"},{"b":"q"}]',
             '[{"k":"A"},{"k":"A"},{"k":"A"},{"k":"A"},{"k":"1"},{"k":"1"}]', 'bad figure key', 'a figure key that is not a safe token');
select t.try('[{"b":""},{"b":"q","o":["a","b","c","d"]},{"b":"q","o":["a","b","c","d"]},{"b":"q","o":["a","b","c","d"]},{"b":"q"},{"b":"q"}]',
             '[{"k":"A"},{"k":"A"},{"k":"A"},{"k":"A"},{"k":"1"},{"k":"1"}]', 'has no text', 'an empty question');
select t.try('[{"b":"q","o":["a","b","c","d"]},{"b":"q","o":["a","b","c","d"]},{"b":"q","o":["a","b","c","d"]},{"b":"q","o":["a","b","c","d"]},{"b":"q"},{"b":"q"}]',
             '[{"k":"A"},{"k":"A"},{"k":"A"},{"k":"A"},{"k":"1"},{}]', 'has no key', 'a missing key');
-- a valid test with '*' (bonus) on any type, then publish
update public.test_content set qs = '[{"b":"q1","o":["a","b","c","d"]},{"b":"q2","o":["a","b","c","d"]},{"b":"q3","o":["a","b","c","d"],"f":"abcdefghijklmnopqrstuv","a":"A circuit"},{"b":"q4","o":["a","b","c","d"]},{"b":"q5"},{"b":"q6"}]' where test_id = 108;
update public.test_keys set ks = '[{"k":"A"},{"k":"*"},{"k":"AB"},{"k":"*"},{"k":"-3.5"},{"k":"*"}]' where test_id = 108;
update public.tests set published = true where id = 108;
select t.ok((select published from public.tests where id = 108), 'a complete, well-formed test publishes (incl. bonus keys and a figure with alt text)');
do $$ begin
  set constraints all immediate;       -- the guard is deferred to COMMIT; make it fire inside this block so the test can catch it
  perform t.err('update public.test_content set qs = ''[]'' where test_id = 108', 'content_invalid', 'editing live content into something broken is refused');
end $$;
select t.ok((select jsonb_array_length(qs) from public.test_content where test_id = 108) = 6, '... and the live content is unchanged');
update public.test_content set qs = jsonb_set(qs, '{0,b}', '"q1 corrected"') where test_id = 108;
select t.ok((select qs -> 0 ->> 'b' from public.test_content where test_id = 108) = 'q1 corrected', 'a valid fix to live content is allowed (and needs no cache rebuild)');
select t.err('insert into public.tests (exam, pattern_id, series_no, published) values (''JEE_MAIN'', ''T_MIX'', 9, true)', 'insert unpublished first', 'cannot create a test already published');
select t.err('insert into public.tests (exam, pattern_id, series_no) values (''NEET'', ''T_MIX'', 9)', 'belongs to', 'pattern must match the exam');
select t.err('insert into public.tests (exam, pattern_id, series_no, paper) values (''JEE_MAIN'', ''T_MIX'', 9, 2)', 'only 1 paper', 'paper 2 needs a two-paper pattern');
insert into public.tests (exam, pattern_id, series_no, paper) values ('JEE_ADV', 'T_ADV', 9, 2);
select t.ok(exists (select 1 from public.tests where exam = 'JEE_ADV' and paper = 2), 'JEE Advanced paper 2 is allowed');
delete from public.tests where id = 108;
delete from public.tests where exam = 'JEE_ADV';

\echo
\echo '=== I. integrity events ==='
reset role; truncate private.rate_limits; select t.as_user(:other);
select public.start_attempt(:T4) as ao \gset
select public.log_event(:'ao', 'tab_hidden'); select public.log_event(:'ao', 'tab_visible'); select public.log_event(:'ao', 'copy_attempt');
select t.err(format('select public.log_event(%L, ''hax'')', :'ao'), 'invalid_event', 'unknown event kind rejected');
select t.ok((select count(*) from public.integrity_events) = 0, 'student cannot read integrity events');
do $$ declare i int; a uuid := (select id from public.attempts limit 1); begin for i in 1..70 loop perform public.log_event(a, 'tab_hidden'); end loop; end $$;
reset role; select t.ok((select count(*) from public.integrity_events where attempt_id = :'ao'::uuid) = 60, 'at most 60 integrity events are kept per attempt (storage cap)');

\echo
\echo '=== J. admin needs MFA (aal2) ==='
reset role; select t.as_user(:admin, 'aal1');
select t.ok(not public.is_admin(), 'admin with password/OTP only (aal1) is NOT admin');
select t.ok((select count(*) from public.test_content) = 0 and (select count(*) from public.test_keys) = 0, 'aal1 admin sees no questions or keys');
select t.err('insert into public.tests (exam, pattern_id, series_no) values (''JEE_ADV'', ''T_ADV'', 30)', 'row-level security', 'aal1 admin cannot write');
reset role; select t.as_user(:admin, 'aal2');
select t.ok(public.is_admin(), 'admin with MFA (aal2) is admin');
select t.ok((select count(*) from public.test_content) >= 7 and (select count(*) from public.test_keys) >= 7, 'aal2 admin sees questions and keys');
select t.ok((select count(*) from public.integrity_events) >= 60, 'aal2 admin sees integrity events');
insert into public.tests (id, exam, pattern_id, series_no, title) overriding system value values (190, 'JEE_ADV', 'T_ADV', 30, 'Admin made');
update public.tests set title = 'Admin edited' where id = 190;
delete from public.tests where id = 190;
select t.ok((select count(*) from public.audit_log where actor = :admin and action in ('admin.insert', 'admin.update', 'admin.delete') and entity = 'tests') = 3, 'admin insert / update / DELETE are audited');
select t.ok(exists (select 1 from public.audit_log where action = 'attempt.start') and exists (select 1 from public.audit_log where action = 'attempt.submit'), 'attempt start / submit are audited');
select t.ok(not exists (select 1 from public.audit_log where meta::text ~* 'x\.test|Ravi|Asha|SECRET|Unit of force'), 'audit log contains no emails, names, answers or question text');

\echo
\echo '=== K. terms re-acceptance ==='
reset role;
create or replace function private.current_terms() returns text language sql immutable set search_path = '' as $$ select '2027-01-01'::text $$;
select t.as_user(:adult);
select t.err('select public.start_attempt(104)', 'terms_outdated', 'new terms version forces re-acceptance');
select public.save_profile('Asha', false, false, null, '2027-01-01');
select public.start_attempt(:T4) as a4 \gset
select t.ok(:'a4' is not null, 'can start after accepting the new terms');
reset role;
create or replace function private.current_terms() returns text language sql immutable set search_path = '' as $$ select '2026-10-21'::text $$;

\echo
\echo '=== L. rate limits (one transaction, so the window cannot roll over) ==='
reset role; truncate private.rate_limits; select t.as_user(:other);
do $$
declare i int; a uuid := (select id from public.attempts limit 1);
begin
  for i in 1..120 loop perform public.log_event(a, 'tab_hidden'); end loop;
  perform t.err(format('select public.log_event(%L, ''tab_hidden'')', a), 'rate_limited', 'log_event limited to 120 / minute');
end $$;
do $$
declare i int; a uuid := (select id from public.attempts limit 1);
begin
  for i in 1..300 loop perform public.save_state(a, '[[1,"B",1,0]]'); end loop;
  perform t.err(format('select public.save_state(%L, ''[[1,"B",1,0]]'')', a), 'rate_limited', 'save_state limited to 300 / minute');
end $$;
select t.as_user(:adult);
select t.ok(public.get_attempt(:'a4') is not null, 'another user is unaffected by that limit');
reset role; truncate private.rate_limits; select t.as_user(:other);
select public.save_state(:'ao', '[[1,"B",1,0]]'); select t.ok(true, 'limit clears when the window passes');
reset role; select t.as_user(:adult);
do $$ begin
  for i in 1..5 loop perform public.export_my_data(); end loop;
  perform t.err('select public.export_my_data()', 'rate_limited', 'export limited to 5 / day');
end $$;

\echo
\echo '=== M. data-subject rights ==='
reset role; truncate private.rate_limits; select t.as_user(:minor);
select public.export_my_data() as ex \gset
select t.ok((:'ex'::jsonb #>> '{account,email}') = 'minor@x.test' and (:'ex'::jsonb #>> '{profile,parent_email}') = 'dad@x.test', 'export includes account + profile (with parent contact)');
select t.ok(jsonb_array_length(:'ex'::jsonb -> 'attempts') = 2 and jsonb_array_length(:'ex'::jsonb #> '{attempts,0,attempt,ans}') = 6, 'export includes both attempts with their answers');
select t.ok(:'ex'::jsonb::text !~ 'SECRET|other@x.test|adult@x.test', 'export contains no answer keys and no other user''s data');
select public.delete_my_account();
reset role;
select t.ok(not exists (select 1 from auth.users where id = :minor) and not exists (select 1 from public.profiles where id = :minor)
        and not exists (select 1 from public.attempts where user_id = :minor) and not exists (select 1 from public.enrollments where user_id = :minor), 'erasure cascades: account, profile, attempts, enrolments gone');
select t.ok((select count(*) from public.audit_log where actor = :minor and action = 'account.delete') = 1, 'deletion itself is kept in the audit trail (id only)');
select t.ok(exists (select 1 from auth.users where id = :adult) and exists (select 1 from public.attempts where user_id = :adult), 'other users untouched by that erasure');

\echo
\echo '=== N. storage limitation (purge inactive accounts) ==='
reset role;
insert into auth.users (id, email) values ('55555555-5555-5555-5555-555555555555', 'old@x.test'), ('66666666-6666-6666-6666-666666666666', 'oldbutactive@x.test');
update public.profiles set created_at = now() - interval '30 months' where id in ('55555555-5555-5555-5555-555555555555', '66666666-6666-6666-6666-666666666666');
insert into public.attempts (user_id, test_id, deadline, started_at, ans, fl, tm) values ('66666666-6666-6666-6666-666666666666', :T4, now(), now() - interval '2 months', '{}', '\x', '{}');
update public.profiles set created_at = now() - interval '30 months' where id = :admin;
select t.err('select private.purge_inactive(3)', 'too_aggressive', 'purge refuses < 6 months');
select t.ok(private.purge_inactive(24) = 1, 'purge removes exactly the one inactive student');
select t.ok(exists (select 1 from auth.users where id = '66666666-6666-6666-6666-666666666666') and exists (select 1 from auth.users where id = :admin), 'recently active student and admin are kept');
select t.as_user(:adult);
select t.err('select private.purge_inactive(24)', 'permission denied', 'students cannot run purge');
\echo '--- audit log retention ---'
reset role;
insert into public.audit_log (at, action) values (now() - interval '400 days', 'old.event'), (now() - interval '200 days', 'mid.event');
select t.err('select private.purge_audit(30)', 'below_cert_in_minimum', 'audit purge refuses to go below CERT-In''s 180 days');
select t.ok(private.purge_audit(365) = 1, 'audit purge removes only entries older than 12 months');
select t.ok(exists (select 1 from public.audit_log where action = 'mid.event'), 'entries inside the retention window are kept');
select t.as_user(:adult);
select t.err('select private.purge_audit(365)', 'permission denied', 'students cannot purge the audit log');

\echo
\echo '=== L. privacy-first analytics ==='
reset role; truncate public.analytics_daily; truncate private.rate_limits; set role anon;
select public.track('visit'); select public.track('visit', ''); select public.track('view', 'projectile-motion'); select public.track('view', 'projectile-motion');
select t.err('select public.track(''hax'', ''a'')', 'invalid_event', 'unknown analytics event rejected');
select t.err(format('select public.track(''view'', %L)', k), 'invalid_event', 'bad analytics key rejected: ' || left(k, 24))
  from (values ('Has Caps'), ('a b'), ('x;drop table y'), ('<script>'), (repeat('a', 65)), ('é'), ('a/b')) v(k);
select t.err('select count(*) from public.analytics_daily', 'permission denied', 'anon cannot read the statistics table');
select t.err('select public.admin_stats(7)', 'permission denied', 'anon cannot call admin_stats');
reset role;
select t.ok((select n from public.analytics_daily where event = 'visit' and key = '') = 2 and (select n from public.analytics_daily where event = 'view' and key = 'projectile-motion') = 2, 'counters increment (2 visits, 2 views)');
select t.ok((select count(*) from information_schema.columns where table_schema = 'public' and table_name = 'analytics_daily') = 4
        and not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'analytics_daily' and column_name ~* 'ip|user|agent|session|device|email|id$'), 'statistics table has no column that could identify a person (day, event, key, n only)');
select t.as_user(:adult);
select t.ok((select count(*) from public.analytics_daily) = 0, 'a signed-in student cannot read the statistics');
select t.err('select public.admin_stats(7)', 'forbidden', 'student cannot call admin_stats');
select t.as_user(:admin, 'aal1'); select t.err('select public.admin_stats(7)', 'forbidden', 'admin without MFA cannot call admin_stats');
select t.as_user(:admin, 'aal2');
select t.ok((public.admin_stats(7) ->> 'visits_total')::int = 2 and (public.admin_stats(7) #>> '{top_views,0,key}') = 'projectile-motion', 'admin (MFA) sees totals and top pages');
reset role;
do $$ begin for i in 1..3005 loop insert into public.analytics_daily (event, key, n) values ('view', 'k' || i, 1) on conflict do nothing; end loop; end $$;
set role anon; select public.track('view', 'brand-new-key'); reset role;
select t.ok((select n from public.analytics_daily where key = 'other') = 1 and not exists (select 1 from public.analytics_daily where key = 'brand-new-key'), 'distinct-key cap: new keys fold into "other" once 3000 exist for the day');
truncate private.rate_limits; set role anon;
do $$ begin for i in 1..1200 loop perform public.track('visit'); end loop; perform t.err('select public.track(''visit'')', 'rate_limited', 'track is globally rate limited (1200/min)'); end $$;
reset role;

\echo
\echo '=== P. incident response: kill switches, locks, devices, detection ==='
reset role; truncate private.rate_limits;
select t.ok((select array_agg(routine_name::text order by routine_name::text) from information_schema.role_routine_grants where grantee = 'authenticated' and routine_schema = 'private') is null, 'no private.* function (incl. ops tools) is executable by students');
select t.as_user(:adult);
select t.err('select private.ops_panic(true)', 'permission denied', 'student cannot press the panic button');
select t.err('select private.ops_lock_user(''x@y.z'')', 'permission denied', 'student cannot lock users');
select t.err('select private.ops_set_status(true)', 'permission denied', 'student cannot change maintenance status');
reset role;
set role anon; select t.ok((public.get_status() ->> 'lockdown') = 'false', 'anyone can read the public status');
select t.err('select * from public.app_settings', 'permission denied', 'app_settings is not readable via the API');
reset role;

\echo '--- device tracking ---'
select t.as_user(:other);
select t.err('select public.note_device(''short'')', 'invalid_device', 'bad device id rejected');
select t.err('select public.note_device(''has spaces and symbols !!!!!!!!!'')', 'invalid_device', 'device id charset enforced');
select t.ok((public.note_device('AAAAAAAAAAAAAAAAAAAAAAAAAA') ->> 'new_device') = 'false', 'first device is not flagged (nothing to compare)');
select t.ok((public.note_device('AAAAAAAAAAAAAAAAAAAAAAAAAA') ->> 'new_device') = 'false', 'same device again: not new');
select t.ok((public.note_device('BBBBBBBBBBBBBBBBBBBBBBBBBB') ->> 'new_device') = 'true', 'a second device is flagged as new');
reset role;
select t.ok(exists (select 1 from public.audit_log where action = 'login.new_device' and actor = :other), 'new device is audited');
select t.as_user(:other);
select t.ok(jsonb_array_length(public.list_devices('AAAAAAAAAAAAAAAAAAAAAAAAAA')) = 2 and (public.list_devices('AAAAAAAAAAAAAAAAAAAAAAAAAA') #>> '{1,current}') in ('true', 'false'), 'list_devices returns this user''s devices');
select t.ok(public.list_devices('AAAAAAAAAAAAAAAAAAAAAAAAAA')::text !~ '[0-9a-f]{40}', 'device hashes are never sent to the browser');
do $$ declare i int; begin for i in 1..25 loop perform public.note_device(rpad('D' || i, 30, 'x')); end loop; end $$;
select t.ok(jsonb_array_length(public.list_devices(null)) = 20, 'device list is capped at 20 per account');
reset role; truncate private.rate_limits;

\echo '--- account lock ---'
select t.as_user(:other); select public.save_state(:'ao', '[[1,"B",1,0]]'); reset role;
select t.ok(private.ops_lock_user('OTHER@x.test', 'test') like 'locked%', 'ops_lock_user locks by email (case-insensitive)');
select t.ok((select banned_until is not null from auth.users where id = :other) and not exists (select 1 from auth.sessions where user_id = :other), 'login ban set and sessions killed');
select t.as_user(:other);
select t.err(format('select public.save_state(%L, ''[[1,"B",1,0]]'')', :'ao'), 'account_locked', 'locked user: save_state refused at once');
select t.err('select public.start_attempt(107)', 'account_locked', 'locked user: start_attempt refused');
select t.err(format('select public.get_attempt(%L)', :'ao'), 'account_locked', 'locked user: get_attempt refused');
select t.err(format('select public.log_event(%L, ''tab_hidden'')', :'ao'), 'account_locked', 'locked user: log_event refused');
select t.err('select public.note_device(''CCCCCCCCCCCCCCCCCCCCCCCCCC'')', 'account_locked', 'locked user: cannot register a device');
select t.ok(public.export_my_data() is not null, 'a locked user can still export their data (right of access)');
reset role; select t.ok(private.ops_unlock_user('other@x.test') like 'unlocked%', 'ops_unlock_user');
select t.as_user(:other); select public.save_state(:'ao', '[[1,"B",1,0]]'); select t.ok(true, 'after unlock the user works again'); reset role;
select t.ok(private.ops_revoke_sessions('other@x.test') = 0 and exists (select 1 from public.audit_log where action = 'ops.lock_user') and exists (select 1 from public.audit_log where action = 'ops.unlock_user'), 'lock / unlock / revoke are audited');

\echo '--- maintenance and pause ---'
select private.ops_set_status(true, null, null, 'Short maintenance');
select t.ok((public.get_status() ->> 'message') = 'Short maintenance' and (public.get_status() ->> 'maintenance') = 'true', 'maintenance message is published');
select t.as_user(:adult);
select t.err('select public.start_attempt(107)', 'exams_paused', 'no NEW test can start during maintenance');
select t.ok(public.get_attempt(:'a4') is not null, 'but a test already in progress keeps working');
reset role; select private.ops_set_status(false, null, null, null);
select private.ops_set_status(null, null, false, null);
select t.err($q$insert into auth.users (email) values ('late@x.test')$q$, 'signups_closed', 'signup switch blocks new accounts');
select private.ops_set_status(null, null, true, null);
insert into auth.users (email) values ('late2@x.test');
select t.ok(exists (select 1 from auth.users where email = 'late2@x.test'), 'signups reopen');

\echo '--- PANIC / lockdown ---'
insert into auth.sessions (user_id) values (:adult), (:other), (:admin);
select private.ops_panic(true) as pr \gset
select t.ok(:'pr' like 'LOCKDOWN ON%' and (select count(*) from auth.sessions) = 0, 'panic kills every session');
select t.ok((public.get_status() ->> 'lockdown') = 'true' and (public.get_status() ->> 'message') like '%security check%', 'public status shows the lockdown notice');
select t.as_user(:adult);
select t.err(format('select public.get_attempt(%L)', :'a4'), 'lockdown', 'lockdown: get_attempt refused');
select t.err(format('select public.save_state(%L, ''[[1,"B",1,0]]'')', :'a4'), 'lockdown', 'lockdown: save_state refused');
select t.err('select public.export_my_data()', 'lockdown', 'lockdown: even export is refused');
select t.err('select public.start_attempt(107)', 'lockdown', 'lockdown: start refused');
reset role;
select t.err($q$insert into auth.users (email) values ('x2@x.test')$q$, 'signups_closed', 'lockdown also closes signups');
select private.ops_panic(false) as pr2 \gset
select t.ok(:'pr2' = 'lockdown off' and (public.get_status() ->> 'lockdown') = 'false' and (public.get_status() ->> 'exams_open') = 'true', 'panic off restores normal service');
select t.as_user(:adult); select t.ok(public.get_attempt(:'a4') is not null, 'users work again after panic off'); reset role;

\echo '--- profile RPC + gateway wall ---'
select t.as_user(:adult);
select t.ok((public.get_my_profile() ->> 'display_name') = 'Asha' and public.get_my_profile() ? 'is_minor' and not (public.get_my_profile() ? 'role') and not (public.get_my_profile() ? 'locked_at'), 'get_my_profile returns only the student''s own safe fields');
reset role;
select t.err($q$select private.ops_set_gateway_key('short')$q$, 'key_too_short', 'gateway key must be long');
select private.ops_set_gateway_key(repeat('k', 40));
select t.ok((select gateway_hash from public.app_settings) is not null and (select gateway_hash from public.app_settings) <> repeat('k', 40), 'only a hash of the gateway key is stored');
select t.as_user(:adult);
select t.err('select public.get_my_profile()', 'gateway_required', 'gateway on: a direct call without the key is refused');
select set_config('request.headers', '{"x-gateway-key":"wrong"}', false);
select t.err('select public.list_tests(''NEET'')', 'gateway_required', 'gateway on: wrong key refused');
select set_config('request.headers', format('{"x-gateway-key":"%s"}', repeat('k', 40)), false);
select t.ok(public.get_my_profile() is not null and public.list_tests('NEET') is not null, 'gateway on: right key works');
select set_config('request.headers', '', false);
reset role;
select private.ops_set_gateway_key(null);
select t.as_user(:adult); select t.ok(public.get_my_profile() is not null, 'gateway off again: direct calls work');
reset role;

\echo '--- detection helpers ---'
select t.ok((select count(*) from private.ops_events(24) where action = 'ops.panic') = 1, 'ops_events summarises recent security actions');
insert into public.audit_log (actor, action) select :other, 'login.new_device' from generate_series(1, 3);
select t.ok(exists (select 1 from private.ops_suspicious(24) where kind = 'new_devices' and subject = :other::text), 'ops_suspicious flags many new devices');
insert into public.attempts (id, user_id, test_id, deadline, submitted_at, score, started_at, ans, fl, tm) values ('cccccccc-0000-0000-0000-0000000000a1', :adult, 105, now() + interval '1 hour', now(), 4, now() - interval '1 minute', array['A','B','A','B','1','2'], '\x010101010101', array[1,1,1,1,1,1]::smallint[]);
select t.ok(exists (select 1 from private.ops_suspicious(24) where kind = 'too_fast'), 'ops_suspicious flags an attempt finished in a fraction of the time');

\echo '--- storage limit: compacting old attempts ---'
select t.err('select private.compact_attempts(3)', 'too_soon', 'compaction refuses a window under 14 days');
update public.attempts set submitted_at = now() - interval '90 days' where id = 'cccccccc-0000-0000-0000-0000000000a1';
select private.compact_attempts(60) as nc \gset
select t.ok(:nc >= 1 and (select cardinality(ans) = 0 and length(fl) = 0 and cardinality(tm) = 0 and score is not null from public.attempts where id = 'cccccccc-0000-0000-0000-0000000000a1'), 'old submitted attempt is compacted but keeps its score');
select t.ok(exists (select 1 from public.attempts where submitted_at is null and cardinality(ans) > 0), 'in-progress attempts are never compacted');
select t.as_user(:adult);
select t.err($q$select public.get_review('cccccccc-0000-0000-0000-0000000000a1', 0)$q$, 'review_expired', 'review of a compacted attempt says it expired');
reset role;

select t.ok((select count(*) from private.ops_storage()) = 7 and (select mb from private.ops_storage() where what = 'whole database') > 0, 'ops_storage reports database and table sizes');
update public.app_settings set max_users = (select count(*) from public.profiles);
select t.err($q$insert into auth.users (email) values ('cap@x.test')$q$, 'signups_closed', 'account cap (free-plan guard) blocks new sign-ups at max_users');
update public.app_settings set max_users = 30000;
insert into auth.users (email) values ('cap2@x.test');
select t.ok(exists (select 1 from auth.users where email = 'cap2@x.test'), 'sign-ups work again below the cap');
\echo
\echo 'ALL SECURITY CHECKS PASSED'
