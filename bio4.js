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
 draw:(c,p,t)=>{const T=cycle(t*p.speed,15),k=Math.min(4,Math.floor(T/3)),q=(T%3)/3,s=P3.scene(c,{scale:56,cx:305,cy:248,pitch:.02}),AX=-2.5,E=[2.1,-.15,0],E3=(a,b)=>[E[0]+a,E[1]+b,0.12];
  /* A: whole pistil, ovary cut open to show an ovule */
  s.mesh([AX,-1.05,0],[.78,.8,.3],'#bfe38a',{alpha:.5,rings:12,segs:18,spec:.3});s.mesh([AX,-1.1,0],[.62,.62,.28],'#e8f6c8',{alpha:.5,rings:10,segs:14});s.mesh([AX,-.95,.05],[.2,.28,.12],'#f3e2a6',{rings:8,segs:12});
  s.tube([[AX,-.35,0],[AX,.95,0]],.12,'#cdeea0',{alpha:.7,segs:10});s.mesh([AX,1.12,0],[.34,.14,.2],'#ffd43b',{rings:8,segs:12,spec:.4});
  const tp=[[AX,1.2,.1],[AX,.5,.08],[AX,-.3,.08],[AX,-.7,.1]],reach=k===0?0:k===1?q:1;
  for(let i=0;i<3;i++)s.ball([AX-.2+i*.2,1.26+.02*(i%2),.1],.07,'#f59f00',{flat:true,lift:2});
  if(reach>0){const n=Math.max(2,Math.ceil(reach*3)),pts=[];for(let i=0;i<=n;i++){const f2=Math.min(1,i/3*1+0);pts.push(tp[Math.min(3,i)])}s.tube(pts.slice(0,Math.max(2,Math.floor(reach*3)+1)),.035,'#e8a317',{segs:6})}
  s.callout([AX+.3,1.15,.1],'stigma','#ffd43b',45,-20);s.callout([AX+.1,.4,0],'style','#cdeea0',50,0);s.callout([AX-.5,-1.35,.2],'ovary','#bfe38a',-35,25);if(k===0)s.callout([AX-.2,1.28,.1],'pollen grains','#f59f00',-55,-25);else if(k===1)s.callout([AX,.2,.1],'pollen tube','#fab005',-60,10);
  /* magnification lines */
  s.seg([AX+.2,-.85,0],[E[0]-1.4,E[1]+1.2,0],'#8ca6b966',1,[3,3]);s.seg([AX+.2,-1.15,0],[E[0]-1.4,E[1]-1.2,0],'#8ca6b966',1,[3,3]);
  /* B: ovule — integuments with the micropyle, nucellus, embryo sac */
  s.mesh([E[0],E[1],-.1],[1.35,1.75,.3],'#c9a35a',{alpha:.38,rings:14,segs:24,spec:.3});s.mesh([E[0],E[1],-.05],[1.18,1.6,.3],'#e3c987',{alpha:.35,rings:14,segs:24});s.mesh([E[0],E[1],0],[.95,1.4,.25],'#f3e5b0',{alpha:.4,rings:14,segs:24});
  s.tube([[E[0],E[1]+1.5,.1],[E[0],E[1]+1.8,.1]],.1,'#6b4f20',{segs:8,alpha:.8});
  s.mesh([E[0],E[1]+.0,.08],[.68,1.15,.2],'#fff7c9',{alpha:.9,rings:14,segs:22,lift:1});
  /* egg apparatus (micropylar end), central cell with polar nuclei, antipodals (chalazal end) */
  for(const z of[-1,1]){const b=E3(z*.3,.78);s.ball(b,.17,'#e0b7f5',{spec:.4});s.ball([b[0],b[1]-.03,.2],.06,'#9c36b5',{flat:true,lift:2});for(let i=-1;i<=1;i++)s.seg([b[0]+i*.05,b[1]+.17,.12],[b[0]+i*.05,b[1]+.3,.12],'#b27fd1',1.2)}
  const eg=E3(0,.55);s.ball(eg,.22,k===4?'#e64980':'#f783ac',{spec:.4});s.ball([eg[0],eg[1]-.04,.2],.085,k===4?'#a61e4d':'#c2255c',{flat:true,lift:2});
  s.mesh([E[0],E[1]-.12,.06],[.55,.5,.12],'#fff2a8',{alpha:.5,rings:8,segs:14});
  const pn=[E3(-.1,.0),E3(.1,-.1)];if(k<4){for(const q2 of pn)s.ball(q2,.09,'#845ef7',{spec:.4,lift:2})}else s.ball(E3(0,-.05),.17,'#9775fa',{spec:.4,lift:2});
  for(let i=0;i<3;i++){const b=E3((i-1)*.3,-.95+.04*(i%2));s.ball(b,.15,'#adb5bd',{spec:.3});s.ball([b[0],b[1],.2],.055,'#6c757d',{flat:true,lift:2})}
  /* pollen tube enters the micropyle and a synergid; two male gametes are released */
  const syn=E3(-.3,.78);if(k===2){const tipY=E[1]+2.2-q*1.3,pts=[[E[0],E[1]+2.3,.1],[E[0],E[1]+1.8,.1],[E[0]-.02,Math.max(tipY,E[1]+.95),.1]];if(tipY<E[1]+.95)pts.push([syn[0]+.1,Math.max(tipY,syn[1]),.1]);s.tube(pts,.05,'#e8a317',{segs:6})}
  if(k>=3){s.tube([[E[0],E[1]+2.3,.1],[E[0],E[1]+1.8,.1],[E[0]-.02,E[1]+.95,.1],[syn[0]+.1,syn[1],.1]],.05,'#e8a317',{segs:6,alpha:k===3?1:.5});
   if(k===3){const o=[syn[0]+.1,syn[1],.2];const g1=V.add(V.mul(o,1-q),V.mul(eg,q)),g2=V.add(V.mul(o,1-q),V.mul([E[0],E[1]-.05,.2],q));s.ball(g1,.07,BC.male,{glow:true,lift:4});s.ball(g2,.07,BC.male,{glow:true,lift:4})}}
  const L=(pt,txt,col,dx,dy)=>s.callout(pt,txt,col,dx,dy);L([E[0],E[1]+1.7,.1],'micropyle','#d8b36a',65,-10);L([E[0]+1.2,E[1]+.6,0],'integuments','#c9a35a',50,-20);
  if(k<3){L([E[0]+.3,E[1]+.8,.2],'synergids','#e0b7f5',90,-40);L([E[0]+.2,E[1]+.5,.25],'egg','#f783ac',95,-10);L([E[0]+.1,E[1]-.1,.2],'2 polar nuclei','#b197fc',100,15);L([E[0]+.3,E[1]-.95,.2],'3 antipodals','#adb5bd',90,35)}
  else if(k===4){L(eg,'zygote (2n)','#ff8fb7',100,-5);L(E3(0,-.05),'PEN (3n)','#c5b3ff',100,25)}
  else L([E[0]+.3,E[1]+.0,.2],'embryo sac (7 cells, 8 nuclei)','#ffe066',85,45);
  s.render();tag(c,DF[k][0],44,98,C.gold,15)},
 assumption:'Schematic pistil and one ovule; polar nuclei shown at the centre of the embryo sac.'});

const ES=[['Megaspore mother cell (2n)',1,1],['Meiosis → 4 megaspores (n)',4,4],['3 degenerate; 1 functional megaspore',1,1],['Mitosis 1 → 2 nuclei',2,1],['Mitosis 2 → 4 nuclei',4,1],['Mitosis 3 → 8 nuclei',8,1],['Mature embryo sac: 7 cells, 8 nuclei',8,7]];
add({...ch(1,'Sexual Reproduction in Flowering Plants',U6),id:'bio-embryo-sac',title:'Development of the embryo sac',
 description:'Step through megasporogenesis and the three free-nuclear divisions that build the 7-celled, 8-nucleate embryo sac.',
 formula:'1 functional megaspore → 3 mitoses → 8 nuclei → 7 cells (monosporic development)',
 observe:'At the micropylar end: egg apparatus (2 synergids + egg); at the chalazal end: 3 antipodals; centre: 2 polar nuclei.',
 tryText:'Count the nuclei and the cells at the final stage.',
 controls:[R('stage','Stage',1,7,1,7)],
 metrics:p=>{const d=ES[p.stage-1];return[N('Stage',d[0]),N('Nuclei',d[1],'',0),N('Cells',d[2],'',0),N('Ploidy','Haploid nuclei (n) after meiosis')]},
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:56,cx:300,cy:252,pitch:.02}),st=p.stage,E=[0,-.05,0],P=(a,b,z=.12)=>[E[0]+a,E[1]+b,z],NU=(q,r,col)=>{s.ball(q,r*1.25,col,{spec:.4,lift:2});},CELL=(q,r,col)=>s.ball(q,r*1.3,col,{spec:.3});
  /* ovule: two integuments leave the micropyle open; nucellus inside; funicle at the chalazal end */
  s.mesh([E[0],E[1],-.1],[1.45,1.85,.3],'#c9a35a',{alpha:.38,rings:14,segs:24,spec:.3});s.mesh([E[0],E[1],-.05],[1.28,1.7,.3],'#e3c987',{alpha:.35,rings:14,segs:24});s.mesh([E[0],E[1],0],[1.05,1.5,.25],'#f3e5b0',{alpha:.3,rings:14,segs:24});
  s.tube([[E[0],E[1]+1.6,.1],[E[0],E[1]+1.95,.1]],.1,'#6b4f20',{segs:8,alpha:.8});s.tube([[E[0]+.3,E[1]-1.7,0],[E[0]+.7,E[1]-2.1,0]],.14,'#cdeea0',{segs:8,alpha:.8});
  const sy=[0,.35,.55,.55,.75,1.0,1.25][st-1],sx=[0,.2,.2,.3,.4,.55,.8][st-1];
  if(st>=4)s.mesh([E[0],E[1]-.05,.08],[sx,sy,.2],'#fff7c9',{alpha:.92,rings:14,segs:22,lift:1});
  if(st>=4&&st<7)s.mesh([E[0],E[1]-.05,.1],[sx*.55,sy*.5,.15],'#dff1ff',{alpha:.8,rings:10,segs:16,lift:2});
  if(st===1){CELL(P(0,.85),.3,'#e3d3ff');NU(P(0,.85,.22),.14,'#7048e8')}
  else if(st===2){for(let i=0;i<4;i++){const q=P(0,1.0-i*.38);CELL(q,.18,'#e3d3ff');NU([q[0],q[1],.2],.08,'#845ef7')}}
  else if(st===3){for(let i=0;i<3;i++)CELL(P(0,1.0-i*.3),.1-i*.01,'#bfc4c9');const q=P(0,-.3);CELL(q,.26,'#e3d3ff');NU([q[0],q[1],.22],.12,'#845ef7')}
  else if(st<7){const pos=st===4?[[0,sy*.72],[0,-sy*.72]]:st===5?[[-.14,sy*.7],[.14,sy*.7],[-.14,-sy*.7],[.14,-sy*.7]]:[[-.17,sy*.8],[.17,sy*.8],[-.17,sy*.6],[.17,sy*.6],[-.17,-sy*.6],[.17,-sy*.6],[-.17,-sy*.8],[.17,-sy*.8]];for(const [a,b] of pos)NU(P(a,b-.05,.2),st===6?.075:.095,'#845ef7')}
  else{for(const z of[-1,1]){const b=P(z*.3,.8);CELL(b,.17,'#e0b7f5');NU([b[0],b[1]-.03,.2],.06,'#9c36b5')}const eg=P(0,.55);CELL(eg,.22,'#f783ac');NU([eg[0],eg[1]-.04,.2],.085,'#c2255c');s.mesh(P(0,-.1,.06),[.55,.5,.12],'#fff2a8',{alpha:.5,rings:8,segs:14});NU(P(-.1,.0,.2),.09,'#845ef7');NU(P(.1,-.1,.2),.09,'#845ef7');for(let i=0;i<3;i++){const b=P((i-1)*.3,-.95+.04*(i%2));CELL(b,.15,'#adb5bd');NU([b[0],b[1],.2],.055,'#6c757d')}}
  const L=(q,txt,col,dx,dy)=>s.callout(q,txt,col,dx,dy);L([E[0],E[1]+1.9,.1],'micropyle (top)','#d8b36a',70,-5);L([E[0]+.4,E[1]-1.95,0],'chalaza (base)','#cdeea0',70,5);L([E[0]+1.3,E[1]+.6,0],'integuments','#c9a35a',45,-30);L([E[0]-1.0,E[1]+.5,0],'nucellus','#f3e5b0',-60,-20);
  if(st===1)L(P(0,.85,.3),'megaspore mother cell (2n)','#c5b3ff',-110,-10);else if(st===2)L(P(0,.4,.2),'4 megaspores (n)','#c5b3ff',-90,15);else if(st===3){L(P(0,.7,.2),'3 degenerate','#bfc4c9',-85,0);L(P(0,-.3,.3),'functional megaspore','#c5b3ff',-95,25)}
  else if(st<7)L(P(0,-sy*.3,.2),'embryo sac: free nuclei','#ffe066',-95,60);
  else{L(P(.3,.8),'synergids','#e0b7f5',90,-30);L(P(0,.55,.25),'egg','#f783ac',-90,-10);L(P(.1,-.1,.25),'2 polar nuclei','#b197fc',-110,30);L(P(.3,-.95,.2),'3 antipodals','#adb5bd',90,15)}
  s.render();tag(c,ES[st-1][0],44,98,C.gold,14)},
 assumption:'Polygonum type (monosporic) embryo sac, as described in NCERT.'});

