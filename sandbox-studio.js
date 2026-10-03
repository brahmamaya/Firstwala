/* Local-first rigid-body studio. Matter.js is bundled locally; no service or account is needed. */
(() => {
'use strict';
const {Engine,Bodies,Body,Composite,Constraint,Query,Vector}=window.Matter;
const $=id=>document.getElementById(id),TAU=Math.PI*2,DEG=Math.PI/180;
const W=1000,H=650,MAX_OBJECTS=150,MAX_LINKS=200,MAX_FILE=250000;
const COLORS=['#42d9ca','#ffc36b','#7baaff','#b89dff','#ff857e'];
const KEY='physica-sandbox-saves',clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const clone=v=>JSON.parse(JSON.stringify(v)),round=v=>Number(v.toFixed(4));
const defaults=()=>({g:1,direction:90,bounce:.6,friction:.01,wind:0,speed:1,boundaries:true,grid:true,snap:false,vectors:false,trails:false,labels:true});
let params=defaults(),objects=[],links=[],edges=[],selected=null,tool='move',running=false,visible=false;
let engine,canvas,raw,scale=1,zoom=1,offset={x:0,y:0},pan={x:0,y:0},last=0,accumulator=0,time=0;
let drag=null,build=null,linkPick=null,history=[],future=[],runStart=null,shared=null,currentSaveId=null,raf=0;
let nextId=1,drawTicks=0;
let goal=null,confetti=[],material='rubber',samples=[],simple=true;
const MATS={rubber:{bounce:.85,friction:.8,label:'rubber'},wood:{bounce:.4,friction:.5,label:'wood'},metal:{bounce:.2,friction:.3,label:'metal'},ice:{bounce:.05,friction:.02,label:'ice'}};
const MODE_KEY='physica-sandbox-mode',P3=()=>window.Physica3D&&window.Physica3D.enabled?window.Physica3D:null;
const uid=()=>String(nextId++);
const status=(message)=>{$('sb-status').textContent=message;};
const name=()=>($('sb-name').value.trim()||'Untitled experiment').slice(0,80);
function setRunning(value){running=value;$('sb-play').textContent=value?'Pause':'Play';$('sb-play').setAttribute('aria-pressed',String(value));}
function snapshot(){
  return {format:'physica-world',version:2,name:name(),width:W,height:H,params:{...params},bodies:objects.map(b=>{
    const m=b.plugin.studio;return{id:m.id,t:m.t,label:m.label,x:round(b.position.x),y:round(b.position.y),r:m.r,w:m.w,h:m.h,
      angle:round(b.angle/DEG),vx:round(Body.getVelocity(b).x*60/100),vy:round(Body.getVelocity(b).y*60/100),omega:round(Body.getAngularVelocity(b)*60/DEG),
      m:m.mass,fixed:m.fixed,color:m.color,bounce:b.restitution,friction:b.friction,charge:m.charge,strength:m.strength};
    }),springs:links.map(s=>({id:s.plugin.id,t:s.plugin.t,a:s.bodyA?.plugin.studio.id||null,b:s.bodyB?.plugin.studio.id||null,
      ax:s.pointA.x,ay:s.pointA.y,bx:s.pointB.x,by:s.pointB.y,length:s.length,k:s.stiffness,damping:s.damping})),time,...(goal?{goal:{x0:goal.x0,y0:goal.y0,x1:goal.x1,y1:goal.y1}}:{})};
}
function checkpoint(){history.push(snapshot());if(history.length>50)history.shift();future=[];syncHistory();}
function syncHistory(){$('sb-undo').disabled=!history.length;$('sb-redo').disabled=!future.length;}
function undo(redo=false){const from=redo?future:history,to=redo?history:future;if(!from.length)return;to.push(snapshot());applyWorld(from.pop());syncHistory();status(redo?'Edit restored.':'Edit undone.');}
function makeBody(v){
  const circular=v.t==='ball'||v.t==='magnet',fixed=v.fixed??['wall','ramp','magnet'].includes(v.t);
  const m={id:v.id||uid(),t:v.t,label:v.label||v.t[0].toUpperCase()+v.t.slice(1),r:v.r||22,w:v.w||70,h:v.h||50,mass:v.m||2,fixed,color:v.color||COLORS[objects.length%COLORS.length],charge:v.charge||0,strength:v.strength??15,trail:[]};
  const opts={angle:(v.angle||0)*DEG,restitution:v.bounce??params.bounce,friction:v.friction??.15,frictionStatic:.4,frictionAir:params.friction,isStatic:false};
  const b=circular?Bodies.circle(v.x,v.y,m.r,opts):Bodies.rectangle(v.x,v.y,m.w,m.h,opts);
  b.plugin.studio=m;Body.setMass(b,m.mass);if(fixed)Body.setStatic(b,true);
  if(!fixed){Body.setVelocity(b,{x:(v.vx||0)*100/60,y:(v.vy||0)*100/60});Body.setAngularVelocity(b,(v.omega||0)*DEG/60);}
  objects.push(b);Composite.add(engine.world,b);return b;
}
function makeLink(v){
  const a=objects.find(b=>b.plugin.studio.id===v.a),b=objects.find(b=>b.plugin.studio.id===v.b);
  const s=Constraint.create({bodyA:a||null,bodyB:b||null,pointA:{x:v.ax||0,y:v.ay||0},pointB:{x:v.bx||0,y:v.by||0},length:v.length,
    stiffness:v.t==='rope'?1:(v.k??.025),damping:v.damping??.03});
  s.plugin={id:v.id||uid(),t:v.t||'spring'};links.push(s);Composite.add(engine.world,s);return s;
}
function boundaries(){
  for(const b of edges)Composite.remove(engine.world,b);edges=[];
  if(params.boundaries){edges=[Bodies.rectangle(W/2,H+25,W+100,50,{isStatic:true}),Bodies.rectangle(W/2,-25,W+100,50,{isStatic:true}),Bodies.rectangle(-25,H/2,50,H+100,{isStatic:true}),Bodies.rectangle(W+25,H/2,50,H+100,{isStatic:true})];for(const b of edges)b.restitution=params.bounce;Composite.add(engine.world,edges);}
}
function applyWorld(s,resetName=true){
  endPointer();setRunning(false);selected=null;linkPick=null;build=null;objects=[];links=[];edges=[];
  Composite.clear(engine.world,false);Engine.clear(engine);params={...defaults(),...s.params};time=s.time||0;accumulator=0;
  goal=s.goal?{...s.goal,hold:0,done:false}:null;confetti=[];samples=[];
  nextId=Math.max(0,...s.bodies.map(b=>Number(b.id)||0),...(s.springs||[]).map(b=>Number(b.id)||0))+1;
  for(const b of s.bodies)makeBody(b);for(const l of s.springs||[])makeLink(l);boundaries();
  if(resetName)$('sb-name').value=s.name||'';syncWorld();renderObjects();renderInspector();
}
function fresh(){checkpoint();applyWorld({params:defaults(),bodies:[],springs:[],name:''});currentSaveId=null;runStart=null;status('Empty world. Pick ➶ Launch, or tap Ball / Box and then tap the stage. Undo restores the previous world.');}
function selectedIsBody(){return selected&&objects.includes(selected);}
function selectObject(b){if(b!==selected)samples=[];selected=b;renderObjects();renderInspector();syncMaterialNote();}
function removeSelected(){if(!selected)return;checkpoint();setRunning(false);
  if(objects.includes(selected)){for(const s of links.filter(s=>s.bodyA===selected||s.bodyB===selected))Composite.remove(engine.world,s);links=links.filter(s=>s.bodyA!==selected&&s.bodyB!==selected);objects=objects.filter(b=>b!==selected);}else links=links.filter(s=>s!==selected);
  Composite.remove(engine.world,selected);selected=null;linkPick=null;renderObjects();renderInspector();status('Deleted. Undo is available.');
}
function duplicate(){if(!selectedIsBody())return;if(objects.length>=MAX_OBJECTS){status(`This world supports up to ${MAX_OBJECTS} objects.`);return;}checkpoint();setRunning(false);
  const v=snapshot().bodies.find(b=>b.id===selected.plugin.studio.id);v.id=uid();v.x=clamp(v.x+45,30,W-30);v.y=clamp(v.y-45,30,H-30);v.label=(v.label+' copy').slice(0,40);selectObject(makeBody(v));status('Object duplicated. Connections are not copied.');
}
function renderObjects(){
  const host=$('sb-objects');host.replaceChildren();
  for(const b of [...objects,...links]){const el=document.createElement('button'),isBody=objects.includes(b);el.type='button';el.className='sb-object-item'+(selected===b?' selected':'');el.textContent=isBody?b.plugin.studio.label:(b.plugin.t==='rope'?'Rod':'Spring')+' '+b.plugin.id;el.dataset.testid='object-select-'+(isBody?b.plugin.studio.id:b.plugin.id);el.setAttribute('aria-pressed',String(selected===b));el.onclick=()=>selectObject(b);host.append(el);}
  if(!objects.length){const el=document.createElement('p');el.className='sb-empty';el.textContent='Your world is empty. Add the first object.';host.append(el);}
}
function field(host,key,label,value,options={}){
  const wrap=document.createElement('label');wrap.className='sb-field';wrap.textContent=label;
  const input=document.createElement('input');input.type=options.type||(simple?'range':'number');input.id='sb-prop-'+key;input.dataset.testid='object-'+key;
  if(input.type==='checkbox'){wrap.className='sb-check';input.checked=value;}else input.value=value;
  if(input.type==='number'||input.type==='range'){input.min=options.min;input.max=options.max;input.step=options.step??.1;}
  if(input.type==='range'){input.value=value;const out=document.createElement('b');out.className='sb-val';out.textContent=' '+value;wrap.firstChild.after(out);input.oninput=()=>{out.textContent=' '+input.value};}
  if(input.type==='text')input.maxLength=40;
  input.onchange=()=>{if((input.type==='number'||input.type==='range')&&(input.value===''||!input.checkValidity()||!Number.isFinite(input.valueAsNumber))){status(`Enter ${label.toLowerCase()} between ${options.min} and ${options.max}.`);renderInspector();return;}
    checkpoint();setRunning(false);const v=input.type==='checkbox'?input.checked:(input.type==='number'||input.type==='range')?Number(input.value):input.value;editProperty(key,v);renderInspector();renderObjects();status('Property updated. Press Play when ready.');};
  wrap.append(input);host.append(wrap);
}
function renderInspector(){
  const host=$('sb-properties');host.replaceChildren();host.hidden=!selected;$('sb-selection-empty').hidden=!!selected;$('sb-delete').disabled=!selected;$('sb-duplicate').disabled=!selectedIsBody();if(!selected)return;
  const F=(k,l,v,o)=>field(host,k,l,v,o);
  if(!selectedIsBody()){
    const s=selected;F('length','Rest length (cm)',round(s.length),{min:5,max:1600,step:1});
    if(s.plugin.t==='spring')F('k','Solver stiffness',s.stiffness,{min:.001,max:.3,step:.001});
    F('damping','Damping',s.damping,{min:0,max:1,step:.01});
    for(const side of ['A','B'])if(!s['body'+side]){F('anchor'+side+'x',`Anchor ${side} x (m)`,s['point'+side].x/100,{min:-50,max:50});F('anchor'+side+'y',`Anchor ${side} y (m)`,s['point'+side].y/100,{min:-50,max:50});}return;
  }
  const b=selected,m=b.plugin.studio,v=Body.getVelocity(b);
  if(simple){
    if(m.t==='ball'||m.t==='magnet')F('r','Size: radius (cm)',m.r,{min:5,max:100,step:1});else F('w','Size: length (cm)',m.w,{min:10,max:1000,step:1});
    if(!m.fixed)F('m','Mass (kg)',m.mass,{min:.1,max:100,step:.1});F('bounce','Bounciness (0–1)',b.restitution,{min:0,max:1,step:.05});F('fixed','Pin in place',m.fixed,{type:'checkbox'});
    const info=document.createElement('p');info.className='sb-tip';info.textContent='Drag it to move or throw. Tap a material above to change what it is made of. Advanced tools show every property.';host.append(info);return}
  F('label','Object name',m.label,{type:'text'});F('color','Object colour',m.color,{type:'color'});
  F('x','Position x (m)',round(b.position.x/100),{min:-50,max:50});F('y','Position y (m)',round(b.position.y/100),{min:-50,max:50});
  F('m','Mass (kg)',m.mass,{min:.1,max:100,step:.1});
  if(m.t==='ball'||m.t==='magnet')F('r','Radius (cm)',m.r,{min:5,max:100,step:1});
  else{F('w','Width / length (cm)',m.w,{min:10,max:1000,step:1});F('h','Height / thickness (cm)',m.h,{min:8,max:300,step:1});}
  F('angle','Rotation (degrees)',round(((b.angle/DEG)%360+360)%360),{min:-360,max:360,step:1});
  F('fixed','Pin in place',m.fixed,{type:'checkbox'});
  if(!m.fixed){F('vx','Velocity x (m/s)',round(v.x*60/100),{min:-15,max:15});F('vy','Velocity y (m/s)',round(v.y*60/100),{min:-15,max:15});F('omega','Spin (degrees/s)',round(Body.getAngularVelocity(b)*60/DEG),{min:-720,max:720,step:5});}
  F('bounce','Bounciness',b.restitution,{min:0,max:1,step:.05});F('friction','Surface friction',b.friction,{min:0,max:1,step:.05});
  F('charge','Toy charge (+ repels +)',m.charge,{min:-10,max:10,step:1});
  if(m.t==='magnet')F('strength','Attraction at 1 m (N)',m.strength,{min:-100,max:100,step:1});
  const info=document.createElement('p');info.className='sb-tip';info.textContent='Positive y is downward. Pin any object to make an obstacle. Charge is an illustrative force, not a calibrated electric field.';host.append(info);
}
function editProperty(k,v){
  if(!selectedIsBody()){const s=selected;if(k.startsWith('anchor'))s['point'+k[6]][k[7]]=v*100;else if(k==='k')s.stiffness=v;else s[k]=v;return;}
  const b=selected,m=b.plugin.studio;
  if(k==='x'||k==='y')Body.setPosition(b,{...b.position,[k]:v*100});
  else if(k==='vx'||k==='vy')Body.setVelocity(b,{...Body.getVelocity(b),[k==='vx'?'x':'y']:v*100/60});
  else if(k==='omega')Body.setAngularVelocity(b,v*DEG/60);
  else if(k==='angle')Body.setAngle(b,v*DEG);
  else if(['r','w','h'].includes(k)){
    const angle=b.angle;Body.setAngle(b,0);Body.scale(b,k==='h'?1:v/m[k],k==='w'?1:v/m[k]);Body.setAngle(b,angle);m[k]=v;
    if(!m.fixed)Body.setMass(b,m.mass);
  }else if(k==='fixed'){m.fixed=v;Body.setStatic(b,v);if(!v)Body.setMass(b,m.mass);}
  else if(k==='m'){m.mass=v;if(!m.fixed)Body.setMass(b,v);}
  else if(k==='bounce')b.restitution=v;
  else if(k==='friction')b.friction=v;
  else m[k]=v;
  m.trail=[];
}
function syncWorld(){
  const fields={gravity:['g',v=>(Number.isInteger(v*10)?v.toFixed(1):v.toFixed(2))+' g'],direction:['direction',v=>v+'°'],bounce:['bounce',v=>v.toFixed(2)],friction:['friction',v=>v.toFixed(3)],wind:['wind',v=>v.toFixed(1)+' m/s²']};
  for(const [id,[k,fmt]] of Object.entries(fields)){$('sb-'+id).value=params[k];$('sb-'+id+'-val').textContent=fmt(params[k]);}
  for(const k of ['boundaries','grid','snap','vectors','trails','labels'])$('sb-'+k).checked=params[k];$('sb-speed').value=params.speed;
  for(const c of $('sb-planets').querySelectorAll('[data-g]')){const on=Math.abs(Number(c.dataset.g)-params.g)<1e-6;c.classList.toggle('on',on);c.setAttribute('aria-pressed',String(on));}
}
function syncMaterialNote(){const b=selectedIsBody()&&!selected.plugin.studio.fixed?selected:null;$('sb-mat-note').textContent=b?'(tap to apply to '+b.plugin.studio.label+')':'(for new balls & boxes)';
  for(const c of $('sb-materials').querySelectorAll('[data-mat]')){const on=c.dataset.mat===material;c.classList.toggle('on',on);c.setAttribute('aria-pressed',String(on));}}
function setMode(isSimple,save=true){simple=isSimple;$('sandbox-view').classList.toggle('sb-simple',simple);$('sb-mode').setAttribute('aria-pressed',String(!simple));$('sb-mode').textContent=simple?'⚙ Advanced tools':'✓ Simple mode';
  if(simple&&['spring','rope','magnet','pan'].includes(tool))setTool('move');if(simple&&canvas)fit();if(canvas)renderInspector();if(save)try{localStorage.setItem(MODE_KEY,simple?'simple':'advanced');}catch{}}
function setTool(t){if(simple&&['spring','rope','magnet','pan'].includes(t))t='move';tool=t;linkPick=null;build=null;for(const b of $('sb-palette').querySelectorAll('button')){const on=b.dataset.tool===t;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on));}
  canvas.style.cursor=t==='move'?'grab':t==='pan'?'move':'crosshair';$('sb-hint').textContent=t==='sling'?'Press on the stage, pull backwards like a catapult and let go. The dotted curve predicts the flight; a longer pull launches faster.':['spring','rope'].includes(t)?'Tap two objects, or an object and empty space to create a fixed anchor. Select a connection to edit it.':t==='wall'||t==='ramp'?'Drag to draw an obstacle, or tap for a default one. Select it to rotate or resize.':t==='pan'?'Drag to pan. Use Fit world to return to the whole scene.':'Tap to add or select. Drag to move and throw; pause for precise building.';
}
function screenPoint(e){const r=canvas.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top};}
function worldPoint(e,snap=false){const p=screenPoint(e);let x=(p.x-offset.x)/scale,y=(p.y-offset.y)/scale;if(snap&&params.snap){x=Math.round(x/40)*40;y=Math.round(y/40)*40;}return{x,y};}
function linkEnds(s){return{a:s.bodyA?Vector.add(s.bodyA.position,s.pointA):s.pointA,b:s.bodyB?Vector.add(s.bodyB.position,s.pointB):s.pointB};}
function distanceTo(p,a,b){const dx=b.x-a.x,dy=b.y-a.y,l=dx*dx+dy*dy||1,t=clamp(((p.x-a.x)*dx+(p.y-a.y)*dy)/l,0,1);return Math.hypot(p.x-a.x-t*dx,p.y-a.y-t*dy);}
function hitAt(p){const hits=Query.point(objects,p);if(hits.length)return hits[hits.length-1];return [...links].reverse().find(s=>{const e=linkEnds(s);return distanceTo(p,e.a,e.b)<10/scale;})||null;}
function addAt(t,p,shape={}){if(objects.length>=MAX_OBJECTS){status(`World limit: ${MAX_OBJECTS} objects. Delete an object before adding more.`);return null;}
  const mat=['ball','box'].includes(t)?{bounce:MATS[material].bounce,friction:MATS[material].friction}:{};
  return makeBody({t,x:clamp(p.x,5,W-5),y:clamp(p.y,5,H-5),...(t==='wall'?{w:180,h:20}:t==='ramp'?{w:220,h:14,angle:25}:{}),...mat,...shape});
}
function down(e){if(e.button!==0||drag||build)return;canvas.focus({preventScroll:true});canvas.setPointerCapture(e.pointerId);const p=worldPoint(e,true),hit=hitAt(p);
  if(tool==='pan'){drag={pan:true,start:screenPoint(e),origin:{...pan}};return;}
  if(tool==='sling'){drag={sling:true,start:{x:clamp(p.x,20,W-20),y:clamp(p.y,20,H-20)},cur:p};return;}
  if(tool==='erase'){if(hit){selectObject(hit);removeSelected();}return;}
  if(['spring','rope'].includes(tool)){connectAt(p,objects.includes(hit)?hit:null);return;}
  if(tool==='wall'||tool==='ramp'){checkpoint();build={start:p,end:p};return;}
  let b=hit;
  if(['ball','box','magnet'].includes(tool)){checkpoint();b=addAt(tool,p);}
  else if(b&&objects.includes(b))checkpoint();
  selectObject(b);if(!objects.includes(b))return;
  const velocity=Body.getVelocity(b);drag={body:b,originalStatic:b.plugin.studio.fixed,offset:Vector.sub(b.position,p),prev:p,lastMove:performance.now(),vx:0,vy:0,originalVelocity:velocity,moved:false};Body.setStatic(b,true);
}
function move(e){if(build){build.end=worldPoint(e,true);return;}if(!drag)return;
  if(drag.sling){drag.cur=worldPoint(e);return;}
  if(drag.pan){const p=screenPoint(e);pan={x:drag.origin.x+p.x-drag.start.x,y:drag.origin.y+p.y-drag.start.y};resize();return;}
  const p=worldPoint(e,true),now=performance.now(),dt=Math.max(8,now-drag.lastMove)/1000;
  drag.vx=clamp((p.x-drag.prev.x)/dt/100,-15,15);drag.vy=clamp((p.y-drag.prev.y)/dt/100,-15,15);drag.prev=p;drag.lastMove=now;drag.moved=true;
  const dest=Vector.add(p,drag.offset);Body.setPosition(drag.body,{x:clamp(dest.x,-500,W+500),y:clamp(dest.y,-500,H+500)});
}
function endPointer(cancel=false){
  if(build){const {start,end}=build,dx=end.x-start.x,dy=end.y-start.y,len=Math.hypot(dx,dy);let b;
    if(!cancel){if(len<15)b=addAt(tool,start);else b=addAt(tool,{x:(start.x+end.x)/2,y:(start.y+end.y)/2},tool==='ramp'?{w:clamp(len,10,500),h:14,angle:Math.atan2(dy,dx)/DEG}:{w:clamp(Math.abs(dx),10,500),h:clamp(Math.abs(dy),8,300)});selectObject(b);}build=null;
  }
  if(drag?.sling&&!cancel)launch(drag.start,drag.cur);
  if(drag?.body){const {body:b,originalStatic}=drag;Body.setStatic(b,originalStatic);if(!originalStatic){Body.setMass(b,b.plugin.studio.mass);const fresh=performance.now()-drag.lastMove<100;
      Body.setVelocity(b,!cancel&&running&&drag.moved&&fresh?{x:drag.vx*100/60,y:drag.vy*100/60}:(!drag.moved?drag.originalVelocity:{x:0,y:0}));}
    b.plugin.studio.trail=[];renderInspector();}
  drag=null;
}
function slingVelocity(start,cur){const k=4,vx=clamp((start.x-cur.x)*k/100,-15,15),vy=clamp((start.y-cur.y)*k/100,-15,15);return{vx,vy};}
function launch(start,cur){
  if(Math.hypot(start.x-cur.x,start.y-cur.y)<12){status('Pull further back before letting go — the longer the pull, the faster the launch.');return;}
  if(objects.length>=MAX_OBJECTS){status(`World limit: ${MAX_OBJECTS} objects. Delete an object before adding more.`);return;}
  checkpoint();const {vx,vy}=slingVelocity(start,cur),b=addAt('ball',start,{r:16,m:1,vx,vy,label:'Shot '+(objects.filter(o=>o.plugin.studio.label.startsWith('Shot')).length+1)});
  if(!b)return;selectObject(b);if(!running){runStart=snapshot();setRunning(true);}
  status(`Launched at ${Math.hypot(vx,vy).toFixed(1)} m/s, ${(Math.atan2(-vy,vx)/DEG).toFixed(0)}° above horizontal. Watch the live graph for speed and energy.`);
}
function connectAt(p,b){
  if(!linkPick){linkPick={body:b,point:p};status('First endpoint selected. Tap an object or empty space for the second.');return;}
  const first=linkPick;linkPick=null;if((!first.body&&!b)||(first.body&&first.body===b)){status('Choose two different endpoints, with at least one object.');return;}
  if(links.length>=MAX_LINKS){status(`World limit: ${MAX_LINKS} connections.`);return;}checkpoint();
  const a=first.body?first.body.position:first.point,end=b?b.position:p;
  const s=makeLink({t:tool,a:first.body?.plugin.studio.id||null,b:b?.plugin.studio.id||null,ax:first.body?0:a.x,ay:first.body?0:a.y,bx:b?0:end.x,by:b?0:end.y,length:clamp(Vector.magnitude(Vector.sub(end,a)),5,1600)});selectObject(s);status('Connection added. Use Move to select and edit it.');
}
function tick(ms){
  engine.gravity.x=params.g*Math.cos(params.direction*DEG);engine.gravity.y=params.g*Math.sin(params.direction*DEG);engine.gravity.scale=.000981;
  for(const b of objects){if(b.isStatic)continue;b.frictionAir=params.friction;const m=b.plugin.studio;
    let fx=params.wind*m.mass,fy=0;
    for(const other of objects){if(other===b)continue;const o=other.plugin.studio,dx=other.position.x-b.position.x,dy=other.position.y-b.position.y,d=Math.max(20,Math.hypot(dx,dy)),dist=d/100;
      let force=0;if(o.t==='magnet')force+=o.strength/(dist*dist+.04);if(m.charge&&o.charge)force-=2*m.charge*o.charge/(dist*dist+.04);force=clamp(force,-200,200);fx+=force*dx/d;fy+=force*dy/d;}
    Body.applyForce(b,b.position,{x:fx*.0001,y:fy*.0001});
  }
  Engine.update(engine,ms);time+=ms/1000;
  if(goal&&!goal.done){const inside=objects.some(b=>!b.isStatic&&b.plugin.studio.t==='ball'&&b.position.x>goal.x0&&b.position.x<goal.x1&&b.position.y>goal.y0&&b.position.y<goal.y1);
    goal.hold=inside?goal.hold+ms/1000:0;if(goal.hold>.6){goal.done=true;celebrate();}}
  for(const b of objects){if(b.isStatic)continue;const v=Body.getVelocity(b),s=Vector.magnitude(v);if(s>40)Body.setVelocity(b,Vector.mult(v,40/s));
    if(Math.abs(b.position.x)>5000||Math.abs(b.position.y)>5000){Body.setPosition(b,{x:clamp(b.position.x,-5000,5000),y:clamp(b.position.y,-5000,5000)});Body.setVelocity(b,{x:0,y:0});}
  }
}
function celebrate(){status('🎉 GOAL! The ball landed in the basket. Press Reset run to try a different angle, or move the obstacles to make it harder.');
  const cx=(goal.x0+goal.x1)/2,cy=goal.y0;for(let i=0;i<70;i++){const a=-Math.PI/2+(Math.random()-.5)*2.2,v=3+Math.random()*6;confetti.push({x:cx,y:cy,vx:Math.cos(a)*v,vy:Math.sin(a)*v,c:COLORS[i%COLORS.length],life:1.6+Math.random()});}}
