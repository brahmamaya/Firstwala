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
function hanger(s,top,m,disc=.5,col=BRASS){const n=Math.max(1,Math.round(m/disc)),th=Math.min(.06,.9/n),r=.17,Lr=.12+n*th+.06,bot=V.add(top,[0,-Lr,0]);
  s.tube(arc(V.add(top,[0,-.05,0]),.05,-PI/2,PI*.9,10),.012,'#aeb5bc',{segs:5});s.cyl(V.add(top,[0,-.1-(Lr-.1)/2,0]),[0,1,0],.016,Lr-.1,CHROME,{seg:8});
  s.cyl(V.add(bot,[0,.02,0]),[0,1,0],r*1.02,.04,'#6f777f',{seg:20});for(let i=0;i<n;i++)s.cyl(V.add(bot,[0,.04+th*(i+.5),0]),[0,1,0],r,th*.9,col,{seg:20,cap:'#d6b45e'});
  const ty=bot[1]+.04+th*n+.002;s.seg([bot[0],ty,bot[2]],[bot[0],ty,bot[2]+r],'#3a2d0f',2);return bot}
// Laboratory trolley: body, rubber wheels with steel hubs. p = ground point under its centre.
function trolley(s,p,L,col,o={}){const h=o.h||.22,d=o.d||.55,wr=o.wr||.11,a=o.a||0,q=v=>at(p,a,v);s.box(q([0,wr+h/2+.02,0]),[L,h,d],col,{rotZ:a});s.box(q([0,wr+h+.03,0]),[L*.96,.03,d*.96],'#2b2f33',{rotZ:a});
  for(const dx of[-L*.32,L*.32])for(const dz of[-d/2-.03,d/2+.03]){s.cyl(q([dx,wr,dz]),[0,0,1],wr,.06,RUB,{seg:18});s.cyl(q([dx,wr,dz+Math.sign(dz)*.032]),[0,0,1],wr*.45,.01,CHROME,{seg:12})}}
// Quadrant protractor in the plane z = o[2], showing angle th (rad) from the +x direction.
function protractor(s,o,r,th,lab){const pts=arc(o,r,0,PI/2,30);s.poly([o,...pts],'#e9f6ff',{alpha:.16,normal:[0,0,1]});s.path(pts,'#e9f6ffaa',1.4);
  for(let dg=0;dg<=90;dg+=5){const a=rad(dg),L=dg%10===0?.12:.07;s.seg([o[0]+r*Math.cos(a),o[1]+r*Math.sin(a),o[2]],[o[0]+(r-L)*Math.cos(a),o[1]+(r-L)*Math.sin(a),o[2]],'#e9f6ffcc',1);if(dg%30===0&&dg>0&&dg<90)s.label([o[0]+(r+.13)*Math.cos(a),o[1]+(r+.13)*Math.sin(a),o[2]],dg+'°','#cfe3ef',10)}
  s.path(arc(o,r*.55,0,th,20),C.gold,2.4);if(lab)s.label([o[0]+r*.72*Math.cos(th/2),o[1]+r*.72*Math.sin(th/2),o[2]],lab,C.gold,12)}
// A short string/rope.
const string=(s,a,b,col=STR,w=1.6)=>s.seg(a,b,col,w);

/* ================= Laws of Motion ================= */
R['forces']=(c,p,t)=>{const s=P3.scene(c,{scale:54,cy:300,yaw:.15}),fr=p.friction*p.mass*G,a=p.force>fr?(p.force-fr)/p.mass:0,tt=cycle(t,4),x=clamp(-2+.5*a*tt*tt*.25,-2,1.2),sz=.5+p.mass*.04,w=sz*1.3;
  bench(s,-4,4,0);woodBlock(s,[x,sz/2,0],[w,sz,sz]);const e=[x+w/2+.05,sz/2,0];eye(s,e,[0,1,0]);const b=[e[0]+1.5,sz/2,0];springBalance(s,b,V.add(e,[.04,0,0]),p.force,100);
  s.tube([b,V.add(b,[.35,0,0])],.012,STR,{segs:5});s.arrow(V.add(b,[.4,0,0]),V.add(b,[.5+p.force*.025,0,0]),C.gold,4,11,`F = ${p.force} N`);
  if(p.friction>0)s.arrow([x-w*.2,.03,sz/2+.06],[x-w*.2-.15-Math.min(p.force,fr)*.025,.03,sz/2+.06],C.red,3,11,`f = ${f(Math.min(p.force,fr),1)} N`);
  s.arrow([x,sz+.05,0],[x,sz+.05+p.mass*G*.012,0],C.mint,3,11,`N = ${f(p.mass*G,1)} N`);
  part(s,[x-w/2+.05,sz*.8,sz/2],'wooden block',-50,-50);part(s,V.add(b,[-.6,.08,.05]),'spring balance (0–100 N)',10,-70);part(s,[-3,0,.6],'rough bench top',-10,40);
  s.render();tag(c,a>0?'Net force → block accelerates':'Static friction balances the push',44,98,a>0?C.gold:C.mint,14)};

