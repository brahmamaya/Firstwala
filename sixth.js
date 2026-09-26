/* 28 further experiments. SI calculations; schematic diagrams and explicitly labelled scales. */
(() => {
'use strict';
const {C,text,line,rr,dot,arrow,arc,path,measure,cart}=window.PhysicaDrawing;
const PI=Math.PI,TAU=2*PI,G=9.81,rad=a=>a*PI/180;
const R=(key,label,min,max,step,initial,unit='',digits=0)=>({key,label,min,max,step,initial,unit,digits});
const S=(key,label,initial,options)=>({key,label,initial,options});
const f=(v,n=2)=>Math.abs(v)<1e-10?'0':Number(v).toFixed(n);
const N=(label,v,unit='')=>({label,value:typeof v==='number'?`${f(v)} ${unit}`.trim():String(v)});
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),cycle=(t,n)=>(t%n+n)%n;
const entries=[];
function add(base,id,title,description,formula,observe,tryText,controls,metrics,renderer,assumption){
  const s={base,id,title,description,formula,observe,try:tryText,controls,metrics,renderer,draw:id};entries.push(s);
  const numeric=controls.filter(c=>!c.options),last=numeric[numeric.length-1];
  window.SimulationLessons[id]={worked:(p,t)=>metrics(p,t).map(m=>m.label+': '+m.value).join(' · '),assumption,
    presets:[{label:'Starting values',values:Object.fromEntries(controls.map(c=>[c.key,c.initial]))},
      {label:'Explore minimum '+last.label.toLowerCase(),values:{[last.key]:last.min}},
      {label:'Explore maximum '+last.label.toLowerCase(),values:{[last.key]:last.max}}]};
}
function plot(c,fn,xmin,xmax,marker,xlabel,ylabel,col=C.mint){
  const values=Array.from({length:161},(_,i)=>[xmin+(xmax-xmin)*i/160,fn(xmin+(xmax-xmin)*i/160)]);
  const lo=Math.min(0,...values.map(v=>v[1])),hi=Math.max(1e-9,...values.map(v=>v[1])),span=(hi-lo)||1;
  const X=x=>100+(x-xmin)/(xmax-xmin)*500,Y=y=>350-(y-lo)/span*190;
  for(let i=0;i<=4;i++){const y=lo+span*i/4;line(c,100,Y(y),600,Y(y),C.line,1,[3,4]);text(c,Math.abs(y)>=10000?y.toExponential(1):f(y,Math.abs(y)<1?3:1),90,Y(y),C.muted,12,'right');text(c,f(xmin+(xmax-xmin)*i/4,1),100+125*i,373,C.muted,12,'center');}
  line(c,100,350,600,350,C.muted);line(c,100,155,100,350,C.muted);
  path(c,values.map(([x,y])=>[X(x),Y(y)]),col,3);
  const xx=X(marker),yy=Y(fn(marker));line(c,xx,350,xx,yy,C.gold,1,[4,4]);dot(c,xx,yy,6,C.gold,true);
  text(c,ylabel,100,122,col,16);text(c,xlabel,350,400,C.muted,13,'center');
}
function title(c,s){text(c,s,80,105,C.gold,17);}
function spring(c,x1,y,x2,col=C.mint){const pts=[[x1,y]];for(let i=1;i<24;i++)pts.push([x1+(x2-x1)*i/24,y+(i%2?10:-10)]);pts.push([x2,y]);path(c,pts,col,2);}

add('units','speed-uncertainty','Uncertainty in measured speed','Measure a journey and compare how distance and timing errors affect the calculated speed.','Δv/v ≈ Δs/s + Δt/t','A short timing interval magnifies the effect of a fixed stopwatch uncertainty.','Double the measured time with the same timing uncertainty.',
 [R('distance','Measured distance',5,100,1,40,'m'),R('time','Measured time',1,20,.5,5,'s',1),R('error','Timing uncertainty',.01,.5,.01,.1,'s',2)],
 p=>[N('Measured speed',p.distance/p.time,'m/s'),N('Worst-case uncertainty',(p.distance/p.time)*(.1/p.distance+p.error/p.time),'m/s'),N('Relative uncertainty',100*(.1/p.distance+p.error/p.time),'%')],
 (c,p,t)=>{plot(c,x=>100*(.1/p.distance+p.error/x),1,20,p.time,'Timing interval / s','Relative speed uncertainty / %');},
 'Distance uncertainty is fixed at ±0.10 m. Independent worst-case first-order uncertainties are added; higher-order terms are neglected.');

add('kinematics','catch-up','The catch-up problem','Release a faster cart after a delay and find where it catches a moving target.','tcatch = vfast·delay / (vfast − vslow)','Even a faster cart takes longer to catch a target if its start is delayed.','Increase the delay and compare the meeting distance.',
 [R('slow','Target speed',1,8,.5,4,'m/s',1),R('extra','Extra pursuit speed',1,10,.5,3,'m/s',1),R('delay','Start delay',0,5,.5,2,'s',1)],
 p=>{const tc=(p.slow+p.extra)*p.delay/p.extra;return[N('Meeting time',tc,'s'),N('Meeting position',p.slow*tc,'m'),N('Pursuer speed',p.slow+p.extra,'m/s')];},
 (c,p,t)=>{const tc=(p.slow+p.extra)*p.delay/p.extra,q=Math.min(cycle(t,tc+2),tc),scale=440/Math.max(10,p.slow*tc);for(const [y,d,col,lab] of [[215,p.slow*q,C.mint,'Target'],[325,(p.slow+p.extra)*Math.max(0,q-p.delay),C.gold,'Pursuer']]){line(c,80,y+15,630,y+15,C.line,2);cart(c,115+d*scale,y,lab,col);}title(c,`Time from target start: ${f(q)} s`);},
 'Both carts have constant speed after instantaneous starts and move along parallel straight tracks; the diagram resets after they meet.');

add('projectile','projectile-incline','Projectile landing on a slope','Launch above a hillside and locate the point where the projectile meets the rising ground.','t = 2v(sinθ − cosθ tanβ)/g','A rising landing surface shortens flight time compared with level ground.','Steepen the slope while keeping the angle above the slope fixed.',
 [R('speed','Launch speed',5,30,1,18,'m/s'),R('slope','Hill slope β',0,35,1,15,'°'),R('above','Angle above hill',5,45,1,25,'°')],
 p=>{const a=rad(p.slope+p.above),b=rad(p.slope),T=2*p.speed*(Math.sin(a)-Math.cos(a)*Math.tan(b))/G;return[N('Flight time',T,'s'),N('Distance up slope',p.speed*Math.cos(a)*T/Math.cos(b),'m'),N('Launch angle',p.slope+p.above,'°')];},
 (c,p,t)=>{const a=rad(p.slope+p.above),b=rad(p.slope),T=2*p.speed*(Math.sin(a)-Math.cos(a)*Math.tan(b))/G,range=p.speed*Math.cos(a)*T,maxH=p.speed**2*Math.sin(a)**2/(2*G),scale=Math.min(440/Math.max(range,1),230/Math.max(maxH,1)),X=q=>100+p.speed*Math.cos(a)*q*scale,Y=q=>375-(p.speed*Math.sin(a)*q-.5*G*q*q)*scale;line(c,90,375,610,375-520*Math.tan(b),C.muted,3);path(c,Array.from({length:81},(_,i)=>[X(T*i/80),Y(T*i/80)]),C.mint,2);const q=Math.min(cycle(t,T+1),T);dot(c,X(q),Y(q),10,C.gold,true);title(c,`Hill ${p.slope}° · launch ${p.slope+p.above}°`);},
 'Uniform gravity, no air resistance, infinitely long straight uphill slope. Launch angle is always above the slope. Equal spatial scale on both axes.');

add('forces','two-rope-support','A load held by two ropes','Change the symmetry of two supporting ropes and calculate their tensions.','T₁ cosα = T₂ cosβ; T₁ sinα + T₂ sinβ = mg','Flatter support ropes need larger tension to hold the same weight.','Set both angles to 30° and compare each tension with the weight.',
 [R('mass','Hanging mass',1,30,1,10,'kg'),R('left','Left rope angle',10,80,1,40,'°'),R('right','Right rope angle',10,80,1,50,'°')],
 p=>{const a=rad(p.left),b=rad(p.right),d=Math.sin(a+b);return[N('Left tension',p.mass*G*Math.cos(b)/d,'N'),N('Right tension',p.mass*G*Math.cos(a)/d,'N'),N('Weight',p.mass*G,'N')];},
 (c,p)=>{const x=345,y=285;for(const [a,sign,col] of [[rad(p.left),-1,C.mint],[rad(p.right),1,C.gold]]){const X=x+sign*195*Math.cos(a),Y=y-195*Math.sin(a);line(c,x,y,X,Y,col,3);rr(c,X-18,Y-8,36,12,C.line,C.muted,2);arrow(c,x,y,x+sign*90*Math.cos(a),y-90*Math.sin(a),col,3);}line(c,x,y,x,y+25,C.white);rr(c,x-35,y+25,70,45,C.blue+'55',C.blue);text(c,`${p.mass} kg`,x,y+48,C.white,17,'center');arrow(c,x+60,y+40,x+60,y+95,C.red,3);title(c,'Angles are measured above horizontal');},
 'Massless inextensible ropes and a point junction in static equilibrium; no acceleration or rope stretch.');

add('energy','ballistic-pendulum','Ballistic pendulum','Embed a projectile in a suspended block and infer the height it can swing.','mu = (M+m)V; h = V²/(2g)','Momentum is conserved in impact, but kinetic energy is not.','Increase the block mass and watch the swing height fall.',
 [R('projectile','Projectile mass',.01,.2,.01,.05,'kg',2),R('block','Block mass',.5,5,.1,1,'kg',1),R('speed','Impact speed',10,80,1,40,'m/s')],
 p=>{const V=p.projectile*p.speed/(p.projectile+p.block);return[N('Speed after impact',V,'m/s'),N('Rise height',V*V/(2*G),'m'),N('Energy retained',100*p.projectile/(p.projectile+p.block),'%')];},
 (c,p,t)=>{const V=p.projectile*p.speed/(p.projectile+p.block),h=V*V/(2*G),L=Math.max(2,h*1.2),A=Math.acos(1-h/L),q=cycle(t,5),a=q<1?0:A*Math.sin((q-1)*PI/4),x=350+200*Math.sin(a),y=140+200*Math.cos(a);line(c,350,140,x,y,C.muted,3);dot(c,350,140,5,C.white);rr(c,x-30,y-22,60,44,C.blue+'55',C.blue);if(q<1)dot(c,90+q*230,340,6,C.gold);else dot(c,x-15,y,6,C.gold);title(c,`Rise = ${f(h,3)} m · schematic swing`);},
 'Completely inelastic instantaneous impact followed by lossless pendulum motion. String length adapts for illustration; timing is slowed.');

add('rotation','parallel-axis','Parallel-axis theorem','Move a rotation axis away from the centre of a uniform disc and feel its growing inertia.','I = ½mR² + md²','Moving the axis away adds inertia in proportion to the square of the offset.','Set the offset equal to the radius and compare with the central axis.',
 [R('mass','Disc mass',1,10,1,3,'kg'),R('radius','Disc radius',.2,1,.1,.5,'m',1),R('offset','Axis offset',0,1.5,.1,.5,'m',1)],
 p=>[N('Central inertia',.5*p.mass*p.radius**2,'kg·m²'),N('Offset inertia',p.mass*(.5*p.radius**2+p.offset**2),'kg·m²'),N('Added inertia',p.mass*p.offset**2,'kg·m²')],
 (c,p,t)=>{const x=335,y=265,r=p.radius*100,d=p.offset*100;arc(c,x,y,r,0,TAU,C.mint,4);dot(c,x,y,5,C.white);line(c,x,y,x+d,y,C.gold,2,[4,4]);dot(c,x+d,y,8,C.gold,true);text(c,'C',x,y+25,C.muted,15,'center');text(c,'new axis',x+d,y-25,C.gold,15,'center');measure(c,x,y+130,x+d,y+130,`d = ${p.offset} m`);title(c,'Same disc · different axis');},
 'Uniform thin disc. The new axis is perpendicular to the disc and parallel to its central symmetry axis.');

add('gravity','hohmann-transfer','Hohmann orbital transfer','Plan two engine burns to transfer between circular Earth orbits.','vtransfer = √[μ(2/r − 1/a)]','Higher target orbits need a longer coast time between the two burns.','Raise the target altitude and compare total delta-v.',
 [R('low','Initial altitude',200,1000,50,300,'km'),R('high','Target altitude',1500,36000,500,20000,'km')],
 p=>{const r=6371+p.low,R=6371+p.high,a=(r+R)/2,mu=398600;return[N('Total delta-v',Math.sqrt(mu*(2/r-1/a))-Math.sqrt(mu/r)+Math.sqrt(mu/R)-Math.sqrt(mu*(2/R-1/a)),'km/s'),N('Coast time',PI*Math.sqrt(a**3/mu)/60,'min'),N('Target speed',Math.sqrt(mu/R),'km/s')];},
 (c,p,t)=>{const r=6371+p.low,R=6371+p.high,scale=125/R,cx=345,cy=265,ra=r*scale,rb=R*scale,a=(ra+rb)/2,b=Math.sqrt(ra*rb),offset=(rb-ra)/2;dot(c,cx,cy,6371*scale,C.blue);arc(c,cx,cy,ra,0,TAU,C.line,2);arc(c,cx,cy,rb,0,TAU,C.mint,2);c.beginPath();c.ellipse(cx+offset,cy,a,b,0,0,TAU);c.strokeStyle=C.gold;c.lineWidth=2;c.stroke();const q=PI-cycle(t,8)/8*PI;dot(c,cx+offset+a*Math.cos(q),cy-b*Math.sin(q),6,C.gold,true);title(c,'Gold: transfer ellipse · mint: target orbit');},
 'Two instantaneous tangential burns, spherical Earth, coplanar circular starting and target orbits. Animated marker is schematic, not a uniform-time orbital solution.');

add('hooke','shear-deformation','Shear deformation','Push sideways on a bonded block and connect shear stress to angular deformation.','Δx = Fh/(AG)','A taller block shifts farther under the same shear force.','Double the shear modulus to halve the displacement.',
 [R('force','Shear force',100,1000,50,400,'N'),R('height','Block height',.1,1,.1,.4,'m',1),R('modulus','Shear modulus',.2,5,.1,1,'MPa',1)],
 p=>[N('Top displacement',p.force*p.height/(.01*p.modulus*1e6)*1000,'mm'),N('Shear stress',p.force/.01/1000,'kPa'),N('Shear strain',p.force/(.01*p.modulus*1e6))],
 (c,p)=>{const shift=clamp(p.force/(.01*p.modulus*1e6)*300,0,150),h=80+p.height*130;c.beginPath();c.moveTo(210,360);c.lineTo(460,360);c.lineTo(460+shift,360-h);c.lineTo(210+shift,360-h);c.closePath();c.fillStyle=C.mint+'33';c.fill();c.strokeStyle=C.mint;c.lineWidth=2;c.stroke();line(c,180,362,590,362,C.muted,3);arrow(c,300+shift,340-h,390+shift,340-h,C.gold,3);title(c,'Displacement magnified · bonded lower face');},
 'Linear elastic shear with fixed area 0.01 m² and uniformly distributed force. Visual displacement is magnified.');

add('buoyancy','capillary-rise','Capillary rise and depression','Dip a narrow tube in a liquid and see surface tension lift or depress the meniscus.','h = 2γ cosθ/(ρgr)','A smaller tube produces a larger rise; a non-wetting liquid is depressed.','Move the contact angle past 90°.',
 [R('radius','Tube radius',.2,3,.1,1,'mm',1),R('angle','Contact angle',0,150,5,30,'°'),R('tension','Surface tension',20,80,1,72,'mN/m')],
 p=>[N('Height relative to surface',2*(p.tension/1000)*Math.cos(rad(p.angle))/(1000*G*p.radius/1000)*1000,'mm'),N('Wetting',p.angle<90?'Rise':p.angle>90?'Depression':'No rise')],
 (c,p)=>{const h=2*(p.tension/1000)*Math.cos(rad(p.angle))/(1000*G*p.radius/1000)*1000,Y=270-clamp(h*2,-90,140),w=12+p.radius*9;rr(c,150,270,430,100,C.blue+'33',C.blue,3);rr(c,340-w/2,125,w,235,'#102638',C.muted,2);rr(c,343-w/2,Y,w-6,360-Y,C.mint+'66',null,0);line(c,343-w/2,Y,337+w/2,Y,C.mint,3);line(c,390,270,390,Y,C.gold,2);title(c,`${p.angle}° contact angle · height magnified`);},
 'Static equilibrium, cylindrical tube, density 1000 kg/m³, uniform surface tension; height is relative to the outer liquid surface.');

add('expansion','thermal-radiation','Net thermal radiation','Compare radiation emitted by a warm surface with radiation absorbed from its surroundings.','Pnet = εσA(T⁴ − Ta⁴)','Radiative heat transfer depends on absolute temperature to the fourth power.','Set the surface colder than the room to reverse heat flow.',
 [R('temperature','Surface temperature',200,1000,10,500,'K'),R('ambient','Surroundings',200,500,10,300,'K'),R('emissivity','Emissivity',.1,1,.05,.8,'',2)],
 p=>[N('Net outward power',p.emissivity*5.670374e-8*.1*(p.temperature**4-p.ambient**4),'W'),N('Emitted power',p.emissivity*5.670374e-8*.1*p.temperature**4,'W'),N('Heat flow',p.temperature>p.ambient?'To surroundings':p.temperature<p.ambient?'Into surface':'Balanced')],
 (c,p)=>plot(c,T=>p.emissivity*5.670374e-8*.1*(T**4-p.ambient**4),200,1000,p.temperature,'Surface temperature / K','Net outward power / W'),
 'Grey body of area 0.10 m² in large isothermal surroundings; conduction and convection are excluded.');

add('thermo','isothermal-entropy','Entropy in isothermal expansion','Expand an ideal gas reversibly at constant temperature and connect heat to entropy.','ΔS = nR ln(Vf/Vi); Qrev = TΔS','Compression decreases gas entropy and releases heat to the reservoir.','Set the volume ratio below one.',
 [R('ratio','Final / initial volume',.25,4,.05,2,'×',2),R('moles','Amount of gas',.5,3,.1,1,'mol',1),R('temperature','Temperature',200,600,10,300,'K')],
 p=>{const ds=p.moles*8.314*Math.log(p.ratio);return[N('Gas entropy change',ds,'J/K'),N('Heat absorbed',p.temperature*ds,'J'),N('Internal energy change','0 J')];},
 (c,p)=>{plot(c,r=>p.moles*8.314*Math.log(r),.25,4,p.ratio,'Volume ratio Vf / Vi','Gas entropy change / J K⁻¹');},
 'Reversible isothermal ideal-gas process. Reservoir entropy changes by the opposite amount, so total entropy does not increase in this ideal limit.');

add('kinetic','sound-speed-gas','Speed of sound in a gas','Compare the sound speed in gases with different molar masses and heat-capacity ratios.','c = √(γRT/M)','Lighter gases transmit small pressure disturbances faster at the same temperature.','Compare helium with air at 300 K.',
 [S('gas','Gas','air',[['air','Air'],['helium','Helium'],['co2','Carbon dioxide']]),R('temperature','Temperature',200,600,10,300,'K')],
 p=>{const [M,gamma]={air:[.02897,1.4],helium:[.004003,5/3],co2:[.04401,1.3]}[p.gas];return[N('Sound speed',Math.sqrt(gamma*8.314*p.temperature/M),'m/s'),N('Heat-capacity ratio',gamma),N('Molar mass',M*1000,'g/mol')];},
 (c,p,t)=>{const [M,gamma]={air:[.02897,1.4],helium:[.004003,5/3],co2:[.04401,1.3]}[p.gas],speed=Math.sqrt(gamma*8.314*p.temperature/M);for(let i=0;i<42;i++){const x=90+i*12,y=260;for(let j=-2;j<=2;j++)dot(c,x+7*Math.sin(i*.5-t*speed/120),y+j*24,3,C.mint);}title(c,`Small pressure wave · ${f(speed,1)} m/s`);text(c,'Particles oscillate; the disturbance travels',90,375,C.muted,16);},
 'Adiabatic small-amplitude sound in an ideal gas. Heat-capacity ratio is held constant for each gas; wave motion is slowed.');

add('pendulum','torsion-oscillator','Torsional oscillator','Twist a disc suspended by a wire and explore angular simple harmonic motion.','T = 2π√(I/κ)','A stiffer wire makes the disc oscillate faster.','Double the moment of inertia and compare the period.',
 [R('inertia','Moment of inertia',.1,2,.1,.5,'kg·m²',1),R('stiffness','Torsion constant',.2,4,.1,1,'N·m/rad',1),R('angle','Release twist',5,90,5,45,'°')],
 (p,t)=>{const w=Math.sqrt(p.stiffness/p.inertia),a=rad(p.angle)*Math.cos(w*t);return[N('Period',TAU/w,'s'),N('Angular displacement',a*180/PI,'°'),N('Restoring torque',-p.stiffness*a,'N·m')];},
 (c,p,t)=>{const a=rad(p.angle)*Math.cos(Math.sqrt(p.stiffness/p.inertia)*t),x=350,y=270;arc(c,x,y,95,0,TAU,C.mint,4);line(c,x,y-120,x,y+120,C.line,1,[4,4]);line(c,x-95*Math.cos(a),y-95*Math.sin(a),x+95*Math.cos(a),y+95*Math.sin(a),C.gold,4);dot(c,x,y,9,C.white);title(c,'Top view of the twisting disc');},
 'Linear restoring torque from an ideal massless wire, no damping; disc has the specified fixed rotational inertia.');

add('wave','pulse-reflection','Pulse reflection at a boundary','Send a pulse between two strings and compare its reflected amplitude and sign.','r = (Z₁ − Z₂)/(Z₁ + Z₂)','A larger outgoing impedance makes the reflected displacement invert.','Match the two impedances to eliminate reflection.',
 [R('z1','Incoming impedance',1,10,.5,3,'kg/s',1),R('z2','Outgoing impedance',1,10,.5,7,'kg/s',1),R('amplitude','Incident amplitude',.2,1,.1,.7,'units',1)],
 p=>{const r=(p.z1-p.z2)/(p.z1+p.z2);return[N('Reflection coefficient',r),N('Reflected energy',100*r*r,'%'),N('Transmitted energy',100*(1-r*r),'%')];},
 (c,p,t)=>{const r=(p.z1-p.z2)/(p.z1+p.z2),q=cycle(t,6),bound=360,speed1=90,speed2=90*p.z1/p.z2;line(c,bound,130,bound,375,C.gold,1,[4,4]);const pts=[];for(let x=80;x<=625;x+=2){let y=0;const bump=(z)=>Math.exp(-z*z/800);if(q<3&&x<=bound)y=p.amplitude*bump(x-(90+speed1*q));if(q>=3){if(x<=bound)y=p.amplitude*r*bump(x-(bound-speed1*(q-3)));else y=p.amplitude*(1+r)*bump(x-(bound+speed2*(q-3)));}pts.push([x,270-70*y]);}path(c,pts,C.mint,3);title(c,'Displacement pulse · no losses at the junction');text(c,'String 1',140,375,C.muted,15);text(c,'String 2',450,375,C.muted,15);},
 'Linear transverse pulses under the same string tension; string 2 speed follows the inverse impedance ratio. Pulse arrival timing and amplitudes are schematic near the junction.');

add('electrostatic','charged-ring-axis','Electric field on a ring axis','Move a probe along the axis of a uniformly charged ring and locate the strongest field.','E = kQx/(x² + R²)^(3/2)','The field is zero at the centre and peaks at x = R/√2.','Move the probe to about 0.71 times the ring radius.',
 [R('charge','Ring charge',1,10,1,3,'nC'),R('radius','Ring radius',.1,1,.1,.4,'m',1),R('position','Axial position',-2,2,.05,.5,'m',2)],
 p=>[N('Axial electric field',8.988*p.charge*p.position/(p.position**2+p.radius**2)**1.5,'N/C'),N('Positive-axis maximum',p.radius/Math.sqrt(2),'m'),N('Potential',8.988*p.charge/Math.hypot(p.position,p.radius),'V')],
 (c,p)=>plot(c,x=>8.988*p.charge*x/(x*x+p.radius*p.radius)**1.5,-2,2,p.position,'Axial position / m','Signed axial field / N C⁻¹'),
 'Infinitesimally thin uniformly charged ring in vacuum; the probe lies exactly on its symmetry axis.');

add('capacitor','isolated-dielectric','Dielectric in an isolated capacitor','Insert a dielectric into a charged capacitor after disconnecting its battery.','Q constant; V = Q/C; U = Q²/(2C)','Inserting a dielectric reduces both voltage and stored field energy when charge is fixed.','Compare fully inserted with fully removed dielectric.',
 [R('charge','Fixed charge',1,50,1,12,'µC'),R('dielectric','Dielectric constant',1,8,.5,4,'',1),R('fraction','Inserted area',0,100,5,50,'%')],
 p=>{const cap=2*(1+(p.dielectric-1)*p.fraction/100);return[N('Capacitance',cap,'µF'),N('Voltage',p.charge/cap,'V'),N('Stored energy',.5*p.charge**2/cap,'µJ')];},
 (c,p)=>{line(c,175,190,540,190,C.mint,6);line(c,175,320,540,320,C.mint,6);if(p.fraction)rr(c,177,195,360*p.fraction/100,120,C.purple+'55',C.purple,2);for(let i=0;i<8;i++){text(c,'+',195+i*45,165,C.gold,20,'center');text(c,'−',195+i*45,348,C.blue,20,'center');}title(c,`Battery disconnected · Q = ${p.charge} µC`);},
 'Empty capacitance 2 µF. Dielectric fills the plate gap over the selected area; edge fields and dielectric losses are neglected.');

add('circuit','electron-drift','Electron drift in a wire','Change wire thickness and current to see why electron drift is so slow.','vd = I/(neA)','A wider wire carries the same current with a lower electron drift speed.','Double the wire radius and see the drift speed fall to one quarter.',
 [R('current','Conventional current',.5,10,.5,3,'A',1),R('radius','Wire radius',.2,2,.1,1,'mm',1)],
 p=>[N('Drift speed',p.current/(8.5e28*1.602176634e-19*PI*(p.radius/1000)**2)*1000,'mm/s'),N('Current density',p.current/(PI*p.radius**2),'A/mm²'),N('Electron direction','Opposite conventional current')],
 (c,p,t)=>{const h=25+p.radius*30,v=p.current/(PI*p.radius**2);rr(c,90,255-h,520,2*h,C.gold+'22',C.gold,8);for(let i=0;i<30;i++)dot(c,105+cycle(i*73-t*v*9,490),255+(i%5-2)*h/3,3,C.mint);arrow(c,200,355,470,355,C.gold,3);text(c,'Conventional current',335,380,C.gold,15,'center');title(c,'Electron motion magnified; thermal motion omitted');},
 'Copper-like carrier density n = 8.5×10²⁸ m⁻³, uniform circular wire and steady current; animation shows drift only, highly magnified.');

add('lorentz','helical-particle','Helical motion in a magnetic field','Launch a proton at an angle to a magnetic field and separate circular and forward motion.','r = mv⊥/(qB); pitch = v∥·2πm/(qB)','A parallel velocity adds forward travel without altering the circular component.','Set the angle to 90° to get a circle with zero pitch.',
 [R('speed','Proton speed',1,10,.5,4,'×10⁵ m/s',1),R('field','Magnetic field',.1,1,.1,.4,'T',1),R('angle','Angle to field',0,90,5,45,'°')],
 p=>{const T=TAU*1.6726e-27/(1.6022e-19*p.field);return[N('Helix radius',p.speed*1e5*Math.sin(rad(p.angle))*T/TAU*100,'cm'),N('Pitch',p.speed*1e5*Math.cos(rad(p.angle))*T*100,'cm'),N('Period',T*1e9,'ns')];},
 (c,p,t)=>{const a=rad(p.angle),amp=Math.sin(a)*65,stretch=Math.cos(a)*80,phase=t*p.field*3,pts=[];for(let i=0;i<=240;i++){const q=i/240*TAU*3;pts.push([150+stretch*q/TAU+amp*.4*Math.cos(q),265-amp*Math.sin(q)]);}path(c,pts,C.mint,2);const q=cycle(phase,TAU*3);dot(c,150+stretch*q/TAU+amp*.4*Math.cos(q),265-amp*Math.sin(q),7,C.gold,true);arrow(c,110,375,600,375,C.blue,2);title(c,'Perspective helix · B points right');},
 'Non-relativistic proton in a uniform magnetic field, no electric field or collisions. Perspective and motion are schematic; numerical radius and pitch use SI units.');

add('magnet','dipole-field-ratio','Magnetic dipole: axis and equator','Move away from a small bar magnet and compare its axial and equatorial fields.','Baxis = 2μ₀m/(4πr³); Beq = μ₀m/(4πr³)','At equal distances, the axial field magnitude is twice the equatorial field.','Double the distance and watch both fields fall by a factor of eight.',
 [R('moment','Magnetic moment',.5,10,.5,3,'A·m²',1),R('distance','Distance from centre',.2,2,.1,.6,'m',1)],
 p=>[N('Axial field magnitude',.2*p.moment/p.distance**3,'µT'),N('Equatorial magnitude',.1*p.moment/p.distance**3,'µT'),N('Magnitude ratio','2 : 1')],
 (c,p)=>{plot(c,r=>.2*p.moment/r**3,.2,2,p.distance,'Distance / m','Axial field / µT');},
 'Ideal point magnetic dipole, valid at distances large compared with the physical magnet size. Field directions differ on axis and equator.');

add('induction','mutual-induction','Mutual induction between coils','Drive a changing current in one coil and measure the emf induced in its neighbour.','ε₂ = −M dI₁/dt','Only a changing primary current induces a secondary emf.','Reverse the current ramp and watch the induced polarity reverse.',
 [R('mutual','Mutual inductance',1,100,1,30,'mH'),R('rate','Primary current rate',-50,50,1,10,'A/s')],
 p=>[N('Secondary emf',-p.mutual*p.rate/1000,'V'),N('Current change in 0.1 s',p.rate*.1,'A'),N('Induction',p.rate===0?'None: steady current':'Opposes flux change')],
 (c,p,t)=>{for(const [x,col] of [[180,C.mint],[440,C.gold]])for(let i=0;i<6;i++){c.beginPath();c.ellipse(x+i*12,260,13,70,0,0,TAU);c.strokeStyle=col;c.lineWidth=2;c.stroke();}arrow(c,280,260,395,260,p.rate>=0?C.blue:C.red,3);if(p.rate)dot(c,290+cycle(t*Math.abs(p.rate)*6,100),260,4,C.white);title(c,`Induced voltage = ${f(-p.mutual*p.rate/1000)} V`);text(c,'Primary',190,370,C.mint,16);text(c,'Secondary',450,370,C.gold,16);},
 'Ideal linear mutual inductance. The specified primary current ramp is imposed externally; loading and coil resistance are excluded.');

add('ac','lc-energy-cycle','Energy exchange in an LC circuit','Watch a charged capacitor and an inductor exchange electric and magnetic energy.','ω = 1/√LC; UE + UB = constant','At maximum current, all stored energy is magnetic.','Increase inductance and compare the oscillation period.',
 [R('L','Inductance',10,200,10,50,'mH'),R('cap','Capacitance',10,200,10,100,'µF'),R('voltage','Initial voltage',1,20,1,10,'V')],
 (p,t)=>{const w=1/Math.sqrt(p.L/1000*p.cap/1e6),E=.5*p.cap/1e6*p.voltage**2,phase=w*t*.002;return[N('Oscillation frequency',w/TAU,'Hz'),N('Electric energy',1000*E*Math.cos(phase)**2,'mJ'),N('Magnetic energy',1000*E*Math.sin(phase)**2,'mJ')];},
 (c,p,t)=>{const w=1/Math.sqrt(p.L/1000*p.cap/1e6),q=Math.cos(w*t*.002)**2;for(const [y,a,col,lab] of [[205,q,C.gold,'Electric field'],[310,1-q,C.mint,'Magnetic field']]){text(c,lab,110,y-38,col,17);rr(c,110,y,460,28,'#102638',C.line,3);if(a>0)rr(c,110,y,460*a,28,col,null,3);}title(c,'Energy fractions · animation slowed 500×');},
 'Ideal isolated LC circuit, initially charged capacitor, zero resistance and no radiation losses. Animation and live energy readouts use time slowed by a factor of 500.');

add('emwave','em-field-intensity','Electric field and light intensity','Connect a plane wave’s peak electric field to its intensity and magnetic field.','Iavg = ½ε₀cE₀²; B₀ = E₀/c','Doubling the peak electric field quadruples the average intensity.','Compare electric-field amplitudes of 100 and 200 V/m.',
 [R('electric','Peak electric field',10,1000,10,200,'V/m'),R('area','Illuminated area',1,100,1,20,'cm²')],
 p=>{const I=.5*8.8541878e-12*299792458*p.electric**2;return[N('Average intensity',I,'W/m²'),N('Peak magnetic field',p.electric/299792458*1e6,'µT'),N('Power on area',I*p.area/1e4,'W')];},
 (c,p,t)=>{const a=20+p.electric*.075;path(c,Array.from({length:201},(_,i)=>[85+i*2.65,265-a*Math.sin(i*.075-t*2)]),C.mint,3);line(c,80,265,630,265,C.line,1);title(c,`E₀ = ${p.electric} V/m · transverse wave`);text(c,`Collecting area: ${p.area} cm²`,90,385,C.gold,16);},
 'Monochromatic sinusoidal plane wave in vacuum incident normally on the specified area; intensity is averaged over one cycle.');

add('lens','contact-lens-pair','Two thin lenses in contact','Combine converging and diverging lenses and discover their equivalent optical power.','Peq = P₁ + P₂; feq = 1/Peq','Equal and opposite powers cancel, making an afocal pair in the thin-lens limit.','Choose +5 D and −5 D to cancel the optical power.',
 [R('p1','First lens power',-10,10,.5,5,'D',1),R('p2','Second lens power',-10,10,.5,-2,'D',1)],
 p=>[N('Equivalent power',p.p1+p.p2,'D'),N('Focal length',p.p1+p.p2===0?'Infinite (afocal)':`${f(100/(p.p1+p.p2))} cm`),N('Combination',p.p1+p.p2>0?'Converging':p.p1+p.p2<0?'Diverging':'Afocal')],
 (c,p)=>{const P=p.p1+p.p2;line(c,70,260,635,260,C.line,1);for(const [x,col] of [[327,C.blue],[342,C.purple]])line(c,x,145,x,375,col,5);for(const h of [-60,60]){arrow(c,100,260+h,327,260+h,C.gold,2);line(c,342,260+h,610,260+h-h*P/10,C.mint,2);}title(c,`Combined power ${f(P,1)} D · ray directions schematic`);},
 'Ideal paraxial thin lenses in contact in air. Separation, aberrations, and finite lens thickness are neglected. Zero total power is handled as an afocal system.');

add('doubleslit','diffraction-grating','Diffraction grating orders','Pass monochromatic light through many equally spaced slits and locate the bright orders.','d sinθ = mλ','A denser grating spreads its allowed diffraction orders farther apart.','Increase the order until it can no longer exist.',
 [R('wavelength','Wavelength',400,700,10,550,'nm'),R('density','Grating density',100,1200,50,600,'lines/mm'),R('order','Diffraction order',0,4,1,1)],
 p=>{const s=p.order*p.wavelength*p.density*1e-6;return[N('Order angle',s<=1?`${f(Math.asin(s)*180/PI)}°`:'Order not allowed'),N('Maximum order',Math.floor(1/(p.wavelength*p.density*1e-6))),N('Slit spacing',1000/p.density,'µm')];},
 (c,p,t)=>{line(c,220,145,220,375,C.muted,5);arrow(c,80,260,213,260,C.gold,3);const max=Math.min(8,Math.floor(1/(p.wavelength*p.density*1e-6)));for(let m=-max;m<=max;m++){const a=Math.asin(clamp(m*p.wavelength*p.density*1e-6,-1,1)),col=Math.abs(m)===p.order?C.gold:C.mint;line(c,225,260,225+300*Math.cos(a),260-120*Math.sin(a),col,2);text(c,m,237+300*Math.cos(a),260-130*Math.sin(a),col,12);}title(c,'Bright orders · angles compressed for display');},
 'Ideal normal incidence on a many-slit grating in air. Only order positions are modelled, not finite-slit envelopes. At most eight orders per side are drawn.');

add('photoelectric','photon-counting','Counting photons in a light beam','Keep optical power fixed while changing wavelength and count arriving photons.','Ṅ = Pλ/(hc)','Longer wavelengths mean lower photon energy, so more photons carry the same power.','Double the wavelength at fixed optical power.',
 [R('power','Optical power',1,100,1,10,'mW'),R('wavelength','Wavelength',200,1000,10,500,'nm'),R('duration','Exposure time',1,10,1,3,'s')],
 p=>{const E=6.62607015e-34*299792458/(p.wavelength*1e-9),rate=p.power/1000/E;return[N('Photon energy',`${f(E/1.602176634e-19)} eV`),N('Photon arrival rate',`${rate.toExponential(3)} /s`),N('Photons in exposure',(rate*p.duration).toExponential(3))];},
 (c,p,t)=>{rr(c,530,165,28,190,C.blue+'44',C.blue);for(let i=0;i<16;i++){const x=100+cycle(t*(40+p.power)+i*29,420),y=195+(i%5)*30;dot(c,x,y,3,C.gold,true);}title(c,`${p.power} mW beam → detector`);text(c,'Each dot represents many photons',100,385,C.muted,15);},
 'Ideal monochromatic beam with constant optical power and perfect photon counting. No detector inefficiency or quantum shot noise.');

add('bohr','moseley-xray','Moseley’s characteristic X-rays','Change atomic number and estimate the K-alpha line emitted after an inner-shell vacancy.','EKα ≈ 10.2(Z − 1)² eV','Characteristic X-ray energy rises roughly with the square of screened nuclear charge.','Compare copper (Z = 29) with iron (Z = 26).',
 [R('Z','Atomic number',10,50,1,29),R('screening','Screening constant',.5,2,.1,1,'',1)],
 p=>{const E=10.2*(p.Z-p.screening)**2;return[N('K-alpha photon',E/1000,'keV'),N('Wavelength',1239.841984/E,'nm'),N('Effective nuclear charge',p.Z-p.screening)];},
 (c,p,t)=>{const x=340,y=270;dot(c,x,y,18,C.blue);arc(c,x,y,48,0,TAU,C.line,2);arc(c,x,y,110,0,TAU,C.mint,2);const q=cycle(t,4),r=q<1?110-62*q:48;dot(c,x+r,y,6,C.gold,true);if(q>1)path(c,Array.from({length:41},(_,i)=>[400+(q-1)*35+i*2,270+9*Math.sin(i*.5)]),C.gold,2);title(c,`Screened Bohr estimate · Z = ${p.Z}`);},
 'Approximate screened hydrogenic n=2 to n=1 transition, not precision atomic spectroscopy. Screening, many-electron interactions, and relativistic corrections are simplified.');

add('nuclear','radiometric-dating','Radiometric dating','Measure the remaining fraction of a radioactive parent and estimate the sample age.','t = T½ ln(N₀/N)/ln2','Every halving of the remaining parent adds one half-life to the estimated age.','Compare 50%, 25%, and 12.5% remaining.',
 [R('halfLife','Isotope half-life',100,10000,100,5700,'years'),R('remaining','Parent remaining',1,100,.5,25,'%',1)],
 p=>[N('Estimated age',-p.halfLife*Math.log2(p.remaining/100),'years'),N('Half-lives elapsed',-Math.log2(p.remaining/100)),N('Parent decayed',100-p.remaining,'%')],
 (c,p)=>plot(c,r=>-p.halfLife*Math.log2(r/100),1,100,p.remaining,'Parent isotope remaining / %','Estimated age / years'),
 'Closed system with known initial parent abundance and no later contamination; single isotope, constant decay rate, and perfect measurement.');

add('diode','transistor-switch','Transistor as a switch','Drive a transistor through a base resistor and see when a collector load is fully switched on.','IC ≈ min(βIB, (VCC − Vsat)/RC)','Once saturated, extra base current does not significantly increase load current.','Lower the base resistance until the transistor saturates.',
 [R('input','Input voltage',0,5,.1,3,'V',1),R('baseR','Base resistance',1,100,1,10,'kΩ'),R('gain','Current gain β',20,200,10,100)],
 p=>{const ib=Math.max(0,(p.input-.7)/(p.baseR*1000)),ic=Math.min(p.gain*ib,4.8/220);return[N('Base current',ib*1000,'mA'),N('Collector current',ic*1000,'mA'),N('State',ib===0?'Cut off':p.gain*ib>=4.8/220?'Saturated':'Active')];},
 (c,p,t)=>{const ib=Math.max(0,(p.input-.7)/(p.baseR*1000)),ic=Math.min(p.gain*ib,4.8/220);arc(c,350,260,55,0,TAU,C.blue,2);line(c,330,230,330,290,C.mint,4);line(c,330,240,370,205,C.mint,2);arrow(c,330,280,370,315,C.mint,2);line(c,120,260,330,260,C.gold,2);line(c,370,205,370,150,C.mint,2);line(c,370,315,370,365,C.mint,2);rr(c,350,115,40,35,C.gold+'44',C.gold,3);dot(c,500,255,22,ic>0?C.gold:C.line,ic>0);text(c,`${f(ic*1000,1)} mA`,500,305,C.gold,17,'center');title(c,'NPN switch · 5 V supply · 220 Ω collector load');},
 'Piecewise DC model: base-emitter drop 0.7 V, saturation voltage 0.2 V, fixed 5 V supply and 220 Ω collector resistor; temperature and switching transients excluded.');

window.ExtraSimulations.push(...entries);
const previous=window.PhysicsDraw.draw,byId=new Map(entries.map(s=>[s.id,s]));
window.PhysicsDraw.draw=(c,id,p,t)=>{const s=byId.get(id);if(!s)return previous(c,id,p,t);window.PhysicaRenderExperiment(c,s,p,t,s.renderer);};
window.PhysicsDraw.available.push(...byId.keys());
})();
