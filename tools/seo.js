/* SEO generator: one static, crawlable page per simulation (sim/<id>.html) + sitemap.xml + robots.txt (+ og.png if missing).
   Usage:  NODE_PATH=/tmp/nm CHROMIUM=/opt/pw-browsers/chromium node tools/seo.js [--og]   (--og re-renders og.png)
   Reads the app's own window.PhysicaSims in headless Chromium, so the pages can never drift from the real data.
   Idempotent: same sims + same SEO_DATE (default today) -> byte-identical output. Run after adding a sim, commit sim/ and sitemap.xml. */
const fs = require('fs'), path = require('path'), http = require('http');
const root = path.join(__dirname, '..'), SITE = 'https://physica.in';
const SUBJECT = { physics: 'Physics', chemistry: 'Chemistry', botany: 'Botany', zoology: 'Zoology' };
const STATIC = ['', 'about.html', 'help.html', 'terms.html', 'privacy.html'];
const CSP = "default-src 'self'; script-src 'self'; connect-src 'self'; img-src 'self' data:; style-src 'self'; font-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests";
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const clip = (s, n) => { s = s.replace(/\s+/g, ' ').trim(); if (s.length <= n) return s; const c = s.slice(0, n - 1), i = c.lastIndexOf(' '); return c.slice(0, i > n * .6 ? i : n - 1).replace(/[,;:.\s]+$/, '') + '…'; };

