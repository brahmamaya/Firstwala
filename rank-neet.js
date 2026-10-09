/* Rank mode · NEET Physics. No simulations: a focused practice space built on the Physica NEET question banks.
   Three sections (Samjho / Practice / Revise) and one Continue button that builds today's session:
   recall of older mistakes (no notes) → new questions on the chapter → repair check with fresh variants.
   Help is a ladder inside each question; mistakes are saved with a reason and come back after 1, 3, 7 and 14 days.
   Everything stays on this device (localStorage). Loaded together with the tutor pack, only when the student opens NEET. */
(() => {
'use strict';
const KEY='physica-rank-neet',DAY=864e5,GAPS=[1,3,7,14],NEW=10,TOPIC=8;
const el=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
const btn=(c,x,f)=>{const b=el('button',c,x);b.type='button';if(f)b.addEventListener('click',f);return b};
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const PB=()=>window.PhysicaMockBank||{},bank=ch=>PB()[ch]?.neet||[],tname=(ch,tp)=>PB()[ch]?.topics?.[tp]||tp;
const CHS=()=>Object.keys(PB()).filter(c=>bank(c).length),short=c=>c.length>30?c.slice(0,29)+'…':c;
const KIND={recall:'Recall · no notes',new:'New question',repair:'Repair check · fresh variant'};
const ERR={c:'Concept unclear',s:'Start nahi hua',k:'Calculation / check'};
const THINK=[['Understand','What exactly is asked? What is given, implied, fixed or changing?'],['Represent','Which sketch, free-body diagram, circuit, graph or initial/final state makes it clear?'],['Choose','Which physical law connects the target to the known quantities, and are its conditions satisfied?'],['Plan','What intermediate quantity is needed? Which equation do you write first?'],['Execute','Keep units and signs consistent; simplify before putting in awkward numbers.'],['Check','Do the dimension, sign, size and physical behaviour of the answer make sense?']];

/* ---------- saved state (this device only) ---------- */
const blank=()=>({ch:'Motion in a Straight Line',tab:'practice',seen:{},st:{},tp:{},les:{},q:[],err:{c:0,s:0,k:0}});
let S=blank();
const num=v=>Number.isFinite(v)?v:0;
function load(){S=blank();try{const s=JSON.parse(localStorage.getItem(KEY));if(!s||typeof s!=='object')return;
  if(typeof s.ch==='string')S.ch=s.ch;if(['samjho','practice','revise'].includes(s.tab))S.tab=s.tab;
  for(const k in s.seen||{})if(Array.isArray(s.seen[k]))S.seen[k]=s.seen[k].filter(Number.isInteger);
  for(const k in s.st||{}){const o=s.st[k];S.st[k]={n:num(o.n),ok:num(o.ok),ind:num(o.ind),h:num(o.h)}}
  for(const k in s.tp||{}){const o=s.tp[k];S.tp[k]={n:num(o.n),ok:num(o.ok)}}
  for(const k in s.les||{}){const o=s.les[k];if(o&&typeof o==='object')S.les[k]={score:num(o.score),at:num(o.at)}}
  if(Array.isArray(s.q))S.q=s.q.filter(r=>r&&typeof r.ch==='string'&&typeof r.tp==='string'&&Number.isInteger(r.i)&&Number.isFinite(r.due)).map(r=>({ch:r.ch,tp:r.tp,i:r.i,due:r.due,stage:Math.max(0,Math.min(GAPS.length-1,num(r.stage)))})).slice(-80);
  if(s.err)for(const k of['c','s','k'])S.err[k]=num(s.err[k])}catch{}}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(S))}catch{}};
const dueNow=()=>S.q.filter(r=>r.due<=Date.now()&&bank(r.ch)[r.i]).sort((a,b)=>a.due-b.due);

/* ---------- picking questions ---------- */
function pickNew(ch,n,tp){const B=bank(ch),seen=new Set(S.seen[ch]||[]),ids=B.map((q,i)=>i).filter(i=>!tp||B[i].tp===tp),by={},out=[];
  for(const i of shuffle(ids.filter(i=>!seen.has(i))))(by[B[i].tp]=by[B[i].tp]||[]).push(i);
  const keys=shuffle(Object.keys(by));
  while(out.length<n&&keys.some(k=>by[k].length))for(const k of keys)if(by[k].length&&out.length<n)out.push(by[k].shift());
  if(out.length<n)out.push(...shuffle(ids.filter(i=>!out.includes(i))).slice(0,n-out.length));
  return out}
