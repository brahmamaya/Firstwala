/* Hands-on Ray Optics (NCERT Class 12, ch. 9): an optical bench with glass lenses, a silvered mirror, a candle,
   a laser pointer, a glass slab, prism and fibre. Drag things on the stage; rays are traced from the real formulas. */
(() => {
'use strict';
const {f}=window.PhysicaLab;
const INT=window.PhysicaInteractive=window.PhysicaInteractive||{};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),rad=d=>d*Math.PI/180,deg=r=>r*180/Math.PI,TAU=Math.PI*2;
// ---------- realistic parts ----------
function txt(c,s,x,y,col='#e9f6ff',size=11,align='left',w=600){c.save();c.font=`${w} ${size}px system-ui, sans-serif`;c.fillStyle=col;c.textAlign=align;c.textBaseline='middle';c.fillText(s,x,y);c.restore()}
function hint(c,s){txt(c,s,40,108,'#8ca6b9',11,'left',600)}
function metal(c,x,y,w,h,dark){const g=c.createLinearGradient(0,y,0,y+h);(dark?['#9aa6ae','#626e77','#3d464d']:['#f4f7f9','#b9c3ca','#7c8890']).forEach((k,i)=>g.addColorStop(i/2,k));c.save();c.shadowColor='rgba(0,0,0,.45)';c.shadowBlur=8;c.shadowOffsetY=4;c.fillStyle=g;c.beginPath();c.roundRect(x,y,w,h,3);c.fill();c.restore()}
function bench(c,x0,x1,y,zeroX,ppc){metal(c,x0,y,x1-x0,14);for(let cm=-200;cm<=200;cm++){const x=zeroX+cm*ppc;if(x<x0+2||x>x1-2)continue;const L=cm%10===0?7:cm%5===0?5:3;if(ppc>=2.5||cm%5===0){c.strokeStyle='#14181d';c.lineWidth=.8;c.beginPath();c.moveTo(x,y+1);c.lineTo(x,y+1+L);c.stroke()}if(cm%10===0)txt(c,String(Math.abs(cm)),x,y+11,'#14181d',7.5,'center',700)}metal(c,x0+6,y+14,10,18,true);metal(c,x1-16,y+14,10,18,true)}
function post(c,x,top,y){metal(c,x-3,top,6,y-top);metal(c,x-12,y-6,24,8,true)}
function lens(c,x,cy,h,k){/* k>0 convex thickness, k<0 concave */const g=c.createLinearGradient(x-16,0,x+16,0);g.addColorStop(0,'rgba(140,200,240,.25)');g.addColorStop(.45,'rgba(225,245,255,.55)');g.addColorStop(1,'rgba(120,180,225,.3)');c.save();c.beginPath();
  if(k>=0){c.moveTo(x,cy-h);c.quadraticCurveTo(x+k*2,cy,x,cy+h);c.quadraticCurveTo(x-k*2,cy,x,cy-h)}else{const e=-k;c.moveTo(x-e-3,cy-h);c.lineTo(x+e+3,cy-h);c.quadraticCurveTo(x+2,cy,x+e+3,cy+h);c.lineTo(x-e-3,cy+h);c.quadraticCurveTo(x-2,cy,x-e-3,cy-h)}c.closePath();c.fillStyle=g;c.shadowColor='rgba(120,200,255,.5)';c.shadowBlur=10;c.fill();c.shadowColor='transparent';c.strokeStyle='rgba(220,245,255,.85)';c.lineWidth=1.3;c.stroke();
  c.strokeStyle='rgba(255,255,255,.7)';c.lineWidth=2;c.beginPath();c.moveTo(x-1,cy-h*.75);c.quadraticCurveTo(x+Math.max(2,Math.abs(k))*.8,cy-h*.35,x,cy-h*.1);c.stroke();c.restore();metal(c,x-8,cy+h,16,6,true)}
function candle(c,x,base,h,scale=1,ghost=false,t=0){c.save();if(ghost){c.globalAlpha=.5;c.setLineDash([3,3])}c.translate(x,base);c.scale(Math.abs(scale)<.02?.02:1,1);const s=scale;const H=h*s,w=Math.max(3,8*Math.min(2.5,Math.abs(s)));
  const wg=c.createLinearGradient(-w/2,0,w/2,0);wg.addColorStop(0,'#e9d7b0');wg.addColorStop(.5,'#fff8e1');wg.addColorStop(1,'#cdb88b');c.fillStyle=wg;c.fillRect(-w/2,0,w,-H*.72);if(ghost){c.strokeStyle='#fff3bf';c.strokeRect(-w/2,0,w,-H*.72)}
  const fy=-H*.72,fl=H*.28*(1+.06*Math.sin(t*9)),fg=c.createRadialGradient(0,fy-fl*.35,1,0,fy-fl*.4,Math.abs(fl)*.7+1);fg.addColorStop(0,'#fffbe6');fg.addColorStop(.4,'#ffd43b');fg.addColorStop(1,'rgba(255,120,0,0)');c.fillStyle=fg;c.beginPath();c.ellipse(0,fy-fl*.45,Math.abs(w)*.55,Math.abs(fl)*.55,0,0,TAU);c.fill();c.restore()}
function ray(c,pts,col='#ff6b6b',w=1.6,dash){c.save();c.strokeStyle=col;c.lineWidth=w;c.shadowColor=col;c.shadowBlur=6;if(dash)c.setLineDash(dash);c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();c.setLineDash([]);
  for(let i=1;i<pts.length;i++){const [x0,y0]=pts[i-1],[x1,y1]=pts[i],L=Math.hypot(x1-x0,y1-y0);if(L<26)continue;const a=Math.atan2(y1-y0,x1-x0),mx=(x0+x1)/2,my=(y0+y1)/2;c.fillStyle=col;c.beginPath();c.moveTo(mx+6*Math.cos(a),my+6*Math.sin(a));c.lineTo(mx-5*Math.cos(a-.5),my-5*Math.sin(a-.5));c.lineTo(mx-5*Math.cos(a+.5),my-5*Math.sin(a+.5));c.fill()}c.restore()}
function laser(c,x,y,a){c.save();c.translate(x,y);c.rotate(a);const g=c.createLinearGradient(0,-6,0,6);g.addColorStop(0,'#868e96');g.addColorStop(.5,'#e9ecef');g.addColorStop(1,'#495057');c.shadowColor='rgba(0,0,0,.5)';c.shadowBlur=8;c.fillStyle=g;c.beginPath();c.roundRect(-58,-6,58,12,4);c.fill();c.shadowColor='transparent';c.fillStyle='#c92a2a';c.fillRect(-40,-7,8,3);c.fillStyle='#ff6b6b';c.beginPath();c.arc(0,0,2.5,0,TAU);c.fill();c.restore()}
function glass(c,pts,tint='rgba(170,220,255,.28)'){c.save();c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();const xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]),g=c.createLinearGradient(Math.min(...xs),Math.min(...ys),Math.max(...xs),Math.max(...ys));g.addColorStop(0,'rgba(235,250,255,.5)');g.addColorStop(.5,tint);g.addColorStop(1,'rgba(120,180,225,.35)');c.fillStyle=g;c.shadowColor='rgba(120,200,255,.35)';c.shadowBlur=12;c.fill();c.shadowColor='transparent';c.strokeStyle='rgba(220,245,255,.85)';c.lineWidth=1.4;c.stroke();c.restore()}
function protractor(c,x,y,r){c.save();c.strokeStyle='rgba(233,246,255,.25)';c.setLineDash([4,4]);c.beginPath();c.moveTo(x,y-r);c.lineTo(x,y+r);c.stroke();c.setLineDash([]);for(let a=-80;a<=80;a+=10){const t=rad(a);c.beginPath();c.moveTo(x+Math.sin(t)*(r-6),y-Math.cos(t)*(r-6));c.lineTo(x+Math.sin(t)*r,y-Math.cos(t)*r);c.moveTo(x+Math.sin(t)*(r-6),y+Math.cos(t)*(r-6));c.lineTo(x+Math.sin(t)*r,y+Math.cos(t)*r);c.stroke()}c.restore()}
function dragDot(c,x,y,label){c.save();c.strokeStyle='#42d9ca';c.setLineDash([3,3]);c.lineWidth=1.5;c.beginPath();c.arc(x,y,11,0,TAU);c.stroke();c.restore();if(label)txt(c,label,x,y-18,'#42d9ca',10,'center',700)}
const panel=(c,lines)=>{c.save();c.fillStyle='#0b1a26e6';c.strokeStyle='#29475b';c.beginPath();c.roundRect(470,336,190,62,8);c.fill();c.stroke();c.restore();lines.forEach((l,i)=>txt(c,l,480,350+i*15,i?'#8ca6b9':'#e9f6ff',i?10:13,'left',i?600:700))};
// simple drag registry: each sim gets {draw, grab(q,p)->mode, drag(q,p,mode)}
function make(id,draw,grab,drag){let mode=null;INT[id]={draw,down(q,p){mode=grab(q,p)||null;if(mode)drag(q,p,mode)},move(q,p){if(mode)drag(q,p,mode)},up(){mode=null}}}
const angleFrom=(q,x,y)=>Math.atan2(q.y-y,q.x-x);
const snap=(v,step)=>Math.round(v/step)*step;

