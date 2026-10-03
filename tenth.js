/* 3D pack 4 — 24 Class 12 experiments (electromagnetic waves to semiconductors).
   SI calculations; scenes are scaled teaching models with labelled values. */
(() => {
'use strict';
const {R,S,N,f,clamp,rad,deg,cycle,memo,tag,chart,pack,PI,TAU,G,C}=window.PhysicaLab;
const P3=window.Physica3D,{add,done}=pack();
const V=P3.vec,c0=299792458,eps0=8.8541878128e-12,h=6.62607015e-34,hbar=h/TAU,e=1.602176634e-19,me=9.1093837015e-31,mp=1.67262192e-27,NA=6.02214076e23,u=931.494;
const hash=i=>{const x=Math.sin(i*127.1+311.7)*43758.5453;return x-Math.floor(x)};
// Approximate visible colour of a vacuum wavelength (nm).
function spectral(nm){let r=0,g=0,b=0;if(nm>=380&&nm<440){r=(440-nm)/60;b=1}else if(nm<490){g=(nm-440)/50;b=1}else if(nm<510){g=1;b=(510-nm)/20}else if(nm<580){r=(nm-510)/70;g=1}else if(nm<645){r=1;g=(645-nm)/65}else if(nm<=780){r=1}else if(nm<380){r=.45;b=.75}else{r=.6}
  const k=nm<420?.3+.7*(nm-380)/40:nm>700?.3+.7*(780-nm)/80:1,q=x=>Math.round(255*clamp(x*Math.max(.3,k),0,1)).toString(16).padStart(2,'0');return'#'+q(r)+q(g)+q(b)}
const band=nm=>nm<10?'X-ray':nm<380?'Ultraviolet':nm<=780?'Visible':'Infrared';
function J1(x){let s=0;const n=48;for(let i=0;i<n;i++){const t=PI*(i+.5)/n;s+=Math.cos(t-x*Math.sin(t))}return s/n}
const airy=x=>{if(Math.abs(x)<1e-6)return 1;const v=2*J1(x)/x;return v*v};

/* ---------- Electromagnetic Waves ---------- */
add({base:'emwave',id:'em-wave-medium',title:'Light entering a medium (3D fields)',
 description:'Watch E and B oscillate at right angles as light travels into glass. Rotate the polarisation plane.',
 formula:'v = c/n,  λ = λ₀/n,  B₀ = nE₀/c',
 observe:'Frequency stays the same in the medium; speed and wavelength both drop by a factor n.',
 tryText:'Increase n. Watch the wave crests bunch up inside the medium.',
 controls:[R('n','Refractive index n',1,2.5,.01,1.5,'',2),R('lam','Vacuum wavelength',400,700,5,550,'nm'),R('pol','Polarisation angle',0,90,1,0,'°'),R('E0','Field amplitude E₀',10,1000,10,300,'V/m')],
 metrics:p=>[N('Speed in medium',c0/p.n/1e8,'× 10⁸ m/s',3),N('Wavelength in medium',p.lam/p.n,'nm',1),N('Frequency',c0/(p.lam*1e-9)/1e12,'THz',1),N('B₀ in medium',p.n*p.E0/c0*1e6,'μT',3)],
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:56,yaw:.65,pitch:.25}),col=spectral(p.lam),a=rad(p.pol),eD=[0,Math.cos(a),Math.sin(a)],bD=[0,-Math.sin(a),Math.cos(a)],k0=TAU/1.6,w=3;
  s.box([1.9,0,0],[3.4,2.6,2.6],'#7fc8e8',{alpha:.13});const E=[],B=[];for(let i=0;i<=90;i++){const x=-3.4+6.8*i/90,ph=x<.2?k0*(x+3.4):k0*3.6+k0*p.n*(x-.2),val=Math.sin(ph-w*t);E.push(V.add([x,0,0],V.mul(eD,val)));B.push(V.add([x,0,0],V.mul(bD,val*.75)))
   if(i%3===0){s.seg([x,0,0],V.add([x,0,0],V.mul(eD,val)),col+'99',1.3);s.seg([x,0,0],V.add([x,0,0],V.mul(bD,val*.75)),'#7baaff66',1.1)}}
  s.curve(E,col,2.6,6);s.curve(B,'#7baaff',2,6);s.arrow([-3.4,0,0],[3.6,0,0],'#8ca6b9',1.5,11,`v = c/n = ${f(3/p.n,2)}×10⁸ m/s`);s.label(V.add([-3,0,0],V.mul(eD,1.3)),'E',col,14);s.label(V.add([-3,0,0],V.mul(bD,1.1)),'B',C.blue,14);s.label([1.9,1.6,0],`n = ${p.n}`,C.white,13);s.render()},
 assumption:'Plane monochromatic wave at normal incidence on a non-magnetic, non-absorbing medium; reflection at the boundary not drawn.'});

add({base:'emwave',id:'dipole-antenna',title:'Radiation from a dipole antenna',
 description:'A half-wave dipole radiates most strongly at right angles to its length and not at all along it.',
 formula:'I(θ) ∝ sin²θ ;  f = c / 2L',
 observe:'The 3D radiation pattern is a doughnut wrapped around the antenna.',
 tryText:'Move the receiver angle towards 0°. What happens to the signal?',
 controls:[R('L','Antenna length L',.1,3,.05,1,'m',2),R('th','Receiver angle θ',0,90,1,60,'°')],
 metrics:p=>{const fq=c0/(2*p.L);return[N('Resonant frequency',fq/1e6,'MHz',1),N('Wavelength',2*p.L,'m',2),N('Relative intensity at θ',Math.sin(rad(p.th))**2*100,'%',1)]},
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:56,pitch:.3}),Lh=.8+p.L*.3;s.cyl([0,Lh/2+.05,0],[0,1,0],.05,Lh,C.steel);s.cyl([0,-Lh/2-.05,0],[0,1,0],.05,Lh,C.steel);s.box([0,0,0],[.2,.1,.2],'#2f3d48');
  for(let i=1;i<12;i++){const th=PI*i/12,r=2.4*Math.sin(th)**2;s.ring([0,r*Math.cos(th),0],[0,1,0],Math.max(.01,r*Math.sin(th)),'#42d9ca66',1.3)}
  for(let j=0;j<8;j++){const ph=TAU*j/8,pts=[];for(let i=0;i<=40;i++){const th=PI*i/40,r=2.4*Math.sin(th)**2;pts.push([r*Math.sin(th)*Math.cos(ph),r*Math.cos(th),r*Math.sin(th)*Math.sin(ph)])}s.path(pts,'#42d9ca44',1)}
  const th=rad(p.th),rr=3.2,rec=[rr*Math.sin(th),rr*Math.cos(th),0];s.seg([0,0,0],rec,C.gold,1.2,[4,4]);s.ball(rec,.12,C.gold,{label:`${f(Math.sin(th)**2*100,0)} %`});const pulse=cycle(t,1.2)/1.2;s.ring([0,0,0],[0,1,0],.3+pulse*3,'#ffc36b'+Math.round((1-pulse)*150).toString(16).padStart(2,'0'),1.5);s.render()},
 assumption:'Far-field pattern of a short (Hertzian) dipole, which closely matches a half-wave dipole; antenna drawn vertically.'});

