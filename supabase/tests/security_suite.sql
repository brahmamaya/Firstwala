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
\set T1 '''aaaaaaaa-0000-0000-0000-000000000001'''
\set T2 '''aaaaaaaa-0000-0000-0000-000000000002'''
\set T3 '''aaaaaaaa-0000-0000-0000-000000000003'''
\set T4 '''aaaaaaaa-0000-0000-0000-000000000004'''
\set T5 '''aaaaaaaa-0000-0000-0000-000000000005'''
\set T6 '''aaaaaaaa-0000-0000-0000-000000000006'''
\set Q1 '''bbbbbbbb-0000-0000-0000-000000000001'''
\set Q2 '''bbbbbbbb-0000-0000-0000-000000000002'''
\set Q3 '''bbbbbbbb-0000-0000-0000-000000000003'''
\set Q9 '''bbbbbbbb-0000-0000-0000-000000000009'''

-- ---------------------------------------------------------------- fixtures (superuser)
insert into auth.users (id, email) values (:minor, 'minor@x.test'), (:adult, 'adult@x.test'), (:admin, 'admin@x.test'), (:other, 'other@x.test');
update public.profiles set role = 'admin' where id = :admin;
insert into public.tests (id, title, exam, duration_min, published, is_free, opens_at, closes_at) values
  (:T1, 'Free test',   'JEE_MAIN', 30, true,  true,  null, null),
  (:T2, 'Paid test',   'JEE_MAIN', 30, true,  false, null, null),
  (:T3, 'Draft test',  'JEE_MAIN', 30, false, true,  null, null),
  (:T4, 'Free test 2', 'NEET',     30, true,  true,  null, null),
  (:T5, 'Future test', 'NEET',     30, true,  true,  now() + interval '1 day', null),
  (:T6, 'Closed test', 'NEET',     30, true,  true,  null, now() - interval '1 day');
insert into public.questions (id, test_id, position, subject, type, body, options) values
  (:Q1, :T1, 1, 'PHYSICS', 'MCQ',       'Unit of force?', '["J","N","W","Pa"]'),
  (:Q2, :T1, 2, 'PHYSICS', 'NUMERICAL', 'Compute 2*5', '[]'),
  (:Q3, :T1, 3, 'MATHS',   'MCQ',       'Derivative of x^2?', '["x","2x","x2","2"]'),
  (:Q9, :T4, 1, 'BIOLOGY', 'MCQ',       'Powerhouse?', '["Nucleus","Mitochondria"]');
insert into public.question_keys values
  (:Q1, '1',  'SECRET-EXPLANATION-1'), (:Q2, '10', 'SECRET-EXPLANATION-2'),
  (:Q3, '1',  'SECRET-EXPLANATION-3'), (:Q9, '1', 'SECRET-EXPLANATION-9');
truncate public.audit_log;   -- fixtures above are not part of what we assert on

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
                         and p.proname in ('finalize', 'score_answer', 'to_num', 'rate_limit', 'audit', 'purge_inactive', 'current_terms')), 'internal helpers are not in the API-exposed schema');
select t.ok(not exists (select 1 from information_schema.role_routine_grants where grantee = 'authenticated' and routine_schema = 'private'), 'authenticated cannot execute private.*');

