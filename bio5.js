/* Biology pack 5 — NCERT Class 12, chapters 7–13 (19 experiments).
   Facts follow the rationalised NCERT text; growth and decay curves are standard teaching models. */
(() => {
'use strict';
const {R,S,N,f,clamp,rad,deg,cycle,memo,tag,chart,pack,PI,TAU,C}=window.PhysicaLab;
const P3=window.Physica3D,V=P3.vec,{BC,hash,critter,leaf,petal,cell,capsule,helix}=window.PhysicaBio,{add,done}=pack();
const U8='BIOLOGY AND HUMAN WELFARE',U9='BIOTECHNOLOGY',U10='ECOLOGY';
const ch=(no,chapter,group)=>({grade:12,chapterNo:no,chapter,group});
const along=(path,q)=>{const i=Math.min(path.length-2,Math.floor(q*(path.length-1))),fr=q*(path.length-1)-i;return V.add(path[i],V.mul(V.sub(path[i+1],path[i]),fr))};
function antibody(s,p,k,col='#74c0fc',rot=0){const A=(x,y)=>V.add(p,[(x*Math.cos(rot)-y*Math.sin(rot))*k,(x*Math.sin(rot)+y*Math.cos(rot))*k,0]);s.tube([A(0,-.6),A(0,0)],.06*k,col,{segs:6});for(const sg of[-1,1]){s.tube([A(0,0),A(sg*.45,.5)],.06*k,col,{segs:6});s.tube([A(sg*.12,.05),A(sg*.55,.45)],.04*k,'#ffd43b',{segs:6})}}

/* ---------- Chapter 7: Human Health and Disease ---------- */
add({...ch(7,'Human Health and Disease',U8),id:'bio-immune-response',title:'Primary and secondary immune response',
 description:'Meet an antigen once, then again later. Memory cells make the second (secondary) response faster and much stronger.',
 formula:'Secondary (anamnestic) response: shorter lag, higher and longer antibody level',
 observe:'This immunological memory is the basis of vaccination.',
 tryText:'Move the second exposure earlier or later. Does the secondary response still appear?',
 controls:[R('second','Second exposure on day',20,80,1,40,'day'),R('day','Day now',0,120,1,55,'day')],
 metrics:p=>{const a=abLevel(p,p.day);return[N('Antibody level (relative)',a,'',1),N('Primary peak (≈ day 12)',abLevel(p,12),'',1),N('Secondary peak',abLevel(p,p.second+6),'',1),N('Memory','B and T memory cells formed in primary response')]},
 draw:(c,p,t)=>{const a=abLevel(p,p.day),s=P3.scene(c,{scale:56,cx:220});for(let i=0;i<8;i++){const q=[(hash(i)-.5)*3,(hash(i+3)-.5)*2.4,(hash(i+6)-.5)*1.5];s.ball(q,.22,'#e64980');for(let k=0;k<8;k++){const u=hash(i*8+k)*2-1,ph=TAU*hash(i*8+k+1),r=Math.sqrt(1-u*u);s.ball(V.add(q,[.26*r*Math.cos(ph),.26*u,.26*r*Math.sin(ph)]),.05,'#ffa8a8',{flat:true})}}
  for(let i=0;i<Math.min(24,Math.round(a*2));i++){const q=[(hash(i+40)-.5)*3.4,(hash(i+50)-.5)*2.6+.1*Math.sin(t*2+i),(hash(i+60)-.5)*1.6];antibody(s,q,.5,'#74c0fc',hash(i)*TAU)}s.callout([(hash(0)-.5)*3,(hash(3)-.5)*2.4+.22,(hash(6)-.5)*1.5],'antigen (pathogen surface)','#ff8fab',-50,-50);if(a>.5)s.callout([(hash(40)-.5)*3.4,(hash(50)-.5)*2.6+.1*Math.sin(t*2),(hash(60)-.5)*1.6],'antibodies (IgG) from plasma B cells','#74c0fc',50,50);s.render();
  chart(c,420,96,236,170,{title:'Antibody level vs time',xl:'days',xmin:0,xmax:120,ymin:0,ymax:abLevel(p,p.second+6)*1.1,series:[{fn:d=>abLevel(p,d),col:C.gold}],marker:[p.day,a]})},
 assumption:'Schematic antibody curves: primary peak ≈ 1 unit at day 12; secondary ≈ 10× higher, peaking about 6 days after re-exposure.'});
function abLevel(p,d){const g=(t0,lag,peak,w)=>d<t0+lag?0:peak*Math.exp(-(((d-t0-lag-w)/w)**2)*.7)*(d>t0+lag+w?Math.exp(-(d-t0-lag-w)/40):1);return g(0,4,1,8)+(d>=p.second?g(p.second,1.5,10,5):0)}

const AB={IgG:[1,'Most common; crosses the placenta'],IgA:[2,'In secretions such as colostrum'],IgM:[5,'First antibody made; pentamer'],IgE:[1,'Involved in allergy']};
add({...ch(7,'Human Health and Disease',U8),id:'bio-antibody-structure',title:'Structure of an antibody',
 description:'Rotate an antibody molecule: two heavy and two light chains form a Y with two antigen-binding sites.',
 formula:'Antibody = H₂L₂ (two heavy + two light chains)',
 observe:'The tips of the Y carry variable regions that fit a specific antigen.',
 tryText:'Switch to IgM and count the antigen-binding sites.',
 controls:[S('type','Antibody class','IgG',Object.keys(AB).map(k=>[k,k]))],
 metrics:p=>{const d=AB[p.type];return[N('Chains per unit','2 heavy + 2 light (H₂L₂)'),N('Units',d[0],'',0),N('Antigen-binding sites',2*d[0],'',0),N('Note',d[1])]},
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:88,yaw:t*.3}),n=AB[p.type][0];for(let i=0;i<n;i++){const a=TAU*i/n,base=n>1?[.25*Math.cos(a),0,.25*Math.sin(a)]:[0,-.3,0],dir=n>1?[Math.cos(a),0,Math.sin(a)]:[0,1,0],side=n>1?[0,1,0]:[1,0,0],P=(x,y)=>V.add(base,V.add(V.mul(dir,y*1.3),V.mul(side,x*1.3)));
   s.tube([P(-.07,-.5),P(-.07,0),P(-.5,.6)],.09,'#4dabf7',{segs:8});s.tube([P(.07,-.5),P(.07,0),P(.5,.6)],.09,'#4dabf7',{segs:8});s.tube([P(-.2,.1),P(-.6,.55)],.07,'#ffd43b',{segs:8});s.tube([P(.2,.1),P(.6,.55)],.07,'#ffd43b',{segs:8});s.seg(P(-.07,-.05),P(.07,-.05),'#ff6b6b',3);for(const x of[-.55,.55])s.ball(P(x,.68),.08,'#69db7c',{glow:true});if(i===0){s.callout(P(-.07,-.35),'heavy chain (H)','#74c0fc',-60,30);s.callout(P(.4,.4),'light chain (L)','#ffd43b',60,-20);s.callout(P(0,-.05),'disulphide (S–S) bonds','#ff6b6b',60,40);s.callout(P(-.55,.68),'antigen-binding site (variable region)','#69db7c',-40,-50)}}s.render();tag(c,'blue: heavy chains · yellow: light chains · red: S–S bonds · green: antigen-binding sites',44,98,C.muted,12)},
 assumption:'Schematic Y-shape; real chains are folded into domains.'});

