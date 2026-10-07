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
const lang=()=>get('physica-learner',{}).lang||'en';
const W=(en,hl,hi)=>{const l=lang();return l==='hi'?hi:l==='hl'?hl:en};
const L=o=>o?(lang()==='hi'&&o.hi||o.en):'';
const el=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
const btn=(c,x,f)=>{const b=el('button',c,x);b.type='button';b.addEventListener('click',f);return b};
const mins=(k,n)=>Math.round(n*PAT[k].per);
const mmss=ms=>{const s=Math.max(0,Math.ceil(ms/1000));return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`};
let box=null,tick=0;

// the test covers the whole tab; keys typed in it never reach the experiment's shortcuts
function shell(){if(!box){box=el('div','mock');box.setAttribute('role','dialog');box.setAttribute('aria-modal','true');box.addEventListener('keydown',e=>e.stopPropagation());document.body.append(box)}
  document.body.classList.add('mock-on');window.speechSynthesis?.cancel();box.replaceChildren();box.scrollTop=0;return box}
function close(){const k=box?.dataset.k;clearInterval(tick);box?.remove();box=null;document.body.classList.remove('mock-on');window.PhysicaWake?.();dispatchEvent(new CustomEvent('physica-mock-close',{detail:k}))}

function intro(ch,k){const set=bank(ch,k);if(!set)return;const b=shell();b.dataset.k=k;const n=set.length,mcq=set.filter(q=>q.o).length,num=n-mcq,p=el('div','mock-paper');
  const rules=el('ul','mock-rules');
  for(const t of [W(`${n} questions${num?` (${mcq} MCQ + ${num} numerical)`:''} · ${mins(k,n)} minutes`,`${n} sawal${num?` (${mcq} MCQ + ${num} numerical)`:''} · ${mins(k,n)} minute`,`${n} प्रश्न${num?` (${mcq} MCQ + ${num} संख्यात्मक)`:''} · ${mins(k,n)} मिनट`),
    W('+4 for a correct answer, −1 for a wrong one, 0 if left blank.','Sahi jawab +4, galat −1, chhoda to 0.','सही उत्तर +4, गलत −1, छोड़ने पर 0।'),
    W('No hints. The result appears only after you submit.','Koi hint nahi. Result submit karne ke baad hi dikhega.','कोई संकेत नहीं। परिणाम सबमिट करने के बाद ही दिखेगा।'),
    W('The test submits itself when the time is up. You can also submit earlier.','Time khatam hote hi test apne aap submit ho jayega. Pehle bhi submit kar sakte ho.','समय खत्म होते ही टेस्ट अपने आप सबमिट हो जाएगा। आप पहले भी सबमिट कर सकते हैं।')])rules.append(el('li','',t));
  const name=el('input','mock-name');name.maxLength=40;name.autocomplete='name';name.value=get('physica-learner',{}).name||'';name.placeholder=W('Your name','Apna naam','अपना नाम');name.setAttribute('aria-label',name.placeholder);
  const start=()=>{const nm=name.value.trim();if(!nm){name.classList.add('need');name.focus();return}const pr=get('physica-learner',{});pr.name=nm;put('physica-learner',pr);
    const now=Date.now();put(LIVE,{ch,k,name:nm,start:now,end:now+mins(k,n)*60000,ans:Array(n).fill(null),cur:0});test()};
  name.addEventListener('keydown',e=>{if(e.key==='Enter')start()});
  const row=el('div','mock-row');row.append(btn('mock-go',W('Start test','Test shuru karo','टेस्ट शुरू करें'),start),btn('mock-nav',W('Cancel','Wapas','वापस'),close));
  p.append(el('h2','',`${PAT[k].name} ${W('mock test','mock test','मॉक टेस्ट')}`),el('p','mock-sub',ch),rules,el('label','mock-lbl',W('Your name (printed on the report)','Apna naam (report par chhapega)','आपका नाम (रिपोर्ट पर छपेगा)')),name,row);b.append(p);name.focus()}

function test(){const S=get(LIVE,null),set=S&&bank(S.ch,S.k);if(!set||!Array.isArray(S.ans)||S.ans.length!==set.length){put(LIVE,null);return close()}
  if(Date.now()>=S.end)return submit(S);
  const b=shell();b.dataset.k=S.k;const head=el('div','mock-head'),clock=el('b','mock-clock'),main=el('div','mock-q'),foot=el('div','mock-row'),pal=el('div','mock-pal'),ask=el('div','mock-ask');ask.hidden=true;
  const save=()=>put(LIVE,S),done=()=>S.ans.filter(a=>a!=null).length;
  head.append(el('span','mock-title',`${PAT[S.k].name} · ${S.ch}`),clock,btn('mock-submit',W('Submit','Submit','सबमिट'),()=>{ask.replaceChildren(el('p','',W(`Submit the test? You have answered ${done()} of ${set.length}.`,`Test submit karein? Aapne ${set.length} mein se ${done()} ka jawab diya hai.`,`टेस्ट सबमिट करें? आपने ${set.length} में से ${done()} प्रश्नों के उत्तर दिए हैं।`)),
    btn('mock-go',W('Yes, submit','Haan, submit karo','हाँ, सबमिट करें'),()=>submit(S)),btn('mock-nav',W('Back to the test','Test par wapas','टेस्ट पर वापस'),()=>{ask.hidden=true}));ask.hidden=false}));
  const paint=()=>{pal.replaceChildren();set.forEach((_,j)=>{const x=btn('mock-pn'+(S.ans[j]!=null?' done':'')+(j===S.cur?' cur':''),String(j+1),()=>show(j));x.setAttribute('aria-label',`${W('Question','Question','प्रश्न')} ${j+1}${S.ans[j]!=null?' ✓':''}`);pal.append(x)})};
  const show=i=>{S.cur=i;save();const q=set[i];main.replaceChildren();
    main.append(el('p','mock-num',`${W('Question','Question','प्रश्न')} ${i+1} / ${set.length}${S.k==='jee'?` · ${q.o?W('Section A · MCQ','Section A · MCQ','खंड A · बहुविकल्पीय'):W('Section B · Numerical','Section B · Numerical','खंड B · संख्यात्मक')}`:''}`),el('p','mock-text',L(q.q)));
    if(q.o){const opts=el('div','mock-opts');q.o.forEach((o,j)=>{const x=btn('mock-opt',`(${j+1}) ${o}`,()=>{S.ans[i]=j;save();show(i)});x.setAttribute('aria-pressed',String(S.ans[i]===j));opts.append(x)});main.append(opts)}
    else{const inp=el('input','mock-in');inp.inputMode='decimal';inp.placeholder=W('Type your answer (a number)','Apna answer likho (number)','अपना उत्तर लिखें (संख्या)');inp.setAttribute('aria-label',inp.placeholder);inp.value=S.ans[i]??'';
      inp.addEventListener('input',()=>{inp.value=inp.value.replace(/[^0-9.\-]/g,'');const v=inp.value;S.ans[i]=v===''?null:v;save();paint()});main.append(inp)}
    if(S.ans[i]!=null)main.append(btn('mock-clear',W('Clear answer','Answer hatao','उत्तर हटाएँ'),()=>{S.ans[i]=null;save();show(i)}));
    paint();b.scrollTop=0};
  foot.append(btn('mock-nav','◀ '+W('Previous','Pichhla','पिछला'),()=>show(Math.max(0,S.cur-1))),btn('mock-nav',W('Next','Agla','अगला')+' ▶',()=>show(Math.min(set.length-1,S.cur+1))));
  const tickF=()=>{const left=S.end-Date.now();clock.textContent='⏱ '+mmss(left);clock.classList.toggle('low',left<=300000);if(left<=0)submit(S)};
  b.append(head,ask,main,foot,pal);show(Math.min(S.cur||0,set.length-1));clearInterval(tick);tick=setInterval(tickF,1000);tickF()}

function submit(S){clearInterval(tick);const set=bank(S.ch,S.k);put(LIVE,null);if(!set)return close();
  const res=set.map((q,i)=>{const a=S.ans[i];if(a==null||a==='')return 's';return q.o?(a===q.c?'c':'w'):(Math.abs(parseFloat(a)-q.n)<=.01?'c':'w')});
  const r={ch:S.ch,k:S.k,name:S.name,at:Date.now(),used:Math.min(Date.now(),S.end)-S.start,ans:S.ans,res};
  put(SAVED,[r,...get(SAVED,[])].slice(0,20));report(r)}

function report(r){const set=bank(r.ch,r.k),topics=window.PhysicaMockBank?.[r.ch]?.topics||{};if(!set)return;
  const b=shell();b.dataset.k=r.k;const p=el('div','mock-paper mock-report'),n=x=>r.res.filter(y=>y===x).length,c=n('c'),w=n('w'),s=n('s');
  p.append(el('p','mock-brand',`Physica · ${W('Mock test report','Mock test report','मॉक टेस्ट रिपोर्ट')}`),el('h2','',r.name),
    el('p','mock-sub',`${PAT[r.k].name} ${W('mock','mock','मॉक')} · ${r.ch} · ${new Date(r.at).toLocaleString()} · ${W('Time taken','Time laga','लगा समय')} ${mmss(r.used)}`));
  const stats=el('div','mock-stats');
  for(const [t,v] of [[W('Score','Score','अंक'),`${4*c-w} / ${4*set.length}`],[W('Correct','Sahi','सही'),c],[W('Wrong','Galat','गलत'),w],[W('Skipped','Chhode','छोड़े'),s],[W('Accuracy','Accuracy','शुद्धता'),c+w?`${Math.round(100*c/(c+w))}%`:'-']]){const d=el('div','');d.append(el('b','',String(v)),el('span','',t));stats.append(d)}
  // topic-wise: marks per topic, and the topics below half marks to revise
  const tab=el('table','mock-table'),hr=el('tr'),weak=[];
  for(const h of [W('Topic','Topic','विषय'),W('Correct','Sahi','सही'),W('Wrong','Galat','गलत'),W('Skipped','Chhode','छोड़े'),W('Marks','Marks','अंक')])hr.append(el('th','',h));tab.append(hr);
  const keys=[...new Set(set.map(q=>q.tp))];
  for(const tp of keys){const idx=set.map((q,i)=>q.tp===tp?i:-1).filter(i=>i>=0),cc=idx.filter(i=>r.res[i]==='c').length,ww=idx.filter(i=>r.res[i]==='w').length,mk=4*cc-ww,name=L(topics[tp])||tp;
    if(mk<2*idx.length)weak.push(name);const tr=el('tr');for(const v of [name,cc,ww,idx.length-cc-ww,`${mk} / ${4*idx.length}`])tr.append(el('td','',String(v)));tab.append(tr)}
  p.append(stats,el('h3','',W('Topic-wise performance','Topic-wise performance','विषयवार प्रदर्शन')),tab,
    el('p','mock-weak',weak.length?W(`Revise: ${weak.join(', ')}`,`Inhe dobara padho: ${weak.join(', ')}`,`इन्हें दोबारा पढ़ें: ${weak.join(', ')}`):W('Well done - no weak topic in this test.','Shabash - is test mein koi weak topic nahi.','शाबाश - इस टेस्ट में कोई कमज़ोर विषय नहीं।')),
    el('h3','',W('Question review','Question review','प्रश्नवार समीक्षा')));
  const fmt=(q,a)=>a==null||a===''?W('not answered','jawab nahi diya','उत्तर नहीं दिया'):q.o?`(${a+1}) ${q.o[a]}`:String(a);
  set.forEach((q,i)=>{const res=r.res[i],d=el('div','mock-rv '+res);
    d.append(el('p','mock-text',`${i+1}. ${res==='c'?'✓':res==='w'?'✗':'–'} ${L(q.q)}`),el('p','',`${W('Your answer','Aapka jawab','आपका उत्तर')}: ${fmt(q,r.ans[i])} · ${W('Correct','Sahi','सही')}: ${fmt(q,q.o?q.c:q.n)}`),el('p','mock-sol',L(q.s)));p.append(d)});
  const row=el('div','mock-row mock-noprint');
  row.append(btn('mock-go','⬇ '+W('Download PDF','PDF download karo','PDF डाउनलोड करें'),()=>{const t=document.title;document.title=`Physica ${PAT[r.k].name} report - ${r.name} - ${r.ch}`;addEventListener('afterprint',()=>{document.title=t},{once:true});window.print()}),btn('mock-nav',W('Close','Band karo','बंद करें'),close));
  p.append(row);b.append(p)}

window.PhysicaMockTest={start:intro,open:report,past:(ch,k)=>get(SAVED,[]).filter(r=>r.ch===ch&&r.k===k),info:(ch,k)=>{const set=bank(ch,k);return set&&{name:PAT[k].name,n:set.length,min:mins(k,set.length)}}};
// a test that was running when the page closed carries on (or submits, if its time ran out meanwhile)
if(get(LIVE,null))test();
})();
