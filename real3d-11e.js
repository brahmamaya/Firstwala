/* Detailed, realistic 3D apparatus for Class 11 physics (part e): oscillations and waves.
   Same parameters, physics and readouts as the earlier scenes; only the apparatus is new. */
/* Class 10 Ultra-Realistic scenes (light, electricity, magnetic effects): real lab apparatus, same parameters and readouts as the 2D views. */
(() => {
'use strict';
const R=window.PhysicaReal3D=window.PhysicaReal3D||{};
const {f,clamp,rad,deg,cycle,tag,chart,PI,TAU,C}=window.PhysicaLab;
const P3=window.Physica3D,V=P3.vec;
const WOOD='#8a5a36',CU='#c47a45',STEEL='#c3c9cf',DKP='#252b32',BOARD='#e7e2d6';
const hx=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)),mixc=(a,b,k)=>{const A=hx(a),B=hx(b);k=clamp(k,0,1);return'#'+A.map((v,i)=>Math.round(v+(B[i]-v)*k).toString(16).padStart(2,'0')).join('')};
const lab=(s,p,txt,dx,dy,col=C.mint)=>s.callout(p,txt,col,dx,dy,11);
const bench=(s,w,d,paper)=>{s.box([0,-.09,0],[w,.18,d],WOOD,{ground:true});for(let i=1;i<9&&!paper;i++){const z=-d/2+d*i/9;s.seg([-w/2+.05,.002,z],[w/2-.05,.002,z+((i*37)%7-3)*.015],'#00000026',1,[],-4.6e5)}if(paper)s.box([0,.03,0],[paper[0],.06,paper[1]],BOARD,{ground:true,stroke:'#00000022'})};
// insulated connecting wire lying on the board (list of [x,z]); drawn below every component
const wire=(s,pts,col='#c0392b',y=.1)=>{const q=pts.map(([x,z])=>[x,y,z]);s.path(q,'#0000007a',6,[],-3e5);s.path(q,col,3.6,[],-3e5+1)};
// conventional-current dots along wire sections, in the order given
const flow=(s,polys,I,t,col='#ffd24d')=>{const sg=[];let tot=0;for(const pl of polys)for(let i=0;i<pl.length-1;i++){const a=pl[i],b=pl[i+1],L=Math.hypot(b[0]-a[0],b[1]-a[1]);if(L>1e-6){sg.push([a,b,L,tot]);tot+=L}}
  if(!tot||!I)return;const n=Math.max(5,Math.round(tot/.5)),v=clamp(Math.sqrt(Math.abs(I))*.55,.15,1.7)*Math.sign(I);
  for(let k=0;k<n;k++){const d=(((k/n)*tot+t*v)%tot+tot)%tot;let g=sg[sg.length-1];for(const q of sg)if(d<q[3]+q[2]){g=q;break}const u=clamp((d-g[3])/g[2],0,1);s.ball([g[0][0]+(g[1][0]-g[0][0])*u,.11,g[0][1]+(g[1][1]-g[0][1])*u],.055,col,{flat:true,glow:true})}};
const BANDS=['#111','#8b4513','#d62828','#ff8c00','#ffd60a','#2a9d3a','#1d4ed8','#7b2cbf','#808080','#f1f1f1'];
const bandCols=Rv=>{const e=Math.floor(Math.log10(Math.max(.1,Rv)))-1;let m=Math.round(Rv/Math.pow(10,e));let ee=e;if(m>=100){m=10;ee++}return[BANDS[Math.floor(m/10)%10],BANDS[m%10],ee>=0?BANDS[Math.min(9,ee)]:ee===-1?'#d4af37':'#c0c0c0','#d4af37']};
// carbon resistor lying along x or z at (x,z); heat 0..1 turns it red
function resistor(s,x,z,ax,Rv,heat=0){const a=ax==='x'?[1,0,0]:[0,0,1],pt=k=>ax==='x'?[x+k,.2,z]:[x,.2,z+k],body=mixc('#d9c7a0','#ff8a4c',heat);
  s.cyl(pt(0),a,.125,.5,body,{seg:14});s.cyl(pt(-.3),a,.1,.14,body,{seg:12});s.cyl(pt(.3),a,.1,.14,body,{seg:12});const bc=bandCols(Rv),off=[-.19,-.09,.01,.2];bc.forEach((col,i)=>s.cyl(pt(off[i]),a,.133,.045,col,{seg:12}));
  s.cyl(pt(-.5),a,.025,.2,STEEL,{seg:6});s.cyl(pt(.5),a,.025,.2,STEEL,{seg:6})}
// filament lamp in a holder
function bulb(s,x,z,g){s.cyl([x,.09,z],[0,1,0],.27,.1,DKP,{seg:16});s.cyl([x,.25,z],[0,1,0],.17,.24,'#b9bec4',{seg:14});for(let i=0;i<3;i++)s.cyl([x,.2+i*.07,z],[0,1,0],.178,.02,'#8d9399',{seg:14});
  if(g>.04)s.ball([x,.75,z],.22,'#ffd27a',{glow:true,flat:true});s.ball([x,.72,z],.4,g>.04?mixc('#e9f6ff','#ffe29a',g):'#e9f6ff',{alpha:.3,flat:true});
  s.tube([[x-.03,.38,z],[x-.07,.62,z]],.012,'#9aa1a8',{segs:4});s.tube([[x+.03,.38,z],[x+.07,.62,z]],.012,'#9aa1a8',{segs:4});s.helix([x,.66,z],[1,0,0],.04,.14,5,g>.04?mixc('#ffb347','#fff6c8',g):'#7a7f86',2.2);if(g>.04)s.ball([x,.66,z],.1+.1*g,'#fff2c6',{flat:true,glow:true})}
// battery pack, long axis along z; + terminal at the far (-z) end
function pack(s,x,z,txt){s.box([x,.2,z],[.72,.34,1.0],DKP);s.box([x,.38,z],[.5,.02,.8],'#3a424b');s.engrave([x,.395,z],txt,'#e9f6ff',12);
  s.cyl([x,.4,z-.4],[0,1,0],.07,.14,'#d62828',{seg:10});s.cyl([x,.4,z+.4],[0,1,0],.07,.14,'#111',{seg:10});s.engrave([x,.395,z-.26],'+','#ff8a80',13);s.engrave([x,.395,z+.26],'−','#9fb4c2',13)}
// AA-type cell lying along x, + nub toward +x
function cellx(s,x,z){s.cyl([x,.17,z],[1,0,0],.16,.56,'#2f6f9a',{seg:14});s.cyl([x-.18,.17,z],[1,0,0],.162,.1,'#c9ced3',{seg:14});s.cyl([x+.31,.17,z],[1,0,0],.06,.07,'#e3e6e9',{seg:10});s.cyl([x+.05,.17,z],[1,0,0],.163,.05,'#d4af37',{seg:14})}
const CIRC_SCENE=c=>P3.scene(c,{scale:64,pitch:.2,yaw:.3,cy:276});
const dirArrow=(s,a,b,I)=>s.arrow(a,b,C.gold,3,10,`I = ${f(I,I<1?3:2)} A`);

/* ---------- Ohm's law circuit ---------- */
R['c10-circuit']=(c,p,t)=>{const s=CIRC_SCENE(c),I=p.voltage/p.resistance,heat=clamp(I*I*p.resistance/150,0,1);bench(s,7.4,4.6,[6.8,4.1]);pack(s,-2.5,0,p.voltage+' V');
  const A=[[-2.5,-.4],[-2.5,-1.4],[-1.5,-1.4]],B=[[1.5,-1.4],[2.5,-1.4],[2.5,-.27]],D=[[2.5,.27],[2.5,1.4],[-2.5,1.4],[-2.5,.4]];wire(s,A);wire(s,B);wire(s,D,'#2c2f33');
  resistor(s,0,-1.4,'x',p.resistance,heat);bulb(s,2.5,0,clamp(I/3,0,1));flow(s,[A,B,D],I,t);
  lab(s,[-2.5,.45,0],'battery',-34,-26);lab(s,[0,.3,-1.4],`resistor R = ${f(p.resistance,1)} Ω`,0,-42);lab(s,[2.5,1,0],'bulb',36,-30);dirArrow(s,[.9,.5,1.4],[-.7,.5,1.4],I);
  s.render();tag(c,`I = V/R = ${f(I,2)} A  (dots: conventional current, from the + terminal)`,44,98,C.gold,14)};

/* ---------- Series / parallel resistors ---------- */
R['c10-resistor-network']=(c,p,t)=>{const s=CIRC_SCENE(c),ser=p.mode==='series',Req=ser?p.r1+p.r2:p.r1*p.r2/(p.r1+p.r2);bench(s,7.4,4.6,[6.8,4.1]);pack(s,-2.5,0,'6 V');
  if(ser){const I=6/Req,A=[[-2.5,-.4],[-2.5,-1.4],[-1.5,-1.4]],B=[[-.5,-1.4],[.5,-1.4]],D=[[1.5,-1.4],[2.5,-1.4],[2.5,1.4],[-2.5,1.4],[-2.5,.4]];wire(s,A);wire(s,B);wire(s,D,'#2c2f33');
    resistor(s,-1,-1.4,'x',p.r1,clamp(I*I*p.r1/40,0,1));resistor(s,1,-1.4,'x',p.r2,clamp(I*I*p.r2/40,0,1));flow(s,[A,B,D],I,t);lab(s,[-1,.3,-1.4],`R₁ = ${f(p.r1,0)} Ω`,-20,-42);lab(s,[1,.3,-1.4],`R₂ = ${f(p.r2,0)} Ω`,20,-42);dirArrow(s,[.9,.5,1.4],[-.7,.5,1.4],I)}
  else{const I1=6/p.r1,I2=6/p.r2,I=I1+I2,A=[[-2.5,-.4],[-2.5,-1.4],[-1.3,-1.4]],B1=[[-1.3,-1.4],[-.5,-1.4]],B1b=[[.5,-1.4],[1.3,-1.4]],B2=[[-1.3,.1],[-.5,.1]],B2b=[[.5,.1],[1.3,.1]],cl=[[-1.3,-1.4],[-1.3,.1]],cr=[[1.3,-1.4],[1.3,.1]],D=[[1.3,.1],[2.5,.1],[2.5,1.4],[-2.5,1.4],[-2.5,.4]];
    for(const w of[A,B1,B1b,B2,B2b,cl,cr])wire(s,w);wire(s,D,'#2c2f33');resistor(s,0,-1.4,'x',p.r1,clamp(I1*I1*p.r1/40,0,1));resistor(s,0,.1,'x',p.r2,clamp(I2*I2*p.r2/40,0,1));
    flow(s,[A],I,t);flow(s,[B1,B1b],I1,t);flow(s,[B2,B2b],I2,t);flow(s,[D],I,t);flow(s,[[[-1.3,-1.4],[-1.3,.1]]],I2,t);
    lab(s,[0,.3,-1.4],`R₁ = ${f(p.r1,0)} Ω`,0,-40);lab(s,[0,.3,.1],`R₂ = ${f(p.r2,0)} Ω`,0,34);dirArrow(s,[.9,.5,1.4],[-.7,.5,1.4],I)}
  s.render();tag(c,`R_eq = ${f(Req,2)} Ω  ·  ${ser?'same current through both':'same voltage across both'}`,44,98,C.gold,14)};

/* ---------- Cells in series and in parallel ---------- */
R['c10-cells-combination']=(c,p,t)=>{const s=P3.scene(c,{scale:56,pitch:.2,yaw:.3,cy:276}),n=Math.round(p.n),Is=n*p.E/(p.Rl+n*p.r),Ip=p.E/(p.Rl+p.r/n),ser=p.mode==='series',I=ser?Is:Ip,g=clamp(I*I*p.Rl/10,0,1);bench(s,8.6,5.4,[8,4.9]);
  let A,B,D;
  if(ser){const x0=-(n-1)*.33,xp=x0+(n-1)*.66+.4,xm=x0-.3;for(let i=0;i<n;i++)cellx(s,x0+i*.66,1.8);A=[[xp,1.8],[3.2,1.8],[3.2,-1.8],[1.75,-1.8]];B=[[.65,-1.8],[-3.2,-1.8],[-3.2,-.27]];D=[[-3.2,.27],[-3.2,1.8],[xm,1.8]];wire(s,[[xm,1.8],[x0-.12,1.8]],'#2c2f33');
    lab(s,[x0,.3,1.8],`${n} cells in series`,0,36)}
  else{const cx=-2.4,z0=-(n-1)*.2,zn=(n-1)*.2;for(let i=0;i<n;i++)cellx(s,cx,z0+i*.4);const xp=cx+.36,xm=cx-.3;A=[[xp,z0],[xp,-1.8],[1.75,-1.8]];B=[[.65,-1.8],[3.2,-1.8],[3.2,-.27]];D=[[3.2,.27],[3.2,1.8],[xm,1.8],[xm,zn]];wire(s,[[xp,z0],[xp,zn]]);wire(s,[[xm,z0],[xm,zn]],'#2c2f33');
    lab(s,[cx,.3,zn],`${n} cells in parallel`,-10,40)}
  wire(s,A);wire(s,B);wire(s,D,'#2c2f33');resistor(s,1.2,-1.8,'x',p.Rl,clamp(I*I*p.Rl/40,0,1));bulb(s,3.2,0,g);
  if(ser)flow(s,[A.slice(1),B,D.slice(0,2)],I,t);else flow(s,[A,B,D],I,t);
  lab(s,[1.2,.3,-1.8],`load R = ${f(p.Rl,1)} Ω`,0,-40);s.arrow([3.2,.3,1.0],[3.2,.3,-1.0],C.gold,3,10,`I = ${f(I,3)} A`);
  s.render();tag(c,`each cell ${f(p.E,1)} V, r = ${f(p.r,1)} Ω  ·  I = ${f(I,3)} A`,44,98,C.gold,14)};