const MAL=[['Mosquito bite','Female Anopheles injects sporozoites with saliva','Human'],['Liver stage','Parasites multiply asexually in liver cells','Human'],['RBC stage','Parasites multiply in RBCs; burst releases haemozoin → chill and fever every 3–4 days','Human'],['Gametocytes','Sexual stages develop in RBCs','Human'],['In mosquito gut','Gametes fuse; parasites multiply in the gut wall','Mosquito'],['Salivary glands','Sporozoites ready to infect a new human','Mosquito']];
add({...ch(7,'Human Health and Disease',U8),id:'bio-malaria-cycle',title:'Life cycle of Plasmodium (malaria)',
 description:'Trace Plasmodium through its two hosts: humans (asexual stages) and the female Anopheles mosquito (sexual stages).',
 formula:'Human: liver → RBCs (asexual) ;  mosquito: fertilisation and sporozoites (sexual)',
 observe:'The recurring high fever and chill coincide with RBCs bursting and releasing the toxin haemozoin.',
 tryText:'Step to the RBC stage. Why does fever come in cycles?',
 controls:[R('stage','Stage',1,6,1,1)],
 metrics:p=>{const d=MAL[p.stage-1];return[N('Stage',d[0]),N('What happens',d[1]),N('Host',d[2]),N('Pathogen','Plasmodium (e.g. P. vivax, P. falciparum)')]},
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:50,pitch:.3}),st=p.stage,pts=[[-2.6,1.4,0],[-2.6,-.4,0],[-1,-1.4,0],[1,-1.4,0],[2.6,-.4,0],[2.6,1.4,0]];s.path([...pts,pts[0]],'#29475b',3,[5,5]);
  critter(s,'human',[-3.4,-1.7,-1.3],.8,t);critter(s,'insect',[3,0,-1.3],1.2,t);s.mesh(pts[1],[.5,.3,.35],'#a61e4d',{label:'liver'});for(let i=0;i<5;i++)s.mesh(V.add(pts[2],[(i-2)*.25,.1*Math.sin(i),0]),[.18,.07,.18],'#c92a2a',{rot:[PI/2,0,0],rings:6,segs:10});s.mesh(pts[4],[.45,.25,.3],'#ffc078',{alpha:.6});s.mesh(pts[5],[.25,.3,.25],'#ffd8a8',{alpha:.6});
  const q=cycle(t*.5,1),pos=V.add(pts[st-1],V.mul(V.sub(pts[st%6],pts[st-1]),q));for(let i=0;i<5;i++)s.ball(V.add(pos,[(hash(i)-.5)*.3,(hash(i+2)-.5)*.3,0]),.05,'#be4bdb',{glow:true,flat:true});
  s.label([-2.6,1.8,0],'bite',C.muted,11);s.label([-1.3,-1.8,0],'RBCs',C.red,11);s.label([2.6,1.8,0],'salivary glands',C.muted,11);s.label([2.9,-.85,0],'mosquito gut',C.muted,11);s.render();tag(c,MAL[st-1][0],44,98,C.gold,15)},
 assumption:'Simplified cycle from NCERT Chapter 7; purple dots are parasites.'});

/* ---------- Chapter 8: Microbes in Human Welfare ---------- */
add({...ch(8,'Microbes in Human Welfare',U8),id:'bio-sewage-treatment',title:'Sewage treatment and BOD',
 description:'Run sewage through primary settling and secondary aeration tanks. Aerobic microbes in flocs consume organic matter and lower the BOD.',
 formula:'BOD(t) ≈ BOD₀e^(−kt) during aeration',
 observe:'Once BOD is reduced significantly the effluent is passed to a settling tank; the activated sludge digests anaerobically to give biogas.',
 tryText:'How long must the sewage be aerated to remove 90% of its BOD?',
 controls:[R('bod0','BOD of incoming sewage',100,500,10,300,'mg/L'),R('h','Aeration time',0,12,.1,4,'h',1)],
 metrics:p=>{const k=.3,b=p.bod0*Math.exp(-k*p.h);return[N('BOD after aeration',b,'mg/L',0),N('BOD removed',(1-b/p.bod0)*100,'%',0),N('Stage now',p.h<.5?'Primary treatment (settling)':'Secondary treatment (aeration)'),N('Microbes','Aerobic bacteria and fungi forming flocs')]},
 draw:(c,p,t)=>{const k=.3,b=p.bod0*Math.exp(-k*p.h),s=P3.scene(c,{scale:50,pitch:.4});const tank=(x,w,col,lab)=>{s.box([x,-.5,0],[w,1.4,2],'#adb5bd',{alpha:.25});s.box([x,-.65,0],[w*.96,1.05,1.92],col,{alpha:.55});s.label([x,.6,1.1],lab,C.white,12)};
  tank(-2.5,1.6,'#8d6e4f','primary');tank(0,2,`#${Math.round(90+80*(1-b/p.bod0)).toString(16)}${Math.round(110+60*(1-b/p.bod0)).toString(16)}60`,'aeration');tank(2.5,1.6,'#4dabf7','settling');for(let i=0;i<14;i++){const q=cycle(t*.6+i/14,1);s.ball([-.8+hash(i)*1.6,-1.1+q*1.1,(hash(i+3)-.5)*1.6],.05,'#e7f5ff',{flat:true})}
  for(let i=0;i<10;i++)s.mesh([-.7+hash(i+20)*1.4,-.8+hash(i+25)*.6,(hash(i+30)-.5)*1.4],[.12,.08,.1],'#a0782b',{shape:(u,v)=>1+.3*Math.sin(5*v+i)});s.render();
  chart(c,420,300,236,100,{title:'BOD (mg/L)',xmin:0,xmax:12,ymin:0,ymax:p.bod0,series:[{fn:x=>p.bod0*Math.exp(-k*x),col:C.gold}],marker:[p.h,b]})},
 assumption:'First-order BOD decay with k = 0.3 per hour (illustrative); real plants vary widely.'});

