/* Chemistry pack 2 — NCERT Class 12 (rationalised), chapters 1–10. */
(() => {
'use strict';
const {R,S,N,f,clamp,cycle,tag,chart,pack,PI,TAU,C}=window.PhysicaLab;
const P3=window.Physica3D,V=P3.vec,{atom,bond,beaker,hash}=window.PhysicaChem,{add,done}=pack();
const ch=(no,chapter,group)=>({grade:12,chapterNo:no,chapter,group,subject:'chemistry'});
const PH='PHYSICAL CHEMISTRY',IN='INORGANIC CHEMISTRY',OR='ORGANIC CHEMISTRY';
const particles=(s,n,box,col,r=.07,seed=0,t=0)=>{for(let i=0;i<n;i++)s.ball([box[0]+(hash(i+seed)-.5)*box[3]+.05*Math.sin(t*2+i),box[1]+(hash(i+seed+31)-.5)*box[4],box[2]+(hash(i+seed+67)-.5)*box[5]],r,col,{flat:true})};

/* ---------- 1 Solutions ---------- */
add({...ch(1,'Solutions',PH),id:'chem-raoult',title:'Raoult’s law: vapour pressure of a mixture',
 description:'Mix benzene and toluene and see how the total and partial vapour pressures depend on the mole fraction.',
 formula:'p_A = x_A p°_A ;  p_total = x_A p°_A + x_B p°_B',
 observe:'For an ideal solution the total vapour pressure varies linearly between the two pure liquids.',
 tryText:'What is the total vapour pressure of an equimolar mixture?',
 controls:[R('x','Mole fraction of benzene',0,1,.01,.5,'',2)],
 metrics:p=>{const pb=p.x*95.1,pt=(1-p.x)*28.4;return[N('p (benzene)',pb,'mm Hg',1),N('p (toluene)',pt,'mm Hg',1),N('Total vapour pressure',pb+pt,'mm Hg',1),N('Benzene in vapour',pb/(pb+pt)*100,'%',1)]},
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:56,cx:230,cy:290}),pb=p.x*95.1,pt=(1-p.x)*28.4;s.lathe([0,-1.8,0],[[.05,0],[1.2,.2],[1.3,1.2],[.6,2.4],[.25,2.7],[.25,3.2]],'#e9f6ff',{alpha:.14});s.cyl([0,-1.3,0],[0,1,0],1.15,.9,'#fff3bf',{alpha:.45});
  particles(s,Math.round(pb/6),[0,.4,0,1.6,1.4,1.4],'#ffd43b',.08,0,t);particles(s,Math.round(pt/6),[0,.4,0,1.6,1.4,1.4],'#ff8787',.08,90,t);s.callout([.9,-1.3,0],'liquid mixture','#fff3bf',50,40);s.callout([.5,.9,0],'vapour above liquid','#e9f6ff',60,-50);s.render();
  chart(c,420,96,236,170,{title:'Vapour pressure (mm Hg) vs x(benzene)',xl:'x',xmin:0,xmax:1,ymin:0,ymax:100,series:[{fn:x=>x*95.1+(1-x)*28.4,col:C.gold},{fn:x=>x*95.1,col:'#ffd43b',dash:[4,4]},{fn:x=>(1-x)*28.4,col:'#ff8787',dash:[4,4]}],marker:[p.x,pb+pt]});tag(c,'yellow: benzene · red: toluene molecules in the vapour',44,98,C.muted,13)},
 assumption:'Ideal solution; pure-liquid vapour pressures at 298 K: benzene 95.1, toluene 28.4 mm Hg.'});

