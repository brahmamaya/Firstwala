/* Physica3D: a small, dependency-free 3D renderer plus a realistic shading layer.
   World units: x to the right, y up, z toward the viewer. Scenes are drawn with
   perspective, painter-sorted, lit by one fixed light, and seen through a shared
   orbit camera that the stage controls rotate and zoom. */
(() => {
'use strict';
const TAU=Math.PI*2,KEY='physica-realism';
let enabled=true;try{enabled=localStorage.getItem(KEY)!=='off'}catch{}
const DEFAULT={yaw:-0.55,pitch:0.36,zoom:1};
const cam={...DEFAULT,auto:false};
const LIGHT=(()=>{const v=[-0.45,0.8,0.42],m=Math.hypot(...v);return v.map(x=>x/m)})();
// Shading is painted on the unthemed context so white highlights and dark shadows stay neutral in every theme.
const raw=c=>c&&c.canvas&&c.canvas.getContext?c.canvas.getContext('2d'):c;
const light=()=>document.documentElement.style.colorScheme==='light';
const hexInfo=col=>{const m=typeof col==='string'&&/^#([\da-f]{6})([\da-f]{2})?$/i.exec(col);if(!m)return null;const n=parseInt(m[1],16);return{r:n>>16,g:(n>>8)&255,b:n&255,a:m[2]?parseInt(m[2],16)/255:1}};
const solid=(col,minA=.8)=>{const h=hexInfo(col);return!!h&&h.a>=minA};

function shadowFill(c,size){const R=raw(c);R.save();R.shadowColor=light()?'rgba(20,30,40,.22)':'rgba(0,0,0,.42)';R.shadowBlur=Math.min(16,3+size*.5);R.shadowOffsetX=Math.min(4,size*.12);R.shadowOffsetY=Math.min(7,1+size*.22);c.fill();R.restore()}
function shadeSphere(c,x,y,r){if(!enabled||!(r>=3))return;const R=raw(c);R.save();R.beginPath();R.arc(x,y,r,0,TAU);R.clip();const g=R.createRadialGradient(x-r*.38,y-r*.42,r*.04,x-r*.15,y-r*.18,r*1.12);g.addColorStop(0,'rgba(255,255,255,.62)');g.addColorStop(.2,'rgba(255,255,255,.16)');g.addColorStop(.55,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,.5)');R.fillStyle=g;R.fillRect(x-r,y-r,2*r,2*r);R.restore();R.beginPath()}
function shadeBox(c,x,y,w,h,r=0){if(!enabled||w<4||h<4)return;const R=raw(c);R.save();R.beginPath();R.roundRect(x,y,w,h,r);R.clip();const g=R.createLinearGradient(0,y,0,y+h);g.addColorStop(0,'rgba(255,255,255,.2)');g.addColorStop(.42,'rgba(255,255,255,0)');g.addColorStop(1,'rgba(0,0,0,.3)');R.fillStyle=g;R.fillRect(x,y,w,h);R.fillStyle='rgba(255,255,255,.22)';R.fillRect(x,y,w,Math.min(2,h*.12));R.restore();R.beginPath()}
// Used by the shared 2D primitives of the original experiments.
const sphereOK=(fill,r)=>enabled&&r>=4&&r<=150&&solid(fill);
const boxOK=(fill,w,h)=>{if(!enabled||w<6||h<6||w*h>60000)return false;const i=hexInfo(fill);return!!i&&i.a>=.8&&Math.max(i.r,i.g,i.b)>=42};
function backdrop(c){if(!enabled)return;const R=raw(c);R.save();const g=R.createRadialGradient(480,210,90,480,250,640);g.addColorStop(0,'rgba(255,255,255,.04)');g.addColorStop(.5,'rgba(0,0,0,0)');g.addColorStop(1,light()?'rgba(0,0,0,.1)':'rgba(0,0,0,.34)');R.fillStyle=g;R.fillRect(0,0,960,505);R.restore();R.beginPath()}

const sub=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]],add=(a,b)=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]],mul=(a,k)=>[a[0]*k,a[1]*k,a[2]*k];
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],dot3=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const norm=a=>{const m=Math.hypot(...a)||1;return mul(a,1/m)};
function basis(axis){const n=norm(axis),h=Math.abs(n[1])<.9?[0,1,0]:[1,0,0],u=norm(cross(n,h)),v=cross(n,u);return[n,u,v]}