add({...ch(8,'Microbes in Human Welfare',U8),id:'bio-biogas-plant',title:'Biogas plant',
 description:'Feed cattle dung slurry into a digester. Methanogens break it down anaerobically and the floating gas holder rises.',
 formula:'Organic matter —methanogens (anaerobic)→ CH₄ + CO₂ (+ H₂S)',
 observe:'Methanogens such as Methanobacterium live in the rumen of cattle, so dung is rich in them.',
 tryText:'Increase the dung fed per day and see the gas holder rise faster.',
 controls:[R('dung','Dung fed per day',10,200,5,50,'kg'),R('T','Digester temperature',15,40,1,32,'°C')],
 metrics:p=>{const y=.04*p.dung*Math.exp(-(((p.T-35)/12)**2));return[N('Biogas per day',y,'m³',2),N('Methane (≈ 60%)',y*.6,'m³',2),N('Microbes','Methanogens, e.g. Methanobacterium'),N('Spent slurry','Used as fertiliser')]},
 draw:(c,p,t)=>{const y=.04*p.dung*Math.exp(-(((p.T-35)/12)**2)),s=P3.scene(c,{scale:54,cy:280,pitch:.25});s.box([0,-1.85,0],[7,.3,3],'#6d4c2f',{ground:true});s.cyl([0,-.9,0],[0,1,0],1.2,1.8,'#868e96',{alpha:.35,caps:false});s.cyl([0,-1.1,0],[0,1,0],1.15,1.4,'#6d4c2f',{alpha:.75});
  const rise=Math.min(.9,cycle(t*y*.1,1)*.9);s.cyl([0,.05+rise,0],[0,1,0],1.05,.9,'#ced4da');s.tube([[0,.5+rise,0],[0,1.2+rise,0],[1.5,1.2+rise,0]],.05,'#495057',{segs:6});s.ball([1.6,1.2+rise,0],.12,'#4dabf7',{glow:true,flat:true});
  s.tube([[-2.6,.4,0],[-2.6,-1.2,0],[-1.2,-1.5,0]],.12,'#a0782b',{segs:8});s.tube([[1.2,-1.5,0],[2.6,-1.2,0],[2.6,.2,0]],.12,'#8d6e4f',{segs:8});s.label([-2.6,.8,0],'dung slurry in',C.gold,12);s.label([2.6,.6,0],'spent slurry out',C.muted,12);s.label([0,1.5+rise,0],'gas holder',C.white,12);
  for(let i=0;i<10;i++){const q=cycle(t*.5+i/10,1);s.ball([(hash(i)-.5)*1.6,-1.5+q*1.2,(hash(i+4)-.5)*1.6],.05,'#e7f5ff',{flat:true})}s.render()},
 assumption:'Illustrative yield ≈ 0.04 m³ biogas per kg fresh dung at the optimum (~35 °C).'});

/* ---------- Chapter 9: Biotechnology: Principles and Processes ---------- */
add({...ch(9,'Biotechnology: Principles and Processes',U9),id:'bio-pcr',title:'Polymerase chain reaction (PCR)',
 description:'Cycle through denaturation, primer annealing and extension. Each cycle (ideally) doubles the DNA.',
 formula:'Copies after n cycles = N₀(1 + E)ⁿ ;  ideal (E = 1): N₀ × 2ⁿ',
 observe:'A thermostable DNA polymerase from Thermus aquaticus (Taq) survives the high denaturation temperature.',
 tryText:'How many copies from one DNA molecule after 30 ideal cycles?',
 controls:[R('n','Number of cycles',0,35,1,10),R('eff','Efficiency per cycle',60,100,1,100,'%'),R('n0','Starting copies',1,100,1,1)],
 metrics:(p,t)=>{const copies=p.n0*(1+p.eff/100)**p.n,st=pcrStep(t);return[N('DNA copies',copies,'',copies<1e5?0:3),N('Step (animation)',st.name),N('Temperature',st.T,'°C',0),N('Enzyme','Taq polymerase')]},
 draw:(c,p,t)=>{const st=pcrStep(t),s=P3.scene(c,{scale:56,cx:230});s.lathe([0,-1.5,0],[[.0,0],[.35,.3],[.45,.8],[.45,2.8],[.5,2.9]],'#e9f6ff',{alpha:.18});const sep=st.k===0?.3:.18;
  for(let m=0;m<Math.min(4,2**Math.min(p.n,2));m++){const x=(m%2-.5)*.4,z=(Math.floor(m/2)-.5)*.3;s.tube([[x-sep/2,-1,z],[x-sep/2,1.2,z]],.04,'#4dabf7',{segs:5});s.tube([[x+sep/2,-1,z],[x+sep/2,1.2,z]],.04,st.k===2?'#ff8787':'#4dabf7',{segs:5});if(st.k>=1)s.tube([[x+sep/2,-1,z],[x+sep/2,-.6,z]],.05,'#ffd43b',{segs:5})}const x0=-.2,z0=-.15;s.callout([x0-sep/2,.8,z0],st.k===0?'denaturation 94 °C: strands separate':'template DNA strand','#4dabf7',-60,-50);if(st.k>=1)s.callout([x0+sep/2,-.8,z0],'primer annealed (55 °C)','#ffd43b',-70,40);if(st.k===2)s.callout([x0+sep/2,.6,z0],'Taq polymerase extends new strand (72 °C)','#ff8787',60,-40);s.callout([.45,1.3,0],'PCR tube in thermal cycler','#e9f6ff',50,-40);s.render();
  chart(c,420,96,236,90,{title:'Temperature profile',xmin:0,xmax:3,ymin:40,ymax:100,series:[{pts:[[0,94],[1,94],[1,55],[2,55],[2,72],[3,72]],col:C.red}],marker:[cycle(t,3),st.T]});chart(c,420,196,236,90,{title:'Copies (log scale)',xl:'cycles',xmin:0,xmax:35,ymin:0,ymax:12,series:[{fn:x=>Math.log10(p.n0*(1+p.eff/100)**x),col:C.gold}],marker:[p.n,Math.log10(p.n0*(1+p.eff/100)**p.n)]});tag(c,'yellow: primers',44,98,C.gold,13)},
 assumption:'Typical temperatures: 94 °C denaturation, 50–60 °C annealing, 72 °C extension.'});
function pcrStep(t){const k=Math.floor(cycle(t,3));return[{k:0,name:'Denaturation',T:94},{k:1,name:'Annealing of primers',T:55},{k:2,name:'Extension by Taq polymerase',T:72}][k]}

