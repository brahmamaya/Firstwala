/* True-3D scenes for the original Class 12 experiments on EM waves, optics and modern physics.
   Readouts still come from each experiment's own model; these renderers only draw. */
(() => {
'use strict';
const {f,clamp,rad,deg,cycle,memo,tag,chart,PI,TAU,C}=window.PhysicaLab;
const P3=window.Physica3D,V=P3.vec,hc=1239.84;
const reg=(id,fn)=>{(window.Physica3DRenderers=window.Physica3DRenderers||{})[id]=fn};
const hash=i=>{const x=Math.sin(i*127.1+311.7)*43758.5453;return x-Math.floor(x)};
function spec(nm){let r=0,g=0,b=0;if(nm>=380&&nm<440){r=(440-nm)/60;b=1}else if(nm<490){g=(nm-440)/50;b=1}else if(nm<510){g=1;b=(510-nm)/20}else if(nm<580){r=(nm-510)/70;g=1}else if(nm<645){r=1;g=(645-nm)/65}else if(nm<=780)r=1;else if(nm<380){r=.5;b=.8}else r=.6;const q=x=>Math.round(255*clamp(x,0,1)).toString(16).padStart(2,'0');return'#'+q(r)+q(g)+q(b)}
// Thin lens or mirror outline in the y–z plane at x.
const lensShape=(s,x,h,bulge,col='#7fc8e8')=>{for(let i=0;i<6;i++){const k=i/5;s.cyl([x,0,0],[1,0,0],h*Math.sqrt(1-k*k*.95),Math.max(.02,bulge*(1-k*k)*2),col,{alpha:.4})}};
const arrowObj=(s,x,h,col)=>{s.arrow([x,0,0],[x,h,0],col,4,10)};
const along=(path,q)=>{const i=Math.min(path.length-2,Math.floor(q*(path.length-1))),fr=q*(path.length-1)-i;return V.add(path[i],V.mul(V.sub(path[i+1],path[i]),fr))};

/* ---------- Electromagnetic Waves ---------- */
reg('emwave',(c,p,t)=>{const s=P3.scene(c,{scale:56,yaw:.65,pitch:.25}),k=TAU/(.6+p.wavelength*.6),E=[],B=[];for(let i=0;i<=90;i++){const x=-3.4+6.8*i/90,v=Math.sin(k*x-t*3)*.6*p.amplitude;E.push([x,v,0]);B.push([x,0,v*.8]);if(i%3===0){s.seg([x,0,0],[x,v,0],'#ffc36b88',1.2);s.seg([x,0,0],[x,0,v*.8],'#7baaff66',1.1)}}s.curve(E,C.gold,2.6,6);s.curve(B,C.blue,2,6);s.arrow([-3.4,0,0],[3.6,0,0],C.muted,1.5,11,'travel at c = 3×10⁸ m/s');s.label([-3,1.4*p.amplitude*.6+.3,0],'E',C.gold,14);s.label([-3,0,1.2*p.amplitude*.6+.2],'B',C.blue,14);s.render()});
// EM spectrum: a source emits the selected radiation in 3D; λ in ångström and f in hertz. Entering visible light the
// camera zooms into the 7 colours (VIBGYOR) with their names and wavelength / frequency ranges.
const EMB=[[-14,-11,'Gamma rays','#be4bdb'],[-11,-8,'X-rays','#7950f2'],[-8,-6.42,'Ultraviolet','#4c6ef5'],[-6.42,-6.12,'Visible light',''],[-6.12,-3,'Infrared','#e8590c'],[-3,-1,'Microwaves','#f08c00'],[-1,3,'Radio waves','#fab005']],
  VIB=[['Violet',380,420],['Indigo',420,450],['Blue',450,495],['Green',495,570],['Yellow',570,590],['Orange',590,620],['Red',620,760]],
  SUPD='⁰¹²³⁴⁵⁶⁷⁸⁹',sci=(x,d=2)=>{const e=Math.floor(Math.log10(x)),m=x/10**e;return`${m.toFixed(d)} × 10${String(e).replace('-','⁻').replace(/\d/g,q=>SUPD[q])}`},
  ang=m=>{const a=m*1e10;return a>=.1&&a<1e6?`${a>=100?Math.round(a).toLocaleString('en-IN'):+a.toPrecision(3)} Å`:`${sci(a)} Å`},
  emBand=e=>EMB.find(([a,b])=>e>=a&&e<b)||EMB[EMB.length-1];
let emZoom=0;
// position along the bar: log-scale across the whole spectrum, or (zoomed) 7 equal boxes for the visible colours
const emXv=e=>{const nm=10**e*1e9;if(nm<380)return -3.5-(-6.42-e)*40;if(nm>=760)return 3.5+(e+6.12)*40;const i=VIB.findIndex(([,a,b])=>nm>=a&&nm<b),[,a,b]=VIB[i<0?6:i];return -3.5+7*((i<0?6:i)+(nm-a)/(b-a))/7};
reg('spectrum',(c,p,t)=>{const e=p.exponent,lam=10**e,nm=lam*1e9,vis=nm>=380&&nm<=760,band=emBand(e);emZoom+=((vis?1:0)-emZoom)*.12;if(Math.abs((vis?1:0)-emZoom)<.002)emZoom=vis?1:0;const z=emZoom*emZoom*(3-2*emZoom);
  const s=P3.scene(c,{scale:50,pitch:-.18,yaw:.5,cx:330,cy:250}),Xf=q=>-3.5+7*(q+12)/15,X=q=>Xf(q)+(emXv(q)-Xf(q))*z,cl=x=>clamp(x,-3.8,3.8),Y=.55;
  const col=vis?spec(nm):band[3];
  EMB.forEach(([a,b,n,bc],bi)=>{const x0=cl(X(Math.max(a,-12))),x1=cl(X(b));if(x1-x0<.01)return;
    if(n==='Visible light'){VIB.forEach(([vn,l0,l1],vi)=>{const v0=cl(X(Math.log10(l0*1e-9))),v1=cl(X(Math.log10(l1*1e-9)-1e-9));if(v1-v0<.005)return;s.box([(v0+v1)/2,Y,0],[v1-v0,.5,.8],spec((l0+l1)/2));
        if(z>.6){s.label([(v0+v1)/2,Y+.55,.4],vn,C.white,13);s.label([(v0+v1)/2,Y-(vi%2?.75:.5),.4],`${l0*10}–${l1*10} Å`,'#c9d6e6',10)}});
      if(z<.4)s.label([(x0+x1)/2,Y-.55,.4],'Visible',C.white,11)}
    else{s.box([(x0+x1)/2,Y,0],[x1-x0,.5,.8],bc,{alpha:1-.6*z});if(z<.4)s.label([(x0+x1)/2,Y+(bi%2?-.55:.55),.4],n,C.white,11)}});
  const xp=cl(X(e));s.arrow([xp,Y+1.25,0],[xp,Y+.32,0],C.white,3);
  // the source glows in the colour of the chosen radiation and sends out a 3D wave (E up-down, B across) with photons
  const L=clamp(.25+(e+12)*.085,.25,1.5),k=TAU/L,sx=-3.3,sy=-1.35,pulse=.12+.04*Math.sin(t*6);
  s.ball([sx,sy,0],.24,col,{glow:true});s.ball([sx,sy,0],pulse,'#ffffff',{flat:true,glow:true});
  const E=[],B=[];for(let i=0;i<=120;i++){const x=sx+.3+6.6*i/120,v=Math.sin(k*(x-sx)-t*4)*.5,w=v*.8;E.push([x,sy+v,0]);B.push([x,sy,w]);if(i%4===0)s.seg([x,sy,0],[x,sy+v,0],col+'55',1)}
  s.curve(B,col+'77',1.6,6);s.curve(E,col,3,6);s.seg([sx+.2,sy,0],[3.6,sy,0],'#8ca6b955',1);
  for(let i=0;i<5;i++){const q=cycle(t*.35+i/5,1);s.ball([sx+.3+6.4*q,sy,0],.05,col,{glow:true,flat:true})}
  s.render();
  tag(c,band[2],44,58,col,22,'left','800');tag(c,`λ = ${ang(lam)}`,44,88,C.gold,17);tag(c,`f = ${sci(3e8/lam)} Hz`,250,88,C.gold,17);
  if(vis){const v=VIB.find(([,a,b])=>nm>=a&&nm<b)||VIB[6];tag(c,`${v[0]}: ${v[1]*10}–${v[2]*10} Å  ·  ${(3e17/v[2]/1e14).toFixed(2)}–${(3e17/v[1]/1e14).toFixed(2)} × 10¹⁴ Hz`,44,114,col,15,'left','800');
    tag(c,`Visible light: 3800–7600 Å  ·  3.95–7.89 × 10¹⁴ Hz`,44,138,C.white,14,'left','700')}
  else tag(c,`Range: ${ang(10**Math.max(band[0],-12))} – ${ang(10**band[1])}`,44,114,'#c9d6e6',14)});
reg('radiation-pressure',(c,p,t)=>{const s=P3.scene(c,{scale:56,yaw:.5}),mir=p.surface==='mirror',Pr=(mir?2:1)*p.intensity/3e8,a=.5+Math.sqrt(p.area)*4;s.box([1.6,0,0],[.1,a,a],mir?'#e9f6ff':'#212529');for(let i=0;i<8;i++){const y=(hash(i)-.5)*a*.8,z=(hash(i+3)-.5)*a*.8,q=cycle(t*.8+i/8,1);s.ball([-3+4.5*Math.min(q*1.2,1),y,z],.05,'#ffd43b',{glow:true,flat:true});if(mir&&q>.83)s.ball([1.5-(q-.83)*8,y,z],.05,'#ffd43b',{flat:true})}for(let i=0;i<5;i++)s.seg([-3,(i-2)*.3,0],[1.55,(i-2)*.3,0],'#ffd43b44',2);s.arrow([1.7,0,0],[1.7+.3+Pr*2e5,0,0],C.red,4,11,`F = ${f(Pr*p.area,3)} N`);s.render();tag(c,mir?'Mirror: momentum reverses → twice the push':'Absorber: photons stop → push',44,98,C.gold,14)});
reg('displacement-current',(c,p,t)=>{const s=P3.scene(c,{scale:56,yaw:.4}),ph=Math.sin(TAU*p.frequency*t*.5),a=.4+Math.sqrt(p.area)*3;for(const x of[-.3,.3])s.cyl([x,0,0],[1,0,0],a,.06,x<0?'#ff857e':'#7baaff');s.cyl([-1.9,0,0],[1,0,0],.04,3.2,'#d9844a');s.cyl([1.9,0,0],[1,0,0],.04,3.2,'#d9844a');for(let i=0;i<4;i++){const y=(i-1.5)*.25;s.arrow([-.25,y,0],[-.25+.5*Math.abs(ph)+.01,y,0],'#ffc36b'+Math.round(80+170*Math.abs(ph)).toString(16).padStart(2,'0'),1.5,6,i===3?`I_d = ${f(p.current*Math.abs(ph),2)} nA`:'')}for(const x of[-1.6,0,1.6])s.ring([x,0,0],[1,0,0],a*.6+.2,'#42d9ca'+Math.round(60+180*Math.abs(Math.cos(TAU*p.frequency*t*.5))).toString(16).padStart(2,'0'),2);s.render();tag(c,'mint rings: B field — present around the wire AND around the gap',44,98,C.muted,13)});
reg('photon-energy',(c,p,t)=>{const s=P3.scene(c,{scale:56,yaw:.5,pitch:.2}),fq=Math.pow(10,p.exponent),lam=3e8/fq*1e9,col=lam>=380&&lam<=780?spec(lam):lam<380?'#be4bdb':'#e8590c',k=TAU/clamp(4-(p.exponent-6)*.25,.2,4),x0=-3+cycle(t*.6,1)*4;s.curve(Array.from({length:81},(_,i)=>{const x=-3.4+6.8*i/80;return[x,.6*Math.exp(-((x-x0)**2)/.8)*Math.sin(k*x-t*6),0]}),col,2.6,8);s.render();tag(c,`f = ${fq.toExponential(2)} Hz`,44,98,C.gold,15)});
reg('em-field-intensity',(c,p,t)=>{const s=P3.scene(c,{scale:56,yaw:.6}),I=.5*8.854e-12*3e8*p.electric**2,a=.4+Math.sqrt(p.area)*.15,E=[],k=TAU/1.2;for(let i=0;i<=60;i++){const x=-3.4+4.4*i/60;E.push([x,.5*Math.sin(k*x-t*3)*clamp(p.electric/500,.2,1.6),0])}s.curve(E,C.gold,2.4,6);s.box([1.4,0,0],[.06,a*2,a*2],'#42d9ca',{alpha:clamp(.15+I/2000,.15,.9)});s.render();tag(c,`I = ½ε₀cE₀² = ${f(I,1)} W/m²`,44,98,C.gold,15)});

/* ---------- Ray Optics ---------- */
function lensScene(c,p,t,u,fcm,mirror){const s=P3.scene(c,{scale:50,pitch:.2,yaw:.25}),k=.045,h=.7,v=u*fcm/(u-fcm),m=-v/u,ox=-u*k,ix=(mirror?-v:v)*k,real=v>0;s.seg([-3.6,0,0],[3.6,0,0],C.muted,1,[4,4]);
  if(mirror){s.lathe([0,0,0],Array.from({length:8},(_,i)=>{const r=1.2*i/7;return[r,.22*(r/1.2)**2]}),'#ced4da',{rot:[0,0,PI/2],segs:28,cull:false});}else lensShape(s,0,1.2,.12);s.ball([-fcm*k,0,0],.05,C.red,{flat:true,label:'F'});s.ball([(mirror?-1:1)*fcm*k,0,0],.05,C.red,{flat:true});
  arrowObj(s,ox,h,C.gold);const ih=clamp(h*m,-1.8,1.8);if(Number.isFinite(ix)&&Math.abs(ix)<6)s.arrow([ix,0,0],[ix,ih,0],real?C.mint:'#42d9ca66',4,10);
  const top=[ox,h,0],img=[ix,ih,0];s.path([top,[0,h,0]],'#ffc36b',1.5);if(real&&Math.abs(ix)<6)s.path([[0,h,0],V.add([0,h,0],V.mul(V.norm(V.sub(img,[0,h,0])),4))],'#ffc36b',1.5);else{const d=V.norm(V.sub([0,h,0],img));s.path([[0,h,0],V.add([0,h,0],V.mul(d,3))],'#ffc36b',1.5);s.path([img,[0,h,0]],'#ffc36b55',1,[4,4])}
  const d2=V.norm([-ox,-h,0]),out=mirror?[-d2[0],d2[1],0]:d2;s.path([top,[0,0,0],V.mul(out,3.5)],'#ffc36b88',1.5);s.render();return{v,m,real}}
reg('lens',(c,p,t)=>{const r=lensScene(c,p,t,p.objectDistance,p.focalLength,false);tag(c,r.real?'Real, inverted image':'Virtual, upright image (behind the object side)',44,98,r.real?C.mint:C.gold,14)});
reg('concave-mirror',(c,p,t)=>{const r=lensScene(c,p,t,p.u,p.f,true);tag(c,r.real?'Real, inverted image in front of the mirror':'Virtual, upright image behind the mirror',44,98,r.real?C.mint:C.gold,14)});
reg('refraction',(c,p,t)=>{const s=P3.scene(c,{scale:58,pitch:.3}),th=rad(p.angle),sr=p.n1/p.n2*Math.sin(th);s.box([0,-1,0],[6,2,2.4],'#7fc8e8',{alpha:.1+(p.n2-1)*.25});s.box([0,1,0],[6,2,2.4],'#7fc8e8',{alpha:.02+(p.n1-1)*.25});s.seg([0,-2,0],[0,2,0],C.muted,1,[4,4]);const inc=[-2*Math.sin(th),2*Math.cos(th),0];s.path([inc,[0,0,0]],'#ff3b3b',3.5);s.path([[0,0,0],[2*Math.sin(th),2*Math.cos(th),0]],sr<1?'#ff3b3b55':'#ff3b3b',sr<1?1.5:3.5);if(sr<1){const tt=Math.asin(sr);s.path([[0,0,0],[2.2*Math.sin(tt),-2.2*Math.cos(tt),0]],'#ff3b3b',3)}s.label([-2.6,1.6,1.2],`n₁ = ${p.n1}`,C.white,12);s.label([-2.6,-1.6,1.2],`n₂ = ${p.n2}`,C.white,12);s.render();tag(c,sr<1?'Refraction':'Total internal reflection',44,98,sr<1?C.gold:C.mint,15)});
reg('prism-dispersion',(c,p,t)=>{const s=P3.scene(c,{scale:56,pitch:.25}),A=rad(p.angle),Hh=2.2,half=Hh*Math.tan(A/2),tri=[[0,1.2,0],[-half,1.2-Hh,0],[half,1.2-Hh,0]];for(const z of[-.6,.6])s.poly(tri.map(q=>[q[0],q[1],z]),'#e9f6ff',{alpha:.35,cull:false});for(let i=0;i<3;i++){const a=tri[i],b=tri[(i+1)%3];s.poly([[a[0],a[1],-.6],[b[0],b[1],-.6],[b[0],b[1],.6],[a[0],a[1],.6]],'#e9f6ff',{alpha:.2,cull:false})}
  const i0=rad(50),devOf=nm=>{const n=p.index+p.dispersion*(1/((nm/1000)**2)-1/(.55**2)),r1=Math.asin(Math.sin(i0)/n),se=n*Math.sin(A-r1);return Math.abs(se)<1?i0+Math.asin(se)-A:null},dMean=devOf(550)??.4,entry=[-half*.5,1.2-Hh*.5,0];s.path([[-3.4,entry[1]-.6,0],entry],'#ffffff',3);[400,450,500,550,600,650,700].forEach(nm=>{const n=p.index+p.dispersion*(1/((nm/1000)**2)-1/(.55**2)),r1=Math.asin(Math.sin(i0)/n),r2=A-r1,se=n*Math.sin(r2);if(Math.abs(se)>=1)return;const dev=dMean+(i0+Math.asin(se)-A-dMean)*8,dir=[Math.cos(dev-.35),-Math.sin(dev-.35),0],exit=[half*.5,1.2-Hh*.5,0];s.path([entry,exit],spec(nm)+'99',1.2);s.path([exit,V.add(exit,V.mul(dir,3))],spec(nm),2.2)});s.render();tag(c,'violet bends most (largest n), red least — spread drawn ×8',44,98,C.muted,13)});
reg('optical-fibre',(c,p,t)=>{const s=P3.scene(c,{scale:56,pitch:.2,yaw:.3}),crit=Math.asin(p.cladding/p.core),inside=rad(p.angle),hit=PI/2-inside,guided=hit>crit,R=.35;s.cyl([0,0,0],[1,0,0],R+.15,6.4,'#e9f6ff',{alpha:.12,caps:false});s.cyl([0,0,0],[1,0,0],R,6.4,'#7fc8e8',{alpha:.25,caps:false});
  const pts=[[-3.6,-1.2*Math.tan(rad(p.angle))*.5,0],[-3.2,0,0]];let x=-3.2,y=0,dy=Math.tan(inside);for(let i=0;i<30&&x<3.2;i++){const xx=Math.min(3.2,x+((dy>0?R-y:y+R)/Math.abs(dy)));y=y+dy*(xx-x);x=xx;pts.push([x,y,0]);if(!guided){pts.push([x+.6,y+Math.sign(dy)*.8,0]);break}dy=-dy}s.path(pts,'#ff3b3b',2.5);s.render();tag(c,guided?'Total internal reflection guides the light':'Angle too large: light escapes into the cladding',44,98,guided?C.mint:C.red,14)});
reg('contact-lens-pair',(c,p,t)=>{const s=P3.scene(c,{scale:56,pitch:.2,yaw:.3}),P=p.p1+p.p2,fm=P!==0?1/P:Infinity,xF=Number.isFinite(fm)?clamp(fm*3,-3.4,3.4):99;lensShape(s,-.08,1.1,Math.sign(p.p1)*.06+.02,'#7fc8e8');lensShape(s,.08,1.1,Math.sign(p.p2)*.06+.02,'#b89dff');for(const y of[-.8,-.4,.4,.8]){s.path([[-3.4,y,0],[0,y,0]],'#ffc36b',1.5);const end=Number.isFinite(fm)?[3.4,y*(1-3.4/(fm*3)),0]:[3.4,y,0];s.path([[0,y,0],[end[0],clamp(end[1],-2.4,2.4),0]],'#ffc36b',1.5)}if(Math.abs(xF)<3.4)s.ball([xF,0,0],.07,C.red,{flat:true,label:'F'});s.render();tag(c,`P = P₁ + P₂ = ${f(P,1)} D`,44,98,C.gold,15)});

/* ---------- Ultra-Realistic optics bench and dual-nature apparatus (shared by the scenes below and by tenth.js / eleventh.js) ---------- */
const OB=window.PhysicaOpt3D={},YB=.3,RAILTOP=-.73;
const rgb=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)),h2=v=>Math.round(clamp(v,0,1)*255).toString(16).padStart(2,'0');
// A pale card lit by light of colour col at relative intensity v: dark -> colour -> white-hot. The eye's response is not linear, hence the power.
const lit=(col,v)=>{const k=Math.pow(clamp(v,0,1),.55),w=Math.max(0,k-.72)*2.2,B=[24,27,32];return'#'+rgb(col).map((q,i)=>{const o=B[i]+(q-B[i])*k;return h2((o+(255-o)*w)/255)}).join('')};
const sinc2=x=>Math.abs(x)<1e-6?1:(Math.sin(x)/x)**2;
// wooden table with an aluminium optical rail and a ruler scale
OB.bench=(s,x0,x1)=>{const xm=(x0+x1)/2,w=x1-x0;s.box([xm,-1,0],[w+1.4,.34,2.3],'#6d4b2f',{ground:true});s.box([xm,-.78,0],[w+.5,.1,.36],'#a4acb4',{ground:true});for(let x=Math.ceil(x0*4)/4;x<=x1+.001;x+=.25)s.seg([x,RAILTOP+.005,-.1],[x,RAILTOP+.005,.1],'#4a5058',1,[],-4.9e5)};
OB.stand=(s,x,yTop)=>{s.box([x,-.69,0],[.5,.08,.5],'#2d3238');s.cyl([x,(-.65+yTop)/2,0],[0,1,0],.03,Math.max(.05,yTop+.65),'#b9c0c7',{seg:8})};
// metal holder around a slide, polaroid or screen
OB.holder=(s,x,y,H,W)=>{for(const sy of[-1,1])s.box([x,y+sy*(H/2+.04),0],[.12,.08,W+.16],'#8b939b');for(const sz of[-1,1])s.box([x,y,sz*(W/2+.04)],[.12,H+.16,.08],'#8b939b');OB.stand(s,x,y-H/2-.08)};
OB.laser=(s,x,col,y=YB)=>{OB.stand(s,x,y-.17);s.cyl([x,y,0],[1,0,0],.15,1,'#262b31',{seg:14,cap:'#1b1f24'});s.cyl([x-.3,y,0],[1,0,0],.16,.1,'#b99a2e',{seg:14});s.cyl([x+.5,y,0],[1,0,0],.1,.05,'#0d0f12',{seg:12,cap:'#000'});s.ball([x+.54,y,0],.05,col,{glow:true,flat:true});s.ball([x-.12,y+.155,0],.022,'#ff4d4d',{flat:true,glow:true})};
OB.beam=(s,a,b,col,w=3)=>{s.seg(a,b,col+'2e',w*3.4);s.seg(a,b,col+'77',w*1.5);s.seg(a,b,col,w*.55)};
// opaque slide with vertical slits (slit centres zs, width sw)
OB.plate=(s,x,zs,sw,H=1.5,W=1.7,y=YB)=>{let cur=-W/2;for(const zc of zs){const a=zc-sw/2,b=zc+sw/2;if(a>cur+.002)s.box([x,y,(cur+a)/2],[.07,H,a-cur],'#1b1f24');cur=b}if(cur<W/2)s.box([x,y,(cur+W/2)/2],[.07,H,W/2-cur],'#1b1f24');OB.holder(s,x,y,H,W);for(const zc of zs)s.seg([x+.045,y-H/2+.03,zc],[x+.045,y+H/2-.03,zc],'#ffffffcc',1.4,[],undefined)};
// a white card that shows the light pattern fn(zn), zn in [-1,1] across the card
OB.screen=(s,x,half,H,fn,col,N=140,y=YB)=>{s.box([x+.06,y,0],[.05,H+.2,2*half+.2],'#23282e');OB.stand(s,x,y-H/2-.1);const dz=2*half/N;for(let i=0;i<N;i++){const z0=-half+dz*i;s.poly([[x,y-H/2,z0],[x,y+H/2,z0],[x,y+H/2,z0+dz*1.15],[x,y-H/2,z0+dz*1.15]],lit(col,fn((i+.5)/N*2-1)),{shade:false})}};
OB.meter=(s,p,txt,v,col='#1b2129')=>{const [x,y,z]=p;s.box(p,[1.1,.85,.5],'#2a2f35');s.poly([[x-.47,y-.32,z+.256],[x+.47,y-.32,z+.256],[x+.47,y+.38,z+.256],[x-.47,y+.38,z+.256]],'#e9e6da',{shade:false});const px=x,py=y-.2,pz=z+.27;
  for(let k=0;k<=8;k++){const a=-.9+1.8*k/8;s.seg([px+Math.sin(a)*.5,py+Math.cos(a)*.5,pz],[px+Math.sin(a)*(k%2?.55:.6),py+Math.cos(a)*(k%2?.55:.6),pz],'#3a4047',1,[],undefined)}
  const a=-.85+1.7*clamp(v,0,1);s.seg([px,py,pz+.01],[px+Math.sin(a)*.52,py+Math.cos(a)*.52,pz+.01],'#c0392b',2,[],undefined);s.ball([px,py,pz+.02],.04,'#222',{flat:true});s.engrave([x,y+.27,z+.27],txt,col,10)};
