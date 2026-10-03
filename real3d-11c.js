/* Detailed, realistic 3D apparatus for Class 11 physics (part c):
   gravitation, mechanical properties of solids and of fluids. Same parameters and physics as the
   original scenes; only the apparatus is drawn as real lab equipment. */
(() => {
'use strict';
const R=window.PhysicaReal3D=window.PhysicaReal3D||{};
const {f,clamp,rad,deg,cycle,memo,tag,chart,PI,TAU,C}=window.PhysicaLab;
const P3=window.Physica3D,V=P3.vec,G=9.8;
const hash=i=>{const x=Math.sin(i*127.1+311.7)*43758.5453;return x-Math.floor(x)};
const MT='#d4d9de',MT2='#9aa1a8',DK='#596066',WOOD='#8a5a36',GL='#cfe9ff',WA='#4dabf7';
const part=(s,p,txt,dx,dy)=>s.callout(p,txt,C.mint,dx,dy,11);

/* ---------- shared geometry ---------- */
const bas=ax=>{const n=V.norm(ax),h=Math.abs(n[1])<.9?[0,1,0]:[1,0,0],u=V.norm(V.cross(n,h));return[n,u,V.cross(n,u)]};
// surface of revolution about an arbitrary axis; profile = [[radius, height], ...]
const rev=(s,o,ax,prof,col,opt={})=>{const [n,u,w]=bas(ax),seg=opt.segs||20,rows=prof.map(([r,h])=>Array.from({length:seg+1},(_,j)=>{const a=TAU*j/seg;return V.add(o,V.add(V.mul(n,h),V.add(V.mul(u,r*Math.cos(a)),V.mul(w,r*Math.sin(a)))))}));return s._quads(rows,null,col,{spec:.5,...opt,lathe:prof.map(([,h])=>V.add(o,V.mul(n,h)))})};
// sphere patch with a colour function of (latitude, longitude)
const sph=(s,o,Rr,colFn,o2={})=>{const nl=o2.lat||26,nn=o2.lon||44,l0=o2.l0??0,l1=o2.l1??TAU,Gd=[];for(let i=0;i<=nl;i++){const la=-PI/2+PI*i/nl,row=[];for(let j=0;j<=nn;j++){const lo=l0+(l1-l0)*j/nn;row.push([o[0]+Rr*Math.cos(la)*Math.cos(lo),o[1]+Rr*Math.sin(la),o[2]+Rr*Math.cos(la)*Math.sin(lo)])}Gd.push(row)}return s._quads(Gd,o,(fi,fj)=>colFn(-PI/2+PI*fi,l0+(l1-l0)*fj),{spec:o2.spec??.3})};
const LW=[[3.1,1.7,-2.3,1,.4],[-2.2,3.6,1.4,.8,1.9],[4.3,-1.1,2.7,.6,2.8],[1.3,2.2,4.9,.5,.7],[-5.1,.9,-3.3,.35,4.1]];
const noise=(x,y,z,k=0)=>{let n=0;for(const [a,b,cc,w,ph] of LW)n+=w*Math.sin(a*x+b*y+cc*z+ph+k*1.7);return n};
const hx=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)),mix=(a,b,k)=>{const A=hx(a),B=hx(b);k=clamp(k,0,1);return'#'+A.map((v,i)=>Math.round(v+(B[i]-v)*k).toString(16).padStart(2,'0')).join('')};
const earthCol=spin=>(la,lo)=>{lo-=spin;const x=Math.cos(la)*Math.cos(lo),y=Math.sin(la),z=Math.cos(la)*Math.sin(lo),al=Math.abs(la);if(al>1.28)return'#eef3f7';const n=noise(x,y,z),cl=noise(z*1.6,x*1.6,y*2.6,3);let col;
  if(n>.45){col=mix('#3d8b3d','#a08a58',(n-.7)/1.1);if(al<.5&&n>1)col=mix(col,'#c9a66b',.6);if(al>1.05)col=mix(col,'#e9eef2',(al-1.05)/.23)}else col=mix('#14498f','#2f86c8',(n+1.2)/1.65);
  return cl>1.6?mix(col,'#f1f5f8',(cl-1.6)*1.4):col};
const earth=(s,o,Rr,spin=0,o2)=>sph(s,o,Rr,earthCol(spin),o2);
// atmosphere glow painted behind the scene
const halo=(c,s,o,Rr,rgb='110,180,255',k=1.2,a=.55)=>{const Q=s.P(o),r=Rr*s.sc*Q[3];const g=c.createRadialGradient(Q[0],Q[1],r*.9,Q[0],Q[1],r*k);g.addColorStop(0,`rgba(${rgb},${a})`);g.addColorStop(1,`rgba(${rgb},0)`);c.save();c.fillStyle=g;c.beginPath();c.arc(Q[0],Q[1],r*k,0,TAU);c.fill();c.restore()};
const stars=(c,n=70,seed=0)=>{c.save();for(let i=0;i<n;i++){const x=36+hash(i+seed)*630,y=80+hash(i*3+7+seed)*320,r=.5+hash(i*7+seed)*1.1;c.globalAlpha=.35+hash(i*5+seed)*.5;c.fillStyle=hash(i*11)>.8?'#ffe8c0':'#ffffff';c.beginPath();c.arc(x,y,r,0,TAU);c.fill()}c.restore()};
const dish=(s,o,ax,r,dep,col='#f1f3f5')=>{rev(s,o,ax,[[0,0],[r*.35,dep*.12],[r*.7,dep*.5],[r,dep]],col,{cull:false,segs:16});const n=V.norm(ax);s.seg(o,V.add(o,V.mul(n,dep*2.2)),'#adb5bd',1.2);s.ball(V.add(o,V.mul(n,dep*2.2)),r*.12,'#ced4da')};
// communications satellite: gold-foil bus, two solar wings (north-south), Earth-pointing dish
function sat(s,q,ang,k=1){const rd=[Math.cos(ang),0,Math.sin(ang)],ry=-ang;
  s.box(q,[.18*k,.2*k,.18*k],'#c9a227',{rotY:ry});s.box(V.add(q,[0,.11*k,0]),[.19*k,.025*k,.19*k],'#e9ecef',{rotY:ry});
  for(const sg of[-1,1]){s.cyl(V.add(q,[0,sg*.16*k,0]),[0,1,0],.012*k,.14*k,'#adb5bd');for(let i=0;i<3;i++)s.box(V.add(q,[0,sg*(.3+i*.17)*k,0]),[.012*k,.155*k,.24*k],'#1d3f8f',{rotY:ry,stroke:'#8fb3ff55'})}
  dish(s,V.add(q,V.mul(rd,-.1*k)),V.mul(rd,-1),.12*k,.06*k);s.seg(V.add(q,[0,.12*k,0]),V.add(q,[0,.26*k,0]),'#dee2e6',1.2)}
// cut-away planet: far hemisphere plus a flat section through the centre facing +z
function cutPlanet(s,Rr,layers){sph(s,[0,0,0],Rr,earthCol(0),{l0:PI*.9,l1:TAU*1.05,lat:20,lon:24});
  layers.forEach(([fr,col],i)=>s.poly(Array.from({length:48},(_,j)=>{const a=TAU*j/48;return[Rr*fr*Math.cos(a),Rr*fr*Math.sin(a),0]}),col,{normal:[0,0,1],bias:.002*(i+1),shade:false}))}

/* ---------- Gravitation ---------- */
R['gravity']=(c,p,t)=>{const s=P3.scene(c,{scale:72,pitch:.12,cy:250,cx:330}),Re=6371,r=Re+p.altitude,v=Math.sqrt(3.986e14/(r*1e3)),Rr=1.3,ro=Rr*(r/Re)*1.15,a=t*v/1000*.12,gl=3.986e14/(r*1e3)**2;
  stars(c);halo(c,s,[0,0,0],Rr);earth(s,[0,0,0],Rr,t*.1);s.ring([0,0,0],[0,1,0],ro,'#42d9ca66',1.2,[5,5]);
  const q=[ro*Math.cos(a),0,ro*Math.sin(a)];sat(s,q,a,.75);
  s.arrow(q,V.add(q,V.mul([-Math.sin(a),0,Math.cos(a)],.75)),C.mint,3,11,`v = ${f(v/1000,2)} km/s`);s.arrow(q,V.add(q,V.mul([-Math.cos(a),0,-Math.sin(a)],.45)),C.gold,2.5,9,`g = ${f(gl,2)} m/s²`);
  part(s,[-Rr*.6,Rr*.75,.3],'Earth',-50,-40);part(s,V.add(q,[0,.3,0]),'satellite',40,-36);part(s,[-ro,0,0],`orbit r = ${f(r,0)} km`,-30,40);
  s.render();tag(c,`v = ${f(v/1000,2)} km/s`,44,98,C.gold,15)};

function rocket(s,base,dir,k=1,burn=1,t=0){const n=V.norm(dir),[,u,w]=bas(n);
  rev(s,base,n,[[.07*k,0],[.09*k,.04*k],[.09*k,.5*k],[.085*k,.6*k],[.06*k,.72*k],[.032*k,.8*k],[0,.85*k]],(fi)=>fi>.3&&fi<.45?'#d63939':fi>.75?'#d63939':'#f1f3f5',{segs:14});
  rev(s,base,n,[[.035*k,0],[.065*k,-.1*k]],'#495057',{segs:12,cull:false});
  for(let i=0;i<4;i++){const a=TAU*i/4+.6,d=V.add(V.mul(u,Math.cos(a)),V.mul(w,Math.sin(a)));s.poly([V.add(base,V.mul(d,.09*k)),V.add(V.add(base,V.mul(n,.22*k)),V.mul(d,.09*k)),V.add(V.add(base,V.mul(n,-.04*k)),V.mul(d,.2*k))],'#c92a2a',{cull:false,stroke:'#00000044'})}
  if(burn)for(let i=0;i<7;i++){const j=hash(i+Math.floor(t*20));s.ball(V.add(base,V.mul(n,-(.14+i*.07)*k)),(.06-.006*i+j*.012)*k,i<2?'#fff3bf':i<4?'#ffc36b':'#ff8a3c',{flat:true,glow:true})}}
