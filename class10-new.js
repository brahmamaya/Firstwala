/* Class 10 (NCERT Science) experiments that the Class 11/12 library does not already cover.
   Flat 2D diagrams, the way they appear in the textbook; every number shown is computed from the model. */
(() => {
'use strict';
const {R,S,N,f,clamp,rad,deg,cycle,tag,chart,pack,PI,TAU,C}=window.PhysicaLab;
const {add,done}=pack();
const ch=(no,chapter,subject,group)=>({grade:10,chapterNo:no,chapter,subject,group,flat:true});
const L9=ch(9,'Light – Reflection and Refraction','physics','NATURAL PHENOMENA'),L10=ch(10,'The Human Eye and the Colourful World','physics','NATURAL PHENOMENA'),
  E11=ch(11,'Electricity','physics','EFFECTS OF CURRENT'),M12=ch(12,'Magnetic Effects of Electric Current','physics','EFFECTS OF CURRENT'),
  C1=ch(1,'Chemical Reactions and Equations','chemistry','CHEMICAL SUBSTANCES'),C2=ch(2,'Acids, Bases and Salts','chemistry','CHEMICAL SUBSTANCES'),
  C3=ch(3,'Metals and Non-metals','chemistry','CHEMICAL SUBSTANCES'),C4=ch(4,'Carbon and its Compounds','chemistry','CHEMICAL SUBSTANCES'),
  B13=ch(13,'Our Environment','botany','NATURAL RESOURCES');

// ---- small 2D drawing helpers (logical 960 × 505 stage; the measurement panel sits at x ≥ 689)
function ln(c,x1,y1,x2,y2,col,w=2,dash){c.save();c.strokeStyle=col;c.lineWidth=w;if(dash)c.setLineDash(dash);c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke();c.restore()}
function arrow(c,x1,y1,x2,y2,col,w=2.5,h=10){ln(c,x1,y1,x2,y2,col,w);const a=Math.atan2(y2-y1,x2-x1);c.save();c.fillStyle=col;c.beginPath();c.moveTo(x2,y2);c.lineTo(x2-h*Math.cos(a-.4),y2-h*Math.sin(a-.4));c.lineTo(x2-h*Math.cos(a+.4),y2-h*Math.sin(a+.4));c.closePath();c.fill();c.restore()}
function dot(c,x,y,r,fill,stroke,w=1.5){c.save();c.beginPath();c.arc(x,y,r,0,TAU);if(fill){c.fillStyle=fill;c.fill()}if(stroke){c.strokeStyle=stroke;c.lineWidth=w;c.stroke()}c.restore()}
function box(c,x,y,w,h,fill,stroke,r=8){c.save();c.beginPath();c.roundRect(x,y,w,h,r);if(fill){c.fillStyle=fill;c.fill()}if(stroke){c.strokeStyle=stroke;c.lineWidth=1.5;c.stroke()}c.restore()}
const T=(c,s,x,y,col=C.white,size=14,align='left',weight='600')=>tag(c,s,x,y,col,size,align,weight);
const mix=(a,b,k)=>{const p=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)),A=p(a),B=p(b);return'#'+A.map((v,i)=>Math.round(v+(B[i]-v)*clamp(k,0,1)).toString(16).padStart(2,'0')).join('')};
const SUB=n=>String(n).replace(/\d/g,d=>'₀₁₂₃₄₅₆₇₈₉'[d]);
// a beaker with liquid
function beaker(c,x,y,w,h,liquid,level=.7){c.save();const ly=y+h*(1-level);c.fillStyle=liquid;c.beginPath();c.moveTo(x+3,ly);c.lineTo(x+w-3,ly);c.lineTo(x+w-3,y+h-6);c.quadraticCurveTo(x+w-3,y+h-2,x+w-8,y+h-2);c.lineTo(x+8,y+h-2);c.quadraticCurveTo(x+3,y+h-2,x+3,y+h-6);c.closePath();c.fill();
  c.strokeStyle='#cfe8f5cc';c.lineWidth=2.5;c.beginPath();c.moveTo(x-6,y);c.lineTo(x,y+6);c.lineTo(x,y+h-6);c.quadraticCurveTo(x,y+h,x+6,y+h);c.lineTo(x+w-6,y+h);c.quadraticCurveTo(x+w,y+h,x+w,y+h-6);c.lineTo(x+w,y);c.stroke();
  c.globalAlpha=.25;c.fillStyle='#fff';c.fillRect(x+8,y+14,5,h-30);c.restore()}

/* ======================= PHYSICS ======================= */

// Chapter 9: refraction through a rectangular glass slab
add({...L9,id:'c10-glass-slab',title:'Refraction through a glass slab',
 description:'A ray passes through a rectangular glass slab. It bends towards the normal on entering and away on leaving.',
 formula:'n = sin i / sin r,  emergent ray ∥ incident ray,  d = t sin(i − r) / cos r',
 observe:'The emergent ray is parallel to the incident ray but shifted sideways (lateral displacement).',
 tryText:'Increase the angle of incidence. Does the lateral shift grow? What happens at i = 0?',
 controls:[R('i','Angle of incidence i',0,80,1,40,'°',0),R('n','Refractive index of glass',1.3,1.9,.01,1.5,'',2),R('t','Slab thickness t',2,8,.5,5,'cm',1)],
 metrics:p=>{const r=Math.asin(Math.sin(rad(p.i))/p.n),d=p.t*Math.sin(rad(p.i)-r)/Math.cos(r);return[N('Angle of refraction r',deg(r),'°',1),N('Angle of emergence e',p.i,'°',1),N('Lateral displacement d',d,'cm',2),N('Speed of light in glass',3e8/p.n,'m/s',3)]},
 draw:(c,p,t)=>{const K=34,top=245-p.t*K/2,bot=245+p.t*K/2,x0=150,x1=600,ix=330,i=rad(p.i),r=Math.asin(Math.sin(i)/p.n);
  box(c,x0,top,x1-x0,bot-top,'#7fc8e83a','#bfe8ff',2);T(c,'glass  n = '+f(p.n,2),x1-8,bot-12,'#bfe8ff',12,'right');
  const L=170,sx=ix-L*Math.sin(i),sy=top-L*Math.cos(i),ox=ix+(bot-top)*Math.tan(r),E=150;
  ln(c,ix,top-80,ix,top+50,C.muted,1.2,[5,5]);ln(c,ox,bot-50,ox,bot+80,C.muted,1.2,[5,5]);
  arrow(c,sx,sy,(sx+ix)/2,(sy+top)/2,C.gold);ln(c,sx,sy,ix,top,C.gold,2.5);ln(c,ix,top,ox,bot,C.gold,2.5);
  const ex=ox+E*Math.sin(i),ey=bot+E*Math.cos(i);ln(c,ox,bot,ex,ey,C.gold,2.5);arrow(c,ox,bot,(ox+ex)/2,(bot+ey)/2,C.gold);
  // undeviated path and the lateral shift
  const ux=ix+(bot-top+E*Math.cos(i))*Math.tan(i),uy=bot+E*Math.cos(i);ln(c,ix,top,ux,uy,C.gold+'66',1.5,[6,6]);
  const d=p.t*Math.sin(i-r)/Math.cos(r);if(p.i>3){const nx=Math.cos(i),ny=-Math.sin(i),mx=ox+60*Math.sin(i),my=bot+60*Math.cos(i);ln(c,mx,my,mx+nx*d*K,my+ny*d*K,C.mint,2);T(c,'d = '+f(d,2)+' cm',mx+nx*d*K+8,my+ny*d*K+4,C.mint,13)}
  T(c,'i = '+f(p.i,0)+'°',ix-70,top-30,C.white,13);T(c,'r = '+f(deg(r),1)+'°',ix+8,top+28,C.white,13);T(c,'e = '+f(p.i,0)+'°',ox+10,bot+60,C.white,13);
  T(c,'normal',ix+5,top-70,C.muted,11)},
 assumption:'Slab in air; monochromatic light; thickness drawn to scale.'});

