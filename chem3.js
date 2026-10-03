/* Chemistry pack 3 — more NCERT Class 11 experiments (chapters 1–9). */
(() => {
'use strict';
const {R,S,N,f,clamp,cycle,tag,chart,pack,PI,TAU,C}=window.PhysicaLab;
const P3=window.Physica3D,V=P3.vec,{atom,bond,beaker,hash}=window.PhysicaChem,{add,done}=pack();
const ch=(no,chapter,group)=>({grade:11,chapterNo:no,chapter,group,subject:'chemistry'});
const PH='PHYSICAL CHEMISTRY',IN='INORGANIC CHEMISTRY',OR='ORGANIC CHEMISTRY';
const bars=(s,list,sel,col,k,fmt)=>{list.forEach(([lab,v],i)=>{const h=Math.max(.05,v*k),x=-3+i*6/Math.max(1,list.length-1),on=i===sel;s.box([x,h/2,0],[.6,h,.6],on?'#ffd43b':col);s.engrave([x,h+.25,.32],lab,on?'#ffd43b':'#e9f6ff',9,9e5);if(on)s.callout([x,h,0],fmt(v),'#ffd43b',40,-50)})};

/* 1 Some Basic Concepts */
add({...ch(1,'Some Basic Concepts of Chemistry',PH),id:'chem-dilution',title:'Molarity and dilution',
 description:'Dissolve a solute, then add water and see the molarity fall while the moles of solute stay the same.',
 formula:'M = n / V(L) ;  M₁V₁ = M₂V₂',
 observe:'Dilution changes the volume, not the amount of solute, so concentration falls in proportion.',
 tryText:'Make 100 mL of 1 M solution and dilute it to 250 mL. What is the new molarity?',
 controls:[R('n','Moles of NaCl',.01,.5,.01,.1,'mol',2),R('V1','Starting volume',50,250,5,100,'mL'),R('add','Water added',0,500,10,150,'mL')],
 metrics:p=>{const M1=p.n/(p.V1/1000),V2=p.V1+p.add;return[N('Initial molarity',M1,'M',3),N('Final volume',V2,'mL',0),N('Final molarity',p.n/(V2/1000),'M',3),N('Mass of NaCl',p.n*58.44,'g',2)]},
 draw:(c,p,t)=>{const V2=p.V1+p.add,s=P3.scene(c,{scale:54,cx:280,cy:300}),M=p.n/(V2/1000),fill=clamp(V2/750,.08,.95),tint=clamp(M/2,0,1);beaker(s,[0,-1.9,0],1.3,3.2,tint>.5?'#4dabf7':tint>.2?'#74c0fc':'#d0ebff',fill);
  for(let i=0;i<Math.round(p.n*60);i++)s.ball([(hash(i)-.5)*2,-1.8+hash(i+7)*3.1*fill,(hash(i+13)-.5)*1.6],.06,i%2?'#9775fa':'#40c057',{flat:true});for(let i=0;i<=5;i++)s.seg([1.28,-1.9+i*.64*.75*(4/3)*.75,0],[1.12,-1.9+i*.64*.75*(4/3)*.75,0],'#e9f6ff',1.2);
  s.callout([1.3,-1.9+3.2*fill,0],`${V2} mL, ${f(M,3)} M`,'#74c0fc',50,-40);s.callout([0,-1.2,.6],'Na⁺ (purple) and Cl⁻ (green) ions','#e9f6ff',-80,40);s.render();tag(c,`M₁V₁ = ${f(p.n/(p.V1/1000),3)} × ${p.V1} = M₂ × ${V2}`,44,98,C.gold,14)},
 assumption:'Volumes are taken as additive for dilute aqueous solutions.'});

const EF=[['C','#495057',12.01],['H','#f1f3f5',1.008],['O','#fa5252',16.00],['N','#4c6ef5',14.01]];
add({...ch(1,'Some Basic Concepts of Chemistry',PH),id:'chem-empirical-formula',title:'Empirical formula from percentage composition',
 description:'Enter the mass percentages of C, H, O and N and convert them to the simplest whole-number ratio.',
 formula:'moles = mass % / atomic mass ;  divide by the smallest ;  round to whole numbers',
 observe:'Glucose (40.0 % C, 6.7 % H, 53.3 % O) gives CH₂O; the molecular formula is a whole-number multiple.',
 tryText:'Try 52.2 % C, 13.0 % H, 34.8 % O. Which compound could it be?',
 controls:[R('C','Carbon',0,100,.1,40,'%',1),R('H','Hydrogen',0,20,.1,6.7,'%',1),R('N','Nitrogen',0,60,.1,0,'%',1)],
 metrics:p=>{const r=emp(p);return[N('Oxygen (by difference)',r.O,'%',1),N('Mole ratio C : H : O : N',r.ratio.map(x=>f(x,2)).join(' : ')),N('Empirical formula',r.formula)]},
 draw:(c,p,t)=>{const r=emp(p),s=P3.scene(c,{scale:54,cx:280,yaw:t*.2,pitch:.3});let i=0;const tot=r.whole.reduce((a,b)=>a+b,0);r.whole.forEach((n,k)=>{for(let j=0;j<n;j++){const a=TAU*i/Math.max(1,tot),R0=.6+.08*tot;atom(s,[R0*Math.cos(a),(k-1.5)*.15,R0*Math.sin(a)],EF[k][0],1.2);i++}});s.render();tag(c,`Empirical formula: ${r.formula}`,44,98,C.gold,16)},
 assumption:'Oxygen is taken by difference; ratios within 0.1 of a half or third are scaled up before rounding.'});
function emp(p){const O=Math.max(0,100-p.C-p.H-p.N),pc=[p.C,p.H,O,p.N],mol=pc.map((v,i)=>v/EF[i][2]),pos=mol.filter(x=>x>1e-6),mn=Math.min(...pos),ratio=mol.map(x=>x/mn);let mult=1;for(const m of[1,2,3,4,5,6]){if(ratio.every(x=>Math.abs(x*m-Math.round(x*m))<.12)){mult=m;break}}const whole=ratio.map(x=>Math.round(x*mult)),sub=n=>n>1?String(n).split('').map(d=>'₀₁₂₃₄₅₆₇₈₉'[d]).join(''):'';return{O,ratio,whole,formula:whole.map((n,i)=>n?EF[i][0]+sub(n):'').join('')||'—'}}

/* 2 Structure of Atom */
const SER=[['Lyman',1,'ultraviolet'],['Balmer',2,'visible'],['Paschen',3,'infrared'],['Brackett',4,'infrared'],['Pfund',5,'infrared']];
const spec=nm=>nm<380?'#be4bdb':nm<450?'#7048e8':nm<495?'#1c7ed6':nm<570?'#2f9e44':nm<590?'#fab005':nm<620?'#f76707':nm<=750?'#e03131':'#c92a2a';
add({...ch(2,'Structure of Atom',PH),id:'chem-hydrogen-series',title:'Spectral series of hydrogen',
 description:'Choose a series and the upper level to see the wavelength of the emitted line.',
 formula:'1/λ = R_H (1/n₁² − 1/n₂²) ;  R_H = 109 677 cm⁻¹',
 observe:'Only the Balmer series falls in the visible region; Lyman lines are ultraviolet.',
 tryText:'Find the wavelength of the red Balmer line (n₂ = 3).',
 controls:[R('s','Series (n₁)',1,5,1,2),R('n2','Upper level n₂',2,8,1,3)],
 metrics:p=>{const n1=p.s,n2=Math.max(p.n2,n1+1),wn=109677*(1/n1**2-1/n2**2),lam=1e7/wn;return[N('Series',`${SER[n1-1][0]} (${SER[n1-1][2]})`),N('Transition',`n = ${n2} → ${n1}`),N('Wavenumber',wn,'cm⁻¹',0),N('Wavelength',lam,'nm',1)]},
 draw:(c,p,t)=>{const n1=p.s,n2=Math.max(p.n2,n1+1),lam=1e7/(109677*(1/n1**2-1/n2**2)),s=P3.scene(c,{scale:56,cx:260,pitch:.6});for(let n=1;n<=7;n++){const r=.25*n*n**.5;s.ring([0,0,0],[0,1,0],r,n===n1||n===n2?'#42d9ca':'#29475b',n===n1||n===n2?2:1);s.engrave([r+.12,0,0],`n=${n}`,'#8ca6b9',9,9e5)}
  atom(s,[0,0,0],'H',1.1);const q=cycle(t*.6,1),r2=.25*n2*n2**.5,r1=.25*n1*n1**.5,rr=r2+(r1-r2)*Math.min(1,q*2);s.ball([rr,0,0],.1,'#4dabf7',{glow:true});if(q>.5){const d=(q-.5)*2*2.5;s.curve(Array.from({length:30},(_,i)=>[r1+i/29*d,.15*Math.sin(i*1.4-t*8),0]),spec(lam),2.5)}s.callout([r1,0,0],`photon λ = ${f(lam,1)} nm`,spec(lam),40,-60);s.render();tag(c,`${SER[n1-1][0]} series: ${n2} → ${n1}`,44,98,C.gold,15)},
 assumption:'Bohr model of hydrogen; orbit radii drawn compressed (true radius ∝ n²).'});

/* 3 Periodicity */
const ISO=[['N³⁻',146],['O²⁻',140],['F⁻',133],['Na⁺',102],['Mg²⁺',72],['Al³⁺',53.5]];
add({...ch(3,'Classification of Elements and Periodicity in Properties',IN),id:'chem-isoelectronic',title:'Sizes of isoelectronic ions',
 description:'Compare ions that all have 10 electrons (the neon configuration) but different nuclear charges.',
 formula:'Same electrons, larger nuclear charge → stronger pull → smaller ion',
 observe:'N³⁻ is the largest and Al³⁺ the smallest, though all have 10 electrons.',
 tryText:'Which ion has the highest effective nuclear charge per electron?',
 controls:[R('i','Ion',1,6,1,4)],
 metrics:p=>{const [n,r]=ISO[p.i-1],Z=[7,8,9,11,12,13][p.i-1];return[N('Ion',n),N('Nuclear charge Z',Z,'',0),N('Electrons',10,'',0),N('Ionic radius',r,'pm',1)]},
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:50,cx:300});ISO.forEach(([n,r],i)=>{const x=-3+i*1.2,on=i===p.i-1;s.ball([x,0,0],r/100*.55,on?'#ffd43b':i<3?'#ff8787':'#74c0fc',{spec:.6});s.engrave([x,-1.1,0],n,on?'#ffd43b':'#e9f6ff',11,9e5);s.engrave([x,-1.4,0],`${r} pm`,'#8ca6b9',9,9e5)});s.render();tag(c,'red: anions · blue: cations · all have 10 electrons',44,98,C.muted,13)},
 assumption:'Shannon effective ionic radii (coordination number 6; N³⁻ value for CN 4).'});