R['escape']=(c,p,t)=>{const s=P3.scene(c,{scale:52,pitch:.05,yaw:.55,cy:255}),Rp=.55+p.radius*.45,O=[-2.6,-.2,0],ve=11.2*Math.sqrt(p.mass/p.radius),u=cycle(t,5)/5,dist=.15+u*3.6,x0=O[0]+Rp,rr=1+dist/Rp,v=ve*Math.sqrt(1/rr),q=[x0+dist,O[1],0];
  stars(c,60,5);halo(c,s,O,Rp,'130,170,255',1.18,.5);sph(s,O,Rp,(la,lo)=>{const n=noise(Math.cos(la)*Math.cos(lo),Math.sin(la),Math.cos(la)*Math.sin(lo));return mix('#6e4e34','#b88a5c',(n+2)/4)},{lat:20,lon:32});
  s.box([x0+.02,O[1]-.12,0],[.18,.06,.3],'#868e96');s.seg([x0,O[1],0],[3.6,O[1],0],'#ffffff33',1,[5,6]);
  rocket(s,q,[1,0,0],1.3,u<.12?1:0,t);s.arrow(V.add(q,[.9,.25,0]),V.add(q,[.9+.35+v*.08,.25,0]),C.mint,3,10,`v = ${f(v,1)} km/s`);s.arrow(V.add(q,[.4,-.3,0]),V.add(q,[.4-.25-.6/(rr*rr),-.3,0]),C.gold,2.5,9,`g = ${f(9.8*p.mass/p.radius**2/(rr*rr),2)} m/s²`);
  part(s,[O[0],O[1]+Rp,0],`planet (${p.mass} M⊕, ${p.radius} R⊕)`,30,-50);part(s,[x0,O[1]-.1,0],'launch pad',20,60);
  s.render();tag(c,`v_escape ≈ ${f(ve,1)} km/s`,44,98,C.gold,15)};

R['kepler']=(c,p,t)=>{const s=P3.scene(c,{scale:62,pitch:.25,cx:420,cy:255}),a=1.1+p.axis*.55,e=p.eccentricity,b=a*Math.sqrt(1-e*e),T=Math.pow(p.axis,1.5)*6,M=TAU*cycle(t,T)/T;let E=M;for(let i=0;i<20;i++)E=M+e*Math.sin(E);
  const pos=E=>[a*(Math.cos(E)-e),0,b*Math.sin(E)];stars(c,80,9);halo(c,s,[0,0,0],.32,'255,190,70',2.3,.7);
  sph(s,[0,0,0],.32,(la,lo)=>{const n=noise(Math.cos(la)*Math.cos(lo)*3,Math.sin(la)*3,Math.cos(la)*Math.sin(lo)*3,t);return n>1?'#fff3bf':n>-.5?'#ffd43b':'#fab005'},{lat:12,lon:20,spec:0});
  s.path(Array.from({length:97},(_,i)=>pos(TAU*i/96)),'#9fb4c299',1.5);
  for(let k=0;k<4;k++){const M0=TAU*k/4;let E0=M0;for(let i=0;i<20;i++)E0=M0+e*Math.sin(E0);let E1=M0+.4;for(let i=0;i<20;i++)E1=M0+.4+e*Math.sin(E1);s.poly([[0,0,0],...Array.from({length:8},(_,j)=>pos(E0+(E1-E0)*j/7))],'#7baaff',{alpha:.25,cull:false,normal:[0,1,0]})}
  const q=pos(E),rAU=p.axis*(1-e*Math.cos(E)),v=29.8*Math.sqrt(1/p.axis)*Math.sqrt(2*p.axis/rAU-1),vd=V.norm([-a*Math.sin(E),0,b*Math.cos(E)]);earth(s,q,.13,t*2,{lat:10,lon:16});
  s.arrow(q,V.add(q,V.mul(vd,.25+v*.025)),C.mint,2.5,10,`v = ${f(v,1)} km/s`);s.seg([0,0,0],q,'#ffffff44',1,[3,3]);
  part(s,[0,.32,0],'Sun (at a focus)',30,-55);part(s,pos(0),'perihelion',30,40);part(s,pos(PI),'aphelion',-30,40);
  s.render();tag(c,'shaded sectors: equal areas in equal times',44,98,C.muted,13)};

R['gravity-depth']=(c,p,t)=>{const s=P3.scene(c,{scale:56,cx:230,yaw:.3,pitch:-.18}),Rr=1.6,r=Rr*(6371+p.altitude)/6371,gv=9.81*(p.altitude<0?r/Rr:(Rr/r)**2);
  stars(c,40,3);halo(c,s,[0,0,0],Rr);cutPlanet(s,Rr,[[1,'#6b4f35'],[.97,'#c4532a'],[.55,'#e8870c'],[.19,'#ffd43b']]);
  for(let i=1;i<=3;i++)s.ring([0,0,.01],[0,0,1],Rr*i/4,'#ffffff22',1,[2,4]);s.seg([0,0,.02],[2.7,0,.02],'#ffffff55',1,[4,4]);
  const pr=[r,0,.08];s.cyl(pr,[1,0,0],.07,.2,'#dee2e6');s.ball(V.add(pr,[0,.11,0]),.03,C.red,{flat:true,glow:true});s.seg(V.add(pr,[0,.04,0]),V.add(pr,[0,.11,0]),'#adb5bd',1);
  s.arrow(V.add(pr,[0,.28,0]),[r-.6*gv/9.81,.28,.08],C.red,3,11,`g = ${f(gv,2)} m/s²`);s.ball([0,0,.02],.04,C.white,{flat:true,lift:3});
  part(s,[0,Rr*.97,.02],'crust',20,-26);part(s,[-Rr*.75,-.3,.02],'mantle',-40,30);part(s,[-Rr*.4,.5,.02],'core',-50,-20);part(s,V.add(pr,[0,.1,0]),'probe',10,-60);
  s.render();chart(c,430,96,226,150,{title:'g vs distance from centre',xl:'r / R',xmin:0,xmax:1.7,ymin:0,ymax:1.05,series:[{fn:x=>x<1?x:1/(x*x),col:C.gold}],marker:[r/Rr,r<Rr?r/Rr:(Rr/r)**2]});tag(c,'Uniform-density model: g ∝ r inside, ∝ 1/r² outside',44,98,C.muted,13)};

R['orbital-energy']=(c,p,t)=>{const s=P3.scene(c,{scale:56,cx:220,pitch:.1}),r=6371+p.altitude,Rr=1.2,ro=Rr*r/6371*1.1,a=t*.5;
  stars(c,50,11);halo(c,s,[0,0,0],Rr);earth(s,[0,0,0],Rr,t*.1);s.ring([0,0,0],[0,1,0],ro,'#42d9ca66',1.2,[5,5]);const q=[ro*Math.cos(a),0,ro*Math.sin(a)];sat(s,q,a,.65);
  const v=Math.sqrt(3.986e14/(r*1e3));s.arrow(q,V.add(q,V.mul([-Math.sin(a),0,Math.cos(a)],.6)),C.mint,2.5,10,`v = ${f(v/1000,2)} km/s`);part(s,V.add(q,[0,.25,0]),'satellite (1000 kg)',30,-40);part(s,[-Rr*.6,Rr*.7,.3],'Earth',-40,-40);
  s.render();const GMm=3.986e14*1000/(r*1e3),KE=GMm/2/1e9,PE=-GMm/1e9;
  chart(c,450,96,206,170,{title:'Energy (GJ, 1000 kg)',xmin:0,xmax:1,ymin:PE*1.1,ymax:KE*1.3,series:[]});c.save();const z=v=>96+170-8-(v-PE*1.1)/(KE*1.3-PE*1.1)*(170-30);[[KE,'#ffc36b','KE'],[PE,'#7baaff','PE'],[KE+PE,'#42d9ca','E']].forEach(([v,col,l],i)=>{c.fillStyle=col;const y0=z(0),y1=z(v);c.fillRect(480+i*55,Math.min(y0,y1),35,Math.abs(y1-y0));tag(c,l,497+i*55,z(0)+(v<0?-10:10),col,11,'center')});c.restore()};

R['geostationary']=(c,p,t)=>{const GM=3.986e14*p.M,T=p.T*3600,r=Math.cbrt(GM*T*T/(4*PI*PI)),s=P3.scene(c,{scale:56,cy:255,pitch:.1}),rs=Math.min(3.6,1.05*Math.pow(r/6.371e6,.62)),hrs=t*2,spinE=TAU*hrs/23.93,spinS=TAU*hrs/p.T;
  stars(c,70,13);halo(c,s,[0,0,0],1.05);earth(s,[0,0,0],1.05,-spinE);s.ring([0,0,0],[0,1,0],1.07,'#ffc36b99',1.5);
  const mk=[Math.cos(spinE),0,Math.sin(spinE)],gs=V.mul(mk,1.07);s.ball(gs,.06,C.red,{lift:2});dish(s,V.mul(mk,1.1),mk,.07,.035,'#ffffff');
  s.ring([0,0,0],[0,1,0],rs,'#42d9ca66',1.2,[5,5]);const sp=[rs*Math.cos(spinS),0,rs*Math.sin(spinS)];sat(s,sp,spinS,.7);s.seg(gs,sp,'#ffe06655',1,[2,4]);
  s.arrow(sp,V.add(sp,V.mul([-Math.sin(spinS),0,Math.cos(spinS)],.6)),C.mint,2.5,10,`v = ${f(TAU*r/T/1000,2)} km/s`);
  part(s,gs,'fixed point on equator',-40,50);part(s,V.add(sp,[0,.3,0]),`satellite, r = ${f(r/1000,0)} km`,40,-40);part(s,[0,1.05,0],'Earth (turns once per 23.93 h)',-30,-40);
  s.render();tag(c,'1 s on screen = 2 h.  Red dot: fixed point on the equator.',44,98,C.muted,13)};

