/* Biology pack 4 — NCERT Class 12, chapters 1–6 (19 experiments).
   Genetics uses exact Mendelian probabilities; random samples are reproducible (seeded). */
(() => {
'use strict';
const {R,S,N,f,clamp,rad,deg,cycle,tag,chart,pack,PI,TAU,C}=window.PhysicaLab;
const P3=window.Physica3D,V=P3.vec,{BC,hash,critter,leaf,petal,cell,capsule,chromosome,helix}=window.PhysicaBio,{add,done}=pack();
const U6='REPRODUCTION',U7='GENETICS AND EVOLUTION';
const ch=(no,chapter,group)=>({grade:12,chapterNo:no,chapter,group});
// Deterministic pseudo-random stream for reproducible samples.
const rng=seed=>{let x=Math.floor(seed*9973+7)>>>0;return()=>{x=(x*1664525+1013904223)>>>0;return x/4294967296}};
const along=(path,q)=>{const i=Math.min(path.length-2,Math.floor(q*(path.length-1))),fr=q*(path.length-1)-i;return V.add(path[i],V.mul(V.sub(path[i+1],path[i]),fr))};

/* ---------- Chapter 1: Sexual Reproduction in Flowering Plants ---------- */
const DF=[['Pollination','Pollen grain lands on the stigma'],['Pollen tube growth','Tube grows through the style towards the ovule'],['Entry into ovule','Tube enters through the micropyle into a synergid'],['Double fertilisation','Male gamete + egg → zygote (2n); male gamete + 2 polar nuclei → PEN (3n)'],['Result','Zygote → embryo; PEN → endosperm']];
add({...ch(1,'Sexual Reproduction in Flowering Plants',U6),id:'bio-double-fertilisation',title:'Double fertilisation',
 description:'Follow a pollen tube down the style into the embryo sac, where two male gametes take part in two separate fusions.',
 formula:'Syngamy: n + n → 2n zygote ;  triple fusion: n + n + n → 3n PEN',
 observe:'Double fertilisation — two fusions in one embryo sac — is unique to flowering plants.',
 tryText:'Pause at triple fusion. Which three nuclei fuse?',
 controls:[R('speed','Speed',.3,2,.1,1,'×',1)],
 metrics:(p,t)=>{const k=Math.min(4,Math.floor(cycle(t*p.speed,15)/3));return[N('Stage',DF[k][0]),N('What happens',DF[k][1]),N('Zygote','Diploid (2n)'),N('Primary endosperm nucleus','Triploid (3n)')]},
 draw:(c,p,t)=>{const T=cycle(t*p.speed,15),k=Math.min(4,Math.floor(T/3)),q=(T%3)/3,s=P3.scene(c,{scale:58,cy:262});s.mesh([0,-1.2,0],[1.1,1.0,1.0],'#c0eb75',{alpha:.25});s.tube([[0,-.25,0],[0,1.6,0]],.18,'#d8f5a2',{alpha:.3});s.mesh([0,1.75,0],[.42,.18,.42],'#ffd43b',{alpha:.6});
  s.mesh([.2,-1.3,0],[.5,.62,.42],'#ffe066',{alpha:.3});const es=[.2,-1.3,0];const tubePath=[[0,1.8,.1],[0,1.0,.05],[0,0,0],[.05,-.6,.05],[.18,-.85,.0]];
  if(k===0)s.ball([.15,1.95-.2*(1-q),.1],.13,'#f59f00',{label:'pollen'});else{s.ball([.15,1.95,.1],.13,'#f59f00');const reach=k===1?q:1;s.tube(tubePath.filter((_,i)=>i<=Math.ceil(reach*4)),.04,'#fab005',{segs:6})}
  s.ball(V.add(es,[0,-.35,0]),.09,BC.female,{label:k<3?'egg':''});for(const z of[-.15,.15])s.ball(V.add(es,[.1,-.4,z]),.06,'#e599f7');for(const y of[.05,-.05])s.ball(V.add(es,[0,y,0]),.07,'#b197fc');for(let i=0;i<3;i++)s.ball(V.add(es,[(i-1)*.12,.45,0]),.05,'#adb5bd');
  if(k===3){const g1=V.add(V.mul([.18,-.85,0],1-q),V.mul(V.add(es,[0,-.35,0]),q)),g2=V.add(V.mul([.18,-.85,0],1-q),V.mul(es,q));s.ball(g1,.06,BC.male,{glow:true});s.ball(g2,.06,BC.male,{glow:true})}
  if(k===4){s.ball(V.add(es,[0,-.35,0]),.13,'#e64980',{label:'zygote (2n)'});s.ball(es,.12,'#9775fa',{label:'PEN (3n)'})}s.render();tag(c,DF[k][0],44,98,C.gold,15)},
 assumption:'Schematic pistil and one ovule; polar nuclei shown at the centre of the embryo sac.'});

const ES=[['Megaspore mother cell (2n)',1,1],['Meiosis → 4 megaspores (n)',4,4],['3 degenerate; 1 functional megaspore',1,1],['Mitosis 1 → 2 nuclei',2,1],['Mitosis 2 → 4 nuclei',4,1],['Mitosis 3 → 8 nuclei',8,1],['Mature embryo sac: 7 cells, 8 nuclei',8,7]];
add({...ch(1,'Sexual Reproduction in Flowering Plants',U6),id:'bio-embryo-sac',title:'Development of the embryo sac',
 description:'Step through megasporogenesis and the three free-nuclear divisions that build the 7-celled, 8-nucleate embryo sac.',
 formula:'1 functional megaspore → 3 mitoses → 8 nuclei → 7 cells (monosporic development)',
 observe:'At the micropylar end: egg apparatus (2 synergids + egg); at the chalazal end: 3 antipodals; centre: 2 polar nuclei.',
 tryText:'Count the nuclei and the cells at the final stage.',
 controls:[R('stage','Stage',1,7,1,7)],
 metrics:p=>{const d=ES[p.stage-1];return[N('Stage',d[0]),N('Nuclei',d[1],'',0),N('Cells',d[2],'',0),N('Ploidy','Haploid nuclei (n) after meiosis')]},
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:62}),st=p.stage;s.mesh([0,0,0],[1.6,1.1,1.0],'#d8f5a2',{alpha:.25});s.mesh([0,0,0],[1.15,.62,.55],'#ffe066',{alpha:.25});s.label([-1.8,0,0],'micropyle',C.muted,11);s.label([1.8,0,0],'chalaza',C.muted,11);
  if(st===1)s.ball([0,0,0],.25,'#9775fa');else if(st===2)for(let i=0;i<4;i++)s.ball([-.6+i*.4,0,0],.17,'#b197fc');else if(st===3){for(let i=0;i<3;i++)s.ball([-.7+i*.35,0,0],.12,'#868e96');s.ball([.6,0,0],.22,'#9775fa')}
  else if(st<7){const n=2**(st-3);for(let i=0;i<n;i++){const side=i<n/2?-1:1,j=i%(n/2);s.ball([side*.7,(j-(n/4-.5))*.25,0],.1,'#9775fa',{glow:true})}}
  else{s.ball([-.85,0,0],.12,'#e64980',{label:'egg'});s.ball([-.95,.25,.1],.09,'#e599f7');s.ball([-.95,-.25,.1],.09,'#e599f7');s.ball([0,.08,0],.09,'#b197fc');s.ball([0,-.08,0],.09,'#b197fc');s.label([0,.5,0],'2 polar nuclei',C.purple,11);for(let i=0;i<3;i++)s.ball([.9,(i-1)*.25,0],.09,'#adb5bd');s.label([.9,.55,0],'antipodals',C.muted,11);s.label([-1,.55,0],'synergids','#f783ac',11)}s.render()},
 assumption:'Polygonum type (monosporic) embryo sac, as described in NCERT.'});