/* 4 Bonding */
const HYB={sp:['sp','C₂H₂ (ethyne)',180,50],sp2:['sp²','C₂H₄ (ethene)',120,33.3],sp3:['sp³','CH₄ (methane)',109.5,25]};
add({...ch(4,'Chemical Bonding and Molecular Structure',PH),id:'chem-hybridisation',title:'Hybridisation of carbon',
 description:'Switch between sp, sp² and sp³ carbon and see the hybrid orbitals, the bond angles and the molecule they make.',
 formula:'sp: 2 hybrids, 180° ;  sp²: 3 hybrids, 120° ;  sp³: 4 hybrids, 109.5°',
 observe:'More s-character makes the hybrid orbital shorter and the C–H bond stronger.',
 tryText:'Which hybrid has the greatest s-character?',
 controls:[S('h','Hybridisation','sp3',[['sp','sp'],['sp2','sp²'],['sp3','sp³']])],
 metrics:p=>{const d=HYB[p.h];return[N('Hybridisation',d[0]),N('Example',d[1]),N('Bond angle',`${d[2]}°`),N('s-character',d[3],'%',1),N('Unhybridised p orbitals',p.h==='sp'?2:p.h==='sp2'?1:0,'',0)]},
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:66,cx:260,yaw:t*.3,pitch:.3}),dirs={sp:[[1,0,0],[-1,0,0]],sp2:[[1,0,0],[-.5,0,.866],[-.5,0,-.866]],sp3:[[0,1,0],[.943,-.333,0],[-.471,-.333,.816],[-.471,-.333,-.816]]}[p.h];atom(s,[0,0,0],'C',1.1);
  dirs.forEach(u=>{s.mesh(V.mul(u,.6),[.5,.5,.5],'#4dabf7',{alpha:.35,rings:10,segs:14,shape:()=>1,rot:[0,0,0]});const q=V.mul(u,1.35);bond(s,[0,0,0],q);atom(s,q,'H')});
  if(p.h!=='sp3')for(const sg of[1,-1])s.mesh([0,sg*.65,0],[.22,.55,.22],'#ff8787',{alpha:.35,rings:10,segs:12});if(p.h==='sp')for(const sg of[1,-1])s.mesh([0,0,sg*.65],[.22,.22,.55],'#ff8787',{alpha:.35,rings:10,segs:12});
  s.callout(V.mul(dirs[0],.6),`${HYB[p.h][0]} hybrid orbital`,'#74c0fc',50,-60);if(p.h!=='sp3')s.callout([0,.9,0],'unhybridised p (forms π bond)','#ff8787',-60,-50);s.render();tag(c,`${HYB[p.h][0]}: bond angle ${HYB[p.h][2]}°`,44,98,C.gold,15)},
 assumption:'Hybrid lobes drawn schematically; ethene and ethyne show one carbon of the molecule.'});

