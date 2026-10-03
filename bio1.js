/* Biology pack 1 — NCERT Class 11, chapters 1–7 (21 experiments).
   Facts follow the rationalised NCERT Biology textbook; models are stylised but to scale where stated. */
(() => {
'use strict';
const {R,S,N,f,clamp,rad,deg,cycle,tag,chart,pack,PI,TAU,C}=window.PhysicaLab;
const P3=window.Physica3D,V=P3.vec,{BC,hash,critter,leaf,cell,capsule}=window.PhysicaBio,{add,done}=pack();
const U1='DIVERSITY IN THE LIVING WORLD',U2='STRUCTURAL ORGANISATION IN PLANTS AND ANIMALS';
const ch=(no,chapter,group)=>({grade:11,chapterNo:no,chapter,group});
const lines=(c,rows,x=44,y=98)=>rows.forEach((r,i)=>tag(c,r[0],x,y+i*21,r[1]||C.white,r[2]||13));
const pedestal=(s,p,r=.5,col='#29475b',h=.16)=>s.cyl(V.add(p,[0,-h/2,0]),[0,1,0],r,h,col,{cap:col});

/* ---------- Chapter 1: The Living World ---------- */
const TAXA={human:['Homo sapiens','Homo','Hominidae','Primata','Mammalia','Chordata','Animalia'],housefly:['Musca domestica','Musca','Muscidae','Diptera','Insecta','Arthropoda','Animalia'],
  mango:['Mangifera indica','Mangifera','Anacardiaceae','Sapindales','Dicotyledonae','Angiospermae','Plantae'],wheat:['Triticum aestivum','Triticum','Poaceae','Poales','Monocotyledonae','Angiospermae','Plantae']};
const RANKS=['Species','Genus','Family','Order','Class','Phylum / Division','Kingdom'],MODEL={human:'human',housefly:'insect',mango:'mango',wheat:'wheat'};
add({...ch(1,'The Living World',U1),id:'bio-taxonomic-hierarchy',title:'Taxonomic hierarchy',
 description:'Climb the ladder of taxonomic categories for a human, a housefly, mango and wheat (NCERT Table 1.1).',
 formula:'Species → Genus → Family → Order → Class → Phylum/Division → Kingdom',
 observe:'Each step up groups more organisms together, so the number of shared characters decreases.',
 tryText:'Compare mango and wheat: at which level do they first fall into the same taxon?',
 controls:[S('org','Organism','human',[['human','Man'],['housefly','Housefly'],['mango','Mango'],['wheat','Wheat']]),R('rank','Taxonomic category (1 = species)',1,7,1,1)],
 metrics:p=>{const t=TAXA[p.org],r=p.rank-1;return[N('Category',RANKS[r]),N('Taxon',t[r]),N('Scientific name',t[0]),N('Shared characters','Fewer as you go up')]},
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:44,cy:300,pitch:.12}),tx=TAXA[p.org];for(let i=0;i<7;i++){const lvl=6-i,y=-1.6+i*.42,r=2.6-i*.32,on=lvl===p.rank-1;s.cyl([0,y,0],[0,1,0],r,.36,on?'#42d9ca':['#1c3a4f','#21445b','#264e66','#2b5872','#30627d','#356c89','#3a7694'][i],{cap:on?'#7ff0e3':undefined,segs:32});s.label([r+.2,y,0],`${RANKS[lvl]}: ${tx[lvl]}`,on?C.mint:C.muted,on?13:11,'left')}
  const top=[0,-1.6+7*.42-.2,0];s.cyl(top,[0,1,0],.5,.05,'#e9f6ff');critter(s,MODEL[p.org],V.add(top,[0,0,0]),p.org==='human'?.75:.9,t);s.render();tag(c,'Wide base: many organisms share a kingdom; the narrow top is one species',44,98,C.muted,12)},
 assumption:'Classification exactly as in NCERT Table 1.1; Angiospermae is a Division in plants, Phylum in animals.'});

add({...ch(1,'The Living World',U1),id:'bio-dichotomous-key',title:'Using a taxonomic key',
 description:'Answer a chain of paired, contrasting questions (couplets) to identify one of six animals.',
 formula:'Each couplet offers two contrasting choices (lead)',
 observe:'A key separates organisms step by step using contrasting characters until only one remains.',
 tryText:'Find the answers that lead to the frog. How many couplets did you need?',
 controls:[S('q1','1. Vertebral column (backbone)','yes',[['yes','Present'],['no','Absent']]),S('q2','2. If absent: jointed legs','yes',[['yes','Present'],['no','Absent']]),S('q3','3. If present: paired fins or limbs','limbs',[['fins','Fins'],['limbs','Limbs']]),S('q4','4. Body covered with feathers','no',[['yes','Yes'],['no','No']]),S('q5','5. Hair and mammary glands','no',[['yes','Yes'],['no','No (moist, scaleless skin)']])],
 metrics:p=>{const r=keyResult(p);return[N('Identified',r.name),N('Couplets used',r.path.length,'',0),N('Path',r.path.join(' → '))]},
 draw:(c,p,t)=>{const r=keyResult(p),s=P3.scene(c,{scale:46,cy:310,pitch:.25}),list=[['Earthworm','earthworm'],['Cockroach','cockroach'],['Fish','fish'],['Frog','frog'],['Pigeon','bird'],['Human','human']];s.floor(4,.5,-1.3);
  list.forEach(([n,m],i)=>{const a=-.9+i*.36,x=3.2*Math.sin(a),z=-1.4+2*(1-Math.cos(a)),win=n===r.name,base=[x,win?-.5:-1.3,z];if(win){pedestal(s,[x,-.5,z],.7,'#42d9ca');s.cyl([x,-.9,z],[0,1,0],.08,.8,'#29475b')}critter(s,m,base,m==='human'?.55:.8,t);s.label(V.add(base,[0,m==='human'?1.25:1,0]),n,win?C.mint:C.muted,win?14:11)});s.render()},
 assumption:'A simplified teaching key; real keys use many more couplets and are specific to a group and region.'});
function keyResult(p){if(p.q1==='no')return p.q2==='yes'?{name:'Cockroach',path:['1','2']}:{name:'Earthworm',path:['1','2']};if(p.q3==='fins')return{name:'Fish',path:['1','3']};if(p.q4==='yes')return{name:'Pigeon',path:['1','3','4']};return p.q5==='yes'?{name:'Human',path:['1','3','4','5']}:{name:'Frog',path:['1','3','4','5']}}

/* ---------- Chapter 2: Biological Classification ---------- */
const KING={monera:['Prokaryotic','Non-cellulosic (polysaccharide + amino acid)','Absent','Cellular','Autotrophic (chemo/photo) and heterotrophic','bacterium','Bacteria'],protista:['Eukaryotic','Present in some','Present','Cellular','Autotrophic (photosynthetic) and heterotrophic','paramecium','Paramecium'],
  fungi:['Eukaryotic','Present, without cellulose (chitin)','Present','Multicellular / loose tissue','Heterotrophic (saprophytic or parasitic)','mushroom','Mushroom'],plantae:['Eukaryotic','Present (cellulose)','Present','Tissue / organ','Autotrophic (photosynthetic)','plant','Flowering plant'],animalia:['Eukaryotic','Absent','Present','Tissue / organ / organ system','Heterotrophic (holozoic, etc.)','frog','Frog']};
add({...ch(2,'Biological Classification',U1),id:'bio-five-kingdoms',title:'Whittaker’s five kingdoms',
 description:'Compare the five kingdoms on cell type, cell wall, nuclear membrane, body organisation and nutrition (NCERT Table 2.1).',
 formula:'Criteria: cell structure · body organisation · nutrition · reproduction · phylogeny',
 observe:'Only Monera is prokaryotic; fungi have chitin walls while plants have cellulose walls.',
 tryText:'Which kingdom is the only one whose members lack a cell wall entirely?',
 controls:[S('k','Kingdom','monera',[['monera','Monera'],['protista','Protista'],['fungi','Fungi'],['plantae','Plantae'],['animalia','Animalia']])],
 metrics:p=>{const d=KING[p.k];return[N('Cell type',d[0]),N('Cell wall',d[1]),N('Nuclear membrane',d[2]),N('Body organisation',d[3]),N('Nutrition',d[4])]},
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:50,cy:280,pitch:.22}),keys=Object.keys(KING);s.floor(4,.5,-1.2);keys.forEach((k,i)=>{const a=-.95+i*.475,x=3*Math.sin(a),z=-1.2+2.2*(1-Math.cos(a)),on=k===p.k,y=on?-.3:-1.2;pedestal(s,[x,y,z],.62,on?'#42d9ca':'#29475b');if(on)s.cyl([x,-.75,z],[0,1,0],.08,.9,'#29475b');
  critter(s,KING[k][5],[x,y,z],on?.95:.6,t);s.label([x,y-.35,z+.7],k[0].toUpperCase()+k.slice(1),on?C.mint:C.muted,on?14:11)});s.render();tag(c,'Representative: '+KING[p.k][6],44,98,C.gold,14)},
 assumption:'Representative organisms only; kingdom features summarised from NCERT Table 2.1.'});

