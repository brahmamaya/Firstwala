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
let DX=0,S1={crest:true,trough:false,view:'after',path:true,off:null,img:null,cols:0,cell:2,slow:0,mode:null,vh:[]};
const RED='#ff6b6b',YEL='#ffd43b',TEAL=[96,210,255];
// width of a view button from its label
const l_w=l=>Math.round(l.length*6.9+24),VIEWS=[['before','Before: two separate waves'],['after','After: they add (interference)'],['single','One slit only'],['real','Realistic view']],CAPTION={before:'Each slit sends its own wave (red = S₁, blue = S₂). They cross: no bright / dark pattern.',after:'The waves ADD: crest + crest = bright, crest + trough = dark. Fringes appear.',real:'As seen in a real lab: steady bright and dark fringes (time-averaged light).',single:'Only slit 1 is open: one smooth wave, one smooth hump, no fringes.'};
const SUB=p=>p.wid<.5?1:5;                                              // sources per slit
// Geometry of the experiment for the current sliders: slit centres, screen x, the point P and the two distances to it.
function geom(p){const XS=BX+p.L*SC,s1={x:BX,y:CY-p.sep*SC/2},s2={x:BX,y:CY+p.sep*SC/2},P={x:XS,y:CY-p.ym*SC},r1=Math.hypot(P.x-s1.x,P.y-s1.y)/SC,r2=Math.hypot(P.x-s2.x,P.y-s2.y)/SC;
  return{XS,s1,s2,P,r1,r2,delta:Math.abs(r2-r1),theta:Math.atan2(Math.abs(p.ym),p.L)*180/Math.PI}}
