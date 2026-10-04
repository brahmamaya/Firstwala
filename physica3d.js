/* Physica3D: a small, dependency-free 3D renderer plus a realistic shading layer.
   World units: x to the right, y up, z toward the viewer. Scenes are drawn with
   perspective, painter-sorted, lit by one fixed light, and seen through a shared
   orbit camera that the stage controls rotate and zoom. */
(() => {
'use strict';
const TAU=Math.PI*2,KEY='physica-realism',DIRS=['→','↗','↑','↖','←','↙','↓','↘'];
let enabled=true;try{enabled=localStorage.getItem(KEY)!=='off'}catch{}
let FLAT=false,ULTRA=false;const ON=()=>enabled&&!FLAT;
const DEFAULT={yaw:-0.55,pitch:0.36,zoom:1};
const cam={...DEFAULT,auto:false};
const LIGHT=(()=>{const v=[-0.45,0.8,0.42],m=Math.hypot(...v);return v.map(x=>x/m)})();
// Shading is painted on the unthemed context so white highlights and dark shadows stay neutral in every theme.
const RAW=new WeakMap(),raw=c=>{if(!c||!c.canvas||!c.canvas.getContext)return c;let r=RAW.get(c.canvas);if(!r){r=c.canvas.getContext('2d');RAW.set(c.canvas,r)}return r};
const light=()=>document.documentElement.style.colorScheme==='light';
const hexInfo=col=>{const m=typeof col==='string'&&/^#([\da-f]{6})([\da-f]{2})?$/i.exec(col);if(!m)return null;const n=parseInt(m[1],16);return{r:n>>16,g:(n>>8)&255,b:n&255,a:m[2]?parseInt(m[2],16)/255:1}};
const solid=(col,minA=.8)=>{const h=hexInfo(col);return!!h&&h.a>=minA};

function shadowFill(c,size){const R=raw(c);R.save();R.shadowColor=light()?'rgba(20,30,40,.22)':'rgba(0,0,0,.42)';R.shadowBlur=Math.min(6,2+size*.25);R.shadowOffsetX=Math.min(3,size*.1);R.shadowOffsetY=Math.min(5,1+size*.18);c.fill();R.restore()}
function shadeSphere(c,x,y,r){if(!ON()||!(r>=3))return;const R=raw(c);R.save();R.beginPath();R.arc(x,y,r,0,TAU);R.clip();const g=R.createRadialGradient(x-r*.38,y-r*.42,r*.04,x-r*.15,y-r*.18,r*1.12);g.addColorStop(0,'rgba(255,255,255,.62)');g.addColorStop(.2,'rgba(255,255,255,.16)');g.addColorStop(.55,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,.5)');R.fillStyle=g;R.fillRect(x-r,y-r,2*r,2*r);R.restore();R.beginPath()}
function shadeBox(c,x,y,w,h,r=0){if(!ON()||w<4||h<4)return;const R=raw(c);R.save();R.beginPath();R.roundRect(x,y,w,h,r);R.clip();const g=R.createLinearGradient(0,y,0,y+h);g.addColorStop(0,'rgba(255,255,255,.2)');g.addColorStop(.42,'rgba(255,255,255,0)');g.addColorStop(1,'rgba(0,0,0,.3)');R.fillStyle=g;R.fillRect(x,y,w,h);R.fillStyle='rgba(255,255,255,.22)';R.fillRect(x,y,w,Math.min(2,h*.12));R.restore();R.beginPath()}
// Used by the shared 2D primitives of the original experiments.
const sphereOK=(fill,r)=>ON()&&r>=4&&r<=150&&solid(fill);
const boxOK=(fill,w,h)=>{if(!ON()||w<6||h<6||w*h>60000)return false;const i=hexInfo(fill);return!!i&&i.a>=.8&&Math.max(i.r,i.g,i.b)>=42};
function backdrop(c){if(ULTRA)return studio(raw(c));if(!ON())return;const R=raw(c);R.save();const g=R.createRadialGradient(480,210,90,480,250,640);g.addColorStop(0,'rgba(255,255,255,.04)');g.addColorStop(.5,'rgba(0,0,0,0)');g.addColorStop(1,light()?'rgba(0,0,0,.1)':'rgba(0,0,0,.34)');R.fillStyle=g;R.fillRect(0,0,960,505);R.restore();R.beginPath()}

// ---------- Ultra-Realistic: a photographic workbench and a camera-like finishing pass ----------
const BOKEH=[[70,110,26,'255,190,110'],[150,86,14,'255,214,150'],[232,128,34,'120,200,255'],[318,92,18,'255,170,90'],[400,140,30,'255,200,130'],[470,96,12,'140,220,255'],[548,122,24,'255,180,100'],[620,90,16,'255,220,170'],[110,190,18,'255,160,80'],[590,200,22,'130,190,255'],[300,180,12,'255,230,190'],[500,210,16,'255,200,140']];
function studio(R){R.save();const w=R.createRadialGradient(340,170,30,340,200,620);w.addColorStop(0,'#3b3128');w.addColorStop(.55,'#1a1511');w.addColorStop(1,'#080706');R.fillStyle=w;R.fillRect(0,0,960,505);
  R.fillStyle='rgba(0,0,0,.35)';for(const [x,y,ww,h] of[[40,70,90,190],[560,60,110,210],[250,95,60,150]])R.fillRect(x,y,ww,h);
  R.globalCompositeOperation='lighter';for(const [x,y,r,col] of BOKEH){const g=R.createRadialGradient(x,y,r*.2,x,y,r);g.addColorStop(0,`rgba(${col},.16)`);g.addColorStop(.8,`rgba(${col},.10)`);g.addColorStop(1,`rgba(${col},0)`);R.fillStyle=g;R.beginPath();R.arc(x,y,r,0,TAU);R.fill()}R.globalCompositeOperation='source-over';
  const top=318,t=R.createLinearGradient(0,top,0,505);t.addColorStop(0,'#5a3a22');t.addColorStop(.25,'#4a2f1b');t.addColorStop(1,'#1c120a');R.fillStyle=t;R.fillRect(0,top,960,505-top);
  R.strokeStyle='rgba(20,10,4,.35)';R.lineWidth=1;for(let i=-14;i<=14;i++){R.beginPath();R.moveTo(340+i*22,top);R.lineTo(340+i*95,505);R.stroke()}
  const sh=R.createLinearGradient(0,top,0,top+70);sh.addColorStop(0,'rgba(255,220,180,.18)');sh.addColorStop(1,'rgba(255,220,180,0)');R.fillStyle=sh;R.fillRect(0,top,960,70);
  const fade=R.createLinearGradient(0,top-24,0,top+6);fade.addColorStop(0,'rgba(8,7,6,0)');fade.addColorStop(1,'rgba(8,7,6,.55)');R.fillStyle=fade;R.fillRect(0,top-24,960,30);R.restore();R.beginPath()}
// Camera finish, built for speed: the warm grade, vignette and film grain are baked once per size into
// one overlay; bloom is a tiny copy of the stage (scaled down, then up = free blur) refreshed every few frames.
let overlayC=null,ovKey='',bloomA=null,bloomB=null,bloomTick=0;
function finish(ctx){const cv=ctx.canvas,k=cv.width/960,full=!!window.PhysicaClean,X=0,Y=full?0:68,W=full?960:680,H=full?505:362,x=X*k,y=Y*k,w=W*k,h=H*k;
  if(!bloomA){bloomA=document.createElement('canvas');bloomB=document.createElement('canvas')}
  const aw=Math.max(8,Math.round(w/6)),ah=Math.max(8,Math.round(h/6)),bw=Math.max(4,Math.round(aw/2)),bh=Math.max(4,Math.round(ah/2));
  if(bloomA.width!==aw||bloomA.height!==ah){bloomA.width=aw;bloomA.height=ah;bloomB.width=bw;bloomB.height=bh;bloomTick=0}
  ctx.save();ctx.setTransform(1,0,0,1,0,0);
  if(bloomTick++%3===0){const a=bloomA.getContext('2d'),b=bloomB.getContext('2d');a.globalCompositeOperation='copy';a.drawImage(cv,x,y,w,h,0,0,aw,ah);b.globalCompositeOperation='copy';b.drawImage(bloomA,0,0,aw,ah,0,0,bw,bh)}
  ctx.globalCompositeOperation='screen';ctx.globalAlpha=.42;ctx.imageSmoothingEnabled=true;ctx.drawImage(bloomB,0,0,bw,bh,x,y,w,h);ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
  const key=cv.width+'x'+cv.height+(full?'f':'');if(ovKey!==key){ovKey=key;overlayC=document.createElement('canvas');overlayC.width=Math.ceil(w);overlayC.height=Math.ceil(h);const o=overlayC.getContext('2d');
    o.fillStyle='rgba(255,170,90,.07)';o.fillRect(0,0,w,h);const v=o.createRadialGradient(w/2,h*.45,h*.35,w/2,h/2,w*.62);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.5)');o.fillStyle=v;o.fillRect(0,0,w,h);
    const g=o.getImageData(0,0,overlayC.width,overlayC.height),d=g.data;for(let i=0;i<d.length;i+=4){const n=(Math.random()-.5)*18;d[i]=Math.max(0,Math.min(255,d[i]+n));d[i+1]=Math.max(0,Math.min(255,d[i+1]+n));d[i+2]=Math.max(0,Math.min(255,d[i+2]+n));d[i+3]=Math.max(d[i+3],6)}o.putImageData(g,0,0)}
  ctx.drawImage(overlayC,x,y);ctx.restore()}

const sub=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]],add=(a,b)=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]],mul=(a,k)=>[a[0]*k,a[1]*k,a[2]*k];
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],dot3=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const norm=a=>{const m=Math.hypot(...a)||1;return mul(a,1/m)};
// Rotation by Euler angles [x, y, z] (radians), applied x then y then z.
function rotator(r){if(!r)return a=>a;const [x,y,z]=r,cx=Math.cos(x),sx=Math.sin(x),cy=Math.cos(y),sy=Math.sin(y),cz=Math.cos(z),sz=Math.sin(z);return([a,b,c])=>{let B=b*cx-c*sx,C=b*sx+c*cx,A=a*cy+C*sy;C=-a*sy+C*cy;return[A*cz-B*sz,A*sz+B*cz,C]}}
function basis(axis){const n=norm(axis),h=Math.abs(n[1])<.9?[0,1,0]:[1,0,0],u=norm(cross(n,h)),v=cross(n,u);return[n,u,v]}

