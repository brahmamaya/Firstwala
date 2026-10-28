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

/* Properties of solids and liquids / Thermodynamics: stress–strain curve, capillary rise, P–V processes and the Carnot cycle */
function ss(){const s=svg(340,210,'Stress against strain for a ductile metal. Straight line up to the proportional limit, elastic limit just after, then the yield point, plastic flow, the ultimate stress and fracture. The slope of the straight part is the Young modulus.');
  line(s,40,176,326,176,INK,1.5);line(s,40,176,40,16,INK,1.5);
  mk(s,'path',{d:'M40 176 L120 56 C140 40 160 38 180 40 C230 44 250 40 262 52 C280 70 290 90 296 112',fill:'none',stroke:HI,'stroke-width':2.4,'stroke-linecap':'round'});
  line(s,40,176,120,56,BLUE,1.4,'4 3');
  for(const [x,y,l,dx,dy,a] of [[120,56,'P',-10,-4,'end'],[132,46,'E',2,-10,'start'],[150,39,'Y',2,-10,'start'],[262,52,'U',4,-8,'start'],[296,112,'F',8,4,'start']]){mk(s,'circle',{cx:x,cy:y,r:3.4,fill:INK});text(s,x+dx,y+dy,l,12,INK,a,700)}
  text(s,326,192,'strain',12,DIM,'end');text(s,46,14,'stress',12,DIM,'start');
  text(s,62,150,'slope = Y',12,BLUE,'start',700);text(s,176,92,'plastic region',12,HI,'start',700);text(s,326,150,'P proportional limit · E elastic limit',10.5,DIM,'end');text(s,326,164,'Y yield · U ultimate · F fracture',10.5,DIM,'end');
  return s}
function capil(){const s=svg(340,200,'Capillary tube in a liquid. Water wets glass, so the angle of contact is acute and the liquid rises by h above the level outside. For mercury the angle is obtuse and the level falls.');
  line(s,20,150,320,150,DIM,1.5);mk(s,'rect',{x:20,y:100,width:300,height:50,fill:'#17314f','fill-opacity':'.55',stroke:'none'});
  mk(s,'rect',{x:150,y:20,width:34,height:150,fill:'none',stroke:INK,'stroke-width':2});mk(s,'rect',{x:152,y:54,width:30,height:96,fill:'#2b5d93','fill-opacity':'.7',stroke:'none'});
  mk(s,'path',{d:'M152 62 Q167 80 182 62',fill:'none',stroke:BLUE,'stroke-width':2.2});
  line(s,230,100,230,54,HI,1.6,'4 3');vec(s,230,100,230,56,HI);vec(s,230,56,230,100,HI);text(s,242,82,'h',15,HI,'start',700);
  line(s,190,54,250,54,DIM,1,'4 3');line(s,190,100,250,100,DIM,1,'4 3');
  text(s,167,190,'h = 2T cosθ / (rρg)',13,INK,'middle',700);text(s,24,128,'liquid outside',12,BLUE,'start',700);text(s,200,28,'θ = angle of contact',12,DIM,'start');
  return s}
function pv(){const s=svg(340,210,'Pressure against volume curves through the same starting point: an isobaric line, an isothermal curve, an adiabatic curve that falls faster, and an isochoric vertical line.');
  line(s,40,184,326,184,INK,1.5);line(s,40,184,40,14,INK,1.5);
  mk(s,'circle',{cx:130,cy:80,r:4.5,fill:INK});text(s,120,70,'A',13,INK,'end',700);
  line(s,130,80,296,80,'#7ee0a1',2.4);text(s,326,70,'isobaric',12,'#7ee0a1','end',700);
  const iso=[],adi=[];for(let v=130;v<=296;v+=4){iso.push(`${v},${(184-(184-80)*130/v).toFixed(1)}`);adi.push(`${v},${(184-(184-80)*Math.pow(130/v,1.67)).toFixed(1)}`)}
  mk(s,'polyline',{points:iso.join(' '),fill:'none',stroke:HI,'stroke-width':2.4});mk(s,'polyline',{points:adi.join(' '),fill:'none',stroke:BLUE,'stroke-width':2.4});
  line(s,130,80,130,184,'#ff8a8a',2.4);text(s,136,150,'isochoric',12,'#ff8a8a','start',700);
  text(s,296,122,'isothermal',12,HI,'end',700);text(s,296,172,'adiabatic (steeper)',12,BLUE,'end',700);
  text(s,326,200,'V',12,DIM,'end');text(s,46,14,'P',12,DIM,'start');
  return s}
function carnot(){const s=svg(340,220,'Carnot cycle on a P–V diagram: isothermal expansion A to B at the hot temperature T1, adiabatic expansion B to C, isothermal compression C to D at the cold temperature T2 and adiabatic compression D to A.');
  line(s,40,198,326,198,INK,1.5);line(s,40,198,40,14,INK,1.5);
  const g=1.67,c1=20,c2=10,VA=1.5,VB=3.5,kB=c1/VB*Math.pow(VB,g),kA=c1/VA*Math.pow(VA,g),VC=Math.pow(kB/c2,1/(g-1)),VD=Math.pow(kA/c2,1/(g-1));
  const X=v=>40+v*24,Y=p=>198-p*13;
  const iso=(c,v0,v1)=>{const o=[];for(let i=0;i<=30;i++){const v=v0+(v1-v0)*i/30;o.push(`${X(v).toFixed(1)},${Y(c/v).toFixed(1)}`)}return o.join(' ')};
  const adi=(k,v0,v1)=>{const o=[];for(let i=0;i<=30;i++){const v=v0+(v1-v0)*i/30;o.push(`${X(v).toFixed(1)},${Y(k/Math.pow(v,g)).toFixed(1)}`)}return o.join(' ')};
  mk(s,'polyline',{points:iso(c1,VA,VB),fill:'none',stroke:'#ff8a8a','stroke-width':2.4});
  mk(s,'polyline',{points:adi(kB,VB,VC),fill:'none',stroke:BLUE,'stroke-width':2.4});
  mk(s,'polyline',{points:iso(c2,VD,VC),fill:'none',stroke:'#7ee0a1','stroke-width':2.4});
  mk(s,'polyline',{points:adi(kA,VA,VD),fill:'none',stroke:BLUE,'stroke-width':2.4});
  for(const [v,p,l,dx,dy] of [[VA,c1/VA,'A',-12,-4],[VB,c1/VB,'B',10,-6],[VC,c2/VC,'C',10,-6],[VD,c2/VD,'D',-12,-6]]){mk(s,'circle',{cx:X(v),cy:Y(p),r:3.6,fill:INK});text(s,X(v)+dx,Y(p)+dy,l,13,INK,'middle',700)}
  text(s,X(3)+34,Y(c1/3)-14,'T₁ (hot)',12,'#ff8a8a','middle',700);text(s,X(6),Y(c2/6)+20,'T₂ (cold)',12,'#7ee0a1','middle',700);
  text(s,326,212,'V',12,DIM,'end');text(s,46,14,'P',12,DIM,'start');text(s,326,40,'η = 1 − T₂/T₁',13,INK,'end',700);text(s,326,58,'W = Q₁ − Q₂',12,DIM,'end');
  return s}

/* Electrostatics: dipole field and torque, E and V against r for spheres, dielectric slab, capacitor networks, charge sharing */
const RED='#ff8a8a',GRN='#7ee0a1';
const chg=(p,x,y,pos)=>{const c=pos?RED:BLUE;mk(p,'circle',{cx:x,cy:y,r:7,fill:'#0b1220',stroke:c,'stroke-width':1.8});text(p,x,y+4,pos?'+':'−',12,c,'middle',700)};
function dipole(){const s=svg(340,262,'Electric dipole. The axial field at a distance r is 2kp over r cubed, along p. The equatorial field is kp over r cubed, opposite to p. In a uniform field E a dipole at angle theta feels a torque p E sin theta and has potential energy minus p E cos theta.');
  chg(s,62,70,0);chg(s,98,70,1);vec(s,56,50,104,50,HI);text(s,80,42,'p',14,HI,'middle',700);
  line(s,108,70,200,70,DIM,1,'4 3');text(s,154,64,'r',12,DIM);mk(s,'circle',{cx:200,cy:70,r:3.5,fill:INK});vec(s,200,70,244,70,GRN);text(s,246,66,'E',13,GRN,'start',700);
  text(s,200,92,'axial: E = 2kp / r³',12,GRN,'middle',700);
  line(s,80,78,80,148,DIM,1,'4 3');text(s,88,114,'r',12,DIM,'start');mk(s,'circle',{cx:80,cy:148,r:3.5,fill:INK});vec(s,80,148,40,148,GRN);text(s,34,144,'E',13,GRN,'end',700);
  text(s,98,152,'equatorial: E = kp / r³',12,GRN,'start',700);text(s,98,168,'(opposite to p)',12,DIM,'start');
  line(s,20,184,320,184,DIM,1);
  for(const y of [206,230,254]){vec(s,16,y,120,y,DIM)}
  text(s,126,256,'E',13,DIM,'start',700);
  const c=[70,230],a=35*Math.PI/180,dx=Math.cos(a),dy=Math.sin(a);
  line(s,c[0]-30*dx,c[1]+30*dy,c[0]+30*dx,c[1]-30*dy,INK,2);chg(s,c[0]-30*dx,c[1]+30*dy,0);chg(s,c[0]+30*dx,c[1]-30*dy,1);
  vec(s,c[0],c[1],c[0]+22*dx,c[1]-22*dy,HI);
  mk(s,'path',{d:`M${c[0]+34} ${c[1]} A34 34 0 0 0 ${c[0]+34*dx} ${c[1]-34*dy}`,fill:'none',stroke:INK,'stroke-width':1.2});text(s,c[0]+46,c[1]-6,'θ',13,INK,'start',700);
  text(s,170,206,'τ = pE sinθ',13,INK,'start',700);text(s,170,226,'U = −pE cosθ',13,INK,'start',700);text(s,170,246,'stable at θ = 0',12,DIM,'start');
  return s}
function gaussE(){const s=svg(340,268,'Electric field against distance r for a uniformly charged insulating sphere of radius R and for a conducting sphere or shell. Inside the insulating sphere the field rises in a straight line; inside the conductor it is zero; outside both fall as one over r squared.');
  const X0=44,XR=120,Y0=176,YT=46;
  line(s,X0,Y0,328,Y0,INK,1.5);line(s,X0,Y0,X0,16,INK,1.5);text(s,328,194,'r',12,DIM,'end');text(s,50,14,'E',12,DIM,'start');
  line(s,XR,Y0,XR,Y0+6,INK,1.5);text(s,XR,Y0+20,'R',13,INK,'middle',700);line(s,XR,YT,XR,Y0,DIM,1,'4 3');
  const out=[];for(let x=XR;x<=322;x+=4)out.push(`${x},${(Y0-(Y0-YT)*Math.pow((XR-X0)/(x-X0),2)).toFixed(1)}`);
  mk(s,'polyline',{points:out.join(' '),fill:'none',stroke:BLUE,'stroke-width':2.4});
  line(s,X0,Y0,XR,YT,HI,2.4);
  line(s,X0,Y0-2,XR,Y0-2,GRN,2.4);line(s,XR,Y0-2,XR,YT,GRN,2.4,'3 3');
  text(s,XR+8,YT-6,'E = kQ / R²',12,INK,'start',700);
  text(s,322,100,'outside: E = kQ / r²',12,BLUE,'end',700);
  text(s,20,214,'insulating solid sphere: E = kQr / R³ inside',12,HI,'start',700);
  text(s,20,232,'conductor or shell: E = 0 inside',12,GRN,'start',700);
  text(s,20,256,'Both give kQ/r² outside; the field is largest at r = R.',12,DIM,'start');
  return s}
function shellV(){const s=svg(340,268,'Potential against distance r. For a conducting sphere or shell the potential is constant kQ over R inside and kQ over r outside. For a uniformly charged insulating sphere the potential at the centre is 1.5 times the surface value.');
  const X0=62,XR=140,Y0=176,H=100;
  line(s,X0,Y0,328,Y0,INK,1.5);line(s,X0,Y0,X0,14,INK,1.5);text(s,328,194,'r',12,DIM,'end');text(s,50,14,'V',12,DIM,'start');
  line(s,XR,Y0,XR,Y0+6,INK,1.5);text(s,XR,Y0+20,'R',13,INK,'middle',700);
  const out=[];for(let x=XR;x<=322;x+=4)out.push(`${x},${(Y0-H*(XR-X0)/(x-X0)).toFixed(1)}`);
  mk(s,'polyline',{points:out.join(' '),fill:'none',stroke:BLUE,'stroke-width':2.4});
  line(s,X0,Y0-H,XR,Y0-H,GRN,2.4);
  const par=[];for(let x=X0;x<=XR;x+=3){const r=(x-X0)/(XR-X0);par.push(`${x},${(Y0-H*(3-r*r)/2).toFixed(1)}`)}
  mk(s,'polyline',{points:par.join(' '),fill:'none',stroke:HI,'stroke-width':2.4});
  line(s,X0,Y0-H,X0-4,Y0-H,INK,1.2);text(s,X0-6,Y0-H+4,'kQ/R',11,DIM,'end');text(s,X0-6,Y0-1.5*H+4,'3kQ/2R',11,DIM,'end');
  text(s,322,100,'outside: V = kQ / r',12,BLUE,'end',700);
  text(s,20,214,'insulating sphere: V = kQ(3R² − r²) / 2R³',12,HI,'start',700);
  text(s,20,232,'conductor or shell: V = kQ / R inside',12,GRN,'start',700);
  text(s,20,256,'E = −dV/dr: the flat part of V is the zero-field part.',12,DIM,'start');
  return s}
function capDiel(){const s=svg(340,232,'Parallel plate capacitor of plate area A and separation d with a dielectric slab of thickness t and constant K between the plates. The capacitance is epsilon zero A over d minus t plus t over K. For a conducting slab K tends to infinity.');
  mk(s,'rect',{x:50,y:34,width:200,height:7,fill:RED,'fill-opacity':'.55',stroke:RED});mk(s,'rect',{x:50,y:158,width:200,height:7,fill:BLUE,'fill-opacity':'.55',stroke:BLUE});
  text(s,44,42,'+Q',13,RED,'end',700);text(s,44,166,'−Q',13,BLUE,'end',700);
  mk(s,'rect',{x:50,y:84,width:200,height:50,fill:'#2b5d93','fill-opacity':'.5',stroke:BLUE,'stroke-width':1.4});
  for(const x of [90,150,210]){vec(s,x,50,x,80,GRN)}
  text(s,262,70,'E₀ (air)',12,GRN,'start',700);
  text(s,150,114,'dielectric K:  E = E₀ / K',12,INK,'middle',700);
  line(s,258,41,258,158,DIM,1);vec(s,258,41,258,158,DIM);text(s,268,104,'d',14,HI,'start',700);
  line(s,254,84,300,84,DIM,1,'4 3');line(s,254,134,300,134,DIM,1,'4 3');vec(s,296,84,296,134,HI);vec(s,296,134,296,84,HI);text(s,308,114,'t',14,HI,'start',700);
  text(s,20,192,'C = ε₀A / (d − t + t/K)',14,INK,'start',700);
  text(s,20,212,'conducting slab (K → ∞): C = ε₀A / (d − t)',12,DIM,'start');
  text(s,20,228,'full gap: C = Kε₀A / d',12,DIM,'start');
  return s}
const cap=(p,x,y,lab)=>{line(p,x-18,y,x-3,y,INK,2);line(p,x+3,y,x+18,y,INK,2);line(p,x-3,y-12,x-3,y+12,INK,2.4);line(p,x+3,y-12,x+3,y+12,INK,2.4);text(p,x,y-18,lab,13,HI,'middle',700)};
function capNet(){const s=svg(340,236,'Two capacitors C1 and C2 in series, which share the same charge and have 1 over C equal to 1 over C1 plus 1 over C2, and in parallel, which share the same potential difference and have C equal to C1 plus C2.');
  text(s,20,14,'SERIES',11,DIM,'start',700);
  line(s,24,44,52,44,INK,1.6);cap(s,70,44,'C₁');line(s,88,44,112,44,INK,1.6);cap(s,130,44,'C₂');line(s,148,44,190,44,INK,1.6);
  mk(s,'circle',{cx:24,cy:44,r:3,fill:INK});mk(s,'circle',{cx:190,cy:44,r:3,fill:INK});
  text(s,20,82,'1/C = 1/C₁ + 1/C₂   (same Q)',13,INK,'start',700);text(s,20,100,'V₁ : V₂ = C₂ : C₁   (smaller C, bigger V)',12,DIM,'start');
  line(s,20,114,320,114,DIM,1);
  text(s,20,132,'PARALLEL',11,DIM,'start',700);
  line(s,40,146,40,196,INK,1.6);line(s,190,146,190,196,INK,1.6);
  line(s,40,146,97,146,INK,1.6);cap(s,115,146,'C₁');line(s,133,146,190,146,INK,1.6);
  line(s,40,196,97,196,INK,1.6);cap(s,115,196,'C₂');line(s,133,196,190,196,INK,1.6);
  mk(s,'circle',{cx:40,cy:171,r:3,fill:INK});mk(s,'circle',{cx:190,cy:171,r:3,fill:INK});line(s,20,171,40,171,INK,1.6);line(s,190,171,210,171,INK,1.6);
  text(s,222,167,'C = C₁ + C₂',13,INK,'start',700);text(s,222,185,'(same V)',12,DIM,'start');
  text(s,20,230,'Q₁ : Q₂ = C₁ : C₂ in parallel',12,DIM,'start');
  return s}
function share(){const s=svg(340,252,'Two conducting spheres of radii R1 and R2 joined by a thin wire. They reach the same potential, the charges divide in the ratio R1 to R2 and the surface charge densities are in the inverse ratio.');
  mk(s,'circle',{cx:58,cy:80,r:36,fill:'#17314f',stroke:BLUE,'stroke-width':2});mk(s,'circle',{cx:238,cy:80,r:58,fill:'#17314f',stroke:BLUE,'stroke-width':2});
  line(s,94,80,180,80,INK,1.6,'5 3');text(s,137,70,'thin wire',11,DIM);
  line(s,58,80,86,52,DIM,1);text(s,56,86,'Q₁',14,HI,'middle',700);text(s,78,50,'R₁',12,DIM,'start');
  line(s,238,80,284,48,DIM,1);text(s,236,86,'Q₂',14,HI,'middle',700);text(s,280,46,'R₂',12,DIM,'start');
  text(s,20,164,'after joining: V₁ = V₂',13,INK,'start',700);
  text(s,20,184,'V = k(Q₁ + Q₂) / (R₁ + R₂)',13,GRN,'start',700);
  text(s,20,204,'q₁ : q₂ = R₁ : R₂',13,INK,'start',700);text(s,20,224,'σ₁ : σ₂ = R₂ : R₁   (smaller sphere, larger σ)',13,INK,'start',700);
  text(s,20,244,'spheres far apart; some energy is lost as heat',12,DIM,'start');
  return s}

/* ---- Hand-drawn notes style: thin strokes, handwriting labels, paper-like card. Electrostatics set. ---- */
const hs=(w,h,alt)=>{const s=svg(w,h,alt);s.classList.add('rk-hand');return fin(s)};
const ht=(p,x,y,t,c=INK,anc='middle',sz=15)=>text(p,x,y,t,sz,c,anc,400);
const hl=(p,x1,y1,x2,y2,c=INK,d)=>line(p,x1,y1,x2,y2,c,1.3,d);
const dsh=(p,x1,y1,x2,y2)=>hl(p,x1,y1,x2,y2,DIM,'4 3');
const hv=(p,x1,y1,x2,y2,c=HI,w=2)=>{line(p,x1,y1,x2,y2,c,w);const a=Math.atan2(y2-y1,x2-x1);mk(p,'polygon',{points:`${x2},${y2} ${x2-9*Math.cos(a-.4)},${y2-9*Math.sin(a-.4)} ${x2-9*Math.cos(a+.4)},${y2-9*Math.sin(a+.4)}`,fill:c})};
const dot=(p,x,y,c=INK,r=3)=>mk(p,'circle',{cx:x,cy:y,r,fill:c});
const pt=(cx,cy,r,a)=>[cx+r*Math.sin(a*Math.PI/180),cy-r*Math.cos(a*Math.PI/180)];
const arcp=(p,cx,cy,r,a1,a2,c=INK,w=1.3)=>{const [x1,y1]=pt(cx,cy,r,a1),[x2,y2]=pt(cx,cy,r,a2);return mk(p,'path',{d:`M${x1} ${y1}A${r} ${r} 0 ${Math.abs(a2-a1)>180?1:0} ${a2>a1?1:0} ${x2} ${y2}`,fill:'none',stroke:c,'stroke-width':w})};
const pls=(p,x,y,s='+')=>text(p,x,y,s,14,s==='+'?RED:BLUE,'middle',700);
const dim=(p,x1,y1,x2,y2,t,tx,ty)=>{hv(p,(x1+x2)/2,(y1+y2)/2,x2,y2,DIM,1.1);hv(p,(x1+x2)/2,(y1+y2)/2,x1,y1,DIM,1.1);ht(p,tx,ty,t,DIM)};
const fin=s=>{s.setAttribute('viewBox',s.getAttribute('viewBox').replace(/\S+$/,Math.ceil((s._m||0)+8)));return s};
const cp=(p,y,t,c=INK)=>{const w=+p.getAttribute('viewBox').split(' ')[2],n=Math.floor((w-20)/7),L=[];for(const seg of t.split('|')){let l='';for(const x of seg.split(' ')){if(l&&(l+' '+x).length>n){L.push(l);l=x}else l=l?l+' '+x:x}L.push(l)}if(p._m!=null)y=p._m+18;L.forEach((x,k)=>ht(p,12,y+16*k,x,c,'start',13.5));p._m=y+16*(L.length-1)};
const ELL={fill:'#17314f',stroke:BLUE,'stroke-width':2};
/* ring on its axis: E = kQx/(R²+x²)^(3/2) */
function ringAxis(){const s=hs(260,224,'Ring of charge Q and radius R with its axis. A point P on the axis at distance x from the centre is at distance the square root of R squared plus x squared from every element of the ring. The field is along the axis, away from the ring.');
  mk(s,'ellipse',{cx:70,cy:92,rx:16,ry:52,fill:'none',stroke:BLUE,'stroke-width':2.4});
  for(const t of [0.6,1.7,2.6,3.7,4.6,5.6])pls(s,70+27*Math.cos(t),96+52*Math.sin(t));
  dsh(s,14,92,200,92);dot(s,70,92);dot(s,190,92);ht(s,190,112,'P');ht(s,60,106,'O',DIM);
  dsh(s,70,92,70,40);ht(s,92,68,'R',INK,'start');
  hl(s,70,40,190,92);ht(s,164,56,'√(R²+x²)',INK,'middle',13);
  hv(s,190,92,246,92);ht(s,230,82,'E');hv(s,190,92,226,107.5,DIM,1.2);ht(s,238,114,'dE',DIM);
  arcp(s,190,92,34,270,293.4);ht(s,146,88,'θ');
  dsh(s,70,146,70,172);dsh(s,190,96,190,172);dim(s,70,168,190,168,'x',130,160);
  cp(s,196,'E = kQx / (R²+x²)^(3/2)|cosθ = x / √(R²+x²)');cp(s,230,'E = 0 at the centre; max at x = R/√2',DIM);return fin(s)}
