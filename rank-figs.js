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

/* Kinematics: velocity–time graph (area = displacement) and projectile path */
function vt(){const s=svg(340,200,'Velocity against time: a straight line from v0 rising to v. The area under the line is the displacement.');
  line(s,40,170,320,170,INK,1.5);line(s,40,170,40,20,INK,1.5);
  mk(s,'path',{d:'M40 170 L40 140 L300 40 L300 170 Z',fill:HI,'fill-opacity':'.16',stroke:'none'});
  line(s,40,140,300,40,HI,2.6);
  text(s,312,186,'t (s)',12,DIM,'start');text(s,44,14,'v (m/s)',12,DIM,'start');text(s,34,137,'v₀',13,HI,'end',700);text(s,304,30,'v',13,HI,'middle',700);
  text(s,170,110,'area = displacement',12,INK);
  return s}
function proj(){const s=svg(340,190,'Projectile path: a parabola from the ground, with its maximum height H and range R marked.');
  line(s,20,160,330,160,DIM,1.5);
  mk(s,'path',{d:'M30 160 Q180 -80 330 160',fill:'none',stroke:INK,'stroke-width':2.2,'stroke-linecap':'round'});
  line(s,180,160,180,40,DIM,1.2,'5 4');text(s,190,104,'H',14,HI,'start',700);
  arrow(s,30,172,330,172,BLUE);text(s,180,188,'R',14,BLUE,'middle',700);
  text(s,30,152,'launch',12,DIM,'start');
  return s}

/* Laws of Motion: block on an incline with its forces, and the Atwood machine */
const vec=(p,x1,y1,x2,y2,c)=>{line(p,x1,y1,x2,y2,c,2);const a=Math.atan2(y2-y1,x2-x1);mk(p,'polygon',{points:`${x2},${y2} ${x2-10*Math.cos(a-.4)},${y2-10*Math.sin(a-.4)} ${x2-10*Math.cos(a+.4)},${y2-10*Math.sin(a+.4)}`,fill:c})};
function incline(){const s=svg(340,210,'A block on an incline of angle theta. Weight mg acts straight down, the normal force N acts at right angles to the surface, mg sin theta acts down the slope and friction f acts up the slope.');
  const A=[30,190],B=[290,190],C=[290,40],th=Math.atan2(150,260),d=[Math.cos(th),-Math.sin(th)],n=[-Math.sin(th),-Math.cos(th)];
  mk(s,'polygon',{points:`${A} ${B} ${C}`,fill:'#0b1220',stroke:INK,'stroke-width':2});
  const P=[A[0]+.5*(C[0]-A[0]),A[1]+.5*(C[1]-A[1])],o=[P[0]+n[0]*17,P[1]+n[1]*17],q=(a,b)=>[o[0]+d[0]*a+n[0]*b,o[1]+d[1]*a+n[1]*b];
  mk(s,'polygon',{points:[q(-24,-17),q(24,-17),q(24,17),q(-24,17)].join(' '),fill:'#17314f',stroke:BLUE,'stroke-width':1.8});
  const ar=(v,l,c,lab,dx,dy)=>{vec(s,o[0],o[1],o[0]+v[0]*l,o[1]+v[1]*l,c);text(s,o[0]+v[0]*l+dx,o[1]+v[1]*l+dy,lab,13,c,'middle',700)};
  ar([0,1],62,HI,'mg',0,16);ar(n,56,BLUE,'N',-10,-4);ar([-d[0],-d[1]],46,'#7ee0a1','mg sinθ',-8,16);ar(d,40,'#ff8a8a','f',10,-4);
  text(s,A[0]+50,A[1]-6,'θ',14,INK,'middle',700);mk(s,'path',{d:`M${A[0]+36} ${A[1]} A36 36 0 0 0 ${A[0]+36*Math.cos(th)} ${A[1]-36*Math.sin(th)}`,fill:'none',stroke:INK,'stroke-width':1.2});
  text(s,20,16,'N = mg cosθ,  f ≤ μN',13,INK,'start',700);
  return s}
