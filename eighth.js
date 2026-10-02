/* 3D pack 2 — 28 Class 11 experiments (gravitation to waves).
   SI calculations; scenes are scaled teaching models with labelled values. */
(() => {
'use strict';
const {R,S,N,f,clamp,rad,deg,cycle,memo,tag,chart,pack,PI,TAU,G,C}=window.PhysicaLab;
const P3=window.Physica3D,{add,done}=pack();
const V=P3.vec,kB=1.380649e-23,NA=6.02214076e23,Rgas=8.314;
const hash=i=>{const x=Math.sin(i*127.1+311.7)*43758.5453;return x-Math.floor(x)};

/* ---------- Gravitation ---------- */
add({base:'gravity',id:'binary-stars',title:'Binary stars and the barycentre',
 description:'Two stars orbit their common centre of mass. Change their masses and separation.',
 formula:'T² = a³ / (M₁ + M₂)  (years, AU, solar masses)',
 observe:'Both stars share the same period; the heavier star moves on the smaller circle, slower.',
 tryText:'Make the stars equal. Then make one ten times heavier.',
 controls:[R('m1','Mass of star 1',.2,10,.1,2,'M☉',1),R('m2','Mass of star 2',.2,10,.1,1,'M☉',1),R('a','Separation a',.5,10,.1,2,'AU',1)],
 metrics:p=>{const M=p.m1+p.m2,T=Math.sqrt(p.a**3/M),r1=p.a*p.m2/M,r2=p.a*p.m1/M;return[N('Orbital period',T,'yr',3),N('Star 1 orbit radius',r1,'AU',3),N('Star 2 orbit radius',r2,'AU',3),N('Speeds (km/s)',`${f(TAU*r1/T*4.74,1)} / ${f(TAU*r2/T*4.74,1)}`)]},
 draw:(c,p,t)=>{const M=p.m1+p.m2,T=Math.sqrt(p.a**3/M),k=3.2/Math.max(p.a,1),r1=p.a*p.m2/M*k,r2=p.a*p.m1/M*k,ph=TAU*t/(2+T*.6),s=P3.scene(c,{scale:56,pitch:.35});
  for(let i=0;i<60;i++)s.ball([(hash(i)-.5)*12,(hash(i+70)-.5)*6,-4-hash(i+9)*3],.015,'#ffffff',{flat:true});
  s.ring([0,0,0],[0,1,0],r1,'#ffc36b55',1.2,[4,4]);s.ring([0,0,0],[0,1,0],r2,'#7baaff55',1.2,[4,4]);const A=[r1*Math.cos(ph),0,r1*Math.sin(ph)],B=[-r2*Math.cos(ph),0,-r2*Math.sin(ph)];
  s.ball(A,.12+.08*Math.cbrt(p.m1),'#ffc36b',{glow:true});s.ball(B,.12+.08*Math.cbrt(p.m2),'#7baaff',{glow:true});s.seg(A,B,'#ffffff22',1);s.ball([0,0,0],.05,C.red,{flat:true});s.label([0,-.35,0],'barycentre',C.red,12);s.render()},
 assumption:'Circular orbits, point masses; 1 AU/yr = 4.74 km/s. Animation period is compressed.'});

add({base:'gravity',id:'earth-tunnel',title:'Falling through a tunnel in the Earth',
 description:'Drop a ball into a straight frictionless tunnel through a uniform planet. It oscillates in SHM.',
 formula:'T = 2π √(R/g) = 2π √(3 / 4πGρ)',
 observe:'Every straight tunnel — through the centre or not — gives the same period, about 84 minutes for Earth.',
 tryText:'Move the tunnel away from the centre. Does the period change? Does the top speed?',
 controls:[R('d','Tunnel offset from centre',0,.9,.05,0,'× R',2),R('rho','Planet density',.3,2,.05,1,'× Earth',2)],
 metrics:p=>{const rho=5514*p.rho,w=Math.sqrt(4/3*PI*6.674e-11*rho),Rp=6.371e6,A=Rp*Math.sqrt(1-p.d*p.d);return[N('Period',TAU/w/60,'min',1),N('One-way trip',PI/w/60,'min',1),N('Top speed',w*A/1000,'km/s',2),N('Tunnel length',2*A/1000,'km',0)]},
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:62,pitch:.25}),Rs=2,A=Rs*Math.sqrt(1-p.d*p.d),y0=-p.d*Rs,x=A*Math.cos(t*1.2);s.ball([0,0,0],Rs,'#2f6db0',{flat:true});
  s.cyl([0,y0,0],[1,0,0],.09,2*A,'#ffc36b',{alpha:.55});s.ball([x,y0,0],.12,C.red,{lift:5});s.seg([0,0,0],[0,y0,0],C.muted,1,[3,3]);s.ball([0,0,0],.05,C.white,{flat:true,lift:5});
  s.arrow([x,y0+.35,0],[x-x*.35,y0+.35,0],C.mint,2.5);s.render();tag(c,'mint: restoring force ∝ distance from tunnel centre',44,98,C.muted,13)},
 assumption:'Uniform-density, non-rotating planet; frictionless, evacuated tunnel. Only gravity along the tunnel acts.'});

/* ---------- Mechanical Properties of Solids ---------- */
add({base:'hooke',id:'poisson-ratio',title:'Poisson’s ratio: stretch and thin',
 description:'Stretch a wire and watch it get thinner. The lateral strain is a fixed fraction of the longitudinal strain.',
 formula:'σ = −(Δd/d) / (ΔL/L),  ΔV/V = ε(1 − 2σ)',
 observe:'With σ = 0.5 the volume is unchanged (like rubber); most metals have σ ≈ 0.3.',
 tryText:'Set σ = 0.5. What happens to the volume change?',
 controls:[R('F','Tension F',0,2000,10,800,'N'),R('d','Wire diameter',.5,3,.1,1,'mm',1),R('Y','Young’s modulus',50,210,5,200,'GPa'),R('sg','Poisson’s ratio σ',0,.5,.01,.3,'',2)],
 metrics:p=>{const A=PI*(p.d/2000)**2,e=p.F/(A*p.Y*1e9);return[N('Longitudinal strain',e,'',5),N('Lateral strain',-p.sg*e,'',5),N('Diameter change',-p.sg*e*p.d*1000,'μm',3),N('Volume strain',e*(1-2*p.sg),'',5)]},
 draw:(c,p,t)=>{const A=PI*(p.d/2000)**2,e=p.F/(A*p.Y*1e9),k=clamp(e*80,0,1.2),s=P3.scene(c,{scale:60,cy:240}),L=2.6*(1+k*.5),r=.25*(1-p.sg*k*.5);s.floor(3,.5,-1.8);
  s.box([0,2,0],[1.4,.15,.8],'#5d7b8f');s.cyl([0,2-L/2-.08,0],[0,1,0],r,L,'#c4ccd2');s.cyl([0,2-.08-2.6/2,.0],[0,1,0],.25,2.6,'#ffffff',{alpha:.12,caps:false});s.box([0,2-L-.3,0],[.8,.45,.8],'#d9844a');s.arrow([0,2-L-.55,0],[0,2-L-.55-p.F/2000,0],C.gold,3);s.render();
  tag(c,'Deformation exaggerated; ghost shows the unstretched wire',44,98,C.muted,13)},
 assumption:'Linear elastic, isotropic wire; small strains. Visual strain is magnified about 400×.'});

add({base:'hooke',id:'elastic-energy',title:'Elastic energy stored in a wire',
 description:'Load a wire and calculate the strain energy stored per unit volume.',
 formula:'U = ½ F ΔL = ½ × stress × strain × volume',
 observe:'Doubling the load doubles the extension, so the stored energy rises four times.',
 tryText:'Double the force and compare the energy stored.',
 controls:[R('F','Load F',0,1500,10,600,'N'),R('L','Wire length',.5,4,.1,2,'m',1),R('d','Diameter',.5,3,.1,1,'mm',1),R('Y','Young’s modulus',50,210,5,200,'GPa')],
 metrics:p=>{const A=PI*(p.d/2000)**2,st=p.F/A,e=st/(p.Y*1e9),dL=e*p.L;return[N('Extension ΔL',dL*1000,'mm',3),N('Stress',st/1e6,'MPa',1),N('Energy density',.5*st*e,'J/m³',0),N('Energy stored',.5*p.F*dL,'J',4)]},
 draw:(c,p,t)=>{const A=PI*(p.d/2000)**2,e=p.F/(A*p.Y*1e9),Ls=1.2+p.L*.6,ext=clamp(e*p.L*60,0,1),s=P3.scene(c,{scale:56,cy:240,cx:250});s.floor(3,.5,-1.9);
  s.box([0,2,0],[1.2,.15,.8],'#5d7b8f');s.cyl([0,2-(Ls+ext)/2,0],[0,1,0],.04+p.d*.02,Ls+ext,'#c4ccd2');const y=2-Ls-ext-.2;s.cyl([0,y,0],[0,1,0],.35,.4,'#5d7b8f');for(let i=0;i<3;i++)s.cyl([0,y-.3-i*.13,0],[0,1,0],.32,.12,'#9fb4c2');s.render();
  chart(c,420,96,236,150,{title:'F–ΔL: area = energy',xl:'ΔL',xmin:0,xmax:1,ymin:0,ymax:1,series:[{fn:x=>x,col:C.gold},{pts:[[p.F/1500,0],[p.F/1500,p.F/1500]],col:C.mint,dash:[3,3]}],marker:[p.F/1500,p.F/1500]})},
 assumption:'Within the elastic limit (Hooke’s law); mass of the wire neglected; extension magnified for display.'});

