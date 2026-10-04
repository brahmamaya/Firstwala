/* Modes (Normal / Student / Teacher) and the Physica Tutor.
   Student: ask questions (pre-written answers built from the live values), "Predict → Show me" demos that move the
   sliders by themselves, and a quick quiz. Teacher: a projector view with bigger text and controls, plus the same
   demos and quiz run as a class activity (predict first, then reveal). No AI service is called. */
(() => {
'use strict';
const C=window.PhysicaTutor||{},head=document.querySelector('.workspace-header'),stage=document.querySelector('.stage'),titleEl=document.getElementById('title');
if(!head||!stage||!titleEl)return;
const el=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!=null)e.textContent=text;return e};
const btn=(cls,text,fn)=>{const b=el('button',cls,text);b.type='button';if(fn)b.addEventListener('click',fn);return b};
const KEY='physica-mode',MODES=[['normal','Normal'],['student','🎓 Student'],['teacher','👩‍🏫 Teacher']];
let mode='normal';try{mode=localStorage.getItem(KEY)||'normal'}catch{}if(!MODES.some(m=>m[0]===mode))mode='normal';

// ---- mode switch (glass segmented control in the lab header)
const sw=el('div','mode-pick');sw.setAttribute('role','group');sw.setAttribute('aria-label','Mode');
for(const [id,label] of MODES){const b=btn('',label,()=>setMode(id));b.dataset.mode=id;b.dataset.testid='mode-'+id;sw.append(b)}
head.insertBefore(sw,head.querySelector('.chapter-nav'));window.PhysicaGlass?.(sw);

// ---- live simulation access (through the real controls, so everything stays in sync)
const simId=()=>decodeURIComponent(location.hash.slice(1))||'';
const params=()=>{const p={};for(const i of document.querySelectorAll('#controls input[type=range]'))p[i.id.replace(/^control-/,'')]=Number(i.value);return p};
const setP=(k,v)=>{const i=document.getElementById('control-'+k);if(!i)return;i.value=v;i.dispatchEvent(new Event('input',{bubbles:true}))};
const launch=()=>{document.getElementById('restart')?.click();const pl=document.getElementById('play');if(pl&&/play/i.test(pl.getAttribute('aria-label')||''))pl.click()};
let run=0;const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function glide(to,ms,token){const from=params(),t0=performance.now();if(!ms){for(const k in to)setP(k,to[k]);return}
  while(token===run){const k=Math.min(1,(performance.now()-t0)/ms),e=k<.5?2*k*k:1-(-2*k+2)**2/2;for(const key in to){const i=document.getElementById('control-'+key),st=Number(i?.step)||1,v=from[key]+(to[key]-from[key])*e;setP(key,Math.round(v/st)*st)}if(k>=1)break;await sleep(16)}}

// ---- the tutor card
const card=el('section','tutor-card');card.setAttribute('aria-label','Physica Tutor');card.hidden=true;stage.after(card);
const top=el('div','tutor-top'),hd=el('h2','','Physica Tutor'),tabs=el('div','tutor-tabs'),body=el('div','tutor-body');top.append(el('span','tutor-bot','✦'),hd,tabs);card.append(top,body);
let tab='ask';
function tabsFor(){return mode==='teacher'?[['show','▶ Predict & show'],['quiz','✓ Class quiz'],['ask','❓ Answers']]:[['ask','💬 Ask'],['show','▶ Show me'],['quiz','✓ Quiz']]}
function render(){run++;const c=C[simId()],on=mode!=='normal';document.body.classList.toggle('mode-teacher',mode==='teacher');document.body.classList.toggle('mode-student',mode==='student');
  for(const b of sw.querySelectorAll('button'))b.setAttribute('aria-pressed',String(b.dataset.mode===mode));
  card.hidden=!on;if(!on)return;tabs.replaceChildren();body.replaceChildren();
  if(!c){hd.textContent='Physica Tutor';body.append(el('p','tutor-note','The tutor is ready for Projectile motion. More simulations are coming soon.'),btn('tutor-cta','Open Projectile motion →',()=>{location.hash='#projectile';location.reload()}));return}
  hd.textContent=mode==='teacher'?'Class tools':'Physica Tutor';
  const list=tabsFor();if(!list.some(t=>t[0]===tab))tab=list[0][0];
  for(const [id,label] of list){const b=btn('',label,()=>{tab=id;render()});b.setAttribute('aria-pressed',String(id===tab));tabs.append(b)}
  window.PhysicaGlass?.(tabs);
  ({ask,show,quiz})[tab](c)}