// Evacuated photocell: glass bulb, metal cathode (left), ring anode (right), light from a lamp. o={col,K,rate,Vr,lampAt}
OB.tube=(s,t,o)=>{const C0=[-.82,.25,0],A0=[.62,.25,0],L=A0[0]-C0[0],lamp=[-3,1.75,0],dir=V.norm(V.sub(C0,lamp));
  s.cyl([0,-1.1,0],[0,1,0],.2,.7,'#cfe8f5',{alpha:.3,seg:12});s.cyl([0,-1.42,0],[0,1,0],.42,.22,'#3a4047',{seg:18,cap:'#4a5058'});
  s.mesh([0,.25,0],[1.3,1.15,1.15],'#cfe8f5',{alpha:.14,rings:9,segs:16,spec:.8});
  s.box([C0[0]-.06,.25,0],[.1,1.05,.9],'#c8a46a');s.ring(A0,[1,0,0],.36,'#dfe4e8',3.2);s.seg([A0[0],.25-.36,0],[0,-.75,0],'#cfd5da',2);s.seg([C0[0]-.06,.25-.5,0],[0,-.75,0],'#cfd5da',2);
  s.cyl(lamp,dir,.34,.85,'#2b3037',{seg:14,cap:'#1a1d21'});s.ball(V.add(lamp,V.mul(dir,.46)),.2,o.col,{glow:true,flat:true});
  s.poly([V.add(lamp,V.mul(dir,.5)),[C0[0],.8,-.46],[C0[0],-.3,.46]],o.col+'1c',{shade:false});
  const np=Math.round(2+6*o.rate);for(let i=0;i<np;i++){const q=cycle(t*.9+i/np,1);s.ball(V.add(V.add(lamp,V.mul(dir,.6)),V.mul(V.sub(C0,V.add(lamp,V.mul(dir,.6))),q)),.05,o.col,{glow:true,flat:true})}
  if(o.K>0){const n=Math.round(3+11*o.rate);for(let i=0;i<n;i++){const u=.25+.75*hash(i+1),q=cycle(t*(.35+.25*Math.sqrt(u))+hash(i+9),1),y=.25+(hash(i+3)-.5)*.75,z=(hash(i+6)-.5)*.65;let d;
      if(!(o.Vr>0))d=L*q;else{const dm=L*u*o.K/o.Vr;d=dm>=L?L*q:dm*(1-(2*q-1)**2)}
      s.ball([C0[0]+.05+d,y,z],.05,'#4dabf7',{flat:true,glow:true})}}};
