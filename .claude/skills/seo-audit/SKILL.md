---
name: seo-audit
description: Audit physica.in for technical and on-page SEO problems and fix them at the source. Use when asked to audit, check or find SEO errors.
---
# SEO audit
Run `node tools/seo-audit.js` (no network, no model). It checks every generated page for: title, description, canonical, viewport, lang, one h1, JSON-LD validity, image alt, broken internal links, duplicate titles/descriptions, sitemap vs files, `llms.txt`.
- Errors (exit 1) must be fixed; warnings are guidance (title over 70 characters, description outside 70-165).
- Fix in `tools/seo.js` / `tools/seo-pages.js` (or the hand-written pages `index.html`, `about.html`, `help.html`), regenerate, rerun `tools/seo.test.js` and `tools/seo-audit.js`.
- Report: what was found, what was fixed (with numbers before/after), what only the owner can do. Not covered by the tool: real rankings, Core Web Vitals (use PageSpeed Insights on the live site), backlinks; say so.
- Legal pages (`terms.html`, `privacy.html`): do not change their text.
