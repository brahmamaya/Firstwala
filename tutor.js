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

// ---- voice: a female English voice from the device, physics read naturally, one sentence at a time (natural pauses)
const SP=window.PhysicaSpeech||{speakable:t=>t,pickVoice:l=>l[0]||null};
const synth=window.SpeechSynthesisUtterance?window.speechSynthesis:null,Rec=window.SpeechRecognition||window.webkitSpeechRecognition;
let voiceOn=true;try{voiceOn=localStorage.getItem('physica-voice')!=='0'}catch{}
let voice=null;const pickVoice=()=>{try{voice=SP.pickVoice(synth?.getVoices()||[])}catch{voice=null}};if(synth){pickVoice();synth.addEventListener?.('voiceschanged',pickVoice)}
function speak(text,then){if(!synth||!voiceOn||mode!=='student'){then?.();return}
  const parts=SP.speakable(text).split(/(?<=[.!?])\s+/).filter(Boolean);if(!parts.length){then?.();return}
  parts.forEach((p,k)=>{const u=new SpeechSynthesisUtterance(p);u.lang='en-IN';if(voice)try{u.voice=voice;u.lang=voice.lang}catch{}u.rate=.97;u.pitch=1.12;
    u.onstart=()=>card.classList.add('talking');if(k===parts.length-1)u.onend=()=>{card.classList.remove('talking');then?.()};synth.speak(u)})}
const hush=()=>{try{synth?.cancel()}catch{}card?.classList.remove('talking')};

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
  for(const [id,label] of [['ask','💬 Chat'],['show','▶ Show me'],['quiz','✓ Quiz']]){const b=btn('',label,()=>{tab=id;render()});b.setAttribute('aria-pressed',String(id===tab));tabs.append(b)}
  window.PhysicaGlass?.(tabs);
  ({ask:chat,show,quiz})[tab](c)}

// ---------------------------------------------------------------------------------------------------------------
// Chat: a conversation. The student's question appears as a bubble; the tutor "types", answers in a friendly voice,
// and asks back - a prediction before revealing a result, or a quick check question after an explanation.
// Understanding (no AI service): 1) numbers in the question ("angle 60", "30 m/s") are put into the simulation and
// the result is calculated; 2) "what if I increase/double/halve X" is worked out from the simulation itself;
// 3) otherwise the best answer is searched across this simulation, its chapter and all other physics chapters.
const pickOne=a=>a[Math.floor(Math.random()*a.length)];
const OPEN=['Good question!','Nice one!','Ooh, I like this one.','Great thinking!','Let’s figure it out together.'];
const PRAISE=['Spot on! 🎉','Exactly right!','Yes! You nailed it.','Brilliant!'],SOFT=['Not quite - but that’s how we learn.','Close! Let’s look again.','Hmm, not this time.'];
const HING={kyun:'why',kyu:'why',kyon:'why',kya:'what',kaise:'how',kaisa:'how',kab:'when',kitna:'how much',kitni:'how much',kitne:'how many',zyada:'more',jyada:'more',kam:'less',
  badhao:'increase',badha:'increase',badhe:'increase',badhega:'increase',badhegi:'increase',ghatao:'decrease',ghata:'decrease',ghatega:'decrease',ghategi:'decrease',dugna:'double',dugni:'double',aadha:'half',adha:'half',
  sabse:'most',upar:'up',neeche:'down',niche:'down',door:'far',dur:'far',jaldi:'fast',tez:'fast',dheere:'slow',bhari:'heavy',halka:'light',matlab:'meaning',samjhao:'explain',batao:'tell'};
