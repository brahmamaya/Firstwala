/* Physica Test Series: email-code login, test list, timed exam and results on top of Supabase.
   Loaded on demand (series-loader.js -> physica-series.min.js). No SDK: the site CSP allows only 'self' scripts, so this talks to
   Supabase's REST API directly. Only the PUBLIC publishable key lives here; everything secret (answers, timer, scoring, who may
   start a test) is enforced inside Postgres, see supabase/schema.sql. Never put a service_role / secret key in this repo. */
(() => {
'use strict';
const SUPA = 'https://lbyqvwkichjvrrzcddtq.supabase.co';
const GW = '';                          // API gateway address (see gateway/README.md). Empty = talk to Supabase directly.
const BASE = GW || SUPA;
const KEY = 'sb_publishable_E3vG7C6UN13-1PoWwJNauA_uq7zvZxi';
const STORE = 'physica-series-auth';
const TERMS = '2026-10-21';            // must equal private.current_terms() in supabase/schema.sql
const GA_ID = 'G-Z1BGVQBEJ6';
const IDLE_MS = 30 * 60 * 1000;         // sign out an unattended shared-device session
const EXAMS = { JEE_MAIN: 'JEE Main', JEE_ADV: 'JEE Advanced', NEET: 'NEET' };
const MSG = {
  network: 'No internet connection. Check your network and try again.',
  over_email_send_rate_limit: 'Too many codes requested. Please wait a few minutes and try again.',
  otp_expired: 'That code is wrong or has expired. Request a new one.',
  invalid_code: 'That code is wrong or has expired. Request a new one.',
  validation_failed: 'Please enter a valid email address.',
  attempt_closed: 'Time is up for this test.',
  not_enrolled: 'This test is not part of your plan yet.',
  test_not_open: 'This test has not opened yet.',
  test_closed: 'This test is closed.',
  test_not_found: 'This test is not available.',
  profile_incomplete: 'Please finish your profile first.',
  consent_required: 'Students under 18 need a parent or guardian to agree.',
  invalid_name: 'Please enter your name.',
  invalid_parent_email: 'Please enter a valid email address for your parent or guardian.',
  invalid_answer: 'That answer is not valid for this question.',
  terms_outdated: 'Our Terms or Privacy Policy changed. Please read and accept them to continue.',
  rate_limited: 'You are doing that too fast. Please wait a moment and try again.',
  account_locked: 'Your account has been locked for safety. Please write to easy@physica.in and we will help you.',
  lockdown: 'Physica is temporarily offline for a security check. Your saved answers are safe. Please try again soon.',
  exams_paused: 'New tests cannot be started right now. Tests already in progress are not affected.',
  signups_closed: 'New sign-ups are paused for a short while. Please try again later.',
  invalid_device: 'Could not register this device.',
  review_expired: 'The question-by-question review is kept for 30 days. Your score and rank are still saved.',
  busy: 'Physica is very busy right now. Your answers are kept; please wait a few seconds and try again.',
  upstream: 'Our server had a hiccup. Please try again in a moment.',
  upstream_timeout: 'Our server is slow right now. Please try again in a moment.',
  gateway_required: 'Please reload the page and try again.',
};
const say = e => MSG[e && e.code] || (e && e.status === 429 ? MSG.over_email_send_rate_limit : 'Something went wrong. Please try again.');

/* ---------- tiny helpers ---------- */
const h = (tag, a, ...kids) => {
  const e = document.createElement(tag);
  if (a) for (const k in a) {
    const v = a[k];
    if (k === 'class') e.className = v;
    else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
    else if (v === true) e.setAttribute(k, '');
    else if (v !== false && v != null) e.setAttribute(k, v);
  }
  for (const x of kids.flat()) if (x != null && x !== false) e.append(x.nodeType ? x : document.createTextNode(String(x)));
  return e;
};
const sleep = ms => new Promise(r => setTimeout(r, ms));
const lsGet = k => { try { return localStorage.getItem(k); } catch { return null; } };
const lsSet = (k, v) => { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch {} };
const b64 = bytes => btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
// A random id kept in this browser (not a fingerprint). Only its salted hash is stored on the server, to spot logins from new devices.
function deviceId() {
  let d = lsGet('physica-device');
  if (!d || !/^[A-Za-z0-9_-]{22,64}$/.test(d)) { d = b64(crypto.getRandomValues(new Uint8Array(24))); lsSet('physica-device', d); }
  return d;
}
const err = (code, status) => Object.assign(new Error(code), { code, status });

/* Text -> DOM with real subscripts / superscripts (x_2, v_{0}, m^2, 10^-3). Only text nodes, <sub> and <sup> are created. */
function rich(el, text) {
  const re = /([_^])(\{[^}]*\}|[-−+]?\d+|[A-Za-z])/g;
  let last = 0, m;
  text = String(text ?? '');
  while ((m = re.exec(text))) {
    if (m.index > last) el.append(text.slice(last, m.index));
    el.append(h(m[1] === '_' ? 'sub' : 'sup', null, m[2].replace(/^\{|\}$/g, '')));
    last = re.lastIndex;
  }
  if (last < text.length) el.append(text.slice(last));
  return el;
}
const rt = (tag, text, cls) => rich(h(tag, cls ? { class: cls } : null), text);

/* ---------- auth + REST ---------- */
const ssGet = k => { try { return sessionStorage.getItem(k); } catch { return null; } };
const ssSet = (k, v) => { try { v == null ? sessionStorage.removeItem(k) : sessionStorage.setItem(k, v); } catch {} };
let sess = null, remember = false;
try { const l = lsGet(STORE); sess = JSON.parse(l || ssGet(STORE) || 'null'); remember = !!l; } catch { sess = null; }
// Default: the login lives only in this tab (gone when it closes), which is safe on shared / cyber-cafe computers.
// "Keep me signed in" (own device) stores it in localStorage instead.
const save = s => { sess = s; lsSet(STORE, null); ssSet(STORE, null); if (s) (remember ? lsSet : ssSet)(STORE, JSON.stringify(s)); };
const now = () => Math.floor(Date.now() / 1000);

async function raw(path, { method = 'GET', body, token, keepalive } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (!GW) headers.apikey = KEY;               // behind the gateway the key is added there
  if (token) headers.Authorization = 'Bearer ' + token;
  let r;
  try { r = await fetch(BASE + path, { method, headers, keepalive: !!keepalive, body: body === undefined ? undefined : JSON.stringify(body) }); }
  catch { throw err('network'); }
  const txt = await r.text();
  let data = null;
  try { data = txt ? JSON.parse(txt) : null; } catch {}
  if (!r.ok) throw err((data && (data.error_code || data.error || data.message || data.msg)) || 'http_' + r.status, r.status);
  return data;
}

function adopt(d) {
  save({ access_token: d.access_token, refresh_token: d.refresh_token, expires_at: d.expires_at || now() + d.expires_in, user: { id: d.user.id, email: d.user.email } });
}
let refreshing = null;
function refresh() {
  if (!sess) return Promise.reject(err('signed_out', 401));
  return refreshing || (refreshing = raw('/auth/v1/token?grant_type=refresh_token', { method: 'POST', body: { refresh_token: sess.refresh_token } })
    .then(adopt, e => { if (e.status && e.status < 500) save(null); throw e; })
    .finally(() => { refreshing = null; }));
}
async function api(path, opts = {}) {
  if (!sess) throw err('signed_out', 401);
  if (sess.expires_at - 30 < now()) await refresh();
  try { return await raw(path, { ...opts, token: sess.access_token }); }
  catch (e) { if (e.status !== 401) throw e; await refresh(); return raw(path, { ...opts, token: sess.access_token }); }
}
let stAt = 0, stVal = null;               // status is the same for everyone: reuse it for 20 s instead of asking again on every screen
const status = async () => { if (stVal && Date.now() - stAt < 20000) return stVal; const v = await raw('/rest/v1/rpc/get_status', { method: 'POST', body: {} }); stVal = v && !v.lockdown && !v.maintenance ? v : null; stAt = Date.now(); return v; };   // only a normal status is reused
const rpc = (fn, args, keepalive) => api('/rest/v1/rpc/' + fn, { method: 'POST', body: args || {}, keepalive });
const sendCode = email => raw('/auth/v1/otp', { method: 'POST', body: { email, create_user: true } });
const verifyCode = async (email, code, keep) => { const d = await raw('/auth/v1/verify', { method: 'POST', body: { type: 'email', email, token: code } }); remember = !!keep; adopt(d); };
const signOut = (everywhere) => { const t = sess && sess.access_token; save(null); if (t) raw('/auth/v1/logout' + (everywhere ? '?scope=global' : ''), { method: 'POST', token: t }).catch(() => {}); };

/* ---------- styles (theme variables come from styles.css) ---------- */
const CSS = `
.ps-ov{position:fixed;inset:0;z-index:2147483100;background:var(--bg);color:var(--text);overflow:auto;font-family:inherit;-webkit-overflow-scrolling:touch}
.ps-bar{position:sticky;top:0;z-index:2;display:flex;align-items:center;gap:12px;padding:10px 16px;background:var(--chrome);border-bottom:1px solid var(--line)}
.ps-bar b{letter-spacing:.04em}.ps-bar .ps-sp{flex:1}
.ps-main{max-width:980px;margin:0 auto;padding:20px 16px 60px}
.ps-full .ps-bar{display:none}.ps-full .ps-main{max-width:none;padding:0}
.ps-ov h1,.ps-ov h2,.ps-ov h3{margin:.2em 0 .5em;line-height:1.25}
.ps-ov{--ps-ok:#59e08f;--ps-err:#ff8a93;--ps-warn:#ffb347;--ps-link:var(--blue);--ps-s0:#2a3a4a;--ps-s0t:#eff8ff;--ps-s0b:#5b7186;--ps-s1:#c62828;--ps-s2:#2e7d32;--ps-s3:#6a1b9a}
:root[data-theme="light"] .ps-ov{--ps-ok:#0b6b3a;--ps-err:#b3261e;--ps-warn:#8a5300;--ps-link:#1a4fb8;--ps-s0:#e6e9ee;--ps-s0t:#1b2530;--ps-s0b:#9aa6b4}
.ps-quote{margin:12px 0;border-left:4px solid var(--ps-link)}.ps-quote blockquote{margin:0;font-size:1.05em;line-height:1.5}.ps-quote figcaption{margin-top:6px;font-size:.9em;color:var(--muted)}
.ps-card{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:16px;margin:12px 0}
.ps-ov button{font:inherit;cursor:pointer;border-radius:10px;border:1px solid var(--line2);background:var(--panel2);color:var(--text);padding:9px 14px}
.ps-ov button:hover:not(:disabled){border-color:var(--mint)}.ps-ov button:disabled{opacity:.5;cursor:default}
.ps-ov button.ps-go{background:var(--mint);color:var(--on-mint);border-color:var(--mint);font-weight:700}
.ps-ov input[type=text],.ps-ov input[type=email],.ps-ov input[type=number],.ps-ov input[inputmode]{width:100%;padding:11px 12px;border-radius:10px;border:1px solid var(--line2);background:var(--bg2);color:var(--text);font:inherit}
.ps-ov :focus-visible{outline:2px solid var(--mint);outline-offset:2px}
.ps-ov a,.ps-ov button.ps-link{color:var(--ps-link)}
.ps-ov button.ps-link{background:none!important;border:0!important;padding:0!important;text-decoration:underline;cursor:pointer}
.ps-ov [hidden]{display:none!important}
.ps-lbl{display:block;margin:.6em 0 .35em;font-weight:600}
.ps-muted{color:var(--muted)}.ps-err{color:var(--ps-err);min-height:1.4em}.ps-ok{color:var(--ps-ok)}
.ps-row{display:flex;flex-wrap:wrap;gap:10px;align-items:center}.ps-row>.ps-sp{flex:1}
.ps-pill{display:inline-block;font-size:12px;padding:2px 9px;border-radius:99px;border:1px solid var(--line2);color:var(--muted)}
.ps-pill.free{color:var(--ps-ok);border-color:var(--ps-ok)}.ps-pill.paid{color:var(--ps-warn);border-color:var(--ps-warn)}
.ps-narrow{max-width:420px;margin:30px auto}
.ps-banner{padding:8px 12px;border-radius:10px;border:1px solid var(--ps-warn);color:var(--ps-warn);margin:8px 0}
.ps-sub{color:var(--muted);font-size:.9em;margin-top:6px}
.ps-sr{position:absolute!important;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
.ps-ov sub,.ps-ov sup{font-size:.75em;line-height:0}
.ps-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(168px,1fr));gap:12px}
.ps-tile{display:grid;gap:4px;text-align:left;padding:18px!important}.ps-tile b{font-size:1.1em}
.ps-tcard{margin:0!important;display:flex;flex-direction:column;gap:6px}.ps-tcard.soon{border-style:dashed;background:transparent}
.ps-ct{display:flex;justify-content:space-between;align-items:center;gap:8px}
.ps-tcard button{width:100%}.ps-tcard button.done{border-color:var(--ps-ok)}.ps-soon{margin:6px 0 0;font-size:.9em}
.ps-st{display:inline-grid;place-items:center;width:34px;height:30px;font-weight:700;font-size:13px;color:#fff;flex:none;position:relative}
.ps-st.s0{background:var(--ps-s0);color:var(--ps-s0t);border:1px solid var(--ps-s0b);border-radius:4px}
.ps-st.s1{background:var(--ps-s1);clip-path:polygon(0 0,100% 0,100% 68%,50% 100%,0 68%)}
.ps-st.s2{background:var(--ps-s2);clip-path:polygon(50% 0,100% 28%,100% 100%,0 100%,0 28%)}
.ps-st.s3{background:var(--ps-s3);border-radius:50%}
.ps-st.s4{background:var(--ps-s3);border-radius:50%}.ps-st.s4::after{content:'\\2713';position:absolute;right:-4px;bottom:-4px;width:14px;height:14px;border-radius:50%;background:var(--ps-s2);color:#fff;font-size:10px;line-height:14px;text-align:center}
.ps-legend{display:grid;gap:8px;grid-template-columns:repeat(auto-fit,minmax(260px,1fr))}.ps-lg{display:flex;gap:10px;align-items:flex-start}
.ps-scroll{overflow-x:auto}.ps-tbl{border-collapse:collapse;width:100%;min-width:560px}.ps-tbl th,.ps-tbl td{border:1px solid var(--line);padding:6px 8px;text-align:left}.ps-tbl th{background:var(--panel2)}
.ps-score{text-align:center}.ps-big2{font-size:3rem;font-weight:800;line-height:1.1}.ps-big2 small{font-size:1.2rem;font-weight:500;color:var(--muted)}.ps-big{font-weight:800}
.ps-bar2{height:10px;background:var(--panel2);border-radius:99px;overflow:hidden;margin:8px 0}.ps-bar2 i{display:block;height:100%;background:var(--mint)}
.ps-sec{border:1px solid var(--line);border-radius:10px;margin:8px 0;padding:8px 12px}.ps-sec>summary{cursor:pointer;font-weight:700}
.ps-q2{border-top:1px solid var(--line);margin-top:8px;padding-top:6px}.ps-q2>summary{cursor:pointer}.ps-q2.right>summary{color:var(--ps-ok)}.ps-q2.wrong>summary{color:var(--ps-err)}
.ps-q{white-space:pre-wrap;font-size:1.05em;margin:.6em 0}
.ps-opt{display:flex;gap:10px;align-items:flex-start;padding:10px 12px;border:1px solid var(--line);border-radius:10px;margin:8px 0;background:var(--bg2)}
.ps-opt.right{border-color:var(--ps-ok)}.ps-opt.wrong{border-color:var(--ps-err)}
.ps-fig{max-width:100%;height:auto;background:#fff;border-radius:8px;margin:8px 0;min-height:40px}
.ps-ov::after{content:'';position:fixed;inset:0;pointer-events:none;z-index:5;background-image:var(--ps-mark,none)}
.ps-ov.ps-exam .ps-q,.ps-ov.ps-exam .ps-opt{-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}
@media print{.ps-ov{display:none!important}}
@media(max-width:560px){.ps-bar small{display:none}}
`;

/* ---------- shell ---------- */
let ov = null, main = null, userEl = null, outBtn = null, onLeave = null, idleTimer = null, lastActive = Date.now(), opener = null, deviceNoted = false;
let examLive = false, curExam = null, profileName = '';

function ensureShell() {
  if (ov) return;
  if (!document.getElementById('ps-style')) document.head.append(h('style', { id: 'ps-style' }, CSS));
  userEl = h('button', { type: 'button', class: 'ps-link', hidden: true, title: 'Your account and data', onclick: () => { if (leaveOk()) accountView(); } });
  outBtn = h('button', { type: 'button', hidden: true, onclick: () => { if (leaveOk()) { signOut(); view(); } } }, 'Logout');
  main = h('main', { class: 'ps-main', tabindex: '-1' });
  ov = h('div', { class: 'ps-ov', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Physica Test Series', hidden: true },
    h('header', { class: 'ps-bar' },
      h('b', null, 'PHYSICA · TEST SERIES'), h('span', { class: 'ps-sp' }), userEl, outBtn,
      h('button', { type: 'button', 'aria-label': 'Close test series', onclick: close }, '✕')),
    main);
  // Keep the lab's global shortcuts (Space, R, X, F, arrows ...) from firing while typing answers.
  for (const t of ['keydown', 'keyup', 'keypress']) ov.addEventListener(t, e => e.stopPropagation());
  ov.addEventListener('keydown', e => { if (e.key === 'Escape' && !examLive) close(); });
  ov.addEventListener('keydown', e => {                  // keep keyboard focus inside the dialog
    if (e.key !== 'Tab') return;
    const f = [...ov.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])')].filter(x => !x.closest('[hidden]') && x.offsetParent !== null);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && (document.activeElement === first || document.activeElement === ov)) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
  for (const t of ['pointerdown', 'keydown', 'scroll', 'touchstart']) ov.addEventListener(t, () => { lastActive = Date.now(); }, { passive: true, capture: true });
  // exam content must not be copied out: block context menu / copy / cut / drag while a test is on screen
  for (const t of ['contextmenu', 'copy', 'cut', 'dragstart']) ov.addEventListener(t, e => {
    if (!examLive) return;
    e.preventDefault();
    if (t !== 'contextmenu' && onCopy) onCopy();
  });
  document.body.append(ov);
}
function leaveOk() {
  return !examLive || confirm('Leave the exam screen? Your timer keeps running and your saved answers are kept. You can resume from the test list.');
}
let onCopy = null;
function open(opts) {
  if (opts && opts.exam) curExam = opts.exam;
  opener = document.activeElement;
  ensureShell();
  window['ga-disable-' + GA_ID] = true;          // no analytics inside the exam area, ever (students may be minors)
  ov.hidden = false;
  document.documentElement.style.overflow = 'hidden';
  // modal semantics: the lab behind the dialog must not be reachable by keyboard or screen reader
  for (const el of document.body.children) if (el !== ov && !el.hasAttribute('inert') && el.tagName !== 'SCRIPT') { el.setAttribute('inert', ''); el.dataset.psInert = '1'; }
  lastActive = Date.now();
  clearInterval(idleTimer);
  idleTimer = setInterval(() => {                // shared-device safety: drop an unattended, non-remembered login
    if (sess && !remember && !examLive && Date.now() - lastActive > IDLE_MS) { signOut(); if (ov && !ov.hidden) view(); }
  }, 30000);
  view();
}
function close() {
  if (!ov || ov.hidden || !leaveOk()) return;
  if (onLeave) { onLeave(); onLeave = null; }
  examLive = false;
  ov.hidden = true;
  clearInterval(idleTimer);
  document.documentElement.style.overflow = '';
  for (const el of document.querySelectorAll('[data-ps-inert]')) { el.removeAttribute('inert'); delete el.dataset.psInert; }
  if (opener && opener.focus) try { opener.focus(); } catch {}
}
function show(...nodes) {
  if (onLeave) { onLeave(); onLeave = null; }
  examLive = false;
  main.replaceChildren(...nodes.flat().filter(x => x != null && x !== false));
  ov.classList.remove('ps-exam', 'ps-full');
  const email = sess && sess.user && sess.user.email;
  userEl.textContent = email || ''; userEl.hidden = !email;
  outBtn.hidden = !email;
  paintMark(email);
  if (ov && !ov.hidden) main.focus({ preventScroll: true });   // move screen-reader / keyboard focus to the new screen
  ov.scrollTop = 0;
}
// Faint diagonal watermark with the student's own email: a leaked screenshot or photo of a paper can be traced back.
function paintMark(email) {
  if (!email) { ov.style.removeProperty('--ps-mark'); return; }
  const esc = String(email).replace(/[<>&"']/g, c => '&#' + c.charCodeAt(0) + ';');
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='420' height='240'><text x='20' y='130' transform='rotate(-22 210 120)' font-family='sans-serif' font-size='16' fill='gray' fill-opacity='0.17'>${esc} · PHYSICA</text></svg>`;
  ov.style.setProperty('--ps-mark', `url("data:image/svg+xml,${encodeURIComponent(svg)}")`);
}
const loading = what => show(h('p', { class: 'ps-muted', role: 'status' }, what || 'Loading…'));
function fatal(e, retry) {
  if (e && (e.code === 'signed_out' || e.status === 401)) { save(null); return view(); }
  if (e && (e.code === 'account_locked' || e.code === 'lockdown')) {
    return show(h('div', { class: 'ps-card ps-narrow' }, h('h2', null, e.code === 'lockdown' ? 'Back soon' : 'Account locked'), h('p', { role: 'alert' }, say(e)),
      h('p', { class: 'ps-row' }, e.code === 'lockdown' ? h('button', { type: 'button', class: 'ps-go', onclick: view }, 'Try again') : null,
        h('a', { href: 'mailto:easy@physica.in' }, 'easy@physica.in'))));
  }
  show(h('div', { class: 'ps-card' }, h('p', { class: 'ps-err', role: 'alert' }, say(e)),
    h('button', { type: 'button', class: 'ps-go', onclick: retry || view }, 'Try again')));
}

/* ---------- views ---------- */
let statusMsg = null;
async function view() {
  try { const st = await status(); statusMsg = st && st.message && !st.lockdown ? st.message : null; if (st && st.lockdown) return fatal(err('lockdown')); } catch {}
  if (!sess) return loginView();
  loading();
  try {
    if (!deviceNoted) { await rpc('note_device', { p_device: deviceId() }); deviceNoted = true; }
    const p = await rpc('get_my_profile');
    if (!p || p.is_minor == null || (p.is_minor && !(p.parent_consent_at && p.parent_email)) || p.terms_version !== TERMS) return profileView(p);
    profileName = p.display_name || '';
    hubView(curExam);
  } catch (e) { fatal(e); }
}

function loginView() {
  let email = '', step = 'email', cooldown = 0, timer = null, keep = false;
  const keepBox = h('input', { type: 'checkbox', id: 'ps-keep', onchange: ev => { keep = ev.target.checked; } });
  const msg = h('p', { class: 'ps-err', role: 'alert' });
  const card = h('div', { class: 'ps-card ps-narrow' });
  const stop = () => { clearInterval(timer); timer = null; };
  const done = btn => (on, label) => { btn.disabled = on; if (label) btn.textContent = label; };
  function paint() {
    msg.textContent = '';
    if (step === 'email') {
      const input = h('input', { type: 'email', id: 'ps-email', autocomplete: 'email', placeholder: 'you@example.com', required: true, value: email });
      const go = h('button', { class: 'ps-go', type: 'submit' }, 'Email me a code');
      card.replaceChildren(h('h2', null, 'Login or sign up'),
        h('p', { class: 'ps-muted' }, 'No password. We email you a 6-digit code.'),
        h('form', { onsubmit: async ev => {
          ev.preventDefault(); email = input.value.trim().toLowerCase(); const set = done(go); set(true, 'Sending…');
          try { await sendCode(email); step = 'code'; startCooldown(); paint(); } catch (e) { msg.textContent = say(e); set(false, 'Email me a code'); }
        } }, h('label', { class: 'ps-lbl', for: 'ps-email' }, 'Email'), input,
          h('label', { class: 'ps-row ps-sub', for: 'ps-keep' }, keepBox, h('span', null, 'Keep me signed in on this device. Tick only on your own phone or laptop, never on a shared or cyber-cafe computer.')),
          h('p', null, go)), msg);
      input.focus();
    } else {
      const input = h('input', { type: 'text', id: 'ps-code', inputmode: 'numeric', autocomplete: 'one-time-code', maxlength: '6', pattern: '[0-9]{6}', placeholder: '123456', required: true });
      const go = h('button', { class: 'ps-go', type: 'submit' }, 'Verify');
      const resend = h('button', { type: 'button', onclick: async () => {
        try { await sendCode(email); startCooldown(); msg.textContent = ''; } catch (e) { msg.textContent = say(e); }
      } }, 'Resend code');
      card.replaceChildren(h('h2', null, 'Enter your code'),
        h('p', { class: 'ps-muted' }, 'We sent a 6-digit code to ', h('b', null, email), '. Check spam if you don’t see it.'),
        h('form', { onsubmit: async ev => {
          ev.preventDefault(); const set = done(go); set(true, 'Checking…');
          try { await verifyCode(email, input.value.trim(), keep); stop(); view(); } catch (e) { msg.textContent = say(e); set(false, 'Verify'); }
        } }, h('label', { class: 'ps-lbl', for: 'ps-code' }, '6-digit code'), input, h('p', { class: 'ps-row' }, go, resend,
          h('button', { type: 'button', onclick: () => { step = 'email'; stop(); paint(); } }, 'Change email'))), msg);
      resend.disabled = cooldown > 0; resend.textContent = cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code';
      card._resend = resend;
      input.focus();
    }
  }
  function startCooldown() {
    stop(); cooldown = 30;
    timer = setInterval(() => {
      cooldown--; const b = card._resend;
      if (b && b.isConnected) { b.disabled = cooldown > 0; b.textContent = cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'; }
      if (cooldown <= 0) stop();
    }, 1000);
  }
  show(card);
  onLeave = stop;
  paint();
}

function profileView(p) {
  let minor = p && p.is_minor != null ? p.is_minor : null;
  const msg = h('p', { class: 'ps-err', role: 'alert' });
  const name = h('input', { type: 'text', id: 'ps-name', maxlength: '80', autocomplete: 'name', required: true, value: (p && p.display_name) || '' });
  const parent = h('input', { type: 'email', id: 'ps-parent', maxlength: '254', autocomplete: 'off', placeholder: 'parent@example.com', value: (p && p.parent_email) || '' });
  const consent = h('input', { type: 'checkbox', id: 'ps-consent' });
  const terms = h('input', { type: 'checkbox', id: 'ps-terms' });
  const minorBox = h('div', { hidden: minor !== true },
    h('p', { class: 'ps-sub' }, 'Because you are under 18, a parent or guardian must agree before you use Test Series. We keep their email only so we can reach them about your account.'),
    h('label', { class: 'ps-lbl', for: 'ps-parent' }, 'Parent or guardian email'), parent,
    h('label', { class: 'ps-row', for: 'ps-consent' }, consent, h('span', null, 'My parent or guardian has agreed to my using Physica Test Series and to Physica storing my name, email and test results as described in the Privacy Policy.')));
  const radio = (val, label) => h('label', { class: 'ps-row' }, h('input', { type: 'radio', name: 'ps-age', value: String(val), checked: minor === val,
    onchange: () => { minor = val; minorBox.hidden = !val; } }), label);
  const go = h('button', { class: 'ps-go', type: 'submit' }, 'Continue');
  const link = (href, t) => h('a', { href, target: '_blank', rel: 'noopener' }, t);
  show(h('div', { class: 'ps-card ps-narrow' }, h('h2', null, p && p.terms_version && p.terms_version !== TERMS ? 'We updated our terms' : 'Almost there'),
    h('form', { onsubmit: async ev => {
      ev.preventDefault();
      if (minor == null) { msg.textContent = 'Please tell us if you are under 18.'; return; }
      if (!terms.checked) { msg.textContent = 'Please accept the Terms and the Privacy Policy to continue.'; return; }
      go.disabled = true; msg.textContent = '';
      try { await rpc('save_profile', { p_name: name.value, p_is_minor: minor, p_parent_consent: consent.checked, p_parent_email: minor ? parent.value : null, p_terms_version: TERMS }); view(); }
      catch (e) { msg.textContent = say(e); go.disabled = false; }
    } }, h('label', { class: 'ps-lbl', for: 'ps-name' }, 'Your name'), name,
      h('p', { class: 'ps-muted' }, 'Are you…'), radio(false, '18 or older'), radio(true, 'Under 18'), minorBox,
      h('label', { class: 'ps-row', for: 'ps-terms' }, terms, h('span', null, 'I have read and accept the ', link('terms.html', 'Terms of Use'), ' and the ', link('privacy.html', 'Privacy Policy'), '.')),
      h('p', { class: 'ps-sub' }, 'We collect only what a test series needs. You can download or delete your data any time from your account.'),
      h('p', null, go)), msg));
}

/* ---------- exam hub: the 30 full-length tests of one exam ---------- */
const NAME = { JEE_MAIN: 'JEE Main', JEE_ADV: 'JEE Advanced', NEET: 'NEET' };
const ICON = { JEE_MAIN: '⚛️', JEE_ADV: '🚀', NEET: '🧬' };
const SUBJ = { PHYSICS: 'Physics', CHEMISTRY: 'Chemistry', MATHS: 'Mathematics', BOTANY: 'Botany', ZOOLOGY: 'Zoology' };
const KIND = { MCQ: 'Single correct', MULTI: 'One or more correct', NUM: 'Numerical value' };
const dur = min => { const hr = Math.floor(min / 60), m = Math.round(min % 60); return (hr ? hr + ' h' : '') + (hr && m ? ' ' : '') + (m || !hr ? m + ' min' : ''); };
const secLabel = s => { const sj = SUBJ[s.s] || s.s; return s.nm === sj ? sj : sj + ' · ' + s.nm; };
const minus = n => (n < 0 ? '−' + Math.abs(n) : (n > 0 ? '+' + n : '0'));

function pickView() {
  show(h('h1', null, 'Full-length test series'), h('p', { class: 'ps-muted' }, 'Choose your exam. Each has 30 tests in the real exam pattern; the first 3 are free.'),
    h('div', { class: 'ps-grid' }, Object.keys(NAME).map(k => h('button', { type: 'button', class: 'ps-tile', onclick: () => hubView(k) }, h('b', null, ICON[k] + ' ' + NAME[k]), h('small', null, '30 tests')))));
}

async function hubView(exam) {
  if (!exam) return pickView();
  curExam = exam; loading('Loading tests…');
  try {
    const [d, devs] = await Promise.all([rpc('list_tests', { p_exam: exam }), rpc('list_devices', { p_device: deviceId() })]);
    const byN = new Map(); for (const t of d.tests) { if (!byN.has(t.n)) byN.set(t.n, []); byN.get(t.n).push(t); }
    const any = d.tests.length ? d.pat[d.tests[0].pat] : null;
    const msg = h('p', { class: 'ps-err', role: 'alert' });
    const note = h('div', { class: 'ps-banner', role: 'status', hidden: true });
    const nDone = d.tests.filter(t => t.d).length;
    const when = s => new Date(s).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
    const testBtn = t => {
      const pat = d.pat[t.pat], tag = pat.pp > 1 ? `Paper ${t.p}: ` : '', now2 = Date.now();
      let text, go = null, cls = '';
      if (t.d) { text = `${tag}Result ${t.s}/${pat.mx}`; go = () => resultView(t.a); cls = 'done'; }
      else if (t.a) { text = tag + 'Resume'; go = () => runExam(t.a); cls = 'ps-go'; }
      else if (t.lk) { text = tag + '🔒 Locked'; go = () => { note.hidden = false; note.textContent = 'Tests 4 to 30 are paid. Online payment is not open yet; we will announce it here and on the official Physica WhatsApp channel. Tests 1 to 3 are free.'; note.focus(); }; cls = 'locked'; }
      else if (t.op && Date.parse(t.op) > now2) { text = `${tag}Opens ${when(t.op)}`; }
      else if (t.cl && Date.parse(t.cl) < now2) { text = tag + 'Closed'; }
      else { text = tag + 'Start'; go = () => instructionsView(t, pat); cls = 'ps-go'; }
      return h('button', { type: 'button', class: cls, disabled: !go, onclick: go, 'aria-label': `${NAME[exam]} Test ${t.n}${pat.pp > 1 ? ', paper ' + t.p : ''}: ${text}` }, text);
    };
    const cards = [];
    for (let n = 1; n <= 30; n++) {
      const free = n <= 3, ts = byN.get(n);
      cards.push(h('div', { class: 'ps-card ps-tcard' + (ts ? '' : ' soon') },
        h('div', { class: 'ps-ct' }, h('b', null, 'Test ' + n), h('span', { class: 'ps-pill ' + (free ? 'free' : 'paid') }, free ? 'FREE' : 'PAID')),
        ts ? ts.map(testBtn) : h('p', { class: 'ps-muted ps-soon' }, 'Coming soon')));
    }
    const recent = (() => { const seen = Number(lsGet('physica-dev-ack') || 0); const f = (devs || []).find(x => !x.current && Date.parse(x.first_seen) > Date.now() - 7 * 864e5 && Date.parse(x.first_seen) > seen);
      if (!f || devs.length < 2) return null;
      return h('div', { class: 'ps-banner', role: 'alert' }, h('b', null, 'New sign-in: '), 'your account was used on another device on ' + new Date(f.first_seen).toLocaleString() + '. If that was not you, ',
        h('button', { type: 'button', class: 'ps-link', onclick: () => { signOut(true); view(); } }, 'log out everywhere'), ' now. ',
        h('button', { type: 'button', class: 'ps-link', onclick: ev => { lsSet('physica-dev-ack', String(Date.now())); ev.currentTarget.parentNode.remove(); } }, 'This was me')); })();
    show(h('h1', null, ICON[exam] + ' ' + NAME[exam] + ' full-length tests'),
      any ? h('p', { class: 'ps-muted' }, `${any.q} questions · ${any.mx} marks · ${dur(any.m)} · real exam pattern${any.pp > 1 ? ' · 2 papers per test' : ''}. Tests 1–3 free, 4–30 paid.`) : h('p', { class: 'ps-muted' }, 'Tests are being added. Check back soon.'),
      h('p', { class: 'ps-sub' }, `${nDone} of 30 attempted`),
      statusMsg ? h('div', { class: 'ps-banner', role: 'status' }, statusMsg) : null, recent, note, msg,
      h('div', { class: 'ps-grid ps-tests' }, cards),
      h('p', { class: 'ps-sub' }, 'Pattern follows the officially announced format; rules can change each year. ', h('a', { href: 'terms.html', target: '_blank', rel: 'noopener' }, 'Terms')));
  } catch (e) { fatal(e, () => hubView(exam)); }
}

/* ---------- a short line of encouragement before the timer starts (original lines + a few well-documented sayings) ---------- */
const QUOTES = [
  ['Ek test sirf ek photo hai, poori film nahi. Aaj ki galti kal ka marks bachayegi.', ''],
  ['Every mock you finish is one less surprise on the real exam day.', ''],
  ['Panic is loud, practice is quiet. Trust the hours you have put in.', ''],
  ['Kal se behtar bano, doosron se nahi. Rank baad mein apne aap aa jaati hai.', ''],
  ['Do not fear a wrong answer today; fear never finding out why it was wrong.', ''],
  ['Pehle jo aata hai woh pakka karo, phir baaki par jao. Smart attempt hi score banata hai.', ''],
  ['A calm mind solves faster than a worried one. Breathe in, read the question twice, begin.', ''],
  ['Consistency beats intensity: small daily effort, big result in January and May.', ''],
  ['Darr ko deadline mat banne do. Tum taiyaar ho, bas shuru karo.', ''],
  ['Hard questions are meant for everyone. Stay steady and collect the marks you can.', ''],
  ['Dream, dream, dream. Dreams transform into thoughts and thoughts result in action.', 'Dr A. P. J. Abdul Kalam'],
  ['Arise, awake, and stop not till the goal is reached.', 'Swami Vivekananda'],
  ['Genius is one percent inspiration and ninety-nine percent perspiration.', 'Thomas A. Edison'],
  ['You miss 100% of the shots you do not take.', 'Wayne Gretzky']
];
const quoteCard = seed => { const q = QUOTES[(seed + Math.floor(Date.now() / 864e5)) % QUOTES.length];
  return h('figure', { class: 'ps-card ps-quote' }, h('blockquote', null, '“' + q[0] + '”'), q[1] ? h('figcaption', null, '— ' + q[1]) : null); };

/* ---------- general instructions (like the real exam, shown before the timer starts) ---------- */
function instructionsView(t, pat) {
  loadExam().catch(() => {});                          // fetch the exam screen while the student reads
  const legend = [['ps-st s0', 'Not Visited', 'You have not visited the question yet.'], ['ps-st s1', 'Not Answered', 'You have visited the question but not answered it.'],
    ['ps-st s2', 'Answered', 'You have answered the question and saved it.'], ['ps-st s3', 'Marked for Review', 'You want to look at this again; it is not counted as answered.'],
    ['ps-st s4', 'Answered & Marked for Review', 'Answered and marked; the answer IS evaluated.']];
  const rows = pat.s.map(s => h('tr', null, h('td', null, SUBJ[s.s] || s.s), h('td', null, s.nm === (SUBJ[s.s] || s.s) ? '—' : s.nm), h('td', null, KIND[s.t]), h('td', null, String(s.n)), h('td', null, '+' + s.c), h('td', null, minus(s.w)),
    h('td', null, s.t === 'MULTI' ? (s.p ? '+' + s.p + ' per right option' : 'none') : '—')));
  const chk = h('input', { type: 'checkbox', id: 'ps-read' });
  const msg = h('p', { class: 'ps-err', role: 'alert' });
  const go = h('button', { type: 'button', class: 'ps-go', disabled: true, onclick: async () => {
    go.disabled = true; msg.textContent = '';
    try { try { await document.documentElement.requestFullscreen?.(); } catch {} runExam(await rpc('start_attempt', { p_test_id: t.id })); }
    catch (e) { if (e.code === 'terms_outdated' || e.code === 'profile_incomplete') return view(); msg.textContent = say(e); go.disabled = false; }
  } }, 'I am ready to begin');
  chk.onchange = () => { go.disabled = !chk.checked; };
  show(h('button', { type: 'button', class: 'ps-link', onclick: () => hubView(curExam) }, '← All tests'),
    h('h1', null, `${pat.l} · Test ${t.n}${pat.pp > 1 ? ' · Paper ' + t.p : ''}`),
    quoteCard(t.n),
    h('div', { class: 'ps-card' }, h('h2', null, 'General instructions'),
      h('ul', null,
        h('li', null, `The test has ${pat.q} questions, ${pat.mx} marks and lasts `, h('b', null, dur(pat.m)), '. The timer runs on our server from the moment you click “I am ready to begin”. It does not stop if you close the page.'),
        h('li', null, 'You can attempt each test once. You can leave and come back: your saved answers are kept and the timer keeps running.'),
        h('li', null, 'To answer: choose an option (or type the number), then click ', h('b', null, 'Save & Next'), '. An answer is recorded only when you click ', h('b', null, 'Save & Next'), ' or ', h('b', null, 'Mark for Review & Next'), '.'),
        h('li', null, h('b', null, 'Clear Response'), ' removes your answer. Use the subject tabs and the numbered palette to move between questions.'),
        h('li', null, 'Your answers are sent to our server automatically. If your internet drops, keep going; they are sent when it returns.'),
        h('li', null, 'Switching tabs and copying are recorded. Please do not share these questions.'),
        h('li', null, 'At the end click ', h('b', null, 'Submit'), '. A summary is shown first. After submitting you cannot change anything.'))),
    h('div', { class: 'ps-card' }, h('h3', null, 'Question palette'), h('div', { class: 'ps-legend' }, legend.map(([c, a, b]) => h('div', { class: 'ps-lg' }, h('span', { class: c, 'aria-hidden': 'true' }, '7'), h('span', null, h('b', null, a), ' ' + b))))),
    h('div', { class: 'ps-card ps-scroll' }, h('h3', null, 'Marking scheme'), h('table', { class: 'ps-tbl' },
      h('thead', null, h('tr', null, ['Subject', 'Section', 'Type', 'Questions', 'Correct', 'Wrong', 'Partly right'].map(x => h('th', { scope: 'col' }, x)))), h('tbody', null, rows)),
      h('p', { class: 'ps-sub' }, 'Unanswered questions score 0. Marks are for each question of that section.')),
    h('label', { class: 'ps-row', for: 'ps-read' }, chk, h('span', null, 'I have read and understood the instructions.')),
    h('p', null, go), msg);
}

/* ---------- the exam screen is a separate chunk, fetched only when a test starts ---------- */
let examWait = null;
const loadExam = () => window.PhysicaSeriesExam ? Promise.resolve() : examWait || (examWait = new Promise((ok, no) => {
  const s = document.createElement('script'); s.src = '__SERIES_EXAM_URL__'; s.async = true; s.onload = ok; s.onerror = () => { examWait = null; s.remove(); no(err('network')); }; document.head.append(s);
}));
const kit = {
  h, rt, rich, rpc, say, sleep, SUPA: BASE, EXAM_NAME: NAME, SUBJ, KIND, minus, dur, secLabel,
  name: () => profileName || 'Candidate', email: () => sess && sess.user && sess.user.email,
  full: on => ov.classList.toggle('ps-full', !!on),
  live: on => { examLive = !!on; ov.classList.toggle('ps-exam', !!on); },
  mount: (...nodes) => { main.replaceChildren(...nodes.flat().filter(x => x != null && x !== false)); ov.scrollTop = 0; },
  leave: fn => { onLeave = fn; }, copy: fn => { onCopy = fn; },
  done: id => { kit.full(false); kit.live(false); resultView(id); },
  hub: () => { kit.full(false); kit.live(false); hubView(curExam); },
};
async function runExam(attemptId) {
  loading('Opening your test…');
  try {
    const [d] = await Promise.all([rpc('get_attempt', { p_attempt: attemptId }), loadExam()]);
    if (d.submitted) return resultView(attemptId);
    window.PhysicaSeriesExam.run(d, kit);
  } catch (e) { fatal(e, () => runExam(attemptId)); }
}

/* ---------- account: data rights (DPDP Act 2023) ---------- */
function accountView() {
  const msg = h('p', { role: 'status', class: 'ps-muted' });
  const email = sess && sess.user && sess.user.email;
  const note = (t, bad) => { msg.className = bad ? 'ps-err' : 'ps-ok'; msg.textContent = t; };
  const exportBtn = h('button', { type: 'button', onclick: async () => {
    exportBtn.disabled = true;
    try {
      const data = await rpc('export_my_data');
      const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
      const a = h('a', { href: url, download: 'physica-my-data.json' }); document.body.append(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10000);
      note('Your data was downloaded as physica-my-data.json.');
    } catch (e) { note(say(e), true); }
    exportBtn.disabled = false;
  } }, 'Download my data');
  const everywhere = h('button', { type: 'button', onclick: () => { signOut(true); view(); } }, 'Log out on all devices');
  const devCard = h('div', { class: 'ps-card' }, h('h3', null, 'Devices that signed in'), h('p', { class: 'ps-muted' }, 'Loading…'));
  rpc('list_devices', { p_device: deviceId() }).then(list => devCard.replaceChildren(h('h3', null, 'Devices that signed in'),
    h('p', { class: 'ps-muted' }, 'If you see a device you do not recognise, use “Log out on all devices” and sign in again.'),
    h('ul', null, (list || []).map(d => h('li', null, (d.current ? 'This device' : 'Another device') + ' · first seen ' + new Date(d.first_seen).toLocaleDateString() + ' · last used ' + new Date(d.last_seen).toLocaleString()))))).catch(() => devCard.remove());
  const confirmBox = h('input', { type: 'text', id: 'ps-del', autocomplete: 'off', placeholder: 'Type DELETE to confirm' });
  const delBtn = h('button', { type: 'button', class: 'ps-danger', onclick: async () => {
    if (confirmBox.value.trim() !== 'DELETE') return note('Type DELETE in the box first.', true);
    if (!confirm('Permanently delete your account, results and profile? This cannot be undone.')) return;
    delBtn.disabled = true;
    try { await rpc('delete_my_account'); save(null); view(); } catch (e) { note(say(e), true); delBtn.disabled = false; }
  } }, 'Delete my account');
  show(h('h1', null, 'Your account'),
    h('div', { class: 'ps-card' }, h('p', null, 'Signed in as ', h('b', null, email || '')),
      h('p', { class: 'ps-row' }, h('button', { type: 'button', class: 'ps-go', onclick: () => hubView(curExam) }, '← Tests'), everywhere)),
    devCard,
    h('div', { class: 'ps-card' }, h('h3', null, 'Your data'),
      h('p', { class: 'ps-muted' }, 'Get a copy of everything Physica holds about you (profile, tests, answers). Machine-readable JSON.'), h('p', null, exportBtn)),
    h('div', { class: 'ps-card' }, h('h3', null, 'Delete my account'),
      h('p', { class: 'ps-muted' }, 'Erases your profile, answers, results and parent contact. Only a minimal security log (an anonymous id and the action name) is kept as required for security records.'),
      h('label', { class: 'ps-lbl', for: 'ps-del' }, 'Confirmation'), confirmBox, h('p', null, delBtn)),
    h('p', { class: 'ps-sub' }, 'Questions or complaints: easy@physica.in · ', h('a', { href: 'privacy.html', target: '_blank', rel: 'noopener' }, 'Privacy Policy'), ' · ', h('a', { href: 'terms.html', target: '_blank', rel: 'noopener' }, 'Terms')), msg);
}

/* ---------- result: scorecard, subject and section analysis, answer review on demand ---------- */
async function resultView(attemptId) {
  loading('Loading your scorecard…');
  let r;
  try { r = await rpc('get_result', { p_attempt: attemptId }); } catch (e) { return fatal(e, () => resultView(attemptId)); }
  const clock = s => { const m = Math.round(s / 60); return m >= 60 ? `${Math.floor(m / 60)} h ${m % 60} m` : `${m} m`; };
  const bySub = new Map();
  r.sections.forEach((s, i) => { const k = s.s; const o = bySub.get(k) || { sc: 0, mx: 0, ok: 0, bad: 0, skip: 0, tm: 0 }; o.sc += s.sc; o.mx += s.mx; o.ok += s.ok; o.bad += s.bad; o.skip += s.skip; o.tm += s.tm; bySub.set(k, o); });
  const top = r.of > 1 ? Math.max(1, Math.ceil(r.rank / r.of * 100)) : null;
  const subjectCards = [...bySub].map(([k, o]) => h('div', { class: 'ps-card ps-sub-card' },
    h('div', { class: 'ps-ct' }, h('b', null, SUBJ[k] || k), h('span', { class: 'ps-big' }, `${o.sc}/${o.mx}`)),
    h('div', { class: 'ps-bar2', role: 'img', 'aria-label': `${SUBJ[k] || k}: ${o.sc} of ${o.mx} marks` }, h('i', { style: `width:${Math.max(0, Math.min(100, o.sc / o.mx * 100))}%` })),
    h('div', { class: 'ps-muted' }, `✓ ${o.ok} right · ✗ ${o.bad} wrong · ${o.skip} skipped · ${clock(o.tm)}`)));
  const reviewBox = h('div', { class: 'ps-card' }, h('h2', null, 'Review your answers'), h('p', { class: 'ps-muted' }, 'Open a section to see the key, your answer and the solution for each question.'));
  r.sections.forEach((s, i) => {
    const body = h('div', { class: 'ps-rev' }); let loaded = false;
    const det = h('details', { class: 'ps-sec', ontoggle: async () => {
      if (!det.open || loaded) return; loaded = true; body.textContent = 'Loading…';
      try { const items = await rpc('get_review', { p_attempt: attemptId, p_section: i }); body.replaceChildren(...items.map(it => reviewItem(it, s))); }
      catch (e) { loaded = false; body.replaceChildren(h('p', { class: 'ps-err', role: 'alert' }, say(e))); }
    } }, h('summary', null, `${secLabel(s)} · ${s.sc}/${s.mx}`), body);
    reviewBox.append(det);
  });
  show(h('button', { type: 'button', class: 'ps-link', onclick: () => hubView(curExam) }, '← All tests'),
    h('h1', null, `${r.l} · Test ${r.n}${r.p > 1 ? ' · Paper ' + r.p : ''}`),
    h('div', { class: 'ps-card ps-score' }, h('div', { class: 'ps-big2' }, `${r.score}`, h('small', null, ` / ${r.total}`)),
      h('p', null, r.of > 1 ? `Rank ${r.rank} of ${r.of} who have taken this test${top ? ` · top ${top}%` : ''}` : 'You are the first to finish this test.'),
      h('p', { class: 'ps-muted' }, `Time used: ${clock(r.used * 60)} of ${dur(r.min)}`)),
    h('p', { class: 'ps-card ps-quote' }, r.score >= r.total * 0.6 ? 'Strong attempt. Read the review below, fix the few slips, and push the next one higher.' : 'Every score is data, not a verdict. Open the review, find the two or three topics that cost you most marks, and fix those first.'),
    h('div', { class: 'ps-grid' }, subjectCards), reviewBox);
}
function reviewItem(it, sec) {
  const q = it.q || {}, correct = it.k === '*' ? 'bonus' : it.k, mine = it.y == null ? '' : it.y, pt = it.pt;
  const state = it.y == null ? 'skipped' : pt > 0 ? 'right' : 'wrong';
  const tag = it.k === '*' ? 'bonus' : state;
  const body = h('div', { class: 'ps-rb' });
  const det = h('details', { class: 'ps-q2 ' + state, ontoggle: () => {
    if (!det.open || body.firstChild) return;
    body.append(rt('div', q.b, 'ps-q'));
    if (q.f) body.append(h('img', { class: 'ps-fig', src: `${BASE}/storage/v1/object/public/q/${q.f}.webp`, alt: q.a || '', loading: 'lazy', decoding: 'async' }));
    if (q.o) q.o.forEach((o, j) => { const L = 'ABCDEF'[j], isK = correct !== 'bonus' && correct.includes(L), isY = mine.includes(L);
      body.append(h('div', { class: 'ps-opt' + (isK ? ' right' : isY ? ' wrong' : '') }, h('b', null, L + '. '), rt('span', o), isK ? h('b', { class: 'ps-ok' }, ' ✓ correct') : null, isY && !isK ? h('b', { class: 'ps-err' }, ' ✗ yours') : (isY ? h('b', { class: 'ps-muted' }, ' (yours)') : null))); });
    else body.append(h('p', null, 'Your answer: ', h('b', null, mine || '—'), ' · Correct: ', h('b', { class: 'ps-ok' }, correct === 'bonus' ? 'bonus (full marks to all)' : correct.replace(':', ' to '))));
    if (it.e) body.append(h('p', { class: 'ps-sub' }, h('b', null, 'Solution: '), rich(h('span'), it.e)));
  } }, h('summary', null, `Q${it.i} · ${tag === 'right' ? '✓' : tag === 'wrong' ? '✗' : tag === 'bonus' ? '★' : '–'} ${pt > 0 ? '+' + pt : pt} · ${Math.round((it.t || 0) / 6) / 10} min`), body);
  return det;
}

window.PhysicaSeries = { open, close };
})();