// Chapter 10: defects of vision and their correction
const EYE={x:430,r:62,ret:524};
add({...L10,id:'c10-eye-defects',title:'Defects of vision and their correction',
 description:'See where a short-sighted or long-sighted eye focuses light, and the lens that corrects it.',
 formula:'Myopia: P = −1 / far point (m);  Hypermetropia: P = 1/0.25 − 1/near point (m)',
 observe:'A myopic eye focuses distant objects in front of the retina; a concave lens fixes it. A hypermetropic eye focuses near objects behind the retina; a convex lens fixes it.',
 tryText:'Choose myopia with a far point of 2 m. What power of spectacles is needed?',
 controls:[S('defect','Eye',['myopia'][0],[['normal','Normal eye'],['myopia','Myopia (short-sight)'],['hyper','Hypermetropia (long-sight)']]),R('fp','Far point (myopia)',.5,5,.1,2,'m',1),R('np','Near point (hypermetropia)',.3,2,.05,1,'m',2),S('fix','Spectacles',0,[[0,'Not worn'],[1,'Corrective lens worn']])],
 metrics:p=>{if(p.defect==='normal')return[N('Far point','∞ (very far)'),N('Near point','25 cm'),N('Image','On the retina ✓'),N('Spectacles','Not needed')];
  if(p.defect==='myopia'){const P=-1/p.fp;return[N('Far point',p.fp,'m',1),N('Corrective lens','Concave (diverging)'),N('Power needed',P,'D',2),N('Focal length',-p.fp*100,'cm',0),N('Image of a distant object',+p.fix?'On the retina ✓':'In front of the retina')]}
  const P=4-1/p.np;return[N('Near point',p.np*100,'cm',0),N('Corrective lens','Convex (converging)'),N('Power needed',P,'D',2),N('Focal length',100/P,'cm',1),N('Image of an object at 25 cm',+p.fix?'On the retina ✓':'Behind the retina')]},
 draw:(c,p,t)=>{const {x,r,ret}=EYE,cy=255,lensX=x-r+18;let fx=ret;const fix=+p.fix;
  if(p.defect==='myopia'&&!fix)fx=ret-clamp(30/p.fp+12,14,74);if(p.defect==='hyper'&&!fix)fx=ret+clamp(14*(4-1/p.np),10,60);
  dot(c,x,cy,r+38,'#f3e9e1','#d9c3b3',2);dot(c,x,cy,r+28,'#1b2633');c.save();c.beginPath();c.arc(x,cy,r+38,-.5,.5);c.lineWidth=7;c.strokeStyle='#ff9b8a';c.stroke();c.restore();
  T(c,'retina',x+r+44,cy-70,'#ff9b8a',12);c.save();c.translate(lensX,cy);c.scale(.42,1);dot(c,0,0,46,'#bfe8ffaa','#e9f6ff',2);c.restore();T(c,'eye lens',lensX-26,cy+64,C.muted,11);
  // rays: parallel from a distant object (myopia/normal) or diverging from a near object (hypermetropia)
  const near=p.defect==='hyper',ox=near?120:40,hs=[-34,0,34],sp=near?'object at 25 cm':'distant object';T(c,sp,near?80:40,cy-90,C.muted,12);if(near){arrow(c,ox,cy+30,ox,cy-40,C.gold,3,9)}
  // spectacle lens
  const sx=lensX-95;if(fix&&p.defect!=='normal'){c.save();c.translate(sx,cy);const concave=p.defect==='myopia';c.fillStyle='#bfe8ff55';c.strokeStyle='#e9f6ff';c.lineWidth=2;c.beginPath();
    if(concave){c.moveTo(-14,-60);c.lineTo(14,-60);c.quadraticCurveTo(2,0,14,60);c.lineTo(-14,60);c.quadraticCurveTo(-2,0,-14,-60)}else{c.moveTo(0,-60);c.quadraticCurveTo(22,0,0,60);c.quadraticCurveTo(-22,0,0,-60)}c.fill();c.stroke();c.restore();T(c,concave?'concave lens':'convex lens',sx,cy+82,C.mint,12,'center')}
  for(const h of hs){const sy=near?cy-5:cy+h;let ax=near?ox:ox,ay=sy,bx=fix&&p.defect!=='normal'?sx:lensX,by=near?cy+h*1.0:cy+h;
    // through the spectacle lens first (bends to the angle the eye needs)
    if(fix&&p.defect!=='normal'){ln(c,ax,ay,bx,by,C.gold,2);ax=bx;ay=by;by=cy+h}
    ln(c,ax,ay,lensX,cy+h,C.gold,2);
    // inside the eye: converge to the focus, then continue to the retina
    const k=(ret-lensX)/(fx-lensX);ln(c,lensX,cy+h,fx,cy,C.gold,2);if(fx<ret){const ex=ret,ey=cy+(cy-(cy+h))*(ex-fx)/(fx-lensX);ln(c,fx,cy,ex,ey,C.gold+'aa',2)}else if(fx>ret){ln(c,ret,cy+h*(1-k),fx,cy,C.gold+'55',1.5,[4,4])}}
  dot(c,fx,cy,5,fx===ret?C.mint:C.red);T(c,fx===ret?'sharp image on the retina':fx<ret?'focus in front of the retina':'focus behind the retina',fx,cy+110,fx===ret?C.mint:C.red,13,'center')},
 assumption:'Schematic eye (lens–retina distance about 2.3 cm, drawn enlarged); spectacles close to the eye; least distance of distinct vision 25 cm.'});

// Chapter 10: scattering of light — blue sky, red sunset
const LAM=[650,550,450];
const skyModel=p=>{const am=1/Math.max(.035,Math.sin(rad(p.sun))),small=p.size==='molecules',k=small?.13:.02;
  const tr=LAM.map(l=>Math.exp(-k*(small?(550/l)**4:1)*am-(small?0:(p.size==='cloud'?.9:.25))*am*.4)),sc=LAM.map(l=>small?(550/l)**4:1);return{am,tr,sc,small}};