const DIP=[['CO₂','linear',[['O',1],['O',-1]],0],['H₂O','bent',[['H',104.5]],1.85],['NH₃','pyramidal',[['H',107]],1.47],['NF₃','pyramidal',[['F',102]],.23],['BF₃','trigonal planar',[['F',120]],0],['CH₄','tetrahedral',[['H',109.5]],0],['CHCl₃','tetrahedral',[['Cl',109.5]],1.04]];
add({...ch(4,'Chemical Bonding and Molecular Structure',PH),id:'chem-dipole-moment',title:'Dipole moments of molecules',
 description:'See how individual bond dipoles add up (or cancel) to give the dipole moment of a molecule.',
 formula:'μ = q × d (debye, D) ;  molecular μ = vector sum of bond dipoles',
 observe:'Symmetric molecules such as CO₂, BF₃ and CH₄ have zero dipole moment; NH₃ has a larger dipole than NF₃ because the lone pair adds to the N–H dipoles.',
 tryText:'Why is the dipole of NF₃ so small?',
 controls:[R('i','Molecule',1,7,1,2)],
 metrics:p=>{const d=DIP[p.i-1];return[N('Molecule',d[0]),N('Shape',d[1]),N('Dipole moment',d[3],'D',2),N('Polar?',d[3]>0?'Yes':'No')]},
 draw:(c,p,t)=>{const d=DIP[p.i-1],s=P3.scene(c,{scale:66,cx:250,yaw:t*.25,pitch:.25}),cen={'CO₂':'C','H₂O':'O','NH₃':'N','NF₃':'N','BF₃':'B','CH₄':'C','CHCl₃':'C'}[d[0]];atom(s,[0,0,0],cen,1.1);
  const L=1.15,geo={'CO₂':[[1,0,0],[-1,0,0]],'H₂O':[[.79,-.61,0],[-.79,-.61,0]],'NH₃':[[.94,-.33,0],[-.47,-.33,.82],[-.47,-.33,-.82]],'NF₃':[[.94,-.33,0],[-.47,-.33,.82],[-.47,-.33,-.82]],'BF₃':[[1,0,0],[-.5,0,.866],[-.5,0,-.866]],'CH₄':[[0,1,0],[.94,-.33,0],[-.47,-.33,.82],[-.47,-.33,-.82]],'CHCl₃':[[0,1,0],[.94,-.33,0],[-.47,-.33,.82],[-.47,-.33,-.82]]}[d[0]];
  geo.forEach((u,i)=>{const el=d[0]==='CHCl₃'?(i===0?'H':'Cl'):d[0]==='CO₂'?'O':d[0]==='H₂O'||d[0]==='NH₃'||d[0]==='CH₄'?'H':'F';const q=V.mul(u,L);bond(s,[0,0,0],q,d[0]==='CO₂'?2:1);atom(s,q,el)});
  if(d[3]>0){const up=d[0]==='H₂O'||d[0]==='NH₃'||d[0]==='NF₃'?[0,1,0]:[0,-1,0];s.arrow(V.mul(up,-.4),V.mul(up,.4+d[3]*.5),'#ffd43b',4,10,`μ = ${d[3]} D`)}else s.callout([0,0,0],'bond dipoles cancel: μ = 0','#69db7c',60,-60);s.render();tag(c,`${d[0]}: ${d[1]}`,44,98,C.gold,15)},
 assumption:'Experimental gas-phase dipole moments; arrow drawn from the positive to the negative end of the molecule (chemist’s convention, length ∝ μ).'});

