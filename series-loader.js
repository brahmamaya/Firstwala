/* Entry points for the Test Series (any element with data-series-open). The series pack - login, tests, exam, results -
   is fetched only when a student opens it, so the lab itself stays as light as before. */
(() => {
'use strict';
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
// Warm up: start fetching the pack (and open the connection to the server) as soon as someone points at / touches the button.
const warm = e => {
  if (!(e.target.closest && e.target.closest('[data-series-open]'))) return;
  if (!document.querySelector('link[data-ps-pc]')) { const l = document.createElement('link'); l.rel = 'preconnect'; l.href = 'https://lbyqvwkichjvrrzcddtq.supabase.co'; l.dataset.psPc = '1'; document.head.append(l); }
  load().catch(() => {});
};
for (const t of ['pointerover', 'focusin', 'touchstart']) document.addEventListener(t, warm, { passive: true });
document.addEventListener('click', e => {
  const b = e.target.closest && e.target.closest('[data-series-open]');
  if (!b) return;
  e.preventDefault();
  load().then(() => window.PhysicaSeries.open(), () => tell('Could not load Test Series. Check your internet and try again.'));
});
})();
