/* Physica Test Series: email-code login, test list, timed exam and results on top of Supabase.
   Loaded on demand (series-loader.js -> physica-series.min.js). No SDK: the site CSP allows only 'self' scripts, so this talks to
   Supabase's REST API directly. Only the PUBLIC publishable key lives here; everything secret (answers, timer, scoring, who may
   start a test) is enforced inside Postgres, see supabase/schema.sql. Never put a service_role / secret key in this repo. */
(() => {
'use strict';
const SUPA = 'https://lbyqvwkichjvrrzcddtq.supabase.co';
const KEY = 'sb_publishable_E3vG7C6UN13-1PoWwJNauA_uq7zvZxi';
const STORE = 'physica-series-auth';
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
let sess = null;
try { sess = JSON.parse(lsGet(STORE) || 'null'); } catch { sess = null; }
const save = s => { sess = s; lsSet(STORE, s ? JSON.stringify(s) : null); };
const now = () => Math.floor(Date.now() / 1000);

async function raw(path, { method = 'GET', body, token } = {}) {
  const headers = { apikey: KEY, 'Content-Type': 'application/json' };
  if (token) headers.Authorization = 'Bearer ' + token;
  let r;
  try { r = await fetch(SUPA + path, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) }); }
  catch { throw err('network'); }
  const txt = await r.text();
  let data = null;
  try { data = txt ? JSON.parse(txt) : null; } catch {}
  if (!r.ok) throw err((data && (data.error_code || data.message || data.msg)) || 'http_' + r.status, r.status);
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
const rpc = (fn, args) => api('/rest/v1/rpc/' + fn, { method: 'POST', body: args || {} });
const sendCode = email => raw('/auth/v1/otp', { method: 'POST', body: { email, create_user: true } });
const verifyCode = async (email, code) => adopt(await raw('/auth/v1/verify', { method: 'POST', body: { type: 'email', email, token: code } }));
const signOut = () => { const t = sess && sess.access_token; save(null); if (t) raw('/auth/v1/logout', { method: 'POST', token: t }).catch(() => {}); };

/* ---------- styles (theme variables come from styles.css) ---------- */
const CSS = `
.ps-ov{position:fixed;inset:0;z-index:100000;background:var(--bg);color:var(--text);overflow:auto;font-family:inherit;-webkit-overflow-scrolling:touch}
.ps-bar{position:sticky;top:0;z-index:2;display:flex;align-items:center;gap:12px;padding:10px 16px;background:var(--chrome);border-bottom:1px solid var(--line)}
.ps-bar b{letter-spacing:.04em}.ps-bar .ps-sp{flex:1}.ps-bar small{color:var(--muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:40vw}
.ps-main{max-width:920px;margin:0 auto;padding:20px 16px 60px}
.ps-ov h1,.ps-ov h2,.ps-ov h3{margin:.2em 0 .5em;line-height:1.25}
.ps-ov [hidden]{display:none!important}
.ps-lbl{display:block;margin:.6em 0 .35em;font-weight:600}
.ps-card{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:16px;margin:12px 0}
.ps-ov button{font:inherit;cursor:pointer;border-radius:10px;border:1px solid var(--line2);background:var(--panel2);color:var(--text);padding:9px 14px}
.ps-ov button:hover:not(:disabled){border-color:var(--mint)}.ps-ov button:disabled{opacity:.5;cursor:default}
.ps-ov button.ps-go{background:var(--mint);color:var(--on-mint);border-color:var(--mint);font-weight:700}
.ps-ov input[type=text],.ps-ov input[type=email],.ps-ov input[type=number],.ps-ov input[inputmode]{width:100%;padding:11px 12px;border-radius:10px;border:1px solid var(--line2);background:var(--bg2);color:var(--text);font:inherit}
.ps-ov :focus-visible{outline:2px solid var(--mint);outline-offset:2px}
.ps-muted{color:var(--muted)}.ps-err{color:var(--t-ff6b7a,#ff6b7a);min-height:1.4em}.ps-ok{color:var(--t-59e08f,#59e08f)}
.ps-row{display:flex;flex-wrap:wrap;gap:10px;align-items:center}.ps-row>.ps-sp{flex:1}
.ps-pill{display:inline-block;font-size:12px;padding:2px 9px;border-radius:99px;border:1px solid var(--line2);color:var(--muted)}
.ps-narrow{max-width:420px;margin:30px auto}
.ps-opt{display:flex;gap:10px;align-items:flex-start;padding:11px 12px;border:1px solid var(--line);border-radius:10px;margin:8px 0;cursor:pointer;background:var(--bg2)}
.ps-opt.sel{border-color:var(--mint);background:var(--active)}.ps-opt.right{border-color:var(--t-59e08f,#59e08f)}.ps-opt.wrong{border-color:var(--t-ff6b7a,#ff6b7a)}
.ps-opt input{margin-top:4px}
.ps-q{white-space:pre-wrap;font-size:1.05em;margin:.6em 0}
.ps-timer{font-variant-numeric:tabular-nums;font-weight:700;font-size:1.1em}.ps-timer.low{color:var(--t-ff6b7a,#ff6b7a)}
.ps-pal{display:flex;flex-wrap:wrap;gap:6px;margin:6px 0 14px}
.ps-pal button{width:40px;padding:7px 0;text-align:center;border-radius:8px}
.ps-pal button.done{background:var(--mint);color:var(--on-mint);border-color:var(--mint)}
.ps-pal button.rev{border-color:var(--gold);box-shadow:0 0 0 1px var(--gold) inset}
.ps-pal button.cur{outline:2px solid var(--blue);outline-offset:1px}
.ps-banner{padding:8px 12px;border-radius:10px;border:1px solid var(--t-ffb347,#ffb347);color:var(--t-ffb347,#ffb347);margin:8px 0}
.ps-sub{color:var(--muted);font-size:.9em;margin-top:6px}
.ps-ov sub,.ps-ov sup{font-size:.75em;line-height:0}
@media(max-width:560px){.ps-bar small{display:none}.ps-pal button{width:36px}}
`;

/* ---------- shell ---------- */
let ov = null, main = null, userEl = null, outBtn = null, busyTimer = null, onLeave = null;
let examLive = false;

function ensureShell() {
  if (ov) return;
  if (!document.getElementById('ps-style')) document.head.append(h('style', { id: 'ps-style' }, CSS));
  userEl = h('small', { 'aria-live': 'polite' });
  outBtn = h('button', { type: 'button', hidden: true, onclick: () => { if (leaveOk()) { signOut(); view(); } } }, 'Logout');
  main = h('main', { class: 'ps-main', tabindex: '-1' });
  ov = h('div', { class: 'ps-ov', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Physica Test Series', hidden: true },
    h('header', { class: 'ps-bar' },
      h('b', null, 'PHYSICA · TEST SERIES'), h('span', { class: 'ps-sp' }), userEl, outBtn,
      h('button', { type: 'button', 'aria-label': 'Close test series', onclick: close }, '✕')),
    main);
  // Keep the lab's global shortcuts (Space, R, X, F, arrows ...) from firing while typing answers.
  for (const t of ['keydown', 'keyup', 'keypress']) ov.addEventListener(t, e => e.stopPropagation());
  ov.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  document.body.append(ov);
}
function leaveOk() {
  return !examLive || confirm('Leave the exam screen? Your timer keeps running and your saved answers are kept. You can resume from the test list.');
}
function open() {
  ensureShell();
  ov.hidden = false;
  document.documentElement.style.overflow = 'hidden';
  view();
}
function close() {
  if (!ov || ov.hidden || !leaveOk()) return;
  if (onLeave) { onLeave(); onLeave = null; }
  examLive = false;
  ov.hidden = true;
  document.documentElement.style.overflow = '';
}
function show(...nodes) {
  if (onLeave) { onLeave(); onLeave = null; }
  examLive = false;
  main.replaceChildren(...nodes.flat());
  const email = sess && sess.user && sess.user.email;
  userEl.textContent = email || '';
  outBtn.hidden = !email;
  ov.scrollTop = 0;
}
const loading = what => show(h('p', { class: 'ps-muted', role: 'status' }, what || 'Loading…'));
function fatal(e, retry) {
  if (e && (e.code === 'signed_out' || e.status === 401)) { save(null); return view(); }
  show(h('div', { class: 'ps-card' }, h('p', { class: 'ps-err', role: 'alert' }, say(e)),
    h('button', { type: 'button', class: 'ps-go', onclick: retry || view }, 'Try again')));
}

/* ---------- views ---------- */
async function view() {
  if (!sess) return loginView();
  loading();
  try {
    const rows = await api('/rest/v1/profiles?select=display_name,is_minor,parent_consent_at&id=eq.' + encodeURIComponent(sess.user.id));
    const p = rows && rows[0];
    if (!p || p.is_minor == null || (p.is_minor && !p.parent_consent_at)) return profileView(p);
    listView();
  } catch (e) { fatal(e); }
}

function loginView() {
  let email = '', step = 'email', cooldown = 0, timer = null;
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
        } }, h('label', { class: 'ps-lbl', for: 'ps-email' }, 'Email'), input, h('p', null, go)), msg);
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
          try { await verifyCode(email, input.value.trim()); stop(); view(); } catch (e) { msg.textContent = say(e); set(false, 'Verify'); }
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
  const consent = h('input', { type: 'checkbox', id: 'ps-consent' });
  const consentRow = h('label', { class: 'ps-row', for: 'ps-consent', hidden: true }, consent,
    h('span', null, 'My parent or guardian has agreed to my using Physica Test Series and to Physica storing my name, email and test results.'));
  const radio = (val, label) => h('label', { class: 'ps-row' }, h('input', { type: 'radio', name: 'ps-age', value: String(val), checked: minor === val,
    onchange: () => { minor = val; consentRow.hidden = !val; } }), label);
  consentRow.hidden = minor !== true;
  const go = h('button', { class: 'ps-go', type: 'submit' }, 'Continue');
  show(h('div', { class: 'ps-card ps-narrow' }, h('h2', null, 'Almost there'),
    h('form', { onsubmit: async ev => {
      ev.preventDefault();
      if (minor == null) { msg.textContent = 'Please tell us if you are under 18.'; return; }
      go.disabled = true; msg.textContent = '';
      try { await rpc('save_profile', { p_name: name.value, p_is_minor: minor, p_parent_consent: consent.checked }); listView(); }
      catch (e) { msg.textContent = say(e); go.disabled = false; }
    } }, h('label', { class: 'ps-lbl', for: 'ps-name' }, 'Your name'), name,
      h('p', { class: 'ps-muted' }, 'Are you…'), radio(false, '18 or older'), radio(true, 'Under 18'), consentRow,
      h('p', { class: 'ps-sub' }, 'We store only your name, email and test results. See our ', h('a', { href: 'privacy.html', target: '_blank', rel: 'noopener' }, 'Privacy Policy'), '.'),
      h('p', null, go)), msg));
}

