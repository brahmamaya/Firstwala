/* Biology pack 2 — NCERT Class 11, chapters 8–13 (20 experiments).
   Facts follow the rationalised NCERT Biology textbook; kinetic curves are standard teaching models. */
(() => {
'use strict';
const {R,S,N,f,clamp,rad,deg,cycle,tag,chart,pack,PI,TAU,C}=window.PhysicaLab;
const P3=window.Physica3D,V=P3.vec,{BC,hash,critter,leaf,cell,capsule,chromosome,helix}=window.PhysicaBio,{add,done}=pack();
const U3='CELL: STRUCTURE AND FUNCTIONS',U4='PLANT PHYSIOLOGY';
const ch=(no,chapter,group)=>({grade:11,chapterNo:no,chapter,group});
// Oriented rectangular slab (6 lit faces) centred at c with unit axes ax/ay/az and half-sizes h; optional alpha.
const slab=(s,c,ax,ay,az,h,col,alpha,zb)=>{const A=[V.mul(ax,h[0]),V.mul(ay,h[1]),V.mul(az,h[2])],F=[[0,1],[0,-1],[1,1],[1,-1],[2,1],[2,-1]],O=[[1,2],[2,1],[2,0],[0,2],[0,1],[1,0]];
  F.forEach(([k,sg],i)=>{const [p,q]=O[i],m=V.add(c,V.mul(A[k],sg)),e=A[p],g=A[q],n=V.mul(V.norm(A[k]),sg);s.poly([V.add(V.add(m,e),g),V.add(V.sub(m,e),g),V.sub(V.sub(m,e),g),V.sub(V.add(m,e),g)],col,{normal:n,cull:true,spec:.4,shine:30,alpha,bias:zb})})};const smooth=x=>x*x*(3-2*x);

/* ---------- Chapter 8: Cell: The Unit of Life ---------- */
const ORG={nucleus:['Double membrane (nuclear envelope with pores)','Both','Contains chromatin (DNA); controls the cell'],mito:['Double membrane; inner folds = cristae','Both','Site of aerobic respiration — “power house”; has own DNA and 70S ribosomes'],chloro:['Double membrane; thylakoids stacked as grana','Plant only','Photosynthesis; has own DNA and 70S ribosomes'],
  er:['Single membrane network','Both','RER (with ribosomes): proteins; SER: lipids (steroids)'],golgi:['Single-membrane flat cisternae','Both','Packages materials; forms glycoproteins and glycolipids'],ribo:['No membrane (RNA + protein)','Both','Protein synthesis; 80S in eukaryotes (60S + 40S)'],
  vacuole:['Single membrane (tonoplast)','Large in plants','Stores sap; up to 90% of plant cell volume'],lyso:['Single membrane','Animal (mainly)','Hydrolytic enzymes, active at acidic pH'],centro:['No membrane; two centrioles (9 triplet microtubules)','Animal only','Forms spindle poles in cell division'],wall:['Rigid, non-living layer','Plant only','Cellulose, hemicellulose, pectins; gives shape and protection']};
/*BEGIN cellkit*/
/* ---- Cell explorer: textbook organelle models built from the Physica3D primitives (local helpers) ---- */
const _pl=(p,rot)=>{const Rt=P3.rotator(rot);return q=>V.add(p,Rt(q))};
const _sq=n=>(u,v)=>{const a=Math.abs(Math.cos(u)*Math.cos(v)),b=Math.abs(Math.sin(u)),d=Math.abs(Math.cos(u)*Math.sin(v));return 1/Math.pow(a**n+b**n+d**n,1/n)};
/* Sectioned organelle: opaque back half-shell plus a flat cut face (z=0 of the local frame) that carries the inner structure, as in textbook cut-aways. */
function halfBody(s,p,rad,rot,col,face,edge,R=5,S=10){const A=_pl(p,rot),g=[];
  for(let i=0;i<=R;i++){const u=-Math.PI/2+Math.PI*i/R,row=[];for(let j=0;j<=S;j++){const v=Math.PI+Math.PI*j/S;row.push(A([rad[0]*Math.cos(u)*Math.cos(v),rad[1]*Math.sin(u),rad[2]*Math.cos(u)*Math.sin(v)]))}g.push(row)}
  for(let i=0;i<R;i++)for(let j=0;j<S;j++)s.poly([g[i][j],g[i+1][j],g[i+1][j+1],g[i][j+1]],col,{cull:false,spec:.3});
  const ring=[];for(let j=0;j<24;j++){const v=TAU*j/24;ring.push(A([rad[0]*Math.cos(v),rad[1]*Math.sin(v),0]))}
  s.poly(ring,face,{cull:false,normal:P3.rotator(rot)([0,0,1]),stroke:edge,lw:2.2,shade:false});return{A,z:s.P(p)[2]}}
function mitoModel(s,p,sc,rot,hl){const Y=hl,ax=.4*sc,ay=.19*sc,{A,z}=halfBody(s,p,[ax,ay,ay*.8],rot,Y?'#ffd43b':BC.mito,Y?'#fff0a0':'#fbd3b0',Y?'#a86f00':'#a84312');
  const el=(k,n=22)=>Array.from({length:n+1},(_,j)=>{const v=TAU*j/n;return A([ax*k*Math.cos(v),ay*k*Math.sin(v),.003])});
  s.path(el(.84),Y?'#8a5a00':'#c2541b',2.2,[],z+.02);
  for(let i=0;i<7;i++){const x=(-.66+i*.22)*ax,sg=i%2?1:-1,yb=sg*ay*.84*Math.sqrt(Math.max(0,1-(x/(ax*.84))**2)),w=.03*sc,h=ay*.62,pts=[];
    pts.push(A([x-w,yb,.004]),A([x-w,yb-sg*h*.8,.004]),A([x,yb-sg*h,.004]),A([x+w,yb-sg*h*.8,.004]),A([x+w,yb,.004]));s.path(pts,Y?'#8a5a00':'#c2541b',2.6,[],z+.03)}
  for(const [x,y] of[[-.45,.0],[.1,.02],[.5,-.03]])s.ball(A([x*ax,y*ay,.01]),.012*sc,Y?'#6b4500':'#7a3a12',{flat:true,lift:.1})}
function chloroModel(s,p,sc,rot,hl){const Y=hl,ax=.46*sc,ay=.2*sc,{A,z}=halfBody(s,p,[ax,ay,ay*.9],rot,Y?'#ffd43b':'#37a64a',Y?'#fff0a0':'#8fdc8f',Y?'#a86f00':'#1f7a2e'),dk=Y?'#b98a00':'#1d6a2a',hg=Y?'#ffe58a':'#4fc35f';
  s.path(Array.from({length:23},(_,j)=>{const v=TAU*j/22;return A([ax*.9*Math.cos(v),ay*.88*Math.sin(v),.003])}),Y?'#8a5a00':'#2f8f3f',1.6,[],z+.02);
  const cs=[[-.5,.02],[-.1,-.03],[.3,.03]];cs.forEach(([x,y],k)=>{for(let i=0;i<5;i++){const cx=x*ax,cy=(y+(i-2)*.11)*ay*1.35,w=.13*sc,h=.028*sc;s.poly([A([cx-w,cy-h*.6,.004]),A([cx-w*.9,cy+h,.004]),A([cx+w*.9,cy+h,.004]),A([cx+w,cy-h*.6,.004])],i%2?dk:hg,{cull:false,shade:false,stroke:'#0f3d17',lw:.8,z:z+.03})}});
  s.path([A([-.5*ax+.1*sc,.0,.004]),A([-.1*ax-.1*sc,-.02*ay,.004]),A([-.1*ax+.1*sc,-.02*ay,.004]),A([.3*ax-.1*sc,.03*ay,.004])],Y?'#c79200':'#2c9a3d',1.6,[],z+.03);
  s.ball(A([.62*ax,-.05*ay,.01]),.045*sc,'#f4f1e6',{flat:true,lift:.1});s.ball(A([-.78*ax,.3*ay,.01]),.02*sc,'#5c3d12',{flat:true,lift:.1})}
function golgiModel(s,p,sc,rot,hl){const prof=[[0,.012],[.3,.016],[.43,.05],[.42,.016],[.28,-.012],[0,-.012]],Rt=P3.rotator(rot),A=_pl(p,rot);
  for(let k=0;k<5;k++){const r=1-.09*Math.abs(k-2);s.lathe(V.add(p,Rt([0,(k-2)*.085*sc,0])),prof.map(([a,b])=>[a*r*sc,b*sc]),hl?(k%2?'#ffe066':'#ffd43b'):(k%2?'#f6c35e':'#e8a62d'),{segs:12,rot})}
  for(const [x,y,z,r] of[[.5,.12,.1,.045],[.55,-.05,-.1,.04],[-.5,.1,-.15,.04],[.38,-.22,.3,.035]])s.ball(A([x*sc,y*sc,z*sc]),r*sc,hl?'#ffe066':'#f7d58a',{alpha:.85})}
function nucleusModel(s,p,r,hl){const Y=hl?'#ffe066':null;
  s.mesh(p,r*.8,Y?'#ffd43b':BC.nucleus,{alpha:.85,rings:8,segs:12});
  s.mesh(p,r,Y?'#fff3a8':'#a58ce0',{alpha:.3,rings:9,segs:14});
  for(let k=0;k<4;k++){const pts=[];for(let i=0;i<=14;i++){const a=i*.9+k*1.7,b=Math.sin(i*.55+k)*1.1;pts.push(V.add(p,[r*.58*Math.cos(b)*Math.cos(a),r*.58*Math.sin(b),r*.58*Math.cos(b)*Math.sin(a)]))}s.tube(pts,r*.035,'#2a1a6e',{segs:5})}
  s.ball(V.add(p,[r*.12,r*.2,r*.28]),r*.24,BC.nucleolus,{lift:.2});
  for(let i=0;i<16;i++){const a=i*2.4,b=Math.asin(((i*.618)%1)*1.7-.85);s.ball(V.add(p,[r*1.01*Math.cos(b)*Math.cos(a),r*1.01*Math.sin(b),r*1.01*Math.cos(b)*Math.sin(a)]),r*.05,'#1c1245',{flat:true,lift:.15})}}
function rerModel(s,p,sc,hl){const Y=hl?'#ffe066':null;
  for(let k=0;k<4;k++){const q=V.add(p,[(k%2)*.06*sc,(k-1.5)*.1*sc,0]);s.mesh(q,[(.5-.03*k)*sc,.03*sc,.27*sc],Y||(k%2?'#7fb8e6':BC.er),{rings:4,segs:12,shape:(u,v)=>1+.12*Math.sin(5*v+k*2)*Math.cos(u)});
    for(let i=0;i<7;i++){const a=hash(i+k*9)*TAU,m=Math.sqrt(hash(i+k*9+40))*.8;s.ball(V.add(q,[Math.cos(a)*m*.5*sc,.04*sc,Math.sin(a)*m*.27*sc]),.02*sc,Y?'#fff3a8':'#3a2d6b',{flat:true})}}
  s.tube([V.add(p,[-.5*sc,-.05*sc,.1*sc]),V.add(p,[-.7*sc,0,.25*sc]),V.add(p,[-.85*sc,.1*sc,.1*sc])],.03*sc,Y||'#8ec5ee',{segs:6})}
/* Labels in two tidy columns (left/right of the cell), sorted by height so leader lines never cross or stack. */
const cellLabels=(s,items,hi,xl,xr)=>{const col=[[],[]],k=window.PhysicaTextScale||1;for(const it of items)col[(it[4]||(s.P(it[1])[0]<348?'L':'R'))==='L'?0:1].push(it);
  [xl,xr].forEach((x,j)=>{const a=col[j].sort((m,n)=>s.P(m[1])[1]-s.P(n[1])[1]),n=a.length,g=n>1?Math.min(44,250/(n-1)):0,y0=262-g*(n-1)/2;a.forEach((it,i)=>{const Q=s.P(it[1]);s.callout(it[1],it[2],hi(it[0])?'#ffe066':(it[3]||'#dbe7f0'),(x-Q[0])/k,(y0+g*i-Q[1])/k,hi(it[0])?13:11)})})};
/*END cellkit*/
add({...ch(8,'Cell: The Unit of Life',U3),id:'bio-cell-explorer',title:'Cell explorer',
 description:'Fly around an animal or plant cell and highlight each organelle to learn its structure and job.',
 formula:'Eukaryotic cell = plasma membrane + cytoplasm + membrane-bound organelles + nucleus',
 observe:'Plant cells have a cell wall, chloroplasts and a large central vacuole; animal cells have centrioles.',
 tryText:'Select chloroplast while viewing an animal cell — what happens?',
 controls:[S('type','Cell','plant',[['plant','Plant cell'],['animal','Animal cell']]),S('org','Highlight organelle','mito',Object.keys(ORG).map(k=>[k,{nucleus:'Nucleus',mito:'Mitochondrion',chloro:'Chloroplast',er:'Endoplasmic reticulum',golgi:'Golgi apparatus',ribo:'Ribosomes',vacuole:'Vacuole',lyso:'Lysosome',centro:'Centrosome',wall:'Cell wall'}[k]]))],
 metrics:p=>{const d=ORG[p.org],present=!(p.type==='animal'&&(p.org==='chloro'||p.org==='wall'))&&!(p.type==='plant'&&p.org==='centro');return[N('Present in this cell?',present?'Yes':'No'),N('Structure',d[0]),N('Found in',d[1]),N('Function',d[2])]},
/*BEGIN celldraw*/
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:48,cy:252,yaw:.2}),pl=p.type==='plant',hi=k=>p.org===k,Y='#ffe066',g=(k,col)=>hi(k)?Y:col,items=[];
  const sq=_sq(6);
  if(pl){
    s.box([0,0,0],[4.7,3,3],g('wall','#69db7c'),{alpha:hi('wall')?.4:.1,stroke:'#8fe36a'});s.box([0,0,0],[4.45,2.75,2.75],g('wall','#a9e34b'),{alpha:hi('wall')?.4:.07,stroke:'#c4f08a'});
    s.mesh([0,0,0],[2.12,1.3,1.3],BC.membrane,{alpha:.13,rings:10,segs:16,shape:sq});
    s.mesh([.9,0,0],[.98,.62,.62],g('vacuole','#9ad1f0'),{alpha:hi('vacuole')?.5:.22,rings:9,segs:14,shape:(u,v)=>1+.05*Math.sin(3*v+u)});
    s.mesh([.9,0,0],[.9,.55,.55],'#d3efff',{alpha:.2,rings:6,segs:10});
    const CH=[[.2,.98,.5,.25],[1.6,.95,-.2,-.35],[1.6,-.95,.3,.5],[-.3,-.98,-.5,.2]];CH.forEach((q,i)=>chloroModel(s,[q[0],q[1],q[2]],2,[0,q[3],.15*(i%2?1:-1)],hi('chloro')));
    items.push(['chloro',[1.6,.95,-.2],'chloroplast (grana)',null,'R'],['wall',[2.3,.7,1.5],'cell wall (cellulose)',null,'R'],['vacuole',[1.2,.1,.5],'vacuole (tonoplast)',null,'R'],['membrane',[0,1.3,.9],'plasma membrane','#f2a7b5','L']);
  }else{
    const sh=(u,v)=>1+.05*Math.sin(3*v+u*2);
    s.mesh([0,0,0],[2.25,1.65,1.65],BC.membrane,{alpha:.2,shape:sh,rings:10,segs:16});s.mesh([0,0,0],[2.15,1.55,1.55],BC.cytoplasm,{alpha:.1,shape:sh,rings:6,segs:10});
    const cA=[.35,-.1,.95],pa=[1,0,0];s.cyl(cA,[1,0,0],.075,.34,g('centro','#ced4da'),{seg:9,cap:g('centro','#e9ecef')});s.cyl([cA[0]+.1,cA[1]+.1,cA[2]+.18],[0,0,1],.075,.34,g('centro','#ced4da'),{seg:9,cap:g('centro','#e9ecef')});
    for(let i=0;i<4;i++){const q=[[-1.55,.8,.35],[1.6,.25,.55],[.6,-1.2,.1],[-.2,1.1,.5]][i];s.ball(q,.14,g('lyso','#e599f7'),{});for(let j=0;j<4;j++)s.ball(V.add(q,[.07*Math.cos(j*1.6),.07*Math.sin(j*1.6),.1]),.02,'#6f2da8',{flat:true,lift:.2})}
    [[1.2,-.55,.4,.15],[.4,1.0,-.6,.1],[.1,-1.0,.55,.12],[1.5,.2,-.6,.1]].forEach((q,i)=>mitoModel(s,[q[0],q[1],q[2]],2.1,[0,q[3],.3],hi('mito')));
    items.push(['centro',cA,'centrosome (2 centrioles)',null,'R'],['lyso',[1.6,.25,.55],'lysosome',null,'R'],['membrane',[0,1.62,.4],'plasma membrane','#f2a7b5','L']);
  }
  const nx=pl?-1.3:-.5,ny=pl?.15:.2,np=[nx,ny,0],nr=pl?.75:.8;nucleusModel(s,np,nr,hi('nucleus'));
  rerModel(s,pl?[-.3,.5,.1]:[.55,.5,-.2],pl?1.3:1.25,hi('er'));
  const gp=pl?[.55,-.55,1.0]:[-1.25,-.65,.45];golgiModel(s,gp,pl?1.3:1.4,[0,0,pl?.2:-.5],hi('golgi'));
  if(pl)[[-1.0,-.85,.85,.15],[-.55,.98,-.55,.1]].forEach((q,i)=>mitoModel(s,[q[0],q[1],q[2]],2.1,[0,q[3],.3],hi('mito')));
  for(let i=0;i<46;i++)s.ball([(hash(i)-.5)*3.6,(hash(i+40)-.5)*2.2,(hash(i+80)-.5)*2.2].map((v,k)=>v*(pl?.8:.78)),.03,g('ribo',BC.ribosome),{flat:true});
  const mp=pl?[-.95,-.9,.8]:[1.2,-.55,.4],rp=[(hash(3)-.5)*3.6*.8,(hash(43)-.5)*2.2*.8,(hash(83)-.5)*2.2*.8];
  items.push(['nucleus',[nx-.3,ny+.55,.3],'nucleus (with pores)',null,'L'],['nucleolus',[nx+.07,ny+.15,nr*.28],'nucleolus','#c9b6ff','L'],['mito',mp,'mitochondrion (cristae)',null,pl?'L':'R'],['er',pl?[-.3,.5,.1]:[.55,.5,-.2],'rough ER (ribosomes)',null,pl?'L':'R'],['golgi',[gp[0],gp[1]+.1,gp[2]],'Golgi apparatus',null,pl?'R':'L'],['ribo',rp,'ribosomes',null,'R']);
  const keep=items.filter(it=>it[0]!=='nucleolus'||true);cellLabels(s,keep,hi,216,484);
  s.render();
  tag(c,'yellow: highlighted organelle',44,98,'#ffe066',13)},
/*END celldraw*/
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
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:62,pitch:.16,cy:262}),jig=.02+p.temp*.0025,NX=19,X0=-3.2,DX=.35,IX=-1.5,PX=1.5,show=p.show==='yes';
  for(let i=0;i<NX;i++)for(let j=0;j<2;j++){const bx=X0+i*DX,z=-.2+j*.4;if(show&&Math.abs(bx-IX)<.42)continue;const x=bx+Math.sin(t*2+i*3+j)*jig*1,w=Math.sin(t*5+i+j*2)*jig*2;
   for(const sg of[1,-1]){s.ball([x,sg*.62,z],.14,'#ff8787');s.seg([x-.05,sg*.5,z],[x-.07+w,sg*.12,z],'#ffd43b',2.4);s.seg([x+.05,sg*.5,z],[x+.09,sg*.32,z],'#ffd43b',2.4);s.seg([x+.09,sg*.32,z],[x+.05-w,sg*.12,z],'#ffd43b',2.4)}}
  if(show){/* integral glycoprotein spanning the bilayer, sugar chain outside */
   s.mesh([IX,0,0],[.38,.98,.34],'#5c7cfa',{shape:(u,v)=>1+.08*Math.sin(4*v)});s.mesh([IX,0,0],[.2,.9,.2],'#748ffc',{});
   for(let k=0;k<5;k++){const q=[IX+.08*Math.sin(k*1.4)+.12*k*.5,1.05+.1*k,.05*k];s.ball(q,.07,'#69db7c',{flat:true});if(k)s.seg([IX+.08*Math.sin((k-1)*1.4)+.12*(k-1)*.5,1.05+.1*(k-1),.05*(k-1)],q,'#69db7c',1.6)}
   /* peripheral protein on the inner surface */
   s.mesh([PX,.95,0],[.5,.28,.4],'#b197fc',{});
   s.callout([IX+.3,1.25,0],'integral protein (glycoprotein)','#91a7ff',-40,-40);s.callout([PX+.3,1.0,0],'peripheral protein','#d0bfff',50,-30)}
  s.callout([2.9,-.66,.2],'polar head (hydrophilic)','#ff8787',-20,50);s.callout([1.9,-.3,.2],'fatty-acid tails (hydrophobic)','#ffd43b',-60,60);
  s.label([-3.3,1.6,0],'outside the cell',C.muted,12,'left');s.label([-3.3,-1.5,0],'cytoplasm',C.muted,12,'left');s.render();tag(c,'red: polar heads   yellow: fatty-acid tails',44,98,C.muted,13)},
 assumption:'Molecules not to scale; cholesterol and carbohydrate chains simplified.'});

