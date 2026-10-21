# Security notes (GitHub-only Test Series)

Physica is a static website on GitHub Pages. There is **no server of ours, no database, no accounts and no payment**, which removes whole classes of risk (data breach, account takeover, injection into a backend).

| Risk | What we do |
|---|---|
| Personal data of students (many under 18; DPDP Act 2023 s.9) | The Test Series collects none: no login, no name, no email. Answers and scores stay in the student's own browser (localStorage). The only third party is Google Analytics, **off by default and only for visitors 18+ who opt in**; it is never loaded inside the Test Series. |
| Script injection (XSS) | Strict Content-Security-Policy (`script-src 'self'` plus Google Tag Manager only after opt-in); the Test Series builds the page with `textContent` / `createElement`, never `innerHTML`. |
| Leaked secrets / private files | `tools/secret-guard.js` and `tools/private-guard.js` run before every deploy. See `docs/PRIVATE-FILES.md`. |
| Tampering with the live site | `tools/watchdog.js` (GitHub Action) compares the live files with a fresh build, checks the TLS certificate and that internal files are not readable. |
| Answer-key leakage | Accepted trade-off of a server-less design: `tests/` is public. Therefore only free tests are published and the key is fetched only after submitting. |
| Cheating | Not preventable without a server (the timer is on the student's device). Be honest about this in marketing. |

Report a problem: easy@physica.in.
