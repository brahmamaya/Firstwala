/* Chemistry pack 4 — more NCERT Class 12 experiments (chapters 1–10). */
(() => {
'use strict';
const {R,S,N,f,clamp,cycle,tag,chart,pack,PI,TAU,C}=window.PhysicaLab;
const P3=window.Physica3D,V=P3.vec,{atom,bond,beaker,hash}=window.PhysicaChem,{add,done}=pack();
const ch=(no,chapter,group)=>({grade:12,chapterNo:no,chapter,group,subject:'chemistry'});
const PH='PHYSICAL CHEMISTRY',IN='INORGANIC CHEMISTRY',OR='ORGANIC CHEMISTRY';
const bars=(s,list,sel,col,k,fmt)=>{list.forEach(([lab,v],i)=>{const h=Math.max(.05,v*k),x=-3.2+i*6.4/Math.max(1,list.length-1),on=i===sel;s.box([x,h/2,0],[.5,h,.5],on?'#ffd43b':col);s.engrave([x,h+.25,.3],lab,on?'#ffd43b':'#e9f6ff',9,9e5);if(on)s.callout([x,h,0],fmt(v),'#ffd43b',40,-50)})};

/* 1 Solutions */
const GAS={CO2:['CO₂',1.67],O2:['O₂',34.86],N2:['N₂',76.48]};
add({...ch(1,'Solutions',PH),id:'chem-henry-law',title:'Henry’s law: gas dissolved in a liquid',
 description:'Raise the partial pressure of a gas above water and see how much dissolves.',
 formula:'p = K_H x  (x = mole fraction of gas in solution)',
 observe:'Solubility is proportional to pressure; gases with smaller K_H (like CO₂) dissolve far more. That is why soft drinks are bottled under CO₂ pressure.',
 tryText:'Compare CO₂ and N₂ at 2 bar.',
 controls:[S('g','Gas','CO2',Object.keys(GAS).map(k=>[k,GAS[k][0]])),R('p','Partial pressure',.2,5,.1,2,'bar',1)],
 metrics:p=>{const KH=GAS[p.g][1]*1000,x=p.p/KH,mol=x*55.5/(1-x);return[N('K_H (298 K)',GAS[p.g][1],'kbar',2),N('Mole fraction x',x,'',3),N('Moles dissolved per litre',mol,'mol',4)]},
 draw:(c,p,t)=>{const x=p.p/(GAS[p.g][1]*1000),s=P3.scene(c,{scale:56,cx:250,cy:300});s.cyl([0,-.6,0],[0,1,0],1.2,3.4,'#e9f6ff',{alpha:.1});s.cyl([0,-1.3,0],[0,1,0],1.17,2,'#4dabf7',{alpha:.35});s.cyl([0,1.15-p.p*.08,0],[0,1,0],1.15,.15,'#868e96');
  for(let i=0;i<Math.round(p.p*5);i++)s.ball([(hash(i)-.5)*2,.1+hash(i+3)*.8,(hash(i+6)-.5)*1.6],.08,'#e9ecef',{flat:true});for(let i=0;i<Math.round(clamp(x*5e4,0,40));i++)s.ball([(hash(i+40)-.5)*2,-2.2+hash(i+43)*1.8,(hash(i+46)-.5)*1.6],.08,'#ffd43b',{flat:true});
  s.callout([1.15,1.15-p.p*.08,0],`piston: ${p.p} bar`,'#ced4da',50,-40);s.callout([.5,-.6,.6],`dissolved ${GAS[p.g][0]}`,'#ffd43b',60,40);s.render();tag(c,`x = p/K_H = ${f(x,3)}`,44,98,C.gold,15)},
 assumption:'Henry’s law constants for water at 298 K (NCERT table); dilute solution.'});

add({...ch(1,'Solutions',PH),id:'chem-osmosis',title:'Osmosis and osmotic pressure',
 description:'Separate a solution from pure water by a semipermeable membrane and find the pressure that stops osmosis.',
 formula:'π = i C R T ;  R = 0.0821 L atm mol⁻¹ K⁻¹',
 observe:'Water flows into the more concentrated side; applying more than π reverses the flow (reverse osmosis, used to purify water).',
 tryText:'Find π for 0.1 M glucose at 300 K. Then apply a larger pressure.',
 controls:[R('c','Concentration',.01,.5,.01,.1,'mol/L',2),R('i','van ’t Hoff factor i',1,3,1,1),R('T','Temperature',273,350,1,300,'K'),R('Pa','Applied pressure',0,30,.5,0,'atm',1)],
 metrics:p=>{const pi=p.i*p.c*.0821*p.T;return[N('Osmotic pressure π',pi,'atm',2),N('Water flow',p.Pa>pi+.01?'Out of the solution (reverse osmosis)':p.Pa<pi-.01?'Into the solution (osmosis)':'None (balanced)')]},
 draw:(c,p,t)=>{const pi=p.i*p.c*.0821*p.T,dir=Math.sign(pi-p.Pa),h=clamp(dir*.5*Math.min(1,cycle(t,6)/3),-.5,.5),s=P3.scene(c,{scale:54,cx:260,cy:300});s.tube([[-1.6,1.4,0],[-1.6,-1.2,0],[1.6,-1.2,0],[1.6,1.4,0]],.55,'#e9f6ff',{alpha:.12,segs:14});s.cyl([-1.6,-.4-h/2,0],[0,1,0],.5,2.4-h,'#d0ebff',{alpha:.45});s.cyl([1.6,-.4+h/2,0],[0,1,0],.5,2.4+h,'#74c0fc',{alpha:.5});
  s.box([0,-1.2,0],[.06,1.1,1.1],'#ffd43b',{alpha:.6});for(let i=0;i<Math.round(p.c*40*p.i);i++)s.ball([1.6+(hash(i)-.5)*.7,-1+hash(i+5)*2,(hash(i+9)-.5)*.7],.06,'#9775fa',{flat:true});for(let i=0;i<5;i++){const u=cycle(t*.4+i/5,1),x=dir>=0?-.6+u*1.2:.6-u*1.2;s.ball([x,-1.2,(i-2)*.15],.05,'#4dabf7',{flat:true,glow:true})}
  if(p.Pa>0)s.arrow([1.6,2.3,0],[1.6,1.6+h/2,0],'#ff8787',3,9,`${p.Pa} atm`);s.callout([0,-1.2,.55],'semipermeable membrane','#ffd43b',-40,60);s.callout([1.6,.4,.5],'solution','#9775fa',60,-40);s.callout([-1.6,.4,.5],'pure water','#d0ebff',-60,-40);s.render();tag(c,`π = ${p.i} × ${p.c} × 0.0821 × ${p.T} = ${f(pi,2)} atm`,44,98,C.gold,14)},
 assumption:'Dilute ideal solution; the height change is illustrative.'});

/* 2 Electrochemistry */
add({...ch(2,'Electrochemistry',PH),id:'chem-molar-conductivity',title:'Molar conductivity: strong vs weak electrolytes',
 description:'Change the concentration and compare how the molar conductivity of KCl and acetic acid changes.',
 formula:'Strong: Λₘ = Λ°ₘ − A√c ;  weak: Λₘ = α Λ°ₘ (α from Kₐ)',
 observe:'Λₘ of KCl falls only slightly with √c, but acetic acid rises steeply on dilution because it ionises more.',
 tryText:'Dilute acetic acid from 0.1 M to 0.001 M. By what factor does Λₘ rise?',
 controls:[R('lc','Concentration (log₁₀ M)',-4,-.5,.05,-2,'',2)],
 metrics:p=>{const c0=Math.pow(10,p.lc),kcl=149.9-87.5*Math.sqrt(c0),K=1.8e-5,a=(-K+Math.sqrt(K*K+4*K*c0))/(2*c0);return[N('Concentration',c0,'M',4),N('Λₘ (KCl)',kcl,'S cm² mol⁻¹',1),N('α (acetic acid)',a,'',3),N('Λₘ (acetic acid)',a*390.5,'S cm² mol⁻¹',1)]},
 draw:(c,p,t)=>{const c0=Math.pow(10,p.lc),K=1.8e-5,a=(-K+Math.sqrt(K*K+4*K*c0))/(2*c0),s=P3.scene(c,{scale:50,cx:230,cy:300});for(const [x,col,ions] of[[-1.4,'#d0ebff',1],[1.4,'#e9f6ff',a]]){beaker(s,[x,-1.9,0],.9,2.4,col,.7);s.box([x-.35,-.8,0],[.08,1.6,.6],'#868e96');s.box([x+.35,-.8,0],[.08,1.6,.6],'#868e96');for(let i=0;i<Math.round(ions*16);i++){const u=cycle(t*.5+i/16,1);s.ball([x-.3+u*.6,-1.7+hash(i)*1.4,(hash(i+4)-.5)*.6],.06,i%2?'#ff8787':'#74c0fc',{flat:true})}for(let i=0;i<Math.round((1-ions)*10);i++)s.ball([x+(hash(i+30)-.5)*1.2,-1.7+hash(i+33)*1.4,(hash(i+36)-.5)*.8],.08,'#adb5bd',{flat:true})}
  s.callout([-1.4,-.2,.5],'KCl: fully ionised','#74c0fc',-50,-50);s.callout([1.4,-.2,.5],`CH₃COOH: ${f(a*100,1)} % ionised`,'#ced4da',40,-50);s.render();
  chart(c,420,96,236,170,{title:'Λₘ vs √c',xl:'√c',xmin:0,xmax:.6,ymin:0,ymax:400,series:[{fn:x=>149.9-87.5*x,col:C.mint},{fn:x=>{const cc=Math.max(1e-6,x*x),aa=(-K+Math.sqrt(K*K+4*K*cc))/(2*cc);return aa*390.5},col:C.gold}],marker:[Math.sqrt(c0),a*390.5]})},
 assumption:'Λ°ₘ: KCl 149.9, CH₃COOH 390.5 S cm² mol⁻¹ (298 K); Kohlrausch constant A ≈ 87.5 for KCl; Kₐ = 1.8 × 10⁻⁵.'});

/* 3 Kinetics */
add({...ch(3,'Chemical Kinetics',PH),id:'chem-catalyst',title:'How a catalyst speeds up a reaction',
 description:'Add a catalyst that lowers the activation energy and compare the rates at the same temperature.',
 formula:'k_cat / k = e^(ΔEₐ / RT)',
 observe:'A catalyst provides a path with lower Eₐ; it does not change ΔH or the position of equilibrium.',
 tryText:'Lower Eₐ by 20 kJ/mol at 298 K. How many times faster is the reaction?',
 controls:[R('Ea','Uncatalysed Eₐ',40,150,1,100,'kJ/mol'),R('dE','Lowering by catalyst',0,60,1,20,'kJ/mol'),R('T','Temperature',250,500,1,298,'K')],
 metrics:p=>{const r=Math.exp(p.dE*1000/(8.314*p.T));return[N('Catalysed Eₐ',Math.max(1,p.Ea-p.dE),'kJ/mol',0),N('Rate increase',r,'×',3),N('ΔH and K','unchanged')]},
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:54,cx:260,cy:300}),k=2.6/150,prof=(E)=>Array.from({length:41},(_,i)=>{const x=-2.6+5.2*i/40;return[x,-1.4+E*k*Math.exp(-x*x*1.2)-.5*(x>0?Math.min(1,x/1.5):0),0]});s.tube(prof(p.Ea),.05,'#ff8787',{segs:6});s.tube(prof(Math.max(1,p.Ea-p.dE)).map(q=>[q[0],q[1],.3]),.05,'#69db7c',{segs:6});
  s.arrow([0,-1.4,.6],[0,-1.4+p.Ea*k,.6],'#ff8787',2,7,`Eₐ ${p.Ea}`);s.arrow([.25,-1.4,.6],[.25,-1.4+Math.max(1,p.Ea-p.dE)*k,.6],'#69db7c',2,7,`with catalyst ${Math.max(1,p.Ea-p.dE)}`);s.callout([-2.4,-1.4,0],'reactants','#e9f6ff',-20,-50);s.callout([2.5,-1.9,0],'products (ΔH same)','#e9f6ff',20,50);s.render();tag(c,`rate × ${f(Math.exp(p.dE*1000/(8.314*p.T)),3)} at ${p.T} K`,44,98,C.gold,15)},
 assumption:'Same pre-exponential factor with and without the catalyst.'});

