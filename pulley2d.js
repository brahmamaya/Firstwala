/* Pulley labs, whole-stage 2D (NCERT Class 11 Laws of Motion / Work-Energy):
   1. "Block on an incline with a hanging mass": a spoked pulley, a rope parallel to the slope, friction, force arrows and the real equation of motion, run in time.
   2. "Drawing water from a well": a boy pulls a rope over a fixed pulley on a wooden frame and lifts a bucket of water from the well (a = (F − mg)/(m + I/r²)).
   Both labs integrate the motion with small time steps, stop at the real limits (floor, pulley, water, top) and show the numbers. */
(() => {
'use strict';
const {R,S,N,f,clamp,pack,TAU}=window.PhysicaLab,WK=window.PhysicaWaveKit,{txt}=WK,G=9.81,rad=d=>d*Math.PI/180;
const INT=window.PhysicaInteractive=window.PhysicaInteractive||{},PATCH=window.PhysicaSimPatch=window.PhysicaSimPatch||{},{add,done}=pack();
const MPX=95,FLOOR=440;                                                 // pixels per metre on the incline stage, floor y
// ---------- shared drawing ----------
// A spoked pulley wheel with groove, hub and a bracket; `ang` turns the spokes.
function wheel(c,x,y,r,ang){c.save();c.shadowColor='rgba(0,0,0,.5)';c.shadowBlur=8;c.shadowOffsetY=3;const g=c.createRadialGradient(x-r*.3,y-r*.3,r*.1,x,y,r);g.addColorStop(0,'#f2f5f7');g.addColorStop(.7,'#aeb9c1');g.addColorStop(1,'#5e6a73');c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,TAU);c.fill();c.restore();
  c.save();c.strokeStyle='#39434b';c.lineWidth=2;c.beginPath();c.arc(x,y,r,0,TAU);c.stroke();c.strokeStyle='#e6ecef';c.lineWidth=2.6;c.beginPath();c.arc(x,y,r-4,0,TAU);c.stroke();c.strokeStyle='#4b565e';c.lineWidth=1.4;c.beginPath();c.arc(x,y,r-9,0,TAU);c.stroke();
  c.strokeStyle='#59656d';c.lineWidth=2.2;for(let i=0;i<8;i++){const a=ang+i*TAU/8;c.beginPath();c.moveTo(x+Math.cos(a)*5,y+Math.sin(a)*5);c.lineTo(x+Math.cos(a)*(r-9),y+Math.sin(a)*(r-9));c.stroke()}
  const h=c.createRadialGradient(x-2,y-2,1,x,y,7);h.addColorStop(0,'#fff');h.addColorStop(1,'#6d7880');c.fillStyle=h;c.beginPath();c.arc(x,y,6,0,TAU);c.fill();c.strokeStyle='#2a3238';c.lineWidth=1;c.stroke();c.restore()}
// Rope through the points pts.
function rope(c,pts,w=3){c.save();c.strokeStyle='#8b5a2b';c.lineWidth=w;c.lineCap='round';c.lineJoin='round';c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();c.strokeStyle='rgba(255,220,160,.35)';c.lineWidth=w*.35;c.stroke();c.restore()}
// A block (centre x,y; turned by rot) with a label and a small dot at its centre of mass.
function block(c,x,y,w,h,rot,label,top,bot){c.save();c.translate(x,y);c.rotate(rot);c.shadowColor='rgba(0,0,0,.45)';c.shadowBlur=9;c.shadowOffsetY=4;const g=c.createLinearGradient(0,-h/2,0,h/2);g.addColorStop(0,top);g.addColorStop(1,bot);c.fillStyle=g;c.beginPath();c.roundRect(-w/2,-h/2,w,h,4);c.fill();c.shadowColor='transparent';c.strokeStyle='rgba(0,0,0,.45)';c.lineWidth=1.4;c.stroke();
  c.fillStyle='rgba(255,255,255,.35)';c.fillRect(-w/2+3,-h/2+3,w-6,5);c.fillStyle='#14181d';c.beginPath();c.arc(0,0,2.2,0,TAU);c.fill();c.rotate(-rot);txt(c,label,0,-h/2-12,'#e9f6ff',13,'center',800);c.restore()}
// Force arrow from (x,y) by (dx,dy) with a label.
function arrow(c,x,y,dx,dy,col,label){const L=Math.hypot(dx,dy);if(L<3)return;const ux=dx/L,uy=dy/L;c.save();c.strokeStyle=col;c.fillStyle=col;c.lineWidth=3;c.beginPath();c.moveTo(x,y);c.lineTo(x+dx-ux*8,y+dy-uy*8);c.stroke();c.beginPath();c.moveTo(x+dx,y+dy);c.lineTo(x+dx-ux*11-uy*5,y+dy-uy*11+ux*5);c.lineTo(x+dx-ux*11+uy*5,y+dy-uy*11-ux*5);c.closePath();c.fill();c.restore();
  txt(c,label,x+dx+ux*14,y+dy+uy*14,col,12,'center',800)}
// Clock + integration helper: returns the simulated seconds that passed since the last call (0 while paused).
const stepper=clk=>{let last=0;return{tick(t){clk.tick(t);const d=(clk.tau-last)/.9;last=clk.tau;return clamp(d,0,.2)},zero(){last=clk.tau}}};

// ==================== 1. Incline with a hanging mass ====================
const CA=WK.clock(),SA_STEP=stepper(CA);
const LS=3.3,BASEY=340,S0=.8,H0=.45;                                   // slope length (m), y of the slope's foot (it stands on a table), start position of the block (m along the slope) and length of the hanging rope (m)
let DXA=0,A={x:0,v:0,t:0,stop:'',forces:true,vals:true,hit:[],ang:0};
// Acceleration of the system for the sliders: positive when the hanging mass goes down and the block goes up the slope.
function solveA(p,v){const th=rad(p.th),W1=p.m1*G,Nn=W1*Math.cos(th),drive=p.m2*G-W1*Math.sin(th),fmax=p.mu*Nn,M=p.m1+p.m2;
  if(Math.abs(v)<1e-4)return Math.abs(drive)<=fmax?{a:0,static:true}:{a:(drive-Math.sign(drive)*fmax)/M,static:false};return{a:(drive-Math.sign(v)*fmax)/M,static:false}}
// Moves the system on by dt seconds in small steps; stops it at the pulley, the floor or the top.
function advance(p,dt){if(A.stop)return;const th=rad(p.th),n=Math.max(1,Math.round(dt/.004));
  for(let i=0;i<n;i++){const h=dt/n,s=solveA(p,A.v);let v1=A.v+s.a*h;if(A.v!==0&&Math.sign(v1)!==Math.sign(A.v)&&Math.abs(p.m2*G-p.m1*G*Math.sin(th))<=p.mu*p.m1*G*Math.cos(th))v1=0;A.x+=(A.v+v1)/2*h;A.v=v1;A.t+=h;
    const sBlock=S0+A.x,hang=H0+A.x,room=(FLOOR-(BASEY-LS*Math.sin(th)*MPX)-58)/MPX-.02;
    if(sBlock>LS-.45){A.x=LS-.45-S0;A.v=0;A.stop='The block reached the pulley.';break}
    if(sBlock<.25){A.x=.25-S0;A.v=0;A.stop='The block reached the bottom of the slope.';break}
    if(hang>room){A.x=room-H0;A.v=0;A.stop='The hanging mass reached the floor.';break}
    if(hang<.3){A.x=.3-H0;A.v=0;A.stop='The hanging mass reached the pulley.';break}}}
// Draws the incline stage: wedge, rope, spoked pulley, block, hanging mass, angle, forces.
function drawIncline(c,p){const th=rad(p.th),B={x:110,y:BASEY},Tp={x:110+LS*MPX*Math.cos(th),y:BASEY-LS*MPX*Math.sin(th)},u={x:Math.cos(th),y:-Math.sin(th)},nn={x:-Math.sin(th),y:-Math.cos(th)},Rw=22;
  c.save();c.fillStyle='#060b10';c.fillRect(-480,0,1920,505);const gr=c.createLinearGradient(0,FLOOR,0,505);gr.addColorStop(0,'#2b3a46');gr.addColorStop(1,'#141c23');c.fillStyle=gr;c.fillRect(-480,FLOOR,1920,65);c.strokeStyle='#4a5b68';c.lineWidth=2;c.beginPath();c.moveTo(-480,FLOOR);c.lineTo(1440,FLOOR);c.stroke();
  // the wedge with a tall right-hand pillar
  const wg=c.createLinearGradient(B.x,Tp.y,Tp.x,FLOOR);wg.addColorStop(0,'#7b8a96');wg.addColorStop(1,'#46545f');c.fillStyle=wg;c.beginPath();c.moveTo(B.x,B.y);c.lineTo(Tp.x,Tp.y);c.lineTo(Tp.x,BASEY);c.closePath();c.fill();c.strokeStyle='#2d3841';c.lineWidth=2;c.stroke();const tg=c.createLinearGradient(0,BASEY,0,FLOOR);tg.addColorStop(0,'#8b6b46');tg.addColorStop(1,'#4a3721');c.fillStyle=tg;c.fillRect(B.x-24,BASEY,Tp.x-B.x+24,FLOOR-BASEY);c.fillStyle='#b08a5a';c.fillRect(B.x-24,BASEY,Tp.x-B.x+24,8);
  c.strokeStyle='rgba(255,255,255,.08)';for(let k=1;k<8;k++){c.beginPath();c.moveTo(B.x+(Tp.x-B.x)*k/8,BASEY);c.lineTo(B.x+(Tp.x-B.x)*k/8,BASEY-(BASEY-Tp.y)*k/8);c.stroke()}
  c.restore();
  // the slope surface is rough when mu > 0
  if(p.mu>0){c.save();c.strokeStyle='rgba(255,255,255,.35)';c.lineWidth=1.4;for(let s=12;s<LS*MPX-6;s+=10){const x=B.x+u.x*s,y=B.y+u.y*s;c.beginPath();c.moveTo(x,y);c.lineTo(x+nn.x*3-u.x*3,y+nn.y*3-u.y*3);c.stroke()}c.restore()}
  // angle
  c.save();c.strokeStyle='#e9f6ff';c.lineWidth=1.6;c.beginPath();c.arc(B.x,B.y,58,-th,0);c.stroke();c.restore();txt(c,`θ = ${p.th}°`,B.x+70,B.y-12,'#e9f6ff',13,'left',800);
  // pulley wheel (centre on the apex) and positions
  const C={x:Tp.x,y:Tp.y},sB=(S0+A.x)*MPX,cen={x:B.x+u.x*sB+nn.x*22,y:B.y+u.y*sB+nn.y*22},att={x:cen.x+u.x*35,y:cen.y+u.y*35},hangY=C.y+(H0+A.x)*MPX,hx=C.x+Rw;
  const a0=Math.atan2(nn.y,nn.x),arc=[];for(let a=a0;a<=0.0001;a+=.08)arc.push([C.x+Math.cos(a)*(Rw+1),C.y+Math.sin(a)*(Rw+1)]);arc.push([hx+1,C.y]);
  rope(c,[[att.x,att.y],[C.x+nn.x*(Rw+1),C.y+nn.y*(Rw+1)],...arc,[hx+1,hangY]],3);
  wheel(c,C.x,C.y,Rw,-A.x*MPX/Rw);
  // block and hanging mass
  block(c,cen.x,cen.y,70,44,-th,'m₁','#e9a15b','#a8612a');
  c.save();c.fillStyle='#3a2a18';c.beginPath();c.arc(hx+1,hangY,3,0,TAU);c.fill();c.restore();block(c,hx+1,hangY+31,46,54,0,'m₂','#7fb3ff','#2f68c9');
  c.save();c.strokeStyle='#8b5a2b';c.lineWidth=2;c.beginPath();c.moveTo(hx+1,hangY);c.lineTo(hx+1,hangY+4);c.stroke();c.restore();
  // forces
  const s=solveA(p,A.v),a=s.a,T=p.m2*(G-a),fr=T-p.m1*G*Math.sin(th)-p.m1*a,k=.9,Nn=p.m1*G*Math.cos(th);
  if(A.forces){const v=(F,l)=>A.vals?`${l} = ${f(F,1)} N`:l;
    arrow(c,cen.x,cen.y,0,p.m1*G*k,'#ff6b6b',v(p.m1*G,'m₁g'));arrow(c,cen.x,cen.y,nn.x*Nn*k,nn.y*Nn*k,'#69db7c',v(Nn,'N'));arrow(c,cen.x+u.x*30,cen.y+u.y*30,u.x*T*k,u.y*T*k,'#ffd43b',v(T,'T'));
    if(Math.abs(fr)>.05)arrow(c,cen.x-u.x*20,cen.y-u.y*20,-u.x*fr*k,-u.y*fr*k,'#ff9f43',v(Math.abs(fr),'f'));
    arrow(c,hx+1,hangY+31,0,p.m2*G*k,'#ff6b6b',v(p.m2*G,'m₂g'));arrow(c,hx+1,hangY+2,0,-T*k,'#ffd43b',v(T,'T'))}
  return{a,T,fr,Nn,static:s.static}}
INT['incline-pulley']={allViews:true,
 draw(c,p,t){advance(p,SA_STEP.tick(t));const clean=WK.clean();DXA=WK.shift(70,110+LS*MPX*Math.cos(rad(p.th))+90);c.save();c.fillStyle='#060b10';c.fillRect(0,0,960,505);c.translate(DXA,0);const r=drawIncline(c,p),y0=84,px=650,pw=290;c.restore();
  A.hit=[WK.check(c,60,40,'Show forces',A.forces,'#fff'),WK.check(c,196,40,'Show values',A.vals,'#fff')];if(!clean)txt(c,'Press ▶ to run. Change the angle, the masses and the friction with the sliders.',330,40,'#8ca6b9',11,'left',600);
  if(!clean)WK.panel(c,px,y0,pw,FLOOR-y0);const st=A.stop||(r.static&&Math.abs(A.v)<1e-4?'Friction holds the block: no motion.':CA.paused&&A.t===0?'Ready: press ▶ to run.':'Moving'),ls=[
   ['Result',  '#42d9ca',13,800],[`a = ${f(Math.abs(r.a),2)} m/s²   ${r.a>0.001?'(m₂ goes down)':r.a<-0.001?'(m₂ goes up)':''}`,'#e9f6ff',13,700],[`v = ${f(Math.abs(A.v),2)} m/s    t = ${f(A.t,2)} s`,'#cfe2ee',12.5,600],[`T = ${f(r.T,1)} N`,'#ffd43b',12.5,700],[`N = m₁g cosθ = ${f(r.Nn,1)} N`,'#69db7c',12.5,700],[`friction f = ${f(Math.abs(r.fr),1)} N ${r.fr>0.05?'(down the slope)':r.fr<-0.05?'(up the slope)':''}`,'#ff9f43',12.5,700],[st,'#fff',12,700],['',0],
   ['Equations','#42d9ca',13,800],['m₂g − T = m₂a','#cfe2ee',12.5,600],['T − m₁g sinθ − f = m₁a','#cfe2ee',12.5,600],['f = μ m₁g cosθ  (when sliding)','#cfe2ee',12.5,600],['a = (m₂g − m₁g sinθ − μm₁g cosθ)/(m₁ + m₂)','#cfe2ee',11.5,600],[`pulley: light, smooth, rope does not stretch`,'#8ca6b9',11,600]];
  if(!clean)ls.forEach(([s,k,sz,w],i)=>{if(s)txt(c,s,px+12,y0+20+i*22,k,sz,'left',w)});WK.transport(c,CA)},
 down(q,p){if(WK.transportHit(q,CA,1.08,()=>{A.x=0;A.v=0;A.t=0;A.stop='';CA.paused=true;CA.slow=false;SA_STEP.zero()}))return;
  const i=A.hit.findIndex(h=>q.x>=h.x&&q.x<=h.x+h.w&&q.y>=h.y&&q.y<=h.y+h.h);if(i>=0){if(i===0)A.forces=!A.forces;else A.vals=!A.vals}},
 move(){},up(){}};
CA.paused=true;
(window.PhysicaFullStage=window.PhysicaFullStage||{})['incline-pulley']=(c,p,t)=>INT['incline-pulley'].draw(c,p,t);
PATCH['incline-pulley']={
 description:'A block on a slope is tied over a spoked pulley to a hanging mass. Choose the masses, the angle and the friction, press Run and watch the real motion with all the forces.',
 formula:'a = (m₂g − m₁g sinθ ∓ μm₁g cosθ) / (m₁ + m₂) ;  T = m₂(g − a)',
 observe:'Friction always opposes the motion; if it can balance the pull, nothing moves. The rope tension is the same on both sides of a light, smooth pulley.',
 tryText:'Find the hanging mass that just starts the block moving up the slope. Then add friction and run again.',
 metrics:p=>{const s=solveA(p,0),th=rad(p.th),T=p.m2*(G-s.a),fr=Math.abs(T-p.m1*G*Math.sin(th)-p.m1*s.a);return[N('Acceleration',f(Math.abs(s.a),2)+' m/s²'),N('Motion',s.a===0?'Stays at rest':s.a>0?'m₂ goes down, m₁ up the slope':'m₁ slides down the slope'),N('String tension',f(T,1)+' N'),N('Friction',f(fr,1)+' N')]}};

// ==================== 2. Drawing water from a well ====================
const CW=WK.clock(),SW_STEP=stepper(CW);
const GY=330,WATER=430,WPX=58,PUL={x:440,y:182,r:26};                   // ground y, water level y, px per metre, pulley wheel
let DXWv=0,Wd={h:0,v:0,t:0,W:0,stop:'',hit:[],show:true,hand:0};
const bucketMass=p=>2+p.water;                                          // empty bucket 2 kg + water (1 kg per litre)
// Pull the boy can really give: at most his own weight (he would be lifted off the ground otherwise).
const pullEff=p=>Math.min(p.pull,p.boy*G);
// Acceleration of the bucket (+ up): (F − mg)/(m + I/r²) with a disc pulley of 2 kg (I/r² = 1 kg).
function accW(p,v,h){const m=bucketMass(p),a=(pullEff(p)-m*G)/(m+1);return h<=0&&a<0&&v<=0?0:a}
// Moves the bucket on by dt seconds; it stops on the water and at the pulley.
function advanceW(p,dt){if(Wd.stop==='top')return;const n=Math.max(1,Math.round(dt/.004));for(let i=0;i<n;i++){const hh=dt/n,a=accW(p,Wd.v,Wd.h),v1=Wd.v+a*hh,dh=(Wd.v+v1)/2*hh;Wd.W+=pullEff(p)*Math.max(dh,0);Wd.h+=dh;Wd.v=v1;Wd.t+=hh;
  if(Wd.h<=0){Wd.h=0;if(Wd.v<0)Wd.v=0;Wd.stop=''}if(Wd.h>=(WATER-(PUL.y+PUL.r+46))/WPX){Wd.h=(WATER-(PUL.y+PUL.r+46))/WPX;Wd.v=0;Wd.stop='top';break}}}
// The wooden bucket with water, band, and handle at its top centre (x,y = top of the bucket).
function bucket(c,x,y,water){c.save();const w=44,h=38;c.shadowColor='rgba(0,0,0,.5)';c.shadowBlur=6;c.shadowOffsetY=3;const g=c.createLinearGradient(x-w/2,0,x+w/2,0);g.addColorStop(0,'#8d5a2a');g.addColorStop(.5,'#c98d4e');g.addColorStop(1,'#7a4a1f');c.fillStyle=g;c.beginPath();c.moveTo(x-w/2,y+4);c.lineTo(x+w/2,y+4);c.lineTo(x+w/2-5,y+h);c.lineTo(x-w/2+5,y+h);c.closePath();c.fill();c.shadowColor='transparent';
  if(water>0.5){const lv=clamp(water/15,.15,.9),yy=y+4+(1-lv)*(h-4);c.fillStyle='rgba(77,171,247,.85)';c.beginPath();c.moveTo(x-w/2+ (yy-y-4)/(h-4)*5,yy);c.lineTo(x+w/2-(yy-y-4)/(h-4)*5,yy);c.lineTo(x+w/2-5,y+h);c.lineTo(x-w/2+5,y+h);c.closePath();c.fill()}
  c.fillStyle='#d5dbe0';c.fillRect(x-w/2+2,y+14,w-4,3);c.fillRect(x-w/2+4,y+27,w-8,3);c.strokeStyle='#4a2d10';c.lineWidth=1.4;c.beginPath();c.moveTo(x-w/2,y+4);c.lineTo(x+w/2,y+4);c.stroke();
  c.strokeStyle='#a9b3ba';c.lineWidth=2.2;c.beginPath();c.moveTo(x-w/2,y+4);c.quadraticCurveTo(x,y-22,x+w/2,y+4);c.stroke();c.restore()}
// A limb: a thick stroke through the points with a darker outline and a light edge, so arms and legs look rounded.
function limb(c,pts,w,col,edge){c.save();c.lineCap='round';c.lineJoin='round';const path=()=>{c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y))};c.strokeStyle='rgba(0,0,0,.45)';c.lineWidth=w+2.5;path();c.stroke();c.strokeStyle=col;c.lineWidth=w;path();c.stroke();c.strokeStyle=edge;c.lineWidth=w*.28;c.translate(-w*.18,-w*.1);path();c.stroke();c.restore()}
// The person pulling (side view, boy or girl) with a face, hair, clothes and two arms that pull the rope hand over hand.
// `ph` runs 0..1 per arm stroke, `lean` = how hard they pull (leans back), `effort` 0..1 changes the face, `sway` swings the girl's plait.
function person(c,x,feet,ph,lean,ropeAt,who,effort,sway){c.save();const girl=who==='girl',skin='#e9b48a',skinD='#c98d63',hair=girl?'#1a0f0a':'#15100c',top=girl?'#d6336c':'#e05a3c',topD=girl?'#9c2150':'#a73b25',pant=girl?'#5b2a86':'#2b3a8c',pantD=girl?'#3a1a57':'#1b2660';
  const hip={x:x-lean*.18,y:feet-76},sh={x:x+lean*.38,y:feet-128},hd={x:sh.x+7+lean*.05,y:sh.y-22};
  // shadow
  c.fillStyle='rgba(0,0,0,.28)';c.beginPath();c.ellipse(x+4,feet+2,32,5,0,0,TAU);c.fill();
  // legs (thigh, shin) and shoes
  limb(c,[[hip.x+3,hip.y],[x+13,feet-38],[x+15,feet-6]],14,pant,'rgba(255,255,255,.18)');limb(c,[[hip.x-3,hip.y],[x-11,feet-38],[x-13,feet-6]],14,pantD,'rgba(255,255,255,.12)');
  c.fillStyle='#231a14';c.beginPath();c.ellipse(x+22,feet-3,13,5,0,0,TAU);c.fill();c.beginPath();c.ellipse(x-7,feet-3,13,5,0,0,TAU);c.fill();c.fillStyle='rgba(255,255,255,.2)';c.fillRect(x+12,feet-6,12,1.6);
  // torso (shirt / kurti) with a gradient, collar and hem
  const tg=c.createLinearGradient(hip.x-14,0,sh.x+14,0);tg.addColorStop(0,topD);tg.addColorStop(.55,top);tg.addColorStop(1,topD);c.fillStyle=tg;c.beginPath();c.moveTo(sh.x-13,sh.y+2);c.quadraticCurveTo(sh.x+16,sh.y-2,sh.x+12,sh.y+14);c.lineTo(hip.x+15+(girl?5:0),hip.y+(girl?20:6));c.lineTo(hip.x-15-(girl?5:0),hip.y+(girl?20:6));c.closePath();c.fill();c.strokeStyle='rgba(0,0,0,.4)';c.lineWidth=1.4;c.stroke();
  c.strokeStyle='rgba(255,255,255,.22)';c.lineWidth=1.2;c.beginPath();c.moveTo(sh.x-6,sh.y+10);c.quadraticCurveTo(hip.x-4,hip.y-18,hip.x-6,hip.y+2);c.stroke();c.strokeStyle='rgba(0,0,0,.25)';c.beginPath();c.moveTo(sh.x+4,sh.y+16);c.quadraticCurveTo(hip.x+10,hip.y-14,hip.x+4,hip.y+3);c.stroke();
  // neck, head
  c.fillStyle=skinD;c.fillRect(sh.x-1,sh.y-12,9,13);
  // plait (girl) behind the head
  if(girl){c.strokeStyle=hair;c.lineWidth=7;c.lineCap='round';c.beginPath();c.moveTo(hd.x-9,hd.y-3);c.quadraticCurveTo(hd.x-26-sway*4,hd.y+14,hd.x-22-sway*7,hd.y+46);c.stroke();c.strokeStyle='rgba(255,255,255,.12)';c.lineWidth=2;c.stroke();c.fillStyle='#ffd43b';c.beginPath();c.arc(hd.x-22-sway*7,hd.y+47,3.4,0,TAU);c.fill()}
  const fg=c.createRadialGradient(hd.x+3,hd.y-4,2,hd.x,hd.y,16);fg.addColorStop(0,'#f6cfa8');fg.addColorStop(1,skin);c.fillStyle=fg;c.beginPath();c.ellipse(hd.x,hd.y,12.5,14.5,0,0,TAU);c.fill();c.strokeStyle='rgba(0,0,0,.35)';c.lineWidth=1.2;c.stroke();
  c.fillStyle=skinD;c.beginPath();c.ellipse(hd.x-6,hd.y+1,3,4.4,0,0,TAU);c.fill();
  // hair
  c.fillStyle=hair;c.beginPath();c.ellipse(hd.x-1.5,hd.y-5,13.5,11,0,Math.PI*.98,Math.PI*2.02);c.fill();if(!girl){c.beginPath();c.moveTo(hd.x+11,hd.y-8);c.quadraticCurveTo(hd.x+14,hd.y-2,hd.x+9,hd.y-3);c.lineTo(hd.x+3,hd.y-9);c.fill()}else{c.beginPath();c.moveTo(hd.x+11,hd.y-6);c.quadraticCurveTo(hd.x+14,hd.y-1,hd.x+10,hd.y+1);c.lineTo(hd.x+4,hd.y-8);c.fill()}
  // face: brow, eye, nose, mouth (a grin at rest, gritted teeth when pulling hard), a sweat drop when the effort is high
  c.strokeStyle='#1a0f0a';c.lineWidth=2;c.beginPath();c.moveTo(hd.x+3,hd.y-6-effort*1.5);c.lineTo(hd.x+10,hd.y-5.5+effort*2);c.stroke();c.fillStyle='#fff';c.beginPath();c.ellipse(hd.x+7,hd.y-2,3,2.4,0,0,TAU);c.fill();c.fillStyle='#2b1a10';c.beginPath();c.arc(hd.x+8,hd.y-2,1.7,0,TAU);c.fill();
  c.strokeStyle=skinD;c.lineWidth=1.4;c.beginPath();c.moveTo(hd.x+11,hd.y-1);c.lineTo(hd.x+13.5,hd.y+4);c.lineTo(hd.x+10.5,hd.y+4.5);c.stroke();
  if(effort>.55){c.fillStyle='#fff';c.strokeStyle='#3a1f10';c.lineWidth=1.2;c.beginPath();c.roundRect(hd.x+4,hd.y+7,8,3.4,1.2);c.fill();c.stroke()}else{c.strokeStyle='#8a3a2a';c.lineWidth=1.8;c.beginPath();c.arc(hd.x+8,hd.y+5,4,.15*Math.PI,.85*Math.PI);c.stroke()}
  if(effort>.8){c.fillStyle='rgba(120,200,255,.9)';c.beginPath();c.moveTo(hd.x-2,hd.y-17);c.quadraticCurveTo(hd.x+1,hd.y-12,hd.x-2,hd.y-10);c.quadraticCurveTo(hd.x-5,hd.y-12,hd.x-2,hd.y-17);c.fill()}
  // arms: sleeves, forearms and hands on the rope
  const hands=[ropeAt(ph),ropeAt((ph+.5)%1)];hands.forEach((h,i)=>{const ex=(sh.x+h.x)/2-10,ey=(sh.y+h.y)/2+18;limb(c,[[sh.x,sh.y+6],[ex,ey]],9,i?topD:top,'rgba(255,255,255,.2)');limb(c,[[ex,ey],[h.x,h.y]],7,i?skinD:skin,'rgba(255,255,255,.28)');c.fillStyle=i?skinD:skin;c.beginPath();c.arc(h.x,h.y,4.6,0,TAU);c.fill();c.strokeStyle='rgba(0,0,0,.4)';c.lineWidth=1;c.stroke();
    if(girl){c.strokeStyle='#ffd43b';c.lineWidth=1.8;c.beginPath();c.arc(ex*.3+h.x*.7,ey*.3+h.y*.7,4.2,0,TAU);c.stroke()}});
  c.restore();return sh}