const SOL={glucose:['Glucose',1,180],urea:['Urea',1,60],NaCl:['Sodium chloride',2,58.5],CaCl2:['Calcium chloride',3,111]};
add({...ch(1,'Solutions',PH),id:'chem-colligative',title:'Colligative properties: boiling and freezing point',
 description:'Dissolve a solute in 1 kg of water and see the boiling point rise and the freezing point fall.',
 formula:'ΔT_b = i K_b m ;  ΔT_f = i K_f m ;  water: K_b = 0.52, K_f = 1.86 K kg mol⁻¹',
 observe:'The change depends on the number of solute particles, not on their kind — NaCl gives about twice the effect of glucose.',
 tryText:'Dissolve 0.5 mol of NaCl and of glucose. Compare the freezing points.',
 controls:[S('sol','Solute','NaCl',Object.keys(SOL).map(k=>[k,SOL[k][0]])),R('m','Molality',0,2,.05,.5,'mol/kg',2)],
 metrics:p=>{const i=SOL[p.sol][1],tb=.52*i*p.m,tf=1.86*i*p.m;return[N('van ’t Hoff factor i',i,'',0),N('Boiling point',100+tb,'°C',2),N('Freezing point',-tf,'°C',2),N('Mass of solute (1 kg water)',p.m*SOL[p.sol][2],'g',1)]},
 draw:(c,p,t)=>{const i=SOL[p.sol][1],s=P3.scene(c,{scale:56,cx:230,cy:290});beaker(s,[0,-1.8,0],1.3,3,'#74c0fc',.7);const n=Math.round(p.m*10);for(let k=0;k<n;k++){const q=[(hash(k)-.5)*2,-1.6+hash(k+11)*1.8,(hash(k+23)-.5)*1.5];if(i===1)s.ball(q,.1,'#ffd43b');else{s.ball(q,.09,'#9775fa');for(let j=1;j<i;j++)s.ball(V.add(q,[.25*j,.1,0]),.1,'#40c057')}}
  s.cyl([1.7,-.3,0],[0,1,0],.07,3.4,'#e9f6ff',{alpha:.4});s.cyl([1.7,-1.9,0],[0,1,0],.13,.25,'#fa5252');s.cyl([1.7,-1.75+clamp(.52*i*p.m,0,4)*.35+.6,0],[0,1,0],.04,clamp(.52*i*p.m,0,4)*.7+1.2,'#fa5252');s.callout([1.7,1.2,0],`b.p. ${f(100+.52*i*p.m,2)} °C`,'#ff8787',30,-40);
  s.callout([0,-1,.6],i===1?`${SOL[p.sol][0]} molecules (i = 1)`:`ions: i = ${i}`,'#e9f6ff',-80,-50);s.render();tag(c,`f.p. ${f(-1.86*i*p.m,2)} °C   ·   b.p. ${f(100+.52*i*p.m,2)} °C`,44,98,C.gold,15)},
 assumption:'Dilute ideal solutions with complete dissociation of electrolytes (ideal i).'});

/* ---------- 2 Electrochemistry ---------- */
add({...ch(2,'Electrochemistry',PH),id:'chem-daniell-cell',title:'Daniell cell and the Nernst equation',
 description:'Change the concentrations of Zn²⁺ and Cu²⁺ and read the cell voltage.',
 formula:'E_cell = E°_cell − (0.0591/2) log([Zn²⁺]/[Cu²⁺]) ;  E°_cell = 1.10 V',
 observe:'Electrons flow from zinc (anode, oxidation) to copper (cathode, reduction); the salt bridge keeps the solutions neutral.',
 tryText:'Make [Cu²⁺] 100 times smaller than [Zn²⁺]. By how much does the voltage fall?',
 controls:[R('zn','[Zn²⁺]',.001,2,.001,1,'M',3),R('cu','[Cu²⁺]',.001,2,.001,1,'M',3)],
 metrics:p=>{const E=1.10-.0591/2*Math.log10(p.zn/p.cu);return[N('E°cell',1.10,'V',2),N('E cell',E,'V',3),N('ΔG = −nFE',-2*96485*E/1000,'kJ/mol',1),N('Anode / cathode','Zn (−) / Cu (+)')]},
 draw:(c,p,t)=>{const E=1.10-.0591/2*Math.log10(p.zn/p.cu),s=P3.scene(c,{scale:50,cx:300,cy:300});beaker(s,[-1.8,-2,0],1,2.4,'#e9ecef',.7);beaker(s,[1.8,-2,0],1,2.4,'#4dabf7',.7);s.box([-1.8,-.6,0],[.35,2.4,.08],'#adb5bd');s.box([1.8,-.6,0],[.35,2.4,.08],'#d9844a');
  s.tube([[-1.3,-1.2,0],[-1.3,.4,0],[1.3,.4,0],[1.3,-1.2,0]],.13,'#fff3bf',{alpha:.7,segs:10});s.tube([[-1.8,.6,0],[-1.8,1.6,0],[-.4,1.6,0]],.03,'#495057',{segs:5});s.tube([[1.8,.6,0],[1.8,1.6,0],[.4,1.6,0]],.03,'#495057',{segs:5});s.box([0,1.6,0],[.8,.6,.3],'#212529');s.engrave([0,1.6,.16],`${f(E,3)} V`,'#69db7c',13,9e5);
  const q=cycle(t*.4,1);for(let k=0;k<3;k++){const u=(q+k/3)%1;s.ball(u<.5?[-1.8+0*u,1.6,0].map((v,j)=>j===0?-1.8+u*2*1.4:v):[-.4+(u-.5)*2*2.2,1.6,0],.06,'#ffd43b',{flat:true,glow:true})}
  s.arrow([-1.2,2.1,0],[1.2,2.1,0],'#ffd43b',2.5,8,'e⁻ flow');s.callout([-1.8,0,.05],'Zn anode (−): Zn → Zn²⁺ + 2e⁻','#ced4da',-40,-70);s.callout([1.8,0,.05],'Cu cathode (+): Cu²⁺ + 2e⁻ → Cu','#e8590c',40,-70);s.callout([0,.4,0],'salt bridge (KCl)','#fff3bf',40,40);s.render()},
 assumption:'298 K, activities taken equal to molar concentrations.'});

