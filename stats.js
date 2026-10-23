/* Anonymous visit counter (cookie-free). It only counts: a page view for the landing page, one for each simulation opened,
   and clicks on a short list of buttons (Rank mode, slides download, ONE-TOOL...). It sends no cookie, no ID, no IP of ours,
   nothing typed by the visitor, no answers and no scores, and nothing at all while a Test Series paper is open.
   Counting goes to GoatCounter as a plain image request. It is OFF until the site code is set below, and it is skipped
   when the browser sends Do Not Track or Global Privacy Control, on localhost and for automated browsers. */
(() => {
'use strict';
const CODE = '';   /* GoatCounter site code: https://<CODE>.goatcounter.com . Empty = nothing is sent. */
const nav = navigator;
if (!CODE || nav.doNotTrack === '1' || nav.globalPrivacyControl || nav.webdriver || /^(localhost|127\.|\[::1\])/.test(location.hostname)) return;
const ev = /^(sim-open|sim-jump|one-tool|whatsapp-channel|rec-btn|rec-auto|rec-manual|rank-[a-z]+|rk-select|rk-download|dl-go|dl-pdf|dl-ppt|mode-[a-z]+)$/;
let last = '';
function send(path, title, event) {
  if (document.querySelector('.ps-ov:not([hidden])')) return;   /* never while the Test Series is open */
  const key = path + (event ? '#e' : '') ; if (!event && key === last) return; if (!event) last = key;
  const s = screen, q = new URLSearchParams({ p: path, t: title || '', r: event ? '' : (document.referrer || ''), s: [s.width, s.height, Math.round(devicePixelRatio * 100) / 100].join(','), e: event ? 'true' : '', rnd: Math.random().toString(36).slice(2) });
  new Image().src = 'https://' + CODE + '.goatcounter.com/count?' + q;
}
function view() { const id = decodeURIComponent(location.hash.slice(1)); send(id ? '/sim/' + id : '/', id ? id : 'Landing', false); }
addEventListener('hashchange', view);
addEventListener('load', () => setTimeout(view, 600));
document.addEventListener('click', e => { const el = e.target.closest && e.target.closest('[data-testid]'); const id = el && el.dataset.testid; if (id && ev.test(id)) send('click/' + id, id, true); }, true);
})();