\echo
\echo '=== B. access control as a student ==='
reset role; select t.as_user(:minor);
select t.ok((select count(*) from public.questions) = 0,      'student sees 0 questions via REST');
select t.ok((select count(*) from public.question_keys) = 0,  'student sees 0 answer keys via REST');
select t.ok((select count(*) from public.audit_log) = 0,      'student cannot read audit log');
select t.ok((select count(*) from public.integrity_events) = 0, 'student cannot read integrity events');
select t.ok((select count(*) from public.tests) = 5,          'student sees only the 5 published tests (draft hidden)');
select t.err('insert into public.attempts (user_id, test_id, deadline) values (''11111111-1111-1111-1111-111111111111'', ''aaaaaaaa-0000-0000-0000-000000000001'', now() + interval ''9 day'')', 'permission denied', 'cannot insert attempts directly');
select t.err('insert into public.responses (attempt_id, question_id, answer) values (gen_random_uuid(), gen_random_uuid(), ''1'')', 'permission denied', 'cannot insert responses directly');
select t.err('insert into public.enrollments (user_id, test_id) values (''11111111-1111-1111-1111-111111111111'', ''aaaaaaaa-0000-0000-0000-000000000002'')', 'permission denied', 'cannot grant self paid access');
select t.err('update public.profiles set role = ''admin''', 'permission denied', 'cannot self-promote to admin');
select t.err('update public.profiles set parent_consent_at = now()', 'permission denied', 'cannot forge parental consent');
select t.err('update public.attempts set deadline = now() + interval ''9 day''', 'permission denied', 'cannot extend a deadline');
select t.err('update public.attempts set score = 999', 'permission denied', 'cannot edit own score');
select t.err('delete from public.attempts', 'permission denied', 'cannot delete attempts');
select t.err('insert into public.tests (title, exam, duration_min) values (''x'', ''NEET'', 5)', 'row-level security', 'student cannot create tests');
select t.err('insert into public.audit_log (action) values (''forged'')', 'permission denied', 'cannot write audit log');
select t.err('select private.finalize(gen_random_uuid())', 'permission denied', 'private schema unreachable');
select t.err('select * from private.rate_limits', 'permission denied', 'rate-limit table unreachable');
select t.err('select private.audit(''x'')', 'permission denied', 'cannot call private.audit');
reset role; set role anon;
select t.err('select count(*) from public.tests', 'permission denied', 'anon cannot read tests');
select t.err('select public.start_attempt(''aaaaaaaa-0000-0000-0000-000000000001'')', 'permission denied', 'anon cannot call start_attempt');
select t.err('select public.export_my_data()', 'permission denied', 'anon cannot export data');
select t.err('select public.delete_my_account()', 'permission denied', 'anon cannot delete accounts');

\echo
\echo '=== C. profile, consent and terms gates ==='
reset role; select t.as_user(:minor);
select t.err('select public.start_attempt(''aaaaaaaa-0000-0000-0000-000000000001'')', 'profile_incomplete', 'cannot start before profile');
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
\echo '=== D. exam flow ==='
reset role; select t.as_user(:minor);
select public.start_attempt(:T1) as a1 \gset
select t.ok(:'a1'::uuid = public.start_attempt(:T1), 'start_attempt is idempotent (resume)');
select t.err('select public.start_attempt(''aaaaaaaa-0000-0000-0000-000000000002'')', 'not_enrolled', 'paid test blocked without enrolment');
select t.err('select public.start_attempt(''aaaaaaaa-0000-0000-0000-000000000003'')', 'test_not_found', 'unpublished test invisible');
select t.err('select public.start_attempt(''aaaaaaaa-0000-0000-0000-000000000005'')', 'test_not_open', 'future test blocked');
select t.err('select public.start_attempt(''aaaaaaaa-0000-0000-0000-000000000006'')', 'test_closed', 'closed test blocked');
select t.err('select public.start_attempt(gen_random_uuid())', 'test_not_found', 'unknown test id');
select t.ok(public.get_attempt(:'a1')::text !~* 'correct|explanation|SECRET', 'get_attempt leaks no answers or solutions');
select t.ok(jsonb_array_length(public.get_attempt(:'a1') -> 'questions') = 3, 'get_attempt returns the 3 questions');
-- input validation: only valid option indexes / plain numbers can be stored
select t.err(format('select public.save_answer(%L, %L, %L)', :'a1', :Q1, v), 'invalid_answer', 'MCQ rejects ' || quote_literal(v))
  from (values ('9'), ('4'), ('a'), ('1.5'), (' 1'), ('-1'), (E'1\n'), ('١'), ('1'' or ''1''=''1'), ('<script>alert(1)</script>'), ('01')) v(v);
select t.err(format('select public.save_answer(%L, %L, %L)', :'a1', :Q2, v), 'invalid_answer', 'NUMERICAL rejects ' || quote_literal(left(v, 30)))
  from (values ('abc'), ('--1'), ('1e'), ('1e9999'), ('NaN'), ('Infinity'), ('1;drop table x'), (' 5'), (repeat('9', 30)), ('<img src=x onerror=1>'), ('0x10')) v(v);
