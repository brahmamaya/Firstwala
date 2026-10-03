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
  if(scale){const {n,step,lab,every=5,off=.15}=scale;for(let i=0;i<=n;i++){const X=x0+off+i*step;if(X>x1-.12)break;const big=i%every===0,pt=[X,y-.005,z+.281];s.seg(pt,[X,y-(big?.065:.035),z+.281],'#1b1f23',big?1.3:1,[],zf(s,pt)+.02);if(big&&lab)s.engrave([X,y-.072-.01,z+.282],lab(i),'#1b1f23',8)}}}
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
const VOBJ={none:0,marble:16.3,ball:23.4,cylinder:34.7,block:52.6};
R['units']=(c,p,t)=>{const s=P3.scene(c,{scale:62,pitch:.22,yaw:.3,cx:340,cy:222}),k=.45,obj=p.obj&&VOBJ[p.obj]!=null?p.obj:null,sz=obj?VOBJ[obj]:0,
  effmm=obj!=null&&p.jaw!=null?Math.max(p.jaw,sz):p.measure*10,zero=p.zero||0,Rr=effmm+zero;let msrm=Math.floor(Rr+1e-9),n=Math.round((Rr-msrm)*10);if(n===10){msrm+=1;n=0}
  const m=clamp(effmm/10,0,13),X0=-2.95,hx=X0+m*k,o=.15,vz=zero/10*k;
  bench(s,.3,-1.75,7.6,2.4);
  // beam (main scale engraved on the front face)
  s.box([.35,0,0],[6.9,.5,.08],'#dfe3e7');s.box([3.82,0,0],[.04,.5,.08],ST);const zb=zf(s,[.35,0,.041])+.03;
  for(let i=0;i<=135;i++){const X=X0+o+i*k/10;if(X>3.7)break;const cm=i%10===0,hf=i%5===0;s.seg([X,-.13,.041],[X,-.13+(cm?.17:hf?.12:.07),.041],'#1b1f23',cm?1.3:.9,[],zb);if(cm)s.engrave([X,.13,.041],String(i/10),'#1b1f23',10,zb)}
  s.engrave([3.5,.15,.041],'cm','#1b1f23',9,zb);
  // fixed jaws
  const jy=-1.45;s.poly([[X0,-.25,.04],[X0,jy,.04],[X0-.12,jy,.04],[X0-.42,-.25,.04]],'#dfe3e7',{normal:[0,0,1]});s.box([X0-.06,(jy-.25)/2,0],[.12,-.25-jy,.079],'#c9ced3');
  s.poly([[X0,.25,.03],[X0,.62,.03],[X0-.07,.62,.03],[X0-.22,.25,.03]],'#dfe3e7',{normal:[0,0,1]});
  // sliding head with vernier plate
  s.box([hx+.62,-.33,.055],[1.3,.4,.03],'#cfd4d9');s.box([hx+.62,-.33,-.055],[1.3,.4,.03],'#b9bfc5');s.box([hx+.62,.28,0],[1.3,.06,.14],'#b9bfc5');
  const zv=zf(s,[hx+.62,-.33,.071])+.03;
  for(let j=0;j<=10;j++){const X=hx+o+vz+j*.9*k/10,hit=j===n;s.seg([X,-.13,.071],[X,-.13-(j%5===0?.14:.09),.071],hit?'#d62828':'#1b1f23',hit?2:1,[],zv);if(j%5===0)s.engrave([X,-.36,.071],String(j),'#1b1f23',9,zv)}
  s.engrave([hx+1.0,-.45,.071],'0.1 mm','#3b4046',8,zv);
  s.poly([[hx,-.48,.06],[hx,jy,.06],[hx+.12,jy,.06],[hx+.42,-.48,.06]],'#dfe3e7',{normal:[0,0,1]});s.box([hx+.06,(jy-.48)/2,0],[.12,-.48-jy,.079],'#c9ced3');
  s.poly([[hx,.31,.03],[hx+.22,.31,.03],[hx+.07,.62,.03],[hx,.62,.03]],'#dfe3e7',{normal:[0,0,1]});
  s.cyl([hx+.75,.38,0],[0,1,0],.07,.14,'#868e96',{cap:'#adb5bd'});s.cyl([hx+1.05,-.62,0],[0,0,1],.12,.08,'#868e96');for(let i=0;i<12;i++){const a=TAU*i/12;s.seg([hx+1.05+Math.cos(a)*.12,-.62+Math.sin(a)*.12,.04],[hx+1.05+Math.cos(a)*.12,-.62+Math.sin(a)*.12,-.04],'#3b4046',1)}
  if(m>0)s.box([3.84+m*k/2,-.2,0],[m*k,.04,.04],CH);
  // object held between the outside jaws
  const ox=X0+sz/10*k/2,oy=-.98,w=sz/10*k;
  if(obj==='marble')s.ball([ox,oy,0],w/2,'#9fd3f0',{alpha:.75,stroke:'#e9f6ff'});
  else if(obj==='ball')s.ball([ox,oy,0],w/2,'#c9ced3');
  else if(obj==='cylinder')s.cyl([ox,oy,0],[1,0,0],.28,w,'#b9bfc5',{cap:'#dfe3e7'});
  else if(obj==='block')s.box([ox,oy,0],[w,.6,.5],'#b07a46');
  else if(!obj&&m>.03)s.cyl([X0+m*k/2,oy,0],[1,0,0],.22,m*k-.01,CU,{cap:'#d9905a'});
  if(obj&&obj!=='none')callout(s,[ox,oy-.2,.1],'object',-30,50);
  callout(s,[1.9,.2,.04],'main scale',30,-60);callout(s,[hx+.4,-.4,.07],'vernier scale',60,60);callout(s,[X0-.1,-1.25,.04],'fixed jaw',-50,30);callout(s,[hx+.1,-1.3,.06],'sliding jaw',50,30);callout(s,[hx+1.05,-.62,.04],'thumb wheel',70,20);callout(s,[hx+.75,.45,0],'lock screw',40,-40);callout(s,[3.9+m*k,-.2,0],'depth rod',20,-50);
  s.render();tag(c,`MSR ${f(msrm/10,1)} cm + VSR ${n} × 0.01 cm`,44,98,C.gold,14)};

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
  s.label([0,.35,W/2+1.25],`L = ${p.length} ± ${p.error} cm`,C.gold,13);s.label([L/2+.75,.35,0],`W = ${p.width} ± ${p.error}`,C.gold,13,'left');
  callout(s,[-L/2+.4,.07,-W/2+.3],'metal plate',-40,-40);callout(s,[-L/2+1,.04,W/2+.45],'steel rule',-50,30);
  s.render();tag(c,'gold halo: largest possible area · inner: smallest',44,98,C.muted,13)};