const RQ=[0,.28,.52,.72,.86,.95,1],RA=32,RT=[],RC=['#f58a8a','#ee6a6a','#e44a4a','#d93636','#cc2a2a','#bf2424'];
for(let i=0;i<RA;i++)RT.push([Math.cos(TAU*i/RA),Math.sin(TAU*i/RA)]);
/* Human RBC: biconcave disc, Evans–Fung profile, R = 3.5 µm; axis tilted so the dimple shows. */
function rbcDisc(s,p,su,a){const R=3.5*su,ca=Math.cos(a),sa=Math.sin(a),Y=q=>.5*R*Math.sqrt(Math.max(0,1-q*q))*(.207+2.003*q*q-1.123*q**4),
 pt=(q,k,sg)=>{const r=R*q,x=r*RT[k][0],y=sg*Y(q),z=r*RT[k][1];return[p[0]+x,p[1]+y*ca-z*sa,p[2]+y*sa+z*ca]},
 nm=(q,k,sg)=>{const h=.002,d=(Y(Math.min(1,q+h))-Y(Math.max(0,q-h)))/(R*2*h),nx=-sg*d*RT[k][0],ny=sg,nz=-sg*d*RT[k][1];return[nx,ny*ca-nz*sa,ny*sa+nz*ca]};
 for(const sg of[1,-1])for(let i=0;i<RQ.length-1;i++)for(let k=0;k<RA;k++){const k2=(k+1)%RA,qm=(RQ[i]+RQ[i+1])/2;s.poly(sg>0?[pt(RQ[i],k,sg),pt(RQ[i],k2,sg),pt(RQ[i+1],k2,sg),pt(RQ[i+1],k,sg)]:[pt(RQ[i],k,sg),pt(RQ[i+1],k,sg),pt(RQ[i+1],k2,sg),pt(RQ[i],k2,sg)],RC[i],{normal:nm(qm,k,sg),cull:false,spec:.35})}}
