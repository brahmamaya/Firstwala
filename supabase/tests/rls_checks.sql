\set ON_ERROR_STOP off
\set u1 '''11111111-1111-1111-1111-111111111111'''
\set u2 '''22222222-2222-2222-2222-222222222222'''
\set u3 '''33333333-3333-3333-3333-333333333333'''

-- fixtures (as superuser) -------------------------------------------------
insert into auth.users (id, email) values (:u1, 'a@x'), (:u2, 'b@x'), (:u3, 'admin@x');
update public.profiles set role = 'admin' where id = :u3;
insert into public.tests (id, title, exam, duration_min, published, is_free) values
  ('aaaaaaaa-0000-0000-0000-000000000001', 'Free test',  'JEE_MAIN', 30, true,  true),
  ('aaaaaaaa-0000-0000-0000-000000000002', 'Paid test',  'JEE_MAIN', 30, true,  false),
  ('aaaaaaaa-0000-0000-0000-000000000003', 'Draft test', 'JEE_MAIN', 30, false, true),
  ('aaaaaaaa-0000-0000-0000-000000000004', 'Free test 2','NEET',     30, true,  true);
insert into public.questions (id, test_id, position, subject, type, body, options) values
  ('bbbbbbbb-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001', 1, 'PHYSICS', 'MCQ',       'Unit of force?', '["J","N","W","Pa"]'),
  ('bbbbbbbb-0000-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000001', 2, 'PHYSICS', 'NUMERICAL', 'F = 2*5 ?', '[]'),
  ('bbbbbbbb-0000-0000-0000-000000000003', 'aaaaaaaa-0000-0000-0000-000000000001', 3, 'MATHS',   'MCQ',       'd/dx x^2?', '["x","2x","x2","2"]'),
  ('bbbbbbbb-0000-0000-0000-000000000009', 'aaaaaaaa-0000-0000-0000-000000000004', 1, 'BIOLOGY', 'MCQ',       'Powerhouse?', '["Nucleus","Mitochondria"]');
insert into public.question_keys values
  ('bbbbbbbb-0000-0000-0000-000000000001', '1',  'F=ma'),
  ('bbbbbbbb-0000-0000-0000-000000000002', '10', 'm*a'),
  ('bbbbbbbb-0000-0000-0000-000000000003', '1',  'power rule'),
  ('bbbbbbbb-0000-0000-0000-000000000009', '1',  'ATP');

\echo
\echo '== 1. student cannot touch protected tables'
set role authenticated; set request.jwt.claim.sub = :u1;
select count(*) from public.questions;
select count(*) from public.question_keys;
insert into public.attempts (user_id, test_id, deadline) values (:u1, 'aaaaaaaa-0000-0000-0000-000000000001', now() + interval '1 day');
update public.profiles set role = 'admin' where id = :u1;
update public.profiles set parent_consent_at = now() where id = :u1;
update public.profiles set display_name = 'Ravi' where id = :u1;   -- must be denied: profile writes go through save_profile()
select 'student sees ' || count(*) || ' published tests (expect 3)' from public.tests;

\echo '== 2. anonymous cannot call RPCs'
reset role; set role anon;
select public.start_attempt('aaaaaaaa-0000-0000-0000-000000000001');

\echo '== 3. profile gate, start / resume / entitlements'
reset role; set role authenticated; set request.jwt.claim.sub = :u1;
select public.start_attempt('aaaaaaaa-0000-0000-0000-000000000001');                 -- profile_incomplete
select public.save_profile('Ravi', true, false);                                    -- consent_required
select public.save_profile('', false, false);                                       -- invalid_name
select public.save_profile('Ravi', true, true);
select (is_minor and parent_consent_at is not null) as "minor consent recorded (expect t)" from public.profiles where id = :u1;
select public.start_attempt('aaaaaaaa-0000-0000-0000-000000000001') as a1 \gset
select :'a1' = public.start_attempt('aaaaaaaa-0000-0000-0000-000000000001')::text as "resume returns same attempt (expect t)";
select public.start_attempt('aaaaaaaa-0000-0000-0000-000000000002');
select public.start_attempt('aaaaaaaa-0000-0000-0000-000000000003');

