/* Spherical mirrors, ray-diagram style (NCERT Class 12, ch. 9 Ray Optics; also Class 10 Light).
   Concave or convex: drag the object (or the focus F) and the three standard rays, the image and its nature
   update at once. Cartesian sign convention: light travels left to right, distances to the left are negative. */
(() => {
'use strict';
const {R,S,N,f,clamp,pack}=window.PhysicaLab;
const {add,done}=pack();
const INT=window.PhysicaInteractive=window.PhysicaInteractive||{};
const TAU=Math.PI*2;
// stage geometry (the experiment area is x 28-668, y 76-421)
const X=452,AX=242,PPC=7,VS=21,L=30,RT=666,TOP=80,BOT=400,SAG=12,HM=128;
const COL={obj:'#42d9ca',real:'#ffa94d',virt:'#c4a3ff',r1:'#ffd43b',r2:'#4dabf7',r3:'#ff6b81',axis:'#8ca6b9',mark:'#ffd43b'};

function txt(c,s,x,y,col='#e9f6ff',size=12,align='left',w=700){c.save();c.font=`${w} ${size}px system-ui, sans-serif`;c.textAlign=align;c.textBaseline='middle';c.lineWidth=3;c.strokeStyle='#081624cc';c.strokeText(s,x,y);c.fillStyle=col;c.fillText(s,x,y);c.restore()}
function seg(c,a,b,col,w=2,dash){c.save();c.strokeStyle=col;c.lineWidth=w;c.lineCap='round';if(dash)c.setLineDash(dash);c.beginPath();c.moveTo(a[0],a[1]);c.lineTo(b[0],b[1]);c.stroke();c.restore()}
function head(c,a,b,col,size=8){const ang=Math.atan2(b[1]-a[1],b[0]-a[0]),m=[(a[0]+b[0])/2,(a[1]+b[1])/2];c.save();c.fillStyle=col;c.translate(m[0],m[1]);c.rotate(ang);c.beginPath();c.moveTo(size,0);c.lineTo(-size*.7,size*.6);c.lineTo(-size*.7,-size*.6);c.closePath();c.fill();c.restore()}
// where a ray from p along d leaves the drawing area
function toEdge(p,d){let s=1e9;if(d[0]>0)s=Math.min(s,(RT-p[0])/d[0]);if(d[0]<0)s=Math.min(s,(L-p[0])/d[0]);if(d[1]>0)s=Math.min(s,(BOT-p[1])/d[1]);if(d[1]<0)s=Math.min(s,(TOP-p[1])/d[1]);return[p[0]+d[0]*s,p[1]+d[1]*s]}
function arrow(c,x,y0,y1,col,dash,w=3.2){const up=y1<y0;seg(c,[x,y0],[x,y1+(up?7:-7)],col,w,dash);c.save();c.fillStyle=col;c.beginPath();c.moveTo(x,y1);c.lineTo(x-7,y1+(up?12:-12));c.lineTo(x+7,y1+(up?12:-12));c.closePath();c.fill();c.restore()}

// the optics, in cm (u, v, f signed; U, F magnitudes)
function solve(p){const cc=p.type!=='convex',U=p.u,F=p.f,fs=cc?-F:F,u=-U,inf=cc&&Math.abs(U-F)<1e-9;
  const v=inf?-Infinity:1/(1/fs-1/u),m=inf?-Infinity:-v/u,real=cc&&U>F,hi=m*p.h;
  const at=(a,b)=>Math.abs(a-b)<1e-9;let obj,img;
  if(!cc){obj='In front of the mirror';img='Behind it, between P and F'}
  else if(inf){obj='At the focus F';img='At infinity'}
  else if(U<F){obj='Between P and F';img='Behind the mirror'}
  else if(at(U,2*F)){obj='At the centre of curvature C';img='At C'}
  else if(U<2*F){obj='Between F and C';img='Beyond C'}
  else{obj='Beyond C';img='Between F and C'}
  const size=inf?'Highly magnified':Math.abs(Math.abs(m)-1)<1e-9?'Same size':Math.abs(m)>1?'Magnified':'Diminished';
  return{cc,U,F,fs,u,v,m,inf,real,hi,obj,img,size,erect:!real&&!inf};}

function draw(c,p,t){const s=solve(p),{cc,U,F}=s,
    // heights are drawn larger than the distances (as in textbook diagrams); a big image shrinks the vertical scale so it fits
    vs=s.inf?VS:Math.max(7,Math.min(VS,104/Math.max(p.h,Math.abs(s.hi)))),ox=X-U*PPC,oy=AX-p.h*vs,O=[ox,oy];
  // principal axis and the mirror
  seg(c,[L,AX],[RT,AX],COL.axis,1.2);
  const curveX=y=>{const k=(y-AX)/HM;return cc?X-SAG*k*k:X+SAG*k*k};
  c.save();const g=c.createLinearGradient(X-14,0,X+14,0);g.addColorStop(0,'#ffffff');g.addColorStop(.45,'#c9d3da');g.addColorStop(1,'#5c6770');c.strokeStyle=g;c.lineWidth=5;c.shadowColor='rgba(200,230,255,.45)';c.shadowBlur=8;c.beginPath();for(let y=AX-HM;y<=AX+HM;y+=4){const x=curveX(y);y===AX-HM?c.moveTo(x,y):c.lineTo(x,y)}c.stroke();c.restore();
  c.save();c.strokeStyle='rgba(200,215,225,.45)';c.lineWidth=1.2;for(let y=AX-HM+6;y<AX+HM;y+=12){const x=curveX(y)+3;c.beginPath();c.moveTo(x,y);c.lineTo(x+9,y-7);c.stroke()}c.restore();
  // P, F, C on the axis (behind the mirror for a convex one)
  const side=cc?-1:1,Fx=X+side*F*PPC,Cx=X+side*2*F*PPC;
  const mark=(x,l)=>{if(x<L+4||x>RT-4){txt(c,`${l} ${x<L?'←':'→'}`,x<L?L+16:RT-16,AX+16,COL.mark,12,'center');return}c.fillStyle=COL.mark;c.beginPath();c.arc(x,AX,3.6,0,TAU);c.fill();txt(c,l,x,AX+17,COL.mark,14,'center',800)};
  mark(X,'P');mark(Fx,'F');mark(Cx,'C');if(Fx>L&&Fx<RT){c.save();c.strokeStyle=COL.mark;c.globalAlpha=.6;c.setLineDash([3,3]);c.lineWidth=1.3;c.beginPath();c.arc(Fx,AX,10,0,TAU);c.stroke();c.restore()}
  // image point (paraxial), clipped later for drawing
  const ix=s.inf?null:X+s.v*PPC,iy=s.inf?null:AX-s.hi*vs,I=s.inf?null:[ix,iy];
  // the three standard rays: parallel to the axis, to the pole, and through (or towards) F - or C when F is in line
  const hitOn=(a,b)=>{let y=AX;for(let k=0;k<4;k++){const x=curveX(y),tt=(x-a[0])/(b[0]-a[0]);y=a[1]+(b[1]-a[1])*tt}return[curveX(y),y]};
  const rays=[];const add3=(H,col,name)=>{if(H&&Math.abs(H[1]-AX)<=HM&&H[0]>ox+2){rays.push({H,col,name});return true}return false};
  add3([curveX(oy),oy],COL.r1,'parallel');add3([X,AX],COL.r2,'pole');
  if(!(Math.abs(Fx-ox)>2&&add3(hitOn(O,[Fx,AX]),COL.r3,'F'))&&Math.abs(Cx-ox)>2)add3(hitOn(O,[Cx,AX]),COL.r3,'C');
  const pulses=[];
  for(const r of rays){const H=r.H;seg(c,O,H,r.col,2.2);head(c,O,H,r.col);
    let d;if(s.inf)d=[ox-X,AX-oy];else if(s.real)d=[I[0]-H[0],I[1]-H[1]];else d=[H[0]-I[0],H[1]-I[1]];
    const n=Math.hypot(d[0],d[1])||1;d=[d[0]/n,d[1]/n];if(d[0]>0)d=[-d[0],-d[1]];const E=toEdge(H,d);
    seg(c,H,E,r.col,2.2);head(c,H,E,r.col);
    if(!s.real&&!s.inf){const B=toEdge(H,[-d[0],-d[1]]),far=Math.hypot(I[0]-H[0],I[1]-H[1])<Math.hypot(B[0]-H[0],B[1]-H[1])?I:B;seg(c,H,far,r.col,1.4,[6,5])}
    pulses.push([O,H,E,r.col])}
  // light pulses travelling along the rays
  for(const [A,B,E,col] of pulses){const l1=Math.hypot(B[0]-A[0],B[1]-A[1]),l2=Math.hypot(E[0]-B[0],E[1]-B[1]),L2=l1+l2;for(let k=0;k<2;k++){const d=((t*140+k*L2/2)%L2+L2)%L2,P=d<l1?[A[0]+(B[0]-A[0])*d/l1,A[1]+(B[1]-A[1])*d/l1]:[B[0]+(E[0]-B[0])*(d-l1)/l2,B[1]+(E[1]-B[1])*(d-l1)/l2];c.save();c.fillStyle=col;c.shadowColor=col;c.shadowBlur=10;c.beginPath();c.arc(P[0],P[1],3.2,0,TAU);c.fill();c.restore()}}
  // object
  arrow(c,ox,AX,oy,COL.obj);txt(c,'Object',ox,oy-14,COL.obj,13,'center',800);
  c.save();c.strokeStyle=COL.obj;c.setLineDash([3,3]);c.lineWidth=1.5;c.beginPath();c.arc(ox,AX,10,0,TAU);c.stroke();c.restore();
  // image
  if(s.inf)txt(c,'Reflected rays are parallel → image at infinity',L+150,TOP+38,COL.real,13,'center',800);
  else{const col=s.real?COL.real:COL.virt,inside=ix>=L+4&&ix<=RT-4,top=clamp(iy,TOP+50,BOT-30);
    if(inside){arrow(c,ix,AX,top,col,s.real?null:[7,5]);if(top!==iy)txt(c,'↕ taller than the view',ix,top+(iy<AX?14:-14),col,11,'center');iy<AX?txt(c,s.real?'Real image':'Virtual image',ix,top-14,col,13,'center',800):txt(c,s.real?'Real image':'Virtual image',ix+10,top-4,col,13,'left',800)}
    else txt(c,`Image ${ix<L?'far to the left':'far behind'} (v = ${f(s.v,1)} cm) ${ix<L?'←':'→'}`,ix<L?L+130:RT-130,AX-46,col,12,'center',800)}
  // distances along the axis
  const dim=(x0,x1,y,label,col)=>{if(Math.abs(x1-x0)<8)return;const a=clamp(x0,L,RT),b=clamp(x1,L,RT);seg(c,[a,y],[b,y],col,1,[2,3]);for(const x of[a,b])seg(c,[x,y-4],[x,y+4],col,1);txt(c,label,(a+b)/2,y-9,col,12,'center',700)};
  dim(ox,X,BOT-22,`u = ${f(s.u,1)} cm`,COL.obj);if(!s.inf)dim(X,ix,BOT-2,`v = ${s.v>0?'+':''}${f(s.v,1)} cm`,s.real?COL.real:COL.virt);
  // case and nature, large enough for a classroom board
  txt(c,`${cc?'Concave':'Convex'} mirror · f = ${s.fs>0?'+':''}${f(s.fs,1)} cm`,L+6,TOP+4,'#e9f6ff',14,'left',800);
  txt(c,`Object: ${s.obj}  →  Image: ${s.img}`,L+6,TOP+24,'#cfe3f0',12,'left',700);
  const chips=s.inf?[['REAL',COL.real],['INVERTED',COL.real],['HIGHLY MAGNIFIED',COL.real]]:[[s.real?'REAL':'VIRTUAL',s.real?COL.real:COL.virt],[s.erect?'ERECT':'INVERTED',s.erect?COL.obj:COL.real],[s.size.toUpperCase(),'#ffd43b']];
  c.save();c.font='800 13px system-ui, sans-serif';const ws=chips.map(([l])=>c.measureText(l).width+22);c.restore();let cx=RT-4-ws.reduce((a,b)=>a+b+8,-8);chips.forEach(([label,col],i)=>{const w=ws[i];c.save();c.font='800 13px system-ui, sans-serif';c.fillStyle='rgba(8,22,36,.85)';c.strokeStyle=col;c.lineWidth=1.6;c.beginPath();c.roundRect(cx,TOP-2,w,24,12);c.fill();c.stroke();c.fillStyle=col;c.textBaseline='middle';c.fillText(label,cx+11,TOP+10);c.restore();cx+=w+8});
  }
// hands-on: drag the object (or the focus F) straight on the stage
let grab=null;
INT['spherical-mirrors']={draw,
  down(q,p){const cc=p.type!=='convex',Fx=X+(cc?-1:1)*p.f*PPC,ox=X-p.u*PPC;grab=Math.hypot(q.x-Fx,q.y-AX)<16?'f':Math.abs(q.x-ox)<30&&q.y>TOP&&q.y<BOT?'u':null;this.move(q,p)},
  move(q,p){if(grab==='u')p.u=clamp(Math.round((X-q.x)/PPC*2)/2,4,60);else if(grab==='f'){const cc=p.type!=='convex';p.f=clamp(Math.round((cc?X-q.x:q.x-X)/PPC),5,25)}},
  up(){grab=null}};

add({base:'lens',id:'spherical-mirrors',title:'Spherical mirrors: ray diagram',
  description:'Concave and convex mirrors: move the object and watch the image move - its position, and whether it is real or virtual, erect or inverted, magnified or diminished.',
  formula:'1/v + 1/u = 1/f  ·  m = −v/u  ·  f = R/2',
  observe:'A concave mirror forms a real, inverted image until the object comes inside F; then the image is virtual, erect and magnified. A convex mirror always forms a virtual, erect, diminished image between P and F.',
  tryText:'Concave: slide the object from far away towards the mirror and watch the image cross C, run off to infinity at F, then jump behind the mirror.',
  controls:[S('type','Mirror','concave',[['concave','Concave'],['convex','Convex']]),R('u','Object distance |u|',4,60,.5,36,'cm',1),R('f','Focal length |f|',5,25,1,12,'cm'),R('h','Object height',1,4,.5,3,'cm',1)],
  metrics:p=>{const s=solve(p);return[N('Image position',s.img),N('Image distance v',s.inf?'∞':`${s.v>0?'+':''}${f(s.v,2)} cm`),N('Magnification m',s.inf?'∞':f(s.m,2)),N('Nature',s.inf?'Real (at infinity)':s.real?'Real':'Virtual'),N('Orientation',s.erect?'Erect':'Inverted'),N('Size',s.size)]},
  assumption:'Paraxial rays (small aperture). Cartesian sign convention: distances measured from the pole P, positive in the direction of the incident light (to the right).',
  presets:[['Concave · object beyond C',{type:'concave',u:36,f:12}],['Concave · object at C',{type:'concave',u:24,f:12}],['Concave · object between C and F',{type:'concave',u:18,f:12}],['Concave · object at F',{type:'concave',u:12,f:12}],['Concave · object between P and F',{type:'concave',u:7,f:12}],['Convex mirror',{type:'convex',u:24,f:12}]],
  draw,flat:true});
done();
})();
