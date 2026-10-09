/* Landing page: "Welcome to Physica" - the visitor picks a mode (see tutor.js), then the lab opens on Physics at the first
   chapter of the last-used class (default Class 11: Units and Measurements); the class is switched inside the lab. Subjects are switched inside the lab.
   Shared links (#sim-id) open directly. */
(() => {
'use strict';
const $=id=>document.getElementById(id),L=$('landing');if(!L)return;
const sims=window.PhysicaSims||[],KEY='physica-start';if(!sims.length){L.hidden=true;return}
const count=(sub,g)=>sims.filter(s=>s.subject===sub&&(g==null||s.grade===g)).length;
let pick={subject:'physics',grade:11};try{const g=JSON.parse(localStorage.getItem(KEY)||'{}').grade;if(g===10||g===11||g===12)pick.grade=g}catch{}
const subs=[...L.querySelectorAll('.land-subject')],grades=[...L.querySelectorAll('.land-grade')];
for(const b of subs)b.querySelector('small').textContent=`${count(b.dataset.subject)} simulations`;
function paint(){for(const b of subs)b.setAttribute('aria-pressed',String(b.dataset.subject===pick.subject));
  for(const b of grades){const g=Number(b.dataset.grade),n=pick.subject?count(pick.subject,g):0;b.disabled=!pick.subject||!n;b.querySelector('small').textContent=pick.subject?`${n} simulations`:'choose a subject first';b.setAttribute('aria-pressed',String(g===pick.grade&&!b.disabled))}
  if(pick.grade&&pick.subject&&!count(pick.subject,pick.grade))pick.grade=null;$('landing-go').disabled=!(pick.subject&&pick.grade);step2?.classList.toggle('ready',!!pick.subject)}
for(const b of subs)b.addEventListener('click',()=>{pick.subject=b.dataset.subject;paint();if(!pick.grade)grades.find(g=>!g.disabled)?.focus()});
for(const b of grades)b.addEventListener('click',()=>{pick.grade=Number(b.dataset.grade);paint();$('landing-go').focus()});
const step2=L.querySelector('.landing-step2'),calm=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;let leaving=0;
function show(){clearTimeout(leaving);document.documentElement.classList.remove('deep');paint();L.classList.remove('leaving');L.hidden=false;document.body.classList.add('landing-open');document.body.classList.remove('app-reveal');window.scrollTo(0,0);window.PhysicaLandingBG?.start()}
function hide(){if(calm){L.hidden=true;document.body.classList.remove('landing-open');window.PhysicaLandingBG?.stop();return}
  window.PhysicaLandingBG?.dive();L.classList.add('leaving');leaving=setTimeout(()=>{L.hidden=true;L.classList.remove('leaving');document.body.classList.remove('landing-open');document.body.classList.add('app-reveal');window.PhysicaLandingBG?.stop()},1500)}
$('landing-go').addEventListener('click',()=>{if(!(pick.subject&&pick.grade))return;try{localStorage.setItem(KEY,JSON.stringify(pick))}catch{}
  document.querySelector(`.subject-tab[data-subject="${pick.subject}"]`)?.click();document.querySelector(`.grade-tab[data-grade="${pick.grade}"]`)?.click();
  const first=sims.find(s=>s.subject==='physics'&&s.grade===pick.grade);if(first&&location.hash!=='#'+first.id)location.hash='#'+first.id;hide();window.scrollTo(0,0)});
// The class is switched inside the lab (Class 10 / 11 / 12 tabs); remember it for the next visit.
for(const t of document.querySelectorAll('.grade-tab'))t.addEventListener('click',()=>{const g=Number(t.dataset.grade);if(!g)return;pick.grade=g;try{localStorage.setItem(KEY,JSON.stringify({...pick,grade:g}))}catch{}});
// The logo brings the chooser back.
const brand=document.querySelector('.topbar .brand');if(brand){brand.setAttribute('role','button');brand.tabIndex=0;brand.title='Change class or mode';brand.style.cursor='pointer';brand.addEventListener('click',show);brand.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();show()}})}
const hash=decodeURIComponent(location.hash.slice(1));if(hash&&sims.some(s=>s.id===hash))L.hidden=true;else{document.documentElement.classList.remove('deep');show()}
})();
