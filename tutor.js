/* Modes (Normal / Student / Teacher, chosen on the landing page).
   Normal: the site as it is. Teacher: a projector view (bigger text and controls). Student: the Physica Tutor -
   ask by typing or voice (pre-written answers built from the live values, read aloud), "Predict → Show me" demos that
   move the sliders by themselves, and a spoken quiz. Voice uses the browser's own speech features; no AI service. */
(() => {
'use strict';
const C=window.PhysicaTutor||{},stage=document.querySelector('.stage'),titleEl=document.getElementById('title');
if(!stage||!titleEl)return;
const el=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!=null)e.textContent=text;return e};
const btn=(cls,text,fn)=>{const b=el('button',cls,text);b.type='button';if(fn)b.addEventListener('click',fn);return b};
const KEY='physica-mode',MODES=[['normal','Normal'],['student','🎓 Student'],['teacher','👩‍🏫 Teacher']];
let mode='normal';try{mode=localStorage.getItem(KEY)||'normal'}catch{}if(!MODES.some(m=>m[0]===mode))mode='normal';

// ---- mode choice: step 3 on the landing page (the logo brings the landing page back to change it)
const sw=el('div','landing-grades landing-modes');sw.setAttribute('role','group');sw.setAttribute('aria-label','Mode');
const SUB={normal:'Explore freely',student:'Voice tutor, demos and quiz',teacher:'Projector view for class'};
for(const [id,label] of MODES){const b=btn('land-grade land-mode',null,()=>setMode(id));b.append(el('b','',label),el('small','',SUB[id]));b.dataset.mode=id;b.dataset.testid='mode-'+id;sw.append(b)}
const step2=document.querySelector('.landing-step2');
if(step2){const st=el('div','landing-step3');const h=el('h2','landing-step');h.append(el('span','','3'),document.createTextNode(' Choose your mode'));st.append(h,sw);step2.after(st)}

// ---- live simulation access (through the real controls, so everything stays in sync)
const simId=()=>decodeURIComponent(location.hash.slice(1))||'';
const params=()=>{const p={};for(const i of document.querySelectorAll('#controls input[type=range]'))p[i.id.replace(/^control-/,'')]=Number(i.value);
  for(const i of document.querySelectorAll('#controls select')){const v=i.value;p[i.id.replace(/^control-/,'')]=v!==''&&!isNaN(v)?Number(v):v}return p};
const setP=(k,v)=>{const i=document.getElementById('control-'+k);if(!i)return;i.value=v;i.dispatchEvent(new Event('input',{bubbles:true}))};
const launch=()=>{document.getElementById('restart')?.click();const pl=document.getElementById('play');if(pl&&/play/i.test(pl.getAttribute('aria-label')||''))pl.click()};
let run=0;const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function glide(to,ms,token){const from=params(),t0=performance.now();if(!ms){for(const k in to)setP(k,to[k]);return}
  while(token===run){const k=Math.min(1,(performance.now()-t0)/ms),e=k<.5?2*k*k:1-(-2*k+2)**2/2;for(const key in to){const i=document.getElementById('control-'+key),st=Number(i?.step)||1,v=from[key]+(to[key]-from[key])*e;setP(key,Math.round(v/st)*st)}if(k>=1)break;await sleep(16)}}