const MET={Cu:['Copper',63.5,2],Ag:['Silver',107.9,1],Al:['Aluminium',27.0,3]};
add({...ch(2,'Electrochemistry',PH),id:'chem-faraday-electrolysis',title:'Electrolysis and Faraday’s laws',
 description:'Pass a current through a solution and calculate the mass of metal deposited at the cathode.',
 formula:'m = M I t / (n F) ;  F = 96 485 C mol⁻¹',
 observe:'The mass deposited is proportional to the charge passed; for the same charge, metals deposit in the ratio of their M/n.',
 tryText:'Pass 2 A for 30 minutes through CuSO₄. How much copper is deposited?',
 controls:[S('met','Metal ion','Cu',Object.keys(MET).map(k=>[k,MET[k][0]])),R('I','Current',.1,5,.1,2,'A',1),R('t','Time',1,120,1,30,'min')],
 metrics:p=>{const [n0,M,n]=MET[p.met],Q=p.I*p.t*60;return[N('Charge passed',Q,'C',0),N('Moles of electrons',Q/96485,'mol',4),N('Mass deposited',M*Q/(n*96485),'g',3)]},
 draw:(c,p,t)=>{const [n0,M,n]=MET[p.met],m=M*p.I*p.t*60/(n*96485),s=P3.scene(c,{scale:56,cx:260,cy:300});beaker(s,[0,-2,0],1.6,2.6,p.met==='Cu'?'#4dabf7':'#e9ecef',.7);s.box([-.9,-.8,0],[.3,2.4,.6],'#868e96');s.box([.9,-.8,0],[.3+clamp(m*.05,0,.4),2.4,.6+clamp(m*.05,0,.4)],p.met==='Cu'?'#d9844a':p.met==='Ag'?'#dee2e6':'#ced4da');
  s.box([0,1.3,0],[1,.5,.5],'#212529');s.tube([[-.9,.4,0],[-.9,1.3,0],[-.5,1.3,0]],.03,'#e03131',{segs:5});s.tube([[.9,.4,0],[.9,1.3,0],[.5,1.3,0]],.03,'#343a40',{segs:5});for(let k=0;k<8;k++){const u=cycle(t*.5+k/8,1);s.ball([-.7+u*1.4,-1.4+hash(k)*1.6,(hash(k+4)-.5)*.6],.07,'#69db7c',{flat:true})}
  s.callout([-.9,0,.3],'anode (+)','#ff8787',-50,-50);s.callout([.9,0,.3],`cathode (−): ${f(m,3)} g ${n0.toLowerCase()} deposited`,'#e9f6ff',40,-60);s.callout([0,-1,.3],`${p.met}${['','⁺','²⁺','³⁺'][n]} ions move to the cathode`,'#69db7c',50,50);s.render();tag(c,`m = ${M} × ${p.I} × ${p.t*60} / (${n} × 96485) = ${f(m,3)} g`,44,98,C.gold,14)},
 assumption:'100 % current efficiency; only metal deposition occurs at the cathode.'});

/* ---------- 3 Chemical Kinetics ---------- */
const conc=(o,k,A0,t)=>o===0?Math.max(0,A0-k*t):o===1?A0*Math.exp(-k*t):1/(1/A0+k*t);
add({...ch(3,'Chemical Kinetics',PH),id:'chem-reaction-order',title:'Order of reaction and half-life',
 description:'Compare how the concentration of a reactant falls for zero-, first- and second-order reactions.',
 formula:'zero: [A] = [A]₀ − kt ;  first: [A] = [A]₀e^(−kt), t½ = 0.693/k ;  second: 1/[A] = 1/[A]₀ + kt',
 observe:'Only for a first-order reaction is the half-life independent of the starting concentration.',
 tryText:'Double [A]₀ for each order and see what happens to t½.',
 controls:[R('o','Order',0,2,1,1),R('k','Rate constant k',.01,.5,.01,.1,'',2),R('A0','[A]₀',.2,2,.1,1,'M',1),R('tt','Time',0,60,1,10,'s')],
 metrics:p=>{const A=conc(p.o,p.k,p.A0,p.tt),half=p.o===0?p.A0/(2*p.k):p.o===1?.693/p.k:1/(p.k*p.A0);return[N('[A] now',A,'M',3),N('Half-life t½',half,'s',2),N('Units of k',['mol L⁻¹ s⁻¹','s⁻¹','L mol⁻¹ s⁻¹'][p.o])]},
 draw:(c,p,t)=>{const A=conc(p.o,p.k,p.A0,p.tt),s=P3.scene(c,{scale:56,cx:220});s.box([0,0,0],[3,2.4,1.8],'#e9f6ff',{alpha:.07});const nA=Math.round(A/2*40),nP=Math.round((p.A0-A)/2*40);particles(s,nA,[0,0,0,2.8,2.2,1.6],'#4dabf7',.09,0,t);particles(s,nP,[0,0,0,2.8,2.2,1.6],'#ffa94d',.09,200,t);s.callout([1.5,1.2,0],`[A] = ${f(A,3)} M`,'#4dabf7',30,-40);s.render();
  chart(c,420,96,236,170,{title:'[A] vs time',xl:'t (s)',xmin:0,xmax:60,ymin:0,ymax:2.05,series:[{fn:x=>conc(p.o,p.k,p.A0,x),col:C.gold}],marker:[p.tt,A]});tag(c,'blue: reactant A · orange: product',44,98,C.muted,13)},
 assumption:'Single reactant A → products at constant temperature.'});