// Raised needle pointer over a wooden metre rule, read by an eye from an angle.
R['parallax']=(c,p,t)=>{const s=P3.scene(c,{scale:56,pitch:.25,yaw:.3,cx:330,cy:262}),u=.7,X=cm=>-3+cm*u,x=X(p.truePosition),h=p.height*u,a=rad(p.angle),app=X(p.truePosition+p.height*Math.tan(a));
  bench(s,.5,-.12,8.6,3.0);s.box([.5,-.06,0],[7.6,.12,.8],'#d9b46a',{ground:true});s.box([.5,-.001,.39],[7.6,.002,.02],'#00000033',{ground:true});
  for(let i=0;i<=105;i++){const xx=X(i/10);if(xx>4.25)break;const cm=i%10===0,q=[xx,.001,.39];s.seg(q,[xx,.001,.39-(cm?.25:i%5===0?.17:.1)],'#1b1f23',cm?1.4:1,[],-4e5);if(cm)s.engrave([xx,.001,.06],String(i/10),'#1b1f23',11,-4e5)}
  // pointer: pillar block at the back, needle reaching over the scale
  const zb=-1.5;s.box([x,(h+.25)/2-.02,zb],[.3,h+.29,.3],'#3b4046');s.box([x,.03,zb],[.6,.06,.5],'#2b2f35');s.cyl([x,h,zb+.2],[0,0,1],.07,.12,BRASS);s.tube([[x,h,zb+.2],[x,h,-.05],[x,h-.03,.1]],.025,'#2b2f35',{segs:6});
  // the eye on the line of sight through the needle tip
  const tip=[x,h-.03,.1],dir=V.norm([x-app,h,0]),eye=V.add(tip,V.mul(dir,1.45/Math.max(.5,dir[1])));
  s.seg(eye,[app,0,.1],C.gold,1.5,[5,4]);s.seg([x,h+1.6,.1],[x,0,.1],'#8ca6b977',1,[3,4]);
  s.ball(eye,.2,'#f4f1ea');const look=V.norm(V.sub(tip,eye));s.cyl(V.add(eye,V.mul(look,.15)),look,.12,.06,'#4e7a3a',{cap:'#5d8f46'});s.cyl(V.add(eye,V.mul(look,.19)),look,.05,.02,'#0b0b0b',{cap:'#0b0b0b'});
  s.ball([app,.03,.1],.06,C.gold);s.ball([x,.03,.1],.06,C.mint);s.label([app,-.35,.6],`${f(p.truePosition+p.height*Math.tan(a),2)} cm`,C.gold,12);
  callout(s,eye,'eye',-40,-20);callout(s,[x,h,-.6],'raised pointer',60,-40);callout(s,[X(.6),0,.1],'metre rule (mm)',-30,50);
  s.render();tag(c,'mint: true reading · gold: apparent reading',44,98,C.muted,13)};

// Spherometer on a plano-convex lens resting on a glass plate.
R['spherometer']=(c,p,t)=>{const h=p.turns+p.div*.01,s=P3.scene(c,{scale:60,pitch:.42,yaw:.15,cx:320,cy:262}),hv=Math.min(.8,h*.18),rho=p.legs/40*1.6/Math.sqrt(3),yb=-1.42;
  bench(s,0,-1.6,6.4,3.6);s.box([0,-1.51,0],[4.4,.18,3.2],GLASS,{alpha:.45,ground:true});
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
  s.label([-1.9,yf+.3,0],`h = ${f(h,2)} mm`,C.gold,15);
  callout(s,[dr*.7,yd+.04,dr*.5],'circular scale (100 div)',70,-30);callout(s,[px,yf+1.2,0],'pitch scale 1 mm',60,-10);callout(s,legs[2]?[legs[2][0],yleg+.3,legs[2][1]]:[0,0,0],'leg',50,20);callout(s,[-rho*1.1,yb+.05,.5],'convex lens',-60,10);callout(s,[0,yd+.32,0],'milled head',-60,-30);
  s.render();tag(c,'Leg spacing l = '+p.legs+' mm',44,98,C.muted,13)};

