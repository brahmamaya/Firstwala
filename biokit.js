/* Biology drawing kit on top of Physica3D: cells, membranes, chromosomes, DNA,
   plant organs and charts. Colours follow common textbook conventions. */
(() => {
'use strict';
const P3=window.Physica3D,V=P3.vec,TAU=Math.PI*2;
const BC={membrane:'#f2a7b5',cytoplasm:'#f6d6c2',nucleus:'#7b5cc4',nucleolus:'#4b2f8f',chloroplast:'#3fa34d',mito:'#e8743b',er:'#5aa0d8',golgi:'#f0b84a',ribosome:'#5b4a8a',vacuole:'#9ad1f0',wall:'#7fbf5f',
  blood:'#c8102e',vein:'#3b5bdb',artery:'#e03131',bone:'#ede3c8',muscle:'#c2414b',nerve:'#ffd43b',fat:'#ffe8a3',
  A:'#ff6b6b',T:'#ffd166',G:'#4ecdc4',C:'#5c7cfa',U:'#c77dff',backbone:'#dfe7ee',leaf:'#4caf50',stem:'#6b8e23',root:'#c2a26b',petal:'#ff8fab',soil:'#6d4c2f',water:'#4dabf7',male:'#4dabf7',female:'#f783ac'};
const hash=i=>{const x=Math.sin(i*127.1+311.7)*43758.5453;return x-Math.floor(x)};
// A rounded capsule along a→b.
function capsule(s,a,b,r,col,opt={}){s.tube([a,V.mul(V.add(a,b),.5),b],r,col,{segs:opt.segs||12,...opt});s.ball(a,r*.98,col,{flat:true});s.ball(b,r*.98,col,{flat:true});return s}
// One duplicated or single chromosome; arm length L, oriented by angle in the xy plane.
function chromosome(s,p,L,col,ang=0,sisters=true,opt={}){const d=[Math.cos(ang+Math.PI/2),Math.sin(ang+Math.PI/2),0],off=[Math.cos(ang)*.07,Math.sin(ang)*.07,0];
  const arms=sisters?[V.add(p,off),V.sub(p,off)]:[p];for(const q of arms){capsule(s,V.add(q,V.mul(d,L*.55)),V.sub(q,V.mul(d,L*.45)),opt.r||.07,col)}s.ball(p,(opt.r||.07)*1.15,opt.cen||'#2b2b2b',{flat:true,lift:.2});return s}
// B-DNA ladder between two points; seq colours rungs. phase spins it.
function helix(s,a,b,turns,r,seq='ATGCATGCGA',phase=0,opt={}){const d=V.sub(b,a),L=Math.hypot(...d),n=V.norm(d),h=Math.abs(n[1])<.9?[0,1,0]:[1,0,0],u=V.norm(V.cross(n,h)),w=V.cross(n,u),N=Math.round(turns*10);const s1=[],s2=[];
  for(let i=0;i<=N*3;i++){const k=i/(N*3),q=TAU*turns*k+phase,c=V.add(a,V.mul(n,k*L));s1.push(V.add(c,V.add(V.mul(u,r*Math.cos(q)),V.mul(w,r*Math.sin(q)))));s2.push(V.add(c,V.add(V.mul(u,r*Math.cos(q+Math.PI*.82)),V.mul(w,r*Math.sin(q+Math.PI*.82)))))}
  s.tube(s1,opt.bw||.045,opt.c1||BC.backbone,{segs:8});s.tube(s2,opt.bw||.045,opt.c2||'#b9c6d2',{segs:8});
  const pair={A:'T',T:'A',G:'C',C:'G',U:'A'};for(let i=0;i<=N;i++){const k=i/N,q=TAU*turns*k+phase,c=V.add(a,V.mul(n,k*L)),p1=V.add(c,V.add(V.mul(u,r*Math.cos(q)),V.mul(w,r*Math.sin(q)))),p2=V.add(c,V.add(V.mul(u,r*Math.cos(q+Math.PI*.82)),V.mul(w,r*Math.sin(q+Math.PI*.82)))),m=V.mul(V.add(p1,p2),.5),b1=seq[i%seq.length];
    s.seg(p1,m,BC[b1]||'#ccc',opt.rw||4);s.seg(m,p2,BC[pair[b1]]||'#ccc',opt.rw||4)}return s}
// Generic eukaryotic cell body: translucent membrane, cytoplasm tint and nucleus.
function cell(s,p,r,opt={}){s.mesh(p,[r,r*(opt.squash||.92),r],opt.col||BC.membrane,{alpha:opt.alpha??.22,rings:12,segs:18,shape:opt.shape});if(opt.nucleus!==false){s.mesh(V.add(p,opt.nOff||[0,0,0]),r*(opt.nr||.32),BC.nucleus,{rings:10,segs:14});s.ball(V.add(p,V.add(opt.nOff||[0,0,0],[r*.06,r*.08,r*.12])),r*.09,BC.nucleolus,{lift:.3})}return s}
// Flat leaf blade (two-sided), with a midrib, attached at base a pointing along dir.
function leaf(s,a,dir,len,wid,col=BC.leaf,tilt=0){const n=V.norm(dir),cr=V.cross(n,[0,1,0]),side=Math.hypot(...cr)>1e-3?V.norm(cr):[1,0,0],up=V.cross(side,n),sideT=V.add(V.mul(side,Math.cos(tilt)),V.mul(up,Math.sin(tilt)));const pts=[];
  for(let i=0;i<=10;i++){const k=i/10,w=Math.sin(Math.PI*k)*wid*(1-.3*k);pts.push([V.add(V.add(a,V.mul(n,k*len)),V.mul(sideT,w)),V.add(V.add(a,V.mul(n,k*len)),V.mul(sideT,-w))])}
  for(let i=0;i<10;i++){s.poly([pts[i][0],pts[i+1][0],V.add(a,V.mul(n,(i+1)/10*len)),V.add(a,V.mul(n,i/10*len))],col,{cull:false,spec:.3});s.poly([V.add(a,V.mul(n,i/10*len)),V.add(a,V.mul(n,(i+1)/10*len)),pts[i+1][1],pts[i][1]],col,{cull:false,spec:.3})}
  s.seg(a,V.add(a,V.mul(n,len)),'#2f6b30',1.4);return s}
// Petal-like flat ellipse lobe.
function petal(s,a,dir,len,wid,col=BC.petal){return leaf(s,a,dir,len,wid,col,0)}
function soil(s,y=-1.6,w=4,d=2.4){s.box([0,y-.25,0],[w*2,.5,d*2],BC.soil,{ground:true});return s}
// Stylised but anatomically sensible organism models, facing +x, standing on y = p[1].
function critter(s,kind,p,k=1,t=0){const A=(x,y,z)=>V.add(p,[x*k,y*k,z*k]),skin='#e0b48a';
  switch(kind){
  case'human':{const pants='#2f4b7c',shirt='#2f9e8f',hair='#3b2a1a',sw=.06*Math.sin(t*2);
    for(const z of[-1,1]){s.tube([A(0,.95,z*.1),A(.02,.52,z*.1),A(0,.1,z*.1)],u=>(.075-.02*u)*k,pants,{segs:10});s.mesh(A(.05,.04,z*.1),[.12*k,.045*k,.06*k],'#2b2b2b')}
    s.mesh(A(0,1.0,0),[.12*k,.1*k,.17*k],pants);s.mesh(A(0,1.27,0),[.12*k,.27*k,.2*k],shirt,{shape:(u)=>.88+.14*Math.sin(u)});
    for(const z of[-1,1]){const sh=A(0,1.46,z*.23),el=A(z*sw,1.2,z*.27),wr=A(.05+z*sw*1.5,.95,z*.28);s.tube([sh,el],.055*k,shirt,{segs:8});s.tube([el,wr],.045*k,skin,{segs:8});s.ball(wr,.045*k,skin,{flat:true})}
    s.tube([A(0,1.52,0),A(0,1.6,0)],.045*k,skin,{segs:8});s.mesh(A(0,1.72,0),[.1*k,.125*k,.095*k],skin);s.mesh(A(-.018,1.775,0),[.1*k,.09*k,.1*k],hair,{shape:(u,v)=>Math.cos(v)>.35&&u<.5?.85:1});
    for(const z of[-1,1])s.ball(A(.092,1.735,z*.035),.012*k,'#1b1b1b',{flat:true,lift:.5});break}
  case'insect':case'cockroach':{const col=kind==='cockroach'?'#7a3e1d':'#2f3640';s.mesh(A(.55,.35,0),[.13*k,.12*k,.13*k],col);s.mesh(A(.25,.35,0),[.2*k,.14*k,.17*k],col);s.mesh(A(-.3,.32,0),[.42*k,.13*k,.22*k],kind==='cockroach'?'#8b4513':'#3d4a57',{shape:(u,v)=>1+.04*Math.sin(v*8)});
    for(const sx of[.4,.25,.1])for(const z of[-1,1]){const kn=A(sx-.05,.42,z*.32);s.tube([A(sx,.32,z*.12),kn,A(sx-.12,0,z*.5)],.022*k,'#3b2a1a',{segs:6})}
    for(const z of[-1,1])s.tube([A(.65,.42,z*.05),A(.95,.7,z*.25),A(1.25,.75,z*.5)],.012*k,'#3b2a1a',{segs:5});
    for(const z of[-1,1])s.poly([A(.3,.48,0),A(-.65,.5,z*.15),A(-.5,.5,z*.42),A(.2,.48,z*.18)],kind==='cockroach'?'#a0522d':'#cfe8ff',{alpha:kind==='cockroach'?.85:.45,cull:false,spec:.6});break}
  case'fish':s.mesh(A(0,.5,0),[.55*k,.25*k,.13*k],'#4dabf7',{shape:(u,v)=>1-.25*Math.max(0,-Math.cos(v))*(1-Math.abs(Math.sin(u)))});s.poly([A(-.5,.5,0),A(-.85,.75+.05*Math.sin(t*6),0),A(-.85,.25+.05*Math.sin(t*6),0)],'#339af0',{cull:false});s.poly([A(0,.73,0),A(-.2,.92,0),A(-.25,.72,0)],'#339af0',{cull:false});s.ball(A(.38,.56,.1),.04*k,'#111');break;
  case'frog':s.mesh(A(0,.3,0),[.45*k,.24*k,.32*k],'#5c940d');s.mesh(A(.35,.42,0),[.22*k,.16*k,.24*k],'#66a80f');for(const z of[-1,1]){s.ball(A(.45,.58,z*.12),.07*k,'#d8f5a2');s.ball(A(.5,.6,z*.13),.035*k,'#111');s.tube([A(-.25,.25,z*.25),A(-.1,.1,z*.5),A(-.45,.02,z*.55),A(-.2,0,z*.75)],.06*k,'#5c940d',{segs:8});s.tube([A(.25,.2,z*.25),A(.35,.02,z*.38)],.045*k,'#5c940d',{segs:8})}break;
  case'bird':s.mesh(A(0,.55,0),[.38*k,.22*k,.2*k],'#868e96');s.ball(A(.38,.78,0),.14*k,'#868e96');s.poly([A(.5,.8,0),A(.68,.76,0),A(.5,.74,0)],'#f59f00',{cull:false});s.ball(A(.45,.83,.1),.025*k,'#111');for(const z of[-1,1])s.poly([A(.2,.62,z*.15),A(-.25,.65+.15*Math.sin(t*5),z*.6),A(-.35,.6,z*.2)],'#6c757d',{cull:false});s.poly([A(-.35,.55,0),A(-.7,.62,.12),A(-.7,.62,-.12)],'#6c757d',{cull:false});for(const z of[-.07,.07])s.seg(A(0,.35,z),A(0,0,z),'#f59f00',2);break;
  case'earthworm':{const pts=Array.from({length:30},(_,i)=>A(-1+i*.07,.12+.04*Math.sin(i*.6-t*3),.12*Math.sin(i*.3)));s.tube(pts,.09*k,(i)=>i>.18&&i<.3?'#b5651d':((Math.round(i*40)%2)?'#c97b63':'#d08b74'),{segs:10});break}
  case'mango':s.mesh(A(0,.45,0),[.32*k,.42*k,.28*k],(i)=>i>.6?'#f08c00':i>.35?'#fab005':'#82c91e',{shape:(u,v)=>1+.12*Math.sin(u)*Math.cos(v)});s.tube([A(0,.86,0),A(.05,1.05,0)],.02*k,'#5c3d1e',{segs:6});leaf(s,A(.05,1.02,0),[1,.4,0],.55*k,.13*k);break;
  case'wheat':s.tube([A(0,0,0),A(.02,.9,0),A(.04,1.3,0)],.02*k,'#c9a227',{segs:6});for(let i=0;i<9;i++)for(const z of[-1,1])s.mesh(A(.04+z*.04,1.32+i*.06,z*.03),[.03*k,.05*k,.025*k],'#e0b84a',{rings:6,segs:8,rot:[0,0,z*.4]});leaf(s,A(0,.45,0),[.8,.6,.2],.6*k,.05*k,'#a9c46c');break;
  case'mushroom':s.lathe(A(0,0,0),[[.06,0],[.07,.4],[.06,.55]],'#f1e3c6');s.lathe(A(0,0,0),[[.05,.5],[.42,.55],[.4,.62],[.3,.75],[.12,.82],[0,.84]],'#c0392b');for(let i=0;i<8;i++){const a=TAU*i/8;s.ball(A(.22*Math.cos(a),.74,.22*Math.sin(a)),.03*k,'#fff',{flat:true})}break;
  case'bacterium':capsule(s,A(-.3,.3,0),A(.3,.3,0),.16*k,'#82c91e');break;
  case'paramecium':s.mesh(A(0,.4,0),[.55*k,.18*k,.2*k],'#a5d8ff',{alpha:.6,shape:(u,v)=>1-.18*Math.exp(-((v-1.6)**2))});s.mesh(A(0,.4,0),.08*k,BC.nucleus);for(let i=0;i<30;i++){const v=TAU*i/30,u=Math.sin(i*1.7)*.8;s.seg(A(.55*Math.cos(u)*Math.cos(v),.4+.18*Math.sin(u),.2*Math.cos(u)*Math.sin(v)),A(.62*Math.cos(u)*Math.cos(v),.4+.21*Math.sin(u)+.02*Math.sin(t*9+i),.24*Math.cos(u)*Math.sin(v)),'#74c0fc',1)}break;
  case'plant':s.tube([A(0,0,0),A(0,1.2,0)],.035*k,'#5c940d',{segs:8});for(let i=0;i<4;i++){const a=i*2.4;leaf(s,A(0,.3+i*.25,0),[Math.cos(a),.5,Math.sin(a)],.45*k,.14*k)}break;
  case'sponge':s.lathe(A(0,0,0),[[.18,0],[.3,.3],[.32,.7],[.24,1.0],[.2,1.02]],'#e8a33c');for(let i=0;i<24;i++){const a=TAU*hash(i),y=.15+.8*hash(i+7),r=.2+.12*Math.sin(Math.PI*y);s.ball(A(r*Math.cos(a),y,r*Math.sin(a)),.03*k,'#7a4a12',{flat:true})}break;
  case'hydra':s.tube([A(0,0,0),A(0,.5,0),A(.02,.9,0)],u=>.07*k*(1-u*.2),'#e9c46a',{segs:10});for(let i=0;i<6;i++){const a=TAU*i/6;s.tube([A(0,.9,0),A(.15*Math.cos(a),1.05,.15*Math.sin(a)),A(.35*Math.cos(a),1.0+.08*Math.sin(t*3+i),.35*Math.sin(a))],.018*k,'#e9c46a',{segs:6})}break;
  case'combjelly':s.mesh(A(0,.55,0),[.32*k,.45*k,.32*k],'#d0ebff',{alpha:.45});for(let i=0;i<8;i++){const a=TAU*i/8;s.path(Array.from({length:9},(_,j)=>{const u=-1.2+2.4*j/8;return A(.33*Math.cos(u)*Math.cos(a),.55+.46*Math.sin(u),.33*Math.cos(u)*Math.sin(a))}),['#ff6b6b','#ffd43b','#69db7c','#4dabf7','#9775fa','#f783ac','#38d9a9','#ffa94d'][(i+Math.floor(t*4))%8],2.5)}break;
  case'flatworm':s.mesh(A(0,.06,0),[.6*k,.04*k,.18*k],'#d9a7a0',{shape:(u,v)=>1-.25*Math.max(0,Math.cos(v))});s.ball(A(.45,.1,.05),.02*k,'#111');s.ball(A(.45,.1,-.05),.02*k,'#111');break;
  case'roundworm':s.tube(Array.from({length:24},(_,i)=>A(-.9+i*.08,.06,.15*Math.sin(i*.45+t))),u=>.04*k*(1-Math.abs(u-.5)),'#f1d3c2',{segs:8});break;
  case'snail':{const sh=[];for(let i=0;i<60;i++){const q=i/60*TAU*2.4,r=.05+.3*(i/60);sh.push(A(-.05+r*Math.cos(q)*.3,.45+r*Math.sin(q),r*Math.cos(q)))}s.tube(sh,u=>.04*k+.14*k*u,'#b5651d',{segs:12});s.mesh(A(.15,.12,0),[.5*k,.1*k,.16*k],'#c9b29b');for(const z of[-.05,.05])s.tube([A(.55,.18,z),A(.7,.4,z*3)],.015*k,'#c9b29b',{segs:5});break}
  case'starfish':s.ball(A(0,.08,0),.2*k,'#f76707');for(let i=0;i<5;i++){const a=TAU*i/5;capsule(s,A(.1*Math.cos(a),.08,.1*Math.sin(a)),A(.65*Math.cos(a),.06,.65*Math.sin(a)),.09*k,'#f76707')}break;
  case'balanoglossus':s.mesh(A(.75,.15,0),[.18*k,.1*k,.1*k],'#ffa8a8');s.cyl(A(.53,.15,0),[1,0,0],.11*k,.22*k,'#ff8787');s.tube(Array.from({length:20},(_,i)=>A(.4-i*.07,.13+.03*Math.sin(i*.8),.1*Math.sin(i*.4))),.09*k,'#e599a7',{segs:10});break;
  case'fern':s.tube([A(0,0,0),A(0,.2,0)],.06*k,'#6d4c2f',{segs:6});for(let f=0;f<5;f++){const a=TAU*f/5+.3,dir=[Math.cos(a),1.1,Math.sin(a)],n=V.norm(dir);const pts=Array.from({length:8},(_,i)=>V.add(A(0,.2,0),V.mul(V.add(V.mul(n,i*.13),[0,-.008*i*i,0]),k)));s.path(pts,'#2f9e44',2);for(let i=1;i<8;i++){const side=V.norm(V.cross(n,[0,1,0]));leaf(s,pts[i],V.add(side,[0,.2,0]),.22*k*(1-i/9),.05*k,'#40c057');leaf(s,pts[i],V.add(V.mul(side,-1),[0,.2,0]),.22*k*(1-i/9),.05*k,'#40c057')}}break;
  case'moss':for(let i=0;i<7;i++){const x=(hash(i)-.5)*.6,z=(hash(i+9)-.5)*.6;s.tube([A(x,0,z),A(x,.25,z)],.015*k,'#2b8a3e',{segs:5});for(let j=0;j<5;j++)leaf(s,A(x,.05+j*.05,z),[Math.cos(j*2.4),.8,Math.sin(j*2.4)],.08*k,.02*k,'#37b24d')}s.tube([A(0,.25,0),A(0,.75,0)],.008*k,'#a0522d',{segs:4});s.mesh(A(0,.8,0),[.03*k,.06*k,.03*k],'#8b5a2b');break;
  case'pine':s.cyl(A(0,.35,0),[0,1,0],.06*k,.7*k,'#6d4c2f');for(let i=0;i<4;i++)s.lathe(A(0,.45+i*.22,0),[[.42-i*.08,0],[.0,.4-i*.03]],'#2b8a3e',{segs:14});s.mesh(A(.25,.6,.1),[.05*k,.09*k,.05*k],'#8b5a2b');break;
  case'algae':for(let f=0;f<3;f++){const pts=Array.from({length:16},(_,i)=>A(-.2+f*.2+.08*Math.sin(i*.5+t+f),i*.07,.05*f));s.tube(pts,.035*k,'#69db7c',{alpha:.6,segs:8});s.helix(A(-.2+f*.2,.55,.05*f),[0,1,0],.025*k,1.0*k,5,'#2b8a3e',1.5)}break;
  }return s}
// Anatomical heart seen from the front (+z toward the viewer, +x = patient's left). aS/vS: atrial and ventricular squeeze 0..1.
// Textbook colours: right side (deoxygenated) blue, left side (oxygenated) red.
function heart(s,p,k=1,o={}){const ry=o.rotY||0,cy=Math.cos(ry),sy=Math.sin(ry),A=(x,y,z)=>V.add(p,[(x*cy+z*sy)*k,y*k,(-x*sy+z*cy)*k]),aS=o.aS||0,vS=o.vS||0,ra=1-.14*aS,rv=1-.13*vS,red='#d6336c',blue='#5c7cfa',dk='#b02a5b',db='#3b5bdb';
  s.mesh(A(.08,-.32,0),[.72*k*rv,.82*k*(1-.06*vS),.58*k*rv],(u,v)=>Math.cos(v*TAU)>-.15?red:blue,{rot:[0,0,.42],rot2:ry?[0,ry,0]:null,rings:14,segs:22,shape:(u)=>1-.42*Math.max(0,-Math.sin(u))**1.6,spec:.5});
  s.mesh(A(-.55,.5,.08),[.36*k*ra,.32*k*ra,.34*k*ra],blue,{rings:10,segs:14});s.mesh(A(.5,.56,-.28),[.32*k*ra,.27*k*ra,.3*k*ra],red,{rings:10,segs:14});
  s.tube([A(.05,.3,.02),A(.1,1.05,.02),A(.0,1.5,-.15),A(-.35,1.45,-.45),A(-.42,.9,-.6),A(-.42,.2,-.62)],.17*k,'#e03131',{segs:12});
  for(const [x,z] of[[.12,-.05],[-.08,-.2],[-.28,-.38]])s.tube([A(x,1.4,z),A(x*1.4,1.85,z)],.055*k,'#e03131',{segs:8});
  s.tube([A(-.18,.25,.38),A(-.12,.95,.4),A(.05,1.1,.25)],.15*k,db,{segs:12});for(const sg of[-1,1])s.tube([A(.05,1.1,.25),A(.55*sg+.05,1.12,.05)],.1*k,db,{segs:10});
  s.tube([A(-.68,1.55,-.05),A(-.62,.75,.02)],.14*k,db,{segs:10});s.tube([A(-.6,-.05,-.15),A(-.6,-.9,-.15)],.15*k,db,{segs:10});
  for(const y of[.48,.66])s.tube([A(1.0,y,-.3),A(.72,y,-.28)],.07*k,dk,{segs:8});return s}
window.PhysicaBio={BC,hash,capsule,chromosome,helix,cell,leaf,petal,soil,critter,heart};
})();
