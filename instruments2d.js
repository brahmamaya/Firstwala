/* Hands-on measuring instruments: a stainless vernier caliper and a micrometer screw gauge drawn as real
   tools (brushed metal, engraved scales, thickness and shadow). Drag the jaw or turn the thimble on the stage;
   jaws stop on the object, "Close to contact" snaps them, and a magnifier shows the reading. */
(() => {
'use strict';
const {R,S,N,f}=window.PhysicaLab;
const INT=window.PhysicaInteractive=window.PhysicaInteractive||{},PATCH=window.PhysicaSimPatch=window.PhysicaSimPatch||{};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),INK='#14181d';
// ---------- drawing helpers ----------
function metal(c,x,y,w,h,{tone='steel',r=3,vertical=false}={}){const g=vertical?c.createLinearGradient(x,0,x+w,0):c.createLinearGradient(0,y,0,y+h),T={steel:['#f4f7f9','#cfd8de','#9aa6ae','#c5ced4','#7c8890'],dark:['#b7c1c8','#8d99a2','#626e77','#87939b','#4b555d'],brass:['#fff1b8','#e8c463','#b98a2a','#d9b04f','#8a6418'],chrome:['#ffffff','#e3e9ed','#aab5bc','#dfe6ea','#8d989f'],enamel:['#7f9fb8','#56768f','#344e63','#4b6a82','#253a4b']}[tone];
  [0,.18,.55,.75,1].forEach((s,i)=>g.addColorStop(s,T[i]));c.save();c.shadowColor='rgba(0,0,0,.45)';c.shadowBlur=10;c.shadowOffsetY=5;c.fillStyle=g;c.beginPath();c.roundRect(x,y,w,h,r);c.fill();c.restore();
  c.save();c.strokeStyle='rgba(0,0,0,.35)';c.lineWidth=1;c.beginPath();c.roundRect(x+.5,y+.5,w-1,h-1,r);c.stroke();c.restore()}
function poly(c,pts,tone='steel',vertical=false){const xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]),x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys);c.save();c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.shadowColor='rgba(0,0,0,.45)';c.shadowBlur=10;c.shadowOffsetY=5;
  const g=vertical?c.createLinearGradient(x0,0,x1,0):c.createLinearGradient(0,y0,0,y1),T=tone==='steel'?['#eef2f5','#c4cdd3','#8e9aa3']:['#c3ccd2','#949fa7','#5d6870'];g.addColorStop(0,T[0]);g.addColorStop(.5,T[1]);g.addColorStop(1,T[2]);c.fillStyle=g;c.fill();c.shadowColor='transparent';c.strokeStyle='rgba(0,0,0,.4)';c.lineWidth=1;c.stroke();c.restore()}