/* ---------- Refraction through a glass slab ---------- */
R['c10-glass-slab']=(c,p,t)=>{const s=P3.scene(c,{scale:52,pitch:.5,yaw:.55,cy:268}),i=rad(p.i),r=Math.asin(Math.sin(i)/p.n),dT=p.t*.3,zc=.55,top=zc-dT/2,bot=zc+dT/2,ix=-1.1,ox=ix+dT*Math.tan(r),y=.4,E=1.25,Lr=1.7;
  s.box([0,-.09,.5],[8.4,.18,6.4],WOOD,{ground:true});s.box([0,.03,.5],[7.6,.06,5.8],'#f1eee5',{ground:true,stroke:'#00000022'});for(let k=-3;k<=3;k++)s.seg([k*1.1,.065,-2.4],[k*1.1,.065,3.4],'#9fb4c233',1,[],-4.5e5);
  const I0=[ix,y,top],O0=[ox,y,bot],S0=[ix-Lr*Math.sin(i),y,top-Lr*Math.cos(i)],E0=[ox+E*Math.sin(i),y,bot+E*Math.cos(i)],U=[ix+(bot-top+E*Math.cos(i))*Math.tan(i),y,bot+E*Math.cos(i)];
  s.box([0,.33,zc],[5.6,.54,dT],'#9fd3f0',{alpha:.38,stroke:'#e9f6ffaa'});
  s.seg([ix,.07,top-1],[ix,.07,top+.9],'#5c6b78',1.3,[5,4],-4e5);s.seg([ox,.07,bot-.9],[ox,.07,bot+1.1],'#5c6b78',1.3,[5,4],-4e5);lab(s,[ix,.07,top-1],'normal',34,-4,'#6b7a86');
  const beam=(a,b)=>{s.seg(a,b,'#ff4d4d55',7,[],5e5);s.seg(a,b,'#ff6b6b',2.4,[],5e5+1)};beam(S0,I0);beam(I0,O0);beam(O0,E0);if(p.i>2)s.seg(I0,U,'#ff6b6b88',1.4,[6,5],5e5);
  const dl=V.norm(V.sub(I0,S0));s.cyl(V.sub(S0,V.mul(dl,.32)),dl,.09,.7,'#2b2f35',{seg:10});s.cyl(V.add(V.sub(S0,V.mul(dl,.32)),V.mul(dl,.36)),dl,.095,.04,'#ff3b3b',{seg:10,caps:true});
  const arc=(o,a0,a1,rr,col)=>s.path(Array.from({length:9},(_,k)=>{const a=a0+(a1-a0)*k/8;return[o[0]+rr*Math.sin(a),y,o[2]+rr*Math.cos(a)]}),col,1.6,[],6e5);
  arc(I0,PI,PI+i,.6,'#ffffffcc');lab(s,[I0[0]-.6*Math.sin(PI-i/2)*-1*0-.6*Math.sin(i/2),y,I0[2]-.6*Math.cos(i/2)],`i = ${f(p.i,0)}°`,-44,-14,C.white);
  arc(I0,0,r,.5,'#ffffffcc');lab(s,[I0[0]+.5*Math.sin(r/2),y,I0[2]+.5*Math.cos(r/2)],`r = ${f(deg(r),1)}°`,-46,10,C.white);
  arc(O0,0,i,.55,'#ffffffcc');lab(s,[O0[0]+.55*Math.sin(i/2),y,O0[2]+.55*Math.cos(i/2)],`e = ${f(p.i,0)}°`,-46,22,C.white);
  const dcm=p.t*Math.sin(i-r)/Math.cos(r);if(p.i>3){const M=V.add(O0,V.mul([Math.sin(i),0,Math.cos(i)],.8)),N2=V.add(M,V.mul([Math.cos(i),0,-Math.sin(i)],dcm*.3));s.seg(M,N2,C.mint,2.2,[],6e5);lab(s,N2,`d = ${f(dcm,2)} cm`,56,8)}
  lab(s,[-2.8,.58,bot],`glass  n = ${f(p.n,2)}`,-10,34,'#bfe8ff');
  s.render();tag(c,'red laser beam through a rectangular glass slab (top view on the table)',44,98,C.muted,13)};

/* ---------- Resistance of a wire ---------- */
const RHO3={copper:['Copper','#d9844a'],aluminium:['Aluminium','#c5ccd3'],iron:['Iron','#8d99a6'],nichrome:['Nichrome','#b9a37a']},RHOV={copper:1.68e-8,aluminium:2.65e-8,iron:9.7e-8,nichrome:1.10e-6};
R['c10-wire-resistance']=(c,p,t)=>{const s=P3.scene(c,{scale:58,pitch:.2,cy:290}),rho=RHOV[p.mat],[name,col]=RHO3[p.mat],A=PI*(p.d/1000)**2/4,Rw=rho*p.L/A,I=p.V/Rw,len=.6+p.L*1.0,th=.07+p.d*.09,x0=-len/2,y=.5;
  bench(s,9,4.6,[8.2,4]);
  // metre scale under the wire
  s.box([0,.07,-.25],[6.4,.1,.5],'#e6c97a');for(let k=0;k<=50;k++){const x=-3.2+k*.128;s.seg([x,.125,-.05],[x,.125,-.05-(k%10===0?.2:k%5===0?.14:.08)],'#2b2118',1,[],-2e5)}for(let k=0;k<=5;k++)s.engrave([-3.2+k*1.28,.126,-.38],String(k),'#2b2118',10,-2e5);
  for(const sg of[-1,1]){const x=sg*len/2;s.box([x+sg*.08,.3,-.25],[.28,.5,.36],'#2f3d48');s.cyl([x,y,-.25],[1,0,0],.1,.2,STEEL,{seg:8})}
  s.cyl([0,y,-.25],[1,0,0],th,len,col,{seg:12,cap:mixc(col,'#ffffff',.25)});for(let k=0;k<26;k++){const x=x0+((k/26*len+t*Math.min(1.2,Math.log10(1+I*20)*.35))%len);s.ball([x,y,-.25],Math.max(.03,th*.55),'#ffd24d',{flat:true,glow:true})}
  wire(s,[[x0,-.25],[x0,1.6],[1.7,1.6]],'#c0392b',.22);wire(s,[[len/2,-.25],[len/2,1.0],[3.1,1.0],[3.1,1.6]],'#2c2f33',.22);
  s.box([2.4,.3,1.6],[1.5,.5,.8],'#2b3036');s.box([2.4,.57,1.6],[1.1,.04,.5],'#dfe8ef');s.engrave([2.4,.6,1.6],`${f(p.V,1)} V`,'#1b3a52',13);lab(s,[2.4,.55,1.6],'cell / battery',20,30);
  lab(s,[len/2-.1,y+th,-.25],`d = ${f(p.d,2)} mm`,24,-44);lab(s,[0,y+th+.02,-.25],`${name} wire, l = ${f(p.L,1)} m`,0,-62,col);
  
  s.render();tag(c,`R = ρl/A = ${Rw<1?f(Rw,3):f(Rw,2)} Ω   ·   I = ${f(I,3)} A`,44,98,C.gold,15)};

/* ---------- Electric power and the bill ---------- */
R['c10-electric-power']=(c,p,t)=>{const s=P3.scene(c,{scale:56,pitch:.1,cy:290}),g=clamp(Math.log10(p.P)/3.5,.1,1),kwh=p.P/1000*p.h*30,days=cycle(t*3,30);bench(s,8.6,4.6,[7.8,4]);
  if(p.P<150){bulb(s,-2.4,0,g);s.cyl([-2.4,.04,0],[0,1,0],.5,.05,'#2f3640',{seg:20});lab(s,[-2.4,.9,0],`${f(p.P,0)} W bulb`,-50,-38,C.white)}
  else{const h=clamp((p.P-150)/2850,0,1);s.box([-2.4,.45,0],[1.6,.8,.9],'#c6ccd2');s.box([-2.4,.5,.46],[1.3,.5,.04],'#2b2f35');for(let k=0;k<5;k++)s.box([-2.4,.3+k*.1,.49],[1.2,.03,.03],mixc('#6a3b2a','#ff7a2a',h*(.4+.6*Math.sin(k)**2)),{});if(h>.1)s.ball([-2.4,.5,.9],.5+.5*h,'#ff8a3c',{glow:true,flat:true,alpha:.25});lab(s,[-2.4,.85,0],`${f(p.P,0)} W heater`,-40,-38,C.white)}
  // electricity meter: housing, readout window and the spinning disc
  s.box([.4,.9,0],[2.0,1.8,.5],'#dfe3e6',{stroke:'#8d99a6'});s.box([.4,1.35,.27],[1.5,.4,.02],'#0b1722');s.engrave([.4,1.35,.29],f(kwh*days/30,1).padStart(6,' ')+' kWh','#ffd24d',14);
  s.cyl([.4,.65,.26],[0,0,1],.38,.03,'#c9d3da',{seg:20,cap:'#eef3f6'});const a=TAU*cycle(t*Math.min(4,p.P/400+.2),1);s.seg([.4,.65,.3],[.4+.34*Math.cos(a),.65+.34*Math.sin(a),.3],'#d62828',3,[],5e5);s.engrave([.4,.2,.28],'ENERGY METER','#334455',9,5e5);
  s.engrave([.4,1.62,.27],`day ${Math.floor(days+1)} of 30`,'#334455',9);
  wire(s,[[-1.7,0],[-.6,0]],'#c0392b',.25);lab(s,[1.2,1.0,0],'kWh meter',50,-44);
  s.render();tag(c,`${f(p.P,0)} W × ${f(p.h,1)} h/day × 30 = ${f(kwh,1)} kWh  →  ₹ ${f(kwh*p.rate,0)}`,44,98,C.gold,14)};

/* ---------- Magnetic field around a straight wire ---------- */
R['c10-wire-field']=(c,p,t)=>{const s=P3.scene(c,{scale:48,pitch:.18,cy:322}),sg=Math.sign(p.I),B=2e-7*Math.abs(p.I)/(p.r/100),w=B/(B+5e-5);bench(s,8.4,6,[0,0]);s.poly([[-3,.02,-2.4],[3,.02,-2.4],[3,.02,2.4],[-3,.02,2.4]].reverse(),'#f1eee5',{normal:[0,1,0],z:-3e5});
  s.cyl([0,.8,0],[0,1,0],.06,2.7,CU,{seg:10});s.cyl([0,-.2,0],[0,1,0],.12,.1,'#2f3d48',{seg:10});
  for(let k=1;k<=5;k++){const rr=k*.5;s.ring([0,.04,0],[0,1,0],rr,sg?'#2b8fd1'+Math.round((.95-k*.13)*255).toString(16).padStart(2,'0'):'#9fb4c2',sg?2.2:1.2,[],64);
    if(sg)for(let j=0;j<2;j++){const a=-sg*t*.5+k+j*PI,a2=a-sg*.3;s.arrow([rr*Math.cos(a),.07,rr*Math.sin(a)],[rr*Math.cos(a2),.07,rr*Math.sin(a2)],'#5bb8f0',2,6)}}
  // compasses around the wire at distance r (needle = Earth's field to the north plus the wire's field)
  const rr=p.r*.5;for(let k=0;k<8;k++){const a=TAU*k/8+.4,px=rr*Math.cos(a),pz=rr*Math.sin(a),tg=sg?[sg*Math.sin(a),0,-sg*Math.cos(a)]:[0,0,0],nx=[0,0,-1],vv=V.add(V.mul(nx,sg?1-w:1),V.mul(tg,sg?w:0)),u=V.norm(vv);
    s.cyl([px,.07,pz],[0,1,0],.2,.07,'#2b333b',{seg:14,cap:'#e9f3f8'});s.tube([[px-u[0]*.15,.12,pz-u[2]*.15],[px,.12,pz]],.028,'#e9f3f8',{segs:5});s.tube([[px,.12,pz],[px+u[0]*.15,.12,pz+u[2]*.15]],.028,'#e63946',{segs:5})}
  s.arrow([.35,1.9,0],[.35,sg>=0?2.5:1.3,0],C.gold,3,10,`I = ${f(p.I,1)} A`);s.label([0,-.55,2.6],'north  ↑',C.muted,11);lab(s,[0,0,-2.4],'cardboard sheet',60,-20);lab(s,[rr*Math.cos(.4),.12,rr*Math.sin(.4)],`compass at r = ${f(p.r,1)} cm`,70,-48);
  s.render();tag(c,sg?`field circles ${p.I>0?'anticlockwise':'clockwise'} seen from above (right-hand rule)`:'no current: needles point north',44,98,C.muted,13)};