/* 5 Thermodynamics */
add({...ch(5,'Thermodynamics',PH),id:'chem-hess-law',title:'Hess’s law: two routes to CO₂',
 description:'Burn carbon to CO₂ directly, or in two steps through CO, and compare the enthalpy changes.',
 formula:'C + O₂ → CO₂ (ΔH = −393.5 kJ) = [C + ½O₂ → CO (−110.5)] + [CO + ½O₂ → CO₂ (−283.0)]',
 observe:'The total enthalpy change is the same whichever path is taken, because enthalpy is a state function.',
 tryText:'Use the two-step path. Add up the steps.',
 controls:[S('route','Route','two',[['one','Direct'],['two','Through CO']]),R('mol','Moles of carbon',.5,3,.5,1,'mol',1)],
 metrics:p=>[N('Step 1',p.route==='two'?`${f(-110.5*p.mol,1)} kJ (C → CO)`:`${f(-393.5*p.mol,1)} kJ (C → CO₂)`),N('Step 2',p.route==='two'?`${f(-283*p.mol,1)} kJ (CO → CO₂)`:'—'),N('Total ΔH',-393.5*p.mol,'kJ',1)],
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:48,cx:260,cy:300,pitch:.15}),k=4/393.5,y0=1.8,lev=(y,lab,x0=-2.4,x1=-.6)=>{s.box([(x0+x1)/2,y,0],[x1-x0,.08,.6],'#42d9ca');s.label([x1+.15,y,0],lab,C.white,12,'left')};
  lev(y0,'C + O₂');lev(y0-393.5*k,'CO₂');if(p.route==='two'){lev(y0-110.5*k,'CO + ½O₂',.6,2.4);s.arrow([.9,y0,0],[.9,y0-110.5*k,0],'#ffd43b',3,9,'−110.5 kJ');s.arrow([1.6,y0-110.5*k,0],[1.6,y0-393.5*k,0],'#ff8787',3,9,'−283.0 kJ')}s.arrow([-1.5,y0,0],[-1.5,y0-393.5*k,0],'#69db7c',4,10,'−393.5 kJ');s.render();tag(c,`ΔH (total) = ${f(-393.5*p.mol,1)} kJ for ${p.mol} mol C`,44,98,C.gold,15)},
 assumption:'Standard enthalpies at 298 K; per mole of carbon (graphite).'});