function drawSling(g){const {start,cur}=drag,{vx,vy}=slingVelocity(start,cur);
  g.strokeStyle='#ffc36b';g.lineWidth=2/scale;g.setLineDash([]);g.beginPath();g.moveTo(cur.x,cur.y);g.lineTo(start.x,start.y);g.stroke();
  g.fillStyle='#ffc36b55';g.beginPath();g.arc(start.x,start.y,16,0,TAU);g.fill();
  const gx=981*params.g*Math.cos(params.direction*DEG),gy=981*params.g*Math.sin(params.direction*DEG);g.fillStyle='#e9f6ff';
  // Same integrator as the engine: 120 Hz steps, Matter's air drag factor, gravity and wind.
  const dt=1/120,u=1-params.friction*.5,ax=gx+params.wind*100;let x=start.x,y=start.y,ux=vx*100,uy=vy*100;
  for(let i=1;i<=480;i++){ux=ux*u+ax*dt;uy=uy*u+gy*dt;x+=ux*dt;y+=uy*dt;if(x<0||x>W||y<0||y>H)break;if(i%5===0){g.beginPath();g.arc(x,y,2.4/scale,0,TAU);g.fill();}}
  g.font=`700 ${13/scale}px 'DM Sans',sans-serif`;g.textAlign='left';g.fillStyle='#ffc36b';g.fillText(`${Math.hypot(vx,vy).toFixed(1)} m/s · ${(Math.atan2(-vy,vx)/DEG).toFixed(0)}°`,start.x+22,start.y-22);}
