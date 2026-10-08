/* Lab pack — three NCERT practicals that had no simulation yet: the resonance tube, the sonometer and the
   prism i–δ curve. Each one behaves like the real apparatus (the student finds resonance or measures angles)
   and feeds the virtual-lab notebook in lab.js. */
(() => {
'use strict';
const {R,S,N,f,clamp,rad,deg,tag,pack,PI,TAU,C}=window.PhysicaLab;
const P3=window.Physica3D,{add,done}=pack();
const g=9.8;

/* ---------- Resonance tube: speed of sound ---------- */
// Air column closed by water. Resonance when L + e = (2n − 1) λ/4; end correction e = 0.3 d.
const RT={d:5,len:100};
const rtModel=p=>{const v=331+.6*p.T,lam=v/p.f*100,e=.3*RT.d,ph=TAU*(p.L+e)/lam,dl=.05,loud=dl/Math.sqrt(Math.cos(ph)**2+dl*dl);return{v,lam,e,ph,loud}};
add({base:'wave',id:'resonance-tube',title:'Resonance tube: speed of sound',
 description:'Hold a vibrating tuning fork over a tube whose air column is set by a water level. Find the first and second resonance.',
 formula:'L₁ + e = λ/4,  L₂ + e = 3λ/4  ⇒  v = 2f (L₂ − L₁)',
 observe:'The sound becomes suddenly loud only at certain air-column lengths; the second resonance is about three times the first.',
 tryText:'Find the first resonance, then lower the water to find the second. Is L₂ ≈ 3L₁? Why not exactly?',
 controls:[S('f','Tuning fork',512,[[512,'512 Hz'],[480,'480 Hz'],[426.7,'426.7 Hz'],[384,'384 Hz'],[341.3,'341.3 Hz'],[320,'320 Hz'],[288,'288 Hz']]),R('L','Air column length L',3,95,.1,12,'cm',1),R('T','Room temperature',0,40,1,27,'°C',0)],
 presets:[['Near the first resonance (512 Hz)',{f:512,L:15}],['Near the second resonance (512 Hz)',{f:512,L:48}],['Low fork, long column',{f:288,L:30}]],
 metrics:p=>{const m=rtModel(p);return[N('Air column length',p.L,'cm',1),N('Loudness',m.loud*100,'%',0),N('Status',m.loud>=.9?'Loud — resonance!':m.loud>.35?'Getting louder…':'Faint')]},
 draw:(c,p,t)=>{const m=rtModel({...p,f:+p.f}),k=.045,top=2.3,bot=top-RT.len*k,wy=top-p.L*k,s=P3.scene(c,{scale:45,cy:312,pitch:.12});
  s.box([0,bot-.12,0],[2.6,.16,1.2],C.wood);s.cyl([-.9,(bot+top)/2+.1,-.3],[0,1,0],.05,top-bot+.5,C.steel);
  for(const y of[top-.4,bot+.6])s.box([-.55,y,-.15],[.75,.06,.08],C.steel);
  s.cyl([0,wy-(wy-bot)/2,0],[0,1,0],.22,wy-bot,'#2f7fc8',{alpha:.6});s.cyl([0,(top+bot)/2,0],[0,1,0],.25,top-bot,C.glass,{alpha:.24,caps:false});s.ring([0,top,0],[0,1,0],.25,'#bfe8ff',1.5);
  for(let cm=0;cm<=RT.len;cm+=10){const y=top-cm*k;s.seg([.27,y,0],[.4,y,0],C.white,1.2);if(cm%20===0)s.label([.62,y,0],cm,C.muted,10)}
  // reservoir moves with the water level; rubber tube joins it to the bottom
  const ry=wy-.1;s.cyl([1.4,ry,0],[0,1,0],.3,.8,'#2f7fc8',{alpha:.55});s.cyl([1.4,ry,0],[0,1,0],.32,.85,C.glass,{alpha:.14});
  s.path([[0,bot,0],[.5,bot-.05,0],[1.1,Math.min(ry-.4,bot+.2),0],[1.4,ry-.42,0]],'#3b3f45',4);
  // standing wave in the air column: node at the water, antinode just above the mouth
  const amp=.18*m.loud*Math.sin(TAU*1.6*t),pts=[];for(let i=0;i<=60;i++){const d=p.L*i/60,y=wy+d*k,sh=Math.sin(TAU*d/m.lam);pts.push([amp*sh,y,0])}
  if(m.loud>.15){s.path(pts,C.gold,2.2);s.path(pts.map(([x,y,z])=>[-x,y,z]),C.gold+'88',1.5,[4,4])}
  // tuning fork above the mouth, prongs vibrating
  const vib=.025*Math.sin(TAU*9*t);s.box([-.12-vib,top+.75,0],[.07,.75,.07],C.steel);s.box([.12+vib,top+.75,0],[.07,.75,.07],C.steel);s.box([0,top+.34,0],[.31,.07,.07],C.steel);s.cyl([0,top+.12,0],[0,1,0],.035,.38,C.steel);
  s.label([0,top+1.35,0],f(+p.f,1)+' Hz',C.white,13);
  s.arrow([-.55,top,0],[-.55,wy,0],C.mint,2,8);s.label([-.95,(top+wy)/2,0],'L = '+f(p.L,1)+' cm',C.mint,12,'right');
  s.render();
  // sound-level meter
  const bx=40,by=150,bh=170;c.save();c.fillStyle='#0d2132e6';c.strokeStyle='#294358';c.beginPath();c.roundRect(bx,by,30,bh,8);c.fill();c.stroke();
  const lv=clamp(m.loud,0,1);c.fillStyle=lv>=.9?C.mint:lv>.35?C.gold:C.muted;c.fillRect(bx+6,by+bh-6-lv*(bh-12),18,lv*(bh-12));c.restore();
  tag(c,'loudness',bx-2,by+bh+16,C.muted,12);
  tag(c,m.loud>=.9?'Resonance — the air column vibrates with the fork':'Raise or lower the water to find the loudest sound',44,98,m.loud>=.9?C.mint:C.muted,13)},
 assumption:'Tube diameter 5 cm, end correction e = 0.3 d = 1.5 cm; v = 331 + 0.6 T m/s; loudness from a damped resonance model.'});

/* ---------- Sonometer: frequency and length ---------- */
const SON={x0:-2.6,k:.05};
const sonModel=p=>{const T=p.M*g,mu=+p.mu,v=Math.sqrt(T/mu),fs=v/(2*p.l/100),x=fs/p.f-1,loud=1/Math.sqrt(1+(x/.006)**2);return{T,mu,v,fs,loud}};
add({base:'wave',id:'sonometer',title:'Sonometer: frequency and length',
 description:'Press a vibrating tuning fork on the sonometer box and move the bridge until the paper rider on the wire flies off.',
 formula:'f = (1/2l) √(T/μ)  ⇒  f × l = constant at fixed tension',
 observe:'At resonance the wire between the bridges vibrates strongly and throws off the paper rider.',
 tryText:'Find the resonant length for two different forks. Is f × l the same?',
 controls:[S('f','Tuning fork',256,[[256,'256 Hz'],[288,'288 Hz'],[320,'320 Hz'],[341.3,'341.3 Hz'],[384,'384 Hz'],[426.7,'426.7 Hz'],[480,'480 Hz'],[512,'512 Hz']]),
  R('l','Vibrating length l',10,100,.1,35,'cm',1),R('M','Load on hanger',1,8,.5,4,'kg',1),S('mu','Wire',.00087,[[.00087,'Steel, 28 SWG (μ = 0.87 g/m)'],[.00136,'Steel, 26 SWG (μ = 1.36 g/m)'],[.00064,'Brass, 30 SWG (μ = 0.64 g/m)']])],
 presets:[['Near resonance (256 Hz, 4 kg)',{f:256,M:4,l:41}],['Higher fork (512 Hz, 4 kg)',{f:512,M:4,l:20}]],
 metrics:p=>{const m=sonModel({...p,f:+p.f});return[N('Vibrating length',p.l,'cm',1),N('Tension T = Mg',m.T,'N',1),N('Paper rider',m.loud>=.9?'Flies off — resonance!':m.loud>.3?'Flutters':'At rest'),N('Loudness',m.loud*100,'%',0)]},
 draw:(c,p,t)=>{const m=sonModel({...p,f:+p.f}),s=P3.scene(c,{scale:54,cy:225,pitch:.42}),X=SON.x0,b2=X+p.l*SON.k,wy=.62;
  s.box([0,0,0],[6.2,.5,1.1],C.wood);s.box([0,.27,0],[6.2,.04,1.1],'#c48d55');s.box([3.15,.35,0],[.12,.7,.5],'#8a5a30');
  for(let cm=0;cm<=100;cm+=10){const x=X+cm*SON.k;s.seg([x,.3,.42],[x,.3,.52],C.white,1);if(cm%20===0)s.label([x,.3,.75],cm,C.muted,10)}
  s.cyl([-3,.45,0],[1,0,0],.05,.15,C.steel);s.cyl([3.2,.72,0],[0,0,1],.16,.12,C.steel);
  for(const x of[X,b2])s.poly([[x-.14,.29,-.3],[x+.14,.29,-.3],[x,wy,-.3]],'#f1e6c8',{alpha:.95}),s.poly([[x-.14,.29,.3],[x+.14,.29,.3],[x,wy,.3]],'#f1e6c8',{alpha:.95});
  // wire: still outside the bridges, vibrating in its fundamental between them
  const A=.22*m.loud*Math.sin(TAU*3*t),pts=[];for(let i=0;i<=40;i++){const x=X+(b2-X)*i/40;pts.push([x,wy+A*Math.sin(PI*i/40),0])}
  s.seg([-3,wy,0],[X,wy,0],'#ffd27a',2.4);s.path(pts,'#ffd27a',2.8);s.seg([b2,wy,0],[3.2,wy,0],'#ffd27a',2.4);
  const hy=.1-p.M*.03;s.seg([3.36,.72,0],[3.36,hy,0],C.copper,2);for(let i=0;i<p.M*2;i++)s.cyl([3.36,hy-.08-i*.06,0],[0,1,0],.22,.05,i%2?'#5d6770':'#6f7a84');
  s.label([3.75,hy-.2,0],f(p.M,1)+' kg',C.white,12);
  // paper rider in the middle of the vibrating length
  const mid=(X+b2)/2,fly=m.loud>=.9?.35+.25*Math.abs(Math.sin(TAU*1.2*t)):0;s.poly([[mid-.13,wy+.2+fly+A,0],[mid,wy+.03+fly+A,0],[mid+.13,wy+.2+fly+A,0]],'#ff6b6b',{alpha:.95,normal:[0,0,1]});s.label([mid,wy+.45+fly,0],'rider',C.muted,10);
  // fork pressed on the box
  const vib=.02*Math.sin(TAU*9*t);s.box([1.6-vib,1.25,0],[.06,.7,.06],C.steel);s.box([1.82+vib,1.25,0],[.06,.7,.06],C.steel);s.box([1.71,.88,0],[.28,.06,.06],C.steel);s.cyl([1.71,.6,0],[0,1,0],.03,.5,C.steel);
  s.label([1.71,1.8,0],f(+p.f,1)+' Hz',C.white,13);
  s.seg([X,wy-.45,-.6],[b2,wy-.45,-.6],C.mint,1.5);s.label([(X+b2)/2,wy-.6,-.6],'l = '+f(p.l,1)+' cm',C.mint,12);
  s.render();
  tag(c,m.loud>=.9?'Resonance — the paper rider is thrown off':'Move the bridge until the paper rider flies off',44,98,m.loud>=.9?C.mint:C.muted,13)},
 assumption:'Ideal flexible wire; tension T = Mg with g = 9.8 m/s²; the wire between the bridges vibrates in its fundamental mode.'});

/* ---------- Prism: angle of minimum deviation ---------- */
const prismModel=p=>{const n=p.n,A=rad(p.A),i=rad(p.i),r1=Math.asin(Math.sin(i)/n),r2=A-r1,se=n*Math.sin(r2);if(r2<0||se>=1)return{ok:false,r1,r2};const e=Math.asin(se);return{ok:true,r1,r2,e,dev:i+e-A}};
const refr=(d,nr,eta)=>{const ci=-(d[0]*nr[0]+d[1]*nr[1]),k=1-eta*eta*(1-ci*ci);if(k<0)return null;const a=eta*ci-Math.sqrt(k);return[eta*d[0]+a*nr[0],eta*d[1]+a*nr[1]]};
add({base:'lens',id:'prism-deviation',flat:true,title:'Prism: angle of minimum deviation',
 description:'Change the angle of incidence on a glass prism and measure the angle of emergence and the deviation.',
 formula:'δ = i + e − A,  n = sin[(A + δₘ)/2] / sin(A/2)',
 observe:'As i increases, δ first decreases and then increases. At the minimum, i = e and the ray inside is parallel to the base.',
 tryText:'Find the angle of incidence that gives the smallest deviation. Is i = e there?',
 controls:[R('i','Angle of incidence i',25,80,.5,40,'°',1),R('A','Angle of prism A',45,65,1,60,'°',0),R('n','Refractive index of glass',1.4,1.7,.01,1.52,'',2)],
 presets:[['Near minimum deviation',{i:50,A:60,n:1.52}],['Grazing incidence',{i:78,A:60,n:1.52}]],
 metrics:p=>{const m=prismModel(p);if(!m.ok)return[N('Angle of incidence',p.i,'°',1),N('Angle of emergence','No emergent ray'),N('Angle of deviation','—'),N('Status','Total internal reflection at the second face')];
  return[N('Angle of incidence',p.i,'°',1),N('Angle of emergence',deg(m.e),'°',1),N('Angle of deviation δ',deg(m.dev),'°',1),N('Inside the prism',`r₁ = ${f(deg(m.r1),1)}°, r₂ = ${f(deg(m.r2),1)}°`)]},
 draw:(c,p,t)=>{const m=prismModel(p),s=P3.scene(c,{scale:54,cy:250}),H=3.4,A=rad(p.A),b=H*Math.tan(A/2),top=[0,1.7],L=[-b,-1.7],Rr=[b,-1.7];
  s.poly([[top[0],top[1],0],[L[0],L[1],0],[Rr[0],Rr[1],0]],C.glass,{alpha:.28,normal:[0,0,1]});s.path([[...top,0],[...L,0],[...Rr,0],[...top,0]],'#bfe8ff',2);
  const len=Math.hypot(b,H),n1=[-H/len,b/len],n2=[H/len,b/len],M1=[(top[0]+L[0])/2,(top[1]+L[1])/2];
  // incident ray: angle i with the inward normal, arriving from below the normal
  const inw=[-n1[0],-n1[1]],ci=Math.cos(rad(p.i)),si=Math.sin(rad(p.i)),d=[inw[0]*ci-inw[1]*si,inw[0]*si+inw[1]*ci],S0=[M1[0]-d[0]*3.2,M1[1]-d[1]*3.2];
  s.seg([...S0,0],[...M1,0],C.gold,2.6);s.arrow([S0[0]+d[0]*1.4,S0[1]+d[1]*1.4,0],[S0[0]+d[0]*1.9,S0[1]+d[1]*1.9,0],C.gold,2.6,9);
  s.seg([M1[0]+n1[0]*1.2,M1[1]+n1[1]*1.2,0],[M1[0]-n1[0]*1.2,M1[1]-n1[1]*1.2,0],C.muted,1.2,[5,5]);
  const d2=refr(d,n1,1/p.n);if(d2){
   // ray inside meets the right face (line top–R)
   const ex=[Rr[0]-top[0],Rr[1]-top[1]],den=d2[0]*ex[1]-d2[1]*ex[0],tt=((top[0]-M1[0])*ex[1]-(top[1]-M1[1])*ex[0])/den,M2=[M1[0]+d2[0]*tt,M1[1]+d2[1]*tt];
   s.seg([...M1,0],[...M2,0],C.gold,2.6);s.seg([M2[0]+n2[0]*1.2,M2[1]+n2[1]*1.2,0],[M2[0]-n2[0]*1.2,M2[1]-n2[1]*1.2,0],C.muted,1.2,[5,5]);
   const d3=refr(d2,[-n2[0],-n2[1]],p.n);
   if(d3){const E=[M2[0]+d3[0]*3.2,M2[1]+d3[1]*3.2];s.seg([...M2,0],[...E,0],C.gold,2.6);s.arrow([M2[0]+d3[0]*1.6,M2[1]+d3[1]*1.6,0],[M2[0]+d3[0]*2.1,M2[1]+d3[1]*2.1,0],C.gold,2.6,9);
    s.seg([...M1,0],[M1[0]+d[0]*4,M1[1]+d[1]*4,0],C.gold+'66',1.4,[6,6]);
    s.label([M2[0]+n2[0]*1.35,M2[1]+n2[1]*1.35,0],'e = '+f(deg(m.e),1)+'°',C.white,12)}
   else{const rf=[d2[0]-2*(d2[0]*n2[0]+d2[1]*n2[1])*n2[0],d2[1]-2*(d2[0]*n2[0]+d2[1]*n2[1])*n2[1]];s.seg([...M2,0],[M2[0]+rf[0]*1.4,M2[1]+rf[1]*1.4,0],C.red,2,[5,4])}}
  s.label([M1[0]+n1[0]*1.35,M1[1]+n1[1]*1.35,0],'i = '+f(p.i,1)+'°',C.white,12);s.label([0,1.2,0],'A',C.white,13);
  s.render();
  tag(c,m.ok?`deviation δ = ${f(deg(m.dev),1)}°  (dashed: the undeviated path)`:'No emergent ray: total internal reflection at the second face',44,98,m.ok?C.muted:C.red,13)},
 assumption:'Monochromatic light (sodium yellow); thin rays; the prism is in air.'});

done();
})();
