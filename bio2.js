/* Biology pack 2 — NCERT Class 11, chapters 8–13 (20 experiments).
   Facts follow the rationalised NCERT Biology textbook; kinetic curves are standard teaching models. */
(() => {
'use strict';
const {R,S,N,f,clamp,rad,deg,cycle,tag,chart,pack,PI,TAU,C}=window.PhysicaLab;
const P3=window.Physica3D,V=P3.vec,{BC,hash,critter,leaf,cell,capsule,chromosome,helix}=window.PhysicaBio,{add,done}=pack();
const U3='CELL: STRUCTURE AND FUNCTIONS',U4='PLANT PHYSIOLOGY';
const ch=(no,chapter,group)=>({grade:11,chapterNo:no,chapter,group});
const smooth=x=>x*x*(3-2*x);

/* ---------- Chapter 8: Cell: The Unit of Life ---------- */
const ORG={nucleus:['Double membrane (nuclear envelope with pores)','Both','Contains chromatin (DNA); controls the cell'],mito:['Double membrane; inner folds = cristae','Both','Site of aerobic respiration — “power house”; has own DNA and 70S ribosomes'],chloro:['Double membrane; thylakoids stacked as grana','Plant only','Photosynthesis; has own DNA and 70S ribosomes'],
  er:['Single membrane network','Both','RER (with ribosomes): proteins; SER: lipids (steroids)'],golgi:['Single-membrane flat cisternae','Both','Packages materials; forms glycoproteins and glycolipids'],ribo:['No membrane (RNA + protein)','Both','Protein synthesis; 80S in eukaryotes (60S + 40S)'],
  vacuole:['Single membrane (tonoplast)','Large in plants','Stores sap; up to 90% of plant cell volume'],lyso:['Single membrane','Animal (mainly)','Hydrolytic enzymes, active at acidic pH'],centro:['No membrane; two centrioles (9 triplet microtubules)','Animal only','Forms spindle poles in cell division'],wall:['Rigid, non-living layer','Plant only','Cellulose, hemicellulose, pectins; gives shape and protection']};
add({...ch(8,'Cell: The Unit of Life',U3),id:'bio-cell-explorer',title:'3D cell explorer',
 description:'Fly around an animal or plant cell and highlight each organelle to learn its structure and job.',
 formula:'Eukaryotic cell = plasma membrane + cytoplasm + membrane-bound organelles + nucleus',
 observe:'Plant cells have a cell wall, chloroplasts and a large central vacuole; animal cells have centrioles.',
 tryText:'Select chloroplast while viewing an animal cell — what happens?',
 controls:[S('type','Cell','plant',[['plant','Plant cell'],['animal','Animal cell']]),S('org','Highlight organelle','mito',Object.keys(ORG).map(k=>[k,{nucleus:'Nucleus',mito:'Mitochondrion',chloro:'Chloroplast',er:'Endoplasmic reticulum',golgi:'Golgi apparatus',ribo:'Ribosomes',vacuole:'Vacuole',lyso:'Lysosome',centro:'Centrosome',wall:'Cell wall'}[k]]))],
 metrics:p=>{const d=ORG[p.org],present=!(p.type==='animal'&&(p.org==='chloro'||p.org==='wall'))&&!(p.type==='plant'&&p.org==='centro');return[N('Present in this cell?',present?'Yes':'No'),N('Structure',d[0]),N('Found in',d[1]),N('Function',d[2])]},
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:60,yaw:.2}),pl=p.type==='plant',hi=k=>p.org===k,g=(k,col)=>hi(k)?'#ffe066':col;
  if(pl){s.box([0,0,0],[4.6,2.9,2.9],g('wall','#69db7c'),{alpha:hi('wall')?.35:.15});s.mesh([0,0,0],[2.2,1.35,1.35],BC.membrane,{alpha:.12});s.mesh([.3,0,0],[1.3,.85,.85],g('vacuole','#9ad1f0'),{alpha:hi('vacuole')?.55:.3});for(let i=0;i<6;i++){const a=TAU*i/6;s.mesh([1.5*Math.cos(a)*.9,1.05*Math.sin(a),.9*Math.sin(a+1)],[.3,.16,.16],g('chloro',BC.chloroplast),{rot:[0,a,.4],rings:8,segs:12});}}
  else{s.mesh([0,0,0],[2.2,1.6,1.6],BC.membrane,{alpha:.18,shape:(u,v)=>1+.05*Math.sin(3*v+u*2)});s.cyl([.9,.9,.4],[1,0,0],.06,.4,g('centro','#ced4da'));s.cyl([.9,.9,.4],[0,0,1],.06,.4,g('centro','#ced4da'));for(let i=0;i<4;i++)s.ball([-1+hash(i)*.6,-.6+hash(i+2)*.4,.8*hash(i+5)],.13,g('lyso','#e599f7'))}
  const nx=pl?-1.3:-.3;s.mesh([nx,.1,0],.62,g('nucleus',BC.nucleus),{rings:12,segs:16});s.ball([nx+.15,.25,.35],.15,BC.nucleolus,{lift:.5});
  for(let i=0;i<4;i++){const q=[(pl?-.5:.6)+(i%2)*.7,-.6+Math.floor(i/2)*.9,(i%2?.6:-.5)];s.mesh(q,[.32,.13,.15],g('mito',BC.mito),{rot:[0,i,.3],rings:8,segs:12})}
  for(let k=0;k<4;k++){const pts=Array.from({length:14},(_,i)=>[nx+.7+i*.06,.6-k*.14+.05*Math.sin(i*1.3+k),-.6+.08*k]);s.tube(pts,.035,g('er',BC.er),{segs:6})}
  for(let k=0;k<4;k++)s.mesh([pl?-.3:.2,-1+k*.12+(pl?.2:0),.75],[.4-k*.04,.035,.18],g('golgi',BC.golgi),{rings:4,segs:12,shape:(u,v)=>1+.15*Math.cos(v)});
  for(let i=0;i<40;i++)s.ball([(hash(i)-.5)*3,(hash(i+40)-.5)*2,(hash(i+80)-.5)*2].map((v,k)=>v*(pl?.85:.8)),.035,g('ribo',BC.ribosome),{flat:true});s.render();
  tag(c,'yellow: highlighted organelle',44,98,'#ffe066',13)},
 assumption:'Organelles enlarged and simplified for visibility; numbers and positions vary greatly between cells.'});

add({...ch(8,'Cell: The Unit of Life',U3),id:'bio-surface-volume',title:'Why cells are small: surface area to volume',
 description:'Split a large cube into many smaller cubes of the same total volume and compare the surface available for exchange.',
 formula:'Cube of side L: SA/V = 6/L',
 observe:'Halving the side doubles the surface area for the same total volume — small cells exchange materials faster.',
 tryText:'Split the cube into 4 × 4 × 4 pieces. How does the total surface area change?',
 controls:[R('L','Side of large cube',2,10,1,8,'μm'),R('n','Cuts per edge',1,5,1,2)],
 metrics:p=>{const l=p.L/p.n,cnt=p.n**3;return[N('Small cubes',cnt,'',0),N('Total volume',p.L**3,'μm³',0),N('Total surface area',6*l*l*cnt,'μm²',0),N('SA / V',6/l,'per μm',2)]},
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:56,pitch:.4}),Ls=2.6,n=p.n,l=Ls/n,gap=.12*smooth(.5+.5*Math.sin(t*1.2));for(let i=0;i<n;i++)for(let j=0;j<n;j++)for(let k=0;k<n;k++){const q=[(i-(n-1)/2)*(l+gap),(j-(n-1)/2)*(l+gap),(k-(n-1)/2)*(l+gap)];s.box(q,[l*.98,l*.98,l*.98],['#f783ac','#ff8fab','#faa2c1'][(i+j+k)%3])}s.render();
  chart(c,470,96,186,140,{title:'SA:V vs side',xl:'side (μm)',xmin:.4,xmax:10,ymin:0,ymax:8,series:[{fn:x=>6/x,col:C.gold}],marker:[p.L/p.n,6/(p.L/p.n)]})},
 assumption:'Cubes used for simple geometry; for a sphere SA/V = 3/r — the same trend.'});

