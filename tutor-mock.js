/* Physica Mock - timed chapter tests in the JEE Main and NEET pattern (questions in tutor-exam.js).
   While a test runs, the whole tab shows only the paper and the timer: no tutor, no hints, no voice. The test submits
   itself when the time is up (the student may submit earlier) and only then shows the result: score, topic-wise
   performance and every question with its solution. The report can be saved as a PDF with the student's name.
   Everything stays on this device; a running test survives a page reload. The questions (tutor-exam.js) are a separate
   pack, fetched by PhysicaLoadExam only when they are needed. */
(() => {
'use strict';
const LIVE='physica-mock-live',SAVED='physica-mock',PAT={jee:{name:'JEE Main',per:2.4},neet:{name:'NEET',per:1}};
// JEE papers put the MCQs (section A) before the numerical questions (section B)
const bank=(ch,k)=>{const q=window.PhysicaMockBank?.[ch]?.[k];return q&&(k==='jee'?[...q.filter(x=>x.o),...q.filter(x=>!x.o)]:q)};
const get=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}};
const put=(k,v)=>{try{v==null?localStorage.removeItem(k):localStorage.setItem(k,JSON.stringify(v))}catch{}};
const el=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
const btn=(c,x,f)=>{const b=el('button',c,x);b.type='button';b.addEventListener('click',f);return b};
const mins=(k,n)=>Math.round(n*PAT[k].per);
const mmss=ms=>{const s=Math.max(0,Math.ceil(ms/1000));return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`};
// options appear in a fresh order in every attempt, so an answer key cannot be learnt by position
const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
// Diagrams are small drawings kept as data: {w,h,alt,d:[item...]} with items
//   ['l',x1,y1,x2,y2,opt] line   ['p',pathData,opt] path   ['c',cx,cy,r,opt] circle   ['r',x,y,w,h,opt] box
//   ['t',x,y,text,opt] label.   opt letters: d dashed, a arrow at the end, b arrows at both ends, f light fill,
//   F solid fill, B thick, m centred text, e right-aligned text, s small text. Drawn with DOM calls (no HTML strings).
const SVG='http://www.w3.org/2000/svg',num=v=>typeof v==='number'&&isFinite(v),PATH=/^[MLHVCSQTAZmlhvcsqtaz0-9.,\s-]+$/;let figN=0;
function fig(f){if(!f||!Array.isArray(f.d))return null;
  const mk=(t,o)=>{const e=document.createElementNS(SVG,t);for(const k in o)e.setAttribute(k,o[k]);return e},w=num(f.w)?f.w:240,h=num(f.h)?f.h:140,id='pf'+(++figN);
  const s=mk('svg',{viewBox:`0 0 ${w} ${h}`,class:'fig',role:'img','aria-label':String(f.alt||'Diagram')}),defs=mk('defs',{}),m=mk('marker',{id,viewBox:'0 0 10 10',refX:'9',refY:'5',markerWidth:'7',markerHeight:'7',orient:'auto-start-reverse'});
  m.append(mk('path',{d:'M0 0L10 5L0 10z',fill:'currentColor',stroke:'none'}));defs.append(m);s.append(defs);
  for(const it of f.d){if(!Array.isArray(it))continue;const [t,...a]=it,n={l:4,c:3,r:4,t:2,p:0}[t];if(n===undefined||!a.slice(0,n).every(num))continue;
    const opt=String(a[t==='p'?1:t==='t'?3:n]||''),st={stroke:'currentColor',fill:opt.includes('F')?'currentColor':opt.includes('f')?'currentColor':'none','stroke-width':opt.includes('B')?'2.6':'1.6','stroke-linecap':'round','stroke-linejoin':'round'};
    if(opt.includes('f'))st['fill-opacity']='.16';if(opt.includes('d'))st['stroke-dasharray']='5 4';if(opt.includes('a')||opt.includes('b'))st['marker-end']=`url(#${id})`;if(opt.includes('b'))st['marker-start']=`url(#${id})`;
    let e;
    if(t==='l')e=mk('line',{x1:a[0],y1:a[1],x2:a[2],y2:a[3],...st});
    else if(t==='c')e=mk('circle',{cx:a[0],cy:a[1],r:a[2],...st});
    else if(t==='r')e=mk('rect',{x:a[0],y:a[1],width:a[2],height:a[3],...st});
    else if(t==='p'){if(typeof a[0]!=='string'||!PATH.test(a[0]))continue;e=mk('path',{d:a[0],...st})}
    else{e=mk('text',{x:a[0],y:a[1],fill:'currentColor',stroke:'none','font-size':opt.includes('s')?'10':'12','text-anchor':opt.includes('m')?'middle':opt.includes('e')?'end':'start'});e.textContent=String(a[2]??'')}
    s.append(e)}
  return s}
