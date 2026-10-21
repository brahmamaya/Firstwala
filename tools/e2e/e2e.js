/* Browser end-to-end + accessibility (axe) test of the GitHub-only Test Series. Needs Chromium and `npm i` in this folder.
   Run: node tools/e2e/e2e.js   (CHROMIUM=/path/to/chrome overrides the browser; SITE_ROOT the built site folder)
   It serves the built site plus a TEMPORARY tests/ folder made from synthetic sample papers (the repo itself ships no fake papers). */
const http = require('http'), fs = require('fs'), os = require('os'), path = require('path'), zlib = require('zlib'), { spawnSync } = require('child_process');
const { chromium } = require('playwright-core');
const ROOT = process.env.SITE_ROOT || path.resolve(__dirname, '../..');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.woff2': 'font/woff2', '.webp': 'image/webp', '.webmanifest': 'application/json' };
let fails = 0;
const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const until = async (fn, ms = 8000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { const v = await fn(); if (v) return v; await sleep(100); } return false; };
const OV = '.ps-ov:not([hidden])', SAVE = 'button:has-text("Save & Next")', opt = n => `.px label.px-o:nth-of-type(${n}) input`, letterN = L => L.charCodeAt(0) - 64;

/* ---- test data: sample papers -> free tests only -> public files in a temp folder ---- */
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ps-e2e-')), tool = path.join(ROOT, 'tools/series-import.js');
spawnSync(process.execPath, [tool, 'sample', tmp + '/all']);
for (const ex of ['NEET', 'JEE_MAIN', 'JEE_ADV']) for (const f of fs.readdirSync(`${tmp}/all/${ex}`)) { if (/^0[1-3]/.test(f)) { fs.mkdirSync(`${tmp}/free/${ex}`, { recursive: true }); fs.copyFileSync(`${tmp}/all/${ex}/${f}`, `${tmp}/free/${ex}/${f}`); } }
fs.mkdirSync(tmp + '/free/img', { recursive: true });
for (const f of walk(tmp + '/free')) if (f.endsWith('.json')) for (const q of JSON.parse(fs.readFileSync(f)).q) if (q.f) fs.writeFileSync(`${tmp}/free/img/${q.f}.webp`, 'RIFFxxxxWEBP');
const gen = spawnSync(process.execPath, [tool, 'static', tmp + '/free', '--out', tmp + '/site-tests'], { encoding: 'utf8' });
if (gen.status !== 0) { console.error(gen.stderr); process.exit(1); }
function* walk(d) { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); fs.statSync(p).isDirectory() ? yield* walk(p) : yield p; } }
const keysOf = (ex, n, p = 1) => JSON.parse(fs.readFileSync(`${tmp}/site-tests/${ex}/${String(n).padStart(2, '0')}-${p}.key.json`)).ks;
const secsOf = pid => JSON.parse(fs.readFileSync(tmp + '/site-tests/index.json')).patterns[pid].sections;
function marks(s, a, k) { if (k === '*') return s.c; if (a == null || a === '') return 0; if (s.t === 'MCQ') return a === k ? s.c : s.w; if (s.t === 'MULTI') { if ([...a].some(c => !k.includes(c))) return s.w; return a === k ? s.c : (s.p || 0) * a.length; } const v = Number(a), [lo, hi] = k.includes(':') ? k.split(':').map(Number) : [Number(k), Number(k)]; return v >= lo - 1e-6 && v <= hi + 1e-6 ? s.c : s.w; }

let testsOn = true; const requested = [];
const srv = http.createServer((req, res) => {
  const u = new URL(req.url, 'http://x'); let p = decodeURIComponent(u.pathname); if (p.startsWith('/tests/')) requested.push(p);
  let f = p.startsWith('/tests/') ? (testsOn ? path.join(tmp, 'site-tests', p.slice(7)) : null) : path.join(ROOT, p); if (f && f.endsWith('/')) f += 'index.html';
  fs.readFile(f || '/nonexistent', (e, d) => { if (e) { res.writeHead(404, { 'content-type': 'text/html' }); return res.end('<!doctype html>not found'); }
    const h = { 'content-type': MIME[path.extname(f)] || 'application/octet-stream' };
    if (/\.(js|css|html|json)$/.test(f)) { h['content-encoding'] = 'gzip'; d = zlib.gzipSync(d); } res.writeHead(200, h); res.end(d); });
}).listen(3201);
const BASE = 'http://localhost:3201/';