const SIZES=[['Mycoplasma (smallest cell)',.3,'#82c91e'],['Bacterium',4,'#94d82d'],['Human RBC',7,'#e03131']];
add({...ch(8,'Cell: The Unit of Life',U3),id:'bio-cell-sizes',title:'How big are cells?',
 description:'Compare the smallest cells (Mycoplasma), bacteria and a human red blood cell, drawn to the same scale.',
 formula:'1 μm = 10⁻⁶ m',
 observe:'Mycoplasma is only about 0.3 μm long, bacteria 3–5 μm and a human RBC about 7 μm across.',
 tryText:'Zoom out: how many Mycoplasma cells would fit across one RBC?',
 controls:[R('zoom','Zoom (μm across view)',1,20,.5,10,'μm',1)],
 metrics:p=>[N('Mycoplasma',.3,'μm',1),N('Bacteria','3–5 μm'),N('Human RBC',7,'μm',1),N('RBC ÷ Mycoplasma',7/.3,'×',0),N('Largest isolated cell','Ostrich egg')],
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:56,pitch:.25}),su=6/p.zoom,gap=.35,W=.3*su+4*su+7*su+2*gap,x0=-W/2;s.ball([x0+.15*su,0,0],Math.max(.02,.15*su),'#82c91e');const bx=x0+.3*su+gap;capsule(s,[bx+.5*su,0,0],[bx+3.5*su,0,0],.5*su,'#94d82d',{segs:24});
  rbcDisc(s,[bx+4*su+gap+3.5*su,0,0],su,PI/2-.5);s.render();
  const pxPerUm=Math.hypot(s.P([su,0,0])[0]-s.P([0,0,0])[0],s.P([su,0,0])[1]-s.P([0,0,0])[1]);c.save();c.strokeStyle='#e9f6ff';c.lineWidth=2;c.beginPath();c.moveTo(80,400);c.lineTo(80+pxPerUm,400);c.stroke();c.restore();tag(c,'1 μm',80+pxPerUm/2,388,C.white,12,'center');tag(c,'left: Mycoplasma · centre: bacterium · right: RBC',44,98,C.muted,13)},
 assumption:'Sizes from NCERT Chapter 8; the RBC is drawn as a flattened disc and the bacterium as a 4 μm rod.'});