async function listView() {
  loading('Loading tests…');
  try {
    const [tests, attempts, enr] = await Promise.all([
      api('/rest/v1/tests?select=id,title,exam,duration_min,is_free,opens_at,closes_at&published=eq.true&order=created_at.desc'),
      api('/rest/v1/attempts?select=id,test_id,submitted_at,score,deadline'),
      api('/rest/v1/enrollments?select=test_id'),
    ]);
    const mine = new Map(attempts.map(a => [a.test_id, a]));
    const owned = new Set(enr.map(e => e.test_id));
    const msg = h('p', { class: 'ps-err', role: 'alert' });
    const cards = tests.map(t => {
      const a = mine.get(t.id), t0 = Date.now();
      const opens = t.opens_at && Date.parse(t.opens_at) > t0, closed = t.closes_at && Date.parse(t.closes_at) < t0;
      const locked = !t.is_free && !owned.has(t.id);
      let action;
      if (a && a.submitted_at) action = h('button', { type: 'button', class: 'ps-go', onclick: () => resultView(a.id) }, `View result (${a.score})`);
      else if (a) action = h('button', { type: 'button', class: 'ps-go', onclick: () => examView(a.id) }, 'Resume test');
      else if (locked) action = h('button', { type: 'button', disabled: true }, 'Locked (paid)');
      else if (opens) action = h('button', { type: 'button', disabled: true }, 'Opens ' + new Date(t.opens_at).toLocaleString());
      else if (closed) action = h('button', { type: 'button', disabled: true }, 'Closed');
      else action = h('button', { type: 'button', class: 'ps-go', onclick: async ev => {
        const b = ev.currentTarget; b.disabled = true; msg.textContent = '';
        if (!confirm(`Start "${t.title}"? The ${t.duration_min}-minute timer starts now and cannot be paused.`)) { b.disabled = false; return; }
        try { examView(await rpc('start_attempt', { p_test_id: t.id })); } catch (e) { msg.textContent = say(e); b.disabled = false; }
      } }, 'Start test');
      return h('div', { class: 'ps-card' },
        rt('h3', t.title),
        h('div', { class: 'ps-row ps-muted' }, h('span', { class: 'ps-pill' }, EXAMS[t.exam] || t.exam), h('span', null, t.duration_min + ' min'),
          h('span', { class: 'ps-pill' }, t.is_free ? 'Free' : 'Paid')),
        h('p', null, action));
    });
    show(h('h1', null, 'Tests'), cards.length ? cards : h('p', { class: 'ps-muted' }, 'No tests are published yet. Check back soon.'), msg);
  } catch (e) { fatal(e, listView); }
}