// The little sources that make up the two slits: [x px, y px] (the slit's width p.wid is split into SUB points).
function sub(p){const n=SUB(p),out=[];for(const cy of[CY-p.sep*SC/2,CY+p.sep*SC/2])for(let i=0;i<n;i++)out.push([BX,cy+(n===1?0:((i+.5)/n-.5)*p.wid*SC)]);return out}
// Mild fall-off of a circular wave with the distance r (units), so the rings fade a little like real waves.
const fade=r=>1/Math.sqrt(1+r/140);
// Field at (x,y) px at wave time tau: sum of the Huygens waves from every small source.
function field(p,ss,x,y,tau,m){let e=0;for(const q of ss){const r=Math.hypot(x-q[0],y-q[1])/SC;e+=fade(r)*Math.sin(TAU*(r-V*tau)/p.lam)}return e/(m||ss.length/2)}
// Time-averaged relative intensity on the screen at pixel height y for the sources in `list` (n = sources per slit; 1 = the brightest two-slit value).
function Iscr(p,list,XS,y,n){let re=0,im=0;for(const q of list){const r=Math.hypot(XS-q[0],y-q[1])/SC,a=fade(r);re+=a*Math.cos(TAU*r/p.lam);im+=a*Math.sin(TAU*r/p.lam)}return clamp((re*re+im*im)/(4*n*n),0,1)}
// Single-slit envelope sinc²(π a sinθ / λ) at screen height Y (units).
function env(p,XS,Y){if(p.wid<.5)return 1;const s=Y/Math.hypot(p.L,Y),b=Math.PI*p.wid*s/p.lam;return Math.abs(b)<1e-6?1:Math.pow(Math.sin(b)/b,2)}
// What kind of interference the path difference gives.
function kind(p,g){const d=g.delta/p.lam,fr=d-Math.floor(d);return fr<.06||fr>.94?'constructive (bright)':Math.abs(fr-.5)<.06?'destructive (dark)':'in between'}
// Realistic view: the steady (time-averaged) light intensity everywhere behind the slits, in the colour of the light, with a soft glow. Cached until a slider changes.
function paintReal(c,p,ss,XS){const cell=3,cols=Math.round((XS-BX)/cell),rows=Math.round((FB-FY)/cell),key=[p.lam,p.sep,p.wid,p.L].join('|'),n=ss.length/2,nm=450+(p.lam-3)*50,col=WK.spectral(nm);
  if(!S1.real||S1.real.key!==key){const cv=document.createElement('canvas');cv.width=cols;cv.height=rows;const cx=cv.getContext('2d'),im=cx.createImageData(cols,rows),d=im.data;let i=0;
    for(let j=0;j<rows;j++){const y=FY+(j+.5)*cell;for(let k=0;k<cols;k++){const x=BX+(k+.5)*cell;let re=0,im2=0;for(const q of ss){const r=Math.hypot(x-q[0],y-q[1])/SC,a=fade(r);re+=a*Math.cos(TAU*r/p.lam);im2+=a*Math.sin(TAU*r/p.lam)}
      const I=clamp((re*re+im2*im2)/(4*n*n),0,1),b=Math.pow(I,.7);d[i]=col[0]*b;d[i+1]=col[1]*b;d[i+2]=col[2]*b;d[i+3]=255;i+=4}}
    cx.putImageData(im,0,0);const sm=document.createElement('canvas');sm.width=Math.ceil(cols/6);sm.height=Math.ceil(rows/6);sm.getContext('2d').drawImage(cv,0,0,sm.width,sm.height);S1.real={key,cv,sm}}
  c.save();c.beginPath();c.roundRect(60,FY,XS-60,FB-FY,4);c.clip();c.fillStyle=`rgba(${col},.22)`;c.fillRect(60,FY,BX-64,FB-FY);c.fillStyle='#282e34';c.fillRect(BX-4,FY,8,FB-FY);
  c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';c.drawImage(S1.real.cv,BX,FY,XS-BX,rows*cell);c.globalCompositeOperation='lighter';c.globalAlpha=.55;c.drawImage(S1.real.sm,BX,FY,XS-BX,rows*cell);c.restore()}
// Paints the incoming plane wave (left) and the waves after the slits on a fine grid, smoothed up to the stage.
// view "after": one white field = the two waves added (interference). "before": the wave of slit 1 in red and of slit 2 in blue, side by side, not added.
// "single": the wave of slit 1 alone. Crests are white (or coloured), troughs and the background are black.
function paintField(c,p,ss,XS){if(S1.view==='real')return paintReal(c,p,ss,XS);const cell=S1.cell,cols=Math.round((XS-BX)/cell),rows=Math.round((FB-FY)/cell),L0=Math.round((BX-60)/cell),t0=performance.now();
  if(!S1.off||S1.cols!==cols||S1.rc!==cell){S1.off=document.createElement('canvas');S1.off.width=L0+cols;S1.off.height=rows;S1.img=S1.off.getContext('2d').createImageData(L0+cols,rows);S1.cols=cols;S1.rc=cell}
  const d=S1.img.data,tau=CLK.tau,n=ss.length/2,A=ss.slice(0,n),Bq=ss.slice(n),v=S1.view;let i=0;
  const crest=e=>{const u=clamp(e,0,1);return u*u*(3-2*u)};
  for(let j=0;j<rows;j++){const y=FY+(j+.5)*cell;for(let k=0;k<L0+cols;k++){const x=60+(k+.5)*cell;let r=0,g=0,b=0;
    if(x<BX-4){const w=crest(Math.sin(TAU*((x-BX)/SC-V*tau)/p.lam))*.9;r=g=b=255*w}
    else if(x<BX+4){r=g=b=40}
    else if(v==='before'){const e1=field(p,A,x,y,tau,n),e2=field(p,Bq,x,y,tau,n),w1=crest(e1),w2=crest(e2);r=Math.min(255,255*w1+60*w2);g=Math.min(255,70*w1+150*w2);b=Math.min(255,70*w1+255*w2)}
    else if(v==='single'){const w=crest(field(p,A,x,y,tau,n));r=g=b=255*w}
    else{const w=crest(field(p,ss,x,y,tau,ss.length/2)/1.0);r=g=b=255*w}
    d[i]=r;d[i+1]=g;d[i+2]=b;d[i+3]=255;i+=4}}
  S1.off.getContext('2d').putImageData(S1.img,0,0);c.save();c.beginPath();c.roundRect(60,FY,XS-60,FB-FY,4);c.clip();c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';c.drawImage(S1.off,60,FY,(L0+cols)*cell,rows*cell);c.restore();
  const ms=performance.now()-t0;S1.slow=ms>20?S1.slow+1:Math.max(0,S1.slow-1);if(S1.slow>12&&S1.cell<4){S1.cell=S1.cell+1;S1.slow=0}}
// The barrier with its two slits (metal look) and the labels d and a.
function paintBarrier(c,p){const sl=[CY-p.sep*SC/2,CY+p.sep*SC/2],h=Math.max(3,p.wid*SC);c.save();const g=c.createLinearGradient(BX-5,0,BX+5,0);['#9aa6ae','#e6ecef','#5b666e'].forEach((k,i)=>g.addColorStop(i/2,k));c.fillStyle=g;c.shadowColor='rgba(0,0,0,.6)';c.shadowBlur=8;
  let y0=FY-6;for(const y of sl){c.fillRect(BX-5,y0,10,y-h/2-y0);y0=y+h/2}c.fillRect(BX-5,y0,10,FB+6-y0);c.restore();
  c.save();c.strokeStyle='#e9f6ff';c.lineWidth=1.4;const x=BX-18;c.beginPath();c.moveTo(x,sl[0]);c.lineTo(x,sl[1]);c.moveTo(x-5,sl[0]);c.lineTo(x+5,sl[0]);c.moveTo(x-5,sl[1]);c.lineTo(x+5,sl[1]);c.stroke();c.restore();
  txt(c,`d = ${f(p.sep,1)}`,x-8,CY,'#e9f6ff',12,'right',700);if(p.wid>=.5)txt(c,`a = ${f(p.wid,1)}`,BX+10,sl[0]-h/2-9,'#8ca6b9',11,'left',700);
  txt(c,'S₁',BX-30,sl[0]-14,RED,12,'right',800);txt(c,'S₂',BX-30,sl[1]+16,YEL,12,'right',800)}
// The screen: intensity strip, tick marks for the bright fringes m = 0, ±1, ±2 …, the intensity graph(s) and the marked point P.
// after: white curve with fringes and a dashed grey line "no interference" (I₁ + I₂); before: red I₁, blue I₂ and their plain sum; single: I₁ only.
function paintScreen(c,p,ss,g){const {XS,P}=g,Y=y=>(CY-y)/SC,n=ss.length/2,A=ss.slice(0,n),Bq=ss.slice(n),v=S1.view,x0=XS+40,SCL=80;
  c.save();c.fillStyle='#14181c';c.beginPath();c.moveTo(XS,FY);c.lineTo(XS+16,FY-9);c.lineTo(XS+16,FB-9);c.lineTo(XS,FB);c.closePath();c.fill();c.restore();
  const tot=[],i1=[],i2=[];for(let y=FY;y<=FB;y+=2){const a1=Iscr(p,A,XS,y,n),a2=Iscr(p,Bq,XS,y,n),at=Iscr(p,ss,XS,y,n);i1.push([y,a1]);i2.push([y,a2]);tot.push([y,at]);
    const I=v==='after'?at:v==='single'?a1*4:Math.min(1,a1+a2);const w=Math.round(255*(.04+.96*I));c.fillStyle=`rgb(${w},${w},${w})`;c.fillRect(XS,y,10,2.2)}
  for(let m=-5;m<=5;m++){const s=m*p.lam/p.sep;if(Math.abs(s)>=1)continue;const y=CY-p.L*s/Math.sqrt(1-s*s)*SC;if(y<FY||y>FB)continue;c.strokeStyle='rgba(255,255,255,.6)';c.beginPath();c.moveTo(XS+10,y);c.lineTo(XS+15,y);c.stroke();if(v==='after')txt(c,String(m),XS+19,y,'#8ca6b9',9.5,'left',700)}
  if(v==='real'){const col=WK.spectral(450+(p.lam-3)*50);for(let y=FY;y<=FB;y+=2){const I=Iscr(p,ss,XS,y,n),b=Math.pow(I,.7);c.fillStyle=`rgb(${col.map(k=>Math.round(k*b)).join(',')})`;c.fillRect(x0+4,y,76,2.2)}c.save();c.globalCompositeOperation='lighter';c.globalAlpha=.35;c.filter='blur(5px)';for(let y=FY;y<=FB;y+=4){const I=Iscr(p,ss,XS,y,n),b=Math.pow(I,.9);c.fillStyle=`rgb(${col.map(k=>Math.round(k*b)).join(',')})`;c.fillRect(x0+4,y,76,4.2)}c.restore();}
  const curve=(pts,sc,col,fill,dash)=>{c.save();c.beginPath();c.moveTo(x0,FY);pts.forEach(([y,I])=>c.lineTo(x0+I*sc,y));if(fill){c.lineTo(x0,FB);c.closePath();c.fillStyle=fill;c.fill()}c.setLineDash(dash||[]);c.strokeStyle=col;c.lineWidth=dash?1.5:2;c.stroke();c.restore()};
  c.save();c.strokeStyle='rgba(255,255,255,.25)';c.beginPath();c.moveTo(x0,FY);c.lineTo(x0,FB);c.stroke();c.restore();
  const sumNo=i1.map(([y,a],k)=>[y,a+i2[k][1]]);
  if(v==='real')curve(tot,SCL*.95,'rgba(255,255,255,.55)',null);
  else if(v==='after'){curve(sumNo,SCL,'rgba(180,190,200,.9)',null,[5,4]);curve(tot,SCL,'#ffffff','rgba(255,255,255,.14)')}
  else if(v==='before'){curve(i1,SCL,'#ff6b6b',null);curve(i2,SCL,'#4dabf7',null);curve(sumNo,SCL,'#ffffff','rgba(255,255,255,.10)')}
  else curve(i1.map(([y,a])=>[y,a*4]),SCL,'#ffffff','rgba(255,255,255,.14)');
  txt(c,'Screen',XS+22,FB+10,'#8ca6b9',11,'center',700);txt(c,'Intensity',x0+44,FB+10,'#8ca6b9',11,'center',700);
  const lg=v==='real'?[['white line: intensity graph','#cfe2ee']]:v==='after'?[['white: the waves ADD (fringes)','#ffffff'],['dashed: I₁ + I₂ (no interference)','#b4beca']]:v==='before'?[['red I₁, blue I₂ (each alone)','#cfe2ee'],['white: I₁ + I₂, no fringes','#ffffff']]:[['slit 1 alone (scaled up ×4)','#ffffff']];
  lg.forEach(([s,k],i)=>txt(c,s,x0+90,FB+24+i*12,k,10,'right',600));
  const Ip=v==='after'||v==='real'?Iscr(p,ss,XS,P.y,n):v==='single'?Iscr(p,A,XS,P.y,n)*4:Math.min(1,Iscr(p,A,XS,P.y,n)+Iscr(p,Bq,XS,P.y,n));c.save();c.strokeStyle='rgba(255,255,255,.35)';c.setLineDash([3,4]);c.beginPath();c.moveTo(XS,P.y);c.lineTo(x0+Ip*SCL,P.y);c.stroke();c.setLineDash([]);c.fillStyle='#fff';c.beginPath();c.arc(x0+Ip*SCL,P.y,4,0,TAU);c.fill();
  c.fillStyle='#ff9f43';c.strokeStyle='#14181d';c.lineWidth=1.6;c.beginPath();c.arc(P.x,P.y,8,0,TAU);c.fill();c.stroke();c.restore();txt(c,'P',P.x-16,P.y,'#ff9f43',13,'right',800);
  txt(c,`Y = ${f(p.ym,1)}`,XS-12,Math.min(FB-8,Math.round(P.y)+18),'#ff9f43',11,'right',700)}
// A wave drawn along a ray from slit s to P: a wavy line (the wave itself) and dots on its crests / troughs.
function paintRay(c,p,s,P,col,r){const dx=(P.x-s.x)/(r*SC),dy=(P.y-s.y)/(r*SC),nx=-dy,ny=dx,A=6.5,ph=u=>TAU*(u-V*CLK.tau)/p.lam;c.save();c.strokeStyle=col;c.lineWidth=2;c.globalAlpha=.9;c.beginPath();
  for(let u=0;u<=r+.01;u+=.5){const o=A*Math.sin(ph(u)),X=s.x+dx*u*SC+nx*o,Y=s.y+dy*u*SC+ny*o;u?c.lineTo(X,Y):c.moveTo(X,Y)}c.stroke();c.globalAlpha=1;
  const dots=(shift,col2,sg)=>{c.fillStyle=col2;c.strokeStyle='#14181d';c.lineWidth=1.2;const u0=((V*CLK.tau+shift)%p.lam+p.lam)%p.lam;for(let u=u0;u<=r;u+=p.lam){c.beginPath();c.arc(s.x+dx*u*SC+nx*A*sg,s.y+dy*u*SC+ny*A*sg,3.6,0,TAU);c.fill();c.stroke()}};
  if(S1.crest)dots(p.lam/4,'#ffffff',1);if(S1.trough)dots(3*p.lam/4,'#4dabf7',-1);c.restore()}
// A plain straight ray (used in the realistic view).
function straight(c,a,b,col){c.save();c.strokeStyle=col;c.globalAlpha=.8;c.lineWidth=1.6;c.setLineDash([6,4]);c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();c.restore()}
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


// ---------- Ultra-Realistic: the experiment on an optical bench in 3-D (drag to orbit) ----------
const CAM={yaw:-.38,pitch:.5};let ORB=null;
// Camera: turns the world point (x along the beam, y up, z across the bench) about the bench centre and projects it to the stage. Returns [sx, sy, depth].
function camera(xc){const cy=Math.cos(CAM.yaw),sy=Math.sin(CAM.yaw),cp=Math.cos(CAM.pitch),sp=Math.sin(CAM.pitch),D=330,F=900;
  return(x,y,z)=>{const X=x-xc,x1=X*cy+z*sy,z1=-X*sy+z*cy,y1=y*cp+z1*sp,z2=z1*cp-y*sp,w=F/(D+z2);return[500+x1*w,262-y1*w,z2]}}
const quad=(c,P,pts,fill,stroke)=>{c.beginPath();pts.forEach((q,i)=>{const r=P(...q);i?c.lineTo(r[0],r[1]):c.moveTo(r[0],r[1])});c.closePath();if(fill){c.fillStyle=fill;c.fill()}if(stroke){c.strokeStyle=stroke;c.lineWidth=1;c.stroke()}};
function ultraScene(c,p,t){CLK.tick(t);const clean=WK.clean(),Lw=p.L,P=camera(Lw/2-12),ss=sub(p),nm=450+(p.lam-3)*50,col=WK.spectral(nm),tau=CLK.tau,hb=14,XSs=BX+p.L*SC;
  // room
  const bg=c.createRadialGradient(480,200,60,480,260,620);bg.addColorStop(0,'#1a2128');bg.addColorStop(1,'#020304');c.fillStyle=bg;c.fillRect(0,0,960,505);
  // bench: top, front edge, breadboard holes
  const X0=-38,X1=Lw+14,Z0=-62,Z1=62;c.save();let g=c.createLinearGradient(0,150,0,420);g.addColorStop(0,'#2b3138');g.addColorStop(1,'#59616a');quad(c,P,[[X0,0,Z0],[X1,0,Z0],[X1,0,Z1],[X0,0,Z1]],g,'#0b0e11');
  quad(c,P,[[X0,0,Z0],[X1,0,Z0],[X1,-7,Z0],[X0,-7,Z0]],'#15191d');c.restore();
  c.fillStyle='rgba(0,0,0,.55)';for(let x=X0+6;x<X1;x+=8)for(let z=Z0+6;z<Z1;z+=8){const r=P(x,0,z);c.fillRect(r[0]-1,r[1]-.5,2,1)}
  // glow of the screen pattern on the bench
  // screen (back wall) and the bright fringes on it
  const sw=50,sh=46;quad(c,P,[[Lw,0,-sw],[Lw,0,sw],[Lw,sh,sw],[Lw,sh,-sw]],'#262b31','#0b0e11');
  const n=Math.max(1,ss.length/2),N=150;c.save();for(let k=0;k<N;k++){const z0=-sw+(k/N)*2*sw,z1=-sw+((k+1)/N)*2*sw,y=-(z0+z1)/2*SC/SC,I=Iscr(p,ss,XSs,CY+y*SC,n),b=Math.pow(I,.75),fill=`rgba(${col.map(v=>Math.round(v*b)).join(',')},1)`;
    quad(c,P,[[Lw,5,z0],[Lw,5,z1],[Lw,23,z1],[Lw,23,z0]],fill)}
  c.globalCompositeOperation='lighter';c.globalAlpha=.4;for(let k=0;k<N;k+=2){const z0=-sw+(k/N)*2*sw,z1=-sw+((k+2)/N)*2*sw,y=-(z0+z1)/2,I=Iscr(p,ss,XSs,CY+y*SC,n);quad(c,P,[[Lw,-2,z0],[Lw,-2,z1],[Lw,30,z1],[Lw,30,z0]],`rgba(${col.join(',')},${(Math.pow(I,1.1)*.35).toFixed(3)})`)}c.restore();
  // the two light sheets leaving the slits: moving wavefronts (arcs) in the plane of the beam
  const sl=[-p.sep/2,p.sep/2];c.save();c.lineWidth=1.2;for(const zs of sl){for(let r=((V*tau)%p.lam+p.lam)%p.lam+2;r<Lw+30;r+=p.lam){c.beginPath();let on=false;for(let a=-80;a<=80;a+=4){const th=a*Math.PI/180,x=r*Math.cos(th),z=zs+r*Math.sin(th);if(x>Lw||x<0){on=false;continue}const q=P(x,hb,z);on?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1]);on=true}
      c.strokeStyle=`rgba(${col.join(',')},${Math.max(.05,.34-r/Lw*.2).toFixed(3)})`;c.stroke()}}c.restore();
  c.save();c.globalCompositeOperation='lighter';for(const zs of sl){quad(c,P,[[0,hb,zs],[Lw,hb,zs-Lw*.9],[Lw,hb,zs+Lw*.9]],`rgba(${col.join(',')},.035)`)}c.restore();
  // incoming beam, laser and the barrier with its slits
  c.save();c.globalCompositeOperation='lighter';quad(c,P,[[-8,hb,-1],[0,hb,-p.sep/2-4],[0,hb,p.sep/2+4],[-8,hb,1]],`rgba(${col.join(',')},.22)`);quad(c,P,[[-30,hb,-.7],[0,hb,-.7],[0,hb,.7],[-30,hb,.7]],`rgba(${col.join(',')},.55)`);c.restore();
  const lb=[P(-34,hb,0),P(-30,hb,0)];const lg=c.createLinearGradient(0,P(-34,hb+4,0)[1],0,P(-34,hb-4,0)[1]);['#eef2f5','#9aa6ae','#4b565e'].forEach((k,i)=>lg.addColorStop(i/2,k));
  quad(c,P,[[-40,hb-4,-4],[-30,hb-4,-4],[-30,hb+4,-4],[-40,hb+4,-4]],lg,'#1b2126');quad(c,P,[[-40,hb+4,-4],[-30,hb+4,-4],[-30,hb+4,4],[-40,hb+4,4]],'#c8d1d8','#1b2126');quad(c,P,[[-30,hb-4,-4],[-30,hb-4,4],[-30,hb+4,4],[-30,hb+4,-4]],'#6c7780','#1b2126');
  const ap=P(-30,hb,0),gl=c.createRadialGradient(ap[0],ap[1],1,ap[0],ap[1],18);gl.addColorStop(0,`rgba(${col.join(',')},1)`);gl.addColorStop(1,`rgba(${col.join(',')},0)`);c.save();c.globalCompositeOperation='lighter';c.fillStyle=gl;c.beginPath();c.arc(ap[0],ap[1],18,0,TAU);c.fill();c.restore();
  const a=Math.max(1.2,p.wid*.8),bz=[-50,-p.sep/2-a/2,-p.sep/2+a/2,p.sep/2-a/2,p.sep/2+a/2,50];for(let i=0;i<5;i+=2){const za=bz[i],zb=bz[i+1],dk=c.createLinearGradient(0,P(0,36,za)[1],0,P(0,0,za)[1]);dk.addColorStop(0,'#3b434b');dk.addColorStop(1,'#14181c');
    quad(c,P,[[-1.2,0,za],[-1.2,0,zb],[-1.2,36,zb],[-1.2,36,za]],dk,'#05070a');quad(c,P,[[-1.2,36,za],[-1.2,36,zb],[1.2,36,zb],[1.2,36,za]],'#59636c','#05070a');if(i===0)quad(c,P,[[-1.2,0,za],[1.2,0,za],[1.2,36,za],[-1.2,36,za]],'#1d2329','#05070a')}
  c.save();c.globalCompositeOperation='lighter';for(const zs of sl){const q=P(0,hb,zs),g2=c.createRadialGradient(q[0],q[1],0,q[0],q[1],14);g2.addColorStop(0,`rgba(${col.join(',')},.9)`);g2.addColorStop(1,`rgba(${col.join(',')},0)`);c.fillStyle=g2;c.beginPath();c.arc(q[0],q[1],14,0,TAU);c.fill()}c.restore();
  // labels
  const lab=(s,x,y,z,off)=>{const q=P(x,y,z);txt(c,s,q[0],q[1]+off,'#cfe2ee',12,'center',700)};lab('Laser',-35,hb+7,0,-6);lab('Double slit',0,38,0,-8);lab('Screen',Lw,48,0,-8);
  if(!clean){const ls=[`λ = ${f(p.lam,1)} u   (colour of the light)`,`d = ${f(p.sep,1)} u   a = ${f(p.wid,1)} u   L = ${f(p.L,0)} u`,`fringe width β ≈ λL/d = ${f(p.lam*p.L/p.sep,1)} u`];ls.forEach((s,i)=>txt(c,s,40,48+i*18,i?'#cfe2ee':'#fff',12.5,'left',i?600:800));txt(c,'Drag to look around. The bright bars on the screen are the interference fringes.',40,48+3*18,'#8ca6b9',11,'left',600)}
  WK.transport(c,CLK)}