R['earth-tunnel']=(c,p,t)=>{const s=P3.scene(c,{scale:54,yaw:.3,pitch:-.18,cx:330}),Rs=2,A=Rs*Math.sqrt(1-p.d*p.d),y0=-p.d*Rs,x=A*Math.cos(t*1.2);
  stars(c,50,17);halo(c,s,[0,0,0],Rs);cutPlanet(s,Rs,[[1,'#6b4f35'],[.97,'#b5562e'],[.75,'#ae5230'],[.5,'#a84f30'],[.25,'#a24b2f']]);
  s.poly([[-A,y0-.09,0],[A,y0-.09,0],[A,y0+.09,0],[-A,y0+.09,0]],'#1f2327',{normal:[0,0,1],bias:.01,shade:false});for(const dy of[-.09,.09])s.seg([-A,y0+dy,.01],[A,y0+dy,.01],'#adb5bd',1.6);
  for(let i=-8;i<=8;i++)s.seg([A*i/9,y0-.09,.01],[A*i/9,y0+.09,.01],'#495057',.8);
  s.seg([0,0,.01],[0,y0,.01],C.muted,1,[3,3]);s.ball([0,0,.01],.05,C.white,{flat:true,lift:5});s.ball([x,y0,.04],.11,'#ced4da',{lift:5});
  s.arrow([x,y0+.35,.04],[x-x*.35,y0+.35,.04],C.mint,2.5,11,'F ∝ −x');
  part(s,[A*.9,y0-.09,0],'evacuated tunnel',40,40);part(s,[x,y0-.1,.04],'steel ball',-20,55);part(s,[0,0,.01],'centre',-40,-30);part(s,[-Rs*.7,Rs*.7,0],'uniform planet',-30,-30);
  s.render();tag(c,'mint: restoring force ∝ distance from tunnel centre',44,98,C.muted,13)};

/* ---------- Mechanical Properties of Solids ---------- */
// helical coil spring of round wire from a to b
const coil=(s,a,b,turns,r,wire,col='#c9ced3')=>{const d=V.sub(b,a),L=Math.hypot(...d),[n,u,w]=bas(d),N=Math.round(turns*14),pts=[a];for(let i=0;i<=N;i++){const q=.08+.84*i/N,th=TAU*turns*i/N;pts.push(V.add(V.add(a,V.mul(n,q*L)),V.add(V.mul(u,r*Math.cos(th)),V.mul(w,r*Math.sin(th)))))}pts.push(b);return s.tube(pts,wire,col,{segs:6,spec:.8,shine:30})};
const hook=(s,[x,y,z],r=.05,col=MT2)=>s.tube(Array.from({length:11},(_,i)=>{const a=PI*.5-i/10*1.7*PI;return[x+r*Math.cos(a),y-r+r*Math.sin(a),z]}),.012,col,{segs:5});
// slotted-mass hanger with n discs; returns the y of its base
function hanger(s,top,n,r=.2,col='#8d939a'){const [x,y,z]=top,h=.065,rodL=.12+n*h+.06;hook(s,top);s.cyl([x,y-.1-rodL/2,z],[0,1,0],.018,rodL,MT2);const yb=y-.1-rodL;s.cyl([x,yb,z],[0,1,0],r,.05,'#5f666d');
  for(let i=0;i<n;i++){const yc=yb+.025+h*(i+.5);s.cyl([x,yc,z],[0,1,0],r*.96,h*.88,col,{seg:22,cap:'#a7adb3'});s.box([x,yc,z+r*.72],[.05,h*.9,r*.56],'#2b3035')}return yb-.025}
const beam=(s,c0,w)=>{s.box(c0,[w,.22,.9],DK);for(let i=0;i<9;i++)s.seg([c0[0]-w/2+w*i/8,c0[1]+.11,-.45],[c0[0]-w/2+w*i/8-.2,c0[1]+.3,-.45],'#8ca6b966',1);part(s,V.add(c0,[w/2,0,0]),'rigid support',40,20)};
const chuck=(s,p)=>{s.cyl(p,[0,1,0],.07,.16,MT);s.cyl(V.add(p,[0,-.1,0]),[0,1,0],.045,.06,MT2)};

R['hooke']=(c,p,t)=>{const s=P3.scene(c,{scale:50,cy:285,cx:330,pitch:.05}),x=p.force/p.stiffness,L=2.2+x*6,xb=-3.1+L;
  s.box([0,-.1,0],[7.8,.2,2],WOOD,{ground:true});s.box([0,-.5,.95],[7.8,.6,.1],'#6e4529');
  s.box([-3.35,.7,0],[.3,1.6,1.1],DK);s.box([-3.35,-.02,0],[.7,.06,1.2],DK);for(const z of[-.4,.4])s.ball([-3.19,1.2,z],.05,MT,{flat:false});
  s.cyl([-3.15,.4,0],[1,0,0],.09,.08,MT);coil(s,[-3.1,.4,0],[xb,.4,0],12,.2,.025,'#c9ced3');
  s.box([xb+.35,.36,0],[.7,.5,.6],'#c58c4a');s.box([xb+.35,.64,0],[.72,.06,.62],'#a8743a');for(const dx of[.12,.58])for(const dz of[-.28,.28])s.cyl([xb+dx,.11,dz],[0,0,1],.1,.07,'#2b3035',{cap:'#868e96'});s.cyl([xb+.02,.4,0],[1,0,0],.04,.06,MT2);
  // metre scale along the front edge
  s.box([1.25,.02,.75],[4.5,.04,.28],'#f1e3b5',{ground:false});for(let i=0;i<=70;i++){const X=-.9+i*.06;s.seg([X,.045,.62],[X,.045,.62+(i%10===0?.16:i%5===0?.11:.06)],'#1b1f23',i%10===0?1.3:.7);if(i%10===0)s.engrave([X,.05,.83],String(i),'#1b1f23',9)}
  s.seg([-.9,0,.6],[-.9,1.2,.6],C.muted,1,[4,4]);s.seg([-.9,.95,.6],[xb,.95,.6],C.gold,1.5);s.label([(-.9+xb)/2,1.12,.6],`x = ${f(x*100,1)} cm`,C.gold,12);
  s.arrow([xb+.7,.4,0],[xb+.9+p.force*.03,.4,0],C.gold,4,11,`F = ${p.force} N`);
  part(s,[-3.3,1.4,0],'rigid support',-20,-50);part(s,[(-3.1+xb)/2,.6,0],`spring, k = ${p.stiffness} N/m`,10,-80);part(s,[xb+.35,.64,0],'trolley',40,-60);part(s,[2.5,.04,.88],'scale (cm)',30,50);
  s.render();tag(c,`extension = ${f(x*100,1)} cm`,44,98,C.gold,15)};

R['young-modulus']=(c,p,t)=>{const s=P3.scene(c,{scale:50,cy:250,pitch:-.25}),e=p.force/(p.area*1e-6*p.young*1e9),ext=clamp(e*300,0,1.2),wr=.012+p.area*.0018,n=clamp(Math.round(p.force/100),1,10),yR=-.15,yT=-.15-ext;
  beam(s,[0,2.13,0],2.2);for(const x of[-.45,.45])chuck(s,[x,1.94,0]);
  s.cyl([-.45,(1.86+yR+.35)/2,0],[0,1,0],wr,1.86-yR-.35,'#b8bec4',{seg:8});s.cyl([.45,(1.86+yT+.35)/2,0],[0,1,0],wr,1.86-yT-.35,'#e3e7ea',{seg:8});
  const frame=(x,y,col)=>{for(const dx of[-.17,.17])s.box([x+dx,y,0],[.05,.7,.1],col);for(const dy of[-.33,.33])s.box([x,y+dy,0],[.39,.05,.1],col)};frame(-.45,yR,'#7d858d');frame(.45,yT,'#a2a9b0');
  const lv=[-.45,yR+.05,.12],mc=[.45,yR+.12,.12];s.box([0,yR+.05,.12],[.9,.06,.1],'#7a6a50');s.cyl([0,yR+.11,.12],[1,0,0],.035,.45,GL,{alpha:.35});s.ball([.04*Math.sin(t)*0+clamp(ext*.2,0,.15),yR+.12,.14],.022,'#e9fbe0',{flat:true,lift:1});
  s.cyl([.45,yT+.25,.12],[0,1,0],.025,.5,MT);s.cyl([.45,yT+.55,.12],[0,1,0],.09,.14,'#c3c9cf');for(let i=0;i<12;i++){const a=TAU*i/12;s.seg([.45+.09*Math.cos(a),yT+.49,.12+.09*Math.sin(a)],[.45+.09*Math.cos(a),yT+.61,.12+.09*Math.sin(a)],'#495057',.8)}
  const bR=hanger(s,[-.45,yR-.38,0],2,.17),bT=hanger(s,[.45,yT-.38,0],n,.2);s.arrow([.85,yT-.6,0],[.85,yT-.6-.25-p.force/1000*.6,0],C.gold,3,10,`F = ${p.force} N`);
  part(s,[-.45,1.2,0],'reference wire',-40,-10);part(s,[.45,1.2,0],`test wire (A = ${p.area} mm²)`,40,-10);part(s,[0,yR+.11,.12],'spirit level',-60,40);part(s,[.45,yT+.6,.12],'micrometer screw',50,-20);part(s,[.45,bT+.3,.2],'slotted masses',50,30);part(s,[-.45,bR+.2,.2],'dead load',-50,20);
  s.render();tag(c,`Extension magnified for visibility · ΔL (1 m wire) = ${f(p.force/(p.area*p.young),3)} mm`,44,98,C.muted,13)};

R['bulk-modulus']=(c,p,t)=>{const s=P3.scene(c,{scale:37,cy:275,cx:300,pitch:-.12}),dv=p.pressure*1e6/(p.bulk*1e9),k=Math.cbrt(Math.max(.2,1-dv*30));
  s.box([0,-2.15,0],[3.4,.2,3.4],DK);s.cyl([0,-1.9,0],[0,1,0],2.05,.3,'#7d858d');s.cyl([0,1.95,0],[0,1,0],2.05,.3,'#7d858d');
  for(const a of[.8,2.4,3.9,5.5])s.cyl([2.25*Math.cos(a),0,2.25*Math.sin(a)],[0,1,0],.06,4.2,MT);
  s.cyl([0,0,0],[0,1,0],1.9,3.5,'#3fa7d6',{alpha:.16,caps:false});s.cyl([0,0,0],[0,1,0],2,3.5,GL,{alpha:.1,caps:false});
  s.cyl([0,2.45,0],[0,1,0],.14,.8,MT);s.cyl([0,2.85,0],[1,0,0],.05,1.4,MT2);for(const x of[-.7,.7])s.ball([x,2.85,0],.08,'#212529');
  s.cyl([2.35,1.2,0],[1,0,0],.05,.6,MT2);s.cyl([2.75,1.2,0],[0,0,1],.32,.12,'#212529',{cap:'#f1f3f5'});const ga=PI*(1.2-1.4*clamp(p.pressure/400,0,1));for(let i=0;i<=10;i++){const a=PI*(1.2-.14*i);s.seg([2.75+.24*Math.cos(a),1.2+.24*Math.sin(a),.07],[2.75+.29*Math.cos(a),1.2+.29*Math.sin(a),.07],'#212529',1)}s.seg([2.75,1.2,.075],[2.75+.24*Math.cos(ga),1.2+.24*Math.sin(ga),.075],'#e03131',2);
  s.box([0,0,0],[1.6,1.6,1.6],'#ffffff',{alpha:.07});s.box([0,0,0],[1.6*k,1.6*k,1.6*k],'#c08a3e');
  for(const d of[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]]){const q=V.mul(d,1.6);s.arrow(q,V.mul(d,.85*k+.05),C.red,2+p.pressure/100,11,d[0]===1?`ΔP = ${p.pressure} MPa`:'')}
  part(s,[0,.8*k,.3],'sample cube',-60,-40);part(s,[-1.6,1.2,1],'thick-walled pressure vessel',-30,-30);part(s,[2.75,1.52,0],'pressure gauge',30,-20);part(s,[0,2.85,0],'screw piston',-50,-10);part(s,[-1.3,-1,1.2],'oil (transmits pressure)',-30,40);
  s.render();tag(c,'Volume change exaggerated ~30×',44,98,C.muted,13)};