add({...ch(2,'Biological Classification',U1),id:'bio-bacterial-growth',title:'Bacterial shapes and binary fission',
 description:'Choose a bacterial shape and watch a colony multiply by binary fission. Each generation doubles the number of cells.',
 formula:'N = N₀ × 2ⁿ,  n = t / g',
 observe:'Under ideal conditions growth is exponential — numbers explode after a few hours.',
 tryText:'Set g = 20 min (E. coli in rich medium). How many cells after 4 hours from one cell?',
 controls:[S('shape','Shape','bacillus',[['coccus','Coccus (spherical)'],['bacillus','Bacillus (rod)'],['vibrio','Vibrio (comma)'],['spirillum','Spirillum (spiral)']]),R('g','Generation time g',10,120,5,20,'min'),R('h','Time elapsed',0,8,.1,2,'h',1),R('N0','Starting cells N₀',1,100,1,1)],
 metrics:p=>{const n=p.h*60/p.g,Nn=p.N0*2**n;return[N('Generations',n,'',2),N('Population',Nn,'cells',3),N('Doubling time',p.g,'min',0)]},
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:56}),n=p.h*60/p.g,Nn=p.N0*2**n,cnt=Math.min(60,Math.max(1,Math.round(Nn))),split=cycle(t*.5,1);
  for(let i=0;i<cnt;i++){const y=1-2*(i+.5)/cnt,r=Math.sqrt(1-y*y),a=i*2.4,R0=.35*Math.cbrt(cnt),q=[R0*r*Math.cos(a),R0*y,R0*r*Math.sin(a)],rot=hash(i)*PI;shapeCell(s,p.shape,q,rot,i===0?split:0,t)}s.render();
  tag(c,cnt<Nn?`Showing 60 of ${f(Nn,0)} cells`:`${f(Nn,0)} cells`,44,98,C.gold,14)},
 assumption:'Exponential phase only (unlimited nutrients and space); generation times vary with species and conditions.'});
function shapeCell(s,shape,q,rot,split,t){const col='#82c91e',d=[Math.cos(rot),Math.sin(rot)*.4,Math.sin(rot)];
  if(shape==='coccus'){if(split>.5){s.ball(V.add(q,V.mul(d,.08*split)),.11,col);s.ball(V.sub(q,V.mul(d,.08*split)),.11,col)}else s.ball(q,.13,col)}
  else if(shape==='bacillus'){const L=.18+.1*split;if(split>.7){capsule(s,V.add(q,V.mul(d,.05)),V.add(q,V.mul(d,L)),.07,col);capsule(s,V.sub(q,V.mul(d,.05)),V.sub(q,V.mul(d,L)),.07,col)}else capsule(s,V.add(q,V.mul(d,L)),V.sub(q,V.mul(d,L)),.07,col)}
  else if(shape==='vibrio'){const pts=Array.from({length:7},(_,i)=>V.add(q,[(i-3)*.06*Math.cos(rot),.05*Math.sin(i*.5),(i-3)*.06*Math.sin(rot)+.04*Math.cos(i*.5)]));s.tube(pts,.055,col,{segs:8});s.seg(pts[6],V.add(pts[6],[.15*Math.cos(rot),.02*Math.sin(t*9),.15*Math.sin(rot)]),'#c0eb75',1.2)}
  else{const pts=Array.from({length:22},(_,i)=>V.add(q,[(i-11)*.025*Math.cos(rot)+.05*Math.cos(i*.9)*Math.sin(rot),.05*Math.sin(i*.9),(i-11)*.025*Math.sin(rot)-.05*Math.cos(i*.9)*Math.cos(rot)]));s.tube(pts,.03,col,{segs:6})}}

add({...ch(2,'Biological Classification',U1),id:'bio-bacteriophage',title:'Bacteriophage: the lytic cycle',
 description:'A bacteriophage (a virus that infects bacteria) attaches, injects its DNA, multiplies and bursts the cell.',
 formula:'Phages after n cycles ≈ (burst size)ⁿ',
 observe:'Viruses are inert outside a host cell; inside, they take over the host’s machinery to make copies of themselves.',
 tryText:'Raise the burst size and watch how quickly phage numbers grow over cycles.',
 controls:[R('burst','Burst size (phages per cell)',50,200,10,100),R('cycles','Infection cycles',1,4,1,1)],
 metrics:(p,t)=>{const st=['Attachment','Injection of DNA','Replication of phage DNA','Assembly of new phages','Lysis (cell bursts)'][Math.floor(cycle(t,10)/2)];return[N('Stage now',st),N('Genetic material','Double-stranded DNA'),N('Phages produced',p.burst**p.cycles,'',0)]},
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:48,cy:280}),ph=cycle(t,10),stage=Math.floor(ph/2),k=(ph%2)/2;
  if(stage<4)capsule(s,[-1.6,-.6,0],[1.6,-.6,0],.9,'#a9e34b');else{for(let i=0;i<10;i++){const a=TAU*i/10;s.poly([[1.6*Math.cos(a),-.6+.9*Math.sin(a)*.4,-.2],[1.4*Math.cos(a+.3),-.6+.9*Math.sin(a+.3)*.4,.2],[(1.6+k)*Math.cos(a+.15),-.6+(.9+k)*Math.sin(a+.15)*.4,0]],'#a9e34b',{cull:false,alpha:.7})}}
  const top=stage===0?[0,2.4-1.4*k,0]:[0,1,0];phage(s,top,1,stage===1?k:stage>1?1:0);if(stage<=1){s.callout(V.add(top,[.3,1.05,0]),'head: protein coat with DNA','#e9f6ff',55,-18);s.callout(V.add(top,[.1,.25,0]),stage===1?'tail sheath contracts':'tail sheath','#e9f6ff',70,-4);s.callout(V.add(top,[.55,-.4,.25]),'tail fibres','#e9f6ff',60,18)}if(stage<4)s.callout([-1.3,-.2,.6],'host: E. coli bacterium','#a9e34b',-30,-50);
  if(stage>=1&&stage<4){const L=stage===1?k:1;s.path(Array.from({length:20},(_,i)=>[.15*Math.sin(i*1.3),.3-L*i*.06,.15*Math.cos(i*1.1)]),'#ff6b6b',2.5)}
  if(stage===2)for(let i=0;i<Math.round(2+k*10);i++)s.ring([-1.2+hash(i)*2.4,-.6+(hash(i+3)-.5)*.8,(hash(i+6)-.5)*.6],[0,0,1],.12,'#ff6b6b',2);
  if(stage>=3){const n=stage===3?Math.round(2+k*10):12;for(let i=0;i<n;i++){const q=[-1.3+hash(i)*2.6,-.6+(hash(i+3)-.5)*.9,(hash(i+6)-.5)*.6];phage(s,stage===4?V.add(q,V.mul(V.norm(V.add(q,[0,.6,0])),k*1.4)):q,.28,0)}}s.render()},
 assumption:'Schematic T-even phage; burst sizes of roughly 50–200 are typical. Each cycle assumes every new phage infects a fresh cell.'});
function phage(s,p,k,sheathed){const A=(x,y,z)=>V.add(p,[x*k,y*k,z*k]);s.mesh(A(0,.95,0),[.32*k,.42*k,.32*k],'#ced4da',{rings:4,segs:6,shine:40,spec:.7});s.cyl(A(0,.48,0),[0,1,0],.12*k,.1*k,'#adb5bd');s.cyl(A(0,.15,0),[0,1,0],.08*k,(.6-.2*sheathed)*k,'#868e96');s.cyl(A(0,-.18,0),[0,1,0],.2*k,.06*k,'#6c757d');
  for(let i=0;i<6;i++){const a=TAU*i/6;s.path([A(.18*Math.cos(a),-.18,.18*Math.sin(a)),A(.45*Math.cos(a),-.05,.45*Math.sin(a)),A(.6*Math.cos(a),-.45,.6*Math.sin(a))],'#adb5bd',1.6)}}

/* ---------- Chapter 3: Plant Kingdom ---------- */
const CYCLES={haplontic:{n:.82,dom:'Gametophyte (haploid, n)',meio:'In the zygote (zygotic meiosis)',ex:'Volvox, Spirogyra, some Chlamydomonas',g:'algae',sp:null},diplontic:{n:.15,dom:'Sporophyte (diploid, 2n)',meio:'During spore (gamete-precursor) formation in the sporophyte',ex:'Gymnosperms, angiosperms; Fucus (alga)',g:null,sp:'pine'},
  bryo:{n:.62,dom:'Gametophyte; sporophyte depends on it',meio:'In the capsule — haploid spores',ex:'Bryophytes (Funaria, Marchantia)',g:'moss',sp:null},pterido:{n:.35,dom:'Sporophyte; gametophyte (prothallus) is free-living, short-lived',meio:'In sporangia — haploid spores',ex:'Pteridophytes (Pteris, Selaginella)',g:null,sp:'fern'}};