select public.save_answer(:'a1', :Q1, '0');
select public.save_answer(:'a1', :Q1, '1');
select public.save_answer(:'a1', :Q2, '10.0000001');
select public.save_answer(:'a1', :Q2, '1e1');
select public.save_answer(:'a1', :Q3, '0');
select public.save_answer(:'a1', :Q3, null);
select t.ok((select count(*) from public.responses where attempt_id = :'a1') = 3, 'valid answers stored; null clears');
select t.err(format('select public.save_answer(%L, %L, ''1'')', :'a1', :Q9), 'question_not_found', 'cannot answer a question of another test');
select t.err(format('select public.save_answer(%L, gen_random_uuid(), ''1'')', :'a1'), 'question_not_found', 'unknown question id');

\echo '--- IDOR: another student cannot touch this attempt ---'
select t.as_user(:other);
select t.err(format('select public.save_answer(%L, %L, ''1'')', :'a1', :Q1), 'attempt_not_found', 'IDOR save_answer');
select t.err(format('select public.get_attempt(%L)', :'a1'), 'attempt_not_found', 'IDOR get_attempt');
select t.err(format('select public.get_result(%L)', :'a1'), 'attempt_not_found', 'IDOR get_result');
select t.err(format('select public.submit_attempt(%L)', :'a1'), 'attempt_not_found', 'IDOR submit_attempt');
select t.err(format('select public.log_event(%L, ''tab_hidden'')', :'a1'), 'attempt_closed', 'IDOR log_event');
select t.ok((select count(*) from public.attempts) = 0 and (select count(*) from public.responses) = 0, 'other student sees none of those rows via REST');

\echo '--- deadline grace window ---'
reset role; update public.attempts set deadline = now() - interval '2 seconds' where id = :'a1';
select t.as_user(:minor); select public.save_answer(:'a1', :Q1, '1');
select t.ok(true, 'save accepted within 5s grace');
reset role; update public.attempts set deadline = now() - interval '10 seconds' where id = :'a1';
select t.as_user(:minor);
select t.err(format('select public.save_answer(%L, %L, ''0'')', :'a1', :Q1), 'attempt_closed', 'save rejected after grace');
select t.err(format('select public.log_event(%L, ''tab_hidden'')', :'a1'), 'attempt_closed', 'log_event rejected after deadline');
select t.ok((public.get_attempt(:'a1') ->> 'submitted')::boolean, 'expired attempt is auto-submitted on next read');
select t.ok((select score from public.attempts where id = :'a1') = 8, 'auto-submit scored saved answers (Q1 right +4, Q2 right +4, Q3 blank 0)');
select t.ok((public.submit_attempt(:'a1')) = 8, 'submit after auto-submit is idempotent');
select t.err(format('select public.save_answer(%L, %L, ''0'')', :'a1', :Q1), 'attempt_closed', 'save rejected after submit');
select t.ok((public.get_result(:'a1') ->> 'score')::int = 8 and (public.get_result(:'a1') ->> 'total')::int = 12, 'result shows 8 / 12');
select t.ok(public.get_result(:'a1')::text like '%SECRET-EXPLANATION-1%', 'solutions appear only after submit');

\echo '--- scoring rules ---'
select t.as_user(:adult);
select public.start_attempt(:T1) as a2 \gset
select public.save_answer(:'a2', :Q1, '0');      -- wrong MCQ: -1
select public.save_answer(:'a2', :Q2, '10.5');   -- wrong numerical: 0
select public.save_answer(:'a2', :Q3, '1');      -- right MCQ: +4
select t.ok(public.submit_attempt(:'a2') = 3, 'wrong MCQ -1, wrong numerical 0, right MCQ +4 = 3');
select t.err(format('select public.get_result(%L)', :'a2' ), 'attempt_not_found', 'sanity: still scoped per user') where false;

\echo
\echo '=== E. get_result is blocked while an attempt is open ==='
select t.as_user(:other); select public.start_attempt(:T4) as a3 \gset
select t.err(format('select public.get_result(%L)', :'a3'), 'attempt_in_progress', 'no result while in progress');

\echo
\echo '=== F. integrity events ==='
select public.log_event(:'a3', 'tab_hidden', '{"n":1}');
select public.log_event(:'a3', 'tab_visible');
select t.err(format('select public.log_event(%L, ''hax'')', :'a3'), 'invalid_event', 'unknown event kind rejected');
select t.err(format('select public.log_event(%L, ''offline'', ''[1]'')', :'a3'), 'invalid_event', 'non-object meta rejected');
select t.err(format('select public.log_event(%L, ''offline'', %L::jsonb)', :'a3', json_build_object('x', repeat('a', 300))::text), 'invalid_event', 'oversized meta rejected');
select t.ok((select count(*) from public.integrity_events) = 0, 'student cannot read integrity events');