/* ---------- Chapter 9: Biomolecules ---------- */
add({...ch(9,'Biomolecules',U3),id:'bio-enzyme-kinetics',title:'Enzyme action and competitive inhibition',
 description:'Raise the substrate concentration and see the reaction rate level off. Add a competitive inhibitor and compare.',
 formula:'v = V_max[S] / (K_m + [S]) ;  competitive: K_m(app) = K_m(1 + [I]/K_i)',
 observe:'A competitive inhibitor resembles the substrate and competes for the active site; enough substrate can outcompete it.',
 tryText:'Add inhibitor, then raise [S] a lot. Does V_max change?',
 controls:[R('S','Substrate concentration [S]',0,50,.5,10,'mM',1),R('Km','Michaelis constant K_m',1,20,.5,5,'mM',1),R('Vmax','Maximum rate V_max',10,100,5,60,'μmol/min'),R('I','Competitive inhibitor [I]',0,20,.5,0,'mM',1)],
 metrics:p=>{const Ka=p.Km*(1+p.I/2),v=p.Vmax*p.S/(Ka+p.S);return[N('Reaction rate v',v,'μmol/min',1),N('Fraction of V_max',v/p.Vmax*100,'%',0),N('Apparent K_m',Ka,'mM',1),N('Example','Malonate inhibits succinic dehydrogenase')]},
 draw:(c,p,t)=>{const Ka=p.Km*(1+p.I/2),v=p.Vmax*p.S/(Ka+p.S),s=P3.scene(c,{scale:52,cx:225,cy:262}),ph=cycle(t*v/p.Vmax*1.2+.1,1);s.mesh([0,-.25,0],[1.5,.85,.85],'#5c7cfa',{rings:12,segs:20,spec:.5});s.mesh([-.88,.35,0],[.62,.75,.72],'#748ffc',{rings:10,segs:16,spec:.5});s.mesh([.88,.35,0],[.62,.75,.72],'#748ffc',{rings:10,segs:16,spec:.5});
  const occ=p.I>0&&hash(Math.floor(t))<p.I/(p.I+p.S+1e-9);s.ball([0,.95-(occ?0:.3*Math.min(1,ph*3)),.2],.22,occ?'#fa5252':'#ffd43b');if(!occ&&ph>.5){s.ball([.6+ph,1.3+ph*.6,.2],.15,'#69db7c');s.ball([-.6-ph,1.3+ph*.6,.2],.15,'#69db7c')}
  for(let i=0;i<Math.min(24,Math.round(p.S/2));i++)s.ball([-2.2+hash(i)*4.4,-1.2+hash(i+5)*2.6,-1+hash(i+9)*.6],.12,'#ffd43b');for(let i=0;i<Math.round(p.I/2);i++)s.ball([-2.2+hash(i+50)*4.4,-1.2+hash(i+55)*2.6,-1+hash(i+59)*.6],.12,'#fa5252');s.part([-.8,-.5,.6],'enzyme','#91a7ff',12,[0,.6,0]);s.callout([0,.6,.3],'active site','#ffe066',-70,-55);s.callout([0,.95-(occ?0:.3*Math.min(1,ph*3)),.42],occ?'inhibitor blocks the site':'substrate binds (E–S complex)',occ?'#ff8787':'#ffd43b',70,-60);s.render();
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
 draw:(c,p,t)=>{const a=enzAct(p),s=P3.scene(c,{scale:52,cx:215,cy:262});if(p.T>50)s.tube(Array.from({length:60},(_,i)=>[1.2*Math.sin(i*.21+t*.5)+.35*Math.sin(i*.63+t*.7),(i-30)*.045+.3*Math.sin(i*.37+t),.5*Math.cos(i*.29+t*.4)]),.07,'#748ffc',{segs:8});
  else{s.mesh([0,-.25,0],[1.5,.85,.85],'#5c7cfa',{rings:12,segs:20,spec:.5});s.mesh([-.88,.35,0],[.62,.75,.72],'#748ffc',{rings:10,segs:16,spec:.5});s.mesh([.88,.35,0],[.62,.75,.72],'#748ffc',{rings:10,segs:16,spec:.5})}
  for(let i=0;i<Math.round(a*8);i++){const q=cycle(t*.6+i/8,1);s.ball([1.2+q*1.4,.4+.3*Math.sin(i),.2],.12,'#69db7c')}s.part([-.7,-.6,.5],p.T>50?'enzyme denatured (shape lost)':p.T<10?'enzyme inactive (cold)':'enzyme (protein)','#91a7ff',12,[0,0,0]);if(p.T<=50)s.callout([0,.7,.3],'active site','#ffe066',-60,-55);if(a>.05)s.callout([1.9,.45,.2],'products formed','#69db7c',40,-50);s.render();
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
  if(p.lvl==='primary'){for(let i=0;i<20;i++){const x=-3+i*.32;s.ball([x,.2*Math.sin(i*.8),0],.14,cols[i%6]);if(i)s.seg([x-.32,.2*Math.sin((i-1)*.8),0],[x,.2*Math.sin(i*.8),0],'#dee2e6',2)}s.callout([-3,0,0],'N-terminal (–NH₂)',C.white,-10,-55);s.callout([3.08,.2*Math.sin(19*.8),0],'C-terminal (–COOH)',C.white,-10,55);s.callout([-1.24,.2*Math.sin(4*.8)+.07,0],'peptide bond','#dee2e6',30,-60);s.callout([-.4,.2*Math.sin(8*.8),0],'amino acid','#4dabf7',40,55)}
  else if(p.lvl==='secondary'){const pts=Array.from({length:120},(_,i)=>[-2.6+i*.045,.45*Math.cos(i*.42),.45*Math.sin(i*.42)]);s.tube(pts,.1,'#ff8787',{segs:8});for(let i=0;i<120;i+=6)s.ball(pts[i],.07,cols[(i/6)%6],{flat:true});s.callout(pts[30],'α-helix (right-handed)','#ff8787',40,-60);s.callout(pts[70],'H-bonds hold each turn','#dee2e6',40,60)}
  else{const blob=(o,col,seed)=>{const pts=[];for(let i=0;i<160;i++){const a=i*.21+seed,b=i*.083+seed*2;pts.push(V.add(o,[.75*Math.sin(b)*Math.cos(a),.75*Math.cos(b),.75*Math.sin(b)*Math.sin(a)]))}s.tube(pts,.09,col,{segs:6})};if(p.lvl==='tertiary'){blob([0,0,0],'#ff8787',0);s.callout([.7,.2,.2],'3D globular fold (tertiary)','#ff8787',50,-60)}else{blob([-.8,.8,0],'#ff8787',0);blob([.8,.8,0],'#ff8787',1);blob([-.8,-.8,0],'#74c0fc',2);blob([.8,-.8,0],'#74c0fc',3);for(const q of[[-.8,.8,.5],[.8,.8,.5],[-.8,-.8,.5],[.8,-.8,.5]])s.ball(q,.12,'#e03131',{glow:true,lift:2});s.callout([-1.5,1.2,0],'α subunits (×2)','#ff8787',-30,-40);s.callout([-1.5,-1.2,0],'β subunits (×2)','#74c0fc',-30,40);s.callout([.8,.8,.5],'haem group (Fe²⁺)','#e03131',60,-50)}}s.render()},
 assumption:'Schematic backbone; side chains are shown as coloured beads. Red discs in haemoglobin mark the haem groups.'});

/* ---------- Chapter 10: Cell Cycle and Cell Division ---------- */
const MIT=[['Interphase (G₂)','Chromosomes not visible; DNA already doubled'],['Prophase','Chromatin condenses into chromosomes; spindle begins to form'],['Metaphase','Chromosomes line up at the metaphase plate'],['Anaphase','Centromeres split; sister chromatids move to opposite poles'],['Telophase','Nuclear envelopes reform around two sets of chromosomes'],['Cytokinesis','Cytoplasm divides into two daughter cells']];
// One chromatid: a rod bent at its centromere (constriction), rounded ends. dA/dB are the unit directions of the two arms.
const chromatid=(s,C,dA,dB,La,Lb,r,col)=>{const m=V.add(C,V.mul(dA,La*.5)),m2=V.add(C,V.mul(dB,Lb*.5)),e1=V.add(C,V.mul(dA,La)),e2=V.add(C,V.mul(dB,Lb));
  s.tube([e1,m,C,m2,e2],u=>r*(1-.38*Math.exp(-(((u-La/(La+Lb))/.1)**2))),col,{segs:7,spec:.55});s.ball(e1,r*.97,col,{flat:true});s.ball(e2,r*.97,col,{flat:true})};
// Centrosome: a pair of centrioles at right angles (each a short cylinder of nine microtubule triplets) in a faint pericentriolar glow.
const centrosome=(s,p,ax)=>{const pp=[-ax[1],ax[0],0];s.ball(p,.22,'#ffe066',{alpha:.2,flat:true});s.cyl(V.add(p,V.mul(pp,.07)),ax,.055,.27,'#f1f3f5',{seg:9});s.cyl(V.add(p,V.mul(ax,-.04)),pp,.055,.25,'#ced4da',{seg:9,caps:false})};
const mix=(a,b,k)=>V.add(V.mul(a,1-k),V.mul(b,k));add({...ch(10,'Cell Cycle and Cell Division',U3),id:'bio-mitosis',title:'Mitosis, stage by stage',
 description:'Watch the chromosomes of an animal cell condense, line up, separate and form two identical nuclei.',
 formula:'2n → 2n + 2n (equational division)',
 observe:'Each daughter cell receives an exact copy of the parent’s chromosomes.',
 tryText:'Pause at metaphase and rotate the view to see the plate edge-on.',
 controls:[R('n','Chromosome number 2n (shown)',2,8,2,4),R('speed','Speed of division',.2,2,.1,1,'×',1)],
 metrics:(p,t)=>{const k=Math.floor(cycle(t*p.speed,18)/3);return[N('Phase',MIT[k][0]),N('Key event',MIT[k][1]),N('Chromosomes per daughter cell',p.n+' (2n)'),N('Human somatic cells','2n = 46')]},
 draw:(c,p,t)=>{const T=cycle(t*p.speed,18),k=Math.floor(T/3),f2=(T%3)/3,s=P3.scene(c,{scale:66}),split=k===5?f2:k>5?1:0,n=p.n,X=[1,0,0],sm=smooth,thr=(k===4&&f2>.5)||k===5;
  // cell: translucent membrane that pinches at the equator during cytokinesis, with a few mitochondria for scale and context
  s.mesh([0,0,0],[2.4+.5*split,1.5,1.5],BC.membrane,{alpha:.17,rings:12,segs:20,shape:(u,v)=>1-.6*split*Math.exp(-((Math.cos(v)*Math.cos(u))**2)*12)});
  if(split<.6)for(const m of[[-1.6,-.95,.5,.3],[1.55,.95,-.6,-.4],[-1.3,1.0,.4,.5],[1.7,-.9,.5,-.2]])s.mesh([m[0],m[1],m[2]],[.22,.085,.085],BC.mito,{rings:6,segs:9,rot:[0,0,m[3]],spec:.5});
  const poleX=k<4?2.1:2.2,cenA=mix([.95,.62,.5],[-poleX,0,0],k===0?0:k===1?sm(f2):1),cenB=mix([1.12,.45,.6],[poleX,0,0],k===0?0:k===1?sm(f2):1);
  centrosome(s,cenA,k<2&&f2<.4?[0,1,0]:X);centrosome(s,cenB,k<2&&f2<.4?[0,1,0]:X);
  // nucleus and nuclear envelope: intact in interphase, breaks down in late prophase, re-forms around each daughter set in telophase
  const nuc=(q,r,al)=>{s.mesh(q,r,BC.nucleus,{alpha:al,rings:9,segs:14,spec:.3});};
  if(k===0)nuc([0,0,0],.98,.3);
  if(k===1){const e=sm(Math.max(0,(f2-.4)/.6));if(e<.98)nuc([0,0,0],.98+.25*e,.3*(1-e));if(f2>.4)for(let j=0;j<10;j++){const a=TAU*j/10*1.7,b=hash(j+3)*PI-PI/2,R=.98+.3*e;s.mesh([R*Math.cos(b)*Math.cos(a),R*Math.sin(b),R*Math.cos(b)*Math.sin(a)],[.14,.05,.14],"#9b82e0",{alpha:.4*(1-.5*e),rings:4,segs:7})}}
  if(k===0||(k===1&&f2<.5))s.ball([.1,.15,.25],.14*(k===1?1-f2*2:1),BC.nucleolus,{lift:.3});
  if(k>=4)for(const sg of[-1,1])nuc([sg*(1.6+(k===4?.12*f2:.12)+.45*split),0,0],.86,k===4?.08+.24*f2:.3);
  if(k===4&&f2>.4)for(const sg of[-1,1])s.ball([sg*(1.72+.45*split)+0,.1,.2],.1*Math.min(1,(f2-.4)*3),BC.nucleolus,{lift:.3});
  if(k===5)for(const sg of[-1,1])s.ball([sg*(1.84+.45*split),.1,.2],.1,BC.nucleolus,{lift:.3});
  // spindle: pole-to-pole fibres, astral rays and (below) kinetochore fibres
  const grow=k===0?0:k===1?sm(Math.max(0,(f2-.3)/.7)):k<=3?1:0;
  if(grow>0){for(let j=0;j<6;j++){const ph=TAU*j/6+.4,pts=[];for(let i=0;i<=6;i++){const u=i/6;pts.push([-poleX+2*poleX*u,.82*grow*Math.sin(PI*u)*Math.cos(ph),.82*grow*Math.sin(PI*u)*Math.sin(ph)])}s.path(pts,'#aab8c6',1.3)}
   for(let j=0;j<7;j++){const ph=TAU*j/7+.2,cp=Math.cos(ph),sp=Math.sin(ph);for(const sg of[-1,1])s.seg([sg*poleX,0,0],[sg*(poleX+.5*grow),.55*grow*cp,.55*grow*sp],'#9fb0c0',1)}}
  if(k===4&&f2<.9)for(let j=0;j<5;j++){const ph=TAU*j/5,y=.35*Math.cos(ph),z=.35*Math.sin(ph);s.seg([-poleX+.5,y,z],[poleX-.5,y,z],'#aab8c6',1.2)}
  if(k===5)for(let j=0;j<3;j++){const ph=TAU*j/3,y=.2*Math.cos(ph),z=.2*Math.sin(ph);s.seg([-.7,y,z],[.7,y,z],'#aab8c6',1)}
  // contractile ring in the cleavage furrow (animal cell)
  if(k===5)s.ring([0,0,0],X,1.5*(1-.6*split)*.97,'#f06595',3,[],40);
  // metaphase plate disc (guide)
  if(k===2&&f2>.5){const pl=[];for(let j=0;j<18;j++){const a=TAU*j/18;pl.push([0,1.1*Math.cos(a),1.1*Math.sin(a)])}s.poly(pl,'#e9f6ff',{alpha:.07,cull:false,shade:false})}
  // chromosomes: each is two sister chromatids joined at the centromere (kinetochore on the pole-facing side)
  const cols=['#ff6b6b','#4dabf7','#ffd43b','#69db7c','#9775fa','#f783ac','#ffa94d','#38d9a9'],cen=[];
  for(let i=0;i<n;i++){const col=cols[i%cols.length],Lc=(.42+.09*(i%(n/2)))*1.15,ah=hash(i+60)*TAU,home=[(hash(i)-.5)*1.1,(hash(i+20)-.5)*1.1,(hash(i+40)-.5)*.8],rho=.3+.55*Math.sqrt((i+.5)/n),ph=i*2.4+.5,plate=[0,rho*Math.cos(ph),rho*Math.sin(ph)];
   if(k===0&&true){const pts=[];for(let j=0;j<11;j++)pts.push(V.add(home,[.2*Math.sin(j+i)+(j-5)*.04,.2*Math.cos(j*1.3+i),.15*Math.sin(j*.9+i*2)]));s.path(pts,col+'cc',1.6);continue}
   if(thr){for(const sg of[-1,1]){const base=[sg*(1.72+.45*split),0,0],pts=[];for(let j=0;j<11;j++)pts.push(V.add(base,[.18*Math.sin(j+i)+(j-5)*.03,(hash(i+20)-.5)*.9+.18*Math.cos(j*1.3+i),(hash(i+40)-.5)*.6+.14*Math.sin(j*.9+i*2)]));s.path(pts,col+'cc',1.6)}continue}
   let pos=home,ang=ah,a=1,b=0,tl=.05,XO=0,rs=1,y=1;
   if(k===1){a=.35+.65*sm(f2)}
   else if(k===2){const g=sm(Math.min(1,f2*2));pos=mix(home,plate,g);ang=ah+(ph-ah)*g;tl=.05+.23*g}
   else{const sep=k===3?sm(f2):1;pos=plate;ang=ph;b=Math.min(1,k===3?f2*3:1);XO=k===3?1.56*sep:1.56+.12*f2*(k===4);y=1-.3*sep;if(k===4){rs=1-.5*f2;a=1-.2*f2}}
   const u=[0,Math.cos(ang),Math.sin(ang)],C0=[0,pos[1]*y,pos[2]*y];if(k<=2)C0[0]=pos[0];
   for(const sg of[-1,1]){const C=V.add(C0,[sg*(.035+XO),0,0]),dA=V.norm(V.add(u,[sg*(tl*(1-b)-.9*b),0,0])),dB=V.norm(V.add(V.mul(u,-1),[sg*(-tl*(1-b)-.9*b),0,0]));
    chromatid(s,C,dA,dB,.55*Lc*a,.45*Lc*a,.08*rs,col);
    if(k>=1&&!(k===1&&f2<.5)){const K=V.add(C,[sg*.075,0,0]);s.ball(K,.05,'#3b1f2b',{flat:true,lift:.5});if(k>=2&&!(k===4&&f2>.3))s.seg([sg*poleX,0,0],K,'#cdd6df',1.3)}}
   if(i===0)cen.push(C0)}
  const L0=cen[0]||[0,0,0],LB=(q,txt,col,dx,dy)=>s.callout(q,txt,col,dx,dy);
  if(k===0){LB([.5,.5,.5],'nucleus: chromatin (DNA already doubled)','#c9b6ff',60,-60);LB([2.3,.4,0],'cell membrane','#f2a7b5',30,50);LB(cenA,'centrosome','#ffe066',-40,-50)}
  if(k===1){LB(L0,'chromosome condenses: 2 sister chromatids','#ff8787',-60,-60);LB(cenB,'centriole (spindle pole)','#ced4da',30,-60)}
  if(k===2){LB([0,0,0],'metaphase plate','#e9f6ff',-80,60);LB([1.2,.45,0],'spindle fibres','#adb5bd',60,-60);LB(V.add(L0,[.075,0,0]),'centromere (kinetochore)','#e9f6ff',60,-40)}
  if(k===3)LB([1.6*sm(f2),.5,0],'sister chromatids pulled to poles','#ffd43b',60,60);
  if(k===4)LB([1.7,.75,0],'nuclear envelope re-forms','#c9b6ff',60,-50);
  if(k===5)LB([0,1.2*(1-.5*split),.6],'cleavage furrow (cytokinesis)','#f2a7b5',60,-50);
  s.render();tag(c,MIT[k][0],44,98,C.gold,16)}, assumption:'Animal cell, small chromosome number for clarity; time compressed — a human cell spends only about 1 h of a 24 h cycle in M phase.'});

const MEI=[['Prophase I','Homologous chromosomes pair (synapsis) and cross over'],['Metaphase I','Bivalents line up at the equator'],['Anaphase I','Homologous chromosomes separate (chromatids stay together)'],['Telophase I','Two haploid cells, each chromosome still with two chromatids'],['Meiosis II','Sister chromatids separate, like mitosis'],['Result','Four haploid cells, genetically different']];
// Meiosis: one chromatid is a tube tip -> centromere -> tip. After crossing over the distal part of the lower arm carries the other homologue's colour (c2).
const mChr=(s,C,dT,dB,Lt,Lb,r,c1,c2,tb,warp)=>{const pts=[];for(let j=0;j<=8;j++)pts.push(V.add(C,V.mul(dT,Lt*(1-j/8))));for(let j=1;j<=8;j++)pts.push(V.add(C,V.mul(dB,Lb*j/8)));
  const P=warp?pts.map(warp):pts,ub=.5+.5*tb;s.tube(P,u=>r*(1-.36*Math.exp(-(((u-.5)/.055)**2))),c2?(u=>u>ub?c2:c1):c1,{segs:7,spec:.55});s.ball(P[0],r*.97,c1,{flat:true});s.ball(P[16],r*.97,c2||c1,{flat:true});return P};
const MPR=[{yC:.6,Lt:.42,Lb:.66,c1:'#ff6b6b',c2:'#4dabf7'},{yC:-.62,Lt:.3,Lb:.5,c1:'#ffd43b',c2:'#69db7c'}],MTB=.62,MTOP={'-1':[true,false],'1':[false,true]};
// Meiosis I: one homologue (two sister chromatids). side -1 = left homologue (red / yellow), +1 = right homologue (blue / green).
// xo: how far the two inner (non-sister) chromatids cross over; mix: show the recombinant colours.
const mHom=(s,pr,side,hx,yC,dT,dB,r,xo,mix,otherHx)=>{const q=MPR[pr],c1=side<0?q.c1:q.c2,c2=side<0?q.c2:q.c1,xi=hx-side*.055,xx=hx+side*.055,xt=otherHx+side*.055,ycX=yC-MTB*q.Lb;
  mChr(s,[xx,yC,0],dT,dB,q.Lt,q.Lb,r,c1,null,0);
  const warp=xo>.01?p=>{const w=smooth(Math.max(0,Math.min(1,(ycX+.16-p[1])/.32)))*xo;return[p[0]+(xt-xi)*w,p[1],p[2]+side*.09*Math.exp(-(((p[1]-ycX)/.13)**2))*xo]}:null;
  mChr(s,[xi,yC,0],dT,dB,q.Lt,q.Lb,r,c1,mix?c2:null,MTB,warp);
  const kx=hx+side*.2;s.ball([kx,yC,.02],.055,'#3b1f2b',{flat:true,lift:.5});return kx};
// Meiosis II: horizontal chromosomes on the plate, sisters one above the other, kinetochores facing the poles.
const mSis=(s,pr,side,inner,C,dT,dB,r)=>{const q=MPR[pr];return mChr(s,C,dT,dB,q.Lt,q.Lb,r,side<0?q.c1:q.c2,inner?(side<0?q.c2:q.c1):null,MTB)};
const mSpV=(s,x,g,ph0)=>{if(g<.02)return;for(let j=0;j<5;j++){const ph=TAU*j/5+ph0,pts=[];for(let i=0;i<=6;i++){const u=i/6;pts.push([x+.62*g*Math.sin(PI*u)*Math.cos(ph),-1.25+2.5*u,.62*g*Math.sin(PI*u)*Math.sin(ph)])}s.path(pts,'#aab8c6',1.2)}};
const meiDraw=(c,p,t)=>{const T=cycle(t*p.speed,18),k=Math.floor(T/3),f2=(T%3)/3,s=P3.scene(c,{scale:80}),sm=smooth,X=[1,0,0],pX=2.1,cl=(a,b,v)=>Math.max(a,Math.min(b,v)),mx=(a,b,u)=>V.add(V.mul(a,1-u),V.mul(b,u));
  const split=k===3?sm(f2):k>3?1:0,mem=(q,r)=>s.mesh(q,r,BC.membrane,{alpha:.17,rings:12,segs:20});
  // cell(s): one cell in meiosis I, two after telophase I, four at the end
  if(k<3)mem([0,0,0],[2.4,1.5,1.5]);
  else if(k<5){const cx=k===3?1.05+.7*split:1.75;for(const sg of[-1,1])mem([sg*cx,0,0],[1.3,1.45,1.3])}
  else{const u=sm(f2);for(const sx of[-1,1])for(const sy of[-1,1])mem([sx*1.75,sy*.72*u,0],[1.3-.34*u,1.45-.73*u,1.3-.34*u])}
  // centrosomes + spindle (meiosis I): poles at the ends of the cell
  const sg1=k===0?sm(cl(0,1,(f2-.55)/.45)):k<3?1:k===3?Math.max(0,1-f2*3):0;
  if(k<4){for(const sg of[-1,1])centrosome(s,[sg*pX,0,0],X);
   if(sg1>.02){for(let j=0;j<6;j++){const ph=TAU*j/6+.4,pts=[];for(let i=0;i<=6;i++){const u=i/6;pts.push([-pX+2*pX*u,.8*sg1*Math.sin(PI*u)*Math.cos(ph),.8*sg1*Math.sin(PI*u)*Math.sin(ph)])}s.path(pts,'#aab8c6',1.2)}}}
  if(k===0){const e=sm(cl(0,1,(f2-.7)/.3));if(e<.98)s.mesh([0,0,0],1.4,BC.nucleus,{alpha:.24*(1-e),rings:9,segs:14,spec:.3});if(f2<.4)s.ball([.12,.2,.3],.13*(1-f2/.4),BC.nucleolus,{lift:.3})}
  if(k<4){let r=.062,xo=0,bend=0,mixc=true,sep=0;const ang=[],pos=[];
   if(k===0){const g=sm(cl(0,1,f2/.55)),cond=sm(cl(0,1,f2/.4));r=.032+.03*cond;xo=sm(cl(0,1,(f2-.62)/.3));mixc=xo>.5;
    const S0=[[[-.8,.5],[.8,.35]],[[.6,-.78],[-.72,-.4]]];
    for(let pr=0;pr<2;pr++)for(let h=0;h<2;h++){const sx=S0[pr][h][0],sy=S0[pr][h][1],fx=h?.27:-.27,fy=MPR[pr].yC;pos[pr*2+h]=[fx+(sx-fx)*(1-g),fy+(sy-fy)*(1-g)];ang[pr*2+h]=(hash(pr*2+h+5)-.5)*2.4*(1-g)}}
   else{sep=k===2?sm(f2):k===3?1:0;xo=k===1?1:k===2?1-sm(cl(0,1,f2*3)):0;bend=k===2?.85*sm(cl(0,1,f2*2.5)):k===3?.85*(1-sm(f2)):0;const sh=k===3?.1*split:0;
    for(let pr=0;pr<2;pr++)for(let h=0;h<2;h++){pos[pr*2+h]=[(h?1:-1)*(.27+1.5*sep+sh),MPR[pr].yC];ang[pr*2+h]=0}}
   for(let pr=0;pr<2;pr++){const pa=pos[pr*2],pb=pos[pr*2+1];
    for(let h=0;h<2;h++){const side=h?1:-1,pp=pos[pr*2+h],a=ang[pr*2+h],bx=-side*bend,dT=V.norm([Math.sin(a)+bx,Math.cos(a),0]),dB=V.norm([-Math.sin(a)+bx,-Math.cos(a),0]);
     const kx=mHom(s,pr,side,pp[0],pp[1],dT,dB,r,xo,mixc,h?pa[0]:pb[0]);if(k>=1&&k<=3&&sg1>.05&&!(k===3&&f2>.55))s.seg([side*pX,0,0],[kx,pp[1],.02],'#cdd6df',1.2)}}
   const q0=MPR[0];
   if(k===0&&f2>.35)s.callout([-.27,q0.yC+q0.Lt,0],f2<.6?'homologous pair: 4 chromatids (bivalent)':'bivalent (tetrad)','#e9f6ff',-70,-50);
   if(k===0&&xo>.5)s.callout([0,q0.yC-MTB*q0.Lb,.05],'chiasma: crossing over swaps segments','#ffd43b',90,50);
   if(k===1){s.callout([0,q0.yC-MTB*q0.Lb,.05],'chiasma holds each pair together','#ffd43b',80,60);s.callout([-.27,q0.yC+q0.Lt+.05,0],'bivalents line up on the equator','#e9f6ff',-80,-45)}
   if(k===2)s.callout([-.27-1.5*sep,q0.yC+.35,0],'homologues separate (2n → n)','#e9f6ff',-70,-55);
   if(k===3)s.callout([1.8,q0.yC+.4,0],'two cells; chromosomes still double','#e9f6ff',20,-55);
   if(k===3&&f2>.15)s.ring([0,0,0],X,1.45*(1-.5*split),'#f06595',3,[],40)}
  else{ // meiosis II (k=4) and the four haploid cells (k=5)
   const g=k===4?sm(cl(0,1,f2/.3)):1,sp=k===4?sm(cl(0,1,(f2-.55)/.45)):1,bd=.75*cl(0,1,sp*3)*(1-u5),u5=k===5?sm(f2):0,off=[-.6,.55];
   if(k===4)for(const sg of[-1,1]){const cx=sg*1.75;for(const e of[-1,1])centrosome(s,[cx,e*1.22,0],[0,1,0]);mSpV(s,cx,sm(cl(0,1,(f2-.1)/.3)),sg)}
   for(const side of[-1,1])for(let pr=0;pr<2;pr++)for(const e of[-1,1]){const cx=side*1.75,q=MPR[pr],inner=(MTOP[side][pr]===(e>0)),r=.058-.008*u5,sx=cx+e*.055,sEx=cx+off[pr],sEy=e*(.07+.9*sp);
    const C=[sx+(sEx-sx)*g,q.yC+(sEy-q.yC)*g+(k===5?(e*.72-sEy)*u5:0),0],dT=V.norm(mx([0,1,0],[-1,-e*bd,0],g)),dB=V.norm(mx([0,-1,0],[1,-e*bd,0],g));
    mSis(s,pr,side,inner,C,dT,dB,r);
    if(k===4&&g>.5){const K=[C[0],C[1]+e*.09,.03];s.ball(K,.052,'#3b1f2b',{flat:true,lift:.5});if(f2>.15)s.seg([cx,e*1.22,0],K,'#cdd6df',1.1)}}
   if(k===4)s.callout([-1.75+off[0],.1+.9*sp,0],f2<.55?'sister chromatids line up (metaphase II)':'sister chromatids separate','#e9f6ff',-60,-60);
   if(k===5)s.callout([2.4,.72*u5,0],'4 haploid (n) cells, each different','#f2a7b5',20,-50)}
  s.render();tag(c,MEI[k][0],44,98,C.gold,16)};
add({...ch(10,'Cell Cycle and Cell Division',U3),id:'bio-meiosis',title:'Meiosis and crossing over',
 description:'Follow one diploid cell through meiosis I and II to four haploid cells. Watch crossing over swap segments.',
 formula:'2n → 4 cells of n (reductional division) ;  combinations = 2ⁿ',
 observe:'Crossing over and independent assortment make every gamete genetically unique.',
 tryText:'Increase the haploid number and see how fast the number of possible combinations grows.',
 controls:[R('nh','Haploid number n (for combinations)',1,23,1,23),R('speed','Speed',.2,2,.1,1,'×',1)],
 metrics:(p,t)=>{const k=Math.floor(cycle(t*p.speed,18)/3);return[N('Stage',MEI[k][0]),N('Key event',MEI[k][1]),N('Possible combinations (2ⁿ)',2**p.nh,'',0),N('Chromosome number','2n → n')]},
 draw:(c,p,t)=>meiDraw(c,p,t/*DBG*/),
 assumption:'Two homologous pairs shown (2n = 4); a single crossover drawn on each pair.'});

add({...ch(10,'Cell Cycle and Cell Division',U3),id:'bio-cell-cycle',title:'The cell cycle clock',
 description:'Move round a 24-hour human cell cycle: G₁, S, G₂ and M phase. Watch the DNA content double during S phase.',
 formula:'Interphase (G₁ + S + G₂) ≈ 95% of the cycle ;  M phase ≈ 1 h of 24 h',
 observe:'DNA content doubles from 2C to 4C in S phase, but the chromosome number stays the same until mitosis.',
 tryText:'Drag the clock to the end of S phase. What is the DNA content now?',
 controls:[R('h','Time in cycle',0,24,.1,6,'h',1),R('G1','G₁ duration',6,12,.5,11,'h',1),R('Sd','S duration',5,10,.5,8,'h',1)],
 metrics:p=>{const st=cyclePhase(p);return[N('Phase',st.name),N('DNA content',st.dna),N('Interphase share',(24-1)/24*100,'%',0),N('Event',st.ev)]},
 draw:(c,p,t)=>{const st=cyclePhase(p),s=P3.scene(c,{scale:44,pitch:.12,cx:230,cy:262}),G2=24-1-p.G1-p.Sd,seg=[['G₁',p.G1,'#4dabf7'],['S',p.Sd,'#ff6b6b'],['G₂',G2,'#ffd43b'],['M',1,'#69db7c']];let a0=-PI/2;
  seg.forEach(([n,d,col])=>{const a1=a0+TAU*d/24,pts=[],K=Math.max(3,Math.round(32*d/24));for(let i=0;i<=K;i++){const a=a0+(a1-a0)*i/K;pts.push([2*Math.cos(a),-2*Math.sin(a),0])}s.tube(pts,.22,col,{segs:12});const m=(a0+a1)/2;s.label([2.75*Math.cos(m),-2.75*Math.sin(m),0],n,col,15);a0=a1});
  const a=-PI/2+TAU*p.h/24;s.arrow([0,0,.1],[1.65*Math.cos(a),-1.65*Math.sin(a),.1],C.white,4);s.mesh([0,0,0],.5+.2*st.g,BC.membrane,{alpha:.35,rings:12,segs:20});s.mesh([0,0,0],.24+.06*st.g,BC.nucleus,{rings:10,segs:14});s.render();
  tag(c,`DNA: ${st.dna}`,44,98,C.gold,15)},
 assumption:'Typical 24 h human cell in culture; G₁ and S durations adjustable, M fixed at 1 h, G₂ takes the remainder.'});
function cyclePhase(p){const G2=24-1-p.G1-p.Sd,h=p.h;if(h<p.G1)return{name:'G₁ (gap 1)',dna:'2C',ev:'Cell grows; prepares for DNA replication',g:h/24};if(h<p.G1+p.Sd){const k=(h-p.G1)/p.Sd;return{name:'S (synthesis)',dna:`${f(2+2*k,1)}C (replicating)`,ev:'DNA replicates; centriole duplicates (animal cells)',g:h/24}}if(h<23)return{name:'G₂ (gap 2)',dna:'4C',ev:'Proteins made for mitosis; growth continues',g:h/24};return{name:'M phase (mitosis)',dna:'4C',ev:'Nucleus and cell divide; each daughter cell then has 2C',g:1}}

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
  const n=Math.round(r.rate*14);for(let i=0;i<n;i++){const q=cycle(t*(.3+r.rate)+i/n,1);s.ball([(hash(i)-.5)*.6,-.5+q*.9,(hash(i+4)-.5)*.4],.05+.02*hash(i),'#e7f5ff',{alpha:.7})}
  const lx=-2.6+(1-p.L/100)*.8;s.ball([lx,.6,0],.3,p.L>0?'#fff3bf':'#495057',{glow:p.L>0,flat:true});s.cyl([lx-.35,.6,0],[1,0,0],.32,.3,'#868e96');s.callout([lx,.9,0],`lamp: light ${p.L}%`,'#fff3bf',-20,-55);s.callout([.3,-.9,.1],'Hydrilla (water plant)','#69db7c',70,50);if(n>0)s.callout([0,.9,0],'O₂ bubbles (rate of photosynthesis)','#e7f5ff',50,-60);s.callout([1.05,-1.2,0],'water with dissolved CO₂','#74c0fc',60,40);s.render();
  chart(c,420,96,236,170,{title:'Rate vs light (gold) at current CO₂',xl:'light %',xmin:0,xmax:100,ymin:0,ymax:1.05,series:[{fn:L=>photo({...p,L}).rate,col:C.gold},{fn:L=>photo({...p,L,co2:.06}).rate,col:'#8ca6b9',dash:[4,4]}],marker:[p.L,r.rate]})},
 assumption:'Blackman-type model: rate = min(light term, CO₂ term) × temperature factor (C₃ optimum ~25–30 °C). Dashed curve: 0.06 % CO₂.'});
