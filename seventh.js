/* 3D pack 1 — 25 Class 11 experiments (measurement to gravitation).
   SI calculations; scenes are scaled teaching models with labelled values. */
(() => {
'use strict';
const {R,S,N,f,clamp,rad,deg,cycle,memo,tag,chart,pack,PI,TAU,G,C}=window.PhysicaLab;
const P3=window.Physica3D,{add,done}=pack();
const V=P3.vec;

/* ---------- Units and Measurements ---------- */
add({base:'units',id:'spherometer',title:'Spherometer',
 description:'Lower the central screw onto a curved lens and calculate its radius of curvature from the sagitta.',
 formula:'R = l² / 6h + h / 2',
 observe:'The three legs form an equilateral triangle; the central screw measures how far the curved surface rises (h).',
 tryText:'Keep the leg spacing fixed and halve h. Does R double?',
 controls:[R('turns','Complete screw turns',0,4,1,1),R('div','Circular-scale division',0,99,1,35),R('legs','Leg spacing l',20,60,1,40,'mm')],
 metrics:p=>{const h=p.turns*1+p.div*.01,Rm=h>0?(p.legs**2/(6*h)+h/2):Infinity;return[N('Sagitta h',h,'mm',2),N('Least count','0.01 mm'),N('Radius of curvature',h>0?f(Rm/10,2)+' cm':'Flat (h = 0)')]},
 draw:(c,p,t)=>{const h=p.turns+p.div*.01,s=P3.scene(c,{scale:58,cy:300});s.plate([0,-1.6,0],[7,4.4],'#143144');
  const lensR=2.1;for(let i=0;i<7;i++){const k=i/6,rr=lensR*Math.sqrt(1-k*k*.92),yy=-1.6+.08+k*Math.min(1.1,h*.22);s.cyl([0,yy,0],[0,1,0],rr,.14,'#7fc8e8',{alpha:.7})}
  const top=-1.6+.15+Math.min(1.1,h*.22),L=p.legs/40*1.25;
  for(let k=0;k<3;k++){const a=TAU*k/3+.5,x=L*Math.cos(a),z=L*Math.sin(a);s.cyl([x,.25,z],[0,1,0],.05,2.2,C.steel);s.ball([x,-.86,z],.06,C.steel)}
  s.cyl([0,1.3,0],[0,1,0],L*1.05,.12,'#5d7b8f');s.cyl([0,(top+1.3)/2+.2,0],[0,1,0],.07,1.3-top+.2,'#d7e2ea');
  s.cyl([0,1.75,0],[0,1,0],.75,.16,'#2c6f86',{cap:'#e9f6ff'});const ang=TAU*p.div/100;s.seg([0,1.84,0],[.7*Math.cos(ang),1.84,.7*Math.sin(ang)],C.red,3);
  for(let i=0;i<20;i++){const a=TAU*i/20;s.seg([.62*Math.cos(a),1.84,.62*Math.sin(a)],[.74*Math.cos(a),1.84,.74*Math.sin(a)],'#0a1d2d',1.2)}
  s.cyl([.95,1.45,0],[0,1,0],.04,1,'#e9f6ff');s.label([1.25,2.05,0],'pitch 1 mm',C.muted,12);s.label([0,-1.1,2.1],`h = ${f(h,2)} mm`,C.gold,15);s.render();
  tag(c,'Leg spacing l = '+p.legs+' mm',44,98,C.muted,13)},
 assumption:'Ideal spherometer: 1 mm pitch, 100 circular divisions, legs at the vertices of an equilateral triangle of side l; zero error removed. The lens rise is exaggerated for visibility.'});

add({base:'units',id:'error-propagation',title:'Propagating errors: density of a cube',
 description:'Measure a cube’s side and mass with instrument uncertainty and see how the errors combine in ρ = m/a³.',
 formula:'Δρ/ρ = Δm/m + 3Δa/a',
 observe:'The side length is cubed, so its relative error counts three times in the density.',
 tryText:'Halve Δa and compare how much the total error falls versus halving Δm.',
 controls:[R('a','Side length a',1,5,.01,2.5,'cm',2),R('da','Side uncertainty Δa',.01,.1,.01,.01,'cm',2),R('m','Mass m',10,500,1,120,'g'),R('dm','Mass uncertainty Δm',.1,5,.1,.5,'g',1)],
 metrics:p=>{const rho=p.m/p.a**3,rel=p.dm/p.m+3*p.da/p.a;return[N('Density ρ',rho,'g/cm³',3),N('Relative error',rel*100,'%',2),N('Result',`${f(rho,2)} ± ${f(rho*rel,2)} g/cm³`),N('Share from side',`${f(3*p.da/p.a/rel*100,0)} %`)]},
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:60,yaw:.15});s.floor(3.4,.5,-1.4);const a=.5+p.a*.42,sw=Math.sin(t*2)*.5+.5;
  s.shadow([0,-1.4,0],a*.75,-1.4,.4);s.box([0,-1.4+a/2,0],[a,a,a],'#c48a52');const e=p.da*.42*12;
  s.box([0,-1.4+a/2,0],[a+e*sw,a+e*sw,a+e*sw],'#ffc36b',{alpha:.18});
  s.box([0,-1.4-.03,a/2+.45],[a+.6,.06,.3],'#e9f6ff');for(let i=0;i<=10;i++)s.seg([-a/2-.3+i*(a+.6)/10,-1.36,a/2+.31],[-a/2-.3+i*(a+.6)/10,-1.36,a/2+.4],'#081624',1);
  s.label([0,-1.4+a+.4,0],`a = ${f(p.a,2)} ± ${f(p.da,2)} cm`,C.gold,15);s.label([0,-1.75,a/2+.6],'ruler',C.muted,12);s.render();
  chart(c,470,96,186,120,{title:'Error budget (%)',xmin:0,xmax:1,series:[],ymin:0,ymax:1});const rm=p.dm/p.m*100,ra=3*p.da/p.a*100,tot=rm+ra;
  c.save();c.fillStyle='#7baaff';c.fillRect(490,190-Math.min(80,rm/tot*80),50,Math.min(80,rm/tot*80));c.fillStyle='#ffc36b';c.fillRect(580,190-Math.min(80,ra/tot*80),50,Math.min(80,ra/tot*80));c.restore();
  tag(c,'mass',515,202,C.blue,11,'center');tag(c,'3 × side',605,202,C.gold,11,'center')},
 assumption:'Maximum (linear) error propagation for small independent errors. The highlighted shell exaggerates ±Δa for visibility.'});

add({base:'units',id:'dimensional-analysis',title:'Dimensional analysis of a pendulum',
 description:'Test which quantities can set a pendulum’s period by matching dimensions on both sides.',
 formula:'T = k L^a g^b m^c → a = ½, b = −½, c = 0',
 observe:'Changing the bob’s mass leaves the period unchanged — exactly as dimensional analysis predicts.',
 tryText:'Make the bob five times heavier. Then quadruple the length instead.',
 controls:[R('L','String length L',.2,3,.05,1,'m',2),R('g','Gravitational field g',1.6,25,.1,9.8,'m/s²',1),R('m','Bob mass m',.1,5,.1,.5,'kg',1)],
 metrics:p=>[N('[T] =','[L]^½ [LT⁻²]^−½ = [T] ✓'),N('Period 2π√(L/g)',2*PI*Math.sqrt(p.L/p.g),'s',3),N('Mass exponent c','0 (mass cancels)'),N('Constant k','2π (found by experiment)')],
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:60,cy:240}),T=2*PI*Math.sqrt(p.L/p.g),th=.32*Math.cos(TAU*t/T),Ls=.6+p.L*.75,piv=[0,1.9,0];
  s.box([0,1.98,0],[2.6,.12,.5],'#5d7b8f');const bob=[Ls*Math.sin(th),1.9-Ls*Math.cos(th),0],r=.12+.09*Math.cbrt(p.m);
  s.seg(piv,bob,C.white,2);s.ball(bob,r,C.gold);s.shadow(bob,r,-1.9,.35);s.floor(3,.5,-1.9);
  const arc=[];for(let i=-10;i<=10;i++){const a=.32*i/10;arc.push([Ls*Math.sin(a),1.9-Ls*Math.cos(a),0])}s.path(arc,C.muted,1.2,[4,4]);s.render();
  tag(c,'[T] = [L]^a [L T⁻²]^b [M]^c',44,98,C.white,15);tag(c,'L: a + b = 0   T: −2b = 1   M: c = 0',44,124,C.mint,14);tag(c,`T = ${f(T,2)} s`,44,150,C.gold,15)},
 assumption:'Small-angle simple pendulum; k = 2π cannot come from dimensions and is supplied by experiment or theory.'});

