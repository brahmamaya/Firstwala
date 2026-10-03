/* 3D pack 3 — 23 Class 12 experiments (electrostatics to alternating current).
   SI calculations; scenes are scaled teaching models with labelled values. */
(() => {
'use strict';
const {R,S,N,f,clamp,rad,deg,cycle,memo,tag,chart,pack,PI,TAU,G,C}=window.PhysicaLab;
const P3=window.Physica3D,{add,done}=pack();
const V=P3.vec,k=8.9875517923e9,eps0=8.8541878128e-12,mu0=4e-7*PI,e=1.602176634e-19,me=9.1093837015e-31,amu=1.66053906660e-27;
const hash=i=>{const x=Math.sin(i*127.1+311.7)*43758.5453;return x-Math.floor(x)};
// Circuit-board helpers: wires lie on the board at y = 0.
const board=(s,w=6.4,d=3.6)=>s.box([0,-.12,0],[w,.16,d],'#16404a');
const wire=(s,pts,col='#d9844a')=>s.path(pts.map(([x,z])=>[x,.03,z]),col,4);
const flow=(s,pts,I,t,col=C.gold,n=10)=>{if(Math.abs(I)<1e-9)return;let L=0;const seg=[];for(let i=0;i<pts.length-1;i++){const l=Math.hypot(pts[i+1][0]-pts[i][0],pts[i+1][1]-pts[i][1]);seg.push(l);L+=l}
  for(let j=0;j<n;j++){let d=cycle(j*L/n+t*Math.sign(I)*Math.min(2.5,.3+Math.abs(I)*.6),L);for(let i=0;i<seg.length;i++){if(d<=seg[i]){const a=pts[i],b=pts[i+1],q=d/seg[i];s.ball([a[0]+(b[0]-a[0])*q,.09,a[1]+(b[1]-a[1])*q],.05,col,{flat:true});break}d-=seg[i]}}};
const resistor=(s,p,axis='x',lab='',col='#c9a36b')=>{s.cyl([p[0],.12,p[1]],axis==='x'?[1,0,0]:[0,0,1],.12,.8,col);for(let i=-1;i<=1;i++)s.cyl([p[0]+(axis==='x'?i*.2:0),.12,p[1]+(axis==='x'?0:i*.2)],axis==='x'?[1,0,0]:[0,0,1],.13,.05,['#7a3b1e','#222','#c7432f'][i+1]);if(lab)s.label([p[0],.55,p[1]],lab,C.white,12)};
const cell=(s,p,axis='x',lab='')=>{const ax=axis==='x'?[1,0,0]:[0,0,1];s.cyl([p[0],.18,p[1]],ax,.18,.8,'#2f3d48',{cap:'#c9d3da'});s.cyl(V.add([p[0],.18,p[1]],V.mul(ax,.45)),ax,.06,.1,'#c9d3da');if(lab)s.label([p[0],.6,p[1]],lab,C.gold,12)};

/* ---------- Electric Charges and Fields ---------- */
add({base:'electrostatic',id:'flux-cube',title:'Gauss’s law: charge and a cube',
 description:'Place a charge at the centre, a face, an edge or a corner of a cube and find the flux through it.',
 formula:'Φ = q_enclosed / ε₀',
 observe:'A charge on the surface is shared: only the fraction of field lines that enter the cube count.',
 tryText:'Move the charge from the centre to a corner. What fraction of q/ε₀ passes through the cube?',
 controls:[R('q','Charge q',-10,10,.5,4,'nC',1),S('pos','Charge position','centre',[['centre','Centre of cube'],['face','Centre of a face'],['edge','Middle of an edge'],['corner','A corner']])],
 metrics:p=>{const fr={centre:1,face:.5,edge:.25,corner:.125}[p.pos],phi=fr*p.q*1e-9/eps0;return[N('Fraction of q/ε₀',fr,'',3),N('Flux through cube',phi,'N m²/C',1),N('Flux per face (centre)',p.pos==='centre'?phi/6:'Depends on face')]},
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:62}),a=1.3,q=p.q,col=q>=0?C.red:C.blue,o={centre:[0,0,0],face:[0,0,a],edge:[a,0,a],corner:[a,a,a]}[p.pos];
  s.box([0,0,0],[2*a,2*a,2*a],'#7baaff',{alpha:.12});for(const [x,y,z] of [[1,1,0],[1,-1,0],[-1,1,0],[-1,-1,0]]){s.seg([x*a,y*a,-a],[x*a,y*a,a],'#7baaff88',1.2);s.seg([x*a,-a,y*a],[x*a,a,y*a],'#7baaff88',1.2);s.seg([-a,x*a,y*a],[a,x*a,y*a],'#7baaff88',1.2)}
  const n=26;for(let i=0;i<n;i++){const u=hash(i)*2-1,ph=TAU*hash(i+40),r=Math.sqrt(1-u*u),dir=[r*Math.cos(ph),u,r*Math.sin(ph)],end=V.add(o,V.mul(dir,2.4)),inside=Math.max(...V.add(o,V.mul(dir,.4)).map(Math.abs))<a-.001;const pul=.5+.5*Math.sin(t*3-i);
   q>=0?s.arrow(V.add(o,V.mul(dir,.25)),end,inside?col:'#8ca6b966',inside?2:1.2,7,i===0?'E':''):s.arrow(end,V.add(o,V.mul(dir,.25)),inside?col:'#8ca6b966',inside?2:1.2,7,i===0?'E':'')}
  s.ball(o,.16,col,{glow:true,label:(q>=0?'+':'')+q+' nC'});s.render();tag(c,'bright lines pass through the cube; faint ones miss it',44,98,C.muted,13)},
 assumption:'Point charge; the cube is an imaginary closed Gaussian surface. Field lines shown are a representative sample.'});

add({base:'electrostatic',id:'charged-sphere-field',title:'Field of a charged sphere',
 description:'Compare a conducting shell with a uniformly charged insulating sphere, inside and outside.',
 formula:'Outside: E = kQ/r² ;  inside conductor: 0 ;  inside insulator: kQr/R³',
 observe:'Outside, both look like a point charge at the centre; inside, the conductor shields completely.',
 tryText:'Move the probe inside the sphere and switch between the two types.',
 controls:[S('type','Sphere','conductor',[['conductor','Conducting shell'],['insulator','Uniformly charged insulator']]),R('Q','Charge Q',1,50,1,10,'nC'),R('Rs','Sphere radius R',2,20,.5,10,'cm',1),R('r','Probe distance r',0,40,.5,15,'cm',1)],
 metrics:p=>{const Q=p.Q*1e-9,R0=p.Rs/100,r=p.r/100,E=r>=R0?k*Q/(r*r||1e-9):p.type==='conductor'?0:k*Q*r/R0**3,Vp=r>=R0?k*Q/Math.max(r,1e-9):p.type==='conductor'?k*Q/R0:k*Q*(3*R0*R0-r*r)/(2*R0**3);return[N('Field at probe',E,'N/C',0),N('Potential at probe',Vp,'V',0),N('Probe is',r>=R0?'Outside':'Inside')]},
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:60,cx:230}),Rv=.3+p.Rs*.07,rp=p.r/p.Rs*Rv;s.ball([0,0,0],Rv,p.type==='conductor'?'#c9d3da':'#ff857e',{stroke:'#ffffff'});
  for(let i=0;i<14;i++){const u=hash(i)*2-1,ph=TAU*hash(i+30),r=Math.sqrt(1-u*u),d=[r*Math.cos(ph),u,r*Math.sin(ph)];s.arrow(V.mul(d,Rv+.1),V.mul(d,Rv+.9),'#ff857e',1.6,7,i===0?(()=>{const rr=p.r/100,R=p.Rs/100,E=rr>=R?8.99*p.Q/rr**2:p.type==='conductor'?0:8.99*p.Q*rr/R**3;return `E(probe) = ${f(Math.abs(E),2)} N/C`})():'')}
  s.ball([Math.min(rp,3.2),0,0],.08,C.gold,{lift:3,label:'probe'});s.render();const Q=p.Q*1e-9,R0=p.Rs/100,Ef=x=>{const r=x/100;return r>=R0?k*Q/(r*r):p.type==='conductor'?0:k*Q*r/R0**3};
  chart(c,420,96,236,170,{title:'E vs r',xl:'r (cm)',xmin:0,xmax:40,ymin:0,ymax:Ef(p.Rs)*1.15,series:[{fn:Ef,col:C.gold}],marker:[p.r,Ef(p.r)]})},
 assumption:'Isolated sphere in vacuum, charge Q; the conductor’s charge sits on its surface.'});

