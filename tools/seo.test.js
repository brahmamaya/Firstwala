/* Checks the generated SEO files against the live sims list.  NODE_PATH=/tmp/nm CHROMIUM=/opt/pw-browsers/chromium node tools/seo.test.js */
const fs = require('fs'), path = require('path'), assert = require('assert');
const { loadSims, STATIC, SITE } = require('./seo.js'), root = path.join(__dirname, '..');
(async () => {
  const sims = await loadSims(), dir = path.join(root, 'sim'), files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));
  assert.strictEqual(files.length, sims.length, `sim pages (${files.length}) != sims (${sims.length}): run node tools/seo.js`);
  const titles = new Set(), urls = [];
  for (const s of sims) {
    const f = `${s.id}.html`; assert(files.includes(f), 'missing page for ' + s.id);
    const h = fs.readFileSync(path.join(dir, f), 'utf8'), url = `${SITE}/sim/${s.id}.html`;
    const t = (h.match(/<title>([^<]+)<\/title>/) || [])[1]; assert(t, f + ': no title'); assert(!titles.has(t), f + ': duplicate title ' + t); titles.add(t);
    assert(h.includes(`<link rel="canonical" href="${url}">`), f + ': canonical');
    const d = (h.match(/<meta name="description" content="([^"]*)">/) || [])[1]; assert(d && d.length <= 160, f + ': description missing or >160');
    assert.strictEqual((h.match(/<h1>/g) || []).length, 1, f + ': exactly one h1');
    assert(h.includes('lang="en"') && h.includes('property="og:image"') && h.includes('twitter:card') && h.includes('"LearningResource"'), f + ': og/twitter/jsonld/lang');
    assert(h.includes(`href="/#${encodeURIComponent(s.id)}"`), f + ': open link');
    assert(!/<style[\s>]/i.test(h) && !/\sstyle=/i.test(h) && !/\son[a-z]+=/i.test(h), f + ': inline style/handler');
    assert(![...h.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)].some(m => !/src=|application\/ld\+json/.test(m[1]) || (/src=/.test(m[1]) && m[2].trim())), f + ': inline script');
    JSON.parse(h.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
    urls.push(url);
  }
  const sm = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8'), locs = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
  const extra = fs.readdirSync(root).filter(f => /^(simulations|jee-main-.*|class-\d+-.*simulations|[a-z]+-simulations)\.html$/.test(f)).map(f => `${SITE}/${f}`);
  assert.deepStrictEqual([...locs].sort(), [...STATIC.map(p => `${SITE}/${p}`), ...extra, ...urls].sort(), 'sitemap URLs differ from pages: run node tools/seo.js');
  // hub and chapter pages: one h1, unique title, description <= 160, valid JSON-LD, every internal .html link exists
  const T = new Set(titles), existing = f => fs.existsSync(path.join(root, f.replace(/^\//, '').split('#')[0]));
  for (const u of extra) { const f = u.slice(SITE.length + 1), h = fs.readFileSync(path.join(root, f), 'utf8'), t = (h.match(/<title>([^<]+)<\/title>/) || [])[1];
    assert(t && !T.has(t), f + ': title missing or duplicate'); T.add(t); assert.strictEqual((h.match(/<h1>/g) || []).length, 1, f + ': exactly one h1');
    const d = (h.match(/<meta name="description" content="([^"]*)">/) || [])[1]; assert(d && d.length >= 60 && d.length <= 160, f + ': description length ' + (d || '').length);
    assert(h.includes(`<link rel="canonical" href="${u}">`), f + ': canonical'); [...h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].forEach(m => JSON.parse(m[1]));
    for (const m of h.matchAll(/href="(\/[^"#?]*\.html)"/g)) assert(existing(m[1]), f + ': broken link ' + m[1]); assert(!/undefined|NaN|\[object/.test(h), f + ': bad token'); }
  for (const f of files) { const h = fs.readFileSync(path.join(dir, f), 'utf8'); for (const m of h.matchAll(/href="(\/[^"#?]*\.html)"/g)) assert(existing(m[1]), 'sim/' + f + ': broken link ' + m[1]); }
  assert(/Sitemap: https:\/\/physica\.in\/sitemap\.xml/.test(fs.readFileSync(path.join(root, 'robots.txt'), 'utf8')), 'robots.txt sitemap line');
  assert(fs.statSync(path.join(root, 'og.png')).size > 5000, 'og.png');
  console.log(`seo.test OK: ${files.length} sim pages, ${extra.length} hub/chapter pages, ${locs.length} sitemap URLs`);
})().catch(e => { console.error('seo.test FAILED:', e.message); process.exit(1); });