/* 4 d- and f-block */
const LN=[['La',103.2],['Ce',101],['Pr',99],['Nd',98.3],['Pm',97],['Sm',95.8],['Eu',94.7],['Gd',93.8],['Tb',92.3],['Dy',91.2],['Ho',90.1],['Er',89],['Tm',88],['Yb',86.8],['Lu',86.1]];
add({...ch(4,'The d- and f-Block Elements',IN),id:'chem-lanthanoid-contraction',title:'Lanthanoid contraction',
 description:'Step across the lanthanoids and see the steady decrease in the size of Ln³⁺ ions.',
 formula:'4f electrons shield poorly → effective nuclear charge rises → ions shrink',
 observe:'The radius falls from La³⁺ (103 pm) to Lu³⁺ (86 pm); as a result Zr and Hf of the next row are almost the same size.',
 tryText:'How much smaller is Lu³⁺ than La³⁺?',
 controls:[R('i','Ion',1,15,1,1)],
 metrics:p=>{const [e,r]=LN[p.i-1];return[N('Ion',`${e}³⁺`),N('4f electrons',p.i-1,'',0),N('Ionic radius',r,'pm',1),N('Shrinkage from La³⁺',103.2-r,'pm',1)]},
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:40,cx:300,pitch:.35});LN.forEach(([e,r],i)=>{const x=-4.2+i*.6,on=i===p.i-1;s.ball([x,0,0],r/103.2*.27,on?'#ffd43b':'#b197fc',{spec:.6});s.engrave([x,-.55,0],e,on?'#ffd43b':'#e9f6ff',9,9e5)});s.callout([-4.2+(p.i-1)*.6,LN[p.i-1][1]/103.2*.27,0],`${LN[p.i-1][0]}³⁺: ${LN[p.i-1][1]} pm`,'#ffd43b',40,-60);s.render();tag(c,'ball size ∝ Ln³⁺ radius',44,98,C.muted,13)},
 assumption:'Shannon effective ionic radii, coordination number 6.'});

