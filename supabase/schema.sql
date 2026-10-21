-- Physica Test Series: Supabase schema (v3: full-length exams, compact storage)
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
--  10. Storage/cost: one compact row per attempt (answers/flags/time as arrays), question text stored once per test,
--      marks live in the exam pattern (not repeated per question), figures by reference. See docs/COST-AND-STORAGE.md.
--   9. Minors: parental consent + parent contact recorded; no analytics identifiers are stored (DPDP Act 2023, s.9).

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

-- Future objects created by the owner role get no API privileges unless granted explicitly.
alter default privileges for role postgres in schema public revoke all on tables    from anon, authenticated;
alter default privileges for role postgres in schema public revoke all on sequences from anon, authenticated;
alter default privileges for role postgres in schema public revoke all on functions from public, anon, authenticated;

-- ============================================================ constants
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
  locked_at         timestamptz,            -- set by private.ops_lock_user(); all student API calls are refused
  lock_reason       text,
  terms_version     text,
  terms_accepted_at timestamptz,
  created_at        timestamptz not null default now()
);

-- Exam pattern = one row per official format (e.g. JEE_MAIN_2026). Sections run in order; questions of a test follow the same order.
-- section keys: id, s subject, nm name, t type MCQ|MULTI|NUM, n count, c marks if right, w marks if wrong (<= 0), p marks per right option when only partly right (MULTI).
-- Marks are stored here ONCE, never repeated on each question. Edit supabase/patterns.json and re-run `node tools/series-import.js patterns`.
create table if not exists public.exam_patterns (
  id       text primary key check (id ~ '^[A-Z0-9_]{3,40}$'),
  exam     text not null check (exam in ('JEE_MAIN', 'JEE_ADV', 'NEET')),
  label    text not null check (char_length(label) <= 60),
  minutes  int  not null check (minutes between 1 and 360),
  papers   smallint not null default 1 check (papers between 1 and 2),
  sections jsonb not null check (jsonb_typeof(sections) = 'array' and jsonb_array_length(sections) between 1 and 24)
);

-- One row per full-length test. Series 1-3 of every exam are free, 4-30 paid (is_free is derived, it cannot be set wrongly).
create table if not exists public.tests (
  id          int generated always as identity primary key,
  exam        text not null check (exam in ('JEE_MAIN', 'JEE_ADV', 'NEET')),
  pattern_id  text not null references public.exam_patterns (id),
  series_no   smallint not null check (series_no between 1 and 30),
  paper       smallint not null default 1 check (paper in (1, 2)),
  title       text check (title is null or char_length(title) <= 120),      -- optional; the app shows "<exam> Test <n>" otherwise
  is_free     boolean generated always as (series_no <= 3) stored,
  price_paise int check (price_paise is null or price_paise >= 0),
  published   boolean not null default false,
  opens_at    timestamptz,
  closes_at   timestamptz,
  created_at  timestamptz not null default now(),
  unique (exam, series_no, paper)
);

-- Question text and answer keys: ONE row each per test (jsonb arrays in paper order), no per-question rows to index or join.
--   qs: [{"b": text, "o": [options], "f": figure key, "a": figure alt text}, ...]     ks: [{"k": "B" | "AC" | "12.5" | "10:12" | "*", "e": solution}, ...]
create table if not exists public.test_content (
  test_id int primary key references public.tests (id) on delete cascade,
  qs      jsonb not null check (jsonb_typeof(qs) = 'array' and octet_length(qs::text) <= 700000)
);
create table if not exists public.test_keys (
  test_id int primary key references public.tests (id) on delete cascade,
  ks      jsonb not null check (jsonb_typeof(ks) = 'array' and octet_length(ks::text) <= 700000)
);

create table if not exists public.enrollments (   -- written by the payment webhook (service role) later
  user_id    uuid not null references auth.users (id) on delete cascade,
  test_id    int  not null references public.tests (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, test_id)
);

-- One compact row per attempt. ans/fl/tm are arrays indexed by question number (1..N); a 180-question NEET paper is ~1 KB.
--   ans: 'B' (single) | 'AC' (multiple) | '12.5' (numerical) | NULL (no answer)     fl: 1 byte per question, bit0 = visited, bit1 = marked for review
--   tm : seconds spent per question     detail: per section [score, right, wrong, skipped, seconds], written at submit
create table if not exists public.attempts (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  test_id      int  not null references public.tests (id),
  started_at   timestamptz not null default now(),
  deadline     timestamptz not null,
  submitted_at timestamptz,
  score        int,
  detail       jsonb,
  ans          text[]     not null,
  fl           bytea      not null,
  tm           smallint[] not null,
  unique (user_id, test_id)
) with (fillfactor = 70);        -- room for in-place (HOT) updates while a student answers

