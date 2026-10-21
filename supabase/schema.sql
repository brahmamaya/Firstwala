-- Physica Test Series: Supabase schema (v2, hardened)
-- Run once in the Supabase SQL editor. Safe to re-run (IF NOT EXISTS / OR REPLACE).
--
-- Security model (defence in depth)
--   1. Students NEVER touch questions / answers / attempts tables directly. They call SECURITY DEFINER RPCs that
--      check auth.uid(), attempt ownership, state and deadline. Correct answers live in a separate table.
--   2. Internal helpers live in schema `private` (not exposed by the API at all, so they have no endpoint to attack).
--   3. Every definer function pins `search_path = ''` (no schema-hijack) and uses parameters only (no dynamic SQL).
--   4. Inputs are validated by type (MCQ index range, numeric format, lengths) before they are stored.
--   5. Per-user rate limits in the database, on top of Supabase Auth's own limits.
--   6. Append-only audit log (who/what/when, no personal content) for incident response (CERT-In: keep >= 180 days).
--   7. Admin powers need a verified MFA session (aal2), not just role = 'admin'.
--   8. Data-subject rights: export_my_data(), delete_my_account(). Purge of inactive accounts: private.purge_inactive().
--   9. Minors: parental consent + parent contact recorded; no analytics identifiers are stored (DPDP Act 2023, s.9).

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

-- Future objects created by the owner role get no API privileges unless granted explicitly.
alter default privileges for role postgres in schema public revoke all on tables    from anon, authenticated;
alter default privileges for role postgres in schema public revoke all on sequences from anon, authenticated;
alter default privileges for role postgres in schema public revoke all on functions from public, anon, authenticated;

-- ============================================================ constants
-- Bump when the Terms or Privacy Policy change materially; users must re-accept before their next test.
create or replace function private.current_terms() returns text
language sql immutable set search_path = '' as $$ select '2026-10-21'::text $$;

