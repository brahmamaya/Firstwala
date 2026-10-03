/* Chemistry pack 1 — NCERT Class 11 (rationalised), chapters 1–9, plus a small molecule kit.
   Data: IUPAC/NCERT values; CPK colours for atoms. */
(() => {
'use strict';
const {R,S,N,f,clamp,cycle,tag,chart,pack,PI,TAU,C}=window.PhysicaLab;
const P3=window.Physica3D,V=P3.vec,{add,done}=pack();
const ch=(no,chapter,group)=>({grade:11,chapterNo:no,chapter,group,subject:'chemistry'});
const hash=i=>{const x=Math.sin(i*127.1+311.7)*43758.5453;return x-Math.floor(x)};
// ---- Molecule kit (CPK colours, radii in scene units) ----
const CPK={H:['#f1f3f5',.17],C:['#495057',.27],N:['#4c6ef5',.26],O:['#fa5252',.26],F:['#94d82d',.24],Cl:['#40c057',.3],Br:['#a5432a',.32],S:['#fcc419',.31],P:['#fd7e14',.3],B:['#ffa8a8',.25],Be:['#c0eb75',.25],Xe:['#4dabf7',.34],Na:['#9775fa',.3],Cu:['#d9844a',.3],Zn:['#adb5bd',.3],I:['#7048e8',.34],X:['#e9ecef',.26]};
const atom=(s,p,el,k=1,opt={})=>{const [col,r]=CPK[el]||CPK.X;s.ball(p,r*k,col,{spec:.6,...opt});return s};
const bond=(s,a,b,order=1,col='#ced4da',r=.06)=>{const d=V.sub(b,a),n=V.norm(d),side=V.norm(Math.abs(n[1])<.9?V.cross(n,[0,1,0]):V.cross(n,[1,0,0]));if(order===1)s.tube([a,b],r,col,{segs:8});else for(let i=0;i<order;i++){const o=V.mul(side,(i-(order-1)/2)*.13);s.tube([V.add(a,o),V.add(b,o)],r*.75,col,{segs:6})}return s};
const beaker=(s,p,r,h,liq,fill=.7)=>{s.cyl(V.add(p,[0,h/2,0]),[0,1,0],r,h,'#e9f6ff',{alpha:.12,caps:false});s.cyl(V.add(p,[0,h*fill/2,0]),[0,1,0],r*.97,h*fill,liq,{alpha:.45});return s};
window.PhysicaChem={CPK,atom,bond,beaker,hash};

/* ---------- 1 Some Basic Concepts of Chemistry ---------- */
const MOL={H2O:['Water',18.02,[['O',0,0,0],['H',.6,.45,0],['H',-.6,.45,0]]],CO2:['Carbon dioxide',44.01,[['C',0,0,0],['O',.75,0,0],['O',-.75,0,0]]],NH3:['Ammonia',17.03,[['N',0,0,0],['H',.55,-.3,.3],['H',-.55,-.3,.3],['H',0,-.3,-.6]]],NaCl:['Sodium chloride',58.44,[['Na',-.4,0,0],['Cl',.4,0,0]]],C6H12O6:['Glucose',180.16,null]};
add({...ch(1,'Some Basic Concepts of Chemistry','PHYSICAL CHEMISTRY'),id:'chem-mole-concept',title:'Mole concept: mass, moles and particles',
 description:'Weigh out a substance and convert its mass into moles and into the number of molecules.',
 formula:'n = m / M ;  N = n × Nₐ  (Nₐ = 6.022 × 10²³ mol⁻¹)',
 observe:'Equal numbers of moles contain equal numbers of particles, whatever their masses.',
 tryText:'Take 18 g of water and then 44 g of CO₂. How many molecules does each contain?',
 controls:[S('sub','Substance','H2O',Object.keys(MOL).map(k=>[k,MOL[k][0]+' ('+k.replace(/(\d+)/g,m=>m.split('').map(d=>'₀₁₂₃₄₅₆₇₈₉'[d]).join(''))+')'])),R('m','Mass taken',1,200,1,18,'g')],
 metrics:p=>{const M=MOL[p.sub][1],n=p.m/M;return[N('Molar mass',M,'g/mol',2),N('Moles',n,'mol',3),N('Molecules / formula units',n*6.022e23,'',3)]},
 draw:(c,p,t)=>{const M=MOL[p.sub][1],n=p.m/M,s=P3.scene(c,{scale:56,cy:280,cx:300});s.cyl([-1.6,-1.3,0],[0,1,0],1,.2,'#adb5bd',{cap:'#dee2e6'});s.box([-1.6,-1.6,0],[2.4,.4,1.6],'#343a40');
  const heap=Math.min(1.1,.25+Math.cbrt(p.m)*.18);s.lathe([-1.6,-1.2,0],[[heap,0],[heap*.6,heap*.5],[0,heap*.75]],p.sub==='NaCl'?'#f8f9fa':p.sub==='C6H12O6'?'#fff3bf':p.sub==='CO2'?'#e9ecef':'#74c0fc',{alpha:p.sub==='H2O'?.6:undefined});
  const geo=MOL[p.sub][2],q=[1.6,.4,0];if(geo){for(const [el,x,y,z] of geo){if(el!==geo[0][0]||x||y||z)bond(s,q,V.add(q,[x,y,z]),p.sub==='CO2'?2:1)}for(const [el,x,y,z] of geo)atom(s,V.add(q,[x,y,z]),el,1.3)}else{for(let i=0;i<6;i++){const a=TAU*i/6,r=[.55*Math.cos(a),.2*Math.sin(2*a),.55*Math.sin(a)],b=[.55*Math.cos(a+TAU/6),.2*Math.sin(2*a+TAU/3),.55*Math.sin(a+TAU/6)];bond(s,V.add(q,r),V.add(q,b));atom(s,V.add(q,r),i===5?'O':'C')}}
  s.callout([-1.6,-.7,0],`${p.m} g on the balance`,'#e9f6ff',-60,-50);s.callout(V.add(q,[0,.6,0]),`1 molecule (M = ${M} g/mol)`,'#e9f6ff',40,-60);s.render();
  tag(c,`${p.m} g ÷ ${M} g/mol = ${f(n,3)} mol  →  ${f(n*6.022e23,3)} particles`,44,98,C.gold,15)},
 assumption:'Molar masses from IUPAC atomic masses; for NaCl the count is formula units, not molecules.'});

add({...ch(1,'Some Basic Concepts of Chemistry','PHYSICAL CHEMISTRY'),id:'chem-limiting-reagent',title:'Limiting reagent: making water',
 description:'Mix hydrogen and oxygen gas and find which runs out first in 2H₂ + O₂ → 2H₂O.',
 formula:'2 H₂ + O₂ → 2 H₂O ;  n(H₂O) = min(n(H₂), 2 n(O₂))',
 observe:'The reactant that is used up first limits the amount of product; the other is left over in excess.',
 tryText:'Use 4 g H₂ and 16 g O₂. Which one is limiting?',
 controls:[R('h','Hydrogen taken',.5,10,.5,4,'g',1),R('o','Oxygen taken',4,80,1,16,'g'),R('prog','Reaction progress',0,100,1,100,'%')],
 metrics:p=>{const nh=p.h/2.016,no=p.o/32,nw=Math.min(nh,2*no),lim=nh<2*no?'Hydrogen (H₂)':nh>2*no?'Oxygen (O₂)':'Neither (exact ratio)';return[N('Moles H₂',nh,'mol',3),N('Moles O₂',no,'mol',3),N('Limiting reagent',lim),N('Water formed',nw*18.02,'g',2),N('Left over',nh>2*no?`${f((nh-2*no)*2.016,2)} g H₂`:`${f((no-nh/2)*32,2)} g O₂`)]},
 draw:(c,p,t)=>{const nh=p.h/2.016,no=p.o/32,x=Math.min(nh,2*no)*p.prog/100,k=12/Math.max(nh+no,.1),H=Math.round((nh-x)*k),O=Math.round((no-x/2)*k),W=Math.round(x*k),s=P3.scene(c,{scale:56,cx:300});s.box([0,0,0],[4,2.6,2],'#e9f6ff',{alpha:.07});
  let i=0;const spot=()=>{const j=i++;return[-1.7+hash(j)*3.4+.08*Math.sin(t*2+j),-1.1+hash(j+50)*2.2,-.8+hash(j+90)*1.6]};
  for(let j=0;j<H;j++){const q=spot();atom(s,V.add(q,[-.12,0,0]),'H',.8);atom(s,V.add(q,[.12,0,0]),'H',.8)}for(let j=0;j<O;j++){const q=spot();atom(s,V.add(q,[-.17,0,0]),'O',.7);atom(s,V.add(q,[.17,0,0]),'O',.7)}
  for(let j=0;j<W;j++){const q=spot();atom(s,q,'O',.75);atom(s,V.add(q,[.17,.13,0]),'H',.7);atom(s,V.add(q,[-.17,.13,0]),'H',.7)}s.render();
  tag(c,'white pairs: H₂   red pairs: O₂   red + 2 white: H₂O  (particles drawn ∝ moles)',44,98,C.muted,13)},
 assumption:'Molar masses H₂ = 2.016 and O₂ = 32.00 g/mol; the reaction is assumed to go to completion.'});

/* ---------- 2 Structure of Atom ---------- */
const ORB={s:[0,'s',()=>1],px:[1,'pₓ',(x,y,z)=>x],py:[1,'p_y',(x,y,z)=>z],pz:[1,'p_z',(x,y,z)=>y],dxy:[2,'d_xy',(x,y,z)=>x*z],dyz:[2,'d_yz',(x,y,z)=>z*y],dxz:[2,'d_xz',(x,y,z)=>x*y],dx2y2:[2,'d_x²−y²',(x,y,z)=>x*x-z*z],dz2:[2,'d_z²',(x,y,z)=>3*y*y-1]};
add({...ch(2,'Structure of Atom','PHYSICAL CHEMISTRY'),id:'chem-orbitals',title:'Shapes of atomic orbitals',
 description:'Pick an orbital and the principal quantum number to see its 3D shape, lobes and nodes.',
 formula:'radial nodes = n − l − 1 ;  angular nodes = l ;  total nodes = n − 1',
 observe:'p orbitals have one nodal plane through the nucleus and d orbitals have two; the two colours show opposite signs of the wave function.',
 tryText:'Compare 2p and 3p: do they have the same shape? How many radial nodes does 3p have?',
 controls:[S('o','Orbital','pz',Object.keys(ORB).map(k=>[k,ORB[k][1]])),R('n','Principal quantum number n',1,4,1,2)],
 metrics:p=>{const l=ORB[p.o][0],ok=p.n>l;return ok?[N('Orbital',`${p.n}${ORB[p.o][1]}`),N('Quantum numbers',`n = ${p.n}, l = ${l}`),N('Radial nodes',p.n-l-1,'',0),N('Angular nodes',l,'',0)]:[N('Orbital','Not allowed'),N('Reason',`l = ${l} needs n ≥ ${l+1}`)]},
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:66,yaw:t*.25,pitch:.3}),[l,,fn]=ORB[p.o],ok=p.n>l;s.axes(2.2,[0,0,0]);s.label([2.5,0,0],'x',C.red,12);
  if(ok){const g=(u,v)=>{const x=Math.cos(u)*Math.cos(v),y=Math.sin(u),z=Math.cos(u)*Math.sin(v);return fn(x,y,z)},R0=.7+p.n*.25;
   s.mesh([0,0,0],R0*1.6,(a,b)=>g(-PI/2+PI*a,TAU*b)>=0?'#4dabf7':'#ff6b6b',{rings:28,segs:36,alpha:.85,shape:(u,v)=>Math.max(.02,Math.abs(g(u,v)))**(l?1:1)*(l===2&&p.o==='dz2'?.55:1)});
   for(let k=1;k<=p.n-l-1;k++)s.ring([0,0,0],[0,1,0],R0*1.6*k/(p.n-l)*.55,'#ffd43b',1.5,[4,4]);s.ball([0,0,0],.06,'#e9f6ff',{flat:true,lift:5});s.callout([0,0,0],'nucleus','#e9f6ff',-60,60);
   if(p.n-l-1>0)s.callout([R0*1.6/(p.n-l)*.55,0,0],`${p.n-l-1} radial node${p.n-l-1>1?'s':''} (dashed)`,'#ffd43b',60,50);s.render();tag(c,`${p.n}${ORB[p.o][1]}: blue (+) and red (−) lobes`,44,98,C.gold,15)}
  else{s.render();tag(c,`${p.n}${ORB[p.o][1]} does not exist: l must be less than n`,44,98,C.red,15)}},
 assumption:'Angular shapes are drawn from the real spherical harmonics; radial nodes are shown as dashed spheres (rings) for counting only.'});