add({...ch(8,'Cell: The Unit of Life',U3),id:'bio-fluid-mosaic',title:'Fluid mosaic model of the membrane',
 description:'Zoom into the plasma membrane: a lipid bilayer with proteins floating in it. Warm it up and watch the lipids move.',
 formula:'Lipid bilayer + integral and peripheral proteins (Singer and Nicolson, 1972)',
 observe:'Polar heads face the watery outside and cytoplasm; non-polar tails point inwards. Proteins can drift sideways.',
 tryText:'Raise the temperature and watch lateral movement increase.',
 controls:[R('temp','Temperature',5,45,1,37,'°C'),S('show','Show proteins','yes',[['yes','Yes'],['no','No']])],
 metrics:p=>[N('Model','Fluid mosaic'),N('Lipid arrangement','Polar heads outside, hydrophobic tails inside'),N('Human RBC membrane','≈ 52% protein, 40% lipid'),N('Lateral movement',p.temp>30?'High':p.temp>15?'Moderate':'Low')],
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:56,pitch:.35}),jig=.02+p.temp*.0025;for(let i=0;i<12;i++)for(let j=0;j<6;j++){const x=-3+i*.52+Math.sin(t*2+i*3+j)*jig*4,z=-1.4+j*.52+Math.cos(t*1.7+i+j*2)*jig*4;if(p.show==='yes'&&((i===3&&j===2)||(i===8&&j===3)))continue;
   for(const sg of[1,-1]){s.ball([x,sg*.62,z],.13,'#ff8787');s.seg([x-.04,sg*.5,z],[x-.06,sg*.12,z],'#ffd43b',2);s.seg([x+.04,sg*.5,z],[x+.06+Math.sin(t*5+i)*jig*2,sg*.12,z],'#ffd43b',2)}}
  if(p.show==='yes'){s.mesh([-3+3*.52,0,-1.4+2*.52],[.4,1.05,.4],'#5c7cfa',{shape:(u,v)=>1+.1*Math.sin(4*v)});s.mesh([-3+8*.52,.75,-1.4+3*.52],[.45,.25,.4],'#b197fc');for(let k=0;k<4;k++)s.ball([-3+3*.52+.15*Math.cos(k*1.6),1.15+.12*k,-1.4+2*.52+.1*Math.sin(k)],.08,'#69db7c',{flat:true});s.label([-1.5,1.6,-.4],'integral protein (glycoprotein)',C.blue,12);s.label([1.2,1.25,.2],'peripheral protein',C.purple,12)}
  s.render();tag(c,'red: polar heads   yellow: fatty-acid tails',44,98,C.muted,13)},
 assumption:'Molecules not to scale; cholesterol and carbohydrate chains simplified.'});

const SIZES=[['Mycoplasma (smallest cell)',.3,'#82c91e'],['Bacterium',4,'#94d82d'],['Human RBC',7,'#e03131']];
add({...ch(8,'Cell: The Unit of Life',U3),id:'bio-cell-sizes',title:'How big are cells?',
 description:'Compare the smallest cells (Mycoplasma), bacteria and a human red blood cell, drawn to the same scale.',
 formula:'1 μm = 10⁻⁶ m',
 observe:'Mycoplasma is only about 0.3 μm long, bacteria 3–5 μm and a human RBC about 7 μm across.',
 tryText:'Zoom out: how many Mycoplasma cells would fit across one RBC?',
 controls:[R('zoom','Zoom (μm across view)',1,20,.5,10,'μm',1)],
 metrics:p=>[N('Mycoplasma',.3,'μm',1),N('Bacteria','3–5 μm'),N('Human RBC',7,'μm',1),N('RBC ÷ Mycoplasma',7/.3,'×',0),N('Largest isolated cell','Ostrich egg')],
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:56,pitch:.25}),su=6/p.zoom,gap=.35,W=.3*su+4*su+7*su+2*gap,x0=-W/2;s.ball([x0+.15*su,0,0],Math.max(.02,.15*su),'#82c91e');const bx=x0+.3*su+gap;capsule(s,[bx+.5*su,0,0],[bx+3.5*su,0,0],.5*su,'#94d82d');
  s.mesh([bx+4*su+gap+3.5*su,0,0],[3.5*su,.9*su,3.5*su],'#e03131',{rot:[PI/2,0,0],shape:(u,v)=>1-.25*Math.exp(-(u*u)*4),rings:14,segs:24});s.render();
  const pxPerUm=su*56*1.15*P3.cam.zoom;c.save();c.strokeStyle='#e9f6ff';c.lineWidth=2;c.beginPath();c.moveTo(80,400);c.lineTo(80+pxPerUm,400);c.stroke();c.restore();tag(c,'1 μm',80+pxPerUm/2,388,C.white,12,'center');tag(c,'left: Mycoplasma · centre: bacterium · right: RBC',44,98,C.muted,13)},
 assumption:'Sizes from NCERT Chapter 8; the RBC is drawn as a flattened disc and the bacterium as a 4 μm rod.'});

/* ---------- Chapter 9: Biomolecules ---------- */
add({...ch(9,'Biomolecules',U3),id:'bio-enzyme-kinetics',title:'Enzyme action and competitive inhibition',
 description:'Raise the substrate concentration and see the reaction rate level off. Add a competitive inhibitor and compare.',
 formula:'v = V_max[S] / (K_m + [S]) ;  competitive: K_m(app) = K_m(1 + [I]/K_i)',
 observe:'A competitive inhibitor resembles the substrate and competes for the active site; enough substrate can outcompete it.',
 tryText:'Add inhibitor, then raise [S] a lot. Does V_max change?',
 controls:[R('S','Substrate concentration [S]',0,50,.5,10,'mM',1),R('Km','Michaelis constant K_m',1,20,.5,5,'mM',1),R('Vmax','Maximum rate V_max',10,100,5,60,'μmol/min'),R('I','Competitive inhibitor [I]',0,20,.5,0,'mM',1)],
 metrics:p=>{const Ka=p.Km*(1+p.I/2),v=p.Vmax*p.S/(Ka+p.S);return[N('Reaction rate v',v,'μmol/min',1),N('Fraction of V_max',v/p.Vmax*100,'%',0),N('Apparent K_m',Ka,'mM',1),N('Example','Malonate inhibits succinic dehydrogenase')]},
 draw:(c,p,t)=>{const Ka=p.Km*(1+p.I/2),v=p.Vmax*p.S/(Ka+p.S),s=P3.scene(c,{scale:58,cx:230}),ph=cycle(t*v/p.Vmax*1.2+.1,1);s.mesh([0,0,0],[1.1,.9,.9],'#748ffc',{shape:(u,v2)=>1-.45*Math.exp(-((u-1.1)**2*3+(v2-PI/2)**2*2))});
  const occ=p.I>0&&hash(Math.floor(t))<p.I/(p.I+p.S+1e-9);s.ball([0,.65-(occ?0:.25*Math.min(1,ph*3)),.2],.22,occ?'#fa5252':'#ffd43b');if(!occ&&ph>.5){s.ball([.6+ph,.9+ph*.6,.2],.15,'#69db7c');s.ball([-.6-ph,.9+ph*.6,.2],.15,'#69db7c')}
  for(let i=0;i<Math.min(24,Math.round(p.S/2));i++)s.ball([-2.2+hash(i)*4.4,-1.2+hash(i+5)*2.6,-1+hash(i+9)*.6],.12,'#ffd43b');for(let i=0;i<Math.round(p.I/2);i++)s.ball([-2.2+hash(i+50)*4.4,-1.2+hash(i+55)*2.6,-1+hash(i+59)*.6],.12,'#fa5252');s.render();
  chart(c,420,96,236,170,{title:'v vs [S]',xl:'[S] (mM)',xmin:0,xmax:50,ymin:0,ymax:p.Vmax*1.05,series:[{fn:S=>p.Vmax*S/(p.Km+S),col:'#8ca6b9',dash:[4,4]},{fn:S=>p.Vmax*S/(Ka+S),col:C.gold}],marker:[p.S,v]});tag(c,'yellow: substrate · red: inhibitor · green: products',44,98,C.muted,13)},
 assumption:'Michaelis–Menten kinetics with K_i = 2 mM; dashed curve = without inhibitor.'});

