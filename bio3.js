/* Biology pack 3 — NCERT Class 11, chapters 14–19: human physiology (21 experiments).
   Values follow the rationalised NCERT text; physiological curves are standard teaching models. */
(() => {
'use strict';
const {R,S,N,f,clamp,rad,deg,cycle,tag,chart,pack,PI,TAU,C}=window.PhysicaLab;
const P3=window.Physica3D,V=P3.vec,{BC,hash,critter,cell,capsule}=window.PhysicaBio,{add,done}=pack();
const U5='HUMAN PHYSIOLOGY';
const ch=(no,chapter)=>({grade:11,chapterNo:no,chapter,group:U5});
/*BEGIN heartkit*/
/* Anatomical heart (front view; +z toward the viewer, +x = patient's left). Right side blue, left side red.
   aS/vS: atrial/ventricular squeeze 0..1. Vessel stumps keep the positions the circulation paths attach to. */
const smooth3=(P,n=3)=>{const o=[];for(let i=0;i<P.length-1;i++){const p0=P[Math.max(0,i-1)],p1=P[i],p2=P[i+1],p3=P[Math.min(P.length-1,i+2)];for(let j=0;j<n;j++){const t=j/n,t2=t*t,t3=t2*t;o.push(p1.map((_,d)=>.5*(2*p1[d]+(-p0[d]+p2[d])*t+(2*p0[d]-5*p1[d]+4*p2[d]-p3[d])*t2+(-p0[d]+3*p1[d]-3*p2[d]+p3[d])*t3)))}}o.push(P[P.length-1]);return o};
let HV=null;
function heart(s,p,k=1,o={}){HV=HV||{aorta:smooth3([[.04,.42,0],[.1,1.05,.02],[.2,1.5,-.1],[.45,1.5,-.35],[.4,1.05,-.58],[.3,.2,-.62]]),trunk:smooth3([[-.14,.3,.4],[-.15,.7,.4],[-.05,1.0,.34],[.05,1.1,.25]]),svc:smooth3([[-.68,1.55,-.05],[-.66,1.15,-.0],[-.62,.75,.02]]),ivc:smooth3([[-.6,-.05,-.15],[-.62,-.5,-.15],[-.6,-.9,-.15]])};const ry=o.rotY||0,cy=Math.cos(ry),sy=Math.sin(ry),A=(x,y,z)=>V.add(p,[(x*cy+z*sy)*k,y*k,(-x*sy+z*cy)*k]),aS=o.aS||0,vS=o.vS||0,ra=1-.14*aS,rv=1-.13*vS,rot2=ry?[0,ry,0]:null,
    RED='#d6336c',BLU='#5c7cfa',DRED='#b02a5b',DBLU='#3b5bdb',ART='#e03131',taper=u=>1-.42*Math.max(0,-Math.sin(u))**1.6,sq=(a,b)=>V.mul(a,b);
  const hq=o.hi?1.9:1,M=(c,r,col,opt)=>s.mesh(A(c[0],c[1],c[2]),[r[0]*k,r[1]*k,r[2]*k],col,{rot2,...opt,rings:Math.round((opt.rings||14)*hq),segs:Math.round((opt.segs||22)*hq)}),T=(pts,r,col,seg=10)=>s.tube(pts.map(q=>A(q[0],q[1],q[2])),typeof r==='function'?u=>r(u)*k:r*k,col,{segs:o.hi?seg+4:seg}),
    lit=(h,q)=>{q=Math.round(q*8)/8;const n=parseInt(h.slice(1),16),m=v=>Math.round(v+(255-v)*.38*q).toString(16).padStart(2,'0');return'#'+m(n>>16)+m((n>>8)&255)+m(n&255)};
  /* ventricles: left (thick, red, forms the apex) and right (blue, wraps the front) */
  M([.2,-.3,-.08],[.55*rv,.88*(1-.06*vS),.46*rv],lit(RED,vS),{rot:[0,0,.45],rings:13,segs:20,shape:taper,spec:.5});
  M([-.3,-.18,.2],[.46*rv,.7*(1-.05*vS),.34*rv],lit(BLU,vS),{rot:[0,0,.3],rings:11,segs:18,shape:taper,spec:.5});
  /* atria and auricles */
  M([-.64,.4,.1],[.34*ra,.55*ra,.31*ra],lit(BLU,aS),{rings:10,segs:14,spec:.4});M([-.36,.92,.3],[.22*ra,.15*ra,.1*ra],'#4c6ef5',{rot:[0,0,.5],rings:5,segs:9});
  M([.5,.62,-.3],[.34*ra,.3*ra,.3*ra],lit('#e5527a',aS),{rings:9,segs:14,spec:.4});M([.64,.86,.08],[.19*ra,.14*ra,.1*ra],'#e5527a',{rot:[0,0,-.6],rings:5,segs:9});
  /* great vessels */
  T(HV.aorta,u=>.2-.07*u,ART,12);
  T([[.14,1.45,-.12],[.1,1.9,-.08]],.06,ART,7);T([[.26,1.5,-.2],[.3,1.92,-.18]],.045,ART,7);T([[.4,1.46,-.33],[.52,1.85,-.3]],.05,ART,7);
  T(HV.trunk,.15,DBLU,12);for(const sg of[-1,1])T([[.05,1.1,.25],[.55*sg+.05,1.12,.05]],.1,DBLU,10);
  T([[.2,1.2,.0],[.12,1.0,.1],[.06,1.04,.2]],.025,'#f1c27d',5);
  T(HV.svc,.14,DBLU,10);T(HV.ivc,.15,DBLU,10);
  for(const y of[.48,.66]){T([[1.0,y,-.3],[.72,y,-.28]],.07,DRED,8);T([[-.9,y,-.32],[-.62,y,-.3]],.07,DRED,8)}
  /* coronary arteries and cardiac veins on the surface */
  T([[.12,.5,.2],[.1,.25,.45],[.2,-.3,.5],[.34,-.8,.4],[.42,-1.02,.2]],.026,ART,5);T([[.1,.5,.1],[.46,.4,.2],[.7,.2,-.05]],.024,ART,5);T([[.0,.5,.2],[-.5,.22,.45],[-.84,-.1,.3],[-.78,-.62,.1]],.026,ART,5);
  T([[.16,.45,.22],[.18,.2,.5],[.28,-.3,.55],[.4,-.78,.45]],.03,DBLU,5);
  return s}
const heartPaths=()=>HV;
/* Lungs with lobes (right: upper, middle, lower; left: upper with lingula, lower), bronchial tree and alveoli.
   World frame of the circulation scene: body faces +x, patient's right = +z. */
function lungs(s,c0,k,col='#ffc9c9',alpha=.5){const A=(x,y,z)=>V.add(c0,[x*k,y*k,z*k]);
  const lobe=(g,x,y,r,cc,ex)=>{const pos=A(x,y,g*.72),shape=(u,v)=>(1-.24*Math.max(0,-g*Math.sin(v))**1.5)*(ex?ex(u,v):1);s.mesh(pos,[r[0]*k,r[1]*k,r[2]*k],cc,{alpha,rings:7,segs:12,shape,spec:.3})};
  const ap=u=>1-.22*Math.max(0,Math.sin(u))**2-.12*Math.max(0,-Math.sin(u))**2;
  /* one smooth lung outline with the lobes drawn slightly inset, so the fissures read as grooves */
  for(const g of[-1,1])s.mesh(A(0,0,g*.72),[.36*k,.78*k,.31*k],col,{alpha:.22,rings:9,segs:14,shape:(u,v)=>(1-.2*Math.max(0,-g*Math.sin(v))**1.5)*(1-.1*Math.max(0,Math.sin(u))**2)});
  lobe(1,.0,.4,[.29,.3,.25],'#f0809b',ap);lobe(1,.1,.02,[.26,.12,.22],'#f6a77a');lobe(1,-.02,-.36,[.31,.3,.25],'#d96a8c',ap);
  lobe(-1,.0,.38,[.29,.34,.25],'#f0809b',(u,v)=>ap(u)*(1-.14*Math.max(0,Math.cos(v))*Math.max(0,-Math.sin(u))));lobe(-1,-.02,-.3,[.31,.34,.25],'#d96a8c',ap);
  s.tube([A(0,1.0,0),A(0,.62,0),A(0,.5,0)],.055*k,'#f1f3f5',{segs:8});
  for(const g of[-1,1]){const br=[A(0,.5,0),A(.0,.4,g*.22),A(.0,.32,g*.6)];s.tube(br,.04*k,'#f1f3f5',{segs:6});
    for(const [dy,dx,dz,r] of[[.32,.06,.2,.026],[.1,-.04,.18,.024],[-.2,.0,.2,.024],[.12,.15,.1,.02]]){const m=A(.0,.27,g*.56),e=A(dx*1.4,.32+dy,g*(.6+dz*.4));s.tube([m,V.add(m,V.mul(V.sub(e,m),.55)),e],r*k,'#f4f6f8',{segs:4});for(let i=0;i<3;i++)s.ball(V.add(e,[(hash(i+g*3)-.5)*.1*k,(hash(i+7)-.5)*.1*k,(hash(i+11)-.5)*.08*k]),.03*k,'#ff8fa3',{alpha:.85,flat:true})}}}
/* Cut-away torso shell for the circulation scene (organs show through) and a small capillary plexus. */
function torsoShell(s){const col='#f1c7a8',o={alpha:.1,rings:12,segs:18};
  s.mesh([0,-.6,0],[.46,1.7,1.15],col,{...o,shape:u=>.88+.12*Math.sin(u)-.17*Math.exp(-(((u+.35)/.45)**2))});s.tube([[0,.95,0],[0,1.12,0]],.17,col,{alpha:.18,segs:10});
}
function plexus(s,c0,rx,ry,rz,c1,c2){for(let k=0;k<5;k++){const pts=[];for(let i=0;i<=12;i++){const a=i*.75+k*1.3;pts.push([c0[0]+rx*.5*Math.sin(2.1*a+k),c0[1]+ry*Math.sin(1.3*a+k*2.1),c0[2]+rz*.5*Math.sin(a+k*1.7)])}s.tube(pts,.014,u=>u<.5?c1:c2,{segs:4})}}
/*END heartkit*/
// Translucent human body for locating organs.
function body(s,p,k=1,alpha=.14){const A=(x,y,z)=>V.add(p,[x*k,y*k,z*k]),col='#f1c7a8',o={alpha:Math.max(.2,alpha*1.9)},so={...o,segs:10};
  // Proportioned, see-through figure (≈ 7.5 heads tall) so the organs inside stay visible.
  s.mesh(A(0,2.4,0),[.3*k,.37*k,.3*k],col,{...o,shape:(u,v)=>1-.08*Math.max(0,-Math.sin(u))});s.tube([A(0,1.98,0),A(0,2.12,0)],.13*k,col,so);
  s.mesh(A(0,1.3,0),[.3*k,.78*k,.5*k],col,{...o,shape:(u)=>.86+.16*Math.sin(u)+.06*Math.sin(3*u)});s.mesh(A(0,.5,0),[.28*k,.26*k,.44*k],col,o);
  for(const z of[-1,1]){s.tube([A(0,1.92,z*.52),A(0,1.32,z*.68),A(.06,.74,z*.72)],u=>(.11-.03*u)*k,col,so);s.ball(A(.07,.62,z*.72),.085*k,col,{alpha:o.alpha,flat:true});
    s.tube([A(0,.42,z*.24),A(.02,-.42,z*.25),A(0,-1.16,z*.25)],u=>(.16-.06*u)*k,col,so);s.mesh(A(.1,-1.23,z*.25),[.17*k,.06*k,.08*k],col,o)}}
/* anatomical lungs (front view): flat medial face, narrow apex, concave base, cardiac notch on the left lung, fissures, ringed trachea and bronchial tree */
const LUNG=sg=>{const f=(u,v)=>{const nx=Math.cos(u)*Math.cos(v),ny=Math.sin(u),mx=-sg*nx;let k=1-.3*Math.max(0,mx)**2-.2*Math.max(0,ny)**2-.14*Math.max(0,-ny)**3;if(sg>0&&mx>.25&&ny<.1&&ny>-.9)k*=1-.34*Math.min(1,(mx-.25)/.4)*Math.exp(-(((ny+.35)/.45)**2));return k};
 return{f,pt:(c0,A,u,v,o)=>{const k=f(u,v)*o;return[c0[0]+A[0]*k*Math.cos(u)*Math.cos(v),c0[1]+A[1]*k*Math.sin(u),c0[2]+A[2]*k*Math.cos(u)*Math.sin(v)]}}};
const LU=[LUNG(-1),LUNG(1)];
const lungPair=(s,c0,k,col='#f0a3b4',alpha=.86,o={})=>{
 const bc='#e4d9cf',P=(a,b)=>[c0[0]+a*k,c0[1]+b*k,c0[2]];
 if(!o.noTrachea){s.tube([P(0,1.75),P(0,.85)],.105*k,'#d9cfc3',{segs:10});for(let i=0;i<7;i++){const y=1.68-i*.12;s.seg(P(-.1,y),P(.1,y),'#a89c8f',2)}}
 for(const z of[-1,1]){s.tube([P(0,.85),P(z*.22,.7),P(z*.45,.5)],.07*k,bc,{segs:8});s.tube([P(z*.45,.5),P(z*.62,.25),P(z*.7,-.1),P(z*.72,-.5)],.05*k,bc,{segs:8});
  s.tube([P(z*.55,.4),P(z*.7,.62),P(z*.78,.95)],.035*k,bc,{segs:6});s.tube([P(z*.66,.15),P(z*.9,.1),P(z*1.0,-.05)],.035*k,bc,{segs:6});s.tube([P(z*.72,-.35),P(z*.9,-.55),P(z*.95,-.8)],.03*k,bc,{segs:6})}
 for(let i=0;i<2;i++){const sg=i?1:-1,A=[.62*k,.98*k,.42*k],cc=P(sg*.66,-.05);
  s.mesh(cc,A,col,{alpha,rings:16,segs:26,spec:.55,shape:LU[i].f});
  const F=(pts,w)=>s.path(pts.map(([u,v])=>LU[i].pt(cc,A,u,v,1.02)),'#c4627c',w||1.6,[],1e5),ob=[];
  for(let j=0;j<=6;j++){const t=j/6;ob.push([.5-t,Math.PI/2-sg*(.7-t)])}F(ob);
  if(sg<0){const h=[];for(let j=0;j<=5;j++)h.push([.12,Math.PI/2+.8-j*.22]);F(h)}}
 return s};

/* ---------- Chapter 14: Breathing and Exchange of Gases ---------- */
add({...ch(14,'Breathing and Exchange of Gases'),id:'bio-lung-volumes',title:'Spirometer: lung volumes and capacities',
 description:'Breathe normally, then take a maximum breath in and out. Read the volumes and capacities from the spirogram.',
 formula:'VC = ERV + TV + IRV ;  TLC = VC + RV ;  minute volume = TV × rate',
 observe:'Even after a forcible expiration, the residual volume of air remains in the lungs.',
 tryText:'Increase the breathing rate to 16 per minute. What is the minute volume?',
 controls:[R('TV','Tidal volume TV',300,800,10,500,'mL'),R('IRV','Inspiratory reserve IRV',2000,3500,50,2750,'mL'),R('ERV','Expiratory reserve ERV',800,1300,10,1050,'mL'),R('RV','Residual volume RV',900,1400,10,1150,'mL'),R('rate','Breaths per minute',8,24,1,12)],
 metrics:p=>[N('Vital capacity',p.ERV+p.TV+p.IRV,'mL',0),N('Total lung capacity',p.ERV+p.TV+p.IRV+p.RV,'mL',0),N('Inspiratory capacity',p.TV+p.IRV,'mL',0),N('Functional residual capacity',p.ERV+p.RV,'mL',0),N('Minute volume',p.TV*p.rate,'mL/min',0)],
 draw:(c,p,t)=>{const vol=x=>{const per=60/p.rate,k=cycle(x,per*6),n=Math.floor(k/per),q=(k%per)/per;if(n===3)return p.RV+p.ERV+p.TV*.5+(p.IRV+p.TV*.5)*Math.sin(PI*q);if(n===4)return p.RV+p.ERV+p.TV*.5-(p.ERV+p.TV*.5)*Math.sin(PI*q);return p.RV+p.ERV+p.TV*(.5-.5*Math.cos(TAU*q))},v=vol(t),tlc=p.ERV+p.TV+p.IRV+p.RV;
  const s=P3.scene(c,{scale:64,cx:200,cy:236,pitch:.04}),k=.82+.34*(v-p.RV)/(tlc-p.RV);lungPair(s,[0,0,0],k);const dy=-1.02*k;s.mesh([0,dy-.1,0],[1.55*k,.36,.5],'#b5524a',{alpha:.9,rings:8,segs:24,shape:u=>u<0?0:1});s.callout([0,1.6*k,0],'trachea','#e9ecef',50,-30);s.callout([-.2,.7*k,.1],'bronchi','#e9ecef',-70,-30);s.callout([.9*k,.1,.42*k],'lungs','#ff8fab',70,30);s.callout([.9*k,dy,.3],'diaphragm','#e08a80',50,30);s.render();
  const per=60/p.rate;chart(c,400,96,256,190,{title:'Spirogram',xl:'time',xmin:0,xmax:per*6,ymin:0,ymax:tlc*1.05,series:[{fn:vol,col:C.mint},{fn:()=>p.RV,col:'#ff8787',dash:[4,4]},{fn:()=>tlc,col:'#8ca6b9',dash:[4,4]}],marker:[cycle(t,per*6),v]});tag(c,'red dashed: RV   grey dashed: TLC',412,276,C.muted,11)},
 assumption:'Typical adult values from NCERT; one maximal inspiration and expiration are inserted after three quiet breaths.'});

add({...ch(14,'Breathing and Exchange of Gases'),id:'bio-breathing-mechanism',title:'Mechanism of breathing (bell-jar model)',
 description:'Pull the rubber diaphragm down: the volume of the jar increases, pressure falls and the balloons (lungs) inflate.',
 formula:'Boyle’s law: P ∝ 1/V at constant temperature',
 observe:'Inspiration happens when intra-pulmonary pressure falls below atmospheric pressure.',
 tryText:'Pull the diaphragm further. How does the pressure change?',
 controls:[R('pull','Diaphragm pull (depth when automatic)',0,100,1,0,'%'),S('auto','Breathe automatically','yes',[['yes','Yes'],['no','No — use the slider']])],
 metrics:(p,t)=>{const d=p.auto==='yes'?(p.pull>0?p.pull:100)*(.5+.5*Math.sin(t*1.2)):p.pull,dP=p.auto==='yes'?-3*(p.pull>0?p.pull:100)/100*Math.cos(t*1.2):-d/100*3;/* automatic: pressure follows airflow, below atmospheric while the jar volume grows, above it while it shrinks */return[N('Phase',p.auto==='yes'?(Math.cos(t*1.2)>0?'Inspiration':'Expiration'):d>0?'Inspiration (held)':'Rest'),N('Pressure inside vs atmosphere',dP,'mm Hg',1),N('Diaphragm','Contracts and flattens during inspiration'),N('External intercostals','Lift ribs and sternum')]},
 draw:(c,p,t)=>{const d=(p.auto==='yes'?(p.pull>0?p.pull:100)*(.5+.5*Math.sin(t*1.2)):p.pull)/100,s=P3.scene(c,{scale:56,cy:262,cx:330,pitch:.12}),B=-1.4,GL='#dcefff',sag=-.2-.7*d,k=.7+.45*d;
  /* glass jar: thick shoulder profile, inner wall, rim and a highlight streak */
  const JP=BJ||(BJ={prof:[[1.3,0],[1.34,.25],[1.36,1.4],[1.31,1.9],[1.16,2.25],[.92,2.5],[.62,2.68],[.38,2.78],[.31,2.9],[.3,3.2]].map(([r,y])=>[r,y]),hl:Array.from({length:12},(_,i)=>{const y=.2+i*.2,r=y<1.5?1.36:y<1.9?1.33:1.2-(y-1.9)*.5;return[r*Math.cos(1.62),y,r*Math.sin(1.62)]})});
  s.lathe([0,B,0],JP.prof,GL,{alpha:.13,segs:30});s.lathe([0,B,0],JP.prof.map(([r,y])=>[r-.06,y]),'#bcd9ee',{alpha:.07,segs:24});
  s.path(JP.hl.map(q=>[q[0],q[1]+B,q[2]]),'#ffffff66',4,[],1e5);
  s.lathe([0,B-.05,0],[[1.42,0],[1.42,.1],[1.3,.1]],'#8fa6b8',{alpha:.5,segs:30});
  /* rubber stopper, Y-tube and balloon lungs */
  s.lathe([0,B+2.95,0],[[.27,0],[.36,.22],[.36,.3],[.26,.3]],'#5c3d2e',{segs:14});
  s.tube([[0,B+3.55,0],[0,B+2.05,0]],.07,'#cfd8dc',{alpha:.8,segs:10});
  const ly=B+1.05,tops=[B+2.05,ly+k*.6];for(const z of[-1,1]){const g=z*.36*k;s.tube([[0,B+2.05,0],[0,B+1.85,z*.1],[0,tops[1]+.08,g]],.05,'#cfd8dc',{alpha:.8,segs:8});
    s.mesh([0,ly,g],[.36*k,.58*k,.32*k],'#ff8fa6',{alpha:.78,rings:15,segs:24,spec:.7,shape:u=>1-.3*Math.max(0,Math.sin(u))**2});s.ball([0,tops[1]+.02,g],.06,'#d6336c',{flat:true})}
  /* rubber sheet (diaphragm) clamped at the base, pull string and knob */
  s.lathe([0,B,0],[[0,sag],[.6,sag*.75],[1.0,sag*.35],[1.3,0],[1.34,.02]],'#ff8787',{alpha:.86,segs:30});
  s.tube([[0,B+sag,0],[0,B+sag-.45,0]],.04,'#495057',{segs:6});s.ball([0,B+sag-.55,0],.14,'#495057');
  if(d>.02){const y0=B+sag-.85;s.poly([[-.14,y0+.3,0],[.14,y0+.3,0],[0,y0,0]],'#4dd0e1',{cull:false});s.seg([0,B+sag-.7,0],[0,y0+.3,0],'#4dd0e1',3)}
  /* air through the Y-tube: in during inspiration, out during expiration */
  const dir=p.auto==='yes'?Math.cos(t*1.2):d>0?1:0;for(let i=0;i<4;i++){const q=cycle(t*.7+i/4,1);if(dir>.1)s.ball([0,B+3.7-q*1.4,0],.06,'#74c0fc',{flat:true,glow:true});else if(dir<-.1)s.ball([0,B+2.3+q*1.4,0],.06,'#ffa94d',{flat:true,glow:true})}
  lblCols(c,s,[['a',[0,B+3.3,0],'Y-tube = trachea + bronchi','#e9f6ff','R'],['a',[1.1,B+1.9,.4],'bell jar = thoracic cavity','#e9f6ff','R'],['a',[0,ly+.1,.36*k+.3],'balloons = lungs','#ff8fa6','L'],['a',[-.3,B+sag*.7,1.0],'rubber sheet = diaphragm','#ff8787','L']],()=>false,170,520,120,330);s.render()},
 assumption:'Classroom bell-jar analogy; pressure difference values are illustrative (a few mm Hg).'});

let CCF=null;const PP={alveoli:[104,40],deoxy:[40,45],oxy:[95,40],tissue:[40,45],air:[159,.3]};
add({...ch(14,'Breathing and Exchange of Gases'),id:'bio-gas-exchange',title:'Exchange of gases: partial pressures',
 description:'Follow blood along a pulmonary or tissue capillary and watch O₂ and CO₂ diffuse down their partial-pressure gradients.',
 formula:'Diffusion rate ∝ partial-pressure gradient',
 observe:'In the lungs O₂ moves from alveoli (104 mm Hg) into blood (40); CO₂ moves from blood (45) into alveoli (40).',
 tryText:'Switch to tissues: in which direction does each gas move now?',
 controls:[S('site','Site','lungs',[['lungs','Alveolus (lungs)'],['tissue','Body tissue']]),R('x','Position along capillary',0,100,1,30,'%')],
 metrics:p=>{const k=1-Math.exp(-p.x/18);let o2,co2;if(p.site==='lungs'){o2=40+(95-40)*k;co2=45-(45-40)*k}else{o2=95-(95-40)*k;co2=40+(45-40)*k}return[N('pO₂ in blood',o2,'mm Hg',0),N('pCO₂ in blood',co2,'mm Hg',0),N(p.site==='lungs'?'Alveolar air':'Tissue',p.site==='lungs'?'pO₂ 104, pCO₂ 40':'pO₂ 40, pCO₂ 45'),N('Diffusion membrane','3 thin layers, ≪ 1 mm')]},
 draw:(c,p,t)=>{const lung=p.site==='lungs',s=P3.scene(c,{scale:58,pitch:.05,cx:335,cy:275}),Y=0,TOP=.52,st=x=>{const u=(x+3.4)/6.8,k=1-Math.exp(-u*100/18);return lung?k:1-k};
  /* air sac (cut open) or body tissue, sitting above the capillary */
  if(lung){s.mesh([0,TOP,0],[3.5,1.55,.5],'#f2a7b5',{alpha:.55,rings:12,segs:30,shape:u=>u<0?0:1});s.mesh([0,TOP,0],[3.38,1.42,.45],'#e6f3ff',{alpha:.4,rings:12,segs:30,shape:u=>u<0?0:1})}
  else for(let i=0;i<5;i++){const x=-2.8+i*1.4,y=TOP+.75+.08*Math.sin(i*2);s.mesh([x,y,0],[.7,.55,.3],'#f6c1b0',{alpha:.7,rings:9,segs:14});s.mesh([x+.08,y+.05,.05],[.22,.2,.2],'#7b5cc4',{rings:7,segs:10});s.ball([x-.35,y-.15,.2],.06,'#e8743b',{flat:true});s.ball([x+.3,y-.22,.2],.06,'#e8743b',{flat:true})}
  /* respiratory membrane: epithelium + fused basement membrane (+ capillary endothelium wall) */
  s.poly([[-3.5,TOP+.1,0],[3.5,TOP+.1,0],[3.5,TOP+.04,0],[-3.5,TOP+.04,0]],'#f4b6c2',{cull:false});s.poly([[-3.5,TOP+.04,0],[3.5,TOP+.04,0],[3.5,TOP-.02,0],[-3.5,TOP-.02,0]],'#d8c3a0',{cull:false});
  const pts=Array.from({length:30},(_,i)=>[-3.4+i*.235,Y,0]);s.tube(pts,.46,u=>st(-3.4+u*6.8)>.5?'#e8505b':'#7a4fd0',{alpha:.4,segs:14});
  for(let i=0;i<8;i++){const q=cycle(t*.25+i/8,1),x=-3.3+q*6.6,o=st(x);s.mesh([x,Y+.04*Math.sin(i*3),0],[.27,.16,.1],o>.5?'#d6303a':'#8e2340',{rings:7,segs:12})}
  for(let i=0;i<6;i++){const q=cycle(t*.7+i/6,1),x=-2.8+i,yo=lung?TOP+.7-q*.9:Y+.1+q*1.05;s.ball([x,yo,.3],.07,'#4dabf7',{flat:true,glow:true});const yc=lung?Y+.1+q*1.05:TOP+.7-q*.9;s.ball([x+.4,yc,-.3],.06,'#adb5bd',{flat:true})}
  const xp=-3.4+p.x/100*6.8;s.cyl([xp,Y,0],[1,0,0],.5,.05,'#ffd43b',{alpha:.55});
  s.callout(lung?[-2.4,TOP+.9,0]:[-2.8,TOP+1.05,0],lung?'alveolus (air sac)':'body tissue cells','#ffc9c9',-20,-30);s.callout([2.7,Y-.4,.2],'blood capillary','#ff8787',0,40);s.callout([-3.3+cycle(t*.25,1)*6.6,Y-.1,.1],'RBC','#ff6b6b',0,50);s.callout([3.1,TOP+.04,0],lung?'3-layer membrane':'diffusion barrier','#f4b6c2',30,-30);s.callout([xp,Y-.46,0],'probe','#ffd43b',-30,45);s.render();tag(c,'blue: O₂   grey: CO₂   yellow ring: probe',290,372,C.muted,12)},
 assumption:'Partial pressures from NCERT Table 14.1; equilibration along the capillary modelled as exponential.'});

add({...ch(14,'Breathing and Exchange of Gases'),id:'bio-oxygen-dissociation',title:'Oxygen–haemoglobin dissociation curve',
 description:'See how the % saturation of haemoglobin depends on pO₂, and how CO₂, acidity and temperature shift the curve.',
 formula:'Sigmoid curve ;  high pCO₂, H⁺ or temperature → shift right (O₂ released)',
 observe:'In tissues (low pO₂, high pCO₂, high H⁺, higher temperature) oxyhaemoglobin dissociates and releases O₂.',
 tryText:'Raise pCO₂ and temperature together. What happens to saturation at 40 mm Hg?',
 controls:[R('pO2','pO₂',0,120,1,40,'mm Hg'),R('pCO2','pCO₂',20,70,1,40,'mm Hg'),R('T','Temperature',34,42,.1,37,'°C',1),R('pH','pH',7.0,7.7,.01,7.4,'',2)],
 metrics:p=>{const S0=sat({pO2:p.pO2,pCO2:40,T:37,pH:7.4}),S1=sat(p);return[N('Saturation now',S1*100,'%',0),N('Normal at this pO₂',S0*100,'%',0),N('P50 (half saturation)',p50(p),'mm Hg',1),N('O₂ delivered','≈ 5 mL per 100 mL blood (rest)')]},
 draw:(c,p,t)=>{const S1=sat(p),s=P3.scene(c,{scale:74,cx:205,cy:255,pitch:.04});const sub=[[-.52,.5,.05],[.52,.5,-.05],[-.52,-.5,-.05],[.52,-.5,.05]],nF=Math.round(S1*4+.01);
  sub.forEach((q,i)=>{const alpha=i===0||i===3,col=alpha?'#f08a8a':'#c0392b';
   /* globin subunit: lumpy helical body */
   s.mesh(q,[.52,.48,.42],col,{rings:16,segs:28,spec:.5,shape:(u,v)=>1+.07*Math.sin(4*v+i+2*u)*Math.cos(u)+.05*Math.sin(7*u+v)});
   /* haem group in its pocket: porphyrin plate + Fe */
   const hq=V.add(q,[q[0]>0?-.14:.14,q[1]>0?-.05:.05,.4]),on=i<nF;
   s.mesh(hq,[.2,.2,.04],on?'#8b1a24':'#3a2a52',{rings:6,segs:14,lift:2});s.ball(hq,.065,on?'#ffb199':'#adb5bd',{flat:true,lift:3});
   if(on){const a=V.add(hq,[0,0,.16]);s.seg(hq,a,'#ff6b6b',2.5,[],1e5);s.ball(V.add(a,[-.05,0,.02]),.06,'#ff2b2b',{glow:true,lift:4});s.ball(V.add(a,[.05,0,.02]),.06,'#ff2b2b',{glow:true,lift:4})}});
  s.callout([-.75,.95,.2],'α subunit','#f08a8a',-35,-25);s.callout([.75,.95,.1],'β subunit','#e8695a',35,-25);s.callout([.38,-.7,.5],nF>0?'haem + O₂':'haem (empty)','#ff6b6b',50,50);s.render();
  chart(c,400,96,256,190,{title:'% saturation vs pO₂',xl:'pO₂ (mm Hg)',xmin:0,xmax:120,ymin:0,ymax:1.02,series:[{fn:x=>sat({pO2:x,pCO2:40,T:37,pH:7.4}),col:'#8ca6b9',dash:[4,4]},{fn:x=>sat({...p,pO2:x}),col:C.red}],marker:[p.pO2,S1]});tag(c,'haem sites filled: '+nF+' of 4  (red balls = O₂ bound to Fe)',44,98,C.gold,13)},
 assumption:'Hill equation (n = 2.7, normal P50 = 26.8 mm Hg) with illustrative Bohr and temperature shifts. Dashed: normal curve.'});
function p50(p){return 26.8*Math.pow(10,.48*(7.4-p.pH))*Math.exp(.024*(p.T-37))*(1+.004*(p.pCO2-40))}
function sat(p){const P=p50(p),n=2.7;return p.pO2<=0?0:p.pO2**n/(P**n+p.pO2**n)}

/* ---------- Chapter 15: Body Fluids and Circulation ---------- */
add({...ch(15,'Body Fluids and Circulation'),id:'bio-cardiac-cycle',title:'The cardiac cycle',
 description:'Watch the heart’s chambers contract and relax in sequence and hear when the valves close (lub, dub).',
 formula:'Cardiac output = stroke volume × heart rate ≈ 70 mL × 72 = ~5 L/min',
 observe:'At 72 beats per minute one cycle lasts about 0.8 s (0.83 s): atrial systole 0.1 s, ventricular systole 0.3 s, joint diastole 0.4 s.',
 tryText:'Raise the heart rate. Which phase gets shorter?',
 controls:[R('hr','Heart rate',50,180,1,72,'beats/min'),R('sv','Stroke volume',50,120,1,70,'mL')],
 metrics:(p,t)=>{const r=heartPhase(p,t);return[N('Cycle duration',60/p.hr,'s',2),N('Phase now',r.name),N('Valves',r.valves),N('Cardiac output',p.sv*p.hr/1000,'L/min',2)]},
 draw:(c,p,t)=>{const r=heartPhase(p,t),s=P3.scene(c,{scale:62,cy:250,cx:320,yaw:.22,pitch:-.04}),aS=r.atria,vS=r.vent;heart(s,[0,0,0],1,{aS,vS,hi:true});
  /* schematic blood flow: venous return, atria to ventricles, ventricles to arteries (dots only where the phase allows it) */
  const FL=CCF||(CCF=[[[-.66,1.55,0],[-.64,1.15,.0],[-.62,.75,.02]],[[-.03,.9,.34],[.05,1.1,.25],[.3,1.14,.1]],HV.aorta,[[.1,1.55,-.12],[.1,1.95,-.08]]]);
  const sys=r.name==='Ventricular systole',act=[true,sys,sys,sys];
  FL.forEach((L,i)=>{if(!act[i])return;const n=L.length-1,col=i===0?'#9bb1ff':i===1?'#9bb1ff':'#ff9aa8';for(let j=0;j<3;j++){const q=cycle(t*.9+j/3+i*.13,1),m=Math.min(n-1,Math.floor(q*n)),fr=q*n-m;s.ball(V.add(L[m],V.mul(V.sub(L[m+1],L[m]),fr)),.05,col,{flat:true,lift:30})}});
  /* valve state chips */
  s.hud(()=>{const k=window.PhysicaTextScale||1,av=!sys,sl=sys;c.save();c.font=`700 ${Math.round(12*k)}px system-ui, sans-serif`;[['AV valves',av,350],['Semilunar valves',sl,376]].forEach(([n,o,y])=>{const w=c.measureText('Semilunar valves: closed').width+26,x=250;c.fillStyle='#0b1a26cc';c.fillRect(x-w/2,y,w,22*k);c.fillStyle=o?'#69db7c':'#ff6b6b';c.beginPath();c.arc(x-w/2+11,y+11*k,4,0,6.2832);c.fill();c.fillStyle='#dbe7f0';c.textAlign='left';c.textBaseline='middle';c.fillText(n+': '+(o?'open':'closed'),x-w/2+20,y+11*k)});c.restore()});
  lblCols(c,s,[['a',[-.68,1.4,0],'superior vena cava','#91a7ff','L'],['a',[-.7,.35,.2],'right atrium','#91a7ff','L'],['a',[-.55,-.3,.3],'right ventricle','#91a7ff','L'],['a',[.1,1.5,-.12],'aorta','#ff8787','R'],['a',[-.02,.95,.3],'pulmonary artery','#91a7ff','R'],['a',[.55,.7,-.3],'left atrium','#ff8fab','R'],['a',[.4,-.5,.1],'left ventricle (thickest wall)','#ff8fab','R']],()=>false,168,478,100,300);
  if(r.sound)s.label([0,-1.45,0],r.sound,C.gold,20);s.render();
  const T=60/p.hr,[e1,e2]=heartEnds(T);chart(c,440,322,216,92,{title:'Phase timeline (one cycle)',xmin:0,xmax:T,ymin:0,ymax:1,series:[{pts:[[0,.8],[e1,.8],[e1,0],[T,0]],col:'#e64980'},{pts:[[0,0],[e1,0],[e1,.5],[e2,.5],[e2,0],[T,0]],col:'#a61e4d'}],marker:[cycle(t,T),.95,'#ffd43b']})},
 assumption:'Up to about 75 beats/min atrial systole is 0.1 s and ventricular systole 0.3 s (diastole 0.4 s at 72, cycle ≈ 0.83 s); above that, all phases are shortened in proportion so that joint diastole is always shown. Teaching simplification.'});
/* Phase ends (s): 0.1 and 0.4 at <=75 bpm; scaled with the cycle length (1/8 and 1/2 of T) when T<0.8 s so joint diastole never vanishes. */
const heartEnds=T=>T>=.8?[.1,.4]:[T/8,T/2];
function heartPhase(p,t){const T=60/p.hr,q=cycle(t,T),[e1,e2]=heartEnds(T),k=x=>Math.sin(PI*clamp(x,0,1));if(q<e1)return{name:'Atrial systole',valves:'AV valves open; semilunar closed',atria:k(q/e1),vent:0};if(q<e2)return{name:'Ventricular systole',valves:'AV valves closed (lub); semilunar open',atria:0,vent:k((q-e1)/(e2-e1)),sound:q<e1+.06?'LUB':''};return{name:'Joint diastole',valves:'Semilunar closed (dub); AV open',atria:0,vent:0,sound:q<e2+.06?'DUB':''}}

// ECG monitor: calibrated grid (cached once), scrolling trace with glow, labelled P-QRS-T, R-R bracket, and a heart that lights up as each wave passes.
const ECGX=[-1.3,3.1],ECGY=[-1,1.25],ECGW=3.2,ECGBASE=-.35;
const ECGG=(()=>{const z=-.24,zig=(n,a0,a1,b0,b1,vert)=>{const o=[];for(let i=0;i<=n;i++){const a=a0+(a1-a0)*i/n,lo=i%2?b1:b0,hi=i%2?b0:b1;o.push(vert?[a,lo,z]:[lo,a,z],vert?[a,hi,z]:[hi,a,z])}return o};
  return{mv:zig(80,ECGX[0],ECGX[1],ECGY[0],ECGY[1],true),Mv:zig(16,ECGX[0],ECGX[1],ECGY[0],ECGY[1],true),mh:zig(25,ECGY[0],ECGY[1],ECGX[0],ECGX[1],false),Mh:zig(5,ECGY[0],ECGY[1],ECGX[0],ECGX[1],false)}})();
const ecgWave=(x,T)=>{const q=cycle(x,T)/T*.8,g=(m,w,a)=>a*Math.exp(-(((q-m)/w)**2));return g(.08,.025,.15)-g(.17,.008,.12)+g(.19,.01,1)-g(.21,.008,.25)+g(.42,.04,.3)};
const ecgDraw=(c,p,t)=>{const T=60/p.hr,s=P3.scene(c,{scale:62,cx:360,cy:258,pitch:.1}),X0=ECGX[0],X1=ECGX[1],pw=(X1-X0)/ECGW,N=190,pts=[],hp=[-2.85,.2,0],hk=.66,q=cycle(t,T)/T*.8;
  // monitor body and screen
  s.box([(X0+X1)/2,(ECGY[0]+ECGY[1])/2,-.5],[X1-X0+.5,ECGY[1]-ECGY[0]+.5,.32],'#1d2329');s.poly([[X0,ECGY[0],-.33],[X1,ECGY[0],-.33],[X1,ECGY[1],-.33],[X0,ECGY[1],-.33]],'#06241d',{shade:false,cull:false,bias:.05});
  s.path(ECGG.mv,'#156653',.7,[],1e4);s.path(ECGG.mh,'#156653',.7,[],1e4);s.path(ECGG.Mv,'#2bb594',1.2,[],1e4+1);s.path(ECGG.Mh,'#2bb594',1.2,[],1e4+1);
  s.seg([X0,ECGBASE,-.23],[X1,ECGBASE,-.23],'#1f8f74',.8,[2,4],1e4+2);
  for(let i=0;i<=N;i++)pts.push([X0+(X1-X0)*i/N,ECGBASE+.9*ecgWave(t-ECGW+ECGW*i/N,T),-.2]);
  s.path(pts,'rgba(105,219,124,.22)',7,[],1e5-1);s.path(pts,'#69db7c',2.4,[],1e5);
  const win={p:[.03,.13],qrs:[.16,.23],t:[.32,.52]}[p.hl],run=[],flush=()=>{if(run.length>1){s.path(run.slice(),'rgba(255,212,59,.3)',9,[],1e5);s.path(run.slice(),'#ffd43b',4,[],1e5+1)}run.length=0};
  for(let i=0;i<=N;i++){const qq=cycle(t-ECGW+ECGW*i/N,T)/T*.8;if(qq>=win[0]&&qq<=win[1])run.push(pts[i]);else flush()}flush();
  // wave names and the R-R interval on complete beats in view
  const px=tm=>X0+(tm-(t-ECGW))*pw,n=Math.floor((t-.2375*T)/T),rT=m=>m*T+.2375*T,lab=(m,f,txt,col,y)=>{const tm=m*T+f*T;if(tm>t-ECGW+.05&&tm<t-.05)s.label([px(tm),y,-.2],txt,col,13)};
  {const m=n-1;lab(m,.1,'P','#8ce99a',ECGBASE+.42);lab(m,.2375,'QRS','#8ce99a',ECGBASE+1.12);lab(m,.525,'T','#8ce99a',ECGBASE+.55)}
  if(rT(n-1)>t-ECGW+.05){const xa=px(rT(n-1)),xb=px(rT(n)),y=ECGY[1]-.3;s.seg([xa,y,-.2],[xb,y,-.2],'#e9f6ff',1.4,[],1e4+3);s.seg([xa,y-.07,-.2],[xa,y+.07,-.2],'#e9f6ff',1.4,[],1e4+3);s.seg([xb,y-.07,-.2],[xb,y+.07,-.2],'#e9f6ff',1.4,[],1e4+3);s.label([(xa+xb)/2,y+.14,-.2],`R–R = ${f(T,2)} s`,'#e9f6ff',12)}
  s.label([X0+.45,ECGY[1]-.12,-.2],'Lead II','#9fb6c4',12);s.label([X1-.5,ECGY[0]-.22,-.2],'1 large square = 0.2 s','#9fb6c4',11);s.label([X1-.45,ECGY[1]+.05,-.2],`${p.hr} bpm`,C.mint,15);
  // heart: lights up where the wave currently is (gold = depolarisation, blue = repolarisation)
  const atr=q>=.03&&q<=.14,dep=q>=.16&&q<=.23,rep=q>=.32&&q<=.52;
  heart(s,hp,hk,{aS:atr?.7:0,vS:dep?.8:0});
  if(atr){s.mesh(V.add(hp,[-.55*hk,.5*hk,.4*hk]),[.38*hk,.34*hk,.2*hk],'#ffd43b',{alpha:.5,rings:8,segs:12,shade:false});s.mesh(V.add(hp,[.5*hk,.56*hk,.3*hk]),[.34*hk,.29*hk,.2*hk],'#ffd43b',{alpha:.5,rings:8,segs:12,shade:false})}
  if(dep||rep)s.mesh(V.add(hp,[.08*hk,-.32*hk,.38*hk]),[.66*hk,.76*hk,.3*hk],dep?'#ffd43b':'#4dabf7',{alpha:.42,rings:10,segs:14,shade:false});
  s.label([hp[0],hp[1]-1.35*hk-.15,0],atr?'atria depolarise':dep?'ventricles depolarise':rep?'ventricles repolarise':'resting (isoelectric)',atr||dep?'#ffd43b':rep?'#74c0fc':'#9fb6c4',12);
  s.render();tag(c,{p:'P',qrs:'QRS',t:'T'}[p.hl]+' wave highlighted (see readouts)',44,98,C.gold,14)};
add({...ch(15,'Body Fluids and Circulation'),id:'bio-ecg',title:'Electrocardiogram (ECG)',
 description:'Read an ECG trace: P wave, QRS complex and T wave. Count QRS complexes to find the heart rate.',
 formula:'Heart rate = 60 / (R–R interval in s)',
 observe:'P: atrial depolarisation; QRS: ventricular depolarisation (start of contraction); T: ventricular repolarisation.',
 tryText:'Raise the heart rate and measure the shorter R–R interval.',
 controls:[R('hr','Heart rate',40,180,1,72,'beats/min'),S('hl','Highlight wave','qrs',[['p','P wave'],['qrs','QRS complex'],['t','T wave']])],
 metrics:p=>[N('R–R interval',60/p.hr,'s',2),N('Heart rate',p.hr,'beats/min',0),N('Highlighted',{p:'P: atrial depolarisation',qrs:'QRS: ventricular depolarisation',t:'T: ventricular repolarisation'}[p.hl])],
draw:(c,p,t)=>ecgDraw(c,p,t/*DBG*/),
 assumption:'Synthetic ECG built from Gaussian waves (lead II shape); not for clinical interpretation.'});

const ABO={A:[['A'],['anti-B']],B:[['B'],['anti-A']],AB:[['A','B'],[]],O:[[],['anti-A','anti-B']]};
add({...ch(15,'Body Fluids and Circulation'),id:'bio-blood-groups',title:'Blood groups and transfusion',
 description:'Pick a donor and a recipient. See the antigens on donor red cells and the antibodies in the recipient’s plasma.',
 formula:'Transfusion fails if recipient antibodies match donor antigens',
 observe:'Group O is the universal donor and group AB the universal recipient (ABO system).',
 tryText:'Give Rh-positive blood to an Rh-negative recipient. What does NCERT warn about?',
 controls:[S('d','Donor','O-',['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(x=>[x,x])),S('r','Recipient','A+',['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(x=>[x,x]))],
 metrics:p=>{const r=compat(p);return[N('Compatible?',r.ok?(r.sens?'ABO: yes. Rh: sensitisation risk':'Yes'):'No — agglutination risk'),N('Donor RBC antigens',r.ag.join(', ')||'None (A/B)'),N('Recipient plasma antibodies',r.ab.join(', ')||'None'),N('Rh',r.rh)]},
 draw:(c,p,t)=>{const r=compat(p),s=P3.scene(c,{scale:58,cx:335,cy:240,pitch:.03}),k=r.ok?0:Math.min(1,cycle(t,8)/3.5),AC={A:'#ffd43b',B:'#4dabf7',Rh:'#69db7c'},ABC={'anti-A':'#f59f00','anti-B':'#1c7ed6'};
  /* plasma compartment (recipient) */
  s.poly([[.1,-1.5,0],[3.5,-1.5,0],[3.5,1.5,0],[.1,1.5,0]],'#f6d98f',{cull:false,alpha:.16,stroke:'#f6d98f66',lw:1.2,z:-1e5});
  const Y=(q,col,a,sc=1)=>{const ca=Math.cos(a),sa=Math.sin(a),R=(x,y)=>[q[0]+x*ca-y*sa,q[1]+x*sa+y*ca,q[2]],w=.032;s.tube([R(0,0),R(0,.2*sc)],w,col,{segs:5});s.tube([R(0,.2*sc),R(-.13*sc,.38*sc)],w,col,{segs:5});s.tube([R(0,.2*sc),R(.13*sc,.38*sc)],w,col,{segs:5})};
  /* donor red cells: biconcave discs with antigen spikes on the surface */
  const HEX=[[0,0],[.82,0],[-.82,0],[.41,.72],[-.41,.72],[.41,-.72],[-.41,-.72]],home=[-2.35,0],cl=[1.8,0],cells=[];
  for(let i=0;i<7;i++){const h=HEX[i],hx=home[0]+h[0]*1.02,hy=home[1]+h[1]*1.02,cx2=cl[0]+h[0]*.92,cy2=cl[1]+h[1]*.92,x=hx+(cx2-hx)*k,y=hy+(cy2-hy)*k;cells.push([x,y]);
   s.mesh([x,y,0],[.4,.14,.4],'#d6303a',{rot:[PI/2,0,0],rings:10,segs:18,spec:.5,shape:u=>1-.55*Math.exp(-(((PI/2-Math.abs(u))*2.6)**2))});
   const n=r.ag.length;for(let m=0;m<12&&n;m++){const a=TAU*m/12+i,j=m%n,col=AC[r.ag[j]];s.seg([x+.4*Math.cos(a),y+.4*Math.sin(a),.05],[x+.52*Math.cos(a),y+.52*Math.sin(a),.05],col,2);s.ball([x+.54*Math.cos(a),y+.54*Math.sin(a),.06],.055,col,{flat:true})}}
  /* recipient antibodies */
  if(r.ok){r.ab.forEach((a,j)=>{for(let m=0;m<5;m++){const q=[.6+hash(m*3+j*17)*2.5,(hash(m*5+j*11+2)-.5)*2.4,0];Y(q,ABC[a],(hash(m+j*7)-.5)*2.6+Math.sin(t*.6+m)*.15)}})}
  else{const pr=[[1,2],[1,3],[1,5],[2,4],[3,4],[5,6],[3,0],[4,0],[0,5]];let m=0;for(const [a,b] of pr){const A=cells[a],B=cells[b],mx=(A[0]+B[0])/2,my=(A[1]+B[1])/2,col=r.ab.length?ABC[r.ab[m%r.ab.length]]:'#adb5bd';if(k>.7)Y([mx,my,.1],col,Math.atan2(B[1]-A[1],B[0]-A[0])-PI/2,1.3);m++}
   for(let m2=0;m2<4;m2++)Y([2.9+hash(m2)*.4,-1.2+hash(m2+4)*.5+(m2%2)*1.8,0],ABC[r.ab[m2%r.ab.length]]||'#aaa',hash(m2)*3)}
  s.render();
  tag(c,'donor red cells',150,118,'#ff8787',12);tag(c,'recipient plasma',345,118,'#f6d98f',12);
  r.ab.length?tag(c,'Y = '+r.ab.join(' / ')+' antibodies',150,356,ABC[r.ab[0]],12):tag(c,'recipient has no anti-A / anti-B antibodies',150,356,C.muted,12);
  tag(c,r.ag.length?'antigens on donor cells: '+r.ag.join(', ')+'   (spikes)':'donor cells carry no A/B/Rh antigens',150,372,C.muted,12);
  tag(c,r.ok?(r.sens?'No clumping now; recipient may form anti-Rh':'No clumping'):'Clumping (agglutination)',44,98,r.ok?(r.sens?C.gold:C.mint):C.red,15)},
 assumption:'ABO and Rh only; real cross-matching also checks other antigens. Y-shapes are antibodies.'});
function compat(p){const [dg,dr]=[p.d.slice(0,-1),p.d.slice(-1)],[rg,rr]=[p.r.slice(0,-1),p.r.slice(-1)],ag=ABO[dg][0],ab=ABO[rg][1],aboOK=!ag.some(a=>ab.includes('anti-'+a)),rhOK=!(dr==='+'&&rr==='-');return{ok:aboOK,sens:aboOK&&!rhOK,ag:dr==='+'?[...ag,'Rh']:ag,ab,rh:rhOK?'Compatible':'Rh+ into Rh− recipient: no anti-Rh yet, so no clumping the first time, but the recipient may start making anti-Rh antibodies (a later Rh+ transfusion or pregnancy is then at risk)'}}

add({...ch(15,'Body Fluids and Circulation'),id:'bio-double-circulation',title:'Double circulation',
 description:'Follow red blood cells through the pulmonary circuit (heart–lungs) and the systemic circuit (heart–body).',
 formula:'Right ventricle → lungs → left atrium ;  left ventricle → body → right atrium',
 observe:'Oxygenated and deoxygenated blood never mix in the human four-chambered heart.',
 tryText:'Highlight the pulmonary circuit: which vessel carries deoxygenated blood away from the heart?',
 controls:[S('loop','Highlight','both',[['both','Both circuits'],['pul','Pulmonary circuit'],['sys','Systemic circuit']]),R('hr','Heart rate',50,150,1,72,'beats/min')],
 metrics:p=>[N('Pulmonary circuit','RV → pulmonary artery → lungs → pulmonary veins → LA'),N('Systemic circuit','LV → aorta → body → venae cavae → RA'),N('Unusual vessels','Pulmonary artery: deoxygenated; pulmonary vein: oxygenated')],
/*BEGIN dcdraw*/
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:80,cy:206,pitch:.04,yaw:-1.38,pitch:.1}),beat=1+.07*Math.max(0,Math.sin(t*p.hr/60*TAU)),hl=k=>p.loop==='both'||p.loop===k;
  torsoShell(s);heart(s,[.07,-.07,0],.588*beat,{rotY:PI/2});lungs(s,[0,.2,0],1.1);
  /* Paths start/end at the heart model's own vessel stumps (heart rotY=PI/2: patient's right = +z, left = -z). circ(): path, index of the capillary bed (colour switch). */
  const T=[.217,.577,-.029],pulL=[T,[.14,.62,-.3],[.1,.52,-.5],[.06,.3,-.62],[.04,.1,-.62],[0,.05,-.6],[-.06,.2,-.5],[-.1,.25,-.33]],pulR=[T,[.14,.62,.2],[.1,.5,.5],[.06,.3,.64],[.04,.1,.64],[0,.1,.55],[-.14,.3,.4],[-.3,.3,.15],[-.28,.28,-.15],[-.1,.25,-.33]],
  sys=[[.08,.4,-.04],[.082,.547,-.059],[.011,.8,-.118],[-.136,.8,-.25],[-.27,.55,-.235],[-.294,.05,-.176],[-.28,-.6,-.15],[-.22,-1.3,-.1],[-.1,-1.9,-.05],[.02,-1.9,.2],[0,-1.2,.3],[-.018,-.6,.353],[-.018,-.1,.353],[.07,.15,.34]];
  const circ=(path,m,r,c1,c2)=>{s.tube(path.slice(0,m+1),r,c1,{segs:8});s.tube(path.slice(m),r,c2,{segs:8})};
  if(hl('pul')){circ(pulL,4,.036,'#4263eb','#e03131');circ(pulR,4,.036,'#4263eb','#e03131');plexus(s,[.04,.1,-.62],.1,.16,.1,'#4263eb','#e03131');plexus(s,[.04,.1,.64],.1,.16,.1,'#4263eb','#e03131')}
  if(hl('sys')){circ(sys,8,.05,'#e03131','#4263eb');plexus(s,[-.05,-1.9,.08],.3,.16,.28,'#e03131','#4263eb')}
  const along=(path,q)=>{const i=Math.min(path.length-2,Math.floor(q*(path.length-1))),fr=q*(path.length-1)-i;return V.add(path[i],V.mul(V.sub(path[i+1],path[i]),fr))};for(let i=0;i<8;i++){const q=cycle(t*p.hr/400+i/8,1);if(hl('pul'))for(const pa of[pulL,pulR])s.ball(along(pa,q),.05,q<4/(pa.length-1)?'#5c7cfa':'#ff6b6b',{flat:true});if(hl('sys'))s.ball(along(sys,q),.055,q<8/(sys.length-1)?'#ff6b6b':'#5c7cfa',{flat:true})}
  lblCols(c,s,[['a',[0,.55,.64],'right lung','#ffc9c9','L'],['a',[0,.55,-.64],'left lung (O₂ picked up)','#ffc9c9','R'],['a',[.1,-.2,.2],'heart: 4 chambers','#ff8fab','R'],...(hl('pul')?[['a',[.1,.52,-.5],'pulmonary circuit','#91a7ff','R']]:[]),...(hl('sys')?[['a',[-.1,-1.9,-.05],'systemic circuit (body tissues)','#ff8787','R']]:[])],()=>false,214,486,128,392);s.render()},
/*END dcdraw*/
 assumption:'Schematic circuits; the systemic circuit is drawn as a single loop through the body.'});