/* 6 Equilibrium */
add({...ch(6,'Equilibrium',PH),id:'chem-buffer',title:'Buffer solutions (Henderson equation)',
 description:'Mix acetic acid with sodium acetate and add a little strong acid or base; see how little the pH changes.',
 formula:'pH = pKₐ + log([A⁻]/[HA]) ;  pKₐ(acetic acid) = 4.76',
 observe:'A buffer resists pH change because added H⁺ is taken up by A⁻ and added OH⁻ by HA.',
 tryText:'Add 0.01 mol of HCl to the buffer and to pure water. Compare the pH changes.',
 controls:[R('ha','Acetic acid',.01,.2,.01,.1,'mol',2),R('a','Sodium acetate',.01,.2,.01,.1,'mol',2),R('add','Strong acid (+) / base (−) added',-.05,.05,.005,0,'mol',3)],
 metrics:p=>{const HA=p.ha+p.add,A=p.a-p.add,ok=HA>0&&A>0,pH=ok?4.76+Math.log10(A/HA):NaN,water=p.add>0?-Math.log10(p.add):p.add<0?14+Math.log10(-p.add):7;return[N('pH of buffer',ok?pH:'capacity exceeded','',2),N('pH if added to 1 L water',water,'',2),N('[A⁻]/[HA]',ok?A/HA:'—','',2)]},
 draw:(c,p,t)=>{const HA=Math.max(0,p.ha+p.add),A=Math.max(0,p.a-p.add),pH=4.76+Math.log10(Math.max(1e-6,A)/Math.max(1e-6,HA)),s=P3.scene(c,{scale:56,cx:250,cy:290});beaker(s,[0,-1.9,0],1.3,2.8,pH<4.5?'#ffa94d':pH<5?'#fab005':'#94d82d',.75);
  for(let i=0;i<Math.round(HA*80);i++)s.ball([(hash(i)-.5)*2,-1.7+hash(i+5)*1.8,(hash(i+9)-.5)*1.4],.08,'#ff8787');for(let i=0;i<Math.round(A*80);i++)s.ball([(hash(i+70)-.5)*2,-1.7+hash(i+75)*1.8,(hash(i+79)-.5)*1.4],.08,'#74c0fc');s.callout([.6,-.4,.5],'HA (acetic acid)','#ff8787',60,-50);s.callout([-.6,-1,.5],'A⁻ (acetate)','#74c0fc',-60,40);s.render();tag(c,`pH = 4.76 + log(${f(A,3)}/${f(HA,3)}) = ${f(pH,2)}`,44,98,C.gold,15)},
 assumption:'1 L of solution; added acid or base reacts completely with the conjugate base or acid.'});