function atwood(){const s=svg(340,210,'Atwood machine: two masses m1 and m2 hang from a light string over a smooth pulley. The heavier mass m1 goes down with acceleration a and the lighter one goes up.');
  line(s,170,6,170,40,DIM,3);mk(s,'circle',{cx:170,cy:50,r:18,fill:'#0b1220',stroke:INK,'stroke-width':2});mk(s,'circle',{cx:170,cy:50,r:3,fill:INK});
  line(s,152,50,152,118,INK,1.8);line(s,188,50,188,86,INK,1.8);
  mk(s,'rect',{x:132,y:118,width:40,height:34,rx:3,fill:'#17314f',stroke:BLUE,'stroke-width':1.8});mk(s,'rect',{x:172,y:86,width:32,height:28,rx:3,fill:'#17314f',stroke:BLUE,'stroke-width':1.8});
  text(s,152,140,'m₁',14,INK,'middle',700);text(s,188,105,'m₂',13,INK,'middle',700);
  vec(s,106,118,106,160,HI);text(s,92,144,'a',13,HI,'end',700);vec(s,234,114,234,76,HI);text(s,246,98,'a',13,HI,'start',700);
  text(s,142,84,'T',13,BLUE,'end',700);text(s,198,70,'T',13,BLUE,'start',700);
  vec(s,152,154,152,192,'#ff8a8a');text(s,164,190,'m₁g',12,'#ff8a8a','start',700);vec(s,188,116,188,146,'#ff8a8a');text(s,200,142,'m₂g',12,'#ff8a8a','start',700);
  text(s,170,206,'m₁ > m₂',12,DIM,'middle');
  return s}

/* Work, Energy and Power: work as the area under an F–x graph, a vertical circle and a head-on collision */
function fx(){const s=svg(340,200,'Force against displacement. The work done is the area under the graph: a triangle for a force that rises steadily, then a rectangle for a constant force. Area below the axis counts as negative work.');
  line(s,40,110,320,110,INK,1.5);line(s,40,190,40,16,INK,1.5);
  mk(s,'path',{d:'M40 110 L130 40 L130 110 Z',fill:HI,'fill-opacity':'.2',stroke:'none'});mk(s,'path',{d:'M130 110 L130 40 L230 40 L230 110 Z',fill:BLUE,'fill-opacity':'.2',stroke:'none'});mk(s,'path',{d:'M230 110 L230 150 L290 150 L290 110 Z',fill:'#ff8a8a','fill-opacity':'.25',stroke:'none'});
  mk(s,'polyline',{points:'40,110 130,40 230,40 230,150 290,150 290,110',fill:'none',stroke:INK,'stroke-width':2.2});
  text(s,314,128,'x',13,DIM,'start');text(s,46,14,'F',13,DIM,'start');
  text(s,100,100,'½F₀x₁',12,HI,'middle',700);text(s,180,82,'F₀(x₂ − x₁)',12,BLUE,'middle',700);text(s,262,138,'negative',12,'#ff8a8a','middle',700);
  text(s,20,176,'W = ∫F dx = area under the graph',13,INK,'start',700);
  return s}