// optical table
OB.table=(s,w=8)=>{s.box([0,-1.55,0],[w,.3,2.8],'#6d4b2f',{ground:true})};

/* ----- Young's double slit, Fraunhofer single slit: laser, slide, screen with the true pattern ----- */
function slitRig(c,t,o){const s=P3.scene(c,{scale:50,yaw:.85,pitch:.3,cx:352,cy:292}),col=o.col,XS=3.3,half=1.5,SH=1.3,yb=YB;
  OB.bench(s,-4.1,3.9);OB.laser(s,-3.7,col);OB.beam(s,[-3.12,yb,0],[-.05,yb,0],col,3);
  for(const zc of o.zs){s.poly([[0,yb,zc],[XS,yb,-half],[XS,yb,half]],col+'12',{shade:false});
    for(let i=0;i<3;i++){const q=(t*.35+i/3)%1,r=q*3.6,pts=[];for(let k=0;k<=16;k++){const ph=-1.1+2.2*k/16,x=.05+r*Math.cos(ph),z=zc+r*Math.sin(ph);if(x<=XS-.05&&Math.abs(z)<=half)pts.push([x,yb,z])}if(pts.length>1)s.path(pts,col+h2(.55*(1-q)),1.6)}}
  OB.plate(s,0,o.zs,o.sw);OB.screen(s,XS,half,SH,zn=>o.I(zn*o.H),col,150);
  if(o.step)for(let m=-12;m<=12;m++){const z=m*o.step/o.H*half;if(Math.abs(z)<half)s.seg([0,yb,0],[XS-.02,yb,z],col+'44',1.2)}
  const yp=yb+SH/2+.26,pr=[];for(let i=0;i<=120;i++){const zn=-1+2*i/120;pr.push([XS-.03,yp+.6*o.I(zn*o.H),zn*half])}s.curve(pr,'#ffe9a8',2,10);s.seg([XS-.03,yp,-half],[XS-.03,yp,half],'#ffffff44',1,[3,3]);
  const ym=yb-SH/2-.05,yl=yb-SH/2-.27;for(const m of o.marks||[]){const a=m[0]/o.H*half,b=m[1]/o.H*half;s.seg([XS-.03,ym,a],[XS-.03,ym,b],C.gold,3);s.seg([XS-.03,ym-.05,a],[XS-.03,ym+.05,a],C.gold,2);s.seg([XS-.03,ym-.05,b],[XS-.03,ym+.05,b],C.gold,2);s.label([XS-.03,yl,(a+b)/2],m[2],C.gold,12)}
  s.label([XS-.03,yl,-half+.1],'−'+f(o.H,1)+' mm','#9fb0bf',10);s.label([XS-.03,yl,half-.1],'+'+f(o.H,1)+' mm','#9fb0bf',10);
  s.callout([-3.7,yb+.17,0],'laser','#dbe7f0',-6,-62,11);s.callout([0,yb+.78,0],o.name,'#dbe7f0',-42,-66,11);s.callout([XS,yb+SH/2-.1,half*.75],'screen','#dbe7f0',30,-60,11);
  s.render()}
const young=(lam,slit,D)=>lam*1e-9*D/(slit*1e-3)*1000;
reg('doubleslit',(c,p,t)=>{const beta=young(p.wavelength,p.slit,p.distance),sd=.14+.34*(p.slit-.2)/.8,H=Math.max(3*beta,Math.min(8,12*beta));
  slitRig(c,t,{col:spec(p.wavelength),zs:[-sd/2,sd/2],sw:.05,name:'double slit',H,step:beta,marks:[[0,beta,'β']],I:y=>Math.cos(PI*y/beta)**2*sinc2(PI*y/(6*beta))});tag(c,`fringe width β = ${f(beta,2)} mm`,44,98,C.gold,15)});
reg('fringe-width',(c,p,t)=>{const beta=young(p.wavelength,p.slit,p.D),sd=.14+.34*(p.slit-.2)/.8,H=Math.max(3*beta,Math.min(8,12*beta));
  slitRig(c,t,{col:spec(p.wavelength),zs:[-sd/2,sd/2],sw:.05,name:'double slit',H,step:beta,marks:[[0,beta,'β = '+f(beta,2)+' mm']],I:y=>Math.cos(PI*y/beta)**2*sinc2(PI*y/(6*beta))});tag(c,'β = λD / d : fringe spacing on the screen',44,98,C.gold,14)});
reg('diffraction',(c,p,t)=>{const y1=young(p.wavelength,p.width,p.distance),H=4.2*y1,sw=.06+.34*(p.width-.05)/.45;
  slitRig(c,t,{col:spec(p.wavelength),zs:[0],sw,name:'single slit',H,marks:[[-y1,y1,'2λD/a = '+f(2*y1,1)+' mm']],I:y=>sinc2(PI*y/y1)});tag(c,'central maximum is twice as wide as the others',44,98,C.muted,13)});