/* ---------- exam ---------- */
async function examView(attemptId) {
  loading('Opening your test…');
  let d;
  try { d = await rpc('get_attempt', { p_attempt: attemptId }); } catch (e) { return fatal(e, () => examView(attemptId)); }
  if (d.submitted) return resultView(attemptId);

  const qs = d.questions, answers = { ...d.answers };
  const deadline = Date.parse(d.deadline), skew = Date.parse(d.server_now) - Date.now();
  const marked = new Set();
  const pending = new Map();
  let i = 0, inflight = false, retry = null, debounce = null, finishing = false, tick = null;

  const timer = h('span', { class: 'ps-timer', role: 'timer', 'aria-label': 'Time left' });
  const banner = h('div', { class: 'ps-banner', role: 'alert', hidden: true }, 'Connection problem: your latest answers are not saved yet. Keep this page open; we will retry.');
  const pal = h('div', { class: 'ps-pal' });
  const card = h('div', { class: 'ps-card' });
  const msg = h('p', { class: 'ps-err', role: 'alert' });
  const has = q => answers[q.id] != null && answers[q.id] !== '';

  function drawPal() {
    pal.replaceChildren(...qs.map((q, k) => h('button', { type: 'button', 'aria-label': `Question ${k + 1}`,
      class: [has(q) ? 'done' : '', marked.has(q.id) ? 'rev' : '', k === i ? 'cur' : ''].join(' ').trim(), onclick: () => go(k) }, String(k + 1))));
  }
  function drawQ() {
    const q = qs[i];
    const body = [
      h('div', { class: 'ps-muted' }, `Q${i + 1} of ${qs.length} · ${q.subject} · +${q.marks}${q.negative ? ' / −' + q.negative : ''}`),
      rt('div', q.body, 'ps-q'),
    ];
    if (q.type === 'MCQ') {
      (q.options || []).forEach((o, k) => {
        const on = answers[q.id] === String(k);
        body.push(h('label', { class: 'ps-opt' + (on ? ' sel' : '') },
          h('input', { type: 'radio', name: 'ps-q-' + q.id, checked: on, onchange: () => { put(q.id, String(k)); drawQ(); drawPal(); } }),
          rt('span', o)));
      });
    } else {
      body.push(h('input', { type: 'number', step: 'any', inputmode: 'decimal', 'aria-label': 'Numerical answer', placeholder: 'Type your numerical answer',
        value: answers[q.id] ?? '', oninput: ev => { putSoon(q.id, ev.target.value === '' ? null : ev.target.value); } }));
    }
    body.push(h('p', { class: 'ps-row' },
      h('button', { type: 'button', disabled: i === 0, onclick: () => go(i - 1) }, '← Previous'),
      h('button', { type: 'button', onclick: () => { put(q.id, null); drawQ(); drawPal(); } }, 'Clear'),
      h('button', { type: 'button', 'aria-pressed': String(marked.has(q.id)), onclick: () => { marked.has(q.id) ? marked.delete(q.id) : marked.add(q.id); drawQ(); drawPal(); } },
        marked.has(q.id) ? '★ Marked' : '☆ Mark for review'),
      h('button', { type: 'button', class: 'ps-go', disabled: i === qs.length - 1, onclick: () => go(i + 1) }, 'Next →')));
    card.replaceChildren(...body);
  }
  const go = k => { flushDebounce(); i = k; drawQ(); drawPal(); };

  /* answers are saved to the server one by one; failures are retried, never lost */
  function put(qid, val) { answers[qid] = val; pending.set(qid, val); flush(); }
  function putSoon(qid, val) {
    answers[qid] = val; pending.set(qid, val); drawPal();
    clearTimeout(debounce); debounce = setTimeout(flush, 500);
  }
  function flushDebounce() { if (debounce) { clearTimeout(debounce); debounce = null; flush(); } }
  async function flush() {
    if (inflight) return;
    inflight = true; clearTimeout(retry);
    try {
      while (pending.size) {
        const [qid, val] = pending.entries().next().value;
        try { await rpc('save_answer', { p_attempt: attemptId, p_question: qid, p_answer: val }); if (pending.get(qid) === val) pending.delete(qid); banner.hidden = true; }
        catch (e) {
          if (e.code === 'attempt_closed') { pending.clear(); inflight = false; return finish(true); }
          if (e.code === 'signed_out' || e.status === 401) { banner.hidden = false; break; }
          banner.hidden = false; retry = setTimeout(flush, 3000); break;
        }
      }
    } finally { inflight = false; }
  }
  const online = () => flush();
  window.addEventListener('online', online);
  const warn = ev => { if (pending.size) { ev.preventDefault(); ev.returnValue = ''; } };
  window.addEventListener('beforeunload', warn);

  async function finish(auto) {
    if (finishing) return;
    finishing = true; clearInterval(tick); clearTimeout(debounce); msg.textContent = '';
    for (let n = 0; n < 5 && pending.size; n++) { await flush(); if (pending.size) await sleep(1000); }
    if (pending.size && !auto && !confirm('Some answers could not be saved (check your internet). Submit anyway?')) { finishing = false; tick = setInterval(draw, 1000); return; }
    try { await rpc('submit_attempt', { p_attempt: attemptId }); }
    catch (e) { if (e.code !== 'attempt_closed' && !auto) { msg.textContent = say(e); finishing = false; tick = setInterval(draw, 1000); return; } }
    resultView(attemptId);
  }
  function draw() {
    const left = Math.max(0, Math.floor((deadline - (Date.now() + skew)) / 1000));
    const hh = Math.floor(left / 3600), mm = Math.floor(left % 3600 / 60), ss = left % 60;
    timer.textContent = (hh ? hh + ':' : '') + String(mm).padStart(2, '0') + ':' + String(ss).padStart(2, '0');
    timer.classList.toggle('low', left <= 300);
    if (left <= 0) finish(true);
  }

  show(h('div', { class: 'ps-row' }, rt('h2', d.title), h('span', { class: 'ps-sp' }), timer), banner, card, pal,
    h('p', { class: 'ps-row' }, h('button', { type: 'button', class: 'ps-go', onclick: () => {
      const left = qs.filter(q => !has(q)).length;
      if (confirm(left ? `${left} question(s) are unanswered. Submit the test? You cannot change answers afterwards.` : 'Submit the test? You cannot change answers afterwards.')) finish(false);
    } }, 'Submit test')), msg);
  examLive = true;
  onLeave = () => { clearInterval(tick); clearTimeout(debounce); clearTimeout(retry); window.removeEventListener('online', online); window.removeEventListener('beforeunload', warn); };
  drawQ(); drawPal(); draw();
  tick = setInterval(draw, 1000);
}