const LADDER=[10000,5000,3000,2000,1000,500,250];
add({...ch(9,'Biotechnology: Principles and Processes',U9),id:'bio-gel-electrophoresis',title:'Agarose gel electrophoresis',
 description:'Load DNA fragments into wells and run the gel. Negatively charged DNA moves towards the anode; smaller fragments move farther.',
 formula:'Distance moved ∝ log of (1 / fragment size), roughly',
 observe:'Bands are seen after staining with ethidium bromide and UV light; they can be cut out (elution) and used for cloning.',
 tryText:'Increase the run time. Do small fragments run off the gel first?',
 controls:[R('time','Run time',0,60,1,35,'min'),R('V','Voltage',50,150,5,100,'V'),R('cut','Your sample: fragment size',200,9000,50,1500,'bp')],
 metrics:p=>{const d=gelDist(p,p.cut);return[N('Your fragment moved',d*10,'mm',1),N('Direction','Towards the anode (+)'),N('Stain','Ethidium bromide (orange under UV)'),N('Matrix','Agarose (from seaweed)')]},
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:56,pitch:.6}),L=4.4;s.box([0,-.15,0],[3.2,.2,L+.6],'#d0ebff',{alpha:.85});s.box([0,-.05,-L/2-.25],[3.4,.3,.15],'#1c1c1c');s.box([0,-.05,L/2+.25],[3.4,.3,.15],'#e03131');s.label([1.9,.3,L/2+.25],'+',C.red,18);s.label([1.9,.3,-L/2-.25],'−',C.white,18);
  const lane=(x,sizes,col)=>{s.box([x,.0,-L/2+.1],[.6,.08,.12],'#343a40');sizes.forEach(bp=>{const d=Math.min(L-.2,gelDist(p,bp));s.box([x,.0,-L/2+.15+d],[.6,.06,.08],col,{alpha:.9})})};lane(-.8,LADDER,'#ffa94d');lane(.8,[p.cut],'#ff922b');s.label([-.8,.3,-L/2-.6],'ladder',C.muted,12);s.label([.8,.3,-L/2-.6],'sample',C.muted,12);s.render()},
 assumption:'Mobility model d ∝ V·t·(log₁₀ 20000 − log₁₀ bp), illustrative; bands that pass the end leave the gel.'});
function gelDist(p,bp){return Math.max(0,p.V*p.time/3500*(Math.log10(20000)-Math.log10(bp))*1.2)}

const CLONE=[['Cut','EcoRI cuts the vector and foreign DNA at GAATTC, leaving sticky ends'],['Join','Sticky ends pair; DNA ligase seals the recombinant DNA'],['Transform','Recombinant plasmid enters competent host cells (E. coli)'],['Select','Transformants grow on ampicillin; recombinants identified by insertional inactivation']];
add({...ch(9,'Biotechnology: Principles and Processes',U9),id:'bio-recombinant-dna',title:'Making recombinant DNA',
 description:'Cut a plasmid and foreign DNA with the same restriction enzyme, join them, transform bacteria and pick out the recombinants.',
 formula:'EcoRI site: 5′-GAATTC-3′ (palindrome) → sticky ends',
 observe:'An insert inside a selectable-marker gene inactivates it — insertional inactivation reveals which colonies are recombinant.',
 tryText:'Choose blue–white screening. What colour are recombinant colonies?',
 controls:[R('step','Step',1,4,1,1),S('screen','Screening method','bw',[['bw','Blue–white (lacZ, β-galactosidase)'],['tet','Insertional inactivation of tetᴿ (pBR322)']])],
 metrics:p=>{const d=CLONE[p.step-1];return[N('Step',d[0]),N('What happens',d[1]),N('Recombinant colonies',p.screen==='bw'?'White (lacZ inactivated)':'Ampicillin-resistant but tetracycline-sensitive'),N('Vector features','ori, selectable marker, cloning sites')]},
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:56,pitch:.4}),st=p.step;if(st<=2){const gap=st===1?.6:.0,segs=36;for(let i=0;i<segs;i++){const a0=TAU*i/segs,a1=TAU*(i+1)/segs;if(st===1&&(a0>TAU-.25||a1<.25))continue;const col=a0<1.2?'#ff8787':a0<2.6?'#69db7c':a0<4?'#4dabf7':'#ced4da';s.tube([[1.2*Math.cos(a0),0,1.2*Math.sin(a0)],[1.2*Math.cos(a1),0,1.2*Math.sin(a1)]],.12,col,{segs:8})}
   const ins=st===1?[[2.6,0,-.5],[2.6,0,.5]]:[[1.2,0,-.25],[1.45,0,0],[1.2,0,.25]];s.tube(ins,.12,'#ffd43b',{segs:8});s.label([1.2,.5,-1.6],'ampᴿ',C.red,12);s.label([-1.4,.5,0],'ori',C.muted,12);s.label([st===1?2.6:1.6,.5,0],'foreign DNA',C.gold,12)}
  else if(st===3){capsule(s,[-1.6,0,0],[1.6,0,0],.8,'#a9e34b');s.ring([0,0,0],[0,1,0],.4,'#ffd43b',4);s.ring([.7,0,.2],[0,1,0],.25,'#ff8787',3)}
  else{s.lathe([0,-.4,0],[[0,0],[2.2,0],[2.2,.25]],'#ffe8cc',{alpha:.7});for(let i=0;i<22;i++){const a=TAU*hash(i),r=1.9*Math.sqrt(hash(i+3)),rec=hash(i+7)<.35;s.mesh([r*Math.cos(a),-.1,r*Math.sin(a)],[.15,.06,.15],p.screen==='bw'?(rec?'#f8f9fa':'#1c7ed6'):(rec?'#ffd43b':'#adb5bd'))}}s.render();tag(c,CLONE[st-1][0]+(st===4?(p.screen==='bw'?' — white = recombinant':' — yellow = recombinant'):''),44,98,C.gold,14)},
 assumption:'Generic cloning workflow from NCERT Chapter 9; plasmid map simplified.'});