reg('diffraction-grating',(c,p,t)=>{const s=P3.scene(c,{scale:48,yaw:.8,pitch:.3,cx:345,cy:292}),col=spec(p.wavelength),dsp=1e-3/p.density,XS=3.4,half=2.45,SH=1.2,yb=YB,ord=[];
  for(let m=-p.order;m<=p.order;m++){const sn=m*p.wavelength*1e-9/dsp;if(Math.abs(sn)>=1)continue;const th=Math.asin(sn),tn=Math.tan(th),xe=tn?Math.min(XS,half/Math.abs(tn)):XS;ord.push({m,A:1/(1+.35*Math.abs(m)),xe,ze:tn*xe,onScreen:xe>=XS-1e-6})}
  OB.bench(s,-4.1,3.9);OB.laser(s,-3.7,col);OB.beam(s,[-3.12,yb,0],[-.05,yb,0],col,3);
  s.box([0,yb,0],[.05,1.3,1.5],'#cfe8f5',{alpha:.2});OB.holder(s,0,yb,1.3,1.5);const nl=Math.round(clamp(p.density/14,6,34));for(let i=0;i<nl;i++){const z=-.7+1.4*(i+.5)/nl;s.seg([.035,yb-.6,z],[.035,yb+.6,z],'#ffffff66',1,[],undefined)}
  OB.screen(s,XS,half,SH,zn=>{const z=zn*half;let v=0;for(const o of ord)if(o.onScreen)v+=o.A*Math.exp(-(((z-o.ze)/.06)**2));return Math.min(1,v)},col,230);
  for(const o of ord){OB.beam(s,[.02,yb,0],[o.xe-.02,yb,o.ze],col,o.m===0?3:2.4*o.A+.4);if(o.onScreen)s.label([XS-.03,yb+SH/2+.14,o.ze],'m='+(o.m>0?'+':o.m<0?'−':'')+Math.abs(o.m),C.white,11)}
  s.callout([-3.7,yb+.17,0],'laser','#dbe7f0',-6,-62,11);s.callout([0,yb+.74,0],`grating, d = ${f(dsp*1e6,2)} µm`,'#dbe7f0',-30,-70,11);s.callout([XS,yb+SH/2-.1,-half*.8],'screen','#dbe7f0',-20,-72,11);
  s.render();tag(c,'beams appear only where d sinθ = mλ',44,98,C.muted,13)});

/* ----- Polaroids and Malus's law ----- */
reg('polarization',(c,p,t)=>{const s=P3.scene(c,{scale:54,yaw:.55,pitch:.25,cx:330,cy:292}),th=rad(p.angle),y0=.3,X1=-1,X2=1.1,XD=3.2,k=3.2,I2=Math.cos(th)**2,cl='#ffe9a8',ph=-5*t;
  OB.bench(s,-4.1,3.9);OB.stand(s,-3.6,y0-.34);s.cyl([-3.7,y0,0],[1,0,0],.3,.7,'#2b3037',{seg:14,cap:'#1a1d21'});s.cyl([-3.3,y0,0],[1,0,0],.34,.18,'#8d959d',{seg:14});s.ball([-3.2,y0,0],.2,cl,{glow:true,flat:true});
  const pol=(x,a)=>{const d=[0,Math.cos(a),Math.sin(a)],e=[0,-Math.sin(a),Math.cos(a)],O=[x,y0,0];s.cyl(O,[1,0,0],.9,.05,'#8f98a1',{alpha:.4,seg:28,cap:'#8f98a166'});s.ring(O,[1,0,0],.9,'#c6ccd2',4,[],36);
    for(let i=-4;i<=4;i++){const off=i*.19,hl=Math.sqrt(.81-off*off),m=V.add(O,V.mul(e,off));s.seg(V.add(m,V.mul(d,-hl)),V.add(m,V.mul(d,hl)),'#1e2530bb',1.1)}OB.stand(s,x,y0-.9);s.ball(V.add(O,V.mul(d,.9)),.07,'#e0b040',{flat:true})};
  // unpolarised light: electric field in every direction
  for(let i=0;i<13;i++){const x=-3.0+(X1+.1+3.0)*i/12,a=hash(i+4)*PI,A=.34*Math.sin(k*x*2+ph+hash(i)*6);s.seg([x,y0,0],[x,y0+Math.cos(a)*A,Math.sin(a)*A],cl+'cc',1.6)}
  pol(X1,0);pol(X2,th);
  const w1=[],w2=[];for(let i=0;i<=18;i++){const x=X1+.1+(X2-X1-.2)*i/18,v=.4*Math.sin(k*x+ph);w1.push([x,y0+v,0]);if(i%2===0)s.seg([x,y0,0],[x,y0+v,0],cl+'66',1)}s.curve(w1,cl,2.6,6);
  for(let i=0;i<=22;i++){const x=X2+.1+(XD-X2-.3)*i/22,v=.4*Math.cos(th)*Math.sin(k*x+ph);w2.push([x,y0+v*Math.cos(th),v*Math.sin(th)]);if(i%2===0)s.seg([x,y0,0],[x,y0+v*Math.cos(th),v*Math.sin(th)],cl+'66',1)}s.curve(w2,cl,2.6,6);
  const arc=[];for(let i=0;i<=14;i++){const a=th*i/14;arc.push([X2,y0+1.05*Math.cos(a),1.05*Math.sin(a)])}s.path(arc,C.gold,2);s.label([X2,y0+1.18*Math.cos(th/2),1.18*Math.sin(th/2)],'θ',C.gold,13);
  s.box([XD,y0,0],[.06,1.35,1.35],lit('#fff3c4',.1+.9*I2));OB.stand(s,XD,y0-.7);s.ball([XD-.06,y0,0],.5,'#ffd060',{flat:true,alpha:.1+.8*I2,glow:I2>.4});
  s.callout([-3.5,y0+.3,0],'lamp','#dbe7f0',-6,-72,11);s.callout([X1,y0+.9,0],'polariser','#dbe7f0',-34,-60,11);s.callout([X2,y0+.9,0],'analyser','#dbe7f0',26,-62,11);s.callout([XD,y0+.65,0],'screen','#dbe7f0',14,-66,11);
  s.render();tag(c,`I = I₀cos²θ → ${f(p.intensity/2*I2,1)} units`,44,98,C.gold,15)});

/* ----- Soap film (thin-film interference) ----- */
reg('thin-film',(c,p,t)=>{const s=P3.scene(c,{scale:47,yaw:.3,pitch:.3,cx:350,cy:300}),n=p.index,d=2*n*p.thickness,R=Math.sin(PI*d/p.wavelength)**2,col=spec(p.wavelength),tw=.14+.62*p.thickness/800,yi=.25,i=rad(35),sr=Math.sin(i)/n,cr=Math.sqrt(1-sr*sr),tr=sr/cr;
  OB.table(s,8);for(const x of[-2.9,2.9])s.cyl([x,(-1.4+yi)/2,0],[0,1,0],.04,yi+1.4,'#b9c0c7',{seg:8});
  s.box([-2.7,yi-tw/2,0],[.1,tw+.08,2.4],'#a9b0b7');s.box([2.7,yi-tw/2,0],[.1,tw+.08,2.4],'#a9b0b7');
  s.box([0,yi-tw/2,0],[5.3,tw,2.2],'#9fd3f0',{alpha:.3});const ra=(.12+.8*R);s.poly([[-2.65,yi+.003,-1.1],[2.65,yi+.003,-1.1],[2.65,yi+.003,1.1],[-2.65,yi+.003,1.1]],col+h2(ra),{shade:false});
  const A=[-.7,yi,0],u=[Math.sin(i),-Math.cos(i),0],w=[Math.sin(i),Math.cos(i),0],B=[A[0]+sr/cr*0+tw*tr,yi-tw,0],Cp=[A[0]+2*tw*tr,yi,0],L=V.sub(A,V.mul(u,2.3));
  const wd=1.2+2.2*R;OB.beam(s,L,A,col,3);s.seg(A,V.add(A,V.mul(w,2.3)),col,wd);s.path([A,B,Cp],col+'cc',2.2);s.seg(Cp,V.add(Cp,V.mul(w,2.3)),col,wd);s.seg(B,V.add(B,[tr*.9,-.9,0]),col+'55',1.4);
  s.seg([A[0],yi-.7,0],[A[0],yi+1.1,0],'#ffffff55',1,[4,4]);
  const eye=V.add(V.add(A,V.mul(w,2.75)),[tw*tr,0,0]);s.ball(eye,.25,'#f4efe6');s.ball(V.add(eye,[-.1,-.1,.1]),.12,'#35557a',{flat:true});s.ball(V.add(eye,[-.14,-.14,.15]),.06,'#05070a',{flat:true});
  s.cyl(V.sub(L,V.mul(u,.45)),u,.3,.8,'#2b3037',{seg:14,cap:'#1a1d21'});s.ball(L,.18,'#fff2c4',{glow:true,flat:true});
  s.callout(V.add(A,V.mul(w,1.5)),'ray 1: top surface (phase jump π)','#dbe7f0',-40,-60,10);s.callout(V.add(Cp,V.mul(w,1.0)),'ray 2: bottom surface','#dbe7f0',50,36,10);s.callout([-2.7,yi-tw/2,.9],`soap film  n = ${f(n,1)}  t = ${f(p.thickness,0)} nm`,'#dbe7f0',-10,52,10);
  s.callout(eye,R>.6?'bright':R<.2?'dark':'dim',R>.6?C.gold:'#9fb0bf',-34,-14,11);
  s.render();tag(c,R>.6?'Constructive: bright reflection':R<.2?'Destructive: dark reflection':'Partial reinforcement',44,98,C.gold,14);tag(c,`extra path 2nt = ${f(d,0)} nm  =  ${f(d/p.wavelength,2)} λ`,44,120,C.muted,12)});

/* ----- Photocell: photoelectric effect and stopping potential ----- */
reg('photoelectric',(c,p,t)=>{const s=P3.scene(c,{scale:47,yaw:.3,pitch:.2,cx:372,cy:290}),E=hc/p.wavelength,K=E-p.workFunction,col=spec(p.wavelength),rate=p.intensity/100;
  OB.table(s,9);OB.tube(s,t,{col,K,rate,Vr:0});OB.meter(s,[2.6,-.9,0],'µA',K>0?.15+.8*rate:0);
  s.path([[0,-1.5,.1],[0,-1.5,.7],[2.6,-1.5,.7],[2.6,-1.33,.3]],'#c0392b',2.5);s.path([[.1,-1.5,-.1],[.1,-1.5,-.7],[2.9,-1.5,-.7],[2.9,-1.33,-.2]],'#2b3037',2.5);
  s.callout([-.88,.25,.3],'metal plate (cathode)','#dbe7f0',-34,70,11);s.callout([.62,.61,0],'collector (anode)','#dbe7f0',40,-52,11);s.callout([-3,1.75,0],'light source','#dbe7f0',0,-30,11);
  s.render();tag(c,K>0?`Electrons ejected, K_max = ${f(K,2)} eV`:'No emission: photon energy below the work function',44,98,K>0?C.mint:C.red,14)});
reg('stopping-potential',(c,p,t)=>{const s=P3.scene(c,{scale:40,cx:225,cy:290,yaw:.3,pitch:.2}),E=4.1357e-15*p.freq*1e14,V0=E-p.work,col=spec(c0nm(p.freq));
  OB.table(s,8);OB.tube(s,t,{col,K:V0,rate:.7,Vr:V0>0?V0:0});OB.meter(s,[1.5,-.9,.2],V0>0?f(V0,2)+' V':'0 V',V0>0?V0/5:0);OB.meter(s,[2.9,-.9,.2],'I = 0',0);
  s.path([[0,-1.5,.1],[0,-1.5,.8],[1.5,-1.5,.8],[1.5,-1.33,.5]],'#c0392b',2.5);s.path([[1.5,-1.33,.5],[1.5,-1.5,.9],[2.9,-1.5,.9],[2.9,-1.33,.5]],'#c0392b',2.5);s.path([[.1,-1.5,-.1],[.1,-1.5,-.6],[3.3,-1.5,-.6],[3.3,-1.33,-.1]],'#2b3037',2.5);
  s.callout([.62,.61,0],'collector kept negative','#dbe7f0',30,-56,10);s.render();
  chart(c,430,96,226,170,{title:'V₀ vs frequency (slope h/e)',xl:'×10¹⁴ Hz',xmin:4,xmax:15,ymin:0,ymax:5,series:[{fn:x=>Math.max(0,4.1357e-15*x*1e14-p.work),col:C.gold}],marker:[p.freq,Math.max(0,V0)]});
  tag(c,V0>0?`stopping potential V₀ = ${f(V0,2)} V`:'below threshold: no electrons',44,98,V0>0?C.mint:C.red,14)});