add({base:'hooke',id:'thermal-stress',title:'Thermal stress in a clamped rod',
 description:'Heat a rod held between rigid walls. It cannot expand, so a large compressive stress builds up.',
 formula:'stress = Y α ΔT ;  F = Y A α ΔT',
 observe:'The stress does not depend on the rod’s length — only on the material and the temperature rise.',
 tryText:'Compare steel with aluminium for the same temperature rise.',
 controls:[S('mat','Material','steel',[['steel','Steel'],['copper','Copper'],['aluminium','Aluminium']]),R('dT','Temperature rise ΔT',0,100,1,40,'K'),R('A','Cross-section area',1,10,.5,4,'cm²',1)],
 metrics:p=>{const m={steel:[200e9,12e-6],copper:[117e9,17e-6],aluminium:[70e9,23e-6]}[p.mat],st=m[0]*m[1]*p.dT;return[N('Thermal stress',st/1e6,'MPa',1),N('Force on walls',st*p.A*1e-4/1000,'kN',1),N('Free expansion per metre',m[1]*p.dT*1000,'mm',3)]},
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:58,cy:290}),heat=p.dT/100,col={steel:'#9fb4c2',copper:'#d9844a',aluminium:'#c9d3da'}[p.mat];s.floor(3.5,.5,-1.2);
  for(const x of [-2.6,2.6])s.box([x,0,0],[.4,2.4,1.6],'#5d7b8f');const r=.15+Math.sqrt(p.A)*.06;s.cyl([0,0,0],[1,0,0],r,4.8,col);s.cyl([0,0,0],[1,0,0],r*1.04,4.8*heat,'#ff5a3c',{alpha:.35*heat+.05,caps:false});
  for(let i=0;i<6;i++){const x=-1.8+i*.72;s.ball([x,-.9,0],.1+.06*Math.sin(t*6+i),'#ff9a3c',{glow:true,flat:true})}s.arrow([-1.9,.9,0],[-2.3-heat*.3,.9,0],C.red,3);s.arrow([1.9,.9,0],[2.3+heat*.3,.9,0],C.red,3);s.label([0,1.1,0],'rod pushes on the walls',C.red,13);s.render()},
 assumption:'Perfectly rigid walls; uniform temperature; linear elasticity with Y and α constant over the range.'});

/* ---------- Mechanical Properties of Fluids ---------- */
add({base:'buoyancy',id:'venturimeter',title:'Venturimeter',
 description:'Water speeds up through a narrow throat and its pressure drops — read the drop on the vertical tubes.',
 formula:'A₁v₁ = A₂v₂ ;  P₁ − P₂ = ½ρ(v₂² − v₁²)',
 observe:'Fluid moves fastest where the pipe is narrowest, and the pressure there is lowest.',
 tryText:'Halve the throat diameter. By what factor does the speed rise?',
 controls:[R('Q','Flow rate',.5,10,.1,3,'L/s',1),R('D1','Main pipe diameter',4,10,.1,6,'cm',1),R('D2','Throat diameter',1.5,4,.1,3,'cm',1)],
 metrics:p=>{const Q=p.Q/1000,A1=PI*(p.D1/200)**2,A2=PI*(p.D2/200)**2,v1=Q/A1,v2=Q/A2,dP=.5*1000*(v2*v2-v1*v1);return[N('Speed in main pipe',v1,'m/s'),N('Speed in throat',v2,'m/s'),N('Pressure drop',dP/1000,'kPa',2),N('Height difference',dP/(1000*G)*100,'cm',1)]},
 draw:(c,p,t)=>{const Q=p.Q/1000,A1=PI*(p.D1/200)**2,A2=PI*(p.D2/200)**2,v1=Q/A1,v2=Q/A2,dh=(v2*v2-v1*v1)/(2*G),s=P3.scene(c,{scale:56,cy:300,pitch:.25}),r1=.12+p.D1*.05,r2=.12+p.D2*.05;s.floor(4,.5,-1.2);
  const prof=x=>{const a=Math.abs(x);return a<.5?r2:a<1.5?r2+(r1-r2)*(a-.5):r1};for(let i=0;i<24;i++){const x=-3.6+i*.3+.15;s.cyl([x,0,0],[1,0,0],prof(x),.31,'#7fc8e8',{alpha:.32,caps:false,seg:18})}
  const tab=memo('vt'+r1+r2,()=>{const xs=[],ts=[];let tau=0;for(let i=0;i<=144;i++){const x=-3.6+i*.05;xs.push(x);ts.push(tau);tau+=.05*(prof(x)/r1)**2}return{xs,ts,total:tau}}),xAt=tau=>{let i=1;while(i<tab.ts.length-1&&tab.ts[i]<tau)i++;return tab.xs[i]};
  for(let i=0;i<30;i++){const lane=(hash(i)-.5)*1.4,x=xAt(cycle(hash(i+40)*tab.total+t*.9,tab.total));s.ball([x,lane*prof(x),(hash(i+90)-.5)*prof(x)*1.2],.04,'#ffffff',{flat:true})}
  const h0=1.6,hh1=h0,hh2=clamp(h0-dh*4,.25,h0);for(const [x,h,lab] of [[-2.4,hh1,'P₁'],[0,hh2,'P₂']]){s.cyl([x,r1+1,0],[0,1,0],.09,2,'#ffffff',{alpha:.15,caps:false});s.cyl([x,(h+prof(x))/2,0],[0,1,0],.08,h-prof(x),'#3fa7d6');s.label([x,2.25,0],lab,C.gold,14)}
  s.seg([-2.6,hh1,0],[.25,hh1,0],C.muted,1,[3,3]);s.label([.9,(hh1+hh2)/2,0],`Δh = ${f(dh*100,1)} cm`,C.gold,13);s.render()},
 assumption:'Steady, incompressible, non-viscous horizontal flow of water (ρ = 1000 kg/m³). Height drop shown is scaled.'});

add({base:'buoyancy',id:'pressure-depth',title:'Pressure at depth in a tank',
 description:'Lower a pressure probe into a tank and change the liquid. Find the force on one side wall too.',
 formula:'P = P₀ + ρgh ;  F_wall = ½ρgH²W',
 observe:'Pressure depends only on depth and density — not on the tank’s shape or the amount of liquid.',
 tryText:'Switch to mercury and keep the probe depth fixed.',
 controls:[S('fluid','Liquid',1000,[[1000,'Water (1000 kg/m³)'],[800,'Oil (800 kg/m³)'],[13600,'Mercury (13 600 kg/m³)']]),R('H','Liquid depth H',.5,5,.1,3,'m',1),R('h','Probe depth (fraction of H)',0,1,.05,.6,'',2),R('W','Wall width W',1,5,.5,2,'m',1)],
 metrics:p=>{const rho=Number(p.fluid),d=p.h*p.H,P=101325+rho*G*d;return[N('Probe depth',d,'m'),N('Gauge pressure',rho*G*d/1000,'kPa',1),N('Absolute pressure',P/1000,'kPa',1),N('Force on side wall',.5*rho*G*p.H**2*p.W/1000,'kN',1)]},
 draw:(c,p,t)=>{const rho=Number(p.fluid),col=rho>2000?'#b8c2cc':rho<900?'#d9a441':'#3fa7d6',s=P3.scene(c,{scale:56,cy:300,yaw:.2}),Hs=.6+p.H*.55,W=1+p.W*.4;s.floor(3.5,.5,-1.5);
  s.box([0,-1.5+Hs/2,0],[W,Hs,1.6],col,{alpha:.55});s.box([0,-1.5+1.7,0],[W+.05,3.4,1.65],'#ffffff',{alpha:.07});const yp=-1.5+Hs-p.h*Hs;s.seg([0,2,0],[0,yp,0],C.white,1.5);s.ball([0,yp,0],.12,C.red,{lift:3});
  for(let i=1;i<=5;i++){const y=-1.5+Hs-i*Hs/5,L=i*.12;s.arrow([W/2+.05,y,0],[W/2+.05+L,y,0],C.gold,2,7)}s.label([0,yp+.35,0],`${f(rho*G*p.h*p.H/1000,1)} kPa gauge`,C.white,13);s.render();
  tag(c,'gold arrows: wall pressure grows linearly with depth',44,98,C.muted,13)},
 assumption:'Liquid at rest, incompressible; atmospheric pressure P₀ = 101.3 kPa at the surface.'});