add({base:'electrostatic',id:'electron-deflection',title:'Electron beam between deflecting plates',
 description:'Accelerate electrons, then pass them between charged plates. The beam bends into a parabola and hits the screen.',
 formula:'y = V_d L² / (4 d V_a) ;  Y = (V_d L / 2dV_a)(L/2 + D)',
 observe:'Inside the plates the path is a parabola; after leaving, the electron travels in a straight line.',
 tryText:'Double the accelerating voltage. How does the spot move?',
 controls:[R('Va','Accelerating voltage',500,5000,50,2000,'V'),R('Vd','Deflecting voltage',0,200,1,60,'V'),R('L','Plate length',2,6,.1,4,'cm',1),R('d','Plate separation',.5,2,.05,1,'cm',2),R('D','Plates to screen',10,30,.5,20,'cm',1)],
 metrics:p=>{const v=Math.sqrt(2*e*p.Va/me),L=p.L/100,d=p.d/100,y=p.Vd*L*L/(4*d*p.Va),hit=y>d/2,Y=p.Vd*L/(2*d*p.Va)*(L/2+p.D/100);return[N('Electron speed',v/1e6,'× 10⁶ m/s',2),N('Exit deflection',y*1000,'mm',2),N('Spot on screen',hit?'Beam strikes the plate':`${f(Y*1000,1)} mm`)]},
 draw:(c,p,t)=>{const L=p.L/100,d=p.d/100,y=p.Vd*L*L/(4*d*p.Va),hit=y>d/2,Y=p.Vd*L/(2*d*p.Va)*(L/2+p.D/100),s=P3.scene(c,{scale:54,yaw:.35,cy:270}),x0=-3.2,Lp=.6+p.L*.25,gap=.25+p.d*.3,xs=x0+1.4,xS=xs+Lp+.8+p.D*.06,sc=gap/2/(d/2);
  s.cyl([0,0,0],[1,0,0],1.3,7.4,'#7fc8e8',{alpha:.08,caps:false});s.cyl([x0,0,0],[1,0,0],.2,.6,'#5d7b8f');s.box([xs+Lp/2,gap/2+.04,0],[Lp,.06,1],C.red);s.box([xs+Lp/2,-gap/2-.04,0],[Lp,.06,1],C.blue);s.label([xs+Lp/2,gap/2+.3,0],'+',C.red,15);
  s.box([Math.min(xS,3.4),0,0],[.05,2.4,2.4],'#2a6e4f',{alpha:.6});const pts=[[x0,0,0],[xs,0,0]],ym=y=>clamp(y*sc,-1.1,1.1);for(let i=1;i<=20;i++){const xx=L*i/20,yy=p.Vd*xx*xx/(4*d*p.Va);if(yy>d/2){pts.push([xs+Lp*i/20,gap/2,0]);break}pts.push([xs+Lp*i/20,ym(yy),0])}
  if(!hit)pts.push([Math.min(xS,3.4),clamp(Y*sc,-1.15,1.15),0]);s.path(pts,'#42ffc0',2.5);const ph=cycle(t*1.5,1),q=pts[Math.min(pts.length-1,Math.floor(ph*(pts.length-1)))];s.ball(q,.05,'#c8ffe6',{flat:true,glow:true});if(!hit)s.ball(pts[pts.length-1],.08,'#c8ffe6',{glow:true,flat:true});s.render();
  tag(c,'Vertical scale magnified',44,98,C.muted,13)},
 assumption:'Uniform field between plates, no edge effects; non-relativistic electrons; gravity negligible.'});

add({base:'electrostatic',id:'potential-landscape',title:'Electric potential landscape',
 description:'See the potential of two point charges as a 3D surface: hills for positive charge, wells for negative.',
 formula:'V = k q₁/r₁ + k q₂/r₂',
 observe:'A positive test charge rolls “downhill” on this surface — the electric field points down the steepest slope.',
 tryText:'Make the charges equal and opposite. Find where V = 0.',
 controls:[R('q1','Charge q₁',-5,5,.5,3,'μC',1),R('q2','Charge q₂',-5,5,.5,-3,'μC',1),R('d','Separation',.5,3,.1,2,'m',1)],
 metrics:p=>{const Vm=k*(p.q1+p.q2)*1e-6/(p.d/2),Em=k*Math.abs(p.q1-p.q2)*1e-6/(p.d/2)**2;let zero='None between the charges';if(p.q1*p.q2<0){const x=p.d*Math.abs(p.q1)/(Math.abs(p.q1)+Math.abs(p.q2));zero=`${f(x,2)} m from q₁`}return[N('Potential at midpoint',Vm/1000,'kV',1),N('Field at midpoint',Em/1000,'kN/C',1),N('V = 0 on the line',zero)]},
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:56,pitch:.42,cy:290}),A=[-p.d*.6,0],B=[p.d*.6,0],Vf=(x,z)=>{const r1=Math.hypot(x-A[0],z-A[1])+.18,r2=Math.hypot(x-B[0],z-B[1])+.18;return clamp(.35*(p.q1/r1+p.q2/r2),-2.2,2.2)},n=36;
  const col=v=>v>0?'#ff857e':'#7baaff';for(let j=0;j<=n;j++){const z=-3+6*j/n;let seg=[];for(let i=0;i<=n;i++){const x=-3.4+6.8*i/n,v=Vf(x,z);seg.push([x,v,z])}for(let i=0;i<n;i+=3)s.path(seg.slice(i,i+4),col((seg[i][1]+seg[Math.min(n,i+3)][1])/2)+'cc',1.2)}
  for(let i=0;i<=n;i+=3){const x=-3.4+6.8*i/n,col2=[];for(let j=0;j<=n;j++){const z=-3+6*j/n;col2.push([x,Vf(x,z),z])}s.path(col2,'#8ca6b944',1)}
  s.ball([A[0],Vf(A[0],A[1])+.15,A[1]],.12,col(p.q1),{label:'q₁'});s.ball([B[0],Vf(B[0],B[1])+.15,B[1]],.12,col(p.q2),{label:'q₂'});s.render();tag(c,'height ∝ potential (clipped near the charges)',44,98,C.muted,13)},
 assumption:'Point charges in vacuum; the surface is clipped close to each charge where V grows without limit.'});

/* ---------- Electrostatic Potential and Capacitance ---------- */
add({base:'capacitor',id:'spherical-capacitor',title:'Spherical capacitor',
 description:'Two concentric conducting spheres store charge. Change their radii and the dielectric between them.',
 formula:'C = 4πε₀κ ab / (b − a)',
 observe:'Bringing the spheres closer (b → a) raises the capacitance sharply.',
 tryText:'Make b very large. Compare with the isolated-sphere result 4πε₀a.',
 controls:[R('a','Inner radius a',1,20,.5,5,'cm',1),R('b','Outer radius b',2,40,.5,8,'cm',1),R('kap','Dielectric constant κ',1,10,.1,1,'',1),R('Vv','Voltage',10,1000,10,100,'V')],
 metrics:p=>{if(p.b<=p.a)return[N('Capacitance','Outer radius must exceed inner')];const a=p.a/100,b=p.b/100,Cp=4*PI*eps0*p.kap*a*b/(b-a);return[N('Capacitance',Cp*1e12,'pF',2),N('Charge',Cp*p.Vv*1e9,'nC',2),N('Energy stored',.5*Cp*p.Vv**2*1e6,'μJ',3),N('Isolated sphere (radius a)',4*PI*eps0*a*1e12,'pF',2)]},
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:60,cx:300}),b=Math.max(p.b,p.a+.5),sc=2.2/40,ra=.2+p.a*sc*1.7,rb=Math.min(2.6,.2+b*sc*1.7);s.ball([0,0,0],rb,'#7baaff',{alpha:.18,stroke:'#ffffff',lift:-10});if(p.kap>1)s.ball([0,0,0],rb*.98,'#b89dff',{alpha:.18,flat:true,lift:-9});s.ball([0,0,0],ra,'#ff857e');s.ring([0,0,0],[0,1,0],rb,'#7baaff',1.5);for(let i=0;i<12;i++){const u=hash(i)*2-1,ph=TAU*hash(i+20),r=Math.sqrt(1-u*u),d=[r*Math.cos(ph),u,r*Math.sin(ph)];s.arrow(V.mul(d,ra+.05),V.mul(d,rb-.05),C.gold,1.5,6,i===0?'E':'')}s.render();
  tag(c,'Cut-away view: field lines run from the inner sphere to the outer',44,98,C.muted,13)},
 assumption:'Ideal concentric spheres, inner at +Q, outer at −Q; uniform linear dielectric filling the gap.'});