function photo(p){const lt=p.L/60,ct=p.co2/.05,tf=Math.exp(-(((p.T-28)/11)**2)),rate=Math.min(1,lt,ct)*tf;const lim=tf<.9&&tf<Math.min(1,lt,ct)?'Temperature':lt<ct&&lt<1?'Light':ct<=lt&&ct<1?'CO₂':'None (saturated)';return{rate,lim}}

add({...ch(11,'Photosynthesis in Higher Plants',U4),id:'bio-light-reaction',title:'Light reaction: the Z scheme',
 description:'Follow electrons from water through PS II and PS I to NADP⁺ in the thylakoid membrane, and protons through ATP synthase.',
 formula:'2H₂O → 4H⁺ + O₂ + 4e⁻ ;  NADP⁺ + 2e⁻ + H⁺ → NADPH',
 observe:'Splitting water releases O₂ and supplies electrons to PS II; the proton gradient across the thylakoid drives ATP synthesis.',
 tryText:'Switch to cyclic photophosphorylation. What stops being produced?',
 controls:[S('mode','Electron flow','non',[['non','Non-cyclic (PS II + PS I)'],['cyc','Cyclic (PS I only)']]),R('L','Light intensity',0,100,1,80,'%')],
 metrics:p=>p.mode==='non'?[N('Products','ATP, NADPH and O₂'),N('Photosystems','PS II (P680) and PS I (P700)'),N('O₂ source','Splitting of water'),N('Location','Grana thylakoids')]:[N('Products','ATP only'),N('Photosystem','PS I (P700) only'),N('O₂ released?','No'),N('Location','Stroma lamellae')],
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:53,pitch:.3,cy:268}),on=p.L>0,sp=p.L/100,AX=[[1,0,0],[0,1,0],[0,0,1]],Y=-.3,non=p.mode==='non';
  // lipid bilayer cut open: two head-group leaflets around a darker hydrophobic core, with a row of phospholipids along the cut edge
  const sl=(y,h,col,a)=>slab(s,[0,y,-.55],AX[0],AX[1],AX[2],[3.5,h,.55],col,a,-9e4);sl(Y+.21,.07,'#f3c98b',.55);sl(Y,.14,'#9c6b45',.4);sl(Y-.21,.07,'#f3c98b',.55);
  sl(.65,.65,'#b2f2bb',.1);sl(-1.15,.55,'#a5d8ff',.1);
  for(let i=0;i<30;i++){const x=-3.38+i*.234;for(const sg of[1,-1]){s.ball([x,Y+sg*.29,.02],.055,'#ffe3b0',{flat:true,lift:.3});s.seg([x,Y+sg*.24,.02],[x,Y+sg*.06,.02],'#6b4426',2)}}
  s.label([-3.2,.75,1.2],'stroma',C.muted,12);s.label([-3.2,-1.25,1.2],'lumen',C.muted,12);
  const ps2=[-2.2,Y,0],cyt=[-.6,Y,0],ps1=[.8,Y,0],atp=[2.6,Y,0],G='#2f9e44';
  const blob=(q,r,col,o)=>s.mesh(q,r,col,{rings:8,segs:12,spec:.5,...o});
  // PS II: core dimer-like body, LHCII antenna, oxygen-evolving complex on the lumen side
  if(non){blob(ps2,[.5,.44,.42],G);blob(V.add(ps2,[-.72,0,.12]),[.27,.3,.26],'#1b7f3b');blob(V.add(ps2,[.1,-.46,0]),[.34,.2,.3],'#c8d94a');for(const k of[-1,0,1])s.ball(V.add(ps2,[.1+k*.12,-.5,.2]),.05,'#7d4cdb',{flat:true,lift:.3});s.ball(V.add(ps2,[.08,.0,.4]),.08,'#d8ff9a',{glow:true,flat:true,lift:.4});s.label(V.add(ps2,[0,.8,0]),'PS II',C.white,13)}
  // Cytochrome b6f dimer with a Rieske head and plastoquinone / plastocyanin shuttles
  for(const z of[-.2,.2])blob(V.add(cyt,[0,0,z]),[.2,.46,.24],'#e8590c');blob(V.add(cyt,[.1,.38,0]),[.2,.12,.16],'#ff922b');s.label(V.add(cyt,[0,.95,0]),'Cyt b₆f',C.white,12);
  // PS I: core with LHCI crescents; ferredoxin docking bump on the stroma side
  blob(ps1,[.45,.42,.38],'#37b24d');blob(V.add(ps1,[.62,0,.1]),[.2,.28,.24],'#2b8a3e');blob(V.add(ps1,[-.62,0,.1]),[.2,.28,.24],'#2b8a3e');blob(V.add(ps1,[0,.42,0]),[.2,.12,.18],'#2f9e44');s.ball(V.add(ps1,[.05,.0,.38]),.08,'#d8ff9a',{glow:true,flat:true,lift:.4});s.label(V.add(ps1,[0,.95,0]),'PS I',C.white,13);
  // ATP synthase: F0 c-ring in the membrane, stalk, F1 head (3 alpha/beta lobes); the rotor turns as protons flow lumen -> stroma
  s.cyl([atp[0],Y,0],[0,1,0],.27,.56,'#9aa5b1',{seg:16});const ang=t*3*sp;for(let k=0;k<10;k++){const a=ang*-1+TAU*k/10;s.ball([atp[0]+.27*Math.cos(a),Y,.27*Math.sin(a)],.05,'#cdd5dd',{flat:true,lift:.4})}
  s.cyl([atp[0],Y+.4,0],[0,1,0],.05,.4,'#6c757d',{seg:8});for(let k=0;k<3;k++){const a=ang+TAU*k/3;s.mesh([atp[0]+.2*Math.cos(a),Y+.82,.2*Math.sin(a)],[.16,.2,.16],k===0?'#f1f3f5':'#ced4da',{rings:7,segs:10,spec:.6})}
  s.label(V.add(atp,[0,1.35,0]),'ATP synthase',C.white,12);
  if(on){const q0=cycle(t*sp*.5,1),pq=a=>V.add(V.add(ps2,V.mul(V.sub(cyt,ps2),a)),[0,.05,.2]);s.ball(pq(cycle(t*sp*.5,1)),.07,'#ffa94d',{flat:true});s.ball(pq(cycle(t*sp*.5+.5,1)),.07,'#ffa94d',{flat:true});
   if(non)s.ball(V.add(V.add(cyt,V.mul(V.sub(ps1,cyt),q0)),[0,-.6,.1]),.08,'#4dabf7',{flat:true,lift:.3});
   const path=non?[ps2,cyt,ps1,[2,.8,0]]:[ps1,cyt,ps1];for(let i=0;i<6;i++){const q=cycle(t*sp*.8+i/6,1)*(path.length-1),j=Math.floor(q),fr=q-j,pt=V.add(V.add(path[j],V.mul(V.sub(path[j+1],path[j]),fr)),[0,.2,0]);s.ball(pt,.08,'#ffd43b',{glow:true,flat:true})}
   for(let i=0;i<4;i++){const q=cycle(t*sp+i/4,1);s.ball([atp[0],-.9+q*1.6,0],.07,'#ff6b6b',{flat:true});s.ball([-1.4+(i%2)*1.4,-1.1+.2*Math.sin(t+i),.5],.07,'#ff6b6b',{flat:true})}
   if(non){const q=cycle(t*sp*.5,1);s.ball([-2.4,-1.2+q*.8,.6],.12,'#74c0fc');s.label([-2.4,-1.5,.6],'2H₂O → O₂',C.blue,12);s.label([2.1,1.1,0],'NADPH',C.gold,13)}const q=cycle(t*sp,1);s.ball([atp[0]+.5,.9+q*.6,0],.12,'#ffd43b');s.label([atp[0]+.6,1.7,0],'ATP',C.gold,13)}
  for(let i=0;i<12;i++)s.seg([-3+i*.5,2.2,-1],[-3+i*.5+.4*sp,1.2,-.6],'#fff3bf'+Math.round(30+120*sp).toString(16).padStart(2,'0'),2);s.render();tag(c,'yellow: electrons   red: protons (H⁺)',44,98,C.muted,13)}, assumption:'Schematic thylakoid membrane patch, not to scale; complexes are simplified, and ferredoxin and NADP reductase are merged into the arrows.'});