R['inclined-plane']=(c,p,t)=>{const s=P3.scene(c,{scale:54,cy:318,yaw:.12}),th=rad(p.angle),slide=Math.tan(th)>p.mu,a=slide?G*(Math.sin(th)-p.mu*Math.cos(th)):0,L=4.4,o=[-2.3,-1.3,0],dir=[Math.cos(th),Math.sin(th),0],nrm=[-Math.sin(th),Math.cos(th),0],u=clamp(.85-(slide?.5*a*cycle(t,2.5)**2*.08:0),.12,.85);
  bench(s,-3.9,3.4,o[1]-.04);s.box([o[0]+L*Math.cos(th)/2+.1,o[1]+.0,0],[L*Math.cos(th)+.6,.08,1.5],WOOD,{ground:false});
  // aluminium plane with side rails, hinge and an adjustable prop
  const pc=V.add(o,V.add(V.mul(dir,L/2),V.mul(nrm,.04)));s.box(pc,[L,.05,1.3],AL,{rotZ:th});for(const z of[-.66,.66])s.box(V.add(V.add(o,V.add(V.mul(dir,L/2),V.mul(nrm,.08))),[0,0,z]),[L,.12,.04],'#b9c0c7',{rotZ:th});
  s.cyl(V.add(o,[0,.07,0]),[0,0,1],.06,1.45,'#868e96');const tx=o[0]+L*.82*Math.cos(th),ty=o[1]+L*.82*Math.sin(th);s.cyl([tx,(o[1]+.04+ty)/2,-.5],[0,1,0],.035,ty-o[1]-.04,CHROME,{seg:12});s.cyl([tx,o[1]+.08,-.5],[0,1,0],.16,.08,'#3c4248');s.box([tx,ty-.06,-.5],[.12,.12,.12],'#6f777f');
  protractor(s,[o[0],o[1]+.08,.72],1.1,th,`θ = ${p.angle}°`);
  const bp=V.add(o,V.add(V.mul(dir,u*L),V.mul(nrm,.27)));woodBlock(s,bp,[.6,.4,.6],th);
  s.arrow(bp,[bp[0],bp[1]-.85,bp[2]],C.gold,2.5,11,'W = mg');s.arrow(bp,V.add(bp,V.mul(nrm,.75)),C.mint,2.5,11,`N = ${f(Math.cos(th),2)} mg`);s.arrow(V.add(bp,[0,0,.32]),V.add(bp,V.add(V.mul(dir,.7),[0,0,.32])),C.red,2.5,11,`f = ${f(slide?p.mu*Math.cos(th):Math.sin(th),2)} mg`);
  part(s,V.add(o,V.add(V.mul(dir,L*.55),[0,0,-.6])),'aluminium inclined plane',30,-60);part(s,[o[0],o[1]+.07,-.7],'hinge',-40,30);part(s,[tx,ty*.5+o[1]*.5,-.5],'adjustable prop',40,30);
  s.render();tag(c,'gold: weight · mint: normal · red: friction',44,98,C.muted,13)};

