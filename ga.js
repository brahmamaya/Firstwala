/* Two separate things live here:
   (1) Anonymous first-party counters (always on, no consent needed because nothing personal is collected): the page sends
       only "visit" / "view <simulation-slug>" and the server adds 1 to that day's total. No cookie, no id, no IP stored by
       us, no per-visitor row (see public.track in supabase/schema.sql). Skipped when the browser sends Do-Not-Track / Global Privacy Control.
   (2) Google Analytics, OFF by default.
   Google Analytics is OFF by default and only runs if a visitor aged 18 or over opts in.
   Physica is used by many students under 18, and the DPDP Act 2023 (s.9) forbids tracking children, so nothing is
   loaded or sent to Google until someone explicitly allows it. The choice is kept in this browser only
   (localStorage "physica-analytics": "1" = allowed, "0" = declined) and can be changed any time on the Privacy page.
   Kept out of the HTML so the Content Security Policy can forbid inline scripts. */
(() => {
'use strict';
const ID = 'G-Z1BGVQBEJ6', KEY = 'physica-analytics';
window['ga-disable-' + ID] = true;                       // default: off
const get = () => { try { return localStorage.getItem(KEY); } catch { return null; } };
const set = v => { try { localStorage.setItem(KEY, v); } catch {} };

function start() {
  window['ga-disable-' + ID] = false;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', ID, { allow_google_signals: false, allow_ad_personalization_signals: false });
  const s = document.createElement('script');
  s.async = true; s.src = 'https://www.googletagmanager.com/gtag/js?id=' + ID;
  document.head.append(s);
}
const el = (t, a, ...k) => { const e = document.createElement(t); for (const x in a || {}) x === 'class' ? e.className = a[x] : x.startsWith('on') ? e.addEventListener(x.slice(2), a[x]) : e.setAttribute(x, a[x]); e.append(...k); return e; };

const SUPA = 'https://lbyqvwkichjvrrzcddtq.supabase.co', PUB = 'sb_publishable_E3vG7C6UN13-1PoWwJNauA_uq7zvZxi';
const dnt = navigator.doNotTrack === '1' || window.doNotTrack === '1' || navigator.globalPrivacyControl === true;
function send(event, key) {
  try {
    fetch(SUPA + '/rest/v1/rpc/track', { method: 'POST', keepalive: true, credentials: 'omit', referrerPolicy: 'no-referrer',
      headers: { apikey: PUB, 'Content-Type': 'application/json' }, body: JSON.stringify({ p_event: event, p_key: key || '' }) }).catch(() => {});
  } catch {}
}
function countVisits() {
  if (dnt) return;
  let seen = false; try { seen = sessionStorage.getItem('physica-visit') === '1'; sessionStorage.setItem('physica-visit', '1'); } catch {}
  if (!seen) send('visit');                                  // once per browser tab session, not per person
  const done = new Set();
  const inLab = () => { const l = document.getElementById('landing'); return !l || l.hidden || getComputedStyle(l).display === 'none'; };
  const view = () => {
    const t = document.getElementById('title'); if (!t || !inLab()) return;
    const key = t.textContent.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 64);
    if (key && !done.has(key)) { done.add(key); send('view', key); }   // which simulation was opened (once per session each)
  };
  const t = document.getElementById('title');
  if (t) new MutationObserver(view).observe(t, { childList: true, characterData: true, subtree: true });
  const l = document.getElementById('landing');
  if (l) new MutationObserver(view).observe(l, { attributes: true, attributeFilter: ['hidden', 'class', 'style'] });
  view();
}

// Privacy page: a switch to see / change the choice (does not start analytics on that page).
const slot = document.getElementById('analytics-choice');
if (slot) {
  const paint = () => {
    const on = get() === '1';
    slot.replaceChildren(el('p', null, 'Visit statistics are currently ', el('b', null, on ? 'ON' : 'OFF'), ' in this browser. '),
      el('button', { type: 'button', onclick: () => { set(on ? '0' : '1'); paint(); } }, on ? 'Turn off' : 'Turn on (only if you are 18 or older)'));
  };
  paint();
} else {
  const run = () => countVisits();
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', run) : run();
  if (get() === '1') start();
}
if (!slot && get() === null && !/\/(privacy|terms|about|help)\.html$/.test(location.pathname)) {
  const css = document.createElement('style');
  css.textContent = '.ga-ask{position:fixed;left:12px;bottom:12px;right:12px;max-width:420px;z-index:99999;background:var(--panel,#101f30);color:var(--text,#eff8ff);border:1px solid var(--line2,#32495e);border-radius:14px;padding:14px;font:14px/1.45 system-ui,sans-serif;box-shadow:0 8px 30px #0006}.ga-ask p{margin:0 0 10px}.ga-ask button{font:inherit;cursor:pointer;border-radius:10px;border:1px solid var(--line2,#32495e);background:var(--panel2,#14263a);color:inherit;padding:8px 12px;margin-right:8px}.ga-ask a{color:var(--mint,#42d9ca)}';
  document.head.append(css);
  const done = v => { set(v); box.remove(); if (v === '1') start(); };
  const box = el('div', { class: 'ga-ask', role: 'dialog', 'aria-label': 'Visit statistics choice' },
    el('p', null, 'Allow anonymous visit statistics (Google Analytics)? It is off unless you say yes. Please choose Yes only if you are 18 or older. ',
      el('a', { href: 'privacy.html' }, 'Privacy Policy')),
    el('button', { type: 'button', onclick: () => done('0') }, 'No thanks'),
    el('button', { type: 'button', onclick: () => done('1') }, 'Yes, I am 18+ and allow'));
  (document.body ? Promise.resolve() : new Promise(r => document.addEventListener('DOMContentLoaded', r))).then(() => document.body.append(box));
}
})();
