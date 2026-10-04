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
   Black and white with bloom, film grain and a faint Milky Way; the scene renders at a reduced resolution that adapts to the device. The 2D canvas
   version below is the fallback when WebGL is not available. */
const GL=(()=>{
const cv=document.getElementById('landing-bg');if(!cv)return null;
let gl=null;try{gl=cv.getContext('webgl',{antialias:false,alpha:false,depth:false,stencil:false,powerPreference:'high-performance',preserveDrawingBuffer:false})}catch{}
if(!gl)return null;
const reduce=!!(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches);
const weak=(navigator.hardwareConcurrency||4)<=4||Math.min(screen.width,screen.height)<500;
const VS='attribute vec2 p;varying vec2 v;void main(){v=p*.5+.5;gl_Position=vec4(p,0.,1.);}';
// 1) the scene: every pixel follows a bent light ray past the hole (Schwarzschild, leapfrog steps)
const SCENE=`precision highp float;varying vec2 v;
uniform vec2 res,jit,shift;uniform float t,dist,fov,yaw,inc,roll;
#define STEPS ${weak?120:190}
float h21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float h31(vec3 p){p=fract(p*.1031);p+=dot(p,p.zyx+31.32);return fract((p.x+p.y)*p.z);}
float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h21(i),h21(i+vec2(1,0)),f.x),mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x),f.y);}
float vn3(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
  return mix(mix(mix(h31(i),h31(i+vec3(1,0,0)),f.x),mix(h31(i+vec3(0,1,0)),h31(i+vec3(1,1,0)),f.x),f.y),mix(mix(h31(i+vec3(0,0,1)),h31(i+vec3(1,0,1)),f.x),mix(h31(i+vec3(0,1,1)),h31(i+vec3(1,1,1)),f.x),f.y),f.z);}
float fbm(vec2 p){float a=.5,s=0.;for(int i=0;i<5;i++){s+=a*vn(p);p=p*2.07+vec2(1.7,9.2);a*=.5;}return s;}
vec3 sky(vec3 d){vec3 c=vec3(0.);
  // faint Milky Way band with dust lanes
  vec3 n=normalize(vec3(.9,.35,.5));float b=dot(d,n);float band=exp(-b*b*14.);
  float cl=vn3(d*3.)*.6+vn3(d*7.)*.3+vn3(d*15.)*.15;float dust=smoothstep(.45,.75,vn3(d*5.+7.));
  c+=vec3(band*cl*cl*.07*(1.-dust*.7));
  for(int k=0;k<3;k++){float sc=k==0?34.:k==1?70.:140.;vec3 g=d*sc,id=floor(g),f=fract(g)-.5;float h=h31(id+float(k)*17.);
    float th=k==2?.9:.94;if(h>th){vec3 o=vec3(h31(id+3.1),h31(id+7.7),h31(id+1.3))-.5;float r=length(f-o*.5);float br=(h-th)/(1.-th);
      c+=vec3(smoothstep(.14,0.,r)*br*(k==0?1.6:k==1?.9:.5+band*.6));}}
  return c;}
void main(){
  vec2 uv=(gl_FragCoord.xy+jit-.5*res)/min(res.x,res.y)-shift;
  float yw=yaw,ic=inc;
  vec3 cam=vec3(sin(yw)*cos(ic),sin(ic),-cos(yw)*cos(ic))*dist;
  vec3 fw=normalize(-cam),rt=normalize(cross(vec3(0,1,0),fw)),up=cross(fw,rt);
  vec2 ruv=mat2(cos(roll),-sin(roll),sin(roll),cos(roll))*uv;
  vec3 dir=normalize(fw+(ruv.x*rt+ruv.y*up)*fov);
  vec3 pos=cam,vel=dir;vec3 hc=cross(pos,vel);float h2=dot(hc,hc);
  vec3 col=vec3(0.);float alpha=0.,glow=0.;bool hit=false;
  for(int i=0;i<STEPS;i++){
    float r2=dot(pos,pos),r=sqrt(r2);
    if(r<1.){hit=true;break;}
    float dt=clamp(.065*r,.03,1.2);
    vec3 op=pos;vel+=-1.5*h2*pos/(r2*r2*r)*dt;pos+=vel*dt;
    glow+=dt*.05*exp(-r*1.1);
    if(op.y*pos.y<0.){float f=op.y/(op.y-pos.y);vec3 q=mix(op,pos,f);float rr=length(q.xz);
      if(rr>2.6&&rr<14.){float ang=atan(q.z,q.x);float om=pow(rr,-1.5)*1.7;float a2=ang+t*om;
        // orbit-stretched turbulence: long streaks along the flow plus fine filaments
        float tex=fbm(vec2(rr*3.4,a2*4.))*.7+fbm(vec2(rr*12.,a2*14.))*.45+fbm(vec2(rr*30.,a2*2.))*.25;
        tex*=.75+.5*vn(vec2(rr*.9,a2*1.5));
        float prof=pow(3./rr,2.4)*smoothstep(2.6,3.3,rr)*smoothstep(14.,8.,rr);
        float vv=sqrt(.5/(rr-1.));vec3 vd=normalize(vec3(-q.z,0.,q.x))*vv;float gam=1./sqrt(1.-vv*vv);
        float dop=clamp(1./(gam*(1.+dot(vd,normalize(vel)))),.2,2.6);
        float I=prof*tex*pow(dop,3.2)*sqrt(1.-1./rr)*3.;
        float a=clamp(.5+.5*tex,0.,1.)*(1.-alpha)*smoothstep(14.,9.,rr);
        col+=vec3(I)*a;alpha+=a*.93;if(alpha>.985)break;}}
    if(r>dist*1.7&&dot(pos,vel)>0.)break;}
  if(!hit)col+=sky(normalize(vel))*(1.-alpha);
  col+=vec3(glow*.5)*(1.-alpha*.6);
  gl_FragColor=vec4(1.-exp(-col*1.3),1.);}`;
// temporal anti-aliasing: each frame is jittered by a sub-pixel and blended with the history
const ACC=`precision mediump float;varying vec2 v;uniform sampler2D s,h;uniform float k;void main(){gl_FragColor=vec4(mix(texture2D(h,v).rgb,texture2D(s,v).rgb,k),1.);}`;
// 2) bloom: bright-pass/downsample and a separable blur at quarter resolution
const DOWN=`precision mediump float;varying vec2 v;uniform sampler2D s;uniform vec2 px;
void main(){vec3 c=vec3(0.);for(int x=-1;x<=1;x++)for(int y=-1;y<=1;y++)c+=texture2D(s,v+vec2(x,y)*px).rgb;c/=9.;float l=dot(c,vec3(.333));gl_FragColor=vec4(c*smoothstep(.3,.9,l),1.);}`;
const BLUR=`precision mediump float;varying vec2 v;uniform sampler2D s;uniform vec2 dir;
void main(){vec3 c=texture2D(s,v).rgb*.227;c+=texture2D(s,v+dir*1.385).rgb*.316;c+=texture2D(s,v-dir*1.385).rgb*.316;c+=texture2D(s,v+dir*3.231).rgb*.07;c+=texture2D(s,v-dir*3.231).rgb*.07;gl_FragColor=vec4(c,1.);}`;
// 3) final: bloom, radial motion blur while falling, edge colour fringes, flash, grain, vignette
const COMP=`precision mediump float;varying vec2 v;uniform sampler2D s,b;uniform float t,warp,flash,fade;uniform vec2 res;
float h(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
void main(){vec2 d=v-.5;vec3 c=vec3(0.);
  if(warp>.002){for(int i=0;i<10;i++){float k=1.-warp*float(i)/9.*.12;c+=texture2D(s,.5+d*k).rgb;}c/=10.;}else c=texture2D(s,v).rgb;
  float ca=(.0008+warp*.003)*length(d)*2.;c.r=mix(c.r,texture2D(s,.5+d*(1.+ca)).r,.6);c.b=mix(c.b,texture2D(s,.5+d*(1.-ca)).b,.6);
  c+=texture2D(b,v).rgb*.75;
  c*=mix(.45,1.,smoothstep(.95,.2,length(d*vec2(res.x/res.y,1.))));
  c+=(h(v*res+t)-.5)*.04*smoothstep(.02,.35,dot(c,vec3(.333)));c=max(c,0.);
  c=mix(c,vec3(1.),flash);c*=fade;
  gl_FragColor=vec4(c,1.);}`;
const sh=(type,src)=>{const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);return gl.getShaderParameter(s,gl.COMPILE_STATUS)?s:null};
const vs=sh(gl.VERTEX_SHADER,VS);if(!vs)return null;
const prog=(src,names)=>{const f=sh(gl.FRAGMENT_SHADER,src);if(!f)return null;const p=gl.createProgram();gl.attachShader(p,vs);gl.attachShader(p,f);gl.bindAttribLocation(p,0,'p');gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))return null;const u={};for(const n of names)u[n]=gl.getUniformLocation(p,n);return{p,u}};
const P1=prog(SCENE,['res','jit','shift','t','dist','fov','yaw','inc','roll']),P5=prog(ACC,['s','h','k']),P2=prog(DOWN,['s','px']),P3=prog(BLUR,['s','dir']),P4=prog(COMP,['s','b','t','warp','flash','fade','res']);
if(!P1||!P2||!P3||!P4||!P5)return null;
const buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);
const target=(w,h)=>{const tx=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,tx);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,w,h,0,gl.RGBA,gl.UNSIGNED_BYTE,null);
  for(const [k,val] of [[gl.TEXTURE_MIN_FILTER,gl.LINEAR],[gl.TEXTURE_MAG_FILTER,gl.LINEAR],[gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE],[gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE]])gl.texParameteri(gl.TEXTURE_2D,k,val);
  const fb=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,fb);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,tx,0);return{tx,fb,w,h}};
