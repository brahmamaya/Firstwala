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
$('landing-go').addEventListener('physica-jump-go',e=>{const s=sims.find(x=>x.id===e.detail);if(!s)return;pick.subject=s.subject;pick.grade=s.grade;location.hash='#'+s.id;hide();window.scrollTo(0,0)});
$('landing-go').addEventListener('click',()=>{if(!(pick.subject&&pick.grade))return;try{localStorage.setItem(KEY,JSON.stringify(pick))}catch{}
  document.querySelector(`.subject-tab[data-subject="${pick.subject}"]`)?.click();document.querySelector(`.grade-tab[data-grade="${pick.grade}"]`)?.click();
  const first=sims.find(s=>s.subject==='physics'&&s.grade===pick.grade);if(first&&location.hash!=='#'+first.id)location.hash='#'+first.id;hide();window.scrollTo(0,0)});
// The class is switched inside the lab (Class 10 / 11 / 12 tabs); remember it for the next visit.
for(const t of document.querySelectorAll('.grade-tab'))t.addEventListener('click',()=>{const g=Number(t.dataset.grade);if(!g)return;pick.grade=g;try{localStorage.setItem(KEY,JSON.stringify({...pick,grade:g}))}catch{}});
// The logo brings the chooser back.
const brand=document.querySelector('.topbar .brand');if(brand){brand.setAttribute('role','button');brand.tabIndex=0;brand.title='Change class or mode';brand.style.cursor='pointer';brand.addEventListener('click',show);brand.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();show()}})}
const hash=decodeURIComponent(location.hash.slice(1));if(hash&&sims.some(s=>s.id===hash))L.hidden=true;else{document.documentElement.classList.remove('deep');show()}
})();
/* ONE-TOOL: "launching soon" panel opened from the landing icons */
(()=>{const b=document.getElementById('landing-one'),d=document.getElementById('one-tool-dlg');if(!b||!d||!d.showModal)return;
b.addEventListener('click',()=>{try{d.showModal()}catch{}});
d.querySelector('.one-close')?.addEventListener('click',()=>d.close());
d.addEventListener('click',e=>{if(e.target===d)d.close()})})();
/* Jump to simulation: a small dialog (subject -> chapter -> topic with search). Built lazily on first open from window.PhysicaSims; no extra download. */
(()=>{const L=document.getElementById('landing');if(!L||!document.createElement('dialog').showModal)return;
const SUBJ=[['physics','Physics'],['chemistry','Chemistry'],['botany','Botany'],['zoology','Zoology']],KEY='physica-start';
let dlg=null,body,backBtn,stepEl,opener=null,st={step:1,subject:'',chap:null,q:''};
const el=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
const plural=n=>`${n} simulation${n===1?'':'s'}`;
const simsOf=sub=>(window.PhysicaSims||[]).filter(s=>s.subject===sub);
function chaptersOf(sub){const m=new Map();let i=0;for(const s of simsOf(sub)){const k=s.grade+'|'+s.chapter;if(!m.has(k))m.set(k,{key:k,grade:s.grade,chapter:s.chapter,no:s.chapterNo||0,i:i++,sims:[]});m.get(k).sims.push(s)}
  return [...m.values()].sort((a,b)=>a.grade-b.grade||a.no-b.no||a.i-b.i)}
const hay=s=>`${s.title} ${s.chapter} ${s.description||''} ${s.formula||''} ${s.group||''}`.toLowerCase();
function go(s){const pick={subject:s.subject,grade:s.grade};dlg.close();opener=null;try{localStorage.setItem(KEY,JSON.stringify(pick))}catch{}
  document.querySelector(`.subject-tab[data-subject="${s.subject}"]`)?.click();document.querySelector(`.grade-tab[data-grade="${s.grade}"]`)?.click();
  document.getElementById('landing-go')?.dispatchEvent(new CustomEvent('physica-jump-go',{detail:s.id}))}
function build(){dlg=el('dialog','jump-dlg');dlg.setAttribute('aria-labelledby','jump-title');dlg.dataset.testid='jump-dialog';
  const top=el('div','jump-top');backBtn=el('button','jump-back','Back');backBtn.type='button';backBtn.dataset.testid='jump-back';
  const x=el('button','jump-x','Close');x.type='button';x.dataset.testid='jump-close';x.addEventListener('click',()=>dlg.close());
  backBtn.addEventListener('click',()=>{if(st.step===3){st.step=2;st.q=''}else{st.step=1;st.subject='';st.q=''}render()});
  stepEl=el('p','jump-step');top.append(backBtn,stepEl,x);body=el('div','jump-body');dlg.append(top,body);
  dlg.addEventListener('close',()=>{opener?.focus()});
  dlg.addEventListener('click',e=>{if(e.target===dlg)dlg.close()});
  document.body.append(dlg)}
function sec(title){const h=el('h2','jump-h',title);h.id='jump-title';h.tabIndex=-1;return h}
function simList(list,showChap){const ul=el('ul','jump-list');ul.dataset.testid='jump-sims';
  if(!list.length){ul.append(el('li','jump-empty','No simulation matches. Try another word.'));return ul}
  for(const s of list){const li=el('li'),b=el('button','jump-btn');b.type='button';b.dataset.testid='jump-sim-'+s.id;b.append(el('b','',s.title));
    if(showChap)b.append(el('small','',`Class ${s.grade} · ${s.chapter}`));b.addEventListener('click',()=>go(s));li.append(b);ul.append(li)}return ul}
function search(label,on){const w=el('div','jump-search'),l=el('label','',label),i=el('input');i.type='search';i.autocomplete='off';i.value=st.q;i.dataset.testid='jump-search';i.id='jump-q';l.htmlFor='jump-q';w.append(l,i);
  i.addEventListener('input',()=>{st.q=i.value;on()});return w}
function render(){body.replaceChildren();backBtn.hidden=st.step===1;stepEl.textContent=`Step ${st.step} of 3`;
  if(st.step===1){const h=sec('Choose subject');body.append(h);const ul=el('ul','jump-list');
    for(const [k,n] of SUBJ){const c=simsOf(k).length,li=el('li'),b=el('button','jump-btn');b.type='button';b.dataset.testid='jump-subject-'+k;b.append(el('b','',n),el('small','',plural(c)));b.disabled=!c;b.addEventListener('click',()=>{st.subject=k;st.step=2;st.q='';render()});li.append(b);ul.append(li)}
    body.append(ul);h.focus();return}
  const name=SUBJ.find(s=>s[0]===st.subject)[1],h=sec(st.step===2?'Choose chapter':'Choose topic');body.append(h);
  const all=simsOf(st.subject),res=el('div','jump-res');let paint;
  if(st.step===2){body.append(el('p','jump-sub',`${name}: ${plural(all.length)}. Type to search the whole subject.`),search('Search '+name,()=>paint()),res);
    paint=()=>{res.replaceChildren();const q=st.q.trim().toLowerCase();
      if(q){const list=all.filter(s=>hay(s).includes(q));res.append(el('p','jump-count',plural(list.length)),simList(list,true));return}
      let g=null;for(const c of chaptersOf(st.subject)){if(c.grade!==g){g=c.grade;res.append(el('h3','jump-grade','Class '+g))}
        const b=el('button','jump-btn');b.type='button';b.dataset.testid='jump-chap';b.append(el('b','',c.chapter),el('small','',plural(c.sims.length)));b.addEventListener('click',()=>{st.chap=c;st.step=3;st.q='';render()});res.append(b)}};
    paint();h.focus();return}
  const c=st.chap;body.append(el('p','jump-sub',`${name} · Class ${c.grade} · ${c.chapter}`),search('Search this chapter',()=>paint()),res);
  paint=()=>{res.replaceChildren();const q=st.q.trim().toLowerCase(),list=q?c.sims.filter(s=>hay(s).includes(q)):c.sims;res.append(el('p','jump-count',plural(list.length)),simList(list,false))};
  paint();h.focus()}
window.addEventListener('physica-jump',e=>{opener=e.detail?.back||null;if(!dlg)build();st={step:1,subject:'',chap:null,q:''};render();dlg.showModal()});
})();