add({...ch(11,'Photosynthesis in Higher Plants',U4),id:'bio-calvin-cycle',title:'Calvin cycle bookkeeping',
 description:'Turn the Calvin cycle once per CO₂ fixed and keep count of the ATP and NADPH used.',
 formula:'Per CO₂: 3 ATP + 2 NADPH ;  1 glucose = 6 turns = 18 ATP + 12 NADPH',
 observe:'Carboxylation by RuBisCO, reduction and regeneration of RuBP happen in the stroma.',
 tryText:'How many turns are needed to make three glucose molecules?',
 controls:[R('co2','CO₂ molecules fixed',1,36,1,6)],
 metrics:p=>[N('Turns of the cycle',p.co2,'',0),N('ATP used',3*p.co2,'',0),N('NADPH used',2*p.co2,'',0),N('Glucose formed',p.co2/6,'',2)],
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:38,pitch:.1,cx:270,cy:255}),stages=[['Carboxylation|(RuBisCO)','#ff6b6b'],['Reduction|(ATP, NADPH)','#ffd43b'],['Regeneration|of RuBP (ATP)','#4dabf7']],X=a=>[2*Math.cos(a),-2*Math.sin(a),0];stages.forEach(([n,col],i)=>{const a0=-PI/2+TAU*i/3,pts=[];for(let j=0;j<=20;j++)pts.push(X(a0+TAU/3*j/20));s.tube(pts,.17,col,{segs:12});const m=a0+PI/3;{const [n1,n2]=n.split('|'),q=[2.5*Math.cos(m),-2.5*Math.sin(m),0],al=Math.cos(m)>.2?'left':Math.cos(m)<-.2?'right':'center';s.label(q,n1,col,12,al);s.label([q[0],q[1]-.3,0],n2,col,12,al)}});
  const a=-PI/2+TAU*cycle(t*.35,1);s.ball(V.add(X(a),[0,0,.1]),.2,'#e9f6ff',{glow:true});s.ball([0,.6,0],.28,'#40c057',{label:`${Math.floor(p.co2/6)} glucose`});const done=Math.min(p.co2,36);for(let i=0;i<done;i++)s.ball([-.75+(i%6)*.3,-.1-Math.floor(i/6)*.3,0],.09,'#868e96',{flat:true});s.render();tag(c,'grey dots: CO₂ fixed',44,98,C.muted,13)},
 assumption:'Stoichiometry from NCERT Chapter 11; intermediates such as 3-PGA and G3P not shown individually.'});