// ---- content for the open simulation: its own notes (if any) + automatic demos/answers built from the simulation
//      itself (what each control does, read from its live measurements) + the chapter notes.
const CH=window.PhysicaTutorChapters||{};
const simObj=()=>(window.PhysicaSims||[]).find(x=>x.id===simId());
const num=v=>{const m=String(v).replace(/−/g,'-').match(/-?\d+(\.\d+)?(e-?\d+)?/i);return m?Number(m[0]):NaN};
const readings=(sim,p)=>{try{return(sim.metrics?.(p,0)||[]).map(m=>({label:m.label,value:m.value,n:num(m.value)}))}catch{return[]}};
const ranges=sim=>(sim.controls||[]).filter(c=>!c.options&&typeof c.min==='number');
const span=c=>{const st=c.step||1,r=v=>Math.round(v/st)*st,d=(c.max-c.min)*.15;return[r(c.min+d),r(c.max-d)]};
function effect(sim,c){const p=params(),[lo,hi]=span(c),a=readings(sim,{...p,[c.key]:lo}),b=readings(sim,{...p,[c.key]:hi});let best=-1,ch=0;
  a.forEach((m,i)=>{const x=m.n,y=b[i]?.n;if(!isFinite(x)||!isFinite(y))return;const r=Math.abs(y-x)/Math.max(Math.abs(x),Math.abs(y),1e-12);if(r>ch){ch=r;best=i}});
  return{lo,hi,a,b,i:best,dir:best<0||ch<.01?0:Math.sign(b[best].n-a[best].n)}}
const fmtC=(c,v)=>`${v}${c.unit?(/^[°%]/.test(c.unit)?'':' ')+c.unit:''}`;
function content(){const id=simId(),sim=simObj();if(!sim||sim.subject!=='physics')return null;const own=C[id]||{},chap=CH[sim.chapter]||{qa:[],quiz:[]},rc=ranges(sim);
  const autoQ=rc.map(c=>({q:`What does ${c.label.toLowerCase()} do here?`,k:[c.label.toLowerCase(),...c.label.toLowerCase().split(/\s+/).filter(w=>w.length>3)],
    a:()=>{const e=effect(sim,c);if(e.i<0)return`${c.label} sets up the experiment; watch the stage as you move it.`;const m=e.a[e.i];
      return`Raising ${c.label.toLowerCase()} from ${fmtC(c,e.lo)} to ${fmtC(c,e.hi)} changes ${m.label.toLowerCase()} from ${m.value} to ${e.b[e.i].value}`+(e.dir?` - it ${e.dir>0?'increases':'decreases'}.`:' - hardly at all.')}}));
  const base=[{q:'What is the key relation here?',k:['formula','relation','equation','key relation'],a:()=>`${sim.formula||''}. ${sim.observe||''}`.trim()},
    {q:'What do the numbers on the stage mean right now?',k:['numbers','values','reading','measurement','right now'],a:()=>readings(sim,params()).map(m=>`${m.label}: ${m.value}`).join('. ')+'.'}];
  if(sim.try)base.push({q:'What should I try?',k:['try','experiment','what should'],a:()=>sim.try});
  const autoD=rc.slice(0,4).map(c=>({title:`What does ${c.label.toLowerCase()} do?`,auto:c,sim}));
  return{intro:own.intro||`Ask me about ${sim.title.toLowerCase()} or ${sim.chapter}, or press “Show me”.`,qa:[...(own.qa||[]),...autoQ,...base,...chap.qa],demos:[...(own.demos||[]),...autoD],quiz:[...(own.quiz||[]),...chap.quiz]}}