/* ---------- Ray Optics ---------- */
add({base:'lens',id:'total-internal-reflection',title:'Total internal reflection',
 description:'Shine a laser from glass towards air. Beyond the critical angle no light escapes.',
 formula:'sin θc = n₂ / n₁',
 observe:'As the angle grows the refracted ray skims the surface, then vanishes — all light is reflected.',
 tryText:'Set the angle just above θc. Then switch to a diamond-like index (2.42).',
 controls:[R('n1','Index of dense medium n₁',1.3,2.42,.01,1.5,'',2),R('n2','Index of outside medium n₂',1,1.5,.01,1,'',2),R('th','Angle of incidence',0,89,.5,35,'°',1)],
 metrics:p=>{const crit=p.n1>p.n2?deg(Math.asin(p.n2/p.n1)):NaN,sr=p.n1/p.n2*Math.sin(rad(p.th));return[N('Critical angle',Number.isFinite(crit)?crit:'None (n₁ ≤ n₂)','°',1),N('Refraction angle',sr<1?deg(Math.asin(sr)):'Total internal reflection','°',1),N('Light escaping?',sr<1?'Yes':'No')]},
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:60,pitch:.35,cy:280}),Rr=2.2,th=rad(p.th),sr=p.n1/p.n2*Math.sin(th);const half=[];for(let i=0;i<=24;i++){const a=PI+PI*i/24;half.push([Rr*Math.cos(a),0,Rr*Math.sin(a)])}
  for(const y of [-.25,.25])s.poly(half.map(q=>[q[0],y,q[2]]),'#7fc8e8',{alpha:.28,cull:false,normal:[0,1,0]});for(let i=0;i<24;i++)s.poly([[half[i][0],-.25,half[i][2]],[half[i+1][0],-.25,half[i+1][2]],[half[i+1][0],.25,half[i+1][2]],[half[i][0],.25,half[i][2]]],'#7fc8e8',{alpha:.2,cull:false});
  const inP=[-Rr*Math.sin(th),0,-Rr*Math.cos(th)];s.cyl(V.mul(inP,1.25),V.norm(inP),.12,.5,'#2f3d48');s.path([V.mul(inP,1.1),[0,0,0]],'#ff3b3b',3.5);const refl=[Rr*Math.sin(th),0,-Rr*Math.cos(th)];s.path([[0,0,0],refl],sr<1?'#ff3b3b77':'#ff3b3b',sr<1?2:3.5);
  if(sr<1){const tt=Math.asin(sr);s.path([[0,0,0],[2.6*Math.sin(tt),0,2.6*Math.cos(tt)]],'#ff3b3b',3)}s.seg([0,0,-2.6],[0,0,2.6],C.muted,1,[4,4]);s.seg([-2.8,0,0],[2.8,0,0],'#e9f6ff66',1.5);s.label([-2.2,.4,1],'outside (n₂)',C.muted,12);s.label([-1.6,.4,-1.6],'glass (n₁)',C.glass,12);s.render();
  tag(c,sr<1?'Refracted ray escapes':'Totally internally reflected',44,98,sr<1?C.gold:C.mint,15)},
 assumption:'Laser enters along a radius of a semicircular block, so it is not bent on entry; partial reflection shown faintly.'});

add({base:'lens',id:'compound-microscope',title:'Compound microscope',
 description:'An objective makes a magnified real image; the eyepiece magnifies it further.',
 formula:'m = (L/f_o)(1 + D/f_e)  or  (L/f_o)(D/f_e)',
 observe:'Short focal lengths for both lenses and a longer tube give greater magnification.',
 tryText:'Halve the objective focal length. Compare the change with halving f_e.',
 controls:[R('fo','Objective focal length f_o',.4,2,.05,1,'cm',2),R('fe','Eyepiece focal length f_e',1.5,6,.1,2.5,'cm',1),R('L','Tube length L',10,20,.5,16,'cm',1),S('adj','Final image','near',[['near','At near point (25 cm)'],['inf','At infinity (relaxed eye)']])],
 metrics:p=>{const mo=p.L/p.fo,me2=p.adj==='near'?1+25/p.fe:25/p.fe;return[N('Objective magnification',mo,'×',1),N('Eyepiece magnification',me2,'×',1),N('Total magnification',mo*me2,'×',0)]},
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:54,yaw:.55,pitch:.2,cy:262}),len=2+p.L*.2;s.cyl([0,0,0],[1,0,0],.55,len,'#2f3d48',{alpha:.35,caps:false});const lens=(x,r,col)=>{for(let i=0;i<4;i++)s.cyl([x,0,0],[1,0,0],r*(1-i*.18),.08+.03*(3-i),col,{alpha:.5})};
  lens(-len/2,.45,C.glass);lens(len/2,.55,C.glass);s.box([-len/2-.8,-.7,0],[.8,.06,1.2],'#9fb4c2');s.ball([-len/2-.8,-.6,0],.07,C.red);
  for(const y of [-.25,.25]){s.path([[-len/2-.8,-.6,0],[-len/2,y,0],[len/2-.3,-y*2.6,0],[len/2,-y*2.2,0],[len/2+1.6,-y*.3,0]],'#ffc36b',1.5)}s.label([-len/2,.8,0],'objective',C.muted,12);s.label([len/2,.9,0],'eyepiece',C.muted,12);s.ball([len/2+1.9,0,0],.22,'#f4f4ee',{label:'eye'});s.render();
  const m=p.L/p.fo*(p.adj==='near'?1+25/p.fe:25/p.fe);tag(c,`Magnification ≈ ${f(m,0)}×`,44,98,C.gold,16)},
 assumption:'Thin lenses; object just beyond f_o so the objective image forms close to the eyepiece focus; tube length ≈ distance between focal points.'});

add({base:'lens',id:'astronomical-telescope',title:'Astronomical telescope',
 description:'A long-focus objective collects light from a distant object; a short-focus eyepiece magnifies the angle.',
 formula:'m = f_o / f_e  (normal adjustment)',
 observe:'Magnification is the ratio of focal lengths; the tube length is their sum.',
 tryText:'Find the eyepiece that gives 100× with a 150 cm objective.',
 controls:[R('fo','Objective focal length f_o',50,200,1,120,'cm'),R('fe','Eyepiece focal length f_e',1,10,.1,4,'cm',1),R('D','Objective diameter',2,30,.5,10,'cm',1)],
 metrics:p=>[N('Angular magnification',p.fo/p.fe,'×',1),N('Tube length',p.fo+p.fe,'cm',1),N('Light-gathering vs eye (7 mm)',(p.D*10/7)**2,'×',0),N('Resolution limit (550 nm)',1.22*550e-9/(p.D/100)*206265,'″',2)],
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:50,yaw:.6,pitch:.2,cy:262}),len=2.4+p.fo*.02,r=.25+p.D*.03;s.cyl([0,0,0],[1,0,0],r+.05,len,'#e9f6ff',{alpha:.85});s.cyl([len/2+.25,0,0],[1,0,0],.14,.5,'#2f3d48');
  for(const y of [-.6,-.3,0,.3,.6].map(v=>v*r)){s.path([[-len/2-1.5,y+.3,0],[-len/2,y,0],[len/2-.05,-y*.0,0]],'#ffc36b88',1.2)}s.box([0,-1.6,0],[.15,1.4,.15],'#5d7b8f');s.box([0,-2.3,0],[1.2,.08,1.2],'#5d7b8f');s.render();tag(c,`${f(p.fo/p.fe,0)}× magnification`,44,98,C.gold,16)},
 assumption:'Thin lenses, object at infinity, final image at infinity; diffraction limit from the Rayleigh criterion at 550 nm.'});