add({base:'capacitor',id:'dielectric-slab',title:'Partially filled capacitor',
 description:'Slide a dielectric slab of thickness t between the plates and see the capacitance rise.',
 formula:'C = ε₀A / (d − t + t/κ)',
 observe:'The slab acts like a thinner air gap: each millimetre of dielectric counts as only 1/κ mm.',
 tryText:'Set t = d. Compare with κε₀A/d.',
 controls:[R('A','Plate area',50,500,10,200,'cm²'),R('d','Plate separation d',1,10,.1,4,'mm',1),R('t','Slab thickness t',0,10,.1,2,'mm',1),R('kap','Dielectric constant κ',1,10,.1,4,'',1)],
 metrics:p=>{const A=p.A*1e-4,d=p.d/1000,t=Math.min(p.t,p.d)/1000,C0=eps0*A/d,C1=eps0*A/(d-t+t/p.kap);return[N('Air capacitor C₀',C0*1e12,'pF',2),N('With slab',C1*1e12,'pF',2),N('C / C₀',C1/C0,'',3),N('Effective air gap',(d-t+t/p.kap)*1000,'mm',2)]},
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:60,cy:262}),gap=.3+p.d*.25,tt=Math.min(p.t,p.d)/p.d*gap,w=1.2+Math.sqrt(p.A)*.12;s.box([0,gap/2+.05,0],[w,.1,w],C.red);s.box([0,-gap/2-.05,0],[w,.1,w],C.blue);
  if(tt>0)s.box([0,-gap/2+tt/2,0],[w*.96,tt,w*.96],'#b89dff',{alpha:.7});for(let i=0;i<5;i++)for(let j=0;j<3;j++){const x=-w/2+.2+i*(w-.4)/4,z=-w/2+.3+j*(w-.6)/2;s.arrow([x,gap/2,z],[x,-gap/2,z],'#ffc36b88',1.2,6,i===4&&j===1?'E₀ (E₀/κ in slab)':'')}
  s.label([0,gap/2+.4,0],'+Q',C.red,14);s.label([0,-gap/2-.4,0],'−Q',C.blue,14);s.render();if(p.t>p.d)tag(c,'Slab limited to the plate gap',44,98,C.red,13)},
 assumption:'Parallel plates with negligible edge effects; slab parallel to the plates and covering their full area.'});

add({base:'capacitor',id:'charge-sharing',title:'Sharing charge between capacitors',
 description:'Connect two charged capacitors. Charge redistributes to a common voltage — and some energy is lost.',
 formula:'V = (C₁V₁ + C₂V₂)/(C₁ + C₂) ;  ΔU = C₁C₂(V₁ − V₂)² / 2(C₁ + C₂)',
 observe:'Charge is conserved but energy is not: the loss appears as heat and radiation in the connecting wires.',
 tryText:'Make V₁ = V₂. Is there any loss now?',
 controls:[R('C1','C₁',1,100,1,20,'μF'),R('V1','V₁',0,100,1,80,'V'),R('C2','C₂',1,100,1,40,'μF'),R('V2','V₂',0,100,1,20,'V')],
 metrics:p=>{const C1=p.C1*1e-6,C2=p.C2*1e-6,Vc=(C1*p.V1+C2*p.V2)/(C1+C2),U0=.5*C1*p.V1**2+.5*C2*p.V2**2,U1=.5*(C1+C2)*Vc*Vc;return[N('Common voltage',Vc,'V',2),N('Total charge',(C1*p.V1+C2*p.V2)*1e6,'μC',1),N('Energy before',U0*1000,'mJ',3),N('Energy lost',(U0-U1)*1000,'mJ',3)]},
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:60,cy:290,pitch:.45}),Vc=(p.C1*p.V1+p.C2*p.V2)/(p.C1+p.C2),ph=clamp((cycle(t,6)-1.5)/1.5,0,1),v1=p.V1+(Vc-p.V1)*ph,v2=p.V2+(Vc-p.V2)*ph;board(s);
  const cap=(x,Cv,v)=>{const h=.4+Cv*.012;s.cyl([x,h/2,0],[0,1,0],.45,h,'#2f6db0',{cap:'#c9d3da'});s.cyl([x,h/2,0],[0,1,0],.47,h*v/100,'#ffc36b',{alpha:.45,caps:false});s.label([x,h+.4,0],`${f(v,1)} V`,C.gold,14)};cap(-1.6,p.C1,v1);cap(1.6,p.C2,v2);
  const top=[[-1.6,-.7],[-1.6,-1.2],[1.6,-1.2],[1.6,-.7]],bot=[[-1.6,.7],[-1.6,1.2],[1.6,1.2],[1.6,.7]];wire(s,top);wire(s,bot);s.box([0,.1,-1.2],[.5,.12,.2],ph>0||cycle(t,6)>1.5?'#42d9ca':'#ff857e');if(ph>0&&ph<1)flow(s,top,p.V1>p.V2?1:-1,t*2);s.render();
  tag(c,cycle(t,6)<1.5?'Switch open':'Switch closed — charge flows until voltages match',44,98,C.mint,14)},
 assumption:'Ideal capacitors connected positive-to-positive; the energy loss is independent of wire resistance.'});

/* ---------- Current Electricity ---------- */
add({base:'circuit',id:'kirchhoff-loops',title:'Kirchhoff’s laws: two-loop circuit',
 description:'Two cells drive currents through three resistors. Solve the loops and watch each branch current.',
 formula:'E₁ = I₁R₁ + I₃R₃ ;  E₂ = I₂R₂ + I₃R₃ ;  I₃ = I₁ + I₂',
 observe:'At the junction the currents in equal the currents out; around each loop the EMFs equal the IR drops.',
 tryText:'Make E₂ much larger than E₁. Does I₁ reverse?',
 controls:[R('E1','E₁',1,12,.5,6,'V',1),R('E2','E₂',1,12,.5,5,'V',1),R('R1','R₁',1,20,.5,4,'Ω',1),R('R2','R₂',1,20,.5,6,'Ω',1),R('R3','R₃ (shared)',1,20,.5,8,'Ω',1)],
 metrics:p=>{const r=kirch(p);return[N('I₁ (left branch)',r.I1,'A',3),N('I₂ (right branch)',r.I2,'A',3),N('I₃ (middle)',r.I3,'A',3),N('Voltage across R₃',r.I3*p.R3,'V',2)]},
 draw:(c,p,t)=>{const r=kirch(p),s=P3.scene(c,{scale:56,pitch:.55,cy:280});board(s);const L=[[0,-1.3],[-2.6,-1.3],[-2.6,1.3],[0,1.3]],Rg=[[0,-1.3],[2.6,-1.3],[2.6,1.3],[0,1.3]],M=[[0,1.3],[0,-1.3]];wire(s,L);wire(s,Rg);wire(s,M);
  cell(s,[-2.6,0],'z','E₁');cell(s,[2.6,0],'z','E₂');resistor(s,[-1.3,-1.3],'x','R₁');resistor(s,[1.3,-1.3],'x','R₂');resistor(s,[0,0],'z','R₃');
  flow(s,[[-2.6,1.3],[-2.6,-1.3],[0,-1.3]],r.I1,t);flow(s,[[2.6,1.3],[2.6,-1.3],[0,-1.3]],r.I2,t);flow(s,M.slice().reverse(),r.I3,t,C.mint,6);s.render();tag(c,'dot speed ∝ current; mint = shared branch',44,98,C.muted,13)},
 assumption:'Ideal cells (no internal resistance), ideal wires; positive current directions are from each cell towards the shared branch.'});
