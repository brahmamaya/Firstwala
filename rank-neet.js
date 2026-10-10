/* Rank mode · NEET Physics. No simulations. For now one chapter, Units and Measurements:
   formulas with how to apply them, short notes, the most asked question types, then practice and a mock test.
   Loaded with the tutor pack, only when the student opens NEET. Nothing leaves the device (localStorage). */
(() => {
'use strict';
const EX={neet:{key:'physica-rank-neet',label:'NEET Physics',data:()=>window.PhysicaRankUnits,bank:'neet',target:60},jee:{key:'physica-rank-jee',label:'JEE Mains Physics',data:()=>window.PhysicaRankUnitsJee,bank:'jee',target:90}};
let X=EX.neet;const N=10,TOPIC=8;
const el=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
const btn=(c,x,f)=>{const b=el('button',c,x);b.type='button';if(f)b.addEventListener('click',f);return b};
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const U=()=>X.data(),CH=()=>U()?.chapter,PB=()=>window.PhysicaMockBank||{},bank=()=>[...(PB()[CH()]?.[X.bank]||[]),...(U()?.extra||[])],TN={units:'Units and SI',dims:'Dimensional analysis',sig:'Significant figures',err:'Errors in measurement',inst:'Vernier and screw gauge'},tname=tp=>PB()[CH()]?.topics?.[tp]||TN[tp]||tp;
let seen=[];
const load=()=>{try{const s=JSON.parse(localStorage.getItem(X.key));seen=Array.isArray(s?.seen)?s.seen.filter(Number.isInteger):[]}catch{seen=[]}},save=()=>{try{localStorage.setItem(X.key,JSON.stringify({seen}))}catch{}};
function pick(n,tp){const B=bank(),ids=B.map((q,i)=>i).filter(i=>!tp||B[i].tp===tp),fresh=shuffle(ids.filter(i=>!seen.includes(i))),out=fresh.slice(0,n);
  if(out.length<n)out.push(...shuffle(ids.filter(i=>!out.includes(i))).slice(0,n-out.length));return out}

let showAll=false,ov=null,view=null,onClose=null,tab='guide',tabsEl=null;
const SECS0=['Dimensions','Units','Significant figures','Errors','Instruments'],secs=()=>U().secs||SECS0;
function close(){if(!ov)return;stopT();ov.remove();ov=null;view=null;tabsEl=null;document.body.classList.remove('rank-open');removeEventListener('keydown',esc);removeEventListener('resize',onRz);if(!document.getElementById('landing')?.hidden)window.PhysicaLandingBG?.start();const f=onClose;onClose=null;f?.()}
function esc(e){if(e.key==='Escape'&&ov){if(ov.dataset.run==='1')home();else close()}}
function open(cb,ex){X=EX[ex]||EX.neet;if(ov||!U())return;load();window.PhysicaLandingBG?.stop();onClose=cb||null;
  ov=el('div','rank-ov rk-ov');ov.setAttribute('role','dialog');ov.setAttribute('aria-label','Rank mode: '+X.label+', '+CH());ov.dataset.testid='rank-neet-page';
  // one slim bar: back, chapter name and all the buttons
  const head=el('div','rk-head'),back=btn('rk-back','← Back',()=>{if(ov.dataset.run==='1')home();else close()});back.dataset.testid='rk-back';
  const t=el('div','rk-title');t.append(el('b','',CH()),el('span','','Rank mode · '+X.label));
  tabsEl=el('div','rk-htabs');tabsEl.setAttribute('role','tablist');
  for(const [k,l] of [['guide','Guide'],['formulas','Formulas'],['notes','Revise'],['asked','Most asked'],...(U().pyq?.length?[['pyq','PYQs']]:[]),['mock','Mock test']]){
    const b=btn('rk-pill'+(k==='mock'?' act':''),l,()=>go(k));b.dataset.k=k;b.dataset.testid='rk-tab-'+k;tabsEl.append(b)}
  head.append(back,t,tabsEl);
  const wrap=el('div','rk-wrap');view=el('div','rk-view');wrap.append(view);ov.append(head,wrap);document.body.append(ov);document.body.classList.add('rank-open');addEventListener('keydown',esc);addEventListener('resize',onRz);home();back.focus()}
/* questions and the mock test load only when first needed (big pack), the chapter pages open at once */
function needQ(fn){if(bank().length&&window.PhysicaMockTest)return fn();ov.dataset.run='1';view.className='rk-view run';view.replaceChildren(el('p','rk-lead','Loading the questions…'));paint(true);
  (window.PhysicaLoadTutorPack?.()||Promise.reject()).then(()=>window.PhysicaLoadExam()).then(()=>{if(ov)fn()},()=>{if(!ov)return;view.replaceChildren(el('p','rk-lead','Could not load the questions. Check your internet and try again.'),btn('rk-btn','Back to the chapter',home))})}
function go(k){if(k==='mock')return needQ(()=>window.PhysicaMockTest.start(CH(),X.bank));tab=k;home()}
function paint(running){for(const b of tabsEl.children)b.setAttribute('aria-selected',String(!running&&b.dataset.k===tab))}

/* ---------- the chapter page ---------- */
/* cards go to the shortest of n columns, so there are no gaps and nothing breaks across columns (also safe on Safari) */
function masonry(pane){const items=pane._items||(pane._items=[...pane.children]);pane.replaceChildren();const n=Math.max(1,Math.floor((pane.clientWidth+14)/354));let cols=null;
  for(const it of items){if(it.classList.contains('wide')||n===1){pane.append(it);cols=null;continue}
    if(!cols){const g=el('div','rk-cols');cols=Array.from({length:n},()=>el('div','rk-col'));g.append(...cols);pane.append(g)}
    cols.reduce((a,b)=>a.offsetHeight<=b.offsetHeight?a:b).append(it)}}
let rz=0;const onRz=()=>{clearTimeout(rz);rz=setTimeout(()=>{const p=view?.querySelector('.rk-pane');if(p&&view.className==='rk-view')masonry(p)},150)};
function home(){if(!view)return;stopT();ov.dataset.run='0';view.className='rk-view';view.replaceChildren();ov.scrollTop=0;paint(false);
  const pane=el('div','rk-pane');({guide,formulas,notes,asked,pyq})[tab](pane);view.append(pane);masonry(pane)}
const fig=key=>{const g=window.PhysicaRankFigs?.[key]?.();if(g)g.classList.add('rk-bigfig');return g};
const math=t=>{const s=el('span','rk-m');for(const x of t.split(/(\{[^}]*\})/)){if(x[0]==='{'){const [n,d]=x.slice(1,-1).split(';'),f=el('span','rk-fr');f.append(el('span','',n),el('span','',d));s.append(f)}else if(x)s.append(document.createTextNode(x))}return s};
const eqs=t=>{const r=t.split(' · '),w=el('div','rk-eqs'+(r.length>6?' long':''));for(const x of r){const d=el('div','rk-eq');d.append(math(x));w.append(d)}return w};

const steps=txt=>{const a=txt.split(/(?<=[.!?])\s+/).filter(Boolean);if(a.length<2)return el('p','rk-how',txt);const ol=el('ol','rk-steps');for(const x of a)ol.append(el('li','',x));return ol};
const label=t=>el('span','rk-label',t);
function formulas(p){const D=U(),F=D.formulas,must=F.filter(f=>f.p===1).length,bar=el('div','rk-filter wide');
  bar.append(el('span','','Show'),...[[false,`Must know (${must})`],[true,`All (${F.length})`]].map(([v,l])=>{const b=btn('rk-pill small',l,()=>{showAll=v;home()});b.setAttribute('aria-selected',String(showAll===v));return b}),el('small','',showAll?'Everything in the chapter.':'The 20% that gives most of the marks. Start here.'));p.append(bar);
  secs().forEach((g,i)=>{const list=F.filter(x=>x.g===g&&(showAll||x.p===1));if(!list.length&&g!=='Dimensions')return;p.append(el('h2','rk-sec wide',`${i+1} · ${g}`));
    if(g==='Dimensions'){const t=el('div','rk-card wide');t.append(el('h3','','Dimensions to remember'));const gr=el('div','rk-dims');for(const [q,d] of D.table){const r=el('div','rk-dim');r.append(el('span','',q),el('b','','['+d+']'));gr.append(r)}t.append(gr);p.append(t)}
    for(const f of list){const c=el('div','rk-card');c.append(el('h3','',f.n),eqs(f.f),label('How to apply'),steps(f.how));const fg=f.fig&&fig(f.fig);if(fg)c.append(fg);
      if(f.ex){const e=el('p','rk-ex');e.append(el('b','','Example '),document.createTextNode(f.ex));c.append(e)}p.append(c)}})}
function guide(p){const G=U().guide;p.append(el('p','rk-lead wide',G.intro));
  const card=(h,n)=>{const c=el('div','rk-card');c.append(el('h3','',(n?n+' · ':'')+h));p.append(c);return c};
  const list=(c,a,ord)=>{const l=el(ord?'ol':'ul',ord?'rk-steps':'rk-list');for(const x of a)l.append(el('li','',x));c.append(l)};
  let c=card('Your study plan',1);const pl=el('ol','rk-path');for(const [d,t] of G.plan){const li=el('li');li.append(el('b','',d),el('span','',t));pl.append(li)}c.append(pl);
  c=card('Know these before you start',2);c.append(el('p','rk-how','If any of these feels shaky, fix it first. Fixing it takes about 10 minutes.'));list(c,G.basics);
  c=card('Your path through the chapter',3);const ol=el('ol','rk-path');
  G.path.forEach(x=>{const li=el('li');li.append(el('b','',x.t),el('span','',x.d),el('em','','You are ready when: '+x.ready));if(x.go){li.append(btn('rk-mini',x.go==='practice'?'Start practice':'Open '+({formulas:'Formulas',notes:'Short notes',asked:'Most asked',mock:'Mock test'})[x.go],()=>x.go==='practice'?needQ(()=>runSet(pick(N),'Practice')):go(x.go)))}ol.append(li)});c.append(ol);
  c=card('How to think when you meet any question',4);list(c,G.think,true);
  c=card('What to keep in mind',5);list(c,G.watch);
  c=el('div','rk-card wide rk-myths');c.append(el('h3','','6 · Common misconceptions'));const g=el('div','rk-mgrid');
  for(const m of G.myths){const d=el('div','rk-myth');d.append(el('p','rk-wrong',m[0]),el('p','rk-right',m[1]));g.append(d)}c.append(g);p.append(c)}
function notes(p){const D=U(),l=el('div','rk-card wide rk-look');l.append(el('h3','','Remember in one look'));const ch=el('div','rk-chips');for(const x of D.look)ch.append(el('span','rk-tag',x));l.append(ch);p.append(l);
  D.notes.forEach(n=>{const c=el('div','rk-card rk-note-card');c.append(el('h3','',n.h));const ul=el('ul','rk-list');for(const i of n.items)ul.append(el('li','',i));c.append(ul);const fg=n.fig&&fig(n.fig);if(fg)c.append(fg);p.append(c)});}
function pyq(p){const L=U().pyq;p.append(el('p','rk-lead wide','Questions asked in past papers, grouped by topic, with the exam and year. The wording is adapted, so check the official paper for the exact options. Tap a question to see the answer and the solution.'));
  const by={};for(const q of L)(by[q.tp]=by[q.tp]||[]).push(q);
  for(const tp of Object.keys(by)){p.append(el('h2','rk-sec wide',tname(tp)+' ('+by[tp].length+')'));
    for(const q of by[tp]){const c=el('div','rk-card');c.append(el('span','rk-year',q.y),el('p','rk-q',q.q));let ops;
      if(q.o){ops=el('ol','rk-pyqo');q.o.forEach((o,j)=>ops.append(el('li',j===q.c?'':'',o)));c.append(ops)}
      const ans=el('div','rk-hint');ans.hidden=true;ans.append(el('p','rk-ok','Answer: '+(q.o?'('+'abcd'[q.c]+') '+q.o[q.c]:q.n)),...String(q.s||'').split('\n').filter(Boolean).map(l=>el('p','',l)));
      const b=btn('rk-mini','Show answer',()=>{ans.hidden=!ans.hidden;b.textContent=ans.hidden?'Show answer':'Hide answer'});c.append(b,ans);p.append(c)}}}
function asked(p){p.append(el('p','rk-lead wide','These question types come up again and again. For each one: read the 3 steps, see the example, then practise it.'));
  U().asked.forEach((a,i)=>{const c=el('div','rk-card');c.append(el('span','rk-num',String(i+1)),el('h3','',a.t),el('p','rk-how',a.what),label('Steps'));const ol=el('ol','rk-steps');for(const s of a.steps)ol.append(el('li','',s));c.append(ol);
    const fg=a.fig&&fig(a.fig);if(fg)c.append(fg);const e=el('p','rk-ex');e.append(el('b','','Example '),document.createTextNode(a.ex));c.append(e,btn('rk-mini','Practise this type',()=>needQ(()=>runSet(pick(TOPIC,a.tp),tname(a.tp)))));p.append(c)})}

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