/* ---------- Motion in a Straight Line ---------- */
add({base:'kinematics',id:'average-instant',title:'Average vs instantaneous velocity',
 description:'Shrink the time interval and watch the secant slope approach the tangent slope on the x–t graph.',
 formula:'v̄ = Δx/Δt → v = dx/dt as Δt → 0',
 observe:'For uniform acceleration the average over [t₁, t₁+Δt] equals the instantaneous velocity at the interval midpoint.',
 tryText:'Make Δt very small. How close do the two velocities get?',
 controls:[R('u','Initial velocity u',0,10,.5,2,'m/s',1),R('a','Acceleration a',-2,4,.1,1.5,'m/s²',1),R('t1','Start time t₁',0,5,.1,2,'s',1),R('dt','Interval Δt',.1,4,.1,2,'s',1)],
 metrics:p=>{const x=t=>p.u*t+.5*p.a*t*t,avg=(x(p.t1+p.dt)-x(p.t1))/p.dt,inst=p.u+p.a*p.t1;return[N('Average velocity',avg,'m/s'),N('Instantaneous v(t₁)',inst,'m/s'),N('Difference = aΔt/2',avg-inst,'m/s')]},
 draw:(c,p,t)=>{const x=t=>p.u*t+.5*p.a*t*t,tt=cycle(t,Math.max(6,p.t1+p.dt+.5)),X=v=>-3.3+clamp(v,-5,70)*.09,s=P3.scene(c,{scale:56,cy:330,pitch:.15});
  s.box([0,-.15,0],[7.4,.1,1],'#294358');for(let i=0;i<=14;i++)s.seg([-3.3+i*.5,-.09,.5],[-3.3+i*.5,-.09,.62],C.muted,1);
  for(const [tv,col] of [[p.t1,C.mint],[p.t1+p.dt,C.gold]]){const xx=X(x(tv));s.cyl([xx,.35,-.6],[0,1,0],.03,.9,col);s.poly([[xx,.8,-.6],[xx+.35,.68,-.6],[xx,.56,-.6]],col)}
  const cx=X(x(tt));s.box([cx,.18,0],[.7,.3,.45],'#3d8fd1');s.ball([cx-.22,0,.25],.09,'#1a2a36');s.ball([cx+.22,0,.25],.09,'#1a2a36');s.render();
  const tm=Math.max(6,p.t1+p.dt+.5),avg=(x(p.t1+p.dt)-x(p.t1))/p.dt,inst=p.u+p.a*p.t1;
  chart(c,380,92,276,150,{title:'x–t graph',xl:'t (s)',xmin:0,xmax:tm,series:[{fn:x,col:C.white},{fn:T=>x(p.t1)+avg*(T-p.t1),col:C.gold,dash:[5,4]},{fn:T=>x(p.t1)+inst*(T-p.t1),col:C.mint}],marker:[tt,x(tt)]});
  tag(c,'gold: secant (average)  ·  mint: tangent',44,98,C.muted,13)},
 assumption:'Uniform acceleration along a straight track; the car position is scaled to fit and clamps at the ends of the track.'});

add({base:'kinematics',id:'rain-umbrella',title:'Rain and the tilted umbrella',
 description:'Walk through vertical rain and find the umbrella tilt that keeps you dry using relative velocity.',
 formula:'v_rain,you = v_rain − v_you ; tan θ = v_you / v_rain',
 observe:'In the walker’s frame the rain slants toward them, so the umbrella must lean forward.',
 tryText:'Walk faster with the same rain speed. How does θ change?',
 controls:[R('vr','Rain speed (vertical)',2,15,.5,6,'m/s',1),R('vm','Walking speed',0,8,.25,2,'m/s',2)],
 metrics:p=>{const th=deg(Math.atan2(p.vm,p.vr));return[N('Umbrella tilt from vertical',th,'°',1),N('Rain speed relative to you',Math.hypot(p.vr,p.vm),'m/s'),N('Tilt direction',p.vm>0?'Forward':'Upright')]},
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:58,cy:300,yaw:.35}),th=Math.atan2(p.vm,p.vr),x=-2.5+cycle(t*p.vm*.35,5);s.floor(3.5,.5,-1.5);
  for(let i=0;i<70;i++){const rx=-3.4+((i*137)%68)/10,rz=-1.6+((i*71)%32)/10,ry=3-cycle(t*p.vr*.4+i*.37,4.4);s.seg([rx,ry,rz],[rx,ry-.22,rz],C.glass,1.4)}
  s.shadow([x,-1.5,0],.35,-1.5,.4);s.cyl([x,-.9,0],[0,1,0],.18,1.2,'#3d8fd1');s.ball([x,-.08,0],.17,'#e0b48a');
  const top=[x+1.25*Math.sin(th),-.2+1.25*Math.cos(th),0];s.seg([x+.1,-.6,0],top,C.white,2.5);const ax=[Math.sin(th),Math.cos(th),0];s.cyl(V.sub(top,V.mul(ax,.1)),ax,.85,.08,C.red,{cap:'#ff9a90'});
  s.arrow([x+1.6,1.8,0],[x+1.6,1.8-p.vr*.15,0],C.glass,3,11,`v_rain = ${p.vr} m/s`).arrow([x+1.6,1.8,0],[x+1.6+p.vm*.15,1.8,0],C.gold,3,11,`v_you = ${p.vm} m/s`).arrow([x+1.6,1.8,0],[x+1.6-p.vm*.15,1.8-p.vr*.15,0],C.mint,3,11,`v_rel = ${f(Math.hypot(p.vr,p.vm),2)} m/s at ${f(Math.atan2(p.vm,p.vr)*180/Math.PI,1)}° to vertical`);s.render();
  tag(c,'blue: rain (ground)   gold: you   mint: rain relative to you',44,98,C.muted,13);tag(c,`θ = ${f(deg(th),1)}°`,44,124,C.gold,17)},
 assumption:'Rain falls vertically at constant speed with no wind; the umbrella is tilted along the relative velocity.'});

add({base:'kinematics',id:'trains-meeting',title:'Two trains approaching',
 description:'Two trains start a distance D apart on parallel tracks. Use relative speed to find when and where they meet.',
 formula:'t = D / (v₁ + v₂)',
 observe:'In the frame of train A, train B approaches at v₁ + v₂ — the separation shrinks at that rate.',
 tryText:'Double one train’s speed. Does the meeting point move to the middle?',
 controls:[R('D','Initial separation D',200,2000,50,1000,'m'),R('v1','Speed of train A',5,40,1,20,'m/s'),R('v2','Speed of train B',5,40,1,15,'m/s')],
 metrics:p=>{const tm=p.D/(p.v1+p.v2);return[N('Relative speed',p.v1+p.v2,'m/s',0),N('Meeting time',tm,'s',1),N('Distance covered by A',p.v1*tm,'m',0),N('Distance covered by B',p.v2*tm,'m',0)]},
 draw:(c,p,t)=>{const tm=p.D/(p.v1+p.v2),tt=Math.min(cycle(t,tm+2),tm),k=6.4/p.D,xa=-3.2+p.v1*tt*k,xb=3.2-p.v2*tt*k,s=P3.scene(c,{scale:60,cy:290,pitch:.1});s.floor(3.6,.6,-.6);
  for(const z of [-.55,.55]){s.box([0,-.55,z],[7.2,.05,.5],'#3b2b20');for(let i=0;i<24;i++)s.box([-3.45+i*.3,-.5,z],[.08,.04,.6],'#6a4a33')}
  s.box([xa-.55,-.2,-.55],[1.1,.55,.42],'#3d8fd1');s.box([xa-.1,.17,-.55],[.25,.2,.38],'#2a6496');s.box([xb+.55,-.2,.55],[1.1,.55,.42],'#d9844a');s.box([xb+.1,.17,.55],[.25,.2,.38],'#a85f2c');
  const xm=-3.2+p.v1*tm*k;s.cyl([xm,.3,0],[0,1,0],.025,1.6,C.gold);s.label([xm,1.25,0],'meet',C.gold,13);s.label([xa-.55,.4,-.55],'A',C.white,14);s.label([xb+.55,.4,.55],'B',C.white,14);s.render();
  tag(c,`t = ${f(tt,1)} s   gap = ${f(Math.max(0,p.D-(p.v1+p.v2)*tt),0)} m`,44,98,C.mint,15)},
 assumption:'Constant speeds on straight parallel tracks; train lengths ignored (they meet when their fronts pass).'});