R['atwood']=(c,p,t)=>{const s=P3.scene(c,{scale:50,cy:262,yaw:.1}),a=(p.m2-p.m1)*G/(p.m1+p.m2),d=clamp(.5*a*cycle(t,3)**2*.15,-1.1,1.1),Rp=.45,pc=[0,2.05,0],yb=-2.35;
  bench(s,-3,3,yb);const top=stand(s,[-1.6,yb,0],4.6,-.3);boss(s,[top[0],pc[1]+.05,0]);s.cyl([(top[0]+pc[0])/2,pc[1]+.05,0],[1,0,0],.03,pc[0]-top[0],CHROME);
  for(const z of[-.09,.09])s.box([pc[0],pc[1]+.02,z],[.12,.22,.02],'#6f777f');pulley(s,pc,Rp,-d/Rp+.3);
  const y1=-.25+d,y2=-.25-d;string(s,[-Rp,pc[1],0],[-Rp,y1,0]);string(s,[Rp,pc[1],0],[Rp,y2,0]);s.path(arc(pc,Rp+.005,0,PI,16),STR,1.6);
  const b1=hanger(s,[-Rp,y1,0],p.m1),b2=hanger(s,[Rp,y2,0],p.m2);s.label([-Rp-.55,(y1+b1[1])/2,0],`m₁ = ${p.m1} kg`,C.blue,12,'right');s.label([Rp+.55,(y2+b2[1])/2,0],`m₂ = ${p.m2} kg`,C.gold,12,'left');
  if(Math.abs(a)>1e-6){const sx=a>0?Rp:-Rp,yy=a>0?y2:y1;s.arrow([sx+(a>0?.45:-.45),yy+.1,.2],[sx+(a>0?.45:-.45),yy+.1-.25-Math.abs(a)*.08,.2],C.mint,3,10,`a = ${f(Math.abs(a),2)} m/s²`)}
  part(s,[pc[0],pc[1]+Rp,0],'light spoked pulley',50,-30);part(s,[top[0],0,0],'retort stand',-40,20);part(s,V.add(b1,[0,.1,.17]),'slotted masses on hanger',-50,40);
  s.render();tag(c,`a = (m₂ − m₁)g/(m₁ + m₂) = ${f(a,2)} m/s²`,44,98,C.gold,14)};

R['elevator-weight']=(c,p,t)=>{const s=P3.scene(c,{scale:44,cy:258,yaw:.15}),y=.55*Math.sin(t*.8)*Math.sign(p.acceleration||0),Nf=p.mass*(G+p.acceleration),W=2,H=2.8,D=1.6;
  // shaft guide rails and the traction sheave above
  for(const x of[-1.25,1.25]){s.box([x,.2,-.2],[.08,5.2,.12],'#5d646b');s.box([x,.2,-.2],[.2,5.2,.03],'#6f777f')}s.box([0,2.95,-.2],[3.4,.18,.5],'#3c4248');pulley(s,[.3,2.6,-.2],.32,-y*3,{w:.14});
  const top=y+H/2;for(const dx of[-.08,0,.08])s.seg([.3+dx-.32,2.6,-.2],[dx,top+.25,-.1],'#2b2f33',1.6);s.box([0,top+.18,-.1],[.5,.14,.25],'#7f878f');
  // counterweight on the other side of the sheave
  s.seg([.62,2.6,-.2],[.62,1.4-y,-.2],'#2b2f33',1.6);s.box([.62,1.0-y,-.35],[.35,.8,.25],'#495057');
  // cabin: floor, roof, back panel, glass sides and posts
  s.box([0,y-H/2,0],[W,.12,D],'#495057');s.box([0,y+H/2,0],[W,.1,D],'#6f777f');s.box([0,y,-D/2+.02],[W,H,.04],'#aeb5bc');s.box([0,y-.2,-D/2+.09],[W*.8,.04,.06],CHROME);
  for(const x of[-W/2,W/2])s.box([x,y,0],[.03,H,D],'#a5d8ff',{alpha:.14});for(const x of[-W/2,W/2])for(const z of[-D/2,D/2])s.box([x,y,z],[.06,H,.06],'#868e96');
  // bathroom scale with digital read-out
  s.box([0,y-H/2+.11,.1],[.75,.1,.55],'#e9ecef');s.box([0,y-H/2+.165,.32],[.3,.012,.08],'#1d2b20');s.engrave([0,y-H/2+.18,.33],`${f(Math.max(0,Nf),0)} N`,'#69db7c',11);
  window.PhysicaBio.critter(s,'human',[0,y-H/2+.16,0],.85,t);
  s.label([0,y-H/2-.35,.9],`scale reads ${f(Math.max(0,Nf),0)} N`,C.mint,13);s.arrow([1.65,y,.3],[1.65,y+p.acceleration*.08,.3],C.gold,4,11,`a = ${p.acceleration} m/s²`);
  part(s,[-1.25,1.8,-.2],'guide rail',-40,-10);part(s,[.3,2.92,-.2],'traction sheave',40,-20);part(s,[.62,1.3-y,-.3],'counterweight',40,10);part(s,[-.25,y-H/2+.16,.35],'weighing scale',-60,30);
  s.render()};

