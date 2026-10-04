/* Landing backdrop: a black-and-white black hole in the style of Gargantua (Interstellar).
   A thin, almost edge-on accretion disk crosses in front of the shadow; light from the far
   side of the disk is lensed into a bright halo arching over the top and a fainter one under
   the bottom; a thin photon ring hugs the shadow. Pure black sky with sparse white stars.
   Glows are pre-rendered once per size and the particle count adapts to the device. */
(() => {
'use strict';
/* GPU path: a ray-traced Schwarzschild black hole. Every pixel follows a bent light ray past
   the hole, so the far side of the thin accretion disk is lensed over the top and under the
   bottom exactly as in Interstellar; Doppler beaming brightens the side that comes towards us.
   Black and white, rendered at a reduced resolution that adapts to the device. The 2D canvas
   version below is the fallback when WebGL is not available. */
const GL=(()=>{
const cv=document.getElementById('landing-bg');if(!cv)return null;
let gl=null;try{gl=cv.getContext('webgl',{antialias:false,alpha:false,depth:false,powerPreference:'high-performance',preserveDrawingBuffer:false})}catch{}
if(!gl)return null;
const reduce=!!(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches);
const weak=(navigator.hardwareConcurrency||4)<=4||Math.min(screen.width,screen.height)<500;
const VS='attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
const FS=`precision highp float;
uniform vec2 res;uniform float t,dist,fov,dive;uniform vec2 look;
#define STEPS ${weak?110:170}
float h21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h21(i),h21(i+vec2(1,0)),f.x),mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float a=.5,s=0.;for(int i=0;i<4;i++){s+=a*vn(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return s;}
float h31(vec3 p){p=fract(p*.1031);p+=dot(p,p.zyx+31.32);return fract((p.x+p.y)*p.z);}
vec3 sky(vec3 d){vec3 c=vec3(0.);
  for(int k=0;k<2;k++){float sc=k==0?38.:80.;vec3 g=d*sc,id=floor(g),f=fract(g)-.5;float h=h31(id+float(k)*17.);
    if(h>.93){vec3 o=vec3(h31(id+3.1),h31(id+7.7),h31(id+1.3))-.5;float r=length(f-o*.5);float b=(h-.93)/.07;c+=vec3(smoothstep(.13,0.,r)*b*(k==0?1.3:.8));}}
  return c;}
void main(){
  vec2 uv=(gl_FragCoord.xy-.5*res)/min(res.x,res.y);
  float inc=.105+look.y*.05,yaw=look.x*.12+dive*.6;
  vec3 cam=vec3(sin(yaw)*cos(inc),sin(inc),-cos(yaw)*cos(inc))*dist;
  vec3 fw=normalize(-cam),rt=normalize(cross(vec3(0,1,0),fw)),up=cross(fw,rt);
  float roll=-.09+dive*.5;vec2 ruv=mat2(cos(roll),-sin(roll),sin(roll),cos(roll))*uv;
  vec3 dir=normalize(fw+(ruv.x*rt+ruv.y*up)*fov);
  vec3 pos=cam,vel=dir;vec3 hc=cross(pos,vel);float h2=dot(hc,hc);
  vec3 col=vec3(0.);float alpha=0.,glow=0.;bool hit=false;
  for(int i=0;i<STEPS;i++){
    float r2=dot(pos,pos),r=sqrt(r2);
    if(r<1.){hit=true;break;}
    float dt=clamp(.075*r,.04,1.1);
    vec3 op=pos;vel+=-1.5*h2*pos/(r2*r2*r)*dt;pos+=vel*dt;
    glow+=dt*.006/(r2*.35+.04);
    if(op.y*pos.y<0.){float f=op.y/(op.y-pos.y);vec3 q=mix(op,pos,f);float rr=length(q.xz);
      if(rr>2.6&&rr<13.){float ang=atan(q.z,q.x);float om=pow(rr,-1.5)*1.6;
        float tex=fbm(vec2(rr*3.2,(ang+t*om)*5.))*.75+fbm(vec2(rr*11.,(ang+t*om)*13.))*.45;
        float prof=pow(3./rr,2.3)*smoothstep(2.6,3.4,rr)*smoothstep(13.,8.,rr);
        float v=sqrt(.5/(rr-1.));vec3 vd=normalize(vec3(-q.z,0.,q.x))*v;float gam=1./sqrt(1.-v*v);
        float dop=1./(gam*(1.+dot(vd,normalize(vel))));dop=clamp(dop,.25,2.4);
        float I=prof*tex*pow(dop,3.)*sqrt(1.-1./rr)*2.6;
        float a=clamp(.55+.45*tex,0.,1.)*(1.-alpha)*smoothstep(13.,9.,rr);
        col+=vec3(I)*a;alpha+=a*.92;if(alpha>.98)break;}}
    if(r>dist*1.6&&dot(pos,vel)>0.)break;}
  if(!hit)col+=sky(normalize(vel))*(1.-alpha);
  col+=vec3(glow*.55)*(1.-alpha*.6);
  col=1.-exp(-col*1.25);
  float vg=smoothstep(1.25,.25,length(uv));col*=mix(.55,1.,vg);
  col*=1.-smoothstep(.8,1.,dive);
  gl_FragColor=vec4(col,1.);}`;
const sh=(type,src)=>{const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);return gl.getShaderParameter(s,gl.COMPILE_STATUS)?s:null};
const v=sh(gl.VERTEX_SHADER,VS),f=sh(gl.FRAGMENT_SHADER,FS);if(!v||!f)return null;
const pr=gl.createProgram();gl.attachShader(pr,v);gl.attachShader(pr,f);gl.linkProgram(pr);if(!gl.getProgramParameter(pr,gl.LINK_STATUS))return null;
gl.useProgram(pr);const buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
const loc=gl.getAttribLocation(pr,'p');gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
const U={};for(const n of['res','t','dist','fov','dive','look'])U[n]=gl.getUniformLocation(pr,n);
let scale=weak?.5:.72,W=0,H=0,raf=0,running=false,dv=0,last=0,slow=0,frames=0,mx=0,my=0,tx=0,ty=0,t0=performance.now();
function size(){W=cv.clientWidth||innerWidth;H=cv.clientHeight||innerHeight;const k=Math.min(1.5,window.devicePixelRatio||1)*scale;cv.width=Math.max(2,Math.round(W*k));cv.height=Math.max(2,Math.round(H*k));gl.viewport(0,0,cv.width,cv.height)}
function draw(now){const dt=Math.min(.05,last?(now-last)/1000:.016);last=now;
  if(dv>0)dv=Math.min(1,dv+dt*.95);tx+=(mx-tx)*.04;ty+=(my-ty)*.04;
  const e=dv*dv*(3-2*dv),narrow=W<H;
  gl.uniform2f(U.res,cv.width,cv.height);gl.uniform1f(U.t,(now-t0)/1000);gl.uniform1f(U.dist,(narrow?20:27)*(1-e*.93));
  gl.uniform1f(U.fov,.62*(1+e*1.6));gl.uniform1f(U.dive,e);gl.uniform2f(U.look,tx,ty);
  gl.drawArrays(gl.TRIANGLES,0,3);
  // keep it smooth: drop the resolution on devices that cannot hold ~50 fps
  if(running&&!dv){frames++;if(dt>.024)slow++;if(frames>=40){if(slow>14&&scale>.3){scale=Math.max(.3,scale-.12);size()}frames=slow=0}}
  if(running)raf=requestAnimationFrame(draw)}
function start(){size();dv=0;last=0;if(reduce){draw(performance.now());return}if(!running){running=true;raf=requestAnimationFrame(draw)}}
function stop(){running=false;cancelAnimationFrame(raf)}
let rt=0;addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(()=>{if(!W)return;size();if(!running)draw(performance.now())},120)});
document.addEventListener('visibilitychange',()=>{if(document.hidden){if(running){stop();running='paused'}}else if(running==='paused'){running=false;start()}});
addEventListener('pointermove',e=>{if(e.pointerType!=='mouse'||!W)return;mx=e.clientX/W-.5;my=e.clientY/H-.5},{passive:true});
cv.addEventListener('webglcontextlost',e=>{e.preventDefault();stop()});
return{start,stop,dive(){dv=.001},resize:size};
})();
if(GL){window.PhysicaLandingBG=GL;return}
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
