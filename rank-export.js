/* Rank mode · PYQ slide export. Makes 16:9 black slides (one question per slide, room left for the solution) and saves them
   as a PDF (slides as pages) or as an editable PowerPoint (real text boxes). Built in the browser: no library, no server,
   nothing leaves the device. Loaded only when a student presses Download. */
(() => {
'use strict';
const W=1920,H=1080,PX=6350,FONT='system-ui,-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif';
/* two looks for the slides: black (default) and white. The teacher chooses when downloading; make() sets it. */
const PAL={dark:{name:'dark',bg:'#000000',logo:'#ffffff',logoA:.55,fig:'#ffffff',tx:'#ffffff',dim:'#9aa6bb',acc:'#7cc0ff',ok:'#6be3a8',line:'#2a3550',qn:['#0c3a28','#3ddc97','#3ddc97'],yr:['#262006','#ffd54a','#ffd54a'],dk1:'000000',lt1:'FFFFFF'},
  light:{name:'light',bg:'#ffffff',logo:'#0b1220',logoA:.8,fig:'#0b1220',tx:'#0b1220',dim:'#5b6b82',acc:'#1a56c4',ok:'#0b7a45',line:'#c7d1df',qn:['#e1f6ea','#16a05f','#0b7a45'],yr:['#fff4d6','#c98a00','#8a5d00'],dk1:'FFFFFF',lt1:'000000'}};
let P=PAL.dark,C=PAL.dark;
const setPalette=n=>{P=PAL[n]||PAL.dark;C=P};
const PAD=80,LOGO={w:250,h:72,x:W-PAD-250,y:36};
const BAND=LOGO.y+LOGO.h+18;   /* the question starts below the logo band, so the logo never covers text */
const parse=t=>window.PhysicaRankMath.parse(t);
let cx=null;const F=(fs,b)=>`${b?'700 ':''}${Math.round(fs*10)/10}px ${FONT}`;

/* ---------- canvas typesetter: text, powers, fractions, radicals ---------- */
function mNodes(ns,fs,b){let w=0,a=fs*.78,d=fs*.22;for(const x of ns){const m=mNode(x,fs,b);w+=m.w;a=Math.max(a,m.a);d=Math.max(d,m.d)}return{w,a,d}}
function mNode(x,fs,b){
  if(x.k==='t'){cx.font=F(fs,b);return{w:cx.measureText(x.s).width,a:fs*.78,d:fs*.22}}
  if(x.k==='sup'){const m=mNodes(x.c,fs*.68,b);return{w:m.w,a:m.a+fs*.36,d:Math.max(0,m.d-fs*.36)}}
  if(x.k==='fr'){const n=mNodes(x.n,fs*.86,b),d=mNodes(x.d,fs*.86,b);return{w:Math.max(n.w,d.w)+fs*.3,a:fs*.4+n.d+n.a,d:Math.max(0,d.a+d.d+fs*.1-fs*.3)}}
  const c=mNodes(x.c,fs,b);return{w:fs*.6+c.w+fs*.1,a:c.a+fs*.2,d:c.d}}
function dNodes(ns,fs,x,y,col,b){for(const n of ns){const m=mNode(n,fs,b);
    if(n.k==='t'){cx.font=F(fs,b);cx.fillStyle=col;cx.textBaseline='alphabetic';cx.fillText(n.s,x,y)}
    else if(n.k==='sup')dNodes(n.c,fs*.68,x,y-fs*.36,col,b);
    else if(n.k==='fr'){const nn=mNodes(n.n,fs*.86,b),dd=mNodes(n.d,fs*.86,b),ax=fs*.3,g=fs*.1;
      dNodes(n.n,fs*.86,x+(m.w-nn.w)/2,y-ax-g-nn.d,col,b);dNodes(n.d,fs*.86,x+(m.w-dd.w)/2,y-ax+g+dd.a,col,b);
      cx.strokeStyle=col;cx.lineWidth=Math.max(1.5,fs*.045);cx.beginPath();cx.moveTo(x+fs*.06,y-ax);cx.lineTo(x+m.w-fs*.06,y-ax);cx.stroke()}
    else{const c=mNodes(n.c,fs,b),sw=fs*.6,top=y-m.a+fs*.04;cx.strokeStyle=col;cx.lineWidth=Math.max(1.5,fs*.05);cx.lineJoin='round';cx.beginPath();
      cx.moveTo(x+sw*.02,y-fs*.32);cx.lineTo(x+sw*.22,y-fs*.38);cx.lineTo(x+sw*.5,y+c.d+fs*.02);cx.lineTo(x+sw*.9,top);cx.lineTo(x+m.w,top);cx.stroke();dNodes(n.c,fs,x+sw,y,col,b)}
    x+=m.w}return x}
const words=ns=>{const ws=[];let cur=[];for(const n of ns){if(n.k==='t'){for(const p of n.s.split(/(\s+)/)){if(!p)continue;if(/^\s+$/.test(p)){if(cur.length){ws.push(cur);cur=[]}}else cur.push({k:'t',s:p})}}else cur.push(n)}if(cur.length)ws.push(cur);return ws};
/* lay a paragraph out in maxW; text may hold several lines (\n) */
function layout(text,fs,maxW,b){cx.font=F(fs,b);const sp=cx.measureText(' ').width,lines=[],lead=fs*.3;
  for(const raw of String(text).split('\n')){let ln={ws:[],w:0,a:fs*.78,d:fs*.22};
    for(const wd of words(parse(raw))){const m=mNodes(wd,fs,b);if(ln.ws.length&&ln.w+sp+m.w>maxW){lines.push(ln);ln={ws:[],w:0,a:fs*.78,d:fs*.22}}ln.w+=(ln.ws.length?sp:0)+m.w;ln.ws.push({wd,m});ln.a=Math.max(ln.a,m.a);ln.d=Math.max(ln.d,m.d)}
    lines.push(ln)}
  let h=0;lines.forEach((l,i)=>{h+=l.a+l.d+(i?lead:0)});return{lines,h,sp,lead,fs,b,maxLine:Math.max(...lines.map(l=>l.w))}}
function drawLay(L,x,y,w,col,al){let by=y;L.lines.forEach((l,i)=>{by+=(i?L.lead:0)+l.a;let px=al==='r'?x+w-l.w:al==='c'?x+(w-l.w)/2:x;for(const {wd,m} of l.ws){dNodes(wd,L.fs,px,by,col,L.b);px+=m.w+L.sp}by+=l.d})}

/* ---------- logo (white, see-through), drawn the same way as the site's brand mark ---------- */
async function logoCanvas(){try{await document.fonts.load('800 40px Orbitron')}catch{}
  const k=3,c=document.createElement('canvas');c.width=LOGO.w*k;c.height=LOGO.h*k;const g=c.getContext('2d');g.scale(k,k);g.globalAlpha=P.logoA;g.strokeStyle=P.logo;g.fillStyle=P.logo;g.lineWidth=2.6;
  const s=1.5,mx=24*s,my=LOGO.h/2;g.save();g.translate(mx,my);g.rotate(-30*Math.PI/180);g.beginPath();g.arc(0,0,16*s,0,7);g.stroke();
  g.save();g.rotate(-25*Math.PI/180);g.beginPath();g.ellipse(0,0,18.5*s,6.5*s,0,0,7);g.stroke();g.restore();g.beginPath();g.arc(0,0,3.5*s,0,7);g.fill();g.restore();
  g.font=`800 ${27*1.15}px Orbitron,${FONT}`;g.textBaseline='middle';g.fillText('physica.',mx+24*s,my+2);return c}

/* ---------- slide specs: one list of elements, drawn on canvas (PDF) and written as shapes (PPT) ---------- */
const letters=(q)=>[].concat(q.c??[]).map(i=>'abcde'[i]);
const answerText=q=>q.o?letters(q).join(', '):q.n!=null?String(q.n):String(q.a||'').replace(/\s{2,}/g,'   ');
const txt=(x,y,w,paras)=>({t:'text',x,y,w,paras,h:0});
function fit(make,from,to,maxH){for(let fs=from;fs>=to;fs-=2){const r=make(fs);if(r.h<=maxH||fs-2<to)return r}}
function optBlock(opts,fs,w){const fo=fs*.94,lw=fo*2.2,gap=fo*.6;
  for(const cols of [2,1]){const cw=cols===2?(w-gap*2)/2:w,ls=opts.map(o=>layout(o,fo,cw-lw));
    if(cols===2&&(ls.some(l=>l.lines.length>1)||opts.length%2))continue; /* two columns only when every option is one short line: it saves height for the teacher's working */
    const cells=[];let y=0;for(let i=0;i<opts.length;i+=cols){const row=ls.slice(i,i+cols),rh=Math.max(...row.map(l=>l.h));row.forEach((l,j)=>cells.push({i:i+j,x:j*(cw+gap*2),y,w:cw,l}));y+=rh+fo*.45}
    return{cells,h:y-fo*.45,fo,lw,cols}}}
async function figCanvas(q){if(!q.fig||!window.PhysicaFig)return null;try{const g=window.PhysicaFig(q.fig);if(!g)return null;g.setAttribute('style','color:'+P.fig);g.setAttribute('font-family','Arial,Helvetica,sans-serif');const vb=g.viewBox.baseVal,w=vb.width||240,h=vb.height||140;g.setAttribute('width',w);g.setAttribute('height',h);g.setAttribute('xmlns','http://www.w3.org/2000/svg');
  const img=new Image();img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(new XMLSerializer().serializeToString(g));await img.decode();const k=3,c=document.createElement('canvas');c.width=w*k;c.height=h*k;c.getContext('2d').drawImage(img,0,0,w*k,h*k);return{c,ar:w/h}}catch{return null}}
const rect=(x,y,w,h,fill)=>({t:'rect',x,y,w,h,fill});
function frame(meta,n,N){return[rect(0,0,W,H,P.bg),{t:'img',k:'logo',...LOGO},txt(PAD,H-58,500,[{s:n+' / '+N,fs:24,c:C.dim}])]}
/* one question laid out in a box: the whole slide (half=null) or its left / right half (two questions on one slide) */
async function questionEls(q,i,withSol,half){const els=[],fig=await figCanvas(q),X0=half==='R'?W/2+PAD/2:PAD,CW=half?W/2-PAD*1.5:W-PAD*2;
  /* header: question number (green) and exam + year (yellow), both as bold pills at the top left of the box */
  const hy=LOGO.y+8,hh=56;cx.font=F(30,1);const qn='Q'+(i+1),qw=cx.measureText(qn).width+40;
  els.push({t:'pill',x:X0,y:hy,w:qw,h:hh,fill:P.qn[0],stroke:P.qn[1],text:qn,color:P.qn[2],fs:30});
  const yr=String(q.y),avail=(half==='R'?W-PAD-LOGO.w-30-X0:half?CW:W-PAD-LOGO.w-30-X0)-qw-14;let yf=26;cx.font=F(yf,1);while(yf>18&&cx.measureText(yr).width+40>avail){yf-=2;cx.font=F(yf,1)}
  const yw=cx.measureText(yr).width+40;
  els.push({t:'pill',x:X0+qw+14,y:hy,w:Math.min(yw,avail),h:hh,fill:P.yr[0],stroke:P.yr[1],text:yr,color:P.yr[2],fs:yf});
  /* the question stays in the upper part of the slide with a smaller type size: the rest of the slide is the teacher's working space (questions-only deck) or the solution */
  const top=BAND+20,bottom=withSol?560:520;
  const areaH=bottom-top,figW=fig?Math.min(half?340:560,Math.round(areaH*.95*fig.ar)):0,qW=CW-(fig?figW+(half?30:50):0);
  const blk=fit(fs=>{const ql=layout(q.q,fs,qW),ob=q.o?optBlock(q.o,fs,fig?qW:CW):null,left=ql.h+(ob?fs*.8+ob.h:0);return{fs,ql,ob,h:fig?Math.max(left,figW/fig.ar):left}},34,18,areaH);
  const qEl=txt(X0,top,qW,[{s:q.q,fs:blk.fs,c:C.tx}]);qEl.h=blk.ql.h;els.push(qEl);
  if(fig)els.push({t:'img',k:'fig'+i,x:X0+CW-figW,y:top,w:figW,h:figW/fig.ar,canvas:fig.c});
  let y=top+blk.ql.h;
  if(blk.ob){y+=blk.fs*.8;for(const c of blk.ob.cells){const e=txt(X0+c.x,y+c.y,c.w,[{s:q.o[c.i],fs:blk.ob.fo,c:C.tx,label:'('+'abcde'[c.i]+')',lw:blk.ob.lw}]);e.h=c.l.h;els.push(e)}y+=blk.ob.h}if(fig)y=Math.max(y,top+figW/fig.ar);
  if(withSol){const lines=['Answer: '+(q.o?letters(q).map(l=>'('+l+')').join(' ')+'  '+[].concat(q.c).map(k=>q.o[k]).join(';  '):answerText(q)),...String(q.s||'').split('\n').filter(Boolean)],sy=Math.max(y+36,bottom+30),room=H-80-sy;
    els.push(rect(X0,bottom+6,CW,2,C.line));
    const r=fit(fs=>{const ls=lines.map((s2,j)=>layout(s2,fs,CW,j===0));return{fs,ls,h:ls.reduce((a2,l)=>a2+l.h,0)+fs*.55*(ls.length-1)}},34,half?14:16,room);
    const e=txt(X0,sy,CW,lines.map((s2,j)=>({s:s2,fs:r.fs,c:j?C.tx:C.ok,b:j===0,gap:r.fs*.55})));e.h=r.h;els.push(e)}
  else{const aw=Math.min(760,CW),e=txt(X0+CW-aw,H-76,aw,[{s:'Ans: '+answerText(q),fs:half?30:36,c:C.acc,b:1,al:'r'}]);e.h=52;els.push(e)}
  return els}
async function questionSlide(q,i,N,withSol,meta,topic){return[...frame(meta,i+1,N),...await questionEls(q,i,withSol,null)]}
/* two questions on one slide: the first on the left half, the second on the right half, a faint dotted line (30% strength) between them */
const mixHex=(a,b,t)=>{const h=c=>[1,3,5].map(k=>parseInt(c.slice(k,k+2),16)),x=h(a),y=h(b);return'#'+x.map((v,k)=>Math.round(v*t+y[k]*(1-t)).toString(16).padStart(2,'0')).join('')};
async function pairSlide(q1,i,q2,N,withSol,meta){const els=frame(meta,(i+1)+'–'+(i+2),N),col=mixHex(P.tx,P.bg,.3);
  els.push(...await questionEls(q1,i,withSol,'L'),...await questionEls(q2,i+1,withSol,'R'));
  for(let y=BAND+14;y<H-96;y+=28)els.push(rect(W/2-2,y,4,14,col));return els}
/* ---------- cover slide: centred bold chapter and exam, faint chapter-themed art behind (edges only), one light line ---------- */
const JOKE=[[/^Units/,'Because “5” is not an answer. “5 metres” is.'],[/Kinematics/,'Every journey is just a graph, and every graph is just a journey.'],[/Laws of Motion/,'Newton gave us physics and a good reason to blame friction.'],[/Work, Energy/,'Studying hard is not “work” in physics unless something moves. Sorry!'],[/Rotational/,'Everything goes in circles here, including your doubts until they are solved.'],[/Gravitation/,'What goes up must come down. Your marks should not.'],[/Solids and Liquids/,'Solids hold their shape, liquids go with the flow. Be a bit of both.'],[/Thermodynamics/,'Entropy always increases, just like the mess on your study table.'],[/Kinetic/,'Billions of tiny molecules, and not one of them has ever asked for notes.'],[/Oscillations/,'Up, down, repeat, just like a Monday morning.'],[/Electrostatics/,'Opposites attract, likes repel. Your classroom knew this already.'],[/Current Elec/,'Stay positive and keep the current flowing.'],[/Magnetic Eff/,'Magnets know the secret of attraction. We only know the formulas.'],[/Induction/,'Change is the only constant, and Faraday would nod.'],[/Electromagnetic Waves/,'Light, radio, X-rays: one family, very different party manners.'],[/^Optics/,'Let us see things clearly, at least in the exam.'],[/Dual Nature/,'Is it a wave or a particle? Yes.'],[/Atoms and Nuclei/,'Small things, big energy, just like you before an exam.'],[/Electronic Devices/,'Diodes: the only ones who truly believe in one-way traffic.'],[/Experimental/,'Least count: the smallest thing that can cost you a mark.'],
  [/^Sets/,'Every element has its place. Find yours.'],[/Trigonometric Functions/,'Triangles are simple, until someone asks for sin 75°.'],[/Binomial/,'Expand your mind, and the bracket too.'],[/Complex Numbers/,'Imaginary numbers, very real marks.'],[/Permutations/,'Order matters here. Unlike in your school bag.'],[/Sequences/,'Terms and conditions apply to every term.'],[/Straight Lines/,'The shortest path between two points is a straight line, and a straight answer.'],[/Conic/,'Cut a cone, get a parabola. Cut the syllabus, get peace.'],[/Limits/,'Getting closer and closer without ever getting there, like the weekend.'],[/Statistics/,'Nine out of ten students prefer questions that come with answers.'],[/Logarithm/,'Making big numbers feel small since 1614.'],[/^Relations and Functions/,'Every input has exactly one output, unlike your plans for Sunday.'],[/Inverse Trig/,'Undoing sin, one angle at a time.'],[/Matrices/,'Rows and columns: organising numbers better than your desk.'],[/Continuity/,'Smooth curves only. Sharp corners are not allowed.'],[/Application of Derivatives/,'Maximise marks, minimise worry.'],[/^Integrals/,'Adding up infinitely many tiny pieces: patience, with symbols.'],[/Application of Integrals/,'Finding the area under the curve, because every curve deserves its due.'],[/Differential/,'Solve the change and the rest will follow.'],[/Vector/,'Direction matters. So does magnitude.'],[/Three Dim/,'One more dimension, one more reason to draw a neat diagram.'],[/Probability/,'Chance of passing: very high, if you practise.']];
const jokeFor=ch=>(JOKE.find(([r])=>r.test(ch))||[0,'Practise a little every day and the marks will take notice.'])[1];
const ART=[[/^Sets|^Relations/,'venn grid'],[/Trigonometric/,'sine circ'],[/Binomial/,'pascal grid'],[/Complex/,'circ nums:i'],[/Permutations/,'dots nums:pc'],[/Sequences/,'bars nums:seq'],[/Straight|Conic|Three Dim|Vector/,'grid conic'],[/Limits|Continuity|Derivatives|Integrals|Differential/,'curve grid'],[/Statistics|Probability/,'bell bars'],[/Logarithm/,'curve nums:log'],[/Matrices/,'matrix grid'],[/Units|Experimental/,'ruler dots'],[/Kinematics|Laws|Work|Rotational/,'arc orbit'],[/Gravitation|Atoms|Dual/,'orbit dots'],[/Solids|Thermo|Kinetic/,'dots curve'],[/Oscillations|Waves/,'sine sine'],[/Electrostatics|Current|Devices/,'field dots'],[/Magnetic|Induction/,'loops sine'],[/Optics/,'rays circ']];
function chapterArt(meta){const cv=document.createElement('canvas');cv.width=W;cv.height=H;const g=cv.getContext('2d');
  const pr=(ART.find(([r])=>r.test(meta.chapter))||[0,meta.subject==='Maths'?'grid arc':'sine orbit'])[1].split(' ');
  const anchors=[[150,110,1],[W-520,90,1],[120,H-420,1],[W-470,H-410,1],[40,H/2-210,.8],[W-330,H/2-210,.8],[W/2-300,60,.7],[W/2-300,H-235,.7]];
  g.lineWidth=3;g.lineCap='round';g.font=F(46,1);g.textBaseline='middle';
  const col=(a,k)=>{g.strokeStyle=g.fillStyle=(k?C.tx:C.acc);g.globalAlpha=a};
  const draw=(nm,x,y,s)=>{const R=s*170;g.save();g.translate(x,y);col(.34);
    if(nm==='grid'){for(let k=0;k<=5;k++){g.beginPath();g.moveTo(k*R/5,0);g.lineTo(k*R/5,R);g.moveTo(0,k*R/5);g.lineTo(R,k*R/5);g.stroke()}}
    else if(nm==='sine'||nm==='curve'){g.beginPath();for(let k=0;k<=60;k++){const t=k/60,X=t*R*2.2,Y=nm==='sine'?R/2+Math.sin(t*Math.PI*4)*R*.38:R-(t*t*1.7+t*.2)*R*.9;k?g.lineTo(X,Y):g.moveTo(X,Y)}g.stroke();if(nm==='curve'){col(.3,1);g.beginPath();g.moveTo(R*.5,R*.9);g.lineTo(R*1.5,R*.2);g.stroke()}}
    else if(nm==='arc'){g.beginPath();g.moveTo(0,R);g.quadraticCurveTo(R*.9,-R*.4,R*1.8,R);g.stroke();for(let k=0;k<5;k++){const t=(k+.5)/5,X=t*R*1.8,Y=R-4*R*.7*t*(1-t)*1.0;g.beginPath();g.arc(X,Y,7,0,7);g.fill()}}
    else if(nm==='circ'||nm==='orbit'||nm==='loops'){const n=nm==='loops'?3:1;for(let k=1;k<=n;k++){g.beginPath();g.ellipse(R/2,R/2,R/2*k/n,nm==='orbit'?R*.22*k/n:R/2*k/n,nm==='orbit'?-.5:0,0,7);g.stroke()}
      if(nm==='circ'){g.beginPath();g.moveTo(0,R/2);g.lineTo(R,R/2);g.moveTo(R/2,0);g.lineTo(R/2,R);g.stroke();g.beginPath();g.moveTo(R/2,R/2);g.lineTo(R*.85,R*.2);g.stroke()}
      else{g.beginPath();g.arc(R/2,R/2,10,0,7);g.fill()}}
    else if(nm==='venn'){for(const [dx,dy] of [[.3,.3],[.62,.3],[.46,.6]]){g.beginPath();g.arc(dx*R*1.2,dy*R*1.2,R*.3,0,7);g.stroke()}}
    else if(nm==='bars'||nm==='bell'){if(nm==='bars'){for(let k=0;k<6;k++){g.fillRect(k*R/5,R-R*(.15+k*.14),R/8,R*(.15+k*.14))}}else{g.beginPath();for(let k=0;k<=40;k++){const t=k/40*2-1,X=(t+1)*R,Y=R-Math.exp(-t*t*4)*R*.9;k?g.lineTo(X,Y):g.moveTo(X,Y)}g.stroke()}}
    else if(nm==='dots'){for(let a=0;a<4;a++)for(let b2=0;b2<4;b2++){g.beginPath();g.arc(a*R/4+10,b2*R/4+10,(a+b2)%3?6:11,0,7);g.fill()}}
    else if(nm==='rays'){g.beginPath();g.ellipse(R*.7,R/2,R*.1,R*.45,0,0,7);g.stroke();for(const dy of [.15,.4,.65,.9]){g.beginPath();g.moveTo(0,dy*R);g.lineTo(R*.7,R/2);g.lineTo(R*1.6,R*(1-dy)*.9+R*.05);g.stroke()}}
    else if(nm==='conic'){g.beginPath();g.ellipse(R*.5,R/2,R*.5,R*.28,.4,0,7);g.stroke();g.beginPath();g.moveTo(R*1.1,R*.1);g.quadraticCurveTo(R*1.5,R*.5,R*1.1,R*.95);g.stroke()}
    else if(nm==='field'){for(let k=-2;k<=2;k++){g.beginPath();g.moveTo(0,R/2);g.quadraticCurveTo(R*.6,R/2+k*R*.45,R*1.2,R/2);g.stroke()}g.beginPath();g.arc(0,R/2,10,0,7);g.fill();g.beginPath();g.arc(R*1.2,R/2,10,0,7);g.stroke()}
    else if(nm==='ruler'){g.beginPath();g.moveTo(0,R*.5);g.lineTo(R*1.8,R*.5);g.stroke();for(let k=0;k<=18;k++){g.beginPath();g.moveTo(k*R/10,R*.5);g.lineTo(k*R/10,R*.5-(k%5?14:30));g.stroke()}}
    else if(nm==='matrix'){g.font=F(46,1);for(let a=0;a<3;a++)for(let b2=0;b2<3;b2++)g.fillText(String((a*3+b2*2+1)%9+1),b2*R*.3+30,a*R*.3+30);g.beginPath();g.moveTo(10,0);g.lineTo(0,0);g.lineTo(0,R*.9);g.lineTo(10,R*.9);g.stroke()}
    else if(nm==='pascal'){g.font=F(44,1);for(let a=0;a<5;a++){let v=1;for(let b2=0;b2<=a;b2++){g.fillText(String(v),R*.5+(b2-a/2)*R*.34,a*R*.28+20);v=v*(a-b2)/(b2+1)}}}
    else if(nm.startsWith('nums')){const T={i:'i² = −1  ·  z = x + iy  ·  |z|',pc:'n!  ·  ⁿPᵣ  ·  ⁿCᵣ',seq:'a, a+d, a+2d  ·  Σ  ·  ar',log:'log  ·  ln  ·  eˣ'}[nm.slice(5)]||'';g.font=F(38,1);g.fillText(T,0,R/2)}
    g.restore()};
  const list=pr.flatMap(n=>[n,n,n]);anchors.forEach((a,k)=>{const nm=list[k%list.length];if(nm.startsWith('nums')&&k<6)return;draw(nm,a[0],a[1],a[2])});
  /* keep the middle (the title) clear: erase the centre softly so nothing overlaps the text */
  g.globalAlpha=1;g.globalCompositeOperation='destination-out';const gr=g.createRadialGradient(W/2,H/2,160,W/2,H/2,820);gr.addColorStop(0,'rgba(0,0,0,.98)');gr.addColorStop(.6,'rgba(0,0,0,.72)');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(0,0,W,H);
  g.globalCompositeOperation='source-over';
  /* overall faintness (the art is a background, not a picture): redraw at low opacity */
  const out=document.createElement('canvas');out.width=W;out.height=H;const o=out.getContext('2d');o.globalAlpha=P.name==='light'?.32:.3;o.drawImage(cv,0,0);return out}
function titleSlide(meta,N,withSol){const els=[rect(0,0,W,H,P.bg),{t:'img',k:'art',x:0,y:0,w:W,h:H,canvas:chapterArt(meta)},{t:'img',k:'logo',...LOGO}];
  const ch=fit(fs=>{const l=layout(meta.chapter,fs,W-PAD*2-160,1);return{fs,h:l.h}},112,60,330);
  const subj=meta.exam+'  ·  '+meta.subject+'  ·  '+meta.cls,joke='“'+jokeFor(meta.chapter)+'”';
  const hs=layout(subj,50,W-PAD*2,1).h,hj=layout(joke,34,W-PAD*2-300,0).h,gap=34,total=40+gap+ch.h+gap+4+gap+hs+gap+hj;let y=Math.max(150,(H-total)/2-10);
  els.push(txt(PAD,y,W-PAD*2,[{s:'PREVIOUS YEAR QUESTIONS',fs:32,c:C.acc,b:1,al:'c'}]));y+=40+gap;
  const e=txt(PAD+80,y,W-PAD*2-160,[{s:meta.chapter,fs:ch.fs,c:C.tx,b:1,al:'c'}]);e.h=ch.h;els.push(e);y+=ch.h+gap;
  els.push(rect(W/2-90,y,180,4,C.acc));y+=4+gap;
  els.push(txt(PAD,y,W-PAD*2,[{s:subj,fs:50,c:C.tx,b:1,al:'c'}]));y+=hs+gap;
  els.push(txt(PAD+150,y,W-PAD*2-300,[{s:joke,fs:34,c:C.dim,al:'c'}]));
  els.push(txt(PAD,H-70,1200,[{s:N+' questions  ·  '+(withSol?'questions with solutions':'questions only'),fs:30,c:C.dim}]),txt(W-PAD-400,H-70,400,[{s:'physica.in',fs:30,c:C.dim,al:'r'}]));
  return els}
function topicsSlide(meta){const els=[rect(0,0,W,H,P.bg),{t:'img',k:'logo',...LOGO}];
  els.push(txt(PAD,120,1300,[{s:'TOPICS INCLUDED',fs:32,c:C.acc,b:1}]),txt(PAD,176,W-PAD*2,[{s:meta.chapter,fs:56,c:C.tx,b:1}]),txt(PAD,262,W-PAD*2,[{s:'Papers: '+meta.papers.join('  ·  '),fs:30,c:C.dim}]),rect(PAD,330,W-PAD*2,2,C.line));
  const paras=meta.topics.flatMap(t=>[{s:t.name+'  ('+t.n+')',b:1,c:C.tx},{s:t.subs.map(s=>s[0]+' ('+s[1]+')').join('   ·   '),c:C.dim}]);
  const r=fit(fs=>{const ls=paras.map(p=>layout(p.s,fs,W-PAD*2,p.b));return{fs,h:ls.reduce((a,l)=>a+l.h,0)+fs*.35*(ls.length-1)}},34,16,H-420);
  const e=txt(PAD,366,W-PAD*2,paras.map(p=>({...p,fs:r.fs,gap:r.fs*.35})));e.h=r.h;els.push(e);
  els.push(txt(W-PAD-400,H-70,400,[{s:'physica.in',fs:30,c:C.dim,al:'r'}]));return els}

/* ---------- canvas drawing (for the PDF) ---------- */
function drawSlide(els,logo){const cv=document.createElement('canvas');cv.width=W;cv.height=H;cx=cv.getContext('2d');cx.lineCap='round';
  for(const e of els){
    if(e.t==='rect'){cx.fillStyle=e.fill;cx.fillRect(e.x,e.y,e.w,e.h)}
    else if(e.t==='pill'){const r=e.h/2;cx.beginPath();cx.moveTo(e.x+r,e.y);cx.arcTo(e.x+e.w,e.y,e.x+e.w,e.y+e.h,r);cx.arcTo(e.x+e.w,e.y+e.h,e.x,e.y+e.h,r);cx.arcTo(e.x,e.y+e.h,e.x,e.y,r);cx.arcTo(e.x,e.y,e.x+e.w,e.y,r);cx.closePath();cx.fillStyle=e.fill;cx.fill();cx.lineWidth=2.5;cx.strokeStyle=e.stroke;cx.stroke();
      cx.font=F(e.fs,1);cx.fillStyle=e.color;cx.textAlign='center';cx.textBaseline='middle';cx.fillText(e.text,e.x+e.w/2,e.y+e.h/2+1);cx.textAlign='left';cx.textBaseline='alphabetic'}
    else if(e.t==='img')cx.drawImage(e.k==='logo'?logo:e.canvas,e.x,e.y,e.w,e.h);
    else{let y=e.y;for(const p of e.paras){const lw=p.lw||0,L=layout(p.s,p.fs,e.w-lw,p.b);
      if(p.label){cx.font=F(p.fs,1);cx.fillStyle=C.acc;cx.textBaseline='alphabetic';cx.fillText(p.label,e.x,y+L.lines[0].a)}
      drawLay(L,e.x+lw,y,e.w-lw,p.c,p.al);y+=L.h+(p.gap||0)}}}
  return cv}

/* ---------- PDF: one JPEG page per slide ---------- */
function makePDF(pages,pw=960,ph=540,iw=W,ih=H){const enc=new TextEncoder(),parts=[],off=[];let len=0;const put=x=>{const b=typeof x==='string'?enc.encode(x):x;parts.push(b);len+=b.length};
  const N=pages.length;put('%PDF-1.4\n');put(new Uint8Array([37,226,227,207,211,10]));
  const obj=(n,fn)=>{off[n]=len;put(n+' 0 obj\n');fn();put('\nendobj\n')};
  obj(1,()=>put('<< /Type /Catalog /Pages 2 0 R >>'));
  obj(2,()=>put('<< /Type /Pages /Count '+N+' /Kids ['+pages.map((_,i)=>(3+i*3)+' 0 R').join(' ')+'] >>'));
  pages.forEach((p,i)=>{const pg=3+i*3;
    obj(pg,()=>put('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 '+pw+' '+ph+'] /Contents '+(pg+1)+' 0 R /Resources << /XObject << /I '+(pg+2)+' 0 R >> >> >>'));
    const cs='q '+pw+' 0 0 '+ph+' 0 0 cm /I Do Q';obj(pg+1,()=>{put('<< /Length '+cs.length+' >>\nstream\n'+cs+'\nendstream')});
    obj(pg+2,()=>{put('<< /Type /XObject /Subtype /Image /Width '+iw+' /Height '+ih+' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length '+p.length+' >>\nstream\n');put(p);put('\nendstream')})});
  const total=3+N*3,xr=len;put('xref\n0 '+total+'\n0000000000 65535 f \n');for(let n=1;n<total;n++)put(String(off[n]).padStart(10,'0')+' 00000 n \n');
  put('trailer\n<< /Size '+total+' /Root 1 0 R >>\nstartxref\n'+xr+'\n%%EOF\n');return new Blob(parts,{type:'application/pdf'})}

/* ---------- ZIP (stored) + PPTX ---------- */
const CRC=(()=>{const t=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;t[n]=c>>>0}return t})();
const crc32=u=>{let c=-1;for(let i=0;i<u.length;i++)c=CRC[(c^u[i])&255]^(c>>>8);return(c^-1)>>>0};
function zip(files){const enc=new TextEncoder(),parts=[],cen=[];let off=0;
  for(const f of files){const name=enc.encode(f.name),data=typeof f.data==='string'?enc.encode(f.data):f.data,crc=crc32(data);
    const lh=new DataView(new ArrayBuffer(30));lh.setUint32(0,0x04034b50,true);lh.setUint16(4,20,true);lh.setUint16(6,0x0800,true);lh.setUint16(10,0,true);lh.setUint16(12,0x21,true);lh.setUint32(14,crc,true);lh.setUint32(18,data.length,true);lh.setUint32(22,data.length,true);lh.setUint16(26,name.length,true);
    parts.push(new Uint8Array(lh.buffer),name,data);
    const ch=new DataView(new ArrayBuffer(46));ch.setUint32(0,0x02014b50,true);ch.setUint16(4,20,true);ch.setUint16(6,20,true);ch.setUint16(8,0x0800,true);ch.setUint16(14,0x21,true);ch.setUint32(16,crc,true);ch.setUint32(20,data.length,true);ch.setUint32(24,data.length,true);ch.setUint16(28,name.length,true);ch.setUint32(42,off,true);
    cen.push(new Uint8Array(ch.buffer),name);off+=30+name.length+data.length}
  let cl=0;for(const c of cen)cl+=c.length;const end=new DataView(new ArrayBuffer(22));end.setUint32(0,0x06054b50,true);end.setUint16(8,files.length,true);end.setUint16(10,files.length,true);end.setUint32(12,cl,true);end.setUint32(16,off,true);
  return new Blob([...parts,...cen,new Uint8Array(end.buffer)],{type:'application/vnd.openxmlformats-officedocument.presentationml.presentation'})}
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
const SUPM={'0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹','-':'⁻','−':'⁻','+':'⁺','(':'⁽',')':'⁾','n':'ⁿ'};
const flat=ns=>ns.map(x=>x.k==='t'?x.s:x.k==='sup'?[...flat(x.c)].map(c=>SUPM[c]||c).join(''):x.k==='fr'?par(flat(x.n))+'/'+par(flat(x.d)):'√'+par(flat(x.c))).join('');
const par=s=>/^[\wα-ωΔ₀-₉⁰-⁹²³′.]+$/.test(s)?s:'('+s+')';
const runs=ns=>ns.flatMap(x=>x.k==='sup'?[{s:flat(x.c),sup:1}]:x.k==='t'?[{s:x.s}]:[{s:flat([x])}]);
const hex=c=>c.replace('#','').toUpperCase(),emu=v=>Math.round(v*PX);
const run=(s,fs,col,b,sup)=>'<a:r><a:rPr lang="en-US" sz="'+Math.round(fs*50)+'" b="'+(b?1:0)+'"'+(sup?' baseline="30000"':'')+' dirty="0"><a:solidFill><a:srgbClr val="'+hex(col)+'"/></a:solidFill><a:latin typeface="Arial"/><a:cs typeface="Arial"/></a:rPr><a:t>'+esc(s)+'</a:t></a:r>';
function shape(e,id,rel){const xf='<a:xfrm><a:off x="'+emu(e.x)+'" y="'+emu(e.y)+'"/><a:ext cx="'+emu(e.w)+'" cy="'+emu(e.h)+'"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom>';
  if(e.t==='pill')return'<p:sp><p:nvSpPr><p:cNvPr id="'+id+'" name="Tag '+id+'"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="'+emu(e.x)+'" y="'+emu(e.y)+'"/><a:ext cx="'+emu(e.w)+'" cy="'+emu(e.h)+'"/></a:xfrm><a:prstGeom prst="roundRect"><a:avLst><a:gd name="adj" fmla="val 50000"/></a:avLst></a:prstGeom><a:solidFill><a:srgbClr val="'+hex(e.fill)+'"/></a:solidFill><a:ln w="31750"><a:solidFill><a:srgbClr val="'+hex(e.stroke)+'"/></a:solidFill></a:ln></p:spPr><p:txBody><a:bodyPr wrap="none" lIns="0" tIns="0" rIns="0" bIns="0" anchor="ctr"><a:noAutofit/></a:bodyPr><a:lstStyle/><a:p><a:pPr algn="ctr"/>'+run(e.text,e.fs,e.color,1,0)+'</a:p></p:txBody></p:sp>';
  if(e.t==='rect')return'<p:sp><p:nvSpPr><p:cNvPr id="'+id+'" name="Panel '+id+'"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr><p:spPr>'+xf+'<a:solidFill><a:srgbClr val="'+hex(e.fill)+'"/></a:solidFill><a:ln><a:noFill/></a:ln></p:spPr></p:sp>';
  if(e.t==='img')return'<p:pic><p:nvPicPr><p:cNvPr id="'+id+'" name="'+(e.k==='logo'?'Physica logo':'Diagram')+'"/><p:cNvPicPr><a:picLocks noChangeAspect="1"/></p:cNvPicPr><p:nvPr/></p:nvPicPr><p:blipFill><a:blip r:embed="'+rel+'"/><a:stretch><a:fillRect/></a:stretch></p:blipFill><p:spPr>'+xf+'</p:spPr></p:pic>';
  const ps=e.paras.map(p=>{const rs=[];if(p.label)rs.push(run(p.label+'  ',p.fs,C.acc,1));for(const r of runs(parse(p.s)))rs.push(run(r.s,p.fs,p.c,p.b,r.sup));
    return'<a:p><a:pPr algn="'+(p.al==='r'?'r':p.al==='c'?'ctr':'l')+'"><a:spcBef><a:spcPts val="0"/></a:spcBef><a:spcAft><a:spcPts val="'+Math.round((p.gap||0)*50)+'"/></a:spcAft></a:pPr>'+rs.join('')+'</a:p>'});
  return'<p:sp><p:nvSpPr><p:cNvPr id="'+id+'" name="Text '+id+'"/><p:cNvSpPr txBox="1"/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="'+emu(e.x)+'" y="'+emu(e.y)+'"/><a:ext cx="'+emu(e.w)+'" cy="'+emu(Math.max(e.h*1.12,e.paras[0].fs*1.5))+'"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:noFill/></p:spPr><p:txBody><a:bodyPr wrap="square" lIns="0" tIns="0" rIns="0" bIns="0" rtlCol="0" anchor="t"><a:noAutofit/></a:bodyPr><a:lstStyle/>'+ps.join('')+'</p:txBody></p:sp>'}
const NS='xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"',XH='<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n',REL='http://schemas.openxmlformats.org/officeDocument/2006/relationships/',GRP='<p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>';
const THEME=XH+'<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="Physica"><a:themeElements><a:clrScheme name="Physica"><a:dk1><a:srgbClr val="000000"/></a:dk1><a:lt1><a:srgbClr val="FFFFFF"/></a:lt1><a:dk2><a:srgbClr val="0B1220"/></a:dk2><a:lt2><a:srgbClr val="9AA6BB"/></a:lt2><a:accent1><a:srgbClr val="7CC0FF"/></a:accent1><a:accent2><a:srgbClr val="6BE3A8"/></a:accent2><a:accent3><a:srgbClr val="FFB347"/></a:accent3><a:accent4><a:srgbClr val="FF9D9D"/></a:accent4><a:accent5><a:srgbClr val="2B6CFF"/></a:accent5><a:accent6><a:srgbClr val="9AA6BB"/></a:accent6><a:hlink><a:srgbClr val="7CC0FF"/></a:hlink><a:folHlink><a:srgbClr val="9AA6BB"/></a:folHlink></a:clrScheme><a:fontScheme name="Physica"><a:majorFont><a:latin typeface="Arial"/><a:ea typeface=""/><a:cs typeface=""/></a:majorFont><a:minorFont><a:latin typeface="Arial"/><a:ea typeface=""/><a:cs typeface=""/></a:minorFont></a:fontScheme><a:fmtScheme name="Physica"><a:fillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:fillStyleLst><a:lnStyleLst><a:ln w="9525"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln><a:ln w="19050"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln><a:ln w="28575"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln></a:lnStyleLst><a:effectStyleLst><a:effectStyle><a:effectLst/></a:effectStyle><a:effectStyle><a:effectLst/></a:effectStyle><a:effectStyle><a:effectLst/></a:effectStyle></a:effectStyleLst><a:bgFillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:bgFillStyleLst></a:fmtScheme></a:themeElements></a:theme>';
const bgXml=()=>'<p:bg><p:bgPr><a:solidFill><a:srgbClr val="'+hex(P.bg)+'"/></a:solidFill><a:effectLst/></p:bgPr></p:bg>',clrMap=()=>P.name==='light'?'bg1="lt1" tx1="dk1" bg2="lt2" tx2="dk2"':'bg1="dk1" tx1="lt1" bg2="dk2" tx2="lt2"';
async function makePPTX(slides,logo){const files=[],N=slides.length,png=async c=>new Uint8Array(await new Promise(r=>c.toBlob(r,'image/png')).then(b=>b.arrayBuffer()));
  files.push({name:'media/logo.png',data:await png(logo)});const slideXml=[],slideRels=[];let figN=0;
  for(let s=0;s<N;s++){let id=2,sp='';const rels=['<Relationship Id="rId1" Type="'+REL+'slideLayout" Target="../slideLayouts/slideLayout1.xml"/>'];
    for(const e of slides[s]){let rel='';if(e.t==='img'){if(e.k==='logo')rel='rId2';else{const nm='fig'+(++figN)+'.png';files.push({name:'media/'+nm,data:await png(e.canvas)});rel='rId'+(10+figN);rels.push('<Relationship Id="'+rel+'" Type="'+REL+'image" Target="../media/'+nm+'"/>')}}
      if(e.t==='rect'&&e.w===W&&e.h===H)continue;sp+=shape(e,id++,rel)}
    rels.push('<Relationship Id="rId2" Type="'+REL+'image" Target="../media/logo.png"/>');
    slideXml.push(XH+'<p:sld '+NS+'><p:cSld>'+bgXml()+'<p:spTree>'+GRP+sp+'</p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sld>');slideRels.push(XH+'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'+rels.join('')+'</Relationships>')}
  const out=[{name:'[Content_Types].xml',data:XH+'<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="png" ContentType="image/png"/><Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/><Override PartName="/ppt/slideMasters/slideMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml"/><Override PartName="/ppt/slideLayouts/slideLayout1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/><Override PartName="/ppt/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/>'+slides.map((_,i)=>'<Override PartName="/ppt/slides/slide'+(i+1)+'.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>').join('')+'</Types>'},
    {name:'_rels/.rels',data:XH+'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="'+REL+'officeDocument" Target="ppt/presentation.xml"/></Relationships>'},
    {name:'ppt/presentation.xml',data:XH+'<p:presentation '+NS+'><p:sldMasterIdLst><p:sldMasterId id="2147483648" r:id="rId1"/></p:sldMasterIdLst><p:sldIdLst>'+slides.map((_,i)=>'<p:sldId id="'+(256+i)+'" r:id="rId'+(3+i)+'"/>').join('')+'</p:sldIdLst><p:sldSz cx="12192000" cy="6858000"/><p:notesSz cx="6858000" cy="9144000"/></p:presentation>'},
    {name:'ppt/_rels/presentation.xml.rels',data:XH+'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="'+REL+'slideMaster" Target="slideMasters/slideMaster1.xml"/><Relationship Id="rId2" Type="'+REL+'theme" Target="theme/theme1.xml"/>'+slides.map((_,i)=>'<Relationship Id="rId'+(3+i)+'" Type="'+REL+'slide" Target="slides/slide'+(i+1)+'.xml"/>').join('')+'</Relationships>'},
    {name:'ppt/theme/theme1.xml',data:THEME},
    {name:'ppt/slideMasters/slideMaster1.xml',data:XH+'<p:sldMaster '+NS+'><p:cSld>'+bgXml()+'<p:spTree>'+GRP+'</p:spTree></p:cSld><p:clrMap '+clrMap()+' accent1="accent1" accent2="accent2" accent3="accent3" accent4="accent4" accent5="accent5" accent6="accent6" hlink="hlink" folHlink="folHlink"/><p:sldLayoutIdLst><p:sldLayoutId id="2147483649" r:id="rId1"/></p:sldLayoutIdLst></p:sldMaster>'},
    {name:'ppt/slideMasters/_rels/slideMaster1.xml.rels',data:XH+'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="'+REL+'slideLayout" Target="../slideLayouts/slideLayout1.xml"/><Relationship Id="rId2" Type="'+REL+'theme" Target="../theme/theme1.xml"/></Relationships>'},
    {name:'ppt/slideLayouts/slideLayout1.xml',data:XH+'<p:sldLayout '+NS+' type="blank" preserve="1"><p:cSld name="Blank"><p:spTree>'+GRP+'</p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sldLayout>'},
    {name:'ppt/slideLayouts/_rels/slideLayout1.xml.rels',data:XH+'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="'+REL+'slideMaster" Target="../slideMasters/slideMaster1.xml"/></Relationships>'}];
  slideXml.forEach((x,i)=>{out.push({name:'ppt/slides/slide'+(i+1)+'.xml',data:x},{name:'ppt/slides/_rels/slide'+(i+1)+'.xml.rels',data:slideRels[i]})});
  return zip([...out,...files.map(f=>({name:'ppt/'+f.name,data:f.data}))])}

/* ---------- public: build the file ---------- */
const yld=()=>self.scheduler?.yield?scheduler.yield():new Promise(r=>setTimeout(r)),encJpg=cv=>new Promise(r=>cv.toBlob(r,'image/jpeg',.93)).then(b=>b.arrayBuffer()).then(a=>new Uint8Array(a));
async function make({items,withSol,blank,format,meta,theme,perSlide=1,onProgress,cancelled}){
  setPalette(theme);
  const c0=document.createElement('canvas');c0.width=W;c0.height=H;cx=c0.getContext('2d');
  const logo=await logoCanvas(),N=items.length,specs=[titleSlide(meta,N,withSol),topicsSlide(meta)];
  for(let i=0;i<N;i++){if(cancelled?.())throw new Error('cancelled');const two=perSlide===2&&i+1<N;specs.push(two?await pairSlide(items[i].q,i,items[i+1].q,N,withSol,meta):await questionSlide(items[i].q,i,N,withSol,meta,items[i].topic));if(blank)specs.push([rect(0,0,W,H,P.bg),{t:'img',k:'logo',...LOGO}]);if(two)i++;onProgress?.(i+1,N+1);if(i%4===3)await yld()}
  for(const sp of specs)for(const e of sp)if(e.t==='text')e.h=e.paras.reduce((a,p)=>a+layout(p.s,p.fs,e.w-(p.lw||0),p.b).h+(p.gap||0),0);
  if(format==='ppt')return makePPTX(specs,logo);
  const jp=[];for(let i=0;i<specs.length;i++){if(cancelled?.())throw new Error('cancelled');jp.push(encJpg(drawSlide(specs[i],logo))); /* encoding runs off the main thread while the next slide is drawn */
    onProgress?.(N+1,N+1,i+1,specs.length);if(i%3===2)await Promise.all(jp);else await yld()}
  return makePDF(await Promise.all(jp))}
/* ---------- formula sheet: every formula of a chapter on 1-5 A4 pages (PDF, printable, light) ---------- */
async function makeSheet({formulas,chapter,exam,onProgress,cancelled}){
  setPalette('light');const AW=1240,AH=1754,M=70,GAP=40,CW=(AW-M*2-GAP)/2,TOP=250,BOT=AH-90;
  const c0=document.createElement('canvas');c0.width=AW;c0.height=AH;cx=c0.getContext('2d');const logo=await logoCanvas();
  const blocks=fs=>formulas.map(f=>{const nm=layout(f.n,fs*.85,CW-28,1),eq=layout(f.f.split(' · ').join('\n'),fs,CW-28,0),h=nm.h+eq.h+fs*.5+34;return{nm,eq,h}});
  let fs=26,pages;
  for(;fs>=13;fs-=1){const bl=blocks(fs);pages=[[[],[]]];let col=0,y=TOP,pg=0;
    for(const b of bl){const lim=BOT;if(y+b.h>lim){if(col===0){col=1;y=TOP}else{pages.push([[],[]]);pg++;col=0;y=TOP}}pages[pg][col].push({b,y});y+=b.h+14}
    if(pages.length<=5)break}
  fs=Math.max(fs,13);
  const out=[];
  for(let i=0;i<pages.length;i++){if(cancelled?.())throw new Error('cancelled');
    const cv=document.createElement('canvas');cv.width=AW;cv.height=AH;cx=cv.getContext('2d');cx.fillStyle='#fff';cx.fillRect(0,0,AW,AH);
    cx.drawImage(logo,M,34,LOGO.w*.8,LOGO.h*.8);
    cx.fillStyle=P.acc;cx.font=F(24,1);cx.textBaseline='alphabetic';cx.fillText('FORMULA SHEET · '+exam.toUpperCase(),M,150);
    const t=layout(chapter,56,AW-M*2,1);drawLay(t,M,162,AW-M*2,P.tx);cx.fillStyle=P.line;cx.fillRect(M,TOP-24,AW-M*2,2);
    pages[i].forEach((colList,c)=>{const x=M+c*(CW+GAP);for(const {b,y} of colList){
      cx.fillStyle='#f3f7fd';cx.strokeStyle=P.line;cx.lineWidth=2;cx.beginPath();cx.roundRect(x,y,CW,b.h,12);cx.fill();cx.stroke();
      drawLay(b.nm,x+14,y+12,CW-28,P.acc);drawLay(b.eq,x+14,y+12+b.nm.h+fs*.5,CW-28,P.tx)}});
    cx.fillStyle=P.dim;cx.font=F(20);cx.fillText('physica.in  ·  page '+(i+1)+' of '+pages.length,M,AH-40);
    out.push(new Uint8Array(await new Promise(r=>cv.toBlob(r,'image/jpeg',.93)).then(b=>b.arrayBuffer())));onProgress?.(i+1,pages.length);await new Promise(r=>setTimeout(r))}
  return makePDF(out,595,842,AW,AH)}
window.PhysicaRankExport={make,makeSheet};
})();