function fresh(ch,tp,not){const B=bank(ch),seen=new Set(S.seen[ch]||[]),same=B.map((q,i)=>i).filter(i=>B[i].tp===tp&&i!==not),un=same.filter(i=>!seen.has(i)),pool=un.length?un:same;
  return pool.length?pool[Math.floor(Math.random()*pool.length)]:not}

/* ---------- recording an answer ---------- */
function record(it,q,ok,hints){const ch=it.ch,st=S.st[ch]||(S.st[ch]={n:0,ok:0,ind:0,h:0}),tk=ch+'|'+q.tp,t=S.tp[tk]||(S.tp[tk]={n:0,ok:0}),now=Date.now();
  st.n++;if(ok)st.ok++;if(ok&&!hints)st.ind++;if(hints)st.h++;t.n++;if(ok)t.ok++;
  const seen=S.seen[ch]||(S.seen[ch]=[]);if(!seen.includes(it.i))seen.push(it.i);
  if(it.kind==='recall'&&it.ref){const r=it.ref;if(ok&&!hints){r.stage++;if(r.stage>=GAPS.length)S.q=S.q.filter(x=>x!==r);else r.due=now+GAPS[r.stage]*DAY}else{r.stage=0;r.due=now+DAY}}
  else if(!ok&&!S.q.some(r=>r.ch===ch&&r.tp===q.tp&&r.i===it.i))S.q.push({ch,tp:q.tp,i:it.i,due:now+DAY,stage:0});
  save()}

/* ---------- overlay shell ---------- */
let ov=null,view=null,onClose=null;
function close(){if(!ov)return;ov.remove();ov=null;view=null;document.body.classList.remove('rank-open');removeEventListener('keydown',esc);const f=onClose;onClose=null;f?.()}
function esc(e){if(e.key==='Escape'&&ov){if(ov.dataset.run==='1')home();else close()}}
function open(cb){if(ov)return;load();const cs=CHS();if(!cs.length)return;if(!cs.includes(S.ch))S.ch=cs[0];onClose=cb||null;
  ov=el('div','rank-ov rk-ov');ov.setAttribute('role','dialog');ov.setAttribute('aria-label','Rank mode: NEET Physics');ov.dataset.testid='rank-neet-page';
  const head=el('div','rk-head');const back=btn('rk-back','← Back',()=>{if(ov.dataset.run==='1')home();else close()});back.dataset.testid='rk-back';
  const t=el('div','rk-title');t.append(el('b','','Rank mode'),el('span','','NEET · Physics'));head.append(back,t);
  const wrap=el('div','rk-wrap');view=el('div','rk-view');wrap.append(view);ov.append(head,wrap);document.body.append(ov);document.body.classList.add('rank-open');addEventListener('keydown',esc);home();back.focus()}

/* ---------- home: stats, Continue, Samjho / Practice / Revise ---------- */
function home(){if(!view)return;ov.dataset.run='0';view.replaceChildren();ov.scrollTop=0;const ch=S.ch,B=bank(ch),st=S.st[ch]||{n:0,ok:0,ind:0,h:0},due=dueNow().length,seen=(S.seen[ch]||[]).length;
  const sel=el('select','rk-sel');sel.setAttribute('aria-label','Chapter');sel.dataset.testid='rk-chapter';
  const cs=CHS(),g11=el('optgroup'),g12=el('optgroup');g11.label='Class 11';g12.label='Class 12';
  cs.forEach((c,i)=>{const o=el('option','',c);o.value=c;o.selected=c===ch;(i<14?g11:g12).append(o)});sel.append(g11,g12);
  sel.addEventListener('change',()=>{S.ch=sel.value;save();home()});
  const tiles=el('div','rk-tiles');for(const [v,l] of [[due,'To revise now'],[`${seen} / ${B.length}`,'Chapter progress'],[st.n?Math.round(100*st.ind/st.n)+'%':'—','Solved without help'],[st.h,'Questions with help']]){const d=el('div','rk-tile');d.append(el('b','',String(v)),el('span','',l));tiles.append(d)}
  const go=btn('rk-go',null,session);go.dataset.testid='rk-continue';go.append(el('b','','Continue'),el('small','',`${due?Math.min(3,due)+' to revise · ':''}${NEW} questions · ${short(ch)}`));
  const tabs=el('div','rk-tabs');tabs.setAttribute('role','tablist');
  for(const [k,l] of [['samjho','Samjho'],['practice','Practice'],['revise','Revise']]){const b=btn('rk-tab',l,()=>{S.tab=k;save();home()});b.setAttribute('role','tab');b.setAttribute('aria-selected',String(S.tab===k));b.dataset.testid='rk-tab-'+k;tabs.append(b)}
  const pane=el('div','rk-pane');({samjho,practice,revise})[S.tab](pane);
  view.append(sel,tiles,go,tabs,pane)}

