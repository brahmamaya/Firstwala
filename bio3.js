/* Biology pack 3 — NCERT Class 11, chapters 14–19: human physiology (21 experiments).
   Values follow the rationalised NCERT text; physiological curves are standard teaching models. */
(() => {
'use strict';
const {R,S,N,f,clamp,rad,deg,cycle,tag,chart,pack,PI,TAU,C}=window.PhysicaLab;
const P3=window.Physica3D,V=P3.vec,{BC,hash,critter,cell,capsule}=window.PhysicaBio,{add,done}=pack();
const U5='HUMAN PHYSIOLOGY';
const ch=(no,chapter)=>({grade:11,chapterNo:no,chapter,group:U5});
// Translucent human body for locating organs.
function body(s,p,k=1,alpha=.14){const A=(x,y,z)=>V.add(p,[x*k,y*k,z*k]),col='#ffd8c2';s.mesh(A(0,2.35,0),[.32*k,.4*k,.34*k],col,{alpha});s.mesh(A(0,1.25,0),[.55*k,.85*k,.32*k],col,{alpha});s.tube([A(0,1.85,0),A(0,2.05,0)],.13*k,col,{alpha});
  for(const z of[-1,1]){s.tube([A(0,1.95,z*.6),A(0,1.3,z*.75),A(0,.65,z*.8)],.11*k,col,{alpha,segs:8});s.tube([A(0,.45,z*.22),A(0,-.4,z*.24),A(0,-1.25,z*.25)],.15*k,col,{alpha,segs:8})}}
const lungPair=(s,c0,k,col='#ff8fab',alpha)=>{for(const z of[-1,1])s.mesh(V.add(c0,[0,0,z*.42*k]),[.38*k,.62*k,.3*k],col,{alpha,shape:(u,v)=>1-.12*Math.max(0,Math.sin(v)*z)-.2*Math.max(0,Math.sin(u))*Math.max(0,-Math.sin(v)*z)})};

/* ---------- Chapter 14: Breathing and Exchange of Gases ---------- */
add({...ch(14,'Breathing and Exchange of Gases'),id:'bio-lung-volumes',title:'Spirometer: lung volumes and capacities',
 description:'Breathe normally, then take a maximum breath in and out. Read the volumes and capacities from the spirogram.',
 formula:'VC = ERV + TV + IRV ;  TLC = VC + RV ;  minute volume = TV × rate',
 observe:'Even after a forcible expiration, the residual volume of air remains in the lungs.',
 tryText:'Increase the breathing rate to 16 per minute. What is the minute volume?',
 controls:[R('TV','Tidal volume TV',300,800,10,500,'mL'),R('IRV','Inspiratory reserve IRV',2000,3500,50,2750,'mL'),R('ERV','Expiratory reserve ERV',800,1300,10,1050,'mL'),R('RV','Residual volume RV',900,1400,10,1150,'mL'),R('rate','Breaths per minute',8,24,1,12)],
 metrics:p=>[N('Vital capacity',p.ERV+p.TV+p.IRV,'mL',0),N('Total lung capacity',p.ERV+p.TV+p.IRV+p.RV,'mL',0),N('Inspiratory capacity',p.TV+p.IRV,'mL',0),N('Functional residual capacity',p.ERV+p.RV,'mL',0),N('Minute volume',p.TV*p.rate,'mL/min',0)],
 draw:(c,p,t)=>{const vol=x=>{const per=60/p.rate,k=cycle(x,per*6),n=Math.floor(k/per),q=(k%per)/per;if(n===3)return p.RV+p.ERV+p.TV*.5+(p.IRV+p.TV*.5)*Math.sin(PI*q);if(n===4)return p.RV+p.ERV+p.TV*.5-(p.ERV+p.TV*.5)*Math.sin(PI*q);return p.RV+p.ERV+p.TV*(.5-.5*Math.cos(TAU*q))},v=vol(t),tlc=p.ERV+p.TV+p.IRV+p.RV;
  const s=P3.scene(c,{scale:56,cx:220,cy:270}),k=.75+.45*(v-p.RV)/(tlc-p.RV);s.tube([[0,1.6,0],[0,.8,0]],.1,'#e9ecef',{segs:10});for(const z of[-1,1])s.tube([[0,.8,0],[0,.55,z*.3]],.07,'#e9ecef',{segs:8});lungPair(s,[0,0,0],k);s.render();
  const per=60/p.rate;chart(c,400,96,256,190,{title:'Spirogram',xl:'time',xmin:0,xmax:per*6,ymin:0,ymax:tlc*1.05,series:[{fn:vol,col:C.mint},{fn:()=>p.RV,col:'#ff8787',dash:[4,4]},{fn:()=>tlc,col:'#8ca6b9',dash:[4,4]}],marker:[cycle(t,per*6),v]});tag(c,'red dashed: RV   grey dashed: TLC',412,276,C.muted,11)},
 assumption:'Typical adult values from NCERT; one maximal inspiration and expiration are inserted after three quiet breaths.'});

add({...ch(14,'Breathing and Exchange of Gases'),id:'bio-breathing-mechanism',title:'Mechanism of breathing (bell-jar model)',
 description:'Pull the rubber diaphragm down: the volume of the jar increases, pressure falls and the balloons (lungs) inflate.',
 formula:'Boyle’s law: P ∝ 1/V at constant temperature',
 observe:'Inspiration happens when intra-pulmonary pressure falls below atmospheric pressure.',
 tryText:'Pull the diaphragm further. How does the pressure change?',
 controls:[R('pull','Diaphragm pulled down',0,100,1,0,'%'),S('auto','Breathe automatically','yes',[['yes','Yes'],['no','No — use the slider']])],
 metrics:(p,t)=>{const d=p.auto==='yes'?50+50*Math.sin(t*1.2):p.pull,dP=-d/100*3;return[N('Phase',p.auto==='yes'?(Math.cos(t*1.2)>0?'Inspiration':'Expiration'):d>0?'Inspiration (held)':'Rest'),N('Pressure inside vs atmosphere',dP,'mm Hg',1),N('Diaphragm','Contracts and flattens during inspiration'),N('External intercostals','Lift ribs and sternum')]},
 draw:(c,p,t)=>{const d=(p.auto==='yes'?50+50*Math.sin(t*1.2):p.pull)/100,s=P3.scene(c,{scale:58,cy:280,cx:250});s.lathe([0,-1.4,0],[[1.3,0],[1.35,1.6],[1.0,2.4],[.3,2.8],[.2,3.1]],'#e9f6ff',{alpha:.12});s.tube([[0,1.75,0],[0,1.1,0]],.07,'#ced4da',{segs:8});for(const z of[-1,1])s.tube([[0,1.1,0],[0,.8,z*.35]],.05,'#ced4da',{segs:6});
  lungPair(s,[0,.3,0],.7+.45*d);const sag=-.2-.7*d;s.lathe([0,-1.4,0],[[0,sag],[.6,sag*.75],[1.0,sag*.35],[1.3,0]],'#ff8787',{alpha:.85});s.tube([[0,-1.4+sag,0],[0,-2.2,0]],.05,'#495057',{segs:6});s.ball([0,-2.25,0],.12,'#495057');
  for(let i=0;i<3;i++){const q=cycle(t*1.2/TAU*2+i/3,1),dir=p.auto==='yes'?Math.cos(t*1.2):d>0?1:0;if(dir>0)s.ball([0,2.6-q*1.2,0],.06,'#74c0fc',{flat:true})}s.render()},
 assumption:'Classroom bell-jar analogy; pressure difference values are illustrative (a few mm Hg).'});

const PP={alveoli:[104,40],deoxy:[40,45],oxy:[95,40],tissue:[40,45],air:[159,.3]};
add({...ch(14,'Breathing and Exchange of Gases'),id:'bio-gas-exchange',title:'Exchange of gases: partial pressures',
 description:'Follow blood along a pulmonary or tissue capillary and watch O₂ and CO₂ diffuse down their partial-pressure gradients.',
 formula:'Diffusion rate ∝ partial-pressure gradient',
 observe:'In the lungs O₂ moves from alveoli (104 mm Hg) into blood (40); CO₂ moves from blood (45) into alveoli (40).',
 tryText:'Switch to tissues: in which direction does each gas move now?',
 controls:[S('site','Site','lungs',[['lungs','Alveolus (lungs)'],['tissue','Body tissue']]),R('x','Position along capillary',0,100,1,30,'%')],
 metrics:p=>{const k=1-Math.exp(-p.x/18);let o2,co2;if(p.site==='lungs'){o2=40+(95-40)*k;co2=45-(45-40)*k}else{o2=95-(95-40)*k;co2=40+(45-40)*k}return[N('pO₂ in blood',o2,'mm Hg',0),N('pCO₂ in blood',co2,'mm Hg',0),N(p.site==='lungs'?'Alveolar air':'Tissue',p.site==='lungs'?'pO₂ 104, pCO₂ 40':'pO₂ 40, pCO₂ 45'),N('Diffusion membrane','3 thin layers, ≪ 1 mm')]},
 draw:(c,p,t)=>{const lung=p.site==='lungs',s=P3.scene(c,{scale:58,pitch:.3});if(lung)s.mesh([0,1,0],[1.8,1.1,1.2],'#ffc9c9',{alpha:.3});else for(let i=0;i<10;i++)s.mesh([-2.5+i*.55,1.1,(hash(i)-.5)*.6],.32,'#ffc9c9',{alpha:.5});
  const pts=Array.from({length:30},(_,i)=>[-3.4+i*.235,-.1+.12*Math.sin(i*.5),0]);s.tube(pts,.32,(u)=>{const k=1-Math.exp(-u*100/18),r=lung?k:1-k;return r>.5?'#e03131':'#7048e8'},{alpha:.75,segs:12});
  for(let i=0;i<10;i++){const q=cycle(t*.25+i/10,1),x=-3.4+q*6.8;s.mesh([x,-.1,0],[.16,.06,.16],'#c92a2a',{rot:[PI/2,0,0],rings:6,segs:10})}
  for(let i=0;i<6;i++){const q=cycle(t*.7+i/6,1),x=-2.8+i;s.ball([x,lung?.9-q*.9:-.1+q*.9,.3],.06,'#4dabf7',{flat:true});s.ball([x+.4,lung?-.1+q*.9:.9-q*.9,-.3],.06,'#adb5bd',{flat:true})}
  const xp=-3.4+p.x/100*6.8;s.cyl([xp,-.1,0],[1,0,0],.36,.04,'#ffd43b',{alpha:.6});s.render();tag(c,'blue: O₂   grey: CO₂   yellow ring: probe',44,98,C.muted,13)},
 assumption:'Partial pressures from NCERT Table 14.1; equilibration along the capillary modelled as exponential.'});

add({...ch(14,'Breathing and Exchange of Gases'),id:'bio-oxygen-dissociation',title:'Oxygen–haemoglobin dissociation curve',
 description:'See how the % saturation of haemoglobin depends on pO₂, and how CO₂, acidity and temperature shift the curve.',
 formula:'Sigmoid curve ;  high pCO₂, H⁺ or temperature → shift right (O₂ released)',
 observe:'In tissues (low pO₂, high pCO₂, high H⁺, higher temperature) oxyhaemoglobin dissociates and releases O₂.',
 tryText:'Raise pCO₂ and temperature together. What happens to saturation at 40 mm Hg?',
 controls:[R('pO2','pO₂',0,120,1,40,'mm Hg'),R('pCO2','pCO₂',20,70,1,40,'mm Hg'),R('T','Temperature',34,42,.1,37,'°C',1),R('pH','pH',7.0,7.7,.01,7.4,'',2)],
 metrics:p=>{const S0=sat({pO2:p.pO2,pCO2:40,T:37,pH:7.4}),S1=sat(p);return[N('Saturation now',S1*100,'%',0),N('Normal at this pO₂',S0*100,'%',0),N('P50 (half saturation)',p50(p),'mm Hg',1),N('O₂ delivered','≈ 5 mL per 100 mL blood (rest)')]},
 draw:(c,p,t)=>{const S1=sat(p),s=P3.scene(c,{scale:58,cx:220});const sub=[[-.45,.45,.3],[.45,.45,-.3],[-.45,-.45,-.3],[.45,-.45,.3]];sub.forEach((q,i)=>{s.mesh(q,[.45,.42,.4],i<2?'#ff8787':'#e03131',{shape:(u,v)=>1+.08*Math.sin(3*v+i)});const filled=i<Math.round(S1*4+.01);s.ball(V.add(q,[0,0,.42*Math.sign(q[2]||1)]),.12,filled?'#ff2b2b':'#5f3dc4',{glow:filled,lift:3})});s.render();
  chart(c,400,96,256,190,{title:'% saturation vs pO₂',xl:'pO₂ (mm Hg)',xmin:0,xmax:120,ymin:0,ymax:1.02,series:[{fn:x=>sat({pO2:x,pCO2:40,T:37,pH:7.4}),col:'#8ca6b9',dash:[4,4]},{fn:x=>sat({...p,pO2:x}),col:C.red}],marker:[p.pO2,S1]});tag(c,'haem sites filled: '+Math.round(S1*4)+' of 4',44,98,C.gold,14)},
 assumption:'Hill equation (n = 2.7, normal P50 = 26.8 mm Hg) with illustrative Bohr and temperature shifts. Dashed: normal curve.'});
function p50(p){return 26.8*Math.pow(10,.48*(7.4-p.pH))*Math.exp(.024*(p.T-37))*(1+.004*(p.pCO2-40))}
function sat(p){const P=p50(p),n=2.7;return p.pO2<=0?0:p.pO2**n/(P**n+p.pO2**n)}

/* ---------- Chapter 15: Body Fluids and Circulation ---------- */
add({...ch(15,'Body Fluids and Circulation'),id:'bio-cardiac-cycle',title:'The cardiac cycle',
 description:'Watch the heart’s chambers contract and relax in sequence and hear when the valves close (lub, dub).',
 formula:'Cardiac output = stroke volume × heart rate ≈ 70 mL × 72 = ~5 L/min',
 observe:'At 72 beats per minute one cycle lasts 0.8 s: atrial systole 0.1 s, ventricular systole 0.3 s, joint diastole 0.4 s.',
 tryText:'Raise the heart rate. Which phase gets shorter?',
 controls:[R('hr','Heart rate',50,180,1,72,'beats/min'),R('sv','Stroke volume',50,120,1,70,'mL')],
 metrics:(p,t)=>{const r=heartPhase(p,t);return[N('Cycle duration',60/p.hr,'s',2),N('Phase now',r.name),N('Valves',r.valves),N('Cardiac output',p.sv*p.hr/1000,'L/min',2)]},
 draw:(c,p,t)=>{const r=heartPhase(p,t),s=P3.scene(c,{scale:66,cy:270}),aS=r.atria,vS=r.vent;
  for(const z of[-1,1]){s.mesh([.0,.55,z*.42],[.42*(1-.18*aS),.38*(1-.18*aS),.38*(1-.18*aS)],z<0?'#c2255c':'#e64980');s.mesh([0,-.35,z*.38],[.55*(1-.2*vS),.75*(1-.12*vS),.45*(1-.2*vS)],z<0?'#a61e4d':'#d6336c',{shape:(u,v)=>1-.25*Math.max(0,-Math.sin(u))})}
  s.tube([[0,.4,.2],[0,1.3,.25],[0,1.5,-.4],[0,.9,-.9]],.16,'#e03131',{segs:10});s.tube([[.1,.3,-.25],[.1,1.1,-.15],[.1,1.25,.5]],.14,'#4263eb',{segs:10});s.label([0,1.7,-.2],'aorta',C.red,12);s.label([.1,1.45,.6],'pulmonary artery',C.blue,12);
  if(r.sound)s.label([0,-1.4,0],r.sound,C.gold,20);s.render();
  const T=60/p.hr;chart(c,430,300,226,100,{title:'Phase timeline (one cycle)',xmin:0,xmax:T,ymin:0,ymax:1,series:[{pts:[[0,.8],[.1,.8],[.1,0],[T,0]],col:'#e64980'},{pts:[[0,0],[.1,0],[.1,.5],[.4,.5],[.4,0],[T,0]],col:'#a61e4d'}],marker:[cycle(t,T),.95,'#ffd43b']})},
 assumption:'Atrial systole 0.1 s and ventricular systole 0.3 s kept fixed; diastole shortens as heart rate rises.'});
function heartPhase(p,t){const T=60/p.hr,q=cycle(t,T),k=x=>Math.sin(PI*clamp(x,0,1));if(q<.1)return{name:'Atrial systole',valves:'AV valves open; semilunar closed',atria:k(q/.1),vent:0};if(q<.4)return{name:'Ventricular systole',valves:'AV valves closed (lub); semilunar open',atria:0,vent:k((q-.1)/.3),sound:q<.16?'LUB':''};return{name:'Joint diastole',valves:'Semilunar closed (dub); AV open',atria:0,vent:0,sound:q<.46?'DUB':''}}

add({...ch(15,'Body Fluids and Circulation'),id:'bio-ecg',title:'Electrocardiogram (ECG)',
 description:'Read an ECG trace: P wave, QRS complex and T wave. Count QRS complexes to find the heart rate.',
 formula:'Heart rate = 60 / (R–R interval in s)',
 observe:'P: atrial depolarisation; QRS: ventricular depolarisation (start of contraction); T: ventricular repolarisation.',
 tryText:'Raise the heart rate and measure the shorter R–R interval.',
 controls:[R('hr','Heart rate',40,180,1,72,'beats/min'),S('hl','Highlight wave','qrs',[['p','P wave'],['qrs','QRS complex'],['t','T wave']])],
 metrics:p=>[N('R–R interval',60/p.hr,'s',2),N('Heart rate',p.hr,'beats/min',0),N('Highlighted',{p:'P: atrial depolarisation',qrs:'QRS: ventricular depolarisation',t:'T: ventricular repolarisation'}[p.hl])],
 draw:(c,p,t)=>{const T=60/p.hr,ecg=x=>{const q=cycle(x,T)/T*.8,g=(m,w,a)=>a*Math.exp(-(((q-m)/w)**2));return g(.08,.025,.15)-g(.17,.008,.12)+g(.19,.01,1)-g(.21,.008,.25)+g(.42,.04,.3)},s=P3.scene(c,{scale:58,pitch:.15});
  s.box([0,0,-.4],[6.4,3,.3],'#212529');s.box([0,0,-.24],[6,2.6,.05],'#0b3d2e');const pts=[];for(let i=0;i<=240;i++){const x=t-3+3*i/240;pts.push([-2.9+5.8*i/240,-.6+ecg(x)*1.6,-.2])}s.path(pts,'#69db7c',2.5,[],1e5);
  const hl={p:[.08,.15],qrs:[.19,1],t:[.42,.3]}[p.hl];s.label([2.6,1.1,-.2],`${p.hr} bpm`,C.mint,15);s.render();tag(c,{p:'P',qrs:'QRS',t:'T'}[p.hl]+' wave highlighted (see readouts)',44,98,C.gold,14)},
 assumption:'Synthetic ECG built from Gaussian waves (lead II shape); not for clinical interpretation.'});

const ABO={A:[['A'],['anti-B']],B:[['B'],['anti-A']],AB:[['A','B'],[]],O:[[],['anti-A','anti-B']]};
add({...ch(15,'Body Fluids and Circulation'),id:'bio-blood-groups',title:'Blood groups and transfusion',
 description:'Pick a donor and a recipient. See the antigens on donor red cells and the antibodies in the recipient’s plasma.',
 formula:'Transfusion fails if recipient antibodies match donor antigens',
 observe:'Group O is the universal donor and group AB the universal recipient (ABO system).',
 tryText:'Give Rh-positive blood to an Rh-negative recipient. What does NCERT warn about?',
 controls:[S('d','Donor','O-',['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(x=>[x,x])),S('r','Recipient','A+',['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(x=>[x,x]))],
 metrics:p=>{const r=compat(p);return[N('Compatible?',r.ok?'Yes':'No — agglutination risk'),N('Donor RBC antigens',r.ag.join(', ')||'None (A/B)'),N('Recipient plasma antibodies',r.ab.join(', ')||'None'),N('Rh',r.rh)]},
 draw:(c,p,t)=>{const r=compat(p),s=P3.scene(c,{scale:58});for(let i=0;i<9;i++){const home=[-2.4+(i%3)*.6,-.8+Math.floor(i/3)*.8,(hash(i)-.5)*.6],clump=[(i%3)*.3-.3,(Math.floor(i/3)-1)*.3,(hash(i)-.5)*.3],k=r.ok?0:Math.min(1,cycle(t,6)/3),q=V.add(V.mul(home,1-k),V.mul(V.add(clump,[1.2,0,0]),k));
   s.mesh(q,[.28,.1,.28],'#c92a2a',{rot:[PI/2*.8,i,0],rings:8,segs:14,shape:(u)=>1-.2*Math.exp(-(u*u)*5)});r.ag.forEach((a,j)=>{for(let m=0;m<3;m++){const an=TAU*(m/3+j/6);s.ball(V.add(q,[.3*Math.cos(an),.05,.3*Math.sin(an)]),.05,a==='A'?'#ffd43b':a==='B'?'#4dabf7':'#69db7c',{flat:true})}})}
  r.ab.forEach((a,j)=>{for(let m=0;m<5;m++){const q=[1.4+(hash(m+j*5)-.5)*2,(hash(m+j*5+3)-.5)*2,(hash(m+j*9)-.5)];s.tube([q,V.add(q,[0,.18,0]),V.add(q,[-.1,.3,0])],.025,a==='anti-A'?'#fab005':'#1c7ed6',{segs:4});s.tube([V.add(q,[0,.18,0]),V.add(q,[.1,.3,0])],.025,a==='anti-A'?'#fab005':'#1c7ed6',{segs:4})}});s.render();
  tag(c,r.ok?'No clumping':'Clumping (agglutination)',44,98,r.ok?C.mint:C.red,15)},
 assumption:'ABO and Rh only; real cross-matching also checks other antigens. Y-shapes are antibodies.'});
function compat(p){const [dg,dr]=[p.d.slice(0,-1),p.d.slice(-1)],[rg,rr]=[p.r.slice(0,-1),p.r.slice(-1)],ag=ABO[dg][0],ab=ABO[rg][1],aboOK=!ag.some(a=>ab.includes('anti-'+a)),rhOK=!(dr==='+'&&rr==='-');return{ok:aboOK&&rhOK,ag:dr==='+'?[...ag,'Rh']:ag,ab,rh:rhOK?'Compatible':'Rh+ into Rh− recipient: anti-Rh antibodies may form'}}

add({...ch(15,'Body Fluids and Circulation'),id:'bio-double-circulation',title:'Double circulation',
 description:'Follow red blood cells through the pulmonary circuit (heart–lungs) and the systemic circuit (heart–body).',
 formula:'Right ventricle → lungs → left atrium ;  left ventricle → body → right atrium',
 observe:'Oxygenated and deoxygenated blood never mix in the human four-chambered heart.',
 tryText:'Highlight the pulmonary circuit: which vessel carries deoxygenated blood away from the heart?',
 controls:[S('loop','Highlight','both',[['both','Both circuits'],['pul','Pulmonary circuit'],['sys','Systemic circuit']]),R('hr','Heart rate',50,150,1,72,'beats/min')],
 metrics:p=>[N('Pulmonary circuit','RV → pulmonary artery → lungs → pulmonary veins → LA'),N('Systemic circuit','LV → aorta → body → venae cavae → RA'),N('Unusual vessels','Pulmonary artery: deoxygenated; pulmonary vein: oxygenated')],
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:56,pitch:.1,yaw:-.75}),beat=1+.08*Math.max(0,Math.sin(t*p.hr/60*TAU));body(s,[0,-2.2,0],1.3,.08);for(const z of[-1,1])s.mesh([0,0,z*.25],[.3*beat,.4*beat,.25*beat],z<0?'#c2255c':'#a61e4d');lungPair(s,[0,.9,0],1.15,'#ffc9c9',.45);
  const pul=[[0,0,-.3],[0,.6,-.35],[0,1,-.8],[0,1.2,-.4],[0,1.1,.4],[0,1,.8],[0,.6,.35],[0,0,.3]],sys=[[0,0,.3],[0,.5,.6],[0,-1.6,.9],[0,-2.6,.4],[0,-2.6,-.4],[0,-1.6,-.9],[0,.4,-.6],[0,0,-.3]],hl=k=>p.loop==='both'||p.loop===k;
  if(hl('pul')){s.tube(pul.slice(0,4),.07,'#4263eb',{segs:8});s.tube(pul.slice(3),.07,'#e03131',{segs:8})}if(hl('sys')){s.tube(sys.slice(0,4),.09,'#e03131',{segs:8});s.tube(sys.slice(3),.09,'#4263eb',{segs:8})}
  const along=(path,q)=>{const i=Math.min(path.length-2,Math.floor(q*(path.length-1))),fr=q*(path.length-1)-i;return V.add(path[i],V.mul(V.sub(path[i+1],path[i]),fr))};for(let i=0;i<8;i++){const q=cycle(t*p.hr/400+i/8,1);if(hl('pul'))s.ball(along(pul,q),.06,q<.45?'#5c7cfa':'#ff6b6b',{flat:true});if(hl('sys'))s.ball(along(sys,q),.06,q<.45?'#ff6b6b':'#5c7cfa',{flat:true})}s.render()},
 assumption:'Schematic circuits; the systemic circuit is drawn as a single loop through the body.'});