const SUBS=[['1s',2],['2s',2],['2p',6],['3s',2],['3p',6],['4s',2],['3d',10],['4p',6]];
const SYM='H He Li Be B C N O F Ne Na Mg Al Si P S Cl Ar K Ca Sc Ti V Cr Mn Fe Co Ni Cu Zn Ga Ge As Se Br Kr'.split(' ');
function config(Z){let e=Z;const out=SUBS.map(([n,c])=>{const k=Math.min(c,e);e-=k;return[n,k]});if(Z===24){out[5][1]=1;out[6][1]=5}if(Z===29){out[5][1]=1;out[6][1]=10}return out.filter(x=>x[1]>0)}
const unpaired=cfg=>cfg.reduce((u,[n,k])=>{const box=n.endsWith('s')?1:n.endsWith('p')?3:5;return u+(k<=box?k:2*box-k)},0);
add({...ch(2,'Structure of Atom','PHYSICAL CHEMISTRY'),id:'chem-electron-configuration',title:'Electronic configuration (Aufbau, Pauli, Hund)',
 description:'Fill electrons into orbitals for elements 1–36 and see unpaired electrons, including the exceptions Cr and Cu.',
 formula:'Order: 1s < 2s < 2p < 3s < 3p < 4s < 3d < 4p  (n + l rule)',
 observe:'Cr (3d⁵4s¹) and Cu (3d¹⁰4s¹) break the simple order because half-filled and completely filled d subshells are extra stable.',
 tryText:'Compare Cr (24) with Mn (25) and Cu (29) with Zn (30).',
 controls:[R('Z','Atomic number Z',1,36,1,24)],
 metrics:p=>{const cfg=config(p.Z),sup=k=>String(k).split('').map(d=>'⁰¹²³⁴⁵⁶⁷⁸⁹'[d]).join('');return[N('Element',`${SYM[p.Z-1]} (Z = ${p.Z})`),N('Configuration',cfg.map(([n,k])=>n+sup(k)).join(' ')),N('Unpaired electrons',unpaired(cfg),'',0),N('Magnetic',unpaired(cfg)?'Paramagnetic':'Diamagnetic')]},
 draw:(c,p,t)=>{const cfg=config(p.Z),s=P3.scene(c,{scale:44,pitch:.15,cx:300,cy:300});const E={'1s':0,'2s':1,'2p':1.6,'3s':2.5,'3p':3.1,'4s':3.8,'3d':4.3,'4p':5.0};
  SUBS.forEach(([n,cap])=>{const box=cap/2,y=-2.4+E[n]*.95,have=(cfg.find(x=>x[0]===n)||[0,0])[1];s.label([-3.3,y,0],n,have?C.white:C.muted,13);
   for(let b=0;b<box;b++){const x=-2.6+b*.62;s.box([x,y,0],[.55,.42,.1],have?'#29475b':'#1c3040',{stroke:'#42d9ca66'});const ups=Math.min(have,box),downs=Math.max(0,have-box);
    if(b<ups)s.arrow([x-.12,y-.16,.08],[x-.12,y+.18,.08],'#ffd43b',2.5,6);if(b<downs)s.arrow([x+.12,y+.18,.08],[x+.12,y-.16,.08],'#74c0fc',2.5,6)}});
  s.callout([-2.6,-2.4+4.3*.95,0],'3d fills after 4s','#e9f6ff',-50,-40);s.render();tag(c,`${SYM[p.Z-1]}: yellow ↑ spin-up · blue ↓ spin-down (Hund: singles first)`,44,98,C.gold,14)},
 assumption:'Ground-state configurations of neutral atoms; boxes are energy-ordered for filling, not to scale.'});