-- Exam-integrity signals (tab switches etc.). Admin-only to read; students only append through log_event() (max 60 per attempt).
create table if not exists public.integrity_events (
  id         bigint generated always as identity primary key,
  attempt_id uuid not null references public.attempts (id) on delete cascade,
  kind       text not null check (kind in ('tab_hidden', 'tab_visible', 'copy_attempt', 'offline', 'online')),
  at         timestamptz not null default now()
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

-- Privacy-first site statistics: ONLY anonymous daily totals. No user id, no IP, no cookie, no per-visitor row, so
-- nothing here can identify or follow a person (safe for children's visits; DPDP s.9(3)).
create table if not exists public.analytics_daily (
  day   date   not null default (now() at time zone 'Asia/Kolkata')::date,
  event text   not null check (event in ('visit', 'view')),
  key   text   not null check (char_length(key) <= 64 and key ~ '^[a-z0-9._-]*$'),
  n     bigint not null default 0,
  primary key (day, event, key)
);

-- Incident-response switches (one row). Changed only from the SQL editor via private.ops_* (never from the browser).
create table if not exists public.app_settings (
  id           boolean primary key default true check (id),
  maintenance  boolean not null default false,        -- show a notice; block STARTING new tests
  exams_open   boolean not null default true,         -- false: no new test can be started
  signups_open boolean not null default true,         -- false: no new account can be created
  lockdown     boolean not null default false,        -- PANIC: every student API call is refused
  message      text check (message is null or char_length(message) <= 300),
  updated_at   timestamptz not null default now()
);
insert into public.app_settings (id) values (true) on conflict do nothing;

-- Devices that signed in, as one-way hashes of a random id kept in the browser (not a fingerprint, no IP/user-agent).
create table if not exists private.devices (
  user_id    uuid not null references auth.users (id) on delete cascade,
  device     text not null,
  first_seen timestamptz not null default now(),
  last_seen  timestamptz not null default now(),
  primary key (user_id, device)
);

create unlogged table if not exists private.rate_limits (
  key          text not null,
  window_start timestamptz not null,
  n            int not null default 0,
  primary key (key, window_start)
);

-- no separate index on attempts(user_id): the unique (user_id, test_id) constraint already serves it. No index on test_id alone either:
-- the partial rank index below covers every hot query; deleting a test (rare, admin only) may scan.
create index if not exists attempts_rank_idx      on public.attempts (test_id, score desc) where submitted_at is not null;
create index if not exists enrollments_test_idx   on public.enrollments (test_id);
create index if not exists integrity_attempt_idx  on public.integrity_events (attempt_id);
create index if not exists audit_at_idx           on public.audit_log (at);
create index if not exists audit_actor_idx        on public.audit_log (actor);

-- ============================================================ auth triggers + helpers
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if not (select signups_open from public.app_settings where id) then raise exception 'signups_closed' using errcode = 'P0001'; end if;
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

-- Admin edits to content are audited automatically (the row id only, never question text or answers).
create or replace function private.audit_trigger() returns trigger
language plpgsql security definer set search_path = '' as $$
declare r jsonb := case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end;
begin
  perform private.audit('admin.' || lower(tg_op), tg_table_name, coalesce(r ->> 'id', r ->> 'test_id'));
  return coalesce(new, old);
end $$;
drop trigger if exists audit_tests        on public.tests;
drop trigger if exists audit_test_content on public.test_content;
drop trigger if exists audit_test_keys    on public.test_keys;
create trigger audit_tests        after insert or update or delete on public.tests        for each row execute function private.audit_trigger();
create trigger audit_test_content after insert or update or delete on public.test_content for each row execute function private.audit_trigger();
create trigger audit_test_keys    after insert or update or delete on public.test_keys    for each row execute function private.audit_trigger();

-- Fixed-window per-key limiter. Raises 'rate_limited'.
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

create or replace function private.assert_ok(p_uid uuid, p_allow_locked boolean default false) returns void
language plpgsql stable security definer set search_path = '' as $$
declare s public.app_settings; locked timestamptz;
begin
  select * into s from public.app_settings where id;
  if s.lockdown then raise exception 'lockdown' using errcode = 'P0001'; end if;
  if not p_allow_locked then
    select locked_at into locked from public.profiles where id = p_uid;
    if locked is not null then raise exception 'account_locked' using errcode = 'P0001'; end if;
  end if;
end $$;

-- ============================================================ exam engine
create or replace function private.pattern_total(p_sections jsonb) returns int
language sql immutable set search_path = '' as $$
  select coalesce(sum((e ->> 'n')::int), 0)::int from jsonb_array_elements(p_sections) e
$$;
create or replace function private.pattern_max(p_sections jsonb) returns int
language sql immutable set search_path = '' as $$
  select coalesce(sum((e ->> 'n')::int * (e ->> 'c')::int), 0)::int from jsonb_array_elements(p_sections) e
$$;

-- Marks for one answer. key '*' = bonus (everyone gets full marks, e.g. a dropped question).
--   MCQ  : exact letter = +c, any other answer = w (<= 0).
--   MULTI: any wrong option = w; exactly all right options = +c; only some right options (no wrong one) = p per option chosen.
--   NUM  : within 1e-6 of the key (or inside a "lo:hi" range) = +c, else w.
create or replace function private.points(p_type text, p_c int, p_w int, p_p int, p_ans text, p_key text) returns int
language plpgsql immutable set search_path = '' as $$
declare lo numeric; hi numeric; v numeric; bad boolean;
begin
  if p_key = '*' then return p_c; end if;
  if p_ans is null or btrim(p_ans) = '' then return 0; end if;
  if p_type = 'MCQ' then
    return case when p_ans = p_key then p_c else p_w end;
  elsif p_type = 'MULTI' then
    select bool_or(position(ch in p_key) = 0) into bad from regexp_split_to_table(p_ans, '') ch;
    if bad then return p_w; end if;
    return case when p_ans = p_key then p_c else p_p * char_length(p_ans) end;
  else
    v := private.to_num(p_ans);
    if v is null then return p_w; end if;
    if position(':' in p_key) > 0 then lo := private.to_num(split_part(p_key, ':', 1)); hi := private.to_num(split_part(p_key, ':', 2));
    else lo := private.to_num(p_key); hi := lo; end if;
    return case when v >= lo - 0.000001 and v <= hi + 0.000001 then p_c else p_w end;
  end if;
end $$;

-- Publish gate: a test can go live only if its content is complete and well-formed (counts, options, keys, figure alt text).
create or replace function private.validate_test(p_test int) returns void
language plpgsql security definer set search_path = '' as $$
declare t public.tests; pat public.exam_patterns; q jsonb; k jsonb; n int; off int := 0; sec jsonb; i int; gi int; nopt int; key text; typ text; bad text;
begin
  select * into t from public.tests where id = p_test;
  select * into pat from public.exam_patterns where id = t.pattern_id;
  select qs into q from public.test_content where test_id = p_test;
  select ks into k from public.test_keys where test_id = p_test;
  n := private.pattern_total(pat.sections);
  if q is null or k is null then raise exception 'content_invalid: content or keys missing' using errcode = 'P0001'; end if;
  if jsonb_array_length(q) <> n or jsonb_array_length(k) <> n then
    raise exception 'content_invalid: expected % questions, got % / % keys', n, jsonb_array_length(q), jsonb_array_length(k) using errcode = 'P0001';
  end if;
  for sec in select e from jsonb_array_elements(pat.sections) e loop
    typ := sec ->> 't';
    for i in 1 .. (sec ->> 'n')::int loop
      gi := off + i;
      if jsonb_typeof(q -> (gi - 1) -> 'b') is distinct from 'string' or char_length(q -> (gi - 1) ->> 'b') not between 1 and 4000 then
        raise exception 'content_invalid: question % has no text (1-4000 chars)', gi using errcode = 'P0001'; end if;
      if q -> (gi - 1) ? 'f' then
        if (q -> (gi - 1) ->> 'f') !~ '^[A-Za-z0-9_-]{16,64}$' then raise exception 'content_invalid: question % has a bad figure key', gi using errcode = 'P0001'; end if;
        if coalesce(btrim(q -> (gi - 1) ->> 'a'), '') = '' then raise exception 'content_invalid: question % has a figure but no alt text', gi using errcode = 'P0001'; end if;
      end if;
      key := k -> (gi - 1) ->> 'k';
      if key is null then raise exception 'content_invalid: question % has no key', gi using errcode = 'P0001'; end if;
      if char_length(coalesce(k -> (gi - 1) ->> 'e', '')) > 5000 then raise exception 'content_invalid: solution % too long', gi using errcode = 'P0001'; end if;
      if typ in ('MCQ', 'MULTI') then
        if jsonb_typeof(q -> (gi - 1) -> 'o') is distinct from 'array' then raise exception 'content_invalid: question % needs options', gi using errcode = 'P0001'; end if;
        nopt := jsonb_array_length(q -> (gi - 1) -> 'o');
        if nopt not between 2 and 6 then raise exception 'content_invalid: question % must have 2-6 options', gi using errcode = 'P0001'; end if;
        select string_agg(x, ',') into bad from jsonb_array_elements_text(q -> (gi - 1) -> 'o') x where x is null or btrim(x) = '' or char_length(x) > 600;
        if bad is not null then raise exception 'content_invalid: question % has an empty or too-long option', gi using errcode = 'P0001'; end if;
        if key <> '*' then
          if typ = 'MCQ' and key !~ ('^[A-' || chr(64 + nopt) || ']$') then raise exception 'content_invalid: key % of question % is not an option', key, gi using errcode = 'P0001'; end if;
          if typ = 'MULTI' and (key !~ ('^[A-' || chr(64 + nopt) || ']+$') or key <> (select string_agg(c, '' order by c) from (select distinct c from regexp_split_to_table(key, '') c) d)) then
            raise exception 'content_invalid: key % of question % must be sorted distinct option letters', key, gi using errcode = 'P0001'; end if;
        end if;
      else
        if q -> (gi - 1) ? 'o' then raise exception 'content_invalid: numerical question % must not have options', gi using errcode = 'P0001'; end if;
        if key <> '*' and key !~ '^-?[0-9]+(\.[0-9]+)?(:-?[0-9]+(\.[0-9]+)?)?$' then raise exception 'content_invalid: numerical key % of question %', key, gi using errcode = 'P0001'; end if;
        if position(':' in key) > 0 and private.to_num(split_part(key, ':', 1)) > private.to_num(split_part(key, ':', 2)) then raise exception 'content_invalid: key range of question % is reversed', gi using errcode = 'P0001'; end if;
      end if;
    end loop;
    off := off + (sec ->> 'n')::int;
  end loop;
end $$;

-- tests: pattern must match the exam; going live (or editing live content) runs the full validation.
create or replace function private.tests_guard() returns trigger
language plpgsql security definer set search_path = '' as $$
declare pat public.exam_patterns;
begin
  select * into pat from public.exam_patterns where id = new.pattern_id;
  if pat.exam <> new.exam then raise exception 'pattern % belongs to %, not %', new.pattern_id, pat.exam, new.exam using errcode = 'P0001'; end if;
  if new.paper > pat.papers then raise exception 'pattern % has only % paper(s)', new.pattern_id, pat.papers using errcode = 'P0001'; end if;
  if new.published and (tg_op = 'INSERT' or not old.published) then
    if tg_op = 'INSERT' then raise exception 'insert unpublished first, add content, then publish' using errcode = 'P0001'; end if;
    perform private.validate_test(new.id);
  end if;
  return new;
end $$;
drop trigger if exists tests_guard on public.tests;
create trigger tests_guard before insert or update on public.tests for each row execute function private.tests_guard();

create or replace function private.content_guard() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if exists (select 1 from public.tests where id = new.test_id and published) then perform private.validate_test(new.test_id); end if;
  return new;
end $$;
drop trigger if exists content_guard_q on public.test_content;
drop trigger if exists content_guard_k on public.test_keys;
create constraint trigger content_guard_q after insert or update on public.test_content deferrable initially deferred for each row execute function private.content_guard();
create constraint trigger content_guard_k after insert or update on public.test_keys    deferrable initially deferred for each row execute function private.content_guard();

-- Scores and closes an attempt. Idempotent; the row lock makes concurrent submits safe. Writes the per-section summary.
create or replace function private.finalize(p_attempt uuid) returns int
language plpgsql security definer set search_path = '' as $$
declare a public.attempts; pat public.exam_patterns; ks jsonb; sec jsonb; n int; off int := 0; i int; gi int; pts int;
        sc int; ok int; bad int; skip int; secs int; total int := 0; det jsonb := '[]'::jsonb;
begin
  select * into a from public.attempts where id = p_attempt for update;
  if a.submitted_at is not null then return a.score; end if;
  select p.* into pat from public.exam_patterns p join public.tests t on t.pattern_id = p.id where t.id = a.test_id;
  select k.ks into ks from public.test_keys k where k.test_id = a.test_id;
  for sec in select e from jsonb_array_elements(pat.sections) e loop
    n := (sec ->> 'n')::int; sc := 0; ok := 0; bad := 0; skip := 0; secs := 0;
    for i in 1 .. n loop
      gi := off + i;
      pts := private.points(sec ->> 't', (sec ->> 'c')::int, (sec ->> 'w')::int, coalesce((sec ->> 'p')::int, 0), a.ans[gi], ks -> (gi - 1) ->> 'k');
      sc := sc + pts; secs := secs + a.tm[gi];
      if a.ans[gi] is null or btrim(a.ans[gi]) = '' then skip := skip + 1; if pts > 0 then ok := ok + 1; end if;
      elsif pts > 0 then ok := ok + 1; else bad := bad + 1; end if;
    end loop;
    det := det || jsonb_build_array(jsonb_build_array(sc, ok, bad, skip, secs));
    total := total + sc; off := off + n;
  end loop;
  update public.attempts set submitted_at = now(), score = total, detail = det where id = p_attempt;
  perform private.audit('attempt.submit', 'attempt', p_attempt::text, jsonb_build_object('late', now() > a.deadline));
  return total;
end $$;

-- ============================================================ RLS
alter table public.profiles         enable row level security;
alter table public.exam_patterns    enable row level security;   -- no policy, no grant: read only through list_tests / get_attempt
alter table public.tests            enable row level security;
alter table public.test_content     enable row level security;
alter table public.test_keys        enable row level security;
alter table public.enrollments      enable row level security;
alter table public.attempts         enable row level security;
alter table public.integrity_events enable row level security;
alter table public.audit_log        enable row level security;
alter table public.analytics_daily  enable row level security;
alter table public.app_settings     enable row level security;   -- no policy, no grant: only SECURITY DEFINER code reads it

drop policy if exists profiles_self_read on public.profiles;
create policy profiles_self_read on public.profiles for select to authenticated using (id = (select auth.uid()) or public.is_admin());

-- tests / test_content / test_keys: admin (MFA) only. Students get everything through list_tests / get_attempt / get_review.
drop policy if exists tests_admin        on public.tests;
drop policy if exists test_content_admin on public.test_content;
drop policy if exists test_keys_admin    on public.test_keys;
create policy tests_admin        on public.tests        for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy test_content_admin on public.test_content for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy test_keys_admin    on public.test_keys    for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists enrollments_own on public.enrollments;
create policy enrollments_own on public.enrollments for select to authenticated using (user_id = (select auth.uid()) or public.is_admin());

drop policy if exists attempts_own on public.attempts;
create policy attempts_own on public.attempts for select to authenticated using (user_id = (select auth.uid()) or public.is_admin());

drop policy if exists integrity_admin on public.integrity_events;
create policy integrity_admin on public.integrity_events for select to authenticated using (public.is_admin());

drop policy if exists analytics_admin on public.analytics_daily;
create policy analytics_admin on public.analytics_daily for select to authenticated using (public.is_admin());

drop policy if exists audit_admin on public.audit_log;
create policy audit_admin on public.audit_log for select to authenticated using (public.is_admin());

-- Table privileges: deny by default, then grant the minimum (RLS still applies on top).
revoke all on public.profiles, public.exam_patterns, public.tests, public.test_content, public.test_keys, public.enrollments,
              public.attempts, public.integrity_events, public.audit_log, public.analytics_daily, public.app_settings from anon, authenticated;
revoke all on private.rate_limits from anon, authenticated;
grant select on public.profiles, public.enrollments, public.attempts to authenticated;
grant select on public.integrity_events, public.audit_log, public.analytics_daily to authenticated;   -- admin-only via RLS
grant select, insert, update, delete on public.tests, public.test_content, public.test_keys to authenticated;   -- admin-only via RLS

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
  perform private.assert_ok(uid);
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

-- All full-length tests of one exam for the signed-in student in ONE call: patterns once, then a short row per test.
-- keys: id, n series no, p paper, pat pattern id, f free, pr price(paise), lk locked, a attempt id, s score, d finished, op/cl window, t title
create or replace function public.list_tests(p_exam text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare uid uuid := (select auth.uid());
begin
  if uid is null then raise exception 'not_authenticated' using errcode = '28000'; end if;
  perform private.assert_ok(uid);
  perform private.rate_limit('list:' || uid, 60, interval '1 minute');
  if p_exam not in ('JEE_MAIN', 'JEE_ADV', 'NEET') then raise exception 'invalid_exam' using errcode = '22023'; end if;
  return jsonb_build_object(
    'pat', coalesce((select jsonb_object_agg(p.id, jsonb_build_object('l', p.label, 'm', p.minutes, 'pp', p.papers,
              'q', private.pattern_total(p.sections), 'mx', private.pattern_max(p.sections), 's', p.sections))
             from public.exam_patterns p where p.id in (select pattern_id from public.tests where exam = p_exam and published)), '{}'::jsonb),
    'tests', coalesce((select jsonb_agg(jsonb_strip_nulls(jsonb_build_object('id', t.id, 'n', t.series_no, 'p', t.paper, 'pat', t.pattern_id,
              'f', t.is_free, 'pr', t.price_paise, 't', t.title, 'op', t.opens_at, 'cl', t.closes_at,
              'lk', (not t.is_free and not exists (select 1 from public.enrollments e where e.user_id = uid and e.test_id = t.id)),
              'a', a.id, 's', a.score, 'd', (a.submitted_at is not null))) order by t.series_no, t.paper)
             from public.tests t left join public.attempts a on a.test_id = t.id and a.user_id = uid
            where t.exam = p_exam and t.published), '[]'::jsonb));
end $$;

create or replace function public.start_attempt(p_test_id int) returns uuid
language plpgsql security definer set search_path = '' as $$
declare uid uuid := (select auth.uid()); t public.tests; pat public.exam_patterns; existing uuid; new_id uuid; n int;
begin
  if uid is null then raise exception 'not_authenticated' using errcode = '28000'; end if;
  perform private.assert_ok(uid);
  perform private.rate_limit('start:' || uid, 30, interval '1 hour');
  if exists (select 1 from public.app_settings where id and (maintenance or not exams_open)) then raise exception 'exams_paused' using errcode = 'P0001'; end if;
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

  select * into pat from public.exam_patterns where id = t.pattern_id;
  n := private.pattern_total(pat.sections);
  insert into public.attempts (user_id, test_id, deadline, ans, fl, tm)
  values (uid, p_test_id, now() + make_interval(mins => pat.minutes),
          array_fill(null::text, array[n]), decode(repeat('00', n), 'hex'), array_fill(0::smallint, array[n]))
  on conflict (user_id, test_id) do nothing
  returning id into new_id;
  if new_id is null then
    select id into new_id from public.attempts where user_id = uid and test_id = p_test_id;
  else
    perform private.audit('attempt.start', 'attempt', new_id::text);
  end if;
  return new_id;
end $$;

-- The paper (questions WITHOUT answers), pattern, saved state and the server clock. Auto-submits if the deadline has passed.
-- state: ans[], fl (hex, 1 byte per question), tm[]
create or replace function public.get_attempt(p_attempt uuid) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare uid uuid := (select auth.uid()); a public.attempts; t public.tests; pat public.exam_patterns;
begin
  if uid is null then raise exception 'not_authenticated' using errcode = '28000'; end if;
  perform private.assert_ok(uid);
  perform private.rate_limit('getattempt:' || uid, 120, interval '1 minute');
  select * into a from public.attempts where id = p_attempt and user_id = uid;
  if not found then raise exception 'attempt_not_found' using errcode = 'P0002'; end if;
  if a.submitted_at is null and now() > a.deadline then perform private.finalize(p_attempt); end if;
  select * into a from public.attempts where id = p_attempt;
  if a.submitted_at is not null then
    return jsonb_build_object('submitted', true, 'attempt_id', a.id);
  end if;
  select * into t from public.tests where id = a.test_id;
  select * into pat from public.exam_patterns where id = t.pattern_id;
  return jsonb_build_object(
    'submitted', false, 'attempt_id', a.id, 'n', t.series_no, 'p', t.paper, 'title', t.title,
    'pat', jsonb_build_object('l', pat.label, 'm', pat.minutes, 's', pat.sections),
    'deadline', a.deadline, 'server_now', now(),
    'qs', (select c.qs from public.test_content c where c.test_id = a.test_id),
    'state', jsonb_build_object('ans', to_jsonb(a.ans), 'fl', encode(a.fl, 'hex'), 'tm', to_jsonb(a.tm)));
end $$;

-- Save a batch of changes in ONE call. items = [[question no (1-based), answer|null, flags 0-3, seconds spent since last save], ...]
-- Exactly like the real exam: the browser sends this on "Save & Next", "Mark for Review", "Clear Response" and every ~20 s, not on every click.
create or replace function public.save_state(p_attempt uuid, p_items jsonb) returns void
language plpgsql security definer set search_path = '' as $$
declare uid uuid := (select auth.uid()); a public.attempts; pat public.exam_patterns; types text[]; it jsonb; idx int; v text; f int; s int; n int;
        v_ans text[]; v_tm smallint[]; v_fl bytea;
begin
  if uid is null then raise exception 'not_authenticated' using errcode = '28000'; end if;
  perform private.assert_ok(uid);
  perform private.rate_limit('save:' || uid, 300, interval '1 minute');
  if jsonb_typeof(p_items) is distinct from 'array' or jsonb_array_length(p_items) > 100 then raise exception 'invalid_answer' using errcode = '22023'; end if;
  -- FOR UPDATE conflicts with finalize(): a save either lands before the score is computed (and counts) or sees the attempt as submitted (and is rejected).
  select * into a from public.attempts where id = p_attempt and user_id = uid for update;
  if not found then raise exception 'attempt_not_found' using errcode = 'P0002'; end if;
  if a.submitted_at is not null or now() > a.deadline + interval '5 seconds' then raise exception 'attempt_closed' using errcode = 'P0001'; end if;
  select p.* into pat from public.exam_patterns p join public.tests t on t.pattern_id = p.id where t.id = a.test_id;
  select array_agg(s.e ->> 't' order by s.ord, g.i) into types
    from jsonb_array_elements(pat.sections) with ordinality as s(e, ord) cross join lateral generate_series(1, (s.e ->> 'n')::int) as g(i);
  n := array_length(types, 1);
  v_ans := a.ans; v_tm := a.tm; v_fl := a.fl;
  for it in select value from jsonb_array_elements(p_items) loop
    if jsonb_typeof(it) <> 'array' or jsonb_array_length(it) <> 4 then raise exception 'invalid_answer' using errcode = '22023'; end if;
    idx := (it ->> 0)::int; v := it ->> 1; f := (it ->> 2)::int; s := (it ->> 3)::int;
    if idx < 1 or idx > n or f not between 0 and 3 then raise exception 'invalid_answer' using errcode = '22023'; end if;
    -- strict, type-aware validation: nothing but option letters or a plain number is ever stored
    if v is not null then
      if types[idx] = 'MCQ' then
        if v !~ '^[A-F]$' then raise exception 'invalid_answer' using errcode = '22023'; end if;
      elsif types[idx] = 'MULTI' then
        if v !~ '^[A-F]{1,6}$' or v <> (select string_agg(c, '' order by c) from (select distinct c from regexp_split_to_table(v, '') c) d) then raise exception 'invalid_answer' using errcode = '22023'; end if;
      elsif char_length(v) > 24 or v !~ '^-?[0-9]+(\.[0-9]+)?$' then raise exception 'invalid_answer' using errcode = '22023';
      end if;
    end if;
    v_ans[idx] := v;
    v_fl := set_byte(v_fl, idx - 1, f);
    v_tm[idx] := least(32000, v_tm[idx] + least(greatest(s, 0), 3600))::smallint;
  end loop;
  update public.attempts set ans = v_ans, fl = v_fl, tm = v_tm where id = p_attempt;
end $$;

create or replace function public.submit_attempt(p_attempt uuid) returns int
language plpgsql security definer set search_path = '' as $$
declare uid uuid := (select auth.uid());
begin
  if uid is null then raise exception 'not_authenticated' using errcode = '28000'; end if;
  perform private.assert_ok(uid);
  perform private.rate_limit('submit:' || uid, 30, interval '1 minute');
  if not exists (select 1 from public.attempts where id = p_attempt and user_id = uid) then
    raise exception 'attempt_not_found' using errcode = 'P0002';
  end if;
  return private.finalize(p_attempt);          -- idempotent; audits the first (and only) real submit
end $$;

-- Scorecard (after submit): totals, per-section summary, time, rank among everyone who finished this test.
-- sections: [{nm, s, t, sc, mx, ok, bad, skip, tm}], answers/solutions are fetched per section by get_review.
create or replace function public.get_result(p_attempt uuid) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare uid uuid := (select auth.uid()); a public.attempts; t public.tests; pat public.exam_patterns; r int; tot int;
begin
  if uid is null then raise exception 'not_authenticated' using errcode = '28000'; end if;
  perform private.assert_ok(uid);
  perform private.rate_limit('result:' || uid, 60, interval '1 minute');
  select * into a from public.attempts where id = p_attempt and user_id = uid;
  if not found then raise exception 'attempt_not_found' using errcode = 'P0002'; end if;
  if a.submitted_at is null then raise exception 'attempt_in_progress' using errcode = 'P0001'; end if;
  select * into t from public.tests where id = a.test_id;
  select * into pat from public.exam_patterns where id = t.pattern_id;
  select count(*) filter (where x.score > a.score) + 1, count(*) into r, tot from public.attempts x where x.test_id = a.test_id and x.submitted_at is not null;
  return jsonb_build_object(
    'l', pat.label, 'n', t.series_no, 'p', t.paper, 'title', t.title, 'score', a.score, 'total', private.pattern_max(pat.sections),
    'min', pat.minutes, 'used', round(extract(epoch from (a.submitted_at - a.started_at)) / 60), 'rank', r, 'of', tot,
    'sections', (select jsonb_agg(jsonb_build_object('nm', s.e ->> 'nm', 's', s.e ->> 's', 't', s.e ->> 't', 'n', (s.e ->> 'n')::int,
                    'sc', (a.detail -> (s.ord - 1)::int ->> 0)::int, 'mx', (s.e ->> 'n')::int * (s.e ->> 'c')::int,
                    'ok', (a.detail -> (s.ord - 1)::int ->> 1)::int, 'bad', (a.detail -> (s.ord - 1)::int ->> 2)::int,
                    'skip', (a.detail -> (s.ord - 1)::int ->> 3)::int, 'tm', (a.detail -> (s.ord - 1)::int ->> 4)::int) order by s.ord)
                   from jsonb_array_elements(pat.sections) with ordinality as s(e, ord)));
end $$;

-- Question-by-question review of ONE section (after submit): your answer, the key, the solution, marks, time. Fetched on demand.
create or replace function public.get_review(p_attempt uuid, p_section int) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare uid uuid := (select auth.uid()); a public.attempts; pat public.exam_patterns; sec jsonb; off int := 0; n int; i int; gi int; qs jsonb; ks jsonb; out jsonb := '[]'::jsonb;
begin
  if uid is null then raise exception 'not_authenticated' using errcode = '28000'; end if;
  perform private.assert_ok(uid);
  perform private.rate_limit('review:' || uid, 60, interval '1 minute');
  select * into a from public.attempts where id = p_attempt and user_id = uid;
  if not found then raise exception 'attempt_not_found' using errcode = 'P0002'; end if;
  if a.submitted_at is null then raise exception 'attempt_in_progress' using errcode = 'P0001'; end if;
  select p.* into pat from public.exam_patterns p join public.tests t on t.pattern_id = p.id where t.id = a.test_id;
  if p_section is null or p_section < 0 or p_section >= jsonb_array_length(pat.sections) then raise exception 'invalid_section' using errcode = '22023'; end if;
  select c.qs into qs from public.test_content c where c.test_id = a.test_id;
  select k.ks into ks from public.test_keys k where k.test_id = a.test_id;
  for i in 0 .. p_section - 1 loop off := off + (pat.sections -> i ->> 'n')::int; end loop;
  sec := pat.sections -> p_section; n := (sec ->> 'n')::int;
  for i in 1 .. n loop
    gi := off + i;
    out := out || jsonb_build_array(jsonb_strip_nulls(jsonb_build_object('i', gi, 'q', qs -> (gi - 1), 'k', ks -> (gi - 1) ->> 'k', 'e', ks -> (gi - 1) ->> 'e',
      'y', a.ans[gi], 't', a.tm[gi],
      'pt', private.points(sec ->> 't', (sec ->> 'c')::int, (sec ->> 'w')::int, coalesce((sec ->> 'p')::int, 0), a.ans[gi], ks -> (gi - 1) ->> 'k'))));
  end loop;
  return out;
end $$;

-- Exam-integrity signal from the browser (tab hidden, copy attempt ...). Advisory only; never changes a score by itself. Max 60 per attempt.
create or replace function public.log_event(p_attempt uuid, p_kind text) returns void
language plpgsql security definer set search_path = '' as $$
declare uid uuid := (select auth.uid());
begin
  if uid is null then raise exception 'not_authenticated' using errcode = '28000'; end if;
  perform private.assert_ok(uid);
  perform private.rate_limit('event:' || uid, 120, interval '1 minute');
  if p_kind not in ('tab_hidden', 'tab_visible', 'copy_attempt', 'offline', 'online') then raise exception 'invalid_event' using errcode = '22023'; end if;
  if not exists (select 1 from public.attempts where id = p_attempt and user_id = uid and submitted_at is null and now() <= deadline + interval '5 seconds') then
    raise exception 'attempt_closed' using errcode = 'P0001';
  end if;
  if (select count(*) from public.integrity_events where attempt_id = p_attempt) >= 60 then return; end if;
  insert into public.integrity_events (attempt_id, kind) values (p_attempt, p_kind);
end $$;

-- DPDP rights: access / portability. Returns everything we hold about the caller as JSON.
create or replace function public.export_my_data() returns jsonb
language plpgsql security definer set search_path = '' as $$
declare uid uuid := (select auth.uid()); out jsonb;
begin
  if uid is null then raise exception 'not_authenticated' using errcode = '28000'; end if;
  perform private.assert_ok(uid, true);       -- a locked user may still export (data-access right)
  perform private.rate_limit('export:' || uid, 5, interval '1 day');
  select jsonb_build_object(
    'exported_at', now(),
    'account', (select jsonb_build_object('id', u.id, 'email', u.email) from auth.users u where u.id = uid),
    'profile', (select to_jsonb(p) from public.profiles p where p.id = uid),
    'enrollments', (select coalesce(jsonb_agg(to_jsonb(e)), '[]') from public.enrollments e where e.user_id = uid),
    'attempts', (select coalesce(jsonb_agg(jsonb_build_object(
        'attempt', to_jsonb(a),
        'integrity_events', (select coalesce(jsonb_agg(jsonb_build_object('kind', i.kind, 'at', i.at)), '[]') from public.integrity_events i where i.attempt_id = a.id)
      )), '[]') from public.attempts a where a.user_id = uid),
    'audit', (select coalesce(jsonb_agg(jsonb_build_object('at', l.at, 'action', l.action, 'entity', l.entity)), '[]') from public.audit_log l where l.actor = uid)
  ) into out;
  perform private.audit('account.export');
  return out;
end $$;

create or replace function public.delete_my_account() returns void
language plpgsql security definer set search_path = '' as $$
declare uid uuid := (select auth.uid());
begin
  if uid is null then raise exception 'not_authenticated' using errcode = '28000'; end if;
  perform private.assert_ok(uid, true);       -- ... and may still erase their data
  perform private.rate_limit('delete:' || uid, 3, interval '1 day');
  perform private.audit('account.delete');
  delete from auth.users where id = uid;
end $$;

-- Anonymous site statistics. Callable by anyone (anon), writes aggregate counters only.
create or replace function public.track(p_event text, p_key text default '') returns void
language plpgsql security definer set search_path = '' as $$
declare k text := coalesce(p_key, ''); d date := (now() at time zone 'Asia/Kolkata')::date;
begin
  if p_event not in ('visit', 'view') then raise exception 'invalid_event' using errcode = '22023'; end if;
  if char_length(k) > 64 or k !~ '^[a-z0-9._-]*$' then raise exception 'invalid_event' using errcode = '22023'; end if;
  perform private.rate_limit('track', 1200, interval '1 minute');
  if not exists (select 1 from public.analytics_daily where day = d and event = p_event and key = k)
     and (select count(*) from public.analytics_daily where day = d) >= 3000 then
    k := 'other';
  end if;
  insert into public.analytics_daily as a (day, event, key, n) values (d, p_event, k, 1)
  on conflict (day, event, key) do update set n = a.n + 1;
end $$;

create or replace function public.admin_stats(p_days int default 30) returns jsonb
language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_admin() then raise exception 'forbidden' using errcode = '42501'; end if;
  p_days := least(greatest(coalesce(p_days, 30), 1), 365);
  return jsonb_build_object(
    'days', p_days,
    'visits_total', (select coalesce(sum(n), 0) from public.analytics_daily where event = 'visit' and day > (now() at time zone 'Asia/Kolkata')::date - p_days),
    'visits_by_day', (select coalesce(jsonb_agg(jsonb_build_object('day', day, 'visits', n) order by day), '[]')
                        from public.analytics_daily where event = 'visit' and key = '' and day > (now() at time zone 'Asia/Kolkata')::date - p_days),
    'top_views', (select coalesce(jsonb_agg(jsonb_build_object('key', key, 'views', v) order by v desc), '[]') from (
                    select key, sum(n) v from public.analytics_daily where event = 'view' and day > (now() at time zone 'Asia/Kolkata')::date - p_days
                     group by key order by v desc limit 50) t));
end $$;

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

create or replace function private.purge_audit(p_days int default 365) returns bigint
language plpgsql security definer set search_path = '' as $$
declare n bigint;
begin
  if p_days < 180 then raise exception 'below_cert_in_minimum'; end if;
  with del as (delete from public.audit_log where at < now() - make_interval(days => p_days) returning 1)
  select count(*) into n from del;
  return n;
end $$;

create or replace function public.get_status() returns jsonb
language sql stable security definer set search_path = '' as $$
  select jsonb_build_object('maintenance', maintenance, 'exams_open', exams_open, 'signups_open', signups_open,
                            'lockdown', lockdown, 'message', message)
    from public.app_settings where id;
$$;

create or replace function public.note_device(p_device text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare uid uuid := (select auth.uid()); h text; had int; is_new boolean;
begin
  if uid is null then raise exception 'not_authenticated' using errcode = '28000'; end if;
  perform private.assert_ok(uid);
  perform private.rate_limit('device:' || uid, 60, interval '1 hour');
  if p_device is null or p_device !~ '^[A-Za-z0-9_-]{22,64}$' then raise exception 'invalid_device' using errcode = '22023'; end if;
  h := encode(sha256(convert_to(p_device || ':' || uid::text, 'UTF8')), 'hex');
  select count(*) into had from private.devices where user_id = uid;
  insert into private.devices (user_id, device) values (uid, h)
  on conflict (user_id, device) do update set last_seen = now()
  returning (xmax = 0) into is_new;
  delete from private.devices where user_id = uid and device not in
    (select device from private.devices where user_id = uid order by last_seen desc limit 20);
  if is_new and had > 0 then perform private.audit('login.new_device', 'profile', uid::text); end if;
  return jsonb_build_object('new_device', is_new and had > 0);
end $$;

create or replace function public.list_devices(p_device text default null) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare uid uuid := (select auth.uid()); h text;
begin
  if uid is null then raise exception 'not_authenticated' using errcode = '28000'; end if;
  perform private.assert_ok(uid, true);
  if p_device is not null and p_device ~ '^[A-Za-z0-9_-]{22,64}$' then h := encode(sha256(convert_to(p_device || ':' || uid::text, 'UTF8')), 'hex'); end if;
  return coalesce((select jsonb_agg(jsonb_build_object('first_seen', first_seen, 'last_seen', last_seen, 'current', device = h) order by last_seen desc)
                     from private.devices where user_id = uid), '[]'::jsonb);
end $$;

-- ================= operator tools: run from the Supabase SQL editor (owner / postgres). Not callable from the API. =================
-- Lock one account: refuse every API call at once, block new logins, kill its sessions.
create or replace function private.ops_lock_user(p_email text, p_reason text default 'security') returns text
language plpgsql security definer set search_path = '' as $$
declare uid uuid;
begin
  select id into uid from auth.users where lower(email) = lower(btrim(p_email));
  if uid is null then return 'no such user'; end if;
  update public.profiles set locked_at = now(), lock_reason = left(p_reason, 200) where id = uid;
  update auth.users set banned_until = 'infinity' where id = uid;
  delete from auth.sessions where user_id = uid;
  insert into public.audit_log (action, entity, entity_id, meta) values ('ops.lock_user', 'profile', uid::text, jsonb_build_object('reason', left(p_reason, 200)));
  return 'locked ' || uid;
end $$;
create or replace function private.ops_unlock_user(p_email text) returns text
language plpgsql security definer set search_path = '' as $$
declare uid uuid;
begin
  select id into uid from auth.users where lower(email) = lower(btrim(p_email));
  if uid is null then return 'no such user'; end if;
  update public.profiles set locked_at = null, lock_reason = null where id = uid;
  update auth.users set banned_until = null where id = uid;
  insert into public.audit_log (action, entity, entity_id) values ('ops.unlock_user', 'profile', uid::text);
  return 'unlocked ' || uid;
end $$;
-- Sign one user out everywhere (e.g. "my account was used by someone else").
create or replace function private.ops_revoke_sessions(p_email text) returns int
language plpgsql security definer set search_path = '' as $$
declare uid uuid; n int;
begin
  select id into uid from auth.users where lower(email) = lower(btrim(p_email));
  if uid is null then return 0; end if;
  with d as (delete from auth.sessions where user_id = uid returning 1) select count(*) into n from d;
  insert into public.audit_log (action, entity, entity_id, meta) values ('ops.revoke_sessions', 'profile', uid::text, jsonb_build_object('sessions', n));
  return n;
end $$;
-- PANIC BUTTON. on: every student API call is refused and every session is killed. off: back to normal.
create or replace function private.ops_panic(p_on boolean, p_message text default 'Physica is temporarily offline for a security check. Your saved answers are safe.') returns text
language plpgsql security definer set search_path = '' as $$
declare n int := 0;
begin
  update public.app_settings set lockdown = p_on, maintenance = p_on, exams_open = not p_on, signups_open = not p_on,
         message = case when p_on then left(p_message, 300) else null end, updated_at = now() where id;
  if p_on then with d as (delete from auth.sessions returning 1) select count(*) into n from d; end if;
  insert into public.audit_log (action, meta) values ('ops.panic', jsonb_build_object('on', p_on, 'sessions_killed', n));
  return case when p_on then 'LOCKDOWN ON; sessions killed: ' || n else 'lockdown off' end;
end $$;
create or replace function private.ops_set_status(p_maintenance boolean default null, p_exams_open boolean default null, p_signups_open boolean default null, p_message text default null) returns text
language plpgsql security definer set search_path = '' as $$
begin
  update public.app_settings set maintenance = coalesce(p_maintenance, maintenance), exams_open = coalesce(p_exams_open, exams_open),
         signups_open = coalesce(p_signups_open, signups_open), message = coalesce(left(p_message, 300), message), updated_at = now() where id;
  insert into public.audit_log (action, meta) values ('ops.set_status', jsonb_build_object('maintenance', p_maintenance, 'exams_open', p_exams_open, 'signups_open', p_signups_open));
  return 'ok';
end $$;
-- What happened in the last N hours (counts per action). First thing to run when something feels wrong.
create or replace function private.ops_events(p_hours int default 24) returns table (action text, events bigint, distinct_actors bigint, last_at timestamptz)
language sql stable security definer set search_path = '' as $$
  select a.action, count(*), count(distinct a.actor), max(a.at) from public.audit_log a
   where a.at > now() - make_interval(hours => least(greatest(p_hours, 1), 720)) group by a.action order by count(*) desc;
$$;
-- Accounts that signed in from many new devices recently (account-sharing or takeover signal).
create or replace function private.ops_suspicious(p_hours int default 24) returns table (kind text, subject text, detail text)
language sql stable security definer set search_path = '' as $$
  select 'new_devices'::text, l.actor::text, count(*)::text || ' new devices'
    from public.audit_log l where l.action = 'login.new_device' and l.at > now() - make_interval(hours => least(greatest(p_hours, 1), 720))
   group by l.actor having count(*) >= 3
  union all
  select 'integrity_spike', i.attempt_id::text, count(*)::text || ' tab/copy/offline events'
    from public.integrity_events i where i.at > now() - make_interval(hours => least(greatest(p_hours, 1), 720)) group by i.attempt_id having count(*) >= 10
  union all
  select 'too_fast', a.id::text, 'finished in ' || round(extract(epoch from (a.submitted_at - a.started_at)) / 60)::text || ' min of ' || p.minutes::text
    from public.attempts a join public.tests t on t.id = a.test_id join public.exam_patterns p on p.id = t.pattern_id
   where a.submitted_at > now() - make_interval(hours => least(greatest(p_hours, 1), 720))
     and extract(epoch from (a.submitted_at - a.started_at)) < p.minutes * 60 * 0.1
     and cardinality(array_remove(a.ans, null)) >= cardinality(a.ans) * 0.8;
$$;

-- ============================================================ function privileges
revoke all on all functions in schema private from public, anon, authenticated;
revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.is_admin() from public, anon;
revoke all on function public.save_profile(text, boolean, boolean, text, text), public.list_tests(text), public.start_attempt(int),
                       public.get_attempt(uuid), public.save_state(uuid, jsonb), public.submit_attempt(uuid), public.get_result(uuid),
                       public.get_review(uuid, int), public.log_event(uuid, text), public.export_my_data(), public.delete_my_account(),
                       public.track(text, text), public.admin_stats(int), public.get_status(),
                       public.note_device(text), public.list_devices(text) from public, anon;
grant execute on function public.track(text, text), public.get_status() to anon, authenticated;
grant execute on function public.is_admin(), public.admin_stats(int), public.note_device(text), public.list_devices(text), public.save_profile(text, boolean, boolean, text, text),
                          public.list_tests(text), public.start_attempt(int), public.get_attempt(uuid), public.save_state(uuid, jsonb), public.submit_attempt(uuid),
                          public.get_result(uuid), public.get_review(uuid, int), public.log_event(uuid, text), public.export_my_data(),
                          public.delete_my_account() to authenticated;