-- ============================================================ tables
create table if not exists public.profiles (
  id                uuid primary key references auth.users (id) on delete cascade,
  display_name      text check (char_length(display_name) <= 80),
  role              text not null default 'student' check (role in ('student', 'admin')),
  is_minor          boolean,
  parent_email      text check (parent_email is null or (char_length(parent_email) <= 254 and parent_email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$')),
  parent_consent_at timestamptz,
  terms_version     text,
  terms_accepted_at timestamptz,
  created_at        timestamptz not null default now()
);

create table if not exists public.tests (
  id           uuid primary key default gen_random_uuid(),
  title        text not null check (char_length(title) <= 200),
  exam         text not null check (exam in ('JEE_MAIN', 'JEE_ADV', 'NEET')),
  duration_min int  not null check (duration_min between 1 and 360),
  is_free      boolean not null default true,
  published    boolean not null default false,
  opens_at     timestamptz,
  closes_at    timestamptz,
  created_at   timestamptz not null default now()
);

create table if not exists public.questions (
  id        uuid primary key default gen_random_uuid(),
  test_id   uuid not null references public.tests (id) on delete cascade,
  position  int  not null,
  subject   text not null check (subject in ('PHYSICS', 'CHEMISTRY', 'MATHS', 'BIOLOGY')),
  type      text not null check (type in ('MCQ', 'NUMERICAL')),
  body      text not null check (char_length(body) <= 5000),
  options   jsonb not null default '[]' check (jsonb_typeof(options) = 'array' and jsonb_array_length(options) <= 8),
  marks     int not null default 4 check (marks between 0 and 20),
  negative  int not null default 1 check (negative between 0 and 20),
  unique (test_id, position)
);

-- Answers/solutions are kept apart so no future "select *" policy can leak them.
create table if not exists public.question_keys (
  question_id    uuid primary key references public.questions (id) on delete cascade,
  correct_answer text not null check (char_length(correct_answer) <= 32),
  explanation    text check (char_length(explanation) <= 5000)
);

create table if not exists public.enrollments (   -- written by the payment webhook (service role) later
  user_id    uuid not null references auth.users (id) on delete cascade,
  test_id    uuid not null references public.tests (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, test_id)
);

create table if not exists public.attempts (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  test_id      uuid not null references public.tests (id),
  started_at   timestamptz not null default now(),
  deadline     timestamptz not null,
  submitted_at timestamptz,
  score        int,
  unique (user_id, test_id)
);

create table if not exists public.responses (
  attempt_id  uuid not null references public.attempts (id) on delete cascade,
  question_id uuid not null references public.questions (id) on delete cascade,
  answer      text check (char_length(answer) <= 32),
  updated_at  timestamptz not null default now(),
  primary key (attempt_id, question_id)
);

-- Exam-integrity signals (tab switches etc.). Only admins can read them; students only append via log_event().
create table if not exists public.integrity_events (
  id         bigint generated always as identity primary key,
  attempt_id uuid not null references public.attempts (id) on delete cascade,
  kind       text not null check (kind in ('tab_hidden', 'tab_visible', 'copy_attempt', 'offline', 'online')),
  at         timestamptz not null default now(),
  meta       jsonb not null default '{}' check (octet_length(meta::text) <= 200)
);

-- Append-only security/audit trail. Holds ids and actions, never answers or personal content.
create table if not exists public.audit_log (
  id        bigint generated always as identity primary key,
  at        timestamptz not null default now(),
  actor     uuid,                       -- no FK on purpose: survives account deletion (pseudonymous)
  action    text not null,
  entity    text,
  entity_id text,
  meta      jsonb not null default '{}'
);

create unlogged table if not exists private.rate_limits (
  key          text not null,
  window_start timestamptz not null,
  n            int not null default 0,
  primary key (key, window_start)
);

create index if not exists questions_test_idx     on public.questions (test_id, position);
create index if not exists attempts_user_idx      on public.attempts (user_id);
create index if not exists attempts_test_idx      on public.attempts (test_id);
create index if not exists responses_question_idx on public.responses (question_id);
create index if not exists enrollments_test_idx   on public.enrollments (test_id);
create index if not exists integrity_attempt_idx  on public.integrity_events (attempt_id);
create index if not exists audit_at_idx           on public.audit_log (at);
create index if not exists audit_actor_idx        on public.audit_log (actor);

-- ============================================================ auth triggers + helpers
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id) values (new.id) on conflict do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Admin = role 'admin' AND a verified MFA session (aal2). A stolen password / OTP alone is not enough.
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'admin')
     and coalesce((select auth.jwt() ->> 'aal'), '') = 'aal2';
$$;

create or replace function private.audit(p_action text, p_entity text default null, p_entity_id text default null, p_meta jsonb default '{}')
returns void language sql security definer set search_path = '' as $$
  insert into public.audit_log (actor, action, entity, entity_id, meta) values ((select auth.uid()), p_action, p_entity, p_entity_id, coalesce(p_meta, '{}'));
$$;

-- Admin edits to content are audited automatically (the row id only, never the question text or answers).
create or replace function private.audit_trigger() returns trigger
language plpgsql security definer set search_path = '' as $$
declare r jsonb := case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end;
begin
  perform private.audit('admin.' || lower(tg_op), tg_table_name, coalesce(r ->> 'id', r ->> 'question_id'));
  return coalesce(new, old);
end $$;
drop trigger if exists audit_tests on public.tests;
drop trigger if exists audit_questions on public.questions;
drop trigger if exists audit_question_keys on public.question_keys;
create trigger audit_tests         after insert or update or delete on public.tests         for each row execute function private.audit_trigger();
create trigger audit_questions     after insert or update or delete on public.questions     for each row execute function private.audit_trigger();
create trigger audit_question_keys after insert or update or delete on public.question_keys for each row execute function private.audit_trigger();