let A=null,B1=null,B2=null,H0=null,H1=null,sceneW=0,sceneH=0,fresh=true,shiftX=0,shiftY=0,diveT=0,frameN=0;
let scale=weak?.6:.85,W=0,H=0,raf=0,running=false,dv=0,last=0,slow=0,frames=0,mx=0,my=0,tx=0,ty=0,t0=performance.now();
const free=o=>{if(o){gl.deleteTexture(o.tx);gl.deleteFramebuffer(o.fb)}};
function size(){W=cv.clientWidth||innerWidth;H=cv.clientHeight||innerHeight;const k=Math.min(1.5,window.devicePixelRatio||1);
  cv.width=Math.max(2,Math.round(W*k));cv.height=Math.max(2,Math.round(H*k));
  sceneW=Math.max(2,Math.round(W*k*scale));sceneH=Math.max(2,Math.round(H*k*scale));
  free(A);free(B1);free(B2);free(H0);free(H1);A=target(sceneW,sceneH);H0=target(sceneW,sceneH);H1=target(sceneW,sceneH);fresh=true;const bw=Math.max(2,sceneW>>2),bh=Math.max(2,sceneH>>2);B1=target(bw,bh);B2=target(bw,bh);gl.bindFramebuffer(gl.FRAMEBUFFER,null)}