add({...ch(3,'Plant Kingdom',U1),id:'bio-life-cycles',title:'Alternation of generations',
 description:'Follow plant life cycles round the loop of haploid (n) and diploid (2n) phases. Compare which phase dominates.',
 formula:'2n sporophyte —meiosis→ n spores → n gametophyte —gametes, syngamy→ 2n zygote',
 observe:'Haplontic cycles have only a one-celled diploid zygote; diplontic cycles have only a few-celled haploid stage.',
 tryText:'Compare bryophytes with pteridophytes — which generation is the main plant body in each?',
 controls:[S('type','Life cycle','bryo',[['haplontic','Haplontic'],['diplontic','Diplontic'],['bryo','Haplo-diplontic: bryophytes'],['pterido','Haplo-diplontic: pteridophytes']])],
 metrics:p=>{const d=CYCLES[p.type];return[N('Dominant phase',d.dom),N('Meiosis occurs',d.meio),N('Examples',d.ex),N('Haploid share of cycle (schematic)',d.n*100,'%',0)]},
 draw:(c,p,t)=>{const d=CYCLES[p.type],s=P3.scene(c,{scale:52,pitch:.55}),Rr=2.2,a0=-PI/2,split=a0+TAU*d.n;
  const arc=(from,to,col)=>{const pts=[];for(let i=0;i<=40;i++){const a=from+(to-from)*i/40;pts.push([Rr*Math.cos(a),0,Rr*Math.sin(a)])}s.tube(pts,.12,col,{segs:8})};arc(a0,split,'#4dabf7');arc(split,a0+TAU,'#fab005');
  s.ball([Rr*Math.cos(a0),.0,Rr*Math.sin(a0)],.2,'#e64980',{label:'syngamy → zygote (2n)'});s.ball([Rr*Math.cos(split),0,Rr*Math.sin(split)],.2,'#9775fa',{label:'meiosis → spores (n)'});
  const a=a0+TAU*cycle(t/8,1);s.ball([Rr*Math.cos(a),.25,Rr*Math.sin(a)],.13,C.white,{glow:true});const mid=(x,y)=>[Rr*.45*Math.cos((x+y)/2),-.2,Rr*.45*Math.sin((x+y)/2)];
  if(d.g)critter(s,d.g,mid(a0,split),.9,t);else s.ball(mid(a0,split),.12,'#4dabf7');if(d.sp)critter(s,d.sp,mid(split,a0+TAU),.9,t);else if(p.type==='haplontic')s.ball(mid(split,a0+TAU),.12,'#fab005');else{critter(s,'moss',mid(split,a0+TAU),.7,t)}
  s.label([0,1.4,0],'blue: haploid (n)   gold: diploid (2n)',C.muted,12);s.render()},
 assumption:'Arc lengths are schematic and show which generation dominates, not actual time spent.'});

const GROUPS={algae:['Absent','No seeds','Gametophyte-dominant (most)','Chlamydomonas, Spirogyra, Ulothrix','algae'],bryophytes:['Absent (no true vascular tissue)','No seeds','Gametophyte (sporophyte dependent)','Funaria, Marchantia, Sphagnum','moss'],
  pteridophytes:['Present (xylem and phloem)','No seeds','Sporophyte','Pteris, Selaginella, Equisetum','fern'],gymnosperms:['Present','Naked seeds (no fruit wall)','Sporophyte','Pinus, Cycas, Ginkgo','pine'],angiosperms:['Present','Seeds enclosed in fruits','Sporophyte','Mango, wheat, mustard','plant']};
add({...ch(3,'Plant Kingdom',U1),id:'bio-plant-groups',title:'From algae to flowering plants',
 description:'Step through the five plant groups and see how vascular tissue, seeds and the dominant generation change.',
 formula:'Algae → Bryophytes → Pteridophytes → Gymnosperms → Angiosperms',
 observe:'Pteridophytes are the first land plants with vascular tissue; gymnosperm seeds are naked, angiosperm seeds lie inside fruits.',
 tryText:'Why are bryophytes called the “amphibians of the plant kingdom”?',
 controls:[S('g','Plant group','pteridophytes',[['algae','Algae'],['bryophytes','Bryophytes'],['pteridophytes','Pteridophytes'],['gymnosperms','Gymnosperms'],['angiosperms','Angiosperms']])],
 metrics:p=>{const d=GROUPS[p.g];return[N('Vascular tissue',d[0]),N('Seeds',d[1]),N('Main plant body',d[2]),N('Examples',d[3])]},
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:50,cy:280,pitch:.22}),keys=Object.keys(GROUPS);s.floor(4,.5,-1.2);keys.forEach((k,i)=>{const a=-.95+i*.475,x=3*Math.sin(a),z=-1.2+2.2*(1-Math.cos(a)),on=k===p.g,y=on?-.3:-1.2;pedestal(s,[x,y,z],.62,on?'#42d9ca':'#29475b');if(on)s.cyl([x,-.75,z],[0,1,0],.08,.9,'#29475b');
  critter(s,GROUPS[k][4],[x,y,z],on?1.1:.65,t);if(k==='angiosperms')for(let j=0;j<5;j++){const q=TAU*j/5;window.PhysicaBio.petal(s,[x,y+1.2*(on?1.1:.65),z],[Math.cos(q),.4,Math.sin(q)],.22,.09)}s.label([x,y-.35,z+.7],k[0].toUpperCase()+k.slice(1),on?C.mint:C.muted,on?14:11)});s.render()},
 assumption:'Representative models; within each group there is much variation (e.g. some algae are diplontic).'});

const ALGAE={chloro:['Chlorophyll a, b','Starch','Cellulose','2–8, equal, apical','Chlamydomonas, Volvox, Spirogyra','#40c057'],phaeo:['Chlorophyll a, c, fucoxanthin','Mannitol, laminarin','Cellulose and algin','2, unequal, lateral','Ectocarpus, Laminaria, Fucus','#a0782b'],rhodo:['Chlorophyll a, d, r-phycoerythrin','Floridean starch','Cellulose, pectin, polysulphate esters','Absent','Polysiphonia, Porphyra, Gracilaria','#c92a2a']};
add({...ch(3,'Plant Kingdom',U1),id:'bio-algae-classes',title:'Green, brown and red algae',
 description:'Compare the three classes of algae by pigments, stored food, cell wall and flagella (NCERT Table 3.1).',
 formula:'Pigments decide colour: chlorophylls (green), fucoxanthin (brown), phycoerythrin (red)',
 observe:'Red algae can live at great depths, where little light penetrates.',
 tryText:'Move the depth slider down while viewing each class.',
 controls:[S('cls','Class','chloro',[['chloro','Chlorophyceae (green)'],['phaeo','Phaeophyceae (brown)'],['rhodo','Rhodophyceae (red)']]),R('depth','Water depth',0,60,1,5,'m')],
 metrics:p=>{const d=ALGAE[p.cls];return[N('Pigments',d[0]),N('Stored food',d[1]),N('Cell wall',d[2]),N('Flagella',d[3]),N('Examples',d[4])]},
 draw:(c,p,t)=>{const d=ALGAE[p.cls],s=P3.scene(c,{scale:50,cy:262,pitch:.12}),y=1.6-p.depth/60*3.2,light=Math.exp(-p.depth/20);s.box([0,0,0],[6,3.6,2.4],'#1971c2',{alpha:.18});for(let i=0;i<6;i++)s.seg([-2.4+i,1.8,-.4],[-2.4+i+.6,1.8-3.4*light,.2],'#fff3bf'+Math.round(80*light+20).toString(16).padStart(2,'0'),3);
  for(let f=0;f<5;f++){const pts=Array.from({length:12},(_,i)=>[-.6+f*.3+.12*Math.sin(i*.6+t+f),y-.6+i*.12,.1*Math.cos(f)]);s.tube(pts,u=>.05+.04*Math.sin(PI*u),d[5],{segs:8});if(p.cls!=='chloro')s.mesh(V.add(pts[11],[0,.1,0]),[.18,.08,.04],d[5],{rot:[0,0,f]})}s.label([1.5,y,0],`${p.depth} m`,C.white,13);s.render();tag(c,`Light reaching this depth (illustrative): ${f(light*100,0)} %`,44,98,C.gold,13)},
 assumption:'Light attenuation curve is illustrative; table entries from NCERT Table 3.1.'});

/* ---------- Chapter 4: Animal Kingdom ---------- */
const SYM={sponge:['Asymmetrical','sponge','Sponges (Porifera)'],hydra:['Radial','hydra','Coelenterates, ctenophores'],starfish:['Radial (adult, five-part)','starfish','Echinoderms (adult)'],earthworm:['Bilateral','earthworm','Annelids, arthropods, chordates'],frog:['Bilateral','frog','Annelids, arthropods, chordates']};
add({...ch(4,'Animal Kingdom',U1),id:'bio-body-symmetry',title:'Body symmetry',
 description:'Rotate a cutting plane through each animal. Does it give two identical (mirror) halves?',
 formula:'Radial: any plane through the central axis ;  Bilateral: only one plane',
 observe:'Bilaterally symmetrical animals can be divided into identical left and right halves in only one plane.',
 tryText:'Turn the plane around the starfish. How many angles work?',
 controls:[S('a','Animal','frog',[['sponge','Sponge'],['hydra','Hydra'],['starfish','Starfish'],['earthworm','Earthworm'],['frog','Frog']]),R('ang','Cutting plane angle',0,180,1,0,'°')],
 metrics:p=>{const ok=symOK(p);return[N('Symmetry',SYM[p.a][0]),N('Mirror halves at this plane?',ok?'Yes':'No'),N('Found in',SYM[p.a][2])]},
 draw:(c,p,t)=>{const ok=symOK(p),s=P3.scene(c,{scale:66,cy:300,pitch:.35}),a=rad(p.ang),dir=[Math.cos(a),0,Math.sin(a)];s.floor(3,.5,0);critter(s,SYM[p.a][1],[0,0,0],1.4,t);
  const pl=[V.add(V.mul(dir,-1.8),[0,-.1,0]),V.add(V.mul(dir,1.8),[0,-.1,0]),V.add(V.mul(dir,1.8),[0,2.2,0]),V.add(V.mul(dir,-1.8),[0,2.2,0])];s.poly(pl,ok?'#40c057':'#fa5252',{alpha:.28,cull:false,stroke:ok?'#40c057':'#fa5252',lw:2});s.render();
  tag(c,ok?'Identical halves ✓':'Halves are not mirror images',44,98,ok?C.mint:C.red,15)},
 assumption:'Planes are vertical and pass through the body’s central axis; small body details are ignored.'});
