/* Rank mode · NEET Physics. No simulations. For now one chapter, Units and Measurements:
   formulas with how to apply them, short notes, the most asked question types, then practice and a mock test.
   Loaded with the tutor pack, only when the student opens NEET. Nothing leaves the device (localStorage). */
(() => {
'use strict';
const KEY='physica-rank-neet',N=10,TOPIC=8;
const el=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
const btn=(c,x,f)=>{const b=el('button',c,x);b.type='button';if(f)b.addEventListener('click',f);return b};
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const U=()=>window.PhysicaRankUnits,CH=()=>U()?.chapter,PB=()=>window.PhysicaMockBank||{},bank=()=>PB()[CH()]?.neet||[],tname=tp=>PB()[CH()]?.topics?.[tp]||tp;
let seen=[];
const load=()=>{try{const s=JSON.parse(localStorage.getItem(KEY));seen=Array.isArray(s?.seen)?s.seen.filter(Number.isInteger):[]}catch{seen=[]}},save=()=>{try{localStorage.setItem(KEY,JSON.stringify({seen}))}catch{}};
function pick(n,tp){const B=bank(),ids=B.map((q,i)=>i).filter(i=>!tp||B[i].tp===tp),fresh=shuffle(ids.filter(i=>!seen.includes(i))),out=fresh.slice(0,n);
  if(out.length<n)out.push(...shuffle(ids.filter(i=>!out.includes(i))).slice(0,n-out.length));return out}

let ov=null,view=null,onClose=null,tab='guide',tabsEl=null;
const SECS=['Dimensions','Units','Significant figures','Errors','Instruments'];
function close(){if(!ov)return;ov.remove();ov=null;view=null;tabsEl=null;document.body.classList.remove('rank-open');removeEventListener('keydown',esc);if(!document.getElementById('landing')?.hidden)window.PhysicaLandingBG?.start();const f=onClose;onClose=null;f?.()}
function esc(e){if(e.key==='Escape'&&ov){if(ov.dataset.run==='1')home();else close()}}
function open(cb){if(ov||!U())return;load();window.PhysicaLandingBG?.stop();onClose=cb||null;
  ov=el('div','rank-ov rk-ov');ov.setAttribute('role','dialog');ov.setAttribute('aria-label','Rank mode: NEET Physics, '+CH());ov.dataset.testid='rank-neet-page';
  // one slim bar: back, chapter name and all the buttons
  const head=el('div','rk-head'),back=btn('rk-back','← Back',()=>{if(ov.dataset.run==='1')home();else close()});back.dataset.testid='rk-back';
  const t=el('div','rk-title');t.append(el('b','',CH()),el('span','','Rank mode · NEET Physics'));
  tabsEl=el('div','rk-htabs');tabsEl.setAttribute('role','tablist');
  for(const [k,l] of [['guide','Guide'],['formulas','Formulas'],['notes','Short notes'],['asked','Most asked'],['mock','Mock test']]){
    const b=btn('rk-pill'+(k==='mock'?' act':''),l,()=>go(k));b.dataset.k=k;b.dataset.testid='rk-tab-'+k;tabsEl.append(b)}
  head.append(back,t,tabsEl);
  const wrap=el('div','rk-wrap');view=el('div','rk-view');wrap.append(view);ov.append(head,wrap);document.body.append(ov);document.body.classList.add('rank-open');addEventListener('keydown',esc);home();back.focus()}
/* questions and the mock test load only when first needed (big pack), the chapter pages open at once */
function needQ(fn){if(bank().length&&window.PhysicaMockTest)return fn();ov.dataset.run='1';view.className='rk-view run';view.replaceChildren(el('p','rk-lead','Loading the questions…'));paint(true);
  (window.PhysicaLoadTutorPack?.()||Promise.reject()).then(()=>window.PhysicaLoadExam()).then(()=>{if(ov)fn()},()=>{if(!ov)return;view.replaceChildren(el('p','rk-lead','Could not load the questions. Check your internet and try again.'),btn('rk-btn','Back to the chapter',home))})}
function go(k){if(k==='mock')return needQ(()=>window.PhysicaMockTest.start(CH(),'neet'));tab=k;home()}
function paint(running){for(const b of tabsEl.children)b.setAttribute('aria-selected',String(!running&&b.dataset.k===tab))}

/* ---------- the chapter page ---------- */
function home(){if(!view)return;ov.dataset.run='0';view.className='rk-view';view.replaceChildren();ov.scrollTop=0;paint(false);
  const pane=el('div','rk-pane');({guide,formulas,notes,asked})[tab](pane);view.append(pane)}
const fig=key=>{const g=window.PhysicaRankFigs?.[key]?.();if(g)g.classList.add('rk-bigfig');return g};
const math=t=>{const s=el('span','rk-m');for(const x of t.split(/(\{[^}]*\})/)){if(x[0]==='{'){const [n,d]=x.slice(1,-1).split(';'),f=el('span','rk-fr');f.append(el('span','',n),el('span','',d));s.append(f)}else if(x)s.append(document.createTextNode(x))}return s};
const eqs=t=>{const r=t.split(' · '),w=el('div','rk-eqs'+(r.length>6?' long':''));for(const x of r){const d=el('div','rk-eq');d.append(math(x));w.append(d)}return w};

const steps=txt=>{const a=txt.split(/(?<=[.!?])\s+/).filter(Boolean);if(a.length<2)return el('p','rk-how',txt);const ol=el('ol','rk-steps');for(const x of a)ol.append(el('li','',x));return ol};
const label=t=>el('span','rk-label',t);
function formulas(p){const D=U();
  SECS.forEach((g,i)=>{p.append(el('h2','rk-sec wide',`${i+1} · ${g}`));
    if(g==='Dimensions'){const t=el('div','rk-card wide');t.append(el('h3','','Dimensions to remember'));const gr=el('div','rk-dims');for(const [q,d] of D.table){const r=el('div','rk-dim');r.append(el('span','',q),el('b','','['+d+']'));gr.append(r)}t.append(gr);p.append(t)}
    for(const f of D.formulas.filter(x=>x.g===g)){const c=el('div','rk-card');c.append(el('h3','',f.n),eqs(f.f),label('How to apply'),steps(f.how));const fg=f.fig&&fig(f.fig);if(fg)c.append(fg);
      if(f.ex){const e=el('p','rk-ex');e.append(el('b','','Example '),document.createTextNode(f.ex));c.append(e)}p.append(c)}})}
function guide(p){const G=U().guide;p.append(el('p','rk-lead wide',G.intro));
  const card=(h,n)=>{const c=el('div','rk-card');c.append(el('h3','',(n?n+' · ':'')+h));p.append(c);return c};
  const list=(c,a,ord)=>{const l=el(ord?'ol':'ul',ord?'rk-steps':'rk-list');for(const x of a)l.append(el('li','',x));c.append(l)};
  let c=card('Know these before you start',1);c.append(el('p','rk-how','If any of these feels shaky, fix it first. It takes 20 minutes and saves hours later.'));list(c,G.basics);
  c=card('Your path through the chapter',2);const ol=el('ol','rk-path');
  G.path.forEach(x=>{const li=el('li');li.append(el('b','',x.t),el('span','',x.d),el('em','','You are ready when: '+x.ready));if(x.go){li.append(btn('rk-mini',x.go==='practice'?'Start practice':'Open '+({formulas:'Formulas',notes:'Short notes',asked:'Most asked',mock:'Mock test'})[x.go],()=>x.go==='practice'?needQ(()=>runSet(pick(N),'Practice')):go(x.go)))}ol.append(li)});c.append(ol);
  c=card('How to think when you meet any question',3);list(c,G.think,true);
  c=card('What to keep in mind',4);list(c,G.watch);
  c=el('div','rk-card wide rk-myths');c.append(el('h3','','5 · Common misconceptions'));const g=el('div','rk-mgrid');
  for(const m of G.myths){const d=el('div','rk-myth');d.append(el('p','rk-wrong',m[0]),el('p','rk-right',m[1]));g.append(d)}c.append(g);p.append(c)}
function notes(p){const D=U(),l=el('div','rk-card wide rk-look');l.append(el('h3','','Remember in one look'));const ch=el('div','rk-chips');for(const x of D.look)ch.append(el('span','rk-tag',x));l.append(ch);p.append(l);
  D.notes.forEach(n=>{const c=el('div','rk-card rk-note-card');c.append(el('h3','',n.h));const ul=el('ul','rk-list');for(const i of n.items)ul.append(el('li','',i));c.append(ul);const fg=n.fig&&fig(n.fig);if(fg)c.append(fg);p.append(c)});}
function asked(p){p.append(el('p','rk-lead wide','These question types come up again and again. For each one: read the 3 steps, see the example, then practise it.'));
  U().asked.forEach((a,i)=>{const c=el('div','rk-card');c.append(el('span','rk-num',String(i+1)),el('h3','',a.t),el('p','rk-how',a.what),label('Steps'));const ol=el('ol','rk-steps');for(const s of a.steps)ol.append(el('li','',s));c.append(ol);
    const fg=a.fig&&fig(a.fig);if(fg)c.append(fg);const e=el('p','rk-ex');e.append(el('b','','Example '),document.createTextNode(a.ex));c.append(e,btn('rk-mini','Practise this type',()=>needQ(()=>runSet(pick(TOPIC,a.tp),tname(a.tp)))));p.append(c)})}

/* ---------- a set of questions ---------- */
function runSet(ids,title){if(!ids.length)return;ov.dataset.run='1';view.className='rk-view run';paint(true);let k=0;const res=[];
  const show=()=>{if(k>=ids.length)return summary(res,title);const i=ids[k],q=bank()[i];view.replaceChildren();ov.scrollTop=0;
    const top=el('div','rk-qtop');top.append(el('span','rk-chip on',title),el('span','rk-count',`${k+1} / ${ids.length}`),btn('rk-link','End',()=>summary(res,title)));
    const bar=el('div','rk-bar'),fill=el('i');fill.style.width=(k/ids.length*100)+'%';bar.append(fill);
    const card=el('div','rk-card');card.append(el('p','rk-meta',tname(q.tp)),el('p','rk-q',q.q));{const g=window.PhysicaFig?.(q.fig);if(g){g.classList.add('rk-fig');card.append(g)}}
    const order=shuffle([0,1,2,3]),opts=el('div','rk-opts'),hint=el('div','rk-hint'),fb=el('div','rk-fb'),lines=String(q.s||'').split('\n').filter(Boolean);hint.hidden=true;fb.hidden=true;let done=false,hl=0;
    const H=[`Topic: ${tname(q.tp)}. Write what is given, what is asked, and the formula that connects them.`,lines.length>1?`First step: ${lines[0]}`:'Check the units or dimensions of each term, then try again.'];
    const hb=btn('rk-hintbtn','Help me start',()=>{if(done)return;hl++;hint.hidden=false;hint.replaceChildren();for(let n=0;n<Math.min(hl,2);n++)hint.append(el('p','',H[n]));if(hl>=3){hint.append(el('b','','Solution'));for(const l of lines)hint.append(el('p','',l))}hb.textContent=hl===1?'Another hint':hl===2?'Show solution':'Solution shown';if(hl>=3)hb.disabled=true});hb.dataset.testid='rk-hint';
    const next=btn('rk-btn',k+1<ids.length?'Next →':'Finish',()=>{k++;show()});next.hidden=true;next.dataset.testid='rk-next';
    order.forEach((oi,pos)=>{const b=btn('rk-opt',null,()=>{if(done)return;done=true;const ok=oi===q.c;b.classList.add(ok?'right':'wrong');if(!ok)opts.children[order.indexOf(q.c)].classList.add('right');
      for(const x of opts.children)x.disabled=true;hb.hidden=true;fb.hidden=false;fb.append(el('p',ok?'rk-ok':'rk-no',ok?(hl?'Correct, with help.':'Correct!'):'Not quite.'));for(const l of lines)fb.append(el('p','rk-sol',l));
      res.push({q,ok,hints:hl});if(!seen.includes(i))seen.push(i);save();next.hidden=false;next.focus()});
      b.append(el('span','rk-l','ABCD'[pos]),el('span','rk-t',q.o[oi]));b.dataset.testid='rk-opt';b.dataset.correct=String(oi===q.c);opts.append(b)});
    card.append(opts,hb,hint,fb);view.append(top,bar,card,next)};
  show()}
function summary(res,title){ov.dataset.run='0';view.className='rk-view run';paint(true);view.replaceChildren();ov.scrollTop=0;const n=res.length,ok=res.filter(r=>r.ok).length,alone=res.filter(r=>r.ok&&!r.hints).length;
  const c=el('div','rk-card rk-center');c.append(el('h3','',title+' · done'));const t=el('div','rk-tiles');
  for(const [v,l] of [[`${ok} / ${n}`,'Correct'],[alone,'Solved without help'],[n-ok,'To revise']]){const d=el('div','rk-tile');d.append(el('b','',String(v)),el('span','',l));t.append(d)}c.append(t);
  const wrong=[...new Set(res.filter(r=>!r.ok).map(r=>tname(r.q.tp)))];if(wrong.length){c.append(el('p','rk-note','Go back to the formulas for:'));for(const w of wrong)c.append(el('p','rk-meta','• '+w))}
  else if(n)c.append(el('p','rk-note','Clean set. Try the mock test next.'));
  const row=el('div','rk-two');row.append(btn('rk-btn','Back to the chapter',home));c.append(row);view.append(c)}

window.PhysicaRankNeet={open,close};
})();