function text(c,s,x,y,col='#e9f6ff',size=11,align='left',w=600){c.save();c.font=`${w} ${size}px system-ui, sans-serif`;c.fillStyle=col;c.textAlign=align;c.textBaseline='middle';c.fillText(s,x,y);c.restore()}
function line(c,x0,y0,x1,y1,col=INK,w=1){c.save();c.strokeStyle=col;c.lineWidth=w;c.beginPath();c.moveTo(x0,y0);c.lineTo(x1,y1);c.stroke();c.restore()}
function button(c,b,label,on){c.save();c.shadowColor='rgba(66,217,202,.55)';c.shadowBlur=14;const g=c.createLinearGradient(0,b.y,0,b.y+b.h);g.addColorStop(0,'#6ff0e2');g.addColorStop(1,'#1fb5a6');c.fillStyle=g;c.beginPath();c.roundRect(b.x,b.y,b.w,b.h,b.h/2);c.fill();c.shadowColor='transparent';c.strokeStyle='rgba(255,255,255,.7)';c.lineWidth=1.2;c.stroke();c.fillStyle='rgba(255,255,255,.28)';c.beginPath();c.roundRect(b.x+3,b.y+2,b.w-6,b.h*.42,b.h/3);c.fill();c.restore();text(c,'⇥ '+label,b.x+b.w/2,b.y+b.h/2+.5,'#03211e',14,'center',800)}
function handle(c,x,y,vertical){c.save();c.strokeStyle='#42d9ca';c.setLineDash([3,3]);c.lineWidth=1.5;c.beginPath();c.arc(x,y,11,0,Math.PI*2);c.stroke();c.setLineDash([]);c.fillStyle='#42d9ca';c.beginPath();if(vertical){c.moveTo(x,y-7);c.lineTo(x-4,y-2);c.lineTo(x+4,y-2);c.moveTo(x,y+7);c.lineTo(x-4,y+2);c.lineTo(x+4,y+2)}else{c.moveTo(x-7,y);c.lineTo(x-2,y-4);c.lineTo(x-2,y+4);c.moveTo(x+7,y);c.lineTo(x+2,y-4);c.lineTo(x+2,y+4)}c.fill();c.restore()}
function object(c,kind,x0,x1,cy,h){const w=x1-x0,g=c.createRadialGradient(x0+w*.35,cy-h*.25,2,x0+w/2,cy,Math.max(w,h)*.7);c.save();c.shadowColor='rgba(0,0,0,.5)';c.shadowBlur=12;c.shadowOffsetY=6;
  if(kind==='block'){const lg=c.createLinearGradient(0,cy-h/2,0,cy+h/2);lg.addColorStop(0,'#e3b778');lg.addColorStop(1,'#9c6a32');c.fillStyle=lg;c.fillRect(x0,cy-h/2,w,h);c.shadowColor='transparent';c.strokeStyle='#6d4520';for(let i=1;i<5;i++){c.beginPath();c.moveTo(x0,cy-h/2+i*h/5+Math.sin(i)*2);c.bezierCurveTo(x0+w*.3,cy-h/2+i*h/5-3,x0+w*.7,cy-h/2+i*h/5+3,x1,cy-h/2+i*h/5);c.stroke()}}
  else if(kind==='cylinder'||kind==='wire'){const lg=c.createLinearGradient(x0,0,x1,0);const T=kind==='wire'?['#8a5a2b','#f3b27a','#b0703a']:['#7c8890','#f4f7f9','#8e9aa3'];lg.addColorStop(0,T[0]);lg.addColorStop(.4,T[1]);lg.addColorStop(1,T[2]);c.fillStyle=lg;c.fillRect(x0,cy-h/2,w,h);c.shadowColor='transparent';c.fillStyle='rgba(255,255,255,.25)';c.beginPath();c.ellipse((x0+x1)/2,cy-h/2,w/2,Math.max(2,w*.12),0,0,Math.PI*2);c.fill()}
  else{const T={ball:['#ffffff','#c9d2d8','#59646c'],marble:['#e7f5ff','#4dabf7','#1864ab'],brass:['#fff3bf','#e0a930','#7a5410'],coin:['#fff3bf','#d9b04f','#7a5410'],bead:['#fff0f6','#f783ac','#a61e4d']}[kind]||['#fff','#ccc','#666'];g.addColorStop(0,T[0]);g.addColorStop(.45,T[1]);g.addColorStop(1,T[2]);c.fillStyle=g;c.beginPath();c.ellipse((x0+x1)/2,cy,w/2,kind==='coin'?h/2:w/2,0,0,Math.PI*2);c.fill()}c.restore()}

/* ======================= VERNIER CALIPER ======================= */
const VOBJ={none:['No object',0,null],marble:['Glass marble',16.3,'marble'],ball:['Steel ball',23.4,'ball'],cylinder:['Steel cylinder',34.7,'cylinder'],block:['Wooden block',52.6,'block']};
const vEff=p=>{const sz=VOBJ[p.obj][1];return Math.max(p.jaw,sz)};
const vRead=p=>{const Rr=vEff(p)+p.zero;let msr=Math.floor(Rr+1e-9),n=Math.round((Rr-msr)*10);if(n===10){msr+=1;n=0}return{Rr,msr,n,reading:msr+n/10}};
PATCH.units={formula:'Reading = MSR + n × LC  (LC = 1 MSD − 1 VSD = 0.1 mm) ;  corrected = reading − zero error',
 description:'Hold a real vernier caliper: drag the sliding jaw on the stage until it touches the object, then read the main and vernier scales.',
 observe:'The vernier line that coincides with a main-scale line gives the extra tenths of a millimetre.',
 tryText:'Measure the steel ball, then set a zero error of +0.3 mm and apply the correction.',
 controls:[S('obj','Object to measure','ball',Object.entries(VOBJ).map(([k,v])=>[k,v[0]])),R('jaw','Jaw opening (drag on stage)',0,120,.1,40,'mm',1),R('zero','Zero error',-.5,.5,.1,0,'mm',1)],
 metrics:p=>{const r=vRead(p),sz=VOBJ[p.obj][1],gap=p.jaw-sz;return[N('Main scale reading (MSR)',r.msr,'mm',0),N('Coinciding vernier division n',r.n,'',0),N('Observed reading',r.reading,'mm',1),N('Corrected reading',r.reading-p.zero,'mm',1),N('Jaws',p.obj==='none'?'free':gap>.05?`${f(gap,1)} mm gap — close the jaw`:'touching the object ✓')]}};