function symOK(p){const a=((p.ang%180)+180)%180;if(p.a==='sponge')return false;if(p.a==='hydra')return true;if(p.a==='starfish')return Math.min(a%36,36-a%36)<=2;return Math.min(a,180-a)<=2}

const LAYERS={diplo:['Diploblastic (ectoderm, endoderm; mesoglea between)','No true body cavity','Coelenterates (Hydra), ctenophores'],acoel:['Triploblastic','Acoelomate — no body cavity','Platyhelminthes (flatworms)'],pseudo:['Triploblastic','Pseudocoelom — mesoderm in scattered pouches','Aschelminthes (roundworms)'],coel:['Triploblastic','True coelom — cavity lined by mesoderm','Annelids to chordates']};
add({...ch(4,'Animal Kingdom',U1),id:'bio-germ-layers-coelom',title:'Germ layers and the body cavity',
 description:'Slice through four body plans and see the germ layers and whether a body cavity (coelom) is present.',
 formula:'Coelom = body cavity lined by mesoderm',
 observe:'In a pseudocoelomate the mesoderm forms scattered pouches, so the cavity is not fully lined by mesoderm.',
 tryText:'Compare the pseudocoelomate and coelomate sections — where is the mesoderm?',
 controls:[S('type','Body plan','coel',[['diplo','Diploblastic'],['acoel','Acoelomate'],['pseudo','Pseudocoelomate'],['coel','Coelomate']])],
 metrics:p=>{const d=LAYERS[p.type];return[N('Germ layers',d[0]),N('Body cavity',d[1]),N('Examples',d[2])]},
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:66,yaw:.6,pitch:.25}),L=3.2,ax=[1,0,0],ecto='#4dabf7',meso='#fa5252',endo='#fcc419';const ring=(r0,r1,col,x=L/2)=>{const n=40;for(let i=0;i<n;i++){const a=TAU*i/n,b=TAU*(i+1)/n;s.poly([[x,r0*Math.cos(a),r0*Math.sin(a)],[x,r0*Math.cos(b),r0*Math.sin(b)],[x,r1*Math.cos(b),r1*Math.sin(b)],[x,r1*Math.cos(a),r1*Math.sin(a)]],col,{normal:[1,0,0],cull:false})}};
  s.cyl([0,0,0],ax,1.5,L,ecto,{caps:false,alpha:.35});ring(1.3,1.5,ecto);
  if(p.type==='diplo'){ring(.55,1.3,'#ced4da');ring(.35,.55,endo);s.label([L/2+.1,.9,0],'mesoglea',C.muted,12)}
  if(p.type==='acoel'){ring(.55,1.3,meso);ring(.35,.55,endo)}
  if(p.type==='pseudo'){ring(1.1,1.3,meso);ring(.35,.55,endo);s.label([L/2+.1,.85,0],'pseudocoelom',C.gold,12)}
  if(p.type==='coel'){ring(1.1,1.3,meso);ring(.55,.75,meso);ring(.35,.55,endo);s.label([L/2+.1,.92,0],'coelom',C.gold,12)}
  s.cyl([0,0,0],ax,.35,L,'#2b2b2b',{caps:false,alpha:.5});s.label([L/2+.2,0,0],'gut',C.white,12);s.label([L/2,1.75,0],'ectoderm',ecto,12);s.render();tag(c,'blue: ectoderm   red: mesoderm   yellow: endoderm',44,98,C.muted,13)},
 assumption:'Schematic transverse sections; organs inside the cavity are omitted.'});

const PHYLA=[['porifera','Porifera','Cellular','Asymmetrical (mostly)','Absent','Pores and canals in body wall','sponge'],['coelenterata','Coelenterata (Cnidaria)','Tissue','Radial','Absent','Cnidoblasts (stinging cells)','hydra'],['ctenophora','Ctenophora','Tissue','Radial','Absent','Comb plates for locomotion','combjelly'],
  ['platyhelminthes','Platyhelminthes','Organ and organ-system','Bilateral','Absent (acoelomate)','Flat body, suckers','flatworm'],['aschelminthes','Aschelminthes','Organ-system','Bilateral','Pseudocoelom','Worm-shaped, elongated','roundworm'],['annelida','Annelida','Organ-system','Bilateral','Coelomate','Ring-like body segmentation','earthworm'],
  ['arthropoda','Arthropoda','Organ-system','Bilateral','Coelomate','Exoskeleton of cuticle, jointed appendages','insect'],['mollusca','Mollusca','Organ-system','Bilateral','Coelomate','External skeleton of shell usually present','snail'],['echinodermata','Echinodermata','Organ-system','Radial (adult)','Coelomate','Water vascular system','starfish'],
  ['hemichordata','Hemichordata','Organ-system','Bilateral','Coelomate','Proboscis, collar and trunk','balanoglossus'],['chordata','Chordata','Organ-system','Bilateral','Coelomate','Notochord, dorsal hollow nerve cord, gill slits','fish']];
add({...ch(4,'Animal Kingdom',U1),id:'bio-phylum-explorer',title:'Phylum explorer',
 description:'Spin through the major animal phyla and compare their key features (NCERT Table 4.2).',
 formula:'Levels of organisation · symmetry · coelom · segmentation',
 observe:'Complexity rises from cellular organisation in sponges to organ systems in later phyla.',
 tryText:'Which phyla are coelomate but not segmented?',
 controls:[S('ph','Phylum','arthropoda',PHYLA.map(r=>[r[0],r[1]]))],
 metrics:p=>{const d=PHYLA.find(r=>r[0]===p.ph);return[N('Organisation',d[2]),N('Symmetry',d[3]),N('Coelom',d[4]),N('Distinctive feature',d[5])]},
 draw:(c,p,t)=>{const d=PHYLA.find(r=>r[0]===p.ph),s=P3.scene(c,{scale:66,cy:310,pitch:.3,yaw:t*.25});pedestal(s,[0,-.4,0],1.6,'#29475b',.3);critter(s,d[6],[0,-.25,0],1.6,t);s.render();tag(c,d[1],44,98,C.gold,16)},
 assumption:'One representative per phylum; features from NCERT Table 4.2.'});

const CFEAT=[['notochord','Notochord','Present','Absent'],['nerve','Central nervous system','Dorsal, hollow, single','Ventral, solid, double'],['gill','Pharynx','Perforated by gill slits','Gill slits absent'],['heart','Heart','Ventral','Dorsal (if present)'],['tail','Post-anal part (tail)','Present','Absent']];
add({...ch(4,'Animal Kingdom',U1),id:'bio-chordate-features',title:'Chordates vs non-chordates',
 description:'Look inside a transparent body and compare the five key differences between chordates and non-chordates (NCERT Table 4.1).',
 formula:'Chordate hallmark: notochord + dorsal hollow nerve cord + pharyngeal gill slits',
 observe:'In chordates the nerve cord is dorsal and the heart ventral — the reverse of non-chordates.',
 tryText:'Switch between the two plans while highlighting the nervous system.',
 controls:[S('plan','Body plan','chordate',[['chordate','Chordate'],['non','Non-chordate']]),S('feat','Highlight','nerve',CFEAT.map(r=>[r[0],r[1]]))],
 metrics:p=>CFEAT.map(r=>N(r[1],p.plan==='chordate'?r[2]:r[3])),
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:62,yaw:.3,pitch:.15}),ch_=p.plan==='chordate',hi=k=>k===p.feat;s.mesh([0,0,0],[2.6,.75,.6],'#a5d8ff',{alpha:.18,shape:(u,v)=>1-.25*Math.max(0,-Math.cos(v))});s.tube([[-2.2,-.1,0],[0,-.15,0],[2.2,-.05,0]],.16,'#e599a7',{alpha:.5});
  const glow=(k,col)=>hi(k)?'#ffd43b':col;
  if(ch_){s.tube([[-2.3,.15,0],[2.2,.2,0]],.09,glow('notochord','#ced4da'));s.tube([[-2.4,.42,0],[2.3,.45,0]],.08,glow('nerve','#ffa94d'));for(let i=0;i<5;i++)s.box([1.5-i*.22,-.05,0],[.06,.4,.7],glow('gill','#5c7cfa'),{alpha:.8});s.ball([1.1,-.5,0],.18,glow('heart','#e03131'));s.tube([[-2.2,.1,0],[-3.3,.15+.1*Math.sin(t*3),0]],u=>.25*(1-u)+.03,glow('tail','#74c0fc'))}
  else{for(const z of[-.08,.08])s.tube([[-2.2,-.5,z],[2.2,-.45,z]],.04,glow('nerve','#ffa94d'));s.tube([[-1.6,.45,0],[1.4,.45,0]],.07,glow('heart','#e03131'))}
  if(ch_){s.callout([-.6,.2,.08],'notochord','#e9f6ff',-30,-60);s.callout([.6,.46,.08],'dorsal hollow nerve cord','#ffa94d',20,-60);s.callout([1.2,-.05,.35],'pharyngeal gill slits','#91a7ff',40,30);s.callout([1.1,-.6,.1],'ventral heart','#ff8787',40,40);s.callout([-2.9,.15,0],'post-anal tail','#74c0fc',-10,-50)}else{s.callout([-.4,-.5,.08],'ventral solid double nerve cord','#ffa94d',-40,40);s.callout([0,.45,.07],'dorsal heart','#ff8787',30,-50);s.callout([1.9,0,.3],'no notochord, no gill slits','#e9f6ff',20,-40)}
  s.render();const r=CFEAT.find(x=>x[0]===p.feat);tag(c,`${r[1]}: ${ch_?r[2]:r[3]}`,44,98,C.gold,15)},
 assumption:'A generalised body plan for comparison, not a particular species.'});