/* disc: cone angle */
function discAxis(){const s=hs(260,224,'Disc of radius R and surface charge density sigma, with a point P on its axis at distance x. The lines from P to the rim make the cone half angle alpha with the axis. The field is along the axis.');
  mk(s,'ellipse',{cx:70,cy:92,rx:14,ry:52,...ELL});
  for(const y of [66,92,118])pls(s,70,y+4);
  dsh(s,14,92,200,92);dot(s,190,92);ht(s,190,112,'P');
  hl(s,70,40,190,92);hl(s,70,144,190,92);dsh(s,70,92,70,40);ht(s,58,70,'R',INK,'end');
  arcp(s,190,92,42,247,293.4);ht(s,138,94,'α',INK,'middle',17);
  hv(s,190,92,246,92);ht(s,230,82,'E');
  dsh(s,70,148,70,172);dsh(s,190,96,190,172);dim(s,70,168,190,168,'x',130,160);
  cp(s,196,'E = (σ/2ε₀)(1 − cosα)|cosα = x / √(x²+R²)');cp(s,230,'V = (σ/2ε₀)(√(x²+R²) − x)|x ≪ R (α → 90°): E → σ/2ε₀',DIM);return fin(s)}
/* arc of angle 2α: field at the centre */
function arcCentre(){const s=hs(240,214,'Charged arc of radius R that subtends an angle 2 alpha at its centre O. The field at O points away from the arc along the line of symmetry, with magnitude 2 k lambda sine alpha over R.');
  arcp(s,120,110,70,-50,50,BLUE,3.2);
  for(const a of [-36,-18,0,18,36]){const [x,y]=pt(120,110,82,a);pls(s,x,y+5)}
  const [ax,ay]=pt(120,110,70,-50),[bx,by]=pt(120,110,70,50);hl(s,120,110,ax,ay,INK,'4 3');hl(s,120,110,bx,by,INK,'4 3');dsh(s,120,110,120,30);
  arcp(s,120,110,30,0,50);ht(s,138,84,'α',INK,'middle',16);arcp(s,120,110,40,-50,0,DIM);ht(s,102,78,'α',DIM,'middle',16);
  ht(s,162,104,'R');dot(s,120,110);ht(s,108,126,'O',DIM);
  hv(s,120,112,120,162);ht(s,132,156,'E');
  cp(s,186,'E = 2kλ sinα / R = kQ sinα / (αR²)');cp(s,204,'semicircle (α = 90°): E = 2kλ/R',DIM);return fin(s)}
/* uniformly charged hemispherical shell */
function hemi(){const s=hs(240,214,'Hollow hemispherical shell of radius R and surface charge density sigma, seen from the side. At the centre O of its flat face the field is sigma over 4 epsilon naught, along the axis, away from the shell.');
  arcp(s,120,104,70,-90,90,BLUE,3);
  for(const a of [-72,-48,-24,0,24,48,72]){const [x,y]=pt(120,104,82,a);pls(s,x,y+5)}
  hl(s,50,104,190,104,INK,'4 3');dsh(s,120,26,120,104);dot(s,120,104);ht(s,106,122,'O',DIM);
  hl(s,120,104,190,104,INK);ht(s,156,98,'R');
  hv(s,120,106,120,162);ht(s,134,156,'E');
  cp(s,186,'E (at O) = σ / 4ε₀, along the axis');cp(s,204,'V (at O) = kQ/R = σR / 2ε₀',DIM);return fin(s)}
/* infinite sheet */
function sheet(){const s=hs(240,176,'Infinite sheet of positive charge seen edge on, with equal arrows away from it on both sides, near and far. The field is sigma over 2 epsilon naught at every distance.');
  line(s,120,12,120,128,BLUE,3);for(const y of [28,56,84,112])pls(s,111,y+5);
  for(const [a,b,y] of [[130,170,40],[110,70,40],[190,230,96],[50,10,96]])hv(s,a,y,b,y);
  ht(s,150,30,'near',DIM,'middle',13);ht(s,210,86,'far',DIM,'middle',13);ht(s,100,20,'σ',BLUE,'middle',15);
  cp(s,150,'E = σ / 2ε₀ on each side, same at any distance');cp(s,168,'(field lines leave +σ; they enter −σ)',DIM);return fin(s)}
function plates(){const s=hs(240,176,'Two large parallel sheets, plus sigma on the left and minus sigma on the right. Between them the field is sigma over epsilon naught from the positive to the negative sheet; outside the field is zero.');
  line(s,80,14,80,114,RED,3);line(s,160,14,160,114,BLUE,3);
  for(const y of [30,60,90])pls(s,70,y+5);for(const y of [30,60,90])pls(s,170,y+5,'−');
  for(const y of [36,64,92])hv(s,90,y,150,y);ht(s,120,28,'E',HI,'middle',16);ht(s,36,70,'E = 0',INK,'middle',14);ht(s,206,70,'E = 0',INK,'middle',14);
  dim(s,80,128,160,128,'d',120,124);
  cp(s,150,'E = σ/ε₀ between the sheets, 0 outside');cp(s,168,'V = Ed',DIM);return fin(s)}
/* solid (insulating) sphere */
function solidSph(){const s=hs(260,226,'Uniformly charged solid sphere of radius R. Point A is inside at distance r from the centre where the field is k Q r over R cubed. Point B is outside at distance r where the field is k Q over r squared.');
  mk(s,'circle',{cx:95,cy:92,r:60,...ELL});
  for(const [x,y] of [[66,66],[118,116],[130,100],[60,96],[88,128],[76,84],[104,50]])pls(s,x,y+5);
  dot(s,95,92);ht(s,86,106,'O',DIM,'end',13);
  const [ax,ay]=pt(95,92,30,60),[bx,by]=pt(95,92,98,120);
  hl(s,95,92,ax,ay,INK,'4 3');hv(s,ax,ay,ax+24,ay-14,HI,1.8);dot(s,ax,ay);ht(s,ax-2,ay-8,'A',INK,'end');
  dsh(s,95,92,bx,by);hv(s,bx,by,bx+22,by+13,HI,1.8);dot(s,bx,by);ht(s,bx+4,by-8,'B');
  const [rx,ry]=pt(95,92,60,225);hl(s,95,92,rx,ry);ht(s,60,112,'R',INK,'end');
  cp(s,184,'A (r < R):  E = kQr/R³ = ρr/3ε₀');cp(s,202,'B (r ≥ R):  E = kQ/r²');cp(s,220,'V: centre 3kQ/2R, surface kQ/R',DIM);return fin(s)}
/* hollow cylinder, end view */
function cylHollow(){const s=hs(240,214,'End view of a long hollow charged cylinder of radius R. Inside, the field is zero. Outside, at distance r from the axis, the field points radially away with magnitude lambda over 2 pi epsilon naught r.');
  mk(s,'circle',{cx:120,cy:100,r:38,fill:'none',stroke:BLUE,'stroke-width':2.6});
  for(let a=0;a<360;a+=30){const [x,y]=pt(120,100,48,a);pls(s,x,y+5)}
  for(let a=0;a<360;a+=45){const [x1,y1]=pt(120,100,60,a),[x2,y2]=pt(120,100,78,a);hv(s,x1,y1,x2,y2,HI,1.6)}
  mk(s,'circle',{cx:120,cy:100,r:88,fill:'none',stroke:DIM,'stroke-width':1.1,'stroke-dasharray':'4 3'});
  ht(s,120,86,'E = 0');const [rx,ry]=pt(120,100,38,135),[qx,qy]=pt(120,100,96,2100);
  hl(s,120,100,rx,ry);ht(s,147,136,'R');dsh(s,120,100,qx,qy);ht(s,64,76,'r',INK,'end');
  cp(s,204,'r < R: E = 0|r ≥ R: E = λ / 2πε₀r|dashed circle = Gaussian cylinder, radius r');return fin(s)}
/* Coulomb */
function coul(){const s=hs(260,176,'Two point charges a distance r apart. Like charges repel, so each force points away from the other. Unlike charges attract, so each force points towards the other. The two forces are equal and opposite.');
  const row=(y,a,b,sg)=>{for(const [x,pp] of [[90,a],[170,b]]){mk(s,'circle',{cx:x,cy:y,r:9,fill:'#17314f',stroke:pp==='+'?RED:BLUE,'stroke-width':1.6});pls(s,x,y+5,pp)}
    if(sg){hv(s,79,y,44,y);hv(s,181,y,216,y)}else{hv(s,100,y,124,y);hv(s,160,y,136,y)}
    ht(s,sg?36:112,sg?y+5:y-10,'F',HI,sg?'end':'middle',16);ht(s,sg?224:148,sg?y+5:y-10,'F',HI,sg?'start':'middle',16)};
  row(34,'+','+',1);row(104,'+','−',0);dim(s,90,54,170,54,'r',130,70);ht(s,130,18,'like: repel',DIM,'middle',13);ht(s,130,132,'unlike: attract',DIM,'middle',13);
  cp(s,158,'F = kq₁q₂ / r²|k = 9 × 10⁹ N m²/C²');cp(s,192,'equal and opposite (third law); divide by K in a medium',DIM);return fin(s)}
/* charged balls on strings */
function balls(){const s=hs(250,216,'Two identical charged balls hang from one point on strings of length L. Each string makes an angle theta with the vertical. On the right ball the weight mg acts down, the tension T acts along the string and the Coulomb force F acts horizontally outwards. The balls are a distance x apart.');
  const L=122,sn=Math.sin(.35),cs=Math.cos(.35),X=125,Y=18,bx=X+L*sn,by=Y+L*cs;
  line(s,X-30,Y,X+30,Y,INK,2.4);dsh(s,X,Y,X,by+10);
  for(const k of [-1,1]){hl(s,X,Y,X+k*L*sn,by);mk(s,'circle',{cx:X+k*L*sn,cy:by,r:9,fill:'#17314f',stroke:BLUE,'stroke-width':1.8});pls(s,X+k*L*sn,by+5)}
  arcp(s,X,Y,44,0,20);ht(s,X+11,Y+68,'θ');
  hv(s,bx,by+10,bx,by+44);ht(s,bx+6,by+50,'mg',HI,'start',14);hv(s,bx+10,by,bx+48,by);ht(s,bx+40,by-8,'F',HI,'middle',15);
  hv(s,bx,by-10,bx-sn*40,by-10-cs*40,DIM,1.8);ht(s,bx-2,by-44,'T',DIM,'start',15);
  ht(s,X+L*sn/2+14,Y+L*cs/2-34,'L',INK,'start',14);
  dim(s,X-L*sn,by+26,bx,by+26,'x',X,by+44);
  cp(s,196,'tanθ = F/mg, F = kq²/x²|x = 2L sinθ');cp(s,230,'T cosθ = mg, T sinθ = F',DIM);return fin(s)}
/* two equal charges: field on the bisector */
function bis(){const s=hs(240,216,'Two equal positive charges q at distance a on either side of the midpoint O. A point P on the perpendicular bisector at height y has the two fields along the lines away from each charge. Their sideways parts cancel and the resultant field points along y, away from O.');
  for(const x of [60,180]){mk(s,'circle',{cx:x,cy:168,r:9,fill:'#17314f',stroke:RED,'stroke-width':1.6});pls(s,x,173)}
  dot(s,120,168,DIM);ht(s,128,186,'O',DIM,'start',13);dsh(s,120,168,120,84);dot(s,120,84);ht(s,132,90,'P',INK,'start',14);ht(s,110,130,'y',INK,'end');
  hl(s,66,160,120,84,INK,'4 3');hl(s,174,160,120,84,INK,'4 3');
  hv(s,120,84,141,55,DIM,1.5);hv(s,120,84,99,55,DIM,1.5);ht(s,150,52,'E₁',DIM,'start',13);ht(s,92,50,'E₂',DIM,'end',13);
  hv(s,120,84,120,26,HI,2.2);ht(s,132,36,'E',HI,'start',16);
  dim(s,60,198,120,198,'a',90,214);dim(s,120,198,180,198,'a',150,214);dsh(s,60,178,60,198);dsh(s,180,178,180,198);
  cp(s,236,'E = 2kqy / (a²+y²)^(3/2)|along y;  max at y = a/√2');return fin(s)}
/* charged particle between plates */
function defl(){const s=hs(260,180,'An electron enters the space between two charged plates with speed v0, parallel to them. The field E points down, so the force on the electron is up and it follows a parabola, deflecting by y over plate length l.');
  line(s,30,26,200,26,RED,3);line(s,30,124,200,124,BLUE,3);ht(s,16,32,'+',RED,'middle',16);ht(s,16,130,'−',BLUE,'middle',16);
  mk(s,'path',{d:'M30 78Q115 78 200 40',fill:'none',stroke:INK,'stroke-width':1.6});
  mk(s,'circle',{cx:30,cy:78,r:6,fill:'#17314f',stroke:BLUE,'stroke-width':1.5});hv(s,6,78,24,78,DIM,1.6);ht(s,12,68,'v₀',DIM,'middle',14);
  hv(s,70,40,70,70,HI,2);ht(s,82,60,'E',HI,'start',16);
  dsh(s,200,78,236,78);dim(s,230,78,230,40,'y',246,62);dim(s,30,138,200,138,'l',115,154);
  cp(s,174,'a = qE/m (up, as q is negative)|y = ½ (qE/m)(l/v₀)²');return fin(s)}
/* flux */
function flux(){const s=hs(240,188,'A plane of area A in a uniform field E. The normal n to the plane makes an angle theta with the field. The flux through the plane is E A cos theta.');
  for(const x of [50,190])hv(s,x,162,x,24,DIM,1.2);
  line(s,76,138,174,72,BLUE,3);ht(s,170,98,'A',BLUE,'start',16);
  hv(s,125,105,125,24,HI,2);ht(s,134,34,'E',HI,'start',16);
  hv(s,125,105,88,50,INK,1.8);ht(s,76,48,'n̂',INK,'end',16);arcp(s,125,105,40,-33.7,0);ht(s,112,70,'θ');
  cp(s,184,'Φ = EA cosθ  (θ between E and the normal)');return fin(s)}
/* parallel plate capacitor */
function ppc(){const s=hs(250,196,'Parallel plate capacitor: two plates of area A a distance d apart, plus Q on the top plate and minus Q on the bottom plate. The field between them is uniform and points from the positive to the negative plate.');
  line(s,50,36,190,36,RED,3);line(s,50,108,190,108,BLUE,3);
  for(const x of [66,98,130,162])pls(s,x,28);for(const x of [66,98,130,162])pls(s,x,128,'−');
  ht(s,214,34,'+Q',RED,'start',14);ht(s,214,112,'−Q',BLUE,'start',14);
  for(const x of [76,120,164])hv(s,x,46,x,98);ht(s,132,76,'E',HI,'start',16);
  dim(s,22,36,22,108,'d',12,76);ht(s,120,150,'area A of each plate',DIM,'middle',13);
  cp(s,172,'C = ε₀A / d,  Q = CV|E = σ/ε₀ = V/d');cp(s,190,'valid when d is much smaller than the plate size',DIM);return fin(s)}
/* spherical capacitor */
function sphcap(){const s=hs(250,210,'Spherical capacitor: an inner sphere of radius a with charge plus Q inside a concentric shell of radius b that is earthed. The field in the gap points radially outwards.');
  mk(s,'circle',{cx:105,cy:92,r:74,fill:'none',stroke:BLUE,'stroke-width':2.2});mk(s,'circle',{cx:105,cy:92,r:28,...ELL});
  ht(s,105,97,'+Q',RED,'middle',13);
  for(const a of [0,60,180,300]){const [x1,y1]=pt(105,92,36,a),[x2,y2]=pt(105,92,64,a);hv(s,x1,y1,x2,y2,HI,1.5)}
  const [ax,ay]=pt(105,92,28,235),[bx,by]=pt(105,92,74,125);hl(s,...pt(105,92,14,235),ax,ay);ht(s,72,98,'a',INK,'end');hl(s,...pt(105,92,28,125),bx,by);ht(s,140,140,'b');
  ht(s,198,36,'earthed',DIM,'start',13);ht(s,198,52,'shell',DIM,'start',13);
  cp(s,184,'C = 4πε₀ab / (b − a)|b → ∞: C = 4πε₀a');cp(s,202,'V between = kQ(1/a − 1/b)',DIM);return fin(s)}
/* RC charging and discharging */
function rcg(){const s=hs(260,200,'Charge against time for a capacitor in an RC circuit. Charging rises to Q0 equals C V, reaching 63 percent at t equals tau equals R C. Discharging falls from Q0, reaching 37 percent at t equals tau.');
  line(s,40,150,240,150,INK,1.4);line(s,40,150,40,16,INK,1.4);ht(s,244,154,'t',INK,'start',15);ht(s,34,16,'q',INK,'end',15);
  dsh(s,40,30,236,30);ht(s,36,34,'CV',INK,'end',13);
  let a='M40 150',b='M40 30';for(let x=4;x<=196;x+=4){const e=Math.exp(-x/40);a+=`L${40+x} ${150-120*(1-e)}`;b+=`L${40+x} ${150-120*e}`}
  mk(s,'path',{d:a,fill:'none',stroke:HI,'stroke-width':1.8});mk(s,'path',{d:b,fill:'none',stroke:BLUE,'stroke-width':1.8});
  dsh(s,80,150,80,74);dot(s,80,74.2,HI);dot(s,80,105.8,BLUE);ht(s,80,166,'τ = RC');
  ht(s,74,66,'63%',HI,'end',13);ht(s,88,102,'37%',BLUE,'start',13);ht(s,170,56,'charging',HI,'middle',14);ht(s,170,140,'discharging',BLUE,'middle',14);
  cp(s,190,'charging: q = CV(1 − e^(−t/τ))|discharging: q = Q₀e^(−t/τ)');return fin(s)}
/* rod: point at distance r from the rod */
function rodSide(){const s=hs(240,224,'Finite rod of charge density lambda and a point P at perpendicular distance r from the rod. The angles theta one and theta two are measured from the perpendicular PO to the lines from P to the two ends. The perpendicular field points away from the rod.');
  line(s,45,36,195,36,BLUE,4);for(const x of [65,90,130,170])pls(s,x,28);ht(s,215,40,'λ',BLUE,'start',16);
  dsh(s,110,36,110,128);dot(s,110,36,DIM);ht(s,100,52,'O',DIM,'end',13);hl(s,110,128,45,36);hl(s,110,128,195,36);
  dot(s,110,128);ht(s,96,144,'P',INK,'end',16);ht(s,116,70,'r',INK,'start',16);
  arcp(s,110,128,36,-37.4,0);arcp(s,110,128,36,0,45);ht(s,90,86,'θ₁',INK,'middle',14);ht(s,134,86,'θ₂',INK,'middle',14);
  hv(s,110,130,110,172);ht(s,122,168,'E⊥',HI,'start',15);
  cp(s,194,'E⊥ = (kλ/r)(sinθ₁ + sinθ₂)');cp(s,212,'infinite rod: θ₁ = θ₂ = 90°|E = 2kλ/r',DIM);return fin(s)}
/* rod: point on the axis */
function rodAxis(){const s=hs(240,150,'Rod of length L and total charge Q lying along a line. The point P is on the axis of the rod at distance d from its near end. The field is along the axis, away from the rod.');
  line(s,100,40,215,40,BLUE,4);for(const x of [120,150,180,205])pls(s,x,32);dot(s,30,40);ht(s,30,26,'P',INK,'middle',15);
  hv(s,28,40,6,40);ht(s,16,58,'E',HI,'middle',15);
  dsh(s,100,44,100,76);dsh(s,215,44,215,76);dsh(s,30,44,30,76);dim(s,30,70,100,70,'d',65,64);dim(s,100,70,215,70,'L',158,64);
  cp(s,102,'E = kQ / [d(d + L)]|Q = total charge on the rod');cp(s,122,'far away (d ≫ L): E → kQ/d²',DIM);return fin(s)}