add({base:'buoyancy',id:'drop-bubble-pressure',title:'Pressure inside drops and bubbles',
 description:'Surface tension squeezes a drop. A soap bubble has two surfaces, so its excess pressure doubles.',
 formula:'Drop: ΔP = 2T/r ;  Bubble: ΔP = 4T/r',
 observe:'Smaller drops and bubbles have a higher internal pressure.',
 tryText:'Make the radius ten times smaller.',
 controls:[S('kind','Object','drop',[['drop','Liquid drop'],['bubble','Soap bubble'],['air','Air bubble inside liquid']]),R('r','Radius',.1,50,.1,2,'mm',1),R('T','Surface tension',.02,.08,.001,.072,'N/m',3)],
 metrics:p=>{const k=p.kind==='bubble'?4:2,dP=k*p.T/(p.r/1000);return[N('Surfaces',p.kind==='bubble'?'2 (inner + outer)':'1'),N('Excess pressure',dP,'Pa',1),N('In atmospheres',dP/101325,'atm',5)]},
 draw:(c,p,t)=>{const k=p.kind==='bubble'?4:2,s=P3.scene(c,{scale:60,cx:220}),r=.4+Math.log10(p.r*10+1)*.55,col=p.kind==='drop'?'#3fa7d6':'#b89dff';
  if(p.kind==='air')s.box([0,0,0],[3.6,3.6,3.6],'#3fa7d6',{alpha:.12});s.ball([0,0,0],r,col,p.kind==='drop'?{}:{stroke:'#ffffff'});
  for(let i=0;i<10;i++){const a=TAU*i/10+t*.2,dir=[Math.cos(a),Math.sin(a)*.8,Math.sin(a)*.6],n=V.norm(dir);s.arrow(V.mul(n,r+.6),V.mul(n,r+.12),C.gold,2,7)}s.render();
  chart(c,430,96,226,150,{title:'ΔP vs radius',xl:'r (mm)',xmin:.1,xmax:10,series:[{fn:x=>k*p.T/(x/1000),col:C.gold}],marker:[Math.min(10,p.r),k*p.T/(Math.min(10,p.r)/1000)],ymax:k*p.T/(.5/1000)})},
 assumption:'Static spherical surfaces; T for water ≈ 0.072 N/m, soap solution ≈ 0.025–0.03 N/m.'});

add({base:'buoyancy',id:'aerofoil-lift',title:'Lift on an aerofoil',
 description:'Air flows faster over the curved top of a wing. Bernoulli’s principle gives the pressure difference.',
 formula:'L = ½ρ(v_top² − v_bottom²) A',
 observe:'A small speed difference over a large wing area produces enough lift to hold up an aircraft.',
 tryText:'Halve the air density (high altitude). How much faster must the plane fly?',
 controls:[R('v','Airspeed under wing',50,250,5,70,'m/s'),R('k','Speed ratio top/bottom',1,1.3,.01,1.1,'',2),R('A','Wing area',10,120,1,30,'m²'),R('rho','Air density',.4,1.25,.01,1.2,'kg/m³',2)],
 metrics:p=>{const vt=p.v*p.k,dP=.5*p.rho*(vt*vt-p.v*p.v),L=dP*p.A;return[N('Speed over wing',vt,'m/s',1),N('Pressure difference',dP,'Pa',0),N('Lift force',L/1000,'kN',1),N('Mass supported',L/G,'kg',0)]},
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:58,yaw:.5,pitch:.3}),span=1.2+p.A*.025;const prof=[[-1.1,0],[-.9,.18],[-.4,.3],[.3,.22],[1.1,0],[.3,-.06],[-.4,-.08],[-.9,-.06]];
  for(const z of [-span,span])s.poly(prof.map(([x,y])=>[x,y,z]),'#c9d3da',{stroke:'#00000033'});for(let i=0;i<prof.length;i++){const a=prof[i],b=prof[(i+1)%prof.length];s.poly([[a[0],a[1],-span],[b[0],b[1],-span],[b[0],b[1],span],[a[0],a[1],span]],'#c9d3da',{cull:false})}
  for(let j=0;j<5;j++){const z=-span+j*span/2,top=[],bot=[];for(let i=0;i<=30;i++){const x=-3+i*.2,bump=Math.exp(-x*x*1.2);top.push([x,.55+bump*.25,z]);bot.push([x,-.35-bump*.05,z])}s.path(top,'#42d9ca88',1.5);s.path(bot,'#7baaff88',1.5);
   const xt=-3+cycle(t*p.v*p.k*.03+j,6),xb=-3+cycle(t*p.v*.03+j,6);s.ball([xt,.55+Math.exp(-xt*xt*1.2)*.25,z],.05,C.mint,{flat:true});s.ball([xb,-.35-Math.exp(-xb*xb*1.2)*.05,z],.05,C.blue,{flat:true})}
  const L=.5*p.rho*(p.v**2*(p.k**2-1))*p.A;s.arrow([0,.4,0],[0,.4+clamp(L/2e5,.1,1.8),0],C.gold,4);s.label([0,.6+clamp(L/2e5,.1,1.8),0],'lift',C.gold,14);s.render()},
 assumption:'Idealised Bernoulli model with uniform speeds above and below; real wings also rely on downwash and angle of attack.'});

add({base:'buoyancy',id:'hydrometer',title:'Hydrometer',
 description:'A weighted float sinks until it displaces its own weight. Read the liquid density on its stem.',
 formula:'m = ρ (V₀ + a x)  →  x = (m/ρ − V₀) / a',
 observe:'The hydrometer floats higher in denser liquids, so its scale reads larger values lower down.',
 tryText:'Compare a light oil (800) with sea water (1025).',
 controls:[R('rho','Liquid density',700,1500,5,1000,'kg/m³'),R('m','Hydrometer mass',25,45,.5,35,'g',1)],
 metrics:p=>{const V0=30e-6,a=.5e-4,x=(p.m/1000/p.rho-V0)/a;return[N('Stem submerged',x*100,'cm',2),N('State',x<0?'Bulb rises out — too dense':x>.2?'Sinks — too light':'Floating, reading on scale'),N('Buoyant force',p.m/1000*G,'N',3)]},
 draw:(c,p,t)=>{const V0=30e-6,a=.5e-4,x=clamp((p.m/1000/p.rho-V0)/a,-.02,.2),s=P3.scene(c,{scale:62,cy:290}),col=p.rho>1100?'#5aa86b':p.rho<900?'#d9a441':'#3fa7d6';s.floor(3,.5,-2);
  s.cyl([0,-.6,0],[0,1,0],.95,2.8,'#ffffff',{alpha:.12,caps:false});s.cyl([0,-.9,0],[0,1,0],.9,2.2,col,{alpha:.45});const surf=.2,bob=Math.sin(t*2)*.02,base=surf-x*7-.6+bob;
  s.cyl([0,base,0],[0,1,0],.25,.75,'#e9f6ff',{alpha:.85});s.ball([0,base-.45,0],.18,'#5d7b8f');s.cyl([0,base+.38+.75,0],[0,1,0],.06,1.5,'#e9f6ff');for(let i=0;i<8;i++)s.seg([.06,base+.5+i*.17,0],[.12,base+.5+i*.17,0],'#081624',1.2);s.render();
  tag(c,x<0?'Bulb pokes out: liquid too dense for this hydrometer':x>=.2?'Sinks: liquid too light':`reads ${p.rho} kg/m³`,44,98,x<0||x>=.2?C.red:C.mint,15)},
 assumption:'Bulb volume V₀ = 30 cm³, stem area a = 0.5 cm², stem length 20 cm; surface tension at the stem ignored.'});