R['connected-blocks']=(c,p,t)=>{const s=P3.scene(c,{scale:52,cy:300,yaw:.15}),a=p.force/(p.m1+p.m2),x=-2.4+clamp(.5*a*cycle(t,3)**2*.08,0,2.2),z=m=>.32+m*.04,w1=z(p.m1)*1.3,w2=z(p.m2)*1.3;
  bench(s,-4,4,0);const x2=x,x1=x+w2/2+.9+w1/2;woodBlock(s,[x2,z(p.m2)/2,0],[w2,z(p.m2),z(p.m2)],0,'#9a6a3e');woodBlock(s,[x1,z(p.m1)/2,0],[w1,z(p.m1),z(p.m1)]);
  const hy=.18,e2=[x2+w2/2+.05,hy,0],e1=[x1-w1/2-.05,hy,0];eye(s,e2,[0,1,0]);eye(s,e1,[0,1,0]);string(s,e2,e1);const T=p.m2*a;
  const ef=[x1+w1/2+.05,hy,0];eye(s,ef,[0,1,0]);const b=V.add(ef,[1.2,0,0]);springBalance(s,b,V.add(ef,[.04,0,0]),p.force,60);s.arrow(V.add(b,[.08,0,0]),V.add(b,[.2+p.force*.02,0,0]),C.mint,4,11,`F = ${p.force} N`);
  s.arrow([(e1[0]+e2[0])/2,hy+.32,0],[(e1[0]+e2[0])/2+.15+T*.02,hy+.32,0],C.gold,2.5,9,`T = ${f(T,1)} N`);
  s.label([x1,z(p.m1)+.3,0],`m₁ = ${p.m1} kg`,C.blue,12);s.label([x2,z(p.m2)+.3,0],`m₂ = ${p.m2} kg`,C.gold,12);
  part(s,[(e1[0]+e2[0])/2,hy,0],'connecting string',-20,60);part(s,V.add(b,[-.5,.08,.05]),'spring balance',20,-70);
  s.render();tag(c,`a = F/(m₁ + m₂) = ${f(a,2)} m/s²`,44,98,C.gold,14)};

R['banked-turn']=(c,p,t)=>{const s=P3.scene(c,{scale:52,pitch:.5,cy:270}),th=rad(p.angle),v=Math.sqrt(p.radius*G*Math.tan(th)),Rr=1.9,w=1,a=t*.6,y0=-.5,hh=w*Math.tan(th);
  s.cyl([0,y0-.06,0],[0,1,0],Rr-w/2,.1,'#3d7a3a',{seg:40});s.lathe([0,y0,0],[[Rr-w/2,0],[Rr+w/2,hh]],'#41464c',{segs:48});s.lathe([0,y0,0],[[Rr+w/2,hh],[Rr+w/2+.08,hh+.12]],'#adb5bd',{segs:48});
  s.lathe([0,y0-.4,0],[[Rr+w/2+.08,0],[Rr+w/2+.08,hh+.52]],'#5c6168',{segs:48});
  for(let i=0;i<48;i++){const q=TAU*i/48,q2=TAU*(i+.6)/48;if(i%2)continue;s.seg([Rr*Math.cos(q),y0+hh/2+.01,Rr*Math.sin(q)],[Rr*Math.cos(q2),y0+hh/2+.01,Rr*Math.sin(q2)],'#f1f3f5',2)}
  for(let i=0;i<40;i++){const q=TAU*i/40,q2=TAU*(i+1)/40,r0=Rr-w/2-.01;s.seg([r0*Math.cos(q),y0+.01,r0*Math.sin(q)],[r0*Math.cos(q2),y0+.01,r0*Math.sin(q2)],i%2?'#e03131':'#f8f9fa',4)}
  // car: body, cabin with glass, four wheels, banked with the road
  const cr=Rr,cc=[cr*Math.cos(a),y0+hh/2,cr*Math.sin(a)],X=q=>V.add(cc,ry(rz(q,th),-a));const bx=(q,sz,col,o={})=>s.box(X(q),sz,col,{rotY:-a,rotZ:th,...o});
  bx([0,.16,0],[.32,.13,.62],'#c92a2a');bx([0,.27,-.03],[.28,.1,.32],'#8a1c1c');bx([0,.27,.135],[.26,.08,.01],'#a5d8ff');for(const dx of[-.17,.17])for(const dz of[-.2,.2])s.cyl(X([dx,.08,dz]),ry(rz([1,0,0],th),-a),.08,.06,RUB,{seg:14,cap:'#868e96'});
  const nv=ry(rz([0,1,0],th),-a),top=X([0,.4,0]);s.arrow(top,V.add(top,V.mul(nv,.9/Math.cos(th)*.8)),C.mint,3,10,`N = ${f(1/Math.cos(th),2)} mg`);s.arrow(X([0,.16,0]),V.add(X([0,.16,0]),[0,-.75,0]),C.gold,3,10,'mg');
  part(s,[-(Rr+w/2)*.7,y0+hh+.1,-(Rr+w/2)*.7],`road banked at ${p.angle}°`,-30,-40);part(s,[0,y0,0],'infield',-60,50);
  s.render();tag(c,`Design speed ≈ ${f(v,1)} m/s`,44,98,C.gold,15)};