R['spring-network']=(c,p,t)=>{const s=P3.scene(c,{scale:45,cy:250,pitch:-.25}),par=p.mode==='parallel',keq=par?p.k1+p.k2:p.k1*p.k2/(p.k1+p.k2),x=p.force/keq,top=2.2,L0=1.1,K=2.5;let y;
  beam(s,[0,top+.12,0],2.6);
  if(par){y=top-L0-x*K;for(const [xx,k,col] of[[-.45,p.k1,'#c9ced3'],[.45,p.k2,'#e0c48a']]){hook(s,[xx,top,0]);coil(s,[xx,top-.1,0],[xx,y+.06,0],11,.14,.022,col)}s.box([0,y,0],[1.3,.1,.4],MT2);part(s,[-.45,top-.5,0],`k₁ = ${p.k1} N/m`,-50,0);part(s,[.45,top-.5,0],`k₂ = ${p.k2} N/m`,50,0)}
  else{const x1=p.force/p.k1,x2=p.force/p.k2,mid=top-.1-L0*.85-x1*K;hook(s,[0,top,0]);coil(s,[0,top-.1,0],[0,mid,0],9,.14,.022,'#c9ced3');s.cyl([0,mid-.04,0],[0,1,0],.12,.08,MT2);y=mid-.08-L0*.85-x2*K;coil(s,[0,mid-.08,0],[0,y+.06,0],9,.14,.022,'#e0c48a');s.cyl([0,y,0],[0,1,0],.12,.08,MT2);part(s,[0,(top+mid)/2,0],`k₁ = ${p.k1} N/m`,-60,0);part(s,[0,(mid+y)/2,0],`k₂ = ${p.k2} N/m`,60,0)}
  const n=clamp(Math.round(p.force/4),1,5),b=hanger(s,[0,y-.05,0],n,.22);s.arrow([.5,b+.2,0],[.5,b-.25-p.force*.02,0],C.gold,3,10,`F = ${p.force} N`);
  s.seg([-1.1,top-L0*(par?1:1.7)-.1,0],[-.7,top-L0*(par?1:1.7)-.1,0],C.muted,1,[3,3]);part(s,[0,b+.1,.2],'hanger + slotted masses',-60,20);
  s.render();tag(c,`k_eq = ${f(keq,1)} N/m`,44,98,C.gold,15)};

R['stress-strain']=(c,p,t)=>{const s=P3.scene(c,{scale:40,cx:215,cy:262,pitch:-.25}),q=p.load/100,ext=q<.4?q*.2:.08+(q-.4)*1.4,neck=q>.85?(q-.85)/.15:0,L=2.6+ext,y0=2.05,y1=y0-L;
  s.box([0,-2.05,0],[3.2,.35,1.3],'#3b5f86');s.box([0,-1.8,0],[2.6,.15,1],DK);for(const x of[-1.15,1.15]){s.cyl([x,.3,0],[0,1,0],.12,4.5,MT);s.cyl([x,.3,0],[0,1,0],.15,.0001,MT)}
  s.box([0,2.6,0],[2.7,.35,.9],'#3b5f86');s.box([0,2.3,0],[.6,.25,.5],'#868e96');s.box([0,y1-.6,0],[2.6,.3,.85],'#4b6e94');for(const x of[-1.15,1.15])s.cyl([x,y1-.6,0],[0,1,0],.17,.32,MT2);
  const grip=y=>{s.box([0,y,0],[.55,.42,.55],'#495057');for(const dx of[-.17,.17])s.box([dx,y,.28],[.12,.36,.02],'#adb5bd')};grip(y0+.05);grip(y1-.25);
  const prof=u=>{const sh=u<.12||u>.88?.2:u<.2?.2-(u-.12)*1:u>.8?.2-(.88-u)*1:.12;return sh*(1-.6*neck*Math.exp(-(((u-.6)/.08)**2)))};
  if(q<1)s.tube(Array.from({length:31},(_,i)=>[0,y0+.2-(L+.4)*i/30,0]),u=>prof(u),'#ced4da',{segs:14});else{s.tube(Array.from({length:12},(_,i)=>[0,y0+.2-(L+.4)*.58*i/11,0]),u=>prof(u*.58),'#ced4da',{segs:14});s.tube(Array.from({length:10},(_,i)=>[0,y0+.2-(L+.4)*(.62+.38*i/9),0]),u=>prof(.62+.38*u),'#ced4da',{segs:14})}
  s.box([.22,y0-L*.3,.0],[.1,.08,.12],'#fab005');s.box([.22,y0-L*.75,0],[.1,.08,.12],'#fab005');s.seg([.27,y0-L*.3,0],[.27,y0-L*.75,0],'#fab005',1.5);
  s.arrow([0,y1-.85,.5],[0,y1-1.2,.5],C.gold,3,10,`load ${p.load}%`);
  part(s,[0,2.75,0],'fixed crosshead + load cell',40,-20);part(s,[0,y0-L*.5,.1],'dog-bone specimen',-50,10);part(s,[.27,y0-L*.5,0],'extensometer',50,0);part(s,[0,y0+.25,.28],'wedge grip',-50,-10);part(s,[1.2,y1-.6,.4],'moving crosshead',40,30);
  s.render();const ss=x=>x<.4?x*2:x<.5?.8+.05*Math.sin((x-.4)*30):.8+(x-.5)*.6-(x>.85?(x-.85)*1.2:0);chart(c,420,96,236,170,{title:'Stress vs strain',xl:'strain →',xmin:0,xmax:1,ymin:0,ymax:1.2,series:[{fn:ss,col:C.gold}],marker:[q,ss(q)]});tag(c,q<.4?'Elastic region (Hooke’s law)':q<.5?'Yield point':q<.85?'Plastic region':q<1?'Necking (ultimate strength passed)':'Fracture',44,98,C.mint,14)};

R['shear-deformation']=(c,p,t)=>{const s=P3.scene(c,{scale:56,cy:300,cx:330,pitch:.05}),h=.8+p.height*2,th=p.force/(.01*p.modulus*1e6),dx=clamp(p.force*p.height/(.01*p.modulus*1e6)*1.5,0,1.2),w=1.6,d=1.2;
  s.box([0,-.25,0],[6,.2,2.6],WOOD,{ground:true});s.box([0,-.07,0],[2.4,.16,1.8],'#868e96');for(const x of[-1.05,1.05])for(const z of[-.75,.75])s.cyl([x,.03,z],[0,1,0],.06,.05,MT);
  s.box([-1.9,.6,0],[.3,1.6,1.2],DK);s.box([-1.9,-.12,0],[.8,.1,1.4],DK);
  const B=[[-w/2,0,-d/2],[w/2,0,-d/2],[w/2,0,d/2],[-w/2,0,d/2]],T=B.map(q=>[q[0]+dx,h,q[2]]);s.poly([T[0],T[1],T[2],T[3]].reverse(),'#e8a33d',{normal:[0,1,0]});[[0,1],[1,2],[2,3],[3,0]].forEach(([i,j])=>s.poly([B[i],B[j],T[j],T[i]],'#d98c2b',{cull:false,stroke:'#00000033'}));
  for(let k=1;k<5;k++){const y=h*k/5;s.seg([-w/2+dx*k/5,y,d/2+.005],[w/2+dx*k/5,y,d/2+.005],'#a8661a',1)}
  s.box([dx,h+.07,0],[w+.2,.14,d+.2],'#c3c9cf');s.cyl([dx-w/2-.6,h+.07,0],[1,0,0],.05,1,MT2);s.box([dx-w/2-1.1,h+.07,0],[.15,.3,.3],DK);
  s.arrow([dx-w/2-2,h+.4,0],[dx-w/2-1.2,h+.4,0],C.gold,4,11,`F = ${p.force} N`);s.seg([w/2,0,d/2+.01],[w/2,h,d/2+.01],C.muted,1,[4,4]);
  s.path(Array.from({length:9},(_,i)=>{const a=th>0?Math.atan2(dx,h)*i/8:0;return[w/2+.45*Math.sin(a),.45*Math.cos(a),d/2+.01]}),C.mint,2);s.label([w/2+.35,.75,d/2],`θ = ${f(th,4)} rad`,C.mint,12,'left');
  part(s,[-.5,h*.5,d/2],`rubber block (h = ${p.height} m)`,-60,30);part(s,[dx,h+.14,0],'bonded top plate',40,-40);part(s,[1,-.0,.9],'fixed base plate',40,50);part(s,[-1.9,1.4,0],'support',-40,-30);
  s.render();tag(c,'Shear angle exaggerated',44,98,C.muted,13)};