// The name board standing on the ground: tap it to type a new name (kept on this device).
let NAME='';try{NAME=localStorage.getItem('physica-puller')||''}catch{}
const nameOf=p=>NAME||(p.who==='girl'?'Priya':'Rahul'),BOARD={x:196,y:GY-52,w:128,h:34};
function nameBoard(c,p){c.save();c.fillStyle='#5b3a1a';c.fillRect(BOARD.x+14,BOARD.y+BOARD.h,6,18);c.fillRect(BOARD.x+BOARD.w-20,BOARD.y+BOARD.h,6,18);const g=c.createLinearGradient(0,BOARD.y,0,BOARD.y+BOARD.h);g.addColorStop(0,'#c9975a');g.addColorStop(1,'#9a6b3a');c.fillStyle=g;c.beginPath();c.roundRect(BOARD.x,BOARD.y,BOARD.w,BOARD.h,5);c.fill();c.strokeStyle='#4a2d10';c.lineWidth=2;c.stroke();c.restore();
  txt(c,nameOf(p),BOARD.x+BOARD.w/2,BOARD.y+BOARD.h/2-3,'#2a1708',15,'center',800);txt(c,'tap to change the name',BOARD.x+BOARD.w/2,BOARD.y+BOARD.h+30,'#fff',9.5,'center',600)}