/* ---- Hand-drawn notes: mechanics, properties of matter, heat, waves ---- */
const poly=(p,pts,a)=>mk(p,'polygon',{points:pts.map(q=>q.join(',')).join(' '),...a});
const pln=(p,pts)=>mk(p,'polyline',{points:pts.map(q=>q.join(',')).join(' '),fill:'none',stroke:INK,'stroke-width':1.6});
const box=(p,x,y,w,h,t,c=BLUE)=>{mk(p,'rect',{x,y,width:w,height:h,fill:'#17314f',stroke:c,'stroke-width':1.6});if(t)ht(p,x+w/2,y+h/2+5,t,INK,'middle',13)};
const ground=(p,x1,x2,y)=>{hl(p,x1,y,x2,y);for(let x=x1+6;x<x2;x+=10)hl(p,x,y,x-6,y+7,DIM)};
const zig=(p,x1,x2,y,n=8,h=8)=>{let d=`M${x1} ${y}`;const w=(x2-x1-16)/n;d+=`L${x1+8} ${y}`;for(let i=0;i<n;i++)d+=`L${x1+8+w*(i+.5)} ${y+(i%2?h:-h)}`;d+=`L${x2-8} ${y}L${x2} ${y}`;mk(p,'path',{d,fill:'none',stroke:INK,'stroke-width':1.4})};
/* vector addition */
function vecAdd(){const s=hs(260,210,'Two vectors A and B drawn from the same point with angle theta between them. Completing the parallelogram, the resultant R is the diagonal. The angle between R and A is beta.');
  const O=[40,160],A=[150,160],B=[85.9,94.5],Rt=[195.9,94.5];
  dsh(s,...A,...Rt);dsh(s,...B,...Rt);hv(s,...O,...A,BLUE,2);hv(s,...O,...B,RED,2);hv(s,...O,...Rt,HI,2.4);
  arcp(s,40,160,30,35,90);ht(s,78,138,'θ',INK,'middle',16);arcp(s,40,160,56,67.2,90,DIM);ht(s,106,146,'β',DIM,'middle',14);
  ht(s,98,177,'A',BLUE,'middle',16);ht(s,52,118,'B',RED,'end',16);ht(s,134,106,'R',HI,'middle',17);
  cp(s,196,'R = √(A² + B² + 2AB cosθ)|tanβ = B sinθ / (A + B cosθ)');cp(s,0,'difference: √(A² + B² − 2AB cosθ)',DIM);return fin(s)}
/* river and boat */
function river(){const s=hs(260,210,'A river with the current flowing to the right and a boat crossing it. The boat heads straight across with velocity v b, the river carries it along with v r, and its path on the ground is along the resultant, drifting downstream by x over the width d.');
  line(s,12,36,248,36,INK,1.6);line(s,12,150,248,150,INK,1.6);for(const x of [120,150,180]){hv(s,x,92,x+26,92,BLUE,1.2)}ht(s,200,86,'current',BLUE,'start',12);
  dsh(s,70,150,161,36);dsh(s,70,150,70,36);dim(s,28,150,28,36,'d',16,96);
  hv(s,70,150,70,100,INK,2);ht(s,60,120,'v_b',INK,'end',15);hv(s,70,150,112,150,DIM,2);ht(s,96,166,'v_r',DIM,'middle',15);hv(s,70,150,112,100,HI,2.2);ht(s,118,110,'v',HI,'start',16);
  dim(s,70,26,161,26,'x (drift)',116,18);dot(s,70,150);
  cp(s,186,'head across: t = d/v_b (least), drift = v_r t');cp(s,0,'shortest path: sinθ = v_r/v_b upstream, t = d/√(v_b² − v_r²)',DIM);return fin(s)}
/* rain and umbrella */
function rain(){const s=hs(260,206,'A man walking right with speed u while rain falls vertically at speed v. To the man the rain seems to come slanting from the front, at angle theta to the vertical with tan theta equal to u over v, so he tilts the umbrella forward by theta.');
  const t=35,ca=Math.cos(t*Math.PI/180),sa=Math.sin(t*Math.PI/180);
  line(s,90,104,90,146,INK,2);mk(s,'circle',{cx:90,cy:94,r:9,fill:'none',stroke:INK,'stroke-width':1.6});line(s,90,146,80,172,INK,2);line(s,90,146,102,172,INK,2);
  const T=[90+46*sa,100-46*ca];line(s,90,100,...T,INK,1.6);hl(s,T[0]-26*ca,T[1]-26*sa,T[0]+26*ca,T[1]+26*sa,BLUE);line(s,T[0]-26*ca,T[1]-26*sa,T[0]+26*ca,T[1]+26*sa,BLUE,3);
  dsh(s,90,100,90,50);arcp(s,90,100,30,0,t);ht(s,101,72,'θ',INK,'middle',15);
  for(const [x,y] of [[186,22],[214,52],[150,12]])hv(s,x,y,x-23,y+34,HI,1.6);ht(s,208,34,'rain',HI,'start',13);ht(s,250,80,'(relative)',DIM,'end',12);
  hv(s,60,186,120,186,DIM,2);ht(s,90,201,'u',DIM,'middle',15);
  cp(s,222,'tanθ = u/v from the vertical|relative speed = √(u² + v²)');return fin(s)}
/* horizontal projection */
function horiz(){const s=hs(260,206,'A ball thrown horizontally with speed u from a height h. Its path is half a parabola. It lands a horizontal distance x away after a time root of 2 h over g.');
  line(s,40,30,40,160,INK,1.6);ground(s,40,250,160);mk(s,'circle',{cx:40,cy:30,r:6,fill:'#17314f',stroke:BLUE,'stroke-width':1.6});
  mk(s,'path',{d:'M40 30Q110 30 180 160',fill:'none',stroke:INK,'stroke-width':1.6,'stroke-dasharray':'5 3'});hv(s,48,30,82,30,HI,2);ht(s,66,20,'u',HI,'middle',15);
  hv(s,160,124,180,160,RED,2);ht(s,150,122,'v',RED,'end',15);dim(s,22,30,22,160,'h',12,96);dim(s,40,178,180,178,'x',110,194);
  cp(s,214,'t = √(2h/g),  x = u√(2h/g)');cp(s,0,'v = √(u² + 2gh)',DIM);return fin(s)}
/* Lami */
function lami(){const s=hs(260,190,'A point in equilibrium under three forces F1, F2 and F3. The angle alpha is opposite F1, beta is opposite F2 and gamma is opposite F3. Each force is proportional to the sine of the angle opposite to it.');
  const O=[130,86],L=[[325,69,'F₁'],[50,52,'F₂'],[180,90,'F₃']];
  for(const [a,l,n] of L){const [x,y]=pt(...O,l,a),[tx,ty]=pt(...O,l+16,a);hv(s,...O,x,y,HI,2);ht(s,tx,ty+5,n,HI,'middle',15)}
  arcp(s,...O,22,325-360,50);ht(s,...pt(...O,36,7.5).map((v,i)=>v+(i?5:0)),'γ',INK,'middle',14);arcp(s,...O,22,50,180);ht(s,...pt(...O,36,115).map((v,i)=>v+(i?5:0)),'α',INK,'middle',14);arcp(s,...O,22,180,325);ht(s,...pt(...O,36,252).map((v,i)=>v+(i?5:0)),'β',INK,'middle',14);dot(s,...O);
  cp(s,224,'F₁/sinα = F₂/sinβ = F₃/sinγ');cp(s,0,'each angle is opposite its force',DIM);return fin(s)}
/* block on table with hanging mass */
function table(){const s=hs(260,210,'A block of mass m1 on a smooth table joined by a string over a pulley at the edge to a hanging mass m2. Both move with the same acceleration a; the string tension T is the same throughout.');
  line(s,20,100,158,100,INK,2.4);box(s,50,66,48,34,'m₁');mk(s,'circle',{cx:162,cy:92,r:10,fill:'none',stroke:INK,'stroke-width':1.6});
  hl(s,98,83,162,82);hl(s,172,92,172,146);box(s,158,146,28,28,'m₂');
  hv(s,60,52,100,52,HI,2);ht(s,80,44,'a',HI,'middle',15);hv(s,196,150,196,176,HI,2);ht(s,206,168,'a',HI,'start',15);ht(s,124,76,'T',DIM,'middle',14);ht(s,184,130,'T',DIM,'start',14);hv(s,172,174,172,198,DIM,1.6);ht(s,184,196,'m₂g',DIM,'start',13);
  cp(s,222,'a = m₂g/(m₁ + m₂)|T = m₁m₂g/(m₁ + m₂)');cp(s,0,'with friction μ on m₁:|a = (m₂ − μm₁)g/(m₁ + m₂)',DIM);return fin(s)}
/* block on a rough incline */
function roughInc(){const s=hs(260,210,'A block on a rough incline of angle theta. Weight mg acts down, the normal force N acts at right angles to the slope and friction f acts up the slope. Sliding down: a equals g times sine theta minus mu cos theta. It just slides when tan theta equals mu.');
  const th=30,u=[.866,-.5],n=[-.5,-.866],B=[30,170];poly(s,[B,[220,170],[220,170-190*.5774]],{fill:'none',stroke:INK,'stroke-width':1.5});
  const c0=[B[0]+110*u[0],B[1]+110*u[1]],C=[c0[0]+12*n[0],c0[1]+12*n[1]];
  poly(s,[[c0[0]-20*u[0],c0[1]-20*u[1]],[c0[0]+20*u[0],c0[1]+20*u[1]],[c0[0]+20*u[0]+24*n[0],c0[1]+20*u[1]+24*n[1]],[c0[0]-20*u[0]+24*n[0],c0[1]-20*u[1]+24*n[1]]],{fill:'#17314f',stroke:BLUE,'stroke-width':1.6});
  hv(s,...C,C[0],C[1]+48,HI,2);ht(s,C[0]+4,C[1]+62,'mg',HI,'start',15);hv(s,...C,C[0]+44*n[0],C[1]+44*n[1],INK,2);ht(s,C[0]+44*n[0]-4,C[1]+44*n[1]-4,'N',INK,'end',15);
  hv(s,...c0,c0[0]+40*u[0],c0[1]+40*u[1],RED,2);ht(s,c0[0]+40*u[0]+8,c0[1]+40*u[1]-6,'f',RED,'start',15);
  arcp(s,...B,50,60,90);ht(s,86,160,'θ',INK,'middle',15);
  cp(s,196,'down: a = g(sinθ − μ cosθ)|up: a = −g(sinθ + μ cosθ)');cp(s,0,'starts to slide when tanθ = μ|(θ = angle of repose = angle of friction)',DIM);return fin(s)}
/* banked road */
function bank(){const s=hs(260,210,'A car on a road banked at angle theta. The road is higher on the outside, so the normal force N tilts towards the centre of the curve on the left. The horizontal part of N supplies the centripetal force m v squared over r.');
  const th=25,u=[.9063,-.4226],n=[-.4226,-.9063],B=[24,160];poly(s,[B,[220,160],[220,160-196*.4663]],{fill:'none',stroke:INK,'stroke-width':1.5});
  const c0=[B[0]+110*u[0],B[1]+110*u[1]];poly(s,[[c0[0]-24*u[0],c0[1]-24*u[1]],[c0[0]+24*u[0],c0[1]+24*u[1]],[c0[0]+24*u[0]+22*n[0],c0[1]+24*u[1]+22*n[1]],[c0[0]-24*u[0]+22*n[0],c0[1]-24*u[1]+22*n[1]]],{fill:'#17314f',stroke:BLUE,'stroke-width':1.6});
  const C=[c0[0]+11*n[0],c0[1]+11*n[1]];hv(s,...C,C[0],C[1]+46,HI,2);ht(s,C[0]+4,C[1]+60,'mg',HI,'start',15);hv(s,...C,C[0]+50*n[0],C[1]+50*n[1],INK,2);ht(s,C[0]+50*n[0]-4,C[1]+50*n[1]-4,'N',INK,'end',15);
  dsh(s,C[0],C[1],C[0]-70,C[1]);hv(s,C[0]-20,C[1],C[0]-60,C[1],RED,1.8);ht(s,C[0]-76,C[1]+4,'to centre',DIM,'end',12);ht(s,C[0]-40,C[1]-8,'mv²/r',RED,'middle',13);
  arcp(s,...B,50,65,90);ht(s,84,156,'θ',INK,'middle',15);
  cp(s,196,'smooth road: tanθ = v²/rg');cp(s,0,'with friction:|v_max = √(rg(μ + tanθ) / (1 − μ tanθ))',DIM);return fin(s)}
/* conical pendulum */
function conical(){const s=hs(260,214,'A conical pendulum: a bob on a string of length L moves in a horizontal circle of radius r, the string making angle theta with the vertical. The tension T has a vertical part balancing mg and a horizontal part towards the centre.');
  const P=[130,16],L=110,th=30,b=[130+L*.5,16+L*.866];line(s,100,16,160,16,INK,2.4);hl(s,...P,...b);dsh(s,130,16,130,b[1]+34);mk(s,'ellipse',{cx:130,cy:b[1],rx:55,ry:12,fill:'none',stroke:DIM,'stroke-width':1.1,'stroke-dasharray':'4 3'});
  dsh(s,130,b[1],...b);ht(s,152,b[1]+16,'r',DIM,'middle',14);mk(s,'circle',{cx:b[0],cy:b[1],r:9,fill:'#17314f',stroke:BLUE,'stroke-width':1.8});
  hv(s,b[0]-2,b[1]-8,b[0]-2-.5*50,b[1]-8-.866*50,DIM,1.8);ht(s,b[0]+2,b[1]-46,'T',DIM,'start',15);hv(s,b[0],b[1]+10,b[0],b[1]+46,HI,2);ht(s,b[0]+6,b[1]+50,'mg',HI,'start',14);hv(s,b[0]-10,b[1],b[0]-48,b[1],RED,1.8);ht(s,b[0]-30,b[1]-10,'F',RED,'middle',13);
  arcp(s,...P,42,0,30);ht(s,142,66,'θ',INK,'middle',15);ht(s,168,44,'L',INK,'start',14);
  cp(s,200,'tanθ = v²/rg = ω²r/g,  T cosθ = mg');cp(s,0,'period t = 2π√(L cosθ / g)',DIM);return fin(s)}
/* spring work */
function springW(){const s=hs(260,200,'Force against extension for a spring: a straight line through the origin, F equals k x. The area under the line up to x is a triangle, which is the work done, half k x squared.');
  line(s,44,140,240,140,INK,1.4);line(s,44,140,44,16,INK,1.4);ht(s,244,144,'x',INK,'start',15);ht(s,38,22,'F',INK,'end',15);
  poly(s,[[44,140],[190,140],[190,40]],{fill:HI,'fill-opacity':.22,stroke:'none'});hl(s,44,140,190,40,HI);line(s,44,140,190,40,HI,2);
  dsh(s,190,40,190,140);dsh(s,44,40,190,40);ht(s,190,156,'x',INK,'middle',15);ht(s,40,44,'kx',INK,'end',14);ht(s,138,122,'W = ½kx²',INK,'middle',15);ht(s,118,76,'F = kx',HI,'end',14);
  cp(s,184,'work = area under the F–x line = ½kx²');cp(s,0,'W(spring) = −½k(x₂² − x₁²)',DIM);return fin(s)}
/* block leaving a hemisphere */
function hemiBlock(){const s=hs(260,200,'A block slides from rest off the top of a smooth hemisphere of radius R. It leaves the surface when the radius to it makes an angle theta with the vertical, where cos theta is two thirds, at a height two R over three above the base.');
  const C=[110,150],R=84,th=48.19;arcp(s,...C,R,-90,90,INK,1.6);line(s,20,150,200,150,INK,1.6);const Pp=pt(...C,R,th);
  box(s,C[0]-11,C[1]-R-14,22,14,'');dsh(s,...C,C[0],C[1]-R-24);dsh(s,...C,...Pp);arcp(s,...C,42,0,th);ht(s,129,100,'θ',INK,'middle',15);ht(s,152,128,'R',INK,'end',15);
  dot(s,...Pp,RED);hv(s,...Pp,Pp[0]+.667*40,Pp[1]+.745*40,HI,2);ht(s,Pp[0]+34,Pp[1]+8,'v',HI,'start',15);dsh(s,...Pp,226,Pp[1]);dsh(s,226,Pp[1],226,150);dim(s,226,Pp[1],226,150,'h',238,Pp[1]+34);
  cp(s,174,'leaves where cosθ = 2/3 (θ from the vertical)');cp(s,0,'v² = 2gR/3,  h = 2R/3,  N = mg(3cosθ − 2)',DIM);return fin(s)}
/* ballistic pendulum */
function ballistic(){const s=hs(260,206,'A bullet of mass m and speed u embeds in a block of mass M hanging from a string. The block and bullet swing up through a height h with common speed V just after the impact.');
  const P=[120,18],Lh=100,x2=120+Lh*Math.sin(.6),y2=18+Lh*Math.cos(.6);line(s,90,18,150,18,INK,2.4);hl(s,...P,120,118);dsh(s,...P,x2,y2);box(s,106,118,28,22,'M');mk(s,'rect',{x:x2-14,y:y2,width:28,height:22,fill:'none',stroke:DIM,'stroke-width':1.3,'stroke-dasharray':'4 3'});
  mk(s,'circle',{cx:44,cy:129,r:4,fill:HI});hv(s,52,129,98,129,HI,2);ht(s,28,120,'m',INK,'middle',14);ht(s,72,119,'u',HI,'middle',15);
  dsh(s,x2+18,129,x2+34,129);dsh(s,x2+18,y2+11,x2+34,y2+11);dim(s,x2+30,129,x2+30,y2+11,'h',x2+44,121);
  cp(s,174,'V = mu/(m + M),  h = V²/2g');cp(s,0,'u = ((m + M)/m)√(2gh)',DIM);return fin(s)}
/* torque */
function torque(){const s=hs(260,236,'A force F applied at point P at distance r from the pivot O. The angle between r and F is theta. The torque is r F sine theta, which is F times the perpendicular distance r sine theta from O to the line of action of F.');
  const O=[50,120],P=[170,120],d=[.643,-.766],F=[P[0]+60*d[0],P[1]+60*d[1]],foot=[P[0]-77.2*d[0],P[1]-77.2*d[1]];
  line(s,...O,...P,INK,3);dot(s,...O,INK,4);ht(s,40,136,'O',INK,'end',15);dot(s,...P);hv(s,...P,...F,HI,2.2);ht(s,F[0]+4,F[1]+2,'F',HI,'start',16);
  dsh(s,...foot,P[0]-d[0]*0,P[1]);hl(s,...foot,...P,DIM,'4 3');dsh(s,...O,...foot);ht(s,66,170,'r sinθ',DIM,'middle',14);ht(s,110,112,'r',INK,'middle',15);
  arcp(s,...P,30,40,90);ht(s,P[0]+38,P[1]-8,'θ',INK,'middle',15);
  cp(s,214,'τ = r × F,  τ = rF sinθ');cp(s,0,'= F × (perpendicular distance from the axis)',DIM);return fin(s)}
/* parallel and perpendicular axes */
function parAx(){const s=hs(260,196,'Parallel axes: a disc seen face on, with the axis through its centre of mass and a parallel axis at distance d. Perpendicular axes: for a flat body, the moment of inertia about z is the sum of those about x and y in its plane.');
  mk(s,'circle',{cx:70,cy:70,r:50,...ELL});mk(s,'circle',{cx:70,cy:70,r:5,fill:'none',stroke:INK,'stroke-width':1.4});dot(s,70,70,INK,1.5);mk(s,'circle',{cx:120,cy:70,r:5,fill:'none',stroke:HI,'stroke-width':1.4});dot(s,120,70,HI,1.5);
  ht(s,70,90,'cm',INK,'middle',13);hl(s,70,70,120,70,DIM,'3 2');ht(s,95,62,'d',DIM,'middle',14);ht(s,128,92,'axis ⟂ page',HI,'start',12);
  hv(s,180,100,240,100,INK,1.4);ht(s,244,104,'x',INK,'start',14);hv(s,210,130,210,70,INK,1.4);ht(s,214,66,'y',INK,'start',14);hv(s,210,100,236,76,RED,1.4);ht(s,242,76,'z',RED,'start',14);
  cp(s,150,'I = I_cm + Md²  (parallel axes)');cp(s,0,'I_z = I_x + I_y  (flat bodies only)',DIM);return fin(s)}
/* massive pulley */
function pulleyM(){const s=hs(260,206,'A massive pulley of moment of inertia I and radius r with masses m1 and m2 hanging on a string over it, m1 heavier. m1 accelerates down, m2 up, with the same a. The tensions T1 and T2 are different.');
  mk(s,'circle',{cx:130,cy:50,r:26,...ELL});dot(s,130,50);ht(s,130,36,'I, r',DIM,'middle',12);line(s,100,18,160,18,INK,2.4);hl(s,130,18,130,24);
  hl(s,104,50,104,120);hl(s,156,50,156,96);box(s,88,120,32,30,'m₁');box(s,142,96,28,26,'m₂');
  hv(s,86,128,86,160,HI,2);ht(s,78,150,'a',HI,'end',15);hv(s,184,118,184,88,HI,2);ht(s,192,104,'a',HI,'start',15);ht(s,98,84,'T₁',DIM,'end',14);ht(s,164,74,'T₂',DIM,'start',14);
  cp(s,184,'a = (m₁ − m₂)g / (m₁ + m₂ + I/r²)');cp(s,0,'T₁ − T₂ = Ia/r²;  disc: I/r² = M/2',DIM);return fin(s)}
/* rod hinged at one end */
function rodHinge(){const s=hs(260,236,'A uniform rod of length L hinged at one end, released from the horizontal. At release its angular acceleration is 3 g over 2 L. It swings down through a quarter circle to the vertical, where its angular speed is the square root of 3 g over L.');
  poly(s,[[50,50],[42,66],[58,66]],{fill:'none',stroke:INK,'stroke-width':1.5});line(s,50,50,190,50,BLUE,4);dot(s,50,50,INK,3);ht(s,110,72,'cm',DIM,'end',12);dot(s,120,50,DIM,2.5);
  hv(s,120,52,120,92,HI,2);ht(s,132,88,'mg',HI,'start',14);dim(s,50,34,190,34,'L',120,26);
  dsh(s,50,50,50,190);arcp(s,50,50,140,90,180,DIM,1.2);hv(s,170,160,150,174,DIM,1.2);ht(s,170,186,'ω',DIM,'middle',15);
  cp(s,214,'at release: α = 3g/2L,  a(cm) = 3g/4');cp(s,0,'hinge force = Mg/4;  at the vertical ω = √(3g/L)',DIM);return fin(s)}
