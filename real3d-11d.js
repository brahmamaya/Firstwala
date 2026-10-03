/* Detailed, realistic 3D apparatus for Class 11 physics (part d):
   thermal properties of matter, thermodynamics and kinetic theory.
   Each scene keeps the experiment's own parameters, physics and readouts; only the apparatus is new. */
(() => {
'use strict';
const R=window.PhysicaReal3D=window.PhysicaReal3D||{};
const {f,clamp,rad,deg,cycle,memo,tag,chart,PI,TAU,C}=window.PhysicaLab;
const P3=window.Physica3D,V=P3.vec;
const hash=i=>{const x=Math.sin(i*127.1+311.7)*43758.5453;return x-Math.floor(x)};
const rgb=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
const mix=(a,b,k)=>{k=clamp(k,0,1);const A=rgb(a),B=rgb(b);return'#'+A.map((v,i)=>Math.round(v+(B[i]-v)*k).toString(16).padStart(2,'0')).join('')};
const heatCol=T=>{const k=clamp((T-20)/300,0,1);return'#'+[150+105*k,150-60*k,170-150*k].map(v=>Math.round(clamp(v,0,255)).toString(16).padStart(2,'0')).join('')};
const waterCol=T=>mix('#3d8fd1','#e8590c',clamp(T/100,0,1)*.55);
const STEEL='#d4d9de',IRON='#9aa1a8',DARK='#596066',CU='#b87333',BRASS='#c9a227',GLASS='#dff3ff',WOOD='#7a5230',EBON='#26292d';
const lab=(s,p,txt,dx=46,dy=-26)=>s.callout(p,txt,C.mint,dx,dy,11);
const smooth=x=>{x=clamp(x,0,1);return x*x*(3-2*x)};

/* ---------- shared lab furniture ---------- */
function bench(s,x,y,w,d){s.box([x,y-.09,0],[w,.18,d],'#6e4a2c',{ground:true})}
// Torus (metal band, O-ring) around a vertical axis.
function band(s,[x,y,z],r,w,col){s.tube(Array.from({length:29},(_,i)=>[x+r*Math.cos(TAU*i/28),y,z+r*Math.sin(TAU*i/28)]),w,col,{segs:6})}
// Glass vessel standing on its base at p: walls, thick base, rim and a vertical highlight.
function glassVessel(s,[x,y,z],r,h,o={}){s.cyl([x,y+h/2,z],[0,1,0],r,h,GLASS,{alpha:.12,caps:false});s.cyl([x,y+.025,z],[0,1,0],r,.05,GLASS,{alpha:.3});s.ring([x,y+h,z],[0,1,0],r,'#ffffffaa',1.6,[],36);
  const a=2.2,hx=x+r*.97*Math.cos(a),hz=z+r*.97*Math.sin(a);s.seg([hx,y+h*.12,hz],[hx,y+h*.92,hz],'#ffffff66',2.4);s.seg([x+r*.97*Math.cos(1.2),y+h*.2,z+r*.97*Math.sin(1.2)],[x+r*.97*Math.cos(1.2),y+h*.7,z+r*.97*Math.sin(1.2)],'#ffffff33',1.5);
  if(o.grad)for(let i=1;i<=o.grad;i++){const yy=y+h*i/(o.grad+1),q=[x+r*Math.cos(1.75),yy,z+r*Math.sin(1.75)];s.seg(q,V.add(q,[i%2?.1:.18,0,0]),'#ffffffaa',1.2)}}
function liquid(s,[x,y,z],r,h,col,a=.55){if(h>.005)s.cyl([x,y+h/2,z],[0,1,0],r,h,col,{alpha:a})}
// Back half of a vessel cut open along z = 0 (inner wall, rim and both cut faces), for cut-away views.
function cutaway(s,[x,y,z],ri,ro,h,col,inCol=col,seg=14){const P=(r,a,yy)=>[x+r*Math.cos(a),yy,z+r*Math.sin(a)];
  for(let i=0;i<seg;i++){const a=PI+PI*i/seg,b=PI+PI*(i+1)/seg,m=(a+b)/2;s.poly([P(ri,a,y),P(ri,b,y),P(ri,b,y+h),P(ri,a,y+h)],inCol,{normal:[-Math.cos(m),0,-Math.sin(m)]});if(ro>ri)s.poly([P(ri,a,y+h),P(ri,b,y+h),P(ro,b,y+h),P(ro,a,y+h)],col,{normal:[0,1,0]})}
  s.poly(Array.from({length:seg+1},(_,i)=>P(ri,PI+PI*i/seg,y)),inCol,{normal:[0,1,0],bias:-.3});
  if(ro>ri)for(const g of[-1,1])s.poly([[x+g*ri,y,z],[x+g*ro,y,z],[x+g*ro,y+h,z],[x+g*ri,y+h,z]],col,{normal:[0,0,1],bias:.02})}
// Mercury-in-glass thermometer: bulb at b, white enamel scale, mercury column filling `fr` of the stem.
function thermometer(s,b,len,fr,o={}){const [x,y,z]=b,fr1=clamp(fr,0,1);s.cyl([x,y+.06+len/2,z],[0,1,0],.05,len,GLASS,{alpha:.28});s.box([x,y+.1+len*.47,z-.03],[.07,len*.86,.012],'#f1f3f5');
  s.ball([x,y,z],.07,'#aab1b8');s.cyl([x,y+.06+len*.86*fr1/2,z+.005],[0,1,0],.018,Math.max(.01,len*.86*fr1),'#7d858c',{caps:false});
  for(let i=0;i<=20;i++){const yy=y+.06+len*.86*i/20;s.seg([x-.03,yy,z-.02],[x+(i%5?.0:.03),yy,z-.02],'#30363c',i%5?.8:1.2)}s.ball([x,y+.08+len,z],.045,GLASS,{alpha:.35});if(o.label)s.label([x,y+len+.28,z],o.label,o.col||C.gold,12)}
// Retort stand: heavy base, chromed rod and a boss-head clamp reaching to `reach`.
function stand(s,[x,y,z],H,clampY,reach){s.box([x,y+.04,z],[.8,.08,.55],'#2f3438');s.cyl([x,y+H/2,z-.12],[0,1,0],.035,H,'#c3c9cf');s.ball([x,y+H,z-.12],.04,'#9aa1a8');
  if(clampY!=null){s.box([x,clampY,z-.12],[.12,.12,.12],'#5c636a');const e=reach||[x+.6,clampY,z];s.cyl(V.mul(V.add([x,clampY,z-.12],e),.5),V.sub(e,[x,clampY,z-.12]),.025,Math.hypot(...V.sub(e,[x,clampY,z-.12])),'#aab1b8');s.box(e,[.09,.12,.14],'#3f454b')}}
// Bunsen burner: base, brass barrel, air collar, gas hose and a two-cone blue flame.
function burner(s,[x,y,z],t,on=true,bh=.55,fh=.42,k=1){s.cyl([x,y+.03,z],[0,1,0],.24*k,.06,'#30363b');s.lathe([x,y+.06,z],[[.2*k,0],[.12*k,.05],[.07*k,.1]],'#3b4248',{segs:16});s.cyl([x,y+.06+bh/2,z],[0,1,0],.055*k,bh,BRASS);s.cyl([x,y+.2,z],[0,1,0],.07*k,.09,IRON);s.box([x,y+.2,z+.066*k],[.035,.04,.01],'#111');
  s.cyl([x-.13*k,y+.12,z],[1,0,0],.022,.18,STEEL);s.tube([[x-.22*k,y+.12,z],[x-.4*k,y+.08,z+.1],[x-.6*k,y+.02,z+.25]],.028,'#c2410c',{segs:6});
  if(on){const w=1+.06*Math.sin(t*23)+.04*Math.sin(t*37),b=[x,y+.06+bh,z];s.lathe(b,[[.05*k,0],[.075*k,fh*.25*w],[.06*k,fh*.6*w],[.0,fh*w]],'#4dabf7',{alpha:.32,segs:14});s.lathe(b,[[.04*k,0],[.045*k,fh*.12],[0,fh*.42*w]],'#a5d8ff',{alpha:.55,segs:12});s.ball(V.add(b,[0,fh*.3,0]),.05*k,'#74c0fc',{glow:true,flat:true,alpha:.25})}}
// Electric hot plate with a glowing spiral element.
function hotplate(s,[x,y,z],w,on,t){s.box([x,y+.14,z],[w,.28,w*.85],'#d8dde2');s.cyl([x,y+.3,z],[0,1,0],w*.36,.05,'#2b2f33');const g=on?mix('#5a2a1a','#ff5a1f',.65+.2*Math.sin(t*3)):'#4a4e52';for(let i=1;i<=3;i++)s.ring([x,y+.33,z],[0,1,0],w*.1*i,g,2.2,[],36);
  s.cyl([x+w*.3,y+.14,z+w*.43],[0,0,1],.06,.06,'#30363b');s.ball([x-w*.3,y+.16,z+w*.43],.03,on?'#ff6b3c':'#555',{flat:true,glow:on})}
// Bourdon pressure gauge facing +z; frac 0..1 of full scale.
function gauge(s,p,frac,txt,R0=.45){const q=a=>[Math.cos(a),Math.sin(a)];s.cyl(p,[0,0,1],R0,.16,'#8f969d');s.cyl(V.add(p,[0,0,.085]),[0,0,1],R0*.88,.012,'#f8f9fa');band(s,V.add(p,[0,0,.08]),R0*.92,.03,BRASS);
  const a0=PI*1.25,span=PI*1.5;for(let i=0;i<=20;i++){const a=a0-span*i/20,[cx,cy]=q(a),r1=R0*.78,r2=R0*(i%5?.7:.62);s.seg(V.add(p,[cx*r1,cy*r1,.095]),V.add(p,[cx*r2,cy*r2,.095]),'#1b1f23',i%5?.8:1.4)}
  s.box(V.add(p,[R0*.42,-R0*.55,.095]),[R0*.32,R0*.12,.005],'#dc3545');const a=a0-span*clamp(frac,0,1.05),[nx,ny]=q(a);s.seg(V.add(p,[-nx*.08,-ny*.08,.11]),V.add(p,[nx*R0*.72,ny*R0*.72,.11]),'#d6336c',2.4);s.ball(V.add(p,[0,0,.11]),.035,'#343a40',{flat:true});
  s.cyl(V.add(p,[0,-R0-.1,0]),[0,1,0],.05,.22,BRASS);s.cyl(V.add(p,[0,-R0-.2,0]),[0,1,0],.08,.08,BRASS,{seg:6});if(txt)s.label(V.add(p,[0,-R0-.45,0]),txt,C.gold,12)}
// Gas molecules as shaded spheres bouncing in a box of half-size L about o.
function gas(s,n,L,v,t,col='#42d9ca',r=.06,seed=0,o=[0,0,0],cols){const tri=x=>{const q=((x%2)+2)%2;return q<1?q:2-q};const out=[];for(let i=0;i<n;i++){const sp=v*(.6+hash(i+seed)*.8),pos=[0,1,2].map(k=>o[k]+(tri(t*sp*(.7+hash(i+k*31+seed))+hash(i+k*11+seed)*2)*2-1)*(L[k]-r));s.ball(pos,r,cols?cols(i,sp):col);out.push(pos)}return out}
function gasRound(s,n,R0,y0,h,v,t,col,r=.06,seed=0){const tri=x=>{const q=((x%2)+2)%2;return q<1?q:2-q};for(let i=0;i<n;i++){const sp=v*(.6+hash(i+seed)*.8),a=TAU*hash(i+7+seed)+t*sp*.9*(hash(i+3)-.5),rr=(R0-r)*Math.sqrt(tri(t*sp*.6+hash(i+13+seed)*2));s.ball([rr*Math.cos(a),y0+r+(h-2*r)*tri(t*sp*(.7+hash(i+5+seed))+hash(i+9+seed)*2),rr*Math.sin(a)],r,col)}}
// Digital readout box with a green LCD.
function readout(s,p,txt,w=.95){s.box(p,[w,.42,.3],'#2b3036');s.box(V.add(p,[0,.03,.152]),[w*.82,.24,.01],'#0b3d2e');s.engrave(V.add(p,[0,.03,.16]),txt,'#69f0ae',12)}
// Gas cylinder: steel base, glass barrel with tie rods, metal piston with rings and rod. Returns the piston-top height.
function pcyl(s,o){const {x=0,z=0,y0=.3,R:r=.8,H=2.6,h,gas='#ff9a3c',ga=.18,rodL=.9,base=true}=o;if(base){s.box([x,y0/2,z],[2*r+.6,y0,2*r+.6],'#5b6168');s.box([x,y0-.02,z],[2*r+.3,.04,2*r+.3],'#868e96')}
  s.cyl([x,y0+H/2,z],[0,1,0],r+.03,H,GLASS,{alpha:.11,caps:false});band(s,[x,y0+.05,z],r+.06,.05,IRON);band(s,[x,y0+H,z],r+.06,.05,IRON);
  for(let i=0;i<4;i++){const a=PI/4+i*PI/2,X=x+(r+.2)*Math.cos(a),Z=z+(r+.2)*Math.sin(a);s.cyl([X,y0+H/2,Z],[0,1,0],.03,H,STEEL);s.cyl([X,y0+H+.02,Z],[0,1,0],.06,.07,IRON,{seg:6})}
  const hx=x+(r+.02)*Math.cos(2.1),hz=z+(r+.02)*Math.sin(2.1);s.seg([hx,y0+.2,hz],[hx,y0+H-.15,hz],'#ffffff55',2.5);
  if(h>.01)s.cyl([x,y0+h/2,z],[0,1,0],r-.01,h,gas,{alpha:ga});const py=y0+h;s.cyl([x,py+.11,z],[0,1,0],r-.01,.22,'#aeb5bc',{cap:'#c3c9cf'});band(s,[x,py+.06,z],r-.004,.014,'#2f3438');band(s,[x,py+.15,z],r-.004,.014,'#2f3438');
  if(rodL>0){s.cyl([x,py+.22+rodL/2,z],[0,1,0],.06,rodL,STEEL);s.cyl([x,py+.24+rodL,z],[1,0,0],.05,.5,'#2b2f33')}return py+.22}
function gasIn(s,n,[x,z],r0,y0,h,v,t,col,r=.06,seed=0){const tri=q=>{const w=((q%2)+2)%2;return w<1?w:2-w};for(let i=0;i<n;i++){const sp=v*(.6+hash(i+seed)*.8),a=TAU*hash(i+7+seed)+t*sp*.9*(hash(i+3)-.5),rr=(r0-r)*Math.sqrt(tri(t*sp*.6+hash(i+13+seed)*2)),yy=y0+r+Math.max(0,h-2*r)*tri(t*sp*(.7+hash(i+5+seed))+hash(i+9+seed)*2);s.ball([x+rr*Math.cos(a),yy,z+rr*Math.sin(a)],r,col)}}
function weights(s,[x,y,z],n,r=.5){for(let i=0;i<n;i++){s.cyl([x,y+.07+i*.14,z],[0,1,0],r,.13,i%2?'#b8921f':BRASS,{cap:'#d4b13a'});s.box([x+r*.6,y+.07+i*.14,z+r*.0],[r*.8,.135,.08],'#3a3f44',{})}}
function stopwatch(s,p,sec,txt){s.cyl(p,[0,0,1],.32,.12,'#2b2f33');s.cyl(V.add(p,[0,0,.065]),[0,0,1],.27,.01,'#f8f9fa');band(s,V.add(p,[0,0,.06]),.29,.025,STEEL);for(let i=0;i<12;i++){const a=TAU*i/12;s.seg(V.add(p,[.22*Math.sin(a),.22*Math.cos(a),.075]),V.add(p,[.25*Math.sin(a),.25*Math.cos(a),.075]),'#1b1f23',1.2)}
  const a=TAU*sec/60;s.seg(V.add(p,[0,0,.08]),V.add(p,[.22*Math.sin(a),.22*Math.cos(a),.08]),'#d6336c',2);s.cyl(V.add(p,[0,.38,0]),[0,1,0],.05,.1,STEEL);s.ball(V.add(p,[0,.45,0]),.05,STEEL);if(txt)s.label(V.add(p,[0,-.5,0]),txt,C.gold,12)}

/* ================= Thermal Properties of Matter ================= */
R['expansion']=(c,p,t)=>{const s=P3.scene(c,{scale:58,yaw:.3,pitch:.02,cx:330,cy:318}),dT=p.temperature-20,dL=p.alpha*1e-6*p.length*dT,mm=dL*1000,L=1.6+p.length*1.1,ext=clamp(dL*120,0,.5),x0=-L/2-.4,ry=.95,xt=x0+L+ext,hot=clamp(dT/200,0,1);
  bench(s,0,0,L+4.4,2.2);
  // fixed end: heavy clamp block with screw
  s.box([x0-.12,.48,0],[.42,.96,.7],'#4a5157');s.box([x0-.12,ry+.2,0],[.42,.14,.7],'#5c636a');s.cyl([x0-.12,ry+.45,0],[0,1,0],.04,.4,STEEL);s.cyl([x0-.12,ry+.66,0],[0,0,1],.03,.5,STEEL);
  // the rod, tinted as it heats
  s.cyl([(x0+xt)/2,ry,0],[1,0,0],.075,xt-x0,mix(CU,'#ff6a2a',hot*.6),{seg:18});
  for(const u of[.45,.9]){const X=x0+L*u;s.box([X,(ry-.14)/2,0],[.12,ry-.14,.3],'#868e96');s.cyl([X,ry-.12,0],[0,0,1],.05,.32,STEEL)}
  for(const u of[.22,.5,.78])burner(s,[x0+L*u,0,.05],t+u*3,dT>0,.3,.42*Math.min(1,.4+hot));
  // dial gauge on a magnetic base, plunger touching the free end
  const D=[x0+L+1.05,ry+.15,.05];s.box([D[0],.18,0],[.5,.36,.5],'#2f3438');s.cyl([D[0],(ry+.36)/2,-.1],[0,1,0],.04,ry-.1,'#c3c9cf');s.cyl([(xt+D[0]-.42)/2,ry,0],[1,0,0],.03,Math.max(.02,D[0]-.42-xt),STEEL);s.ball([xt+.02,ry,0],.04,STEEL);s.cyl([D[0]-.4,ry,0],[1,0,0],.06,.14,IRON);
  const g=D,Rg=.42;s.cyl(g,[0,0,1],Rg,.16,'#c3c9cf');s.cyl(V.add(g,[0,0,.085]),[0,0,1],Rg*.9,.01,'#f8f9fa');band(s,V.add(g,[0,0,.08]),Rg*.93,.03,'#aab1b8');
  for(let i=0;i<50;i++){const a=PI/2-TAU*i/50,r2=Rg*(i%5?.74:.66);s.seg(V.add(g,[Math.cos(a)*Rg*.8,Math.sin(a)*Rg*.8,.095]),V.add(g,[Math.cos(a)*r2,Math.sin(a)*r2,.095]),'#1b1f23',i%5?.7:1.2)}
  const a1=PI/2-TAU*(mm%1),a2=PI/2-TAU*Math.min(mm,10)/10;s.seg(V.add(g,[0,0,.11]),V.add(g,[Math.cos(a1)*Rg*.72,Math.sin(a1)*Rg*.72,.11]),'#d6336c',2.2);s.seg(V.add(g,[0,-.14,.1]),V.add(g,[Math.cos(a2)*.09,-.14+Math.sin(a2)*.09,.1]),'#1b1f23',1.6);s.ring(V.add(g,[0,-.14,.096]),[0,0,1],.1,'#868e96',1,[],24);
  stand(s,[x0+L*.64,0,-.75],1.9,1.6,[x0+L*.64,1.6,-.3]);thermometer(s,[x0+L*.64,ry+.12,-.3],1.05,p.temperature/250,{label:`${p.temperature} °C`});
  lab(s,[x0+L*.32,ry+.07,0],`metal rod, L₀ = ${p.length} m`,-30,-60);lab(s,[x0-.12,.5,.35],'fixed clamp',-40,40);lab(s,V.add(g,[0,-.3,0]),`dial gauge (0.01 mm)`,40,60);lab(s,[x0+L*.78,.35,.05],'Bunsen burner',60,40);lab(s,[x0+L*.64,ry+.9,-.3],'thermometer',60,-10);
  s.render();tag(c,`ΔL = αL₀ΔT = ${f(mm,3)} mm (gauge reads ${f(mm,2)} mm)`,44,98,C.gold,15)};

R['calorimetry']=(c,p,t)=>{const s=P3.scene(c,{scale:56,yaw:.25,pitch:.08,cx:330,cy:322}),Tf=(p.hot+p.ratio*p.cold)/(1+p.ratio),ph=clamp(cycle(t,8)/4,0,1),lift=smooth(ph/.18)*smooth((1-ph)/.12),q=clamp((ph-.18)/.66,0,1),Tm=(q*p.hot+p.ratio*p.cold)/(q+p.ratio),X=.9;
  bench(s,0,0,6,2.4);
  // insulating jacket (wood) with felt lining, cut away to show the copper calorimeter
  s.cyl([X,.06,0],[0,1,0],1.05,.12,'#5a3c22');cutaway(s,[X,.12,0],.86,1.0,1.6,WOOD,'#6b4a2e');cutaway(s,[X,.12,0],.74,.86,1.55,'#d9cfb8','#cfc3a6');
  s.cyl([X,.17,0],[0,1,0],.4,.1,'#a07850');const cb=.22,ch=1.3,cr=.68,lev=.25*p.ratio+.25*q,hw=Math.min(ch-.05,lev);cutaway(s,[X,cb,0],cr-.02,cr,ch,CU,'#c98a4f');band(s,[X,cb+ch,0],cr,.02,'#d08a52');
  liquid(s,[X,cb+.02,0],cr-.03,hw,waterCol(Tm),.6);
  // ebonite lid (cut away), copper stirrer and thermometer
  cutaway(s,[X,1.72,0],.12,1.0,.08,EBON,EBON);const sy=.08*Math.sin(t*4);s.cyl([X-.32,1.25+sy,0],[0,1,0],.022,1.9,'#d08a52');s.cyl([X-.03,cb+.12+sy,0],[0,1,0],.5,.02,'#d08a52',{caps:true});s.cyl([X-.32,2.22+sy,0],[1,0,0],.03,.22,'#d08a52');
  s.cyl([X+.3,1.76,0],[0,1,0],.07,.06,'#c92a2a');thermometer(s,[X+.3,cb+.18,0],2.0,Tm/100,{label:`${f(Tm,1)} °C`});
  // beaker of hot water: lifted, tipped and poured
  const B0=[-1.7,0,.2],B1=[-.3,1.95,.1],B=V.add(B0,V.mul(V.sub(B1,B0),lift)),a=lift*1.2,ax=[Math.sin(a),Math.cos(a),0],br=.42,bh=.95,cen=V.add(B,V.mul(ax,bh/2));
  s.cyl(cen,ax,br,bh,GLASS,{alpha:.14,caps:false});s.cyl(V.add(B,V.mul(ax,.02)),ax,br,.04,GLASS,{alpha:.3});const hl=.62*(1-q);if(hl>.01)s.cyl(V.add(B,V.mul(ax,.03+hl/2)),ax,br-.02,hl,waterCol(p.hot),{alpha:.6});
  const lip=V.add(V.add(B,V.mul(ax,bh)),[Math.cos(a)*br,-Math.sin(a)*br,0]);s.ring(V.add(B,V.mul(ax,bh)),ax,br,'#ffffffaa',1.5,[],30);
  if(lift>.95&&q<1){const e=[X-.25,cb+hw,0],w=.04+.02*Math.sin(t*12);s.tube([lip,V.add(lip,[.12,-.1,0]),[lip[0]+.2,(lip[1]+e[1])/2,0],e],w,waterCol(p.hot),{segs:6,alpha:.75});
    for(let i=0;i<4;i++){const u=cycle(t*1.4+i*.25,1);s.ball([X-.25+(hash(i)-.5)*.3,cb+hw+.25*u,(hash(i+4)-.5)*.3],.03,'#ffffff',{alpha:.5*(1-u),flat:true})}}
  if(lift<.05)thermometer(s,[B[0]+.18,.15,B[2]],1.3,p.hot/100,{label:`${p.hot} °C`});
  lab(s,[X-.93,1.0,-.1],'insulating jacket',-40,-50);lab(s,[X-.79,.9,-.2],'felt lining',-60,10);lab(s,[X+.5,.5,-.4],'copper calorimeter',90,30);lab(s,[X-.32,2.1+sy,0],'stirrer',-40,-30);lab(s,[X+.6,1.76,0],'ebonite lid',70,-10);lab(s,V.add(B,V.mul(ax,.4)),`hot water ${p.hot} °C`,-80,10);lab(s,[X,cb+hw*.4,.5],`cold water ${p.cold} °C (×${p.ratio} mass)`,40,40);
  s.render();tag(c,`T_final = ${f(Tf,1)} °C`,44,98,C.gold,15)};

R['newton-cooling']=(c,p,t)=>{const s=P3.scene(c,{scale:56,yaw:.3,pitch:.08,cx:215,cy:325}),tt=cycle(t*4,80),T=p.ambient+(p.initial-p.ambient)*Math.exp(-p.rate*tt),X=-.2,cr=.62,ch=1.25,y0=.32;
  bench(s,0,0,5,2.4);s.cyl([X,.16,0],[0,1,0],.8,.32,'#a07850');s.cyl([X,.33,0],[0,1,0],.82,.02,'#8a6440');
  s.cyl([X,y0+ch/2,0],[0,1,0],cr,ch,CU,{caps:false,seg:28});cutaway(s,[X,y0,0],cr-.02,cr-.02,ch,'#c98a4f','#c98a4f');band(s,[X,y0+ch,0],cr,.022,'#d08a52');s.cyl([X,y0+.01,0],[0,1,0],cr,.02,'#9c5f2a');
  const lv=ch*.75;s.cyl([X,y0+lv-.005,0],[0,1,0],cr-.03,.01,waterCol(T),{alpha:.85});
  for(let i=0;i<Math.round((T-p.ambient)/7);i++){const u=cycle(t*.45+i*.17,1);s.ball([X+(hash(i)-.5)*.7+.12*Math.sin(t+i),y0+lv+.1+u*1.5,(hash(i+3)-.5)*.5],.06+.07*u,'#e9f6ff',{alpha:.28*(1-u),flat:true})}
  stand(s,[X-1.35,0,-.2],2.5,2.05,[X+.12,2.05,0]);thermometer(s,[X+.12,y0+.35,0],1.65,T/100,{label:`${f(T,1)} °C`});const sy=.07*Math.sin(t*3);s.cyl([X-.28,y0+1.0+sy,.1],[0,1,0],.02,1.6,'#d08a52');s.cyl([X-.28,y0+1.82+sy,.1],[1,0,0],.025,.2,'#d08a52');
  stopwatch(s,[X+1.45,.4,.5],tt,`t = ${f(tt,1)} s`);s.box([X+1.45,.04,.5],[.5,.08,.3],'#2f3438');
  lab(s,[X-cr,y0+.4,.2],'copper calorimeter',-60,40);lab(s,[X,y0+lv,0],'hot water',-70,-60);lab(s,[X-1.35,1.5,-.32],'clamp stand',-50,-30);lab(s,[X+1.45,.72,.5],'stopwatch',40,-40);lab(s,[X-.28,y0+1.7+sy,.1],'stirrer',-50,-20);
  s.render();chart(c,430,96,226,150,{title:'T vs time',xl:'s',xmin:0,xmax:80,ymin:p.ambient-5,ymax:p.initial+5,series:[{fn:x=>p.ambient+(p.initial-p.ambient)*Math.exp(-p.rate*x),col:C.red},{fn:()=>p.ambient,col:'#8ca6b9',dash:[4,4]}],marker:[tt,T]});tag(c,`room ${p.ambient} °C · T = ${f(T,1)} °C`,44,98,C.gold,14)};

R['heat-conduction']=(c,p,t)=>{const s=P3.scene(c,{scale:54,yaw:.35,pitch:.1,cx:320,cy:318}),Lw=.5+p.thickness*8,n=12,H=1.6,D=1.5,yb=.1,rate=p.conductivity*(p.hot-p.cold)/p.thickness;
  bench(s,0,0,Lw+5,2.6);
  for(let i=0;i<n;i++){const T=p.hot-(p.hot-p.cold)*(i+.5)/n;s.box([-Lw/2+Lw*(i+.5)/n,yb+H/2,0],[Lw/n+.002,H,D],mix('#9c8f80',heatCol(T*2.5),.55),{stroke:'#00000000'})}
  // hot side: electric heater plate in a steel housing
  const xh=-Lw/2;s.box([xh-.05,yb+H/2,0],[.1,H+.1,D+.1],mix(CU,'#ff6a2a',.5));s.box([xh-.55,yb+H/2,0],[.9,H+.1,D+.1],'#868e96');for(let i=0;i<6;i++)s.box([xh-1.02,yb+.25+i*.3,0],[.06,.12,D],'#6c757d');s.box([xh-.55,yb+H+.15,0],[.5,.2,.4],'#343a40');s.ball([xh-.4,yb+H+.15,.21],.04,'#ff6b3c',{glow:true,flat:true});s.tube([[xh-.7,yb+H+.15,0],[xh-1.1,yb+H+.4,0],[xh-1.6,yb+H+.2,.3]],.03,'#212529',{segs:5});
  // cold side: water-cooled aluminium plate
  const xc=Lw/2;s.box([xc+.05,yb+H/2,0],[.1,H+.1,D+.1],'#c9d3da');s.box([xc+.35,yb+H/2,0],[.5,H+.1,D+.1],'#adb5bd');const pipe=[];for(let i=0;i<5;i++){const y=yb+.2+i*.38;pipe.push([xc+.62,y,i%2?.6:-.6],[xc+.62,y,i%2?-.6:.6])}s.tube([[xc+.62,-.02,-.9],...pipe,[xc+.62,yb+H+.3,.6]],.05,'#74c0fc',{segs:6});
  thermometer(s,[xh+.12,yb+H-.4,.55],1.0,p.hot/120,{label:`${p.hot} °C`});thermometer(s,[xc-.12,yb+H-.4,.55],1.0,p.cold/120,{label:`${p.cold} °C`,col:C.blue});
  for(let i=0;i<Math.min(16,Math.round(rate/40)+3);i++){const u=cycle(t*.4+i/8,1);s.ball([-Lw/2+Lw*u,yb+.2+hash(i)*(H-.4),D/2+.05],.05,'#ffd43b',{flat:true,glow:true})}
  s.arrow([-Lw/2+.1,yb+H+.45,0],[Lw/2-.1,yb+H+.45,0],C.gold,3.5,11,`Q̇ = ${f(rate,0)} W`);s.seg([-Lw/2,yb-.02,D/2+.15],[Lw/2,yb-.02,D/2+.15],C.white,1.2);for(const g of[-1,1])s.seg([g*Lw/2,yb-.1,D/2+.15],[g*Lw/2,yb+.06,D/2+.15],C.white,1.2);s.label([0,yb-.25,D/2+.2],`L = ${f(p.thickness,2)} m`,C.white,12);
  lab(s,[xh-.55,yb+.5,D/2],'heater (hot face)',-50,40);lab(s,[xc+.62,yb+.6,.6],'water-cooled plate',50,40);lab(s,[-Lw/4,yb+H*.3,D/2],`wall, k = ${p.conductivity} W/(m·K)`,-120,50);
  s.render();tag(c,'yellow: heat flowing hot → cold',44,98,C.muted,13)};

R['specific-heat']=(c,p,t)=>{const s=P3.scene(c,{scale:56,yaw:.3,pitch:.08,cx:300,cy:325}),mat=Number(p.mat),dT=p.heat*1000/(p.mass*mat),ph=clamp(cycle(t,6)/4,0,1),T=20+dT*ph,name={4186:'water',900:'aluminium',385:'copper',450:'iron'}[mat]||'sample',col={900:'#d8dde2',385:CU,450:'#7d848b'}[mat]||'#adb5bd',a=.6+Math.cbrt(p.mass)*.45,X=.4;
  bench(s,0,0,6,2.4);s.box([X,.04,0],[a+.5,.08,a+.5],'#c8a97e');
  let top;if(mat===4186){const r=.5*a+.05,h=a*1.3;glassVessel(s,[X,.08,0],r,h,{grad:5});liquid(s,[X,.12,0],r-.02,h*.75,waterCol(T),.55);top=.08+h;s.helix([X,.4,0],[0,1,0],.18,.4,6,'#868e96',3);s.cyl([X,.08+h*.65,0],[0,1,0],.03,h*.7,STEEL);for(let i=0;i<5*ph;i++){const u=cycle(t*.8+i*.2,1);s.ball([X+(hash(i)-.5)*.3,.5+u*h*.5,(hash(i+2)-.5)*.3],.03,'#ffffff',{alpha:.6,flat:true})}}
  else{s.box([X,.08+a/2,0],[a,a,a],col);top=.08+a;for(const dx of[-.18,.18])s.cyl([X+dx*a,top+.005,0],[0,1,0],.06,.01,'#1b1f23')}
  // immersion heater and thermometer
  const hx=X-.18*a;s.cyl([hx,top+.25,0],[0,1,0],.05,.5,STEEL);s.cyl([hx,top+.55,0],[0,1,0],.09,.18,'#343a40');thermometer(s,[X+.18*a,top-.25,0],1.5,T/150,{label:`${f(T,1)} °C`});
  // joulemeter / power supply
  const J=[-1.9,0,.2];s.box([J[0],.45,J[2]],[1.3,.9,.8],'#2b3036');s.box([J[0],.62,J[2]+.405],[.9,.3,.01],'#0b3d2e');s.engrave([J[0],.62,J[2]+.42],`${f(p.heat*ph,1)} kJ`,'#69f0ae',13);s.ball([J[0]-.4,.25,J[2]+.41],.06,'#e03131');s.ball([J[0]-.15,.25,J[2]+.41],.06,'#212529');s.cyl([J[0]+.35,.25,J[2]+.42],[0,0,1],.08,.05,'#868e96');
  s.tube([[J[0]-.4,.25,J[2]+.45],[J[0]-.3,.05,.9],[hx-.6,.4,.6],[hx-.3,top+.9,.2],[hx,top+.64,0]],.025,'#e03131',{segs:5});s.tube([[J[0]-.15,.25,J[2]+.45],[J[0],.05,.8],[hx-.5,.5,.4],[hx-.25,top+.85,0],[hx,top+.64,-.02]],.025,'#212529',{segs:5});
  lab(s,[J[0],.85,J[2]],'joulemeter',-30,-50);lab(s,[hx,top+.55,0],'immersion heater',-60,-40);lab(s,[X+a/2,.4+a*.3,a/2],`${name}, m = ${p.mass} kg`,60,40);
  s.render();tag(c,`ΔT = Q/mc = ${f(dT,1)} K`,44,98,C.gold,15)};

R['thermal-radiation']=(c,p,t)=>{const s=P3.scene(c,{scale:58,yaw:.25,pitch:.08,cx:320,cy:318}),T=p.temperature,Ta=p.ambient,e=p.emissivity,sig=5.670374e-8,Pn=e*sig*.1*(T**4-Ta**4),glow=clamp((T-700)/300,0,1),O=[-1.2,1.35,0];
  const col=T>700?mix('#b03a10','#ffd8a0',glow):mix('#4a4e52','#6b3b2a',clamp((T-300)/400,0,1));
  bench(s,0,0,6.4,2.4);s.cyl([O[0],.06,0],[0,1,0],.45,.12,'#2f3438');s.cyl([O[0],.45,0],[0,1,0],.08,.7,'#e9e3d5');s.cyl([O[0],.83,0],[0,1,0],.2,.08,'#e9e3d5');s.ball(O,.55,col,{glow:T>700});
  const ne=Math.round(clamp(e*T**4/1e10,1,18)),na=Math.round(clamp(e*Ta**4/1e10,1,18));
  const wave=(a,b,cc,ph)=>{const d=V.sub(b,a),n=V.norm(V.cross(d,[0,0,1])),pts=Array.from({length:17},(_,i)=>{const u=i/16;return V.add(V.add(a,V.mul(d,u)),V.mul(n,.06*Math.sin(u*TAU*2.5+ph)))});s.path(pts,cc,2)};
  for(let i=0;i<ne;i++){const g=TAU*hash(i+1),u=cycle(t*.5+hash(i+9),1),dir=[Math.cos(g),Math.sin(g)*.8,.3*(hash(i+3)-.5)],a=V.add(O,V.mul(dir,.65+u*1.7));wave(a,V.add(a,V.mul(dir,.45)),'#ff922b'+(u<.8?'':'88'),t*8)}
  for(let i=0;i<na;i++){const g=TAU*hash(i+31),u=cycle(t*.5+hash(i+39),1),dir=[Math.cos(g),Math.sin(g)*.8,.3*(hash(i+33)-.5)],a=V.add(O,V.mul(dir,2.6-u*1.7));wave(a,V.add(a,V.mul(dir,-.45)),'#74c0fc',t*8)}
  // thermopile with horn, wired to a galvanometer
  const S0=[1.5,1.35,0];s.lathe([S0[0]-.25,S0[1],0],[[.06,0],[.35,.6]],'#d4d9de',{rot:[0,0,PI/2],segs:18});s.cyl([S0[0]+.1,S0[1],0],[1,0,0],.14,.5,'#495057');s.cyl([S0[0]+.1,.65,0],[0,1,0],.035,1.2,'#c3c9cf');s.box([S0[0]+.1,.05,0],[.6,.1,.4],'#2f3438');
  const G0=[2.5,.45,.5];s.box(G0,[.8,.8,.35],'#343a40');s.box(V.add(G0,[0,.08,.18]),[.62,.45,.01],'#f8f9fa');const na2=clamp(Pn/300,-1,1)*.9;s.seg(V.add(G0,[0,-.13,.19]),V.add(G0,[.35*Math.sin(na2),-.13+.35*Math.cos(na2),.19]),'#d6336c',2);for(let i=-4;i<=4;i++){const a=i*.22;s.seg(V.add(G0,[.33*Math.sin(a),-.13+.33*Math.cos(a),.19]),V.add(G0,[.29*Math.sin(a),-.13+.29*Math.cos(a),.19]),'#1b1f23',1)}
  s.tube([[S0[0]+.35,S0[1],0],[2.2,1.3,.2],[G0[0]-.2,G0[1]+.42,.4]],.02,'#e03131',{segs:5});
  s.arrow(V.add(O,[.6,.75,0]),V.add(O,[.6+(Pn>=0?1:-1)*clamp(Math.abs(Pn)/400,.3,1.2),.75,0]),Pn>=0?'#ff922b':'#74c0fc',3.5,11,`P_net = ${f(Pn,1)} W`);
  lab(s,[O[0]-.4,O[1]-.35,.3],`hot body ${T} K (ε = ${e})`,-40,70);lab(s,[S0[0]-.1,S0[1]+.3,0],'thermopile',20,-50);lab(s,V.add(G0,[0,.4,0]),'galvanometer',40,-20);lab(s,[O[0],.5,0],'ceramic stand',-60,10);
  s.render();tag(c,Pn>=0?`Net emission (hotter than ${Ta} K surroundings)`:`Net absorption (surroundings at ${Ta} K)`,44,98,C.gold,14)};

R['bimetallic-strip']=(c,p,t)=>{const da={brass:7e-6,copper:15.8e-6,al:11e-6}[p.pair],k=3*da*p.dT/(2*p.h/1000),L=p.L/100,vis=clamp(k*L*8,-.9,.9),s=P3.scene(c,{scale:54,yaw:.25,pitch:.06,cx:330,cy:318}),n=24,Ls=1.6+p.L*.15,th=.03+p.h*.02;
  const cols={brass:[BRASS,'#8d949b'],copper:[CU,'#c9d3da'],al:['#dfe4e8','#8d949b']}[p.pair],names={brass:['brass','steel'],copper:['copper','invar'],al:['aluminium','steel']}[p.pair],x0=-1.7,y0=1.75;
  bench(s,0,0,6,2.4);stand(s,[x0-.5,0,-.1],2.5,y0,[x0-.08,y0,0]);s.box([x0-.1,y0,0],[.3,.34,.62],'#3f454b');s.cyl([x0-.1,y0+.3,0],[0,1,0],.035,.3,STEEL);s.cyl([x0-.1,y0+.45,0],[0,0,1],.025,.4,STEEL);
  let x=x0,y=y0,a=0;for(let i=0;i<n;i++){const dl=Ls/n,mid=[x+Math.cos(a)*dl/2,y+Math.sin(a)*dl/2,0],nr=[-Math.sin(a),Math.cos(a),0];s.box(V.add(mid,V.mul(nr,th/2)),[dl+.01,th,.32],cols[0],{rotZ:a});s.box(V.add(mid,V.mul(nr,-th/2)),[dl+.01,th,.32],cols[1],{rotZ:a});x+=Math.cos(a)*dl;y+=Math.sin(a)*dl;a-=vis/n}
  const tip=[x,y,0];s.seg(tip,[x+.25,y,0],'#d6336c',2);
  // vertical scale beside the tip
  const sx=x0+Ls+.45;s.box([sx,y0,-.1],[.12,3.0,.04],'#f1f3f5');s.box([sx,.13,-.1],[.4,.06,.3],'#2f3438');for(let i=-14;i<=14;i++)s.seg([sx-.06,y0+i*.1,-.075],[sx+(i%5?-.0:.05),y0+i*.1,-.075],'#1b1f23',i%5?.8:1.3);s.ball([sx-.07,y,-.07],.035,'#d6336c',{flat:true});
  if(p.dT>0)for(const u of[.35,.7])burner(s,[x0+Ls*u,0,.05],t+u*4,true,.45,.5*clamp(p.dT/150,.4,1));
  else if(p.dT<0){s.box([x0+Ls*.5,.15,0],[Ls*.8,.3,.8],'#adb5bd');for(let i=0;i<8;i++)s.box([x0+Ls*(.18+.09*i),.36,(hash(i)-.5)*.4],[.16,.14,.16],'#e7f5ff',{alpha:.85});for(let i=0;i<6;i++){const u=cycle(t*.4+i/6,1);s.ball([x0+Ls*(.2+.12*i),.45+u*.8,0],.06+.05*u,'#d0ebff',{alpha:.3*(1-u),flat:true})}}
  lab(s,[x0+Ls*.3,y0+th,0],`${names[0]} (α larger)`,-20,-70);lab(s,[x0+Ls*.55,y0-th,.25],`${names[1]}`,30,50);lab(s,[sx,y0+1,-.1],'scale',30,-20);lab(s,[x0-.1,y0+.17,0],'clamp',-50,-30);
  s.render();tag(c,`ΔT = ${p.dT} K · tip deflection ≈ ${f(k*L*L/2*1000,2)} mm (bending magnified)`,44,98,C.gold,14)};

function heatState(p,t){const m=p.m,stages=[[m*2100*(0-p.T0),'Warming ice'],[m*3.34e5,'Melting at 0 °C'],[m*4186*100,'Warming water'],[m*2.26e6,'Boiling at 100 °C'],[m*2010*20,'Warming steam']];const total=stages.reduce((s,a)=>s+a[0],0),Q=total*Math.min(1,cycle(t,16)/14);
  const Tat=q=>{let left=q;const T=[[p.T0,0],[0,0],[0,100],[100,100],[100,120]];for(let i=0;i<5;i++){const E=stages[i][0];if(left<=E||i===4){const fr=E?clamp(left/E,0,1):1;return[T[i][0]+(T[i][1]-T[i][0])*fr,i+fr,stages[i][1]]}left-=E}};
  const [T,fpos,phase]=Tat(Q);const curve=Array.from({length:101},(_,i)=>[total*i/100,Tat(total*i/100)[0]]);return{T,f:fpos,phase,Q,total,curve}}
R['heating-curve']=(c,p,t)=>{const r=heatState(p,t),s=P3.scene(c,{scale:54,yaw:.3,pitch:.08,cx:200,cy:325}),X=0,br=.75,bh=1.6,yb=.36;
  bench(s,0,0,4.6,2.4);hotplate(s,[X,0,0],1.8,r.f<4.99,t);glassVessel(s,[X,yb,0],br,bh,{grad:6});
  const level=r.f<3?.9:.9*(1-(r.f-3)*.85);if(r.f<2){const nI=Math.round(7*(r.f<1?1:2-r.f));for(let i=0;i<nI;i++)s.box([X-.35+(i%3)*.35,yb+.17+Math.floor(i/3)*.3+(r.f>=1?.05:0),(i%2)*.2-.1],[.26,.26,.26],'#e7f5ff',{alpha:.85,rotY:i})}
  if(r.f>=1)liquid(s,[X,yb+.05,0],br-.03,Math.max(.02,level*(r.f<2?r.f-1:1)),'#3fa7d6',.5);
  if(r.f>=2.6)for(let i=0;i<10;i++){const u=cycle(t*.9+hash(i+5)*3,1);if(r.f<3&&i>3)break;s.ball([X+(hash(i)-.5)*1.1,yb+.12+u*level*.9,(hash(i+9)-.5)*1.1],.035+.03*u,'#ffffff',{alpha:.7,flat:true})}
  if(r.f>=3)for(let i=0;i<12;i++){const u=cycle(t*.5+hash(i+2),1);s.ball([X+(hash(i)-.5)*1.0+.2*Math.sin(t+i),yb+bh+u*1.4,(hash(i+7)-.5)*.6],.08+.1*u,'#e9f6ff',{alpha:.3*(1-u),flat:true})}
  stand(s,[X-1.45,0,-.2],2.7,2.35,[X+.25,2.35,0]);thermometer(s,[X+.25,yb+.25,0],1.85,(r.T+40)/170,{label:`${f(r.T,1)} °C`});
  lab(s,[X+.9,.15,.7],`hot plate ${p.P} W`,50,30);lab(s,[X-br,yb+bh*.8,.2],'glass beaker',-50,-40);lab(s,[X,yb+.3,br],r.f<1?'ice':r.f<2?'ice + water':r.f<4?'water':'steam',60,10);
  s.render();chart(c,400,96,256,170,{title:'Temperature vs time',xl:'t',xmin:0,xmax:r.total,ymin:-40,ymax:130,series:[{pts:r.curve,col:C.gold}],marker:[r.Q,r.T]});tag(c,r.phase,44,98,C.gold,14)};

function waterRho(T){return 1000*(1-(T-3.9863)**2*(T+288.9414)/(508929.2*(T+68.12963)))}
R['water-anomaly']=(c,p,t)=>{const s=P3.scene(c,{scale:50,yaw:.3,pitch:.12,cx:215,cy:325}),Ts=Math.max(0,p.Ta),layers=6,W=3.6,D=2,H=2.2,yb=.25,lh=(H-.5)/layers;
  bench(s,0,0,4.8,2.8);s.box([0,yb/2,0],[W+.2,yb,D+.2],'#3f454b');s.box([0,yb+.15,0],[W,.3,D],'#6b5134');for(let i=0;i<10;i++)s.ball([-W/2+.3+hash(i)*(W-.6),yb+.32,(hash(i+4)-.5)*(D-.4)],.07+hash(i+8)*.06,'#8d8d84');
  for(let i=0;i<layers;i++){const fr=i/(layers-1),T=p.Ta>4?4+(Ts-4)*fr:4-(4-Ts)*fr,y=yb+.3+lh*(i+.5);s.box([0,y,0],[W-.02,lh-.01,D-.02],mix('#1c5f99','#7ec8f2',clamp(T/20,0,1)*.4+fr*.25),{alpha:.42,stroke:'#00000000'});s.label([W/2+.35,y,D/2],f(T,1)+' °C',C.white,11,'left')}
  const top=yb+.3+lh*layers;if(p.Ta<0){s.box([0,top+.06,0],[W-.02,.14,D-.02],'#e6f6ff',{alpha:.92});for(let i=0;i<5;i++)s.seg([-W/2+.4+i*.7,top+.135,-.2],[-W/2+.7+i*.7,top+.135,.4],'#a5d8ff',1)}
  // glass tank with steel corner frame
  s.box([0,yb+.3+H/2-.25,0],[W+.04,H,D+.04],GLASS,{alpha:.08});for(const x of[-1,1])for(const z of[-1,1])s.box([x*W/2,yb+.3+H/2-.25,z*D/2],[.06,H,.06],IRON);for(const y of[yb+.05,yb+.3+H-.25])for(const z of[-1,1])s.box([0,y,z*D/2],[W,.06,.06],IRON);
  const yp=yb+.3+lh*(layers-1-clamp((4-p.Tw)/4,0,1)*(layers-1))*1;thermometer(s,[W/2-.45,top-1.2,D/2-.3],1.8,p.Tw/20,{label:`probe ${f(p.Tw,1)} °C`});
  for(let i=0;i<4;i++){const x=-1.3+i*.8,y=top+.55+.05*Math.sin(t*2+i);s.seg([x,y,0],[x+.3,y-.1,0],p.Ta<0?'#d0ebff':'#ffd8a8',1.5)}s.label([-.6,top+.8,0],`air ${p.Ta} °C`,p.Ta<0?C.blue:C.gold,13);
  lab(s,[-W/2+.3,yb+.3+lh*.5,D/2],'densest water ≈ 4 °C sinks',-30,40);if(p.Ta<0)lab(s,[-W/2+.5,top+.1,D/2],'ice floats (less dense)',-40,-50);lab(s,[0,yb+.2,D/2],'lake bed',60,40);
  s.render();chart(c,440,96,216,170,{title:'Density of water',xl:'T (°C)',xmin:0,xmax:20,ymin:998.1,ymax:1000.05,series:[{fn:waterRho,col:C.mint}],marker:[p.Tw,waterRho(p.Tw)]});tag(c,`ρ(${f(p.Tw,1)} °C) = ${f(waterRho(p.Tw),3)} kg/m³`,44,98,C.gold,14)};

/* ================= Thermodynamics ================= */
R['thermo']=(c,p,t)=>{const s=P3.scene(c,{scale:50,yaw:.3,pitch:.06,cx:300,cy:340}),h=.4+p.volume/30*2.1,P=p.moles*8.314*p.temperature/(p.volume/1000),hot=clamp((p.temperature-200)/400,0,1),y0=.3;
  bench(s,0,0,5.6,2.4);const top=pcyl(s,{x:-.6,y0,R:.75,H:2.7,h,gas:mix('#74c0fc','#ff922b',hot),ga:.16});gasIn(s,Math.round(8+p.moles*8),[-.6,0],.74,y0,h,.25+Math.sqrt(p.temperature)*.04,t,'#42d9ca',.055);
  s.tube([[-.6+.8,.15,0],[1.3,.15,0],[1.3,1.0,.0]],.045,BRASS,{segs:6});gauge(s,[1.3,1.6,0],P/600000,`${f(P/1000,0)} kPa`);readout(s,[1.5,.3,.75],`${p.temperature} K`);s.tube([[1.0,.3,.75],[.3,.12,.7],[-.2,.15,.6]],.02,'#212529',{segs:5});
  lab(s,[-.6,top+.3,0],'piston',-60,-30);lab(s,[-.6-.78,y0+2.2,0],'glass cylinder',-50,-20);lab(s,[-.6,y0+h*.4,.6],`gas: ${p.moles} mol, ${p.volume} L`,-90,50);lab(s,[1.3,2.05,0],'pressure gauge',40,-30);lab(s,[1.5,.5,.75],'thermocouple',50,30);
  s.render();tag(c,`P = nRT/V = ${f(P/1000,0)} kPa`,44,98,C.gold,15)};

// Reservoir blocks used by the heat-engine scenes.
function hotRes(s,[x,y,z],w,t){s.box([x,y+.25,z],[w,.5,w*.8],'#5c636a');s.box([x,y+.52,z],[w*.9,.04,w*.7],mix('#c92a2a','#ff8a3c',.5+.3*Math.sin(t*3)));for(let i=0;i<5;i++)s.box([x-w*.4+i*w*.2,y+.25,z+w*.41],[.05,.36,.02],'#343a40')}
function coldRes(s,[x,y,z],w){s.box([x,y+.25,z],[w,.5,w*.8],'#3b6fb6');for(let i=0;i<6;i++)s.box([x-w*.3+(i%3)*w*.3,y+.55,z+(i<3?-.15:.15)*w],[w*.22,.1,w*.22],'#e7f5ff',{alpha:.9,rotY:i*.4})}
function padRes(s,[x,y,z],w){s.box([x,y+.25,z],[w,.5,w*.8],'#d9cfb8');for(let i=0;i<4;i++)s.seg([x-w/2,y+.1+i*.12,z+w*.4+.005],[x+w/2,y+.1+i*.12,z+w*.4+.005],'#b8a98a',1)}
R['carnot']=(c,p,t)=>{const s=P3.scene(c,{scale:46,yaw:.3,pitch:.06,cx:205,cy:335}),g=5/3,ph=cycle(t/2,4),leg=Math.floor(ph),q=ph-leg,k=(p.hot/p.cold)**1.5,V1=1,V2=p.ratio,V3=V2*k,V4=V1*k,Vs=[[V1,V2],[V2,V3],[V3,V4],[V4,V1]][leg],Vv=Vs[0]+(Vs[1]-Vs[0])*q,eta=1-p.cold/p.hot;
  const T=leg===0?p.hot:leg===2?p.cold:leg===1?p.hot*(V2/Vv)**(g-1):p.cold*(V4/Vv)**(g-1),h=.3+Vv/V3*1.55,xs=[-1.6,0,1.6,0][leg];
  bench(s,0,0,5.2,2.2);hotRes(s,[-1.6,0,0],1.3,t);padRes(s,[0,0,0],1.2);coldRes(s,[1.6,0,0],1.3);
  const y0=.75,top=pcyl(s,{x:xs,y0,R:.5,H:2.0,h,gas:mix('#74c0fc','#ff6b3c',clamp((T-p.cold)/(p.hot-p.cold),0,1)),ga:.2,rodL:.6,base:false});s.cyl([xs,y0-.1,0],[0,1,0],.62,.2,'#495057');gasIn(s,12,[xs,0],.49,y0,h,.2+Math.sqrt(T)*.025,t,'#42d9ca',.05);
  if(leg===0)s.arrow([xs+.85,.2,.4],[xs+.85,.9,.4],C.red,4,11,'Q_h in');if(leg===2)s.arrow([xs-.85,.9,.4],[xs-.85,.2,.4],C.blue,4,11,'Q_c out');s.arrow([xs+.3,top+.75,0],[xs+.3,top+.75+(leg<2?.45:-.45),0],C.gold,3,10,leg<2?'W by gas':'W on gas');
  lab(s,[-1.6,.3,.5],`hot reservoir ${p.hot} K`,-30,60);lab(s,[1.6,.3,.5],`cold reservoir ${p.cold} K`,30,60);lab(s,[0,.4,.5],'insulating stand',0,80);
  s.render();const P=(V,T0)=>T0/V,pts=[];for(let i=0;i<=20;i++){const v=V1+(V2-V1)*i/20;pts.push([v,P(v,p.hot)])}for(let i=0;i<=20;i++){const v=V2+(V3-V2)*i/20;pts.push([v,P(V2,p.hot)*Math.pow(V2/v,g)])}for(let i=0;i<=20;i++){const v=V3+(V4-V3)*i/20;pts.push([v,P(v,p.cold)])}for(let i=0;i<=20;i++){const v=V4+(V1-V4)*i/20;pts.push([v,P(V4,p.cold)*Math.pow(V4/v,g)])}
  const Pv=leg===0?P(Vv,p.hot):leg===1?P(V2,p.hot)*(V2/Vv)**g:leg===2?P(Vv,p.cold):P(V4,p.cold)*(V4/Vv)**g;
  chart(c,420,96,236,170,{title:'Carnot cycle (P–V)',xl:'V',xmin:0,xmax:V3*1.05,ymin:0,ymax:p.hot/V1*1.1,series:[{pts,col:C.gold}],marker:[Vv,Pv]});tag(c,`η = 1 − Tc/Th = ${f(eta*100,1)} %`,44,98,C.gold,15);tag(c,['1→2 isothermal expansion at T_h','2→3 adiabatic expansion (insulated)','3→4 isothermal compression at T_c','4→1 adiabatic compression (insulated)'][leg],44,120,C.white,13)};

R['adiabatic']=(c,p,t)=>{const s=P3.scene(c,{scale:49,yaw:.3,pitch:.06,cx:250,cy:342}),g=Number(p.gamma),q=Math.min(cycle(t,6)/4,1),r=1+(p.ratio-1)*q,T=p.temperature*Math.pow(r,1-g),h=.25+r*1.05,y0=.3,H=2.55;
  bench(s,0,0,4.4,2.4);const top=pcyl(s,{x:0,y0,R:.7,H,h,gas:mix('#74c0fc','#ff6b3c',clamp((T-200)/500,0,1)),ga:.2});gasIn(s,16,[0,0],.69,y0,h,.2+Math.sqrt(T)*.04,t,'#42d9ca',.055);
  cutaway(s,[0,y0,0],.98,1.22,H,'#efe7d6','#e6dcc6',16);for(let i=1;i<8;i++){const y=y0+H*i/8;for(let j=0;j<16;j++){const a=PI+PI*j/16,b=a+PI/16;s.seg([1.0*Math.cos(a),y,1.0*Math.sin(a)],[1.0*Math.cos(b),y,1.0*Math.sin(b)],'#c9bd9f',1)}}
  readout(s,[1.55,.3,.5],`${f(T,0)} K`);s.tube([[1.07,.3,.5],[.75,.2,.4]],.02,'#212529',{segs:4});s.arrow([.35,top+1.4,0],[.35,top+1.4+(p.ratio<1?-.5:.5),0],C.gold,3.5,11,p.ratio<1?'W on gas':'W by gas');
  lab(s,[-1.12,y0+.9,-.3],'lagging (Q = 0)',-50,30);lab(s,[-.3,top-.1,0],'piston',-70,-20);lab(s,[1.55,.5,.5],'thermocouple',40,40);
  s.render();chart(c,420,96,236,170,{title:'Adiabat (gold) vs isotherm (grey)',xl:'V/V₀',xmin:.5,xmax:2,ymin:0,ymax:Math.pow(2,g)*1.05,series:[{fn:v=>Math.pow(1/v,g),col:C.gold},{fn:v=>1/v,col:'#8ca6b9',dash:[4,4]}],marker:[r,Math.pow(1/r,g)]});tag(c,`TV^(γ−1) = const → T = ${f(T,1)} K`,44,98,C.gold,15)};

R['first-law']=(c,p,t)=>{const s=P3.scene(c,{scale:44,yaw:.3,pitch:.06,cx:250,cy:345}),dU=p.heat-p.work,h=clamp(1.0+p.work/300,.35,1.7),y0=1.15,X=-.3;
  bench(s,0,0,5,2.4);for(let i=0;i<3;i++){const a=PI/2+i*TAU/3;s.cyl([X+.7*Math.cos(a),.55,.7*Math.sin(a)],[0,1,0],.035,1.1,'#343a40')}band(s,[X,1.08,0],.72,.04,'#343a40');s.box([X,1.11,0],[1.4,.03,1.4],'#adb5bd');
  if(p.heat>0)burner(s,[X,0,0],t,true,.55,.4);else if(p.heat<0){s.box([X,.25,0],[1,.5,.8],'#3b6fb6');for(let i=0;i<4;i++)s.box([X-.3+i*.2,.56,(i%2-.5)*.3],[.18,.1,.18],'#e7f5ff',{alpha:.9})}
  const top=pcyl(s,{x:X,y0,R:.6,H:2.0,h,gas:mix('#74c0fc','#ff6b3c',clamp(.5+dU/300,0,1)),ga:.2,rodL:.5,base:false});s.cyl([X,y0+.02,0],[0,1,0],.66,.06,CU);gasIn(s,12,[X,0],.59,y0,h,.3+clamp(dU,-100,200)/600,t,'#42d9ca',.05);
  if(p.heat!==0)s.arrow([X+.75,p.heat>0?.45:1.05,.6],[X+.75,p.heat>0?1.05:.45,.6],p.heat>0?C.red:C.blue,5,11,`Q = ${p.heat} J`);if(p.work!==0)s.arrow([X+.75,top+.15,0],[X+.75,top+.15+Math.sign(p.work)*.55,0],C.gold,5,11,`W = ${p.work} J`);
  const bx=2.1,bh=Math.max(.04,Math.abs(dU)/120);s.box([bx,.03,0],[.6,.06,.6],'#343a40');s.box([bx,(dU>=0?.06+bh/2:.06+bh/2),0],[.35,bh,.35],dU>=0?'#42d9ca':'#ff857e');s.label([bx,.06+bh+.3,0],`ΔU = ${dU} J`,dU>=0?C.mint:C.red,13);
  lab(s,[X,top+.15,0],'piston',-70,-30);lab(s,[X-.55,y0+.4,0],'gas',-60,-10);lab(s,[X-.65,.6,.4],p.heat>=0?'Bunsen burner on tripod':'cold block',-70,20);
  s.render();tag(c,`ΔU = Q − W = ${p.heat} − ${p.work} = ${dU} J`,44,98,C.gold,15)};

R['isothermal-entropy']=(c,p,t)=>{const s=P3.scene(c,{scale:50,yaw:.3,pitch:.08,cx:270,cy:340}),ph=.5-.5*Math.cos(t*.6),r=1+(p.ratio-1)*ph,h=.3+r*.55,y0=.35,dS=p.moles*8.314*Math.log(Math.max(1e-6,r)),dSf=p.moles*8.314*Math.log(p.ratio),bw=2.6,bd=2.0,bh=1.05;
  bench(s,0,0,5.6,2.6);s.box([0,.03,0],[bw+.1,.06,bd+.1],'#495057');s.box([0,.06+bh/2,0],[bw-.04,bh,bd-.04],'#4dabf7',{alpha:.3});s.box([0,.06+bh/2+.08,0],[bw,bh+.16,bd],GLASS,{alpha:.07});
  s.helix([-.95,.4,.0],[0,0,1],.12,1.4,7,'#c92a2a',2.4);s.box([-1.0,bh+.4,-.75],[.5,.3,.3],'#2b3036');s.ball([-.85,bh+.4,-.59],.03,'#ff6b3c',{glow:true,flat:true});s.engrave([-1.05,bh+.4,-.59],`${p.temperature} K`,'#69f0ae',10);s.cyl([-1.0,bh-.05,-.75],[0,1,0],.03,.6,STEEL);
  const top=pcyl(s,{x:.35,y0,R:.55,H:2.7,h,gas:'#ffa94d',ga:.16,rodL:.6,base:false});s.cyl([.35,y0-.05,0],[0,1,0],.6,.1,CU);gasIn(s,16,[.35,0],.54,y0,h,.4,t,'#42d9ca',.05);
  s.arrow([1.45,.35,.6],[.95,.6,.3],dS>=0?C.red:C.blue,3.5,10,`Q = TΔS = ${f(p.temperature*dS,0)} J`);
  const sx=2.0,sh=Math.max(.03,Math.abs(dS)/12);s.box([sx,.03,.3],[.55,.06,.55],'#343a40');s.box([sx,.06+sh/2,.3],[.3,sh,.3],dS>=0?'#b89dff':'#ff857e');s.label([sx,-.2,.7],`ΔS = ${f(dS,2)} J/K`,C.purple,12);
  lab(s,[-.95,.45,.7],'heater',-40,40);lab(s,[-1.25,bh+.45,-.75],'thermostat',-50,-30);lab(s,[-1.25,bh*.8,bd/2],'constant-T water bath',-50,-20);lab(s,[.35,top+.2,0],'piston',60,-50);
  s.render();tag(c,`ΔS = nR ln(Vf/Vi) = ${f(dSf,2)} J/K at ${p.temperature} K`,44,98,C.gold,15)};

R['isobaric-process']=(c,p,t)=>{const Rg=8.314,ph=.5-.5*Math.cos(t*.9),T=p.T1+(p.T2-p.T1)*ph,V1=p.n*Rg*p.T1/(p.P*1000),V=p.n*Rg*T/(p.P*1000),Vmax=p.n*Rg*800/(p.P*1000),h=.35+2.0*V/Math.max(Vmax,1e-9),s=P3.scene(c,{scale:48,yaw:.3,pitch:.06,cx:205,cy:342}),y0=.62,X=0;
  bench(s,0,0,4.4,2.4);hotplate(s,[X,0,0],1.9,p.T2>p.T1,t);const top=pcyl(s,{x:X,y0,R:.65,H:2.45,h,gas:mix('#74c0fc','#ff6b3c',clamp((T-250)/550,0,1)),ga:.2,rodL:.12,base:false});s.cyl([X,y0-.04,0],[0,1,0],.7,.08,CU);gasIn(s,14,[X,0],.64,y0,h,.2+Math.sqrt(T)*.03,t,'#42d9ca',.05);
  s.cyl([X,top+.18,0],[0,1,0],.42,.05,IRON);weights(s,[X,top+.2,0],Math.max(1,Math.round(p.P/50)),.38);
  s.arrow([X+1.2,top+.9,0],[X+1.2,top+.3,0],C.gold,3,10,`${p.P} kPa`);
  lab(s,[X-.38,top+.4,0],'slotted weights',-60,-30);lab(s,[X-.66,y0+h*.5,0],`gas at ${f(T,0)} K`,-50,20);lab(s,[X+.6,.2,.8],'hot plate',50,30);
  s.render();chart(c,420,96,236,170,{title:'P–V diagram',xl:'V (L)',xmin:0,xmax:Math.max(Vmax,V1)*1000*1.1,ymin:0,ymax:p.P*1.4,series:[{pts:[[V1*1000,p.P],[p.n*Rg*p.T2/(p.P*1000)*1000,p.P]],col:C.gold,w:3}],marker:[V*1000,p.P]});tag(c,`W = PΔV = nRΔT = ${f(p.n*Rg*(p.T2-p.T1),0)} J`,44,98,C.gold,15)};
const along=(pts,u)=>{const L=[0];for(let i=1;i<pts.length;i++)L.push(L[i-1]+Math.hypot(...V.sub(pts[i],pts[i-1])));const d=u*L[L.length-1];let i=1;while(i<L.length-1&&L[i]<d)i++;const k=(d-L[i-1])/((L[i]-L[i-1])||1);return V.add(pts[i-1],V.mul(V.sub(pts[i],pts[i-1]),k))};
R['refrigerator']=(c,p,t)=>{const Tc=p.Tc+273.15,Th=Math.max(p.Th+273.15,Tc+1),cop=Tc/(Th-Tc),W=p.Qc/cop,s=P3.scene(c,{scale:48,yaw:.3,pitch:.06,cx:310,cy:338}),kk=x=>clamp(x/400,.15,1.4);
  const cx=-1.45,w=1.6,h=2.5,d=1.3,yb=.1,tw=.12,WH='#eef2f5',IN='#dbe8f2';bench(s,0,0,6.6,2.4);
  for(const [x,z] of[[-1,-1],[1,-1],[-1,1],[1,1]])s.cyl([cx+x*(w/2-.1),.05,z*(d/2-.1)],[0,1,0],.05,.1,'#343a40');
  s.box([cx,yb+h/2,-d/2+tw/2],[w,h,tw],WH);s.box([cx-w/2+tw/2,yb+h/2,0],[tw,h,d],WH);s.box([cx+w/2-tw/2,yb+h/2,0],[tw,h,d],WH);s.box([cx,yb+h-tw/2,0],[w,tw,d],WH);s.box([cx,yb+tw/2,0],[w,tw,d],WH);s.box([cx,yb+h/2,-d/2+tw+.005],[w-2*tw,h-2*tw,.01],IN);
  const fy=yb+h*.62;s.box([cx,fy,0],[w-2*tw,.06,d-tw],WH);s.box([cx,yb+h*.32,.02],[w-2*tw,.03,d-tw-.1],GLASS,{alpha:.35});
  s.cyl([cx-.4,yb+h*.32+.32,0],[0,1,0],.11,.6,'#f8f9fa',{cap:'#4dabf7'});s.box([cx+.05,yb+h*.32+.2,-.05],[.4,.35,.3],'#e8590c');s.cyl([cx+.45,yb+tw+.15,.1],[0,1,0],.14,.28,'#c92a2a',{cap:'#f1f3f5'});
  const ev=[];for(let i=0;i<5;i++){const y=yb+h-tw-.12-i*.15;ev.push([cx+(i%2?.55:-.55),y,-d/2+tw+.06],[cx+(i%2?-.55:.55),y,-d/2+tw+.06])}
  for(let i=0;i<14;i++)s.ball([cx+(hash(i)-.5)*1.1,yb+h-tw-.12-hash(i+3)*.6,-d/2+tw+.1],.03,'#ffffff',{alpha:.7,flat:true});
  const a=-1.95,hg=[cx-w/2,yb+h/2,d/2];s.box(V.add(hg,[w/2*Math.cos(a),0,-(w/2)*Math.sin(a)]),[w,h,.12],WH,{rotY:a});s.box(V.add(hg,[w*.85*Math.cos(a)+.08,.1,-(w*.85)*Math.sin(a)]),[.05,.6,.06],'#adb5bd',{rotY:a});
  // compressor, condenser grid and capillary
  const K=[.35,0,-.1];s.box([K[0],.04,K[2]],[.9,.08,.7],'#343a40');s.lathe([K[0],.08,K[2]],[[.32,0],[.36,.18],[.33,.42],[.2,.55],[0,.6]],'#25292d',{segs:20});s.tube([[K[0]+.2,.08,K[2]+.3],[K[0]+.5,.05,.7],[K[0]+1.1,.05,.9]],.025,'#111',{segs:4});s.box([K[0]+1.15,.12,.9],[.15,.2,.1],'#f1f3f5');
  const cnd=[],xa=1.25,xb=2.15,zc=-.35;for(let i=0;i<10;i++){const y=2.35-i*.215;cnd.push([i%2?xb:xa,y,zc],[i%2?xa:xb,y,zc])}for(let i=0;i<=9;i++)s.seg([xa+i*(xb-xa)/9,.25,zc-.03],[xa+i*(xb-xa)/9,2.45,zc-.03],'#868e96',1.2);s.box([(xa+xb)/2,.13,zc],[1.1,.06,.3],'#343a40');for(const x of[xa-.05,xb+.05])s.cyl([x,1.29,zc],[0,1,0],.025,2.3,'#343a40');
  const last=cnd[cnd.length-1],path=[[K[0]+.12,.66,K[2]],[K[0]+.12,1.0,K[2]],[.9,2.55,zc],[xa,2.35,zc],...cnd,[last[0],.3,zc],[.9,.25,-.5],[cx+w/2+.05,.3,-.6],[cx+w/2+.05,yb+h-.25,-.6],[cx+.55,yb+h-tw-.12,-d/2+tw+.06],...ev.slice(1),[cx+w/2+.05,yb+h*.66,-.62],[cx+w/2+.05,.5,-.62],[K[0]-.15,.5,K[2]-.1],[K[0]-.15,.55,K[2]]];
  s.tube(path.slice(0,4),.035,'#b87333',{segs:6});s.tube([[xa,2.35,zc],...cnd],.035,'#8a4b3d',{segs:6});s.tube([[last[0],2.35-9*.215,zc],[last[0],.3,zc],[.9,.25,-.5],[cx+w/2+.05,.3,-.6],[cx+w/2+.05,yb+h-.25,-.6]],.014,'#d08a52',{segs:5});s.tube([[cx+.55,yb+h-tw-.12,-d/2+tw+.06],...ev.slice(1)],.03,'#ced4da',{segs:6});s.tube(path.slice(-4),.035,'#b87333',{segs:6});
  const iHot=cnd.length+4;for(let i=0;i<22;i++){const u=cycle(t*.05+i/22,1),q=along(path,u),idx=Math.floor(u*path.length);s.ball(q,.045,idx<iHot?'#ff6b6b':'#74c0fc',{flat:true})}
  s.arrow([cx,yb+.55,.3],[cx,fy-.15,.3],'#74c0fc',2+4*kk(p.Qc),11,`Q_c = ${p.Qc} W`);s.arrow([K[0]+.2,.45,1.5],[K[0]+.2,.45,.35],C.gold,2+4*kk(W),11,`W = ${f(W,1)} W`);s.arrow([xb+.1,1.4,zc],[xb+.9,2.0,zc],C.red,2+4*kk(p.Qc+W),11,`Q_h = ${f(p.Qc+W,1)} W`);
  s.label([cx+.4,yb+.45,.4],`${p.Tc} °C`,C.blue,12);s.label([xb+.6,.5,zc],`room ${p.Th} °C`,C.gold,12);
  lab(s,[cx-.3,yb+h-.3,-d/2+tw+.06],'evaporator coil',-40,-40);lab(s,[K[0],.5,K[2]+.3],'compressor',-40,60);lab(s,[(xa+xb)/2,2.4,zc],'condenser coils',30,-40);lab(s,[.9,.27,-.5],'capillary (expansion)',60,50);lab(s,[cx-w/2,yb+h*.85,.3],'insulated cabinet',-60,-20);
  s.render();tag(c,`COP = Tc/(Th − Tc) = ${f(cop,2)}`,44,98,C.gold,15)};

R['rectangle-cycle']=(c,p,t)=>{const P1=Math.min(p.P1,p.P2),P2=Math.max(p.P1,p.P2),V1=Math.min(p.V1,p.V2),V2=Math.max(p.V1,p.V2),ph=cycle(t/2,4),corner=[[V1,P1],[V1,P2],[V2,P2],[V2,P1]],i=Math.floor(ph),fr=ph-i,a=corner[i],b=corner[(i+1)%4],cur=[a[0]+(b[0]-a[0])*fr,a[1]+(b[1]-a[1])*fr];
  const s=P3.scene(c,{scale:46,yaw:.3,pitch:.06,cx:185,cy:342}),heat=i<2,h=.3+cur[0]/10*1.9,y0=.62,X=0,Wn=(P2-P1)*(V2-V1);bench(s,0,0,4,2.2);
  if(heat)hotplate(s,[X,0,0],1.8,true,t);else{s.box([X,.14,0],[1.8,.28,1.5],'#3b6fb6');s.cyl([X,.3,0],[0,1,0],.65,.05,'#a5d8ff');s.tube([[X-.9,.1,.5],[X-1.3,.05,.8]],.04,'#74c0fc',{segs:4});s.tube([[X+.9,.1,.5],[X+1.3,.05,.8]],.04,'#74c0fc',{segs:4})}
  const top=pcyl(s,{x:X,y0,R:.62,H:2.4,h,gas:mix('#74c0fc','#ff6b3c',clamp(cur[0]*cur[1]/4000,0,1)),ga:.2,rodL:.12,base:false});s.cyl([X,y0-.04,0],[0,1,0],.68,.08,CU);gasIn(s,14,[X,0],.61,y0,h,.2+Math.sqrt(cur[0]*cur[1])*.012,t,'#42d9ca',.05);
  s.cyl([X,top+.18,0],[0,1,0],.42,.05,IRON);weights(s,[X,top+.2,0],Math.max(1,Math.round(cur[1]/50)),.36);
  lab(s,[X-.36,top+.4,0],`weights: P = ${f(cur[1],0)} kPa`,-40,-40);lab(s,[X+.6,.25,.75],heat?'heater (heat in)':'cooling plate (heat out)',40,40);
  s.render();chart(c,380,96,276,190,{title:'P–V cycle (clockwise)',xl:'V (L)',xmin:0,xmax:10.5,ymin:0,ymax:420,series:[{pts:[...corner,corner[0]],col:C.gold,w:2.5}],marker:[cur[0],cur[1]]});
  tag(c,`W_net = (P₂ − P₁)(V₂ − V₁) = ${f(Wn,0)} J`,44,98,C.gold,15);tag(c,['heat at constant V: pressure rises','heat at constant P: gas expands','cool at constant V: pressure falls','cool at constant P: gas compressed'][i],44,120,C.white,13)};

R['otto-cycle']=(c,p,t)=>{const s=P3.scene(c,{scale:42,yaw:.35,pitch:.04,cx:215,cy:356}),th=t*p.rpm/60*TAU*.05,cr=.45,rod=1.3,yc=.95,ph=((th%(2*TAU))+2*TAU)%(2*TAU),st=Math.floor(ph/PI),u=ph/PI-st,eta=1-Math.pow(p.r,1-p.g);
  const pin=[cr*Math.sin(th),yc+cr*Math.cos(th),0],wy=yc+cr*Math.cos(th)+Math.sqrt(rod*rod-(cr*Math.sin(th))**2),ptop=wy+.28,Rb=.5,cb=1.75,ct=3.35,col=['#ff922b','#adb5bd','#a5d8ff','#ffd8a8'][st];
  bench(s,0,0,3.6,2);s.box([0,.06,0],[2.2,.12,1.4],'#343a40');s.box([0,yc,-1.0],[2.2,1.6,.1],'#3d4349');s.box([0,.25,0],[2.0,.3,1.2],'#495057');s.cyl([0,yc,-.85],[0,0,1],.95,.12,'#8d949b',{cap:'#9aa1a8'});for(let i=0;i<40;i++){const a=TAU*i/40;s.seg([.95*Math.cos(a),yc+.95*Math.sin(a),-.79],[1.0*Math.cos(a),yc+1.0*Math.sin(a),-.79],'#495057',1.5)}
  // crankshaft: journal, web with counterweight, crank pin
  s.cyl([0,yc,-.3],[0,0,1],.1,.8,STEEL);const wa=th;s.box([.5*cr*Math.sin(wa),yc+.5*cr*Math.cos(wa),.05],[.3,cr+.3,.1],'#868e96',{rotZ:-wa});s.box([-.3*Math.sin(wa),yc-.3*Math.cos(wa),.05],[.6,.3,.1],'#6c757d',{rotZ:-wa});s.cyl(V.add(pin,[0,0,.1]),[0,0,1],.09,.25,STEEL);
  const dx=pin[0],dy=wy-pin[1],ang=Math.atan2(dy,-dx);s.box([pin[0]/2,(pin[1]+wy)/2,.2],[rod,.13,.09],'#adb5bd',{rotZ:ang});s.cyl([pin[0],pin[1],.2],[0,0,1],.14,.12,'#adb5bd');s.cyl([0,wy,.2],[0,0,1],.09,.12,'#adb5bd');
  // cylinder: block cut away to show the liner, piston with rings, gas charge
  cutaway(s,[0,cb,0],Rb+.02,.82,ct-cb,'#8d949b','#b9bfc5',16);s.box([-.86,(cb+ct)/2,-.1],[.1,ct-cb,1.1],'#8d949b');s.box([.86,(cb+ct)/2,-.1],[.1,ct-cb,1.1],'#8d949b');
  s.cyl([0,wy+.12,.0],[0,1,0],Rb,.34,'#c3c9cf',{cap:'#d4d9de'});for(const y of[wy+.22,wy+.26])band(s,[0,y,0],Rb+.003,.012,'#343a40');
  const gh=ct-ptop,spark=st===0&&u<.12;if(gh>.02)s.cyl([0,ptop+gh/2,0],[0,1,0],Rb-.01,gh,spark?'#ffd43b':col,{alpha:st===0?.5-.3*u:.3});
  // head, valves with springs, spark plug, manifolds
  s.box([0,ct+.2,0],[1.8,.4,1.3],'#7d848b');s.box([0,ct+.48,0],[1.6,.16,1.1],'#5c636a');const vin=st===2?.14*Math.sin(u*PI):0,vex=st===1?.14*Math.sin(u*PI):0;
  for(const [x,l] of[[-.27,vin],[.27,vex]]){s.cyl([x,ct-.02-l,0],[0,1,0],.15,.04,'#9aa1a8');s.cyl([x,ct+.45-l,0],[0,1,0],.025,.9,STEEL);s.helix([x,ct+.75,0],[0,1,0],.07,.3,5,'#c3c9cf',2)}
  s.cyl([0,ct+.62,.0],[0,1,0],.06,.12,'#c3c9cf',{seg:6});s.cyl([0,ct+.8,0],[0,1,0],.05,.25,'#f8f9fa');s.cyl([0,ct+.95,0],[0,1,0],.02,.08,'#adb5bd');if(spark)s.ball([0,ct-.05,0],.1,'#ffe066',{glow:true,flat:true});
  s.tube([[-.9,ct+.15,0],[-1.25,ct+.1,0],[-1.5,ct-.3,0]],.12,'#868e96',{segs:10});s.tube([[.9,ct+.15,0],[1.25,ct+.1,0],[1.5,ct-.4,0]],.12,'#6b5e55',{segs:10});
  if(st===2)for(let i=0;i<4;i++){const q=cycle(t*2+i/4,1);s.ball([-1.4+q*1.1,ct+.1-q*.4,0],.04,'#a5d8ff',{flat:true})}if(st===1)for(let i=0;i<4;i++){const q=cycle(t*2+i/4,1);s.ball([.25+q*1.2,ct-.1+q*.3,0],.05,'#868e96',{alpha:.6,flat:true})}
  lab(s,[0,ct+.9,0],'spark plug',40,-30);lab(s,[-.27,ct+.8,0],'intake valve',-60,10);lab(s,[.27,ct+.8,0],'exhaust valve',60,-10);lab(s,[-Rb,wy+.15,0],'piston',-70,0);lab(s,[pin[0]/2-.05,(pin[1]+wy)/2,.25],'connecting rod',-60,30);lab(s,[-.85,yc-.2,-.8],'flywheel',-50,30);lab(s,[.1,yc,.3],'crankshaft',60,30);
  s.render();chart(c,420,96,236,150,{title:'Efficiency vs compression ratio',xl:'r',xmin:1,xmax:14,ymin:0,ymax:1,series:[{fn:x=>1-Math.pow(x,1-p.g),col:C.mint}],marker:[p.r,eta]});
  tag(c,`η = 1 − r^(1−γ) = ${f(eta*100,1)} %`,44,98,C.gold,15);tag(c,['power stroke (spark → expansion)','exhaust stroke','intake stroke','compression stroke'][st],44,120,C.white,13)};
})();
