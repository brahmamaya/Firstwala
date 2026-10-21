/* Entry points for the Test Series (any element with data-series-open). The series pack - login, tests, exam, results -
   is fetched only when a student opens it, so the lab itself stays as light as before. */
(() => {
'use strict';
let wait = null;
const load = () => window.PhysicaSeries ? Promise.resolve() : wait || (wait = new Promise((ok, no) => {
  const s = document.createElement('script');
  s.src = '__SERIES_URL__'; s.async = true; s.onload = ok;
  s.onerror = () => { wait = null; s.remove(); no(); };
  document.head.append(s);
}));
function tell(text) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = text; t.hidden = false;
  setTimeout(() => { t.hidden = true; }, 3500);
}
document.addEventListener('click', e => {
  const b = e.target.closest && e.target.closest('[data-series-open]');
  if (!b) return;
  e.preventDefault();
  load().then(() => window.PhysicaSeries.open(), () => tell('Could not load Test Series. Check your internet and try again.'));
});
})();