add({base:'lens',id:'lens-maker',title:'Lens maker’s formula',
 description:'Shape a lens by choosing its surface radii and glass, then immerse it in another medium.',
 formula:'1/f = (n_lens/n_medium − 1)(1/R₁ − 1/R₂)',
 observe:'A glass lens in water is much weaker; in a denser liquid a converging lens can even diverge.',
 tryText:'Put an n = 1.5 lens into a medium with n = 1.6.',
 controls:[R('n','Lens index',1.3,1.9,.01,1.5,'',2),R('R1','First surface R₁',5,50,1,20,'cm'),R('R2','Second surface R₂ (magnitude)',5,50,1,20,'cm'),R('nm','Surrounding medium index',1,1.7,.01,1,'',2)],
 metrics:p=>{const inv=(p.n/p.nm-1)*(1/p.R1+1/p.R2),fl=1/inv;return[N('Focal length',Math.abs(inv)<1e-9?'Infinite':f(fl,1)+' cm'),N('Power',inv*100,'D',2),N('Type',inv>0?'Converging':inv<0?'Diverging':'No focusing')]},
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:60,yaw:.7,pitch:.2}),inv=(p.n/p.nm-1)*(1/p.R1+1/p.R2),th1=1.2/p.R1*6,th2=1.2/p.R2*6,n=7;if(p.nm>1.01)s.box([0,0,0],[6,3,3],'#3fa7d6',{alpha:.12});
  for(let i=0;i<n;i++){const y=i/(n-1),r=1.3*Math.sqrt(1-y*y*.96),xo=-.05-th1*(1-y*y)*.5,x1=.05+th2*(1-y*y)*.5;s.cyl([(xo+x1)/2,0,0],[1,0,0],r,Math.max(.04,(x1-xo)/n*1.6),'#7fc8e8',{alpha:.45})}
  const xF=Math.abs(inv)<1e-6?Infinity:1/inv*.06;for(const y of [-.9,-.45,.45,.9]){s.path([[-3.2,y,0],[0,y,0]],'#ffc36b',1.6);const end=Number.isFinite(xF)?y*(1-3.2/xF):y,xe=Math.abs(end)>2.5?3.2*(2.5*Math.sign(end)-y)/(end-y):3.2;s.path([[0,y,0],[xe,y+(end-y)*xe/3.2,0]],'#ffc36b',1.6);if(xF<0)s.path([[0,y,0],[xF,0,0]],'#ffc36b55',1,[4,4])}
  if(Math.abs(xF)<3.2)s.ball([xF,0,0],.07,C.red,{flat:true,label:'F'});s.render()},
 assumption:'Thin biconvex lens (R₁ > 0, R₂ < 0 in the Cartesian convention); paraxial rays.'});

add({base:'lens',id:'mirror-images',title:'Images in two inclined mirrors',
 description:'Place an object between two plane mirrors and change the angle. Count the images.',
 formula:'n = 360°/θ − 1  (when 360°/θ is even)',
 observe:'Each image can act as an object for the other mirror until the image falls behind both.',
 tryText:'Set θ = 60°, then 72° with the object off the bisector.',
 controls:[R('th','Angle between mirrors θ',30,180,1,60,'°'),R('phi','Object position (fraction of θ)',.1,.9,.05,.35,'',2)],
 metrics:p=>{const imgs=mirrorImages(p.th,p.phi*p.th),m=360/p.th;return[N('Images formed',imgs.length,'',0),N('360° / θ',m,'',2),N('Formula check',Number.isInteger(+m.toFixed(6))?(m%2===0?`${m}−1 = ${m-1}`:`${m} (off bisector) or ${m-1} (on bisector)`):'Non-integer ratio')]},
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:54,pitch:.75,cy:270}),th=rad(p.th),r=1.4,imgs=mirrorImages(p.th,p.phi*p.th);s.plate([0,-.4,0],[7,6],'#143144',-.4);
  for(const a of [0,th])s.box([1.4*Math.cos(a),.2,-1.4*Math.sin(a)],[2.8,1.2,.06],'#c9e6f5',{rotY:a,alpha:.75});const obj=rad(p.phi*p.th);s.ball([r*Math.cos(obj),0,-r*Math.sin(obj)],.17,C.red,{label:'object'});
  imgs.forEach((a,i)=>s.ball([r*Math.cos(rad(a)),0,-r*Math.sin(rad(a))],.15,'#ff857e',{alpha:.55,label:String(i+1),labelColor:C.muted}));s.ring([0,-.38,0],[0,1,0],r,'#ffffff22',1,[3,4]);s.render()},
 assumption:'Ideal plane mirrors meeting at a line; images found by successive reflections until one falls behind both mirrors.'});
function mirrorImages(thDeg,phiDeg){const th=thDeg,dead=a=>{const x=((a%360)+360)%360;return x>=180-1e-6&&x<=180+th+1e-6};const out=[],key=a=>Math.round((((a%360)+360)%360)*1000)/1000,seen=new Set();
  for(const first of [0,1]){let a=phiDeg,m=first;for(let i=0;i<40;i++){a=m===0?-a:2*th-a;const k=key(a);if(!seen.has(k)&&Math.abs(k-key(phiDeg))>1e-6){seen.add(k);out.push(a)}if(dead(a))break;m=1-m}}return out}

add({base:'lens',id:'apparent-depth',title:'Real and apparent depth',
 description:'Look straight down into a pool. Refraction makes the coin on the bottom appear raised.',
 formula:'apparent depth = real depth / n ;  shift = d(1 − 1/n)',
 observe:'Light bends away from the normal as it leaves the water, so the eye traces it back to a shallower point.',
 tryText:'Try glass (1.5) and diamond (2.42) with the same depth.',
 controls:[R('d','Real depth',.2,3,.05,1.5,'m',2),R('n','Refractive index',1,2.42,.01,1.33,'',2)],
 metrics:p=>[N('Apparent depth',p.d/p.n,'m',3),N('Apparent rise',p.d*(1-1/p.n),'m',3)],
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:60,pitch:.15,yaw:.35,cy:250}),D=.6+p.d*.8,top=.6,ap=D/p.n;s.box([0,top-D/2,0],[4,D,2],'#3fa7d6',{alpha:.3});s.box([0,top-D-.05,0],[4.2,.1,2.2],'#c9b78a');
  s.cyl([0,top-D+.03,0],[0,1,0],.25,.04,'#d9b44a');s.cyl([0,top-ap,0],[0,1,0],.25,.04,'#d9b44a',{alpha:.45});s.label([.9,top-ap,0],'image',C.gold,12);s.label([.9,top-D,0],'coin',C.gold,12);
  for(const sg of [-1,1]){const xs=sg*.35,eye=[sg*.6,top+1.3,0];s.path([[sg*.1,top-D+.05,0],[xs,top,0],eye],'#ffc36b',1.8);s.path([[xs,top,0],[sg*.05,top-ap,0]],'#ffc36b88',1.2,[4,4])}s.ball([0,top+1.45,0],.2,'#f4f4ee',{label:'eye'});s.render()},
 assumption:'Near-normal viewing (paraxial rays); flat calm surface. Ray bending exaggerated for clarity.'});

/* ---------- Wave Optics ---------- */
add({base:'doubleslit',id:'brewster-angle',title:'Brewster’s angle',
 description:'Reflect unpolarised light from glass. At Brewster’s angle the reflected beam is completely polarised.',
 formula:'tan θ_B = n₂ / n₁ ;  θ_B + θ_r = 90°',
 observe:'At θ_B the reflected and refracted rays are perpendicular, and the p-component is not reflected at all.',
 tryText:'Find the angle where R_p falls to zero for water (n = 1.33).',
 controls:[R('n2','Refractive index n₂',1.3,2.4,.01,1.5,'',2),R('th','Angle of incidence',0,89,.5,56.3,'°',1)],
 metrics:p=>{const th=rad(p.th),st=Math.sin(th)/p.n2,tt=Math.asin(st),ci=Math.cos(th),ct=Math.cos(tt),rs=(ci-p.n2*ct)/(ci+p.n2*ct),rp=(p.n2*ci-ct)/(p.n2*ci+ct),Rs=rs*rs,Rp=rp*rp;return[N('Brewster angle',deg(Math.atan(p.n2)),'°',1),N('R_s (s-polarised)',Rs*100,'%',2),N('R_p (p-polarised)',Rp*100,'%',3),N('Reflected polarisation',(Rs-Rp)/(Rs+Rp+1e-12)*100,'%',1)]},
 draw:(c,p,t)=>{const th=rad(p.th),tt=Math.asin(Math.sin(th)/p.n2),ci=Math.cos(th),ct=Math.cos(tt),rs=(ci-p.n2*ct)/(ci+p.n2*ct),rp=(p.n2*ci-ct)/(p.n2*ci+ct),s=P3.scene(c,{scale:58,cy:262,yaw:.3});
  s.box([0,-1,0],[6,2,2.4],'#7fc8e8',{alpha:.2});const L=2.6,inc=[-L*Math.sin(th),L*Math.cos(th),0],ref=[L*Math.sin(th),L*Math.cos(th),0],tr=[L*Math.sin(tt),-L*Math.cos(tt),0];s.path([inc,[0,0,0]],'#ffe27a',3);s.path([[0,0,0],ref],'#ffe27a',1+8*Math.sqrt(rs*rs+rp*rp)/1.4);s.path([[0,0,0],tr],'#ffe27a',2.5);s.seg([0,-2,0],[0,2.4,0],C.muted,1,[4,4]);
  for(let i=1;i<=3;i++){const q=V.mul(inc,i/4);s.ball(q,.05,C.mint,{flat:true});const d=V.norm(V.cross(inc,[0,0,1]));s.seg(V.add(q,V.mul(d,.2)),V.add(q,V.mul(d,-.2)),C.mint,2)}
  for(let i=1;i<=3;i++){const q=V.mul(ref,i/4);s.ball(q,.05+.05*Math.abs(rs),C.mint,{flat:true});const d=V.norm(V.cross(ref,[0,0,1]));const k=Math.abs(rp)*3;if(k>.02)s.seg(V.add(q,V.mul(d,.2*k)),V.add(q,V.mul(d,-.2*k)),C.mint,2)}s.render();
  tag(c,'dots: s-polarisation (out of page)   bars: p-polarisation',44,98,C.muted,13)},
 assumption:'Light from air (n₁ = 1) onto a smooth non-absorbing dielectric; Fresnel equations; ray thickness ∝ reflected amplitude.'});