/* ---------- Thermal Properties of Matter ---------- */
add({base:'expansion',id:'bimetallic-strip',title:'Bimetallic strip',
 description:'Bond two metals and heat them. The one that expands more ends up on the outside of the curve.',
 formula:'1/ρ ≈ 3(α₂ − α₁)ΔT / 2h',
 observe:'Heating curls the strip towards the metal with the smaller expansion coefficient; cooling reverses it.',
 tryText:'Make ΔT negative. Which way does the strip bend now?',
 controls:[S('pair','Metal pair','brass',[['brass','Brass / steel'],['copper','Copper / invar'],['al','Aluminium / steel']]),R('dT','Temperature change ΔT',-100,200,5,80,'K'),R('h','Total thickness',.5,3,.1,1,'mm',1),R('L','Length',5,20,.5,12,'cm',1)],
 metrics:p=>{const da={brass:7e-6,copper:15.8e-6,al:11e-6}[p.pair],k=3*da*p.dT/(2*p.h/1000),L=p.L/100;return[N('Curvature',k,'1/m',3),N('Radius of curvature',k?Math.abs(1/k):Infinity,'m',2),N('Tip deflection ≈ κL²/2',k*L*L/2*1000,'mm',2)]},
 draw:(c,p,t)=>{const da={brass:7e-6,copper:15.8e-6,al:11e-6}[p.pair],k=3*da*p.dT/(2*p.h/1000),L=p.L/100,vis=clamp(k*L*40,-1.4,1.4),s=P3.scene(c,{scale:62,cy:262}),n=20,Ls=4,cols={brass:['#d9b44a','#9fb4c2'],copper:['#d9844a','#c9d3da'],al:['#dfe6ea','#9fb4c2']}[p.pair];
  s.box([-2.2,0,0],[.5,1,1.2],'#5d7b8f');let x=-2,y=0,a=0;for(let i=0;i<n;i++){const dl=Ls/n,mid=[x+Math.cos(a)*dl/2,y+Math.sin(a)*dl/2,0],nrm=[-Math.sin(a),Math.cos(a),0];s.box(V.add(mid,V.mul(nrm,.06)),[dl+.01,.12,.8],cols[0],{rotZ:a});s.box(V.add(mid,V.mul(nrm,-.06)),[dl+.01,.12,.8],cols[1],{rotZ:a});x+=Math.cos(a)*dl;y+=Math.sin(a)*dl;a-=vis/n}
  for(let i=0;i<5;i++)s.ball([-1.6+i*.8,-1.5,0],.12+.04*Math.sin(t*7+i),p.dT>=0?'#ff9a3c':'#7fc8e8',{glow:true,flat:true});s.label([-1.4,.6,0],'top: '+({brass:'brass',copper:'copper',al:'aluminium'})[p.pair],cols[0],12);s.render()},
 assumption:'Equal layer thicknesses and similar Young’s moduli (Timoshenko’s simplified result); bending magnified for display.'});

add({base:'expansion',id:'heating-curve',title:'Heating curve: ice to steam',
 description:'Heat ice at constant power and track temperature through melting and boiling.',
 formula:'Q = mcΔT  (warming) ;  Q = mL  (change of state)',
 observe:'During melting and boiling the temperature stays constant while energy breaks molecular bonds.',
 tryText:'Double the mass. Which plateau grows the most in time?',
 controls:[R('m','Mass of ice',.1,2,.05,.5,'kg',2),R('P','Heater power',200,3000,50,1000,'W'),R('T0','Starting temperature',-40,0,1,-20,'°C')],
 metrics:(p,t)=>{const r=heatState(p,t);return[N('Phase',r.phase),N('Temperature',r.T,'°C',1),N('Energy supplied',r.Q/1000,'kJ',0),N('Time to all steam',r.total/p.P/60,'min',1)]},
 draw:(c,p,t)=>{const r=heatState(p,t),s=P3.scene(c,{scale:56,cx:220,cy:300});s.floor(2.5,.5,-1.6);s.cyl([0,-1.45,0],[0,1,0],.5,.3,'#2f3d48');for(let i=0;i<6;i++){const a=TAU*i/6;s.ball([.3*Math.cos(a),-1.25,.3*Math.sin(a)],.07+.03*Math.sin(t*9+i),'#4aa3ff',{glow:true,flat:true})}
  s.cyl([0,-.25,0],[0,1,0],.95,2,'#ffffff',{alpha:.14,caps:false});const level=r.f<3?.9:.9*(1-(r.f-3)*.8);if(r.f<2){const n=Math.round(6*(r.f<1?1:2-r.f));for(let i=0;i<n;i++)s.box([-.4+(i%3)*.4,-1+Math.floor(i/3)*.4,(i%2)*.2-.1],[.3,.3,.3],'#dff3ff',{alpha:.85})}
  if(r.f>=1)s.cyl([0,-1.2+level/2,0],[0,1,0],.9,level,'#3fa7d6',{alpha:.5});if(r.f>=3)for(let i=0;i<10;i++)s.ball([(hash(i)-.5)*1.2,-1+cycle(t*.8+hash(i+5)*3,2.6),(hash(i+9)-.5)*1.2],.06,'#ffffff',{flat:true});s.render();
  chart(c,400,96,256,170,{title:'Temperature vs time',xl:'t',xmin:0,xmax:r.total,ymin:-40,ymax:130,series:[{pts:r.curve,col:C.gold}],marker:[r.Q,r.T]})},
 assumption:'All heater power goes into the water; c_ice = 2100, c_water = 4186, c_steam = 2010 J/(kg K); L_f = 334 kJ/kg, L_v = 2260 kJ/kg; steam heated to 120 °C. Animation compresses the full process into 14 s.'});
function heatState(p,t){const m=p.m,stages=[[m*2100*(0-p.T0),'Warming ice'],[m*3.34e5,'Melting at 0 °C'],[m*4186*100,'Warming water'],[m*2.26e6,'Boiling at 100 °C'],[m*2010*20,'Warming steam']];const total=stages.reduce((s,a)=>s+a[0],0),Q=total*Math.min(1,cycle(t,16)/14);
  const Tat=q=>{let left=q;const T=[[p.T0,0],[0,0],[0,100],[100,100],[100,120]];for(let i=0;i<5;i++){const E=stages[i][0];if(left<=E||i===4){const fr=E?clamp(left/E,0,1):1;return[T[i][0]+(T[i][1]-T[i][0])*fr,i+fr,stages[i][1]]}left-=E}};
  const [T,fpos,phase]=Tat(Q);const curve=Array.from({length:101},(_,i)=>[total*i/100,Tat(total*i/100)[0]]);return{T,f:fpos,phase,Q,total,curve}}

add({base:'expansion',id:'water-anomaly',title:'Anomalous expansion of water',
 description:'Water is densest at 4 °C. Cool a pond and see why lakes freeze from the top down.',
 formula:'ρ_max at ≈ 3.98 °C',
 observe:'Below 4 °C colder water is less dense and stays on top, so ice forms at the surface and insulates the water below.',
 tryText:'Lower the air temperature below 0 °C and watch the layers.',
 controls:[R('Ta','Air temperature',-10,20,.5,2,'°C',1),R('Tw','Probe water temperature',0,20,.1,4,'°C',1)],
 metrics:p=>{const r=waterRho(p.Tw);return[N('Density at probe',r,'kg/m³',3),N('Volume of 1 kg',1e6/r,'cm³',2),N('Bottom of pond','≈ 4 °C (densest water)'),N('Surface',p.Ta<0?'Ice layer forms':'Liquid')]},
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:58,cx:230,cy:290,pitch:.3});const Ts=Math.max(0,p.Ta),layers=6;s.box([0,-1.6,0],[4,.2,2.6],'#4b3b2a');
  for(let i=0;i<layers;i++){const fr=i/(layers-1),T=p.Ta>4?4+(Ts-4)*fr:4-(4-Ts)*fr,blue=Math.round(clamp(160+T*4,100,230));s.box([0,-1.35+i*.38,0],[3.9,.36,2.5],`#2f${(70+i*8).toString(16)}${blue.toString(16)}`,{alpha:.5});s.label([2.4,-1.35+i*.38,1.3],f(T,1)+' °C',C.white,11)}
  if(p.Ta<0)s.box([0,-1.35+layers*.38-.05,0],[3.95,.18,2.55],'#e6f6ff',{alpha:.9});s.render();
  chart(c,440,96,216,170,{title:'Density of water',xl:'T (°C)',xmin:0,xmax:20,ymin:998.1,ymax:1000.05,series:[{fn:waterRho,col:C.mint}],marker:[p.Tw,waterRho(p.Tw)]})},
 assumption:'Density from the Thiesen–Tilton formula for pure water at 1 atm; pond layers shown schematically.'});
function waterRho(T){return 1000*(1-(T-3.9863)**2*(T+288.9414)/(508929.2*(T+68.12963)))}

