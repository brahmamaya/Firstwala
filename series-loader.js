/* Test Series entry points. The series pack (login, tests, results) is fetched only when a student opens it, and the exam screen
   only when a test starts, so the lab itself stays as light as before.
   - any element with  data-series-exam="NEET|JEE_MAIN|JEE_ADV"  opens that exam's tests (the pills inside Rank mode use this)
   - the landing page announces the Test Series in the 'For learners' card (landing.js) */
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

})();