/* ---- convex lens on the optical bench ---- */
const BY=330,LX=380;
make('lens',(c,p,t)=>{const ppc=4,u=p.objectDistance,F=p.focalLength,v=u*F/(u-F),m=-v/u,ox=LX-u*ppc,cy=250,h=34,ix=LX+v*ppc;hint(c,'Drag the candle along the bench');bench(c,40,660,BY,LX,ppc);
  post(c,LX,cy+60,BY);lens(c,LX,cy,62,10);post(c,ox,cy,BY);candle(c,ox,cy,h,1,false,t);for(const s of[-1,1]){c.fillStyle='#ffd43b';c.beginPath();c.arc(LX+s*F*ppc,cy,3,0,TAU);c.fill();txt(c,'F',LX+s*F*ppc,cy+12,'#ffd43b',10,'center',700)}
  const top=[ox,cy-h];if(u>F){const it=[ix,cy-h*m*-1];ray(c,[top,[LX,cy-h],it]);ray(c,[top,[LX,cy],it],'#ffd43b');if(ix<650){metal(c,ix-3,cy-80,6,140);post(c,ix,cy+60,BY);candle(c,ix,cy,h,m,false,t);txt(c,'screen: real, inverted image',ix,cy-90,'#e9f6ff',10,'center',700)}else txt(c,'image beyond the bench (object near F)',560,140,'#ffc36b',11,'center',700)}
  else{const vx=LX+v*ppc;ray(c,[top,[LX,cy-h],[LX+(LX-vx)*1.2,cy-h+(cy-h-(cy-h*m*-1))*0]]);ray(c,[top,[LX,cy],[LX+160,cy+h*160/(LX-ox)]],'#ffd43b');ray(c,[[LX,cy-h],[vx,cy-h*m*-1]],'#ff6b6b',1,[4,4]);candle(c,vx,cy,h,m,true,t);txt(c,'virtual, upright, magnified (seen through the lens)',vx,cy-h*Math.abs(m)-20,'#e9f6ff',10,'center',700)}
  dragDot(c,ox,BY-10,'candle');panel(c,[u>F?`v = ${f(v,1)} cm`:`v = ${f(v,1)} cm (virtual)`,`1/v − 1/u = 1/f  ·  u = −${u} cm`,`m = ${f(m,2)}`])},
 (q,p)=>q.y>150?'obj':null,(q,p)=>{p.objectDistance=clamp(snap((LX-q.x)/4,1),15,80)});