async function newPage(browser, opts = {}) {
  const ctx = await browser.newContext({ viewport: opts.viewport || { width: 1100, height: 900 }, bypassCSP: !!opts.bypassCSP });
  const page = await ctx.newPage(), st = { csp: [], err: [], ext: [] };
  page.on('console', m => { if (/Content Security Policy|Refused to/.test(m.text())) st.csp.push(m.text()); });
  page.on('pageerror', e => st.err.push(e.message));
  page.on('dialog', d => d.accept());
  page.on('request', r => { if (!/^(http:\/\/localhost|data:|blob:)/.test(r.url())) st.ext.push(r.url()); });
  await page.route(/googletagmanager|google-analytics/, r => r.abort());
  return { ctx, page, st };
}
const fresh = async (browser, opts) => { const x = await newPage(browser, opts); await x.page.goto(BASE, { waitUntil: 'load' }); await x.page.click('.ga-ask :text("No thanks")').catch(() => {}); return x; };
async function openSeries(page, exam = 'neet') {
  await page.click('[data-testid=mode-rank]'); await page.click(`[data-testid=rank-${exam}]`);
  await page.waitForSelector('[data-testid=rk-series]'); await page.click('[data-testid=rk-series]'); await page.waitForSelector(OV + ' .ps-tcard');
}
const attempts = page => page.evaluate(() => JSON.parse(localStorage.getItem('physica-ps-v1') || '{}').a || {});

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });

  console.log('\n=== 0. landing page notice (10 s, shows the path) ===');
  { const X = await newPage(browser); await X.page.goto(BASE, { waitUntil: 'load' });
    await X.page.waitForSelector('[data-testid=series-note]'); const t = await X.page.textContent('[data-testid=series-note]');
    ok(/Rank mode/.test(t) && /Test Series/.test(t) && /2027/.test(t), 'notice says the Test Series exists, names 2027 exams and the path (Rank mode -> exam -> Test Series)');
    await X.page.hover('[data-testid=series-note]'); await sleep(11000); ok(await X.page.locator('[data-testid=series-note]').count() === 1, 'it pauses while the pointer is on it');
    await X.page.mouse.move(5, 5); await X.page.waitForSelector('[data-testid=series-note]', { state: 'detached', timeout: 14000 }); ok(true, 'and disappears by itself');
    ok(X.st.ext.length === 0, 'landing page: no external requests'); await X.ctx.close(); }

  console.log('\n=== 1. hub: 30 tests, 3 free and playable, 27 coming soon ===');
  const A = await fresh(browser); await openSeries(A.page, 'neet');
  ok(await A.page.locator(OV + ' .ps-tcard').count() === 30, '30 test cards');
  ok(await A.page.locator(OV + ' .ps-tcard.soon').count() === 27 && await A.page.locator(OV + ' .ps-tcard:not(.soon) button:has-text("Start")').count() === 3, 'tests 1-3 can be started, 4-30 say "Coming soon"');
  ok(await A.page.locator(OV + ' .ps-bar:visible').count() === 1 && await A.page.locator(OV + ' #ps-email').count() === 0, 'no login screen (nothing to sign in to)');
  await A.page.click(OV + ' .ps-tcard:nth-child(1) button'); await A.page.waitForSelector(OV + ' h2:has-text("General instructions")');
  ok(await A.page.locator(OV + ' .ps-quote blockquote').count() === 1 && (await A.page.textContent(OV + ' .ps-quote blockquote')).length > 20, 'a motivational quote is shown before the test starts');
  ok(await A.page.locator(OV + ' .ps-tbl tbody tr').count() === 4 && /\+4/.test(await A.page.textContent(OV + ' .ps-tbl')) && /−1/.test(await A.page.textContent(OV + ' .ps-tbl')), 'marking scheme: 4 subjects, +4 / −1');
  ok(await A.page.isDisabled(OV + ' button:has-text("I am ready to begin")'), '"I am ready" stays disabled until the instructions are acknowledged');
  ok(Object.keys(await attempts(A.page)).length === 0, 'reading instructions does not start the clock');

  console.log('\n=== 2. exam: NEET 180 questions ===');
  await A.page.check('#ps-read'); await A.page.click(OV + ' button:has-text("I am ready to begin")'); await A.page.waitForSelector('.px-time');
  ok(/Time Left: 02:59:/.test(await A.page.textContent('.px-time')), 'timer starts at 3 hours');
  ok(await A.page.locator('.px-tab').count() === 4 && await A.page.locator('.px-grid:visible .px-pb').count() === 45, '4 subject tabs, palette of 45');
  ok(!requested.some(p => /\.key\.json$/.test(p)), 'the answer file has NOT been downloaded while the test runs');
  const keys = keysOf('NEET', 1), qlabel = n => A.page.getAttribute(`.px-pb[aria-label^="Question ${n},"]`, 'aria-label');
  await A.page.click(opt(2)); await A.page.click('.px-pb[aria-label^="Question 5,"]');
  ok(/Not answered/.test(await qlabel(1)), 'leaving without Save & Next does not record the answer');
  await A.page.click('.px-pb[aria-label^="Question 1,"]');
  for (let i = 1; i <= 12; i++) {
    const right = keys[i - 1].k, wrong = 'ABCD'.replace(right, '')[0];
    if (i === 4) { await A.page.click('.px ' + SAVE); continue; }
    await A.page.click(opt(letterN(i <= 8 ? right : wrong)));
    await A.page.click(i === 3 ? '.px button:has-text("Mark for Review & Next")' : '.px ' + SAVE);
  }
  ok(/Answered and marked/.test(await qlabel(3)) && /Not answered/.test(await qlabel(4)) && /^Question 1, Answered$/.test(await qlabel(1)), 'palette: Answered / marked / not answered');
  ok(await until(async () => { const a = Object.values(await attempts(A.page))[0]; return a && a.ans[0] === keys[0].k && a.ans[11] != null; }), 'answers are saved on this device');
  const saved = Object.values(await attempts(A.page))[0];
  ok(saved.ans.slice(0, 12).every((a, i) => i === 3 ? a == null : (i < 8 ? a === keys[i].k : a !== keys[i].k)) && saved.fl[2] === 3, 'stored: right, wrong, skipped, and the marked flag');
  await A.page.click('.px button:has-text("Clear Response")'); await A.page.click('.px-pb[aria-label^="Question 2,"]'); await A.page.click('.px button:has-text("Clear Response")');
  ok(/Not answered/.test(await qlabel(2)), 'Clear Response removes an answer');
  await A.page.click(opt(letterN(keys[1].k))); await A.page.click('.px ' + SAVE);
  await A.page.click('.px-tab:has-text("Chemistry")'); ok((await A.page.textContent('.px h2')) === 'Question 46 of 180', 'switching subject');
  ok(await A.page.evaluate(() => { const e = new MouseEvent('contextmenu', { bubbles: true, cancelable: true }); document.querySelector('.px-q').dispatchEvent(e); return e.defaultPrevented; }), 'right-click is blocked on the paper');

  console.log('--- reload in the middle: the test resumes ---');
  await sleep(3500); await A.page.reload({ waitUntil: 'load' }); await A.page.click('.ga-ask :text("No thanks")').catch(() => {}); await openSeries(A.page, 'neet');
  ok(await A.page.locator(OV + ' button:has-text("Resume")').count() === 1, 'hub offers Resume');
  await A.page.click(OV + ' button:has-text("Resume")'); await A.page.waitForSelector('.px-time');
  ok(/Answered/.test(await A.page.getAttribute('.px-pb[aria-label^="Question 1,"]', 'aria-label')), 'saved answers are still there after a reload');

  console.log('--- submit ---');
  await A.page.click('.px button:has-text("Submit")'); await A.page.waitForSelector('.px-modal');
  ok(await A.page.locator('.px-modal tbody tr').count() === 4, 'submit summary lists every section');
  await A.page.click('.px-modal button:has-text("Yes, submit")'); await A.page.waitForSelector(OV + ' .ps-score');
  const a1 = Object.values(await attempts(A.page))[0], secs = secsOf('NEET_2027'); let gi = 0, exp = 0; for (const s of secs) for (let i = 0; i < s.n; i++, gi++) exp += marks(s, a1.ans[gi], keys[gi].k);
  ok(a1.done && (await A.page.textContent(OV + ' .ps-big2')).trim().startsWith(String(exp)), `scorecard shows ${exp} / 720, same as an independent marking`);
  ok(/saved on this device/.test(await A.page.textContent(OV + ' .ps-score')) && /(Strong attempt|Every score is data)/.test(await A.page.textContent(OV + ' main')), 'result page: honest storage note + encouragement');
  await A.page.click(OV + ' details.ps-sec:nth-of-type(1) summary'); await A.page.waitForSelector(OV + ' details.ps-sec:nth-of-type(1) .ps-q2');
  ok(await A.page.locator(OV + ' details.ps-sec:nth-of-type(1) .ps-q2').count() === 45, 'review of Physics loads 45 questions on demand');
  await A.page.click(OV + ' details.ps-sec:nth-of-type(1) .ps-q2:nth-child(1) summary'); await A.page.waitForSelector(OV + ' .ps-rb .ps-sub');
  ok(/Sample solution 1\./.test(await A.page.textContent(OV + ' .ps-rb')) && await A.page.locator(OV + ' .ps-rb .ps-opt.right').count() === 1, 'a reviewed question shows solution and correct option');
  ok(A.st.ext.length === 0 && A.st.err.length === 0 && A.st.csp.length === 0, 'whole NEET run: no external requests, no page errors, no CSP violations ' + JSON.stringify([A.st.ext.slice(0, 2), A.st.err.slice(0, 2)]));
  await A.ctx.close();

  console.log('\n=== 3. JEE Main (numerical) and JEE Advanced (two papers) ===');
  { const J = await fresh(browser); await openSeries(J.page, 'jee'); await J.page.click(OV + ' .ps-tcard:nth-child(1) button'); await J.page.waitForSelector(OV + ' h2:has-text("General instructions")');
    await J.page.check('#ps-read'); await J.page.click(OV + ' button:has-text("I am ready to begin")'); await J.page.waitForSelector('.px-time');
    await J.page.click('.px-pb[aria-label^="Question 21,"]'); ok(await J.page.locator('.px-key, .px-keypad').count() > 0, 'Section B (numerical) shows the on-screen keypad');
    ok((await J.page.textContent('.px h2')) === 'Question 21 of 75', 'JEE Main: 75 questions, Section B starts at 21'); await J.ctx.close(); }
  { const J = await fresh(browser); await openSeries(J.page, 'jeeadv'); ok(await J.page.locator(OV + ' .ps-tcard:nth-child(1) button').count() === 2, 'JEE Advanced test 1 has Paper 1 and Paper 2'); await J.ctx.close(); }

  console.log('\n=== 4. time runs out: the test submits itself ===');
  { const T = await fresh(browser); await openSeries(T.page, 'neet'); await T.page.click(OV + ' .ps-tcard:nth-child(2) button'); await T.page.check('#ps-read'); await T.page.click(OV + ' button:has-text("I am ready to begin")'); await T.page.waitForSelector('.px-time');
    await T.page.evaluate(() => { const d = JSON.parse(localStorage.getItem('physica-ps-v1')); for (const k in d.a) d.a[k].dl = Date.now() - 60000; localStorage.setItem('physica-ps-v1', JSON.stringify(d)); });
    await T.page.reload({ waitUntil: 'load' }); await T.page.click('.ga-ask :text("No thanks")').catch(() => {}); await openSeries(T.page, 'neet');
    ok(await T.page.locator(OV + ' button:has-text("Result")').count() === 1, 'after the deadline the test is closed and scored (no extra time)'); await T.ctx.close(); }

  console.log('\n=== 5. no tests published yet / offline file missing ===');
  { testsOn = false; const E = await fresh(browser); await openSeries(E.page, 'neet');
    ok(await E.page.locator(OV + ' .ps-tcard.soon').count() === 30, 'with no tests/ folder every card says "Coming soon" (no error screen)'); await E.ctx.close(); testsOn = true; }

  console.log('\n=== 6. phone ===');
  { const P = await fresh(browser, { viewport: { width: 360, height: 740 } }); await openSeries(P.page, 'neet');
    ok(await P.page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1 && document.querySelector('.ps-ov').scrollWidth <= innerWidth + 1), 'hub: no sideways scroll at 360 px');
    await P.page.click(OV + ' .ps-tcard:nth-child(3) button'); await P.page.check('#ps-read'); await P.page.click(OV + ' button:has-text("I am ready to begin")'); await P.page.waitForSelector('.px-time');
    ok(await P.page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'exam: no sideways scroll at 360 px');
    ok(await P.page.locator('.px button:has-text("Save & Next")').isVisible(), 'Save & Next reachable on a phone'); await P.ctx.close(); }

  console.log('\n=== 7. accessibility (axe, WCAG 2.1 AA, both themes) ===');
  { const axeSrc = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8'); const X = await newPage(browser, { bypassCSP: true });
    const axe = async (label, scope = '.ps-ov:not([hidden])') => { for (const theme of ['dark', 'light']) {
      await X.page.evaluate(t => { document.documentElement.dataset.theme = t; }, theme); await sleep(400);
      const res = await X.page.evaluate(async sc => { const r = await axe.run(document.querySelector(sc) || document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } }); return r.violations.map(v => ({ id: v.id, impact: v.impact, sample: v.nodes[0].html.slice(0, 120) })); }, scope);
      ok(res.length === 0, `axe ${label} [${theme}]` + (res.length ? ' -> ' + res.map(v => `${v.id} ${v.sample}`).join(' | ') : '')); } };
    await X.page.goto(BASE, { waitUntil: 'load' }); await X.page.addScriptTag({ content: axeSrc }); await X.page.click('.ga-ask :text("No thanks")').catch(() => {});
    await X.page.waitForSelector('[data-testid=series-note]'); await axe('landing notice', '.sn');
    await openSeries(X.page, 'neet'); ok(await X.page.evaluate(() => document.querySelector('.ps-ov').contains(document.activeElement)), 'focus moves into the dialog'); await axe('test hub');
    await X.page.click(OV + ' .ps-tcard:nth-child(1) button'); await X.page.waitForSelector(OV + ' h2:has-text("General instructions")'); await axe('instructions + quote');
    await X.page.check('#ps-read'); await X.page.click(OV + ' button:has-text("I am ready to begin")'); await X.page.waitForSelector('.px-time'); await axe('exam', '.px');
    await X.page.click('.px button:has-text("Submit")'); await X.page.waitForSelector('.px-modal'); await axe('submit dialog', '.px-modal');
    let esc = 0; for (let i = 0; i < 20; i++) { await X.page.keyboard.press('Tab'); if (!await X.page.evaluate(() => document.querySelector('.px-modal').contains(document.activeElement))) esc++; }
    ok(esc === 0, 'Tab stays inside the submit dialog');
    await X.page.click('.px-modal button:has-text("Yes, submit")'); await X.page.waitForSelector(OV + ' .ps-score'); await axe('scorecard');
    await X.ctx.close(); }

  await browser.close(); srv.close(); fs.rmSync(tmp, { recursive: true, force: true });
  console.log(fails ? `\n${fails} E2E CHECK(S) FAILED` : '\nALL E2E CHECKS PASSED'); process.exit(fails ? 1 : 0);
})().catch(e => { console.error('CRASH', e); process.exit(2); });