/* ---------- Chapter 5: Morphology of Flowering Plants ---------- */
const PHY={alternate:[1,'137.5° spiral between successive leaves','China rose, mustard, sunflower'],opposite:[2,'Pairs at 180°; successive pairs often at right angles','Calotropis, guava'],whorled:[3,'Three or more leaves at a node','Alstonia']};
add({...ch(5,'Morphology of Flowering Plants',U2),id:'bio-phyllotaxy',title:'Phyllotaxy: arrangement of leaves',
 description:'Grow a shoot and choose how leaves are arranged at its nodes: alternate, opposite or whorled.',
 formula:'Alternate: 1 leaf per node ;  opposite: 2 ;  whorled: > 2',
 observe:'Spiral and crossed arrangements let lower leaves avoid being shaded by those above.',
 tryText:'Look down the stem from above for the alternate pattern. Do leaves overlap?',
 controls:[S('type','Phyllotaxy','alternate',[['alternate','Alternate'],['opposite','Opposite (decussate)'],['whorled','Whorled']]),R('nodes','Number of nodes',3,10,1,7)],
 metrics:p=>{const d=PHY[p.type];return[N('Leaves per node',d[0],'',0),N('Pattern',d[1]),N('Examples',d[2]),N('Total leaves',d[0]*p.nodes,'',0)]},
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:54,cy:330,pitch:.35}),d=PHY[p.type],H=3.6;s.plate([0,-.05,0],[3,3],'#3b2a1a');s.tube([[0,0,0],[0,H*.5,0],[0,H,0]],u=>.07*(1-u*.5),BC.stem,{segs:10});
  for(let i=0;i<p.nodes;i++){const y=.4+i*(H-.6)/p.nodes;for(let j=0;j<d[0];j++){const a=p.type==='alternate'?rad(137.5)*i:p.type==='opposite'?PI*j+(i%2)*PI/2:TAU*j/3+(i%2)*PI/3;leaf(s,[0,y,0],[Math.cos(a),.35,Math.sin(a)],.75*(1-i*.05),.25,i===p.nodes-1?'#69db7c':BC.leaf,.2)}s.ring([0,y,0],[0,1,0],.08,'#5c940d',2)}{const y1=.4,y2=.4+(H-.6)/p.nodes;s.callout([0,y1,0],'node','#d8f5a2',-60,10);s.callout([0,(y1+y2)/2,0],'internode','#d8f5a2',-70,-10)}s.render()},
 assumption:'Idealised shoot with equal internodes; the 137.5° divergence angle is the common Fibonacci spiral.'});

const ROOTS={tap:['Tap root system','Dicotyledons','Mustard','Primary root persists and bears lateral roots'],fibrous:['Fibrous root system','Monocotyledons','Wheat','Primary root short-lived; many roots from the stem base'],adv:['Adventitious roots','From parts other than the radicle','Banyan (prop roots), maize (stilt), grass','Arise from stem or other organs']};
add({...ch(5,'Morphology of Flowering Plants',U2),id:'bio-root-systems',title:'Root systems',
 description:'Grow the three kinds of root system in a cut-away soil block.',
 formula:'Tap · fibrous · adventitious',
 observe:'In monocots like wheat the primary root is short-lived and is replaced by many roots from the stem base.',
 tryText:'Grow each system for 30 days and compare how deep and how wide they spread.',
 controls:[S('type','Root system','tap',[['tap','Tap root'],['fibrous','Fibrous root'],['adv','Adventitious (prop roots)']]),R('days','Days of growth',1,30,1,20,'days')],
 metrics:p=>{const d=ROOTS[p.type];return[N('Type',d[0]),N('Typical in',d[1]),N('Example',d[2]),N('Feature',d[3])]},
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:52,cy:240,pitch:.2}),g=p.days/30;s.box([0,-1.4,0],[5,2.8,2.4],'#6d4c2f',{alpha:.28});s.box([0,-.02,0],[5,.04,2.4],'#8d6e4f',{alpha:.6});
  if(p.type==='tap'){s.tube([[0,0,0],[0,-1*g,0],[.05,-2.6*g,0]],u=>.09*(1-u)+.015,BC.root,{segs:8});for(let i=1;i<7;i++){const y=-i*.35*g,a=i*2.2;s.tube([[0,y,0],[.5*Math.cos(a)*g,y-.15,.5*Math.sin(a)*g],[1*Math.cos(a)*g,y-.45*g,1*Math.sin(a)*g]],u=>.03*(1-u)+.008,BC.root,{segs:6})}critter(s,'plant',[0,0,0],1.1,t)}
  else if(p.type==='fibrous'){for(let i=0;i<14;i++){const a=TAU*i/14,L=(1.3+hash(i))*g;s.tube([[0,0,0],[.4*Math.cos(a)*g,-L*.5,.4*Math.sin(a)*g],[.7*Math.cos(a)*g,-L,.7*Math.sin(a)*g]],u=>.025*(1-u)+.006,BC.root,{segs:5})}critter(s,'wheat',[0,0,0],1.1,t)}
  else{s.cyl([0,1,0],[0,1,0],.18,2,'#6d4c2f');s.mesh([0,2.3,0],[1.8,.7,1.2],'#2b8a3e');for(let i=0;i<5;i++){const x=-1.4+i*.7,top=1.9;s.tube([[x,top,(hash(i)-.5)],[x,top-(top+.6)*g,(hash(i)-.5)]],.04,'#8d6e4f',{segs:6})}s.callout([-1.4,.5,0],'prop (adventitious) roots from branches','#c2a26b',-30,-60)}
  if(p.type==='tap'){s.callout([.03,-1.6*g,0],'primary (tap) root','#c2a26b',60,20);s.callout([.7*Math.cos(2.2),-.55*g,.7*Math.sin(2.2)],'lateral roots','#c2a26b',-60,30)}else if(p.type==='fibrous')s.callout([.5,-.8*g,0],'fibrous roots from stem base','#c2a26b',60,30);s.callout([2.3,0,0],'soil surface','#8d6e4f',20,-30);s.render()},
 assumption:'Root growth shown schematically; real depth depends on species, soil and water.'});

const OVARY={hypo:['Hypogynous','Superior ovary','Mustard, China rose, brinjal'],peri:['Perigynous','Half-inferior ovary','Plum, rose, peach'],epi:['Epigynous','Inferior ovary','Guava, cucumber, ray florets of sunflower']};
add({...ch(5,'Morphology of Flowering Plants',U2),id:'bio-flower-ovary',title:'Position of the ovary on the thalamus',
 description:'Cut a flower lengthwise. See where sepals, petals and stamens attach relative to the ovary, and choose its symmetry.',
 formula:'Hypogynous (superior) · Perigynous (half-inferior) · Epigynous (inferior)',
 observe:'In epigynous flowers the thalamus grows up around the ovary, so the other floral parts arise above it.',
 tryText:'Switch to a zygomorphic flower: how many planes now give equal halves?',
 controls:[S('pos','Ovary position','hypo',[['hypo','Hypogynous'],['peri','Perigynous'],['epi','Epigynous']]),S('sym','Symmetry','acti',[['acti','Actinomorphic (radial)'],['zygo','Zygomorphic (one plane)']])],
 metrics:p=>{const d=OVARY[p.pos];return[N('Flower type',d[0]),N('Ovary',d[1]),N('Examples',d[2]),N('Symmetry',p.sym==='acti'?'Actinomorphic — mustard, datura, chilli':'Zygomorphic — pea, gulmohur, bean')]},
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:66,cy:300,pitch:.25}),oy={hypo:.55,peri:.35,epi:.05}[p.pos],ry={hypo:.2,peri:.55,epi:.75}[p.pos];s.tube([[0,-1.6,0],[0,-.3,0]],.06,BC.stem,{segs:8});
  const prof=p.pos==='hypo'?[[.06,-.3],[.3,-.1],[.35,.2],[.0,.3]]:p.pos==='peri'?[[.06,-.3],[.35,-.1],[.6,.5],[.55,.52],[.3,.0],[.0,.05]]:[[.06,-.3],[.45,-.1],[.5,.4],[.4,.75],[.2,.8]];s.lathe([0,0,0],prof,'#94d82d',{segs:20});
  s.mesh([0,oy,0],[.22,.3,.22],'#c0eb75',{alpha:p.pos==='epi'?.6:undefined});s.tube([[0,oy+.25,0],[0,oy+.85,0]],.03,'#d8f5a2',{segs:6});s.ball([0,oy+.88,0],.06,'#fab005');
  for(let i=0;i<5;i++){const a=TAU*i/5,big=p.sym==='zygo'&&i===0,sz=p.sym==='zygo'?(i===0?1.5:i===2||i===3?.7:1):1;window.PhysicaBio.petal(s,[.3*Math.cos(a),ry,.3*Math.sin(a)],[Math.cos(a),big?1.6:.6,Math.sin(a)],.9*sz,.32*sz)}
  for(let i=0;i<6;i++){const a=TAU*i/6+.3;s.tube([[.25*Math.cos(a),ry,.25*Math.sin(a)],[.32*Math.cos(a),ry+.7,.32*Math.sin(a)]],.015,'#fff3bf',{segs:5});s.ball([.32*Math.cos(a),ry+.72,.32*Math.sin(a)],.045,'#f59f00')}for(let i=0;i<5;i++){const a=TAU*i/5+PI/5;window.PhysicaBio.petal(s,[.26*Math.cos(a),ry-.06,.26*Math.sin(a)],[Math.cos(a),.15,Math.sin(a)],.45,.18,'#69db7c')}
  s.callout([.2,oy,.15],p.pos==='hypo'?'ovary (superior)':p.pos==='peri'?'ovary (half-inferior)':'ovary (inferior)','#d8f5a2',-60,10);s.callout([.38,-.12,0],'thalamus','#e9f6ff',-80,30);s.callout([0,oy+.9,0],'stigma','#fab005',-50,-30);s.callout([.32*Math.cos(.3),ry+.72,.32*Math.sin(.3)],'stamen (anther)','#f59f00',60,-30);s.callout([.9,ry+.35,0],'petal','#ff8fab',50,-10);s.callout([.55*Math.cos(PI/5),ry-.03,.55*Math.sin(PI/5)],'sepal','#69db7c',50,30);s.render();tag(c,'green: thalamus · pale: ovary',44,98,C.muted,13)},
 assumption:'Schematic flower; real flowers vary in the number of parts.'});

