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

let ov=null,view=null,onClose=null,tab='formulas';
function close(){if(!ov)return;ov.remove();ov=null;view=null;document.body.classList.remove('rank-open');removeEventListener('keydown',esc);const f=onClose;onClose=null;f?.()}
function esc(e){if(e.key==='Escape'&&ov){if(ov.dataset.run==='1')home();else close()}}
function open(cb){if(ov||!U()||!bank().length)return;load();onClose=cb||null;
  ov=el('div','rank-ov rk-ov');ov.setAttribute('role','dialog');ov.setAttribute('aria-label','Rank mode: NEET Physics');ov.dataset.testid='rank-neet-page';
  const head=el('div','rk-head'),back=btn('rk-back','← Back',()=>{if(ov.dataset.run==='1')home();else close()});back.dataset.testid='rk-back';
  const t=el('div','rk-title');t.append(el('b','','Rank mode'),el('span','','NEET · Physics'));head.append(back,t);
  const wrap=el('div','rk-wrap');view=el('div','rk-view');wrap.append(view);ov.append(head,wrap);document.body.append(ov);document.body.classList.add('rank-open');addEventListener('keydown',esc);home();back.focus()}

/* ---------- the chapter page ---------- */
function home(){if(!view)return;ov.dataset.run='0';view.replaceChildren();ov.scrollTop=0;
  const h=el('div','rk-hero');h.append(el('span','rk-kicker','Class 11 · Chapter 1'),el('h1','',CH()),el('p','rk-sub','Formulas, short notes and the most asked questions.'));
  const tabs=el('div','rk-tabs');tabs.setAttribute('role','tablist');
  for(const [k,l] of [['formulas','Formulas'],['notes','Short notes'],['asked','Most asked']]){const b=btn('rk-tab',l,()=>{tab=k;home()});b.setAttribute('role','tab');b.setAttribute('aria-selected',String(tab===k));b.dataset.testid='rk-tab-'+k;tabs.append(b)}
  const pane=el('div','rk-pane');({formulas,notes,asked})[tab](pane);
  const act=el('div','rk-act');act.append(el('h3','','Now practise'),btn('rk-btn',`Practice · ${N} questions`,()=>runSet(pick(N),'Practice')));
  if(window.PhysicaMockTest)act.append(btn('rk-btn rk-alt','Mock test · 45 questions',()=>window.PhysicaMockTest.start(CH(),'neet')));
  view.append(h,tabs,pane,act)}

function formulas(p){const D=U();
  const t=el('div','rk-card');t.append(el('h3','','Dimensions to remember'));const g=el('div','rk-dims');for(const [q,d] of D.table){const r=el('div','rk-dim');r.append(el('span','',q),el('b','','['+d+']'));g.append(r)}t.append(g);p.append(t);
  for(const f of D.formulas){const c=el('div','rk-card');c.append(el('h3','',f.n),el('p','rk-formula',f.f),el('p','rk-how',f.how));if(f.ex){const e=el('p','rk-ex');e.append(el('b','','Example '),document.createTextNode(f.ex));c.append(e)}p.append(c)}}
function notes(p){for(const n of U().notes){const c=el('div','rk-card');c.append(el('h3','',n.h));const ul=el('ul','rk-list');for(const i of n.items)ul.append(el('li','',i));c.append(ul);p.append(c)}}
function asked(p){p.append(el('p','rk-lead','These question types come up again and again. Learn the three steps for each one.'));
  U().asked.forEach((a,i)=>{const c=el('div','rk-card');c.append(el('span','rk-num',String(i+1)),el('h3','',a.t),el('p','rk-how',a.what));const ol=el('ol','rk-steps');for(const s of a.steps)ol.append(el('li','',s));c.append(ol);
    const e=el('p','rk-ex');e.append(el('b','','Example '),document.createTextNode(a.ex));c.append(e,btn('rk-mini','Practise this type',()=>runSet(pick(TOPIC,a.tp),tname(a.tp))));p.append(c)})}

/* ---------- a set of questions ---------- */
function runSet(ids,title){if(!ids.length)return;ov.dataset.run='1';let k=0;const res=[];
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
function summary(res,title){ov.dataset.run='0';view.replaceChildren();ov.scrollTop=0;const n=res.length,ok=res.filter(r=>r.ok).length,alone=res.filter(r=>r.ok&&!r.hints).length;
  const c=el('div','rk-card rk-center');c.append(el('h3','',title+' · done'));const t=el('div','rk-tiles');
  for(const [v,l] of [[`${ok} / ${n}`,'Correct'],[alone,'Solved without help'],[n-ok,'To revise']]){const d=el('div','rk-tile');d.append(el('b','',String(v)),el('span','',l));t.append(d)}c.append(t);
  const wrong=[...new Set(res.filter(r=>!r.ok).map(r=>tname(r.q.tp)))];if(wrong.length){c.append(el('p','rk-note','Go back to the formulas for:'));for(const w of wrong)c.append(el('p','rk-meta','• '+w))}
  else if(n)c.append(el('p','rk-note','Clean set. Try the mock test next.'));
  const row=el('div','rk-two');row.append(btn('rk-btn','Back to the chapter',home));c.append(row);view.append(c)}

window.PhysicaRankNeet={open,close};
})();