const STOP=new Set('a an the is are was were be to of in on at for and or it its this that these those do does did what why how when which who i me my you your we our can could would should will please tell explain about with from by as if then than there here so very much also just hai ka ki ke ko se me mein aur ye wo yeh woh hota hoti hote kar karo karte'.split(' '));
const stem=w=>w.length>4?w.replace(/(ing|ed|es|s)$/,''):w;
const toks=t=>String(t).toLowerCase().replace(/[^a-z0-9°.\s]/g,' ').split(/\s+/).map(w=>HING[w]||w).filter(w=>w&&!STOP.has(w)).map(stem);
const normQ=t=>' '+String(t).toLowerCase().replace(/[₀₁₂₃]/g,d=>({'₀':'0','₁':'1','₂':'2','₃':'3'})[d]).replace(/[^a-z0-9°./\s]/g,' ').split(/\s+/).map(w=>HING[w]||w).join(' ')+' ';
const UNIT_WORDS={'°':'°|deg|degree|degrees','m/s':'m/s|mps|metres? per second|meters? per second','m/s²':'m/s²|m/s2|m/s\\^2','m':'m|metres?|meters?','cm':'cm|centimetres?|centimeters?','s':'s|sec|secs|seconds?','kg':'kg|kilograms?','g':'g|grams?','N':'n|newtons?','V':'v|volts?','A':'a|amps?|amperes?','Ω':'ω|ohms?','Hz':'hz|hertz','K':'k|kelvin','°C':'°c|celsius','J':'j|joules?','eV':'ev','nm':'nm|nanometres?','T':'t|tesla'};
const esc=x=>x.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const SUBN={'₀':'0','₁':'1','₂':'2','₃':'3'};
const nz=x=>normQ(String(x).replace(/[₀₁₂₃]/g,d=>SUBN[d])).trim();
// Names a control can be called by. Labels with an index ("charge 1", "m₁") are only matched in full, so the index
// is never mistaken for a value.
function aliases(c,sim){const l=nz(c.label),indexed=/\d/.test(l),w=indexed?[]:l.split(' ').filter(x=>x.length>2&&!STOP.has(x)),a=[l,nz(c.key),...w];
  if(!indexed){if(c.unit==='°')a.push('angle');if(/m\/s$/.test(c.unit||''))a.push('speed','velocity');if(/m\/s²/.test(c.unit||''))a.push('gravity','acceleration')}
  return[...new Set(a.filter(x=>x&&x.length>1))]}
function numbersFor(sim,q){const s=normQ(q),rc=ranges(sim),out={};let bare=s;for(const c of rc)bare=bare.split(' '+nz(c.label)+' ').join(' ');
  for(const c of rc){for(const a of aliases(c,sim)){const con=/\d$/.test(a)?'(?:is|=|to|at|be|of)':'(?:is|=|of|to|at|:|be)?';const m=s.match(new RegExp(`(?:^|\\s)${esc(a)}\\s*${con}\\s*(-?\\d+(?:\\.\\d+)?)`));if(m){out[c.key]=Number(m[1]);break}}
    if(out[c.key]==null&&c.unit&&UNIT_WORDS[c.unit]&&rc.filter(x=>x.unit===c.unit).length===1){const m=bare.match(new RegExp(`(-?\\d+(?:\\.\\d+)?)\\s*(?:${UNIT_WORDS[c.unit]})(?=\\s|$)`));if(m)out[c.key]=Number(m[1])}}
  return out}
function mentioned(sim,q){const s=normQ(q);let best=null,len=0;for(const c of ranges(sim))for(const a of aliases(c,sim))if(s.includes(' '+a+' ')&&a.length>len){best=c;len=a.length}return best}
const clampC=(c,v)=>{const st=c.step||1;return Math.min(c.max,Math.max(c.min,Math.round(v/st)*st))};
function search(c,q){const qt=new Set(toks(q)),s=normQ(q),sim=simObj(),pool=[...c.qa.map(x=>({x,w:1}))];
  for(const [name,ch] of Object.entries(CH))if(name!==sim?.chapter)for(const x of ch.qa)pool.push({x,w:.75});
  const df={};for(const {x} of pool)for(const t of new Set(toks(x.q+' '+x.k.join(' '))))df[t]=(df[t]||0)+1;
  const N=pool.length,scored=pool.map(({x,w})=>{let n=0,hit=0,tm=0;for(const k of x.k)if(s.includes(' '+k.toLowerCase()+' ')||(k.length>5&&s.includes(k.toLowerCase()))){n+=k.length>4?3:1.5;hit++}
    for(const t of new Set(toks(x.q+' '+x.k.join(' '))))if(qt.has(t)){n+=Math.log(1+N/(df[t]||1))*.9;tm++}return{x,n:n*w,sure:hit>0||tm>=2}}).sort((a,b)=>b.n-a.n);
  return scored}