/* ---------- Chapter 16: Excretory Products and their Elimination ---------- */
/*BEGIN nephkit*/
/* Nephron geometry (built once): corpuscle with capillary tuft, PCT, loop of Henle, DCT, collecting duct, peritubular capillaries and vasa recta. */
let NEPH=null;
function buildNephron(){const sin=Math.sin,cos=Math.cos,A=(a,b)=>V.add(a,b),G=[-2.5,1.35,0];
  const pct=[[-1.95,1.35,0]];for(let i=1;i<=34;i++){const u=i/34;pct.push([-1.95+1.3*u,1.3-.2*u+.27*sin(u*TAU*2.3)*(1-.25*u),.24*sin(u*TAU*2.3+1.3)])}pct.push([-.62,1.1,0]);
  const arc=[],cx=-.3,cy=-1.85,rr=.23;for(let i=0;i<=8;i++){const a=Math.PI+Math.PI*i/8;arc.push([cx+rr*cos(a),cy+rr*sin(a)*1.1,0])}
  const desc=[[-.62,1.1,0],[-.6,.7,0],[-.58,.1,0],[-.56,-.6,0],[-.55,-1.2,0],[-.53,-1.6,0]].concat(arc.slice(0,5)),
    asc=arc.slice(4).concat([[-.07,-1.55,0],[-.07,-1.1,0],[-.06,-.55,0],[-.04,0,0],[-.02,.6,0],[0,1.15,0]]),
    dct=[[0,1.15,0]];for(let i=1;i<=28;i++){const u=i/28;dct.push([1.55*u,1.18+.05*u+.23*sin(u*TAU*2.4)*(1-.2*u),.22*sin(u*TAU*2.4+.6)])}dct.push([1.62,1.3,0]);
  const cd=[[1.62,1.3,0],[1.64,.8,0],[1.66,0,0],[1.68,-1.2,0],[1.7,-2.45,0]],
    tuft=[0,1,2,3,4].map(k=>Array.from({length:13},(_,j)=>{const a=j*.62+k*1.3;return A(G,[.25*sin(1.7*a+k*.9)+.04,.25*sin(1.3*a+k*2.1),.23*sin(a+k*1.7)])})),
    aff=[[-3.55,2.0,.1],[-3.1,1.72,.05],[-2.78,1.56,0],[-2.52,1.5,0]],eff=[[-2.52,1.22,0],[-2.78,1.1,0],[-2.95,.8,.1],[-2.9,.55,.2]],
    vrD=[[-.33,.45,.32],[-.34,-.4,.32],[-.34,-1.3,.32],[-.33,-1.7,.32]],vrH=Array.from({length:7},(_,i)=>{const a=Math.PI*(1+i/6*1);return[-.3+.12*cos(a)+.0,-1.72+.16*sin(a),.32]}),vrA=[[-.27,-1.7,.32],[-.26,-1.2,.32],[-.25,-.4,.32],[-.24,.45,.32]],
    pcap=[0,1].map(k=>Array.from({length:30},(_,j)=>{const u=j/29;return[-2.0+1.35*u,1.3-.2*u+.34*sin(u*TAU*2.3+.8+k),.32*sin(u*TAU*2.3+2.1+k)+.05]})).concat([Array.from({length:26},(_,j)=>{const u=j/25;return[1.5*u,1.2+.05*u+.3*sin(u*TAU*2.4+.5),.3*sin(u*TAU*2.4+1.4)]})]),
    feed=[eff[3],[-2.4,.4,.3],[-1.5,.35,.34],[-.8,.4,.33],[-.33,.45,.32]],vein=[[-.24,.45,.32],[.3,.6,.36],[.9,1.2,.4],[1.1,2.0,.4]];
  const len=a=>{const c=[0];for(let i=1;i<a.length;i++)c.push(c[i-1]+Math.hypot(...V.sub(a[i],a[i-1])));return c},path=pct.concat(desc.slice(1),asc.slice(1),dct.slice(1),cd.slice(1)),cum=len(path);
  const F=q=>[q[0]*.82,q[1]*.88,q[2]],FA=a=>a.map(F),R={G:F(G),pct:FA(pct),desc:FA(desc),asc:FA(asc),dct:FA(dct),cd:FA(cd),tuft:tuft.map(FA),aff:FA(aff),eff:FA(eff),vrD:FA(vrD),vrH:FA(vrH),vrA:FA(vrA),pcap:pcap.map(FA),feed:FA(feed),vein:FA(vein),F};R.path=FA(path);R.cum=len(R.path);R.tot=R.cum[R.cum.length-1];return R}