-- Fixed-window per-key limiter. Raises 'rate_limited'. (An over-limit call rolls back its own increment, which is fine.)
create or replace function private.rate_limit(p_key text, p_max int, p_window interval) returns void
language plpgsql security definer set search_path = '' as $$
declare w timestamptz := date_bin(p_window, now(), timestamptz 'epoch'); c int;
begin
  insert into private.rate_limits as r (key, window_start, n) values (p_key, w, 1)
  on conflict (key, window_start) do update set n = r.n + 1 returning n into c;
  if c > p_max then raise exception 'rate_limited' using errcode = 'P0001'; end if;
  if random() < 0.01 then delete from private.rate_limits where window_start < now() - interval '2 days'; end if;
end $$;

create or replace function private.to_num(t text) returns numeric
language plpgsql immutable set search_path = '' as $$
begin return t::numeric; exception when others then return null; end $$;

create or replace function private.score_answer(p_type text, p_correct text, p_marks int, p_neg int, p_answer text)
returns int language sql immutable set search_path = '' as $$
  select case
    when p_answer is null or btrim(p_answer) = '' then 0
    when p_type = 'NUMERICAL' then
      case when private.to_num(p_answer) is not null and abs(private.to_num(p_answer) - private.to_num(p_correct)) < 0.000001
           then p_marks else 0 end
    else case when p_answer = p_correct then p_marks else -p_neg end
  end
$$;

-- Scores and closes an attempt. Idempotent; the row lock makes concurrent submits safe.
create or replace function private.finalize(p_attempt uuid) returns int
language plpgsql security definer set search_path = '' as $$
declare a public.attempts; s int;
begin
  select * into a from public.attempts where id = p_attempt for update;
  if a.submitted_at is not null then return a.score; end if;
  select coalesce(sum(private.score_answer(q.type, k.correct_answer, q.marks, q.negative, r.answer)), 0)::int
    into s
    from public.questions q
    join public.question_keys k on k.question_id = q.id
    left join public.responses r on r.question_id = q.id and r.attempt_id = p_attempt
   where q.test_id = a.test_id;
  update public.attempts set submitted_at = now(), score = s where id = p_attempt;
  perform private.audit('attempt.submit', 'attempt', p_attempt::text, jsonb_build_object('late', now() > a.deadline));
  return s;
end $$;

-- ============================================================ RLS
alter table public.profiles         enable row level security;
alter table public.tests            enable row level security;
alter table public.questions        enable row level security;
alter table public.question_keys    enable row level security;
alter table public.enrollments      enable row level security;
alter table public.attempts         enable row level security;
alter table public.responses        enable row level security;
alter table public.integrity_events enable row level security;
alter table public.audit_log        enable row level security;

drop policy if exists profiles_self_read   on public.profiles;
drop policy if exists profiles_self_update on public.profiles;
create policy profiles_self_read on public.profiles for select to authenticated using (id = (select auth.uid()) or public.is_admin());

drop policy if exists tests_read  on public.tests;
drop policy if exists tests_admin on public.tests;
create policy tests_read  on public.tests for select to authenticated using (published or public.is_admin());
create policy tests_admin on public.tests for all    to authenticated using (public.is_admin()) with check (public.is_admin());

-- questions / question_keys: admin only. Students get them through get_attempt() / get_result().
drop policy if exists questions_admin     on public.questions;
drop policy if exists question_keys_admin on public.question_keys;
create policy questions_admin     on public.questions     for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy question_keys_admin on public.question_keys for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists enrollments_own on public.enrollments;
create policy enrollments_own on public.enrollments for select to authenticated using (user_id = (select auth.uid()) or public.is_admin());

drop policy if exists attempts_own on public.attempts;
create policy attempts_own on public.attempts for select to authenticated using (user_id = (select auth.uid()) or public.is_admin());

