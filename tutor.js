/* Modes (Normal / Student / Teacher, chosen on the landing page).
   Normal: the site as it is. Teacher: a projector view (bigger text and controls). Student: the Physica Tutor -
   ask by typing or voice (pre-written answers built from the live values, read aloud), "Predict → Show me" demos that
   move the sliders by themselves, and a spoken quiz. Voice uses the browser's own speech features; no AI service. */
(() => {
'use strict';
const C=()=>window.PhysicaTutor||{},stage=document.querySelector('.stage'),titleEl=document.getElementById('title');
if(!stage||!titleEl)return;
const el=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!=null)e.textContent=text;return e};
const btn=(cls,text,fn)=>{const b=el('button',cls,text);b.type='button';if(fn)b.addEventListener('click',fn);return b};
const KEY='physica-learn-mode',MODES=[['normal','Normal'],['student','🎓 Student'],['teacher','👩‍🏫 Teacher']];
let mode='normal';try{mode=localStorage.getItem(KEY)||localStorage.getItem('physica-mode')||'normal'}catch{}if(!MODES.some(m=>m[0]===mode))mode='normal';

// ---- mode choice: step 3 on the landing page (the logo brings the landing page back to change it)
const sw=el('div','landing-grades landing-modes');sw.setAttribute('role','group');sw.setAttribute('aria-label','Mode');
const SUB={normal:'Explore freely',student:'Voice tutor, demos and quiz',teacher:'Projector view for class'};
// Normal mode stays the default behind the scenes but has no card; tapping the selected Student / Teacher card again returns to it
for(const [id,label] of MODES){if(id==='normal')continue;const b=btn('land-grade land-mode',null,()=>{rankOpen(false);setMode(id===mode?'normal':id)});b.append(el('b','',label),el('small','',SUB[id]));b.dataset.mode=id;b.dataset.testid='mode-'+id;sw.append(b)}
// ---- Rank mode: NEET / JEE preparation space. Tapping the card slides two exam buttons in underneath; each leads to a "coming soon" page.
const RANK=[['neet','🧬','NEET','Medical entrance'],['jee','⚛️','JEE Mains','Engineering entrance'],['jeeadv','🚀','JEE Advanced','IIT entrance']];
// Rank mode open: the three exam buttons slide in and "Open simulations" is hidden (Rank mode has no simulations)
const rankOpen=open=>{rankSub.classList.toggle('open',open);rankBtn.setAttribute('aria-expanded',String(open));rankSub.inert=!open;const go=document.getElementById('landing-go');if(go)go.hidden=open;document.getElementById('landing')?.classList.toggle('rank-on',open)};
const rankBtn=btn('land-grade land-mode land-rank',null,()=>rankOpen(!rankSub.classList.contains('open')));
rankBtn.setAttribute('aria-expanded','false');rankBtn.setAttribute('aria-controls','rank-sub');rankBtn.dataset.testid='mode-rank';
// simple outline hammer logo (the hammer only the worthy can lift)
const hammer=(cls)=>{const NS='http://www.w3.org/2000/svg',v=document.createElementNS(NS,'svg');v.setAttribute('viewBox','0 0 48 48');v.setAttribute('class',cls);v.setAttribute('aria-hidden','true');v.setAttribute('focusable','false');
  const add=(t,a)=>{const e=document.createElementNS(NS,t);for(const k in a)e.setAttribute(k,a[k]);v.append(e)};
  add('rect',{x:9,y:6,width:30,height:15,rx:3.5,fill:'currentColor','fill-opacity':'.16',stroke:'currentColor','stroke-width':'2.2'});
  add('path',{d:'M17 6v15M31 6v15',stroke:'currentColor','stroke-width':'1.6','stroke-linecap':'round'});
  add('rect',{x:21.5,y:21,width:5,height:19,rx:2,fill:'none',stroke:'currentColor','stroke-width':'2.2'});
  add('path',{d:'M21.5 28h5M21.5 33h5',stroke:'currentColor','stroke-width':'1.4','stroke-linecap':'round'});
  add('circle',{cx:24,cy:43.5,r:2.6,fill:'none',stroke:'currentColor','stroke-width':'2'});return v};
const crown=hammer('rank-logo');const rb=el('b','','Rank mode');
rankBtn.append(crown,rb,el('small','','Completely focused on NEET & JEE aspirants'));sw.append(rankBtn);
const rankSub=el('div','rank-sub');rankSub.id='rank-sub';rankSub.inert=true;const rankIn=el('div','rank-sub-in');rankSub.append(rankIn);
for(const [k,ic,t,sm] of RANK){const b=btn('rank-pick',null,()=>rankSoon(k,t));const i=el('span','rank-ic',ic);i.setAttribute('aria-hidden','true');b.append(i,el('b','',t),el('small','',sm));b.dataset.testid='rank-'+k;rankIn.append(b)}
let rankOv=null;
function rankSoon(k,title){rankOv?.remove();const ov=el('div','rank-ov rank-'+k);ov.setAttribute('role','dialog');ov.setAttribute('aria-label','Rank mode: '+title);ov.dataset.testid='rank-soon';
  const close=()=>{ov.remove();rankOv=null;document.body.classList.remove('rank-open');removeEventListener('keydown',esc);rankBtn.focus()},esc=e=>{if(e.key==='Escape')close()};addEventListener('keydown',esc);
  const back=btn('rank-back','← Back',close);const c=el('div','rank-card');
  const cr=hammer('rank-logo big');
  c.append(cr,el('h1','','Rank mode'),el('h2','',title),el('p','rank-soon','Coming soon'),el('p','rank-line','Completely focused on aspirants.'));
  // background scene: NEET gets the Earth's horizon from orbit; the JEE pages get a glowing grid floor
  const scene=el('div','rank-scene');scene.setAttribute('aria-hidden','true');if(k==='neet'){scene.append(el('div','rank-earth-glow'),el('div','rank-earth'))}else{scene.append(el('div','rank-grid'))}
  ov.append(scene,back,c);document.body.append(ov);document.body.classList.add('rank-open');rankOv=ov;back.focus()}
const goBtn=document.getElementById('landing-go');
if(goBtn){const st=el('div','landing-step3');const h=el('h2','landing-step');h.append(el('span','','1'),document.createTextNode(' Choose your mode'));st.append(h,sw,rankSub);goBtn.before(st)}

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
const CH=()=>window.PhysicaTutorChapters||{};
// the tutor's lessons and notes (~290 KB) live in their own file, downloaded only when a student turns the tutor on
let packWait=null;function loadTutorPack(){if(window.PhysicaTeacher)return Promise.resolve();
  return packWait||(packWait=new Promise((ok,no)=>{const s=document.createElement('script');s.src='__TUTOR_URL__';s.async=true;s.onload=ok;s.onerror=()=>{packWait=null;no()};document.head.append(s)}))}
