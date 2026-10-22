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
 draw:(c,p,t)=>{const a=abLevel(p,p.day),s=P3.scene(c,{scale:56,cx:235,cy:262,pitch:.02}),PL=[-1.9,.55,0],
  /* pathogens (bacteria-like cells) coated with surface antigens; antibodies bind them */
  PA=[[.4,.9],[1.7,.4],[.9,-.7],[2.1,-1.0],[-.3,-.9]],nAb=Math.min(24,Math.round(a*2));
  PA.forEach(([x,y],i)=>{const q=[x+.04*Math.sin(t+i),y+.05*Math.cos(t*.8+i),0];s.mesh(q,[.34,.24,.24],'#e0457b',{rings:10,segs:16,spec:.5,rot:[0,0,hash(i)*3]});s.mesh(q,[.26,.17,.17],'#b3245b',{rings:6,segs:10,rot:[0,0,hash(i)*3]});
    for(let k=0;k<9;k++){const an=TAU*k/9+i,rr=[.34*Math.cos(an),.24*Math.sin(an)],ca=Math.cos(hash(i)*3),sa=Math.sin(hash(i)*3),e=[q[0]+rr[0]*ca-rr[1]*sa,q[1]+rr[0]*sa+rr[1]*ca,.05],d=V.norm([e[0]-q[0],e[1]-q[1],0]),tip=V.add(e,V.mul(d,.1));s.seg(e,tip,'#ffa8a8',1.6);s.ball(tip,.04,'#ffd8d8',{flat:true})}});
  /* plasma B cell: eccentric nucleus, rough ER, secreting antibodies */
  s.mesh(PL,[.62,.55,.5],'#e7a9c4',{alpha:.6,rings:12,segs:18,spec:.5});s.mesh([PL[0]-.15,PL[1]+.05,.1],[.26,.26,.24],'#5f3dc4',{rings:8,segs:12,lift:6});for(let i=0;i<4;i++){s.ring([PL[0]+.12,PL[1]-.1,.15],[0,0,1],.12+i*.07,'#2f7fc4',2,[],24)}
  for(let i=0;i<Math.min(6,Math.ceil(nAb/4));i++){const q=cycle(t*.35+i/6,1);antibody(s,[PL[0]+.7+q*1.2,PL[1]-.1+(hash(i)-.5)*.7*q,.1],.34,'#74c0fc',-.8+hash(i)*1.6)}
  /* free antibodies in the plasma */
  for(let i=0;i<nAb;i++){const q=[-1.1+hash(i+40)*3.5,-1.5+hash(i+50)*2.9+.08*Math.sin(t*2+i),(hash(i+60)-.5)*.5];if(Math.hypot(q[0]-PL[0],q[1]-PL[1])<.9)continue;antibody(s,q,.36,'#74c0fc',hash(i)*TAU)}
  s.callout([PL[0]-.4,PL[1]-.35,.3],'plasma B cell','#f3c4d6',-35,40);s.callout([PA[0][0],PA[0][1]+.28,.1],'antigen (pathogen surface)','#ff8fab',-10,-50);if(a>.5)s.callout([1.2,-1.4,.2],'antibodies (IgG)','#74c0fc',40,35);s.render();
  chart(c,420,96,236,170,{title:'Antibody level vs time',xl:'days',xmin:0,xmax:120,ymin:0,ymax:abLevel(p,p.second+6)*1.1,series:[{fn:d=>abLevel(p,d),col:C.gold}],marker:[p.day,a]})},
 assumption:'Schematic antibody curves: primary peak ≈ 1 unit at day 12; secondary ≈ 10× higher, peaking about 6 days after re-exposure.'});