/* ---------- 3 Classification of Elements and Periodicity ---------- */
const PT={IE:[1312,2372,520,899,801,1086,1402,1314,1681,2081,496,738,578,787,1012,1000,1251,1521,419,590,633,659,651,653,717,762,760,737,745,906,579,762,947,941,1140,1351],
  R:[31,28,128,96,84,76,71,66,57,58,166,141,121,111,107,105,102,106,203,176,170,160,153,139,139,132,126,124,132,122,122,120,119,120,120,116],
  EN:[2.20,0,.98,1.57,2.04,2.55,3.04,3.44,3.98,0,.93,1.31,1.61,1.90,2.19,2.58,3.16,0,.82,1.00,1.36,1.54,1.63,1.66,1.55,1.83,1.88,1.91,1.90,1.65,1.81,2.01,2.18,2.55,2.96,3.00]};
const pos=Z=>{if(Z<=2)return[1,Z===1?1:18];if(Z<=10)return[2,Z<=4?Z-2:Z+8];if(Z<=18)return[3,Z<=12?Z-10:Z];return[4,Z-18]};
add({...ch(3,'Classification of Elements and Periodicity in Properties','INORGANIC CHEMISTRY'),id:'chem-periodic-trends',title:'Periodic trends in 3D',
 description:'Raise the first 36 elements as bars to compare atomic radius, ionisation enthalpy or electronegativity across periods and down groups.',
 formula:'Across a period: radius ↓, ionisation enthalpy ↑, electronegativity ↑ ;  down a group: the reverse',
 observe:'Noble gases have the highest ionisation enthalpies; alkali metals the lowest. Radius shrinks across a period as nuclear charge rises.',
 tryText:'Why is the ionisation enthalpy of N higher than that of O?',
 controls:[S('prop','Property','IE',[['IE','First ionisation enthalpy'],['R','Covalent radius'],['EN','Electronegativity (Pauling)']]),R('Z','Highlight element Z',1,36,1,7)],
 metrics:p=>{const v=PT[p.prop][p.Z-1],u={IE:'kJ/mol',R:'pm',EN:''}[p.prop],[per,gr]=pos(p.Z);return[N('Element',`${SYM[p.Z-1]} (Z = ${p.Z})`),N('Period, group',`${per}, ${gr}`),N({IE:'Ionisation enthalpy',R:'Covalent radius',EN:'Electronegativity'}[p.prop],p.prop==='EN'&&!v?'not defined':`${v} ${u}`)]},
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:34,pitch:.55,yaw:-.35,cx:320,cy:300}),mx={IE:2400,R:210,EN:4}[p.prop],cols={IE:'#ffa94d',R:'#4dabf7',EN:'#69db7c'}[p.prop];
  for(let Z=1;Z<=36;Z++){const [per,gr]=pos(Z),x=-4.25+(gr-1)*.5,z=-1.2+(per-1)*.8,v=PT[p.prop][Z-1],h=Math.max(.04,v/mx*3),on=Z===p.Z;s.box([x,h/2,z],[.42,h,.62],on?'#ffd43b':cols,{stroke:'#00000044'});s.engrave([x,h+.08,z+.33],SYM[Z-1],on?'#ffd43b':'#e9f6ff',9,9e5)}
  const [per,gr]=pos(p.Z),v=PT[p.prop][p.Z-1];s.callout([-4.25+(gr-1)*.5,Math.max(.04,v/mx*3),-1.2+(per-1)*.8],`${SYM[p.Z-1]}: ${p.prop==='EN'&&!v?'—':v+' '+({IE:'kJ/mol',R:'pm',EN:''}[p.prop])}`,'#ffd43b',40,-60);
  s.label([-4.6,0,-1.6],'group 1',C.muted,11);s.label([4.25,0,-1.6],'18',C.muted,11);s.render();tag(c,'bar height = property value · rows = periods 1–4',44,98,C.muted,13)},
 assumption:'Ionisation enthalpies (kJ/mol) and Pauling electronegativities from standard tables; covalent radii from Cordero et al. (2008). Noble-gas electronegativities are not defined in the Pauling scale.'});