const POLL={auto:['Autogamy','Pollen to stigma of the same flower','Genetically identical (selfing)'],geit:['Geitonogamy','Pollen to another flower of the same plant','Functionally cross, genetically self'],xeno:['Xenogamy','Pollen to a flower of a different plant','Brings genetically different pollen']};
add({...ch(1,'Sexual Reproduction in Flowering Plants',U6),id:'bio-pollination',title:'Kinds and agents of pollination',
 description:'Move pollen within a flower, between flowers of one plant, or between plants — by wind or by insects.',
 formula:'Autogamy · geitonogamy · xenogamy',
 observe:'Wind-pollinated flowers make light, non-sticky pollen and feathery stigmas; insect-pollinated flowers are colourful with nectar.',
 tryText:'Switch to wind and see how much pollen misses.',
 controls:[S('type','Type','xeno',Object.keys(POLL).map(k=>[k,POLL[k][0]])),S('agent','Agent','insect',[['insect','Insect (bee)'],['wind','Wind']])],
 metrics:p=>{const d=POLL[p.type];return[N('Type',d[0]),N('Pollen goes to',d[1]),N('Genetics',d[2]),N('Agent features',p.agent==='wind'?'Light pollen, feathery stigma, often no nectar':'Colour, scent, nectar; sticky pollen')]},
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:50,cy:300,pitch:.2}),plant=(x,flowers)=>{s.tube([[x,-1.6,0],[x,.6,0]],.05,BC.stem,{segs:8});flowers.forEach(([dx,dy],i)=>{const q=[x+dx,dy,0];s.tube([[x,dy-.3,0],q],.03,BC.stem,{segs:5});for(let k=0;k<5;k++){const a=TAU*k/5;petal(s,q,[Math.cos(a),.5,Math.sin(a)],.32,.12,p.agent==='wind'?'#d8f5a2':'#ff8fab')}s.ball(q,.07,'#fab005')})};
  plant(-1.8,[[-.4,.6],[.4,1.0]]);plant(1.8,[[.3,.8]]);const src=[-2.2,.6,0],dst={auto:[-2.2,.6,0],geit:[-1.4,1.0,0],xeno:[2.1,.8,0]}[p.type],q=cycle(t*.25,1);
  if(p.agent==='insect'){const pos=p.type==='auto'?V.add(src,[.3*Math.cos(t*3),.3+.1*Math.sin(t*5),.3*Math.sin(t*3)]):V.add(V.add(src,V.mul(V.sub(dst,src),q)),[0,.7*Math.sin(PI*q),.2*Math.sin(t*9)]);critter(s,'insect',V.add(pos,[0,.05,0]),.3,t);s.ball(V.add(pos,[0,.1,.05]),.03,'#ffd43b',{flat:true})}
  else for(let i=0;i<24;i++){const qq=cycle(t*.25+i/24,1),pos=V.add(V.add(src,[qq*5,(hash(i)-.5)*1.5*qq,(hash(i+3)-.5)*2*qq]),[0,.3*Math.sin(qq*6+i),0]);s.ball(pos,.03,'#ffd43b',{flat:true})}s.render()},
 assumption:'Two plants of the same species; pollen paths are illustrative.'});

/* ---------- Chapter 2: Human Reproduction ---------- */
add({...ch(2,'Human Reproduction',U6),id:'bio-menstrual-cycle',title:'Menstrual cycle: ovary, uterus and hormones',
 description:'Move through a 28-day cycle and watch follicle growth, ovulation, the corpus luteum and the uterine lining.',
 formula:'LH surge (≈ day 14) → ovulation',
 observe:'Progesterone from the corpus luteum maintains the endometrium; if fertilisation does not occur it degenerates and menstruation follows.',
 tryText:'Move to day 14. Which hormone peaks?',
 controls:[R('day','Day of cycle',1,28,1,14,'day')],
 metrics:p=>{const r=mens(p.day);return[N('Phase',r.phase),N('Ovary',r.ovary),N('Uterus (endometrium)',r.uterus),N('Hormone in the lead',r.lead)]},
 draw:(c,p,t)=>{const r=mens(p.day),s=P3.scene(c,{scale:58,cx:230});s.mesh([-1.5,0,0],[.8,.55,.5],'#ffc9c9',{alpha:.5});const fol=p.day<14?.1+.3*p.day/14:p.day===14?.42:0;if(fol)s.mesh([-1.3,.05,.2],fol,'#ffe066',{alpha:.7});if(p.day>=14&&p.day<=16)s.ball([-1.3+.4*(p.day-13),.5,.3],.08,'#f783ac',{glow:true,label:'ovum'});if(p.day>14)s.mesh([-1.3,.05,.2],.3*(p.day<24?1:(28-p.day)/4),'#fab005');
  const th=p.day<=5?.35*(1-p.day/5)+.08:p.day<=14?.08+.32*(p.day-5)/9:.4+.15*Math.min(1,(p.day-14)/7)*(p.day<26?1:.4);s.lathe([1.4,-.8,0],[[.05,0],[.6,.3],[.85,1.2],[.75,1.6],[.3,1.7]],'#ffa8a8',{alpha:.35});s.lathe([1.4,-.8,0],[[.05,.1],[.6-th*.6,.35],[.85-th,1.15],[.7-th,1.5]],'#c92a2a',{alpha:.6});s.label([1.4,1.2,0],'uterus',C.muted,12);s.label([-1.5,.85,0],'ovary',C.muted,12);s.render();
  chart(c,410,96,246,190,{title:'Hormones (relative)',xl:'day',xmin:1,xmax:28,ymin:0,ymax:1.05,series:[{fn:d=>hormone(d,'LH'),col:'#ff6b6b'},{fn:d=>hormone(d,'FSH'),col:'#4dabf7'},{fn:d=>hormone(d,'E'),col:'#ffd43b'},{fn:d=>hormone(d,'P'),col:'#69db7c'}],marker:[p.day,hormone(p.day,r.key)]});tag(c,'LH red · FSH blue · oestrogen yellow · progesterone green',420,278,C.muted,10)},
 assumption:'Idealised 28-day cycle; hormone curves are schematic shapes, not measured concentrations.'});