function abLevel(p,d){const e0=Math.exp(-.7),g=(t0,lag,peak,w)=>{const x=d-t0-lag;if(x<0)return 0;if(x<=w)return peak*(Math.exp(-(((x-w)/w)**2)*.7)-e0)/(1-e0);return peak*Math.exp(-(((x-w)/w)**2)*.7)*Math.exp(-(x-w)/40)};return g(0,4,1,8)+(d>=p.second?g(p.second,1.5,10,5):0)}

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
 draw:(c,p,t)=>{const st=p.stage,CX=340,CY=252,RX=248,RY=92,ANG=[212,152,104,52,-22,-92],R=36,
  P=ANG.map(a=>[CX+RX*Math.cos(a*Math.PI/180),CY+RY*Math.sin(a*Math.PI/180)]),
  txt=(s2,x,y,col,sz,al)=>{c.save();c.font='600 '+sz+'px system-ui,sans-serif';c.fillStyle=col;c.textAlign=al||'center';c.textBaseline='middle';c.fillText(s2,x,y);c.restore()},
  disc=(x,y,r,col,hi)=>{const g=c.createRadialGradient(x-r*.3,y-r*.35,r*.1,x,y,r);g.addColorStop(0,hi||'#fff4');g.addColorStop(.3,col);g.addColorStop(1,col);c.save();c.fillStyle=col;c.beginPath();c.arc(x,y,r,0,TAU);c.fill();c.fillStyle='rgba(255,255,255,.22)';c.beginPath();c.arc(x-r*.28,y-r*.32,r*.35,0,TAU);c.fill();c.restore()},
  rbc=(x,y,r,col)=>{c.save();c.fillStyle=col||'#d6303a';c.beginPath();c.arc(x,y,r,0,TAU);c.fill();c.fillStyle='rgba(120,10,25,.55)';c.beginPath();c.arc(x,y,r*.45,0,TAU);c.fill();c.restore()},
  para=(x,y,r)=>{c.save();c.fillStyle='#c77dff';c.strokeStyle='#7048e8';c.lineWidth=1;c.beginPath();c.arc(x,y,r,0,TAU);c.fill();c.stroke();c.restore()},
  icons=[
   /* 1 mosquito bite: body, wing, proboscis and drop of saliva with sporozoites */
   (x,y)=>{c.save();c.fillStyle='#3b3f45';c.beginPath();c.ellipse(x+3,y-2,10,4.2,-.35,0,TAU);c.fill();c.beginPath();c.arc(x-8,y+1,3.4,0,TAU);c.fill();c.strokeStyle='#3b3f45';c.lineWidth=1.4;c.beginPath();c.moveTo(x-10,y+3);c.lineTo(x-18,y+11);c.stroke();c.fillStyle='rgba(200,225,255,.75)';c.beginPath();c.ellipse(x+1,y-10,9,3.4,.6,0,TAU);c.fill();c.strokeStyle='#3b3f45';c.lineWidth=1;for(let i=0;i<3;i++){c.beginPath();c.moveTo(x+6-i*3,y+1);c.lineTo(x+9-i*5,y+11);c.stroke()}c.restore();for(let i=0;i<3;i++)para(x-20+i*1.5,y+14+i*1.5,1.8)},
   /* 2 liver: lobed organ with parasites in the cells */
   (x,y)=>{c.save();const g=c.createLinearGradient(x-18,y-12,x+18,y+12);g.addColorStop(0,'#c0504d');g.addColorStop(1,'#7a1f2a');c.fillStyle=g;c.beginPath();c.moveTo(x-19,y-3);c.bezierCurveTo(x-16,y-17,x+8,y-17,x+19,y-8);c.bezierCurveTo(x+22,y+2,x+10,y+13,x-4,y+11);c.bezierCurveTo(x-14,y+10,x-21,y+4,x-19,y-3);c.fill();c.strokeStyle='rgba(60,0,10,.5)';c.beginPath();c.moveTo(x+2,y-12);c.quadraticCurveTo(x+4,y,x-3,y+10);c.stroke();c.restore();for(let i=0;i<5;i++)para(x-10+i*5,y-4+3*Math.sin(i*2),1.9)},
   /* 3 RBC stage: infected red cells (ring forms) and one bursting */
   (x,y)=>{rbc(x-12,y-6,8);rbc(x+9,y-8,8);rbc(x-2,y+8,8);c.save();c.strokeStyle='#c77dff';c.lineWidth=1.6;c.beginPath();c.arc(x-12,y-6,3.2,0,TAU);c.stroke();c.beginPath();c.arc(x+9,y-8,3.2,0,TAU);c.stroke();c.strokeStyle='#ffd43b';c.lineWidth=1.3;for(let i=0;i<8;i++){const a=TAU*i/8;c.beginPath();c.moveTo(x-2+Math.cos(a)*9.5,y+8+Math.sin(a)*9.5);c.lineTo(x-2+Math.cos(a)*14,y+8+Math.sin(a)*14);c.stroke()}c.restore()},
   /* 4 gametocytes: red cell containing a crescent gametocyte */
   (x,y)=>{rbc(x-6,y,12);c.save();c.strokeStyle='#be4bdb';c.lineWidth=4.2;c.lineCap='round';c.beginPath();c.arc(x-6,y,6.5,.5,TAU-.9);c.stroke();c.restore();rbc(x+14,y-9,6);c.save();c.strokeStyle='#be4bdb';c.lineWidth=2.4;c.beginPath();c.arc(x+14,y-9,3,.3,TAU-1);c.stroke();c.restore()},
   /* 5 mosquito gut: wall with oocysts */
   (x,y)=>{c.save();c.fillStyle='#e8c78a';c.strokeStyle='#a1783a';c.lineWidth=1.4;c.beginPath();c.ellipse(x,y,20,12,0,0,TAU);c.fill();c.stroke();c.restore();for(let i=0;i<4;i++){c.save();c.fillStyle='#fff3c9';c.strokeStyle='#a1783a';c.beginPath();c.arc(x-11+i*7,y+9-Math.abs(i-1.5)*2,3.6,0,TAU);c.fill();c.stroke();c.restore()}para(x-3,y-3,3.4);para(x+5,y-2,3.4)},
   /* 6 salivary glands: acini with sporozoites in the duct */
   (x,y)=>{c.save();c.fillStyle='#ffd8a8';c.strokeStyle='#d9843a';c.lineWidth=1.2;for(let i=0;i<5;i++){c.beginPath();c.arc(x-12+i*6.5,y-4+(i%2)*7,6.2,0,TAU);c.fill();c.stroke()}c.strokeStyle='#9c6b3c';c.lineWidth=2.2;c.beginPath();c.moveTo(x-14,y+10);c.lineTo(x+16,y+10);c.stroke();c.restore();for(let i=0;i<4;i++)para(x-6+i*5,y+10,1.6)}];
  /* flow arrows between consecutive stages (curved along the loop) */
  c.save();c.lineWidth=2;for(let i=0;i<6;i++){const a=P[i],b=P[(i+1)%6],on=i===st-1,mid=[(a[0]+b[0])/2+(CX-(a[0]+b[0])/2)*.0,(a[1]+b[1])/2],ang=Math.atan2(b[1]-a[1],b[0]-a[0]),d=Math.hypot(b[0]-a[0],b[1]-a[1]),sx=a[0]+Math.cos(ang)*(R+5),sy=a[1]+Math.sin(ang)*(R+5),ex=b[0]-Math.cos(ang)*(R+9),ey=b[1]-Math.sin(ang)*(R+9);c.strokeStyle=on?'#ffd43b':'#3c5a70';c.fillStyle=on?'#ffd43b':'#3c5a70';c.setLineDash(on?[]:[5,4]);c.beginPath();c.moveTo(sx,sy);c.lineTo(ex,ey);c.stroke();c.setLineDash([]);c.beginPath();c.moveTo(ex,ey);c.lineTo(ex-Math.cos(ang-.45)*9,ey-Math.sin(ang-.45)*9);c.lineTo(ex-Math.cos(ang+.45)*9,ey-Math.sin(ang+.45)*9);c.closePath();c.fill()}c.restore();
  const names=['mosquito bite','liver stage','RBC stage','gametocytes','mosquito gut','salivary glands'],lab=[[0,-1],[0,1],[0,1],[0,1],[0,-1],[0,-1]];
  P.forEach(([x,y],i)=>{const on=i===st-1,mos=i>=4;c.save();c.fillStyle=on?'rgba(255,212,59,.18)':'rgba(16,36,58,.9)';c.strokeStyle=on?'#ffd43b':mos?'#ffa94d':'#4dabf7';c.lineWidth=on?3.5:2;c.beginPath();c.arc(x,y,R,0,TAU);c.fill();c.stroke();c.restore();c.save();c.beginPath();c.arc(x,y,R-2,0,TAU);c.clip();c.translate(x,y);c.scale(1.45,1.45);icons[i](0,0);c.restore();const L=lab[i];txt((i+1)+'  '+names[i],x+L[0]*(R+10),y+L[1]*(R+16),on?C.gold:C.white,on?15:14,L[0]<0?'right':L[0]>0?'left':'center')});
  /* moving parasite along the arrow of the current stage */
  {const a=P[st-1],b=P[st%6],q=cycle(t*.5,1);for(let i=0;i<4;i++)para(a[0]+(b[0]-a[0])*Math.min(1,q+i*.03)*.85+(hash(i)-.5)*7,a[1]+(b[1]-a[1])*Math.min(1,q+i*.03)*.85+(hash(i+2)-.5)*7,3.4)}
  tag(c,MAL[st-1][0],44,98,C.gold,16);txt('blue ring: in human   orange ring: in female Anopheles   purple: parasite',44,120,C.muted,12,'left')},
 assumption:'Simplified cycle from NCERT Chapter 7; purple dots are parasites.'});

