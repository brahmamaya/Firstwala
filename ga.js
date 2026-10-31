/* Two separate things live here:
   (1) No first-party tracking of our own: Physica has no server, so nothing is stored about visitors by us.
   (2) Google Analytics, in three modes chosen by the visitor (localStorage "physica-analytics"):
       - unset (default) = STANDARD: Google Analytics with its normal first-party cookie (expires after 90 days) so that
         visits, new users and daily users can be counted. Google signals and ad personalisation are off, nothing typed,
         no answers or scores, nothing while the Test Series is open, nothing if the browser sends Do Not Track / Global
         Privacy Control.
       - "2" = NO COOKIES: page views only, no cookie, a fresh random ID on every page load.
       - "0" = OFF.
   Google still receives the normal web request (IP address, browser). Kept out of the HTML so the Content Security
   Policy can forbid inline scripts. */
(() => {
'use strict';
const ID = 'G-Z1BGVQBEJ6', KEY = 'physica-analytics';
window['ga-disable-' + ID] = true;                       // default: off until a mode starts
const get = () => { try { return localStorage.getItem(KEY); } catch { return null; } };
const set = v => { try { localStorage.setItem(KEY, v); } catch {} };
const dnt = navigator.doNotTrack === '1' || navigator.globalPrivacyControl;
const local = /^(localhost|127\.|\[::1\])/.test(location.hostname);

function startGA(cookieless) {
  window['ga-disable-' + ID] = false;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag('consent', 'default', { analytics_storage: cookieless ? 'denied' : 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
  window.gtag('js', new Date());
  const rnd = () => Math.floor(Math.random() * 2147483647);
  const cfg = { send_page_view: false, allow_google_signals: false, allow_ad_personalization_signals: false, anonymize_ip: true };
  if (cookieless) cfg.client_id = rnd() + '.' + rnd(); else { cfg.cookie_expires = 7776000; cfg.cookie_flags = 'SameSite=Lax;Secure'; }
  window.gtag('config', ID, cfg);
  let last = '';
  const view = () => {
    if (document.querySelector('.ps-ov:not([hidden])')) return;   // never while the Test Series is open
    const id = decodeURIComponent(location.hash.slice(1)), path = id ? '/sim/' + id : '/';
    if (path === last) return; last = path;
    window.gtag('event', 'page_view', { page_location: location.origin + path, page_path: path, page_title: id || 'Landing' });
  };
  const s = document.createElement('script');
  s.async = true; s.src = 'https://www.googletagmanager.com/gtag/js?id=' + ID;
  document.head.append(s);
  view();
  addEventListener('hashchange', view);
}
const el = (t, a, ...k) => { const e = document.createElement(t); for (const x in a || {}) x === 'class' ? e.className = a[x] : x.startsWith('on') ? e.addEventListener(x.slice(2), a[x]) : e.setAttribute(x, a[x]); e.append(...k); return e; };

// Privacy page: a switch to see / change the choice (does not start analytics on that page).
const slot = document.getElementById('analytics-choice');
if (slot) {
  const paint = () => {
    const v = get(), mode = v === '0' ? 'OFF' : v === '2' ? 'NO COOKIES' : 'STANDARD (cookie, 90 days)';
    slot.replaceChildren(el('p', null, 'Visit statistics are currently ', el('b', null, mode), ' in this browser. '),
      el('button', { type: 'button', onclick: () => { set('0'); paint(); } }, 'Turn off'), ' ',
      el('button', { type: 'button', onclick: () => { set('2'); paint(); } }, 'No cookies'), ' ',
      el('button', { type: 'button', onclick: () => { try { localStorage.removeItem(KEY); } catch {} paint(); } }, 'Standard'));
  };
  paint();
} else if (!dnt && !local && !navigator.webdriver) {
  const v = get();
  if (v === '2') startGA(true);
  else if (v !== '0') startGA(false);
}
})();