const V={X0:110,px:4.25,top:172,bh:38};
let vDrag=null;
INT.units={
 draw(c,p,t){const {X0,px,top,bh}=V,r=vRead(p),eff=vEff(p),xj=X0+eff*px,xv=xj+p.zero*px,sz=VOBJ[p.obj][1],bot=top+bh,beamR=X0+125*px;
  text(c,'Drag the sliding jaw · it stops on the object',40,110,'#8ca6b9',11,'left',600);
  // object between the outside jaws
  if(sz)object(c,VOBJ[p.obj][2],X0,X0+sz*px,bot+60,p.obj==='block'?72:p.obj==='cylinder'?86:sz*px);
  // fixed jaw (outside, downward) and inside jaw (upward)
  poly(c,[[X0-44,bot-2],[X0,bot-2],[X0,bot+100],[X0-8,bot+112],[X0-30,bot+62]]);poly(c,[[X0-24,top+2],[X0,top+2],[X0,top-44],[X0-7,top-50]]);
  // beam with the engraved main scale (mm)
  metal(c,X0-46,top,beamR-(X0-46),bh,{tone:'chrome',r:4});c.fillStyle='rgba(255,255,255,.55)';c.fillRect(X0-44,top+3,beamR-(X0-48),3);
  for(let mm=0;mm<=125;mm++){const x=X0+mm*px,L=mm%10===0?14:mm%5===0?10:6;line(c,x,bot-1,x,bot-1-L,INK,mm%10===0?1.3:.9);if(mm%10===0)text(c,String(mm),x,bot-22,INK,9,'center',700)}text(c,'mm',beamR-14,top+9,INK,8,'center',700);
  // depth rod emerging from the end of the beam
  metal(c,beamR-2,bot-14,Math.min(eff*px*.35,40)+8,5,{tone:'steel',r:2});
  // sliding vernier: top rail, front plate with vernier scale, moving jaws, thumb wheel, lock screw
  poly(c,[[xj,top-2],[xj+18,top-2],[xj+7,top-50],[xj,top-44]]);metal(c,xj-4,top-12,128,12,{tone:'dark',r:3});
  poly(c,[[xj,bot+30],[xj+40,bot+30],[xj+11,bot+112],[xj,bot+100]],'steel');
  metal(c,xj-4,bot,128,30,{tone:'steel',r:3});c.fillStyle='rgba(255,255,255,.6)';c.fillRect(xj-2,bot+1,124,2);
  for(let i=0;i<=10;i++){const x=xv+i*.9*px,hit=i===r.n,L=i%5===0?13:8;line(c,x,bot+1,x,bot+1+L,hit?'#e03131':INK,hit?2:1);if(i%5===0)text(c,String(i),x,bot+21,INK,8.5,'center',700)}
  c.save();c.fillStyle='#5c6770';c.beginPath();c.arc(xj+88,bot+40,10,0,Math.PI*2);c.fill();c.strokeStyle='#2b3238';for(let k=0;k<16;k++){const a=k/16*Math.PI*2+t*.0;c.beginPath();c.moveTo(xj+88+7*Math.cos(a),bot+40+7*Math.sin(a));c.lineTo(xj+88+10*Math.cos(a),bot+40+10*Math.sin(a));c.stroke()}c.restore();
  metal(c,xj+70,top-24,16,12,{tone:'dark',r:2});metal(c,xj+66,top-28,24,5,{tone:'steel',r:2});
  handle(c,xj+20,bot+64,false);text(c,'slide jaw',xj+34,bot+64,'#42d9ca',10,'left',700);
  // labels
  text(c,'fixed jaw',X0-62,bot+108,'#8ca6b9',9.5,'left',600);text(c,'inside jaws',X0-14,top-34,'#8ca6b9',9.5,'right',600);text(c,'main scale / mm',beamR-6,top-10,'#8ca6b9',9.5,'right',600);text(c,'vernier',xj+124,bot+18,'#8ca6b9',9.5,'left',600);
  // close-to-contact button
  INT.units.btn={x:492,y:98,w:168,h:34};button(c,INT.units.btn,sz?'Close to contact':'Close the jaws',false);
  // magnifier
  const mx=40,my=338,mw=420,mh=62,K=15,cx=mx+mw/2,X=v=>cx+(v-r.Rr)*K;c.save();c.fillStyle='#0b1a26f2';c.strokeStyle='#29475b';c.beginPath();c.roundRect(mx,my,mw,mh,8);c.fill();c.stroke();c.beginPath();c.roundRect(mx,my,mw,mh,8);c.clip();
  c.fillStyle='#d9e0e5';c.fillRect(mx,my+14,mw,22);c.fillStyle='#c3ccd2';c.fillRect(mx,my+36,mw,24);const yb=my+36;
  for(let mm=Math.floor(r.Rr)-14;mm<=Math.floor(r.Rr)+16;mm++){if(mm<0)continue;const x=X(mm),hit=mm===r.msr+r.n;line(c,x,yb,x,yb-(mm%5===0?12:8),hit?'#e03131':INK,hit?2:1);text(c,String(mm),x,my+19,hit?'#e03131':'#33414c',8,'center',600)}
  for(let i=0;i<=10;i++){const x=X(r.Rr)+i*.9*K,hit=i===r.n;line(c,x,yb,x,yb+(i%5===0?12:8),hit?'#e03131':INK,hit?2.2:1);text(c,String(i),x,yb+18,hit?'#e03131':'#33414c',8,'center',700)}c.restore();
  text(c,'MAGNIFIED MAIN + VERNIER SCALE',mx+8,my+7,'#42d9ca',8.5,'left',700);
  const gap=p.jaw-sz;text(c,p.obj==='none'?'JAWS FREE':gap>.05?'GAP · CLOSE TO THE OBJECT':'IN CONTACT ✓',480,346,gap>.05&&p.obj!=='none'?'#ffc36b':'#42d9ca',10,'left',700);text(c,`${f(r.reading,1)} mm`,480,366,'#e9f6ff',17,'left',700);
  text(c,`${r.msr} + ${r.n} × 0.1 mm`,480,384,'#8ca6b9',10,'left',600);text(c,`zero correction: ${p.zero>0?'−':'+'}${f(Math.abs(p.zero),1)} mm → ${f(r.reading-p.zero,1)} mm`,480,398,'#8ca6b9',9.5,'left',600)},
 down(q,p){const b=INT.units.btn;if(b&&q.x>=b.x&&q.x<=b.x+b.w&&q.y>=b.y&&q.y<=b.y+b.h){p.jaw=VOBJ[p.obj][1];return}const xj=V.X0+vEff(p)*V.px;vDrag={off:(q.x>=xj-12&&q.x<=xj+130)?q.x-xj:0};this.move(q,p)},
 move(q,p){if(!vDrag)return;const sz=VOBJ[p.obj][1];p.jaw=Math.round(clamp((q.x-vDrag.off-V.X0)/V.px,sz,120)*10)/10},
 up(q,p){if(!vDrag)return;vDrag=null;const sz=VOBJ[p.obj][1];if(sz&&p.jaw-sz<1.5)p.jaw=sz}};