const rgb=a=>'#'+a.map(v=>Math.round(clamp(v,0,1)*255).toString(16).padStart(2,'0')).join('');
add({...L10,id:'c10-scattering',title:'Scattering of light: blue sky, red sunset',
 description:'Sunlight is scattered by the air. Change the height of the Sun and the size of the particles in the air.',
 formula:'Scattering by very small particles ∝ 1/λ⁴ (blue scattered most)',
 observe:'Air molecules scatter blue light far more than red, so the sky is blue. At sunrise and sunset light crosses much more air, so mostly red reaches us.',
 tryText:'Lower the Sun to 5°. Then make the particles large (cloud droplets): why do clouds look white?',
 controls:[R('sun','Height of the Sun above horizon',2,90,1,60,'°',0),S('size','Particles in the air',['molecules'][0],[['molecules','Air molecules (very small)'],['dust','Fine dust / smoke'],['cloud','Water droplets (large)']])],
 metrics:p=>{const m=skyModel(p),ratio=m.small?(650/450)**4:1,sun=m.tr[2]/m.tr[0];return[N('Path through air',m.am,'× overhead',1),N('Blue scattered vs red',ratio,'×',2),N('Sun looks',sun>.8?'White-yellow':sun>.45?'Yellow-orange':sun>.15?'Orange':'Red'),N('Sky looks',m.small?(p.sun<6?'Red-orange near the horizon':'Blue'):p.size==='cloud'?'White (all colours scattered)':'Hazy, whitish')]},
 draw:(c,p,t)=>{const m=skyModel(p),X0=40,X1=670,Y0=80,GY=400;const sunc=m.tr.map(v=>v/Math.max(...m.tr));
  const skyTop=m.small?rgb(m.sc.map((s,i)=>.1+.62*s/m.sc[2]*Math.min(1,m.tr[i]+.35)).map((v,i)=>v*(.35+.65*Math.min(1,p.sun/25)))):p.size==='cloud'?'#c9d2db':'#b8bcc0';
  const g=c.createLinearGradient(0,Y0,0,GY);g.addColorStop(0,skyTop);g.addColorStop(1,p.sun<12&&m.small?rgb([1,.55*sunc[1]+.25,.3*sunc[2]+.15]):mix(skyTop,'#ffffff',.35));c.fillStyle=g;c.fillRect(X0,Y0,X1-X0,GY-Y0);
  c.fillStyle='#24331f';c.fillRect(X0,GY,X1-X0,40);
  const ang=rad(p.sun),sx=200+380*Math.cos(ang),sy=GY-300*Math.sin(ang);dot(c,sx,sy,30,rgb(sunc.map(v=>.25+.75*v)));c.save();c.globalAlpha=.25;dot(c,sx,sy,48,rgb(sunc));c.restore();
  // observer and the path of sunlight through the atmosphere
  const ox=200,oy=GY;dot(c,ox,oy-14,6,'#e9f6ff');ln(c,ox,oy-8,ox,oy+10,'#e9f6ff',3);ln(c,sx,sy,ox,oy-14,'#fff6',2,[6,6]);
  if(m.small){for(let k=0;k<7;k++){const q=(k+.5)/7,px=sx+(ox-sx)*q,py=sy+(oy-14-sy)*q,a=TAU*cycle(t*.3+k*.37,1);arrow(c,px,py,px+22*Math.cos(a),py+22*Math.sin(a),'#7baaff',1.8,6)}}
  T(c,m.small?'blue light scattered sideways':'all colours scattered equally',X0+12,Y0+20,'#0b1c2b',13);T(c,'observer',ox,oy+28,C.white,12,'center')},
 assumption:'Qualitative atmosphere model: Rayleigh scattering ∝ λ⁻⁴ for molecules; large particles scatter all colours about equally; path length ∝ 1 / sin(height).'});

// Chapter 11: resistance of a wire
const RHO={copper:[1.68e-8,'Copper','#d9844a'],aluminium:[2.65e-8,'Aluminium','#c5ccd3'],iron:[9.7e-8,'Iron','#8d99a6'],nichrome:[1.10e-6,'Nichrome','#b9a37a']};
add({...E11,id:'c10-wire-resistance',title:'Resistance of a wire',
 description:'Change the material, length and thickness of a wire and see how its resistance and the current change.',
 formula:'R = ρ l / A,  A = π d² / 4,  I = V / R',
 observe:'Resistance doubles when length doubles, and becomes one-fourth when the diameter doubles. Nichrome resists far more than copper.',
 tryText:'Double the length, then double the diameter. Which change matters more?',
 controls:[S('mat','Material','nichrome',[['copper','Copper'],['aluminium','Aluminium'],['iron','Iron'],['nichrome','Nichrome']]),R('L','Length l',.1,5,.1,1,'m',1),R('d','Diameter d',.1,2,.05,.5,'mm',2),R('V','Cell voltage',1.5,12,.5,1.5,'V',1)],
 metrics:p=>{const [rho]=RHO[p.mat],A=PI*(p.d/1000)**2/4,Rw=rho*p.L/A;return[N('Resistivity ρ',rho,'Ω m',2),N('Cross-section A',A*1e6,'mm²',3),N('Resistance R',Rw,'Ω',3),N('Current I',p.V/Rw,'A',3)]},
 draw:(c,p,t)=>{const [rho,name,col]=RHO[p.mat],A=PI*(p.d/1000)**2/4,Rw=rho*p.L/A,I=p.V/Rw,len=60+500*p.L/5,th=2+p.d*9,y=255,x0=90;
  box(c,x0-10,y-60,len+20,120,'#ffffff08','#29475b');c.save();c.fillStyle=col;c.fillRect(x0,y-th/2,len,th);c.restore();T(c,name+' wire',x0,y-th/2-14,col,13);
  ln(c,x0,y,x0,y+120,'#9fb4c2',2);ln(c,x0+len,y,x0+len,y+120,'#9fb4c2',2);ln(c,x0,y+120,x0+len,y+120,'#9fb4c2',2);
  const bx=x0+len/2;box(c,bx-26,y+108,52,24,'#2f3d48','#c9d3da',4);T(c,f(p.V,1)+' V',bx,y+121,C.white,12,'center');
  // drifting charges: speed ∝ current (capped for display)
  const n=Math.round(clamp(len/22,6,26)),v=clamp(Math.log10(1+I*20)*40,4,160);for(let k=0;k<n;k++){const xx=x0+cycle(k*len/n+t*v,len);dot(c,xx,y,Math.max(2,th/3.2),C.gold)}
  T(c,'l = '+f(p.L,1)+' m',x0+len/2,y-th/2-34,C.muted,12,'center');T(c,'d = '+f(p.d,2)+' mm',x0+len+16,y+4,C.muted,12);
  T(c,'R = '+(Rw<1?f(Rw,3):f(Rw,2))+' Ω',x0,y+170,C.mint,18);T(c,'I = '+f(I,3)+' A',x0+250,y+170,C.gold,18)},
 assumption:'Resistivities at 20 °C; ideal cell and connecting wires; uniform wire.'});