function drawGraph(g,r){
  if(!$('sb-graph').checked||!selectedIsBody()||selected.isStatic)return;
  const b=selected,m=b.plugin.studio,v=Vector.magnitude(Body.getVelocity(b))*60/100,h=Math.max(0,(H-b.position.y)/100);
  if(running&&drawTicks%2===0){samples.push({t:time,v,h});while(samples.length&&time-samples[0].t>8)samples.shift();}
  const w=Math.min(250,r.width-24),ht=118,x0=12,y0=12;if(w<150)return;
  g.fillStyle='#081624dd';g.strokeStyle='#29475b';g.lineWidth=1;g.beginPath();g.roundRect(x0,y0,w,ht,8);g.fill();g.stroke();
  g.font="700 11px 'DM Sans',sans-serif";g.textAlign='left';g.fillStyle='#e9f6ff';g.fillText(m.label+' · last 8 s',x0+10,y0+16);
  const gm=9.81*params.g,ke=.5*m.mass*v*v,down=params.direction===90;
  g.font="500 11px 'DM Sans',sans-serif";g.fillStyle='#42d9ca';g.fillText(`speed ${v.toFixed(2)} m/s`,x0+10,y0+32);g.fillStyle='#ffc36b';g.fillText(`height ${h.toFixed(2)} m`,x0+w/2+4,y0+32);
  g.fillStyle='#b89dff';g.fillText(`KE ${ke.toFixed(1)} J`,x0+10,y0+ht-10);if(down)g.fillText(`PE ${(m.mass*gm*h).toFixed(1)} J · total ${(ke+m.mass*gm*h).toFixed(1)} J`,x0+w/2-30,y0+ht-10);
  if(samples.length<2)return;const px=x0+10,py=y0+40,pw=w-20,ph=ht-66,t0=samples[0].t,span=Math.max(1,samples[samples.length-1].t-t0);
  const vmax=Math.max(1,...samples.map(s=>s.v)),hmax=Math.max(1,...samples.map(s=>s.h));
  g.strokeStyle='#29475b';g.beginPath();g.moveTo(px,py+ph);g.lineTo(px+pw,py+ph);g.stroke();
  for(const [key,max,col] of [['v',vmax,'#42d9ca'],['h',hmax,'#ffc36b']]){g.strokeStyle=col;g.lineWidth=1.6;g.beginPath();samples.forEach((s,i)=>{const X=px+(s.t-t0)/span*pw,Y=py+ph-s[key]/max*ph;i?g.lineTo(X,Y):g.moveTo(X,Y);});g.stroke();}
}
function render(){
  const r=canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2),g=window.PhysicaTheme.wrapContext(raw);
  raw.setTransform(dpr,0,0,dpr,0,0);g.fillStyle='#081624';g.fillRect(0,0,r.width,r.height);g.save();g.translate(offset.x,offset.y);g.scale(scale,scale);
  g.fillStyle='#0a1d2d';g.fillRect(0,0,W,H);g.lineWidth=1/scale;
  if(params.grid){g.strokeStyle='#29475b55';for(let x=0;x<=W;x+=40){g.beginPath();g.moveTo(x,0);g.lineTo(x,H);g.stroke();}for(let y=0;y<=H;y+=40){g.beginPath();g.moveTo(0,y);g.lineTo(W,y);g.stroke();}}
  g.strokeStyle=params.boundaries?'#8ca6b9':'#29475b';g.lineWidth=2/scale;g.strokeRect(0,0,W,H);
  for(const s of links){const {a,b}=linkEnds(s),dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy)||1;g.strokeStyle=s===selected?'#e9f6ff':s.plugin.t==='rope'?'#ffc36b':'#b89dff';g.lineWidth=(s===selected?3:2)/scale;g.beginPath();g.moveTo(a.x,a.y);for(let i=1;i<20;i++){const off=s.plugin.t==='rope'?0:(i%2?5:-5);g.lineTo(a.x+dx*i/20-dy/len*off,a.y+dy*i/20+dx/len*off);}g.lineTo(b.x,b.y);g.stroke();for(const p of [!s.bodyA?a:null,!s.bodyB?b:null].filter(Boolean)){g.fillStyle='#ffc36b';g.fillRect(p.x-5,p.y-5,10,10);}}
  for(const b of objects){const m=b.plugin.studio,p=b.position;
    if(params.trails&&!b.isStatic){if(running&&drawTicks%3===0){m.trail.push({...p});if(m.trail.length>80)m.trail.shift();}g.strokeStyle=m.color+'66';g.lineWidth=2/scale;g.beginPath();m.trail.forEach((p,i)=>i?g.lineTo(p.x,p.y):g.moveTo(p.x,p.y));g.stroke();}
    const D3=P3(),round_=m.t==='ball'||m.t==='magnet';g.save();g.translate(p.x,p.y);if(!round_)g.rotate(b.angle);g.fillStyle=D3?m.color:m.color+'88';g.strokeStyle=selected===b?'#e9f6ff':m.color;g.lineWidth=(selected===b?3:1.5)/scale;
    g.beginPath();if(round_)g.arc(0,0,m.r,0,TAU);else g.rect(-m.w/2,-m.h/2,m.w,m.h);if(D3)D3.shadowFill(g,(round_?m.r:Math.min(m.w,m.h)/2)*scale);else g.fill();
    if(D3){if(round_)D3.shadeSphere(g,0,0,m.r);else D3.shadeBox(g,-m.w/2,-m.h/2,m.w,m.h);g.beginPath();if(round_)g.arc(0,0,m.r,0,TAU);else g.rect(-m.w/2,-m.h/2,m.w,m.h);}
    g.stroke();if(round_)g.rotate(b.angle);
    if(m.t==='ball'){g.beginPath();g.moveTo(0,0);g.lineTo(m.r,0);g.stroke();}
    if(m.t==='magnet'){g.setLineDash([5,7]);g.beginPath();g.arc(0,0,m.r+18,0,TAU);g.stroke();g.setLineDash([]);g.font='bold 22px sans-serif';g.textAlign='center';g.fillStyle='#e9f6ff';g.fillText(m.strength>=0?'+':'−',0,7);}
    if(m.fixed){g.fillStyle='#e9f6ff';g.fillRect(-3,-3,6,6);}g.restore();
    if(params.labels&&(scale>.6||selected===b)){g.font=`500 ${12/scale}px 'DM Sans',sans-serif`;g.textAlign='center';g.fillStyle='#e9f6ff';g.fillText(m.label,p.x,p.y-(m.t==='ball'||m.t==='magnet'?m.r:m.h/2)-10/scale);}
    if(params.vectors&&!b.isStatic){const v=Body.getVelocity(b),end={x:p.x+v.x*7,y:p.y+v.y*7};g.strokeStyle='#ffc36b';g.lineWidth=2/scale;g.beginPath();g.moveTo(p.x,p.y);g.lineTo(end.x,end.y);g.stroke();const angle=Math.atan2(v.y,v.x);g.beginPath();g.moveTo(end.x,end.y);g.lineTo(end.x-9*Math.cos(angle-.5),end.y-9*Math.sin(angle-.5));g.moveTo(end.x,end.y);g.lineTo(end.x-9*Math.cos(angle+.5),end.y-9*Math.sin(angle+.5));g.stroke();}
  }
  if(linkPick){const p=linkPick.body?.position||linkPick.point;g.strokeStyle='#ffc36b';g.lineWidth=2/scale;g.beginPath();g.arc(p.x,p.y,15,0,TAU);g.stroke();}
  if(goal){g.fillStyle=goal.done?'#42d9ca33':'#ffc36b22';g.fillRect(goal.x0,goal.y0,goal.x1-goal.x0,goal.y1-goal.y0);g.font=`700 ${12/scale}px 'DM Sans',sans-serif`;g.textAlign='center';g.fillStyle=goal.done?'#42d9ca':'#ffc36b';g.fillText(goal.done?'GOAL! 🎉':'GOAL',(goal.x0+goal.x1)/2,goal.y0-28);}
  for(const c of confetti){if(running||c.life>0){c.vy+=.25;c.x+=c.vx;c.y+=c.vy;c.life-=1/60;}g.fillStyle=c.c;g.fillRect(c.x-3,c.y-3,6,6);}confetti=confetti.filter(c=>c.life>0&&c.y<H+40);
  if(drag?.sling)drawSling(g);
  if(build){g.strokeStyle='#42d9ca';g.lineWidth=2/scale;g.setLineDash([6,6]);if(tool==='ramp'){g.beginPath();g.moveTo(build.start.x,build.start.y);g.lineTo(build.end.x,build.end.y);g.stroke();}else g.strokeRect(build.start.x,build.start.y,build.end.x-build.start.x,build.end.y-build.start.y);g.setLineDash([]);}
  g.restore();drawGraph(g,r);drawTicks++;
  $('sb-stats').textContent=`${objects.length}/${MAX_OBJECTS} objects · ${links.length} links · ${time.toFixed(1)} s`;
  if(drawTicks%15===0&&selectedIsBody()&&!$('sb-properties').contains(document.activeElement)){const b=selected,v=Body.getVelocity(b);for(const [k,val] of Object.entries({x:b.position.x/100,y:b.position.y/100,vx:v.x*60/100,vy:v.y*60/100,angle:((b.angle/DEG)%360+360)%360,omega:Body.getAngularVelocity(b)*60/DEG})){const input=$('sb-prop-'+k);if(input)input.value=round(val);}}
}
function frame(now){if(!visible)return;const dt=Math.min((now-last)/1000,.05);last=now;
  if(running){accumulator+=dt*params.speed;let count=0;while(accumulator>=1/120&&count++<16){tick(1000/120);accumulator-=1/120;}}render();raf=requestAnimationFrame(frame);
}
function resize(){if(!canvas)return;const r=canvas.getBoundingClientRect();if(!r.width||!r.height)return;const dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(r.width*dpr);canvas.height=Math.round(r.height*dpr);scale=Math.min(r.width/W,r.height/H)*zoom;offset={x:(r.width-W*scale)/2+pan.x,y:(r.height-H*scale)/2+pan.y};$('sb-zoom-label').textContent=Math.round(zoom*100)+'%';}
function fit(){zoom=1;pan={x:0,y:0};resize();}
const PRESET_NAMES={pit:'Ball pit',pendulum:'Pendulum lab',domino:'Domino run',orbit:'Attraction lab',cannon:'Cannon vs tower',cradle:'Newton’s cradle',ramp:'Ramp race',bridge:'Rope bridge',challenge:'Basket challenge'};
function preset(which,record=true){if(record)checkpoint();applyWorld({params:defaults(),bodies:[],springs:[],name:PRESET_NAMES[which]||'Experiment'});currentSaveId=null;runStart=null;
  let msg='Scene ready. Press Play to run, or select an object to make it yours.';
  if(which==='pit'){makeBody({t:'wall',x:500,y:560,w:740,h:20});for(let i=0;i<24;i++)makeBody({t:'ball',x:210+(i%8)*80,y:100+Math.floor(i/8)*90,r:20+(i%3)*3});}
  if(which==='pendulum'){for(let i=0;i<3;i++){const x=300+i*160,b=makeBody({t:'ball',x:x+(i===2?140:0),y:i===2?275:320,r:24});makeLink({t:i===0?'spring':'rope',a:null,b:b.plugin.studio.id,ax:x,ay:90,length:230,k:.02});}}
  if(which==='domino'){for(let i=0;i<12;i++)makeBody({t:'box',x:170+i*55,y:570,w:18,h:100,m:1,angle:i===0?18:0});}
  if(which==='orbit'){params.g=0;params.friction=0;makeBody({t:'magnet',x:500,y:320,r:28,strength:12,label:'Attractor'});makeBody({t:'ball',x:680,y:320,r:15,vx:0,vy:2.5,m:1,label:'Satellite'});}
  if(which==='cannon'){makeBody({t:'box',x:120,y:590,w:70,h:120,fixed:true,label:'Launcher',color:'#7baaff'});
    makeBody({t:'ball',x:120,y:510,r:16,m:3,vx:6,vy:-5.5,label:'Cannonball',color:'#ff857e'});
    for(let c=0;c<3;c++)for(let r=0;r<4;r++)makeBody({t:'box',x:730+c*42,y:629-r*42,w:40,h:40,m:.6,friction:.6,bounce:.1,label:'Block',color:COLORS[(c+r)%COLORS.length]});
    msg='Press Play to fire at 8.1 m/s, 42.5° — or pick ➶ Launch and aim your own shot at the tower.';}
  if(which==='cradle'){params.friction=0;const L=270,top=140,R=25;for(let i=0;i<5;i++){const ax=400+i*(2*R+.5),pulled=i===0,a=pulled?40*DEG:0;
      const b=makeBody({t:'ball',x:ax-L*Math.sin(a),y:top+L*Math.cos(a),r:R,m:1,bounce:1,friction:0,label:'Ball '+(i+1),color:'#c7d3dd'});makeLink({t:'rope',a:null,b:b.plugin.studio.id,ax,ay:top,length:L});}
    msg='Press Play: momentum and energy pass through the row. Drag two balls out together to see two fly off.';}
  if(which==='ramp'){const len=Math.hypot(500,200),ang=Math.atan2(200,500)/DEG;makeBody({t:'ramp',x:350,y:260,w:len,h:14,angle:ang});makeBody({t:'ramp',x:350,y:480,w:len,h:14,angle:ang});
    makeBody({t:'ball',x:135,y:140,r:20,m:1,bounce:.2,friction:.8,label:'Rolling ball'});
    makeBody({t:'box',x:135,y:355,w:40,h:40,angle:ang,m:1,bounce:.05,friction:.02,label:'Ice block',color:'#7baaff'});
    msg='Which reaches the bottom first — the rolling ball or the sliding ice block? Press Play. Change materials to compare.';}
  if(which==='bridge'){params.labels=false;makeBody({t:'wall',x:150,y:550,w:100,h:200,label:'Left pier'});makeBody({t:'wall',x:850,y:550,w:100,h:200,label:'Right pier'});
    const n=10,w=54,gap=6,ids=[];for(let i=0;i<n;i++)ids.push(makeBody({t:'box',x:200+gap+w/2+i*(w+gap),y:450,w,h:14,m:.5,friction:.8,bounce:.05,label:'Plank '+(i+1),color:'#ffc36b'}).plugin.studio.id);
    makeLink({t:'rope',a:null,b:ids[0],ax:200,ay:450,bx:-w/2,by:0,length:gap});for(let i=0;i<n-1;i++)makeLink({t:'rope',a:ids[i],b:ids[i+1],ax:w/2,ay:0,bx:-w/2,by:0,length:gap});makeLink({t:'rope',a:ids[n-1],b:null,ax:w/2,ay:0,bx:800,by:450,length:gap});
    makeBody({t:'ball',x:500,y:180,r:28,m:6,bounce:.2,label:'Heavy ball',color:'#ff857e'});
    msg='Press Play to drop the heavy ball on the plank bridge. Drop more boxes on it, or use ➶ Launch to hit it from the side.';}
  if(which==='challenge'){goal={x0:772,y0:470,x1:868,y1:562,hold:0,done:false};
    makeBody({t:'wall',x:480,y:520,w:24,h:260,label:'Obstacle',color:'#7baaff'});
    makeBody({t:'wall',x:766,y:528,w:12,h:76,label:'Basket',color:'#ff857e'});makeBody({t:'wall',x:874,y:510,w:12,h:112,label:'Basket',color:'#ff857e'});makeBody({t:'wall',x:820,y:572,w:120,h:12,label:'Basket',color:'#ff857e'});
    makeBody({t:'box',x:110,y:620,w:80,h:60,fixed:true,label:'Launch pad',color:'#42d9ca'});
    setTool('sling');msg='Challenge: launch a ball over the obstacle into the basket. Start your pull on the left side. ➶ Launch is selected.';}
  syncWorld();renderObjects();renderInspector();status(msg);
}