/* ======================= MICROMETER SCREW GAUGE ======================= */
const SOBJ={none:['No object',0,null],wire:['Copper wire',1.24,'wire'],coin:['Coin (thickness)',1.65,'coin'],paper:['Stack of paper',2.16,'block'],bead:['Glass bead',4.38,'bead']};
const sEff=p=>Math.max(p.gap,SOBJ[p.obj][1]);
const sRead=p=>{const pitch=Number(p.pitch),lc=pitch/50,Rr=sEff(p)+p.zero;let psr=Math.floor(Rr/pitch+1e-9)*pitch,n=Math.round((Rr-psr)/lc);if(n>=50){psr+=pitch;n=0}return{pitch,lc,Rr,psr,n,reading:psr+n*lc}};
PATCH['screw-gauge']={formula:'Reading = PSR + n × LC  (LC = pitch / 50) ;  corrected = reading − zero error',
 description:'Hold a real micrometer screw gauge: turn the thimble on the stage (drag up/down or sideways) until the spindle touches the object, then read the sleeve and thimble scales.',
 observe:'Use the ratchet (Close to contact) so the spindle presses the object gently; one full turn of the thimble moves the spindle by one pitch.',
 tryText:'Measure the copper wire with a 0.5 mm pitch, then add a zero error of +0.02 mm.',
 controls:[S('obj','Object to measure','wire',Object.entries(SOBJ).map(([k,v])=>[k,v[0]])),R('gap','Spindle opening (turn on stage)',0,25,.01,3,'mm',2),S('pitch','Screw pitch','0.5',[['0.5','0.5 mm'],['1','1.0 mm']]),R('zero','Zero error',-.05,.05,.01,0,'mm',2)],
 metrics:p=>{const r=sRead(p),sz=SOBJ[p.obj][1],gap=p.gap-sz;return[N('Pitch scale reading (PSR)',r.psr,'mm',1),N('Thimble division n',r.n,'',0),N('Least count',r.lc,'mm',2),N('Observed reading',r.reading,'mm',2),N('Corrected reading',r.reading-p.zero,'mm',2),N('Spindle',p.obj==='none'?'free':gap>.005?`${f(gap,2)} mm gap`:'touching ✓')]}};
