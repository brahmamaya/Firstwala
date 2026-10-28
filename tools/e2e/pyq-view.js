/* Rank mode PYQs: the Topic-wise / Year-wise buttons. NODE_PATH=/tmp/nm PW=playwright-core CHROMIUM=/opt/pw-browsers/chromium node tools/e2e/pyq-view.js */
const { chromium } = require(process.env.PW || 'playwright-core'), http = require('http'), fs = require('fs'), path = require('path'), assert = require('assert');
const root = path.join(__dirname, '..', '..'), mt = { '.js': 'text/javascript', '.html': 'text/html', '.css': 'text/css', '.json': 'application/json' };
const srv = http.createServer((q, r) => { let f = path.join(root, decodeURIComponent(q.url.split('?')[0])); if (f.endsWith('/')) f += 'index.html'; fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end() } else { r.writeHead(200, { 'content-type': mt[path.extname(f)] || 'application/octet-stream' }); r.end(d) } }) }).listen(0, async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROMIUM }), p = await b.newPage({ viewport: { width: 900, height: 900 } }); const errs = []; p.on('pageerror', e => errs.push(e.message));
  try {
    await p.goto('http://localhost:' + srv.address().port + '/'); await p.waitForTimeout(2500); await p.click('.sn-x').catch(() => {});
    await p.click('.land-rank'); await p.waitForTimeout(600); await p.click('text=JEE Mains'); await p.waitForTimeout(900); await p.click('text=Dual Nature of Matter and Radiation'); await p.waitForTimeout(1200);
    await p.click('button:has-text("PYQs")'); await p.waitForTimeout(2500);
    const secs = () => p.$$eval('.rk-sec', e => e.map(x => x.textContent));
    let s = await secs(); assert(s.some(x => /Photoelectric/.test(x)), 'topic-wise shows topics: ' + s.join('|'));
    await p.click('[data-testid=rk-view-year]'); await p.waitForTimeout(1500); s = await secs();
    assert(s.length > 5 && s.every(x => /^((19|20)\d\d|Year not printed) \(\d+\)$/.test(x)), 'year-wise shows years: ' + s.join('|'));
    const years = s.map(x => +x.slice(0, 4)).filter(Boolean); assert.deepStrictEqual(years, [...years].sort((a, b) => b - a), 'years newest first');
    assert.strictEqual(s.reduce((a, x) => a + +/\((\d+)\)$/.exec(x)[1], 0), 235, 'all 235 questions are in the year groups');
    assert.strictEqual(await p.$eval('[data-testid=rk-view-year]', e => e.getAttribute('aria-pressed')), 'true');
    await p.click('.rk-subbtn >> nth=0'); await p.waitForTimeout(600); assert((await p.$$('.rk-card')).length > 0, 'opening an exam row shows questions');
    await p.click('[data-testid=rk-view-topic]'); await p.waitForTimeout(1200); s = await secs(); assert(s.some(x => /Photoelectric/.test(x)), 'back to topic-wise');
    assert(!errs.length, 'page errors: ' + errs.join(';')); console.log('PASS pyq topic-wise / year-wise buttons');
  } catch (e) { console.error('FAIL pyq view:', e.message); process.exitCode = 1 } finally { await b.close(); srv.close() }
});