/* ---------- Chapter 8: Microbes in Human Welfare ---------- */
add({...ch(8,'Microbes in Human Welfare',U8),id:'bio-sewage-treatment',title:'Sewage treatment and BOD',
 description:'Run sewage through primary settling and secondary aeration tanks. Aerobic microbes in flocs consume organic matter and lower the BOD.',
 formula:'BOD(t) ≈ BOD₀e^(−kt) during aeration',
 observe:'Once BOD is reduced significantly the effluent is passed to a settling tank; the activated sludge digests anaerobically to give biogas.',
 tryText:'How long must the sewage be aerated to remove 90% of its BOD?',
 controls:[R('bod0','BOD of incoming sewage',100,500,10,300,'mg/L'),R('h','Aeration time',0,12,.1,4,'h',1)],
 metrics:p=>{const k=.3,b=p.bod0*Math.exp(-k*p.h);return[N('BOD after aeration',b,'mg/L',0),N('BOD removed',(1-b/p.bod0)*100,'%',0),N('Stage now',p.h<.5?'Primary treatment (settling)':'Secondary treatment (aeration)'),N('Microbes','Aerobic bacteria and fungi forming flocs')]},
 draw:(c,p,t)=>{const k=.3,b=p.bod0*Math.exp(-k*p.h),rem=1-b/p.bod0,TY=170,TH=170,
  txt=(s2,x,y,col,sz,al)=>{c.save();c.font='600 '+sz+'px system-ui,sans-serif';c.fillStyle=col;c.textAlign=al||'center';c.textBaseline='middle';c.fillText(s2,x,y);c.restore()},
  rr=(x,y,w,h,r)=>{c.beginPath();c.roundRect?c.roundRect(x,y,w,h,r):c.rect(x,y,w,h)},
  mixc=(a,b2,k2)=>{const A=[1,3,5].map(i=>parseInt(a.slice(i,i+2),16)),B=[1,3,5].map(i=>parseInt(b2.slice(i,i+2),16));return'rgb('+A.map((v,i)=>Math.round(v+(B[i]-v)*k2)).join(',')+')'},
  /* tank: concrete wall, water of a given colour, with a water line */
  tank=(x,w,col,lab,wl)=>{c.save();c.fillStyle='rgba(120,135,150,.35)';rr(x-6,TY-6,w+12,TH+12,8);c.fill();const g=c.createLinearGradient(0,TY,0,TY+TH);g.addColorStop(0,col);g.addColorStop(1,'#0b1622');c.fillStyle=g;rr(x,TY+wl,w,TH-wl,4);c.fill();c.strokeStyle='rgba(255,255,255,.35)';c.lineWidth=1;c.beginPath();c.moveTo(x,TY+wl);c.lineTo(x+w,TY+wl);c.stroke();c.restore();txt(lab,x+w/2,TY-22,C.white,13)},
  pipe=(x1,y1,x2,y2)=>{c.save();c.strokeStyle='#7f93a5';c.lineWidth=8;c.lineCap='butt';c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke();c.strokeStyle='#a9bccd';c.lineWidth=3;c.beginPath();c.moveTo(x1,y1-1);c.lineTo(x2,y2-1);c.stroke();c.restore()},
  X1=46,W1=106,X2=182,W2=132,X3=346,W3=96;
  pipe(10,TY+34,X1,TY+34);pipe(X1+W1,TY+40,X2,TY+40);pipe(X2+W2,TY+40,X3,TY+40);pipe(X3+W3,TY+34,X3+W3+22,TY+34);
  /* 1 primary: bar screen, grit/sludge settling at the bottom, scum on top */
  tank(X1,W1,'#8d7254','primary',14);c.save();c.fillStyle='#5b4632';c.beginPath();c.moveTo(X1,TY+TH);c.lineTo(X1,TY+TH-22);c.quadraticCurveTo(X1+W1/2,TY+TH-48,X1+W1,TY+TH-22);c.lineTo(X1+W1,TY+TH);c.fill();c.fillStyle='rgba(210,190,150,.8)';rr(X1+10,TY+10,W1-20,5,2);c.fill();c.strokeStyle='#cfd8e0';c.lineWidth=2;for(let i=0;i<6;i++){c.beginPath();c.moveTo(X1+8+i*5,TY+18);c.lineTo(X1+8+i*5,TY+TH-70)}c.stroke();c.restore();
  for(let i=0;i<9;i++){const q=cycle(t*.25+i/9,1);c.save();c.fillStyle='#6b563d';c.beginPath();c.arc(X1+30+hash(i)*(W1-50),TY+30+q*(TH-80),2.6,0,TAU);c.fill();c.restore()}
  txt('debris, grit and',X1+W1/2,TY+TH+20,C.muted,10);txt('sludge settle out',X1+W1/2,TY+TH+34,C.muted,10);
  /* 2 aeration: clear-to-brown colour by BOD, flocs, diffusers and bubbles */
  tank(X2,W2,mixc('#8a7a3e','#4f8f6c',rem),'secondary: aeration',14);c.save();c.fillStyle='#cfd8e0';for(let i=0;i<6;i++){c.fillRect(X2+18+i*26,TY+TH-10,14,6)}c.restore();
  for(let i=0;i<14;i++){const f=cycle(t*.5+i/14,1);c.save();c.fillStyle='rgba(230,245,255,.75)';c.beginPath();c.arc(X2+25+(i%6)*26+3*Math.sin(f*9+i),TY+TH-12-f*(TH-30),2+hash(i)*1.8,0,TAU);c.fill();c.restore()}
  for(let i=0;i<10;i++){const x=X2+20+hash(i+20)*(W2-40),y=TY+50+hash(i+25)*(TH-90);c.save();c.fillStyle='#a0782b';c.strokeStyle='#6b4f1d';c.lineWidth=1;c.beginPath();for(let a=0;a<=16;a++){const th=TAU*a/16,rr2=(9+hash(i+7)*5)*(1+.3*Math.sin(5*th+i));const px=x+Math.cos(th)*rr2,py=y+Math.sin(th)*rr2*.7;a?c.lineTo(px,py):c.moveTo(px,py)}c.closePath();c.fill();c.stroke();c.fillStyle='#e7cf9a';for(let m=0;m<3;m++){c.beginPath();c.arc(x-4+m*4,y+(m%2)*2-1,1.4,0,TAU);c.fill()}c.restore()}
  txt('flocs: bacteria + fungi',X2+W2/2,TY+TH+24,C.muted,10);txt('air in',X2+W2/2,TY+TH+8,'#cfe9ff',10);
  /* 3 settling tank: clear effluent above, activated sludge below and recycled */
  tank(X3,W3,'#4d96d6','settling tank',14);c.save();c.fillStyle='#8a6a2a';c.beginPath();c.moveTo(X3,TY+TH);c.lineTo(X3,TY+TH-30);c.quadraticCurveTo(X3+W3/2,TY+TH-50,X3+W3,TY+TH-30);c.lineTo(X3+W3,TY+TH);c.fill();c.restore();txt('effluent',X3+W3/2,TY+60,'#e7f5ff',12);txt('activated sludge',X3+W3/2,TY+TH-16,'#f3e5b0',11);
  c.save();c.strokeStyle='#d9a441';c.lineWidth=2;c.setLineDash([5,4]);c.beginPath();c.moveTo(X3+W3/2,TY+TH+4);c.lineTo(X3+W3/2,TY+TH+50);c.lineTo(X2+W2/2,TY+TH+50);c.lineTo(X2+W2/2,TY+TH+28);c.stroke();c.setLineDash([]);c.restore();txt('part returned as inoculum',(X2+X3+W2)/2+34,TY+TH+41,'#d9a441',10);
  txt('sludge → anaerobic digester → biogas',470,296,'#a8e063',10,'left');
  /* flow particles through the pipes */
  for(let i=0;i<8;i++){const q=cycle(t*.35+i/8,1),x=10+q*(X3+W3+22-10);c.save();c.fillStyle=q<.35?'#9c7f5a':q<.7?'#7aa07c':'#9fd3ff';c.beginPath();c.arc(x,(q<.35?TY+34:TY+40),3.2,0,TAU);c.fill();c.restore()}
  chart(c,470,112,190,150,{title:'BOD (mg/L)',xmin:0,xmax:12,ymin:0,ymax:p.bod0,series:[{fn:x=>p.bod0*Math.exp(-k*x),col:C.gold}],marker:[p.h,b]})},
 assumption:'First-order BOD decay with k = 0.3 per hour (illustrative); real plants vary widely.'});