R['two-rope-support']=(c,p,t)=>{const s=P3.scene(c,{scale:50,cy:290,yaw:.1}),al=rad(p.left),be=rad(p.right),knot=[0,-.3,0],Lr=2.3,A=[knot[0]-Lr*Math.cos(al),knot[1]+Lr*Math.sin(al),0],B=[knot[0]+Lr*Math.cos(be),knot[1]+Lr*Math.sin(be),0],yb=-2.4;
  bench(s,-3.6,3.6,yb);for(const P of[A,B]){const top=stand(s,[P[0]+(P===A?.3:-.3),yb,-.15],P[1]-yb+.25,P===A?-.3:.3);boss(s,[P[0],P[1]+.08,-.15]);s.cyl([P[0],P[1]+.08,-.04],[0,0,1],.02,.18,CHROME)}
  const den=Math.sin(al+be),T1=p.mass*G*Math.cos(be)/den,T2=p.mass*G*Math.cos(al)/den,mx=Math.max(50,Math.ceil(Math.max(T1,T2)/50)*50);
  for(const [P,T] of[[A,T1],[B,T2]]){const d=V.sub(P,knot),u=V.norm(d),La=Math.hypot(...d),q1=V.add(knot,V.mul(u,La*.3)),q2=V.add(knot,V.mul(u,La*.82));string(s,knot,q1);springBalance(s,q2,q1,T,mx);string(s,q2,P)}
  s.ring(knot,[0,0,1],.06,'#aeb5bc',2.5);const mh=.3+p.mass*.012,lt=[0,knot[1]-.42,0];string(s,knot,lt);s.tube(arc(V.add(lt,[0,-.05,0]),.05,-PI/2,PI*.9,10),.012,'#aeb5bc',{segs:5});s.cyl(V.add(lt,[0,-.1-mh/2,0]),[0,1,0],.28,mh,'#3f454b',{seg:24,cap:'#5b636b'});s.engrave(V.add(lt,[0,-.1-mh/2,.29]),p.mass+' kg','#e9ecef',11);
  const k=.011;s.arrow(V.add(knot,[0,0,.3]),V.add(knot,V.add(V.mul(V.norm(V.sub(A,knot)),T1*k),[0,0,.3])),C.gold,3,11,`T₁ = ${f(T1,1)} N`);s.arrow(V.add(knot,[0,0,.3]),V.add(knot,V.add(V.mul(V.norm(V.sub(B,knot)),T2*k),[0,0,.3])),C.mint,3,11,`T₂ = ${f(T2,1)} N`);
  s.arrow(V.add(lt,[.55,-.1,0]),V.add(lt,[.55,-.1-p.mass*G*k*.6,0]),C.red,2.5,10,`W = ${f(p.mass*G,0)} N`);
  part(s,knot,'knot ring',-60,20);part(s,V.add(A,[.2,0,0]),'clamp on stand',-30,-30);
  s.render();tag(c,'gold: T₁ · mint: T₂ (spring balances read the tensions)',44,98,C.muted,13)};