const c0nm=fq=>3e17/(fq*1e14);

/* ----- Electron gun: de Broglie wavelength ----- */
reg('debroglie',(c,p,t)=>{const s=P3.scene(c,{scale:52,yaw:.4,pitch:.22,cx:335,cy:290}),lam=1.227/Math.sqrt(p.voltage),Lw=clamp(lam*4,.15,1.5),k=TAU/Lw,yb=.3,x0=-1.6+cycle(t*.5,1)*4.2;
  OB.table(s,9);s.cyl([0,yb,0],[1,0,0],.62,6.2,'#cfe8f5',{alpha:.11,caps:false,seg:20});
  s.cyl([-3.15,yb,0],[1,0,0],.5,.35,'#7a828a',{seg:16,cap:'#9aa1a8'});s.helix([-2.85,yb,0],[1,0,0],.1,.3,5,'#ff9a3c',2);s.ball([-2.85,yb,0],.2,'#ff8a2a',{glow:true,flat:true,alpha:.5});
  s.box([-2.2,yb+.42,0],[.07,.42,.8],'#c9d0d6');s.box([-2.2,yb-.42,0],[.07,.42,.8],'#c9d0d6');
  s.box([3.1,yb,0],[.07,1.0,1.0],'#1f4a34');s.ball([3.03,yb,0],.28,'#7dffb0',{glow:true,flat:true,alpha:.75});
  s.box([-1,-1.2,0],[1.7,.6,.9],'#2d3238');s.engrave([-1,-1.2,.46],'V = '+f(p.voltage,0)+' volt','#69db7c',12);s.path([[-2.8,yb-.25,0],[-2.8,-1.0,.2],[-1.85,-1.2,.35]],'#c0392b',2.5);s.path([[-2.2,yb-.62,0],[-2.2,-1.0,-.2],[-1.85,-1.2,-.35]],'#2b3037',2.5);
  const E=[];for(let i=0;i<=100;i++){const x=-2+5*i/100,g=Math.exp(-((x-x0)**2)/.7);E.push([x,yb+.38*g*Math.cos(k*x-t*8),0])}s.curve(E,'#4dabf7',2.6,8);
  for(let i=0;i<6;i++){const q=cycle(t*.6+i/6,1);s.ball([-2.2+5.2*q,yb+(hash(i)-.5)*.25,(hash(i+2)-.5)*.25],.045,'#cfe9ff',{flat:true,glow:true})}
  const xm=-.6;s.seg([xm,yb-.75,0],[xm+Lw,yb-.75,0],C.gold,2.5);s.seg([xm,yb-.82,0],[xm,yb-.68,0],C.gold,2);s.seg([xm+Lw,yb-.82,0],[xm+Lw,yb-.68,0],C.gold,2);s.label([xm+Lw/2,yb-.95,0],'λ',C.gold,15);
  s.callout([-2.85,yb,0],'hot filament','#dbe7f0',-10,-70,11);s.callout([-2.2,yb+.62,0],'anode (+V)','#dbe7f0',30,-62,11);s.callout([3.1,yb+.5,0],'screen','#dbe7f0',-10,-60,11);
  s.render();tag(c,`λ = 1.227/√V nm = ${f(lam,4)} nm`,44,98,C.gold,15)});

/* ----- Davisson–Germer: Bragg reflection of electrons ----- */
reg('electron-diffraction',(c,p,t)=>{const s=P3.scene(c,{scale:50,yaw:.12,pitch:.07,cx:345,cy:262}),lam=1.227/Math.sqrt(p.voltage),sn=lam/(2*p.spacing),ok=sn<=1,th=ok?Math.asin(sn):.45,dd=clamp(p.spacing*2.6,.28,.75),ct=Math.cos(th),st=Math.sin(th),u=[ct,-st,0],w=[ct,st,0],A=[0,0,0],B=[0,-dd,0];
  const NX=7,NP=4;s.box([0,-dd*(NP-1)/2-.05,0],[3.9,dd*(NP-1)+.25,1.1],'#8d98a3',{alpha:.12});
  for(let j=0;j<NP;j++){s.poly([[-1.95,-dd*j,.55],[1.95,-dd*j,.55],[1.95,-dd*j,-.55],[-1.95,-dd*j,-.55]],'#42d9ca22',{shade:false});for(let i=0;i<NX;i++)for(const z of[-.28,.28])s.ball([-1.5+i*.5,-dd*j,z],.09,'#b9c2cc')}
  const Cf=V.sub(B,V.mul(u,dd*st)),D=V.add(B,V.mul(w,dd*st)),G=V.sub(A,V.mul(u,3.1));
  OB.beam(s,V.sub(G,V.mul(u,0)),A,'#4dabf7',2.6);OB.beam(s,V.sub(B,V.mul(u,2.3)),B,'#4dabf7',2);
  s.cyl(V.sub(G,V.mul(u,.5)),u,.28,1,'#2b3037',{seg:14,cap:'#1a1d21'});s.ball(G,.08,'#cfe9ff',{glow:true,flat:true});
  if(ok){OB.beam(s,A,V.add(A,V.mul(w,3)),'#4dabf7',2.6);OB.beam(s,B,V.add(B,V.mul(w,2.5)),'#4dabf7',2);s.cyl(V.add(A,V.mul(w,3.35)),w,.28,.7,'#2b3037',{seg:14,cap:'#7dffb0'});
    s.seg(A,Cf,C.gold+'99',1.2,[4,4]);s.seg(A,D,C.gold+'99',1.2,[4,4]);s.seg(Cf,B,C.gold,4);s.seg(B,D,C.gold,4);s.label(V.add(V.mul(V.add(Cf,B),.5),[-.3,-.3,0]),'extra path',C.gold,11);s.label(V.add(V.mul(V.add(B,D),.5),[.35,-.3,0]),'2d sinθ = λ',C.gold,11)}
  const arc=[];for(let i=0;i<=12;i++){const a=th*i/12;arc.push([-.7*Math.cos(a)+0,.7*Math.sin(a)*0,0])}
  const ar=[];for(let i=0;i<=10;i++){const a=th*i/10;ar.push([-.9*Math.cos(a),.9*Math.sin(a),0])}s.path(ar,C.mint,2);s.label([-1.12*Math.cos(th/2),1.12*Math.sin(th/2)+.05,0],'θ',C.mint,14);
  s.seg([B[0]-.25,B[1],0],[B[0]+.25,B[1],0],C.white,1);s.arrow([1.95,0,.3],[1.95,-dd,.3],C.white,1.5,6);s.label([2.2,-dd/2,.3],'d',C.white,13);
  s.callout(G,'electron gun','#dbe7f0',-10,-52,11);s.callout([1.5,-dd*(NP-1),.28],'nickel crystal','#dbe7f0',24,40,11);if(ok)s.callout(V.add(A,V.mul(w,3.35)),'detector','#dbe7f0',24,-30,11);
  s.render();tag(c,ok?`Bragg angle θ = ${f(deg(th),1)}°`:'No first-order reflection (λ > 2d)',44,98,C.gold,15)});

/* ----- Compton scattering ----- */
reg('compton',(c,p,t)=>{const s=P3.scene(c,{scale:52,yaw:.12,pitch:.62,cx:330,cy:290}),th=rad(p.angle),dl=2.426*(1-Math.cos(th)),l2=p.wavelength+dl,phi=Math.atan2(1,(1+2.426/p.wavelength)*Math.tan(th/2)||1e-9),ph=th>=PI-1e-6?0:phi;
  s.box([0,-.12,0],[8.4,.16,5],'#2a2f36',{ground:true});for(let a=-80;a<=80;a+=20){const r=2.6,q=rad(a);s.seg([r*Math.cos(q),-.03,-r*Math.sin(q)],[(r+.14)*Math.cos(q),-.03,-(r+.14)*Math.sin(q)],'#8c99a6',1,[],-4.9e5)}
  const arcp=[];for(let i=0;i<=40;i++){const q=-1.4+2.8*i/40;arcp.push([2.6*Math.cos(q),-.03,-2.6*Math.sin(q)])}s.path(arcp,'#8c99a688',1.2,[],-4.9e5);
  s.box([-3.5,.25,0],[.9,.6,.6],'#444b53');s.cyl([-3.0,.25,0],[1,0,0],.17,.4,'#9aa1a8',{seg:12});s.ball([-2.8,.25,0],.07,'#be4bdb',{glow:true,flat:true});
  s.box([0,.2,0],[.5,.5,.5],'#1c2025');s.box([0,.47,0],[.5,.05,.5],'#3a4047');
  const wave=(a,b,lam,col)=>{const d=V.sub(b,a),L=Math.hypot(...d),k=TAU/(lam*.04+.15),N=Math.round(L*10),pts=[];for(let i=0;i<=N;i++){const q=i/N;pts.push(V.add(V.add(a,V.mul(d,q)),[0,.17*Math.sin(k*q*L-t*6),0]))}s.curve(pts,col,2.4,8)};
  const O=[0,.27,0],dir=[Math.cos(th),0,-Math.sin(th)],det=V.add(O,V.mul(dir,2.6));
  wave([-2.7,.27,0],[-.3,.27,0],p.wavelength,'#be4bdb');wave(V.add(O,V.mul(dir,.35)),V.add(O,V.mul(dir,2.2)),l2,'#8e6bff');
  s.box(V.add(det,V.mul(dir,.1)),[.55,.5,.55],'#3b4148',{rotY:Math.atan2(dir[2],dir[0])*-1});s.ball(V.add(det,V.mul(dir,-.18)),.1,'#7dffb0',{flat:true,glow:true});
  const rd=[Math.cos(ph),0,Math.sin(ph)];s.arrow(V.add(O,V.mul(rd,.3)),V.add(O,V.mul(rd,1.7)),C.gold,3,11,'recoil e⁻');s.ball(V.add(O,V.mul(rd,1.7)),.08,'#4dabf7',{glow:true,flat:true});
  const ar=[];for(let i=0;i<=12;i++){const q=th*i/12;ar.push([1.0*Math.cos(q),.04,-1.0*Math.sin(q)])}s.path(ar,C.mint,2);s.label([1.25*Math.cos(th/2),.1,-1.25*Math.sin(th/2)],'θ',C.mint,14);
  s.callout([-3.5,.55,0],'X-ray source','#dbe7f0',-10,-48,11);s.callout([0,.5,0],'graphite target','#dbe7f0',-26,-72,11);s.callout(V.add(det,[0,.3,0]),'detector','#dbe7f0',20,-40,11);
  s.render();tag(c,`Δλ = ${f(dl,3)} pm (longer wavelength after scattering)`,44,98,C.gold,14)});

