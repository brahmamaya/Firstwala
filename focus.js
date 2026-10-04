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
let hidden=new Set(['tips']);try{const v=localStorage.getItem(KEY);if(v)hidden=new Set(JSON.parse(v))}catch{}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify([...hidden]))}catch{}};
const bar=document.createElement('div');bar.className='restore-bar';bar.setAttribute('role','group');bar.setAttribute('aria-label','Show hidden panels');
const head=$('.workspace-header'),crumbs=$('.breadcrumbs');if(crumbs)crumbs.after(bar);else head?.after(bar);
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
// Fill the column under the stage with "What to notice" instead of leaving it empty beside a tall controls panel.
{const main=$('.lab-main'),below=$('.below-stage');if(main&&below)main.append(below)}
// A short fade/slide whenever another experiment opens, so changes feel smooth rather than jumpy.
{const stage=$('.stage');let last=location.hash;window.addEventListener('hashchange',()=>{if(location.hash===last||!stage)return;last=location.hash;stage.classList.remove('swap');void stage.offsetWidth;stage.classList.add('swap')})}
// "Hide info": the experiment's own title, measurement panel and settings strip are optional - without them the
// simulation itself is scaled up to fill the whole stage (pointer input is mapped back, so dragging still works).
{let clean=false;try{clean=localStorage.getItem('physica-clean')==='1'}catch{}window.PhysicaClean=clean;
  const S=640,s=Math.min(960/S,505/345),V=window.PhysicaView={s,ox:(960-S*s)/2-28*s,oy:(505-345*s)/2-76*s};
  const orig=window.PhysicaRenderExperiment;if(orig)window.PhysicaRenderExperiment=(c,sim,p,t,renderer)=>{if(!window.PhysicaClean)return orig(c,sim,p,t,renderer);
    c.save();const bg=c.createLinearGradient(0,0,960,505);bg.addColorStop(0,'#0a1d2d');bg.addColorStop(1,'#081624');c.fillStyle=bg;c.fillRect(0,0,960,505);window.Physica3D?.backdrop(c);
    c.translate(V.ox,V.oy);c.scale(V.s,V.s);c.beginPath();c.rect(28,76,640,345);c.clip();renderer(c,p,t);c.restore()};
  const ib=document.createElement('button');ib.type='button';ib.className='focus-btn info-btn';ib.dataset.testid='info-btn';ib.title='Show or hide the text and values drawn inside the simulation';
  const set=v=>{clean=v;window.PhysicaClean=v;ib.textContent=v?'◨ Show info':'◧ Hide info';ib.setAttribute('aria-pressed',String(v));try{localStorage.setItem('physica-clean',v?'1':'0')}catch{}window.dispatchEvent(new Event('physica-theme-change'))};
  ib.addEventListener('click',()=>set(!clean));fb.after(ib);set(clean)}
// Hide the favourites box until something is starred.
const fc=document.getElementById('favourites-count'),fav=$('.favourites');if(fc&&fav){const f=()=>fav.classList.toggle('is-empty',fc.textContent.trim()==='0');f();new MutationObserver(f).observe(fc,{childList:true,characterData:true,subtree:true})}
})();
