/* True-3D scenes for the original Class 12 electricity and magnetism experiments.
   Readouts still come from each experiment's own model; these renderers only draw. */
(() => {
'use strict';
const {f,clamp,rad,deg,cycle,memo,tag,chart,PI,TAU,C}=window.PhysicaLab;
const P3=window.Physica3D,V=P3.vec,mu0=4e-7*PI,k=8.99e9;
const reg=(id,fn)=>{(window.Physica3DRenderers=window.Physica3DRenderers||{})[id]=fn};
const hash=i=>{const x=Math.sin(i*127.1+311.7)*43758.5453;return x-Math.floor(x)};
const along=(path,q)=>{const i=Math.min(path.length-2,Math.floor(q*(path.length-1))),fr=q*(path.length-1)-i;return V.add(path[i],V.mul(V.sub(path[i+1],path[i]),fr))};
const qcol=q=>q>0?'#ff857e':q<0?'#7baaff':'#adb5bd';
// Circuit helpers on a board (y = 0 is the board top).
const board=(s,w=6.6,d=3.6)=>s.box([0,-.12,0],[w,.16,d],'#16404a');
const wire=(s,pts,col='#d9844a')=>s.path(pts.map(([x,z])=>[x,.03,z]),col,4);
function flow(s,pts,I,t,col='#ffc36b',n=10){if(Math.abs(I)<1e-9)return;let L=0;const seg=[];for(let i=0;i<pts.length-1;i++){const l=Math.hypot(pts[i+1][0]-pts[i][0],pts[i+1][1]-pts[i][1]);seg.push(l);L+=l}
  for(let j=0;j<n;j++){let d=cycle(j*L/n+t*Math.sign(I)*Math.min(2.5,.25+Math.abs(I)*.5),L);for(let i=0;i<seg.length;i++){if(d<=seg[i]){const a=pts[i],b=pts[i+1],q=d/seg[i];s.ball([a[0]+(b[0]-a[0])*q,.09,a[1]+(b[1]-a[1])*q],.05,col,{flat:true});break}d-=seg[i]}}}
const resistor=(s,x,z,ax='x',lab='',glow=0)=>{s.cyl([x,.12,z],ax==='x'?[1,0,0]:[0,0,1],.12,.8,glow>0?`#ff${Math.round(200-120*glow).toString(16).padStart(2,'0')}5a`:'#c9a36b');if(lab)s.label([x,.55,z],lab,'#e9f6ff',12)};
const cellS=(s,x,z,ax='x',lab='')=>{const a=ax==='x'?[1,0,0]:[0,0,1];s.cyl([x,.18,z],a,.18,.8,'#2f3d48',{cap:'#c9d3da'});s.cyl(V.add([x,.18,z],V.mul(a,.45)),a,.06,.1,'#c9d3da');if(lab)s.label([x,.6,z],lab,'#ffc36b',12)};
const capS=(s,x,z,fill=0,lab='',h=.6)=>{s.cyl([x,h/2,z],[0,1,0],.3,h,'#2f6db0',{cap:'#c9d3da'});s.cyl([x,h*fill/2,z],[0,1,0],.32,Math.max(.01,h*fill),'#ffc36b',{alpha:.45,caps:false});if(lab)s.label([x,h+.3,z],lab,'#e9f6ff',12)};
const bulb=(s,x,z,b)=>{s.cyl([x,.15,z],[0,1,0],.12,.3,'#9fb4c2');s.ball([x,.5,z],.25,b>.05?'#ffe7a3':'#868e96',{alpha:.6,glow:b>.05});if(b>.05)s.ball([x,.5,z],.08+.15*clamp(b,0,1),'#fff2c6',{glow:true,flat:true})};
const coil=(s,p,axis,r,len,turns,col='#d9844a')=>s.helix(p,axis,r,len,turns,col,2.5);
function fieldLine(s,start,fn,col,steps=40,h=.08,stop){const pts=[start];let q=start;for(let i=0;i<steps;i++){const E=fn(q),m=Math.hypot(...E);if(m<1e-9)break;q=V.add(q,V.mul(E,h/m));if(Math.hypot(...q)>4.5||(stop&&stop(q)))break;pts.push(q)}for(let i=0;i<pts.length-1;i+=8)s.path(pts.slice(i,i+9),col,1.3)}

/* ---------- Electric Charges and Fields ---------- */
reg('electrostatic',(c,p,t)=>{const s=P3.scene(c,{scale:56}),d=.4+p.separation*.35,A=[-d/2,0,0],B=[d/2,0,0],E=q=>{let e=[0,0,0];for(const [pos,qq] of[[A,p.charge1],[B,p.charge2]]){const r=V.sub(q,pos),m=Math.max(.15,Math.hypot(...r));e=V.add(e,V.mul(r,qq/m**3))}return e};
  for(const [pc,qq] of[[A,p.charge1],[B,p.charge2]]){if(qq===0)continue;for(let i=0;i<12;i++){const u=hash(i)*2-1,ph=TAU*i/12,r=Math.sqrt(1-u*u),dir=[r*Math.cos(ph),u,r*Math.sin(ph)];fieldLine(s,V.add(pc,V.mul(dir,.2)),q=>V.mul(E(q),Math.sign(qq)),qcol(qq)+'99')}}
  s.ball(A,.2,qcol(p.charge1),{glow:true,label:(p.charge1>0?'+':'')+p.charge1+' μC'});s.ball(B,.2,qcol(p.charge2),{glow:true,label:(p.charge2>0?'+':'')+p.charge2+' μC'});const F=p.charge1*p.charge2,dirA=F>0?-1:1;if(F!==0){const Fn=`F = ${f(k*Math.abs(F)*1e-12/(p.separation/10)**2,3)} N`;s.arrow(V.add(A,[0,-.45,0]),V.add(A,[dirA*.6,-.45,0]),C.gold,3,11,Fn);s.arrow(V.add(B,[0,-.45,0]),V.add(B,[-dirA*.6,-.45,0]),C.gold,3,11,Fn)}s.render();tag(c,F>0?'Like charges repel':F<0?'Unlike charges attract':'No force',44,98,C.gold,14)});
reg('dipole-potential',(c,p,t)=>{const s=P3.scene(c,{scale:54,pitch:.45,cy:290}),d=.5,Vf=(x,z)=>{const r1=Math.hypot(x-d,z)+.15,r2=Math.hypot(x+d,z)+.15;return clamp(.6*(1/r1-1/r2),-1.6,1.6)},n=30;for(let j=0;j<=n;j++){const z=-2.6+5.2*j/n,row=[];for(let i=0;i<=n;i++){const x=-3+6*i/n;row.push([x,Vf(x,z),z])}for(let i=0;i<n;i+=3)s.path(row.slice(i,i+4),(row[i][1]>0?'#ff857e':'#7baaff')+'bb',1.2)}
  const th=rad(p.angle),rr=p.radius*1.6,pr=[rr*Math.cos(th),0,-rr*Math.sin(th)];s.ball([d,Vf(d,0)+.15,0],.12,'#ff857e');s.ball([-d,Vf(-d,0)+.15,0],.12,'#7baaff');s.ball([pr[0],Vf(pr[0],pr[2])+.12,pr[2]],.1,C.gold,{label:'probe',lift:4});s.render();tag(c,'surface height ∝ potential (θ = 90° lies on V = 0)',44,98,C.muted,13)});
reg('gauss',(c,p,t)=>{const s=P3.scene(c,{scale:56}),R=.6+p.radius*.9,q=p.charge;s.mesh([0,0,0],R,'#7baaff',{alpha:.15,rings:12,segs:20});s.ring([0,0,0],[0,1,0],R,'#7baaff',1.5);s.ball([0,0,0],.15,qcol(q),{glow:true});for(let i=0;i<18;i++){const u=hash(i)*2-1,ph=TAU*hash(i+20),r=Math.sqrt(1-u*u),d=[r*Math.cos(ph),u,r*Math.sin(ph)];if(q>=0)s.arrow(V.mul(d,.2),V.mul(d,3),'#ffc36b88',1.4,7,i===0?'E':'');else s.arrow(V.mul(d,3),V.mul(d,.2),'#7baaff88',1.4,7,i===0?'E':'')}s.render();tag(c,'every line crosses the sphere once — flux does not depend on R',44,98,C.muted,13)});
reg('dipole-torque',(c,p,t)=>{const s=P3.scene(c,{scale:56}),th=rad(p.angle),d=.5+p.separation*.12;for(let i=-3;i<=3;i++)for(let j=-1;j<=1;j++)s.arrow([-3.2,i*.45,j*.9],[3.2,i*.45,j*.9],'#7baaff33',1,6,i===3&&j===0?`E = ${p.field} N/C`:'');const ax=[Math.cos(th),Math.sin(th),0],A=V.mul(ax,d),B=V.mul(ax,-d);s.tube([A,B],.04,'#ced4da',{segs:6});s.ball(A,.16,'#ff857e',{label:'+q'});s.ball(B,.16,'#7baaff',{label:'−q'});
  const F=.2+p.field*.0008;s.arrow(A,V.add(A,[F,0,0]),C.gold,3,11,`F = qE = ${f(p.charge*p.field*1e-3,3)} µN`);s.arrow(B,V.add(B,[-F,0,0]),C.gold,3,11,`F = ${f(p.charge*p.field*1e-3,3)} µN`);if(Math.sin(th)!==0){const arc=Array.from({length:16},(_,i)=>{const a=th-Math.sign(Math.sin(th))*(.6*i/15);return[1.1*Math.cos(a),1.1*Math.sin(a),0]});s.path(arc,C.mint,2.5)}s.render();tag(c,'mint arc: torque rotates the dipole towards E',44,98,C.muted,13)});
reg('coulomb-distance',(c,p,t)=>{const s=P3.scene(c,{scale:56,cx:220}),r=.4+p.r*.045,F=k*p.q1*p.q2*1e-12/(p.r/100)**2;s.ball([-r,0,0],.14+p.q1*.012,'#ff857e',{glow:true});s.ball([r,0,0],.14+p.q2*.012,'#ff857e',{glow:true});const L=clamp(Math.log10(F+1)*.4,.1,1.6);s.arrow([-r-.2,0,0],[-r-.2-L,0,0],C.gold,4,11,`F = ${f(F,3)} N`);s.arrow([r+.2,0,0],[r+.2+L,0,0],C.gold,4,11,`F = ${f(F,3)} N`);s.render();
  chart(c,430,96,226,150,{title:'F vs r (∝ 1/r²)',xl:'r (cm)',xmin:5,xmax:60,ymin:0,ymax:k*p.q1*p.q2*1e-12/(.05)**2,series:[{fn:x=>k*p.q1*p.q2*1e-12/(x/100)**2,col:C.gold}],marker:[p.r,F]})});
reg('charged-ring-axis',(c,p,t)=>{const s=P3.scene(c,{scale:56,cx:230,yaw:.6}),R=.3+p.radius*1.4,x=p.position*1.5,E=xx=>p.charge*xx/(xx*xx+p.radius**2)**1.5;for(let i=0;i<24;i++){const a=TAU*i/24;s.ball([0,R*Math.cos(a),R*Math.sin(a)],.06,'#ff857e',{flat:true})}s.ring([0,0,0],[1,0,0],R,'#ff857e',2);s.seg([-3.2,0,0],[3.2,0,0],C.muted,1,[4,4]);s.ball([x,0,0],.1,C.gold,{lift:3});const e=E(p.position);s.arrow([x,0,0],[x+clamp(e*.08,-1.2,1.2),0,0],C.gold,4,11,`E = ${f(8.99*Math.abs(e),2)} N/C`);s.render();
  chart(c,450,96,206,150,{title:'E along the axis',xl:'x (m)',xmin:-2,xmax:2,series:[{fn:E,col:C.gold}],marker:[p.position,E(p.position)]})});

/* ---------- Electrostatic Potential and Capacitance ---------- */
reg('capacitor',(c,p,t)=>{const s=P3.scene(c,{scale:58}),gap=.3+p.distance*.25,Cap=8.854e-12*p.dielectric*.01/(p.distance/1000),Q=Cap*p.voltage,n=clamp(Math.round(Q*1e10*1.5),4,40);s.box([0,gap/2+.05,0],[2.4,.1,1.8],'#ff857e');s.box([0,-gap/2-.05,0],[2.4,.1,1.8],'#7baaff');if(p.dielectric>1)s.box([0,0,0],[2.3,gap*.9,1.7],'#b89dff',{alpha:.45});for(let i=0;i<n;i++){const x=-1.05+(i%8)*.3,z=-.75+Math.floor(i/8)*.38;s.ball([x,gap/2+.13,z],.04,'#ff2b2b',{flat:true});s.ball([x,-gap/2-.13,z],.04,'#4c6ef5',{flat:true})}
  for(let i=0;i<5;i++)s.arrow([-1+i*.5,gap/2,0],[-1+i*.5,-gap/2,0],'#ffc36b88',1.3,6,i===4?`E = V/d = ${f(p.voltage/(p.distance*1e-3),0)} V/m`:'');s.tube([[0,gap/2+.1,0],[0,1.4,0],[2.2,1.4,0],[2.2,.2,0]],.03,'#d9844a',{segs:4});s.tube([[0,-gap/2-.1,0],[0,-1.4,0],[2.2,-1.4,0],[2.2,-.2,0]],.03,'#d9844a',{segs:4});s.cyl([2.2,0,0],[0,1,0],.2,.4,'#2f3d48');s.render();tag(c,'dots: stored charge (more with higher C or V)',44,98,C.muted,13)});
reg('rc-charge',(c,p,t)=>{const s=P3.scene(c,{scale:54,pitch:.5,cx:230,cy:290}),RC=p.resistance*1e3*p.capacitance*1e-6,T=Math.min(5*RC,30),tt=cycle(t,T+2),Vc=p.voltage*(1-Math.exp(-tt/RC)),I=(p.voltage-Vc)/(p.resistance*1e3);board(s);cellS(s,-2.4,0,'z','V');resistor(s,0,-1.2,'x','R');capS(s,2.2,0,Vc/p.voltage,'C');wire(s,[[-2.4,-.5],[-2.4,-1.2],[2.2,-1.2],[2.2,-.3]]);wire(s,[[-2.4,.5],[-2.4,1.2],[2.2,1.2],[2.2,.3]]);flow(s,[[-2.4,-1.2],[2.2,-1.2]],I*2000,t);s.render();
  chart(c,430,96,226,150,{title:'Vc vs time',xl:'s',xmin:0,xmax:T+2,ymin:0,ymax:p.voltage*1.05,series:[{fn:x=>p.voltage*(1-Math.exp(-x/RC)),col:C.gold}],marker:[tt,Vc]})});
reg('capacitor-network',(c,p,t)=>{const s=P3.scene(c,{scale:54,pitch:.5,cy:290}),ser=p.mode==='series',Ceq=ser?p.c1*p.c2/(p.c1+p.c2):p.c1+p.c2,Q=Ceq*p.voltage;board(s);cellS(s,-2.4,0,'z','V');if(ser){capS(s,0,-1.2,Math.min(1,Q/(p.c1*p.voltage)),'C₁');capS(s,1.6,-1.2,Math.min(1,Q/(p.c2*p.voltage)),'C₂');wire(s,[[-2.4,-.5],[-2.4,-1.2],[2.6,-1.2],[2.6,1.2],[-2.4,1.2],[-2.4,.5]])}else{capS(s,0,-.6,1,'C₁');capS(s,1.4,-.6,1,'C₂');wire(s,[[-2.4,-.5],[-2.4,-1.2],[1.4,-1.2],[1.4,-.9]]);wire(s,[[0,-1.2],[0,-.9]]);wire(s,[[-2.4,.5],[-2.4,1.2],[1.4,1.2],[1.4,-.3]]);wire(s,[[0,1.2],[0,-.3]])}s.render();tag(c,`C_eq = ${f(Ceq,2)} μF`,44,98,C.gold,15)});
reg('equipotential-map',(c,p,t)=>{const s=P3.scene(c,{scale:56,pitch:.55}),q=p.charge;s.ball([0,0,0],.18,qcol(q),{glow:true});for(let i=1;i<=6;i++)s.ring([0,0,0],[0,1,0],i*.45,(q>=0?'#ff857e':'#7baaff')+Math.round(220-i*25).toString(16),1.6);const a=rad(p.angle),r=p.radius*1.5,pr=[r*Math.cos(a),0,-r*Math.sin(a)];s.ball(pr,.1,C.gold,{lift:3,label:'probe'});s.arrow(pr,V.add(pr,V.mul(V.norm(pr),q>=0?.6:-.6)),C.gold,3,11,`E = ${f(8.99*Math.abs(q)/p.radius**2,2)} N/C`);for(let i=0;i<12;i++){const b=TAU*i/12;s.seg([.2*Math.cos(b),0,.2*Math.sin(b)],[2.8*Math.cos(b),0,2.8*Math.sin(b)],'#ffc36b33',1)}s.render();tag(c,'rings: equipotentials · faint lines: field (always perpendicular)',44,98,C.muted,13)});
reg('cap-energy',(c,p,t)=>{const s=P3.scene(c,{scale:58}),U=.5*p.cap*1e-6*p.volt**2,gap=.6;s.box([0,gap/2+.05,0],[2.2,.1,1.6],'#ff857e');s.box([0,-gap/2-.05,0],[2.2,.1,1.6],'#7baaff');s.box([0,0,0],[2.1,gap*.9,1.5],'#ffc36b',{alpha:clamp(.05+U*20,.05,.6)});for(let i=0;i<5;i++)s.arrow([-.9+i*.45,gap/2,0],[-.9+i*.45,-gap/2,0],'#ffc36baa',1.3,6,i===4?'E':'');s.render();tag(c,`U = ½CV² = ${f(U*1000,2)} mJ (glow ∝ energy)`,44,98,C.gold,14)});
reg('isolated-dielectric',(c,p,t)=>{const s=P3.scene(c,{scale:58}),fr=p.fraction/100,gap=.6;s.box([0,gap/2+.05,0],[2.2,.1,1.6],'#ff857e');s.box([0,-gap/2-.05,0],[2.2,.1,1.6],'#7baaff');if(fr>0)s.box([-1.1+1.1*fr,0,0],[2.2*fr,gap*.9,1.5],'#b89dff',{alpha:.6});for(let i=0;i<5;i++){const x=-.9+i*.45,inside=x<-1.1+2.2*fr;s.arrow([x,gap/2,0],[x,-gap/2,0],inside?'#ffc36b55':'#ffc36bcc',inside?1:1.8,6,i===0&&inside?'E₀/K':i===4&&!inside?'E₀':'')}s.render();tag(c,'Charge fixed (isolated): the dielectric weakens the field and lowers V',44,98,C.muted,13)});

/* ---------- Current Electricity ---------- */
reg('circuit',(c,p,t)=>{const s=P3.scene(c,{scale:54,pitch:.5,cy:290}),I=p.voltage/p.resistance;board(s);cellS(s,-2.4,0,'z','V');resistor(s,0,-1.2,'x','R',clamp(I*I*p.resistance/150,0,1));bulb(s,2.2,0,clamp(I/3,0,1));const loop=[[-2.4,-.5],[-2.4,-1.2],[2.2,-1.2],[2.2,-.2]],top=[[2.2,.2],[2.2,1.2],[-2.4,1.2],[-2.4,.5]];wire(s,loop);wire(s,top);flow(s,[...loop,...top.slice(0)],I,t);s.render();tag(c,`I = ${f(I,2)} A`,44,98,C.gold,15)});
reg('resistor-network',(c,p,t)=>{const s=P3.scene(c,{scale:54,pitch:.5,cy:290}),ser=p.mode==='series',Req=ser?p.r1+p.r2:p.r1*p.r2/(p.r1+p.r2);board(s);cellS(s,-2.4,0,'z','6 V');if(ser){resistor(s,-.4,-1.2,'x','R₁');resistor(s,1.2,-1.2,'x','R₂');wire(s,[[-2.4,-.5],[-2.4,-1.2],[2.4,-1.2],[2.4,1.2],[-2.4,1.2],[-2.4,.5]]);flow(s,[[-2.4,-1.2],[2.4,-1.2],[2.4,1.2],[-2.4,1.2]],6/Req,t)}else{resistor(s,.6,-1.2,'x','R₁');resistor(s,.6,0,'x','R₂');wire(s,[[-2.4,-.5],[-2.4,-1.2],[2.4,-1.2],[2.4,1.2],[-2.4,1.2],[-2.4,.5]]);wire(s,[[-.6,-1.2],[-.6,0],[1.8,0],[1.8,-1.2]]);flow(s,[[-.6,-1.2],[1.8,-1.2]],6/p.r1,t);flow(s,[[-.6,0],[1.8,0]],6/p.r2,t)}s.render();tag(c,`R_eq = ${f(Req,2)} Ω`,44,98,C.gold,15)});
reg('wheatstone',(c,p,t)=>{const s=P3.scene(c,{scale:54,pitch:.55,cy:290}),A=[-2,0],B=[0,-1.3],Cc=[2,0],D=[0,1.3],off=p.p/p.q-p.r/p.s;board(s);wire(s,[A,B]);wire(s,[B,Cc]);wire(s,[A,D]);wire(s,[D,Cc]);resistor(s,-1,-.65,'x','P');resistor(s,1,-.65,'x','Q');resistor(s,-1,.65,'x','R');resistor(s,1,.65,'x','S');wire(s,[B,[0,-.3]]);wire(s,[[0,.3],D]);s.cyl([0,.2,0],[0,1,0],.32,.3,'#2f3d48',{cap:'#e9f6ff'});const nd=clamp(off*1.2,-1.2,1.2);s.seg([0,.36,0],[.28*Math.sin(nd),.36,-.28*Math.cos(nd)],C.red,2.5);
  wire(s,[[-2,0],[-2.8,0],[-2.8,1.6],[2.8,1.6],[2.8,0],[2,0]]);cellS(s,0,1.6,'x');s.render();tag(c,Math.abs(off)<.01?'Balanced: galvanometer reads zero':'Unbalanced: current through galvanometer',44,98,Math.abs(off)<.01?C.mint:C.gold,14)});
reg('internal-resistance',(c,p,t)=>{const s=P3.scene(c,{scale:54,pitch:.5,cy:290}),I=p.emf/(p.load+p.internal),Vt=p.emf-I*p.internal;board(s);s.cyl([-2.4,.3,0],[0,0,1],.35,1.4,'#2f3d48',{alpha:.45});s.cyl([-2.4,.3,-.3],[0,0,1],.18,.5,'#ffc36b');resistor(s,-2.4,.35,'z','');s.label([-2.4,.95,0],'cell: ε with r inside',C.gold,11);resistor(s,1,-1.2,'x','R');wire(s,[[-2.4,-.7],[-2.4,-1.2],[2.4,-1.2],[2.4,1.2],[-2.4,1.2],[-2.4,.7]]);flow(s,[[-2.4,-1.2],[2.4,-1.2],[2.4,1.2],[-2.4,1.2]],I,t);s.cyl([2.6,.25,0],[0,1,0],.3,.3,'#212529',{cap:'#e9f6ff'});s.label([2.6,.75,0],`${f(Vt,2)} V`,C.mint,13);s.render()});
reg('power-vs-resistance',(c,p,t)=>{const s=P3.scene(c,{scale:56,pitch:.5,cx:230,cy:290}),P=p.volt**2/p.res;board(s,5,3);cellS(s,-1.8,0,'z','V');resistor(s,.8,0,'z','R',clamp(P/150,0,1));if(P>40)for(let i=0;i<Math.min(10,Math.round(P/15));i++){const q=cycle(t*.6+i/8,1);s.ball([.8+(hash(i)-.5)*.4,.3+q*1.2,(hash(i+3)-.5)*.6],.04,'#ff922b',{flat:true,glow:true})}wire(s,[[-1.8,-.5],[-1.8,-1],[.8,-1],[.8,-.4]]);wire(s,[[-1.8,.5],[-1.8,1],[.8,1],[.8,.4]]);s.render();
  chart(c,430,96,226,150,{title:'P = V²/R',xl:'R (Ω)',xmin:2,xmax:50,ymin:0,ymax:p.volt**2/2,series:[{fn:R=>p.volt**2/R,col:C.gold}],marker:[p.res,P]})});
reg('electron-drift',(c,p,t)=>{const s=P3.scene(c,{scale:56,pitch:.25}),R=.3+p.radius*.35,vd=p.current/(8.5e28*1.6e-19*PI*(p.radius/1000)**2);s.cyl([0,0,0],[1,0,0],R,6.4,'#d9844a',{alpha:.25,caps:false});for(let i=0;i<30;i++){const x=-3.1+((hash(i)*6.2-t*vd*800)%6.2+6.2)%6.2,j=.06*Math.sin(t*25+i*3);s.ball([x+j,(hash(i+3)-.5)*1.6*R+j,(hash(i+6)-.5)*1.6*R],.045,'#4dabf7',{flat:true})}for(let i=0;i<14;i++)s.ball([-3+i*.46,0,0],.06,'#ced4da',{flat:true});s.arrow([-1,R+.4,0],[1,R+.4,0],C.gold,3,11,`I = ${p.current} A (conventional)`);s.render();tag(c,`drift speed ≈ ${f(vd*1000,3)} mm/s (electrons move opposite to current)`,44,98,C.muted,13)});

/* ---------- Realistic electromagnetism apparatus (shared by the Ultra scenes of Class 12 magnetism, induction, AC and EM waves) ---------- */
const K6=window.PhysicaKit6=(()=>{
const WOOD='#8a5a36',CU='#d98a4b',CUD='#6e3a1c',STL='#c3c9cf',IRN='#4a5159',BRS='#c9a227',GL='#dbeaf3';
const zf=(s,p)=>s.P(p)[2];
const mint=(s,p,txt,dx=40,dy=-30)=>s.callout(p,txt,C.mint,dx,dy,11);
const bench=(s,x,y,w,d,col=WOOD)=>{s.box([x,y-.09,0],[w,.18,d],col,{ground:true});for(let i=1;i<9;i++){const z=-d/2+d*i/9,j=((i*37)%7-3)*.015;s.seg([x-w/2+.05,y+.002,z],[x+w/2-.05,y+.002,z+j],'#00000026',1,[],-4.6e5)}s.seg([x-w/2,y,d/2],[x+w/2,y,d/2],'#ffffff22',1,[],-4.6e5)};
const wire=(s,pts,col='#d64541',w=3)=>{s.path(pts,'#000000aa',w+2.2);s.path(pts,col,w)};
// Painted bar magnet along x (north = red, +x), steel end caps, engraved letters.
const magnet=(s,[x,y,z],L=1.8,w=.4)=>{s.box([x+L/4,y,z],[L/2,w,w],'#d33a32');s.box([x-L/4,y,z],[L/2,w,w],'#2d63c4');for(const e of[-1,1])s.box([x+e*(L/2-.015),y,z],[.03,w+.02,w+.02],'#cfd4d9');
  s.engrave([x+L/4,y+w/2+.004,z],'N','#ffffff',15);s.engrave([x-L/4,y+w/2+.004,z],'S','#ffffff',15)};
// Copper winding on a clear plastic former.
const coil=(s,p,axis,r,len,turns,{former=true,w=3}={})=>{if(former)s.cyl(p,axis,r*.96,len*1.04,'#cfe6f3',{alpha:.22,caps:false,seg:18});s.helix(p,axis,r,len,turns,CUD,w+1.6);s.helix(p,axis,r,len,turns,'#e49a5a',w)};
// Round panel meter facing +z; frac in 0..1 (or -1..1 when centred).
const meter=(s,p,r,frac,{zero=false,col='#d63a30',txt='G'}={})=>{const [x,y,z]=p,fz=z+.152,zz=zf(s,[x,y,fz]);s.cyl(p,[0,0,1],r,.3,'#202429',{cap:'#2b3036',seg:28});s.cyl([x,y,z+.14],[0,0,1],r*.84,.02,'#f3f0e4',{cap:'#f3f0e4',seg:28});
  const pv=[x,y-r*.32,fz],on=(a,k)=>[x+Math.sin(a)*r*k,y-r*.32+Math.cos(a)*r*k,fz];for(let i=0;i<=10;i++){const a=(-50+10*i)*Math.PI/180;s.seg(on(a,i%5===0?.56:.62),on(a,.7),'#1b1f24',i%5===0?1.6:1,[],zz+.02)}
  const a=(zero?frac*50:-50+100*frac)*Math.PI/180;s.seg(pv,on(a,.68),col,2.4,[],zz+.04);s.ball(pv,r*.07,'#1b1f24',{flat:true,lift:.06});s.engrave([x,y-r*.1,fz],txt,'#1b1f24',Math.round(11+r*8),zz+.03)};
const bulb=(s,[x,y,z],b)=>{s.cyl([x,y+.1,z],[0,1,0],.14,.24,'#b5a24a',{cap:'#8d8f93',seg:14});s.cyl([x,y-.04,z],[0,1,0],.11,.06,'#4a4f55',{seg:12});if(b>.04)s.ball([x,y+.46,z],.34+.26*b,'#ffd27a',{glow:true,flat:true,alpha:.3});s.ball([x,y+.46,z],.27,b>.04?'#fff0c4':'#dbe9f0',{alpha:b>.04?.85:.3,flat:b>.04});s.seg([x-.06,y+.32,z],[x-.06,y+.5,z],'#555',1.2);s.seg([x+.06,y+.32,z],[x+.06,y+.5,z],'#555',1.2);s.seg([x-.06,y+.5,z],[x+.06,y+.5,z],b>.04?'#fff7dc':'#7a7a7a',2)};
// Flat compass on a surface at height y; dir is a vector in the x-z plane (the red end points along it).
const compass=(s,[x,y,z],dir)=>{const m=Math.hypot(dir[0],dir[2])||1,dx=dir[0]/m,dz=dir[2]/m,px=-dz,pz=dx;s.cyl([x,y+.05,z],[0,1,0],.31,.1,'#b8902c',{cap:'#f1eee2',seg:18});
  const q=(a,b)=>[x+dx*a+px*b,y+.112,z+dz*a+pz*b];s.poly([q(.27,0),q(0,.055),q(0,-.055)],'#e0372f',{normal:[0,1,0],bias:.2,shade:false});s.poly([q(-.27,0),q(0,.055),q(0,-.055)],'#dfe6ee',{normal:[0,1,0],bias:.2,shade:false})};
const arrowOn=(s,pts,k,col,w=1.5)=>{if(pts.length>k+2)s.arrow(pts[k],pts[k+2],col,w,7)};
// Resistor with colour bands lying along x.
const resistor=(s,[x,y,z],ax='x',L=.8)=>{const a=ax==='x'?[1,0,0]:[0,0,1],o=q=>ax==='x'?[x+q,y,z]:[x,y,z+q];s.cyl([x,y,z],a,.1,L,'#d9c9a3',{cap:'#d9c9a3',seg:12});for(const [q,c] of[[-.22,'#6b3a1c'],[-.08,'#111'],[.06,'#d33a32'],[.22,'#c9a227']])s.cyl(o(q),a,.104,.05,c,{cap:c,seg:12});s.seg(o(-L/2-.2),o(-L/2),'#aeb4ba',2);s.seg(o(L/2),o(L/2+.2),'#aeb4ba',2)};
return{mint,bench,wire,magnet,coil,meter,bulb,compass,arrowOn,resistor,zf,WOOD,CU,CUD,STL,IRN,BRS}})();
const {mint:mintL,bench:bench6,wire:wire6,magnet:magnet6,coil:coil6,meter:meter6,bulb:bulb6,compass:compass6,arrowOn,resistor:resistor6}=K6;
const R6=window.PhysicaReal3D=window.PhysicaReal3D||{};
const reg6=(id,fn)=>{R6[id]=fn};

/* ----- Magnetism and Matter ----- */
const MAGF=q=>{const a=V.sub(q,[.8,0,0]),b=V.sub(q,[-.8,0,0]),ra=Math.max(.15,Math.hypot(...a)),rb=Math.max(.15,Math.hypot(...b));return V.sub(V.mul(a,1/ra**3),V.mul(b,1/rb**3))};
let magLines=null;
const magnetLines=()=>{if(magLines)return magLines;magLines=[];const N=[.8,0,0],S=[-.8,0,0];
  for(const [az,n] of[[Math.PI/2,5],[0,3]])for(const sg of[-1,1])for(let i=0;i<n;i++){const ang=sg*(.3+i*(az? .5:.8)),d=[Math.cos(ang),Math.sin(ang)*Math.cos(az),Math.sin(ang)*Math.sin(az)];let q=V.add(N,V.mul(d,.14));const pts=[q];for(let k=0;k<300;k++){const B=MAGF(q),m=Math.hypot(...B);q=V.add(q,V.mul(B,.06/m));pts.push(q);if(Math.hypot(...V.sub(q,S))<.2||Math.hypot(...q)>3.3)break}magLines.push({pts,az})}return magLines};
reg('magnet',(c,p,t)=>{const s=P3.scene(c,{scale:56,cy:262}),Y=-.2;s.box([0,Y-.03,0],[6.4,.06,4],'#f1ede0',{ground:true});s.box([0,Y-.14,0],[6.5,.16,4.1],K6.WOOD,{ground:true});
  for(const {pts,az} of magnetLines()){s.curve(pts,az?'#ffc36bdd':'#ffc36b66',az?1.7:1.2,14);arrowOn(s,pts,Math.floor(pts.length*.45),'#ffc36b',1.4)}
  // iron filings: short dark dashes along the field on the paper
  for(let i=0;i<260;i++){const x=-3+6*hash(i),z=-1.8+3.6*hash(i+500);if(Math.abs(z)<.28&&Math.abs(x)<.95)continue;const B=MAGF([x,0,z]),m=Math.hypot(B[0],B[2])||1,dx=B[0]/m*.07,dz=B[2]/m*.07;s.seg([x-dx,Y+.002,z-dz],[x+dx,Y+.002,z+dz],'#3a3a3acc',1.1,[],-4.55e5)}
  magnet6(s,[0,0,0],1.8,.4);s.shadow([0,0,0],.9,Y,.3);
  for(const [x,z] of[[2.4,0],[1.5,1.2],[0,1.4],[-1.5,1.2],[-2.4,0],[-1.4,-1.2],[1.4,-1.2],[0,-1.4]])compass6(s,[x,Y,z],MAGF([x,0,z]));
  mintL(s,[.45,.2,0],'north pole (red)',30,-60);mintL(s,[-.45,.2,0],'south pole',-30,-60);mintL(s,[2.45,Y+.15,0],'compass needle',40,40);
  s.render();tag(c,'field lines leave N, enter S; a compass needle (red = its north end) lines up with them',44,98,C.muted,13)});

/* ----- Electromagnetic Induction ----- */
reg('induction',(c,p,t)=>{const s=P3.scene(c,{scale:50,cy:272}),x=1.6*Math.sin(t*p.speed),v=1.6*p.speed*Math.cos(t*p.speed),emf=-v*p.turns*p.strength*Math.exp(-x*x*1.5),Y=-1.15;
  bench6(s,0,Y,7,2.8);for(const bx of[-.6,.6])s.box([bx,Y+.24,0],[.28,.48,.9],'#6d4a2a');
  coil6(s,[0,0,0],[1,0,0],.62,1.5,clamp(p.turns*1.4,5,24));
  magnet6(s,[x,0,0],1.9,.38);
  // leads from the coil ends to the galvanometer
  wire6(s,[[-.75,-.6,0],[-.9,Y+.05,.5],[1.5,Y+.05,.9],[2.0,Y+.3,.9]],'#d64541');wire6(s,[[.75,-.6,0],[.9,Y+.05,-.2],[2.2,Y+.05,.5],[2.4,Y+.3,.8]],'#2b2b2b');
  s.box([2.4,Y+.2,.9],[1.3,.4,.8],'#2f353b');meter6(s,[2.4,Y+.95,.9],.68,clamp(emf*.07,-1,1),{zero:true,txt:'G'});
  mintL(s,[0,.62,0],`coil (${p.turns} turns)`,-20,-70);mintL(s,[x+.7,.2,0],'bar magnet (N end red)',60,-70);mintL(s,[2.4,Y+1.7,.9],'galvanometer',30,-40);
  s.render();tag(c,Math.abs(emf)<.05?'magnet momentarily still in the coil: no EMF':'needle deflects: EMF while the flux changes (sign reverses on reversing motion)',44,98,C.muted,13)});

/* ----- Alternating Current ----- */
reg('ac',(c,p,t)=>{const s=P3.scene(c,{scale:42,cx:215,cy:262,yaw:.3}),a=TAU*p.frequency*t,Y=-1.35,h=.9,e=Math.abs(Math.sin(a));
  bench6(s,0,Y,6.2,4.4);
  // pole pieces: N on the left (red), S on the right (blue); field runs N -> S, along +x
  s.box([-2.35,0,0],[.9,1.7,1.9],'#d33a32');s.box([2.35,0,0],[.9,1.7,1.9],'#2d63c4');s.box([-2.35,Y+.25,0],[1.3,.5,2.2],'#3b4148');s.box([2.35,Y+.25,0],[1.3,.5,2.2],'#3b4148');s.engrave([-1.88,0,.96],'N','#fff',22);s.engrave([1.88,0,.96],'S','#fff',22);
  for(const y of[-.55,0,.55])for(const z of[-.5,.5])s.arrow([-1.75,y,z],[1.75,y,z],'#7baaff66',1.1,6);
  // shaft along z with two slip rings and a hand crank
  s.cyl([0,0,0],[0,0,1],.045,4.2,K6.STL);const A=(k)=>[Math.sin(a)*h*k,Math.cos(a)*h*k];
  const pts=[[1,1],[1,-1],[-1,-1],[-1,1]].map(([u,w])=>{const q=A(u);return[q[0],q[1],w*.82]});s.path([...pts,pts[0]],K6.CUD,7);s.path([...pts,pts[0]],'#e49a5a',4.2);
  for(const z of[1.45,1.78]){s.cyl([0,0,z],[0,0,1],.17,.12,K6.BRS,{cap:'#e6c35a',seg:16})}s.box([0,.3,1.45],[.1,.2,.16],'#1d1f22');s.box([0,.3,1.78],[.1,.2,.16],'#1d1f22');
  const ca=[Math.sin(a)*.55,Math.cos(a)*.55];s.cyl([0,0,-1.95],[0,0,1],.07,.6,K6.STL);s.seg([0,0,-2.2],[ca[0],ca[1],-2.2],'#9aa1a8',5);s.ball([ca[0],ca[1],-2.2],.12,'#3b4148');
  // lamp wired to the brushes
  wire6(s,[[0,.4,1.45],[0,.8,1.45],[-1.3,.8,1.9],[-1.3,Y+.35,1.9]],'#d64541');wire6(s,[[0,.4,1.78],[0,1,1.78],[-1.65,1,1.9],[-1.65,Y+.35,1.9]],'#2b2b2b');bulb6(s,[-1.5,Y,1.9],e);
  mintL(s,[0,.6,.1],'rotating coil',-30,-70);mintL(s,[0,.3,1.6],'slip rings + brushes',60,-50);mintL(s,[ca[0],ca[1],-2.2],'hand crank',-50,20);
  s.render();chart(c,430,96,226,150,{title:'V(t)',xl:'t',xmin:0,xmax:2/p.frequency,ymin:-p.voltage*1.1,ymax:p.voltage*1.1,series:[{fn:x=>p.voltage*Math.sin(TAU*p.frequency*x),col:C.gold}],marker:[cycle(t,2/p.frequency),p.voltage*Math.sin(a)]});tag(c,'EMF is zero when the coil faces the poles, maximum when it cuts the field',44,98,C.muted,13)});

/* ----- Moving Charges and Magnetism ----- */
reg('lorentz',(c,p,t)=>{const s=P3.scene(c,{scale:50,cy:270}),e=p.particle==='electron',m=e?9.11e-31:1.67e-27,r=m*p.speed*1e6/(1.6e-19*p.field*1e-3),rv=clamp(e?.5+r*700:.5+Math.log10(r*100+1)*1.1,.45,1.85),into=p.direction==='into',dir=(into?-1:1)*(e?-1:1),a=t*1.2*(e?1.3:.8),col=e?'#8fd8ff':'#ff9a8a';
  s.box([0,-2.35,0],[3.2,.22,3.2],'#2f353b');s.cyl([0,-2.15,0],[0,1,0],1.0,.2,'#1d2024');
  // Helmholtz pair of coils above and below the bulb (field along the vertical axis)
  for(const y of[-1.55,1.55]){s.cyl([0,y,0],[0,1,0],2.55,.5,'#cfe6f3',{alpha:.1,caps:false});s.helix([0,y,0],[0,1,0],2.55,.5,5,K6.CUD,5.5);s.helix([0,y,0],[0,1,0],2.55,.5,5,'#e49a5a',3.2)}
  s.mesh([0,0,0],2.05,'#bfe3ff',{alpha:.1,rings:10,segs:18,spec:.9});
  for(const [x,z] of[[-1.3,-1.3],[1.3,-1.3],[0,0],[-1.3,1.3],[1.3,1.3]])s.arrow([x,into?1.3:-1.3,z],[x,into?-1.3:1.3,z],'#9cc2ffcc',1.4,7,x===1.3&&z===1.3?`B = ${p.field} mT (${into?'down, into the page':'up, out of the page'})`:'');
  s.ring([0,0,0],[0,1,0],rv,col+'33',9);s.ring([0,0,0],[0,1,0],rv,col+'cc',2.6);
  const ang=a*dir,pos=[rv*Math.cos(ang),0,rv*Math.sin(ang)],vh=V.norm([-Math.sin(ang)*dir,0,Math.cos(ang)*dir]);s.ball(pos,.16,col,{glow:true});
  s.arrow(pos,V.add(pos,V.mul(vh,.75)),C.gold,2.6,10);s.arrow(pos,V.add(pos,V.mul(V.norm(pos),-.75)),C.mint,3,10);s.callout(V.add(pos,V.mul(V.norm(pos),-.4)),`F = qvB = ${f(1.6e-19*p.speed*1e6*p.field*1e-3,3)} N`,C.mint,-40,60,11);s.callout(V.add(pos,V.mul(vh,.5)),'v',C.gold,30,-30,11);
  mintL(s,[1.55,1.55,0],'Helmholtz coil',60,-40);mintL(s,[-1.45,-.8,.8],'evacuated glass bulb',-50,50);
  s.render();tag(c,e?'electron beam: small, fast circle (F ⟂ v, so no work is done)':'proton: far larger radius (drawn compressed)',44,98,C.muted,13)});
reg('parallel-wires',(c,p,t)=>{const s=P3.scene(c,{scale:52,cy:268}),g=.6+p.distance*3,Y=-1.7,ys=[g/2,-g/2],Is=[p.current1,p.current2],att=p.current1*p.current2>0;
  bench6(s,0,Y,6.6,2.6);for(const x of[-2.55,2.55]){s.box([x,(Y+1.2)/2,0],[.34,1.2-Y,.5],'#6d4a2a');s.box([x,1.02,0],[.5,.14,.7],'#3b4148')}
  Is.forEach((I,k)=>{const y=ys[k];s.cyl([0,y,0],[1,0,0],.055,5.1,K6.CU);s.cyl([0,y,0],[1,0,0],.05,5.1,'#e4a370',{caps:false});if(I!==0){for(let j=0;j<8;j++){const x=-2.4+cycle(j*.6+t*.7*Math.sign(I),4.8);s.ball([x,y+.1,0],.045,'#fff3c4',{flat:true,glow:true})}
    const lab=k?'I₂':'I₁';s.arrow([-1.9*Math.sign(I),y+(k?-.32:.32),.5],[1.9*Math.sign(I),y+(k?-.32:.32),.5],C.gold,2.6,9);
    for(const x of[-1.1,1.1])for(let q=0;q<3;q++){const th=.9+q*2.1,r=.38+.08*Math.min(3,Math.abs(I)/4),d=Math.sign(I),th2=th+d*.45;s.arrow([x,y+r*Math.cos(th),r*Math.sin(th)],[x,y+r*Math.cos(th2),r*Math.sin(th2)],'#7baaff',1.5,6)}
    s.ring([-1.1,y,0],[1,0,0],.38+.08*Math.min(3,Math.abs(I)/4),'#7baaff66',1.3);s.ring([1.1,y,0],[1,0,0],.38+.08*Math.min(3,Math.abs(I)/4),'#7baaff66',1.3)}});
  mintL(s,[2.2,ys[0],0],`wire 1: I₁ = ${p.current1} A`,45,-40);mintL(s,[2.2,ys[1],0],`wire 2: I₂ = ${p.current2} A`,45,40);
  if(p.current2!==0&&p.current1!==0){const F=clamp(Math.abs(p.current1*p.current2)/120,.2,.9),FL=`F/L = ${f(2e-7*Math.abs(p.current1*p.current2)/p.distance,3)} N/m`;s.arrow([-.6,ys[0],.15],[-.6,ys[0]+(att?-F:F),.15],C.red,4,11);s.callout([-.6,ys[0]+(att?-F:F)/2,.15],FL,C.red,-70,-50,12);s.arrow([0,ys[1],.15],[0,ys[1]+(att?F:-F),.15],C.red,4,11,'')}
  s.render();tag(c,p.current2===0||p.current1===0?'one wire carries no current: no force':att?'currents in the same direction attract':'currents in opposite directions repel',44,98,C.gold,14)});
reg('motional-emf',(c,p,t)=>{const s=P3.scene(c,{scale:62,cy:300}),L=.8+p.length*2,x=-1.8+cycle(t*p.speed*.4,3.8),emf=p.field*p.length*p.speed,I=emf/p.resistance,Y=-.3;
  bench6(s,-.2,Y-.14,6.4,L+1.4,'#2e353c');
  // two aluminium rails, a cross-bar carrying the resistor, and the sliding copper rod
  for(const z of[-L/2,L/2])s.box([.1,Y+.05,z],[5.2,.1,.12],'#cfd4d9');s.box([-2.5,Y+.05,0],[.14,.1,L+.14],'#cfd4d9');
  for(const j of[-1,0,1])for(let i=0;i<6;i++){const X=-2+i*.85,Z=j*L*.32;s.arrow([X,1.25,Z],[X,.35,Z],'#7baaff88',1.1,6,i===5&&j===1?`B = ${p.field} T (into the board)`:'')}
  resistor6(s,[-2.5,Y+.2,0],'z',Math.min(L*.6,1));
  s.cyl([x,Y+.17,0],[0,0,1],.07,L+.5,K6.CU);s.cyl([x,Y+.17,0],[0,0,1],.06,L+.5,'#e4a370',{caps:false});for(const z of[-1,1])s.box([x,Y+.17,z*(L/2+.34)],[.2,.2,.2],'#2b2e33');
  s.arrow([x,Y+.55,L/2+.45],[x+.8,Y+.55,L/2+.45],C.gold,3.2,11,`v = ${p.speed} m/s`);
  flow(s,[[x,-L/2],[-2.5,-L/2],[-2.5,L/2],[x,L/2]],I,t,C.mint,9);
  mintL(s,[-2.5,Y+.35,0],`resistor R = ${p.resistance} Ω`,-20,-60);mintL(s,[x,Y+.3,-L/2-.1],'sliding rod',0,-60);mintL(s,[0,Y+.12,-L/2],'rails',20,-45);
  s.render();tag(c,`ε = BLv = ${f(emf,2)} V  ·  I = ${f(I,2)} A (green dots: induced current)`,44,98,C.gold,14)});
reg('solenoid',(c,p,t)=>{const s=P3.scene(c,{scale:46,cy:250}),L=1.8+p.length*2.2,B=mu0*p.turns*p.current/p.length,Y=-1.15,al=Math.round(clamp(B*1000/5,.3,1)*200).toString(16).padStart(2,'0');
  bench6(s,0,Y,7,2.8);for(const bx of[-L*.35,L*.35])s.box([bx,Y+.22,0],[.3,.44,.9],'#6d4a2a');
  s.cyl([0,0,0],[1,0,0],.58,L+.3,'#e6d9b8',{alpha:.35,caps:false,seg:20});coil6(s,[0,0,0],[1,0,0],.62,L,clamp(p.turns/22,8,26),{former:false,w:3});
  const E=L/2+.35;for(const pl of[0,1])for(const sg of[-1,1])for(const H of[.9,1.6]){const pts=[];for(let i=0;i<=40;i++){const th=Math.PI*i/40,u=E*Math.cos(th),w=sg*(.25+H*Math.sin(th));pts.push(pl?[u,0,w]:[u,w,0])}s.path(pts,'#7baaff'+al,1.5);s.arrow(pts[19],pts[22],'#7baaff',1.5,7)}
  for(const y0 of[-.3,0,.3])for(const z0 of[-.2,.2])if(y0!==0||z0>0)s.arrow([-E,y0,z0],[E,y0,z0],'#8fc0ffcc',1.7,8,y0===.3&&z0===.2?`B = ${f(B*1000,2)} mT`:'');
  for(let i=0;i<6;i++){const a=TAU*i/6+t*2;s.ball([-L/2+cycle(t*.4+i*.17,1)*L,.62*Math.cos(a),.62*Math.sin(a)],.04,C.gold,{flat:true})}
  s.box([L/2+1.6,Y+.3,.9],[1.4,.6,.8],'#2f353b');s.engrave([L/2+1.6,Y+.55,1.31],'DC supply','#cfd4d9',10);s.ball([L/2+1.1,Y+.62,1.31],.07,'#d33a32',{flat:true});s.ball([L/2+1.45,Y+.62,1.31],.07,'#222',{flat:true});
  wire6(s,[[-L/2,-.6,0],[-L/2-.4,Y+.05,.3],[L/2+1.1,Y+.05,1.1],[L/2+1.1,Y+.65,1.3]],'#d64541');wire6(s,[[L/2,-.6,0],[L/2+.3,Y+.05,.1],[L/2+1.45,Y+.05,1.3],[L/2+1.45,Y+.65,1.3]],'#2b2b2b');
  compass6(s,[-L/2-1.0,Y+.02,.2],[1,0,0]);mintL(s,[-L/2-1.0,Y+.2,.2],'compass lines up with B',-20,60);mintL(s,[0,.6,0],`${p.turns} turns of insulated copper wire`,-10,-70);
  s.render();tag(c,`B ≈ μ₀nI = ${f(B*1000,2)} mT, uniform inside, weak outside`,44,98,C.gold,15)});

reg('force-on-wire',(c,p,t)=>{const s=P3.scene(c,{scale:48,cy:262,yaw:.1}),F=p.field*p.current*p.length,L=.6+p.length*2,Y=-1.9,fd=-Math.sign(F),sh=fd*clamp(Math.abs(F)*.08,0,.7)*(.5+.5*Math.sin(t*2)),z0=-.1+sh,sg=Math.sign(p.current)||1;
  bench6(s,0,Y,6.4,3.6);
  // C-shaped iron yoke with painted pole pieces: N on top, S below, field runs downwards through the gap
  s.box([0,-.2,-1.05],[2.8,3.4,.45],'#4a5159');s.box([0,1.05,-.1],[2.8,.5,1.9],'#d33a32');s.box([0,-1.05,-.1],[2.8,.5,1.9],'#2d63c4');
  s.engrave([0,1.31,-.1],'N','#fff',22);s.engrave([0,-.79,.62],'S','#fff',18);
  for(let i=0;i<4;i++)s.arrow([-.9+i*.6,.72,.5],[-.9+i*.6,-.72,.5],'#9cc2ffcc',1.4,7,i===3?`B = ${p.field} T`:'');
  s.cyl([0,0,z0],[1,0,0],.055,L+1.2,K6.CU);s.cyl([0,0,z0],[1,0,0],.05,L+1.2,'#e4a370',{caps:false});
  s.box([1.1,Y+.28,1.35],[1.5,.56,.8],'#2f353b');s.engrave([1.1,Y+.42,1.76],'DC supply','#cfd4d9',10);
  wire6(s,[[-(L/2+.6),0,z0],[-(L/2+.6),-.9,.9],[.6,Y+.1,1.4],[.6,Y+.6,1.4]],'#d64541');wire6(s,[[L/2+.6,0,z0],[L/2+.6,-1.1,.7],[1.6,Y+.1,1.4],[1.6,Y+.6,1.4]],'#2b2b2b');
  if(p.current!==0){s.arrow([-sg*L/2,.22,z0],[sg*L/2,.22,z0],C.gold,3,10,`I = ${Math.abs(p.current)} A`);s.arrow([0,0,z0],[0,0,z0+fd*clamp(Math.abs(F)*.18,.25,1.2)],C.red,4.5,12);s.callout([0,0,z0+fd*.5],`F = BIL = ${f(Math.abs(F),2)} N`,C.red,60,fd>0?40:-50,12)}
  mintL(s,[0,1.3,-.1],'N pole',-60,-30);mintL(s,[-1.3,-1.05,.4],'S pole',-60,30);mintL(s,[1.35,-.2,-1.05],'iron yoke',60,0);
  s.render();tag(c,'F = I L × B: the wire is pushed sideways, out of the plane of I and B',44,98,C.muted,13)});
reg('eddy-brake',(c,p,t)=>{const s=P3.scene(c,{scale:50,cy:272}),tt=cycle(t,12),w=p.speed*Math.exp(-p.drag*tt/p.inertia),ang=p.speed*p.inertia/p.drag*(1-Math.exp(-p.drag*tt/p.inertia)),Y=-1.5,k=w/p.speed,zz=K6.zf(s,[0,.27,0])+.08;
  bench6(s,0,Y,6.6,3.8);s.cyl([0,Y+.15,0],[0,1,0],.7,.3,'#3b4148',{seg:20});s.cyl([0,(Y+.2)/2,0],[0,1,0],.09,.2-Y,K6.STL,{seg:10});
  s.cyl([0,.14,0],[0,1,0],1.7,.13,'#aab1b8',{cap:'#d3d8dd',seg:40});s.cyl([0,.22,0],[0,1,0],.2,.1,'#5d656c',{seg:14});
  const P=(r,a)=>[r*Math.cos(a),.272,-r*Math.sin(a)];for(let i=0;i<6;i++){const a=ang+TAU*i/6;s.seg(P(.25,a),P(1.55,a),'#7e868e',2,[],zz)}for(const r of[.6,1.1,1.6])s.path(Array.from({length:49},(_,i)=>P(r,TAU*i/48)),'#8a929a88',1,[],zz);
  s.ball(P(1.35,ang),.09,'#ff7a2f',{flat:true,lift:.1});
  // C-shaped permanent magnet straddling the rim: N above the disc, S below
  s.box([2.0,.16,0],[.3,2.35,.7],'#4a5159');s.box([1.5,1.2,0],[1.3,.22,.7],'#4a5159');s.box([1.5,-.9,0],[1.3,.22,.7],'#4a5159');s.box([1.15,.76,0],[.8,.7,.7],'#d33a32');s.box([1.15,-.45,0],[.8,.7,.7],'#2d63c4');s.engrave([1.15,1.115,0],'N','#fff',16);s.box([2,(Y-1.02)/2,0],[.3,-1.02-Y,.7],'#4a5159');
  // eddy currents: two loops either side of the pole; the strands under the pole flow the same way (-x)
  const al=Math.round(clamp(k,.15,1)*255).toString(16).padStart(2,'0');for(const [cz,dr] of[[-.95,1],[.95,-1]]){const pts=Array.from({length:37},(_,i)=>{const th=TAU*i/36*dr;return[1.15+.45*Math.cos(th),.275,cz+.4*Math.sin(th)]});s.path(pts,'#ffc36b'+al,2.6,[],zz+.02);s.arrow(pts[3],pts[5],'#ffc36b'+al,2.6,9)}
  s.arrow([1.15,.3,0],[1.15,.3,.95*Math.max(.3,k)+.2],C.red,4,11);s.arrow([-1.2,.3,-1.2],[-1.9,.3,-.5],C.gold,2.6,9);
  mintL(s,[-.5,.28,1.3],'aluminium disc',-60,40);mintL(s,[1.15,.6,0],'magnet: N above, S below',60,-60);mintL(s,[1.15,.28,-.95],'eddy currents',60,-40);s.callout([1.15,.3,.95*Math.max(.3,k)+.2],'braking force (opposes motion)',C.red,50,40,11);
  s.render();tag(c,`ω = ${f(w,2)} rad/s  (slowing: eddy-current drag ∝ ω)`,44,98,C.gold,15)});
reg('cyclotron-frequency',(c,p,t)=>{const s=P3.scene(c,{scale:46,cy:262,pitch:.12}),e=p.particle==='electron',fr=1.6e-19*p.field/(TAU*(e?9.11e-31:1.67e-27)),R=2.1,g=.08,H=.28,y0=0;
  // upper pole cap of the electromagnet (translucent so the dees show), lower cap below
  s.cyl([0,.95,0],[0,1,0],2.6,.5,'#9aa1a8',{alpha:.18,cap:'#b9bfc5',seg:36});s.cyl([0,-.95,0],[0,1,0],2.6,.5,'#6a7178',{seg:36,cap:'#8d949a'});mintL(s,[2.4,-.95,0],'electromagnet pole pieces',50,40);
  for(const sd of[1,-1]){const arc=[];for(let i=0;i<=24;i++){const th=-Math.PI/2+Math.PI*i/24;arc.push([sd*(g+R*Math.cos(th)),0,R*Math.sin(th)])}
    const top=arc.map(q=>[q[0],H/2,q[2]]),bot=arc.map(q=>[q[0],-H/2,q[2]]);s.poly(bot,'#d98a4b',{normal:[0,-1,0],alpha:.55});
    for(let i=0;i<24;i++){const mid=-Math.PI/2+Math.PI*(i+.5)/24;s.poly([bot[i],bot[i+1],top[i+1],top[i]],'#d98a4b',{normal:[sd*Math.cos(mid),0,Math.sin(mid)],alpha:.7})}
    s.poly([bot[0],bot[24],top[24],top[0]],'#d98a4b',{normal:[-sd,0,0],alpha:.7});s.poly(top,'#e49a5a',{normal:[0,1,0],alpha:.5})}
  const k0=Math.floor(cycle(t*.3,1)*200),ph=-Math.sin(k0*.12);for(const z of[-1.2,0,1.2])s.arrow([-ph*.35,H*.6,z],[ph*.35,H*.6,z],C.gold,2.2,8);
  const pts=[];for(let i=0;i<=200;i++){const a=i*.12,r=.1+i*.0095;pts.push([r*Math.cos(a),0,r*Math.sin(a)])}s.path(pts,'#7be0ff88',2,[],8);s.ball(pts[k0],.11,e?'#8fd8ff':'#ff9a8a',{glow:true,lift:3});
  for(const [x,z] of[[-1.5,-1.2],[1.5,-1.2],[0,1.5],[-1.5,1.2],[1.5,1.2]])s.arrow([x,-.55,z],[x,.7,z],'#9cc2ffaa',1.4,7,x===1.5&&z===1.2?`B = ${p.field} T`:'');
  s.box([0,-1.65,-2.6],[1.6,.6,.7],'#2f353b');s.engrave([0,-1.5,-2.24],'RF oscillator','#cfd4d9',9);wire6(s,[[-.6,-1.6,-2.3],[-2.2,-.3,-1.6],[-g-.5,-.1,-.5]],'#d64541');wire6(s,[[.6,-1.6,-2.3],[2.2,-.3,-1.6],[g+.5,-.1,-.5]],'#2b2b2b');
  mintL(s,[1.4,H/2,1.2],'D-shaped electrodes (dees)',55,50);
  s.render();tag(c,`f = qB/2πm = ${f(fr/1e6,2)} MHz (same on every turn)`,44,98,C.gold,14)});
reg('helical-particle',(c,p,t)=>{const s=P3.scene(c,{scale:46,cy:268,yaw:.1}),th=rad(p.angle),r=.2+1.1*Math.sin(th),pitch=.15+1.8*Math.cos(th),turns=3.2/Math.max(pitch,.15),Rc=1.75;
  s.cyl([0,0,0],[1,0,0],Rc,6.4,'#cfe6f3',{alpha:.1,caps:false,seg:20});s.helix([0,0,0],[1,0,0],Rc,6.4,12,K6.CUD,5);s.helix([0,0,0],[1,0,0],Rc,6.4,12,'#e49a5a',3);
  for(const [y,z] of[[-.9,0],[0,.9],[.9,0],[0,-.9]])s.arrow([-3.5,y,z],[3.5,y,z],'#9cc2ff77',1.2,7);s.callout([3.4,.9,0],`B = ${p.field} T`,'#9cc2ff',20,-60,12);
  const pts=[];for(let i=0;i<=200;i++){const u=i/200,a=TAU*turns*u;pts.push([-3+pitch*turns*u*Math.min(1,6/(pitch*turns)),r*Math.cos(a),r*Math.sin(a)])}s.curve(pts,'#ffc36bcc',2.4,10);
  const k=Math.min(198,Math.floor(cycle(t*.15,1)*199)),q=pts[k],d=V.norm(V.sub(pts[k+1],q)),par=[d[0],0,0],perp=V.sub(d,par);s.ball(q,.12,'#ffd27a',{glow:true,lift:3});
  s.arrow(q,V.add(q,V.mul(d,.9)),C.gold,2.6,10);s.arrow(q,V.add(q,V.mul(par,.9)),C.mint,2.2,9);s.arrow(q,V.add(q,V.mul(perp,.9)),C.red,2.2,9);
  s.callout(V.add(q,V.mul(d,.9)),'v',C.gold,25,-35,12);s.callout(V.add(q,V.mul(par,.9)),'v ∥ B (steady drift)',C.mint,30,40,11);s.callout(V.add(q,V.mul(perp,.9)),'v ⟂ B (circling)',C.red,-30,-45,11);
  s.render();tag(c,'v ∥ B sets the pitch, v ⟂ B sets the radius: the path is a helix',44,98,C.muted,13)});
reg('velocity-selector',(c,p,t)=>{const s=P3.scene(c,{scale:52,cy:268}),v0=p.electric/(p.field*1e-3),v=p.speed*1e5,dev=(v-v0)/v0,q=cycle(t*.4,1),x=-3+6*q,yy=u=>clamp(-dev*1.6*u*u,-.95,.95),y=yy(q),Y=-1.7;
  bench6(s,0,Y,7.4,2.8);
  for(const sgn of[1,-1])s.box([0,sgn*1.1,0],[4.8,.1,1.6],'#aeb5bc');
  s.box([0,Y+.3,0],[.5,.6,.5],'#3b4148');mintL(s,[1.6,1.1,.7],'top plate (−)',40,-35);mintL(s,[1.6,-1.1,.7],'bottom plate (+)',40,35);
  // entry and exit slits
  for(const xs of[-2.9,2.9]){s.box([xs,.62,0],[.12,.95,1.6],'#6a7178');s.box([xs,-.62,0],[.12,.95,1.6],'#6a7178')}
  wire6(s,[[0,1.15,.5],[0,1.6,.5],[-3.4,1.6,.5],[-3.4,Y+.1,.9]],'#2b2b2b');wire6(s,[[0,-1.15,.5],[0,-1.5,.5],[-3.3,-1.5,.5],[-3.3,Y+.1,.9]],'#d64541');
  for(let i=0;i<5;i++)for(let j=0;j<2;j++)s.arrow([-1.9+i*.95,-.12+j*.4-.1,-.5],[-1.9+i*.95,-.12+j*.4-.1,.55],'#9cc2ffcc',1.3,7,i===4&&j===1?`B = ${p.field} mT (towards you)`:'');
  s.arrow([-2.2,-.9,.7],[-2.2,.9,.7],'#ffc36b',2.6,9);s.callout([-2.2,.5,.7],`E = ${p.electric} N/C`,'#ffc36b',-40,-30,11);
  s.path(Array.from({length:21},(_,i)=>{const u=i/20;return[-3+6*u,yy(u),0]}),'#ffc36b88',1.5,[4,4]);
  const Fe=.5,Fm=clamp(.5*v/v0,.1,1.1);s.ball([x,y,0],.12,'#ff9a8a',{glow:true,lift:3});if(q<.97){s.arrow([x,y,0],[x,y+Fe,0],'#7baaff',2.4,9);s.arrow([x,y,0],[x,y-Fm,0],C.red,2.4,9);s.callout([x,y+Fe,0],'qE',C.blue,20,-25,10);s.callout([x,y-Fm,0],'qvB',C.red,20,25,10)}
  mintL(s,[-2.9,.8,0],'entry slit',-40,-35);mintL(s,[2.9,-.8,0],'exit slit',40,35);mintL(s,[1.7,1.15,.6],'+ve charge, E upward',20,-40);
  s.render();tag(c,Math.abs(dev)<.02?'v = E/B: forces cancel, passes straight through':v>v0?'too fast: qvB (down) beats qE, ion bends down':'too slow: qE (up) beats qvB, ion bends up',44,98,Math.abs(dev)<.02?C.mint:C.gold,14)});

reg('earth-field',(c,p,t)=>{const s=P3.scene(c,{scale:48,cy:288}),I=rad(p.inclination),B=p.field/40,O=[-.3,2.45,0],Y=-.1,u=[Math.cos(I),-Math.sin(I),0],K=1.25;
  s.box([0,Y-.14,0],[6.8,.28,3.6],'#5b7f4a',{ground:true});s.poly([[1.5,Y+.01,-.22],[2.5,Y+.01,-.22],[2.5,Y+.01,-.45],[3.1,Y+.01,0],[2.5,Y+.01,.45],[2.5,Y+.01,.22],[1.5,Y+.01,.22]],'#ece8d8',{normal:[0,1,0],z:-4.99e5});s.label([3.3,Y+.25,0],'N','#ffd27a',15);
  s.poly([[-3.2,Y,0],[3.4,Y,0],[3.4,3.4,0],[-3.2,3.4,0]],'#7baaff',{normal:[0,0,1],alpha:.07,z:-1e4,stroke:'#7baaff44'});
  // dip circle (a compass needle free to swing in the vertical meridian plane)
  const D=[-2.4,1.0,0],fz=K6.zf(s,[D[0],D[1],.03])+.06;s.box([D[0],Y+.12,0],[1.2,.2,.8],'#3b4148');s.cyl([D[0],(Y+D[1])/2-.2,0],[0,1,0],.06,D[1]-Y-.5,K6.STL,{seg:8});
  s.cyl(D,[0,0,1],.85,.07,'#b8902c',{cap:'#f3f0e4',seg:30});for(let i=0;i<24;i++){const a=TAU*i/24;s.seg([D[0]+Math.cos(a)*.62,D[1]+Math.sin(a)*.62,.04],[D[0]+Math.cos(a)*(i%3?.7:.76),D[1]+Math.sin(a)*(i%3?.7:.76),.04],'#2b2f34',1,[],fz)}
  s.seg([D[0]-.7,D[1],.04],[D[0]+.7,D[1],.04],'#8a929a',1,[1,3],fz);s.seg(D.map((v,i)=>i===2?.04:v),[D[0]+u[0]*.62,D[1]+u[1]*.62,.05],'#e0372f',4,[],fz+.02);s.seg(D.map((v,i)=>i===2?.04:v),[D[0]-u[0]*.62,D[1]-u[1]*.62,.05],'#dfe6ee',4,[],fz+.02);s.ball([D[0],D[1],.05],.05,'#222',{flat:true,lift:.1});
  mintL(s,[D[0],D[1]+.85,0],'dip circle',-30,-40);
  // the components of the Earth's field
  const tip=V.add(O,V.mul(u,1.6*B*K)),corner=[tip[0],O[1],0];s.arrow(O,tip,C.gold,4,12);s.arrow(O,corner,C.mint,3,11);s.arrow(corner,tip,C.blue,3,11);
  s.seg(tip,[tip[0],Y,0],'#ffffff44',1,[3,4]);const arc=Array.from({length:16},(_,i)=>{const a=-I*i/15;return[O[0]+.8*Math.cos(a),O[1]+.8*Math.sin(a),0]});s.path(arc,'#ffd27a',1.6);
  s.callout(V.add(O,V.mul(u,.9*B*K)),`B = ${p.field} µT`,C.gold,-20,-55,12);s.callout([(O[0]+corner[0])/2,O[1],0],`B_H = ${f(p.field*Math.cos(I),1)} µT`,C.mint,10,-40,12);s.callout([corner[0],(corner[1]+tip[1])/2,0],`B_V = ${f(p.field*Math.sin(I),1)} µT`,C.blue,45,0,12);s.callout(arc[10],`dip δ = ${p.inclination}°`,'#ffd27a',-65,-25,11);
  s.render();tag(c,'the dip needle points along B: horizontal part B_H = B cos δ, vertical part B_V = B sin δ',44,98,C.muted,13)});
reg('magnetic-materials',(c,p,t)=>{const s=P3.scene(c,{scale:50,cy:268}),kind=p.kind,pull={dia:-.45,para:.2,ferro:.9}[kind]||0,Y=-1.5,nm={dia:'bismuth rod (diamagnetic)',para:'aluminium rod (paramagnetic)',ferro:'iron rod (ferromagnetic)'}[kind],rc={dia:'#c7a98c',para:'#c6ccd2',ferro:'#7d848b'}[kind];
  bench6(s,0,Y,7.6,3.4);s.box([0,Y+.2,-1.3],[6.4,.4,.5],'#4a5159');
  s.box([-3.1,0,0],[.9,1.8,2],'#d33a32');s.box([3.1,0,0],[.9,1.8,2],'#2d63c4');s.box([-3.1,Y/2-.1,-1.3],[.9,-Y-.4,.5],'#4a5159');s.box([3.1,Y/2-.1,-1.3],[.9,-Y-.4,.5],'#4a5159');s.engrave([-2.64,.3,0],'N','#fff',22);s.engrave([2.64,.3,0],'S','#fff',22);
  for(const y of[-.5,0,.5])for(let i=0;i<7;i++){const z=-1.5+i*.5;const pts=[];for(let j=0;j<=24;j++){const x=-2.6+5.2*j/24,bend=Math.exp(-(x*x)/.9)*pull;pts.push([x,y*(1-bend*.7),z*(1-bend)])}s.path(pts,'#9cc2ff'+(y===0?'bb':'66'),1.4);if(y===0)s.arrow(pts[3],pts[5],'#9cc2ff',1.4,7)}
  s.cyl([0,0,0],[1,0,0],.5,1.9,rc,{cap:rc,seg:20});s.seg([-.7,.5,0],[-.7,1.55,0],'#e9e5d6',1.2);s.seg([.7,.5,0],[.7,1.55,0],'#e9e5d6',1.2);s.box([0,1.6,0],[1.8,.08,.1],K6.STL);
  for(let i=0;i<6;i++){const x=-.55+i*.22,a=kind==='ferro'?0:kind==='para'?(hash(i)-.5)*1.4:PI+(hash(i)-.5)*.3;s.arrow([x-.1*Math.cos(a),.95,.45+.04*i*0],[x+.1*Math.cos(a),.95+.1*Math.sin(a),.45],kind==='dia'?'#ff857e':'#ffc36b',2.4,6)}
  mintL(s,[0,0,.5],nm,-20,60);mintL(s,[0,.95,.45],'atomic dipoles',-70,-45);
  s.render();tag(c,kind==='dia'?'diamagnetic: field lines pushed out, rod is repelled':kind==='para'?'paramagnetic: lines drawn in slightly, weak attraction':'ferromagnetic: lines strongly concentrated, strong attraction',44,98,C.gold,14)});
reg('mutual-induction',(c,p,t)=>{const s=P3.scene(c,{scale:46,cy:268}),emf=-p.mutual*1e-3*p.rate,Y=-1.1,on=p.rate!==0,al=on?'cc':'33';
  bench6(s,0,Y,7.6,3);for(const x of[-1.5,1.5])s.box([x,Y+.2,0],[1.1,.4,.9],'#6d4a2a');
  coil6(s,[-1.7,.1,0],[1,0,0],.58,1.5,10,{w:3});coil6(s,[1.7,.1,0],[1,0,0],.62,1.5,12,{w:3});
  for(let j=-1;j<=1;j++)s.arrow([-2.7,.1+j*.28,.2*j],[2.9,.1+j*.28,.2*j],'#9cc2ff'+al,1.5,8,j===1&&on?'changing B':'');
  s.box([-3.1,Y+.25,1.1],[1.5,.5,.7],'#2f353b');s.engrave([-3.1,Y+.4,1.46],'battery + rheostat','#cfd4d9',9);wire6(s,[[-2.45,-.5,0],[-2.8,Y+.05,.5],[-3.4,Y+.55,1.1]],'#d64541');wire6(s,[[-.95,-.5,0],[-1.0,Y+.05,.9],[-2.6,Y+.05,1.2],[-2.7,Y+.55,1.1]],'#2b2b2b');
  s.box([3.4,Y+.2,.9],[1.2,.4,.7],'#2f353b');meter6(s,[3.4,Y+.9,.9],.62,clamp(emf*1.7,-1,1),{zero:true,txt:'G'});wire6(s,[[2.45,-.5,0],[2.7,Y+.05,.3],[3.1,Y+.3,.8]],'#d64541');wire6(s,[[.95,-.5,0],[1.1,Y+.05,.9],[3.7,Y+.05,.8],[3.7,Y+.3,.8]],'#2b2b2b');
  mintL(s,[-1.7,.7,0],'primary coil',-10,-70);mintL(s,[1.7,.75,0],'secondary coil',10,-70);mintL(s,[3.4,Y+1.55,.9],'galvanometer',20,-40);
  s.render();tag(c,`ε₂ = −M dI₁/dt = ${f(emf,3)} V  (dI₁/dt = ${p.rate} A/s)`,44,98,C.gold,15)});
reg('transformer',(c,p,t)=>{const s=P3.scene(c,{scale:46,cy:262,yaw:.1}),Vs=p.voltage*p.secondary/p.primary,Y=-1.65,bl=clamp(Vs/220,0,1),LAM='#6b7480';
  bench6(s,0,Y,8,3);
  for(const [x,w,h,y] of[[-1.4,.5,3,0],[1.4,.5,3,0]])s.box([x,y,0],[w,h,.6],LAM);s.box([0,1.25,0],[3.3,.5,.6],LAM);s.box([0,-1.25,0],[3.3,.5,.6],LAM);
  for(let i=0;i<14;i++){const y=-1.45+i*.22;s.seg([-1.65,y,.301],[1.65,y,.301],'#3b424a88',1,[],K6.zf(s,[0,y,.31])+.05)}
  s.box([0,-1.55,0],[3.5,.1,.9],'#3b4148');
  K6.coil(s,[-1.4,.0,0],[0,1,0],.45,1.6,clamp(p.primary/45,5,22),{w:3});K6.coil(s,[1.4,.0,0],[0,1,0],.45,1.6,clamp(p.secondary/45,5,22),{w:3});
  for(let i=0;i<8;i++){const q=cycle(t*.5+i/8,1),path=[[-1.4,-1.25,.36],[-1.4,1.25,.36],[1.4,1.25,.36],[1.4,-1.25,.36],[-1.4,-1.25,.36]];s.ball(along(path,q),.05,'#7baaff',{flat:true,glow:true})}
  s.box([-3.5,Y+.25,.6],[1.1,.5,.8],'#2f353b');s.engrave([-3.5,Y+.35,1.01],'~ AC','#ffd27a',13);wire6(s,[[-1.4,.8,0],[-2.4,.8,.5],[-3.2,.6,.6],[-3.2,Y+.5,.6]],'#d64541');wire6(s,[[-1.4,-.8,0],[-2.3,-.9,.6],[-3.8,-.9,.6],[-3.8,Y+.5,.6]],'#2b2b2b');
  wire6(s,[[1.4,.8,0],[2.4,.7,.5],[3.3,.3,.7],[3.3,Y+.4,.6]],'#d64541');wire6(s,[[1.4,-.8,0],[2.3,-.9,.6],[3.8,-.9,.6],[3.8,Y+.1,.6]],'#2b2b2b');bulb6(s,[3.5,Y,.6],bl);
  mintL(s,[-1.4,1.3,.3],`primary: ${p.primary} turns`,-40,-60);mintL(s,[1.4,1.3,.3],`secondary: ${p.secondary} turns`,40,-60);mintL(s,[0,1.25,.3],'laminated iron core',0,-80);
  s.render();tag(c,`Vs = ${f(Vs,1)} V (${Vs>p.voltage?'step-up':'step-down'})  ·  Vs/Vp = Ns/Np`,44,98,C.gold,15)});
reg('dipole-field-ratio',(c,p,t)=>{const s=P3.scene(c,{scale:60,cy:262}),r=.8+p.distance*1.2,Y=-.2;s.box([0,Y-.03,0],[6.8,.06,4.2],'#f1ede0',{ground:true});s.box([0,Y-.14,0],[6.9,.16,4.3],K6.WOOD,{ground:true});
  const ax=[r,0,0],eq=[0,0,r],Ba=2*p.moment/p.distance**3,Be=p.moment/p.distance**3,k2=.8/Math.max(Ba,1e-9);
  for(const {pts,az} of magnetLines())if(az)s.curve(pts,'#ffc36b66',1.3,14);
  magnet6(s,[0,0,0],1.8,.46);s.seg([0,Y+.003,0],[r,Y+.003,0],'#2b2f34',1.4,[4,3],-4.5e5);s.seg([0,Y+.003,0],[0,Y+.003,r],'#2b2f34',1.4,[4,3],-4.5e5);
  compass6(s,[r,Y,0],[1,0,0]);compass6(s,[0,Y,r],[-1,0,0]);
  s.arrow([r,.15,0],[r+Ba*k2,.15,0],C.gold,4,11,`B_axial = ${f(Ba*.1,3)} µT`);s.arrow([0,.15,r],[-Be*k2,.15,r],C.mint,4,11,`B_eq = ${f(Be*.1,3)} µT`);
  mintL(s,[r,Y+.1,0],'point on the axis',30,60);mintL(s,[0,Y+.1,r],'point on the equator',-50,50);
  s.render();tag(c,'at the same distance the axial field is twice the equatorial field, opposite in direction',44,98,C.muted,13)});

/* ----- AC / inductive circuits on a wooden demonstration board ----- */
const can6=(s,x,z,lab,glow=0)=>{s.cyl([x,.4,z],[0,1,0],.27,.8,'#2f6db0',{cap:'#d3d8dd',seg:16});s.cyl([x,.74,z],[0,1,0],.275,.1,'#c9d3da',{seg:16,cap:'#c9d3da'});s.box([x+.2,.4,z+.2],[.05,.7,.05],'#e9edf0',{rotY:.8});if(glow>.02)s.ball([x,.95,z],.2+.2*glow,'#ffd27a',{glow:true,flat:true,alpha:.35});if(lab)s.engrave([x,.38,z+.285],lab,'#e9edf0',10)};
const src6=(s,x,z,lab='~ AC')=>{s.box([x,.28,z],[1,.56,.8],'#2f353b');s.box([x,.58,z],[1.02,.04,.82],'#4a5159');s.engrave([x,.3,z+.41],lab,'#ffd27a',13);s.ball([x-.28,.62,z-.2],.07,'#d33a32',{flat:true});s.ball([x+.28,.62,z-.2],.07,'#222',{flat:true})};
const loopFlow=(s,pts,I,t,n=12,col='#ffe29a')=>flow(s,pts,I,t,col,n);
reg('rlc-resonance',(c,p,t)=>{const s=P3.scene(c,{scale:44,cx:228,cy:266}),L=p.inductance/1000,Cc=p.capacitance*1e-6,w=TAU*p.frequency,Z=Math.hypot(p.resistance,w*L-1/(w*Cc)),Imax=1/p.resistance,I=1/Z,r=I/Imax,f0=1/(TAU*Math.sqrt(L*Cc));
  bench6(s,0,-.1,7.2,3.8);src6(s,-2.5,0);resistor6(s,[-.8,.14,-1.3],'x',.9);coil6(s,[1.0,.34,-1.3],[1,0,0],.3,.95,8,{former:false,w:2.6});can6(s,2.3,0,'C');
  wire6(s,[[-2.5,.07,-.45],[-2.5,.07,-1.3],[-1.35,.07,-1.3]]);wire6(s,[[-.15,.07,-1.3],[.5,.07,-1.3]]);wire6(s,[[1.5,.07,-1.3],[2.3,.07,-1.3],[2.3,.07,-.3]]);
  wire6(s,[[2.3,.07,.3],[2.3,.07,1.3],[.4,.07,1.3]],'#2b2b2b');wire6(s,[[-.4,.07,1.3],[-2.5,.07,1.3],[-2.5,.07,.45]],'#2b2b2b');
  bulb6(s,[0,.0,1.3],r);loopFlow(s,[[-2.5,-.45],[-2.5,-1.3],[2.3,-1.3],[2.3,1.3],[-2.5,1.3],[-2.5,.45]],r*2.6,t);
  mintL(s,[-.8,.3,-1.3],`R = ${p.resistance} Ω`,-10,-55);mintL(s,[1.0,.7,-1.3],`L = ${p.inductance} mH`,0,-60);mintL(s,[2.3,.9,0],`C = ${p.capacitance} µF`,45,-40);mintL(s,[0,.9,1.3],'lamp: brightest at resonance',-30,60);
  s.render();const g=x=>{const W=TAU*x;return(1/Math.hypot(p.resistance,W*L-1/(W*Cc)))/Imax};chart(c,430,96,226,150,{title:'Current vs frequency',xl:'Hz',xmin:20,xmax:500,ymin:0,ymax:1.05,series:[{fn:g,col:C.gold}],marker:[p.frequency,r]});tag(c,`f₀ = 1/2π√LC = ${f(f0,0)} Hz`,44,98,C.gold,15)});
reg('lc-energy-cycle',(c,p,t)=>{const s=P3.scene(c,{scale:46,cx:300,cy:266}),w=1/Math.sqrt(p.L/1000*p.cap*1e-6),ph=t*1.2,UE=Math.cos(ph)**2,UB=Math.sin(ph)**2;
  bench6(s,0,-.1,7,3.4);can6(s,-1.7,0,'C',UE);coil6(s,[1.4,.4,0],[0,0,1],.34,1.3,10,{former:false,w:2.6});
  wire6(s,[[-1.7,.07,-.3],[-1.7,.07,-1.2],[1.4,.07,-1.2],[1.4,.07,-.65]]);wire6(s,[[-1.7,.9,.0],[-1.7,.9,1.2],[1.4,.9,1.2],[1.4,.07,1.2],[1.4,.07,.65]],'#2b2b2b');
  loopFlow(s,[[-1.7,-.3],[-1.7,-1.2],[1.4,-1.2],[1.4,1.2],[-1.7,1.2],[-1.7,.3]],Math.sin(ph)*2.4,t,10,'#9ad7ff');
  // energy bars: electric (in the capacitor) and magnetic (in the coil)
  for(const [x,U,col,l] of[[3.0,UE,'#ffc36b','U_E'],[3.5,UB,'#6aa7ff','U_B']]){s.box([x,.02,.2],[.34,.06,.5],'#2f353b');s.box([x,.04+U*.75,.2],[.28,Math.max(.03,U*1.5),.4],col);s.label([x,-.3,.2],l,col,12)}s.box([3.25,.8,.2],[.9,.02,.45],'#ffffff22');s.callout([3.25,.8,.2],'total energy stays constant',C.muted,40,-50,10);
  mintL(s,[-1.7,1.1,0],'charged capacitor',-60,-40);mintL(s,[1.4,.8,0],'inductor',40,-50);
  s.render();tag(c,`ω = 1/√LC = ${f(w,1)} rad/s  (animation slowed)  ·  energy swaps between E and B`,44,98,C.gold,14)});
reg('rl-current',(c,p,t)=>{const s=P3.scene(c,{scale:44,cx:228,cy:266}),tau=p.inductance/p.resistance,T=5*tau+1,tt=cycle(t,T),I=p.voltage/p.resistance*(1-Math.exp(-tt/tau)),r=I/(p.voltage/p.resistance);
  bench6(s,0,-.1,7,3.6);src6(s,-2.5,0,'DC supply');resistor6(s,[-.5,.14,-1.3],'x',.9);coil6(s,[1.5,.4,0],[0,0,1],.38,1.4,10,{former:false,w:2.8});s.cyl([1.5,.4,0],[0,0,1],.2,1.4,'#7d848b',{alpha:.55,seg:12});
  wire6(s,[[-2.5,.07,-.45],[-2.5,.07,-1.3],[-1.35,.07,-1.3]]);wire6(s,[[.35,.07,-1.3],[1.5,.07,-1.3],[1.5,.07,-.75]]);wire6(s,[[1.5,.07,.75],[1.5,.07,1.3],[-2.5,.07,1.3],[-2.5,.07,.45]],'#2b2b2b');
  loopFlow(s,[[-2.5,-.45],[-2.5,-1.3],[1.5,-1.3],[1.5,1.3],[-2.5,1.3],[-2.5,.45]],r*2.4,t,12);
  s.callout([1.5,.4,0],'soft-iron core: more flux, more L',C.mint,60,-60,11);mintL(s,[-.5,.3,-1.3],`R = ${p.resistance} Ω`,0,-55);mintL(s,[1.5,.85,0],`L = ${p.inductance} H`,45,-45);
  s.render();chart(c,430,96,226,150,{title:'I vs time',xl:'s',xmin:0,xmax:T,ymin:0,ymax:p.voltage/p.resistance*1.05,series:[{fn:x=>p.voltage/p.resistance*(1-Math.exp(-x/tau)),col:C.gold}],marker:[tt,I]});tag(c,`τ = L/R = ${f(tau,2)} s: the coil opposes the rise of current`,44,98,C.gold,14)});
reg('reactance-frequency',(c,p,t)=>{const s=P3.scene(c,{scale:44,cx:222,cy:268}),XL=TAU*p.freq*p.L/1000,XC=1/(TAU*p.freq*p.C*1e-6),mx=Math.max(XL,XC,1),hl=.2+1.6*Math.log10(1+XL)/Math.log10(1+Math.max(mx,500)),hc=.2+1.6*Math.log10(1+XC)/Math.log10(1+Math.max(mx,500));
  bench6(s,0,-.1,6.8,3.4);src6(s,-2.5,0,'f = '+p.freq+' Hz');coil6(s,[-.7,.4,-.8],[1,0,0],.34,1.2,10,{former:false,w:2.6});can6(s,.9,.8,'C');
  wire6(s,[[-2.5,.07,-.4],[-2.5,.07,-.8],[-1.3,.07,-.8]]);wire6(s,[[-.1,.07,-.8],[1.6,.07,-.8],[1.6,.07,.1]]);wire6(s,[[-2.5,.07,.4],[-2.5,.07,.8],[.6,.07,.8]],'#2b2b2b');
  for(const [x,h,col,l,v] of[[1.9,hl,'#ffc36b','X_L',XL],[2.7,hc,'#6aa7ff','X_C',XC]]){s.box([x,.02,-.2],[.46,.06,.6],'#2f353b');s.box([x,.04+h/2,-.2],[.4,h,.5],col);s.label([x,-.35,-.2],`${l} = ${f(v,1)} Ω`,col,12)}
  mintL(s,[-.7,.8,-.8],'inductor: opposes change, X_L = ωL',-20,-60);mintL(s,[.9,1,.8],'capacitor: X_C = 1/ωC',30,-50);
  s.render();chart(c,430,96,226,170,{title:'Reactance vs f',xl:'Hz',xmin:10,xmax:500,ymin:0,ymax:Math.max(TAU*500*p.L/1000,1/(TAU*10*p.C*1e-6))*.6,series:[{fn:fq=>TAU*fq*p.L/1000,col:C.gold},{fn:fq=>1/(TAU*fq*p.C*1e-6),col:C.blue}],marker:[p.freq,XL]});tag(c,`X_L = ${f(XL,1)} Ω rises with f  ·  X_C = ${f(XC,1)} Ω falls with f`,44,98,C.muted,13)});
reg('ac-power',(c,p,t)=>{const s=P3.scene(c,{scale:46,cx:300,cy:262,yaw:.1}),XL=TAU*p.frequency*p.inductance,phi=Math.atan2(XL,p.resistance),w=t*1.4,Y=-1.5;
  bench6(s,0,Y,7.4,3.4);
  // oscilloscope showing voltage (gold) and current (mint, lagging by φ)
  s.box([-1.2,Y+1.35,0],[3.2,2.5,1.5],'#3a4048');s.box([-1.2,Y+1.35,.76],[3.0,2.3,.02],'#262b30');const SX=-2.0,SW=2.0,SY=Y+1.7,SH=1.0;
  s.poly([[SX-.05,SY-SH/2-.05,.78],[SX+SW+.05,SY-SH/2-.05,.78],[SX+SW+.05,SY+SH/2+.05,.78],[SX-.05,SY+SH/2+.05,.78]],'#0d1a12',{normal:[0,0,1],shade:false,bias:.4});
  const zz=K6.zf(s,[-1,SY,.8])+.5;for(let i=0;i<=8;i++){s.seg([SX+SW*i/8,SY-SH/2,.8],[SX+SW*i/8,SY+SH/2,.8],'#2e5a3a',.8,[],zz)}for(let i=0;i<=4;i++)s.seg([SX,SY-SH/2+SH*i/4,.8],[SX+SW,SY-SH/2+SH*i/4,.8],'#2e5a3a',.8,[],zz);
  const tr=ph0=>Array.from({length:49},(_,i)=>[SX+SW*i/48,SY+SH*.4*Math.sin(TAU*1.5*i/48-w-ph0),.81]);s.path(tr(0),'#ffc36b',2.4,[],zz+.02);s.path(tr(phi),'#42d9ca',2.4,[],zz+.03);
  s.label([SX+.25,SY+SH/2-.12,.82],'V',C.gold,12);s.label([SX+.65,SY+SH/2-.12,.82],'I',C.mint,12);for(const [x,y] of[[.45,.5],[.45,-.1]])s.cyl([x,Y+1.35+y,.78],[0,0,1],.17,.1,'#1d2024',{cap:'#4a5159',seg:14});
  // the phasor "clock" beside it
  const D=[2.4,Y+1.3,.5],Rr=1.0,az=K6.zf(s,[D[0],D[1],D[2]+.05])+.2;s.cyl(D,[0,0,1],Rr+.08,.12,'#202429',{cap:'#f3f0e4',seg:30});const pv=(a,k)=>[D[0]+Rr*k*Math.cos(a),D[1]+Rr*k*Math.sin(a),D[2]+.08];
  s.arrow(pv(0,0),pv(w,.9),C.gold,3,10);s.arrow(pv(0,0),pv(w-phi,.75),'#12a89a',3,10);s.path(Array.from({length:12},(_,i)=>pv(w-phi*i/11,.3)),'#444',1.5,[],az);
  s.callout(pv(w,.9),'V',C.gold,25,-25,12);s.callout(pv(w-phi,.75),`I lags by φ = ${f(deg(phi),1)}°`,'#12a89a',30,35,12);mintL(s,[-1.2,Y+2.6,0],'oscilloscope',-30,-30);
  s.render();tag(c,`power factor cos φ = ${f(Math.cos(phi),3)}  (current lags the voltage in an inductive circuit)`,44,98,C.gold,14)});


/* ---------- Moving Charges and Magnetism ---------- */
const bField=(s,dir,n=5,spread=3.2,col='#7baaff55',lab='')=>{for(let i=0;i<n;i++)for(let j=0;j<n;j++){const x=-spread+2*spread*i/(n-1),z=-spread*.6+1.2*spread*j/(n-1);s.arrow([x,-1.4*dir,z],[x,1.4*dir,z],col,1,6,i===n-1&&j===0?lab:'')}};

/* ---------- Magnetism and Matter ---------- */
const dipoleB=(q,m=1)=>{const r=Math.max(.25,Math.hypot(...q)),n=V.mul(q,1/r),mh=[m,0,0],d=V.dot(mh,n);return V.mul(V.sub(V.mul(n,3*d),mh),1/r**3)};
const barMagnet=(s,L=1.6,w=.35)=>{s.box([L/4,0,0],[L/2,w,w],'#ff857e');s.box([-L/4,0,0],[L/2,w,w],'#7baaff');s.label([L/2-.15,.35,0],'N',C.white,13);s.label([-L/2+.15,.35,0],'S',C.white,13)};
reg('tangent-galvanometer',(c,p,t)=>{const s=P3.scene(c,{scale:60,pitch:.4}),BH=35e-6,Bc=mu0*p.turns*p.current/(2*p.radius),th=Math.atan2(Bc,BH),R=.6+p.radius*3;s.ring([0,0,0],[0,0,1],R,'#d9844a',5);s.ring([0,0,.06],[0,0,1],R,'#d9844a',5);s.box([0,-R-.2,0],[1,.2,.8],'#5d7b8f');s.cyl([0,0,0],[0,1,0],.45,.06,'#e9f6ff',{alpha:.5});const d=[Math.cos(th),0,Math.sin(th)];s.tube([V.mul(d,-.4),[0,0,0]],.03,'#7baaff',{segs:5});s.tube([[0,0,0],V.mul(d,.4)],.03,'#ff857e',{segs:5});s.arrow([0,.4,0],[.9,.4,0],C.mint,2.5,11,'B_H = 35 µT');s.arrow([0,.55,0],[0,.55,.9*Math.min(3,Bc/BH)],C.gold,2.5,11,`B_coil = ${f(Bc*1e6,1)} µT`);s.render();tag(c,`θ = ${f(deg(th),1)}°`,44,98,C.gold,15)});

/* ---------- Electromagnetic Induction ---------- */
reg('faraday-rate',(c,p,t)=>{const s=P3.scene(c,{scale:56,yaw:.4}),emf=p.turns*p.dflux/p.dt,tt=cycle(t,p.dt*3+1),x=tt<p.dt*3?2.6-2*(tt/(p.dt*3)):.6;coil(s,[0,0,0],[1,0,0],.6,1.2,clamp(p.turns/20,4,20));s.box([x+.3,0,0],[.6,.3,.3],'#ff857e');s.box([x+.9,0,0],[.6,.3,.3],'#7baaff');s.render();tag(c,`ε = NΔΦ/Δt = ${f(emf,1)} V`,44,98,C.gold,15)});

/* ---------- Alternating Current ---------- */
})();