/* rolling down an incline */
function rollInc(){const s=hs(260,206,'A disc rolling without slipping down an incline of angle theta. Weight mg acts down, the acceleration a is down the slope and the static friction acts up the slope at the contact point.');
  const u=[.866,-.5],n=[-.5,-.866],B=[26,168];poly(s,[B,[226,168],[226,168-200*.5774]],{fill:'none',stroke:INK,'stroke-width':1.5});
  const c0=[B[0]+120*u[0],B[1]+120*u[1]],C=[c0[0]+24*n[0],c0[1]+24*n[1]];mk(s,'circle',{cx:C[0],cy:C[1],r:24,fill:'#17314f',stroke:BLUE,'stroke-width':1.8});hl(s,...C,C[0]+24*Math.cos(.5),C[1]-24*Math.sin(.5));dot(s,...C);
  hv(s,...C,C[0],C[1]+48,HI,2);ht(s,C[0]+6,C[1]+60,'mg',HI,'start',14);hv(s,...C,C[0]-40*u[0],C[1]-40*u[1],DIM,2);ht(s,C[0]-46*u[0]-6,C[1]-46*u[1],'a',DIM,'end',15);
  hv(s,...c0,c0[0]+40*u[0],c0[1]+40*u[1],RED,2);ht(s,c0[0]+48*u[0]+4,c0[1]+40*u[1]-8,'f',RED,'start',15);
  arcp(s,...B,50,60,90);ht(s,86,164,'θ',INK,'middle',15);
  cp(s,196,'a = g sinθ / (1 + I/MR²)');cp(s,0,'ring ½, disc ⅔, solid sphere 5/7 of g sinθ',DIM);cp(s,0,'friction acts up the slope',DIM);return fin(s)}
/* satellite */
function sat(){const s=hs(260,206,'A satellite in a circular orbit of radius r around a planet. Gravity points to the centre and the velocity is along the tangent. Gravity supplies the centripetal force.');
  const C=[110,100];mk(s,'circle',{cx:C[0],cy:C[1],r:70,fill:'none',stroke:DIM,'stroke-width':1.1,'stroke-dasharray':'4 3'});mk(s,'circle',{cx:C[0],cy:C[1],r:28,...ELL});ht(s,...C,'M',INK,'middle',15);
  const S=pt(...C,70,60);mk(s,'circle',{cx:S[0],cy:S[1],r:6,fill:'#17314f',stroke:RED,'stroke-width':1.6});hv(s,S[0]+4,S[1]+8,S[0]+4+.5*40,S[1]+8+.866*40,HI,2);ht(s,S[0]+44,S[1]+56,'v',HI,'start',16);
  hv(s,S[0]-5,S[1]+3,S[0]-5-.866*34,S[1]+3+.5*34,RED,2);ht(s,S[0]-18,S[1]+4,'F',RED,'end',15);hl(s,...C,...pt(...C,70,300),INK,'4 3');ht(s,C[0]-34,C[1]-26,'r',INK,'middle',15);const Q=pt(...C,28,230);hl(s,...C,...Q);ht(s,C[0]-28,C[1]+36,'R',INK,'end',14);
  cp(s,194,'v = √(GM/r) = R√(g/r);  T = 2π√(r³/GM)');cp(s,0,'near the surface: v = √(gR) = 7.9 km/s',DIM);return fin(s)}
/* g at height and depth */
function gHD(){const s=hs(260,206,'The Earth of radius R with a point at height h above the surface where g is g times one plus h over R to the minus two, and a point at depth d below the surface where g is g times one minus d over R. At the centre g is zero.');
  mk(s,'circle',{cx:100,cy:112,r:70,...ELL});dot(s,100,112);ht(s,100,134,'centre: g = 0',DIM,'middle',12);
  dot(s,100,18,RED);dsh(s,100,18,100,42);dim(s,100,42,100,18,'h',112,34);ht(s,86,22,'P',INK,'end',14);hl(s,100,112,170,112);ht(s,150,106,'R',INK,'middle',14);
  dot(s,100,72,RED);ht(s,86,70,'Q',INK,'end',14);dim(s,60,42,60,72,'d',50,60);dsh(s,60,42,100,42);dsh(s,60,72,100,72);
  cp(s,200,'height: g′ = g(1 + h/R)⁻² ≈ g(1 − 2h/R)');cp(s,0,'depth: g′ = g(1 − d/R)',DIM);return fin(s)}
/* hydraulic lift */
function hydr(){const s=hs(260,206,'A hydraulic lift. A small force F1 on a small piston of area A1 produces a large force F2 on a large piston of area A2, because pressure is transmitted equally through the liquid.');
  poly(s,[[40,106],[70,106],[70,130],[110,130],[110,92],[200,92],[200,152],[40,152]],{fill:BLUE,'fill-opacity':.25,stroke:'none'});
  for(const [a,b,c,d] of [[40,50,40,152],[70,50,70,130],[110,130,110,60],[200,60,200,152],[40,152,200,152],[70,130,110,130]])line(s,a,b,c,d,INK,1.4);
  line(s,40,106,70,106,INK,4);line(s,110,92,200,92,INK,4);hv(s,55,60,55,100,HI,2);ht(s,66,72,'F₁',HI,'start',15);hv(s,155,88,155,48,HI,2.2);ht(s,166,66,'F₂',HI,'start',15);
  ht(s,55,170,'A₁',INK,'middle',15);ht(s,155,170,'A₂',INK,'middle',15);
  cp(s,194,'F₁/A₁ = F₂/A₂,  F₂ = F₁(A₂/A₁)');cp(s,0,'F₁d₁ = F₂d₂ (work in = work out)',DIM);return fin(s)}
/* pipe: continuity and Bernoulli */
function pipe(){const s=hs(260,208,'A horizontal pipe that narrows. In the wide part the speed v1 is low and the pressure P1 is high; in the narrow part the speed v2 is higher and the pressure P2 is lower, shown by the lower liquid level in the pressure tube.');
  pln(s,[[16,60],[90,60],[120,80],[244,80]]);pln(s,[[16,150],[90,150],[120,130],[244,130]]);
  hv(s,26,105,76,105,HI,2);ht(s,52,96,'v₁',HI,'middle',15);hv(s,140,105,226,105,HI,2.4);ht(s,184,96,'v₂',HI,'middle',15);ht(s,56,128,'A₁',INK,'middle',15);ht(s,184,124,'A₂',INK,'middle',15);
  for(const [x,y0,lv] of [[50,60,26],[190,80,44]]){line(s,x-5,y0,x-5,18,INK,1.2);line(s,x+5,y0,x+5,18,INK,1.2);hl(s,x-5,lv,x+5,lv,BLUE);mk(s,'rect',{x:x-5,y:lv,width:10,height:y0-lv,fill:BLUE,'fill-opacity':.3})}
  ht(s,72,32,'P₁',INK,'start',14);ht(s,210,48,'P₂',INK,'start',14);
  cp(s,174,'A₁v₁ = A₂v₂;  P + ½ρv² + ρgh = constant');cp(s,0,'narrow part: faster flow, lower pressure',DIM);return fin(s)}
/* Torricelli */
function torri(){const s=hs(260,206,'An open tank of water. A hole at depth h below the free surface, at height H minus h above the ground, throws a jet out horizontally with speed root of 2 g h, which follows a parabola and lands at range R.');
  pln(s,[[60,24],[60,152],[130,152],[130,24]]);mk(s,'rect',{x:61,y:36,width:68,height:116,fill:BLUE,'fill-opacity':.2});hl(s,61,36,129,36,BLUE);ground(s,20,252,152);
  mk(s,'rect',{x:127,y:70,width:6,height:12,fill:'#17314f',stroke:'none'});mk(s,'path',{d:'M130 76Q190 76 250 152',fill:'none',stroke:BLUE,'stroke-width':2});hv(s,134,76,160,76,HI,2);ht(s,162,70,'v = √(2gh)',HI,'start',13);
  dim(s,96,36,96,76,'h',108,60);dim(s,34,36,34,152,'H',22,98);dim(s,130,168,250,168,'R',190,184);dsh(s,130,152,130,168);dsh(s,250,152,250,168);
  cp(s,214,'R = 2√(h(H − h)),  largest at h = H/2');return fin(s)}
/* Stokes */
function stokes(){const s=hs(260,196,'A sphere falling at terminal velocity in a liquid. Its weight mg acts down; the buoyant force B and the viscous drag 6 pi eta r v act up and together balance the weight.');
  hl(s,20,20,240,20,BLUE,'6 3');ht(s,226,14,'liquid',BLUE,'end',12);mk(s,'circle',{cx:110,cy:84,r:24,...ELL});ht(s,110,89,'m',INK,'middle',14);
  hv(s,110,108,110,160,HI,2.2);ht(s,120,150,'mg',HI,'start',15);hv(s,96,62,96,30,RED,2);ht(s,86,42,'B',RED,'end',15);hv(s,124,62,124,30,RED,2);ht(s,132,42,'6πηrv',RED,'start',14);
  hv(s,190,60,190,110,DIM,2);ht(s,200,92,'v_T',DIM,'start',15);
  cp(s,184,'mg = B + 6πηrv_T');cp(s,0,'v_T = 2r²(ρ − σ)g / 9η',DIM);return fin(s)}
/* conduction */
function cond(){const s=hs(260,230,'Heat conduction along a rod of length L and area A with ends at temperatures T1 and T2, lagged at the sides. Below, two rods in series share the same heat flow and their thermal resistances add.');
  mk(s,'rect',{x:50,y:34,width:150,height:28,fill:'#17314f',stroke:BLUE,'stroke-width':1.6});hv(s,60,22,190,22,HI,1.6);ht(s,125,16,'dQ/dt',HI,'middle',13);ht(s,36,53,'T₁',RED,'end',15);ht(s,214,53,'T₂',BLUE,'start',15);dim(s,50,76,200,76,'L',125,92);ht(s,125,52,'k, A',INK,'middle',14);
  line(s,20,104,240,104,DIM,.8);mk(s,'rect',{x:50,y:124,width:74,height:26,fill:'#17314f',stroke:RED,'stroke-width':1.6});mk(s,'rect',{x:124,y:124,width:76,height:26,fill:'#17314f',stroke:BLUE,'stroke-width':1.6});ht(s,87,142,'k₁',INK,'middle',14);ht(s,162,142,'k₂',INK,'middle',14);
  ht(s,36,143,'T₁',RED,'end',15);ht(s,214,143,'T₂',BLUE,'start',15);ht(s,124,118,'T',INK,'middle',14);hv(s,60,166,190,166,HI,1.6);ht(s,125,184,'same heat flow in series',DIM,'middle',13);
  cp(s,206,'dQ/dt = kA(T₁ − T₂)/L,  R = L/kA');cp(s,0,'series: R = R₁ + R₂;  T = (k₁T₁ + k₂T₂)/(k₁ + k₂)',DIM);return fin(s)}
/* heat engine and refrigerator */
function eng(rev){const s=hs(260,206,rev?'A refrigerator: work W is supplied to the device, which takes heat Q2 from the cold sink at T2 and delivers Q1 to the hot reservoir at T1.':'A heat engine: it absorbs heat Q1 from the hot source at T1, does work W and rejects heat Q2 to the cold sink at T2.');
  box(s,40,10,140,28,'');ht(s,110,29,'hot T₁',RED,'middle',15);box(s,40,160,140,28,'');ht(s,110,179,'cold T₂',BLUE,'middle',15);mk(s,'circle',{cx:110,cy:99,r:26,fill:'#17314f',stroke:INK,'stroke-width':1.6});ht(s,110,104,rev?'fridge':'engine',INK,'middle',13);
  if(rev){hv(s,110,160,110,127,HI,2);ht(s,122,146,'Q₂',HI,'start',15);hv(s,110,72,110,40,HI,2);ht(s,122,60,'Q₁',HI,'start',15);hv(s,200,99,138,99,RED,2);ht(s,206,104,'W',RED,'start',16)}
  else{hv(s,110,38,110,70,HI,2);ht(s,122,58,'Q₁',HI,'start',15);hv(s,110,127,110,160,HI,2);ht(s,122,148,'Q₂',HI,'start',15);hv(s,138,99,200,99,RED,2);ht(s,206,104,'W',RED,'start',16)}
  if(rev){cp(s,214,'β = Q₂/W = Q₂/(Q₁ − Q₂);  Carnot: β = T₂/(T₁ − T₂)');cp(s,0,'heat pump: COP = Q₁/W = β + 1',DIM)}else{cp(s,214,'W = Q₁ − Q₂,  η = W/Q₁ = 1 − Q₂/Q₁');cp(s,0,'a cycle: ΔU = 0;  Carnot: η = 1 − T₂/T₁',DIM)}return fin(s)}
const engine=()=>eng(0),fridge=()=>eng(1);
/* Maxwell distribution */
function maxwell(){const s=hs(260,206,'Maxwell distribution of molecular speeds at two temperatures. The curve for the lower temperature T1 is taller and narrower with the peak at lower speed; the curve for the higher temperature T2 is lower and broader with the peak further right. The areas are equal.');
  line(s,40,150,246,150,INK,1.4);line(s,40,150,40,16,INK,1.4);ht(s,248,154,'v',INK,'start',15);ht(s,34,20,'f(v)',INK,'end',13);
  const g=(v,q)=>4/Math.sqrt(Math.PI)*v*v*Math.exp(-v*v/q)/Math.pow(q,1.5);
  for(const [q,c] of [[1,BLUE],[1.9,HI]]){let d='M40 150';for(let x=1;x<=206;x+=3){const v=x/62;d+=`L${40+x} ${150-125*g(v,q)}`}mk(s,'path',{d,fill:'none',stroke:c,'stroke-width':1.8})}
  dsh(s,102,150,102,48);ht(s,102,166,'v_mp',INK,'middle',13);ht(s,70,44,'T₁',BLUE,'middle',15);ht(s,172,74,'T₂ > T₁',HI,'start',15);
  cp(s,188,'f(v) ∝ v² e^(−mv²/2kT)|v_mp < v_avg < v_rms;  area = N (same)');return fin(s)}
/* SHM and the reference circle */
function shmCircle(){const s=hs(260,216,'Simple harmonic motion as the projection of uniform circular motion of radius A on a diameter. The reference point is at angle theta from the vertical, and its displacement from the mean position is x equals A sine theta.');
  const C=[110,100],A=72,th=40,P=pt(...C,A,th);mk(s,'circle',{cx:C[0],cy:C[1],r:A,fill:'none',stroke:BLUE,'stroke-width':1.6});line(s,24,100,196,100,INK,1.3);dsh(s,...C,C[0],C[1]-A-8);hl(s,...C,...P);dot(s,...P,RED,4);dsh(s,P[0],P[1],P[0],100);dot(s,P[0],100,HI,4);
  arcp(s,...C,30,0,th);ht(s,124,82,'θ',INK,'middle',15);ht(s,138,94,'x',HI,'middle',15);ht(s,34,116,'−A',DIM,'middle',13);ht(s,188,116,'+A',DIM,'middle',13);ht(s,C[0]+4,C[1]+14,'mean',DIM,'start',12);ht(s,146,74,'A',INK,'start',14);
  cp(s,196,'x = A sinθ,  θ = ωt;  t = (θ₂ − θ₁)/ω');cp(s,0,'mean → A/2: T/12;  → A/√2: T/8;  → A: T/4',DIM);return fin(s)}
/* spring-mass oscillator */
function springMass(){const s=hs(260,190,'A block on a smooth surface joined to a wall by a spring of constant k. The block is displaced by x from the mean position; the restoring force is minus k x towards the mean position. Extremes are at plus and minus A.');
  line(s,24,56,24,110,INK,3);for(const y of [64,78,92,106])hl(s,24,y,16,y+6,DIM);zig(s,24,128,84);box(s,128,66,42,36,'m');line(s,20,102,244,102,INK,1.5);
  dsh(s,114,40,114,124);ht(s,114,138,'x = 0',INK,'middle',13);dsh(s,66,110,66,124);ht(s,66,138,'−A',DIM,'middle',13);dsh(s,176,40,176,124);ht(s,176,138,'+A',DIM,'middle',13);
  dim(s,114,52,150,52,'x',132,44);hv(s,128,84,100,84,RED,2);ht(s,100,70,'F = −kx',RED,'end',13);
  cp(s,170,'T = 2π√(m/k),  ω = √(k/m)');cp(s,0,'does not depend on A or on g',DIM);return fin(s)}
/* simple pendulum */
function pendulum(){const s=hs(260,206,'A simple pendulum: a bob on a string of length L displaced by a small angle theta. The weight mg has a component mg sine theta along the path, back towards the mean position. The period is 2 pi root L over g.');
  const P=[120,14],Lh=120,th=.4363,b=[120+Lh*Math.sin(th),14+Lh*Math.cos(th)];line(s,90,14,150,14,INK,2.4);hl(s,...P,...b);dsh(s,120,14,120,150);arcp(s,...P,44,0,25);ht(s,129,66,'θ',INK,'middle',15);ht(s,152,56,'L',INK,'start',14);
  mk(s,'circle',{cx:b[0],cy:b[1],r:9,fill:'#17314f',stroke:BLUE,'stroke-width':1.8});hv(s,...b,b[0],b[1]+44,HI,2);ht(s,b[0]+6,b[1]+46,'mg',HI,'start',14);hv(s,...b,b[0]-Math.cos(th)*34,b[1]+Math.sin(th)*34,RED,1.8);ht(s,b[0]-40,b[1]+30,'mg sinθ',RED,'end',12);
  cp(s,182,'T = 2π√(L/g),  small θ (about 10° or less)');cp(s,0,'independent of mass and of amplitude',DIM);return fin(s)}
/* string fixed at both ends */
function stringHarm(){const s=hs(260,250,'A string fixed at both ends vibrating in its first three harmonics: one, two and three loops. The wavelength is 2 L over n and the frequency is n v over 2 L.');
  [['n = 1','λ = 2L, f₁ = v/2L'],['n = 2','λ = L, f = 2f₁'],['n = 3','λ = 2L/3, f = 3f₁']].forEach(([a,b],i)=>{const y=30+i*66,n=i+1;let d1=`M30 ${y}`,d2=d1;for(let x=2;x<=200;x+=2){const e=22*Math.sin(n*Math.PI*x/200);d1+=`L${30+x} ${y-e}`;d2+=`L${30+x} ${y+e}`}mk(s,'path',{d:d1,fill:'none',stroke:BLUE,'stroke-width':1.6});mk(s,'path',{d:d2,fill:'none',stroke:BLUE,'stroke-width':1.6});for(let k=0;k<=n;k++)dot(s,30+200*k/n,y,RED,3);ht(s,130,y+36,a+':  '+b,DIM,'middle',12)});
  dim(s,30,222,230,222,'L',130,238);cp(s,256,'f_n = nv/2L = (n/2L)√(T/μ),  λ = 2L/n');return fin(s)}
/* open and closed organ pipes */
function pipes(){const s=hs(260,236,'Fundamental modes of an open pipe and a closed pipe. The open pipe has displacement antinodes at both ends and a node in the middle, so the wavelength is 2 L. The closed pipe has a node at the closed end and an antinode at the open end, so the wavelength is 4 L.');
  ht(s,12,16,'open',DIM,'start',13);line(s,40,30,220,30,INK,1.6);line(s,40,76,220,76,INK,1.6);let d1='M40 53',d2='M40 53';for(let x=2;x<=180;x+=2){const e=20*Math.cos(Math.PI*x/180);d1+=`L${40+x} ${53-e}`;d2+=`L${40+x} ${53+e}`}mk(s,'path',{d:d1,fill:'none',stroke:BLUE,'stroke-width':1.6});mk(s,'path',{d:d2,fill:'none',stroke:BLUE,'stroke-width':1.6});
  ht(s,40,98,'A',RED,'middle',14);ht(s,130,98,'N',INK,'middle',14);ht(s,220,98,'A',RED,'middle',14);
  ht(s,12,126,'closed',DIM,'start',13);line(s,40,140,220,140,INK,1.6);line(s,40,186,220,186,INK,1.6);line(s,40,140,40,186,INK,4);let e1='M40 163',e2='M40 163';for(let x=2;x<=180;x+=2){const e=20*Math.sin(Math.PI*x/360);e1+=`L${40+x} ${163-e}`;e2+=`L${40+x} ${163+e}`}mk(s,'path',{d:e1,fill:'none',stroke:BLUE,'stroke-width':1.6});mk(s,'path',{d:e2,fill:'none',stroke:BLUE,'stroke-width':1.6});
  ht(s,40,208,'N',INK,'middle',14);ht(s,220,208,'A',RED,'middle',14);
  cp(s,230,'open: f = nv/2L, all harmonics|closed: f = (2n−1)v/4L, odd only');return fin(s)}
/* Doppler effect */
function doppler(){const s=hs(260,200,'A moving source S emitting circular wavefronts. In front of the source, towards the right, the wavefronts are crowded together, so the observer there hears a higher frequency; behind it they are spread out, giving a lower frequency.');
  for(let k=1;k<=4;k++)mk(s,'circle',{cx:100-9*k,cy:84,r:14*k,fill:'none',stroke:BLUE,'stroke-width':1.2});
  mk(s,'circle',{cx:100,cy:84,r:6,fill:'#17314f',stroke:RED,'stroke-width':1.8});ht(s,100,112,'S',RED,'middle',15);hv(s,108,84,146,84,HI,2);ht(s,130,74,'v_s',HI,'middle',14);
  mk(s,'circle',{cx:206,cy:84,r:6,fill:'#17314f',stroke:INK,'stroke-width':1.6});ht(s,206,112,'O',INK,'middle',15);ht(s,130,46,'crowded: f′ > f',BLUE,'start',12);ht(s,10,160,'spread out: f′ < f',BLUE,'start',12);
  cp(s,178,'f′ = f (v − v_o)/(v − v_s)  (S → O positive)');cp(s,0,'S approaching: fv/(v − v_s);  receding: fv/(v + v_s)',DIM);return fin(s)}