function mens(d){if(d<=5)return{phase:'Menstrual phase',ovary:'New follicles begin to develop',uterus:'Lining breaks down and is shed',lead:'Low oestrogen and progesterone',key:'FSH'};if(d<14)return{phase:'Follicular (proliferative) phase',ovary:'Primary follicle grows into a Graafian follicle',uterus:'Endometrium regenerates by proliferation',lead:'FSH, LH rising; oestrogen rising',key:'E'};if(d===14)return{phase:'Ovulation',ovary:'Graafian follicle ruptures, releasing the ovum',uterus:'Thickening continues',lead:'LH surge',key:'LH'};return{phase:'Luteal (secretory) phase',ovary:'Ruptured follicle becomes corpus luteum',uterus:'Endometrium maintained for implantation',lead:'Progesterone',key:'P'}}
function hormone(d,h){const g=(m,w)=>Math.exp(-(((d-m)/w)**2));if(h==='LH')return .15+.85*g(14,1.2);if(h==='FSH')return .2+.35*g(3,3)+.45*g(13.5,1.5);if(h==='E')return .15+.7*g(12.5,2.5)+.35*g(21,3.5);return .05+.9*g(21,3.5)}

add({...ch(2,'Human Reproduction',U6),id:'bio-gametogenesis',title:'Spermatogenesis vs oogenesis',
 description:'Compare how many gametes form from one primary spermatocyte and one primary oocyte.',
 formula:'Primary spermatocyte → 4 sperms ;  primary oocyte → 1 ovum + polar bodies',
 observe:'Meiosis halves the chromosome number from 46 to 23; in oogenesis unequal division conserves cytoplasm in the ovum.',
 tryText:'Switch to oogenesis. Where does the second meiotic division finish?',
 controls:[S('type','Process','sperm',[['sperm','Spermatogenesis'],['oo','Oogenesis']]),R('cells','Primary cells',1,4,1,1)],
 metrics:p=>p.type==='sperm'?[N('Gametes per primary cell',4,'',0),N('Total gametes',4*p.cells,'',0),N('Chromosomes','46 → 23'),N('Where','Seminiferous tubules (testis)')]:[N('Ova per primary cell',1,'',0),N('Polar bodies','2 (first may divide → 3)'),N('Meiosis II','Completed only after sperm entry'),N('Chromosomes','46 → 23')],
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:56,pitch:.1}),sp=p.type==='sperm',n=p.cells;for(let k=0;k<n;k++){const ox=(k-(n-1)/2)*(sp?2:1.8);s.ball([ox,1.8,0],.3,'#9775fa',{label:k===0?'2n':''});
   const lv1=sp?[[-.5,.7],[.5,.7]]:[[-.4,.7],[.5,.7]];lv1.forEach(([dx,y],i)=>{const r=sp?.22:(i?.08:.3);s.ball([ox+dx,y,0],r,sp?'#b197fc':(i?'#ced4da':'#f783ac'));s.seg([ox,1.5,0],[ox+dx,y+r,0],'#adb5bd',1.5)});
   if(sp)for(let i=0;i<4;i++){const x=ox-.75+i*.5,y=-.6;s.ball([x,y,0],.12,'#74c0fc');s.tube([[x,y-.12,0],[x+.05*Math.sin(t*6+i),y-.6,0]],.02,'#74c0fc',{segs:4});s.seg([ox+(i<2?-.5:.5),.5,0],[x,y+.12,0],'#adb5bd',1.5)}
   else{s.ball([ox-.4,-.6,0],.32,'#e64980',{label:k===0?'ovum (n)':''});s.ball([ox+.2,-.6,0],.08,'#ced4da');s.seg([ox-.4,.4,0],[ox-.4,-.28,0],'#adb5bd',1.5)}}s.label([-3,1.8,0],'primary',C.muted,11);s.label([-3,.7,0],'meiosis I',C.muted,11);s.label([-3,-.6,0],'meiosis II',C.muted,11);s.render()},
 assumption:'One primary cell per column; spermiogenesis (spermatid → sperm) merged into the last row.'});

const EMB=[[0,'Zygote','Ampullary region of fallopian tube',1],[1,'2-cell stage (cleavage)','Fallopian tube',2],[2,'4-cell stage','Fallopian tube',4],[3,'8–16 cells: morula','Moving towards uterus',16],[5,'Blastocyst','Uterus',64],[7,'Implantation','Embedded in endometrium',100]];
add({...ch(2,'Human Reproduction',U6),id:'bio-early-development',title:'From zygote to implantation',
 description:'Follow the embryo down the fallopian tube as it cleaves into a morula and a blastocyst, then implants in the uterus.',
 formula:'Zygote → cleavage → morula → blastocyst → implantation',
 observe:'The blastocyst’s outer trophoblast attaches to the endometrium; its inner cell mass becomes the embryo.',
 tryText:'Move to day 5. Which two parts does the blastocyst have?',
 controls:[R('day','Days after fertilisation',0,7,.5,3,'days',1)],
 metrics:p=>{const e=[...EMB].reverse().find(x=>p.day>=x[0]);return[N('Stage',e[1]),N('Location',e[2]),N('Approximate cells',e[3]<100?e[3]:'Many','',0),N('Next',p.day<5?'Cleavage continues':'Trophoblast attaches to uterine wall')]},
 draw:(c,p,t)=>{const e=[...EMB].reverse().find(x=>p.day>=x[0]),s=P3.scene(c,{scale:54,pitch:.2}),path=[[-3,1.2,0],[-2,1.4,0],[-1,1.0,0],[0,.4,0],[1.2,-.4,0],[2.2,-.9,0]];s.tube(path,.35,'#ffc9c9',{alpha:.3});s.lathe([2.6,-2.4,0],[[.1,0],[.9,.5],[1.1,1.4],[.6,1.8]],'#ffa8a8',{alpha:.35});
  const pos=along(path,Math.min(1,p.day/6)),n=e[3];if(p.day>=5){s.mesh(pos,.32,'#ffc078',{alpha:.5});s.mesh(V.add(pos,[.12,.08,0]),.14,'#e8590c');s.label(V.add(pos,[0,.6,0]),'trophoblast + inner cell mass',C.gold,11)}else if(n===1)s.ball(pos,.25,'#ffc078');else{const k=Math.min(16,n);for(let i=0;i<k;i++){const y=1-2*(i+.5)/k,r=Math.sqrt(1-y*y),a=i*2.4;s.ball(V.add(pos,[.17*r*Math.cos(a),.17*y,.17*r*Math.sin(a)]),.25/Math.cbrt(k)*1.2,'#ffc078')}}s.render()},
 assumption:'Typical human timeline; implantation begins about a week after fertilisation.'});

/* ---------- Chapter 3: Reproductive Health ---------- */
add({...ch(3,'Reproductive Health',U6),id:'bio-population-growth-rate',title:'Population growth and doubling time',
 description:'Choose a growth rate and see how fast a population doubles — the reason reproductive health matters.',
 formula:'N = N₀e^(rt) ;  doubling time ≈ 70 / (r in %)',
 observe:'Even a growth rate under 2% per year doubles a population in about 35–40 years.',
 tryText:'Compare 1.7% per year with 1% per year over 50 years.',
 controls:[R('r','Growth rate',.5,3,.1,1.7,'% per year',1),R('years','Years ahead',0,100,1,30,'years'),R('N0','Starting population',100,1400,10,1210,'million')],
 metrics:p=>{const Nn=p.N0*Math.exp(p.r/100*p.years);return[N('Population after',Nn,'million',0),N('Doubling time',Math.log(2)/(p.r/100),'years',1),N('India at independence','≈ 350 million'),N('Census 2011','> 1.2 billion')]},
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:50,cy:320,pitch:.25}),steps=6;for(let i=0;i<=steps;i++){const y=p.years*i/steps,Nn=p.N0*Math.exp(p.r/100*y),h=Nn/4000*3.5;s.box([-2.4+i*.8,-1.6+h/2,0],[.55,h,.55],i===steps?'#ffa94d':'#4dabf7');s.label([-2.4+i*.8,-1.9,0],'+'+Math.round(y),C.muted,10)}for(let i=0;i<6;i++)critter(s,'human',[-3.4,-1.6,-1+i*.4],.45,t);s.render();tag(c,'columns: population every few years (height ∝ size)',44,98,C.muted,13)},
 assumption:'Constant exponential growth for illustration; real rates change with time.'});