/* ---------- Chapter 16: Excretory Products and their Elimination ---------- */
add({...ch(16,'Excretory Products and their Elimination'),id:'bio-nephron',title:'Nephron: filtration and reabsorption',
 description:'Trace filtrate from the glomerulus through the tubule. Nearly all of it is reabsorbed.',
 formula:'GFR ≈ 125 mL/min ≈ 180 L/day ;  urine ≈ 1–1.5 L/day',
 observe:'About 99% of the filtrate is reabsorbed by the renal tubules; PCT reabsorbs most of the useful substances.',
 tryText:'Lower the reabsorption to 98%. How much urine would that make per day?',
 controls:[R('gfr','Glomerular filtration rate',60,150,1,125,'mL/min'),R('reab','Water reabsorbed',97,99.6,.1,99.2,'%',1)],
 metrics:p=>{const fd=p.gfr*1440/1000,ur=fd*(1-p.reab/100);return[N('Filtrate per day',fd,'L',0),N('Urine per day',ur,'L',2),N('Reabsorbed per day',fd-ur,'L',1),N('Nephrons per kidney','≈ 1 million')]},
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:56,pitch:.3}),cortex=1;s.box([0,1.3,0],[6.8,1.6,2],'#ffc9c9',{alpha:.12});s.box([0,-.9,0],[6.8,2.8,2],'#fa5252',{alpha:.07});s.label([-3.1,2.2,1],'cortex',C.muted,12);s.label([-3.1,-.2,1],'medulla',C.muted,12);
  s.lathe([-2.4,1.4,0],[[.0,-.5],[.45,-.35],[.55,0],[.45,.3],[.3,.38]],'#e9ecef',{alpha:.35,rot:[0,0,PI/2]});for(let i=0;i<14;i++)s.ball([-2.4+(hash(i)-.5)*.5,1.4+(hash(i+3)-.5)*.5,(hash(i+6)-.5)*.5],.1,'#e03131');
  const tubule=[[-2,1.4,0],[-1.5,1.7,.3],[-1.2,1.2,-.3],[-.8,1.6,.2],[-.6,1.1,0],[-.4,-1.8,0],[-.2,-2.1,0],[0,-1.8,0],[.2,.9,0],[.6,1.5,.3],[1,1.1,-.2],[1.4,1.5,.1],[1.9,1.3,0],[2.3,1.3,0],[2.3,-2.4,0]];s.tube(tubule,.1,(u)=>u<.3?'#ffd8a8':u<.55?'#a5d8ff':u<.8?'#d0bfff':'#ffe066',{segs:10});
  const along=q=>{const i=Math.min(tubule.length-2,Math.floor(q*(tubule.length-1))),fr=q*(tubule.length-1)-i;return V.add(tubule[i],V.mul(V.sub(tubule[i+1],tubule[i]),fr))};for(let i=0;i<14;i++){const q=cycle(t*.08+i/14,1);if(q<.85||i%5===0)s.ball(along(q),.05,'#fff3bf',{flat:true});if(q>.05&&q<.55&&i%2===0)s.ball(V.add(along(q),[0,0,.25+.4*((t*2+i)%1)]),.04,'#74c0fc',{flat:true})}
  s.label([-1.4,2.0,0],'PCT',C.gold,12);s.label([-.2,-2.4,0],'loop of Henle',C.blue,12);s.label([1.2,1.9,0],'DCT',C.purple,12);s.label([2.6,-1,0],'collecting duct',C.gold,12);s.label([-2.4,2.0,0],'glomerulus',C.red,12);s.render()},
 assumption:'Single nephron, not to scale; blue dots show water and solutes being reabsorbed.'});