/* ---------- Motion in a Plane ---------- */
add({base:'projectile',id:'projectile-3d',title:'Projectile in 3D with crosswind',
 description:'Aim in any direction and add a steady crosswind. See the path leave its vertical plane.',
 formula:'x = v cosθ cosφ t,  z = v cosθ sinφ t + ½a_w t²,  y = v sinθ t − ½gt²',
 observe:'Gravity sets the flight time; the sideways wind only adds drift along z.',
 tryText:'Turn the wind off, then change only the aim azimuth φ.',
 controls:[R('v','Launch speed',5,30,.5,18,'m/s',1),R('th','Elevation θ',10,80,1,45,'°'),R('phi','Azimuth φ',-45,45,1,0,'°'),R('aw','Crosswind acceleration',-3,3,.1,1,'m/s²',1)],
 metrics:p=>{const T=2*p.v*Math.sin(rad(p.th))/G,vx=p.v*Math.cos(rad(p.th));const X=vx*Math.cos(rad(p.phi))*T,Z=vx*Math.sin(rad(p.phi))*T+.5*p.aw*T*T;return[N('Flight time',T,'s'),N('Maximum height',(p.v*Math.sin(rad(p.th)))**2/(2*G),'m'),N('Landing distance',Math.hypot(X,Z),'m'),N('Wind drift',.5*p.aw*T*T,'m')]},
 draw:(c,p,t)=>{const T=2*p.v*Math.sin(rad(p.th))/G,vx=p.v*Math.cos(rad(p.th)),k=.075,pos=tt=>[-3+vx*Math.cos(rad(p.phi))*tt*k,-1.3+(p.v*Math.sin(rad(p.th))*tt-.5*G*tt*tt)*k,(vx*Math.sin(rad(p.phi))*tt+.5*p.aw*tt*tt)*k];
  const s=P3.scene(c,{scale:56,cy:280,yaw:.25});s.floor(4,.5,-1.3);const pts=Array.from({length:61},(_,i)=>pos(T*i/60));s.curve(pts,C.mint,2.5);s.curve(pts.map(q=>[q[0],-1.3,q[2]]),'#42d9ca44',1.5);
  const tt=Math.min(cycle(t,T+1),T),b=pos(tt);s.ball(b,.13,C.gold);s.shadow(b,.13,-1.3,.45);s.cyl([-3,-1.15,0],[0,1,0],.25,.3,'#5d7b8f');const L=pos(T);s.ring([L[0],-1.29,L[2]],[0,1,0],.25,C.red,2);
  for(let i=0;i<5;i++){const zz=-2+i;s.arrow([1.5,1.4,zz],[1.5,1.4,zz+p.aw*.3],'#7fc8e877',2,7)}s.render();tag(c,'faint arrows: crosswind',44,98,C.muted,13)},
 assumption:'Uniform gravity, no drag; the crosswind is modelled as a constant sideways acceleration.'});

add({base:'projectile',id:'basketball-shot',title:'Basketball free throw',
 description:'Choose the distance, hoop height above release and launch angle; find the speed that sinks the shot.',
 formula:'v² = g d² / [2 cos²θ (d tanθ − h)]',
 observe:'For each angle there is exactly one launch speed that passes through the hoop centre.',
 tryText:'Find the angle that needs the smallest launch speed for d = 4.2 m.',
 controls:[R('d','Horizontal distance d',2,9,.1,4.2,'m',1),R('h','Hoop height above release h',.3,2,.05,1.05,'m',2),R('th','Launch angle θ',30,75,1,52,'°')],
 metrics:p=>{const q=p.d*Math.tan(rad(p.th))-p.h;if(q<=0)return[N('Required speed','Impossible — aim higher'),N('Need tan θ >',p.h/p.d,'',3)];const v=Math.sqrt(G*p.d**2/(2*Math.cos(rad(p.th))**2*q)),T=p.d/(v*Math.cos(rad(p.th))),vy=v*Math.sin(rad(p.th))-G*T;return[N('Required speed',v,'m/s'),N('Flight time',T,'s'),N('Entry angle',deg(Math.atan2(-vy,v*Math.cos(rad(p.th)))),'° below horizontal',1)]},
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:50,cy:300,yaw:.3,cx:340}),k=.7,x0=-3,y0=-1.2+2*k*.5,q=p.d*Math.tan(rad(p.th))-p.h;s.floor(4,.5,-1.9);
  const hx=x0+p.d*k,hy=y0+p.h*k;s.box([hx+.42,hy+.55,0],[.06,1.1,1.6],'#e9f6ffcc');s.box([hx+.42,hy+.45,0],[.07,.35,.5],'#ff857e55');s.ring([hx,hy,0],[0,1,0],.32,C.red,3);s.cyl([hx+.6,(hy-1.9)/2,0],[0,1,0],.06,hy+1.9,'#5d7b8f');
  s.cyl([x0-.15,-1.55,0],[0,1,0],.18,.7,'#3d8fd1');s.ball([x0-.15,-.95,0],.16,'#e0b48a');
  if(q>0){const v=Math.sqrt(G*p.d**2/(2*Math.cos(rad(p.th))**2*q)),T=p.d/(v*Math.cos(rad(p.th))),pos=tt=>[x0+v*Math.cos(rad(p.th))*tt*k,y0+(v*Math.sin(rad(p.th))*tt-.5*G*tt*tt)*k,0];s.curve(Array.from({length:41},(_,i)=>pos(T*i/40)),C.mint,2,6);const b=pos(Math.min(cycle(t,T+.8),T));s.ball(b,.17,'#e8833a');s.shadow(b,.17,-1.9,.4)}
  else s.label([x0+1,y0+1,0],'Angle too low to reach the hoop',C.red,14);s.render()},
 assumption:'Point-like ball, no drag or spin, aimed at the hoop centre; release height taken as the reference level.'});

add({base:'projectile',id:'air-drag-projectile',title:'Projectile with air resistance',
 description:'Add linear air drag and compare the path with the ideal vacuum parabola.',
 formula:'x = (u_x/k)(1 − e^(−kt)),  y = (u_y/k + g/k²)(1 − e^(−kt)) − gt/k',
 observe:'Drag shortens the range and makes the descent steeper than the ascent.',
 tryText:'With drag on, is 45° still the best launch angle?',
 controls:[R('v','Launch speed',5,40,1,25,'m/s'),R('th','Launch angle',10,80,1,45,'°'),R('k','Drag constant k',.02,1.5,.02,.3,'1/s',2)],
 metrics:p=>{const r=memo('drag'+p.v+p.th+p.k,()=>dragPath(p));return[N('Range with drag',r.range,'m',1),N('Range in vacuum',p.v**2*Math.sin(2*rad(p.th))/G,'m',1),N('Terminal speed g/k',G/p.k,'m/s',1),N('Flight time (drag)',r.T,'s')]},
 draw:(c,p,t)=>{const r=memo('drag'+p.v+p.th+p.k,()=>dragPath(p)),Tv=2*p.v*Math.sin(rad(p.th))/G,rv=p.v**2*Math.sin(2*rad(p.th))/G,k=6/Math.max(rv,r.range,1),s=P3.scene(c,{scale:56,cy:300,yaw:.2});s.floor(4,.5,-1.6);
  const vac=Array.from({length:61},(_,i)=>{const tt=Tv*i/60;return[-3+p.v*Math.cos(rad(p.th))*tt*k,-1.6+(p.v*Math.sin(rad(p.th))*tt-.5*G*tt*tt)*k,-.6]});s.curve(vac,'#7baaff',2,6);
  const dr=r.pts.map(([x,y])=>[-3+x*k,-1.6+y*k,.6]);s.curve(dr,C.gold,2.6,6);const i=Math.min(dr.length-1,Math.floor(cycle(t,r.T+1)/r.T*(dr.length-1)));s.ball(dr[i],.13,C.gold);s.shadow(dr[i],.13,-1.6,.4);
  const j=Math.min(60,Math.floor(cycle(t,r.T+1)/Tv*60));s.ball(vac[j],.11,'#7baaff');s.render();tag(c,'blue: vacuum   gold: with drag',44,98,C.muted,13)},
 assumption:'Drag force proportional to velocity (F = −mkv), valid for slow, small objects. Real balls at speed follow closer to v².'});
function dragPath(p){const k=p.k,ux=p.v*Math.cos(rad(p.th)),uy=p.v*Math.sin(rad(p.th)),X=t=>ux/k*(1-Math.exp(-k*t)),Y=t=>(uy/k+G/k/k)*(1-Math.exp(-k*t))-G*t/k;let lo=1e-3,hi=2*uy/G+1;for(let i=0;i<60;i++){const m=(lo+hi)/2;Y(m)>0?lo=m:hi=m}const T=lo;return{T,range:X(T),pts:Array.from({length:81},(_,i)=>[X(T*i/80),Math.max(0,Y(T*i/80))])}}

