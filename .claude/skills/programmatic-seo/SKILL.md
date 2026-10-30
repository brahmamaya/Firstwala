---
name: programmatic-seo
description: Create many SEO pages from data (per simulation, chapter, class, topic) without thin or duplicate content. Use before adding any new family of generated pages.
---
# Programmatic SEO (quality gate)
A generated page family is worth adding only if each page has facts of its own. Gate, in order:
1. Search intent: is there a real query a student would type ("Kinematics JEE Main formulas", "projectile motion simulation class 11")? One page per intent, no near-duplicates (the same text with only the name changed).
2. Own content: at least ~150 words of text that exists only on this page (relation, what to observe, controls, worked example, questions). If a row has less, merge it into its parent hub instead of creating a page.
3. Template: unique title (<= 66 chars) and description (90-160 chars) built from the row's facts; one h1; canonical; JSON-LD that matches visible text; links to parent hub, siblings and the app.
4. Sample check: generate 5 pages, read them as a student, run `node tools/seo-audit.js` (duplicates, lengths) and check no two pages share a description.
5. Roll out in batches, then look at Search Console for indexing and "duplicate" or "crawled, not indexed" reports; stop and fix the template if many pages are not indexed.
Pages that must not exist: stub chapters (no content), pages that only list question text copied from books, doorway pages, auto-generated spam.
Candidates today: NEET chapter pages, per-chapter "important questions" pages with our own solutions (check rights of the question text first), Class 10 chapter hubs. Ask the owner before building them.