/* ---------- 4 Chemical Bonding and Molecular Structure ---------- */
const VS={'2,0':['Linear','BeCl₂',180],'3,0':['Trigonal planar','BF₃',120],'2,1':['Bent (V-shape)','SO₂',119.5],'4,0':['Tetrahedral','CH₄',109.5],'3,1':['Trigonal pyramidal','NH₃',107],'2,2':['Bent (V-shape)','H₂O',104.5],'5,0':['Trigonal bipyramidal','PCl₅','90, 120'],'4,1':['See-saw','SF₄','~102, ~173'],'3,2':['T-shape','ClF₃','~87.5'],'2,3':['Linear','XeF₂',180],'6,0':['Octahedral','SF₆',90],'5,1':['Square pyramidal','BrF₅','~84.8'],'4,2':['Square planar','XeF₄',90]};
const DIRS={2:[[1,0,0],[-1,0,0]],3:[[1,0,0],[-.5,0,.866],[-.5,0,-.866]],4:[[0,1,0],[.943,-.333,0],[-.471,-.333,.816],[-.471,-.333,-.816]],5:[[0,1,0],[0,-1,0],[1,0,0],[-.5,0,.866],[-.5,0,-.866]],6:[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]]};
// Which electron-pair directions hold lone pairs (equatorial first in trigonal bipyramid; trans in octahedron).
const LPS={'2,1':[2],'3,1':[0],'2,2':[0,1],'4,1':[2],'3,2':[3,4],'2,3':[2,3,4],'5,1':[3],'4,2':[2,3]};
add({...ch(4,'Chemical Bonding and Molecular Structure','PHYSICAL CHEMISTRY'),id:'chem-vsepr',title:'VSEPR: shapes of molecules',
 description:'Choose the numbers of bond pairs and lone pairs around the central atom and see the molecular shape.',
 formula:'Repulsion: lone pair–lone pair > lone pair–bond pair > bond pair–bond pair',
 observe:'Lone pairs take up more room, squeezing bond angles: CH₄ 109.5°, NH₃ 107°, H₂O 104.5°.',
 tryText:'Keep four electron pairs and change lone pairs from 0 to 2.',
 controls:[R('bp','Bond pairs',2,6,1,4),R('lp','Lone pairs',0,3,1,0)],
 metrics:p=>{const d=VS[`${p.bp},${p.lp}`];return d?[N('Electron pairs',p.bp+p.lp,'',0),N('Shape',d[0]),N('Example',d[1]),N('Bond angle',`${d[2]}°`)]:[N('Combination','Not a common VSEPR case'),N('Try',`total pairs 2–6 (now ${p.bp+p.lp})`)]},
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:70,yaw:t*.3,pitch:.25}),key=`${p.bp},${p.lp}`,d=VS[key],tot=p.bp+p.lp;atom(s,[0,0,0],'X',1.2,{});
  if(d){const dirs=DIRS[tot],lp=LPS[key]||[],L=1.25;let b=0;dirs.forEach((u,i)=>{if(lp.includes(i)){s.mesh(V.mul(u,.55),[.32,.32,.32],'#b197fc',{alpha:.45,rings:10,segs:14,shape:(uu,vv)=>1});s.ball(V.add(V.mul(u,.6),V.mul(V.norm(V.cross(u,[.3,.7,.2])),.1)),.05,'#e9f6ff',{flat:true});s.ball(V.sub(V.mul(u,.6),V.mul(V.norm(V.cross(u,[.3,.7,.2])),.1)),.05,'#e9f6ff',{flat:true})}
    else{const q=V.mul(u,L);bond(s,[0,0,0],q);atom(s,q,'F',1);b++}});
   if(lp.length)s.callout(V.mul(dirs[lp[0]],.6),'lone pair','#b197fc',60,-50);s.callout([0,0,0],'central atom','#e9ecef',-60,60);s.render();tag(c,`${d[0]} — e.g. ${d[1]}, angle ${d[2]}°`,44,98,C.gold,15)}
  else{s.render();tag(c,'Choose 2–6 electron pairs (bond + lone)',44,98,C.red,15)}},
 assumption:'Ideal electron-pair geometries; real angles for lone-pair molecules from NCERT.'});

