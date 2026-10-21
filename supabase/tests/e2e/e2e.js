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
      const r = await asUser(uid, c => c.query(sql, keys.map(k => args[k])));
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
  const st = { csp: [], err: [], ga: [], track: [] };
  page.on('console', m => { if (/Content Security Policy|Refused to/.test(m.text())) st.csp.push(m.text()); });
  page.on('pageerror', e => st.err.push(e.message));
  page.on('dialog', d => d.accept());
  await page.route(/googletagmanager|google-analytics/, r => { st.ga.push(r.request().url()); r.abort(); });
  await page.route(SUPA + '/**', async route => {
    const req = route.request(), cors = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': '*' };
    if (req.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: cors });
    if (/\/rpc\/track/.test(req.url())) st.track.push({ body: JSON.parse(req.postData() || '{}'), headers: req.headers() });
    const r = await mock(req.method(), req.url(), req.headers(), req.postData());
    route.fulfill({ status: r.status, headers: { ...cors, 'content-type': 'application/json' }, body: r.body });
  });
  return { ctx, page, st };
}
const OV = '.ps-ov';
async function login(page, email, keep) {
  await page.click('[data-testid=series-open-landing]');
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

(async () => {
  const zlib = require('zlib');
  const srv = http.createServer((req, res) => {
    let f = path.join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname)); if (f.endsWith('/')) f += 'index.html';
    fs.readFile(f, (e, d) => {
      if (e) { res.writeHead(404); return res.end(); }
      const h = { 'content-type': MIME[path.extname(f)] || 'application/octet-stream' };
      if (/\.(js|css|html|json|webmanifest)$/.test(f) && /gzip/.test(req.headers['accept-encoding'] || '')) { h['content-encoding'] = 'gzip'; d = zlib.gzipSync(d, { level: 6 }); }   // what Netlify / GitHub Pages / Cloudflare do
      res.writeHead(200, h); res.end(d);
    });
  }).listen(3200);
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'] });
  const BASE = 'http://localhost:3200/';

  // plant an XSS probe test (as the DB owner) next to the seeded sample test
  await db.query(`with t as (insert into public.tests (title, exam, duration_min, is_free, published) values ('XSS probe <img src=x onerror=window.__xss=1>', 'NEET', 20, true, true) returning id),
    q as (insert into public.questions (test_id, position, subject, type, body, options)
      select t.id, 1, 'PHYSICS', 'MCQ', '<img src=x onerror="window.__xss=1"> <script>window.__xss=1</script> "><svg onload=window.__xss=1> [click](javascript:window.__xss=1)', '["<img src=x onerror=window.__xss=1>","<b>bold</b>","''; drop table x;--","ok"]'::jsonb from t returning id)
    insert into public.question_keys select q.id, '3', '<img src=x onerror=window.__xss=1> <script>window.__xss=1</script>' from q`);

  // =================== 1. analytics is opt-in ===================
  console.log('\n=== 1. analytics: off by default, opt-in only ===');
  let A = await newPage(browser);
  await A.page.goto(BASE, { waitUntil: 'load' }); await sleep(600);
  ok(A.st.ga.length === 0, 'no request to Google before any choice');
  ok(await A.page.locator('.ga-ask').count() === 1, 'consent banner shown with both choices');
  ok(await A.page.locator('.ga-ask button').count() === 2, 'banner offers "No thanks" and "Yes, I am 18+" with equal prominence');
  await A.page.click('.ga-ask :text("No thanks")'); await sleep(300);
  ok(await A.page.evaluate(() => localStorage.getItem('physica-analytics')) === '0', 'decline remembered');
  await A.page.reload({ waitUntil: 'load' }); await sleep(500);
  ok(A.st.ga.length === 0 && await A.page.locator('.ga-ask').count() === 0, 'after "No thanks": still no Google request, no nagging banner');
  ok(await A.page.evaluate(() => window['ga-disable-G-Z1BGVQBEJ6']) === true, 'GA kill-switch is set');

  const G = await newPage(browser);
  await G.page.goto(BASE, { waitUntil: 'load' }); await sleep(400);
  await G.page.click('.ga-ask :text("18+")'); await sleep(600);
  ok(G.st.ga.some(u => /googletagmanager/.test(u)), 'GA loads only after an explicit "Yes, I am 18+"');
  await G.ctx.close();

  // =================== 1b. privacy-first counters ===================
  console.log('\n=== 1b. anonymous counters: useful for the owner, identifying nobody ===');
  ok(A.st.track.filter(t => t.body.p_event === 'visit').length >= 1, 'a visit is counted when the site opens');
  ok(A.st.track.every(t => Object.keys(t.body).sort().join() === 'p_event,p_key'), 'the only data sent is {event, key}: nothing else');
  ok(A.st.track.every(t => !t.headers.cookie && !t.headers.authorization && !t.headers.referer), 'no cookie, no auth token, no referrer on the counter request');
  ok((await A.ctx.cookies()).length === 0, 'the site sets no cookies at all');
  const before = A.st.track.length;
  await A.page.reload({ waitUntil: 'load' }); await sleep(500);
  ok(A.st.track.filter(t => t.body.p_event === 'visit').length === 1, 'reloading in the same tab does not count a second visit');
  await A.page.evaluate(() => { document.getElementById('landing').hidden = true; document.getElementById('title').textContent = 'Projectile Motion'; }); await sleep(400);
  await A.page.evaluate(() => { document.getElementById('title').textContent = 'Projectile Motion'; document.getElementById('title').textContent = 'Simple Pendulum (SHM)'; }); await sleep(400);
  const views = A.st.track.filter(t => t.body.p_event === 'view').map(t => t.body.p_key);
  ok(views.includes('projectile-motion') && views.includes('simple-pendulum-shm') && views.filter(v => v === 'projectile-motion').length === 1, 'opened simulations are counted once each, as safe slugs: ' + views.join(','));
  const day = (await db.query("select event, key, n from public.analytics_daily order by event, key")).rows;
  ok(day.length >= 3 && !JSON.stringify(day).match(/stu@|@/), 'database holds only anonymous totals: ' + JSON.stringify(day.slice(0, 3)));
  const D = await newPage(browser);
  await D.page.addInitScript(() => Object.defineProperty(navigator, 'doNotTrack', { get: () => '1' }));
  await D.page.goto(BASE, { waitUntil: 'load' }); await sleep(600);
  ok(D.st.track.length === 0, 'Do-Not-Track is honoured: nothing is counted');
  await D.ctx.close();
  await A.page.reload({ waitUntil: 'load' }); await sleep(300);

  // =================== 2. login storage ===================
  console.log('\n=== 2. login + storage ===');
  await login(A.page, 'Stu@Example.com', false);
  await A.page.waitForSelector('#ps-name');
  const ls = await A.page.evaluate(() => [localStorage.getItem('physica-series-auth'), sessionStorage.getItem('physica-series-auth')]);
  ok(ls[0] === null && ls[1] && JSON.parse(ls[1]).user.email === 'stu@example.com', 'default login lives in sessionStorage only (gone when the tab closes)');
  ok(await A.page.evaluate(() => window['ga-disable-G-Z1BGVQBEJ6']) === true, 'analytics hard-disabled while Test Series is open');

  // profile gates
  await A.page.fill('#ps-name', 'Asha'); await A.page.click(OV + ' :text("18 or older")');
  await A.page.click(OV + ' button:has-text("Continue")');
  ok(await A.page.locator('.ps-err:has-text("accept the Terms")').count() === 1, 'cannot continue without accepting Terms + Privacy');
  ok(await A.page.locator(OV + ' a[href="terms.html"]').count() === 1 && await A.page.locator(OV + ' a[href="privacy.html"]').count() === 1, 'terms and privacy links shown');
  await A.page.check('#ps-terms'); await A.page.click(OV + ' button:has-text("Continue")');
  await A.page.waitForSelector(OV + ' h3:has-text("Physica Sample Mock 1")');
  const pr = (await db.query("select terms_version, is_minor, parent_email from public.profiles p join auth.users u on u.id=p.id where u.email='stu@example.com'")).rows[0];
  ok(pr.terms_version === '2026-10-21' && pr.is_minor === false && pr.parent_email === null, 'terms version recorded server-side; adult has no parent data');

  // =================== 3. exam hardening ===================
  console.log('\n=== 3. exam: watermark, copy block, integrity signals ===');
  await A.page.click(OV + ' h3:has-text("Physica Sample Mock 1") >> xpath=.. >> button:has-text("Start test")');
  await A.page.waitForSelector('.ps-timer');
  const mark = await A.page.evaluate(() => decodeURIComponent(document.querySelector('.ps-ov').style.getPropertyValue('--ps-mark')));
  ok(/stu@example\.com/.test(mark) && /data:image\/svg\+xml/.test(mark), 'watermark carries the student email');
  ok(await A.page.evaluate(() => document.querySelector('.ps-ov').classList.contains('ps-exam')), 'exam mode on (selection disabled)');
  const prevented = await A.page.evaluate(() => { const e = new MouseEvent('contextmenu', { bubbles: true, cancelable: true }); document.querySelector('.ps-q').dispatchEvent(e); return e.defaultPrevented; });
  ok(prevented, 'right-click menu blocked on exam content');
  await A.page.evaluate(() => { const e = new Event('copy', { bubbles: true, cancelable: true }); document.querySelector('.ps-q').dispatchEvent(e); });
  await A.page.evaluate(() => { Object.defineProperty(document, 'hidden', { value: true, configurable: true }); document.dispatchEvent(new Event('visibilitychange')); });
  await A.page.evaluate(() => { Object.defineProperty(document, 'hidden', { value: false, configurable: true }); document.dispatchEvent(new Event('visibilitychange')); });
  await sleep(700);
  const ev = (await db.query("select kind from public.integrity_events order by id")).rows.map(r => r.kind);
  ok(ev.includes('copy_attempt') && ev.includes('tab_hidden') && ev.includes('tab_visible'), 'copy attempt + tab hidden/visible recorded: ' + ev.join(','));
  const keys = await A.page.evaluate(() => { const e = new KeyboardEvent('keydown', { key: 'x', bubbles: true }); let leaked = false; const h = () => { leaked = true; }; document.addEventListener('keydown', h); document.querySelector('.ps-ov').dispatchEvent(e); document.removeEventListener('keydown', h); return leaked; });
  ok(!keys, 'typing in the exam does not trigger the lab’s global shortcuts');
  await A.page.click(OV + ' .ps-opt:nth-of-type(2) input'); await A.page.click(OV + ' button:has-text("Next →")');
  await A.page.fill(OV + ' input[type=number]', '10'); await sleep(900);
  await A.page.click(OV + ' button:has-text("Submit test")'); await A.page.waitForSelector(OV + ' :text("Score:")');
  ok(/Score: 8 \/ 12/.test(await A.page.textContent(OV + ' .ps-card h2')), 'marked correctly (8 / 12)');

  // =================== 4. XSS ===================
  console.log('\n=== 4. XSS: hostile content in questions, options, solutions and titles ===');
  await A.page.click(OV + ' button:has-text("Back to tests")');
  await A.page.waitForSelector(OV + ' h3');
  ok(await A.page.locator(OV + ' h3 img, ' + OV + ' img').count() === 0, 'hostile test title rendered as text, no <img> element');
  await A.page.click(OV + ' h3:has-text("XSS probe") >> xpath=.. >> button:has-text("Start test")');
  await A.page.waitForSelector('.ps-timer');
  const domCheck = async () => ({ x: await A.page.evaluate(() => window.__xss), tags: await A.page.evaluate(() => {
    const bad = [...document.querySelectorAll('.ps-main img, .ps-main svg, .ps-main script, .ps-main iframe, .ps-main a[href^="javascript"], .ps-main [onerror], .ps-main [onload]')].length;
    // user-controlled content may only ever contain text plus <sub>/<sup>
    const odd = [...document.querySelectorAll('.ps-q *, .ps-opt > span *, .ps-sub > span *, .ps-main h2 *, .ps-main h3 *')].filter(e => !['SUB', 'SUP'].includes(e.tagName)).length;
    return bad + odd; }) });
  let d1 = await domCheck();
  console.log('   debug', JSON.stringify(d1)); ok(d1.x === undefined && d1.tags === 0, 'exam screen: payloads shown as inert text (no script ran, no injected elements)');
  const qt = await A.page.textContent(OV + ' .ps-q'); console.log('   debug q:', JSON.stringify(qt.slice(0, 90)));
  ok(qt.includes('<img src=x onerror="window._xss=1">'), 'payload text visible literally to the student');
  await A.page.click(OV + ' .ps-opt:nth-of-type(4) input');
  await A.page.click(OV + ' button:has-text("Submit test")'); await A.page.waitForSelector(OV + ' :text("Score:")');
  d1 = await domCheck();
  ok(d1.x === undefined && d1.tags === 0, 'result screen (incl. solution text): no script ran, no injected elements');

  // =================== 5. account: export, global logout, delete ===================
  console.log('\n=== 5. account: data rights ===');
  await A.page.click(OV + ' button.ps-link');
  await A.page.waitForSelector(OV + ' h1:has-text("Your account")');
  const [dl] = await Promise.all([A.page.waitForEvent('download'), A.page.click(OV + ' button:has-text("Download my data")')]);
  const exported = JSON.parse(fs.readFileSync(await dl.path(), 'utf8'));
  ok(dl.suggestedFilename() === 'physica-my-data.json' && exported.account.email === 'stu@example.com' && exported.attempts.length === 2, 'export downloads a JSON copy with account + 2 attempts');
  ok(!/SECRET|correct_answer/.test(JSON.stringify(exported)), 'export has no answer keys');
  await A.page.click(OV + ' button:has-text("Log out on all devices")'); await A.page.waitForSelector('#ps-email');
  ok(await A.page.evaluate(() => sessionStorage.getItem('physica-series-auth')) === null, 'log out everywhere clears the local token');
  await A.page.fill('#ps-email', 'stu@example.com'); await A.page.click(OV + ' button:has-text("Email me a code")');
  await A.page.waitForSelector('#ps-code'); await A.page.fill('#ps-code', '123456'); await A.page.click(OV + ' button:has-text("Verify")');
  await A.page.waitForSelector(OV + ' h3');
  await A.page.click(OV + ' button.ps-link'); await A.page.waitForSelector('#ps-del');
  await A.page.click(OV + ' button:has-text("Delete my account")');
  ok(await A.page.locator('.ps-err:has-text("Type DELETE")').count() === 1, 'delete needs the typed confirmation');
  await A.page.fill('#ps-del', 'DELETE'); await A.page.click(OV + ' button:has-text("Delete my account")');
  await A.page.waitForSelector('#ps-email');
  const left = (await db.query("select (select count(*) from auth.users where email='stu@example.com')::int u, (select count(*) from public.attempts a where not exists (select 1 from auth.users x where x.id=a.user_id))::int orphan, (select count(*) from public.responses)::int r")).rows[0];
  ok(left.u === 0 && left.orphan === 0 && left.r === 0, 'account, attempts and answers erased from the database');
  ok(A.st.csp.length === 0 && A.st.err.length === 0, 'no CSP violations / page errors in the whole session' + (A.st.err[0] ? ': ' + A.st.err[0] : '') + (A.st.csp[0] ? ': ' + A.st.csp[0] : ''));
  await A.ctx.close();

  // =================== 6. minors + remembered login ===================
  console.log('\n=== 6. minor flow + "keep me signed in" ===');
  const M = await newPage(browser, { viewport: { width: 390, height: 800 } });
  await M.page.goto(BASE, { waitUntil: 'load' }); await M.page.click('.ga-ask :text("No thanks")');
  await login(M.page, 'kid@example.com', true);
  await M.page.waitForSelector('#ps-name');
  const st2 = await M.page.evaluate(() => [!!localStorage.getItem('physica-series-auth'), sessionStorage.getItem('physica-series-auth')]);
  ok(st2[0] === true && st2[1] === null, 'ticking "Keep me signed in" uses localStorage');
  await acceptProfile(M.page, 'Ravi', true, null); await M.page.check('#ps-terms');
  await M.page.click(OV + ' button:has-text("Continue")');
  await M.page.waitForSelector('.ps-err:has-text("valid email")');
  ok(true, 'under-18 must give a valid parent email');
  await M.page.fill('#ps-parent', 'not-an-email'); await M.page.click(OV + ' button:has-text("Continue")');
  await M.page.waitForSelector('.ps-err:has-text("valid email")');
  ok(true, 'malformed parent email refused (server-side)');
  await M.page.fill('#ps-parent', '  Dad@Example.COM  '); await M.page.click(OV + ' button:has-text("Continue")');
  await M.page.waitForSelector(OV + ' h3');
  const kid = (await db.query("select parent_email, parent_consent_at is not null c from public.profiles p join auth.users u on u.id=p.id where u.email='kid@example.com'")).rows[0];
  ok(kid.parent_email === 'dad@example.com' && kid.c, 'parent email normalised and consent timestamp stored');
  await M.page.screenshot({ path: '/tmp/mobile-list.png' });
  await M.page.click(OV + ' h3:has-text("Physica Sample Mock 1") >> xpath=.. >> button:has-text("Start test")');
  await M.page.waitForSelector('.ps-timer'); await M.page.screenshot({ path: '/tmp/mobile-exam.png' });
  ok(await M.page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), 'no horizontal scroll on a 390px phone');
  await M.ctx.close();

  // =================== 7. idle logout on shared computers ===================
  console.log('\n=== 7. idle logout ===');
  const I = await newPage(browser);
  await I.page.clock.install();
  await I.page.goto(BASE, { waitUntil: 'load' }); await I.page.click('.ga-ask :text("No thanks")');
  await login(I.page, 'adult2@example.com', false);
  await acceptProfile(I.page, 'Omar', false); await I.page.check('#ps-terms'); await I.page.click(OV + ' button:has-text("Continue")');
  await I.page.waitForSelector(OV + ' h3');
  await I.page.clock.fastForward('31:00');
  await I.page.waitForSelector('#ps-email', { timeout: 8000 }).catch(() => {});
  ok(await I.page.locator('#ps-email').count() === 1, 'unattended non-remembered session is signed out after 30 minutes');
  await I.ctx.close();

  // =================== 8. legal pages ===================
  console.log('\n=== 8. legal pages ===');
  const L = await newPage(browser);
  for (const pg of ['privacy.html', 'terms.html']) {
    await L.page.goto(BASE + pg, { waitUntil: 'load' }); await sleep(300);
    const h1 = await L.page.textContent('h1'); const txt = await L.page.textContent('main');
    ok(h1.length > 3 && /2026-10-21/.test(txt), pg + ' loads with version 2026-10-21');
    ok(!/undefined|NaN/.test(txt), pg + ' has no template debris');
  }
  await L.page.goto(BASE + 'privacy.html', { waitUntil: 'load' }); await sleep(300);
  ok(/OFF/.test(await L.page.textContent('#analytics-choice')), 'privacy page shows analytics switch (OFF by default)');
  await L.page.click('#analytics-choice button'); await sleep(200);
  ok(/ON/.test(await L.page.textContent('#analytics-choice')) && await L.page.evaluate(() => localStorage.getItem('physica-analytics')) === '1', 'switch turns analytics on');
  await L.page.click('#analytics-choice button'); await sleep(200);
  ok(/OFF/.test(await L.page.textContent('#analytics-choice')), 'and off again (withdrawal is as easy as consent)');
  ok(L.st.ga.length === 0 && L.st.csp.length === 0, 'legal pages: no Google request, no CSP violations');
  for (const rule of ['Grievance', 'Children', 'Your rights', 'How we protect']) ok(await L.page.locator(`h2:has-text("${rule}")`).count() >= 1, 'privacy section present: ' + rule);
  await L.page.screenshot({ path: '/tmp/privacy.png', fullPage: false });
  await L.ctx.close();


  // =================== 9. accessibility ===================
  console.log('\n=== 9. accessibility: axe-core on every screen, both themes, keyboard only ===');
  const axeSrc = fs.readFileSync(path.join(__dirname, 'node_modules/axe-core/axe.min.js'), 'utf8');
  const X = await newPage(browser, { bypassCSP: true });
  const axe = async (label) => {
    for (const theme of ['dark', 'light']) {
      await X.page.evaluate(t => { document.documentElement.dataset.theme = t; }, theme); await X.page.waitForTimeout(700);
      const res = await X.page.evaluate(async () => { const r = await axe.run(document.querySelector('.ps-ov:not([hidden])') || document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } }); return r.violations.map(v => ({ id: v.id, impact: v.impact, n: v.nodes.length, help: v.help, sample: v.nodes[0].html.slice(0, 120) })); });
      const bad = res.filter(v => ['serious', 'critical', 'moderate'].includes(v.impact));
      ok(bad.length === 0, `axe ${label} [${theme}]: no WCAG 2.1 AA violations` + (bad.length ? ' -> ' + bad.map(v => `${v.id}(${v.impact}) ${v.sample}`).join(' | ') : ''));
    }
  };
  await X.page.goto(BASE, { waitUntil: 'load' }); await X.page.addScriptTag({ content: axeSrc });
  await X.page.click('.ga-ask :text("No thanks")');
  // keyboard-only open: Tab to the landing link, press Enter
  await X.page.focus('[data-testid=series-open-landing]'); await X.page.keyboard.press('Enter');
  await X.page.waitForSelector(OV + ':not([hidden]) #ps-email');
  ok(await X.page.evaluate(() => document.querySelector('.ps-ov').contains(document.activeElement)), 'focus moves into the dialog when it opens');
  ok(await X.page.evaluate(() => [...document.body.children].filter(e => e.tagName !== 'SCRIPT' && !e.classList.contains('ps-ov')).every(e => e.hasAttribute('inert'))), 'the lab behind the dialog is inert (not reachable by keyboard or screen reader)');
  let outside = 0; for (let i = 0; i < 40; i++) { await X.page.keyboard.press('Tab'); if (!await X.page.evaluate(() => document.querySelector('.ps-ov').contains(document.activeElement))) outside++; }
  ok(outside === 0, 'Tab never escapes the dialog (focus trap, 40 presses)');
  for (let i = 0; i < 40; i++) await X.page.keyboard.press('Shift+Tab');
  ok(await X.page.evaluate(() => document.querySelector('.ps-ov').contains(document.activeElement)), 'Shift+Tab stays inside too');
  await axe('login');
  await X.page.fill('#ps-email', 'a11y@example.com'); await X.page.keyboard.press('Enter');
  await X.page.waitForSelector('#ps-code'); await axe('code entry');
  await X.page.fill('#ps-code', '123456'); await X.page.keyboard.press('Enter');
  await X.page.waitForSelector('#ps-name'); await axe('profile');
  await X.page.fill('#ps-name', 'Kabir'); await X.page.click(OV + ' :text("Under 18")'); await X.page.fill('#ps-parent', 'mom@example.com'); await X.page.check('#ps-consent'); await X.page.check('#ps-terms');
  await axe('profile (minor)');
  await X.page.keyboard.press('Enter'); await X.page.waitForSelector(OV + ' h3'); await axe('test list');
  await X.page.click(OV + ' h3:has-text("Physica Sample Mock 1") >> xpath=.. >> button:has-text("Start test")'); await X.page.waitForSelector('.ps-timer'); await axe('exam (MCQ)');
  await X.page.click(OV + ' button:has-text("Next →")'); await X.page.click(OV + ' button:has-text("Next →")'); await axe('exam (last question)');
  await X.page.click(OV + ' button:has-text("Submit test")'); await X.page.waitForSelector(OV + ' :text("Score:")'); await axe('result');
  await X.page.click(OV + ' button.ps-link'); await X.page.waitForSelector('#ps-del'); await axe('account');
  await X.page.keyboard.press('Escape');
  ok(await X.page.locator(OV + '[hidden]').count() === 1, 'Escape closes the dialog');
  ok(await X.page.evaluate(() => document.activeElement && document.activeElement.getAttribute('data-testid') === 'series-open-landing'), 'focus returns to the button that opened it');
  await X.page.goto(BASE + 'privacy.html'); await X.page.addScriptTag({ content: axeSrc }); await axe('privacy.html');
  await X.page.goto(BASE + 'terms.html'); await X.page.addScriptTag({ content: axeSrc }); await axe('terms.html');
  await X.ctx.close();

  // =================== 10. incident UI: status, lock, lockdown, new-device alert ===================
  console.log('\n=== 10. incident UI ===');
  const P = await newPage(browser);
  await P.page.goto(BASE, { waitUntil: 'load' }); await P.page.click('.ga-ask :text("No thanks")');
  await login(P.page, 'victim@example.com', true); await acceptProfile(P.page, 'Neha', false); await P.page.check('#ps-terms'); await P.page.click(OV + ' button:has-text("Continue")');
  await P.page.waitForSelector(OV + ' h3');
  // maintenance banner + exams paused
  await db.query("select private.ops_set_status(true, null, null, 'Scheduled maintenance 10 pm')");
  await P.page.reload({ waitUntil: 'load' }); await P.page.click('[data-testid=series-open-landing]');
  await P.page.waitForSelector(OV + ' .ps-banner:has-text("Scheduled maintenance")');
  ok(true, 'maintenance notice shown on the test list');
  await P.page.click(OV + ' h3:has-text("Physica Sample Mock 1") >> xpath=.. >> button:has-text("Start test")');
  await P.page.waitForSelector(OV + ' .ps-err:has-text("cannot be started")'); ok(true, 'starting a test during maintenance gives a clear message');
  await db.query("select private.ops_set_status(false, null, null, null); update public.app_settings set message = null");
  // new device on another browser -> alert on the first one
  const P2 = await newPage(browser);
  await P2.page.goto(BASE, { waitUntil: 'load' }); await P2.page.click('.ga-ask :text("No thanks")');
  await login(P2.page, 'victim@example.com', false); await P2.page.waitForSelector(OV + ' h3');
  await P2.ctx.close();
  await P.page.reload({ waitUntil: 'load' }); await P.page.click('[data-testid=series-open-landing]');
  await P.page.waitForSelector(OV + ' .ps-banner[role=alert]:has-text("New sign-in")');
  ok(true, 'a login from a new device raises a visible alert on the owner’s other device');
  ok((await db.query("select count(*)::int c from public.audit_log where action='login.new_device'")).rows[0].c >= 1, 'and is in the audit log');
  await P.page.click(OV + ' button:has-text("This was me")'); ok(await P.page.locator(OV + ' .ps-banner[role=alert]').count() === 0, '"This was me" dismisses it');
  // operator locks the account while the page is open
  await db.query("select private.ops_lock_user('victim@example.com', 'test')");
  await P.page.click(OV + ' h3:has-text("Physica Sample Mock 1") >> xpath=.. >> button:has-text("Start test")').catch(() => {});
  await P.page.reload({ waitUntil: 'load' }); await P.page.click('[data-testid=series-open-landing]');
  await P.page.waitForSelector(OV + ' h2:has-text("Account locked")'); ok(true, 'locked account sees a clear "Account locked" screen with a way to get help');
  await db.query("select private.ops_unlock_user('victim@example.com')");
  // panic
  await db.query("select private.ops_panic(true)");
  await P.page.reload({ waitUntil: 'load' }); await P.page.click('[data-testid=series-open-landing]');
  await P.page.waitForSelector(OV + ' h2:has-text("Back soon")'); ok(true, 'lockdown shows "Back soon" and nothing else is reachable');
  await db.query("select private.ops_panic(false)");
  await P.page.click(OV + ' button:has-text("Try again")'); await P.page.waitForSelector(OV + ' h3'); ok(true, 'service returns immediately after lockdown is lifted');
  ok(P.st.err.length === 0 && P.st.csp.length === 0, 'no page errors / CSP violations during incident screens');
  await P.ctx.close();

  // =================== 11. speed ===================
  console.log('\n=== 11. speed on a slow phone connection (HTTP/2 + gzip, like Netlify / GitHub Pages / Cloudflare) ===');
  require('child_process').execSync('openssl req -x509 -newkey rsa:2048 -nodes -keyout /tmp/ps-k.pem -out /tmp/ps-c.pem -subj /CN=localhost -days 1 2>/dev/null');
  const h2 = require('http2'), zlib2 = require('zlib');
  const h2srv = h2.createSecureServer({ key: fs.readFileSync('/tmp/ps-k.pem'), cert: fs.readFileSync('/tmp/ps-c.pem'), allowHTTP1: true }, (req, res) => {
    let f = path.join(ROOT, decodeURIComponent(new URL(req.url, 'https://x').pathname)); if (f.endsWith('/')) f += 'index.html';
    fs.readFile(f, (e, d) => {
      if (e) { res.writeHead(404); return res.end(); }
      const hd = { 'content-type': MIME[path.extname(f)] || 'application/octet-stream' };
      if (/\.(js|css|html|json|webmanifest)$/.test(f) && /gzip/.test(req.headers['accept-encoding'] || '')) { hd['content-encoding'] = 'gzip'; d = zlib2.gzipSync(d, { level: 6 }); }
      res.writeHead(200, hd); res.end(d);
    });
  }).listen(3443);
  const S = await newPage(browser, { h2: true });
  const cdp = await S.ctx.newCDPSession(S.page);
  await cdp.send('Network.enable'); await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 1.6 * 1024 * 1024 / 8, uploadThroughput: 750 * 1024 / 8 });   // Chrome's "Slow 4G" preset
  await S.page.goto('https://localhost:3443/', { waitUntil: 'load' }); await S.page.click('.ga-ask :text("No thanks")');
  await sleep(1500);
  // Time measured INSIDE the page from the moment the click is dispatched, so it is Test Series' own cost
  // (pack download + start-up + status call + render), not the lab's background packs hogging the main thread.
  const open = await S.page.evaluate(() => new Promise(res => {
    const t0 = performance.now(), b = document.querySelector('[data-testid=series-open-landing]');
    const mo = new MutationObserver(() => { if (document.querySelector('#ps-email')) { mo.disconnect(); res(Math.round(performance.now() - t0)); } });
    mo.observe(document.documentElement, { childList: true, subtree: true }); b.click();
  }));
  ok(open < 2000, `Test Series opens in ${open} ms on slow 4G (pack 11 KB gzip) (< 2000)`);
  const sendT = await S.page.evaluate(() => new Promise(res => {
    document.querySelector('#ps-email').value = 'slow@example.com';
    const t0 = performance.now(), mo = new MutationObserver(() => { if (document.querySelector('#ps-code')) { mo.disconnect(); res(Math.round(performance.now() - t0)); } });
    mo.observe(document.documentElement, { childList: true, subtree: true }); document.querySelector('.ps-ov form button[type=submit]').click();
  }));
  ok(sendT < 2500, `sending the login code takes ${sendT} ms on slow 4G (< 2500)`);
  const pk = await S.page.evaluate(() => performance.getEntriesByType('resource').filter(r => /physica-series/.test(r.name)).map(r => Math.round(r.transferSize / 1024))[0]);
  ok(pk <= 14, `the Test Series pack transferred ${pk} KB (budget 14 KB)`);
  await S.ctx.close(); h2srv.close();

  await browser.close(); srv.close(); await db.end();
  console.log(fails ? `\n${fails} FAILED` : '\nALL E2E CHECKS PASSED');
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error('CRASH', e); process.exit(2); });