/* ---------- Chapter 10: Biotechnology and its Applications ---------- */
add({...ch(10,'Biotechnology and its Applications',U9),id:'bio-bt-cotton',title:'Bt cotton: how the Bt toxin works',
 description:'Bollworm larvae feed on Bt and non-Bt cotton. In the alkaline gut the inactive protoxin becomes an active toxin.',
 formula:'Inactive protoxin —alkaline gut pH→ active toxin → pores in midgut cells → death',
 observe:'The toxin does not harm the bacterium itself, because it is stored as an inactive protoxin.',
 tryText:'Compare larva survival on Bt and non-Bt plants after a week.',
 controls:[S('plant','Plant','bt',[['bt','Bt cotton (cry genes)'],['non','Non-Bt cotton']]),R('days','Days of feeding',0,10,1,4,'days'),R('larvae','Larvae on plant',2,12,1,8)],
 metrics:p=>{const alive=p.plant==='bt'?Math.round(p.larvae*Math.exp(-.6*p.days)):p.larvae;return[N('Larvae surviving',alive,'',0),N('Toxin genes','cryIAc, cryIIAb (cotton bollworms)'),N('Source','Bacillus thuringiensis'),N('Toxin activation','Alkaline pH in the insect gut')]},
 draw:(c,p,t)=>{const alive=p.plant==='bt'?Math.round(p.larvae*Math.exp(-.6*p.days)):p.larvae,s=P3.scene(c,{scale:56,cy:290});s.box([0,-1.65,0],[3,.4,3],'#6d4c2f',{ground:true});s.tube([[0,-1.5,0],[0,1.3,0]],.06,'#5c940d',{segs:8});for(let i=0;i<5;i++){const a=i*2.4,y=-.8+i*.45;leaf(s,[0,y,0],[Math.cos(a),.3,Math.sin(a)],.8,.35,'#40c057');if(i>1){const q=[.5*Math.cos(a+1),y+.1,.5*Math.sin(a+1)];s.mesh(q,[.2,.22,.2],'#f8f9fa',{shape:(u,v)=>1+.2*Math.sin(5*v)*Math.cos(3*u)})}}
  for(let i=0;i<p.larvae;i++){const dead=i>=alive,q=[(hash(i)-.5)*1.6,-.7+hash(i+3)*1.6,(hash(i+6)-.5)*1.6];s.tube(Array.from({length:8},(_,k)=>V.add(q,[k*.06,.03*Math.sin(k+t*(dead?0:4)),0])),.05,dead?'#868e96':'#94d82d',{segs:6})}s.callout([.5*Math.cos(3*2.4+1),-.8+3*.45+.1,.5*Math.sin(3*2.4+1)],'cotton boll','#f8f9fa',60,-40);if(p.larvae)s.callout([(hash(0)-.5)*1.6,-.7+hash(3)*1.6,(hash(6)-.5)*1.6],alive<p.larvae?'bollworm larva: Cry toxin kills it':'bollworm larva feeding',alive<p.larvae?'#adb5bd':'#94d82d',-60,40);s.callout([0,-1.0,0],p.plant==='bt'?'leaves make Cry protein (cry gene)':'ordinary cotton plant','#40c057',-70,-30);s.render();tag(c,p.plant==='bt'?'Larvae die after eating Bt cotton':'Larvae keep feeding',44,98,p.plant==='bt'?C.mint:C.red,14)},
 assumption:'Survival curve is illustrative (≈ 45% die each day on Bt cotton).'});

const INS=[['Two chains','Insulin has two polypeptide chains, A and B, joined by disulphide bridges'],['Pro-insulin problem','In humans it is made as pro-insulin with an extra C-peptide that is removed'],['rDNA approach (1983)','Eli Lilly made DNA sequences for chains A and B and put them into E. coli plasmids'],['Combine','Chains produced separately, extracted and joined by disulphide bonds → human insulin']];
add({...ch(10,'Biotechnology and its Applications',U9),id:'bio-insulin-rdna',title:'Genetically engineered insulin',
 description:'Build human insulin from its A and B chains, the way recombinant DNA technology produced it in 1983.',
 formula:'Insulin = A chain + B chain linked by disulphide (–S–S–) bridges',
 observe:'Insulin made in bacteria avoids the allergies some patients had to insulin from cattle and pigs.',
 tryText:'Step to the last stage and count the disulphide bridges between the chains.',
 controls:[R('step','Step',1,4,1,4)],
 metrics:p=>{const d=INS[p.step-1];return[N('Step',d[0]),N('Detail',d[1]),N('Chains','A (21 amino acids), B (30 amino acids)'),N('Bridges','2 between chains, 1 within chain A')]},
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:54,yaw:.2*Math.sin(t*.4)}),st=p.step,j=st>=4?0:1.2;for(let i=0;i<21;i++)s.ball([-2.6+i*.24,.6+j,0],.11,'#4dabf7');for(let i=0;i<30;i++)s.ball([-3+i*.21,-.4-j,0],.1,'#ff8787');
  if(st===2)for(let i=0;i<10;i++)s.ball([-1+i*.22,-1.8,0],.09,'#adb5bd');if(st===3){capsule(s,[-2,-2.2,0],[2,-2.2,0],.6,'#a9e34b');s.ring([0,-2.2,0],[0,1,0],.4,'#ffd43b',3)}
  if(st>=4){for(const x of[-.9,1.6])s.seg([x,.6,0],[x,-.4,0],'#ffd43b',4);s.seg([-1.9,.75,0],[-1.2,.75,0],'#ffd43b',3)}s.label([-3.2,.6+j,0],'A',C.blue,15);s.label([-3.6,-.4-j,0],'B',C.red,15);s.render();tag(c,INS[st-1][0],44,98,C.gold,15)},
 assumption:'Amino acids drawn as beads; bridge positions approximate.'});

/* ---------- Chapter 11: Organisms and Populations ---------- */
add({...ch(11,'Organisms and Populations',U10),id:'bio-population-growth-models',title:'Exponential and logistic growth',
 description:'Grow a population with unlimited resources (exponential, J-shaped) or limited resources (logistic, S-shaped).',
 formula:'dN/dt = rN ;  logistic: dN/dt = rN(K − N)/K',
 observe:'With limited resources growth slows and levels off at the carrying capacity K.',
 tryText:'Use the flour beetle’s r = 0.12 and compare with the Norway rat’s r = 0.015.',
 controls:[S('model','Model','log',[['exp','Exponential (J-shaped)'],['log','Logistic (S-shaped)']]),R('r','Intrinsic rate r',.01,.5,.005,.12,'per day',3),R('K','Carrying capacity K',100,1000,10,500),R('t','Time',0,100,1,40,'days')],
 metrics:p=>{const n=popN(p,p.t);return[N('Population N',n,'',0),N('Growth rate now',p.model==='exp'?p.r*n:p.r*n*(p.K-n)/p.K,'per day',1),N('Shape',p.model==='exp'?'J-shaped':'Sigmoid (S-shaped)'),N('Example r (NCERT)','Norway rat 0.015 · flour beetle 0.12')]},
 draw:(c,p,t)=>{const n=popN(p,p.t),s=P3.scene(c,{scale:50,pitch:.45,cx:230}),k=Math.min(90,Math.round(n/p.K*60));s.box([0,-1.6,0],[5,.1,3.4],'#2b8a3e',{ground:true});for(let i=0;i<k;i++){const x=-2.2+(i%12)*.4,z=-1.4+Math.floor(i/12)*.4;s.mesh([x,-1.45,z],[.13,.08,.1],'#b5651d',{rings:5,segs:8})}s.render();
  chart(c,420,96,236,170,{title:'N vs time',xl:'days',xmin:0,xmax:100,ymin:0,ymax:p.model==='exp'?Math.max(p.K,popN(p,100)):p.K*1.1,series:[{fn:x=>popN(p,x),col:C.gold},{fn:()=>p.K,col:'#8ca6b9',dash:[4,4]}],marker:[p.t,n]})},
 assumption:'Starting population N₀ = 10; dots show the population as a share of K (up to 90 drawn).'});
