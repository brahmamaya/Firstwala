/* Rank mode · NEET Physics. No simulations. For now one chapter, Units and Measurements:
   formulas with how to apply them, short notes, the most asked question types, then practice and a mock test.
   Loaded with the tutor pack, only when the student opens NEET. Nothing leaves the device (localStorage). */
(() => {
'use strict';
const EX={neet:{key:'physica-rank-neet',label:'NEET Physics',data:()=>window.PhysicaRankUnits,bank:'neet',target:60},jee:{pyq:1,pick:1,key:'physica-rank-jee',label:'JEE Mains',data:()=>window.PhysicaRankUnitsJee,bank:'jee',target:90}};
let X=EX.neet;const N=10,TOPIC=8;
const MK=/\^\(|\{|√|[A-Za-zα-ωΔ)][⁰-⁹²³′₀-₉]*\/[A-Za-zα-ω(]/;
const el=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null){if(typeof x==='string'&&MK.test(x))e.append(math(x));else e.textContent=x}return e};
const btn=(c,x,f)=>{const b=el('button',c,x);b.type='button';if(f)b.addEventListener('click',f);return b};
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const U=()=>X.data(),CH=()=>U()?.chapter,PB=()=>window.PhysicaMockBank||{},bank=()=>[...(PB()[CH()]?.[X.bank]||[]),...(U()?.extra||[])],TN={units:'Units and SI',dims:'Dimensional analysis',sig:'Significant figures',err:'Errors in measurement',inst:'Vernier and screw gauge'},tname=tp=>PB()[CH()]?.topics?.[tp]||TN[tp]||tp;
let seen=[];
const load=()=>{try{const s=JSON.parse(localStorage.getItem(X.key));seen=Array.isArray(s?.seen)?s.seen.filter(Number.isInteger):[]}catch{seen=[]}},save=()=>{try{localStorage.setItem(X.key,JSON.stringify({seen}))}catch{}};
function pick(n,tp){const B=bank(),ids=B.map((q,i)=>i).filter(i=>!tp||B[i].tp===tp),fresh=shuffle(ids.filter(i=>!seen.includes(i))),out=fresh.slice(0,n);
  if(out.length<n)out.push(...shuffle(ids.filter(i=>!out.includes(i))).slice(0,n-out.length));return out}

let showAll=false,chap=null,subj='physics',head=null,ov=null,view=null,onClose=null,tab='guide',tabsEl=null;
const JEE_CH=[['Class 11',['Units and Measurements','Kinematics','Laws of Motion','Work, Energy and Power','Rotational Motion','Gravitation','Properties of Solids and Liquids','Thermodynamics','Kinetic Theory of Gases','Oscillations and Waves']],
  ['Class 12',['Electrostatics','Current Electricity','Magnetic Effects of Current and Magnetism','Electromagnetic Induction and Alternating Current','Electromagnetic Waves','Optics','Dual Nature of Matter and Radiation','Atoms and Nuclei','Electronic Devices','Experimental Skills']]];
const picking=()=>X.pick&&!chap,ready=()=>!X.pick||chap===CH(),TABS=[['guide','Guide'],['formulas','Formulas'],['notes','Revise'],['asked','Most asked'],['pyq','PYQs'],['mock','Mock test']],SUBJ=[['physics','Physics'],['chemistry','Chemistry'],['maths','Maths']];
const SECS0=['Dimensions','Units','Significant figures','Errors','Instruments'],secs=()=>U().secs||SECS0;
function close(){if(!ov)return;stopT();ov.remove();ov=null;view=null;tabsEl=null;document.body.classList.remove('rank-open');removeEventListener('keydown',esc);removeEventListener('resize',onRz);if(!document.getElementById('landing')?.hidden)window.PhysicaLandingBG?.start();const f=onClose;onClose=null;f?.()}
function goBack(){if(ov.dataset.run==='1')home();else if(X.pick&&chap){chap=null;tab='guide';setHead();home()}else close()}
function esc(e){if(e.key==='Escape'&&ov)goBack()}
/* one slim bar: back, title and the buttons (subjects while choosing, chapter tabs inside a chapter) */
function setHead(){const back=btn('rk-back','← Back',goBack);back.dataset.testid='rk-back';
  const t=el('div','rk-title');t.append(el('b','',picking()?X.label:(chap||CH())),el('span','',picking()?'Rank mode · choose a subject':'Rank mode · '+X.label+(X.pick?' · Physics':'')));
  tabsEl=el('div','rk-htabs');tabsEl.setAttribute('role','tablist');
  for(const [k,l] of picking()?SUBJ:TABS.filter(x=>x[0]!=='pyq'||X.pyq)){const b=btn('rk-pill'+(k==='mock'?' act':''),l,()=>go(k));b.dataset.k=k;b.dataset.testid=(picking()?'rk-sub-':'rk-tab-')+k;tabsEl.append(b)}
  head.replaceChildren(back,t,tabsEl);ov.setAttribute('aria-label','Rank mode: '+X.label+(chap?', '+chap:''))}
function open(cb,ex){X=EX[ex]||EX.neet;if(ov||!U())return;load();window.PhysicaLandingBG?.stop();onClose=cb||null;
  ov=el('div','rank-ov rk-ov');ov.setAttribute('role','dialog');ov.dataset.testid='rank-neet-page';
  head=el('div','rk-head');chap=null;subj='physics';tab='guide';setHead();
  const wrap=el('div','rk-wrap');view=el('div','rk-view');wrap.append(view);ov.append(head,wrap);document.body.append(ov);document.body.classList.add('rank-open');addEventListener('keydown',esc);addEventListener('resize',onRz);home();setTimeout(()=>{if(ov&&!PB()[CH()]&&window.PhysicaLoadTutorPack)(window.requestIdleCallback||setTimeout)(()=>{if(ov)window.PhysicaLoadTutorPack().then(()=>window.PhysicaLoadExam()).catch(()=>{})},{timeout:8000})},3000)}
/* questions and the mock test load only when first needed (big pack), the chapter pages open at once */
const loadQ=()=>(window.PhysicaLoadTutorPack?.()||Promise.reject()).then(()=>window.PhysicaLoadExam());
const loadCard=what=>{const box=el('div','rk-card rk-center');box.append(el('div','rk-spin'),el('h3','','Loading '+(what||'the questions')+'…'),el('p','rk-how','Downloading the question bank (about 2 MB, only the first time). Please wait a few seconds.'));return box};
const failCard=(retry)=>{const b2=el('div','rk-card rk-center');b2.append(el('h3','','Could not load the questions'),el('p','rk-how','Check your internet and try again.'),btn('rk-btn','Try again',retry),btn('rk-link','Back to the chapter',home));return b2};
function needQ(fn,what){if(bank().length&&window.PhysicaMockTest&&PB()[CH()])return fn();ov.dataset.run='1';view.className='rk-view run';paint(true);view.replaceChildren(loadCard(what));ov.scrollTop=0;
  loadQ().then(()=>{if(ov)fn()},()=>{if(ov)view.replaceChildren(failCard(()=>needQ(fn,what)))})}
/* the mock test lives on its own tab, same card as in the Physica tutor: start button and past attempts */
function mockPane(p){const M=window.PhysicaMockTest,info=M&&PB()[CH()]&&M.info(CH(),X.bank);
  if(!info){p.append(loadCard('the mock test'));loadQ().then(()=>{if(ov&&tab==='mock'&&view.className==='rk-view')home()},()=>{if(ov&&tab==='mock')view.replaceChildren(failCard(home))});return}
  const c=el('div','rk-card rk-mockcard');c.append(el('h3','','⏱ '+info.name+' mock test'),el('p','rk-how',`${info.n} questions · ${info.min} min · +${info.plus}${info.minus?' / −'+info.minus:', no negative marking'} · result after you submit`));
  const st=btn('rk-btn','Start mock test',()=>{M.start(CH(),X.bank);const w=setInterval(()=>{if(!ov){clearInterval(w);return}if(!document.querySelector('.mock')){clearInterval(w);if(tab==='mock'&&view.className==='rk-view')home()}},800)});st.dataset.testid='rk-mock-start';c.append(st);
  const past=M.past(CH(),X.bank).slice(0,3);
  if(past.length){c.append(el('span','rk-label','Your past attempts'));for(const r of past){const ok=r.res.filter(x=>x==='c').length,w=r.res.filter(x=>x==='w').length;c.append(btn('rk-mini',`📄 ${new Date(r.at).toLocaleDateString()} · ${info.plus*ok-info.minus*w} / ${info.plus*r.res.length}`,()=>M.open(r)))}}
  p.append(c)}
function go(k){if(picking())subj=k;else tab=k;home()}
function paint(running){for(const b of tabsEl.children)b.setAttribute('aria-selected',String(!running&&b.dataset.k===(picking()?subj:tab)))}

/* ---------- the chapter page ---------- */
/* cards go to the shortest of n columns, so there are no gaps and nothing breaks across columns (also safe on Safari) */
function masonry(pane){const items=pane._items||(pane._items=[...pane.children]);pane.replaceChildren();const n=Math.max(1,Math.floor((pane.clientWidth+14)/354));let cols=null;
  for(const it of items){if(it.classList.contains('wide')||n===1){pane.append(it);cols=null;continue}
    if(!cols){const g=el('div','rk-cols');cols=Array.from({length:n},()=>el('div','rk-col'));g.append(...cols);pane.append(g)}
    cols.reduce((a,b)=>a.offsetHeight<=b.offsetHeight?a:b).append(it)}}
let rz=0;const onRz=()=>{clearTimeout(rz);rz=setTimeout(()=>{if(view?.className==='rk-view')for(const m of view.querySelectorAll('.rk-pane:not([hidden])'))masonry(m)},150)};
function home(){if(!view)return;stopT();ov.dataset.run='0';view.className='rk-view';view.replaceChildren();ov.scrollTop=0;paint(false);
  const pane=el('div','rk-pane');(picking()?chooser:ready()?({guide,formulas,notes,asked,pyq,mock:mockPane})[tab]:soonPane)(pane);view.append(pane);masonry(pane)}
/* JEE: pick a subject, then a chapter. Only Units and Measurements has content so far; the others open the same page with "coming soon". */
function chooser(p){if(subj!=='physics'){const c=el('div','rk-card rk-center wide');c.append(el('h3','',SUBJ.find(x=>x[0]===subj)[1]+' chapters are coming soon'),el('p','rk-how','Physics is ready to explore. Open it from the buttons above.'));p.append(c);return}
  for(const [cls,list] of JEE_CH){const c=el('div','rk-card'),l=el('div','rk-chlist');c.append(el('h3','',cls+' Physics'));
    list.forEach((n,i)=>{const b=btn('rk-ch'+(n===CH()?'':' soon'),null,()=>{chap=n;tab='guide';setHead();home()});b.append(el('i','',String(i+1)),el('span','',n),el('b','',n===CH()?'Ready':'Soon'));b.dataset.testid='rk-ch-'+(i+1)+(cls==='Class 12'?'b':'a');l.append(b)});c.append(l);p.append(c)}}
function soonPane(p){const c=el('div','rk-card rk-center wide');c.append(el('h3','',(TABS.find(x=>x[0]===tab)||[0,'This'])[1]+' · coming soon'),el('p','rk-how',chap+' is being prepared. Units and Measurements is ready now.'),btn('rk-btn','Back to chapters',goBack));p.append(c)}
const fig=key=>{const g=window.PhysicaRankFigs?.[key]?.();if(g)g.classList.add('rk-bigfig');return g};
/* small typesetter. parse() turns the markup into nodes (text, power, fraction, radical) that the page draws with DOM
   elements and the slide export draws on a canvas / writes into PowerPoint.
   Markup: {n;d} fraction, ^(x) power, √x / √(x) / √{n;d} radical, ΔA/A and X/Y fractions (units and plain words stay text). */
const UNITS=/^(m|s|kg|g|N|J|W|Pa|mol|cm|mm|Hz|dyne|erg|cal|atm|eV|µm|μm|Ω|K|ly|AU|pc|kWh|Wb|H)$/,WORD=/^([a-z]{4,}|is|are|sin|cos|tan|log|exp|and|or|per)$/,plain=x=>{x=x.replace(/[⁰-⁹²³⁻\d]+$/,'');return UNITS.test(x)||WORD.test(x)},TOK='[A-Za-zα-ωΔ][A-Za-zα-ω0-9₀-₉⁰-⁹²³′_]{0,7}',GRP='\\([^()]*\\)',SL=new RegExp('('+GRP+'|'+TOK+')/('+GRP+'|'+TOK+')','g');
const endOf=(t,i)=>{const o=t[i],c=o==='{'?'}':')';let d=0;for(let j=i;j<t.length;j++){if(t[j]===o)d++;else if(t[j]===c&&--d===0)return j}return -1};
const split=t=>{let d=0;for(let j=0;j<t.length;j++){if(t[j]==='{'||t[j]==='(')d++;else if(t[j]==='}'||t[j]===')')d--;else if(t[j]===';'&&!d)return[t.slice(0,j),t.slice(j+1)]}return[t,'']};
function parse(t){const out=[];let buf='';const flush=()=>{if(!buf)return;let last=0;
    for(const m of buf.matchAll(SL)){const[,n,d]=m;if(plain(n)||plain(d)||/\d$/.test(buf.slice(Math.max(0,m.index-1),m.index)))continue;out.push({k:'t',s:buf.slice(last,m.index)},{k:'fr',n:parse(n.replace(/^\(|\)$/g,'')),d:parse(d.replace(/^\(|\)$/g,''))});last=m.index+m[0].length}
    out.push({k:'t',s:buf.slice(last)});buf=''};
  const group=g=>{const[n,d]=split(g);return d===''&&!g.includes(';')?parse(n):[{k:'fr',n:parse(n),d:parse(d)}]};
  for(let i=0;i<t.length;i++){const c=t[i];
    if(c==='{'){const e=endOf(t,i);if(e>0){flush();out.push(...group(t.slice(i+1,e)));i=e;continue}}
    if(c==='^'&&t[i+1]==='('){const e=endOf(t,i+1);if(e>0){flush();out.push({k:'sup',c:parse(t.slice(i+2,e))});i=e;continue}}
    if(c==='√'){let e=-1,r;if(t[i+1]==='{'){e=endOf(t,i+1);if(e>0)r=group(t.slice(i+2,e))}
      else if(t[i+1]==='('){e=endOf(t,i+1);if(e>0)r=parse(t.slice(i+2,e))}
      else{const m=/^[A-Za-zα-ωΔ0-9₀-₉⁰-⁹²³′]+/.exec(t.slice(i+1));if(m){e=i+m[0].length;r=parse(m[0])}}
      if(e>0){flush();out.push({k:'rad',c:r});i=e;continue}}
    buf+=c}
  flush();return out.filter(x=>x.k!=='t'||x.s)}
window.PhysicaRankMath={parse};
const SVG='http://www.w3.org/2000/svg';
const rad=r=>{const w=el('span','rk-rad'),g=document.createElementNS(SVG,'svg');g.setAttribute('viewBox','0 0 10 20');g.setAttribute('preserveAspectRatio','none');g.setAttribute('aria-hidden','true');g.classList.add('rk-rs');
  const pa=document.createElementNS(SVG,'path');pa.setAttribute('d','M0 12 L2 10 L5 18 L10 1');pa.setAttribute('vector-effect','non-scaling-stroke');g.append(pa);const q=el('span','rk-rr');q.append(r);w.append(g,q);return w};
function dom(nodes,s){s=s||el('span','rk-m');for(const x of nodes){
    if(x.k==='t')s.append(document.createTextNode(x.s));
    else if(x.k==='sup'){const sp=el('sup');dom(x.c,sp);s.append(sp)}
    else if(x.k==='fr'){const f=el('span','rk-fr'),n=el('span'),d=el('span');dom(x.n,n);dom(x.d,d);f.append(n,d);s.append(f)}
    else s.append(rad(dom(x.c,el('span'))))}
  return s}
const math=t=>dom(parse(t));
const eqs=t=>{const r=t.split(' · '),w=el('div','rk-eqs'+(r.length>6?' long':''));for(const x of r){const d=el('div','rk-eq');d.append(math(x));w.append(d)}return w};

const steps=txt=>{const a=txt.split(/(?<=[.!?])\s+/).filter(Boolean);if(a.length<2)return el('p','rk-how',txt);const ol=el('ol','rk-steps');for(const x of a)ol.append(el('li','',x));return ol};
const label=t=>el('span','rk-label',t);
function formulas(p){const D=U(),F=D.formulas,must=F.filter(f=>f.p===1).length,bar=el('div','rk-filter wide');
  bar.append(el('span','','Show'),...[[false,`Must know (${must})`],[true,`All (${F.length})`]].map(([v,l])=>{const b=btn('rk-pill small',l,()=>{showAll=v;home()});b.setAttribute('aria-selected',String(showAll===v));return b}),el('small','',showAll?'Everything in the chapter.':'The 20% that gives most of the marks. Start here.'));p.append(bar);
  secs().forEach((g,i)=>{const list=F.filter(x=>x.g===g&&(showAll||x.p===1));if(!list.length&&g!=='Dimensions')return;p.append(el('h2','rk-sec wide',`${i+1} · ${g}`));
    if(g==='Dimensions'){const t=el('div','rk-card wide');t.append(el('h3','','Dimensions to remember'));const gr=el('div','rk-dims');for(const [q,d] of D.table){const r=el('div','rk-dim');r.append(el('span','',q),el('b','','['+d+']'));gr.append(r)}t.append(gr);p.append(t)}
    for(const f of list){const c=el('div','rk-card');c.append(el('h3','',f.n),eqs(f.f),label('How to apply'),steps(f.how));const fg=f.fig&&fig(f.fig);if(fg)c.append(fg);
      if(f.ex){const e=el('p','rk-ex');e.append(el('b','','Example '),math(f.ex));c.append(e)}p.append(c)}})}
function guide(p){const G=U().guide;p.append(el('p','rk-lead wide',G.intro));
  const card=(h,n)=>{const c=el('div','rk-card');c.append(el('h3','',(n?n+' · ':'')+h));p.append(c);return c};
  const list=(c,a,ord)=>{const l=el(ord?'ol':'ul',ord?'rk-steps':'rk-list');for(const x of a)l.append(el('li','',x));c.append(l)};
  let c=card('Your study plan',1);const pl=el('ol','rk-path');for(const [d,t] of G.plan){const li=el('li');li.append(el('b','',d),el('span','',t));pl.append(li)}c.append(pl);
  c=card('Know these before you start',2);c.append(el('p','rk-how','If any of these feels shaky, fix it first. Fixing it takes about 10 minutes.'));list(c,G.basics);
  c=card('Your path through the chapter',3);const ol=el('ol','rk-path');
  G.path.forEach(x=>{const li=el('li');li.append(el('b','',x.t),el('span','',x.d),el('em','','You are ready when: '+x.ready));for(const g of [x.go,x.go2].filter(Boolean)){li.append(btn('rk-mini',g==='practice'?'Start practice':'Open '+({formulas:'Formulas',notes:'Revise',asked:'Most asked',mock:'Mock test'})[g],()=>g==='practice'?needQ(()=>runSet(pick(N),'Practice'),'practice questions'):go(g)))}ol.append(li)});c.append(ol);
  c=card('How to think when you meet any question',4);list(c,G.think,true);
  c=card('What to keep in mind',5);list(c,G.watch);
  c=el('div','rk-card wide rk-myths');c.append(el('h3','','6 · Common misconceptions'));const g=el('div','rk-mgrid');
  for(const m of G.myths){const d=el('div','rk-myth');d.append(el('p','rk-wrong',m[0]),el('p','rk-right',m[1]));g.append(d)}c.append(g);p.append(c)}
function notes(p){const D=U(),l=el('div','rk-card wide rk-look');l.append(el('h3','','Remember in one look'));const ch=el('div','rk-chips');for(const x of D.look)ch.append(el('span','rk-tag',x));l.append(ch);p.append(l);
  D.notes.forEach(n=>{const c=el('div','rk-card rk-note-card');c.append(el('h3','',n.h));const ul=el('ul','rk-list');for(const i of n.items)ul.append(el('li','',i));c.append(ul);const fg=n.fig&&fig(n.fig);if(fg)c.append(fg);p.append(c)});}
let pyqWait=null;const loadPyq=()=>window.PhysicaRankPyq?Promise.resolve():pyqWait||(pyqWait=new Promise((ok,no)=>{const s=document.createElement('script');s.src='__PYQ_URL__';s.async=true;s.onload=ok;s.onerror=()=>{pyqWait=null;s.remove();no()};document.head.append(s)}));
let exWait=null;const loadExport=()=>window.PhysicaRankExport?Promise.resolve():exWait||(exWait=new Promise((ok,no)=>{const s=document.createElement('script');s.src='__EXPORT_URL__';s.async=true;s.onload=ok;s.onerror=()=>{exWait=null;s.remove();no()};document.head.append(s)}));
let selOn=false;const selSet=new Set();
const ABC='abcd',PTN=n=>n.map(i=>'('+ABC[i]+')').join(' and ');
function pyq(p){const L=window.PhysicaRankPyq,idx=L&&new Map(L.map((q,i)=>[q,i]));
  if(!L){p.append(loadCard('past-year questions'));loadPyq().then(()=>{if(ov&&tab==='pyq'&&view.className==='rk-view')home()},()=>{if(ov&&tab==='pyq')view.replaceChildren(failCard(home))});return}
  const card=(q,n)=>{const c=el('div','rk-card'),hd=el('div','rk-qhead');hd.append(el('span','rk-qn','Q'+(n+1)),el('span','rk-year',q.y));c.append(hd,el('p','rk-q',q.q));
    const i=idx.get(q),lab=el('label','rk-pick'),cb=el('input');cb.type='checkbox';cb.checked=selSet.has(i);cb.setAttribute('aria-label','Select question');c._i=i;c.classList.toggle('picked',cb.checked);
    cb.addEventListener('change',()=>{cb.checked?selSet.add(i):selSet.delete(i);c.classList.toggle('picked',cb.checked);refresh()});lab.append(cb,el('span','','Select'));hd.prepend(lab);
    if(q.o){const ops=el('ol','rk-pyqo');for(const o of q.o)ops.append(el('li','',o));c.append(ops)}
    const ans=el('div','rk-hint');ans.hidden=true;const cs=[].concat(q.c??[]);
    ans.append(el('p','rk-ok','Answer: '+(q.o?PTN(cs)+' '+cs.map(i=>q.o[i]).join('; '):q.n!=null?q.n:q.a)),...String(q.s||'').split('\n').filter(Boolean).map(l=>el('p','',l)));
    const b=btn('rk-mini','Show answer',()=>{ans.hidden=!ans.hidden;b.textContent=ans.hidden?'Show answer':'Hide answer'});c.append(b,ans);return c};
  /* a sub-topic builds its cards only when opened, so the 200 questions never load at once */
  const sub=(st,qs,open)=>{const w=el('div','rk-subwrap wide'),body=el('div','rk-pane rk-subbody'),h=btn('rk-subbtn','',()=>{const on=h.getAttribute('aria-expanded')!=='true';h.setAttribute('aria-expanded',String(on));body.hidden=!on;body.style.display=on?'':'none';if(on){const tools=el('div','rk-subtools wide'),mark=v=>{for(const q of qs)v?selSet.add(idx.get(q)):selSet.delete(idx.get(q));syncChecks();refresh()};tools.append(el('span','',st),btn('rk-pill small','Select all '+qs.length,()=>mark(true)),btn('rk-pill small','Clear',()=>mark(false)));body.append(tools,...qs.map(card));masonry(body)}else{body.replaceChildren();body._items=null}});let built=0;
    hs.push(h);h.append(el('span','',st),el('b','',String(qs.length)));h.setAttribute('aria-expanded','false');body.hidden=true;w.append(h,body);if(open)requestAnimationFrame(()=>h.click());return w};
  const hs=[],all=on=>{const todo=hs.filter(h=>(h.getAttribute('aria-expanded')==='true')!==on);(function nx(){const h=todo.shift();if(h&&ov){h.click();requestAnimationFrame(nx)}})()};
  const bar=el('div','rk-filter wide');bar.append(el('span','',L.length+' questions. Tap a sub-topic to open it.'),btn('rk-pill small','Open all',()=>all(true)),btn('rk-pill small','Close all',()=>all(false)));p.append(bar);
  const sbar=el('div','rk-selbar wide'),tgl=btn('rk-pill','Select',()=>{selOn=!selOn;if(!selOn){selSet.clear();syncChecks()}refresh()}),cnt=el('span','rk-selcount'),dl=btn('rk-pill act','⬇ Download',()=>dialog(L)),sa=btn('rk-pill small','Select all '+L.length,()=>{L.forEach((q,i)=>selSet.add(i));syncChecks();refresh()}),sc=btn('rk-pill small','Clear',()=>{selSet.clear();syncChecks();refresh()});
  tgl.dataset.testid='rk-select';dl.dataset.testid='rk-download';
  sbar.append(tgl,cnt,sa,sc,dl);
  const syncChecks=()=>{for(const c of p.querySelectorAll('.rk-card')){if(c._i==null)continue;const on=selSet.has(c._i);c.querySelector('.rk-pick input').checked=on;c.classList.toggle('picked',on)}},
    refresh=()=>{p.classList.toggle('selon',selOn);tgl.setAttribute('aria-pressed',String(selOn));tgl.textContent=selOn?'Done':'Select';cnt.textContent=selOn?selSet.size+' selected':'Tap Select to choose questions';sa.hidden=sc.hidden=dl.hidden=!selOn;dl.disabled=!selSet.size;dl.setAttribute('aria-disabled',String(!selSet.size))};
  let first=1;for(const tp of [...new Set(L.map(q=>q.tp))]){const T=L.filter(q=>q.tp===tp);p.append(el('h2','rk-sec wide',tname(tp)+' ('+T.length+')'));
    for(const st of [...new Set(T.map(q=>q.st))]){p.append(sub(st,T.filter(q=>q.st===st),first));first=0}}
  p.append(sbar);refresh()}
/* Download dialog: what to include and which file, both required */
const PAPERS=['JEE Main','JEE Advanced','IIT-JEE','AIEEE'];
function dialog(L){const idx=[...selSet].sort((a,b)=>a-b),items=idx.map(i=>({q:L[i],topic:tname(L[i].tp)+' · '+L[i].st}));if(!items.length)return;
  const m=el('div','rk-modal'),box=el('div','rk-dlg');m.setAttribute('role','dialog');m.setAttribute('aria-modal','true');m.setAttribute('aria-label','Download slides');m.append(box);ov.append(m);
  let inc=null,fmt=null,stop=false;const done=()=>{stop=true;m.remove()};
  const group=(title,name,opts,set)=>{const f=el('fieldset','rk-fs');f.append(el('legend','',title+' (choose one)'));for(const [v,l,sub] of opts){const lb=el('label','rk-ropt'),r=el('input');r.type='radio';r.name=name;r.value=v;r.dataset.testid='dl-'+v;r.addEventListener('change',()=>{set(v);ok.disabled=!(inc&&fmt);ok.setAttribute('aria-disabled',String(ok.disabled))});const t=el('span');t.append(el('b','',l),el('small','',sub));lb.append(r,t);f.append(lb)}return f};
  const ok=btn('rk-btn','Download',()=>go2());ok.disabled=true;ok.dataset.testid='dl-go';
  box.append(el('h3','','Download '+items.length+' question'+(items.length>1?'s':'')+' as slides'),
    group('Include','inc',[['q','Only questions','Space left below each question. The answer sits at the bottom right.'],['qs','Questions + solutions','The answer and worked solution are written below each question.']],v=>inc=v),
    group('Format','fmt',[['pdf','PDF','Slides saved as pages, ready to print or project.'],['ppt','PowerPoint (.pptx)','Editable text boxes: change, add or delete anything.']],v=>fmt=v));
  const row=el('div','rk-dlgrow');row.append(btn('rk-link','Cancel',done),ok);box.append(row);
  const go2=async()=>{if(!(inc&&fmt))return;box.replaceChildren(el('h3','','Preparing your slides…'));const pr=el('p','rk-how','Loading…'),bar=el('div','rk-bar'),fill=el('i');bar.append(fill);box.append(pr,bar,btn('rk-link','Cancel',done));
    try{await loadExport();if(items.some(x=>x.q.fig))await window.PhysicaLoadTutorPack?.();
      const paper=y=>y.replace(/\s+(19|20)\d\d.*$/,''),papers=PAPERS.filter(a=>items.some(x=>paper(x.q.y)===a)),tps=[];
      for(const x of items){let t=tps.find(z=>z.tp===x.q.tp);if(!t)tps.push(t={tp:x.q.tp,name:tname(x.q.tp),n:0,subs:[]});t.n++;const s2=t.subs.find(z=>z[0]===x.q.st);s2?s2[1]++:t.subs.push([x.q.st,1])}
      const meta={chapter:CH(),exam:X.label,subject:'Physics',cls:(JEE_CH.find(c=>c[1].includes(CH()))||['Class 11'])[0],papers,topics:tps};
      const blob=await window.PhysicaRankExport.make({items,withSol:inc==='qs',format:fmt,meta,cancelled:()=>stop,onProgress:(i,n,j,t)=>{const v=j?(n+j)/(n+t):i/(n+t);fill.style.width=Math.round(v*100)+'%';pr.textContent=j?'Saving page '+j+' of '+t+'…':'Making slide '+i+' of '+n+'…'}});
      if(stop)return;const nm=['Physica',X.label,CH(),'PYQs',inc==='qs'?'with-solutions':'questions'].join('-').replace(/[^A-Za-z0-9-]+/g,'-')+(fmt==='ppt'?'.pptx':'.pdf'),file=new File([blob],nm,{type:blob.type}),
        save=()=>{const url=URL.createObjectURL(blob),a=el('a');a.href=url;a.download=nm;document.body.append(a);a.click();setTimeout(()=>{a.remove();URL.revokeObjectURL(url)},5000)},
        /* iPad / iPhone: the share sheet has "Save to Files"; a plain download would open in the browser's own downloads list */
        touch=/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1),canShare=touch&&navigator.canShare?.({files:[file]});
      if(canShare){box.replaceChildren(el('h3','','Your file is ready'),el('p','rk-how',nm),el('p','rk-how','Tap "Save to Files", then choose a folder.'));
        const sv=btn('rk-btn','Save to Files',async()=>{try{await navigator.share({files:[file],title:nm});done()}catch(e2){if(e2?.name!=='AbortError')save()}});sv.dataset.testid='dl-save';box.append(sv,btn('rk-link','Close',done))}
      else{save();box.replaceChildren(el('h3','','Done'),el('p','rk-how','Your file is downloading: '+nm),btn('rk-btn','Close',done))}}
    catch(e){if(stop)return;box.replaceChildren(el('h3','','Could not make the file'),el('p','rk-how','Please try again. If it keeps failing, choose fewer questions.'),btn('rk-btn','Close',done))}};
  ok.focus?.()}
function asked(p){p.append(el('p','rk-lead wide','These question types come up again and again. For each one: read the 3 steps, see the example, then practise it.'));
  U().asked.forEach((a,i)=>{const c=el('div','rk-card');c.append(el('span','rk-num',String(i+1)),el('h3','',a.t),el('p','rk-how',a.what),label('Steps'));const ol=el('ol','rk-steps');for(const s of a.steps)ol.append(el('li','',s));c.append(ol);
    const fg=a.fig&&fig(a.fig);if(fg)c.append(fg);const e=el('p','rk-ex');e.append(el('b','','Example '),math(a.ex));c.append(e,btn('rk-mini','Practise this type',()=>needQ(()=>runSet(pick(TOPIC,a.tp),tname(a.tp)))));p.append(c)})}

/* ---------- a set of questions ---------- */
let tm=0;const stopT=()=>{clearInterval(tm);tm=0};
function runSet(ids,title){if(!ids.length)return;ov.dataset.run='1';view.className='rk-view run';paint(true);let k=0;const res=[];
  const show=()=>{stopT();if(k>=ids.length)return summary(res,title);const i=ids[k],q=bank()[i];view.replaceChildren();ov.scrollTop=0;
    const clock=el('span','rk-clock','⏱ 0:00');clock.title='Aim for '+X.target+' seconds per question';const t0=Date.now();
    tm=setInterval(()=>{const t=Math.round((Date.now()-t0)/1000);clock.textContent='⏱ '+Math.floor(t/60)+':'+String(t%60).padStart(2,'0');clock.classList.toggle('late',t>X.target)},1000);
    const top=el('div','rk-qtop');top.append(el('span','rk-chip on',title),el('span','rk-count',`${k+1} / ${ids.length}`),clock,btn('rk-link','End',()=>summary(res,title)));
    const bar=el('div','rk-bar'),fill=el('i');fill.style.width=(k/ids.length*100)+'%';bar.append(fill);
    const card=el('div','rk-card');card.append(el('p','rk-meta',tname(q.tp)+(q.o?'':' · numerical answer')),el('p','rk-q',q.q));{const g=window.PhysicaFig?.(q.fig);if(g){g.classList.add('rk-fig');card.append(g)}}
    const hint=el('div','rk-hint'),fb=el('div','rk-fb'),lines=String(q.s||'').split('\n').filter(Boolean);hint.hidden=true;fb.hidden=true;let done=false,hl=0;
    const H=[`Topic: ${tname(q.tp)}. Write what is given, what is asked, and the formula that connects them.`,lines.length>1?`First step: ${lines[0]}`:'Check the units or dimensions of each term, then try again.'];
    const hb=btn('rk-hintbtn','Help me start',()=>{if(done)return;hl++;hint.hidden=false;hint.replaceChildren();for(let n=0;n<Math.min(hl,2);n++)hint.append(el('p','',H[n]));if(hl>=3){hint.append(el('b','','Solution'));for(const l of lines)hint.append(el('p','',l))}hb.textContent=hl===1?'Another hint':hl===2?'Show solution':'Solution shown';if(hl>=3)hb.disabled=true});hb.dataset.testid='rk-hint';
    const next=btn('rk-btn',k+1<ids.length?'Next →':'Finish',()=>{k++;show()});next.hidden=true;next.dataset.testid='rk-next';
    const finish=(ok,mark,said)=>{if(done)return;done=true;stopT();mark?.();hb.hidden=true;fb.hidden=false;fb.append(el('p',ok?'rk-ok':'rk-no',ok?(hl?'Correct, with help.':'Correct!'):(said||'Not quite.')));for(const l of lines)fb.append(el('p','rk-sol',l));
      res.push({q,ok,hints:hl,s:Math.round((Date.now()-t0)/1000)});if(!seen.includes(i))seen.push(i);save();next.hidden=false;next.focus()};
    let body;
    if(q.o){const order=shuffle([0,1,2,3]);body=el('div','rk-opts');
      order.forEach((oi,pos)=>{const b=btn('rk-opt',null,()=>{const ok=oi===q.c;finish(ok,()=>{b.classList.add(ok?'right':'wrong');if(!ok)body.children[order.indexOf(q.c)].classList.add('right');for(const x of body.children)x.disabled=true})});
        b.append(el('span','rk-l','ABCD'[pos]),el('span','rk-t',q.o[oi]));b.dataset.testid='rk-opt';b.dataset.correct=String(oi===q.c);body.append(b)})}
    else{body=el('div','rk-nat');const inp=el('input','rk-in');inp.type='text';inp.inputMode='decimal';inp.autocomplete='off';inp.placeholder='Type your answer (a number)';inp.setAttribute('aria-label','Your answer');inp.dataset.testid='rk-nat';
      inp.addEventListener('input',()=>{inp.value=inp.value.replace(/[^0-9.\-]/g,'')});
      const go=()=>{const v=parseFloat(inp.value);if(Number.isNaN(v)){inp.focus();return}const ok=Math.abs(v-q.n)<=.01;finish(ok,()=>{inp.disabled=true;chk.disabled=true},ok?'':'Not quite. The answer is '+q.n+'.')};
      inp.addEventListener('keydown',e=>{if(e.key==='Enter')go()});const chk=btn('rk-btn','Check answer',go);chk.dataset.testid='rk-check';body.append(inp,chk)}
    card.append(body,hb,hint,fb);view.append(top,bar,card,next)};
  show()}
function summary(res,title){stopT();ov.dataset.run='0';view.className='rk-view run';paint(true);view.replaceChildren();ov.scrollTop=0;const n=res.length,ok=res.filter(r=>r.ok).length,alone=res.filter(r=>r.ok&&!r.hints).length,avg=n?Math.round(res.reduce((a,r)=>a+(r.s||0),0)/n):0;
  const c=el('div','rk-card rk-center');c.append(el('h3','',title+' · done'));const t=el('div','rk-tiles');
  for(const [v,l] of [[`${ok} / ${n}`,'Correct'],[avg+' s','Average time (aim '+X.target+' s)'],[n-ok,'To revise']]){const d=el('div','rk-tile');d.append(el('b','',String(v)),el('span','',l));t.append(d)}c.append(t);
  if(n)c.append(el('p','rk-note',`Solved without help: ${alone}.`+(avg>X.target?' You are slower than the aim. Use the shortcuts in the Guide to save time.':'')));
  const wrong=[...new Set(res.filter(r=>!r.ok).map(r=>tname(r.q.tp)))];if(wrong.length){c.append(el('p','rk-note','Go back to the formulas for:'));for(const w of wrong)c.append(el('p','rk-meta','• '+w))}
  else if(n)c.append(el('p','rk-note','Clean set. Try the mock test next.'));
  const row=el('div','rk-two');row.append(btn('rk-btn','Back to the chapter',home));c.append(row);view.append(c)}

window.PhysicaRankNeet={open,close};
})();
