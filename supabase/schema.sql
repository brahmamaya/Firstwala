-- Physica Test Series – Supabase schema
-- Run once in the Supabase SQL editor (or `supabase db push`). Safe to re-run: uses IF NOT EXISTS / OR REPLACE.
--
-- Security model
--   * Students never read questions/answers tables directly. Everything goes through SECURITY DEFINER
--     functions that check the caller (auth.uid()) and the attempt state.
--   * Correct answers + explanations live in a separate table (question_keys) with no student access.
--   * The timer is server-side: attempts.deadline is set at start; late saves are rejected.
--   * Payments are not built yet, but start_attempt() already checks tests.is_free / enrollments.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------- profiles
create table if not exists public.profiles (
  id                uuid primary key references auth.users (id) on delete cascade,
  display_name      text check (char_length(display_name) <= 80),
  role              text not null default 'student' check (role in ('student', 'admin')),
  is_minor          boolean,                 -- asked at first login; DPDP Act: under-18 needs parental consent
  parent_consent_at timestamptz,
  created_at        timestamptz not null default now()
);

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id) values (new.id) on conflict do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- ---------------------------------------------------------------- content
create table if not exists public.tests (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  exam         text not null check (exam in ('JEE_MAIN', 'JEE_ADV', 'NEET')),
  duration_min int  not null check (duration_min between 1 and 360),
  is_free      boolean not null default true,
  published    boolean not null default false,
  opens_at     timestamptz,                 -- optional scheduled window
  closes_at    timestamptz,
  created_at   timestamptz not null default now()
);

create table if not exists public.questions (
  id        uuid primary key default gen_random_uuid(),
  test_id   uuid not null references public.tests (id) on delete cascade,
  position  int  not null,
  subject   text not null check (subject in ('PHYSICS', 'CHEMISTRY', 'MATHS', 'BIOLOGY')),
  type      text not null check (type in ('MCQ', 'NUMERICAL')),
  body      text not null,
  options   jsonb not null default '[]',    -- ["A text","B text",...] for MCQ
  marks     int not null default 4,
  negative  int not null default 1,
  unique (test_id, position)
);

-- Answers/solutions are kept apart so no future "select *" policy can leak them.
create table if not exists public.question_keys (
  question_id    uuid primary key references public.questions (id) on delete cascade,
  correct_answer text not null,             -- MCQ: option index "0".."3"; NUMERICAL: number as text
  explanation    text
);

create table if not exists public.enrollments (   -- filled by the payment webhook later
  user_id    uuid not null references auth.users (id) on delete cascade,
  test_id    uuid not null references public.tests (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, test_id)
);

-- ---------------------------------------------------------------- attempts
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

create index if not exists questions_test_idx on public.questions (test_id, position);
create index if not exists attempts_user_idx  on public.attempts (user_id);

-- ---------------------------------------------------------------- RLS
alter table public.profiles      enable row level security;
alter table public.tests         enable row level security;
alter table public.questions     enable row level security;
alter table public.question_keys enable row level security;
alter table public.enrollments   enable row level security;
alter table public.attempts      enable row level security;
alter table public.responses     enable row level security;

drop policy if exists profiles_self_read   on public.profiles;
drop policy if exists profiles_self_update on public.profiles;
create policy profiles_self_read   on public.profiles for select to authenticated using (id = auth.uid() or public.is_admin());
create policy profiles_self_update on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists tests_read on public.tests;
drop policy if exists tests_admin on public.tests;
create policy tests_read  on public.tests for select to authenticated using (published or public.is_admin());
create policy tests_admin on public.tests for all    to authenticated using (public.is_admin()) with check (public.is_admin());

-- questions / question_keys: admin only. Students get them through get_attempt()/get_result().
drop policy if exists questions_admin     on public.questions;
drop policy if exists question_keys_admin on public.question_keys;
create policy questions_admin     on public.questions     for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy question_keys_admin on public.question_keys for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists enrollments_own on public.enrollments;
create policy enrollments_own on public.enrollments for select to authenticated using (user_id = auth.uid() or public.is_admin());

drop policy if exists attempts_own on public.attempts;
create policy attempts_own on public.attempts for select to authenticated using (user_id = auth.uid() or public.is_admin());

drop policy if exists responses_own on public.responses;
create policy responses_own on public.responses for select to authenticated
  using (exists (select 1 from public.attempts a where a.id = attempt_id and (a.user_id = auth.uid() or public.is_admin())));

-- Table privileges: deny by default, then grant the minimum. (RLS still applies on top.)
revoke all on public.profiles, public.tests, public.questions, public.question_keys,
              public.enrollments, public.attempts, public.responses from anon, authenticated;
grant select on public.tests, public.enrollments, public.attempts, public.responses to authenticated;
grant select on public.profiles to authenticated;
grant update (display_name, is_minor) on public.profiles to authenticated;   -- NOT role / parent_consent_at
grant select, insert, update, delete on public.tests, public.questions, public.question_keys to authenticated; -- gated by admin policies

-- ---------------------------------------------------------------- helpers (not callable by clients)
create or replace function public._to_num(t text) returns numeric
language plpgsql immutable as $$
begin return t::numeric; exception when others then return null; end $$;

