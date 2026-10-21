/* Two separate things live here:
   (1) No first-party tracking at all: Physica has no server of its own, so nothing is counted or stored about visitors.
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