const G={A:206,xa:196,K:6.2,xz:410};
let sDrag=null;
INT['screw-gauge']={
 draw(c,p,t){const {A,xa,K,xz}=G,r=sRead(p),eff=sEff(p),sz=SOBJ[p.obj][1],xs=xa+eff*7,xt=xz+r.Rr*K,turn=r.n/50;
  text(c,'Turn the thimble: drag up/down (or sideways) on the stage',40,110,'#8ca6b9',11,'left',600);
  // U-frame
  c.save();c.lineCap='round';c.lineJoin='round';const fr=()=>{c.beginPath();c.moveTo(150,A-6);c.lineTo(136,A+36);c.quadraticCurveTo(128,A+96,210,A+98);c.lineTo(330,A+98);c.quadraticCurveTo(392,A+94,392,A+36);c.lineTo(392,A+4)};c.shadowColor='rgba(0,0,0,.5)';c.shadowBlur=12;c.shadowOffsetY=6;c.strokeStyle='#253a4b';c.lineWidth=34;fr();c.stroke();c.shadowColor='transparent';c.strokeStyle='#4b6a82';c.lineWidth=26;fr();c.stroke();c.strokeStyle='rgba(255,255,255,.18)';c.lineWidth=6;c.beginPath();c.moveTo(142,A+36);c.quadraticCurveTo(136,A+88,210,A+90);c.lineTo(330,A+90);c.stroke();c.restore();
  text(c,'0–25 mm · LC 0.01 mm',262,A+99,'#cfe3ef',9,'center',700);
  // anvil, object, spindle
  metal(c,150,A-12,xa-150,24,{tone:'chrome',r:3});if(sz)object(c,SOBJ[p.obj][2],xa,xa+sz*7,A,p.obj==='coin'?48:p.obj==='bead'?sz*7:70);
  metal(c,xs,A-10,xz-xs+4,20,{tone:'chrome',r:2});
  // sleeve with datum line, mm scale above and half-mm below
  metal(c,392,A-17,Math.max(20,xt-392)+2,34,{tone:'steel',r:3});line(c,xz,A,xt,A,INK,1.2);
  for(let v=0;v<=25+1e-9;v+=.5){const x=xz+v*K;if(x>xt+.5)break;const whole=Math.abs(v-Math.round(v))<1e-6;line(c,x,A,x,whole?A-8:A+8,INK,1);if(whole&&Math.round(v)%5===0)text(c,String(Math.round(v)),x,A-12,INK,8.5,'center',700)}
  // thimble with circular scale, ratchet
  const tw=62,th=24;c.save();const tg=c.createLinearGradient(0,A-th,0,A+th);tg.addColorStop(0,'#7c8890');tg.addColorStop(.35,'#eef2f5');tg.addColorStop(.6,'#c4cdd3');tg.addColorStop(1,'#59646c');c.shadowColor='rgba(0,0,0,.5)';c.shadowBlur=10;c.shadowOffsetY=5;c.fillStyle=tg;c.beginPath();c.roundRect(xt,A-th,tw,2*th,4);c.fill();c.shadowColor='transparent';
  c.fillStyle='rgba(0,0,0,.18)';for(let k=0;k<18;k++){const a=(k/18+turn)*Math.PI*2,y=A-th*Math.sin(a);if(Math.cos(a)>0)c.fillRect(xt+26,y-1,tw-28,1.6)}c.restore();
  for(let i=-12;i<=12;i++){const a=i*Math.PI*2/50,y=A-th*Math.sin(a);if(Math.cos(a)<.25)continue;const d=((r.n+i)%50+50)%50,hit=i===0,L=d%5===0?12:7;line(c,xt,y,xt+L,y,hit?'#e03131':INK,hit?1.8:1);if(d%5===0)text(c,String(d),xt+15,y,hit?'#e03131':INK,8,'left',700)}
  metal(c,xt+tw,A-15,30,30,{tone:'dark',r:3});for(let k=0;k<8;k++)line(c,xt+tw+4+k*3.4,A-15,xt+tw+4+k*3.4,A+15,'rgba(0,0,0,.35)',1);metal(c,xt+tw+30,A-9,10,18,{tone:'steel',r:2});
  metal(c,372,A-34,22,10,{tone:'dark',r:2});handle(c,xt+40,A-th-18,true);text(c,'turn thimble',xt+40,A-th-36,'#42d9ca',10,'center',700);
  text(c,'anvil',170,A-26,'#8ca6b9',9.5,'center',600);text(c,'spindle',(xs+392)/2,A-22,'#8ca6b9',9.5,'center',600);text(c,'sleeve',xz+8,A+28,'#8ca6b9',9.5,'left',600);text(c,'ratchet',xt+tw+18,A+30,'#8ca6b9',9.5,'center',600);text(c,'lock',383,A-42,'#8ca6b9',9,'center',600);
  INT['screw-gauge'].btn={x:492,y:98,w:168,h:34};button(c,INT['screw-gauge'].btn,sz?'Ratchet to contact':'Close the gap',false);
  // magnifier: sleeve + thimble scales
  const mx=40,my=338,mw=420,mh=62,KK=40,sh=Math.max(0,r.Rr-5.5),X=v=>mx+20+(v-sh)*KK,te=X(r.Rr),yb=my+36;c.save();c.fillStyle='#0b1a26f2';c.strokeStyle='#29475b';c.beginPath();c.roundRect(mx,my,mw,mh,8);c.fill();c.stroke();c.beginPath();c.roundRect(mx,my,mw,mh,8);c.clip();
  c.fillStyle='#cfd8de';c.fillRect(mx,my+16,mw,40);line(c,mx,yb,te,yb,INK,1.2);for(let v=0;v<=r.Rr+1e-9;v+=.5){const x=X(v);if(x<mx)continue;const whole=Math.abs(v-Math.round(v))<1e-6;line(c,x,yb,x,whole?yb-10:yb+10,INK,1);if(whole)text(c,String(Math.round(v)),x,yb-15,'#33414c',8.5,'center',700)}
  c.fillStyle='#9aa6ae';c.fillRect(te,my+12,mx+mw-te,48);for(let j=-3;j<=3;j++){const d=((r.n+j)%50+50)%50,y=yb-j*8,hit=j===0;line(c,te,y,te+(d%5===0?16:10),y,hit?'#e03131':INK,hit?2:1);text(c,String(d),te+20,y,hit?'#e03131':'#22303a',8,'left',700)}c.restore();
  text(c,'MAGNIFIED SLEEVE + THIMBLE SCALE',mx+8,my+7,'#42d9ca',8.5,'left',700);
  const gap=p.gap-sz;text(c,p.obj==='none'?'SPINDLE FREE':gap>.005?'GAP · CLOSE TO THE OBJECT':'IN CONTACT ✓',480,346,gap>.005&&p.obj!=='none'?'#ffc36b':'#42d9ca',10,'left',700);text(c,`${f(r.reading,2)} mm`,480,366,'#e9f6ff',17,'left',700);
  text(c,`${f(r.psr,1)} + ${r.n} × ${f(r.lc,2)} mm`,480,384,'#8ca6b9',10,'left',600);text(c,`zero correction: ${p.zero>0?'−':'+'}${f(Math.abs(p.zero),2)} mm → ${f(r.reading-p.zero,2)} mm`,480,398,'#8ca6b9',9.5,'left',600)},
 down(q,p){const b=INT['screw-gauge'].btn;if(b&&q.x>=b.x&&q.x<=b.x+b.w&&q.y>=b.y&&q.y<=b.y+b.h){p.gap=SOBJ[p.obj][1];return}sDrag={x:q.x,y:q.y,g:p.gap}},
 move(q,p){if(!sDrag)return;const pitch=Number(p.pitch)||.5,lc=pitch/50,sz=SOBJ[p.obj][1];const g=sDrag.g+(q.x-sDrag.x)/G.K*.5-(q.y-sDrag.y)/4*lc;p.gap=Math.round(clamp(g,sz,25)/lc)*lc;p.gap=Number(p.gap.toFixed(2))},
 up(q,p){sDrag=null}};
})();