/* ---------- Chapter 4: Principles of Inheritance and Variation ---------- */
const MONO=[['TT','TT (pure tall)'],['Tt','Tt (hybrid tall)'],['tt','tt (dwarf)']];
add({...ch(4,'Principles of Inheritance and Variation',U7),id:'bio-monohybrid-cross',title:'Mendel’s monohybrid cross',
 description:'Cross pea plants for height using a Punnett square, then grow a field of offspring to see chance at work.',
 formula:'Tt × Tt → 1 TT : 2 Tt : 1 tt (genotypes) ;  3 tall : 1 dwarf',
 observe:'Dwarfness (t) disappears in F₁ but reappears in F₂ — the recessive factor is not lost, only masked.',
 tryText:'Increase the number of offspring and watch the observed ratio approach 3 : 1.',
 controls:[S('p1','Parent 1','Tt',MONO),S('p2','Parent 2','Tt',MONO),R('n','Offspring grown',4,200,4,40),R('seed','Sample number',1,20,1,1)],
 metrics:p=>{const g=cross1(p.p1,p.p2),tall=g.TT+g.Tt,obs=sample1(p);return[N('Expected genotypes',`TT ${g.TT*4}/4 · Tt ${g.Tt*4}/4 · tt ${g.tt*4}/4`),N('Expected phenotypes',`${tall*100}% tall, ${g.tt*100}% dwarf`),N('Observed in sample',`${obs.tall} tall : ${obs.dwarf} dwarf`),N('Observed ratio',obs.dwarf?f(obs.tall/obs.dwarf,2)+' : 1':'All tall')]},
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:54,cy:290,pitch:.45}),g1=p.p1.split(''),g2=p.p2.split('');for(let i=0;i<2;i++)for(let j=0;j<2;j++){const geno=[g1[i],g2[j]].sort().join(''),tall=geno.includes('T');s.box([-3+i*1.1,-1.6,-1+j*1.1],[1,.1,1],'#20c997');pea(s,[-3+i*1.1,-1.55,-1+j*1.1],tall,.7,t);s.label([-3+i*1.1,-1.3,-.6+j*1.1],geno,C.white,12)}
  const obs=sample1(p),cols=Math.ceil(Math.sqrt(p.n*1.6));for(let k=0;k<Math.min(p.n,120);k++){const x=-1+(k%cols)*.32,z=-1.4+Math.floor(k/cols)*.32;pea(s,[x,-1.6,z],obs.list[k],.4,t)}s.render();tag(c,'left: Punnett square · right: random offspring sample',44,98,C.muted,13)},
 assumption:'Complete dominance; offspring drawn at random with Mendelian probabilities (reproducible for each sample number).'});
function pea(s,p,tall,k,t){const h=(tall?1.6:.55)*k;s.tube([p,V.add(p,[0,h,0])],.03*k+.01,'#5c940d',{segs:5});leaf(s,V.add(p,[0,h*.5,0]),[1,.4,0],.35*k,.1*k);leaf(s,V.add(p,[0,h*.8,0]),[-1,.4,.2],.3*k,.1*k)}
function cross1(a,b){const r={TT:0,Tt:0,tt:0};for(const x of a)for(const y of b){const g=[x,y].sort().join('');r[g==='Tt'||g==='tT'?'Tt':g]+=.25}return r}
function sample1(p){const g=cross1(p.p1,p.p2),r=rng(p.seed),list=[];let tall=0;for(let i=0;i<p.n;i++){const isT=r()<g.TT+g.Tt;list.push(isT);if(isT)tall++}return{tall,dwarf:p.n-tall,list}}

const DIH=[['RrYy','RrYy (dihybrid)'],['RRYY','RRYY (round yellow)'],['rryy','rryy (wrinkled green)'],['Rryy','Rryy'],['rrYy','rrYy']];
add({...ch(4,'Principles of Inheritance and Variation',U7),id:'bio-dihybrid-cross',title:'Dihybrid cross: independent assortment',
 description:'Cross pea plants for seed shape and colour. Fill the 4 × 4 Punnett square and count the phenotypes.',
 formula:'RrYy × RrYy → 9 round yellow : 3 round green : 3 wrinkled yellow : 1 wrinkled green',
 observe:'The two pairs of factors segregate independently of each other when gametes form.',
 tryText:'Make a test cross (RrYy × rryy). What ratio appears?',
 controls:[S('p1','Parent 1','RrYy',DIH),S('p2','Parent 2','RrYy',DIH)],
 metrics:p=>{const r=cross2(p.p1,p.p2);return[N('Round yellow',r.RY,'/16',0),N('Round green',r.Ry,'/16',0),N('Wrinkled yellow',r.rY,'/16',0),N('Wrinkled green',r.ry,'/16',0)]},
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:48,pitch:.6}),g1=gam(p.p1),g2=gam(p.p2);for(let i=0;i<4;i++)for(let j=0;j<4;j++){const a=g1[i],b=g2[j],round=a[0]==='R'||b[0]==='R',yel=a[1]==='Y'||b[1]==='Y',q=[-1.65+i*1.1,0,-1.65+j*1.1];s.box(V.add(q,[0,-.1,0]),[1,.08,1],(i+j)%2?'#1c3a4f':'#21445b');
   s.mesh(V.add(q,[0,.25,0]),.3,yel?'#ffd43b':'#69db7c',{shape:round?undefined:(u,v)=>1+.12*Math.sin(5*v)*Math.cos(3*u),rings:10,segs:16})}for(let i=0;i<4;i++){s.label([-1.65+i*1.1,.2,-2.5],g1[i],C.gold,13);s.label([-2.5,.2,-1.65+i*1.1],g2[i],C.blue,13)}s.render()},
 assumption:'Genes on different chromosomes (independent assortment) with complete dominance of R and Y.'});
function gam(g){return[g[0]+g[2],g[0]+g[3],g[1]+g[2],g[1]+g[3]]}
function cross2(a,b){const r={RY:0,Ry:0,rY:0,ry:0};for(const x of gam(a))for(const y of gam(b)){const R=(x[0]==='R'||y[0]==='R')?'R':'r',Y=(x[1]==='Y'||y[1]==='Y')?'Y':'y';r[R+Y]++}return r}