const FAM={fab:['% ⚥ K(5) C1+2+(2) A(9)+1 G1','Papilionaceous corolla; diadelphous stamens','Pea, gram, soybean, groundnut','Pulses, edible oil, fodder'],sol:['⊕ ⚥ K(5) C(5) A5 G(2)','Five united petals; epipetalous stamens; swollen placenta','Potato, brinjal, tomato, chilli','Food, spice, medicine (belladonna)'],lil:['Br ⊕ ⚥ P(3+3) A3+3 G(3)','Six tepals in two whorls; trilocular ovary','Tulip, Gloriosa, Aloe, Asparagus','Ornamentals, medicines, vegetables']};
add({...ch(5,'Morphology of Flowering Plants',U2),id:'bio-floral-families',title:'Floral formulae of three families',
 description:'Build typical flowers of Fabaceae, Solanaceae and Liliaceae and read their floral formulae.',
 formula:'K calyx · C corolla · P perianth · A androecium · G gynoecium ; ( ) = fused',
 observe:'The floral formula compresses a flower’s symmetry, sex and the number and fusion of its parts into one line.',
 tryText:'Count the stamens in the pea flower: how many are fused and how many free?',
 controls:[S('fam','Family','sol',[['fab','Fabaceae (pea family)'],['sol','Solanaceae (potato family)'],['lil','Liliaceae (lily family)']])],
 metrics:p=>{const d=FAM[p.fam];return[N('Floral formula',d[0]),N('Key features',d[1]),N('Examples',d[2]),N('Uses',d[3])]},
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:70,cy:300,pitch:.35,yaw:t*.2}),B=window.PhysicaBio;s.tube([[0,-1.6,0],[0,0,0]],.05,BC.stem,{segs:8});
  if(p.fam==='sol'){s.lathe([0,0,0],[[.05,0],[.25,.2],[.35,.45],[.0,.47]],'#e5dbff',{segs:24});for(let i=0;i<5;i++){const a=TAU*i/5;B.petal(s,[.3*Math.cos(a),.42,.3*Math.sin(a)],[Math.cos(a),.15,Math.sin(a)],.6,.3,'#d0bfff');s.mesh([.12*Math.cos(a+.6),.6,.12*Math.sin(a+.6)],[.04,.14,.04],'#fab005')}s.mesh([0,.35,0],[.1,.12,.1],'#94d82d');s.tube([[0,.4,0],[0,.85,0]],.02,'#d8f5a2',{segs:5})}
  else if(p.fam==='lil'){for(let w=0;w<2;w++)for(let i=0;i<3;i++){const a=TAU*i/3+w*PI/3;B.petal(s,[0,.05,0],[Math.cos(a),.9-w*.2,Math.sin(a)],1.1-w*.1,.32,w?'#ff8787':'#ffa8a8')}for(let i=0;i<6;i++){const a=TAU*i/6;s.tube([[0,.1,0],[.25*Math.cos(a),.85,.25*Math.sin(a)]],.012,'#fff3bf',{segs:4});s.mesh([.25*Math.cos(a),.88,.25*Math.sin(a)],[.03,.08,.03],'#e67700')}s.mesh([0,.3,0],[.09,.2,.09],'#94d82d',{shape:(u,v)=>1+.15*Math.cos(3*v)})}
  else{B.petal(s,[0,.1,0],[0,1,-.25],1.1,.55,'#9775fa');for(const z of[-1,1])B.petal(s,[0,.1,z*.05],[.7,.25,z*.7],.65,.22,'#b197fc');s.mesh([.35,.1,0],[.4,.12,.08],'#e5dbff',{rot:[0,0,-.3]});s.tube([[0,.12,0],[.55,.18,0]],.03,'#fff3bf',{segs:6});}
  if(p.fam==='sol'){s.callout([.6,.45,0],'corolla: 5 united petals','#d0bfff',60,-30);s.callout([.12,.65,.1],'epipetalous stamens (5)','#fab005',-70,-50);s.callout([0,.35,.1],'ovary: 2 carpels (G2)','#94d82d',-70,40);s.callout([.2,.2,.1],'calyx: 5 united sepals','#e5dbff',60,40)}else if(p.fam==='lil'){s.callout([.8,.75,0],'perianth: 6 tepals (3 + 3)','#ff8787',50,-40);s.callout([.25,.88,0],'stamens (3 + 3)','#e67700',-60,-40);s.callout([0,.3,.09],'superior ovary, 3 carpels','#94d82d',-70,40)}else{s.callout([0,1.0,-.25],'standard (vexillum)','#9775fa',60,-30);s.callout([.5,.3,.5],'2 wings (alae)','#b197fc',60,20);s.callout([.5,.12,.08],'keel (2 fused petals)','#e5dbff',50,50)}
  s.render();tag(c,FAM[p.fam][0],44,98,C.gold,17)},
 assumption:'Typical flowers of each family; NCERT floral formulae. Symbols: % zygomorphic, ⊕ actinomorphic, ⚥ bisexual, Br bracteate.'});

/* ---------- Chapter 6: Anatomy of Flowering Plants ---------- */
const STEM={dicot:['Ring (in a circle)','Conjoint, collateral, open (cambium present)','Large pith present','Hypodermis of collenchyma'],monocot:['Scattered through ground tissue','Conjoint, collateral, closed (no cambium)','No distinct pith','Hypodermis of sclerenchyma']};
add({...ch(6,'Anatomy of Flowering Plants',U2),id:'bio-stem-anatomy',title:'Dicot vs monocot stem',
 description:'Compare transverse sections of dicot and monocot stems: arrangement and type of vascular bundles.',
 formula:'Open bundles (with cambium) → secondary growth possible',
 observe:'Dicot bundles lie in a ring and contain cambium; monocot bundles are scattered and closed.',
 tryText:'Which stem could later thicken by secondary growth? Why?',
 controls:[S('type','Stem','dicot',[['dicot','Dicot (e.g. sunflower)'],['monocot','Monocot (e.g. maize)']])],
 metrics:p=>{const d=STEM[p.type];return[N('Vascular bundles',d[0]),N('Bundle type',d[1]),N('Pith',d[2]),N('Hypodermis',d[3])]},
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:62,pitch:.55,cy:290}),H=1.4,Rr=2;s.cyl([0,0,0],[0,1,0],Rr,H,'#b2f2bb',{cap:'#d3f9d8',segs:40});s.ring([0,H/2+.01,0],[0,1,0],Rr-.06,'#2b8a3e',3);s.ring([0,H/2+.01,0],[0,1,0],Rr-.25,'#69db7c',2);
  const bundle=(x,z,r)=>{const d=Math.max(.12,Math.hypot(x,z)),ux=x/d,uz=z/d;s.cyl([x,H/2+.005,z],[0,1,0],r,.02,'#e9ecef',{caps:true,cap:'#f1f3f5'});s.ball([x-ux*r*.4,H/2+.03,z-uz*r*.4],r*.45,'#e03131',{flat:true});s.ball([x+ux*r*.45,H/2+.03,z+uz*r*.45],r*.4,'#2f9e44',{flat:true})};
  if(p.type==='dicot'){s.ring([0,H/2+.01,0],[0,1,0],1.25,'#ffa94d',2,[3,3]);for(let i=0;i<12;i++){const a=TAU*i/12;bundle(1.25*Math.cos(a),1.25*Math.sin(a),.18)}s.label([0,H/2+.15,0],'pith',C.muted,12)}
  else for(let i=0;i<34;i++){const r=1.75*Math.sqrt(hash(i)),a=TAU*hash(i+40);bundle(r*Math.cos(a),r*Math.sin(a),.08+.08*(1-r/1.8))}if(p.type==='dicot'){s.callout([1.25,H/2+.03,0],'vascular bundle (conjoint, open)','#e9f6ff',50,-40);s.callout([0,H/2+.02,1.25],'cambium ring','#ffa94d',40,40)}else{s.callout([.6,H/2+.03,.5],'scattered vascular bundles (closed)','#e9f6ff',60,-50);s.callout([-.9,H/2+.02,.3],'ground tissue','#e9f6ff',-50,-40)}s.callout([-Rr+.03,H/2,0],'epidermis','#2b8a3e',-50,-10);s.callout([-.7,H/2,-Rr+.35],'cortex / hypodermis','#69db7c',-70,-60);
  s.render();tag(c,'red: xylem   green: phloem   orange dashes: cambium ring',44,98,C.muted,13)},
 assumption:'Simplified transverse section; xylem shown toward the centre (endarch) as in stems.'});