const ENZ={amylase:[6.8,'Salivary amylase'],pepsin:[2,'Pepsin (stomach)'],trypsin:[8,'Trypsin (small intestine)']};
add({...ch(9,'Biomolecules',U3),id:'bio-enzyme-conditions',title:'Temperature and pH affect enzymes',
 description:'Change temperature and pH and watch an enzyme’s activity rise to an optimum and then fall.',
 formula:'Activity peaks at the optimum; extremes denature the protein',
 observe:'Low temperature only slows (inactivates) an enzyme; high temperature destroys its shape (denaturation).',
 tryText:'Find the pH where pepsin works best and compare it with trypsin.',
 controls:[S('enz','Enzyme','amylase',Object.entries(ENZ).map(([k,v])=>[k,v[1]])),R('T','Temperature',0,70,1,37,'°C'),R('pH','pH',1,12,.1,6.8,'',1)],
 metrics:p=>{const a=enzAct(p);return[N('Relative activity',a*100,'%',0),N('Optimum pH',ENZ[p.enz][0],'',1),N('Optimum temperature',37,'°C',0),N('State',p.T>50?'Denatured (irreversible)':p.T<10?'Inactive (reversible)':'Active')]},
 draw:(c,p,t)=>{const a=enzAct(p),s=P3.scene(c,{scale:60,cx:220}),wob=p.T>50?.35:0;s.mesh([0,0,0],[1.1,.9,.9],'#748ffc',{shape:(u,v)=>1+wob*Math.sin(5*v+t*3)*Math.cos(3*u)-(p.T<=50?.45*Math.exp(-((u-1.1)**2*3+(v-PI/2)**2*2)):0)});for(let i=0;i<Math.round(a*8);i++){const q=cycle(t*.6+i/8,1);s.ball([1.2+q*1.4,.4+.3*Math.sin(i),.2],.12,'#69db7c')}s.render();
  chart(c,420,96,236,80,{title:'Activity vs temperature',xmin:0,xmax:70,ymin:0,ymax:1.05,series:[{fn:T=>enzAct({...p,T}),col:C.gold}],marker:[p.T,a]});chart(c,420,186,236,80,{title:'Activity vs pH',xmin:1,xmax:12,ymin:0,ymax:1.05,series:[{fn:x=>enzAct({...p,pH:x}),col:C.mint}],marker:[p.pH,a]})},
 assumption:'Bell-shaped teaching curves: temperature optimum 37 °C with denaturation above ~50 °C; pH optima are typical textbook values.'});
function enzAct(p){const T=p.T,tf=T<=37?Math.exp(-(((T-37)/18)**2)):Math.exp(-(((T-37)/9)**2)),pf=Math.exp(-(((p.pH-ENZ[p.enz][0])/1.4)**2));return tf*pf}

const PLEV={primary:['Sequence of amino acids','Peptide bonds join amino acids in a chain','First amino acid = N-terminal, last = C-terminal'],secondary:['Chain folds into α-helix','Hydrogen bonds hold the helix','Right-handed helix is common'],tertiary:['Helix folds into a 3D globule','Gives the protein its biological activity','Like a ball of wool'],quaternary:['Several folded subunits assemble','Adult haemoglobin: 4 subunits (2α + 2β)','Each subunit is a tertiary structure']};
add({...ch(9,'Biomolecules',U3),id:'bio-protein-structure',title:'Levels of protein structure',
 description:'Fold a protein from its amino acid sequence to a helix, a 3D globule and finally a multi-subunit protein.',
 formula:'Primary → secondary → tertiary → quaternary',
 observe:'The tertiary structure gives the protein its 3D shape and biological activity.',
 tryText:'Step to quaternary structure and count the subunits of haemoglobin.',
 controls:[S('lvl','Structure level','secondary',[['primary','Primary'],['secondary','Secondary (α-helix)'],['tertiary','Tertiary'],['quaternary','Quaternary']])],
 metrics:p=>PLEV[p.lvl].map((v,i)=>N(['What it is','Held by / example','Note'][i],v)),
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:56,yaw:t*.2}),cols=['#ff6b6b','#ffd43b','#69db7c','#4dabf7','#9775fa','#f783ac'];
  if(p.lvl==='primary'){for(let i=0;i<20;i++){const x=-3+i*.32;s.ball([x,.2*Math.sin(i*.8),0],.14,cols[i%6]);if(i)s.seg([x-.32,.2*Math.sin((i-1)*.8),0],[x,.2*Math.sin(i*.8),0],'#dee2e6',2)}s.label([-3,.5,0],'N',C.white,14);s.label([3.1,.5,0],'C',C.white,14)}
  else if(p.lvl==='secondary'){const pts=Array.from({length:120},(_,i)=>[-2.6+i*.045,.45*Math.cos(i*.42),.45*Math.sin(i*.42)]);s.tube(pts,.1,'#ff8787',{segs:8});for(let i=0;i<120;i+=6)s.ball(pts[i],.07,cols[(i/6)%6],{flat:true})}
  else{const blob=(o,col,seed)=>{const pts=[];for(let i=0;i<160;i++){const a=i*.21+seed,b=i*.083+seed*2;pts.push(V.add(o,[.75*Math.sin(b)*Math.cos(a),.75*Math.cos(b),.75*Math.sin(b)*Math.sin(a)]))}s.tube(pts,.09,col,{segs:6})};if(p.lvl==='tertiary')blob([0,0,0],'#ff8787',0);else{blob([-.8,.8,0],'#ff8787',0);blob([.8,.8,0],'#ff8787',1);blob([-.8,-.8,0],'#74c0fc',2);blob([.8,-.8,0],'#74c0fc',3);for(const q of[[-.8,.8,.5],[.8,.8,.5],[-.8,-.8,.5],[.8,-.8,.5]])s.ball(q,.12,'#e03131',{glow:true,lift:2});s.label([-2,1.8,0],'α',C.red,15);s.label([-2,-1.8,0],'β',C.blue,15)}}s.render()},
 assumption:'Schematic backbone; side chains are shown as coloured beads. Red discs in haemoglobin mark the haem groups.'});