add({base:'doubleslit',id:'resolving-power',title:'Resolving two stars (Rayleigh criterion)',
 description:'Two point sources make overlapping diffraction patterns. Are they resolved by this aperture?',
 formula:'θ_min = 1.22 λ / D',
 observe:'When the peak of one pattern falls on the first dark ring of the other, the sources are just resolved.',
 tryText:'Increase the aperture diameter until the two peaks separate.',
 controls:[R('D','Aperture diameter',1,200,1,20,'mm'),R('lam','Wavelength',400,700,10,550,'nm'),R('sep','Source separation',.5,20,.1,6,'arcsec',1)],
 metrics:p=>{const tm=1.22*p.lam*1e-9/(p.D/1000)*206265;return[N('Rayleigh limit',tm,'arcsec',2),N('Separation / limit',p.sep/tm,'',2),N('Verdict',p.sep>=tm?'Resolved':'Not resolved')]},
 draw:(c,p,t)=>{const tm=1.22*p.lam*1e-9/(p.D/1000)*206265,s=P3.scene(c,{scale:56,pitch:.5,cy:300}),kx=3.8317/tm,half=p.sep/2,col=spectral(p.lam),span=Math.max(p.sep*1.6,tm*3),n=40,I=(x,z)=>{const r1=Math.hypot(x+half,z),r2=Math.hypot(x-half,z);return airy(kx*r1)+airy(kx*r2)};
  for(let j=0;j<=n;j++){const z=-span/2+span*j/n,row=[];for(let i=0;i<=n;i++){const x=-span/2+span*i/n;row.push([x/span*6,I(x,z)*1.1,z/span*6])}s.path(row,col+'cc',1.2)}s.render();
  tag(c,p.sep>=tm?'Resolved: two distinct peaks':'Not resolved: peaks merge',44,98,p.sep>=tm?C.mint:C.red,15)},
 assumption:'Circular aperture, incoherent point sources of equal brightness, Airy intensity pattern I ∝ [2J₁(x)/x]².'});

add({base:'doubleslit',id:'coherent-superposition',title:'Superposing two coherent waves',
 description:'Add two light waves with a fixed phase difference and see the resultant intensity.',
 formula:'I = I₁ + I₂ + 2√(I₁I₂) cos φ',
 observe:'Equal intensities give perfect dark fringes; unequal ones never cancel completely.',
 tryText:'Set φ = 180° and make I₁ = I₂. Then make them unequal.',
 controls:[R('I1','Intensity I₁',0,4,.1,1,'units',1),R('I2','Intensity I₂',0,4,.1,1,'units',1),R('phi','Phase difference φ',0,360,5,60,'°')],
 metrics:p=>{const I=p.I1+p.I2+2*Math.sqrt(p.I1*p.I2)*Math.cos(rad(p.phi)),Imax=(Math.sqrt(p.I1)+Math.sqrt(p.I2))**2,Imin=(Math.sqrt(p.I1)-Math.sqrt(p.I2))**2;return[N('Resultant intensity',I,'units',3),N('I_max',Imax,'units',2),N('I_min',Imin,'units',3),N('Fringe visibility',(Imax-Imin)/(Imax+Imin||1),'',3)]},
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:56,yaw:.55,pitch:.25}),a1=Math.sqrt(p.I1),a2=Math.sqrt(p.I2),ph=rad(p.phi),k=TAU/2,w=3,mk=(z,amp,off,col)=>{const pts=[];for(let i=0;i<=80;i++){const x=-3.4+6.8*i/80;pts.push([x,amp*.5*Math.sin(k*x-w*t+off),z])}s.curve(pts,col,2.4,8)};
  mk(-1.2,a1,0,C.blue);mk(-.4,a2,ph,C.red);const R0=Math.sqrt(p.I1+p.I2+2*a1*a2*Math.cos(ph)),d=Math.atan2(a2*Math.sin(ph),a1+a2*Math.cos(ph));mk(.9,R0,d,C.gold);s.label([-3.6,0,-1.2],'wave 1',C.blue,12);s.label([-3.6,0,-.4],'wave 2',C.red,12);s.label([-3.6,0,.9],'sum',C.gold,12);s.render()},
 assumption:'Monochromatic, coherent waves with the same polarisation and frequency.'});

/* ---------- Dual Nature of Radiation and Matter ---------- */
add({base:'photoelectric',id:'photocell-iv',title:'Photocell current vs anode voltage',
 description:'Vary the anode voltage of a photocell. Intensity sets the saturation current; frequency sets the stopping potential.',
 formula:'eV₀ = hf − φ ;  I_sat ∝ intensity',
 observe:'Brighter light raises the plateau but leaves the stopping potential unchanged.',
 tryText:'Double the intensity, then raise the frequency instead.',
 controls:[R('fq','Light frequency',4,15,.1,8,'× 10¹⁴ Hz',1),R('I','Intensity',0,100,1,60,'%'),S('metal','Cathode','na',[['na','Sodium (φ = 2.28 eV)'],['cs','Caesium (φ = 2.14 eV)'],['zn','Zinc (φ = 4.31 eV)'],['cu','Copper (φ = 4.70 eV)']]),R('Va','Anode voltage',-5,10,.1,2,'V',1)],
 metrics:p=>{const phi={na:2.28,cs:2.14,zn:4.31,cu:4.7}[p.metal],E=h*p.fq*1e14/e,V0=E-phi,Is=p.I*.2,I=V0<=0?0:p.Va>=0?Is:Is*clamp(1+p.Va/V0,0,1);return[N('Photon energy',E,'eV',2),N('Stopping potential',V0>0?V0:'No emission',V0>0?'V':'',2),N('Photocurrent',I,'μA',2)]},
 draw:(c,p,t)=>{const phi={na:2.28,cs:2.14,zn:4.31,cu:4.7}[p.metal],E=h*p.fq*1e14/e,V0=E-phi,Is=p.I*.2,cur=V=>V0<=0?0:V>=0?Is:Is*clamp(1+V/V0,0,1),s=P3.scene(c,{scale:54,cx:230,yaw:.4}),col=spectral(c0/(p.fq*1e14)*1e9);
  s.ball([0,0,0],1.7,'#7fc8e8',{alpha:.12,flat:true,lift:-10});s.box([-1,0,0],[.08,1.6,1.2],'#9fb4c2');s.box([1,0,0],[.08,1.2,.9],'#d9844a');for(let i=0;i<6;i++){const q=cycle(t*1.2+i/6,1);s.ball([-2.8+1.7*q,1.5-1.5*q,(i-3)*.2],.05,col,{flat:true,glow:true})}
  if(V0>0&&p.I>0){const n=Math.round(p.I/12);for(let i=0;i<n;i++){const q=cycle(t*(.6+.4*clamp(p.Va/5+.5,0,1))+i/n,1),reach=cur(p.Va)/Math.max(Is,1e-9),x=-1+2*q*(reach>0?1:.4);if(reach>0||q<.5)s.ball([x,(hash(i)-.5)*1.2,(hash(i+7)-.5)*.8],.05,C.blue,{flat:true})}}s.render();
  chart(c,420,96,236,170,{title:'I vs V',xl:'V (V)',xmin:-5,xmax:10,ymin:0,ymax:22,series:[{fn:cur,col:C.gold}],marker:[p.Va,cur(p.Va)]})},
 assumption:'Emitted electron energies spread uniformly from 0 to K_max (linear fall in current below 0 V); saturation current 0.2 μA per % intensity.'});

