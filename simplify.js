/* Simpler simulation page. Runs after every other module and RE-ARRANGES the existing elements (they keep their ids,
   listeners and test ids, so the simulation engines, saved values, share links and exports are untouched):
   - one "Browse simulations" drawer (subject, class, search, chapter, simulation) instead of the permanent sidebar and tab rows
   - one action bar: Play/Pause, Reset, Record + quality, Fullscreen, and compact View and More menus
   - Advanced controls (speed, step, restore defaults, randomise, scientific sound) under the variables
   - one collapsed "Understand this" section (explanation, formula, assumptions, what to notice, suggested experiment)
   Decorative extras are removed from this page: live label, WhatsApp, duplicate feedback entries, panel hide buttons, UI sounds. */
(() => {
'use strict';
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };
const lab = $('#lab-layout'), side = $('#sidebar'), main = $('#main');
if (!lab || !side || !main || document.body.dataset.simplified) return;
document.body.dataset.simplified = '1';
document.body.classList.add('simple');
const SOUND_SIMS = new Set(['beats', 'driven-resonance', 'pendulum']);   // experiments whose sound is part of the physics (frequencies, resonance, period)
const closers = [];          // menus that close on outside click / Escape
const simId = () => decodeURIComponent(location.hash.slice(1)) || (window.PhysicaApp?.state?.().current?.id || '');
const simNow = () => window.PhysicaApp?.state?.().current;

/* ---------- small helper: a button that opens a panel (used by View and More) ---------- */
function menu(label, id, testid) {
  const wrap = el('div', 'pop-wrap'), b = el('button', 'bar-btn', label), pop = el('div', 'pop'); b.type = 'button'; b.id = id + '-btn'; b.dataset.testid = testid;
  b.setAttribute('aria-haspopup', 'true'); b.setAttribute('aria-expanded', 'false'); b.setAttribute('aria-controls', id + '-panel'); pop.id = id + '-panel'; pop.hidden = true;
  const set = on => { pop.hidden = !on; b.setAttribute('aria-expanded', String(on)); wrap.classList.toggle('open', on); };
  b.addEventListener('click', e => { e.stopPropagation(); const on = pop.hidden; closers.forEach(c => c()); set(on); if (on) pop.querySelector('button:not([hidden]),select,input,a')?.focus?.({ preventScroll: true }); });
  closers.push(() => set(false)); const done = el('button', 'pop-done', 'Done'); done.type = 'button'; done.addEventListener('click', e => { e.stopPropagation(); set(false); b.focus(); }); pop.append(done);
  wrap.append(b, pop); wrap._set = set; wrap._pop = pop; wrap._btn = b; return wrap;
}
document.addEventListener('click', e => { if (!e.target.closest('.pop-wrap')) closers.forEach(c => c()); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') { const open = $('.pop-wrap.open'); if (open) { closers.forEach(c => c()); open._btn.focus(); } } });
const item = (node, note) => { const r = el('div', 'pop-item'); r.append(node); if (note) r.append(el('small', '', note)); return r; };
const head = t => el('h3', 'pop-head', t);

/* ---------- 1. header: brand, Browse simulations, current position ---------- */
const bar = $('.topbar'), right = $('.topbar-right'), subj = $('.subject-tabs');
const browse = el('button', 'browse-btn'); browse.type = 'button'; browse.id = 'browse-btn'; browse.dataset.testid = 'browse-btn';
browse.setAttribute('aria-haspopup', 'dialog'); browse.setAttribute('aria-expanded', 'false'); browse.setAttribute('aria-controls', 'sidebar');
browse.append(el('span', 'browse-ic', '☰'), el('span', 'browse-tx', 'Browse simulations'));
const step = $('.tabs-nav-buttons'), count = $('#tab-count');
const nav = el('div', 'head-nav'); if (step) nav.append(step); if (count) nav.append(count);
bar.insertBefore(browse, $('.brand').nextSibling); browse.after(nav);
$('.wa-top')?.remove();                                   // WhatsApp stays on the landing page and the info pages
const feedbackOpen = $('.feedback-btn');                  // kept (detached) only so that "Report a problem" can open the existing form
feedbackOpen?.remove(); $$('.fb-entry').forEach(e => e.remove());
const tutor = $('.tutor-switch'), theme = $('.theme-picker');

/* ---------- 2. the drawer (reuses the working sidebar and its open/close handling) ---------- */
side.classList.add('drawer'); side.setAttribute('role', 'dialog'); side.setAttribute('aria-label', 'Browse simulations'); side.setAttribute('aria-modal', 'false');
const dh = el('div', 'drawer-head'); const dt = el('strong', '', 'Browse simulations'); const dx = el('button', 'drawer-x', '✕'); dx.type = 'button'; dx.setAttribute('aria-label', 'Close'); dx.dataset.testid = 'drawer-close';
const now = el('p', 'drawer-now'); now.id = 'drawer-now'; now.setAttribute('aria-live', 'polite'); dh.append(dt, dx);
const top = $('.sidebar-top'); if (subj) { subj.classList.remove('in-topbar'); top.insertBefore(subj, top.firstChild); }
$$('.sidebar-top .panel-close').forEach(e => e.remove()); $$('.sidebar-top .sidebar-heading').forEach(e => e.classList.add('is-hidden-ui'));
side.insertBefore(now, side.firstChild); side.insertBefore(dh, side.firstChild);
const backdrop = el('div', 'drawer-backdrop'); backdrop.id = 'drawer-backdrop'; document.body.append(backdrop, side);   // both directly under <body>: no ancestor can trap the drawer under the backdrop
const mt = $('#mobile-topics');                          // its handler toggles .open on the sidebar and focuses the search box
const isOpen = () => side.classList.contains('open');
const setOpen = on => { if (isOpen() !== on) mt?.click(); sync(); };
const sync = () => { const o = isOpen(); browse.setAttribute('aria-expanded', String(o)); document.body.classList.toggle('drawer-open', o); };
new MutationObserver(sync).observe(side, { attributes: true, attributeFilter: ['class'] });
browse.addEventListener('click', () => { setOpen(!isOpen()); if (isOpen()) $('#search')?.focus(); });
dx.addEventListener('click', () => { setOpen(false); browse.focus(); }); backdrop.addEventListener('click', () => setOpen(false));
document.addEventListener('keydown', e => { if (e.key === '/' && !e.defaultPrevented && !/INPUT|SELECT|TEXTAREA/.test(document.activeElement?.tagName || '') && !isOpen() && !$('#help-dialog')?.open) setOpen(true); }, true);
/* the selected chapter shows its simulations right under it (a vertical list, no long tab row) */
const tabs = $('#simulation-tabs'), chapters = $('#chapter-list');
function placeSims() { if (tabs && chapters && tabs.nextElementSibling !== chapters) chapters.before(tabs); }   // outside the chapter list: that list is rebuilt, which would delete the tabs
function refreshNow() { const s = simNow(); if (!s) return; now.textContent = `Now: Class ${s.grade} · ${(window.PhysicaSubjectName?.(s.subject)) || s.subject.charAt(0).toUpperCase() + s.subject.slice(1)} · ${s.chapter} · ${s.title}`; placeSims(); }
placeSims();
addEventListener('hashchange', () => setTimeout(refreshNow, 60));
/* choosing an experiment closes the drawer; choosing a chapter does not (the chapter's list is what you want next) */
side.addEventListener('click', e => { if (e.target.closest('#simulation-tabs button, .favourites button, .fav-item, .search-result, [data-sim]')) setTimeout(() => setOpen(false), 120); }, true);   // capture: the app re-renders (detaches) the clicked button
$('#search')?.addEventListener('keydown', e => { if (e.key === 'Enter') setTimeout(() => { if (!document.querySelector('#chapter-list .chapter-link[aria-current="page"]')) return; }, 0); });

/* ---------- 3. the title block: only the name and where we are ---------- */
const intro = $('.intro'), crumbs = $('.breadcrumbs'); if (crumbs && intro) $('.intro-text').append(crumbs);
$$('.panel-close, #rail-toggle').forEach(e => e.remove());

/* ---------- 4. the action bar ---------- */
const tr = $('.transport'), play = $('#play'), restart = $('#restart'), full = $('#fullscreen-btn'), snap = $('#snapshot-btn'), recg = $('.rec-group'), clock = $('.running-time');
restart.innerHTML = ''; restart.append(el('span', '', '↺'), document.createTextNode(' Reset')); restart.title = 'Reset: restart the motion from the beginning (key R). Your variable values stay.'; restart.setAttribute('aria-label', 'Reset: restart the motion from the beginning');
/* one Fullscreen/Focus experience: Focus mode (the simulation + its controls) and, where the browser allows, real fullscreen */
const focusBtn = $('#focus-btn'), focusExit = $('.focus-exit');
const fs2 = full.cloneNode(false); fs2.id = 'fullscreen-btn'; fs2.className = 'bar-btn'; fs2.dataset.testid = 'fullscreen-btn'; fs2.type = 'button'; fs2.title = 'Fullscreen with the controls (Esc to exit)'; fs2.setAttribute('aria-label', 'Fullscreen'); fs2.setAttribute('aria-pressed', 'false'); fs2.append(el('span', '', '⛶'), document.createTextNode(' Fullscreen'));
full.replaceWith(fs2);
const inFocus = () => document.body.classList.contains('focus');
const goFocus = async on => {
  if (on === inFocus()) return; if (on) focusBtn?.click(); else (focusExit && !focusExit.hidden ? focusExit : focusBtn)?.click();
  fs2.setAttribute('aria-pressed', String(on)); fs2.lastChild.textContent = on ? ' Exit' : ' Fullscreen';
  try { if (on && document.documentElement.requestFullscreen && !document.fullscreenElement) await document.documentElement.requestFullscreen({ navigationUI: 'hide' }); else if (!on && document.fullscreenElement) await document.exitFullscreen(); } catch {}
  window.dispatchEvent(new Event('resize'));
};
fs2.addEventListener('click', () => goFocus(!inFocus()));
document.addEventListener('fullscreenchange', () => { if (!document.fullscreenElement && inFocus()) goFocus(false); });
new MutationObserver(() => { const f = inFocus(); fs2.setAttribute('aria-pressed', String(f)); fs2.lastChild.textContent = f ? ' Exit' : ' Fullscreen'; }).observe(document.body, { attributes: true, attributeFilter: ['class'] });
focusBtn?.classList.add('is-hidden-ui');
[play, restart].forEach(b => b.classList.add('bar-btn'));
snap.classList.remove('restart-button', 'icon-tool'); $('.stage-brand')?.remove(); $('.transport-divider')?.remove();

/* View menu: scientific overlays and view modes (only what the experiment supports is visible) */
const view = menu('View', 'view', 'view-menu'), vp = view._pop; vp.setAttribute('aria-label', 'View options');
const v3 = $('#view3d-bar'), phys = $('#physics-toggle'), info = $('.info-btn');
vp.append(head('View'));
if (phys) { phys.textContent = phys.getAttribute('aria-pressed') === 'true' ? 'Hide forces, vectors and graphs' : 'Show forces, vectors and graphs'; vp.append(item(phys, 'Free-body diagram, vectors and live graph for this experiment')); new MutationObserver(() => { phys.textContent = phys.getAttribute('aria-pressed') === 'true' ? 'Hide forces, vectors and graphs' : 'Show forces, vectors and graphs'; }).observe(phys, { attributes: true, attributeFilter: ['aria-pressed'] }); }
if (v3) { v3.classList.add('in-pop'); vp.append(v3); }
if (info) { info.classList.remove('focus-btn'); vp.append(item(info, 'Text and values drawn inside the simulation')); }

/* More menu: the less used tools */
const more = menu('More', 'more', 'more-menu'), mp = more._pop; mp.setAttribute('aria-label', 'More tools');
const fav = $('#favourite-toggle'), share = $('#share-link'), help = $('#help-open');
mp.append(head('More'));
for (const [n, note] of [[fav, ''], [share, 'Copy a link with your exact values'], [snap, 'Save the picture as an image'], [help, 'Keyboard shortcuts and tips']]) if (n) mp.append(item(n, note));
const report = el('button', '', 'Report a problem'); report.type = 'button'; report.dataset.testid = 'report-problem'; report.addEventListener('click', () => { closers.forEach(c => c()); feedbackOpen?.click(); });
mp.append(item(report, 'About this experiment'));
if (tutor) mp.append(item(tutor, 'Spoken explanations and quiz'));
if (theme) { const t = el('div', 'pop-item theme-row'); t.append(el('span', '', 'Appearance'), theme); theme.querySelector('span')?.remove(); mp.append(t); }
const surprise = $('#surprise-button'), install = $('[data-testid=install-app]'); if (surprise) mp.append(item(surprise)); if (install) mp.append(item(install));
$$('.more-menu, .lab-tools, .tabs-nav, .workspace-header, .stage-top .live-label, #stage-hint').forEach(e => { if (!e.querySelector?.('#favourite-toggle')) e.classList.add('is-hidden-ui'); });
tr.append(view, more);
tr.prepend(play); tr.insertBefore(restart, play.nextSibling); if (recg) tr.insertBefore(recg, restart.nextSibling); tr.insertBefore(fs2, recg ? recg.nextSibling : restart.nextSibling);
tr.append(clock); tr.classList.add('action-bar'); $('.lab-tools')?.classList.add('is-hidden-ui');

/* ---------- 5. variables: names, values and units stay; secondary things go under Advanced controls ---------- */
const card = $('.controls-card'), ctl = $('#controls');
const ch = $('#controls-heading'); if (ch) { ch.className = 'sr-only'; card.insertBefore(ch, card.firstChild); }
$$('.section-heading', card).forEach(e => e.classList.add('is-hidden-ui'));
const adv = el('details', 'advanced'); adv.dataset.testid = 'advanced-controls'; adv.append(el('summary', '', 'Advanced controls'));
const ab = el('div', 'adv-body'), speed = $('.simulation-playback'); speed?.querySelector('p')?.remove(); if (speed) ab.append(speed);
const defs = $('#defaults'), rnd = $('#randomise-btn'), snd = $('#sound-toggle'), vol = $('#volume-wrap'), cap = $('#sound-caption');
if (defs) { defs.textContent = 'Restore default values'; defs.title = 'Put every variable back to its starting value'; defs.setAttribute('aria-label', 'Restore default values'); }
const row = el('div', 'adv-row'); [defs, rnd].forEach(b => { if (b) { b.classList.add('bar-btn'); row.append(b); } }); ab.append(row);
if (rnd) rnd.textContent = 'Try random values';
const sound = el('div', 'adv-sound'); sound.hidden = true; if (snd) { snd.classList.add('bar-btn'); sound.append(snd); } if (vol) sound.append(vol); if (cap) sound.append(cap); ab.append(sound);
adv.append(ab); ctl.after(adv);
const syncSound = () => { const id = simNow()?.id || simId(); sound.hidden = !SOUND_SIMS.has(id); if (cap) cap.hidden = sound.hidden || cap.hidden; };

/* ---------- 6. "Understand this": one collapsed section below the experiment ---------- */
const und = el('details', 'understand'); und.id = 'understand'; und.dataset.testid = 'understand';
const us = el('summary', '', 'Understand this'); und.append(us);
const ub = el('div', 'u-body'), sec = (t, ...nodes) => { const s = el('section', 'u-sec'); s.append(el('h3', '', t), ...nodes); ub.append(s); return s; };
const desc = $('#description'), form = $('#formula'), obs = $('#observation'), tryp = $('#try-this'), lesson = $('#lesson-section');
if (desc) sec('What is happening', desc);
if (form) { const f = el('p', 'u-formula'); f.append(form); sec('Key formula', f); }
if (lesson) { lesson.classList.remove('is-hidden-ui'); sec('Assumptions, worked example and presets', lesson); }
if (obs) sec('What to observe', obs);
if (tryp) sec('Try this experiment', tryp);
und.append(ub); lab.after(und);
$('.formula-card')?.classList.add('is-hidden-ui'); $('.below-stage')?.classList.add('is-hidden-ui');

/* ---------- 7. things that should not exist on this page any more ---------- */
$('#wonder-card')?.classList.add('is-wonder');
const clearOld = () => { try { const h = JSON.parse(localStorage.getItem('physica-hidden') || '[]'); if (h.length && !h.includes('tips')) localStorage.setItem('physica-hidden', '[]'); } catch {} };
clearOld(); $$('.hidden-strip, .restore-strip, .panel-restore').forEach(e => e.remove());
window.PhysicaReportContext = () => { const s = simNow(); return s ? `[Simulation: ${s.title} · Class ${s.grade} · ${s.chapter} · ${s.id}] ` : ''; };

addEventListener('hashchange', () => { syncSound(); closers.forEach(c => c()); });
setTimeout(() => { refreshNow(); syncSound(); sync(); window.dispatchEvent(new Event('resize')); }, 300);
setInterval(syncSound, 1500);
})();