add({...ch(3,'Chemical Kinetics',PH),id:'chem-arrhenius',title:'Arrhenius equation and activation energy',
 description:'Change the temperature and activation energy and see how many molecules have enough energy to react.',
 formula:'k = A e^(−Eₐ/RT) ;  log(k₂/k₁) = Eₐ/(2.303R) · (1/T₁ − 1/T₂)',
 observe:'A 10 K rise near room temperature roughly doubles the rate for Eₐ ≈ 50 kJ/mol, because many more molecules cross the barrier.',
 tryText:'Set Eₐ = 50 kJ/mol and compare 298 K with 308 K.',
 controls:[R('Ea','Activation energy Eₐ',10,150,1,50,'kJ/mol'),R('T','Temperature',250,500,1,298,'K')],
 metrics:p=>{const fr=Math.exp(-p.Ea*1000/(8.314*p.T)),r10=Math.exp(p.Ea*1000/8.314*(1/p.T-1/(p.T+10)));return[N('Fraction with E ≥ Eₐ',fr,'',3),N('Rate rise for +10 K',r10,'×',2)]},
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:56,cx:230,cy:300}),h=clamp(p.Ea/150*2.6,.3,2.6),path=Array.from({length:41},(_,i)=>{const x=-2.4+4.8*i/40;return[x,-1.4+h*Math.exp(-x*x*1.4)-.4*(x>0?Math.min(1,x):0),0]});s.tube(path,.06,'#868e96',{segs:6});
  const fr=Math.exp(-p.Ea*1000/(8.314*p.T)),n=12;for(let i=0;i<n;i++){const hot=hash(i)<Math.min(1,fr*1e3**(p.Ea>60?0:0))||i<Math.round(clamp(Math.log10(fr*1e12)/12,0,1)*n*.6),u=hot?cycle(t*.3+i/n,1):.08+.1*Math.sin(t*3+i),q=path[clamp(Math.round(u*40),0,40)];s.ball(V.add(q,[0,.15,(hash(i+5)-.5)*.6]),.1,hot?'#ff6b6b':'#4dabf7',{flat:true})}
  s.arrow([0,-1.4,0],[0,-1.4+h,0],'#ffd43b',2.5,8,`Eₐ = ${p.Ea} kJ/mol`);s.callout(path[4],'reactants','#e9f6ff',-20,-60);s.callout(path[38],'products','#e9f6ff',20,50);s.render();
  chart(c,420,96,236,170,{title:'ln k vs 1/T (×1000)',xl:'1000/T',xmin:2,xmax:4,ymin:-60,ymax:0,series:[{fn:x=>-p.Ea*x/8.314,col:C.gold}],marker:[1000/p.T,-p.Ea*1000/(8.314*p.T)]})},
 assumption:'Arrhenius behaviour with temperature-independent A and Eₐ; red molecules are those shown crossing the barrier (illustrative count).'});