/* 5 Coordination compounds */
add({...ch(5,'Coordination Compounds',IN),id:'chem-geometric-isomers',title:'Geometrical isomers of complexes',
 description:'Compare cis and trans [Co(NH₃)₄Cl₂]⁺ and fac and mer [Co(NH₃)₃Cl₃].',
 formula:'cis: same ligands at 90° ;  trans: at 180° ;  fac: three on one face ;  mer: three around a meridian',
 observe:'cis-[Co(NH₃)₄Cl₂]⁺ is violet and trans is green: the same formula, different arrangement and properties.',
 tryText:'In fac-[Co(NH₃)₃Cl₃], what is the angle between any two Cl ligands?',
 controls:[S('iso','Isomer','trans',[['cis','cis-[Co(NH₃)₄Cl₂]⁺'],['trans','trans-[Co(NH₃)₄Cl₂]⁺'],['fac','fac-[Co(NH₃)₃Cl₃]'],['mer','mer-[Co(NH₃)₃Cl₃]']])],
 metrics:p=>[N('Isomer',{cis:'cis (Cl at 90°)',trans:'trans (Cl at 180°)',fac:'facial',mer:'meridional'}[p.iso]),N('Colour',{cis:'violet',trans:'green',fac:'—',mer:'—'}[p.iso]),N('Coordination number',6,'',0)],
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:66,cx:250,yaw:t*.3,pitch:.3}),D=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]],cl={cis:[0,2],trans:[2,3],fac:[0,2,4],mer:[0,1,2]}[p.iso];atom(s,[0,0,0],'Cu',1.2);
  D.forEach((u,i)=>{const q=V.mul(u,1.3),isCl=cl.includes(i);bond(s,[0,0,0],q);atom(s,q,isCl?'Cl':'N',isCl?1:.9);if(!isCl)for(let k=0;k<3;k++){const a=TAU*k/3;atom(s,V.add(q,V.add(V.mul(u,.28),[.18*Math.cos(a)*(u[0]?0:1),.18*Math.sin(a)*(u[1]?0:1),.18*Math.cos(a)*(u[2]?0:1)])),'H',.55)}});
  s.callout(V.mul(D[cl[0]],1.3),'Cl⁻','#40c057',50,-50);s.callout([0,0,0],'Co³⁺','#d9844a',-60,60);s.render();tag(c,{cis:'cis: Cl–Co–Cl 90°',trans:'trans: Cl–Co–Cl 180°',fac:'fac: three Cl on one face',mer:'mer: three Cl in one plane'}[p.iso],44,98,C.gold,15)},
 assumption:'Ideal octahedral geometry; NH₃ hydrogens drawn schematically.'});