/* ---------- Chapter 10: Cell Cycle and Cell Division ---------- */
const MIT=[['Interphase (G₂)','Chromosomes not visible; DNA already doubled'],['Prophase','Chromatin condenses into chromosomes; spindle begins to form'],['Metaphase','Chromosomes line up at the metaphase plate'],['Anaphase','Centromeres split; sister chromatids move to opposite poles'],['Telophase','Nuclear envelopes reform around two sets of chromosomes'],['Cytokinesis','Cytoplasm divides into two daughter cells']];
add({...ch(10,'Cell Cycle and Cell Division',U3),id:'bio-mitosis',title:'Mitosis in 3D',
 description:'Watch the chromosomes of an animal cell condense, line up, separate and form two identical nuclei.',
 formula:'2n → 2n + 2n (equational division)',
 observe:'Each daughter cell receives an exact copy of the parent’s chromosomes.',
 tryText:'Pause at metaphase and rotate the view to see the plate edge-on.',
 controls:[R('n','Chromosome number 2n (shown)',2,8,2,4),R('speed','Speed of division',.2,2,.1,1,'×',1)],
 metrics:(p,t)=>{const k=Math.floor(cycle(t*p.speed,18)/3);return[N('Phase',MIT[k][0]),N('Key event',MIT[k][1]),N('Chromosomes per daughter cell',p.n+' (2n)'),N('Human somatic cells','2n = 46')]},
 draw:(c,p,t)=>{const T=cycle(t*p.speed,18),k=Math.floor(T/3),f2=(T%3)/3,s=P3.scene(c,{scale:56}),split=k===5?f2:k>5?1:0;
  s.mesh([0,0,0],[2.4+.5*split,1.5,1.5],BC.membrane,{alpha:.18,shape:(u,v)=>1-.6*split*Math.exp(-((Math.cos(v)*Math.cos(u))**2)*12)});
  if(k===0){s.mesh([0,0,0],.9,BC.nucleus,{alpha:.4});for(let i=0;i<8;i++)s.path(Array.from({length:12},(_,j)=>[(hash(i)-.5)*1.2+.2*Math.sin(j+i),(hash(i+3)-.5)*1.2+.2*Math.cos(j*1.3),(hash(i+6)-.5)*.8]),'#ff8787',1.5)}
  const cols=['#ff6b6b','#4dabf7','#ffd43b','#69db7c','#9775fa','#f783ac','#ffa94d','#38d9a9'];
  for(let i=0;i<p.n;i++){const L=.35+.12*(i%(p.n/2)),col=cols[i%cols.length],home=[(hash(i)-.5)*1.1,(hash(i+20)-.5)*1.1,(hash(i+40)-.5)*.8],plate=[0,-1+2*(i+.5)/p.n,0];
   if(k===1)chromosome(s,V.add(home,[0,0,0]),L*(.4+.6*f2),col,hash(i)*PI);else if(k===2)chromosome(s,V.add(V.mul(home,1-f2),V.mul(plate,f2)),L,col,PI/2);
   else if(k>=3){const d=k===3?f2*1.6:1.6+(k>=5?.6*split:0);for(const sg of[-1,1])chromosome(s,V.add(plate,[sg*d,0,0]),L,col,PI/2,false)}}
  if(k>=1&&k<=3)for(let i=0;i<p.n;i++){const y=-1+2*(i+.5)/p.n;s.seg([-2.1,0,0],[k===3?-1.6*f2:0,y,0],'#adb5bd55',1);s.seg([2.1,0,0],[k===3?1.6*f2:0,y,0],'#adb5bd55',1)}
  if(k>=4)for(const sg of[-1,1])s.mesh([sg*(1.6+.6*split),0,0],.75,BC.nucleus,{alpha:.25*Math.min(1,f2*2+(k>4?1:0))});s.render();tag(c,MIT[k][0],44,98,C.gold,16)},
 assumption:'Animal cell, small chromosome number for clarity; time compressed — a human cell spends only about 1 h of a 24 h cycle in M phase.'});

const MEI=[['Prophase I','Homologous chromosomes pair (synapsis) and cross over'],['Metaphase I','Bivalents line up at the equator'],['Anaphase I','Homologous chromosomes separate (chromatids stay together)'],['Telophase I','Two haploid cells, each chromosome still with two chromatids'],['Meiosis II','Sister chromatids separate, like mitosis'],['Result','Four haploid cells, genetically different']];
add({...ch(10,'Cell Cycle and Cell Division',U3),id:'bio-meiosis',title:'Meiosis and crossing over',
 description:'Follow one diploid cell through meiosis I and II to four haploid cells. Watch crossing over swap segments.',
 formula:'2n → 4 cells of n (reductional division) ;  combinations = 2ⁿ',
 observe:'Crossing over and independent assortment make every gamete genetically unique.',
 tryText:'Increase the haploid number and see how fast the number of possible combinations grows.',
 controls:[R('nh','Haploid number n (for combinations)',1,23,1,23),R('speed','Speed',.2,2,.1,1,'×',1)],
 metrics:(p,t)=>{const k=Math.floor(cycle(t*p.speed,18)/3);return[N('Stage',MEI[k][0]),N('Key event',MEI[k][1]),N('Possible combinations (2ⁿ)',2**p.nh,'',0),N('Chromosome number','2n → n')]},
 draw:(c,p,t)=>{const T=cycle(t*p.speed,18),k=Math.floor(T/3),f2=(T%3)/3,s=P3.scene(c,{scale:52});const pairs=[[.45,'#ff6b6b','#4dabf7'],[.3,'#ffd43b','#69db7c']];
  if(k<=3){const sp=k===3?f2:0;s.mesh([0,0,0],[2.6+sp,1.5,1.5],BC.membrane,{alpha:.16,shape:(u,v)=>1-.6*sp*Math.exp(-((Math.cos(v)*Math.cos(u))**2)*12)});
   pairs.forEach(([L,c1,c2],i)=>{const y=i?-.5:.5;let x1,x2;if(k===0){x1=-.18*(1-f2)-.1;x2=.18*(1-f2)+.1}else if(k===1){x1=-.12;x2=.12}else{const d=k===2?f2*1.6:1.6+sp*.5;x1=-.12-d;x2=.12+d}
    const cross=k>=1||f2>.6;chromosome(s,[x1,y,0],L,c1,0);chromosome(s,[x2,y,0],L,c2,0);if(cross){s.tube([[x1+.07,y-L*.45,0],[x1+.07,y-L*.15,0]],.075,c2,{segs:8});s.tube([[x2-.07,y-L*.45,0],[x2-.07,y-L*.15,0]],.075,c1,{segs:8})}})}
  else{const cells=[[-1.6,.9],[-1.6,-.9],[1.6,.9],[1.6,-.9]];cells.forEach(([x,y],i)=>{const g=k===4?f2:1;s.mesh([x,y*g,0],.75,BC.membrane,{alpha:.18});pairs.forEach(([L,c1,c2],j)=>{chromosome(s,[x+(j?.25:-.25),y*g,0],L*.8,(i+j)%2?c1:c2,0,false)})})}s.render();tag(c,MEI[k][0],44,98,C.gold,16)},
 assumption:'Two homologous pairs shown (2n = 4); a single crossover drawn on each pair.'});

add({...ch(10,'Cell Cycle and Cell Division',U3),id:'bio-cell-cycle',title:'The cell cycle clock',
 description:'Move round a 24-hour human cell cycle: G₁, S, G₂ and M phase. Watch the DNA content double during S phase.',
 formula:'Interphase (G₁ + S + G₂) ≈ 95% of the cycle ;  M phase ≈ 1 h of 24 h',
 observe:'DNA content doubles from 2C to 4C in S phase, but the chromosome number stays the same until mitosis.',
 tryText:'Drag the clock to the end of S phase. What is the DNA content now?',
 controls:[R('h','Time in cycle',0,24,.1,6,'h',1),R('G1','G₁ duration',6,14,.5,11,'h',1),R('Sd','S duration',5,10,.5,8,'h',1)],
 metrics:p=>{const st=cyclePhase(p);return[N('Phase',st.name),N('DNA content',st.dna),N('Interphase share',(24-1)/24*100,'%',0),N('Event',st.ev)]},
 draw:(c,p,t)=>{const st=cyclePhase(p),s=P3.scene(c,{scale:56,pitch:.75,cx:230}),G2=24-1-p.G1-p.Sd,seg=[['G₁',p.G1,'#4dabf7'],['S',p.Sd,'#ff6b6b'],['G₂',G2,'#ffd43b'],['M',1,'#69db7c']];let a0=-PI/2;
  seg.forEach(([n,d,col])=>{const a1=a0+TAU*d/24,pts=[];for(let i=0;i<=24;i++){const a=a0+(a1-a0)*i/24;pts.push([2*Math.cos(a),0,2*Math.sin(a)])}s.tube(pts,.2,col,{segs:8});const m=(a0+a1)/2;s.label([2.6*Math.cos(m),.3,2.6*Math.sin(m)],n,col,15);a0=a1});
  const a=-PI/2+TAU*p.h/24;s.arrow([0,.1,0],[1.7*Math.cos(a),.1,1.7*Math.sin(a)],C.white,4);s.mesh([0,.6,0],.35+.15*st.g,BC.membrane,{alpha:.4});s.ball([0,.6,0],.18,BC.nucleus);s.render();
  tag(c,`DNA: ${st.dna}`,44,98,C.gold,15)},
 assumption:'Typical 24 h human cell in culture; G₁ and S durations adjustable, M fixed at 1 h, G₂ takes the remainder.'});
