---
name: seo
description: Improve search visibility of physica.in (Google/Bing). Use for any SEO request: titles, descriptions, structured data, sitemap, internal links, new landing pages, what the owner must do outside the code.
---
# SEO for Physica (static site, GitHub Pages)
1. Read `docs/SEO.md` (what is generated, honest expectations, owner-side steps).
2. Run `node tools/seo-audit.js` (errors must be 0), then fix the cause in the generators (`tools/seo.js`, `tools/seo-pages.js`) and not in the generated pages. Regenerate: `NODE_PATH=/tmp/nm CHROMIUM=/opt/pw-browsers/chromium node tools/seo.js` then `node tools/seo.test.js`.
3. Rules: one clear search intent per page; title <= 66 characters with the main phrase first; description 90-160 characters, unique; one h1; canonical on every page; every page in `sitemap.xml`; useful internal links (chapter <-> simulations <-> class hubs). Original text only, no keyword stuffing, no hidden text, no thin or near-duplicate pages (see `programmatic-seo`).
4. Chapter pages exist only for chapters that have written content (a stub chapter gets no page). After adding a Rank chapter run the generator.
5. Things only the owner can do (Search Console sitemap, Bing, backlinks from WhatsApp/YouTube/Instagram/teachers): list them in the report, do not pretend they are done. Never promise a ranking.