add({...ch(16,'Excretory Products and their Elimination'),id:'bio-countercurrent',title:'Counter-current mechanism',
 description:'Move a probe down the loop of Henle and read the osmolarity of the medullary interstitium.',
 formula:'Interstitial osmolarity: ≈ 300 mOsmol/L (cortex) → ≈ 1200 mOsmol/L (inner medulla)',
 observe:'Descending limb: permeable to water; ascending limb: impermeable to water but transports electrolytes out.',
 tryText:'Move the probe to the bottom of the loop. Why can urine become concentrated there?',
 controls:[R('depth','Depth into medulla',0,100,1,60,'%'),S('limb','Limb','desc',[['desc','Descending limb'],['asc','Ascending limb']])],
 metrics:p=>{const osm=300+900*p.depth/100;return[N('Interstitial osmolarity',osm,'mOsmol/L',0),N('Filtrate in this limb',p.limb==='desc'?`≈ ${f(osm,0)} (water leaves)`:'Becoming dilute (salts leave)'),N('Permeable to',p.limb==='desc'?'Water':'Electrolytes (NaCl), not water'),N('Helped by','Vasa recta and urea')]},
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:58,pitch:.15}),H=3.4,top=1.6;for(let i=0;i<8;i++){const y=top-H*(i+.5)/8,k=i/7;s.box([0,y,-.6],[4.6,H/8,.2],`#${Math.round(255-60*k).toString(16)}${Math.round(230-150*k).toString(16)}${Math.round(140-100*k).toString(16)}`,{alpha:.5});s.label([2.6,y,-.6],f(300+900*(i+.5)/8,0),C.muted,11)}
  const loop=[[-.6,top,0],[-.6,top-H,0],[-.3,top-H-.3,0],[0,top-H,0],[0,top,0]];s.tube(loop,.13,'#a5d8ff',{segs:10});s.tube([[.7,top,.3],[.7,top-H,.3],[1.0,top-H-.25,.3],[1.3,top-H,.3],[1.3,top,.3]],.07,'#ff8787',{segs:8,alpha:.8});s.label([1,top+.3,.3],'vasa recta',C.red,12);
  for(let i=0;i<8;i++){const y=top-.2-i*.4;s.arrow([-.75,y,0],[-1.25,y,0],'#4dabf7',2,7);s.arrow([.15,y,0],[.65,y,0],'#ffd43b',2,7)}const y=top-H*p.depth/100,x=p.limb==='desc'?-.6:0;s.ball([x,y,.2],.12,C.white,{glow:true,lift:3});s.render();tag(c,'blue arrows: water out of descending limb · yellow: NaCl out of ascending limb',44,98,C.muted,12)},
 assumption:'Linear interstitial gradient for teaching; numbers from NCERT Chapter 16.'});