/* ---------- Defects of vision ---------- */
const lensProf=(concave,r)=>concave?[[0,.035],[r*.33,.05],[r*.66,.1],[r,.16],[r,-.16],[r*.66,-.1],[r*.33,-.05],[0,-.035]]:[[0,.17],[r*.33,.155],[r*.66,.105],[r*.97,.02],[r*.97,-.02],[r*.66,-.105],[r*.33,-.155],[0,-.17]];
R['c10-eye-defects']=(c,p,t)=>{const s=P3.scene(c,{scale:58,pitch:.12,yaw:.05,cx:335,cy:262}),fix=+p.fix&&p.defect!=='normal',XL=-.55,RET=1.04,XS=-1.75,K=.0116;let fx=RET;
  if(p.defect==='myopia'&&!fix)fx=RET-clamp(30/p.fp+12,14,74)*K;if(p.defect==='hyper'&&!fix)fx=RET+clamp(14*(4-1/p.np),10,60)*K;
  s.ball([0,0,0],1.1,'#fff4ec',{alpha:.3,flat:true,stroke:'#ffffff55'});s.ball([-.98,0,0],.42,'#cfe8f5',{alpha:.3,flat:true});s.tube([[-1.0,.46,0],[-.9,.3,0]],.05,'#7a5a3a',{segs:6});s.tube([[-1.0,-.46,0],[-.9,-.3,0]],.05,'#7a5a3a',{segs:6});
  s.path(Array.from({length:21},(_,k)=>{const a=-.8+1.6*k/20;return[1.08*Math.cos(a),1.08*Math.sin(a),0]}),'#ff6b5e',7,[],-1e5);
  s.lathe([XL,0,0],lensProf(false,.5),'#bfe8ff',{rot:[0,0,PI/2],alpha:.7,spec:.8,segs:16});
  s.tube([[-.7,.55,0],[-.62,.3,0]],.04,'#8a5a36',{segs:6});s.tube([[-.7,-.55,0],[-.62,-.3,0]],.04,'#8a5a36',{segs:6});
  const near=p.defect==='hyper',xo=near?-3.2:-3.3,Dv=p.defect==='myopia'?2.4+.5*p.fp:3.05+(p.np-.25)*1.8,hs=[-.42,0,.42];
  if(near){s.arrow([xo,-.35,0],[xo,.35,0],C.gold,4,10);s.label([xo,.7,0],'object at 25 cm',C.muted,11)}else s.label([xo+.2,.6,0],'distant object',C.muted,11);
  if(fix){const conc=p.defect==='myopia';s.lathe([XS,0,0],lensProf(conc,.62),'#bfe8ff',{rot:[0,0,PI/2],alpha:.45,spec:.9,segs:18});s.ring([XS,0,0],[1,0,0],.62,'#e9f6ff',2,[],40);lab(s,[XS,-.62,0],conc?'concave spectacle lens':'convex spectacle lens',-30,50)}
  const beam='#ffc36b';for(const hl of hs){const m=near||fix?hl/Dv:0;let pts;
    if(fix){const hsp=hl-m*(XL-XS);pts=[[xo,near?0:hsp,0],[XS,hsp,0],[XL,hl,0]]}else pts=[[xo,near?0:hl,0],[XL,hl,0]];
    pts.push([fx,0,0]);if(fx<RET){const sl=(0-hl)/(fx-XL);pts.push([RET,sl*(RET-fx),0])}
    s.path(pts,beam,2.4,[],4e5);if(fx>RET){const sl=(0-hl)/(fx-XL);s.path([[RET,hl+sl*(RET-XL),0],[fx,0,0]],beam+'66',1.4,[4,4],4e5)}}
  const ok=Math.abs(fx-RET)<.02;s.ball([Math.min(fx,RET+.5),0,0],.06,ok?C.mint:C.red,{glow:true,flat:true});
  lab(s,[1.05,.7,0],'retina',44,-34,'#ff9b8a');lab(s,[XL,.4,0],'eye lens',-8,-60);
  s.render();tag(c,ok?'sharp image on the retina':fx<RET?'focus in front of the retina':'focus behind the retina',44,98,ok?C.mint:C.red,15)};

/* ---------- Scattering: blue sky, red sunset ---------- */
const LAM=[650,550,450],rgb=a=>'#'+a.map(v=>Math.round(clamp(v,0,1)*255).toString(16).padStart(2,'0')).join('');
const skyModel=p=>{const am=1/Math.max(.035,Math.sin(rad(p.sun))),small=p.size==='molecules',k=small?.13:.02;const tr=LAM.map(l=>Math.exp(-k*(small?(550/l)**4:1)*am-(small?0:(p.size==='cloud'?.9:.25))*am*.4));return{am,tr,small,sc:LAM.map(l=>small?(550/l)**4:1)}};
R['c10-scattering']=(c,p,t)=>{const m=skyModel(p),sunc=m.tr.map(v=>v/Math.max(...m.tr)),X0=34,X1=656,Y0=112,GY=345;
  const skyTop=m.small?rgb(m.sc.map((q,i)=>.1+.62*q/m.sc[2]*Math.min(1,m.tr[i]+.35)).map(v=>v*(.35+.65*Math.min(1,p.sun/25)))):p.size==='cloud'?'#c9d2db':'#b8bcc0';
  c.save();const g=c.createLinearGradient(0,Y0,0,GY);g.addColorStop(0,skyTop);g.addColorStop(1,p.sun<12&&m.small?rgb([1,.55*sunc[1]+.25,.3*sunc[2]+.15]):mixc(skyTop,'#ffffff',.35));c.fillStyle=g;c.fillRect(X0,Y0,X1-X0,GY-Y0);
  if(p.size==='cloud'){c.fillStyle='#ffffffcc';for(const [cx,cy,r] of[[120,190,34],[160,176,44],[205,192,36],[460,230,30],[497,214,40],[540,232,32]]){c.beginPath();c.arc(cx,cy,r,0,TAU);c.fill()}}c.restore();
  c.save();const gg=c.createLinearGradient(0,GY,0,400);gg.addColorStop(0,'#4d8f45');gg.addColorStop(1,'#2f6a33');c.fillStyle=gg;c.fillRect(X0,GY,X1-X0,400-GY);c.restore();
  const s=P3.scene(c,{scale:44,pitch:-.25,yaw:0,cx:300,cy:374});for(const [tx,tz,h] of[[-3.6,-.6,1.1],[3.4,-.4,1.4],[4.4,-1.4,1.0],[-4.6,-1.2,1.3]]){s.cyl([tx,h*.25,tz],[0,1,0],.07,h*.5,'#6b4a2c',{seg:6});s.ball([tx,h*.7,tz],.38,'#2f7a38');s.ball([tx,h*.95,tz],.28,'#3b8c43')}
  const ang=rad(p.sun),eye=[-1.2,.92,.6],dir=[Math.cos(ang),Math.sin(ang),0],sunP=V.add(eye,V.mul(dir,3.5));
  s.cyl([-1.2,.25,.6],[0,1,0],.17,.5,'#2f4c7a',{seg:10});s.cyl([-1.2,.62,.6],[0,1,0],.2,.45,'#c0392b',{seg:10});s.ball([-1.2,1.0,.6],.16,'#e8b98e');lab(s,[-1.2,.55,.6],'observer',-34,40,C.white);
  s.ball(sunP,.5,rgb(sunc.map(v=>.25+.75*v)),{glow:true,flat:true});s.ball(sunP,.78,rgb(sunc),{alpha:.18,flat:true});
  s.seg(eye,sunP,'#fff7d6aa',2,[7,6],5e5);
  for(let k=0;k<7;k++){const q=(k+.5)/7,pp=V.add(eye,V.mul(dir,q*3.2)),a=TAU*cycle(t*.3+k*.37,1),w=m.small?'#4aa3ff':'#ffffff',dd=[.3*Math.cos(a),.3*Math.sin(a),.1*Math.sin(a*1.7)];s.arrow(pp,V.add(pp,dd),w,1.8,6)}
  s.render();tag(c,m.small?'blue light is scattered sideways much more than red':'large particles scatter all colours about equally',44,98,m.small?'#bfe0ff':'#f2f2f2',13)};

/* ---------- Electron drift ---------- */
const hsh=i=>{const x=Math.sin(i*127.1+311.7)*43758.5453;return x-Math.floor(x)};
R['c10-electron-drift']=(c,p,t)=>{const s=P3.scene(c,{scale:56,pitch:.22,yaw:.25,cy:268}),Rr=.3+p.radius*.35,vd=p.current/(8.5e28*1.6e-19*PI*(p.radius/1000)**2);
  s.cyl([0,0,0],[1,0,0],Rr,6.4,'#d9844a',{alpha:.28,caps:false,seg:20});s.cyl([3.2,0,0],[1,0,0],Rr,.02,'#e9a77a',{cap:'#e9a77a',seg:20});s.cyl([-3.2,0,0],[1,0,0],Rr,.02,'#e9a77a',{cap:'#e9a77a',seg:20});
  for(let i=0;i<5;i++)for(let j=0;j<5;j++)for(let k=0;k<2;k++){const y=(j-2)*Rr*.42,z=(k?.5:-.5)*Rr*.8+(i%2?.12:-.12)*Rr;if(Math.hypot(y,z)>Rr*.88)continue;s.ball([-2.8+i*1.4,y,z],.1,'#ffd8a8',{stroke:'#b9722f'})}
  for(let i=0;i<22;i++){const x=-3.1+((hsh(i)*6.2-t*vd*800)%6.2+6.2)%6.2,j=.05*Math.sin(t*25+i*3),y=(hsh(i+3)-.5)*1.6*Rr,z=(hsh(i+6)-.5)*1.6*Rr;if(Math.hypot(y,z)>Rr*.9)continue;s.ball([x+j,y+j,z],.055,'#4dabf7',{flat:true,glow:true})}
  s.arrow([-1.2,Rr+.35,0],[1.2,Rr+.35,0],C.gold,3,11,`I = ${p.current} A (conventional)`);s.arrow([1.2,-Rr-.35,0],[-1.2,-Rr-.35,0],'#4dabf7',3,11,'electrons drift');
  lab(s,[-2.8,0,.3],'copper ion',-30,50,'#ffd8a8');
  s.render();tag(c,`drift speed ≈ ${f(vd*1000,3)} mm/s (electrons move opposite to current)`,44,98,C.muted,13)};

/* ---------- Solenoid ---------- */
R['c10-solenoid']=(c,p,t)=>{const s=P3.scene(c,{scale:62,pitch:.3,yaw:.2,cy:268}),len=1.6+p.length*2.4,Rc=.6,B=4e-7*PI*p.turns*p.current/p.length,turns=clamp(p.turns/40,6,25);bench(s,8.6,4.6,[0,0]);
  s.box([0,-.04,0],[7.8,.05,3.8],'#d8d2c4',{ground:true});s.cyl([0,.8,0],[1,0,0],Rc*.92,len,'#c9b99a',{alpha:.5,seg:18,caps:false});
  s.helix([0,.8,0],[1,0,0],Rc,len,turns,CU,3.4);for(const x of[-len/2,len/2]){s.cyl([x,.4,0],[0,1,0],.04,.8,'#8d99a6',{seg:6})}
  for(let i=0;i<8;i++){const q=cycle(t*.25+i/8,1),a=TAU*turns*q;s.ball([-len/2+q*len,.8+Rc*Math.cos(a),Rc*Math.sin(a)],.05,'#ffd24d',{flat:true,glow:true})}
  pack(s,-3.0,1.3,Math.round(p.current*10)/10+' A');wire(s,[[-3.0,.9],[-3.0,.3],[-len/2,.3]],'#c0392b',.06);wire(s,[[-3.0,1.7],[3.0,1.7],[3.0,.3],[len/2,.3]],'#2c2f33',.06);
  const n=clamp(Math.round(B*1000),2,5);for(let k=0;k<4;k++){const az=TAU*k/4+.5,cs=Math.cos(az),sn=Math.sin(az);for(let j=0;j<n;j++){const rho=Rc*.65*(j+.5)/n*1.4,ro=Rc+.55+.5*j,e=len/2+.35;
      s.path([[-e,.8+rho*cs,rho*sn],[e,.8+rho*cs,rho*sn]],'#7baaffcc',1.5,[],4e5);
      s.path(Array.from({length:19},(_,q)=>{const a=PI*q/18,rr=rho+(ro-rho)*Math.sin(a);return[e*Math.cos(a),.8+rr*cs,rr*sn]}),'#7baaff77',1.2,[],4e5);
      if(j===0&&k===0)s.arrow([-.4,.8+rho*cs,rho*sn],[.5,.8+rho*cs,rho*sn],'#bcd6ff',2,8)}}
  s.label([len/2+.5,.8,0],'N',C.red,16);s.label([-len/2-.5,.8,0],'S',C.blue,16);lab(s,[0,1.4,0],'coil of insulated copper wire',-20,-34,C.white);
  s.render();tag(c,`B ≈ μ₀nI = ${f(B*1000,2)} mT  (thumb of right hand along the field)`,44,98,C.gold,14)};