/* ---------- result ---------- */
async function resultView(attemptId) {
  loading('Loading result…');
  let r;
  try { r = await rpc('get_result', { p_attempt: attemptId }); } catch (e) { return fatal(e, () => resultView(attemptId)); }
  const bySub = {};
  for (const q of r.questions) bySub[q.subject] = (bySub[q.subject] || 0) + q.points;
  const attempted = r.questions.filter(q => q.your_answer != null && q.your_answer !== '').length;
  const correct = r.questions.filter(q => q.points > 0).length;
  const items = r.questions.map(q => {
    const mine = q.your_answer;
    const kids = [h('div', { class: 'ps-muted' }, `Q${q.position} · ${q.subject} · ${q.points > 0 ? '+' : ''}${q.points} marks`), rt('div', q.body, 'ps-q')];
    if (q.type === 'MCQ') (q.options || []).forEach((o, k) => kids.push(h('div', { class: 'ps-opt' + (String(k) === q.correct_answer ? ' right' : String(k) === mine ? ' wrong' : '') },
      rt('span', o), String(k) === q.correct_answer ? h('b', { class: 'ps-ok' }, ' ✓ correct') : String(k) === mine ? h('b', { class: 'ps-err' }, ' ✗ your answer') : null)));
    else kids.push(h('p', null, 'Your answer: ', h('b', null, mine ?? '—'), ' · Correct: ', h('b', { class: 'ps-ok' }, q.correct_answer)));
    if (q.explanation) kids.push(h('p', { class: 'ps-sub' }, h('b', null, 'Solution: '), rich(h('span'), q.explanation)));
    return h('div', { class: 'ps-card' }, kids);
  });
  show(rt('h1', r.title),
    h('div', { class: 'ps-card' }, h('h2', null, `Score: ${r.score} / ${r.total}`),
      h('p', { class: 'ps-muted' }, `${attempted} attempted · ${correct} correct · `, Object.entries(bySub).map(([s, v]) => `${s}: ${v}`).join(' · '))),
    items, h('p', null, h('button', { type: 'button', class: 'ps-go', onclick: listView }, '← Back to tests')));
}

window.PhysicaSeries = { open, close };
})();