/* ---- concave mirror on the bench ---- */
make('concave-mirror',(c,p,t)=>{const ppc=6,u=p.u,F=p.f,MX=600,cy=250,h=30,v=u*F/(u-F),m=-v/u,ox=MX-u*ppc;hint(c,'Drag the candle towards or away from the mirror');bench(c,40,660,BY,MX,-ppc);
  c.save();const R=2*F*ppc;c.lineWidth=7;const g=c.createLinearGradient(MX-8,0,MX+4,0);g.addColorStop(0,'#f8f9fa');g.addColorStop(1,'#868e96');c.strokeStyle=g;c.beginPath();c.arc(MX-R,cy,R,-Math.asin(Math.min(1,70/R)),Math.asin(Math.min(1,70/R)));c.stroke();c.restore();post(c,MX,cy+70,BY);
  for(const [k,l] of[[1,'F'],[2,'C']]){const x=MX-k*F*ppc;if(x>40){c.fillStyle='#ffd43b';c.beginPath();c.arc(x,cy,3,0,TAU);c.fill();txt(c,l,x,cy+12,'#ffd43b',10,'center',700)}}
  post(c,ox,cy,BY);candle(c,ox,cy,h,1,false,t);const top=[ox,cy-h];
  if(u>F){const ix=MX-v*ppc,iy=cy+h*Math.abs(m);ray(c,[top,[MX,cy-h],[ix,iy]]);ray(c,[top,[MX-F*ppc,cy],[MX,iy],[ix,iy]],'#ffd43b');if(ix>40)candle(c,ix,cy,h,m,false,t);txt(c,'real, inverted image',Math.max(80,ix),iy+18,'#e9f6ff',10,'center',700)}
  else{const ix=MX-v*ppc;ray(c,[top,[MX,cy-h],[ox-40,cy-h-(h/(F*ppc))*(MX-ox+40)]]);ray(c,[[MX,cy-h],[ix,cy-h*m]],'#ff6b6b',1,[4,4]);candle(c,ix,cy,h,m,true,t);txt(c,'virtual, upright image behind the mirror',ix,cy-h*m-16,'#e9f6ff',10,'center',700)}
  dragDot(c,ox,BY-10,'candle');panel(c,[`v = ${f(-v,1)} cm`,`1/v + 1/u = 1/f · f = −${F} cm`,`m = ${f(m,2)}`])},
 (q,p)=>q.y>150?'obj':null,(q,p)=>{p.u=clamp(snap((600-q.x)/6,1),5,60)});