drop policy if exists responses_own on public.responses;
create policy responses_own on public.responses for select to authenticated
  using (exists (select 1 from public.attempts a where a.id = attempt_id and (a.user_id = (select auth.uid()) or public.is_admin())));

drop policy if exists integrity_admin on public.integrity_events;
create policy integrity_admin on public.integrity_events for select to authenticated using (public.is_admin());

drop policy if exists audit_admin on public.audit_log;
create policy audit_admin on public.audit_log for select to authenticated using (public.is_admin());

-- Table privileges: deny by default, then grant the minimum (RLS still applies on top).
revoke all on public.profiles, public.tests, public.questions, public.question_keys, public.enrollments,
              public.attempts, public.responses, public.integrity_events, public.audit_log from anon, authenticated;
revoke all on private.rate_limits from anon, authenticated;
grant select on public.profiles, public.tests, public.enrollments, public.attempts, public.responses to authenticated;
grant select on public.integrity_events, public.audit_log to authenticated;                       -- admin-only via RLS
grant select, insert, update, delete on public.tests, public.questions, public.question_keys to authenticated; -- admin-only via RLS

-- ============================================================ client API (RPC)
-- First-login profile. Records acceptance of the current Terms/Privacy. Minors (<18) need a parent/guardian
-- consent + parent contact (DPDP Act 2023, s.9). All of it is written server-side; the browser cannot forge it.
create or replace function public.save_profile(
  p_name text, p_is_minor boolean, p_parent_consent boolean default false,
  p_parent_email text default null, p_terms_version text default null)
returns void language plpgsql security definer set search_path = '' as $$
declare uid uuid := (select auth.uid());
begin
  if uid is null then raise exception 'not_authenticated' using errcode = '28000'; end if;
  perform private.rate_limit('profile:' || uid, 20, interval '1 hour');
  if p_name is null or btrim(p_name) = '' or char_length(p_name) > 80 then raise exception 'invalid_name' using errcode = '22023'; end if;
  if p_is_minor is null then raise exception 'invalid_age' using errcode = '22023'; end if;
  if p_terms_version is distinct from private.current_terms() then raise exception 'terms_outdated' using errcode = 'P0001'; end if;
  if p_is_minor then
    if not coalesce(p_parent_consent, false) then raise exception 'consent_required' using errcode = 'P0001'; end if;
    if p_parent_email is null or char_length(btrim(p_parent_email)) > 254
       or btrim(p_parent_email) !~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' then
      raise exception 'invalid_parent_email' using errcode = '22023';
    end if;
  end if;
  update public.profiles
     set display_name      = btrim(p_name),
         is_minor          = p_is_minor,
         parent_email      = case when p_is_minor then lower(btrim(p_parent_email)) else null end,
         parent_consent_at = case when p_is_minor then coalesce(parent_consent_at, now()) else null end,
         terms_version     = p_terms_version,
         terms_accepted_at = now()
   where id = uid;
  perform private.audit('profile.save', 'profile', uid::text, jsonb_build_object('minor', p_is_minor, 'terms', p_terms_version));
end $$;

