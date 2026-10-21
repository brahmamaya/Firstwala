/* Test Series entry points. The series pack (login, tests, results) is fetched only when a student opens it, and the exam screen
   only when a test starts, so the lab itself stays as light as before.
   - any element with  data-series-exam="NEET|JEE_MAIN|JEE_ADV"  opens that exam's tests (the pills inside Rank mode use this)
   - on the landing page a short notice (10 s) tells new visitors that the Test Series exists and exactly where to find it */
(() => {
'use strict';
const on = () => true;
let wait = null;
const load = () => window.PhysicaSeries ? Promise.resolve() : wait || (wait = new Promise((ok, no) => {
  const s = document.createElement('script');
  s.src = '__SERIES_URL__'; s.async = true; s.fetchPriority = 'high'; s.onload = ok;
  s.onerror = () => { wait = null; s.remove(); no(); };
  document.head.append(s);
}));
function tell(text) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = text; t.hidden = false;
  setTimeout(() => { t.hidden = true; }, 3500);
}
const open = exam => !on() ? tell('Test Series opens very soon for NEET 2027, JEE Main 2027 and JEE Advanced 2027. Stay tuned!') : load().then(() => window.PhysicaSeries.open({ exam }), () => tell('Could not load Test Series. Check your internet and try again.'));
window.PhysicaSeriesOpen = open;

// Warm up: start fetching the pack (and open the connection to the server) as soon as someone points at / touches the button.
const warm = e => {
  if (!on() || !(e.target.closest && e.target.closest('[data-series-exam]'))) return;
  load().catch(() => {});
};
for (const t of ['pointerover', 'focusin', 'touchstart']) document.addEventListener(t, warm, { passive: true });
document.addEventListener('click', e => {
  const b = e.target.closest && e.target.closest('[data-series-exam]');
  if (!b) return;
  e.preventDefault();
  open(b.dataset.seriesExam);
});

/* ---- landing-page notice: shown for 10 seconds, pauses while the pointer or keyboard is on it, can be closed ---- */
function landingNotice() {
  if (!on()) return;
  const land = document.getElementById('landing');
  try { if (!land || land.hidden || sessionStorage.getItem('physica-series-note') === '1') return; } catch { if (!land || land.hidden) return; }
  const css = document.createElement('style');
  css.textContent = '.sn{position:fixed;top:12px;left:50%;transform:translateX(-50%);width:min(560px,calc(100vw - 24px));z-index:300;background:#0b1928;color:#eff8ff;border:1px solid #42d9ca;border-radius:14px;padding:14px 16px 18px;box-shadow:0 10px 40px rgba(0,0,0,.5);font:15px/1.45 system-ui,sans-serif;overflow:hidden}' +
    ':root[data-theme="light"] .sn{background:#fff;color:#122033;border-color:#0b857c}.sn b{font-weight:800}.sn p{margin:6px 0}.sn ol{margin:6px 0 10px;padding-left:22px}.sn li{margin:2px 0}' +
    '.sn button{font:inherit;cursor:pointer;border-radius:10px;border:1px solid #42d9ca;background:#42d9ca;color:#06232a;padding:7px 14px;font-weight:700}.sn .sn-x{position:absolute;top:6px;right:8px;background:none;border:0;color:inherit;font-size:20px;padding:2px 8px;line-height:1}' +
    '.sn button:focus-visible{outline:2px solid #7baaff;outline-offset:2px}.sn-bar{position:absolute;left:0;bottom:0;height:4px;width:100%;background:#42d9ca;transform-origin:left;animation:sn-run 10s linear forwards}.sn.paused .sn-bar{animation-play-state:paused}' +
    '@keyframes sn-run{to{transform:scaleX(0)}}@media(prefers-reduced-motion:reduce){.sn-bar{animation:none;transform:none}}';
  const el = (t, c, x) => { const e = document.createElement(t); if (c) e.className = c; if (x) e.textContent = x; return e; };
  const box = el('div', 'sn'); box.setAttribute('role', 'status'); box.dataset.testid = 'series-note';
  const x = el('button', 'sn-x', '✕'); x.type = 'button'; x.setAttribute('aria-label', 'Close this notice');
  const go = el('button', '', 'Show me'); go.type = 'button';
  const ol = el('ol'); for (const t of ['Tap Rank mode', 'Choose your exam: NEET, JEE Mains or JEE Advanced', 'Tap the 📝 Test Series button at the top']) ol.append(el('li', '', t));
  const t1 = el('b', '', '📝 Full-length Test Series is live');
  box.append(x, t1, el('p', '', 'NEET 2027, JEE Main 2027 and JEE Advanced 2027: real exam pattern, 30 tests each. The first 3 tests of every exam are free.'), el('p', '', 'Where to find it:'), ol, go, el('div', 'sn-bar'));
  let left = 10000, started = Date.now(), timer = null;
  const done = remember => { clearTimeout(timer); mo.disconnect(); box.remove(); css.remove(); if (remember) try { sessionStorage.setItem('physica-series-note', '1'); } catch {} };
  const run = () => { started = Date.now(); timer = setTimeout(() => done(false), left); box.classList.remove('paused'); };
  const pause = () => { clearTimeout(timer); left -= Date.now() - started; box.classList.add('paused'); };
  box.addEventListener('mouseenter', pause); box.addEventListener('mouseleave', run); box.addEventListener('focusin', pause); box.addEventListener('focusout', run);
  x.addEventListener('click', () => done(true));
  go.addEventListener('click', () => { done(true); const r = document.querySelector('[data-testid=mode-rank]'); if (r) { r.click(); r.scrollIntoView?.({ block: 'center', behavior: 'smooth' }); } });
  const mo = new MutationObserver(() => { if (land.hidden || getComputedStyle(land).display === 'none') done(false); });
  mo.observe(land, { attributes: true, attributeFilter: ['hidden', 'class', 'style'] });
  document.head.append(css); document.body.append(box); run();
}
const start = () => setTimeout(landingNotice, 800);
document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', start, { once: true }) : start();
})();