// Pre-shaded colour for a face: darken by k, then lift towards white by highlight + specular - one fill instead of three.
const SHADE=new Map();
function shaded(col,k,hl,sp,alpha){const h=hexInfo(col);if(!h)return null;const q=v=>Math.round(v*48)/48,K=q(k),L=q(Math.min(1,hl+sp)),A=alpha!=null&&alpha<1?alpha:h.a,key=col+K+'|'+L+'|'+A;let r=SHADE.get(key);if(r)return r;
  const f=v=>{let x=v*(1-K);x+=(255-x)*L;return Math.round(x)};const hx=v=>f(v).toString(16).padStart(2,'0');r='#'+hx(h.r)+hx(h.g)+hx(h.b)+(A<1?Math.round(A*255).toString(16).padStart(2,'0'):'');if(SHADE.size>4000)SHADE.clear();SHADE.set(key,r);return r}
function scene(c,o={}){
  const yaw=FLAT?0:cam.yaw+(o.yaw||0),pitch=FLAT?.3:Math.max(-1.45,Math.min(1.45,cam.pitch+(o.pitch||0)));
  const cx=o.cx??348,cy=o.cy??262,sc=(o.scale??62)*1.15*(FLAT?1:cam.zoom)*(o.boost??window.PhysicaSceneBoost??1),focal=FLAT?600:(o.focal??16);
  const cyw=Math.cos(yaw),syw=Math.sin(yaw),cp=Math.cos(pitch),sp=Math.sin(pitch);
  const items=[];
  const view=([x,y,z])=>{const X=x*cyw+z*syw,Z0=-x*syw+z*cyw;return[X,y*cp-Z0*sp,y*sp+Z0*cp]};
  function P(p){const [X,Y,Z]=view(p),f=focal/Math.max(.6,focal-Z);return[cx+X*sc*f,cy-Y*sc*f,Z,f]}
  const facing=n=>{const v=view(n);return v[2]};
  const LV=view(LIGHT),HV=norm(add(LV,[0,0,1]));
  const push=(z,draw)=>items.push({z,draw});
  const S={P,sc,cam,
    seg(a,b,col='#8ca6b9',w=2,dash=[],zo){const A=P(a),B=P(b);push(zo??(A[2]+B[2])/2,()=>{c.save();c.beginPath();c.setLineDash(dash);c.moveTo(A[0],A[1]);c.lineTo(B[0],B[1]);c.strokeStyle=col;c.lineWidth=w;c.lineCap='round';c.stroke();c.restore()});return S},
    path(pts,col='#42d9ca',w=2.5,dash=[],z){if(pts.length<2)return S;const Q=pts.map(P),zz=z??Q.reduce((s,q)=>s+q[2],0)/Q.length;push(zz,()=>{c.save();c.beginPath();c.setLineDash(dash);c.moveTo(Q[0][0],Q[0][1]);for(const q of Q.slice(1))c.lineTo(q[0],q[1]);c.strokeStyle=col;c.lineWidth=w;c.lineJoin='round';c.lineCap='round';c.stroke();c.restore()});return S},
    // Long curves sorted piecewise so they weave correctly in front of and behind solids.
    curve(pts,col='#42d9ca',w=2.5,chunk=6){for(let i=0;i<pts.length-1;i+=chunk)S.path(pts.slice(i,Math.min(pts.length,i+chunk+1)),col,w);return S},
    // lab: optional 'name = value unit'; a screen-direction glyph is appended automatically.
    arrow(a,b,col='#42d9ca',w=3,head=11,lab){const A=P(a),B=P(b);if(lab!=null&&lab!==''){const ang=Math.atan2(B[1]-A[1],B[0]-A[0]),L=Math.hypot(B[0]-A[0],B[1]-A[1]),g=L<2?'':' '+DIRS[((Math.round(-ang/(Math.PI/4))%8)+8)%8],k=window.PhysicaTextScale||1,ox=Math.cos(ang),oy=Math.sin(ang),al=Math.abs(ox)<.35?'center':ox>0?'left':'right';push(1e6-1,()=>S._label(B[0]+ox*(10+6*k),B[1]+oy*(10+8*k)+(Math.abs(ox)<.35?0:-2),String(lab)+g,col,12,al))}push(Math.max(A[2],B[2])+.01,()=>{const ang=Math.atan2(B[1]-A[1],B[0]-A[0]),L=Math.hypot(B[0]-A[0],B[1]-A[1]);c.save();c.strokeStyle=col;c.fillStyle=col;c.lineWidth=w;c.lineCap='round';c.beginPath();c.moveTo(A[0],A[1]);c.lineTo(B[0]-Math.cos(ang)*Math.min(head*.6,L*.4),B[1]-Math.sin(ang)*Math.min(head*.6,L*.4));c.stroke();if(L>3){c.beginPath();c.moveTo(B[0],B[1]);c.lineTo(B[0]-head*Math.cos(ang-.42),B[1]-head*Math.sin(ang-.42));c.lineTo(B[0]-head*Math.cos(ang+.42),B[1]-head*Math.sin(ang+.42));c.closePath();c.fill()}c.restore()});return S},
    ball(p,r,col='#ffc36b',opt={}){const Q=P(p),rr=Math.max(1.2,r*sc*Q[3]);push(Q[2]+(opt.lift||0),()=>{if(opt.glow){const g=c.createRadialGradient(Q[0],Q[1],rr*.5,Q[0],Q[1],rr*3.2);g.addColorStop(0,col+'55');g.addColorStop(1,col+'00');c.fillStyle=g;c.beginPath();c.arc(Q[0],Q[1],rr*3.2,0,TAU);c.fill()}c.beginPath();c.arc(Q[0],Q[1],rr,0,TAU);c.fillStyle=opt.alpha!=null&&/^#[\da-f]{6}$/i.test(col)?col+Math.round(opt.alpha*255).toString(16).padStart(2,'0'):col;if(ON()&&rr>3&&!opt.flat&&opt.alpha==null)shadowFill(c,rr);else c.fill();if(opt.stroke){c.strokeStyle=opt.stroke;c.lineWidth=1.5;c.stroke()}if(!opt.flat)shadeSphere(c,Q[0],Q[1],rr);if(opt.label)S._label(Q[0],Q[1]-rr-12,opt.label,opt.labelColor||'#e9f6ff',13)});return S},
    poly(pts,col,opt={}){const Q=pts.map(P);let n=opt.normal;if(!n&&pts.length>2)n=norm(cross(sub(pts[1],pts[0]),sub(pts[2],pts[0])));if(opt.cull&&n&&facing(n)<-.02)return S;const zz=opt.z??Q.reduce((s,q)=>s+q[2],0)/Q.length+(opt.bias||0);
      const I=n?(opt.cull?Math.max(0,dot3(n,LIGHT)):Math.abs(dot3(n,LIGHT))):.6;
      if(opt.grow){const mx=Q.reduce((s,q)=>s+q[0],0)/Q.length,my=Q.reduce((s,q)=>s+q[1],0)/Q.length;for(const q of Q){const dx=q[0]-mx,dy=q[1]-my,d=Math.hypot(dx,dy)||1;q[0]+=dx/d*opt.grow;q[1]+=dy/d*opt.grow}}
      const spec=opt.spec&&n?Math.pow(Math.max(0,dot3(norm(view(n)),HV)),opt.shine||24)*opt.spec:0;
      const fast=col&&ON()&&opt.shade!==false?shaded(col,(1-Math.max(0,Math.min(1,.3+.7*I)))*.62,I>.8?(I-.8)*.4:0,spec>.01?Math.min(.75,spec):0,opt.alpha):null;
      push(zz,()=>{c.beginPath();c.moveTo(Q[0][0],Q[0][1]);for(let i=1;i<Q.length;i++)c.lineTo(Q[i][0],Q[i][1]);c.closePath();if(fast){c.fillStyle=fast;c.fill()}else if(col){c.fillStyle=opt.alpha!=null&&opt.alpha<1&&/^#[\da-f]{6}$/i.test(col)?col+Math.round(opt.alpha*255).toString(16).padStart(2,'0'):col;c.fill();if(ON()&&opt.shade!==false){const R=raw(c),k=(1-Math.max(0,Math.min(1,.3+.7*I)))*.62*(opt.alpha??1);if(k>.01){R.fillStyle=`rgba(0,0,0,${k.toFixed(3)})`;R.fill()}if(I>.8){R.fillStyle=`rgba(255,255,255,${((I-.8)*.4*(opt.alpha??1)).toFixed(3)})`;R.fill()}if(spec>.01){R.fillStyle=`rgba(255,255,255,${Math.min(.75,spec*(opt.alpha??1)).toFixed(3)})`;R.fill()}}}if(opt.stroke){c.strokeStyle=opt.stroke;c.lineWidth=opt.lw||1.2;c.stroke()}});return S},
    // Axis-aligned (optionally y-rotated) cuboid centred at p with size [w,h,d].
    box(p,[w,h,d],col='#7baaff',opt={}){const a=opt.rotY||0,ca=Math.cos(a),sa=Math.sin(a),tilt=opt.rotZ||0,ct=Math.cos(tilt),st=Math.sin(tilt);
      const V=(x,y,z)=>{let X=x*ct-y*st,Y=x*st+y*ct;return add(p,[X*ca+z*sa,Y,-X*sa+z*ca])};
      const v=[V(-w/2,-h/2,-d/2),V(w/2,-h/2,-d/2),V(w/2,h/2,-d/2),V(-w/2,h/2,-d/2),V(-w/2,-h/2,d/2),V(w/2,-h/2,d/2),V(w/2,h/2,d/2),V(-w/2,h/2,d/2)];
      const F=[[4,5,6,7],[1,0,3,2],[5,1,2,6],[0,4,7,3],[7,6,2,3],[0,1,5,4]];
      // Large thin slabs (boards, tables, ramps) act as ground layers so objects resting on them are never hidden.
      const ground=opt.ground??(h<.26&&w*d>4);for(const f of F){const pts=f.map(i=>v[i]);S.poly(pts,col,{cull:true,stroke:opt.stroke||'#00000033',alpha:opt.alpha,lw:1,z:ground?-5e5+pts.reduce((s,q)=>s+q[1],0)/4:undefined})}return S},
    cyl(p,axis,r,len,col='#8ca6b9',opt={}){const [n,u,v]=basis(axis),seg=opt.seg||24,ring=k=>Array.from({length:seg},(_,i)=>{const t=TAU*i/seg;return add(add(p,mul(n,k)),add(mul(u,r*Math.cos(t)),mul(v,r*Math.sin(t))))});const A=ring(-len/2),B=ring(len/2);
      for(let i=0;i<seg;i++){const j=(i+1)%seg,mid=(TAU*(i+.5))/seg,nn=add(mul(u,Math.cos(mid)),mul(v,Math.sin(mid)));S.poly([A[i],A[j],B[j],B[i]],col,{cull:true,normal:nn,alpha:opt.alpha})}
      if(opt.caps!==false){S.poly(B,opt.cap||col,{cull:true,normal:n,stroke:'#00000030',alpha:opt.alpha});S.poly(A.slice().reverse(),opt.cap||col,{cull:true,normal:mul(n,-1),alpha:opt.alpha})}return S},
    ring(p,axis,r,col='#8ca6b9',w=2,dash=[],seg=60){const [,u,v]=basis(axis);const pts=Array.from({length:seg+1},(_,i)=>{const t=TAU*i/seg;return add(p,add(mul(u,r*Math.cos(t)),mul(v,r*Math.sin(t))))});for(let i=0;i<seg;i+=6)S.path(pts.slice(i,i+7),col,w,dash);return S},
    floor(size=4,step=.5,y=0,col='#29475b'){const n=Math.round(size/step);for(let i=-n;i<=n;i++){S.seg([i*step,y,-size],[i*step,y,size],col,1,[]),S.seg([-size,y,i*step],[size,y,i*step],col,1,[])}items.slice(-(4*n+2)).forEach(it=>it.z=-1e6);return S},
    plate(p,[w,d],col='#143144',y){const yy=y??p[1];S.poly([[p[0]-w/2,yy,p[2]-d/2],[p[0]+w/2,yy,p[2]-d/2],[p[0]+w/2,yy,p[2]+d/2],[p[0]-w/2,yy,p[2]+d/2]].reverse(),col,{normal:[0,1,0],z:-1e6+1,stroke:'#42d9ca33'});return S},
    shadow(p,r,y=0,k=.35){const Q=P([p[0],y,p[2]]),E=P([p[0]+r,y,p[2]]),F=P([p[0],y,p[2]+r]);const rx=Math.max(2,Math.hypot(E[0]-Q[0],E[1]-Q[1])),ry=Math.max(1,Math.abs(F[1]-Q[1])+rx*.15);const lift=Math.max(.15,1-(p[1]-y)*.18);push(-1e5,()=>{if(!ON())return;const R=raw(c);R.save();R.translate(Q[0],Q[1]);R.scale(1,ry/rx);const g=R.createRadialGradient(0,0,0,0,0,rx*1.25);g.addColorStop(0,`rgba(0,0,0,${(k*lift).toFixed(3)})`);g.addColorStop(1,'rgba(0,0,0,0)');R.fillStyle=g;R.beginPath();R.arc(0,0,rx*1.25,0,TAU);R.fill();R.restore();R.beginPath()});return S},
    // Name a part: a thin leader line from the 3D point to a screen offset (dx, dy) with the label at its end.
    callout(p,text,col='#e9f6ff',dx=40,dy=-30,size=12){const Q=P(p);push(1e6-2,()=>{const k=window.PhysicaTextScale||1,L=9,X0=34,X1=656;c.save();c.font=`700 ${Math.round(size*k)}px system-ui, sans-serif`;const tw=c.measureText(String(text)).width;c.restore();
      let right=dx>=0,x=Q[0]+dx*k,y=Math.max(112,Math.min(396,Q[1]+dy*k));
      // Keep every label inside the stage (left edge and the live-measurements panel on the right).
      if(right&&x+L+tw>X1){const alt=Q[0]-Math.abs(dx)*k;if(alt-L-tw>=X0){right=false;x=alt}else x=X1-L-tw}
      if(!right&&x-L-tw<X0){const alt=Q[0]+Math.abs(dx)*k;if(alt+L+tw<=X1){right=true;x=alt}else x=X0+L+tw}
      // Nudge the label vertically until it no longer overlaps an earlier label in this frame.
      const h=size*k+4,box=yy=>right?[x+L-2,yy-h/2,x+L+tw+2,yy+h/2]:[x-L-tw-2,yy-h/2,x-L+2,yy+h/2],hit=b=>S._rects.some(r=>b[0]<r[2]&&b[2]>r[0]&&b[1]<r[3]&&b[3]>r[1]);
      const tryY=()=>{if(!hit(box(y)))return true;for(let i=1;i<16;i++){const yy=y+(i%2?1:-1)*Math.ceil(i/2)*h;if(yy>=112&&yy<=396&&!hit(box(yy))){y=yy;return true}}return false};
      if(!tryY()){const alt=right?Q[0]-Math.abs(dx)*k:Q[0]+Math.abs(dx)*k,ok=right?alt-L-tw>=X0:alt+L+tw<=X1;if(ok){right=!right;x=alt;y=Math.max(112,Math.min(396,Q[1]+dy*k));tryY()}}S._rects.push(box(y));
      c.save();c.strokeStyle=col;c.globalAlpha=.85;c.lineWidth=1.2;c.beginPath();c.moveTo(Q[0],Q[1]);c.lineTo(x,y);c.lineTo(x+(right?6:-6),y);c.stroke();c.globalAlpha=1;c.fillStyle=col;c.beginPath();c.arc(Q[0],Q[1],2.4,0,TAU);c.fill();c.restore();S._label(x+(right?L:-L),y,text,col,size,right?'left':'right')});return S},
    // Callout pushed radially away from a centre point, so labels fan out around a model.
    part(p,text,col='#dbe7f0',size=11,center,len=72){const Q=P(p),C0=center?P(center):[cx,cy];let dx=Q[0]-C0[0],dy=Q[1]-C0[1];const m=Math.hypot(dx,dy);if(m<1){dx=1;dy=-1}const n=Math.hypot(dx,dy);return S.callout(p,text,col,dx/n*len,dy/n*len*.8,size)},
    // Engraved / printed text on a surface: no halo, depth-sorted with the part it sits on.
    engrave(p,txt,col='#1b2129',size=10,zo){const Q=P(p);push(zo??Q[2]+.02,()=>{const k=window.PhysicaTextScale||1;c.save();c.font=`700 ${Math.round(size*Q[3]*k)}px system-ui, sans-serif`;c.textAlign='center';c.textBaseline='middle';c.fillStyle=col;c.fillText(String(txt),Q[0],Q[1]);c.restore()});return S},
    label(p,s,col='#e9f6ff',size=14,align='center'){const Q=P(p);push(1e6,()=>S._label(Q[0],Q[1],s,col,size,align));return S},
    _label(x,y,s,col,size,align='center'){size=Math.round(size*(window.PhysicaTextScale||1));c.save();c.font=`700 ${size}px system-ui, sans-serif`;c.textAlign=align;c.textBaseline='middle';c.lineJoin='round';c.lineWidth=Math.max(3,size*.28);c.strokeStyle='#081624e6';c.strokeText(String(s),x,y);c.fillStyle=col;c.fillText(String(s),x,y);c.restore()},
    axes(len=1,o=[0,0,0]){S.arrow(o,add(o,[len,0,0]),'#ff857e',2,8).arrow(o,add(o,[0,len,0]),'#42d9ca',2,8).arrow(o,add(o,[0,0,len]),'#7baaff',2,8);S.label(add(o,[len*1.12,0,0]),'x','#ff857e',12).label(add(o,[0,len*1.12,0]),'y','#42d9ca',12).label(add(o,[0,0,len*1.12]),'z','#7baaff',12);return S},
    // Coil of `turns` loops along an axis, sorted in chunks so it wraps around what it encloses.
    helix(p,axis,r,len,turns,col='#ffc36b',w=2.5){const [n,u,v]=basis(axis),N=Math.max(24,Math.round(turns*28));const pts=Array.from({length:N+1},(_,i)=>{const s=i/N,t=TAU*turns*s;return add(add(p,mul(n,(s-.5)*len)),add(mul(u,r*Math.cos(t)),mul(v,r*Math.sin(t))))});return S.curve(pts,col,w,4)},
    spring(a,b,coils=10,r=.12,col='#42d9ca',w=2.5){const d=sub(b,a),L=Math.hypot(...d),[,u,v]=basis(d),n=norm(d),N=coils*16;const pts=[a];for(let i=0;i<=N;i++){const s=.08+.84*i/N,t=TAU*coils*i/N;pts.push(add(add(a,mul(n,s*L)),add(mul(u,r*Math.cos(t)),mul(v,r*Math.sin(t)))))}pts.push(b);return S.curve(pts,col,w,8)},
    // Organic surfaces: a lat-long mesh, optionally deformed, rotated and lit with a specular highlight.
    // shape(u,v) may return a radial scale factor (u: latitude −π/2..π/2, v: longitude 0..2π).
    mesh(p,radii,col='#ff857e',opt={}){const [ax,ay,az]=typeof radii==='number'?[radii,radii,radii]:radii,rings=opt.rings||14,segs=opt.segs||22,R1=rotator(opt.rot),R2=rotator(opt.rot2),R=q=>R2(R1(q)),pts=[];
      for(let i=0;i<=rings;i++){const u=-Math.PI/2+Math.PI*i/rings,row=[];for(let j=0;j<=segs;j++){const v=TAU*j/segs,k=opt.shape?opt.shape(u,v):1;row.push(add(p,R([ax*k*Math.cos(u)*Math.cos(v),ay*k*Math.sin(u),az*k*Math.cos(u)*Math.sin(v)])))}pts.push(row)}
      return S._quads(pts,p,col,opt)},
    // A tube swept along a polyline (vessels, roots, neurons, DNA backbones). r may be a function of 0..1.
    tube(line,r,col='#ff857e',opt={}){if(line.length<2)return S;const seg=opt.segs||10,rings=[];let prevU=null;
      for(let i=0;i<line.length;i++){const a=line[Math.max(0,i-1)],b=line[Math.min(line.length-1,i+1)],t=norm(sub(b,a));let u=prevU?norm(sub(prevU,mul(t,dot3(prevU,t)))):basis(t)[1];if(!Number.isFinite(u[0]))u=basis(t)[1];prevU=u;const w=cross(t,u),rr=typeof r==='function'?r(i/(line.length-1)):r;
        rings.push(Array.from({length:seg+1},(_,j)=>{const q=TAU*j/seg;return add(line[i],add(mul(u,rr*Math.cos(q)),mul(w,rr*Math.sin(q))))}))}
      return S._quads(rings,null,col,{...opt,axis:line})},
    // Surface of revolution from a profile of [radius, height] pairs.
    lathe(p,profile,col='#9fb4c2',opt={}){const segs=opt.segs||24,R=rotator(opt.rot),rows=profile.map(([r,y])=>Array.from({length:segs+1},(_,j)=>{const v=TAU*j/segs;return add(p,R([r*Math.cos(v),y,r*Math.sin(v)]))}));return S._quads(rows,null,col,{...opt,lathe:profile.map(([,y])=>add(p,R([0,y,0])))})},
    _quads(G,center,col,opt){const cols=typeof col==='function'?col:()=>col;for(let i=0;i<G.length-1;i++)for(let j=0;j<G[i].length-1;j++){const q=[G[i][j],G[i+1][j],G[i+1][j+1],G[i][j+1]],m=mul(q.reduce((s,a)=>add(s,a),[0,0,0]),.25);
        let n=norm(cross(sub(q[2],q[0]),sub(q[3],q[1])));const ref=center||(opt.axis?opt.axis[Math.min(opt.axis.length-1,i)]:opt.lathe?opt.lathe[i]:m);if(dot3(n,sub(m,ref))<0)n=mul(n,-1);if(opt.inside)n=mul(n,-1);
        S.poly(q,cols(i/(G.length-1),j/(G[i].length-1)),{cull:opt.cull!==false&&opt.alpha==null,normal:n,alpha:opt.alpha,grow:opt.alpha==null?.7:0,spec:opt.spec??.45,shine:opt.shine,bias:opt.bias})}return S},
    hud(fn){push(2e6,fn);return S},
    _rects:[],
    render(){items.sort((a,b)=>a.z-b.z);S._rects=(window.PhysicaChartRects||[]).slice();for(const it of items)it.draw();items.length=0}
  };
  return S;
}

const listeners=new Set();
const notify=()=>listeners.forEach(fn=>fn());
window.Physica3D={scene,finish,set flat(v){FLAT=!!v},get flat(){return FLAT},set ultra(v){ULTRA=!!v},get ultra(){return ULTRA},rotator,shadeSphere,shadeBox,shadowFill,sphereOK,boxOK,backdrop,cam,vec:{add,sub,mul,cross,dot:dot3,norm},
  get enabled(){return enabled},
  setEnabled(v){enabled=!!v;try{localStorage.setItem(KEY,enabled?'on':'off')}catch{}notify()},
  rotate(dx,dy){cam.yaw+=dx;cam.pitch=Math.max(-1.2,Math.min(1.35,cam.pitch+dy));notify()},
  zoomBy(k){cam.zoom=Math.max(.45,Math.min(2.6,cam.zoom*k));notify()},
  resetView(){Object.assign(cam,DEFAULT);notify()},
  setAuto(v){cam.auto=!!v;notify()},
  tick(dt){if(cam.auto)cam.yaw+=dt*.35},
  onChange(fn){listeners.add(fn)}};
})();