add({base:'photoelectric',id:'uncertainty-principle',title:'Heisenberg uncertainty principle',
 description:'Squeeze a particle’s wave packet into a smaller region and watch the spread of momentum grow.',
 formula:'Δx Δp ≥ ħ / 2',
 observe:'A narrower wave packet needs a wider range of wavelengths — position and momentum cannot both be sharp.',
 tryText:'Confine an electron to 0.1 nm (an atom). How uncertain is its speed?',
 controls:[S('part','Particle','e',[['e','Electron'],['p','Proton']]),R('dx','Position uncertainty Δx',.01,10,.01,.5,'nm',2)],
 metrics:p=>{const m=p.part==='e'?me:mp,dp=hbar/(2*p.dx*1e-9);return[N('Minimum Δp',dp,'kg m/s',3),N('Minimum Δv',dp/m,'m/s',1),N('Kinetic energy scale (Δp)²/2m',dp*dp/(2*m)/e,'eV',4)]},
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:56,yaw:.5,pitch:.25}),sig=.25+Math.log10(p.dx*100+1)*.55,pts=[],env=[],env2=[];for(let i=0;i<=200;i++){const x=-3.4+6.8*i/200,g=Math.exp(-x*x/(2*sig*sig));pts.push([x,1.3*g*Math.cos(6*x-t*4),1.3*g*Math.sin(6*x-t*4)]);env.push([x,1.3*g,0]);env2.push([x,-1.3*g,0])}
  s.curve(pts,C.mint,2.2,10);s.path(env,'#ffc36b88',1.2,[4,4]);s.path(env2,'#ffc36b88',1.2,[4,4]);s.seg([-3.6,0,0],[3.6,0,0],C.muted,1);s.render();
  const sp=1/sig;chart(c,450,96,206,130,{title:'Momentum spread',xl:'p',xmin:-6,xmax:6,ymin:0,ymax:1.05,series:[{fn:x=>Math.exp(-x*x/(2*sp*sp)),col:C.gold}]})},
 assumption:'Gaussian (minimum-uncertainty) wave packet; the 3D helix shows the complex wave function’s real and imaginary parts.'});

/* ---------- Atoms ---------- */
add({base:'bohr',id:'bohr-orbits-3d',title:'Bohr orbits and electron waves',
 description:'Choose the orbit n and nuclear charge Z. Exactly n de Broglie wavelengths fit around each allowed orbit.',
 formula:'rₙ = 0.0529 n²/Z nm ;  vₙ = 2.19 × 10⁶ Z/n m/s ;  2πr = nλ',
 observe:'Higher orbits are larger and slower; the electron’s standing wave closes on itself only for whole-number n.',
 tryText:'Compare n = 1 in hydrogen with n = 1 in He⁺ (Z = 2).',
 controls:[R('n','Principal quantum number n',1,6,1,3),R('Z','Nuclear charge Z',1,5,1,1)],
 metrics:p=>{const r=.0529*p.n**2/p.Z,v=2.188e6*p.Z/p.n;return[N('Orbit radius',r,'nm',4),N('Electron speed',v/1e6,'× 10⁶ m/s',3),N('Energy',-13.6*p.Z**2/p.n**2,'eV',3),N('Orbital period',TAU*r*1e-9/v*1e15,'fs',3)]},
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:56,pitch:.5}),k=r=>.4+Math.sqrt(r)*.45;for(let i=0;i<p.Z;i++)s.ball([(hash(i)-.5)*.18,(hash(i+3)-.5)*.18,(hash(i+6)-.5)*.18],.12,C.red);
  for(let m=1;m<=6;m++){const rr=k(m*m/p.Z);if(rr>3.3)break;s.ring([0,0,0],[0,1,0],rr,m===p.n?'#42d9ca88':'#29475b',m===p.n?1.6:1)}const rr=k(p.n*p.n/p.Z),pts=[];for(let i=0;i<=240;i++){const a=TAU*i/240,wv=.18*Math.sin(p.n*a-t*3);pts.push([(rr+wv)*Math.cos(a),wv*.6,(rr+wv)*Math.sin(a)])}s.curve(pts,C.gold,2.2,8);
  const a=t*1.6/p.n**1.5*p.Z;s.ball([rr*Math.cos(a),0,rr*Math.sin(a)],.1,C.blue,{glow:true});s.render();tag(c,`${p.n} de Broglie wavelength${p.n>1?'s':''} around the orbit`,44,98,C.gold,14)},
 assumption:'Bohr model of a one-electron atom (hydrogen-like ion); radii drawn on a compressed (square-root) scale.'});

add({base:'bohr',id:'hydrogen-like-ions',title:'Spectral lines of hydrogen-like ions',
 description:'Choose a one-electron ion and a transition. Higher nuclear charge shifts every line towards shorter wavelengths.',
 formula:'1/λ = R Z² (1/n₁² − 1/n₂²)',
 observe:'Energies scale as Z², so He⁺ lines are four times as energetic as the matching hydrogen lines.',
 tryText:'Find which transition in He⁺ lands in the visible range.',
 controls:[R('Z','Nuclear charge Z',1,10,1,1),R('n1','Lower level n₁',1,4,1,2),R('n2','Upper level n₂',2,8,1,3)],
 metrics:p=>{if(p.n2<=p.n1)return[N('Transition','Choose n₂ > n₁')];const E=13.6*p.Z**2*(1/p.n1**2-1/p.n2**2),lam=1239.84/E;return[N('Photon energy',E,'eV',3),N('Wavelength',lam,'nm',1),N('Region',band(lam)),N('Ionisation energy (from n = 1)',13.6*p.Z**2,'eV',1)]},
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:56,yaw:.4,pitch:.15,cx:250}),Emin=-13.6*p.Z**2,y=n=>-2+3.8*(1-(-13.6*p.Z**2/n**2)/Emin);for(let n=1;n<=8;n++){const sel=n===p.n1||n===p.n2;s.box([0,y(n),0],[3,.04,1.2],sel?'#42d9ca':'#29475b',{alpha:sel?.9:.6});if(n<=4||sel)s.label([-1.9,y(n),0],`n=${n}`,sel?C.mint:C.muted,12)}
  if(p.n2>p.n1){const E=13.6*p.Z**2*(1/p.n1**2-1/p.n2**2),lam=1239.84/E,col=lam>=380&&lam<=780?spectral(lam):'#b89dff',q=cycle(t*.7,1),ey=y(p.n2)+(y(p.n1)-y(p.n2))*Math.min(1,q*2);s.arrow([.6,y(p.n2),0],[.6,y(p.n1),0],col,3,11,`λ = ${f(lam,1)} nm`);s.ball([.6,ey,0],.1,C.blue,{glow:true});
   if(q>.5){const pts=[];for(let i=0;i<=40;i++){const x=.8+(q-.5)*2*3*i/40;pts.push([x,y(p.n1)+.15*Math.sin(i*1.2),0])}s.path(pts,col,2)}}s.render()},
 assumption:'Bohr energy levels with reduced-mass correction ignored; R = 1.097 × 10⁷ m⁻¹; levels spaced by energy.'});

