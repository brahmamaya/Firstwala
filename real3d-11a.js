/* Detailed, realistic 3D apparatus for Class 11 physics (part a). */
(() => {
'use strict';
const R=window.PhysicaReal3D=window.PhysicaReal3D||{};
const {f,clamp,rad,deg,cycle,memo,tag,chart,PI,TAU,C}=window.PhysicaLab;
const P3=window.Physica3D,V=P3.vec,G=9.8;
// ---------- materials ----------
const CH='#d4d9de',AL='#c3c9cf',ST='#9aa1a8',DK='#596066',WOOD='#8a5a36',RUB='#1d1f22',GLASS='#9fd3f0',BRASS='#c9a227',CU='#c47a45';
const zf=(s,p)=>s.P(p)[2];
// ---------- shared apparatus ----------
// Wooden bench top (ground slab) with grain lines.
function bench(s,x,y,w,d,col=WOOD){s.box([x,y-.09,0],[w,.18,d],col,{ground:true});for(let i=1;i<9;i++){const z=-d/2+d*i/9,j=((i*37)%7-3)*.015;s.seg([x-w/2+.05,y+.002,z],[x+w/2-.05,y+.002,z+j],'#00000026',1,[],-4.6e5)}s.seg([x-w/2,y,d/2],[x+w/2,y,d/2],'#ffffff22',1,[],-4.6e5)}
// Flat floor made of strips (grass, tiles, asphalt) drawn far behind everything.
function floorStrips(s,x0,x1,z0,z1,y,cols,n=10,along='x'){for(let i=0;i<n;i++){const a=i/n,b=(i+1)/n;let pts;if(along==='x'){const za=z0+(z1-z0)*a,zb=z0+(z1-z0)*b;pts=[[x0,y,zb],[x1,y,zb],[x1,y,za],[x0,y,za]]}else{const xa=x0+(x1-x0)*a,xb=x0+(x1-x0)*b;pts=[[xa,y,z1],[xb,y,z1],[xb,y,z0],[xa,y,z0]]}s.poly(pts,cols[i%cols.length],{normal:[0,1,0],z:-6e5+i,stroke:'#00000018'})}}
const grass=(s,x0,x1,z0,z1,y)=>floorStrips(s,x0,x1,z0,z1,y,['#3f7d3a','#467f3e'],10,'z');
const tiles=(s,x0,x1,z0,z1,y)=>{floorStrips(s,x0,x1,z0,z1,y,['#5b6168','#555b62'],8,'x');for(let x=Math.ceil(x0*2)/2;x<x1;x+=.5)s.seg([x,y,z0],[x,y,z1],'#00000030',1,[],-5.9e5)};
// Road with kerbs and dashed lane markings; lanes: list of z centres to separate.
function road(s,x0,x1,z0,z1,y=0,marks=[]){s.poly([[x0,y,z1],[x1,y,z1],[x1,y,z0],[x0,y,z0]],'#34383d',{normal:[0,1,0],z:-6e5,stroke:'#00000030'});
  for(const z of[z0,z1])s.box([(x0+x1)/2,y+.03,z],[x1-x0,.06,.08],'#b9bcc0',{ground:true});
  for(const z of marks)for(let x=x0+.2;x<x1-.3;x+=.7)s.poly([[x,y+.004,z+.03],[x+.38,y+.004,z+.03],[x+.38,y+.004,z-.03],[x,y+.004,z-.03]],'#f1f3f5',{normal:[0,1,0],z:-5.95e5});
  for(let i=0;i<14;i++){const x=x0+(x1-x0)*((i*0.137)%1),z=z0+(z1-z0)*((i*0.389)%1);s.seg([x,y+.002,z],[x+.06,y+.002,z+.02],'#ffffff14',2,[],-5.96e5)}}
// Realistic car facing +x, centre-bottom at p; k = size; spin = wheel angle; brake lights.
function car(s,p,col,k=1,spin=0,brake=false){const [x,y,z]=p,L=1.3*k,W=.58*k,wr=.15*k,by=y+wr*.9;const A=(dx,dy,dz)=>[x+dx,y+dy,z+dz];
  s.box(A(0,wr*.9+.13*k,0),[L,.26*k,W],col);s.box(A(L/2+.01*k,wr*.9+.07*k,0),[.05*k,.1*k,W*.96],'#2b2e33');s.box(A(-L/2-.01*k,wr*.9+.07*k,0),[.05*k,.1*k,W*.96],'#2b2e33');
  const yb=by+.26*k-.02*k,yt=yb+.24*k,xr=-.42*k,xrt=-.3*k,xft=.18*k,xf=.4*k,w2=W/2*.92;
  const prof=[[xr,yb],[xrt,yt],[xft,yt],[xf,yb]];const at=(q,zz)=>A(q[0],q[1]-y,zz);
  for(const zz of[w2,-w2])s.poly(prof.map(q=>at(q,zz)),col,{normal:[0,0,Math.sign(zz)]});
  s.poly([at(prof[1],-w2),at(prof[2],-w2),at(prof[2],w2),at(prof[1],w2)],col,{normal:[0,1,0]});
  s.poly([at(prof[2],-w2),at(prof[3],-w2),at(prof[3],w2),at(prof[2],w2)],GLASS,{alpha:.9,spec:.9,shine:12});
  s.poly([at(prof[0],w2),at(prof[1],w2),at(prof[1],-w2),at(prof[0],-w2)],GLASS,{alpha:.9});
  // side windows with a B-pillar
  for(const zz of[w2+.004*k,-w2-.004*k]){const sh=(q,a)=>[q[0]*.86+a,q[1]-(q[1]-yb)*.18];const m=-.05*k;s.poly([sh(prof[0],.02*k),sh(prof[1],.01*k),[m-.02*k,yt-.04*k],[m-.02*k,yb+.03*k]].map(q=>at(q,zz)),'#7fb6d6',{normal:[0,0,Math.sign(zz)],spec:.8});s.poly([[m+.02*k,yb+.03*k],[m+.02*k,yt-.04*k],sh(prof[2],-.01*k),sh(prof[3],-.03*k)].map(q=>at(q,zz)),'#7fb6d6',{normal:[0,0,Math.sign(zz)],spec:.8});
    s.seg(A(-.2*k,by+.17*k,zz),A(-.12*k,by+.17*k,zz),'#e9ecef',1.5);s.seg(A(.18*k,by+.17*k,zz),A(.26*k,by+.17*k,zz),'#e9ecef',1.5)}
  for(const zz of[W/2-.08*k,-W/2+.08*k]){s.box(A(L/2+.005*k,by+.18*k,zz),[.03*k,.06*k,.12*k],'#fff4c2');s.box(A(-L/2-.005*k,by+.18*k,zz),[.03*k,.06*k,.12*k],brake?'#ff2d2d':'#9b1c1c')}
  if(brake)for(const zz of[W/2-.08*k,-W/2+.08*k])s.ball(A(-L/2-.04*k,by+.18*k,zz),.04*k,'#ff4040',{glow:true,flat:true});
  for(const dx of[-.36*k,.38*k])for(const zz of[W/2-.03*k,-W/2+.03*k]){const c=A(dx,wr,zz);s.cyl(c,[0,0,1],wr,.12*k,RUB,{cap:'#2a2d31'});const f=A(dx,wr,zz+Math.sign(zz)*.062*k);s.cyl(f,[0,0,1],wr*.6,.01*k,CH,{cap:'#c9ced3'});
    for(let i=0;i<5;i++){const a=spin+TAU*i/5;s.seg(f,A(dx+Math.cos(a)*wr*.55,wr+Math.sin(a)*wr*.55,zz+Math.sign(zz)*.07*k),'#6c737a',1.4,[],zf(s,f)+.02)}}}
// Dynamics trolley on a track: painted body, aluminium chassis, 4 wheels, spring plunger.
function trolley(s,p,col='#2f6db5',k=1,spin=0,flag=false){const [x,y,z]=p,A=(dx,dy,dz)=>[x+dx,y+dy,z+dz],wr=.09*k;
  s.box(A(0,wr+.1*k,0),[.9*k,.14*k,.42*k],AL);s.box(A(0,wr+.2*k,0),[.86*k,.06*k,.4*k],col);s.box(A(0,wr+.24*k,0),[.6*k,.02*k,.24*k],'#1f4e8a');
  s.cyl(A(.5*k,wr+.1*k,0),[1,0,0],.03*k,.12*k,CH);s.cyl(A(.57*k,wr+.1*k,0),[1,0,0],.05*k,.02*k,DK);s.cyl(A(-.47*k,wr+.1*k,0),[1,0,0],.04*k,.04*k,DK);
  for(const dx of[-.3*k,.3*k])for(const zz of[-.23*k,.23*k]){const c=A(dx,wr,zz);s.cyl(c,[0,0,1],wr,.05*k,RUB,{cap:'#2a2d31'});const fc=A(dx,wr,zz+Math.sign(zz)*.027*k);s.cyl(fc,[0,0,1],wr*.5,.005*k,CH);s.seg(fc,A(dx+Math.cos(spin)*wr*.45,wr+Math.sin(spin)*wr*.45,zz+Math.sign(zz)*.03*k),'#3b4046',1.2,[],zf(s,fc)+.02)}
  if(flag){s.box(A(0,wr+.42*k,0),[.3*k,.36*k,.01*k],'#1d1f22')}}
// Aluminium dynamics track with end stops, adjustable feet and a printed metre scale on the front face.
function alTrack(s,x0,x1,z=0,y=0,scale=null){const w=x1-x0,xm=(x0+x1)/2;s.box([xm,y-.04,z],[w,.08,.56],AL);for(const zz of[-.17,.17])s.box([xm,y+.015,z+zz],[w,.03,.04],CH);
  for(const xe of[x0+.06,x1-.06]){s.box([xe,y+.08,z],[.1,.16,.56],'#3a3f45');s.box([xe+(xe<xm?.07:-.07),y+.08,z],[.04,.1,.3],RUB)}
  for(const xe of[x0+.35,x1-.35]){s.cyl([xe,y-.14,z-.18],[0,1,0],.035,.14,ST);s.cyl([xe,y-.14,z+.18],[0,1,0],.035,.14,ST)}
  if(scale){const {n,step,lab}=scale;for(let i=0;i<=n;i++){const X=x0+.15+i*step;if(X>x1-.12)break;const big=i%5===0,pt=[X,y-.005,z+.281];s.seg(pt,[X,y-(big?.065:.035),z+.281],'#1b1f23',big?1.3:1,[],zf(s,pt)+.02);if(big&&lab)s.engrave([X,y-.072-.01,z+.282],lab(i),'#1b1f23',8)}}}
// Retort stand: cast base, steel rod, boss head and clamp arm reaching to (armTo).
function stand(s,base,top,armY,armTo,armZ=0){const [bx,by,bz]=base;s.box([bx,by+.05,bz],[1.1,.1,.6],'#30353b');s.box([bx,by+.11,bz],[1.0,.02,.5],'#3d434a');s.cyl([bx,by+(top-by)/2+.1,bz],[0,1,0],.04,top-by-.1,CH);s.ball([bx,top+.05,bz],.045,CH);
  s.box([bx,armY,bz],[.16,.16,.16],'#5a6068');s.cyl([bx,armY,bz+.13],[0,0,1],.02,.12,DK);s.cyl([bx,armY,bz+.2],[1,0,0],.04,.1,'#3d434a');
  const L=armTo-bx;s.cyl([bx+L/2,armY,bz],[1,0,0],.03,Math.abs(L),CH);s.box([armTo,armY,bz],[.1,.08,.12],'#5a6068');if(armZ)0}
// Lab stopwatch facing the viewer showing elapsed time T.
function stopwatch(s,p,T,r=.32){const [x,y,z]=p;s.cyl(p,[0,0,1],r,.12,'#2b2f35',{cap:'#2b2f35'});s.cyl([x,y,z+.065],[0,0,1],r*.86,.01,'#f4f4ee',{cap:'#f4f4ee'});s.cyl([x,y+r+.05,z],[0,1,0],.05,.1,CH);s.cyl([x,y+r+.12,z],[0,1,0],.08,.04,CH);s.cyl([x+r*.7,y+r*.75,z],[1,1,0],.04,.08,'#9aa1a8');
  const zf0=zf(s,[x,y,z+.08])+.05;for(let i=0;i<60;i+=5){const a=PI/2-TAU*i/60;s.seg([x+Math.cos(a)*r*.7,y+Math.sin(a)*r*.7,z+.072],[x+Math.cos(a)*r*.8,y+Math.sin(a)*r*.8,z+.072],'#1b1f23',1.2,[],zf0)}
  const a=PI/2-TAU*(T%60)/60;s.seg([x,y,z+.075],[x+Math.cos(a)*r*.75,y+Math.sin(a)*r*.75,z+.075],'#d62828',1.8,[],zf0+.01);s.engrave([x,y-r*.35,z+.08],f(T,2)+' s','#1b1f23',9,zf0+.01)}
// Sports ball with seams that spin with the flight.
function seamBall(s,p,r,col='#e8833a',seam='#3a1f10',spin=0){s.ball(p,r,col);s.ring(p,[Math.cos(spin),Math.sin(spin),.35],r*1.01,seam,1.3);s.ring(p,[Math.sin(spin),-Math.cos(spin),.2],r*1.01,seam,1.1)}
// Projectile launcher: clamp base, protractor quadrant and barrel at angle th (in the x-y plane, pointing +x).
function launcher(s,o,th,k=1){const [x,y,z]=o,A=(dx,dy,dz)=>[x+dx*k,y+dy*k,z+dz*k];s.box(A(0,.06,0),[.7*k,.12*k,.6*k],'#30353b');s.box(A(-.05,.25,0),[.1*k,.3*k,.36*k],'#4b5259');
  const pts=[A(0,.32,.2)];for(let i=0;i<=18;i++){const a=PI/2*i/18;pts.push(A(.42*Math.cos(a),.32+.42*Math.sin(a),.2))}s.poly(pts,'#e9ecef',{alpha:.85,normal:[0,0,1]});
  for(let i=0;i<=18;i++){const a=PI/2*i/18,q=A(.42*Math.cos(a),.32+.42*Math.sin(a),.205);s.seg(q,A(.36*Math.cos(a),.32+.36*Math.sin(a),.205),'#1b1f23',i%3?1:1.5,[],zf(s,q)+.03)}
  const d=[Math.cos(th),Math.sin(th),0],c0=A(0,.32,0);s.cyl(V.add(c0,V.mul(d,.3*k)),d,.08*k,.78*k,'#2f6db5',{cap:'#1b1f23'});s.cyl(V.add(c0,V.mul(d,.6*k)),d,.085*k,.06*k,'#ffc36b');s.cyl(c0,[0,0,1],.06*k,.44*k,CH);
  const q=A(.4*Math.cos(th),.32+.4*Math.sin(th),.21);s.seg(A(0,.32,.21),q,C.red,1.5,[],zf(s,q)+.04);return V.add(c0,V.mul(d,.7*k))}
// Simple person standing on y with walking phase ph, facing +x.
function person(s,p,ph=0,shirt='#3d6fb6',k=1){const [x,y,z]=p,A=(dx,dy,dz)=>[x+dx*k,y+dy*k,z+dz*k],sw=Math.sin(ph)*.35;
  for(const [zz,sg] of[[.09,1],[-.09,-1]]){const hip=A(0,.92,zz),foot=A(Math.sin(sw*sg)*.42,.05,zz);s.tube([hip,foot],.07*k,'#2b3a55',{segs:8});s.box(V.add(foot,[.06*k,-.0,0]),[.2*k,.08*k,.1*k],'#1d1f22')}
  s.tube([A(0,.9,0),A(0,1.45,0)],.17*k,shirt,{segs:12});s.ball(A(0,1.68,0),.13*k,'#e0b48a');s.ball(A(-.02,1.74,0),.125*k,'#3a2a1e');
  return{hand:A(.28,1.25,.18),shoulder:A(0,1.42,.17)}}
// Vertical surveyor pole with red/white bands every `step` world units.
function pole(s,x,z,y0,y1,step){for(let y=y0,i=0;y<y1-1e-6;y+=step,i++){const h=Math.min(step,y1-y);s.box([x,y+h/2,z],[.07,h,.07],i%2?'#f1f3f5':'#d23b3b')}}
const callout=(s,p,txt,dx,dy)=>s.callout(p,txt,C.mint,dx,dy,11);

/* ======================= Units and Measurements ======================= */
// Vernier caliper (stainless) gripping a copper rod.
R['units']=(c,p,t)=>{const s=P3.scene(c,{scale:66,pitch:.22,yaw:.3,cx:330,cy:236}),k=.6,m=clamp(p.measure,0,9),msr=Math.floor(p.measure*10)/10,vs=Math.round((p.measure-msr)*100),X0=-2.45,hx=X0+m*k,o=.15;
  bench(s,.3,-1.55,7.4,2.6);
  // beam
  s.box([.3,0,0],[6.2,.5,.08],CH);s.box([3.38,0,0],[.04,.5,.08],ST);const zb=zf(s,[0,0,.041])+.01;
  for(let i=0;i<=92;i++){const X=X0+o+i*k/10,cm=i%10===0,hf=i%5===0;s.seg([X,-.13,.041],[X,-.13+(cm?.17:hf?.12:.07),.041],'#1b1f23',cm?1.3:1,[],zb);if(cm)s.engrave([X,.12,.041],String(i/10),'#1b1f23',10,zb)}
  s.engrave([2.6,.15,.041],'cm','#1b1f23',9,zb);
  // fixed jaws
  s.poly([[X0,-.25,.04],[X0,-1.25,.04],[X0-.12,-1.25,.04],[X0-.42,-.25,.04]],CH,{normal:[0,0,1]});s.poly([[X0-.42,-.25,-.04],[X0-.12,-1.25,-.04],[X0,-1.25,-.04],[X0,-.25,-.04]],CH,{normal:[0,0,-1]});s.box([X0-.06,-.75,0],[.12,1,.079],'#c9ced3');
  s.poly([[X0,.25,.03],[X0,.62,.03],[X0-.07,.62,.03],[X0-.22,.25,.03]],CH,{normal:[0,0,1]});
  // sliding head with vernier plate
  s.box([hx+.62,-.33,.055],[1.3,.4,.03],'#c9ced3');s.box([hx+.62,-.33,-.055],[1.3,.4,.03],'#b9bfc5');s.box([hx+.62,.28,0],[1.3,.06,.14],'#b9bfc5');
  const zv=zf(s,[hx,-.3,.071])+.01;s.seg([hx+.02,-.13,.071],[hx+1.25,-.13,.071],'#1b1f23',1,[],zv);
  for(let j=0;j<=10;j++){const X=hx+o+j*.9*k/10,hit=j===vs;s.seg([X,-.13,.071],[X,-.13-(j%5===0?.14:.09),.071],hit?'#d62828':'#1b1f23',hit?2:1,[],zv);if(j%5===0)s.engrave([X,-.37,.071],String(j),'#1b1f23',9,zv)}
  s.engrave([hx+.95,-.42,.071],'0.02 mm'.replace('0.02 mm','LC 0.01 cm'),'#3b4046',8,zv);
  s.poly([[hx,-.48,.06],[hx,-1.25,.06],[hx+.12,-1.25,.06],[hx+.42,-.48,.06]],CH,{normal:[0,0,1]});s.box([hx+.06,-.86,0],[.12,.78,.079],'#c9ced3');
  s.poly([[hx,.31,.03],[hx+.22,.31,.03],[hx+.07,.62,.03],[hx,.62,.03]],CH,{normal:[0,0,1]});
  s.cyl([hx+.75,.38,0],[0,1,0],.07,.14,'#868e96',{cap:'#adb5bd'});s.cyl([hx+1.05,-.62,0],[0,0,1],.12,.08,'#868e96');for(let i=0;i<12;i++){const a=TAU*i/12;s.seg([hx+1.05+Math.cos(a)*.12,-.62+Math.sin(a)*.12,.04],[hx+1.05+Math.cos(a)*.12,-.62+Math.sin(a)*.12,-.04],'#3b4046',1)}
  if(m>0)s.box([3.4+m*k/2,-.2,0],[m*k,.04,.04],CH);
  // object held between the jaws
  if(m>.03)s.cyl([X0+m*k/2,-1.0,0],[1,0,0],.2,m*k-.01,CU,{cap:'#d9905a'});
  callout(s,[1.6,.2,.04],'main scale',30,-60);callout(s,[hx+.4,-.4,.07],'vernier scale',60,60);callout(s,[X0-.1,-1.05,.04],'fixed jaw',-50,30);callout(s,[hx+.1,-1.15,.06],'sliding jaw',50,40);callout(s,[hx+1.05,-.62,.04],'thumb wheel',70,20);callout(s,[hx+.75,.45,0],'lock screw',40,-40);
  s.render();tag(c,`MSR ${f(msr,1)} cm + VSR ${vs%10} × 0.01 cm`,44,98,C.gold,14)};

// Rectangular metal plate measured with two steel rules; error halos show the largest and smallest possible area.
R['uncertainty']=(c,p,t)=>{const s=P3.scene(c,{scale:44,pitch:.72,yaw:.05,cx:330,cy:262}),k=.18,L=p.length*k,W=p.width*k,e=p.error*k*1.5,y0=0;
  bench(s,0,y0,8.2,5.2);s.box([0,.03,0],[L,.06,W],'#b8bfc6');s.box([0,.061,0],[L-.06,.002,W-.06],'#cfd5da');
  for(let i=0;i<5;i++)s.seg([-L/2+.1,.065,-W/2+W*(i+.5)/5],[L/2-.1,.065,-W/2+W*(i+.5)/5+.03],'#ffffff18',1,[],-3e5);
  const rect=(dx,dz,col,w,d)=>s.path([[-L/2-dx,.075,-W/2-dz],[L/2+dx,.075,-W/2-dz],[L/2+dx,.075,W/2+dz],[-L/2-dx,.075,W/2+dz],[-L/2-dx,.075,-W/2-dz]],col,w,d,-2e5);
  rect(e,e,C.gold,2.4,[]);rect(-e,-e,C.mint,2,[5,4]);
  // steel rule along the length (front) and width (right)
  const rl=Math.ceil(p.length)+2,rw=Math.ceil(p.width)+2;s.box([-L/2+rl*k/2-.1,.02,W/2+.35],[rl*k+.2,.04,.42],CH,{ground:true});
  for(let i=0;i<=rl*2;i++){const X=-L/2+i*k/2,q=[X,.042,W/2+.14];s.seg(q,[X,.042,W/2+.14+(i%2?.08:i%10===0?.2:.13)],'#1b1f23',i%2?1:1.3,[],-1.5e5);if(i%10===0)s.engrave([X,.042,W/2+.42],String(i/2),'#1b1f23',9,-1.5e5)}
  s.box([L/2+.35,.02,W/2-rw*k/2+.1],[.42,.04,rw*k+.2],CH,{ground:true});
  for(let i=0;i<=rw*2;i++){const Z=W/2-i*k/2,q=[L/2+.14,.042,Z];s.seg(q,[L/2+.14+(i%2?.08:i%10===0?.2:.13),.042,Z],'#1b1f23',i%2?1:1.3,[],-1.5e5)}
  s.label([0,.35,W/2+.85],`L = ${p.length} ± ${p.error} cm`,C.gold,13);s.label([L/2+.75,.35,0],`W = ${p.width} ± ${p.error}`,C.gold,13,'left');
  callout(s,[-L/2+.4,.07,-W/2+.3],'metal plate',-40,-40);callout(s,[-L/2+1,.04,W/2+.45],'steel rule',-50,30);
  s.render();tag(c,'gold halo: largest possible area · inner: smallest',44,98,C.muted,13)};

// Raised needle pointer over a wooden metre rule, read by an eye from an angle.
R['parallax']=(c,p,t)=>{const s=P3.scene(c,{scale:56,pitch:.25,yaw:.3,cx:330,cy:285}),u=.7,X=cm=>-3+cm*u,x=X(p.truePosition),h=p.height*u,a=rad(p.angle),app=X(p.truePosition+p.height*Math.tan(a));
  bench(s,.5,-.12,8.6,3.6);s.box([.5,-.06,0],[7.6,.12,.8],'#d9b46a',{ground:true});s.box([.5,-.001,.39],[7.6,.002,.02],'#00000033',{ground:true});
  for(let i=0;i<=105;i++){const xx=X(i/10);if(xx>4.25)break;const cm=i%10===0,q=[xx,.001,.39];s.seg(q,[xx,.001,.39-(cm?.25:i%5===0?.17:.1)],'#1b1f23',cm?1.4:1,[],-4e5);if(cm)s.engrave([xx,.001,.06],String(i/10),'#1b1f23',11,-4e5)}
  // pointer: pillar block at the back, needle reaching over the scale
  const zb=-1.5;s.box([x,h/2-.02,zb],[.3,h+.04,.3],'#3b4046');s.cyl([x,h,zb+.2],[0,0,1],.07,.12,BRASS);s.tube([[x,h,zb+.2],[x,h,-.05],[x,h-.03,.1]],.025,'#2b2f35',{segs:6});
  // the eye on the line of sight through the needle tip
  const tip=[x,h-.03,.1],dir=V.norm([x-app,h,0]),eye=V.add(tip,V.mul(dir,2.4/Math.max(.5,dir[1])*.9));
  s.seg(eye,[app,0,.1],C.gold,1.5,[5,4]);s.seg([x,h+1.6,.1],[x,0,.1],'#8ca6b977',1,[3,4]);
  s.ball(eye,.2,'#f4f1ea');const look=V.norm(V.sub(tip,eye));s.cyl(V.add(eye,V.mul(look,.17)),look,.1,.04,'#4e7a3a',{cap:'#4e7a3a'});s.cyl(V.add(eye,V.mul(look,.19)),look,.045,.02,'#0b0b0b',{cap:'#0b0b0b'});
  s.ball([app,.03,.1],.06,C.gold);s.ball([x,.03,.1],.06,C.mint);s.label([app,-.35,.6],`${f(p.truePosition+p.height*Math.tan(a),2)} cm`,C.gold,12);
  callout(s,eye,'eye',-40,-20);callout(s,[x,h,-.6],'raised pointer',60,-40);callout(s,[X(.6),0,.1],'metre rule (mm)',-30,50);
  s.render();tag(c,'mint: true reading · gold: apparent reading',44,98,C.muted,13)};

// Spherometer on a plano-convex lens resting on a glass plate.
R['spherometer']=(c,p,t)=>{const h=p.turns+p.div*.01,s=P3.scene(c,{scale:60,pitch:.42,yaw:.15,cx:320,cy:300}),hv=Math.min(.8,h*.18),rho=p.legs/40*1.6/Math.sqrt(3),yb=-1.42;
  bench(s,0,-1.6,7,4.2);s.box([0,-1.51,0],[4.4,.18,3.2],GLASS,{alpha:.45,ground:true});
  let ytop,yleg;if(hv>.004){const Rc=(rho*rho+hv*hv)/(2*hv),Rl=Math.min(rho*1.4,Rc*.97),yr=r=>-(Rc-Math.sqrt(Rc*Rc-r*r));ytop=yb+.08-yr(Rl);yleg=ytop-hv;
    const prof=[[0,yb]];prof.push([Rl,yb]);for(let i=10;i>=0;i--){const r=Rl*i/10;prof.push([r,ytop+yr(r)])}s.lathe([0,0,0],prof,'#bfe3f5',{alpha:.5,segs:32});s.ring([0,yb+.08,0],[0,1,0],Rl,'#e9f6ff88',1)}
  else{ytop=yleg=yb+.08;s.cyl([0,yb+.04,0],[0,1,0],rho*1.4,.08,'#bfe3f5',{alpha:.5})}
  const yf=yleg+1.25,tipC=ytop,yd=tipC+1.55;
  // tripod frame
  const legs=[0,1,2].map(i=>{const a=TAU*i/3+PI/2;return[rho*Math.cos(a),rho*Math.sin(a)]});
  for(let i=0;i<3;i++){const [x1,z1]=legs[i],[x2,z2]=legs[(i+1)%3];s.tube([[x1,yf,z1],[x2,yf,z2]],.07,'#6c737a',{segs:8});s.tube([[x1,yf,z1],[0,yf,0]],.06,'#6c737a',{segs:8})}
  s.cyl([0,yf,0],[0,1,0],.2,.18,'#596066');
  for(const [x,z] of legs){s.cyl([x,(yf+yleg+.08)/2,z],[0,1,0],.04,yf-yleg-.08,CH);s.ball([x,yleg+.04,z],.04,ST);s.cyl([x,yf+.12,z],[0,1,0],.06,.08,'#868e96')}
  // central micrometer screw with thread
  s.cyl([0,(tipC+yd)/2,0],[0,1,0],.055,yd-tipC,CH);s.helix([0,(tipC+yd)/2+.1,0],[0,1,0],.06,yd-tipC-.4,14,'#868e96',1);s.ball([0,tipC+.03,0],.035,ST);
  // pitch (main) scale: vertical strip on the frame
  const px=rho*.0+.98,pz=0;s.box([px,yf+.85,pz],[.04,1.7,.18],'#e9ecef');for(let i=0;i<=10;i++){const y=yf+.1+i*.15,q=[px+.02,y,pz+.09];s.seg(q,[px+.02,y,pz-.02+(i%5?0:-.05)],'#1b1f23',i%5?1:1.4,[],zf(s,q)+.02);if(i%5===0)s.engrave([px+.03,y,pz+.16],String(i/5*5),'#1b1f23',8)}
  // circular scale disc (100 divisions) and milled head
  const dr=.9,ang=-TAU*p.div/100;s.cyl([0,yd,0],[0,1,0],dr,.08,'#c3c9cf',{cap:'#e2e6ea'});const zt=zf(s,[0,yd+.041,0])+.01;
  for(let j=0;j<100;j++){const a=ang+TAU*j/100,q=[dr*Math.cos(a),yd+.041,dr*Math.sin(a)],L=j%10===0?.16:j%5===0?.11:.06;s.seg(q,[(dr-L)*Math.cos(a),yd+.041,(dr-L)*Math.sin(a)],'#1b1f23',j%10===0?1.3:.8,[],zt);if(j%10===0)s.engrave([(dr-.26)*Math.cos(a),yd+.041,(dr-.26)*Math.sin(a)],String(j),'#1b1f23',8,zt)}
  s.seg([dr*.95,yd+.042,0],[dr+.12,yd+.042,0],'#d62828',2.4,[],zt+.01);
  s.cyl([0,yd+.18,0],[0,1,0],.22,.28,'#868e96',{cap:'#adb5bd'});for(let i=0;i<20;i++){const a=TAU*i/20+ang;s.seg([.22*Math.cos(a),yd+.05,.22*Math.sin(a)],[.22*Math.cos(a),yd+.31,.22*Math.sin(a)],'#4a5056',1)}
  if(hv>.004){s.seg([-rho*1.1,yleg,1.2],[0,yleg,1.2],C.gold,1,[3,3]);s.arrow([.15,yleg,0],[.15,tipC,0],C.gold,2,7)}
  s.label([0,-1.9,2.1],`h = ${f(h,2)} mm`,C.gold,15);
  callout(s,[dr*.7,yd+.04,dr*.5],'circular scale (100 div)',70,-30);callout(s,[px,yf+1.2,0],'pitch scale 1 mm',60,-10);callout(s,legs[2]?[legs[2][0],yleg+.3,legs[2][1]]:[0,0,0],'leg',50,20);callout(s,[-rho*1.1,yb+.05,.5],'convex lens',-60,10);callout(s,[0,yd+.32,0],'milled head',-60,-30);
  s.render();tag(c,'Leg spacing l = '+p.legs+' mm',44,98,C.muted,13)};

// Brass cube on an electronic balance with a vernier-ruled steel rule; error-budget chart kept.
R['error-propagation']=(c,p,t)=>{const s=P3.scene(c,{scale:58,yaw:.25,pitch:.35,cx:250,cy:270}),a=.4+p.a*.3,sw=Math.sin(t*2)*.5+.5,yb=-1.5;
  bench(s,0,yb,6.4,4);
  // balance
  s.box([0,yb+.18,0],[2.4,.36,1.9],'#e9ecef');s.box([0,yb+.37,-.2],[2.2,.02,1.3],'#d9dde1');s.box([0,yb+.26,.96],[1.7,.18,.02],'#20262c');
  s.box([-.25,yb+.27,.975],[.9,.12,.01],'#3d6b3a');s.engrave([-.25,yb+.27,.985],`${f(p.m,1)} g`,'#b6ff9e',11);for(const [i,col] of[[0,'#4b5259'],[1,'#4b5259'],[2,'#d23b3b']])s.cyl([.45+i*.2,yb+.27,.975],[0,0,1],.05,.02,col);
  s.cyl([0,yb+.42,-.2],[0,1,0],.75,.05,CH,{cap:'#e2e6ea'});s.cyl([0,yb+.39,-.2],[0,1,0],.15,.06,ST);
  const cy0=yb+.445;s.shadow([0,cy0,-.2],a*.6,cy0,.35);s.box([0,cy0+a/2,-.2],[a,a,a],BRASS);const e=p.da*.3*12;s.box([0,cy0+a/2,-.2],[a+e*sw,a+e*sw,a+e*sw],'#ffc36b',{alpha:.18});
  // steel rule in front
  s.box([0,yb+.02,1.45],[a+1.2,.04,.32],CH,{ground:true});for(let i=0;i<=30;i++){const X=-a/2-.6+i*(a+1.2)/30,q=[X,yb+.041,1.31];s.seg(q,[X,yb+.041,1.31+(i%5?.07:.13)],'#1b1f23',1,[],-4e5)}
  s.seg([-a/2,yb+.05,1.25],[-a/2,cy0,-.2+a/2],'#ffffff44',1,[3,3]);s.seg([a/2,yb+.05,1.25],[a/2,cy0,-.2+a/2],'#ffffff44',1,[3,3]);
  s.label([0,cy0+a+.45,-.2],`a = ${f(p.a,2)} ± ${f(p.da,2)} cm`,C.gold,15);
  callout(s,[-.9,yb+.3,.95],'electronic balance',-40,30);callout(s,[a/2,cy0+a*.7,-.2+a/2],'brass cube',60,-20);callout(s,[a/2+.4,yb+.04,1.5],'steel rule',50,25);
  s.render();
  chart(c,470,96,186,120,{title:'Error budget (%)',xmin:0,xmax:1,series:[],ymin:0,ymax:1});const rm=p.dm/p.m*100,ra=3*p.da/p.a*100,tot=rm+ra;
  c.save();c.fillStyle='#7baaff';c.fillRect(490,190-Math.min(80,rm/tot*80),50,Math.min(80,rm/tot*80));c.fillStyle='#ffc36b';c.fillRect(580,190-Math.min(80,ra/tot*80),50,Math.min(80,ra/tot*80));c.restore();
  tag(c,'mass',515,202,C.blue,11,'center');tag(c,'3 × side',605,202,C.gold,11,'center')};

// Simple pendulum on a retort stand with split cork, brass bob and stopwatch.
R['dimensional-analysis']=(c,p,t)=>{const s=P3.scene(c,{scale:56,cy:262,cx:380,pitch:.28,yaw:.2}),T=2*PI*Math.sqrt(p.L/p.g),th=.32*Math.cos(TAU*t/T),Ls=.6+p.L*.75,yb=-1.9,piv=[0,1.9,0];
  bench(s,0,yb,6.4,3.4);stand(s,[-1.5,yb,-.3],2.25,1.98,-.12,0);s.box([-.04,1.98,0],[.14,.2,.18],'#a0703a');s.box([.06,1.98,0],[.06,.22,.2],'#a0703a');
  const r=.11+.08*Math.cbrt(p.m),bob=[Ls*Math.sin(th),1.9-Ls*Math.cos(th),0];s.seg(piv,bob,'#f1ead8',1.6);const bc=V.add(bob,V.mul(V.norm(V.sub(bob,piv)),r));
  s.cyl(V.add(bob,V.mul(V.norm(V.sub(bob,piv)),.03)),V.sub(bob,piv),.02,.06,ST);s.ball(bc,r,BRASS);s.shadow(bc,r,yb,.35);
  const arc=[];for(let i=-10;i<=10;i++){const q=.32*i/10;arc.push([(Ls+r)*Math.sin(q),1.9-(Ls+r)*Math.cos(q),0])}s.path(arc,C.muted,1.2,[4,4]);
  stopwatch(s,[1.9,yb+.4,.6],cycle(t,60));
  callout(s,[-1.5,1.2,-.3],'retort stand',-40,-10);callout(s,[0,1.98,.1],'split cork',50,-30);callout(s,bc,`bob m = ${p.m} kg`,60,20);callout(s,[1.9,yb+.75,.6],'stopwatch',40,-30);
  s.render();
  tag(c,'[T] = [L]^a [L T⁻²]^b [M]^c',44,98,C.white,15);tag(c,'L: a + b = 0   T: −2b = 1   M: c = 0',44,124,C.mint,14);tag(c,`T = ${f(T,2)} s`,44,150,C.gold,15)};

})();