/* 6 Haloalkanes */
add({...ch(6,'Haloalkanes and Haloarenes',OR),id:'chem-chirality',title:'Chirality and enantiomers',
 description:'Compare a chiral molecule with its mirror image and try to superimpose them.',
 formula:'A carbon with four different groups is a stereocentre; its mirror images are enantiomers',
 observe:'Enantiomers cannot be superimposed and rotate plane-polarised light equally in opposite directions, e.g. (+)- and (−)-butan-2-ol (±13.5°).',
 tryText:'Rotate the right-hand molecule. Can you make it match the left one?',
 controls:[R('rot','Rotate the mirror image',0,360,5,0,'°')],
 metrics:p=>[N('Molecule','Bromochlorofluoromethane (CHBrClF)'),N('Stereocentre','1 carbon with H, F, Cl, Br'),N('Superimposable?','No — enantiomers')],
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:60,cx:300,pitch:.2}),g=[['H',[0,1,0]],['F',[.94,-.33,0]],['Cl',[-.47,-.33,.82]],['Br',[-.47,-.33,-.82]]],mol=(o,mirror,ang)=>{atom(s,o,'C');g.forEach(([el,u])=>{let v=mirror?[-u[0],u[1],u[2]]:u;const ca=Math.cos(ang),sa=Math.sin(ang);v=[v[0]*ca+v[2]*sa,v[1],-v[0]*sa+v[2]*ca];const q=V.add(o,V.mul(v,1.05));bond(s,o,q);atom(s,q,el)})};
  mol([-1.6,0,0],false,0);mol([1.6,0,0],true,p.rot*PI/180);s.box([0,0,0],[.04,2.6,1.8],'#a5d8ff',{alpha:.25});s.callout([0,1.1,.9],'mirror plane','#a5d8ff',40,-40);s.callout([-1.6,0,0],'stereocentre C*','#e9f6ff',-60,60);s.render();tag(c,'non-superimposable mirror images',44,98,C.gold,15)},
 assumption:'Ideal tetrahedral geometry.'});