function kirch(p){const a=p.R1+p.R3,b=p.R3,c2=p.R3,d=p.R2+p.R3,det=a*d-b*c2,I1=(p.E1*d-b*p.E2)/det,I2=(a*p.E2-c2*p.E1)/det;return{I1,I2,I3:I1+I2}}

add({base:'circuit',id:'potentiometer',title:'Potentiometer: comparing EMFs',
 description:'Slide the jockey along a 1 m wire until the galvanometer reads zero. The balancing length measures the cell’s EMF.',
 formula:'E = k l,  k = E₀R_w / [(R_w + R_h) L]',
 observe:'At balance no current flows through the cell, so its true EMF — not its terminal voltage — is measured.',
 tryText:'Increase the rheostat resistance. Does the balance point move further along?',
 controls:[R('E0','Driver cell E₀',2,6,.1,4,'V',1),R('Rh','Rheostat',0,20,.5,5,'Ω',1),R('E','Test cell EMF',.5,2,.01,1.5,'V',2),R('x','Jockey position',0,100,.5,50,'cm',1)],
 metrics:p=>{const kk=p.E0*10/(10+p.Rh)/100,l=p.E/kk,diff=p.E-kk*p.x;return[N('Potential gradient',kk*100,'V/m',3),N('Balancing length',l>100?'Beyond the wire — lower Rh':f(l,1)+' cm'),N('Galvanometer',Math.abs(diff)<.005?'Null — balanced!':diff>0?'Deflects right':'Deflects left')]},
 draw:(c,p,t)=>{const kk=p.E0*10/(10+p.Rh)/100,diff=p.E-kk*p.x,s=P3.scene(c,{scale:56,pitch:.55,cy:280});board(s,7,3.8);s.box([0,.02,-.5],[6,.04,.4],'#e9d8a6');for(let i=0;i<=10;i++)s.seg([-3+i*.6,.05,-.75],[-3+i*.6,.05,-.65],'#081624',1);
  s.seg([-3,.07,-.5],[3,.07,-.5],'#c9d3da',2);cell(s,[-1,-1.5],'x','E₀');resistor(s,[1.2,-1.5],'x','Rh');wire(s,[[-3,-.5],[-3,-1.5],[-1.4,-1.5]]);wire(s,[[-.6,-1.5],[.8,-1.5]]);wire(s,[[1.6,-1.5],[3,-1.5],[3,-.5]]);
  cell(s,[-1.6,1],'x','E');wire(s,[[-3,-.5],[-3,1],[-2,1]]);wire(s,[[-1.2,1],[0,1]]);const jx=-3+p.x*.06;s.cyl([.6,.15,1],[0,1,0],.35,.3,'#2f3d48',{cap:'#e9f6ff'});const nd=clamp(diff*3,-1.2,1.2);s.seg([.6,.32,1],[.6+.28*Math.sin(nd),.32,1-.28*Math.cos(nd)],C.red,2);wire(s,[[.95,1],[jx,.3],[jx,-.4]],'#8ca6b9');
  s.cyl([jx,.25,-.45],[0,1,0],.06,.4,C.gold);s.label([jx,.7,-.45],`${f(p.x,1)} cm`,C.gold,12);s.render();tag(c,Math.abs(diff)<.005?'Balanced — no current through the test cell':'Slide the jockey to find the null point',44,98,Math.abs(diff)<.005?C.mint:C.muted,14)},
 assumption:'Uniform 1 m wire of resistance 10 Ω; ideal driver cell; galvanometer deflection shown qualitatively.'});

add({base:'circuit',id:'resistance-temperature',title:'Resistance and temperature',
 description:'Heat a resistor and watch its resistance change. Metals rise; carbon falls.',
 formula:'R = R₀[1 + α(T − T₀)]',
 observe:'Metals have positive α because lattice vibrations scatter electrons more at higher temperature.',
 tryText:'Compare nichrome with copper: which makes a better standard resistor?',
 controls:[S('mat','Material','copper',[['copper','Copper (α = 3.9 × 10⁻³ /K)'],['tungsten','Tungsten (α = 4.5 × 10⁻³ /K)'],['nichrome','Nichrome (α = 0.4 × 10⁻³ /K)'],['carbon','Carbon (α = −0.5 × 10⁻³ /K)']]),R('R0','Resistance at 20 °C',1,100,1,10,'Ω'),R('T','Temperature',-50,600,5,100,'°C')],
 metrics:p=>{const a={copper:3.9e-3,tungsten:4.5e-3,nichrome:.4e-3,carbon:-.5e-3}[p.mat],Rv=p.R0*(1+a*(p.T-20));return[N('Resistance',Rv,'Ω',2),N('Change',(Rv/p.R0-1)*100,'%',1),N('Current at 6 V',6/Rv,'A',3)]},
 draw:(c,p,t)=>{const a={copper:3.9e-3,tungsten:4.5e-3,nichrome:.4e-3,carbon:-.5e-3}[p.mat],glow=clamp((p.T-200)/400,0,1),col={copper:'#d9844a',tungsten:'#9fb4c2',nichrome:'#b8b8b8',carbon:'#3a3a3a'}[p.mat],s=P3.scene(c,{scale:60,cx:220,cy:280});s.floor(2.6,.5,-1.6);
  s.box([0,-1.45,0],[2.6,.3,1],'#2f3d48');s.helix([0,-.2,0],[1,0,0],.35,2.2,10,glow>0?`#ff${Math.round(140-80*glow).toString(16).padStart(2,'0')}3c`:col,3);for(const x of [-1.2,1.2])s.cyl([x,-.85,0],[0,1,0],.05,1.3,C.steel);if(glow>0)s.ball([0,-.2,0],.5,'#ff9a3c',{glow:true,flat:true});s.render();
  chart(c,420,96,236,170,{title:'R vs T',xl:'T (°C)',xmin:-50,xmax:600,ymin:0,series:[{fn:T=>p.R0*(1+a*(T-20)),col:C.gold}],marker:[p.T,p.R0*(1+a*(p.T-20))]})},
 assumption:'Linear approximation with α measured near 20 °C; real tungsten deviates at very high temperature.'});

add({base:'circuit',id:'cells-combination',title:'Cells in series and parallel',
 description:'Combine n identical cells in series or in parallel and compare the current through a load.',
 formula:'Series: I = nE/(R + nr) ;  Parallel: I = E/(R + r/n)',
 observe:'Series helps when the load resistance is large; parallel helps when it is small compared with r.',
 tryText:'Set R much smaller than r. Which arrangement gives more current?',
 controls:[S('mode','Arrangement','series',[['series','Series'],['parallel','Parallel']]),R('n','Number of cells n',1,8,1,4),R('E','EMF of each cell',1,2,.1,1.5,'V',1),R('r','Internal resistance',.1,2,.1,.5,'Ω',1),R('Rl','Load resistance R',.5,20,.5,4,'Ω',1)],
 metrics:p=>{const Is=p.n*p.E/(p.Rl+p.n*p.r),Ip=p.E/(p.Rl+p.r/p.n),I=p.mode==='series'?Is:Ip;return[N('Load current',I,'A',3),N('Terminal voltage',I*p.Rl,'V',2),N('Power in load',I*I*p.Rl,'W',2),N('Other arrangement gives',(p.mode==='series'?Ip:Is),'A',3)]},
 draw:(c,p,t)=>{const Is=p.n*p.E/(p.Rl+p.n*p.r),Ip=p.E/(p.Rl+p.r/p.n),I=p.mode==='series'?Is:Ip,s=P3.scene(c,{scale:54,pitch:.5,cy:280});board(s,7,4);
  if(p.mode==='series'){for(let i=0;i<p.n;i++)cell(s,[-2.8+i*.8,-1.2],'x');wire(s,[[-3.2,-1.2],[-3.2,1.2],[3.2,1.2],[3.2,-1.2],[-2.8+(p.n-1)*.8+.4,-1.2]]);flow(s,[[3.2,-1.2],[3.2,1.2],[-3.2,1.2],[-3.2,-1.2]],I,t)}
  else{for(let i=0;i<p.n;i++){const z=-1.6+i*.42;cell(s,[-1.5,z],'x');wire(s,[[-2.2,z],[-1.9,z]]);wire(s,[[-1.1,z],[-.8,z]])}wire(s,[[-2.2,-1.6],[-2.2,1.6],[3.2,1.6],[3.2,-1.6],[-.8,-1.6],[-.8,-1.6+(p.n-1)*.42]]);wire(s,[[-2.2,-1.6],[-2.2,-1.6+(p.n-1)*.42]]);flow(s,[[3.2,-1.6],[3.2,1.6],[-2.2,1.6]],I,t)}
  resistor(s,[1,p.mode==='series'?1.2:1.6],'x','R');const glow=clamp(I*I*p.Rl/10,0,1);s.ball([2.4,.5,p.mode==='series'?1.2:1.6],.25,glow>.05?'#ffd27a':'#5d7b8f',{glow:glow>.05});s.render();tag(c,`I = ${f(I,3)} A`,44,98,C.gold,16)},
 assumption:'Identical cells; ideal connecting wires; the bulb brightness indicates load power qualitatively.'});