function cyclePhase(p){const G2=24-1-p.G1-p.Sd,h=p.h;if(h<p.G1)return{name:'G₁ (gap 1)',dna:'2C',ev:'Cell grows; prepares for DNA replication',g:h/24};if(h<p.G1+p.Sd){const k=(h-p.G1)/p.Sd;return{name:'S (synthesis)',dna:`${f(2+2*k,1)}C (replicating)`,ev:'DNA replicates; centriole duplicates (animal cells)',g:h/24}}if(h<23)return{name:'G₂ (gap 2)',dna:'4C',ev:'Proteins made for mitosis; growth continues',g:h/24};return{name:'M phase (mitosis)',dna:'4C → 2C per daughter',ev:'Nucleus and cell divide',g:1}}

/* ---------- Chapter 11: Photosynthesis in Higher Plants ---------- */
add({...ch(11,'Photosynthesis in Higher Plants',U4),id:'bio-limiting-factors',title:'Limiting factors of photosynthesis',
 description:'Count oxygen bubbles from an aquatic plant (like Hydrilla) as you change light, CO₂ and temperature.',
 formula:'Blackman: the rate is set by the factor in shortest supply',
 observe:'Raising a factor that is not limiting changes nothing — the rate follows whichever factor is lowest.',
 tryText:'At bright light, increase CO₂ from 0.03% to 0.05%. Then try at dim light.',
 controls:[R('L','Light intensity',0,100,1,40,'%'),R('co2','CO₂ concentration',.01,.08,.005,.03,'%',3),R('T','Temperature',5,45,1,25,'°C')],
 metrics:p=>{const r=photo(p);return[N('Rate (relative)',r.rate*100,'%',0),N('Limiting factor',r.lim),N('O₂ bubbles per minute',Math.round(r.rate*60),'',0)]},
 draw:(c,p,t)=>{const r=photo(p),s=P3.scene(c,{scale:56,cx:220,cy:280});s.cyl([0,-.3,0],[0,1,0],1.1,2.6,'#ffffff',{alpha:.12,caps:false});s.cyl([0,-.55,0],[0,1,0],1.05,2,'#4dabf7',{alpha:.25});
  for(let i=0;i<5;i++){const pts=Array.from({length:10},(_,j)=>[(i-2)*.15+.1*Math.sin(j+i),-1.5+j*.17,.1*Math.cos(i)]);s.tube(pts,.03,'#2b8a3e',{segs:5});for(let j=2;j<10;j+=2)for(const sg of[-1,1])leaf(s,pts[j],[sg,.4,.2*sg],.22,.05,'#40c057')}
  const n=Math.round(r.rate*14);for(let i=0;i<n;i++){const q=cycle(t*(.3+r.rate)+i/n,1);s.ball([(hash(i)-.5)*.6,0+q*1.3,(hash(i+4)-.5)*.4],.05+.02*hash(i),'#e7f5ff',{alpha:.7})}
  const lx=-2.6+(1-p.L/100)*.8;s.ball([lx,.6,0],.3,p.L>0?'#fff3bf':'#495057',{glow:p.L>0,flat:true});s.cyl([lx-.35,.6,0],[1,0,0],.32,.3,'#868e96');s.render();
  chart(c,420,96,236,170,{title:'Rate vs light (gold) at current CO₂',xl:'light %',xmin:0,xmax:100,ymin:0,ymax:1.05,series:[{fn:L=>photo({...p,L}).rate,col:C.gold},{fn:L=>photo({...p,L,co2:.06}).rate,col:'#8ca6b9',dash:[4,4]}],marker:[p.L,r.rate]})},
 assumption:'Blackman-type model: rate = min(light term, CO₂ term) × temperature factor (C₃ optimum ~25–30 °C). Dashed curve: 0.06 % CO₂.'});
function photo(p){const lt=p.L/60,ct=p.co2/.05,tf=Math.exp(-(((p.T-28)/11)**2)),rate=Math.min(1,lt,ct)*tf;const lim=lt<ct&&lt<1?'Light':ct<=lt&&ct<1?'CO₂':tf<.9?'Temperature':'None (saturated)';return{rate,lim}}

add({...ch(11,'Photosynthesis in Higher Plants',U4),id:'bio-light-reaction',title:'Light reaction: the Z scheme',
 description:'Follow electrons from water through PS II and PS I to NADP⁺ in the thylakoid membrane, and protons through ATP synthase.',
 formula:'2H₂O → 4H⁺ + O₂ + 4e⁻ ;  NADP⁺ + 2e⁻ + H⁺ → NADPH',
 observe:'Splitting water releases O₂ and supplies electrons to PS II; the proton gradient across the thylakoid drives ATP synthesis.',
 tryText:'Switch to cyclic photophosphorylation. What stops being produced?',
 controls:[S('mode','Electron flow','non',[['non','Non-cyclic (PS II + PS I)'],['cyc','Cyclic (PS I only)']]),R('L','Light intensity',0,100,1,80,'%')],
 metrics:p=>p.mode==='non'?[N('Products','ATP, NADPH and O₂'),N('Photosystems','PS II (P680) and PS I (P700)'),N('O₂ source','Splitting of water'),N('Location','Grana thylakoids')]:[N('Products','ATP only'),N('Photosystem','PS I (P700) only'),N('O₂ released?','No'),N('Location','Stroma lamellae')],
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:52,pitch:.25}),on=p.L>0,sp=p.L/100;s.box([0,-.3,0],[7,.6,2.2],'#b2f2bb',{alpha:.35});s.label([-3.2,.6,1.2],'stroma',C.muted,12);s.label([-3.2,-1.2,1.2],'lumen',C.muted,12);
  const ps2=[-2.2,-.3,0],cyt=[-.6,-.3,0],ps1=[.8,-.3,0],atp=[2.6,-.3,0];if(p.mode==='non'){s.mesh(ps2,[.55,.75,.55],'#2f9e44',{label:'PS II'});s.label(V.add(ps2,[0,1,0]),'PS II',C.white,13)}s.mesh(cyt,[.4,.6,.4],'#e8590c');s.label(V.add(cyt,[0,.9,0]),'Cyt b₆f',C.white,12);s.mesh(ps1,[.55,.75,.55],'#37b24d');s.label(V.add(ps1,[0,1,0]),'PS I',C.white,13);
  s.cyl(V.add(atp,[0,-.1,0]),[0,1,0],.25,.9,'#adb5bd');s.mesh(V.add(atp,[0,.7,0]),[.5,.35,.5],'#ced4da',{rot:[0,t*3*sp,0]});s.label(V.add(atp,[0,1.3,0]),'ATP synthase',C.white,12);
  if(on){const path=p.mode==='non'?[ps2,cyt,ps1,[2,.8,0]]:[ps1,cyt,ps1];for(let i=0;i<6;i++){const q=cycle(t*sp*.8+i/6,1)*(path.length-1),j=Math.floor(q),fr=q-j,pt=V.add(V.add(path[j],V.mul(V.sub(path[j+1],path[j]),fr)),[0,.2,0]);s.ball(pt,.08,'#ffd43b',{glow:true,flat:true})}
   for(let i=0;i<4;i++){const q=cycle(t*sp+i/4,1);s.ball([atp[0],.7-q*1.6,0],.07,'#ff6b6b',{flat:true});s.ball([-1.4+(i%2)*1.4,-1.1+.2*Math.sin(t+i),.5],.07,'#ff6b6b',{flat:true})}
   if(p.mode==='non'){const q=cycle(t*sp*.5,1);s.ball([-2.4,-1.2+q*.8,.6],.12,'#74c0fc');s.label([-2.4,-1.5,.6],'2H₂O → O₂',C.blue,12);s.label([2.1,1.1,0],'NADPH',C.gold,13)}const q=cycle(t*sp,1);s.ball([atp[0]+.5,.9+q*.6,0],.12,'#ffd43b');s.label([atp[0]+.6,1.7,0],'ATP',C.gold,13)}
  for(let i=0;i<12;i++)s.seg([-3+i*.5,2.2,-1],[-3+i*.5+.4*sp,1.2,-.6],'#fff3bf'+Math.round(30+120*sp).toString(16).padStart(2,'0'),2);s.render();tag(c,'yellow: electrons   red: protons (H⁺)',44,98,C.muted,13)},
 assumption:'Schematic thylakoid membrane; plastoquinone, plastocyanin and ferredoxin carriers are merged into the arrows.'});