/* ----- Brewster's angle (shared with tenth.js) ----- */
OB.brewster=(c,p,t)=>{const s=P3.scene(c,{scale:56,yaw:.28,pitch:.26,cx:340,cy:290}),th=rad(p.th),tt=Math.asin(Math.sin(th)/p.n2),ci=Math.cos(th),ct=Math.cos(tt),rs=(ci-p.n2*ct)/(ci+p.n2*ct),rp=(p.n2*ci-ct)/(p.n2*ci+ct),thB=Math.atan(p.n2),Rm=Math.sqrt((rs*rs+rp*rp)/2),e='#ffe27a';
  s.box([0,-1.7,0],[7.2,.3,3],'#6d4b2f',{ground:true});s.box([0,-.78,0],[6.4,1.55,2.3],'#8fd0ea',{alpha:.22});s.poly([[-3.2,.002,-1.15],[3.2,.002,-1.15],[3.2,.002,1.15],[-3.2,.002,1.15]],'#ffffff14',{shade:false});
  for(let a=-90;a<=90;a+=10){const q=rad(a),r=2.3,l=a%30===0?.2:.1;s.seg([r*Math.sin(q),r*Math.cos(q),1.16],[(r+l)*Math.sin(q),(r+l)*Math.cos(q),1.16],'#e9f0f6',1.2);s.seg([r*Math.sin(q),-r*Math.cos(q),1.16],[(r+l)*Math.sin(q),-(r+l)*Math.cos(q),1.16],'#e9f0f688',1)}
  for(const a of[30,60])s.label([2.6*Math.sin(rad(a)),2.6*Math.cos(rad(a)),1.16],a+'°','#e9f0f6',10);
  s.seg([0,-1.5,0],[0,2.6,0],C.muted,1,[4,4]);const L=2.7,inc=[-L*Math.sin(th),L*Math.cos(th),0],ref=[L*Math.sin(th),L*Math.cos(th),0],tr=[L*Math.sin(tt),-L*Math.cos(tt),0],di=V.norm([-inc[0],-inc[1],0]);
  s.cyl(V.mul(V.norm(inc),3.25),di,.13,.8,'#262b31',{seg:12,cap:'#0d0f12'});OB.beam(s,inc,[0,0,0],e,3.2);OB.beam(s,[0,0,0],ref,e,.8+4.5*Rm);OB.beam(s,[0,0,0],tr,e,3);
  const sp=(q,dv,A)=>{s.ball(q,.05,C.mint,{flat:true});if(A>.02)s.seg(V.add(q,V.mul(dv,.2*A)),V.add(q,V.mul(dv,-.2*A)),C.mint,2)};
  for(let i=1;i<=3;i++){const qi=V.mul(inc,i/4),qr=V.mul(ref,i/4);sp(qi,V.norm(V.cross(inc,[0,0,1])),1);sp(qr,V.norm(V.cross(ref,[0,0,1])),Math.min(1,Math.abs(rp)*3))}
  const a0=Math.atan2(ref[1],ref[0]),a1=Math.atan2(tr[1],tr[0]),arc=[];for(let i=0;i<=12;i++){const a=a0+(a1-a0)*i/12;arc.push([.5*Math.cos(a),.5*Math.sin(a),0])}s.path(arc,C.gold,2.2);s.label([.8*Math.cos((a0+a1)/2),.8*Math.sin((a0+a1)/2),0],f(deg(a0-a1),0)+'°',C.gold,12);
  s.callout([-2.9,-.8,1.15],`glass  n₂ = ${f(p.n2,2)}`,'#dbe7f0',-4,40,11);s.callout(V.mul(V.norm(inc),3.5),'laser','#dbe7f0',-26,34,11);
  s.render();tag(c,'dots: s-polarisation (out of page)   bars: p-polarisation',44,98,C.muted,13);tag(c,Math.abs(p.th-deg(thB))<1.2?'Brewster angle: reflected light is fully polarised':`Brewster angle = ${f(deg(thB),1)}°`,44,118,Math.abs(p.th-deg(thB))<1.2?C.mint:C.muted,12)};

/* ----- Resolving power (shared with tenth.js) ----- */
const J1=x=>{const a=Math.abs(x);if(a<8){let sum=0,term=a/2;for(let k=0;k<22;k++){sum+=term;term*=-(a*a/4)/((k+1)*(k+2))}return x<0?-sum:sum}return Math.sqrt(2/(PI*a))*Math.cos(a-3*PI/4)*(x<0?-1:1)};
const airyI=x=>Math.abs(x)<1e-5?1:(2*J1(x)/x)**2;
OB.resolve=(c,p,t)=>{const s=P3.scene(c,{scale:56,yaw:.15,pitch:.62,cx:335,cy:305}),tm=1.22*p.lam*1e-9/(p.D/1000)*206265,sep=1.7,rho=clamp(sep*tm/p.sep,.22,2.3),k=3.8317/rho,col=spec(p.lam),res=p.sep>=tm;
  s.cyl([0,-.1,0],[0,1,0],2.9,.1,'#080b10',{seg:36,cap:'#0b0f15'});s.ring([0,-.04,0],[0,1,0],2.9,'#aeb6be',4,[],48);
  for(const sx of[-1,1]){const cx=sx*sep/2;for(let m=1;m<=3;m++)s.ring([cx,0,0],[0,1,0],rho*[1.22,2.23,3.24][m-1]/1.22,col+h2(.42/m),1.4,[],40);s.ball([cx,.01,0],Math.max(.07,rho*.28),col,{glow:true,flat:true})}
  const sum=[],a=[],b=[];for(let i=0;i<=120;i++){const x=-2.5+5*i/120,A=airyI(k*(x+sep/2)),B=airyI(k*(x-sep/2));a.push([x,.02+A*1.1,-1.55]);b.push([x,.02+B*1.1,-1.55]);sum.push([x,.02+(A+B)*1.1*.6,-1.55])}
  s.curve(a,col+'66',1.3,10);s.curve(b,col+'66',1.3,10);s.curve(sum,'#ffe9a8',2.6,10);s.seg([-2.5,.02,-1.55],[2.5,.02,-1.55],'#ffffff44',1,[3,3]);
  const ys=-1.95;s.seg([-sep/2,0,ys],[sep/2,0,ys],C.mint,3);s.label([0,0,ys+.2],'separation '+f(p.sep,1)+'″',C.mint,12);s.seg([-sep/2,0,ys+.5],[-sep/2+rho,0,ys+.5],C.gold,3);s.label([-sep/2+rho/2,0,ys+.7],'Rayleigh limit '+f(tm,1)+'″',C.gold,12);
  s.callout([-sep/2,.1,0],'star 1','#dbe7f0',-30,-60,11);s.callout([sep/2,.1,0],'star 2','#dbe7f0',34,-56,11);
  s.render();tag(c,res?'Resolved: two distinct peaks':'Not resolved: peaks merge',44,98,res?C.mint:C.red,15)};

/* ----- Prism: minimum deviation (shared with eleventh.js) ----- */
OB.prism=(c,p,t)=>{const s=P3.scene(c,{scale:54,yaw:.22,pitch:.22,cy:268,cx:335}),H=3.4,A=rad(p.A),b=H*Math.tan(A/2),top=[0,1.7],Lf=[-b,-1.7],Rr=[b,-1.7],n=p.n,mix=(a,k)=>[a[0],a[1],k],e='#ffe27a';
  const refr=(d,nr,eta)=>{const ci=-(d[0]*nr[0]+d[1]*nr[1]),kk=1-eta*eta*(1-ci*ci);if(kk<0)return null;const a=eta*ci-Math.sqrt(kk);return[eta*d[0]+a*nr[0],eta*d[1]+a*nr[1]]};
  const hz=.5,tri=z=>[[top[0],top[1],z],[Lf[0],Lf[1],z],[Rr[0],Rr[1],z]];s.box([0,-1.85,0],[2*b+1,.15,1.5],'#2b3037');
  s.poly(tri(-hz),'#cfe8f5',{alpha:.14,shade:false});for(const [a,c2] of[[top,Lf],[Lf,Rr],[Rr,top]])s.poly([[...a,-hz],[...c2,-hz],[...c2,hz],[...a,hz]],'#cfe8f5',{alpha:.16,shade:false,stroke:'#cfe8f566'});s.poly(tri(hz),'#cfe8f5',{alpha:.2,shade:false,stroke:'#e6f4ff'});
  const len=Math.hypot(b,H),n1=[-H/len,b/len],n2=[H/len,b/len],M1=[(top[0]+Lf[0])/2,(top[1]+Lf[1])/2],ok=Math.sin(rad(p.i))/n<1;
  const inw=[-n1[0],-n1[1]],ci=Math.cos(rad(p.i)),si=Math.sin(rad(p.i)),d=[inw[0]*ci-inw[1]*si,inw[0]*si+inw[1]*ci],S0=[M1[0]-d[0]*3.2,M1[1]-d[1]*3.2];
  s.cyl([S0[0]-d[0]*.35,S0[1]-d[1]*.35,0],[d[0],d[1],0],.13,.7,'#262b31',{seg:12,cap:'#0d0f12'});OB.beam(s,[...S0,0],[...M1,0],e,3);
  s.seg([M1[0]+n1[0]*1.3,M1[1]+n1[1]*1.3,0],[M1[0]-n1[0]*1.3,M1[1]-n1[1]*1.3,0],C.muted,1.2,[5,5]);
  let msg=null;const d2=refr(d,n1,1/n);
  if(d2){const ex=[Rr[0]-top[0],Rr[1]-top[1]],den=d2[0]*ex[1]-d2[1]*ex[0],tt=((top[0]-M1[0])*ex[1]-(top[1]-M1[1])*ex[0])/den,M2=[M1[0]+d2[0]*tt,M1[1]+d2[1]*tt];
    OB.beam(s,[...M1,0],[...M2,0],e,2.6);s.seg([M2[0]+n2[0]*1.3,M2[1]+n2[1]*1.3,0],[M2[0]-n2[0]*1.3,M2[1]-n2[1]*1.3,0],C.muted,1.2,[5,5]);
    const d3=refr(d2,[-n2[0],-n2[1]],n);
    if(d3){const E=[M2[0]+d3[0]*3.2,M2[1]+d3[1]*3.2];OB.beam(s,[...M2,0],[...E,0],e,3);s.seg([...M1,0],[M1[0]+d[0]*4,M1[1]+d[1]*4,0],e+'77',1.4,[6,6]);
      s.label([M2[0]+n2[0]*1.5,M2[1]+n2[1]*1.5,0],'e',C.white,13);
      const det=d[0]*d3[1]-d[1]*d3[0];if(Math.abs(det)>1e-3){const q=((M2[0]-M1[0])*d3[1]-(M2[1]-M1[1])*d3[0])/det,X=[M1[0]+d[0]*q,M1[1]+d[1]*q];if(q>0){const a0=Math.atan2(d[1],d[0]),a1=Math.atan2(d3[1],d3[0]),arc=[];for(let i=0;i<=10;i++){const a=a0+(a1-a0)*i/10;arc.push([X[0]+.8*Math.cos(a),X[1]+.8*Math.sin(a),0])}s.path(arc,C.gold,2.2);s.seg([...X,0],[X[0]+d[0]*1.4,X[1]+d[1]*1.4,0],e+'77',1.4,[6,6]);s.label([X[0]+1.1*Math.cos((a0+a1)/2),X[1]+1.1*Math.sin((a0+a1)/2),0],'δ',C.gold,15)}}}
    else{const rf=[d2[0]-2*(d2[0]*n2[0]+d2[1]*n2[1])*n2[0],d2[1]-2*(d2[0]*n2[0]+d2[1]*n2[1])*n2[1]];s.seg([...M2,0],[M2[0]+rf[0]*1.4,M2[1]+rf[1]*1.4,0],C.red,2,[5,4]);msg=1}}
  s.label([M1[0]+n1[0]*1.55,M1[1]+n1[1]*1.55,0],'i',C.white,13);s.label([0,1.98,0],'A',C.white,14);
  const aa=[];for(let i=0;i<=10;i++){const a=-PI/2-A/2+A*i/10;aa.push([top[0]+.55*Math.cos(a),top[1]+.55*Math.sin(a),0])}s.path(aa,C.mint,2);
  s.callout([...M1,0],'glass prism','#dbe7f0',-60,-50,11);
  s.render();tag(c,msg||!d2?'No emergent ray: total internal reflection at the second face':`deviation δ = ${f(deg(prismDev(p)),1)}°  (dashed: the undeviated path)`,44,98,msg||!d2?C.red:C.muted,13)};
