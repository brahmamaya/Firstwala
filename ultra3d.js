/* Hand-built Ultra-Realistic scenes. A scene registered here replaces the generic Ultra view of
   that experiment. Same parameters and physics as the other views; only the picture is richer. */
(() => {
'use strict';
const U=window.PhysicaUltraScenes=window.PhysicaUltraScenes||{};
const TAU=Math.PI*2,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const font=(w,s)=>`${w} ${s}px 'Exo 2', system-ui, sans-serif`;
// ---------- small 3D value noise (deterministic) ----------
function hash(x,y,z){let h=(x*374761393+y*668265263+z*1442695041)|0;h=(h^(h>>>13))*1274126177|0;return((h^(h>>>16))>>>0)/4294967295}
function vnoise(x,y,z){const X=Math.floor(x),Y=Math.floor(y),Z=Math.floor(z),fx=x-X,fy=y-Y,fz=z-Z,s=t=>t*t*(3-2*t),u=s(fx),v=s(fy),w=s(fz),L=(a,b,t)=>a+(b-a)*t;
  return L(L(L(hash(X,Y,Z),hash(X+1,Y,Z),u),L(hash(X,Y+1,Z),hash(X+1,Y+1,Z),u),v),L(L(hash(X,Y,Z+1),hash(X+1,Y,Z+1),u),L(hash(X,Y+1,Z+1),hash(X+1,Y+1,Z+1),u),v),w)}
function fbm(x,y,z,o=5){let a=.5,f=1,s=0,n=0;for(let i=0;i<o;i++){s+=a*vnoise(x*f,y*f,z*f);n+=a;a*=.5;f*=2.03}return s/n}
// ---------- the Earth: procedural continents, oceans, ice and clouds, lit from the upper left ----------
const cache={};
function earthImage(px){const key='e'+px;if(cache[key])return cache[key];const cv=document.createElement('canvas');cv.width=cv.height=px;const g=cv.getContext('2d'),im=g.createImageData(px,px),d=im.data,r=px/2,L=[-.55,-.45,.7],ln=Math.hypot(...L);
  for(let j=0;j<px;j++)for(let i=0;i<px;i++){const x=(i+.5-r)/r,y=(j+.5-r)/r,q=x*x+y*y;if(q>1)continue;const z=Math.sqrt(1-q),o=(j*px+i)*4;
    // rotate the globe a little so oceans and land both show
    const ca=Math.cos(.6),sa=Math.sin(.6),X=x*ca+z*sa,Z=-x*sa+z*ca,Y=y;
    const n=fbm(X*1.6+3.1,Y*1.6+1.7,Z*1.6+5.3),lat=Math.abs(Y),land=n>.53,ice=lat>.86||(lat>.78&&n>.45);
    let cr,cg,cb;if(ice){cr=236;cg=242;cb=248}else if(land){const m=fbm(X*4+9,Y*4,Z*4,3),dry=clamp((.55-lat)*1.6+(m-.5),0,1);cr=50+120*dry+30*m;cg=110+40*(1-dry)+30*m;cb=40+40*dry}else{const deep=clamp((.53-n)*4,0,1);cr=10+20*(1-deep);cg=50+60*(1-deep);cb=110+70*(1-deep)}
    const cl=fbm(X*3+20,Y*5,Z*3+7,4);if(cl>.56){const a=clamp((cl-.56)*4,0,.85);cr+=(255-cr)*a;cg+=(255-cg)*a;cb+=(255-cb)*a}
    const lam=Math.max(0,(x*L[0]+y*L[1]+z*L[2])/ln),light=.22+.95*lam;let spec=0;if(!land&&!ice&&cl<=.56){const hx=L[0]/ln,hy=L[1]/ln,hz=L[2]/ln+1,hm=Math.hypot(hx,hy,hz),dn=(x*hx+y*hy+z*hz)/hm;spec=Math.pow(Math.max(0,dn),40)*120}
    const rim=Math.pow(1-z,3);d[o]=clamp(cr*light+spec+40*rim,0,255);d[o+1]=clamp(cg*light+spec+90*rim,0,255);d[o+2]=clamp(cb*light+spec+190*rim,0,255);d[o+3]=255}
  g.putImageData(im,0,0);return cache[key]=cv}
function rockPattern(c){if(cache.rock)return cache.rock;const cv=document.createElement('canvas');cv.width=cv.height=96;const g=cv.getContext('2d'),im=g.createImageData(96,96),d=im.data;
  for(let j=0;j<96;j++)for(let i=0;i<96;i++){const n=fbm(i/9,j/9,.5,4),v=n*255,o=(j*96+i)*4;d[o]=d[o+1]=d[o+2]=v;d[o+3]=70}g.putImageData(im,0,0);return cache.rock=c.createPattern(cv,'repeat')}
// ---------- scene: Gravity above and below Earth ----------
U['gravity-depth']=(c,p,t)=>{
  const Re=6371,alt=+p.altitude||0,r=Re+alt,g=9.81*(alt<0?r/Re:(Re/r)**2);
  const cx=232,cy=236,R=132,RH=R,maxR=Re+4000,kx=RH/Re;
  // studio background with a soft reflective floor
  let bg=c.createRadialGradient(cx+40,cy-20,40,cx+80,cy,560);bg.addColorStop(0,'#13306a');bg.addColorStop(.5,'#081a3d');bg.addColorStop(1,'#020814');c.fillStyle=bg;c.fillRect(28,76,640,345);
  let fl=c.createLinearGradient(0,372,0,421);fl.addColorStop(0,'rgba(40,80,160,.0)');fl.addColorStop(.15,'rgba(40,80,160,.22)');fl.addColorStop(1,'rgba(4,10,24,.9)');c.fillStyle=fl;c.fillRect(28,372,640,49);
  let pool=c.createRadialGradient(cx,392,10,cx,392,200);pool.addColorStop(0,'rgba(80,150,255,.28)');pool.addColorStop(1,'rgba(80,150,255,0)');c.save();c.translate(0,392);c.scale(1,.18);c.fillStyle=pool;c.beginPath();c.arc(cx,0,200,0,TAU);c.fill();c.restore();
  // atmosphere glow
  let at=c.createRadialGradient(cx,cy,R*.92,cx,cy,R*1.28);at.addColorStop(0,'rgba(90,170,255,.55)');at.addColorStop(.3,'rgba(60,140,255,.22)');at.addColorStop(1,'rgba(40,110,255,0)');c.fillStyle=at;c.beginPath();c.arc(cx,cy,R*1.28,0,TAU);c.fill();
  // the globe (drawn at device resolution, generated once)
  const k=c.getTransform?Math.max(1,c.getTransform().a):1,img=earthImage(Math.min(640,Math.round(R*2*k)));c.drawImage(img,cx-R,cy-R,R*2,R*2);
  // the cut: a half-ellipse cross-section facing us on the right half
  c.save();c.beginPath();c.ellipse(cx,cy,RH,R*.995,0,-Math.PI/2,Math.PI/2);c.closePath();c.clip();
  const layers=[[1,'#6b4a33','#3d2a1d'],[.94,'#a8321c','#5e140c'],[.55,'#ff7a1a','#c43c0a'],[.19,'#fff3b0','#ffc23a']];
  for(const [f,c1,c2] of layers){const gr=c.createRadialGradient(cx,cy,0,cx,cy,R*f);gr.addColorStop(0,c1);gr.addColorStop(.6,c1);gr.addColorStop(1,c2);c.fillStyle=gr;c.beginPath();c.ellipse(cx,cy,RH*f,R*f,0,0,TAU);c.fill()}
  c.globalCompositeOperation='multiply';c.fillStyle=rockPattern(c);c.fillRect(cx,cy-R,RH,2*R);c.globalCompositeOperation='lighter';
  const core=c.createRadialGradient(cx,cy,0,cx,cy,R*.3);core.addColorStop(0,'rgba(255,245,200,.7)');core.addColorStop(1,'rgba(255,200,80,0)');c.fillStyle=core;c.fillRect(cx,cy-R,RH,2*R);c.globalCompositeOperation='source-over';c.lineWidth=1.4;for(const f of[.94,.55,.19]){c.strokeStyle='rgba(30,8,2,.55)';c.beginPath();c.ellipse(cx,cy,RH*f,R*f,0,-Math.PI/2,Math.PI/2);c.stroke()}c.restore();
  // rim of the cut and the edge-on second face
  c.save();c.strokeStyle='rgba(255,200,150,.55)';c.lineWidth=1.2;c.beginPath();c.ellipse(cx,cy,RH,R*.995,0,-Math.PI/2,Math.PI/2);c.stroke();
  const edge=c.createLinearGradient(cx-7,0,cx+2,0);edge.addColorStop(0,'#2a1a10');edge.addColorStop(1,'#7a5236');c.fillStyle=edge;c.fillRect(cx-6,cy-R*.995,7,2*R*.995);c.restore();
  // layer labels
  const tag=(x,y,tx,ty,s)=>{c.strokeStyle='rgba(220,235,255,.55)';c.lineWidth=1;c.beginPath();c.moveTo(x,y);c.lineTo(tx,ty);c.stroke();c.fillStyle='#e8f1ff';c.font=font(700,11);c.textAlign='left';c.textBaseline='middle';c.fillText(s,tx+(tx>x?4:-4-c.measureText(s).width),ty)};
  {const lx=cx+R+22;tag(cx+RH*.97,cy+R*.2,lx,cy+48,'Crust');tag(cx+RH*.75,cy+R*.45,lx,cy+72,'Mantle');tag(cx+RH*.42,cy+R*.33,lx,cy+96,'Outer core');tag(cx+RH*.12,cy+R*.12,lx,cy+120,'Inner core')}
  // radial wire with markers every 2000 km, and the probe
  const X=rr=>cx+rr*kx,px=X(r);c.save();c.globalCompositeOperation='lighter';let wl=c.createLinearGradient(cx,0,X(maxR)+30,0);wl.addColorStop(0,'rgba(255,220,180,.7)');wl.addColorStop(.55,'rgba(200,220,255,.7)');wl.addColorStop(1,'rgba(90,160,255,0)');c.strokeStyle=wl;c.lineWidth=2;c.beginPath();c.moveTo(cx,cy);c.lineTo(X(maxR)+40,cy);c.stroke();c.restore();
  const bead=(x,rad,hot)=>{const b=c.createRadialGradient(x-rad*.35,cy-rad*.4,rad*.1,x,cy,rad);b.addColorStop(0,'#ffffff');b.addColorStop(.35,hot?'#dfe7f2':'#b8c2cf');b.addColorStop(1,'#3e4651');c.fillStyle=b;c.beginPath();c.arc(x,cy,rad,0,TAU);c.fill()};
  for(let m=0;m<=maxR;m+=2000)bead(X(m),3.2);
  const halo=c.createRadialGradient(px,cy,0,px,cy,24);halo.addColorStop(0,'rgba(150,200,255,.55)');halo.addColorStop(1,'rgba(150,200,255,0)');c.fillStyle=halo;c.beginPath();c.arc(px,cy,24,0,TAU);c.fill();bead(px,7.5,true);
  // g vector (points to the centre), length ∝ g
  const L=g*7.5;c.strokeStyle='#ff6b6b';c.fillStyle='#ff6b6b';c.lineWidth=3;c.beginPath();c.moveTo(px,cy-16);c.lineTo(px-L,cy-16);c.stroke();c.beginPath();c.moveTo(px-L-9,cy-16);c.lineTo(px-L,cy-21);c.lineTo(px-L,cy-11);c.fill();
  c.font=font(800,13);c.textAlign='center';c.textBaseline='bottom';c.fillStyle='#ffffff';c.fillText(`g = ${g.toFixed(2)} m/s²`,clamp(px-L/2,110,600),cy-24);
  c.font=font(600,11);c.fillStyle='#b9cbe6';c.textBaseline='bottom';c.fillText(alt<0?`${Math.abs(alt)} km below the surface`:alt>0?`${alt} km above the surface`:'at the surface',clamp(px-L/2,110,600),cy-42);
  // cable to the display stand
  c.strokeStyle='#4a5260';c.lineWidth=4;c.beginPath();c.moveTo(cx+R*.35,cy+R*.95);c.bezierCurveTo(cx+R*.4,cy+R*1.35,440,402,470,398);c.stroke();
  // glass display on a metal stand, plotting g(r)
  const gx=452,gy=262,gw=206,gh=118;
  const st=c.createLinearGradient(0,382,0,400);st.addColorStop(0,'#8a94a3');st.addColorStop(.5,'#3c434d');st.addColorStop(1,'#1b1f25');c.fillStyle=st;c.beginPath();c.roundRect(gx-6,384,gw+12,14,4);c.fill();c.fillStyle='#2a3038';c.fillRect(gx+16,378,12,8);c.fillRect(gx+gw-28,378,12,8);
  c.save();c.shadowColor='rgba(80,150,255,.35)';c.shadowBlur=12;c.fillStyle='rgba(12,26,52,.55)';c.beginPath();c.roundRect(gx,gy,gw,gh,8);c.fill();c.restore();
  c.strokeStyle='rgba(200,220,245,.6)';c.lineWidth=1.5;c.beginPath();c.roundRect(gx,gy,gw,gh,8);c.stroke();
  const ax=gx+14,ay=gy+gh-16,aw=gw-26,ah=gh-36,SX=rr=>ax+rr/maxR*aw,SY=v=>ay-v/10.5*ah,sx=SX(Re);
  let zi=c.createLinearGradient(ax,0,sx,0);zi.addColorStop(0,'rgba(255,140,40,.06)');zi.addColorStop(1,'rgba(255,140,40,.22)');c.fillStyle=zi;c.fillRect(ax,ay-ah,sx-ax,ah);let zo=c.createLinearGradient(sx,0,ax+aw,0);zo.addColorStop(0,'rgba(70,150,255,.25)');zo.addColorStop(1,'rgba(70,150,255,.04)');c.fillStyle=zo;c.fillRect(sx,ay-ah,ax+aw-sx,ah);
  c.strokeStyle='rgba(255,255,255,.08)';c.lineWidth=1;for(let i=1;i<5;i++){c.beginPath();c.moveTo(ax,ay-ah*i/5);c.lineTo(ax+aw,ay-ah*i/5);c.stroke()}
  c.strokeStyle='rgba(120,180,255,.8)';c.beginPath();c.moveTo(sx,ay-ah);c.lineTo(sx,ay);c.stroke();
  const curve=(a,b,col)=>{c.save();c.globalCompositeOperation='lighter';c.strokeStyle=col;c.lineWidth=2.2;c.shadowColor=col;c.shadowBlur=6;c.beginPath();for(let i=0;i<=40;i++){const rr=a+(b-a)*i/40,v=rr<Re?9.81*rr/Re:9.81*(Re/rr)**2;i?c.lineTo(SX(rr),SY(v)):c.moveTo(SX(rr),SY(v))}c.stroke();c.restore()};
  curve(0,Re,'#ff9a3c');curve(Re,maxR,'#5aa8ff');
  for(let m=2000;m<=maxR;m+=2000){const v=m<Re?9.81*m/Re:9.81*(Re/m)**2;c.fillStyle='#cfd8e3';c.beginPath();c.arc(SX(m),SY(v),2.2,0,TAU);c.fill()}
  const cxp=SX(r),cyp=SY(g);c.fillStyle='rgba(255,255,255,.25)';c.beginPath();c.arc(cxp,cyp,8,0,TAU);c.fill();c.fillStyle='#ffffff';c.beginPath();c.arc(cxp,cyp,3.6,0,TAU);c.fill();
  c.font=font(700,9.5);c.fillStyle='#d6e4f7';c.textAlign='left';c.textBaseline='top';c.fillText('g (m/s²)',gx+8,gy+6);c.textAlign='right';c.fillText('r →',gx+gw-8,ay+3);c.textAlign='center';c.fillStyle='#9cc4ff';c.fillText('surface',sx,ay+3);
  c.textAlign='left';c.fillStyle='#ffb36b';c.fillText('inside: g ∝ r',ax+4,gy+20);c.textAlign='right';c.fillStyle='#8fc0ff';c.fillText('outside: g ∝ 1/r²',gx+gw-8,gy+20);
};
})();