add({...ch(16,'Excretory Products and their Elimination'),id:'bio-adh-regulation',title:'ADH and water balance',
 description:'Drink more or less water and see the hypothalamus adjust ADH, changing urine volume and concentration.',
 formula:'↓ body water → ↑ ADH (vasopressin) → ↑ water reabsorption in DCT and collecting duct',
 observe:'Without ADH (diabetes insipidus) large volumes of dilute urine are produced.',
 tryText:'Switch on diabetes insipidus and compare the urine volume.',
 controls:[R('intake','Water intake',.5,5,.1,2,'L/day',1),S('di','Condition','normal',[['normal','Normal'],['di','Diabetes insipidus (no ADH)']])],
 metrics:p=>{const r=adh(p);return[N('ADH level (relative)',r.adh*100,'%',0),N('Urine volume',r.vol,'L/day',2),N('Urine osmolarity',r.osm,'mOsmol/L',0),N('Status',r.note)]},
 draw:(c,p,t)=>{const r=adh(p),s=P3.scene(c,{scale:56,cx:230,yaw:-.75});body(s,[0,-2.2,0],1.25,.1);s.mesh([0,1.15,0],.14,'#b197fc',{label:'hypothalamus'});s.label([.6,1.25,0],'hypothalamus / pituitary',C.purple,11);
  for(const z of[-1,1])s.mesh([-.15,-.2,z*.4],[.18,.3,.14],'#a61e4d',{shape:(u,v)=>1-.25*Math.max(0,Math.sin(v)*-z)});s.mesh([0,-1.05,0],[.2+.12*r.vol/5,.2+.12*r.vol/5,.2+.12*r.vol/5],'#ffe066',{alpha:.7});
  for(let i=0;i<Math.round(r.adh*8);i++){const q=cycle(t*.4+i/8,1);s.ball([0,1.05-q*1.2,(hash(i)-.5)*.3],.05,'#b197fc',{flat:true,glow:true})}s.render();
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
 draw:(c,p,t)=>{const L=sarcL(p),s=P3.scene(c,{scale:62,pitch:.25}),k=2.4,half=L*k/2,act=1*k,myo=1.6*k/2;for(const sg of[-1,1])s.box([sg*half,0,0],[.06,2,1.4],'#ced4da');
  for(let r=0;r<3;r++)for(let q=0;q<2;q++){const y=-.6+r*.6,z=-.3+q*.6;s.cyl([0,y,z],[1,0,0],.08,myo*2,'#e03131');for(let i=-6;i<=6;i++){if(Math.abs(i)<1)continue;const x=i*myo/6.5,sw=p.ca==='yes'&&p.con>0?.12*Math.sin(t*8+i):0;s.seg([x,y,z],[x+Math.sign(i)*(.1+sw),y+.18,z],'#ffa8a8',2)}}
  for(const sg of[-1,1])for(let r=0;r<4;r++)for(let q=0;q<3;q++){const y=-.9+r*.6,z=-.45+q*.45;s.tube([[sg*half,y,z],[sg*(half-act),y,z]],.035,'#4dabf7',{segs:6})}
  s.label([0,1.25,0],'A band',C.red,12);s.label([half-.2,1.25,0],'I',C.blue,12);s.label([-half+.2,1.25,0],'I',C.blue,12);s.label([half,1.15,.8],'Z',C.muted,12);s.render()},
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
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:62,pitch:.25}),a=rad(p.a),b=rad(p.b),bone='#ede3c8';s.tube([[0,-2.2,0],[0,-.35,0]],.22,bone,{segs:12});
  if(p.j==='ball'){s.mesh([0,-.2,0],[.55,.35,.55],'#dee2e6',{alpha:.4,shape:(u)=>u>0?.6:1});s.ball([0,0,0],.38,bone);const d=[Math.sin(a)*Math.cos(b),Math.cos(a)*Math.cos(b),Math.sin(b)];s.tube([[0,0,0],V.mul(d,2.2)],.2,bone,{segs:12})}
  else if(p.j==='hinge'){s.cyl([0,0,0],[0,0,1],.35,.8,bone);const d=[Math.sin(a),Math.cos(a),0];s.tube([V.mul(d,.2),V.mul(d,2.2)],.2,bone,{segs:12});s.label([0,0,.6],'axis',C.muted,12)}
  else if(p.j==='pivot'){s.ring([0,.2,0],[0,1,0],.35,'#adb5bd',5);s.tube([[0,-.3,0],[0,2,0]],.16,bone,{segs:12});for(let i=0;i<4;i++){const q=a+i*PI/2;s.box([.35*Math.cos(q),1.5,.35*Math.sin(q)],[.3,.25,.12],'#ced4da',{rotY:-q})}}
  else if(p.j==='gliding'){for(let i=0;i<4;i++)s.box([-.6+(i%2)*.75+(i===1?p.a/120:0),-.1+Math.floor(i/2)*.65,(i===2?p.b/120:0)],[.7,.6,.7],bone)}
  else{s.mesh([0,0,0],[.45,.25,.45],bone,{shape:(u,v)=>1+.4*Math.cos(2*v)*Math.sin(u)});const d=[Math.sin(a),Math.cos(a)*Math.cos(b),Math.sin(b)];s.tube([V.mul(d,.3),V.mul(d,2)],.16,bone,{segs:12})}s.render()},
 assumption:'Bones simplified to cylinders and spheres; ligaments and synovial membrane omitted.'});

