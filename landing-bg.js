/* Landing backdrop: the Physica logo as a black hole filling the background. The logo's mint
   circle is the photon ring, its tilted gold orbit a spinning accretion disk (brighter on the
   approaching side, lensed over the top), in a drifting star field. Glows are pre-rendered once
   per size and the particle count adapts to the device, so tablets and phones stay smooth. */
(() => {
'use strict';
const cv=document.getElementById('landing-bg');if(!cv||!cv.getContext)return;
const g=cv.getContext('2d'),TAU=Math.PI*2,reduce=!!(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches);
const weak=(navigator.hardwareConcurrency||4)<=4||Math.min(screen.width,screen.height)<500;
let W=0,H=0,dpr=1,raf=0,running=false,last=0,dive=0,mx=0,my=0,tx=0,ty=0,glowC=null,cx=0,cy=0,R=0;
const rnd=(a,b)=>a+Math.random()*(b-a);
const stars=Array.from({length:weak?200:360},()=>({x:rnd(-1,1),y:rnd(-1,1),z:rnd(.15,1),s:rnd(.5,1.6),ph:rnd(0,TAU),c:Math.random()<.15?'255,214,170':Math.random()<.2?'170,210,255':'255,255,255'}));
const disk=Array.from({length:weak?650:1300},()=>{const r=1.55+Math.pow(Math.random(),1.7)*2.6;return{r,a:rnd(0,TAU),s:rnd(.7,1.9)*(1.25-r/5),b:rnd(.55,1),w:.55/Math.pow(r,1.5)}});
const TILT=-25*Math.PI/180,CA=Math.cos(TILT),SA=Math.sin(TILT),INC=.3;
function geom(){const small=W<640;cx=W/2;cy=H*(small?.46:.5);R=Math.min(W,H)*(small?.17:.15)}
// Static parts (background, nebula, lens arcs, photon ring glow) drawn once per size.
function bake(){glowC=document.createElement('canvas');glowC.width=cv.width;glowC.height=cv.height;const b=glowC.getContext('2d');b.setTransform(dpr,0,0,dpr,0,0);
  const bg=b.createRadialGradient(cx,cy,R,cx,cy,Math.max(W,H)*.9);bg.addColorStop(0,'#0c1b2e');bg.addColorStop(.5,'#060d18');bg.addColorStop(1,'#020509');b.fillStyle=bg;b.fillRect(0,0,W,H);
  b.globalCompositeOperation='lighter';for(const [x,y,r,c] of[[.15,.2,.5,'66,217,202'],[.85,.75,.55,'167,139,250'],[.75,.12,.4,'251,146,60']]){const n=b.createRadialGradient(W*x,H*y,0,W*x,H*y,Math.max(W,H)*r);n.addColorStop(0,`rgba(${c},.08)`);n.addColorStop(1,`rgba(${c},0)`);b.fillStyle=n;b.fillRect(0,0,W,H)}
  b.save();b.translate(cx,cy);b.rotate(TILT);b.save();b.scale(1,INC);const gg=b.createRadialGradient(0,0,R*1.4,0,0,R*4.2);gg.addColorStop(0,'rgba(255,214,150,.26)');gg.addColorStop(.35,'rgba(255,170,80,.12)');gg.addColorStop(1,'rgba(251,146,60,0)');b.fillStyle=gg;b.beginPath();b.arc(0,0,R*4.2,0,TAU);b.fill();b.restore();
  for(const [rr,al] of[[1.32,.5],[1.52,.26],[1.78,.12]]){b.beginPath();b.ellipse(0,0,R*rr,R*rr*.92,0,0,TAU);b.strokeStyle=`rgba(255,200,120,${al})`;b.lineWidth=R*.07;b.shadowColor='rgba(255,170,80,.8)';b.shadowBlur=R*.35;b.stroke()}b.restore();
  b.shadowBlur=0;const ring=b.createRadialGradient(cx,cy,R*.95,cx,cy,R*1.45);ring.addColorStop(0,'rgba(66,217,202,.0)');ring.addColorStop(.12,'rgba(66,217,202,.38)');ring.addColorStop(1,'rgba(66,217,202,0)');b.fillStyle=ring;b.beginPath();b.arc(cx,cy,R*1.45,0,TAU);b.fill();
  b.globalCompositeOperation='source-over';const v=b.createRadialGradient(W/2,H/2,Math.min(W,H)*.35,W/2,H/2,Math.max(W,H)*.75);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.55)');b.fillStyle=v;b.fillRect(0,0,W,H)}
function size(){dpr=Math.min(weak?1.25:1.75,window.devicePixelRatio||1);W=cv.clientWidth||window.innerWidth;H=cv.clientHeight||window.innerHeight;cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);g.setTransform(dpr,0,0,dpr,0,0);geom();bake()}
function frame(now){const dt=Math.min(.05,last?(now-last)/1000:.016);last=now;tx+=(mx-tx)*.05;ty+=(my-ty)*.05;
  const ox=tx*16,oy=ty*10,z=1+dive*dive*6,X=cx+ox,Y=cy+oy,RR=R*z;
  g.setTransform(1,0,0,1,0,0);g.globalCompositeOperation='source-over';g.globalAlpha=1;
  g.fillStyle='#020509';g.fillRect(0,0,cv.width,cv.height);if(dive>0){g.setTransform(z,0,0,z,X*dpr*(1-z),Y*dpr*(1-z));g.drawImage(glowC,0,0)}else g.drawImage(glowC,ox*dpr,oy*dpr);
  g.setTransform(dpr,0,0,dpr,0,0);
  g.globalCompositeOperation='lighter';const t=now/1000,sp=(.012+dive*.5)*dt*(1+dive*20);
  for(const s of stars){s.z-=sp;if(s.z<.08){s.z=1;s.x=rnd(-1,1);s.y=rnd(-1,1)}let x=X+s.x/s.z*W*.35,y=Y+s.y/s.z*H*.35,dx=x-X,dy=y-Y,d=Math.hypot(dx,dy)||1;if(d<RR*1.05)continue;const k=1+(RR*RR*1.6)/(d*d);x=X+dx*k;y=Y+dy*k;
    const a=(.35+.65*Math.abs(Math.sin(t*1.3+s.ph)))*(1.1-s.z),r=s.s*(1.2-s.z)+.3;g.fillStyle=`rgba(${s.c},${a.toFixed(2)})`;g.fillRect(x,y,r,r)}
  const P=(r,a)=>{const ex=Math.cos(a)*r*RR,ey=Math.sin(a)*r*RR*INC;return[X+ex*CA-ey*SA,Y+ex*SA+ey*CA,Math.sin(a)]};
  const drawDisk=back=>{for(const p of disk){const [x,y,zz]=P(p.r,p.a);if(back?zz>0:zz<=0)continue;const dop=1+.65*Math.cos(p.a+Math.PI/2),heat=Math.max(0,1-(p.r-1.55)/2.6),al=Math.min(1,.18+.5*p.b*dop*(.4+heat));
    g.fillStyle=heat>.7?`rgba(255,236,200,${al.toFixed(2)})`:heat>.4?`rgba(255,196,107,${al.toFixed(2)})`:`rgba(251,146,60,${al.toFixed(2)})`;const s=p.s*(RR/90)*(1.3+.4*dop);g.fillRect(x-s/2,y-s/2,s,s)}};
  for(const p of disk)p.a+=p.w*dt*(1+dive*4);
  drawDisk(true);
  g.globalCompositeOperation='source-over';const hz=g.createRadialGradient(X,Y,RR*.2,X,Y,RR*1.04);hz.addColorStop(0,'#000');hz.addColorStop(.93,'#000');hz.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=hz;g.beginPath();g.arc(X,Y,RR*1.04,0,TAU);g.fill();
  g.strokeStyle=`rgba(120,240,228,${(.8+.15*Math.sin(t*2)).toFixed(2)})`;g.lineWidth=Math.max(1.5,RR*.035);g.beginPath();g.arc(X,Y,RR*1.07,0,TAU);g.stroke();
  g.globalCompositeOperation='lighter';drawDisk(false);
  if(dive>0)dive=Math.min(1,dive+dt*1.6);if(running)raf=requestAnimationFrame(frame)}
function start(){if(!W)size();dive=0;last=0;if(reduce){frame(performance.now());return}if(!running){running=true;raf=requestAnimationFrame(frame)}}
function stop(){running=false;cancelAnimationFrame(raf)}
let rt=0;window.addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(()=>{if(!cv.offsetParent&&!running)return;size();if(!running)frame(performance.now())},120)});
document.addEventListener('visibilitychange',()=>{if(document.hidden){if(running){stop();running='paused'}}else if(running==='paused'){running=false;start()}});
window.addEventListener('pointermove',e=>{if(e.pointerType!=='mouse'||!W)return;mx=e.clientX/W-.5;my=e.clientY/H-.5},{passive:true});
window.PhysicaLandingBG={start,stop,dive(){dive=.001},resize:size};
})();
