/* Physica Test Series: the exam screen (loaded only when a test starts; ~8 KB gzip).
   Looks and behaves like the real computer-based exam: subject tabs, numbered question palette with five statuses,
   Save & Next / Mark for Review & Next / Clear Response, on-screen keypad for numerical answers, submit summary, server timer.
   An answer counts only after Save & Next (or Mark for Review & Next), exactly as in the real exam; those clicks are sent
   to the server in small batches (not one request per click) and are retried if the connection drops.
   Everything the student can see comes from get_attempt; correct answers are never present here. */
(() => {
'use strict';
const CSS = `
.px{position:fixed;inset:0;display:grid;grid-template-columns:minmax(0,1fr) 340px;grid-template-rows:auto auto minmax(0,1fr) auto;background:var(--bg);color:var(--text);z-index:1}
.px-top{grid-column:1/-1;display:flex;align-items:center;gap:12px;padding:8px 14px;background:var(--chrome);border-bottom:1px solid var(--line)}
.px-brand{font-weight:800;letter-spacing:.04em;white-space:nowrap}.px-title{color:var(--muted);font-size:.9em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0}
.px-cand{display:flex;align-items:center;gap:8px;margin-left:auto}.px-av{width:30px;height:30px;border-radius:50%;background:var(--mint);color:var(--on-mint);display:grid;place-items:center;font-weight:800}
.px-time{font-variant-numeric:tabular-nums;font-weight:800;font-size:1.05em;padding:4px 10px;border:1px solid var(--line2);border-radius:8px;white-space:nowrap}.px-time.low{color:var(--ps-err);border-color:var(--ps-err)}
.px-tabs{grid-column:1/-1;display:flex;gap:6px;flex-wrap:wrap;padding:8px 14px 0;background:var(--panel);border-bottom:1px solid var(--line)}
.px-tab{border-radius:10px 10px 0 0!important;border-bottom:0!important;padding:8px 16px!important;font-weight:700}.px-tab[aria-selected=true]{background:var(--mint)!important;color:var(--on-mint)!important;border-color:var(--mint)!important}
.px-secs{display:flex;gap:6px;flex-wrap:wrap;margin-left:12px;align-self:center}.px-chip{padding:4px 12px!important;border-radius:99px!important;font-size:.9em}.px-chip[aria-pressed=true]{border-color:var(--mint)!important;box-shadow:0 0 0 1px var(--mint) inset}
.px-q{overflow:auto;padding:16px 20px;min-width:0;-webkit-overflow-scrolling:touch}
.px-qh{display:flex;flex-wrap:wrap;gap:8px 14px;align-items:baseline;border-bottom:1px solid var(--line);padding-bottom:8px;margin-bottom:10px}.px-qh h2{margin:0;font-size:1.1rem}.px-qh:focus{outline:none}
.px-meta{color:var(--muted);font-size:.9em}.px-mk{font-weight:700}.px-mk .p{color:var(--ps-ok)}.px-mk .n{color:var(--ps-err)}
.px-qt{font-size:1.08em}.px-o{cursor:pointer}.px-o:has(input:checked){border-color:var(--mint);background:var(--active)}.px-o input{margin-top:4px;flex:none}
.px-hint{min-height:1.4em;color:var(--ps-warn);font-size:.9em;margin-top:6px}
.px-num{display:grid;gap:10px;max-width:300px}.px-num input{font-size:1.3rem!important;text-align:right;font-variant-numeric:tabular-nums}
.px-kp{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}.px-kp button{padding:12px 0!important;font-size:1.1rem;font-weight:700}
.px-bar{grid-column:1;display:flex;flex-wrap:wrap;gap:8px;align-items:center;padding:10px 14px;background:var(--chrome);border-top:1px solid var(--line)}.px-bar .px-sp{flex:1;min-width:8px}
.px-save{min-width:130px}.px-status{font-size:.85em;color:var(--muted)}
.px-pal{grid-row:3/5;grid-column:2;display:flex;flex-direction:column;min-height:0;background:var(--panel);border-left:1px solid var(--line)}
.px-pal-in{overflow:auto;padding:12px;flex:1;min-height:0}.px-counts{display:grid;grid-template-columns:1fr 1fr;gap:6px 10px;margin-bottom:10px;font-size:.85em}.px-counts div{display:flex;gap:6px;align-items:center}
.px-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(42px,1fr));gap:6px}.px-psec h3{font-size:.85rem;margin:10px 0 6px;color:var(--muted)}
.px-pb{padding:4px!important;border-radius:8px!important;background:transparent!important;display:grid;place-items:center}.px-pb[aria-current=true]{outline:2px solid var(--mint);outline-offset:1px}
.px-pal-foot{padding:10px 12px;border-top:1px solid var(--line);display:grid;gap:8px}
.px-pt{display:none}.px-back{display:none}
.px-modal{position:fixed;inset:0;z-index:20;background:rgba(0,0,0,.55);display:grid;place-items:center;padding:16px}.px-md{background:var(--panel);border:1px solid var(--line2);border-radius:14px;padding:18px;max-width:720px;width:100%;max-height:90vh;overflow:auto}
.px-md table{width:100%;border-collapse:collapse;margin:10px 0}.px-md th,.px-md td{border:1px solid var(--line);padding:6px 8px;text-align:center}.px-md th:first-child,.px-md td:first-child{text-align:left}
@media(max-width:899px){
  .px{grid-template-columns:minmax(0,1fr)}.px-bar{grid-column:1}.px-q{padding:12px}.px-title,.px-cname{display:none}
  .px-pt{display:inline-block}.px-pal{position:fixed;top:0;bottom:0;right:0;width:min(340px,92vw);z-index:10;transform:translateX(105%);transition:transform .2s;box-shadow:-8px 0 30px rgba(0,0,0,.4)}
  .px.pal-open .px-pal{transform:none}.px-back{position:fixed;inset:0;z-index:9;background:rgba(0,0,0,.45)}.px.pal-open .px-back{display:block}
  .px-bar .px-sp{display:none}.px-bar button{flex:1 1 30%}.px-save{min-width:0}
}
@media(prefers-reduced-motion:reduce){.px-pal{transition:none}}
`;
const LETTERS = 'ABCDEF';
let styled = false, live = null;

function run(d, K) {
  if (live) live.stop();
  const { h, rt, rpc, say, SUPA } = K;
  if (!styled) { document.head.append(h('style', { id: 'px-style' }, CSS)); styled = true; }
  const attemptId = d.attempt_id, sections = d.pat.s, qs = d.qs;
  const secOf = [], secStart = []; let N = 0;
  sections.forEach((s, si) => { secStart.push(N); for (let i = 0; i < s.n; i++) secOf.push(si); N += s.n; });
  const subjects = []; sections.forEach((s, si) => { let x = subjects.find(y => y.s === s.s); if (!x) subjects.push(x = { s: s.s, secs: [], last: -1 }); x.secs.push(si); });
  const subOf = i => subjects.findIndex(x => x.secs.includes(secOf[i]));
  const ans = d.state.ans.slice(), tm = d.state.tm.slice();
  const fl = Uint8Array.from((d.state.fl.match(/../g) || []).map(x => parseInt(x, 16)));
  const dt = new Int32Array(N), sent = new Int32Array(N), pend = new Set();
  const deadline = Date.parse(d.deadline), skew = Date.parse(d.server_now) - Date.now();
  const label = `${d.pat.l} · Test ${d.n}${d.p > 1 ? ' · Paper ' + d.p : ''}`;
  let cur = -1, draft = null, enteredAt = Date.now(), inflight = false, retry = null, backoff = 3000, submitting = false, finished = false, tickT = null, flushT = null, autoT = null, modal = null, said = new Set();
  const answered = i => ans[i] != null && ans[i] !== '';
  const status = i => { const v = fl[i] & 1, m = fl[i] & 2, a = answered(i); return !v ? 0 : m && a ? 4 : m ? 3 : a ? 2 : 1; };
  const STN = ['Not visited', 'Not answered', 'Answered', 'Marked for review', 'Answered and marked for review'];

  /* ----- layout ----- */
  const timeEl = h('span', { class: 'px-time', role: 'timer', 'aria-label': 'Time left' });
  const sr = h('div', { class: 'ps-sr', 'aria-live': 'polite', role: 'status' });
  const statusEl = h('span', { class: 'px-status', role: 'status' });
  const hint = h('div', { class: 'px-hint', role: 'status' });
  const qHead = h('h2', { tabindex: '-1' }), qMeta = h('span', { class: 'px-meta' }), qMark = h('span', { class: 'px-mk' });
  const qBody = h('div'), qWrap = h('section', { class: 'px-q', 'aria-label': 'Question' }, h('div', { class: 'px-qh' }, qHead, qMeta, qMark), qBody, hint);
  const tabList = h('div', { role: 'tablist', 'aria-label': 'Subjects', style: 'display:flex;gap:6px;flex-wrap:wrap' });
  const secsEl = h('div', { class: 'px-secs', role: 'group', 'aria-label': 'Sections' });
  const tabs = h('div', { class: 'px-tabs' }, tabList, secsEl);
  const counts = h('div', { class: 'px-counts' });
  const palIn = h('div', { class: 'px-pal-in' }, counts);
  const palBtns = [], palSecs = [];
  const subBoxes = subjects.map(sub => { const box = h('div', { role: 'group', 'aria-label': (K.SUBJ[sub.s] || sub.s) + ' questions' });
    for (const si of sub.secs) { const grid = h('div', { class: 'px-grid' });
      for (let i = secStart[si]; i < secStart[si] + sections[si].n; i++) { const st = h('span', { class: 'ps-st s0', 'aria-hidden': 'true' }, String(i + 1)); const b = h('button', { type: 'button', class: 'px-pb', onclick: () => goto(i) }, st); b._st = st; palBtns[i] = b; grid.append(b); }
      box.append(h('div', { class: 'px-psec' }, sub.secs.length > 1 ? h('h3', null, sections[si].nm) : null, grid)); }
    palIn.append(box); return box; });
  const submitBtn = h('button', { type: 'button', class: 'ps-go', onclick: () => summary() }, 'Submit');
  const palToggle = h('button', { type: 'button', class: 'px-pt', 'aria-expanded': 'false', 'aria-controls': 'px-pal', onclick: () => togglePal() }, '☰ Palette');
  const pal = h('div', { class: 'px-pal', id: 'px-pal', role: 'region', 'aria-label': 'Question palette' }, palIn,
    h('div', { class: 'px-pal-foot' }, h('button', { type: 'button', onclick: () => info() }, 'Instructions'), submitBtn));
  const backdrop = h('div', { class: 'px-back', onclick: () => togglePal(false) });
  const bMark = h('button', { type: 'button', onclick: () => commit(true) }, 'Mark for Review & Next');
  const bClear = h('button', { type: 'button', onclick: () => clearResp() }, 'Clear Response');
  const bPrev = h('button', { type: 'button', onclick: () => cur > 0 && goto(cur - 1) }, '‹ Previous');
  const bSave = h('button', { type: 'button', class: 'ps-go px-save', onclick: () => commit(false) }, 'Save & Next');
  const root = h('div', { class: 'px', role: 'region', 'aria-label': label },
    h('header', { class: 'px-top' }, h('span', { class: 'px-brand' }, 'PHYSICA'), h('span', { class: 'px-title' }, label),
      h('span', { class: 'px-cand' }, h('span', { class: 'px-av', 'aria-hidden': 'true' }, (K.name()[0] || 'C').toUpperCase()), h('span', { class: 'px-cname' }, K.name())),
      timeEl, palToggle),
    tabs, qWrap,
    h('div', { class: 'px-bar' }, bMark, bClear, bPrev, h('span', { class: 'px-sp' }), statusEl, bSave), pal, backdrop, sr);
  // grid rows: top, tabs, question, bar  (palette spans rows 3-4)
  tabList.append(...subjects.map((sub, k) => h('button', { type: 'button', class: 'px-tab', role: 'tab', id: 'px-t' + k, 'aria-selected': 'false', onclick: () => goto(sub.last >= 0 ? sub.last : secStart[sub.secs[0]]) }, K.SUBJ[sub.s] || sub.s)));

  /* ----- status painting (only what changed) ----- */
  function paintQ(i) {
    const s = status(i), b = palBtns[i];
    b._st.className = 'ps-st s' + s;
    b.setAttribute('aria-label', `Question ${i + 1}, ${STN[s]}`);
    if (i === cur) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current');
  }
  function paintCounts() {
    const sub = subjects[subOf(cur)], c = [0, 0, 0, 0, 0];
    for (const si of sub.secs) for (let i = secStart[si]; i < secStart[si] + sections[si].n; i++) c[status(i)]++;
    counts.replaceChildren(...[2, 1, 0, 3, 4].map(k => h('div', null, h('span', { class: 'ps-st s' + k, 'aria-hidden': 'true' }, String(c[k])), h('span', null, STN[k]))));
  }
  function paintNav() {
    const sx = subOf(cur);
    tabList.querySelectorAll('.px-tab').forEach((t, k) => t.setAttribute('aria-selected', String(k === sx)));
    subBoxes.forEach((b, k) => { b.hidden = k !== sx; });
    const sub = subjects[sx];
    secsEl.replaceChildren(...(sub.secs.length > 1 ? sub.secs.map(si => h('button', { type: 'button', class: 'px-chip', 'aria-pressed': String(si === secOf[cur]), onclick: () => goto(secStart[si]) }, sections[si].nm)) : []));
    paintCounts();
  }

  /* ----- showing a question ----- */
  const norm = v => { if (v == null) return null; v = String(v).trim(); if (!v || v === '-' || v === '.' || v === '-.') return null; return v.replace(/\.$/, '').replace(/^(-?)\./, '$10.'); };
  function draw() {
    const i = cur, s = sections[secOf[i]], q = qs[i];
    qHead.textContent = `Question ${i + 1} of ${N}`;
    const sj = K.SUBJ[s.s] || s.s;
    qMeta.textContent = `${s.nm === sj ? sj : sj + ' · ' + s.nm} · ${K.KIND[s.t]}`;
    qMark.replaceChildren(...['Marks: ', h('span', { class: 'p' }, '+' + s.c), ' / ', h('span', { class: 'n' }, K.minus(s.w)), s.t === 'MULTI' && s.p ? h('span', { class: 'px-meta' }, ` (+${s.p} per right option if partly right)`) : ''].filter(x => x !== ''));
    const parts = [rt('div', q.b, 'ps-q px-qt')];
    if (q.f) parts.push(h('img', { class: 'ps-fig', src: `${SUPA}/storage/v1/object/public/q/${q.f}.webp`, alt: q.a || '', loading: 'lazy', decoding: 'async' }));
    if (s.t === 'MCQ' || s.t === 'MULTI') {
      const multi = s.t === 'MULTI', set = new Set((draft || '').split(''));
      const fs = h('fieldset', { style: 'border:0;padding:0;margin:0' }, h('legend', { class: 'ps-sr' }, multi ? 'Choose all options that are correct' : 'Choose one option'));
      q.o.forEach((o, j) => { const L = LETTERS[j];
        fs.append(h('label', { class: 'ps-opt px-o' }, h('input', { type: multi ? 'checkbox' : 'radio', name: 'px-a', value: L, checked: set.has(L), onchange: ev => {
          if (multi) { ev.target.checked ? set.add(L) : set.delete(L); draft = [...set].sort().join('') || null; } else draft = L; dirty(); } }), h('b', null, L + '.'), rt('span', o))); });
      parts.push(fs);
    } else {
      const inp = h('input', { type: 'text', inputmode: 'decimal', autocomplete: 'off', 'aria-label': 'Your numerical answer', maxlength: '12', value: draft || '', oninput: ev => { const v = ev.target.value.replace(/[^0-9.\-]/g, '').replace(/(?!^)-/g, '').replace(/(\..*)\./g, '$1'); if (v !== ev.target.value) ev.target.value = v; draft = v || null; dirty(); } });
      const press = k => { let v = inp.value; if (k === 'bs') v = v.slice(0, -1); else if (k === 'c') v = ''; else if (k === '-') v = v.startsWith('-') ? v.slice(1) : '-' + v; else if (k === '.' && v.includes('.')) return; else if (v.length < 12) v += k; inp.value = v; draft = v || null; dirty(); inp.focus(); };
      const keys = ['7', '8', '9', '4', '5', '6', '1', '2', '3', '0', '.', '-'].map(k => h('button', { type: 'button', 'aria-label': k === '-' ? 'minus sign' : k === '.' ? 'decimal point' : k, onclick: () => press(k) }, k === '-' ? '±' : k));
      parts.push(h('div', { class: 'px-num' }, inp, h('div', { class: 'px-kp' }, keys, h('button', { type: 'button', 'aria-label': 'backspace', onclick: () => press('bs') }, '⌫'), h('button', { type: 'button', style: 'grid-column:span 2', onclick: () => press('c') }, 'Clear'))));
    }
    qBody.replaceChildren(...parts); hint.textContent = ''; qWrap.scrollTop = 0;
  }
  const dirty = () => { hint.textContent = norm(draft) === (ans[cur] ?? null) ? '' : 'Not saved yet. Click Save & Next to record this answer.'; };

  function tick1() { const now = Date.now(), s = Math.round((now - enteredAt) / 1000); if (s > 0 && cur >= 0) { dt[cur] += s; enteredAt = now; pend.add(cur); } }
  function goto(i) {
    if (i < 0 || i >= N || submitting) return;
    const prev = cur; if (cur >= 0) tick1();
    const first = cur < 0 || i !== cur;
    cur = i; draft = ans[i] ?? null; enteredAt = Date.now();
    if (!(fl[i] & 1)) { fl[i] |= 1; pend.add(i); }
    subjects[subOf(i)].last = i;
    if (prev >= 0) paintQ(prev);
    paintQ(i); paintNav(); draw(); schedule(12000);       // just walking through questions: sent in the background, no hurry
    if (first) { try { qHead.focus({ preventScroll: true }); } catch {} }
    togglePal(false);
  }
  function commit(mark) {
    const i = cur, v = norm(draft); ans[i] = v; fl[i] = (fl[i] | 1) & ~2 | (mark ? 2 : 0);
    tick1(); pend.add(i); hint.textContent = ''; paintQ(i);
    if (i + 1 < N) goto(i + 1); else { paintNav(); draw(); }
    schedule(2500);
  }
  function clearResp() { ans[cur] = null; draft = null; fl[cur] = (fl[cur] | 1) & ~2; pend.add(cur); paintQ(cur); paintCounts(); draw(); schedule(2500); }

  /* ----- saving (batched, retried) ----- */
  function setStatus(t) { if (statusEl.textContent !== t) statusEl.textContent = t; }
  let dueAt = 0;
  function schedule(ms) {                                  // ms: how soon this change must reach the server (answers: 2.5 s, plain navigation: 12 s)
    if (pend.size >= 15 || ms === 0) { clearTimeout(flushT); dueAt = 0; return flush(); }
    const at = Date.now() + ms; if (flushT && dueAt && dueAt <= at) return; clearTimeout(flushT); dueAt = at; flushT = setTimeout(() => { dueAt = 0; flush(); }, ms);
  }
  async function flush(keepalive) {
    tick1();
    if (inflight || !pend.size || finished) return;
    inflight = true; clearTimeout(retry);
    const idx = [...pend], items = idx.map(i => { sent[i] = dt[i]; return [i + 1, ans[i], fl[i], dt[i]]; });
    setStatus('Saving…');
    try {
      for (let k = 0; k < items.length; k += 60) await rpc('save_state', { p_attempt: attemptId, p_items: items.slice(k, k + 60) }, !!keepalive);
      for (const i of idx) { dt[i] -= sent[i]; const it = items[idx.indexOf(i)]; if (it[1] === ans[i] && it[2] === fl[i] && dt[i] === 0) pend.delete(i); }
      backoff = 3000; setStatus(pend.size ? 'Saving…' : 'All answers saved');
      if (pend.size) schedule(2500);
    } catch (e) {
      if (e.code === 'attempt_closed') { inflight = false; return timeUp(); }
      if (e.code === 'account_locked' || e.code === 'lockdown' || e.code === 'signed_out' || e.status === 401) { setStatus(say(e)); }
      else { setStatus('No connection: your answers are kept and will be sent automatically'); retry = setTimeout(flush, backoff); backoff = Math.min(30000, backoff * 2); }
    } finally { inflight = false; }
  }
  const onHide = () => { if (document.hidden) flush(true); };

  /* ----- timer ----- */
  function clock() {
    const left = Math.max(0, Math.floor((deadline - (Date.now() + skew)) / 1000));
    const hh = Math.floor(left / 3600), mm = Math.floor(left % 3600 / 60), ss = left % 60;
    timeEl.textContent = 'Time Left: ' + String(hh).padStart(2, '0') + ':' + String(mm).padStart(2, '0') + ':' + String(ss).padStart(2, '0');
    timeEl.classList.toggle('low', left <= 600);
    for (const m of [600, 300, 60, 30]) if (left <= m && !said.has(m)) { said.add(m); if (left > 0 && left > m - 5) sr.textContent = m >= 60 ? `${m / 60} minute${m > 60 ? 's' : ''} left` : `${m} seconds left`; }
    if (left <= 0) timeUp();
  }
  function timeUp() { if (submitting || finished) return; openModal(h('div', null, h('h2', null, 'Time is up'), h('p', { role: 'alert' }, 'Your test is being submitted.'))); doSubmit(true); }

  /* ----- dialogs ----- */
  function closeModal() { if (modal) { const from = modal._from; modal.remove(); modal = null; try { from.focus(); } catch {} } }
  function openModal(content, closable) {
    const from = document.activeElement; if (modal) modal.remove();
    modal = h('div', { class: 'px-modal', role: 'dialog', 'aria-modal': 'true', onkeydown: e => {
      if (e.key === 'Escape' && closable) { e.stopPropagation(); closeModal(); }
      if (e.key === 'Tab') { const f = [...modal.querySelectorAll('button:not([disabled]),a[href],input')]; if (!f.length) return; const a = f[0], z = f[f.length - 1];
        if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); } } } }, h('div', { class: 'px-md' }, content));
    modal._from = from; root.append(modal);
    const f = modal.querySelector('button'); if (f) f.focus(); else modal.querySelector('.px-md').setAttribute('tabindex', '-1');
  }
  function summary() {
    tick1();
    const rows = sections.map((s, si) => { const c = [0, 0, 0, 0, 0]; for (let i = secStart[si]; i < secStart[si] + s.n; i++) c[status(i)]++;
      return h('tr', null, h('td', null, K.secLabel(s)), h('td', null, String(s.n)), h('td', null, String(c[2] + c[4])), h('td', null, String(c[1])), h('td', null, String(c[3])), h('td', null, String(c[4])), h('td', null, String(c[0]))); });
    const left = Math.max(0, Math.floor((deadline - (Date.now() + skew)) / 1000));
    openModal(h('div', null, h('h2', null, 'Submit test?'),
      h('p', { class: 'ps-muted' }, `Time left ${Math.floor(left / 60)} min. After you submit, no answer can be changed.`),
      h('div', { class: 'ps-scroll' }, h('table', null, h('thead', null, h('tr', null, ['Section', 'Questions', 'Answered', 'Not answered', 'Marked', 'Answered & marked', 'Not visited'].map(x => h('th', { scope: 'col' }, x)))), h('tbody', null, rows))),
      h('p', { class: 'ps-sub' }, 'Questions that are “Marked for review” without an answer are not counted. “Answered & marked” answers are counted.'),
      h('div', { class: 'ps-row' }, h('button', { type: 'button', class: 'ps-go', onclick: () => doSubmit(false) }, 'Yes, submit'), h('button', { type: 'button', onclick: () => closeModal() }, 'No, go back'))), true);
  }
  function info() {
    openModal(h('div', null, h('h2', null, 'Instructions'),
      h('ul', null, h('li', null, h('b', null, 'Save & Next'), ' records your answer. ', h('b', null, 'Mark for Review & Next'), ' records it and marks the question to revisit.'),
        h('li', null, h('b', null, 'Clear Response'), ' removes your answer. Choose a subject tab or a palette number to move around.'),
        h('li', null, 'Your answers are sent automatically; if the internet drops they are sent when it returns.'),
        h('li', null, 'The timer runs on our server and does not stop if you close the page.')),
      h('div', { class: 'ps-legend' }, [0, 1, 2, 3, 4].map(k => h('div', { class: 'ps-lg' }, h('span', { class: 'ps-st s' + k, 'aria-hidden': 'true' }, '7'), h('span', null, STN[k])))),
      h('p', null, h('button', { type: 'button', class: 'ps-go', onclick: () => closeModal() }, 'Close'))), true);
  }
  function togglePal(on) {
    const open = on === undefined ? !root.classList.contains('pal-open') : on;
    root.classList.toggle('pal-open', open); palToggle.setAttribute('aria-expanded', String(open));
    const mob = matchMedia('(max-width:899px)').matches; pal.inert = mob && !open;
  }

  async function doSubmit(auto) {
    if (submitting) return; submitting = true; clearTimeout(flushT); clearTimeout(retry);
    if (!auto && modal) { const b = modal.querySelector('.ps-go'); if (b) { b.disabled = true; b.textContent = 'Submitting…'; } }
    for (let n = 0; n < 6 && (pend.size || inflight); n++) { tick1(); await flush(); await K.sleep(700); }
    if (pend.size && !auto && !confirm('Some answers could not be sent (check your internet). Submit anyway? Unsent answers will be lost.')) { submitting = false; closeModal(); return; }
    try { await rpc('submit_attempt', { p_attempt: attemptId }); }
    catch (e) { if (e.code !== 'attempt_closed') { if (!auto) { submitting = false; closeModal(); alert(say(e)); return; } } }
    finished = true; stop(); K.done(attemptId);
  }

  /* ----- integrity signals + lifecycle ----- */
  const sig = kind => { if (!finished) rpc('log_event', { p_attempt: attemptId, p_kind: kind }).catch(() => {}); };
  const vis = () => { sig(document.hidden ? 'tab_hidden' : 'tab_visible'); onHide(); }, off = () => sig('offline'), on = () => { sig('online'); flush(); };
  let lastCopy = 0;
  const warn = ev => { if (pend.size) { ev.preventDefault(); ev.returnValue = ''; } };
  function stop() {
    clearInterval(tickT); clearInterval(autoT); clearTimeout(flushT); clearTimeout(retry);
    document.removeEventListener('visibilitychange', vis); window.removeEventListener('offline', off); window.removeEventListener('online', on); window.removeEventListener('beforeunload', warn); window.removeEventListener('pagehide', onHide);
    K.copy(null); live = null;
  }
  live = { stop };
  document.addEventListener('visibilitychange', vis); window.addEventListener('offline', off); window.addEventListener('online', on); window.addEventListener('beforeunload', warn); window.addEventListener('pagehide', onHide);
  K.copy(() => { if (Date.now() - lastCopy > 10000) { lastCopy = Date.now(); sig('copy_attempt'); } });
  K.leave(stop);

  K.full(true); K.live(true); K.mount(root);
  for (let i = 0; i < N; i++) paintQ(i);
  const nv = [...fl].findIndex(f => !(f & 1));         // resume near where the student stopped
  goto(nv <= 0 ? 0 : nv - 1);
  pal.inert = matchMedia('(max-width:899px)').matches;
  clock(); tickT = setInterval(clock, 1000); autoT = setInterval(() => { if (pend.size) flush(); }, 15000);
  setStatus(pend.size ? '' : 'Ready');
}

window.PhysicaSeriesExam = { run };
})();