const POLL={auto:['Autogamy','Pollen to stigma of the same flower','Genetically identical (selfing)'],geit:['Geitonogamy','Pollen to another flower of the same plant','Functionally cross, genetically self'],xeno:['Xenogamy','Pollen to a flower of a different plant','Brings genetically different pollen']};
add({...ch(1,'Sexual Reproduction in Flowering Plants',U6),id:'bio-pollination',title:'Kinds and agents of pollination',
 description:'Move pollen within a flower, between flowers of one plant, or between plants — by wind or by insects.',
 formula:'Autogamy · geitonogamy · xenogamy',
 observe:'Wind-pollinated flowers make light, non-sticky pollen and feathery stigmas; insect-pollinated flowers are colourful with nectar.',
 tryText:'Switch to wind and see how much pollen misses.',
 controls:[S('type','Type','xeno',Object.keys(POLL).map(k=>[k,POLL[k][0]])),S('agent','Agent','insect',[['insect','Insect (bee)'],['wind','Wind']])],
 metrics:p=>{const d=POLL[p.type];return[N('Type',d[0]),N('Pollen goes to',d[1]),N('Genetics',d[2]),N('Agent features',p.agent==='wind'?'Light pollen, feathery stigma, often no nectar':'Colour, scent, nectar; sticky pollen')]},
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:54,cx:330,cy:262,pitch:.02}),wind=p.agent==='wind',F1=[-2.4,.9,0],F2=[-1.35,1.45,0],F3=[2.2,1.15,0];
  /* ground and two plants with leaves */
  s.poly([[-3.6,-1.75,-.2],[3.6,-1.75,-.2],[3.6,-2.1,-.2],[-3.6,-2.1,-.2]],'#6d4c2f',{cull:false});
  const stem=(pts)=>s.tube(pts,.055,'#5b8f3a',{segs:8}),lf=(q,dir,len)=>leafShape(s,q,dir,len),leafShape=(S,q,d,len)=>{S.mesh(V.add(q,V.mul(d,len*.5)),[len*.5,len*.17,.05],'#4ea24a',{rings:6,segs:10,rot:[0,0,Math.atan2(d[1],d[0])],spec:.3})};
  stem([[-2.0,-1.75,0],[-2.05,-.5,0],[-2.3,.4,0],F1.map((v,i)=>i===1?v-.28:v)]);stem([[-2.05,-.3,0],[-1.8,.5,0],[F2[0]-.05,F2[1]-.3,0]]);stem([[2.0,-1.75,0],[2.05,-.4,0],[F3[0]-.05,F3[1]-.3,0]]);
  lf([-2.05,-1.1,0],[-1,.5,0],.9);lf([-2.05,-.7,0],[1,.45,0],.9);lf([2.05,-1.2,0],[-1,.5,0],.9);lf([2.05,-.8,0],[1,.45,0],.9);
  /* flowers: petals + stamens (filament and anther) around a central pistil with stigma */
  const flower=(q,anthers)=>{const pc=wind?'#c5d99a':'#ff8fab',pl=wind?.26:.46;for(let k=0;k<6;k++){const a=TAU*k/6+.3;petal(s,q,[Math.cos(a),Math.sin(a),.12],pl,wind?.09:.24,pc)}
   for(let k=0;k<5;k++){const a=TAU*k/5+.1,r=wind?.5:.2,e=V.add(q,[Math.cos(a)*r,Math.sin(a)*r-(wind?.12:0),.18]);s.tube([V.add(q,[0,0,.1]),e],.012,'#d9e2a0',{segs:4});s.ball(e,wind?.06:.045,anthers?'#f59f00':'#ffd43b',{spec:.4,lift:2})}
   s.tube([V.add(q,[0,-.1,0]),V.add(q,[0,.1,.2])],.025,'#a8d86a',{segs:5});if(wind){for(let k=0;k<5;k++){const a=-.9+k*.45;s.seg(V.add(q,[0,.1,.2]),V.add(q,[Math.sin(a)*.18,.1+Math.cos(a)*.18,.22]),'#e9f5c0',1.6)}}else s.ball(V.add(q,[0,.12,.2]),.065,'#ff6b9a',{flat:true,lift:3,spec:.5})};
  flower(F1,true);flower(F2,false);flower(F3,false);
  const dst={auto:F1,geit:F2,xeno:F3}[p.type],q=cycle(t*.25,1);
  if(!wind){const base=p.type==='auto'?V.add(F1,[.35*Math.cos(t*3),.4+.1*Math.sin(t*5),0]):V.add(V.add(F1,V.mul(V.sub(dst,F1),q)),[0,.7*Math.sin(PI*q)+.35,0]),fl=Math.sin(t*50),dirx=p.type==='auto'?Math.sign(Math.cos(t*3))||1:Math.sign(dst[0]-F1[0])||1,bx=(a,b,z=0)=>V.add(base,[a*dirx*.9,b*.9,z]);
   s.mesh(bx(0,0),[.19,.15,.15],'#3d3027',{rings:6,segs:10});s.mesh(bx(-.22,0),[.22,.17,.17],'#f2b01e',{rings:6,segs:10,spec:.4});s.mesh(bx(-.5,-.01),[.18,.15,.15],'#2b2b2b',{rings:6,segs:10});s.mesh(bx(-.7,-.03),[.15,.12,.12],'#f2b01e',{rings:6,segs:10});s.mesh(bx(.2,.03),[.1,.09,.1],'#3d3027',{rings:5,segs:8});
   for(const z of[-1,1])s.mesh(bx(-.2,.25+.04*fl,z*.05),[.3,.1+.06*fl*fl,.04],'#dfeaff',{alpha:.55,rings:5,segs:10,rot:[0,0,.5*dirx]});s.ball(bx(-.3,-.16),.04,'#ffd43b',{flat:true,lift:2})}
  else for(let i=0;i<26;i++){const qq=cycle(t*.25+i/26,1),pos=V.add(V.add(F1,[0,.1,.3]),V.add(V.mul(V.sub(dst===F1?V.add(F1,[1.2,0,0]):dst,F1),qq),[0,(hash(i)-.5)*.5*qq+.25*Math.sin(qq*6+i)+.2*qq,0]));s.ball(pos,.035,'#ffd43b',{flat:true,lift:2})}
  s.callout(V.add(F1,[0,.2,.2]),'anther → pollen source','#fab005',-85,-20);s.callout(V.add(dst,[0,.1,.2]),p.type==='auto'?'stigma of the same flower':p.type==='geit'?'another flower, same plant':'flower of a different plant','#ff8fab',60,-70);s.render();tag(c,wind?'wind: light, dry pollen; dull flowers, feathery stigma':'insect: colourful, scented flowers with nectar',44,98,'#e9f6ff',13)},
 assumption:'Two plants of the same species; pollen paths are illustrative.'});