// Chapter 11: electric power, heating and the electricity bill
add({...E11,id:'c10-electric-power',title:'Electric power and the electricity bill',
 description:'Choose an appliance rating and how long it runs. Find the current, the heat produced and the monthly bill.',
 formula:'P = VI = I²R = V²/R,  E (kWh) = P (kW) × t (h)',
 observe:'A geyser or heater uses far more energy than a bulb; 1 unit = 1 kWh = 3.6 × 10⁶ J.',
 tryText:'Compare a 9 W LED bulb with a 2000 W geyser used 1 hour a day.',
 controls:[R('P','Power rating',5,3000,5,100,'W',0),R('h','Use per day',.5,24,.5,6,'h',1),R('rate','Tariff',2,12,.5,7,'₹/unit',1)],
 presets:[['9 W LED bulb, 6 h a day',{P:9,h:6}],['1500 W iron, 1 h a day',{P:1500,h:1}],['2000 W geyser, 1 h a day',{P:2000,h:1}]],
 metrics:p=>{const V=220,I=p.P/V,Rr=V*V/p.P,kwh=p.P/1000*p.h*30,fuse=[1,2,3,5,10,15,20].find(a=>a>=I*1.25)||32;return[N('Current I = P/V',I,'A',2),N('Resistance R = V²/P',Rr,'Ω',1),N('Heat in 1 minute',p.P*60,'J',0),N('Energy per month (30 days)',kwh,'kWh',1),N('Monthly bill',`₹ ${f(kwh*p.rate,0)}`),N('Suitable fuse',fuse,'A',0)]},
 draw:(c,p,t)=>{const glow=clamp(Math.log10(p.P)/3.5,.1,1),bx=200,by=230;c.save();const g=c.createRadialGradient(bx,by,10,bx,by,150);g.addColorStop(0,`rgba(255,214,120,${.55*glow})`);g.addColorStop(1,'rgba(255,214,120,0)');c.fillStyle=g;c.fillRect(bx-160,by-160,320,320);c.restore();
  dot(c,bx,by,54,mix('#5b5440','#ffe8a3',glow),'#e9f6ff',2);box(c,bx-22,by+50,44,34,'#9fb4c2',null,4);ln(c,bx-16,by+10,bx,by-20,'#ffb347',3);ln(c,bx,by-20,bx+16,by+10,'#ffb347',3);
  T(c,f(p.P,0)+' W at 220 V',bx,by+110,C.white,15,'center');
  // energy meter: units counting up over a simulated month
  const mx=420,my=150,kwh=p.P/1000*p.h*30,days=cycle(t*3,30);box(c,mx,my,220,170,'#0d2132','#294358',12);T(c,'ENERGY METER',mx+110,my+22,C.mint,12,'center');
  box(c,mx+20,my+44,180,48,'#061019','#3c5a6e',6);T(c,f(kwh*days/30,1).padStart(6,' ')+' kWh',mx+110,my+70,C.gold,22,'center');
  T(c,'day '+Math.floor(days+1)+' of 30',mx+110,my+112,C.muted,12,'center');const disc=TAU*cycle(t*Math.min(4,p.P/400+.2),1);dot(c,mx+110,my+142,14,'#2f3d48','#9fb4c2');ln(c,mx+110,my+142,mx+110+12*Math.cos(disc),my+142+12*Math.sin(disc),C.red,2)},
 assumption:'Mains supply 220 V; the appliance draws its rated power; 30-day month; fuse chosen about 25% above the running current.'});

// Chapter 12: magnetic field around a straight current-carrying wire
add({...M12,id:'c10-wire-field',title:'Magnetic field around a straight wire',
 description:'A vertical wire passes through a card. Pass a current and see the circular field lines and the compass needles.',
 formula:'B = μ₀ I / (2π r)  (right-hand thumb rule gives the direction)',
 observe:'The field lines are concentric circles. Reversing the current reverses the compass needles; the field is weaker farther away.',
 tryText:'Reverse the current. Then double the distance: by how much does B fall?',
 controls:[R('I','Current I (positive = upward)',-10,10,.5,5,'A',1),R('r','Distance of the compass r',1,10,.5,3,'cm',1)],
 metrics:p=>{const B=2e-7*Math.abs(p.I)/(p.r/100);return[N('Field B at r',B*1e6,'μT',1),N('Compared with Earth’s field',B/5e-5,'×',2),N('Direction (seen from above)',p.I===0?'No field':p.I>0?'Anticlockwise':'Clockwise')]},
 draw:(c,p,t)=>{const cx=330,cy=260,K=22;c.save();c.translate(cx,cy);c.scale(1,.5);dot(c,0,0,250,'#e9f6ff10','#9fb4c2');c.restore();
  const sgn=Math.sign(p.I);for(let k=1;k<=6;k++){const rr=k*30*1.15;c.save();c.translate(cx,cy);c.scale(1,.5);dot(c,0,0,rr,null,sgn?`rgba(66,217,202,${.85-k*.11})`:'#29475b',2);c.restore();
   if(sgn){const a=(sgn>0?-1:1)*(t*.6+k*.4),ax=cx+rr*Math.cos(a),ay=cy+rr*.5*Math.sin(a),d=sgn>0?-1:1;arrow(c,ax,ay,ax-d*12*Math.sin(a),ay+d*6*Math.cos(a),C.mint,2,8)}}
  ln(c,cx,cy-180,cx,cy+150,'#d9844a',5);arrow(c,cx+16,sgn>=0?cy-60:cy-130,cx+16,sgn>=0?cy-130:cy-60,sgn?C.gold:'#29475b',3,10);T(c,'I = '+f(p.I,1)+' A',cx+26,cy-100,C.gold,13);
  // compasses on a circle of radius r: needles tangent to the field (or pointing north with no current)
  const rr=p.r*K*1.15+12;for(let k=0;k<8;k++){const a=TAU*k/8,x=cx+rr*Math.cos(a),y=cy+rr*.5*Math.sin(a);dot(c,x,y,11,'#0d2132','#c9d3da');
   const B=2e-7*Math.abs(p.I)/(p.r/100),w=B/(B+5e-5),tx=-Math.sin(a)*(sgn>0?1:-1),ty=Math.cos(a)*(sgn>0?1:-1)*.5,nx=sgn?tx*w:0,ny=sgn?ty*w-(1-w):-1,L=Math.hypot(nx,ny)||1;ln(c,x-8*nx/L,y-8*ny/L,x+8*nx/L,y+8*ny/L,C.red,2.5);dot(c,x,y,2,'#fff')}
  T(c,'r = '+f(p.r,1)+' cm',cx+rr+16,cy,C.muted,12)},
 assumption:'Long straight wire; compasses also feel Earth’s horizontal field (taken as 50 μT towards the top of the card).'});

/* ======================= CHEMISTRY ======================= */

// Chapter 2: acid–base indicators
const SOL=[['hcl','Dilute hydrochloric acid',1],['lemon','Lemon juice',2.2],['vinegar','Vinegar',3],['water','Distilled water',7],['soda','Baking soda solution',8.3],['soap','Soap solution',10],['naoh','Dilute sodium hydroxide',13]];
const UNI=['#d7263d','#e8432c','#f26b2b','#f7a134','#f9d342','#c8d64a','#7bc043','#3aa655','#2f9e8f','#2c7fb8','#3b5aa8','#4b3f9e','#5b2c83','#4a1a6b','#3a1257'];
function indic(ind,pH){switch(ind){
  case'blue-litmus':return pH<6.5?['#d0453f','turns red']:['#4a6fd1','stays blue'];
  case'red-litmus':return pH>7.5?['#4a6fd1','turns blue']:['#d0453f','stays red'];
  case'phenol':return pH>=8.2?[mix('#ffffff','#e0217d',clamp((pH-8.2)/1.8,.25,1)),'turns pink']:['#eef3f6','stays colourless'];
  case'methyl':return pH<3.1?['#d0302b','turns red']:pH<=4.4?['#f08a24','orange']:['#f2c916','turns yellow'];
  case'turmeric':return pH>=8.6?['#a4372a','turns reddish-brown']:['#f2b705','stays yellow'];
  default:return[UNI[clamp(Math.round(pH),0,14)],'colour of pH '+Math.round(pH)]}}