/* ---------- Moving Charges and Magnetism ---------- */
add({base:'lorentz',id:'moving-coil-galvanometer',title:'Moving-coil galvanometer',
 description:'Current in a coil within a radial magnetic field produces a torque balanced by a spring.',
 formula:'θ = NABI / k',
 observe:'The radial field keeps the torque proportional to current, so the scale is linear.',
 tryText:'Double the number of turns. How does the current sensitivity change?',
 controls:[R('I','Current I',0,100,1,30,'μA'),R('N','Turns N',10,500,10,200),R('A','Coil area',1,10,.5,4,'cm²',1),R('B','Magnetic field',.05,.5,.01,.2,'T',2),R('kk','Spring constant k',.1,5,.1,.6,'μN m/rad',1)],
 metrics:p=>{const th=p.N*p.A*1e-4*p.B*p.I*1e-6/(p.kk*1e-6);return[N('Deflection',deg(Math.min(th,PI/2)),'°',1),N('Current sensitivity',deg(p.N*p.A*1e-4*p.B/(p.kk*1e-6))*1e-6,'°/μA',3),N('Status',th>PI/2?'Off scale!':'On scale')]},
 draw:(c,p,t)=>{const th=Math.min(p.N*p.A*1e-4*p.B*p.I*1e-6/(p.kk*1e-6),PI/2),s=P3.scene(c,{scale:62,cy:280});s.floor(3,.5,-1.5);
  s.box([-1.4,0,0],[.7,1.6,1.2],C.red);s.box([1.4,0,0],[.7,1.6,1.2],C.blue);s.label([-1.4,1.05,0],'N',C.white,15);s.label([1.4,1.05,0],'S',C.white,15);s.cyl([0,0,0],[0,1,0],.45,1.4,'#5d7b8f');
  const a=th-PI/4,w=.62,cor=[[w,.7],[w,-.7],[-w,-.7],[-w,.7]].map(([u,y])=>[u*Math.cos(a),y,u*Math.sin(a)]);s.path([...cor,cor[0]],C.copper,4);for(let i=0;i<5;i++){const ang=PI*(.1+.8*i/4);s.arrow([-1.05,-.5+i*.25,0],[-.5,-.5+i*.25,0],'#ffc36b77',1.2,6,i===4?`B = ${p.B} T`:'')}
  s.seg([0,.7,0],[0,1.4,0],C.steel,2);const arc=[];for(let i=0;i<=12;i++){const q=-PI/4+PI/2*i/12;arc.push([1.2*Math.sin(q),1.4+1.2*Math.cos(q),0])}s.path(arc,C.muted,2);s.seg([0,1.4,0],[1.15*Math.sin(th-PI/4),1.4+1.15*Math.cos(th-PI/4),0],C.red,2.5);s.helix([0,1.05,0],[0,1,0],.08,.25,4,C.muted,1.5);s.render();
  tag(c,`θ = ${f(deg(th),1)}°`,44,98,C.gold,16)},
 assumption:'Uniform radial field of magnitude B over the coil; ideal torsion spring; coil inertia and damping ignored.'});

add({base:'lorentz',id:'meter-conversion',title:'Galvanometer to ammeter or voltmeter',
 description:'Add a small shunt for an ammeter or a large series resistance for a voltmeter.',
 formula:'Ammeter: S = I_gG / (I − I_g) ;  Voltmeter: R = V/I_g − G',
 observe:'An ammeter needs a very low resistance; a voltmeter needs a very high one.',
 tryText:'Convert to a 10 A ammeter, then to a 100 V voltmeter.',
 controls:[S('mode','Convert to','ammeter',[['ammeter','Ammeter (shunt)'],['voltmeter','Voltmeter (series R)']]),R('G','Galvanometer resistance G',10,200,5,50,'Ω'),R('Ig','Full-scale current I_g',1,10,.5,5,'mA',1),R('range','Desired range',1,100,1,10,'A or V')],
 metrics:p=>{const Ig=p.Ig/1000;if(p.mode==='ammeter'){if(p.range<=Ig)return[N('Shunt','Range must exceed I_g')];const Sh=Ig*p.G/(p.range-Ig);return[N('Shunt resistance',Sh*1000,'mΩ',2),N('Ammeter resistance',Sh*p.G/(Sh+p.G)*1000,'mΩ',2),N('Current through shunt',p.range-Ig,'A',3)]}const Rs=p.range/Ig-p.G;return[N('Series resistance',Rs/1000,'kΩ',2),N('Voltmeter resistance',(Rs+p.G)/1000,'kΩ',2),N('Ohms per volt',1/Ig,'Ω/V',0)]},
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:58,pitch:.55,cy:280});board(s);s.cyl([0,.25,-.3],[0,1,0],.7,.5,'#2f3d48',{cap:'#e9f6ff'});const nd=.55+.08*Math.sin(t*2);s.seg([0,.52,-.3],[.5*Math.sin(nd),.52,-.3-.5*Math.cos(nd)],C.red,2.5);s.label([0,.9,-.3],'G',C.white,15);
  wire(s,[[-3,-.3],[-.7,-.3]]);wire(s,[[.7,-.3],[3,-.3]]);if(p.mode==='ammeter'){wire(s,[[-1.5,-.3],[-1.5,1.2],[1.5,1.2],[1.5,-.3]]);resistor(s,[0,1.2],'x','shunt S','#c9d3da');flow(s,[[-3,-.3],[-1.5,-.3],[-1.5,1.2],[1.5,1.2],[1.5,-.3],[3,-.3]],2,t);flow(s,[[-1.5,-.3],[-.7,-.3]],.3,t,C.mint,3)}
  else{resistor(s,[-1.8,-.3],'x','series R','#c9a36b');flow(s,[[-3,-.3],[3,-.3]],.4,t,C.mint,8)}s.render();tag(c,p.mode==='ammeter'?'Most current bypasses G through the shunt':'Large series R limits current to I_g at full voltage',44,98,C.muted,13)},
 assumption:'Ideal resistors; the galvanometer reads full scale at I_g.'});