/* ---------- Chapter 2: Human Reproduction ---------- */
add({...ch(2,'Human Reproduction',U6),id:'bio-menstrual-cycle',title:'Menstrual cycle: ovary, uterus and hormones',
 description:'Move through a 28-day cycle and watch follicle growth, ovulation, the corpus luteum and the uterine lining.',
 formula:'LH surge (≈ day 14) → ovulation',
 observe:'Progesterone from the corpus luteum maintains the endometrium; if fertilisation does not occur it degenerates and menstruation follows.',
 tryText:'Move to day 14. Which hormone peaks?',
 controls:[R('day','Day of cycle',1,28,1,14,'day')],
 metrics:p=>{const r=mens(p.day);return[N('Phase',r.phase),N('Ovary',r.ovary),N('Uterus (endometrium)',r.uterus),N('Hormone in the lead',r.lead)]},
 draw:(c,p,t)=>{const r=mens(p.day),s=P3.scene(c,{scale:52,cx:205,cy:255,pitch:.02}),d=p.day,U=[0,-1.25,0],O=[-1.95,1.0,0],th=d<=5?.35*(1-d/5)+.08:d<=14?.08+.32*(d-5)/9:.4+.15*Math.min(1,(d-14)/7)*(d<26?1:.4),f=Math.min(.8,th*1.6),
  W=[[.05,0],[.2,.05],[.24,.5],[.3,.8],[.55,1.2],[.8,1.6],[.88,1.9],[.7,2.15],[.4,2.28],[.05,2.3]];
  /* uterus: muscular wall, endometrium, lumen (thickness follows the day of the cycle) */
  s.lathe(U,W,'#ef9a9a',{alpha:.45,segs:28,spec:.3});const side=(k)=>W.map(([rr,y])=>[U[0]+k*rr,U[1]+y,.3]),ring=(k,m)=>W.map(([rr,y],i)=>[U[0]+k*(i<2?rr*.2:rr*m),U[1]+y,.3]);
  const poly2=(m,col,al)=>s.poly([...ring(-1,m),...ring(1,m).reverse()],col,{cull:false,alpha:al,z:1e5});poly2(.82,'#cf3b3b',.95);poly2(.82*(1-f),'#4a0f1a',.95);s.path(side(-1).concat(side(1).reverse()),'#d98080',1.5,[],1e5);
  /* fallopian tubes sweep from the uterine horns to the ovaries and end in fimbriae */
  for(const z of[-1,1]){const T=[[z*.62,U[1]+2.05,0],[z*1.1,U[1]+2.35,0],[z*1.55,U[1]+2.3,0],[z*1.85,U[1]+2.0,0],[z*2.0,U[1]+1.7,0]];s.tube(T,u=>.07+.06*u,'#e59a8f',{segs:8});for(let i=0;i<6;i++){const a=-1.2+i*.5;s.seg(T[4],[T[4][0]+z*.16*Math.cos(a)-.0,T[4][1]+.18*Math.sin(a)-.1,0],'#d7776b',2.2)}}
  /* ovaries; the left one is shown in section with the cycle's follicle */
  s.mesh([-1.7,.55,0],[.6,.45,.35],'#f3b9a6',{rings:12,segs:18,spec:.4,shape:(u,v)=>1+.05*Math.sin(7*v+u)});s.mesh([1.7,.55,0],[.6,.45,.35],'#f3b9a6',{rings:12,segs:18,spec:.4});
  const OV=[-1.7,.55,0],fol=d<14?.1+.2*d/14:d===14?.32:0;for(let i=0;i<4;i++)s.ball([OV[0]-.2+i*.15,OV[1]-.2+.07*(i%2),.34],.045,'#fff1f0',{flat:true});
  if(fol){const fp=[OV[0]+.18+.1*Math.min(1,d/14),OV[1]+.05+.08*Math.min(1,d/14),.12];s.mesh(fp,[fol,fol,fol*.9],'#ffe08a',{alpha:.85,rings:10,segs:14,spec:.5,lift:1});s.mesh(fp,[fol*.7,fol*.7,fol*.65],'#fff7d6',{alpha:.7,rings:8,segs:12,lift:2});s.ball([fp[0]+fol*.15,fp[1]+fol*.1,.3],.05,'#f783ac',{flat:true,lift:3})}
  if(d>=14&&d<=16){const q=(d-14)/2.5,tip=[-2.0,U[1]+1.65,0],pos=[OV[0]-.1+(tip[0]-OV[0]+.1)*q,OV[1]+.3+(tip[1]-OV[1]-.3)*q,.3];s.ball(pos,.09,'#f783ac',{glow:true,lift:4})}
  if(d>14){const cl=.28*(d<24?1:(28-d)/4);if(cl>0)s.mesh([OV[0]+.2,OV[1]+.08,.15],[cl,cl,cl*.9],'#f2a900',{rings:10,segs:14,spec:.4,lift:1})}
  s.callout([OV[0]-.3,OV[1]-.3,.3],'ovary','#ffc9c9',-45,35);if(fol)s.callout([OV[0]+.25,OV[1]+.1,.4],d===14?'Graafian follicle ruptures':'growing follicle','#ffe066',-70,-55);if(d>14&&d<28)s.callout([OV[0]+.2,OV[1]+.08,.4],'corpus luteum (progesterone)','#fab005',-80,-55);if(d>=14&&d<=16)s.callout([-1.95,U[1]+1.7,.3],'ovum','#f783ac',-45,-35);
  s.callout([1.85,U[1]+2.1,0],'fallopian tube','#e59a8f',45,-25);s.callout([.55,U[1]+1.3,.4],'uterus wall','#ffa8a8',55,15);s.callout([0,U[1]+1.1,.5],d<=5?'endometrium shed (menses)':'endometrium','#ff6b6b',80,45);s.render();
  chart(c,410,96,246,190,{title:'Hormones (relative)',xl:'day',xmin:1,xmax:28,ymin:0,ymax:1.05,series:[{fn:x=>hormone(x,'LH'),col:'#ff6b6b'},{fn:x=>hormone(x,'FSH'),col:'#4dabf7'},{fn:x=>hormone(x,'E'),col:'#ffd43b'},{fn:x=>hormone(x,'P'),col:'#69db7c'}],marker:[d,hormone(d,r.key)]});tag(c,'LH red · FSH blue · oestrogen yellow · progesterone green',420,278,C.muted,10)},
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
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:50,cx:300,cy:240,pitch:.02}),sp=p.type==='sperm',n=p.cells,Y=[1.7,.4,-.95];
  /* a cell: membrane ring, cytoplasm, nucleus with chromosome rods */
  const cell=(x,y,r,col,nu,nr)=>{s.ball([x,y,0],r,col,{spec:.4});s.ball([x,y,.1],r*nr,nu,{flat:false,lift:1});for(let i=0;i<3;i++){const a=i*2.1+x;s.seg([x+Math.cos(a)*r*nr*.4,y+Math.sin(a)*r*nr*.4-r*nr*.2,.2],[x+Math.cos(a)*r*nr*.4,y+Math.sin(a)*r*nr*.4+r*nr*.2,.2],'#1f1147',2,[],1e5)}},
  sperm=(x,y,i)=>{s.mesh([x,y,0],[.11,.075,.075],'#4aa3ff',{rings:6,segs:10,spec:.5});s.mesh([x,y+.07,0],[.07,.035,.07],'#e8f4ff',{rings:4,segs:8,lift:1});s.tube([[x,y-.08,0],[x,y-.3,0]],.04,'#ffa94d',{segs:6});s.tube([[x,y-.3,0],[x+.04*Math.sin(t*6+i),y-.55,0],[x-.04*Math.sin(t*6+i),y-.8,0],[x+.03*Math.sin(t*6+i),y-1.0,0]],.014,'#8fc7ff',{segs:4})};
  for(let k=0;k<n;k++){const ox=(k-(n-1)/2)*(sp?2.4:2.0);
   if(sp){cell(ox,Y[0],.36,'#c9b8ff','#6741d9',.55);for(const dx of[-.55,.55]){cell(ox+dx,Y[1],.27,'#b7a3ff','#5f3dc4',.5);s.seg([ox,Y[0]-.34,0],[ox+dx,Y[1]+.27,0],'#adb5bd',1.5)}
    for(let i=0;i<4;i++){const x=ox+(i-1.5)*.38;sperm(x,Y[2]+.1,i);s.seg([ox+(i<2?-.55:.55),Y[1]-.26,0],[x,Y[2]+.19,0],'#adb5bd',1)}}
   else{cell(ox,Y[0],.44,'#f6a8c6','#c2255c',.5);cell(ox-.25,Y[1],.34,'#f783ac','#a61e4d',.5);cell(ox+.45,Y[1]+.05,.1,'#ced4da','#868e96',.5);s.seg([ox-.1,Y[0]-.42,0],[ox-.2,Y[1]+.34,0],'#adb5bd',1.5);s.seg([ox+.2,Y[0]-.3,0],[ox+.42,Y[1]+.12,0],'#adb5bd',1.2);
    cell(ox-.35,Y[2],.34,'#f783ac','#a61e4d',.5);cell(ox+.12,Y[2]-.05,.1,'#ced4da','#868e96',.5);cell(ox+.45,Y[2]+.1,.1,'#ced4da','#868e96',.5);s.seg([ox-.25,Y[1]-.34,0],[ox-.33,Y[2]+.34,0],'#adb5bd',1.5);s.seg([ox-.2,Y[1]-.3,0],[ox+.1,Y[2]+.05,0],'#adb5bd',1)}}
  const lx=-3.4;s.label([lx,Y[0],0],'primary',C.muted,11);s.label([lx,Y[1],0],'meiosis I',C.muted,11);s.label([lx,Y[2],0],'meiosis II',C.muted,11);
  const x0=(0-(n-1)/2)*(sp?2.4:2.0);
  if(sp){s.callout([x0+.36,Y[0],0],'primary spermatocyte (2n)','#c9b8ff',65,-5);s.callout([x0+.55+.27,Y[1],0],'secondary spermatocyte (n)','#b7a3ff',65,10);s.callout([x0+.57,Y[2]+.1,0],'spermatids → sperms (n)','#8fc7ff',70,30)}
  else{s.callout([x0+.44,Y[0],0],'primary oocyte (2n)','#f6a8c6',70,-5);s.callout([x0-.25,Y[1]+.34,0],'secondary oocyte (n)','#f783ac',-80,-25);s.callout([x0+.45,Y[1]+.05,0],'1st polar body','#ced4da',70,-5);s.callout([x0-.35,Y[2]-.2,0],'ovum (n)','#ff8fb7',-70,35);s.callout([x0+.12,Y[2]-.05,0],'2nd polar body','#ced4da',55,40)}
  s.render()},
 assumption:'One primary cell per column; spermiogenesis (spermatid → sperm) merged into the last row.'});

const EMB=[[0,'Zygote','Ampullary region of fallopian tube',1],[1,'2-cell stage (cleavage)','Fallopian tube',2],[2,'4-cell stage','Fallopian tube',4],[3,'8–16 cells: morula','Moving towards uterus',16],[5,'Blastocyst','Uterus',64],[7,'Implantation','Embedded in endometrium',100]];
add({...ch(2,'Human Reproduction',U6),id:'bio-early-development',title:'From zygote to implantation',
 description:'Follow the embryo down the fallopian tube as it cleaves into a morula and a blastocyst, then implants in the uterus.',
 formula:'Zygote → cleavage → morula → blastocyst → implantation',
 observe:'The blastocyst’s outer trophoblast attaches to the endometrium; its inner cell mass becomes the embryo.',
 tryText:'Move to day 5. Which two parts does the blastocyst have?',
 controls:[R('day','Days after fertilisation',0,7,.5,3,'days',1)],
 metrics:p=>{const e=[...EMB].reverse().find(x=>p.day>=x[0]);return[N('Stage',e[1]),N('Location',e[2]),N('Approximate cells',e[3]<100?e[3]:'Many','',0),N('Next',p.day<5?'Cleavage continues':'Trophoblast attaches to uterine wall')]},
 draw:(c,p,t)=>{const e=[...EMB].reverse().find(x=>p.day>=x[0]),s=P3.scene(c,{scale:50,cx:285,cy:245,pitch:.02}),d=p.day,n=e[3],UC=[-1.5,-2.1,0],
  W=[[.05,0],[.2,.05],[.22,.5],[.28,.8],[.5,1.2],[.72,1.6],[.8,1.9],[.65,2.1],[.38,2.2],[.05,2.22]].map(([r,y])=>[r*.85,y*.85]);
  /* tract: uterus (coronal section) with cavity, fallopian tubes and ovary */
  s.lathe(UC,W,'#ef9a9a',{alpha:.45,segs:24});const ring=(k,m)=>W.map(([r,y],i)=>[UC[0]+k*(i<2?r*.2:r*m),UC[1]+y,.3]);s.poly([...ring(-1,.8),...ring(1,.8).reverse()],'#cf3b3b',{cull:false,alpha:.95,z:1e5});s.poly([...ring(-1,.45),...ring(1,.45).reverse()],'#4a0f1a',{cull:false,alpha:.9,z:1e5});
  const L=[[-2.05,-.4,0],[-2.5,.1,0],[-3.0,.35,0],[-3.3,.15,0]],R=[[-.95,-.4,0],[-.5,.1,0],[0,.35,0],[.3,.15,0]];s.tube(L,u=>.07+.05*u,'#e59a8f',{segs:8});s.tube(R,u=>.07+.05*u,'#e59a8f',{segs:8});for(let i=0;i<5;i++){const a=-1.0+i*.5;s.seg(L[3],[L[3][0]-.14*Math.cos(a),L[3][1]+.14*Math.sin(a)-.08,0],'#d7776b',2)}
  s.mesh([-3.35,-.35,0],[.42,.3,.25],'#f3b9a6',{rings:10,segs:14,spec:.4});s.mesh([.5,-.35,0],[.42,.3,.25],'#f3b9a6',{rings:10,segs:14});
  const path=[[-3.3,.1,0],[-3.0,.35,0],[-2.5,.1,0],[-2.05,-.4,0],[-1.9,-.9,0],[-1.6,-1.2,0]],pos=d>=7?[-1.45,-.75,0]:along(path,Math.min(1,d/6));s.ball([pos[0],pos[1],.35],.1,'#ffc078',{glow:true,lift:5});s.seg([pos[0]+.1,pos[1],.3],[.55,.4,0],'#8ca6b9',1,[3,3]);
  s.callout([-3.35,-.35,.2],'ovary','#ffc9c9',-5,50);s.callout([-2.6,.12,0],'fallopian tube','#ffc9c9',-25,-45);s.callout([-1.9,-1.6,.4],'uterus','#ffa8a8',-65,25);
  /* magnified embryo */
  const M=[2.1,.45,0],R0=1.25;s.ball([M[0],M[1],-.4],R0*1.18,'#0f1b2d',{alpha:.45});s.ball([M[0],M[1],-.4],R0*1.18,'#3b556d',{alpha:.2});
  const cellc='#ffc078',tro='#ffb066',cell=(q,r,col,nu)=>{s.ball(q,r,col,{spec:.4});if(nu!==false)s.ball([q[0],q[1],q[2]+r*.3],r*.38,'#e8590c',{flat:true,lift:1})};
  if(d>=5){const bc=d>=7?[M[0],M[1]+.25,0]:M,N=40,Rb=1.0;s.mesh(bc,[Rb*.9,Rb*.9,Rb*.9],'#bfe3ff',{alpha:.28,rings:10,segs:16});
   for(let i=0;i<N;i++){const y=1-2*(i+.5)/N,rr=Math.sqrt(1-y*y),a=i*2.4;if(d>=7&&y<-.5)continue;cell([bc[0]+Rb*rr*Math.cos(a),bc[1]+Rb*y,Rb*rr*Math.sin(a)*.8],.16,tro,false)}
   for(let i=0;i<6;i++){const a=i*1.1,r2=.14+.06*(i%2);cell([bc[0]-.45+.28*Math.cos(a)*.9,bc[1]+.35+.24*Math.sin(a)*.9,.1+.08*Math.sin(a*2)],.17,'#e8590c',false)}
   if(d>=7){s.poly([[M[0]-1.4,M[1]-.55,-.3],[M[0]+1.4,M[1]-.55,-.3],[M[0]+1.4,M[1]-1.4,-.3],[M[0]-1.4,M[1]-1.4,-.3]],'#c0392b',{cull:false,z:-1e5});s.callout([M[0]+.9,M[1]-1.0,0],'endometrium','#ff8a80',30,25)}
   s.callout([M[0]+.8,M[1]+.7,.4],'trophoblast','#ffc078',45,-25);s.callout([M[0]-.5,M[1]+.4,.4],'inner cell mass → embryo','#ff922b',-75,-45);s.callout([M[0]+.2,M[1]-.3,.3],'blastocoel (cavity)','#bfe3ff',60,35)}
  else if(n===1){cell(M,.65,cellc)}
  else if(n===2){cell([M[0]-.5,M[1],0],.55,cellc);cell([M[0]+.5,M[1],0],.55,cellc)}
  else if(n===4){for(let i=0;i<4;i++)cell([M[0]+(i%2?.5:-.5),M[1]+(i<2?.5:-.5),0],.5,cellc)}
  else{for(let i=0;i<16;i++){const y=1-2*(i+.5)/16,rr=Math.sqrt(1-y*y),a=i*2.4;cell([M[0]+.62*rr*Math.cos(a),M[1]+.62*y,.62*rr*Math.sin(a)],.3,cellc)}}
  if(d<5)s.callout([M[0]+.2,M[1]+.7,.3],e[1],'#ffc078',55,-35);s.render()},
 assumption:'Typical human timeline; implantation begins about a week after fertilisation.'});