function samjho(p){const c=el('div','rk-card');c.append(el('h3','','How to think about any question'),el('p','rk-note','Practise this routine until it becomes automatic. It is not a magic algorithm for every question.'));
  const ol=el('ol','rk-steps');for(const [a,b] of THINK){const li=el('li');li.append(el('b','',a),el('span','',' '+b));ol.append(li)}c.append(ol);p.append(c);
  const ls=window.PhysicaRankLessons?.[S.ch]||{},t=el('div','rk-card');t.append(el('h3','','Topics in this chapter'),
    el('p','rk-note',Object.keys(ls).length?'Each lesson takes about 10 minutes: idea, formula with its conditions, one explained example, one for you to complete, and three checks.':'Concept lessons are being written chapter by chapter. Until a lesson is ready, learn each topic by solving: use the help ladder inside the questions.'));
  const topics=PB()[S.ch].topics||{};for(const k of Object.keys(topics)){const s0=S.tp[S.ch+'|'+k],ld=S.les[S.ch+'|'+k],row=el('div','rk-row');
    row.append(el('span','',topics[k]),el('small','',ld?`✓ lesson ${ld.score}/3`:ls[k]?'lesson ready':s0?`${s0.ok} / ${s0.n} right`:'not tried'));
    if(ls[k]){const b=btn('rk-mini rk-learn',ld?'Review':'Learn',()=>lesson(k));b.dataset.testid='rk-learn-'+k;row.append(b)}
    row.append(btn('rk-mini','Practise',()=>topicSet(k)));t.append(row)}
  p.append(t)}
function practice(p){const ch=S.ch,B=bank(ch);
  const a=el('div','rk-card');a.append(el('h3','','Question set'),el('p','rk-note',`${NEW} questions on this chapter. New questions come first; the topics are mixed so you choose the method.`),btn('rk-btn',`Start ${NEW} questions`,()=>runPlain(pickNew(ch,NEW).map(i=>({kind:'new',ch,i})),'Chapter practice')));
  const b=el('div','rk-card');b.append(el('h3','','By topic'));const chips=el('div','rk-chips');for(const [k,n] of Object.entries(PB()[ch].topics||{}))chips.append(btn('rk-chip',n,()=>topicSet(k)));b.append(chips);
  const m=el('div','rk-card');m.append(el('h3','','Chapter mock test'),el('p','rk-note',`${B.length} NEET questions with a timer, marking (+4 / −1) and a report. Take it after you can solve on your own.`));
  if(window.PhysicaMockTest)m.append(btn('rk-btn rk-alt','Start mock test',()=>window.PhysicaMockTest.start(ch,'neet')));p.append(a,b,m)}
function revise(p){const due=dueNow(),c=el('div','rk-card');c.append(el('h3','',due.length?`${due.length} to revise now`:'Nothing to revise right now'),
  el('p','rk-note','Questions you got wrong return after 1, 3, 7 and 14 days. You answer a fresh question on the same topic without notes.'));
  if(due.length)c.append(btn('rk-btn','Revise now',()=>runPlain(due.slice(0,8).map(r=>({kind:'recall',ch:r.ch,i:fresh(r.ch,r.tp,r.i),ref:r})),'Revise')));
  else{const next=S.q.map(r=>r.due).sort((a,b)=>a-b)[0];if(next)c.append(el('p','rk-note',`Next review: ${new Date(next).toLocaleDateString()}`))}
  p.append(c);
  const tot=S.err.c+S.err.s+S.err.k,e=el('div','rk-card');e.append(el('h3','','Why you lose marks'));
  if(!tot)e.append(el('p','rk-note','After a wrong answer, tell us what went wrong. The pattern shows here.'));else for(const k of['c','s','k']){const r=el('div','rk-row');r.append(el('span','',ERR[k]),el('b','',String(S.err[k])));e.append(r)}
  const weak=Object.entries(S.tp).filter(([k,v])=>v.n>=2&&v.ok/v.n<.7&&bank(k.split('|')[0]).length).sort((a,b)=>a[1].ok/a[1].n-b[1].ok/b[1].n).slice(0,4);
  if(weak.length){e.append(el('h3','rk-sub','Topics to strengthen'));for(const [k,v] of weak){const [c2,tp]=k.split('|'),r=el('div','rk-row');r.append(el('span','',`${tname(c2,tp)} · ${short(c2)}`),el('small','',`${v.ok} / ${v.n}`));e.append(r)}}
  p.append(e);
  p.append(btn('rk-link rk-clear','Clear my Rank mode progress',()=>{if(confirm('Clear all your Rank mode progress on this device?')){try{localStorage.removeItem(KEY)}catch{}const c0=S.ch;S=blank();S.ch=c0;home()}}))}