/* 7 Alcohols, phenols, ethers */
const PHEN=[['Ethanol',15.9],['Phenol',10.0],['o-Cresol',10.2],['m-Nitrophenol',8.3],['o-Nitrophenol',7.2],['p-Nitrophenol',7.1],['Picric acid',.71]];
add({...ch(7,'Alcohols, Phenols and Ethers',OR),id:'chem-phenol-acidity',title:'Acidity of phenols',
 description:'Compare the pKₐ of ethanol, phenol and substituted phenols.',
 formula:'smaller pKₐ = stronger acid ;  –NO₂ at o/p stabilises phenoxide by resonance',
 observe:'Phenol is far more acidic than ethanol; nitro groups at ortho and para positions increase acidity more than at meta; picric acid is almost as strong as a mineral acid.',
 tryText:'Why is m-nitrophenol less acidic than p-nitrophenol?',
 controls:[R('i','Compound',1,7,1,2)],
 metrics:p=>{const [n,pk]=PHEN[p.i-1];return[N('Compound',n),N('pKₐ',pk,'',2),N('Kₐ',Math.pow(10,-pk),'',3)]},
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:34,cx:300,cy:300,pitch:.4,yaw:-.2});bars(s,PHEN.map(([n,pk])=>[n,16.5-pk]),p.i-1,'#ff8787',.2,v=>`pKₐ ${f(16.5-v,2)}`);s.render();tag(c,'taller bar = stronger acid (height ∝ 16.5 − pKₐ)',44,98,C.muted,13)},
 assumption:'pKₐ values in water at 298 K (NCERT Table 7.4).'});