/* ---- refraction / TIR at a flat boundary (laser pointer) ---- */
function boundary(c,p,t,n1,n2,th,key){const X=330,Y=250,R=150;const dense=n1>n2;c.save();const g=c.createLinearGradient(0,Y,0,Y+150);g.addColorStop(0,'rgba(120,190,240,.35)');g.addColorStop(1,'rgba(60,120,180,.2)');c.fillStyle=n2>n1?g:'rgba(255,255,255,.03)';c.fillRect(60,Y,540,140);c.fillStyle=n1>=n2?g:'rgba(255,255,255,.03)';c.fillRect(60,Y-140,540,140);c.restore();
  c.strokeStyle='rgba(220,245,255,.8)';c.lineWidth=1.5;c.beginPath();c.moveTo(60,Y);c.lineTo(600,Y);c.stroke();protractor(c,X,Y,R-40);txt(c,`n₁ = ${n1}`,70,Y-125,'#e9f6ff',11,'left',700);txt(c,`n₂ = ${n2}`,70,Y+125,'#e9f6ff',11,'left',700);
  const a=rad(th),lx=X-Math.sin(a)*R,ly=Y-Math.cos(a)*R;laser(c,lx,ly,Math.atan2(Y-ly,X-lx));ray(c,[[lx,ly],[X,Y]],'#ff3b3b',2.2);const s=n1*Math.sin(a)/n2;
  ray(c,[[X,Y],[X+Math.sin(a)*R,Y-Math.cos(a)*R]],s>1?'#ff3b3b':'rgba(255,80,80,.35)',s>1?2.2:1.2);if(s<=1){const b=Math.asin(s);ray(c,[[X,Y],[X+Math.sin(b)*R,Y+Math.cos(b)*R]],'#ff3b3b',2.2)}
  const crit=n1>n2?deg(Math.asin(n2/n1)):null;dragDot(c,lx,ly,'laser');panel(c,[s>1?'TOTAL INTERNAL REFLECTION':`refraction angle ${f(deg(Math.asin(s)),1)}°`,`n₁ sin i = n₂ sin r · i = ${th}°`,crit!=null?`critical angle ${f(crit,1)}°`:'light enters denser medium']);
  hint(c,'Drag the laser pointer around the protractor')}