add({...ch(6,'Equilibrium',PH),id:'chem-solubility-product',title:'Solubility product and common ion effect',
 description:'Dissolve AgCl in water or in NaCl solution and see how the common Cl⁻ ion lowers its solubility.',
 formula:'AgCl ⇌ Ag⁺ + Cl⁻ ;  K_sp = [Ag⁺][Cl⁻] = 1.8 × 10⁻¹⁰ (298 K)',
 observe:'Adding Cl⁻ from NaCl shifts the equilibrium left, so much less AgCl dissolves.',
 tryText:'Compare the solubility of AgCl in pure water and in 0.01 M NaCl.',
 controls:[R('lc','NaCl concentration (log₁₀ M)',-7,-1,.1,-7,'',1)],
 metrics:p=>{const c0=Math.pow(10,p.lc),sv=(-c0+Math.sqrt(c0*c0+4*1.8e-10))/2;return[N('[Cl⁻] from NaCl',c0,'M',3),N('Solubility of AgCl',sv,'mol/L',3),N('In pure water',Math.sqrt(1.8e-10),'mol/L',3)]},
 draw:(c,p,t)=>{const c0=Math.pow(10,p.lc),sv=(-c0+Math.sqrt(c0*c0+4*1.8e-10))/2,s=P3.scene(c,{scale:56,cx:250,cy:290});beaker(s,[0,-1.9,0],1.3,2.8,'#e7f5ff',.75);s.lathe([0,-1.9,0],[[1.1,0],[.7,.25],[0,.35]],'#f8f9fa');const nAg=Math.round(clamp(sv/1.34e-5,0,1)*14);for(let i=0;i<nAg;i++)s.ball([(hash(i)-.5)*2,-1.3+hash(i+5)*1.4,(hash(i+9)-.5)*1.4],.08,'#ced4da',{glow:true});
  const nCl=Math.round(clamp((p.lc+7)/6,0,1)*24);for(let i=0;i<nCl+nAg;i++)s.ball([(hash(i+50)-.5)*2,-1.3+hash(i+55)*1.4,(hash(i+59)-.5)*1.4],.08,'#40c057');s.callout([.7,-1.75,0],'undissolved AgCl (white)','#f8f9fa',60,40);s.callout([0,-.6,.6],'Ag⁺ (grey) · Cl⁻ (green)','#e9f6ff',-70,-50);s.render();tag(c,`solubility = ${f(sv,3)} mol/L`,44,98,C.gold,15)},
 assumption:'Ideal solution, activities equal to concentrations.'});