add({...ch(11,'Photosynthesis in Higher Plants',U4),id:'bio-c3-c4',title:'C₃ vs C₄ plants and photorespiration',
 description:'Compare a C₃ leaf with the Kranz anatomy of a C₄ leaf, and see how temperature affects their photosynthesis.',
 formula:'C₃: first product 3-PGA (3C) ;  C₄: first product OAA (4C)',
 observe:'C₄ plants concentrate CO₂ in bundle-sheath cells, so RuBisCO rarely binds O₂ — photorespiration is negligible.',
 tryText:'Raise the temperature to 40 °C. Which plant keeps its rate?',
 controls:[S('type','Plant','c4',[['c3','C₃ (e.g. wheat, rice)'],['c4','C₄ (e.g. maize, sorghum)']]),R('T','Temperature',10,45,1,30,'°C')],
 metrics:p=>{const r=c34(p);return[N('Relative rate',r*100,'%',0),N('Primary CO₂ acceptor',p.type==='c4'?'PEP (3C), by PEP carboxylase':'RuBP (5C), by RuBisCO'),N('Photorespiration',p.type==='c4'?'Absent / negligible':'Present; rises with temperature'),N('Kranz anatomy',p.type==='c4'?'Present':'Absent')]},
 draw:(c,p,t)=>{const s=P3.scene(c,{scale:42,pitch:.1,cx:190,cy:262}),c4=p.type==='c4',cell=(x,y,r,col,n)=>{s.ball([x,y,0],r,col,{alpha:.55});for(let k=0;k<n;k++){const a=TAU*k/n+x;s.ball([x+r*.5*Math.cos(a),y+r*.5*Math.sin(a),.12],r*.3,'#2b8a3e',{flat:true})}};
  s.box([0,1.3,0],[5.2,.14,.5],'#b2f2bb');s.box([0,-1.3,0],[5.2,.14,.5],'#b2f2bb');
  if(c4){for(let i=0;i<12;i++){const a=TAU*i/12;cell(1.5*Math.cos(a),1.0*Math.sin(a),.24,'#8ce99a',2)}for(let i=0;i<9;i++){const a=TAU*i/9;cell(.78*Math.cos(a),.72*Math.sin(a),.26,'#51cf66',3)}
   for(let i=0;i<5;i++){const x=-2.4+i*1.2;if(Math.abs(x)>1.9)cell(x,.0,.22,'#8ce99a',2)}}
  else for(let r=0;r<4;r++)for(let i=0;i<12;i++){const x=-2.35+i*.43+(r%2)*.2,y=[.82,.44,-.42,-.82][r];if(Math.abs(x)<.4&&Math.abs(y)<.5)continue;cell(x,y,r<2?.2:.19,'#8ce99a',2)}
  s.ball([-.1,.0,.05],.14,'#ff8fab',{flat:true});s.ball([.1,.0,.05],.14,'#ff8fab',{flat:true});s.ball([0,-.2,.05],.12,'#74c0fc',{flat:true});
  s.callout([0,.05,.2],'xylem and phloem','#ffd6e0',-90,-95);s.callout([.55,.55,.2],c4?'bundle sheath (Kranz)':'mesophyll cell',C.mint,45,-85);s.callout([-1.7,1.3,.2],'epidermis','#b2f2bb',-30,-25);s.render();
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
  if(aer){s.mesh([1.4,0,0],[1.55,.88,.88],'#f4a261',{alpha:.3,rings:14,segs:24});s.mesh([1.4,0,0],[1.4,.72,.72],'#e8743b',{alpha:.4,rings:12,segs:20});for(let i=0;i<7;i++){const sg=i%2?-1:1,x=.45+i*.33,h=.5*Math.sqrt(Math.max(.05,1-((x-1.4)/1.4)**2));s.mesh([x,sg*(.72*Math.sqrt(Math.max(.05,1-((x-1.4)/1.4)**2))-h*.45),0],[.05,h*.55,.5*h/.5],'#b9460f',{rings:8,segs:12})}s.label([1.4,1.2,0],'mitochondrion: Krebs + ETS',C.muted,12);const n=Math.min(38,Math.round(cycle(t*.4,1)*38));for(let i=0;i<n;i++)s.ball([.3+(i%8)*.3,-1.4-Math.floor(i/8)*.25,.5],.07,'#ffd43b',{flat:true})}
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
  s.tube([[-1,.7,0],[-1,1.2,0],[1,1.2,0],[1,-.6,0],[1.6,-.6,0],[1.6,1,0]],.05,'#e9f6ff',{alpha:.3});const lvl=clamp((1-rq)*1.2,-.5,.5)*Math.min(1,cycle(t,8)/4);s.tube([[1,-.6,0],[1.6,-.6,0]],.045,'#4dabf7');s.tube([[1,-.6,0],[1,-.2+lvl,0]],.045,'#4dabf7');s.tube([[1.6,-.6,0],[1.6,-.2-lvl,0]],.045,'#4dabf7');s.callout([-1,-.9,.3],'germinating seeds','#d9a441',-50,40);s.callout([-1,1.2,0],'closed flask (no KOH)','#e9f6ff',-50,-50);s.callout([1.3,-.6,0],'manometer: level shows O₂ used − CO₂ given out','#4dabf7',40,50);s.render();tag(c,`RQ = ${f(rq,2)}`,44,98,C.gold,17)},
 assumption:'Ganong’s respirometer idea: the manometer shift reflects the difference between CO₂ released and O₂ taken up (no KOH).'});