add({base:'projectile',id:'conical-pendulum',title:'Conical pendulum',
 description:'Whirl a bob in a horizontal circle and see how the cone angle sets the speed and period.',
 formula:'T = 2π √(L cosθ / g),  tension = mg / cosθ',
 observe:'The horizontal component of tension supplies the centripetal force; the vertical component balances weight.',
 tryText:'Increase θ towards 70°. Watch the tension and the period.',
 controls:[R('L','String length L',.5,3,.05,1.5,'m',2),R('th','Cone half-angle θ',5,70,1,35,'°'),R('m','Bob mass',.1,2,.1,.5,'kg',1)],
 metrics:p=>{const ct=Math.cos(rad(p.th)),r=p.L*Math.sin(rad(p.th)),w=Math.sqrt(G/(p.L*ct));return[N('Period',TAU/w,'s'),N('Speed',w*r,'m/s'),N('Radius',r,'m'),N('Tension',p.m*G/ct,'N'),N('Centripetal force',p.m*w*w*r,'N')]},
 draw:(c,p,t)=>{const ct=Math.cos(rad(p.th)),w=Math.sqrt(G/(p.L*ct)),Ls=.9+p.L*.55,r=Ls*Math.sin(rad(p.th)),h=Ls*ct,piv=[0,1.9,0],a=w*t,b=[r*Math.cos(a),1.9-h,r*Math.sin(a)];
  const s=P3.scene(c,{scale:62,cy:250});s.floor(3,.5,-1.9);s.box([0,2,0],[1.2,.1,1.2],'#5d7b8f');s.ring([0,1.9-h,0],[0,1,0],r,'#42d9ca66',1.5,[5,5]);
  for(let i=0;i<12;i++){const q=TAU*i/12;s.seg(piv,[r*Math.cos(q),1.9-h,r*Math.sin(q)],'#42d9ca22',1)}s.seg(piv,[0,1.9-h,0],C.muted,1,[4,4]);
  s.seg(piv,b,C.white,2);s.ball(b,.08+.08*Math.cbrt(p.m),C.gold);s.shadow(b,.14,-1.9,.4);const cen=V.mul([-Math.cos(a),0,-Math.sin(a)],.6);s.arrow(b,V.add(b,cen),C.red,2.5,11,`F_c = mg tanθ = ${f(p.m*9.8*Math.tan(p.th*Math.PI/180),2)} N`);s.arrow(b,[b[0],b[1]-.6,b[2]],C.blue,2.5,11,`W = ${f(p.m*9.8,2)} N`);s.render();
  tag(c,'red: centripetal (net) force   blue: weight',44,98,C.muted,13)},
 assumption:'Light inextensible string, steady circular motion, no air resistance.'});

/* ---------- Laws of Motion ---------- */
add({base:'forces',id:'incline-pulley',title:'Block on an incline with a hanging mass',
 description:'Connect a block on a rough incline over a pulley to a hanging mass. Predict which way the system moves.',
 formula:'a = [m₂g − m₁g sinθ ∓ μm₁g cosθ] / (m₁ + m₂)',
 observe:'Friction always opposes the motion that would otherwise happen; if it can balance the pull, nothing moves.',
 tryText:'Find the hanging mass that just starts the block moving up the slope.',
 controls:[R('m1','Block on incline m₁',1,10,.5,4,'kg',1),R('m2','Hanging mass m₂',.5,10,.5,3,'kg',1),R('th','Incline angle θ',10,60,1,30,'°'),R('mu','Friction coefficient μ',0,.8,.02,.2,'',2)],
 metrics:p=>{const r=inclineSolve(p);return[N('Acceleration',Math.abs(r.a),'m/s²'),N('Motion',r.a===0?'Stays at rest':r.a>0?'m₂ descends':'m₁ slides down'),N('String tension',r.T,'N'),N('Friction',r.fr,'N')]},
 draw:(c,p,t)=>{const r=inclineSolve(p),th=rad(p.th),W=3.6,H=W*Math.tan(th)*.7,s=P3.scene(c,{scale:56,cy:300,cx:330});s.floor(3.5,.5,-1.5);const x0=-2.4,y0=-1.5,dz=.7;
  const tri=[[x0,y0,-dz],[x0+W,y0,-dz],[x0+W,y0+H,-dz]],tri2=tri.map(q=>[q[0],q[1],dz]);s.poly(tri,'#5b6f7d',{cull:false});s.poly(tri2,'#5b6f7d',{cull:false});s.poly([tri[0],tri[2],tri2[2],tri2[0]],'#6f8696',{cull:false,normal:[-Math.sin(Math.atan2(H,W)),Math.cos(Math.atan2(H,W)),0]});s.poly([tri[1],tri[2],tri2[2],tri2[1]],'#4b5d6a',{normal:[1,0,0]});
  const ang=Math.atan2(H,W),Lr=Math.hypot(W,H),sd=clamp(.5*r.a*cycle(t,3)**2*.25,-.9,.9),u=.55+sd*Lr/2.4,bx=x0+u*Math.cos(ang)*Lr*.7,by=y0+u*Math.sin(ang)*Lr*.7;
  s.box([bx-.18*Math.sin(ang),by+.18*Math.cos(ang),0],[.5,.36,.5],'#3d8fd1',{rotZ:ang});const px=x0+W+.18,py=y0+H+.15;s.cyl([px,py,0],[0,0,1],.18,.2,'#9fb4c2');
  s.seg([bx,by+.2,0],[px-.1,py+.15,0],C.white,1.5);const hy=py-1.2-sd*.9;s.seg([px+.18,py,0],[px+.18,hy+.2,0],C.white,1.5);s.box([px+.18,hy,0],[.4,.4,.4],'#d9844a');s.cyl([x0+W+.18,(y0+py)/2,0],[0,1,0],.04,py-y0,'#5d7b8f');s.render();
  tag(c,r.a===0?'Static friction holds the system':r.a>0?'m₂ descends':'m₁ slides down the slope',44,98,r.a===0?C.mint:C.gold,15)},
 assumption:'Light inextensible string, frictionless massless pulley, static and kinetic friction taken equal (μ).'});
function inclineSolve(p){const th=rad(p.th),F=p.m2*G-p.m1*G*Math.sin(th),fmax=p.mu*p.m1*G*Math.cos(th);let a=0,fr=Math.abs(F);if(Math.abs(F)>fmax){a=(F-Math.sign(F)*fmax)/(p.m1+p.m2);fr=fmax}return{a,fr,T:p.m2*(G-a)}}

add({base:'forces',id:'impulse-catch',title:'Impulse: catching an egg',
 description:'Stop a falling object over a short or long time and compare the average force needed.',
 formula:'F̄ = Δp / Δt = mv / Δt',
 observe:'The impulse (area under F–t) is fixed by the change in momentum; stretching Δt lowers the peak force.',
 tryText:'Keep the speed fixed and make the stopping time ten times longer.',
 controls:[R('m','Mass',.05,1,.01,.06,'kg',2),R('v','Impact speed',1,20,.5,5,'m/s',1),R('dt','Stopping time Δt',.005,.5,.005,.02,'s',3)],
 metrics:p=>{const J=p.m*p.v,F=J/p.dt;return[N('Impulse',J,'N s',3),N('Average force',F,'N',1),N('Force ÷ weight',F/(p.m*G),'× mg',1)]},
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:62,cy:290}),T=1.6,tt=cycle(t,T+1),fall=Math.min(1,tt/T),y=1.8-3*fall*fall,squash=clamp(p.dt/.5,.04,1);s.floor(3,.5,-1.6);
  const hit=fall>=1,pillow=.15+.65*squash;s.box([0,-1.6+pillow/2*(hit?.55:1),0],[2,pillow*(hit?.55:1),1.4],'#b89dff');s.ball([0,hit?-1.6+pillow*.55+.2:Math.max(y,-1.6+pillow+.2),0],.2,'#f4e6c8');s.shadow([0,y,0],.2,-1.6,.4);s.render();
  const F=p.m*p.v/p.dt;chart(c,440,96,216,140,{title:'Force while stopping',xl:'t',xmin:0,xmax:.6,ymin:0,ymax:Math.max(F*1.1,1),series:[{pts:[[0,0],[.05,0],[.05,F],[.05+Math.min(.5,p.dt),F],[.05+Math.min(.5,p.dt),0],[.6,0]],col:C.gold}]});tag(c,`F̄ = ${f(F,1)} N`,452,224,C.gold,13)},
 assumption:'Constant (average) stopping force; the cushion’s softness is shown qualitatively by its thickness.'});