/* ---------- 4 The d- and f-Block Elements ---------- */
const ION={'Sc3+':[0,'#f8f9fa','colourless'],'Ti3+':[1,'#9c36b5','purple'],'V3+':[2,'#2f9e44','green'],'Cr3+':[3,'#7048e8','violet'],'Mn2+':[5,'#ffdeeb','pale pink'],'Fe2+':[6,'#c0eb75','pale green'],'Fe3+':[5,'#fab005','yellow'],'Co2+':[7,'#f06595','pink'],'Ni2+':[8,'#40c057','green'],'Cu2+':[9,'#1c7ed6','blue'],'Zn2+':[10,'#f8f9fa','colourless']};
add({...ch(4,'The d- and f-Block Elements',IN),id:'chem-transition-ions',title:'Colour and magnetism of 3d ions',
 description:'Choose a 3d transition-metal ion and see its colour in water, its d-electron count and spin-only magnetic moment.',
 formula:'μ = √(n(n + 2)) BM  (n = number of unpaired electrons)',
 observe:'Ions with partly filled d orbitals are coloured and paramagnetic; d⁰ and d¹⁰ ions (Sc³⁺, Zn²⁺) are colourless and diamagnetic.',
 tryText:'Which ion has the largest magnetic moment?',
 controls:[S('ion','Ion','Cu2+',Object.keys(ION).map(k=>[k,k.replace('2+','²⁺').replace('3+','³⁺')]))],
 metrics:p=>{const [d,,col]=ION[p.ion],n=d<=5?d:10-d;return[N('d electrons',`3d${'⁰¹²³⁴⁵⁶⁷⁸⁹'[d]||'¹⁰'}`),N('Unpaired electrons',n,'',0),N('Spin-only μ',Math.sqrt(n*(n+2)),'BM',2),N('Colour in water',col)]},
 draw:(c,p,t)=>{const [d,col]=ION[p.ion],n=d<=5?d:10-d,s=P3.scene(c,{scale:56,cx:240,cy:290});beaker(s,[-1.4,-1.9,0],1,2.6,col,.75);atom(s,[-1.4,-.8,0],'X',1.4,{glow:true});for(let k=0;k<6;k++){const u=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]][k],q=V.add([-1.4,-.8,0],V.mul(u,.55));atom(s,q,'O',.7)}
  for(let b=0;b<5;b++){const x=.8+b*.55;s.box([x,.6,0],[.48,.4,.1],'#29475b',{stroke:'#42d9ca66'});const e=b<Math.min(d,5)?1:0,e2=b<Math.max(0,d-5)?1:0;if(e)s.arrow([x-.1,.45,.08],[x-.1,.75,.08],'#ffd43b',2.5,6);if(e2)s.arrow([x+.1,.75,.08],[x+.1,.45,.08],'#74c0fc',2.5,6)}
  s.callout([.8,.85,0],'3d orbitals','#e9f6ff',-20,-50);s.callout([-1.4,-.8,.5],`[M(H₂O)₆]ⁿ⁺ — ${ION[p.ion][2]}`,col==='#f8f9fa'?'#e9f6ff':col,-60,60);s.render();tag(c,n?`${n} unpaired → paramagnetic`:'all paired → diamagnetic',44,98,n?C.gold:C.mint,15)},
 assumption:'High-spin aqua ions; colours as listed in NCERT for aqueous solutions.'});

/* ---------- 5 Coordination Compounds ---------- */
add({...ch(5,'Coordination Compounds',IN),id:'chem-crystal-field',title:'Crystal field splitting in octahedral complexes',
 description:'Set the d-electron count and the splitting Δₒ compared with the pairing energy P to get high- or low-spin complexes.',
 formula:'CFSE = (−0.4 n(t₂g) + 0.6 n(e_g)) Δₒ ;  absorbed λ (nm) ≈ 10⁷ / Δₒ (cm⁻¹)',
 observe:'Strong-field ligands (Δₒ > P) give low-spin complexes; weak-field ligands (Δₒ < P) give high-spin complexes.',
 tryText:'For d⁶, compare Δₒ < P with Δₒ > P. How many unpaired electrons in each?',
 controls:[R('d','d electrons',1,10,1,6),R('D','Δₒ',10000,35000,500,20300,'cm⁻¹'),R('P','Pairing energy P',10000,30000,500,19000,'cm⁻¹')],
 metrics:p=>{const r=cf(p);return[N('Spin state',p.d>=4&&p.d<=7?(r.low?'Low spin':'High spin'):'(only one arrangement)'),N('Configuration',`t₂g${'⁰¹²³⁴⁵⁶'[r.t]} e_g${'⁰¹²³⁴'[r.e]}`),N('Unpaired electrons',r.u,'',0),N('CFSE',(-.4*r.t+.6*r.e),'Δₒ',1),N('Light absorbed',1e7/p.D,'nm',0)]},
 draw:(c,p,t)=>{const r=cf(p),s=P3.scene(c,{scale:54,cx:260,cy:280,yaw:t*.2});atom(s,[-1.6,0,0],'X',1.3);for(const u of[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]]){const q=V.add([-1.6,0,0],V.mul(u,1));bond(s,[-1.6,0,0],q);atom(s,q,'N',.9)}
  const gap=clamp(p.D/35000*2.4,.4,2.4),yt=-.4*gap,ye=.6*gap;const box=(x,y,k,dn)=>{s.box([x,y,0],[.45,.06,.25],'#42d9ca');if(k)s.arrow([x-.08,y-.22,.1],[x-.08,y+.22,.1],'#ffd43b',2.5,6);if(dn)s.arrow([x+.08,y+.22,.1],[x+.08,y-.22,.1],'#74c0fc',2.5,6)};
  const up=(n,cap)=>Math.min(n,cap),dn=(n,cap)=>Math.max(0,n-cap);for(let b=0;b<3;b++)box(.9+b*.6,yt,b<up(r.t,3),b<dn(r.t,3));for(let b=0;b<2;b++)box(1.2+b*.6,ye,b<up(r.e,2),b<dn(r.e,2));
  s.label([.3,yt,0],'t₂g',C.mint,13);s.label([.6,ye,0],'e_g',C.mint,13);s.arrow([2.9,yt,0],[2.9,ye,0],'#ff8787',2,7,'Δₒ');s.callout([-1.6,1,0],'ligand','#91a7ff',-40,-40);s.render();tag(c,`d${p.d}: ${r.low?'low':'high'}-spin, ${r.u} unpaired`,44,98,C.gold,15)},
 assumption:'Octahedral complexes; spin state decided by comparing Δₒ with a single pairing energy P.'});