/* ---- Electromagnetic Waves and Optics (JEE): E/B/k triad, displacement current, spectrum, mirror, lens, TIR, prism, YDSE, single slit, polarisers ---- */
const pth=(p,d,c=INK,w=1.6)=>mk(p,'path',{d,fill:'none',stroke:c,'stroke-width':w});
const thick=(s,n)=>{const l=s.querySelectorAll('line');for(let i=l.length-n;i<l.length;i++)l[i].setAttribute('stroke-width',3)};
function emw(){const s=hs(300,170,'An electromagnetic wave travelling to the right. The electric field E oscillates up and down, the magnetic field B oscillates in the perpendicular direction (into and out of the page), and the direction of travel k is along E cross B. E and B are in phase.');
  hv(s,14,92,288,92,DIM,1.6);ht(s,274,110,'k',DIM,'middle',14);
  let e='',b='';for(let x=0;x<=240;x+=4){const q=Math.sin(x/240*Math.PI*4),X=30+x;e+=(x?'L':'M')+X+' '+(92-44*q);b+=(x?'L':'M')+(X-24*q)+' '+(92+20*q)}
  pth(s,e,HI,2);pth(s,b,BLUE,2);ht(s,42,50,'E',HI,'middle',16);ht(s,16,116,'B',BLUE,'middle',16);
  cp(s,150,'E ⟂ B ⟂ k, in phase|E₀ = cB₀, travel along E × B');return fin(s)}
function emdc(){const s=hs(300,190,'A capacitor being charged. A conduction current I flows in the wires up to the plates. Between the plates no charge crosses, but the electric field E changes, and this gives a displacement current equal to I. Both produce the same magnetic field around.');
  hl(s,120,30,120,150,INK);hl(s,180,30,180,150,INK);thick(s,2);
  hl(s,20,90,120,90,INK);hl(s,180,90,280,90,INK);hv(s,40,90,80,90,HI);ht(s,60,78,'I',HI,'middle',15);hv(s,230,90,262,90,HI);ht(s,246,78,'I',HI,'middle',15);
  for(const y of [50,90,130])hv(s,128,y,172,y,BLUE,1.5);ht(s,150,42,'E grows',BLUE,'middle',13);ht(s,150,166,'Iᵈ = ε₀ dΦᴇ/dt = I',HI,'middle',14);
  pls(s,112,64,'+');pls(s,188,64,'−');
  cp(s,184,'Iᵈ = C dV/dt: same size as I,|no charge crosses the gap');return fin(s)}
function emsp(){const s=hs(310,150,'The electromagnetic spectrum from long wavelength to short: radio, microwave, infrared, visible, ultraviolet, X-ray and gamma. Frequency and photon energy rise to the right.');
  const N=['Radio','Micro','IR','Visible','UV','X-ray','γ-ray'],C=['#3b4f73','#4a6a8c','#8c4a3e','#4a8c5a','#6a4a8c','#2f6f8f','#8c3e6a'],W=[44,44,40,50,40,44,44];let x=4;
  N.forEach((n,i)=>{mk(s,'rect',{x,y:34,width:W[i],height:44,fill:C[i],stroke:INK,'stroke-width':1});ht(s,x+W[i]/2,61,n,'#fff','middle',12);x+=W[i]});
  hv(s,4,100,300,100,DIM,1.4);ht(s,4,92,'λ long',DIM,'start',12);ht(s,300,92,'λ short',DIM,'end',12);ht(s,152,122,'f and photon energy rise →',DIM,'middle',12);
  ht(s,152,20,'400 nm violet … 700 nm red',INK,'middle',12);
  cp(s,138,'Radio > 0.1 m · Micro 1 mm–0.1 m|IR 700 nm–1 mm · UV 1–400 nm|X-ray 10⁻³–1 nm · γ < 10⁻³ nm');return fin(s)}
function omir(){const s=hs(270,200,'Concave mirror with the object beyond the centre of curvature C. A ray parallel to the axis goes through the focus F after reflection; a ray to the pole P reflects at the same angle. They meet to form a real, inverted, diminished image between C and F.');
  hl(s,10,100,262,100,DIM);pth(s,'M215 32.4A160 160 0 0 1 215 167.6',BLUE,2.6);
  for(const [x,t] of [[70,'C'],[150,'F'],[230,'P']]){dot(s,x,100,INK,3);ht(s,x,118,t,INK,'middle',14)}
  hv(s,40,100,40,60,HI,2.2);ht(s,40,50,'object',HI,'middle',13);
  hl(s,40,60,225,60,INK);hl(s,225,60,92,131,INK);hl(s,40,60,230,100,DIM);hl(s,230,100,92,129,DIM);
  hv(s,92,100,92,129,GRN,2.2);ht(s,90,148,'image',GRN,'middle',13);
  cp(s,176,'1/v + 1/u = 1/f, m = −v/u|object beyond C: real, inverted, smaller');return fin(s)}
function olens(){const s=hs(310,200,'Convex lens with an object beyond the focus. A ray parallel to the axis goes through the far focus; a ray through the centre goes straight. They meet to form a real inverted image.');
  hl(s,8,90,300,90,DIM);pth(s,'M150 28Q168 90 150 152Q132 90 150 28',BLUE,2.4);
  for(const [x,t] of [[30,'2F'],[90,'F'],[210,'F'],[270,'2F']]){dot(s,x,90,INK,3);ht(s,x,108,t,INK,'middle',13)}
  hv(s,40,90,40,55,HI,2.2);hl(s,40,55,150,55,INK);hl(s,150,55,282,132,INK);hl(s,40,55,150,90,DIM);hl(s,150,90,282,132,DIM);
  hv(s,282,90,282,132,GRN,2.2);ht(s,282,150,'image',GRN,'middle',13);ht(s,38,40,'object',HI,'middle',13);
  cp(s,186,'1/v − 1/u = 1/f, m = v/u|1/f = (n − 1)(1/R₁ − 1/R₂)');return fin(s)}
function otir(){const s=hs(300,190,'Light from a source O in a denser medium meets the boundary with a rarer medium. A small angle of incidence refracts away from the normal. At the critical angle the refracted ray grazes the surface. Beyond it the ray is totally reflected.');
  hl(s,10,80,290,80,INK);ht(s,20,70,'rarer n₂',DIM,'start',13);ht(s,20,100,'denser n₁',DIM,'start',13);dsh(s,150,30,150,160);
  dot(s,150,150,HI,4);ht(s,138,166,'O',HI,'end',14);
  hl(s,150,150,172,80,INK);hl(s,172,80,208,34,INK);
  hl(s,150,150,204,80,HI);hv(s,204,80,284,80,HI,1.8);ht(s,244,68,'grazing at θc',HI,'middle',12);
  hl(s,150,150,236,80,GRN);hv(s,236,80,282,146,GRN,1.8);ht(s,268,160,'TIR, i > θc',GRN,'middle',12);
  arcp(s,150,150,42,0,37,INK);ht(s,172,114,'θc',INK,'start',13);
  cp(s,184,'sin θc = n₂/n₁   (denser to rarer)');return fin(s)}
function oprism(){const s=hs(300,200,'A prism of angle A at minimum deviation. The ray inside is parallel to the base. The incident and emergent rays make equal angles with the faces, and the deviation is the angle between the incident ray extended and the emergent ray.');
  pth(s,'M150 30L81 150L219 150Z',BLUE,2);ht(s,150,56,'A',INK,'middle',14);
  hl(s,30,119,115.5,90,INK);hl(s,115.5,90,184.5,90,INK);hv(s,184.5,90,270,119,INK,1.8);
  hl(s,115.5,90,200,61,DIM,'4 3');hl(s,184.5,90,100,61,DIM,'4 3');ht(s,176,70,'δ',HI,'start',16);
  ht(s,70,136,'i',INK,'middle',13);ht(s,246,136,'e',INK,'middle',13);
  cp(s,176,'δ = i + e − A, r₁ + r₂ = A|n = sin((A + δₘ)/2) / sin(A/2)');return fin(s)}
function oyd(){const s=hs(320,200,'Young double slit. A plane wave falls on two slits S1 and S2 a distance d apart. Rays from both slits reach a point P on a screen at distance D. The path difference is d y over D. Bright and dark fringes alternate on the screen with equal spacing beta equal to lambda D over d.');
  for(const [a,b] of [[20,66],[74,106],[114,160]])hl(s,70,a,70,b,INK);thick(s,3);
  for(const y of [30,150])hv(s,10,y,44,y,DIM,1.2);
  hl(s,270,20,270,160,INK);for(const k of [-2,-1,0,1,2])mk(s,'rect',{x:270,y:90+k*20-4,width:10,height:8,fill:HI});
  hl(s,70,70,270,50,GRN);hl(s,70,110,270,50,GRN);dot(s,270,50,INK,3);ht(s,288,54,'P',INK,'start',14);ht(s,288,94,'O',INK,'start',14);
  ht(s,80,62,'S₁',INK,'start',13);ht(s,80,128,'S₂',INK,'start',13);dim(s,46,70,46,110,'d',34,94);
  dim(s,70,174,270,174,'D',170,190);dim(s,300,70,300,90,'β',312,84);
  cp(s,208,'Δ = dy/D, bright y = nλD/d|fringe width β = λD/d');return fin(s)}
function oslit(){const s=hs(330,200,'Single slit diffraction. Light passes through a slit of width a. On the screen a wide bright central maximum has dark minima where a sin theta equals n lambda. A graph of intensity against position shows a central peak with weak secondary maxima.');
  for(const [a,b] of [[20,75],[105,160]])hl(s,70,a,70,b,INK);thick(s,2);
  dim(s,52,75,52,105,'a',40,94);for(const y of [40,140])hv(s,10,y,44,y,DIM,1.2);
  hl(s,250,20,250,160,INK);dsh(s,70,90,250,55);dsh(s,70,90,250,125);hl(s,70,90,250,90,DIM,'2 4');
  let d='';for(let y=20;y<=160;y+=2){const al=Math.PI*(y-90)/35,v=Math.abs(al)<1e-6?1:Math.sin(al)/al;d+=(y>20?'L':'M')+(254+60*v*v)+' '+y}
  pth(s,d,HI,2);ht(s,128,70,'θ',INK,'start',13);ht(s,258,56,'−1',DIM,'start',11);ht(s,258,129,'+1',DIM,'start',11);
  cp(s,178,'minima: a sin θ = nλ|central width 2λD/a');return fin(s)}
function opol(){const s=hs(320,170,'Unpolarised light passes a polariser and becomes plane polarised with half the intensity. A second polariser, the analyser, whose axis makes angle theta with the first, transmits the intensity I0 cos squared theta (Malus law).');
  hv(s,8,70,312,70,DIM,1.4);
  for(const a of [0,45,90,135]){const r=a*Math.PI/180;hl(s,34-16*Math.sin(r),70-16*Math.cos(r),34+16*Math.sin(r),70+16*Math.cos(r),INK)}
  ht(s,34,104,'unpolarised',DIM,'middle',11);
  mk(s,'rect',{x:98,y:34,width:10,height:72,fill:'none',stroke:BLUE,'stroke-width':1.8});for(const y of [44,58,70,82,96])hl(s,103,y-6,103,y+6,BLUE);
  ht(s,103,122,'polariser',BLUE,'middle',12);
  hv(s,150,50,150,90,HI,2.2);ht(s,150,116,'I₀/2',HI,'middle',13);
  mk(s,'rect',{x:196,y:34,width:10,height:72,fill:'none',stroke:GRN,'stroke-width':1.8});hl(s,196,60,206,80,GRN);hl(s,196,80,206,100,GRN);
  ht(s,190,122,'analyser',GRN,'middle',12);
  hv(s,262,50,248,90,HI,2.2);ht(s,270,116,'(I₀/2) cos²θ',HI,'middle',13);
  cp(s,150,'Malus: I = I₀ cos²θ|Brewster: tan i = n, reflected ⟂ refracted');return fin(s)}

/* ---- Current Electricity (JEE): drift, series/parallel, Wheatstone, meter bridge, potentiometer, cells, Kirchhoff, meters, RC ---- */
const zg=(s,x1,y1,x2,y2,c=INK,amp=7,n=6)=>{const L=Math.hypot(x2-x1,y2-y1),ux=(x2-x1)/L,uy=(y2-y1)/L,nx=-uy,ny=ux,ld=L*.2,bd=L-2*ld;let d=`M${x1} ${y1}L${x1+ux*ld} ${y1+uy*ld}`;for(let i=0;i<n;i++){const t=ld+bd*(i+.5)/n,a=(i%2?-1:1)*amp;d+=`L${x1+ux*t+nx*a} ${y1+uy*t+ny*a}`}return pth(s,d+`L${x1+ux*(L-ld)} ${y1+uy*(L-ld)}L${x2} ${y2}`,c,1.6)};
const cellH=(s,x,y,lab)=>{hl(s,x,y-13,x,y+13);line(s,x+7,y-7,x+7,y+7,INK,3.2);if(lab)ht(s,x+3,y-18,lab,HI,'middle',13)};
const cellV=(s,x,y,lab)=>{hl(s,x-13,y,x+13,y);line(s,x-7,y+7,x+7,y+7,INK,3.2);if(lab)ht(s,x+22,y+5,lab,HI,'start',13)};
const gal=(s,x,y,t='G')=>{mk(s,'circle',{cx:x,cy:y,r:13,fill:'none',stroke:INK,'stroke-width':1.5});ht(s,x,y+5,t,INK,'middle',14)};
function cedrift(){const s=hs(300,190,'A metal wire with an electric field E along it. The free electrons zigzag between collisions and drift slowly to the left, opposite to E. The conventional current I flows to the right. I equals n A v d e.');
  mk(s,'rect',{x:40,y:56,width:220,height:70,fill:'none',stroke:INK,'stroke-width':1.5,rx:6});
  hv(s,70,34,230,34,BLUE,2);ht(s,150,26,'E',BLUE,'middle',15);
  const P=[[210,76,'M210 76L196 86L180 72L164 90L150 76'],[130,110,'M130 110L116 100L100 116L84 102L70 112'],[230,104,'M230 104L214 96L198 110L184 100L170 108']];
  for(const [x,y,d] of P){pth(s,d,DIM,1.2);mk(s,'circle',{cx:x,cy:y,r:6,fill:'none',stroke:RED,'stroke-width':1.6});ht(s,x,y+4,'−',RED,'middle',12)}
  hv(s,244,150,60,150,HI,2);ht(s,152,170,'drift of electrons, vd',HI,'middle',13);
  hv(s,12,92,38,92,GRN,2);hv(s,262,92,288,92,GRN,2);ht(s,276,82,'I',GRN,'middle',15);
  cp(s,186,'I = nAvd e, vd ≈ 10⁻⁴ m/s|electrons move against E');return fin(s)}
function cesp(){const s=hs(300,260,'Resistors in series carry the same current and their resistances add. Resistors in parallel have the same potential difference and their conductances add.');
  ht(s,12,22,'Series',HI,'start',14);
  hl(s,14,50,40,50);zg(s,40,50,98,50);ht(s,69,32,'R₁',INK,'middle',13);zg(s,98,50,156,50);ht(s,127,32,'R₂',INK,'middle',13);zg(s,156,50,214,50);ht(s,185,32,'R₃',INK,'middle',13);hl(s,214,50,262,50);
  hv(s,20,50,34,50,GRN,1.6);ht(s,24,72,'I',GRN,'middle',14);ht(s,150,78,'Rₑq = R₁ + R₂ + R₃, same I',BLUE,'middle',13);
  ht(s,12,118,'Parallel',HI,'start',14);
  hl(s,14,170,60,170);hl(s,60,140,60,200);hl(s,60,140,70,140);hl(s,60,200,70,200);zg(s,70,140,200,140);zg(s,70,200,200,200);hl(s,200,140,210,140);hl(s,200,200,210,200);hl(s,210,140,210,200);hl(s,210,170,262,170);
  dot(s,60,170);dot(s,210,170);ht(s,135,132,'R₁',INK,'middle',13);ht(s,135,224,'R₂',INK,'middle',13);
  ht(s,150,246,'1/Rₑq = 1/R₁ + 1/R₂, same V',BLUE,'middle',13);
  cp(s,266,'series: V divides as R|parallel: I divides as 1/R');return fin(s)}
function cewb(){const s=hs(300,230,'A Wheatstone bridge. Four resistors P, Q, R and S form a diamond with corners A, B, C and D. A galvanometer joins B and D, and a cell is connected across A and C. When P over Q equals R over S the galvanometer shows no current.');
  const A=[40,95],B=[150,35],C=[260,95],D=[150,155];
  zg(s,A[0],A[1],B[0],B[1]);zg(s,B[0],B[1],C[0],C[1]);zg(s,A[0],A[1],D[0],D[1]);zg(s,D[0],D[1],C[0],C[1]);
  hl(s,B[0],B[1],B[0],82);gal(s,150,95);hl(s,150,108,150,D[1]);
  for(const [p,t,dx,dy] of [[A,'A',-14,5],[B,'B',0,-8],[C,'C',14,5],[D,'D',14,20]]){dot(s,p[0],p[1]);ht(s,p[0]+dx,p[1]+dy,t,BLUE,'middle',14)}
  ht(s,84,52,'P',INK,'middle',14);ht(s,216,52,'Q',INK,'middle',14);ht(s,84,148,'R',INK,'middle',14);ht(s,216,148,'S',INK,'middle',14);
  hl(s,40,95,40,190);hl(s,260,95,260,190);hl(s,40,190,138,190);hl(s,162,190,260,190);cellH(s,138,190,'E');
  cp(s,222,'balanced: P/Q = R/S, no current in G|then V(B) = V(D) and G can be removed');return fin(s)}
function cemb(){const s=hs(300,260,'A meter bridge. A uniform wire of length 100 centimetres is stretched under a scale. The unknown resistance X is in the left gap and the known resistance R in the right gap. A jockey touches the wire at distance l from the left end and a galvanometer joins it to the middle point of the gaps. At balance X over R equals l over 100 minus l.');
  hl(s,30,50,52,50);zg(s,52,50,132,50);ht(s,92,34,'X',INK,'middle',14);hl(s,132,50,148,50);zg(s,148,50,228,50);ht(s,188,34,'R',INK,'middle',14);hl(s,228,50,270,50);
  hl(s,30,50,30,130);hl(s,270,50,270,130);line(s,30,130,270,130,INK,3);dot(s,140,50);
  hl(s,140,50,140,72);gal(s,140,85);hl(s,140,98,140,106);hl(s,140,106,118,106);hl(s,118,106,118,126);
  mk(s,'polygon',{points:'118,130 111,119 125,119',fill:HI});ht(s,118,152,'jockey',HI,'middle',12);
  for(const x of [30,90,150,210,270])hl(s,x,130,x,136);
  hv(s,32,166,116,166,DIM,1.2);hv(s,116,166,32,166,DIM,1.2);ht(s,74,184,'l',INK,'middle',14);
  hv(s,120,166,268,166,DIM,1.2);hv(s,268,166,120,166,DIM,1.2);ht(s,194,184,'100 − l',INK,'middle',14);
  ht(s,20,126,'A',BLUE,'end',13);ht(s,282,126,'C',BLUE,'start',13);
  cp(s,214,'X/R = l/(100 − l) at balance|X in left gap: X = R l/(100 − l)');return fin(s)}
function cepot(){const s=hs(300,260,'A potentiometer. A long uniform wire AB carries a steady current from a driver cell and a rheostat. The cell of EMF E to be measured and a galvanometer are joined between A and a jockey which touches the wire at distance l from A. At balance E equals k times l, where k is the potential gradient.');
  line(s,30,100,270,100,INK,3);ht(s,22,96,'A',BLUE,'end',14);ht(s,278,96,'B',BLUE,'start',14);
  hl(s,30,100,30,190);hl(s,270,100,270,190);hl(s,30,190,66,190);cellH(s,66,190,'E₀');hl(s,73,190,130,190);zg(s,130,190,230,190);ht(s,180,176,'rheostat',DIM,'middle',12);hl(s,230,190,270,190);
  hl(s,30,100,30,50);hl(s,30,50,70,50);cellH(s,70,50,'E');hl(s,77,50,130,50);gal(s,143,50);hl(s,156,50,200,50);hl(s,200,50,200,88);
  mk(s,'polygon',{points:'200,100 193,88 207,88',fill:HI});ht(s,212,74,'jockey J',HI,'start',12);
  hv(s,32,132,198,132,DIM,1.2);hv(s,198,132,32,132,DIM,1.2);ht(s,115,150,'l',INK,'middle',14);
  cp(s,222,'k = V/L, E = kl at balance|E₁/E₂ = l₁/l₂, r = R(l₁ − l₂)/l₂');return fin(s)}
