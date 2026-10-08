/* Explore: for any simulation, pick a variable and a live reading, predict how the reading will change, then see
   the graph (the simulation's own model swept across the variable's range), a data table and a CSV download.
   Also adds a stopwatch that measures simulated time, so slow motion still gives the physical time. */
(() => {
'use strict';
const S=window.PhysicaState,stage=document.querySelector('.below-stage'),plot=window.PhysicaLabGraph,num=window.PhysicaNum;if(!S||!stage||!plot||!num)return;
const el=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
const btn=(c,x,f)=>{const b=el('button',c,x);b.type='button';b.addEventListener('click',f);return b};
const fmt=v=>{if(!Number.isFinite(v))return'—';const a=Math.abs(v);return a!==0&&(a>=1e5||a<1e-3)?v.toExponential(3):String(+v.toPrecision(5))};

// A reading is usable when it is one number followed by a unit (no second number, no text such as "Real, inverted").
const ONE=/^\s*[≈~]?\s*[-−]?\d+(?:\.\d+)?(?:\s*×\s*10[⁻⁰¹²³⁴⁵⁶⁷⁸⁹]+)?\s*([^\d(),=/]*(?:\/[^\d(),=]*)?)\s*$/;
const PRE={p:1e-12,n:1e-9,'µ':1e-6,'μ':1e-6,m:1e-3,k:1e3,M:1e6,G:1e9};
const split=u=>u.length>1&&PRE[u[0]]&&!/^(min|mol|mag)/.test(u)?[PRE[u[0]],u.slice(1)]:[1,u];
function reading(sim,p,t,label){let list;try{list=sim.metrics(p,t)}catch{return null}const m=list&&list.find(x=>x.label===label);if(!m)return null;const v=String(m.value),k=v.match(ONE);if(!k)return null;return{v:num(v),u:k[1].trim()}}
function readings(sim,p,t){let list=[];try{list=sim.metrics(p,t)||[]}catch{}return list.filter(m=>ONE.test(String(m.value))).map(m=>m.label)}
function sweep(sim,p,t,key,label){const c=sim.controls.find(x=>x.key===key),n=41,ref=reading(sim,p,t,label);if(!c||!ref)return null;const [f0,b0]=split(ref.u),pts=[];
  const xs=[...new Set(Array.from({length:n},(_,i)=>{const x=c.min+(c.max-c.min)*i/(n-1),st=c.step>0?c.step:0;return st?Math.min(c.max,+(c.min+Math.round((x-c.min)/st)*st).toFixed(10)):x}))];
  for(const x of xs){const r=reading(sim,{...p,[key]:x},t,label);if(!r||!Number.isFinite(r.v))continue;let y=r.v;
    if(r.u!==ref.u){const [f1,b1]=split(r.u);if(b1!==b0)continue;y=r.v*f1/f0}pts.push([x,y])}
  return pts.length>2?{c,unit:ref.u,pts}:null}
// overall trend of the swept curve
function trend1(P){const ys=P.map(p=>p[1]),lo=Math.min(...ys),hi=Math.max(...ys),span=hi-lo;if(span<=1e-9*Math.max(1,Math.abs(hi)))return'same';
  const tol=span*1e-3,sg=[];for(let i=1;i<P.length;i++){const d=P[i][1]-P[i-1][1];if(Math.abs(d)>tol){const s=Math.sign(d);if(sg[sg.length-1]!==s)sg.push(s)}}
  const k=sg.join(',');return k==='1'?'up':k==='-1'?'down':k==='1,-1'?'upd':k==='-1,1'?'dnu':'wavy'}
// a jump through infinity (e.g. image distance when the object crosses F) splits the curve into branches
const gapOf=P=>{const ys=P.map(p=>p[1]).sort((a,b)=>a-b),q=k=>ys[Math.floor(k*(ys.length-1))],span=q(.9)-q(.1);return span>0?span*.6:0};
function branches(P){const gap=gapOf(P),out=[[P[0]]];for(let i=1;i<P.length;i++){const a=P[i-1][1],b=P[i][1];if(gap&&Math.abs(b-a)>gap&&a*b<0)out.push([]);out[out.length-1].push(P[i])}return{gap,out}}
function trend(P){const {out}=branches(P);if(out.length<2)return{t:trend1(P),jump:false};const ts=out.filter(b=>b.length>2).map(trend1);return ts.length&&ts.every(t=>t===ts[0])?{t:ts[0],jump:true}:{t:trend1(P),jump:false}}
const CH=[['up','Increases'],['down','Decreases'],['same','Stays the same'],['upd','Rises, then falls'],['dnu','Falls, then rises']];
const WORD={up:'increases',down:'decreases',same:'stays the same',upd:'rises and then falls',dnu:'falls and then rises',wavy:'goes up and down several times'};

/* ---------- Explore card ---------- */
const card=el('section','observe-card lab-card explore-card');card.dataset.testid='explore-card';card.setAttribute('aria-labelledby','explore-heading');stage.append(card);
let state={x:'',y:'',guess:null,shown:false},simId='',raf=0;
function opts(sel,list,cur){sel.replaceChildren(...list.map(([v,t])=>{const o=el('option','',t);o.value=v;o.selected=v===cur;return o}))}
function build(){const sim=S.sim,p=S.params;if(!sim||!p){card.hidden=true;return}
  const xs=(sim.controls||[]).filter(c=>!c.options&&c.max>c.min),ys=readings(sim,p,S.time);
  if(!xs.length||!ys.length){card.hidden=true;return}card.hidden=false;
  if(simId!==sim.id){simId=sim.id;state={x:xs[0].key,y:ys[0],guess:null,shown:false}}
  if(!xs.some(c=>c.key===state.x))state.x=xs[0].key;if(!ys.includes(state.y))state.y=ys[0];
  card.replaceChildren();
  const head=el('div','section-heading'),hh=el('div');hh.append(el('span','small-index','04 / EXPLORE'));const h=el('h2','','Predict, then test with a graph');h.id='explore-heading';hh.append(h);head.append(hh);card.append(head);
  const row=el('div','ex-row'),lx=el('label','ex-f'),ly=el('label','ex-f'),sx=el('select','ex-sel'),sy=el('select','ex-sel');
  lx.append(el('span','','Change'),sx);ly.append(el('span','','and watch'),sy);sx.dataset.testid='explore-x';sy.dataset.testid='explore-y';
  opts(sx,xs.map(c=>[c.key,c.label+(c.unit?` (${c.unit})`:'')]),state.x);opts(sy,ys.map(l=>[l,l]),state.y);
  sx.addEventListener('change',()=>{state.x=sx.value;state.guess=null;state.shown=false;build()});sy.addEventListener('change',()=>{state.y=sy.value;state.guess=null;state.shown=false;build()});
  row.append(lx,ly);card.append(row);
  const c=xs.find(c=>c.key===state.x),res=sweep(sim,p,S.time,state.x,state.y);
  if(!res){card.append(el('p','lab-empty','This reading cannot be graphed against this variable.'));return}
  const TR=trend(res.pts),tr=TR.t,jump=TR.jump?' (on each side of a jump where it passes through infinity)':'';
  if(!state.shown){const q=el('p','ex-q',`Predict: as ${c.label.toLowerCase()} increases from ${fmt(c.min)} to ${fmt(c.max)}${c.unit?' '+c.unit:''}, what happens to ${state.y.toLowerCase()}?`);card.append(q);
    const ch=el('div','ex-ch');for(const [k,t] of CH){const b=btn('lab-btn',t,()=>{state.guess=k;state.shown=true;build()});b.dataset.testid='explore-guess-'+k;ch.append(b)}
    ch.append(btn('lab-btn ex-skip','Just show the graph',()=>{state.guess=null;state.shown=true;build()}));card.append(ch);return}
  if(state.guess){const ok=state.guess===tr,v=el('p','ex-verdict '+(ok?'ok':'no'),(ok?'✓ Correct — ':'✗ Not quite — ')+`${state.y} ${WORD[tr]} as ${c.label.toLowerCase()} increases${jump}.`);v.dataset.testid='explore-verdict';card.append(v)}
  else card.append(el('p','ex-verdict',`${state.y} ${WORD[tr]} as ${c.label.toLowerCase()} increases${jump}.`));
  const unitX=c.unit?` (${c.unit})`:'',unitY=res.unit?` (${res.unit})`:'',cur=reading(sim,p,S.time,state.y);
  let mk=null;if(cur&&Number.isFinite(cur.v)){const [f0]=split(res.unit),[f1,b1]=split(cur.u);mk=[p[state.x],cur.u===res.unit?cur.v:b1===split(res.unit)[1]?cur.v*f1/f0:NaN]}
  const fig=plot({x:r=>r[0],y:r=>r[1],xl:c.label+unitX,yl:state.y+unitY,curve:true,nodots:res.pts.length>15,mark:mk,...(TR.jump?{gap:gapOf(res.pts),ylim:(ys=>[ys[Math.floor(.08*(ys.length-1))],ys[Math.ceil(.92*(ys.length-1))]])(res.pts.map(p=>p[1]).sort((a,b)=>a-b))}:{})},res.pts);if(fig)card.append(fig);
  // data table: 11 evenly spaced values
  const tb=el('table','mock-table lab-table'),hr=el('tr');hr.append(el('th','',c.label+unitX),el('th','',state.y+unitY));const th=el('thead');th.append(hr);const body=el('tbody');
  const rows=res.pts.filter((_,i)=>i%4===0);for(const [x,y] of rows){const tr2=el('tr');tr2.append(el('td','',fmt(x)),el('td','',fmt(y)));body.append(tr2)}tb.append(th,body);
  const det=el('details','ex-data'),sm=el('summary','','Data table');det.append(sm);const sc=el('div','lab-scroll');sc.append(tb);det.append(sc);card.append(det);
  const bar=el('div','lab-row');bar.append(btn('lab-btn','Download CSV',()=>{const q=v=>`"${String(v).replace(/"/g,'""')}"`,csv=[q(c.label+unitX)+','+q(state.y+unitY),...res.pts.map(([x,y])=>`${x},${y}`)].join('\n'),a=el('a');
    a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download=`physica-${sim.id}-${state.x}.csv`;document.body.append(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},500)}),
    btn('lab-btn','Predict again',()=>{state.guess=null;state.shown=false;build()}));card.append(bar);
  card.append(el('p','ex-note','The graph uses this simulation’s own model; the other variables stay at their current values. The dot marks the present setting.'))}
const later=()=>{cancelAnimationFrame(raf);raf=requestAnimationFrame(()=>{if(state.shown||simId!==S.sim?.id)build()})};
window.addEventListener('physica-sim',()=>build());document.getElementById('controls')?.addEventListener('input',later);document.getElementById('controls')?.addEventListener('click',later);
build();

/* ---------- Stopwatch (simulated time) ---------- */
const snap=document.getElementById('snapshot-btn'),host=document.getElementById('simulation')?.parentElement;
if(snap&&host){const sb=el('button','restart-button icon-tool');sb.append(el('span','','⏱'),el('b','','Stopwatch'));sb.firstChild.setAttribute('aria-hidden','true');sb.type='button';sb.title='Stopwatch (measures simulated time)';sb.setAttribute('aria-label','Stopwatch');sb.dataset.testid='stopwatch-btn';snap.after(sb);
  const w=el('div','stopwatch');w.hidden=true;w.dataset.testid='stopwatch';const disp=el('b','sw-t','0.00 s'),laps=el('ol','sw-laps'),go=el('button','lab-btn sw-go','Start'),lap=el('button','lab-btn','Lap'),rs=el('button','lab-btn','Reset'),x=el('button','lab-x','×');
  for(const b of[go,lap,rs,x])b.type='button';x.setAttribute('aria-label','Close stopwatch');const r=el('div','sw-row');r.append(go,lap,rs);w.append(x,disp,r,laps);if(getComputedStyle(host).position==='static')host.style.position='relative';host.append(w);
  let run=false,t0=0,acc=0,last=0,timer=0;const now=()=>acc+(run?Math.max(0,S.time-t0):0),show=()=>{disp.textContent=now().toFixed(2)+' s'};
  const tick=()=>{if(S.time<last){acc+=Math.max(0,last-t0);t0=S.time}last=S.time;show();if(run)timer=requestAnimationFrame(tick)};
  go.addEventListener('click',()=>{if(run){acc=now();run=false;go.textContent='Start'}else{t0=last=S.time;run=true;go.textContent='Stop';tick()}});
  lap.addEventListener('click',()=>{if(laps.children.length>=12)laps.firstChild.remove();laps.append(el('li','',now().toFixed(2)+' s'))});
  rs.addEventListener('click',()=>{run=false;acc=0;cancelAnimationFrame(timer);go.textContent='Start';laps.replaceChildren();show()});
  sb.addEventListener('click',()=>{w.hidden=!w.hidden});x.addEventListener('click',()=>{w.hidden=true});
  window.addEventListener('physica-sim',()=>rs.click())}
})();