add({...ch(8,'Microbes in Human Welfare',U8),id:'bio-biogas-plant',title:'Biogas plant',
 description:'Feed cattle dung slurry into a digester. Methanogens break it down anaerobically and the floating gas holder rises.',
 formula:'Organic matter —methanogens (anaerobic)→ CH₄ + CO₂ (+ H₂S)',
 observe:'Methanogens such as Methanobacterium live in the rumen of cattle, so dung is rich in them.',
 tryText:'Increase the dung fed per day and see the gas holder rise faster.',
 controls:[R('dung','Dung fed per day',10,200,5,50,'kg'),R('T','Digester temperature',15,40,1,32,'°C')],
 metrics:p=>{const y=.04*p.dung*Math.exp(-(((p.T-35)/12)**2));return[N('Biogas per day',y,'m³',2),N('Methane (≈ 60%)',y*.6,'m³',2),N('Microbes','Methanogens, e.g. Methanobacterium'),N('Spent slurry','Used as fertiliser')]},
 draw:(c,p,t)=>{const y=.04*p.dung*Math.exp(-(((p.T-35)/12)**2)),rise=Math.min(.9,cycle(t*y*.1,1)*.9),GY=190,
  txt=(s2,x,yy,col,sz,al)=>{c.save();c.font='600 '+sz+'px system-ui,sans-serif';c.fillStyle=col;c.textAlign=al||'center';c.textBaseline='middle';c.fillText(s2,x,yy);c.restore()},
  /* ground with soil layers; the digester is a cut-away masonry pit */
  gr=c.createLinearGradient(0,GY,0,GY+210);gr.addColorStop(0,'#7a5a3a');gr.addColorStop(1,'#3f2c1c');
  c.save();c.fillStyle=gr;c.fillRect(24,GY,610,210);c.fillStyle='#6fae4f';c.fillRect(24,GY-5,610,8);c.restore();
  const DX=262,DW=140,DT=GY+4,DB=GY+196;
  c.save();c.fillStyle='#b5503a';c.strokeStyle='#7a2f22';c.lineWidth=1.5;c.beginPath();c.rect(DX-DW/2-9,DT,9,DB-DT);c.rect(DX+DW/2,DT,9,DB-DT);c.fill();c.stroke();c.fillStyle='#8a3d2d';for(let r=0;r<10;r++){c.fillRect(DX-DW/2-9,DT+r*19,9,1.4);c.fillRect(DX+DW/2,DT+r*19,9,1.4)}c.restore();
  /* slurry in the digester with a dark sludge layer and bubbles */
  const sl=c.createLinearGradient(0,DT+30,0,DB);sl.addColorStop(0,'#8a6a2a');sl.addColorStop(1,'#3b2a14');c.save();c.fillStyle=sl;c.fillRect(DX-DW/2,DT+34,DW,DB-DT-34);c.restore();
  c.save();c.strokeStyle='rgba(255,255,255,.35)';c.lineWidth=1;c.beginPath();c.moveTo(DX-DW/2,DT+34);c.lineTo(DX+DW/2,DT+34);c.stroke();c.restore();
  for(let i=0;i<14;i++){const q=cycle(t*.5+i/14,1);c.save();c.fillStyle='rgba(231,245,255,.8)';c.beginPath();c.arc(DX-DW/2+16+hash(i)*(DW-32)+3*Math.sin(q*10+i),DB-8-q*(DB-DT-44),1.8+hash(i+3)*1.6,0,TAU);c.fill();c.restore()}
  for(let i=0;i<6;i++){c.save();c.fillStyle='#d4b36a';c.beginPath();c.ellipse(DX-DW/2+20+hash(i+9)*(DW-40),DT+70+hash(i+12)*(DB-DT-100),5,2.2,hash(i)*3,0,TAU);c.fill();c.restore()}
  /* floating gas holder (drum): rises as gas collects; guide frame */
  const GH=60,gtop=DT+34-GH-rise*52,gx=DX-DW/2+3,gw=DW-6;
  c.save();c.strokeStyle='#8fa3b5';c.lineWidth=3;c.beginPath();c.moveTo(DX,gtop-26);c.lineTo(DX,DT-4);c.stroke();c.restore();
  c.save();const dg=c.createLinearGradient(gx,0,gx+gw,0);dg.addColorStop(0,'#98a6b3');dg.addColorStop(.35,'#e3e9ee');dg.addColorStop(1,'#7f8d9a');c.fillStyle=dg;c.strokeStyle='#5d6b78';c.lineWidth=1.5;c.beginPath();c.rect(gx,gtop,gw,GH+8);c.fill();c.stroke();c.fillStyle='rgba(120,200,255,.18)';c.fillRect(gx+2,gtop+GH-24,gw-4,26);c.fillStyle='#aebbc6';c.beginPath();c.ellipse(DX,gtop,gw/2,6,0,0,TAU);c.fill();c.stroke();c.restore();
  txt('gas',DX,gtop+GH-12,'#b8e1ff',11);
  /* gas outlet pipe to a stove burner */
  c.save();c.strokeStyle='#4a5560';c.lineWidth=5;c.lineCap='round';c.beginPath();c.moveTo(DX,gtop-8);c.lineTo(DX,gtop-30);c.lineTo(DX+110,gtop-30);c.lineTo(DX+110,GY-34);c.stroke();c.restore();
  c.save();c.fillStyle='#37424d';c.fillRect(DX+84,GY-34,52,12);c.fillStyle='#ff9f43';c.beginPath();c.moveTo(DX+110,GY-40);c.quadraticCurveTo(DX+104,GY-50,DX+110,GY-60);c.quadraticCurveTo(DX+116,GY-50,DX+110,GY-40);c.fill();c.fillStyle='#4dabf7';c.beginPath();c.arc(DX+110,GY-41,2.5,0,TAU);c.fill();c.restore();txt('gas used for cooking',DX+112,GY-76,'#ffd7a0',11);
  /* inlet (mixing pit) and outlet (overflow tank) */
  c.save();c.fillStyle='#9c6a2c';c.fillRect(80,GY-26,70,24);c.strokeStyle='#5e3f19';c.strokeRect(80,GY-26,70,24);c.restore();txt('mixing tank',115,GY-40,C.white,11);
  c.save();c.strokeStyle='#a0782b';c.lineWidth=14;c.lineCap='butt';c.beginPath();c.moveTo(115,GY-2);c.lineTo(115,GY+95);c.lineTo(DX-DW/2-9,GY+150);c.stroke();c.restore();
  c.save();c.strokeStyle='#8a6a40';c.lineWidth=14;c.beginPath();c.moveTo(DX+DW/2+9,GY+150);c.lineTo(500,GY+110);c.lineTo(500,GY+12);c.stroke();c.restore();c.save();c.fillStyle='#7d6a52';c.fillRect(470,GY-26,60,28);c.strokeStyle='#4d3f2f';c.strokeRect(470,GY-26,60,28);c.restore();
  txt('dung + water slurry in',115,GY-58,C.gold,12);txt('spent slurry out',500,GY-40,C.muted,12);txt('(fertiliser)',500,GY-12,'#f2e8d9',10);txt('digester (anaerobic)',DX,DB-12,'#ffe0a8',11);txt('floating gas holder',DX-8,gtop-36,C.white,11,'right');
  txt('bubbles: CH₄ + CO₂ released by methanogens',44,98,C.muted,12,'left')},
 assumption:'Illustrative yield ≈ 0.04 m³ biogas per kg fresh dung at the optimum (~35 °C).'});