/* ---------- Chapter 3: Reproductive Health ---------- */
add({...ch(3,'Reproductive Health',U6),id:'bio-population-growth-rate',title:'Population growth and doubling time',
 description:'Choose a growth rate and see how fast a population doubles — the reason reproductive health matters.',
 formula:'N = N₀e^(rt) ;  doubling time ≈ 70 / (r in %)',
 observe:'Even a growth rate under 2% per year doubles a population in about 35–40 years.',
 tryText:'Compare 1.7% per year with 1% per year over 50 years.',
 controls:[R('r','Growth rate',.5,3,.1,1.7,'% per year',1),R('years','Years ahead',0,100,1,30,'years'),R('N0','Starting population',100,1400,10,1210,'million')],
 metrics:p=>{const Nn=p.N0*Math.exp(p.r/100*p.years);return[N('Population after',Nn,'million',0),N('Doubling time',Math.log(2)/(p.r/100),'years',1),N('India at independence','≈ 350 million'),N('Census 2011','> 1.2 billion')]},
 draw:(c,p,t)=>{const k=p.r/100,Nn=p.N0*Math.exp(k*p.years),cnt=Math.min(40,Math.round(10*Nn/p.N0)),per=10,x0=56,y0=140,dx=34,dy=48,dbl=Math.log(2)/k,ymax=Math.max(2.2*p.N0,p.N0*Math.exp(k*100)*1.03);
  /* crowd of people: each figure stands for N0/10 million people (blue = starting population, orange = added) */
  for(let i=0;i<cnt;i++){const col=i<10?'#4dabf7':'#ffa94d',x=x0+(i%per)*dx+(Math.floor(i/per)%2?6:0),y=y0+Math.floor(i/per)*dy;c.save();c.fillStyle=col;c.beginPath();c.arc(x,y,6.5,0,TAU);c.fill();c.beginPath();c.moveTo(x-10,y+27);c.quadraticCurveTo(x-11,y+10,x,y+10);c.quadraticCurveTo(x+11,y+10,x+10,y+27);c.closePath();c.fill();c.restore()}
  tag(c,'each figure ≈ '+Math.round(p.N0/10)+' million people',44,98,C.muted,12);tag(c,'blue: starting population · orange: added',44,114,C.muted,12);
  tag(c,Nn>=2*p.N0?'population has more than doubled (doubling time '+dbl.toFixed(1)+' years)':'doubling time '+dbl.toFixed(1)+' years — not yet doubled',44,y0+Math.min(3,Math.floor((cnt-1)/per))*dy+50,C.gold,12);
  chart(c,420,96,236,170,{title:'Population (million)',xl:'years ahead',xmin:0,xmax:100,ymin:0,ymax:ymax,series:[{fn:y=>p.N0*Math.exp(k*y),col:C.gold},{fn:()=>2*p.N0,col:'#8ca6b9',dash:[4,4]}],marker:[p.years,Nn]});tag(c,'dashed: twice the starting population',420,278,C.muted,10)},
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
 draw:(c,p,t)=>{const g1=p.p1.split(''),g2=p.p2.split(''),obs=sample1(p),GX=122,GY=168,CW=88,CH=86,
  txt=(s2,x,y,col,sz,al)=>{c.save();c.font='600 '+sz+'px system-ui,sans-serif';c.fillStyle=col;c.textAlign=al||'center';c.textBaseline='middle';c.fillText(s2,x,y);c.restore()},
  /* a pea plant icon: tall (long stem, 4 leaf pairs) or dwarf (short stem, 2 leaf pairs) */
  plant=(x,y,tall,sc)=>{const h=(tall?44:19)*sc,nl=tall?4:2,col=tall?'#37b24d':'#94d82d';c.save();c.lineCap='round';c.strokeStyle='#2b8a3e';c.lineWidth=Math.max(1.4,2.2*sc);c.beginPath();c.moveTo(x,y);c.lineTo(x,y-h);c.stroke();c.fillStyle=col;for(let i=0;i<nl;i++){const yy=y-h*(.25+.7*i/nl),w=(7-(i>1&&tall?1:0))*sc;for(const sg of[-1,1]){c.beginPath();c.ellipse(x+sg*w*.9,yy-w*.25*(sg>0?1:.2),w,w*.42,sg*-.5,0,TAU);c.fill()}}c.fillStyle=tall?'#ffe066':'#fcc2d7';c.beginPath();c.arc(x,y-h-2*sc,3.2*sc,0,TAU);c.fill();c.restore()},
  gam=(a,x,y)=>{c.save();c.beginPath();c.arc(x,y,13,0,TAU);c.fillStyle=a==='T'?'#ffd43b':'#4dabf7';c.fill();c.restore();txt(a,x,y+1,'#10243a',15)};
  /* Punnett square: gametes of parent 1 across the top, of parent 2 down the side */
  txt('gametes of parent 1 ('+p.p1+')',GX+CW,GY-48,C.muted,11);txt('parent 2',GX-70,GY+CH-10,C.muted,11);txt('('+p.p2+')',GX-72,GY+CH+6,C.muted,11);
  for(let i=0;i<2;i++){gam(g1[i],GX+CW*(i+.5),GY-26);gam(g2[i],GX-28,GY+CH*(i+.5))}
  for(let i=0;i<2;i++)for(let j=0;j<2;j++){const geno=[g1[i],g2[j]].sort().join(''),tall=geno.includes('T'),x=GX+i*CW,y=GY+j*CH;c.save();c.fillStyle=tall?'rgba(55,178,77,.18)':'rgba(148,216,45,.16)';c.strokeStyle='rgba(180,200,215,.5)';c.lineWidth=1.2;c.beginPath();c.rect(x,y,CW,CH);c.fill();c.stroke();c.restore();plant(x+CW/2,y+CH-24,tall,.95);txt(geno,x+CW/2,y+CH-10,C.white,13)}
  txt('green: tall (TT, Tt)   lime: dwarf (tt)',GX+CW,GY+2*CH+14,C.muted,10);
  /* random offspring sample */
  const n=Math.min(p.n,120),FX=350,FY=140,FW=290,FH=190,cols=Math.ceil(Math.sqrt(n*FW/FH)),rows=Math.ceil(n/cols),dx=FW/cols,dy=FH/rows,sc=Math.min(dx/22,dy/50,1.05);
  txt('offspring sample ('+n+' plants)',FX,FY-12,C.muted,11,'left');for(let k=0;k<n;k++)plant(FX+dx*(k%cols+.5),FY+dy*(Math.floor(k/cols)+.95),obs.list[k],sc);
  txt(obs.tall+' tall : '+obs.dwarf+' dwarf',FX,FY+FH+22,C.gold,13,'left')},
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
 draw:(c,p,t)=>{const g1=gam(p.p1),g2=gam(p.p2),r=cross2(p.p1,p.p2),GX=150,GY=150,CS=54,
  txt=(s2,x,y,col,sz,al)=>{c.save();c.font='600 '+sz+'px system-ui,sans-serif';c.fillStyle=col;c.textAlign=al||'center';c.textBaseline='middle';c.fillText(s2,x,y);c.restore()},
  /* seed icon: round = smooth disc, wrinkled = dented outline; yellow or green cotyledons */
  seed=(x,y,round,yel,rad)=>{c.save();c.beginPath();for(let i=0;i<=36;i++){const a=TAU*i/36,k=round?1:1-.14*Math.abs(Math.sin(a*3+.6))-.05*Math.sin(a*5);const px=x+Math.cos(a)*rad*k,py=y+Math.sin(a)*rad*k;i?c.lineTo(px,py):c.moveTo(px,py)}c.closePath();const gr=c.createRadialGradient(x-rad*.35,y-rad*.4,rad*.1,x,y,rad*1.1);gr.addColorStop(0,yel?'#fff0a0':'#c3f0b0');gr.addColorStop(.6,yel?'#ffd43b':'#69db7c');gr.addColorStop(1,yel?'#d6a50f':'#2f9e44');c.fillStyle=gr;c.fill();c.lineWidth=1;c.strokeStyle='rgba(0,0,0,.25)';c.stroke();c.restore()};
  txt('gametes of parent 1 ('+p.p1+')',GX+2*CS,GY-48,C.gold,11);txt('parent 2',GX-70,GY+2*CS-8,C.blue,11);txt('('+p.p2+')',GX-70,GY+2*CS+8,C.blue,11);
  for(let i=0;i<4;i++){txt(g1[i],GX+CS*(i+.5),GY-22,C.gold,13);txt(g2[i],GX-26,GY+CS*(i+.5),C.blue,13)}
  for(let i=0;i<4;i++)for(let j=0;j<4;j++){const a=g1[i],b=g2[j],round=a[0]==='R'||b[0]==='R',yel=a[1]==='Y'||b[1]==='Y',x=GX+i*CS,y=GY+j*CS;c.save();c.fillStyle=(i+j)%2?'rgba(28,58,79,.9)':'rgba(33,68,91,.9)';c.fillRect(x,y,CS,CS);c.strokeStyle='rgba(180,200,215,.25)';c.strokeRect(x,y,CS,CS);c.restore();seed(x+CS/2,y+CS/2-4,round,yel,15);txt(a[0]+b[0]!==''?[a[0],b[0]].sort().join('')+[a[1],b[1]].sort().join(''):'',x+CS/2,y+CS-6,C.muted,9)}
  /* phenotype key with expected counts */
  const key=[['round yellow',true,true,r.RY],['round green',true,false,r.Ry],['wrinkled yellow',false,true,r.rY],['wrinkled green',false,false,r.ry]];txt('phenotypes (out of 16)',420,GY-12,C.muted,11,'left');
  key.forEach((k,i)=>{const y=GY+26+i*46;seed(432,y,k[1],k[2],14);txt(k[0],458,y,C.white,13,'left');txt(k[3]+' / 16',600,y,C.gold,14,'right')})},
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
 draw:(c,p,t)=>{const kids=codom(p),snap=p.mode==='snap',GX=122,GY=168,CW=88,CH=86,
  txt=(s2,x,y,col,sz,al)=>{c.save();c.font='600 '+sz+'px system-ui,sans-serif';c.fillStyle=col;c.textAlign=al||'center';c.textBaseline='middle';c.fillText(s2,x,y);c.restore()},
  shade=(h,k)=>{const n=parseInt(h.slice(1),16),f=v=>Math.max(0,Math.min(255,Math.round(v*k)));return'rgb('+f(n>>16)+','+f((n>>8)&255)+','+f(n&255)+')'},
  /* snapdragon spike: stem, leaves and two-lipped florets in the phenotype colour */
  flower=(x,y,col,sc)=>{c.save();c.lineCap='round';c.strokeStyle='#2b8a3e';c.lineWidth=2.2*sc;c.beginPath();c.moveTo(x,y);c.lineTo(x,y-50*sc);c.stroke();c.fillStyle='#37b24d';for(const sg of[-1,1]){c.beginPath();c.ellipse(x+sg*8*sc,y-8*sc,8*sc,3.2*sc,sg*-.5,0,TAU);c.fill()}
   for(let k=0;k<3;k++){const fy=y-24*sc-k*11*sc,w=(11-k*1.5)*sc;c.fillStyle=col;c.strokeStyle='rgba(0,0,0,.3)';c.lineWidth=1;c.beginPath();c.ellipse(x,fy-3*sc,w,w*.62,0,0,TAU);c.fill();c.stroke();c.fillStyle=shade(col==='#f8f9fa'?'#dfe3e8':col,.86);c.beginPath();c.ellipse(x,fy+w*.42,w*.78,w*.45,0,0,TAU);c.fill();c.stroke()}c.restore()},
  rbc=(x,y,ag,sc)=>{c.save();for(let m=0;m<12;m++){const a=TAU*m/12,col=ag.length?({A:'#ffd43b',B:'#4dabf7'})[ag[m%ag.length]]:null;if(!col)continue;c.strokeStyle=col;c.lineWidth=1.6;c.beginPath();c.moveTo(x+Math.cos(a)*17*sc,y+Math.sin(a)*17*sc);c.lineTo(x+Math.cos(a)*23*sc,y+Math.sin(a)*23*sc);c.stroke();c.fillStyle=col;c.beginPath();c.arc(x+Math.cos(a)*24*sc,y+Math.sin(a)*24*sc,2.6*sc,0,TAU);c.fill()}
   const gr=c.createRadialGradient(x,y,2,x,y,17*sc);gr.addColorStop(0,'#8e2340');gr.addColorStop(.45,'#d6303a');gr.addColorStop(1,'#ff6b6b');c.fillStyle=gr;c.beginPath();c.arc(x,y,17*sc,0,TAU);c.fill();c.restore()},
  AL={RR:snap?['R','R']:['Iᴬ','Iᴬ'],Rr:snap?['R','r']:['Iᴬ','Iᴮ'],rr:snap?['r','r']:['i','i']},AL2={RR:snap?['R','R']:['Iᴮ','Iᴮ'],Rr:snap?['R','r']:['Iᴬ','Iᴮ'],rr:snap?['r','r']:['i','i']},
  gcol=a=>snap?(a==='R'?'#e03131':'#f1f3f5'):(a==='Iᴬ'?'#ffd43b':a==='Iᴮ'?'#4dabf7':'#adb5bd'),
  gam=(a,x,y)=>{c.save();c.beginPath();c.arc(x,y,14,0,TAU);c.fillStyle=gcol(a);c.fill();c.restore();txt(a,x,y+1,'#10243a',a.length>1?12:15)};
  txt('gametes of parent 1 ('+p.p1+')',GX+CW,GY-48,C.muted,11);txt('parent 2',GX-70,GY+CH-10,C.muted,11);txt('('+p.p2+')',GX-70,GY+CH+6,C.muted,11);
  for(let i=0;i<2;i++){gam(AL[p.p1][i],GX+CW*(i+.5),GY-26);gam(AL2[p.p2][i],GX-28,GY+CH*(i+.5))}
  for(let i=0;i<2;i++)for(let j=0;j<2;j++){const k=kids[i*2+j],x=GX+i*CW,y=GY+j*CH;c.save();c.fillStyle='rgba(33,68,91,.8)';c.strokeStyle='rgba(180,200,215,.5)';c.lineWidth=1.2;c.beginPath();c.rect(x,y,CW,CH);c.fill();c.stroke();c.restore();if(snap)flower(x+CW/2,y+CH-22,k.col,.95);else rbc(x+CW/2,y+CH/2-6,k.ag,.95);txt(k.name,x+CW/2,y+CH-9,C.white,13)}
  /* what the offspring are */
  const cnt={};kids.forEach(k=>{(cnt[k.name]=cnt[k.name]||{n:0,k})[`n`]++});txt('offspring (of 4)',360,GY-12,C.muted,11,'left');
  Object.values(cnt).forEach((e,i)=>{const y=GY+32+i*60;if(snap)flower(380,y+22,e.k.col,.9);else rbc(380,y+8,e.k.ag,.9);txt(e.k.name+':  '+e.n+' / 4',420,y+4,C.white,14,'left')});
  txt(snap?'heterozygote (Rr) is intermediate: pink':'Iᴬ and Iᴮ are both expressed: group AB',360,GY+2*CH+14,C.gold,12,'left')},
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
 draw:(c,p,t)=>{const kids=xkids(p),mx=p.m==='XX'?['X','X']:p.m==='XXc'?['X','Xc']:['Xc','Xc'],fx=p.f==='XY'?'X':'Xc',GX=215,GY=170,CW=92,CH=84,
  txt=(s2,x,y,col,sz,al)=>{c.save();c.font='600 '+sz+'px system-ui,sans-serif';c.fillStyle=col;c.textAlign=al||'center';c.textBaseline='middle';c.fillText(s2,x,y);c.restore()},
  /* chromosomes: X (with the recessive allele marked in red), Y */
  chrom=(x,y,kind,sc)=>{c.save();c.lineCap='round';c.lineWidth=4.2*sc;c.strokeStyle='#b9c6d2';c.beginPath();if(kind==='Y'){c.moveTo(x-5*sc,y-9*sc);c.lineTo(x,y);c.lineTo(x+5*sc,y-9*sc);c.moveTo(x,y);c.lineTo(x,y+10*sc)}else{c.moveTo(x-6*sc,y-10*sc);c.lineTo(x+6*sc,y+10*sc);c.moveTo(x+6*sc,y-10*sc);c.lineTo(x-6*sc,y+10*sc)}c.stroke();if(kind==='Xc'){c.fillStyle='#ff4d4d';c.beginPath();c.arc(x+5*sc,y-8.5*sc,3.4*sc,0,TAU);c.fill()}c.restore()},
  chromLabel=k=>k==='Xc'?'Xᶜ':k,
  /* pedigree symbol: circle = female, square = male; solid red = affected, yellow dot = carrier */
  sym=(x,y,female,state,r)=>{c.save();c.lineWidth=2;c.strokeStyle=state==='affected'?'#ff6b6b':state==='carrier'?'#ffd43b':'#69db7c';c.fillStyle=state==='affected'?'#fa5252':'rgba(16,36,58,.9)';c.beginPath();if(female)c.arc(x,y,r,0,TAU);else c.rect(x-r,y-r,2*r,2*r);c.fill();c.stroke();if(state==='carrier'){c.fillStyle='#ffd43b';c.beginPath();c.arc(x,y,r*.32,0,TAU);c.fill()}c.restore()};
  /* parents */
  txt('mother',62,GY-8,'#f783ac',11);sym(62,GY+22,true,p.m==='XX'?'normal':p.m==='XXc'?'carrier':'affected',17);mx.forEach((k,i)=>chrom(40+i*44,GY+66,k,1));txt(p.m.replace(/Xc/g,'Xᶜ'),62,GY+94,C.muted,11);
  txt('father',62,GY+120,C.blue,11);sym(62,GY+148,false,p.f==='XY'?'normal':'affected',16);chrom(40,GY+190,p.f==='XY'?'X':'Xc',1);chrom(84,GY+190,'Y',1);
  /* Punnett grid: mother's gametes across, father's gametes down */
  txt("mother's gametes",GX+CW,GY-40,C.muted,11);txt("father's",GX-62,GY+CH-12,C.muted,11);txt('gametes',GX-62,GY+CH+4,C.muted,11);
  mx.forEach((k,i)=>{chrom(GX+CW*(i+.5),GY-20,k,1)});chrom(GX-24,GY+CH*.5,fx,1);chrom(GX-24,GY+CH*1.5,'Y',1);
  for(let i=0;i<2;i++)for(let j=0;j<2;j++){const k=kids[i*2+j],x=GX+i*CW,y=GY+j*CH;c.save();c.fillStyle='rgba(33,68,91,.8)';c.strokeStyle='rgba(180,200,215,.5)';c.lineWidth=1.2;c.beginPath();c.rect(x,y,CW,CH);c.fill();c.stroke();c.restore();sym(x+CW/2,y+34,k.sex==='daughter',k.state,19);txt(k.sex+' · '+k.state,x+CW/2,y+CH-12,k.state==='affected'?'#ff8787':k.state==='carrier'?'#ffd43b':'#8ce99a',11)}
  /* key */
  txt('key',470,GY-14,C.muted,11,'left');sym(480,GY+16,true,'normal',11);txt('female',500,GY+16,C.white,12,'left');sym(480,GY+46,false,'normal',10);txt('male',500,GY+46,C.white,12,'left');sym(480,GY+78,true,'carrier',11);txt('carrier (female)',500,GY+78,C.white,12,'left');sym(480,GY+110,true,'affected',11);txt('affected',500,GY+110,C.white,12,'left');
  txt((p.trait==='haem'?'Haemophilia':'Colour blindness')+' · X-linked recessive',470,GY+146,C.gold,12,'left')},
 assumption:'Single X-linked recessive allele, complete penetrance; each of the four combinations is equally likely.'});
