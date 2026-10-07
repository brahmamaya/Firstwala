/* Physica Mock - timed chapter tests in the JEE Main and NEET pattern (questions in tutor-exam.js).
   While a test runs, the whole tab shows only the paper and the timer: no tutor, no hints, no voice. The test submits
   itself when the time is up (the student may submit earlier) and only then shows the result: score, topic-wise
   performance and every question with its solution. The report can be saved as a PDF with the student's name.
   Everything stays on this device; a running test survives a page reload. */
(() => {
'use strict';
const LIVE='physica-mock-live',SAVED='physica-mock',PAT={jee:{name:'JEE Main',per:2.4},neet:{name:'NEET',per:1}};
const bank=(ch,k)=>window.PhysicaMockBank?.[ch]?.[k];
const get=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}};
const put=(k,v)=>{try{v==null?localStorage.removeItem(k):localStorage.setItem(k,JSON.stringify(v))}catch{}};
const el=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
const btn=(c,x,f)=>{const b=el('button',c,x);b.type='button';b.addEventListener('click',f);return b};
const mins=(k,n)=>Math.round(n*PAT[k].per);
const mmss=ms=>{const s=Math.max(0,Math.ceil(ms/1000));return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`};
// options appear in a fresh order in every attempt, so an answer key cannot be learnt by position
const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
let box=null,tick=0;

// the test covers the whole tab; keys typed in it never reach the experiment's shortcuts
function shell(){if(!box){box=el('div','mock');box.setAttribute('role','dialog');box.setAttribute('aria-modal','true');box.addEventListener('keydown',e=>e.stopPropagation());document.body.append(box)}
  document.body.classList.add('mock-on');window.speechSynthesis?.cancel();box.replaceChildren();box.scrollTop=0;return box}
function close(){const k=box?.dataset.k;clearInterval(tick);box?.remove();box=null;document.body.classList.remove('mock-on');window.PhysicaWake?.();dispatchEvent(new CustomEvent('physica-mock-close',{detail:k}))}

function intro(ch,k){const set=bank(ch,k);if(!set)return;const b=shell();b.dataset.k=k;const n=set.length,mcq=set.filter(q=>q.o).length,num=n-mcq,p=el('div','mock-paper');
  const rules=el('ul','mock-rules');
  for(const t of [`${n} questions${num?` (${mcq} MCQ + ${num} numerical)`:''} · ${mins(k,n)} minutes`,
    '+4 for a correct answer, −1 for a wrong one, 0 if left blank.',
    'No hints. The result appears only after you submit.',
    'The test submits itself when the time is up. You can also submit earlier.'])rules.append(el('li','',t));
  const name=el('input','mock-name');name.maxLength=40;name.autocomplete='name';name.value=get('physica-learner',{}).name||'';name.placeholder='Your name';name.setAttribute('aria-label',name.placeholder);
  const start=()=>{const nm=name.value.trim();if(!nm){name.classList.add('need');name.focus();return}const pr=get('physica-learner',{});pr.name=nm;put('physica-learner',pr);
    const now=Date.now();put(LIVE,{ch,k,name:nm,start:now,end:now+mins(k,n)*60000,ans:Array(n).fill(null),cur:0,order:set.map(q=>q.o&&shuffle(q.o.map((_,j)=>j)))});test()};
  name.addEventListener('keydown',e=>{if(e.key==='Enter')start()});
  const row=el('div','mock-row');row.append(btn('mock-go','Start test',start),btn('mock-nav','Cancel',close));
  p.append(el('h2','',`${PAT[k].name} ${'mock test'}`),el('p','mock-sub',ch),rules,el('label','mock-lbl','Your name (printed on the report)'),name,row);b.append(p);name.focus()}

function test(){const S=get(LIVE,null),set=S&&bank(S.ch,S.k);if(!set||!Array.isArray(S.ans)||S.ans.length!==set.length){put(LIVE,null);return close()}
  if(Date.now()>=S.end)return submit(S);
  const b=shell();b.dataset.k=S.k;const head=el('div','mock-head'),clock=el('b','mock-clock'),main=el('div','mock-q'),foot=el('div','mock-row'),pal=el('div','mock-pal'),ask=el('div','mock-ask');ask.hidden=true;
  const save=()=>put(LIVE,S),done=()=>S.ans.filter(a=>a!=null).length;
  head.append(el('span','mock-title',`${PAT[S.k].name} · ${S.ch}`),clock,btn('mock-submit','Submit',()=>{ask.replaceChildren(el('p','',`Submit the test? You have answered ${done()} of ${set.length}.`),
    btn('mock-go','Yes, submit',()=>submit(S)),btn('mock-nav','Back to the test',()=>{ask.hidden=true}));ask.hidden=false}));
  const paint=()=>{pal.replaceChildren();set.forEach((_,j)=>{const x=btn('mock-pn'+(S.ans[j]!=null?' done':'')+(j===S.cur?' cur':''),String(j+1),()=>show(j));x.setAttribute('aria-label',`${'Question'} ${j+1}${S.ans[j]!=null?' ✓':''}`);pal.append(x)})};
  const show=i=>{S.cur=i;save();const q=set[i];main.replaceChildren();
    main.append(el('p','mock-num',`${'Question'} ${i+1} / ${set.length}${S.k==='jee'?` · ${q.o?'Section A · MCQ':'Section B · Numerical'}`:''}`),el('p','mock-text',q.q));
    if(q.o){const opts=el('div','mock-opts');(S.order?.[i]||q.o.map((_,j)=>j)).forEach((j,pos)=>{const x=btn('mock-opt',`(${pos+1}) ${q.o[j]}`,()=>{S.ans[i]=j;save();show(i)});x.setAttribute('aria-pressed',String(S.ans[i]===j));opts.append(x)});main.append(opts)}
    else{const inp=el('input','mock-in');inp.inputMode='decimal';inp.placeholder='Type your answer (a number)';inp.setAttribute('aria-label',inp.placeholder);inp.value=S.ans[i]??'';
      inp.addEventListener('input',()=>{inp.value=inp.value.replace(/[^0-9.\-]/g,'');const v=inp.value;S.ans[i]=v===''?null:v;save();paint()});main.append(inp)}
    if(S.ans[i]!=null)main.append(btn('mock-clear','Clear answer',()=>{S.ans[i]=null;save();show(i)}));
    paint();b.scrollTop=0};
  foot.append(btn('mock-nav','◀ '+'Previous',()=>show(Math.max(0,S.cur-1))),btn('mock-nav','Next'+' ▶',()=>show(Math.min(set.length-1,S.cur+1))));
  const tickF=()=>{const left=S.end-Date.now();clock.textContent='⏱ '+mmss(left);clock.classList.toggle('low',left<=300000);if(left<=0)submit(S)};
  b.append(head,ask,main,foot,pal);show(Math.min(S.cur||0,set.length-1));clearInterval(tick);tick=setInterval(tickF,1000);tickF()}

function submit(S){clearInterval(tick);const set=bank(S.ch,S.k);put(LIVE,null);if(!set)return close();
  const res=set.map((q,i)=>{const a=S.ans[i];if(a==null||a==='')return 's';return q.o?(a===q.c?'c':'w'):(Math.abs(parseFloat(a)-q.n)<=.01?'c':'w')});
  const r={ch:S.ch,k:S.k,name:S.name,at:Date.now(),used:Math.min(Date.now(),S.end)-S.start,ans:S.ans,res};
  put(SAVED,[r,...get(SAVED,[])].slice(0,20));report(r)}

function report(r){const set=bank(r.ch,r.k),topics=window.PhysicaMockBank?.[r.ch]?.topics||{};if(!set)return;
  const b=shell();b.dataset.k=r.k;const p=el('div','mock-paper mock-report'),n=x=>r.res.filter(y=>y===x).length,c=n('c'),w=n('w'),s=n('s');
  p.append(el('p','mock-brand',`Physica · ${'Mock test report'}`),el('h2','',r.name),
    el('p','mock-sub',`${PAT[r.k].name} ${'mock'} · ${r.ch} · ${new Date(r.at).toLocaleString()} · ${'Time taken'} ${mmss(r.used)}`));
  const stats=el('div','mock-stats');
  for(const [t,v] of [['Score',`${4*c-w} / ${4*set.length}`],['Correct',c],['Wrong',w],['Skipped',s],['Accuracy',c+w?`${Math.round(100*c/(c+w))}%`:'-']]){const d=el('div','');d.append(el('b','',String(v)),el('span','',t));stats.append(d)}
  // topic-wise: marks per topic, and the topics below half marks to revise
  const tab=el('table','mock-table'),hr=el('tr'),weak=[];
  for(const h of ['Topic','Correct','Wrong','Skipped','Marks'])hr.append(el('th','',h));tab.append(hr);
  const keys=[...new Set(set.map(q=>q.tp))];
  for(const tp of keys){const idx=set.map((q,i)=>q.tp===tp?i:-1).filter(i=>i>=0),cc=idx.filter(i=>r.res[i]==='c').length,ww=idx.filter(i=>r.res[i]==='w').length,mk=4*cc-ww,name=topics[tp]||tp;
    if(mk<2*idx.length)weak.push(name);const tr=el('tr');for(const v of [name,cc,ww,idx.length-cc-ww,`${mk} / ${4*idx.length}`])tr.append(el('td','',String(v)));tab.append(tr)}
  p.append(stats,el('h3','','Topic-wise performance'),tab,
    el('p','mock-weak',weak.length?`Revise: ${weak.join(', ')}`:'Well done - no weak topic in this test.'),
    el('h3','','Question review'));
  const fmt=(q,a)=>a==null||a===''?'not answered':q.o?q.o[a]:String(a);
  set.forEach((q,i)=>{const res=r.res[i],d=el('div','mock-rv '+res);
    d.append(el('p','mock-text',`${i+1}. ${res==='c'?'✓':res==='w'?'✗':'–'} ${q.q}`),el('p','',`${'Your answer'}: ${fmt(q,r.ans[i])} · ${'Correct'}: ${fmt(q,q.o?q.c:q.n)}`),el('p','mock-sol',q.s));p.append(d)});
  const row=el('div','mock-row mock-noprint');
  row.append(btn('mock-go','⬇ '+'Download PDF',()=>{const t=document.title;document.title=`Physica ${PAT[r.k].name} report - ${r.name} - ${r.ch}`;addEventListener('afterprint',()=>{document.title=t},{once:true});window.print()}),btn('mock-nav','Close',close));
  p.append(row);b.append(p)}

window.PhysicaMockTest={start:intro,open:report,past:(ch,k)=>get(SAVED,[]).filter(r=>r.ch===ch&&r.k===k),info:(ch,k)=>{const set=bank(ch,k);return set&&{name:PAT[k].name,n:set.length,min:mins(k,set.length)}}};
// a test that was running when the page closed carries on (or submits, if its time ran out meanwhile)
if(get(LIVE,null))test();
})();