R['impulse-catch']=(c,p,t)=>{const s=P3.scene(c,{scale:56,cy:290,cx:235,yaw:.1}),T=1.6,tt=cycle(t,T+1),fall=Math.min(1,tt/T),y=1.6-2.9*fall*fall,squash=clamp(p.dt/.5,.04,1),yb=-1.6;
  bench(s,-2.3,2.3,yb,-1,1);const hit=fall>=1,pillow=.12+.6*squash,ph=pillow*(hit?.6:1);
  s.box([0,yb+.03,0],[1.9,.06,1.3],'#adb5bd');s.box([0,yb+.06+ph/2,0],[1.7,ph,1.2],'#9b8ec4');for(const x of[-.42,0,.42])for(const z of[-.3,.3])s.ball([x,yb+.06+ph+.005,z],.025,'#6f5fa3',{flat:true});
  s.seg([-.85,yb+.06+ph,.6],[.85,yb+.06+ph,.6],'#b7acd9',1.5);
  const ey=hit?yb+.06+ph+.2:Math.max(y,yb+.06+ph+.2);s.mesh([0,ey,0],[.15,.2,.15],'#f1e3c6',{rings:10,segs:16,spec:.3});s.shadow([0,ey,0],.18,yb+.06+ph,.4);
  const st=stand(s,[-1.3,yb,-.3],3.4,-.3);boss(s,[st[0],1.75,-.3]);s.cyl([(st[0]+0)/2,1.75,-.3],[1,0,0],.025,-st[0],CHROME);s.lathe([0,1.72,-.3],[[.05,0],[.14,.12]],'#cfd4d9',{segs:16});
  if(!hit)s.arrow([.35,ey,0],[.35,ey-.25-p.v*.04,0],C.gold,3,10,`v = ${p.v} m/s`);
  part(s,[0,ey+.2,0],'egg',40,-20);part(s,[-.6,yb+.06+ph,.3],'foam cushion',-30,40);part(s,[0,1.78,-.3],'release cup',40,-10);s.render();
  const F=p.m*p.v/p.dt;chart(c,440,96,216,140,{title:'Force while stopping',xl:'t',xmin:0,xmax:.6,ymin:0,ymax:Math.max(F*1.1,1),series:[{pts:[[0,0],[.05,0],[.05,F],[.05+Math.min(.5,p.dt),F],[.05+Math.min(.5,p.dt),0],[.6,0]],col:C.gold}]});tag(c,`F̄ = ${f(F,1)} N`,452,224,C.gold,13)};

R['gun-recoil']=(c,p,t)=>{const m=p.m/1000,V0=m*p.v/p.M,tt=cycle(t,3),s=P3.scene(c,{scale:56,cy:300,yaw:.3}),gx=-.3-Math.min(2,V0*tt*.5),yb=-1;
  bench(s,-4,4,yb-.12);for(const z of[-.32,.32]){s.box([0,yb-.06,z],[7.6,.06,.06],'#868e96')}for(let i=0;i<16;i++)s.box([-3.75+i*.5,yb-.1,0],[.08,.03,.8],'#5c4632');
  trolley(s,[gx,yb-.03,0],1.7,'#3a6ea5',{d:.6,wr:.1});const deck=yb-.03+.1+.22+.06;
  // rifle: walnut stock, steel receiver, barrel, trigger guard; clamped to the cart
  const by=deck+.32;s.box([gx-.45,by-.05,0],[.85,.16,.12],'#6b3f1f',{rotZ:-.12});s.box([gx-.75,by-.1,0],[.25,.3,.12],'#6b3f1f');s.box([gx+.1,by,0],[.5,.14,.1],'#3b4148');
  s.cyl([gx+.95,by+.02,0],[1,0,0],.04,1.25,'#2b3036',{seg:12});s.cyl([gx+1.56,by+.02,0],[1,0,0],.05,.04,'#1b1f23',{seg:12});s.tube(arc([gx+.05,by-.12,0],.07,PI,TAU,10),.01,'#2b3036',{segs:4});s.box([gx+.05,by-.12,0],[.02,.08,.02],'#1b1f23');
  for(const dx of[-.3,.25])s.box([gx+dx,(deck+by)/2-.02,0],[.06,by-deck-.05,.16],'#6f777f');
  const bx=gx+1.6+Math.min(6,tt*p.v*.02);if(bx<4){s.cyl([bx,by+.02,0],[1,0,0],.035,.12,'#c9a227',{seg:10});s.ball([bx+.06,by+.02,0],.034,'#b87333');if(tt<.25)s.ball([gx+1.62,by+.02,0],.12,'#ffd43b',{glow:true,flat:true})}
  s.arrow([gx,by+.45,0],[gx-V0*.6-.1,by+.45,0],C.red,3,11,`V_recoil = ${f(V0,2)} m/s`);if(bx<3.6)s.arrow([bx+.15,by+.3,0],[bx+.85,by+.3,0],C.gold,3,10,`v = ${p.v} m/s`);
  part(s,[gx-.6,by,0.06],'rifle on cart',-40,-50);part(s,[gx+.6,yb+.07,.33],'low-friction trolley',20,50);part(s,[2.5,yb-.06,.32],'rails',30,30);s.render();
  tag(c,`M V = m v → V = ${f(m*p.v,2)} / ${p.M} = ${f(V0,2)} m/s`,44,98,C.gold,14)};

