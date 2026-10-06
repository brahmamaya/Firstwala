/* Spherical mirrors, ray-diagram style (NCERT Class 12 ch. 9 Ray Optics; Class 10 Light).
   A true spherical mirror - an arc of a sphere of radius R = 2f centred at C, drawn to the same scale
   both ways - concave or convex, with an arrow, candle or tree as the object. Drag the object (left as far
   as infinity), its tip (height) or F; the three standard rays, the image and its nature update at once.
   Cartesian sign convention: light travels left to right, distances to the left of P are negative.
   The whole stage is drawn here (pure black, own panel), so it reads well on a classroom board. */
(() => {
'use strict';
const {R,S,N,f,clamp,pack}=window.PhysicaLab;
const {add,done}=pack();
const ID='spherical-mirrors',INF=46,TAU=Math.PI*2,TH=Math.tan(6*Math.PI/180);
const INT=window.PhysicaInteractive=window.PhysicaInteractive||{};
const COL={obj:'#3ee0cf',real:'#ffa94d',virt:'#c9a7ff',r1:'#ffd43b',r2:'#4dabf7',r3:'#ff6b81',axis:'#6f7b86',mark:'#ffd43b',text:'#f1f5f9',muted:'#9aa5b1'};

// ---------- the optics, in cm ----------
// a tall object is kept within the mirror's aperture so the ray parallel to the axis always reaches it
const maxH=F=>Math.floor(Math.min(2*F*10*Math.sin(55*Math.PI/180),196)/10*2)/2;
function solve(p){const cc=p.type!=='convex',F=p.f,fs=cc?-F:F,oInf=p.u>=INF,U=p.u,h=Math.min(p.h,maxH(F));
  let v,m,hi,real,iInf=false,obj,img,size;
  if(oInf){v=fs;hi=cc?-F*TH:F*TH;real=cc;m=0;obj='At infinity';img=cc?'At the focus F':'At F, behind the mirror';size='Highly diminished (point-sized)'}
  else{const u=-U;iInf=cc&&Math.abs(U-F)<1e-9;v=iInf?-Infinity:1/(1/fs-1/u);m=iInf?-Infinity:-v/u;hi=iInf?-Infinity:m*h;real=cc&&(U>F||iInf);
    const at=(a,b)=>Math.abs(a-b)<1e-9;
    if(!cc){obj='Between infinity and P';img='Between P and F, behind the mirror'}
    else if(iInf){obj='At the focus F';img='At infinity'}
    else if(U<F){obj='Between P and F';img='Behind the mirror'}
    else if(at(U,2*F)){obj='At the centre of curvature C';img='At C'}
    else if(U<2*F){obj='Between F and C';img='Beyond C'}
    else{obj='Beyond C';img='Between F and C'}
    size=iInf?'Highly magnified':at(Math.abs(m),1)?'Same size':Math.abs(m)>1?'Magnified':'Diminished'}
  return{cc,F,fs,U,h,oInf,iInf,v,m,hi,real,erect:!real,obj,img,size}}
const fmt=(x,d=1)=>(x>0?'+':'')+f(x,d);

// ---------- drawing helpers (no shadows or filters: cheap enough for a 4K board at 60 fps) ----------
function txt(c,s,x,y,col=COL.text,size=14,align='left',w=700){c.font=`${w} ${size}px system-ui, sans-serif`;c.textAlign=align;c.textBaseline='middle';c.fillStyle=col;c.fillText(s,x,y)}
function seg(c,a,b,col,w=2.6,dash,alpha=1){c.save();c.globalAlpha=alpha;c.strokeStyle=col;c.lineWidth=w;c.lineCap='round';if(dash)c.setLineDash(dash);c.beginPath();c.moveTo(a[0],a[1]);c.lineTo(b[0],b[1]);c.stroke();c.restore()}
function head(c,a,b,col,at=.5,size=9){const ang=Math.atan2(b[1]-a[1],b[0]-a[0]),x=a[0]+(b[0]-a[0])*at,y=a[1]+(b[1]-a[1])*at;c.save();c.fillStyle=col;c.translate(x,y);c.rotate(ang);c.beginPath();c.moveTo(size,0);c.lineTo(-size*.75,size*.62);c.lineTo(-size*.75,-size*.62);c.closePath();c.fill();c.restore()}
function chip(c,label,x,y,col){c.font='800 14px system-ui, sans-serif';const w=c.measureText(label).width+24;c.fillStyle='#0b0c0f';c.strokeStyle=col;c.lineWidth=1.8;c.beginPath();c.roundRect(x,y-13,w,26,13);c.fill();c.stroke();c.fillStyle=col;c.textAlign='left';c.textBaseline='middle';c.fillText(label,x+12,y);return w}
function wrapLines(c,str,maxW,size){c.font=`800 ${size}px system-ui, sans-serif`;const out=[];let row='';for(const word of String(str).split(' ')){const next=row?row+' '+word:word;if(c.measureText(next).width>maxW&&row){out.push(row);row=word}else row=next}if(row)out.push(row);return out}
// object shapes, 100 units tall, base at the origin, pointing up (-y); a negative height draws it inverted
function shape(c,kind,x,y0,hpx,col,alpha,t){if(!hpx)return;const k=Math.abs(hpx)/100;c.save();c.globalAlpha=alpha;c.translate(x,y0);c.scale(k,hpx<0?-k:k);
  if(kind==='candle'){c.fillStyle='#efe2c2';c.fillRect(-11,-66,22,66);c.fillStyle='rgba(0,0,0,.18)';c.fillRect(4,-66,7,66);c.strokeStyle='#3b3226';c.lineWidth=2;c.beginPath();c.moveTo(0,-66);c.lineTo(0,-74);c.stroke();
    const fl=1+.06*Math.sin(t*13)+.04*Math.sin(t*7.3);c.fillStyle='#ffb347';c.beginPath();c.ellipse(0,-86,8,15*fl,0,0,TAU);c.fill();c.fillStyle='#fff3b0';c.beginPath();c.ellipse(0,-83,4,8*fl,0,0,TAU);c.fill()}
  else if(kind==='tree'){c.fillStyle='#8a5a34';c.fillRect(-6,-42,12,42);c.fillStyle='#2f9e44';for(const [cx,cy,r] of[[0,-70,26],[-17,-55,18],[17,-55,18],[0,-90,14]]){c.beginPath();c.arc(cx,cy,r,0,TAU);c.fill()}c.fillStyle='rgba(255,255,255,.12)';c.beginPath();c.arc(-6,-78,10,0,TAU);c.fill()}
  else{c.strokeStyle=col;c.lineWidth=clamp(4.2/k,2.5,9);c.lineCap='round';c.beginPath();c.moveTo(0,0);c.lineTo(0,-82);c.stroke();c.fillStyle=col;c.beginPath();c.moveTo(0,-100);c.lineTo(-12,-78);c.lineTo(12,-78);c.closePath();c.fill()}
  c.restore()}

// ---------- the stage ----------
let G=null; // geometry of the last frame, for dragging
function stage(c,p,t){const clean=!!window.PhysicaClean,s=solve(p),{cc,F}=s,side=cc?-1:1;
  const L=16,RT=clean?944:700,TOP=56,BOT=486,X=clean?620:500,AX=268,SC=10,Rr=2*F*SC,Cx=X+side*Rr,Fx=X+side*F*SC;
  const Hm=Math.min(Rr*Math.sin(55*Math.PI/180),196),ang=Math.asin(Hm/Rr);
  c.save();c.fillStyle='#000';c.fillRect(0,0,960,505);
  c.save();c.beginPath();c.rect(L,TOP,RT-L,BOT-TOP);c.clip();
  // the sphere this mirror is cut from, faint, so its shape is plain to see
  c.save();c.globalAlpha=.22;c.strokeStyle='#9fb4c2';c.lineWidth=1.2;c.setLineDash([5,7]);c.beginPath();c.arc(Cx,AX,Rr,0,TAU);c.stroke();c.restore();
  const eA=[Cx-side*Rr*Math.cos(ang),AX-Hm];seg(c,[Cx,AX],eA,'#9fb4c2',1,[4,5],.45);
  txt(c,`R = 2f = ${2*F} cm`,clamp((Cx+eA[0])/2+(cc?-8:8),L+90,RT-90),(AX+eA[1])/2-10,COL.muted,12,cc?'right':'left',700);
  // principal axis
  seg(c,[L,AX],[RT,AX],COL.axis,1.4);
  // the mirror: a true circular arc, silvered on the reflecting side, hatched behind
  const arc=()=>{c.beginPath();cc?c.arc(Cx,AX,Rr,-ang,ang):c.arc(Cx,AX,Rr,Math.PI-ang,Math.PI+ang)};
  c.save();c.lineCap='round';c.strokeStyle='#5d6873';c.lineWidth=9;arc();c.stroke();c.strokeStyle='#e9eef2';c.lineWidth=4;arc();c.stroke();c.restore();
  c.save();c.strokeStyle='rgba(190,205,215,.5)';c.lineWidth=1.3;for(let a=-ang+.04;a<ang;a+=Math.max(.035,9/Rr)){const x0=Cx-side*Rr*Math.cos(a)+3,y0=AX+Rr*Math.sin(a);c.beginPath();c.moveTo(x0,y0);c.lineTo(x0+6,y0-6);c.stroke()}c.restore();
  // P, F, C
  const mark=(x,l)=>{if(x<L+6||x>RT-6){txt(c,`${l} ${x<L?'←':'→'}`,x<L?L+20:RT-20,AX+20,COL.mark,15,'center',800);return}c.fillStyle=COL.mark;c.beginPath();c.arc(x,AX,4.2,0,TAU);c.fill();txt(c,l,x,AX+21,COL.mark,17,'center',800)};
  mark(X,'P');mark(Fx,'F');mark(Cx,'C');
  if(Fx>L&&Fx<RT){c.save();c.strokeStyle=COL.mark;c.globalAlpha=.55;c.setLineDash([3,3]);c.lineWidth=1.4;c.beginPath();c.arc(Fx,AX,12,0,TAU);c.stroke();c.restore()}
  // where a line meets the mirror (the arc of the sphere)
  const hitArc=(A,d)=>{const ox=A[0]-Cx,oy=A[1]-AX,a=d[0]*d[0]+d[1]*d[1],b=2*(ox*d[0]+oy*d[1]),q=ox*ox+oy*oy-Rr*Rr,D=b*b-4*a*q;if(D<0)return null;const r=Math.sqrt(D),hs=[(-b-r)/(2*a),(-b+r)/(2*a)].filter(k=>k>0).map(k=>[A[0]+d[0]*k,A[1]+d[1]*k]).filter(h=>Math.abs(h[1]-AX)<=Hm+.5&&(cc?h[0]>=Cx:h[0]<=Cx));if(!hs.length)return null;return hs.sort((u,w)=>cc?w[0]-u[0]:u[0]-w[0])[0]};
  const edge=(P0,d)=>{let k=1e9;if(d[0]>0)k=Math.min(k,(RT-P0[0])/d[0]);if(d[0]<0)k=Math.min(k,(L-P0[0])/d[0]);if(d[1]>0)k=Math.min(k,(BOT-P0[1])/d[1]);if(d[1]<0)k=Math.min(k,(TOP-P0[1])/d[1]);return[P0[0]+d[0]*k,P0[1]+d[1]*k]};
  // object and image points
  const ox=s.oInf?null:X-s.U*SC,oy=s.oInf?null:AX-s.h*SC,O=s.oInf?null:[ox,oy];
  const ix=s.iInf?null:X+s.v*SC,iy=s.iInf?null:AX-s.hi*SC,I=s.iInf?null:[ix,iy];
  // the three standard rays: parallel to the axis, to the pole, through (or towards) F - or C when F cannot be used
  const rays=[],dirInf=[1,TH],Pp=[X,AX],Fp=[Fx,AX],Cp=[Cx,AX];
  const via=(Q,col)=>{let A,d;if(s.oInf){d=dirInf;A=[L,Q[1]-(Q[0]-L)*d[1]/d[0]]}else{d=[Q[0]-O[0],Q[1]-O[1]];if(Math.abs(d[0])<1)return false;if(d[0]<0)d=[-d[0],-d[1]];A=O}const n=Math.hypot(d[0],d[1]);d=[d[0]/n,d[1]/n];const H=hitArc(A,d);if(!H||(!s.oInf&&H[0]<=O[0]+2))return false;rays.push({A,H,col});return true};
  if(s.oInf){via(Pp,COL.r2);via(Fp,COL.r1)||via(Cp,COL.r1);via(Cp,COL.r3)}
  else{const H=hitArc(O,[1,0]);if(H)rays.push({A:O,H,col:COL.r1});via(Pp,COL.r2);via(Fp,COL.r3)||via(Cp,COL.r3)}
  const pulses=[];
  for(const {A,H,col} of rays){seg(c,A,H,col);head(c,A,H,col,.55);
    let d;if(s.iInf){const q=[X-ox,AX-oy];d=[-q[0],q[1]]}else if(s.real)d=[I[0]-H[0],I[1]-H[1]];else d=[H[0]-I[0],H[1]-I[1]];
    const n=Math.hypot(d[0],d[1])||1;d=[d[0]/n,d[1]/n];if(d[0]>0)d=[-d[0],-d[1]];const E=edge(H,d);seg(c,H,E,col);head(c,H,E,col,.45);
    if(!s.real&&!s.iInf){const B=edge(H,[-d[0],-d[1]]),far=Math.hypot(I[0]-H[0],I[1]-H[1])<Math.hypot(B[0]-H[0],B[1]-H[1])?I:B;seg(c,H,far,col,1.8,[7,6],.85)}
    pulses.push([A,H,E,col])}
  // light pulses travel along the rays while the simulation plays
  for(const [A,H,E,col] of pulses){const l1=Math.hypot(H[0]-A[0],H[1]-A[1]),l2=Math.hypot(E[0]-H[0],E[1]-H[1]),LL=l1+l2;if(LL<1)continue;for(let k=0;k<2;k++){const dd=((t*150+k*LL/2)%LL+LL)%LL,Q=dd<l1?[A[0]+(H[0]-A[0])*dd/l1,A[1]+(H[1]-A[1])*dd/l1]:[H[0]+(E[0]-H[0])*(dd-l1)/l2,H[1]+(E[1]-H[1])*(dd-l1)/l2];c.fillStyle=col;c.globalAlpha=.25;c.beginPath();c.arc(Q[0],Q[1],8,0,TAU);c.fill();c.globalAlpha=1;c.beginPath();c.arc(Q[0],Q[1],3.6,0,TAU);c.fill()}}
  // object
  if(s.oInf){txt(c,'Object at infinity',L+8,TOP+56,COL.obj,15,'left',800);txt(c,'(its rays arrive parallel)',L+8,TOP+76,COL.muted,13,'left',600)}
  else{shape(c,p.obj,ox,AX,s.h*SC,COL.obj,1,t);txt(c,'Object',ox,oy-(p.obj==='arrow'?14:18),COL.obj,15,'center',800);
    c.save();c.strokeStyle=COL.obj;c.setLineDash([3,3]);c.lineWidth=1.6;c.globalAlpha=.8;c.beginPath();c.arc(ox,AX,11,0,TAU);c.stroke();c.beginPath();c.arc(ox,oy,8,0,TAU);c.stroke();c.restore()}
  // image
  if(s.iInf)txt(c,'Reflected rays are parallel → the image is at infinity',(L+X)/2,TOP+18,COL.real,15,'center',800);
  else{const col=s.real?COL.real:COL.virt;
    if(ix>=L&&ix<=RT){const hp=s.hi*SC;if(Math.abs(hp)<3){c.fillStyle=col;c.beginPath();c.arc(ix,AX,4.5,0,TAU);c.fill()}else shape(c,p.obj,ix,AX,hp,col,s.real?1:.55,t);
      if(!s.real){c.save();c.strokeStyle=col;c.setLineDash([5,5]);c.lineWidth=1.6;c.beginPath();c.moveTo(ix,AX);c.lineTo(ix,clamp(iy,TOP,BOT));c.stroke();c.restore()}
      const ly=hp>=0?clamp(iy-18,TOP+12,BOT-70):clamp(iy+18,TOP+12,BOT-70);txt(c,s.real?'Real image':'Virtual image',clamp(ix,L+60,RT-60),ly,col,15,'center',800);
      if(iy<TOP||iy>BOT)txt(c,'(taller than the view)',ix,ly+(hp>=0?18:-18),col,12,'center',600)}
    else txt(c,`Image far ${ix<L?'to the left':'behind'}: v = ${fmt(s.v)} cm ${ix<L?'←':'→'}`,ix<L?L+170:RT-170,AX-40,col,14,'center',800)}
  // u and v along the bottom
  const dim=(x0,x1,y,label,col)=>{const a=clamp(x0,L,RT),b=clamp(x1,L,RT);if(Math.abs(b-a)<6)return;seg(c,[a,y],[b,y],col,1.2,[3,3]);for(const x of[a,b])seg(c,[x,y-5],[x,y+5],col,1.2);txt(c,label,(a+b)/2,y-11,col,14,'center',800)};
  if(!s.oInf)dim(ox,X,BOT-46,`u = ${fmt(-s.U)} cm`,COL.obj);else txt(c,'u = −∞',L+40,BOT-57,COL.obj,14,'center',800);
  if(!s.iInf)dim(X,ix,BOT-16,`v = ${fmt(s.v)} cm`,s.real?COL.real:COL.virt);else txt(c,'v = ∞',L+40,BOT-27,COL.real,14,'center',800);
  c.restore();
  // heading and nature chips
  txt(c,`${cc?'CONCAVE':'CONVEX'} SPHERICAL MIRROR`,24,24,COL.text,17,'left',800);
  txt(c,`f = ${fmt(s.fs,0)} cm   ·   R = ${fmt(2*s.fs,0)} cm`,24,44,COL.muted,13,'left',700);
  const chips=s.iInf?[['REAL',COL.real],['INVERTED',COL.real],['AT INFINITY',COL.real]]:[[s.real?'REAL':'VIRTUAL',s.real?COL.real:COL.virt],[s.erect?'ERECT':'INVERTED',s.erect?COL.obj:COL.real],[s.size.split(' (')[0].toUpperCase(),'#ffd43b']];
  c.font='800 14px system-ui, sans-serif';const ws=chips.map(([l])=>c.measureText(l).width+24),total=ws.reduce((a,b)=>a+b+8,-8);let cx=clean?330:RT-8-total;
  for(const [l,col] of chips)cx+=chip(c,l,cx,30,col)+8;
  if(!clean)panel(c,s);
  c.restore();
  G={X,AX,SC,Fx,L,RT,TOP,BOT,cc}}

function panel(c,s){const x=716,y=56,w=228,h=430;c.fillStyle='#0b0c0f';c.strokeStyle='#23262c';c.lineWidth=1.2;c.beginPath();c.roundRect(x,y,w,h,12);c.fill();c.stroke();
  let yy=y+24;const lines=(str,col,sz,wt=800,gap=4)=>{for(const line of wrapLines(c,str,w-32,sz)){txt(c,line,x+16,yy,col,sz,'left',wt);yy+=sz+gap}};
  const row=(k,v,col=COL.text,sz=16)=>{txt(c,k,x+16,yy,COL.muted,12,'left',700);yy+=18;lines(v,col,sz);yy+=6};
  txt(c,'IMAGE',x+16,yy,'#ffd43b',13,'left',900);yy+=24;
  row('Position',s.img);
  row('Image distance',s.iInf?'v = ∞':`v = ${fmt(s.v,2)} cm`,s.real?COL.real:COL.virt);
  row('Magnification',s.iInf?'m = ∞ (very large)':s.oInf?'m ≈ 0 (point-sized)':`m = ${fmt(s.m,2)}`);
  row('Nature',`${s.real?'Real · inverted':'Virtual · erect'} · ${s.size.split(' (')[0].toLowerCase()}`,s.real?COL.real:COL.virt);yy-=4;
  lines(s.iInf?'Reflected rays come out parallel: they meet only at infinity (a real, inverted image very far away).':s.real?'Reflected rays really meet: the image can be caught on a screen.':'Reflected rays only seem to come from behind the mirror: it cannot be caught on a screen.',COL.muted,12,600,4);yy+=10;
  row('Size',s.size+(s.oInf||s.iInf||s.size.startsWith('Same')?'':` · ${f(Math.abs(s.m),2)}× the object`),'#ffd43b',15);
  c.strokeStyle='#23262c';c.beginPath();c.moveTo(x+16,yy-6);c.lineTo(x+w-16,yy-6);c.stroke();yy+=12;
  txt(c,'OBJECT',x+16,yy,COL.obj,13,'left',900);yy+=22;
  txt(c,s.oInf?'u = −∞':`u = ${fmt(-s.U)} cm`,x+16,yy,COL.text,15,'left',800);yy+=20;lines(s.obj,COL.muted,13,700);
  if(yy<y+h-26)txt(c,'1/v + 1/u = 1/f   ·   m = −v/u',x+w/2,y+h-16,COL.muted,12,'center',700)}

// whole-stage experiments draw their own frame (enhancements.js and focus.js hand them the canvas)
(window.PhysicaFullStage=window.PhysicaFullStage||{})[ID]=stage;

// hands-on: drag the object along the axis (to the far left = infinity), its tip (height) or F
let grab=null;
INT[ID]={draw:stage,
  down(q,p){if(!G)return;const s=solve(p),ox=s.oInf?G.L+30:G.X-s.U*G.SC,oy=G.AX-s.h*G.SC;
    grab=Math.hypot(q.x-G.Fx,q.y-G.AX)<18?'f':!s.oInf&&Math.hypot(q.x-ox,q.y-oy)<16?'h':Math.abs(q.x-ox)<34&&q.y>G.TOP&&q.y<G.BOT?'u':null;this.move(q,p)},
  move(q,p){if(!G||!grab)return;if(grab==='u'){const u=Math.round((G.X-q.x)/G.SC*2)/2;p.u=u>=45.5?INF:clamp(u,2,45)}
    else if(grab==='h')p.h=clamp(Math.round((G.AX-q.y)/G.SC*2)/2,1,10);
    else{const d=G.cc?G.X-q.x:q.x-G.X;p.f=clamp(Math.round(d/G.SC),5,20)}},
  up(){grab=null}};

const uCtl=R('u','Object distance |u|',2,INF,.5,30,'cm',1);uCtl.show=v=>v>=INF?'∞ (infinity)':`${f(v,1)} cm`;
add({base:'lens',id:ID,title:'Spherical mirrors: ray diagram',
  description:'Concave and convex spherical mirrors: move the object - even to infinity - and see where the image forms and whether it is real or virtual, erect or inverted, magnified or diminished.',
  formula:'1/v + 1/u = 1/f  ·  m = −v/u  ·  f = R/2',
  observe:'A concave mirror gives a real, inverted image until the object comes inside F; then the image is virtual, erect and magnified. A convex mirror always gives a virtual, erect, diminished image between P and F.',
  tryText:'Concave: drag the object from infinity towards the mirror and watch the image travel from F past C to infinity, then appear behind the mirror.',
  controls:[S('type','Mirror','concave',[['concave','Concave'],['convex','Convex']]),S('obj','Object','arrow',[['arrow','Arrow'],['candle','Candle'],['tree','Tree']]),uCtl,R('f','Focal length |f|',5,20,1,12,'cm'),R('h','Object height',1,10,.5,5,'cm',1)],
  metrics:p=>{const s=solve(p);return[N('Image position',s.img),N('Image distance v',s.iInf?'∞':`${fmt(s.v,2)} cm`),N('Magnification m',s.iInf?'∞':s.oInf?'≈ 0':f(s.m,2)),N('Nature',s.real?'Real':'Virtual'),N('Orientation',s.erect?'Erect':'Inverted'),N('Size',s.size.startsWith('Same')?s.size:s.size.replace(/^(\S+)/,'$1')+(s.oInf||s.iInf?'':` (${f(Math.abs(s.m),2)}× the object)`))]},
  assumption:'Paraxial rays: the reflected rays are drawn through the image given by the mirror formula, as in textbook ray diagrams. Cartesian sign convention, distances from the pole P.',
  presets:[['Concave · object at infinity',{type:'concave',u:INF,f:12}],['Concave · object beyond C',{type:'concave',u:34,f:12}],['Concave · object at C',{type:'concave',u:24,f:12}],['Concave · object between C and F',{type:'concave',u:18,f:12}],['Concave · object at F (image at infinity)',{type:'concave',u:12,f:12}],['Concave · object between P and F',{type:'concave',u:7,f:12}],['Convex · object at infinity',{type:'convex',u:INF,f:12}],['Convex · object in front',{type:'convex',u:24,f:12}]],
  draw:stage,flat:true});
done();
})();