add({...ch(4,'Principles of Inheritance and Variation',U7),id:'bio-incomplete-codominance',title:'Incomplete dominance and co-dominance',
 description:'Cross snapdragons (incomplete dominance) or combine ABO alleles (co-dominance) and compare the offspring.',
 formula:'Snapdragon: RR (red) × rr (white) → Rr (pink) ;  ABO: Iᴬ Iᴮ → group AB',
 observe:'In incomplete dominance the F₂ phenotypic ratio equals the genotypic ratio, 1 : 2 : 1.',
 tryText:'Self the pink F₁ (Rr × Rr). What fraction of flowers are pink?',
 controls:[S('mode','Example','snap',[['snap','Snapdragon flower colour'],['abo','ABO blood group']]),S('p1','Parent 1','Rr',[['RR','RR / IᴬIᴬ'],['Rr','Rr / IᴬIᴮ'],['rr','rr / ii']]),S('p2','Parent 2','Rr',[['RR','RR / IᴮIᴮ'],['Rr','Rr / IᴬIᴮ'],['rr','rr / ii']])]
 ,metrics:p=>{const kids=codom(p);const cnt={};kids.forEach(k=>cnt[k.name]=(cnt[k.name]||0)+1);return[N('Offspring (of 4)',Object.entries(cnt).map(([k,v])=>`${k}: ${v}`).join(', ')),N('Pattern',p.mode==='snap'?'Incomplete dominance':'Co-dominance (Iᴬ, Iᴮ) + recessive i'),N('Key idea',p.mode==='snap'?'Heterozygote is intermediate':'Both alleles expressed together')]},
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:56,cy:300,pitch:.25}),kids=codom(p);kids.forEach((k,i)=>{const x=-2.1+i*1.4;s.cyl([x,-1.55,0],[0,1,0],.5,.12,'#29475b');if(p.mode==='snap'){s.tube([[x,-1.5,0],[x,.2,0]],.04,BC.stem,{segs:6});for(let j=0;j<3;j++){const y=-.2+j*.35;for(let m=0;m<4;m++){const a=TAU*m/4+j;petal(s,[x,y,0],[Math.cos(a),.6,Math.sin(a)],.22,.1,k.col)}}}else{s.mesh([x,-.6,0],[.45,.16,.45],'#c92a2a',{rot:[PI/2*.6,0,0]});k.ag.forEach((a,j)=>{for(let m=0;m<4;m++){const an=TAU*(m/4+j/8);s.ball([x+.45*Math.cos(an),-.6+.1,.45*Math.sin(an)],.06,a==='A'?'#ffd43b':'#4dabf7',{flat:true})}})}s.label([x,-1.95,0],k.name,C.white,12)});s.render()},
 assumption:'Simple one-gene examples from NCERT Chapter 4.'});
function codom(p){const out=[];if(p.mode==='snap'){for(const a of p.p1)for(const b of p.p2){const g=[a,b].sort().join('');out.push(g==='RR'?{name:'Red',col:'#e03131'}:g==='rr'?{name:'White',col:'#f8f9fa'}:{name:'Pink',col:'#f783ac'})}return out}
  const m1={RR:['A','A'],Rr:['A','B'],rr:['i','i']},m2={RR:['B','B'],Rr:['A','B'],rr:['i','i']};for(const a of m1[p.p1])for(const b of m2[p.p2]){const set=[...new Set([a,b].filter(v=>v!=='i'))].sort();out.push({name:set.length===2?'AB':set.length?set[0]:'O',ag:set})}return out}

const XL={mother:[['XX','Normal (XX)'],['XXc','Carrier (XXᶜ)'],['XcXc','Affected (XᶜXᶜ)']],father:[['XY','Normal (XY)'],['XcY','Affected (XᶜY)']]};
add({...ch(4,'Principles of Inheritance and Variation',U7),id:'bio-sex-linked',title:'Sex determination and X-linked traits',
 description:'Pick parents for an X-linked recessive trait (haemophilia or colour blindness) and see the chances for sons and daughters.',
 formula:'XX × XY → ½ daughters, ½ sons ;  sons get their X from the mother',
 observe:'A carrier mother passes the allele to half her sons (affected) and half her daughters (carriers).',
 tryText:'What happens with a normal mother and an affected father?',
 controls:[S('m','Mother','XXc',XL.mother),S('f','Father','XY',XL.father),S('trait','Trait','haem',[['haem','Haemophilia'],['cb','Colour blindness']])],
 metrics:p=>{const r=xcross(p);return[N('Daughters affected',r.dA,'%',0),N('Daughters carriers',r.dC,'%',0),N('Sons affected',r.sA,'%',0),N('Chance child is a son',50,'%',0)]},
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:50,cy:300,pitch:.2}),r=xcross(p),kids=xkids(p);critter(s,'human',[-1,0,-1.2],.75,t);critter(s,'human',[1,0,-1.2],.75,t);s.label([-1,1.6,-1.2],'mother '+p.m.replace('Xc','Xᶜ').replace('Xc','Xᶜ'),'#f783ac',12);s.label([1,1.6,-1.2],'father '+p.f.replace('Xc','Xᶜ'),C.blue,12);
  kids.forEach((k,i)=>{const x=-2.1+i*1.4,col=k.state==='affected'?'#fa5252':k.state==='carrier'?'#ffd43b':'#69db7c';s.cyl([x,-1.55,.9],[0,1,0],.45,.1,col);critter(s,'human',[x,-1.5,.9],.55,t);s.label([x,-1.85,.9],`${k.sex} · ${k.state}`,col,11)});s.render();tag(c,'red: affected   yellow: carrier   green: normal',44,98,C.muted,13)},
 assumption:'Single X-linked recessive allele, complete penetrance; each of the four combinations is equally likely.'});
function xkids(p){const mx=p.m==='XX'?['X','X']:p.m==='XXc'?['X','Xc']:['Xc','Xc'],fx=p.f==='XY'?'X':'Xc',out=[];for(const m of mx){out.push({sex:'daughter',state:m==='Xc'&&fx==='Xc'?'affected':(m==='Xc'||fx==='Xc')?'carrier':'normal'});out.push({sex:'son',state:m==='Xc'?'affected':'normal'})}return out}
function xcross(p){const k=xkids(p),d=k.filter(x=>x.sex==='daughter'),s2=k.filter(x=>x.sex==='son');return{dA:100*d.filter(x=>x.state==='affected').length/d.length,dC:100*d.filter(x=>x.state==='carrier').length/d.length,sA:100*s2.filter(x=>x.state==='affected').length/s2.length}}