function cf(p){const d=p.d,low=p.D>p.P;let t,e;if(low){t=Math.min(6,d);e=d-t}else{if(d<=3){t=d;e=0}else if(d<=5){t=3;e=d-3}else if(d<=8){t=d-2;e=2}else{t=6;e=d-6}}const u=(t<=3?t:6-t)+(e<=2?e:4-e);return{t,e,u,low:low&&d>=4&&d<=7}}

/* ---------- 6 Haloalkanes and Haloarenes ---------- */
const SUBST={methyl:['CH₃Br (methyl)',30,0],primary:['CH₃CH₂Br (1°)',1,.0001],secondary:['(CH₃)₂CHBr (2°)',.02,.01],tertiary:['(CH₃)₃CBr (3°)',.0001,1]};
add({...ch(6,'Haloalkanes and Haloarenes',OR),id:'chem-sn1-sn2',title:'SN2 and SN1 substitution',
 description:'Watch OH⁻ attack a bromoalkane from the back (SN2) and compare relative rates for methyl to tertiary substrates.',
 formula:'SN2: rate = k[RX][Nu⁻] (one step, inversion) ;  SN1: rate = k[RX] (carbocation, racemisation)',
 observe:'SN2 slows from methyl to tertiary because of crowding; SN1 speeds up because tertiary carbocations are most stable.',
 tryText:'Choose the tertiary bromide. Which mechanism wins?',
 controls:[S('sub','Substrate','methyl',Object.keys(SUBST).map(k=>[k,SUBST[k][0]])),R('prog','Reaction progress',0,100,1,50,'%')],
 metrics:p=>{const [n,s2,s1]=SUBST[p.sub];return[N('Relative SN2 rate',s2,'',4),N('Relative SN1 rate',s1,'',4),N('Main mechanism',s2>s1?'SN2 (inversion)':'SN1 (racemisation)')]},
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:62,cx:260,yaw:.3,pitch:.2}),q=p.prog/100,umb=1-2*q,C0=[0,0,0],sub=p.sub;atom(s,C0,'C',1);const R=['methyl','primary','secondary','tertiary'].indexOf(sub);
  for(let i=0;i<3;i++){const a=TAU*i/3,pos=[-.38*umb,.95*Math.cos(a),.95*Math.sin(a)];bond(s,C0,pos);atom(s,pos,i<R?'C':'H',i<R?.9:1)}
  const br=[.95+q*1.5,0,0],nu=[-2.6+q*1.65,0,0];bond(s,C0,br,1,q>.5?'#495057':'#ced4da',q>.5?.03:.06);atom(s,br,'Br');bond(s,C0,nu,1,q<.5?'#495057':'#ced4da',q<.5?.03:.06);atom(s,nu,'O');atom(s,V.add(nu,[-.45,.25,0]),'H',.9);
  s.callout(nu,'OH⁻ attacks from the back','#ff8787',-40,-60);s.callout(br,q>.6?'Br⁻ leaves':'C–Br bond breaking','#c2410c',40,-60);s.callout([-.38*umb,.95,0],q>.5?'configuration inverted (umbrella flips)':'groups flatten at the transition state','#e9f6ff',-30,70);s.render();tag(c,`${SUBST[sub][0]}: SN2 rel. ${SUBST[sub][1]} · SN1 rel. ${SUBST[sub][2]}`,44,98,C.gold,14)},
 assumption:'Relative rates are approximate orders of magnitude for teaching; the animation shows the SN2 pathway.'});

