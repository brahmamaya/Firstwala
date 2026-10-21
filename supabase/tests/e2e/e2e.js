/* Browser end-to-end + accessibility (axe) + speed tests for Test Series. Needs: Chromium, `npm i` in this folder, PostgreSQL server binaries.
   Start the throwaway DB first:  bash db.sh   then:  node e2e.js   (SITE_ROOT / CHROMIUM env vars override paths). It answers Supabase calls with a mock that
   runs the REAL supabase/schema.sql, so UI and SQL are tested together. ~95 checks, ~2 minutes. */
// Real Chromium against the real built site; Supabase calls are answered by a mock that runs the REAL schema.sql in Postgres.
const http = require('http'), fs = require('fs'), path = require('path');
const { Client, Pool } = require('pg');
const { chromium } = require('playwright-core');

const ROOT = process.env.SITE_ROOT || path.resolve(__dirname, '../../..'), SUPA = 'https://lbyqvwkichjvrrzcddtq.supabase.co';
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.woff2': 'font/woff2', '.webmanifest': 'application/json', '.svg': 'image/svg+xml' };
let fails = 0;
const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };

const db = new Pool({ host: '/tmp', port: 5545, user: 'postgres', database: 't', max: 8 });
const log = [];

async function asUser(uid, fn) {
  const c = await db.connect();
  try {
    await c.query('begin'); await c.query(uid ? 'set local role authenticated' : 'set local role anon');
    await c.query("select set_config('request.jwt.claim.sub', $1, true)", [uid || '']);
    const r = await fn(c); await c.query('commit'); return r;
  } catch (e) { await c.query('rollback'); throw e; } finally { c.release(); }
}
async function mock(method, url, headers, body) {
  const u = new URL(url), p = u.pathname;
  const J = (s, o) => ({ status: s, body: o === undefined ? '' : JSON.stringify(o) });
  if (p === '/auth/v1/otp') return J(200, {});
  if (p === '/auth/v1/verify') {
    const b = JSON.parse(body);
    if (b.token !== '123456') return J(403, { code: 403, error_code: 'otp_expired', msg: 'Token has expired or is invalid' });
    const r = await db.query('insert into auth.users (email) values ($1) on conflict (email) do update set email=excluded.email returning id', [b.email]);
    const id = r.rows[0].id, exp = Math.floor(Date.now() / 1000) + 3600;
    return J(200, { access_token: 'tok-' + id, refresh_token: 'ref-' + id, expires_in: 3600, expires_at: exp, user: { id, email: b.email } });
  }
  if (p === '/auth/v1/logout') return J(204);
  const m = /^Bearer tok-(.+)$/.exec(headers.authorization || '');
  const uid = m && m[1];
  try {
    if (p.startsWith('/rest/v1/rpc/')) {
      const fn = p.split('/').pop(), args = JSON.parse(body || '{}'), keys = Object.keys(args);
      const sql = `select public.${fn}(${keys.map((k, i) => `${k} := $${i + 1}`).join(', ')}) as r`;
      const r = await asUser(uid, c => c.query(sql, keys.map(k => (args[k] !== null && typeof args[k] === 'object') ? JSON.stringify(args[k]) : args[k])));
      const out = r.rows[0].r; log.push({ fn, out }); return J(200, out === null ? undefined : out);
    }
    const table = p.split('/').pop(), q = u.searchParams;
    const where = []; const vals = [];
    for (const [k, v] of q) { if (['select', 'order'].includes(k)) continue; const mm = /^eq\.(.*)$/.exec(v); if (mm) { vals.push(mm[1]); where.push(`${k} = $${vals.length}::${k === 'published' ? 'boolean' : k === 'id' ? 'uuid' : 'text'}`); } }
    const sel = (q.get('select') || '*').replace(/[^a-z_,*]/g, '');
    const ord = q.get('order') ? ' order by ' + q.get('order').replace('.desc', ' desc').replace(/[^a-z_ ]/g, '') : '';
    const r = await asUser(uid, c => c.query(`select coalesce(json_agg(t), '[]') as r from (select ${sel} from public.${table.replace(/[^a-z_]/g, '')}${where.length ? ' where ' + where.join(' and ') : ''}${ord}) t`, vals));
    return J(200, r.rows[0].r);
  } catch (e) {
    const denied = /permission denied/.test(e.message);
    return J(denied ? 403 : 400, { code: e.code, message: e.message });
  }
}


const sleep = ms => new Promise(r => setTimeout(r, ms));
async function newPage(browser, opts = {}) {
  const ctx = await browser.newContext({ viewport: opts.viewport || { width: 1100, height: 900 }, acceptDownloads: true, bypassCSP: !!opts.bypassCSP, ignoreHTTPSErrors: !!opts.h2, serviceWorkers: opts.h2 ? 'block' : 'allow' });
  const page = await ctx.newPage();
  const st = { csp: [], err: [], ga: [], track: [], saves: [], offline: false };
  page.on('console', m => { if (/Content Security Policy|Refused to/.test(m.text())) st.csp.push(m.text()); });
  page.on('pageerror', e => st.err.push(e.message));
  page.on('dialog', d => d.accept());
  await page.route(/googletagmanager|google-analytics/, r => { st.ga.push(r.request().url()); r.abort(); });
  await page.route(SUPA + '/**', async route => {
    const req = route.request(), cors = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': '*' };
    if (st.offline) return route.abort('internetdisconnected');
    if (req.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: cors });
    if (/\/rpc\/save_state/.test(req.url())) st.saves.push(Date.now());
    if (/\/rpc\/track/.test(req.url())) st.track.push({ body: JSON.parse(req.postData() || '{}'), headers: req.headers() });
    const r = await mock(req.method(), req.url(), req.headers(), req.postData());
    route.fulfill({ status: r.status, headers: { ...cors, 'content-type': 'application/json' }, body: r.body });
  });
  return { ctx, page, st };
}
const OV = '.ps-ov';
// open the Test Series the way a student does: Rank mode -> exam -> "Test Series" pill
async function openSeries(page, exam = 'neet') {
  await page.click('[data-testid=mode-rank]');
  await page.click(`[data-testid=rank-${exam}]`);
  await page.waitForSelector('[data-testid=rk-series]');
  await page.click('[data-testid=rk-series]');
  await page.waitForSelector(OV + ':not([hidden])');
}
async function login(page, email, keep, exam) {
  await openSeries(page, exam);
  await page.waitForSelector(OV + ':not([hidden]) #ps-email');
  await page.fill('#ps-email', email);
  if (keep) await page.check('#ps-keep');
  await page.click(OV + ' button:has-text("Email me a code")');
  await page.waitForSelector('#ps-code'); await page.fill('#ps-code', '123456');
  await page.click(OV + ' button:has-text("Verify")');
}
async function acceptProfile(page, name, minor, parentEmail) {
  await page.waitForSelector('#ps-name'); await page.fill('#ps-name', name);
  await page.click(OV + (minor ? ' :text("Under 18")' : ' :text("18 or older")'));
  if (minor) { if (parentEmail) await page.fill('#ps-parent', parentEmail); await page.check('#ps-consent'); }
}


