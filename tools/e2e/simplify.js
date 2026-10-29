/* Simplified simulation page: functional checks (browse, controls, action bar, menus, recording at every quality,
   focus/fullscreen, keyboard). Run: node tools/e2e/simplify.js   (needs Chromium; set NODE_PATH for playwright) */
const L = require(process.env.LAB || '/tmp/lab.js'), fs = require('fs'), os = require('os'), path = require('path');
const ok = [], bad = []; const t = (n, c, d = '') => { (c ? ok : bad).push(n + (c ? '' : ' :: ' + d)); if (/record/.test(n)) console.log(c ? 'ok  ' : 'FAIL', n, c ? '' : d); };
(async () => {
  const srv = await L.serve(), b = await L.browser(), port = srv.address().port, tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'rec-'));
  const mk = async (w, h, touch) => { const c = await b.newContext({ viewport: { width: w, height: h }, hasTouch: !!touch, isMobile: !!touch, acceptDownloads: true }); const p = await c.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message)); p.errs = errs; return p; };
  const p = await mk(1440, 900); await L.open(p, port, 'projectile');
  const vis = s => p.locator(s).first().isVisible();
  t('no page errors on load', p.errs.length === 0, p.errs.join('|'));
  for (const s of ['#browse-btn', '#play', '#restart', '.rec-btn', '.rec-quality', '#fullscreen-btn', '#view-btn', '#more-btn', '#understand', '.advanced']) t('visible: ' + s, await vis(s));
  t('Record not inside a menu', !(await p.evaluate(() => !!document.querySelector('.rec-btn').closest('.pop'))));
  t('quality options 720p/1080p/2K/4K', (await p.$$eval('.rec-quality option', o => o.map(x => x.textContent.split(' ')[0]).join(','))) === '720p,1080p,2K,4K');
  t('removed: WhatsApp/live label/rail hide buttons', await p.evaluate(() => !document.querySelector('.wa-top') && ![...document.querySelectorAll('.live-label,#rail-toggle,.panel-close')].some(e => e.offsetParent)));
  t('no Randomise in main UI', await p.evaluate(() => { const r = document.querySelector('#randomise-btn'); return !r || !!r.closest('.advanced'); }));
  t('Understand collapsed', await p.evaluate(() => !document.querySelector('#understand').open));
  // sliders + exact value
  const val0 = await p.inputValue('#controls input[type=range]');
  await p.focus('#controls input[type=range]'); await p.keyboard.press('ArrowRight'); await p.keyboard.press('ArrowRight');
  t('slider keyboard changes value', (await p.inputValue('#controls input[type=range]')) !== val0);
  // play/pause/reset
  const lab0 = await p.textContent('#play'); await p.click('#play'); const lab1 = await p.textContent('#play'); t('Play/Pause toggles', lab0 !== lab1, lab0 + '/' + lab1);
  await p.click('#play'); await p.click('#restart'); t('Reset clickable without error', p.errs.length === 0, p.errs.join('|'));
  // browse drawer
  await p.click('#browse-btn'); t('drawer opens', await p.evaluate(() => document.querySelector('#sidebar').classList.contains('open')));
  t('drawer has search + subject + class + chapters', await p.evaluate(() => ['#search', '.subject-tabs', '#chapter-list'].every(q => document.querySelector(q)?.offsetParent) && document.querySelectorAll('.grade-tab').length >= 3));
  const hash0 = await p.evaluate(() => location.hash);
  await p.click('#simulation-tabs button:nth-child(2)'); await p.waitForTimeout(700);
  t('choosing a simulation closes drawer + updates URL', await p.evaluate(h => !document.querySelector('#sidebar').classList.contains('open') && location.hash !== h, hash0));
  await p.keyboard.press('Escape');
  // menus
  await p.click('#view-btn'); t('View menu opens with overlays', await vis('#view-panel')); await p.keyboard.press('Escape'); t('Escape closes menu', !(await vis('#view-panel')));
  await p.click('#more-btn'); t('More has Favourite/Share/Snapshot/Help/Report/Appearance', await p.evaluate(() => ['#favourite-toggle', '#share-link', '#snapshot-btn', '#help-open', '[data-testid=report-problem]', '.theme-picker select'].every(q => document.querySelector('#more-panel ' + q))));
  await p.keyboard.press('Escape');
  // advanced + understand
  await p.click('.advanced summary'); t('Advanced shows speed/defaults', await vis('.advanced .simulation-playback') && await vis('#defaults'));
  await p.click('#understand summary'); t('Understand shows formula + observe', await vis('#formula') && await vis('#observation'));
  // snapshot + share
  await p.click('#more-btn'); const [dl] = await Promise.all([p.waitForEvent('download', { timeout: 8000 }).catch(() => null), p.click('#snapshot-btn')]); t('snapshot downloads', !!dl); await p.keyboard.press('Escape');
  // focus / fullscreen and exit
  await p.click('#fullscreen-btn'); await p.waitForTimeout(500); t('Fullscreen enters focus mode', await p.evaluate(() => document.body.classList.contains('focus')));
  t('recording + play still reachable in focus', await vis('.rec-btn') && await vis('#play'));
  await p.keyboard.press('Escape'); await p.waitForTimeout(400); if (await p.evaluate(() => document.body.classList.contains('focus'))) await p.click('#fullscreen-btn'); await p.waitForTimeout(400);
  t('Fullscreen exits', await p.evaluate(() => !document.body.classList.contains('focus')));
  console.log('pre-rec', await p.evaluate(() => [location.href, document.querySelectorAll('.rec-btn').length, document.body.className]));
  // recording at each quality: timer, stop, download, real resolution
  const res = {};
  for (const q of ['1280', '1920', '2560', '3840']) {
    console.log('rec', q);
    await p.selectOption('.rec-quality', q); await p.click('.rec-btn'); await p.click('[data-testid=rec-manual]'); await p.waitForTimeout(2300);
    const lbl = await p.textContent('.rec-btn'); const indicator = /Stop \d+:\d\d/.test(lbl);
    const [d] = await Promise.all([p.waitForEvent('download', { timeout: 15000 }).catch(() => null), p.click('.rec-btn')]);
    if (!d && q === '3840' && /could not keep up/.test(await p.textContent('.rec-note'))) { t('record 4K: slow device -> clear message, nothing saved, simulation unaffected', p.errs.length === 0); continue; }
    if (!d) { t('record ' + q, false, 'no download; label ' + lbl + ' note ' + await p.textContent('.rec-note')); continue; }
    const f = path.join(tmp, d.suggestedFilename()); await d.saveAs(f);
    const info = await p.evaluate(async ([b64, mime]) => { const v = document.createElement('video'); v.muted = true; v.src = 'data:' + mime + ';base64,' + b64; await new Promise(r => { v.onloadedmetadata = r; v.onerror = r; setTimeout(r, 4000); }); return { w: v.videoWidth, h: v.videoHeight, dur: v.duration }; }, [fs.readFileSync(f).toString('base64'), f.endsWith('.mp4') ? 'video/mp4' : 'video/webm']).catch(e => ({ err: e.message }));
    res[q] = info; t(`record ${q}: Stop+timer shown while recording`, indicator, lbl);
    t(`record ${q}: file ${d.suggestedFilename()} plays at ${info.w}x${info.h}`, +info.w === +q, JSON.stringify(info));
    t(`record ${q}: Record button restored`, (await p.textContent('.rec-btn')).trim().endsWith('Record'));
    t(`record ${q}: simulation unaffected`, p.errs.length === 0, p.errs.join('|'));
  }
  // keyboard: tab order reaches the action bar with a visible focus ring
  await p.focus('#browse-btn'); let seen = new Set();
  for (let i = 0; i < 40; i++) { await p.keyboard.press('Tab'); const id = await p.evaluate(() => { const e = document.activeElement; const o = getComputedStyle(e).outlineStyle; return (e.id || e.className || e.tagName) + (e === document.body || o !== 'none' || getComputedStyle(e).boxShadow !== 'none' ? '' : ' NOFOCUSRING'); }); seen.add(id); }
  t('keyboard reaches play/reset/record/fullscreen', ['play', 'restart', 'fullscreen-btn'].every(i => [...seen].some(s => s.startsWith(i))) && [...seen].some(s => /rec-btn/.test(s)), [...seen].join(','));
  t('visible focus ring on every stop', ![...seen].some(s => s.includes('NOFOCUSRING')), [...seen].filter(s => s.includes('NOFOCUSRING')).join(','));
  // viewports: no horizontal overflow, record visible without a menu
  for (const [n, w, h, touch] of [['phone', 390, 844, 1], ['tablet-portrait', 820, 1180, 1], ['tablet-landscape', 1180, 820, 1], ['desktop', 1440, 900, 0]]) {
    const q = await mk(w, h, touch); await L.open(q, port, 'projectile');
    const m = await q.evaluate(() => ({ ov: document.documentElement.scrollWidth - innerWidth, rec: !!document.querySelector('.rec-btn')?.offsetParent, clip: [...document.querySelectorAll('.action-bar button')].filter(e => e.offsetParent && (e.getBoundingClientRect().right > innerWidth + 1 || e.getBoundingClientRect().left < -1)).length }));
    t(`${n}: no horizontal scroll, Record visible, nothing clipped`, m.ov <= 1 && m.rec && m.clip === 0, JSON.stringify(m));
    await q.context().close();
  }
  console.log(JSON.stringify(res)); console.log(`${ok.length} passed, ${bad.length} failed`); bad.forEach(x => console.log('FAIL', x));
  await b.close(); srv.close(); process.exit(bad.length ? 1 : 0);
})().catch(e => { console.log(`${ok.length} passed before crash`); bad.forEach(x => console.log('FAIL', x)); console.log('CRASH', e.stack.split('\n').slice(0,6).join(' | ')); process.exit(1); });
