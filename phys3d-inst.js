/* Realistic measuring instruments: a stainless-steel vernier caliper and a micrometer screw gauge.
   Both are modelled on the real tools, with engraved scales, and a magnifier inset so the reading can be taken. */
(() => {
'use strict';
const {f,clamp,TAU,C}=window.PhysicaLab;
const P3=window.Physica3D,V=P3.vec;
const reg=(id,fn)=>{(window.Physica3DRenderers=window.Physica3DRenderers||{})[id]=fn};
const STEEL='#c9d1d8',STEEL2='#aeb8c1',INK='#1b2129';
// A flat part: 2D outline (x,y) extruded between z0 and z1, with lit sides.
function prism(s,pts,z0,z1,col,opt={}){const n=pts.length,front=pts.map(([x,y])=>[x,y,z1]),back=pts.map(([x,y])=>[x,y,z0]).reverse();
  s.poly(front,col,{normal:[0,0,1],spec:opt.spec??.35,shine:30});s.poly(back,col,{normal:[0,0,-1]});
  for(let i=0;i<n;i++){const a=pts[i],b=pts[(i+1)%n],e=[b[0]-a[0],b[1]-a[1]],nn=V.norm([e[1],-e[0],0]);s.poly([[a[0],a[1],z0],[b[0],b[1],z0],[b[0],b[1],z1],[a[0],a[1],z1]],col,{normal:nn,cull:false})}return s}
// 2D magnifier box drawn on the stage (theme-aware through the wrapped context).
function inset(c,x,y,w,h,title,drawFn){c.save();c.fillStyle='#0b1a26ee';c.strokeStyle='#42d9ca';c.lineWidth=1.5;c.beginPath();c.roundRect(x,y,w,h,8);c.fill();c.stroke();c.beginPath();c.roundRect(x,y,w,h,8);c.clip();drawFn(c);c.restore();
  c.save();c.font='700 11px system-ui, sans-serif';c.fillStyle='#42d9ca';c.fillText(title,x+8,y+14);c.restore();(window.__chartRects||(window.__chartRects=[])).push([x-4,y-4,x+w+4,y+h+4])}

/* ---------- Vernier caliper (least count 0.01 cm) ---------- */
reg('units',(c,p,t)=>{const s=P3.scene(c,{scale:60,pitch:.12,yaw:.05,cy:250,cx:330}),u=.62,x0=-2.4,cmMax=8,beamR=x0+cmMax*u+.35,m=clamp(p.measure,0,cmMax-1),d=m*u,xd=x0+d,
    msr=Math.floor(m*10+1e-9)/10,vs=Math.round((m-msr)*100)%10,z=.05;
  // Beam with the main scale (mm) engraved on its front face.
  prism(s,[[x0-.55,-.28],[beamR,-.28],[beamR,.28],[x0-.55,.28]],-z,z,STEEL);
  const zb=s.P([(x0-.55+beamR)/2,0,z])[2]+.001;for(let i=0;i<=cmMax*10;i++){const X=x0+i*u/10,L=i%10===0?.2:i%5===0?.14:.09;s.seg([X,-.04,z+.004],[X,-.04+L,z+.004],INK,i%10===0?1.4:1,[],zb)}
  for(let i=0;i<=cmMax;i++)s.engrave([x0+i*u,.2,z+.01],String(i),INK,11,zb);s.engrave([beamR-.18,.2,z+.01],'cm',INK,9,zb);
  // Fixed jaws: outside (down) and inside (up).
  prism(s,[[x0-.55,-.28],[x0,-.28],[x0,-2.0],[x0-.12,-2.0],[x0-.55,-.95]],-z,z,STEEL);prism(s,[[x0-.38,.28],[x0,.28],[x0,.95],[x0-.08,.95]],-z,z,STEEL);
  // Sliding vernier: plate below the main scale, top rail, moving jaws, thumb wheel, locking screw.
  const vx=xd,pl=[[vx-.05,-.06],[vx+1.55,-.06],[vx+1.55,-.62],[vx-.05,-.62]];prism(s,pl,-z-.07,z+.05,STEEL2);s.box([vx+.75,.33,0],[1.6,.1,.2],STEEL2);s.box([vx+.75,0,-z-.05],[1.6,.66,.04],STEEL2);
  const zv=s.P([vx+.75,-.34,z+.05])[2]+.001;for(let i=0;i<=10;i++){const X=vx+i*.09*u,hit=i===vs,L=i%5===0?.16:.1;s.seg([X,-.065,z+.055],[X,-.065-L,z+.055],hit?'#e03131':INK,hit?2.2:1,[],zv)}
  for(const i of[0,5,10])s.engrave([vx+i*.09*u,-.33,z+.06],String(i),INK,10,zv);
  prism(s,[[vx,-.62],[vx+.75,-.62],[vx+.16,-2.0],[vx,-2.0]],-z,z,STEEL);prism(s,[[vx,.38],[vx+.3,.38],[vx+.08,.95],[vx,.95]],-z,z,STEEL);
  s.cyl([vx+1.15,-.72,0],[0,0,1],.13,.12,'#8a949c');for(let i=0;i<12;i++){const a=TAU*i/12+t*.2;s.seg([vx+1.15+.13*Math.cos(a),-.72+.13*Math.sin(a),.07],[vx+1.15+.1*Math.cos(a),-.72+.1*Math.sin(a),.07],INK,1)}
  s.cyl([vx+.9,.45,0],[0,1,0],.07,.18,'#8a949c');s.cyl([vx+.9,.56,0],[0,1,0],.11,.06,'#6c757d');
  s.box([beamR+d/2,-.18,0],[Math.max(.02,d),.06,.05],STEEL2);
  // The object held between the outside jaws.
  if(d>.04)s.cyl([x0+d/2,-1.3,0],[0,1,0],d/2,.95,'#c9a227',{cap:'#e0bf52',seg:28});
  const L=(q,txt,col,dx,dy)=>s.callout(q,txt,col,dx,dy);L([x0+3*u,.05,z],'main scale (1 mm divisions)','#e9f6ff',40,-70);L([vx+.5*u,-.2,z+.06],'vernier scale: 10 div = 9 mm','#e9f6ff',40,60);
  L([x0-.2,-1.4,z],'fixed jaw','#dbe7f0',-60,30);L([vx+.1,-1.6,z],'sliding jaw','#dbe7f0',50,50);L([x0-.1,.8,z],'inside jaws','#dbe7f0',-50,-30);L([vx+.9,.6,0],'locking screw','#dbe7f0',30,-50);L([beamR+d,-.18,0],'depth rod','#dbe7f0',30,40);if(d>.04)L([x0+d/2,-1.35,.25],`object: ${f(m,2)} cm`,'#e0bf52',-70,60);
  s.render();
  // Magnifier: main scale and vernier around the vernier zero.
  inset(c,404,104,252,132,'MAGNIFIED READING',g=>{const mm=15,X=v=>470+(v-m*10)*mm,yb=176;g.strokeStyle='#cfd8df';g.fillStyle='#cfd8df';g.fillRect(404,150,252,26);g.fillStyle='#b7c2cb';g.fillRect(404,176,252,30);
    g.lineWidth=1;g.strokeStyle=INK;g.fillStyle=INK;g.font='700 10px system-ui';g.textAlign='center';for(let i=Math.floor(msr*10)-5;i<=Math.floor(msr*10)+14;i++){if(i<0)continue;const xx=X(i),Lh=i%10===0?18:i%5===0?13:8;g.beginPath();g.moveTo(xx,yb);g.lineTo(xx,yb-Lh);g.stroke();if(i%10===0)g.fillText(String(i/10),xx,yb-21)}
    for(let i=0;i<=10;i++){const xx=X(m*100/10)+i*.9*mm,hit=i===vs;g.strokeStyle=hit?'#e03131':INK;g.lineWidth=hit?2.4:1;g.beginPath();g.moveTo(xx,yb);g.lineTo(xx,yb+(i%5===0?14:9));g.stroke();if(i%5===0){g.fillStyle=INK;g.fillText(String(i),xx,yb+25)}}
    g.textAlign='left';g.font='700 11px system-ui';g.fillStyle='#ffd43b';g.fillText(`MSR ${f(msr,1)} cm + ${vs} × 0.01 cm = ${f(msr+vs/100,2)} cm`,412,226)});
  window.PhysicaLab.tag(c,`Reading = MSR + VSD × LC = ${f(msr,1)} + ${vs} × 0.01 = ${f(msr+vs/100,2)} cm`,44,98,C.gold,14)});

/* ---------- Micrometer screw gauge ---------- */
reg('screw-gauge',(c,p,t)=>{const s=P3.scene(c,{scale:66,pitch:.18,yaw:.12,cx:250,cy:255}),Lr=p.turns*p.pitch+p.division*p.pitch/50,k=.2,gap=Lr*k,ax=-1.15,a0=ax+.42,xs=1.0,xz=1.25,xe=xz+gap,rS=.16,rT=.3,z=.24;
  // C-shaped frame (enamelled) carrying the anvil on the left and the sleeve on the right.
  const cxf=(ax-.15+1.1)/2,rx=(1.1-(ax-.15))/2,rxi=rx-.4,arc=(r,ry,from,to)=>Array.from({length:25},(_,i)=>{const a=from+(to-from)*i/24;return[cxf+r*Math.cos(a),-.35+ry*Math.sin(a)]});
  prism(s,[[ax-.15,.32],...arc(rx,1.55,Math.PI,TAU),[1.1,.32],[cxf+rxi,.32],...arc(rxi,1.12,TAU,Math.PI),[cxf-rxi,.32]],-z,z,'#2f4a5e');
  s.cyl([ax+.37,0,0],[1,0,0],.15,.12,STEEL);
  // Spindle, sleeve (barrel) with the linear scale, thimble with 50 divisions, ratchet.
  s.cyl([(a0+gap+xe)/2,0,0],[1,0,0],.12,Math.max(.05,xe-a0-gap),STEEL);s.cyl([(xs+xz+2.4)/2,0,0],[1,0,0],rS,xz+2.4-xs,STEEL2);
  const zs=9e5;for(let v=0;v<=12;v+=.5){const X=xz+v*k;if(X>xe+.002&&v>0)break;const half=v%1!==0;s.seg([X,0,rS+.004],[X,half?-.09:.09,rS+.004],INK,1.2,[],zs)}
  s.seg([xz,0,rS+.004],[Math.max(xz,xe),0,rS+.004],INK,1.2,[],zs);
  s.cyl([xe+.6,0,0],[1,0,0],rT,1.2,'#b7c2cb');s.cyl([xe+.02,0,0],[1,0,0],rT*.92,.04,'#d0d8de');for(let i=0;i<16;i++){const a=TAU*i/16+TAU*p.division/50;s.seg([xe+.75,rT*Math.cos(a),rT*Math.sin(a)],[xe+1.15,rT*Math.cos(a),rT*Math.sin(a)],'#7f8b95',1)}
  const zt=9e5+1;for(let i=0;i<50;i++){const a=(i-p.division)*TAU/50,cz=Math.cos(a);if(cz<.35)continue;const y=rT*Math.sin(a),zz=rT*cz,L=i%5===0?.14:.08,hit=i===p.division;s.seg([xe+.03,y,zz+.004],[xe+.03+L,y,zz+.004],hit?'#e03131':INK,hit?2:1,[],zt);if(i%5===0)s.engrave([xe+.27,y,zz+.01],String(i),hit?'#e03131':INK,9,zt)}
  s.cyl([xe+1.45,0,0],[1,0,0],.18,.45,'#8a949c');s.cyl([xe+1.75,0,0],[1,0,0],.12,.15,'#6c757d');
  if(gap>.03)s.cyl([a0+gap/2,0,0],[0,1,0],gap/2,.7,'#d9844a');
  const L=(q,txt,col,dx,dy)=>s.callout(q,txt,col,dx,dy);L([ax+.43,.15,0],'anvil','#dbe7f0',-50,-60);L([a0+gap+.3,.12,0],'spindle','#dbe7f0',-10,-70);L([(xz+xe)/2,.05,rS],'sleeve: main (pitch) scale','#e9f6ff',-20,-80);L([xe+.6,rT,0],'thimble: 50 divisions','#e9f6ff',30,-60);L([xe+1.55,.18,0],'ratchet','#dbe7f0',30,-40);L([(ax-.15+1.1)/2,-1.9,z],'U-frame','#91a7ff',-60,20);if(gap>.03)L([a0+gap/2,-.35,0],`wire: ${f(Lr,3)} mm`,'#d9844a',-40,50);
  s.render();
  inset(c,404,104,252,132,'MAGNIFIED READING',g=>{const px=40,sh=Math.max(0,Lr-3.6),X=v=>414+(v-sh)*px,yb=170,te=X(Lr);g.fillStyle='#b7c2cb';g.fillRect(404,150,252,40);
    g.strokeStyle=INK;g.fillStyle=INK;g.lineWidth=1.2;g.beginPath();g.moveTo(404,yb);g.lineTo(te,yb);g.stroke();g.font='700 10px system-ui';g.textAlign='center';
    for(let v=0;v<=Lr+1e-9;v+=.5){if(X(v)<404)continue;const half=Math.abs(v%1)>.01;g.beginPath();g.moveTo(X(v),yb);g.lineTo(X(v),half?yb+10:yb-10);g.stroke();if(!half)g.fillText(String(Math.round(v)),X(v),yb-14)}
    g.fillStyle='#8f9ba5';g.fillRect(te,146,404+252-te,48);for(let j=-4;j<=4;j++){const dv=(p.division+j+50)%50,yy=yb-j*9;g.lineWidth=j===0?2.2:1;g.strokeStyle=j===0?'#e03131':INK;g.beginPath();g.moveTo(te,yy);g.lineTo(te+(dv%5===0?16:10),yy);g.stroke();if(dv%5===0){g.fillStyle=j===0?'#e03131':INK;g.textAlign='left';g.fillText(String(dv),te+19,yy+3)}}
    g.textAlign='left';g.font='700 11px system-ui';g.fillStyle='#ffd43b';g.fillText(`${f(p.turns*p.pitch,1)} mm + ${p.division} × ${f(p.pitch/50,3)} mm = ${f(Lr,3)} mm`,412,226)});
  window.PhysicaLab.tag(c,`Reading = PSR + CSD × LC = ${f(p.turns*p.pitch,1)} + ${p.division} × ${f(p.pitch/50,3)} = ${f(Lr,3)} mm`,44,98,C.gold,14)});
})();
