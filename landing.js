/* Landing page: "Welcome to Physica" — the visitor picks a subject and a class first,
   then the library opens on that subject and class. Shared links (#sim-id) open directly. */
(() => {
'use strict';
const $=id=>document.getElementById(id),L=$('landing');if(!L)return;
const sims=window.PhysicaSims||[],KEY='physica-start';
const count=(sub,g)=>sims.filter(s=>s.subject===sub&&(g==null||s.grade===g)).length;
let pick={subject:null,grade:null};try{Object.assign(pick,JSON.parse(localStorage.getItem(KEY)||'{}'))}catch{}
const subs=[...L.querySelectorAll('.land-subject')],grades=[...L.querySelectorAll('.land-grade')];
for(const b of subs)b.querySelector('small').textContent=`${count(b.dataset.subject)} simulations`;
function paint(){for(const b of subs)b.setAttribute('aria-pressed',String(b.dataset.subject===pick.subject));
  for(const b of grades){const g=Number(b.dataset.grade),n=pick.subject?count(pick.subject,g):0;b.disabled=!pick.subject||!n;b.querySelector('small').textContent=pick.subject?`${n} simulations`:'choose a subject first';b.setAttribute('aria-pressed',String(g===pick.grade&&!b.disabled))}
  if(pick.grade&&pick.subject&&!count(pick.subject,pick.grade))pick.grade=null;$('landing-go').disabled=!(pick.subject&&pick.grade)}
for(const b of subs)b.addEventListener('click',()=>{pick.subject=b.dataset.subject;paint();if(!pick.grade)grades.find(g=>!g.disabled)?.focus()});
for(const b of grades)b.addEventListener('click',()=>{pick.grade=Number(b.dataset.grade);paint();$('landing-go').focus()});
function show(){paint();L.hidden=false;document.body.classList.add('landing-open');window.scrollTo(0,0)}
function hide(){L.hidden=true;document.body.classList.remove('landing-open')}
$('landing-go').addEventListener('click',()=>{if(!(pick.subject&&pick.grade))return;try{localStorage.setItem(KEY,JSON.stringify(pick))}catch{}
  document.querySelector(`.subject-tab[data-subject="${pick.subject}"]`)?.click();document.querySelector(`.grade-tab[data-grade="${pick.grade}"]`)?.click();hide();window.scrollTo(0,0)});
// The logo brings the chooser back.
const brand=document.querySelector('.topbar .brand');if(brand){brand.setAttribute('role','button');brand.tabIndex=0;brand.title='Change subject or class';brand.style.cursor='pointer';brand.addEventListener('click',show);brand.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();show()}})}
const hash=decodeURIComponent(location.hash.slice(1));if(!(hash&&sims.some(s=>s.id===hash)))show();
})();
