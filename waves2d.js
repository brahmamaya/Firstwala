/* Wave interference lab (NCERT Class 12, Wave Optics): two coherent light sources side by side, the wave field drawn point by point,
   a screen with its intensity pattern, two probes that plot the electric field against time, and a tape measure.
   Drag a laser up or down to change the separation, drag the probes and the tape, change the colour (wavelength) and the amplitude.
   Physics: every source sends a circular wave E = a·sin(2πr/λ − ωt); the field is the sum of the waves, the screen shows I ∝ |ΣE|². */
(() => {
'use strict';
const {R,S,N,f,clamp,pack,TAU}=window.PhysicaLab;
const INT=window.PhysicaInteractive=window.PhysicaInteractive||{},{add,done}=pack();
const ID='wave-interference',CNM=299.792458;                          // speed of light in nm per femtosecond
const FX=60,FY=84,FW=520,FH=356,CY=FY+FH/2,XS=FX+FW,K=.075;          // field rectangle (px), screen x, pixels per nm
const GW=Math.round(FW/3),GH=Math.round(FH/3);                         // the field is computed on a coarse grid and smoothed up
const PX=700,PW=235;                                                   // right-hand graph panel
const DEF=()=>({paused:false,slow:false,tau:0,lastT:null,probe:[{x:FX+215,y:CY-70},{x:FX+190,y:CY+88}],tape:[{x:FX+16,y:FY+46},{x:FX+16+K*500,y:FY+46}],mode:null,off:null});
let S0=DEF();
// ---------- small helpers ----------
// Approximate colour of a vacuum wavelength (nm) as [r,g,b] 0-255.
function spectral(nm){let r=0,g=0,b=0;if(nm<440){r=(440-nm)/60;b=1}else if(nm<490){g=(nm-440)/50;b=1}else if(nm<510){g=1;b=(510-nm)/20}else if(nm<580){r=(nm-510)/70;g=1}else if(nm<645){r=1;g=(645-nm)/65}else r=1;
  const k=nm<420?.35+.65*(nm-380)/40:nm>700?.35+.65*(750-nm)/50:1;return[r,g,b].map(v=>Math.round(255*clamp(v*Math.max(.35,k),0,1)))}
// Text with the lab's usual font.
function txt(c,s,x,y,col='#e9f6ff',size=12,align='left',w=600){c.save();c.font=`${w} ${size}px system-ui, sans-serif`;c.fillStyle=col;c.textAlign=align;c.textBaseline='middle';c.fillText(s,x,y);c.restore()}
// The source positions (px) for the chosen number of sources and separation.
const sources=p=>+p.n===1?[{x:FX,y:CY}]:[{x:FX,y:CY-p.sep*K/2},{x:FX,y:CY+p.sep*K/2}];
// Distance fade of a circular wave (kept mild so the rings stay visible across the whole field).
const fade=r=>1/Math.sqrt(1+r/260);
// Total electric field (each source has amplitude p.amp) at pixel (x,y) and time tau (fs).
function Efield(p,x,y,tau){const lam=p.lam*K,w=TAU*CNM/p.lam;let e=0;for(const s of sources(p)){const r=Math.hypot(x-s.x,y-s.y);e+=p.amp*fade(r)*Math.sin(TAU*r/lam-w*tau)}return e}
// Time-averaged relative intensity on the screen at height y (1 = the brightest possible).
function Iscreen(p,y){const lam=p.lam*K,ss=sources(p);let re=0,im=0;for(const s of ss){const r=Math.hypot(XS-s.x,y-s.y),a=p.amp*fade(r);re+=a*Math.cos(TAU*r/lam);im+=a*Math.sin(TAU*r/lam)}const m=ss.length*p.amp;return clamp((re*re+im*im)/(m*m*.45),0,1)}
// Path difference (nm) from the two sources to a point.
const pathDiff=(p,q)=>{const ss=sources(p);return ss.length<2?0:(Math.hypot(q.x-ss[0].x,q.y-ss[0].y)-Math.hypot(q.x-ss[1].x,q.y-ss[1].y))/K};
// Name of the interference at a point from the path difference in wavelengths.
function kind(p,q){const d=Math.abs(pathDiff(p,q))/p.lam,fr=d-Math.floor(d);return fr<.08||fr>.92?'constructive (bright)':Math.abs(fr-.5)<.08?'destructive (dark)':'in between'}
// Metallic cylinder (the laser) with a glowing aperture at its right end.
function laser(c,x,y,col){c.save();c.shadowColor='rgba(0,0,0,.55)';c.shadowBlur=10;c.shadowOffsetY=4;const g=c.createLinearGradient(0,y-17,0,y+17);['#eef2f5','#b7c1c8','#6d7880','#3d464d'].forEach((k,i)=>g.addColorStop(i/3,k));c.fillStyle=g;c.beginPath();c.roundRect(x,y-17,62,34,6);c.fill();c.restore();
  c.save();c.fillStyle='rgba(0,0,0,.35)';c.fillRect(x+44,y-17,3,34);const gl=c.createRadialGradient(x+62,y,1,x+62,y,16);gl.addColorStop(0,`rgb(${col})`);gl.addColorStop(1,`rgba(${col},0)`);c.fillStyle=gl;c.beginPath();c.arc(x+62,y,16,0,TAU);c.fill();
  c.fillStyle=`rgb(${col})`;c.beginPath();c.arc(x+22,y,8,0,TAU);c.fill();c.strokeStyle='rgba(255,255,255,.55)';c.lineWidth=1.5;c.stroke();c.restore()}
// A detector: ring with cross hairs, the probe number, and a cable that runs to the graph.
function probe(c,q,i,col,gy){c.save();c.strokeStyle=col;c.lineWidth=2;c.globalAlpha=.85;c.beginPath();c.moveTo(q.x,q.y);c.bezierCurveTo(q.x+90,q.y+30,PX-170,gy-20,PX-4,gy);c.stroke();c.globalAlpha=1;
  c.shadowColor='rgba(0,0,0,.6)';c.shadowBlur=8;c.fillStyle='rgba(20,28,34,.82)';c.beginPath();c.arc(q.x,q.y,14,0,TAU);c.fill();c.shadowColor='transparent';c.strokeStyle=col;c.lineWidth=2.4;c.beginPath();c.arc(q.x,q.y,14,0,TAU);c.stroke();
  c.lineWidth=1.4;c.beginPath();c.moveTo(q.x-9,q.y);c.lineTo(q.x+9,q.y);c.moveTo(q.x,q.y-9);c.lineTo(q.x,q.y+9);c.stroke();c.restore();txt(c,String(i+1),q.x+19,q.y-14,col,12,'left',800)}
// Round or pill button with an icon drawn by `icon`.
function button(c,b,on,icon){c.save();c.shadowColor='rgba(66,217,202,.5)';c.shadowBlur=on?14:6;const g=c.createLinearGradient(0,b.y-b.r,0,b.y+b.r);g.addColorStop(0,b.hot?'#ffb26b':'#6ff0e2');g.addColorStop(1,b.hot?'#e8590c':'#1fb5a6');c.fillStyle=g;c.beginPath();c.arc(b.x,b.y,b.r,0,TAU);c.fill();c.restore();c.save();c.fillStyle='#fff';c.strokeStyle='#fff';c.lineWidth=2.4;icon(c,b);c.restore()}
// Radio button with a label.
function radio(c,x,y,label,on){c.save();c.strokeStyle='#8ca6b9';c.lineWidth=1.6;c.beginPath();c.arc(x,y,7,0,TAU);c.stroke();if(on){c.fillStyle='#42d9ca';c.beginPath();c.arc(x,y,4,0,TAU);c.fill()}c.restore();txt(c,label,x+13,y,'#e9f6ff',13)}
const BTN={play:{x:64,y:474,r:17},step:{x:108,y:474,r:14},reset:{x:922,y:474,r:15,hot:true}},NORM={x:158,y:474},SLOW={x:250,y:474};

// ---------- the stage ----------
// Fills the coarse grid with the wave field (colour = the light's colour, brightness = the instantaneous field) and smooths it onto the stage.
function paintField(c,p){const lam=p.lam*K,w=TAU*CNM/p.lam,ss=sources(p),col=spectral(p.lam),n=ss.length,tau=S0.tau;
  if(!S0.off){S0.off=document.createElement('canvas');S0.off.width=GW;S0.off.height=GH;S0.img=S0.off.getContext('2d').createImageData(GW,GH)}
  const d=S0.img.data,gain=.35+.65*p.amp;let i=0;
  for(let j=0;j<GH;j++){const y=FY+(j+.5)*FH/GH;for(let k=0;k<GW;k++){const x=FX+(k+.5)*FW/GW;let e=0;for(const s of ss){const r=Math.hypot(x-s.x,y-s.y);e+=p.amp*fade(r)*Math.sin(TAU*r/lam-w*tau)}
    const v=clamp(.5+.5*e/(n*.9),0,1),b=Math.pow(v,1.7)*gain;d[i]=col[0]*b;d[i+1]=col[1]*b;d[i+2]=col[2]*b;d[i+3]=255;i+=4}}
  S0.off.getContext('2d').putImageData(S0.img,0,0);c.save();c.beginPath();c.roundRect(FX,FY,FW,FH,4);c.clip();c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';c.drawImage(S0.off,FX,FY,FW,FH);c.restore()}
// The screen at the right edge: a 3-D slab whose face shows the time-averaged intensity, plus an intensity plot beside it.
function paintScreen(c,p){const col=spectral(p.lam);c.save();c.fillStyle='#16301f';c.beginPath();c.moveTo(XS,FY);c.lineTo(XS+16,FY-9);c.lineTo(XS+16,FY+FH-9);c.lineTo(XS,FY+FH);c.closePath();c.fill();
  c.fillStyle='#0f2417';c.beginPath();c.moveTo(XS,FY);c.lineTo(XS+16,FY-9);c.lineTo(XS+6,FY-9);c.lineTo(XS-10,FY);c.closePath();c.fill();c.restore();
  const pts=[];for(let y=FY;y<=FY+FH;y+=2){const I=Iscreen(p,y);pts.push([y,I]);c.fillStyle=`rgb(${col.map(v=>Math.round(v*(.1+.9*I))).join(',')})`;c.fillRect(XS,y,10,2.2)}
  c.save();c.strokeStyle='rgba(255,255,255,.25)';c.beginPath();c.moveTo(XS+22,FY);c.lineTo(XS+22,FY+FH);c.stroke();c.beginPath();c.moveTo(XS+22,FY);pts.forEach(([y,I])=>c.lineTo(XS+22+I*70,y));c.lineTo(XS+22,FY+FH);c.closePath();c.fillStyle=`rgba(${col},.25)`;c.fill();c.strokeStyle=`rgb(${col})`;c.lineWidth=1.8;c.stroke();c.restore();
  txt(c,'Screen',XS+8,FY-18,'#8ca6b9',11,'center',700);txt(c,'Intensity',XS+62,FY-18,'#8ca6b9',11,'center',700)}
// The graph of the field at the two probes against time (the last four femtoseconds) and a 1 fs scale bar.
function paintGraph(c,p,gy){const x0=PX,y0=FY,h=176,mid=y0+h/2-8,W=4,pxfs=(PW-34)/W,n=sources(p).length,cols=['#42d9ca','#ffa94d'];
  c.save();c.fillStyle='#0d2132';c.strokeStyle='#294358';c.beginPath();c.roundRect(x0,y0,PW,h,10);c.fill();c.stroke();c.strokeStyle='rgba(255,255,255,.12)';c.lineWidth=1;
  for(const k of[-.8,0,.8]){c.beginPath();c.moveTo(x0+12,mid+k*(h/2-26)*-1);c.lineTo(x0+PW-12,mid-k*(h/2-26)*-1);c.stroke()}c.restore();
  txt(c,'Electric field',x0+12,y0+14,'#e9f6ff',12,'left',700);
  S0.probe.forEach((q,i)=>{c.save();c.strokeStyle=cols[i];c.lineWidth=2;c.beginPath();const T=120;let ex=0,ey=0;for(let j=0;j<=T;j++){const t=S0.tau-W+W*j/T,e=Efield(p,q.x,q.y,t)/(Math.max(1,n)*.9),X=x0+14+(W*j/T)*pxfs,Y=mid-clamp(e,-1,1)*(h/2-30);j?c.lineTo(X,Y):c.moveTo(X,Y);ex=X;ey=Y}c.stroke();c.fillStyle=cols[i];c.beginPath();c.arc(ex,ey,4.5,0,TAU);c.fill();c.restore()});
  c.save();c.strokeStyle='#e9f6ff';c.lineWidth=2;c.beginPath();c.moveTo(x0+14,y0+h-14);c.lineTo(x0+14+pxfs,y0+h-14);c.moveTo(x0+14,y0+h-19);c.lineTo(x0+14,y0+h-9);c.moveTo(x0+14+pxfs,y0+h-19);c.lineTo(x0+14+pxfs,y0+h-9);c.stroke();c.restore();
  txt(c,'1 fs',x0+14+pxfs+8,y0+h-14,'#e9f6ff',11,'left',700);txt(c,'time →',x0+PW-12,y0+h-14,'#8ca6b9',11,'right',600);
  txt(c,'probe 1',x0+PW-72,y0+14,cols[0],11,'right',700);txt(c,'probe 2',x0+PW-12,y0+14,cols[1],11,'right',700)}
// The readout panel: wavelength, frequency, probe distances and what kind of interference each probe sees.
function paintReadout(c,p){const y0=FY+190,col=spectral(p.lam),ss=sources(p),lines=[];c.save();c.fillStyle='#0d2132';c.strokeStyle='#294358';c.beginPath();c.roundRect(PX,y0,PW,FY+FH-y0,10);c.fill();c.stroke();c.restore();
  const freq=CNM/p.lam*1000;lines.push([`λ = ${f(p.lam,0)} nm   f = ${f(freq,0)} THz`,`rgb(${col})`],[`T = ${f(p.lam/CNM,2)} fs   (c = λf)`,'#cfe2ee']);
  if(ss.length===2){lines.push([`d = ${f(p.sep,0)} nm   (drag a laser up or down)`,'#cfe2ee']);S0.probe.forEach((q,i)=>{const d=Math.abs(pathDiff(p,q))/p.lam;lines.push([`Probe ${i+1}: Δ = ${f(d,2)} λ → ${kind(p,q)}`,i?'#ffa94d':'#42d9ca'])});lines.push(['Bright: Δ = nλ.  Dark: Δ = (n + ½)λ','#8ca6b9'])}
  else lines.push(['One source: circular waves only,','#cfe2ee'],['no interference. Switch to two sources.','#cfe2ee']);
  const tp=S0.tape,dist=Math.hypot(tp[1].x-tp[0].x,tp[1].y-tp[0].y)/K;lines.push([`Tape measure: ${f(dist,0)} nm`,'#ffd43b']);
  lines.forEach(([s,k],i)=>txt(c,s,PX+12,y0+16+i*18,k,12,'left',i<2?700:600))}
// The tape measure: a yellow strip between two draggable ends, with its length printed.
function paintTape(c){const [a,b]=S0.tape,dist=Math.hypot(b.x-a.x,b.y-a.y)/K;c.save();c.strokeStyle='#ffd43b';c.lineWidth=4;c.lineCap='round';c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();
  c.strokeStyle='#14181d';c.lineWidth=1;const L=Math.hypot(b.x-a.x,b.y-a.y),ux=(b.x-a.x)/(L||1),uy=(b.y-a.y)/(L||1);for(let s=0;s<=L;s+=K*100){c.beginPath();c.moveTo(a.x+ux*s-uy*3,a.y+uy*s+ux*3);c.lineTo(a.x+ux*s+uy*3,a.y+uy*s-ux*3);c.stroke()}
  for(const q of[a,b]){c.fillStyle='#ffd43b';c.strokeStyle='#14181d';c.lineWidth=1.5;c.beginPath();c.arc(q.x,q.y,7,0,TAU);c.fill();c.stroke()}c.restore();
  txt(c,`${f(dist,0)} nm`,(a.x+b.x)/2,Math.min(a.y,b.y)-13,'#ffd43b',12,'center',800)}

INT[ID]={allViews:true,
 draw(c,p,t){
  // advance the wave clock (not while paused); 1 fs of wave time takes about 1.1 s on screen, a quarter of that when slow
  if(S0.lastT===null||t<S0.lastT)S0.lastT=t;const dt=clamp(t-S0.lastT,0,.1);S0.lastT=t;if(!S0.paused)S0.tau+=dt*(S0.slow?.2:.9);
  const col=spectral(p.lam),ss=sources(p),gy=FY+88;
  c.save();c.fillStyle='#060b10';c.fillRect(0,0,960,505);c.restore();
  paintField(c,p);paintScreen(c,p);
  // 500 nm scale bar like a map scale
  c.save();c.strokeStyle='#e9f6ff';c.lineWidth=2;c.beginPath();c.moveTo(FX,FY-14);c.lineTo(FX+K*500,FY-14);c.moveTo(FX,FY-19);c.lineTo(FX,FY-9);c.moveTo(FX+K*500,FY-19);c.lineTo(FX+K*500,FY-9);c.stroke();c.restore();txt(c,'500 nm',FX+K*500+8,FY-14,'#e9f6ff',11,'left',700);
  for(const s of ss)laser(c,FX-56,s.y,col.join(','));
  if(ss.length===2){const x=FX+9;c.save();c.strokeStyle='rgba(255,255,255,.55)';c.setLineDash([3,3]);c.beginPath();c.moveTo(x,ss[0].y);c.lineTo(x,ss[1].y);c.stroke();c.restore();txt(c,`d`,x+8,CY,'#ffffff',12,'left',700)}
  paintGraph(c,p,gy);paintReadout(c,p);
  S0.probe.forEach((q,i)=>probe(c,q,i,i?'#ffa94d':'#42d9ca',gy+i*34));paintTape(c);
  txt(c,'Drag the lasers, probes and tape. Dark and bright bands on the screen are interference fringes.',FX,FY-40,'#8ca6b9',11,'left',600);
  button(c,BTN.play,!S0.paused,(k,b)=>{if(S0.paused){k.beginPath();k.moveTo(b.x-5,b.y-8);k.lineTo(b.x+8,b.y);k.lineTo(b.x-5,b.y+8);k.closePath();k.fill()}else{k.fillRect(b.x-7,b.y-8,5,16);k.fillRect(b.x+2,b.y-8,5,16)}});
  button(c,BTN.step,false,(k,b)=>{k.beginPath();k.moveTo(b.x-6,b.y-7);k.lineTo(b.x+3,b.y);k.lineTo(b.x-6,b.y+7);k.closePath();k.fill();k.fillRect(b.x+5,b.y-7,3,14)});
  radio(c,NORM.x,NORM.y,'Normal',!S0.slow);radio(c,SLOW.x,SLOW.y,'Slow',S0.slow);txt(c,'Step moves the wave by 1/12 of a period',320,474,'#8ca6b9',11,'left',600);
  button(c,BTN.reset,false,(k,b)=>{k.beginPath();k.arc(b.x,b.y,7,Math.PI*.25,Math.PI*1.85);k.stroke();k.beginPath();k.moveTo(b.x+9,b.y-6);k.lineTo(b.x+9,b.y+3);k.lineTo(b.x+1,b.y-1);k.closePath();k.fill()});
 },
 // Pointer down: pick the first thing under the finger (buttons, probes, tape ends, lasers).
 down(q,p){const near=(o,r)=>Math.hypot(q.x-o.x,q.y-o.y)<=r;
  if(near(BTN.play,BTN.play.r+4)){S0.paused=!S0.paused;return}
  if(near(BTN.step,BTN.step.r+4)){S0.paused=true;S0.tau+=p.lam/CNM/12;return}
  if(near(BTN.reset,BTN.reset.r+4)){const keep={paused:S0.paused,slow:S0.slow,off:S0.off,img:S0.img};S0=Object.assign(DEF(),keep,{tau:0,lastT:null});return}
  if(near(NORM,60)&&q.x<210){S0.slow=false;return}if(q.x>=210&&near(SLOW,50)){S0.slow=true;return}
  for(let i=0;i<2;i++)if(near(S0.probe[i],20)){S0.mode={k:'probe',i};return}
  for(let i=0;i<2;i++)if(near(S0.tape[i],14)){S0.mode={k:'tape',i};return}
  if(+p.n===2&&q.x<FX+16&&Math.abs(q.y-CY)<FH/2){S0.mode={k:'laser'};this.move(q,p)}},
 move(q,p){const m=S0.mode;if(!m)return;
  if(m.k==='probe')S0.probe[m.i]={x:clamp(q.x,FX+4,XS-4),y:clamp(q.y,FY+4,FY+FH-4)};
  else if(m.k==='tape')S0.tape[m.i]={x:clamp(q.x,FX-30,XS+10),y:clamp(q.y,FY-4,FY+FH+4)};
  else if(m.k==='laser')p.sep=clamp(Math.round(2*Math.abs(q.y-CY)/K/50)*50,500,4000)},
 up(){S0.mode=null}};

// the lab uses the whole 960 × 505 stage
(window.PhysicaFullStage=window.PhysicaFullStage||{})[ID]=(c,p,t)=>INT[ID].draw(c,p,t);

add({base:'doubleslit',id:ID,title:'Wave interference (two sources)',
 description:'Two coherent light sources send circular waves. Watch the waves add up: bright and dark bands appear on the screen where the waves arrive in step or out of step.',
 formula:'Bright: Δ = nλ ;  Dark: Δ = (n + ½)λ ;  d sin θ = nλ ;  fringe spacing β ≈ λL/d',
 observe:'Along each line where the path difference is a whole number of wavelengths the two waves reinforce; between them they cancel. The probes show the field at one point against time.',
 tryText:'Move probe 1 onto a dark line and probe 2 onto a bright line. Then double the separation d. What happens to the number of bright lines?',
 controls:[R('lam','Colour (wavelength)',380,750,5,550,'nm'),R('amp','Amplitude',.1,1,.05,1,'',2),R('sep','Source separation d',500,4000,50,1500,'nm'),S('n','Number of sources','2',[['1','One source'],['2','Two sources']])],
 metrics:p=>{const d=Math.abs(pathDiff(p,S0.probe[0]))/p.lam,L=(XS-FX)/K;return[N('Frequency',f(CNM/p.lam*1000,0)+' THz'),N('Period',f(p.lam/CNM,2)+' fs'),N('First maximum (far field)',+p.n===2&&p.lam<p.sep?f(Math.asin(p.lam/p.sep)*180/Math.PI,1)+'°':'—'),N('Fringe spacing on screen (λL/d)',+p.n===2?f(p.lam*L/p.sep,0)+' nm':'—'),N('Probe 1 path difference',+p.n===2?f(d,2)+' λ':'—')]},
 draw:(c,p,t)=>INT[ID].draw(c,p,t),flat:true,
 assumption:'Two point sources in phase, circular waves with a gentle fall-off with distance, intensity on the screen ∝ |sum of the two waves|² averaged over a period. The nanometre scale is true to the picture (500 nm bar).'});
done();
})();