/* ---------- running sets of questions ---------- */
function topicSet(tp){const ch=S.ch;runPlain(pickNew(ch,TOPIC,tp).map(i=>({kind:'new',ch,i})),tname(ch,tp))}
function runPlain(items,title){if(!items.length)return;run(items,title,res=>summary(res,title))}
function session(){const ch=S.ch,due=dueNow().slice(0,3);
  const items=[...due.map(r=>({kind:'recall',ch:r.ch,i:fresh(r.ch,r.tp,r.i),ref:r})),...pickNew(ch,NEW).map(i=>({kind:'new',ch,i}))];
  run(items,"Today's session",res=>{const wrong=res.filter(r=>!r.ok&&r.it.kind!=='repair').slice(0,3);
    if(!wrong.length)return summary(res,"Today's session");
    // repair step: one fresh variant for each topic that went wrong
    view.replaceChildren();const c=el('div','rk-card rk-center');c.append(el('h3','','Repair check'),el('p','rk-note',`You missed ${wrong.length} question${wrong.length>1?'s':''}. Now ${wrong.length===1?'one fresh question':wrong.length+' fresh questions'} on the same ${wrong.length===1?'topic':'topics'}, to see if the gap is closed.`));
    const row=el('div','rk-two');row.append(btn('rk-btn','Start repair check',()=>run(wrong.map(r=>({kind:'repair',ch:r.it.ch,i:fresh(r.it.ch,r.q.tp,r.it.i)})),'Repair check',r2=>summary([...res,...r2],"Today's session"))),btn('rk-btn rk-alt','Skip',()=>summary(res,"Today's session")));c.append(row);view.append(c)})}