const pass=(P,o)=>{gl.bindFramebuffer(gl.FRAMEBUFFER,o?o.fb:null);gl.viewport(0,0,o?o.w:cv.width,o?o.h:cv.height);gl.useProgram(P.p)};
const ease=x=>x*x*x*(x*(x*6-15)+10);
function draw(now){const dt=Math.min(.1,last?(now-last)/1000:.016);last=now;
  // the fall runs on the clock, not on frames, so it lasts 1.45 s on every device
  if(dv>0)dv=Math.max(.001,Math.min(1,(now-diveT)/1450));
  const e=dv,fall=Math.pow(Math.min(1,e/.88),2.2),narrow=W<H,T=(now-t0)/1000;frameN++;
  const still=e===0,ji=frameN%8,jx=still?(((ji*5)%8)/8-.4375):0,jy=still?(((ji*3)%8)/8-.4375):0;
  pass(P1,A);const u=P1.u;gl.uniform2f(u.res,sceneW,sceneH);gl.uniform2f(u.jit,jx,jy);gl.uniform2f(u.shift,0,0);gl.uniform1f(u.t,T);
  gl.uniform1f(u.dist,(narrow?20:27)*(1-.94*fall));gl.uniform1f(u.fov,.62*(1+.7*fall*fall));
  gl.uniform1f(u.yaw,2.3*ease(e));gl.uniform1f(u.inc,.105+.24*Math.sin(Math.PI*Math.min(1,e*1.15)));gl.uniform1f(u.roll,.7*fall);
  gl.drawArrays(gl.TRIANGLES,0,3);gl.activeTexture(gl.TEXTURE0);
  // blend with the history (anti-aliasing while still; straight through while falling)
  pass(P5,H1);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,A.tx);gl.uniform1i(P5.u.s,0);gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,H0.tx);gl.uniform1i(P5.u.h,1);
  gl.uniform1f(P5.u.k,fresh||!still?1:.2);gl.drawArrays(gl.TRIANGLES,0,3);fresh=false;const S=H1;H1=H0;H0=S;gl.activeTexture(gl.TEXTURE0);
  pass(P2,B1);gl.bindTexture(gl.TEXTURE_2D,H0.tx);gl.uniform1i(P2.u.s,0);gl.uniform2f(P2.u.px,1/sceneW,1/sceneH);gl.drawArrays(gl.TRIANGLES,0,3);
  for(let i=0;i<2;i++){pass(P3,B2);gl.bindTexture(gl.TEXTURE_2D,B1.tx);gl.uniform1i(P3.u.s,0);gl.uniform2f(P3.u.dir,(1+i)/B1.w,0);gl.drawArrays(gl.TRIANGLES,0,3);
    pass(P3,B1);gl.bindTexture(gl.TEXTURE_2D,B2.tx);gl.uniform1i(P3.u.s,0);gl.uniform2f(P3.u.dir,0,(1+i)/B1.h);gl.drawArrays(gl.TRIANGLES,0,3)}
  pass(P4,null);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,H0.tx);gl.uniform1i(P4.u.s,0);gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,B1.tx);gl.uniform1i(P4.u.b,1);
  const flash=e>.88?Math.min(1,(e-.88)/.04)*(1-Math.min(1,Math.max(0,(e-.93)/.07))):0;
  gl.uniform1f(P4.u.t,T%10);gl.uniform1f(P4.u.warp,e<.9?fall:0.);gl.uniform1f(P4.u.flash,flash);gl.uniform1f(P4.u.fade,Math.min(1,T*1.2));gl.uniform2f(P4.u.res,cv.width,cv.height);
  gl.drawArrays(gl.TRIANGLES,0,3);gl.activeTexture(gl.TEXTURE0);
  // keep it smooth: drop the resolution on devices that cannot hold ~50 fps (checked only while idle)
  if(running&&still){frames++;if(dt>.024)slow++;if(frames>=40){if(slow>14&&scale>.35){scale=Math.max(.35,scale-.12);size()}frames=slow=0}}
  if(running)raf=requestAnimationFrame(draw)}
function start(){size();dv=0;last=0;t0=performance.now();if(reduce){t0-=1e4;draw(performance.now());return}if(!running){running=true;raf=requestAnimationFrame(draw)}}
function stop(){running=false;cancelAnimationFrame(raf)}
let rt=0;addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(()=>{if(!W)return;size();if(!running)draw(performance.now())},120)});
document.addEventListener('visibilitychange',()=>{if(document.hidden){if(running){stop();running='paused'}}else if(running==='paused'){running=false;raf=requestAnimationFrame(draw);running=true}});
cv.addEventListener('webglcontextlost',e=>{e.preventDefault();stop()});
return{start,stop,dive(){dv=.001;diveT=performance.now()},resize:size};
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