/* ---------- Nuclei ---------- */
add({base:'nuclear',id:'nuclear-size',title:'Size and density of nuclei',
 description:'Build nuclei of increasing mass number. The radius grows as A^(1/3), so the density stays the same.',
 formula:'R = R₀ A^(1/3),  R₀ ≈ 1.2 fm',
 observe:'All nuclei have roughly the same density — about 2.3 × 10¹⁷ kg/m³.',
 tryText:'Compare A = 27 with A = 216. How do their radii compare?',
 controls:[R('A','Mass number A',1,240,1,56),R('Zf','Proton fraction',.35,.5,.01,.46,'',2)],
 metrics:p=>{const Rn=1.2e-15*Math.cbrt(p.A),Vn=4/3*PI*Rn**3,rho=p.A*1.6605e-27/Vn;return[N('Nuclear radius',Rn*1e15,'fm',2),N('Volume',Vn*1e45,'fm³',1),N('Density',rho,'kg/m³',2),N('Protons / neutrons',`${Math.round(p.A*p.Zf)} / ${p.A-Math.round(p.A*p.Zf)}`)]},
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:56}),Rv=.28*Math.cbrt(p.A),nP=Math.round(p.A*p.Zf),r=.26,n=p.A;for(let i=0;i<n;i++){const y=1-2*(i+.5)/n,rr=Math.sqrt(1-y*y),phi=i*2.399963,depth=Math.cbrt((i+.5)/n),q=[Rv*depth*rr*Math.cos(phi+t*.2),Rv*depth*y,Rv*depth*rr*Math.sin(phi+t*.2)];s.ball(q,r,hash(i)<p.Zf?C.red:'#9fb4c2')}
  s.ring([0,0,0],[0,1,0],Rv+r,'#ffffff33',1,[4,4]);s.render();tag(c,`red: protons · grey: neutrons · radius ${f(1.2*Math.cbrt(p.A),2)} fm`,44,98,C.muted,13)},
 assumption:'Nucleons modelled as hard spheres packed in a uniform sphere; R₀ = 1.2 fm.'});

add({base:'nuclear',id:'fusion-energy',title:'Energy from nuclear fusion',
 description:'Fuse light nuclei and calculate the energy released from the mass defect.',
 formula:'Q = (Σm_reactants − Σm_products) c²',
 observe:'A tiny loss of mass — under 0.4 % — releases millions of electronvolts per reaction.',
 tryText:'Compare D–T with D–D fusion per kilogram of fuel.',
 controls:[S('rx','Reaction','dt',[['dt','D + T → ⁴He + n'],['dd','D + D → ³He + n'],['dhe','D + ³He → ⁴He + p']]),R('mass','Fuel mass',.1,100,.1,1,'g',1)],
 metrics:p=>{const m={D:2.014101778,T:3.016049281,He4:4.002603254,n:1.008664916,He3:3.016029322,p:1.007825032},r={dt:[['D','T'],['He4','n']],dd:[['D','D'],['He3','n']],dhe:[['D','He3'],['He4','p']]}[p.rx];const mi=r[0].reduce((s,k)=>s+m[k],0),mf=r[1].reduce((s,k)=>s+m[k],0),Q=(mi-mf)*u,per=p.mass/1000/(mi*1.66053906660e-27)*Q*1e6*e;
  return[N('Q value',Q,'MeV',2),N('Mass converted',(mi-mf)/mi*100,'%',3),N('Energy from fuel',per,'J',2),N('Equivalent coal',per/24e6/1000,'tonnes',1)]},
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:56}),ph=cycle(t,4),cl=(x,nP,nN,R0)=>{for(let i=0;i<nP+nN;i++){const a=i*2.4,y=1-2*(i+.5)/(nP+nN),r=Math.sqrt(1-y*y);s.ball(V.add(x,V.mul([r*Math.cos(a),y,r*Math.sin(a)],R0)),.16,i<nP?C.red:'#9fb4c2')}};
  const prod={dt:[[2,2],[0,1]],dd:[[2,1],[0,1]],dhe:[[2,2],[1,0]]}[p.rx],reac={dt:[[1,1],[1,2]],dd:[[1,1],[1,1]],dhe:[[1,1],[2,1]]}[p.rx];
  if(ph<1.8){const d=2.6*(1-ph/1.8)+.2;cl([-d,0,0],reac[0][0],reac[0][1],.18);cl([d,0,0],reac[1][0],reac[1][1],.2)}else if(ph<2.2){s.ball([0,0,0],.3+(ph-1.8)*3,'#fff2c6',{glow:true,flat:true})}else{const d=(ph-2.2)*1.6;cl([-d*.5,d*.3,0],prod[0][0],prod[0][1],.24);cl([d*1.2,-d*.5,.3],prod[1][0],prod[1][1],.01)}s.render()},
 assumption:'Atomic masses in u (electron masses cancel); 1 u = 931.494 MeV/c²; coal ≈ 24 MJ/kg. Fuel assumed to be the reactant pair in the stated ratio.'});

add({base:'nuclear',id:'decay-chain',title:'Radioactive decay chain A → B → C',
 description:'A parent decays to a radioactive daughter, which decays to a stable product. Watch the daughter rise and fall.',
 formula:'N_B = N₀ λ_A/(λ_B − λ_A) (e^(−λ_A t) − e^(−λ_B t))',
 observe:'The daughter peaks when its production rate equals its own decay rate.',
 tryText:'Make the daughter’s half-life much shorter than the parent’s (secular equilibrium).',
 controls:[R('TA','Parent half-life',1,20,.5,6,'s',1),R('TB','Daughter half-life',.5,20,.5,2,'s',1),R('N0','Initial parent nuclei',100,1000,50,600)],
 metrics:(p,t)=>{const r=chain(p,cycle(t,40)),la=Math.LN2/p.TA,lb=Math.LN2/p.TB,tm=Math.abs(la-lb)<1e-9?1/la:Math.log(lb/la)/(lb-la);return[N('Parent A',r[0],'',0),N('Daughter B',r[1],'',0),N('Stable C',r[2],'',0),N('Daughter peaks at',tm,'s',2)]},
 draw:(c,p,t)=>{const tt=cycle(t,40),r=chain(p,tt),s=P3.scene(c,{scale:54,cx:230,cy:290});s.floor(3,.5,-1.6);[['A',r[0],C.red,-1.6],['B',r[1],C.gold,0],['C',r[2],'#9fb4c2',1.6]].forEach(([lab,nv,col,x])=>{const hgt=.1+2.8*nv/p.N0;s.cyl([x,-1.6+hgt/2,0],[0,1,0],.5,hgt,col);s.label([x,-1.6+hgt+.3,0],`${lab}: ${Math.round(nv)}`,col,13)});s.render();
  chart(c,420,96,236,170,{title:'Populations vs time',xl:'t (s)',xmin:0,xmax:40,ymin:0,ymax:p.N0,series:[0,1,2].map(i=>({pts:Array.from({length:81},(_,j)=>[j/2,chain(p,j/2)[i]]),col:[C.red,C.gold,'#9fb4c2'][i]}))});tag(c,`t = ${f(tt,1)} s`,432,252,C.white,12)},
 assumption:'Pure exponential decay with constant λ; average (not random) populations; B is absent at t = 0.'});
function chain(p,t){const la=Math.LN2/p.TA,lb=Math.LN2/p.TB,A=p.N0*Math.exp(-la*t),B=Math.abs(la-lb)<1e-9?p.N0*la*t*Math.exp(-la*t):p.N0*la/(lb-la)*(Math.exp(-la*t)-Math.exp(-lb*t));return[A,B,p.N0-A-B]}