const MO={H2:2,He2:4,Li2:6,Be2:8,B2:10,C2:12,N2:14,O2:16,F2:18,Ne2:20};
function moFill(nel,heavy){const order=heavy?[['σ1s',2],['σ*1s',2],['σ2s',2],['σ*2s',2],['σ2p',2],['π2p',4],['π*2p',4],['σ*2p',2]]:[['σ1s',2],['σ*1s',2],['σ2s',2],['σ*2s',2],['π2p',4],['σ2p',2],['π*2p',4],['σ*2p',2]];let e=nel;return order.map(([n,cp])=>{const k=Math.min(cp,e);e-=k;return[n,cp,k]})}
add({...ch(4,'Chemical Bonding and Molecular Structure','PHYSICAL CHEMISTRY'),id:'chem-mo-diagram',title:'Molecular orbitals: bond order and magnetism',
 description:'Fill electrons into the molecular orbitals of homonuclear diatomic molecules from H₂ to Ne₂.',
 formula:'Bond order = ½ (N_b − N_a)',
 observe:'O₂ has two unpaired electrons in π* orbitals and is paramagnetic, which Lewis structures cannot explain.',
 tryText:'Which molecules have a bond order of zero and therefore do not exist?',
 controls:[S('m','Molecule','O2',Object.keys(MO).map(k=>[k,k.replace('2','₂')]))],
 metrics:p=>{const heavy=['O2','F2','Ne2'].includes(p.m),fl=moFill(MO[p.m],heavy),nb=fl.filter(x=>!x[0].includes('*')).reduce((a,x)=>a+x[2],0),na=fl.filter(x=>x[0].includes('*')).reduce((a,x)=>a+x[2],0),bo=(nb-na)/2,unp=fl.reduce((u,[n,cp,k])=>u+(cp===4?(k<=2?k:4-k):k===1?1:0),0);
  return[N('Electrons',MO[p.m],'',0),N('Bond order',bo,'',1),N('Unpaired electrons',unp,'',0),N('Magnetic',unp?'Paramagnetic':'Diamagnetic'),N('Exists?',bo>0?'Yes':'No (bond order 0)')]},
 draw:(c,p,t)=>{const heavy=['O2','F2','Ne2'].includes(p.m),fl=moFill(MO[p.m],heavy),s=P3.scene(c,{scale:40,pitch:.1,cx:300,cy:290});
  fl.forEach(([n,cp,k],i)=>{const y=-2.6+i*.72,anti=n.includes('*'),boxes=cp/2;s.label([-2.6,y,0],n,anti?'#ff8787':'#69db7c',13);for(let b=0;b<boxes;b++){const x=-.4+(b-(boxes-1)/2)*.9;s.box([x,y,0],[.75,.08,.3],anti?'#c92a2a':'#2b8a3e');const inBox=cp===4?(k<=2?(b<k?1:0):(b<k-2?2:1)):k;
   if(inBox>=1)s.arrow([x-.13,y-.25,.1],[x-.13,y+.25,.1],'#ffd43b',2.5,6);if(inBox>=2)s.arrow([x+.13,y+.25,.1],[x+.13,y-.25,.1],'#74c0fc',2.5,6)}});
  s.callout([.6,-2.6+5*.72,0],heavy?'σ2p below π2p (O₂, F₂, Ne₂)':'π2p below σ2p (up to N₂)','#e9f6ff',60,-20);s.render();tag(c,'green: bonding · red: antibonding (*)',44,98,C.muted,13)},
 assumption:'Standard NCERT MO energy orders: s–p mixing puts π2p below σ2p up to N₂.'});