function drawNephron(c,s,t){const N=NEPH||(NEPH=buildNephron()),G=N.G;
  /* cortex and medulla slabs */
  s.box([0,1.2,0],[6.6,1.75,1.9],'#ffc9c9',{alpha:.08});s.box([0,-.9,0],[6.6,2.35,1.9],'#fa5252',{alpha:.05});
  /* renal corpuscle: parietal wall of Bowman's capsule, urinary space, visceral layer on the capillary tuft */
  s.mesh(G,[.68,.64,.62],'#e9ecef',{alpha:.2,rings:9,segs:14});s.mesh(G,[.6,.57,.55],'#fff0f3',{alpha:.1,rings:6,segs:10});s.mesh(G,[.4,.38,.37],'#ffa8c0',{alpha:.45,rings:6,segs:10});
  for(const L of N.tuft)s.tube(L,.036,'#e03131',{segs:5});
  s.tube(N.aff,.085,'#e03131',{segs:8});s.tube(N.eff,.055,'#a61e4d',{segs:8});
  /* tubule */
  s.tube(N.pct,.115,'#ffb347',{segs:9});s.tube(N.desc,.042,'#8ecae6',{segs:6});
  s.tube(N.asc,u=>u<.45?.042:.075,u=>u<.45?'#6fb4ea':'#3d84d6',{segs:7});
  s.tube(N.dct,.082,'#b197fc',{segs:8});s.tube(N.cd,u=>.06+.07*u,'#ffe066',{segs:9});
  /* capillaries: peritubular network, vasa recta (arteriolar limb red, venous limb blue) */
  N.pcap.forEach((L,k)=>s.tube(L,.017,k<2?(u=>u<.5?'#e8590c':'#7c8cf8'):'#7c8cf8',{segs:4}));
  s.tube(N.feed,.03,'#d6336c',{segs:5});s.tube(N.vrD,.03,'#e03131',{segs:5});s.tube(N.vrH,.03,'#9c36b5',{segs:5});s.tube(N.vrA,.03,'#4263eb',{segs:5});s.tube(N.vein,.04,'#4263eb',{segs:6});
  /* filtrate / reabsorbed solutes */
  const at=q=>{const d=q*N.tot;let i=1;while(i<N.cum.length-1&&N.cum[i]<d)i++;const f=(d-N.cum[i-1])/(N.cum[i]-N.cum[i-1]||1);return V.add(N.path[i-1],V.mul(V.sub(N.path[i],N.path[i-1]),f))};
  for(let i=0;i<14;i++){const q=cycle(t*.08+i/14,1);if(q<.85||i%5===0)s.ball(at(q),.055,'#fff3bf',{flat:true,lift:.4});if(q>.05&&q<.55&&i%2===0)s.ball(V.add(at(q),[0,0,.2+.2*((t*2+i)%1)]),.04,'#74c0fc',{flat:true,lift:.4})}
  const F=N.F,LB=a=>a.map(r=>[r[0],F(r[1]),...r.slice(2)]);lblCols(c,s,LB([['a',[-3.3,2.2,0],'cortex','#c7d2da','L'],['a',[-2.4,1.95,.2],'Bowman’s capsule','#ffe3ea','L'],['a',[-2.5,1.35,.1],'glomerulus',C.red,'L'],['a',[-3.3,1.86,.1],'afferent arteriole','#ff8787','L'],['a',[-3.3,-.4,0],'medulla','#c7d2da','L'],
    ['a',[-1.3,1.55,.2],'PCT',C.gold,'R'],['a',[.8,1.45,.2],'DCT',C.purple,'R'],['a',[1.66,-.6,0],'collecting duct',C.gold,'R'],['a',[-.55,-.4,0],'descending limb',C.blue,'R'],['a',[-.3,-1.95,0],'loop of Henle',C.blue,'R'],['a',[-.04,-.3,.3],'vasa recta','#ff8787','R'],['a',[-1.4,1.5,.3],'peritubular capillaries','#ff8787','R']]),()=>false,196,524,126,394);
  s.render()}
