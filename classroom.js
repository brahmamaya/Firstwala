/* Classroom tools for Teacher mode (projector / smartboard): draw on the stage, a class poll that the simulation
   answers by itself, a big-screen quiz from the chapter's NEET question bank, a countdown timer with a bell and a
   random student picker. Everything runs in the browser; nothing is sent anywhere. */
(() => {
'use strict';
const S=window.PhysicaState,canvas=document.getElementById('simulation'),host=canvas?.parentElement;if(!S||!canvas||!host)return;
const el=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
const btn=(c,x,f)=>{const b=el('button',c,x);b.type='button';if(f)b.addEventListener('click',f);return b};
const store=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch{}},read=(k,d)=>{try{const v=JSON.parse(localStorage.getItem(k));return v??d}catch{return d}};
const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const L='ABCDE';

/* ---------- full-screen overlay ---------- */
let ov=null;
function overlay(title,onClose){closeOv();ov=el('div','cls-ov');ov.setAttribute('role','dialog');ov.setAttribute('aria-label',title);ov.dataset.testid='cls-overlay';
  const head=el('div','cls-head');head.append(el('h2','',title),btn('cls-x','×',closeOv));head.lastChild.setAttribute('aria-label','Close');
  const body=el('div','cls-body');ov.append(head,body);ov._close=onClose;document.body.append(ov);document.body.classList.add('cls-open');head.lastChild.focus();return body}
function closeOv(){if(!ov)return;const f=ov._close;ov.remove();ov=null;document.body.classList.remove('cls-open');f?.()}
addEventListener('keydown',e=>{if(e.key==='Escape'&&ov)closeOv()});

/* ---------- 1. pen: draw over the stage ---------- */
const pad=el('canvas','cls-pad');pad.dataset.testid='cls-pad';pad.hidden=true;host.append(pad);
const pctx=pad.getContext('2d');let strokes=[],cur=null,penOn=false,ink='#ffd84d';
const penBar=el('div','cls-penbar');penBar.hidden=true;host.append(penBar);
for(const c of['#ffd84d','#ff5d5d','#4ee6d1','#ffffff']){const b=btn('cls-ink','',()=>{ink=c;for(const x of penBar.querySelectorAll('.cls-ink'))x.classList.toggle('on',x===b)});b.style.background=c;b.setAttribute('aria-label','Pen colour');if(c===ink)b.classList.add('on');penBar.append(b)}
penBar.append(btn('cls-pbtn','Undo',()=>{strokes.pop();paint()}),btn('cls-pbtn','Clear',()=>{strokes=[];paint()}),btn('cls-pbtn cls-done','Done',()=>pen(false)));
function fit(){const r=host.getBoundingClientRect(),d=Math.min(2,devicePixelRatio||1);pad.width=Math.round(r.width*d);pad.height=Math.round(r.height*d);paint()}
function paint(){const w=pad.width,h=pad.height;pctx.clearRect(0,0,w,h);pctx.lineCap='round';pctx.lineJoin='round';
  for(const s of strokes){pctx.strokeStyle=s.c;pctx.lineWidth=Math.max(2,w*.004);pctx.beginPath();s.p.forEach(([x,y],i)=>i?pctx.lineTo(x*w,y*h):pctx.moveTo(x*w,y*h));if(s.p.length===1)pctx.lineTo(s.p[0][0]*w+.1,s.p[0][1]*h);pctx.stroke()}}
const pos=e=>{const r=pad.getBoundingClientRect();return[(e.clientX-r.left)/r.width,(e.clientY-r.top)/r.height]};
pad.addEventListener('pointerdown',e=>{if(!penOn)return;e.preventDefault();pad.setPointerCapture?.(e.pointerId);cur={c:ink,p:[pos(e)]};strokes.push(cur);paint()});
pad.addEventListener('pointermove',e=>{if(!cur)return;e.preventDefault();cur.p.push(pos(e));paint()});
const end=()=>{cur=null};pad.addEventListener('pointerup',end);pad.addEventListener('pointercancel',end);
function pen(on){penOn=on;pad.hidden=!on&&!strokes.length;pad.classList.toggle('drawing',on);penBar.hidden=!on;if(on)fit();tools.querySelector('[data-k=pen]')?.classList.toggle('on',on)}
addEventListener('resize',()=>{if(!pad.hidden)fit()});
addEventListener('physica-sim',()=>{strokes=[];paint();if(!penOn)pad.hidden=true});

/* ---------- 2. class poll: predict, count hands, the simulation reveals the answer ---------- */
function setControl(k,v){const i=document.getElementById('control-'+k);if(!i){S.params[k]=v;return}i.value=v;i.dispatchEvent(new Event('input',{bubbles:true}))}
function poll(){const E=window.PhysicaExplore,sim=S.sim,p=S.params;if(!E||!sim)return;
  const xs=(sim.controls||[]).filter(c=>!c.options&&c.max>c.min),ys=E.readings(sim,p,S.time);
  const body=overlay('Class poll — predict, then watch');if(!xs.length||!ys.length){body.append(el('p','cls-big','This simulation has no variable to poll on. Try another experiment.'));return}
  const st={x:xs[0].key,y:ys[0]};const pick=el('div','cls-pick'),sx=el('select','ex-sel'),sy=el('select','ex-sel');
  sx.append(...xs.map(c=>{const o=el('option','',c.label);o.value=c.key;return o}));sy.append(...ys.map(l=>{const o=el('option','',l);o.value=l;return o}));
  const lx=el('label','ex-f'),ly=el('label','ex-f');lx.append(el('span','','Change'),sx);ly.append(el('span','','and watch'),sy);pick.append(lx,ly);
  const ask=el('div');body.append(pick,ask);
  const draw=()=>{st.x=sx.value;st.y=sy.value;ask.replaceChildren();const c=xs.find(c=>c.key===st.x),res=E.sweep(sim,p,S.time,st.x,st.y);
    if(!res){ask.append(el('p','cls-big','This reading cannot be predicted for this variable; choose another.'));return}
    const ans=E.trend(res.pts).t,q=el('p','cls-q',`As ${c.label.toLowerCase()} increases from ${+c.min.toPrecision(4)} to ${+c.max.toPrecision(4)}${c.unit?' '+c.unit:''}, what happens to ${st.y.toLowerCase()}?`);
    const votes=E.CH.map(()=>0),grid=el('div','cls-opts');
    E.CH.forEach(([k,t],i)=>{const o=el('div','cls-opt');o.dataset.k=k;const n=el('b','cls-n','0');o.append(el('span','cls-l',L[i]),el('span','cls-t',t),btn('cls-cnt','−',()=>{votes[i]=Math.max(0,votes[i]-1);n.textContent=votes[i]}),n,btn('cls-cnt','+',()=>{votes[i]++;n.textContent=votes[i]}));grid.append(o)});
    const go=btn('cls-go','▶ Reveal with the simulation',async()=>{
      const from=p[st.x];closeOv();const t0=performance.now(),ms=6000,stp=c.step||0;
      await new Promise(done=>{const f=()=>{const k=Math.min(1,(performance.now()-t0)/ms);let v=c.min+(c.max-c.min)*k;if(stp)v=c.min+Math.round((v-c.min)/stp)*stp;setControl(st.x,+v.toFixed(10));k<1?requestAnimationFrame(f):done()};f()});
      const tot=votes.reduce((a,b)=>a+b,0),ok=E.CH.findIndex(([k])=>k===ans),b2=overlay('Answer',()=>setControl(st.x,from));
      b2.append(el('p','cls-q',`${st.y} ${E.WORD[ans]} as ${c.label.toLowerCase()} increases.`));
      if(ok>=0)b2.append(el('p','cls-big ok',`Correct option: ${L[ok]} — ${E.CH[ok][1]}`));
      if(tot)b2.append(el('p','cls-big',`${votes[ok]||0} of ${tot} students (${Math.round((votes[ok]||0)/tot*100)}%) predicted correctly.`));
      const fig=window.PhysicaLabGraph?.({x:r=>r[0],y:r=>r[1],xl:c.label+(c.unit?` (${c.unit})`:''),yl:st.y+(res.unit?` (${res.unit})`:''),curve:true,nodots:res.pts.length>15},res.pts);if(fig){fig.classList.add('cls-fig');b2.append(fig)}
      b2.append(btn('cls-go','Done',closeOv))});
    go.dataset.testid='cls-reveal';ask.append(q,grid,el('p','cls-hint','Ask for a show of hands for each option and tap + to count. Then reveal: the slider moves by itself so the class sees the answer.'),go)};
  sx.addEventListener('change',draw);sy.addEventListener('change',draw);draw()}

/* ---------- 3. big-screen quiz from the chapter's NEET question bank ---------- */
let quizSeen={};
async function quiz(){const ch=S.sim?.chapter,body=overlay('Class quiz'+(ch?' — '+ch:''));body.append(el('p','cls-big','Loading questions…'));
  try{await window.PhysicaLoadTutorPack?.();await window.PhysicaLoadExam?.()}catch{}
  const bank=window.PhysicaMockBank?.[ch]?.neet;if(!ov||ov.lastChild!==body)return;body.replaceChildren();
  if(!bank?.length){body.append(el('p','cls-big','No quiz questions for this chapter yet. Open a Physics experiment to quiz on its chapter.'));return}
  const seen=quizSeen[ch]||(quizSeen[ch]=[]);
  const next=()=>{if(seen.length>=bank.length)seen.length=0;const left=bank.map((_,i)=>i).filter(i=>!seen.includes(i)),k=left[Math.floor(Math.random()*left.length)];seen.push(k);show(bank[k])};
  const show=q=>{body.replaceChildren();body.append(el('p','cls-count',`Question ${seen.length} of ${bank.length}`),el('p','cls-q',q.q));const g=window.PhysicaFig?.(q.fig);if(g){g.classList.add('cls-qfig');body.append(g)}
    const grid=el('div','cls-opts cls-mcq'),opts=q.o.map((o,i)=>{const d=el('div','cls-opt');d.append(el('span','cls-l',L[i]),el('span','cls-t',o));grid.append(d);return d});body.append(grid);
    const bar=el('div','cls-row'),sol=el('div','cls-sol');sol.hidden=true;for(const line of String(q.s||'').split('\n'))sol.append(el('p','',line));
    const sh=btn('cls-go','Show answer',()=>{opts[q.c].classList.add('right');sol.hidden=false;sh.disabled=true});sh.dataset.testid='cls-show';
    bar.append(sh,btn('cls-go cls-alt','Next question →',next));body.append(bar,sol)};
  next()}

/* ---------- 4. countdown timer with a bell ---------- */
const tw=el('div','cls-timer');tw.hidden=true;tw.dataset.testid='cls-timer-box';document.body.append(tw);
let tLeft=120,tRun=false,tEnd=0,tRaf=0;const tShow=el('b','cls-tt','2:00'),tGo=btn('cls-pbtn','Start');
const fmtT=s=>{s=Math.max(0,Math.ceil(s));return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')};
function bell(){try{const A=new (window.AudioContext||window.webkitAudioContext)();[0,.35,.7].forEach(d=>{const o=A.createOscillator(),g=A.createGain();o.frequency.value=880;o.connect(g);g.connect(A.destination);g.gain.setValueAtTime(.0001,A.currentTime+d);g.gain.exponentialRampToValueAtTime(.4,A.currentTime+d+.02);g.gain.exponentialRampToValueAtTime(.0001,A.currentTime+d+.3);o.start(A.currentTime+d);o.stop(A.currentTime+d+.32)});setTimeout(()=>A.close(),1500)}catch{}}
function tTick(){const left=(tEnd-performance.now())/1000;tShow.textContent=fmtT(left);if(left<=0){tRun=false;tLeft=0;tGo.textContent='Start';tw.classList.add('ring');bell();return}tRaf=requestAnimationFrame(tTick)}
tGo.addEventListener('click',()=>{tw.classList.remove('ring');if(tRun){tRun=false;cancelAnimationFrame(tRaf);tLeft=Math.max(0,(tEnd-performance.now())/1000);tGo.textContent='Start'}else{if(tLeft<=0)tLeft=120;tRun=true;tEnd=performance.now()+tLeft*1000;tGo.textContent='Pause';tTick()}});
const tPre=el('div','cls-trow');for(const m of[1,2,3,5,10])tPre.append(btn('cls-pbtn',m+' min',()=>{tRun=false;cancelAnimationFrame(tRaf);tLeft=m*60;tShow.textContent=fmtT(tLeft);tGo.textContent='Start';tw.classList.remove('ring')}));
const tRow=el('div','cls-trow');tRow.append(tGo,btn('cls-pbtn','Close',()=>{tw.hidden=true;tools.querySelector('[data-k=timer]')?.classList.remove('on')}));tw.append(tShow,tPre,tRow);

/* ---------- 5. random student picker (no repeats until everyone is picked) ---------- */
function picker(){const body=overlay('Pick a student');let cfg=read('physica-class',{n:40,names:''}),used=read('physica-class-used',[]);
  const ta=el('textarea','cls-names');ta.placeholder='Student names, one per line (optional)';ta.value=cfg.names||'';ta.rows=4;ta.maxLength=4000;
  const n=el('input','mock-in cls-num');n.type='number';n.min='1';n.max='300';n.value=cfg.n||40;const ln=el('label','lab-f');ln.append(el('span','','Or roll numbers 1 to'),n);
  const big=el('p','cls-name','?');big.dataset.testid='cls-name';const info=el('p','cls-hint');
  const list=()=>{const names=ta.value.split('\n').map(s=>s.trim()).filter(Boolean).slice(0,300);return names.length?names:Array.from({length:Math.max(1,Math.min(300,+n.value||1))},(_,i)=>'Roll no. '+(i+1))};
  const save=()=>{cfg={n:+n.value||40,names:ta.value};store('physica-class',cfg)};ta.addEventListener('input',()=>{save();used=[];store('physica-class-used',used)});n.addEventListener('input',()=>{save();used=[];store('physica-class-used',used)});
  const go=btn('cls-go','🎲 Pick',()=>{const all=list();let left=all.filter(s=>!used.includes(s));if(!left.length){used=[];left=all}let k=0;const spin=setInterval(()=>{big.textContent=left[Math.floor(Math.random()*left.length)];if(++k>12){clearInterval(spin);const w=left[Math.floor(Math.random()*left.length)];big.textContent=w;used.push(w);store('physica-class-used',used);info.textContent=`${used.length} of ${all.length} picked`}},60)});go.dataset.testid='cls-pick-go';
  const rs=btn('cls-go cls-alt','Start again',()=>{used=[];store('physica-class-used',used);big.textContent='?';info.textContent=''});
  const row=el('div','cls-row');row.append(go,rs);body.append(big,row,info,ln,ta)}

/* ---------- the tool dock (Teacher mode only) ---------- */
const tools=el('div','cls-dock');tools.setAttribute('role','toolbar');tools.setAttribute('aria-label','Classroom tools');tools.dataset.testid='cls-dock';tools.hidden=true;
for(const [k,ic,t,f] of[['pen','✏️','Draw',()=>pen(!penOn)],['poll','🗳️','Poll',poll],['quiz','❓','Quiz',quiz],['timer','⏲️','Timer',()=>{tw.hidden=!tw.hidden;tools.querySelector('[data-k=timer]').classList.toggle('on',!tw.hidden)}],['pick','🎲','Pick',picker]]){
  const b=btn('cls-tool',null,f);b.dataset.k=k;b.dataset.testid='cls-'+k;const i=el('span','',ic);i.setAttribute('aria-hidden','true');b.append(i,el('b','',t));tools.append(b)}
document.body.append(tools);
const LP=document.getElementById('landing'),sync=()=>{const B=document.body.classList,on=B.contains('mode-teacher')&&!B.contains('landing-open')&&(!LP||LP.hidden);tools.hidden=!on;if(!on){pen(false);tw.hidden=true;closeOv()}};
const mo=new MutationObserver(sync);mo.observe(document.body,{attributes:true,attributeFilter:['class']});if(LP)mo.observe(LP,{attributes:true,attributeFilter:['hidden','class']});sync();
})();