const SKEL={axial:['Axial skeleton',80,'Skull 22 + hyoid 1 + ear ossicles 6, vertebrae 26, sternum 1, ribs 24'],skull:['Skull',22,'8 cranial + 14 facial bones'],vertebral:['Vertebral column',26,'7 cervical, 12 thoracic, 5 lumbar, 1 sacral, 1 coccygeal'],ribs:['Ribs',24,'12 pairs: 7 true, 3 false, 2 floating'],limbs:['Limbs',120,'30 bones in each limb'],girdles:['Girdles',6,'Pectoral (clavicle + scapula) × 2, pelvic (coxal) × 2'],appendicular:['Appendicular skeleton',126,'Limbs 120 + girdles 6']};
add({...ch(17,'Locomotion and Movement'),id:'bio-human-skeleton',title:'The human skeleton: 206 bones',
 description:'Highlight parts of the axial and appendicular skeleton and count their bones.',
 formula:'206 bones = 80 (axial) + 126 (appendicular)',
 observe:'Each limb has 30 bones; the vertebral column has 26 serially arranged vertebrae.',
 tryText:'Add up the skull, vertebral column, sternum and ribs. Do you get 80?',
 controls:[S('part','Highlight','axial',Object.keys(SKEL).map(k=>[k,SKEL[k][0]]))],
 metrics:p=>{const d=SKEL[p.part];return[N('Part',d[0]),N('Number of bones',d[1],'',0),N('Made up of',d[2]),N('Whole skeleton',206,'bones',0)]},
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:50,cy:262,yaw:-.75+.5*Math.sin(t*.3)}),bone='#ede3c8',hi=k=>{const g={axial:['skull','vertebral','ribs','sternum'],appendicular:['limbs','girdles']};return p.part===k||(g[p.part]||[]).includes(k)},col=k=>hi(k)?'#ffd43b':bone;
  s.mesh([0,2.75,0],[.32,.38,.3],col('skull'));s.mesh([.12,2.5,0],[.2,.14,.18],col('skull'));for(let i=0;i<26;i++){const y=2.3-i*.085;s.cyl([-.05-.05*Math.sin(i/5),y,0],[0,1,0],.07,.06,col('vertebral'))}
  for(let i=0;i<12;i++){const y=2.05-i*.11,w=.25+.15*Math.sin(PI*(i+1)/13);for(const z of[-1,1]){const pts=[];for(let j=0;j<=10;j++){const a=PI*j/10;pts.push([-.05+w*Math.sin(a)*.9,y-.05*Math.sin(a),z*w*(1-Math.cos(a))*.9])}s.path(pts,col('ribs'),2.5)}}s.cyl([.3,1.65,0],[0,1,0],.04,.55,col('sternum'));
  for(const z of[-1,1]){s.tube([[0,2.12,z*.12],[0,2.12,z*.5]],.03,col('girdles'),{segs:6});s.mesh([-.1,2.0,z*.45],[.08,.2,.14],col('girdles'));s.mesh([0,.95,z*.25],[.15,.22,.2],col('girdles'));
   s.tube([[0,2.05,z*.55],[0,1.45,z*.65]],.05,col('limbs'),{segs:6});s.tube([[0,1.42,z*.65],[.05,.85,z*.72]],.04,col('limbs'),{segs:6});s.tube([[0,.8,z*.22],[0,-.1,z*.24]],.06,col('limbs'),{segs:6});s.tube([[0,-.15,z*.24],[0,-1.0,z*.25]],.05,col('limbs'),{segs:6});s.mesh([.1,-1.05,z*.25],[.15,.04,.06],col('limbs'))}s.render()},
 assumption:'Schematic skeleton; bone counts from NCERT Chapter 17.'});

