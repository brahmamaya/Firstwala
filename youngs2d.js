/* Young's double-slit experiment (NCERT Class 12, Wave Optics), whole-stage 2D lab. A plane wave meets a barrier with two slits; every slit is a row of
   small sources (Huygens), so the light that comes through is computed exactly, near the slits as well as far away: the wave field, the intensity on
   the screen, the path difference S₂P − S₁P to any point P, the angle θ, and crest / trough dots that ride along the two rays.
   Lengths are in model units (u): d is only a few wavelengths so the waves can be seen; the real lab has d ≈ 1000 λ, the same formulas hold. */
(() => {
'use strict';
const {R,N,f,clamp,TAU}=window.PhysicaLab,WK=window.PhysicaWaveKit,{txt}=WK;
const INT=window.PhysicaInteractive=window.PhysicaInteractive||{},PATCH=window.PhysicaSimPatch=window.PhysicaSimPatch||{};
const ID='doubleslit',V=8;                                              // V = wave speed in units per time unit
const BX=170,SC=4,CY=262,FY=84,FB=440,PX=770,PW=170;                     // barrier x, pixels per unit, axis y, field top / bottom, right panel
const CLK=WK.clock();
let S1={crest:true,trough:false,field:true,path:true,off:null,img:null,cols:0,mode:null};
const RED='#ff6b6b',YEL='#ffd43b',TEAL=[96,210,255];
const SUB=p=>p.wid<.5?1:5;                                              // sources per slit
// Geometry of the experiment for the current sliders: slit centres, screen x, the point P and the two distances to it.
function geom(p){const XS=BX+p.L*SC,s1={x:BX,y:CY-p.sep*SC/2},s2={x:BX,y:CY+p.sep*SC/2},P={x:XS,y:CY-p.ym*SC},r1=Math.hypot(P.x-s1.x,P.y-s1.y)/SC,r2=Math.hypot(P.x-s2.x,P.y-s2.y)/SC;
  return{XS,s1,s2,P,r1,r2,delta:Math.abs(r2-r1),theta:Math.atan2(Math.abs(p.ym),p.L)*180/Math.PI}}
// The little sources that make up the two slits: [x px, y px] (the slit's width p.wid is split into SUB points).
function sub(p){const n=SUB(p),out=[];for(const cy of[CY-p.sep*SC/2,CY+p.sep*SC/2])for(let i=0;i<n;i++)out.push([BX,cy+(n===1?0:((i+.5)/n-.5)*p.wid*SC)]);return out}
// Mild fall-off of a circular wave with the distance r (units), so the rings fade a little like real waves.
const fade=r=>1/Math.sqrt(1+r/140);
// Field at (x,y) px at wave time tau: sum of the Huygens waves from every small source.
function field(p,ss,x,y,tau){let e=0;for(const q of ss){const r=Math.hypot(x-q[0],y-q[1])/SC;e+=fade(r)*Math.sin(TAU*(r-V*tau)/p.lam)}return e/(ss.length/2)}
// Time-averaged relative intensity on the screen at pixel height y (1 = the brightest possible).
function Iscr(p,ss,XS,y){let re=0,im=0;for(const q of ss){const r=Math.hypot(XS-q[0],y-q[1])/SC,a=fade(r);re+=a*Math.cos(TAU*r/p.lam);im+=a*Math.sin(TAU*r/p.lam)}const m=ss.length/2;return clamp((re*re+im*im)/(m*m*4*.55),0,1)}
// Single-slit envelope sinc²(π a sinθ / λ) at screen height Y (units).
function env(p,XS,Y){if(p.wid<.5)return 1;const s=Y/Math.hypot(p.L,Y),b=Math.PI*p.wid*s/p.lam;return Math.abs(b)<1e-6?1:Math.pow(Math.sin(b)/b,2)}
// What kind of interference the path difference gives.
function kind(p,g){const d=g.delta/p.lam,fr=d-Math.floor(d);return fr<.06||fr>.94?'constructive (bright)':Math.abs(fr-.5)<.06?'destructive (dark)':'in between'}
// Paints the incoming plane wave (left) and the diffracted waves (right) on a coarse grid, smoothed up to the stage.
function paintField(c,p,ss,XS){const cols=Math.round((XS-BX)/3),rows=Math.round((FB-FY)/3),L0=Math.round((BX-60)/3);
  if(!S1.off||S1.cols!==cols){S1.off=document.createElement('canvas');S1.off.width=L0+cols;S1.off.height=rows;S1.img=S1.off.getContext('2d').createImageData(L0+cols,rows);S1.cols=cols}
  const d=S1.img.data,tau=CLK.tau,gain=S1.field?1:0;let i=0;
  for(let j=0;j<rows;j++){const y=FY+(j+.5)*3;for(let k=0;k<L0+cols;k++){const x=60+(k+.5)*3;let e;
    if(x<BX-4)e=.92*Math.sin(TAU*((x-BX)/SC-V*tau)/p.lam);else if(x<BX+4)e=null;else e=field(p,ss,x,y,tau);
    if(e===null){d[i]=34;d[i+1]=40;d[i+2]=46;d[i+3]=255}else{const v=clamp(.5+.5*e/1.1,0,1),b=(.06+.94*Math.pow(v,1.8))*(.25+.75*gain);d[i]=TEAL[0]*b;d[i+1]=TEAL[1]*b;d[i+2]=TEAL[2]*b;d[i+3]=255}i+=4}}
  S1.off.getContext('2d').putImageData(S1.img,0,0);c.save();c.beginPath();c.roundRect(60,FY,BX-60+XS-BX,FB-FY,4);c.clip();c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';c.drawImage(S1.off,60,FY,(L0+cols)*3,rows*3);c.restore()}
// The barrier with its two slits (metal look) and the labels d and a.
function paintBarrier(c,p){const sl=[CY-p.sep*SC/2,CY+p.sep*SC/2],h=Math.max(3,p.wid*SC);c.save();const g=c.createLinearGradient(BX-5,0,BX+5,0);['#9aa6ae','#e6ecef','#5b666e'].forEach((k,i)=>g.addColorStop(i/2,k));c.fillStyle=g;c.shadowColor='rgba(0,0,0,.6)';c.shadowBlur=8;
  let y0=FY-6;for(const y of sl){c.fillRect(BX-5,y0,10,y-h/2-y0);y0=y+h/2}c.fillRect(BX-5,y0,10,FB+6-y0);c.restore();
  c.save();c.strokeStyle='#e9f6ff';c.lineWidth=1.4;const x=BX-18;c.beginPath();c.moveTo(x,sl[0]);c.lineTo(x,sl[1]);c.moveTo(x-5,sl[0]);c.lineTo(x+5,sl[0]);c.moveTo(x-5,sl[1]);c.lineTo(x+5,sl[1]);c.stroke();c.restore();
  txt(c,`d = ${f(p.sep,1)}`,x-8,CY,'#e9f6ff',12,'right',700);if(p.wid>=.5)txt(c,`a = ${f(p.wid,1)}`,BX+10,sl[0]-h/2-9,'#8ca6b9',11,'left',700);
  txt(c,'S₁',BX-30,sl[0]-14,RED,12,'right',800);txt(c,'S₂',BX-30,sl[1]+16,YEL,12,'right',800)}
// The screen: intensity strip, tick marks for the bright fringes m = 0, ±1, ±2 …, the intensity graph with its single-slit envelope, and the marked point P.
function paintScreen(c,p,ss,g){const {XS,P}=g,Y=y=>(CY-y)/SC;c.save();c.fillStyle='#16301f';c.beginPath();c.moveTo(XS,FY);c.lineTo(XS+16,FY-9);c.lineTo(XS+16,FB-9);c.lineTo(XS,FB);c.closePath();c.fill();c.restore();
  const pts=[];for(let y=FY;y<=FB;y+=2){const I=Iscr(p,ss,XS,y);pts.push([y,I]);c.fillStyle=`rgb(${TEAL.map(v=>Math.round(v*(.08+.92*I))).join(',')})`;c.fillRect(XS,y,10,2.2)}
  for(let m=-5;m<=5;m++){const s=m*p.lam/p.sep;if(Math.abs(s)>=1)continue;const y=CY-p.L*s/Math.sqrt(1-s*s)*SC;if(y<FY||y>FB)continue;c.strokeStyle='rgba(255,255,255,.6)';c.beginPath();c.moveTo(XS+10,y);c.lineTo(XS+15,y);c.stroke();txt(c,String(m),XS+19,y,'#8ca6b9',9.5,'left',700)}
  const x0=XS+40;c.save();c.strokeStyle='rgba(255,255,255,.25)';c.beginPath();c.moveTo(x0,FY);c.lineTo(x0,FB);c.stroke();
  c.beginPath();c.moveTo(x0,FY);pts.forEach(([y,I])=>c.lineTo(x0+I*80,y));c.lineTo(x0,FB);c.closePath();c.fillStyle='rgba(96,210,255,.22)';c.fill();c.strokeStyle='rgb(96,210,255)';c.lineWidth=1.8;c.stroke();
  if(p.wid>=.5){c.setLineDash([4,4]);c.strokeStyle='rgba(255,212,59,.8)';c.lineWidth=1.3;c.beginPath();for(let y=FY;y<=FB;y+=3){const e=env(p,XS,Y(y));y===FY?c.moveTo(x0+e*80,y):c.lineTo(x0+e*80,y)}c.stroke();c.setLineDash([])}
  c.restore();txt(c,'Screen',XS+8,FY-18,'#8ca6b9',11,'center',700);txt(c,'Intensity',x0+40,FY-18,'#8ca6b9',11,'center',700);if(p.wid>=.5)txt(c,'- - single-slit envelope',x0+84,FB+12,YEL,10,'right',600);
  const Ip=Iscr(p,ss,XS,P.y);c.save();c.strokeStyle='rgba(255,255,255,.35)';c.setLineDash([3,4]);c.beginPath();c.moveTo(XS,P.y);c.lineTo(x0+Ip*80,P.y);c.stroke();c.setLineDash([]);c.fillStyle='#fff';c.beginPath();c.arc(x0+Ip*80,P.y,4,0,TAU);c.fill();
  c.fillStyle='#ff9f43';c.strokeStyle='#14181d';c.lineWidth=1.6;c.beginPath();c.arc(P.x,P.y,8,0,TAU);c.fill();c.stroke();c.restore();txt(c,'P',P.x-16,P.y,'#ff9f43',13,'right',800);
  const yy=Math.round(P.y);txt(c,`Y = ${f(p.ym,1)}`,XS-12,Math.min(FB-8,yy+18),'#ff9f43',11,'right',700)}
// A wave drawn along a ray from slit s to P: a wavy line (the wave itself) and dots on its crests / troughs.
function paintRay(c,p,s,P,col,r){const dx=(P.x-s.x)/(r*SC),dy=(P.y-s.y)/(r*SC),nx=-dy,ny=dx,A=6.5,ph=u=>TAU*(u-V*CLK.tau)/p.lam;c.save();c.strokeStyle=col;c.lineWidth=2;c.globalAlpha=.9;c.beginPath();
  for(let u=0;u<=r+.01;u+=.5){const o=A*Math.sin(ph(u)),X=s.x+dx*u*SC+nx*o,Y=s.y+dy*u*SC+ny*o;u?c.lineTo(X,Y):c.moveTo(X,Y)}c.stroke();c.globalAlpha=1;
  const dots=(shift,col2,sg)=>{c.fillStyle=col2;c.strokeStyle='#14181d';c.lineWidth=1.2;const u0=((V*CLK.tau+shift)%p.lam+p.lam)%p.lam;for(let u=u0;u<=r;u+=p.lam){c.beginPath();c.arc(s.x+dx*u*SC+nx*A*sg,s.y+dy*u*SC+ny*A*sg,3.6,0,TAU);c.fill();c.stroke()}};
  if(S1.crest)dots(p.lam/4,'#ffffff',1);if(S1.trough)dots(3*p.lam/4,'#4dabf7',-1);c.restore()}
// Marks the path difference: the red segment from the farther slit along its ray is as long as S₂P − S₁P; the dashed line shows it is a right-angled construction.
function paintPath(c,p,g){const {s1,s2,P,r1,r2}=g;if(!S1.path)return;const far=r2>=r1?s2:s1,near=r2>=r1?s1:s2,rf=Math.max(r1,r2),dx=(P.x-far.x)/(rf*SC),dy=(P.y-far.y)/(rf*SC),Q={x:far.x+dx*g.delta*SC,y:far.y+dy*g.delta*SC};
  c.save();c.strokeStyle='#ff6b6b';c.lineWidth=4.5;c.lineCap='round';c.beginPath();c.moveTo(far.x,far.y);c.lineTo(Q.x,Q.y);c.stroke();c.setLineDash([3,3]);c.strokeStyle='rgba(255,255,255,.7)';c.lineWidth=1.3;c.beginPath();c.moveTo(near.x,near.y);c.lineTo(Q.x,Q.y);c.stroke();c.restore();
  txt(c,`Δ = ${f(g.delta,2)}`,Q.x+8,Q.y+(far.y>near.y?16:-14),'#ffb3b3',12,'left',800)}
// The angle θ between the axis and the line from the middle of the slits to P.
function paintAngle(c,p,g){const O={x:BX,y:CY},ang=Math.atan2(g.P.y-CY,g.P.x-BX),R0=64;c.save();c.strokeStyle='rgba(255,255,255,.55)';c.setLineDash([2,4]);c.lineWidth=1.2;c.beginPath();c.moveTo(BX,CY);c.lineTo(g.XS,CY);c.moveTo(BX,CY);c.lineTo(g.P.x,g.P.y);c.stroke();c.setLineDash([]);
  c.strokeStyle='#e9f6ff';c.lineWidth=1.6;c.beginPath();c.arc(O.x,O.y,R0,Math.min(0,ang),Math.max(0,ang));c.stroke();c.restore();txt(c,`θ = ${f(g.theta,1)}°`,BX+R0+8,CY+(ang<0?-10:12),'#e9f6ff',12,'left',800)}
// Right-hand readout panel.
function paintPanel(c,p,g){const y0=FY;WK.panel(c,PX,y0,PW,FB-y0);const m=g.delta/p.lam,beta=p.lam*p.L/p.sep,lines=[[`λ = ${f(p.lam,1)} u`,'#cfe2ee',13,700],[`d = ${f(p.sep,1)} u   a = ${f(p.wid,1)} u`,'#cfe2ee',12,600],[`L = ${f(p.L,0)} u`,'#cfe2ee',12,600],['',0],
  ['Point P on the screen','#ff9f43',12,800],[`Y = ${f(p.ym,1)} u    θ = ${f(g.theta,1)}°`,'#cfe2ee',12,600],[`S₁P = ${f(g.r1,2)} u`,RED,12,700],[`S₂P = ${f(g.r2,2)} u`,YEL,12,700],[`Δ = S₂P − S₁P`,'#ffb3b3',12,700],[`   = ${f(g.delta,2)} u = ${f(m,2)} λ`,'#ffb3b3',12,700],[kind(p,g),'#fff',12.5,800],['',0],
  ['Fringes','#42d9ca',12,800],[`β ≈ λL/d = ${f(beta,1)} u`,'#cfe2ee',12,600],[`d sinθ = ${f(p.sep*Math.sin(g.theta*Math.PI/180),2)} u`,'#cfe2ee',12,600],['Bright: Δ = mλ','#8ca6b9',11.5,600],['Dark: Δ = (m + ½)λ','#8ca6b9',11.5,600]];
  lines.forEach(([s,k,sz,w],i)=>{if(s)txt(c,s,PX+12,y0+18+i*20.5,k,sz,'left',w)})}

INT[ID]={allViews:true,
 draw(c,p,t){CLK.tick(t);const g=geom(p),ss=sub(p),XS=g.XS;
  c.save();c.fillStyle='#060b10';c.fillRect(0,0,960,505);c.restore();
  paintField(c,p,ss,XS);paintBarrier(c,p);paintScreen(c,p,ss,g);
  // L arrow above the field
  c.save();c.strokeStyle='#e9f6ff';c.lineWidth=1.4;c.beginPath();c.moveTo(BX,FY-10);c.lineTo(XS,FY-10);c.moveTo(BX,FY-15);c.lineTo(BX,FY-5);c.moveTo(XS,FY-15);c.lineTo(XS,FY-5);c.stroke();c.restore();txt(c,`L = ${f(p.L,0)} u`,(BX+XS)/2,FY-20,'#e9f6ff',12,'center',700);
  paintAngle(c,p,g);paintRay(c,p,g.s1,g.P,RED,g.r1);paintRay(c,p,g.s2,g.P,YEL,g.r2);paintPath(c,p,g);
  S1.hit=[WK.check(c,60,40,'Mark crests',S1.crest,'#fff'),WK.check(c,176,40,'Mark troughs',S1.trough,'#9ccbff'),WK.check(c,298,40,'Wave field',S1.field),WK.check(c,402,40,'Path difference',S1.path)];
  txt(c,'Drag P on the screen, or a slit up and down.',530,40,'#8ca6b9',11,'left',600);
  paintPanel(c,p,g);WK.transport(c,CLK)},
 // Pointer down: switches, buttons, the point P, or a slit.
 down(q,p){const g=geom(p);if(WK.transportHit(q,CLK,p.lam/V,()=>{CLK.tau=0;CLK.lastT=null;Object.assign(S1,{crest:true,trough:false,field:true,path:true});p.ym=26;p.sep=20;p.lam=4;p.wid=2;p.L=100}))return;
  const keys=['crest','trough','field','path'],i=(S1.hit||[]).findIndex(h=>q.x>=h.x&&q.x<=h.x+h.w&&q.y>=h.y&&q.y<=h.y+h.h);if(i>=0){S1[keys[i]]=!S1[keys[i]];return}
  if(Math.abs(q.x-g.XS)<28&&q.y>FY-6&&q.y<FB+6){S1.mode='P';this.move(q,p);return}
  if(Math.abs(q.x-BX)<22&&q.y>FY-6&&q.y<FB+6){S1.mode='slit';this.move(q,p)}},
 move(q,p){if(S1.mode==='P')p.ym=clamp(Math.round((CY-q.y)/SC*2)/2,-42,42);else if(S1.mode==='slit')p.sep=clamp(Math.round(Math.abs(q.y-CY)*2/SC*2)/2,8,40)},
 up(){S1.mode=null}};

PATCH[ID]={
 description:'Light passes through two narrow slits and the two waves meet on the screen. See the waves leave each slit, mark their crests, measure the path difference to a point P and watch bright and dark fringes form.',
 formula:'Δ = S₂P − S₁P ≈ d sin θ ;  bright: Δ = mλ ;  dark: Δ = (m + ½)λ ;  fringe width β = λL/d',
 observe:'Crests of the two waves arrive at P together when Δ is a whole number of wavelengths: bright. When one crest meets a trough, Δ is an odd number of half wavelengths: dark.',
 tryText:'Drag P to the first dark point (Δ = λ/2), then to the first bright point (Δ = λ). Now double d: what happens to the fringe width β?',
 controls:[R('lam','Wavelength λ',3,8,.1,4,'u',1),R('sep','Slit separation d',8,40,.5,20,'u',1),R('wid','Slit width a',0,10,.5,2,'u',1),R('L','Distance to the screen L',40,120,5,100,'u'),R('ym','Height Y of point P',-42,42,.5,26,'u',1)],
 metrics:p=>{const g=geom(p);return[N('Path difference Δ = S₂P − S₁P',f(g.delta,2)+' u = '+f(g.delta/p.lam,2)+' λ'),N('At point P',kind(p,g)),N('Angle θ of P',f(g.theta,1)+'°'),N('Fringe width β ≈ λL/d',f(p.lam*p.L/p.sep,1)+' u'),N('Central peak half-width (single slit)',p.wid>=.5?f(p.lam*p.L/p.wid,0)+' u':'—')]}};
(window.PhysicaFullStage=window.PhysicaFullStage||{})[ID]=(c,p,t)=>INT[ID].draw(c,p,t);
})();