const prismDev=p=>{const n=p.n,A=rad(p.A),i=rad(p.i),r1=Math.asin(Math.sin(i)/n),r2=A-r1,se=n*Math.sin(r2);return i+Math.asin(clamp(se,-1,1))-A};
/* ---------- Wave Optics ---------- */

/* ---------- Dual Nature ---------- */
reg('photon-counting',(c,p,t)=>{const s=P3.scene(c,{scale:56,yaw:.4}),rate=p.power*1e-3*p.wavelength*1e-9/(6.626e-34*3e8),col=spec(p.wavelength),n=clamp(Math.round(Math.log10(rate)*2),3,40);s.box([-3,0,0],[.8,.5,.5],'#343a40');s.box([2.8,0,0],[.4,1,1],'#212529');for(let i=0;i<n;i++){const q=cycle(t*.7+i/n,1);s.ball([-2.5+5*q,(hash(i)-.5)*.2,(hash(i+3)-.5)*.2],.05,col,{glow:true,flat:true})}s.render();tag(c,`${rate.toExponential(2)} photons per second (dots on a log scale)`,44,98,C.gold,14)});

/* ---------- Atoms ---------- */
const atom=(s,Z,rings,hl)=>{for(let i=0;i<Z;i++)s.ball([(hash(i)-.5)*.15,(hash(i+3)-.5)*.15,(hash(i+6)-.5)*.15],.12,'#ff857e');rings.forEach((r,i)=>s.ring([0,0,0],[0,1,0],r,i+1===hl?'#42d9ca':'#29475b',i+1===hl?2:1))};
reg('bohr',(c,p,t)=>{const s=P3.scene(c,{scale:54,pitch:.5}),rings=[1,2,3,4,5].map(n=>.35+n*n*.12),lam=1/(1.097e7*p.atomicNumber**2*(1-1/p.level**2))*1e9,ph=cycle(t*.4,1);atom(s,p.atomicNumber,rings,p.level);const r=ph<.5?rings[p.level-1]:rings[0],a=t*2;s.ball([r*Math.cos(a),0,r*Math.sin(a)],.09,'#4dabf7',{glow:true});if(ph>.5){const q=(ph-.5)*2;s.curve(Array.from({length:31},(_,i)=>{const x=.5+q*3*i/30;return[x,.15*Math.sin(i*1.2),0]}),lam>=380&&lam<=780?spec(lam):'#be4bdb',2.2,6)}s.render();tag(c,`photon λ = ${f(lam,1)} nm`,44,98,C.gold,15)});
reg('hydrogen-spectrum',(c,p,t)=>{const s=P3.scene(c,{scale:54,yaw:.3,pitch:.2,cx:240}),E=n=>-13.6/n**2,y=n=>-1.6+3.2*(1-E(n)/E(1));for(let n=1;n<=6;n++){const on=n===p.initial||n===p.final;s.box([0,y(n),0],[2.6,.04,1],on?'#42d9ca':'#29475b');s.label([-1.7,y(n),0],'n='+n,on?C.mint:C.muted,11)}const lam=1/(1.097e7*(1/p.final**2-1/p.initial**2))*1e9,col=lam>=380&&lam<=780?spec(lam):lam<380?'#be4bdb':'#e8590c';s.arrow([.4,y(p.initial),0],[.4,y(p.final),0],col,3,11,p.initial>p.final?`λ = ${f(lam,1)} nm`:'');s.render();
  c.save();const g=c.createLinearGradient(430,0,656,0);for(let i=0;i<=10;i++)g.addColorStop(i/10,spec(380+40*i));c.fillStyle=g;c.fillRect(430,330,226,26);if(lam>=380&&lam<=780){c.fillStyle='#fff';c.fillRect(430+(lam-380)/400*226-1,326,3,34)}c.restore();tag(c,lam>=380&&lam<=780?`Visible line: ${f(lam,0)} nm`:`${lam<380?'Ultraviolet':'Infrared'}: ${f(lam,0)} nm`,430,312,C.gold,13)});
reg('rutherford',(c,p,t)=>{const s=P3.scene(c,{scale:56,pitch:.4}),Z=Number(p.atomicNumber),th=2*Math.atan(1.44*Z/(p.energy*p.impact)),b=.15+p.impact*.02;s.ball([0,0,0],.18,'#ffc36b',{glow:true,label:'nucleus'});const path=[];const N=80;for(let i=0;i<=N;i++){const x=-3.4+3.4*i/N;path.push([x,0,b])}for(let i=1;i<=N;i++){path.push(V.add([0,0,b],V.mul([Math.cos(th),0,Math.sin(th)],3*i/N)))}const smooth=path.map((q,i)=>i>N-8&&i<N+8?V.add(q,[0,0,.2*(1-Math.abs(i-N)/8)]):q);s.path(smooth,'#ff6b6b',2);s.ball(along(smooth,cycle(t*.3,1)),.07,'#ff6b6b',{glow:true});s.render();tag(c,`scattering angle ≈ ${f(deg(th),1)}°`,44,98,C.gold,15)});
reg('franck-hertz',(c,p,t)=>{const s=P3.scene(c,{scale:54,yaw:.3,cx:230}),n=Math.floor(p.voltage/4.9);s.cyl([0,0,0],[1,0,0],.7,5,'#e9f6ff',{alpha:.15});s.box([-2.4,0,0],[.1,.9,.9],'#adb5bd');s.box([1.8,0,0],[.04,.9,.9],'#868e96',{alpha:.6});s.box([2.4,0,0],[.1,.9,.9],'#d9844a');for(let k=1;k<=n;k++){const x=-2.4+4.2*k*4.9/Math.max(p.voltage,.1);s.cyl([x,0,0],[1,0,0],.6,.12,'#69db7c',{alpha:.5})}for(let i=0;i<10;i++){const q=cycle(t*.6+i/10,1);s.ball([-2.3+4.6*q,(hash(i)-.5)*.8,(hash(i+3)-.5)*.8],.04,'#4dabf7',{flat:true})}s.render();
  chart(c,430,96,226,150,{title:'Collector current vs V',xl:'V',xmin:0,xmax:20,ymin:0,series:[{fn:x=>{const m=x%4.9;return Math.max(0,(x/20)*(m/4.9)-(p.retarding/20))+.02},col:C.gold}],marker:[p.voltage,Math.max(0,(p.voltage/20)*((p.voltage%4.9)/4.9)-(p.retarding/20))+.02]});tag(c,`${n} glowing collision layer${n===1?'':'s'}`,44,98,C.mint,14)});
reg('energy-levels',(c,p,t)=>{const s=P3.scene(c,{scale:54,yaw:.3,pitch:.2}),E=n=>-13.6/n**2,y=n=>-1.6+3.2*(1-E(n)/E(1));for(let n=1;n<=6;n++){const on=n===p.ni||n===p.nf;s.box([0,y(n),0],[2.6,.04,1],on?'#42d9ca':'#29475b');s.label([1.7,y(n),0],f(E(n),2)+' eV',on?C.mint:C.muted,11,'left')}if(p.ni!==p.nf){const q=cycle(t*.5,1);s.ball([-.6,y(p.ni)+(y(p.nf)-y(p.ni))*q,0],.09,'#4dabf7',{glow:true});s.arrow([-1,y(p.ni),0],[-1,y(p.nf),0],p.ni>p.nf?C.gold:C.blue,3,11,`ΔE = ${f(Math.abs(E(p.ni)-E(p.nf)),2)} eV`)}s.render();tag(c,p.ni>p.nf?'Emission (photon given out)':p.ni<p.nf?'Absorption (photon taken in)':'No transition',44,98,C.gold,14)});
reg('moseley-xray',(c,p,t)=>{const s=P3.scene(c,{scale:56,pitch:.45}),E=10.2*(p.Z-p.screening)**2;atom(s,Math.min(30,Math.round(p.Z/2)),[.6,1.2,1.8],0);s.ball([.6,0,0],.07,'#495057',{label:'hole'});const q=cycle(t*.5,1);s.ball([1.2-.6*Math.min(1,q*2),0,0],.08,'#4dabf7',{glow:true});if(q>.5){const k=(q-.5)*2;s.curve(Array.from({length:31},(_,i)=>{const x=.6+k*3*i/30;return[x,.12*Math.sin(i*2),.3]}),'#be4bdb',2.2,6)}s.render();tag(c,`E(Kα) ≈ ${f(E/1000,2)} keV`,44,98,C.gold,15)});

/* ---------- Nuclei ---------- */
reg('nuclear',(c,p,t)=>{const s=P3.scene(c,{scale:54,pitch:.35,cx:230}),tt=cycle(t,p.halfLife*5),n=Math.round(p.initial);let left=0;for(let i=0;i<n;i++){const life=p.halfLife*Math.log2(1/Math.max(1e-6,hash(i+1))),alive=tt<life;if(alive)left++;const q=[-1.8+(i%12)*.32,-1+Math.floor(i/12)*.32,(hash(i+5)-.5)*.4];s.ball(q,.12,alive?'#ffc36b':'#495057')}s.render();
  chart(c,430,96,226,150,{title:'N vs time',xl:'s',xmin:0,xmax:p.halfLife*5,ymin:0,ymax:n,series:[{fn:x=>n*Math.pow(.5,x/p.halfLife),col:C.gold}],marker:[tt,left]});tag(c,`${left} undecayed`,44,98,C.gold,15)});