add({...ch(11,'Photosynthesis in Higher Plants',U4),id:'bio-calvin-cycle',title:'Calvin cycle bookkeeping',
 description:'Turn the Calvin cycle once per CO₂ fixed and keep count of the ATP and NADPH used.',
 formula:'Per CO₂: 3 ATP + 2 NADPH ;  1 glucose = 6 turns = 18 ATP + 12 NADPH',
 observe:'Carboxylation by RuBisCO, reduction and regeneration of RuBP happen in the stroma.',
 tryText:'How many turns are needed to make three glucose molecules?',
 controls:[R('co2','CO₂ molecules fixed',1,36,1,6)],
 metrics:p=>[N('Turns of the cycle',p.co2,'',0),N('ATP used',3*p.co2,'',0),N('NADPH used',2*p.co2,'',0),N('Glucose formed',p.co2/6,'',2)],
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:56,pitch:.65,cx:240}),stages=[['Carboxylation (RuBisCO)','#ff6b6b'],['Reduction (ATP, NADPH)','#ffd43b'],['Regeneration of RuBP (ATP)','#4dabf7']];stages.forEach(([n,col],i)=>{const a0=-PI/2+TAU*i/3,pts=[];for(let j=0;j<=20;j++){const a=a0+TAU/3*j/20;pts.push([2*Math.cos(a),0,2*Math.sin(a)])}s.tube(pts,.16,col,{segs:8});const m=a0+PI/3;s.label([2.7*Math.cos(m),.3,2.7*Math.sin(m)],n,col,12)});
  const a=-PI/2+TAU*cycle(t*.35,1);s.ball([2*Math.cos(a),.3,2*Math.sin(a)],.18,'#e9f6ff',{glow:true});s.ball([0,0,0],.25,'#40c057',{label:`${Math.floor(p.co2/6)} glucose`});const done=Math.min(p.co2,36);for(let i=0;i<done;i++)s.ball([-.9+(i%6)*.36,-.1,-.9+Math.floor(i/6)*.36],.09,'#868e96',{flat:true});s.render();tag(c,'grey dots: CO₂ fixed',44,98,C.muted,13)},
 assumption:'Stoichiometry from NCERT Chapter 11; intermediates such as 3-PGA and G3P not shown individually.'});

add({...ch(11,'Photosynthesis in Higher Plants',U4),id:'bio-c3-c4',title:'C₃ vs C₄ plants and photorespiration',
 description:'Compare a C₃ leaf with the Kranz anatomy of a C₄ leaf, and see how temperature affects their photosynthesis.',
 formula:'C₃: first product 3-PGA (3C) ;  C₄: first product OAA (4C)',
 observe:'C₄ plants concentrate CO₂ in bundle-sheath cells, so RuBisCO rarely binds O₂ — photorespiration is negligible.',
 tryText:'Raise the temperature to 40 °C. Which plant keeps its rate?',
 controls:[S('type','Plant','c4',[['c3','C₃ (e.g. wheat, rice)'],['c4','C₄ (e.g. maize, sorghum)']]),R('T','Temperature',10,45,1,30,'°C')],
 metrics:p=>{const r=c34(p);return[N('Relative rate',r*100,'%',0),N('Primary CO₂ acceptor',p.type==='c4'?'PEP (3C), by PEP carboxylase':'RuBP (5C), by RuBisCO'),N('Photorespiration',p.type==='c4'?'Absent / negligible':'Present; rises with temperature'),N('Kranz anatomy',p.type==='c4'?'Present':'Absent')]},
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:56,pitch:.45,cx:230}),c4=p.type==='c4';s.box([0,0,0],[5,.9,2.6],'#d3f9d8',{alpha:.25});
  for(let b=0;b<2;b++){const x=-1.2+b*2.4;s.cyl([x,0,0],[0,0,1],.3,2.4,'#e9ecef');if(c4)for(let i=0;i<10;i++){const a=TAU*i/10;s.cyl([x+.55*Math.cos(a),.55*Math.sin(a),0],[0,0,1],.2,2.3,'#2b8a3e',{alpha:.85})}
   for(let i=0;i<14;i++){const a=TAU*i/14,r=c4?1.0:.6+.3*hash(i);s.ball([x+r*Math.cos(a),r*Math.sin(a)*.6,(hash(i+b)-.5)*1.8],.16,'#8ce99a',{alpha:.8})}}
  s.label([-1.2,1.1,1.3],c4?'bundle sheath (Kranz)':'mesophyll',C.mint,12);s.render();
  chart(c,420,96,236,170,{title:'Rate vs temperature',xl:'°C',xmin:10,xmax:45,ymin:0,ymax:1.05,series:[{fn:T=>c34({type:'c3',T}),col:'#74c0fc'},{fn:T=>c34({type:'c4',T}),col:C.gold}],marker:[p.T,c34(p)]});tag(c,'blue: C₃   gold: C₄',432,262,C.muted,12)},
 assumption:'Illustrative curves: C₃ optimum ~25 °C with photorespiration losses above it; C₄ optimum ~35 °C.'});
function c34(p){return p.type==='c4'?Math.exp(-(((p.T-35)/10)**2)):Math.exp(-(((p.T-25)/9)**2))*.85}

/* ---------- Chapter 12: Respiration in Plants ---------- */
add({...ch(12,'Respiration in Plants',U4),id:'bio-respiration-atp',title:'ATP balance sheet of respiration',
 description:'Break down glucose aerobically or by fermentation and add up the ATP made at each stage.',
 formula:'Aerobic: net 38 ATP per glucose (NCERT) ;  fermentation: net 2 ATP',
 observe:'Most ATP comes from oxidising NADH and FADH₂ in the electron transport system, which needs oxygen.',
 tryText:'Switch to fermentation. Where does the ATP come from now?',
 controls:[S('mode','Pathway','aerobic',[['aerobic','Aerobic respiration'],['alcohol','Alcoholic fermentation (yeast)'],['lactic','Lactic acid fermentation (muscle)']]),R('glc','Glucose molecules',1,10,1,1)],
 metrics:p=>{const g=p.glc;if(p.mode!=='aerobic')return[N('Net ATP',2*g,'',0),N('End products',p.mode==='alcohol'?'Ethanol + CO₂':'Lactic acid'),N('NADH','Re-oxidised to keep glycolysis going'),N('O₂ needed','No')];return[N('Glycolysis (net)',`${2*g} ATP + ${2*g} NADH`),N('Link + Krebs cycle',`${2*g} ATP, ${8*g} NADH, ${2*g} FADH₂`),N('ETS (NADH×3, FADH₂×2)',`${34*g} ATP`),N('Total',38*g,'ATP',0)]},
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:54,cx:250}),aer=p.mode==='aerobic';s.mesh([-1.8,0,0],[1.2,1.1,1],'#f6d6c2',{alpha:.2});s.label([-1.8,1.4,0],'cytoplasm: glycolysis',C.muted,12);
  const q=cycle(t*.4,1);s.ball([-2.4+q*.6,.2,0],.22,'#ffd43b',{label:q<.5?'glucose (6C)':''});if(q>.5){s.ball([-1.6,.5,0],.16,'#ffa94d');s.ball([-1.6,-.2,0],.16,'#ffa94d')}
  if(aer){s.mesh([1.4,0,0],[1.5,.85,.85],BC.mito,{alpha:.55});for(let i=0;i<6;i++)s.mesh([.5+i*.35,0,0],[.06,.65,.6],'#d9480f',{alpha:.6});s.label([1.4,1.2,0],'mitochondrion: Krebs + ETS',C.muted,12);const n=Math.min(38,Math.round(cycle(t*.4,1)*38));for(let i=0;i<n;i++)s.ball([.3+(i%8)*.3,-1.4-Math.floor(i/8)*.25,.5],.07,'#ffd43b',{flat:true})}
  else{for(let i=0;i<2;i++)s.ball([-.8+i*.3,-1.4,.5],.07,'#ffd43b',{flat:true});s.label([0,-.6,0],p.mode==='alcohol'?'→ ethanol + CO₂':'→ lactic acid',C.gold,14)}s.render();tag(c,'yellow dots: ATP per glucose',44,98,C.gold,13)},
 assumption:'NCERT theoretical yield (NADH = 3 ATP, FADH₂ = 2 ATP); actual yields are lower.'});