// Brass cube on an electronic balance with a vernier-ruled steel rule; error-budget chart kept.
R['error-propagation']=(c,p,t)=>{const s=P3.scene(c,{scale:50,yaw:.25,pitch:.35,cx:250,cy:218}),a=.4+p.a*.3,sw=Math.sin(t*2)*.5+.5,yb=-1.5;
  bench(s,0,yb,5.6,3.6);
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
R['dimensional-analysis']=(c,p,t)=>{const s=P3.scene(c,{scale:52,cy:245,cx:380,pitch:.28,yaw:.2}),T=2*PI*Math.sqrt(p.L/p.g),th=.32*Math.cos(TAU*t/T),Ls=.6+p.L*.75,yb=-1.9,piv=[0,1.9,0];
  bench(s,0,yb,6,2.6);stand(s,[-1.5,yb,-.3],2.25,1.98,-.12,0);s.box([-.04,1.98,0],[.14,.2,.18],'#a0703a');s.box([.06,1.98,0],[.06,.22,.2],'#a0703a');
  const r=.11+.08*Math.cbrt(p.m),bob=[Ls*Math.sin(th),1.9-Ls*Math.cos(th),0];s.seg(piv,bob,'#f1ead8',1.6);const bc=V.add(bob,V.mul(V.norm(V.sub(bob,piv)),r));
  s.cyl(V.add(bob,V.mul(V.norm(V.sub(bob,piv)),.03)),V.sub(bob,piv),.02,.06,ST);s.ball(bc,r,BRASS);s.shadow(bc,r,yb,.35);
  const arc=[];for(let i=-10;i<=10;i++){const q=.32*i/10;arc.push([(Ls+r)*Math.sin(q),1.9-(Ls+r)*Math.cos(q),0])}s.path(arc,C.muted,1.2,[4,4]);
  stopwatch(s,[1.9,yb+.36,.4],cycle(t,60));
  callout(s,[-1.5,1.2,-.3],'retort stand',-40,-10);callout(s,[0,1.98,.1],'split cork',50,-30);callout(s,bc,`bob m = ${p.m} kg`,60,20);callout(s,[1.9,yb+.7,.4],'stopwatch',40,-30);
  s.render();
  tag(c,'[T] = [L]^a [L T⁻²]^b [M]^c',44,98,C.white,15);tag(c,'L: a + b = 0   T: −2b = 1   M: c = 0',44,124,C.mint,14);tag(c,`T = ${f(T,2)} s`,44,150,C.gold,15)};


/* ======================= Motion in a Straight Line ======================= */
// Ticker-timer tape: dots every `dt` seconds at positions xs(time) (world x), up to time T.
function tape(s,x0,xr,y,z,xs,T,dt=.25){if(xr<=x0)return;s.poly([[x0,y,z+.05],[xr,y,z+.05],[xr,y,z-.05],[x0,y,z-.05]],'#f3ecd8',{normal:[0,1,0],z:-3e5});for(let q=0;q<=T+1e-9;q+=dt){const X=xs(q);if(X>xr)break;s.ball([X,y+.004,z],.018,'#1b1f23',{flat:true,lift:3e5})}}
function tickerTimer(s,p){const [x,y,z]=p;s.box([x,y+.14,z],[.5,.28,.42],'#e6b325');s.box([x,y+.3,z],[.3,.06,.3],'#30353b');s.cyl([x+.15,y+.36,z],[0,1,0],.04,.08,CH);s.tube([[x-.25,y+.1,z-.15],[x-.6,y-.1,z-.5],[x-.7,y-.3,z-.9]],.025,'#1d1f22',{segs:6})}

R['kinematics']=(c,p,t)=>{const s=P3.scene(c,{scale:50,pitch:.3,yaw:.42,cx:300,cy:288}),T=Math.max(1,(-p.velocity+Math.sqrt(p.velocity**2+2*p.acceleration*120))/Math.max(p.acceleration,1e-6)),tt=p.acceleration>0?cycle(t,Math.min(T,8)):cycle(t,120/p.velocity),xf=q=>p.velocity*q+.5*p.acceleration*q*q,x=xf(tt),X0=-3.2,K=6.4/120,X=X0+clamp(x,0,120)*K;
  bench(s,0,-.24,8.8,2.6,'#6f4a2c');alTrack(s,-3.7,3.7,0,0,{n:24,step:5*K,every:4,off:X0+3.7,lab:i=>String(i*5)});tickerTimer(s,[-3.4,.0,0]);
  tape(s,-3.15,X-.47,.03,0,q=>X0+clamp(xf(q),0,120)*K-.47,tt,.25);trolley(s,[X,0,0],'#2f6db5',1,-X/.09);
  s.arrow([X,.75,0],[X+.3+p.velocity*.05+p.acceleration*tt*.05,.75,0],C.mint,3,11,`v = ${f(p.velocity+p.acceleration*tt,1)} m/s`);
  callout(s,[-3.4,.3,0],'ticker timer',-20,-60);callout(s,[-1.5,.035,0],'paper tape (dot every 0.25 s)',10,70);callout(s,[2.6,-.05,.28],'aluminium track (m)',30,50);
  s.render();
  chart(c,420,96,236,150,{title:'x – t',xl:'t',xmin:0,xmax:8,ymin:0,ymax:Math.max(10,p.velocity*8+.5*p.acceleration*64),series:[{fn:T2=>p.velocity*T2+.5*p.acceleration*T2*T2,col:C.gold}],marker:[Math.min(tt,8),x]})};

R['relative-motion']=(c,p,t)=>{const s=P3.scene(c,{scale:52,pitch:.34,yaw:.42,cx:330,cy:262}),tt=cycle(t,6),wrap=v=>((-3+(v*tt*.12+3))%6.6+6.6)%6.6-3.3,xa=wrap(p.a),xb=wrap(p.b);
  bench(s,0,-.24,8.6,3.4,'#6f4a2c');alTrack(s,-3.7,3.7,-.6,0,{n:14,step:.5,every:2});alTrack(s,-3.7,3.7,.6,0,{n:14,step:.5,every:2});
  trolley(s,[xa,0,-.6],'#2f6db5',1,-xa/.09);trolley(s,[xb,0,.6],'#d9772b',1,-xb/.09);s.label([xa,.62,-.6],'A',C.white,13);s.label([xb,.62,.6],'B',C.white,13);
  s.arrow([xa,1.0,-.6],[xa+p.a*.12,1.0,-.6],C.blue,3,11,`v_A = ${p.a} m/s`);s.arrow([xb,.5,1.0],[xb+p.b*.12,.5,1.0],C.gold,3,11,`v_B = ${p.b} m/s`);s.arrow([0,1.75,0],[(p.a-p.b)*.12,1.75,0],C.mint,4,11,`v_AB = ${p.a-p.b} m/s`);
  callout(s,[-3.2,0,.88],'parallel aluminium tracks',-10,60);callout(s,[3.64,.12,-.6],'end stop',20,-50);
  s.render()};

R['braking']=(c,p,t)=>{const s=P3.scene(c,{scale:50,pitch:.36,yaw:.42,cx:330,cy:262}),dR=p.speed*p.reaction,dB=p.speed**2/(2*p.deceleration),tot=dR+dB,k=6.4/Math.max(tot,1),tb=p.speed/p.deceleration,T=p.reaction+tb,tt=Math.min(cycle(t,T+1.5),T),x=tt<p.reaction?p.speed*tt:dR+p.speed*(tt-p.reaction)-.5*p.deceleration*(tt-p.reaction)**2,v=tt<p.reaction?p.speed:Math.max(0,p.speed-p.deceleration*(tt-p.reaction)),x0=-3.4,X=x0+x*k,braking=tt>=p.reaction&&v>0;
  grass(s,-4.6,4.6,-2,1.6,-.01);road(s,-4.4,4.4,-.9,.9,0,[0]);
  s.poly([[x0,.006,-.05],[x0+dR*k,.006,-.05],[x0+dR*k,.006,-.85],[x0,.006,-.85]].reverse(),'#ffc36b',{alpha:.32,normal:[0,1,0],z:-5.9e5});s.poly([[x0+dR*k,.006,-.05],[x0+tot*k,.006,-.05],[x0+tot*k,.006,-.85],[x0+dR*k,.006,-.85]].reverse(),'#ff857e',{alpha:.32,normal:[0,1,0],z:-5.9e5});
  if(tt>p.reaction)for(const zz of[-.22,-.66])s.seg([x0+dR*k+.5,.007,zz],[X-.3,.007,zz],'#0b0c0e',3,[],-5.8e5);
  s.box([x0,.004,-.45],[.08,.008,.8],'#f1f3f5',{ground:true});
  car(s,[X+.6,0,-.45],'#c92a2a',.95,-X/.14,braking);
  const xs=x0+tot*k+1.2;s.cyl([xs,.06,-.45],[0,1,0],.18,.12,'#e8590c');for(let i=0;i<3;i++)s.cyl([xs,.3+i*.2,-.45],[0,1,0],.14-i*.035,.2,i%2?'#f1f3f5':'#e8590c');
  s.arrow([X+.6,1.15,-.45],[X+.6+v*.06+.01,1.15,-.45],C.mint,3,11,`v = ${f(v,1)} m/s`);
  callout(s,[x0+dR*k/2,0,-.1],`reaction ${f(dR,1)} m`,-20,60);callout(s,[x0+dR*k+dB*k/2,0,-.1],`braking ${f(dB,1)} m`,20,70);callout(s,[xs,.6,-.45],'stop',30,-40);
  s.render();tag(c,'gold: reaction distance · red: braking distance',44,98,C.muted,13)};

R['vertical-throw']=(c,p,t)=>{const s=P3.scene(c,{scale:44,cy:272,yaw:.2,pitch:.22}),T=(p.speed+Math.sqrt(p.speed**2+2*G*p.height))/G,tt=Math.min(cycle(t,T+1),T),y=p.height+p.speed*tt-.5*G*tt*tt,v=p.speed-G*tt,Hm=p.height+p.speed**2/(2*G),k=4.4/Math.max(Hm,1),g0=-1.6,yb=g0+y*k+.13;
  grass(s,-4,4,-2.2,1.6,g0);
  if(p.height>0){const H=p.height*k;s.box([.15,g0+H/2,0],[1.4,H,1.1],'#9a8f84');for(let i=0;i<Math.floor(H/.35);i++)for(const dx of[-.3,.3])s.box([.15+dx,g0+.2+i*.35,.56],[.26,.18,.01],'#6fa3c7');s.box([.15,g0+H+.03,.1],[1.5,.06,1.3],'#7d746b');for(const dx of[-.6,.85])s.cyl([dx,g0+H+.18,.6],[0,1,0],.02,.3,ST);s.cyl([.12,g0+H+.33,.6],[1,0,0],.02,1.45,ST)}
  pole(s,-1.4,0,g0,g0+Math.ceil(Hm/5)*5*k,5*k);s.label([-1.75,g0+Math.ceil(Hm/5)*5*k,0],`${Math.ceil(Hm/5)*5} m`,C.white,11,'right');s.label([-1.75,g0+5*k,0],'5 m',C.white,11,'right');
  seamBall(s,[0,yb,.6],.16,'#b3201c','#f4f4ee',tt*8);s.shadow([0,0,.6],.13,g0,.4);
  s.seg([-.9,g0+Hm*k+.13,.6],[.9,g0+Hm*k+.13,.6],C.mint,1.5,[4,4]);s.label([1.4,g0+Hm*k+.13,.6],'turning point',C.mint,12,'left');
  if(Math.abs(v)>.3)s.arrow([.35,yb,.6],[.35,yb+clamp(v*.06,-1.2,1.2),.6],C.gold,3,10,`v = ${f(v,1)} m/s`);s.arrow([-.35,yb+.25,.6],[-.35,yb-.35,.6],C.red,2.5,9,'g');
  callout(s,[-1.4,g0+2.5*k,0],'surveyor pole (5 m bands)',-30,40);if(p.height>0)callout(s,[.8,g0+p.height*k,.6],'balcony',50,10);
  s.render()};

R['vt-area']=(c,p,t)=>{const s=P3.scene(c,{scale:50,pitch:.3,yaw:.42,cx:300,cy:285}),tt=Math.min(cycle(t,p.time+1),p.time),vf=v=>Math.max(0,p.u+p.a*v),x=(()=>{let d=0;const n=60;for(let i=0;i<n;i++)d+=vf(tt*(i+.5)/n)*tt/n;return d})(),tot=(()=>{let d=0;const n=80;for(let i=0;i<n;i++)d+=vf(p.time*(i+.5)/n)*p.time/n;return d})(),k=6.4/Math.max(tot,1),X=-3.2+x*k;
  bench(s,0,-.24,8.8,2.6,'#6f4a2c');alTrack(s,-3.7,3.7,0,0,{n:20,step:6.4/20,every:5,off:.5,lab:i=>f(tot*i/20,0)});
  s.poly([[-3.2,.002,-.3],[X,.002,-.3],[X,.002,-.5],[-3.2,.002,-.5]].reverse(),C.mint,{alpha:.35,normal:[0,1,0],z:-4e5});trolley(s,[X,0,0],'#2f6db5',1,-X/.09,true);
  s.arrow([X,.95,0],[X+.25+vf(tt)*.06,.95,0],C.gold,3,11,`v = ${f(vf(tt),1)} m/s`);s.label([X,.02,-.75],`s = ${f(x,1)} m`,C.mint,12);
  callout(s,[X,.55,0],'trolley with card',-60,-40);callout(s,[3.64,.12,0],'end stop',20,-40);
  s.render();
  chart(c,420,96,236,150,{title:'v–t (area = displacement)',xl:'t',xmin:0,xmax:p.time,ymin:0,series:[{fn:vf,col:C.gold},{pts:[[0,0],[0,vf(0)],[tt,vf(tt)],[tt,0]],col:C.mint,dash:[3,3]}],marker:[tt,vf(tt)]})};

R['catch-up']=(c,p,t)=>{const s=P3.scene(c,{scale:50,pitch:.36,yaw:.42,cx:330,cy:262}),vf=p.slow+p.extra,tc=vf*p.delay/(vf-p.slow),T=tc+1.5,tt=cycle(t,T),xs=p.slow*tt,xf=Math.max(0,vf*(tt-p.delay)),Lmax=p.slow*T,k=6.6/Math.max(Lmax,1),x0=-3.5;
  grass(s,-4.6,4.6,-2,1.8,-.01);road(s,-4.4,4.4,-.95,.95,0,[0]);s.box([x0,.004,0],[.08,.008,1.8],'#f1f3f5',{ground:true});
  const XA=x0+xs*k,XB=x0+xf*k;car(s,[XA+.6,0,-.47],'#2b8a3e',.85,-XA/.13);car(s,[XB+.6,0,.47],'#c92a2a',.85,-XB/.13);
  const xm=x0+p.slow*tc*k+.6;s.cyl([xm,.6,-1.15],[0,1,0],.03,1.2,ST);s.poly([[xm,1.2,-1.15],[xm+.45,1.08,-1.15],[xm,.96,-1.15]],C.gold,{cull:false,normal:[0,0,1]});s.label([xm,1.45,-1.15],'catch-up point',C.gold,12);
  s.seg([xm,.005,-.95],[xm,.005,.95],C.gold,2,[6,4],-5.8e5);
  s.arrow([XA+.6,.95,-.47],[XA+.6+p.slow*.07,.95,-.47],C.mint,3,10,`target ${p.slow} m/s`);if(tt>p.delay)s.arrow([XB+.6,.95,.47],[XB+.6+vf*.07,.95,.47],C.red,3,10,`pursuer ${vf} m/s`);else s.label([XB+.6,1.05,.47],`starts in ${f(p.delay-tt,1)} s`,C.red,12);
  callout(s,[x0,0,.8],'start line',-30,50);
  s.render()};

R['average-instant']=(c,p,t)=>{const x=t=>p.u*t+.5*p.a*t*t,tt=cycle(t,Math.max(6,p.t1+p.dt+.5)),X=v=>-3.3+clamp(v,-5,70)*.09,s=P3.scene(c,{scale:56,cy:305,pitch:.24,yaw:.45,cx:320});
  bench(s,0,-.36,8.6,2.2,'#6f4a2c');alTrack(s,-3.75,3.75,0,-.1,{n:14,step:.5,every:2,off:.45,lab:i=>String(i*5)});
  for(const [tv,col,lb] of [[p.t1,C.mint,'gate 1 (t₁)'],[p.t1+p.dt,C.gold,'gate 2 (t₁+Δt)']]){const xx=X(x(tv));s.box([xx,-.08,-.5],[.2,.06,.3],'#30353b');for(const zz of[-.42,.42]){s.box([xx,.28,zz],[.12,.72,.08],'#30353b')}s.box([xx,.68,0],[.12,.1,.92],'#30353b');s.box([xx,.68,.47],[.13,.04,.02],col);s.ball([xx,.32,.375],.025,'#ff2020',{glow:true,flat:true});s.seg([xx,.32,-.38],[xx,.32,.38],'#ff404066',1.2);
    s.tube([[xx,.68,-.46],[xx-.1,.4,-.9],[xx-.3,-.05,-1.0]],.02,'#1d1f22',{segs:5});callout(s,[xx,.72,.47],lb,0,-40)}
  const cx=X(x(tt));trolley(s,[cx,-.1,0],'#2f6db5',.9,-cx/.08,true);s.render();
  const tm=Math.max(6,p.t1+p.dt+.5),avg=(x(p.t1+p.dt)-x(p.t1))/p.dt,inst=p.u+p.a*p.t1;
  chart(c,380,92,276,150,{title:'x–t graph',xl:'t (s)',xmin:0,xmax:tm,series:[{fn:x,col:C.white},{fn:T=>x(p.t1)+avg*(T-p.t1),col:C.gold,dash:[5,4]},{fn:T=>x(p.t1)+inst*(T-p.t1),col:C.mint}],marker:[tt,x(tt)]});
  tag(c,'gold: secant (average)  ·  mint: tangent',44,98,C.muted,13)};

R['rain-umbrella']=(c,p,t)=>{const s=P3.scene(c,{scale:52,cy:268,yaw:.35}),th=Math.atan2(p.vm,p.vr),x=-2.5+cycle(t*p.vm*.35,5),g0=-1.5;
  floorStrips(s,-4,4,-2,1.6,g0,['#5b6168','#545a61'],8,'x');for(let X=-4;X<=4;X+=.5)s.seg([X,g0,-2],[X,g0,1.6],'#00000030',1,[],-5.9e5);
  const hp=person(s,[x,g0,0],t*p.vm*2.2,'#3d6fb6',1),ax=[Math.sin(th),Math.cos(th),0],top=V.add(hp.hand,V.mul(ax,1.3)),rim=V.sub(top,V.mul(ax,.24));
  s.tube([hp.shoulder,V.add(hp.hand,[0,0,-.02])],.045,'#3d6fb6',{segs:6});s.ball(hp.hand,.05,'#e0b48a');
  s.tube([V.sub(hp.hand,V.mul(ax,.12)),top],.018,'#2b2f35',{segs:5});s.tube([V.sub(hp.hand,V.mul(ax,.12)),V.sub(hp.hand,V.add(V.mul(ax,.2),[.06,0,0]))],.025,'#5c3a21',{segs:5});
  s.lathe(rim,[[.62,0],[.52,.1],[.3,.19],[0,.24]],'#c92a2a',{rot:[0,0,-th],segs:16,spec:.3});for(let i=0;i<8;i++){const a=TAU*i/8,[n,u,w]=[ax,V.norm(V.cross(ax,[0,0,1])),[0,0,1]],e=V.add(rim,V.add(V.mul(u,.62*Math.cos(a)),V.mul(w,.62*Math.sin(a))));s.ball(e,.018,'#1d1f22',{flat:true})}
  for(let i=0;i<70;i++){const rx=-3.4+((i*137)%68)/10,rz=-1.6+((i*71)%32)/10,ry=2.4-cycle(t*p.vr*.4+i*.37,4);if(Math.abs(rx-rim[0])<.6&&Math.abs(rz)<.6&&ry<rim[1])continue;s.seg([rx,ry,rz],[rx,ry-.22,rz],C.glass,1.4)}
  s.shadow([x,g0,0],.35,g0,.4);
  const O=[2.3,1.85,0],vr=p.vr*.12,vm=p.vm*.12;s.arrow(O,[O[0],O[1]-vr,0],C.glass,3,11,`v_rain = ${p.vr} m/s`).arrow(O,[O[0]+vm,O[1],0],C.gold,3,11,`v_you = ${p.vm} m/s`).arrow(O,[O[0]-vm,O[1]-vr,0],C.mint,3,11);s.seg([O[0]-vm,O[1]-vr,0],[O[0],O[1]-vr,0],'#8ca6b9',1,[3,3]);
  s.label([O[0]-vm-.15,O[1]-vr*.45,0],`v_rel = ${f(Math.hypot(p.vr,p.vm),2)} m/s at ${f(deg(th),1)}° to vertical`,C.mint,12,'right');
  callout(s,V.add(rim,[0,.12,0]),'umbrella',-50,-20);
  s.render();
  tag(c,'blue: rain (ground)   gold: you   mint: rain relative to you',44,98,C.muted,13);tag(c,`θ = ${f(deg(th),1)}°`,44,124,C.gold,17)};


/* ======================= Motion in a Plane ======================= */
// Yellow measuring tape laid on the ground from x0 along +x, ticks every `step` world units.
function tapeMeasure(s,x0,x1,y,z,step,lab){s.poly([[x0,y+.003,z+.07],[x1,y+.003,z+.07],[x1,y+.003,z-.07],[x0,y+.003,z-.07]],'#f2c230',{normal:[0,1,0],z:-5.5e5});for(let i=0,X=x0;X<=x1+1e-6;i++,X=x0+i*step){s.seg([X,y+.004,z+.07],[X,y+.004,z-.02],'#1b1f23',1.2,[],-5.4e5);if(lab&&i%2===0)s.engrave([X,y+.004,z+.17],lab(i),'#f2c230',9,-5.4e5)}s.cyl([x1+.12,y+.08,z],[0,1,0],.14,.16,'#e8590c',{cap:'#f1f3f5'})}
function target(s,p,r=.3){for(let i=0;i<4;i++)s.cyl([p[0],p[1]+.004+i*.002,p[2]],[0,1,0],r*(1-i*.24),.004,i%2?'#f1f3f5':'#c92a2a',{caps:true})}
function flag(s,p,col=C.gold,h=.9){s.cyl([p[0],p[1]+h/2,p[2]],[0,1,0],.02,h,ST);s.poly([[p[0],p[1]+h,p[2]],[p[0]+.36,p[1]+h-.1,p[2]],[p[0],p[1]+h-.2,p[2]]],col,{cull:false,normal:[0,0,1]})}

R['projectile']=(c,p,t)=>{const s=P3.scene(c,{scale:44,cy:285,yaw:.3}),th=rad(p.angle),T=2*p.speed*Math.sin(th)/p.gravity,Rn=p.speed**2*Math.sin(2*th)/p.gravity,k=6.4/Math.max(Rn,(p.speed**2/(2*p.gravity))*2,1),g0=-1.5,pos=q=>[-3.2+p.speed*Math.cos(th)*q*k,g0+(p.speed*Math.sin(th)*q-.5*p.gravity*q*q)*k,0];
  grass(s,-4.4,4.4,-2,1.6,g0);tapeMeasure(s,-3.2,-3.2+Math.ceil(Rn/5)*5*k,g0,.6,5*k,i=>`${i*5} m`);launcher(s,[-3.2,g0-.32*.6,0],th,.6);
  s.curve(Array.from({length:41},(_,i)=>pos(T*i/40)),'#42d9ca99',2,8);const tt=Math.min(cycle(t,T+1),T),b=pos(tt);target(s,[-3.2+Rn*k,g0,0]);
  seamBall(s,b,.14,'#d8e04a','#f4f4ee',tt*6);s.shadow(b,.14,g0,.4);const vx=p.speed*Math.cos(th),vy=p.speed*Math.sin(th)-p.gravity*tt;
  if(tt<T)s.arrow(b,V.add(b,[vx*.045,vy*.045,0]),C.gold,2.5,10,`v = ${f(Math.hypot(vx,vy),1)} m/s`);
  callout(s,[-3.2,g0+.2,.2],'launcher + protractor',-20,-70);callout(s,[-3.2+Rn*k,g0,.2],`range ${f(Rn,1)} m`,30,50);
  s.render()};

R['circular-motion']=(c,p,t)=>{const s=P3.scene(c,{scale:46,pitch:.5,cy:250}),R0=.4+p.radius*.5,a=p.speed/p.radius*t*.6,b=[R0*Math.cos(a),.17,R0*Math.sin(a)];
  s.cyl([0,-.12,0],[0,1,0],3.1,.24,'#8a5a36',{cap:'#9a6a40'});s.ring([0,.001,0],[0,1,0],3.1,'#d4d9de',2.5);for(let i=1;i<6;i++)s.ring([0,.001,0],[0,1,0],i*.5+.4,'#00000022',1);
  s.ring([0,.005,0],[0,1,0],R0,'#42d9ca66',1.5,[5,5]);s.cyl([0,.05,0],[0,1,0],.25,.1,'#596066');s.cyl([0,.22,0],[0,1,0],.06,.36,CH);s.cyl([0,.17,0],[0,1,0],.1,.06,BRASS);
  s.seg([0,.17,0],b,'#f1ead8',1.8);s.ball(b,.17,'#c9ced3');s.shadow([b[0],0,b[2]],.17,0,.45);
  s.arrow(b,V.add(b,V.mul([-Math.sin(a),0,Math.cos(a)],.25+p.speed*.12)),C.mint,3,11,`v = ${p.speed} m/s`);s.arrow(b,[b[0]*.65,.17,b[2]*.65],C.red,3,11,`a = v²/r = ${f(p.speed**2/p.radius,2)} m/s²`);
  callout(s,[0,.4,0],'pivot with bearing',-60,-50);callout(s,[-2.6,0,1.4],'smooth table',-30,40);callout(s,[b[0]*.5,.17,b[2]*.5],'string',0,-60);
  s.render();tag(c,'mint: velocity (tangent) · red: centripetal acceleration',44,98,C.muted,13)};

// Motor boat with hull, deck, windscreen and outboard engine; d = forward unit vector in x-z.
function boat(s,p,d,k=1){const side=[d[2],0,-d[0]],L=(f0,s0,y)=>V.add(p,V.add(V.add(V.mul(d,f0*k),V.mul(side,s0*k)),[0,y*k,0]));
  const deck=[[-.32,-.14],[.1,-.15],[.28,-.08],[.4,0],[.28,.08],[.1,.15],[-.32,.14]],bot=deck.map(([a,b])=>[a*.9,b*.6]);
  for(let i=0;i<deck.length;i++){const j=(i+1)%deck.length;s.poly([L(...deck[i],.12),L(...deck[j],.12),L(...bot[j],-.04),L(...bot[i],-.04)],i===deck.length-1?'#e9ecef':'#f1f3f5')}
  s.poly(deck.map(q=>L(...q,.12)).reverse(),'#d9c7a3',{normal:[0,1,0]});s.poly(deck.map(q=>L(q[0]*.98,q[1]*.98,.1)).slice(0,7).map((q,i)=>q),'#c92a2a',{normal:[0,1,0],z:undefined,alpha:0});
  for(let i=0;i<deck.length;i++){const j=(i+1)%deck.length;s.seg(L(...deck[i],.06),L(...deck[j],.06),'#c92a2a',2)}
  s.poly([L(.08,-.12,.12),L(.08,.12,.12),L(.02,.11,.24),L(.02,-.11,.24)],GLASS,{alpha:.8,spec:.8});s.box(L(-.36,0,.13),[.08*k,.2*k,.08*k],'#1d1f22',{rotY:Math.atan2(-d[2],d[0])});s.cyl(L(-.38,0,-.02),[0,1,0],.02*k,.2*k,'#3b4046')}

R['river-crossing']=(c,p,t)=>{const s=P3.scene(c,{scale:48,pitch:.62,cy:250}),h=rad(p.heading),vx=p.current-p.boat*Math.sin(h),vz=p.boat*Math.cos(h),W=3.4,k=.35,tc=W/Math.max(vz*k,.05),q=Math.min(cycle(t,tc+1),tc),pos=[-1+vx*k*q,0,-W/2+vz*k*q];
  s.poly([[-4,-.12,W/2],[4,-.12,W/2],[4,-.12,-W/2],[-4,-.12,-W/2]],'#1f5f8b',{normal:[0,1,0],z:-6e5,spec:.4});
  for(let i=0;i<16;i++){const x=-3.8+((t*p.current*.4+i*1.37)%7.6),z=-W/2+.2+(i*.61)%(W-.4);s.seg([x,-.1,z],[x+.35,-.1,z],'#a5d8ff88',1.5,[],-5.9e5)}
  for(const z of[-W/2-.45,W/2+.45]){s.box([0,-.06,z],[8,.24,.9],'#4b8a3c',{ground:true});s.box([0,-.1,z-Math.sign(z)*.47],[8,.16,.06],'#c2a878',{ground:true})}
  for(const [x,sc] of[[-3,1],[-1.6,.8],[1.8,1.1],[3.2,.9]]){const zz=-W/2-.6;s.cyl([x,.2,zz],[0,1,0],.05*sc,.4*sc,'#6b4a2b');s.lathe([x,.35*sc,zz],[[.32*sc,0],[.22*sc,.35*sc],[0,.7*sc]],'#2f6b2a',{segs:10,spec:.1})}
  s.box([-1,-.02,W/2+.2],[.4,.06,.8],'#8a5a36');for(const dx of[-.17,.17])s.cyl([-1+dx,-.05,W/2-.15],[0,1,0],.03,.25,'#5c3a21');
  const fw=V.norm([-Math.sin(h),0,Math.cos(h)]);s.path([[-1,-.1,-W/2],[-1+vx*k*tc,-.1,W/2]],C.gold,1.5,[4,4]);boat(s,V.add(pos,[0,-.12,0]),fw,1.1);
  for(const sg of[1,-1]){const back=V.sub(pos,V.mul(fw,.45));s.seg([back[0],-.1,back[2]],V.add(V.sub(back,V.mul(fw,.5)),[sg*.18*fw[2],-.1,-sg*.18*fw[0]]),'#e9f6ffaa',1.5)}
  s.arrow(V.add(pos,[0,.4,0]),V.add(pos,[vx*.25,.4,vz*.25]),C.mint,3,11,`v = ${f(Math.hypot(vx,vz),2)} m/s`);s.arrow(V.add(pos,[0,.4,0]),V.add(pos,V.add(V.mul(fw,p.boat*.25),[0,.4,0])),C.gold,2,9);
  s.arrow([2.2,-.08,-.3],[2.2+p.current*.3,-.08,-.3],'#a5d8ff',2.5,9,`river ${p.current} m/s`);
  callout(s,[-1,0,W/2+.4],'jetty (start)',-40,40);callout(s,V.add(pos,[0,.1,0]),'motor boat',-60,-30);
  s.render();tag(c,'dashed: path over ground · mint: ground velocity · gold: heading',44,98,C.muted,13)};

// Force table: degree-scaled top, pulleys clamped at the rim, strings to slotted-mass hangers.
R['vector-addition']=(c,p,t)=>{const s=P3.scene(c,{scale:46,pitch:.62,cy:228}),th=rad(p.angle),k=.2,A=[p.a*k,0,0],B=[p.b*k*Math.cos(th),0,-p.b*k*Math.sin(th)],Rv=V.add(A,B),Rm=Math.hypot(p.a+p.b*Math.cos(th),p.b*Math.sin(th)),o=[0,.03,0],Rt=2;
  s.cyl([0,-1.1,0],[0,1,0],.08,2.1,ST);for(let i=0;i<3;i++){const q=TAU*i/3+.4;s.tube([[0,-2.1,0],[.9*Math.cos(q),-2.2,.9*Math.sin(q)]],.05,DK,{segs:6})}
  s.cyl([0,-.05,0],[0,1,0],Rt,.1,'#c3c9cf',{cap:'#dfe3e7'});
  for(let d=0;d<360;d+=5){const a=rad(d),q=[Rt*Math.cos(a),.001,-Rt*Math.sin(a)];s.seg(q,[(Rt-(d%30?.08:.18))*Math.cos(a),.001,-(Rt-(d%30?.08:.18))*Math.sin(a)],'#1b1f23',d%30?.8:1.3,[],-1e5);if(d%30===0)s.engrave([(Rt-.32)*Math.cos(a),.001,-(Rt-.32)*Math.sin(a)],String(d),'#1b1f23',8,-1e5)}
  s.cyl([0,.03,0],[0,1,0],.1,.03,'#868e96');
  const hang=(ang,mag,col)=>{const u=[Math.cos(ang),0,-Math.sin(ang)],pc=V.add(V.mul(u,Rt+.12),[0,.1,0]);s.box(V.add(V.mul(u,Rt-.02),[0,.02,0]),[.18,.14,.18],'#3b4046',{rotY:ang});s.cyl(pc,[u[2],0,-u[0]],.1,.04,'#2b2f35',{cap:'#868e96'});
    s.seg([0,.04,0],V.add(pc,[0,.1,0]),'#f1ead8',1.3);const dn=V.add(V.mul(u,Rt+.22),[0,.1,0]),hy=-1.1;s.seg(dn,[dn[0],hy,dn[2]],'#f1ead8',1.2);
    const n=Math.max(1,Math.round(mag));s.cyl([dn[0],hy-.12,dn[2]],[0,1,0],.012,.24,CH);for(let i=0;i<n;i++)s.cyl([dn[0],hy-.22+i*.035,dn[2]],[0,1,0],.09,.03,i%2?col:'#868e96')};
  hang(0,p.a,'#2f6db5');hang(th,p.b,'#c9a227');if(Rm>.05)hang(Math.atan2(p.b*Math.sin(th),p.a+p.b*Math.cos(th))+PI,Rm,'#2b8a3e');
  s.poly([o,V.add(o,A),V.add(o,Rv),V.add(o,B)],'#7baaff',{alpha:.18,cull:false,normal:[0,1,0],z:-1e5+1});
  s.arrow(o,V.add(o,A),C.blue,4,11,`A = ${p.a}`);s.arrow(o,V.add(o,B),C.gold,4,11,`B = ${p.b}, θ = ${p.angle}°`);s.arrow(o,V.add(o,Rv),C.mint,5,11,`R = ${f(Rm,2)}`);s.seg(V.add(o,A),V.add(o,Rv),C.gold,1.2,[4,4]);s.seg(V.add(o,B),V.add(o,Rv),C.blue,1.2,[4,4]);
  callout(s,[-Rt*.7,0,Rt*.7],'force table (degree scale)',-30,40);if(Rm>.05)callout(s,V.mul([-Math.cos(Math.atan2(p.b*Math.sin(th),p.a+p.b*Math.cos(th))),0,Math.sin(Math.atan2(p.b*Math.sin(th),p.a+p.b*Math.cos(th)))],Rt+.2),'equilibrant hanger',-40,40);
  s.render()};

R['horizontal-launch']=(c,p,t)=>{const s=P3.scene(c,{scale:44,cy:282,yaw:.3}),T=Math.sqrt(2*p.height/G),Rn=p.speed*T,k=4.6/Math.max(Rn,p.height,1),g0=-1.5,H=p.height*k,x0=-2.6,pos=q=>[x0+p.speed*q*k,g0+(p.height-.5*G*q*q)*k+.12,0];
  grass(s,-4.4,4.4,-2,1.6,g0);const cols=['#8b6f52','#7a6048','#94785a','#6d5440'];for(let i=0,y=g0;y<g0+H-1e-6;i++){const hh=Math.min(.35+((i*7)%3)*.12,g0+H-y);s.box([x0-.75,y+hh/2,0],[1.5,hh,1.6],cols[i%4]);y+=hh}
  s.box([x0-.75,g0+H+.04,0],[1.52,.08,1.62],'#4b8a3c');s.box([x0-.2,g0+H+.17,0],[.3,.18,.4],'#596066');
  s.curve(Array.from({length:31},(_,i)=>pos(T*i/30)),'#42d9ca99',2,6);const tt=Math.min(cycle(t,T+1),T),b=pos(tt);seamBall(s,b,.13,'#e8833a','#3a1f10',tt*5);s.shadow(b,.13,g0,.4);flag(s,[x0+Rn*k,g0,-.3],C.red,.7);
  if(tt<T){s.arrow(b,V.add(b,[p.speed*.05,0,0]),C.mint,2.5,9,`v_x = ${p.speed} m/s`);s.arrow(b,V.add(b,[0,-G*tt*.05,0]),C.red,2.5,9,`v_y = ${f(G*tt,1)} m/s`)}
  s.seg([x0+.15,g0,.85],[x0+.15,g0+H,.85],C.white,1,[3,3]);s.label([x0+.25,g0+H/2,.85],`h = ${p.height} m`,C.white,12,'left');s.seg([x0,g0+.01,.85],[x0+Rn*k,g0+.01,.85],C.gold,1.2,[3,3]);s.label([x0+Rn*k/2,g0,1.2],`R = ${f(Rn,1)} m`,C.gold,12);
  callout(s,[x0-1.2,g0+H*.5,.8],'cliff',-40,0);
  s.render()};

R['projectile-incline']=(c,p,t)=>{const s=P3.scene(c,{scale:46,cy:285,yaw:.3}),be=rad(p.slope),th=be+rad(p.above),T=Math.max(0,2*p.speed*(Math.sin(th)-Math.cos(th)*Math.tan(be))/G),pos=q=>[p.speed*Math.cos(th)*q,p.speed*Math.sin(th)*q-.5*G*q*q,0],Ld=pos(T),k=5.5/Math.max(Math.hypot(Ld[0],Ld[1]),8),o=[-3,-1.6,0],Ls=6.6,D=.9;
  grass(s,-4.4,4.4,-2,1.6,o[1]);const top=V.add(o,[Ls*Math.cos(be),Ls*Math.sin(be),0]),foot=[top[0],o[1],0];
  if(be>.001){for(const z of[D,-D])s.poly([V.add(o,[0,0,z]),V.add(foot,[0,0,z]),V.add(top,[0,0,z])],'#7a5a3c',{normal:[0,0,Math.sign(z)]});s.poly([V.add(foot,[0,0,D]),V.add(foot,[0,0,-D]),V.add(top,[0,0,-D]),V.add(top,[0,0,D])],'#6d5038',{normal:[1,0,0]});
    for(let i=1;i<4;i++){const f0=i/4;s.seg(V.add(o,[Ls*Math.cos(be)*f0,0,D+.001]),V.add(o,[Ls*Math.cos(be)*f0,Ls*Math.sin(be)*f0,D+.001]),'#00000025',1)}}
  s.poly([V.add(o,[0,0,D]),V.add(top,[0,0,D]),V.add(top,[0,0,-D]),V.add(o,[0,0,-D])],'#4b8a3c',{normal:[-Math.sin(be),Math.cos(be),0]});
  for(let i=1;i<6;i++){const q=V.add(o,[Ls*Math.cos(be)*i/6,Ls*Math.sin(be)*i/6,0]);s.seg(V.add(q,[0,.003,-D]),V.add(q,[0,.003,D]),'#3f7d3a',1.5)}
  const ld=V.add(o,V.mul(Ld,k));launcher(s,V.add(o,[0,-.32*.55,0]),th,.55);s.curve(Array.from({length:31},(_,i)=>V.add(o,V.mul(pos(T*i/30),k))),C.mint,2.4,6);
  const tt=Math.min(cycle(t,T+1),T),b=V.add(V.add(o,V.mul(pos(tt),k)),[0,.13,0]);seamBall(s,b,.13,'#d8e04a','#f4f4ee',tt*6);s.ring(ld,[-Math.sin(be),Math.cos(be),0],.2,C.red,2);flag(s,V.add(ld,[0,0,-.4]),C.red,.6);
  s.arrow(V.add(o,[0,.05,.3]),V.add(o,[Math.cos(th)*.9,.05+Math.sin(th)*.9,.3]),C.gold,2.5,9,`u = ${p.speed} m/s`);
  const arc=[];for(let i=0;i<=12;i++){const a=be*i/12;arc.push(V.add(o,[.8*Math.cos(a),.8*Math.sin(a),D]))}if(be>.01){s.path(arc,C.white,1.2);s.label(V.add(o,[1.15,.2,D]),`β = ${p.slope}°`,C.white,11)}
  callout(s,V.add(top,[-.8,-.1,-.3]),'hillside',30,-30);
  s.render()};

R['air-drag-projectile']=(c,p,t)=>{const r=memo('drag11a'+p.v+p.th+p.k,()=>dragPath(p)),Tv=2*p.v*Math.sin(rad(p.th))/G,rv=p.v**2*Math.sin(2*rad(p.th))/G,k=6/Math.max(rv,r.range,1),s=P3.scene(c,{scale:52,cy:285,yaw:.25}),g0=-1.6,th=rad(p.th);
  grass(s,-4.4,4.4,-2,1.8,g0);for(const z of[-.6,.6])launcher(s,[-3,g0-.32*.45,z],th,.45);
  const vac=Array.from({length:61},(_,i)=>{const tt=Tv*i/60;return[-3+p.v*Math.cos(th)*tt*k,g0+(p.v*Math.sin(th)*tt-.5*G*tt*tt)*k,-.6]});s.curve(vac,'#7baaff',2,6);
  const dr=r.pts.map(([x,y])=>[-3+x*k,g0+y*k,.6]);s.curve(dr,C.gold,2.6,6);const i=Math.min(dr.length-1,Math.floor(cycle(t,r.T+1)/r.T*(dr.length-1)));seamBall(s,V.add(dr[i],[0,.12,0]),.12,'#d8e04a','#f4f4ee',t*6);s.shadow(dr[i],.13,g0,.4);
  const j=Math.min(60,Math.floor(cycle(t,r.T+1)/Tv*60));s.ball(V.add(vac[j],[0,.11,0]),.11,'#7baaff');target(s,[-3+rv*k,g0,-.6],.25);target(s,[-3+r.range*k,g0,.6],.25);
  callout(s,[-3+rv*k,g0,-.6],`vacuum ${f(rv,1)} m`,40,-40);callout(s,[-3+r.range*k,g0,.6],`drag ${f(r.range,1)} m`,30,40);
  s.render();tag(c,'blue: vacuum   gold: with drag',44,98,C.muted,13)};
function dragPath(p){const k=p.k,ux=p.v*Math.cos(rad(p.th)),uy=p.v*Math.sin(rad(p.th)),X=t=>ux/k*(1-Math.exp(-k*t)),Y=t=>(uy/k+G/k/k)*(1-Math.exp(-k*t))-G*t/k;let lo=1e-3,hi=2*uy/G+1;for(let i=0;i<60;i++){const m=(lo+hi)/2;Y(m)>0?lo=m:hi=m}const T=lo;return{T,range:X(T),pts:Array.from({length:81},(_,i)=>[X(T*i/80),Math.max(0,Y(T*i/80))])}}

R['conical-pendulum']=(c,p,t)=>{const ct=Math.cos(rad(p.th)),w=Math.sqrt(G/(p.L*ct)),Ls=.9+p.L*.55,r=Ls*Math.sin(rad(p.th)),h=Ls*ct,py=1.75,piv=[0,py,0],a=w*t,b=[r*Math.cos(a),py-h,r*Math.sin(a)],g0=-1.6;
  const s=P3.scene(c,{scale:56,cy:248});tiles(s,-3.2,3.2,-2.4,2.2,g0);
  s.box([0,py+.32,0],[4.6,.3,.4],'#8a5a36');s.box([0,py+.15,0],[.5,.04,.5],'#868e96');for(const dx of[-.18,.18])for(const dz of[-.18,.18])s.cyl([dx,py+.18,dz],[0,1,0],.03,.03,DK);s.cyl([0,py+.07,0],[0,1,0],.05,.12,CH);s.ball(piv,.04,CH);
  s.ring([0,py-h,0],[0,1,0],r,'#42d9ca66',1.5,[5,5]);s.seg(piv,[0,g0,0],'#8ca6b966',1,[4,4]);
  const rb=.08+.08*Math.cbrt(p.m),bc=V.add(b,V.mul(V.norm(V.sub(b,piv)),rb));s.seg(piv,b,'#f1ead8',1.8);s.cyl(b,V.sub(b,piv),.018,.05,ST);s.ball(bc,rb,BRASS);s.shadow([bc[0],g0,bc[2]],rb,g0,.4);
  const cen=V.mul([-Math.cos(a),0,-Math.sin(a)],.6);s.arrow(bc,V.add(bc,cen),C.red,2.5,11,`F_c = mg tanθ = ${f(p.m*9.8*Math.tan(p.th*Math.PI/180),2)} N`);s.arrow(bc,[bc[0],bc[1]-.6,bc[2]],C.blue,2.5,11,`W = ${f(p.m*9.8,2)} N`);
  callout(s,[1.6,py+.3,.2],'ceiling beam',40,-20);callout(s,[0,py+.1,.2],'swivel hook',-60,-20);callout(s,bc,'brass bob',-50,40);
  s.render();tag(c,'red: centripetal (net) force   blue: weight',44,98,C.muted,13)};

})();