function cecell(){const s=hs(300,320,'Cells in series: n cells give EMF nE and internal resistance nr. Cells in parallel: m cells give EMF E and internal resistance r over m. Both groups are connected to an external resistance R.');
  ht(s,12,20,'Series',HI,'start',14);
  hl(s,30,36,70,36);cellH(s,70,36,'+');hl(s,77,36,110,36);cellH(s,110,36,'+');hl(s,117,36,150,36);cellH(s,150,36,'+');hl(s,157,36,270,36);
  hl(s,30,36,30,92);hl(s,270,36,270,50);zg(s,270,50,270,80,INK,6,4);hl(s,270,80,270,92);hl(s,30,92,270,92);ht(s,246,68,'R',INK,'end',14);
  ht(s,150,118,'nE and nr in series',BLUE,'middle',13);
  ht(s,12,156,'Parallel',HI,'start',14);
  hl(s,50,172,250,172);hl(s,50,262,250,262);
  for(const x of [80,130,180]){hl(s,x,172,x,200);cellV(s,x,200,'');hl(s,x,214,x,262);dot(s,x,172);dot(s,x,262)}
  for(const x of [80,130,180])ht(s,x+9,196,'+',RED,'start',13);
  hl(s,250,172,250,200);zg(s,250,200,250,236,INK,6,4);hl(s,250,236,250,262);ht(s,232,222,'R',INK,'end',14);
  ht(s,150,288,'E and r/m in parallel',BLUE,'middle',13);
  cp(s,306,'mixed: I = nmE/(mR + nr)|greatest when R = nr/m');return fin(s)}
function cekir(){const s=hs(300,260,'Kirchhoff laws. Left: at a junction the currents entering, I one and I two, equal the current leaving, I three. Right: round a closed loop with a cell and two resistors the sum of the potential changes is zero.');
  ht(s,12,20,'Junction law',HI,'start',14);
  hl(s,20,56,84,92);hl(s,20,128,84,92);hl(s,84,92,146,92);dot(s,84,92);
  hv(s,26,59,52,73,GRN,2);ht(s,22,50,'I₁',GRN,'middle',14);hv(s,26,125,52,111,GRN,2);ht(s,22,146,'I₂',GRN,'middle',14);hv(s,100,92,140,92,HI,2);ht(s,126,80,'I₃',HI,'middle',14);
  ht(s,12,174,'Σ I in = Σ I out',BLUE,'start',13);ht(s,12,192,'I₁ + I₂ = I₃',BLUE,'start',13);
  ht(s,170,20,'Loop law',HI,'start',14);
  hl(s,176,56,196,56);zg(s,196,56,236,56);ht(s,216,42,'R₁',INK,'middle',13);hl(s,236,56,286,56);
  hl(s,286,56,286,80);zg(s,286,80,286,116,INK,6,4);ht(s,274,102,'R₂',INK,'end',13);hl(s,286,116,286,140);
  hl(s,176,56,176,86);cellV(s,176,86,'');hl(s,176,100,176,140);hl(s,176,140,286,140);ht(s,198,98,'E',HI,'start',14);
  pth(s,'M200 74A32 32 0 1 1 200 122',BLUE,1.6);mk(s,'polygon',{points:'204,126 194,124 198,116',fill:BLUE});ht(s,240,104,'I',BLUE,'middle',14);
  ht(s,170,174,'Σ ΔV = 0 in a loop',BLUE,'start',13);ht(s,170,192,'E − IR₁ − IR₂ = 0',BLUE,'start',13);
  cp(s,222,'through a resistor along I: −IR; cell − to +: +E|negative answer: current opposite to assumed');return fin(s)}
function cemet(){const s=hs(300,290,'Top: an ammeter. A small shunt resistance S is connected in parallel with the galvanometer G. Bottom: a voltmeter. A large resistance Rs is connected in series with the galvanometer.');
  ht(s,12,20,'Ammeter: shunt in parallel',HI,'start',14);
  hl(s,14,64,50,64);dot(s,50,64);hl(s,50,64,50,44);hl(s,50,44,100,44);gal(s,113,44);hl(s,126,44,176,44);hl(s,176,44,176,64);dot(s,176,64);hl(s,176,64,230,64);
  hl(s,50,64,50,94);hl(s,50,94,66,94);zg(s,66,94,160,94);hl(s,160,94,176,94);hl(s,176,94,176,64);
  hv(s,18,52,40,52,GRN,1.6);ht(s,14,46,'I',GRN,'middle',13);ht(s,150,36,'Ig',INK,'middle',13);ht(s,113,120,'S: I − Ig',INK,'middle',13);
  ht(s,12,150,'Voltmeter: resistance in series',HI,'start',14);
  hl(s,14,196,46,196);zg(s,46,196,140,196);ht(s,93,178,'Rₛ',INK,'middle',13);hl(s,140,196,158,196);gal(s,171,196);hl(s,184,196,230,196);
  dot(s,46,196);dot(s,184,196);hl(s,46,196,46,224);hl(s,184,196,184,224);hv(s,184,224,46,224,DIM,1.2);hv(s,46,224,184,224,DIM,1.2);ht(s,115,244,'V across both',DIM,'middle',13);
  cp(s,262,'S = Ig G/(I − Ig)|Rₛ = V/Ig − G');return fin(s)}
function cerc(){const s=hs(300,230,'Charging and discharging of a capacitor through a resistor. The charge on a charging capacitor rises as one minus e to the power minus t over tau and reaches 63 percent at t equal to tau. A discharging capacitor loses charge as e to the power minus t over tau and keeps 37 percent at t equal to tau.');
  hv(s,70,140,288,140,DIM,1.4);hv(s,70,140,70,16,DIM,1.4);ht(s,288,158,'t',INK,'end',14);ht(s,64,22,'q',INK,'end',14);
  const X=t=>70+t*42,Y=v=>140-v*100;let a='',b='';for(let t=0;t<=5.01;t+=.1){a+=(t?'L':'M')+X(t)+' '+Y(1-Math.exp(-t));b+=(t?'L':'M')+X(t)+' '+Y(Math.exp(-t))}
  hl(s,70,Y(1),280,Y(1),DIM,'2 4');ht(s,64,Y(1)+5,'Q₀',INK,'end',13);pth(s,a,HI,2);pth(s,b,BLUE,2);
  hl(s,X(1),Y(.632),X(1),140,DIM,'4 3');hl(s,70,Y(.632),X(1),Y(.632),DIM,'4 3');hl(s,70,Y(.368),X(1),Y(.368),DIM,'4 3');
  ht(s,X(1),156,'τ',INK,'middle',14);ht(s,64,Y(.632)+5,'63 %',HI,'end',12);ht(s,64,Y(.368)+5,'37 %',BLUE,'end',12);
  ht(s,226,Y(.78),'charging',HI,'middle',13);ht(s,190,Y(.12)-12,'discharging',BLUE,'middle',13);
  cp(s,196,'τ = RC; q = Q₀(1 − e^(−t/τ)) or Q₀e^(−t/τ)|half left after 0.693τ');return fin(s)}


/* Dual nature (JEE): photocell, I-V curves, K-f graph, de Broglie wavelength lines, Davisson-Germer */
function dnpe(){const s=hs(300,230,'Photoelectric effect set-up. Light of frequency f falls on the emitter plate inside an evacuated tube. Photoelectrons leave it and reach the collector plate. A variable battery and a microammeter are connected between the plates. The current is zero when the retarding voltage equals the stopping potential.');
  mk(s,'rect',{x:60,y:36,width:170,height:90,rx:18,fill:'none',stroke:DIM,'stroke-width':1.6});
  hl(s,100,56,100,106,INK);hl(s,104,56,104,106,INK);hl(s,196,56,196,106,INK);hl(s,200,56,200,106,INK);
  ht(s,102,28,'emitter',INK,'middle',12);ht(s,198,28,'collector',INK,'middle',12);
  hv(s,14,40,92,70,HI,2);ht(s,22,34,'light  f',HI,'start',13);
  for(const y of [66,82,98])hv(s,112,y,186,y+(y-82)/6,BLUE,1.4);ht(s,150,112,'e⁻',BLUE,'middle',13);
  hl(s,102,106,102,170);hl(s,198,106,198,170);hl(s,102,170,128,170);hl(s,172,170,198,170);
  mk(s,'circle',{cx:150,cy:170,r:20,fill:'none',stroke:INK,'stroke-width':1.4});ht(s,150,176,'μA',INK,'middle',13);
  hl(s,102,170,102,196);hl(s,198,170,198,196);hl(s,102,196,134,196);hl(s,166,196,198,196);
  hl(s,134,186,134,206);hl(s,142,192,142,200);hl(s,150,186,150,206);hl(s,158,192,158,200);hl(s,166,186,166,206);
  ht(s,150,224,'variable voltage V',DIM,'middle',12);
  cp(s,238,'hf = φ + Kmax|no emission below f₀; current ∝ intensity; no time lag');return fin(s)}
function dniv(){const s=hs(300,230,'Photocurrent against collector voltage. Three curves. Curve 1 and curve 2 use the same frequency, so they stop at the same negative voltage, but curve 2 has twice the intensity and a plateau twice as high. Curve 3 has a higher frequency, so it stops at a more negative voltage, with the same plateau as curve 1.');
  hv(s,30,150,290,150,DIM,1.4);hv(s,150,176,150,16,DIM,1.4);ht(s,290,168,'V',INK,'end',14);ht(s,142,24,'I',INK,'end',14);
  const X=v=>150+v*60,Y=i=>150-i*55,cv=(V0,Is,c)=>{let d='';for(let v=-V0;v<=2.2;v+=.05){const i=Is*(1-Math.exp(-3.2*(v+V0)));d+=(d?'L':'M')+X(v)+' '+Y(i)}pth(s,d,c,2)};
  cv(1,1,BLUE);cv(1,2,HI);cv(1.9,1,GRN);
  hl(s,X(-1.9),150,X(-1.9),156,DIM);ht(s,X(-1.9),168,'−V₀′',GRN,'middle',12);ht(s,X(-1),168,'−V₀',INK,'middle',12);
  dsh(s,150,Y(1),X(2.2),Y(1));dsh(s,150,Y(2),X(2.2),Y(2));ht(s,144,Y(1)+4,'Is',INK,'end',12);ht(s,144,Y(2)+4,'2Is',INK,'end',12);
  ht(s,236,Y(2)-6,'1: f, I',BLUE,'middle',12);ht(s,236,Y(2)+16,'2: f, 2I',HI,'middle',12);ht(s,236,Y(1)+14,'3: higher f',GRN,'middle',12);
  cp(s,190,'same f: same V₀, plateau ∝ intensity|higher f: larger V₀ (same photon rate: same plateau)');return fin(s)}
function dnkf(){const s=hs(300,230,'Graph of the maximum kinetic energy against frequency. Straight lines for two metals, parallel with the same slope h. The line cuts the frequency axis at the threshold frequency f0, and its extension cuts the energy axis at minus the work function. The metal with the smaller work function has its line to the left.');
  hv(s,40,140,290,140,DIM,1.4);hv(s,80,176,80,16,DIM,1.4);ht(s,290,158,'f',INK,'end',14);ht(s,72,22,'Kmax (or V₀)',INK,'end',13);
  const m=.62;hl(s,110,140,260,140-m*150,BLUE);hl(s,110,140,86,140+m*24,BLUE,'4 3');
  hl(s,150,140,260,140-m*110,HI);hl(s,150,140,126,140+m*24,HI,'4 3');
  ht(s,110,156,'f₀',BLUE,'middle',13);ht(s,150,156,'f₀′',HI,'middle',13);ht(s,70,140+m*24+4,'−φ',BLUE,'end',13);
  ht(s,258,140-m*150-8,'metal 1',BLUE,'end',12);ht(s,262,140-m*110+22,'metal 2 (larger φ)',HI,'end',12);
  const sx=200,sy=140-m*(sx-110);hl(s,sx,sy,sx+40,sy,DIM,'3 3');hl(s,sx+40,sy,sx+40,sy-m*40,DIM,'3 3');ht(s,sx-8,sy-22,'slope = h',INK,'end',12);
  cp(s,196,'Kmax = hf − φ; V₀ = (h/e) f − φ/e|slope h (or h/e) is the same for every metal; f-intercept f₀');return fin(s)}
function dnlam(){const s=hs(300,230,'Graph of the de Broglie wavelength in angstrom against one over the square root of the accelerating voltage. Straight lines through the origin. The electron line has slope 12.27, the proton 0.286 and the alpha particle 0.101 angstrom volt to the half.');
  hv(s,50,150,290,150,DIM,1.4);hv(s,50,150,50,16,DIM,1.4);ht(s,290,168,'1/√V',INK,'end',14);ht(s,44,24,'λ (Å)',INK,'end',14);
  hl(s,50,150,250,28,BLUE);ht(s,252,30,'electron: slope 12.27',BLUE,'end',12);
  hl(s,50,150,250,134,HI);ht(s,252,126,'proton: 0.286',HI,'end',12);
  hl(s,50,150,250,142,GRN);ht(s,252,162,'α particle: 0.101',GRN,'end',12);
  cp(s,184,'λ = h/√(2mqV) = k/√V|same V: λ ∝ 1/√(mq); same K: λ ∝ 1/√m; same p: same λ');return fin(s)}
function dndg(){const s=hs(300,230,'Davisson and Germer experiment. An electron gun accelerates electrons through 54 volt towards a nickel crystal. A movable detector on an arc records the scattered electrons. The intensity is greatest at a scattering angle of 50 degrees. The Bragg glancing angle is 65 degrees.');
  mk(s,'rect',{x:20,y:84,width:44,height:26,rx:4,fill:'none',stroke:INK,'stroke-width':1.4});ht(s,42,102,'gun',INK,'middle',12);ht(s,42,128,'54 V',DIM,'middle',12);
  hv(s,64,97,138,97,BLUE,2);mk(s,'rect',{x:138,y:70,width:16,height:54,fill:'#17314f',stroke:BLUE,'stroke-width':1.6});ht(s,146,142,'Ni crystal',INK,'middle',12);
  arcp(s,146,97,92,0,150,DIM,1.1);hv(s,154,97,154+90*Math.sin(50*Math.PI/180),97-90*Math.cos(50*Math.PI/180),HI,2);
  mk(s,'rect',{x:154+90*Math.sin(50*Math.PI/180)-6,y:97-90*Math.cos(50*Math.PI/180)-14,width:16,height:16,rx:3,fill:'none',stroke:INK,'stroke-width':1.4,transform:'rotate(50 '+(154+90*Math.sin(50*Math.PI/180))+' '+(97-90*Math.cos(50*Math.PI/180))+')'});
  ht(s,250,28,'detector',INK,'middle',12);arcp(s,154,97,34,90,140,INK,1.3);ht(s,206,112,'φ = 50°',INK,'middle',13);
  hl(s,154,97,240,97,DIM,'4 3');
  cp(s,170,'peak at φ = 50° for 54 V: 2d sinθ = λ, θ = 65°, d = 0.091 nm|λ = 0.165 nm; de Broglie 12.27/√54 = 0.167 nm; φ = 180° − 2θ');return fin(s)}
const XF={};
/* >>> FIGS mag: the chapter author adds figure functions here and registers them with Object.assign(XF,{...}) */
function mgwire(){const s=hs(300,230,'Magnetic field of a long straight wire. The current comes out of the page. The field lines are concentric circles around the wire, drawn anticlockwise, and they are closer together near the wire. The field falls as one over the distance.');
  const cx=120,cy=88;for(const r of [24,46,68])mk(s,'circle',{cx,cy,r,fill:'none',stroke:DIM,'stroke-width':1.2});
  dot(s,cx,cy,HI,4);mk(s,'circle',{cx,cy,r:9,fill:'none',stroke:HI,'stroke-width':1.5});
  for(const r of [46,68])for(const a of [45,135,225,315]){const q=a*Math.PI/180,x=cx+r*Math.cos(q),y=cy-r*Math.sin(q),tx=-Math.sin(q),ty=-Math.cos(q);hv(s,x-7*tx,y-7*ty,x+7*tx,y+7*ty,BLUE,1.8)}
  ht(s,210,40,'I out of page',HI,'start',12);ht(s,210,60,'B along circles',BLUE,'start',12);
  dsh(s,cx,cy,cx-48,cy+48);ht(s,cx-34,cy+30,'r',INK,'end',13);
  cp(s,178,'B = μ₀I/(2πr), so B ∝ 1/r|right-hand rule: thumb along I, fingers curl along B');return fin(s)}
function mgsol(){const s=hs(300,230,'Solenoid. A long coil of closely wound turns carries a current. Inside, the field is uniform and along the axis. Outside, the return field lines are spread out and weak.');
  hl(s,46,60,224,60);hl(s,46,120,224,120);for(let i=0;i<10;i++){const x=50+i*18;hl(s,x,58,x+8,122,INK)}
  for(const y of [76,90,104])hv(s,64,y,206,y,BLUE,2);
  pth(s,'M228 90 C 292 90 292 14 138 14 C -14 14 -14 90 34 90',DIM,1.2);pth(s,'M228 90 C 292 90 292 166 138 166 C -14 166 -14 90 34 90',DIM,1.2);
  hv(s,26,90,38,90,DIM,1.2);ht(s,135,134,'B = μ₀nI inside',BLUE,'middle',12);
  ht(s,135,36,'weak outside',DIM,'middle',12);ht(s,135,156,'n = N/L turns per metre',DIM,'middle',12);
  cp(s,190,'inside: B = μ₀nI, uniform; at an end: B = μ₀nI/2|outside a long solenoid: B ≈ 0');return fin(s)}
function mghel(){const s=hs(300,230,'Helical path of a charged particle. The velocity makes an angle theta with a uniform magnetic field. The component along the field is unchanged and the component across it turns the particle in a circle, so the path is a helix with pitch p.');
  const X=t=>40+7*t+22*Math.cos(t),Y=t=>92+34*Math.sin(t);let d='';for(let t=0;t<=6*Math.PI+.01;t+=.15)d+=(d?'L':'M')+X(t).toFixed(1)+' '+Y(t).toFixed(1);pth(s,d,HI,2);
  dsh(s,24,92,270,92);hv(s,160,170,260,170,BLUE,2);ht(s,268,174,'B',BLUE,'start',14);
  const x1=40+7*Math.PI/2,x2=x1+14*Math.PI;dsh(s,x1,126,x1,150);dsh(s,x2,126,x2,150);dim(s,x1,146,x2,146,'pitch',(x1+x2)/2,164);
  ht(s,150,18,'r = mv sinθ/(qB)',INK,'middle',13);ht(s,150,38,'v∥ = v cosθ along B',INK,'middle',13);
  cp(s,196,'p = 2πm v cosθ/(qB), period T = 2πm/(qB)|v cosθ is not changed by B; v sinθ goes round a circle');return fin(s)}
function mgvs(){const s=hs(300,230,'Velocity selector. A positive charge moves to the right between two plates. The electric field points down, giving a downward force qE. The magnetic field points into the page, giving an upward force qvB. When the two are equal the particle goes straight.');
  hl(s,50,44,250,44,INK);hl(s,50,134,250,134,INK);ht(s,40,48,'+',RED,'end',14);ht(s,40,138,'−',BLUE,'end',14);
  for(const x of [80,120,180,220])hv(s,x,50,x,76,GRN,1.6);ht(s,258,66,'E',GRN,'start',13);
  for(const x of [80,120,180,220]){hl(s,x-4,106,x+4,114,BLUE);hl(s,x+4,106,x-4,114,BLUE)}ht(s,258,116,'B in',BLUE,'start',13);
  hv(s,14,92,150,92,DIM,1.6);hv(s,150,92,286,92,DIM,1.6);dot(s,150,92,HI,5);ht(s,22,86,'v',INK,'start',13);
  hv(s,150,96,150,122,RED,2);ht(s,158,120,'qE',RED,'start',12);hv(s,150,88,150,62,GRN,2);ht(s,158,68,'qvB',GRN,'start',12);
  cp(s,164,'straight path when qE = qvB, so v = E/B|the answer does not depend on the charge or the mass');return fin(s)}
function mgbar(){const s=hs(300,230,'Bar magnet. Field lines leave the north pole, loop round outside and enter the south pole. The magnetic moment points from south to north. On the axis the field is along the moment and is twice as large as at the same distance on the equatorial line, where it is opposite to the moment.');
  mk(s,'rect',{x:100,y:88,width:50,height:24,fill:'none',stroke:BLUE,'stroke-width':1.6});mk(s,'rect',{x:150,y:88,width:50,height:24,fill:'none',stroke:RED,'stroke-width':1.6});
  ht(s,125,105,'S',BLUE,'middle',14);ht(s,175,105,'N',RED,'middle',14);
  pth(s,'M200 100 C 262 100 262 40 150 40 C 38 40 38 100 100 100',DIM,1.2);pth(s,'M200 100 C 262 100 262 160 150 160 C 38 160 38 100 100 100',DIM,1.2);
  hv(s,156,40,142,40,DIM,1.3);hv(s,156,160,142,160,DIM,1.3);
  hv(s,110,128,190,128,HI,2);ht(s,150,146,'m',HI,'middle',13);
  dot(s,268,100,INK,3);ht(s,268,88,'P axial',INK,'middle',12);dsh(s,200,100,268,100);
  dot(s,150,66,INK,3);dsh(s,150,88,150,66);ht(s,160,64,'Q equatorial',INK,'start',12);
  cp(s,184,'axial: B = (μ₀/4π)(2m/r³), along m|equatorial: B = (μ₀/4π)(m/r³), opposite to m');return fin(s)}
function mgearth(){const s=hs(300,230,'Earth magnetic field components. The total field B points downwards at the angle of dip delta below the horizontal. Its horizontal component is BH and its vertical component is BV.');
  hv(s,50,76,205,76,BLUE,2);hv(s,205,76,205,185,GRN,2);hv(s,50,76,205,185,HI,2);dsh(s,50,76,50,40);
  ht(s,128,68,'BH',BLUE,'middle',14);ht(s,214,134,'BV',GRN,'start',14);ht(s,112,142,'B',HI,'end',14);
  arcp(s,50,76,44,90,125,INK,1.3);ht(s,100,100,'δ',INK,'middle',14);ht(s,50,32,'horizontal plane, magnetic meridian',DIM,'start',12);
  cp(s,214,'BH = B cos δ, BV = B sin δ, tan δ = BV/BH|B = √(BH² + BV²)');return fin(s)}
Object.assign(XF,{mgwire,mgsol,mghel,mgvs,mgbar,mgearth});
/* <<< FIGS mag */