function popN(p,t){const N0=10;return p.model==='exp'?N0*Math.exp(p.r*t):p.K/(1+(p.K/N0-1)*Math.exp(-p.r*t))}

add({...ch(11,'Organisms and Populations',U10),id:'bio-predator-prey',title:'Predator–prey cycles',
 description:'Prey multiply; predators eat them and multiply in turn; prey fall, predators starve — and the cycle repeats.',
 formula:'dH/dt = aH − bHP ;  dP/dt = cbHP − dP (Lotka–Volterra)',
 observe:'Predators keep prey populations under control; predator peaks lag behind prey peaks.',
 tryText:'Increase the predation rate. What happens to the size of the swings?',
 controls:[R('a','Prey birth rate',.2,1.2,.05,.6,'',2),R('b','Predation rate',.005,.05,.001,.02,'',3),R('d','Predator death rate',.1,1,.05,.4,'',2),R('t','Time',0,60,.5,20,'',1)],
 metrics:p=>{const r=lv(p),i=Math.min(r.length-1,Math.round(p.t/.05));return[N('Prey',r[i][0],'',0),N('Predators',r[i][1],'',0),N('Pattern','Oscillations; predators lag prey')]},
 draw:(c,p,t)=>{const r=lv(p),i=Math.min(r.length-1,Math.round(p.t/.05)),[H,P]=r[i],s=P3.scene(c,{scale:50,pitch:.45,cx:220});s.box([0,-1.6,0],[5,.1,3.4],'#2b8a3e',{ground:true});for(let k=0;k<Math.min(60,Math.round(H/3));k++){const x=-2.2+(k%12)*.4,z=-1.4+Math.floor(k/12)*.4;s.mesh([x,-1.45,z],[.14,.1,.1],'#f1e3c6',{rings:5,segs:8})}for(let k=0;k<Math.min(20,Math.round(P/3));k++){const x=-2+hash(k)*4,z=-1.3+hash(k+3)*2.6;s.mesh([x,-1.38,z],[.22,.14,.12],'#c92a2a',{rings:6,segs:10})}s.render();
  chart(c,410,96,246,170,{title:'Populations vs time',xl:'time',xmin:0,xmax:60,ymin:0,series:[{pts:r.map((v,k)=>[k*.05,v[0]]),col:'#f1e3c6'},{pts:r.map((v,k)=>[k*.05,v[1]]),col:C.red}],marker:[p.t,H,'#f1e3c6']});tag(c,'cream: prey · red: predators',44,98,C.muted,13)},
 assumption:'Lotka–Volterra model, predator conversion efficiency c = 0.5, start H = 40, P = 9 (RK4 integration).'});
function lv(p){return memo('lv'+p.a+p.b+p.d,()=>{const c=.5,f2=([H,P])=>[p.a*H-p.b*H*P,c*p.b*H*P-p.d*P];let y=[40,9];const out=[y],h=.05;for(let i=0;i<1200;i++){const k1=f2(y),k2=f2(y.map((v,j)=>v+h/2*k1[j])),k3=f2(y.map((v,j)=>v+h/2*k2[j])),k4=f2(y.map((v,j)=>v+h*k3[j]));y=y.map((v,j)=>Math.max(0,v+h/6*(k1[j]+2*k2[j]+2*k3[j]+k4[j])));out.push(y)}return out})}

const PYR={expanding:['Expanding','Large pre-reproductive base; population growing',[10,9,8,7,5.5,4,2.8,1.8,1]],stable:['Stable','Similar numbers across ages; population stable',[6.5,6.5,6.4,6.3,6.2,5.8,5,3.8,2.2]],declining:['Declining','Narrow base; fewer young than adults',[4,4.5,5.2,6,6.3,6.2,5.6,4.4,2.6]]};
add({...ch(11,'Organisms and Populations',U10),id:'bio-age-pyramids',title:'Age pyramids',
 description:'Compare the age structure of expanding, stable and declining human populations.',
 formula:'Pre-reproductive · reproductive · post-reproductive age groups',
 observe:'The shape of the age pyramid shows whether a population is growing, stable or declining.',
 tryText:'Which shape matches a country with a high birth rate?',
 controls:[S('type','Population','expanding',Object.keys(PYR).map(k=>[k,PYR[k][0]]))],
 metrics:p=>{const d=PYR[p.type],pre=d[2].slice(0,3).reduce((a,b)=>a+b,0),tot=d[2].reduce((a,b)=>a+b,0);return[N('Type',d[0]),N('Meaning',d[1]),N('Pre-reproductive share',pre/tot*100,'%',0)]},
 draw:(c,p,t)=>{const d=PYR[p.type],s=P3.scene(c,{scale:54,pitch:.2});d[2].forEach((w,i)=>{const y=-1.8+i*.42,col=i<3?'#69db7c':i<6?'#4dabf7':'#ffa94d';s.box([-w*.17,y,0],[w*.34,.36,.6],col);s.box([w*.17,y,0],[w*.34,.36,.6],col,{alpha:.75})});s.label([-1.8,2.1,0],'males',C.muted,12);s.label([1.8,2.1,0],'females',C.muted,12);s.render();tag(c,'green: pre-reproductive · blue: reproductive · orange: post-reproductive',44,98,C.muted,12)},
 assumption:'Schematic pyramids; bar widths are relative.'});