/* ---------- Chapter 5: Molecular Basis of Inheritance ---------- */
add({...ch(5,'Molecular Basis of Inheritance',U7),id:'bio-dna-double-helix',title:'DNA double helix',
 description:'Spin a B-DNA double helix, change its length and GC content, and calculate how long the molecule would be.',
 formula:'Rise 0.34 nm per bp ;  10 bp per turn ;  pitch 3.4 nm ;  A = T and G = C (Chargaff)',
 observe:'A human diploid cell has about 6.6 × 10⁹ bp — about 2.2 m of DNA if stretched out.',
 tryText:'Set the length to the human value (log₁₀ bp ≈ 9.8). How long is the DNA?',
 controls:[R('lbp','Length (log₁₀ base pairs)',1,10,.01,9.82,'',2),R('gc','GC content',20,80,1,40,'%')],
 metrics:p=>{const bp=10**p.lbp,L=bp*.34e-9;return[N('Base pairs',bp,'',2),N('Length',L>=1?L:L*1e9,L>=1?'m':'nm',2),N('Turns of helix',bp/10,'',2),N('A = T, G = C',`A ${f((100-p.gc)/2,0)}%, T ${f((100-p.gc)/2,0)}%, G ${f(p.gc/2,0)}%, C ${f(p.gc/2,0)}%`)]},
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:62}),r=rng(Math.round(p.gc));let seq='';for(let i=0;i<40;i++){const x=r()*100;seq+=x<p.gc/2?'G':x<p.gc?'C':x<p.gc+(100-p.gc)/2?'A':'T'}helix(s,[-3,0,0],[3,0,0],3,.6,seq,t*.8);s.render();tag(c,'red A · yellow T · teal G · blue C',44,98,C.muted,13)},
 assumption:'B-form DNA dimensions from NCERT Chapter 5; three turns shown.'});

add({...ch(5,'Molecular Basis of Inheritance',U7),id:'bio-meselson-stahl',title:'Semiconservative replication (Meselson–Stahl)',
 description:'Grow E. coli in ¹⁵N, then switch to ¹⁴N. Spin the DNA in a CsCl gradient after each generation.',
 formula:'After generation n (n ≥ 1): hybrid fraction = 1/2ⁿ⁻¹ ;  light fraction = 1 − 1/2ⁿ⁻¹',
 observe:'After one generation all DNA is hybrid (¹⁵N/¹⁴N) — exactly what semiconservative replication predicts.',
 tryText:'After two generations, what fraction of DNA is light?',
 controls:[R('gen','Generations in ¹⁴N',0,5,1,1)],
 metrics:p=>{const g=p.gen,heavy=g===0?100:0,hyb=g===0?0:100/2**(g-1),light=g===0?0:100-hyb;return[N('Heavy (¹⁵N/¹⁵N)',heavy,'%',0),N('Hybrid (¹⁵N/¹⁴N)',hyb,'%',1),N('Light (¹⁴N/¹⁴N)',light,'%',1),N('Generation time of E. coli','≈ 20 min')]},
 draw:(c,p,t)=>{const g=p.gen,heavy=g===0?1:0,hyb=g===0?0:1/2**(g-1),light=1-heavy-hyb,s=P3.scene(c,{scale:56,cx:200});s.lathe([0,-1.8,0],[[.0,0],[.35,.25],[.42,.6],[.42,3.2]],'#e9f6ff',{alpha:.2});
  const band=(y,w,col)=>{if(w>0)s.cyl([0,y,0],[0,1,0],.4,.06+.12*w,col,{alpha:.85})};band(-1.0,heavy,'#5c7cfa');band(-.3,hyb,'#9775fa');band(.4,light,'#e599f7');s.label([.8,-1,0],'heavy',C.blue,12);s.label([.8,-.3,0],'hybrid',C.purple,12);s.label([.8,.4,0],'light','#f783ac',12);
  const nmol=Math.min(8,2**g);for(let i=0;i<nmol;i++){const x=1.8+(i%4)*.55,y=.8-Math.floor(i/4)*1.4,old=i<2;s.tube([[x,y,0],[x,y-1,0]],.05,(g===0||old&&i%2===0)?'#5c7cfa':'#e599f7',{segs:5});s.tube([[x+.15,y,0],[x+.15,y-1,0]],.05,g===0||(old&&i%2===1)?'#5c7cfa':'#e599f7',{segs:5})}s.render();tag(c,'blue strands: ¹⁵N (old) · pink: ¹⁴N (new)',44,98,C.muted,13)},
 assumption:'Ideal synchronous divisions; band thickness ∝ fraction of DNA.'});

const CODON=(()=>{const b='UCAG',aa='FFLLSSSSYY**CC*WLLLLPPPPHHQQRRRRIIIMTTTTNNKKSSRRVVVVAAAADDEEGGGG',m={};let k=0;for(const x of b)for(const y of b)for(const z of b)m[x+y+z]=aa[k++];return m})();
const AAN={F:'Phe',L:'Leu',S:'Ser',Y:'Tyr',C:'Cys',W:'Trp',P:'Pro',H:'His',Q:'Gln',R:'Arg',I:'Ile',M:'Met',T:'Thr',N:'Asn',K:'Lys',V:'Val',A:'Ala',D:'Asp',E:'Glu',G:'Gly','*':'Stop'};
add({...ch(5,'Molecular Basis of Inheritance',U7),id:'bio-central-dogma',title:'Transcription and translation',
 description:'Transcribe a short gene into mRNA and translate it codon by codon. Then make a point mutation and see its effect.',
 formula:'DNA → mRNA (transcription) → protein (translation) ;  AUG = start (Met)',
 observe:'A single base change can be silent, change one amino acid (missense) or create a stop codon (nonsense).',
 tryText:'Change codon 3 (AAA) to a stop codon by mutating one base.',
 controls:[R('pos','Mutation position (0 = none)',0,18,1,0),S('base','New base','A',['A','T','G','C'].map(x=>[x,x]))],
 metrics:p=>{const r=dogma(p);return[N('Coding DNA',r.dna),N('mRNA',r.mrna),N('Protein',r.prot),N('Mutation effect',r.effect)]},
 draw:(c,p,t)=>{const r=dogma(p),s=P3.scene(c,{scale:50,pitch:.25}),n=r.mrna.replace(/ /g,'').length,q=cycle(t*.15,1);helix(s,[-3.6,1.2,0],[-.6,1.2,0],1.6,.35,r.dna.replace(/ /g,'').slice(0,16),t*.5);s.mesh([-1.6,1.2,.3],[.5,.4,.4],'#ffa94d',{alpha:.7});s.label([-1.6,1.85,.3],'RNA polymerase',C.gold,11);
  const m=r.mrna.replace(/ /g,'');for(let i=0;i<n;i++){const x=-2.8+i*.32;s.cyl([x,-.4,0],[0,1,0],.06,.3,BC[m[i]]||'#ccc');s.seg([x-.16,-.25,0],[x+.16,-.25,0],'#dee2e6',3)}const rx=-2.8+q*(n-1)*.32;s.mesh([rx,-.15,0],[.6,.35,.45],'#748ffc',{alpha:.6});s.mesh([rx,-.75,0],[.45,.25,.35],'#4c6ef5',{alpha:.6});
  const aas=r.prot.split('-').filter(x=>x),made=Math.min(aas.length,Math.floor(q*n/3)+1);for(let i=0;i<made;i++)s.ball([rx-.2-i*.2,.4+i*.12,0],.1,['#ff6b6b','#ffd43b','#69db7c','#4dabf7','#9775fa','#f783ac'][i%6]);s.render()},
 assumption:'Standard genetic code; gene shown as its coding (sense) strand, so mRNA = coding strand with U for T.'});