add({base:'nuclear',id:'activity-sample',title:'Activity of a radioactive sample',
 description:'Pick an isotope and a sample mass. Count the atoms and calculate how many decay each second.',
 formula:'A = λN = (ln 2 / T½) × (m/M) N_A',
 observe:'A milligram of a short-lived isotope can be far more active than a kilogram of a long-lived one.',
 tryText:'Compare 1 mg of iodine-131 with 1 mg of carbon-14.',
 controls:[S('iso','Isotope','co60',[['i131','Iodine-131 (8.02 d)'],['co60','Cobalt-60 (5.27 y)'],['cs137','Caesium-137 (30.1 y)'],['ra226','Radium-226 (1600 y)'],['c14','Carbon-14 (5730 y)']]),R('lm','Sample mass (log₁₀ mg)',-3,3,.1,0,'',1),R('ty','Time elapsed',0,100,.5,0,'years',1)],
 metrics:p=>{const d={i131:[131,8.02/365.25],co60:[60,5.27],cs137:[137,30.1],ra226:[226,1600],c14:[14,5730]}[p.iso],m=10**p.lm/1000,Nn=m/d[0]*NA,la=Math.LN2/(d[1]*3.15576e7),A0=la*Nn,At=A0*Math.pow(.5,p.ty/d[1]);return[N('Sample mass',m*1000,'mg',3),N('Initial activity',A0,'Bq',3),N('Activity now',At,'Bq',3),N('In curies',At/3.7e10,'Ci',3)]},
 draw:(c,p,t)=>{const d={i131:[131,8.02/365.25],co60:[60,5.27],cs137:[137,30.1],ra226:[226,1600],c14:[14,5730]}[p.iso],m=10**p.lm/1000,la=Math.LN2/(d[1]*3.15576e7),At=la*m/d[0]*NA*Math.pow(.5,p.ty/d[1]),n=Math.round(clamp(Math.log10(At+1)*2,0,30)),s=P3.scene(c,{scale:58});
  s.cyl([0,0,0],[0,1,0],.45,.9,'#5d7b8f',{cap:'#ffc36b'});for(let i=0;i<n;i++){const u2=hash(i)*2-1,ph=TAU*hash(i+40),r=Math.sqrt(1-u2*u2),dir=[r*Math.cos(ph),u2,r*Math.sin(ph)],q=cycle(t*1.4+hash(i+90),1);s.ball(V.mul(dir,.5+2.6*q),.05,'#ffe27a',{flat:true,glow:true})}s.render();tag(c,'emission rate drawn on a logarithmic scale',44,98,C.muted,13)},
 assumption:'Pure isotope; every decay counted once; year = 365.25 days.'});

/* ---------- Semiconductor Electronics ---------- */
add({base:'diode',id:'led-colour',title:'LED colour and band gap',
 description:'Change the semiconductor band gap and see the colour of light the LED emits.',
 formula:'λ = hc / E_g ≈ 1240 nm·eV / E_g',
 observe:'Wider band gaps release more energetic photons — towards blue and violet.',
 tryText:'Find the band gap that gives red light (≈ 630 nm).',
 controls:[R('Eg','Band gap E_g',1.4,3.3,.01,2,'eV',2),R('I','Forward current',0,30,1,15,'mA')],
 metrics:p=>{const lam=1239.84/p.Eg;return[N('Emitted wavelength',lam,'nm',0),N('Region',band(lam)),N('Photon energy',p.Eg,'eV',2),N('Approx. turn-on voltage',p.Eg,'V',2)]},
 draw:(c,p,t)=>{const lam=1239.84/p.Eg,col=lam>780?'#5a1a1a':spectral(lam),glow=p.I/30,s=P3.scene(c,{scale:66,cy:280});s.floor(2.6,.5,-1.6);for(const x of [-.18,.18])s.cyl([x,-.95,0],[0,1,0],.03,1.3,C.steel);s.cyl([0,-.22,0],[0,1,0],.42,.12,col,{alpha:.9});s.cyl([0,.15,0],[0,1,0],.38,.7,col,{alpha:.55,caps:false});s.ball([0,.5,0],.38,col,{alpha:.55});
  if(glow>0&&lam<=780)s.ball([0,.3,0],.15+glow*.4,col,{glow:true,flat:true,lift:5});s.render();tag(c,lam>780?'Infrared — invisible to the eye':`${f(lam,0)} nm`,44,98,lam>780?C.muted:col,16)},
 assumption:'Photon energy taken equal to the band gap; real LEDs emit a narrow band around this wavelength.'});

add({base:'diode',id:'solar-cell',title:'Solar cell: I–V curve and maximum power',
 description:'Change the sunlight and the load. The operating point sits where the cell curve meets the load line.',
 formula:'I = I_L − I₀(e^(V/nV_T) − 1) ;  P = VI',
 observe:'Power is greatest near the knee of the curve — too little or too much load resistance wastes power.',
 tryText:'Adjust the load until the power is maximum.',
 controls:[R('G','Irradiance',100,1000,10,800,'W/m²'),R('A','Cell area',50,250,5,150,'cm²'),R('Rl','Load resistance',.05,5,.01,.25,'Ω',2)],
 metrics:p=>{const r=solar(p);return[N('Short-circuit current',r.IL,'A',2),N('Open-circuit voltage',r.Voc,'V',3),N('Load power',r.V*r.I,'W',2),N('Efficiency',r.V*r.I/(p.G*p.A*1e-4)*100,'%',1)]},
 draw:(c,p,t)=>{const r=solar(p),s=P3.scene(c,{scale:56,cx:230,cy:290,yaw:.3});s.floor(3,.5,-1.6);const w=1.2+Math.sqrt(p.A)*.1;s.box([0,-.6,0],[w,.08,w*.7],'#1d3d7a',{rotZ:-.4});for(let i=1;i<4;i++)s.seg([-w/2*Math.cos(.4)+i*w/4*Math.cos(.4),-.6+w/2*Math.sin(.4)-i*w/4*Math.sin(.4)+.05,-w*.35],[-w/2*Math.cos(.4)+i*w/4*Math.cos(.4),-.6+w/2*Math.sin(.4)-i*w/4*Math.sin(.4)+.05,w*.35],'#c9d3da',1);s.cyl([0,-1.2,0],[0,1,0],.05,1,C.steel);
  for(let i=0;i<Math.round(p.G/150);i++){const q=cycle(t+i*.37,1);s.path([[-2.4+i*.3,2.2,-.5],[-2.4+i*.3+1.6*q,2.2-2.4*q,-.5]],'#ffe27a88',1.5)}s.ball([-2.6,2.3,-.5],.3,'#ffd27a',{glow:true});const sp=t*r.V*r.I*1.5;s.cyl([2,-1.3,0],[0,1,0],.25,.4,'#5d7b8f');for(let i=0;i<3;i++){const a=sp+i*TAU/3;s.seg([2,-1,0],[2+.6*Math.cos(a),-1,.6*Math.sin(a)],C.white,4)}s.render();
  chart(c,410,96,246,170,{title:'Cell I–V and load line',xl:'V',xmin:0,xmax:r.Voc*1.05,ymin:0,ymax:r.IL*1.15,series:[{fn:Vv=>Math.max(0,r.IL-1e-10*(Math.exp(Vv/.031)-1)),col:C.gold},{fn:Vv=>Vv/p.Rl,col:C.mint,dash:[4,4]}],marker:[r.V,r.I]})},
 assumption:'Single-diode model: I₀ = 10⁻¹⁰ A, nV_T = 31 mV, photocurrent 25 mA/cm² at 1000 W/m²; no series resistance.'});
function solar(p){const IL=.025*p.A*p.G/1000,Voc=.031*Math.log(IL/1e-10+1);let lo=0,hi=Voc;for(let i=0;i<60;i++){const m=(lo+hi)/2,Ic=IL-1e-10*(Math.exp(m/.031)-1);Ic>m/p.Rl?lo=m:hi=m}const Vv=(lo+hi)/2;return{IL,Voc,V:Vv,I:Vv/p.Rl}}