add({base:'forces',id:'gun-recoil',title:'Recoil of a gun',
 description:'Fire a bullet from a gun on a frictionless cart. Momentum conservation fixes the recoil speed.',
 formula:'M V = m v  →  V = mv / M',
 observe:'Total momentum stays zero, yet the bullet carries far more kinetic energy than the gun.',
 tryText:'Make the gun heavier. How does the recoil speed and the energy split change?',
 controls:[R('m','Bullet mass',5,50,1,10,'g'),R('v','Muzzle speed',100,900,10,400,'m/s'),R('M','Gun mass',1,8,.1,3,'kg',1)],
 metrics:p=>{const m=p.m/1000,V=m*p.v/p.M;return[N('Recoil speed',V,'m/s'),N('Bullet momentum',m*p.v,'kg m/s'),N('Bullet KE',.5*m*p.v**2,'J',0),N('Gun KE',.5*p.M*V*V,'J',1)]},
 draw:(c,p,t)=>{const m=p.m/1000,V=m*p.v/p.M,tt=cycle(t,3),s=P3.scene(c,{scale:60,cy:290,yaw:.35}),gx=-.5-Math.min(2,V*tt*.5);s.floor(4,.5,-1);
  s.box([gx,-.75,0],[1.6,.2,.8],'#5d7b8f');for(const dx of [-.55,.55])for(const dz of [-.4,.4])s.cyl([gx+dx,-.92,dz],[0,0,1],.1,.06,'#1a2a36');
  s.box([gx-.2,-.4,0],[.9,.4,.3],'#3b2b20');s.cyl([gx+.7,-.3,0],[1,0,0],.07,1.1,'#2f3d48');const bx=gx+1.3+Math.min(6,tt*p.v*.02);if(bx<4)s.ball([bx,-.3,0],.06,C.gold,{glow:tt<.2});
  s.arrow([gx,.2,0],[gx-V*.6-.1,.2,0],C.red,3,11,`V_recoil = ${f(V,2)} m/s`);s.render()},
 assumption:'Frictionless cart, gas momentum ignored, bullet leaves along the barrel axis.'});

add({base:'forces',id:'angle-of-repose',title:'Angle of repose',
 description:'Tilt a rough plane until the block begins to slide. The critical angle reveals μs.',
 formula:'tan θc = μs ;  a = g(sinθ − μk cosθ)',
 observe:'Below θc static friction adjusts to hold the block; above it, kinetic friction cannot stop the slide.',
 tryText:'Set μs = 0.58 and find the angle where sliding begins.',
 controls:[R('mus','Static friction μs',.1,1.2,.01,.5,'',2),R('th','Plane angle θ',0,60,.5,20,'°',1)],
 metrics:p=>{const th=rad(p.th),mk=.8*p.mus,slide=Math.tan(th)>p.mus,a=slide?G*(Math.sin(th)-mk*Math.cos(th)):0;return[N('Angle of repose',deg(Math.atan(p.mus)),'°',1),N('State',slide?'Sliding':'At rest'),N('Acceleration',a,'m/s²'),N('Friction needed / available',`${f(Math.tan(th),2)} / ${f(p.mus,2)} × N`)]},
 draw:(c,p,t)=>{const th=rad(p.th),mk=.8*p.mus,slide=Math.tan(th)>p.mus,a=slide?G*(Math.sin(th)-mk*Math.cos(th)):0,s=P3.scene(c,{scale:60,cy:300});s.floor(3.5,.5,-1.5);
  const L=4.4,ox=-2.2,oy=-1.4,dir=[Math.cos(th),Math.sin(th),0],nrm=[-Math.sin(th),Math.cos(th),0];s.box(V.add([ox,oy,0],V.add(V.mul(dir,L/2),V.mul(nrm,-.05))),[L,.1,1.6],'#7d5a3c',{rotZ:th});
  s.cyl([ox,oy-.05,0],[0,0,1],.07,1.8,C.steel);const u=clamp(.78-(slide?.5*a*cycle(t,2.5)**2*.12:0),.1,.78),bp=V.add([ox,oy,0],V.add(V.mul(dir,u*L),V.mul(nrm,.25)));s.box(bp,[.5,.4,.6],'#3d8fd1',{rotZ:th});
  s.arrow(bp,V.add(bp,V.mul(dir,-.7)),C.mint,2.5,11,`mg sinθ = ${f(Math.sin(th),2)} mg`);s.arrow(bp,[bp[0],bp[1]-.8,bp[2]],C.gold,2.5,11,'W = mg');s.arrow(bp,V.add(bp,V.mul(dir,.4+.4*Math.min(1,Math.tan(th)))),C.red,2.5,11,`f = ${f(slide?.8*p.mus*Math.cos(th):Math.sin(th),2)} mg`);s.render();
  tag(c,slide?'Sliding — kinetic friction (μk = 0.8 μs)':'Static friction holds the block',44,98,slide?C.gold:C.mint,15);tag(c,'mint: down-slope pull   red: friction   gold: weight',44,124,C.muted,13)},
 assumption:'Kinetic friction is taken as 0.8 μs; the block does not tip.'});

add({base:'forces',id:'rotor-ride',title:'Rotor ride',
 description:'Spin a cylindrical room and drop the floor. Friction from the wall must hold riders up.',
 formula:'μ_min = g / (ω² r)',
 observe:'The wall’s normal force provides the centripetal force; friction from that normal force balances weight.',
 tryText:'Halve the spin rate. What friction coefficient is now required?',
 controls:[R('r','Rotor radius',2,6,.1,3,'m',1),R('rpm','Spin rate',10,60,1,35,'rpm'),R('mu','Wall friction μ',.2,1,.02,.5,'',2)],
 metrics:p=>{const w=p.rpm*TAU/60,need=G/(w*w*p.r);return[N('Angular speed',w,'rad/s'),N('Normal force per kg',w*w*p.r,'N/kg',1),N('μ needed',need,'',3),N('Riders',p.mu>=need?'Stay pinned':'Slide down')]},
 draw:(c,p,t)=>{const w=p.rpm*TAU/60,need=G/(w*w*p.r),ok=p.mu>=need,R0=.8+p.r*.3,s=P3.scene(c,{scale:56,cy:280,pitch:.2});s.floor(3.5,.5,-1.8);s.cyl([0,0,0],[0,1,0],R0,3,'#7baaff',{alpha:.25,caps:false,seg:32});s.ring([0,1.5,0],[0,1,0],R0,'#7baaff',2);s.ring([0,-1.5,0],[0,1,0],R0,'#7baaff',2);
  const vis=w*.25;for(let i=0;i<5;i++){const a=vis*t+TAU*i/5,y=ok?0:Math.max(-1.25,.2-cycle(t,3)*.9),x=(R0-.15)*Math.cos(a),z=(R0-.15)*Math.sin(a);s.cyl([x,y,z],[0,1,0],.1,.5,['#ff857e','#ffc36b','#42d9ca','#b89dff','#7baaff'][i]);s.ball([x,y+.35,z],.1,'#e0b48a')}
  s.render();tag(c,ok?'Friction holds the riders':'Not enough friction — riders slide',44,98,ok?C.mint:C.red,15)},
 assumption:'Riders treated as particles pressed against a vertical wall; visual spin rate is slowed 4×.'});

/* ---------- Work, Energy and Power ---------- */
add({base:'energy',id:'vertical-circle',title:'Motion in a vertical circle',
 description:'Whirl a stone on a string in a vertical circle. Below √(5gR) at the bottom, the string goes slack.',
 formula:'v_top² = u² − 4gR ;  T_top = m(v_top²/R − g)',
 observe:'Tension is largest at the bottom and smallest at the top, where gravity helps provide the centripetal force.',
 tryText:'Set u just below √(5gR) and watch where the string slackens.',
 controls:[R('R','Radius R',.5,2,.05,1,'m',2),R('u','Speed at bottom u',2,12,.1,7.2,'m/s',1),R('m','Mass',.1,2,.1,.5,'kg',1)],
 metrics:p=>{const crit=Math.sqrt(5*G*p.R),vt2=p.u**2-4*G*p.R;return[N('Critical speed √(5gR)',crit,'m/s'),N('Tension at bottom',p.m*(p.u**2/p.R+G),'N',1),N('Tension at top',vt2>0?p.m*(vt2/p.R-G):NaN,'N',1),N('Outcome',p.u>=crit?'Completes the loop':p.u**2<=2*G*p.R?'Swings like a pendulum':'String slackens')]},
 draw:(c,p,t)=>{const tr=memo('vc'+p.R+p.u,()=>circleTrack(p)),Rs=1.6,s=P3.scene(c,{scale:62,cy:262,yaw:.2});s.floor(3,.5,-2.2);s.ring([0,0,0],[0,0,1],Rs,'#42d9ca55',1.5,[5,5]);s.cyl([0,0,-.15],[0,0,1],.08,.3,C.steel);
  const k=Math.floor(cycle(t,tr.T)/tr.dt),q=tr.pts[Math.min(k,tr.pts.length-1)],b=[q[0]*Rs/p.R,q[1]*Rs/p.R,0];if(q[2])s.seg([0,0,0],b,C.white,2);else s.label([0,.3,0],'slack!',C.red,14);s.ball(b,.15,C.gold);s.shadow(b,.15,-2.2,.3);s.render()},
 assumption:'Light inextensible string, no air resistance. Once slack, the stone moves as a projectile until the string becomes taut again (motion shown until then).'});