/* ---------- Thermodynamics ---------- */
add({base:'thermo',id:'isobaric-process',title:'Heating gas at constant pressure',
 description:'Weights hold the piston pressure fixed while you heat the gas. Track Q, W and ΔU.',
 formula:'W = nRΔT,  Q = nC_pΔT,  ΔU = nC_vΔT',
 observe:'Only part of the heat raises internal energy; the rest does work lifting the piston.',
 tryText:'Switch to a diatomic gas. What fraction of Q becomes work now?',
 controls:[R('n','Amount of gas',.1,2,.05,.5,'mol',2),R('P','Pressure',50,300,5,100,'kPa'),R('T1','Initial temperature',250,400,5,300,'K'),R('T2','Final temperature',300,800,5,450,'K'),S('gas','Gas','mono',[['mono','Monatomic (Cv = 3R/2)'],['di','Diatomic (Cv = 5R/2)']])],
 metrics:p=>{const dT=p.T2-p.T1,cv=p.gas==='mono'?1.5:2.5,W=p.n*Rgas*dT,U=p.n*cv*Rgas*dT;return[N('Work by gas',W,'J',0),N('Change in internal energy',U,'J',0),N('Heat supplied',W+U,'J',0),N('Volume change',W/(p.P*1000)*1000,'L',2)]},
 draw:(c,p,t)=>{const ph=.5-.5*Math.cos(t*.9),T=p.T1+(p.T2-p.T1)*ph,V1=p.n*Rgas*p.T1/(p.P*1000),V=p.n*Rgas*T/(p.P*1000),Vmax=p.n*Rgas*800/(p.P*1000),h=.4+2.4*V/Math.max(Vmax,1e-9),s=P3.scene(c,{scale:58,cx:220,cy:300});s.floor(2.5,.5,-1.6);
  s.cyl([0,-.1,0],[0,1,0],.95,3,'#ffffff',{alpha:.12,caps:false});s.cyl([0,-1.6+h/2,0],[0,1,0],.9,h,'#ff9a3c',{alpha:.18+.25*(T-250)/550,caps:false});s.cyl([0,-1.6+h+.1,0],[0,1,0],.9,.2,'#5d7b8f');for(let i=0;i<3;i++)s.cyl([0,-1.6+h+.3+i*.16,0],[0,1,0],.45,.14,'#2f3d48');
  for(let i=0;i<5;i++)s.ball([(i-2)*.32,-1.75,0],.1+.05*Math.sin(t*8+i),'#ff9a3c',{glow:true,flat:true});s.render();
  chart(c,420,96,236,170,{title:'P–V diagram',xl:'V (L)',xmin:0,xmax:Math.max(Vmax,V1)*1000*1.1,ymin:0,ymax:p.P*1.4,series:[{pts:[[V1*1000,p.P],[p.n*Rgas*p.T2/(p.P*1000)*1000,p.P]],col:C.gold,w:3}],marker:[V*1000,p.P]})},
 assumption:'Ideal gas, quasi-static process, frictionless piston loaded by fixed weights.'});

add({base:'thermo',id:'refrigerator',title:'Refrigerator and heat pump',
 description:'Pump heat from a cold box to a warm room. The ideal coefficient of performance depends only on the temperatures.',
 formula:'COP = Q_c / W = T_c / (T_h − T_c)',
 observe:'The closer the two temperatures, the less work is needed to move each joule of heat.',
 tryText:'Set the freezer colder. How does the required power change?',
 controls:[R('Tc','Inside temperature',-30,15,1,4,'°C'),R('Th','Room temperature',15,50,1,30,'°C'),R('Qc','Heat removed per second',50,500,10,150,'W')],
 metrics:p=>{const Tc=p.Tc+273.15,Th=Math.max(p.Th+273.15,Tc+1),cop=Tc/(Th-Tc),W=p.Qc/cop;return[N('Ideal COP',cop,'',2),N('Power input (ideal)',W,'W',1),N('Heat rejected to room',p.Qc+W,'W',1),N('Heat-pump COP',Th/(Th-Tc),'',2)]},
 draw:(c,p,t)=>{const Tc=p.Tc+273.15,Th=Math.max(p.Th+273.15,Tc+1),cop=Tc/(Th-Tc),W=p.Qc/cop,s=P3.scene(c,{scale:56,yaw:.4,cy:280});s.floor(3,.5,-1.7);
  s.box([0,0,0],[1.6,3.4,1.4],'#e9f6ff');s.box([.82,.6,0],[.04,1.8,1.3],'#c9d3da');s.box([.85,0,.5],[.06,.6,.06],'#5d7b8f');s.box([0,-.2,0],[1.3,2,.9],'#7fc8e8',{alpha:.5});s.helix([-.95,0,0],[0,1,0],.18,2.6,8,C.red,2);
  const k=x=>clamp(x/400,.15,1.4);s.arrow([0,-.2,0],[0,1.2,0],'#7fc8e8',2+4*k(p.Qc));s.arrow([-2.4,-1,0],[-1,-1,0],C.gold,2+4*k(W));s.arrow([-1,.8,0],[-2.6,1.6,0],C.red,2+4*k(p.Qc+W));
  s.label([0,-.6,.7],'Q_c',C.blue,14);s.label([-2.4,-.7,0],'W',C.gold,14);s.label([-2.6,1.9,0],'Q_h = Q_c + W',C.red,13);s.render()},
 assumption:'Ideal (Carnot) refrigerator — real units achieve roughly 40–60 % of this COP.'});

add({base:'thermo',id:'rectangle-cycle',title:'Work from a rectangular P–V cycle',
 description:'Take a monatomic gas round a rectangular cycle. The enclosed area is the net work per cycle.',
 formula:'W_net = (P₂ − P₁)(V₂ − V₁) ;  η = W_net / Q_in',
 observe:'Net work equals the area enclosed; heat is absorbed on the high-pressure and heating legs.',
 tryText:'Widen the volume range. Does the efficiency improve?',
 controls:[R('P1','Low pressure P₁',50,200,5,100,'kPa'),R('P2','High pressure P₂',100,400,5,250,'kPa'),R('V1','Small volume V₁',1,5,.1,2,'L',1),R('V2','Large volume V₂',2,10,.1,5,'L',1)],
 metrics:p=>{const P1=Math.min(p.P1,p.P2)*1e3,P2=Math.max(p.P1,p.P2)*1e3,V1=Math.min(p.V1,p.V2)/1e3,V2=Math.max(p.V1,p.V2)/1e3,W=(P2-P1)*(V2-V1),Qin=1.5*V1*(P2-P1)+2.5*P2*(V2-V1);return[N('Net work per cycle',W,'J',1),N('Heat absorbed',Qin,'J',1),N('Efficiency',W/Qin*100,'%',1)]},
 draw:(c,p,t)=>{const P1=Math.min(p.P1,p.P2),P2=Math.max(p.P1,p.P2),V1=Math.min(p.V1,p.V2),V2=Math.max(p.V1,p.V2),ph=cycle(t/2,4),corner=[[V1,P1],[V1,P2],[V2,P2],[V2,P1]],i=Math.floor(ph),fr=ph-i,a=corner[i],b=corner[(i+1)%4],cur=[a[0]+(b[0]-a[0])*fr,a[1]+(b[1]-a[1])*fr];
  const s=P3.scene(c,{scale:56,cx:200,cy:300});s.floor(2.4,.5,-1.6);const h=.4+cur[0]/10*2.6;s.cyl([0,-.1,0],[0,1,0],.85,3,'#ffffff',{alpha:.12,caps:false});s.cyl([0,-1.6+h/2,0],[0,1,0],.8,h,'#ff9a3c',{alpha:.15+.35*cur[1]/400,caps:false});s.cyl([0,-1.6+h+.1,0],[0,1,0],.8,.2,'#5d7b8f');s.render();
  chart(c,380,96,276,190,{title:'P–V cycle (clockwise)',xl:'V (L)',xmin:0,xmax:10.5,ymin:0,ymax:420,series:[{pts:[...corner,corner[0]],col:C.gold,w:2.5}],marker:[cur[0],cur[1]]})},
 assumption:'Ideal monatomic gas (Cv = 3R/2, Cp = 5R/2), quasi-static legs; heat input counted on the two heating legs.'});