const INT={mutualism:['+','+','Lichens (fungus + alga), mycorrhizae, fig and wasp'],competition:['−','−','Abingdon tortoise vs goats (Galapagos); barnacles (Connell)'],predation:['+','−','Tiger and deer; Cactoblastis moth on prickly pear'],parasitism:['+','−','Cuscuta on hedge plants; cuckoo (brood parasitism)'],commensalism:['+','0','Orchid on a mango branch; cattle egret and cattle'],amensalism:['0','−','One species harmed, the other unaffected']};
add({...ch(11,'Organisms and Populations',U10),id:'bio-population-interactions',title:'Population interactions',
 description:'Explore the six kinds of interaction between two species and what each species gains or loses.',
 formula:'+ benefit · − harm · 0 unaffected',
 observe:'In mutualism both gain; in competition both lose; in parasitism and predation one gains at the other’s cost.',
 tryText:'Which interaction is described as “+, 0”?',
 controls:[S('type','Interaction','mutualism',Object.keys(INT).map(k=>[k,k[0].toUpperCase()+k.slice(1)]))],
 metrics:p=>{const d=INT[p.type];return[N('Species A',d[0]),N('Species B',d[1]),N('Examples (NCERT)',d[2])]},
 draw:(c,p,t)=>{const d=INT[p.type],s=P3.scene(c,{scale:56,cy:290,pitch:.2}),models={mutualism:['mushroom','algae'],competition:['frog','frog'],predation:['bird','insect'],parasitism:['plant','plant'],commensalism:['plant','bird'],amensalism:['mushroom','bacterium']}[p.type];
  [[-1.4,models[0],d[0]],[1.4,models[1],d[1]]].forEach(([x,m,sym])=>{s.cyl([x,-1.55,0],[0,1,0],.8,.12,'#29475b');critter(s,m,[x,-1.5,0],1.2,t);const col=sym==='+'?'#40c057':sym==='−'?'#fa5252':'#adb5bd';s.ball([x,1.4,0],.35,col,{glow:true});s.label([x,1.4,0],sym,C.white,22)});const NM={mutualism:['fungus','alga (together: lichen)'],competition:['species A','species B (same resource)'],predation:['predator (bird)','prey (insect)'],parasitism:['host plant','parasite (e.g. Cuscuta)'],commensalism:['tree (unaffected)','bird / epiphyte (benefits)'],amensalism:['Penicillium (unaffected)','bacteria (harmed)']}[p.type];s.callout([-1.4,-.4,.6],NM[0],'#e9f6ff',-60,30);s.callout([1.4,-.4,.6],NM[1],'#e9f6ff',60,30);s.render()},
 assumption:'Organism models are generic placeholders for the two interacting species.'});

/* ---------- Chapter 12: Ecosystem ---------- */
add({...ch(12,'Ecosystem',U10),id:'bio-energy-pyramid',title:'Pyramid of energy (10 per cent law)',
 description:'Pass energy up the food chain. Only about 10% reaches the next trophic level.',
 formula:'Energy at level n = E₁ × (efficiency)ⁿ⁻¹',
 observe:'A pyramid of energy is always upright — energy is lost as heat at every step.',
 tryText:'With 10% efficiency, how much of the producers’ energy reaches the fourth level?',
 controls:[R('E','Energy fixed by producers',1000,100000,1000,10000,'kJ'),R('eff','Transfer efficiency',5,20,1,10,'%'),R('levels','Trophic levels',2,5,1,4)],
 metrics:p=>Array.from({length:p.levels},(_,i)=>N(['Producers','Primary consumers','Secondary consumers','Tertiary consumers','Top carnivores'][i],p.E*(p.eff/100)**i,'kJ',1)),
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:54,cy:300,pitch:.3}),cols=['#40c057','#fab005','#fd7e14','#e03131','#ae3ec9'];for(let i=0;i<p.levels;i++){const e=p.E*(p.eff/100)**i,w=Math.max(.15,Math.sqrt(e/p.E)*4);s.box([0,-1.6+i*.55+.25,0],[w,.5,w*.7],cols[i]);s.label([w/2+.3,-1.6+i*.55+.25,0],f(e,1)+' kJ',cols[i],12,'left')}
  for(let i=0;i<p.levels-1;i++){const q=cycle(t*.4+i*.3,1);s.ball([0,-1.6+i*.55+.5+q*.55,.6],.06,'#ffd43b',{glow:true,flat:true});s.ball([1.6*q,-1.6+i*.55+.4,-.8],.05,'#ff6b6b',{flat:true})}s.render();tag(c,'red dots: energy lost as heat',44,98,C.muted,13)},
 assumption:'Lindeman’s 10% rule as a default; real efficiencies vary (≈ 5–20%). Box area ∝ energy.'});

add({...ch(12,'Ecosystem',U10),id:'bio-productivity',title:'Gross and net primary productivity',
 description:'Plants fix energy by photosynthesis (GPP) and use some of it in respiration. What remains (NPP) is food for consumers.',
 formula:'NPP = GPP − R',
 observe:'Although oceans cover about 70% of the surface, their productivity is only about 55 billion tons of the biosphere’s 170.',
 tryText:'Increase respiration losses. How much is left for herbivores?',
 controls:[R('gpp','Gross primary productivity',500,5000,50,2000,'g/m²/yr'),R('rr','Respiration losses',20,80,1,45,'%')],
 metrics:p=>{const npp=p.gpp*(1-p.rr/100);return[N('NPP',npp,'g/m²/yr',0),N('Respiration losses',p.gpp-npp,'g/m²/yr',0),N('Biosphere NPP','≈ 170 billion tons/yr (dry weight)'),N('Oceans','≈ 55 billion tons/yr')]},
 draw:(c,p,t)=>{const npp=p.gpp*(1-p.rr/100),s=P3.scene(c,{scale:52,cy:290});s.box([0,-1.65,0],[6,.3,3],'#6d4c2f',{ground:true});for(let i=0;i<7;i++){const x=-2.4+i*.8,z=(hash(i)-.5)*1.6,h=.8+npp/p.gpp*1.4*(.8+.4*hash(i+3));s.cyl([x,-1.5+h/2,z],[0,1,0],.07,h,'#6d4c2f');s.mesh([x,-1.5+h+.3,z],[.45,.5,.45],'#2f9e44',{shape:(u,v)=>1+.15*Math.sin(5*v+i)*Math.cos(3*u)})}
  for(let i=0;i<8;i++)s.seg([-3+i*.8,2.4,-1],[-3+i*.8+.5,.4,-.4],'#fff3bf88',2);for(let i=0;i<Math.round(p.rr/10);i++){const q=cycle(t*.5+i/8,1);s.ball([-2+hash(i)*4,.5+q*1.5,(hash(i+3)-.5)],.05,'#ff8787',{flat:true})}s.render();tag(c,'red dots: energy respired by plants',44,98,C.muted,13)},
 assumption:'Single plant community; values per unit area per year.'});