const RQS={carb:['C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O',6,6],fat:['2C₅₁H₉₈O₆ + 145O₂ → 102CO₂ + 98H₂O (tripalmitin)',102,145],acid:['C₄H₆O₅ + 3O₂ → 4CO₂ + 3H₂O (malic acid)',4,3],protein:['Proteins (approximate)',.9,1]};
add({...ch(12,'Respiration in Plants',U4),id:'bio-respiratory-quotient',title:'Respiratory quotient (RQ)',
 description:'Respire different substrates in a respirometer and compare the CO₂ released with the O₂ consumed.',
 formula:'RQ = volume of CO₂ evolved / volume of O₂ consumed',
 observe:'Carbohydrates give RQ = 1; fats need more oxygen, so RQ < 1; organic acids give RQ > 1.',
 tryText:'Which seeds would you expect to show an RQ near 0.7 — wheat or castor (oil-rich)?',
 controls:[S('sub','Respiratory substrate','carb',[['carb','Carbohydrate (glucose)'],['fat','Fat (tripalmitin)'],['protein','Protein'],['acid','Organic acid (malic)']])],
 metrics:p=>{const d=RQS[p.sub],rq=d[1]/d[2];return[N('RQ',rq,'',2),N('Equation',d[0]),N('Interpretation',rq>1.01?'More CO₂ than O₂':rq<.99?'More O₂ used than CO₂ given out':'Equal volumes')]},
 draw:(c,p,t)=>{const d=RQS[p.sub],rq=d[1]/d[2],s=P3.scene(c,{scale:56,cy:290,cx:250});s.lathe([-1,-1.2,0],[[.05,0],[.8,.1],[.85,.8],[.6,1.2],[.25,1.5],[.25,1.9]],'#e9f6ff',{alpha:.18});for(let i=0;i<12;i++)s.mesh([-1+(hash(i)-.5)*1,-1.0+hash(i+3)*.4,(hash(i+6)-.5)*.8],[.12,.08,.09],'#d9a441',{rot:[0,i,.5],rings:6,segs:10});
  s.tube([[-1,.7,0],[-1,1.2,0],[1,1.2,0],[1,-.6,0],[1.6,-.6,0],[1.6,1,0]],.05,'#e9f6ff',{alpha:.3});const lvl=clamp((1-rq)*1.2,-.5,.5)*Math.min(1,cycle(t,8)/4);s.tube([[1,-.6,0],[1.6,-.6,0]],.045,'#4dabf7');s.tube([[1,-.6,0],[1,-.2+lvl,0]],.045,'#4dabf7');s.tube([[1.6,-.6,0],[1.6,-.2-lvl,0]],.045,'#4dabf7');s.label([-1,-1.5,0],'germinating seeds',C.muted,12);s.render();tag(c,`RQ = ${f(rq,2)}`,44,98,C.gold,17)},
 assumption:'Ganong’s respirometer idea: the manometer shift reflects the difference between CO₂ released and O₂ taken up (no KOH).'});

add({...ch(12,'Respiration in Plants',U4),id:'bio-electron-transport',title:'Electron transport and ATP synthase',
 description:'Inside the mitochondrion, electrons flow along the inner membrane and pump protons; ATP synthase uses the flow back to make ATP.',
 formula:'NADH → complex I … → complex IV → O₂ + 4H⁺ + 4e⁻ → 2H₂O',
 observe:'Oxygen is the final electron acceptor; without it the chain stops and so does most ATP production.',
 tryText:'Lower the oxygen supply to zero.',
 controls:[R('O2','Oxygen supply',0,100,1,100,'%'),R('nadh','NADH supply',0,100,1,70,'%')],
 metrics:p=>{const r=Math.min(p.O2,p.nadh)/100;return[N('Electron flow (relative)',r*100,'%',0),N('ATP synthesis rate (relative)',r*100,'%',0),N('Final electron acceptor','Oxygen → water'),N('ATP synthase','F₀ proton channel + F₁ head (makes ATP)')]},
 draw:(c,p,t)=>{const r=Math.min(p.O2,p.nadh)/100,s=P3.scene(c,{scale:52,pitch:.2});s.box([0,0,0],[7,.5,2.2],'#ffc078',{alpha:.45});s.label([-3.2,.9,1.2],'intermembrane space',C.muted,12);s.label([-3.2,-.9,1.2],'matrix',C.muted,12);
  const cx=[-2.6,-1.3,0,1.3];cx.forEach((x,i)=>{s.mesh([x,0,0],[.4,.6,.4],['#e8590c','#f08c00','#d6336c','#ae3ec9'][i]);s.label([x,.8,0],['I','II','III','IV'][i],C.white,13)});const atp=[2.7,0,0];s.cyl(V.add(atp,[0,.2,0]),[0,1,0],.22,.7,'#adb5bd');s.mesh(V.add(atp,[0,-.55,0]),[.5,.35,.5],'#ced4da',{rot:[0,t*4*r,0]});
  for(let i=0;i<5;i++){const q=cycle(t*r*.8+i/5,1)*3,j=Math.floor(q),fr=q-j;s.ball([cx[j]+(cx[j+1]-cx[j])*fr,-.2,0],.07,'#ffd43b',{flat:true,glow:true})}for(let i=0;i<8;i++){const q=cycle(t*r*.5+i/8,1);s.ball([-2.6+i*.6,.4+q*.6,.4],.06,'#ff6b6b',{flat:true})}
  for(let i=0;i<4;i++){const q=cycle(t*r+i/4,1);s.ball([atp[0],.9-q*1.7,0],.06,'#ff6b6b',{flat:true})}if(r>0)s.label([1.6,-1.1,0],'O₂ → H₂O',C.blue,12);s.render();tag(c,r===0?'Chain stopped: no electron flow':'yellow: electrons   red: protons',44,98,r===0?C.red:C.muted,13)},
 assumption:'Schematic inner mitochondrial membrane; complex II and mobile carriers simplified.'});