function chat(c){const sim=simObj(),thread=el('div','tutor-chat'),sugg=el('div','tutor-chips');let asked=new Set();
  const scroll=()=>{thread.scrollTop=thread.scrollHeight};
  const me=t=>{const b=el('div','bub me',t);thread.append(b);scroll()};
  const typing=()=>{const d=el('div','bub bot typing');d.append(el('i'),el('i'),el('i'));thread.append(d);scroll();return d};
  async function bot(text,{acts=[],speakIt=true,wait}={}){const tk=run,d=typing();await sleep(wait??Math.min(1100,380+text.length*6));if(tk!==run)return null;
    d.className='bub bot';d.replaceChildren(el('p','',text));if(acts.length){const row=el('div','bub-acts');for(const [label,fn] of acts)row.append(btn('tutor-chip',label,e=>{row.remove();fn(e)}));d.append(row)}
    scroll();if(speakIt)speak(text);return d}
  // the tutor asks back: a quick check from the chapter quiz
  async function check(){const pool=c.quiz.filter(x=>!asked.has(x.q));if(!pool.length)return;const qq=pickOne(pool);asked.add(qq.q);
    const d=await bot(`Quick check: ${qq.q}`,{speakIt:false});if(!d)return;speak(`Quick check. ${qq.q} ${qq.options.map((o,i)=>`Option ${i+1}, ${o}.`).join(' ')}`);
    const row=el('div','bub-opts');qq.options.forEach((o,i)=>row.append(btn('tutor-opt',`${i+1}. ${o}`,()=>{hush();for(const b of row.children)b.disabled=true;row.children[qq.correct].classList.add('right');if(i!==qq.correct)row.children[i].classList.add('wrong');
      me(o);bot(`${i===qq.correct?pickOne(PRAISE):pickOne(SOFT)} ${qq.why}`,{acts:[['Another question',()=>check()],['I want to ask something',()=>inp.focus()]]})})));d.append(row);scroll()}
  // predict-then-reveal for "what if I change X"
  async function whatIf(ctrl,target,label){const p=params(),now=readings(sim,p),then=readings(sim,{...p,[ctrl.key]:target});let k=-1,ch=0;
    now.forEach((m,i)=>{const a=m.n,b=then[i]?.n;if(!isFinite(a)||!isFinite(b))return;const r=Math.abs(b-a)/Math.max(Math.abs(a),Math.abs(b),1e-12);if(r>ch){ch=r;k=i}});
    if(k<0){bot(`${ctrl.label} mainly changes the set-up here - try moving it and watch the stage.`);return}
    const m=now[k].label.toLowerCase(),dir=ch<.01?2:then[k].n>now[k].n?0:1;
    const d=await bot(`${pickOne(OPEN)} Before I tell you - if ${label}, what do you think happens to ${m}?`,{speakIt:false});if(!d)return;speak(`Before I tell you. If ${label}, what do you think happens to ${m}?`);
    const row=el('div','bub-opts');['It increases','It decreases','It stays about the same'].forEach((o,i)=>row.append(btn('tutor-opt',o,()=>{hush();for(const b of row.children)b.disabled=true;row.children[dir].classList.add('right');if(i!==dir)row.children[i].classList.add('wrong');me(o);
      const extra=then.filter((x,j)=>j!==k&&isFinite(x.n)&&isFinite(now[j]?.n)&&x.value!==now[j].value).slice(0,2).map((x,j)=>`${x.label.toLowerCase()} becomes ${x.value}`).join(', ');
      bot(`${i===dir?pickOne(PRAISE):pickOne(SOFT)} ${m[0].toUpperCase()+m.slice(1)} goes from ${now[k].value} to ${then[k].value}${extra?`, and ${extra}`:''}.${sim.formula?` That follows from ${sim.formula}.`:''}`,
        {acts:[['▶ Show me on the stage',async()=>{const tk=++run;await glide({[ctrl.key]:target},1800,tk);launch();bot('There you go - watch the stage!')}],['Quiz me',()=>check()]]})})));d.append(row);scroll()}
  async function answer(q){me(q);hush();
    // 1) numbers in the question → calculate with the simulation
    const vals=numbersFor(sim,q),keys=Object.keys(vals);
    if(keys.length){const rc=ranges(sim),p={...params()},notes=[];for(const k of keys){const ctl=rc.find(x=>x.key===k),v=clampC(ctl,vals[k]);if(v!==vals[k])notes.push(`${ctl.label} can only go from ${ctl.min} to ${ctl.max} here, so I used ${v}`);p[k]=v}
      const r=readings(sim,p),desc=keys.map(k=>{const ctl=rc.find(x=>x.key===k);return`${ctl.label.toLowerCase()} = ${fmtC(ctl,p[k])}`}).join(' and ');
      bot(`Let me calculate that. With ${desc}: ${r.map(m=>`${m.label.toLowerCase()} is ${m.value}`).join(', ')}.${notes.length?' ('+notes.join('; ')+'.)':''}`,
        {acts:[['▶ Set it on the stage',async()=>{const tk=++run;await glide(Object.fromEntries(keys.map(k=>[k,p[k]])),1500,tk);launch();bot('Done - it’s on the stage now.')}],['Quiz me',()=>check()]]});return}
    // 2) "what if I increase / double / halve X"
    const s=normQ(q),ctrl=mentioned(sim,q),up=/\s(increase|raise|more|bigger|higher|larger|double|triple|up)\s/.test(s),down=/\s(decrease|reduce|lower|less|smaller|half|down)\s/.test(s);
    if(ctrl&&(up||down)){const cur=params()[ctrl.key],f=/\sdouble\s/.test(s)?2:/\striple\s/.test(s)?3:/\shalf\s/.test(s)?.5:null;let t=f?cur*f:up?cur+(ctrl.max-cur)*.7:cur-(cur-ctrl.min)*.7;t=clampC(ctrl,t);
      if(t===cur){bot(`${ctrl.label} is already at its ${up?'highest':'lowest'} here (${fmtC(ctrl,cur)}). Try the other way!`);return}
      whatIf(ctrl,t,`${ctrl.label.toLowerCase()} goes from ${fmtC(ctrl,cur)} to ${fmtC(ctrl,t)}`);return}
    // 3) search the notes
    const res=search(c,q),best=res[0];
    if(best&&best.sure&&best.n>=2.4&&(best.n>=4||best.n>res[1].n*1.12)){const a=best.x.a(params());await bot(`${pickOne(OPEN)} ${a}`,{acts:[['Quiz me on this',()=>check()],['Ask another',()=>inp.focus()]]});return}
    const near=res.filter(r=>r.n>.8).slice(0,3).map(r=>r.x);
    if(near.length){bot('Hmm, I’m not completely sure I understood. Did you mean one of these?',{acts:near.map(x=>[x.q,()=>{me(x.q);bot(`${pickOne(OPEN)} ${x.a(params())}`,{acts:[['Quiz me on this',()=>check()]]})}])});return}
    const d=await bot('That one is new to me - I don’t want to guess and tell you something wrong. I can pass it to the Physica team so I learn it.');
    if(d&&window.PhysicaSendFeedback){const b=btn('tutor-mini','Send it to the team',async()=>{b.disabled=true;b.textContent='Sending…';try{await window.PhysicaSendFeedback('Tutor question','-',`[${simId()}] ${q}`);b.textContent='Sent - thank you!'}catch{b.textContent='Could not send'}});d.append(b)}}
  // input bar (type or speak)
  const f=el('form','tutor-ask'),inp=el('input');inp.type='text';inp.maxLength=200;inp.placeholder='Ask me anything… e.g. what if angle is 60?';inp.setAttribute('aria-label','Ask the tutor');
  const go=btn('tutor-go','Ask');go.type='submit';f.append(inp);
  if(Rec){const mic=btn('tutor-mic','🎤',()=>{hush();const r=new Rec();r.lang='en-IN';r.interimResults=false;r.maxAlternatives=1;mic.classList.add('on');mic.textContent='●';
      r.onresult=e=>{inp.value=e.results[0][0].transcript;f.requestSubmit()};r.onend=()=>{mic.classList.remove('on');mic.textContent='🎤'};r.onerror=()=>{inp.placeholder='I couldn’t hear you - please type it'};try{r.start()}catch{}});
    mic.title='Ask by voice';mic.setAttribute('aria-label','Ask by voice');f.append(mic)}
  f.append(go);f.addEventListener('submit',e=>{e.preventDefault();const q=inp.value.trim();if(!q)return;inp.value='';answer(q);paintSugg()});
  const paintSugg=()=>{sugg.replaceChildren();const pool=c.qa.slice(0,14);for(const x of [...pool].sort(()=>Math.random()-.5).slice(0,3))sugg.append(btn('tutor-chip',x.q,()=>{me(x.q);hush();bot(`${pickOne(OPEN)} ${x.a(params())}`,{acts:[['Quiz me on this',()=>check()],['Ask another',()=>inp.focus()]]});paintSugg()}))};
  body.append(thread,f,sugg);paintSugg();
  // greeting: the tutor starts the conversation and asks the student what they want to do
  const r0=readings(sim,params())[0];
  bot(`Hi! I’m Physica, your physics tutor. We’re exploring ${sim.title.toLowerCase()}.${r0?` Right now ${r0.label.toLowerCase()} is ${r0.value}.`:''} What would you like - shall I quiz you, or will you ask me something?`,
    {acts:[['✓ Quiz me',()=>check()],['💬 I’ll ask',()=>inp.focus()],['▶ Show me something',()=>{tab='show';render()}]],wait:500})}
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