create or replace function public.start_attempt(p_test_id uuid) returns uuid
language plpgsql security definer set search_path = '' as $$
declare uid uuid := (select auth.uid()); t public.tests; existing uuid; new_id uuid;
begin
  if uid is null then raise exception 'not_authenticated' using errcode = '28000'; end if;
  perform private.rate_limit('start:' || uid, 30, interval '1 hour');
  select * into t from public.tests where id = p_test_id and published;
  if not found then raise exception 'test_not_found' using errcode = 'P0002'; end if;
  if not exists (select 1 from public.profiles p where p.id = uid and p.is_minor is not null
                   and (not p.is_minor or (p.parent_consent_at is not null and p.parent_email is not null))) then
    raise exception 'profile_incomplete' using errcode = 'P0001';
  end if;
  if not exists (select 1 from public.profiles p where p.id = uid and p.terms_version = private.current_terms()) then
    raise exception 'terms_outdated' using errcode = 'P0001';
  end if;

  select id into existing from public.attempts where user_id = uid and test_id = p_test_id;
  if existing is not null then return existing; end if;                     -- resume

  if t.opens_at  is not null and now() < t.opens_at  then raise exception 'test_not_open' using errcode = 'P0001'; end if;
  if t.closes_at is not null and now() > t.closes_at then raise exception 'test_closed'   using errcode = 'P0001'; end if;
  if not t.is_free and not exists (select 1 from public.enrollments where user_id = uid and test_id = p_test_id) then
    raise exception 'not_enrolled' using errcode = '42501';
  end if;

  insert into public.attempts (user_id, test_id, deadline)
  values (uid, p_test_id, now() + make_interval(mins => t.duration_min))
  on conflict (user_id, test_id) do nothing
  returning id into new_id;
  if new_id is null then
    select id into new_id from public.attempts where user_id = uid and test_id = p_test_id;
  else
    perform private.audit('attempt.start', 'attempt', new_id::text);
  end if;
  return new_id;
end $$;

-- Questions WITHOUT answers, saved answers and the server clock. Auto-submits if the deadline has passed.
create or replace function public.get_attempt(p_attempt uuid) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare uid uuid := (select auth.uid()); a public.attempts; t public.tests;
begin
  if uid is null then raise exception 'not_authenticated' using errcode = '28000'; end if;
  perform private.rate_limit('getattempt:' || uid, 120, interval '1 minute');
  select * into a from public.attempts where id = p_attempt and user_id = uid;
  if not found then raise exception 'attempt_not_found' using errcode = 'P0002'; end if;
  if a.submitted_at is null and now() > a.deadline then perform private.finalize(p_attempt); end if;
  select * into a from public.attempts where id = p_attempt;
  select * into t from public.tests where id = a.test_id;

  if a.submitted_at is not null then
    return jsonb_build_object('submitted', true, 'attempt_id', a.id);
  end if;

  return jsonb_build_object(
    'submitted', false,
    'attempt_id', a.id,
    'title', t.title,
    'deadline', a.deadline,
    'server_now', now(),
    'questions', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'id', q.id, 'position', q.position, 'subject', q.subject, 'type', q.type,
        'body', q.body, 'options', q.options, 'marks', q.marks, 'negative', q.negative
      ) order by q.position), '[]'::jsonb)
      from public.questions q where q.test_id = a.test_id),
    'answers', (
      select coalesce(jsonb_object_agg(r.question_id, r.answer), '{}'::jsonb)
      from public.responses r where r.attempt_id = a.id)
  );
end $$;

create or replace function public.save_answer(p_attempt uuid, p_question uuid, p_answer text) returns void
language plpgsql security definer set search_path = '' as $$
declare uid uuid := (select auth.uid()); a public.attempts; q public.questions;
begin
  if uid is null then raise exception 'not_authenticated' using errcode = '28000'; end if;
  perform private.rate_limit('save:' || uid, 300, interval '1 minute');
  -- FOR SHARE conflicts with finalize()'s FOR UPDATE: a save either lands before the score is computed (and counts)
  -- or sees the attempt as submitted (and is rejected). The stored answers can never disagree with the score.
  select * into a from public.attempts where id = p_attempt and user_id = uid for share;
  if not found then raise exception 'attempt_not_found' using errcode = 'P0002'; end if;
  if a.submitted_at is not null or now() > a.deadline + interval '5 seconds' then
    raise exception 'attempt_closed' using errcode = 'P0001';
  end if;
  select * into q from public.questions where id = p_question and test_id = a.test_id;
  if not found then raise exception 'question_not_found' using errcode = 'P0002'; end if;
  -- Strict, type-aware validation: nothing but a valid option index or a plain number is ever stored.
  if p_answer is not null then
    if q.type = 'MCQ' then
      if p_answer !~ '^[0-9]$' or p_answer::int >= jsonb_array_length(q.options) then raise exception 'invalid_answer' using errcode = '22023'; end if;
    elsif char_length(p_answer) > 24 or p_answer !~ '^-?[0-9]+(\.[0-9]+)?([eE][-+]?[0-9]{1,3})?$' then
      raise exception 'invalid_answer' using errcode = '22023';
    end if;
  end if;
  insert into public.responses (attempt_id, question_id, answer)
  values (p_attempt, p_question, p_answer)
  on conflict (attempt_id, question_id) do update set answer = excluded.answer, updated_at = now();