R['poisson-ratio']=(c,p,t)=>{const A=PI*(p.d/2000)**2,e=p.F/(A*p.Y*1e9),k=clamp(e*80,0,1.2),s=P3.scene(c,{scale:44,cy:262,pitch:-.25}),L=2.2*(1+k*.5),r=.22*(1-p.sg*k*.5),top=1.95,yb=top-L;
  s.box([-1.5,-2.35,0],[1.6,.15,1.2],DK);s.cyl([-1.9,0,0],[0,1,0],.06,4.6,MT);s.box([-1.1,top+.15,0],[1.7,.14,.25],MT2);s.box([0,top+.1,0],[.6,.3,.5],'#7d858d');for(const z of[-.15,.15])s.cyl([0,top+.1,z],[1,0,0],.03,.7,MT);
  s.cyl([0,top-L/2,0],[0,1,0],r,L,'#c4ccd2',{seg:28});s.cyl([0,top-2.2/2,0],[0,1,0],.22,2.2,'#ffffff',{alpha:.12,caps:false});
  s.box([0,yb-.12,0],[.6,.26,.5],'#7d858d');const b=hanger(s,[0,yb-.28,0],3,.24);s.arrow([.55,yb-.3,0],[.55,yb-.3-p.F/2000,0],C.gold,3,11,`F = ${p.F} N`);
  const ym=top-L*.5,CP='#ced4da';s.box([.7,ym+.32,.0],[1.9,.12,.05],CP);s.box([-r-.05,ym+.06,0],[.07,.42,.05],CP);s.box([r+.05,ym+.06,0],[.07,.42,.05],CP);s.box([r+.2,ym+.32,.0],[.35,.18,.07],'#adb5bd');
  for(let i=0;i<14;i++)s.seg([r+.4+i*.09,ym+.38,.03],[r+.4+i*.09,ym+(i%5===0?.3:.34),.03],'#212529',.8);
  s.label([1.1,ym-.2,0],`d = ${f(p.d*(1-p.sg*e),5)} mm`,C.gold,12);s.label([-.75,top-L*.25,0],`L stretches by ${f(e*100,3)}%`,C.gold,12,'right');
  part(s,[0,top+.25,0],'clamp',40,-30);part(s,[0,top-L*.75,r],'test rod (ghost: unstretched)',-70,10);part(s,[1.4,ym+.38,0],'vernier calipers',40,-30);part(s,[0,b+.1,.25],'load',-50,10);
  s.render();tag(c,'Deformation exaggerated; ghost shows the unstretched wire',44,98,C.muted,13)};

R['elastic-energy']=(c,p,t)=>{const A=PI*(p.d/2000)**2,e=p.F/(A*p.Y*1e9),Ls=.9+p.L*.45,ext=clamp(e*p.L*60,0,1),s=P3.scene(c,{scale:42,cy:275,cx:240,pitch:-.25}),top=2.1,yw=top-.1-Ls-ext,n=clamp(Math.round(p.F/150),1,10);
  beam(s,[0,top+.1,0],1.8);chuck(s,[0,top-.08,0]);s.cyl([0,(top-.16+yw)/2,0],[0,1,0],.012+p.d*.006,top-.16-yw,'#e3e7ea',{seg:8});s.cyl([0,yw-.05,0],[0,1,0],.06,.1,MT2);
  s.box([.0,yw+.25,.07],[.03,.03,.14],'#212529');s.poly([[.0,yw+.25,.14],[.35,yw+.25,.14],[.35,yw+.21,.14]],'#e03131',{cull:false,shade:false});
  s.box([.62,top-1.6,-.05],[.28,3.2,.06],'#f1e3b5');for(let i=0;i<=40;i++){const y=top-.05-i*.075;s.seg([.48,y,-.01],[.48+(i%5===0?.14:.07),y,-.01],'#1b1f23',i%5===0?1.2:.7)}
  const b=hanger(s,[0,yw-.1,0],n,.22);s.arrow([-.55,b+.3,0],[-.55,b-.2-p.F/3000,0],C.gold,3,10,`F = ${p.F} N`);s.seg([.35,top-.1-Ls+.25,.14],[.7,top-.1-Ls+.25,.14],C.muted,1,[3,3]);
  part(s,[0,top-.5,0],`steel wire, L = ${p.L} m, d = ${p.d} mm`,-40,-30);part(s,[.35,yw+.25,.14],'pointer',50,20);part(s,[.62,top-.3,-.05],'mm scale',50,-10);part(s,[0,b+.2,.25],'slotted masses',-60,20);
  s.render();const dL=e*p.L;tag(c,`U = ½FΔL = ${f(.5*p.F*dL,4)} J`,44,98,C.gold,15);
  chart(c,420,96,236,150,{title:'F–ΔL: area = energy',xl:'ΔL',xmin:0,xmax:1,ymin:0,ymax:1,series:[{fn:x=>x,col:C.gold},{pts:[[p.F/1500,0],[p.F/1500,p.F/1500]],col:C.mint,dash:[3,3]}],marker:[p.F/1500,p.F/1500]})};

R['thermal-stress']=(c,p,t)=>{const s=P3.scene(c,{scale:54,cy:270,cx:330,pitch:.05}),heat=p.dT/100,m={steel:[200e9,12e-6],copper:[117e9,17e-6],aluminium:[70e9,23e-6]}[p.mat],col={steel:'#b8c0c8',copper:'#d9844a',aluminium:'#dfe4e8'}[p.mat],r=.15+Math.sqrt(p.A)*.06,Fk=`F = ${f(m[0]*m[1]*p.dT*p.A*1e-4/1000,1)} kN`;
  s.box([0,-1.45,0],[6.6,.25,2],DK);for(const sg of[-1,1]){const x=sg*2.65;s.box([x,-.2,0],[.5,2.3,1.6],'#4b6e94');s.box([x-sg*.3,0,0],[.12,.8,.8],MT2);for(const z of[-.6,.6])s.cyl([x,-1.3,z],[0,1,0],.08,.12,MT)}
  s.cyl([0,0,0],[1,0,0],r,4.9,col,{seg:22});const hot=Math.round(255*heat);s.cyl([0,0,0],[1,0,0],r*1.04,4.6*Math.min(1,heat*1.2)+.01,'#ff5a3c',{alpha:.38*heat+.04,caps:false,seg:22});
  for(const x of[-1.4,0,1.4]){s.cyl([x,-1.1,0],[0,1,0],.18,.12,'#495057');s.cyl([x,-.75,0],[0,1,0],.07,.6,'#868e96');s.cyl([x,-.4,0],[0,1,0],.08,.1,'#5c636a');for(let i=0;i<5;i++){const j=hash(i+x*7+Math.floor(t*12));s.ball([x+(j-.5)*.05,-.3+i*.08,0],(.08-.012*i)*(.4+heat*.8),i<2?'#74c0fc':'#ffa94d',{flat:true,glow:true})}}
  s.cyl([.7,.55,0],[0,1,0],.04,.8,GL,{alpha:.5});s.cyl([.7,.2+.6*heat/2,0],[0,1,0],.018,.6*heat+.02,'#e03131');s.ball([.7,.15,0],.06,'#e03131');
  s.arrow([-1.9,.9,0],[-2.3-heat*.3,.9,0],C.red,3,11,Fk);s.arrow([1.9,.9,0],[2.3+heat*.3,.9,0],C.red,3,11,Fk);s.label([0,1.45,0],'rod pushes on the walls',C.red,13);
  part(s,[-.9,-r,.1],`${p.mat} rod, A = ${p.A} cm²`,-30,70);part(s,[2.65,.95,.8],'rigid wall',30,-30);part(s,[-1.4,-1.1,0],'burners',-40,40);part(s,[.7,.95,0],`thermometer (ΔT = ${p.dT} K)`,60,-10);
  s.render()};

/* ---------- Mechanical Properties of Fluids ---------- */
// rectangular glass tank: thin panes, bright edges, dark rubber-sealed rim
function tank(s,o,[w,h,d],rim='#2b3035'){const [x,y,z]=o;s.box([x,y+h/2,z],[w,h,d],GL,{alpha:.07});const X=[x-w/2,x+w/2],Y=[y,y+h],Z=[z-d/2,z+d/2];
  for(const a of X)for(const b of Z)s.seg([a,Y[0],b],[a,Y[1],b],'#e7f5ffaa',1.4);for(const a of Y)for(const b of Z)s.seg([X[0],a,b],[X[1],a,b],'#e7f5ff99',1.2);for(const a of Y)for(const b of X)s.seg([b,a,Z[0]],[b,a,Z[1]],'#e7f5ff99',1.2);
  s.box([x,y-.03,z],[w+.06,.06,d+.06],rim);s.seg([X[0]+.08,Y[1]-.1,Z[1]],[X[0]+.25,Y[0]+.15,Z[1]],'#ffffff55',2)}
const water=(s,o,[w,h,d],col=WA,a=.32)=>{const [x,y,z]=o;s.box([x,y+h/2,z],[w,h,d],col,{alpha:a});s.poly([[x-w/2,y+h,z+d/2],[x+w/2,y+h,z+d/2],[x+w/2,y+h,z-d/2],[x-w/2,y+h,z-d/2]],'#a5d8ff',{alpha:.28,normal:[0,1,0],spec:.6})};
const benchTop=(s,y,w=7.5,d=2.6,x=0)=>s.box([x,y-.08,0],[w,.16,d],WOOD,{ground:true});
// glass beaker / cylinder by revolution
const beaker=(s,o,r,h,lvl,liq=WA,la=.33)=>{rev(s,o,[0,1,0],[[r*.92,0],[r,.04],[r,h],[r*1.04,h+.02]],GL,{alpha:.12,segs:28});if(lvl>0){s.cyl(V.add(o,[0,lvl/2+.02,0]),[0,1,0],r*.97,lvl,liq,{alpha:la,seg:28});s.ring(V.add(o,[0,lvl+.02,0]),[0,1,0],r*.97,'#d0ebff99',1.2)}s.ring(V.add(o,[0,h+.02,0]),[0,1,0],r*1.04,'#e7f5ffcc',1.6);for(let i=1;i<6;i++){const y=h*i/6,a=-.35;s.seg(V.add(o,[r*Math.sin(a),y,r*Math.cos(a)]),V.add(o,[r*Math.sin(a)+.12,y,r*Math.cos(a)]),'#e9f6ffaa',1)}};
const stand=(s,base,h,armY,armX)=>{s.box(V.add(base,[0,.05,0]),[1.1,.1,.8],DK);s.cyl(V.add(base,[-.35,h/2,0]),[0,1,0],.04,h,MT);s.box(V.add(base,[-.35,armY,0]),[.14,.14,.14],'#495057');s.cyl(V.add(base,[(-.35+armX)/2,armY,0]),[1,0,0],.025,Math.abs(armX+.35),MT2)};