function vloop(){const s=svg(340,246,'A ball on a string moving in a vertical circle of radius r. At the top the tension and weight both point down to the centre; at the bottom the tension points up and the weight down.');
  const cx=170,cy=116,r=72;mk(s,'circle',{cx,cy,r,fill:'none',stroke:DIM,'stroke-width':1.4,'stroke-dasharray':'5 4'});mk(s,'circle',{cx,cy,r:3,fill:INK});
  line(s,cx,cy,cx,cy+r,INK,1.5);line(s,cx,cy,cx,cy-r,INK,1.5);
  for(const [y,t] of [[cy-r,'top'],[cy+r,'bottom']]){mk(s,'circle',{cx,cy:y,r:8,fill:'#17314f',stroke:BLUE,'stroke-width':2})}
  vec(s,cx,cy-r,cx,cy-r+34,BLUE);text(s,cx+16,cy-r+24,'T',13,BLUE,'start',700);vec(s,cx+10,cy-r,cx+10,cy-r+34,'#ff8a8a');text(s,cx+26,cy-r+6,'mg',12,'#ff8a8a','start',700);
  vec(s,cx,cy+r,cx,cy+r-34,BLUE);text(s,cx+16,cy+r-24,'T',13,BLUE,'start',700);vec(s,cx+10,cy+r,cx+10,cy+r+30,'#ff8a8a');text(s,cx+26,cy+r+22,'mg',12,'#ff8a8a','start',700);
  text(s,8,16,'top: T + mg = mv²/r',12,INK,'start',700);text(s,8,32,'v ≥ √(gr)',12,HI,'start',700);
  text(s,332,226,'bottom: T − mg = mv²/r',12,INK,'end',700);text(s,332,242,'v ≥ √(5gr)',12,HI,'end',700);
  return s}
function coll(){const s=svg(340,200,'Head-on collision of two blocks. Before: m1 moves right with speed u1 and m2 moves with u2. After: they move with v1 and v2.');
  const row=(y,lab,a,b,c1,c2)=>{text(s,8,y-34,lab,12,DIM,'start',700);line(s,10,y+20,330,y+20,DIM,1.2);
    mk(s,'rect',{x:60,y:y-20,width:50,height:40,rx:4,fill:'#17314f',stroke:BLUE,'stroke-width':1.8});text(s,85,y+5,'m₁',14,INK,'middle',700);
    mk(s,'rect',{x:210,y:y-14,width:36,height:34,rx:4,fill:'#17314f',stroke:HI,'stroke-width':1.8});text(s,228,y+8,'m₂',13,INK,'middle',700);
    if(a)vec(s,85,y-28,85+a,y-28,BLUE);if(b)vec(s,228,y-28,228+b,y-28,HI);text(s,85+(a>0?a+4:a-4),y-24,c1,13,BLUE,a>0?'start':'end',700);text(s,228+(b>0?b+4:b-4),y-24,c2,13,HI,b>0?'start':'end',700)};
  row(62,'BEFORE',46,-30,'u₁','u₂');row(158,'AFTER',-26,40,'v₁','v₂');
  return s}

/* Rotational Motion: a rolling wheel and a ladder against a wall */
function roll(){const s=svg(340,210,'A wheel rolling without slipping. The centre moves with speed v, the top point moves with 2v and the point touching the ground is momentarily at rest.');
  line(s,16,170,324,170,DIM,1.6);mk(s,'circle',{cx:150,cy:110,r:60,fill:'#0b1220',stroke:INK,'stroke-width':2});mk(s,'circle',{cx:150,cy:110,r:3,fill:INK});
  vec(s,150,110,214,110,BLUE);text(s,222,114,'v',14,BLUE,'start',700);
  vec(s,150,50,276,50,HI);text(s,284,54,'2v',14,HI,'start',700);
  mk(s,'circle',{cx:150,cy:170,r:4,fill:'#ff8a8a'});text(s,164,190,'contact point: v = 0',12,'#ff8a8a','start',700);
  mk(s,'path',{d:'M128 80 A34 34 0 0 1 178 84',fill:'none',stroke:INK,'stroke-width':1.3});text(s,120,76,'ω',14,INK,'end',700);
  text(s,16,22,'v = ωR',14,INK,'start',700);
  return s}