/* ---------- 5 Thermodynamics ---------- */
add({...ch(5,'Thermodynamics','PHYSICAL CHEMISTRY'),id:'chem-gibbs',title:'Gibbs energy and spontaneity',
 description:'Set ΔH and ΔS for a reaction and change the temperature to see when it becomes spontaneous.',
 formula:'ΔG = ΔH − TΔS ;  spontaneous if ΔG < 0 ;  crossover T = ΔH/ΔS',
 observe:'When ΔH and ΔS have the same sign, temperature decides spontaneity.',
 tryText:'Melting of ice: ΔH = +6.0 kJ/mol, ΔS = +22 J/(K·mol). Where is the crossover temperature?',
 controls:[R('H','ΔH',-100,100,1,6,'kJ/mol'),R('S','ΔS',-200,200,1,22,'J/(K·mol)'),R('T','Temperature',100,600,1,298,'K')],
 metrics:p=>{const G=p.H-p.T*p.S/1000,Tc=p.S!==0?p.H*1000/p.S:NaN;return[N('ΔG',G,'kJ/mol',2),N('Spontaneous?',G<0?'Yes':G>0?'No':'At equilibrium'),N('Crossover temperature',Number.isFinite(Tc)&&Tc>0?`${f(Tc,1)} K`:'none (same at all T)')]},
 draw:(c,p,t)=>{const G=p.H-p.T*p.S/1000,s=P3.scene(c,{scale:54,cx:240,cy:290}),hR=clamp(G/40,-1.8,1.8);s.box([0,-1.8,0],[5,.15,1.4],'#29475b');
  const path=Array.from({length:41},(_,i)=>{const x=-2.2+4.4*i/40,u=Math.max(0,x/2.2);return[x,-.6+.5*Math.exp(-((x)**2)*6)+hR*u*u*(3-2*u),0]});s.tube(path,.06,'#868e96',{segs:6});
  const q=G<0?cycle(t*.25,1):0,ball=path[Math.min(40,Math.round(q*40))];s.ball(V.add(ball,[0,.25,0]),.22,G<0?'#69db7c':'#ff6b6b',{glow:G<0});s.callout(path[0],'reactants','#e9f6ff',-30,-60);s.callout(path[40],`products (ΔG = ${f(G,1)} kJ/mol)`,G<0?'#69db7c':'#ff8787',-40,G<0?50:-60);s.render();
  chart(c,420,96,236,170,{title:'ΔG vs T',xl:'T (K)',xmin:100,xmax:600,ymin:-120,ymax:120,series:[{fn:T=>p.H-T*p.S/1000,col:C.gold},{fn:()=>0,col:'#8ca6b9',dash:[4,4]}],marker:[p.T,G]})},
 assumption:'ΔH and ΔS are taken as independent of temperature over this range.'});

/* ---------- 6 Equilibrium ---------- */
add({...ch(6,'Equilibrium','PHYSICAL CHEMISTRY'),id:'chem-le-chatelier',title:'Le Chatelier’s principle (Haber process)',
 description:'Disturb N₂ + 3H₂ ⇌ 2NH₃ by changing pressure, temperature or adding reactant and watch the equilibrium shift.',
 formula:'N₂ + 3H₂ ⇌ 2NH₃ ;  ΔH = −92.4 kJ/mol',
 observe:'Higher pressure and lower temperature favour ammonia; adding N₂ also shifts the equilibrium to the right.',
 tryText:'Raise the temperature from 500 K to 800 K. Does the yield of NH₃ rise or fall?',
 controls:[R('P','Pressure',50,300,10,200,'atm'),R('T','Temperature',500,900,10,700,'K'),R('n2','Extra N₂ added',0,2,.1,0,'×')],
 metrics:p=>{const r=haber(p);return[N('NH₃ in mixture',r.y*100,'%',1),N('NH₃ formed per mol N₂ fed',2*r.x,'mol',3),N('Shift (vs 200 atm, 700 K, no extra N₂)',r.dir),N('Effect of temperature','Exothermic: heat lowers K')]},
 draw:(c,p,t)=>{const r=haber(p),s=P3.scene(c,{scale:54,cx:260}),vol=2.6*Math.cbrt(200/p.P);s.box([0,0,0],[vol*1.4,vol,vol*.7],p.T>750?'#ff8787':'#e9f6ff',{alpha:.08});const tot=36,nA=Math.round(r.y*tot),nN=Math.round((1-r.y)*tot*(.25+.1*p.n2)/(1+.1*p.n2)),nH=tot-nA-nN;let i=0;
  const spot=()=>{const j=i++;return[(hash(j)-.5)*vol*1.25+.06*Math.sin(t*3+j),(hash(j+70)-.5)*vol*.85,(hash(j+140)-.5)*vol*.55]};for(let j=0;j<nN;j++){const q=spot();atom(s,V.add(q,[-.13,0,0]),'N',.7);atom(s,V.add(q,[.13,0,0]),'N',.7)}for(let j=0;j<nH;j++){const q=spot();atom(s,V.add(q,[-.1,0,0]),'H',.7);atom(s,V.add(q,[.1,0,0]),'H',.7)}
  for(let j=0;j<nA;j++){const q=spot();atom(s,q,'N',.75);for(let k=0;k<3;k++){const a=TAU*k/3;atom(s,V.add(q,[.17*Math.cos(a),-.1,.17*Math.sin(a)]),'H',.6)}}s.callout([vol*.7,vol*.5,0],`${p.P} atm, ${p.T} K`,'#e9f6ff',40,-50);s.render();tag(c,'blue pairs: N₂ · white pairs: H₂ · blue + 3 white: NH₃',44,98,C.muted,13)},
 assumption:'Equilibrium yield from Kp(T) = exp(−ΔG°/RT) with ΔH° = −92.4 kJ/mol and ΔS° = −198 J/(K·mol); ideal gases, stoichiometric feed.'});
function haber(p){const Kp=Math.exp(-(-92400-p.T*(-198.3))/(8.314*p.T)),solve=P=>{let lo=0,hi=.999;for(let k=0;k<60;k++){const x=(lo+hi)/2,n=4-2*x,yN=(1+p.n2-x)/(n+p.n2),yH=(3-3*x)/(n+p.n2),yA=2*x/(n+p.n2),Q=yA*yA/(yN*yH**3*P*P);if(Q<Kp)lo=x;else hi=x}const x=(lo+hi)/2;X=x;return 2*x/(4-2*x+p.n2)};let X=0;const y=solve(p.P),y0=(()=>{const q={...p,P:200,T:700,n2:0};const K0=Math.exp(-(-92400-700*(-198.3))/(8.314*700));let lo=0,hi=.999;for(let k=0;k<60;k++){const x=(lo+hi)/2,n=4-2*x,Q=(2*x/n)**2/((1-x)/n*((3-3*x)/n)**3*40000);if(Q<K0)lo=x;else hi=x}return(lo+hi)/2})();return{y,x:X,dir:X>y0+.003?'Towards NH₃ (right)':X<y0-.003?'Towards N₂ + H₂ (left)':'No change'}}