/* >>> FIGS emi: the chapter author adds figure functions here and registers them with Object.assign(XF,{...}) */
function eifar(){const s=hs(300,230,'A square loop in a magnetic field pointing into the page. The field is increasing. By Lenz law the induced current flows anticlockwise so that its own field points out of the page and opposes the increase.');
  for(let x=70;x<=230;x+=40)for(let y=34;y<=124;y+=30)ht(s,x,y+5,'×',DIM,'middle',16);
  mk(s,'rect',{x:100,y:50,width:100,height:70,fill:'none',stroke:BLUE,'stroke-width':2});
  hv(s,140,120,166,120,HI,2);hv(s,200,95,200,75,HI,2);hv(s,160,50,134,50,HI,2);hv(s,100,75,100,95,HI,2);
  ht(s,150,92,'I (induced)',HI,'middle',12);ht(s,240,28,'B in, growing',INK,'middle',12);
  cp(s,158,'ε = −dΦ/dt; Φ = BA cosθ|Lenz: induced current opposes the change; flux in is growing, so I is anticlockwise (its field points out)');return fin(s)}
function eirail(){const s=hs(300,230,'A conducting rod of length l slides to the right with speed v on two horizontal rails joined by a resistor R, in a magnetic field into the page. The induced emf is B l v. The current in the rod flows upward in the figure and the magnetic force on the rod points left, opposing the motion.');
  for(let x=90;x<=250;x+=40)for(let y=62;y<=116;y+=27)ht(s,x,y+5,'×',DIM,'middle',15);
  hl(s,40,40,260,40,INK);hl(s,40,140,260,140,INK);hl(s,40,40,40,76,INK);hl(s,40,104,40,140,INK);
  mk(s,'rect',{x:32,y:76,width:16,height:28,fill:'none',stroke:INK,'stroke-width':1.4});ht(s,26,94,'R',INK,'end',13);
  hl(s,160,34,160,146,BLUE);hl(s,162,34,162,146,BLUE);
  hv(s,172,90,226,90,GRN,2);ht(s,214,80,'v',GRN,'middle',14);
  hv(s,150,120,150,60,HI,2);ht(s,142,96,'I',HI,'end',13);
  hv(s,150,158,106,158,RED,2);ht(s,128,176,'F = B²l²v/R',RED,'middle',12);
  dim(s,276,40,276,140,'l',286,94);
  cp(s,196,'ε = Blv; I = Blv/R|force on the rod F = BIl = B²l²v/R opposes v; power P = Fv = B²l²v²/R');return fin(s)}
function eirl(){const s=hs(300,230,'Current against time in an RL circuit. On connecting the battery the current grows as one minus e to the minus t over tau towards E over R, reaching sixty three percent after one time constant. On removing the battery the current decays as e to the minus t over tau, reaching thirty seven percent after one time constant.');
  hv(s,44,160,290,160,DIM,1.4);hv(s,50,170,50,16,DIM,1.4);ht(s,290,178,'t',INK,'end',14);ht(s,44,24,'I',INK,'end',14);
  const X=t=>50+t*50,Y=f=>160-f*120;let a='',b='';
  for(let t=0;t<=4.6;t+=.1){a+=(a?'L':'M')+X(t)+' '+Y(1-Math.exp(-t));b+=(b?'L':'M')+X(t)+' '+Y(Math.exp(-t))}
  pth(s,a,HI,2);pth(s,b,BLUE,2);dsh(s,50,Y(1),X(4.6),Y(1));ht(s,44,Y(1)+4,'E/R',INK,'end',12);
  dsh(s,X(1),Y(.632),X(1),160);dsh(s,50,Y(.632),X(1),Y(.632));dsh(s,50,Y(.368),X(1),Y(.368));
  ht(s,X(1),176,'τ',INK,'middle',13);ht(s,46,Y(.632)+4,'63 %',HI,'end',11);ht(s,46,Y(.368)+4,'37 %',BLUE,'end',11);
  ht(s,X(3),Y(.82),'growth',HI,'middle',13);ht(s,X(2.4),Y(.2),'decay',BLUE,'middle',13);
  cp(s,196,'τ = L/R; I = (E/R)(1 − e^(−t/τ)) or I₀e^(−t/τ)|at t = 0 an inductor acts like a break; at t = ∞ like a plain wire');return fin(s)}
function eirlc(){const s=hs(300,230,'Resonance curves of a series LCR circuit. Current against frequency has a peak E over R at the resonant frequency f0. A larger resistance gives a lower and wider curve. At the half power points f1 and f2 the current falls to one over root two of the peak. The bandwidth is f2 minus f1.');
  hv(s,30,160,290,160,DIM,1.4);hv(s,40,170,40,16,DIM,1.4);ht(s,290,178,'f',INK,'end',14);ht(s,34,24,'I',INK,'end',14);
  const X=x=>40+(x-.5)*160,cv=(Q,c)=>{let d='';for(let x=.5;x<=1.5;x+=.01){const i=1/Math.sqrt(1+Q*Q*Math.pow(x-1/x,2));d+=(d?'L':'M')+X(x)+' '+(160-i*130)}pth(s,d,c,2)};
  cv(8,HI);cv(3,BLUE);
  dsh(s,X(1),30,X(1),160);ht(s,X(1),176,'f₀',INK,'middle',13);ht(s,X(1)-6,26,'E/R',INK,'end',12);
  const y=160-130*.7071;dsh(s,40,y,X(1.07),y);ht(s,36,y+4,'0.707',DIM,'end',11);
  const f1=X(1-.0625),f2=X(1+.0625);dsh(s,f1,y,f1,160);dsh(s,f2,y,f2,160);ht(s,f1-2,176,'f₁',INK,'end',12);ht(s,f2+2,176,'f₂',INK,'start',12);
  ht(s,X(1.2),60,'small R, large Q',HI,'start',12);ht(s,X(1.2),130,'large R, small Q',BLUE,'start',12);
  cp(s,196,'f₀ = 1/(2π√(LC)); Q = ω₀L/R = f₀/(f₂ − f₁)|at resonance Z = R, I is maximum and in phase with E');return fin(s)}
function eiphas(){const s=hs(300,230,'Phasor diagram of a series LCR circuit with inductive reactance larger than capacitive. The resistor voltage is along the current, the inductor voltage leads by ninety degrees upward, the capacitor voltage lags by ninety degrees downward. The supply voltage is the sum and leads the current by angle phi, with tan phi equal to VL minus VC over VR.');
  const ox=40,oy=120;
  hv(s,ox,oy,ox+130,oy,BLUE,2);ht(s,ox+60,oy+16,'V_R (along I)',BLUE,'middle',12);
  hv(s,ox+130,oy,ox+130,oy-90,GRN,2);ht(s,ox+138,oy-60,'V_L',GRN,'start',13);
  hv(s,ox+130,oy,ox+130,oy+45,RED,2);ht(s,ox+138,oy+40,'V_C',RED,'start',13);
  hv(s,ox,oy,ox+130,oy-45,HI,2);ht(s,ox+52,oy-40,'V',HI,'end',14);
  arcp(s,ox,oy,50,71,90,INK,1.3);ht(s,ox+66,oy-8,'φ',INK,'middle',14);
  ht(s,ox+138,oy-18,'V_L − V_C',DIM,'start',11);
  cp(s,196,'V² = V_R² + (V_L − V_C)²; tan φ = (V_L − V_C)/V_R|L leads I by 90°, C lags I by 90°; Z = √(R² + (X_L − X_C)²)');return fin(s)}
Object.assign(XF,{eifar,eirail,eirl,eirlc,eiphas});
/* <<< FIGS emi */

/* >>> FIGS atoms: the chapter author adds figure functions here and registers them with Object.assign(XF,{...}) */
function anscat(){const s=hs(300,240,'Alpha particle scattering from a gold nucleus. Three alpha particles come from the left. One aimed straight at the nucleus stops at the distance of closest approach r0 and turns back. One with impact parameter b is deflected through a large angle. One far from the axis is hardly deflected.');
  dot(s,150,100,HI,6);ht(s,150,134,'nucleus +Ze',HI,'middle',12);
  hv(s,14,100,108,100,BLUE,1.8);hl(s,108,103,24,103,BLUE);hv(s,60,103,30,103,BLUE,1.4);ht(s,20,120,'α',BLUE,'start',13);
  pth(s,'M14 62Q150 62 262 14',GRN,1.8);hv(s,236,26,262,14,GRN,1.8);
  dsh(s,40,62,40,100);ht(s,34,84,'b',INK,'end',13);
  pth(s,'M14 28Q190 28 280 8',DIM,1.6);ht(s,100,47,'large b: small angle',DIM,'middle',11);
  dsh(s,108,100,150,100);ht(s,128,92,'r₀',INK,'middle',13);
  cp(s,176,'closest approach (head-on): K = {2Ze²}/{4πε₀r₀}|b = (r₀/2) cot(θ/2); b = 0 gives θ = 180°');return fin(s)}
function anorb(){const s=hs(300,240,'Bohr orbits of hydrogen. Three circles around the nucleus with radii in the ratio 1 to 4 to 9 for n equal to 1, 2 and 3. The electron is shown on each. Radius grows as n squared, speed falls as 1 over n and the energy rises towards zero as minus 13.6 over n squared.');
  const cx=96,cy=96;dot(s,cx,cy,HI,4);
  [[9,'n = 1',200],[36,'n = 2',300],[81,'n = 3',40]].forEach(([r,l,a])=>{mk(s,'circle',{cx,cy,r,fill:'none',stroke:DIM,'stroke-width':1.3});const [x,y]=[cx+r*Math.cos(a*Math.PI/180),cy-r*Math.sin(a*Math.PI/180)];dot(s,x,y,BLUE,3.5)});
  ht(s,cx+14,cy+4,'1',INK,'start',11);ht(s,cx+36+2,cy+4,'4',INK,'start',11);ht(s,cx+81-14,cy+4,'9',INK,'end',11);
  hl(s,cx,cy,cx+81,cy,DIM,'3 3');
  ht(s,196,34,'r = 0.529 n²/Z Å',INK,'start',12);ht(s,196,56,'v = 2.19×10⁶ Z/n',INK,'start',12);ht(s,196,78,'(m/s)',INK,'start',12);
  ht(s,196,102,'E = −13.6 Z²/n²',HI,'start',12);ht(s,196,124,'(eV)',HI,'start',12);ht(s,196,148,'L = n h/2π',GRN,'start',12);
  cp(s,196,'radius in the ratio 1 : 4 : 9 (n = 1, 2, 3)|v ∝ Z/n, T ∝ n³/Z², E ∝ −Z²/n²');return fin(s)}
function anlev(){const s=hs(300,240,'Energy levels of hydrogen (heights not to scale) with energy in electron volt: n equals 1 at minus 13.6, n equals 2 at minus 3.4, n equals 3 at minus 1.51, and the levels crowd together towards zero. Arrows end on n equals 1 for the Lyman series, on n equals 2 for the Balmer series and on n equals 3 for the Paschen series.');
  const Y=n=>[0,170,92,64,48,38][n];
  hl(s,90,26,196,26,DIM,'4 3');ht(s,86,30,'∞',INK,'end',12);ht(s,200,30,'0',INK,'start',11);
  [1,2,3,4,5].forEach(n=>{hl(s,90,Y(n),196,Y(n),INK);if(n<4)ht(s,86,Y(n)+4,'n='+n,INK,'end',12)});
  ht(s,86,Y(4)+4,'n=4',INK,'end',11);ht(s,86,Y(5)+4,'n=5',INK,'end',11);
  ht(s,200,Y(1)+4,'−13.6',INK,'start',11);ht(s,200,Y(2)+4,'−3.4',INK,'start',11);ht(s,200,Y(3)+4,'−1.51',INK,'start',11);
  hv(s,112,Y(5),112,Y(1)-3,BLUE,1.8);hv(s,148,Y(5),148,Y(2)-3,HI,1.8);hv(s,176,Y(5),176,Y(3)-3,GRN,1.8);
  ht(s,264,Y(1)-14,'Lyman',BLUE,'middle',12);ht(s,264,Y(1)-1,'(UV)',BLUE,'middle',11);
  ht(s,264,Y(2)-14,'Balmer',HI,'middle',12);ht(s,264,Y(2)-1,'(visible)',HI,'middle',11);
  ht(s,264,Y(3)-14,'Paschen',GRN,'middle',12);ht(s,264,Y(3)-1,'(infrared)',GRN,'middle',11);
  cp(s,198,'En = −13.6/n² eV; series end on n = 1, 2, 3|1/λ = R(1/n₁² − 1/n₂²), R = 1.097×10⁷ m⁻¹');return fin(s)}
function anbe(){const s=hs(300,240,'Binding energy per nucleon plotted against mass number. The curve rises steeply for light nuclei, with a peak at helium 4, reaches a broad maximum of about 8.8 mega electron volt near iron 56, and falls slowly to about 7.6 for uranium 238. Fusion of light nuclei and fission of heavy nuclei both move towards the peak.');
  const X=a=>50+a*.96,Y=e=>176-e*15;
  hv(s,50,176,290,176,DIM,1.3);hv(s,50,176,50,24,DIM,1.3);ht(s,290,194,'A',INK,'end',13);ht(s,56,20,'BE/A (MeV)',INK,'start',12);
  [[1,0],[2,1.11],[3,2.57],[4,7.07],[6,5.33],[12,7.68],[16,7.98],[28,8.45],[56,8.79],[90,8.7],[120,8.5],[160,8.1],[200,7.85],[238,7.6]].forEach(([a,e],i,arr)=>{});
  pth(s,'M'+X(2)+' '+Y(1.11)+'L'+X(3)+' '+Y(2.57)+'L'+X(4)+' '+Y(7.07)+'L'+X(6)+' '+Y(5.33)+'L'+X(12)+' '+Y(7.68)+'L'+X(16)+' '+Y(7.98)+'L'+X(28)+' '+Y(8.45)+'L'+X(56)+' '+Y(8.79)+'L'+X(90)+' '+Y(8.7)+'L'+X(120)+' '+Y(8.5)+'L'+X(160)+' '+Y(8.1)+'L'+X(200)+' '+Y(7.85)+'L'+X(238)+' '+Y(7.6),BLUE,2);
  dsh(s,50,Y(8.79),X(56),Y(8.79));ht(s,46,Y(8.79)+4,'8.8',INK,'end',11);
  dot(s,X(56),Y(8.79),HI,4);ht(s,X(56)+4,Y(8.79)-8,'Fe-56',HI,'start',12);
  dot(s,X(4),Y(7.07),GRN,3.5);ht(s,X(4)+6,Y(7.07)-4,'He-4',GRN,'start',11);
  dot(s,X(2),Y(1.11),INK,3);ht(s,X(2)+6,Y(1.11)+12,'H-2',INK,'start',11);
  dot(s,X(238),Y(7.6),INK,3);ht(s,X(238),Y(7.6)+16,'U-238 (7.6)',INK,'end',11);
  hv(s,X(8),Y(3.5),X(40),Y(3.5),GRN,1.6);ht(s,X(24),Y(3.5)-6,'fusion',GRN,'middle',12);
  hv(s,X(236),Y(5.2),X(160),Y(5.2),RED,1.6);ht(s,X(198),Y(5.2)-6,'fission',RED,'middle',12);
  cp(s,214,'peak near A = 56; energy is released when nuclei move towards the peak|Q = Σ(BE of products) − Σ(BE of reactants)');return fin(s)}
function andec(){const s=hs(300,240,'Radioactive decay curve. The number of nuclei N falls exponentially with time. After one half-life it is N0 over 2, after two half-lives N0 over 4 and after three half-lives N0 over 8. At the mean life tau equal to 1.44 half-lives, N is N0 over e, about 37 percent.');
  const X=t=>50+t*68,Y=n=>176-n*130;
  hv(s,50,176,280,176,DIM,1.3);hv(s,50,176,50,24,DIM,1.3);ht(s,280,194,'t',INK,'end',13);ht(s,44,28,'N',INK,'end',13);
  let d='';for(let t=0;t<=3.4;t+=.1)d+=(d?'L':'M')+X(t)+' '+Y(Math.pow(.5,t));pth(s,d,BLUE,2);
  [[1,'N₀/2'],[2,'N₀/4'],[3,'N₀/8']].forEach(([k,l])=>{const n=Math.pow(.5,k);dsh(s,50,Y(n),X(k),Y(n));dsh(s,X(k),Y(n),X(k),176);dot(s,X(k),Y(n),HI,3.5);ht(s,46,Y(n)+4,l,INK,'end',11);ht(s,X(k),190,k+'T',INK,'middle',12)});
  ht(s,46,Y(1)+4,'N₀',INK,'end',11);
  const tt=1/Math.LN2;dot(s,X(tt),Y(Math.exp(-1)),GRN,3.5);dsh(s,X(tt),Y(Math.exp(-1)),X(tt),176);ht(s,X(tt)+8,Y(Math.exp(-1))-6,'τ: N₀/e',GRN,'start',12);
  cp(s,208,'N = N₀e^(−λt) = N₀/2^(t/T); T = 0.693/λ, τ = 1/λ = 1.44 T|activity A = λN falls in the same way');return fin(s)}
Object.assign(XF,{anscat,anorb,anlev,anbe,andec});
/* <<< FIGS atoms */

/* >>> FIGS devices: the chapter author adds figure functions here and registers them with Object.assign(XF,{...}) */
const edw=(s,x0,y0,per,A,n,mode,c)=>{let d='';for(let x=0;x<=n*per;x+=2){let v=Math.sin(2*Math.PI*x/per);if(mode===1)v=Math.max(v,0);if(mode===2)v=Math.abs(v);d+=(x?'L':'M')+(x0+x)+' '+(y0-A*v)}return pth(s,d,c,2)};
const edax=(s,x0,y0,per,A,n)=>{hv(s,x0-8,y0,x0+n*per+16,y0,DIM,1.2);hv(s,x0,y0+A+8,x0,y0-A-12,DIM,1.2);ht(s,x0+n*per+16,y0+14,'t',INK,'end',12)};
const edres=(s,x,y,h)=>mk(s,'rect',{x:x-6,y,width:12,height:h,fill:'none',stroke:INK,'stroke-width':1.4});
const eddio=(s,x,y,c=INK)=>{mk(s,'polygon',{points:`${x},${y-8} ${x},${y+8} ${x+22},${y}`,fill:'none',stroke:c,'stroke-width':1.4});hl(s,x+22,y-8,x+22,y+8,c)};
function edband(){const s=hs(320,230,'Energy bands of three kinds of solids. Conductor: the valence band and conduction band overlap. Semiconductor: a small gap, about 1 electron volt for silicon. Insulator: a wide gap, more than 3 electron volt.');
  const P=[[14,'conductor','ρ < 10⁻⁵ Ω m'],[116,'semiconductor','10⁻⁵ to 10⁶ Ω m'],[218,'insulator','ρ > 10⁸ Ω m']],W=88,B=[[[30,85],[75,140]],[[30,65],[105,140]],[[30,45],[125,140]]];
  P.forEach(([x,n,r],k)=>{ht(s,x+W/2,20,n,INK,'middle',13);const [cb,vb]=B[k];
    mk(s,'rect',{x,y:cb[0],width:W,height:cb[1]-cb[0],fill:BLUE,'fill-opacity':.22,stroke:BLUE,'stroke-width':1.4});
    mk(s,'rect',{x,y:vb[0],width:W,height:vb[1]-vb[0],fill:HI,'fill-opacity':.22,stroke:HI,'stroke-width':1.4});
    ht(s,x+6,cb[0]+13,'CB',BLUE,'start',11);ht(s,x+6,vb[1]-6,'VB',HI,'start',11);ht(s,x+W/2,156,r,DIM,'middle',10.5);
    if(k===0)ht(s,x+W/2+8,83,'overlap',INK,'middle',10);
    else{const m=(cb[1]+vb[0])/2;hv(s,x+10,m,x+10,cb[1]+1,DIM,1.1);hv(s,x+10,m,x+10,vb[0]-1,DIM,1.1);ht(s,x+20,m+4,k===1?'Eg ≈ 1 eV':'Eg > 3 eV',INK,'start',11)}});
  cp(s,178,'Eg = gap from top of VB to bottom of CB|Si 1.1 eV, Ge 0.67 eV');return fin(s)}
function edpn(){const s=hs(320,230,'A p-n junction. The p side on the left has holes and negative acceptor ions. The n side on the right has free electrons and positive donor ions. In the middle is the depletion layer, about one micrometre wide, which has only fixed ions. The built-in electric field points from the n side to the p side.');
  mk(s,'rect',{x:20,y:40,width:110,height:70,fill:RED,'fill-opacity':.1,stroke:DIM,'stroke-width':1.3});
  mk(s,'rect',{x:190,y:40,width:110,height:70,fill:BLUE,'fill-opacity':.1,stroke:DIM,'stroke-width':1.3});
  mk(s,'rect',{x:130,y:40,width:60,height:70,fill:HI,'fill-opacity':.14,stroke:HI,'stroke-width':1.2,'stroke-dasharray':'4 3'});
  for(const [x,y] of [[42,58],[78,52],[60,82],[100,70],[92,98],[36,100],[116,92]])mk(s,'circle',{cx:x,cy:y,r:3.4,fill:'none',stroke:RED,'stroke-width':1.4});
  for(const [x,y] of [[212,56],[246,50],[228,80],[272,66],[258,98],[290,90],[210,100]])dot(s,x,y,BLUE,3);
  for(const y of [58,80,102]){pls(s,146,y,'−');pls(s,174,y,'+')}
  ht(s,75,32,'p-type',RED,'middle',13);ht(s,245,32,'n-type',BLUE,'middle',13);ht(s,160,32,'depletion',HI,'middle',12);
  ht(s,52,126,'○ holes',RED,'middle',11);ht(s,248,126,'● electrons',BLUE,'middle',11);
  hv(s,160,128,190,128,DIM,1.1);hv(s,160,128,130,128,DIM,1.1);ht(s,160,144,'width ≈ 1 μm',DIM,'middle',11);
  hv(s,186,162,134,162,HI,2);ht(s,160,178,'built-in field E (n → p)',HI,'middle',11);
  cp(s,194,'barrier potential: Si 0.7 V, Ge 0.3 V|forward bias: p to +, layer gets thinner|reverse bias: p to −, layer gets wider');return fin(s)}