add({base:'diode',id:'ripple-filter',title:'Rectifier with a smoothing capacitor',
 description:'Add a reservoir capacitor after a rectifier. It charges at each peak and slowly discharges into the load.',
 formula:'Ripple V_r ≈ I / (f_r C),  f_r = f (half-wave) or 2f (full-wave)',
 observe:'A bigger capacitor or a lighter load (larger R) gives smoother DC.',
 tryText:'Switch from half-wave to full-wave with the same capacitor.',
 controls:[S('type','Rectifier','full',[['half','Half-wave'],['full','Full-wave bridge']]),R('Vp','Peak voltage',5,20,.5,12,'V',1),R('Cu','Capacitance',10,2200,10,470,'μF'),R('Rl','Load resistance',50,2000,10,500,'Ω'),R('f','Mains frequency',50,60,10,50,'Hz')],
 metrics:p=>{const fr=p.type==='full'?2*p.f:p.f,I=p.Vp/p.Rl,Vr=Math.min(p.Vp,I/(fr*p.Cu*1e-6));return[N('Ripple (peak-to-peak)',Vr,'V',3),N('Average DC output',p.Vp-Vr/2,'V',2),N('Ripple factor',Vr/(2*Math.sqrt(3))/(p.Vp-Vr/2),'',4)]},
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:54,pitch:.55,cx:230,cy:290}),fr=p.type==='full'?2:1;s.box([0,-.12,0],[5,.16,3],'#16404a');const nd=p.type==='full'?4:1;for(let i=0;i<nd;i++){const x=-1.6+(i%2)*.8,z=-.6+Math.floor(i/2)*.8;s.cyl([x,.1,z],[1,0,0],.08,.4,'#1a1a1a');s.cyl([x+.15,.1,z],[1,0,0],.085,.06,'#c9d3da')}
  const ch=.5+Math.log10(p.Cu)*.35;s.cyl([.8,ch/2,0],[0,1,0],.35,ch,'#2f6db0',{cap:'#c9d3da'});s.label([.8,ch+.35,0],`${p.Cu} μF`,C.white,12);s.box([2,.12,0],[.7,.2,.25],'#c9a36b');s.label([2,.5,0],'load',C.muted,12);s.render();
  const Rc=p.Rl*p.Cu*1e-6,T=1/(fr*p.f);const out=x=>{const tt=x/(TAU*p.f);const k=Math.floor(tt/T);const t0=k*T;const dec=p.Vp*Math.exp(-(tt-t0)/Rc);const src=p.type==='full'?p.Vp*Math.abs(Math.sin(x)):Math.max(0,p.Vp*Math.sin(x));return Math.max(dec,src)};
  chart(c,420,96,236,170,{title:'Output with ripple',xl:'t',xmin:TAU/4,xmax:TAU*2.25,ymin:0,ymax:p.Vp*1.1,series:[{fn:x=>p.type==='full'?p.Vp*Math.abs(Math.sin(x)):Math.max(0,p.Vp*Math.sin(x)),col:'#8ca6b9',dash:[3,3]},{fn:out,col:C.gold}]})},
 assumption:'Ideal diodes, ripple small compared with the peak (V_r ≈ I/f_rC); the plotted waveform uses exact exponential discharge.'});

add({base:'diode',id:'ce-amplifier',title:'Common-emitter amplifier',
 description:'A small signal at the base produces a large, inverted signal at the collector.',
 formula:'A_v = −β R_L / r_in',
 observe:'The output is 180° out of phase with the input; too much gain or input drives it into clipping.',
 tryText:'Increase the input until the output clips at the supply limits.',
 controls:[R('beta','Current gain β',50,300,10,100),R('RL','Load resistance R_L',1,10,.5,4,'kΩ',1),R('rin','Input resistance r_in',.5,5,.1,2,'kΩ',1),R('vin','Input amplitude',1,50,1,10,'mV')],
 metrics:p=>{const Av=p.beta*p.RL/p.rin,vo=Av*p.vin/1000;return[N('Voltage gain',-Av,'',1),N('Output amplitude',Math.min(vo,6),'V',2),N('Phase shift','180°'),N('Clipping?',vo>6?'Yes — exceeds ±6 V swing':'No')]},
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:56,pitch:.5,cx:230,cy:290}),Av=p.beta*p.RL/p.rin;s.box([0,-.12,0],[5,.16,3],'#16404a');s.cyl([0,.35,0],[0,1,0],.32,.7,'#1a1a1a',{seg:16});for(const x of [-.15,0,.15])s.cyl([x,-.05,.1],[0,1,0],.02,.3,C.steel);s.label([0,1.1,0],'NPN',C.white,13);
  for(const [x,z,l] of [[-1.5,0,'r_in'],[1.4,-.8,'R_L']]){s.cyl([x,.12,z],[1,0,0],.12,.7,'#c9a36b');s.label([x,.5,z],l,C.muted,12)}s.render();
  chart(c,420,96,236,80,{title:`input ±${p.vin} mV`,xmin:0,xmax:2*TAU,ymin:-1.1,ymax:1.1,series:[{fn:x=>Math.sin(x+t*2)*p.vin/50,col:C.mint}]});chart(c,420,186,236,100,{title:'output (inverted, clipped at ±6 V)',xmin:0,xmax:2*TAU,ymin:-6.5,ymax:6.5,series:[{fn:x=>clamp(-Av*p.vin/1000*Math.sin(x+t*2),-6,6),col:C.gold}]})},
 assumption:'Small-signal model with the transistor biased mid-supply (12 V, ±6 V maximum swing); r_in includes the base–emitter resistance.'});

add({base:'diode',id:'carrier-concentration',title:'Electrons and holes in doped silicon',
 description:'Heat silicon or add donor atoms and see how the electron and hole concentrations change.',
 formula:'n·p = nᵢ² ;  nᵢ ∝ T^(3/2) e^(−E_g/2kT)',
 observe:'Doping makes one carrier dominate; the product n·p stays fixed at nᵢ² for a given temperature.',
 tryText:'Raise the temperature until intrinsic carriers swamp the doping.',
 controls:[R('T','Temperature',200,600,5,300,'K'),R('lN','Donor concentration (log₁₀ cm⁻³)',8,18,.1,14,'',1),S('type','Dopant','n',[['n','Donor (n-type)'],['p','Acceptor (p-type)']])],
 metrics:p=>{const ni=1e10*Math.pow(p.T/300,1.5)*Math.exp(-1.12/(2*8.617e-5)*(1/p.T-1/300)),Nd=10**p.lN,maj=Nd/2+Math.sqrt((Nd/2)**2+ni*ni),mino=ni*ni/maj;return[N('Intrinsic nᵢ',ni,'cm⁻³',2),N(p.type==='n'?'Electrons n':'Holes p',maj,'cm⁻³',2),N(p.type==='n'?'Holes p':'Electrons n',mino,'cm⁻³',2),N('Behaviour',ni>Nd?'Intrinsic (heat dominates)':'Extrinsic (doping dominates)')]},
 draw:(c,p,t)=>{const ni=1e10*Math.pow(p.T/300,1.5)*Math.exp(-1.12/(2*8.617e-5)*(1/p.T-1/300)),Nd=10**p.lN,maj=Nd/2+Math.sqrt((Nd/2)**2+ni*ni),mino=ni*ni/maj,cnt=x=>Math.round(clamp((Math.log10(x)-6)*2.2,0,30)),s=P3.scene(c,{scale:54});
  for(let i=0;i<4;i++)for(let j=0;j<3;j++)for(let q=0;q<3;q++){const pnt=[-1.8+i*1.2,-1.2+j*1.2,-1.2+q*1.2],dop=(i*9+j*3+q)%7===3;s.ball(pnt,.16,dop?(p.type==='n'?'#b89dff':'#ffc36b'):'#7d8b95');if(i<3)s.seg(pnt,V.add(pnt,[1.2,0,0]),'#3c5a6e',1.5);if(j<2)s.seg(pnt,V.add(pnt,[0,1.2,0]),'#3c5a6e',1.5);if(q<2)s.seg(pnt,V.add(pnt,[0,0,1.2]),'#3c5a6e',1.5)}
  const nE=cnt(p.type==='n'?maj:mino),nH=cnt(p.type==='n'?mino:maj),jit=p.T/300;for(let i=0;i<nE;i++)s.ball([(hash(i)-.5)*4+.2*Math.sin(t*jit*3+i),(hash(i+20)-.5)*3,(hash(i+40)-.5)*3],.07,C.blue,{flat:true,glow:true});for(let i=0;i<nH;i++)s.ball([(hash(i+60)-.5)*4,(hash(i+80)-.5)*3+.2*Math.cos(t*jit*3+i),(hash(i+99)-.5)*3],.07,C.red,{flat:true,stroke:C.red});s.render();
  tag(c,'blue: free electrons · red: holes (counts on a log scale)',44,98,C.muted,13)},
 assumption:'Silicon, E_g = 1.12 eV, nᵢ = 10¹⁰ cm⁻³ at 300 K; full ionisation of dopants; temperature dependence of E_g ignored.'});

done();
})();