/* ---------- Chapter 18: Neural Control and Coordination ---------- */
add({...ch(18,'Neural Control and Coordination'),id:'bio-action-potential',title:'Nerve impulse: the action potential',
 description:'Stimulate an axon. If the stimulus reaches threshold, Na⁺ rushes in and a full action potential travels along it.',
 formula:'Resting ≈ −70 mV → depolarisation (Na⁺ in) → repolarisation (K⁺ out)',
 observe:'The response is all-or-none: below threshold nothing travels; above it the spike is always the same size.',
 tryText:'Increase the stimulus slowly. At what value does the impulse fire?',
 controls:[R('stim','Stimulus strength',0,40,1,25,'mV'),R('thr','Threshold depolarisation',10,25,1,15,'mV')],
 metrics:(p,t)=>{const fire=p.stim>=p.thr,v=apV(p,cycle(t,4)*1000/1000*4);return[N('Fires?',fire?'Yes — all-or-none spike':'No (sub-threshold)'),N('Membrane potential now',v,'mV',0),N('Resting potential',-70,'mV',0),N('Na⁺/K⁺ pump','3 Na⁺ out for 2 K⁺ in')]},
 draw:(c,p,t)=>{const fire=p.stim>=p.thr,s=P3.scene(c,{scale:56,pitch:.2}),T=cycle(t,4),front=-3+T*2.2;s.tube([[-3.4,0,0],[3.4,0,0]],.42,(u)=>{const x=-3.4+6.8*u,d=x-front;return fire&&d<0&&d>-.8?'#ffd43b':'#ffe8cc'},{alpha:.55,segs:16});
  for(let i=0;i<20;i++){const x=-3.2+i*.34,d=x-front,active=fire&&d<0&&d>-.8;s.ball([x,active?.15:.65,(hash(i)-.5)*.6],.05,'#fab005',{flat:true});s.ball([x+.15,active?.7:.2,(hash(i+5)-.5)*.6],.05,'#7950f2',{flat:true})}s.render();
  chart(c,420,96,236,170,{title:'Membrane potential vs time',xl:'ms',xmin:0,xmax:4,ymin:-90,ymax:45,series:[{fn:x=>apV(p,x),col:C.gold},{fn:()=>-70+p.thr,col:'#ff8787',dash:[4,4]}],marker:[T,apV(p,T)]});tag(c,'yellow dots: Na⁺   purple: K⁺',44,98,C.muted,13)},
 assumption:'Stylised waveform (peak ≈ +35 mV, undershoot ≈ −80 mV); the time axis is shown in ms but the animation is slowed.'});
function apV(p,x){const t0=.5;if(x<t0)return-70;if(p.stim<p.thr)return-70+p.stim*Math.exp(-(x-t0)/.3);const u=x-t0;if(u<.3)return-70+105*Math.sin(PI/2*u/.3);if(u<1.1)return 35-115*(u-.3)/.8;return-80+10*(1-Math.exp(-(u-1.1)/.5))}