function ladder(){const s=svg(340,210,'A uniform ladder leaning on a smooth wall. Forces: weight W at the middle, normal force N1 and friction f at the floor, normal force N2 from the wall.');
  line(s,60,16,60,184,INK,3);line(s,30,184,320,184,INK,3);
  line(s,60,52,200,184,BLUE,4);
  vec(s,130,118,130,168,HI);text(s,142,160,'W',14,HI,'start',700);
  vec(s,200,184,200,130,'#7ee0a1');text(s,208,138,'N₁',14,'#7ee0a1','start',700);
  vec(s,200,184,146,184,'#ff8a8a');text(s,160,178,'f',14,'#ff8a8a','end',700);
  vec(s,60,52,114,52,BLUE);text(s,122,48,'N₂',14,BLUE,'start',700);
  text(s,228,176,'θ',14,INK,'start',700);mk(s,'path',{d:'M180 184 A20 20 0 0 0 188 168',fill:'none',stroke:INK,'stroke-width':1.2});
  text(s,330,28,'N₁ = W,  f = N₂',13,INK,'end',700);text(s,330,46,'N₂ = (W cotθ) ÷ 2',13,INK,'end',700);
  return s}

/* Gravitation: field inside and outside a shell and a solid sphere, and an elliptical orbit */
function shell(){const s=svg(340,210,'Gravitational field against distance from the centre. For a thin shell the field is zero inside and falls as 1 over r squared outside. For a solid sphere it rises in a straight line inside and falls as 1 over r squared outside.');
  line(s,40,176,326,176,INK,1.5);line(s,40,176,40,18,INK,1.5);
  const X=t=>40+80*t,pts=[];for(let t=1;t<=3.45;t+=.05)pts.push(`${X(t).toFixed(1)},${(176-132/(t*t)).toFixed(1)}`);
  mk(s,'polyline',{points:pts.join(' '),fill:'none',stroke:HI,'stroke-width':2.4});
  line(s,40,176,120,44,BLUE,2.4);line(s,120,44,120,176,DIM,1.2,'4 3');
  mk(s,'polyline',{points:'40,176 120,176 120,44',fill:'none',stroke:'#ff8a8a','stroke-width':2.4,'stroke-dasharray':'7 4'});
  text(s,120,194,'R',13,INK,'middle',700);text(s,330,192,'r',13,DIM,'end');text(s,46,16,'g',13,DIM,'start');
  text(s,176,70,'outside: GM/r²',12,HI,'start',700);text(s,56,36,'solid sphere inside: GMr/R³',12,BLUE,'start',700);text(s,52,168,'shell inside: 0',12,'#ff8a8a','start',700);
  return s}
function orbit(){const s=svg(340,210,'An elliptical orbit with the Sun at one focus. The planet moves fastest at the point nearest the Sun, perihelion, and slowest at the farthest point, aphelion. Equal areas are swept in equal times.');
  const cx=168,cy=104,a=134,b=74,c=Math.sqrt(a*a-b*b);mk(s,'ellipse',{cx,cy,rx:a,ry:b,fill:'none',stroke:INK,'stroke-width':2});
  mk(s,'circle',{cx:cx+c,cy,r:9,fill:HI});text(s,cx+c,cy+26,'Sun',12,HI,'middle',700);
  mk(s,'circle',{cx:cx+a,cy,r:5,fill:BLUE});mk(s,'circle',{cx:cx-a,cy,r:5,fill:BLUE});
  text(s,cx+a-6,cy-28,'perihelion',12,BLUE,'end',700);text(s,cx+a-6,cy-14,'fastest',12,DIM,'end');text(s,cx-a+8,cy-28,'aphelion',12,BLUE,'start',700);text(s,cx-a+8,cy-14,'slowest',12,DIM,'start');
  line(s,cx-a,cy,cx+a,cy,DIM,1,'4 3');text(s,cx-c,cy+18,'2a',12,DIM,'middle');
  text(s,12,16,'T² ∝ a³, r v = constant at the ends',13,INK,'start',700);text(s,12,198,'equal areas in equal times',12,DIM,'start');
  return s}

window.PhysicaRankFigs={acc,vernier,screw,prefix,sphero,vt,proj,incline,atwood,fx,vloop,coll,roll,ladder,shell,orbit};
})();