function circleTrack(p){const pts=[],dt=.004,R=p.R;let ph=0,om=p.u/R,taut=true,x=0,y=-R,vx=0,vy=0,t=0;
  while(t<12){if(taut){const T=om*om*R+G*Math.cos(ph);if(T<0&&Math.abs(ph)>.1){taut=false;x=R*Math.sin(ph);y=-R*Math.cos(ph);vx=R*om*Math.cos(ph);vy=R*om*Math.sin(ph)}else{om+=-(G/R)*Math.sin(ph)*dt;ph+=om*dt;pts.push([R*Math.sin(ph),-R*Math.cos(ph),1]);if(ph>TAU){ph-=TAU;if(t>1&&pts.length>10)break}}}
   if(!taut){vy-=G*dt;x+=vx*dt;y+=vy*dt;pts.push([x,y,0]);if(Math.hypot(x,y)>=R&&vy<0)break}t+=dt}
  return{pts,dt,T:pts.length*dt}}

add({base:'energy',id:'oblique-collision',title:'Glancing collision of two balls',
 description:'Strike a stationary ball off-centre. Vary the impact offset and the coefficient of restitution.',
 formula:'Along centres: v₂ = u cosα (1+e)/2 ;  e = 1 → paths at 90°',
 observe:'For equal masses in an elastic glancing collision, the two balls leave at right angles.',
 tryText:'Set e = 1 and try several offsets — measure the angle between the paths.',
 controls:[R('u','Cue-ball speed',1,6,.1,3,'m/s',1),R('b','Impact offset b/2r',0,.95,.01,.5,'',2),R('e','Restitution e',0,1,.05,1,'',2)],
 metrics:p=>{const r=collide(p);return[N('Cue ball after',`${f(r.v1,2)} m/s at ${f(r.a1,1)}°`),N('Target ball after',`${f(r.v2,2)} m/s at ${f(r.a2,1)}°`),N('Angle between paths',Math.abs(r.a1-r.a2),'°',1),N('KE lost',r.loss*100,'%',1)]},
 draw:(c,p,t)=>{const r=collide(p),s=P3.scene(c,{scale:60,cy:280,pitch:.35});s.box([0,-.65,0],[7,.1,4],'#1f6e4a');for(const z of [-2.05,2.05])s.box([0,-.45,z],[7.2,.3,.15],'#5a3a22');for(const x of [-3.55,3.55])s.box([x,-.45,0],[.15,.3,4.2],'#5a3a22');
  const tt=cycle(t,4),hitT=1.4,rad0=.18,al=Math.asin(p.b),pos2=[0,-.42,0],start=[-2.6,-.42,-2*rad0*p.b];let b1,b2;
  if(tt<hitT){b1=[start[0]+(-2*rad0*Math.cos(al)-start[0])*tt/hitT,-.42,start[2]];b2=pos2}else{const d=(tt-hitT)*.55,c1=[-2*rad0*Math.cos(al),-.42,start[2]];b1=[c1[0]+r.v1*Math.cos(rad(r.a1))*d,-.42,c1[2]+r.v1*Math.sin(rad(r.a1))*d];b2=[r.v2*Math.cos(rad(r.a2))*d,-.42,r.v2*Math.sin(rad(r.a2))*d]}
  s.ball(b1,rad0,'#f4f4ee');s.ball(b2,rad0,'#d23b3b');s.shadow(b1,rad0,-.6,.4);s.shadow(b2,rad0,-.6,.4);s.render()},
 assumption:'Equal smooth spheres; no spin or table friction; impulse acts along the line of centres.'});
function collide(p){const al=Math.asin(p.b),un=p.u*Math.cos(al),ut=p.u*Math.sin(al),v1n=un*(1-p.e)/2,v2n=un*(1+p.e)/2;const v1=Math.hypot(v1n,ut),v2=v2n;
  const a2=deg(al),n=[Math.cos(al),Math.sin(al)],tv=[Math.sin(al),-Math.cos(al)],v1v=[v1n*n[0]+ut*tv[0],v1n*n[1]+ut*tv[1]],a1=deg(Math.atan2(v1v[1],v1v[0]));return{v1,v2,a1,a2,loss:1-(v1*v1+v2*v2)/(p.u*p.u)}}

add({base:'energy',id:'hill-climb-power',title:'Engine power on a hill',
 description:'Find the top speed a car can hold up a slope when its engine power is limited.',
 formula:'v_max = P / (mg sinθ + f)',
 observe:'At top speed all the engine power goes into lifting the car and overcoming resistance.',
 tryText:'Double the slope angle. Does the top speed halve?',
 controls:[R('P','Engine power',10,150,1,60,'kW'),R('m','Car mass',800,2500,50,1200,'kg'),R('th','Slope angle',0,15,.5,5,'°',1),R('fr','Resistive force',100,1000,10,400,'N')],
 metrics:p=>{const F=p.m*G*Math.sin(rad(p.th))+p.fr,v=p.P*1000/F;return[N('Top speed',v,'m/s',1),N('Top speed',v*3.6,'km/h',0),N('Power lifting the car',p.m*G*Math.sin(rad(p.th))*v/1000,'kW',1),N('Power against resistance',p.fr*v/1000,'kW',1)]},
 draw:(c,p,t)=>{const F=p.m*G*Math.sin(rad(p.th))+p.fr,v=p.P*1000/F,th=rad(p.th),s=P3.scene(c,{scale:56,cy:300,yaw:.3}),L=7,dir=[Math.cos(th),Math.sin(th),0],o=[-3.4,-1.4,0];s.floor(4,.5,-1.45);
  s.box(V.add(o,V.mul(dir,L/2)),[L,.1,1.6],'#3a3f46',{rotZ:th});for(let i=0;i<7;i++)s.box(V.add(V.add(o,V.mul(dir,.5+i)),[0,.06,0]),[.4,.02,.06],'#ffc36b',{rotZ:th});
  const u=.6+cycle(t*v*.04,L-1.2),cp=V.add(V.add(o,V.mul(dir,u)),[-Math.sin(th)*.3,Math.cos(th)*.3,0]);s.box(cp,[.9,.3,.55],'#d23b3b',{rotZ:th});s.box(V.add(cp,[-Math.sin(th)*.22,Math.cos(th)*.22,0]),[.5,.2,.5],'#9c2a2a',{rotZ:th});
  for(const dx of [-.3,.3])for(const dz of [-.28,.28])s.cyl(V.add(V.add(cp,V.mul(dir,dx)),[Math.sin(th)*.15,-Math.cos(th)*.15,dz]),[0,0,1],.12,.08,'#15191d');s.render();
  tag(c,`${f(v*3.6,0)} km/h at full power`,44,98,C.gold,16)},
 assumption:'Constant resistive force; engine delivers its full rated power to the wheels; visual speed scaled.'});