add({...ch(12,'Respiration in Plants',U4),id:'bio-electron-transport',title:'Electron transport and ATP synthase',
 description:'Inside the mitochondrion, electrons flow along the inner membrane and pump protons; ATP synthase uses the flow back to make ATP.',
 formula:'NADH → I ; FADH₂ → II ; both → ubiquinone → III → cyt c → IV → O₂ + 4H⁺ + 4e⁻ → 2H₂O',
 observe:'Oxygen is the final electron acceptor; without it the chain stops and so does most ATP production.',
 tryText:'Lower the oxygen supply to zero.',
 controls:[R('O2','Oxygen supply',0,100,1,100,'%'),R('nadh','NADH supply',0,100,1,70,'%')],
 metrics:p=>{const r=Math.min(p.O2,p.nadh)/100;return[N('Electron flow (relative)',r*100,'%',0),N('ATP synthesis rate (relative)',r*100,'%',0),N('Final electron acceptor','Oxygen → water'),N('ATP synthase','F₀ proton channel + F₁ head (makes ATP)')]},
 draw:(c,p,t)=>{const r=Math.min(p.O2,p.nadh)/100,s=P3.scene(c,{scale:54,pitch:.12,cy:262});s.box([0,0,0],[7.2,.5,.7],'#ffc078',{alpha:.4});for(let i=0;i<32;i++)for(const sg of[1,-1])for(let z=-1;z<=1;z+=2)s.ball([-3.4+i*.22,sg*.3,z*.25],.075,'#ffa94d',{flat:true});s.label([-3.2,1.15,0],'intermembrane space',C.muted,12,'left');s.label([-3.2,-1.15,0],'matrix',C.muted,12,'left');
  const cx=[-2.6,-1.3,0,1.3];cx.forEach((x,i)=>{s.mesh([x,0,0],[.4,.62,.45],['#e8590c','#f08c00','#d6336c','#ae3ec9'][i],{rings:12,segs:18,spec:.6});s.label([x,.8,0],['I','II','III','IV'][i],C.white,13)});const atp=[2.7,0,0];s.cyl(V.add(atp,[0,.2,0]),[0,1,0],.22,.7,'#adb5bd');s.mesh(V.add(atp,[0,-.55,0]),[.5,.35,.5],'#ced4da',{rot:[0,t*4*r,0]});
  for(let i=0;i<6;i++){const pa=i%2?[cx[1],cx[2],cx[3]]:[cx[0],cx[2],cx[3]],q=cycle(t*r*.8+i/6,1)*2,j=Math.min(1,Math.floor(q)),fr=q-j;s.ball([pa[j]+(pa[j+1]-pa[j])*fr,-.2,i%2?-.15:.15],.07,'#ffd43b',{flat:true,glow:true})}for(let i=0;i<6;i++){const q=cycle(t*r*.5+i/6,1),px=[cx[0],cx[2],cx[3]][i%3];s.ball([px+.1*(i>2?1:-1),-.4+q*1.4,.4],.06,'#ff6b6b',{flat:true})}s.label([-2.6,-.6,0],'NADH → I',C.muted,11);s.label([-1.3,-.6,0],'FADH₂ → II',C.muted,11);
  for(let i=0;i<4;i++){const q=cycle(t*r+i/4,1);s.ball([atp[0],.9-q*1.7,0],.06,'#ff6b6b',{flat:true})}if(r>0)s.label([1.6,-1.1,0],'O₂ → H₂O',C.blue,12);s.render();tag(c,r===0?'Chain stopped: no electron flow':'yellow: electrons   red: protons',44,98,r===0?C.red:C.muted,13)},
 assumption:'Schematic inner mitochondrial membrane; mobile carriers (ubiquinone, cytochrome c) are not drawn. Protons are pumped at complexes I, III and IV only; complex II does not pump.'});

/* ---------- Chapter 13: Plant Growth and Development ---------- */
add({...ch(13,'Plant Growth and Development',U4),id:'bio-growth-curves',title:'Arithmetic, geometric and sigmoid growth',
 description:'Grow a root by arithmetic growth or a cell population by geometric growth, and see the S-shaped curve when resources limit growth.',
 formula:'Arithmetic: L_t = L₀ + rt ;  geometric: W₁ = W₀e^(rt)',
 observe:'Geometric growth starts slowly, accelerates (log phase) and then slows as nutrients run short — giving a sigmoid curve.',
 tryText:'Compare the two growth types at the same rate r.',
 controls:[S('type','Growth','geo',[['arith','Arithmetic (root elongation)'],['geo','Geometric → sigmoid (cell number)']]),R('r','Growth rate r',.05,.5,.01,.2,'per day',2),R('day','Day',0,40,1,20,'day')],
 metrics:p=>{const v=growth(p,p.day);return[N(p.type==='arith'?'Length':'Size (relative)',v,p.type==='arith'?'cm':'',2),N('Phase',p.type==='arith'?'Constant rate':v<.6?'Lag phase':v<.9*20?'Log (exponential) phase':'Stationary phase'),N('Equation',p.type==='arith'?'L = L₀ + rt':'Logistic (sigmoid) curve')]},
 draw:(c,p,t)=>{const v=growth(p,p.day),s=P3.scene(c,{scale:54,cx:220,cy:240});s.box([0,-1.5,0],[3,2.6,2],'#6d4c2f',{alpha:.25});const L=Math.min(2.2,p.type==='arith'?v*.25:v*.12);s.tube([[0,-.2,0],[0,-.2-L,0]],u=>.07*(1-u)+.02,BC.root,{segs:8});critter(s,'plant',[0,-.2,0],.4+.8*(p.type==='arith'?p.day/40:v/20),t);s.callout([0,-.2-L*.6,0],'root','#c2a26b',50,30);s.callout([0,.1,0],`day ${p.day}`,'#e9f6ff',-60,-40);s.render();
  chart(c,420,96,236,170,{title:'Growth curve',xl:'days',xmin:0,xmax:40,ymin:0,series:[{fn:d=>growth(p,d),col:C.gold}],marker:[p.day,v]})},
 assumption:'Arithmetic: L₀ = 1 cm. Geometric phase modelled with a logistic curve (maximum size 20 relative units).'});
function growth(p,d){if(p.type==='arith')return 1+p.r*d;const K=20,W0=.2;return K/(1+(K/W0-1)*Math.exp(-p.r*d))}

add({...ch(13,'Plant Growth and Development',U4),id:'bio-phototropism',title:'Phototropism and auxin',
 description:'Shine light from one side on a coleoptile. Auxin moves to the shaded side, cells there elongate more, and the shoot bends.',
 formula:'More auxin (IAA) on the shaded side → faster elongation → bending towards light',
 observe:'Covering or removing the tip stops bending — the tip senses light (Darwin’s experiment).',
 tryText:'Cover the tip, then remove the cover. Compare the response.',
 controls:[R('ang','Light direction',-90,90,5,60,'°'),S('tip','Coleoptile tip','open',[['open','Intact tip'],['covered','Tip covered (opaque cap)'],['cut','Tip removed']]),R('hrs','Hours in light',0,12,.5,6,'h',1)],
 metrics:p=>{const b=bendAng(p);return[N('Bending',Math.abs(b),'°',0),N('Towards',b===0?'—':b>0?'Right':'Left'),N('Auxin on shaded side',p.tip==='open'&&p.ang!==0?'≈ 65%':'≈ 50% (even)'),N('Hormone','Auxin (IAA)')]},
 draw:(c,p,t)=>{const b=rad(bendAng(p)),s=P3.scene(c,{scale:60,cy:300}),L=2.4,pts=[];for(let i=0;i<=12;i++){const k=i/12,a=b*k*k;pts.push([L/12*Array.from({length:i},(_,j)=>Math.sin(b*(j/12)**2)).reduce((x,y)=>x+y,0),-1.2+L/12*Array.from({length:i},(_,j)=>Math.cos(b*(j/12)**2)).reduce((x,y)=>x+y,0),0])}
  s.box([0,-1.45,0],[1.2,.5,1.2],'#6d4c2f');if(p.tip==='cut')pts.pop();s.tube(pts,.11,(u)=>p.tip==='open'?`#${Math.round(150+60*u).toString(16)}e08a`.slice(0,7):'#a9e08a',{segs:10});const top=pts[pts.length-1];if(p.tip==='covered')s.mesh(V.add(top,[0,.05,0]),[.14,.2,.14],'#343a40');
  const la=rad(p.ang),src=[3*Math.sin(la),.8+2*Math.cos(la)*.5,0];s.ball(src,.3,'#fff3bf',{glow:true,flat:true});for(let i=0;i<5;i++)s.seg(V.add(src,[0,-.3+i*.15,0]),V.add(top,[0,-.6+i*.25,0]),'#fff3bf55',2);for(let i=0;i<8;i++){const q=cycle(t*.5+i/8,1),side=p.ang>=0?-1:1;if(p.tip==='open'&&p.ang!==0)s.ball(V.add(pts[Math.floor(q*11)],[side*.12,0,.1]),.04,'#f783ac',{flat:true})}s.callout(top,p.tip==='open'?'coleoptile tip senses light':p.tip==='covered'?'tip covered: no bending':'tip cut off: no auxin source','#d8f5a2',-70,-40);s.callout(src,'light','#fff3bf',20,-40);if(p.tip==='open'&&p.ang!==0)s.callout(V.add(pts[6],[(p.ang>=0?-1:1)*.12,0,.1]),'auxin moves to shaded side → cells elongate','#f783ac',p.ang>=0?-70:70,40);s.render();tag(c,'pink dots: auxin moving down the shaded side',44,98,C.muted,13)},
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