add({...C2,id:'c10-indicators',title:'Acid–base indicators',
 description:'Test common solutions with litmus, phenolphthalein, methyl orange, turmeric and universal indicator.',
 formula:'pH < 7 acidic,  pH = 7 neutral,  pH > 7 basic',
 observe:'Acids turn blue litmus red; bases turn red litmus blue and phenolphthalein pink. Universal indicator shows the pH by colour.',
 tryText:'Find a solution that turns phenolphthalein pink but is only weakly basic.',
 controls:[S('sol','Solution','lemon',SOL.map(([k,n])=>[k,n])),S('ind','Indicator','blue-litmus',[['blue-litmus','Blue litmus paper'],['red-litmus','Red litmus paper'],['phenol','Phenolphthalein'],['methyl','Methyl orange'],['turmeric','Turmeric'],['universal','Universal indicator']])],
 metrics:p=>{const s=SOL.find(x=>x[0]===p.sol),pH=s[2],[,txt]=indic(p.ind,pH);return[N('pH',pH,'',1),N('Nature',pH<7?'Acidic':pH>7?'Basic':'Neutral'),N('Indicator',txt),N('[H⁺]',10**-pH,'mol/L',4)]},
 draw:(c,p,t)=>{const s=SOL.find(x=>x[0]===p.sol),pH=s[2],[col,txt]=indic(p.ind,pH),paper=p.ind.endsWith('litmus');
  const base=pH<3?'#f3f0d8':pH>9?'#e6eef5':'#dfeef3';beaker(c,140,150,150,190,(paper?base:col)+'cc',.62);T(c,s[1],215,370,C.white,13,'center');
  if(paper){const dip=clamp(cycle(t*.25,1)*2,0,1),py=110+dip*130,orig=p.ind==='blue-litmus'?'#4a6fd1':'#d0453f';box(c,203,py,24,110,orig,null,3);const wet=Math.max(py,222);if(py+110>wet){c.save();c.fillStyle=col;c.fillRect(203,wet,24,py+110-wet);c.restore()}}
  T(c,txt,215,128,C.gold,15,'center');
  // pH scale
  const x0=360,y0=200,w=300;for(let k=0;k<15;k++){c.fillStyle=UNI[k];c.fillRect(x0+k*w/15,y0,w/15+1,26)}for(let k=0;k<=14;k+=7)T(c,k,x0+k*w/15+w/30,y0+44,C.muted,12,'center');
  const mx=x0+(pH+.5)*w/15;arrow(c,mx,y0-30,mx,y0-4,C.white,2.5,9);T(c,'pH '+f(pH,1),mx,y0-40,C.white,13,'center');T(c,'acidic',x0,y0+68,'#ff857e',12);T(c,'neutral',x0+w/2,y0+68,'#9fd17f',12,'center');T(c,'basic',x0+w,y0+68,'#9b8cff',12,'right')},
 assumption:'Typical pH values of the solutions; indicator colour ranges as in the NCERT textbook.'});

// Chapter 2: neutralisation — adding NaOH to HCl
const neut=v=>{const na=.1*25,nb=.1*v,Vt=(25+v)/1000;if(Math.abs(na-nb)<1e-9)return 7;return na>nb?-Math.log10((na-nb)/1000/Vt):14+Math.log10((nb-na)/1000/Vt)};
add({...C2,id:'c10-neutralisation',title:'Neutralisation: acid + base → salt + water',
 description:'Add sodium hydroxide from a burette to 25 mL of hydrochloric acid with phenolphthalein, and follow the pH.',
 formula:'HCl + NaOH → NaCl + H₂O',
 observe:'The pH rises slowly, jumps sharply near 25 mL (neutral point) and the solution turns pink once it is basic.',
 tryText:'Find the exact volume of NaOH at which the pink colour first appears.',
 controls:[R('v','NaOH added',0,50,.1,10,'mL',1)],
 metrics:p=>{const pH=neut(p.v),nb=Math.min(.1*p.v,2.5);return[N('pH of the flask',pH,'',2),N('Solution is',pH<6.9?'Acidic':pH>7.1?'Basic':'Neutral'),N('Salt formed (NaCl)',nb,'mmol',2),N('Phenolphthalein',pH>=8.2?'Pink':'Colourless')]},
 draw:(c,p,t)=>{const pH=neut(p.v),x=150;box(c,x-8,90,16,150,'#e9f6ff22','#c9d3da',3);const fill=(50-p.v)/50;c.save();c.fillStyle='#bfe8ff99';c.fillRect(x-6,92+148*(1-fill),12,148*fill);c.restore();T(c,'NaOH 0.1 M',x+16,104,C.muted,12);
  ln(c,x,240,x,262,'#c9d3da',3);if(cycle(t*2,1)<.5&&p.v<50)dot(c,x,275+18*cycle(t*2,1),3,'#bfe8ff');
  c.save();c.fillStyle=pH>=8.2?mix('#ffffff','#e0217d',clamp((pH-8.2)/2,.3,.9))+'dd':'#e9f6ff33';c.beginPath();c.moveTo(x-18,300);c.lineTo(x-60,370);c.lineTo(x+60,370);c.lineTo(x+18,300);c.closePath();c.fill();c.strokeStyle='#cfe8f5';c.lineWidth=2.5;c.beginPath();c.moveTo(x-14,280);c.lineTo(x-14,300);c.lineTo(x-64,374);c.lineTo(x+64,374);c.lineTo(x+14,300);c.lineTo(x+14,280);c.stroke();c.restore();
  T(c,'25 mL HCl 0.1 M + phenolphthalein',x,396,C.muted,12,'center');
  chart(c,300,120,370,260,{xmin:0,xmax:50,ymin:0,ymax:14,series:[{fn:neut,col:C.mint}],marker:[p.v,pH],title:'pH while adding NaOH',xl:'NaOH added (mL)',yl:'pH'})},
 assumption:'0.1 M HCl (25 mL) titrated with 0.1 M NaOH at 25 °C; strong acid and strong base; volumes add.'});