function dogma(p){let g='ATGGCCAAATTTGGGTAA'.split('');const orig=g.join('');if(p.pos>0)g[p.pos-1]=p.base;const dna=g.join(''),mrna=dna.replace(/T/g,'U'),cod=[];for(let i=0;i<18;i+=3)cod.push(mrna.slice(i,i+3));const prot=[];for(const c2 of cod){const a=CODON[c2];prot.push(AAN[a]);if(a==='*')break}
  const op=[];const om=orig.replace(/T/g,'U');for(let i=0;i<18;i+=3){const a=CODON[om.slice(i,i+3)];op.push(AAN[a]);if(a==='*')break}let effect='No mutation';if(p.pos>0){if(dna===orig)effect='Same base — no change';else if(prot.join()===op.join())effect='Silent (same amino acid)';else if(prot.length<op.length)effect='Nonsense (early stop codon)';else effect='Missense (different amino acid)'}
  return{dna:dna.match(/.{3}/g).join(' '),mrna:mrna.match(/.{3}/g).join(' '),prot:prot.join('-'),effect}}

add({...ch(5,'Molecular Basis of Inheritance',U7),id:'bio-lac-operon',title:'The lac operon',
 description:'Add or remove lactose and see whether the repressor blocks the operator or RNA polymerase transcribes the z, y, a genes.',
 formula:'Lactose (inducer) inactivates the repressor → genes z, y, a transcribed',
 observe:'Without lactose the repressor binds the operator and the structural genes stay switched off.',
 tryText:'Add lactose. Which three enzymes are now produced?',
 controls:[S('lac','Lactose in medium','yes',[['yes','Present'],['no','Absent']])],
 metrics:p=>p.lac==='yes'?[N('Repressor','Bound to inducer — inactive'),N('Operator','Free'),N('Transcription','ON'),N('Enzymes made','β-galactosidase (z), permease (y), transacetylase (a)')]:[N('Repressor','Bound to operator'),N('Operator','Blocked'),N('Transcription','OFF'),N('Enzymes made','None (only basal level)')],
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:52,pitch:.3}),on=p.lac==='yes',genes=[['i',-3,'#ced4da'],['p',-1.8,'#ffd43b'],['o',-1.1,'#ff8787'],['z',.2,'#4dabf7'],['y',1.6,'#69db7c'],['a',2.8,'#b197fc']];s.cyl([0,0,0],[1,0,0],.18,7,'#868e96');genes.forEach(([n,x,col],i)=>{const w=i>2?1.2:.6;s.cyl([x,0,0],[1,0,0],.22,w,col);s.label([x,.5,0],n,col,14)});
  const rep=on?[-1.1+.8,1.4+.2*Math.sin(t),0]:[-1.1,.45,0];s.mesh(rep,[.35,.25,.3],'#e8590c',{label:'repressor'});s.label(V.add(rep,[0,.45,0]),'repressor',C.gold,11);s.tube([[-3,0,0],[-3,.6,.2],[-2.6,.9,.2]],.04,'#ced4da',{segs:5});
  if(on){for(let i=0;i<5;i++)s.ball([-2+hash(i)*4,1.6+hash(i+3)*.6,(hash(i+6)-.5)],.09,'#ffe066',{flat:true});s.ball(V.add(rep,[.25,.2,0]),.09,'#ffe066');const px=-1.8+cycle(t*.3,1)*5;s.mesh([px,.3,0],[.4,.3,.35],'#20c997',{alpha:.8});s.path(Array.from({length:12},(_,i)=>[px-i*.15,.4+.05*Math.sin(i+t*4),-.4]),'#ffa94d',2);s.label([px,.85,0],'RNA polymerase',C.mint,11)}
  else s.mesh([-1.9,.35,0],[.4,.3,.35],'#20c997',{alpha:.5});s.render();tag(c,on?'yellow: lactose (inducer)':'Repressor sits on the operator',44,98,on?C.gold:C.red,13)},
 assumption:'Negative regulation as described in NCERT; catabolite (glucose) control not included.'});

add({...ch(5,'Molecular Basis of Inheritance',U7),id:'bio-dna-fingerprinting',title:'DNA fingerprinting with VNTRs',
 description:'Compare VNTR band patterns of a child with a mother and alleged fathers, or a crime-scene sample with suspects.',
 formula:'Every band in a child comes from either the mother or the father',
 observe:'VNTR band patterns differ between individuals (except identical twins), so they identify people.',
 tryText:'Which alleged father shares all the non-maternal bands with the child?',
 controls:[S('case','Case','pat',[['pat','Paternity test'],['for','Forensic match']])],
 metrics:p=>p.case==='pat'?[N('Mother','Explains half the child’s bands'),N('Alleged father 1','Does not explain the rest'),N('Alleged father 2','Matches all remaining bands'),N('Conclusion','Father 2 is the biological father')]:[N('Crime scene sample','Reference'),N('Suspect 1','Different pattern'),N('Suspect 2','Identical pattern — match'),N('Technique','Restriction digest → electrophoresis → blotting → probe')],
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:54,pitch:.55}),lanes=p.case==='pat'?[['Mother',[1,4,7]],['Child',[1,5,7,9]],['Father 1',[2,6,8]],['Father 2',[5,9,3]]]:[['Scene',[2,5,6,9]],['Suspect 1',[1,4,6,8]],['Suspect 2',[2,5,6,9]],['Suspect 3',[3,4,7,9]]];
  s.box([0,-.1,0],[5.6,.16,4.2],'#d0ebff',{alpha:.8});lanes.forEach(([n,b],i)=>{const x=-2.1+i*1.4;s.box([x,0,-1.9],[.8,.12,.15],'#343a40');s.label([x,.4,-2.3],n,C.white,12);const k=Math.min(1,cycle(t,8)/4);b.forEach(y=>s.box([x,.03,-1.7+y*.37*k],[.8,.06,.1],'#7048e8',{alpha:.9}))});s.label([-2.8,.3,2],'+ (anode)',C.red,12);s.label([-2.8,.3,-2.1],'− wells',C.muted,12);s.render()},
 assumption:'Band positions are illustrative; real profiles use several VNTR probes.'});

/* ---------- Chapter 6: Evolution ---------- */
add({...ch(6,'Evolution',U7),id:'bio-hardy-weinberg',title:'Hardy–Weinberg equilibrium and selection',
 description:'Start with allele frequencies p and q. Without disturbance they stay constant; add selection against aa and watch q fall.',
 formula:'p² + 2pq + q² = 1 ;  with selection against aa: q′ = q(1 − sq)/(1 − sq²)',
 observe:'Allele frequencies change only when a disturbing factor (selection, drift, gene flow, mutation) acts.',
 tryText:'Set s = 0. Do the frequencies change over generations?',
 controls:[R('p0','Initial frequency p (allele A)',.05,.95,.01,.5,'',2),R('s','Selection against aa (s)',0,1,.05,.3,'',2),R('gen','Generations',0,100,1,20)],
 metrics:p=>{const q=hwq(p,p.gen),pp=1-q;return[N('p (A)',pp,'',3),N('q (a)',q,'',3),N('AA : Aa : aa',`${f(pp*pp,2)} : ${f(2*pp*q,2)} : ${f(q*q,2)}`),N('In equilibrium?',p.s===0?'Yes — no change':'No — selection acting')]},
 draw:(c,p,t)=>{const q=hwq(p,p.gen),pp=1-q,s=P3.scene(c,{scale:50,cy:300,pitch:.4,cx:230}),n=100,fa=pp*pp,fh=2*pp*q;for(let i=0;i<n;i++){const x=-2.2+(i%10)*.48,z=-1.6+Math.floor(i/10)*.36,f2=(i+.5)/n,col=f2<fa?'#4dabf7':f2<fa+fh?'#9775fa':'#ff6b6b';s.mesh([x,-1.5,z],[.17,.1,.13],col,{rings:6,segs:10})}s.render();
  chart(c,420,96,236,170,{title:'Allele frequency q over time',xl:'generations',xmin:0,xmax:100,ymin:0,ymax:1,series:[{pts:Array.from({length:101},(_,g)=>[g,hwq(p,g)]),col:C.red},{pts:Array.from({length:101},(_,g)=>[g,1-hwq(p,g)]),col:C.blue}],marker:[p.gen,q]});tag(c,'blue AA · purple Aa · red aa',44,98,C.muted,13)},
 assumption:'Large random-mating population; selection acts only on the recessive homozygote (fitness 1 − s).'});