/* 7 Redox */
const OXN=[['KMnO₄','Mn',7],['K₂Cr₂O₇','Cr',6],['H₂SO₄','S',6],['HNO₃','N',5],['NH₃','N',-3],['H₂O₂','O',-1],['OF₂','O',2],['Na₂S₂O₃','S',2],['Fe₃O₄','Fe',8/3]];
add({...ch(7,'Redox Reactions',IN),id:'chem-oxidation-number',title:'Finding oxidation numbers',
 description:'Pick a compound and see how the oxidation number of the central element is found from the rules.',
 formula:'Sum of oxidation numbers = charge ;  H = +1, O = −2 (except peroxides and OF₂), alkali metals = +1, F = −1',
 observe:'Oxidation numbers can be fractional as averages (Fe₃O₄ gives +8/3); in H₂O₂ oxygen is −1 and in OF₂ it is +2.',
 tryText:'Work out the oxidation number of Cr in K₂Cr₂O₇ before checking.',
 controls:[R('i','Compound',1,9,1,1)],
 metrics:p=>{const [cmp,el,v]=OXN[p.i-1];return[N('Compound',cmp),N('Element',el),N('Oxidation number',Number.isInteger(v)?(v>0?'+':'')+v:'+8/3 (average)')]},
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:42,cx:300,cy:300,pitch:.4,yaw:-.2});bars(s,OXN.map(([cmp,el,v])=>[cmp,v+3]),p.i-1,'#b197fc',.35,v=>`ox. no. ${f(v-3,2)}`);s.seg([-3.4,3*.35,.5],[3.4,3*.35,.5],'#ffd43b',1.5,[4,4]);s.engrave([-3.6,3*.35+.15,.5],'0','#ffd43b',10,9e5);s.render();tag(c,'bar height = oxidation number (dashed line = zero)',44,98,C.muted,13)},
 assumption:'Standard IUPAC rules for assigning oxidation numbers.'});

/* 8 Organic basics */
const PENT=[['n-Pentane',36.1],['2-Methylbutane (isopentane)',27.7],['2,2-Dimethylpropane (neopentane)',9.5]];
add({...ch(8,'Organic Chemistry – Some Basic Principles and Techniques','ORGANIC CHEMISTRY'),id:'chem-chain-isomers',title:'Chain isomers of pentane (C₅H₁₂)',
 description:'Compare the three structural isomers of C₅H₁₂ and their boiling points.',
 formula:'Same molecular formula, different carbon skeleton',
 observe:'More branching gives a more compact molecule with less surface contact, so the boiling point falls.',
 tryText:'Which isomer is a gas just above room temperature?',
 controls:[R('i','Isomer',1,3,1,1)],
 metrics:p=>[N('Isomer',PENT[p.i-1][0]),N('Formula','C₅H₁₂'),N('Boiling point',PENT[p.i-1][1],'°C',1)],
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:62,cx:250,yaw:t*.25,pitch:.3}),sk={1:[[-1.6,0,0],[-.8,.45,0],[0,0,0],[.8,.45,0],[1.6,0,0]],2:[[-1.2,0,0],[-.4,.45,0],[.4,0,0],[1.2,.45,0],[-.4,1.3,0]],3:[[0,0,0],[.85,.3,0],[-.85,.3,0],[0,-.5,.8],[0,-.5,-.8]]}[p.i],links={1:[[0,1],[1,2],[2,3],[3,4]],2:[[0,1],[1,2],[2,3],[1,4]],3:[[0,1],[0,2],[0,3],[0,4]]}[p.i];
  links.forEach(([a,b])=>bond(s,sk[a],sk[b]));sk.forEach(q=>atom(s,q,'C'));s.callout(sk[p.i===3?0:1],`${PENT[p.i-1][0]} — b.p. ${PENT[p.i-1][1]} °C`,'#ffd43b',60,-70);s.render();tag(c,'grey: carbon skeleton (hydrogens omitted)',44,98,C.muted,13)},
 assumption:'Boiling points at 1 atm.'});