/*END nephkit*/
add({...ch(16,'Excretory Products and their Elimination'),id:'bio-nephron',title:'Nephron: filtration and reabsorption',
 description:'Trace filtrate from the glomerulus through the tubule. Nearly all of it is reabsorbed.',
 formula:'GFR ≈ 125 mL/min ≈ 180 L/day ;  urine ≈ 1–1.5 L/day',
 observe:'About 99% of the filtrate is reabsorbed by the renal tubules; PCT reabsorbs most of the useful substances.',
 tryText:'Lower the reabsorption to 98%. How much urine would that make per day?',
 controls:[R('gfr','Glomerular filtration rate',60,150,1,125,'mL/min'),R('reab','Water reabsorbed',97,99.6,.1,99.2,'%',1)],
 metrics:p=>{const fd=p.gfr*1440/1000,ur=fd*(1-p.reab/100);return[N('Filtrate per day',fd,'L',0),N('Urine per day',ur,'L',2),N('Reabsorbed per day',fd-ur,'L',1),N('Nephrons per kidney','≈ 1 million')]},
/*BEGIN nephdraw*/
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:54,cx:388,cy:258,pitch:-.12,yaw:.3});drawNephron(c,s,t)},
/*END nephdraw*/
 assumption:'Single nephron, not to scale; blue dots show water and solutes being reabsorbed.'});

add({...ch(16,'Excretory Products and their Elimination'),id:'bio-countercurrent',title:'Counter-current mechanism',
 description:'Move a probe down the loop of Henle and read the osmolarity of the medullary interstitium.',
 formula:'Interstitial osmolarity: ≈ 300 mOsmol/L (cortex) → ≈ 1200 mOsmol/L (inner medulla)',
 observe:'Descending limb: permeable to water; ascending limb: impermeable to water but transports electrolytes out.',
 tryText:'Move the probe to the bottom of the loop. Why can urine become concentrated there?',
 controls:[R('depth','Depth into medulla',0,100,1,60,'%'),S('limb','Limb','desc',[['desc','Descending limb'],['asc','Ascending limb']])],
 metrics:p=>{const osm=300+900*p.depth/100;return[N('Interstitial osmolarity',osm,'mOsmol/L',0),N('Filtrate in this limb',p.limb==='desc'?`≈ ${f(osm,0)} (water leaves)`:'Becoming dilute (salts leave)'),N('Permeable to',p.limb==='desc'?'Water':'Electrolytes (NaCl), not water'),N('Helped by','Vasa recta and urea')]},
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:58,pitch:.06,cx:335,cy:268}),H=3.0,top=1.6,mix=(a,b,k)=>{const A=[1,3,5].map(i=>parseInt(a.slice(i,i+2),16)),B=[1,3,5].map(i=>parseInt(b.slice(i,i+2),16));return'#'+A.map((v,i)=>Math.round(v+(B[i]-v)*k).toString(16).padStart(2,'0')).join('')};
  for(let i=0;i<8;i++){const y=top-H*(i+.5)/8,k=i/7;s.box([0,y,-.6],[4.8,H/8,.2],mix('#f3d9a4','#9c4a3a',k),{alpha:.55});s.label([2.7,y,-.6],f(300+900*(i+.5)/8,0),C.muted,11)}
  s.label([-2.75,top-.2,-.6],'cortex',C.muted,12);s.label([-2.75,top-1.2,-.6],'outer medulla',C.muted,12);s.label([-2.75,top-2.4,-.6],'inner medulla',C.muted,12);
  /* hairpin of Henle: rounded bend, filtrate darkens in the descending limb and thins again in the ascending limb */
  const bend=[];for(let i=0;i<=8;i++){const a=PI+PI*i/8;bend.push([-.3+.3*Math.cos(a),top-H+.3*Math.sin(a),0])}
  const dl=[[-.6,top,0],[-.6,top-H*.5,0],...bend.slice(0,5)],al=[...bend.slice(4),[0,top-H*.5,0],[0,top,0]];
  s.tube(dl,.12,u=>mix('#d7ecff','#2f5fc0',u),{segs:10});s.tube(al,.12,u=>mix('#2f5fc0','#d7ecff',u),{segs:10});
  s.tube([[.7,top,.3],[.7,top-H,.3],[.85,top-H-.2,.3],[1.0,top-H,.3]],.065,'#e8505b',{segs:8,alpha:.9});s.tube([[1.0,top-H,.3],[1.0,top,.3]],.065,'#7b8cde',{segs:8,alpha:.9});s.label([1.5,top+.3,.3],'vasa recta',C.red,12);
  for(let i=0;i<8;i++){const y=top-.2-i*.4;s.arrow([-.75,y,0],[-1.25,y,0],'#4dabf7',2,7,i===0?'H₂O out':'');s.arrow([.15,y,0],[.65,y,0],'#ffd43b',2,7,i===0?'NaCl out':'')}
  s.label([-.8,top+.3,0],'descending',C.muted,11);s.label([.35,top+.3,0],'ascending',C.muted,11);
  const y=top-H*p.depth/100,x=p.limb==='desc'?-.6:0;s.ball([x,y,.2],.14,C.white,{glow:true,lift:3});s.render();tag(c,'blue arrows: water out of descending limb · yellow: NaCl out of ascending limb',44,98,C.muted,12)},
 assumption:'Linear interstitial gradient for teaching; numbers from NCERT Chapter 16.'});

add({...ch(16,'Excretory Products and their Elimination'),id:'bio-adh-regulation',title:'ADH and water balance',
 description:'Drink more or less water and see the hypothalamus adjust ADH, changing urine volume and concentration.',
 formula:'↓ body water → ↑ ADH (vasopressin) → ↑ water reabsorption in DCT and collecting duct',
 observe:'Without ADH (diabetes insipidus) large volumes of dilute urine are produced.',
 tryText:'Switch on diabetes insipidus and compare the urine volume.',
 controls:[R('intake','Water intake',.5,5,.1,2,'L/day',1),S('di','Condition','normal',[['normal','Normal'],['di','Diabetes insipidus (no ADH)']])],
 metrics:p=>{const r=adh(p);return[N('ADH level (relative)',r.adh*100,'%',0),N('Urine volume',r.vol,'L/day',2),N('Urine osmolarity',r.osm,'mOsmol/L',0),N('Status',r.note)]},
 draw:(c,p,t)=>{const r=adh(p),s=P3.scene(c,{scale:52,cx:250,cy:262,pitch:.03}),Bn=[-1.5,1.4,0],K=[.45,-.5,0],BL=[-.75,-1.85,0],vk=Math.min(1,r.vol/12),ur=pm=>pm,amb=vk<.3?'#ffe27a':vk<.7?'#f6d34a':'#fff0a8';
  /* brain in sagittal section: cerebrum with gyri, cerebellum, brainstem, hypothalamus and pituitary */
  s.mesh(Bn,[.95,.7,.18],'#f1b6bd',{rings:14,segs:26,spec:.4,shape:(u,v)=>1+.05*Math.sin(9*v+3*u)+.04*Math.sin(11*u)});
  s.mesh([Bn[0]+.55,Bn[1]-.5,0],[.32,.2,.16],'#d98c9a',{rings:8,segs:14});s.tube([[Bn[0]+.05,Bn[1]-.2,0],[Bn[0]+.12,Bn[1]-.55,0],[Bn[0]+.2,Bn[1]-.85,0]],.08,'#e7a6b0',{segs:8});
  s.mesh([Bn[0]-.1,Bn[1]-.18,.05],[.2,.14,.12],'#9775fa',{rings:8,segs:12,lift:2});
  s.tube([[Bn[0]-.08,Bn[1]-.3,.05],[Bn[0]-.05,Bn[1]-.5,.05]],.025,'#b197fc',{segs:6});s.mesh([Bn[0]-.05,Bn[1]-.58,.05],[.1,.08,.09],'#e599f7',{rings:7,segs:10});s.mesh([Bn[0]-.0,Bn[1]-.6,.05],[.11,.08,.09],'#7048e8',{rings:7,segs:10});
  /* ADH carried in the blood to the kidney */
  const vs=[[Bn[0],Bn[1]-.7,0],[-.9,.4,0],[-.2,.15,0],[.2,0,0]];s.tube(vs,.04,'#e8505b',{segs:6});
  for(let i=0;i<Math.max(1,Math.round(r.adh*8));i++){const q=cycle(t*.35+i/8,1),n=q*3,j=Math.min(2,Math.floor(n)),f2=n-j;s.ball([vs[j][0]+(vs[j+1][0]-vs[j][0])*f2,vs[j][1]+(vs[j+1][1]-vs[j][1])*f2,.1],.06,'#b197fc',{flat:true,glow:true,lift:3})}
  /* kidney in coronal section: cortex, medullary pyramids, pelvis */
  s.mesh(K,[.62,.95,.3],'#b9545c',{rings:16,segs:26,spec:.5,shape:(u,v)=>{const nx=Math.cos(u)*Math.cos(v),ny=Math.sin(u);return 1-.42*Math.exp(-((nx+1)**2)*10-ny*ny*7)}});
  for(let i=0;i<5;i++){const a=(-.8+i*.4)*PI*.75+PI*.05,cx0=K[0]+.5*Math.cos(a+PI*1.0)*-1,cy0=K[1]+.78*Math.sin(a);const ap=[K[0]-.12,K[1]+.02*i,.3],b1=[K[0]+.42*Math.cos(a)*1.0,K[1]+.74*Math.sin(a)+.1,.3],b2=[K[0]+.42*Math.cos(a)*1.0,K[1]+.74*Math.sin(a)-.1,.3];s.poly([ap,b1,b2],'#8c2f3d',{cull:false,z:1e5})}
  s.ball([K[0]-.2,K[1],.32],.16,'#f6d58a',{flat:true,lift:5});
  s.tube([[K[0]-.3,K[1]-.05,.1],[-.3,-1.0,0],[BL[0]+.05,BL[1]+.3,0]],.04,'#f1d77a',{segs:6});
  for(let i=0;i<1+Math.round(r.vol/3);i++){const q=cycle(t*.5+i*.31,1);s.ball([K[0]-.3+(BL[0]+.05-K[0]+.3)*q*.9-q*.5*.5,K[1]-.05+(BL[1]+.3-K[1]+.05)*q,.12],.045,amb,{flat:true,lift:3})}
  /* water returned to blood: more with more ADH */
  for(let i=0;i<Math.round(1+r.adh*4);i++)s.arrow([K[0]+.5,K[1]+.5-i*.3,.2],[K[0]+1.05,K[1]+.5-i*.3,.2],'#4dabf7',2,7,i===0?'H₂O reabsorbed':'');
  /* bladder: wall bag, urine level follows volume */
  const bs=.28+.3*Math.min(1,r.vol/20);s.mesh(BL,[bs,bs*.85,.2],'#e4a8a0',{alpha:.55,rings:12,segs:18,spec:.3});s.mesh([BL[0],BL[1]-bs*.1,0],[bs*.82,bs*.68,.16],amb,{alpha:.75,rings:10,segs:16});
  s.callout([Bn[0]-.1,Bn[1]-.18,.15],'hypothalamus','#c9b6ff',50,-40);s.callout([Bn[0],Bn[1]-.6,.15],'posterior pituitary → ADH','#c9b6ff',55,10);s.callout([K[0]+.4,K[1]-.5,.3],'kidney','#ff8787',55,-5);s.callout([BL[0]+bs,BL[1],.2],`bladder: ${f(r.vol,2)} L urine/day`,'#ffe066',45,0);s.render();
  chart(c,430,96,226,150,{title:'Urine volume vs water intake',xl:'intake (L/day)',xmin:.5,xmax:5,ymin:0,ymax:20,series:[{fn:x=>adh({intake:x,di:p.di}).vol,col:C.gold}],marker:[p.intake,r.vol]})},
 assumption:'Illustrative model: ~0.9 L/day lost by other routes, ~600 mOsmol solute per day, urine osmolarity limited to 50–1200 mOsmol/L.'});