function run(items,title,done){ov.dataset.run='1';let k=0;const res=[];ov.scrollTop=0;
  const finish=()=>done(res),show=()=>{if(k>=items.length)return finish();
    const it=items[k],q=bank(it.ch)[it.i];view.replaceChildren();ov.scrollTop=0;
    const top=el('div','rk-qtop');top.append(el('span','rk-chip on',KIND[it.kind]),el('span','rk-count',`${k+1} / ${items.length}`),btn('rk-link','End',finish));
    const bar=el('div','rk-bar'),fill=el('i');fill.style.width=(k/items.length*100)+'%';bar.append(fill);
    const card=el('div','rk-card');card.append(el('p','rk-meta',`${short(it.ch)} · ${tname(it.ch,q.tp)}`),el('p','rk-q',q.q));{const g=window.PhysicaFig?.(q.fig);if(g){g.classList.add('rk-fig');card.append(g)}}
    const order=shuffle([0,1,2,3]),opts=el('div','rk-opts'),hintBox=el('div','rk-hint'),fb=el('div','rk-fb'),lines=String(q.s||'').split('\n').filter(Boolean);
    hintBox.hidden=true;fb.hidden=true;let answered=false,hl=0;
    const H=[`Topic: ${tname(it.ch,q.tp)}. Write what is given, what is asked, and which law connects them.`,lines.length>1?`First step: ${lines[0]}`:'Check which condition must hold for the law you chose, then try again.'];
    const hintBtn=btn('rk-hintbtn','Help me start',()=>{if(answered)return;hl++;hintBox.hidden=false;hintBox.replaceChildren();for(let n=0;n<Math.min(hl,2);n++)hintBox.append(el('p','',H[n]));
      if(hl>=3){hintBox.append(el('b','','Solution'));for(const l of lines)hintBox.append(el('p','',l))}hintBtn.textContent=hl===1?'Another hint':hl===2?'Show solution':'Solution shown';if(hl>=3)hintBtn.disabled=true});
    hintBtn.dataset.testid='rk-hint';
    const next=btn('rk-btn',k+1<items.length?'Next →':'Finish',()=>{k++;show()});next.hidden=true;next.dataset.testid='rk-next';
    order.forEach((oi,pos)=>{const b=btn('rk-opt',null,()=>{if(answered)return;answered=true;const ok=oi===q.c;b.classList.add(ok?'right':'wrong');if(!ok)opts.children[order.indexOf(q.c)].classList.add('right');
      for(const x of opts.children)x.disabled=true;hintBtn.hidden=true;fb.hidden=false;fb.append(el('p',ok?'rk-ok':'rk-no',ok?(hl?'Correct — with help.':'Correct!'):'Not quite.'));
      for(const l of lines)fb.append(el('p','rk-sol',l));
      const r={it,q,ok,hints:hl,err:null};res.push(r);record(it,q,ok,hl);
      if(!ok){const w=el('div','rk-why');w.append(el('span','','What went wrong?'));for(const key of['c','s','k']){const c=btn('rk-chip',ERR[key],()=>{if(r.err)return;r.err=key;S.err[key]++;save();for(const x of w.querySelectorAll('.rk-chip'))x.disabled=true;c.classList.add('on')});c.dataset.testid='rk-err-'+key;w.append(c)}fb.append(w)}
      next.hidden=false;next.focus()});b.append(el('span','rk-l','ABCD'[pos]),el('span','rk-t',q.o[oi]));b.dataset.testid='rk-opt';b.dataset.correct=String(oi===q.c);opts.append(b)});
    card.append(opts,hintBtn,hintBox,fb);view.append(top,bar,card,next)};
  show()}

