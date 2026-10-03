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
  stars(c,60,5);halo(c,s,O,Rp,'130,170,255',1.18,.5);sph(s,O,Rp,(la,lo)=>{const n=noise(Math.cos(la)*Math.cos(lo),Math.sin(la),Math.cos(la)*Math.sin(lo));return n>.9?'#8f6b4a':n>-.2?'#a67c52':'#7d5a3c'},{lat:14,lon:24});
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
})();
