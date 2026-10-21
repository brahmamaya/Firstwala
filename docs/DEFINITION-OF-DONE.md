# Definition of Done: apply to **every** change, big or small

A change is not finished until each line below has been considered. Write "n/a: reason" instead of skipping silently.
The audience is mainly students aged **15+**, many under 18, often on a phone with a slow connection and a shared device.

1. **Security**: no personal data collected; no secret or private file in git; nothing student-specific leaves the device; CSP still strict; a test that tries to break the new behaviour (`tools/e2e/`, `tools/*.test.js`).
2. **Privacy & law**: what personal data does this touch? Is it needed (minimise)? Does `privacy.html` / `terms.html` still tell the truth (bump the version string if a material change: `private.current_terms()`, `TERMS` in `series.js`, both pages)? Children (<18): no tracking, no profiling, no ads; consent flow intact; erasure and export still work; retention defined.
3. **Accessibility** (WCAG 2.1 AA): keyboard only works, visible focus, labels, contrast in dark **and** light, screen-reader announcements for changing state, nothing important by colour alone, 44 px touch targets, readable at 200% zoom, plain language (Hinglish-friendly wording).
4. **Speed**: budget respected (`node tools/perf-budget.js`); nothing blocks first paint; heavy work lazy-loaded; database calls indexed and bounded; checked on a slow network and a low-end phone.
5. **Reliability & operations**: what happens when the network drops, the server is slow, the user double-clicks, the timer expires mid-save, the tab closes? Is there a kill switch / a way to see it failed (audit log, watchdog)? Is the rollback obvious?
6. **Incident readiness**: if this feature is abused, can we detect it (watchdog, Actions log) and undo it (revert the PR; GitHub Pages redeploys in about a minute)? Update `docs/SECURITY.md` if there is a new failure mode.
7. **Tests**: unit/SQL assertion, concurrency or fuzz if state is shared, browser e2e for UI (incl. axe), all green, run more than once to catch flakiness. A test must be able to fail (try breaking the code to prove it).
8. **Docs & ops**: README / `docs/SECURITY.md` updated; any dashboard setting the owner must change is listed with exact steps; placeholders `[[...]]` are never shipped silently.
9. **Honesty**: say what was NOT verified (e.g. real devices, legal review) and what risk remains.