add({...ch(12,'Ecosystem',U10),id:'bio-decomposition',title:'Decomposition of detritus',
 description:'Watch leaf litter break down. Warmth, moisture and nitrogen-rich litter speed it up; lignin and chitin slow it.',
 formula:'Fragmentation → leaching → catabolism → humification → mineralisation',
 observe:'Low temperature and anaerobic conditions inhibit decomposition, so organic matter builds up.',
 tryText:'Make the litter lignin-rich and the soil cold. How much remains after a year?',
 controls:[R('T','Temperature',0,40,1,25,'°C'),R('moist','Moisture',0,100,1,60,'%'),R('lig','Lignin / chitin content',0,60,1,20,'%'),R('m','Time',0,24,1,6,'months')],
 metrics:p=>{const k=decK(p),rem=Math.exp(-k*p.m);return[N('Litter remaining',rem*100,'%',0),N('Decay rate',k,'per month',2),N('Main step now',p.m<2?'Fragmentation by detritivores':p.m<6?'Catabolism by bacteria and fungi':'Humification and mineralisation'),N('Product','Humus — dark, amorphous, slow to decay')]},
 draw:(c,p,t)=>{const rem=Math.exp(-decK(p)*p.m),s=P3.scene(c,{scale:56,cy:290,pitch:.45});s.box([0,-1.7,0],[5,.4,3.4],'#4e342e',{ground:true});const n=Math.round(30*rem);for(let i=0;i<n;i++){const a=hash(i)*TAU;leaf(s,[(hash(i+3)-.5)*4,-1.45,(hash(i+6)-.5)*2.6],[Math.cos(a),0,Math.sin(a)],.45*(.5+rem*.5),.18*(.5+rem*.5),['#a0522d','#cd853f','#8b4513'][i%3])}
  for(let i=0;i<Math.round((1-rem)*20);i++)s.ball([(hash(i+40)-.5)*4,-1.48,(hash(i+50)-.5)*2.6],.06,'#2b1a12',{flat:true});critter(s,'earthworm',[.5*Math.sin(t*.3),-1.6,.6],.9,t);s.callout([.5*Math.sin(t*.3),-1.45,.6],'earthworm: fragmentation','#d08b74',60,-40);if(n)s.callout([(hash(3)-.5)*4,-1.45,(hash(6)-.5)*2.6],'detritus (dead leaves)','#cd853f',-60,-50);if(rem<.95)s.callout([(hash(40)-.5)*4,-1.48,(hash(50)-.5)*2.6],'humus + minerals','#a1887f',50,50);s.render()},
 assumption:'Illustrative first-order decay: k = 0.35 × temperature factor × moisture factor × (1 − lignin fraction) per month.'});
function decK(p){return .35*Math.exp(-(((p.T-30)/14)**2))*(p.moist/100)*(1-p.lig/100*1.4)}

/* ---------- Chapter 13: Biodiversity and Conservation ---------- */
add({...ch(13,'Biodiversity and Conservation',U10),id:'bio-species-area',title:'Species–area relationship',
 description:'Explore larger and larger areas and count species. On log–log axes the relationship is a straight line.',
 formula:'log S = log C + Z log A',
 observe:'Z is typically 0.1–0.2 for regions; for very large areas such as whole continents it is much steeper (0.6–1.2).',
 tryText:'Double the area with Z = 0.2. By what factor do species increase?',
 controls:[R('lA','Area (log₁₀ km²)',0,7,.1,3,'',1),R('Z','Slope Z',.1,1.2,.05,.2,'',2),R('Cc','Constant C (species at 1 km²)',5,100,5,20)],
 metrics:p=>{const A=10**p.lA,Sn=p.Cc*A**p.Z;return[N('Area',A,'km²',2),N('Species richness S',Sn,'',0),N('Doubling area multiplies S by',2**p.Z,'×',3),N('Typical Z','0.1–0.2 (regions); 0.6–1.2 (continents)')]},
 draw:(c,p,t)=>{const A=10**p.lA,Sn=p.Cc*A**p.Z,s=P3.scene(c,{scale:52,pitch:.55,cx:220}),r=.3+p.lA*.35;s.box([0,-.6,0],[7,.1,4],'#1971c2',{alpha:.5,ground:true});s.mesh([0,-.55,0],[r,.15,r*.8],'#2f9e44',{shape:(u,v)=>1+.15*Math.sin(5*v)});for(let i=0;i<Math.min(80,Math.round(Math.sqrt(Sn)*3));i++){const a=TAU*hash(i),rr=r*.8*Math.sqrt(hash(i+3));s.ball([rr*Math.cos(a),-.35,rr*.8*Math.sin(a)],.05,['#ffd43b','#ff8787','#74c0fc','#b197fc'][i%4],{flat:true})}s.render();
  chart(c,420,96,236,170,{title:'log S vs log A',xl:'log₁₀ A',xmin:0,xmax:7,ymin:0,series:[{fn:x=>Math.log10(p.Cc)+p.Z*x,col:C.gold}],marker:[p.lA,Math.log10(Sn)]})},
 assumption:'Alexander von Humboldt’s relationship; dots show species richness on a compressed (√) scale.'});

const LAT=[[4,1400,'Colombia (near equator)'],[41,105,'New York (41° N)'],[71,56,'Greenland (71° N)']];
add({...ch(13,'Biodiversity and Conservation',U10),id:'bio-latitudinal-gradient',title:'Latitudinal gradient in diversity',
 description:'Move from the equator to the poles and see how the number of bird species falls.',
 formula:'Species diversity decreases from the equator towards the poles',
 observe:'Tropics have had a long evolutionary time, a more stable climate and more solar energy, so they hold more species.',
 tryText:'Compare Colombia with Greenland: how many times more bird species?',
 controls:[R('lat','Latitude',0,80,1,41,'° N')],
 metrics:p=>{const est=latEst(p.lat);return[N('Estimated bird species',est,'',0),N('Colombia (≈ 4° N)','≈ 1400 species'),N('New York (41° N)','105 species'),N('Greenland (71° N)','56 species')]},
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:56,yaw:.6,pitch:.3}),R0=1.6;s.mesh([0,0,0],R0,'#1971c2',{rings:16,segs:28,col:undefined});for(let i=0;i<12;i++){const a=TAU*i/12;s.mesh([R0*.98*Math.cos(a),R0*.3*Math.sin(i*1.7),R0*.98*Math.sin(a)].map(v=>v*.99),[.4,.25,.3],'#2f9e44',{rings:6,segs:10})}
  LAT.forEach(([la,n])=>{const a=rad(la),pos=[R0*Math.cos(a),R0*Math.sin(a),0],h=Math.log10(n)*.6;s.tube([pos,V.mul(pos,1+h/R0)],.06,'#ffd43b',{segs:6});s.label(V.mul(pos,1+h/R0+.15),n,C.gold,13)});const a=rad(p.lat),pos=[R0*Math.cos(a),R0*Math.sin(a),.2];s.ball(pos,.1,C.red,{glow:true,lift:3});s.ring([0,R0*Math.sin(a),0],[0,1,0],R0*Math.cos(a),'#ff6b6b',1.5,[4,4]);s.render();tag(c,'yellow bars: bird species (height ∝ log number)',44,98,C.muted,13)},
 assumption:'Data points from NCERT Chapter 13; values between them are interpolated on a log scale for illustration.'});
function latEst(l){const pts=[[0,1500],...LAT.map(x=>[x[0],x[1]]),[90,30]];for(let i=0;i<pts.length-1;i++)if(l<=pts[i+1][0]){const [x0,y0]=pts[i],[x1,y1]=pts[i+1],k=(l-x0)/(x1-x0);return 10**(Math.log10(y0)+k*(Math.log10(y1)-Math.log10(y0)))}return 30}

done();
})();