function xkids(p){const mx=p.m==='XX'?['X','X']:p.m==='XXc'?['X','Xc']:['Xc','Xc'],fx=p.f==='XY'?'X':'Xc',out=[];for(const m of mx){out.push({sex:'daughter',state:m==='Xc'&&fx==='Xc'?'affected':(m==='Xc'||fx==='Xc')?'carrier':'normal'});out.push({sex:'son',state:m==='Xc'?'affected':'normal'})}return out}
function xcross(p){const k=xkids(p),d=k.filter(x=>x.sex==='daughter'),s2=k.filter(x=>x.sex==='son');return{dA:100*d.filter(x=>x.state==='affected').length/d.length,dC:100*d.filter(x=>x.state==='carrier').length/d.length,sA:100*s2.filter(x=>x.state==='affected').length/s2.length}}

/* ---------- Chapter 5: Molecular Basis of Inheritance ---------- */
// Oriented rectangular slab (6 lit faces) centred at c with unit axes ax/ay/az and half-sizes h. Used for flat base plates.
const slab=(s,c,ax,ay,az,h,col)=>{const A=[V.mul(ax,h[0]),V.mul(ay,h[1]),V.mul(az,h[2])],F=[[0,1],[0,-1],[1,1],[1,-1],[2,1],[2,-1]],O=[[1,2],[2,1],[2,0],[0,2],[0,1],[1,0]];
  F.forEach(([k,sg],i)=>{const [p,q]=O[i],m=V.add(c,V.mul(A[k],sg)),e=A[p],g=A[q],n=V.mul(V.norm(A[k]),sg);s.poly([V.add(V.add(m,e),g),V.add(V.sub(m,e),g),V.sub(V.sub(m,e),g),V.sub(V.add(m,e),g)],col,{normal:n,cull:true,spec:.5,shine:30})})};