/* ---------- Force on a current-carrying conductor ---------- */
R['c10-force-on-wire']=(c,p,t)=>{const s=P3.scene(c,{scale:44,pitch:.2,yaw:.15,cy:300}),F=p.field*p.current*p.length,Fa=Math.abs(F),Lw=.9+p.length*1.9,yb=.55,yt=yb+Lw,sgn=Math.sign(p.current),dx=-sgn*clamp(Fa*.14,0,.85)*(.5+.5*Math.sin(t*2));bench(s,9,5,[0,0]);
  // horseshoe-type magnet: N pole (front, translucent so the wire stays visible), S pole (back) and a steel yoke
  const hy=1.55;s.box([0,hy,-1.25],[2.4,2.6,.5],'#3d78d8');s.box([0,hy,1.25],[2.4,2.6,.5],'#e5484d',{alpha:.4});s.box([-1.4,hy,0],[.4,2.6,3.0],'#9aa1a8');s.label([0,hy+1.55,1.25],'N',C.red,18);s.label([0,hy+1.55,-1.25],'S',C.blue,18);
  for(let i=0;i<3;i++)for(let j=0;j<2;j++)s.arrow([-.7+i*.7,.75+j*1.6,.95],[-.7+i*.7,.75+j*1.6,-.95],'#bcd6ffaa',1.3,6,i===2&&j===1?`B = ${f(p.field,1)} T (N → S, into the page)`:'');
  // rails and the moving conductor
  for(const y of[yb,yt]){s.cyl([0,y,0],[1,0,0],.05,5.2,'#c3c9cf',{seg:8});for(const x of[-2.6,2.6])s.cyl([x,y/2-.05,0],[0,1,0],.07,y,'#2f3d48',{seg:8})}
  s.cyl([dx,(yb+yt)/2,0],[0,1,0],.07,Lw,CU,{seg:10});
  const ppos=[3.4,0,1.5];pack(s,ppos[0],ppos[2],'');const topC=sgn>=0?'#2c2f33':'#c0392b',botC=sgn>=0?'#c0392b':'#2c2f33';
  s.tube([[2.6,yt,0],[3.0,yt,0],[3.0,.4,.9],[3.4,.45,1.0]],.03,topC,{segs:5});s.tube([[2.6,yb,0],[2.95,yb,0],[2.95,.3,1.4],[3.4,.4,1.9]],.03,botC,{segs:5});
  if(sgn){s.arrow([dx+.25,yb+.2,0],[dx+.25,yb+.2+sgn*Math.min(1,Lw*.5),0],C.gold,3,10,`I = ${Math.abs(p.current)} A`);s.arrow([dx,(yb+yt)/2,0],[dx-sgn*clamp(.5+Fa*.25,.5,1.5),(yb+yt)/2,0],C.red,4,11,`F = BIL = ${f(Fa,2)} N`)}
  s.render();tag(c,`F = BIL = ${f(Fa,2)} N`+(sgn?`  ·  force is to the ${sgn>0?'left':'right'}`:''),44,98,C.gold,15)};

/* ---------- Magnetic field on the axis of a loop ---------- */
const loopB=(q,Rv)=>{let bx=0,by=0,bz=0;const N=18;for(let k=0;k<N;k++){const a=TAU*(k+.5)/N,py=Rv*Math.cos(a),pz=Rv*Math.sin(a),dy=-Math.sin(a),dz=Math.cos(a),rx=q[0],ry=q[1]-py,rz=q[2]-pz,r3=Math.pow(rx*rx+ry*ry+rz*rz+.0025,1.5);bx+=(dy*rz-dz*ry)/r3;by+=(dz*rx)/r3;bz+=(-dy*rx)/r3}return[bx,by,bz]};
let loopCache={k:-1,lines:[]};
const loopLines=Rv=>{const key=Math.round(Rv*100);if(loopCache.k===key)return loopCache.lines;const lines=[];
  const seeds=[[.28,1],[.6,1],[.6,-1],[1.35,1],[1.35,-1],[1.9,1],[1.9,-1],[.45,0]];
  for(const [rr,sg] of seeds){const rho=rr*Rv;const q0=sg===0?[0,0,rho]:[0,sg*rho,0];let q=q0;const pts=[q0];const inner=rr<1;
    for(let i=0;i<150;i++){const B=loopB(q,Rv),m=Math.hypot(...B);if(m<1e-9)break;const h=.09+.04*Math.min(1,Math.hypot(...q)/2),nq=V.add(q,V.mul(B,h/m));if(Math.hypot(...nq)>4.4)break;if(!inner&&i>12&&q[0]>0&&nq[0]<=0){pts.push(q0);break}q=nq;pts.push(q)}
    if(inner){let qb=q0;const bk=[];for(let i=0;i<70;i++){const B=loopB(qb,Rv),m=Math.hypot(...B),h=.09+.04*Math.min(1,Math.hypot(...qb)/2),nq=V.sub(qb,V.mul(B,h/m));if(Math.hypot(...nq)>4.4)break;qb=nq;bk.push(qb)}pts.unshift(...bk.reverse())}
    lines.push(pts)}
  loopCache={k:key,lines};return lines};
R['c10-loop-axis-field']=(c,p,t)=>{const s=P3.scene(c,{scale:50,cx:240,yaw:-.2,pitch:.2,cy:268}),Rv=.5+p.Rl*.08,xs=p.x*.09,ya=Rv+.55,Rm=p.Rl/100,Bf=x=>4e-7*PI*p.N*p.I*Rm*Rm/(2*(Rm*Rm+(x/100)**2)**1.5);bench(s,8.4,3.6,[0,0]);
  s.box([0,.16,0],[6.9,.14,.34],'#d9b46a',{ground:false});for(let k=-30;k<=30;k+=5)s.seg([k*.09,.24,.14],[k*.09,.24,.14-(k%10===0?.12:.07)],'#2b2118',1,[],-2e5);for(let k=-30;k<=30;k+=10)s.engrave([k*.09,.235,-.02],String(k),'#2b2118',9,-2e5);
  const rn=clamp(Math.round(p.N/20)+1,1,5);for(let k=0;k<rn;k++){s.ring([(k-(rn-1)/2)*.07,ya,0],[1,0,0],Rv,CU,5);s.ring([(k-(rn-1)/2)*.07,ya,0],[1,0,0],Rv-.04,'#8a4a22',2)}
  s.box([0,.12,0],[.5,.2,1.0],'#3b4046',{});s.cyl([0,(ya-Rv)/2+.2,0],[0,1,0],.05,ya-Rv-.2,'#9aa1a8',{seg:6});
  const lines=loopLines(Rv);for(const pts of lines){const q=pts.map(a=>[a[0],a[1]+ya,a[2]]);for(let i=0;i<q.length-1;i+=8)s.path(q.slice(i,i+9),'#7baaffaa',1.4,[],4e5)}
  s.arrow([-1.9,ya,0],[-1.2,ya,0],'#bcd6ff',2,8);
  for(let i=0;i<8;i++){const a=TAU*i/8+t*2;s.ball([0,ya+Rv*Math.cos(a),Rv*Math.sin(a)],.055,'#ffd24d',{flat:true,glow:true})}
  s.cyl([xs,(ya+.23)/2,0],[0,1,0],.035,ya-.23,'#9aa1a8',{seg:6});s.box([xs,.28,0],[.22,.12,.3],'#2f3d48');s.box([xs,ya,0],[.1,.22,.22],'#e9f6ff',{stroke:'#2f3d48'});s.ball([xs,ya,0],.05,C.gold,{flat:true,glow:true});
  s.arrow([xs,ya+.35,0],[xs+clamp(Bf(p.x)/Bf(0),0,1)*1.2,ya+.35,0],C.gold,3,11,`B = ${f(Bf(p.x)*1e6,2)} µT`);lab(s,[xs,ya,0],'Hall probe',-10,-64);lab(s,[0,ya-Rv,0],`coil: N = ${p.N}, R = ${f(p.Rl,1)} cm`,-30,60,C.white);
  s.render();chart(c,450,96,206,150,{title:'B along axis',xl:'x (cm)',xmin:-30,xmax:30,ymin:0,series:[{fn:Bf,col:C.gold}],marker:[p.x,Bf(p.x)]})};


/* ---------- Bar magnet: iron filings and compass needles ---------- */
const MNp=[.9,.2,0],MSp=[-.9,.2,0];
const magFn=q=>{const a=V.sub(q,MNp),b=V.sub(q,MSp),ra=Math.max(.15,Math.hypot(...a)),rb=Math.max(.15,Math.hypot(...b));return V.sub(V.mul(a,1/ra**3),V.mul(b,1/rb**3))};
let magCache=null;
const magData=()=>{if(magCache)return magCache;const lines=[],fil=[];
  for(const sg of[-1,1])for(let i=0;i<5;i++){const a0=.55+i*.5,a=sg*a0;let q=V.add(MNp,[.22*Math.cos(a),0,.22*Math.sin(a)]);const pts=[q];
    for(let k=0;k<160;k++){const B=magFn(q),m=Math.hypot(...B);if(m<1e-9)break;q=V.add(q,V.mul([B[0],0,B[2]],.09/Math.max(1e-9,Math.hypot(B[0],B[2]))));if(Math.hypot(q[0]-MSp[0],q[2]-MSp[2])<.22||Math.hypot(q[0],q[2])>3.4)break;pts.push(q)}lines.push(pts)}
  for(let i=0;i<19;i++)for(let j=0;j<13;j++){const x=-3.4+i*.38+(hsh(i*13+j)-.5)*.2,z=-2.2+j*.37+(hsh(i+j*7)-.5)*.2;if(Math.abs(x)<1.1&&Math.abs(z)<.3)continue;const B=magFn([x,.2,z]),m=Math.hypot(B[0],B[2])||1;fil.push([x,z,B[0]/m,B[2]/m,Math.min(1,Math.hypot(...B)*1.2)])}
  magCache={lines,fil};return magCache};