add({...ch(6,'Anatomy of Flowering Plants',U2),id:'bio-annual-rings',title:'Secondary growth and annual rings',
 description:'Let a dicot tree grow year by year. Cambium adds wide spring wood and narrow, dense autumn wood each year.',
 formula:'Age ≈ number of annual rings',
 observe:'Each spring–autumn pair forms one annual ring; counting rings estimates the tree’s age.',
 tryText:'Add years and watch the dark heartwood grow in the centre.',
 controls:[R('years','Age of tree',1,30,1,12,'years'),R('spring','Spring (early) wood per year',1,6,.5,3,'mm',1),R('autumn','Autumn (late) wood per year',.3,2,.1,.8,'mm',1)],
 metrics:p=>{const r=p.years*(p.spring+p.autumn)/10;return[N('Annual rings',p.years,'',0),N('Trunk radius (wood)',r,'cm',1),N('Heartwood rings (inner, non-conducting)',Math.max(0,p.years-8),'',0),N('Sapwood rings (outer, conducting)',Math.min(p.years,8),'',0)]},
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:56,pitch:.6,cy:290}),per=(p.spring+p.autumn),Rmax=2.4,k=Rmax/Math.max(30*per,p.years*per),H=.6;let r=.05;
  const disc=(r0,r1,col)=>{const n=48;for(let i=0;i<n;i++){const a=TAU*i/n,b=TAU*(i+1)/n,w=x=>1+.03*Math.sin(x*5+r0*3);s.poly([[r0*w(a)*Math.cos(a),H/2,r0*w(a)*Math.sin(a)],[r0*w(b)*Math.cos(b),H/2,r0*w(b)*Math.sin(b)],[r1*w(b)*Math.cos(b),H/2,r1*w(b)*Math.sin(b)],[r1*w(a)*Math.cos(a),H/2,r1*w(a)*Math.sin(a)]],col,{normal:[0,1,0],z:-5e5+10})}};
  for(let y=1;y<=p.years;y++){const heart=y<=p.years-8,r1=r+p.spring*k,r2=r1+p.autumn*k;disc(r,r1,heart?'#8d5a34':'#e9c99a');disc(r1,r2,heart?'#5c3a21':'#a87b4f');r=r2}
  s.cyl([0,0,0],[0,1,0],r+.12,H,'#5a3d2b',{caps:false,segs:40});disc(r,r+.12,'#3b2a1a');s.callout([-(r+.06),H/2,0],'bark','#c9a27e',-50,-30);if(p.years>8){const rh=(p.years-8)*per*k;s.callout([rh*.5,H/2,0],'heartwood (dark, non-conducting)','#d9a066',40,-70)}s.callout([0,H/2,r*.92],'sapwood (outer, conducting)','#e9c99a',60,50);{const r1=.05+p.spring*k*.5;s.callout([0,H/2,-(r1+.05)],'spring wood (light, wide)','#e9c99a',-60,-60)}s.render();tag(c,`Count the dark bands: ${p.years}`,44,98,C.gold,15)},
 assumption:'One growth ring per year (temperate climate); heartwood shown for rings older than 8 years — the real number varies by species.'});

add({...ch(6,'Anatomy of Flowering Plants',U2),id:'bio-stomata',title:'Stomata: guard cells at work',
 description:'Change the turgor of the guard cells and watch the stomatal pore open and close.',
 formula:'Turgid guard cells → pore opens ;  flaccid → pore closes',
 observe:'The thick inner walls and radial outer walls of guard cells make them bow apart when they swell with water.',
 tryText:'Compare the bean-shaped dicot guard cells with the dumb-bell shaped grass guard cells.',
 controls:[S('type','Guard cells','bean',[['bean','Bean-shaped (dicot)'],['dumb','Dumb-bell shaped (grasses)']]),R('turgor','Guard-cell turgor',0,100,1,70,'%')],
 metrics:p=>{const open=p.turgor/100;return[N('Pore state',open>.25?'Open':'Closed'),N('Relative aperture',open*100,'%',0),N('Water vapour loss (transpiration)',open>.25?'Possible':'Minimal'),N('Guard-cell type',p.type==='bean'?'Bean-shaped, with chloroplasts':'Dumb-bell shaped (grasses)')]},
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:66,pitch:.8,cy:270}),o=p.turgor/100,gap=.04+.32*o;for(let i=0;i<14;i++){const x=-2.6+(i%7)*.86,z=(i<7?-1:1)*1.25;s.box([x,-.1,z],[.82,.2,.9],'#c3fae8',{alpha:.7})}
  for(const sg of[-1,1]){let pts;if(p.type==='bean')pts=Array.from({length:13},(_,i)=>{const a=-PI/2+PI*i/12;return[1.05*Math.sin(a),0,sg*(gap+(.55)*Math.cos(a)*(.75+.25*o))]});else pts=Array.from({length:13},(_,i)=>{const x=-1.1+2.2*i/12;return[x,0,sg*(gap+.12)]});
   s.tube(pts,p.type==='bean'?.2:(u=>.1+.16*Math.pow(Math.abs(u-.5)*2,3)),'#8ce99a',{segs:10});for(let i=0;i<4;i++)s.ball(pts[3+i*2],.05,'#2b8a3e',{flat:true,lift:.3})}
  if(p.type==='dumb')for(const sg of[-1,1])s.mesh([0,0,sg*(gap+.55)],[1.1,.15,.22],'#b2f2bb',{alpha:.8});s.ball([0,-.25,0],.05,'#1971c2',{flat:true});s.callout([.6,.15,-(gap+.35)],'guard cell (bean-shaped)','#2b8a3e',-40,-70);s.callout([0,0,0],o>.04?'stomatal pore':'pore closed','#e9f6ff',-70,-50);s.callout([-2.6,.0,-1.25],'epidermal cells','#96f2d7',-20,-40);s.callout([.55,.06,gap+.42],'chloroplasts','#8ce99a',60,50);if(p.type==='dumb')s.callout([0,.1,-(gap+.55)],'subsidiary cell','#b2f2bb',-60,40);s.render();tag(c,o>.25?'Open pore':'Closed pore',44,98,o>.25?C.mint:C.gold,15)},
 assumption:'Aperture shown proportional to turgor for teaching; in reality opening depends on K⁺ uptake, light and CO₂ levels.'});

/* ---------- Chapter 7: Structural Organisation in Animals ---------- */
const EPI={squamous:['Single layer of flat cells','Walls of blood vessels, air sacs of lungs','Diffusion boundary'],cuboidal:['Single layer of cube-like cells','Ducts of glands, tubular parts of nephrons','Secretion and absorption'],columnar:['Single layer of tall, slender cells','Lining of stomach and intestine','Secretion and absorption'],
  ciliated:['Columnar or cuboidal cells with cilia','Bronchioles, fallopian tubes','Move particles or mucus in one direction'],compound:['Two or more layers of cells','Skin surface, buccal cavity, pharynx','Protection against chemical and mechanical stress']};
