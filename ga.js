/* Two separate things live here:
   (1) No first-party tracking at all: Physica has no server of its own, so nothing is stored about visitors by us.
   (2) Google Analytics, in three modes chosen by the visitor (localStorage "physica-analytics"):
       - unset (default) = BASIC: only the page or simulation opened is counted. No cookie, a fresh random ID on every page
         load (so nobody is recognised from one visit to the next), Google signals and ad personalisation off, nothing typed,
         nothing while the Test Series is open, nothing if the browser sends Do Not Track / Global Privacy Control.
       - "1" = FULL (cookies as usual): only for visitors aged 18 or over who switch it on on the Privacy page.
       - "0" = OFF.
   Google still receives the normal web request (IP address, browser). Kept out of the HTML so the Content Security Policy
   can forbid inline scripts. */
(() => {
'use strict';
const ID = 'G-Z1BGVQBEJ6', KEY = 'physica-analytics';
window['ga-disable-' + ID] = true;                       // default: off
const get = () => { try { return localStorage.getItem(KEY); } catch { return null; } };
const set = v => { try { localStorage.setItem(KEY, v); } catch {} };

const gtagInit = () => { window.dataLayer = window.dataLayer || []; window.gtag = function () { window.dataLayer.push(arguments); }; };
const loadLib = () => { const s = document.createElement('script'); s.async = true; s.src = 'https://www.googletagmanager.com/gtag/js?id=' + ID; document.head.append(s); };
function start() {   // FULL (opt-in, 18+)
  window['ga-disable-' + ID] = false;
  gtagInit();
  window.gtag('js', new Date());
  window.gtag('config', ID, { allow_google_signals: false, allow_ad_personalization_signals: false });
  loadLib();
}
const dnt = navigator.doNotTrack === '1' || navigator.globalPrivacyControl;
const local = /^(localhost|127\.|\[::1\])/.test(location.hostname);
function startBasic() {   // BASIC (default): page counts without cookies or a lasting ID
  window['ga-disable-' + ID] = false;
  gtagInit();
  window.gtag('consent', 'default', { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
  window.gtag('js', new Date());
  const rnd = () => Math.floor(Math.random() * 2147483647);
  window.gtag('config', ID, { send_page_view: false, client_id: rnd() + '.' + rnd(), allow_google_signals: false, allow_ad_personalization_signals: false });
  let last = '';
  const view = () => {
    if (document.querySelector('.ps-ov:not([hidden])')) return;   // never while the Test Series is open
    const id = decodeURIComponent(location.hash.slice(1)), path = id ? '/sim/' + id : '/';
    if (path === last) return; last = path;
    window.gtag('event', 'page_view', { page_location: location.origin + path, page_path: path, page_title: id || 'Landing' });
  };
  loadLib();
  view();
  addEventListener('hashchange', view);
}
const el = (t, a, ...k) => { const e = document.createElement(t); for (const x in a || {}) x === 'class' ? e.className = a[x] : x.startsWith('on') ? e.addEventListener(x.slice(2), a[x]) : e.setAttribute(x, a[x]); e.append(...k); return e; };

// Privacy page: a switch to see / change the choice (does not start analytics on that page).
const slot = document.getElementById('analytics-choice');
if (slot) {
  const paint = () => {
    const v = get(), mode = v === '1' ? 'FULL (18+)' : v === '0' ? 'OFF' : 'BASIC (no cookies)';
    slot.replaceChildren(el('p', null, 'Visit statistics are currently ', el('b', null, mode), ' in this browser. '),
      el('button', { type: 'button', onclick: () => { set('0'); paint(); } }, 'Turn off'), ' ',
      el('button', { type: 'button', onclick: () => { try { localStorage.removeItem(KEY); } catch {} paint(); } }, 'Basic (no cookies)'), ' ',
      el('button', { type: 'button', onclick: () => { set('1'); paint(); } }, 'Full (only if you are 18 or older)'));
  };
  paint();
} else {
  const v = get();
  if (v === '1') start();
  else if (v === null && !dnt && !local && !navigator.webdriver) startBasic();
}
})();