R['buoyancy']=(c,p,t)=>{const s=P3.scene(c,{scale:54,cy:290,cx:330,pitch:-.05}),sub=p.objectDensity/p.fluidDensity,a=.6+Math.cbrt(p.volume)*.18,top=-1.4+2.1,bob=.03*Math.sin(t*2);
  benchTop(s,-1.47,7,3);tank(s,[0,-1.4,0],[4,3,2.4]);water(s,[0,-1.4,0],[3.96,2.1,2.36]);
  const y=sub>=1?-1.4+a/2+.02:top-a/2+a*(1-Math.min(1,sub))+bob;s.box([0,y,0],[a,a,a],'#b07a46');for(let i=1;i<5;i++)s.seg([-a/2+a*i/5+.02*Math.sin(i*3),y-a/2,a/2+.003],[-a/2+a*i/5-.03*Math.cos(i*2),y+a/2,a/2+.003],'#7a4f2a',1);
  if(sub<1)for(let k=1;k<3;k++)s.ring([0,top+.005,0],[0,1,0],a*.75+k*.25+.08*Math.sin(t*2+k),'#d0ebff66',1);
  s.arrow([0,y-a/2,0],[0,y-a/2+.5*Math.min(1,sub)+.2,0],C.mint,3,11,`F_B = ${f(p.fluidDensity*p.volume/1000*Math.min(1,sub)*G,1)} N`);s.arrow([0,y+a/2,0],[0,y+a/2-.6,0],C.gold,3,11,`W = ${f(p.objectDensity*p.volume/1000*G,1)} N`);
  part(s,[-1.9,1.5,1.2],'glass tank',-30,-20);part(s,[-1.5,-.8,1.2],`liquid, ρ = ${p.fluidDensity} kg/m³`,-30,50);part(s,[-a/2,y+a/4,a/2],`wooden block, ρ = ${p.objectDensity} kg/m³`,-70,-50);
  s.render();tag(c,sub>=1?'Sinks (denser than the fluid)':`Floats with ${f(sub*100,0)}% submerged`,44,98,sub>=1?C.red:C.mint,15)};

const flange=(s,x,r,col=MT2)=>{s.cyl([x,0,0],[1,0,0],r+.12,.1,col,{seg:24});for(let i=0;i<6;i++){const a=TAU*i/6+.5;s.cyl([x,(r+.07)*Math.cos(a),(r+.07)*Math.sin(a)],[1,0,0],.025,.16,'#495057',{seg:8})}};
R['continuity']=(c,p,t)=>{const s=P3.scene(c,{scale:54,pitch:.0,cy:255}),r1=.15+Math.sqrt(p.area1)*.15,r2=.15+Math.sqrt(p.area2)*.15,v2=p.area1*p.speed/p.area2;
  for(const x of[-2.6,-.6])s.box([x,-1.3,0],[.15,1.4-r1,.5],DK);s.box([2.4,-1.3,0],[.15,1.4-r2,.5],DK);s.box([0,-2.05,0],[7,.1,1.2],'#3b4248');
  s.cyl([-1.95,0,0],[1,0,0],r1,3.1,WA,{alpha:.22,caps:false,seg:24});s.cyl([-1.95,0,0],[1,0,0],r1+.03,3.1,GL,{alpha:.1,caps:false,seg:24});
  rev(s,[-.4,0,0],[1,0,0],[[r1+.03,0],[r2+.03,.6]],GL,{alpha:.12,segs:24});rev(s,[-.4,0,0],[1,0,0],[[r1,0],[r2,.6]],WA,{alpha:.22,segs:24});
  s.cyl([1.75,0,0],[1,0,0],r2,3.1,WA,{alpha:.22,caps:false,seg:24});s.cyl([1.75,0,0],[1,0,0],r2+.03,3.1,GL,{alpha:.1,caps:false,seg:24});
  flange(s,-3.5,r1);flange(s,-.4,r1);flange(s,.2,r2);flange(s,3.3,r2);
  for(let i=0;i<14;i++){const lane=(hash(i)-.5)*1.4,x1=-3.5+cycle(t*p.speed*.5+hash(i+3)*3.1,3.1),x2=.2+cycle(t*v2*.5+hash(i+7)*3.1,3.1);s.ball([x1,lane*r1,(hash(i+9)-.5)*r1],.045,'#ffffff',{flat:true});s.ball([x2,lane*r2,(hash(i+11)-.5)*r2],.045,'#ffffff',{flat:true})}
  for(const k of[-.5,0,.5]){s.path([[-3.5,k*r1,0],[-.4,k*r1,0],[.2,k*r2,0],[3.3,k*r2,0]],'#ff6b6b88',1.3)}
  s.arrow([-1.95,r1+.45,0],[-1.95+p.speed*.4,r1+.45,0],C.mint,3,11,`v₁ = ${p.speed} m/s`);s.arrow([1.75,r2+.45,0],[1.75+v2*.4,r2+.45,0],C.gold,3,11,`v₂ = ${f(v2,2)} m/s`);
  part(s,[-2.8,-r1,0],`A₁ = ${p.area1} cm²`,-20,60);part(s,[2.6,-r2,0],`A₂ = ${p.area2} cm²`,20,60);part(s,[-.1,-(r1+r2)/2,0],'conical reducer',0,70);part(s,[-1.2,r1*.5,0],'dye streamline',-10,-90);
  s.render();tag(c,`v₂ = ${f(v2,2)} m/s`,44,98,C.gold,15)};

R['torricelli']=(c,p,t)=>{const s=P3.scene(c,{scale:48,cy:285,cx:330,yaw:.3,pitch:-.12}),v=Math.sqrt(2*G*p.head),y0=1,k=.9,hole=[-1.1,-1.6+y0*k,0],H=(y0+p.head)*k;
  benchTop(s,-1.6,7.6,2.6,.6);tank(s,[-1.9,-1.6,0],[1.6,H+.35,1.2]);water(s,[-1.9,-1.6,0],[1.56,H,1.16]);
  s.cyl([-1.05,hole[1],0],[1,0,0],.07,.14,MT);s.cyl([-1.98,-1.6+H+.25,0],[0,1,0],.05,.5,MT2);s.cyl([-1.98,-1.6+H+.48,0],[1,0,0],.04,.5,MT2);s.tube([[-1.73,-1.6+H+.48,0],[-1.6,-1.6+H+.42,0],[-1.6,-1.6+H+.1,0]],.03,'#74c0fc',{segs:6,alpha:.6});
  const T=Math.sqrt(2*y0/G),pts=Array.from({length:21},(_,i)=>{const q=T*i/20;return[hole[0]+v*q*k,hole[1]-.5*G*q*q*k,0]});s.tube(pts,.03+Math.sqrt(p.area)*.03,'#74c0fc',{segs:6,alpha:.8});
  const land=pts[20];s.box([land[0],-1.52,0],[1.1,.14,.8],'#495057');s.box([land[0],-1.47,0],[1,.06,.7],WA,{alpha:.4});for(let i=0;i<6;i++){const a=TAU*i/6+t*3;s.ball([land[0]+.15*Math.cos(a),-1.38+.08*Math.abs(Math.sin(t*6+i)),.15*Math.sin(a)],.025,'#a5d8ff',{flat:true})}
  s.seg([-.95,hole[1],.62],[-.95,-1.6+H,.62],C.gold,1.5);s.label([-.85,(hole[1]-1.6+H)/2,.62],`h = ${p.head} m`,C.gold,12,'left');s.arrow(hole,[hole[0]+.6,hole[1],0],C.mint,3,10,`v = ${f(v,2)} m/s`);
  part(s,[-2.7,-1.6+H+.3,.6],'glass tank',-30,-20);part(s,[-1.98,-1.6+H+.5,0],'inflow keeps head constant',-30,-50);part(s,[-1.03,hole[1]-.06,0],`orifice (${p.area} cm²)`,-50,60);part(s,[land[0]+.5,-1.5,.4],'catch tray',30,30);
  s.render();tag(c,`v = √(2gh) = ${f(v,2)} m/s`,44,98,C.gold,15)};

R['terminal-speed']=(c,p,t)=>{const s=P3.scene(c,{scale:48,cy:255,pitch:-.25}),vt=2*(p.radius/1000)**2*(p.density-1260)*G/(9*p.viscosity),tau=.3,tt=cycle(t,7),y=1.6-clamp((tt-tau*(1-Math.exp(-tt/tau)))*.45,0,3.1);
  s.cyl([0,-2.2,0],[0,1,0],.9,.12,'#2b3035',{seg:6});rev(s,[0,-2.14,0],[0,1,0],[[.62,0],[.62,4.15],[.66,4.2]],GL,{alpha:.12,segs:28});s.cyl([0,-.1,0],[0,1,0],.6,4.05,'#f0c419',{alpha:.28,seg:28});s.ring([0,1.95,0],[0,1,0],.6,'#fff3bf99',1.2);
  for(let i=0;i<=16;i++){const yy=-1.9+i*.24,a=-.5;s.seg([.62*Math.sin(a),yy,.62*Math.cos(a)],[.62*Math.sin(a)+(i%4===0?.2:.1),yy,.62*Math.cos(a)],'#e9f6ffbb',1)}
  for(const yy of[.4,-1.4])s.ring([0,yy,0],[0,1,0],.64,'#e03131',3);
  const rb=.06+p.radius*.06;s.ball([0,y,0],rb,'#adb5bd');s.arrow([.5,y,0],[.5,y+.2+p.viscosity*.04,0],C.red,2.5,11,'drag 6πηrv');s.arrow([-.5,y,0],[-.5,y-.6,0],C.gold,2.5,11,`W = ${f(p.density*4/3*PI*(p.radius/1000)**3*G*1000,3)} mN`);
  part(s,[-.6,1.2,0],'graduated cylinder',-60,-20);part(s,[.55,-.6,.2],'glycerine',60,20);part(s,[.64,.4,0],'timing marks',60,-10);part(s,[0,y-rb,0],'steel ball',-70,40);
  s.render();tag(c,`terminal speed ≈ ${f(vt*100,2)} cm/s`,44,98,C.gold,15)};