create or replace function public._score_answer(p_type text, p_correct text, p_marks int, p_neg int, p_answer text)
returns int language sql immutable as $$
  select case
    when p_answer is null or btrim(p_answer) = '' then 0
    when p_type = 'NUMERICAL' then
      case when public._to_num(p_answer) is not null and abs(public._to_num(p_answer) - public._to_num(p_correct)) < 0.000001
           then p_marks else 0 end
    else case when p_answer = p_correct then p_marks else -p_neg end
  end
$$;

-- Scores and closes an attempt. Idempotent; row lock makes concurrent submits safe.
create or replace function public._finalize(p_attempt uuid) returns int
language plpgsql security definer set search_path = public as $$
declare a public.attempts; s int;
begin
  select * into a from public.attempts where id = p_attempt for update;
  if a.submitted_at is not null then return a.score; end if;
  select coalesce(sum(public._score_answer(q.type, k.correct_answer, q.marks, q.negative, r.answer)), 0)::int
    into s
    from public.questions q
    join public.question_keys k on k.question_id = q.id
    left join public.responses r on r.question_id = q.id and r.attempt_id = p_attempt
   where q.test_id = a.test_id;
  update public.attempts set submitted_at = now(), score = s where id = p_attempt;
  return s;
end $$;

-- ---------------------------------------------------------------- client API (RPC)
create or replace function public.start_attempt(p_test_id uuid) returns uuid
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); t public.tests; existing uuid; new_id uuid;
begin
  if uid is null then raise exception 'not_authenticated' using errcode = '28000'; end if;
  select * into t from public.tests where id = p_test_id and published;
  if not found then raise exception 'test_not_found' using errcode = 'P0002'; end if;

  select id into existing from public.attempts where user_id = uid and test_id = p_test_id;
  if existing is not null then return existing; end if;           -- resume

  if t.opens_at  is not null and now() < t.opens_at  then raise exception 'test_not_open'   using errcode = 'P0001'; end if;
  if t.closes_at is not null and now() > t.closes_at then raise exception 'test_closed'     using errcode = 'P0001'; end if;
  if not t.is_free and not exists (select 1 from public.enrollments where user_id = uid and test_id = p_test_id) then
    raise exception 'not_enrolled' using errcode = '42501';
  end if;

  insert into public.attempts (user_id, test_id, deadline)
  values (uid, p_test_id, now() + make_interval(mins => t.duration_min))
  on conflict (user_id, test_id) do nothing
  returning id into new_id;
  if new_id is null then select id into new_id from public.attempts where user_id = uid and test_id = p_test_id; end if;
  return new_id;
end $$;

-- Questions WITHOUT answers, saved answers and the server clock. Auto-submits if the deadline has passed.
create or replace function public.get_attempt(p_attempt uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare a public.attempts; t public.tests;
begin
  select * into a from public.attempts where id = p_attempt and user_id = auth.uid();
  if not found then raise exception 'attempt_not_found' using errcode = 'P0002'; end if;
  if a.submitted_at is null and now() > a.deadline then perform public._finalize(p_attempt); end if;
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
language plpgsql security definer set search_path = public as $$
declare a public.attempts;
begin
  select * into a from public.attempts where id = p_attempt and user_id = auth.uid();
  if not found then raise exception 'attempt_not_found' using errcode = 'P0002'; end if;
  if a.submitted_at is not null or now() > a.deadline + interval '5 seconds' then
    raise exception 'attempt_closed' using errcode = 'P0001';
  end if;
  if p_answer is not null and char_length(p_answer) > 32 then raise exception 'invalid_answer' using errcode = '22023'; end if;
  if not exists (select 1 from public.questions where id = p_question and test_id = a.test_id) then
    raise exception 'question_not_found' using errcode = 'P0002';
  end if;
  insert into public.responses (attempt_id, question_id, answer)
  values (p_attempt, p_question, p_answer)
  on conflict (attempt_id, question_id) do update set answer = excluded.answer, updated_at = now();
end $$;

create or replace function public.submit_attempt(p_attempt uuid) returns int
language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.attempts where id = p_attempt and user_id = auth.uid()) then
    raise exception 'attempt_not_found' using errcode = 'P0002';
  end if;
  return public._finalize(p_attempt);
end $$;

-- Answers + solutions, only after submission.
create or replace function public.get_result(p_attempt uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare a public.attempts; t public.tests;
begin
  select * into a from public.attempts where id = p_attempt and user_id = auth.uid();
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
        'points', public._score_answer(q.type, k.correct_answer, q.marks, q.negative, r.answer)
      ) order by q.position), '[]'::jsonb)
      from public.questions q
      join public.question_keys k on k.question_id = q.id
      left join public.responses r on r.question_id = q.id and r.attempt_id = a.id
      where q.test_id = a.test_id));
end $$;

-- ---------------------------------------------------------------- function privileges
revoke all on function public._finalize(uuid), public._score_answer(text, text, int, int, text), public._to_num(text) from public, anon, authenticated;
revoke all on function public.start_attempt(uuid), public.get_attempt(uuid), public.save_answer(uuid, uuid, text),
                       public.submit_attempt(uuid), public.get_result(uuid), public.handle_new_user() from public, anon;
revoke all on function public.is_admin() from public, anon;
grant execute on function public.start_attempt(uuid), public.get_attempt(uuid), public.save_answer(uuid, uuid, text),
                          public.submit_attempt(uuid), public.get_result(uuid), public.is_admin() to authenticated;