/* ---------- Chapter 9: Biotechnology: Principles and Processes ---------- */
add({...ch(9,'Biotechnology: Principles and Processes',U9),id:'bio-pcr',title:'Polymerase chain reaction (PCR)',
 description:'Cycle through denaturation, primer annealing and extension. Each cycle (ideally) doubles the DNA.',
 formula:'Copies after n cycles = N₀(1 + E)ⁿ ;  ideal (E = 1): N₀ × 2ⁿ',
 observe:'A thermostable DNA polymerase from Thermus aquaticus (Taq) survives the high denaturation temperature.',
 tryText:'How many copies from one DNA molecule after 30 ideal cycles?',
 controls:[R('n','Number of cycles',0,35,1,10),R('eff','Efficiency per cycle',60,100,1,100,'%'),R('n0','Starting copies',1,100,1,1)],
 metrics:(p,t)=>{const copies=p.n0*(1+p.eff/100)**p.n,st=pcrStep(t);return[N('DNA copies',copies,'',copies<1e5?0:3),N('Step (animation)',st.name),N('Temperature',st.T,'°C',0),N('Enzyme','Taq polymerase')]},
 draw:(c,p,t)=>{const st=pcrStep(t),T3=cycle(t,3),q=T3-st.k,X0=50,X1=390,YT=170,YB=262,
  txt=(s2,x,y,col,sz,al)=>{c.save();c.font='600 '+sz+'px system-ui,sans-serif';c.fillStyle=col;c.textAlign=al||'center';c.textBaseline='middle';c.fillText(s2,x,y);c.restore()},
  strand=(y,col,x0,x1,w,wob)=>{c.save();c.strokeStyle=col;c.lineWidth=w;c.lineCap='round';c.beginPath();for(let x=x0;x<=x1;x+=4){const yy=y+(wob?3*Math.sin(x*.13+t*3):0);x===x0?c.moveTo(x,yy):c.lineTo(x,yy)}c.stroke();c.restore()},
  rungs=(ya,yb,x0,x1,n)=>{c.save();c.lineWidth=2;for(let i=0;i<n;i++){const x=x0+(x1-x0)*i/(n-1);c.strokeStyle=i%2?'#ff8787':'#4dabf7';c.beginPath();c.moveTo(x,ya+2);c.lineTo(x,yb-2);c.stroke()}c.restore()},
  gap=st.k===0?56:62+8*Math.sin(t*2),ya=YT-(gap-30)/2*(st.k===0?1:1)+30-30,yb=YB+(gap-92)/2;
  /* panel */
  c.save();c.fillStyle='rgba(16,36,58,.65)';c.strokeStyle='rgba(120,160,190,.3)';c.beginPath();c.roundRect?c.roundRect(34,126,372,190,12):c.rect(34,126,372,190);c.fill();c.stroke();c.restore();
  const A=st.k===0?YT-8*q:YT,B=st.k===0?YB+8*q:YB;
  if(st.k===0){const open=Math.min(1,q*3);rungs(YT+open*0,YT+open*0,0,0,0);const mid=(YT+YB)/2;for(let i=0;i<14;i++){const x=X0+20+i*(X1-X0-40)/13,half=(YB-YT)/2*(1-open*.0);c.save();c.strokeStyle=i%2?'#ff8787':'#4dabf7';c.lineWidth=2;c.beginPath();c.moveTo(x,YT+4+open*-4);c.lineTo(x,YT+4+(1-open)*(YB-YT-8)*.5+ (1-open)*0);c.moveTo(x,YB-4+open*4);c.lineTo(x,YB-4-(1-open)*(YB-YT-8)*.5);c.stroke();c.restore()}}
  const ty=st.k===0?YT-6*Math.min(1,q*3):YT-6,by=st.k===0?YB+6*Math.min(1,q*3):YB+6;
  strand(ty,'#4dabf7',X0,X1,6,st.k===0);strand(by,'#4dabf7',X0,X1,6,st.k===0);
  txt("5'",X0-10,ty,C.white,12,'right');txt("3'",X1+8,ty,C.white,12,'left');txt("3'",X0-10,by,C.white,12,'right');txt("5'",X1+8,by,C.white,12,'left');
  /* primers anneal at the 3' ends of each template (yellow), extension adds a new strand (red) */
  const pl=44;
  if(st.k>=1){const aq=st.k===1?Math.min(1,q*2.5):1;c.save();c.globalAlpha=aq;strand(ty+9,'#ffd43b',X1-pl-20,X1-20,5,false);strand(by-9,'#ffd43b',X0+20,X0+20+pl,5,false);c.restore();if(st.k===1){txt('primer',X1-pl/2-20,ty+23,'#ffd43b',11);txt('primer',X0+20+pl/2,by-23,'#ffd43b',11)}}
  if(st.k===2){const ex=Math.min(1,q*1.1),xe=X1-20-pl-(X1-20-pl-X0-18)*ex,xe2=X0+20+pl+(X1-20-pl-X0-18)*ex;strand(ty+9,'#ff6b6b',xe,X1-20,5,false);strand(by-9,'#ff6b6b',X0+20,xe2,5,false);
   const px=xe,qx=xe2;c.save();for(const [x,y] of[[px,ty+22],[qx,by-22]]){const g=c.createRadialGradient(x-3,y-3,2,x,y,15);g.addColorStop(0,'#aef0c4');g.addColorStop(1,'#20a35a');c.fillStyle=g;c.beginPath();c.arc(x,y,13,0,TAU);c.fill()}c.restore();txt('Taq',px,ty+22,'#06361c',10);txt('Taq',qx,by-22,'#06361c',10)}
  txt(st.k===0?'1  Denaturation 94 °C: strands separate':st.k===1?'2  Annealing 55 °C: primers bind':'3  Extension 72 °C: Taq adds nucleotides',X0,146,C.white,13,'left');
  txt('template strands (blue) · primers (yellow) · new strands (red)',X0,300,C.muted,11,'left');
  /* step chips */
  ['94 °C','55 °C','72 °C'].forEach((l,i)=>{const on=i===st.k;c.save();c.fillStyle=on?'rgba(255,212,59,.2)':'rgba(16,36,58,.9)';c.strokeStyle=on?'#ffd43b':'rgba(120,160,190,.4)';c.lineWidth=on?2.5:1;c.beginPath();c.roundRect?c.roundRect(50+i*112,332,100,34,8):c.rect(50+i*112,332,100,34);c.fill();c.stroke();c.restore();txt(['denature','anneal','extend'][i]+' '+l,100+i*112,349,on?C.gold:C.muted,12)});
  chart(c,420,96,236,90,{title:'Temperature profile',xmin:0,xmax:3,ymin:40,ymax:100,series:[{pts:[[0,94],[1,94],[1,55],[2,55],[2,72],[3,72]],col:C.red}],marker:[T3,st.T]});chart(c,420,196,236,90,{title:'Copies (log scale)',xl:'cycles',xmin:0,xmax:35,ymin:0,ymax:12,series:[{fn:x=>Math.log10(p.n0*(1+p.eff/100)**x),col:C.gold}],marker:[p.n,Math.log10(p.n0*(1+p.eff/100)**p.n)]})},
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
 draw:(c,p,t)=>{const GX=215,GY=140,GW=220,GH=208,L=4.4,pxu=(GH-30)/L,
  txt=(s2,x,y,col,sz,al)=>{c.save();c.font='600 '+sz+'px system-ui,sans-serif';c.fillStyle=col;c.textAlign=al||'center';c.textBaseline='middle';c.fillText(s2,x,y);c.restore()},
  rr=(x,y,w,h,r)=>{c.beginPath();c.roundRect?c.roundRect(x,y,w,h,r):c.rect(x,y,w,h)};
  /* buffer tank with electrodes: cathode (−, black) at the wells end, anode (+, red) at the far end */
  c.save();c.fillStyle='rgba(120,160,190,.18)';c.strokeStyle='rgba(170,200,225,.55)';c.lineWidth=2;rr(GX-30,GY-30,GW+60,GH+60,12);c.fill();c.stroke();c.restore();
  c.save();c.fillStyle='#202428';rr(GX-30,GY-22,GW+60,8,3);c.fill();c.fillStyle='#d83b3b';rr(GX-30,GY+GH+14,GW+60,8,3);c.fill();c.restore();
  txt('− cathode',GX+GW+34,GY-18,C.white,12,'left');txt('+ anode',GX+GW+34,GY+GH+18,C.red,12,'left');
  /* agarose gel slab with wells */
  c.save();const g=c.createLinearGradient(GX,GY,GX+GW,GY+GH);g.addColorStop(0,'rgba(170,215,235,.9)');g.addColorStop(1,'rgba(120,180,210,.85)');c.fillStyle=g;c.strokeStyle='rgba(220,240,250,.7)';c.lineWidth=1.5;rr(GX,GY,GW,GH,8);c.fill();c.stroke();c.restore();
  const lanes=[[GX+GW*.28,LADDER,'ladder'],[GX+GW*.72,[p.cut],'your sample']];
  lanes.forEach(([x,sizes,name])=>{c.save();c.fillStyle='#0f2030';rr(x-26,GY+8,52,10,3);c.fill();c.restore();txt(name,x,GY-42,C.muted,12);
   sizes.forEach(bp=>{const d=Math.min(L-.2,gelDist(p,bp)),y=GY+24+d*pxu,off=d>=L-.2-1e-6,col=name==='ladder'?'#ffa94d':'#ffd08a';c.save();c.shadowColor='#ff8f1f';c.shadowBlur=off?0:10;c.globalAlpha=off?.35:1;c.fillStyle=col;rr(x-24,y-3,48,6,3);c.fill();c.restore();if(name==='ladder')txt(bp>=1000?(bp/1000)+' kb':bp+' bp',x-32,y,C.muted,10,'right');else txt(bp+' bp',x+30,y,C.gold,11,'left')})});
  txt('smaller fragments run farther',GX-22,GY+GH+34,C.muted,11,'left');
  c.save();c.strokeStyle='#8fd3ff';c.fillStyle='#8fd3ff';c.lineWidth=2;c.beginPath();c.moveTo(GX-52,GY+40);c.lineTo(GX-52,GY+GH-30);c.stroke();c.beginPath();c.moveTo(GX-58,GY+GH-36);c.lineTo(GX-52,GY+GH-26);c.lineTo(GX-46,GY+GH-36);c.stroke();c.restore();txt('DNA (negative)',GX-62,GY+GH*.42,'#8fd3ff',11,'right');txt('moves to the anode',GX-62,GY+GH*.42+14,'#8fd3ff',11,'right')},
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
 draw:(c,p,t)=>{const st=p.step,bw=p.screen==='bw',
  txt=(s2,x,y,col,sz,al)=>{c.save();c.font='600 '+sz+'px system-ui,sans-serif';c.fillStyle=col;c.textAlign=al||'center';c.textBaseline='middle';c.fillText(s2,x,y);c.restore()},
  SEG=[[.15,1.3,'#ff6b6b','ampᴿ'],[1.45,2.6,'#69db7c',bw?'lacZ':'tetᴿ'],[2.75,4.0,'#4dabf7','ori'],[4.15,5.4,'#ced4da','other']],
  arc=(x,y,r,a0,a1,col,w)=>{c.save();c.strokeStyle=col;c.lineWidth=w;c.lineCap='round';c.beginPath();c.arc(x,y,r,a0,a1);c.stroke();c.restore()},
  /* plasmid: circular DNA with labelled regions; gap (open) at angle -π/2 when cut */
  plasmid=(x,y,r,open,ins)=>{const AM=.455;for(const [a0,a1,col,lab] of SEG){arc(x,y,r,a0-Math.PI/2,a1-Math.PI/2,col,12)}
   if(open){c.save();c.fillStyle='#0f2030';c.beginPath();c.arc(x+Math.cos(AM)*r,y+Math.sin(AM)*r,11,0,TAU);c.fill();c.restore()}
   if(ins){arc(x,y,r,AM-.3,AM+.3,'#ffd43b',12)}
   for(const [a0,a1,col,lab] of SEG){const am=(a0+a1)/2-Math.PI/2;txt(lab,x+Math.cos(am)*(r+34),y+Math.sin(am)*(r+34),col,12)}};
  const gc=(x,y)=>{c.save();c.strokeStyle='#f1f3f5';c.lineWidth=1.2;c.setLineDash([2,3]);c.beginPath();c.moveTo(x,y-34);c.lineTo(x,y+34);c.stroke();c.restore()};
  if(st===1){plasmid(180,260,70,true,false);
   /* EcoRI cut: GAATTC site with staggered sticky ends */
   txt('vector (plasmid)',180,376,C.white,12);txt('EcoRI site G^AATTC',298,332,'#ffe08a',11,'left');
   c.save();c.strokeStyle='#ffe08a';c.lineWidth=1.4;c.beginPath();c.moveTo(250,298);c.lineTo(296,328);c.stroke();c.restore();
   c.save();c.lineCap='round';c.lineWidth=6;c.strokeStyle='#ffd43b';c.beginPath();c.moveTo(344,236);c.lineTo(400,236);c.moveTo(452,236);c.lineTo(580,236);c.stroke();c.strokeStyle='#ffd43b';c.beginPath();c.moveTo(344,252);c.lineTo(414,252);c.moveTo(438,252);c.lineTo(580,252);c.stroke();
   c.strokeStyle='#ff8787';c.lineWidth=3;c.beginPath();c.moveTo(400,236);c.lineTo(400,246);c.moveTo(452,236);c.lineTo(452,246);c.stroke();c.restore();
   txt('foreign DNA (with gene of interest)',470,176,C.gold,12);txt("sticky ends: single-strand overhangs 5'-AATT-3'",460,280,'#ff9d9d',11);
   c.save();c.strokeStyle='#e9ecef';c.lineWidth=2.4;c.lineCap='round';for(const [x,y] of[[420,222],[426,222]]){c.beginPath();c.moveTo(x-8,y-9);c.lineTo(x+8,y+9);c.stroke();c.beginPath();c.moveTo(x+8,y-9);c.lineTo(x-8,y+9);c.stroke()}c.restore();txt('EcoRI cuts both DNAs',470,198,C.white,11)}
  else if(st===2){plasmid(230,258,76,false,true);txt('recombinant plasmid',230,384,C.white,12);txt('foreign DNA inserted inside the marker gene',330,318,'#ffd43b',11,'left');
   c.save();c.strokeStyle='#ffd43b';c.lineWidth=1.4;c.beginPath();c.moveTo(296,288);c.lineTo(328,312);c.stroke();c.restore();
   txt('1  sticky ends pair by H-bonds',420,216,C.white,13,'left');txt('2  DNA ligase seals the sugar–phosphate backbone',420,246,C.white,13,'left');txt('→ recombinant DNA',420,278,C.gold,14,'left')}
  else if(st===3){
   /* bacterium: rod-shaped cell with nucleoid and the incoming plasmid */
   c.save();const g=c.createLinearGradient(0,200,0,330);g.addColorStop(0,'#c5e87a');g.addColorStop(1,'#6a9a1d');c.fillStyle=g;c.strokeStyle='#4d7513';c.lineWidth=3;c.beginPath();c.roundRect?c.roundRect(250,190,330,150,75):c.rect(250,190,330,150);c.fill();c.stroke();c.fillStyle='rgba(255,255,255,.18)';c.beginPath();c.roundRect?c.roundRect(290,200,250,30,15):c.rect(290,200,250,30);c.fill();c.restore();
   c.save();c.strokeStyle='#f8e9a0';c.lineWidth=2;c.lineJoin='round';c.beginPath();for(let i=0;i<=70;i++){const a=i*.45,r=14+i*.5,x=395+Math.cos(a)*r*1.9*(i/70*.6+.4),y=268+Math.sin(a)*r*.7*.8;i?c.lineTo(x,y):c.moveTo(x,y)}c.stroke();c.restore();txt('chromosome (nucleoid)',395,320,'#2f4a0a',11);
   const q=cycle(t*.3,1),px=130+q*190,py=262;arc(px,py,24,0,TAU,'#4dabf7',6);c.save();c.strokeStyle='#ffd43b';c.lineWidth=6;c.beginPath();c.arc(px,py,24,-1.3,-.6);c.stroke();c.restore();arc(470,262,18,0,TAU,'#4dabf7',5);c.save();c.strokeStyle='#ffd43b';c.lineWidth=5;c.beginPath();c.arc(470,262,18,-1.3,-.6);c.stroke();c.restore();
   txt('recombinant plasmid',130,222,C.white,12);txt('competent E. coli (host)',415,164,C.white,13);txt('plasmid inside',470,298,C.white,11);txt('enters after heat shock / CaCl₂',130,310,C.muted,11)}
  else{/* petri dish with colonies */
   c.save();const g=c.createRadialGradient(300,270,10,300,270,120);g.addColorStop(0,'rgba(255,236,200,.9)');g.addColorStop(1,'rgba(240,200,140,.85)');c.fillStyle=g;c.strokeStyle='rgba(220,235,245,.8)';c.lineWidth=4;c.beginPath();c.arc(300,270,118,0,TAU);c.fill();c.stroke();c.strokeStyle='rgba(255,255,255,.35)';c.lineWidth=2;c.beginPath();c.arc(300,270,108,.2,1.2);c.stroke();c.restore();
   for(let i=0;i<22;i++){const a=TAU*hash(i),r=92*Math.sqrt(hash(i+3)),rec=hash(i+7)<.35,x=300+r*Math.cos(a),y=270+r*Math.sin(a),col=bw?(rec?'#f8f9fa':'#1c7ed6'):(rec?'#ffd43b':'#adb5bd');c.save();const gg=c.createRadialGradient(x-2,y-2,1,x,y,8);gg.addColorStop(0,'#fff7');gg.addColorStop(.35,col);gg.addColorStop(1,col);c.fillStyle=col;c.strokeStyle='rgba(0,0,0,.35)';c.lineWidth=1;c.beginPath();c.arc(x,y,7.5,0,TAU);c.fill();c.stroke();c.fillStyle='rgba(255,255,255,.35)';c.beginPath();c.arc(x-2.2,y-2.4,2.4,0,TAU);c.fill();c.restore()}
   txt('plate with ampicillin',300,396,C.muted,11);
   const L=bw?[['#f8f9fa','white = recombinant'],['#1c7ed6','blue = non-recombinant']]:[['#ffd43b','yellow = recombinant'],['#adb5bd','grey = non-recombinant']];L.forEach((e,i)=>{c.save();c.fillStyle=e[0];c.strokeStyle='rgba(0,0,0,.4)';c.beginPath();c.arc(448,224+i*34,9,0,TAU);c.fill();c.stroke();c.restore();txt(e[1],464,224+i*34,C.white,12,'left')})}
  tag(c,CLONE[st-1][0]+(st===4?(bw?' — white = recombinant':' — yellow = recombinant'):''),44,98,C.gold,14)},
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