/* ---------- 7 Alcohols, Phenols and Ethers ---------- */
const BP=[['Methanol',64.7,'Ethane',-89],['Ethanol',78.3,'Propane',-42],['Propan-1-ol',97.2,'Butane',-0.5],['Butan-1-ol',117.7,'Pentane',36.1]];
add({...ch(7,'Alcohols, Phenols and Ethers',OR),id:'chem-alcohol-hbond',title:'Hydrogen bonding and boiling points of alcohols',
 description:'Compare the boiling points of alcohols with alkanes of similar molecular mass and see the hydrogen bonds.',
 formula:'O–H···O hydrogen bonds hold alcohol molecules together',
 observe:'Alcohols boil much higher than alkanes of similar mass; the boiling point also rises with chain length.',
 tryText:'How many carbons give an alcohol boiling above 100 °C?',
 controls:[R('n','Carbon atoms in the alcohol',1,4,1,2)],
 metrics:p=>{const [a,ba,k,bk]=BP[p.n-1];return[N(a,ba,'°C',1),N(`${k} (similar mass)`,bk,'°C',1),N('Difference',ba-bk,'°C',1)]},
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:50,cx:280,pitch:.35,yaw:t*.15}),mol=(o,ang)=>{const cs=[];for(let i=0;i<p.n;i++){const q=V.add(o,[Math.cos(ang)*(.0+i*.6),.25*(i%2),Math.sin(ang)*i*.6]);cs.push(q);atom(s,q,'C',.8);if(i)bond(s,cs[i-1],q)}const O=V.add(cs[0],[-.45*Math.cos(ang),-.35,-.45*Math.sin(ang)]);bond(s,cs[0],O);atom(s,O,'O',.85);const H=V.add(O,[-.3,-.25,0]);atom(s,H,'H',.8);return{O,H}};
  const ms=[mol([-1.6,.6,0],0),mol([.3,-1.0,.4],1.2),mol([1.6,.9,-.6],2.6),mol([-1.2,-1.4,-.8],-.8)];for(let i=0;i<ms.length;i++){const a=ms[i].H,b=ms[(i+1)%ms.length].O;s.seg(a,b,'#69db7c',2,[4,4])}s.callout(V.mul(V.add(ms[0].H,ms[1].O),.5),'hydrogen bond O–H···O','#69db7c',60,-60);s.render();tag(c,`${BP[p.n-1][0]} boils at ${BP[p.n-1][1]} °C`,44,98,C.gold,15)},
 assumption:'Boiling points at 1 atm from standard tables.'});

/* ---------- 8 Aldehydes, Ketones and Carboxylic Acids ---------- */
const ACID=[['HCOOH','Formic acid',3.75],['CH₃COOH','Acetic acid',4.76],['FCH₂COOH','Fluoroacetic acid',2.59],['ClCH₂COOH','Chloroacetic acid',2.86],['Cl₂CHCOOH','Dichloroacetic acid',1.29],['Cl₃CCOOH','Trichloroacetic acid',.65],['C₆H₅COOH','Benzoic acid',4.19]];
add({...ch(8,'Aldehydes, Ketones and Carboxylic Acids',OR),id:'chem-acid-strength',title:'Strength of carboxylic acids',
 description:'Compare the pKₐ of carboxylic acids and see how electron-withdrawing groups make them stronger.',
 formula:'pKₐ = −log Kₐ ;  smaller pKₐ = stronger acid',
 observe:'Each electron-withdrawing Cl stabilises the carboxylate ion, so Cl₃CCOOH is far stronger than CH₃COOH.',
 tryText:'Put the chloroacetic acids in order of strength.',
 controls:[R('i','Acid',1,7,1,2)],
 metrics:p=>{const [fm,n,pk]=ACID[p.i-1];return[N('Acid',`${n} (${fm})`),N('pKₐ',pk,'',2),N('Kₐ',Math.pow(10,-pk),'',3),N('Strength vs acetic acid',Math.pow(10,4.76-pk),'×',1)]},
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:34,cx:300,cy:300,pitch:.4,yaw:-.2});ACID.forEach(([fm,n,pk],i)=>{const h=(5-pk)*.8,x=-3+i*1,on=i===p.i-1;s.box([x,h/2,0],[.7,h,.7],on?'#ffd43b':'#ff8787');s.engrave([x,h+.25,.36],fm,on?'#ffd43b':'#e9f6ff',9,9e5)});s.callout([-3+(p.i-1),(5-ACID[p.i-1][2])*.8,0],`pKₐ ${ACID[p.i-1][2]}`,'#ffd43b',40,-50);s.render();tag(c,'taller bar = stronger acid (bar height ∝ 5 − pKₐ)',44,98,C.muted,13)},
 assumption:'pKₐ values in water at 298 K (NCERT table).'});

