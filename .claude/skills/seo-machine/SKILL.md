---
name: seo-machine
description: The repeatable SEO pipeline of Physica (generate, test, audit, commit) so SEO work costs few tokens. Use at the end of any task that adds a simulation or a Rank chapter.
---
# SEO machine (the pipeline)
```
NODE_PATH=/tmp/nm CHROMIUM=/opt/pw-browsers/chromium node tools/seo.js   # sim pages, hubs, JEE chapter pages, sitemap.xml, robots.txt, llms.txt
node tools/seo.test.js                                                    # generator test
node tools/seo-audit.js                                                   # audit, errors must be 0
node tools/ship.js build && node tools/ship.js check                      # then commit with ship.js
```
Order: content change -> generate -> test -> audit -> build/check -> commit. Never edit generated pages by hand. The generator reads the live app data (simulations, Rank chapters with content), so a new simulation or chapter becomes a page, a sitemap entry and an `llms.txt` line automatically. Add a humour line for a new Rank chapter in `rank-export.js` (JOKE table) only for slides, not for SEO.