window.PhysicaLoadTutorPack=loadTutorPack;
const simObj=()=>(window.PhysicaSims||[]).find(x=>x.id===simId());
const num=v=>{const m=String(v).replace(/−/g,'-').match(/-?\d+(\.\d+)?(e-?\d+)?/i);return m?Number(m[0]):NaN};
const readings=(sim,p)=>{try{return(sim.metrics?.(p,0)||[]).map(m=>({label:m.label,value:m.value,n:num(m.value)}))}catch{return[]}};
const ranges=sim=>(sim.controls||[]).filter(c=>!c.options&&typeof c.min==='number');
const span=c=>{const st=c.step||1,r=v=>Math.round(v/st)*st,d=(c.max-c.min)*.15;return[r(c.min+d),r(c.max-d)]};
function effect(sim,c){const p=params(),[lo,hi]=span(c),a=readings(sim,{...p,[c.key]:lo}),b=readings(sim,{...p,[c.key]:hi});let best=-1,ch=0;
  a.forEach((m,i)=>{const x=m.n,y=b[i]?.n;if(!isFinite(x)||!isFinite(y))return;const r=Math.abs(y-x)/Math.max(Math.abs(x),Math.abs(y),1e-12);if(r>ch){ch=r;best=i}});
  return{lo,hi,a,b,i:best,dir:best<0||ch<.01?0:Math.sign(b[best].n-a[best].n)}}