/* ---------- Samjho lesson player ---------- */
function lesson(tp){const ch=S.ch,D=window.PhysicaRankLessons?.[ch]?.[tp];if(!D)return;ov.dataset.run='1';let pg=0,score=0,ci=0,answered=false;
  const PAGES=['Idea','Formula','Example','Your turn','Check'],KINDS={predict:'Predict',first:'First step',change:'Changed condition'};
  const steps=a=>{const ol=el('ol','rk-steps rk-ex');for(const [x,y] of a){const li=el('li');li.append(el('b','',x),el('span','',' '+y));ol.append(li)}return ol};
  const fig=f=>{const g=f&&window.PhysicaFig?.(f);if(g)g.classList.add('rk-fig');return g||null};
  // a multiple-choice block with instant feedback; cb(ok) runs once
  const mcq=(host,m,cb)=>{const order=shuffle([0,1,2,3]),opts=el('div','rk-opts'),fb=el('div','rk-fb');fb.hidden=true;
    order.forEach((oi,pos)=>{const b=btn('rk-opt',null,()=>{if(opts.dataset.done)return;opts.dataset.done='1';const ok=oi===m.c;b.classList.add(ok?'right':'wrong');if(!ok)opts.children[order.indexOf(m.c)].classList.add('right');for(const x of opts.children)x.disabled=true;
      fb.hidden=false;fb.append(el('p',ok?'rk-ok':'rk-no',ok?'Correct!':'Not quite.'),el('p','rk-sol',m.why||m.s));cb(ok)});b.append(el('span','rk-l','ABCD'[pos]),el('span','rk-t',m.o[oi]));b.dataset.testid='rk-lopt';b.dataset.correct=String(oi===m.c);opts.append(b)});
    host.append(opts,fb)};
  const show=()=>{view.replaceChildren();ov.scrollTop=0;answered=false;
    const top=el('div','rk-qtop');top.append(el('span','rk-chip on','Samjho'),el('b','rk-ltitle',D.title));
    const dots=el('div','rk-dots');PAGES.forEach((n,i)=>{const d=el('span','rk-dot'+(i<pg?' done':i===pg?' now':''));d.title=n;dots.append(d)});
    const card=el('div','rk-card');card.append(el('h3','',PAGES[pg]));
    const nav=el('div','rk-two'),next=btn('rk-btn','Next →',()=>{pg++;show()});next.dataset.testid='rk-lnext';
    const prev=btn('rk-btn rk-alt','← Back',()=>{pg--;show()});
    if(pg===0){for(const t of D.idea)card.append(el('p','rk-para',t));const w=el('div','rk-trap');w.append(el('b','','Watch out'),el('span','',' '+D.trap));card.append(w)}
    else if(pg===1){for(const [a,b] of D.rules){const r=el('div','rk-rule');r.append(el('b','',a),el('span','',b));card.append(r)}
      const v=el('div','rk-vi');const g=el('div','rk-valid');g.append(el('h4','','Valid'));for(const t of D.valid)g.append(el('p','',t));const n=el('div','rk-invalid');n.append(el('h4','','Not valid'));for(const t of D.invalid)n.append(el('p','',t));v.append(g,n);card.append(v)}
    else if(pg===2){card.append(el('p','rk-q',D.example.q));const f=fig(D.example.fig);if(f)card.append(f);card.append(steps(D.example.steps),el('p','rk-ans','Answer: '+D.example.ans))}
    else if(pg===3){card.append(el('p','rk-note','Now you finish one. The first steps are done for you.'),el('p','rk-q',D.partial.q));const f=fig(D.partial.fig);if(f)card.append(f);card.append(steps(D.partial.steps),el('p','rk-q rk-ask',D.partial.ask.p));
      next.disabled=true;mcq(card,D.partial.ask,()=>{card.append(el('p','rk-ans','Answer: '+D.partial.ans));next.disabled=false;next.focus()})}
    else{const c=D.checks[ci];card.append(el('span','rk-chip on',`${KINDS[c.k]} · ${ci+1} / ${D.checks.length}`),el('p','rk-q',c.q));
      const nx=btn('rk-btn',ci+1<D.checks.length?'Next check →':'Finish',()=>{ci++;if(ci>=D.checks.length)return done();show()});nx.hidden=true;nx.dataset.testid='rk-lcheck-next';
      mcq(card,c,ok=>{if(ok)score++;nx.hidden=false;nx.focus()});view.append(top,dots,card,nx);return}
    if(pg>0)nav.append(prev);if(pg<PAGES.length-1)nav.append(next);view.append(top,dots,card,nav)};
  const done=()=>{S.les[ch+'|'+tp]={score,at:Date.now()};save();view.replaceChildren();ov.dataset.run='0';const c=el('div','rk-card rk-center');c.append(el('h3','',D.title+' · lesson done'));
    const t=el('div','rk-tiles rk-tiles2');const d=el('div','rk-tile');d.append(el('b','',`${score} / ${D.checks.length}`),el('span','','Checks right'));t.append(d);c.append(t,
      el('p','rk-note',score===D.checks.length?'All three checks right. Now practise the topic on fresh questions.':'Re-read the formula page and the example, then practise the topic. The questions will tell you if the gap is closed.'));
    const row=el('div','rk-two');row.append(btn('rk-btn','Practise this topic',()=>topicSet(tp)),btn('rk-btn rk-alt','Back to topics',home));c.append(row);view.append(c)};
  show()}

/* ---------- end of a set ---------- */
function summary(res,title){ov.dataset.run='0';view.replaceChildren();ov.scrollTop=0;const n=res.length,ok=res.filter(r=>r.ok).length,ind=res.filter(r=>r.ok&&!r.hints).length,help=res.filter(r=>r.hints).length;
  const c=el('div','rk-card rk-center');c.append(el('h3','',title+' · done'));
  const tiles=el('div','rk-tiles');for(const [v,l] of [[`${ok} / ${n}`,'Correct'],[ind,'Solved without help'],[help,'Used help'],[n-ok,'To revisit']]){const d=el('div','rk-tile');d.append(el('b','',String(v)),el('span','',l));tiles.append(d)}
  c.append(tiles);
  const wrong=res.filter(r=>!r.ok);if(wrong.length){c.append(el('p','rk-note','These questions will come back in Revise (tomorrow, then after 3, 7 and 14 days).'));const seen=new Set();for(const r of wrong){const t=tname(r.it.ch,r.q.tp);if(seen.has(t))continue;seen.add(t);c.append(el('p','rk-meta','• '+t))}}
  else if(n)c.append(el('p','rk-note','Clean set. Mixed practice and a timed mock are the next step.'));
  const row=el('div','rk-two');row.append(btn('rk-btn','Back to Rank mode',home));c.append(row);view.append(c)}

window.PhysicaRankNeet={open,close};
})();
