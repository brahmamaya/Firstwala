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
  assert.deepStrictEqual([...locs].sort(), [...STATIC.map(p => `${SITE}/${p}`), ...urls].sort(), 'sitemap URLs differ from pages: run node tools/seo.js');
  assert(/Sitemap: https:\/\/physica\.in\/sitemap\.xml/.test(fs.readFileSync(path.join(root, 'robots.txt'), 'utf8')), 'robots.txt sitemap line');
  assert(fs.statSync(path.join(root, 'og.png')).size > 5000, 'og.png');
  console.log(`seo.test OK: ${files.length} pages, ${locs.length} sitemap URLs`);
})().catch(e => { console.error('seo.test FAILED:', e.message); process.exit(1); });