const laserDrag=(key,max)=>(q,p)=>{const a=deg(Math.atan2(330-q.x,250-q.y));p[key]=clamp(snap(Math.abs(a),1),0,max)};
make('refraction',(c,p,t)=>boundary(c,p,t,p.n1,p.n2,p.angle),q=>q.y<250?'l':null,laserDrag('angle',80));
make('total-internal-reflection',(c,p,t)=>boundary(c,p,t,p.n1,p.n2,p.th),q=>q.y<250?'l':null,laserDrag('th',89));

/* ---- real and apparent depth ---- */
make('apparent-depth',(c,p,t)=>{const X=330,top=170,k=70,d=p.d,da=d/p.n;hint(c,'Drag the coin deeper or shallower');c.save();const g=c.createLinearGradient(0,top,0,top+230);g.addColorStop(0,'rgba(120,190,240,.35)');g.addColorStop(1,'rgba(30,90,150,.45)');c.fillStyle=g;c.fillRect(150,top,360,230);c.restore();c.strokeStyle='rgba(220,245,255,.8)';c.strokeRect(150,top-30,360,260);
  const cyR=top+d*k,cyA=top+da*k;c.save();c.fillStyle='#e0a930';c.beginPath();c.ellipse(X,cyR,24,6,0,0,TAU);c.fill();c.globalAlpha=.45;c.setLineDash([3,3]);c.strokeStyle='#ffd43b';c.beginPath();c.ellipse(X,cyA,24,6,0,0,TAU);c.stroke();c.restore();
  ray(c,[[X+10,cyR],[X+40,top],[X+120,top-90]],'#ffd43b',1.6);ray(c,[[X+40,top],[X+10,cyA]],'#ffd43b',1,[4,4]);txt(c,'👁',X+128,top-98,'#e9f6ff',18,'center');txt(c,`real depth ${f(d,2)} m`,X-60,cyR,'#e0a930',10,'right',700);txt(c,`appears at ${f(da,2)} m`,X-60,cyA,'#ffd43b',10,'right',700);
  dragDot(c,X,cyR,'coin');panel(c,[`apparent depth ${f(da,2)} m`,`d′ = d / n · n = ${p.n}`,`shift ${f(d-da,2)} m`])},
 q=>q.y>150?'c':null,(q,p)=>{p.d=clamp(snap((q.y-170)/70,.05),.2,3)});

/* ---- prism dispersion ---- */
const SPEC=[[.40,'#7048e8'],[.45,'#4263eb'],[.49,'#1c7ed6'],[.52,'#2f9e44'],[.57,'#fab005'],[.6,'#f76707'],[.68,'#e03131']];
make('prism-dispersion',(c,p,t)=>{const A=rad(p.angle),cx=330,base=345,H=190,half=H*Math.tan(A/2),apex=[cx,base-H],L=[cx-half,base],Rr=[cx+half,base];hint(c,'Drag the prism’s bottom-right corner sideways to change the apex angle A');glass(c,[apex,L,Rr],'rgba(200,235,255,.25)');
  const nl=l=>p.index+p.dispersion*(1/l**2-1/.55**2),dev=n=>2*Math.asin(Math.min(1,n*Math.sin(A/2)))-A,dmin=dev(p.index);const yy=base-H*.45,inX=cx-half*.45,outX=cx+half*.45;
  ray(c,[[inX-190*Math.cos(dmin/2),yy+190*Math.sin(dmin/2)],[inX,yy],[outX,yy]],'#f8f9fa',3);
  for(const [l,col] of SPEC){const o=dmin/2+(dev(nl(l))-dmin)*6;ray(c,[[outX,yy],[outX+190*Math.cos(o),yy+190*Math.sin(o)]],col,1.8)}
  txt(c,'white light',inX-180,yy+190*Math.sin(dmin/2)-14,'#e9f6ff',10,'left',700);txt(c,'VIBGYOR · violet bends most (spread ×6)',outX+20,yy-16,'#e9f6ff',10,'left',700);txt(c,`A = ${p.angle}°`,cx,apex[1]+30,'#ffd43b',11,'center',700);dragDot(c,Rr[0],Rr[1],'');panel(c,[`apex angle A = ${p.angle}°`,`δ(min) ≈ ${f(deg(dmin),1)}° at 550 nm`,`n(violet) − n(red) = ${f(nl(.4)-nl(.68),3)}`])},
 q=>Math.abs(q.y-345)<30&&q.x>340?'a':null,(q,p)=>{p.angle=clamp(Math.round(deg(2*Math.atan(Math.max(1,q.x-330)/190))),30,60)});