window.PhysicaFig=fig;
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
    main.append(el('p','mock-num',`${'Question'} ${i+1} / ${set.length}${S.k==='jee'?` · ${q.o?'Section A · MCQ':'Section B · Numerical'}`:''}`),el('p','mock-text',q.q));{const g=fig(q.fig);if(g)main.append(g)}
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

function report(r){const now=bank(r.ch,r.k),topics=window.PhysicaMockBank?.[r.ch]?.topics||{};if(!now)return;
  // a report from before the question set grew keeps its score; its question-by-question part cannot be rebuilt
  const same=now.length===r.res.length,set=same?now:r.res.map(()=>({}));
  const b=shell();b.dataset.k=r.k;const p=el('div','mock-paper mock-report'),n=x=>r.res.filter(y=>y===x).length,c=n('c'),w=n('w'),s=n('s');
  p.append(el('p','mock-brand',`Physica · ${'Mock test report'}`),el('h2','',r.name),
    el('p','mock-sub',`${PAT[r.k].name} ${'mock'} · ${r.ch} · ${new Date(r.at).toLocaleString()} · ${'Time taken'} ${mmss(r.used)}`));
  const stats=el('div','mock-stats');
  for(const [t,v] of [['Score',`${4*c-w} / ${4*set.length}`],['Correct',c],['Wrong',w],['Skipped',s],['Accuracy',c+w?`${Math.round(100*c/(c+w))}%`:'-']]){const d=el('div','');d.append(el('b','',String(v)),el('span','',t));stats.append(d)}
  if(!same){p.append(stats,el('p','mock-weak','This test was taken with an earlier, shorter question set, so the topic-wise table and question review are not available.'));const row=el('div','mock-row mock-noprint');row.append(btn('mock-nav','Close',close));p.append(row);b.append(p);return}
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
    d.append(el('p','mock-text',`${i+1}. ${res==='c'?'✓':res==='w'?'✗':'–'} ${q.q}`),...[fig(q.fig)].filter(Boolean),el('p','',`${'Your answer'}: ${fmt(q,r.ans[i])} · ${'Correct'}: ${fmt(q,q.o?q.c:q.n)}`),el('p','mock-sol',q.s));p.append(d)});
  const row=el('div','mock-row mock-noprint');
  row.append(btn('mock-go','⬇ '+'Download PDF',()=>{const t=document.title;document.title=`Physica ${PAT[r.k].name} report - ${r.name} - ${r.ch}`;addEventListener('afterprint',()=>{document.title=t},{once:true});window.print()}),btn('mock-nav','Close',close));
  p.append(row);b.append(p)}

window.PhysicaMockTest={start:intro,open:report,past:(ch,k)=>get(SAVED,[]).filter(r=>r.ch===ch&&r.k===k),info:(ch,k)=>{const set=bank(ch,k);return set&&{name:PAT[k].name,n:set.length,min:mins(k,set.length)}}};
// a test that was running when the page closed carries on (or submits, if its time ran out meanwhile)
let examWait=null;
window.PhysicaLoadExam=()=>window.PhysicaExam?Promise.resolve():examWait||(examWait=new Promise((ok,no)=>{const s=el('script');s.src='__EXAM_URL__';s.async=true;s.onload=ok;s.onerror=()=>{examWait=null;s.remove();no()};document.head.append(s)}));
if(get(LIVE,null))window.PhysicaLoadExam().then(test,()=>{});
})();