end $$;

create or replace function public.submit_attempt(p_attempt uuid) returns int
language plpgsql security definer set search_path = '' as $$
declare uid uuid := (select auth.uid());
begin
  if uid is null then raise exception 'not_authenticated' using errcode = '28000'; end if;
  perform private.rate_limit('submit:' || uid, 30, interval '1 minute');
  if not exists (select 1 from public.attempts where id = p_attempt and user_id = uid) then
    raise exception 'attempt_not_found' using errcode = 'P0002';
  end if;
  return private.finalize(p_attempt);          -- idempotent; audits the first (and only) real submit
end $$;

-- Answers + solutions, only after submission.
create or replace function public.get_result(p_attempt uuid) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare uid uuid := (select auth.uid()); a public.attempts; t public.tests;
begin
  if uid is null then raise exception 'not_authenticated' using errcode = '28000'; end if;
  perform private.rate_limit('result:' || uid, 60, interval '1 minute');
  select * into a from public.attempts where id = p_attempt and user_id = uid;
  if not found then raise exception 'attempt_not_found' using errcode = 'P0002'; end if;
  if a.submitted_at is null then raise exception 'attempt_in_progress' using errcode = 'P0001'; end if;
  select * into t from public.tests where id = a.test_id;
  return jsonb_build_object(
    'title', t.title, 'score', a.score,
    'total', (select coalesce(sum(marks), 0) from public.questions where test_id = a.test_id),
    'questions', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'id', q.id, 'position', q.position, 'subject', q.subject, 'type', q.type, 'body', q.body,
        'options', q.options, 'marks', q.marks, 'negative', q.negative,
        'your_answer', r.answer, 'correct_answer', k.correct_answer, 'explanation', k.explanation,
        'points', private.score_answer(q.type, k.correct_answer, q.marks, q.negative, r.answer)
      ) order by q.position), '[]'::jsonb)
      from public.questions q
      join public.question_keys k on k.question_id = q.id
      left join public.responses r on r.question_id = q.id and r.attempt_id = a.id
      where q.test_id = a.test_id));
end $$;

-- Exam-integrity signal from the browser (tab hidden, copy attempt ...). Advisory only; never changes a score by itself.
create or replace function public.log_event(p_attempt uuid, p_kind text, p_meta jsonb default '{}') returns void
language plpgsql security definer set search_path = '' as $$
declare uid uuid := (select auth.uid());
begin
  if uid is null then raise exception 'not_authenticated' using errcode = '28000'; end if;
  perform private.rate_limit('event:' || uid, 120, interval '1 minute');
  if p_kind not in ('tab_hidden', 'tab_visible', 'copy_attempt', 'offline', 'online') then raise exception 'invalid_event' using errcode = '22023'; end if;
  if p_meta is null or jsonb_typeof(p_meta) <> 'object' or octet_length(p_meta::text) > 200 then raise exception 'invalid_event' using errcode = '22023'; end if;
  if not exists (select 1 from public.attempts where id = p_attempt and user_id = uid and submitted_at is null and now() <= deadline + interval '5 seconds') then
    raise exception 'attempt_closed' using errcode = 'P0001';
  end if;
  insert into public.integrity_events (attempt_id, kind, meta) values (p_attempt, p_kind, p_meta);
end $$;