/* ---------- 9 Amines ---------- */
const AM=[['NH₃','Ammonia',4.75],['CH₃NH₂','Methanamine',3.38],['(CH₃)₂NH','N-Methylmethanamine',3.27],['(CH₃)₃N','N,N-Dimethylmethanamine',4.22],['C₂H₅NH₂','Ethanamine',3.29],['(C₂H₅)₂NH','N-Ethylethanamine',3.00],['(C₂H₅)₃N','N,N-Diethylethanamine',3.25],['C₆H₅NH₂','Aniline',9.38]];
add({...ch(9,'Amines',OR),id:'chem-amine-basicity',title:'Basic strength of amines',
 description:'Compare the pK_b of ammonia, aliphatic amines and aniline in water.',
 formula:'pK_b = −log K_b ;  smaller pK_b = stronger base',
 observe:'Alkyl groups push electrons to N, making aliphatic amines stronger bases than ammonia; in water, solvation makes 2° amines strongest. Aniline is much weaker because its lone pair is delocalised into the ring.',
 tryText:'Why is (CH₃)₃N weaker than (CH₃)₂NH in water?',
 controls:[R('i','Amine',1,8,1,3)],
 metrics:p=>{const [fm,n,pk]=AM[p.i-1];return[N('Amine',`${n} (${fm})`),N('pK_b',pk,'',2),N('K_b',Math.pow(10,-pk),'',3)]},
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:32,cx:300,cy:300,pitch:.4,yaw:-.2});AM.forEach(([fm,n,pk],i)=>{const h=(10-pk)*.45,x=-3.5+i*1,on=i===p.i-1;s.box([x,h/2,0],[.7,h,.7],on?'#ffd43b':'#4dabf7');s.engrave([x,h+.25,.36],fm,on?'#ffd43b':'#e9f6ff',9,9e5)});s.callout([-3.5+(p.i-1),(10-AM[p.i-1][2])*.45,0],`pK_b ${AM[p.i-1][2]}`,'#ffd43b',40,-50);s.render();tag(c,'taller bar = stronger base (bar height ∝ 10 − pK_b)',44,98,C.muted,13)},
 assumption:'pK_b values in aqueous solution (NCERT Table 9.3).'});

/* ---------- 10 Biomolecules ---------- */
add({...ch(10,'Biomolecules','BIOMOLECULES'),id:'chem-glucose-mutarotation',title:'Glucose: ring forms and mutarotation',
 description:'Dissolve pure α- or β-D-glucose and watch the optical rotation change until the two forms reach equilibrium.',
 formula:'[α]_D: α-glucose +112°, β-glucose +18.7°, equilibrium mixture +52.7°',
 observe:'Both anomers interconvert through the open-chain form until about 36 % α and 64 % β are present.',
 tryText:'Start from β-glucose. Does the rotation rise or fall?',
 controls:[S('start','Dissolve','alpha',[['alpha','α-D-glucose'],['beta','β-D-glucose']]),R('min','Time after dissolving',0,240,1,30,'min')],
 metrics:p=>{const r=mut(p);return[N('α-anomer',r.a*100,'%',1),N('β-anomer',(1-r.a)*100,'%',1),N('Specific rotation',r.rot,'°',1)]},
 draw:(c,p,t)=>{const r=mut(p),s=P3.scene(c,{scale:56,cx:230,yaw:t*.2,pitch:.35}),ring=[];for(let i=0;i<6;i++){const a=TAU*i/6,q=[.9*Math.cos(a),.18*(i%2?1:-1),.9*Math.sin(a)];ring.push(q)}
  ring.forEach((q,i)=>{bond(s,q,ring[(i+1)%6]);atom(s,q,i===0?'O':'C',i===0?.9:.8)});const anomeric=ring[1],isA=r.a>=.5;const oh=V.add(anomeric,[.35,isA?-.6:.6,.2]);bond(s,anomeric,oh);atom(s,oh,'O',.8);atom(s,V.add(oh,[.25,isA?-.2:.2,0]),'H',.7);
  for(let i=2;i<6;i++){const q=V.add(ring[i],[V.norm(ring[i])[0]*.45,i%2?.5:-.5,V.norm(ring[i])[2]*.45]);bond(s,ring[i],q);atom(s,q,'O',.7)}const c6=V.add(ring[5],[.3,.8,-.2]);bond(s,ring[5],c6);atom(s,c6,'C',.8);
  s.callout(anomeric,`C1 (anomeric): OH ${isA?'down = α':'up = β'}`,'#ffd43b',60,-60);s.callout(ring[0],'ring O','#ff8787',-60,-40);s.render();
  chart(c,420,96,236,170,{title:'Specific rotation vs time',xl:'min',xmin:0,xmax:240,ymin:0,ymax:120,series:[{fn:m=>mut({...p,min:m}).rot,col:C.gold},{fn:()=>52.7,col:'#8ca6b9',dash:[4,4]}],marker:[p.min,r.rot]})},
 assumption:'First-order approach to equilibrium (36 % α, 64 % β) with a half-time of about 40 min at room temperature (illustrative).'});
function mut(p){const eq=.36,a0=p.start==='alpha'?1:0,a=eq+(a0-eq)*Math.exp(-p.min*.693/40);return{a,rot:112*a+18.7*(1-a)}}

done();
})();