// Textbook B-DNA: right-handed, 10 bp per turn, antiparallel sugar-phosphate backbones with phosphate and deoxyribose beads,
// flat base plates stacked like coins (purines longer than pyrimidines), 2 or 3 hydrogen bonds, a narrow minor and a wide major groove.
const dnaModel=(s,seq,phase,turns,R0,x0,x1)=>{const N=Math.round(turns*10),PAIR={A:'T',T:'A',G:'C',C:'G'},GAP=2.62,PUR={A:1,G:1},dx=(x1-x0)/N,
  pt=(i,q,r)=>[x0+i*dx,r*Math.cos(q),r*Math.sin(q)],B1=i=>phase+TAU*i/10,B2=i=>B1(i)+GAP,P1=[],P2=[];
  for(let i=-.5;i<=N+.5;i+=.5){P1.push(pt(i,B1(i),R0));P2.push(pt(i,B2(i),R0))}
  s.tube(P1,.06,'#9fb3c8',{segs:6,spec:.6});s.tube(P2,.06,'#8aa1bb',{segs:6,spec:.6});
  for(let i=0;i<=N;i++){const a=pt(i,B1(i),R0),b=pt(i,B2(i),R0),ax=[1,0,0],d=V.sub(b,a),L=Math.hypot(...d),u=V.mul(d,1/L),w=V.cross(ax,u),b1=seq[i%seq.length],b2=PAIR[b1],f1=PUR[b1]?.56:.44;
    s.ball(a,.1,'#e9eef4',{lift:.1});s.ball(b,.1,'#dfe6ee',{lift:.1});
    const cut=V.add(a,V.mul(u,L*f1)),inA=V.add(a,V.mul(u,.1)),inB=V.sub(b,V.mul(u,.1));
    slab(s,V.mul(V.add(inA,cut),.5),ax,u,w,[.04,(L*f1-.1)/2-.01,PUR[b1]?.085:.065],BC[b1]);
    slab(s,V.mul(V.add(cut,inB),.5),ax,u,w,[.04,(L*(1-f1)-.1)/2-.01,PUR[b2]?.085:.065],BC[b2]);
    const nb=(b1==='G'||b1==='C')?3:2;for(let k=0;k<nb;k++)s.ball(V.add(cut,V.mul(w,(k-(nb-1)/2)*.065)),.022,'#ffffff',{flat:true,lift:.4});
    if(i<N){s.ball(pt(i+.5,B1(i+.5),R0),.075,'#f2b134',{lift:.1});s.ball(pt(i+.5,B2(i+.5),R0),.075,'#f2b134',{lift:.1})}}
  return{pt,B1,B2,GAP}};add({...ch(5,'Molecular Basis of Inheritance',U7),id:'bio-dna-double-helix',title:'DNA double helix',
 description:'Spin a B-DNA double helix, change its length and GC content, and calculate how long the molecule would be.',
 formula:'Rise 0.34 nm per bp ;  10 bp per turn ;  pitch 3.4 nm ;  A = T and G = C (Chargaff)',
 observe:'A human diploid cell has about 6.6 × 10⁹ bp — about 2.2 m of DNA if stretched out.',
 tryText:'Set the length to the human value (log₁₀ bp ≈ 9.8). How long is the DNA?',
 controls:[R('lbp','Length (log₁₀ base pairs)',1,10,.01,9.82,'',2),R('gc','GC content',20,80,1,40,'%')],
 metrics:p=>{const bp=10**p.lbp,L=bp*.34e-9;return[N('Base pairs',bp,'',2),N('Length',L>=1?L:L*1e9,L>=1?'m':'nm',2),N('Turns of helix',bp/10,'',2),N('A = T, G = C',`A ${f((100-p.gc)/2,0)}%, T ${f((100-p.gc)/2,0)}%, G ${f(p.gc/2,0)}%, C ${f(p.gc/2,0)}%`)]},
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:62}),r=rng(Math.round(p.gc));let seq='';for(let i=0;i<40;i++){const x=r()*100;seq+=x<p.gc/2?'G':x<p.gc?'C':x<p.gc+(100-p.gc)/2?'A':'T'}const D=dnaModel(s,seq,t*.8,3,.6,-3,3),at=(i,q)=>D.pt(i,q,.6);
  s.callout(at(11.5,D.B1(11.5)),'sugar–phosphate backbone','#dfe7ee',-30,-70);s.callout(at(7,D.B1(7)+D.GAP/2),'minor groove (narrow)','#a5d8ff',-20,-70);s.callout(at(18,D.B1(18)+D.GAP/2+PI),'major groove (wide)','#ffd8a8',40,70);
  s.callout(at(15,D.B1(15)+D.GAP*.5),'base pair (H-bonds): A=T 2, G≡C 3','#e9f6ff',40,-90);s.callout([2,-.7,0],'one turn = 10 bp = 3.4 nm; width 2 nm','#ffd43b',30,60);s.label(at(-.5,D.B1(-.5)),'5′','#ff8787',12);s.label(at(30.5,D.B2(30.5)),'5′','#ff8787',12);s.label(at(-.5,D.B2(-.5)),'3′','#74c0fc',12);s.label(at(30.5,D.B1(30.5)),'3′','#74c0fc',12);s.render();tag(c,'red A · yellow T · teal G · blue C',44,98,C.muted,13)},
 assumption:'B-form DNA dimensions from NCERT Chapter 5; three turns shown.'});

// Meselson-Stahl: a CsCl density-gradient tube (denser DNA settles lower) beside the DNA molecules of that generation, drawn as double helices with old (15N) and new (14N) strands.
const MSH='#5c7cfa',MSL='#e599f7';
const msDraw=(c,p,t)=>{const g=p.gen,heavy=g===0?1:0,hyb=g===0?0:1/2**(g-1),light=1-heavy-hyb,s=P3.scene(c,{scale:57,cx:335,cy:290}),TX=-2.5,n=Math.min(8,2**g);
  // glass tube with a density gradient (light at the top, dense at the bottom)
  s.lathe([TX,0,0],[[0,-1.66],[.22,-1.62],[.38,-1.45],[.45,-1.15],[.45,2.4],[.49,2.44]],'#cfe8ff',{alpha:.16,segs:22,spec:.5});
  for(let i=0;i<10;i++){const k=i/9,y=-1.52+i*.39,r=i===0?.3:i===1?.4:.42;s.cyl([TX,y,0],[0,1,0],r,.4,k<.5?(k<.25?'#4a6fd0':'#5d83da'):(k<.75?'#7ea0e6':'#a9c6f2'),{alpha:.3,seg:18,caps:false})}
  s.ring([TX,2.2,0],[0,1,0],.42,'#e9f6ff',1.2,[],30);
  const band=(y,w,col,nm)=>{if(w>0){s.cyl([TX,y,0],[0,1,0],.4,.06+.12*w,col,{alpha:.92,seg:20});s.label([TX+.85,y,0],nm,col,12,'left')}};
  band(-1.0,heavy,'#5c7cfa','heavy');band(-.3,hyb,'#9775fa','hybrid');band(.4,light,'#f783ac','light');
  s.arrow([TX-.8,1.9,0],[TX-.8,-1.2,0],'#9fb6c4',2);s.label([TX-.8,2.15,0],'denser','#9fb6c4',11);s.label([TX+.7,1.7,0],'CsCl gradient','#9fb6c4',11,'left');
  // the DNA of this generation: each molecule is a double helix; old strands (15N) blue, new strands (14N) pink
  const rows=n>4?2:1,h=n>4?1.65:2.4,m=Math.min(n,4),cxm=1.25;
  for(let i=0;i<n;i++){const col=i%4,row=Math.floor(i/4),x=cxm+(col-(m-1)/2)*.95,y1=rows===2?2.05-row*2.1:1.9,old=i<2,hv=g===0,c1=hv||(old&&i%2===0)?MSH:MSL,c2=hv||(old&&i%2===1)?MSH:MSL,ph=t*.6+i*.7,A=[],B=[];
   for(let j=0;j<=18;j++){const u=j/18,a=TAU*1.6*u+ph;A.push([x+.2*Math.cos(a),y1-h*u,.2*Math.sin(a)]);B.push([x+.2*Math.cos(a+PI),y1-h*u,.2*Math.sin(a+PI)])}
   s.tube(A,.05,c1,{segs:6,spec:.6});s.tube(B,.05,c2,{segs:6,spec:.6});for(let j=1;j<18;j+=2)s.seg(A[j],B[j],'#8fa1b3',1.6)}
  s.label([cxm,2.55,0],g===0?'parental DNA (all ¹⁵N)':`${2**g} DNA molecules${n<2**g?' (8 shown)':''}`,'#e9f6ff',12);
  s.render();tag(c,'blue strands: ¹⁵N (old) · pink: ¹⁴N (new)',44,98,C.muted,13)};
add({...ch(5,'Molecular Basis of Inheritance',U7),id:'bio-meselson-stahl',title:'Semiconservative replication (Meselson–Stahl)',
 description:'Grow E. coli in ¹⁵N, then switch to ¹⁴N. Spin the DNA in a CsCl gradient after each generation.',
 formula:'After generation n (n ≥ 1): hybrid fraction = 1/2ⁿ⁻¹ ;  light fraction = 1 − 1/2ⁿ⁻¹',
 observe:'After one generation all DNA is hybrid (¹⁵N/¹⁴N) — exactly what semiconservative replication predicts.',
 tryText:'After two generations, what fraction of DNA is light?',
 controls:[R('gen','Generations in ¹⁴N',0,5,1,1)],
 metrics:p=>{const g=p.gen,heavy=g===0?100:0,hyb=g===0?0:100/2**(g-1),light=g===0?0:100-hyb;return[N('Heavy (¹⁵N/¹⁵N)',heavy,'%',0),N('Hybrid (¹⁵N/¹⁴N)',hyb,'%',1),N('Light (¹⁴N/¹⁴N)',light,'%',1),N('Generation time of E. coli','≈ 20 min')]},
draw:(c,p,t)=>msDraw(c,p,t/*DBG*/),
 assumption:'Ideal synchronous divisions; band thickness ∝ fraction of DNA.'});

const CODON=(()=>{const b='UCAG',aa='FFLLSSSSYY**CC*WLLLLPPPPHHQQRRRRIIIMTTTTNNKKSSRRVVVVAAAADDEEGGGG',m={};let k=0;for(const x of b)for(const y of b)for(const z of b)m[x+y+z]=aa[k++];return m})();
const AAN={F:'Phe',L:'Leu',S:'Ser',Y:'Tyr',C:'Cys',W:'Trp',P:'Pro',H:'His',Q:'Gln',R:'Arg',I:'Ile',M:'Met',T:'Thr',N:'Asn',K:'Lys',V:'Val',A:'Ala',D:'Asp',E:'Glu',G:'Gly','*':'Stop'};
// Transcription then translation. Phase 1: RNA polymerase opens the DNA and the mRNA grows. Phase 2: a ribosome reads the mRNA codon by codon;
// tRNAs pair anticodon-to-codon and each amino acid joins the growing polypeptide until a stop codon is reached.
const DGX0=-3,DGDX=.3,DGYD=2.15,DGYM=-.55,DGAA=['#ff6b6b','#ffd43b','#69db7c','#4dabf7','#9775fa','#f783ac'],DGPD={A:'T',T:'A',G:'C',C:'G'},DGPR={A:'U',U:'A',G:'C',C:'G'};
const dgTrna=(s,x,y0,aaCol,anti,name)=>{s.tube([[x-.32,y0+.02,.1],[x-.28,y0+.2,.1],[x,y0+.3,.1],[x+.28,y0+.2,.1],[x+.32,y0+.02,.1]],.045,'#74c0fc',{segs:6});s.tube([[x,y0+.3,.1],[x,y0+.82,.1]],.05,'#74c0fc',{segs:6});s.tube([[x-.22,y0+.92,.1],[x,y0+.86,.1],[x+.22,y0+.92,.1]],.045,'#74c0fc',{segs:6});
  anti.forEach((b,i)=>s.ball([x+(i-1)*DGDX,y0,.1],.1,BC[b],{lift:.2}));if(aaCol)s.ball([x,y0+1.07,.1],.13,aaCol,{lift:.3});if(name)s.label([x,y0+1.36,.1],name,aaCol,11)};
