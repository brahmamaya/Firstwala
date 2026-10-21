// Concurrency + fuzz tests against a real Postgres loaded with supabase/schema.sql. Run through run.sh.
const { Pool } = require('pg');
const pool = new Pool({ host: process.env.PGHOST || '/tmp', port: Number(process.env.PGPORT || 5548), user: process.env.PGUSER || 'postgres', password: process.env.PGPASSWORD, database: 't', max: 40 });
let fails = 0;
const ok = (c, m) => { console.log((c ? 'PASS  ' : 'FAIL  ') + m); if (!c) fails++; };

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
const T1 = 'aaaaaaaa-0000-0000-0000-000000000001', Q = i => `bbbbbbbb-0000-0000-0000-00000000000${i}`;
const KNOWN = /^(not_authenticated|rate_limited|attempt_not_found|attempt_closed|attempt_in_progress|question_not_found|test_not_found|test_not_open|test_closed|not_enrolled|profile_incomplete|terms_outdated|consent_required|invalid_[a-z_]+)$/;

(async () => {
  const users = [1, 2, 3, 4, 5, 6].map(U);
  for (const u of users) { await su('insert into auth.users (id, email) values ($1, $2)', [u, u + '@x.test']); await su("update public.profiles set is_minor=false, display_name='S', terms_version='2026-10-21', terms_accepted_at=now() where id=$1", [u]); }
  await su(`insert into public.tests (id, title, exam, duration_min, published) values ($1,'T','NEET',30,true)`, [T1]);
  await su(`insert into public.questions (id,test_id,position,subject,type,body,options) values
     ($2,$1,1,'PHYSICS','MCQ','q1','["a","b","c","d"]'),($3,$1,2,'PHYSICS','NUMERICAL','q2','[]'),($4,$1,3,'MATHS','MCQ','q3','["a","b"]')`, [T1, Q(1), Q(2), Q(3)]);
  await su(`insert into public.question_keys values ($1,'1','SECRET-1'),($2,'10','SECRET-2'),($3,'0','SECRET-3')`, [Q(1), Q(2), Q(3)]);

  console.log('\n=== L. concurrency ===');
  // 1. start_attempt storm: one attempt, everyone gets the same id
  let rs = await Promise.all(Array.from({ length: 25 }, () => call(users[0], 'select public.start_attempt($1) as id', [T1])));
  const ids = new Set(rs.filter(r => r.ok).map(r => r.rows[0].id));
  const n1 = (await su('select count(*)::int c from public.attempts where user_id=$1', [users[0]])).rows[0].c;
  ok(rs.every(r => r.ok) && ids.size === 1 && n1 === 1, '25 parallel start_attempt -> exactly 1 attempt, same id for all');
  const A = [...ids][0];

  // 2. save/submit race: the stored answers must always reproduce the stored score
  const saves = [];
  for (let k = 0; k < 120; k++) saves.push(call(users[0], 'select public.save_answer($1,$2,$3)', [A, Q(1 + (k % 3)), ['0', '1', '1', '10', '1', '0'][k % 6] === '10' && k % 3 !== 1 ? '1' : (k % 3 === 1 ? '10' : '1')]));
  const submits = Array.from({ length: 12 }, (_, k) => new Promise(r => setTimeout(r, 5 + k)).then(() => call(users[0], 'select public.submit_attempt($1) as s', [A])));
  const all = await Promise.all([...saves, ...submits]);
  const scores = new Set(all.filter(r => r.ok && r.rows[0] && r.rows[0].s !== undefined).map(r => r.rows[0].s));
  const att = (await su('select score, submitted_at from public.attempts where id=$1', [A])).rows[0];
  const recomputed = (await su(`select coalesce(sum(private.score_answer(q.type,k.correct_answer,q.marks,q.negative,r.answer)),0)::int s
      from public.questions q join public.question_keys k on k.question_id=q.id left join public.responses r on r.question_id=q.id and r.attempt_id=$1 where q.test_id=$2`, [A, T1])).rows[0].s;
  ok(att.submitted_at !== null && scores.size === 1 && [...scores][0] === att.score, '12 parallel submits all return the same score');
  ok(recomputed === att.score, `stored answers reproduce the stored score under a save/submit race (${recomputed} == ${att.score})`);
  const subs = (await su("select count(*)::int c from public.audit_log where action='attempt.submit' and entity_id=$1", [A])).rows[0].c;
  ok(subs === 1, 'exactly one attempt.submit audit row despite 12 concurrent submits');
  const late = await call(users[0], 'select public.save_answer($1,$2,$3)', [A, Q(1), '0']);
  ok(!late.ok && /attempt_closed/.test(late.e.message), 'no write is accepted after the attempt is closed');

  // 2b. deterministic race: a submit holds the attempt lock while a late save arrives (must wait, then be rejected)
  const C = (await call(users[2], 'select public.start_attempt($1) as id', [T1])).rows[0].id;
  await call(users[2], 'select public.save_answer($1,$2,$3)', [C, Q(1), '0']);                 // wrong answer saved: score will be -1
  const open = async uid => { const c = await pool.connect(); await c.query('begin'); await c.query('set local role authenticated');
    await c.query("select set_config('request.jwt.claim.sub', $1, true), set_config('request.jwt.claims', $2, true)", [uid, JSON.stringify({ sub: uid, aal: 'aal1' })]); return c; };
  const cA = await open(users[2]), cB = await open(users[2]);
  await cA.query('select public.submit_attempt($1)', [C]);                                       // lock held, not yet committed
  let bDone = false, bErr = null;
  const bP = cB.query('select public.save_answer($1,$2,$3)', [C, Q(1), '1']).then(() => { bDone = true; }, e => { bErr = e; });
  await new Promise(r => setTimeout(r, 400));
  const blocked = !bDone && !bErr;
  await cA.query('commit'); await bP; try { await cB.query('rollback'); } catch {} cA.release(); cB.release();
  const c2 = (await su('select score from public.attempts where id=$1', [C])).rows[0].score;
  const r2 = (await su(`select coalesce(sum(private.score_answer(q.type,k.correct_answer,q.marks,q.negative,r.answer)),0)::int s
      from public.questions q join public.question_keys k on k.question_id=q.id left join public.responses r on r.question_id=q.id and r.attempt_id=$1 where q.test_id=$2`, [C, T1])).rows[0].s;
  ok(blocked, 'a late save WAITS while a submit holds the attempt lock');
  ok(bErr && /attempt_closed/.test(bErr.message), 'and is rejected once the submit commits');
  ok(c2 === r2 && c2 === -1, `stored answers still equal the scored answers (${r2} == ${c2})`);

  // 3. rate limit holds under parallel load (all in one fixed window unless the clock rolls over)
  await su('truncate private.rate_limits');
  const [, B] = [0, (await call(users[1], 'select public.start_attempt($1) as id', [T1])).rows[0].id];
  const burst = await Promise.all(Array.from({ length: 700 }, () => call(users[1], 'select public.save_answer($1,$2,$3)', [B, Q(1), '1'])));
  const okN = burst.filter(r => r.ok).length, limited = burst.filter(r => !r.ok && /rate_limited/.test(r.e.message)).length;
  ok(limited > 0 && okN <= 600 && okN + limited === 700, `700 parallel saves -> ${okN} accepted, ${limited} rate-limited (limit 300/min, <= 600 across a window edge)`);

  console.log('\n=== M. fuzz: hostile inputs must only ever produce known, safe errors ===');
  const evil = ['', ' ', "'", "''", '"', '\\', "'; drop table public.attempts; --", '" or 1=1 --', '%', '%s', '${7*7}', '{{7*7}}', '<script>alert(1)</script>', '../../etc/passwd',
    'null', 'NULL', 'true', '[]', '{}', '{"a":1}', '1e999', '-0', 'ａｂｃ', '١٢٣', '‮', '\u0000'.replace('\u0000', ''), '🤖'.repeat(50), 'A'.repeat(100000), '9'.repeat(5000), 'x'.repeat(33), '00000000-0000-0000-0000-000000000000', 'bbbbbbbb-0000-0000-0000-000000000001'];
  const rnd = a => a[Math.floor(Math.random() * a.length)];
  const uuids = [A, B, T1, Q(1), Q(2), Q(3), U(9), ...evil];
  const fns = [
    ['select public.start_attempt($1::uuid)', 1], ['select public.get_attempt($1::uuid)', 1], ['select public.get_result($1::uuid)', 1],
    ['select public.submit_attempt($1::uuid)', 1], ['select public.save_answer($1::uuid,$2::uuid,$3)', 3], ['select public.log_event($1::uuid,$2,$3::jsonb)', 3],
    ['select public.save_profile($1,$2::boolean,$3::boolean,$4,$5)', 5],
  ];
  const tablesBefore = (await su("select count(*)::int c from information_schema.tables where table_schema='public'")).rows[0].c;
  let calls = 0, bad = [], leaks = 0;
  for (let i = 0; i < 1500; i++) {
    const [sql, n] = rnd(fns);
    const args = Array.from({ length: n }, (_, k) => Math.random() < 0.15 ? null : rnd(Math.random() < 0.5 ? uuids : evil));
    const u = rnd(users.slice(2));
    const r = await call(u, sql, args); calls++;
    if (r.ok) { if (/correct_answer|SECRET/.test(JSON.stringify(r.rows))) leaks++; continue; }
    const m = r.e.message || '', code = r.e.code || '';
    const safe = KNOWN.test(m) || /^22/.test(code) || /^23/.test(code) || /^(28000|P0001|P0002|42501)$/.test(code) || /invalid input syntax|invalid input value|out of range|malformed|value too long|invalid byte sequence|unsupported Unicode|could not be converted/i.test(m);
    if (!safe) bad.push(`${sql} -> [${code}] ${m.slice(0, 100)}`);
  }
  ok(bad.length === 0, `${calls} hostile calls: no unexpected / internal errors${bad.length ? ' e.g. ' + bad[0] : ''}`);
  ok(leaks === 0, 'no fuzzed call ever returned an answer key or solution');
  const tables = (await su("select count(*)::int c from information_schema.tables where table_schema='public'")).rows[0].c;
  ok(tables === tablesBefore && tables >= 10, `all ${tablesBefore} public tables still exist after SQL-injection payloads`);

  await pool.end();
  console.log(fails ? `\n${fails} FAILED` : '\nALL STRESS CHECKS PASSED');
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error('CRASH', e); process.exit(2); });