add({base:'lorentz',id:'mass-spectrometer',title:'Mass spectrometer',
 description:'Accelerate ions and bend them in a magnetic field. Heavier isotopes follow wider semicircles.',
 formula:'r = √(2mV/q) / B',
 observe:'Isotopes differ only slightly in mass, but their landing points separate measurably.',
 tryText:'Increase B. Do the isotopes land closer together or further apart?',
 controls:[S('iso','Element','ne',[['ne','Neon-20 / Neon-22'],['c','Carbon-12 / Carbon-14'],['cl','Chlorine-35 / Chlorine-37'],['u','Uranium-235 / Uranium-238']]),R('Vk','Accelerating voltage',1,20,.5,5,'kV',1),R('B','Magnetic field',.1,1,.01,.4,'T',2),R('z','Charge state',1,3,1,1,'e')],
 metrics:p=>{const m={ne:[20,22],c:[12,14],cl:[35,37],u:[235,238]}[p.iso],r=m.map(M=>Math.sqrt(2*M*amu*p.Vk*1e3/(p.z*e))/p.B);return[N('Radius (lighter)',r[0]*100,'cm',2),N('Radius (heavier)',r[1]*100,'cm',2),N('Separation on detector',2*(r[1]-r[0])*1000,'mm',1)]},
 draw:(c,p,t)=>{const m={ne:[20,22],c:[12,14],cl:[35,37],u:[235,238]}[p.iso],r=m.map(M=>Math.sqrt(2*M*amu*p.Vk*1e3/(p.z*e))/p.B),sc=2.6/Math.max(.05,Math.max(...r)),s=P3.scene(c,{scale:56,pitch:.6,cy:300});
  s.box([.5,-.1,-1.4],[6.2,.12,3.4],'#1d2f3a',{alpha:.8});for(let i=0;i<6;i++)for(let j=0;j<4;j++)s.ball([-2+i*.9,0,-2.8+j*.9],.05,'#7baaff',{flat:true});s.label([3.2,.3,-3],'B out of page',C.blue,12);
  s.box([-3.4,.15,.3],[.8,.4,.4],'#5d7b8f');s.label([-3.4,.6,.3],'ion source',C.muted,11);s.box([-2,.15,.3],[.1,.5,.5],'#c9d3da');
  r.forEach((rr,i)=>{const R0=rr*sc*(i===0?1:1),cx0=-2+R0,pts=[];for(let j=0;j<=40;j++){const a=PI*j/40;pts.push([cx0-R0*Math.cos(a),.15,.3-R0*Math.sin(a)])}s.curve(pts,i?C.gold:C.mint,2.5);const ph=cycle(t*.6+i*.3,1),q=pts[Math.floor(ph*40)];s.ball(q,.07,i?C.gold:C.mint,{flat:true,glow:true});s.ball([cx0+R0,.15,.3],.09,i?C.gold:C.mint,{flat:true})});
  s.box([.5,.1,.45],[5,.12,.2],'#e9f6ff');s.label([.5,.5,.6],'detector',C.white,12);s.render();tag(c,'Separation exaggerated where needed for visibility',44,98,C.muted,13)},
 assumption:'Ions start from rest; uniform field B; isotope masses taken as whole numbers of atomic mass units.'});

add({base:'lorentz',id:'loop-axis-field',title:'Magnetic field on the axis of a loop',
 description:'Pass current through a circular coil and move a probe along its axis.',
 formula:'B = μ₀NIR² / 2(R² + x²)^(3/2)',
 observe:'The field is strongest at the centre and falls off as 1/x³ far from the coil.',
 tryText:'Move the probe to x = R. What fraction of the centre field remains?',
 controls:[R('I','Current I',1,20,.5,5,'A',1),R('N','Turns N',1,100,1,20),R('Rl','Loop radius R',2,20,.5,8,'cm',1),R('x','Probe position x',-30,30,.5,6,'cm',1)],
 metrics:p=>{const Rm=p.Rl/100,x=p.x/100,B=mu0*p.N*p.I*Rm*Rm/(2*(Rm*Rm+x*x)**1.5),B0=mu0*p.N*p.I/(2*Rm);return[N('Field at probe',B*1e6,'μT',1),N('Field at centre',B0*1e6,'μT',1),N('B / B_centre',B/B0,'',3)]},
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:60,cx:240,yaw:.7}),Rv=.5+p.Rl*.08,xs=p.x*.09;s.ring([0,0,0],[1,0,0],Rv,C.copper,5);s.ring([.06,0,0],[1,0,0],Rv,C.copper,5);
  for(const sg of [-1,1])for(let i=1;i<=3;i++){const pts=[];for(let j=0;j<=40;j++){const a=PI*j/40,w=.35*i;pts.push([-(1+i*.6)*Math.cos(a)*1.4,sg*(Rv*.5+w*Math.sin(a)*1.6),0])}s.path(pts,'#7baaff66',1.3)}
  s.arrow([-2.8,0,0],[2.8,0,0],'#7baaff',2);const Rm=p.Rl/100,Bf=x=>mu0*p.N*p.I*Rm*Rm/(2*(Rm*Rm+(x/100)**2)**1.5);s.ball([xs,0,0],.08,C.gold,{label:'probe',lift:3});s.arrow([xs,0,0],[xs+clamp(Bf(p.x)/Bf(0),0,1)*1.2,0,0],C.gold,3,11,`B = ${f(Bf(p.x)*1e6,2)} µT`);
  for(let i=0;i<8;i++){const a=TAU*i/8+t*2;s.ball([0,Rv*Math.cos(a),Rv*Math.sin(a)],.05,C.gold,{flat:true})}s.render();
  chart(c,450,96,206,150,{title:'B along axis',xl:'x (cm)',xmin:-30,xmax:30,ymin:0,series:[{fn:Bf,col:C.gold}],marker:[p.x,Bf(p.x)]})},
 assumption:'Thin circular coil of N turns; field lines drawn schematically.'});

/* ---------- Magnetism and Matter ---------- */
add({base:'magnet',id:'magnet-oscillation',title:'Oscillating magnet in Earth’s field',
 description:'Suspend a bar magnet horizontally. Displace it and time its oscillations about the magnetic meridian.',
 formula:'T = 2π √(I / mB)',
 observe:'A stronger magnet or a stronger field gives faster oscillations.',
 tryText:'Quadruple the magnetic moment. What happens to the period?',
 controls:[R('m','Magnetic moment m',.5,5,.1,1.5,'A m²',1),R('I','Moment of inertia',1,20,.5,6,'× 10⁻⁵ kg m²',1),R('B','Horizontal field B_H',10,60,1,35,'μT'),R('a0','Initial angle',5,30,1,15,'°')],
 metrics:p=>{const T=TAU*Math.sqrt(p.I*1e-5/(p.m*p.B*1e-6));return[N('Period',T,'s',2),N('Oscillations per minute',60/T,'',1),N('Restoring torque at release',p.m*p.B*1e-6*Math.sin(rad(p.a0))*1e6,'μN m',2)]},
 draw:(c,p,t)=>{const T=TAU*Math.sqrt(p.I*1e-5/(p.m*p.B*1e-6)),a=rad(p.a0)*Math.cos(TAU*t/T),s=P3.scene(c,{scale:62,pitch:.45,cy:280});s.floor(3,.5,-1.2);s.box([0,2.2,0],[1.4,.1,.6],'#5d7b8f');s.seg([0,2.15,0],[0,.2,0],C.white,1.2);
  const d=[Math.cos(a),0,Math.sin(a)],L=1.2;s.box(V.mul(d,L/2),[L,.25,.3],C.red,{rotY:-a});s.box(V.mul(d,-L/2),[L,.25,.3],C.blue,{rotY:-a});s.label(V.add(V.mul(d,L+.25),[0,.2,0]),'N',C.red,14);
  s.arrow([-2.8,-1.15,-2],[2.8,-1.15,-2],'#7baaff',2);s.label([2.8,-.9,-2],'B_H (magnetic meridian)',C.blue,12);s.seg([-2.4,0,0],[2.4,0,0],'#7baaff55',1,[4,4]);s.render();tag(c,`T = ${f(T,2)} s`,44,98,C.gold,16)},
 assumption:'Small oscillations; torsion of the suspension fibre neglected; uniform horizontal field.'});