add({...ch(18,'Neural Control and Coordination'),id:'bio-synapse',title:'Transmission across a chemical synapse',
 description:'An impulse arrives at the axon terminal: synaptic vesicles release neurotransmitter, which crosses the cleft and binds receptors.',
 formula:'Electrical signal → chemical (neurotransmitter) → electrical signal',
 observe:'Chemical synapses are slower than electrical synapses because the transmitter must diffuse across the cleft.',
 tryText:'Increase the impulse frequency and watch more neurotransmitter build up in the cleft.',
 controls:[R('freq','Impulse frequency',1,10,1,3,'per s'),S('type','Synapse','chem',[['chem','Chemical (with cleft)'],['elec','Electrical (gap junction)']])],
 metrics:p=>p.type==='chem'?[N('Gap','Synaptic cleft'),N('Transmitter','e.g. acetylcholine'),N('Speed','Slower (diffusion step)'),N('Effect','Excitatory or inhibitory')]:[N('Gap','Very close membranes'),N('Transmitter','None — current flows directly'),N('Speed','Faster'),N('Occurrence','Rare in our system')],
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:60,pitch:.15}),chem=p.type==='chem',gap=chem?.5:.12,T=cycle(t*p.freq/3,1);s.mesh([-1.4,0,0],[1.2,1,1],'#ffd8a8',{shape:(u,v)=>1-.3*Math.max(0,Math.cos(v))*Math.cos(u)});s.tube([[-4,0,0],[-2.3,0,0]],.3,'#ffd8a8',{segs:12});s.box([.0+gap/2+.4,0,0],[.8,2.6,2.2],'#c5f6fa',{alpha:.6});
  if(chem){for(let i=0;i<8;i++){const home=[-1.2+(hash(i)-.5)*.8,(hash(i+3)-.5)*1.2,(hash(i+6)-.5)*1],q=T>.3?Math.min(1,(T-.3)*3):0,pos=V.add(V.mul(home,1-q),V.mul([-.2,home[1]*.8,home[2]*.8],q));s.ball(pos,.13,'#b197fc',{alpha:.6});if(T>.55){const k=(T-.55)/.45;for(let m=0;m<3;m++)s.ball([-.15+gap*k*1.1,home[1]*.8+(hash(i*3+m)-.5)*.3,home[2]*.8+(hash(i*5+m)-.5)*.3],.04,'#7048e8',{flat:true})}}
   for(let i=0;i<10;i++)s.box([gap/2,-1+i*.22,(hash(i)-.5)*1.2],[.08,.12,.12],'#20c997')}else for(let i=0;i<6;i++)s.cyl([gap/2-.05,-.8+i*.32,0],[1,0,0],.06,gap+.15,'#20c997');
  const imp=-4+T*3;if(imp<-.4)s.ball([imp,0,0],.18,'#ffd43b',{glow:true,flat:true});s.render();tag(c,chem?'purple: vesicles / neurotransmitter · teal: receptors':'teal: gap-junction channels',44,98,C.muted,13)},
 assumption:'Schematic synapse; Ca²⁺ entry and transmitter breakdown omitted.'});

add({...ch(18,'Neural Control and Coordination'),id:'bio-reflex-arc',title:'Reflex arc: the knee jerk',
 description:'Tap the patellar tendon. The impulse runs in through a sensory neuron and straight out through a motor neuron in the spinal cord.',
 formula:'Receptor → afferent neuron → spinal cord → efferent neuron → effector',
 observe:'The reflex happens involuntarily, without waiting for a decision from the brain.',
 tryText:'Tap harder. Does the kick get larger?',
 controls:[R('tap','Tap strength',0,100,1,60,'%')],
 metrics:(p,t)=>{const T=cycle(t,4),st=T<.5?'Tap on tendon':T<1.3?'Afferent (sensory) neuron to spinal cord':T<1.6?'Synapse in grey matter':T<2.4?'Efferent (motor) neuron to thigh muscle':'Muscle contracts — leg kicks';return[N('Stage',st),N('Afferent entry','Dorsal root of spinal nerve'),N('Efferent exit','Ventral root'),N('Effector','Quadriceps (thigh) muscle')]},
 draw:(c,p,t)=>{const T=cycle(t,4),s=P3.scene(c,{scale:54,cx:300}),kick=T>2.4?Math.sin(PI*Math.min(1,(T-2.4)/1.2))*.7*p.tap/100:0;s.mesh([-2.6,1.2,0],[.9,.75,.6],'#ffe3e3',{alpha:.5});s.mesh([-2.6,1.2,0],[.45,.42,.3],'#adb5bd',{shape:(u,v)=>1-.35*Math.exp(-((Math.cos(v))**2)*8)*Math.cos(u)});s.label([-2.6,2.1,0],'spinal cord (T.S.)',C.muted,12);
  s.tube([[0,.6,0],[1.8,.6,0]],.32,'#ffc9c9');const knee=[1.8,.6,0],shin=[1.8+1.6*Math.sin(kick),.6-1.6*Math.cos(kick),0];s.tube([knee,shin],.24,'#ffc9c9');s.ball(knee,.3,'#ffc9c9');
  const hx=T<.5?2.6-.6*T*2:2;s.cyl([hx,.25,0],[1,0,0],.08,.5,'#495057');s.tube([[hx+.2,.25,0],[hx+.7,.9,0]],.03,'#868e96',{segs:4});
  const aff=[[1.8,.3,.2],[0,.8,.3],[-1.5,1.2,.3],[-2.4,1.4,.1]],eff=[[-2.6,1.0,-.1],[-1.5,.9,-.3],[0,.75,-.3],[1,.6,-.2]];s.path(aff,'#4dabf7',3);s.path(eff,'#ff6b6b',3);const along=(path,q)=>{const i=Math.min(path.length-2,Math.floor(q*(path.length-1))),fr=q*(path.length-1)-i;return V.add(path[i],V.mul(V.sub(path[i+1],path[i]),fr))};
  if(T>.5&&T<1.3)s.ball(along(aff,(T-.5)/.8),.1,'#4dabf7',{glow:true,flat:true});if(T>1.6&&T<2.4)s.ball(along(eff,(T-1.6)/.8),.1,'#ff6b6b',{glow:true,flat:true});s.render();tag(c,'blue: sensory (afferent)   red: motor (efferent)',44,98,C.muted,13)},
 assumption:'Monosynaptic stretch reflex, slowed down for viewing; real response takes a fraction of a second.'});