add({base:'energy',id:'variable-force-work',title:'Work done by a variable force',
 description:'A force that grows with displacement pushes a block. The work is the area under the F–x graph.',
 formula:'W = ∫F dx = F₀(x₂ − x₁) + ½k(x₂² − x₁²)',
 observe:'For a linearly increasing force, the area is a trapezium — average force times displacement.',
 tryText:'Set F₀ = 0. Compare the work from 0 → 1 m and 1 → 2 m.',
 controls:[R('F0','Initial force F₀',0,20,.5,5,'N',1),R('k','Force gradient k',0,20,.5,6,'N/m',1),R('x1','Start x₁',0,2,.1,.5,'m',1),R('x2','End x₂',.5,4,.1,3,'m',1)],
 metrics:p=>{const a=Math.min(p.x1,p.x2),b=Math.max(p.x1,p.x2),W=p.F0*(b-a)+.5*p.k*(b*b-a*a);return[N('Work done',W,'J'),N('Average force',W/Math.max(b-a,1e-9),'N'),N('Force at end',p.F0+p.k*b,'N',1)]},
 draw:(c,p,t)=>{const a=Math.min(p.x1,p.x2),b=Math.max(p.x1,p.x2),x=a+(b-a)*(.5-.5*Math.cos(t*1.4)),F=p.F0+p.k*x,s=P3.scene(c,{scale:56,cy:330,cx:300,pitch:.25}),X=v=>-3+v*1.3;
  s.box([-.3,-.6,0],[6,.1,1.2],'#3b5566');for(let i=0;i<=4;i++)s.label([X(i),-.6,.85],i+' m',C.muted,11);s.box([X(x),-.3,0],[.5,.5,.5],'#3d8fd1');s.arrow([X(x)-.3-F*.05,-.3,0],[X(x)-.27,-.3,0],C.gold,3,11,`F = ${f(F,1)} N`);s.render();
  chart(c,410,92,246,160,{title:'F–x graph (shaded = W)',xl:'x (m)',xmin:0,xmax:4,ymin:0,ymax:p.F0+p.k*4+1,series:[{fn:X=>p.F0+p.k*X,col:C.gold},{pts:[[a,0],[a,p.F0+p.k*a],[b,p.F0+p.k*b],[b,0]],col:C.mint,dash:[3,3]}],marker:[x,F]})},
 assumption:'Force along the displacement; frictionless track.'});

/* ---------- System of Particles and Rotational Motion ---------- */
add({base:'rotation',id:'rolling-race',title:'Rolling race: ring, disc, spheres',
 description:'Release four shapes of equal radius down the same incline. The moment of inertia decides the winner.',
 formula:'a = g sinθ / (1 + I/mR²)',
 observe:'The solid sphere wins because the smallest fraction of its energy goes into rotation.',
 tryText:'Change the slope angle. Does the finishing order ever change?',
 controls:[R('th','Incline angle',5,45,1,20,'°'),R('L','Incline length',1,6,.1,3,'m',1)],
 metrics:p=>{const s=Math.sin(rad(p.th));return[['Solid sphere',.4],['Disc',.5],['Hollow sphere',2/3],['Ring',1]].map(([n,b])=>N(n,Math.sqrt(2*p.L*(1+b)/(G*s)),'s'))},
 draw:(c,p,t)=>{const th=rad(p.th),s=P3.scene(c,{scale:56,cy:290,yaw:.4}),L=6,dir=[Math.cos(th),-Math.sin(th),0],o=[-3,1.6*Math.min(1,Math.sin(th)*2.6),0];s.floor(4,.5,o[1]-L*Math.sin(th)-.06);
  s.box(V.add(o,V.mul(dir,L/2)),[L,.1,3.4],'#6f5a44',{rotZ:-th});const shapes=[[.4,'#ffc36b','sphere'],[.5,'#42d9ca','disc'],[2/3,'#b89dff','hollow'],[1,'#ff857e','ring']];const tmax=Math.sqrt(2*p.L*2/(G*Math.sin(th)))+1,tt=cycle(t,tmax);
  shapes.forEach(([b,col,kind],i)=>{const a=G*Math.sin(th)/(1+b),d=Math.min(1,.5*a*tt*tt/p.L),z=-1.2+i*.8,cpos=V.add(V.add(o,V.mul(dir,.3+d*(L-.6))),[Math.sin(th)*.25,Math.cos(th)*.25,z]);
   if(kind==='disc')s.cyl(cpos,[0,0,1],.25,.16,col);else if(kind==='ring'){s.cyl(cpos,[0,0,1],.25,.12,col,{caps:false});s.ring(V.add(cpos,[0,0,.06]),[0,0,1],.25,col,3);s.ring(V.add(cpos,[0,0,-.06]),[0,0,1],.25,col,3)}else s.ball(cpos,.25,col,kind==='hollow'?{stroke:'#ffffff'}:{});
   s.label(V.add(cpos,[0,.5,0]),kind,col,12)});s.render()},
 assumption:'Rolling without slipping, no rolling resistance; all shapes released together from rest.'});

add({base:'rotation',id:'gyroscope',title:'Gyroscope precession',
 description:'Support a spinning wheel at one end of its axle. Gravity’s torque makes it precess instead of fall.',
 formula:'Ω = mgr / (Iω)',
 observe:'The torque changes the direction of the angular momentum, not its size — so the axle swings round.',
 tryText:'Halve the spin rate. What happens to the precession rate?',
 controls:[R('m','Wheel mass',.2,2,.1,.8,'kg',1),R('r','Pivot-to-wheel distance',.05,.3,.01,.15,'m',2),R('Rw','Wheel radius',.05,.2,.01,.1,'m',2),R('rpm','Spin rate',600,6000,100,2400,'rpm')],
 metrics:p=>{const I=.5*p.m*p.Rw**2,w=p.rpm*TAU/60,W=p.m*G*p.r/(I*w);return[N('Spin angular momentum',I*w,'kg m²/s',3),N('Gravity torque',p.m*G*p.r,'N m',3),N('Precession rate',W,'rad/s',3),N('Precession period',TAU/W,'s',1)]},
 draw:(c,p,t)=>{const I=.5*p.m*p.Rw**2,w=p.rpm*TAU/60,W=p.m*G*p.r/(I*w),phi=W*t,s=P3.scene(c,{scale:66,cy:270}),ax=[Math.cos(phi),0,Math.sin(phi)],arm=.8+p.r*6,top=[0,.9,0],wc=V.add(top,V.mul(ax,arm));s.floor(3,.5,-1.6);
  s.cyl([0,-.35,0],[0,1,0],.05,2.5,C.steel);s.cyl([0,-1.55,0],[0,1,0],.5,.1,'#5d7b8f');s.ball(top,.07,C.white);s.seg(top,V.add(top,V.mul(ax,arm+.2)),'#d7e2ea',3);
  const Rw=.3+p.Rw*3;s.cyl(wc,ax,Rw,.14,'#d9844a',{cap:'#e7a073'});const spin=t*Math.min(30,w*.02),[n,u,v]=[ax,[0,1,0],V.cross(ax,[0,1,0])];for(let i=0;i<3;i++){const a=spin+i*TAU/3;s.seg(V.add(wc,V.mul(ax,.08)),V.add(V.add(wc,V.mul(ax,.08)),V.add(V.mul(u,Rw*.9*Math.cos(a)),V.mul(v,Rw*.9*Math.sin(a)))),'#3b2b20',2)}
  s.arrow(wc,V.add(wc,V.mul(ax,.9)),C.mint,3,11,`L = Iω = ${f(.5*p.m*p.Rw**2*p.rpm*TAU/60,3)} kg·m²/s`);s.arrow(top,V.add(top,V.mul(V.cross([0,1,0],ax),-.7)),C.gold,3,11,`τ = mgr = ${f(p.m*9.8*p.r,2)} N·m`);s.ring([0,.9,0],[0,1,0],arm,'#42d9ca44',1.2,[4,5]);s.render()},
 assumption:'Fast-top approximation (spin angular momentum ≫ precession angular momentum); thin uniform disc; no nutation or friction.'});

add({base:'rotation',id:'yo-yo',title:'Yo-yo: rolling down a string',
 description:'Let a yo-yo unwind. Part of its energy goes into spinning, so it falls with a < g.',
 formula:'a = g / (1 + I/mr²),  I = ½MR²',
 observe:'A thinner axle (small r) means faster spin for the same fall, so the yo-yo falls more slowly.',
 tryText:'Halve the axle radius. How much smaller does the acceleration get?',
 controls:[R('r','Axle radius r',.3,2,.05,.6,'cm',2),R('Rd','Disc radius R',2,6,.1,3,'cm',1),R('m','Mass',.05,.5,.01,.1,'kg',2),R('h','String length',.3,1.5,.05,1,'m',2)],
 metrics:p=>{const a=G/(1+.5*(p.Rd/p.r)**2),T=p.m*(G-a);return[N('Acceleration',a,'m/s²',3),N('String tension',T,'N',3),N('Time to unwind',Math.sqrt(2*p.h/a),'s'),N('Speed at bottom',Math.sqrt(2*a*p.h),'m/s')]},
 draw:(c,p,t)=>{const a=G/(1+.5*(p.Rd/p.r)**2),Tf=Math.sqrt(2*p.h/a),tt=Math.min(cycle(t,Tf+.8),Tf),d=.5*a*tt*tt,s=P3.scene(c,{scale:62,cy:262}),y=1.8-.2-d/p.h*3.2;s.floor(3,.5,-1.9);
  s.box([0,2,0],[1.8,.12,.6],'#5d7b8f');s.seg([.12,1.94,0],[.12,y,0],C.white,1.5);const R=.25+p.Rd*.08,ang=d/(p.r/100);
  for(const z of [-.12,.12])s.cyl([0,y,z],[0,0,1],R,.12,'#d23b3b',{cap:'#ff6b6b'});s.cyl([0,y,0],[0,0,1],.06+p.r*.03,.14,C.steel);for(let i=0;i<3;i++){const q=ang+i*TAU/3;s.seg([0,y,.19],[R*.85*Math.cos(q),y+R*.85*Math.sin(q),.19],'#ffffff',2)}
  s.shadow([0,y,0],R,-1.9,.35);s.render();tag(c,`a = ${f(a,2)} m/s² (g = 9.81)`,44,98,C.gold,15)},
 assumption:'Yo-yo modelled as a uniform disc; string vertical and does not slip; axle mass included in the disc.'});