function adh(p){const solute=600;if(p.di==='di'){const vol=Math.max(p.intake*.9,solute/60);return{adh:0,vol:Math.min(vol,20),osm:solute/Math.min(vol,20),note:'Dilute urine, excessive thirst'}}const vol=clamp(p.intake-.9,solute/1200,solute/50),osm=solute/vol,adhL=clamp((osm-50)/1150,0,1);return{adh:adhL,vol,osm,note:adhL>.6?'Water conserved (concentrated urine)':adhL<.2?'Excess water removed (dilute urine)':'Balanced'}}

/* ---------- Chapter 17: Locomotion and Movement ---------- */
add({...ch(17,'Locomotion and Movement'),id:'bio-sliding-filament',title:'Sliding filament theory',
 description:'Contract a sarcomere: thin actin filaments slide over thick myosin filaments, pulling the Z lines together.',
 formula:'A band constant ;  I band and H zone shorten during contraction',
 observe:'The filaments themselves do not shorten — they slide past each other using cross bridges powered by ATP.',
 tryText:'Contract fully. Which band disappears first?',
 controls:[R('con','Contraction',0,100,1,30,'%'),S('ca','Ca²⁺ released?','yes',[['yes','Yes (stimulated)'],['no','No (relaxed)']])],
 metrics:p=>{const L=sarcL(p);return[N('Sarcomere length',L,'μm',2),N('A band',1.6,'μm',2),N('I band',Math.max(0,L-1.6),'μm',2),N('H zone',Math.max(0,L-2),'μm',2)]},
 draw:(c,p,t)=>{const L=sarcL(p),s=P3.scene(c,{scale:62,pitch:.02,cx:345,cy:218}),k=2.4,half=L*k/2,act=1*k,myo=1.6*k/2,on=p.ca==='yes'&&p.con>0,MY=[-.75,-.15,.45],AY=[-1.05,-.45,.15,.75];
  /* Z discs */
  for(const sg of[-1,1]){s.box([sg*half,-.15,0],[.12,2.25,.5],'#8e9aa6',{spec:.4});s.box([sg*half,-.15,0],[.04,2.25,.52],'#c3ccd4')}
  /* thin filaments: actin strands anchored in the Z disc, drawn as beaded chains */
  for(const sg of[-1,1])for(const y of AY){s.tube([[sg*half,y,0],[sg*(half-act),y,0]],.032,'#4a8fe0',{segs:6});for(let i=1;i<=9;i++){const x=sg*(half-act*i/9.5);s.ball([x,y+.025*Math.sin(i*1.7),.02],.055,'#74b7ff',{flat:true})}}
  /* thick filaments: myosin shaft with a bare central zone and paired heads */
  for(const y of MY){s.tube([[-myo,y,0],[myo,y,0]],.075,'#d9363e',{segs:8});s.ball([-myo,y,0],.075,'#d9363e',{flat:true});s.ball([myo,y,0],.075,'#d9363e',{flat:true});
   for(const sg of[-1,1])for(let i=1;i<=6;i++){const x=sg*(.22+(myo-.3)*i/6.4),sw=on?.1*Math.sin(t*7+i+y*3):0,d=sg*(on?.13+sw:.04);for(const u of[-1,1]){s.seg([x,y+u*.07,0],[x+d,y+u*.25,0],'#ff8d92',3);s.ball([x+d,y+u*.26,.02],.045,'#ff6a72',{flat:true})}}}
  s.box([0,-.15,0],[.04,1.7,.4],'#ffd6d6',{alpha:.5});
  /* band strip: I | A (with H zone) | I */
  const by=-1.55,hz=Math.max(0,half-act);s.poly([[-half,by,0],[-myo,by,0],[-myo,by-.16,0],[-half,by-.16,0]],'#8cc0ff',{cull:false});s.poly([[myo,by,0],[half,by,0],[half,by-.16,0],[myo,by-.16,0]],'#8cc0ff',{cull:false});s.poly([[-myo,by,0],[myo,by,0],[myo,by-.16,0],[-myo,by-.16,0]],'#e5484d',{cull:false});if(hz>.02)s.poly([[-hz,by,0],[hz,by,0],[hz,by-.16,0],[-hz,by-.16,0]],'#ffc9cb',{cull:false});
  s.label([0,by-.42,0],'A band',C.red,12);if(half-myo>.25){s.label([-(half+myo)/2,by-.42,0],'I band',C.cyan||'#74c0fc',12);s.label([(half+myo)/2,by-.42,0],'I band','#74c0fc',12)}if(hz>.3)s.label([0,by+.38,0],'H zone',C.muted,11);
  s.callout([-half,1.15,.1],'Z line','#ced4da',-15,-40);s.callout([myo*.6,.45+.07,0],on?'myosin heads pull actin (Ca²⁺ + ATP)':'myosin heads (need Ca²⁺)','#ffa8a8',50,-80);s.callout([-myo*.9,.75,0],'myosin (thick)','#ff8787',-30,-48);s.callout([half-act*.4,.75,.05],'actin (thin)','#74c0fc',120,-50);s.render()},
 assumption:'Typical lengths: actin 1.0 μm on each side, myosin 1.6 μm; sarcomere 2.6 → 1.8 μm on full contraction.'});
function sarcL(p){return p.ca==='yes'?2.6-.8*p.con/100:2.6}

const JOINT={ball:['Ball and socket','Between humerus and pectoral girdle','Movement in all planes'],hinge:['Hinge','Knee joint','Movement in one plane'],pivot:['Pivot','Between atlas and axis','Rotation about one axis'],gliding:['Gliding','Between the carpals','Bones slide over each other'],saddle:['Saddle','Between carpal and metacarpal of thumb','Movement in two planes']};
add({...ch(17,'Locomotion and Movement'),id:'bio-synovial-joints',title:'Synovial joints',
 description:'Move five kinds of synovial joint and see which directions each allows.',
 formula:'Synovial joints: fluid-filled cavity between articulating surfaces',
 observe:'The shape of the articulating surfaces decides how freely a joint can move.',
 tryText:'Try both sliders on a hinge joint. Which one does nothing?',
 controls:[S('j','Joint','ball',Object.keys(JOINT).map(k=>[k,JOINT[k][0]])),R('a','Movement 1',-60,60,1,30,'°'),R('b','Movement 2',-60,60,1,0,'°')],
 metrics:p=>{const d=JOINT[p.j];return[N('Joint',d[0]),N('Example',d[1]),N('Range',d[2])]},
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:p.j==='gliding'?96:64,pitch:.04,cx:300,cy:p.j==='gliding'?215:250}),a=rad(p.a),b=rad(p.b),bone='#ede3c8',bone2='#dccfae',cart='#a8d8ee',
  /* long bone: flared ends, shaft narrower */
  LB=(pts,r,col)=>s.tube(pts,u=>r*(1+.75*Math.exp(-((u/.13)**2))+.5*Math.exp(-(((1-u)/.13)**2))),col,{segs:12,spec:.4}),
  SQ=(u,v)=>1/Math.pow(Math.abs(Math.cos(u)*Math.cos(v))**4+Math.abs(Math.sin(u))**4+Math.abs(Math.cos(u)*Math.sin(v))**4,.25);
  if(p.j==='ball'){
   /* scapula blade with glenoid cup holding the humeral head */
   s.mesh([-.75,-1.5,-.1],[.55,1.15,.1],bone2,{rings:12,segs:20,rot:[0,0,.35]});
   s.mesh([0,-.12,0],[.62,.42,.5],bone,{rings:10,segs:18,shape:u=>u>.15?.0:1});s.mesh([0,-.1,.02],[.55,.36,.44],cart,{rings:10,segs:18,alpha:.85,shape:u=>u>.15?.0:1});
   const d=[Math.sin(a)*Math.cos(b),Math.cos(a)*Math.cos(b),Math.sin(b)];s.tube([V.mul(d,.3),V.mul(d,2.5)],.17,bone,{segs:12,spec:.4});LB([V.mul(d,.5),V.mul(d,2.6)],.14,bone);
   s.ball([0,0,0],.4,bone,{spec:.5});s.ball([0,0,0],.43,cart,{alpha:.5});s.tube([V.mul(d,.25),V.mul(d,.7)],.22,bone,{segs:10})}
  else if(p.j==='hinge'){
   /* humerus ends in a spool (trochlea); ulna with olecranon hooks around it */
   LB([[0,-2.4,0],[0,-.35,0]],.17,bone);s.cyl([0,0,0],[0,0,1],.34,.75,bone,{seg:22});s.cyl([0,0,0],[0,0,1],.37,.55,cart,{seg:22});
   const d=[Math.sin(a),Math.cos(a),0],n=[-Math.cos(a),Math.sin(a),0];LB([V.mul(d,.25),V.mul(d,2.5)],.14,bone2);s.mesh(V.add(V.mul(d,-.05),V.mul(n,-.0)),[.3,.35,.28],bone2,{rings:8,segs:14});
   s.label([.62,-.5,.3],'axis',C.muted,12)}
  else if(p.j==='pivot'){
   /* axis vertebra with odontoid peg; atlas ring rotates around it */
   s.mesh([0,-.95,0],[.95,.45,.8],bone2,{rings:10,segs:20,spec:.4,shape:SQ});s.lathe([0,-.55,0],[[.3,0],[.26,.5],[.2,.95],[.14,1.2],[0,1.3]],bone,{segs:16,spec:.4});
   const an=[];for(let i=0;i<=24;i++){const q=a+TAU*i/24;an.push([.62*Math.cos(q),.3,.62*Math.sin(q)])}s.tube(an,u=>.15+.04*Math.sin(u*TAU),cart,{segs:8,alpha:.9});s.tube(an,.1,bone,{segs:8});
   s.tube([[.1*Math.cos(a+PI*.5)+.0,.3,.0],[0,.3,0]],.01,bone,{segs:3});s.ball([.62*Math.cos(a+PI*.5),.3,.62*Math.sin(a+PI*.5)],.14,'#ffd43b',{flat:true,lift:3})}
  else if(p.j==='gliding'){
   /* carpals: rounded blocks separated by a thin cartilage and fluid layer */
   for(let i=0;i<4;i++){const x=-.45+(i%2)*.95+(i===1?p.a/120:0),y=-.45+Math.floor(i/2)*.9+(i===2?p.b/120:0);s.mesh([x,y,0],[.42,.4,.4],i%2?bone2:bone,{rings:10,segs:16,spec:.4,shape:SQ});s.mesh([x,y,.0],[.45,.43,.43],cart,{rings:8,segs:14,alpha:.25,shape:SQ})}}
  else{
   /* saddle joint: trapezium and metacarpal base are each concave in one plane and convex in the other */
   LB([[-.2,-2.3,0],[0,-.5,0]],.2,bone2);s.mesh([0,-.2,0],[.6,.38,.5],bone2,{rings:12,segs:22,spec:.4,shape:(u,v)=>1+.4*Math.cos(2*v)*Math.sin(u)*(u>0?1:.3)});
   const d=[Math.sin(a),Math.cos(a)*Math.cos(b),Math.sin(b)];s.mesh([0,.12,0],[.5,.3,.45],bone,{rings:10,segs:20,spec:.4,shape:(u,v)=>1-.35*Math.cos(2*v)*Math.sin(u)*(u<0?1:.3)});LB([V.mul(d,.3),V.mul(d,2.3)],.15,bone)}
  if(p.j!=='gliding'){s.mesh([0,0,0],[.85,.7,.82],'#ffc9c9',{alpha:.14,rings:10,segs:18});s.callout([.8,.35,.2],'synovial capsule + fluid','#ffc9c9',55,-35)}
  const J={ball:['head of humerus','socket (glenoid cavity)','movement in all planes (shoulder, hip)'],hinge:['trochlea of humerus','ulna moves in one plane','elbow, knee'],pivot:['odontoid process of axis','atlas rotates round it','neck: atlas–axis'],gliding:['carpals slide on each other','flat surfaces glide','wrist (carpals)'],saddle:['saddle-shaped surfaces','two planes of movement','thumb: carpal–metacarpal']}[p.j];
  if(p.j==='ball'){s.callout([-.15,.3,.3],J[0],'#ede3c8',-85,-30);s.callout([-.35,-.3,.3],J[1],'#dee2e6',-85,40);s.callout([.3,-.1,.4],'articular cartilage','#a8d8ee',70,55)}
  else if(p.j==='pivot')s.callout([.1,.9,0],J[0],'#ede3c8',70,-30);
  else if(p.j==='gliding')s.callout([-.45,.45,.3],J[0],'#ede3c8',-80,-40);
  else s.callout([0,0,.3],J[0],'#ede3c8',-85,-40);
  s.label([0,-2.6,0],J[2],'#ffd43b',13);s.render()},
 assumption:'Bones simplified to cylinders and spheres; ligaments and synovial membrane omitted.'});

/*BEGIN skelkit*/
/* Labels in two tidy columns beside a model: items [key,3D point,text,colour?,side 'L'|'R'], spaced evenly and sorted by height so leader lines do not cross. */
const lblCols=(c,s,items,hi,xl,xr,y0=130,y1=388)=>{const col=[[],[]],k=window.PhysicaTextScale||1;for(const it of items){const Q=s.P(it[1]);col[(it[4]||(Q[0]<348?'L':'R'))==='L'?0:1].push([it,Q])}
  [xl,xr].forEach((x,j)=>{const a=col[j].sort((m,n)=>m[1][1]-n[1][1]),n=a.length,g=n>1?Math.min(40*k,(y1-y0)/(n-1)):0,ym=(y0+y1)/2-g*(n-1)/2,right=j===1;a.forEach(([it,Q],i)=>{const y=ym+g*i,h=hi(it[0]),cl=h?'#ffd43b':(it[3]||'#dbe7f0'),sz=h?13:11;
    s.hud(()=>{c.save();c.font=`700 ${Math.round(sz*k)}px system-ui, sans-serif`;const w=c.measureText(it[2]).width;let tx=right?x+8:x-8;if(!right&&tx-w<34)tx=34+w;if(right&&tx+w>656)tx=656-w;c.strokeStyle=cl;c.globalAlpha=.85;c.lineWidth=1.2;c.beginPath();c.moveTo(Q[0],Q[1]);c.lineTo(x,y);c.lineTo(right?x+6:x-6,y);c.stroke();c.globalAlpha=1;c.fillStyle=cl;c.beginPath();c.arc(Q[0],Q[1],2.4,0,6.2832);c.fill();c.restore();s._label(tx,y,it[2],cl,sz,right?'left':'right')})})})};