function hwq(p,g){let q=1-p.p0;for(let i=0;i<g;i++)q=q*(1-p.s*q)/(1-p.s*q*q);return q}

const SEL={stab:['Stabilising','Intermediate values favoured; variation narrows'],dir:['Directional','One extreme favoured; mean shifts'],dis:['Disruptive','Both extremes favoured; two peaks form']};
add({...ch(6,'Evolution',U7),id:'bio-natural-selection',title:'Natural selection on a trait',
 description:'Apply stabilising, directional or disruptive selection to a population and watch the trait distribution change.',
 formula:'Fitness differences + heritable variation → change across generations',
 observe:'Industrial melanism in peppered moths is a classic example of directional selection.',
 tryText:'Choose directional selection and run 20 generations.',
 controls:[S('type','Selection','dir',Object.keys(SEL).map(k=>[k,SEL[k][0]])),R('gen','Generations',0,30,1,10)],
 metrics:p=>{const d=selDist(p);return[N('Type',SEL[p.type][0]),N('Effect',SEL[p.type][1]),N('Mean trait value',d.mean,'',2),N('Spread (s.d.)',d.sd,'',2)]},
 draw:(c,p,t)=>{const d=selDist(p),s=P3.scene(c,{scale:50,cy:300,pitch:.25,cx:230});for(let i=0;i<40;i++){const x=d.sample[i],col=`#${[0,0,0].map(()=>Math.round(230-200*clamp(x,0,1)).toString(16).padStart(2,'0')).join('')}`;s.mesh([-2.4+(i%8)*.62,-1.4+Math.floor(i/8)*.05,-1.6+Math.floor(i/8)*.75],[.22,.04,.14],col,{rings:4,segs:8});for(const z of[-1,1])s.poly([[-2.4+(i%8)*.62,-1.35+Math.floor(i/8)*.05,-1.6+Math.floor(i/8)*.75],[-2.4+(i%8)*.62-.15,-1.33+Math.floor(i/8)*.05,-1.6+Math.floor(i/8)*.75+z*.28],[-2.4+(i%8)*.62+.12,-1.33+Math.floor(i/8)*.05,-1.6+Math.floor(i/8)*.75+z*.22]],col,{cull:false})}s.render();
  chart(c,420,96,236,170,{title:'Trait distribution',xl:'wing darkness →',xmin:0,xmax:1,ymin:0,series:[{fn:x=>selDist({...p,gen:0}).pdf(x),col:'#8ca6b9',dash:[4,4]},{fn:d.pdf,col:C.gold}]})},
 assumption:'Trait modelled as a normal distribution re-weighted each generation by a fitness function; moth colour = trait value.'});
function selDist(p){let m=.35,sd=.15,m2=null;for(let g=0;g<p.gen;g++){if(p.type==='dir')m=Math.min(.85,m+.02);else if(p.type==='stab')sd=Math.max(.05,sd*.96);}if(p.type==='dis'){const k=Math.min(1,p.gen/20);m2=[.35-.2*k,.35+.25*k];sd=.15-.06*k}
  const pdf=x=>m2?.5*(Math.exp(-(((x-m2[0])/sd)**2)/2)+Math.exp(-(((x-m2[1])/sd)**2)/2)):Math.exp(-(((x-m)/sd)**2)/2);const r=rng(7),sample=Array.from({length:40},()=>{const u=Math.sqrt(-2*Math.log(r()+1e-9))*Math.cos(TAU*r()),c0=m2?m2[r()<.5?0:1]:m;return clamp(c0+u*sd,0,1)});return{pdf,mean:m2?(m2[0]+m2[1])/2:m,sd,sample}}

add({...ch(6,'Evolution',U7),id:'bio-genetic-drift',title:'Genetic drift in small populations',
 description:'Let allele frequencies change by chance alone in populations of different sizes. Small populations drift fastest.',
 formula:'Each generation: 2N alleles drawn at random from the previous generation',
 observe:'In small populations an allele can be lost or fixed purely by chance (also seen in the founder effect).',
 tryText:'Compare N = 10 with N = 500 over 100 generations.',
 controls:[R('N','Population size N',5,500,5,20),R('gen','Generations',1,100,1,60),R('seed','Run number',1,20,1,1)],
 metrics:p=>{const runs=drift(p),ends=runs.map(r=>r[r.length-1]);return[N('Runs that lost the allele',ends.filter(x=>x===0).length,'of 6',0),N('Runs that fixed it',ends.filter(x=>x===1).length,'of 6',0),N('Starting frequency',.5,'',1)]},
 draw:(c,p,t)=>{const runs=drift(p),s=P3.scene(c,{scale:50,pitch:.3,cx:220,cy:280});runs.forEach((r,i)=>{const pts=r.map((v,g)=>[-2.6+5.2*g/p.gen,-1.4+2.8*v,-1.2+i*.48]);s.path(pts,['#ff6b6b','#ffd43b','#69db7c','#4dabf7','#9775fa','#f783ac'][i],2.2);s.ball(pts[pts.length-1],.08,['#ff6b6b','#ffd43b','#69db7c','#4dabf7','#9775fa','#f783ac'][i])});s.box([0,-1.45,0],[5.4,.04,3.2],'#29475b',{alpha:.5});s.box([0,1.45,0],[5.4,.04,3.2],'#29475b',{alpha:.25});s.label([2.9,1.5,0],'fixed (1)',C.muted,11);s.label([2.9,-1.5,0],'lost (0)',C.muted,11);s.render();tag(c,'6 independent populations, same starting frequency 0.5',44,98,C.muted,13)},
 assumption:'Wright–Fisher model: binomial sampling of 2N alleles each generation, no selection or mutation.'});
function drift(p){const out=[];for(let k=0;k<6;k++){const r=rng(p.seed*31+k*7+p.N),line=[.5];let f2=.5;for(let g=0;g<p.gen;g++){let c2=0;const n=2*p.N;if(n<=400){for(let i=0;i<n;i++)if(r()<f2)c2++;f2=c2/n}else{const u=Math.sqrt(-2*Math.log(r()+1e-9))*Math.cos(TAU*r());f2=clamp(f2+u*Math.sqrt(f2*(1-f2)/n),0,1)}line.push(f2)}out.push(line)}return out}

done();
})();