/* ---- optical fibre ---- */
make('optical-fibre',(c,p,t)=>{const y0=250,r=34,x0=150,x1=640,a=rad(p.angle),crit=Math.asin(Math.min(1,p.cladding/p.core)),inc=Math.PI/2-a,guided=inc>crit;hint(c,'Drag the laser up or down to change the launch angle');
  c.save();const g=c.createLinearGradient(0,y0-r-14,0,y0+r+14);g.addColorStop(0,'rgba(255,212,59,.25)');g.addColorStop(.2,'rgba(170,220,255,.35)');g.addColorStop(.5,'rgba(230,248,255,.45)');g.addColorStop(.8,'rgba(170,220,255,.35)');g.addColorStop(1,'rgba(255,212,59,.25)');c.fillStyle=g;c.fillRect(x0,y0-r-14,x1-x0,2*r+28);c.restore();c.strokeStyle='rgba(220,245,255,.7)';c.strokeRect(x0,y0-r,x1-x0,2*r);
  txt(c,'cladding',x0+10,y0-r-7,'#ffd43b',9,'left',700);txt(c,'core',x0+10,y0+r-8,'#e9f6ff',9,'left',700);laser(c,x0-4,y0,-a);
  const step=r/Math.tan(a),pts=[[x0,y0]];let x=x0+step,dir=-1;while(pts.length<60){const wy=y0+dir*r;if(x>=x1){const py=pts[pts.length-1][1];pts.push([x1,py+(wy-py)*(x1-pts[pts.length-1][0])/(x-pts[pts.length-1][0])]);break}pts.push([x,wy]);if(!guided){pts.push([x+50*Math.cos(a),wy+dir*60*Math.sin(a)+dir*14]);break}dir=-dir;x+=2*step}
  ray(c,pts,'#ff3b3b',2);dragDot(c,x0-4-46*Math.cos(a),y0+46*Math.sin(a),'laser');panel(c,[guided?'GUIDED (total int. reflection)':'LEAKS out of the core',`angle at wall ${f(deg(inc),1)}° vs critical ${f(deg(crit),1)}°`,`n(core) ${p.core} · n(clad) ${p.cladding}`])},
 q=>q.x<200?'l':null,(q,p)=>{p.angle=clamp(Math.round(deg(Math.atan2(Math.max(0,q.y-250),Math.max(1,146-q.x)))),5,45)});

/* ---- two thin lenses in contact ---- */
make('contact-lens-pair',(c,p,t)=>{const P=p.p1+p.p2,F=P?100/P:Infinity,cy=250,X=330;hint(c,'Drag a lens up (more converging) or down (more diverging)');bench(c,40,660,BY,X,3);
  lens(c,X-12,cy,58,p.p1*1.4);lens(c,X+12,cy,58,p.p2*1.4);txt(c,`${p.p1} D`,X-12,cy-74,'#e9f6ff',11,'center',700);txt(c,`${p.p2} D`,X+12,cy-90,'#e9f6ff',11,'center',700);
  for(const y of[-40,-20,0,20,40])ray(c,[[60,cy+y],[X,cy+y],[650,cy+y-(Number.isFinite(F)?y*(650-X)/(F*3):0)]],'#ffd43b',1.4)
  if(Number.isFinite(F)&&F>0&&X+F*3<650){c.fillStyle='#ff6b6b';c.beginPath();c.arc(X+F*3,cy,4,0,TAU);c.fill();txt(c,'focus',X+F*3,cy+14,'#ff6b6b',10,'center',700)}
  dragDot(c,X-12,cy-40,'');dragDot(c,X+12,cy+40,'');panel(c,[`P = P₁ + P₂ = ${f(P,1)} D`,Number.isFinite(F)?`f = 100/P = ${f(F,1)} cm`:'f = ∞ (no net power)',P>0?'converging':P<0?'diverging':'plane'])},
 q=>q.x>280&&q.x<380?(q.x<330?'p1':'p2'):null,(q,p,m)=>{p[m]=clamp(snap((250-q.y)/8,.5),-10,10)});