const dgBez=(a,b,c,n)=>Array.from({length:n+1},(_,i)=>{const u=i/n;return[0,1,2].map(d=>(1-u)*(1-u)*a[d]+2*u*(1-u)*b[d]+u*u*c[d])});
const dogDraw=(c,p,t)=>{const r=dogma(p),s=P3.scene(c,{scale:54,cx:355,cy:300}),m=r.mrna.replace(/ /g,''),d=r.dna.replace(/ /g,''),cod=r.mrna.split(' '),aaN=cod.map(x=>AAN[CODON[x]]),stopIdx=aaN.indexOf('Stop')<0?6:aaN.indexOf('Stop'),
  q=cycle(t*.15,1),cl=(a,b,v)=>Math.max(a,Math.min(b,v)),sm=x=>x*x*(3-2*x),X=j=>DGX0+DGDX*j,yD=DGYD,yM=DGYM,qa=cl(0,1,q/.35),nTx=q<.35?qa*18:18,k=Math.floor(nTx),tx=q<.35,xp=X(nTx-.5),th=t*.45;
  const bub=x=>tx?sm(cl(0,1,(.75-Math.abs(x-xp))/.4)):0,pos2=(x,sd)=>{const e=bub(x),a=TAU*(x-X(0))/3+th+(sd?2.62:0),R0=.28,hy=yD+R0*Math.cos(a),hz=R0*Math.sin(a);return[x,hy+(yD+(sd?-.5:.5)-hy)*e,hz*(1-e)]};
  // DNA: two backbones (the helix opens inside the polymerase), base pairs as coloured half-rungs
  const S1=[],S2=[];for(let x=X(0)-.2;x<=X(17)+.2;x+=.1){S1.push(pos2(x,0));S2.push(pos2(x,1))}
  s.tube(S1,.05,'#9fb3c8',{segs:6,spec:.6});s.tube(S2,.05,'#8aa1bb',{segs:6,spec:.6});
  for(let j=0;j<18;j++){const x=X(j),e=bub(x),a=pos2(x,0),b=pos2(x,1),mid=V.mul(V.add(a,b),.5);
    if(e<.6){s.seg(a,mid,BC[d[j]],4);s.seg(mid,b,BC[DGPD[d[j]]],4)}else{s.ball(V.add(b,[0,.16,0]),.085,BC[DGPD[d[j]]],{lift:.2});s.ball(V.sub(a,[0,.16,0]),.085,BC[d[j]],{lift:.2})}}
  if(p.pos>0)s.ring([X(p.pos-1),yD,0],[0,0,1],.34,'#ff6b6b',2.5,[],24);
  // RNA polymerase and the nascent mRNA leaving it
  if(tx){s.mesh([xp,yD,-.05],[.85,.78,.62],'#ffa94d',{alpha:.38,rings:10,segs:16});s.mesh([xp+.25,yD+.5,0],[.42,.3,.4],'#ff922b',{alpha:.4,rings:6,segs:10});
   if(k>=1){const e1=[X(k-1)+.08,yM+.2,.05];s.tube([[xp-.45,yD-.2,.12],[xp,yD-.22,.12],...dgBez([xp,yD-.22,.12],[xp-.05,yD-1.3,.1],e1,10)],.045,'#d0b4ff',{segs:6})}
   s.callout([xp+.3,yD+.75,0],'RNA polymerase (transcription)','#ffa94d',50,-35)}
  s.callout([X(15),yD+.3,0],'DNA double helix','#dfe7ee',30,-42);
  // mRNA: backbone below, bases pointing up (the face the ribosome and tRNAs read)
  if(k>=2)s.tube([[X(0)-.15,yM,0],[X(k-1)+.15,yM,0]],.05,'#d0b4ff',{segs:6});
  for(let j=0;j<k;j++){const x=X(j);s.ball([x,yM,0],.07,'#b79df0',{lift:.1});s.seg([x,yM,0],[x,yM+.2,0],'#b79df0',2);s.ball([x,yM+.28,0],.125,BC[m[j]],{flat:true,lift:.2});s.label([x,yM+.28,.2],m[j],'#ffffff',11)}
  if(k>=1){s.label([X(0)-.35,yM,0],'5′','#ff8787',12);if(!tx)s.label([X(17)+.35,yM,0],'3′','#74c0fc',12)}
  if(p.pos>0&&p.pos-1<k)s.ring([X(p.pos-1),yM+.28,.12],[0,0,1],.2,'#ff6b6b',2.5,[],24);
  // codon brackets and amino-acid names
  let nb=0,rel=0;
  // ribosome: it moves along the mRNA while the tRNAs stay paired with their codons
  if(!tx){const tr=cl(0,1,(q-.35)/.65),stp=Math.max(stopIdx,1),sv=tr*stp,idx=Math.min(Math.floor(sv),stp-1),fr=Math.min(1,sv-idx),last=idx===stp-1,mv=last?0:sm(cl(0,1,(fr-.55)/.45)),bnd=sm(cl(0,1,(fr-.3)/.2)),ent=sm(cl(0,1,fr/.4)),ex=sm(cl(0,1,(fr-.5)/.3)),xr0=X(3*idx+1)+.45,xr=xr0+.9*mv,y0=yM+.54;
   rel=last&&stopIdx>0?sm(cl(0,1,(fr-.6)/.4)):0;nb=stopIdx===0?0:Math.min(stopIdx,idx+1+(!last&&fr>.4?1:0));
   s.lathe([xr+.3*rel,-.15+.35*rel,-.05],[[0,0],[1.4,0],[1.38,.2],[1.22,.8],[.85,1.25],[.4,1.46],[0,1.5]],'#6c8cff',{alpha:.42-.22*rel,segs:20});s.lathe([xr-.3*rel,-.62-.3*rel,-.05],[[0,0],[1.1,0],[1.05,-.12],[.8,-.28],[.4,-.35],[0,-.37]],'#a98bff',{alpha:.5-.26*rel,segs:18});
   if(stopIdx>0){if(ex<1)dgTrna(s,xr0-.45-.5*ex,y0+.6*ex,fr<.4?DGAA[idx%6]:null,[...cod[idx]].map(z=>DGPR[z]),null);
    if(!last){const aI=idx+1;dgTrna(s,xr0+.45+(1-ent)*.9,y0+(1-ent)*.7,DGAA[aI%6],[...cod[aI]].map(z=>DGPR[z]),AAN[CODON[cod[aI]]])}
    else if(fr>.1)dgBox(s,xr0+.45,y0,'stop codon: release factor')}
   else dgBox(s,xr0-.45,y0,'stop codon: release factor');
   // growing polypeptide: the newest amino acid sits on the tRNA that carries it
   const ax=xr0-.45+.9*bnd*(last?0:1);
   for(let j=0;j<nb;j++){const i=nb-1-j;s.ball([ax+.26*j+.4*rel*(j+1)/(nb+1),1.06+.07*j+.04*Math.sin(j*1.4)+.4*rel,.1],.115,DGAA[i%6],{lift:.3})}
   if(nb>0)s.callout([ax+.2*(nb-1),1.1+.07*(nb-1)+.4*rel,.1],rel>.5?'polypeptide released':'polypeptide chain','#ff8787',-95,-25);
   s.callout([xr-1.0,.5,-.05],'ribosome (translation)','#8fa8ff',-70,-40);if(stopIdx>0&&!last)s.callout([xr0+.45,y0+.7,.1],'tRNA: anticodon pairs with codon','#74c0fc',110,25)}
  for(let i=0;i<6;i++){const x0=X(3*i)-.12,x1=X(3*i+2)+.12;if(i*3+2<k||(!tx)){s.seg([x0,yM-.42,0],[x1,yM-.42,0],'#868e96',1.5);if(i<nb||(!tx&&i===stopIdx&&(aaN[i]==='Stop')&&rel>.5))s.label([X(3*i+1),yM-.68,0],aaN[i],i<stopIdx?DGAA[i%6]:'#ff8787',12)}}
  if(!tx&&p.pos>0&&p.pos-1<18)s.label([X(p.pos-1),yM-1.2,0],'mutated base','#ff6b6b',11);
  s.render();tag(c,'bases: A red · T yellow · G teal · C blue · U purple (RNA)',44,98,C.muted,13)};
const dgBox=(s,x,y,txt)=>{s.mesh([x,y+.35,.1],[.55,.3,.3],'#3bc9db',{alpha:.7,rings:6,segs:10});s.label([x,y+.8,.1],txt,'#66d9e8',11)};
add({...ch(5,'Molecular Basis of Inheritance',U7),id:'bio-central-dogma',title:'Transcription and translation',
 description:'Transcribe a short gene into mRNA and translate it codon by codon. Then make a point mutation and see its effect.',
 formula:'DNA → mRNA (transcription) → protein (translation) ;  AUG = start (Met)',
 observe:'A single base change can be silent, change one amino acid (missense) or create a stop codon (nonsense).',
 tryText:'Change codon 3 (AAA) to a stop codon by mutating one base.',
 controls:[R('pos','Mutation position (0 = none)',0,18,1,0),S('base','New base','A',['A','T','G','C'].map(x=>[x,x]))],
 metrics:p=>{const r=dogma(p);return[N('Coding DNA',r.dna),N('mRNA',r.mrna),N('Protein',r.prot),N('Mutation effect',r.effect)]},
draw:(c,p,t)=>dogDraw(c,p,t/*DBG*/),
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
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:50,cx:335,cy:262,pitch:.03}),on=p.lac==='yes',genes=[['i',-3,'#ced4da',.6],['p',-1.85,'#ffd43b',.6],['o',-1.2,'#ff8787',.6],['z',.2,'#4dabf7',1.2],['y',1.4,'#69db7c',1.2],['a',2.6,'#b197fc',1.2]];
  /* DNA: gene blocks, double strand with rungs */
  for(const [n,x,col,w] of genes){s.poly([[x-w/2,-.34,-.1],[x+w/2,-.34,-.1],[x+w/2,.34,-.1],[x-w/2,.34,-.1]],col,{cull:false,alpha:.85,z:-1e5});s.label([x,-.62,0],n,col,14)}
  const xs=Array.from({length:44},(_,i)=>-3.4+i*.158);s.tube(xs.map((x,i)=>[x,.2+.03*Math.sin(i*.9),0]),.035,'#cfd8e0',{segs:5});s.tube(xs.map((x,i)=>[x,-.2-.03*Math.sin(i*.9),0]),.035,'#9aa8b5',{segs:5});for(let i=0;i<xs.length;i+=1)s.seg([xs[i],.17,0],[xs[i],-.17,0],i%2?'#ff8787':'#4dabf7',1.6);
  /* repressor: bound to the operator without lactose, floating free with lactose attached when lactose is present */
  const rep=on?[-.3,1.25+.12*Math.sin(t*1.5),.1]:[-1.2,.55,.1];s.mesh(rep,[.42,.3,.28],'#e8590c',{rings:10,segs:16,spec:.5,lift:2});s.mesh([rep[0]-.1,rep[1]+.05,rep[2]+.1],[.2,.14,.15],'#ff922b',{rings:6,segs:10,lift:3});
  if(!on){for(const dx of[-.15,.15])s.tube([[rep[0]+dx,rep[1]-.2,.1],[rep[0]+dx,.28,.05]],.045,'#e8590c',{segs:6});s.label([.9,.95,0],'repressor binds operator',C.gold,11)}
  else{for(let i=0;i<2;i++){const q=[rep[0]+.3+i*.12,rep[1]+.1-i*.2,.2];s.ball(q,.07,'#ffe066',{glow:true,lift:4});s.ball([q[0]+.1,q[1]+.05,.2],.06,'#ffd43b',{flat:true,lift:4})}s.label([rep[0],rep[1]+.5,0],'repressor + lactose (inactive)',C.gold,11);
   for(let i=0;i<6;i++){const q=[-3.2+hash(i)*3.2+.3*Math.sin(t+i),1.5+hash(i+3)*.7,(hash(i+6)-.5)*.4];s.ball(q,.07,'#ffe066',{flat:true,glow:true});s.ball([q[0]+.1,q[1]+.04,q[2]],.055,'#ffd43b',{flat:true})}}
  /* RNA polymerase: blocked at the promoter, or moving through z, y, a leaving one mRNA */
  if(on){const px=-1.85+cycle(t*.3,1)*5,mr=Array.from({length:Math.max(2,Math.floor((px+1.85)/.2)+2)},(_,i)=>[-1.85+i*.2,.42+.07*Math.sin(i*1.2+t*3),.15]);s.mesh([px,.36,.05],[.42,.3,.3],'#20c997',{alpha:.85,rings:8,segs:12,spec:.4,lift:2});s.path(mr,'#ffa94d',2.5,[],1e5);s.label([px,.85,0],'RNA polymerase',C.mint,11);
   s.label([.2,-1.05,0],'β-galactosidase',C.blue,10);s.label([1.4,-1.05,0],'permease','#69db7c',10);s.label([2.6,-1.05,0],'transacetylase','#b197fc',10);for(const [x,col] of[[.2,'#4dabf7'],[1.4,'#69db7c'],[2.6,'#b197fc']])s.mesh([x,-1.3+.04*Math.sin(t*2+x),.1],[.28,.2,.2],col,{rings:8,segs:12,spec:.4})}
  else{s.mesh([-1.85,.4,.05],[.42,.3,.3],'#20c997',{alpha:.5,rings:8,segs:12});s.label([-2.7,1.0,0],'RNA polymerase blocked',C.red,11)}
  s.render();tag(c,'i regulator gene · p promoter · o operator · z, y, a structural genes',44,114,C.muted,11);tag(c,on?'yellow: lactose (inducer) · genes z, y, a transcribed':'No lactose: repressor sits on the operator, genes OFF',44,98,on?C.gold:C.red,13)},
 assumption:'Negative regulation as described in NCERT; catabolite (glucose) control not included.'});

