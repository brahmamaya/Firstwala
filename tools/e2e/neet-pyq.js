/* Rank mode · NEET: subjects, NCERT chapters, PYQs (NEET 2026), selection and the PDF download.
   NODE_PATH=/tmp/nm PW=playwright-core CHROMIUM=/opt/pw-browsers/chromium node tools/e2e/neet-pyq.js */
const { chromium } = require(process.env.PW || 'playwright-core'), http = require('http'), fs = require('fs'), path = require('path'), assert = require('assert'), os = require('os'), { execFileSync } = require('child_process');
const root = path.join(__dirname, '..', '..'), mt = { '.js': 'text/javascript', '.html': 'text/html', '.css': 'text/css', '.json': 'application/json' };
const srv = http.createServer((q, r) => { const u = decodeURIComponent(q.url.split('?')[0]); let f = path.resolve(root, '.' + u); if (u.endsWith('/')) f = path.join(f, 'index.html'); if (!f.startsWith(root + path.sep)) { r.writeHead(403); r.end(); return } fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end() } else { r.writeHead(200, { 'content-type': mt[path.extname(f)] || 'application/octet-stream' }); r.end(d) } }) }).listen(0, async () => {
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
    await p.click('[data-testid=rk-select]'); await p.waitForTimeout(900); await p.click('.rk-subbtn >> nth=0'); await p.waitForTimeout(500); await p.click('button:has-text("Select all")'); await p.waitForTimeout(300);
    await p.click('[data-testid=rk-download]'); await p.waitForTimeout(500);
    const [dl] = await Promise.all([p.waitForEvent('download', { timeout: 60000 }), p.click('[data-testid=dl-go]').catch(() => p.click('.rk-dlg button:has-text("Download")'))]);
    assert(/\.pdf$/.test(dl.suggestedFilename()) && /NEET/.test(dl.suggestedFilename()), 'PDF name: ' + dl.suggestedFilename());
    const buf = fs.readFileSync(await dl.path()); assert(buf.slice(0, 5).toString() === '%PDF-' && buf.length > 20000, 'a real PDF was made');
    await p.evaluate(() => document.querySelector('.rk-modal')?.remove());
    // previous year papers: years 2005-2026, a whole paper as a plain PDF
    await p.$eval('[data-testid=rk-back]', e => e.click()); await p.waitForTimeout(400);
    await p.$eval('[data-testid=rk-sub-papers]', e => e.click()); await p.waitForTimeout(300);
    assert.strictEqual((await p.$$('[data-testid^=rk-year-]')).length, 23, 'years 2005 to 2026 plus Re-NEET 2026');
    await p.click('[data-testid=rk-year-2010]'); assert(await p.$('[data-testid=rk-paper-none]') && !(await p.$('[data-testid=rk-paper-q]')), 'a year without questions says so and has no download');
    await p.click('[data-testid=rk-year-2026r]');
    for (const k of ['q', 'sol']) {
      const [d2] = await Promise.all([p.waitForEvent('download', { timeout: 120000 }), p.click('[data-testid=rk-paper-' + k + ']')]);
      const nm = d2.suggestedFilename(), bb = fs.readFileSync(await d2.path());
      assert(/NEET-2026/.test(nm) && (k === 'sol' ? /solutions/.test(nm) : !/solutions/.test(nm)), 'paper name ' + nm);
      assert(bb.slice(0, 5).toString() === '%PDF-' && bb.length > 100000 && bb.length < 3000000, 'a vector paper PDF was made (' + bb.length + ' bytes: real text, small)');
      const tf = path.join(os.tmpdir(), 'physica-e2e-paper-' + process.pid + '-' + k + '.pdf'); fs.writeFileSync(tf, bb);
      try { const txt = execFileSync('pdftotext', [tf, '-'], { encoding: 'utf8', maxBuffer: 1 << 26 }); assert(/An ideal gas is made of polyatomic molecules/.test(txt) && /H₂|10⁻/.test(txt), 'the PDF text can be selected and copied'); if (k === 'sol') assert(/Answer: \(4\) 4/.test(txt), 'solutions are text too') } catch (e) { if (e.code !== 'ENOENT') throw e } finally { fs.rmSync(tf, { force: true }) }
    }
    // fonts cannot be fetched (fresh page, nothing cached): the paper still downloads, as raster pages
    { const c2 = await b.newContext({ viewport: { width: 1000, height: 900 }, acceptDownloads: true, serviceWorkers: 'block' }), p2 = await c2.newPage(); await p2.route('**/fonts/pp-*', r => r.abort());
      await p2.goto('http://localhost:' + srv.address().port + '/'); await p2.waitForTimeout(1200); await p2.click('[data-testid=mode-rank]'); await p2.waitForTimeout(600); await p2.click('[data-testid=rank-neet]'); await p2.waitForSelector('[data-testid=rank-neet-page]');
      await p2.click('[data-testid=rk-sub-papers]'); await p2.click('[data-testid=rk-year-2026r]');
      const [d4] = await Promise.all([p2.waitForEvent('download', { timeout: 180000 }), p2.click('[data-testid=rk-paper-q]')]); const b4 = fs.readFileSync(await d4.path());
      assert(b4.slice(0, 5).toString() === '%PDF-' && b4.length > 1000000, 'raster fallback PDF when the fonts are missing (' + b4.length + ' bytes)'); await c2.close() }
    for (const k of ['q-docx', 'sol-docx']) {
      const [d3] = await Promise.all([p.waitForEvent('download', { timeout: 120000 }), p.click('[data-testid=rk-paper-' + k + ']')]);
      const nm = d3.suggestedFilename(), bb = fs.readFileSync(await d3.path());
      assert(/\.docx$/.test(nm) && /NEET-2026/.test(nm), 'Word name ' + nm);
      assert(bb.slice(0, 2).toString() === 'PK' && bb.includes('word/document.xml') && bb.length > 300000, 'a real Word file was made (' + bb.length + ' bytes)');
    }
    // slides: the PDF is vector (text can be copied) and PowerPoint has real subscripts (B_y -> subscript run, no literal underscore)
    { const ing = require('../pyq-ingest/docx-ingest.js');
      await p.evaluate(() => document.querySelector('.rk-modal')?.remove()); await p.$eval('[data-testid=rk-sub-physics]', e => e.click()); await p.waitForTimeout(300); await p.click('[data-testid=rk-nch-physics-8b]'); await p.waitForTimeout(1500);
      await p.click('[data-testid=rk-select]'); await p.waitForTimeout(800); await p.click('button:has-text("Open all")'); await p.waitForTimeout(1500); for (const bt of await p.locator('button:has-text("Select all")').all()) await bt.click();
      for (const fmt of ['pdf', 'ppt']) {
        await p.evaluate(() => document.querySelector('.rk-modal')?.remove()); await p.click('[data-testid=rk-download]'); await p.waitForTimeout(500); if (fmt === 'ppt') await p.click('.rk-modal >> text=PowerPoint');
        const [d6] = await Promise.all([p.waitForEvent('download', { timeout: 120000 }), p.click('[data-testid=dl-go]')]); const b6 = fs.readFileSync(await d6.path());
        if (fmt === 'pdf') {
          assert(b6.slice(0, 5).toString() === '%PDF-' && b6.length < 400000, 'slides PDF is vector and small (' + b6.length + ' bytes)');
          const tf = path.join(os.tmpdir(), 'physica-e2e-slides-' + process.pid + '.pdf'); fs.writeFileSync(tf, b6);
          try { const txt = execFileSync('pdftotext', [tf, '-'], { encoding: 'utf8' }); assert(/electromagnetic wave travelling/.test(txt) && /B_?y|By/.test(txt) && !/B_y/.test(txt), 'slides PDF text can be copied, subscript without underscore') } catch (e) { if (e.code !== 'ENOENT') throw e } finally { fs.rmSync(tf, { force: true }) }
        } else {
          const z = ing.readZip(b6), names = [...z.keys()].filter(n => /^ppt\/slides\/slide\d+\.xml$/.test(n)), xml = names.map(n => z.get(n)().toString('utf8')).join('');
          assert(xml.includes('baseline="-25000"') && !/[A-Za-z]_[A-Za-z]/.test(xml.replace(/<[^>]+>/g, '')), 'PowerPoint: real subscript runs, no literal underscore');
        }
      }
    }
    // chapters with and without NEET questions are told apart
    await p.$eval('[data-testid=rk-back]', e => e.click()); await p.waitForTimeout(300); await p.$eval('[data-testid=rk-sub-physics]', e => e.click()); await p.waitForTimeout(400);
    // once every chapter of a subject has questions there is no Soon chapter left: then only the ready ones must show, and any Soon chapter must say so
    { const soon = (await p.$$('.rk-ch.soon')).length, ready = (await p.$$('.rk-ch:not(.soon)')).length; assert(ready > 0 && (soon === 0 || (await p.$$('.rk-ch.soon b')).length === soon), 'ready chapters are open and every chapter without questions says Soon (' + ready + ' ready, ' + soon + ' soon)') }
    assert(!errs.length, 'page errors: ' + errs.join(';')); console.log('PASS NEET subjects, chapters, PYQs, download');
  } catch (e) { console.error('FAIL neet pyq:', e.message); process.exitCode = 1 } finally { await b.close(); srv.close() }
});