add({base:'thermo',id:'otto-cycle',title:'Petrol engine (Otto cycle)',
 description:'Compress the fuel–air mixture more and the ideal efficiency rises — watch the piston and crank turn.',
 formula:'η = 1 − r^(1−γ)',
 observe:'Efficiency depends only on compression ratio r and γ — not on how much fuel is burned.',
 tryText:'Raise r from 8 to 12. How much does efficiency improve?',
 controls:[R('r','Compression ratio r',2,14,.5,9,'',1),R('g','Heat capacity ratio γ',1.3,1.67,.01,1.4,'',2),R('rpm','Engine speed',600,6000,100,1200,'rpm')],
 metrics:p=>{const eta=1-Math.pow(p.r,1-p.g);return[N('Ideal efficiency',eta*100,'%',1),N('Compression temperature ratio',Math.pow(p.r,p.g-1),'',2),N('Power strokes per second',p.rpm/120,'',1)]},
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:62,cx:230,cy:280,yaw:.3}),th=t*p.rpm/60*TAU*.05,cr=.6,rod=1.6,yp=cr*Math.cos(th)+Math.sqrt(rod*rod-(cr*Math.sin(th))**2),top=-1.2+yp;s.floor(2.6,.5,-2.2);
  s.cyl([0,1.15,0],[0,1,0],.62,1.9,'#ffffff',{alpha:.12,caps:false});const gasH=1.9+1.2-top-.3;s.cyl([0,top+.25+gasH/2,0],[0,1,0],.58,Math.max(.05,gasH),'#ff9a3c',{alpha:.25+.3*Math.max(0,Math.cos(th/2))**8,caps:false});
  s.cyl([0,top+.12,0],[0,1,0],.58,.3,'#9fb4c2');const pin=[cr*Math.sin(th),-1.2+cr*Math.cos(th),0];s.seg([0,top,0],pin,C.steel,6);s.cyl([0,-1.2,0],[0,0,1],cr+.12,.2,'#5d7b8f');s.ball(pin,.08,C.gold);s.cyl([0,2.2,0],[0,1,0],.05,.3,C.white);if(Math.cos(th/2)**8>.6)s.ball([0,2,0],.12,'#ffd27a',{glow:true,flat:true});s.render();
  chart(c,420,96,236,150,{title:'Efficiency vs compression ratio',xl:'r',xmin:1,xmax:14,ymin:0,ymax:1,series:[{fn:x=>1-Math.pow(x,1-p.g),col:C.mint}],marker:[p.r,1-Math.pow(p.r,1-p.g)]})},
 assumption:'Air-standard Otto cycle: instantaneous combustion at top dead centre, adiabatic compression/expansion. Crank motion slowed for display.'});

/* ---------- Kinetic Theory ---------- */
add({base:'kinetic',id:'brownian-motion',title:'Brownian motion',
 description:'A pollen-sized particle is jostled by invisible molecules. Its mean-square displacement grows linearly with time.',
 formula:'D = kT / 6πηa ;  ⟨r²⟩ = 6Dt',
 observe:'The path is random, but hotter, thinner liquids and smaller particles spread out faster.',
 tryText:'Halve the particle radius. How does the rms displacement after a minute change?',
 controls:[R('T','Temperature',273,373,1,293,'K'),R('a','Particle radius',.2,3,.1,.5,'μm',1),R('eta','Viscosity',.3,3,.05,1,'mPa s',2)],
 metrics:p=>{const D=kB*p.T/(6*PI*p.eta*1e-3*p.a*1e-6);return[N('Diffusion coefficient',D*1e12,'μm²/s',3),N('rms displacement in 1 s',Math.sqrt(6*D)*1e6,'μm',2),N('rms displacement in 60 s',Math.sqrt(6*D*60)*1e6,'μm',2)]},
 draw:(c,p,t)=>{const D=kB*p.T/(6*PI*p.eta*1e-3*p.a*1e-6),step=Math.sqrt(2*D*.05)*1e6*.06,n=Math.min(400,Math.floor(cycle(t,24)*16)),pts=[[0,0,0]];
  for(let i=0;i<n;i++){const q=pts[i];pts.push(q.map((v,k)=>clamp(v+step*(hash(i*3+k+1)*2-1)*1.7,-2.2,2.2)))}const s=P3.scene(c,{scale:56});s.box([0,0,0],[4.6,4.6,4.6],'#7fc8e8',{alpha:.06});s.curve(pts,'#42d9ca99',1.4,8);
  for(let i=0;i<40;i++)s.ball([(hash(i+500)-.5)*4.4,(hash(i+600)-.5)*4.4,(hash(i+700)-.5)*4.4].map((v,k)=>v+.1*Math.sin(t*20+i+k)),.03,'#8ca6b9',{flat:true});s.ball(pts[pts.length-1],.08+p.a*.05,C.gold);s.render();
  tag(c,'Path drawn with random steps scaled to the diffusion coefficient',44,98,C.muted,13)},
 assumption:'Stokes–Einstein relation for a sphere in a viscous liquid; the random walk is illustrative, not tracked in real time.'});

add({base:'kinetic',id:'graham-effusion',title:'Graham’s law of effusion',
 description:'Let two gases leak through pinholes. Lighter molecules move faster and escape sooner.',
 formula:'rate₁ / rate₂ = √(M₂ / M₁)',
 observe:'At the same temperature, all gases have the same average kinetic energy — so lighter means faster.',
 tryText:'Compare hydrogen with uranium hexafluoride.',
 controls:[S('A','Gas A',4,[[2,'Hydrogen H₂'],[4,'Helium He'],[16,'Methane CH₄'],[28,'Nitrogen N₂'],[32,'Oxygen O₂'],[44,'Carbon dioxide CO₂'],[352,'Uranium hexafluoride UF₆']]),S('B','Gas B',32,[[2,'Hydrogen H₂'],[4,'Helium He'],[16,'Methane CH₄'],[28,'Nitrogen N₂'],[32,'Oxygen O₂'],[44,'Carbon dioxide CO₂'],[352,'Uranium hexafluoride UF₆']]),R('T','Temperature',200,600,10,300,'K')],
 metrics:p=>{const va=Math.sqrt(3*Rgas*p.T/(p.A/1000)),vb=Math.sqrt(3*Rgas*p.T/(p.B/1000));return[N('Rate A ÷ rate B',Math.sqrt(p.B/p.A),'',3),N('v_rms of A',va,'m/s',0),N('v_rms of B',vb,'m/s',0)]},
 draw:(c,p,t)=>{const va=Math.sqrt(3*Rgas*p.T/(p.A/1000)),vb=Math.sqrt(3*Rgas*p.T/(p.B/1000)),s=P3.scene(c,{scale:56,cy:280});s.floor(3.5,.5,-1.6);
  for(const [x,v,col,M] of [[-1.5,va,'#42d9ca',p.A],[1.5,vb,'#ffc36b',p.B]]){s.box([x,0,0],[2,2,2],'#ffffff',{alpha:.08});s.ball([x,-1,0],.07,'#081624',{flat:true});const sp=v*.0012;
   for(let i=0;i<14;i++){const ph=t*sp+hash(i+x*10);s.ball([x+.85*Math.sin(ph*3.1+i),.85*Math.sin(ph*2.3+i*2),.85*Math.sin(ph*1.7+i*3)],.06+.012*Math.cbrt(M),col)}
   for(let i=0;i<6;i++){const y=-1-cycle(t*sp*.8+i*.4,2.5);s.ball([x+(hash(i+x)-.5)*.4*(-1-y),y,(hash(i+3+x)-.5)*.4*(-1-y)],.05,col,{flat:true})}}s.label([-1.5,1.4,0],'A',C.mint,14);s.label([1.5,1.4,0],'B',C.gold,14);s.render()},
 assumption:'Ideal gases effusing through holes smaller than the mean free path; molecule speeds shown on a common scaled clock.'});

add({base:'kinetic',id:'pressure-collisions',title:'Pressure from molecular collisions',
 description:'Molecules strike the walls of a box. Each bounce delivers momentum 2mv_x; together they make pressure.',
 formula:'P = ⅓ (Nm/V) v_rms² = NkT / V',
 observe:'Doubling the number of molecules or the absolute temperature doubles the pressure.',
 tryText:'Halve the box side. By what factor does the pressure rise?',
 controls:[R('n','Number of moles',.1,5,.1,1,'mol',1),R('T','Temperature',100,600,10,300,'K'),R('L','Box side',10,50,1,30,'cm'),S('M','Gas',.028,[[.004,'Helium'],[.028,'Nitrogen'],[.044,'Carbon dioxide']])],
 metrics:p=>{const Vb=(p.L/100)**3,P=p.n*Rgas*p.T/Vb,v=Math.sqrt(3*Rgas*p.T/p.M);return[N('Pressure',P/1000,'kPa',1),N('v_rms',v,'m/s',0),N('Momentum per head-on hit',2*p.M/NA*v,'kg m/s',2),N('Molecules',p.n*NA,'',2)]},
 draw:(c,p,t)=>{const v=Math.sqrt(3*Rgas*p.T/p.M),Ls=1+p.L*.06,s=P3.scene(c,{scale:60,cy:262}),n=Math.round(10+p.n*10),tri=x=>{const q=cycle(x,2);return q<1?q:2-q};
  s.box([0,0,0],[Ls*2,Ls*2,Ls*2],'#7fc8e8',{alpha:.07});let hits=0;for(let i=0;i<n;i++){const sp=v*.0009*(.6+hash(i)*.8),pos=[0,1,2].map(k=>(tri(t*sp*(.7+hash(i+k*31))+hash(i+k*11)*2)*2-1)*(Ls-.08));if(Math.abs(pos[0])>Ls-.12)hits++;s.ball(pos,.07,'#42d9ca')}
  s.box([Ls,0,0],[.04,Ls*2,Ls*2],C.red,{alpha:.25+.05*Math.min(6,hits)});s.render();tag(c,'red wall flashes as molecules strike it',44,98,C.muted,13)},
 assumption:'Ideal gas; elastic collisions with the walls; molecule motions are a scaled illustration.'});