add({...ch(5,'Molecular Basis of Inheritance',U7),id:'bio-dna-fingerprinting',title:'DNA fingerprinting with VNTRs',
 description:'Compare VNTR band patterns of a child with a mother and alleged fathers, or a crime-scene sample with suspects.',
 formula:'Every band in a child comes from either the mother or the father',
 observe:'VNTR band patterns differ between individuals (except identical twins), so they identify people.',
 tryText:'Which alleged father shares all the non-maternal bands with the child?',
 controls:[S('case','Case','pat',[['pat','Paternity test'],['for','Forensic match']])],
 metrics:p=>p.case==='pat'?[N('Mother','Explains half the child’s bands'),N('Alleged father 1','Does not explain the rest'),N('Alleged father 2','Matches all remaining bands'),N('Conclusion','Father 2 is the biological father')]:[N('Crime scene sample','Reference'),N('Suspect 1','Different pattern'),N('Suspect 2','Identical pattern — match'),N('Technique','Restriction digest → electrophoresis → blotting → probe')],
 draw:(c,p,t)=>{const pat=p.case==='pat',lanes=pat?[['Mother',[1,4,7]],['Child',[1,5,7,9]],['Father 1',[2,6,8]],['Father 2',[5,9,3]]]:[['Crime scene',[2,5,6,9]],['Suspect 1',[1,4,6,8]],['Suspect 2',[2,5,6,9]],['Suspect 3',[3,4,7,9]]],GX=88,GY=140,GW=336,GH=212,LW=80,k=Math.min(1,cycle(t,8)/4),k2=1-(1-k)*(1-k),
  txt=(s2,x,y,col,sz,al)=>{c.save();c.font='600 '+sz+'px system-ui,sans-serif';c.fillStyle=col;c.textAlign=al||'center';c.textBaseline='middle';c.fillText(s2,x,y);c.restore()},
  col=(li,b)=>{if(pat){const m=lanes[0][1],f=lanes[3][1];if(li===1)return m.includes(b)?'#4dabf7':f.includes(b)?'#ffd43b':'#9775fa';if(li===0)return m.some(x=>lanes[1][1].includes(x)&&x===b)?'#4dabf7':'#9775fa';if(li===3)return lanes[1][1].includes(b)?'#ffd43b':'#9775fa';return '#7a6cc0'}const s0=lanes[0][1];return s0.includes(b)?'#51cf66':'#9775fa'},
  by=b=>GY+26+b*(GH-48)/10*k2;
  /* gel slab with wells */
  c.save();const g=c.createLinearGradient(0,GY,0,GY+GH);g.addColorStop(0,'rgba(120,190,210,.35)');g.addColorStop(1,'rgba(70,140,170,.25)');c.fillStyle=g;c.strokeStyle='rgba(180,220,235,.55)';c.lineWidth=1.5;c.beginPath();c.roundRect?c.roundRect(GX,GY,GW,GH,10):c.rect(GX,GY,GW,GH);c.fill();c.stroke();c.restore();
  lanes.forEach(([n,bands],li)=>{const x=GX+14+li*LW;c.save();c.fillStyle='#0b1622';c.fillRect(x,GY+10,60,9);c.restore();txt(n,x+30,GY-10,C.white,12);
   bands.forEach(b=>{const y=by(b),cc=col(li,b);c.save();c.shadowColor=cc;c.shadowBlur=9;c.fillStyle=cc;c.beginPath();c.roundRect?c.roundRect(x+3,y-3.5,54,7,3):c.rect(x+3,y-3.5,54,7);c.fill();c.restore()})});
  if(k>.95)lanes[1][1].forEach(b=>{c.save();c.strokeStyle='rgba(255,255,255,.18)';c.setLineDash([3,4]);c.beginPath();c.moveTo(GX+8,by(b));c.lineTo(GX+GW-8,by(b));c.stroke();c.restore()});
  txt('− wells',GX-4,GY+14,C.muted,11,'right');txt('+ anode',GX-4,GY+GH-12,C.red,11,'right');c.save();c.strokeStyle='#ff8787';c.lineWidth=2;c.beginPath();c.moveTo(GX-20,GY+34);c.lineTo(GX-20,GY+GH-34);c.stroke();c.beginPath();c.moveTo(GX-26,GY+GH-42);c.lineTo(GX-20,GY+GH-32);c.lineTo(GX-14,GY+GH-42);c.stroke();c.restore();
  /* key */
  txt(pat?'each child band comes':'a match needs every band',446,GY+4,C.muted,11,'left');txt(pat?'from one parent':'to line up',446,GY+19,C.muted,11,'left');
  [pat?['#4dabf7','from the mother']:['#51cf66','matches the scene'],pat?['#ffd43b','from Father 2']:['#9775fa','no match'],pat?['#9775fa','other bands']:null].filter(Boolean).forEach((e,i)=>{c.save();c.fillStyle=e[0];c.shadowColor=e[0];c.shadowBlur=6;c.fillRect(446,GY+54+i*30-3,26,7);c.restore();txt(e[1],480,GY+54+i*30,C.white,12,'left')})},
 assumption:'Band positions are illustrative; real profiles use several VNTR probes.'});

/* ---------- Chapter 6: Evolution ---------- */
add({...ch(6,'Evolution',U7),id:'bio-hardy-weinberg',title:'Hardy–Weinberg equilibrium and selection',
 description:'Start with allele frequencies p and q. Without disturbance they stay constant; add selection against aa and watch q fall.',
 formula:'p² + 2pq + q² = 1 ;  with selection against aa: q′ = q(1 − sq)/(1 − sq²)',
 observe:'Allele frequencies change only when a disturbing factor (selection, drift, gene flow, mutation) acts.',
 tryText:'Set s = 0. Do the frequencies change over generations?',
 controls:[R('p0','Initial frequency p (allele A)',.05,.95,.01,.5,'',2),R('s','Selection against aa (s)',0,1,.05,.3,'',2),R('gen','Generations',0,100,1,20)],
 metrics:p=>{const q=hwq(p,p.gen),pp=1-q;return[N('p (A)',pp,'',3),N('q (a)',q,'',3),N('AA : Aa : aa',`${f(pp*pp,2)} : ${f(2*pp*q,2)} : ${f(q*q,2)}`),N('In equilibrium?',p.s===0?'Yes — no change':'No — selection acting')]},
 draw:(c,p,t)=>{const q=hwq(p,p.gen),pp=1-q,fa=pp*pp,fh=2*pp*q,fr=q*q,n=100,
  txt=(s2,x,y,col,sz,al)=>{c.save();c.font='600 '+sz+'px system-ui,sans-serif';c.fillStyle=col;c.textAlign=al||'center';c.textBaseline='middle';c.fillText(s2,x,y);c.restore()},
  gc=['#4dabf7','#9775fa','#ff6b6b'],
  /* 100 individuals: each circle is one organism coloured by genotype */
  org=(x,y,col)=>{const gr=c.createRadialGradient(x-3,y-3,1,x,y,9);gr.addColorStop(0,'#fff8');gr.addColorStop(.25,col);gr.addColorStop(1,col);c.save();c.fillStyle=col;c.beginPath();c.arc(x,y,8.2,0,TAU);c.fill();c.fillStyle='rgba(255,255,255,.28)';c.beginPath();c.arc(x-2.5,y-2.8,3,0,TAU);c.fill();c.restore()};
  for(let i=0;i<n;i++){const f2=(i+.5)/n;org(50+(i%10)*19,138+Math.floor(i/10)*19.5,f2<fa?gc[0]:f2<fa+fh?gc[1]:gc[2])}
  txt('population of 100 individuals',58,118,C.muted,11,'left');
  const bar=(x,y,w,parts,label)=>{txt(label,x,y-12,C.muted,11,'left');let cx=x;for(const [v,col,tx] of parts){const ww=w*v;c.save();c.fillStyle=col;c.fillRect(cx,y,ww,18);c.restore();if(ww>34)txt(tx,cx+ww/2,y+9,'#10243a',11);cx+=ww}c.save();c.strokeStyle='rgba(180,200,215,.5)';c.strokeRect(x,y,w,18);c.restore()};
  bar(258,156,150,[[pp,gc[0],'A '+f(pp,2)],[q,gc[2],'a '+f(q,2)]],'allele frequencies  p + q = 1');
  bar(258,214,150,[[fa,gc[0],'AA'],[fh,gc[1],'Aa'],[fr,gc[2],'aa']],'genotypes  p² + 2pq + q² = 1');
  txt('AA '+f(fa,2)+'   Aa '+f(fh,2)+'   aa '+f(fr,2),258,246,C.white,12,'left');
  txt(p.s===0?'no selection: frequencies stay constant':'selection against aa: q falls',258,276,p.s===0?C.mint:C.red,12,'left');
  chart(c,420,96,236,170,{title:'Allele frequency q over time',xl:'generations',xmin:0,xmax:100,ymin:0,ymax:1,series:[{pts:Array.from({length:101},(_,g)=>[g,hwq(p,g)]),col:C.red},{pts:Array.from({length:101},(_,g)=>[g,1-hwq(p,g)]),col:C.blue}],marker:[p.gen,q]});tag(c,'blue AA · purple Aa · red aa',44,98,C.muted,12)},
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
 draw:(c,p,t)=>{const d=selDist(p),PX=46,PY=118,PW=350,PH=214,cols=8,
  mix=(v)=>{const k=clamp(v,0,1),a=Math.round(232-196*k),b=Math.round(226-196*k),e=Math.round(214-190*k);return'rgb('+a+','+b+','+e+')'},
  /* bark panel with vertical grain and lichen patches */
  bark=()=>{c.save();const g=c.createLinearGradient(PX,0,PX+PW,0);g.addColorStop(0,'#aaa291');g.addColorStop(.5,'#b9b19f');g.addColorStop(1,'#a49b8a');c.fillStyle=g;c.beginPath();c.roundRect?c.roundRect(PX,PY,PW,PH,10):c.rect(PX,PY,PW,PH);c.fill();c.clip();c.strokeStyle='rgba(50,44,36,.35)';c.lineWidth=1.4;for(let i=0;i<22;i++){const x=PX+i*PW/22+hash(i)*10;c.beginPath();c.moveTo(x,PY);for(let y=PY;y<PY+PH;y+=26)c.lineTo(x+(hash(i*7+y)-.5)*7,y+26);c.stroke()}c.fillStyle='rgba(190,205,160,.35)';for(let i=0;i<9;i++){c.beginPath();c.ellipse(PX+hash(i+40)*PW,PY+hash(i+50)*PH,10+hash(i)*16,6+hash(i+9)*9,hash(i)*3,0,TAU);c.fill()}c.restore()},
  moth=(x,y,v,r,i)=>{c.save();c.translate(x,y);c.rotate(r);const wc=mix(v),dark=v>.5;c.fillStyle=wc;c.strokeStyle='rgba(0,0,0,.4)';c.lineWidth=.8;for(const sg of[-1,1]){c.beginPath();c.moveTo(0,-3);c.bezierCurveTo(sg*8,-14,sg*21,-9,sg*19,2);c.bezierCurveTo(sg*16,9,sg*6,9,0,6);c.closePath();c.fill();c.stroke();c.fillStyle=dark?'rgba(255,255,255,.35)':'rgba(40,36,32,.55)';for(let m=0;m<7;m++){c.beginPath();c.arc(sg*(4+hash(i*13+m)*14),-6+hash(i*7+m+3)*13,.9+hash(m+i)*.8,0,TAU);c.fill()}c.fillStyle=wc}
   c.fillStyle='#3a2f28';c.beginPath();c.ellipse(0,1.5,2.6,8,0,0,TAU);c.fill();c.beginPath();c.arc(0,-8,2.4,0,TAU);c.fill();c.strokeStyle='#3a2f28';c.lineWidth=.8;c.beginPath();c.moveTo(-1,-9.5);c.lineTo(-5,-15);c.moveTo(1,-9.5);c.lineTo(5,-15);c.stroke();c.restore()};
  bark();for(let i=0;i<40;i++)moth(PX+30+(i%cols)*(PW-52)/(cols-1)+(hash(i)-.5)*8,PY+28+Math.floor(i/cols)*(PH-56)/4+(hash(i+5)-.5)*8,d.sample[i],(hash(i+11)-.5)*1.6,i);
  tag(c,'40 moths sampled from the population · lighter ↔ darker wings',PX,PY-12,C.muted,11);
  chart(c,420,96,236,170,{title:'Trait distribution',xl:'wing darkness →',xmin:0,xmax:1,ymin:0,series:[{fn:x=>selDist({...p,gen:0}).pdf(x),col:'#8ca6b9',dash:[4,4]},{fn:d.pdf,col:C.gold}]})},
 assumption:'Trait modelled as a normal distribution re-weighted each generation by a fitness function; moth colour = trait value.'});
function selDist(p){let m=.35,sd=.15,m2=null;for(let g=0;g<p.gen;g++){if(p.type==='dir')m=Math.min(.85,m+.02);else if(p.type==='stab')sd=Math.max(.05,sd*.96);}if(p.type==='dis'){const k=Math.min(1,p.gen/20);m2=[.35-.2*k,.35+.25*k];sd=.15-.06*k}
  const nz=1/(sd*Math.sqrt(TAU)),pdf=x=>nz*(m2?.5*(Math.exp(-(((x-m2[0])/sd)**2)/2)+Math.exp(-(((x-m2[1])/sd)**2)/2)):Math.exp(-(((x-m)/sd)**2)/2));const r=rng(7),sample=Array.from({length:40},()=>{const u=Math.sqrt(-2*Math.log(r()+1e-9))*Math.cos(TAU*r()),c0=m2?m2[r()<.5?0:1]:m;return clamp(c0+u*sd,0,1)});/* mixture mean and s.d. (variance = within-peak variance + between-peak variance) */return{pdf,mean:m2?(m2[0]+m2[1])/2:m,sd:m2?Math.sqrt(sd*sd+((m2[1]-m2[0])/2)**2):sd,sample}}

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
