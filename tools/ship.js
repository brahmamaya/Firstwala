#!/usr/bin/env node
/* One command for the repeated chores, with QUIET output (only failures and one summary line), to save tokens and tool calls.
   node tools/ship.js check [--e2e]      fast checks from CLAUDE.md (perf budget, guards, tests); --e2e adds the browser suite
   node tools/ship.js build              esbuild build (finds esbuild 0.24.2 under /tmp/claude-0/esb/v0.24.2 or $ESBUILD)
   node tools/ship.js commit "message"   stage everything except .claude, node_modules, caches; commit with the attribution trailer
   node tools/ship.js sync               merge origin/main; generated files (index.html, *.min.js, styles.min.css) conflict -> take ours + rebuild
   node tools/ship.js after-merge        after the squash merge: reset the work branch to origin/main, keep history, push (clears the stop-hook warning)
   Pull requests are still made with the GitHub tools (no gh CLI here). Session id for the trailer: $CLAUDE_SESSION or the default below. */
'use strict';
const cp = require('child_process'), fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..'), BR = process.env.WORK_BRANCH || 'ccr-28bb352c-9s4xnw';
const ESB = process.env.ESBUILD || '/tmp/claude-0/esb/v0.24.2/node_modules/.bin/esbuild';
const SESSION = process.env.CLAUDE_SESSION || 'https://claude.ai/code/session_01YK82CobsY8aTW3NchwsaVN';
const run = (cmd, args, o = {}) => cp.spawnSync(cmd, args, { cwd: root, encoding: 'utf8', maxBuffer: 1 << 28, env: { ...process.env, ...(o.env || {}) } });
const git = (...a) => run('git', a);
const tail = (s, n = 6) => String(s || '').trim().split('\n').slice(-n).join('\n');
const GEN = f => f === 'index.html' || f === 'styles.min.css' || /\.min\.js$/.test(f) || f === 'sw.js';
const fail = m => { console.error('FAIL ' + m); process.exit(1) };

function build() { if (!fs.existsSync(ESB)) fail('esbuild 0.24.2 missing: mkdir -p /tmp/claude-0/esb/v0.24.2 && cd /tmp/claude-0/esb/v0.24.2 && npm i esbuild@0.24.2'); const r = run('node', ['tools/build.js'], { env: { ESBUILD: ESB } }); if (r.status) fail('build\n' + tail(r.stderr + r.stdout)); console.log('build ok') }

function check(e2e) {
  const steps = [['perf budget', 'node', ['tools/perf-budget.js'], /FAIL/], ['private guard', 'node', ['tools/private-guard.js']], ['security guard', 'node', ['tools/security-guard.js']], ['secret guard', 'node', ['-e', "require('./tools/secret-guard.js')('.')"]],
    ['watchdog test', 'node', ['tools/watchdog.test.js']], ['series-import test', 'node', ['tools/series-import.test.js']], ['qgen verify test', 'node', ['tools/qgen/verify.test.js']], ['qgen verify', 'node', ['tools/qgen/verify.js']], ['qbank up to date', 'node', ['tools/qgen/build.js', '--check']], ['pyq view buttons', 'node', ['tools/e2e/pyq-view.js']]];
  const env = { NODE_PATH: '/tmp/nm:/tmp/claude-0/esb/e2e/node_modules', CHROMIUM: '/opt/pw-browsers/chromium', PW: 'playwright-core' };
  if (e2e) steps.push(['browser e2e', 'node', ['tools/e2e/e2e.js'], /FAIL/]);
  let bad = 0;
  for (const [name, c, a, re] of steps) { const r = run(c, a, { env }), out = r.stdout + r.stderr; if (r.status || (re && re.test(out))) { bad++; console.log('FAIL ' + name + '\n' + tail(out.split('\n').filter(l => !re || re.test(l) || !/^PASS/.test(l)).join('\n'), 12)) } else console.log('ok   ' + name) }
  console.log(bad ? bad + ' check(s) FAILED' : 'ALL CHECKS PASSED'); process.exit(bad ? 1 : 0);
}

function commit(msg) {
  if (!msg) fail('commit message needed');
  git('add', '-A', '--', '.', ':!.claude', ':!tools/e2e/node_modules', ':!**/__pycache__');
  if (!git('diff', '--cached', '--name-only').stdout.trim()) return console.log('nothing to commit');
  const r = git('commit', '-q', '-m', `${msg}\n\nCo-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>\nClaude-Session: ${SESSION}`); if (r.status) fail('commit\n' + tail(r.stderr)); console.log('committed ' + git('rev-parse', '--short', 'HEAD').stdout.trim());
}

function sync() {
  if (git('status', '--porcelain', '--untracked-files=no').stdout.trim()) fail('uncommitted changes: run commit first');
  const f = git('fetch', '-q', 'origin', 'main'); if (f.status) fail('fetch\n' + tail(f.stderr));
  const m = git('merge', 'origin/main', '--no-edit');
  if (!m.status) return console.log(/Already up to date/.test(m.stdout) ? 'already up to date with main' : 'merged main cleanly (rebuild + recheck advised)');
  const un = git('diff', '--name-only', '--diff-filter=U').stdout.split('\n').filter(Boolean), gen = un.filter(GEN), real = un.filter(x => !GEN(x));
  if (real.length) { console.log('REAL conflicts, resolve by hand: ' + real.join(', ')); process.exit(2) }
  for (const x of gen) git('checkout', '--ours', x);
  build(); git('add', '-A', '--', '.', ':!.claude', ':!tools/e2e/node_modules');
  const c = git('commit', '-q', '--no-edit'); if (c.status) fail('merge commit\n' + tail(c.stderr)); console.log('merged main; generated files rebuilt: ' + gen.join(', '));
}

function afterMerge() {
  const a = git('fetch', '-q', 'origin', 'main', `+refs/heads/${BR}:refs/remotes/origin/${BR}`); if (a.status) fail('fetch\n' + tail(a.stderr));
  for (const c of [['checkout', '-q', '-B', BR, 'origin/main'], ['merge', '-s', 'ours', '-q', '--no-edit', 'origin/' + BR], ['push', '-q', 'origin', BR]]) { const r = git(...c); if (r.status) fail(c.join(' ') + '\n' + tail(r.stderr)) }
  const remote = git('ls-remote', 'origin', BR).stdout.slice(0, 8), here = git('rev-parse', '--short=8', 'HEAD').stdout.trim();
  console.log(remote === here ? 'branch synced with main and pushed (' + here + ')' : 'pushed, but remote ' + remote + ' != local ' + here);
}

const [cmd, a] = process.argv.slice(2);
({ check: () => check(a === '--e2e'), build, commit: () => commit(a), sync, 'after-merge': afterMerge }[cmd] || (() => console.log(fs.readFileSync(__filename, 'utf8').split('*/')[0])))();
