/* Detailed, realistic 3D apparatus for Class 11 physics (part b). */
(() => {
'use strict';
const R=window.PhysicaReal3D=window.PhysicaReal3D||{};
const {f,clamp,rad,deg,cycle,memo,tag,chart,PI,TAU,C}=window.PhysicaLab;
const P3=window.Physica3D,V=P3.vec,G=9.8;

/* ---------- materials ---------- */
const WOOD='#8a5a36',WOODL='#a8743f',GRAIN='#4f2f17',AL='#d4d9de',STEEL='#9aa1a8',CHROME='#c8ced4',IRON='#4a5056',RUB='#1d1f22',BRASS='#c49a3a',STR='#ece6d2',BENCH='#7a5232';

/* ---------- small geometry helpers ---------- */
const rz=(v,a)=>[v[0]*Math.cos(a)-v[1]*Math.sin(a),v[0]*Math.sin(a)+v[1]*Math.cos(a),v[2]];
const ry=(v,a)=>[v[0]*Math.cos(a)+v[2]*Math.sin(a),v[1],-v[0]*Math.sin(a)+v[2]*Math.cos(a)];
const at=(c,a,q)=>V.add(c,rz(q,a));
const faces=(s,p,n)=>s.P(V.add(p,V.mul(n,.05)))[2]>s.P(p)[2];
const part=(s,p,txt,dx,dy)=>s.callout(p,txt,C.mint,dx,dy,11);
const arc=(o,r,a0,a1,n=24,z=0)=>Array.from({length:n+1},(_,i)=>{const a=a0+(a1-a0)*i/n;return[o[0]+r*Math.cos(a),o[1]+r*Math.sin(a),o[2]+z]});

/* ---------- lab furniture and apparatus ---------- */
// Wooden laboratory bench top (a ground layer) with grain on its top.
function bench(s,x0,x1,y,z0=-1.1,z1=1.1,col=BENCH){const w=x1-x0,d=z1-z0;s.box([(x0+x1)/2,y-.09,(z0+z1)/2],[w,.18,d],col,{ground:true});
  for(let i=1;i<10;i++){const z=z0+d*i/10,pts=[];for(let k=0;k<=14;k++)pts.push([x0+w*k/14,y+.003,z+Math.sin(k*.8+i*1.9)*.035]);s.path(pts,'#3f271466',1,[],-4e5)}
  s.path([[x0,y,z1],[x1,y,z1]],'#c0905c88',1.4,[],-4e5)}
// A wooden block (optionally tilted by a about z) with grain lines on the visible faces.
function woodBlock(s,c,[w,h,d],a=0,col=WOOD){s.box(c,[w,h,d],col,{rotZ:a,stroke:'#2a170a55'});
  if(faces(s,at(c,a,[0,0,d/2]),[0,0,1])){const n=Math.max(3,Math.round(h/.07));for(let i=1;i<n;i++){const y0=-h/2+h*i/n,pts=[];for(let k=0;k<=8;k++)pts.push(at(c,a,[-w/2+w*(.03+.94*k/8),y0+Math.sin(k*1.3+i*2.1)*h*.03,d/2+.004]));s.path(pts,GRAIN+'99',1)}}
  const up=rz([0,1,0],a);if(faces(s,at(c,a,[0,h/2,0]),up))for(let i=1;i<4;i++){const z0=-d/2+d*i/4,pts=[];for(let k=0;k<=8;k++)pts.push(at(c,a,[-w/2+w*(.03+.94*k/8),h/2+.004,z0+Math.sin(k*1.1+i)*d*.04]));s.path(pts,GRAIN+'77',1)}
  const sd=rz([1,0,0],a);if(faces(s,at(c,a,[w/2,0,0]),sd))for(let i=1;i<3;i++){const rr=Math.min(h,d)*.16*i;s.path(Array.from({length:13},(_,k)=>{const q=TAU*k/12;return at(c,a,[w/2+.004,-h*.15+rr*Math.sin(q),d*.1+rr*Math.cos(q)])}),GRAIN+'88',1)}}
const eye=(s,p,axis=[0,0,1])=>s.ring(p,axis,.045,'#aeb5bc',2.2);
// Newton spring balance from ring end a to hook end b; pointer shows val out of max.
function springBalance(s,a,b,val,max){const d=V.sub(b,a),L=Math.hypot(...d),n=V.norm(d),bl=L*.6,m=V.add(a,V.mul(n,L*.38)),side=V.norm(V.cross([0,0,1],n));
  s.ring(a,[0,0,1],.05,'#aeb5bc',2.2);s.cyl(V.add(a,V.mul(n,.05+(L*.38-bl/2-.05)/2)),n,.014,Math.max(.02,L*.38-bl/2-.05),CHROME);
  s.cyl(m,n,.075,bl,'#e3e7ea',{seg:16,cap:'#aab1b8'});for(const k of[-1,1])s.cyl(V.add(m,V.mul(n,k*(bl/2+.015))),n,.082,.03,'#7f878f',{seg:16});
  const fr=V.add(m,[0,0,.077]);for(let i=0;i<=10;i++){const q=V.add(fr,V.mul(n,-bl*.4+bl*.8*i/10)),L2=i%5===0?.05:.03;s.seg(V.add(q,V.mul(side,-L2)),V.add(q,V.mul(side,L2)),'#1b1f23',1)}
  const pp=V.add(fr,V.mul(n,-bl*.4+bl*.8*clamp(val/max,0,1)));s.seg(V.add(pp,V.mul(side,-.07)),V.add(pp,V.mul(side,.07)),'#e03131',2.4);
  const hb=V.add(m,V.mul(n,bl/2));s.cyl(V.add(hb,V.mul(n,(L-L*.38-bl/2)/2)),n,.014,L-L*.38-bl/2,CHROME);s.ring(b,[0,0,1],.04,'#aeb5bc',2)}
// Spoked metal pulley turning about z.
function pulley(s,c,r,ang=0,o={}){const w=o.w||.1,ax=[0,0,1],N=28;s.cyl(c,ax,r,w,o.col||'#c3c9cf',{caps:false,seg:32});
  for(const sg of[1,-1])for(let i=0;i<N;i++){const a1=TAU*i/N,a2=TAU*(i+1)/N,z=c[2]+sg*w/2,q=(rr,aa)=>[c[0]+rr*Math.cos(aa),c[1]+rr*Math.sin(aa),z];s.poly([q(r*.8,a1),q(r,a1),q(r,a2),q(r*.8,a2)],'#b4bac0',{cull:true,normal:[0,0,sg]})}
  for(let i=0;i<5;i++){const a=ang+TAU*i/5;s.tube([V.add(c,[r*.18*Math.cos(a),r*.18*Math.sin(a),0]),V.add(c,[r*.82*Math.cos(a),r*.82*Math.sin(a),0])],r*.055,'#aab1b8',{segs:6})}
  s.cyl(c,ax,r*.2,w*1.3,'#8f969d');s.cyl(c,ax,r*.07,w*2.6,IRON);s.ring(V.add(c,[0,0,w/2+.002]),ax,r,'#5d646b',1.2)}
// Retort stand: cast-iron base and chrome rod; returns the rod top.
function stand(s,base,h,dx=-.3){s.box(V.add(base,[0,.05,0]),[1.1,.1,.7],'#3c4248');s.cyl(V.add(base,[dx,.1+h/2,0]),[0,1,0],.04,h,CHROME,{seg:14});return V.add(base,[dx,.1+h,0])}
const boss=(s,p)=>{s.box(p,[.15,.15,.15],'#6f777f');s.cyl(V.add(p,[0,0,.14]),[0,0,1],.022,.14,'#4d545b');s.cyl(V.add(p,[0,0,.21]),[1,0,0],.018,.14,'#4d545b')};
// Slotted-mass hanger hanging from point top; m in kg (one disc per 0.5 kg). Returns the bottom point.
function hanger(s,top,m,disc=.5,col=BRASS,r=.17){const n=Math.max(1,Math.round(m/disc)),th=Math.min(r*.3,r*4/n),Lr=.12+n*th+.06,bot=V.add(top,[0,-Lr,0]);
  s.tube(arc(V.add(top,[0,-.05,0]),.05,-PI/2,PI*.9,10),.012,'#aeb5bc',{segs:5});s.cyl(V.add(top,[0,-.1-(Lr-.1)/2,0]),[0,1,0],.016,Lr-.1,CHROME,{seg:8});
  s.cyl(V.add(bot,[0,.02,0]),[0,1,0],r*1.02,.04,'#6f777f',{seg:20});for(let i=0;i<n;i++)s.cyl(V.add(bot,[0,.04+th*(i+.5),0]),[0,1,0],r,th*.9,col,{seg:20,cap:'#d6b45e'});
  const ty=bot[1]+.04+th*n+.002;s.seg([bot[0],ty,bot[2]],[bot[0],ty,bot[2]+r],'#3a2d0f',2);return bot}
// Laboratory trolley: body, rubber wheels with steel hubs. p = ground point under its centre.
function trolley(s,p,L,col,o={}){const h=o.h||.22,d=o.d||.55,wr=o.wr||.11,a=o.a||0,q=v=>at(p,a,v);s.box(q([0,wr+h/2+.02,0]),[L,h,d],col,{rotZ:a});s.box(q([0,wr+h+.03,0]),[L*.96,.03,d*.96],'#2b2f33',{rotZ:a});
  for(const dx of[-L*.32,L*.32])for(const dz of[-d/2-.03,d/2+.03]){s.cyl(q([dx,wr,dz]),[0,0,1],wr,.06,RUB,{seg:18});s.cyl(q([dx,wr,dz+Math.sign(dz)*.032]),[0,0,1],wr*.45,.01,CHROME,{seg:12})}}
// Quadrant protractor in the plane z = o[2], showing angle th (rad) from the +x direction.
function protractor(s,o,r,th,lab){const pts=arc(o,r,0,PI/2,30);s.poly([o,...pts],'#e9f6ff',{alpha:.16,normal:[0,0,1]});s.path(pts,'#e9f6ffaa',1.4);
  for(let dg=0;dg<=90;dg+=5){const a=rad(dg),L=dg%10===0?.12:.07;s.seg([o[0]+r*Math.cos(a),o[1]+r*Math.sin(a),o[2]],[o[0]+(r-L)*Math.cos(a),o[1]+(r-L)*Math.sin(a),o[2]],'#e9f6ffcc',1);if(lab!=='nolabels'&&dg%30===0&&dg>0&&dg<90)s.label([o[0]+(r+.13)*Math.cos(a),o[1]+(r+.13)*Math.sin(a),o[2]],dg+'°','#cfe3ef',10)}
  s.path(arc(o,r*.55,0,th,20),C.gold,2.4);if(lab)s.label([o[0]+r*.72*Math.cos(th/2),o[1]+r*.72*Math.sin(th/2),o[2]],lab,C.gold,12)}
// A short string/rope.
const string=(s,a,b,col=STR,w=1.6)=>s.seg(a,b,col,w);

/* ================= Laws of Motion ================= */
R['forces']=(c,p,t)=>{const s=P3.scene(c,{scale:70,cy:285,cx:330,yaw:.15}),fr=p.friction*p.mass*G,a=p.force>fr?(p.force-fr)/p.mass:0,tt=cycle(t,4),x=clamp(-2.2+.5*a*tt*tt*.25,-2.2,.3),sz=.5+p.mass*.04,w=sz*1.3;
  bench(s,-3.4,3.6,0,-.9,.9);woodBlock(s,[x,sz/2,0],[w,sz,sz]);const e=[x+w/2+.05,sz/2,0];eye(s,e,[0,1,0]);const b=[e[0]+1.3,sz/2,0];springBalance(s,b,V.add(e,[.04,0,0]),p.force,100);
  s.tube([b,V.add(b,[.35,0,0])],.012,STR,{segs:5});s.arrow(V.add(b,[.4,0,0]),V.add(b,[.5+p.force*.012,0,0]),C.gold,4,11,`F = ${p.force} N`);
  if(p.friction>0)s.arrow([x-w*.2,.03,sz/2+.06],[x-w*.2-.15-Math.min(p.force,fr)*.015,.03,sz/2+.06],C.red,3,11,`f = ${f(Math.min(p.force,fr),1)} N`);
  s.arrow([x,sz+.05,0],[x,sz+.05+p.mass*G*.012,0],C.mint,3,11,`N = ${f(p.mass*G,1)} N`);
  part(s,[x-w/2+.05,sz*.8,sz/2],'wooden block',-50,-50);part(s,V.add(b,[-.6,.08,.05]),'spring balance (0–100 N)',10,-70);part(s,[-3,0,.6],'rough bench top',-10,40);
  s.render();tag(c,a>0?'Net force → block accelerates':'Static friction balances the push',44,98,a>0?C.gold:C.mint,14)};

R['inclined-plane']=(c,p,t)=>{const s=P3.scene(c,{scale:62,cy:292,yaw:.12}),th=rad(p.angle),slide=Math.tan(th)>p.mu,a=slide?G*(Math.sin(th)-p.mu*Math.cos(th)):0,L=4,o=[-2.1,-1.4,0],dir=[Math.cos(th),Math.sin(th),0],nrm=[-Math.sin(th),Math.cos(th),0],u=clamp(.85-(slide?.5*a*cycle(t,2.5)**2*.08:0),.12,.85);
  bench(s,-3.2,3,o[1]-.04,-1,1);s.box([o[0]+L*Math.cos(th)/2+.1,o[1]+.0,0],[L*Math.cos(th)+.6,.08,1.5],WOOD,{ground:false});
  // aluminium plane with side rails, hinge and an adjustable prop
  const pc=V.add(o,V.add(V.mul(dir,L/2),V.mul(nrm,.04)));s.box(pc,[L,.05,1.3],AL,{rotZ:th});for(const z of[-.66,.66])s.box(V.add(V.add(o,V.add(V.mul(dir,L/2),V.mul(nrm,.08))),[0,0,z]),[L,.12,.04],'#b9c0c7',{rotZ:th});
  s.cyl(V.add(o,[0,.07,0]),[0,0,1],.06,1.45,'#868e96');const tx=o[0]+L*.82*Math.cos(th),ty=o[1]+L*.82*Math.sin(th);s.cyl([tx,(o[1]+.04+ty)/2,-.5],[0,1,0],.035,ty-o[1]-.04,CHROME,{seg:12});s.cyl([tx,o[1]+.08,-.5],[0,1,0],.16,.08,'#3c4248');s.box([tx,ty-.06,-.5],[.12,.12,.12],'#6f777f');
  protractor(s,[o[0],o[1]+.08,.72],1.1,th,`θ = ${p.angle}°`);
  const bp=V.add(o,V.add(V.mul(dir,u*L),V.mul(nrm,.27)));woodBlock(s,bp,[.6,.4,.6],th);
  s.arrow(bp,[bp[0],bp[1]-.85,bp[2]],C.gold,2.5,11,'W = mg');s.arrow(bp,V.add(bp,V.mul(nrm,.75)),C.mint,2.5,11,`N = ${f(Math.cos(th),2)} mg`);s.arrow(V.add(bp,[0,0,.32]),V.add(bp,V.add(V.mul(dir,.7),[0,0,.32])),C.red,2.5,11,`f = ${f(slide?p.mu*Math.cos(th):Math.sin(th),2)} mg`);
  part(s,V.add(o,V.add(V.mul(dir,L*.55),[0,0,-.6])),'aluminium inclined plane',30,-60);part(s,[o[0],o[1]+.07,-.7],'hinge',-40,30);part(s,[tx,ty*.5+o[1]*.5,-.5],'adjustable prop',40,30);
  s.render();tag(c,'gold: weight · mint: normal · red: friction',44,98,C.muted,13)};

R['atwood']=(c,p,t)=>{const s=P3.scene(c,{scale:54,cy:280,yaw:.1}),a=(p.m2-p.m1)*G/(p.m1+p.m2),d=clamp(.5*a*cycle(t,3)**2*.15,-.8,.8),Rp=.45,pc=[0,1.75,0],yb=-2.1;
  bench(s,-3,3,yb);const top=stand(s,[-1.6,yb,0],pc[1]-yb+.15,-.3);boss(s,[top[0],pc[1]+.05,0]);s.cyl([(top[0]+pc[0])/2,pc[1]+.05,0],[1,0,0],.03,pc[0]-top[0],CHROME);
  for(const z of[-.09,.09])s.box([pc[0],pc[1]+.02,z],[.12,.22,.02],'#6f777f');pulley(s,pc,Rp,-d/Rp+.3);
  const y1=-.1+d,y2=-.1-d;string(s,[-Rp,pc[1],0],[-Rp,y1,0]);string(s,[Rp,pc[1],0],[Rp,y2,0]);s.path(arc(pc,Rp+.005,0,PI,16),STR,1.6);
  const b1=hanger(s,[-Rp,y1,0],p.m1,.5,BRASS,.22),b2=hanger(s,[Rp,y2,0],p.m2,.5,BRASS,.22);s.label([-Rp-.35,(y1+b1[1])/2,0],`m₁ = ${p.m1} kg`,C.blue,12,'right');s.label([Rp+.35,(y2+b2[1])/2,0],`m₂ = ${p.m2} kg`,C.gold,12,'left');
  if(Math.abs(a)>1e-6){const sx=a>0?Rp:-Rp,yy=a>0?y2:y1;s.arrow([sx+(a>0?.45:-.45),yy+.1,.2],[sx+(a>0?.45:-.45),yy+.1-.25-Math.abs(a)*.08,.2],C.mint,3,10,`a = ${f(Math.abs(a),2)} m/s²`)}
  part(s,[pc[0],pc[1]+Rp,0],'light spoked pulley',50,-30);part(s,[top[0],yb+1,0],'retort stand',-40,10);part(s,V.add(b1,[0,.1,.17]),'slotted masses on hanger',-50,40);
  s.render();tag(c,`a = (m₂ − m₁)g/(m₁ + m₂) = ${f(a,2)} m/s²`,44,98,C.gold,14)};

R['elevator-weight']=(c,p,t)=>{const s=P3.scene(c,{scale:48,cy:268,yaw:.15}),y=.4*Math.sin(t*.8)*Math.sign(p.acceleration||0),Nf=p.mass*(G+p.acceleration),W=2,H=2.8,D=1.6;
  // shaft guide rails and the traction sheave above
  for(const x of[-1.25,1.25]){s.box([x,.05,-.2],[.08,4.9,.12],'#5d646b');s.box([x,.05,-.2],[.2,4.9,.03],'#6f777f')}s.box([0,2.55,-.2],[3.4,.16,.5],'#3c4248');pulley(s,[.3,2.22,-.2],.32,-y*3,{w:.14});
  const top=y+H/2;for(const dx of[-.08,0,.08])s.seg([.3+dx-.32,2.22,-.2],[dx,top+.25,-.1],'#2b2f33',1.6);s.box([0,top+.18,-.1],[.5,.14,.25],'#7f878f');
  // counterweight on the other side of the sheave
  s.seg([.62,2.22,-.2],[.62,1.2-y,-.2],'#2b2f33',1.6);s.box([.62,.8-y,-.35],[.35,.8,.25],'#495057');
  // cabin: floor, roof, back panel, glass sides and posts
  s.box([0,y-H/2,0],[W,.12,D],'#495057');s.box([0,y+H/2,0],[W,.1,D],'#6f777f');s.box([0,y,-D/2+.02],[W,H,.04],'#aeb5bc');s.box([0,y-.2,-D/2+.09],[W*.8,.04,.06],CHROME);
  for(const x of[-W/2,W/2])s.box([x,y,0],[.03,H,D],'#a5d8ff',{alpha:.14});for(const x of[-W/2,W/2])for(const z of[-D/2,D/2])s.box([x,y,z],[.06,H,.06],'#868e96');
  // bathroom scale with digital read-out
  s.box([0,y-H/2+.11,.1],[.75,.1,.55],'#e9ecef');s.box([0,y-H/2+.165,.32],[.3,.012,.08],'#1d2b20');s.engrave([0,y-H/2+.18,.33],`${f(Math.max(0,Nf),0)} N`,'#69db7c',11);
  window.PhysicaBio.critter(s,'human',[0,y-H/2+.16,0],.85,t);
  s.label([0,y-H/2-.35,.9],`scale reads ${f(Math.max(0,Nf),0)} N`,C.mint,13);s.arrow([-1.7,y,.3],[-1.7,y+p.acceleration*.08,.3],C.gold,4,11,`a = ${p.acceleration} m/s²`);
  part(s,[-1.25,1.9,-.2],'guide rail',-40,-10);part(s,[.3,2.5,-.2],'traction sheave',50,0);part(s,[.75,.9-y,-.3],'counterweight',60,10);part(s,[-.25,y-H/2+.16,.35],'weighing scale',-60,30);
  s.render()};

R['connected-blocks']=(c,p,t)=>{const s=P3.scene(c,{scale:68,cy:285,cx:330,yaw:.15}),a=p.force/(p.m1+p.m2),x=-2.6+clamp(.5*a*cycle(t,3)**2*.08,0,1.3),z=m=>.32+m*.04,w1=z(p.m1)*1.3,w2=z(p.m2)*1.3;
  bench(s,-3.6,3.6,0,-.9,.9);const x2=x,x1=x+w2/2+.9+w1/2;woodBlock(s,[x2,z(p.m2)/2,0],[w2,z(p.m2),z(p.m2)],0,'#9a6a3e');woodBlock(s,[x1,z(p.m1)/2,0],[w1,z(p.m1),z(p.m1)]);
  const hy=.18,e2=[x2+w2/2+.05,hy,0],e1=[x1-w1/2-.05,hy,0];eye(s,e2,[0,1,0]);eye(s,e1,[0,1,0]);string(s,e2,e1);const T=p.m2*a;
  const ef=[x1+w1/2+.05,hy,0];eye(s,ef,[0,1,0]);const b=V.add(ef,[1.1,0,0]);springBalance(s,b,V.add(ef,[.04,0,0]),p.force,60);s.arrow(V.add(b,[.08,0,0]),V.add(b,[.2+p.force*.015,0,0]),C.mint,4,11,`F = ${p.force} N`);
  s.arrow([(e1[0]+e2[0])/2,hy+.32,0],[(e1[0]+e2[0])/2+.15+T*.02,hy+.32,0],C.gold,2.5,9,`T = ${f(T,1)} N`);
  s.label([x1,z(p.m1)+.3,0],`m₁ = ${p.m1} kg`,C.blue,12);s.label([x2,z(p.m2)+.3,0],`m₂ = ${p.m2} kg`,C.gold,12);
  part(s,[(e1[0]+e2[0])/2,hy,0],'connecting string',-20,60);part(s,V.add(b,[-.5,.08,.05]),'spring balance',20,-70);
  s.render();tag(c,`a = F/(m₁ + m₂) = ${f(a,2)} m/s²`,44,98,C.gold,14)};

R['banked-turn']=(c,p,t)=>{const s=P3.scene(c,{scale:64,pitch:.08,cy:205}),th=rad(p.angle),v=Math.sqrt(p.radius*G*Math.tan(th)),Rr=2,w=1.15,a=t*.6,y0=-.5,hh=w*Math.tan(th);
  s.cyl([0,y0-.06,0],[0,1,0],Rr-w/2,.1,'#3d7a3a',{seg:40});s.lathe([0,y0,0],[[Rr-w/2,0],[Rr+w/2,hh]],'#5f656c',{segs:48});s.lathe([0,y0,0],[[Rr+w/2,hh],[Rr+w/2+.06,hh+.08]],'#ced4da',{segs:48});s.lathe([0,y0,0],[[Rr+w/2+.06,hh+.08],[Rr+w/2+.5,-.08]],'#4a7a3c',{segs:48});
  for(let i=0;i<48;i++){const q=TAU*i/48,q2=TAU*(i+.6)/48;if(i%2)continue;s.seg([Rr*Math.cos(q),y0+hh/2+.01,Rr*Math.sin(q)],[Rr*Math.cos(q2),y0+hh/2+.01,Rr*Math.sin(q2)],'#f1f3f5',2)}
  for(let i=0;i<40;i++){const q=TAU*i/40,q2=TAU*(i+1)/40,r0=Rr-w/2-.01;s.seg([r0*Math.cos(q),y0+.01,r0*Math.sin(q)],[r0*Math.cos(q2),y0+.01,r0*Math.sin(q2)],i%2?'#e03131':'#f8f9fa',4)}
  // car: body, cabin with glass, four wheels, banked with the road
  const cr=Rr,cc=[cr*Math.cos(a),y0+hh/2,cr*Math.sin(a)],X=q=>V.add(cc,ry(rz(q,th),-a));const bx=(q,sz,col,o={})=>s.box(X(q),sz,col,{rotY:-a,rotZ:th,...o});
  bx([0,.2,0],[.46,.16,.95],'#c92a2a');bx([0,.34,-.05],[.42,.14,.48],'#8a1c1c');bx([0,.34,.195],[.38,.11,.01],'#a5d8ff');bx([0,.34,-.295],[.38,.1,.01],'#a5d8ff');for(const sx of[-1,1])bx([sx*.211,.34,-.05],[.01,.1,.4],'#a5d8ff');for(const sx of[-1,1])bx([sx*.15,.2,.476],[.09,.05,.01],'#fff3bf');for(const dx of[-.24,.24])for(const dz of[-.3,.3])s.cyl(X([dx,.1,dz]),ry(rz([1,0,0],th),-a),.1,.08,RUB,{seg:14,cap:'#868e96'});
  const nv=ry(rz([0,1,0],th),-a),top=X([0,.42,0]);s.arrow(top,V.add(top,V.mul(nv,.9/Math.cos(th)*.8)),C.mint,3,10,`N = ${f(1/Math.cos(th),2)} mg`);s.arrow(X([0,.16,0]),V.add(X([0,.16,0]),[0,-.75,0]),C.gold,3,10,'mg');
  part(s,[-(Rr+w/2)*.7,y0+hh+.1,-(Rr+w/2)*.7],`road banked at ${p.angle}°`,-30,-40);part(s,[0,y0,0],'infield',-60,50);
  s.render();tag(c,`Design speed ≈ ${f(v,1)} m/s`,44,98,C.gold,15)};

R['two-rope-support']=(c,p,t)=>{const s=P3.scene(c,{scale:60,cy:262,yaw:.1}),al=rad(p.left),be=rad(p.right),knot=[0,-.2,0],Lr=2.1,A=[knot[0]-Lr*Math.cos(al),knot[1]+Lr*Math.sin(al),0],B=[knot[0]+Lr*Math.cos(be),knot[1]+Lr*Math.sin(be),0],yb=-2.0;
  bench(s,-3.2,3.2,yb,-1,.9);for(const P of[A,B]){const top=stand(s,[P[0]+(P===A?.3:-.3),yb,-.15],P[1]-yb+.25,P===A?-.3:.3);boss(s,[P[0],P[1]+.08,-.15]);s.cyl([P[0],P[1]+.08,-.04],[0,0,1],.02,.18,CHROME)}
  const den=Math.sin(al+be),T1=p.mass*G*Math.cos(be)/den,T2=p.mass*G*Math.cos(al)/den,mx=Math.max(50,Math.ceil(Math.max(T1,T2)/50)*50);
  for(const [P,T] of[[A,T1],[B,T2]]){const d=V.sub(P,knot),u=V.norm(d),La=Math.hypot(...d),q1=V.add(knot,V.mul(u,La*.3)),q2=V.add(knot,V.mul(u,La*.82));string(s,knot,q1);springBalance(s,q2,q1,T,mx);string(s,q2,P)}
  s.ring(knot,[0,0,1],.06,'#aeb5bc',2.5);const mh=.3+p.mass*.012,lt=[0,knot[1]-.42,0];string(s,knot,lt);s.tube(arc(V.add(lt,[0,-.05,0]),.05,-PI/2,PI*.9,10),.012,'#aeb5bc',{segs:5});s.cyl(V.add(lt,[0,-.1-mh/2,0]),[0,1,0],.28,mh,'#3f454b',{seg:24,cap:'#5b636b'});s.engrave(V.add(lt,[0,-.1-mh/2,.29]),p.mass+' kg','#e9ecef',11);
  const k=.011;s.arrow(V.add(knot,[0,0,.3]),V.add(knot,V.add(V.mul(V.norm(V.sub(A,knot)),T1*k),[0,0,.3])),C.gold,3,11,`T₁ = ${f(T1,1)} N`);s.arrow(V.add(knot,[0,0,.3]),V.add(knot,V.add(V.mul(V.norm(V.sub(B,knot)),T2*k),[0,0,.3])),C.mint,3,11,`T₂ = ${f(T2,1)} N`);
  s.arrow(V.add(lt,[.55,-.1,0]),V.add(lt,[.55,-.1-p.mass*G*k*.6,0]),C.red,2.5,10,`W = ${f(p.mass*G,0)} N`);
  part(s,knot,'knot ring',-60,20);part(s,V.add(A,[.2,0,0]),'clamp on stand',-30,-30);
  s.render();tag(c,'gold: T₁ · mint: T₂ (spring balances read the tensions)',44,98,C.muted,13)};

R['impulse-catch']=(c,p,t)=>{const s=P3.scene(c,{scale:64,cy:280,cx:235,yaw:.1}),T=1.6,tt=cycle(t,T+1),fall=Math.min(1,tt/T),y=1.6-2.9*fall*fall,squash=clamp(p.dt/.5,.04,1),yb=-1.6;
  bench(s,-2.3,2.3,yb,-1,1);const hit=fall>=1,pillow=.12+.6*squash,ph=pillow*(hit?.6:1);
  s.box([0,yb+.03,0],[1.9,.06,1.3],'#adb5bd');s.box([0,yb+.06+ph/2,0],[1.7,ph,1.2],'#9b8ec4');for(const x of[-.42,0,.42])for(const z of[-.3,.3])s.ball([x,yb+.06+ph+.005,z],.025,'#6f5fa3',{flat:true});
  s.seg([-.85,yb+.06+ph,.6],[.85,yb+.06+ph,.6],'#b7acd9',1.5);
  const ey=hit?yb+.06+ph+.2:Math.max(y,yb+.06+ph+.2);s.mesh([0,ey,0],[.15,.2,.15],'#f1e3c6',{rings:10,segs:16,spec:.3});s.shadow([0,ey,0],.18,yb+.06+ph,.4);
  const st=stand(s,[-1.3,yb,-.3],3.4,-.3);boss(s,[st[0],1.75,-.3]);s.cyl([(st[0]+0)/2,1.75,-.3],[1,0,0],.025,-st[0],CHROME);s.lathe([0,1.72,-.3],[[.05,0],[.14,.12]],'#cfd4d9',{segs:16});
  if(!hit)s.arrow([.35,ey,0],[.35,ey-.25-p.v*.04,0],C.gold,3,10,`v = ${p.v} m/s`);
  part(s,[0,ey+.2,0],'egg',40,-20);part(s,[-.6,yb+.06+ph,.3],'foam cushion',-30,40);part(s,[0,1.78,-.3],'release cup',40,-10);s.render();
  const F=p.m*p.v/p.dt;chart(c,440,96,216,140,{title:'Force while stopping',xl:'t',xmin:0,xmax:.6,ymin:0,ymax:Math.max(F*1.1,1),series:[{pts:[[0,0],[.05,0],[.05,F],[.05+Math.min(.5,p.dt),F],[.05+Math.min(.5,p.dt),0],[.6,0]],col:C.gold}]});tag(c,`F̄ = ${f(F,1)} N`,452,224,C.gold,13)};

R['gun-recoil']=(c,p,t)=>{const m=p.m/1000,V0=m*p.v/p.M,tt=cycle(t,3),s=P3.scene(c,{scale:78,cy:270,cx:330,yaw:.3}),gx=-.1-Math.min(1.2,V0*tt*.5),yb=-1;
  bench(s,-2.9,3,yb-.12,-.8,.8);for(const z of[-.32,.32]){s.box([0,yb-.06,z],[5.6,.06,.06],'#868e96')}for(let i=0;i<12;i++)s.box([-2.75+i*.5,yb-.1,0],[.08,.03,.8],'#5c4632');
  trolley(s,[gx,yb-.03,0],1.7,'#3a6ea5',{d:.6,wr:.1});const deck=yb-.03+.1+.22+.06;
  // rifle: walnut stock, steel receiver, barrel, trigger guard; clamped to the cart
  const by=deck+.32;s.box([gx-.45,by-.05,0],[.85,.16,.12],'#6b3f1f',{rotZ:-.12});s.box([gx-.75,by-.1,0],[.25,.3,.12],'#6b3f1f');s.box([gx+.1,by,0],[.5,.14,.1],'#3b4148');
  s.cyl([gx+.95,by+.02,0],[1,0,0],.04,1.25,'#2b3036',{seg:12});s.cyl([gx+1.56,by+.02,0],[1,0,0],.05,.04,'#1b1f23',{seg:12});s.tube(arc([gx+.05,by-.12,0],.07,PI,TAU,10),.01,'#2b3036',{segs:4});s.box([gx+.05,by-.12,0],[.02,.08,.02],'#1b1f23');
  for(const dx of[-.3,.25])s.box([gx+dx,(deck+by)/2-.02,0],[.06,by-deck-.05,.16],'#6f777f');
  const bx=gx+1.6+Math.min(6,tt*p.v*.02);if(bx<3){s.cyl([bx,by+.02,0],[1,0,0],.035,.12,'#c9a227',{seg:10});s.ball([bx+.06,by+.02,0],.034,'#b87333');if(tt<.25)s.ball([gx+1.62,by+.02,0],.12,'#ffd43b',{glow:true,flat:true})}
  s.arrow([gx+.2,by+.5,0],[gx+.1-V0*.4-.1,by+.5,0],C.red,3,11,`V_recoil = ${f(V0,2)} m/s`);if(bx<2.4)s.arrow([bx+.15,by+.3,0],[bx+.85,by+.3,0],C.gold,3,10,`v = ${p.v} m/s`);
  part(s,[gx+.95,by+.06,0],'rifle clamped to cart',40,-70);part(s,[gx+.6,yb+.07,.33],'low-friction trolley',20,50);part(s,[2.5,yb-.06,.32],'rails',30,30);s.render();
  tag(c,`M V = m v → V = ${f(m*p.v,2)} / ${p.M} = ${f(V0,2)} m/s`,44,98,C.gold,14)};

R['angle-of-repose']=(c,p,t)=>{const th=rad(p.th),mk=.8*p.mus,slide=Math.tan(th)>p.mus,a=slide?G*(Math.sin(th)-mk*Math.cos(th)):0,s=P3.scene(c,{scale:62,cy:292,yaw:.12}),L=4,o=[-2.1,-1.4,0],dir=[Math.cos(th),Math.sin(th),0],nrm=[-Math.sin(th),Math.cos(th),0];
  bench(s,-3.2,3,o[1]-.1,-1,1);s.box([o[0]+2,o[1]-.05,0],[4.3,.1,1.6],WOOD,{ground:false});
  // hinged plank with an abrasive top, lifted by a screw jack
  s.box(V.add(o,V.add(V.mul(dir,L/2),V.mul(nrm,.05))),[L,.1,1.5],WOODL,{rotZ:th});s.box(V.add(o,V.add(V.mul(dir,L*.5+.1),V.mul(nrm,.105))),[L-.4,.012,1.2],'#7c7468',{rotZ:th});
  for(let i=0;i<4;i++)s.cyl(V.add(o,[0,0,-.6+i*.4]),[0,0,1],.06,.25,'#9c7c38');const jx=o[0]+L*.8*Math.cos(th),jy=o[1]+L*.8*Math.sin(th);
  s.box([jx,o[1]+.1,0],[.5,.12,.5],'#3c4248');s.cyl([jx,(o[1]+.16+jy)/2,0],[0,1,0],.045,Math.max(.05,jy-o[1]-.16),'#b0b7be',{seg:12});for(let k=0;k<12;k++){const yy=o[1]+.25+k*(jy-o[1]-.3)/12;s.ring([jx,yy,0],[0,1,0],.05,'#6c737a',1)}s.cyl([jx,o[1]+.5,0],[0,0,1],.02,.6,'#495057');
  protractor(s,[o[0],o[1]+.1,.8],1.1,th,`θ = ${p.th}°`);
  const u=clamp(.78-(slide?.5*a*cycle(t,2.5)**2*.12:0),.1,.78),bp=V.add(o,V.add(V.mul(dir,u*L),V.mul(nrm,.32)));woodBlock(s,bp,[.6,.42,.6],th,'#9a6a3e');
  s.arrow(V.add(bp,V.mul(nrm,.3)),V.add(bp,V.add(V.mul(dir,-.75),V.mul(nrm,.3))),C.mint,2.5,11,`mg sinθ = ${f(Math.sin(th),2)} mg`);s.arrow(bp,[bp[0],bp[1]-.85,bp[2]],C.gold,2.5,11,'W = mg');s.arrow(V.add(bp,[0,0,.32]),V.add(bp,V.add(V.mul(dir,.4+.4*Math.min(1,Math.tan(th))),[0,0,.32])),C.red,2.5,11,`f = ${f(slide?.8*p.mus*Math.cos(th):Math.sin(th),2)} mg`);
  part(s,V.add(o,V.add(V.mul(dir,L*.35),[0,0,-.6])),'sandpaper-covered plank',-20,-70);part(s,[jx,(o[1]+jy)/2,.05],'screw jack',50,10);part(s,[o[0],o[1],-.6],'hinge',-50,20);s.render();
  tag(c,slide?'Sliding — kinetic friction (μk = 0.8 μs)':'Static friction holds the block',44,98,slide?C.gold:C.mint,15);tag(c,'mint: down-slope pull   red: friction   gold: weight',44,124,C.muted,13)};

/* ================= Work, Energy and Power ================= */
const along=(path,q)=>{const i=Math.min(path.length-2,Math.floor(q*(path.length-1))),fr=q*(path.length-1)-i;return V.add(path[i],V.mul(V.sub(path[i+1],path[i]),fr))};
// Glass measuring column with a coloured fill (0..1).
function column(s,p,h,fill,col,lab){s.cyl(V.add(p,[0,.04,0]),[0,1,0],.2,.08,'#3c4248');if(fill>.005)s.cyl(V.add(p,[0,.08+h*fill/2,0]),[0,1,0],.15,h*fill,col,{seg:18});s.cyl(V.add(p,[0,.08+h/2,0]),[0,1,0],.17,h,'#d0ebff',{alpha:.18,seg:18});for(let i=1;i<10;i++)s.seg(V.add(p,[-.17,.08+h*i/10,.1]),V.add(p,[-.1,.08+h*i/10,.15]),'#e9f6ff99',1);s.label(V.add(p,[0,-.2,0]),lab,col,12)}

R['energy']=(c,p,t)=>{const s=P3.scene(c,{scale:56,cy:268,cx:320,yaw:.2}),H=p.height,hy=x=>H*Math.pow(x/3,2),k=3.2/8,yb=-1.45,path=Array.from({length:61},(_,i)=>{const x=-3+6*i/60;return[x,-1.4+hy(x)*k,0]});
  bench(s,-3.6,4.3,yb,-.9,.9);for(const z of[-.13,.13])s.tube(path.map(q=>V.add(q,[0,0,z])),.035,'#c8ced4',{segs:6});for(let i=2;i<60;i+=3){const q=path[i];s.box(V.add(q,[0,-.04,0]),[.05,.03,.34],'#5c4632')}
  for(let x=-2.5;x<=2.5;x+=1){const y=-1.4+hy(x)*k-.06;if(y-yb>.12){s.cyl([x,(y+yb)/2,0],[0,1,0],.035,y-yb,'#868e96',{seg:10});s.box([x,yb+.02,0],[.3,.04,.3],'#3c4248')}}
  const q=.5-.5*Math.cos(t*Math.sqrt(2*G/H)*.5),b=along(path,q),bc=V.add(b,[0,.17,0]);s.ball(bc,.16,'#d4d9de',{});s.shadow(bc,.16,b[1],.3);
  const yb2=(b[1]+1.4)/k,ke=p.mass*G*(H-yb2),pe=p.mass*G*yb2,tot=p.mass*G*H;column(s,[3.35,yb,0],2.6,pe/tot,'#4dabf7','PE');column(s,[3.85,yb,0],2.6,ke/tot,'#fcc419','KE');
  const v=Math.sqrt(Math.max(0,2*G*(H-yb2)));if(v>.3){const d=V.norm(V.sub(along(path,Math.min(1,q+.01)),along(path,Math.max(0,q-.01)))),sg=Math.sin(t*Math.sqrt(2*G/H)*.5)>=0?1:-1;s.arrow(V.add(bc,[0,.25,0]),V.add(bc,V.add([0,.25,0],V.mul(d,sg*(.2+v*.06)))),C.mint,3,10,`v = ${f(v,1)} m/s`)}
  part(s,path[8],'steel twin-rail track',-30,-40);part(s,bc,'steel ball',30,-50);part(s,[-1.5,yb+.3,0],'support pillar',-50,30);
  s.render();tag(c,`PE = ${f(pe,0)} J   KE = ${f(ke,0)} J   total = ${f(tot,0)} J`,44,98,C.gold,14)};

// Air track glider: inverted-V rider over the beam with a flag and a spring bumper.
function glider(s,x,len,col,lab,bump=0){const y=.02,h=.3;for(const sg of[-1,1])s.poly([[x-len/2,y,sg*.02],[x+len/2,y,sg*.02],[x+len/2,y-h*.75,sg*.22],[x-len/2,y-h*.75,sg*.22]],col,{normal:[0,.7,sg*.7]});
  s.box([x,y+.05,0],[len,.08,.16],col);s.box([x,y+.25,0],[.05,.32,.02],'#212529');if(bump)s.ring([x+bump*len/2+bump*.06,y-.04,0],[0,0,1],.06,'#adb5bd',2);if(lab)s.label([x,y+.5,0],lab,C.white,12)}
R['collision']=(c,p,t)=>{const s=P3.scene(c,{scale:64,pitch:.2,yaw:.4,cy:240}),v1=(p.m1-p.m2)/(p.m1+p.m2)*p.u,v2=2*p.m1/(p.m1+p.m2)*p.u,tt=cycle(t,6),tc=2,k=.25,yb=-1.2;let x1,x2;if(tt<tc){x1=-2.8+(-.4-(-2.8))*tt/tc;x2=0}else{x1=-.4+v1*(tt-tc)*k;x2=v2*(tt-tc)*k}
  bench(s,-3.9,3.9,yb,-1,1);const x0=-3.6,x3=3.6;for(const sg of[-1,1]){s.poly([[x0,0,0],[x3,0,0],[x3,-.18,sg*.2],[x0,-.18,sg*.2]],AL,{normal:[0,.7,sg*.7],spec:.3});for(let i=0;i<36;i++)s.ball([x0+.1+i*.2,-.07,sg*.08],.012,'#495057',{flat:true})}
  s.box([0,-.25,0],[7.2,.12,.42],'#adb5bd');for(const x of[x0,x3])s.box([x,-.05,0],[.06,.3,.45],'#495057');for(const x of[-2.8,2.8]){s.cyl([x,(yb-.3)/2-.0,0],[0,1,0],.04,-.3-yb,'#5d646b');s.box([x,yb+.03,0],[.45,.06,.3],'#3c4248')}
  s.cyl([x0-.2,-.2,0],[1,0,0],.1,.4,'#343a40');s.label([x0-.2,-.48,0],'air in',C.muted,10);
  const w=m=>.5+m*.08,X1=clamp(x1,-3.3,3.3),X2=clamp(x2+.4,-3.3,3.3);glider(s,X1,w(p.m1),'#3b6fb6',`m₁ = ${p.m1} kg`,1);glider(s,X2,w(p.m2),'#d9822b',`m₂ = ${p.m2} kg`,-1);
  if(tt<tc)s.arrow([X1,.85,0],[X1+.2+p.u*.1,.85,0],C.gold,3,10,`u = ${p.u} m/s`);else{if(Math.abs(v1)>.05)s.arrow([X1,.75,0],[X1+v1*.1+Math.sign(v1)*.15,.75,0],C.blue,3,10,`v₁ = ${f(v1,2)} m/s`);s.arrow([X2,.75,0],[X2+v2*.1+.15,.75,0],C.gold,3,10,`v₂ = ${f(v2,2)} m/s`)}
  part(s,[-2,-.1,.1],'air track (perforated)',-20,60);part(s,[X1-w(p.m1)/2,-.05,.15],'glider',-50,-50);
  s.render();tag(c,`after: v₁ = ${f(v1,2)} m/s, v₂ = ${f(v2,2)} m/s`,44,98,C.gold,14)};

R['lifting-power']=(c,p,t)=>{const s=P3.scene(c,{scale:52,cy:285,yaw:.15}),y=-1.25+cycle(t*p.speed*.5,2.4),yb=-1.6,ang=-t*p.speed*4;
  bench(s,-3,3,yb,-1.1,1.1);for(const x of[-1.5,1.5]){s.box([x,(yb+2.1)/2,0],[.14,2.1-yb,.14],'#e8590c');s.box([x,yb+.04,0],[.5,.08,.5],'#3c4248')}s.box([0,2.15,0],[3.3,.18,.22],'#e8590c');
  // motor + gearbox + cable drum on the top beam
  s.cyl([-.65,2.5,0],[1,0,0],.26,.7,'#1c7ed6',{seg:22,cap:'#1864ab'});for(let i=0;i<7;i++)s.ring([-.92+i*.09,2.5,0],[1,0,0],.27,'#1864ab',1.4);s.box([-.15,2.45,0],[.3,.4,.4],'#495057');
  s.cyl([.5,2.5,0],[1,0,0],.2,.6,'#868e96',{seg:20});for(const x of[.18,.82])s.cyl([x,2.5,0],[1,0,0],.27,.04,'#5d646b',{seg:20});for(let i=0;i<6;i++){const a=ang+i*TAU/6;s.seg([.81,2.5+.2*Math.sin(a),.2*Math.cos(a)],[.81,2.5+.25*Math.sin(a),.25*Math.cos(a)],'#343a40',1.5)}
  for(let i=0;i<5;i++)s.ring([.24+i*.12,2.5,0],[1,0,0],.205,'#495057',1);s.box([.5,2.3,0],[.75,.08,.4],'#5d646b');
  const cx=.5,top=[cx,2.3,.2];s.seg(top,[cx,y+.75,.2],'#343a40',1.8);s.tube(arc([cx,y+.68,.2],.07,0,PI*1.6,10),.018,'#adb5bd',{segs:5});
  const sz=.55+p.mass*.004;s.box([cx,y+.62,.2],[.08,.1,.08],'#868e96');for(const sg of[-1,1])s.seg([cx,y+.62,.2],[cx+sg*sz*.45,y+.25+sz*.5-.05,.2],'#343a40',1.3);woodBlock(s,[cx,y+.25,.2],[sz,sz*.8,sz*.8],0,'#b5835a');for(const dx of[-.33,.33])s.box([cx+dx*sz,y+.25,.2+sz*.41],[.06,sz*.8,.01],'#7a5232');
  s.engrave([cx,y+.25,.2+sz*.42],p.mass+' kg','#2b1a0d',11);s.arrow([cx+sz/2+.35,y+.25,.2],[cx+sz/2+.35,y+.25+p.speed*.5,.2],C.mint,3,11,`v = ${p.speed} m/s`);s.arrow([cx-sz/2-.35,y+.25,.2],[cx-sz/2-.35,y-.25,.2],C.gold,2.5,10,`mg = ${f(p.mass*G,0)} N`);
  part(s,[-.65,2.76,0],'electric motor',-40,-20);part(s,[.5,2.72,0],'cable drum',40,-20);part(s,[-1.5,.6,0],'steel gantry',-40,20);
  s.render();tag(c,`P = mgv = ${f(p.mass*G*p.speed,0)} W`,44,98,C.gold,15)};

R['spring-launcher']=(c,p,t)=>{const s=P3.scene(c,{scale:66,cy:280,cx:330,yaw:.15}),x0=p.compression/100,v=x0*Math.sqrt(p.k/p.mass),tt=cycle(t,4),wall=-3,rest=-1.6,comp=rest-x0*3;let bx=tt<1?comp+(rest-comp)*tt:rest+v*(tt-1)*.6;bx=Math.min(bx,2.4);
  bench(s,-3.5,3.4,0,-.9,.9);for(const z of[-.2,.2])s.box([.1,.02,z],[6.4,.04,.05],'#adb5bd');s.box([wall-.08,.45,0],[.16,.9,.9],'#495057');for(const dy of[.15,.75])for(const dz of[-.3,.3])s.cyl([wall,dy,dz],[1,0,0],.04,.06,'#adb5bd');
  const e=Math.min(bx,rest)-.36;s.helix([(wall+e)/2,.32,0],[1,0,0],.13,e-wall,10+Math.round(p.k/20),'#adb5bd',2.6);s.box([e+.02,.32,0],[.04,.32,.32],'#868e96');
  trolley(s,[bx,.02,0],.7,'#2f9e44',{d:.5,wr:.09,h:.2});s.box([bx-.36,.25,0],[.03,.2,.3],'#343a40');s.label([bx,.65,0],p.mass+' kg',C.white,12);
  if(tt>1)s.arrow([bx+.4,.45,0],[bx+.6+v*.25,.45,0],C.gold,3,10,`v = ${f(v,2)} m/s`);else s.label([(wall+e)/2,.05,.6],`x = ${p.compression} cm`,C.mint,12);
  part(s,[(wall+e)/2,.45,.12],'steel compression spring',-10,-70);part(s,[wall,.85,-.3],'rigid wall plate',-50,-10);part(s,[bx+.2,.12,.27],'trolley',40,40);
  s.render();tag(c,`launch speed ${f(v,2)} m/s`,44,98,C.gold,15)};

R['work-angle']=(c,p,t)=>{const s=P3.scene(c,{scale:66,cy:290,cx:320,yaw:.15}),th=rad(p.angle),x=-2.6+cycle(t*.6,1)*Math.min(3,p.distance*.3),W=p.force*p.distance*Math.cos(th);
  bench(s,-3.4,3.6,0,-.9,.9);for(let i=0;i<=6;i++){s.seg([-2.6+i*.5,.003,.75],[-2.6+i*.5,.003,.88],'#f1f3f5',1.4)}s.path([[-2.6,.003,.8],[.4,.003,.8]],'#f1f3f5aa',1,[],-4e5);
  woodBlock(s,[x,.3,0],[.8,.6,.6]);const h=[x+.42,.3,0];eye(s,h,[0,1,0]);const dir=[Math.cos(th),Math.sin(th),0],b=V.add(h,V.mul(dir,1.25));springBalance(s,b,V.add(h,V.mul(dir,.04)),p.force,50);s.tube([b,V.add(b,V.mul(dir,.3))],.012,STR,{segs:5});
  s.path(arc(h,.45,0,th,16),'#ffffffaa',1.5);s.label(V.add(h,[.62*Math.cos(th/2),.62*Math.sin(th/2),0]),`θ = ${p.angle}°`,C.white,11);
  s.arrow(V.add(b,V.mul(dir,.35)),V.add(b,V.mul(dir,.45+p.force*.02)),C.gold,4,11,`F = ${p.force} N at ${p.angle}°`);s.arrow([x-.2,.03,.7],[x-.1+p.force*.025*Math.cos(th),.03,.7],C.mint,3,11,`F cosθ = ${f(p.force*Math.cos(th),1)} N`);
  part(s,[x-.3,.5,.3],'wooden block',-40,-60);part(s,V.add(h,V.mul(dir,.6)),'spring balance',80,20);
  s.render();tag(c,`W = ${f(W,1)} J`,44,98,C.gold,15)};

R['ballistic-pendulum']=(c,p,t)=>{const s=P3.scene(c,{scale:56,cy:245,yaw:.15}),V2=p.projectile*p.speed/(p.projectile+p.block),h=V2*V2/(2*G),L=2.4,thMax=Math.acos(clamp(1-h/L,-1,1)),tt=cycle(t,5),th=tt<1?0:thMax*Math.sin(Math.min(PI,(tt-1)*1.6)),py=1.9,bob=[L*Math.sin(th),py-L*Math.cos(th),0],yb=-1.4;
  bench(s,-3.8,2.6,yb,-1,1);for(const z of[-.55,.55]){for(const sg of[-1,1])s.tube([[sg*.9,yb,z],[0,py+.1,z]],.05,'#868e96',{segs:8});}s.cyl([0,py+.1,0],[0,0,1],.05,1.3,'#adb5bd');
  // block hung bifilar from four strings so it swings without turning
  const bw=.5+p.block*.06;for(const sx of[-.25,.25])for(const z of[-.25,.25]){const top=[sx,py+.08,z*1.7];s.seg(top,V.add(bob,[sx,.25,z]),STR,1.2)}woodBlock(s,bob,[bw,.5,.5],0);s.box(V.add(bob,[-bw/2-.005,0,0]),[.01,.3,.3],'#e9ecef');
  if(tt>=1)s.ball(V.add(bob,[-bw/2+.06,0,.0]),.04,'#b87333');s.path(arc([0,py,0],L,-PI/2-.02,-PI/2+thMax+.05,24).map(q=>[q[0],q[1]-.0,-.6]),'#ffffff55',1.2,[4,4]);
  // spring gun on its stand
  const gy=py-L;s.cyl([-3.05,gy,0],[1,0,0],.1,.9,'#495057',{seg:16});s.cyl([-2.55,gy,0],[1,0,0],.05,.2,'#2b3036');s.box([-3.1,(gy+yb)/2,0],[.1,gy-yb,.1],'#5d646b');s.box([-3.1,yb+.03,0],[.6,.06,.5],'#3c4248');s.box([-3.3,gy-.15,0],[.08,.18,.06],'#212529');
  if(tt<1){const bxp=-2.45+(-bw/2+2.45)*tt;s.ball([bxp,gy,0],.045,'#b87333',{glow:true});s.arrow([bxp,gy+.25,0],[bxp+.6,gy+.25,0],C.gold,2.5,10,`u = ${p.speed} m/s`)}
  s.seg([-.9,gy+h,.3],[1.6,gy+h,.3],C.mint,1.5,[4,4]);s.seg([-.9,gy,.3],[1.6,gy,.3],'#8ca6b9',1,[4,4]);s.label([1.7,gy+h/2,.3],`h = ${f(h*100,1)} cm`,C.mint,12,'left');
  part(s,[.9*.5,(yb+py)/2,-.55],'A-frame support',50,20);part(s,V.add(bob,[0,.25,.25]),'wooden block (bifilar strings)',40,-80);part(s,[-3.05,gy+.1,0],'spring gun',-20,-60);
  s.render();tag(c,`rises h = ${f(h*100,1)} cm`,44,98,C.gold,15)};

function circleTrack(p){const pts=[],dt=.004,R=p.R;let ph=0,om=p.u/R,taut=true,x=0,y=-R,vx=0,vy=0,t=0;
  while(t<12){if(taut){const T=om*om*R+G*Math.cos(ph);if(T<0&&Math.abs(ph)>.1){taut=false;x=R*Math.sin(ph);y=-R*Math.cos(ph);vx=R*om*Math.cos(ph);vy=R*om*Math.sin(ph)}else{om+=-(G/R)*Math.sin(ph)*dt;ph+=om*dt;pts.push([R*Math.sin(ph),-R*Math.cos(ph),1]);if(ph>TAU){ph-=TAU;if(t>1&&pts.length>10)break}}}
   if(!taut){vy-=G*dt;x+=vx*dt;y+=vy*dt;pts.push([x,y,0]);if(Math.hypot(x,y)>=R&&vy<0)break}t+=dt}
  return{pts,dt,T:pts.length*dt}}
R['vertical-circle']=(c,p,t)=>{const tr=memo('vc'+p.R+p.u,()=>circleTrack(p)),Rs=1.55,s=P3.scene(c,{scale:68,cy:240,yaw:.42}),yb=-2.05;
  bench(s,-2.6,2.6,yb,-1.1,1.1);s.box([0,yb+.05,-.5],[1.2,.1,.7],'#3c4248');s.box([0,(yb+.1)/2,-.5],[.16,-yb-.1,.16],'#5d646b');s.cyl([0,0,-.3],[0,0,1],.09,.4,'#adb5bd');s.cyl([0,0,-.08],[0,0,1],.05,.06,'#e9ecef');
  s.ring([0,0,0],[0,0,1],Rs,'#42d9ca55',1.5,[5,5]);
  const k=Math.floor(cycle(t,tr.T)/tr.dt),q=tr.pts[Math.min(k,tr.pts.length-1)],b=[q[0]*Rs/p.R,q[1]*Rs/p.R,0];
  if(q[2]){s.seg([0,0,-.05],b,STR,1.8);const v2=Math.max(0,p.u**2-2*G*(p.R+q[1])),T=p.m*(v2/p.R-G*q[1]/p.R),u=V.norm(V.mul(b,-1));s.arrow(V.add(b,V.mul(u,.2)),V.add(b,V.mul(u,.25+Math.min(1,Math.max(0,T)*.02))),C.mint,3,10,`T = ${f(Math.max(0,T),1)} N`)}else s.label([0,.35,0],'slack!',C.red,14);
  s.mesh(b,[.16,.14,.15],'#8a8174',{rings:8,segs:12,rot:[.4,.7,0],shape:(u,v)=>1+.08*Math.sin(3*v+u*2)});s.arrow(V.add(b,[0,-.18,.1]),V.add(b,[0,-.65,.1]),C.gold,2.5,10,`mg = ${f(p.m*G,1)} N`);s.shadow(b,.15,yb,.3);
  part(s,[0,0,-.1],'pivot bearing',-60,-60);part(s,b,'stone',50,-30);part(s,[0,-1.2,-.5],'support pillar',-60,30);s.render();
  tag(c,`critical speed √(5gR) = ${f(Math.sqrt(5*G*p.R),2)} m/s · u = ${p.u} m/s`,44,98,p.u>=Math.sqrt(5*G*p.R)?C.mint:C.gold,14)};

function collide(p){const al=Math.asin(p.b),un=p.u*Math.cos(al),ut=p.u*Math.sin(al),v1n=un*(1-p.e)/2,v2n=un*(1+p.e)/2;const v1=Math.hypot(v1n,ut),v2=v2n;
  const a2=deg(al),n=[Math.cos(al),Math.sin(al)],tv=[Math.sin(al),-Math.cos(al)],v1v=[v1n*n[0]+ut*tv[0],v1n*n[1]+ut*tv[1]],a1=deg(Math.atan2(v1v[1],v1v[0]));return{v1,v2,a1,a2,loss:1-(v1*v1+v2*v2)/(p.u*p.u)}}
R['oblique-collision']=(c,p,t)=>{const r=collide(p),s=P3.scene(c,{scale:54,cy:240,pitch:.3}),ty=-.6;
  s.box([0,ty-.05,0],[7,.1,4],'#1f7a4d',{ground:true});for(const z of[-2.1,2.1])s.box([0,ty+.1,z],[7.4,.24,.2],'#5a3a22');for(const x of[-3.6,3.6])s.box([x,ty+.1,0],[.2,.24,4.4],'#5a3a22');
  for(const z of[-1.98,1.98])s.box([0,ty+.06,z],[6.8,.1,.06],'#17603b');for(const x of[-3.48,3.48])s.box([x,ty+.06,0],[.06,.1,3.8],'#17603b');
  for(const x of[-3.5,0,3.5])for(const z of[-2,2])s.cyl([x,ty+.005,z*.97],[0,1,0],.17,.02,'#0b0d0f');for(const x of[-2.6,-1.75,-.9,.9,1.75,2.6])s.ball([x,ty+.23,2.1],.03,'#f1f3f5',{flat:true});
  const tt=cycle(t,4),hitT=1.4,r0=.18,al=Math.asin(p.b),by=ty+r0,pos2=[0,by,0],start=[-2.6,by,-2*r0*p.b],c1=[-2*r0*Math.cos(al),by,start[2]];let b1,b2;
  if(tt<hitT){b1=[start[0]+(c1[0]-start[0])*tt/hitT,by,start[2]];b2=pos2}else{const d=(tt-hitT)*.55;b1=[c1[0]+r.v1*Math.cos(rad(r.a1))*d,by,c1[2]+r.v1*Math.sin(rad(r.a1))*d];b2=[r.v2*Math.cos(rad(r.a2))*d,by,r.v2*Math.sin(rad(r.a2))*d]}
  const Lp=1.5;s.seg([start[0],ty+.01,start[2]],[c1[0],ty+.01,c1[2]],'#ffffff55',1.2,[5,4]);s.seg([c1[0],ty+.01,c1[2]],[c1[0]+Lp*Math.cos(rad(r.a1)),ty+.01,c1[2]+Lp*Math.sin(rad(r.a1))],'#e9f6ff88',1.2,[5,4]);s.seg([0,ty+.01,0],[Lp*Math.cos(rad(r.a2)),ty+.01,Lp*Math.sin(rad(r.a2))],'#ff8787aa',1.2,[5,4]);
  s.ball(b1,r0,'#f4f4ee');s.ball(b2,r0,'#d23b3b');s.shadow(b1,r0,ty,.4);s.shadow(b2,r0,ty,.4);
  if(tt<hitT)s.arrow(V.add(b1,[0,.3,0]),V.add(b1,[.25+p.u*.12,.3,0]),C.gold,3,10,`u = ${p.u} m/s`);else{if(r.v1>.05)s.arrow(V.add(b1,[0,.3,0]),V.add(b1,[r.v1*.15*Math.cos(rad(r.a1))+.1,.3,r.v1*.15*Math.sin(rad(r.a1))]),C.white,2.5,10,`v₁ = ${f(r.v1,2)} m/s`);s.arrow(V.add(b2,[0,.3,0]),V.add(b2,[r.v2*.15*Math.cos(rad(r.a2))+.1,.3,r.v2*.15*Math.sin(rad(r.a2))]),C.red,2.5,10,`v₂ = ${f(r.v2,2)} m/s`)}
  part(s,[-2.6,ty+.1,-1.95],'cushion',-30,-40);part(s,[3.5,ty,1.95],'pocket',30,30);part(s,[1.5,ty,-1],'baize (felt) on slate',40,-60);
  s.render();tag(c,`angle between paths = ${f(Math.abs(r.a1-r.a2),1)}°`,44,98,C.gold,14)};

R['variable-force-work']=(c,p,t)=>{const a=Math.min(p.x1,p.x2),b=Math.max(p.x1,p.x2),x=a+(b-a)*(.5-.5*Math.cos(t*1.4)),F=p.F0+p.k*x,s=P3.scene(c,{scale:58,cy:300,cx:290,pitch:.2}),X=v=>-2.8+v*1.3,yb=-.6;
  bench(s,-3.6,2.6,yb-.06,-.9,.9);s.box([-.2,yb-.02,0],[5.8,.04,.7],AL);for(const z of[-.37,.37])s.box([-.2,yb+.04,z],[5.8,.1,.04],'#adb5bd');
  for(let i=0;i<=40;i++){const xx=X(i/10);s.seg([xx,yb+.002,.33],[xx,yb+.002,.33-(i%10===0?.14:i%5===0?.09:.05)],'#212529',1)}for(let i=0;i<=4;i++)s.label([X(i),yb,.62],i+' m',C.muted,11);
  s.seg([X(a),yb+.01,0],[X(a),yb+.01,.3],C.mint,2);s.seg([X(b),yb+.01,0],[X(b),yb+.01,.3],C.mint,2);
  woodBlock(s,[X(x),yb+.27,0],[.5,.5,.5]);const hp=[X(x)-.27,yb+.27,0];s.box(V.add(hp,[-.03,0,0]),[.04,.3,.3],'#868e96');s.cyl(V.add(hp,[-.25,0,0]),[1,0,0],.03,.4,CHROME);s.box(V.add(hp,[-.5,0,0]),[.1,.18,.18],'#495057');
  s.arrow([X(x)-.3-F*.04,yb+.75,0],[X(x)-.27,yb+.75,0],C.gold,3,11,`F = ${f(F,1)} N`);
  part(s,[-2.4,yb+.05,.37],'aluminium track with metre scale',-20,-110);part(s,V.add(hp,[-.5,.09,0]),'pusher',-40,-50);s.render();
  chart(c,410,92,246,160,{title:'F–x graph (shaded = W)',xl:'x (m)',xmin:0,xmax:4,ymin:0,ymax:p.F0+p.k*4+1,series:[{fn:X=>p.F0+p.k*X,col:C.gold},{pts:[[a,0],[a,p.F0+p.k*a],[b,p.F0+p.k*b],[b,0]],col:C.mint,dash:[3,3]}],marker:[x,F]})};

/* ================= System of Particles and Rotational Motion ================= */
// Flat ring (annulus) facing ±z at depth c[2]+dz.
function annulus(s,c,r0,r1,dz,sg,col,N=32){for(let i=0;i<N;i++){const a1=TAU*i/N,a2=TAU*(i+1)/N,z=c[2]+dz,q=(rr,aa)=>[c[0]+rr*Math.cos(aa),c[1]+rr*Math.sin(aa),z];s.poly([q(r0,a1),q(r1,a1),q(r1,a2),q(r0,a2)],col,{cull:true,normal:[0,0,sg]})}}
// Spoked wheel with a rubber tyre, turning about z by ang.
function wheel(s,c,Rw,ang,o={}){const w=o.w||.16,ax=[0,0,1];s.cyl(c,ax,Rw,w,RUB,{caps:false,seg:40});for(const sg of[1,-1]){annulus(s,c,Rw*.82,Rw,sg*w/2,sg,'#2b2d31',36);annulus(s,c,Rw*.74,Rw*.82,sg*w*.35,sg,'#c3c9cf',36)}
  for(let i=0;i<16;i++){const a=ang+TAU*i/16,sg=i%2?1:-1;s.seg(V.add(c,[.07*Math.cos(a),.07*Math.sin(a),sg*w*.3]),V.add(c,[Rw*.75*Math.cos(a+sg*.08),Rw*.75*Math.sin(a+sg*.08),0]),'#dee2e6',1.2)}
  s.cyl(c,ax,Rw*.1,w*1.1,'#868e96');s.cyl(c,ax,Rw*.04,w*1.6,IRON);s.ball(V.add(c,[Rw*.78*Math.cos(ang),Rw*.78*Math.sin(ang),w/2]),.035,'#e03131',{flat:true})}

R['rotation']=(c,p,t)=>{const s=P3.scene(c,{scale:60,pitch:.25,cy:250}),al=p.force*p.radius/p.inertia,tt=cycle(t,5),ang=.5*al*tt*tt*.5,Rd=1.85,yb=-1.3,rv=.3+p.radius*1.0;
  bench(s,-2.8,2.8,yb,-2.2,2.2);for(let i=0;i<3;i++){const a=TAU*i/3+1.2;s.tube([[0,-.35,0],[1.1*Math.cos(a),yb,1.1*Math.sin(a)]],.05,'#495057',{segs:8});s.cyl([1.1*Math.cos(a),yb+.03,1.1*Math.sin(a)],[0,1,0],.1,.06,RUB)}
  s.cyl([0,-.25,0],[0,1,0],.18,.35,'#3c4248',{cap:'#5d646b'});s.cyl([0,0,0],[0,1,0],Rd,.14,'#9aa1a8',{seg:48,cap:'#c3c9cf'});s.cyl([0,.12,0],[0,1,0],.12,.12,'#5d646b');
  for(let k=1;k<=4;k++)s.ring([0,.072,0],[0,1,0],k*.5,'#6c737a',1);for(let i=0;i<12;i++){const a=ang+TAU*i/12;s.seg([.25*Math.cos(a),.073,.25*Math.sin(a)],[(Rd-.05)*Math.cos(a),.073,(Rd-.05)*Math.sin(a)],i===0?'#e03131':'#6c737a',i===0?2.5:1)}
  const pt=[rv*Math.cos(ang),.07,rv*Math.sin(ang)];s.cyl(V.add(pt,[0,.15,0]),[0,1,0],.045,.3,BRASS,{seg:12});const pf=V.add(pt,[0,.25,0]);
  s.arrow(pf,V.add(pf,V.mul([-Math.sin(ang),0,Math.cos(ang)],.3+p.force*.06)),C.gold,4,11,`F = ${p.force} N`);s.seg([0,.25,0],pf,C.mint,1.8,[4,4]);s.label(V.add(V.mul(pf,.5),[0,.18,0]),`r = ${p.radius} m`,C.mint,12);
  part(s,[-Rd*.98,.0,0],'steel turntable (graduated)',-30,-60);part(s,[0,-.42,.18],'bearing on tripod',-80,70);part(s,V.add(pt,[0,.3,0]),'brass peg',40,-40);
  s.render();tag(c,`α = rF/I = ${f(al,2)} rad/s²`,44,98,C.gold,15)};

R['rolling']=(c,p,t)=>{const s=P3.scene(c,{scale:60,pitch:.15,yaw:.35,cy:285,cx:330}),Rw=.3+p.radius*1.2,x=-3+cycle(t*p.speed*.4,6),ang=-(x+3)/Rw;
  bench(s,-3.7,3.7,0,-.9,.9);wheel(s,[x,Rw,0],Rw,ang-PI/2);s.cyl([x,Rw,0],[0,0,1],.03,.5,CHROME);
  const tr=[];for(let i=0;i<=60;i++){const xx=-3+(x+3)*i/60,a=(xx+3)/Rw;tr.push([xx-Rw*.78*Math.sin(a),Rw-Rw*.78*Math.cos(a),.09])}s.path(tr,C.gold,2);
  s.arrow([x,2*Rw+.08,.12],[x+.25+p.speed*.25,2*Rw+.08,.12],C.mint,3,11,`top: 2v = ${f(2*p.speed,1)} m/s`);s.arrow([x,Rw,.15],[x+.12+p.speed*.125,Rw,.15],C.blue,3,10,`v = ${p.speed} m/s`);s.ball([x,.01,.1],.05,C.red,{flat:true});s.label([x,-.25,.5],'contact point: v = 0',C.red,11);
  part(s,[x-Rw*.75,Rw*.4,.08],'rubber tyre',-40,50);part(s,[x,Rw,.1],'hub',-50,-70);
  s.render();tag(c,'gold: path of a rim point (cycloid) · contact point at rest',44,98,C.muted,13)};

R['angular-momentum']=(c,p,t)=>{const s=P3.scene(c,{scale:58,pitch:.35,cy:275}),w=p.omega*(p.initialRadius/p.radius)**2,a=t*Math.min(6,w),r=.4+p.radius*1.05,ri=.4+p.initialRadius*1.05,yb=-1.3,h=.6;
  bench(s,-3,3,yb,-2,2);s.cyl([0,yb+.06,0],[0,1,0],.7,.12,'#3c4248',{seg:28});s.cyl([0,(yb+h)/2,0],[0,1,0],.07,h-yb,CHROME);s.cyl([0,yb+.35,0],[0,1,0],.16,.25,'#5d646b');
  const u=[Math.cos(a),0,Math.sin(a)];s.cyl([0,h,0],u,.025,2*(.4+2*1.05)+.4,'#adb5bd');s.cyl([0,h,0],[0,1,0],.1,.14,'#495057');
  for(const sg of[-1,1]){const q=V.add([0,h,0],V.mul(u,sg*r)),mr=.12+p.mass*.03;s.cyl(q,u,mr,.28,'#868e96',{seg:18,cap:'#ced4da'});s.seg([0,h+.04,0],V.add(q,[0,.04,0]),STR,1.2)}
  s.seg([0,h,0],[0,yb+.6,0],STR,1.2);s.tube(arc([0,yb+.45,0],.12,PI/2,PI*1.6,8).map(q=>[q[0]+.12,q[1],q[2]]),.015,STR,{segs:4});
  s.ring([0,h,0],[0,1,0],ri,'#42d9ca66',1.2,[4,4]);s.ring([0,h,0],[0,1,0],r,'#ffc36b88',1.2,[4,4]);
  const L=2*p.mass*p.initialRadius**2*p.omega;s.arrow([0,h+.15,0],[0,h+.6+L*.03,0],C.mint,3,10,`L = ${f(L,2)} kg·m²/s`);s.path(arc([0,0,0],.35,0,PI*1.5,16).map(q=>[q[0],h+.32,q[1]]),C.gold,2);
  part(s,[2.2*Math.cos(a+.3)*0,h,0],'rotating shaft',-60,-40);part(s,V.add([0,h,0],V.mul(u,r)),'sliding masses',50,-40);part(s,[0,yb+.45,0],'pull string (through axis)',60,30);
  s.render();tag(c,`ω = ${f(w,2)} rad/s`,44,98,C.gold,15)};

R['rod-pendulum']=(c,p,t)=>{const s=P3.scene(c,{scale:64,cy:250,yaw:.45,pitch:-.1}),T=2*PI*Math.sqrt(2*p.length/(3*G)),th=rad(p.angle)*Math.cos(TAU*t/T),L=.8+p.length*1.1,piv=[0,1.2,0];
  s.box([0,1.2,-.55],[2.6,.8,.12],'#c9b79c');for(const x of[-1.1,1.1])s.ball([x,1.45,-.48],.04,'#868e96',{flat:true});s.box([0,1.28,-.3],[.34,.14,.5],'#5d646b');s.poly([[-.12,1.19,-.05],[.12,1.19,-.05],[0,1.21,.15]],'#adb5bd',{});
  s.path(arc(piv,L+.15,-PI/2-rad(p.angle),-PI/2+rad(p.angle),20).map(q=>[q[0],q[1],-.4]),'#ffffff66',1.2,[4,4]);
  const d=[Math.sin(th),-Math.cos(th),0],rw=.1+p.mass*.02;s.box(V.add(piv,V.mul(d,L/2-.06)),[rw,L,.05],'#d9a066',{rotZ:th});s.cyl(piv,[0,0,1],.05,.3,CHROME);
  const n=Math.round(L/.1);for(let i=1;i<n;i++){const q=V.add(piv,V.mul(d,i*.1)),side=[Math.cos(th),Math.sin(th),0];s.seg(V.add(q,[0,0,.03]),V.add(V.add(q,V.mul(side,i%5===0?rw*.45:rw*.25)),[0,0,.03]),'#3b2614',1)}
  const cm=V.add(piv,V.mul(d,L/2)),co=V.add(piv,V.mul(d,L*2/3));s.ball(V.add(cm,[0,0,.04]),.05,C.blue,{flat:true,lift:1});s.ball(V.add(co,[0,0,.04]),.06,C.red,{flat:true,lift:1});s.label(V.add(co,[.3,-.1,0]),'centre of oscillation',C.red,11,'left');s.label(V.add(cm,[.35,0,0]),'CM (L/2)',C.blue,11,'left');
  s.arrow(V.add(cm,[-.2,0,.1]),V.add(cm,[-.2,-.5-p.mass*.08,.1]),C.gold,2.5,10,`mg = ${f(p.mass*G,1)} N`);
  part(s,[0,1.25,.1],'knife-edge pivot',70,-20);part(s,V.add(piv,V.mul(d,.45)),'graduated wooden rod',-70,10);part(s,[-1,1.0,-.5],'wall bracket plate',-40,10);
  s.render();tag(c,`T = 2π√(2L/3g) = ${f(T,2)} s`,44,98,C.gold,15)};

R['inertia-shapes']=(c,p,t)=>{const s=P3.scene(c,{scale:54,pitch:.15,yaw:.55,cy:270}),Rr=.32+p.radius*.32,a=t*1.2,yb=-1.35,shapes=[['ring',1],['disc',.5],['solid sphere',.4],['hollow sphere',2/3]];
  bench(s,-3.6,3.6,yb,-.9,.9);shapes.forEach(([n,k],i)=>{const x=-2.55+i*1.7,ctr=[x,.0,0];s.cyl([x,yb+.04,0],[0,1,0],.32,.08,'#3c4248',{seg:20});s.cyl([x,(yb+ctr[1])/2,0],[0,1,0],.03,ctr[1]-yb,CHROME,{seg:10});
    if(n==='ring'){s.tube(arc([0,0,0],Rr,0,TAU,40).map(q=>[x+q[0],0,q[1]]),.05,'#adb5bd',{segs:8});for(let j=0;j<3;j++){const q=a+TAU*j/3;s.seg(ctr,[x+Rr*Math.cos(q),0,Rr*Math.sin(q)],'#868e96',1.2)}}
    else if(n==='disc'){s.cyl(ctr,[0,1,0],Rr,.1,BRASS,{seg:36,cap:'#d6b45e'});s.seg([x,.052,0],[x+Rr*.95*Math.cos(a),.052,Rr*.95*Math.sin(a)],'#5c4a1a',2)}
    else if(n==='solid sphere'){s.ball([x,Rr*.8,0],Rr*.8,'#9aa1a8');s.ring([x,Rr*.8,0],[0,1,0],Rr*.8,'#5d646b',1)}
    else{s.ball([x,Rr*.8,0],Rr*.8,'#e9ecef',{alpha:.35});s.ring([x,Rr*.8,0],[0,1,0],Rr*.8,'#adb5bd',2);s.path(arc([0,0,0],Rr*.8,0,PI,16).map(q=>[x+q[0],Rr*.8+q[1],0]),'#ced4da',1.5)}
    s.seg([x,ctr[1]-.05,0],[x,1.05,0],'#ff857e88',1.2,[3,3]);s.label([x,1.5,0],n,C.white,12);s.label([x,1.22,0],`${f(k,2)} mR²`,C.gold,11);s.label([x,yb-.25,.8],`I = ${f(k*p.mass*p.radius**2,2)} kg·m²`,C.gold,11)});
  part(s,[-2.55,yb+.5,0],'spindle stand',-30,-10);s.render();tag(c,`Same mass ${p.mass} kg and radius ${p.radius} m — mass farther out ⇒ larger I`,44,98,C.muted,13)};

R['parallel-axis']=(c,p,t)=>{const s=P3.scene(c,{scale:56,pitch:.35,cy:270}),Rd=.4+p.radius*1.4,d=p.offset*1.4,a=t*.8,yb=-1.3,h=.2;
  bench(s,-2.7,2.7,yb,-1.8,1.8);s.cyl([0,yb+.08,0],[0,1,0],.5,.16,'#3c4248',{seg:24});s.cyl([0,(yb+h+.5)/2,0],[0,1,0],.05,h+.5-yb,'#c92a2a');s.cyl([0,yb+.25,0],[0,1,0],.14,.2,'#5d646b');
  const ctr=[d*Math.cos(a),h,d*Math.sin(a)];s.cyl(ctr,[0,1,0],Rd,.1,'#9aa1a8',{seg:40,cap:'#c3c9cf'});s.cyl([0,h,0],[0,1,0],.09,.14,'#495057');for(let i=0;i<8;i++){const q=a+TAU*i/8;s.seg(V.add(ctr,[.08*Math.cos(q),.052,.08*Math.sin(q)]),V.add(ctr,[Rd*.92*Math.cos(q),.052,Rd*.92*Math.sin(q)]),'#868e96',1)}
  s.ball(V.add(ctr,[0,.06,0]),.05,C.white,{flat:true,lift:2});s.seg([0,h+.06,0],[0,h+.6,0],'#c92a2a',6,[],1e5);s.ball([0,h+.6,0],.04,'#e03131',{flat:true,lift:1e5});s.seg([0,h+.07,0],V.add(ctr,[0,.07,0]),C.gold,2,[4,4]);s.label(V.add(V.mul(ctr,.5),[0,.42,0]),`d = ${p.offset} m`,C.gold,13);s.ring([0,h,0],[0,1,0],Math.max(.01,d),'#ffc36b44',1,[4,4]);
  const I=p.mass*(.5*p.radius**2+p.offset**2);part(s,[0,h+.5,0],'rotation axis (axle)',-50,-50);part(s,V.add(ctr,[Rd*.7,0,Rd*.7]),'uniform steel disc',50,30);part(s,V.add(ctr,[0,.06,0]),'centre C',50,-40);
  s.render();tag(c,`I = ½mR² + md² = ${f(I,3)} kg·m²  (red: rotation axis · gold: offset d)`,44,98,C.gold,13)};

R['rolling-race']=(c,p,t)=>{const th=rad(p.th),s=P3.scene(c,{scale:50,cy:268,yaw:.25,pitch:.2}),L=6,dir=[Math.cos(th),-Math.sin(th),0],nrm=[Math.sin(th),Math.cos(th),0],o=[-3,1.6*Math.min(1,Math.sin(th)*2.6),0],yb=o[1]-L*Math.sin(th)-.08;
  bench(s,-3.6,3.9,yb,-2,2);s.box(V.add(o,V.add(V.mul(dir,L/2),V.mul(nrm,-.06))),[L,.12,3.4],WOOD,{rotZ:-th});for(let i=0;i<5;i++)s.box(V.add(o,V.add(V.mul(dir,L/2),[0,0,-1.6+i*.8])).map((v,k)=>k===1?v+.03:v),[L,.06,.04],'#5c3a1e',{rotZ:-th});
  const bot=V.add(o,V.mul(dir,L));
  for(const z of[-1.6,1.6]){s.cyl([o[0]+.05,(o[1]+yb)/2,z],[0,1,0],.04,o[1]-yb,'#5d646b')}s.box(V.add(o,V.add(V.mul(dir,.05),V.mul(nrm,.18))),[.05,.3,3.4],'#e03131',{rotZ:-th});
  for(let k=0;k<8;k++)s.box(V.add(bot,V.add(V.mul(dir,-.1),[0,.01,-1.5+k*3/7*1])),[.12,.02,.4],k%2?'#f8f9fa':'#212529',{rotZ:-th});
  const shapes=[[.4,'#adb5bd','solid sphere'],[.5,BRASS,'disc'],[2/3,'#e9ecef','hollow sphere'],[1,'#868e96','ring']],tmax=Math.sqrt(2*p.L*2/(G*Math.sin(th)))+1,tt=cycle(t,tmax),rr=.25;
  shapes.forEach(([b,col,kind],i)=>{const a=G*Math.sin(th)/(1+b),d=Math.min(1,.5*a*tt*tt/p.L),z=-1.2+i*.8,cpos=V.add(V.add(o,V.mul(dir,.3+d*(L-.6))),[nrm[0]*rr,nrm[1]*rr,z]),ang=-d*(L-.6)/rr;
    if(kind==='disc'){s.cyl(cpos,[0,0,1],rr,.14,col,{seg:28,cap:'#d6b45e'});s.seg(V.add(cpos,[0,0,.072]),V.add(cpos,[rr*.9*Math.cos(ang),rr*.9*Math.sin(ang),.072]),'#5c4a1a',2)}
    else if(kind==='ring'){s.tube(arc(cpos,rr-.03,0,TAU,32),.03,col,{segs:8});s.ball(V.add(cpos,[(rr-.03)*Math.cos(ang),(rr-.03)*Math.sin(ang),.03]),.03,'#e03131',{flat:true})}
    else{s.ball(cpos,rr,col,kind==='hollow sphere'?{stroke:'#868e96'}:{});s.ball(V.add(cpos,[rr*.6*Math.cos(ang),rr*.6*Math.sin(ang),rr*.75]),.03,kind==='hollow sphere'?'#4dabf7':'#e03131',{flat:true})}
    s.label(V.add(bot,[.25,.15,z]),kind,col===IRON?C.white:col,11,'left')});
  part(s,V.add(o,V.add(V.mul(dir,.05),V.mul(nrm,.3))),'release gate',-40,-30);part(s,V.add(bot,[-.1,.02,1.6]),'finish line',30,40);
  s.render();tag(c,'Solid sphere (I = ⅖mR²) wins; the ring (I = mR²) is last',44,98,C.gold,14)};

function cm3(p){const M=p.m1+p.m2+p.m3,pts=[[-2,0,-1],[2,0,-1],[0,0,1.8]];return[0,1,2].map(k=>(p.m1*pts[0][k]+p.m2*pts[1][k]+p.m3*pts[2][k])/M)}
R['centre-of-mass-3d']=(c,p,t)=>{const r=cm3(p),s=P3.scene(c,{scale:62,cy:265}),pts=[[-2,0,-1],[2,0,-1],[0,0,1.8]],py=-.1,yb=-1.3;
  bench(s,-3,3,yb,-1.8,2.4);const top=pts.map(q=>[q[0],py,q[2]]),bot=pts.map(q=>[q[0],py-.05,q[2]]);for(let i=0;i<3;i++){const j=(i+1)%3;s.poly([top[i],top[j],bot[j],bot[i]],'#adb5bd',{})}s.poly(top,'#ced4da',{normal:[0,1,0],stroke:'#868e96',spec:.3});
  [p.m1,p.m2,p.m3].forEach((m,i)=>{const h=.12+.07*m**.6,rr=.13+.04*Math.cbrt(m),q=[pts[i][0],py+h/2,pts[i][2]];s.cyl(q,[0,1,0],rr,h,BRASS,{seg:20,cap:'#d6b45e'});s.cyl(V.add(q,[0,h/2+.04,0]),[0,1,0],.04,.08,'#a07c2c');s.label(V.add(q,[0,h/2+.32,0]),'ABC'[i]+' '+m+' kg',['#ff857e','#ffc36b','#42d9ca'][i],12)});
  s.box([r[0],yb+.04,r[2]],[.6,.08,.6],'#3c4248');s.cyl([r[0],(yb+py-.15)/2+.02,r[2]],[0,1,0],.035,py-.15-yb,CHROME,{seg:10});s.lathe([r[0],py-.2,r[2]],[[.035,0],[.0,.15]],'#868e96',{segs:10});
  s.ball([r[0],py+.02,r[2]],.07,C.purple,{glow:true,flat:true});s.label([r[0],py+.5,r[2]],'CM',C.purple,14);s.seg([r[0],py+.01,r[2]],[r[0],py+.38,r[2]],C.purple,1.4,[3,3]);
  part(s,[1.3,py,-.5],'aluminium triangular plate',40,70);part(s,[r[0],(yb+py)/2,r[2]],'pin support',60,40);
  s.render();tag(c,`r_cm = (${f(r[0],2)}, ${f(r[2],2)}) m — the plate balances on the pin`,44,98,C.gold,14)};

R['topple-or-slide']=(c,p,t)=>{const m=10,Fs=p.mu*m*G,Ft=m*G*p.b/2/(p.hf*p.H),tips=Ft<Fs,ph=cycle(t,4),k=1.5,s=P3.scene(c,{scale:62,cy:272,yaw:.2}),yb=-1.4;
  bench(s,-3.4,3.4,yb,-1,1);const W=p.b*k,H=p.H*k,prog=clamp((ph-1)/2,0,1);let ang=0,dx=0;if(tips)ang=-prog*Math.min(PI/2,.25+Math.atan2(W,H));else dx=prog*1.6;
  const pivot=[W/2+dx,yb,0],ctr=[dx,yb+H/2,0],rel=V.sub(ctr,pivot),rot=[rel[0]*Math.cos(ang)-rel[1]*Math.sin(ang),rel[0]*Math.sin(ang)+rel[1]*Math.cos(ang),0];woodBlock(s,V.add(pivot,rot),[W,H,.7],ang);
  s.seg([pivot[0],yb+.01,-.36],[pivot[0],yb+.01,.36],'#ff6b6b',3);
  const hp=V.add(pivot,rz([-W,p.hf*H,0],ang)),F=Math.min(Fs,Ft)*Math.min(1,ph/1),ln=.25+F*.012;s.cyl(V.add(hp,[-.04,0,0]),[1,0,0],.05,.08,'#212529');s.cyl(V.add(hp,[-.5,0,0]),[1,0,0],.03,.8,CHROME);s.box(V.add(hp,[-1,0,0]),[.24,.16,.16],'#1c7ed6');s.engrave(V.add(hp,[-1,0,.085]),f(F,0)+' N','#e9f6ff',9);
  s.arrow([hp[0]-.2-ln,hp[1]+.25,.3],[hp[0]-.05,hp[1]+.25,.3],C.gold,3,11,`F = ${f(F,1)} N`);s.arrow(V.add(V.add(pivot,rot),[0,0,.4]),V.add(V.add(pivot,rot),[0,-.6,.4]),C.mint,2.5,10,'mg');
  part(s,[pivot[0],yb,.3],'tipping edge',40,40);part(s,V.add(hp,[-1,.08,0]),'force probe',-30,-50);part(s,V.add(pivot,V.add(rot,[0,H*.3,.35])),'wooden block',50,-40);
  s.render();tag(c,tips?'Tips over its front edge':'Slides along the floor',44,98,tips?C.red:C.mint,16)};

})();