/* 8 Aldehydes and ketones */
const CARB=[['HCHO (methanal)',3,'smallest groups, most reactive'],['CH₃CHO (ethanal)',2,'one methyl group'],['CH₃COCH₃ (propanone)',1,'two methyl groups: most hindered']];
add({...ch(8,'Aldehydes, Ketones and Carboxylic Acids',OR),id:'chem-nucleophilic-addition',title:'Nucleophilic addition to the carbonyl group',
 description:'Watch CN⁻ attack the carbonyl carbon and compare how reactive methanal, ethanal and propanone are.',
 formula:'R₂C=O + HCN → R₂C(OH)CN (cyanohydrin)',
 observe:'Aldehydes are more reactive than ketones: alkyl groups crowd the carbonyl carbon and push electrons into it, making it less positive.',
 tryText:'Which compound reacts fastest with HCN?',
 controls:[R('i','Carbonyl compound',1,3,1,2),R('prog','Progress',0,100,1,40,'%')],
 metrics:p=>[N('Compound',CARB[p.i-1][0]),N('Relative reactivity',['','low','medium','high'][CARB[p.i-1][1]]),N('Reason',CARB[p.i-1][2])],
 draw:(c,p,t)=>{const q=p.prog/100,s=P3.scene(c,{scale:62,cx:250,pitch:.3,yaw:.3}),Cc=[0,0,0],O=[0,1.15,0];bond(s,Cc,O,q<.5?2:1);atom(s,Cc,'C');atom(s,O,'O');const g=p.i===1?['H','H']:p.i===2?['C','H']:['C','C'];
  [[-1,-.6,0],[1,-.6,0]].forEach((u,k)=>{const r=V.mul(u,1);bond(s,Cc,r);atom(s,r,g[k]==='C'?'C':'H',g[k]==='C'?1:1)});const nu=[0,-.3,2.4-q*1.4];atom(s,nu,'C',.9);atom(s,V.add(nu,[0,0,.45]),'N',.9);bond(s,nu,V.add(nu,[0,0,.45]),3);if(q>.6){bond(s,Cc,nu);atom(s,V.add(O,[.3,.35,0]),'H',.8)}
  s.callout(Cc,'δ+ carbonyl carbon','#e9f6ff',-70,40);s.callout(nu,'CN⁻ nucleophile','#4c6ef5',50,50);s.callout(O,q>.6?'O becomes –OH':'δ− oxygen','#ff8787',40,-50);s.render();tag(c,`${CARB[p.i-1][0]}: ${CARB[p.i-1][2]}`,44,98,C.gold,14)},
 assumption:'Schematic mechanism (attack, then protonation); hydrogens on methyl groups omitted.'});