/* Skeleton geometry: built once (lazily) as a list of primitives tagged by group, then replayed each frame. Front = +x, patient's left/right = -z/+z. */
let SKOPS=null;
function buildSkeleton(){const ops=[],TAU2=Math.PI*2,lerp=(a,b,u)=>[a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u,a[2]+(b[2]-a[2])*u];
  const T=(g,pts,r,seg=5,c,c2)=>ops.push({g,k:'tube',a:[pts,r,{segs:seg}],c,c2}),M=(g,p,rad,o,c,c2)=>ops.push({g,k:'mesh',a:[p,rad,o||{}],c,c2}),B=(g,p,r,c,c2)=>ops.push({g,k:'ball',a:[p,r,{}],c,c2}),
    Pl=(g,pts,o,c,c2)=>ops.push({g,k:'poly',a:[pts,o],c,c2}),Cy=(g,p,r,len,seg)=>ops.push({g,k:'cyl',a:[p,[0,1,0],r,len,{seg}]}),Ph=(g,pts,w,c)=>ops.push({g,k:'path',a:[pts,w],c});
  const SPX=[[2.4,-.02],[2.3,.0],[2.2,.02],[2.12,-.03],[1.95,-.1],[1.75,-.13],[1.5,-.1],[1.38,-.06],[1.2,0],[1.0,-.04],[.88,-.1],[.74,-.13]],
    spx=y=>{for(let i=0;i<SPX.length-1;i++)if(y<=SPX[i][0]&&y>=SPX[i+1][0]){const u=(SPX[i][0]-y)/(SPX[i][0]-SPX[i+1][0]);return SPX[i][1]+(SPX[i+1][1]-SPX[i][1])*u}return SPX[SPX.length-1][1]};
  /* skull */
  const SKc=[-.02,2.78,0];M('skull',SKc,[.36,.28,.27],{rings:12,segs:18,shape:(u,v)=>(u<0?1+.16*u*(1+.5*Math.cos(v)):1)*(1+.05*Math.max(0,-Math.cos(v))*Math.cos(u))});M('skull',[.2,2.55,0],[.14,.11,.13],{rings:5,segs:10});M('skull',[.1,2.49,0],[.17,.07,.15],{rings:4,segs:10});
  for(const g of[-1,1]){B('skull',[.275,2.665,g*.115],.078,'#14110d');ops.push({g:'skull',k:'ring',a:[[.272,2.665,g*.115],[1,0,0],.082,'#d9cfb4',1.6]});
    T('skull',[[.19,2.57,g*.12],[.06,2.58,g*.25],[-.08,2.61,g*.262]],.016,4);B('skull',[-.03,2.65,g*.262],.012,'#14110d')}
  Pl('skull',[[.338,2.64,0],[.328,2.5,-.04],[.328,2.5,.04]],{cull:false,shade:false},'#14110d');
  for(let i=0;i<9;i++){const a=-1.25+i*.3125;B('skull',[.2+.125*Math.cos(a),2.455,.12*Math.sin(a)],.014,'#fbf8ee');B('skull',[.19+.125*Math.cos(a),2.435,.115*Math.sin(a)],.014,'#fbf8ee')}
  T('skull',[[-.04,2.57,-.2],[-.08,2.44,-.19],[0,2.37,-.16],[.16,2.34,-.1],[.26,2.35,-.035],[.26,2.35,.035],[.16,2.34,.1],[0,2.37,.16],[-.08,2.44,.19],[-.04,2.57,.2]],u=>.024+.012*Math.sin(u*Math.PI*1),5);
  Ph('skull',Array.from({length:17},(_,i)=>{const a=.25+i*.17;return[-.02+.362*Math.cos(a),2.78+.282*Math.sin(a),0]}),1.1,'#8d8466');
  Ph('skull',Array.from({length:13},(_,i)=>{const t=-1.2+i*.2;return[.07,2.78+.272*Math.cos(t),.262*Math.sin(t)]}),1.1,'#8d8466');
  /* vertebral column: 7 cervical, 12 thoracic, 5 lumbar, sacrum, coccyx */
  const vy=[];for(let i=0;i<7;i++)vy.push([2.33-i*.033,.034,.026]);for(let i=0;i<12;i++)vy.push([2.09-i*.056,.048+.0025*i,.044]);for(let i=0;i<5;i++)vy.push([1.4-i*.078,.075,.066]);
  const disc=[];for(let y=2.35;y>=1.0;y-=.1)disc.push([spx(y),y,0]);T('vertebral',disc,.034,6,'#8fc0c6','#ffe9a0');
  vy.forEach(([y,r,h],i)=>{const x=spx(y);Cy('vertebral',[x,y,0],r,h,8);T('vertebral',[[x-r*.7,y+.005,0],[x-r*1.9,y-.035,0]],.011,4);T('vertebral',[[x-r*.3,y,-r*2],[x-r*.3,y,r*2]],.01,4)});
  M('vertebral',[-.1,.88,0],[.07,.2,.15],{rings:6,segs:10,shape:u=>.5+.5*Math.sin(u)*.9+.2});T('vertebral',[[-.14,.7,0],[-.15,.62,0],[-.12,.57,0]],u=>.025*(1-.5*u),4);
  /* ribs: 12 pairs with costal cartilage, sternum */
  const xs=y=>.19+(2.2-y)*.17,ys=[2.13,1.99,1.87,1.77,1.67,1.58,1.49],cart=[];
  for(const g of[-1,1]){const prev=[];for(let i=0;i<12;i++){const y0=2.09-i*.056,s0=Math.pow(Math.sin(Math.PI*(i+1.2)/13.5),.8),a=.1+.14*s0,b=.09+.31*s0,cx=spx(y0)-.04+a,drop=.1+.012*i,end=i<10?.3:i===10?1.1:1.35,pts=[];
      for(let j=0;j<=8;j++){const q=j/8,ph=Math.PI-(Math.PI-end)*q;pts.push([cx+a*Math.cos(ph),y0-drop*Math.pow(q,1.4)+.03*Math.sin(Math.PI*q),g*b*Math.sin(ph)])}
      T('ribs',pts,.03,4);const e=pts[8];
      if(i<7)T('ribs',[e,lerp(e,[xs(ys[i]),ys[i],g*.035],.5),[xs(ys[i]),ys[i],g*.035]],.024,4,'#bfe0e6','#ffe9a0'),prev[i]=[e,[xs(ys[i]),ys[i],g*.035]];
      else if(i<10){const pe=prev[i-1],tgt=lerp(pe[0],pe[1],.72);T('ribs',[e,lerp(e,tgt,.5),tgt],.022,4,'#bfe0e6','#ffe9a0');prev[i]=[e,tgt]}}}
  M('sternum',[.2,2.08,0],[.03,.11,.12],{rings:5,segs:8,rot:[0,0,-.08]});M('sternum',[.25,1.77,0],[.025,.26,.07],{rings:6,segs:8,rot:[0,0,-.08]});M('sternum',[.27,1.43,0],[.02,.09,.035],{rings:4,segs:8});
  /* pectoral girdle: clavicle and scapula; pelvic girdle: coxal bones */
  for(const g of[-1,1]){T('girdles',[[.2,2.2,g*.03],[.2,2.19,g*.2],[.12,2.18,g*.36],[.0,2.17,g*.5]],u=>.02+.01*Math.sin(u*3),5);
    Pl('girdles',[[-.17,2.14,g*.27],[-.06,2.16,g*.5],[-.02,2.04,g*.5],[-.1,1.7,g*.4],[-.2,1.56,g*.34],[-.19,1.66,g*.26]],{cull:false,spec:.25,stroke:'#00000030'});T('girdles',[[-.19,1.9,g*.27],[-.1,2.0,g*.4],[-.05,2.17,g*.51]],.014,4);B('girdles',[-.02,2.05,g*.5],.04);T('girdles',[[.0,2.1,g*.47],[.08,2.1,g*.47]],.012,4);
    const ring=[[-.17,1.06,g*.1],[-.11,1.2,g*.27],[.02,1.25,g*.39],[.13,1.2,g*.41],[.14,1.08,g*.34],[.13,.97,g*.28],[.06,.8,g*.23],[-.08,.84,g*.16],[-.15,.95,g*.12]];Pl('girdles',ring,{cull:false,spec:.25,stroke:'#00000030'});T('girdles',ring.slice(0,6),.018,4);
    T('girdles',[[.05,.76,g*.2],[-.06,.5,g*.19],[.04,.47,g*.1],[.14,.56,g*.025],[.12,.7,g*.09],[.05,.76,g*.2]],.034,5)}
  /* limbs: long bones with rounded epiphyses */
  const LB=(g,a,b,rs,ra,rb,n=5)=>{const pts=[];for(let i=0;i<n;i++)pts.push(lerp(a,b,i/(n-1)));T(g,pts,u=>rs*1.25*(1+.55*Math.exp(-((u/.14)**2))+.45*Math.exp(-(((1-u)/.14)**2))),6);B(g,a,ra);B(g,b,rb)};
  for(const g of[-1,1]){
    LB('limbs',[0,2.0,g*.53],[.0,1.2,g*.62],.028,.062,.05);B('limbs',[-.03,1.16,g*.6],.03);
    LB('limbs',[.0,1.2,g*.64],[.03,.52,g*.66],.02,.034,.028);LB('limbs',[.04,1.2,g*.57],[.07,.5,g*.74],.018,.028,.034);
    B('limbs',[.075,.46,g*.7],.045);B('limbs',[.04,.45,g*.64],.035);
    [[-.045,.26,.98],[-.022,.2,1.0],[0,.18,1.0],[.025,.2,1.0],[.05,.22,1.0]].forEach(([o,L,_],i)=>{const z0=.7+o*1.0,pts=[];for(let j=0;j<7;j++){const u=j/6;pts.push([.09+.01*u,.42-(.42-L*.35+(i===1||i===2?.02:0))*u*.9,g*(z0+o*.5*u)])}T('limbs',pts,u=>.0095+.0055*Math.pow(Math.cos(3*Math.PI*u),2),4)});
    T('limbs',Array.from({length:7},(_,j)=>{const u=j/6;return[.1+.1*u,.42-.3*u,g*(.72+.1*u)]}),u=>.011+.005*Math.pow(Math.cos(3*Math.PI*u),2),4);
    LB('limbs',[.0,.78,g*.2],[.0,-.4,g*.13],.04,.075,.07);T('limbs',[[0,.78,g*.2],[-.01,.7,g*.26]],.026,5);B('limbs',[-.02,.68,g*.3],.04);
    B('limbs',[.07,-.4,g*.13],.04);LB('limbs',[.0,-.44,g*.13],[.0,-1.4,g*.11],.032,.06,.045);LB('limbs',[-.02,-.5,g*.2],[-.03,-1.42,g*.18],.014,.025,.028);
    B('limbs',[-.005,-1.46,g*.12],.05);M('limbs',[-.09,-1.53,g*.12],[.1,.06,.055],{rings:5,segs:8});M('limbs',[.12,-1.55,g*.12],[.1,.04,.06],{rings:4,segs:8});
    [-.045,-.022,0,.022,.045].forEach((o,i)=>{const L=i===0?.7:.62+.02*(i===1);const pts=[];for(let j=0;j<7;j++){const u=j/6;pts.push([.2+(L-.2)*u,-1.56-.005*u,g*(.12+o*(1+1.2*u)+.01*i)])}T('limbs',pts,u=>.011+.005*Math.pow(Math.cos(3*Math.PI*u),2),4)})}
  return ops}
function drawSkeleton(s,hi){const ops=SKOPS||(SKOPS=buildSkeleton()),BONE='#ede3c8',HL='#ffd43b';
  for(const o of ops){const h=hi(o.g),col=h?(o.c2||HL):(o.c||BONE);
    switch(o.k){case'tube':s.tube(o.a[0],o.a[1],col,o.a[2]);break;case'mesh':s.mesh(o.a[0],o.a[1],col,o.a[2]);break;case'ball':s.ball(o.a[0],o.a[1],o.c||col,o.a[2]);break;case'poly':s.poly(o.a[0],col,o.a[1]);break;case'cyl':s.cyl(o.a[0],o.a[1],o.a[2],o.a[3],col,o.a[4]);break;case'ring':s.ring(o.a[0],o.a[1],o.a[2],o.a[3],o.a[4]);break;case'path':s.path(o.a[0],h?'#a88400':o.c,o.a[1]);break}}}
/*END skelkit*/
const SKEL={axial:['Axial skeleton',80,'Skull 22 + hyoid 1 + ear ossicles 6, vertebrae 26, sternum 1, ribs 24'],skull:['Skull',22,'8 cranial + 14 facial bones'],vertebral:['Vertebral column',26,'7 cervical, 12 thoracic, 5 lumbar, 1 sacral, 1 coccygeal'],ribs:['Ribs',24,'12 pairs: 7 true, 3 false, 2 floating'],limbs:['Limbs',120,'30 bones in each limb'],girdles:['Girdles',6,'Pectoral (clavicle + scapula) × 2, pelvic (coxal) × 2'],appendicular:['Appendicular skeleton',126,'Limbs 120 + girdles 6']};
add({...ch(17,'Locomotion and Movement'),id:'bio-human-skeleton',title:'The human skeleton: 206 bones',
 description:'Highlight parts of the axial and appendicular skeleton and count their bones.',
 formula:'206 bones = 80 (axial) + 126 (appendicular)',
 observe:'Each limb has 30 bones; the vertebral column has 26 serially arranged vertebrae.',
 tryText:'Add up the skull (22), hyoid (1), ear ossicles (6), vertebral column (26), sternum (1) and ribs (24). Do you get 80?',
 controls:[S('part','Highlight','axial',Object.keys(SKEL).map(k=>[k,SKEL[k][0]]))],
 metrics:p=>{const d=SKEL[p.part];return[N('Part',d[0]),N('Number of bones',d[1],'',0),N('Made up of',d[2]),N('Whole skeleton',206,'bones',0)]},
/*BEGIN skeldraw*/
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:47,cy:300,yaw:-.9+.35*Math.sin(t*.3)}),g={axial:['skull','vertebral','ribs','sternum'],appendicular:['limbs','girdles']},hi=k=>p.part===k||(g[p.part]||[]).includes(k);
  drawSkeleton(s,hi);
  lblCols(c,s,[['skull',[.0,3.0,.1],'skull (22 bones)'],['vertebral',[-.1,1.6,0],'vertebral column (26)',null,'L'],['ribs',[.1,1.7,.36],'ribs (12 pairs)'],['ribs',[.3,1.62,.1],'costal cartilage','#bfe0e6','R'],['sternum',[.27,1.8,0],'sternum',null,'R'],['girdles',[-.05,2.17,.5],'pectoral girdle'],['girdles',[.0,1.1,.4],'pelvic girdle',null,'L'],['limbs',[0,1.6,.58],'humerus'],['limbs',[0,.1,.17],'femur',null,'L']],hi,238,458);
  s.render()},
/*END skeldraw*/
 assumption:'Schematic skeleton; bone counts from NCERT Chapter 17.'});

/* ---------- Chapter 18: Neural Control and Coordination ---------- */
add({...ch(18,'Neural Control and Coordination'),id:'bio-action-potential',title:'Nerve impulse: the action potential',
 description:'Stimulate an axon. If the stimulus reaches threshold, Na⁺ rushes in and a full action potential travels along it.',
 formula:'Resting ≈ −70 mV → depolarisation (Na⁺ in) → repolarisation (K⁺ out)',
 observe:'The response is all-or-none: below threshold nothing travels; above it the spike is always the same size.',
 tryText:'Increase the stimulus slowly. At what value does the impulse fire?',
 controls:[R('stim','Stimulus strength',0,40,1,25,'mV'),R('thr','Threshold depolarisation',10,25,1,15,'mV')],
 metrics:(p,t)=>{const fire=p.stim>=p.thr,v=apV(p,cycle(t,4));return[N('Fires?',fire?'Yes — all-or-none spike':'No (sub-threshold)'),N('Membrane potential now',v,'mV',0),N('Resting potential',-70,'mV',0),N('Na⁺/K⁺ pump','3 Na⁺ out for 2 K⁺ in')]},
 draw:(c,p,t)=>{const fire=p.stim>=p.thr,s=P3.scene(c,{scale:48,cx:290,cy:318,pitch:-.1,yaw:.5}),T=cycle(t,4),front=-3+T*2.2,R0=.6,X0=-3.4,X1=3.4,A=(x,r,a)=>[x,r*Math.cos(a),r*Math.sin(a)];
  const AX=AXL||(AXL=Array.from({length:35},(_,i)=>[-3.4+6.8*i/34,0,0])),zone=x=>{const d=x-front;return !fire?0:d<0&&d>-.8?1:d<=-.8&&d>-1.7?2:0};
  /* membrane: outer and inner leaflet shells coloured by state (cream = resting, gold = depolarised, lilac = repolarising) */
  s.tube(AX,R0,u=>{const z=zone(X0+6.8*u);return z===1?'#ffc919':z===2?'#b197fc':'#f5deb8'},{alpha:.5,segs:20});
  s.tube(AX,R0-.07,u=>{const z=zone(X0+6.8*u);return z===1?'#f08c00':z===2?'#7950f2':'#e7b988'},{alpha:.38,segs:16});
  /* axoplasm: neurofilaments / microtubules and mitochondria */
  for(let k=0;k<4;k++){const a=k*1.57+.5,r=.18+.06*(k%2);s.tube([A(X0,r,a),A(X1,r,a)],.012,'#8fa6b8',{segs:4})}
  for(const [x,a] of[[-2.2,3.9],[.4,2.5],[2.5,4.4]])s.mesh(A(x,.2,a),[.24,.08,.08],'#f08c3a',{alpha:.85,rings:5,segs:8});
  /* voltage-gated channels in the membrane: Na⁺ (orange) and K⁺ (purple); bright when open */
  for(let i=0;i<13;i++){const x=X0+.3+i*.5,na=i%2===0,z=zone(x),open=na?z===1:z===2,a=.5+.7*hash(i+3),n=A(0,1,a);
    s.cyl(A(x,R0-.03,a),n,.08,.2,open?(na?'#ffa94d':'#b197fc'):(na?'#a8642a':'#5f4a9c'),{seg:7});if(open)s.ball(A(x,R0+.14,a),.06,na?'#fff3bf':'#e5dbff',{flat:true,lift:.5,glow:true})}
  /* ions: outside the membrane (r > R0) or inside it */
  for(let i=0;i<22;i++){const x=X0+.2+i*.3,z=zone(x),a=.2+1.7*hash(i+11),a2=.3+1.6*hash(i+31),bob=.03*Math.sin(t*2+i);
    s.ball(A(x,z===1?.3:R0+.2+bob,a),.05,'#fab005',{flat:true});s.ball(A(x+.14,z===2?R0+.22+bob:.34,a2),.05,'#7950f2',{flat:true})}
  /* stimulating electrode at the left end */
  s.cyl([X0-.45,.62,.32],V.norm([1,-.5,-.3]),.05,.7,'#adb5bd',{seg:8});if(T<.7)s.ball([X0+.05,.4,.1],.12+.05*Math.sin(T*30),'#ffd43b',{flat:true,glow:true});
  const wl=[['a',A(X0-.7,.9,.35),'stimulus electrode','#ced4da','B'],['a',A(-.5,R0,1.1),'Na⁺ channel (voltage-gated)','#ffa94d','B'],['a',A(.5,R0,1.1),'K⁺ channel (voltage-gated)','#b197fc','B']];
  if(fire)wl.push(['a',[clamp(front-.4,-3,3),.3,.4],'depolarised: Na⁺ rushes in','#ffd43b','C'],['a',[clamp(front-1.3,-3.2,3),.3,.4],'repolarising: K⁺ moves out','#b197fc','C']);else wl.push(['a',[0,.3,.4],'stimulus below threshold: no impulse','#ff8787','C']);
  wl.push(['a',[-1.6,-.1,.4],'axoplasm (cytoplasm)','#a9bccb','C'],['a',[-2.7,R0,.3],'axon membrane: resting (−70 mV, outside +)','#ffe3bf','T']);
  lblRows(c,s,wl,{T:236,B:374,C:396},40,640);s.render();
  chart(c,420,96,236,170,{title:'Membrane potential vs time',xl:'ms',xmin:0,xmax:4,ymin:-90,ymax:45,series:[{fn:x=>apV(p,x),col:C.gold},{fn:()=>-70+p.thr,col:'#ff8787',dash:[4,4]}],marker:[T,apV(p,T)]});tag(c,'yellow dots: Na⁺   purple: K⁺',44,98,C.muted,13)},
 assumption:'Stylised waveform (peak ≈ +35 mV, undershoot ≈ −80 mV); the time axis is shown in ms but the animation is slowed.'});
let AXL=null,RFX=null,BJ=null;
function apV(p,x){const t0=.5;if(x<t0)return-70;if(p.stim<p.thr)return-70+p.stim*(1-Math.exp(-(x-t0)/.08))*Math.exp(-(x-t0)/.3);const u=x-t0;if(u<.3)return-70+105*Math.sin(PI/2*u/.3);if(u<1.1)return 35-115*(u-.3)/.8;return-80+10*(1-Math.exp(-(u-1.1)/.5))}

/*BEGIN synkit*/
/* Labels in up to three rows: items [key,3D point,text,colour,'T'|'B'|'C',visible]. Laid out at draw time, left to right, so they never overlap (hidden items keep their slot). */
const lblRows=(c,s,items,Y={T:134,B:370,C:391},x0=40,x1=636)=>{const rows={T:[],B:[],C:[]};for(const it of items)rows[it[4]||'T'].push({it,Q:s.P(it[1])});
  s.hud(()=>{const k=window.PhysicaTextScale||1;c.save();c.font=`700 ${Math.round(11*k)}px system-ui, sans-serif`;
    for(const r of['T','B','C']){const a=rows[r].sort((m,n)=>m.Q[0]-n.Q[0]);for(const q of a)q.w=c.measureText(q.it[2]).width+4;
      let x=x0;for(const q of a){q.x=Math.max(x,q.Q[0]-q.w/2);x=q.x+q.w+8}for(let i=a.length-1;i>=0;i--){const lim=(a[i+1]?a[i+1].x-8:x1)-a[i].w;if(a[i].x>lim)a[i].x=lim}x=x0;for(const q of a){q.x=Math.max(x,q.x);x=q.x+q.w+8}
      for(const q of a){if(q.it[5]===false)continue;const y=Y[r],cl=q.it[3]||'#dbe7f0';c.strokeStyle=cl;c.globalAlpha=.85;c.lineWidth=1.2;c.beginPath();c.moveTo(q.Q[0],q.Q[1]);c.lineTo(q.x+q.w/2,y+(r==='T'?8:-8));c.stroke();c.globalAlpha=1;c.fillStyle=cl;c.beginPath();c.arc(q.Q[0],q.Q[1],2.4,0,6.2832);c.fill();s._label(q.x+q.w/2,y,q.it[2],cl,11,'center')}}
    c.restore()})};