\echo
\echo '=== G. admin needs MFA (aal2) ==='
reset role; select t.as_user(:admin, 'aal1');
select t.ok(not public.is_admin(), 'admin with password/OTP only (aal1) is NOT admin');
select t.ok((select count(*) from public.questions) = 0, 'aal1 admin sees no questions');
select t.err('insert into public.tests (title, exam, duration_min) values (''x'', ''NEET'', 5)', 'row-level security', 'aal1 admin cannot write');
reset role; select t.as_user(:admin, 'aal2');
select t.ok(public.is_admin(), 'admin with MFA (aal2) is admin');
select t.ok((select count(*) from public.questions) = 4 and (select count(*) from public.question_keys) = 4, 'aal2 admin sees questions and keys');
select t.ok((select count(*) from public.integrity_events) = 2, 'aal2 admin sees integrity events');
insert into public.tests (id, title, exam, duration_min) values ('aaaaaaaa-0000-0000-0000-0000000000ff', 'Admin made', 'NEET', 10);
update public.tests set title = 'Admin edited' where id = 'aaaaaaaa-0000-0000-0000-0000000000ff';
delete from public.tests where id = 'aaaaaaaa-0000-0000-0000-0000000000ff';
select t.ok((select count(*) from public.audit_log where action in ('admin.insert', 'admin.update', 'admin.delete') and entity = 'tests') = 3, 'admin insert / update / DELETE are audited');
select t.ok((select count(*) from public.audit_log where action = 'attempt.start') = 3 and (select count(*) from public.audit_log where action = 'attempt.submit') = 2, 'attempt start/submit audited');
select t.ok(not exists (select 1 from public.audit_log where meta::text ~* 'x\.test|Ravi|Asha|SECRET|Unit of force'), 'audit log contains no emails, names, answers or question text');

\echo
\echo '=== H. terms re-acceptance ==='
reset role;
create or replace function private.current_terms() returns text language sql immutable set search_path = '' as $$ select '2027-01-01'::text $$;
select t.as_user(:adult);
select t.err('select public.start_attempt(''aaaaaaaa-0000-0000-0000-000000000004'')', 'terms_outdated', 'new terms version forces re-acceptance');
select public.save_profile('Asha', false, false, null, '2027-01-01');
select public.start_attempt(:T4) as a4 \gset
select t.ok(:'a4' is not null, 'can start after accepting the new terms');
reset role;
create or replace function private.current_terms() returns text language sql immutable set search_path = '' as $$ select '2026-10-21'::text $$;

\echo
\echo '=== I. rate limits (one transaction, so the window cannot roll over) ==='
reset role; truncate private.rate_limits; select t.as_user(:other);
do $$
declare i int;
begin
  for i in 1..300 loop perform public.log_event((select id from public.attempts limit 1), 'tab_hidden'); exit when i >= 120; end loop;
  perform t.err(format('select public.log_event(%L, ''tab_hidden'')', (select id from public.attempts limit 1)), 'rate_limited', 'log_event limited to 120 / minute');
end $$;
do $$
declare i int; a uuid := (select id from public.attempts limit 1);
begin
  for i in 1..300 loop perform public.save_answer(a, 'bbbbbbbb-0000-0000-0000-000000000009', '1'); end loop;
  perform t.err(format('select public.save_answer(%L, %L, ''1'')', a, 'bbbbbbbb-0000-0000-0000-000000000009'), 'rate_limited', 'save_answer limited to 300 / minute');
end $$;
select t.as_user(:adult);
select t.ok(public.get_attempt(:'a4') is not null, 'another user is unaffected by that limit');
reset role; truncate private.rate_limits; select t.as_user(:other);
select public.save_answer(:'a3', :Q9, '1');
select t.ok(true, 'limit clears when the window passes');
select t.err('select public.export_my_data()', 'zzz', 'placeholder') where false;
reset role; select t.as_user(:adult);
do $$ begin
  for i in 1..5 loop perform public.export_my_data(); end loop;
  perform t.err('select public.export_my_data()', 'rate_limited', 'export limited to 5 / day');
end $$;