function ediv(){const s=hs(320,230,'Current voltage characteristic of a p-n junction diode. For forward bias the current is negligible until about 0.7 volt for silicon, then rises sharply. For reverse bias the current is a tiny leakage of microampere size until the breakdown voltage, where it increases suddenly.');
  hv(s,30,120,296,120,DIM,1.4);hv(s,170,186,170,14,DIM,1.4);ht(s,294,136,'V',INK,'end',13);ht(s,162,22,'I',INK,'end',13);
  const X=v=>170+v*110,Y=i=>120-i*3;let d='';for(let v=0;v<=1;v+=.01){const i=.0004*(Math.exp(v/.07)-1);if(Y(i)<26)break;d+=(d?'L':'M')+X(v)+' '+Y(i)}pth(s,d,BLUE,2);
  pth(s,'M170 124L64 124Q58 140 56 176',HI,2);
  dsh(s,X(.7),120,X(.7),132);ht(s,X(.7),146,'0.7 V',INK,'middle',11);
  ht(s,178,48,'forward (mA)',BLUE,'start',12);ht(s,40,110,'reverse (μA)',HI,'start',12);
  ht(s,72,146,'−V_br',INK,'start',11);ht(s,72,164,'breakdown',HI,'start',11);
  cp(s,200,'forward: sharp rise after ≈ 0.7 V (Si)|reverse: tiny current, then breakdown');return fin(s)}
function edhw(){const s=hs(320,260,'Half wave rectifier. An alternating source, one diode and a load resistor are in series. Below the circuit, the input is a full sine wave and the output across the load has only the positive half cycles. The output has the same frequency as the input.');
  mk(s,'circle',{cx:40,cy:60,r:14,fill:'none',stroke:INK,'stroke-width':1.4});ht(s,40,65,'~',INK,'middle',16);
  hl(s,40,46,40,36);hl(s,40,36,100,36);eddio(s,100,36);hl(s,122,36,250,36);hl(s,250,36,250,46);edres(s,250,46,30);hl(s,250,76,250,90);hl(s,250,90,40,90);hl(s,40,90,40,74);
  ht(s,111,22,'diode',DIM,'middle',11);ht(s,268,66,'R',INK,'start',13);
  edax(s,40,150,120,22,2);ht(s,48,118,'input',INK,'start',12);edw(s,40,150,120,22,2,0,BLUE);
  edax(s,40,222,120,22,2);ht(s,48,190,'output across R',INK,'start',12);edw(s,40,222,120,22,2,1,HI);
  cp(s,248,'conducts in positive half cycles only|output frequency = input frequency f');return fin(s)}
function edfw(){const s=hs(320,300,'Full wave rectifier with a centre tapped transformer and two diodes. Each diode conducts in one half cycle, so the current through the load always has the same direction. Below the circuit the input is a sine wave and the output has two humps for each input cycle, so the output frequency is twice the input frequency.');
  let d='M50 20';for(let k=0;k<4;k++)d+='a10 10 0 0 1 0 20';pth(s,d,INK,1.6);
  hl(s,50,20,90,20);eddio(s,90,20);hl(s,112,20,200,20);hl(s,50,100,90,100);eddio(s,90,100);hl(s,112,100,200,100);
  hl(s,200,20,200,100);dot(s,200,60);hl(s,200,60,224,60);mk(s,'rect',{x:224,y:54,width:26,height:12,fill:'none',stroke:INK,'stroke-width':1.4});
  hl(s,250,60,262,60);hl(s,262,60,262,118);hl(s,262,118,30,118);hl(s,30,118,30,60);hl(s,30,60,50,60);dot(s,50,60);
  ht(s,101,12,'D1',INK,'middle',11);ht(s,101,92,'D2',INK,'middle',11);ht(s,237,84,'R',INK,'middle',13);ht(s,26,52,'tap',DIM,'end',10);
  edax(s,40,176,120,20,2);ht(s,48,148,'input',INK,'start',12);edw(s,40,176,120,20,2,0,BLUE);
  edax(s,40,252,120,20,2);ht(s,48,224,'output across R',INK,'start',12);edw(s,40,252,60,20,4,2,HI);
  cp(s,282,'D1 and D2 conduct in alternate half cycles|output frequency = 2 × input frequency');return fin(s)}
function edzen(){const s=hs(320,230,'Zener diode as a voltage regulator. A source with voltage V feeds a series resistor Rs. A Zener diode, reverse biased, is connected across the load resistor RL. The output voltage across the load equals the Zener voltage Vz. The current in Rs splits into the Zener current and the load current.');
  hl(s,30,60,30,40);hl(s,30,40,70,40);mk(s,'rect',{x:70,y:34,width:40,height:12,fill:'none',stroke:INK,'stroke-width':1.4});hl(s,110,40,250,40);
  hl(s,22,60,38,60);hl(s,26,68,34,68);hl(s,30,68,30,120);ht(s,18,66,'+',RED,'end',13);ht(s,90,26,'Rs',INK,'middle',13);ht(s,14,96,'V',INK,'end',13);
  hl(s,170,40,170,66);hl(s,160,66,180,66);hl(s,160,66,156,72);hl(s,180,66,184,60);mk(s,'polygon',{points:'170,66 160,88 180,88',fill:'none',stroke:INK,'stroke-width':1.4});hl(s,170,88,170,120);
  ht(s,150,86,'Zener',INK,'end',11);dot(s,170,40);dot(s,170,120);
  hl(s,250,40,250,58);edres(s,250,58,34);hl(s,250,92,250,120);ht(s,238,80,'RL',INK,'end',13);hl(s,30,120,250,120);
  hv(s,120,32,150,32,HI,1.6);ht(s,135,24,'I',HI,'middle',11);hv(s,176,92,176,102,BLUE,1.6);ht(s,192,100,'Iz',BLUE,'middle',11);hv(s,222,44,222,58,GRN,1.6);ht(s,230,56,'IL',GRN,'start',11);
  hv(s,296,80,296,42,DIM,1.1);hv(s,296,80,296,118,DIM,1.1);ht(s,302,84,'Vz',INK,'start',12);hl(s,250,40,296,40,DIM,'2 3');hl(s,250,120,296,120,DIM,'2 3');
  cp(s,146,'Vout = Vz while the Zener is in breakdown|I = Iz + IL, I = (V − Vz)/Rs, IL = Vz/RL|Iz is least for least V and greatest IL');return fin(s)}
function edgate(){const s=hs(320,300,'Symbols and outputs of five logic gates for inputs A B equal to 00, 01, 10, 11. AND gives 0 0 0 1. OR gives 0 1 1 1. NOT gives 1 0 for input 0 1. NAND gives 1 1 1 0. NOR gives 1 0 0 0. A small circle at the output means NOT.');
  ht(s,20,16,'inputs A B in order 00, 01, 10, 11 → output Y',DIM,'start',11);
  const rows=[['AND','Y = A·B','Y: 0 0 0 1'],['OR','Y = A + B','Y: 0 1 1 1'],['NOT','Y = A̅','A = 0, 1: Y = 1, 0'],['NAND','Y = NOT(A·B)','Y: 1 1 1 0'],['NOR','Y = NOT(A+B)','Y: 1 0 0 0']];
  rows.forEach(([g,e,t],k)=>{const x=44,y=40+k*46,two=g!=='NOT';
    if(g==='AND'||g==='NAND')pth(s,`M${x} ${y}h22a14 14 0 0 1 0 28h-22z`,INK,1.5);
    else if(g==='OR'||g==='NOR')pth(s,`M${x} ${y}Q${x+24} ${y} ${x+38} ${y+14}Q${x+24} ${y+28} ${x} ${y+28}Q${x+10} ${y+14} ${x} ${y}Z`,INK,1.5);
    else pth(s,`M${x} ${y}L${x} ${y+28}L${x+30} ${y+14}Z`,INK,1.5);
    const bub=g==='NOT'||g==='NAND'||g==='NOR',ox=g==='NOT'?x+30:g==='NAND'?x+36:x+38;
    if(bub){mk(s,'circle',{cx:ox+4,cy:y+14,r:4,fill:'none',stroke:INK,'stroke-width':1.5});hl(s,ox+8,y+14,ox+18,y+14)}else hl(s,ox,y+14,ox+14,y+14);
    if(two){hl(s,x-14,y+7,x+4,y+7);hl(s,x-14,y+21,x+4,y+21);ht(s,x-18,y+11,'A',INK,'end',11);ht(s,x-18,y+25,'B',INK,'end',11)}else{hl(s,x-14,y+14,x,y+14);ht(s,x-18,y+18,'A',INK,'end',11)}
    ht(s,x-34,y-4,g,HI,'start',11);ht(s,138,y+12,e,INK,'start',12);ht(s,138,y+28,t,BLUE,'start',12)});
  cp(s,276,'NAND and NOR are universal gates');return fin(s)}
Object.assign(XF,{edband,edpn,ediv,edhw,edfw,edzen,edgate});
/* <<< FIGS devices */

/* >>> FIGS skills: the chapter author adds figure functions here and registers them with Object.assign(XF,{...}) */
function xsvern(){const s=hs(330,160,'Vernier callipers scale. The main scale is in millimetres. The zero of the vernier scale lies just after the 23 mm mark. The sixth line of the vernier scale coincides with a line of the main scale. The reading is 23 mm plus 6 times 0.1 mm, which is 23.6 mm.');
  const X=m=>20+(m-20)*22,x0=X(23.6);
  mk(s,'rect',{x:14,y:38,width:300,height:36,fill:'none',stroke:DIM,'stroke-width':1.3});
  for(let m=20;m<=33;m++)hl(s,X(m),74,X(m),m%5===0?58:66);
  ht(s,X(20),52,'2 cm',INK,'middle',12);ht(s,X(30),52,'3 cm',INK,'middle',12);
  mk(s,'rect',{x:x0-8,y:74,width:214,height:34,fill:'none',stroke:BLUE,'stroke-width':1.3});
  for(let k=0;k<=10;k++)hl(s,x0+k*19.8,74,x0+k*19.8,k%5===0?98:88,BLUE);
  ht(s,x0,120,'0',BLUE,'middle',12);ht(s,x0+99,120,'5',BLUE,'middle',12);ht(s,x0+198,120,'10',BLUE,'middle',12);
  hv(s,x0,30,x0,72,HI,1.6);ht(s,x0+8,24,'vernier zero',HI,'start',11);
  hl(s,x0+118.8,56,x0+118.8,100,HI);ht(s,x0+118.8,134,'6th line coincides',HI,'middle',11);
  cp(s,156,'MSR = 23 mm (zero is just after 23)|LC = 1 mm − 0.9 mm = 0.1 mm|reading = 23 + 6 × 0.1 = 23.6 mm = 2.36 cm');return fin(s)}
function xsscrew(){const s=hs(330,200,'Screw gauge reading. The pitch is 0.5 mm and the circular scale has 50 divisions, so the least count is 0.01 mm. The thimble edge has uncovered the 4 mm mark and the half millimetre mark after it, so the main scale reading is 4.5 mm. The 28th division of the circular scale is on the reference line. The reading is 4.5 plus 28 times 0.01, which is 4.78 mm.');
  const ex=20+4.78*20;
  hl(s,20,75,140,75,INK);
  for(let k=0;k<=4;k++){hl(s,20+20*k,75,20+20*k,62);ht(s,20+20*k,56,String(k),INK,'middle',11)}
  for(let k=0;k<=4;k++)hl(s,30+20*k,75,30+20*k,86);
  ht(s,60,104,'sleeve (mm)',DIM,'middle',11);
  mk(s,'rect',{x:ex,y:28,width:140,height:94,fill:'none',stroke:BLUE,'stroke-width':1.5});
  for(let n=23;n<=33;n++){const y=75+(n-28)*8.4;hl(s,ex,y,ex+(n%5===0?16:9),y,BLUE);if(n%5===0&&n!==28)ht(s,ex+22,y+4,String(n),BLUE,'start',11)}
  hl(s,ex,75,ex+16,75,HI);ht(s,ex+22,79,'28',HI,'start',12);
  ht(s,ex+98,100,'thimble',BLUE,'middle',11);ht(s,ex+98,114,'(circular scale)',BLUE,'middle',11);
  cp(s,150,'pitch 0.5 mm, 50 divisions, LC = 0.5/50 = 0.01 mm|MSR = 4.5 mm, CSR = 28 (on the reference line)|reading = 4.5 + 28 × 0.01 = 4.78 mm');return fin(s)}
function xspend(){const s=hs(340,230,'Simple pendulum and its graph. Left: a bob on a string of effective length L, which is the string length plus the bob radius. Right: a graph of T squared against L, a straight line through the origin with slope 4 pi squared over g.');
  hl(s,40,24,120,24,INK);for(let x=46;x<120;x+=10)hl(s,x,24,x-6,16,DIM);
  hl(s,80,24,80,150,INK);mk(s,'circle',{cx:80,cy:160,r:10,fill:'none',stroke:BLUE,'stroke-width':1.6});dot(s,80,160,BLUE,2);
  hl(s,80,160,90,160,HI);ht(s,100,164,'r',HI,'start',11);
  dsh(s,80,24,80+Math.sin(0.28)*136,24+Math.cos(0.28)*136);
  hv(s,48,92,48,24,DIM,1.1);hv(s,48,92,48,160,DIM,1.1);ht(s,40,96,'L',DIM,'end',13);ht(s,130,64,'L = l + r',DIM,'start',11);
  hl(s,176,180,300,180,INK);hl(s,176,180,176,30,INK);ht(s,300,198,'L',INK,'end',13);ht(s,170,38,'T²',INK,'end',13);
  hl(s,176,180,290,56,HI,'');
  for(const [x,y] of [[200,158],[222,137],[244,112],[266,86],[282,68]])dot(s,x,y,BLUE,2.6);
  ht(s,296,48,'slope = 4π²/g',HI,'end',12);
  cp(s,222,'T = 2π√(L/g);  g = 4π² ÷ slope of the T²–L line');return fin(s)}
function xsmb(){const s=hs(340,260,'Metre bridge. A uniform wire AC one metre long lies along a scale. Across the top, an unknown resistance R in the left gap and a known resistance S in the right gap meet at the point B. A galvanometer joins B to a jockey that slides on the wire. A cell with a key is joined across A and C. At balance the jockey is at a distance l from A, and R over S equals l over 100 minus l.');
  hl(s,40,150,300,150,INK,2.4);ht(s,34,146,'A',INK,'end',13);ht(s,306,146,'C',INK,'start',13);
  hl(s,40,60,90,60);mk(s,'rect',{x:90,y:50,width:40,height:20,fill:'none',stroke:INK,'stroke-width':1.4});hl(s,130,60,170,60);mk(s,'rect',{x:170,y:50,width:40,height:20,fill:'none',stroke:INK,'stroke-width':1.4});hl(s,210,60,300,60);
  hl(s,40,60,40,150);hl(s,300,60,300,150);
  ht(s,110,44,'R',INK,'middle',14);ht(s,190,44,'S',INK,'middle',14);ht(s,164,80,'B',INK,'start',13);dot(s,150,60,INK,3);
  hl(s,150,60,150,88);mk(s,'circle',{cx:150,cy:100,r:12,fill:'none',stroke:INK,'stroke-width':1.4});ht(s,150,105,'G',INK,'middle',13);
  hl(s,138,100,104,100);hl(s,104,100,104,128);hv(s,104,122,104,148,HI,1.8);ht(s,96,118,'J',HI,'end',13);
  dim(s,40,168,104,168,'',0,0);ht(s,72,184,'l',HI,'middle',13);dim(s,104,168,300,168,'',0,0);ht(s,202,184,'100 − l',HI,'middle',13);
  hl(s,40,150,40,214);hl(s,40,214,140,214);hl(s,140,204,140,224);hl(s,148,208,148,220);hl(s,148,214,300,214);hl(s,300,150,300,214);
  ht(s,224,208,'cell + key',DIM,'middle',11);
  cp(s,246,'balance (no galvanometer current): R/S = l/(100 − l)');return fin(s)}
function xspot(){const s=hs(340,260,'Potentiometer circuit. A long uniform wire AB is joined to a driver cell and key. A cell of emf E1 in series with a galvanometer is connected from the end A to a jockey that slides on the wire. At the null point the length from A to the jockey is l1, and E1 equals the potential drop along that length.');
  hl(s,40,120,300,120,INK,2.4);ht(s,34,116,'A',INK,'end',13);ht(s,306,116,'B',INK,'start',13);
  hl(s,40,120,40,50);hl(s,40,50,76,50);hl(s,76,38,76,62);hl(s,84,43,84,57);hl(s,84,50,138,50);
  ht(s,80,30,'E₁',INK,'middle',13);mk(s,'circle',{cx:150,cy:50,r:12,fill:'none',stroke:INK,'stroke-width':1.4});ht(s,150,55,'G',INK,'middle',13);
  hl(s,162,50,200,50);hl(s,200,50,200,92);hv(s,200,88,200,118,HI,1.8);ht(s,208,76,'J',HI,'start',13);
  dim(s,40,138,200,138,'',0,0);ht(s,120,154,'l₁',HI,'middle',13);
  hl(s,40,150,40,214);hl(s,40,214,140,214);hl(s,140,204,140,224);hl(s,148,208,148,220);hl(s,148,214,300,214);hl(s,300,120,300,214);
  ht(s,224,208,'driver cell + key',DIM,'middle',11);
  cp(s,246,'E₁/E₂ = l₁/l₂  (driver emf must be larger)|internal resistance r = R(l₁ − l₂)/l₂');return fin(s)}
function xsres(){const s=hs(320,250,'Resonance tube. A vertical glass tube dips in water. A vibrating tuning fork is held over its open top. At the first resonance the air column of length L1 holds a quarter of a wave: an antinode a little above the open end, an end correction e, and a node at the water surface. The second resonance is at length L2.');
  mk(s,'rect',{x:100,y:40,width:44,height:160,fill:'none',stroke:DIM,'stroke-width':1.6});
  mk(s,'rect',{x:101,y:120,width:42,height:79,fill:'#17314f',opacity:.8});ht(s,122,168,'water',INK,'middle',11);
  hl(s,114,8,114,20,INK);hl(s,130,8,130,20,INK);hl(s,114,20,130,20,INK);ht(s,140,16,'fork f',INK,'start',12);
  let d='';for(let y=28;y<=120;y+=4){const x=122+16*Math.cos(Math.PI/2*(y-28)/92);d+=(d?'L':'M')+x.toFixed(1)+' '+y}
  pth(s,d,HI,1.6);
  dsh(s,102,28,142,28);ht(s,92,32,'A',HI,'end',11);ht(s,92,124,'N',HI,'end',11);
  hv(s,176,80,176,40,DIM,1.1);hv(s,176,80,176,120,DIM,1.1);ht(s,188,84,'L₁',INK,'start',14);ht(s,188,36,'e',INK,'start',12);
  cp(s,222,'L₁ + e = λ/4,  L₂ + e = 3λ/4|λ = 2(L₂ − L₁),  v = 2f(L₂ − L₁)|e = (L₂ − 3L₁)/2');return fin(s)}
function xsid(){const s=hs(320,250,'Angle of deviation against angle of incidence for a prism. A U-shaped curve with its lowest point at the minimum deviation. At that point the angle of incidence equals the angle of emergence. Any other deviation occurs at two angles of incidence, i and e.');
  hl(s,40,170,300,170,INK);hl(s,40,170,40,20,INK);ht(s,300,188,'i',INK,'end',13);ht(s,32,28,'δ',INK,'end',13);
  let d='';for(let x=62;x<=248;x+=4){const y=140-0.0062*(x-155)*(x-155);d+=(d?'L':'M')+x+' '+y.toFixed(1)}
  pth(s,d,HI,2);
  dsh(s,155,140,155,170);dsh(s,40,140,155,140);ht(s,34,144,'δm',HI,'end',13);ht(s,155,186,'i = e',INK,'middle',13);
  dsh(s,40,112,222,112);dsh(s,88,112,88,170);dsh(s,222,112,222,170);ht(s,88,186,'i',DIM,'middle',12);ht(s,222,186,'e',DIM,'middle',12);
  ht(s,165,154,'minimum deviation',HI,'start',11);
  cp(s,212,'A = 60°, δm = 37°: n = sin[(A + δm)/2] / sin(A/2)|= sin 48.5° ÷ sin 30° = 1.50');return fin(s)}
Object.assign(XF,{xsvern,xsscrew,xspend,xsmb,xspot,xsres,xsid});
/* <<< FIGS skills */

window.PhysicaRankFigs={...XF,dnpe,dniv,dnkf,dnlam,dndg,vecAdd,river,rain,horiz,lami,table,roughInc,bank,conical,springW,hemiBlock,ballistic,torque,parAx,pulleyM,rodHinge,rollInc,sat,gHD,hydr,pipe,torri,stokes,cond,engine,fridge,maxwell,shmCircle,springMass,pendulum,stringHarm,pipes,doppler,ringAxis,discAxis,arcCentre,hemi,sheet,plates,solidSph,cylHollow,coul,balls,bis,defl,flux,ppc,sphcap,rcg,rodSide,rodAxis,acc,vernier,screw,prefix,sphero,vt,proj,incline,atwood,fx,vloop,coll,roll,ladder,shell,orbit,ss,capil,pv,carnot,dipole,gaussE,shellV,capDiel,capNet,share,emw,emdc,emsp,omir,olens,otir,oprism,oyd,oslit,opol,cedrift,cesp,cewb,cemb,cepot,cecell,cekir,cemet,cerc};
})();