add({base:'magnet',id:'curie-law',title:'Paramagnetism and Curie’s law',
 description:'Cool a paramagnet and watch its atomic dipoles line up with the applied field more easily.',
 formula:'χ = C / T ;  M = χH',
 observe:'Thermal agitation fights alignment, so susceptibility rises as temperature falls.',
 tryText:'Halve the absolute temperature. What happens to the magnetisation?',
 controls:[R('T','Temperature',4,400,1,300,'K'),R('Cc','Curie constant C',.01,1,.01,.1,'K',2),R('H','Applied field H',1,100,1,50,'kA/m')],
 metrics:p=>{const chi=p.Cc/p.T;return[N('Susceptibility χ',chi,'',5),N('Magnetisation M',chi*p.H*1e3,'A/m',1),N('Relative permeability',1+chi,'',6)]},
 draw:(c,p,t)=>{const chi=p.Cc/p.T,align=clamp(Math.sqrt(chi*400),0,1),s=P3.scene(c,{scale:56});s.box([0,0,0],[4.2,2.6,2.6],'#b89dff',{alpha:.07});for(let i=0;i<4;i++)s.arrow([-3.2,-1+i*.65,-1.6],[3.2,-1+i*.65,-1.6],'#7baaff55',1.5,8,i===3?`H = ${p.H} kA/m`:'');
  for(let i=0;i<5;i++)for(let j=0;j<3;j++)for(let q=0;q<3;q++){const id=i*9+j*3+q,jit=1-align,ph=t*(1+p.T/100)*1.5+id,a=jit*(hash(id)*TAU+Math.sin(ph)*.6),b=jit*(hash(id+50)*PI-PI/2+Math.cos(ph)*.4),d=[Math.cos(a)*Math.cos(b),Math.sin(b),Math.sin(a)*Math.cos(b)],o=[-1.7+i*.85,-.9+j*.9,-.9+q*.9];s.arrow(V.sub(o,V.mul(d,.25)),V.add(o,V.mul(d,.25)),C.gold,2,6)}s.render();
  tag(c,`alignment shown: ${f(align*100,0)} % (illustrative)`,44,98,C.muted,13)},
 assumption:'Ideal paramagnet in the weak-field limit (Curie law); arrow alignment is a qualitative illustration.'});

/* ---------- Electromagnetic Induction ---------- */
add({base:'induction',id:'rotating-rod',title:'EMF of a rotating rod',
 description:'Spin a metal rod about one end in a uniform magnetic field. The free electrons are pushed outward.',
 formula:'ε = ½ B ω L²',
 observe:'Every part of the rod moves at a different speed; the average speed is ωL/2.',
 tryText:'Double the length. Does the EMF double or quadruple?',
 controls:[R('B','Magnetic field',.1,2,.05,.5,'T',2),R('L','Rod length',.2,2,.05,1,'m',2),R('rpm','Rotation rate',10,3000,10,600,'rpm')],
 metrics:p=>{const w=p.rpm*TAU/60;return[N('Angular speed',w,'rad/s',1),N('Tip speed',w*p.L,'m/s',1),N('Induced EMF',.5*p.B*w*p.L**2,'V',3)]},
 draw:(c,p,t)=>{const w=p.rpm*TAU/60,s=P3.scene(c,{scale:60,pitch:.55,cy:280}),Ls=1+p.L*1.1,a=t*Math.min(6,w*.05);s.ring([0,0,0],[0,1,0],Ls,C.copper,5);s.cyl([0,-.3,0],[0,1,0],.08,.6,C.steel);
  const tip=[Ls*Math.cos(a),0,Ls*Math.sin(a)];s.seg([0,0,0],tip,'#c9d3da',7);for(let i=-3;i<=3;i++)for(let j=-3;j<=3;j++)if(Math.hypot(i,j)<3.5)s.arrow([i*.7,-.8,j*.7],[i*.7,1,j*.7],'#7baaff33',1,6,i===3&&j===0?`B = ${p.B} T`:'');
  for(let i=1;i<=4;i++){const q=V.mul(tip,i/5);s.ball(V.add(q,V.mul(tip,.05*Math.sin(t*5+i))),.05,C.blue,{flat:true})}s.label(V.add(tip,[0,.35,0]),'−',C.blue,16);s.label([0,.4,0],'+',C.red,16);s.render();tag(c,'B points up (blue)',44,98,C.blue,13)},
 assumption:'Uniform field perpendicular to the plane of rotation; rod rotates about one end; visual rotation rate capped.'});

add({base:'induction',id:'solenoid-inductance',title:'Self-inductance of a solenoid',
 description:'Change the turns, size and core of a solenoid and find its inductance and stored energy.',
 formula:'L = μ₀μᵣN²A / l ;  U = ½LI²',
 observe:'Inductance grows with the square of the number of turns; an iron core multiplies it greatly.',
 tryText:'Double the turns, then insert the iron core.',
 controls:[R('N','Turns N',50,2000,50,500),R('l','Length l',5,50,1,20,'cm'),R('r','Radius r',.5,5,.1,2,'cm',1),R('mur','Core μᵣ',1,1000,1,1),R('I','Current I',.1,5,.1,1,'A',1)],
 metrics:p=>{const A=PI*(p.r/100)**2,L=mu0*p.mur*p.N**2*A/(p.l/100);return[N('Inductance',L*1000,'mH',3),N('Stored energy',.5*L*p.I**2*1000,'mJ',3),N('Field inside',mu0*p.mur*p.N*p.I/(p.l/100)*1000,'mT',2)]},
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:56,yaw:.45}),len=1.5+p.l*.07,rr=.35+p.r*.14;if(p.mur>1)s.cyl([0,0,0],[1,0,0],rr*.8,len+.6,'#6b7b88');s.helix([0,0,0],[1,0,0],rr,len,clamp(p.N/40,6,30),C.copper,2.5);
  for(let i=-1;i<=1;i++)s.arrow([-len/2-.4,i*rr*.4,0],[len/2+.6,i*rr*.4,0],'#7baaff'+(p.mur>1?'cc':'66'),1.6,8,i===1?`B = ${f(4e-7*PI*p.mur*p.N*p.I/(p.l/100)*1000,2)} mT`:'');for(let i=0;i<6;i++){const a=TAU*i/6+t*2;s.ball([-len/2+cycle(t*.4+i*.17,1)*len,rr*Math.cos(a),rr*Math.sin(a)],.04,C.gold,{flat:true})}s.render()},
 assumption:'Long solenoid (l ≫ r), uniform field inside, linear core of constant μᵣ.'});

add({base:'induction',id:'flux-angle',title:'Magnetic flux through a tilted coil',
 description:'Tilt a coil in a uniform magnetic field and see the flux follow cos θ.',
 formula:'Φ = NBA cos θ',
 observe:'Flux is greatest when the field is perpendicular to the coil’s plane (θ = 0) and zero when it lies in the plane.',
 tryText:'Spin the coil and watch the induced EMF peak when the flux is zero.',
 controls:[R('B','Magnetic field',.1,1,.05,.4,'T',2),R('A','Coil area',10,400,10,100,'cm²'),R('N','Turns',1,200,1,50),R('th','Tilt angle θ',0,180,1,30,'°'),S('spin','Coil','fixed',[['fixed','Held at angle θ'],['spin','Rotating at 1 rev/s']])],
 metrics:(p,t)=>{const th=p.spin==='spin'?TAU*t:rad(p.th),A=p.A*1e-4,Phi=p.N*p.B*A*Math.cos(th);return[N('Flux linkage NΦ',Phi*1000,'mWb',2),N('θ now',deg(th)%360,'°',0),N('EMF if rotating at 1 rev/s',p.spin==='spin'?p.N*p.B*A*TAU*Math.sin(th):'—','V',3)]},
 draw:(c,p,t)=>{const th=p.spin==='spin'?TAU*t*.25:rad(p.th),s=P3.scene(c,{scale:60,cx:240}),w=.5+Math.sqrt(p.A)*.07,n=[Math.sin(th),Math.cos(th),0];
  for(let i=-2;i<=2;i++)for(let j=-2;j<=2;j++)s.arrow([i*.6,-1.8,j*.6],[i*.6,1.8,j*.6],'#7baaff55',1.2,7,i===2&&j===-2?`B = ${p.B} T`:'');const u=[Math.cos(th),-Math.sin(th),0],v=[0,0,1],cor=[[1,1],[1,-1],[-1,-1],[-1,1]].map(([a,b])=>V.add(V.mul(u,a*w),V.mul(v,b*w)));
  s.poly(cor,'#ffc36b',{alpha:.25,cull:false,stroke:C.copper,lw:4});s.arrow([0,0,0],V.mul(n,1.2),C.mint,3,11,`n̂ (θ = ${f(deg(th)%360,0)}°)`);s.render();const A=p.A*1e-4;
  chart(c,440,96,216,150,{title:'Flux vs θ',xl:'θ (°)',xmin:0,xmax:360,ymin:-p.N*p.B*A*1000*1.1,ymax:p.N*p.B*A*1000*1.1,series:[{fn:x=>p.N*p.B*A*Math.cos(rad(x))*1000,col:C.gold}],marker:[deg(th)%360,p.N*p.B*A*Math.cos(th)*1000]})},
 assumption:'Uniform field; flat coil; rotation (if chosen) is about an axis perpendicular to B.'});

