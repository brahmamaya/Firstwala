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
/* Two scratch-style cards beside the landing page: one for learners, one for teachers. Art is drawn on a canvas (no images, no network);
   a card opens a short dialog. Built with createElement/textContent only. */
(()=>{const host=document.getElementById('land-cards'),land=document.getElementById('landing');if(!host||!land)return;
const S=176,TAU=Math.PI*2;
const doodles={
 burst:(g,x,y,r)=>{for(let k=0;k<8;k++){const a=k*TAU/8;g.beginPath();g.moveTo(x+Math.cos(a)*r*.45,y+Math.sin(a)*r*.45);g.lineTo(x+Math.cos(a)*r,y+Math.sin(a)*r);g.stroke()}g.beginPath();g.arc(x,y,r*.18,0,TAU);g.fill()},
 medal:(g,x,y,r)=>{g.beginPath();g.arc(x,y,r*.55,0,TAU);g.stroke();g.beginPath();g.arc(x,y,r*.28,0,TAU);g.fill();g.beginPath();g.moveTo(x-r*.35,y+r*.45);g.lineTo(x-r*.6,y+r*1.1);g.lineTo(x-r*.2,y+r*.9);g.lineTo(x,y+r*.55);g.moveTo(x+r*.35,y+r*.45);g.lineTo(x+r*.6,y+r*1.1);g.lineTo(x+r*.2,y+r*.9);g.lineTo(x,y+r*.55);g.stroke()},
 trophy:(g,x,y,r)=>{g.beginPath();g.moveTo(x-r*.5,y-r*.6);g.lineTo(x+r*.5,y-r*.6);g.quadraticCurveTo(x+r*.5,y+r*.3,x,y+r*.35);g.quadraticCurveTo(x-r*.5,y+r*.3,x-r*.5,y-r*.6);g.closePath();g.fill();g.beginPath();g.arc(x-r*.58,y-r*.25,r*.2,Math.PI*.5,Math.PI*1.5);g.arc(x+r*.58,y-r*.25,r*.2,-Math.PI*.5,Math.PI*.5);g.stroke();g.beginPath();g.moveTo(x,y+r*.35);g.lineTo(x,y+r*.75);g.moveTo(x-r*.35,y+r*.8);g.lineTo(x+r*.35,y+r*.8);g.stroke()},
 gift:(g,x,y,r)=>{g.beginPath();g.moveTo(x-r*.55,y-r*.2);g.lineTo(x+r*.55,y-r*.2);g.lineTo(x+r*.45,y+r*.7);g.lineTo(x-r*.45,y+r*.7);g.closePath();g.fill();g.beginPath();g.arc(x,y-r*.25,r*.3,Math.PI,0);g.stroke()},
 moon:(g,x,y,r)=>{g.beginPath();g.arc(x,y,r*.5,Math.PI*.3,Math.PI*1.4);g.stroke()},
 dots:(g,x,y,r)=>{for(const [a,b,c] of [[0,0,.12],[.5,.3,.08],[.1,.6,.1],[.7,.7,.06]]){g.beginPath();g.arc(x+a*r,y+b*r,c*r,0,TAU);g.fill()}},
 cross:(g,x,y,r)=>{g.beginPath();g.moveTo(x-r*.3,y-r*.3);g.lineTo(x+r*.3,y+r*.3);g.moveTo(x+r*.3,y-r*.3);g.lineTo(x-r*.3,y+r*.3);g.stroke()},
 cap:(g,x,y,r)=>{g.beginPath();g.moveTo(x,y-r*.5);g.lineTo(x+r*.85,y-r*.1);g.lineTo(x,y+r*.3);g.lineTo(x-r*.85,y-r*.1);g.closePath();g.fill();g.beginPath();g.moveTo(x-r*.5,y+r*.12);g.lineTo(x-r*.5,y+r*.55);g.quadraticCurveTo(x,y+r*.85,x+r*.5,y+r*.55);g.lineTo(x+r*.5,y+r*.12);g.stroke()},
 book:(g,x,y,r)=>{g.beginPath();g.moveTo(x,y-r*.3);g.quadraticCurveTo(x-r*.5,y-r*.55,x-r*.85,y-r*.35);g.lineTo(x-r*.85,y+r*.5);g.quadraticCurveTo(x-r*.5,y+r*.3,x,y+r*.55);g.quadraticCurveTo(x+r*.5,y+r*.3,x+r*.85,y+r*.5);g.lineTo(x+r*.85,y-r*.35);g.quadraticCurveTo(x+r*.5,y-r*.55,x,y-r*.3);g.moveTo(x,y-r*.3);g.lineTo(x,y+r*.55);g.stroke()},
 atom:(g,x,y,r)=>{for(let k=0;k<3;k++){g.beginPath();g.ellipse(x,y,r*.85,r*.32,k*Math.PI/3,0,TAU);g.stroke()}g.beginPath();g.arc(x,y,r*.14,0,TAU);g.fill()},
 pencil:(g,x,y,r)=>{g.save();g.translate(x,y);g.rotate(-.8);g.beginPath();g.rect(-r*.18,-r*.8,r*.36,r*1.1);g.stroke();g.beginPath();g.moveTo(-r*.18,r*.3);g.lineTo(0,r*.75);g.lineTo(r*.18,r*.3);g.closePath();g.fill();g.restore()},
 bulb:(g,x,y,r)=>{g.beginPath();g.arc(x,y-r*.15,r*.48,Math.PI*.8,Math.PI*.2);g.stroke();g.beginPath();g.moveTo(x-r*.22,y+r*.5);g.lineTo(x+r*.22,y+r*.5);g.moveTo(x-r*.16,y+r*.68);g.lineTo(x+r*.16,y+r*.68);g.stroke()},
 board:(g,x,y,r)=>{g.beginPath();g.rect(x-r*.85,y-r*.55,r*1.7,r*1.05);g.stroke();for(const k of [-.2,.05,.3]){g.beginPath();g.moveTo(x-r*.55,y+k*r);g.lineTo(x+(k===.3?r*.1:r*.55),y+k*r);g.stroke()}g.beginPath();g.moveTo(x-r*.5,y+r*.5);g.lineTo(x-r*.7,y+r*.85);g.moveTo(x+r*.5,y+r*.5);g.lineTo(x+r*.7,y+r*.85);g.stroke()},
 screen:(g,x,y,r)=>{g.beginPath();g.rect(x-r*.8,y-r*.55,r*1.6,r*.95);g.stroke();g.beginPath();g.moveTo(x-r*.15,y-r*.3);g.lineTo(x+r*.25,y-r*.08);g.lineTo(x-r*.15,y+r*.14);g.closePath();g.fill();g.beginPath();g.moveTo(x,y+r*.4);g.lineTo(x,y+r*.8);g.moveTo(x-r*.35,y+r*.82);g.lineTo(x+r*.35,y+r*.82);g.stroke()},
 page:(g,x,y,r,t)=>{g.beginPath();g.moveTo(x-r*.5,y-r*.7);g.lineTo(x+r*.2,y-r*.7);g.lineTo(x+r*.5,y-r*.4);g.lineTo(x+r*.5,y+r*.7);g.lineTo(x-r*.5,y+r*.7);g.closePath();g.stroke();g.beginPath();g.moveTo(x+r*.2,y-r*.7);g.lineTo(x+r*.2,y-r*.4);g.lineTo(x+r*.5,y-r*.4);g.stroke();g.font='800 '+r*.36+'px Orbitron,system-ui,sans-serif';g.textAlign='center';g.fillText(t,x,y+r*.2)},
 ruler:(g,x,y,r)=>{g.save();g.translate(x,y);g.rotate(-.6);g.beginPath();g.rect(-r*.9,-r*.2,r*1.8,r*.4);g.stroke();for(let k=-3;k<=3;k++){g.beginPath();g.moveTo(k*r*.24,-r*.2);g.lineTo(k*r*.24,-r*(k%2?.02:.08));g.stroke()}g.restore()},
 text:(g,x,y,r,t)=>{g.font='800 '+r*.7+'px Orbitron,system-ui,sans-serif';g.textAlign='center';g.fillText(t,x,y+r*.25)}};
const THEMES={
 learn:{a:'#5b9bff',b:'#2f6fe0',ink:'#1d4fb3',list:[['burst',30,28,24],['text',128,26,24,'π'],['atom',140,92,24],['book',34,98,24],['cap',86,142,24],['pencil',150,146,20],['bulb',22,150,20],['text',42,66,16,'E=mc²'],['medal',128,60,16],['dots',60,24,22],['cross',110,112,18],['moon',160,40,16]]},
 teach:{a:'#ffbe2e',b:'#f08a00',ink:'#b45f00',list:[['burst',30,28,24],['board',132,30,22],['screen',32,98,22],['page',140,98,20,'PDF'],['trophy',90,146,22],['ruler',150,150,20],['gift',22,150,18],['page',30,64,12,'PPT'],['medal',128,62,14],['dots',60,24,22],['cross',110,112,18],['moon',160,40,16]]}};
const paint=(cv,k)=>{const T=THEMES[k],d=Math.min(3,Math.max(2,Math.ceil(devicePixelRatio||2))),g=cv.getContext('2d');cv.width=cv.height=S*d;g.scale(d,d);
 const grad=g.createLinearGradient(0,0,S,S);grad.addColorStop(0,T.a);grad.addColorStop(1,T.b);g.fillStyle=grad;g.fillRect(0,0,S,S);
 g.strokeStyle=T.ink;g.fillStyle=T.ink;g.lineWidth=3;g.lineCap=g.lineJoin='round';g.globalAlpha=.8;
 for(const [n,x,y,r,t] of T.list)doodles[n](g,x,y,r,t);
 g.globalAlpha=1;g.fillStyle='rgba(255,255,255,.22)';g.beginPath();g.arc(S/2,70,38,0,TAU);g.fill();g.strokeStyle='rgba(255,255,255,.55)';g.lineWidth=3;g.stroke();
 g.fillStyle='#fff';g.font='900 46px Orbitron,system-ui,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('P',S/2,73)};
const el=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x)e.textContent=x;return e};
const openRank=()=>{const r=document.querySelector('[data-testid=mode-rank]');if(r){r.click();r.scrollIntoView?.({block:'center',behavior:'smooth'})}};
const dialog=(id,kind,build)=>{const d=el('dialog','lc-dlg lc-'+kind);d.id=id;d.setAttribute('aria-labelledby',id+'-t');
 const x=el('button','lc-x','✕');x.type='button';x.setAttribute('aria-label','Close');x.addEventListener('click',()=>d.close());
 const go=el('button','lc-go','Rank mode kholo →');go.type='button';go.dataset.testid=id+'-go';go.addEventListener('click',()=>{d.close();openRank()});
 d.append(x);build(d);d.append(go);d.addEventListener('click',e=>{if(e.target===d)d.close()});land.append(d);return d};
const list=(tag,items)=>{const l=el(tag,'lc-list');for(const [b,t] of items){const li=el('li');if(b)li.append(el('b','',b),document.createTextNode(' '));li.append(document.createTextNode(t));l.append(li)}return l};
const learn=dialog('lc-learn','learn',d=>{
 d.append(el('p','lc-tag','FOR LEARNERS'));const h=el('h2','','Padhai ka poora saath');h.id='lc-learn-t';d.append(h);
 const ts=el('div','lc-hot');ts.append(el('span','lc-pill','INCOMING'),el('h3','','📝 Full-length Test Series'),el('p','','NEET 2027, JEE Main 2027 aur JEE Advanced 2027: real exam pattern, har exam ke 30 tests. Pehle 3 tests free.'),el('p','lc-where','Kahan milega: Rank mode → apna exam → 📝 Test Series'));
 d.append(ts,el('p','lc-sub','Abhi Rank mode mein milta hai'),list('ul',[['Revise','chapter ke short notes'],['Formulas','zaroori formulas, PDF download ke saath'],['Mock test','chapter-wise mock, exam jaisa']]))});
const teach=dialog('lc-teach','teach',d=>{
 d.append(el('p','lc-tag','FOR TEACHERS'));const h=el('h2','','PYQ ki slides, sirf 1 minute mein');h.id='lc-teach-t';d.append(h);
 d.append(el('p','lc-hook','Raat bhar slides banane ki zaroorat nahi. Chapter kholo, questions tick karo, download dabao.'),
  list('ol',[['','Rank mode → JEE Mains → apna chapter → PYQs tab'],['','“Select questions to make slides” dabao, jitne chahiye tick karo'],['','Download: PDF ya PowerPoint, Dark ya Light, 1 ya 2 questions per slide']]),
  el('p','lc-sub','Cover page topics ke saath milta hai. Print karo, projector par chalao ya WhatsApp par bhejo.'))});
for(const [k,label,sub,dlg] of [['learn','For learners','Test Series incoming',learn],['teach','For teachers','PYQ slides & PDF',teach]]){
 const b=el('button','lc-card lc-c-'+k);b.type='button';b.dataset.testid='land-card-'+k;b.setAttribute('aria-haspopup','dialog');b.setAttribute('aria-label',label+': '+sub);
 const cv=el('canvas');cv.setAttribute('aria-hidden','true');const t=el('span','lc-label'),s=el('small','',sub);t.append(document.createTextNode(label),s);b.append(cv,t);
 b.addEventListener('click',()=>{try{dlg.showModal()}catch{}});host.append(b);paint(cv,k);
 try{document.fonts?.load('900 46px Orbitron').then(()=>paint(cv,k))}catch{}}
})();