/* 9 Amines */
add({...ch(9,'Amines',OR),id:'chem-hinsberg-test',title:'Hinsberg test for amines',
 description:'Treat a primary, secondary or tertiary amine with benzenesulphonyl chloride and then with KOH.',
 formula:'RNH₂ / R₂NH + C₆H₅SO₂Cl → sulphonamide + HCl',
 observe:'1°: the sulphonamide dissolves in alkali (acidic N–H); 2°: it is insoluble in alkali; 3°: no reaction.',
 tryText:'Which amine gives a precipitate that stays undissolved in KOH?',
 controls:[S('a','Amine','p',[['p','Primary (ethanamine)'],['s','Secondary (N-ethylethanamine)'],['t','Tertiary (N,N-diethylethanamine)']])],
 metrics:p=>[N('Reaction with C₆H₅SO₂Cl',p.a==='t'?'No reaction':'Forms a sulphonamide'),N('In KOH',{p:'Dissolves (clear solution)',s:'Insoluble precipitate',t:'— (amine unchanged)'}[p.a]),N('Reason',{p:'N–H on sulphonamide is acidic',s:'no H left on N',t:'no H on N to replace'}[p.a])],
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:56,cx:250,cy:300});beaker(s,[0,-1.9,0],1.1,2.6,p.a==='p'?'#d0ebff':p.a==='s'?'#e9ecef':'#e7f5ff',.7);if(p.a==='s')for(let i=0;i<40;i++)s.ball([(hash(i)-.5)*1.8,-1.85+hash(i+3)*.3,(hash(i+6)-.5)*1.6],.06,'#f8f9fa',{flat:true});
  s.callout([0,-.5,.6],{p:'clear: sulphonamide dissolved in KOH',s:'white precipitate stays',t:'no reaction'}[p.a],'#e9f6ff',60,-50);s.render();tag(c,{p:'Primary amine',s:'Secondary amine',t:'Tertiary amine'}[p.a],44,98,C.gold,15)},
 assumption:'Hinsberg’s reagent: benzenesulphonyl chloride; observations as in NCERT.'});

/* 10 Biomolecules */
add({...ch(10,'Biomolecules','BIOMOLECULES'),id:'chem-zwitterion',title:'Amino acids as zwitterions',
 description:'Change the pH and see how the charge on glycine changes; find its isoelectric point.',
 formula:'H₃N⁺–CH₂–COOH ⇌ H₃N⁺–CH₂–COO⁻ ⇌ H₂N–CH₂–COO⁻ ;  pI = (pKₐ₁ + pKₐ₂)/2 = 5.97',
 observe:'At the isoelectric point glycine exists mainly as a neutral zwitterion and does not move in an electric field.',
 tryText:'Set pH = 2 and pH = 11. What is the net charge in each case?',
 controls:[R('pH','pH',0,14,.1,6,'',1)],
 metrics:p=>{const z=charge(p.pH);return[N('Net charge',z,'',2),N('Main form',p.pH<2.34?'cation (H₃N⁺–CH₂–COOH)':p.pH>9.6?'anion (H₂N–CH₂–COO⁻)':'zwitterion (H₃N⁺–CH₂–COO⁻)'),N('Isoelectric point',5.97,'',2)]},
 draw:(c,p,t)=>{const z=charge(p.pH),s=P3.scene(c,{scale:62,cx:240,pitch:.3,yaw:.3}),N0=[-1.3,0,0],Ca=[0,.4,0],Cc=[1.3,0,0],O1=[1.9,.9,0],O2=[1.9,-.8,0];bond(s,N0,Ca);bond(s,Ca,Cc);bond(s,Cc,O1,2);bond(s,Cc,O2);[[N0,'N'],[Ca,'C'],[Cc,'C'],[O1,'O'],[O2,'O']].forEach(([q,e])=>atom(s,q,e));
  const nH=p.pH<9.6?3:2;for(let k=0;k<nH;k++){const a=TAU*k/3;atom(s,V.add(N0,[-.5,.4*Math.cos(a),.4*Math.sin(a)]),'H',.8)}if(p.pH<2.34)atom(s,V.add(O2,[.4,-.3,0]),'H',.8);
  if(p.pH<9.6)s.callout(N0,'–NH₃⁺','#4c6ef5',-60,-50);else s.callout(N0,'–NH₂','#4c6ef5',-60,-50);s.callout(O2,p.pH<2.34?'–COOH':'–COO⁻','#ff8787',50,50);s.render();
  chart(c,420,96,236,170,{title:'Net charge vs pH',xl:'pH',xmin:0,xmax:14,ymin:-1.1,ymax:1.1,series:[{fn:charge,col:C.gold},{fn:()=>0,col:'#8ca6b9',dash:[4,4]}],marker:[p.pH,z]})},
 assumption:'Glycine pKₐ₁ = 2.34 (–COOH), pKₐ₂ = 9.60 (–NH₃⁺) at 298 K.'});
function charge(pH){return 1/(1+Math.pow(10,pH-2.34))-1/(1+Math.pow(10,9.6-pH))}

done();
})();
