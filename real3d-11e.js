/* Detailed, realistic 3D apparatus for Class 11 physics (part e): oscillations and waves.
   Same parameters, physics and readouts as the earlier scenes; only the apparatus is new. */
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
