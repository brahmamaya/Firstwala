/* Landing backdrop: the Physica logo as a black hole. The mint circle of the logo is the
   photon ring, its tilted gold orbit is a spinning accretion disk (Doppler-brightened on the
   approaching side, lensed over the top), set in a drifting, lensed star field. */
(() => {
'use strict';
const cv=document.getElementById('landing-bg');if(!cv)return;
const hole=document.querySelector('.landing-hole'),g=cv.getContext('2d'),TAU=Math.PI*2,reduce=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
let W=0,H=0,dpr=1,raf=0,t0=performance.now(),dive=0,mx=0,my=0,tx=0,ty=0;
const rnd=(a,b)=>a+Math.random()*(b-a);
const stars=Array.from({length:420},()=>({x:rnd(-1,1),y:rnd(-1,1),z:rnd(.15,1),s:rnd(.4,1.6),ph:rnd(0,TAU),hue:Math.random()<.15?'255,214,170':Math.random()<.2?'170,210,255':'255,255,255'}));
// Disk particles: radius in units of the horizon radius, angle, size.
const disk=Array.from({length:1700},()=>{const r=1.55+Math.pow(Math.random(),1.7)*2.6;return{r,a:rnd(0,TAU),s:rnd(.6,1.9)*(1.2-r/5),b:rnd(.55,1)}});
function size(){dpr=Math.min(2,window.devicePixelRatio||1);W=cv.clientWidth;H=cv.clientHeight;cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);g.setTransform(dpr,0,0,dpr,0,0)}
function frame(now){const t=(now-t0)/1000;tx+=(mx-tx)*.05;ty+=(my-ty)*.05;
  const hb=hole?.getBoundingClientRect(),hc=hb&&hb.height?hb.top+hb.height/2:H*.4,cx=W/2+tx*18,cy=hc+ty*12,R=Math.min(hb&&hb.height?hb.height*.24:H*.12,W*.11)*(1+dive*dive*6),tilt=-25*Math.PI/180,inc=.3+ty*.03,ca=Math.cos(tilt),sa=Math.sin(tilt);
  g.globalCompositeOperation='source-over';const bg=g.createRadialGradient(cx,cy,R,cx,cy,Math.max(W,H)*.9);bg.addColorStop(0,'#0b1a2c');bg.addColorStop(.5,'#060d18');bg.addColorStop(1,'#020509');g.fillStyle=bg;g.fillRect(0,0,W,H);
  // nebula haze
  g.globalCompositeOperation='lighter';for(const [x,y,r,c] of[[.18,.25,.45,'66,217,202'],[.85,.7,.5,'167,139,250'],[.7,.15,.35,'251,146,60']]){const n=g.createRadialGradient(W*x,H*y,0,W*x,H*y,Math.max(W,H)*r);n.addColorStop(0,`rgba(${c},.07)`);n.addColorStop(1,`rgba(${c},0)`);g.fillStyle=n;g.fillRect(0,0,W,H)}
  // stars drift outward (slow flight towards the hole) and are lensed around it
  const sp=.012+dive*.4;for(const s of stars){if(!reduce){s.z-=sp*(1/60)*(1+dive*20);if(s.z<.08){s.z=1;s.x=rnd(-1,1);s.y=rnd(-1,1)}}
    let x=cx+s.x/s.z*W*.35-tx*30*(1-s.z),y=cy+s.y/s.z*H*.35-ty*20*(1-s.z),dx=x-cx,dy=y-cy,d=Math.hypot(dx,dy)||1;if(d<R*1.02)continue;const k=1+(R*R*1.6)/(d*d);x=cx+dx*k;y=cy+dy*k;
    const a=(.35+.65*Math.abs(Math.sin(t*1.3+s.ph)))*(1.1-s.z),r=s.s*(1.2-s.z)+.2;g.fillStyle=`rgba(${s.hue},${a.toFixed(3)})`;g.fillRect(x,y,r,r)}
  // disk geometry: orbit ellipse rotated like the logo's gold ring
  const P=(r,a)=>{const ex=Math.cos(a)*r*R,ey=Math.sin(a)*r*R*inc;return[cx+ex*ca-ey*sa,cy+ex*sa+ey*ca,Math.sin(a)]};
  const drawDisk=back=>{for(const p of disk){if(!reduce)p.a+=.55/Math.pow(p.r,1.5)/60*(1+dive*4);const [x,y,z]=P(p.r,p.a);if(back?z>0:z<=0)continue;
    const dop=1+.65*Math.cos(p.a+Math.PI/2)*(1),heat=Math.max(0,1-(p.r-1.55)/2.6),al=Math.min(1,.18+.5*p.b*dop*(.4+heat));
    const col=heat>.7?'255,236,200':heat>.4?'255,196,107':'251,146,60';g.fillStyle=`rgba(${col},${al.toFixed(3)})`;const s=p.s*(R/90)*(1.3+.4*dop);g.fillRect(x-s/2,y-s/2,s,s)}};
  // soft disk glow under the particles
  const glow=back=>{g.save();g.translate(cx,cy);g.rotate(tilt);g.scale(1,inc);g.beginPath();g.ellipse(0,0,R*4.1,R*4.1,0,back?Math.PI:0,back?TAU:Math.PI);g.ellipse(0,0,R*1.45,R*1.45,0,back?TAU:Math.PI,back?Math.PI:0,true);const gg=g.createRadialGradient(0,0,R*1.4,0,0,R*4.1);gg.addColorStop(0,'rgba(255,214,150,.30)');gg.addColorStop(.35,'rgba(255,170,80,.14)');gg.addColorStop(1,'rgba(251,146,60,0)');g.fillStyle=gg;g.fill();g.restore()};
  glow(true);drawDisk(true);
  // lensed image of the far side of the disk, bent over and under the hole
  g.save();g.translate(cx,cy);g.rotate(tilt);for(const [rr,al] of[[1.32,.55],[1.5,.28],[1.75,.12]]){g.beginPath();g.ellipse(0,0,R*rr,R*rr*.92,0,0,TAU);g.strokeStyle=`rgba(255,200,120,${al})`;g.lineWidth=R*.07;g.shadowColor='rgba(255,170,80,.8)';g.shadowBlur=R*.35;g.stroke()}g.restore();
  // event horizon and the mint photon ring (the logo's circle)
  g.globalCompositeOperation='source-over';const hz=g.createRadialGradient(cx,cy,R*.2,cx,cy,R*1.06);hz.addColorStop(0,'#000');hz.addColorStop(.92,'#000');hz.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=hz;g.beginPath();g.arc(cx,cy,R*1.06,0,TAU);g.fill();
  g.globalCompositeOperation='lighter';g.save();g.shadowColor='rgba(66,217,202,.9)';g.shadowBlur=R*.45;g.strokeStyle=`rgba(66,217,202,${.75+.15*Math.sin(t*2)})`;g.lineWidth=Math.max(2,R*.05);g.beginPath();g.arc(cx,cy,R*1.08,0,TAU);g.stroke();g.restore();
  glow(false);drawDisk(false);
  // vignette
  g.globalCompositeOperation='source-over';const v=g.createRadialGradient(W/2,H/2,Math.min(W,H)*.35,W/2,H/2,Math.max(W,H)*.75);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.6)');g.fillStyle=v;g.fillRect(0,0,W,H);
  if(dive>0)dive=Math.min(1,dive+.025);if(!reduce)raf=requestAnimationFrame(frame)}
function start(){cancelAnimationFrame(raf);dive=0;size();raf=requestAnimationFrame(frame)}
function stop(){cancelAnimationFrame(raf);raf=0}
window.addEventListener('resize',()=>{if(raf||reduce){size();if(reduce)frame(performance.now())}});
window.addEventListener('pointermove',e=>{if(!W)return;mx=e.clientX/W-.5;my=e.clientY/H-.5},{passive:true});
window.PhysicaLandingBG={start,stop,dive(){dive=.001}};
})();