/* ---- lens maker ---- */
make('lens-maker',(c,p,t)=>{const cy=245,X=330,inv=(p.n/p.nm-1)*(1/p.R1+1/p.R2),F=1/inv;hint(c,'Drag a surface of the lens to change its radius of curvature');const k1=60/p.R1*6,k2=60/p.R2*6;
  const g=c.createLinearGradient(X-30,0,X+30,0);g.addColorStop(0,'rgba(140,200,240,.3)');g.addColorStop(.5,'rgba(225,245,255,.6)');g.addColorStop(1,'rgba(120,180,225,.35)');c.save();c.beginPath();c.moveTo(X,cy-70);c.quadraticCurveTo(X+k2*2.2,cy,X,cy+70);c.quadraticCurveTo(X-k1*2.2,cy,X,cy-70);c.fillStyle=g;c.shadowColor='rgba(120,200,255,.5)';c.shadowBlur=12;c.fill();c.strokeStyle='rgba(220,245,255,.9)';c.stroke();c.restore();
  for(const y of[-45,-22,0,22,45])ray(c,[[60,cy+y],[X,cy+y],[650,cy+y-y*(650-X)/(F*4)]],'#ffd43b',1.4);if(F>0&&X+F*4<650){c.fillStyle='#ff6b6b';c.beginPath();c.arc(X+F*4,cy,4,0,TAU);c.fill()}
  dragDot(c,X-k1*1.1,cy,'R₁');dragDot(c,X+k2*1.1,cy,'R₂');panel(c,[`f = ${f(F,1)} cm`,`1/f = (n/n_m − 1)(1/R₁ + 1/R₂)`,`R₁ = ${p.R1} cm · R₂ = ${p.R2} cm`])},
 q=>Math.abs(q.y-245)<60&&Math.abs(q.x-330)<90?(q.x<330?'R1':'R2'):null,(q,p,m)=>{const d=Math.max(4,Math.abs(q.x-330));p[m]=clamp(snap(360/d,1),5,50)});

/* ---- microscope and telescope (drag the eyepiece) ---- */
function tube(c,x0,x1,y,r){metal(c,x0,y-r,x1-x0,2*r,true);c.fillStyle='rgba(255,255,255,.12)';c.fillRect(x0,y-r+3,x1-x0,3)}
make('compound-microscope',(c,p,t)=>{const cy=230,X0=150,k=22,xo=X0,xe=X0+p.L*k;const D=25,m=p.adj==='near'?(p.L/p.fo)*(1+D/p.fe):(p.L/p.fo)*(D/p.fe);hint(c,'Drag the eyepiece to change the tube length');tube(c,xo-10,xe+10,cy,30);lens(c,xo,cy,26,6);lens(c,xe,cy,34,8);
  metal(c,60,cy+50,190,10);txt(c,'specimen',90,cy+40,'#8ca6b9',9,'left',600);c.fillStyle='#69db7c';c.fillRect(xo-p.fo*k-10,cy-8,4,8);ray(c,[[xo-p.fo*k*1.1,cy-6],[xo,cy-20],[xe,cy+24],[xe+120,cy+10]],'#ffd43b',1.4);ray(c,[[xo-p.fo*k*1.1,cy-6],[xo,cy],[xe,cy+30],[xe+120,cy+18]],'#ff6b6b',1.4);txt(c,'👁',xe+130,cy+14,'#e9f6ff',18,'center');
  txt(c,'objective',xo,cy-48,'#8ca6b9',9.5,'center',600);txt(c,'eyepiece',xe,cy-54,'#8ca6b9',9.5,'center',600);dragDot(c,xe,cy+52,'eyepiece');panel(c,[`magnifying power ${f(m,1)}×`,`m = (L/f_o)(${p.adj==='near'?'1 + D/f_e':'D/f_e'})`,`L = ${p.L} cm`])},
 q=>q.x>300?'e':null,(q,p)=>{p.L=clamp(snap((q.x-150)/22,.5),10,20)});