R['angle-of-repose']=(c,p,t)=>{const th=rad(p.th),mk=.8*p.mus,slide=Math.tan(th)>p.mus,a=slide?G*(Math.sin(th)-mk*Math.cos(th)):0,s=P3.scene(c,{scale:56,cy:318,yaw:.12}),L=4.4,o=[-2.2,-1.3,0],dir=[Math.cos(th),Math.sin(th),0],nrm=[-Math.sin(th),Math.cos(th),0];
  bench(s,-3.8,3.4,o[1]-.1);s.box([o[0]+2.1,o[1]-.05,0],[4.6,.1,1.6],WOOD,{ground:false});
  // hinged plank with an abrasive top, lifted by a screw jack
  s.box(V.add(o,V.add(V.mul(dir,L/2),V.mul(nrm,.05))),[L,.1,1.5],WOODL,{rotZ:th});s.box(V.add(o,V.add(V.mul(dir,L*.5+.1),V.mul(nrm,.105))),[L-.4,.012,1.2],'#7c7468',{rotZ:th});
  for(let i=0;i<4;i++)s.cyl(V.add(o,[0,0,-.6+i*.4]),[0,0,1],.06,.25,'#9c7c38');const jx=o[0]+L*.8*Math.cos(th),jy=o[1]+L*.8*Math.sin(th);
  s.box([jx,o[1]+.1,0],[.5,.12,.5],'#3c4248');s.cyl([jx,(o[1]+.16+jy)/2,0],[0,1,0],.045,Math.max(.05,jy-o[1]-.16),'#b0b7be',{seg:12});for(let k=0;k<12;k++){const yy=o[1]+.25+k*(jy-o[1]-.3)/12;s.ring([jx,yy,0],[0,1,0],.05,'#6c737a',1)}s.cyl([jx,o[1]+.5,0],[0,0,1],.02,.6,'#495057');
  protractor(s,[o[0],o[1]+.1,.8],1.1,th,`θ = ${p.th}°`);
  const u=clamp(.78-(slide?.5*a*cycle(t,2.5)**2*.12:0),.1,.78),bp=V.add(o,V.add(V.mul(dir,u*L),V.mul(nrm,.32)));woodBlock(s,bp,[.6,.42,.6],th,'#9a6a3e');
  s.arrow(bp,V.add(bp,V.mul(dir,-.75)),C.mint,2.5,11,`mg sinθ = ${f(Math.sin(th),2)} mg`);s.arrow(bp,[bp[0],bp[1]-.85,bp[2]],C.gold,2.5,11,'W = mg');s.arrow(V.add(bp,[0,0,.32]),V.add(bp,V.add(V.mul(dir,.4+.4*Math.min(1,Math.tan(th))),[0,0,.32])),C.red,2.5,11,`f = ${f(slide?.8*p.mus*Math.cos(th):Math.sin(th),2)} mg`);
  part(s,V.add(o,V.add(V.mul(dir,L*.35),[0,0,-.6])),'sandpaper-covered plank',-20,-70);part(s,[jx,(o[1]+jy)/2,.05],'screw jack',50,10);part(s,[o[0],o[1],-.6],'hinge',-50,20);s.render();
  tag(c,slide?'Sliding — kinetic friction (μk = 0.8 μs)':'Static friction holds the block',44,98,slide?C.gold:C.mint,15);tag(c,'mint: down-slope pull   red: friction   gold: weight',44,124,C.muted,13)};

})();