const until = async (fn, ms = 10000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { const v = await fn(); if (v) return v; await sleep(150); } return false; };
const keysOf = async (exam, series, paper = 1) => (await db.query('select k.ks from public.test_keys k join public.tests t on t.id = k.test_id where t.exam = $1 and t.series_no = $2 and t.paper = $3', [exam, series, paper])).rows[0].ks;
const secsOf = async (exam, series, paper = 1) => (await db.query('select p.sections from public.exam_patterns p join public.tests t on t.pattern_id = p.id where t.exam = $1 and t.series_no = $2 and t.paper = $3', [exam, series, paper])).rows[0].sections;
// independent marking in JS, to check the score the UI shows
function marks(sec, ans, key) {
  if (key === '*') return sec.c; if (ans == null || ans === '') return 0;
  if (sec.t === 'MCQ') return ans === key ? sec.c : sec.w;
  if (sec.t === 'MULTI') { if ([...ans].some(ch => !key.includes(ch))) return sec.w; return ans === key ? sec.c : (sec.p || 0) * ans.length; }
  const v = Number(ans), [lo, hi] = key.includes(':') ? key.split(':').map(Number) : [Number(key), Number(key)]; return v >= lo - 1e-6 && v <= hi + 1e-6 ? sec.c : sec.w;
}
const scoreOf = async (attemptId, exam, series, paper = 1) => {
  const a = (await db.query('select ans from public.attempts where id = $1', [attemptId])).rows[0].ans, secs = await secsOf(exam, series, paper), ks = await keysOf(exam, series, paper);
  let gi = 0, t = 0; for (const s of secs) for (let i = 0; i < s.n; i++, gi++) t += marks(s, a[gi], ks[gi].k); return t;
};
const lastAttempt = async email => (await db.query("select a.id, a.ans, a.fl, a.submitted_at, a.score from public.attempts a join auth.users u on u.id = a.user_id where u.email = $1 order by a.started_at desc limit 1", [email])).rows[0];
(async () => {
  const zlib = require('zlib');
  const srv = http.createServer((req, res) => {
    let f = path.join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname)); if (f.endsWith('/')) f += 'index.html';
    fs.readFile(f, (e, d) => { if (e) { res.writeHead(404); return res.end(); }
      const h = { 'content-type': MIME[path.extname(f)] || 'application/octet-stream' };
      if (/\.(js|css|html|json|webmanifest)$/.test(f) && /gzip/.test(req.headers['accept-encoding'] || '')) { h['content-encoding'] = 'gzip'; d = zlib.gzipSync(d, { level: 6 }); }
      res.writeHead(200, h); res.end(d); });
  }).listen(3200);
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'] });
  const BASE = 'http://localhost:3200/';
  const fresh = async (opts) => { const x = await newPage(browser, opts); await x.page.goto(BASE, { waitUntil: 'load' }); await x.page.click('.ga-ask :text("No thanks")').catch(() => {}); return x; };
  const SAVE = 'button:has-text("Save & Next")', opt = n => `.px label.px-o:nth-of-type(${n}) input`;
  const letterN = L => L.charCodeAt(0) - 64;
  const finishProfile = async (page, name) => { await acceptProfile(page, name, false); await page.check('#ps-terms'); await page.click(OV + ' button:has-text("Continue")'); };
  const startTest = async (page, n = 1, paper = 1) => {
    await page.click(OV + ` .ps-tcard:nth-child(${n}) button` + (paper > 1 ? `:has-text("Paper ${paper}")` : ''));
    await page.waitForSelector(OV + ' h2:has-text("General instructions")');
    await page.check('#ps-read'); await page.click(OV + ' button:has-text("I am ready to begin")'); await page.waitForSelector('.px-time', { timeout: 10000 });
  };

  // =================== 0. landing notice ===================
  console.log('\n=== 0. landing page: 10-second notice with the path ===');
  const N = await newPage(browser);
  await N.page.clock.install();
  await N.page.goto(BASE, { waitUntil: 'load' }); await N.page.click('.ga-ask :text("No thanks")').catch(() => {});
  await N.page.clock.fastForward(1000); await N.page.waitForSelector('[data-testid=series-note]');
  const note = await N.page.textContent('[data-testid=series-note]');
  ok(/Rank mode/.test(note) && /Test Series/.test(note) && /first 3/i.test(note), 'notice says the Test Series exists and the path: Rank mode -> exam -> Test Series');
  await N.page.hover('[data-testid=series-note]');
  ok(await N.page.evaluate(() => document.querySelector('.sn').classList.contains('paused')), 'it pauses while the pointer is on it (WCAG 2.2.1)');
  await N.page.mouse.move(5, 5); await N.page.clock.fastForward(11000);
  ok(await N.page.locator('[data-testid=series-note]').count() === 0, 'and disappears by itself after 10 seconds');
  await N.ctx.close();
  const N2 = await newPage(browser);
  await N2.page.goto(BASE, { waitUntil: 'load' }); await N2.page.click('.ga-ask :text("No thanks")').catch(() => {});
  await N2.page.waitForSelector('[data-testid=series-note]');
  await N2.page.click('[data-testid=series-note] button:has-text("Show me")');
  ok(await N2.page.waitForSelector('#rank-sub.open', { timeout: 3000 }).then(() => true, () => false), '"Show me" opens Rank mode and its exam buttons');
  ok(await N2.page.locator('[data-testid=series-note]').count() === 0, 'the notice closes once used');
  await N2.page.reload({ waitUntil: 'load' }); await sleep(1500);
  ok(await N2.page.locator('[data-testid=series-note]').count() === 0, 'it does not nag again in the same visit session');
  await N2.ctx.close();

  // =================== 1. the path: Rank mode -> exam -> Test Series ===================
  console.log('\n=== 1. entry points live inside Rank mode, per exam ===');
  const A = await fresh();
  ok(await A.page.locator('[data-testid=series-open], [data-testid=series-open-landing]').count() === 0, 'no stray Test Series button in the top bar or landing links');
  await A.page.click('[data-testid=mode-rank]'); await A.page.click('[data-testid=rank-jee]'); await A.page.waitForSelector('[data-testid=rk-series]');
  ok(/JEE Mains/.test(await A.page.getAttribute('[data-testid=rk-series]', 'aria-label')) && await A.page.getAttribute('[data-testid=rk-series]', 'data-series-exam') === 'JEE_MAIN', 'JEE Mains rank page has its own Test Series pill');
  await A.page.click('[data-testid=rk-back]'); await A.page.waitForSelector('[data-testid=rank-neet]');
  await A.page.click('[data-testid=rank-neet]'); await A.page.waitForSelector('[data-testid=rk-series]');
  ok(await A.page.getAttribute('[data-testid=rk-series]', 'data-series-exam') === 'NEET', 'NEET rank page has the NEET pill');
  await A.page.click('[data-testid=rk-back]'); await A.page.waitForSelector('[data-testid=rank-jeeadv]');
  await A.page.click('[data-testid=rank-jeeadv]'); await A.page.waitForSelector('[data-testid=rk-series]');
  ok(await A.page.getAttribute('[data-testid=rk-series]', 'data-series-exam') === 'JEE_ADV', 'JEE Advanced ("coming soon" page) also offers its Test Series');
  await A.page.reload({ waitUntil: 'load' }); await A.page.click('.ga-ask :text("No thanks")').catch(() => {});

  // =================== 2. login -> hub ===================
  console.log('\n=== 2. login, then the 30-test hub ===');
  await login(A.page, 'neet1@example.com', false, 'neet'); await finishProfile(A.page, 'Asha');
  await A.page.waitForSelector(OV + ' h1:has-text("NEET")');
  ok(/180 questions · 720 marks · 3 h/.test(await A.page.textContent(OV + ' .ps-muted')), 'hub header shows the real NEET 2026 pattern: 180 questions, 720 marks, 3 h');
  ok(await A.page.locator(OV + ' .ps-tcard').count() === 30, 'exactly 30 test slots');
  ok(await A.page.locator(OV + ' .ps-pill.free').count() === 3 && await A.page.locator(OV + ' .ps-pill.paid').count() === 27, 'tests 1-3 are FREE, 4-30 are PAID');
  ok(await A.page.locator(OV + ' .ps-tcard.soon').count() === 25, 'published tests are active, the other 25 show "Coming soon"');
  ok(await A.page.locator(OV + ' .ps-tcard:nth-child(4) button:has-text("Locked")').count() === 1, 'paid test 4 is locked');
  await A.page.click(OV + ' .ps-tcard:nth-child(4) button'); await A.page.waitForSelector(OV + ' .ps-banner:has-text("paid")');
  ok(true, 'tapping a locked test explains that payment is not open yet (no dead end)');
  ok((await db.query("select count(*)::int c from public.attempts")).rows[0].c === 0, 'nothing is started just by browsing');

  // =================== 3. instructions ===================
  console.log('\n=== 3. general instructions before the timer ===');
  await A.page.click(OV + ' .ps-tcard:nth-child(1) button');
  await A.page.waitForSelector(OV + ' h2:has-text("General instructions")');
  ok(await A.page.locator(OV + ' .ps-tbl tbody tr').count() === 4 && /\+4/.test(await A.page.textContent(OV + ' .ps-tbl')) && /−1/.test(await A.page.textContent(OV + ' .ps-tbl')), 'marking scheme table: 4 subjects, +4 / −1');
  ok(await A.page.locator(OV + ' .ps-lg').count() === 5, 'palette legend explains all 5 statuses');
  ok(await A.page.isDisabled(OV + ' button:has-text("I am ready to begin")'), '"I am ready to begin" stays disabled until the instructions are acknowledged');
  ok((await db.query("select count(*)::int c from public.attempts")).rows[0].c === 0, 'reading instructions does not start the clock');

  // =================== 4. NEET exam (180 questions) ===================
  console.log('\n=== 4. the exam screen: NEET, 180 questions ===');
  await A.page.check('#ps-read'); await A.page.click(OV + ' button:has-text("I am ready to begin")'); await A.page.waitForSelector('.px-time');
  ok(/Time Left: 02:59:/.test(await A.page.textContent('.px-time')), 'server timer starts at 3 hours');
  ok(await A.page.locator('.px-tab').count() === 4, 'subject tabs: Physics, Chemistry, Botany, Zoology');
  ok(await A.page.locator('.px-grid:visible .px-pb').count() === 45, 'palette shows the 45 questions of the current subject');
  ok((await A.page.textContent('.px h2')) === 'Question 1 of 180', 'starts on question 1 of 180');
  ok(await A.page.evaluate(() => document.querySelector('.ps-ov').classList.contains('ps-full')) && await A.page.locator(OV + ' .ps-bar:visible').count() === 0, 'full-screen exam mode (the site header is out of the way)');
  const qlabel = n => A.page.getAttribute(`.px-pb[aria-label^="Question ${n},"]`, 'aria-label');
  const keys = await keysOf('NEET', 1);
  await A.page.click(opt(2));
  ok(/Not saved yet/.test(await A.page.textContent('.px-hint')), 'choosing an option shows "not saved yet" (real-exam rule: only Save & Next records it)');
  await A.page.click('.px-pb[aria-label^="Question 5,"]');
  ok(/Not answered/.test(await qlabel(1)), 'leaving a question without Save & Next does not record the answer');
  await A.page.click('.px-pb[aria-label^="Question 1,"]'); ok(!(await A.page.isChecked(opt(2))), 'and the unsaved choice is gone when you come back');
  const before = A.st.saves.length;
  for (let i = 1; i <= 15; i++) {
    const right = keys[i - 1].k, wrong = 'ABCD'.replace(right, '')[0];
    if (i === 4) { await A.page.click('.px ' + SAVE); continue; }                                   // skipped on purpose
    await A.page.click(opt(letterN(i <= 10 ? right : wrong)));
    await A.page.click(i === 3 ? '.px button:has-text("Mark for Review & Next")' : '.px ' + SAVE);
  }
  ok(/Answered and marked/.test(await qlabel(3)) && /Not answered/.test(await qlabel(4)) && /^Question 1, Answered$/.test(await qlabel(1)), 'palette shows Answered / Answered & marked / Not answered correctly');
  ok(/Not answered/.test(await qlabel(16)), 'the next question is "visited, not answered"');
  ok(await until(async () => { const r = (await lastAttempt('neet1@example.com')); return r && r.ans[14] != null && r.ans[0] === keys[0].k; }, 9000), 'answers reached the database');
  ok(A.st.saves.length - before <= 4, `15 Save & Next clicks were sent in ${A.st.saves.length - before} batched request(s), not 15`);
  let at = await lastAttempt('neet1@example.com');
  ok(at.ans.slice(0, 15).every((a, i) => i === 3 ? a == null : (i < 10 ? a === keys[i].k : a !== keys[i].k)) && at.fl[2] === 3 && at.fl[3] === 1, 'stored: right answers, wrong answers, the skipped question, and the "marked" flag on Q3');
  await A.page.click('.px-pb[aria-label^="Question 2,"]'); ok(await A.page.isChecked(opt(letterN(keys[1].k))), 'a saved answer is shown again when you return to it');
  await A.page.click('.px button:has-text("Clear Response")'); ok(/Not answered/.test(await qlabel(2)), 'Clear Response removes the answer');
  await A.page.click(opt(letterN(keys[1].k))); await A.page.click('.px ' + SAVE);
  await A.page.click('.px-tab:has-text("Chemistry")');
  ok((await A.page.textContent('.px h2')) === 'Question 46 of 180' && await A.page.locator('.px-grid:visible .px-pb').count() === 45, 'switching subject shows that subject\'s questions and palette');
  ok(!/Sample solution|"k":/.test(await A.page.content()), 'the page holds no solutions or answer keys while the test runs');
  await A.page.evaluate(() => { Object.defineProperty(document, 'hidden', { value: true, configurable: true }); document.dispatchEvent(new Event('visibilitychange')); Object.defineProperty(document, 'hidden', { value: false, configurable: true }); document.dispatchEvent(new Event('visibilitychange')); document.querySelector('.px-q').dispatchEvent(new Event('copy', { bubbles: true, cancelable: true })); });
  ok(await until(async () => (await db.query("select count(*)::int c from public.integrity_events")).rows[0].c >= 3, 6000), 'tab switch and copy attempt are recorded');
  ok(await A.page.evaluate(() => { const e = new MouseEvent('contextmenu', { bubbles: true, cancelable: true }); document.querySelector('.px-q').dispatchEvent(e); return e.defaultPrevented; }), 'right-click is blocked on the paper');

  console.log('--- no internet in the middle of the exam ---');
  await A.page.click('.px-tab:has-text("Physics")'); await A.page.click('.px-pb[aria-label^="Question 16,"]');
  A.st.offline = true;
  await A.page.click(opt(letterN(keys[15].k))); await A.page.click('.px ' + SAVE);
  ok(await until(async () => /No connection/.test(await A.page.textContent('.px-status')), 9000), 'offline: the screen says answers are kept and will be sent');
  ok((await lastAttempt('neet1@example.com')).ans[15] == null, '... and nothing reached the server yet');
  A.st.offline = false;
  ok(await until(async () => (await lastAttempt('neet1@example.com')).ans[15] === keys[15].k, 15000), 'internet is back: the answer is delivered by itself');

  console.log('--- submit ---');
  await A.page.click('.px button:has-text("Submit")'); await A.page.waitForSelector('.px-modal');
  ok(await A.page.locator('.px-modal tbody tr').count() === 4 && /Answered & marked/.test(await A.page.textContent('.px-modal thead')), 'submit summary lists every section: answered, not answered, marked, not visited');
  await A.page.click('.px-modal button:has-text("Yes, submit")'); await A.page.waitForSelector(OV + ' .ps-score');
  at = await lastAttempt('neet1@example.com');
  const exp = await scoreOf(at.id, 'NEET', 1);
  ok(at.submitted_at && (await A.page.textContent(OV + ' .ps-big2')).trim().startsWith(String(exp)), `the scorecard shows ${exp} / 720, the same as an independent marking of the stored answers`);
  ok(/first to finish/.test(await A.page.textContent(OV + ' .ps-score')), 'rank line (first student to finish this test)');
  await A.page.click(OV + ' details.ps-sec:nth-of-type(1) summary'); await A.page.waitForSelector(OV + ' details.ps-sec:nth-of-type(1) .ps-q2');
  ok(await A.page.locator(OV + ' details.ps-sec:nth-of-type(1) .ps-q2').count() === 45, 'review loads the 45 questions of Physics only when you open that section');
  await A.page.click(OV + ' details.ps-sec:nth-of-type(1) .ps-q2:nth-child(1) summary'); await A.page.waitForSelector(OV + ' .ps-rb .ps-sub');
  ok(/Sample solution 1\./.test(await A.page.textContent(OV + ' .ps-rb')) && await A.page.locator(OV + ' .ps-rb .ps-opt.right').count() === 1, 'a reviewed question shows its solution and the correct option');

  console.log('--- resume ---');
  await A.page.click(OV + ' button:has-text("All tests")'); await A.page.waitForSelector(OV + ' .ps-tcard');
  ok(await A.page.locator(OV + ' .ps-tcard:nth-child(1) button.done').count() === 1, 'finished test shows its result on the card');
  await startTest(A.page, 2);
  const k2 = await keysOf('NEET', 2);
  for (let i = 1; i <= 3; i++) { await A.page.click(opt(letterN(k2[i - 1].k))); await A.page.click('.px ' + SAVE); }
  ok(await until(async () => (await lastAttempt('neet1@example.com')).ans[2] === k2[2].k, 9000), 'three answers saved');
  await A.page.reload({ waitUntil: 'load' }); await A.page.click('.ga-ask :text("No thanks")').catch(() => {});
  await openSeries(A.page, 'neet'); await A.page.waitForSelector(OV + ' .ps-tcard');
  await A.page.click(OV + ' .ps-tcard:nth-child(2) button:has-text("Resume")'); await A.page.waitForSelector('.px-time');
  ok(/^Question 1, Answered$/.test(await A.page.getAttribute('.px-pb[aria-label^="Question 1,"]', 'aria-label')) && (await A.page.textContent('.px h2')) === 'Question 4 of 180', 'after a reload the test resumes where the student stopped, answers intact');
  await A.page.click('.px button:has-text("Submit")'); await A.page.click('.px-modal button:has-text("Yes, submit")'); await A.page.waitForSelector(OV + ' .ps-score');

  console.log('--- the server, not the screen, decides what is free ---');
  const tok = await A.page.evaluate(() => JSON.parse(sessionStorage.getItem('physica-series-auth')).access_token);
  const paidId = (await db.query("select id from public.tests where exam='NEET' and series_no=4")).rows[0].id;
  const direct = await A.page.evaluate(async ([t, id]) => { const r = await fetch('https://lbyqvwkichjvrrzcddtq.supabase.co/rest/v1/rpc/start_attempt', { method: 'POST', headers: { apikey: 'x', Authorization: 'Bearer ' + t, 'content-type': 'application/json' }, body: JSON.stringify({ p_test_id: id }) }); return [r.status, await r.text()]; }, [tok, paidId]);
  ok(direct[0] === 400 && /not_enrolled/.test(direct[1]), 'calling start_attempt for paid test 4 directly (bypassing the screen) is refused: not_enrolled');
  await db.query("insert into public.enrollments (user_id, test_id) select u.id, $1 from auth.users u where u.email = 'neet1@example.com'", [paidId]);
  await A.page.click(OV + ' button:has-text("All tests")'); await A.page.waitForSelector(OV + ' .ps-tcard');
  ok(await A.page.locator(OV + ' .ps-tcard:nth-child(4) button:has-text("Start")').count() === 1, 'once enrolled (payment webhook) the paid test unlocks');
  await db.query("delete from public.enrollments");

  // =================== 5. JEE Main: sections, numerical keypad ===================
  console.log('\n=== 5. JEE Main: sections and the numerical keypad ===');
  const J = await fresh();
  await login(J.page, 'jee1@example.com', false, 'jee'); await finishProfile(J.page, 'Ravi'); await J.page.waitForSelector(OV + ' h1:has-text("JEE Main")');
  ok(/75 questions · 300 marks · 3 h/.test(await J.page.textContent(OV + ' .ps-muted')), 'JEE Main pattern: 75 questions, 300 marks, 3 h');
  await startTest(J.page, 1);
  ok(await J.page.locator('.px-tab').count() === 3, 'subject tabs: Physics, Chemistry, Mathematics');
  ok(await J.page.locator('.px-chip').count() === 2, 'sections A and B appear as chips inside the subject');
  await J.page.click('.px-chip:has-text("Section B")');
  ok((await J.page.textContent('.px h2')) === 'Question 21 of 75' && await J.page.locator('.px-num').count() === 1, 'Section B opens at question 21 with the numerical keypad');
  for (const k of ['7', '.', '5', 'bs', '5']) await J.page.click(k === 'bs' ? '.px-kp button[aria-label=backspace]' : `.px-kp button:text-is("${k}")`);
  ok(await J.page.inputValue('.px-num input') === '7.5', 'keypad: 7 . 5 ⌫ 5 -> 7.5');
  await J.page.click('.px ' + SAVE);
  await J.page.fill('.px-num input', 'x1y2'); ok(await J.page.inputValue('.px-num input') === '12', 'typing letters is ignored in a numerical answer');
  await J.page.click('.px ' + SAVE);
  await J.page.click('.px-kp button:text-is("3")'); await J.page.click('.px button:has-text("Mark for Review & Next")');
  ok(await until(async () => { const r = await lastAttempt('jee1@example.com'); return r.ans[20] === '7.5' && r.ans[21] === '12' && r.ans[22] === '3' && r.fl[22] === 3; }, 9000), 'numerical answers 7.5, 12, 3 stored; Q23 marked for review');
  await J.page.click('.px button:has-text("Submit")'); await J.page.click('.px-modal button:has-text("Yes, submit")'); await J.page.waitForSelector(OV + ' .ps-score');
  const atJ = await lastAttempt('jee1@example.com');
  ok((await J.page.textContent(OV + ' .ps-big2')).trim().startsWith(String(await scoreOf(atJ.id, 'JEE_MAIN', 1))), 'JEE Main scorecard equals independent marking');
  await J.page.click(OV + ' details.ps-sec:nth-of-type(2) summary'); await J.page.waitForSelector(OV + ' details.ps-sec:nth-of-type(2) .ps-q2');
  await J.page.click(OV + ' details.ps-sec:nth-of-type(2) .ps-q2:nth-child(1) summary'); await J.page.waitForSelector(OV + ' .ps-rb');
  ok(/Your answer: 7\.5/.test(await J.page.textContent(OV + ' .ps-rb')), 'numerical review shows your value and the correct one');
  ok(J.st.err.length === 0 && J.st.csp.length === 0, 'JEE Main session: no page errors, no CSP violations');
  await J.ctx.close();

  // =================== 6. JEE Advanced: multiple-correct, two papers, deadline ===================
  console.log('\n=== 6. JEE Advanced: multiple correct, two papers, time up ===');
  const D = await fresh();
  await login(D.page, 'adv1@example.com', false, 'jeeadv'); await finishProfile(D.page, 'Kabir'); await D.page.waitForSelector(OV + ' h1:has-text("JEE Advanced")');
  ok(await D.page.locator(OV + ' .ps-tcard:nth-child(1) button').count() === 2 && /2 papers/.test(await D.page.textContent(OV + ' .ps-muted')), 'every Advanced test shows Paper 1 and Paper 2');
  await startTest(D.page, 1, 1);
  await D.page.click('.px-chip:has-text("Section 2")');
  ok(/per right option/.test(await D.page.textContent('.px-mk')) && await D.page.locator('.px label.px-o input[type=checkbox]').count() === 4, 'multiple-correct question: checkboxes and the partial-marking rule are shown');
  await D.page.click(opt(1)); await D.page.click(opt(3)); await D.page.click('.px ' + SAVE);
  ok(await until(async () => (await lastAttempt('adv1@example.com')).ans[4] === 'AC', 9000), 'selecting A and C is stored as "AC"');
  await D.page.click('.px-pb[aria-label^="Question 5,"]'); await D.page.click(opt(1)); await D.page.click(opt(3));
  await D.page.click('.px button:has-text("Clear Response")'); ok(/Not answered/.test(await D.page.getAttribute('.px-pb[aria-label^="Question 5,"]', 'aria-label')), 'clearing a multiple-correct answer');
  await D.page.click('.px-pb[aria-label^="Question 5,"]'); await D.page.click(opt(2)); await D.page.click(opt(4)); await D.page.click('.px ' + SAVE);
  await D.page.click('.px button:has-text("Submit")'); await D.page.click('.px-modal button:has-text("Yes, submit")'); await D.page.waitForSelector(OV + ' .ps-score');
  const atD = await lastAttempt('adv1@example.com');
  ok((await D.page.textContent(OV + ' .ps-big2')).trim().startsWith(String(await scoreOf(atD.id, 'JEE_ADV', 1, 1))), 'JEE Advanced scorecard equals independent marking (incl. partial credit rules)');
  await D.page.click(OV + ' button:has-text("All tests")'); await D.page.waitForSelector(OV + ' .ps-tcard');
  await startTest(D.page, 1, 2);
  await db.query("update public.attempts set deadline = now() + interval '2 seconds' where id = (select a.id from public.attempts a join auth.users u on u.id = a.user_id join public.tests t on t.id = a.test_id where u.email = 'adv1@example.com' and t.paper = 2)");
  // the screen's clock still says plenty of time; the next save is refused by the server, and that is what ends the test
  await sleep(4500);
  let up = await D.page.waitForSelector('.px-modal :text("Time is up")', { timeout: 20000 }).then(() => true, () => false);
  if (!up) { await D.page.click(opt(1)).catch(() => {}); await D.page.click('.px ' + SAVE).catch(() => {}); up = await D.page.waitForSelector('.px-modal :text("Time is up")', { timeout: 15000 }).then(() => true, () => false); }
  ok(up, 'when the server says time is over, the student sees "Time is up"');
  ok(await D.page.waitForSelector(OV + ' .ps-score', { timeout: 15000 }).then(() => true, () => false), 'and the test is submitted automatically, scorecard shown');
  ok((await db.query("select count(*)::int c from public.attempts a join auth.users u on u.id=a.user_id where u.email='adv1@example.com' and a.submitted_at is not null")).rows[0].c === 2, 'both papers are submitted in the database');
  await D.ctx.close();

  // =================== 7. analytics: opt-in, anonymous counters ===================
  console.log('\n=== 7. analytics: off by default; anonymous counters only ===');
  const G = await newPage(browser);
  await G.page.goto(BASE, { waitUntil: 'load' }); await sleep(900);
  ok(G.st.ga.length === 0 && await G.page.locator('.ga-ask button').count() === 2, 'no request to Google before a choice; banner has two equal choices');
  ok(G.st.track.filter(t => t.body.p_event === 'visit').length === 1 && G.st.track.every(t => Object.keys(t.body).sort().join() === 'p_event,p_key' && !t.headers.cookie && !t.headers.authorization), 'one anonymous "visit" counter: only {event, key}, no cookie, no token');
  ok((await G.ctx.cookies()).length === 0, 'the site sets no cookies');
  await G.page.click('.ga-ask :text("18+")'); await sleep(700); ok(G.st.ga.some(u => /googletagmanager/.test(u)), 'Google Analytics loads only after an explicit "Yes, I am 18+"');
  await G.ctx.close();
  const DNT = await newPage(browser); await DNT.page.addInitScript(() => Object.defineProperty(navigator, 'doNotTrack', { get: () => '1' })); await DNT.page.goto(BASE, { waitUntil: 'load' }); await sleep(700);
  ok(DNT.st.track.length === 0, 'Do-Not-Track is honoured: nothing is counted'); await DNT.ctx.close();

  // =================== 8. account: data rights ===================
  console.log('\n=== 8. account: download, log out everywhere, delete ===');
  await A.page.click(OV + ' button:has-text("All tests")').catch(() => {}); await A.page.waitForSelector(OV + ' .ps-tcard');
  await A.page.click(OV + ' button.ps-link[title="Your account and data"]'); await A.page.waitForSelector(OV + ' h1:has-text("Your account")');
  const [dl] = await Promise.all([A.page.waitForEvent('download'), A.page.click(OV + ' button:has-text("Download my data")')]);
  const exp2 = JSON.parse(fs.readFileSync(await dl.path(), 'utf8'));
  ok(dl.suggestedFilename() === 'physica-my-data.json' && exp2.account.email === 'neet1@example.com' && exp2.attempts.length === 2 && Array.isArray(exp2.attempts[0].attempt.ans), 'export: JSON with the account and both attempts (compact answer arrays)');
  ok(!/Sample solution|"k":/.test(JSON.stringify(exp2)), 'export holds no answer keys');
  await A.page.click(OV + ' button:has-text("Log out on all devices")'); await A.page.waitForSelector('#ps-email');
  ok(await A.page.evaluate(() => sessionStorage.getItem('physica-series-auth')) === null, 'log out everywhere clears the local token');
  await A.page.fill('#ps-email', 'neet1@example.com'); await A.page.click(OV + ' button:has-text("Email me a code")'); await A.page.waitForSelector('#ps-code'); await A.page.fill('#ps-code', '123456'); await A.page.click(OV + ' button:has-text("Verify")');
  await A.page.waitForSelector(OV + ' .ps-tcard'); await A.page.click(OV + ' button.ps-link[title="Your account and data"]'); await A.page.waitForSelector('#ps-del');
  await A.page.click(OV + ' button:has-text("Delete my account")'); ok(await A.page.locator('.ps-err:has-text("Type DELETE")').count() === 1, 'delete needs the typed confirmation');
  await A.page.fill('#ps-del', 'DELETE'); await A.page.click(OV + ' button:has-text("Delete my account")'); await A.page.waitForSelector('#ps-email');
  const gone = (await db.query("select (select count(*) from auth.users where email='neet1@example.com')::int u, (select count(*) from public.attempts a where not exists (select 1 from auth.users x where x.id=a.user_id))::int orphan")).rows[0];
  ok(gone.u === 0 && gone.orphan === 0, 'account and all attempts erased');
  ok(A.st.err.length === 0 && A.st.csp.length === 0, 'NEET session: no page errors, no CSP violations' + (A.st.err[0] ? ': ' + A.st.err[0] : '') + (A.st.csp[0] ? ': ' + A.st.csp[0] : ''));
  await A.ctx.close();

  // =================== 9. phone: minors, "keep me signed in", palette drawer ===================
  console.log('\n=== 9. on a phone (390 px): minor sign-up, palette drawer, no sideways scroll ===');
  const M = await newPage(browser, { viewport: { width: 390, height: 800 } });
  await M.page.goto(BASE, { waitUntil: 'load' }); await M.page.click('.ga-ask :text("No thanks")').catch(() => {});
  await login(M.page, 'kid@example.com', true, 'neet'); await M.page.waitForSelector('#ps-name');
  ok(await M.page.evaluate(() => !!localStorage.getItem('physica-series-auth') && sessionStorage.getItem('physica-series-auth') === null), '"Keep me signed in" uses localStorage');
  await acceptProfile(M.page, 'Ravi', true, null); await M.page.check('#ps-terms'); await M.page.click(OV + ' button:has-text("Continue")'); await M.page.waitForSelector('.ps-err:has-text("valid email")');
  await M.page.fill('#ps-parent', 'not-an-email'); await M.page.click(OV + ' button:has-text("Continue")'); await M.page.waitForSelector('.ps-err:has-text("valid email")');
  await M.page.fill('#ps-parent', '  Dad@Example.COM  '); await M.page.click(OV + ' button:has-text("Continue")'); await M.page.waitForSelector(OV + ' .ps-tcard');
  const kid = (await db.query("select parent_email from public.profiles p join auth.users u on u.id=p.id where u.email='kid@example.com'")).rows[0];
  ok(kid.parent_email === 'dad@example.com', 'under 18: parent email is required, validated on the server and normalised');
  ok(await M.page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'hub: no sideways scroll on a 390 px phone');
  await M.page.screenshot({ path: '/tmp/mobile-hub.png' });
  await startTest(M.page, 3);
  const off = await M.page.evaluate(() => document.querySelector('.px-pal').getBoundingClientRect().left);
  ok(off >= 380, 'the palette is tucked away (a drawer) so the question gets the whole screen');
  ok(await M.page.evaluate(() => { const b = document.querySelector('.px-bar').getBoundingClientRect(); return b.bottom <= innerHeight + 1 && b.top > innerHeight / 2; }), 'Save & Next / Mark / Clear stay reachable at the bottom');
  await M.page.screenshot({ path: '/tmp/mobile-exam.png' });
  await M.page.click('.px-pt'); await sleep(450); ok(await M.page.evaluate(() => document.querySelector('.px-pal').getBoundingClientRect().left < 200), '"☰ Palette" slides the question palette in');
  await M.page.screenshot({ path: '/tmp/mobile-palette.png' });
  await M.page.click('.px-pb[aria-label^="Question 10,"]'); await sleep(350);
  ok((await M.page.textContent('.px h2')) === 'Question 10 of 180' && await M.page.evaluate(() => document.querySelector('.px-pal').getBoundingClientRect().left >= 380), 'choosing a number jumps there and closes the drawer');
  ok(await M.page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'exam: no sideways scroll on the phone');
  await M.ctx.close();

  // =================== 10. idle logout on shared computers ===================
  console.log('\n=== 10. idle logout ===');
  const I = await newPage(browser); await I.page.clock.install(); await I.page.goto(BASE, { waitUntil: 'load' }); await I.page.click('.ga-ask :text("No thanks")').catch(() => {});
  await login(I.page, 'idle@example.com', false, 'neet'); await finishProfile(I.page, 'Omar'); await I.page.waitForSelector(OV + ' .ps-tcard');
  await I.page.clock.fastForward('31:00'); await I.page.waitForSelector('#ps-email', { timeout: 8000 }).catch(() => {});
  ok(await I.page.locator('#ps-email').count() === 1, 'an unattended, non-remembered session is signed out after 30 minutes'); await I.ctx.close();

  // =================== 11. legal pages ===================
  console.log('\n=== 11. legal pages ===');
  const L = await newPage(browser);
  for (const pg of ['privacy.html', 'terms.html']) { await L.page.goto(BASE + pg, { waitUntil: 'load' }); await sleep(250); const txt = await L.page.textContent('main'); ok(/2026-10-21/.test(txt) && !/undefined|NaN/.test(txt), pg + ' loads, version 2026-10-21'); }
  await L.page.goto(BASE + 'privacy.html', { waitUntil: 'load' }); await sleep(250);
  ok(/seconds you spent on each question/.test(await L.page.textContent('main')), 'privacy policy discloses the per-question time data we now store');
  ok(/OFF/.test(await L.page.textContent('#analytics-choice')), 'privacy page shows the analytics switch (OFF by default)');
  await L.page.click('#analytics-choice button'); await sleep(150); ok(/ON/.test(await L.page.textContent('#analytics-choice')), 'switch turns on'); await L.page.click('#analytics-choice button'); await sleep(150); ok(/OFF/.test(await L.page.textContent('#analytics-choice')), 'and off again');
  ok(L.st.ga.length === 0 && L.st.csp.length === 0, 'legal pages: no Google request, no CSP violations'); await L.ctx.close();

  // =================== 12. incident UI ===================
  console.log('\n=== 12. incident UI: maintenance, new-device alert, lock, lockdown ===');
  const P = await fresh();
  await login(P.page, 'victim@example.com', true, 'neet'); await finishProfile(P.page, 'Neha'); await P.page.waitForSelector(OV + ' .ps-tcard');
  await db.query("select private.ops_set_status(true, null, null, 'Scheduled maintenance 10 pm')");
  await P.page.reload({ waitUntil: 'load' }); await P.page.click('.ga-ask :text("No thanks")').catch(() => {}); await openSeries(P.page, 'neet');
  await P.page.waitForSelector(OV + ' .ps-banner:has-text("Scheduled maintenance")'); ok(true, 'maintenance notice shown on the hub');
  await P.page.click(OV + ' .ps-tcard:nth-child(1) button'); await P.page.check('#ps-read'); await P.page.click(OV + ' button:has-text("I am ready to begin")');
  await P.page.waitForSelector(OV + ' .ps-err:has-text("cannot be started")'); ok(true, 'starting a test during maintenance gives a clear message (and nothing was started)');
  await db.query("select private.ops_set_status(false, null, null, null); update public.app_settings set message = null");
  const P2 = await fresh(); await login(P2.page, 'victim@example.com', false, 'neet'); await P2.page.waitForSelector(OV + ' .ps-tcard'); await P2.ctx.close();
  await P.page.reload({ waitUntil: 'load' }); await P.page.click('.ga-ask :text("No thanks")').catch(() => {}); await openSeries(P.page, 'neet');
  await P.page.waitForSelector(OV + ' .ps-banner[role=alert]:has-text("New sign-in")'); ok(true, 'a login from a new device raises an alert on the owner\'s other device');
  await P.page.click(OV + ' button:has-text("This was me")'); ok(await P.page.locator(OV + ' .ps-banner[role=alert]').count() === 0, '"This was me" dismisses it');
  await db.query("select private.ops_lock_user('victim@example.com', 'test')");
  await P.page.reload({ waitUntil: 'load' }); await P.page.click('.ga-ask :text("No thanks")').catch(() => {}); await openSeries(P.page, 'neet');
  await P.page.waitForSelector(OV + ' h2:has-text("Account locked")'); ok(true, 'a locked account sees "Account locked" with a way to get help');
  await db.query("select private.ops_unlock_user('victim@example.com')"); await db.query("select private.ops_panic(true)");
  await P.page.reload({ waitUntil: 'load' }); await P.page.click('.ga-ask :text("No thanks")').catch(() => {}); await openSeries(P.page, 'neet');
  await P.page.waitForSelector(OV + ' h2:has-text("Back soon")'); ok(true, 'lockdown shows "Back soon"');
  await db.query("select private.ops_panic(false)"); await P.page.click(OV + ' button:has-text("Try again")'); await P.page.waitForSelector(OV + ' .ps-tcard'); ok(true, 'service returns as soon as the lockdown is lifted');
  ok(P.st.err.length === 0 && P.st.csp.length === 0, 'no page errors / CSP violations during incident screens'); await P.ctx.close();

  // =================== 13. accessibility (axe-core, WCAG 2.1 AA) ===================
  console.log('\n=== 13. accessibility: axe-core on every screen, both themes, keyboard only ===');
  const axeSrc = fs.readFileSync(path.join(__dirname, 'node_modules/axe-core/axe.min.js'), 'utf8');
  const X = await newPage(browser, { bypassCSP: true });
  const axe = async (label, scope = '.ps-ov:not([hidden])') => {
    for (const theme of ['dark', 'light']) {
      await X.page.evaluate(t => { document.documentElement.dataset.theme = t; }, theme); await X.page.waitForTimeout(500);
      const res = await X.page.evaluate(async sc => { const r = await axe.run(document.querySelector(sc) || document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } }); return r.violations.map(v => ({ id: v.id, impact: v.impact, sample: v.nodes[0].html.slice(0, 140) })); }, scope);
      ok(res.length === 0, `axe ${label} [${theme}]: no WCAG 2.1 AA violations` + (res.length ? ' -> ' + res.map(v => `${v.id}(${v.impact}) ${v.sample}`).join(' | ') : ''));
    }
  };
  await X.page.goto(BASE, { waitUntil: 'load' }); await X.page.addScriptTag({ content: axeSrc }); await X.page.click('.ga-ask :text("No thanks")').catch(() => {});
  await X.page.waitForSelector('[data-testid=series-note]'); await axe('landing notice', '.sn');
  await openSeries(X.page, 'neet'); await X.page.waitForSelector('#ps-email');
  ok(await X.page.evaluate(() => document.querySelector('.ps-ov').contains(document.activeElement)), 'focus moves into the dialog when it opens');
  ok(await X.page.evaluate(() => [...document.body.children].filter(e => e.tagName !== 'SCRIPT' && !e.classList.contains('ps-ov') && !e.classList.contains('ga-ask') && !e.classList.contains('sn')).every(e => e.hasAttribute('inert'))), 'the rank page behind the dialog is inert (not reachable by keyboard or screen reader)');
  await axe('login');
  await X.page.fill('#ps-email', 'ax1@example.com'); await X.page.keyboard.press('Enter'); await X.page.waitForSelector('#ps-code'); await X.page.fill('#ps-code', '123456'); await X.page.keyboard.press('Enter');
  await X.page.waitForSelector('#ps-name'); await axe('profile');
  await X.page.fill('#ps-name', 'Kabir'); await X.page.click(OV + ' :text("Under 18")'); await X.page.fill('#ps-parent', 'mom@example.com'); await X.page.check('#ps-consent'); await X.page.check('#ps-terms'); await axe('profile (under 18)');
  await X.page.keyboard.press('Enter'); await X.page.waitForSelector(OV + ' .ps-tcard'); await axe('test hub');
  await X.page.click(OV + ' .ps-tcard:nth-child(1) button'); await X.page.waitForSelector(OV + ' h2:has-text("General instructions")'); await axe('instructions');
  await X.page.check('#ps-read'); await X.page.click(OV + ' button:has-text("I am ready to begin")'); await X.page.waitForSelector('.px-time'); await axe('exam (single-correct)', '.px');
  await X.page.click('.px-pb[aria-label^="Question 3,"]'); await X.page.click(opt(2)); await X.page.click('.px button:has-text("Mark for Review & Next")'); await axe('exam (marked question)', '.px');
  await X.page.click('.px button:has-text("Instructions")'); await X.page.waitForSelector('.px-modal'); await axe('exam instructions dialog', '.px-modal'); await X.page.keyboard.press('Escape');
  await X.page.click('.px button:has-text("Submit")'); await X.page.waitForSelector('.px-modal'); await axe('submit summary dialog', '.px-modal');
  let esc = 0; for (let i = 0; i < 30; i++) { await X.page.keyboard.press('Tab'); if (!await X.page.evaluate(() => document.querySelector('.px-modal').contains(document.activeElement))) esc++; }
  ok(esc === 0, 'Tab stays inside the submit dialog (focus trap, 30 presses)');
  await X.page.click('.px-modal button:has-text("Yes, submit")'); await X.page.waitForSelector(OV + ' .ps-score'); await axe('scorecard');
  await X.page.click(OV + ' details.ps-sec:nth-of-type(1) summary'); await X.page.waitForSelector(OV + ' details.ps-sec:nth-of-type(1) .ps-q2'); await X.page.click(OV + ' details.ps-sec:nth-of-type(1) .ps-q2:nth-child(3) summary'); await axe('answer review');
  await X.page.click(OV + ' button.ps-link[title="Your account and data"]'); await X.page.waitForSelector('#ps-del'); await axe('account');
  await X.page.keyboard.press('Escape');
  ok(await X.page.locator(OV + '[hidden]').count() === 1, 'Escape closes the dialog (outside an exam)');
  await X.ctx.close();

  // =================== 14. speed on a slow phone connection ===================
  console.log('\n=== 14. speed on slow 4G (HTTP/2 + gzip, like Netlify / GitHub Pages / Cloudflare) ===');
  require('child_process').execSync('openssl req -x509 -newkey rsa:2048 -nodes -keyout /tmp/ps-k.pem -out /tmp/ps-c.pem -subj /CN=localhost -days 1 2>/dev/null');
  const h2 = require('http2');
  const h2srv = h2.createSecureServer({ key: fs.readFileSync('/tmp/ps-k.pem'), cert: fs.readFileSync('/tmp/ps-c.pem'), allowHTTP1: true }, (req, res) => {
    let f = path.join(ROOT, decodeURIComponent(new URL(req.url, 'https://x').pathname)); if (f.endsWith('/')) f += 'index.html';
    fs.readFile(f, (e, d) => { if (e) { res.writeHead(404); return res.end(); }
      const hd = { 'content-type': MIME[path.extname(f)] || 'application/octet-stream' };
      if (/\.(js|css|html|json|webmanifest)$/.test(f) && /gzip/.test(req.headers['accept-encoding'] || '')) { hd['content-encoding'] = 'gzip'; d = zlib.gzipSync(d, { level: 6 }); }
      res.writeHead(200, hd); res.end(d); });
  }).listen(3443);
  const S = await newPage(browser, { h2: true });
  const H2 = 'https://localhost:3443/';
  await S.page.goto(H2, { waitUntil: 'load' }); await S.page.click('.ga-ask :text("No thanks")').catch(() => {});
  await login(S.page, 'slow@example.com', false, 'neet'); await finishProfile(S.page, 'Slow'); await S.page.waitForSelector(OV + ' .ps-tcard');
  await S.page.reload({ waitUntil: 'load' }); await S.page.click('.ga-ask :text("No thanks")').catch(() => {});
  await S.page.click('[data-testid=mode-rank]'); await S.page.click('[data-testid=rank-neet]'); await S.page.waitForSelector('[data-testid=rk-series]');
  const cdp = await S.ctx.newCDPSession(S.page);
  await cdp.send('Network.enable'); await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 1.6 * 1024 * 1024 / 8, uploadThroughput: 750 * 1024 / 8 });   // Chrome's "Slow 4G" preset
  const hub = await S.page.evaluate(() => new Promise(res => { const t0 = performance.now(), mo = new MutationObserver(() => { if (document.querySelector('.ps-tcard')) { mo.disconnect(); res(Math.round(performance.now() - t0)); } }); mo.observe(document.documentElement, { childList: true, subtree: true }); document.querySelector('[data-testid=rk-series]').click(); }));
  ok(hub < 2500, `Rank page -> Test Series hub in ${hub} ms on slow 4G (< 2500)`);
  await S.page.click(OV + ' .ps-tcard:nth-child(1) button'); await S.page.waitForSelector(OV + ' h2:has-text("General instructions")'); await sleep(1500);
  await S.page.check('#ps-read');
  const ex = await S.page.evaluate(() => new Promise(res => { const t0 = performance.now(), mo = new MutationObserver(() => { if (document.querySelector('.px-time')) { mo.disconnect(); res(Math.round(performance.now() - t0)); } }); mo.observe(document.documentElement, { childList: true, subtree: true }); [...document.querySelectorAll('.ps-ov button')].find(b => /ready to begin/.test(b.textContent)).click(); }));
  ok(ex < 2500, `"I am ready to begin" -> 180-question paper on screen in ${ex} ms on slow 4G (< 2500)`);
  const kb = await S.page.evaluate(() => performance.getEntriesByType('resource').filter(r => /physica-series/.test(r.name)).map(r => [r.name.split('/').pop().split('?')[0], Math.round(r.transferSize / 1024)]));
  console.log('   transferred:', JSON.stringify(kb));
  ok(kb.every(([n, k]) => k <= 14), 'both Test Series files together are small (each <= 14 KB over the wire)');
  await S.ctx.close(); h2srv.close();

  await browser.close(); srv.close(); await db.end();
  console.log(fails ? `\n${fails} FAILED` : '\nALL E2E CHECKS PASSED');
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error('CRASH', e); process.exit(2); });