add({...ch(18,'Neural Control and Coordination'),id:'bio-myelinated-conduction',title:'Myelinated vs non-myelinated fibres',
 description:'Compare how fast impulses travel: continuously along a bare axon or jumping from node to node of Ranvier.',
 formula:'Saltatory conduction: impulse jumps between nodes of Ranvier',
 observe:'Myelinated fibres conduct impulses much faster than non-myelinated fibres of the same diameter.',
 tryText:'Double the axon diameter for both types and compare the speeds.',
 controls:[R('d','Axon diameter',1,20,.5,10,'μm',1)],
 metrics:p=>{const vm=6*p.d,vu=Math.sqrt(p.d);return[N('Myelinated speed',vm,'m/s',0),N('Non-myelinated speed',vu,'m/s',1),N('Time for 1 m (myelinated)',1000/vm,'ms',1),N('Time for 1 m (non-myelinated)',1000/vu,'ms',0)]},
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:56,pitch:.2}),vm=6*p.d,vu=Math.sqrt(p.d),r=.08+p.d*.008;for(const [z,my] of [[-.9,true],[.9,false]]){s.tube([[-3.4,0,z],[3.4,0,z]],r,'#ffe8cc',{segs:10});if(my)for(let i=0;i<8;i++)s.cyl([-3+i*.86,0,z],[1,0,0],r+.12,.7,'#f1f3f5',{alpha:.85});
   const x=my?-3+Math.floor(cycle(t*vm/40,1)*8)*.86-.43:-3.4+cycle(t*vu/12,1)*6.8;s.ball([x,0,z],r+.12,'#ffd43b',{glow:true,flat:true,lift:4});s.label([-3.6,.6,z],my?'myelinated':'non-myelinated',C.white,12)}s.render();tag(c,'animation speeds are relative, not real time',44,98,C.muted,13)},
 assumption:'Rule-of-thumb speeds: myelinated ≈ 6 m/s per μm of diameter; non-myelinated ≈ √d m/s (d in μm).'});

/* ---------- Chapter 19: Chemical Coordination and Integration ---------- */
add({...ch(19,'Chemical Coordination and Integration'),id:'bio-glucose-homeostasis',title:'Insulin, glucagon and blood glucose',
 description:'Eat a meal and watch insulin from β-cells bring blood glucose back down; glucagon from α-cells raises it when low.',
 formula:'Insulin: hypoglycaemic ;  glucagon: hyperglycaemic',
 observe:'In diabetes mellitus glucose stays high for long because insulin is lacking or ineffective.',
 tryText:'Compare the normal and diabetic curves after the same meal.',
 controls:[R('carb','Carbohydrate in meal',0,150,5,75,'g'),R('min','Time after meal',0,240,1,45,'min'),S('cond','Condition','normal',[['normal','Normal'],['dm','Diabetes mellitus']])],
 metrics:p=>{const g=gluc(p,p.min),i=insul(p,p.min);return[N('Blood glucose',g,'mg/dL',0),N('Insulin (relative)',i*100,'%',0),N('Glucagon',g<85?'Rising':'Low'),N('Liver','Glycogenesis when glucose is high')]},
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:58,cx:230}),ins=insul(p,p.min);for(let i=0;i<40;i++){const y=1-2*(i+.5)/40,r=Math.sqrt(1-y*y),a=i*2.4,rr=i<28?.65:1.05,q=[rr*r*Math.cos(a),rr*y,rr*r*Math.sin(a)];s.ball(q,.2,i<28?'#69db7c':'#ff8787')}
  for(let i=0;i<Math.round(ins*14);i++){const q=cycle(t*.5+i/14,1);s.ball([1.3+q*1.8,(hash(i)-.5)*1.5,(hash(i+4)-.5)],.06,'#69db7c',{flat:true,glow:true})}s.label([0,1.5,0],'islet of Langerhans',C.muted,12);s.render();
  chart(c,420,96,236,170,{title:'Blood glucose (mg/dL)',xl:'minutes',xmin:0,xmax:240,ymin:60,ymax:300,series:[{fn:m=>gluc({...p,cond:'normal'},m),col:'#8ca6b9',dash:[4,4]},{fn:m=>gluc(p,m),col:C.gold}],marker:[p.min,gluc(p,p.min)]});tag(c,'green: β-cells (insulin)   red: α-cells (glucagon)',44,98,C.muted,13)},
 assumption:'Illustrative response curves (fasting 90 mg/dL normal, 140 diabetic); not a clinical model.'});
function gluc(p,m){const dm=p.cond==='dm',base=dm?140:90,tau=dm?95:32,A=p.carb*(dm?2.6:1.1);return base+A*(m/tau)*Math.exp(1-m/tau)}
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
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:52,cy:290,yaw:-.75+.5*Math.sin(t*.3)});body(s,[0,-1.5,0],1.15,.1);for(const [k,d] of Object.entries(GL)){const on=k===p.g,q=V.add(d[2].map(v=>v*1.15),[0,-1.5,0]);if(k==='thyroid'){for(const z of[-1,1])s.mesh(V.add(q,[0,0,z*.1]),[.06,.11,.06],on?'#ffd43b':'#e64980');}else if(k==='adrenal'||k==='gonads'){for(const z of[-1,1])s.mesh(V.add(q,[0,0,z*.3-(k==='adrenal'?.3:0)]),.07,on?'#ffd43b':'#e64980')}else s.mesh(q,k==='pancreas'?[.22,.06,.06]:.07,on?'#ffd43b':'#e64980');if(on)s.label(V.add(q,[0,.3,0]),d[0],C.gold,13)}s.render()},
 assumption:'Gland positions approximate; hormone lists from NCERT Chapter 19.'});

add({...ch(19,'Chemical Coordination and Integration'),id:'bio-thyroid-feedback',title:'Thyroid feedback and iodine',
 description:'Reduce dietary iodine. Less thyroid hormone is made, TSH rises by negative feedback and the thyroid enlarges (goitre).',
 formula:'Hypothalamus (TRH) → pituitary (TSH) → thyroid (T₃, T₄) ⟲ negative feedback',
 observe:'Iodine deficiency causes hypothyroidism and enlargement of the thyroid gland (goitre).',
 tryText:'Lower iodine intake below 50 μg/day. What happens to TSH and gland size?',
 controls:[R('iod','Iodine intake',10,300,5,150,'μg/day')],
 metrics:p=>{const r=thy(p);return[N('Thyroid hormone (T₄) level',r.t4*100,'% of normal',0),N('TSH level',r.tsh*100,'% of normal',0),N('Thyroid size',r.size,'× normal',2),N('Condition',r.t4<.75?'Hypothyroidism, goitre risk':'Normal')]},
 draw:(c,p,t)=>{const r=thy(p),s=P3.scene(c,{scale:62,cx:240});s.tube([[0,-1.6,0],[0,.6,0]],.6,'#ffd8c2',{alpha:.3});for(const z of[-1,1])s.mesh([.45,-.4,z*.32*r.size],[.18*r.size,.42*r.size,.2*r.size],'#e64980');s.tube([[.5,-.5,-.3],[.55,-.55,0],[.5,-.5,.3]],.08*r.size,'#e64980');
  s.mesh([0,1.6,0],.18,'#b197fc');s.mesh([.1,1.3,0],.12,'#748ffc');s.label([.8,1.6,0],'hypothalamus',C.purple,12);s.label([.8,1.25,0],'pituitary',C.blue,12);for(let i=0;i<Math.round(r.tsh*5);i++){const q=cycle(t*.6+i/5,1);s.ball([.2,1.2-q*1.5,.1],.05,'#748ffc',{flat:true,glow:true})}for(let i=0;i<Math.round(r.t4*5);i++){const q=cycle(t*.5+i/5,1);s.ball([-.2,-.3+q*1.5,-.1],.05,'#ffd43b',{flat:true})}s.render();tag(c,'blue: TSH down · yellow: T₄ up (feedback)',44,98,C.muted,13)},
 assumption:'Toy steady-state model (T₄ ∝ √(iodine supply), TSH ∝ 1/T₄); adult requirement taken as ~150 μg/day.'});
function thy(p){const i=Math.min(1,p.iod/150),t4=Math.sqrt(i),tsh=1/t4;return{t4,tsh,size:1+Math.max(0,tsh-1)*.6}}

done();
})();