// Chapter 1: types of chemical reactions
const RX=[
 ['comb1','Combination','CaO + H₂O → Ca(OH)₂','Quicklime reacts vigorously with water; a lot of heat is released.','Exothermic',[['CaO','#e9e2d0'],['H₂O','#7fc8e8']],[['Ca(OH)₂','#f4f1e6']]],
 ['comb2','Combination','2Mg + O₂ → 2MgO','Magnesium ribbon burns with a dazzling white flame, leaving white powder.','Exothermic',[['Mg','#c5ccd3'],['Mg','#c5ccd3'],['O₂','#ff6b6b']],[['MgO','#f8f9fa'],['MgO','#f8f9fa']]],
 ['dec1','Decomposition (thermal)','2FeSO₄ → Fe₂O₃ + SO₂ + SO₃','Green ferrous sulphate crystals turn brown on heating; smell of burning sulphur.','Endothermic',[['FeSO₄','#9bd18b'],['FeSO₄','#9bd18b']],[['Fe₂O₃','#9c4a2a'],['SO₂','#ffd43b'],['SO₃','#fab005']]],
 ['dec2','Decomposition (electrolytic)','2H₂O → 2H₂ + O₂','Electric current splits water; hydrogen volume is twice the oxygen volume.','Endothermic',[['H₂O','#7fc8e8'],['H₂O','#7fc8e8']],[['H₂','#e9f6ff'],['H₂','#e9f6ff'],['O₂','#ff6b6b']]],
 ['dec3','Decomposition (photolytic)','2AgCl → 2Ag + Cl₂','White silver chloride turns grey in sunlight (used in black-and-white photography).','Endothermic',[['AgCl','#f8f9fa'],['AgCl','#f8f9fa']],[['Ag','#868e96'],['Ag','#868e96'],['Cl₂','#c0eb75']]],
 ['disp','Displacement','Fe + CuSO₄ → FeSO₄ + Cu','The iron nail gets a brown coating and the blue solution turns pale green.','Exothermic',[['Fe','#868e96'],['CuSO₄','#4dabf7']],[['FeSO₄','#9bd18b'],['Cu','#d9844a']]],
 ['ddisp','Double displacement (precipitation)','Na₂SO₄ + BaCl₂ → BaSO₄↓ + 2NaCl','A white precipitate of barium sulphate forms at once.','—',[['Na₂SO₄','#e9f6ff'],['BaCl₂','#e9f6ff']],[['BaSO₄↓','#ffffff'],['NaCl','#dee2e6'],['NaCl','#dee2e6']]],
 ['redox','Redox','CuO + H₂ → Cu + H₂O','Black copper oxide turns reddish-brown: CuO is reduced, H₂ is oxidised.','—',[['CuO','#343a40'],['H₂','#e9f6ff']],[['Cu','#d9844a'],['H₂O','#7fc8e8']]]];
add({...C1,id:'c10-reaction-types',title:'Types of chemical reactions',
 description:'Watch reactants change into products for each type of reaction in the chapter, with the balanced equation and what you would observe.',
 formula:'Mass is conserved: atoms are only rearranged',
 observe:'In every balanced equation the number of atoms of each element is the same on both sides.',
 tryText:'Compare a combination reaction with a decomposition reaction: what is the difference?',
 controls:[S('rx','Reaction','comb1',RX.map(r=>[r[0],r[1]+': '+r[2]]))],
 metrics:p=>{const r=RX.find(x=>x[0]===p.rx);return[N('Type',r[1]),N('Balanced equation',r[2]),N('Observation',r[3]),N('Heat',r[4])]},
 draw:(c,p,t)=>{const r=RX.find(x=>x[0]===p.rx),k=clamp((cycle(t*.25,1)-.15)/.6,0,1),e=k<.5?2*k*k:1-(-2*k+2)**2/2;
  T(c,r[2],355,118,C.white,22,'center');T(c,r[1],355,148,C.mint,14,'center');
  const place=(list,x)=>list.map((m,i)=>[x,180+(i+.5)*200/list.length]);const A=place(r[5],150),Bp=place(r[6],560);
  box(c,70,165,160,230,'#ffffff08','#29475b');box(c,480,165,160,230,'#ffffff08','#29475b');T(c,'reactants',150,415,C.muted,12,'center');T(c,'products',560,415,C.muted,12,'center');arrow(c,250,280,460,280,'#3c5a6e',3,12);
  // reactant particles move to the middle, then products move out to the right
  const mid=[355,280];if(e<.5){const q=e*2;r[5].forEach(([n,col],i)=>{const [x,y]=A[i],X=x+(mid[0]-x)*q,Y=y+(mid[1]-y)*q;dot(c,X,Y,26,col,'#0b1c2b',2);T(c,n,X,Y,'#0b1c2b',12,'center','800')})}
  else{const q=(e-.5)*2;r[6].forEach(([n,col],i)=>{const [x,y]=Bp[i],X=mid[0]+(x-mid[0])*q,Y=mid[1]+(y-mid[1])*q;dot(c,X,Y,26,col,'#0b1c2b',2);T(c,n,X,Y,'#0b1c2b',12,'center','800')})}
  if(e>.45&&e<.55)dot(c,mid[0],mid[1],40,'#ffc36b55')},
 assumption:'Each circle stands for one formula unit as written in the balanced equation.'});

// Chapter 3: reactivity series and displacement
const MET=[['K','Potassium',1],['Na','Sodium',1],['Ca','Calcium',2],['Mg','Magnesium',2],['Al','Aluminium',3],['Zn','Zinc',2],['Fe','Iron',2],['Pb','Lead',2],['Cu','Copper',2],['Ag','Silver',1],['Au','Gold',3]];
const RANK=Object.fromEntries(MET.map((m,i)=>[m[0],i]));
const SALT=[['CuSO4','Cu','SO₄',2,'#3d8bfd','Copper sulphate'],['FeSO4','Fe','SO₄',2,'#a9d39e','Iron(II) sulphate'],['ZnSO4','Zn','SO₄',2,'#e9f6ff','Zinc sulphate'],['AgNO3','Ag','NO₃',1,'#e9f6ff','Silver nitrate'],['MgSO4','Mg','SO₄',2,'#e9f6ff','Magnesium sulphate']];
const ION_COL={Cu:'#3d8bfd',Fe:'#a9d39e',Zn:'#e9f6ff',Ag:'#e9f6ff',Mg:'#e9f6ff',Al:'#e9f6ff',Pb:'#e9f6ff',Au:'#f7e98d'};
const DEP={Cu:'#c76b3b',Ag:'#adb5bd',Fe:'#5c636a',Zn:'#8d99a6',Mg:'#ced4da'};
const gcd=(a,b)=>b?gcd(b,a%b):a,lcm=(a,b)=>a*b/gcd(a,b);
function formula(m,v,an,q){const g=gcd(v,q),a=q/g,b=v/g,poly=an.length>2;return m+(a>1?SUB(a):'')+(b>1?(poly?'('+an+')'+SUB(b):an+SUB(b)):an)}
function equation(M,salt){const [mS,,a]=M,[,N1,an,q]=salt,b=MET[RANK[N1]][2],g=gcd(a,b);let x=b/g,y=a/g;const uN=q/gcd(b,q),uM=q/gcd(a,q);let z=1;while(z<12&&!(Number.isInteger(y*z/uN)&&Number.isInteger(x*z/uM)))z++;
  const co=v=>v>1?v:'';return`${co(x*z)}${mS} + ${co(y*z/uN)}${formula(N1,b,an,q)} → ${co(x*z/uM)}${formula(mS,a,an,q)} + ${co(y*z)}${N1}`}
