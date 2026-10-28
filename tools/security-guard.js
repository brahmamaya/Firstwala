/* Static security regression checks (no network, no model). Fails (exit 1) when a risky pattern comes back:
   1. every published HTML page has a CSP meta tag with no 'unsafe-eval' and no 'unsafe-inline' in script-src
   2. no dynamic-HTML sinks (innerHTML, outerHTML, insertAdjacentHTML, document.write, eval, new Function) in the readable sources
   3. GitHub workflows: a top-level `permissions:` block, no pull_request_target, no ${{ vars|inputs|github.event }} text inside a `run:` line
   4. every target="_blank" link has rel="noopener"
   5. no tracked file name that looks like a key, .env or credentials file
   node tools/security-guard.js [--self]   (--self runs the checks on synthetic bad samples to prove they detect) */
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process'), root = path.join(__dirname, '..');
const bad = [], tracked = cp.execFileSync('git', ['ls-files'], { cwd: root, encoding: 'utf8' }).split('\n').filter(Boolean);
const csp = h => (/http-equiv="Content-Security-Policy" content="([^"]*)"/.exec(h) || [])[1];
const checkHtml = (f, h) => { const c = csp(h); if (!c) return bad.push(`${f}: no CSP meta tag`); const s = (/script-src ([^;]*)/.exec(c) || [])[1] || ''; if (/unsafe-eval/.test(c)) bad.push(`${f}: CSP has unsafe-eval`); if (/unsafe-inline/.test(s)) bad.push(`${f}: CSP script-src has unsafe-inline`); if (!/object-src 'none'/.test(c) || !/base-uri 'self'/.test(c)) bad.push(`${f}: CSP lacks object-src 'none' or base-uri 'self'`);
  for (const m of h.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g)) if (!/rel="[^"]*noopener/.test(m[0])) bad.push(`${f}: target=_blank without rel=noopener`); };
const SINK = /\b(innerHTML|outerHTML|insertAdjacentHTML)\b|document\.write\(|\beval\(|new Function\(/;
const checkJs = (f, t) => t.split('\n').forEach((l, i) => { if (SINK.test(l) && !/^\s*(\/\/|\/\*|\*)/.test(l) && !/no innerHTML|never .*innerHTML/i.test(l)) bad.push(`${f}:${i + 1}: dynamic-HTML sink`); });
const checkYml = (f, t) => { if (!/^permissions:/m.test(t)) bad.push(`${f}: no top-level permissions block`); if (/pull_request_target/.test(t)) bad.push(`${f}: uses pull_request_target`);
  t.split('\n').forEach((l, i) => { if (/^\s*(-\s*)?run:/.test(l) && /\$\{\{\s*(vars|inputs|github\.event|github\.head_ref)/.test(l)) bad.push(`${f}:${i + 1}: expression inside run (pass it through env instead)`); }); };
const checkName = f => { if (/(^|\/)\.env(\.|$)|\.(pem|p12|pfx|key)$|id_rsa|credentials(\.|$)/i.test(f)) bad.push(`${f}: looks like a key or credentials file`); };
if (process.argv.includes('--self')) {
  const t = (name, fn, input, n) => { bad.length = 0; fn('x', input); console.log((bad.length >= n ? 'PASS ' : 'FAIL ') + name); if (bad.length < n) process.exitCode = 1; };
  t('csp missing', checkHtml, '<html></html>', 1); t('unsafe-eval', checkHtml, '<meta http-equiv="Content-Security-Policy" content="script-src \'self\' \'unsafe-eval\'; object-src \'none\'; base-uri \'self\'">', 1);
  t('script unsafe-inline', checkHtml, '<meta http-equiv="Content-Security-Policy" content="script-src \'unsafe-inline\'; object-src \'none\'; base-uri \'self\'">', 1); t('blank without noopener', checkHtml, '<meta http-equiv="Content-Security-Policy" content="script-src \'self\'; object-src \'none\'; base-uri \'self\'"><a target="_blank" href="x">', 1);
  t('innerHTML', checkJs, 'el.innerHTML = x;', 1); t('comment ignored', checkJs, '// no innerHTML here', 0); t('permissions missing', checkYml, 'on: push\njobs: {}', 1); t('pull_request_target', checkYml, 'permissions: {}\non: pull_request_target', 1);
  t('expression in run', checkYml, 'permissions: {}\n    run: echo "${{ github.event.issue.title }}"', 1); t('key file', (f) => checkName('config/server.pem'), '', 1); process.exit(process.exitCode || 0);
}
for (const f of tracked) { checkName(f); const p = path.join(root, f);
  if (/\.html$/.test(f) && !f.startsWith('content/') && fs.existsSync(p)) { const h = fs.readFileSync(p, 'utf8'); if (/<html/i.test(h)) checkHtml(f, h); }   // the Search Console verification file is plain text
  else if (/\.js$/.test(f) && !/\.min\.js$/.test(f) && !f.startsWith('tools/') && !f.startsWith('content/') && fs.existsSync(p)) checkJs(f, fs.readFileSync(p, 'utf8'));
  else if (/^\.github\/workflows\/.*\.ya?ml$/.test(f)) checkYml(f, fs.readFileSync(p, 'utf8')); }
console.log(bad.length ? 'security-guard FAILED:\n  ' + bad.slice(0, 30).join('\n  ') : `security-guard ok (${tracked.length} tracked files checked)`);
process.exit(bad.length ? 1 : 0);
