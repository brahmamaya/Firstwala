# Security audit, 28 Oct 2026 (repository + published site)

Scope: this repository (static site on GitHub Pages, no server, no database, no accounts, no payments), its workflows and the browser code. Not scope: the live host headers (the audit sandbox cannot reach physica.in), GitHub account settings, Google Forms/Analytics, Supabase (old project).

## Architecture and attack surface
Static files only; student data (answers, scores) stays in the browser's localStorage. Network calls from the page: Google Analytics (after the default STANDARD mode starts; off on DNT/GPC), a public Google Form (feedback: name, country, text; help queries) and GoatCounter (inactive). Surfaces: XSS in the browser code, third-party scripts, the build/deploy pipeline (GitHub Actions), leaked secrets in git, repository permissions, clickjacking, supply chain (dev-only npm deps).

## Findings
| # | Severity | Finding | Evidence | Status |
|---|---|---|---|---|
| 1 | Medium (needs owner) | `_headers` and `_redirects` are NOT used by GitHub Pages, so HTTP headers (X-Frame-Options, frame-ancestors, Permissions-Policy, COOP/CORP) are not sent. Protection that does apply: CSP meta tag on every page, `framebust.js`, HTTPS enforced by GitHub, files not on the public whitelist are not published (`tools/publish.js`, watchdog). | `.github/workflows/pages.yml`, `_headers`, `tools/publish.js` | Mitigated in code; the real headers need Cloudflare in front (see actions). Live headers NOT verified (host unreachable from the sandbox). |
| 2 | Low | CSP `style-src` needs `'unsafe-inline'` because the code creates `<style>` elements at run time (`series-loader.js`, bundles). Script-src is strict (`'self'` + Google Tag Manager only). No HTML sinks exist, so there is no practical way to inject. | CSP violation probe with `style-src 'self'` (Chromium, local) | Accepted; remove it only after moving the runtime styles into the stylesheet. |
| 3 | Low | `404.html` had no CSP. | `tools/security-guard.js` | Fixed (CSP added; the page keeps its inline style). |
| 4 | Low | A workflow put `${{ vars.WATCHDOG_URL }}` directly inside a `run:` script (expression injection pattern; the value is set by the repo admin, so low). | `.github/workflows/watchdog.yml` | Fixed (passed through `env`). |
| 5 | Low | Actions are pinned to major tags (`@v4`), not commit SHAs; no automatic update PRs. | all workflows | Dependabot for actions added; SHA pinning needs a lookup of the current SHAs (not possible from this sandbox, the repo scope excludes the action repositories). |
| 6 | Info | No code scanning. | no CodeQL workflow | Added `.github/workflows/codeql.yml` (JavaScript, security-extended). Unverified until it runs on GitHub. |
| 7 | Info | The old Supabase project URL and its publishable key (a public client key by design, `sb_publishable_…`) are in git history before the removal. No secret/service-role key, token or private key was found in any commit. | scan of all 478 commits (patterns: AWS, Google, GitHub, OpenAI-style, Slack, private keys, JWT, assignments), values redacted | If the Supabase project still exists, pause or delete it (action below). History is not rewritten. |
| 8 | Info | Feedback and help forms send name/country to a public Google Form (spam possible; a honeypot field exists; length caps 80/60/2000). Names of minors are personal data: keep the privacy page text in sync. | `feedback.js`, `help.js` | Accepted by design; lawyer review of privacy text already recommended. |
| 9 | Info | `tests/` (answer files of free tests) is public by design. | `docs/SECURITY.md` | Accepted. |
| 10 | Info | Branch `main` is protected (flag verified); rules (required reviews/checks) not visible through the API; four other branches are unprotected and stale. | GitHub branch list | Owner actions below. |

Checked and clean: zero dynamic-HTML sinks (`innerHTML`, `outerHTML`, `insertAdjacentHTML`, `document.write`, `eval`, `new Function`) in all readable sources; no unsafe `target=_blank`; service worker handles same-origin GET only and skips `/tests/` and `/sim/`; workflows have minimal `permissions` and no `pull_request_target`; `npm audit` (dev dependencies of the e2e tests) found 0 vulnerabilities; no key/credential file names tracked; `content/` (private banks) is untracked.

## Fixed and verified (local)
`tools/security-guard.js` (+ `--self` proof that each check detects a bad sample) now runs in CI (`checks.yml`) and in `node tools/ship.js check`: CSP on every page without `unsafe-eval`/script `unsafe-inline`, no HTML sinks, workflow permissions, no expressions in `run`, `rel=noopener`, no key files. Full e2e and the other checks pass after the changes.

## Implemented but not verified
CodeQL workflow and Dependabot config (they only run on GitHub after merge).

## Requires owner action (account access)
1. Cloudflare (free) in front of physica.in, to send the real headers: add the site, proxy the DNS record, then Rules -> Transform Rules -> Modify Response Header and set the headers listed in `_headers` (CSP is already in the pages; add X-Frame-Options DENY, Permissions-Policy, Cross-Origin-Opener-Policy same-origin, X-Content-Type-Options nosniff, Referrer-Policy). Verify with https://securityheaders.com and https://observatory.mozilla.org. Rollback: pause Cloudflare for the site / switch the DNS record to DNS only.
2. GitHub -> Settings -> Code security: enable Dependabot alerts, secret scanning and push protection (free for public repos); check that code scanning shows the CodeQL results.
3. Settings -> Branches (or Rules): on `main` require a pull request and the "Checks" status check, block force pushes and deletion. Delete stale branches `brahmamaya-patch-1..3` and `claude/chat-session-qj0iii` if not needed. Turn on two-factor authentication for the GitHub account.
4. Supabase dashboard: if the old project still exists, pause or delete it (or rotate its publishable/secret keys). Nothing in this repository needs it any more.
5. Google Form: keep the form owner's account on 2-step verification; consider switching on "limit to 1 response" is NOT possible without login, so watch the Sheet for spam.
6. Renew `/.well-known/security.txt` before 2027-10-10 (the `Expires` field).

## Remaining limits
This is a static site, so there is no login to attack, but the audit cannot prove it is "secure": third-party scripts (Google) are trusted; header protections depend on step 1; a hijacked GitHub account could publish malicious files (hence 2FA and branch rules); the live site was not tested.