add({...C3,id:'c10-reactivity',title:'Reactivity series: displacement reactions',
 description:'Dip a metal strip into a salt solution. A more reactive metal displaces a less reactive metal from its salt.',
 formula:'K > Na > Ca > Mg > Al > Zn > Fe > Pb > [H] > Cu > Ag > Au',
 observe:'Zinc in copper sulphate gets a brown copper coating and the blue colour fades; copper in silver nitrate turns the solution blue.',
 tryText:'Put copper in iron sulphate. Then iron in copper sulphate. Explain the difference.',
 controls:[S('m','Metal strip','Zn',MET.map(m=>[m[0],m[1]+' ('+m[0]+')'])),S('s','Salt solution','CuSO4',SALT.map(s=>[s[0],s[5]+' ('+s[0].replace(/\d/g,d=>SUB(d))+')']))],
 metrics:p=>{const M=MET[RANK[p.m]],s=SALT.find(x=>x[0]===p.s),water=RANK[p.m]<=2;if(p.m===s[1])return[N('Reaction','None (same metal)')];
  if(water)return[N('Reaction','Reacts with the water itself'),N('Observation',M[1]+' reacts vigorously with water, giving hydrogen gas and a hydroxide; it is too reactive for a simple displacement test.')];
  const yes=RANK[p.m]<RANK[s[1]];return[N('Reaction',yes?'Displacement occurs':'No reaction'),N('Reason',`${M[1]} is ${yes?'more':'less'} reactive than ${MET[RANK[s[1]]][1].toLowerCase()}`),N('Equation',yes?equation(M,s):'—'),N('Observation',yes?`${MET[RANK[s[1]]][1]} is deposited on the strip${s[1]==='Cu'?'; the blue colour fades':''}${p.m==='Cu'?'; the solution turns blue':''}${p.m==='Fe'&&s[1]==='Cu'?' and the solution turns pale green':''}`:'No change')]},
 draw:(c,p,t)=>{const s=SALT.find(x=>x[0]===p.s),water=RANK[p.m]<=2,yes=!water&&p.m!==s[1]&&RANK[p.m]<RANK[s[1]],k=yes?clamp(cycle(t*.12,1)*1.4,0,1):0;
  beaker(c,150,150,170,200,mix(s[4],ION_COL[p.m]||'#e9f6ff',k)+'b0',.66);const mx=225;box(c,mx-13,110,26,200,DEP[p.m]||'#adb5bd',null,4);
  if(yes){c.save();c.globalAlpha=k;c.fillStyle=DEP[s[1]]||'#adb5bd';c.fillRect(mx-15,218,30,92);c.restore();for(let i=0;i<10;i++){const y=226+i*8;dot(c,mx-15+((i*37)%30),y,2.5*k,DEP[s[1]])}}
  if(water){for(let i=0;i<14;i++){const yy=300-cycle(t*1.4+i*.27,1)*90;dot(c,mx-20+((i*17)%40),yy,3,'#e9f6ff99')}}
  T(c,p.m,mx,98,C.white,16,'center');T(c,s[5],235,380,C.muted,12,'center');
  // the series, with the two metals marked
  const x0=420,y0=96;T(c,'REACTIVITY SERIES',x0,y0,C.mint,12);MET.forEach((m,i)=>{const y=y0+22+i*26.5,on=m[0]===p.m,on2=m[0]===s[1];box(c,x0,y-11,150,22,on?'#ffc36b33':on2?'#7baaff33':'#ffffff06',on?C.gold:on2?C.blue:'#29475b',5);T(c,m[1]+' ('+m[0]+')',x0+10,y,on?C.gold:on2?C.blue:C.muted,12);if(i===7)ln(c,x0,y+13,x0+150,y+13,'#ff857e',1.5,[4,3])});
  T(c,'more reactive ↑',x0+160,y0+30,C.muted,11);T(c,'less reactive ↓',x0+160,y0+22+10*26.5,C.muted,11);T(c,'[H]',x0+160,y0+22+7.5*26.5,'#ff857e',11)},
 assumption:'Dilute aqueous salt solutions at room temperature; the most reactive metals (K, Na, Ca) react with the water itself.'});

// Chapter 4: homologous series
const PRE=['meth','eth','prop','but','pent','hex','hept','oct','non','dec'];
const SER={alkane:['Alkanes','CₙH₂ₙ₊₂',1,[-162,-89,-42,-1,36,69,98,126,151,174]],alkene:['Alkenes','CₙH₂ₙ',2,[null,-104,-48,-6,30,63,94,121,146,171]],alkyne:['Alkynes','CₙH₂ₙ₋₂',2,[null,-84,-23,8,40,71,100,126,151,174]],
  alcohol:['Alcohols','CₙH₂ₙ₊₁OH',1,[65,78,97,117,138,157,176,195,214,231]],aldehyde:['Aldehydes','CₙH₂ₙO',1,[-19,20,49,75,103,131,153,171,195,209]],ketone:['Ketones','CₙH₂ₙO',3,[null,null,56,80,102,127,151,173,195,211]],acid:['Carboxylic acids','CₙH₂ₙO₂',1,[101,118,141,164,186,205,223,239,254,269]]};
function mol(sr,n){const H={alkane:2*n+2,alkene:2*n,alkyne:2*n-2,alcohol:2*n+2,aldehyde:2*n,ketone:2*n,acid:2*n}[sr],O={alcohol:1,aldehyde:1,ketone:1,acid:2}[sr]||0;
  const name=sr==='alkane'?PRE[n-1]+'ane':sr==='alkene'?(n>3?PRE[n-1]+'-1-ene':PRE[n-1]+'ene'):sr==='alkyne'?(n>3?PRE[n-1]+'-1-yne':PRE[n-1]+'yne'):sr==='alcohol'?(n>2?PRE[n-1]+'an-1-ol':PRE[n-1]+'anol'):sr==='aldehyde'?PRE[n-1]+'anal':sr==='ketone'?(n>4?PRE[n-1]+'an-2-one':PRE[n-1]+'anone'):PRE[n-1]+'anoic acid';
  return{H,O,name:name[0].toUpperCase()+name.slice(1),formula:'C'+(n>1?SUB(n):'')+'H'+SUB(H)+(O?'O'+(O>1?SUB(O):''):''),M:12*n+H+16*O}}
