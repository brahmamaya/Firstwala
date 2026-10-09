/* Diagrams for Rank mode · Units and Measurements. Plain SVG built with DOM calls (no innerHTML), white on black. */
(() => {
'use strict';
const NS='http://www.w3.org/2000/svg',INK='#e6f1ff',DIM='#7f8ca3',HI='#ffb347',BLUE='#6fa8f5';
const mk=(p,t,a,x)=>{const e=document.createElementNS(NS,t);for(const k in a)e.setAttribute(k,a[k]);if(x!=null)e.textContent=x;p.append(e);return e};
const svg=(w,h,alt)=>{const s=document.createElementNS(NS,'svg');s.setAttribute('viewBox',`0 0 ${w} ${h}`);s.setAttribute('role','img');s.setAttribute('aria-label',alt);s.setAttribute('font-family','system-ui,-apple-system,Segoe UI,Roboto,sans-serif');return s};
const line=(p,x1,y1,x2,y2,c=INK,w=1.5,d)=>mk(p,'line',{x1,y1,x2,y2,stroke:c,'stroke-width':w,...(d?{'stroke-dasharray':d}:{})});
const text=(p,x,y,t,sz=13,c=INK,anc='middle',wt=400)=>mk(p,'text',{x,y,fill:c,'font-size':sz,'text-anchor':anc,'font-weight':wt},t);
const arrow=(p,x1,y1,x2,y2,c=HI)=>{line(p,x1,y1,x2,y2,c,1.5);const a=Math.atan2(y2-y1,x2-x1);for(const [px,py,s] of [[x2,y2,1],[x1,y1,-1]]){const b=a+(s>0?Math.PI:0);mk(p,'polygon',{points:`${px},${py} ${px+9*Math.cos(b+.4)},${py+9*Math.sin(b+.4)} ${px+9*Math.cos(b-.4)},${py+9*Math.sin(b-.4)}`,fill:c})}};

/* accurate vs precise: four targets */
function acc(){const s=svg(340,290,'Four targets. Accurate and precise: tight group on the centre. Precise but not accurate: tight group away from the centre. Accurate but not precise: scattered around the centre. Neither: scattered and away from the centre.');
  const T=[[90,60,'Accurate and precise','tight, on the centre',[[0,0],[5,-4],[-4,5],[4,5],[-5,-3]]],
    [250,60,'Precise only','tight, off the centre',[[22,-20],[27,-23],[19,-16],[25,-14],[21,-24]]],
    [90,190,'Accurate only','spread round the centre',[[26,6],[-22,-22],[-8,28],[24,-26],[-30,10]]],
    [250,190,'Neither','spread, off the centre',[[28,-22],[-6,-30],[30,20],[-12,10],[8,32]]]];
  for(const [cx,cy,a,b,d] of T){for(const r of [46,31,16])mk(s,'circle',{cx,cy,r,fill:'none',stroke:'#4a5876','stroke-width':1.5});mk(s,'circle',{cx,cy,r:3,fill:'#4a5876'});
    for(const [x,y] of d)mk(s,'circle',{cx:cx+x,cy:cy+y,r:4,fill:HI});
    text(s,cx,cy+66,a,13,INK,'middle',700);text(s,cx,cy+82,b,12,DIM)}
  return s}

/* vernier callipers: 24.6 mm */
function vernier(){const s=svg(340,170,'Vernier callipers scale. The main scale reads 24 mm just before the vernier zero. The sixth vernier line meets a main-scale line. Reading 24.6 mm.');
  const X=m=>20+(m-22)*10,v0=X(24.6);
  text(s,20,12,'MAIN SCALE (mm)',11,DIM,'start',700);
  line(s,20,52,320,52,INK,2);
  for(let m=22;m<=52;m++){const x=X(m),big=m%2===0;line(s,x,52,x,big?38:45,INK,1.2);if(big)text(s,x,33,String(m),12)}
  mk(s,'rect',{x:v0,y:56,width:90,height:32,fill:'#0b1220',stroke:BLUE,'stroke-width':1.5,rx:2});
  for(let k=0;k<=10;k++){const x=v0+9*k;line(s,x,56,x,k%5===0?76:70,BLUE,1.2);if(k%2===0)text(s,x,102,String(k),12,BLUE)}
  text(s,v0+45,118,'VERNIER SCALE',11,BLUE,'middle',700);
  line(s,X(30),38,X(30),88,HI,2);
  text(s,v0+98,70,'6th line',12,HI,'start',700);text(s,v0+98,84,'meets here',12,HI,'start',700);
  text(s,20,142,'Main scale: 24 mm (just before the vernier 0)',13,INK,'start');
  text(s,20,162,'6 × 0.1 = 0.6  →  24 + 0.6 = 24.6 mm',13,HI,'start',700);
  return s}

/* screw gauge: 3.35 mm */
function screw(){const s=svg(340,190,'Screw gauge. The pitch scale reads 3 mm. The circular scale shows 35 on the reference line. Reading 3.35 mm.');
  text(s,110,14,'SLEEVE (pitch scale, mm)',11,DIM,'middle',700);
  line(s,20,62,200,62,INK,2);
  for(let i=0;i<=6;i++){line(s,20+30*i,62,20+30*i,48,INK,1.3);text(s,20+30*i,42,String(i),12)}
  for(let i=0;i<6;i++)line(s,35+30*i,62,35+30*i,70,INK,1);
  mk(s,'rect',{x:121,y:56,width:90,height:56,fill:'#0b1220',stroke:BLUE,'stroke-width':1.5,rx:3});
  line(s,121,56,121,112,HI,2.5);
  text(s,166,88,'thimble',12,BLUE);
  text(s,121,128,'edge is just past 3',12,HI,'middle',700);
  text(s,285,14,'CIRCULAR SCALE',11,DIM,'middle',700);
  mk(s,'rect',{x:250,y:26,width:70,height:96,fill:'#0b1220',stroke:BLUE,'stroke-width':1.5,rx:3});
  for(let v=23;v<=47;v++){const y=74-(v-35)*4,l=v%5===0;line(s,l?296:308,y,320,y,BLUE,1.2);if(l)text(s,258,y+4,String(v),12,BLUE,'start')}
  line(s,236,74,320,74,HI,2.5);
  text(s,285,140,'35 is on the line',12,HI,'middle',700);
  text(s,20,164,'PSR = 3 mm   CSR = 35   (LC = 0.01 mm)',13,INK,'start');
  text(s,20,182,'Reading = 3 + 35 × 0.01 = 3.35 mm',13,HI,'start',700);
  return s}

/* SI prefixes */
function prefix(){const s=svg(340,176,'SI prefixes: tera 10 to the 12, giga 10 to the 9, mega 10 to the 6, kilo 10 cubed, milli 10 to the minus 3, micro 10 to the minus 6, nano 10 to the minus 9, pico 10 to the minus 12, femto 10 to the minus 15.');
  const row=(y,lab,items,c)=>{text(s,6,y-6,lab,11,DIM,'start',700);items.forEach(([sym,nm,pw],i)=>{const x=6+i*66.4;mk(s,'rect',{x,y,width:62,height:60,rx:6,fill:'#0b0b0b',stroke:c,'stroke-width':1.3});
    text(s,x+31,y+22,sym,20,c,'middle',700);text(s,x+31,y+38,nm,12,INK);text(s,x+31,y+54,pw,12,DIM)})};
  row(22,'BIGGER THAN 1',[['T','tera','10¹²'],['G','giga','10⁹'],['M','mega','10⁶'],['k','kilo','10³'],['1','unit','10⁰']],BLUE);
  row(102,'SMALLER THAN 1',[['m','milli','10⁻³'],['µ','micro','10⁻⁶'],['n','nano','10⁻⁹'],['p','pico','10⁻¹²'],['f','femto','10⁻¹⁵']],HI);
  return s}

/* spherometer */
function sphero(){const s=svg(340,200,'Spherometer on a curved surface. Two outer legs rest on the surface a distance l apart. The middle leg touches the highest point, a height h above the plane of the outer legs.');
  const cx=150,top=74,R=220,cy=top+R,yl=cy-Math.sqrt(R*R-90*90),arc=[];
  for(let x=10;x<=290;x+=5)arc.push(`${x},${(cy-Math.sqrt(R*R-(x-cx)*(x-cx))).toFixed(1)}`);
  mk(s,'polyline',{points:arc.join(' '),fill:'none',stroke:INK,'stroke-width':2});
  text(s,332,150,'surface',11,DIM,'end');
  mk(s,'rect',{x:60,y:30,width:180,height:8,rx:3,fill:'#0b1220',stroke:BLUE,'stroke-width':1.5});
  line(s,60,38,60,yl,BLUE,2.5);line(s,240,38,240,yl,BLUE,2.5);
  line(s,cx,14,cx,top,HI,2.5);mk(s,'rect',{x:cx-14,y:8,width:28,height:7,rx:2,fill:HI});
  text(s,cx+22,18,'middle leg (screw)',11,HI,'start');
  line(s,cx,top,300,top,DIM,1,'4 3');line(s,240,yl,300,yl,DIM,1,'4 3');
  arrow(s,292,top,292,yl,HI);text(s,305,(top+yl)/2+4,'h',15,HI,'start',700);
  arrow(s,60,yl+22,240,yl+22,BLUE);text(s,150,yl+40,'l = distance between the outer legs',12,BLUE);
  text(s,20,172,'R = l² / 6h + h / 2',15,INK,'start',700);text(s,20,192,'Read h from the screw scale',12,DIM,'start');
  return s}

window.PhysicaRankFigs={acc,vernier,screw,prefix,sphero};
})();