-- DPDP rights: access / portability. Returns everything we hold about the caller as JSON.
create or replace function public.export_my_data() returns jsonb
language plpgsql security definer set search_path = '' as $$
declare uid uuid := (select auth.uid()); out jsonb;
begin
  if uid is null then raise exception 'not_authenticated' using errcode = '28000'; end if;
  perform private.rate_limit('export:' || uid, 5, interval '1 day');
  select jsonb_build_object(
    'exported_at', now(),
    'account', (select jsonb_build_object('id', u.id, 'email', u.email) from auth.users u where u.id = uid),
    'profile', (select to_jsonb(p) from public.profiles p where p.id = uid),
    'enrollments', (select coalesce(jsonb_agg(to_jsonb(e)), '[]') from public.enrollments e where e.user_id = uid),
    'attempts', (select coalesce(jsonb_agg(jsonb_build_object(
        'attempt', to_jsonb(a),
        'responses', (select coalesce(jsonb_agg(jsonb_build_object('question_id', r.question_id, 'answer', r.answer, 'updated_at', r.updated_at)), '[]') from public.responses r where r.attempt_id = a.id),
        'integrity_events', (select coalesce(jsonb_agg(jsonb_build_object('kind', i.kind, 'at', i.at)), '[]') from public.integrity_events i where i.attempt_id = a.id)
      )), '[]') from public.attempts a where a.user_id = uid),
    'audit', (select coalesce(jsonb_agg(jsonb_build_object('at', l.at, 'action', l.action, 'entity', l.entity)), '[]') from public.audit_log l where l.actor = uid)
  ) into out;
  perform private.audit('account.export');
  return out;
end $$;

-- DPDP rights: erasure. Deletes the auth user; profile, attempts, responses, integrity events and enrollments cascade.
-- The audit trail keeps only the pseudonymous id + action names (security/legal record).
create or replace function public.delete_my_account() returns void
language plpgsql security definer set search_path = '' as $$
declare uid uuid := (select auth.uid());
begin
  if uid is null then raise exception 'not_authenticated' using errcode = '28000'; end if;
  perform private.rate_limit('delete:' || uid, 3, interval '1 day');
  perform private.audit('account.delete');
  delete from auth.users where id = uid;
end $$;

-- Storage limitation: remove student accounts with no test activity for N months (run monthly via pg_cron, see README).
create or replace function private.purge_inactive(p_months int default 24) returns int
language plpgsql security definer set search_path = '' as $$
declare n int;
begin
  if p_months < 6 then raise exception 'too_aggressive'; end if;
  with doomed as (
    select p.id from public.profiles p
     where p.role = 'student'
       and greatest(p.created_at, coalesce((select max(a.started_at) from public.attempts a where a.user_id = p.id), p.created_at))
           < now() - make_interval(months => p_months)
  ), del as (delete from auth.users u using doomed d where u.id = d.id returning u.id)
  select count(*) into n from del;
  insert into public.audit_log (action, meta) values ('system.purge_inactive', jsonb_build_object('months', p_months, 'deleted', n));
  return n;
end $$;

-- ============================================================ function privileges
revoke all on all functions in schema private from public, anon, authenticated;
revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.is_admin() from public, anon;
revoke all on function public.save_profile(text, boolean, boolean, text, text), public.start_attempt(uuid), public.get_attempt(uuid),
                       public.save_answer(uuid, uuid, text), public.submit_attempt(uuid), public.get_result(uuid),
                       public.log_event(uuid, text, jsonb), public.export_my_data(), public.delete_my_account() from public, anon;
grant execute on function public.is_admin(), public.save_profile(text, boolean, boolean, text, text), public.start_attempt(uuid),
                          public.get_attempt(uuid), public.save_answer(uuid, uuid, text), public.submit_attempt(uuid),
                          public.get_result(uuid), public.log_event(uuid, text, jsonb), public.export_my_data(),
                          public.delete_my_account() to authenticated;