add({...ch(6,'Equilibrium','PHYSICAL CHEMISTRY'),id:'chem-ph',title:'pH of acids and bases',
 description:'Choose an acid or base and its concentration; see the pH, the indicator colour and the ions in solution.',
 formula:'pH = −log[H₃O⁺] ;  weak acid: [H₃O⁺] ≈ √(K_a c) ;  pH + pOH = 14 (298 K)',
 observe:'A tenfold dilution of a strong acid raises pH by one unit; a weak acid at the same concentration has a higher pH.',
 tryText:'Compare 0.1 M HCl with 0.1 M acetic acid.',
 controls:[S('k','Solute','HCl',[['HCl','Hydrochloric acid (strong)'],['AcOH','Acetic acid (weak, Kₐ 1.8×10⁻⁵)'],['NaOH','Sodium hydroxide (strong base)'],['NH3','Ammonia (weak base, K_b 1.8×10⁻⁵)']]),R('lc','Concentration (log₁₀ M)',-6,0,.1,-1,'',1)],
 metrics:p=>{const r=ph(p);return[N('Concentration',Math.pow(10,p.lc),'M',4),N('[H₃O⁺]',r.h,'M',3),N('pH',r.pH,'',2),N('Nature',r.pH<6.99?'Acidic':r.pH>7.01?'Basic':'Neutral')]},
 draw:(c,p,t)=>{const r=ph(p),s=P3.scene(c,{scale:58,cx:250,cy:290}),hue=clamp(r.pH,0,14)/14,col=['#e03131','#f76707','#fab005','#94d82d','#2f9e44','#1c7ed6','#5f3dc4'][Math.min(6,Math.floor(hue*7))];beaker(s,[0,-1.6,0],1.3,2.8,col,.75);
  const nH=Math.round(clamp(8+Math.log10(r.h)*1.5,0,14)),nOH=Math.round(clamp(8+Math.log10(1e-14/r.h)*1.5,0,14));for(let i=0;i<nH;i++)s.ball([(hash(i)-.5)*2,-1.4+hash(i+9)*1.8,(hash(i+20)-.5)*1.4],.09,'#ff8787',{glow:true});for(let i=0;i<nOH;i++)s.ball([(hash(i+40)-.5)*2,-1.4+hash(i+49)*1.8,(hash(i+60)-.5)*1.4],.09,'#74c0fc',{glow:true});
  for(let i=0;i<=14;i++)s.box([2.2,-1.6+i*.2,0],[.3,.18,.3],['#e03131','#f76707','#fab005','#94d82d','#2f9e44','#1c7ed6','#5f3dc4'][Math.min(6,Math.floor(i/14*7-1e-9))]);s.arrow([2.9,-1.6+r.pH*.2,0],[2.42,-1.6+r.pH*.2,0],'#e9f6ff',2.5,7,`pH ${f(r.pH,2)}`);s.callout([1.3,-.5,0],'universal indicator colour',col,30,-80);s.render();tag(c,'red: H₃O⁺ · blue: OH⁻ (number ∝ log concentration)',44,98,C.muted,13)},
 assumption:'25 °C, K_w = 1.0 × 10⁻¹⁴; water’s own ions included so very dilute solutions approach pH 7.'});
function ph(p){const c0=Math.pow(10,p.lc),Kw=1e-14,K=1.8e-5,wat=x=>(x+Math.sqrt(x*x+4*Kw))/2,weak=c=>(-K+Math.sqrt(K*K+4*K*c))/2;let h;if(p.k==='HCl')h=wat(c0);else if(p.k==='AcOH')h=wat(weak(c0));else h=Kw/wat(p.k==='NaOH'?c0:weak(c0));return{h,pH:-Math.log10(h)}}

/* ---------- 7 Redox Reactions ---------- */
add({...ch(7,'Redox Reactions','INORGANIC CHEMISTRY'),id:'chem-redox-displacement',title:'Redox: zinc in copper sulphate',
 description:'Dip a metal strip into a solution of another metal’s ions and see whether a displacement (redox) reaction happens.',
 formula:'Zn(s) + Cu²⁺(aq) → Zn²⁺(aq) + Cu(s)',
 observe:'Zinc is oxidised (0 → +2) and copper ions are reduced (+2 → 0); the blue colour of Cu²⁺ fades and copper deposits on zinc.',
 tryText:'Put a copper strip in zinc sulphate. Does anything happen?',
 controls:[S('pair','Strip in solution','Zn-Cu',[['Zn-Cu','Zinc strip in CuSO₄'],['Cu-Zn','Copper strip in ZnSO₄'],['Cu-Ag','Copper wire in AgNO₃']]),R('time','Time',0,60,1,20,'min')],
 metrics:p=>{const d={'Zn-Cu':['Yes','Zn: 0 → +2 (oxidised)','Cu²⁺: +2 → 0 (reduced)'],'Cu-Zn':['No','Zn is more reactive than Cu','—'],'Cu-Ag':['Yes','Cu: 0 → +2 (oxidised)','Ag⁺: +1 → 0 (reduced)']}[p.pair];return[N('Reaction?',d[0]),N('Oxidation',d[1]),N('Reduction',d[2]),N('Extent',d[0]==='Yes'?`${Math.round(100*(1-Math.exp(-p.time/20)))} %`:'0 %')]},
 draw:(c,p,t)=>{const go=p.pair!=='Cu-Zn',x=go?1-Math.exp(-p.time/20):0,s=P3.scene(c,{scale:60,cx:260,cy:290}),liq=p.pair==='Zn-Cu'?(x<.5?'#4dabf7':x<.85?'#a5d8ff':'#e7f5ff'):p.pair==='Cu-Ag'?(x>.3?'#a5d8ff':'#f1f3f5'):'#f1f3f5';beaker(s,[0,-1.7,0],1.2,2.8,liq,.75);
  const strip=p.pair==='Zn-Cu'?'#adb5bd':'#d9844a';s.box([0,-.5,0],[.5,2.6,.08],strip);if(go)for(let i=0;i<Math.round(x*40);i++){const y=-1.6+hash(i)*1.8;s.ball([(hash(i+5)-.5)*.5,y,(i%2?1:-1)*.06],.06,p.pair==='Zn-Cu'?'#c2410c':'#e9ecef',{flat:true})}
  s.callout([0,.4,.04],p.pair==='Zn-Cu'?'zinc strip':'copper strip',strip,60,-50);if(go&&x>.05)s.callout([0,-1.2,.08],p.pair==='Zn-Cu'?'copper deposit':'silver crystals','#e8590c',-70,30);s.callout([.9,-.6,0],p.pair==='Zn-Cu'?'Cu²⁺ (blue) fades':p.pair==='Cu-Ag'?'solution turns blue (Cu²⁺)':'no change',liq,50,30);s.render();tag(c,go?'Electrons flow from the more reactive metal to the ions':'No reaction: copper cannot reduce Zn²⁺',44,98,go?C.mint:C.red,14)},
 assumption:'Extent follows a simple exponential approach for illustration; the direction follows the reactivity (electrochemical) series.'});

