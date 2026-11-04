/* Rank mode · NEET: subjects, NCERT chapters, PYQs (NEET 2026), selection and the PDF download.
   NODE_PATH=/tmp/nm PW=playwright-core CHROMIUM=/opt/pw-browsers/chromium node tools/e2e/neet-pyq.js */
const { chromium } = require(process.env.PW || 'playwright-core'), http = require('http'), fs = require('fs'), path = require('path'), assert = require('assert');
const root = path.join(__dirname, '..', '..'), mt = { '.js': 'text/javascript', '.html': 'text/html', '.css': 'text/css', '.json': 'application/json' };
const srv = http.createServer((q, r) => { let f = path.join(root, decodeURIComponent(q.url.split('?')[0])); if (f.endsWith('/')) f += 'index.html'; fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end() } else { r.writeHead(200, { 'content-type': mt[path.extname(f)] || 'application/octet-stream' }); r.end(d) } }) }).listen(0, async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROMIUM, args: ['--no-sandbox'] }), p = await b.newPage({ viewport: { width: 1000, height: 900 }, acceptDownloads: true }); const errs = []; p.on('pageerror', e => errs.push(e.message));
  try {
    await p.goto('http://localhost:' + srv.address().port + '/'); await p.waitForTimeout(1500);
    await p.click('[data-testid=mode-rank]'); await p.waitForTimeout(600); await p.click('[data-testid=rank-neet]'); await p.waitForSelector('[data-testid=rank-neet-page]');
    const pills = await p.$$eval('.rk-htabs button[data-k]', e => e.map(x => x.textContent));
    assert.deepStrictEqual(pills.slice(0, 4), ['Physics', 'Chemistry', 'Botany', 'Zoology'], 'four NEET subjects: ' + pills);
    const counts = {};
    for (const s of ['physics', 'chemistry', 'botany', 'zoology']) { await p.click('[data-testid=rk-sub-' + s + ']'); await p.waitForTimeout(250); counts[s] = (await p.$$('.rk-ch')).length }
    assert.deepStrictEqual(counts, { physics: 28, chemistry: 28, botany: 22, zoology: 18 }, 'NCERT chapter lists: ' + JSON.stringify(counts));
    // a chapter with PYQs only: just the PYQs tab, NEET 2026 questions, year metadata
    await p.click('[data-testid=rk-sub-physics]'); await p.click('text=Electrostatic Potential and Capacitance'); await p.waitForTimeout(1500);
    assert.deepStrictEqual(await p.$$eval('.rk-htabs button[data-k]', e => e.map(x => x.textContent)), ['PYQs'], 'stub chapter shows only the PYQs tab');
    assert.strictEqual(await p.$eval('.rk-title b', e => e.textContent), 'Physics: Electrostatic Potential and Capacitance');
    await p.click('[data-testid=rk-view-year]'); await p.waitForTimeout(800);
    assert(/^2026 \(\d+\)$/.test(await p.$eval('.rk-sec', e => e.textContent)), 'year-wise groups by year 2026');
    await p.click('.rk-subbtn >> nth=0'); await p.waitForTimeout(500);
    assert((await p.$$('.rk-card')).length >= 4, 'questions are listed');
    assert(await p.$('.rk-card .rk-fig'), 'a diagram question shows its figure');
    await p.click('.rk-card .rk-mini >> nth=0'); await p.waitForTimeout(200); assert(await p.$('.rk-ok'), 'Show answer reveals the answer');
    // select and download as PDF
    await p.click('[data-testid=rk-select]'); await p.waitForTimeout(600); await p.click('text=Select all'); await p.waitForTimeout(300);
    await p.click('text=/Download \\(\\d+\\)/'); await p.waitForTimeout(500);
    const [dl] = await Promise.all([p.waitForEvent('download', { timeout: 60000 }), p.click('[data-testid=dl-go]').catch(() => p.click('.rk-dlg button:has-text("Download")'))]);
    assert(/\.pdf$/.test(dl.suggestedFilename()) && /NEET/.test(dl.suggestedFilename()), 'PDF name: ' + dl.suggestedFilename());
    const buf = fs.readFileSync(await dl.path()); assert(buf.slice(0, 5).toString() === '%PDF-' && buf.length > 20000, 'a real PDF was made');
    // a chapter with no PYQs yet is marked Soon and still opens
    assert((await p.$$('.rk-ch.soon')).length >= 0);
    // JEE is untouched
    await p.click('text=Back'); await p.waitForTimeout(300); await p.click('text=Back'); await p.waitForTimeout(500);
    assert(!errs.length, 'page errors: ' + errs.join(';')); console.log('PASS NEET subjects, chapters, PYQs, download');
  } catch (e) { console.error('FAIL neet pyq:', e.message); process.exitCode = 1 } finally { await b.close(); srv.close() }
});