function scene(c,o={}){
  const yaw=cam.yaw+(o.yaw||0),pitch=Math.max(-1.45,Math.min(1.45,cam.pitch+(o.pitch||0)));
  const cx=o.cx??348,cy=o.cy??262,sc=(o.scale??62)*1.15*cam.zoom,focal=o.focal??16;
  const cyw=Math.cos(yaw),syw=Math.sin(yaw),cp=Math.cos(pitch),sp=Math.sin(pitch);
  const items=[];
  const view=([x,y,z])=>{const X=x*cyw+z*syw,Z0=-x*syw+z*cyw;return[X,y*cp-Z0*sp,y*sp+Z0*cp]};
  function P(p){const [X,Y,Z]=view(p),f=focal/Math.max(.6,focal-Z);return[cx+X*sc*f,cy-Y*sc*f,Z,f]}
  const facing=n=>{const v=view(n);return v[2]};
  const push=(z,draw)=>items.push({z,draw});
  const S={P,sc,cam,
    seg(a,b,col='#8ca6b9',w=2,dash=[]){const A=P(a),B=P(b);push((A[2]+B[2])/2,()=>{c.save();c.beginPath();c.setLineDash(dash);c.moveTo(A[0],A[1]);c.lineTo(B[0],B[1]);c.strokeStyle=col;c.lineWidth=w;c.lineCap='round';c.stroke();c.restore()});return S},
    path(pts,col='#42d9ca',w=2.5,dash=[],z){if(pts.length<2)return S;const Q=pts.map(P),zz=z??Q.reduce((s,q)=>s+q[2],0)/Q.length;push(zz,()=>{c.save();c.beginPath();c.setLineDash(dash);c.moveTo(Q[0][0],Q[0][1]);for(const q of Q.slice(1))c.lineTo(q[0],q[1]);c.strokeStyle=col;c.lineWidth=w;c.lineJoin='round';c.lineCap='round';c.stroke();c.restore()});return S},
    // Long curves sorted piecewise so they weave correctly in front of and behind solids.
    curve(pts,col='#42d9ca',w=2.5,chunk=6){for(let i=0;i<pts.length-1;i+=chunk)S.path(pts.slice(i,Math.min(pts.length,i+chunk+1)),col,w);return S},
    arrow(a,b,col='#42d9ca',w=3,head=11){const A=P(a),B=P(b);push(Math.max(A[2],B[2])+.01,()=>{const ang=Math.atan2(B[1]-A[1],B[0]-A[0]),L=Math.hypot(B[0]-A[0],B[1]-A[1]);c.save();c.strokeStyle=col;c.fillStyle=col;c.lineWidth=w;c.lineCap='round';c.beginPath();c.moveTo(A[0],A[1]);c.lineTo(B[0]-Math.cos(ang)*Math.min(head*.6,L*.4),B[1]-Math.sin(ang)*Math.min(head*.6,L*.4));c.stroke();if(L>3){c.beginPath();c.moveTo(B[0],B[1]);c.lineTo(B[0]-head*Math.cos(ang-.42),B[1]-head*Math.sin(ang-.42));c.lineTo(B[0]-head*Math.cos(ang+.42),B[1]-head*Math.sin(ang+.42));c.closePath();c.fill()}c.restore()});return S},
    ball(p,r,col='#ffc36b',opt={}){const Q=P(p),rr=Math.max(1.2,r*sc*Q[3]);push(Q[2]+(opt.lift||0),()=>{if(opt.glow){const g=c.createRadialGradient(Q[0],Q[1],rr*.5,Q[0],Q[1],rr*3.2);g.addColorStop(0,col+'55');g.addColorStop(1,col+'00');c.fillStyle=g;c.beginPath();c.arc(Q[0],Q[1],rr*3.2,0,TAU);c.fill()}c.beginPath();c.arc(Q[0],Q[1],rr,0,TAU);c.fillStyle=opt.alpha!=null&&/^#[\da-f]{6}$/i.test(col)?col+Math.round(opt.alpha*255).toString(16).padStart(2,'0'):col;if(enabled&&rr>3&&!opt.flat&&opt.alpha==null)shadowFill(c,rr);else c.fill();if(opt.stroke){c.strokeStyle=opt.stroke;c.lineWidth=1.5;c.stroke()}if(!opt.flat)shadeSphere(c,Q[0],Q[1],rr);if(opt.label)S._label(Q[0],Q[1]-rr-12,opt.label,opt.labelColor||'#e9f6ff',13)});return S},
    poly(pts,col,opt={}){const Q=pts.map(P);let n=opt.normal;if(!n&&pts.length>2)n=norm(cross(sub(pts[1],pts[0]),sub(pts[2],pts[0])));if(opt.cull&&n&&facing(n)<-.02)return S;const zz=opt.z??Q.reduce((s,q)=>s+q[2],0)/Q.length+(opt.bias||0);
      const I=n?(opt.cull?Math.max(0,dot3(n,LIGHT)):Math.abs(dot3(n,LIGHT))):.6;
      push(zz,()=>{c.beginPath();c.moveTo(Q[0][0],Q[0][1]);for(const q of Q.slice(1))c.lineTo(q[0],q[1]);c.closePath();if(col){c.fillStyle=opt.alpha!=null&&opt.alpha<1&&/^#[\da-f]{6}$/i.test(col)?col+Math.round(opt.alpha*255).toString(16).padStart(2,'0'):col;c.fill();if(enabled&&opt.shade!==false){const R=raw(c),k=(1-Math.max(0,Math.min(1,.3+.7*I)))*.62*(opt.alpha??1);if(k>.01){R.fillStyle=`rgba(0,0,0,${k.toFixed(3)})`;R.fill()}if(I>.8){R.fillStyle=`rgba(255,255,255,${((I-.8)*.4*(opt.alpha??1)).toFixed(3)})`;R.fill()}}}if(opt.stroke){c.strokeStyle=opt.stroke;c.lineWidth=opt.lw||1.2;c.stroke()}});return S},
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
    shadow(p,r,y=0,k=.35){const Q=P([p[0],y,p[2]]),E=P([p[0]+r,y,p[2]]),F=P([p[0],y,p[2]+r]);const rx=Math.max(2,Math.hypot(E[0]-Q[0],E[1]-Q[1])),ry=Math.max(1,Math.abs(F[1]-Q[1])+rx*.15);const lift=Math.max(.15,1-(p[1]-y)*.18);push(-1e5,()=>{if(!enabled)return;const R=raw(c);R.save();R.translate(Q[0],Q[1]);R.scale(1,ry/rx);const g=R.createRadialGradient(0,0,0,0,0,rx*1.25);g.addColorStop(0,`rgba(0,0,0,${(k*lift).toFixed(3)})`);g.addColorStop(1,'rgba(0,0,0,0)');R.fillStyle=g;R.beginPath();R.arc(0,0,rx*1.25,0,TAU);R.fill();R.restore();R.beginPath()});return S},
    label(p,s,col='#e9f6ff',size=14,align='center'){const Q=P(p);push(1e6,()=>S._label(Q[0],Q[1],s,col,size,align));return S},
    _label(x,y,s,col,size,align='center'){c.save();c.font=`600 ${size}px system-ui, sans-serif`;c.textAlign=align;c.textBaseline='middle';c.lineWidth=3;c.strokeStyle='#081624cc';c.strokeText(String(s),x,y);c.fillStyle=col;c.fillText(String(s),x,y);c.restore()},
    axes(len=1,o=[0,0,0]){S.arrow(o,add(o,[len,0,0]),'#ff857e',2,8).arrow(o,add(o,[0,len,0]),'#42d9ca',2,8).arrow(o,add(o,[0,0,len]),'#7baaff',2,8);S.label(add(o,[len*1.12,0,0]),'x','#ff857e',12).label(add(o,[0,len*1.12,0]),'y','#42d9ca',12).label(add(o,[0,0,len*1.12]),'z','#7baaff',12);return S},
    // Coil of `turns` loops along an axis, sorted in chunks so it wraps around what it encloses.
    helix(p,axis,r,len,turns,col='#ffc36b',w=2.5){const [n,u,v]=basis(axis),N=Math.max(24,Math.round(turns*28));const pts=Array.from({length:N+1},(_,i)=>{const s=i/N,t=TAU*turns*s;return add(add(p,mul(n,(s-.5)*len)),add(mul(u,r*Math.cos(t)),mul(v,r*Math.sin(t))))});return S.curve(pts,col,w,4)},
    spring(a,b,coils=10,r=.12,col='#42d9ca',w=2.5){const d=sub(b,a),L=Math.hypot(...d),[,u,v]=basis(d),n=norm(d),N=coils*16;const pts=[a];for(let i=0;i<=N;i++){const s=.08+.84*i/N,t=TAU*coils*i/N;pts.push(add(add(a,mul(n,s*L)),add(mul(u,r*Math.cos(t)),mul(v,r*Math.sin(t)))))}pts.push(b);return S.curve(pts,col,w,8)},
    hud(fn){push(2e6,fn);return S},
    render(){items.sort((a,b)=>a.z-b.z);for(const it of items)it.draw();items.length=0}
  };
  return S;
}

const listeners=new Set();
const notify=()=>listeners.forEach(fn=>fn());
window.Physica3D={scene,shadeSphere,shadeBox,shadowFill,sphereOK,boxOK,backdrop,cam,vec:{add,sub,mul,cross,dot:dot3,norm},
  get enabled(){return enabled},
  setEnabled(v){enabled=!!v;try{localStorage.setItem(KEY,enabled?'on':'off')}catch{}notify()},
  rotate(dx,dy){cam.yaw+=dx;cam.pitch=Math.max(-1.2,Math.min(1.35,cam.pitch+dy));notify()},
  zoomBy(k){cam.zoom=Math.max(.45,Math.min(2.6,cam.zoom*k));notify()},
  resetView(){Object.assign(cam,DEFAULT);notify()},
  setAuto(v){cam.auto=!!v;notify()},
  tick(dt){if(cam.auto)cam.yaw+=dt*.35},
  onChange(fn){listeners.add(fn)}};
})();