/* ---------- Oscillations ---------- */
add({base:'pendulum',id:'coupled-pendulums',title:'Coupled pendulums',
 description:'Join two pendulums with a weak spring. Energy slowly swaps between them in beats.',
 formula:'ω₁ = √(g/L),  ω₂ = √(g/L + 2k/m),  T_beat = 2π / (ω₂ − ω₁)',
 observe:'Start one pendulum swinging: it gradually stops while the other takes over, then the transfer reverses.',
 tryText:'Make the spring weaker. Does energy transfer faster or slower?',
 controls:[R('L','Pendulum length',.5,2,.05,1,'m',2),R('k','Spring constant',.1,5,.1,.8,'N/m',1),R('m','Bob mass',.2,2,.1,.5,'kg',1)],
 metrics:p=>{const w1=Math.sqrt(G/p.L),w2=Math.sqrt(G/p.L+2*p.k/p.m);return[N('In-phase mode period',TAU/w1,'s'),N('Out-of-phase mode period',TAU/w2,'s'),N('Energy transfer time',PI/(w2-w1),'s',1)]},
 draw:(c,p,t)=>{const w1=Math.sqrt(G/p.L),w2=Math.sqrt(G/p.L+2*p.k/p.m),A=.25,th1=A*Math.cos((w2-w1)*t/2)*Math.cos((w1+w2)*t/2),th2=A*Math.sin((w2-w1)*t/2)*Math.sin((w1+w2)*t/2),Ls=1.4+p.L*.6,s=P3.scene(c,{scale:58,cy:240});s.floor(3,.5,-2);
  s.box([0,1.9,0],[4,.12,.4],'#5d7b8f');const b1=[-1+Ls*Math.sin(th1),1.85-Ls*Math.cos(th1),0],b2=[1+Ls*Math.sin(th2),1.85-Ls*Math.cos(th2),0];s.seg([-1,1.85,0],b1,C.white,2);s.seg([1,1.85,0],b2,C.white,2);
  s.spring(V.add(b1,[.18,0,0]),V.add(b2,[-.18,0,0]),9,.07,C.mint,2);
  s.ball(b1,.18,C.gold);s.ball(b2,.18,C.red);s.shadow(b1,.18,-2,.3);s.shadow(b2,.18,-2,.3);s.render();
  const E1=Math.cos((w2-w1)*t/2)**2;chart(c,430,96,226,120,{title:'Energy share',xmin:0,xmax:1,ymin:0,ymax:1,series:[]});c.save();c.fillStyle='#ffc36b';c.fillRect(460,206-E1*80,60,E1*80);c.fillStyle='#ff857e';c.fillRect(560,206-(1-E1)*80,60,(1-E1)*80);c.restore()},
 assumption:'Small oscillations, identical pendulums, light spring joining the bobs; no damping.'});

add({base:'pendulum',id:'vertical-spring',title:'Mass on a vertical spring',
 description:'Hang a mass on a spring: it settles at a new equilibrium and oscillates about it.',
 formula:'x₀ = mg/k ;  T = 2π √(m/k)',
 observe:'Gravity shifts the equilibrium position but does not change the period.',
 tryText:'Quadruple the mass. What happens to the period and to the static stretch?',
 controls:[R('m','Mass',.1,3,.05,.5,'kg',2),R('k','Spring constant',5,100,1,20,'N/m'),R('A','Amplitude',0,.2,.01,.08,'m',2)],
 metrics:p=>{const w=Math.sqrt(p.k/p.m);return[N('Static extension',p.m*G/p.k*100,'cm',1),N('Period',TAU/w,'s',3),N('Maximum speed',p.A*w,'m/s',3),N('Maximum acceleration',p.A*w*w,'m/s²',2)]},
 draw:(c,p,t)=>{const w=Math.sqrt(p.k/p.m),x0=clamp(p.m*G/p.k,0,1.5),y=1.8-.6-x0*1.2-p.A*4*Math.cos(w*t),s=P3.scene(c,{scale:60,cy:240,cx:260});s.floor(3,.5,-2.2);
  s.box([0,1.9,0],[1.6,.15,.8],'#5d7b8f');s.spring([0,1.82,0],[0,y+.3,0],14,.18,C.mint,2.2);s.box([0,y,0],[.6*Math.cbrt(p.m)+.2,.6*Math.cbrt(p.m)+.1,.6],'#d9844a');s.shadow([0,y,0],.4,-2.2,.3);
  s.seg([.9,1.2-x0*1.2,0],[1.4,1.2-x0*1.2,0],C.gold,2,[4,3]);s.label([1.9,1.2-x0*1.2,0],'equilibrium',C.gold,12);s.seg([.9,1.2,0],[1.4,1.2,0],C.muted,1.5,[4,3]);s.label([1.9,1.2,0],'natural length',C.muted,12);s.render()},
 assumption:'Light ideal spring obeying Hooke’s law; no damping. Static stretch scaled for display.'});

add({base:'pendulum',id:'lissajous',title:'Lissajous figures',
 description:'Combine two perpendicular simple harmonic motions. Their frequency ratio and phase draw the pattern.',
 formula:'x = A sin(aωt + δ),  y = B sin(bωt)',
 observe:'A closed figure appears when a/b is a ratio of whole numbers; δ changes its shape.',
 tryText:'Set a:b = 1:1 and sweep δ from 0 to 90°.',
 controls:[R('a','x frequency a',1,6,1,3),R('b','y frequency b',1,6,1,2),R('d','Phase difference δ',0,180,5,90,'°'),R('ratio','Amplitude ratio B/A',.3,1,.05,1,'',2)],
 metrics:p=>[N('Frequency ratio a:b',`${p.a}:${p.b}`),N('Phase δ',p.d,'°',0),N('Pattern','Closed (rational ratio)')],
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:60,cy:262,yaw:.35}),A=1.7,B=1.7*p.ratio,d=rad(p.d);s.box([0,0,-.15],[4,4,.2],'#0d2a22');s.box([0,0,-.25],[4.4,4.4,.1],'#3a4b55');for(let i=-4;i<=4;i++){s.seg([i*.45,-1.9,-.04],[i*.45,1.9,-.04],'#1e5a48',1);s.seg([-1.9,i*.45,-.04],[1.9,i*.45,-.04],'#1e5a48',1)}
  const pts=Array.from({length:401},(_,i)=>{const q=TAU*i/400;return[A*Math.sin(p.a*q+d),B*Math.sin(p.b*q),0]});s.path(pts,'#42ff9e88',2,[],1);const q=t*.6;s.ball([A*Math.sin(p.a*q+d),B*Math.sin(p.b*q),.05],.08,'#c8ffd8',{glow:true,flat:true});s.render()},
 assumption:'Ideal oscilloscope with linear deflection; both signals are pure sinusoids.'});

add({base:'pendulum',id:'u-tube',title:'Oscillating liquid in a U-tube',
 description:'Displace the liquid in a U-tube and release it. The column oscillates in simple harmonic motion.',
 formula:'T = 2π √(L / 2g)',
 observe:'The period depends only on the total length of the liquid column, not on its density.',
 tryText:'Quadruple the column length. Does the period double?',
 controls:[R('L','Liquid column length',.2,2,.05,.8,'m',2),R('x','Initial displacement',.01,.1,.005,.05,'m',3)],
 metrics:p=>{const w=Math.sqrt(2*G/p.L);return[N('Period',TAU/w,'s',3),N('Maximum speed',p.x*w,'m/s',3),N('Frequency',w/TAU,'Hz',3)]},
 draw:(c,p,t)=>{const w=Math.sqrt(2*G/p.L),y=p.x*Math.cos(w*t)*8,s=P3.scene(c,{scale:60,cy:280}),h0=.6+p.L*.5;s.floor(3,.5,-2);
  for(const x of [-1,1])s.cyl([x,.2,0],[0,1,0],.25,3,'#ffffff',{alpha:.12,caps:false});const bottom=[];for(let i=0;i<=16;i++){const a=PI+PI*i/16;bottom.push([Math.cos(a),-1.3+Math.sin(a)*.6,0])}s.path(bottom,'#3fa7d6',18);
  s.cyl([-1,-1.3+(h0+y)/2,0],[0,1,0],.23,h0+y,'#3fa7d6',{alpha:.75});s.cyl([1,-1.3+(h0-y)/2,0],[0,1,0],.23,h0-y,'#3fa7d6',{alpha:.75});s.seg([-1.4,-1.3+h0,0],[1.4,-1.3+h0,0],C.gold,1.5,[4,4]);s.render()},
 assumption:'Uniform tube, inviscid liquid, no surface-tension effects; displacement magnified 8×.'});