R['hydraulic-lift']=(c,p,t)=>{const s=P3.scene(c,{scale:50,cy:285,cx:330,pitch:-.05}),r1=.15+Math.sqrt(p.a1)*.08,r2=.15+Math.sqrt(p.a2)*.08,ph=.5-.5*Math.cos(t),d1=ph*.8,d2=d1*p.a1/p.a2,OIL='#e8a33d';
  s.box([0,-1.75,0],[5.4,.2,1.6],DK);s.box([-.2,-1.4,0],[3.6,.4,.5],OIL,{alpha:.4});s.box([-.2,-1.4,0],[3.66,.46,.56],GL,{alpha:.1});
  for(const [x,r,top] of[[-1.8,r1,.2-d1],[1.4,r2,.2+d2]]){s.cyl([x,-.55,0],[0,1,0],r+.04,1.9,GL,{alpha:.12,caps:false,seg:26});s.cyl([x,(-1.2+top)/2,0],[0,1,0],r,top+1.2,OIL,{alpha:.4,seg:26});s.cyl([x,.42,0],[0,1,0],r+.08,.08,MT2,{seg:26});s.cyl([x,-1.2,0],[0,1,0],r+.08,.08,MT2,{seg:26});s.cyl([x,top+.06,0],[0,1,0],r,.12,'#adb5bd',{seg:26})}
  s.cyl([-1.8,.75-d1,0],[0,1,0],.04,1.1,MT);s.cyl([-1.8,1.32-d1,0],[1,0,0],.04,.6,MT);s.arrow([-1.8,2.1-d1,0],[-1.8,1.4-d1,0],C.gold,4,11,`F₁ = ${p.force} N`);
  const ty=.32+d2;s.box([1.4,ty,0],[Math.max(1.1,r2*2+.3),.06,.8],'#868e96');s.box([1.4,ty+.2,0],[1.1,.24,.55],'#d23b3b');s.box([1.35,ty+.42,0],[.6,.2,.5],'#c92a2a');s.box([1.35,ty+.42,0],[.5,.14,.52],'#a5d8ff',{alpha:.6});for(const dx of[-.35,.35])for(const dz of[-.28,.28])s.cyl([1.4+dx,ty+.1,dz],[0,0,1],.09,.06,'#212529');
  s.cyl([-.2,-1.05,0],[0,1,0],.03,.3,MT2);s.cyl([-.2,-.82,.0],[0,0,1],.2,.08,'#212529',{cap:'#f1f3f5'});const ga=PI*(1.2-1.4*clamp(p.force/p.a1/100,0,1));s.seg([-.2,-.82,.05],[-.2+.15*Math.cos(ga),-.82+.15*Math.sin(ga),.05],'#e03131',2);
  s.arrow([2.35,ty+.2,0],[2.35,ty+.75,0],C.mint,3,10,`F₂ = ${f(p.force*p.a2/p.a1,0)} N`);
  part(s,[-1.8,-.5,r1],`small piston, A₁ = ${p.a1} cm²`,-40,-40);part(s,[1.4,-.5,r2],`large piston, A₂ = ${p.a2} cm²`,60,40);part(s,[-.2,-.65,0],`gauge: P = ${f(p.force/p.a1,1)} N/cm²`,-30,-90);part(s,[-1,-1.4,.25],'hydraulic oil',-40,50);
  s.render();tag(c,`F₂ = ${f(p.force*p.a2/p.a1,0)} N`,44,98,C.gold,15)};

R['capillary-rise']=(c,p,t)=>{const s=P3.scene(c,{scale:54,cy:300,pitch:-.2}),h=2*p.tension/1000*Math.cos(rad(p.angle))/(1000*G*p.radius/1000),hy=clamp(h*40,-1.2,2.5),r=.06+p.radius*.06,conc=p.angle<90,LQ=conc?WA:'#b8c2cc',ys=-.3;
  benchTop(s,-1.75,6,2.4);beaker(s,[0,-1.75,0],1.25,1.75,1.45,LQ,conc?.33:.75);stand(s,[-1.6,-1.75,0],4.4,2.35,0);s.box([0,2.35,0],[.22,.16,.2],'#495057');
  s.cyl([0,.8,0],[0,1,0],r+.035,3.6,'#ffffff',{alpha:.18,caps:false,seg:18});s.ring([0,2.6,0],[0,1,0],r+.035,'#e7f5ffcc',1.2);s.seg([r+.03,-1.1,r*.5],[r+.03,2.5,r*.5],'#ffffff66',1.2);
  s.cyl([0,(ys+(ys+hy))/2,0],[0,1,0],r,Math.abs(hy)+.01,LQ,{alpha:conc?.75:.9,seg:16});s.mesh([0,ys+hy,0],[r,r*.6,r],LQ,{alpha:.8,shape:(u)=>conc?(u>0?.15:1):(u>0?1:.15),rings:8,segs:14});
  s.box([.42,.6,-.15],[.3,3.2,.04],'#f1e3b5');for(let i=0;i<=32;i++){const yy=ys+(i-8)*.1;if(yy>2.15)break;s.seg([.3,yy,-.12],[.3+(i%5===0?.16:.08),yy,-.12],'#1b1f23',i%5===0?1.1:.6)}s.engrave([.47,ys,-.12],'0','#1b1f23',9);
  s.seg([-.6,ys,0],[.9,ys,0],C.muted,1,[4,4]);s.seg([-.4,ys+hy,0],[-.15,ys+hy,0],C.gold,1.5);s.arrow([-.3,ys,0],[-.3,ys+hy,0],C.gold,2,8,`h = ${f(h*1000,1)} mm`);
  part(s,[0,ys+hy+.05,0],conc?'concave meniscus':'convex meniscus',60,-30);part(s,[0,2,r],`capillary tube (r = ${p.radius} mm)`,-60,-10);part(s,[-1.1,-.6,.6],conc?'water':'mercury-like liquid',-30,40);part(s,[.57,1.6,-.15],'scale',50,0);
  s.render();tag(c,h>=0?`Rise h = ${f(h*1000,1)} mm`:`Depression ${f(-h*1000,1)} mm`,44,98,C.gold,15)};

R['venturimeter']=(c,p,t)=>{const Q=p.Q/1000,A1=PI*(p.D1/200)**2,A2=PI*(p.D2/200)**2,v1=Q/A1,v2=Q/A2,dh=(v2*v2-v1*v1)/(2*G),s=P3.scene(c,{scale:52,cy:290,pitch:-.15}),r1=.12+p.D1*.05,r2=.12+p.D2*.05;
  const prof=x=>{const a=Math.abs(x);return a<.5?r2:a<1.5?r2+(r1-r2)*(a-.5):r1};s.box([0,-1.25,0],[7.8,.1,1.6],'#3b4248');for(const x of[-3,3])s.box([x,-.6-r1/2,0],[.2,1.2-r1,.5],DK);
  const xs=Array.from({length:49},(_,i)=>-3.6+i*.15);s.tube(xs.map(x=>[x,0,0]),i=>prof(-3.6+i*7.2),WA,{segs:20,alpha:.2});s.tube(xs.map(x=>[x,0,0]),i=>prof(-3.6+i*7.2)+.03,GL,{segs:20,alpha:.1});
  for(const x of[-3.6,-1.5,1.5,3.6])flange(s,x,prof(x),MT2);
  const tab=memo('vt'+r1+r2,()=>{const xs=[],ts=[];let tau=0;for(let i=0;i<=144;i++){const x=-3.6+i*.05;xs.push(x);ts.push(tau);tau+=.05*(prof(x)/r1)**2}return{xs,ts,total:tau}}),xAt=tau=>{let i=1;while(i<tab.ts.length-1&&tab.ts[i]<tau)i++;return tab.xs[i]};
  for(let i=0;i<30;i++){const lane=(hash(i)-.5)*1.4,x=xAt(cycle(hash(i+40)*tab.total+t*.9,tab.total));s.ball([x,lane*prof(x),(hash(i+90)-.5)*prof(x)*1.2],.04,'#ffffff',{flat:true})}
  const h0=1.6,hh1=h0,hh2=clamp(h0-dh*4,.25,h0);s.box([-1.2,1.3,-.2],[3.2,2.4,.05],'#f1e3b5');for(let i=0;i<=22;i++){const y=.25+i*.1;s.seg([-2.75,y,-.17],[-2.75+(i%5===0?.18:.09),y,-.17],'#1b1f23',i%5===0?1.1:.6);s.seg([.3,y,-.17],[.3-(i%5===0?.18:.09),y,-.17],'#1b1f23',i%5===0?1.1:.6)}
  for(const [x,h,lab] of [[-2.4,hh1,'P₁'],[0,hh2,'P₂']]){const rr=prof(x);s.cyl([x,rr+1.2,0],[0,1,0],.09,2.4,'#ffffff',{alpha:.15,caps:false});s.ring([x,rr+2.4,0],[0,1,0],.09,'#e7f5ffcc',1.2);s.cyl([x,(h+rr)/2,0],[0,1,0],.075,h-rr,'#3fa7d6',{alpha:.85});s.mesh([x,h,0],[.075,.03,.075],'#3fa7d6',{alpha:.85,rings:6,segs:10});s.cyl([x,rr+.05,0],[0,1,0],.13,.1,MT2);s.label([x,2.75,0],lab,C.gold,14)}
  s.seg([-2.6,hh1,0],[.25,hh1,0],C.muted,1,[3,3]);s.label([.9,(hh1+hh2)/2,0],`Δh = ${f(dh*100,1)} cm`,C.gold,13);
  part(s,[-2.6,-r1,0],`inlet D₁ = ${p.D1} cm`,-30,60);part(s,[0,-r2,0],`throat D₂ = ${p.D2} cm`,10,70);part(s,[0,1.2,.09],'manometer tubes',60,-30);part(s,[2.5,prof(2.5),0],'diverging cone',40,-40);
  s.render()};