// Ask: type a question or tap a common one; the best pre-written answer is chosen by keyword match.
function ask(c){const say=el('div','tutor-say',c.intro);body.append(say);
  const answer=(item,typed)=>{say.replaceChildren(el('b','',item?item.q:`“${typed}”`),el('p','',item?item.a(params()):'I don’t have an answer for this one yet.'));
    if(!item&&typed&&window.PhysicaSendFeedback){const s=btn('tutor-mini','Send this question to the Physica team',async()=>{s.disabled=true;s.textContent='Sending…';try{await window.PhysicaSendFeedback('Tutor question','-',`[${simId()}] ${typed}`);s.textContent='Sent - thank you!'}catch{s.textContent='Could not send'}});say.append(s)}};
  if(mode!=='teacher'){const f=el('form','tutor-ask'),i=el('input');i.type='text';i.maxLength=200;i.placeholder='Ask about this simulation… e.g. why 45°?';i.setAttribute('aria-label','Ask the tutor');const go=btn('tutor-go','Ask');go.type='submit';f.append(i,go);
    f.addEventListener('submit',e=>{e.preventDefault();const q=i.value.trim();if(!q)return;answer(match(c,q),q)});body.append(f)}
  const chips=el('div','tutor-chips');for(const item of c.qa)chips.append(btn('tutor-chip',item.q,()=>answer(item)));body.append(chips)}
function match(c,q){const s=' '+q.toLowerCase().replace(/[^a-z0-9°.\s]/g,' ').replace(/\s+/g,' ')+' ';let best=null,score=0;
  for(const item of c.qa){let n=0;for(const k of item.k)if(s.includes(k.toLowerCase()))n+=k.length>4?2:1;if(n>score){score=n;best=item}}return score?best:null}

// Show me: predict first, then the sliders move by themselves and the stage replays.
function show(c){const grid=el('div','tutor-demos');c.demos.forEach((d,i)=>grid.append(btn('tutor-demo',`${i+1}. ${d.title}`,()=>demo(d))));body.append(grid)}
function demo(d){body.replaceChildren();const box=el('div','tutor-predict'),opts=el('div','tutor-opts'),say=el('div','tutor-say tutor-live');let pick=-1;
  box.append(el('b','','Predict first'),el('p','',d.predict.q),opts);
  d.predict.options.forEach((o,i)=>opts.append(btn('tutor-opt',o,e=>{if(mode==='teacher')return;pick=i;for(const b of opts.children)b.classList.toggle('picked',b===e.currentTarget)})));
  const go=btn('tutor-cta',mode==='teacher'?'▶ Run & reveal':'▶ Show me',async()=>{go.disabled=true;back.disabled=true;const token=++run;
    for(const s of d.steps){if(token!==run)return;if(s.set)await glide(s.set,s.ms||0,token);if(s.say)say.textContent=s.say(params());if(s.launch)launch();if(s.wait)await sleep(s.wait)}
    if(token!==run)return;opts.children[d.predict.correct].classList.add('right');if(pick>=0&&pick!==d.predict.correct)opts.children[pick].classList.add('wrong');
    say.replaceChildren(el('b','',pick<0?'Answer':pick===d.predict.correct?'You were right! 🎉':'Not quite - here is why'),el('p','',d.explain));go.hidden=true;back.disabled=false});
  const back=btn('tutor-mini','← All demos',()=>{run++;render()});body.append(box,go,say,back)}

// Quiz: students get instant feedback; teachers reveal the answer to the class.
function quiz(c){let score=0,done=0;const out=el('p','tutor-score');
  c.quiz.forEach((qq,n)=>{const q=el('div','tutor-q'),opts=el('div','tutor-opts'),why=el('p','tutor-why');why.hidden=true;q.append(el('b','',`Q${n+1}. ${qq.q}`),opts,why);
    const reveal=pick=>{if(q.dataset.done)return;q.dataset.done='1';done++;opts.children[qq.correct].classList.add('right');if(pick>=0&&pick!==qq.correct)opts.children[pick].classList.add('wrong');if(pick===qq.correct)score++;why.textContent=qq.why;why.hidden=false;
      if(mode!=='teacher'&&done===c.quiz.length)out.textContent=`Score: ${score} / ${c.quiz.length}${score===c.quiz.length?' - excellent! ⭐':''}`};
    qq.options.forEach((o,i)=>opts.append(btn('tutor-opt',o,()=>{if(mode!=='teacher')reveal(i)})));
    if(mode==='teacher')q.append(btn('tutor-mini','Reveal answer',e=>{reveal(-1);e.currentTarget.remove()}));body.append(q)});
  body.append(out)}

function setMode(m){mode=m;try{localStorage.setItem(KEY,m)}catch{}tab=m==='teacher'?'show':'ask';render();window.dispatchEvent(new Event('resize'))}
new MutationObserver(()=>{if(mode!=='normal')render()}).observe(titleEl,{childList:true,characterData:true,subtree:true});
render();
})();