/* ---------- Waves ---------- */
add({base:'wave',id:'organ-pipes',title:'Open and closed organ pipes',
 description:'Choose a pipe type and harmonic. See the standing wave of air displacement inside the pipe.',
 formula:'Open: fₙ = nv/2L ;  Closed: fₙ = (2n − 1)v/4L',
 observe:'A closed pipe has a node at the closed end and supports only odd harmonics.',
 tryText:'Compare the fundamental of an open and a closed pipe of the same length.',
 controls:[S('type','Pipe','open',[['open','Open at both ends'],['closed','Closed at one end']]),R('L','Pipe length',.2,2,.05,.6,'m',2),R('n','Harmonic number n',1,5,1,1),R('T','Air temperature',0,40,1,20,'°C')],
 metrics:p=>{const v=331*Math.sqrt(1+p.T/273),fq=p.type==='open'?p.n*v/(2*p.L):(2*p.n-1)*v/(4*p.L);return[N('Speed of sound',v,'m/s',1),N('Frequency',fq,'Hz',1),N('Wavelength',v/fq,'m',3),N('Harmonic',p.type==='open'?`${p.n}${['st','nd','rd'][p.n-1]||'th'}`:`${2*p.n-1}${['st','nd','rd'][2*p.n-2]||'th'} (odd only)`)]},
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:56,yaw:.25}),Ls=5.6,x0=-Ls/2,k=p.type==='open'?p.n*PI/Ls:(2*p.n-1)*PI/(2*Ls),wt=Math.cos(t*4);s.cyl([0,0,0],[1,0,0],.55,Ls,'#d9b44a',{alpha:.22,caps:false});if(p.type==='closed')s.cyl([x0,0,0],[1,0,0],.58,.1,'#b08a3a');
  for(let i=0;i<=40;i++){const x=x0+Ls*i/40,u=(p.type==='open'?Math.cos(k*(x-x0)):Math.sin(k*(x-x0)))*wt*.18;for(const [y,z] of [[.3,0],[-.3,0],[0,.3],[0,-.3]])s.ball([x+u,y,z],.035,'#7fc8e8',{flat:true})}
  const env=Array.from({length:81},(_,i)=>{const x=x0+Ls*i/80,a=p.type==='open'?Math.cos(k*(x-x0)):Math.sin(k*(x-x0));return[x,.85+.45*Math.abs(a),0]});s.path(env,C.gold,2);s.label([0,1.6,0],'displacement amplitude',C.gold,12);s.render()},
 assumption:'End corrections neglected; v = 331√(1 + T/273) m/s in dry air.'});

add({base:'wave',id:'string-wave-speed',title:'Wave speed on a stretched rope',
 description:'Flick a rope and time the pulse. The speed depends on tension and mass per unit length.',
 formula:'v = √(T / μ)',
 observe:'A tighter or lighter rope carries pulses faster.',
 tryText:'Quadruple the tension. Does the speed double?',
 controls:[R('T','Tension',10,500,5,100,'N'),R('mu','Linear mass density',1,50,1,10,'g/m'),R('L','Rope length',2,10,.5,6,'m',1)],
 metrics:p=>{const v=Math.sqrt(p.T/(p.mu/1000));return[N('Wave speed',v,'m/s',1),N('Time to cross',p.L/v*1000,'ms',1),N('Fundamental frequency (fixed ends)',v/(2*p.L),'Hz',1)]},
 draw:(c,p,t)=>{const v=Math.sqrt(p.T/(p.mu/1000)),s=P3.scene(c,{scale:56,cy:270,yaw:.2}),Ls=6.2,x0=-3.1,period=2,ph=cycle(t,period),pos=x0+Ls*ph,w=.25+p.mu*.01;s.floor(3.5,.5,-1.4);
  s.box([x0-.25,0,0],[.4,2.4,1],'#5d7b8f');s.box([-x0+.25,0,0],[.4,2.4,1],'#5d7b8f');const pts=Array.from({length:121},(_,i)=>{const x=x0+Ls*i/120,d=x-pos;return[x,.9*Math.exp(-d*d/(2*w*w))*(ph<.95?1:0),0]});s.curve(pts,'#d9844a',3+p.mu*.08,6);s.render();
  tag(c,`Pulse crosses in ${f(p.L/v*1000,1)} ms — shown slowed down`,44,98,C.gold,15)},
 assumption:'Perfectly flexible uniform rope, small-amplitude pulse, no damping; the pulse animation is slowed for viewing.'});

add({base:'wave',id:'ripple-tank',title:'Ripple tank: two-source interference',
 description:'Two dippers make circular waves on water. Watch lines of calm water appear where the waves cancel.',
 formula:'Path difference = nλ → bright ; (n + ½)λ → dark',
 observe:'The pattern of calm lines (nodal lines) spreads out when the sources are closer or the wavelength is longer.',
 tryText:'Double the source separation. Count the nodal lines.',
 controls:[R('d','Source separation d',.5,3,.1,1.5,'units',1),R('lam','Wavelength',.3,1.2,.05,.6,'units',2),R('amp','Wave height',.05,.3,.01,.15,'',2)],
 metrics:p=>{const ratio=p.d/p.lam;return[N('d / λ',ratio,'',2),N('Antinodal lines',2*Math.floor(ratio)+1,'',0),N('Nodal lines',2*Math.round(ratio),'',0)]},
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:60,pitch:.45,cy:280}),k=TAU/p.lam,w=4,n=34,S1=[-p.d/2,0],S2=[p.d/2,0],h=(x,z)=>{const r1=Math.hypot(x-S1[0],z-S1[1])+.15,r2=Math.hypot(x-S2[0],z-S2[1])+.15;return p.amp*(Math.sin(k*r1-w*t)/Math.sqrt(r1)+Math.sin(k*r2-w*t)/Math.sqrt(r2))};
  for(let j=0;j<=n;j++){const z=-3+6*j/n,row=[];for(let i=0;i<=n;i++){const x=-3+6*i/n;row.push([x,h(x,z),z])}s.path(row,'#3fa7d6',1.3)}for(let i=0;i<=n;i+=2){const x=-3+6*i/n,col=[];for(let j=0;j<=n;j++){const z=-3+6*j/n;col.push([x,h(x,z),z])}s.path(col,'#3fa7d666',1)}
  for(const S0 of [S1,S2])s.cyl([S0[0],.5,S0[1]],[0,1,0],.06,1,C.gold);s.render()},
 assumption:'Two coherent, in-phase point sources; amplitude falls as 1/√r; reflections from the tank walls ignored.'});

add({base:'wave',id:'mach-cone',title:'Supersonic flight and the Mach cone',
 description:'A jet outruns its own sound waves. The wavefronts pile up into a cone — the sonic boom.',
 formula:'sin θ = v_sound / v = 1 / M',
 observe:'The faster the jet, the narrower the cone.',
 tryText:'Compare Mach 1.2 with Mach 3.',
 controls:[R('M','Mach number',1.05,4,.05,2,'',2),R('vs','Speed of sound',290,350,1,340,'m/s')],
 metrics:p=>[N('Cone half-angle',deg(Math.asin(1/p.M)),'°',1),N('Aircraft speed',p.M*p.vs,'m/s',0),N('Aircraft speed',p.M*p.vs*3.6,'km/h',0)],
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:54,yaw:.5,pitch:.25}),u=.9,x=-3+cycle(t*u*p.M,6.5);s.cyl([x,0,0],[1,0,0],.12,.9,'#c9d3da');s.poly([[x-.1,0,0],[x-.4,0,-.7],[x-.25,0,-.7],[x+.1,0,0]],'#9fb4c2',{cull:false});s.poly([[x-.1,0,0],[x-.4,0,.7],[x-.25,0,.7],[x+.1,0,0]],'#9fb4c2',{cull:false});
  for(let i=1;i<=7;i++){const dt=i*.5,ex=x-dt*u*p.M;if(ex<-3.4)continue;const r=dt*u;s.ring([ex,0,0],[0,1,0],r,'#7fc8e866',1.2);s.ring([ex,0,0],[0,0,1],r,'#7fc8e844',1)}
  const th=Math.asin(1/p.M),L=3.2;for(const sg of [-1,1]){s.seg([x+.45,0,0],[x+.45-L*Math.cos(th),sg*L*Math.sin(th),0],C.gold,2);s.seg([x+.45,0,0],[x+.45-L*Math.cos(th),0,sg*L*Math.sin(th)],'#ffc36b88',1.5)}s.render();
  tag(c,`θ = ${f(deg(th),1)}°`,44,98,C.gold,16)},
 assumption:'Uniform air at constant sound speed; the aircraft flies straight at constant speed.'});

done();
})();