reg('mass-defect',(c,p,t)=>{const s=P3.scene(c,{scale:56}),ph=.5-.5*Math.cos(t*.8),n=Math.round(p.nucleons),E=p.defect*931.5;for(let i=0;i<n;i++){const y=1-2*(i+.5)/n,r=Math.sqrt(1-y*y),a=i*2.4,tight=.12*Math.cbrt(n)*1.6,loose=1.8,R=tight+(loose-tight)*(1-ph);s.ball([R*r*Math.cos(a),R*y,R*r*Math.sin(a)],.13,i%2?'#ff857e':'#adb5bd')}if(ph>.9)for(let i=0;i<8;i++){const u=hash(i)*TAU;s.ball([2*Math.cos(u),2*Math.sin(u)*.5,0],.05,'#ffd43b',{glow:true,flat:true})}s.render();tag(c,`binding energy = Δm c² = ${f(E,1)} MeV`,44,98,C.gold,15)});
reg('fission-chain',(c,p,t)=>{const s=P3.scene(c,{scale:54,pitch:.4}),G=6,ring=g=>.3+g*.5;for(let g=0;g<=G;g++){const Ng=p.initial*p.factor**g,dots=clamp(Math.round(Math.log10(Ng+1)*6),1,60);for(let i=0;i<dots;i++){const a=TAU*i/dots+g;s.ball([ring(g)*Math.cos(a),0,ring(g)*Math.sin(a)],.05,g===Math.floor(cycle(t,G+1))?'#ffd43b':'#ff857e',{flat:true})}}s.ball([0,0,0],.18,'#ffc36b',{glow:true});s.render();tag(c,p.factor>1?'Supercritical: growing chain':p.factor<1?'Subcritical: chain dies out':'Critical: steady',44,98,p.factor>1?C.red:p.factor<1?C.blue:C.mint,14)});
reg('alpha-recoil',(c,p,t)=>{const s=P3.scene(c,{scale:56,pitch:.25}),q=cycle(t*.4,1),Md=p.mass-4,va=Math.sqrt(p.energy),vd=4*va/Md;s.ball([-q*vd*20,0,0],.4,'#adb5bd',{label:'daughter'});s.ball([q*va*1.2,0,0],.15,'#ff857e',{glow:true,label:'α'});const vA=Math.sqrt(2*p.energy*Md/(Md+4)*1.602e-13/(4*1.6605e-27));s.arrow([-.5,.6,0],[-.5-vd*10,.6,0],C.blue,3,11,`v = ${f(vA*4/Md,3)} m/s`);s.arrow([.3,.6,0],[.3+va*.5,.6,0],C.red,3,11,`v_α = ${f(vA,3)} m/s`);s.render();tag(c,'equal and opposite momenta; the light α carries most of the energy',44,98,C.muted,13)});
reg('binding-curve',(c,p,t)=>{const s=P3.scene(c,{scale:56,cx:230}),A=Math.round(p.A),BE=a=>{if(a<2)return 0;if(a<=4)return[0,0,1.11,2.57,7.07][a];const Z=a/(1.98+.0155*a**(2/3)),b=15.8*a-18.3*a**(2/3)-.714*Z*(Z-1)/a**(1/3)-23.2*(a-2*Z)**2/a;return Math.max(0,b/a)};for(let i=0;i<Math.min(A,120);i++){const y=1-2*(i+.5)/Math.min(A,120),r=Math.sqrt(1-y*y),a=i*2.4,R=.18*Math.cbrt(Math.min(A,120))*1.3;s.ball([R*r*Math.cos(a),R*y,R*r*Math.sin(a)],.14,i%2?'#ff857e':'#adb5bd')}s.render();
  chart(c,430,96,226,170,{title:'Binding energy per nucleon',xl:'A',xmin:2,xmax:240,ymin:0,ymax:9.5,series:[{fn:BE,col:C.gold}],marker:[A,BE(A)]})});
reg('radiometric-dating',(c,p,t)=>{const s=P3.scene(c,{scale:56,pitch:.4}),fr=p.remaining/100,n=80;s.mesh([0,0,0],[2.2,1,1.4],'#7d5a3c',{alpha:.35,shape:(u,v)=>1+.12*Math.sin(5*v)*Math.cos(3*u)});for(let i=0;i<n;i++){const q=[(hash(i)-.5)*3.6,(hash(i+3)-.5)*1.4,(hash(i+6)-.5)*2.2];s.ball(q,.07,i<fr*n?'#69db7c':'#868e96')}s.render();tag(c,`age = T½ · log₂(100/${p.remaining}) = ${f(p.halfLife*Math.log2(100/p.remaining),0)} years`,44,98,C.gold,14)});

/* ---------- Semiconductor Electronics ---------- */
reg('diode',(c,p,t)=>{const s=P3.scene(c,{scale:56,pitch:.3}),V0=p.voltage,w=clamp(.6-.25*V0,.08,1.2),fwd=V0>.7;s.box([-1.4-w/2,0,0],[2.8-w,1.2,1.2],'#ffc9c9',{alpha:.6});s.box([1.4+w/2,0,0],[2.8-w,1.2,1.2],'#a5d8ff',{alpha:.6});s.box([0,0,0],[w,1.2,1.2],'#e9ecef',{alpha:.35});s.label([-1.6,.9,0],'p',C.red,15);s.label([1.6,.9,0],'n',C.blue,15);
  for(let i=0;i<12;i++){const x=(fwd?cycle(t*.5+i/12,1)*2.6:hash(i)*2.4),y=(hash(i+3)-.5)*1,z=(hash(i+6)-.5)*1;s.ball([-2.8+x,y,z],.06,'#ff6b6b');s.ball([2.8-x,y,z],.06,'#4dabf7')}s.render();tag(c,fwd?'Forward bias: narrow junction, current flows':V0<0?'Reverse bias: depletion region widens':'Below the knee: little current',44,98,fwd?C.mint:C.gold,14)});
reg('logic-gates',(c,p,t)=>{const s=P3.scene(c,{scale:60,pitch:.25}),a=p.a>=.5?1:0,b=p.b>=.5?1:0,out={AND:a&b,OR:a|b,XOR:a^b,NAND:1-(a&b),NOR:1-(a|b)}[p.gate];s.box([0,0,0],[1.6,1.2,.8],'#2f3d48');s.label([0,0,.5],p.gate,C.white,16);for(const [y,v] of[[.3,a],[-.3,b]]){s.cyl([-1.3,y,0],[1,0,0],.04,1,v?'#ffd43b':'#495057');s.ball([-1.9,y,0],.14,v?'#ffd43b':'#495057',{glow:!!v})}s.cyl([1.3,0,0],[1,0,0],.04,1,out?'#ffd43b':'#495057');s.ball([2,0,0],.22,out?'#69db7c':'#495057',{glow:!!out});s.render();tag(c,`A = ${a}, B = ${b} → Y = ${out}`,44,98,C.gold,15)});
reg('rectifier',(c,p,t)=>{const s=P3.scene(c,{scale:54,pitch:.5,cx:230,cy:290}),vin=p.amplitude*Math.sin(TAU*p.frequency*t),on=vin>p.drop;s.box([0,-.12,0],[5,.16,3],'#16404a');s.cyl([-2,.25,0],[0,1,0],.35,.5,'#2f3d48',{cap:'#e9f6ff'});s.label([-2,.8,0],'AC',C.gold,12);s.cyl([0,.12,-1],[1,0,0],.1,.5,'#1a1a1a');s.cyl([.2,.12,-1],[1,0,0],.105,.06,'#c9d3da');s.cyl([1.8,.12,0],[0,0,1],.12,.8,'#c9a36b');
  s.path([[-2,.03,-.4],[-2,.03,-1],[1.8,.03,-1],[1.8,.03,-.4]],'#d9844a',4);s.path([[-2,.03,.4],[-2,.03,1],[1.8,.03,1],[1.8,.03,.4]],'#d9844a',4);if(on)for(let i=0;i<6;i++){const q=cycle(t+i/6,1);s.ball([-2+3.8*q,.1,-1],.05,'#ffc36b',{flat:true})}s.render();
  chart(c,430,96,226,170,{title:'in (grey) · out (gold)',xl:'t',xmin:0,xmax:2/p.frequency,ymin:-p.amplitude*1.1,ymax:p.amplitude*1.1,series:[{fn:x=>p.amplitude*Math.sin(TAU*p.frequency*x),col:'#8ca6b9',dash:[3,3]},{fn:x=>Math.max(0,p.amplitude*Math.sin(TAU*p.frequency*x)-p.drop),col:C.gold}],marker:[cycle(t,2/p.frequency),Math.max(0,vin-p.drop)]})});
reg('zener-regulator',(c,p,t)=>{const s=P3.scene(c,{scale:54,pitch:.5,cy:290}),Vz=Number(p.zener),Vout=Math.min(Vz,p.input*p.load/(p.load+p.series));s.box([0,-.12,0],[6,.16,3],'#16404a');s.cyl([-2.4,.25,0],[0,1,0],.32,.5,'#2f3d48',{cap:'#e9f6ff'});s.cyl([-1,.12,-1],[1,0,0],.12,.8,'#c9a36b');s.cyl([.6,.12,0],[0,0,1],.1,.5,'#1a1a1a');s.cyl([2,.12,0],[0,0,1],.12,.8,'#c9a36b');s.path([[-2.4,.03,-.4],[-2.4,.03,-1],[2,.03,-1],[2,.03,-.4]],'#d9844a',4);s.path([[-2.4,.03,.4],[-2.4,.03,1],[2,.03,1],[2,.03,.4]],'#d9844a',4);s.path([[.6,.03,-1],[.6,.03,-.25]],'#d9844a',4);s.path([[.6,.03,.25],[.6,.03,1]],'#d9844a',4);s.cyl([2.6,.25,0],[0,1,0],.3,.3,'#212529',{cap:'#e9f6ff'});s.label([2.6,.75,0],`${f(Vout,2)} V`,C.mint,13);s.render();tag(c,'the Zener holds the output near its breakdown voltage',44,98,C.muted,13)});
reg('iv-curve',(c,p,t)=>{const s=P3.scene(c,{scale:58,cx:220,pitch:.3}),I=v=>v>0?Math.exp((v-p.knee)/.05)*.01:-.0005,on=p.voltage>p.knee;s.cyl([0,0,0],[1,0,0],.35,1.6,'#1a1a1a');s.cyl([.6,0,0],[1,0,0],.36,.14,'#c9d3da');s.cyl([-1.5,0,0],[1,0,0],.04,1.4,'#adb5bd');s.cyl([1.5,0,0],[1,0,0],.04,1.4,'#adb5bd');if(on)for(let i=0;i<8;i++){const q=cycle(t*.8+i/8,1);s.ball([-2.2+4.4*q,.0,0],.05,'#ffc36b',{flat:true,glow:true})}s.render();
  chart(c,430,96,226,170,{title:'Diode I–V',xl:'V',xmin:-1,xmax:1,ymin:-.2,ymax:1,series:[{fn:v=>clamp(I(v),-.1,1),col:C.gold}],marker:[p.voltage,clamp(I(p.voltage),-.1,1)]})});
reg('transistor-switch',(c,p,t)=>{const s=P3.scene(c,{scale:56,pitch:.4}),ib=Math.max(0,(p.input-.7)/(p.baseR*1000)),ic=Math.min(p.gain*ib,4.8/220),on=ic>0;s.box([0,-.12,0],[6,.16,3],'#16404a');s.lathe([0,0,0],[[.3,0],[.3,.7],[0,.72]],'#1a1a1a',{segs:16});for(const x of[-.15,0,.15])s.cyl([x,-.05,.2],[0,1,0],.02,.2,'#adb5bd');s.label([0,1,0],'NPN',C.white,12);s.cyl([-1.6,.12,0],[1,0,0],.1,.7,'#c9a36b');s.label([-1.6,.45,0],'R_B',C.muted,11);s.ball([1.6,.4,0],.25,on?'#ffd43b':'#495057',{glow:on});s.label([1.6,.9,0],'load',C.muted,11);s.render();tag(c,on?(p.gain*ib>=4.8/220?'Saturated: switch ON':'Active region'):'Cut off: switch OFF',44,98,on?C.mint:C.muted,14)});
})();