(window.PhysicaUltraScenes=window.PhysicaUltraScenes||{})[ID]=ultraScene;

INT[ID]={allViews:true,
 draw(c,p,t){CLK.tick(t);const g=geom(p),ss=sub(p),XS=g.XS,clean=WK.clean();DX=WK.shift(30,XS+136);
  c.save();c.fillStyle='#000';c.fillRect(0,0,960,505);c.restore();c.save();c.translate(DX,0);
  paintField(c,p,ss,XS);paintBarrier(c,p);paintScreen(c,p,ss,g);
  // L dimension line below the field, with its label in a gap
  c.save();c.strokeStyle='#e9f6ff';c.lineWidth=1.4;const ly=FB+10,mx=(BX+XS)/2;c.beginPath();c.moveTo(BX,ly);c.lineTo(mx-34,ly);c.moveTo(mx+34,ly);c.lineTo(XS,ly);c.moveTo(BX,ly-5);c.lineTo(BX,ly+5);c.moveTo(XS,ly-5);c.lineTo(XS,ly+5);c.stroke();c.restore();txt(c,`L = ${f(p.L,0)} u`,mx,ly,'#e9f6ff',12,'center',700);
  paintAngle(c,p,g);if(S1.view==='real'){straight(c,g.s1,g.P,RED);straight(c,g.s2,g.P,YEL);paintPath(c,p,g)}else{paintRay(c,p,g.s1,g.P,RED,g.r1);if(S1.view!=='single'){paintRay(c,p,g.s2,g.P,YEL,g.r2);paintPath(c,p,g)}}
  S1.hit=[WK.check(c,60,24,'Mark crests',S1.crest,'#fff'),WK.check(c,176,24,'Mark troughs',S1.trough,'#9ccbff'),WK.check(c,298,24,'Path difference',S1.path)];
  // the three views: before interference (two separate waves), after interference (they add), one slit only
  S1.vb=[];let vx=60;VIEWS.forEach(([k,l])=>{const b={k,l,x:vx,y:46,w:l_w(l),h:26},on=S1.view===k;S1.vb.push(b);vx+=b.w+6;c.save();c.fillStyle=on?'#1fb5a6':'rgba(255,255,255,.07)';c.strokeStyle=on?'#6ff0e2':'#3a4d5b';c.lineWidth=1.4;c.beginPath();c.roundRect(b.x,b.y,b.w,b.h,13);c.fill();c.stroke();c.restore();txt(c,l,b.x+b.w/2,b.y+b.h/2,on?'#fff':'#b8cad6',12,'center',on?800:600)});
  if(!clean)txt(c,CAPTION[S1.view],60,FY-6,'#e9f6ff',11.5,'left',700);
  if(!clean)paintPanel(c,p,g);c.restore();WK.transport(c,CLK)},
 // Pointer down: switches, buttons, the point P, or a slit.
 down(q0,p){if(window.PhysicaMode==='ultra'){if(!WK.transportHit(q0,CLK,p.lam/V,()=>{CLK.tau=0;CLK.lastT=null}))ORB={x:q0.x,y:q0.y,yaw:CAM.yaw,pitch:CAM.pitch};return}const q={x:q0.x-DX,y:q0.y},g=geom(p);if(WK.transportHit(q0,CLK,p.lam/V,()=>{CLK.tau=0;CLK.lastT=null;Object.assign(S1,{crest:true,trough:false,view:'after',path:true});p.ym=26;p.sep=20;p.lam=4;p.wid=2;p.L=100}))return;
  const vb=(S1.vb||[]).find(b=>q.x>=b.x&&q.x<=b.x+b.w&&q.y>=b.y&&q.y<=b.y+b.h);if(vb){S1.view=vb.k;return}
  const keys=['crest','trough','path'],i=(S1.hit||[]).findIndex(h=>q.x>=h.x&&q.x<=h.x+h.w&&q.y>=h.y&&q.y<=h.y+h.h);if(i>=0){S1[keys[i]]=!S1[keys[i]];return}
  if(Math.abs(q.x-g.XS)<28&&q.y>FY-6&&q.y<FB+6){S1.mode='P';this.move(q0,p);return}
  if(Math.abs(q.x-BX)<22&&q.y>FY-6&&q.y<FB+6){S1.mode='slit';this.move(q0,p)}},
 move(q0,p){if(window.PhysicaMode==='ultra'){if(ORB){CAM.yaw=clamp(ORB.yaw+(q0.x-ORB.x)*.006,-.95,.95);CAM.pitch=clamp(ORB.pitch+(q0.y-ORB.y)*.004,.25,1.2)}return}const q={x:q0.x-DX,y:q0.y};if(S1.mode==='P')p.ym=clamp(Math.round((CY-q.y)/SC*2)/2,-42,42);else if(S1.mode==='slit')p.sep=clamp(Math.round(Math.abs(q.y-CY)*2/SC*2)/2,8,40)},
 up(){S1.mode=null;ORB=null}};

