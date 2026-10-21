// Concurrency, fuzz, scoring cross-check, storage and load tests against a real Postgres loaded with supabase/schema.sql
// + the sample tests from tools/series-import.js. Run through run.sh / ../run-external.sh.
const { Pool } = require('pg');
const pool = new Pool({ host: process.env.PGHOST || '/tmp', port: Number(process.env.PGPORT || 5548), user: process.env.PGUSER || 'postgres', password: process.env.PGPASSWORD, database: 't', max: 40 });
let fails = 0;
const ok = (c, m) => { console.log((c ? 'PASS  ' : 'FAIL  ') + m); if (!c) fails++; };
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function as(uid, aal, fn) {
  const c = await pool.connect();
  try {
    await c.query('begin'); await c.query('set local role authenticated');
    await c.query("select set_config('request.jwt.claim.sub', $1, true), set_config('request.jwt.claims', $2, true)", [uid, JSON.stringify({ sub: uid, aal: aal || 'aal1' })]);
    const r = await fn(c); await c.query('commit'); return r;
  } catch (e) { try { await c.query('rollback'); } catch {} throw e; } finally { c.release(); }
}
const call = (uid, sql, args = []) => as(uid, 'aal1', c => c.query(sql, args)).then(r => ({ ok: true, rows: r.rows }), e => ({ ok: false, e }));
const su = (sql, args) => pool.query(sql, args);
const U = n => `${n}`.repeat(8) + '-' + `${n}`.repeat(4) + '-' + `${n}`.repeat(4) + '-' + `${n}`.repeat(4) + '-' + `${n}`.repeat(12);
const KNOWN = /^(not_authenticated|rate_limited|attempt_not_found|attempt_closed|attempt_in_progress|test_not_found|test_not_open|test_closed|not_enrolled|profile_incomplete|terms_outdated|consent_required|exams_paused|lockdown|account_locked|invalid_[a-z_]+)$/;

// An independent JS implementation of the marking rules, used to cross-check the SQL scoring.
function points(sec, ans, key) {
  if (key === '*') return sec.c;
  if (ans == null || ans.trim() === '') return 0;
  if (sec.t === 'MCQ') return ans === key ? sec.c : sec.w;
  if (sec.t === 'MULTI') { if ([...ans].some(ch => !key.includes(ch))) return sec.w; return ans === key ? sec.c : (sec.p || 0) * ans.length; }
  const v = Number(ans); if (!Number.isFinite(v)) return sec.w;
  const [lo, hi] = key.includes(':') ? key.split(':').map(Number) : [Number(key), Number(key)];
  return v >= lo - 1e-6 && v <= hi + 1e-6 ? sec.c : sec.w;
}
async function jsScore(attemptId) {
  const a = (await su('select a.ans, a.test_id from public.attempts a where a.id = $1', [attemptId])).rows[0];
  const pat = (await su('select p.sections from public.exam_patterns p join public.tests t on t.pattern_id = p.id where t.id = $1', [a.test_id])).rows[0].sections;
  const ks = (await su('select ks from public.test_keys where test_id = $1', [a.test_id])).rows[0].ks;
  let gi = 0, total = 0; for (const s of pat) for (let i = 0; i < s.n; i++, gi++) total += points(s, a.ans[gi], ks[gi].k); return total;
}
const testId = async (exam, series, paper = 1) => (await su('select id from public.tests where exam=$1 and series_no=$2 and paper=$3', [exam, series, paper])).rows[0].id;
const sections = async tid => (await su('select p.sections from public.exam_patterns p join public.tests t on t.pattern_id = p.id where t.id=$1', [tid])).rows[0].sections;
const keysOf = async tid => (await su('select ks from public.test_keys where test_id=$1', [tid])).rows[0].ks;
// build a plausible answer for question i of a paper (right ~60% of the time)
const guess = (sec, key, r) => sec.t === 'NUM' ? (r < .6 ? (key.includes(':') ? key.split(':')[0] : key) : '7') : sec.t === 'MCQ' ? (r < .6 ? key : 'A') : (r < .5 ? key : r < .8 ? key[0] : 'D');