add({...C4,id:'c10-homologous',title:'Homologous series of carbon compounds',
 description:'Build members of a homologous series one carbon at a time and see the formula, name, molar mass and boiling point change.',
 formula:'Successive members differ by –CH₂– (14 u)',
 observe:'All members share a general formula and the same functional group, so their chemical properties are alike, while the boiling point rises steadily with size.',
 tryText:'Compare ethanol with propanol, and with ethanoic acid. What stays the same and what changes?',
 controls:[S('sr','Series','alkane',Object.entries(SER).map(([k,v])=>[k,v[0]+' ('+v[1]+')'])),R('n','Number of carbon atoms',1,10,1,2,'',0)],
 metrics:p=>{const [,gen,min,bp]=SER[p.sr],n=Math.max(min,Math.round(p.n)),m=mol(p.sr,n);return[N('Name',m.name),N('Molecular formula',m.formula),N('General formula',gen),N('Molar mass',m.M,'u',0),N('Boiling point',bp[n-1],'°C',0)].concat(Math.round(p.n)<min?[N('Note',`This series starts at ${min} carbon atoms`)]:[])},
 draw:(c,p,t)=>{const [name,,min,bp]=SER[p.sr],n=Math.max(min,Math.round(p.n)),m=mol(p.sr,n),sp=Math.min(56,520/(n+1)),x0=360-sp*(n-1)/2,y=200;
  const bond=(x1,x2,k)=>{for(let j=0;j<k;j++){const o=(j-(k-1)/2)*6;ln(c,x1,y+o,x2,y+o,'#c9d3da',2)}};const Hs=(x,ys)=>{for(const yy of ys){ln(c,x,y,x,yy,'#c9d3da',2);dot(c,x,yy,8,'#f1f3f5','#0b1c2b');T(c,'H',x,yy,'#0b1c2b',9,'center','800')}};
  const CX=i=>x0+i*sp;for(let i=0;i<n-1;i++){const k=(p.sr==='alkene'&&i===0)?2:(p.sr==='alkyne'&&i===0)?3:1;bond(CX(i),CX(i+1),k)}
  for(let i=0;i<n;i++){const x=CX(i);let up=true,down=true;
    if((p.sr==='alkene'||p.sr==='alkyne')&&i<=1){if(p.sr==='alkyne'){up=down=false;if(i===0){ln(c,x,y,x-sp*.7,y,'#c9d3da',2);dot(c,x-sp*.7,y,8,'#f1f3f5','#0b1c2b')}}else{down=false;if(i===0){ln(c,x,y,x-sp*.7,y,'#c9d3da',2);dot(c,x-sp*.7,y,8,'#f1f3f5','#0b1c2b')}}}
    const last=i===n-1,first=i===0;
    if(p.sr==='ketone'&&i===1){up=false;down=false;ln(c,x-3,y,x-3,y-44,'#ff6b6b',2);ln(c,x+3,y,x+3,y-44,'#ff6b6b',2);dot(c,x,y-50,10,'#fa5252','#0b1c2b');T(c,'O',x,y-50,'#fff',10,'center','800')}
    if(last&&(p.sr==='alcohol'||p.sr==='aldehyde'||p.sr==='acid')){const ox=x+sp*.75;if(p.sr==='alcohol'){ln(c,x,y,ox,y,'#ff6b6b',2);dot(c,ox,y,10,'#fa5252','#0b1c2b');T(c,'O',ox,y,'#fff',10,'center','800');ln(c,ox,y,ox+sp*.55,y,'#c9d3da',2);dot(c,ox+sp*.55,y,8,'#f1f3f5','#0b1c2b')}
      else{ln(c,x-3,y,x-3,y-44,'#ff6b6b',2);ln(c,x+3,y,x+3,y-44,'#ff6b6b',2);dot(c,x,y-50,10,'#fa5252','#0b1c2b');T(c,'O',x,y-50,'#fff',10,'center','800');up=false;
        if(p.sr==='acid'){ln(c,x,y,ox,y,'#ff6b6b',2);dot(c,ox,y,10,'#fa5252','#0b1c2b');T(c,'O',ox,y,'#fff',10,'center','800');ln(c,ox,y,ox+sp*.55,y,'#c9d3da',2);dot(c,ox+sp*.55,y,8,'#f1f3f5','#0b1c2b')}else{ln(c,x,y,ox,y,'#c9d3da',2);dot(c,ox,y,8,'#f1f3f5','#0b1c2b')}}}
    else if(last&&!(p.sr==='alkyne'&&n<=2)&&!(p.sr==='alkene'&&n<=1)){ln(c,x,y,x+sp*.7,y,'#c9d3da',2);dot(c,x+sp*.7,y,8,'#f1f3f5','#0b1c2b')}
    if(first&&p.sr!=='alkene'&&p.sr!=='alkyne'){ln(c,x,y,x-sp*.7,y,'#c9d3da',2);dot(c,x-sp*.7,y,8,'#f1f3f5','#0b1c2b')}
    if(p.sr==='alkene'&&n===2&&i===1){ln(c,x,y,x+sp*.7,y,'#c9d3da',2);dot(c,x+sp*.7,y,8,'#f1f3f5','#0b1c2b')}
    if(p.sr==='alkyne'&&n===2&&i===1){ln(c,x,y,x+sp*.7,y,'#c9d3da',2);dot(c,x+sp*.7,y,8,'#f1f3f5','#0b1c2b')}
    Hs(x,[...(up?[y-40]:[]),...(down?[y+40]:[])]);dot(c,x,y,11,'#495057','#0b1c2b');T(c,'C',x,y,'#fff',10,'center','800')}
  T(c,m.name+'  ·  '+m.formula,360,110,C.white,20,'center');
  const pts=bp.map((v,i)=>[i+1,v]).filter(q=>q[1]!=null);chart(c,120,290,480,150,{xmin:1,xmax:10,ymin:-200,ymax:300,series:[{pts,col:C.mint}],marker:[n,bp[n-1]],title:'Boiling point (°C) of '+name.toLowerCase(),xl:'carbon atoms'})},
 assumption:'Straight-chain members; the functional group is at carbon 1 (carbon 2 for ketones); boiling points at 1 atm (literature values, rounded).'});

/* ======================= BIOLOGY ======================= */

// Chapter 13: food chain, the 10 per cent law and biological magnification
const LEV=[['Producers (plants, phytoplankton)','#69db7c'],['Primary consumers (zooplankton)','#a9e34b'],['Secondary consumers (small fish)','#ffd43b'],['Top consumers (big fish)','#ff922b']];
add({...B13,id:'c10-food-chain',title:'Food chain: energy flow and biological magnification',
 description:'Follow energy and a non-biodegradable pesticide up a food chain.',
 formula:'Energy passed on ≈ 10% per level;  pesticide concentration × (magnification) per level',
 observe:'Energy shrinks at every step, so food chains are short; a pesticide like DDT is not broken down and builds up, so top consumers carry the most.',
 tryText:'Make the pesticide in the water only 0.02 ppm. How much reaches the top consumer?',
 controls:[R('E','Energy fixed by producers',1000,100000,1000,10000,'J',0),R('ppm','Pesticide in the water',.01,1,.01,.05,'ppm',2),R('mag','Build-up factor per level',2,20,1,10,'×',0)],
 metrics:p=>{const top=p.ppm*p.mag**4;return[N('Energy reaching top consumer',p.E*1e-3,'J',1),N('Pesticide in producers',p.ppm*p.mag,'ppm',2),N('Pesticide in top consumer',top,'ppm',1),N('Rise from water to top',p.mag**4,'×',0)]},
 draw:(c,p,t)=>{const cx=330,base=410,H=70;LEV.forEach(([name,col],i)=>{const w=520-i*95,y=base-(i+1)*H,e=p.E*10**-i,conc=p.ppm*p.mag**(i+1);
   box(c,cx-w/2,y,w,H-6,col+'cc','#0b1c2b',6);T(c,name,cx,y+18,'#0b1c2b',i>2?11:12,'center','800');T(c,`energy ${e>=1?f(e,0):f(e,2)} J`,cx,y+38,'#0b1c2b',12,'center','700');
   const nd=clamp(Math.round(Math.log10(conc/p.ppm*10)*6),2,30);for(let k=0;k<nd;k++){const xx=cx-w/2+10+((k*53+i*17)%Math.max(10,w-20)),yy=y+46+((k*7)%10);dot(c,xx,yy,2.6,'#c92a2a')}
   T(c,f(conc,conc<1?2:1)+' ppm',cx+w/2+10,y+32,'#ff8787',12)});
  arrow(c,96,base-10,96,base-4*H+10,C.gold,3,10);T(c,'energy flow',104,base-4*H+4,C.gold,12);T(c,'water: '+f(p.ppm,2)+' ppm pesticide',cx,base+22,'#ff8787',12,'center');
  const k=cycle(t*.35,1);dot(c,96,base-10-k*(4*H-20),5,C.gold)},
 assumption:'Ten per cent law for energy transfer; a constant build-up factor per level for a non-biodegradable chemical (real values vary by species).'});

done();
})();