/* Neuron model geometry (built once): soma with nucleus, dendritic tree, axon hillock and axon. */
let NEURON=null;
function buildNeuron(){const S0=[-4.7,0,0],den=[],A=(a,b)=>V.add(a,b);
  [[-.85,.55,.1],[-.9,-.35,.45],[-.7,-.7,-.3],[-.2,.95,-.2],[-.3,-.95,.3],[-.8,.15,-.6],[-.45,.7,.55]].forEach((d,i)=>{const n=V.norm(d),b=A(S0,V.mul(n,.52)),m=A(b,[n[0]*.7+(hash(i)-.5)*.2,n[1]*.7,n[2]*.7+(hash(i+3)-.5)*.2]);den.push([[b,V.add(b,V.mul(V.sub(m,b),.5)),m],.1,.06]);
    for(let j=0;j<2+(i%2);j++){const a=(j-.5)*1.1+hash(i*3+j)*.4,perp=V.norm(V.cross(n,[0,0,1])),dir=V.norm(A(V.mul(n,1.2),V.mul(Math.abs(perp[0])+Math.abs(perp[1])<.1?[1,0,0]:perp,a))),tip=A(m,V.mul(dir,.55+.25*hash(i+j)));den.push([[m,A(V.add(m,V.mul(V.sub(tip,m),.5)),[0,.05*(j%2?1:-1),.05]),tip],.05,.022]);
      if(j===0){const t2=A(tip,V.mul(V.norm(A(dir,[0,(j-.3)*.8,(i%2?.5:-.5)])),.35));den.push([[tip,t2],.025,.014])}}});
  return{S0,den}}
/*END synkit*/
add({...ch(18,'Neural Control and Coordination'),id:'bio-synapse',title:'Transmission across a chemical synapse',
 description:'An impulse arrives at the axon terminal: synaptic vesicles release neurotransmitter, which crosses the cleft and binds receptors.',
 formula:'Electrical signal → chemical (neurotransmitter) → electrical signal',
 observe:'Chemical synapses are slower than electrical synapses because the transmitter must diffuse across the cleft.',
 tryText:'Increase the impulse frequency. How does the number of release cycles per second change?',
 controls:[R('freq','Impulse frequency',1,10,1,3,'per s'),S('type','Synapse','chem',[['chem','Chemical (with cleft)'],['elec','Electrical (gap junction)']])],
 metrics:p=>p.type==='chem'?[N('Gap','Synaptic cleft'),N('Transmitter','e.g. acetylcholine'),N('Speed','Slower (diffusion step)'),N('Effect','Excitatory or inhibitory')]:[N('Gap','Very close membranes'),N('Transmitter','None — current flows directly'),N('Speed','Faster'),N('Occurrence','Rare in our system')],
/*BEGIN syndraw*/
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:38,cx:452,cy:256,pitch:-.2,yaw:.5}),chem=p.type==='chem',gap=chem?.5:.12,T=cycle(t*p.freq/3,1),N=NEURON||(NEURON=buildNeuron()),S0=N.S0,SK='#ffd8a8',bx=-gap/2-.55,X=-gap/2;
  /* soma, nucleus, dendritic tree */
  s.mesh(S0,[.62,.56,.56],SK,{alpha:.55,rings:8,segs:12});s.mesh(V.add(S0,[-.05,.02,.02]),.3,BC.nucleus,{rings:7,segs:10});s.ball(V.add(S0,[.03,.08,.22]),.09,BC.nucleolus,{lift:.4});
  for(const [pts,r0,r1] of N.den)s.tube(pts,u=>r0+(r1-r0)*u,SK,{segs:5});
  /* axon hillock and axon with myelin sheath segments separated by nodes of Ranvier */
  s.tube([[-4.2,0,0],[-4.0,0,0],[-3.8,0,0]],u=>.2-.13*u,SK,{segs:8});s.tube([[-3.8,0,0],[-1.85,0,0]],.07,'#f4b183',{segs:7});
  for(const x of[-3.45,-2.78,-2.11]){s.lathe([x,0,0],[[.09,-.3],[.16,-.28],[.2,-.23],[.2,.23],[.16,.28],[.09,.3]],'#fff0b8',{alpha:.78,rot:[0,0,PI/2],segs:10});s.ball([x,.12,.14],.05,'#d9b45a',{flat:true})}
  /* terminal branches ending in synaptic knobs */
  s.tube([[-1.85,0,0],[-1.7,.5,.15],[-1.5,1.0,.3]],.045,SK,{segs:5});s.mesh([-1.45,1.15,.32],[.26,.2,.2],SK,{alpha:.7,rings:6,segs:9});
  s.tube([[-1.85,0,0],[-1.7,-.5,-.15],[-1.45,-1.0,-.3]],.045,SK,{segs:5});s.mesh([-1.4,-1.12,-.3],[.24,.2,.2],SK,{alpha:.7,rings:6,segs:9});
  s.tube([[-1.85,0,0],[-1.5,0,0],[bx-.4,0,0]],.06,SK,{segs:6});
  /* axon terminal (pre-synaptic knob): membrane, mitochondrion, vesicles */
  s.mesh([bx,0,0],[.56,.62,.62],SK,{alpha:.55,rings:8,segs:12,shape:(u,v)=>1-.08*Math.max(0,Math.cos(v))*Math.cos(u)});s.mesh([bx-.18,-.28,.12],[.2,.09,.09],'#f08c3a',{alpha:.85,rings:5,segs:8});
  /* post-synaptic cell with its dense membrane and receptors */
  const px=gap/2+.9;s.mesh([px,0,0],[.9,1.7,1.5],'#9fd8e8',{alpha:.3,rings:9,segs:14});s.mesh([gap/2+.06,0,0],[.08,.7,.7],'#2bb6a3',{alpha:.5,rings:5,segs:9});s.mesh([px+.25,-.5,.15],[.3,.1,.1],'#f08c3a',{alpha:.8,rings:5,segs:8,rot:[0,0,.3]});s.mesh([px+.45,.55,-.2],[.28,.09,.09],'#f08c3a',{alpha:.8,rings:5,segs:8,rot:[0,0,-.4]});for(let i=0;i<10;i++)s.ball([px+.2+hash(i+50)*.5,(hash(i+60)-.5)*2.2,(hash(i+70)-.5)*1.6],.03,'#5b4a8a',{flat:true});
  if(chem){for(let i=0;i<8;i++){const home=[bx+(hash(i)-.5)*.6,(hash(i+3)-.5)*1.0,(hash(i+6)-.5)*.9],q=T>.3?Math.min(1,(T-.3)*3):0,pos=V.add(V.mul(home,1-q),V.mul([X-.1,home[1]*.8,home[2]*.8],q));s.ball(pos,.1,'#b197fc',{alpha:.7});s.ball(pos,.045,'#7048e8',{flat:true,lift:.3});
      if(T>.55){const k=(T-.55)/.45;for(let m=0;m<3;m++)s.ball([Math.min(X+gap*k*1.1,gap/2-.04),home[1]*.8+(hash(i*3+m)-.5)*.3,home[2]*.8+(hash(i*5+m)-.5)*.3],.035,'#7048e8',{flat:true})}}
    for(let i=0;i<8;i++){const y=-.7+i*.2,z=(hash(i)-.5)*1.0,on=T>.75;s.cyl([gap/2+.03,y,z],[1,0,0],.04,.1,on?'#63e6be':'#20c997',{seg:6});s.ball([gap/2-.03,y,z],.05,on?'#96f2d7':'#20c997',{flat:true})}
    if(T>.78)for(let i=0;i<4;i++)s.ball([gap/2+.15+((T-.78)*2.2+i*.12)%.5,-.5+i*.33,(hash(i+20)-.5)*.6],.035,'#ffd43b',{flat:true})}
  else for(let i=0;i<6;i++)s.cyl([0,-.6+i*.24,(hash(i)-.5)*.5],[1,0,0],.07,gap+.2,'#20c997',{seg:7});
  const imp=-3.9+T*3.7;if(imp<bx-.35)s.ball([imp,0,0],.14,'#ffd43b',{glow:true,flat:true});
  const rel=T>.55;lblRows(c,s,[['a',[-4.9,1.3,0],'dendrites','#ffd8a8','T'],['a',[-2.78,.2,.15],'myelin sheath','#fff0b8','T'],['a',[bx,.55,.1],'axon terminal (pre-synaptic knob)','#ffd8a8','T'],['a',[px,-1.3,.3],'post-synaptic membrane','#9fd8e8','B'],
    ['a',[-4.7,.5,.2],'soma (cell body)','#ffd8a8','T'],['a',[-4.78,.02,.0],'nucleus','#c9b6ff','B'],['a',[-3.14,-.2,0],'node of Ranvier','#f4b183','B'],
    ...(chem?[['a',[bx-.05,-.3,.3],'synaptic vesicles','#b197fc','B'],['a',[X/1+.25,-.9,.2],'synaptic cleft','#e9f6ff','C'],['a',[gap/2,.3,.5],'receptors','#20c997','C'],['a',[gap*.5,0,0],'neurotransmitter (e.g. acetylcholine)','#9775fa','C',rel]]:[['a',[0,-.7,.1],'gap junctions: ions flow directly','#20c997','C']])]);
  s.render();tag(c,chem?'purple: vesicles / neurotransmitter · teal: receptors':'teal: gap-junction channels',44,98,C.muted,13)},
/*END syndraw*/
 assumption:'Schematic synapse; Ca²⁺ entry and transmitter breakdown omitted.'});

add({...ch(18,'Neural Control and Coordination'),id:'bio-reflex-arc',title:'Reflex arc: the knee jerk',
 description:'Tap the patellar tendon. The impulse runs in through a sensory neuron and straight out through a motor neuron in the spinal cord.',
 formula:'Receptor → afferent neuron → spinal cord → efferent neuron → effector',
 observe:'The reflex happens involuntarily, without waiting for a decision from the brain.',
 tryText:'Tap harder. Does the kick get larger?',
 controls:[R('tap','Tap strength',0,100,1,60,'%')],
 metrics:(p,t)=>{const T=cycle(t,4),st=T<.5?'Tap on tendon':T<1.3?'Afferent (sensory) neuron to spinal cord':T<1.6?'Synapse in grey matter':T<2.4?'Efferent (motor) neuron to thigh muscle':'Muscle contracts — leg kicks';return[N('Stage',st),N('Afferent entry','Dorsal root of spinal nerve'),N('Efferent exit','Ventral root'),N('Effector','Quadriceps (thigh) muscle')]},
 draw:(c,p,t)=>{const T=cycle(t,4),s=P3.scene(c,{scale:46,cx:330,cy:262,yaw:.42,pitch:-.08}),kick=T>2.4?Math.sin(PI*Math.min(1,(T-2.4)/1.2))*.7*p.tap/100:0,sc=[-2.6,1.2,0],K=[1.8,.6,0],K0=K,SKIN='#e9b896',BONE='#efe6cf',TEND='#f3ead0',Av=(a,b)=>V.add(a,b),sn=Math.sin(kick),cs=Math.cos(kick),dd=[sn,-cs,0],nn=[cs,sn,0];
  if(!RFX){const drg=Av(sc,[.9,.45,.3]);RFX={THIGH:smooth3([[-.4,.6,0],[.2,.62,0],[.8,.62,0],K0],4),drg,aff:smooth3([[1.0,.82,.25],[.2,1.0,.3],[-1.0,1.5,.3],drg,Av(sc,[.5,.55,.2]),Av(sc,[.22,.32,.1]),Av(sc,[.25,-.2,.05])],4),eff:smooth3([Av(sc,[.25,-.25,-.05]),Av(sc,[.6,-.45,-.2]),Av(sc,[1.0,-.4,-.25]),[-1.2,.85,-.3],[0,.8,-.3],[.9,.82,-.22]],4)}}
  const {drg,aff,eff,THIGH}=RFX;
  /* spinal cord in cross-section (white matter shell, butterfly grey matter, central canal) with dorsal and ventral roots */
  s.mesh(sc,[.98,.78,.12],'#aab4bd',{rings:10,segs:28});s.mesh(Av(sc,[0,0,.03]),[.94,.74,.12],'#f1f3f5',{rings:10,segs:28});
  if(!RFX.bf){const H=[[0,.12],[.1,.16],[.15,.4],[.28,.64],[.35,.65],[.33,.42],[.38,.2],[.5,.08],[.57,-.08],[.53,-.3],[.4,-.47],[.24,-.5],[.14,-.36],[.1,-.16],[0,-.1]];RFX.bf=H.concat(H.slice(1,-1).reverse().map(q=>[-q[0],q[1]])).map(q=>[sc[0]+q[0],sc[1]+q[1],.13]);RFX.bf.push(RFX.bf[0])}
  s.poly(RFX.bf.slice(0,-1),'#8c959f',{cull:false,z:undefined,bias:2});s.path(RFX.bf,'#5c6670',1.5,[],-1e5+1);
  s.tube([Av(sc,[0,.06,.13]),Av(sc,[0,.06,.2])],.03,'#343a40',{segs:6});
  for(const [x,y] of[[.3,-.2],[.42,-.1],[.26,-.34]])s.ball(Av(sc,[x,y,.17]),.055,'#ff8787',{lift:2});
  /* neurons */
  s.tube(aff,.03,'#4dabf7',{segs:5});s.tube(eff,.03,'#ff6b6b',{segs:5});s.mesh(drg,[.17,.12,.12],'#ffd43b',{rings:7,segs:10});
  const syn=Av(sc,[.24,-.22,.05]);s.ball(syn,.06,'#e9ecef',{lift:3,glow:T>1.25&&T<1.75});
  /* thigh: skin shell, femur, quadriceps with fibre lines, tendon, patella, patellar ligament */
  const P=Av(K,[.27,.1,0]),Tub=Av(K,[dd[0]*.45+nn[0]*.24,dd[1]*.45+nn[1]*.24,0]),A=Av(K,V.mul(dd,1.6));
  s.tube(THIGH,u=>.4-.14*u+.03*Math.sin(Math.PI*u),SKIN,{alpha:.28,segs:14});s.tube([[-.3,.6,0],[K[0]-.08,K[1],0]],.07,BONE,{segs:8});s.ball(K,.14,BONE,{lift:-1});
  s.mesh([.75,.8,.02],[.98,.26,.3],'#c2414b',{rings:8,segs:14,spec:.4,shape:(u)=>.85+.15*Math.cos(u)});
  for(const [y,z] of[[.96,.06],[.88,.2],[.8,.24],[.94,-.12]])s.tube([[-.1,y,z],[.75,y+.03,z],[1.65,y-.02,z*.8]],.012,'#9b2c36',{segs:4});
  s.tube([[1.65,.86,0],P],.05,TEND,{segs:6});s.mesh(P,[.1,.15,.16],BONE,{rings:6,segs:10});s.tube([P,Tub],.05,T>.45&&T<.7?'#ffe066':TEND,{segs:6});
  /* lower leg: skin, tibia, foot (swings with the kick) */
  s.tube([0,.2,.4,.6,.8,1].map(u=>Av(K,V.mul(dd,1.6*u))),u=>.25-.13*u+.04*Math.sin(Math.PI*Math.min(1,u*1.6)),SKIN,{alpha:.45,segs:12});s.tube([K,A],.055,BONE,{segs:8});s.mesh(Av(A,[nn[0]*.28,nn[1]*.28-.04,0]),[.3,.07,.13],SKIN,{rot:[0,0,kick],rings:6,segs:10});
  /* reflex hammer (rubber head), withdrawn after the tap */
  const tp=V.mul(Av(P,Tub),.5),off=T<.5?.9*(1-T*2):T<1?(T-.5)*1.6:.8,hd=Av(tp,[.24+off,.05*off,0]);s.cyl(hd,[1,0,0],.1,.22,'#868e96',{seg:10});s.tube([Av(hd,[.12,0,0]),Av(hd,[.75,.7,0])],.03,'#495057',{segs:5});
  /* muscle spindle (receptor) and the two neurons' travelling impulses */
  capsule(s,[.8,.84,.25],[1.2,.82,.25],.035,'#74c0fc');
  const along=(path,q)=>{const i=Math.min(path.length-2,Math.floor(q*(path.length-1))),fr=q*(path.length-1)-i;return V.add(path[i],V.mul(V.sub(path[i+1],path[i]),fr))};
  if(T>.5&&T<1.3)s.ball(along(aff,(T-.5)/.8),.09,'#74c0fc',{glow:true,flat:true,lift:5});if(T>1.6&&T<2.4)s.ball(along(eff,(T-1.6)/.8),.09,'#ff8787',{glow:true,flat:true,lift:5});
  lblRows(c,s,[['a',drg,'dorsal root ganglion','#ffd43b','T'],['a',[-.6,1.28,.3],'sensory (afferent) neuron','#74c0fc','T'],['a',[1.0,.83,.25],'receptor: muscle spindle','#74c0fc','T'],
    ['a',Av(sc,[-.7,.45,.15]),'spinal cord: white matter','#f1f3f5','B'],['a',Av(sc,[-.3,-.3,.17]),'grey matter','#adb5bd','B'],['a',[-.3,.8,-.3],'motor (efferent) neuron','#ff8787','B'],['a',[.5,.7,.1],'effector: quadriceps muscle','#ff8787','B'],['a',tp,'tap on patellar tendon','#ced4da','C']],{T:150,B:372,C:394},40,640);
  s.render();tag(c,'blue: sensory (afferent)   red: motor (efferent)',44,98,C.muted,13)},
 assumption:'Monosynaptic stretch reflex, slowed down for viewing; real response takes a fraction of a second.'});