const fmtC=(c,v)=>c.show?c.show(v):`${v}${c.unit?(/^[°%]/.test(c.unit)?'':' ')+c.unit:''}`;
function content(){const id=simId(),sim=simObj();if(!sim||sim.subject!=='physics')return null;const own=C()[id]||{},chap=CH()[sim.chapter]||{qa:[],quiz:[]},rc=ranges(sim);
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
let voice=null,voiceHi=null;const pickVoice=()=>{try{const l=synth?.getVoices()||[];voice=SP.pickVoice(l);voiceHi=SP.pickVoice(l,'hi')}catch{voice=null}};if(synth){pickVoice();synth.addEventListener?.('voiceschanged',pickVoice)}
// sentences grouped into a few natural-length chunks and queued back to back: no gaps added by us, so the voice flows
// and only pauses where a person would (the engine pauses at commas and full stops by itself); normal pace and pitch
let sayTk=0;
function chunksOf(t){const out=[];let cur='';for(const sen of t.split(/(?<=[.!?।])\s+/).filter(Boolean)){if(cur&&(cur+' '+sen).length>220){out.push(cur);cur=sen}else cur=cur?cur+' '+sen:sen}if(cur)out.push(cur);
  return out.flatMap(c=>c.length>280?c.split(/(?<=[,;:])\s+/):[c])}
function speak(text,then,lang,mood){if(!synth||!voiceOn||mode!=='student'){then?.();return}const dev=(String(text).match(/[\u0900-\u097F]/g)||[]).length,lat=(String(text).match(/[a-z]/gi)||[]).length,hi=lang==='hi'||dev>lat,
    // Hinglish is read by the same Hindi voice, its Hindi words in Devanagari (tools/hinglish-voice.js) so the accent stays natural
    HV=window.PhysicaHinglishVoice,hl=!hi&&lang==='hl'&&!!voiceHi&&!!HV,vv=(hi||hl)&&voiceHi?voiceHi:voice;
  let parts=chunksOf(SP.speakable(text));if(!parts.length){then?.();return}
  if(hl)parts=parts.map(p=>p.replace(/[A-Za-z]+(?:'[A-Za-z]+)?/g,w=>w==='Hi'||w==='HI'?w:HV[w.toLowerCase()]||w)); /* "Hi!" is the English greeting, not ही */
  if(mood==='happy'){const m=parts[0].match(/^(.{1,28}?[!?।])\s+(.+)$/);if(m)parts.splice(0,1,m[1],m[2])}
  const [P0,R0,V0]=mood==='happy'?[1.06,1.03,1]:mood==='soft'?[.95,.9,.85]:[1,.98,.95];
  const tk=++sayTk,nat=/natural|neural|online|premium|enhanced/i.test(vv?.name||'');try{if(synth.paused)synth.resume()}catch{}
  parts.forEach((p,k)=>{const u=new SpeechSynthesisUtterance(p);u.lang=hi||hl?'hi-IN':'en-IN';if(vv)try{u.voice=vv;u.lang=vv.lang}catch{}
    const lift=mood==='happy'&&k===0&&parts.length>1?.04:0;u.rate=(nat?1:.98)*R0;u.pitch=(nat?1:1.02)*P0+lift;u.volume=V0;if(k===0)u.onstart=()=>card.classList.add('talking');
    if(k===parts.length-1)u.onend=u.onerror=()=>{if(tk===sayTk){card.classList.remove('talking');then?.()}};synth.speak(u)})}
const hush=()=>{sayTk++;try{synth?.cancel()}catch{}card?.classList.remove('talking')};

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
  for(const b of sw.querySelectorAll('button[data-mode]'))b.setAttribute('aria-pressed',String(b.dataset.mode===mode));
  card.hidden=!on;if(!on)return;tabs.replaceChildren();body.replaceChildren();
  if(!window.PhysicaTeacher){body.append(el('p','tutor-loading','Loading your tutor…'));loadTutorPack().then(()=>{if(mode==='student'&&tutorOn)render()},()=>{body.replaceChildren(el('p','tutor-loading','Could not load the tutor - please check your internet and try again.'))});return}
  if(!c){if(examSet()){tab='exam';const b=btn('','🎯 Exam',()=>render());b.setAttribute('aria-pressed','true');tabs.append(b);window.PhysicaGlass?.(tabs);exam();return}
    body.append(el('p','tutor-note','The AI Tutor covers every physics chapter. Chemistry, Botany and Zoology are coming soon.'));return}
  const list=[['ask','💬 Chat'],['show','▶ Show me'],['quiz','✓ Quiz']];if(examSet())list.push(['exam','🎯 Exam']);else if(tab==='exam')tab='ask';
  for(const [id,label] of list){const b=btn('',label,()=>{tab=id;render()});b.setAttribute('aria-pressed',String(id===tab));tabs.append(b)}
  window.PhysicaGlass?.(tabs);
  ({ask:chat,show,quiz,exam})[tab](c)}

// ---------------------------------------------------------------------------------------------------------------
// Chat: a conversation. The student's question appears as a bubble; the tutor "types", answers in a friendly voice,
// and asks back - a prediction before revealing a result, or a quick check question after an explanation.
// Understanding (no AI service): 1) numbers in the question ("angle 60", "30 m/s") are put into the simulation and
// the result is calculated; 2) "what if I increase/double/halve X" is worked out from the simulation itself;
// 3) otherwise the best answer is searched across this simulation, its chapter and all other physics chapters.
const pickOne=a=>a[Math.floor(Math.random()*a.length)];
const OPENS={hl:['Achha sawaal!','Badhiya sawaal!','Ooh, ye wala mujhe pasand hai.','Chalo saath mein samajhte hain.'],hi:['अच्छा सवाल!','बढ़िया सवाल!','चलो साथ में समझते हैं।']};
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
  for(const [name,ch] of Object.entries(CH()))if(name!==sim?.chapter)for(const x of ch.qa)pool.push({x,w:.75});
  const df={};for(const {x} of pool)for(const t of new Set(toks(x.q+' '+x.k.join(' '))))df[t]=(df[t]||0)+1;
  const N=pool.length,scored=pool.map(({x,w})=>{let n=0,hit=0,tm=0;for(const k of x.k)if(s.includes(' '+k.toLowerCase()+' ')||(k.length>5&&s.includes(k.toLowerCase()))){n+=k.length>4?3:1.5;hit++}
    for(const t of new Set(toks(x.q+' '+x.k.join(' '))))if(qt.has(t)){n+=Math.log(1+N/(df[t]||1))*.9;tm++}return{x,n:n*w,sure:hit>0||tm>=2}}).sort((a,b)=>b.n-a.n);
  return scored}
// questions the tutor could not answer go (anonymously, rate-limited) to the Physica team, who add answers to tutor-learned.js
function logQ(q,p){try{const t=q.trim().replace(/\s+/g,' ').slice(0,200);if(t.length<6||!/\p{L}{2}/u.test(t)||!window.PhysicaSendFeedback)return;
  const seen=JSON.parse(sessionStorage.getItem('physica-asked')||'[]'),key=t.toLowerCase();if(seen.includes(key))return;
  const day=new Date().toISOString().slice(0,10),st=JSON.parse(localStorage.getItem('physica-qlog')||'{}'),now=Date.now();
  if(st.d!==day){st.d=day;st.n=0}if(st.n>=20||now-(st.t||0)<20000)return;st.n++;st.t=now;
  localStorage.setItem('physica-qlog',JSON.stringify(st));seen.push(key);sessionStorage.setItem('physica-asked',JSON.stringify(seen.slice(-50)));
  const sm=simObj();window.PhysicaSendFeedback('Tutor question',[sm?.subject||'physics',sm?.chapter||'-',simId(),p?.lang||'en',p?.level||'-'].join(' | '),t).catch(()=>{})}catch{}}
function chat(c){const sim=simObj(),thread=el('div','tutor-chat'),sugg=el('div','tutor-chips');let asked=new Set();
  const scroll=()=>{thread.scrollTop=thread.scrollHeight};
  const me=t=>{const b=el('div','bub me',t);thread.append(b);scroll()};
  const typing=()=>{const d=el('div','bub bot typing');d.append(el('i'),el('i'),el('i'));thread.append(d);scroll();return d};
  async function bot(text,{acts=[],speakIt=true,wait,lang,mood}={}){const tk=run,d=typing();await sleep(wait??Math.min(650,250+text.length*3));if(tk!==run)return null;
    d.className='bub bot';d.replaceChildren(el('p','',text));if(acts.length){const row=el('div','bub-acts');for(const [label,fn] of acts)row.append(btn('tutor-chip',label,e=>{row.remove();fn(e)}));d.append(row)}
    scroll();if(speakIt)speak(text,null,lang,mood);return d}
  // the tutor asks back: a quick check from the chapter quiz
  async function check(){if(lesson)return quizOne();const pool=c.quiz.filter(x=>!asked.has(x.q));if(!pool.length)return;const qq=pickOne(pool);asked.add(qq.q);
    const d=await bot(`Quick check: ${qq.q}`,{speakIt:false});if(!d)return;speak(`Quick check. ${qq.q} ${qq.options.map((o,i)=>`Option ${i+1}, ${o}.`).join(' ')}`);
    const row=el('div','bub-opts');qq.options.forEach((o,i)=>row.append(btn('tutor-opt',`${i+1}. ${o}`,()=>{hush();for(const b of row.children)b.disabled=true;row.children[qq.correct].classList.add('right');if(i!==qq.correct)row.children[i].classList.add('wrong');
      me(o);i===qq.correct?win():lose();bot(`${i===qq.correct?pickOne(PRAISE):pickOne(SOFT)} ${qq.why}`,{acts:[['Another question',()=>check()],['I want to ask something',()=>inp.focus()]]})})));d.append(row);scroll()}
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
  // ---------------- the teacher: language, level and mood aware lessons (tutor-teacher-content.js) ----------------
  const TC=window.PhysicaTeacher||{chapters:{},phrases:{}},PH=TC.phrases,lesson=TC.chapters[sim.chapter];
  let prof={level:null,lang:'en'};try{Object.assign(prof,JSON.parse(localStorage.getItem('physica-learner')||'{}'))}catch{}
  const saveProf=()=>{try{localStorage.setItem('physica-learner',JSON.stringify(prof))}catch{}};
  const L=o=>o?(o[prof.lang]||o.en):'';
  const HL=/\b(hai|hain|kya|kyun|kyu|kaise|nahi|nhi|samajh|samjh|mein|toh|karo|batao|bataiye|hota|hoti|aur|yeh|ye|kitna|kitni|mujhe|kar|wala|wali|kab|kaun|accha|achha|thik|theek|sawaal|sawal|dikhao|do|ho|hoon|hu|khana|khaya|kahan|kaha|raha|rahe|rahi|padhein|bataun)\b/i;
  // the reply language follows the student; very short messages ("hint", "ok") keep the current language
  const langOf=q=>prof.pick&&prof.pick!=='auto'?prof.pick:/[\u0900-\u097F]/.test(q)?'hi':HL.test(q)?'hl':q.trim().split(/\s+/).length>=3?'en':prof.lang;
  const MOOD={confused:/samajh nahi|samjh nahi|samjh nhi|samajh nhi|nahi samajh|nhi samajh|samajh me nahi|confus|don'?t understand|didn'?t understand|did not understand|not clear|phir se|dobara|again|समझ नहीं|फिर से|दोबारा/i,
    tired:/\bbor(e|ed|ing)?\b|boring|too hard|very hard|difficult|mushkil|tired|\bthak|\bhate\b|irritat|\bugh\b|😭|😢|😩|बोर|मुश्किल|(?:^|\s)थक/i,
    happy:/thank|got it|samajh gaya|samajh gayi|samajh aa gaya|samjh gaya|samjh gayi|\bnice\b|awesome|\bwow\b|maza|mazaa|समझ गया|समझ गई|धन्यवाद/i};
  const HIK={vectors:['सदिश','परिणामी'],components:['घटक'],projectile:['प्रक्षेप्य','परवलय','फेंक'],range:['परास','दूर'],'height-time':['ऊँचाई','उड़ान','समय'],horizontal:['क्षैतिज','छत','चट्टान'],circular:['वृत्त','अभिकेंद्र','घूम'],river:['नदी','नाव','तैर','बारिश']};
  const LV=['basic','average','advanced'],down=l=>LV[Math.max(0,LV.indexOf(l||'average')-1)],up=l=>LV[Math.min(2,LV.indexOf(l||'average')+1)];
  const N=t=>prof.name?t.replace(/^([^!?.।]*?)([!?.।])/,`$1, ${prof.name}$2`):t;let askingName=false;
  const cleanName=q=>{let n=q.trim().replace(/^(mera naam|my name is|my name's|i am|i'm|call me|naam|मेरा नाम|main|mai)\s+/i,'').replace(/\s+(hai|hoon|hu|hun|है|हूँ|हूं)[.!]?$/i,'').replace(/[^\p{L}\p{M}\s.'-]/gu,'').trim().split(/\s+/).slice(0,2).join(' ').slice(0,20);return n?n[0].toUpperCase()+n.slice(1):''};
  let cur=null,curLvl=null,prob=null,hintN=0,crossN=0,teachN=0;
  const ansOf=x=>{const a=x.a(params());return a&&typeof a==='object'?L(a):a};
  // stars (kept on this device) and a streak of right answers, celebrated at 3, 5 and 10
  let streak=0,starEl=null;const paintStars=()=>{if(starEl){starEl.textContent='⭐ '+(prof.stars||0);starEl.title=prof.lang==='hi'?'तुम्हारे सितारे':'Your stars'}};
  function win(quiet){prof.stars=(prof.stars||0)+1;streak++;saveProf();paintStars();if(!quiet&&[3,5,10,20].includes(streak))setTimeout(()=>bot(L(PH.streak).replace('{n}',streak),{lang:prof.lang,mood:'happy',wait:300}),1400)}
  const lose=()=>{streak=0};
  const mcqPool=()=>lesson?[...lesson.concepts.map(x=>x.check),...(lesson.quiz||[])]:[];
  async function quizOne(){const z=pickOne(mcqPool());if(!z)return;const d=await bot(`${L(PH.checkIntro)} ${L(z.q)}`,{lang:prof.lang});if(!d)return;const row=el('div','bub-opts');
    z.o.forEach((o,i)=>row.append(btn('tutor-opt',o,()=>{hush();for(const b of row.children)b.disabled=true;row.children[z.c].classList.add('right');if(i!==z.c)row.children[i].classList.add('wrong');me(o);
      if(i===z.c){win();bot(`${Math.random()<.4?N(L(PH.right)):L(PH.right)} ${L(z.why)}`,{lang:prof.lang,mood:'happy',acts:[[L(PH.another),()=>quizOne()],[L(PH.rapidBtn),()=>rapid()],[L(PH.practice),()=>practice()]]})}
      else{lose();bot(`${L(PH.wrong)} ${L(z.why)}`,{lang:prof.lang,mood:'soft',acts:[[L(PH.another),()=>quizOne()],['📚 '+L(PH.topicsBtn),()=>topics()]]})}})));d.append(row);scroll()}
  async function rapid(){const pool=lesson?mcqPool().map(z=>({q:L(z.q),o:z.o,c:z.c,why:L(z.why)})):c.quiz.map(z=>({q:z.q,o:z.options,c:z.correct,why:z.why}));
    const qs=[...pool].sort(()=>Math.random()-.5).slice(0,5);if(!qs.length)return;let sc=0;if(!await bot(L(PH.rapidIntro),{lang:prof.lang,mood:'happy',wait:300}))return;
    for(let i=0;i<qs.length;i++){const z=qs[i],d=await bot(`${L(PH.rapidQ)} ${i+1}/${qs.length}: ${z.q}`,{lang:prof.lang,wait:350});if(!d)return;
      const pick=await new Promise(res=>{const row=el('div','bub-opts');z.o.forEach((o,j)=>row.append(btn('tutor-opt',o,()=>{hush();for(const b of row.children)b.disabled=true;row.children[z.c].classList.add('right');if(j!==z.c)row.children[j].classList.add('wrong');me(o);res(j)})));d.append(row);scroll()});
      if(pick===z.c){sc++;win(true)}else lose();if(!await bot(`${pick===z.c?'✓':'✗'} ${z.why}`,{lang:prof.lang,wait:250,mood:pick===z.c?'happy':'soft'}))return}
    bot(`${N(L(PH.rapidEnd).replace('{s}',sc).replace('{t}',qs.length))} ${sc>=qs.length-1?L(PH.rapidTop):L(PH.rapidMid)}`,{lang:prof.lang,mood:sc>=qs.length-1?'happy':'soft',acts:[[L(PH.again),()=>rapid()],['✍️ '+L(PH.practice),()=>practice()],['📚 '+L(PH.topicsBtn),()=>topics()]]})}
  // a typed answer to the open practice question is checked against its key numbers (2% tolerance, signs ignored)
  function checkAnswer(q){const t=q.replace(/−/g,'-').replace(/(\d+(?:\.\d+)?)\s*[x×*]\s*10\s*\^\s*(-?\d+)/g,'$1e$2').replace(/\b10\s*\^\s*(-?\d+)/g,'1e$1');
    const got=(t.match(/-?\d+(?:\.\d+)?(?:e-?\d+)?/g)||[]).map(Number);if(!got.length)return false;
    const hit=tol=>prob.num.map(v=>got.some(g=>Math.abs(Math.abs(g)-Math.abs(v))<=Math.max(tol*Math.abs(v),.005)));const ok=hit(.02),near=hit(.1);
    const more=[[L(PH.showHint),()=>hint()],[L(PH.showAns),()=>reveal()]];
    if(ok.every(Boolean)){win();bot(`${Math.random()<.5?N(L(PH.ansRight)):L(PH.ansRight)} ${L(prob.ans)}`,{lang:prof.lang,mood:'happy',acts:[[L(PH.next),()=>practice()],[L(PH.rapidBtn),()=>rapid()]]});prob=null}
    else if(ok.some(Boolean))bot(L(PH.ansPart),{lang:prof.lang,mood:'happy',acts:more});
    else if(near.some(Boolean))bot(L(PH.ansClose),{lang:prof.lang,acts:more});
    else{lose();bot(N(L(PH.ansWrong)),{lang:prof.lang,mood:'soft',acts:more})}
    return true}const factsSeen=new Set(),taught=new Set();
  const dayPart=()=>{const h=new Date().getHours();return h<5?'night':h<12?'morning':h<17?'afternoon':h<21?'evening':'night'};
  // "Did you know?" - a chapter fact first, then a general one; never the same twice in a session
  function fact(){const F=TC.facts||{},pool=[...(F[sim.chapter]||[]),...(F.general||[])],left=pool.filter(f=>!factsSeen.has(f)),f=pickOne(left.length?left:pool);if(!f)return check();factsSeen.add(f);
    bot(`${L(PH.didYouKnow)} ${L(f)}`,{lang:prof.lang,mood:'happy',acts:[[L(PH.oneMore),()=>fact()],[L(PH.backStudy),()=>cur?teach(cur,curLvl||prof.level||'basic'):easy()]]})}
  function easy(){if(!lesson)return check();const c=lesson.concepts.find(x=>!taught.has(x))||lesson.concepts[0];teach(c,'basic',L(PH.easyIntro))}
  const menuActs=()=>[...(lesson?[['📚 '+L(PH.topicsBtn),()=>topics()],['✍️ '+L(PH.practice),()=>{prof.level?practice():askLevel(()=>practice())}]]:[]),['✓ '+L(PH.quiz),()=>check()],[L(PH.rapidBtn),()=>rapid()],[L(PH.interestingBtn),()=>fact()],[L(PH.easyBtn),()=>easy()],[L(PH.askBtn),()=>inp.focus()]];
  const moodActs=()=>['great','ok','tired'].map(m=>[L(PH.moodBtn[m]),()=>{me(L(PH.moodBtn[m]));if(m==='tired')prof.level=prof.level||'basic';
    bot(`${m==='great'?L(PH.moodReply[m]):N(L(PH.moodReply[m]))} ${L(PH.todayWe)} ${prof.lang==='en'?sim.title.toLowerCase():sim.title}.`,{lang:prof.lang,mood:m==='tired'?'soft':'happy',acts:m==='great'?menuActs():[[L(PH.easyBtn),()=>easy()],[L(PH.interestingBtn),()=>fact()],...menuActs().slice(0,2)]})}]);
  // everyday chat between lessons (greetings, "kaise ho", "khana khaya"...), only for short messages
  const TALK=[[/^(mera naam|my name is|my name's|call me|मेरा नाम)\s+\S/,t=>{const n=cleanName(t);if(n){prof.name=n;saveProf();bot(L(PH.niceName).replace('{n}',n),{lang:prof.lang,mood:'happy',acts:menuActs()})}else bot(L(PH.askName),{lang:prof.lang})}],
    [/^(bye|by|tata|alvida|chalta|chalti|see you|cya|बाय|अलविदा)(?=$|[\s!.,?])/,()=>bot(N(L(PH.bye)),{lang:prof.lang,mood:'soft'})],
    [/^(good ?night|gn|shubh ratri|शुभ रात्रि)(?=$|[\s!.,?])/,()=>bot(N(L(PH.night)),{lang:prof.lang,mood:'soft'})],
    [/^(hi+|hello+|hey+|helo|namaste|namaskar|good (morning|afternoon|evening)|gm|नमस्ते|नमस्कार|सुप्रभात|हेलो|हाय)(?=$|[\s!.,?])/,t=>bot(`${N(L(PH.greet[(t.match(/morning|afternoon|evening/)||[])[0]||dayPart()]))} ${L(PH.greetBack)}`,{lang:prof.lang,mood:'happy',acts:moodActs()})],
    [/(kaise|kaisi|kese|kesi) ho(?=$|[\s?!.,])|how are (you|u)[\s?!.]*$|how r u|kya haal|कैसे हो|कैसी हो|क्या हाल/,()=>bot(L(PH.howMe),{lang:prof.lang,mood:'happy',acts:moodActs()})],
    [/khana kha|khaana kha|kha liya|did you eat|have you eaten|had (your )?(lunch|dinner|breakfast)|खाना खा|नाश्ता/,()=>bot(L(PH.food),{lang:prof.lang,mood:'happy',acts:menuActs()})],
    [/(kahan|kaha|kidhar) ho(?=$|[\s?!.,])|where are (you|u)|कहाँ हो|कहां हो/,()=>bot(L(PH.where),{lang:prof.lang,mood:'happy',acts:menuActs()})],
    [/kya kar rah[eia]|what are (you|u) doing|wyd|क्या कर रह/,()=>bot(L(PH.doing),{lang:prof.lang,mood:'happy',acts:menuActs()})],
    [/kaisa lag (raha|rha)|how do you feel|how('?s| is) your day|कैसा लग रहा/,()=>bot(L(PH.feel),{lang:prof.lang,mood:'happy',acts:moodActs()})],
    [/(tum|aap) kaun|who are (you|u)|your name|(tumhara|aapka) naam|तुम कौन|आप कौन|तुम्हारा नाम/,()=>bot(L(PH.who),{lang:prof.lang,mood:'happy',acts:menuActs()})],
    [/^(i'?m |i am |main |mai |me )?(good|fine|great|ok|okay|achha|accha|acha|badhiya|mast|theek|thik|बढ़िया|अच्छा|ठीक|मस्त)( hoon| hu| hun| हूँ| हूं| hai| हैं)?[!. ]*$/,()=>bot(L(PH.fine),{lang:prof.lang,mood:'happy',acts:menuActs()})]];
  const LOOSE=[[/rapid|jhatpat|quick quiz|रैपिड|झटपट/,()=>rapid()],[/interesting|fun fact|kuch naya batao|amazing fact|rochak|दिलचस्प|रोचक|मज़ेदार बात|mazedaar baat/,()=>fact()],
    [/(kuch |something )?easy (padh|sikha|topic|se|one)|aasaan|asaan|something easy|आसान/,()=>easy()]];
  function findConcept(q){if(!lesson)return null;const s=normQ(q),raw=q.toLowerCase();let best=null,sc=0;
    for(const c of lesson.concepts){let n=0;for(const k0 of c.k){const k=normQ(k0).trim();if(k&&(s.includes(' '+k+' ')||(k.length>4&&s.includes(k))))n+=k.includes(' ')?3:k.length>4?2:1}for(const k of c.hk||HIK[c.id]||[])if(raw.includes(k))n+=2;if(n&&c===cur)n+=.5;if(n>sc){sc=n;best=c}}return sc>=2?best:null}
  const lessonActs=c=>[[L(PH.yes),()=>checkC(c)],[L(PH.little),()=>another(c)],[L(PH.no),()=>curLvl==='basic'?another(c,true):teach(c,down(curLvl),N(L(PH.confused)),'soft')],
    [L(PH.ex),()=>bot(`${L(PH.example)} ${L(c.example)}`,{lang:prof.lang,acts:[[L(PH.an),()=>another(c)],[L(PH.quiz),()=>checkC(c)]]})]];
  function another(c,soft){bot(`${soft?N(L(PH.confused))+' ':''}${L(PH.analogy)} ${L(c.analogy)} ${L(PH.mistake)} ${L(c.mistake)}`,{lang:prof.lang,mood:soft?'soft':'calm',acts:[[L(PH.quiz),()=>checkC(c)],[L(PH.practice),()=>practice()]]})}
  function teach(c,lvl,pre='',mood){cur=c;curLvl=lvl;crossN=0;taught.add(c);const acts=lessonActs(c);if(++teachN%3===0)acts.push([L(PH.interestingBtn),()=>fact()]);bot(`${pre?pre+' ':''}${L(c.title)} - ${L(c.levels[lvl])} ${L(PH.understood)}`,{lang:prof.lang,acts,mood:mood||(pre?'soft':'calm')})}
  function askLevel(then){bot(`${L(PH.askLevel)}`,{lang:prof.lang,acts:LV.map(l=>[L(PH.lvlOpts[l]),()=>{prof.level=l;saveProf();me(L(PH.lvlOpts[l]));bot(L(PH.lvlSet[l]),{lang:prof.lang,wait:500}).then(()=>then?.())}])})}
  async function checkC(c){const k=c.check,d=await bot(`${L(PH.checkIntro)} ${L(k.q)}`,{lang:prof.lang});if(!d)return;const row=el('div','bub-opts');
    k.o.forEach((o,i)=>row.append(btn('tutor-opt',o,()=>{hush();for(const b of row.children)b.disabled=true;row.children[k.c].classList.add('right');if(i!==k.c)row.children[i].classList.add('wrong');me(o);
      if(i===k.c)win(),bot(`${Math.random()<.5?N(L(PH.right)):L(PH.right)} ${L(k.why)}`,{lang:prof.lang,mood:'happy',acts:[[L(PH.practice),()=>practice()],[L(PH.deeper),()=>teach(c,up(curLvl))]]});
      else lose(),bot(`${L(PH.wrong)} ${L(k.why)}`,{lang:prof.lang,mood:'soft',acts:[[L(PH.more),()=>teach(c,down(curLvl))],[L(PH.ex),()=>bot(`${L(PH.example)} ${L(c.example)}`,{lang:prof.lang})]]})})));d.append(row);scroll()}
  function practice(){if(!lesson)return check();const lv=prof.level||'average',pool=lesson.problems.filter(p=>p.lvl===lv&&p!==prob);prob=pickOne(pool.length?pool:lesson.problems.filter(p=>p!==prob));hintN=0;
    bot(`${L(PH.problemIntro)} ${L(prob.q)}${prob.num?' '+L(PH.typeIt):''}`,{lang:prof.lang,acts:[[L(PH.showHint),()=>hint()],[L(PH.showAns),()=>reveal()]]})}
  function hint(){if(!prob)return;if(hintN>=prob.hints.length){bot(L(PH.noMoreHints),{lang:prof.lang,acts:[[L(PH.showAns),()=>reveal()]]});return}
    const h=prob.hints[hintN++];bot(`${L(PH.hint)} ${hintN}: ${L(h)}`,{lang:prof.lang,acts:[[L(PH.showHint),()=>hint()],[L(PH.showAns),()=>reveal()]]})}
  function reveal(){if(!prob)return;bot(`${L(PH.answer)}: ${L(prob.ans)}`,{lang:prof.lang,acts:[[L(PH.next),()=>practice()],[L(PH.quiz),()=>check()]]});prob=null}
  function topics(){if(!lesson)return false;bot(L(PH.topics),{lang:prof.lang,acts:lesson.concepts.map(c=>[L(c.title),()=>{me(L(c.title));prof.level?teach(c,prof.level):askLevel(()=>teach(c,prof.level))}])});return true}
  // returns true when the teacher handled the message
  function teacher(q){prof.lang=langOf(q);saveProf();const s=normQ(q),raw=q.toLowerCase();
    if(prob&&/hint|sanket|संकेत|clue|help/.test(raw)){hint();return true}
    if(prob&&/answer|solution|jawab|उत्तर|हल/.test(raw)&&!/\d/.test(raw)){reveal();return true}
    if(prob?.num&&(raw.trim().split(/\s+/).length<=8||/ans|=|jawab|उत्तर/.test(raw))&&checkAnswer(q))return true;
    const words=raw.trim().split(/\s+/).length,t=raw.trim();
    if(words<=8)for(const [re,fn] of TALK)if(re.test(t)){fn(t);return true}
    if(words<=10&&!/(question|sawaal|sawal|problem|practice|प्रश्न|सवाल)/.test(raw))for(const [re,fn] of LOOSE)if(re.test(t)){fn();return true}
    // a question with values, or "what if I change X", is calculated by the simulation instead
    if(Object.keys(numbersFor(sim,q)).length||(mentioned(sim,q)&&/\s(increase|raise|more|bigger|higher|larger|double|triple|decrease|reduce|lower|less|smaller|half)\s/.test(s)))return false;
    const c=findConcept(q);
    if(MOOD.confused.test(q)){const t=c||cur;if(t){prof.level=down(prof.level);saveProf();teach(t,down(curLvl||prof.level),N(L(PH.confused)),'soft')}else{bot(N(L(PH.confused)),{lang:prof.lang,wait:400,mood:'soft'}).then(()=>topics())}return true}
    if(MOOD.tired.test(q)){bot(N(L(PH.tired)),{lang:prof.lang,wait:500,mood:'soft'}).then(d=>{if(d)fact()});return true}
    if(MOOD.happy.test(q)&&!c){bot(L(PH.happy),{lang:prof.lang,mood:'happy',acts:[[L(PH.practice),()=>practice()],[L(PH.quiz),()=>check()]]});return true}
    if(lesson&&/(question|sawaal|sawal|problem|practice|numerical|प्रश्न|सवाल)/.test(raw)&&/(give|de|do|chahiye|dijiye|try|दो|दीजिए|चाहिए)/.test(raw)){practice();return true}
    if(lesson&&/(topic|topics|syllabus|kya seekh|what can i learn|कौन से|विषय)/.test(raw)){topics();return true}
    if(cur&&/(example|udaharan|उदाहरण|real life)/.test(raw)&&!c){bot(`${L(PH.example)} ${L(cur.example)}`,{lang:prof.lang,acts:lessonActs(cur)});return true}
    if(cur&&/(deeper|more detail|advanced|aur detail|गहराई)/.test(raw)&&!c){teach(cur,up(curLvl));return true}
    if(c){if(!prof.level){askLevel(()=>teach(c,prof.level));return true}teach(c,prof.level);return true}
    // cross question on the concept just taught: answer from a new angle (analogy, then example, then the usual mistake)
    // (only when it is about that concept - a brand-new topic goes on to the notes, or to the team)
    const tq=toks(q),about=tq.length<=3||tq.some(t=>t.length>4&&JSON.stringify(cur||'').toLowerCase().includes(t));
    if(cur&&about&&/^\s*(but|why|how|lekin|par|pr|kyun|kyu|kaise|to|toh|so|फिर|लेकिन|पर|क्यों|कैसे)\b/i.test(q)&&!Object.keys(numbersFor(sim,q)).length){
      const step=crossN++%3,t=step===0?`${L(PH.analogy)} ${L(cur.analogy)}`:step===1?`${L(PH.example)} ${L(cur.example)}`:`${L(PH.mistake)} ${L(cur.mistake)}`;
      bot(`${L(PH.cross)} ${t}`,{lang:prof.lang,acts:lessonActs(cur)});return true}
    return false}
  async function answer(q){me(q);hush();
    if(askingName){askingName=false;const looksName=!/[?\d]/.test(q)&&q.trim().split(/\s+/).length<=5;const n=looksName?cleanName(q):'';if(!looksName){if(!teacher(q))answerRest(q);return}if(n){prof.name=n;saveProf();await bot(L(PH.niceName).replace('{n}',n),{lang:prof.lang,mood:'happy',wait:500})}startChat(true);return}
    if(teacher(q))return;answerRest(q)}
  async function answerRest(q){
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
    if(best&&best.sure&&best.n>=2.4&&(best.n>=4||best.n>res[1].n*1.12)){const a=ansOf(best.x);await bot(`${pickOne(OPENS[prof.lang]||OPEN)} ${a}`,{acts:[['✓ '+L(PH.quiz),()=>check()],[L(PH.askBtn),()=>inp.focus()]]});return}
    const near=res.filter(r=>r.n>.8).slice(0,3).map(r=>r.x);
    if(near.length){logQ(q,prof);bot(L(PH.unsure),{lang:prof.lang,mood:'soft',acts:near.map(x=>[x.q,()=>{me(x.q);bot(`${pickOne(OPENS[prof.lang]||OPEN)} ${ansOf(x)}`,{acts:[['✓ '+L(PH.quiz),()=>check()]]})}])});return}
    logQ(q,prof);bot(L(PH.unknown),{lang:prof.lang,mood:'soft'})}
  // input bar (type or speak)
  const f=el('form','tutor-ask'),inp=el('input');inp.type='text';inp.maxLength=200;inp.placeholder='Ask me anything… e.g. what if angle is 60?';inp.setAttribute('aria-label','Ask the tutor');
  const go=btn('tutor-go','Ask');go.type='submit';f.append(inp);
  if(Rec){let rec=null;const idle=()=>{rec=null;mic.classList.remove('on');mic.textContent='🎤';mic.setAttribute('aria-pressed','false')};
    // one tap starts listening, a second tap stops it (it also stops by itself when the student stops speaking)
    const mic=btn('tutor-mic','🎤',()=>{if(rec){const r=rec;idle();try{r.abort()}catch{}return}hush();const r=new Rec();rec=r;r.lang='en-IN';r.interimResults=false;r.maxAlternatives=1;mic.classList.add('on');mic.textContent='●';mic.setAttribute('aria-pressed','true');
      r.onresult=e=>{if(rec!==r)return;inp.value=e.results[0][0].transcript;f.requestSubmit()};r.onend=()=>{if(rec===r)idle()};r.onerror=e=>{if(rec===r){idle();if(e?.error!=='aborted')inp.placeholder='I couldn’t hear you - please type it'}};try{r.start()}catch{idle()}});
    mic.title='Ask by voice';mic.setAttribute('aria-label','Ask by voice');f.append(mic)}
  f.append(go);f.addEventListener('submit',e=>{e.preventDefault();const q=inp.value.trim();if(!q)return;inp.value='';answer(q);paintSugg()});
  const paintSugg=()=>{sugg.replaceChildren();const pool=c.qa.slice(0,14);for(const x of [...pool].sort(()=>Math.random()-.5).slice(0,3))sugg.append(btn('tutor-chip',x.q,()=>{me(x.q);hush();bot(`${pickOne(OPENS[prof.lang]||OPEN)} ${ansOf(x)}`,{acts:[['✓ '+L(PH.quiz),()=>check()],[L(PH.askBtn),()=>inp.focus()]]});paintSugg()}))};
  body.append(thread,f,sugg);paintSugg();
  // greeting: the tutor starts the conversation and asks the student what they want to do
  const r0=readings(sim,params())[0];
  // greeting: asks the student's name once (kept only on this device), then time of day + daily check-in
  const ph0=inp.placeholder;
  function startChat(afterName){inp.placeholder=ph0;let fresh=true;try{const d=new Date().toDateString();fresh=localStorage.getItem('physica-checkin')!==d;localStorage.setItem('physica-checkin',d)}catch{}
    const intro=afterName?'':`${N(L(PH.greet[dayPart()]))} ${L(PH.hello)} `;
    bot(`${intro}${fresh?N(L(PH.howToday)):`${L(PH.todayWe)} ${prof.lang==='en'?sim.title.toLowerCase():sim.title}. ${L(PH.anyLang)}`}`,{lang:prof.lang,wait:500,mood:'happy',acts:fresh?moodActs():menuActs()})}
  if(!prof.name&&!prof.noName){askingName=true;bot(`${L(PH.greet[dayPart()])} ${L(PH.hello)} ${L(PH.askName)}`,{lang:prof.lang,wait:500,mood:'happy',acts:[[L(PH.skipName),()=>{askingName=false;prof.noName=true;saveProf();startChat(true)}]]});inp.placeholder=prof.lang==='hi'?'अपना नाम लिखो…':prof.lang==='hl'?'Apna naam likho…':'Type your name…'}
  else startChat(false);
  // language: Auto (follows what the student types) or a fixed English / Hinglish / Hindi
  const lb=el('div','tutor-langbar'),ls=el('select','tutor-lang');ls.setAttribute('aria-label','Tutor language');
  for(const [v,t] of [['auto','Auto'],['en','English'],['hl','Hinglish'],['hi','हिंदी']]){const o=el('option','',t);o.value=v;ls.append(o)}ls.value=prof.pick||'auto';
  ls.addEventListener('change',()=>{hush();prof.pick=ls.value;if(ls.value!=='auto')prof.lang=ls.value;saveProf();bot(ls.value==='auto'?L(PH.langAuto):L(PH.langSet),{lang:prof.lang,mood:'happy',acts:menuActs()})});
  starEl=el('span','tutor-stars');paintStars();lb.append(starEl,el('span','','🌐'),ls);thread.before(lb)}
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

// Exam (English): Board, JEE and NEET kept apart. Board and practice questions show a step-by-step answer on request and the
// student marks each one "got it" or "revise"; MCQs are checked at once. JEE and NEET also offer the chapter's timed
// mock test (tutor-mock.js) and its past reports. Progress stays on this device.
// the questions live in their own pack (tools/build.js), fetched the first time the Exam tab opens; the tutor pack
// carries only the list of chapters that have them
const examSet=()=>{const s=simObj();return s&&(window.PhysicaExamChapters||[]).includes(s.chapter)};
let examTrack='board',examType='all';
addEventListener('physica-mock-close',e=>{if(examSet()){tab='exam';if(e.detail)examTrack=e.detail;render()}});
function exam(){const tracks=simObj()?.grade===10?[['board','Board practice'],['cbse','CBSE mock test']]:[['board','Board'],['jee','JEE'],['neet','NEET']];if(!tracks.some(t=>t[0]===examTrack))examTrack='board';
  if(!window.PhysicaExam){body.append(el('p','tutor-loading','Loading the questions…'));window.PhysicaLoadExam().then(()=>{if(tab==='exam')render()},()=>{body.replaceChildren(el('p','tutor-loading','Could not load the questions - please check your internet and try again.'))});return}
  const sim=simObj(),qs=window.PhysicaExam[sim.chapter]||[],key=n=>`${sim.chapter}#${n}`;let done={};
  try{done=JSON.parse(localStorage.getItem('physica-exam')||'{}')||{}}catch{}
  const save=()=>{try{localStorage.setItem('physica-exam',JSON.stringify(done))}catch{}},board=['1','3','5'],
    mine=qs.map((x,n)=>n).filter(n=>examTrack==='board'?board.includes(qs[n].t):qs[n].t===examTrack),
    prog=el('p','tutor-exam-prog'),paint=()=>{prog.textContent=`${mine.filter(n=>done[key(n)]===1).length} / ${mine.length} mastered`};
  const chipRow=(list,cur,set)=>{const r=el('div','tutor-chips');for(const [k,t] of list){const b=btn('tutor-chip',t,()=>{set(k);render()});b.setAttribute('aria-pressed',String(k===cur));r.append(b)}return r};
  body.append(chipRow(tracks,examTrack,k=>{examTrack=k}),prog);
  if(examTrack==='board')body.append(chipRow([['all','All'],['1','1 mark'],['3','2-3 marks'],['5','5 marks']],examType,k=>{examType=k}));
  const M=window.PhysicaMockTest,info=examTrack!=='board'&&M?.info(sim.chapter,examTrack);
  if(info){const m=el('div','tutor-mock');
    m.append(el('b','',`⏱ ${info.name} mock test`),el('p','tutor-why',`${info.n} questions · ${info.min} min · +${info.plus}${info.minus?' / −'+info.minus:', no negative marking'} · result after you submit`),btn('tutor-mini','Start mock test',()=>{hush();M.start(sim.chapter,examTrack)}));
    for(const r of M.past(sim.chapter,examTrack).slice(0,3)){const c=r.res.filter(x=>x==='c').length,w=r.res.filter(x=>x==='w').length;
      m.append(btn('tutor-mini',`📄 ${new Date(r.at).toLocaleDateString()} · ${info.plus*c-info.minus*w} / ${info.plus*r.res.length}`,()=>{hush();M.open(r)}))}
    body.append(m);if(mine.length)body.append(el('p','tutor-note','Practice questions'))}
  paint();
  for(const n of mine){const x=qs[n];if(examTrack==='board'&&examType!=='all'&&x.t!==examType)continue;
    const q=el('div','tutor-q'),ttl=el('b','',`${x.t==='jee'?'JEE':x.t==='neet'?'NEET':x.t==='1'?'1 mark':x.t==='3'?'2-3 marks':'5 marks'} · ${x.q} `),ans=el('p','tutor-why tutor-ans',x.a),row=el('div','tutor-chips');ans.hidden=true;
    const mark=()=>q.classList.toggle('got',done[key(n)]===1);mark();
    const say=t=>{hush();speak(t,null,'en')};
    if(synth){const r=btn('tutor-read','🔊',()=>say(`${x.q} ${x.o?x.o.map((o,i)=>`${i+1}: ${o}.`).join(' '):''}`));r.title='Read this question';r.setAttribute('aria-label','Read question aloud');ttl.append(r)}
    q.append(ttl);{const g=window.PhysicaFig?.(x.fig);if(g)q.append(g)}
    if(x.o){const opts=el('div','tutor-opts');x.o.forEach((o,i)=>opts.append(btn('tutor-opt',`${i+1}. ${o}`,()=>{if(q.dataset.done)return;q.dataset.done='1';opts.children[x.c].classList.add('right');if(i!==x.c)opts.children[i].classList.add('wrong');ans.hidden=false;done[key(n)]=i===x.c?1:0;save();mark();paint();say(`${i===x.c?'Correct!':'Not quite.'} ${x.a}`)})));q.append(opts,ans)}
    else{const grade=el('span','tutor-chips'),show=btn('tutor-mini','Show answer',()=>{ans.hidden=false;show.hidden=true;grade.hidden=false;say(x.a)});grade.hidden=true;
      grade.append(btn('tutor-mini','✓ Got it',()=>{done[key(n)]=1;save();mark();paint()}),btn('tutor-mini','↺ Revise again',()=>{done[key(n)]=0;save();mark();paint()}));
      row.append(show,grade);q.append(ans)}
    if(x.sim&&x.sim!==sim.id)row.append(btn('tutor-mini','▶ Try it in the simulation',()=>{hush();location.hash=x.sim}));
    if(row.childElementCount)q.append(row);body.append(q)}}

// students get the tutor pack fetched quietly in the background, so turning the tutor on is instant
const prefetchTutor=()=>{if(mode==='student'&&!window.PhysicaTeacher)(window.requestIdleCallback||setTimeout)(()=>loadTutorPack().catch(()=>{}),{timeout:2500})};
function setMode(m){mode=m;try{localStorage.setItem(KEY,m)}catch{}tab='ask';render();prefetchTutor();window.dispatchEvent(new Event('resize'))}
prefetchTutor();
new MutationObserver(()=>{if(mode==='student'&&tutorOn)render()}).observe(titleEl,{childList:true,characterData:true,subtree:true});
render();
})();