// ---- voice: the tutor speaks (speech synthesis, built into the browser) and can listen (speech recognition where available)
const synth=window.SpeechSynthesisUtterance?window.speechSynthesis:null,Rec=window.SpeechRecognition||window.webkitSpeechRecognition;
let voiceOn=true;try{voiceOn=localStorage.getItem('physica-voice')!=='0'}catch{}
const spoken=t=>String(t).replace(/m\/s²/g,' metres per second squared').replace(/m\/s/g,' metres per second').replace(/(\d)\s?m\b/g,'$1 metres').replace(/(\d)\s?s\b/g,'$1 seconds')
  .replace(/sin\s?\(2θ\)/g,'sine 2 theta').replace(/sin²θ/g,'sine squared theta').replace(/sinθ/g,'sine theta').replace(/cosθ/g,'cos theta').replace(/θ/g,'theta').replace(/v²/g,'v squared').replace(/²/g,' squared')
  .replace(/°/g,' degrees').replace(/→/g,' to ').replace(/×/g,' times ').replace(/≈/g,' about ').replace(/∝/g,' is proportional to ').replace(/½/g,'half').replace(/[“”"]/g,'').replace(/ - /g,', ');
let voice=null;const pickVoice=()=>{const v=synth?.getVoices()||[];voice=v.find(x=>/en-IN/i.test(x.lang))||v.find(x=>/^en/i.test(x.lang))||null};if(synth){pickVoice();synth.addEventListener?.('voiceschanged',pickVoice)}
function speak(text,then){if(!synth||!voiceOn||mode!=='student'){then?.();return}const u=new SpeechSynthesisUtterance(spoken(text));u.lang='en-IN';if(voice)try{u.voice=voice;u.lang=voice.lang}catch{}u.rate=1;if(then)u.onend=()=>then();synth.speak(u)}
const hush=()=>{try{synth?.cancel()}catch{}};

// ---- the tutor card (Student mode only)
const card=el('section','tutor-card');card.setAttribute('aria-label','Physica Tutor');card.hidden=true;stage.after(card);
const top=el('div','tutor-top'),hd=el('h2','','Physica Tutor'),tabs=el('div','tutor-tabs'),body=el('div','tutor-body');
const vbtn=btn('tutor-voice','',()=>{voiceOn=!voiceOn;try{localStorage.setItem('physica-voice',voiceOn?'1':'0')}catch{}if(!voiceOn)hush();paintVoice()});
const paintVoice=()=>{vbtn.textContent=voiceOn?'🔊':'🔇';vbtn.title=voiceOn?'Voice on - tap to mute':'Voice off - tap to turn on';vbtn.setAttribute('aria-label',vbtn.title);vbtn.setAttribute('aria-pressed',String(voiceOn))};paintVoice();if(!synth)vbtn.hidden=true;
top.append(el('span','tutor-bot','✦'),hd,vbtn,tabs);card.append(top,body);
let tab='ask',tutorOn=false;try{tutorOn=localStorage.getItem('physica-tutor')==='1'}catch{}
// "AI Tutor" switch in the top bar - shown only in Student mode; the tutor appears only when it is on.
const tbtn=btn('tutor-switch','',()=>{tutorOn=!tutorOn;try{localStorage.setItem('physica-tutor',tutorOn?'1':'0')}catch{}render();if(tutorOn&&!card.hidden)card.scrollIntoView({behavior:'smooth',block:'nearest'})});
tbtn.dataset.testid='ai-tutor';const tdot=el('span','tutor-switch-knob');tbtn.append(el('span','tutor-switch-ic','✦'),el('b','','AI Tutor'),tdot);
document.querySelector('.topbar-right')?.prepend(tbtn);
function render(){run++;hush();const c=content(),on=mode==='student'&&tutorOn;tbtn.hidden=mode!=='student';tbtn.setAttribute('aria-pressed',String(tutorOn));tbtn.title=tutorOn?'AI Tutor on - tap to turn off':'Turn on the AI Tutor';document.body.classList.toggle('mode-teacher',mode==='teacher');document.body.classList.toggle('mode-student',on);
  for(const b of sw.querySelectorAll('button'))b.setAttribute('aria-pressed',String(b.dataset.mode===mode));
  card.hidden=!on;if(!on)return;tabs.replaceChildren();body.replaceChildren();
  if(!c){body.append(el('p','tutor-note','The AI Tutor covers every physics chapter. Chemistry, Botany and Zoology are coming soon.'));return}
  for(const [id,label] of [['ask','💬 Ask'],['show','▶ Show me'],['quiz','✓ Quiz']]){const b=btn('',label,()=>{tab=id;render()});b.setAttribute('aria-pressed',String(id===tab));tabs.append(b)}
  window.PhysicaGlass?.(tabs);
  ({ask,show,quiz})[tab](c)}

// Ask: type, speak or tap a common question; the best pre-written answer is chosen by keyword match and read aloud.
function ask(c){const say=el('div','tutor-say',c.intro);body.append(say);
  const answer=(item,typed)=>{const text=item?item.a(params()):'I don’t have an answer for this one yet.';say.replaceChildren(el('b','',item?item.q:`“${typed}”`),el('p','',text));speak(text);
    if(!item&&typed&&window.PhysicaSendFeedback){const s=btn('tutor-mini','Send this question to the Physica team',async()=>{s.disabled=true;s.textContent='Sending…';try{await window.PhysicaSendFeedback('Tutor question','-',`[${simId()}] ${typed}`);s.textContent='Sent - thank you!'}catch{s.textContent='Could not send'}});say.append(s)}};
  const f=el('form','tutor-ask'),i=el('input');i.type='text';i.maxLength=200;i.placeholder='Ask about this simulation… e.g. why 45°?';i.setAttribute('aria-label','Ask the tutor');
  const go=btn('tutor-go','Ask');go.type='submit';f.append(i);
  if(Rec){const mic=btn('tutor-mic','🎤',()=>{hush();const r=new Rec();r.lang='en-IN';r.interimResults=false;r.maxAlternatives=1;mic.classList.add('on');mic.textContent='●';
      r.onresult=e=>{i.value=e.results[0][0].transcript;f.requestSubmit()};r.onend=()=>{mic.classList.remove('on');mic.textContent='🎤'};r.onerror=()=>{i.placeholder='Could not hear you - please type your question'};try{r.start()}catch{}});
    mic.title='Ask by voice';mic.setAttribute('aria-label','Ask by voice');f.append(mic)}
  f.append(go);f.addEventListener('submit',e=>{e.preventDefault();const q=i.value.trim();if(!q)return;answer(match(c,q),q)});body.append(f);
  const chips=el('div','tutor-chips');for(const item of c.qa)chips.append(btn('tutor-chip',item.q,()=>answer(item)));body.append(chips)}
function match(c,q){const s=' '+q.toLowerCase().replace(/[^a-z0-9°.\s]/g,' ').replace(/\s+/g,' ')+' ';let best=null,score=0;
  for(const item of c.qa){let n=0;for(const k of item.k)if(s.includes(k.toLowerCase()))n+=k.length>4?2:1;if(n>score){score=n;best=item}}return score?best:null}

// Show me: the tutor asks the student to predict (aloud), then moves the sliders itself and replays the stage.
function show(c){const grid=el('div','tutor-demos');c.demos.forEach((d,i)=>grid.append(btn('tutor-demo',`${i+1}. ${d.title}`,()=>demo(d))));body.append(grid)}
// Automatic demo: predict what happens to the most affected reading when one control is raised, then watch it.
function autoDemo(d){const c=d.auto,e=effect(d.sim,c),m=e.i>=0?e.a[e.i].label.toLowerCase():'the readings';
  const res=(p,i)=>{const r=readings(d.sim,p)[i<0?0:i];return r?r.value:''};
  return{predict:{q:`If we raise ${c.label.toLowerCase()} from ${fmtC(c,e.lo)} to ${fmtC(c,e.hi)}, what happens to ${m}?`,options:['It increases','It decreases','It stays about the same'],correct:e.dir>0?0:e.dir<0?1:2},
    steps:[{set:{[c.key]:e.lo},ms:900,say:p=>`${c.label} ${fmtC(c,p[c.key])}: ${m} ${res(p,e.i)}`},{launch:1},{wait:1600},{set:{[c.key]:e.hi},ms:2400,say:p=>`${c.label} ${fmtC(c,p[c.key])}: ${m} ${res(p,e.i)}`},{launch:1},{wait:2000}],
    explain:e.i<0?`${c.label} changes the set-up; watch how the stage responds.`:`${m[0].toUpperCase()+m.slice(1)} went from ${e.a[e.i].value} to ${e.b[e.i].value}.${d.sim.formula?' Key relation: '+d.sim.formula+'.':''}`}}
function demo(d){if(d.auto)d={...d,...autoDemo(d)};body.replaceChildren();const box=el('div','tutor-predict'),opts=el('div','tutor-opts'),say=el('div','tutor-say tutor-live');let pick=-1;
  box.append(el('b','','Predict first'),el('p','',d.predict.q),opts);
  d.predict.options.forEach((o,i)=>opts.append(btn('tutor-opt',`${i+1}. ${o}`,e=>{pick=i;for(const b of opts.children)b.classList.toggle('picked',b===e.currentTarget)})));
  speak(`Predict first. ${d.predict.q} ${d.predict.options.map((o,i)=>`Option ${i+1}: ${o}.`).join(' ')}`);
  const go=btn('tutor-cta','▶ Show me',async()=>{hush();go.disabled=true;back.disabled=true;const token=++run;
    for(const s of d.steps){if(token!==run)return;if(s.set)await glide(s.set,s.ms||0,token);if(s.say){const t=s.say(params());say.textContent=t;speak(t)}if(s.launch)launch();if(s.wait)await sleep(s.wait)}
    if(token!==run)return;opts.children[d.predict.correct].classList.add('right');if(pick>=0&&pick!==d.predict.correct)opts.children[pick].classList.add('wrong');
    const verdict=pick<0?'Here is the answer':pick===d.predict.correct?'You were right! 🎉':'Not quite - here is why';say.replaceChildren(el('b','',verdict),el('p','',d.explain));speak(`${verdict.replace('🎉','')}. ${d.explain}`);go.hidden=true;back.disabled=false});
  const back=btn('tutor-mini','← All demos',()=>{run++;render()});body.append(box,go,say,back)}

// Quiz: the tutor reads each question aloud, says if the answer is right and explains, then reads the next one.
function quiz(c){let score=0,done=0;const out=el('p','tutor-score'),qs=[];
  const read=n=>{const qq=c.quiz[n];if(qq)speak(`Question ${n+1}. ${qq.q} ${qq.options.map((o,i)=>`Option ${i+1}: ${o}.`).join(' ')}`)};
  c.quiz.forEach((qq,n)=>{const q=el('div','tutor-q'),opts=el('div','tutor-opts'),why=el('p','tutor-why');why.hidden=true;const ttl=el('b','',`Q${n+1}. ${qq.q} `);
    if(synth){const r=btn('tutor-read','🔊',()=>{hush();read(n)});r.title='Read this question';r.setAttribute('aria-label','Read question aloud');ttl.append(r)}
    q.append(ttl,opts,why);qs.push(q);
    const reveal=pick=>{if(q.dataset.done)return;q.dataset.done='1';done++;opts.children[qq.correct].classList.add('right');if(pick!==qq.correct)opts.children[pick].classList.add('wrong');else score++;why.textContent=qq.why;why.hidden=false;
      const end=done===c.quiz.length;if(end)out.textContent=`Score: ${score} / ${c.quiz.length}${score===c.quiz.length?' - excellent! ⭐':''}`;
      hush();speak(`${pick===qq.correct?'Correct!':'Not quite.'} ${qq.why}${end?` Your score is ${score} out of ${c.quiz.length}.`:''}`,()=>{if(!end){const next=c.quiz.findIndex((_,k)=>!qs[k].dataset.done);if(next>=0)read(next)}})};
    qq.options.forEach((o,i)=>opts.append(btn('tutor-opt',`${i+1}. ${o}`,()=>reveal(i))));body.append(q)});
  body.append(out);read(0)}

function setMode(m){mode=m;try{localStorage.setItem(KEY,m)}catch{}tab='ask';render();window.dispatchEvent(new Event('resize'))}
new MutationObserver(()=>{if(mode==='student'&&tutorOn)render()}).observe(titleEl,{childList:true,characterData:true,subtree:true});
render();
})();