add({...ch(7,'Structural Organisation in Animals',U2),id:'bio-epithelial-tissue',title:'Epithelial tissues',
 description:'Build sheets of epithelium from flat, cube-shaped or tall cells, with or without cilia.',
 formula:'Simple (one layer) vs compound (many layers)',
 observe:'Thin squamous cells suit diffusion; tall columnar cells hold more machinery for secretion and absorption.',
 tryText:'Switch to ciliated epithelium and watch the cilia beat in waves.',
 controls:[S('type','Epithelium','columnar',[['squamous','Squamous'],['cuboidal','Cuboidal'],['columnar','Columnar'],['ciliated','Ciliated'],['compound','Compound (stratified)']])],
 metrics:p=>{const d=EPI[p.type];return[N('Cells',d[0]),N('Found in',d[1]),N('Function',d[2])]},
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:60,pitch:.35,cy:290}),h={squamous:.18,cuboidal:.55,columnar:1.1,ciliated:1.1,compound:.45}[p.type],w={squamous:.9,cuboidal:.55,columnar:.42,ciliated:.42,compound:.5}[p.type],nx=Math.round(4.8/w),nz=Math.round(2.4/w);s.box([0,-.06,0],[5,.1,2.6],'#e9ecef',{ground:true});
  const layers=p.type==='compound'?4:1;for(let L=0;L<layers;L++){const hh=p.type==='compound'?[.4,.32,.22,.12][L]:h,y0=p.type==='compound'?[0,.4,.72,.94][L]:0,ww=p.type==='compound'?[.45,.55,.7,.9][L]:w;
   for(let i=0;i<Math.round(4.8/ww);i++)for(let j=0;j<Math.round(2.4/ww);j++){const x=-2.4+ww*(i+.5),z=-1.2+ww*(j+.5);s.box([x,y0+hh/2,z],[ww*.96,hh,ww*.96],L===layers-1&&p.type==='compound'?'#ffd8a8':'#ffc9c9');if(hh>.2)s.ball([x,y0+hh*.4,z],Math.min(ww,hh)*.22,BC.nucleus,{flat:true,lift:.1});
    if(p.type==='ciliated'&&i%1===0)for(let k=0;k<3;k++){const q=Math.sin(t*6-i*.8)*.18;s.seg([x-.1+k*.1,h,z],[x-.1+k*.1+q,h+.25,z],'#74c0fc',1.2)}}}const tp=p.type==='compound'?1.06:h;s.callout([-2.4+w*.5,tp*.5,1.2],'epithelial cell','#ffc9c9',-40,-50);if(tp>.2||p.type==='compound')s.callout([-2.4+w*1.5,(p.type==='compound'?.16:h*.4),1.2],'nucleus','#b197fc',-30,50);s.callout([2.4,-.06,1.3],'basement membrane','#e9f6ff',40,30);if(p.type==='ciliated')s.callout([0,h+.22,-1.2],'cilia','#74c0fc',40,-40);if(p.type==='compound')s.callout([2.2,1.0,-1.1],'flattened surface cells','#ffd8a8',40,-40);s.render();tag(c,'pink: cells   purple: nuclei   grey: basement membrane',44,98,C.muted,13)},
 assumption:'Cells drawn as regular prisms; real cells interlock irregularly.'});

const ROACH={external:['Head, thorax (3 segments), abdomen (10 segments)','3 pairs of jointed legs; 2 pairs of wings (forewings = tegmina)','Compound eyes with about 2000 ommatidia each'],digestive:['Foregut (crop, gizzard), midgut, hindgut','6–8 hepatic (gastric) caeca at the foregut–midgut junction','Gizzard grinds food'],circulatory:['Open circulatory system','Heart: tube with 13 funnel-shaped chambers, ostia on sides','Haemolymph: colourless plasma + haemocytes'],
  excretory:['Malpighian tubules (about 100–150)','Excretes uric acid (uricotelic)','Fat body, nephrocytes and urecose glands also help'],respiratory:['Network of tracheae','10 pairs of spiracles on the sides of the body','Exchange of gases by diffusion'],nervous:['Fused, segmentally arranged ganglia','Paired ventral nerve cord; 3 thoracic and 6 abdominal ganglia','Brain (supra-oesophageal ganglion) in the head']};
add({...ch(7,'Structural Organisation in Animals',U2),id:'bio-cockroach',title:'Cockroach: organ systems',
 description:'Explore a cockroach (Periplaneta americana) and highlight each organ system in turn.',
 formula:'Head · thorax (pro-, meso-, metathorax) · abdomen (10 segments)',
 observe:'Cockroaches have an open circulatory system and breathe through tracheae opening at spiracles.',
 tryText:'Highlight the excretory system: where do the Malpighian tubules join the gut?',
 controls:[S('sys','Organ system','digestive',Object.keys(ROACH).map(k=>[k,k[0].toUpperCase()+k.slice(1)]))],
 metrics:p=>ROACH[p.sys].map((v,i)=>N(['Structure','Detail','Note'][i],v)),
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:64,pitch:.55,cy:290}),k=2.4,sys=p.sys,A=(x,y,z)=>[x*k,y*k,z*k];if(sys==='external')critter(s,'cockroach',[0,-.4,0],k,t);else{s.mesh(A(-.3,.32,0),[.42*k,.13*k,.22*k],'#8b4513',{alpha:.32});s.mesh(A(.25,.35,0),[.2*k,.14*k,.17*k],'#7a3e1d',{alpha:.32});s.mesh(A(.55,.35,0),[.13*k,.12*k,.13*k],'#7a3e1d',{alpha:.35})}
  const Y=v=>v*k-.4*0;if(sys==='digestive'){s.tube([A(.6,.33,0),A(.4,.33,0),A(.2,.3,0),A(0,.3,0),A(-.3,.28,.05),A(-.55,.3,-.03),A(-.72,.3,0)],u=>u<.35?.05*k:.03*k,'#fab005',{segs:8});s.mesh(A(.28,.3,0),[.09*k,.06*k,.07*k],'#f08c00');for(let i=0;i<7;i++){const a=TAU*i/7;s.tube([A(.12,.3,0),A(.12+.08*Math.cos(a),.3+.05*Math.sin(a),.08*Math.sin(a))],.012*k,'#ffd43b',{segs:5})}}
  if(sys==='circulatory'){for(let i=0;i<13;i++)s.mesh(A(.35-i*.085,.42,0),[.04*k,.025*k,.03*k],'#ff6b6b',{rings:6,segs:10});s.label(A(.1,.6,0),'13 chambers',C.red,12)}
  if(sys==='excretory'){s.tube([A(.2,.3,0),A(-.72,.3,0)],.025*k,'#ced4da',{alpha:.6});for(let i=0;i<40;i++){const a=TAU*hash(i),L=.15+.15*hash(i+5);s.path([A(0,.3,0),A(-.05-L*.3,.3+.08*Math.sin(a),L*Math.cos(a)*.6),A(-.1-L*.6,.3+.1*Math.sin(a+1),L*Math.cos(a)*.9)],'#fff3bf',1.2)}}
  if(sys==='respiratory'){for(let i=0;i<10;i++)for(const z of[-1,1]){const x=.35-i*.11;s.ball(A(x,.3,z*.19),.018*k,'#4dabf7',{flat:true});s.path([A(x,.3,z*.19),A(x-.03,.33,z*.1),A(x-.08,.3,0)],'#a5d8ff',1.2)}s.tube([A(.4,.33,.1),A(-.7,.31,.1)],.008*k,'#a5d8ff',{segs:4});s.tube([A(.4,.33,-.1),A(-.7,.31,-.1)],.008*k,'#a5d8ff',{segs:4})}
  if(sys==='nervous'){s.mesh(A(.58,.4,0),[.06*k,.05*k,.07*k],'#ffd43b');for(const z of[-.02,.02])s.tube([A(.55,.22,z),A(-.65,.22,z)],.006*k,'#ffd43b',{segs:4});for(let i=0;i<9;i++)s.ball(A(.4-i*.12,.22,0),.025*k,'#fab005',{flat:true})}
  if(sys!=='external'){for(const sx of[.4,.25,.1])for(const z of[-1,1])s.tube([A(sx,.32,z*.12),A(sx-.05,.42,z*.32),A(sx-.12,0,z*.5)],.02*k,'#7a3e1d',{segs:6,alpha:.45});for(const z of[-1,1])s.tube([A(.65,.42,z*.05),A(.95,.7,z*.25),A(1.25,.75,z*.5)],.01*k,'#7a3e1d',{segs:5,alpha:.5})}
  const L=(q,txt,col,dx,dy)=>s.callout(A(...q),txt,col,dx,dy);
  if(sys==='external'){L([.6,.45,0],'head','#e9f6ff',20,-60);L([.25,.48,0],'thorax (pronotum)','#e9f6ff',-20,-70);L([-.4,.45,0],'abdomen (10 segments)','#e9f6ff',-40,-60);L([1.1,.72,.38],'antenna','#e9f6ff',40,-20);L([-.3,.52,.3],'wings','#e9f6ff',-60,30);L([.12,.05,.48],'3 pairs of jointed legs','#e9f6ff',50,40)}
  if(sys==='digestive'){L([.48,.33,0],'crop','#fab005',-40,-70);L([.28,.32,.06],'gizzard','#f08c00',10,-80);L([.12,.36,.1],'hepatic caeca','#ffd43b',80,-20);L([-.15,.29,.04],'midgut','#fab005',40,50);L([-.65,.3,0],'hindgut (rectum)','#fab005',-40,40)}
  if(sys==='circulatory')L([-.3,.44,0],'open system: blood in haemocoel','#ff8787',-60,40);
  if(sys==='excretory')L([-.2,.33,.14],'Malpighian tubules','#fff3bf',50,-50);
  if(sys==='respiratory'){L([.35,.3,.19],'spiracles (10 pairs)','#4dabf7',50,-40);L([-.3,.31,.1],'tracheae','#a5d8ff',40,40)}
  if(sys==='nervous'){L([.58,.43,0],'brain (supra-oesophageal ganglion)','#ffd43b',-10,-60);L([-.2,.22,0],'ventral nerve cord with ganglia','#fab005',-30,50)}
  s.render();tag(c,p.sys[0].toUpperCase()+p.sys.slice(1)+' system',44,98,C.gold,15)},
 assumption:'Stylised cockroach; organ positions are approximate. Facts from NCERT Chapter 7.'});

done();
})();
