#!/usr/bin/env node
/* SEO audit of the generated static pages (no model, no network): node tools/seo-audit.js
   Errors (exit 1): missing title / description / canonical / viewport / lang, bad JSON-LD, images without alt, broken internal .html links,
   duplicate titles or descriptions, sitemap URLs without a file, pages missing from the sitemap, no llms.txt.
   Warnings: title over 70 characters, description under 70 or over 165, more than one h1. The three verification/404 pages are skipped. */
'use strict';
const fs = require('fs'), path = require('path'), root = path.join(__dirname, '..');
const SKIP = /^(googleb[0-9a-f]+|404)\.html$/;
const pages = [...fs.readdirSync(root).filter(f => f.endsWith('.html') && !SKIP.test(f)), ...fs.readdirSync(path.join(root, 'sim')).map(f => 'sim/' + f)];
const err = [], warn = [], T = new Map(), D = new Map();
const add = (m, k) => (m.get(k) || m.set(k, []).get(k));
for (const f of pages) {
  const h = fs.readFileSync(path.join(root, f), 'utf8'), g = re => (h.match(re) || [])[1] || '';
  const t = g(/<title>([^<]*)<\/title>/), d = g(/<meta name="description" content="([^"]*)"/), c = g(/<link rel="canonical" href="([^"]*)"/), e = m => err.push(`${f}: ${m}`), w = m => warn.push(`${f}: ${m}`);
  if (!t) e('no title'); else { if (t.length > 70) w(`title ${t.length} chars`); add(T, t).push(f); }
  if (!d) e('no description'); else { if (d.length < 70 || d.length > 165) w(`description ${d.length} chars`); add(D, d).push(f); }
  if (!c) e('no canonical'); if (!/name="viewport"/.test(h)) e('no viewport'); if (!/<html[^>]*lang=/.test(h)) e('no html lang');
  const h1 = (h.match(/<h1[ >]/g) || []).length; if (h1 !== 1) w(`${h1} h1`);
  for (const m of h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) { try { JSON.parse(m[1]); } catch { e('invalid JSON-LD'); } }
  for (const m of h.matchAll(/<img\b[^>]*>/g)) if (!/\balt=/.test(m[0])) e('image without alt');
  for (const m of h.matchAll(/href="\/?([^"#?:]+\.html)"/g)) if (!fs.existsSync(path.join(root, m[1]))) e(`broken link ${m[1]}`);
}
for (const [k, v] of T) if (v.length > 1) err.push(`duplicate title (${v.length}): ${k.slice(0, 70)}  e.g. ${v[0]}`);
for (const [k, v] of D) if (v.length > 1 && !/^(terms|privacy)\.html$/.test(v[0])) err.push(`duplicate description (${v.length}): ${k.slice(0, 70)}  e.g. ${v[0]}`);
const urls = [...fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8').matchAll(/<loc>([^<]*)<\/loc>/g)].map(m => m[1].replace('https://physica.in/', '') || 'index.html');
for (const u of urls) if (!fs.existsSync(path.join(root, u))) err.push(`sitemap URL without a file: ${u}`);
const inMap = new Set(urls); for (const f of pages) if (!inMap.has(f) && !/^(help|terms|privacy|about)\.html$/.test(f)) err.push(`page not in sitemap: ${f}`);
if (!fs.existsSync(path.join(root, 'llms.txt'))) err.push('llms.txt is missing (run tools/seo.js)');
console.log(`seo-audit: ${pages.length} pages, ${urls.length} sitemap URLs, ${err.length} errors, ${warn.length} warnings`);
err.slice(0, 40).forEach(x => console.log('ERROR ' + x)); warn.slice(0, 15).forEach(x => console.log('warn  ' + x)); if (warn.length > 15) console.log(`warn  ... ${warn.length - 15} more`);
process.exit(err.length ? 1 : 0);