/* Read every simulation from the built site. Returns plain JSON (no functions). */
async function loadSims() {
  const { chromium } = require('playwright-core');
  const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.woff2': 'font/woff2', '.webmanifest': 'application/json' };
  const srv = http.createServer((q, r) => { let f = path.join(root, decodeURIComponent(new URL(q.url, 'http://x').pathname)); if (f.endsWith('/')) f += 'index.html';
    fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'application/octet-stream' }); r.end(d); }); });
  await new Promise(r => srv.listen(0, r));
  const b = await chromium.launch({ executablePath: process.env.CHROMIUM || '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
  try {
    const p = await b.newPage(); await p.route(/googletagmanager|google-analytics|docs\.google/, r => r.abort());
    await p.goto(`http://localhost:${srv.address().port}/`, { waitUntil: 'load' });
    await p.waitForFunction(() => Array.isArray(window.PhysicaSims) && window.PhysicaSims.length > 0, null, { timeout: 60000 });
    // lazy packs (bio/chem) fill in observe/formula after load: wait until every sim is complete, otherwise the output would vary run to run
    await p.waitForFunction(() => window.PhysicaSims.length > 300 && window.PhysicaSims.every(s => s.observe && s.formula && s.controls && s.controls.length), null, { timeout: 90000 });
    await p.waitForTimeout(1500);
    return await p.evaluate(() => window.PhysicaSims.map(s => ({ id: s.id, title: s.title, subject: s.subject, grade: s.grade, chapter: s.chapter, description: s.description, formula: s.formula, observe: s.observe, tryText: s.tryText || s.try,
      controls: (s.controls || []).map(c => ({ label: c.label, min: c.min, max: c.max, unit: c.unit, options: c.options ? c.options.map(o => o[1]) : undefined })) })));
  } finally { await b.close(); srv.close(); }
}

const pageTitle = s => `${s.title} | Class ${s.grade} ${SUBJECT[s.subject] || s.subject} simulation - Physica`;
const metaDesc = s => clip(s.description || `Interactive ${s.title} simulation from ${s.chapter}.`, 160);
const num = n => String(+(+n).toFixed(4));
function controlText(c) {
  if (c.options && c.options.length) return `${c.label}: choose ${c.options.slice(0, 8).join(', ')}${c.options.length > 8 ? ', …' : ''}`;
  if (typeof c.min === 'number' && typeof c.max === 'number') return `${c.label}: ${num(c.min)} to ${num(c.max)}${c.unit ? ' ' + c.unit : ''}`;
  return c.label;
}

function renderPage(s, siblings) {
  const url = `${SITE}/sim/${s.id}.html`, subj = SUBJECT[s.subject] || s.subject, desc = metaDesc(s), title = pageTitle(s), others = siblings.filter(x => x.id !== s.id);
  const ld = { '@context': 'https://schema.org', '@type': 'LearningResource', name: s.title, description: desc, educationalLevel: `Class ${s.grade}`, about: s.chapter, teaches: s.chapter, inLanguage: 'en',
    learningResourceType: 'Interactive simulation', isAccessibleForFree: true, url };
  const ldJson = JSON.stringify(ld).replace(/</g, '\\u003c');
  const ctrls = (s.controls || []).filter(c => c.label);
  const L = [];
  L.push('<!doctype html>', '<html lang="en">', '<head>', '<meta charset="utf-8">', '<meta name="referrer" content="strict-origin-when-cross-origin">', '<script src="/framebust.js"></script>',
    `<meta http-equiv="Content-Security-Policy" content="${CSP}">`, '<meta name="viewport" content="width=device-width, initial-scale=1">', `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(desc)}">`, `<link rel="canonical" href="${url}">`, '<meta name="color-scheme" content="light dark">', '<link rel="icon" href="/icons/icon-192.png">', '<link rel="stylesheet" href="/sim-page.css">',
    '<meta property="og:type" content="website">', '<meta property="og:site_name" content="Physica">', `<meta property="og:title" content="${esc(title)}">`, `<meta property="og:description" content="${esc(desc)}">`,
    `<meta property="og:url" content="${url}">`, `<meta property="og:image" content="${SITE}/og.png">`, '<meta property="og:image:width" content="1200">', '<meta property="og:image:height" content="630">',
    '<meta name="twitter:card" content="summary_large_image">', `<meta name="twitter:title" content="${esc(title)}">`, `<meta name="twitter:description" content="${esc(desc)}">`, `<meta name="twitter:image" content="${SITE}/og.png">`,
    `<script type="application/ld+json">${ldJson}</script>`, '</head>', '<body>', '<a class="skip" href="#main">Skip to content</a>',
    '<header class="sh"><a class="brand" href="/"><img src="/icons/icon-192.png" alt="" width="28" height="28">PHYSICA</a></header>', '<main id="main">',
    `<p class="crumb">Class ${s.grade} · ${esc(subj)} · ${esc(s.chapter)}</p>`, `<h1>${esc(s.title)}</h1>`, `<p class="lead">${esc(s.description || '')}</p>`,
    `<p><a class="cta" href="/#${encodeURIComponent(s.id)}">Open the simulation</a></p>`);
  if (s.observe) L.push('<h2>What to notice</h2>', `<p>${esc(s.observe)}</p>`);
  if (s.formula) L.push('<h2>Key relation</h2>', `<p class="formula">${esc(s.formula)}</p>`);
  if (s.tryText) L.push('<h2>Try this</h2>', `<p>${esc(s.tryText)}</p>`);
  if (ctrls.length) L.push('<h2>What you can change</h2>', '<ul>', ...ctrls.map(c => `<li>${esc(controlText(c))}</li>`), '</ul>');
  if (others.length) L.push(`<h2>More in ${esc(s.chapter)}</h2>`, '<ul class="links">', ...others.map(x => `<li><a href="/sim/${x.id}.html">${esc(x.title)}</a></li>`), '</ul>');
  L.push('</main>', '<footer class="sf"><a href="/">Physica home</a><a href="/about.html">About</a><a href="/help.html">Help</a><a href="/terms.html">Terms</a><a href="/privacy.html">Privacy</a></footer>', '</body>', '</html>', '');
  return L.join('\n');
}

function render(sims, date) {
  const files = {}, byCh = new Map();
  for (const s of sims) { const k = [s.grade, s.subject, s.chapter].join('|'); (byCh.get(k) || byCh.set(k, []).get(k)).push(s); }
  for (const s of sims) files[`sim/${s.id}.html`] = renderPage(s, byCh.get([s.grade, s.subject, s.chapter].join('|')));
  const urls = [...STATIC.map(p => `${SITE}/${p}`), ...sims.map(s => `${SITE}/sim/${s.id}.html`)];
  files['sitemap.xml'] = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + urls.map(u => `<url><loc>${u}</loc><lastmod>${date}</lastmod></url>`).join('\n') + '\n</urlset>\n';
  files['robots.txt'] = `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`;
  return files;
}

async function makeOg() {
  const { chromium } = require('playwright-core'), os = require('os');
  const font = 'file://' + path.join(root, 'fonts/orbitron.woff2');
  const html = `<!doctype html><meta charset="utf-8"><style>@font-face{font-family:O;src:url("${font}")}*{margin:0}body{width:1200px;height:630px;background:radial-gradient(circle at 80% 20%,#17325f,#000 65%);color:#fff;font-family:system-ui,sans-serif;display:flex;flex-direction:column;justify-content:center;padding:0 90px;box-sizing:border-box;border-left:14px solid #8fb3ff}
h1{font:800 150px/1 O,sans-serif;letter-spacing:10px}p{font-size:40px;line-height:1.35;color:#c9d6ee;margin-top:36px;max-width:960px}</style><h1>Physica</h1><p>Interactive Physics, Chemistry and Biology simulations - NCERT Class 10-12, NEET, JEE</p>`;
  const tmp = path.join(os.tmpdir(), 'physica-og.html'); fs.writeFileSync(tmp, html);
  const b = await chromium.launch({ executablePath: process.env.CHROMIUM || '/opt/pw-browsers/chromium', args: ['--no-sandbox', '--allow-file-access-from-files'] });
  try { const p = await b.newPage({ viewport: { width: 1200, height: 630 } }); await p.goto('file://' + tmp); await p.evaluate(() => document.fonts.ready); await p.screenshot({ path: path.join(root, 'og.png') }); } finally { await b.close(); fs.unlinkSync(tmp); }
}

async function main() {
  const sims = await loadSims(), date = process.env.SEO_DATE || new Date().toISOString().slice(0, 10);
  const ids = new Set(); for (const s of sims) { if (!/^[a-z0-9][a-z0-9-]*$/i.test(s.id) || ids.has(s.id)) throw new Error('bad or duplicate sim id: ' + s.id); ids.add(s.id); }
  sims.sort((a, b) => a.id < b.id ? -1 : 1);
  const titles = new Map(); for (const s of sims) { const t = pageTitle(s); if (titles.has(t)) console.warn(`warning: duplicate page title "${t}" (${titles.get(t)}, ${s.id})`); titles.set(t, s.id); }
  const files = render(sims, date), dir = path.join(root, 'sim'); fs.mkdirSync(dir, { recursive: true });
  for (const f of fs.readdirSync(dir)) if (f.endsWith('.html') && !files['sim/' + f]) fs.unlinkSync(path.join(dir, f)); // sim removed -> page removed
  for (const [f, c] of Object.entries(files)) fs.writeFileSync(path.join(root, f), c);
  if (process.argv.includes('--og') || !fs.existsSync(path.join(root, 'og.png'))) await makeOg();
  console.log(`seo: ${sims.length} sim pages, sitemap ${STATIC.length + sims.length} URLs, lastmod ${date}`);
}
module.exports = { loadSims, render, pageTitle, STATIC, SITE };
if (require.main === module) main().catch(e => { console.error(e); process.exit(1); });
