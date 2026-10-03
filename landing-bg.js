/* Landing backdrop: a black-and-white black hole in the style of Gargantua (Interstellar).
   A thin, almost edge-on accretion disk crosses in front of the shadow; light from the far
   side of the disk is lensed into a bright halo arching over the top and a fainter one under
   the bottom; a thin photon ring hugs the shadow. Pure black sky with sparse white stars.
   Glows are pre-rendered once per size and the particle count adapts to the device. */
(() => {
'use strict';
const cv=document.getElementById('landing-bg');if(!cv||!cv.getContext)return;
const g=cv.getContext('2d'),TAU=Math.PI*2,reduce=!!(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches);
const weak=(navigator.hardwareConcurrency||4)<=4||Math.min(screen.width,screen.height)<500;
let W=0,H=0,dpr=1,raf=0,running=false,last=0,dive=0,mx=0,my=0,tx=0,ty=0,glowC=null,cx=0,cy=0,R=0;
const rnd=(a,b)=>a+Math.random()*(b-a);
const stars=Array.from({length:weak?160:300},()=>({x:rnd(-1,1),y:rnd(-1,1),z:rnd(.15,1),s:rnd(.5,1.5),ph:rnd(0,TAU)}));
const disk=Array.from({length:weak?900:1800},()=>{const r=1.5+Math.pow(Math.random(),1.5)*3.2;return{r,a:rnd(0,TAU),s:rnd(.6,1.6),b:rnd(.5,1),w:.5/Math.pow(r,1.5)}});
const TILT=-5*Math.PI/180,CA=Math.cos(TILT),SA=Math.sin(TILT),INC=.085;
function geom(){const small=W<640;cx=W/2;cy=H*(small?.47:.5);R=Math.min(W*(small?.2:.13),H*.17)}
// Smooth disk band (annulus seen nearly edge-on); half='back' (upper, behind the shadow) or 'front'.
function band(b,half){b.save();b.translate(cx,cy);b.rotate(TILT);b.beginPath();b.rect(-W,half==='back'?-H:0,2*W,H);b.clip();b.scale(1,INC*1.15);
  const gr=b.createRadialGradient(0,0,R*1.45,0,0,R*5.2);gr.addColorStop(0,'rgba(255,255,255,0)');gr.addColorStop(.04,'rgba(255,255,255,.95)');gr.addColorStop(.18,'rgba(255,255,255,.55)');gr.addColorStop(.5,'rgba(255,255,255,.16)');gr.addColorStop(1,'rgba(255,255,255,0)');
  b.fillStyle=gr;b.beginPath();b.arc(0,0,R*5.2,0,TAU);b.arc(0,0,R*1.42,0,TAU,true);b.fill();b.restore()}
let frontC=null;
function bake(){glowC=document.createElement('canvas');glowC.width=cv.width;glowC.height=cv.height;const b=glowC.getContext('2d');b.setTransform(dpr,0,0,dpr,0,0);
  b.fillStyle='#000';b.fillRect(0,0,W,H);
  const bl=b.createRadialGradient(cx,cy,R*.9,cx,cy,R*4.5);bl.addColorStop(0,'rgba(255,255,255,.14)');bl.addColorStop(.3,'rgba(255,255,255,.045)');bl.addColorStop(1,'rgba(255,255,255,0)');b.fillStyle=bl;b.fillRect(0,0,W,H);
  b.globalCompositeOperation='lighter';band(b,'back');
  // lensed image of the far disk: a bright, thin halo over the top and a faint one underneath
  b.save();b.translate(cx,cy);b.rotate(TILT);b.shadowColor='rgba(255,255,255,1)';
  b.shadowBlur=R*.5;b.lineWidth=R*.05;b.strokeStyle='rgba(255,255,255,.95)';b.beginPath();b.ellipse(0,0,R*1.2,R*1.17,0,Math.PI*1.02,Math.PI*1.98);b.stroke();
  b.shadowBlur=R*1.1;b.lineWidth=R*.12;b.strokeStyle='rgba(255,255,255,.1)';b.beginPath();b.ellipse(0,0,R*1.3,R*1.26,0,Math.PI*1.04,Math.PI*1.96);b.stroke();
  b.shadowBlur=R*.3;b.lineWidth=R*.02;b.strokeStyle='rgba(255,255,255,.45)';b.beginPath();b.ellipse(0,0,R*1.12,R*1.06,0,Math.PI*.06,Math.PI*.94);b.stroke();b.restore();
  b.globalCompositeOperation='source-over';const v=b.createRadialGradient(W/2,H/2,Math.min(W,H)*.4,W/2,H/2,Math.max(W,H)*.8);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.7)');b.fillStyle=v;b.fillRect(0,0,W,H);
  frontC=document.createElement('canvas');frontC.width=cv.width;frontC.height=cv.height;const f=frontC.getContext('2d');f.setTransform(dpr,0,0,dpr,0,0);band(f,'front')}
function size(){dpr=Math.min(weak?1.25:1.75,window.devicePixelRatio||1);W=cv.clientWidth||window.innerWidth;H=cv.clientHeight||window.innerHeight;cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);g.setTransform(dpr,0,0,dpr,0,0);geom();bake()}
function frame(now){const dt=Math.min(.05,last?(now-last)/1000:.016);last=now;tx+=(mx-tx)*.05;ty+=(my-ty)*.05;
  const ox=tx*14,oy=ty*8,z=1+dive*dive*6,X=cx+ox,Y=cy+oy,RR=R*z,t=now/1000;
  g.setTransform(1,0,0,1,0,0);g.globalCompositeOperation='source-over';g.fillStyle='#000';g.fillRect(0,0,cv.width,cv.height);
  if(dive>0){g.setTransform(z,0,0,z,X*dpr*(1-z),Y*dpr*(1-z));g.drawImage(glowC,0,0)}else g.drawImage(glowC,ox*dpr,oy*dpr);
  g.setTransform(dpr,0,0,dpr,0,0);g.globalCompositeOperation='lighter';
  const sp=(.01+dive*.5)*dt*(1+dive*20);
  for(const s of stars){s.z-=sp;if(s.z<.08){s.z=1;s.x=rnd(-1,1);s.y=rnd(-1,1)}let x=X+s.x/s.z*W*.35,y=Y+s.y/s.z*H*.35,dx=x-X,dy=y-Y,d=Math.hypot(dx,dy)||1;if(d<RR*1.1)continue;const k=1+(RR*RR*1.8)/(d*d);x=X+dx*k;y=Y+dy*k;
    const a=(.3+.7*Math.abs(Math.sin(t*1.1+s.ph)))*(1.05-s.z);g.fillStyle=`rgba(255,255,255,${a.toFixed(2)})`;const r=s.s*(1.2-s.z)+.3;g.fillRect(x,y,r,r)}
  for(const p of disk)p.a+=p.w*dt*(1+dive*4);
  const rot=(ex,ey)=>[X+ex*CA-ey*SA,Y+ex*SA+ey*CA];
  // far side of the disk (behind the shadow) and its lensed image over the top / under the bottom
  for(const p of disk){const ca=Math.cos(p.a),sa=Math.sin(p.a),dop=1+.45*ca,heat=Math.max(0,1-(p.r-1.5)/3.2),al=Math.min(1,(.15+.55*p.b*(.35+heat))*dop),s=p.s*(RR/110)*(1+heat);
    if(sa>0){const [x,y]=rot(ca*p.r*RR,-sa*p.r*RR*INC);g.fillStyle=`rgba(255,255,255,${(al*.8).toFixed(2)})`;g.fillRect(x-s/2,y-s/2,s,s);
      const hr=RR*(1.16+.11*(p.r-1.5)),[hx,hy]=rot(ca*hr,-sa*hr*.97);g.fillStyle=`rgba(255,255,255,${(al*.55).toFixed(2)})`;g.fillRect(hx-s/2,hy-s/2,s,s)}
    else{const hr=RR*(1.12+.06*(p.r-1.5)),[hx,hy]=rot(ca*hr,-sa*hr*.9);g.fillStyle=`rgba(255,255,255,${(al*.18).toFixed(2)})`;g.fillRect(hx-s/3,hy-s/3,s*.66,s*.66)}}
  // shadow and photon ring
  g.globalCompositeOperation='source-over';g.fillStyle='#000';g.beginPath();g.arc(X,Y,RR,0,TAU);g.fill();
  g.globalCompositeOperation='lighter';g.strokeStyle=`rgba(255,255,255,${(.85+.1*Math.sin(t*1.7)).toFixed(2)})`;g.lineWidth=Math.max(1,RR*.018);g.beginPath();g.arc(X,Y,RR*1.035,0,TAU);g.stroke();
  g.setTransform(1,0,0,1,0,0);if(dive>0){g.setTransform(z,0,0,z,X*dpr*(1-z),Y*dpr*(1-z));g.drawImage(frontC,0,0)}else g.drawImage(frontC,ox*dpr,oy*dpr);g.setTransform(dpr,0,0,dpr,0,0);
  // near side of the disk, crossing in front of the shadow
  for(const p of disk){const sa=Math.sin(p.a);if(sa>0)continue;const ca=Math.cos(p.a),dop=1+.45*ca,heat=Math.max(0,1-(p.r-1.5)/3.2),al=Math.min(1,(.2+.6*p.b*(.35+heat))*dop),s=p.s*(RR/110)*(1+heat),[x,y]=rot(ca*p.r*RR,-sa*p.r*RR*INC);
    g.fillStyle=`rgba(255,255,255,${al.toFixed(2)})`;g.fillRect(x-s/2,y-s/2,s,s)}
  if(dive>0)dive=Math.min(1,dive+dt*1.6);if(running)raf=requestAnimationFrame(frame)}
function start(){if(!W)size();dive=0;last=0;if(reduce){frame(performance.now());return}if(!running){running=true;raf=requestAnimationFrame(frame)}}
function stop(){running=false;cancelAnimationFrame(raf)}
let rt=0;window.addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(()=>{if(!running&&!W)return;size();if(!running)frame(performance.now())},120)});
document.addEventListener('visibilitychange',()=>{if(document.hidden){if(running){stop();running='paused'}}else if(running==='paused'){running=false;start()}});
window.addEventListener('pointermove',e=>{if(e.pointerType!=='mouse'||!W)return;mx=e.clientX/W-.5;my=e.clientY/H-.5},{passive:true});
window.PhysicaLandingBG={start,stop,dive(){dive=.001},resize:size};
})();
