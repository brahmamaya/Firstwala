/* Focus on the simulation: less important panels take less room and each has a ✕ to hide it.
   Hidden panels come back from the small "Show" chips; "Focus" hides everything except the
   stage and its controls (Esc or the Exit button brings the page back). Choices are remembered. */
(() => {
'use strict';
const KEY='physica-hidden',$=s=>document.querySelector(s),body=document.body;
const PANELS=[
  {key:'library',sel:'#sidebar',label:'☰ Library',where:'.sidebar-top',desk:true},
  {key:'about',sel:'.intro',label:'ⓘ About',where:'.intro'},
  {key:'tools',sel:'.lab-tools',label:'⚙ Tools',where:'.lab-tools'},
  {key:'observe',sel:'.observe-card',label:'👁 What to notice',where:'.observe-card'},
  {key:'tips',sel:'.controls-tip',label:'💡 Tips',where:'.controls-tip'}];
// mark the long controls hint so it can be hidden
for(const p of document.querySelectorAll('.controls-card p'))if(/^Drag a slider/.test(p.textContent.trim()))p.classList.add('controls-tip');
let hidden=new Set();try{hidden=new Set(JSON.parse(localStorage.getItem(KEY)||'[]'))}catch{}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify([...hidden]))}catch{}};
const bar=document.createElement('div');bar.className='restore-bar';bar.setAttribute('role','group');bar.setAttribute('aria-label','Show hidden panels');
const head=$('.workspace-header');head?.after(bar);
function paint(){for(const p of PANELS)body.classList.toggle('hide-'+p.key,hidden.has(p.key));bar.replaceChildren();
  const shown=PANELS.filter(p=>hidden.has(p.key)&&$(p.sel));if(!shown.length){bar.hidden=true;return}bar.hidden=false;
  const lab=document.createElement('span');lab.className='restore-label';lab.textContent='Hidden:';bar.append(lab);
  for(const p of shown){const b=document.createElement('button');b.type='button';b.className='restore-chip';b.textContent=p.label;b.title='Show again';b.dataset.testid='show-'+p.key;b.addEventListener('click',()=>{hidden.delete(p.key);save();paint()});bar.append(b)}
  if(shown.length>1){const all=document.createElement('button');all.type='button';all.className='restore-chip restore-all';all.textContent='Show all';all.addEventListener('click',()=>{hidden.clear();save();paint()});bar.append(all)}}
for(const p of PANELS){const host=$(p.where);if(!host)continue;const x=document.createElement('button');x.type='button';x.className='panel-close'+(p.desk?' desk-only':'');x.textContent='✕';x.title='Hide';x.setAttribute('aria-label','Hide '+p.label.replace(/^\S+\s/,''));x.dataset.testid='hide-'+p.key;
  x.addEventListener('click',e=>{e.stopPropagation();hidden.add(p.key);save();paint()});host.classList.add('closable');host.append(x)}
// Focus mode
const top=$('.stage-top .live-label');const fb=document.createElement('button');fb.type='button';fb.id='focus-btn';fb.className='focus-btn';fb.textContent='⛶ Focus';fb.title='Show only the simulation and its controls (Esc to exit)';fb.dataset.testid='focus-btn';top?.after(fb);
const exit=document.createElement('button');exit.type='button';exit.className='focus-exit';exit.textContent='✕ Exit focus';exit.dataset.testid='focus-exit';exit.hidden=true;body.append(exit);
function focus(on){body.classList.toggle('focus',on);exit.hidden=!on;fb.setAttribute('aria-pressed',String(on));if(on)$('.stage')?.scrollIntoView({block:'start'});window.dispatchEvent(new Event('resize'))}
fb.addEventListener('click',()=>focus(!body.classList.contains('focus')));exit.addEventListener('click',()=>focus(false));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&body.classList.contains('focus'))focus(false)});
paint();
// Less-used tools go into one "More" menu so the main row stays short and clear.
const row=$('.lab-tool-buttons');if(row){const d=document.createElement('details');d.className='more-menu';const sm=document.createElement('summary');sm.textContent='More ▾';sm.dataset.testid='more-menu';const pop=document.createElement('div');pop.className='more-pop';
  for(const id of['sound-toggle','volume-wrap','randomise-btn','realism-toggle','surprise-button','help-open']){const el=document.getElementById(id);if(el)pop.append(el)}
  d.append(sm,pop);row.append(d);document.addEventListener('click',e=>{if(d.open&&!d.contains(e.target))d.open=false});pop.addEventListener('click',e=>{if(e.target.closest('button'))setTimeout(()=>{d.open=false},150)})}
// Hide the favourites box until something is starred.
const fc=document.getElementById('favourites-count'),fav=$('.favourites');if(fc&&fav){const f=()=>fav.classList.toggle('is-empty',fc.textContent.trim()==='0');f();new MutationObserver(f).observe(fc,{childList:true,characterData:true,subtree:true})}
})();