R['c10-magnet']=(c,p,t)=>{const s=P3.scene(c,{scale:56,pitch:.3,yaw:.1,cy:272}),D=magData();bench(s,8.6,5.2,[7.8,4.6]);
  for(const [x,z,dx,dz,k] of D.fil)s.seg([x-dx*.06,.045,z-dz*.06],[x+dx*.06,.045,z+dz*.06],k>.25?'#2d3137':'#6b7077',1.4,[],-4e5);
  s.box([.45,.2,0],[.9,.34,.4],'#d62f3a');s.box([-.45,.2,0],[.9,.34,.4],'#2f6fd1');s.box([0,.2,0],[1.8,.35,.41],'#00000000',{stroke:'#e9eef2'});s.box([.88,.2,0],[.06,.36,.42],'#c9ced3');s.box([-.88,.2,0],[.06,.36,.42],'#c9ced3');
  s.engrave([.45,.378,0],'N','#ffffff',22);s.engrave([-.45,.378,0],'S','#ffffff',22);
  for(const pts of D.lines){const q=pts.map(a=>[a[0],.12,a[2]]);for(let i=0;i<q.length-1;i+=8)s.path(q.slice(i,i+9),'#ffc36bcc',1.6,[],3e5);const m=Math.floor(q.length*.5);if(q.length>m+2)s.arrow(q[m],q[m+1],'#ffd98a',2,7)}
  for(let i=0;i<7;i++){const a=TAU*i/7+.3,x=2.6*Math.cos(a),z=1.75*Math.sin(a),B=magFn([x,.2,z]),u=V.norm([B[0],0,B[2]]);s.cyl([x,.09,z],[0,1,0],.22,.1,'#b08d3a',{seg:14,cap:'#f4efe0'});s.tube([[x-u[0]*.17,.16,z-u[2]*.17],[x,.16,z]],.03,'#e9f3f8',{segs:5});s.tube([[x,.16,z],[x+u[0]*.17,.16,z+u[2]*.17]],.03,'#e63946',{segs:5})}
  s.render();tag(c,'iron filings and compasses (red end = north pole) show the field: lines leave N, enter S',44,98,C.muted,13)};

})();
(() => {
'use strict';
const R=window.PhysicaReal3D=window.PhysicaReal3D||{};
const {f,clamp,rad,deg,cycle,memo,tag,chart,PI,TAU,C}=window.PhysicaLab;
const P3=window.Physica3D,V=P3.vec,G=9.8;
const ST='#d4d9de',DS='#9aa1a8',BR='#c9a227',WD='#8a5a36',IR='#3b4148',CK='#b98a5c',CU='#b8673e',DK='#22262b',MOT='#2f5d8a',GLS='#cfe8f5';
const hex2=a=>Math.round(clamp(a,0,1)*255).toString(16).padStart(2,'0');

/* ---------- shared lab hardware ---------- */
const bench=(s,x,y,w,d,z=0)=>{s.box([x,y-.1,z],[w,.2,d],WD,{ground:true})};
// Retort stand: heavy cast-iron base, steel rod, boss head with thumb screw and a clamp arm reaching to x = ax.
const stand=(s,rx,y0,top,armY,ax,z=0)=>{const dir=Math.sign(ax-rx)||1;
  s.box([rx+dir*.38,y0+.08,z],[1.5,.16,1],IR);s.box([rx+dir*.38,y0+.17,z],[1.3,.03,.86],'#4a5159');
  s.cyl([rx,(y0+.18+top)/2,z],[0,1,0],.05,top-y0-.18,ST);s.ball([rx,top,z],.055,ST);
  s.box([rx,armY,z],[.2,.2,.2],'#646b72');s.cyl([rx,armY,z+.17],[0,0,1],.03,.14,DK);s.cyl([rx,armY,z+.26],[0,0,1],.07,.05,DK,{seg:10});
  if(ax!==rx)s.cyl([(rx+ax)/2+dir*.05,armY,z],[1,0,0],.04,Math.abs(ax-rx)-.1,ST)};
// Split cork gripped by a clamp at the arm's end; returns the point where the thread leaves it.
const cork=(s,[x,y,z])=>{s.box([x,y-.14,z],[.14,.26,.2],CK);s.seg([x,y-.01,z+.101],[x,y-.27,z+.101],'#4b3420',1.2);for(const dz of[-.13,.13])s.box([x,y-.05,z+dz],[.24,.16,.04],DS);s.cyl([x,y-.05,z+.2],[0,0,1],.025,.12,DK);return[x,y-.27,z]};
// Steel helical spring: dark wire with a bright highlight on top.
const coil=(s,a,b,n=14,r=.16)=>{s.spring(a,b,n,r,'#4e555c',3.6);s.spring(a,b,n,r,'#e3e7ea',1.5)};
// Mass hanger with n slotted masses; top = hook point. Returns the bottom y.
const hanger=(s,[x,y,z],n,r=.22)=>{s.ring([x,y-.06,z],[0,0,1],.06,DS,2);const H=.16+n*.1;s.cyl([x,y-.12-H/2,z],[0,1,0],.022,H,DS);const yb=y-.12-H;
  s.cyl([x,yb+.03,z],[0,1,0],r+.03,.06,'#868e96');for(let i=0;i<n;i++){const yy=yb+.11+i*.1;s.cyl([x,yy,z],[0,1,0],r,.09,i%2?'#a9b0b6':BR,{seg:20});s.box([x,yy,z+r-.05],[.06,.092,.1],'#1d2126')}return yb};
// Small electric motor with a shaft along +z.
const motor=(s,p,w=.55,h=.42,d=.38)=>{s.box(p,[w,h,d],MOT);for(let i=-2;i<=2;i++)s.box(V.add(p,[i*w*.18,0,0]),[.03,h+.03,d+.03],'#244a6e');s.cyl(V.add(p,[0,0,d/2+.06]),[0,0,1],.035,.12,ST)};
const pulley=(s,p,r=.15)=>{s.cyl(p,[0,0,1],r,.07,'#b8bec4',{cap:'#d9dde1'});s.cyl(p,[0,0,1],r*.35,.1,'#6c737a');s.ring(V.add(p,[0,0,.04]),[0,0,1],r*.75,'#7d858c',1)};
const mint=(s,p,txt,dx,dy)=>s.callout(p,txt,C.mint,dx,dy,11);
const rope=(s,fn,col='#d9844a',w=3,x0=-3.4,x1=3.4,z=0,n=120)=>s.curve(Array.from({length:n+1},(_,i)=>{const x=x0+(x1-x0)*i/n;return[x,fn(x),z]}),col,w,8);

/* ================= Oscillations ================= */
R['pendulum']=(c,p,t)=>{const s=P3.scene(c,{scale:40,cy:250,yaw:.3,pitch:-.1}),T=2*PI*Math.sqrt(p.length/G),a0=rad(p.amplitude),th=a0*Math.cos(TAU*t/T),L=.8+p.length*1.1,Y0=-2.2,py=2.2;
  bench(s,-.3,Y0,6.2,2);stand(s,-2.8,Y0,2.6,py,0);const piv=cork(s,[0,py,0]),bob=[L*Math.sin(th),piv[1]-L*Math.cos(th),0];
  // transparent protractor behind the thread
  const pr=.82,ctr=[0,piv[1],-.07],arc=Array.from({length:37},(_,i)=>{const a=-PI/2+PI*i/36;return V.add(ctr,[pr*Math.sin(a),-pr*Math.cos(a),0])});
  s.poly([ctr,...arc],'#e9eef1',{alpha:.5,stroke:'#cfd8dd',normal:[0,0,1]});for(let d=-90;d<=90;d+=10){const a=rad(d),r0=d%30===0?.6:.69;s.seg(V.add(ctr,[r0*Math.sin(a),-r0*Math.cos(a),.005]),V.add(ctr,[pr*Math.sin(a),-pr*Math.cos(a),.005]),'#1b2129',1)}
  for(const d of[-60,-30,30,60])s.engrave(V.add(ctr,[.5*Math.sin(rad(d)),-.5*Math.cos(rad(d)),.01]),String(Math.abs(d)),'#1b2129',8);
  s.seg(piv,V.add(piv,[0,-L-.15,0]),'#8ca6b9',1,[4,4]);
  s.path(Array.from({length:21},(_,i)=>{const a=-a0+2*a0*i/20;return[L*Math.sin(a),piv[1]-L*Math.cos(a),0]}),C.muted,1.2,[4,4]);
  const top=V.add(bob,[-.2*Math.sin(th),.2*Math.cos(th),0]);s.seg(piv,top,'#efe9dc',1.6);s.ball(V.add(bob,[-.22*Math.sin(th),.22*Math.cos(th),0]),.04,'#8f969d');
  s.ball(bob,.2,BR);s.shadow(bob,.2,Y0,.35);s.arrow(bob,[bob[0],bob[1]-.75,0],C.mint,2.5,11,'W = mg');
  mint(s,[-2.8,.3,0],'retort stand',-30,0);mint(s,[-2.8,py,0],'boss head',-30,-22);mint(s,[-2.3,Y0+.1,.5],'heavy iron base',-20,26);mint(s,[0,py-.12,.1],'split cork',46,-18);mint(s,[pr*.7,piv[1]-pr*.7,-.07],'protractor',70,-6);mint(s,V.add(bob,[.2,0,0]),'brass bob',50,22);
  s.render();tag(c,`T = 2π√(L/g) = ${f(T,2)} s   ·   θ = ${f(deg(th),0)}°`,44,98,C.gold,15)};

// Horizontal spring–mass oscillator on an air track.
const airTrack=(s,x1=3.4)=>{bench(s,0,-.32,8.4,2.4);s.box([(x1-3.45)/2,-.16,0],[x1+3.45,.3,.5],'#c3c9cf');s.box([(x1-3.45)/2,-.02,0],[x1+3.45,.02,.3],'#e1e5e8');
  for(let x=-2.8;x<x1;x+=.35)s.ball([x,-.008,.08],.018,'#5d646b',{flat:true});
  s.box([-3.4,.5,0],[.25,1.3,1],IR);s.box([-3.25,.32,0],[.06,.24,.24],DS);for(const dz of[-.3,.3])s.cyl([-3.26,.85,dz],[1,0,0],.05,.04,DK,{seg:8})};
const glider=(s,x,w,h,col=BR,lab)=>{s.box([x,h/2+.02,0],[w,h,.6],col);s.box([x,.04,0],[w+.04,.06,.66],'#7d858c');s.ring([x-w/2-.02,.3,0],[1,0,0],.05,DS,2);if(lab)s.engrave([x,h/2+.02,.31],lab,'#3a2c0a',9)};
R['spring-shm']=(c,p,t)=>{const s=P3.scene(c,{scale:58,cy:256,yaw:.35,pitch:-.02}),w=Math.sqrt(p.k/p.mass),x=p.amplitude*Math.cos(w*t)*2.4,bw=.6+p.mass*.06,bh=.6+p.mass*.04;airTrack(s);
  // metre scale along the front edge (0.1 m divisions)
  s.box([0,-.1,.31],[4.8,.16,.02],'#efe2b8');for(let i=-10;i<=10;i++){const X=i*.24;s.seg([X,-.02,.322],[X,i%5===0?-.12:-.07,.322],'#1b2129',1)}for(const i of[-10,-5,0,5,10])s.engrave([i*.24,-.14,.33],f(i/10,1),'#1b2129',7);
  coil(s,[-3.22,.32,0],[x-bw/2-.02,.32,0],14,.18);glider(s,x,bw,bh,BR,`${p.mass} kg`);
  s.seg([0,0,.7],[0,1.2,.7],C.muted,1,[4,4]);s.arrow([x,1.2,0],[x-x*.5,1.2,0],C.red,3,11,`F = −kx = ${f(-p.k*p.amplitude*Math.cos(w*t),1)} N`);
  mint(s,[-3.4,1.1,0],'rigid support',-10,-30);mint(s,[(x-3.3)/2,.5,0],`steel spring (k = ${p.k} N/m)`,0,-58);mint(s,[x+bw/2,bh*.8,.3],'mass m (glider)',70,-24);mint(s,[2.6,-.03,0],'air track',30,30);mint(s,[-1.6,-.1,.32],'scale (m)',-40,34);
  s.render();tag(c,`T = ${f(2*PI/w,2)} s`,44,98,C.gold,15)};

// Vertical damped oscillator: masses hang into a beaker of oil.
R['damped-oscillation']=(c,p,t)=>{const s=P3.scene(c,{scale:41,cx:225,cy:252,yaw:.2,pitch:-.05}),w0=Math.sqrt(p.k/p.mass),g=p.damping/(2*p.mass),wd=Math.sqrt(Math.max(0,w0*w0-g*g)),tt=cycle(t,20),x=Math.exp(-g*tt)*Math.cos(wd*tt),y=.2-x*.9,Y0=-1.95;
  bench(s,-.2,Y0,4.4,2);stand(s,-1.6,Y0,2.5,2.05,0);s.box([0,2.05,0],[.3,.12,.3],DS);s.ring([0,1.95,0],[0,0,1],.05,DS,2);
  const n=clamp(Math.round(p.mass*2),2,6);coil(s,[0,1.92,0],[0,y+.36,0],12,.17);const yb=hanger(s,[0,y+.36,0],n);s.cyl([0,yb-.6,0],[0,1,0],.018,1.1,DS);s.cyl([0,yb-1.15,0],[0,1,0],.4,.04,'#868e96');
  // glass beaker of oil
  s.cyl([0,Y0+.9,0],[0,1,0],.62,1.7,'#d8a930',{alpha:.3,caps:false});s.cyl([0,Y0+.03,0],[0,1,0],.62,.05,'#d8a930',{alpha:.4});s.ring([0,Y0+1.75,0],[0,1,0],.62,'#ffe08a',1.5);
  s.cyl([0,Y0+.95,0],[0,1,0],.66,1.9,GLS,{alpha:.12,caps:false});s.ring([0,Y0+1.9,0],[0,1,0],.66,'#e8f6ff',1.5);s.ring([0,Y0+.01,0],[0,1,0],.66,'#e8f6ff',1);
  for(let i=1;i<=5;i++)s.seg([.66*Math.sin(.5),Y0+.3*i,.66*Math.cos(.5)],[.66*Math.sin(.5)+.1,Y0+.3*i,.66*Math.cos(.5)-.06],'#e8f6ff',1);
  mint(s,[0,1.4,0],`spring k = ${p.k} N/m`,-70,-30);mint(s,[.22,y,.2],`m = ${p.mass} kg`,-90,-4);mint(s,[.35,yb-1.15,.2],'damping vane',-100,-6);mint(s,[.5,Y0+1.2,.3],'oil (damping)',-90,40);mint(s,[-1.6,Y0+.2,.5],'retort stand',-10,28);
  s.render();
  chart(c,420,96,236,150,{title:'x vs t',xl:'t (s)',xmin:0,xmax:20,ymin:-1.1,ymax:1.1,series:[{fn:T=>Math.exp(-g*T)*Math.cos(wd*T),col:C.gold},{fn:T=>Math.exp(-g*T),col:'#8ca6b9',dash:[3,3]}],marker:[tt,x]})};

// Forced oscillator: a motor-driven crank shakes the spring's support.
R['driven-resonance']=(c,p,t)=>{const s=P3.scene(c,{scale:39,cx:228,cy:256,yaw:.2,pitch:-.05}),m=1,k=(TAU*1)**2,w=TAU*p.frequency,A=p.force/Math.sqrt((k-m*w*w)**2+(p.damping*w)**2),ph=Math.atan2(p.damping*w,k-m*w*w),phi=w*t*.25,top=1.9+.12*Math.sin(phi),y=-.2-clamp(A*8,0,1.4)*Math.sin(phi-ph),Y0=-2.45;
  bench(s,-.2,Y0,4.4,2);stand(s,-1.7,Y0,2.95,2.55,-.3);motor(s,[0,2.55,-.22]);
  s.cyl([0,2.55,.02],[0,0,1],.2,.06,'#b8bec4',{cap:'#d9dde1'});const pin=[.12*Math.cos(phi),2.55+.12*Math.sin(phi),.08];s.cyl(pin,[0,0,1],.025,.08,DK);
  for(const gx of[-.42,.42])s.cyl([gx,2.0,-.05],[0,1,0],.025,.95,ST);s.box([0,top+.04,-.05],[1.0,.08,.32],DS);s.box([0,top+.04,.16],[.06,.06,.1],DS);
  s.seg(pin,[0,top+.08,.16],'#adb5bd',4);s.ring([0,top-.04,0],[0,0,1],.05,DS,2);
  coil(s,[0,top-.06,0],[0,y+.36,0],12,.17);hanger(s,[0,y+.36,0],4);
  mint(s,[.28,2.55,-.2],'motor',40,-12);mint(s,[.12,2.55,.08],'crank (driver)',60,14);mint(s,[.5,top,-.05],'driven support',62,26);mint(s,[.22,y-.1,.2],'mass m = 1 kg',56,20);mint(s,[-1.7,Y0+.2,.5],'retort stand',-20,24);
  s.render();
  chart(c,420,96,236,150,{title:'Amplitude vs drive frequency',xl:'Hz',xmin:.25,xmax:1.75,ymin:0,series:[{fn:fq=>{const W=TAU*fq;return p.force/Math.sqrt((k-W*W)**2+(p.damping*W)**2)},col:C.gold}],marker:[p.frequency,A]})};

// Scotch-yoke mechanism: uniform circular motion of a crank pin → SHM of a slider.
R['shm-phasors']=(c,p,t)=>{const s=P3.scene(c,{scale:46,cy:262,yaw:.42,pitch:-.12}),w=TAU/p.period,a=w*t,Rr=.5+p.amplitude*.7,ctr=[-1.5,0,0],tip=V.add(ctr,[Rr*Math.cos(a),Rr*Math.sin(a),.16]),y=tip[1];
  const yB=-2.25;bench(s,0,yB,6,2);s.box([ctr[0],(yB+0)/2,-.32],[.36,-yB,.2],IR);s.box([ctr[0],yB+.06,-.32],[.9,.12,.6],IR);s.box([1.5,yB+.06,-.25],[.7,.12,.5],IR);
  s.cyl([ctr[0],0,-.3],[0,0,1],.12,.15,DS);s.cyl([ctr[0],0,-.16],[0,0,1],Rr+.16,.08,'#aab1b8',{cap:'#c9ced3'});for(let i=0;i<6;i++){const q=a+i*PI/3;s.seg([ctr[0],0,-.11],[ctr[0]+(Rr+.08)*Math.cos(q),(Rr+.08)*Math.sin(q),-.11],'#5d646b',3)}
  s.ring([ctr[0],0,-.11],[0,0,1],Rr,'#42d9ca88',1.5);s.cyl([ctr[0],0,-.08],[0,0,1],.07,.08,DK);s.cyl(tip,[0,0,1],.055,.22,'#e9ecef');
  // slotted yoke and guided slider
  const xl=ctr[0]-Rr-.3,xr=1.5;s.box([(xl+xr)/2,y+.13,.14],[xr-xl,.1,.1],DS);s.box([(xl+xr)/2,y-.13,.14],[xr-xl,.1,.1],DS);s.box([xl,y,.14],[.1,.36,.1],DS);
  s.cyl([1.5,0,-.15],[0,1,0],.04,2*Rr+.9,ST);s.box([1.5,(yB+.12-Rr-.42)/2,-.25],[.12,-Rr-.42-yB-.12,.12],IR);for(const yy of[-Rr-.42,Rr+.42])s.box([1.5,yy,-.25],[.3,.1,.2],IR);s.box([1.5,y,0],[.5,.42,.4],BR);s.seg([1.5,-Rr-.3,.25],[1.5,Rr+.3,.25],C.muted,1.5);
  s.arrow([ctr[0],0,.2],tip,C.gold,3,11,`A = ${p.amplitude} m`);s.seg(tip,[1.25,y,.2],'#ffc36b55',1,[4,4]);
  s.arrow([2.1,y,0],[2.1,y+Rr*w*Math.cos(a)*.25,0],C.mint,3,11,`v = ${f(p.amplitude*w*Math.cos(a),2)} m/s`);s.arrow([2.9,y,0],[2.9,y-w*w*Rr*Math.sin(a)*.15,0],C.red,3,11,`a = ${f(-w*w*p.amplitude*Math.sin(a),2)} m/s²`);
  mint(s,[ctr[0]-Rr*.7,-Rr*.7,-.1],'crank disc (uniform rotation)',-30,40);mint(s,tip,'crank pin',-40,-40);mint(s,[xl+.3,y+.18,.14],'slotted yoke',-20,-46);mint(s,[1.5,y-.2,.2],'slider (SHM)',30,70);
  s.render();tag(c,'mint: velocity · red: acceleration (towards centre)',44,98,C.muted,13)};

R['shm-energy']=(c,p,t)=>{const s=P3.scene(c,{scale:50,cy:262,yaw:.35,pitch:-.02}),w=Math.sqrt(p.k/p.mass),x=p.amplitude*Math.cos(w*t),E=.5*p.k*p.amplitude**2,U=.5*p.k*x*x,K=E-U,X=-.5+x*3;airTrack(s,1.95);
  s.seg([-.5,0,.5],[-.5,1,.5],C.muted,1,[4,4]);coil(s,[-3.22,.32,0],[X-.32,.32,0],14,.18);glider(s,X,.6,.6,BR,`${p.mass} kg`);
  // three glass energy meters
  s.box([2.9,-.12,-.2],[1.6,.1,.7],IR);const bar=(xx,v,col,l)=>{const h=Math.max(.01,v/E*2.4);s.cyl([xx,1.2,-.2],[0,1,0],.2,2.5,GLS,{alpha:.12,caps:false});s.ring([xx,2.45,-.2],[0,1,0],.2,'#e8f6ff',1);s.cyl([xx,h/2-.04,-.2],[0,1,0],.16,h,col);s.label([xx,-.38,.2],l,col,12)};
  bar(2.4,K,'#ffc36b','KE');bar(2.9,U,'#7baaff','PE');bar(3.4,E,'#42d9ca','E');
  mint(s,[-3.4,1.1,0],'rigid support',-10,-30);mint(s,[(X-3.4)/2,.5,0],'spring stores PE',0,-56);mint(s,[X,.62,0],'moving mass carries KE',20,-70);
  s.render();tag(c,`E = ½kA² = ${f(E,3)} J  (constant)`,44,98,C.gold,15)};

R['coupled-pendulums']=(c,p,t)=>{const w1=Math.sqrt(G/p.L),w2=Math.sqrt(G/p.L+2*p.k/p.m),A=.25,th1=A*Math.cos((w2-w1)*t/2)*Math.cos((w1+w2)*t/2),th2=A*Math.sin((w2-w1)*t/2)*Math.sin((w1+w2)*t/2),Ls=1.4+p.L*.6,s=P3.scene(c,{scale:44,cx:232,cy:252,yaw:.2,pitch:-.05}),Y0=-2.1;
  bench(s,0,Y0,6.2,2);stand(s,-2.3,Y0,2.4,2,-2.3);stand(s,2.3,Y0,2.4,2,2.3);s.cyl([0,2,0],[1,0,0],.04,4.6,ST);
  const pv1=[-1,1.92,0],pv2=[1,1.92,0];for(const q of[pv1,pv2]){s.box(V.add(q,[0,.08,0]),[.12,.12,.12],'#646b72');}
  const b1=[-1+Ls*Math.sin(th1),1.85-Ls*Math.cos(th1),0],b2=[1+Ls*Math.sin(th2),1.85-Ls*Math.cos(th2),0];s.seg(pv1,b1,'#efe9dc',1.6);s.seg(pv2,b2,'#efe9dc',1.6);
  coil(s,V.add(b1,[.2,0,0]),V.add(b2,[-.2,0,0]),9,.07);s.ball(b1,.2,BR);s.ball(b2,.2,CU);s.shadow(b1,.2,Y0,.3);s.shadow(b2,.2,Y0,.3);
  mint(s,[0,2,0],'support rod',0,-30);mint(s,V.add(b1,[0,-.2,0]),`bob A (${p.m} kg)`,-40,50);mint(s,V.add(b2,[0,-.2,0]),'bob B',30,50);mint(s,[(b1[0]+b2[0])/2,(b1[1]+b2[1])/2+.05,0],`coupling spring k = ${p.k} N/m`,10,-60);
  s.render();
  const E1=Math.cos((w2-w1)*t/2)**2;chart(c,430,96,226,120,{title:'Energy share',xmin:0,xmax:1,ymin:0,ymax:1,series:[]});c.save();c.fillStyle='#ffc36b';c.fillRect(460,206-E1*80,60,E1*80);c.fillStyle='#ff857e';c.fillRect(560,206-(1-E1)*80,60,(1-E1)*80);c.restore()};

R['vertical-spring']=(c,p,t)=>{const w=Math.sqrt(p.k/p.m),x0=clamp(p.m*G/p.k,0,1.5),yn=.2,y0=yn-x0*1.2-p.A*4*Math.cos(w*t),s=P3.scene(c,{scale:39,cy:238,cx:270,yaw:.25,pitch:-.05}),Y0=-2.9,n=clamp(Math.round(p.m*2),1,7),y=Math.max(y0,Y0+.06+n*.1);
  bench(s,0,Y0,4.6,2);stand(s,-1.5,Y0,2.3,1.95,0);s.box([0,1.95,0],[.3,.12,.3],DS);s.ring([0,1.86,0],[0,0,1],.05,DS,2);
  coil(s,[0,1.82,0],[0,y+.3,0],14,.18);const yb=hanger(s,[0,y+.3,0],n,.24);s.seg([0,y+.12,0],[.9,y+.12,0],C.red,1.5);
  // vertical metre scale on its own foot
  s.box([1,Y0+.05,0],[.6,.1,.5],IR);s.box([1,(Y0+1.95)/2,-.05],[.16,1.95-Y0,.04],'#efe2b8');for(let i=0;i<=40;i++){const yy=1.85-i*.1;if(yy<Y0+.15)break;s.seg([.92,yy,-.025],[.92+(i%5===0?.1:.05),yy,-.025],'#1b2129',1)}
  s.seg([.9,yn-x0*1.2,0],[1.4,yn-x0*1.2,0],C.gold,2,[4,3]);s.label([1.5,yn-x0*1.2-.14,0],'equilibrium',C.gold,12,'left');s.seg([.9,yn,0],[1.4,yn,0],C.muted,1.5,[4,3]);s.label([1.5,yn+.14,0],'natural length',C.muted,12,'left');
  mint(s,[-.18,1.3,0],`spring k = ${p.k} N/m`,-80,-30);mint(s,[-.24,yb+.2,.1],`slotted masses (${p.m} kg)`,-70,24);mint(s,[1,Y0+.5,0],'metre scale',40,10);
  s.render();tag(c,`T = 2π√(m/k) = ${f(TAU/w,2)} s   ·   static stretch x₀ = mg/k = ${f(p.m*G/p.k*100,1)} cm`,44,98,C.gold,14)};

R['u-tube']=(c,p,t)=>{const w=Math.sqrt(2*G/p.L),y=p.x*Math.cos(w*t)*8,s=P3.scene(c,{scale:47,cy:262,yaw:.25,pitch:-.05}),h0=.6+p.L*.5,yb=-1.3,Y0=-2.2;
  bench(s,0,Y0,5,2);
  // scale board behind the tube
  {const zb=-.38,y1=yb-.75,y2=2.1;s.poly([[-1.5,y1,zb],[1.5,y1,zb],[1.5,y2,zb],[-1.5,y2,zb]],'#ece3c9',{normal:[0,0,1],z:-3.9e5,stroke:'#b8ad8e'})}s.box([0,Y0+.08,-.3],[3.4,.16,.7],IR);s.box([0,(Y0+.16+yb-.7)/2,-.42],[.3,yb-.7-Y0-.16,.08],'#6b4a2e');
  for(let i=0;i<=34;i++){const yy=yb+i*.1;s.seg([-.42,yy,-.375],[i%5===0?-.2:-.3,yy,-.375],'#1b2129',1,[],-3.8e5);s.seg([.42,yy,-.375],[i%5===0?.2:.3,yy,-.375],'#1b2129',1,[],-3.8e5)}
  for(const x of[-1,1])for(const yy of[1.4,-.3]){s.box([x,yy,-.3],[.62,.08,.1],DS);s.cyl([x,yy,-.24],[0,0,1],.025,.08,DK)}
  // U path
  const U=[],arc=n=>Array.from({length:n+1},(_,i)=>{const a=PI+PI*i/n;return[Math.cos(a),yb+Math.sin(a)*.6,0]});U.push([-1,1.8,0],[-1,yb,0],...arc(16).slice(1,-1),[1,yb,0],[1,1.8,0]);
  const hl=yb+h0+y,hr=yb+h0-y,liq=[[-1,hl,0],[-1,yb,0],...arc(16).slice(1,-1),[1,yb,0],[1,hr,0]];
  s.tube(liq,.2,'#2f7fd0',{segs:14});s.tube(U,.25,GLS,{segs:14,alpha:.16});
  for(const [x,hh] of[[-1,hl],[1,hr]]){s.poly(Array.from({length:16},(_,i)=>[x+.2*Math.cos(TAU*i/16),hh,.2*Math.sin(TAU*i/16)]),'#79b8f0',{normal:[0,1,0],alpha:.9});s.ring([x,hh,0],[0,1,0],.2,'#cfe9ff',1.5);s.ring([x,1.8,0],[0,1,0],.25,'#e8f6ff',1.2)}
  s.seg([-1.4,yb+h0,0],[1.4,yb+h0,0],C.gold,1.5,[4,4]);s.arrow([-1.45,yb+h0,0],[-1.45,hl,0],C.red,2.2,9,`y = ${f(p.x*Math.cos(w*t)*100,1)} cm`);
  mint(s,[1.22,.9,0],'glass U-tube',50,-30);mint(s,[.2,yb-.6,0],`liquid column L = ${p.L} m`,60,30);mint(s,[1,hr,0],'meniscus',60,-10);mint(s,[-.3,1.6,-.38],'mm scale board',-60,-30);
  s.render();tag(c,`T = 2π√(L/2g) = ${f(TAU/w,2)} s  ·  displacement ×8`,44,98,C.gold,15)};

/* ================= Waves ================= */
// Shive wave machine: steel rods on a torsion wire; each rod twists only, the pattern travels.
R['wave']=(c,p,t)=>{const s=P3.scene(c,{scale:50,cy:236,yaw:.15,pitch:.05}),k=TAU/p.wavelength,w=TAU*p.frequency,y=x=>p.amplitude*.35*Math.sin(k*(x+3.4)-w*t),Lr=.95,Y0=-1.9;
  bench(s,0,Y0,8,1.8);for(const X of[-3.7,3.7]){s.box([X,Y0+.06,0],[.5,.12,1.4],IR);s.box([X,(Y0+.12)/2,0],[.14,-Y0-.12,.14],'#5a6168');s.box([X,0,0],[.22,.22,.22],'#646b72')}
  s.cyl([0,0,0],[1,0,0],.025,7.4,'#7d858c');const front=[];
  for(let i=0;i<34;i++){const x=-3.3+i*.2,sn=clamp(y(x)/Lr,-1,1),cs=Math.sqrt(1-sn*sn),A=[x,Lr*sn,Lr*cs],B=[x,-Lr*sn,-Lr*cs],red=i===12;front.push(A);
    s.seg(B,A,red?'#ff6b6b':'#c3c9cf',red?3:2.2);s.ball(A,.055,red?C.red:'#868e96',{flat:!red});s.ball(B,.05,'#6c737a',{flat:true});s.cyl([x,0,0],[1,0,0],.04,.06,'#5a6168',{seg:8})}
  s.curve(front,'#42d9ca66',1.5,6);s.seg([-3.3,0,Lr+.05],[-3.3+p.wavelength,0,Lr+.05],C.gold,1,[3,3]);
  mint(s,[3.5,0,0],'torsion wire',30,-40);mint(s,[-3.7,-.8,0],'support pillar',-20,30);mint(s,front[25],'steel rods (particles)',40,-40);
  s.render();tag(c,'red: one particle — it only moves up and down',44,98,C.muted,13)};

// Melde's experiment: electric vibrator, string over a pulley, tension from a hanging weight.
R['standing-wave']=(c,p,t)=>{const s=P3.scene(c,{scale:46,cy:226,yaw:.25,pitch:-.05}),n=p.harmonic,L=6.4,fq=n*p.speed/(2*p.length),A=x=>.8*Math.sin(n*PI*(x+3.2)/L),y=x=>A(x)*Math.cos(TAU*fq*t*.3),Y0=-1.15;
  bench(s,-.4,Y0,8,1.8);s.box([-3.8,Y0+.55,0],[.6,1.1,.7],MOT);s.box([-3.8,Y0+1.12,0],[.5,.04,.6],'#244a6e');s.ring([-3.8,Y0+.7,.36],[0,0,1],.12,'#9fb4c2',2);s.cyl([-3.38,0,0],[1,0,0],.035,.38,ST);s.box([-3.48,0,0],[.06,.18,.18],DS);
  s.box([3.42,Y0-.15,0],[.12,.5,.5],DS);s.box([3.42,(Y0-.05)/2-.05,-.12],[.08,-Y0-.05,.08],DS);pulley(s,[3.4,-.17,0],.17);s.seg([3.57,-.17,0],[3.57,-1.4,0],'#d9844a',2);hanger(s,[3.57,-1.4,0],3);
  rope(s,y,'#d9844a',3,-3.2,3.2);rope(s,A,'#ffc36b44',1,-3.2,3.2);rope(s,x=>-A(x),'#ffc36b44',1,-3.2,3.2);s.seg([3.2,0,0],[3.4,0,0],'#d9844a',2.5);for(let i=0;i<=n;i++)s.ball([-3.2+L*i/n,0,0],.06,C.red,{flat:true});
  mint(s,[-3.8,Y0+1,.35],'electric vibrator',-10,-60);mint(s,[3.4,-.17,0],'pulley',30,-40);mint(s,[3.57,-1.9,0],'weights (tension)',-20,30);mint(s,[-1.6,y(-1.6),0],`string, L = ${p.length} m`,-20,-70);
  s.render();tag(c,`${n} loop${n>1?'s':''} · red: nodes · f = ${f(fq,2)} Hz`,44,98,C.gold,14)};

// Doppler: an ambulance siren on a road, wavefronts emitted from past positions.
const person=(s,x,z,t)=>{if(window.PhysicaBio?.critter)return window.PhysicaBio.critter(s,'human',[x,0,z],.6,t);s.cyl([x,.3,z],[0,1,0],.1,.6,'#3d6fb0');s.ball([x,.72,z],.11,'#e0b48a')};
const ambulance=(s,x,t)=>{s.box([x-.12,.4,0],[.78,.56,.52],'#f1f3f5');s.box([x+.4,.31,0],[.3,.38,.5],'#f1f3f5');s.box([x+.56,.4,0],[.02,.18,.42],'#2b3b4d');s.box([x+.41,.43,.255],[.2,.14,.01],'#2b3b4d');s.box([x+.41,.43,-.255],[.2,.14,.01],'#2b3b4d');
  s.box([x+.07,.3,0],[1.18,.07,.53],'#d62828');s.box([x-.1,.5,.262],[.08,.24,.01],'#d62828');s.box([x-.1,.5,.262],[.24,.08,.012],'#d62828');
  for(const dx of[-.33,.38])for(const dz of[-.24,.24]){s.cyl([x+dx,.12,dz],[0,0,1],.12,.07,'#1d2126',{seg:14});s.cyl([x+dx,.12,dz*1.15],[0,0,1],.05,.02,'#adb5bd',{seg:10})}
  const on=Math.floor(t*6)%2;s.box([x+.05,.71,-.1],[.12,.07,.14],on?'#ff3b3b':'#7a1f1f');s.box([x+.05,.71,.1],[.12,.07,.14],on?'#2b4a7a':'#3d8bff');s.cyl([x-.3,.72,0],[0,1,0],.06,.06,'#adb5bd')};
R['doppler']=(c,p,t)=>{const s=P3.scene(c,{scale:44,pitch:.42,yaw:.35,cy:250}),cs=340,vs=p.speed,f0=p.frequency,k=.9*f0/cs,T=t*.35,x=-2.4+cycle(T*vs*k,4.8);
  s.box([0,-.1,0],[8.4,.1,4.4],'#3f5f36',{ground:true});s.box([0,-.04,0],[8.4,.04,1.5],'#3a3f44',{ground:true});for(let X=-4;X<4.2;X+=.6)s.seg([X,-.015,0],[X+.3,-.015,0],'#e9ecef',2);for(const z of[-.75,.75])s.seg([-4.2,-.015,z],[4.2,-.015,z],'#d9c37a',1.5);
  for(let i=1;i<=7;i++){const dt=(i-cycle(T*f0,1))/f0,ex=x-vs*dt*k,r=cs*dt*k;if(r>0&&r<3.3)s.ring([ex,.55,0],[0,1,0],r,'#7fc8e8'+Math.round(220-i*25).toString(16).padStart(2,'0'),1.6)}
  ambulance(s,x,t);person(s,3.4,1.1,t);person(s,-3.6,1.1,t);
  mint(s,[3.4,1,1.1],`hears ${f(f0*cs/(cs-vs),1)} Hz`,10,-40);mint(s,[-3.6,1,1.1],`hears ${f(f0*cs/(cs+vs),1)} Hz`,10,-40);mint(s,[x+.05,.75,0],`siren f₀ = ${f0} Hz, v = ${vs} m/s`,0,-60);
  s.render();tag(c,'waves bunch up ahead of the moving source',44,98,C.muted,13)};

// Two tuning forks mounted on wooden resonance boxes.
const fork=(s,x,fq,amp,t,col)=>{const Y=-1.55;s.box([x,Y,0],[.6,.5,1.3],WD);s.box([x,Y,.655],[.44,.34,.01],'#1d140c');s.box([x,Y+.27,0],[.64,.04,1.34],'#6b4426');
  s.cyl([x,Y+.45,0],[0,1,0],.045,.36,ST);const d=.02*amp*Math.sin(TAU*fq*t*3);s.tube(Array.from({length:9},(_,i)=>{const a=PI+PI*i/8;return[x+.13*Math.cos(a),Y+.76+.13*Math.sin(a),0]}),.045,ST,{segs:8});
  for(const sg of[-1,1])s.tube([[x+sg*.13,Y+.76,0],[x+sg*(.13+d*.5),Y+1.3,0],[x+sg*(.13+d),Y+1.85,0]],.045,ST,{segs:8});s.ball([x,Y+.3,.66],.001,col)};
R['beats']=(c,p,t)=>{const s=P3.scene(c,{scale:52,cx:215,cy:248,yaw:.2,pitch:-.05});bench(s,0,-1.8,4.4,1.9);fork(s,-1,p.f1,p.amplitude,t,C.gold);fork(s,1,p.f2,p.amplitude,t,C.blue);
  const env=Math.abs(Math.cos(PI*Math.abs(p.f1-p.f2)*t));for(let i=1;i<=5;i++)s.ring([0,0,0],[0,0,1],((t*.8+i*.6)%3),'#e9f6ff'+Math.round(env*120+20).toString(16).padStart(2,'0'),1.5);
  s.cyl([.1,-1.67,.75],[1,0,0],.03,.7,WD);s.cyl([.5,-1.62,.75],[1,0,0],.08,.18,'#b03a2e');
  s.label([-1,.55,0],`f₁ = ${p.f1} Hz`,C.gold,12);s.label([1,.55,0],`f₂ = ${p.f2} Hz`,C.blue,12);mint(s,[1.13,-.3,0],'tuning fork',60,-10);mint(s,[1.3,-1.5,.6],'resonance box',50,14);mint(s,[.5,-1.62,.75],'rubber hammer',50,40);
  s.render();
  chart(c,420,96,236,150,{title:'Combined sound',xl:'t',xmin:0,xmax:4,ymin:-2.2*p.amplitude,ymax:2.2*p.amplitude,series:[{fn:x=>p.amplitude*(Math.sin(TAU*p.f1*x)+Math.sin(TAU*p.f2*x)),col:C.gold,w:1.4},{fn:x=>2*p.amplitude*Math.abs(Math.cos(PI*(p.f1-p.f2)*x)),col:'#8ca6b9',dash:[3,3]}]})};

// Three strings stretched between clamp posts on a wave board.
R['superposition']=(c,p,t)=>{const s=P3.scene(c,{scale:46,pitch:.12,yaw:.5,cy:244}),ph=rad(p.phase),en=x=>Math.min(1,(3.45-Math.abs(x))/.6),y1=x=>en(x)*p.a1*.35*Math.sin(TAU*x/2.4-t*2),y2=x=>en(x)*p.a2*.35*Math.sin(TAU*x/2.4-t*2+ph),Y0=-1.6;
  bench(s,0,Y0,8,3.2);for(const z of[-1.2,0,1.2])for(const X of[-3.55,3.55]){s.box([X,Y0+.05,z],[.36,.1,.36],IR);s.cyl([X,(Y0+.1)/2,z],[0,1,0],.045,-Y0-.1,ST);s.box([X,0,z],[.16,.16,.16],'#646b72');s.cyl([X,0,z+.12],[0,0,1],.025,.1,DK)}
  rope(s,y1,'#7baaff',2,-3.45,3.45,-1.2);rope(s,y2,'#ff857e',2,-3.45,3.45,0);rope(s,x=>y1(x)+y2(x),'#ffc36b',3,-3.45,3.45,1.2);
  s.label([-3.95,0,-1.2],'y₁',C.blue,13);s.label([-3.95,0,0],'y₂',C.red,13);s.label([-3.95,0,1.2],'sum',C.gold,13);mint(s,[3.55,-.6,1.2],'clamp post',30,30);mint(s,[1.5,Y0,1.6],'wave board',30,24);
  s.render();tag(c,`phase difference φ = ${p.phase}°  ·  y = y₁ + y₂`,44,98,C.gold,14)};

// Light rope knotted to a heavy rope: partial reflection at the knot.
R['pulse-reflection']=(c,p,t)=>{const s=P3.scene(c,{scale:52,pitch:.05,yaw:.2,cy:240}),r=(p.z1-p.z2)/(p.z1+p.z2),tr=2*p.z1/(p.z1+p.z2),T=4,tt=cycle(t,T),x0=-3.2+tt*1.6*1.0,g=(x,c0)=>Math.exp(-(((x-c0)/.25)**2)),y=x=>x<0?(tt<2?p.amplitude*.8*g(x,x0):r*p.amplitude*.8*g(x,-(tt-2)*1.6)):(tt>=2?tr*p.amplitude*.8*g(x,(tt-2)*1.6*Math.sqrt(p.z1/p.z2)):0),Y0=-1.2;
  bench(s,0,Y0,8,2);s.box([3.7,(Y0+.8)/2,0],[.3,.8-Y0,1],IR);s.ring([3.52,0,0],[0,1,0],.06,DS,2.5);
  s.cyl([-3.62,y(-3.4),0],[1,0,0],.09,.45,WD);s.cyl([-3.38,y(-3.4),0],[1,0,0],.1,.05,'#5a3c24');
  const L1=Array.from({length:61},(_,i)=>{const x=-3.4+3.4*i/60;return[x,y(x),0]}),L2=Array.from({length:61},(_,i)=>{const x=3.46*i/60;return[x,y(x),0]});
  s.curve(L1,'#7a4a24',3.4+p.z1*.4,8);s.curve(L1,'#d9844a',1.6+p.z1*.3,8);s.curve(L2,'#2f4f7a',3.4+p.z2*.4,8);s.curve(L2,'#7baaff',1.6+p.z2*.3,8);s.ball([0,y(0),0],.1,'#6b4a2e');
  mint(s,[-1.8,0,0],`light rope Z₁ = ${p.z1}`,-10,46);mint(s,[1.8,0,0],`heavy rope Z₂ = ${p.z2}`,10,46);mint(s,[0,y(0),0],'knot (boundary)',20,-60);mint(s,[-3.62,y(-3.4),0],'handle',-10,-40);mint(s,[3.7,.5,0],'fixed post',-10,-40);
  s.render();tag(c,`reflected amplitude ×${f(r,2)} · transmitted ×${f(tr,2)}`,44,98,C.gold,14)};

// Resonance tube: a glass pipe with brass rims (closed end: brass piston), driven by a small speaker.
R['organ-pipes']=(c,p,t)=>{const s=P3.scene(c,{scale:52,yaw:.25,pitch:-.05,cy:262}),Ls=5.6,x0=-Ls/2,k=p.type==='open'?p.n*PI/Ls:(2*p.n-1)*PI/(2*Ls),wt=Math.cos(t*4),v=331*Math.sqrt(1+p.T/273),fq=p.type==='open'?p.n*v/(2*p.L):(2*p.n-1)*v/(4*p.L),Y0=-1.2;
  bench(s,0,Y0,7.6,2);for(const X of[-1.8,1.8]){s.box([X,-.85,0],[.3,.5,.9],WD);s.box([X,-.6,0],[.32,.04,.5],'#2b2f33')}
  s.cyl([0,0,0],[1,0,0],.55,Ls,'#d9e8f0',{alpha:.16,caps:false});for(const X of[x0,-x0])s.cyl([X,0,0],[1,0,0],.58,.1,BR,{caps:false});
  if(p.type==='closed'){s.cyl([x0-.02,0,0],[1,0,0],.58,.1,BR,{cap:'#b08a3a'});s.cyl([x0-.35,0,0],[1,0,0],.05,.6,ST);s.ball([x0-.68,0,0],.08,DK)}
    s.box([-x0+.6,0,0],[.35,.9,.9],'#2b2f33');s.cyl([-x0+.41,0,0],[1,0,0],.33,.02,'#5a5f66');s.ball([-x0+.4,0,0],.1,'#3a3f44');
  for(let i=0;i<=40;i++){const x=x0+Ls*i/40,u=(p.type==='open'?Math.cos(k*(x-x0)):Math.sin(k*(x-x0)))*wt*.18;for(const [yy,z] of [[.3,0],[-.3,0],[0,.3],[0,-.3]])s.ball([x+u,yy,z],.035,'#7fc8e8',{flat:true})}
  const env=Array.from({length:81},(_,i)=>{const x=x0+Ls*i/80,a=p.type==='open'?Math.cos(k*(x-x0)):Math.sin(k*(x-x0));return[x,.85+.45*Math.abs(a),0]});s.path(env,C.gold,2);s.label([0,1.6,0],'displacement amplitude',C.gold,12);
  mint(s,[x0,-.5,0],p.type==='closed'?'closed end (piston): node':'open end: antinode',-10,50);mint(s,[-x0,.5,0],'open end: antinode',10,-40);mint(s,[-x0+.6,-.45,0],'speaker',20,40);mint(s,[-.6,-.5,.3],'air column (glass pipe)',0,56);
  s.render();tag(c,`${p.type==='open'?'Open':'Closed'} pipe · v = ${f(v,1)} m/s · f = ${f(fq,1)} Hz`,44,98,C.gold,14)};

// Rope fixed to a clamp, passing over a pulley to a hanging weight; one pulse travels along it.
R['string-wave-speed']=(c,p,t)=>{const v=Math.sqrt(p.T/(p.mu/1000)),s=P3.scene(c,{scale:54,cy:228,yaw:.2,pitch:-.05}),Ls=6.2,x0=-3.1,period=2,ph=cycle(t,period),pos=x0+Ls*ph,w=.25+p.mu*.01,Y0=-.75;
  bench(s,-.25,Y0,7.3,1.5);s.box([x0-.3,(Y0+.3)/2,0],[.3,.3-Y0,.6],IR);s.ring([x0-.13,0,0],[0,1,0],.05,DS,2.5);
  s.box([3.3,Y0-.05,0],[.14,.34,.4],DS);s.box([3.3,(Y0-.14)/2,-.1],[.08,-Y0-.14,.08],DS);pulley(s,[3.3,-.14,0],.14);
  const n=clamp(Math.round(p.T/100),1,5);s.seg([3.44,-.14,0],[3.44,-1.05,0],'#d9844a',2+p.mu*.06);hanger(s,[3.44,-1.05,0],n);
  const pts=Array.from({length:121},(_,i)=>{const x=x0+Ls*i/120,d=x-pos;return[x,.9*Math.exp(-d*d/(2*w*w))*(ph<.95?1:0),0]});pts.push([3.3,0,0]);s.curve(pts,'#d9844a',3+p.mu*.08,6);
  s.arrow([1.7,.35,0],[2.5,.35,0],C.red,2.5,10,`T = ${p.T} N`);
  mint(s,[x0-.3,.2,0],'clamp',-10,-40);mint(s,[3.3,-.14,0],'pulley',-40,40);mint(s,[-1.6,0,0],`rope μ = ${p.mu} g/m`,0,50);
  s.render();tag(c,`Pulse crosses in ${f(p.L/v*1000,1)} ms — shown slowed down`,44,98,C.gold,15)};

// Ripple tank: glass-bottomed tank on legs, motor-driven bar with two dippers.
R['ripple-tank']=(c,p,t)=>{const s=P3.scene(c,{scale:40,pitch:.38,cy:252}),k=TAU/p.lam,w=4,n=34,S1=[-p.d/2,0],S2=[p.d/2,0],h=(x,z)=>{const r1=Math.hypot(x-S1[0],z-S1[1])+.15,r2=Math.hypot(x-S2[0],z-S2[1])+.15;return p.amp*(Math.sin(k*r1-w*t)/Math.sqrt(r1)+Math.sin(k*r2-w*t)/Math.sqrt(r2))};
  for(const X of[-3.05,3.05])for(const Z of[-3.05,3.05])s.cyl([X,-.95,Z],[0,1,0],.06,1.5,DS);
  s.poly([[-3,-.18,3],[3,-.18,3],[3,-.18,-3],[-3,-.18,-3]],'#2a6f96',{normal:[0,1,0],z:-4e5});
  for(const [P0,sz] of[[[0,-.06,3.06],[6.24,.36,.12]],[[0,-.06,-3.06],[6.24,.36,.12]],[[3.06,-.06,0],[.12,.36,6]],[[-3.06,-.06,0],[.12,.36,6]]])s.box(P0,sz,WD);
  for(let j=0;j<=n;j++){const z=-3+6*j/n,row=[];for(let i=0;i<=n;i++){const x=-3+6*i/n;row.push([x,h(x,z),z])}s.path(row,'#7cc4ea',1.3)}for(let i=0;i<=n;i+=2){const x=-3+6*i/n,col=[];for(let j=0;j<=n;j++){const z=-3+6*j/n;col.push([x,h(x,z),z])}s.path(col,'#7cc4ea66',1)}
  const bob=.05*Math.sin(w*t);s.cyl([0,-.2,-3.5],[0,1,0],.05,2.6,ST);s.box([0,-1.5,-3.5],[1,.12,.6],IR);s.cyl([0,1.05,-1.75],[0,0,1],.035,3.5,ST);s.box([0,1.05,-3.5],[.18,.18,.18],'#646b72');
  const bw=p.d+.6;s.seg([0,1.05,0],[0,.75+bob,0],'#c08a5a',1.5);s.box([0,.7+bob,0],[bw,.08,.14],DS);motor(s,[0,.86+bob,0],.34,.22,.24);
  for(const S0 of [S1,S2]){s.cyl([S0[0],.4+bob,S0[1]],[0,1,0],.03,.56,ST);s.ball([S0[0],.08+bob,S0[1]],.09,'#e9ecef')}
  mint(s,[S2[0],.08,0],'dippers (coherent sources)',50,-30);mint(s,[.17,.86,0],'vibrator motor',40,-40);mint(s,[-3,-.06,3.06],'tank (glass base)',-30,30);mint(s,[1.5,h(1.5,1.5),1.5],'water surface',40,40);
  s.render();tag(c,`d / λ = ${f(p.d/p.lam,2)}  ·  calm (nodal) lines where path difference = (n + ½)λ`,44,98,C.gold,13)};
})();