/* Share files are strictly validated and decoded before replacing the current world. */
function finite(v,min,max,label){if(typeof v!=='number'||!Number.isFinite(v)||v<min||v>max)throw Error(`Invalid ${label}.`);return v;}
function validate(raw){
  if(!raw||raw.format!=='physica-world'||raw.version!==2)throw Error('Choose a Physica world JSON file (version 2).');
  if(typeof raw.name!=='string'||raw.name.length>80)throw Error('Invalid world name.');
  if(!Array.isArray(raw.bodies)||raw.bodies.length>MAX_OBJECTS||!Array.isArray(raw.springs)||raw.springs.length>MAX_LINKS)throw Error('World object or connection limit exceeded.');
  const p=raw.params;if(!p||typeof p!=='object')throw Error('Missing world settings.');const settings=defaults();
  for(const [k,a,b] of [['g',0,3],['direction',0,360],['bounce',0,1],['friction',0,.12],['wind',-10,10],['speed',.25,2]])settings[k]=finite(p[k],a,b,k);
  if(![.25,.5,1,2].includes(settings.speed))throw Error('Invalid playback speed.');
  for(const k of ['boundaries','grid','snap','vectors','trails','labels']){if(typeof p[k]!=='boolean')throw Error('Invalid '+k);settings[k]=p[k];}
  const ids=new Set(),bodyIds=new Set();
  const checkId=id=>{if(typeof id!=='string'||!/^\d{1,8}$/.test(id)||ids.has(id))throw Error('Invalid or duplicate object ID.');ids.add(id);return id;};
  const bodies=raw.bodies.map(b=>{
    if(!b||!['ball','box','wall','ramp','magnet'].includes(b.t))throw Error('Unknown object type.');const id=checkId(b.id);bodyIds.add(id);
    if(typeof b.label!=='string'||b.label.length>40||typeof b.fixed!=='boolean'||!/^#[0-9a-f]{6}$/i.test(b.color))throw Error('Invalid object properties.');
    const out={id,t:b.t,label:b.label,fixed:b.fixed,color:b.color};
    for(const [k,a,z] of [['x',-5000,5000],['y',-5000,5000],['r',5,100],['w',10,1000],['h',8,300],['m',.1,100],['angle',-1e9,1e9],['vx',-30,30],['vy',-30,30],['omega',-1e7,1e7],['bounce',0,1],['friction',0,1],['charge',-10,10],['strength',-100,100]])out[k]=finite(b[k],a,z,k);
    return out;
  });
  const springs=raw.springs.map(s=>{if(!s||!['rope','spring'].includes(s.t))throw Error('Invalid connection.');const id=checkId(s.id);
    if((s.a!==null&&!bodyIds.has(s.a))||(s.b!==null&&!bodyIds.has(s.b))||s.a===s.b)throw Error('Invalid connection endpoints.');
    const out={id,t:s.t,a:s.a,b:s.b};for(const [k,a,b] of [['ax',-5000,5000],['ay',-5000,5000],['bx',-5000,5000],['by',-5000,5000],['length',5,1600],['k',.001,1],['damping',0,1]])out[k]=finite(s[k],a,b,k);return out;});
  return{format:'physica-world',version:2,name:raw.name,width:W,height:H,params:settings,bodies,springs,time:finite(raw.time??0,0,1e12,'elapsed time')};
}
function migrate(old){
  if(old.version===2)return validate(old);
  if(!Array.isArray(old.bodies))throw Error('Invalid saved world.');
  const data={format:'physica-world',version:2,name:String(old.name||'Saved world').slice(0,80),params:{...defaults(),g:Math.abs(old.params?.g??1),direction:(old.params?.g??1)<0?270:90,bounce:old.params?.bounce??.6,friction:Math.min(.1,old.params?.friction??.01)},time:0};
  data.bodies=old.bodies.map((b,i)=>({id:String(i+1),t:b.t,label:b.t,x:b.x??(b.x1+b.x2)/2,y:b.y??(b.y1+b.y2)/2,r:b.r||22,w:b.t==='ramp'?clamp(Math.hypot(b.x2-b.x1,b.y2-b.y1),10,500):clamp(b.w||70,10,500),h:b.t==='ramp'?14:clamp(b.h||50,8,300),angle:b.t==='ramp'?Math.atan2(b.y2-b.y1,b.x2-b.x1)/DEG:0,vx:clamp((b.vx||0)/100,-15,15),vy:clamp((b.vy||0)/100,-15,15),omega:0,m:clamp(b.m||2,.1,100),fixed:!!b.static,color:b.color||COLORS[i%COLORS.length],bounce:data.params.bounce,friction:.15,charge:0,strength:15}));
  data.springs=(old.springs||[]).map((s,i)=>({id:String(data.bodies.length+i+1),t:'spring',a:s.a>=0?String(s.a+1):null,b:s.b>=0?String(s.b+1):null,ax:s.a>=0?0:s.ax,ay:s.a>=0?0:s.ay,bx:s.b>=0?0:s.ax,by:s.b>=0?0:s.ay,length:clamp(s.rest||100,5,1600),k:.025,damping:.03}));return validate(data);
}
function loadSaves(){try{const list=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(list)?list:[];}catch{return[];}}
function writeSaves(list){try{localStorage.setItem(KEY,JSON.stringify(list));renderSaves();return true;}catch{status('Browser storage is unavailable or full. Use Share / Export to download your world instead.');return false;}}
function saveCurrent(){endPointer();const s=validate(snapshot()),list=loadSaves();const index=list.findIndex(s=>s.saveId===currentSaveId&&currentSaveId);s.saveId=currentSaveId||crypto.randomUUID();if(index>=0)list.splice(index,1);list.unshift(s);
  if(writeSaves(list.slice(0,30))){currentSaveId=s.saveId;$('sb-name').value=s.name;status('Saved “'+s.name+'” in this browser. Export a backup to keep it elsewhere.');}}
function renderSaves(){const host=$('sb-saves');host.replaceChildren();const list=loadSaves();
  if(!list.length){const p=document.createElement('p');p.className='sb-empty';p.textContent='No saved worlds yet. Name your experiment and press Save.';host.append(p);return;}
  list.forEach((s,i)=>{const row=document.createElement('div');row.className='sb-save-item';
    const load=document.createElement('button');load.className='sb-load';load.type='button';load.textContent=String(s.name||'Untitled');load.dataset.testid='load-save-'+i;load.onclick=()=>{try{const world=migrate(s);checkpoint();applyWorld(world);currentSaveId=s.saveId||null;runStart=null;fit();status('Loaded “'+world.name+'”. Press Play to run.');}catch(e){status('Cannot load this save: '+e.message);}};
    const share=document.createElement('button');share.type='button';share.textContent='Share';share.dataset.testid='share-save-'+i;share.setAttribute('aria-label','Share '+s.name);share.onclick=()=>{try{openShare(migrate(s));}catch(e){status(e.message);}};
    const del=document.createElement('button');del.className='sb-del';del.type='button';del.textContent='×';del.dataset.testid='delete-save-'+i;del.setAttribute('aria-label','Delete saved '+s.name);del.onclick=()=>{if(!confirm('Delete the saved copy of “'+s.name+'”? Your open world will remain.'))return;const list=loadSaves();list.splice(i,1);if(writeSaves(list)){if(currentSaveId===s.saveId)currentSaveId=null;status('Saved copy deleted.');}};
    row.append(load,share,del);host.append(row);
  });
}
async function transformBytes(bytes,stream){const reader=new Blob([bytes]).stream().pipeThrough(stream).getReader();let size=0,parts=[];while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>MAX_FILE){await reader.cancel();throw Error('World file is too large.');}parts.push(value);}const out=new Uint8Array(size);let offset=0;for(const p of parts){out.set(p,offset);offset+=p.length;}return out;}
function b64(bytes){let str='';for(let i=0;i<bytes.length;i++)str+=String.fromCharCode(bytes[i]);return btoa(str).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');}
async function encodeWorld(s){let bytes=new TextEncoder().encode(JSON.stringify(s)),prefix='j2.';if(window.CompressionStream){bytes=await transformBytes(bytes,new CompressionStream('gzip'));prefix='z2.';}return prefix+b64(bytes);}
async function decodeWorld(encoded){if(encoded.length>MAX_FILE*2)throw Error('Shared world is too large.');const [prefix,data]=encoded.split('.');if(!['j2','z2'].includes(prefix)||!data||!/^[A-Za-z0-9_-]+$/.test(data))throw Error('Invalid shared world link.');let bytes=Uint8Array.from(atob(data.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0));if(prefix==='z2'){if(!window.DecompressionStream)throw Error('This browser cannot open compressed links. Ask for a world JSON file.');bytes=await transformBytes(bytes,new DecompressionStream('gzip'));}if(bytes.length>MAX_FILE)throw Error('Shared world is too large.');return validate(JSON.parse(new TextDecoder().decode(bytes)));}
async function openShare(s){setRunning(false);shared=validate(s||snapshot());const dialog=$('sb-share-dialog');$('sb-share-link').value='Preparing your link…';$('sb-copy-link').disabled=true;$('sb-share-status').textContent='';if(!dialog.open)dialog.showModal();
  try{const payload=await encodeWorld(shared),url=new URL(location.href);url.hash='world='+payload;url.search='';if(url.href.length>12000){$('sb-share-link').value='This world is too large for a reliable chat link. Download the world file below.';$('sb-share-status').textContent='All objects and settings are preserved in the file.';}else{$('sb-share-link').value=url.href;$('sb-copy-link').disabled=false;}}catch(e){$('sb-share-link').value='';$('sb-share-status').textContent='Could not create a link. You can still download the world file.';}
}
function downloadWorld(){if(!shared)return;const blob=new Blob([JSON.stringify(shared,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=(shared.name.replace(/[^\w -]/g,'').trim()||'physica-world')+'.physica.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);$('sb-share-status').textContent='World file downloaded. Friends can choose Import file to open it.';}
async function importFile(file){if(!file)return;setRunning(false);status('Reading world file…');try{if(file.size>MAX_FILE)throw Error('World files must be under 250 KB.');const s=validate(JSON.parse(await file.text()));checkpoint();applyWorld(s);currentSaveId=null;runStart=null;fit();status('Imported “'+s.name+'”. Your previous world is available with Undo. Save to keep a local copy.');}catch(e){status('Import failed: '+e.message+' Your current world has not been replaced.');}finally{$('sb-file').value='';}}
async function openHash(){if(!location.hash.startsWith('#world='))return;open();setRunning(false);status('Opening shared world…');try{const s=await decodeWorld(location.hash.slice(7));checkpoint();applyWorld(s);currentSaveId=null;runStart=null;fit();status('Shared world loaded: “'+s.name+'”. Press Play to explore; Save keeps a copy.');}catch(e){status('Unable to open shared world: '+e.message);}historyReplace('#sandbox');}
function historyReplace(hash){window.history.replaceState(null,'',location.pathname+location.search+hash);}
function open(){if(visible)return;visible=true;$('sandbox-view').hidden=false;document.querySelector('.site-shell').style.display='none';document.body.style.overflow='hidden';resize();last=performance.now();raf=requestAnimationFrame(frame);}
function close(){endPointer(true);visible=false;setRunning(false);cancelAnimationFrame(raf);$('sandbox-view').hidden=true;document.querySelector('.site-shell').style.display='';document.body.style.overflow='';if($('sb-share-dialog').open)$('sb-share-dialog').close();$('sandbox-open').focus();}
function init(){
  canvas=$('sandbox-canvas');raw=canvas.getContext('2d');engine=Engine.create({positionIterations:8,velocityIterations:8,constraintIterations:4});new ResizeObserver(resize).observe(canvas);
  $('sandbox-open').onclick=open;$('sandbox-close').onclick=close;canvas.onpointerdown=down;canvas.onpointermove=move;canvas.onpointerup=()=>endPointer();canvas.onpointercancel=()=>endPointer(true);canvas.onlostpointercapture=()=>{if(drag||build)endPointer(true);};
  $('sb-palette').onclick=e=>{const btn=e.target.closest('[data-tool]');if(btn)setTool(btn.dataset.tool);};
  $('sb-mode').onclick=()=>setMode(!simple);
  $('sb-templates').onclick=e=>{const btn=e.target.closest('[data-preset]');if(!btn)return;if(tool==='sling'&&btn.dataset.preset!=='challenge')setTool('move');preset(btn.dataset.preset);fit();};
  $('sb-planets').onclick=e=>{const btn=e.target.closest('[data-g]');if(!btn)return;checkpoint();params.g=Number(btn.dataset.g);syncWorld();status(`Gravity set to ${btn.textContent.trim()}: ${(9.81*params.g).toFixed(2)} m/s².`);};
  $('sb-materials').onclick=e=>{const btn=e.target.closest('[data-mat]');if(!btn)return;material=btn.dataset.mat;const M=MATS[material];
    if(selectedIsBody()&&!selected.plugin.studio.fixed){checkpoint();selected.restitution=M.bounce;selected.friction=M.friction;renderInspector();status(`${selected.plugin.studio.label} is now ${M.label}: bounce ${M.bounce}, friction ${M.friction}.`);}
    else status(`New balls and boxes will be ${M.label} (bounce ${M.bounce}, friction ${M.friction}).`);syncMaterialNote();};
  $('sb-palette').ondragstart=e=>{const btn=e.target.closest('[draggable]');if(btn){e.dataTransfer.setData('application/x-physica-tool',btn.dataset.tool);e.dataTransfer.effectAllowed='copy';}};
  canvas.ondragover=e=>{if(e.dataTransfer.types.includes('application/x-physica-tool'))e.preventDefault();};canvas.ondrop=e=>{e.preventDefault();const t=e.dataTransfer.getData('application/x-physica-tool');if(!['ball','box','wall','ramp','magnet'].includes(t)||(simple&&t==='magnet'))return;checkpoint();selectObject(addAt(t,worldPoint(e,true)));setTool('move');};
  $('sb-play').onclick=()=>{endPointer();if(!running)runStart=snapshot();setRunning(!running);};$('sb-step').onclick=()=>{endPointer();setRunning(false);if(!runStart)runStart=snapshot();tick(1000/120);tick(1000/120);renderInspector();};
  $('sb-reset').onclick=()=>{if(!runStart){status('Press Play first to record a starting state.');return;}checkpoint();applyWorld(runStart);status('Restored the state from the start of the last run.');};
  $('sb-clear').onclick=fresh;$('sb-undo').onclick=()=>undo();$('sb-redo').onclick=()=>undo(true);$('sb-duplicate').onclick=duplicate;$('sb-delete').onclick=removeSelected;
  for(const [id,k] of Object.entries({gravity:'g',direction:'direction',bounce:'bounce',friction:'friction',wind:'wind'})){const el=$('sb-'+id);el.onpointerdown=()=>checkpoint();el.onkeydown=e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End','PageUp','PageDown'].includes(e.key))checkpoint();};el.oninput=()=>{params[k]=Number(el.value);if(k==='bounce'){for(const b of [...objects,...edges])b.restitution=params.bounce;renderInspector();}syncWorld();};}
  for(const k of ['boundaries','grid','snap','vectors','trails','labels'])$('sb-'+k).onchange=e=>{checkpoint();params[k]=e.target.checked;if(k==='boundaries')boundaries();if(k==='trails')for(const b of objects)b.plugin.studio.trail=[];};
  $('sb-speed').onchange=e=>{checkpoint();params.speed=Number(e.target.value);};
  $('sb-zoom-in').onclick=()=>{zoom=clamp(zoom*1.25,.5,3);resize();};$('sb-zoom-out').onclick=()=>{zoom=clamp(zoom/1.25,.5,3);resize();};$('sb-fit').onclick=fit;
  for(const [id,type] of Object.entries({tower:'pit',newton:'pendulum',domino:'domino',orbit:'orbit'}))$('sb-preset-'+id).onclick=()=>preset(type);
  $('sb-save').onclick=()=>{try{saveCurrent();}catch(e){status('Cannot save world: '+e.message);}};$('sb-share').onclick=()=>{try{endPointer();openShare();}catch(e){status('Cannot share world: '+e.message);}};
  $('sb-share-close').onclick=()=>{$('sb-share-dialog').close();$('sb-share').focus();};$('sb-download').onclick=downloadWorld;$('sb-copy-link').onclick=async()=>{try{await navigator.clipboard.writeText($('sb-share-link').value);$('sb-share-status').textContent='Link copied. Send it to a friend.';}catch{$('sb-share-link').focus();$('sb-share-link').select();$('sb-share-status').textContent='Select and copy the link above with your browser’s Copy command.';}};
  $('sb-import').onclick=()=>$('sb-file').click();$('sb-file').onchange=e=>importFile(e.target.files[0]);
  document.addEventListener('keydown',e=>{if(!visible||$('sb-share-dialog').open||['INPUT','TEXTAREA','SELECT','BUTTON'].includes(document.activeElement?.tagName))return;if(e.key==='Escape'){linkPick=null;setTool('move');selectObject(null);return;}if(e.code==='Space'){e.preventDefault();$('sb-play').click();}if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault();undo(e.shiftKey);}if(e.key==='Delete'||e.key==='Backspace'){e.preventDefault();removeSelected();}});
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&visible){endPointer(true);setRunning(false);}});
  const rail=$('rail-toggle'),layout=$('lab-layout');rail.onclick=()=>{const c=layout.classList.toggle('rail-collapsed');rail.textContent=c?'⇤':'⇥';rail.setAttribute('aria-label',c?'Expand controls':'Collapse controls');};
  let mode='simple';try{mode=localStorage.getItem(MODE_KEY)||'simple';}catch{}setMode(mode!=='advanced',false);syncMaterialNote();
  preset('cannon',false);renderSaves();syncHistory();syncWorld();setTool('move');window.addEventListener('hashchange',openHash);openHash();
  // Give existing library controls stable selectors without changing their appearance.
  document.querySelectorAll('button,input,select,textarea,a,summary,[role="status"],[id]').forEach((el,i)=>{if(!el.dataset.testid&&(el.id||el.matches('button,input,select,textarea,a,summary')))el.dataset.testid=el.id||'library-element-'+i;});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