/* ---------- Chapter 13: Plant Growth and Development ---------- */
add({...ch(13,'Plant Growth and Development',U4),id:'bio-growth-curves',title:'Arithmetic, geometric and sigmoid growth',
 description:'Grow a root by arithmetic growth or a cell population by geometric growth, and see the S-shaped curve when resources limit growth.',
 formula:'Arithmetic: L_t = L₀ + rt ;  geometric: W₁ = W₀e^(rt)',
 observe:'Geometric growth starts slowly, accelerates (log phase) and then slows as nutrients run short — giving a sigmoid curve.',
 tryText:'Compare the two growth types at the same rate r.',
 controls:[S('type','Growth','geo',[['arith','Arithmetic (root elongation)'],['geo','Geometric → sigmoid (cell number)']]),R('r','Growth rate r',.05,.5,.01,.2,'per day',2),R('day','Day',0,40,1,20,'day')],
 metrics:p=>{const v=growth(p,p.day);return[N(p.type==='arith'?'Length':'Size (relative)',v,p.type==='arith'?'cm':'',2),N('Phase',p.type==='arith'?'Constant rate':p.day<8?'Lag phase':v<.9*20?'Log (exponential) phase':'Stationary phase'),N('Equation',p.type==='arith'?'L = L₀ + rt':'Logistic (sigmoid) curve')]},
 draw:(c,p,t)=>{const v=growth(p,p.day),s=P3.scene(c,{scale:54,cx:220,cy:240});s.box([0,-1.5,0],[3,2.6,2],'#6d4c2f',{alpha:.25});const L=p.type==='arith'?v*.25:v*.12;s.tube([[0,-.2,0],[0,-.2-L,0]],u=>.07*(1-u)+.02,BC.root,{segs:8});critter(s,'plant',[0,-.2,0],.4+.8*(p.type==='arith'?p.day/40:v/20),t);s.render();
  chart(c,420,96,236,170,{title:'Growth curve',xl:'days',xmin:0,xmax:40,ymin:0,series:[{fn:d=>growth(p,d),col:C.gold}],marker:[p.day,v]})},
 assumption:'Arithmetic: L₀ = 1 cm. Geometric phase modelled with a logistic curve (maximum size 20 relative units).'});
function growth(p,d){if(p.type==='arith')return 1+p.r*d*5;const K=20,W0=.2;return K/(1+(K/W0-1)*Math.exp(-p.r*d))}

add({...ch(13,'Plant Growth and Development',U4),id:'bio-phototropism',title:'Phototropism and auxin',
 description:'Shine light from one side on a coleoptile. Auxin moves to the shaded side, cells there elongate more, and the shoot bends.',
 formula:'More auxin (IAA) on the shaded side → faster elongation → bending towards light',
 observe:'Covering or removing the tip stops bending — the tip senses light (Darwin’s experiment).',
 tryText:'Cover the tip, then remove the cover. Compare the response.',
 controls:[R('ang','Light direction',-90,90,5,60,'°'),S('tip','Coleoptile tip','open',[['open','Intact tip'],['covered','Tip covered (opaque cap)'],['cut','Tip removed']]),R('hrs','Hours in light',0,12,.5,6,'h',1)],
 metrics:p=>{const b=bendAng(p);return[N('Bending',Math.abs(b),'°',0),N('Towards',b===0?'—':b>0?'Right':'Left'),N('Auxin on shaded side',p.tip==='open'&&p.ang!==0?'≈ 65%':'≈ 50% (even)'),N('Hormone','Auxin (IAA)')]},
 draw:(c,p,t)=>{const b=rad(bendAng(p)),s=P3.scene(c,{scale:60,cy:300}),L=2.4,pts=[];for(let i=0;i<=12;i++){const k=i/12,a=b*k*k;pts.push([L/12*Array.from({length:i},(_,j)=>Math.sin(b*(j/12)**2)).reduce((x,y)=>x+y,0),-1.2+L/12*Array.from({length:i},(_,j)=>Math.cos(b*(j/12)**2)).reduce((x,y)=>x+y,0),0])}
  s.box([0,-1.45,0],[1.2,.5,1.2],'#6d4c2f');if(p.tip==='cut')pts.pop();s.tube(pts,.11,(u)=>p.tip==='open'?`#${Math.round(150+60*u).toString(16)}e08a`.slice(0,7):'#a9e08a',{segs:10});const top=pts[pts.length-1];if(p.tip==='covered')s.mesh(V.add(top,[0,.05,0]),[.14,.2,.14],'#343a40');
  const la=rad(p.ang),src=[3*Math.sin(la),.8+2*Math.cos(la)*.5,0];s.ball(src,.3,'#fff3bf',{glow:true,flat:true});for(let i=0;i<5;i++)s.seg(V.add(src,[0,-.3+i*.15,0]),V.add(top,[0,-.6+i*.25,0]),'#fff3bf55',2);for(let i=0;i<8;i++){const q=cycle(t*.5+i/8,1),side=p.ang>=0?-1:1;if(p.tip==='open'&&p.ang!==0)s.ball(V.add(pts[Math.floor(q*11)],[side*.12,0,.1]),.04,'#f783ac',{flat:true})}s.render();tag(c,'pink dots: auxin moving down the shaded side',44,98,C.muted,13)},
 assumption:'Bending grows with time up to ~45°; the 65:35 auxin split is a typical illustrative value.'});
function bendAng(p){if(p.tip!=='open'||p.ang===0)return 0;return Math.sign(p.ang)*Math.min(45,Math.abs(Math.sin(rad(p.ang)))*p.hrs*6)}

add({...ch(13,'Plant Growth and Development',U4),id:'bio-photoperiodism',title:'Photoperiodism and flowering',
 description:'Set the day length and see whether a short-day, long-day or day-neutral plant flowers.',
 formula:'Short-day: flowers if day < critical length ;  long-day: if day > critical length',
 observe:'Leaves perceive the photoperiod; the flowering signal travels to the shoot apex.',
 tryText:'Set the critical length to 12 h and slowly change the day length for each plant type.',
 controls:[S('type','Plant type','ldp',[['sdp','Short-day plant'],['ldp','Long-day plant'],['dnp','Day-neutral plant']]),R('day','Day length',6,18,.5,14,'h',1),R('crit','Critical day length',10,14,.5,12,'h',1)],
 metrics:p=>{const fl=flowers(p);return[N('Flowering',fl?'Yes':'No (vegetative)'),N('Rule',p.type==='sdp'?'Needs day shorter than critical':p.type==='ldp'?'Needs day longer than critical':'Independent of day length'),N('Night length',24-p.day,'h',1)]},
 draw:(c,p,t)=>{const fl=flowers(p),s=P3.scene(c,{scale:56,cy:300,cx:240});s.box([0,-1.45,0],[1.4,.6,1.4],'#a0522d');critter(s,'plant',[0,-1.15,0],1.8,t);if(fl)for(let k=0;k<3;k++){const top=[.15*Math.cos(k*2),1.1-k*.25,.15*Math.sin(k*2)];for(let i=0;i<5;i++){const a=TAU*i/5;window.PhysicaBio.petal(s,top,[Math.cos(a),.5,Math.sin(a)],.3,.12,'#f783ac')}s.ball(top,.07,'#fab005')}
  const pts=[];for(let i=0;i<=24;i++){const a=PI*i/24;pts.push([3*Math.cos(a),-.5+2.4*Math.sin(a),-1.5])}s.path(pts,'#fab00555',2,[4,4]);const sa=PI*cycle(t*.15,1);s.ball([3*Math.cos(sa),-.5+2.4*Math.sin(sa),-1.5],.25,'#ffd43b',{glow:true,flat:true});s.render();
  c.save();c.fillStyle='#ffd43b';c.fillRect(420,380,236*p.day/24,14);c.fillStyle='#364fc7';c.fillRect(420+236*p.day/24,380,236*(1-p.day/24),14);c.fillStyle='#ff6b6b';c.fillRect(420+236*p.crit/24-1,374,2,26);c.restore();tag(c,'day / night (red mark: critical length)',420,366,C.muted,11)},
 assumption:'Simplified all-or-none response; in reality the length of the dark period is critical.'});
function flowers(p){return p.type==='dnp'||(p.type==='sdp'?p.day<p.crit:p.day>p.crit)}

done();
})();