/* ---------- 8 Organic Chemistry: Basic Principles and Techniques ---------- */
const PIG=[['β-carotene','#fab005',.95],['Xanthophyll','#ffd43b',.71],['Chlorophyll a','#2b8a3e',.65],['Chlorophyll b','#94d82d',.45]];
add({...ch(8,'Organic Chemistry – Some Basic Principles and Techniques','ORGANIC CHEMISTRY'),id:'chem-chromatography',title:'Paper chromatography and Rf',
 description:'Run a spot of leaf pigment extract up a strip of paper and measure each component’s retardation factor.',
 formula:'R_f = distance moved by the substance / distance moved by the solvent front',
 observe:'Components that are less strongly held by the paper (stationary phase) travel further and have higher R_f.',
 tryText:'Stop the run when the solvent has moved 6 cm and calculate R_f of chlorophyll a.',
 controls:[R('run','Solvent front distance',0,10,.1,8,'cm',1)],
 metrics:p=>PIG.map(([n,,rf])=>N(n,`${f(rf*p.run,2)} cm (R_f ≈ ${rf})`)),
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:52,cx:260,cy:300,pitch:.1}),k=.36;s.box([0,0,0],[1.4,4.2,.03],'#f8f9fa');beaker(s,[0,-2.3,0],1,1.2,'#e9ecef',.45);s.box([0,-1.6+p.run*k/2,.02],[1.4,p.run*k,.01],'#e7f5ff',{alpha:.6});s.seg([-.7,-1.6+p.run*k,.04],[.7,-1.6+p.run*k,.04],'#4dabf7',2,[4,3]);s.seg([-.7,-1.6,.04],[.7,-1.6,.04],'#868e96',1.5);
  for(const [n,col,rf] of PIG)s.mesh([0,-1.6+rf*p.run*k,.04],[.18,.07,.02],col);s.callout([.7,-1.6+p.run*k,0],'solvent front','#4dabf7',40,-30);s.callout([.7,-1.6,0],'base line (spot)','#ced4da',40,30);PIG.forEach(([n,col,rf],i)=>s.callout([.18,-1.6+rf*p.run*k,.04],n,col,-80-20*(i%2),i*8-10));s.render();tag(c,'paper = stationary phase · solvent = mobile phase',44,98,C.muted,13)},
 assumption:'R_f values are typical for a petroleum ether–acetone solvent; they vary with solvent and paper.'});

/* ---------- 9 Hydrocarbons ---------- */
add({...ch(9,'Hydrocarbons','ORGANIC CHEMISTRY'),id:'chem-ethane-conformations',title:'Conformations of ethane',
 description:'Rotate one carbon of ethane about the C–C bond and follow the torsional energy between staggered and eclipsed forms.',
 formula:'E(φ) ≈ ½ E₀ (1 + cos 3φ) ;  E₀ ≈ 12.5 kJ/mol',
 observe:'The staggered form (φ = 60°) is the most stable; the eclipsed form (φ = 0°) is 12.5 kJ/mol higher, but rotation is still rapid at room temperature.',
 tryText:'Find all angles at which ethane is eclipsed.',
 controls:[R('phi','Dihedral angle φ',0,360,1,60,'°')],
 metrics:p=>{const E=6.25*(1+Math.cos(3*p.phi*PI/180));return[N('Torsional energy',E,'kJ/mol',2),N('Conformation',E<.5?'Staggered':E>12?'Eclipsed':'Skew')]},
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:66,cx:240,yaw:.6,pitch:.25}),a=[-.77,0,0],b=[.77,0,0];bond(s,a,b);atom(s,a,'C');atom(s,b,'C');
  for(let i=0;i<3;i++){const q1=TAU*i/3,q2=q1+p.phi*PI/180,h1=V.add(a,[-.36,1.03*Math.cos(q1),1.03*Math.sin(q1)]),h2=V.add(b,[.36,1.03*Math.cos(q2),1.03*Math.sin(q2)]);bond(s,a,h1);atom(s,h1,'H');bond(s,b,h2);atom(s,h2,'H')}
  s.callout(a,'front carbon','#e9f6ff',-60,-60);s.callout(b,'rear carbon rotates','#e9f6ff',40,60);s.render();
  chart(c,420,96,236,170,{title:'Torsional energy (kJ/mol) vs φ',xl:'φ (°)',xmin:0,xmax:360,ymin:0,ymax:14,series:[{fn:x=>6.25*(1+Math.cos(3*x*PI/180)),col:C.gold}],marker:[p.phi,6.25*(1+Math.cos(3*p.phi*PI/180))]})},
 assumption:'Simple cosine torsional potential with the experimental barrier of about 12.5 kJ/mol.'});

done();
})();