add({...ch(18,'Neural Control and Coordination'),id:'bio-myelinated-conduction',title:'Myelinated vs non-myelinated fibres',
 description:'Compare how fast impulses travel: continuously along a bare axon or jumping from node to node of Ranvier.',
 formula:'Saltatory conduction: impulse jumps between nodes of Ranvier',
 observe:'Myelinated fibres conduct impulses much faster than non-myelinated fibres of the same diameter.',
 tryText:'Double the axon diameter for both types and compare the speeds.',
 controls:[R('d','Axon diameter',1,20,.5,10,'μm',1)],
 metrics:p=>{const vm=6*p.d,vu=Math.sqrt(p.d);return[N('Myelinated speed',vm,'m/s',0),N('Non-myelinated speed',vu,'m/s',1),N('Time for 1 m (myelinated)',1000/vm,'ms',1),N('Time for 1 m (non-myelinated)',1000/vu,'ms',0)]},
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:52,pitch:.02,cx:345,cy:250}),vm=6*p.d,vu=Math.sqrt(p.d),r=.1+p.d*.012,ro=r*1.9+.06,Y1=.95,Y2=-.95,SK=(u,v)=>{const q=Math.cos(u)*Math.cos(v);return 1/Math.sqrt(Math.abs(q)**6+1-q*q)},
  mix=(a,b,k)=>{const A=[1,3,5].map(i=>parseInt(a.slice(i,i+2),16)),B=[1,3,5].map(i=>parseInt(b.slice(i,i+2),16));return'#'+A.map((v,i)=>Math.round(v+(B[i]-v)*k).toString(16).padStart(2,'0')).join('')},
  nodes=[-2,-1,0,1,2],xm=nodes[Math.min(4,Math.floor(cycle(t*vm/40,1)*5))],xu=-3.4+cycle(t*vu/12,1)*6.8;
  /* myelinated fibre: axon core, sheath segments with nodes of Ranvier between them */
  s.tube([[-3.4,Y1,0],[3.4,Y1,0]],r,u=>mix('#ffe0a8','#ffd43b',Math.max(0,1-Math.abs(-3.4+u*6.8-xm)*3)),{segs:10});
  for(let i=0;i<6;i++){const x=-2.5+i;s.mesh([x,Y1,0],[.43,ro,ro],'#f4eee0',{alpha:.88,rings:8,segs:12,spec:.5,shape:SK});s.mesh([x,Y1,0],[.4,ro*.78,ro*.78],'#e2d6bd',{alpha:.5,rings:6,segs:10,shape:SK})}
  s.mesh([-.5,Y1+ro*.85,.05],[.2,.12,.14],'#8e6bd8',{rings:6,segs:10,lift:2});
  for(const x of nodes)for(const sg of[-1,1])s.ball([x,Y1+sg*(r+.02),.1],.04,'#4dabf7',{flat:true});
  s.ball([xm,Y1,.1],r+.1,'#ffd43b',{glow:true,flat:true,lift:4});
  /* non-myelinated fibre: bare axon, depolarised region travels continuously */
  s.tube([[-3.4,Y2,0],[3.4,Y2,0]],r,u=>mix('#ffe0a8','#ffd43b',Math.max(0,1-Math.abs(-3.4+u*6.8-xu)*1.6)),{segs:10});s.tube([[-3.4,Y2,0],[3.4,Y2,0]],r*1.25,'#ffe8cc',{alpha:.25,segs:10});
  s.ball([xu,Y2,.1],r+.1,'#ffd43b',{glow:true,flat:true,lift:4});
  s.label([-2.6,Y1+ro+.55,0],'myelinated fibre',C.white,12);s.label([-2.4,Y2+.6,0],'non-myelinated fibre',C.white,12);
  s.callout([-1.5,Y1+ro*.8,0],'myelin sheath (Schwann cell)','#f1f3f5',-60,-35);s.callout([nodes[2],Y1-ro*.9,.1],'node of Ranvier: impulse jumps here','#ffd43b',70,45);s.callout([1.5,Y2,0],'axon: impulse travels continuously','#ffe8cc',30,28);s.callout([-.5,Y1+ro*.95,.1],'Schwann cell nucleus','#b79cf0',45,-50);s.render();tag(c,'animation speeds are relative, not real time',44,392,C.muted,12)},
 assumption:'Rule-of-thumb speeds: myelinated ≈ 6 m/s per μm of diameter; non-myelinated ≈ √d m/s (d in μm).'});

/* ---------- Chapter 19: Chemical Coordination and Integration ---------- */
add({...ch(19,'Chemical Coordination and Integration'),id:'bio-glucose-homeostasis',title:'Insulin, glucagon and blood glucose',
 description:'Eat a meal and watch insulin from β-cells bring blood glucose back down; glucagon from α-cells raises it when low.',
 formula:'Insulin: hypoglycaemic ;  glucagon: hyperglycaemic',
 observe:'In diabetes mellitus glucose stays high for long because insulin is lacking or ineffective.',
 tryText:'Compare the normal and diabetic curves after the same meal.',
 controls:[R('carb','Carbohydrate in meal',0,150,5,75,'g'),R('min','Time after meal',0,240,1,45,'min'),S('cond','Condition','normal',[['normal','Normal'],['dm','Diabetes mellitus']])],
 metrics:p=>{const g=gluc(p,p.min),i=insul(p,p.min);return[N('Blood glucose',g,'mg/dL',0),N('Insulin (relative)',i*100,'%',0),N('Glucagon',g<85?'Rising':'Low'),N('Liver','Glycogenesis when glucose is high')]},
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:56,cx:240,cy:255,pitch:.03}),ins=insul(p,p.min),g=gluc(p,p.min),C0=[-.2,.25,0];
  /* exocrine (acinar) tissue around the islet */
  for(let i=0;i<44;i++){const a=i*2.399,rr=1.3+.85*Math.sqrt(i/44),q=[C0[0]+rr*Math.cos(a)*1.2,C0[1]+rr*Math.sin(a)*.95,-.35];s.ball(q,.22,'#f2d3b0',{alpha:.7});s.ball([q[0]+.03,q[1],-.3],.07,'#b9926a',{flat:true})}
  /* islet: β-cells in the core, α-cells in the mantle; each cell has a nucleus */
  for(let i=0;i<40;i++){const core=i<28,k=core?i:i-28,y=core?1-2*(k+.5)/28:1-2*(k+.5)/12,rd=Math.sqrt(1-y*y),a=i*2.4,rr=core?.55:.92,q=[C0[0]+rr*rd*Math.cos(a)*1.1,C0[1]+rr*y*.9,rr*rd*Math.sin(a)*.6];
   s.ball(q,core?.21:.19,core?'#69db7c':'#ff8787',{spec:.4});s.ball([q[0]+.03,q[1]+.02,q[2]+.12],.07,core?'#2f9e44':'#c92a2a',{flat:true,lift:1})}
  /* capillary around the islet carrying hormones to liver and muscle */
  const cap=[[-2.3,-1.3,.1],[-1.4,-1.55,.1],[-.3,-1.45,.1],[.8,-1.1,.1],[1.8,-.6,.1],[2.7,-.5,.1]];s.tube(cap,.06,'#e8505b',{segs:8,alpha:.85});
  for(let i=0;i<5;i++){const q=cycle(t*.15+i/5,1)*5,j=Math.min(4,Math.floor(q)),f2=q-j;s.mesh([cap[j][0]+(cap[j+1][0]-cap[j][0])*f2,cap[j][1]+(cap[j+1][1]-cap[j][1])*f2,.1],[.07,.03,.07],'#9c1d2a',{rings:4,segs:8,rot:[PI/2,0,0]})}
  for(let i=0;i<Math.round(ins*14);i++){const q=cycle(t*.5+i/14,1),h=hash(i)*5,j=Math.min(4,Math.floor(h)),P=cap[j],st=[C0[0]+(hash(i+4)-.5)*.7,C0[1]-.2+(hash(i+9)-.5)*.6];s.ball([st[0]+(P[0]-st[0])*q,st[1]+(P[1]-st[1])*q,.15],.06,'#40c057',{flat:true,glow:true,lift:3})}
  if(g<95)for(let i=0;i<4;i++){const q=cycle(t*.5+i/4,1),P=cap[1+(i%3)],st=[C0[0]+.2*i-.3,C0[1]-.9];s.ball([st[0]+(P[0]-st[0])*q,st[1]+(P[1]-st[1])*q,.15],.055,'#ff6b6b',{flat:true,glow:true,lift:3})}
  s.callout([C0[0]-.35,C0[1]+.05,.35],'β-cells: insulin','#69db7c',-70,20);s.callout([C0[0]+.9,C0[1]-.3,.2],'α-cells: glucagon','#ff8787',75,-5);s.callout([C0[0]-.5,C0[1]+1.5,-.35],'islet of Langerhans','#e9f6ff',-40,-35);s.callout([cap[0][0]+.2,cap[0][1]-.1,.1],'blood capillary','#ff8787',-40,40);if(ins>.05)s.callout([cap[4][0],cap[4][1]-.1,.1],'insulin → liver, muscle','#69db7c',20,45);s.render();
  chart(c,420,96,236,170,{title:'Blood glucose (mg/dL)',xl:'minutes',xmin:0,xmax:240,ymin:60,ymax:420,series:[{fn:m=>gluc({...p,cond:'normal'},m),col:'#8ca6b9',dash:[4,4]},{fn:m=>gluc(p,m),col:C.gold}],marker:[p.min,g]});tag(c,'green: β-cells (insulin)   red: α-cells (glucagon)   tan: exocrine cells',44,392,C.muted,12)},
 assumption:'Illustrative response curves (fasting 90 mg/dL normal, 140 diabetic; the normal curve dips slightly below fasting about 2 hours after a meal, when glucagon rises); not a clinical model.'});
function gluc(p,m){const dm=p.cond==='dm',base=dm?140:90,tau=dm?95:32,A=p.carb*(dm?1.8:.6),dip=dm?0:10*Math.min(1,p.carb/75)*(m/110)*Math.exp(1-m/110);return base+A*(m/tau)*Math.exp(1-m/tau)-dip}
function insul(p,m){if(p.cond==='dm')return .15;const tau=40;return clamp(.1+.9*(p.carb/150)*(m/tau)*Math.exp(1-m/tau),0,1)}

const GL={hypo:['Hypothalamus','Releasing and inhibiting hormones (e.g. GnRH)',[0,2.55,0]],pit:['Pituitary','GH, PRL, TSH, ACTH, LH, FSH, MSH; oxytocin and vasopressin (posterior)',[.08,2.45,0]],pineal:['Pineal','Melatonin (day–night rhythm)',[-.12,2.6,0]],thyroid:['Thyroid','T₃, T₄ (metabolism), thyrocalcitonin',[.15,1.95,0]],para:['Parathyroid','Parathyroid hormone (raises blood Ca²⁺)',[.08,1.95,.15]],
  thymus:['Thymus','Thymosins (T-lymphocyte maturation)',[.15,1.65,0]],adrenal:['Adrenal','Cortex: cortisol, aldosterone; medulla: adrenaline, noradrenaline',[-.1,.85,.3]],pancreas:['Pancreas (islets)','Insulin and glucagon',[.05,.75,-.1]],gonads:['Testis / ovary','Androgens / oestrogen, progesterone',[.05,.1,.15]]};
add({...ch(19,'Chemical Coordination and Integration'),id:'bio-endocrine-glands',title:'Map of endocrine glands',
 description:'Locate the endocrine glands in the body and see the main hormones each secretes.',
 formula:'Hormones: non-nutrient chemicals acting as intercellular messengers in trace amounts',
 observe:'The hypothalamus and pituitary link the nervous and endocrine systems.',
 tryText:'Which gland sits on top of each kidney, and what does its medulla secrete?',
 controls:[S('g','Gland','thyroid',Object.keys(GL).map(k=>[k,GL[k][0]]))],
 metrics:p=>{const d=GL[p.g];return[N('Gland',d[0]),N('Main hormones',d[1])]},
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:46,cx:190,cy:268,pitch:.02}),on=k=>k===p.g,col=(k,a)=>on(k)?'#ffd43b':a,SK='#fbe6d6';
  const L=(k,q,dx,dy)=>s.callout(q,GL[k][0],on(k)?'#ffd43b':'#cfdde8',dx,dy,on(k)?13:10),HL=(k,q,r)=>{if(on(k))s.ball(q,r*.55,'#ffd43b',{glow:true,flat:true,lift:6})};
  /* body outline: head, neck, torso, arms (translucent so the glands show through) */
  s.mesh([0,2.7,0],[.5,.62,.4],SK,{alpha:.4,rings:12,segs:18});s.tube([[0,2.2,0],[0,1.85,0]],.17,SK,{alpha:.3,segs:10});
  s.mesh([0,.35,0],[1.2,1.75,.5],SK,{alpha:.26,rings:14,segs:22,shape:(u,v)=>{const q=Math.cos(u)*Math.cos(v),n=Math.sin(u);return(1/Math.pow(Math.abs(q)**4+Math.abs(n)**4+.0001,.25)*.88)*(1-.1*Math.exp(-(((n+.1)*2.2)**2))*Math.abs(q))}});
  for(const z of[-1,1]){s.tube([[z*1.1,1.5,0],[z*1.45,.7,0],[z*1.55,-.3,0]],.17,SK,{alpha:.26,segs:8})}
  /* inset: sagittal section of the brain with the three glands of the head */
  const B=[3.05,2.3,0];s.mesh(B,[1.0,.75,.1],'#f1b6bd',{rings:14,segs:26,spec:.4,shape:(u,v)=>1+.04*Math.sin(9*v+3*u)});s.mesh([B[0]+.55,B[1]-.6,0],[.38,.25,.1],'#d98c9a',{rings:8,segs:14});s.tube([[B[0]+.02,B[1]-.3,0],[B[0]+.12,B[1]-.7,0],[B[0]+.2,B[1]-1.0,0]],.1,'#e7a6b0',{segs:8});
  s.seg([.45,3.0,0],[2.15,2.95,0],'#8ca6b9',1,[3,3]);s.seg([.45,2.4,0],[2.2,1.65,0],'#8ca6b9',1,[3,3]);
  const hy=[B[0]-.15,B[1]-.2,.1],pi=[B[0]-.1,B[1]-.62,.1],pn=[B[0]+.35,B[1]-.02,.1];
  s.mesh(hy,[.17,.12,.1],col('hypo','#9775fa'),{rings:8,segs:12,lift:2});s.tube([[hy[0],hy[1]-.1,.1],[pi[0],pi[1]+.1,.1]],.03,col('pit','#b197fc'),{segs:6});s.mesh([pi[0]-.04,pi[1],.1],[.1,.1,.09],col('pit','#e599f7'),{rings:7,segs:10});s.mesh([pi[0]+.08,pi[1],.1],[.1,.1,.09],col('pit','#9c36b5'),{rings:7,segs:10});s.mesh(pn,[.09,.07,.07],col('pineal','#38d9a9'),{rings:7,segs:10,lift:2});
  HL('hypo',hy,.3);HL('pit',pi,.3);HL('pineal',pn,.22);L('hypo',hy,-70,-35);L('pit',pi,75,45);L('pineal',pn,55,-45);
  /* neck and chest: thyroid with parathyroids, thymus, (heart for context) */
  const th=[0,1.95,.2];for(const z of[-1,1]){s.mesh([z*.15,1.95,.2],[.12,.22,.09],col('thyroid','#e8a548'),{rings:8,segs:12,rot:[0,0,z*.25]});s.ball([z*.24,2.05,.28],.035,col('para','#7cc97a'),{flat:true,lift:3});s.ball([z*.24,1.84,.28],.035,col('para','#7cc97a'),{flat:true,lift:3})}s.tube([[-.12,1.9,.2],[.12,1.9,.2]],.05,col('thyroid','#e8a548'),{segs:6});
  HL('thyroid',th,.35);HL('para',[.24,1.95,.3],.28);L('thyroid',[-.2,1.95,.2],-95,-5);L('para',[.26,2.05,.3],45,30);
  s.mesh([.0,1.35,.05],[.1,.1,.1],'#c0392b',{alpha:0,rings:3,segs:4});for(const z of[-1,1])s.mesh([z*.17,1.5,.1],[.19,.3,.1],col('thymus','#f5d9a0'),{rings:8,segs:12,rot:[0,0,z*-.15]});s.mesh([.12,.95,0],[.32,.36,.22],'#9b2c3a',{alpha:.45,rings:8,segs:12});HL('thymus',[0,1.5,.1],.4);L('thymus',[.25,1.55,.1],95,10);
  /* kidneys with the adrenal caps, pancreas, ovaries */
  for(const z of[-1,1]){s.mesh([z*.6,.1,-.05],[.2,.34,.14],'#a8454f',{alpha:.7,rings:8,segs:12});s.mesh([z*.58,.5,-.02],[.2,.1,.1],col('adrenal','#e8c05a'),{rings:6,segs:10,rot:[0,0,z*.4],lift:2})}
  HL('adrenal',[-.58,.5,0],.3);L('adrenal',[-.62,.52,0],-80,-20);
  s.tube([[.5,.15,.08],[.15,.3,.08],[-.2,.38,.08],[-.55,.5,.08]],u=>.09*(1.1-.5*u),col('pancreas','#f3c36b'),{segs:8});HL('pancreas',[0,.33,.1],.4);L('pancreas',[.4,.2,.1],80,35);
  for(const z of[-1,1]){s.mesh([z*.5,-.85,.05],[.12,.08,.07],col('gonads','#f783ac'),{rings:6,segs:10,lift:2})}HL('gonads',[.5,-.85,.1],.25);L('gonads',[.55,-.88,.1],80,25);
  s.render();tag(c,'highlighted gland: '+GL[p.g][0]+'   (ovaries shown; testes lie in the scrotum)',44,392,C.muted,12)},
 assumption:'Gland positions approximate; hormone lists from NCERT Chapter 19.'});

add({...ch(19,'Chemical Coordination and Integration'),id:'bio-thyroid-feedback',title:'Thyroid feedback and iodine',
 description:'Reduce dietary iodine. Less thyroid hormone is made, TSH rises by negative feedback and the thyroid enlarges (goitre).',
 formula:'Hypothalamus (TRH) → pituitary (TSH) → thyroid (T₃, T₄) ⟲ negative feedback',
 observe:'Iodine deficiency causes hypothyroidism and enlargement of the thyroid gland (goitre).',
 tryText:'Lower iodine intake below 50 μg/day. What happens to TSH and gland size?',
 controls:[R('iod','Iodine intake',10,300,5,150,'μg/day')],
 metrics:p=>{const r=thy(p);return[N('Thyroid hormone (T₄) level',r.t4*100,'% of normal',0),N('TSH level',r.tsh*100,'% of normal',0),N('Thyroid size',r.size,'× normal',2),N('Condition',r.t4<.75?'Hypothyroidism, goitre risk':'Normal')]},
 draw:(c,p,t)=>{const r=thy(p),s=P3.scene(c,{scale:62,cx:240});s.tube([[0,-1.6,0],[0,.6,0]],.6,'#ffd8c2',{alpha:.3});for(const z of[-1,1])s.mesh([.45,-.4,z*.32*r.size],[.18*r.size,.42*r.size,.2*r.size],'#e64980');s.tube([[.5,-.5,-.3],[.55,-.55,0],[.5,-.5,.3]],.08*r.size,'#e64980');
  for(let i=0;i<9;i++)s.cyl([.15,-1.4+i*.22,0],[0,1,0],.2,.08,'#dee2e6');s.cyl([.15,-.4,0],[0,1,0],.18,2.1,'#adb5bd',{alpha:.5});s.mesh([0,1.6,0],.18,'#b197fc');s.mesh([.1,1.3,0],.12,'#748ffc');s.callout([0,1.65,0],'hypothalamus (TRH)','#c9b6ff',60,-30);s.callout([.1,1.3,0],'anterior pituitary (TSH)','#91a7ff',70,10);s.callout([.5,-.4,.32*r.size],r.size>1.2?'enlarged thyroid (goitre)':'thyroid gland (T₃, T₄)','#e64980',70,40);s.callout([.15,-1.2,.2],'trachea','#dee2e6',-60,30);for(let i=0;i<Math.round(r.tsh*5);i++){const q=cycle(t*.6+i/5,1);s.ball([.2,1.2-q*1.5,.1],.05,'#748ffc',{flat:true,glow:true})}for(let i=0;i<Math.round(r.t4*5);i++){const q=cycle(t*.5+i/5,1);s.ball([-.2,-.3+q*1.5,-.1],.05,'#ffd43b',{flat:true})}s.render();tag(c,'blue: TSH down · yellow: T₄ up (feedback)',44,98,C.muted,13)},
 assumption:'Toy steady-state model (T₄ ∝ √(iodine supply), TSH ∝ 1/T₄); adult requirement taken as ~150 μg/day.'});
function thy(p){const i=Math.min(1,p.iod/150),t4=Math.sqrt(i),tsh=1/t4;return{t4,tsh,size:1+Math.max(0,tsh-1)*.6}}

done();
})();