\echo '== 4. get_attempt leaks nothing'
select public.get_attempt(:'a1')::text !~* 'correct|explanation|F=ma|power rule' as "no answers in payload (expect t)";
select jsonb_array_length(public.get_attempt(:'a1')->'questions') as "question count (expect 3)";

\echo '== 5. save_answer rules'
select public.save_answer(:'a1', 'bbbbbbbb-0000-0000-0000-000000000001', '0');
select public.save_answer(:'a1', 'bbbbbbbb-0000-0000-0000-000000000001', '1');   -- overwrite with correct
select public.save_answer(:'a1', 'bbbbbbbb-0000-0000-0000-000000000002', '10.0000001');
select public.save_answer(:'a1', 'bbbbbbbb-0000-0000-0000-000000000009', '1');   -- question from another test
select public.save_answer(:'a1', 'bbbbbbbb-0000-0000-0000-000000000001', repeat('9', 40));
reset role; set role authenticated; set request.jwt.claim.sub = :u2;
select public.save_answer(:'a1', 'bbbbbbbb-0000-0000-0000-000000000001', '3');   -- someone else's attempt
select public.get_attempt(:'a1');
select public.get_result(:'a1');
select 'u2 sees ' || count(*) || ' attempts of others (expect 0)' from public.attempts;

\echo '== 6. result hidden until submit; submit idempotent'
reset role; set role authenticated; set request.jwt.claim.sub = :u1;
select public.get_result(:'a1');
select public.submit_attempt(:'a1') as "score (expect 8)";
select public.submit_attempt(:'a1') as "score again (expect 8)";
select public.save_answer(:'a1', 'bbbbbbbb-0000-0000-0000-000000000003', '1');
select (public.get_result(:'a1')->>'score') || '/' || (public.get_result(:'a1')->>'total') as "score/total (expect 8/12)";
select q->>'correct_answer' as correct, q->>'your_answer' as mine, q->>'points' as pts
  from jsonb_array_elements(public.get_result(:'a1')->'questions') q;
select public.get_attempt(:'a1')->>'submitted' as "get_attempt after submit (expect true)";

\echo '== 7. negative marking, bad numeric input'
reset role; set role authenticated; set request.jwt.claim.sub = :u2;
select public.save_profile('Asha', false, false);
select public.start_attempt('aaaaaaaa-0000-0000-0000-000000000001') as a2 \gset
select public.save_answer(:'a2', 'bbbbbbbb-0000-0000-0000-000000000001', '0');
select public.save_answer(:'a2', 'bbbbbbbb-0000-0000-0000-000000000002', 'abc');
select public.submit_attempt(:'a2') as "score (expect -1)";

\echo '== 8. server deadline'
reset role;
set role authenticated; set request.jwt.claim.sub = :u2;
select public.start_attempt('aaaaaaaa-0000-0000-0000-000000000004') as a3 \gset
reset role;
update public.attempts set deadline = now() - interval '1 minute' where id = :'a3';
set role authenticated; set request.jwt.claim.sub = :u2;
select public.save_answer(:'a3', 'bbbbbbbb-0000-0000-0000-000000000009', '1');
select public.get_attempt(:'a3')->>'submitted' as "auto-submitted after deadline (expect true)";

\echo '== 9. admin'
reset role; set role authenticated; set request.jwt.claim.sub = :u3;
select public.is_admin() as "is_admin (expect t)";
select count(*) as "admin sees questions (expect 4)" from public.questions;
select count(*) as "admin sees keys (expect 4)" from public.question_keys;
reset role; set role authenticated; set request.jwt.claim.sub = :u1;
select public.is_admin() as "student is_admin (expect f)";
