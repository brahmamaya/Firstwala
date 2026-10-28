# SEO (search engine optimisation) for physica.in

## What is generated (no model, rerun after adding a simulation or a Rank chapter)
`NODE_PATH=/tmp/nm CHROMIUM=/opt/pw-browsers/chromium node tools/seo.js` then `node tools/seo.test.js`, commit the generated `*.html` pages and `sitemap.xml`.
- `sim/<id>.html`: one page per simulation (title, description, key relation, what to notice, controls, links to the chapter's other simulations and to the class/subject hub, JSON-LD LearningResource + BreadcrumbList).
- Hub pages: `simulations.html`, `class-N-simulations.html`, `class-N-<subject>-simulations.html`, `<subject>-simulations.html`, `biology-simulations.html` (keyword titles such as "Class 12 Physics Simulations – Free Interactive NCERT, JEE & NEET").
- `jee-main-<chapter>.html` for every Rank chapter that has content (formulas with examples, quick revision, most-asked types, myths, mistakes, related simulations; JSON-LD LearningResource + FAQPage + BreadcrumbList) and `jee-main-chapters.html` (the list). A new chapter file `rank-*-jee.js` gets its page automatically.
- `index.html`: keyword title and description, JSON-LD (WebSite, EducationalOrganization), robots meta, a small "explore" link row that links to every hub and to the JEE chapter list.
- `sitemap.xml` (all pages with lastmod), `robots.txt`, `og.png`, `404.html`.

## Honest expectations
Nobody can promise position 1 for every education search. Giants (Khan Academy, PhET, Vedantu, Physics Wallah, Careers360, SATHEE) have huge authority. What works for a new site: be the best answer for specific searches ("<topic> simulation class 12", "<chapter> JEE Main formulas", "<chapter> important questions") with real content on its own URL, many internal links, fast mobile pages, and then earn links. Indexing takes days to weeks; rankings move over months. The pages above give about 500 indexable URLs, each with real text.
Do NOT do: keyword stuffing, hidden text, copying other sites, buying links, auto-generated spam pages. They get a site penalised.

## What the owner must do (only the owner can)
1. Google Search Console (search.google.com/search-console): add physica.in (the verification file `googleb546031e4254b7e8.html` is already in the site). Sitemaps -> submit `https://physica.in/sitemap.xml`. URL Inspection -> "Request indexing" for `/`, `/simulations.html`, `/jee-main-chapters.html`, `/class-12-physics-simulations.html` and a few chapter pages. Look at Performance weekly (queries, impressions, clicks) and tell us which queries show up; we then improve those pages.
2. Bing Webmaster Tools (bing.com/webmasters): "Import from Google Search Console". Bing also feeds DuckDuckGo and other engines.
3. Links to the site (the biggest ranking factor): put https://physica.in in the WhatsApp channel, YouTube description and bio, Instagram bio, LinkedIn, Telegram/Reddit/Quora answers that really help (r/JEENEETards, r/Indian_Academia), the GitHub repo "About -> Website" and README, school and coaching contacts, education directories. Share a chapter page, not only the home page.
4. Keep the Google Analytics standard mode (already on) to see visits.
5. Check https://pagespeed.web.dev for `https://physica.in/` on mobile after each big change; report anything red.
6. Later: a short blog or "How to" page per big topic written by a teacher (original text) brings more long-tail searches; ask when you want it.

## Next steps we can do in code
NEET chapter pages, PYQ listing pages with our own step-by-step solutions (check the rights of the question text first), per-chapter "important questions" pages, internal "related simulations" on Rank pages, structured data for courses, IndexNow pings.