add({base:'rotation',id:'centre-of-mass-3d',title:'Centre of mass of three masses',
 description:'Change three masses on a light triangular plate. The plate balances only on its centre of mass.',
 formula:'r_cm = Σ mᵢ rᵢ / Σ mᵢ',
 observe:'The centre of mass moves toward the heavier masses and always stays inside the triangle.',
 tryText:'Make one mass much heavier than the others.',
 controls:[R('m1','Mass A',.5,10,.5,2,'kg',1),R('m2','Mass B',.5,10,.5,2,'kg',1),R('m3','Mass C',.5,10,.5,2,'kg',1)],
 metrics:p=>{const r=cm3(p);return[N('x_cm',r[0],'m'),N('z_cm',r[2],'m'),N('Total mass',p.m1+p.m2+p.m3,'kg',1)]},
 draw:(c,p,t)=>{const r=cm3(p),s=P3.scene(c,{scale:62,cy:290}),pts=[[-2,0,-1],[2,0,-1],[0,0,1.8]];s.floor(3,.5,-1.2);s.poly(pts.map(q=>[q[0],-.1,q[2]]),'#7baaff55',{normal:[0,1,0],stroke:'#7baaff'});
  [p.m1,p.m2,p.m3].forEach((m,i)=>{const rr=.12+.06*Math.cbrt(m)*2;s.ball([pts[i][0],-.1+rr,pts[i][2]],rr,['#ff857e','#ffc36b','#42d9ca'][i],{label:'ABC'[i]+' '+m+' kg'})});
  s.cyl([r[0],-.65,r[2]],[0,1,0],.03,1.1,C.white);s.ball([r[0],-.08,r[2]],.07,C.purple,{glow:true});s.label([r[0],.4,r[2]],'CM',C.purple,14);s.shadow([r[0],0,r[2]],.25,-1.2,.3);s.render()},
 assumption:'Point masses on a massless rigid plate at A(−2, −1), B(2, −1), C(0, 1.8) m.'});
function cm3(p){const M=p.m1+p.m2+p.m3,pts=[[-2,0,-1],[2,0,-1],[0,0,1.8]];return[0,1,2].map(k=>(p.m1*pts[0][k]+p.m2*pts[1][k]+p.m3*pts[2][k])/M)}

add({base:'rotation',id:'topple-or-slide',title:'Topple or slide?',
 description:'Push a tall block with a growing force. It either slides first or tips over its front edge first.',
 formula:'Slides at F = μmg ;  tips at F = mg (b/2) / h_F',
 observe:'Pushing higher or using a narrower block makes tipping happen before sliding.',
 tryText:'Push at the top of a tall, narrow block on a high-friction floor.',
 controls:[R('b','Block width',.2,1,.05,.4,'m',2),R('H','Block height',.4,2,.05,1.2,'m',2),R('hf','Push height (fraction of H)',.1,1,.05,.8,'',2),R('mu','Floor friction μ',.1,1,.05,.6,'',2)],
 metrics:p=>{const m=10,Fs=p.mu*m*G,Ft=m*G*p.b/2/(p.hf*p.H);return[N('Force to slide (10 kg)',Fs,'N',1),N('Force to tip (10 kg)',Ft,'N',1),N('Result',Ft<Fs?'Tips over first':'Slides first')]},
 draw:(c,p,t)=>{const m=10,Fs=p.mu*m*G,Ft=m*G*p.b/2/(p.hf*p.H),tips=Ft<Fs,ph=cycle(t,4),k=1.5,s=P3.scene(c,{scale:60,cy:310});s.floor(3.5,.5,-1.6);
  const W=p.b*k,H=p.H*k,prog=clamp((ph-1)/2,0,1);let ang=0,dx=0;if(tips)ang=-prog*Math.min(PI/2,.25+Math.atan2(W,H));else dx=prog*1.6;
  const pivot=[W/2+dx,-1.6,0],ctr=[dx,-1.6+H/2,0],rel=V.sub(ctr,pivot),rot=[rel[0]*Math.cos(ang)-rel[1]*Math.sin(ang),rel[0]*Math.sin(ang)+rel[1]*Math.cos(ang),0];s.box(V.add(pivot,rot),[W,H,.7],'#3d8fd1',{rotZ:ang});
  const hp=[-W/2+dx-.05,-1.6+p.hf*H,0],F=Math.min(Fs,Ft)*Math.min(1,ph/1);s.arrow([hp[0]-.2-F*.012,hp[1],0],[hp[0],hp[1],0],C.gold,3,11,`F = ${f(F,1)} N`);s.render();tag(c,tips?'Tips over its front edge':'Slides along the floor',44,98,tips?C.red:C.mint,16)},
 assumption:'Rigid uniform block of mass 10 kg; horizontal push; static friction μ; tipping about the front lower edge.'});

/* ---------- Gravitation ---------- */
add({base:'gravity',id:'geostationary',title:'Geostationary orbit',
 description:'Pick an orbital period and find the radius where a satellite keeps pace with the turning Earth.',
 formula:'r = (GMT² / 4π²)^(1/3)',
 observe:'At T = 1 sidereal day (23.93 h) the satellite stays above the same point on the equator.',
 tryText:'Set T = 12 h (GPS-like). How does the radius compare?',
 controls:[R('T','Orbital period',2,48,.01,23.93,'h',2),R('M','Planet mass',.2,5,.05,1,'× Earth',2)],
 metrics:p=>{const GM=3.986e14*p.M,T=p.T*3600,r=Math.cbrt(GM*T*T/(4*PI*PI));return[N('Orbit radius',r/1000,'km',0),N('Altitude above Earth radius',(r-6.371e6)/1000,'km',0),N('Orbital speed',TAU*r/T/1000,'km/s',2),N('Synchronous?',r<6.371e6?'Impossible — inside the planet':Math.abs(p.T-23.93)<.05&&p.M===1?'Yes — geostationary':'No')]},
 draw:(c,p,t)=>{const GM=3.986e14*p.M,T=p.T*3600,r=Math.cbrt(GM*T*T/(4*PI*PI)),s=P3.scene(c,{scale:60,cy:262,pitch:.25}),k=1.15/6.371e6,rs=Math.min(3.8,1.05*Math.pow(r/6.371e6,.62)),hrs=t*2,spinE=TAU*hrs/23.93,spinS=TAU*hrs/p.T;
  for(let i=0;i<40;i++){const a=i*2.4,b=i*1.3;s.ball([4.5*Math.cos(a)*Math.sin(b),3*Math.cos(b),-3-Math.abs(4*Math.sin(a))],.02,'#ffffff',{flat:true})}
  s.ball([0,0,0],1.05,'#2f6db0');for(let i=0;i<6;i++){const a=spinE+i*PI/6;const pts=[];for(let j=0;j<=24;j++){const b=-PI/2+PI*j/24;pts.push([1.06*Math.cos(b)*Math.cos(a),1.06*Math.sin(b),1.06*Math.cos(b)*Math.sin(a)])}s.curve(pts.filter(q=>true),'#9fd0ff55',1,4)}
  s.ring([0,0,0],[0,1,0],1.07,'#ffc36b88',1.5);const mark=[1.07*Math.cos(spinE),0,1.07*Math.sin(spinE)];s.ball(mark,.07,C.red);s.ring([0,0,0],[0,1,0],rs,'#42d9ca55',1.2,[5,5]);
  const sat=[rs*Math.cos(spinS),0,rs*Math.sin(spinS)];s.box(sat,[.16,.16,.16],C.white);s.box(V.add(sat,[0,0,0]),[.04,.02,.7],'#3d6fd1',{rotY:-spinS});s.seg([0,0,0],sat,'#ffffff22',1);s.render();
  tag(c,'1 s on screen = 2 h.  Red dot: fixed point on the equator.',44,98,C.muted,13)},
 assumption:'Circular equatorial orbit; GM_Earth = 3.986 × 10¹⁴ m³/s²; distances compressed for display.'});

done();
})();