// Asks for a new name; only letters, digits, space and . ' - are kept, at most 14 characters.
function askName(p){let v=null;try{v=window.prompt('Name of the person pulling (max 14 letters):',nameOf(p))}catch{}if(v===null)return;v=v.replace(/[^\p{L}\p{N} .'-]/gu,'').trim().slice(0,14);NAME=v;try{localStorage.setItem('physica-puller',v)}catch{}}
// The scene: sky, ground, well shaft with water, wooden frame, pulley, rope, bucket, boy.
function drawWell(c,p){c.save();const sky=c.createLinearGradient(0,0,0,GY);sky.addColorStop(0,'#2a5f8f');sky.addColorStop(1,'#9fd0ee');c.fillStyle=sky;c.fillRect(-480,0,1920,GY);c.fillStyle='#ffe58a';c.beginPath();c.arc(850,90,30,0,TAU);c.fill();
  c.fillStyle='#3f7d3a';c.fillRect(-480,GY,1920,12);const gd=c.createLinearGradient(0,GY+12,0,505);gd.addColorStop(0,'#6b4a2b');gd.addColorStop(1,'#3d2a18');c.fillStyle=gd;c.fillRect(-480,GY+12,1920,505-GY-12);c.restore();
  // well shaft (cut-away) and stone parapet
  const x0=360,x1=520;c.save();c.fillStyle='#1b1410';c.fillRect(x0,GY+12,x1-x0,505-GY-12);const wy=WATER,wg=c.createLinearGradient(0,wy,0,505);wg.addColorStop(0,'#2d8fd0');wg.addColorStop(1,'#0d3b62');c.fillStyle=wg;c.fillRect(x0,wy,x1-x0,505-wy);c.strokeStyle='rgba(255,255,255,.35)';c.beginPath();for(let x=x0;x<=x1;x+=4)c.lineTo(x,wy+Math.sin(x*.2+Wd.t*3)*1.6);c.stroke();
  c.fillStyle='#6f7a82';for(let y=GY+14;y<505;y+=18)for(let k=0;k<2;k++){const bx=k?x1-14:x0,off=(Math.floor((y-GY)/18)%2)*7;c.fillStyle=(Math.floor((y-GY)/18)+k)%2?'#7b868e':'#69747c';c.fillRect(bx,y,14,17)}
  for(let k=0;k<5;k++){const y=GY-30+(k%3)*0;c.fillStyle=k%2?'#8a949b':'#78828a'}c.restore();
  c.save();for(let r=0;r<2;r++)for(let k=0;k<7;k++){c.fillStyle=(r+k)%2?'#8a949b':'#747e86';c.fillRect(x0-14+k*(x1-x0+28)/7,GY-30+r*15,(x1-x0+28)/7-1,14)}c.restore();
  // wooden frame, beam and pulley
  c.save();const wood=c.createLinearGradient(0,0,12,0);wood.addColorStop(0,'#9a6b3a');wood.addColorStop(1,'#6e4721');c.fillStyle=wood;c.fillRect(x0-6,PUL.y-34,12,GY-30-(PUL.y-34));c.fillRect(x1-6,PUL.y-34,12,GY-30-(PUL.y-34));c.fillRect(x0-14,PUL.y-42,x1-x0+28,12);
  c.strokeStyle='#5b3a1a';c.lineWidth=5;c.beginPath();c.moveTo(x0,GY-30);c.lineTo(x0+30,PUL.y+20);c.moveTo(x1,GY-30);c.lineTo(x1-30,PUL.y+20);c.stroke();c.strokeStyle='#4a5560';c.lineWidth=5;c.beginPath();c.moveTo(PUL.x,PUL.y-30);c.lineTo(PUL.x,PUL.y);c.stroke();c.restore();
  // geometry
  const tb=WATER-18-Wd.h*WPX,bx=PUL.x+PUL.r,bTop=tb-38,hand=PUL.x-300,H={x:hand,y:GY-100};
  const dh=Math.hypot(H.x-PUL.x,H.y-PUL.y),beta=Math.atan2(H.y-PUL.y,H.x-PUL.x),dl=Math.acos(PUL.r/dh);let t1=beta-dl,t2=beta+dl;const norm=a=>{while(a>Math.PI)a-=TAU;while(a<-Math.PI)a+=TAU;return a};t1=norm(t1);t2=norm(t2);const at=(t1<=-Math.PI/2&&t1>-Math.PI)?t1:t2;
  const tp={x:PUL.x+Math.cos(at)*PUL.r,y:PUL.y+Math.sin(at)*PUL.r},arc=[];for(let a=at;a<=0.0001;a+=.08)arc.push([PUL.x+Math.cos(a)*(PUL.r+1),PUL.y+Math.sin(a)*(PUL.r+1)]);arc.push([bx+1,PUL.y]);
  rope(c,[[H.x-6,H.y+60],[tp.x,tp.y],...arc,[bx+1,tb-20]],3.2);wheel(c,PUL.x,PUL.y,PUL.r,-Wd.h*WPX/PUL.r);
  c.save();c.strokeStyle='#a9b3ba';c.lineWidth=2;c.beginPath();c.moveTo(bx+1,tb-20);c.lineTo(bx+1-22,tb+4);c.moveTo(bx+1,tb-20);c.lineTo(bx+1+22,tb+4);c.stroke();c.restore();bucket(c,bx+1,tb,p.water);
  // water drips when the bucket is above the water
  if(Wd.h>.25&&p.water>0){c.save();c.fillStyle='rgba(120,190,255,.9)';for(let i=0;i<3;i++){const ph=(Wd.t*1.6+i*.33)%1;c.beginPath();c.arc(bx-6+i*6,tb+40+ph*(WATER-tb-44),2,0,TAU);c.fill()}c.restore()}
  // boy: hands slide along the rope as it comes down (hand-over-hand)
  const ph=(Wd.h*1.1)%1,m0=bucketMass(p),eff=clamp((pullEff(p)-m0*G*.6)/(m0*G*.8),0,1);person(c,H.x-26,GY,ph,clamp(pullEff(p)/6,0,60),u=>({x:H.x-8-u*8,y:H.y-26+u*74}),p.who,eff,Math.sin(CW.tau*2.2));nameBoard(c,p);
  return{m:bucketMass(p),a:accW(p,Wd.v,Wd.h)}}
INT['well-pulley']={allViews:true,
 draw(c,p,t){advanceW(p,SW_STEP.tick(t));const clean=WK.clean(),DXW=WK.shift(60,610);DXWv=DXW;c.save();c.translate(DXW,0);const r=drawWell(c,p);c.restore();const px=650,pw=290,y0=84,W=Wd.W,PE=r.m*G*Wd.h,KE=.5*(r.m+1)*Wd.v*Wd.v,Fe=pullEff(p);
  if(!clean)txt(c,'Set the pull and the water with the sliders, then press ▶. Pull = weight lifts the bucket at constant speed.',60,40,'#fff',11.5,'left',700);
  if(!clean)WK.panel(c,px,y0,pw,FLOOR-y0+20);const msg=Wd.stop==='top'?'The bucket reached the pulley.':p.pull>p.boy*G?'Cannot pull harder than own weight.':Wd.h<=0&&r.a===0&&CW.paused&&Wd.t===0?'Ready: press ▶.':Fe>r.m*G+.1?'Bucket speeds up.':Fe<r.m*G-.1?'Bucket falls back / stays at the water.':'Constant speed: pull = weight.',
   ls=[['Bucket and water','#42d9ca',13,800],[`m = 2 + ${f(p.water,0)} = ${f(r.m,0)} kg    weight = ${f(r.m*G,0)} N`,'#cfe2ee',12,600],[`${nameOf(p)} pulls with F = ${f(Fe,0)} N`,'#ffd43b',12.5,700],[`(own weight ${f(p.boy*G,0)} N: cannot pull harder)`,'#8ca6b9',11,600],[msg,'#fff',12,700],['',0],
   ['Motion','#42d9ca',13,800],[`a = (F − mg)/(m + I/r²) = ${f(r.a,2)} m/s²`,'#e9f6ff',12,700],[`v = ${f(Wd.v,2)} m/s    h = ${f(Wd.h,2)} m`,'#cfe2ee',12.5,600],[`time = ${f(Wd.t,1)} s`,'#cfe2ee',12.5,600],['',0],
   ['Energy','#42d9ca',13,800],[`work by ${nameOf(p)} = ${f(W,0)} J`,'#cfe2ee',12.5,600],[`gain in PE = mgh = ${f(PE,0)} J`,'#69db7c',12.5,600],[`gain in KE = ${f(KE,1)} J`,'#69db7c',12.5,600],['A fixed pulley only turns the pull downwards:','#8ca6b9',11,600],['effort = load, mechanical advantage = 1.','#8ca6b9',11,600]];
  if(!clean)ls.forEach(([s,k,sz,w],i)=>{if(s)txt(c,s,px+12,y0+20+i*21.5,k,sz,'left',w)});WK.transport(c,CW)},
 down(q,p){const x=q.x-DXWv;if(x>=BOARD.x&&x<=BOARD.x+BOARD.w&&q.y>=BOARD.y&&q.y<=BOARD.y+BOARD.h+18){askName(p);return}WK.transportHit(q,CW,1.08,()=>{Wd.h=0;Wd.v=0;Wd.t=0;Wd.W=0;Wd.stop='';CW.paused=true;CW.slow=false;SW_STEP.zero()})},move(){},up(){}};
CW.paused=true;
(window.PhysicaFullStage=window.PhysicaFullStage||{})['well-pulley']=(c,p,t)=>INT['well-pulley'].draw(c,p,t);
add({base:'forces',id:'well-pulley',title:'Drawing water from a well (fixed pulley)',
 description:'A boy or a girl (you choose, and you can type the name) pulls a rope over a pulley on a wooden frame and lifts a bucket of water out of the well. Change the water and his pull and watch the bucket speed up, rise at constant speed or fall back.',
 formula:'a = (F − mg)/(m + I/r²) ;  at constant speed F = mg ;  work by the boy = mgh + ½mv²',
 observe:'A fixed pulley only changes the direction of the force: the pull equals the weight. The person can pull down with at most their own weight, or they would be lifted off the ground.',
 tryText:'Fill the bucket with 10 litres. Find the pull that lifts it at constant speed. Then pull 30 N harder and see the acceleration.',
 controls:[S('who','Who is pulling?','boy',[['boy','Boy'],['girl','Girl']]),R('water','Water in the bucket',0,15,1,8,'L'),R('pull','Pull on the rope',0,600,5,150,'N'),R('boy','Mass of the person',30,70,1,45,'kg')],
 metrics:p=>{const m=bucketMass(p),a=(pullEff(p)-m*G)/(m+1);return[N('Load (bucket + water)',f(m,0)+' kg = '+f(m*G,0)+' N'),N('Pull needed for constant speed',f(m*G,0)+' N'),N('Acceleration of the bucket',f(a,2)+' m/s²'),N('Mechanical advantage',f(1,0))]},
 draw:(c,p,t)=>INT['well-pulley'].draw(c,p,t),flat:true,
 assumption:'Fixed disc pulley of 2 kg (I/r² = 1 kg), light rope, no axle friction, 1 L of water = 1 kg, bucket 2 kg. The boy pulls with a steady force F ≤ his weight.'});
done();
})();
