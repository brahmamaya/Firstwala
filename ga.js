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
// No pop-up on the landing page: visit statistics stay OFF unless someone (18 or older) turns them on from the switch on the Privacy page.
})();