R['pressure-depth']=(c,p,t)=>{const rho=Number(p.fluid),col=rho>2000?'#b8c2cc':rho<900?'#d9a441':'#3fa7d6',s=P3.scene(c,{scale:50,cy:300,cx:360,yaw:.2,pitch:-.12}),Hs=.6+p.H*.55,W=1+p.W*.4,yb=-1.5;
  benchTop(s,yb,8,2.4,-.6);tank(s,[0,yb,0],[W,3.4,1.6]);water(s,[0,yb,0],[W-.04,Hs,1.56],col,rho>2000?.7:.5);const yp=yb+Hs-p.h*Hs;
  // thistle-funnel probe with rubber membrane, linked by tubing to a U-tube manometer
  s.cyl([0,(2.1+yp)/2+.1,0],[0,1,0],.03,2.1-yp-.1,GL,{alpha:.5});rev(s,[0,yp,0],[0,1,0],[[.2,0],[.12,.08],[.035,.22]],GL,{alpha:.35,segs:18});s.cyl([0,yp-.01,0],[0,1,0],.2,.02,'#e8590c',{seg:18});
  const mx=-W/2-1.1,gp=rho*G*p.h*p.H,dhm=clamp(gp/(1000*G)*.12,0,1.3);s.tube([[0,2.1,0],[0,2.35,0],[mx*.5,2.45,0],[mx+.3,2.35,0],[mx+.3,1.75,0]],.035,'#c92a2a',{segs:6});
  s.box([mx,.55,-.12],[1,3,.06],'#f1e3b5');for(let i=0;i<=26;i++){const y=-.8+i*.1;s.seg([mx-.1,y,-.09],[mx+.1-(i%5===0?0:.08),y,-.09],'#1b1f23',i%5===0?1:.6)}
  s.tube([[mx+.3,1.75,0],[mx+.3,-.85,0],[mx+.25,-.95,0],[mx-.25,-.95,0],[mx-.3,-.85,0],[mx-.3,1.85,0]],.05,GL,{segs:8,alpha:.2});
  s.cyl([mx+.3,(-.9+.4-dhm/2)/2,0],[0,1,0],.04,.4-dhm/2+.9,'#3fa7d6',{alpha:.9});s.cyl([mx-.3,(-.9+.4+dhm/2)/2,0],[0,1,0],.04,.4+dhm/2+.9,'#3fa7d6',{alpha:.9});s.box([mx,-.95,0],[.56,.08,.08],'#3fa7d6',{alpha:.9});
  s.seg([mx+.3,.4-dhm/2,0],[mx-.45,.4-dhm/2,0],C.muted,1,[3,3]);s.label([mx-.5,.4,0],`Δh`,C.gold,12,'right');
  for(let i=1;i<=5;i++){const y=yb+Hs-i*Hs/5,L=i*.12;s.arrow([W/2+.05,y,0],[W/2+.05+L,y,0],C.gold,2,7,`P = ${f(rho*G*p.H*i/5/1000,1)} kPa`)}s.label([0,yp-.35,0],`${f(rho*G*p.h*p.H/1000,1)} kPa gauge`,C.white,13);
  part(s,[0,yp+.1,.2],'thistle funnel + membrane',-80,30);part(s,[mx-.3,1.6,0],'U-tube manometer',-30,-30);part(s,[-W/2,yb+Hs*.4,.8],rho>2000?'mercury':rho<900?'oil':'water',-50,40);
  s.render();tag(c,'gold arrows: wall pressure grows linearly with depth',44,98,C.muted,13)};

R['drop-bubble-pressure']=(c,p,t)=>{const k=p.kind==='bubble'?4:2,s=P3.scene(c,{scale:56,cx:225,cy:265,pitch:-.15}),r=.4+Math.log10(p.r*10+1)*.55,dP=k*p.T/(p.r/1000);
  if(p.kind==='drop'){const o=[0,-.1,0];s.cyl([0,o[1]+r+1,0],[0,1,0],.06,2,GL,{alpha:.35});s.cyl([0,o[1]+r+2.15,0],[0,1,0],.16,.4,'#e03131');s.mesh(o,r,WA,{alpha:.7,shape:u=>u>.6?1+(u-.6)*.4:1,rings:14,segs:22});s.ball([-r*.35,o[1]+r*.35,r*.6],r*.12,'#ffffff',{flat:true,alpha:.7});part(s,[0,o[1]+r+1.2,0],'dropper',40,-20);part(s,[-r*.7,o[1]-r*.6,0],'liquid drop (1 surface)',-50,50)}
  else if(p.kind==='bubble'){s.cyl([-r-.9,0,0],[1,0,0],.08,1.8,GL,{alpha:.35});rev(s,[-r-.05,0,0],[1,0,0],[[.08,-.1],[.18,.05]],GL,{alpha:.3,segs:14});s.ball([0,0,0],r,'#b89dff',{alpha:.14,stroke:'#e9f6ffaa'});s.ball([0,0,0],r*.985,'#42d9ca',{alpha:.08});s.ball([-r*.4,r*.4,r*.5],r*.1,'#ffffff',{flat:true,alpha:.6});
    s.tube([[-r-1.4,0,0],[-r-1.4,-.6,0],[-r-1.4,-1.1,0],[-r-1.1,-1.25,0],[-r-.8,-1.1,0],[-r-.8,-.4,0]],.04,GL,{segs:6,alpha:.25});const mh=clamp(Math.log10(dP+1)*.12,0,.4);s.cyl([-r-1.4,-.95+mh/2,0],[0,1,0],.03,.4-mh,'#3fa7d6');s.cyl([-r-.8,-.95+mh,0],[0,1,0],.03,.4+mh,'#3fa7d6');part(s,[-r-1.1,-1.25,0],'manometer',-30,40);part(s,[0,-r,0],'soap bubble (2 surfaces)',40,50);part(s,[-r-1,0,0],'blowing tube',-20,-60)}
  else{s.box([0,-.2,0],[3.6,3.2,2.4],WA,{alpha:.25});tank(s,[0,-1.8,0],[3.64,3.4,2.44]);s.poly([[-1.8,1.4,1.2],[1.8,1.4,1.2],[1.8,1.4,-1.2],[-1.8,1.4,-1.2]],'#a5d8ff',{alpha:.25,normal:[0,1,0]});s.ball([0,0,0],r,'#e7f5ff',{alpha:.25,stroke:'#ffffffaa'});s.ball([-r*.4,r*.4,r*.5],r*.1,'#ffffff',{flat:true,alpha:.6});for(let i=0;i<5;i++)s.ball([.6+hash(i)*.4,-1+cycle(t*.4+hash(i+3),2.3),.3],.04+hash(i)*.04,'#e7f5ff',{alpha:.4});part(s,[0,-r,0],'air bubble in liquid (1 surface)',30,60);part(s,[-1.5,1.4,1.2],'water',-30,-30)}
  for(let i=0;i<10;i++){const a=TAU*i/10+t*.2,n=V.norm([Math.cos(a),Math.sin(a)*.8,Math.sin(a)*.6]);s.arrow(V.mul(n,r+.6),V.mul(n,r+.12),C.gold,2,7,i===0?`ΔP = ${f(dP,1)} Pa`:'')}
  s.render();chart(c,430,96,226,150,{title:'ΔP vs radius',xl:'r (mm)',xmin:.1,xmax:10,series:[{fn:x=>k*p.T/(x/1000),col:C.gold}],marker:[Math.min(10,p.r),k*p.T/(Math.min(10,p.r)/1000)],ymax:k*p.T/(.5/1000)})};

R['aerofoil-lift']=(c,p,t)=>{const s=P3.scene(c,{scale:54,yaw:.5,pitch:.0,cy:255}),span=1.2+p.A*.025,W=span+.2;
  const nac=[];for(let i=0;i<=16;i++){const x=1-Math.cos(PI*i/16)*1,xc=x/2;nac.push([xc,.12*5*(.2969*Math.sqrt(xc)-.126*xc-.3516*xc*xc+.2843*xc**3-.1015*xc**4)])}
  const top=nac.map(([x,y])=>[x*2.2-1.1,y*2.2+.04*Math.sin(PI*x)]),bot=nac.slice(1,-1).reverse().map(([x,y])=>[x*2.2-1.1,-y*1.1+.04*Math.sin(PI*x)]),prof=[...top,...bot];
  for(const z of[-span,span])s.poly(prof.map(([x,y])=>[x,y,z]),'#d4d9de',{stroke:'#00000033'});for(let i=0;i<prof.length;i++){const a=prof[i],b=prof[(i+1)%prof.length];s.poly([[a[0],a[1],-span],[b[0],b[1],-span],[b[0],b[1],span],[a[0],a[1],span]],'#c3cad1',{cull:false,spec:.6})}
  s.box([0,-1.1,0],[6.4,.06,2*W],'#2b3035',{ground:true});s.box([0,1.4,0],[6.4,.04,2*W],GL,{alpha:.06});for(const z of[-W,W])s.box([0,.15,z],[6.4,2.5,.04],GL,{alpha:.07});
  for(const y of[-1.1,1.4])for(const z of[-W,W])s.seg([-3.2,y,z],[3.2,y,z],'#e7f5ff88',1.2);for(const x of[-3.2,3.2])for(const z of[-W,W])s.seg([x,-1.1,z],[x,1.4,z],'#e7f5ff88',1.2);
  for(let i=0;i<=8;i++){const z=-W+2*W*i/8;s.seg([-3.2,-1.1,z],[-3.2,1.4,z],'#adb5bd55',1)}for(let i=0;i<=6;i++){const y=-1.1+2.5*i/6;s.seg([-3.2,y,-W],[-3.2,y,W],'#adb5bd55',1)}
  s.cyl([0,-.6,0],[0,1,0],.04,.9,MT);s.box([0,-1.25,0],[.5,.25,.5],'#495057');
  for(let j=0;j<5;j++){const z=-span+j*span/2,tp=[],bt=[];for(let i=0;i<=30;i++){const x=-3+i*.2,bump=Math.exp(-x*x*1.2);tp.push([x,.55+bump*.25,z]);bt.push([x,-.35-bump*.05,z])}s.path(tp,'#f1f3f5aa',1.5);s.path(bt,'#f1f3f5aa',1.5);
   const xt=-3+cycle(t*p.v*p.k*.03+j,6),xb=-3+cycle(t*p.v*.03+j,6);s.ball([xt,.55+Math.exp(-xt*xt*1.2)*.25,z],.05,C.mint,{flat:true});s.ball([xb,-.35-Math.exp(-xb*xb*1.2)*.05,z],.05,C.blue,{flat:true})}
  const L=.5*p.rho*(p.v**2*(p.k**2-1))*p.A;s.arrow([0,.4,0],[0,.4+clamp(L/2e5,.1,1.8),0],C.gold,4,11,`lift = ${f(L/1000,1)} kN`);
  s.label([-2.4,1.0,0],`v_top = ${f(p.v*p.k,0)} m/s`,C.mint,12);s.label([-2.4,-.7,0],`v_bottom = ${p.v} m/s`,C.blue,12);
  part(s,[.6,.1,span],'aerofoil (wing section)',40,40);part(s,[0,-1.25,.25],'lift balance',50,30);part(s,[-3.2,1.0,W],'honeycomb inlet',-30,-30);part(s,[2.6,1.4,-W],'wind-tunnel test section',30,-20);
  s.render()};
})();