(async () => {
  const users = [1, 2, 3, 4, 5, 6].map(U);
  for (const u of users) { await su('insert into auth.users (id, email) values ($1, $2)', [u, u + '@x.test']); await su("update public.profiles set is_minor=false, display_name='S', terms_version='2026-10-21', terms_accepted_at=now() where id=$1", [u]); }
  const MAIN1 = await testId('JEE_MAIN', 1), NEET1 = await testId('NEET', 1);

  console.log('\n=== O. concurrency ===');
  let rs = await Promise.all(Array.from({ length: 25 }, () => call(users[0], 'select public.start_attempt($1) as id', [MAIN1])));
  const ids = new Set(rs.filter(r => r.ok).map(r => r.rows[0].id));
  ok(rs.every(r => r.ok) && ids.size === 1 && (await su('select count(*)::int c from public.attempts where user_id=$1', [users[0]])).rows[0].c === 1, '25 parallel start_attempt -> exactly 1 attempt, same id for all');
  const A = [...ids][0];
  const secsM = await sections(MAIN1), keysM = await keysOf(MAIN1);
  const items = [];
  { let gi = 0; for (const s of secsM) for (let i = 0; i < s.n; i++, gi++) items.push([gi + 1, guess(s, keysM[gi].k, Math.random()), 1, 1]); }
  const saves = []; for (let k = 0; k < 40; k++) saves.push(call(users[0], 'select public.save_state($1,$2::jsonb)', [A, JSON.stringify(items.slice(k * 2, k * 2 + 6))]));
  const submits = Array.from({ length: 12 }, (_, k) => new Promise(r => setTimeout(r, 4 + k)).then(() => call(users[0], 'select public.submit_attempt($1) as s', [A])));
  const all = await Promise.all([...saves, ...submits]);
  const scores = new Set(all.filter(r => r.ok && r.rows[0] && r.rows[0].s !== undefined).map(r => r.rows[0].s));
  const att = (await su('select score, submitted_at from public.attempts where id=$1', [A])).rows[0];
  ok(att.submitted_at !== null && scores.size === 1 && [...scores][0] === att.score, '12 parallel submits all return the same score');
  const js = await jsScore(A);
  ok(js === att.score, `SQL scoring == independent JS scoring on the stored answers (${att.score} == ${js}); also proves answers and score agree after a save/submit race`);
  ok((await su("select count(*)::int c from public.audit_log where action='attempt.submit' and entity_id=$1", [A])).rows[0].c === 1, 'exactly one attempt.submit audit row despite 12 concurrent submits');
  const late = await call(users[0], 'select public.save_state($1,$2::jsonb)', [A, '[[1,"A",1,0]]']);
  ok(!late.ok && /attempt_closed/.test(late.e.message), 'no write is accepted after the attempt is closed');

  // deterministic race: a submit holds the attempt lock while a late save arrives (it must wait, then be rejected)
  const C = (await call(users[2], 'select public.start_attempt($1) as id', [MAIN1])).rows[0].id;
  await call(users[2], 'select public.save_state($1,$2::jsonb)', [C, '[[1,"A",1,1]]']);
  const open = async uid => { const c = await pool.connect(); await c.query('begin'); await c.query('set local role authenticated');
    await c.query("select set_config('request.jwt.claim.sub', $1, true), set_config('request.jwt.claims', $2, true)", [uid, JSON.stringify({ sub: uid, aal: 'aal1' })]); return c; };
  const cA = await open(users[2]), cB = await open(users[2]);
  await cA.query('select public.submit_attempt($1)', [C]);
  let bDone = false, bErr = null;
  const bP = cB.query('select public.save_state($1,$2::jsonb)', [C, '[[1,"B",1,1]]']).then(() => { bDone = true; }, e => { bErr = e; });
  await sleep(400); const blocked = !bDone && !bErr;
  await cA.query('commit'); await bP; try { await cB.query('rollback'); } catch {} cA.release(); cB.release();
  ok(blocked, 'a late save WAITS while a submit holds the attempt lock');
  ok(bErr && /attempt_closed/.test(bErr.message), 'and is rejected once the submit commits');
  ok(await jsScore(C) === (await su('select score from public.attempts where id=$1', [C])).rows[0].score, 'stored answers still equal the scored answers');

  await su('truncate private.rate_limits');
  const B = (await call(users[1], 'select public.start_attempt($1) as id', [MAIN1])).rows[0].id;
  const burst = await Promise.all(Array.from({ length: 700 }, () => call(users[1], 'select public.save_state($1,$2::jsonb)', [B, '[[1,"B",1,0]]'])));
  const okN = burst.filter(r => r.ok).length, limited = burst.filter(r => !r.ok && /rate_limited/.test(r.e.message)).length;
  ok(limited > 0 && okN <= 600 && okN + limited === 700, `700 parallel saves -> ${okN} accepted, ${limited} rate-limited (limit 300/min, <= 600 across a window edge)`);

  console.log('\n=== P. every rule of the engine vs the independent JS marking (random answers, all 3 patterns) ===');
  let mism = 0, checked = 0;
  for (const [exam, series, paper, n] of [['JEE_MAIN', 2, 1, 6], ['NEET', 2, 1, 6], ['JEE_ADV', 2, 1, 6], ['JEE_ADV', 2, 2, 6]]) {
    const tid = await testId(exam, series, paper), secs = await sections(tid), keys = await keysOf(tid);
    for (let u = 0; u < n; u++) {
      const uid = '00000000-0000-4000-8000-' + String(100 + checked + mism + u + 10 * ['JEE_MAIN', 'NEET', 'JEE_ADV'].indexOf(exam) + 40 * paper).padStart(12, '0');
      await su('insert into auth.users (id, email) values ($1,$2) on conflict do nothing', [uid, uid + '@x.test']);
      await su("update public.profiles set is_minor=false, display_name='S', terms_version='2026-10-21', terms_accepted_at=now() where id=$1", [uid]);
      const a = (await call(uid, 'select public.start_attempt($1) as id', [tid])); if (!a.ok) continue;
      const its = []; let gi = 0;
      for (const s of secs) for (let i = 0; i < s.n; i++, gi++) { const r = Math.random(); if (r < .15) continue; its.push([gi + 1, s.t === 'NUM' && r > .95 ? '0' : guess(s, keys[gi].k, Math.random()), 1, 1]); }
      for (let k = 0; k < its.length; k += 50) await call(uid, 'select public.save_state($1,$2::jsonb)', [a.rows[0].id, JSON.stringify(its.slice(k, k + 50))]);
      const sql = (await call(uid, 'select public.submit_attempt($1) as s', [a.rows[0].id])).rows[0].s, js2 = await jsScore(a.rows[0].id);
      checked++; if (sql !== js2) { mism++; console.log('   mismatch', exam, sql, js2); }
    }
  }
  ok(mism === 0 && checked >= 12, `${checked} full-length attempts (JEE Main, NEET, JEE Advanced p1+p2): SQL score == JS score every time`);

  console.log('\n=== Q. fuzz: hostile inputs must only ever produce known, safe errors ===');
  const evil = ['', ' ', "'", "''", '"', '\\', "'; drop table public.attempts; --", '" or 1=1 --', '%', '%s', '${7*7}', '{{7*7}}', '<script>alert(1)</script>', '../../etc/passwd',
    'null', 'NULL', 'true', '[]', '{}', '{"a":1}', '[[1,"A",1,0]]', '[[0,"A",1,0]]', '[["x"]]', '[', '1e999', '-0', '9999999999999', '-5', 'ａｂｃ', '١٢٣', '‮', '🤖'.repeat(50), 'A'.repeat(100000), '9'.repeat(5000), 'x'.repeat(33)];
  const rnd = a => a[Math.floor(Math.random() * a.length)];
  const uuids = [A, B, C, U(9), '00000000-0000-0000-0000-000000000000', ...evil], ints = ['0', '1', '-1', '3', '99', '2147483647', '99999999999', ...MAIN1 ? [String(MAIN1), String(NEET1)] : [], ...evil];
  const fns = [
    ['select public.start_attempt($1::int)', ['i']], ['select public.list_tests($1)', ['t']], ['select public.get_attempt($1::uuid)', ['u']], ['select public.get_result($1::uuid)', ['u']],
    ['select public.get_review($1::uuid,$2::int)', ['u', 'i']], ['select public.submit_attempt($1::uuid)', ['u']], ['select public.save_state($1::uuid,$2::jsonb)', ['u', 't']],
    ['select public.log_event($1::uuid,$2)', ['u', 't']], ['select public.save_profile($1,$2::boolean,$3::boolean,$4,$5)', ['t', 't', 't', 't', 't']], ['select public.note_device($1)', ['t']], ['select public.list_devices($1)', ['t']],
  ];
  const tablesBefore = (await su("select count(*)::int c from information_schema.tables where table_schema='public'")).rows[0].c;
  let calls = 0, bad = [], leaks = 0;
  for (let i = 0; i < 1800; i++) {
    const [sql, kinds] = rnd(fns);
    const args = kinds.map(k => Math.random() < 0.12 ? null : rnd(k === 'u' ? uuids : k === 'i' ? ints : evil));
    const r = await call(rnd(users.slice(3)), sql, args); calls++;
    if (r.ok) { if (/"k"|SECRET|explanation/.test(JSON.stringify(r.rows).replace(/"e":/g, 'x'))) { if (!/get_review/.test(sql)) leaks++; } continue; }
    const m = r.e.message || '', code = r.e.code || '';
    const safe = KNOWN.test(m) || /^22/.test(code) || /^23/.test(code) || /^(28000|P0001|P0002|42501)$/.test(code) || /invalid input syntax|invalid input value|out of range|malformed|value too long|invalid byte sequence|unsupported Unicode|could not be converted|too many|token/i.test(m);
    if (!safe) bad.push(`${sql} -> [${code}] ${m.slice(0, 100)}`);
  }
  ok(bad.length === 0, `${calls} hostile calls: no unexpected / internal errors${bad.length ? ' e.g. ' + bad[0] : ''}`);
  ok(leaks === 0, 'no fuzzed call before submission ever returned an answer key or solution');
  const tables = (await su("select count(*)::int c from information_schema.tables where table_schema='public'")).rows[0].c;
  ok(tables === tablesBefore && tables >= 10, `all ${tablesBefore} public tables still exist after SQL-injection payloads`);

  console.log('\n=== R. load + storage: 300 students sit a full 180-question NEET paper together ===');
  await su(`insert into auth.users (id,email) select gen_random_uuid(), 'load'||g||'@x.test' from generate_series(1,300) g`);
  await su(`update public.profiles set is_minor=false, display_name='L', terms_version='2026-10-21', terms_accepted_at=now() where id in (select id from auth.users where email like 'load%')`);
  const lids = (await su("select id from auth.users where email like 'load%'")).rows.map(r => r.id);
  const secsN = await sections(NEET1), keysN = await keysOf(NEET1);
  const lat = { start: [], get: [], save: [], submit: [] }; let getBytes = 0;
  const timed = async (k, fn) => { const t0 = performance.now(); const r = await fn(); lat[k].push(performance.now() - t0); return r; };
  const student = async uid => {
    const a = (await timed('start', () => call(uid, 'select public.start_attempt($1) as id', [NEET1]))).rows[0].id;
    const g = await timed('get', () => call(uid, 'select public.get_attempt($1) as j', [a])); getBytes = JSON.stringify(g.rows[0].j).length;
    // a student answering with "Save & Next": changes are batched (~6 questions per call), not one request per click
    const all = []; let gi = 0; for (const s of secsN) for (let i = 0; i < s.n; i++, gi++) all.push([gi + 1, guess(s, keysN[gi].k, Math.random()), 1, 12]);
    for (let k = 0; k < all.length; k += 6) await timed('save', () => call(uid, 'select public.save_state($1,$2::jsonb)', [a, JSON.stringify(all.slice(k, k + 6))]));
    await timed('submit', () => call(uid, 'select public.submit_attempt($1)', [a]));
  };
  const t0 = performance.now(); let next = 0;
  await Promise.all(Array.from({ length: 60 }, async () => { while (next < lids.length) await student(lids[next++]); }));
  const secs = (performance.now() - t0) / 1000;
  const pct = (a, p) => { const b = [...a].sort((x, y) => x - y); return b[Math.min(b.length - 1, Math.floor(b.length * p))]; };
  for (const k of Object.keys(lat)) console.log(`   ${k.padEnd(6)} n=${String(lat[k].length).padStart(5)}  p50=${pct(lat[k], .5).toFixed(0)}ms  p95=${pct(lat[k], .95).toFixed(0)}ms  max=${Math.max(...lat[k]).toFixed(0)}ms`);
  const calls2 = lat.start.length + lat.get.length + lat.save.length + lat.submit.length;
  console.log(`   total ${secs.toFixed(1)}s -> ${(calls2 / secs).toFixed(0)} API calls/s;  get_attempt response ${(getBytes / 1024).toFixed(0)} KB`);
  const done = (await su("select count(*)::int c from public.attempts where test_id=$1 and submitted_at is not null and user_id in (select id from auth.users where email like 'load%')", [NEET1])).rows[0].c;
  ok(done === 300, 'all 300 students finished: started, answered 180 questions each in batches, submitted, no errors');
  ok(pct(lat.get, .95) < 400, `get_attempt p95 ${pct(lat.get, .95).toFixed(0)}ms < 400ms (the exam-start spike)`);
  ok(pct(lat.save, .95) < 250, `save_state p95 ${pct(lat.save, .95).toFixed(0)}ms < 250ms`);
  ok(pct(lat.start, .95) < 400 && pct(lat.submit, .95) < 500, `start p95 ${pct(lat.start, .95).toFixed(0)}ms and submit p95 ${pct(lat.submit, .95).toFixed(0)}ms within budget`);
  await su('vacuum full analyze public.attempts');   // reclaim the churn of ~30 in-place updates per attempt, as autovacuum does in production
  const st = (await su(`select count(*)::int n, round(avg(pg_column_size(a.*)))::int row_bytes, round(avg(pg_column_size(a.ans)+pg_column_size(a.fl)+pg_column_size(a.tm)))::int state_bytes,
      pg_total_relation_size('public.attempts')::bigint total from public.attempts a where a.test_id=$1`, [NEET1])).rows[0];
  console.log(`   storage: ${st.n} NEET attempts -> avg row ${st.row_bytes} bytes (answers+flags+time = ${st.state_bytes} bytes); whole attempts table after vacuum ${(Number(st.total) / 1024).toFixed(0)} KB incl. indexes`);
  const perAttempt = Number(st.total) / (await su('select count(*)::int c from public.attempts')).rows[0].c;
  console.log(`   => 10,000 students x 30 tests = 300,000 attempts ~ ${(300000 * perAttempt / 1048576).toFixed(0)} MB  (estimate for a row-per-answer design: ~ ${(300000 * 180 * 110 / 1048576 / 1024).toFixed(1)} GB)`);
  ok(st.row_bytes < 2000, `a full 180-question attempt is ${st.row_bytes} bytes (< 2000): one small row, not 180 rows`);
  ok(getBytes < 200 * 1024, `the whole paper downloads in ${(getBytes / 1024).toFixed(0)} KB before compression`);

  await pool.end();
  console.log(fails ? `\n${fails} FAILED` : '\nALL STRESS CHECKS PASSED');
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error('CRASH', e); process.exit(2); });