/* ---------- Alternating Current ---------- */
add({base:'ac',id:'lr-phasor',title:'LR circuit: phasors and phase lag',
 description:'Drive a resistor and inductor with AC. The current lags the voltage by the phase angle φ.',
 formula:'Z = √(R² + X_L²),  X_L = 2πfL,  tan φ = X_L / R',
 observe:'At higher frequency the inductor’s reactance grows, the current falls and lags further.',
 tryText:'Raise the frequency until φ reaches 45°. What is X_L then?',
 controls:[R('Vr','Supply voltage (rms)',1,240,1,12,'V'),R('f','Frequency',10,1000,5,50,'Hz'),R('L','Inductance',1,500,1,100,'mH'),R('Rr','Resistance',1,200,1,20,'Ω')],
 metrics:p=>{const XL=TAU*p.f*p.L/1000,Z=Math.hypot(p.Rr,XL);return[N('Inductive reactance',XL,'Ω',2),N('Impedance',Z,'Ω',2),N('Current (rms)',p.Vr/Z,'A',3),N('Phase lag φ',deg(Math.atan2(XL,p.Rr)),'°',1)]},
 draw:(c,p,t)=>{const XL=TAU*p.f*p.L/1000,Z=Math.hypot(p.Rr,XL),phi=Math.atan2(XL,p.Rr),w=t*1.6,s=P3.scene(c,{scale:62,cx:220,pitch:.15,yaw:.2});s.cyl([0,0,-.05],[0,0,1],1.9,.06,'#143144',{alpha:.7});s.ring([0,0,0],[0,0,1],1.6,'#29475b',1);
  const Vv=[1.6*Math.cos(w),1.6*Math.sin(w),.05],Iv=[1.2*Math.cos(w-phi),1.2*Math.sin(w-phi),.05];s.arrow([0,0,.05],Vv,C.gold,3.5,11,`V = ${p.Vr} V`);s.arrow([0,0,.05],Iv,C.mint,3.5,11,`I = ${f(p.Vr/Z,3)} A, lags ${f(deg(phi),1)}°`);s.render();
  chart(c,400,96,256,170,{title:'v(t) and i(t)',xl:'t',xmin:0,xmax:2*TAU,ymin:-1.1,ymax:1.1,series:[{fn:x=>Math.sin(x),col:C.gold},{fn:x=>.75*Math.sin(x-phi),col:C.mint}],marker:[cycle(w,2*TAU),Math.sin(cycle(w,2*TAU))]})},
 assumption:'Ideal inductor and resistor in series with a sinusoidal supply; phasors rotate at a slowed visual rate.'});

add({base:'ac',id:'rc-filter',title:'RC low-pass filter',
 description:'Feed a sine wave into a resistor–capacitor filter and see which frequencies get through.',
 formula:'V_out / V_in = 1 / √(1 + (2πfRC)²),  f_c = 1 / 2πRC',
 observe:'Low frequencies pass almost unchanged; above f_c the output falls by half for each doubling of frequency.',
 tryText:'Set f = f_c. What is the gain, and the phase shift?',
 controls:[R('Rk','Resistance',.1,100,.1,10,'kΩ',1),R('Cu','Capacitance',.01,10,.01,.1,'μF',2),R('lf','Input frequency (log₁₀ Hz)',1,5,.05,2.2,'',2)],
 metrics:p=>{const fq=10**p.lf,RC=p.Rk*1e3*p.Cu*1e-6,x=TAU*fq*RC,g=1/Math.sqrt(1+x*x);return[N('Input frequency',fq,'Hz',1),N('Cut-off frequency',1/(TAU*RC),'Hz',1),N('Gain',g,'',3),N('Gain (dB)',20*Math.log10(g),'dB',1),N('Phase shift',-deg(Math.atan(x)),'°',1)]},
 draw:(c,p,t)=>{const fq=10**p.lf,RC=p.Rk*1e3*p.Cu*1e-6,x=TAU*fq*RC,g=1/Math.sqrt(1+x*x),ph=Math.atan(x),s=P3.scene(c,{scale:54,pitch:.5,cx:250,cy:300});board(s,6,3);resistor(s,[-.5,-.8],'x','R');wire(s,[[-2.8,-.8],[-.9,-.8]]);wire(s,[[-.1,-.8],[2.8,-.8]]);
  s.cyl([1,.25,-.1],[0,1,0],.25,.5,'#2f6db0',{cap:'#c9d3da'});wire(s,[[1,-.8],[1,-.35]]);wire(s,[[1,.15],[1,.8]]);wire(s,[[-2.8,.8],[2.8,.8]]);s.label([1,.8,-.1],'C',C.white,12);s.label([-2.8,.4,-.8],'in',C.gold,13);s.label([2.8,.4,-.8],'out',C.mint,13);s.render();
  const lf=Math.log10(1/(TAU*RC));chart(c,410,92,246,140,{title:'Gain vs log f',xl:'log₁₀ f',xmin:1,xmax:5,ymin:0,ymax:1.05,series:[{fn:L=>1/Math.sqrt(1+(TAU*10**L*RC)**2),col:C.mint},{pts:[[lf,0],[lf,1.05]],col:'#ff857e',dash:[3,3]}],marker:[p.lf,g]});
  chart(c,410,240,246,90,{title:'in (gold) · out (mint)',xmin:0,xmax:2*TAU,ymin:-1.1,ymax:1.1,series:[{fn:q=>Math.sin(q+t*2),col:C.gold},{fn:q=>g*Math.sin(q+t*2-ph),col:C.mint}]})},
 assumption:'Ideal components, no load on the output; red dashed line marks the cut-off frequency.'});

add({base:'ac',id:'rms-waveforms',title:'RMS and average values of waveforms',
 description:'Compare sine, square and triangle waves of the same peak. The rms value sets the heating effect.',
 formula:'Sine: V₀/√2 ;  Square: V₀ ;  Triangle: V₀/√3',
 observe:'A DC supply equal to the rms value heats a resistor exactly as much as the AC does.',
 tryText:'Switch waveforms at the same peak. Which lamp is brightest?',
 controls:[S('wave','Waveform','sine',[['sine','Sine'],['square','Square'],['triangle','Triangle']]),R('V0','Peak voltage V₀',1,325,1,325,'V'),R('Rl','Lamp resistance',100,1000,10,500,'Ω')],
 metrics:p=>{const k={sine:[1/Math.SQRT2,2/PI],square:[1,1],triangle:[1/Math.sqrt(3),.5]}[p.wave],rms=p.V0*k[0],avg=p.V0*k[1];return[N('RMS value',rms,'V',1),N('Half-cycle average',avg,'V',1),N('Form factor rms/avg',rms/avg,'',3),N('Lamp power',rms*rms/p.Rl,'W',1)]},
 draw:(c,p,t)=>{const k={sine:[1/Math.SQRT2],square:[1],triangle:[1/Math.sqrt(3)]}[p.wave],P=(p.V0*k[0])**2/p.Rl,s=P3.scene(c,{scale:58,cy:300,cx:240});s.floor(3,.5,-1.4);
  for(const [x,lab] of [[-1.3,'AC'],[1.3,'DC = Vrms']]){s.cyl([x,-1.2,0],[0,1,0],.18,.4,'#9fb4c2');s.ball([x,-.55,0],.45,'#ffe7a3',{alpha:.6,glow:true});s.ball([x,-.55,0],.1+clamp(P/200,0,.25),'#fff2c6',{glow:true,flat:true});s.label([x,.2,0],lab,C.white,13)}s.render();
  const wf={sine:q=>Math.sin(q),square:q=>Math.sin(q)>=0?1:-1,triangle:q=>2/PI*Math.asin(Math.sin(q))}[p.wave];chart(c,410,96,246,170,{title:'Waveform with rms level',xl:'t',xmin:0,xmax:2*TAU,ymin:-1.1,ymax:1.1,series:[{fn:wf,col:C.gold},{fn:()=>k[0],col:C.mint,dash:[5,4]},{fn:()=>-k[0],col:C.mint,dash:[5,4]}]})},
 assumption:'Resistive lamp with constant resistance; ideal waveforms.'});

done();
})();