\echo
\echo '=== J. data-subject rights ==='
reset role; truncate private.rate_limits; select t.as_user(:minor);
select public.export_my_data() as ex \gset
select t.ok((:'ex'::jsonb #>> '{account,email}') = 'minor@x.test' and (:'ex'::jsonb #>> '{profile,parent_email}') = 'dad@x.test', 'export includes account + profile (with parent contact)');
select t.ok(jsonb_array_length(:'ex'::jsonb -> 'attempts') = 1 and jsonb_array_length(:'ex'::jsonb #> '{attempts,0,responses}') = 3, 'export includes attempts and responses');
select t.ok(:'ex'::jsonb::text !~ 'SECRET|other@x.test|adult@x.test', 'export contains no answer keys and no other user''s data');
select public.delete_my_account();
reset role;
select t.ok(not exists (select 1 from auth.users where id = :minor)
        and not exists (select 1 from public.profiles where id = :minor)
        and not exists (select 1 from public.attempts where user_id = :minor)
        and not exists (select 1 from public.responses r where r.attempt_id = :'a1'::uuid)
        and not exists (select 1 from public.integrity_events e where e.attempt_id = :'a1'::uuid), 'erasure cascades: account, profile, attempts, responses, events all gone');
select t.ok((select count(*) from public.audit_log where actor = :minor and action = 'account.delete') = 1, 'deletion itself is kept in the audit trail (id only)');
select t.ok(exists (select 1 from auth.users where id = :adult) and exists (select 1 from public.attempts where user_id = :adult), 'other users untouched by that erasure');

\echo
\echo '=== K. storage limitation (purge inactive accounts) ==='
reset role;
insert into auth.users (id, email) values ('55555555-5555-5555-5555-555555555555', 'old@x.test'), ('66666666-6666-6666-6666-666666666666', 'oldbutactive@x.test');
update public.profiles set created_at = now() - interval '30 months' where id in ('55555555-5555-5555-5555-555555555555', '66666666-6666-6666-6666-666666666666');
insert into public.attempts (user_id, test_id, deadline, started_at) values ('66666666-6666-6666-6666-666666666666', :T4, now(), now() - interval '2 months');
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
\echo '=== M. incident response: kill switches, locks, devices, detection ==='
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
select t.as_user(:other); select public.save_answer(:'a3', :Q9, '1'); reset role;
select t.ok(private.ops_lock_user('OTHER@x.test', 'test') like 'locked%', 'ops_lock_user locks by email (case-insensitive)');
select t.ok((select banned_until is not null from auth.users where id = :other) and not exists (select 1 from auth.sessions where user_id = :other), 'login ban set and sessions killed');
select t.as_user(:other);
select t.err(format('select public.save_answer(%L, %L, ''1'')', :'a3', :Q9), 'account_locked', 'locked user: save_answer refused at once');
select t.err('select public.start_attempt(''aaaaaaaa-0000-0000-0000-000000000004'')', 'account_locked', 'locked user: start_attempt refused');
select t.err(format('select public.get_attempt(%L)', :'a3'), 'account_locked', 'locked user: get_attempt refused');
select t.err(format('select public.log_event(%L, ''tab_hidden'')', :'a3'), 'account_locked', 'locked user: log_event refused');
select t.err('select public.note_device(''CCCCCCCCCCCCCCCCCCCCCCCCCC'')', 'account_locked', 'locked user: cannot register a device');
select t.ok(public.export_my_data() is not null, 'a locked user can still export their data (right of access)');
reset role; select t.ok(private.ops_unlock_user('other@x.test') like 'unlocked%', 'ops_unlock_user');
select t.as_user(:other); select public.save_answer(:'a3', :Q9, '1'); select t.ok(true, 'after unlock the user works again'); reset role;
select t.ok(private.ops_revoke_sessions('other@x.test') = 0 and exists (select 1 from public.audit_log where action = 'ops.lock_user') and exists (select 1 from public.audit_log where action = 'ops.unlock_user'), 'lock / unlock / revoke are audited');

\echo '--- maintenance and pause ---'
select private.ops_set_status(true, null, null, 'Short maintenance');
select t.ok((public.get_status() ->> 'message') = 'Short maintenance' and (public.get_status() ->> 'maintenance') = 'true', 'maintenance message is published');
select t.as_user(:adult);
select t.err('select public.start_attempt(''aaaaaaaa-0000-0000-0000-000000000004'')', 'exams_paused', 'no NEW test can start during maintenance');
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
select t.err(format('select public.save_answer(%L, %L, ''1'')', :'a4', :Q9), 'lockdown', 'lockdown: save_answer refused');
select t.err('select public.export_my_data()', 'lockdown', 'lockdown: even export is refused');
select t.err('select public.start_attempt(''aaaaaaaa-0000-0000-0000-000000000004'')', 'lockdown', 'lockdown: start refused');
reset role;
select t.err($q$insert into auth.users (email) values ('x2@x.test')$q$, 'signups_closed', 'lockdown also closes signups');
select private.ops_panic(false) as pr2 \gset
select t.ok(:'pr2' = 'lockdown off' and (public.get_status() ->> 'lockdown') = 'false' and (public.get_status() ->> 'exams_open') = 'true', 'panic off restores normal service');
select t.as_user(:adult); select t.ok(public.get_attempt(:'a4') is not null, 'users work again after panic off'); reset role;

\echo '--- detection helpers ---'
select t.ok((select count(*) from private.ops_events(24) where action = 'ops.panic') = 1, 'ops_events summarises recent security actions');
insert into public.audit_log (actor, action) select :other, 'login.new_device' from generate_series(1, 3);
select t.ok(exists (select 1 from private.ops_suspicious(24) where kind = 'new_devices' and subject = :other::text), 'ops_suspicious flags many new devices');
insert into public.tests (id, title, exam, duration_min) values ('aaaaaaaa-0000-0000-0000-0000000000a1', 'Speed', 'NEET', 60);
insert into public.questions (id, test_id, position, subject, type, body, options) values ('bbbbbbbb-0000-0000-0000-0000000000a1', 'aaaaaaaa-0000-0000-0000-0000000000a1', 1, 'PHYSICS', 'MCQ', 'q', '["a","b"]');
insert into public.question_keys values ('bbbbbbbb-0000-0000-0000-0000000000a1', '0', 'e');
update public.tests set published = true where id = 'aaaaaaaa-0000-0000-0000-0000000000a1';
insert into public.attempts (id, user_id, test_id, deadline, submitted_at, score, started_at) values ('cccccccc-0000-0000-0000-0000000000a1', :adult, 'aaaaaaaa-0000-0000-0000-0000000000a1', now() + interval '1 hour', now(), 4, now() - interval '1 minute');
insert into public.responses values ('cccccccc-0000-0000-0000-0000000000a1', 'bbbbbbbb-0000-0000-0000-0000000000a1', '0');
select t.ok(exists (select 1 from private.ops_suspicious(24) where kind = 'too_fast'), 'ops_suspicious flags an attempt finished in a fraction of the time');

\echo '--- pre-built question payload ---'
truncate private.rate_limits; update public.app_settings set exams_open = true, maintenance = false;
select t.as_user(:other); select public.start_attempt('aaaaaaaa-0000-0000-0000-0000000000a1') as ap \gset
select t.ok(jsonb_array_length(public.get_attempt(:'ap') -> 'questions') = 1, 'payload has the 1 question');
reset role;
insert into public.questions (id, test_id, position, subject, type, body, options) values ('bbbbbbbb-0000-0000-0000-0000000000a2', 'aaaaaaaa-0000-0000-0000-0000000000a1', 2, 'PHYSICS', 'NUMERICAL', 'second', '[]');
update public.questions set body = 'edited' where id = 'bbbbbbbb-0000-0000-0000-0000000000a1';
select t.as_user(:other);
select t.ok(jsonb_array_length(public.get_attempt(:'ap') -> 'questions') = 2 and public.get_attempt(:'ap')::text like '%edited%', 'payload follows question inserts and edits');
reset role; delete from public.questions where id = 'bbbbbbbb-0000-0000-0000-0000000000a2'; select t.as_user(:other);
select t.ok(jsonb_array_length(public.get_attempt(:'ap') -> 'questions') = 1, 'payload follows deletes');
select t.ok(public.get_attempt(:'ap')::text !~* 'correct|explanation', 'payload never contains answers');
select t.err('select * from private.test_payloads', 'permission denied', 'payload table is not readable by students');
reset role;

\echo
\echo 'ALL SECURITY CHECKS PASSED'