make('astronomical-telescope',(c,p,t)=>{const cy=230,X0=110,k=2.6,xe=X0+p.fo*k*.9,m=p.fo/p.fe;hint(c,'Drag the eyepiece handle down/up to change its focal length');tube(c,X0-6,xe+16,cy,Math.max(12,p.D*1.4));lens(c,X0,cy,Math.max(14,p.D*1.6),5);lens(c,xe,cy,14,4+8/p.fe);
  for(const y of[-12,0,12])ray(c,[[40,cy+y-14],[X0,cy+y],[xe-p.fe*k,cy+10],[xe,cy-y*.6+8],[xe+90,cy-y*1.8+2]],'#ffd43b',1.2);txt(c,'👁',xe+100,cy,'#e9f6ff',18,'center');txt(c,'objective',X0,cy-p.D*1.6-14,'#8ca6b9',9.5,'center',600);txt(c,'eyepiece',xe,cy-30,'#8ca6b9',9.5,'center',600);
  dragDot(c,xe,cy+20+p.fe*6,'eyepiece');panel(c,[`magnifying power ${f(m,1)}×`,`m = f_o / f_e (normal adjustment)`,`tube length ${f(p.fo+p.fe,1)} cm`])},
 q=>q.x>300?'e':null,(q,p)=>{p.fe=clamp(snap((q.y-250)/6,.5),1,10)});

/* ---- two inclined mirrors ---- */
make('mirror-images',(c,p,t)=>{const O=[330,300],Lm=190,th=rad(p.th),A=-Math.PI/2-th/2,B=-Math.PI/2+th/2,ph=A+p.phi*th,ob=[O[0]+110*Math.cos(ph),O[1]+110*Math.sin(ph)];hint(c,'Drag the candle between the mirrors; set θ with the slider');
  for(const a of[A,B]){c.save();c.lineWidth=6;c.strokeStyle='#dee2e6';c.shadowColor='rgba(200,230,255,.6)';c.shadowBlur=8;c.beginPath();c.moveTo(...O);c.lineTo(O[0]+Lm*Math.cos(a),O[1]+Lm*Math.sin(a));c.stroke();c.restore()}
  const imgs=[];const refl=(pt,a)=>{const dx=pt[0]-O[0],dy=pt[1]-O[1],ca=Math.cos(2*a),sa=Math.sin(2*a);return[O[0]+dx*ca+dy*sa,O[1]+dx*sa-dy*ca]};let fr=[ob],seen=[ob];for(let k=0;k<12&&fr.length;k++){const nx=[];for(const q of fr)for(const a of[A,B]){const r=refl(q,a);if(!seen.some(s=>Math.hypot(s[0]-r[0],s[1]-r[1])<4)){seen.push(r);nx.push(r);imgs.push(r)}}fr=nx}
  for(const q of imgs){c.save();c.globalAlpha=.55;c.fillStyle='#ffd43b';c.beginPath();c.arc(q[0],q[1],6,0,TAU);c.fill();c.restore()}candle(c,ob[0],ob[1]+12,26,1,false,t);dragDot(c,ob[0],ob[1],'object');panel(c,[`${imgs.length} images`,`θ = ${p.th}° → 360/θ = ${f(360/p.th,2)}`,'faint dots: images'])},
 q=>'o',(q,p)=>{const a=Math.atan2(q.y-300,q.x-330),th=rad(p.th),A=-Math.PI/2-th/2;p.phi=clamp(snap((a-A)/th,.05),.1,.9)});
})();