PATCH[ID]={
 description:'Light passes through two narrow slits and the two waves meet on the screen. See the waves leave each slit, mark their crests, measure the path difference to a point P and watch bright and dark fringes form.',
 formula:'Δ = S₂P − S₁P ≈ d sin θ ;  bright: Δ = mλ ;  dark: Δ = (m + ½)λ ;  fringe width β = λL/d',
 observe:'Crests of the two waves arrive at P together when Δ is a whole number of wavelengths: bright. When one crest meets a trough, Δ is an odd number of half wavelengths: dark.',
 tryText:'Drag P to the first dark point (Δ = λ/2), then to the first bright point (Δ = λ). Now double d: what happens to the fringe width β?',
 controls:[R('lam','Wavelength λ',3,8,.1,4,'u',1),R('sep','Slit separation d',8,40,.5,20,'u',1),R('wid','Slit width a',0,10,.5,2,'u',1),R('L','Distance to the screen L',40,120,5,100,'u'),R('ym','Height Y of point P',-42,42,.5,26,'u',1)],
 metrics:p=>{const g=geom(p);return[N('Path difference Δ = S₂P − S₁P',f(g.delta,2)+' u = '+f(g.delta/p.lam,2)+' λ'),N('At point P',kind(p,g)),N('Angle θ of P',f(g.theta,1)+'°'),N('Fringe width β ≈ λL/d',f(p.lam*p.L/p.sep,1)+' u'),N('Central peak half-width (single slit)',p.wid>=.5?f(p.lam*p.L/p.wid,0)+' u':'—')]}};
(window.PhysicaFullStage=window.PhysicaFullStage||{})[ID]=(c,p,t)=>window.PhysicaMode==='ultra'?ultraScene(c,p,t):INT[ID].draw(c,p,t);
})();