/* 9 Hydrocarbons */
add({...ch(9,'Hydrocarbons','ORGANIC CHEMISTRY'),id:'chem-markovnikov',title:'Markovnikov and anti-Markovnikov addition',
 description:'Add HBr to propene with or without peroxide and see where the bromine ends up.',
 formula:'CH₃–CH=CH₂ + HBr → CH₃–CHBr–CH₃ (Markovnikov) ;  with peroxide → CH₃–CH₂–CH₂Br',
 observe:'Without peroxide H adds to the carbon that already has more H atoms (via the more stable 2° carbocation); peroxide reverses this by a free-radical path (Kharasch effect).',
 tryText:'Switch on peroxide. Which product forms now?',
 controls:[S('per','Conditions','no',[['no','HBr alone'],['yes','HBr + peroxide']]),R('prog','Progress',0,100,1,100,'%')],
 metrics:p=>[N('Major product',p.per==='no'?'2-Bromopropane':'1-Bromopropane'),N('Rule',p.per==='no'?'Markovnikov':'Anti-Markovnikov (peroxide effect)'),N('Intermediate',p.per==='no'?'2° carbocation':'2° free radical')],
 draw:(c,p,t)=>{const q=p.prog/100,s=P3.scene(c,{scale:62,cx:250,pitch:.3,yaw:.3}),C1=[-1.2,0,0],C2=[0,.4,0],C3=[1.2,0,0];bond(s,C1,C2);bond(s,C2,C3,q<.5?2:1);[C1,C2,C3].forEach(x=>atom(s,x,'C'));
  const brT=p.per==='no'?C2:C3,hT=p.per==='no'?C3:C2,br=V.add(V.mul([1.5,2.2,0],1-q),V.mul(V.add(brT,[0,.95,.3]),q)),h=V.add(V.mul([2.6,1.2,0],1-q),V.mul(V.add(hT,[0,-.9,.3]),q));atom(s,br,'Br');atom(s,h,'H');if(q>.9){bond(s,brT,br);bond(s,hT,h)}
  s.callout(br,'Br','#c2410c',40,-40);s.callout(C1,'CH₃','#e9f6ff',-50,-40);s.render();tag(c,q>.9?(p.per==='no'?'2-Bromopropane (Markovnikov)':'1-Bromopropane (anti-Markovnikov)'):'adding across the C=C bond',44,98,C.gold,15)},
 assumption:'Product shown is the major one; hydrogens on carbon omitted.'});

add({...ch(9,'Hydrocarbons','ORGANIC CHEMISTRY'),id:'chem-benzene-resonance',title:'Benzene: resonance and equal bonds',
 description:'Flip between the two Kekulé structures and the resonance hybrid of benzene.',
 formula:'C–C (single) 154 pm, C=C (double) 134 pm, benzene C–C 139 pm',
 observe:'All six C–C bonds in benzene are equal (139 pm): the π electrons are delocalised over the ring.',
 tryText:'Compare the bond lengths in a Kekulé structure with the hybrid.',
 controls:[S('v','View','hybrid',[['k1','Kekulé structure I'],['k2','Kekulé structure II'],['hybrid','Resonance hybrid']])],
 metrics:p=>[N('C–C bond length',p.v==='hybrid'?'139 pm (all six)':'154 / 134 pm alternating (hypothetical)'),N('π electrons','6, delocalised'),N('Resonance energy','≈ 150 kJ/mol')],
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:66,cx:250,pitch:.5,yaw:t*.2}),ring=Array.from({length:6},(_,i)=>{const a=TAU*i/6;return[1.1*Math.cos(a),0,1.1*Math.sin(a)]});ring.forEach((q,i)=>{const nx=ring[(i+1)%6],dbl=p.v==='hybrid'?1:((i+(p.v==='k2'?1:0))%2===0)?2:1;bond(s,q,nx,dbl);atom(s,q,'C');const h=V.mul(q,1.85);bond(s,q,h);atom(s,h,'H')});
  if(p.v==='hybrid'){s.ring([0,.18,0],[0,1,0],.7,'#ffd43b',3,[6,4]);s.ring([0,-.18,0],[0,1,0],.7,'#ffd43b',3,[6,4]);s.callout([.7,.18,0],'delocalised π cloud','#ffd43b',60,-60)}s.render();tag(c,p.v==='hybrid'?'Resonance hybrid: six equal bonds':'Kekulé structure (one contributor)',44,98,C.gold,15)},
 assumption:'Bond lengths from X-ray and electron-diffraction data.'});

done();
})();
