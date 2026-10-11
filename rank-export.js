/* Rank mode · PYQ slide export. Makes 16:9 black slides (one question per slide, room left for the solution) and saves them
   as a PDF (slides as pages) or as an editable PowerPoint (real text boxes). Built in the browser: no library, no server,
   nothing leaves the device. Loaded only when a student presses Download. */
(() => {
'use strict';
const W=1920,H=1080,PX=6350,FONT='system-ui,-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif',C={tx:'#ffffff',dim:'#9aa6bb',acc:'#7cc0ff',ok:'#6be3a8',line:'#2a3550'};
const PAD=96,LOGO={w:300,h:86,x:W-PAD-300,y:30};
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
function drawLay(L,x,y,w,col,al){let by=y;L.lines.forEach((l,i)=>{by+=(i?L.lead:0)+l.a;let px=al==='r'?x+w-l.w:x;for(const {wd,m} of l.ws){dNodes(wd,L.fs,px,by,col,L.b);px+=m.w+L.sp}by+=l.d})}

/* ---------- logo (white, see-through), drawn the same way as the site's brand mark ---------- */
async function logoCanvas(){try{await document.fonts.load('800 40px Orbitron')}catch{}
  const k=3,c=document.createElement('canvas');c.width=LOGO.w*k;c.height=LOGO.h*k;const g=c.getContext('2d');g.scale(k,k);g.globalAlpha=.55;g.strokeStyle='#fff';g.fillStyle='#fff';g.lineWidth=2.6;
  const s=1.5,mx=24*s,my=LOGO.h/2;g.save();g.translate(mx,my);g.rotate(-30*Math.PI/180);g.beginPath();g.arc(0,0,16*s,0,7);g.stroke();
  g.save();g.rotate(-25*Math.PI/180);g.beginPath();g.ellipse(0,0,18.5*s,6.5*s,0,0,7);g.stroke();g.restore();g.beginPath();g.arc(0,0,3.5*s,0,7);g.fill();g.restore();
  g.font=`800 ${27*1.15}px Orbitron,${FONT}`;g.textBaseline='middle';g.fillText('physica.',mx+24*s,my+2);return c}

/* ---------- slide specs: one list of elements, drawn on canvas (PDF) and written as shapes (PPT) ---------- */
const letters=(q)=>[].concat(q.c??[]).map(i=>'abcd'[i]);
const answerText=q=>q.o?letters(q).join(', '):q.n!=null?String(q.n):String(q.a||'').replace(/\s{2,}/g,'   ');
const txt=(x,y,w,paras)=>({t:'text',x,y,w,paras,h:0});
function fit(make,from,to,maxH){for(let fs=from;fs>=to;fs-=2){const r=make(fs);if(r.h<=maxH||fs-2<to)return r}}
function optBlock(opts,fs,w){const fo=fs*.94,lw=fo*2.2,gap=fo*.6;
  for(const cols of [2,1]){const cw=cols===2?(w-gap*2)/2:w,ls=opts.map(o=>layout(o,fo,cw-lw));
    if(cols===2&&(ls.some(l=>l.lines.length>2)||opts.length%2))continue;
    const cells=[];let y=0;for(let i=0;i<opts.length;i+=cols){const row=ls.slice(i,i+cols),rh=Math.max(...row.map(l=>l.h));row.forEach((l,j)=>cells.push({i:i+j,x:j*(cw+gap*2),y,w:cw,l}));y+=rh+fo*.45}
    return{cells,h:y-fo*.45,fo,lw,cols}}}
async function figCanvas(q){if(!q.fig||!window.PhysicaFig)return null;try{const g=window.PhysicaFig(q.fig);if(!g)return null;g.setAttribute('style','color:#fff');g.setAttribute('font-family','Arial,Helvetica,sans-serif');const vb=g.viewBox.baseVal,w=vb.width||240,h=vb.height||140;g.setAttribute('width',w);g.setAttribute('height',h);g.setAttribute('xmlns','http://www.w3.org/2000/svg');
  const img=new Image();img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(new XMLSerializer().serializeToString(g));await img.decode();const k=3,c=document.createElement('canvas');c.width=w*k;c.height=h*k;c.getContext('2d').drawImage(img,0,0,w*k,h*k);return{c,ar:w/h}}catch{return null}}
const rect=(x,y,w,h,fill)=>({t:'rect',x,y,w,h,fill});
function frame(meta,n,N){return[rect(0,0,W,H,'#000000'),{t:'img',k:'logo',...LOGO},txt(PAD,H-58,500,[{s:n+' / '+N,fs:24,c:C.dim}])]}
async function questionSlide(q,i,N,withSol,meta,topic){const els=frame(meta,i+1,N),fig=await figCanvas(q);
  els.push(txt(PAD,36,W-PAD*2-LOGO.w-40,[{s:'Q'+(i+1)+'   '+q.y,fs:36,c:C.tx,b:1,q:'Q'+(i+1)}]),txt(PAD,90,W-PAD*2-LOGO.w-40,[{s:topic,fs:26,c:C.dim}]));
  const top=170,areaH=430,figW=fig?Math.min(560,Math.round(areaH*fig.ar)):0,qW=W-PAD*2-(fig?figW+50:0);
  const blk=fit(fs=>{const ql=layout(q.q,fs,qW);const ob=q.o?optBlock(q.o,fs,W-PAD*2):null;return{fs,ql,ob,h:ql.h+(ob?fs*.7+ob.h:0)}},46,22,areaH);
  const qEl=txt(PAD,top,qW,[{s:q.q,fs:blk.fs,c:C.tx}]);qEl.h=blk.ql.h;els.push(qEl);
  if(fig)els.push({t:'img',k:'fig'+i,x:W-PAD-figW,y:top,w:figW,h:figW/fig.ar,canvas:fig.c});
  if(blk.ob){const oy=top+Math.max(blk.ql.h,fig?figW/fig.ar:0)+blk.fs*.7,ob=blk.ob;for(const c of ob.cells){const e=txt(PAD+c.x,oy+c.y,c.w,[{s:q.o[c.i],fs:ob.fo,c:C.tx,label:'('+'abcd'[c.i]+')',lw:ob.lw}]);e.h=c.l.h;e.opt=1;els.push(e)}}
  els.push(rect(PAD,616,W-PAD*2,2,'#2a3550'),txt(PAD,628,400,[{s:withSol?'SOLUTION':'SOLUTION  ·  working space',fs:22,c:C.dim}]));
  if(withSol){const lines=['Answer: '+(q.o?letters(q).map(l=>'('+l+')').join(' ')+'  '+[].concat(q.c).map(k=>q.o[k]).join(';  '):answerText(q)),...String(q.s||'').split('\n').filter(Boolean)];
    const r=fit(fs=>{const ls=lines.map((s,j)=>layout(s,fs,W-PAD*2,j===0));return{fs,ls,h:ls.reduce((a,l)=>a+l.h,0)+fs*.55*(ls.length-1)}},34,18,360);
    const e=txt(PAD,672,W-PAD*2,lines.map((s,j)=>({s,fs:r.fs,c:j?C.tx:C.ok,b:j===0,gap:r.fs*.55})));e.h=r.h;els.push(e)}
  else{const e=txt(W-PAD-760,H-70,760,[{s:'Ans: '+answerText(q),fs:34,c:C.acc,b:1,al:'r'}]);e.h=48;els.push(e)}
  return els}
function titleSlide(meta,N,withSol){const els=[rect(0,0,W,H,'#000000'),{t:'img',k:'logo',...LOGO}];
  els.push(txt(PAD,120,1300,[{s:'PREVIOUS YEAR QUESTIONS',fs:32,c:C.acc,b:1}]),txt(PAD,176,W-PAD*2,[{s:meta.chapter,fs:88,c:C.tx,b:1}]),
    txt(PAD,300,W-PAD*2,[{s:meta.exam+'  ·  '+meta.subject+'  ·  '+meta.cls,fs:42,c:C.tx}]),txt(PAD,364,W-PAD*2,[{s:'Papers: '+meta.papers.join('  ·  '),fs:30,c:C.dim}]));
  els.push(rect(PAD,430,W-PAD*2,2,'#2a3550'),txt(PAD,446,600,[{s:'TOPICS INCLUDED',fs:24,c:C.acc,b:1}]));
  const paras=meta.topics.flatMap(t=>[{s:t.name+'  ('+t.n+')',b:1,c:C.tx},{s:t.subs.map(s=>s[0]+' ('+s[1]+')').join('   ·   '),c:C.dim}]);
  const r=fit(fs=>{const ls=paras.map(p=>layout(p.s,fs,W-PAD*2,p.b));return{fs,h:ls.reduce((a,l)=>a+l.h,0)+fs*.35*(ls.length-1)}},32,16,500);
  const e=txt(PAD,490,W-PAD*2,paras.map(p=>({...p,fs:r.fs,gap:r.fs*.35})));e.h=r.h;els.push(e);
  els.push(txt(PAD,H-70,1200,[{s:N+' questions  ·  '+(withSol?'questions with solutions':'questions only'),fs:30,c:C.dim}]),txt(W-PAD-400,H-70,400,[{s:'physica.in',fs:30,c:C.dim,al:'r'}]));
  return els}

/* ---------- canvas drawing (for the PDF) ---------- */
function drawSlide(els,logo){const cv=document.createElement('canvas');cv.width=W;cv.height=H;cx=cv.getContext('2d');cx.lineCap='round';
  for(const e of els){
    if(e.t==='rect'){cx.fillStyle=e.fill;cx.fillRect(e.x,e.y,e.w,e.h)}
    else if(e.t==='img')cx.drawImage(e.k==='logo'?logo:e.canvas,e.x,e.y,e.w,e.h);
    else{let y=e.y;for(const p of e.paras){const lw=p.lw||0,L=layout(p.s,p.fs,e.w-lw,p.b);
      if(p.label){cx.font=F(p.fs,1);cx.fillStyle=C.acc;cx.textBaseline='alphabetic';cx.fillText(p.label,e.x,y+L.lines[0].a)}
      drawLay(L,e.x+lw,y,e.w-lw,p.c,p.al);y+=L.h+(p.gap||0)}}}
  return cv}

/* ---------- PDF: one JPEG page per slide ---------- */
function makePDF(pages){const enc=new TextEncoder(),parts=[],off=[];let len=0;const put=x=>{const b=typeof x==='string'?enc.encode(x):x;parts.push(b);len+=b.length};
  const N=pages.length;put('%PDF-1.4\n');put(new Uint8Array([37,226,227,207,211,10]));
  const obj=(n,fn)=>{off[n]=len;put(n+' 0 obj\n');fn();put('\nendobj\n')};
  obj(1,()=>put('<< /Type /Catalog /Pages 2 0 R >>'));
  obj(2,()=>put('<< /Type /Pages /Count '+N+' /Kids ['+pages.map((_,i)=>(3+i*3)+' 0 R').join(' ')+'] >>'));
  pages.forEach((p,i)=>{const pg=3+i*3;
    obj(pg,()=>put('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 960 540] /Contents '+(pg+1)+' 0 R /Resources << /XObject << /I '+(pg+2)+' 0 R >> >> >>'));
    const cs='q 960 0 0 540 0 0 cm /I Do Q';obj(pg+1,()=>{put('<< /Length '+cs.length+' >>\nstream\n'+cs+'\nendstream')});
    obj(pg+2,()=>{put('<< /Type /XObject /Subtype /Image /Width '+W+' /Height '+H+' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length '+p.length+' >>\nstream\n');put(p);put('\nendstream')})});
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
  if(e.t==='rect')return'<p:sp><p:nvSpPr><p:cNvPr id="'+id+'" name="Panel '+id+'"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr><p:spPr>'+xf+'<a:solidFill><a:srgbClr val="'+hex(e.fill)+'"/></a:solidFill><a:ln><a:noFill/></a:ln></p:spPr></p:sp>';
  if(e.t==='img')return'<p:pic><p:nvPicPr><p:cNvPr id="'+id+'" name="'+(e.k==='logo'?'Physica logo':'Diagram')+'"/><p:cNvPicPr><a:picLocks noChangeAspect="1"/></p:cNvPicPr><p:nvPr/></p:nvPicPr><p:blipFill><a:blip r:embed="'+rel+'"/><a:stretch><a:fillRect/></a:stretch></p:blipFill><p:spPr>'+xf+'</p:spPr></p:pic>';
  const ps=e.paras.map(p=>{const rs=[];if(p.label)rs.push(run(p.label+'  ',p.fs,C.acc,1));for(const r of runs(parse(p.s)))rs.push(run(r.s,p.fs,p.c,p.b,r.sup));
    return'<a:p><a:pPr algn="'+(p.al==='r'?'r':p.al==='c'?'ctr':'l')+'"><a:spcBef><a:spcPts val="0"/></a:spcBef><a:spcAft><a:spcPts val="'+Math.round((p.gap||0)*50)+'"/></a:spcAft></a:pPr>'+rs.join('')+'</a:p>'});
  return'<p:sp><p:nvSpPr><p:cNvPr id="'+id+'" name="Text '+id+'"/><p:cNvSpPr txBox="1"/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="'+emu(e.x)+'" y="'+emu(e.y)+'"/><a:ext cx="'+emu(e.w)+'" cy="'+emu(Math.max(e.h*1.12,e.paras[0].fs*1.5))+'"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:noFill/></p:spPr><p:txBody><a:bodyPr wrap="square" lIns="0" tIns="0" rIns="0" bIns="0" rtlCol="0" anchor="t"><a:noAutofit/></a:bodyPr><a:lstStyle/>'+ps.join('')+'</p:txBody></p:sp>'}
const NS='xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"',XH='<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n',REL='http://schemas.openxmlformats.org/officeDocument/2006/relationships/',GRP='<p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>';
const THEME=XH+'<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="Physica"><a:themeElements><a:clrScheme name="Physica"><a:dk1><a:srgbClr val="000000"/></a:dk1><a:lt1><a:srgbClr val="FFFFFF"/></a:lt1><a:dk2><a:srgbClr val="0B1220"/></a:dk2><a:lt2><a:srgbClr val="9AA6BB"/></a:lt2><a:accent1><a:srgbClr val="7CC0FF"/></a:accent1><a:accent2><a:srgbClr val="6BE3A8"/></a:accent2><a:accent3><a:srgbClr val="FFB347"/></a:accent3><a:accent4><a:srgbClr val="FF9D9D"/></a:accent4><a:accent5><a:srgbClr val="2B6CFF"/></a:accent5><a:accent6><a:srgbClr val="9AA6BB"/></a:accent6><a:hlink><a:srgbClr val="7CC0FF"/></a:hlink><a:folHlink><a:srgbClr val="9AA6BB"/></a:folHlink></a:clrScheme><a:fontScheme name="Physica"><a:majorFont><a:latin typeface="Arial"/><a:ea typeface=""/><a:cs typeface=""/></a:majorFont><a:minorFont><a:latin typeface="Arial"/><a:ea typeface=""/><a:cs typeface=""/></a:minorFont></a:fontScheme><a:fmtScheme name="Physica"><a:fillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:fillStyleLst><a:lnStyleLst><a:ln w="9525"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln><a:ln w="19050"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln><a:ln w="28575"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln></a:lnStyleLst><a:effectStyleLst><a:effectStyle><a:effectLst/></a:effectStyle><a:effectStyle><a:effectLst/></a:effectStyle><a:effectStyle><a:effectLst/></a:effectStyle></a:effectStyleLst><a:bgFillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:bgFillStyleLst></a:fmtScheme></a:themeElements></a:theme>';
const BG='<p:bg><p:bgPr><a:solidFill><a:srgbClr val="000000"/></a:solidFill><a:effectLst/></p:bgPr></p:bg>';
async function makePPTX(slides,logo){const files=[],N=slides.length,png=async c=>new Uint8Array(await new Promise(r=>c.toBlob(r,'image/png')).then(b=>b.arrayBuffer()));
  files.push({name:'media/logo.png',data:await png(logo)});const slideXml=[],slideRels=[];let figN=0;
  for(let s=0;s<N;s++){let id=2,sp='';const rels=['<Relationship Id="rId1" Type="'+REL+'slideLayout" Target="../slideLayouts/slideLayout1.xml"/>'];
    for(const e of slides[s]){let rel='';if(e.t==='img'){if(e.k==='logo')rel='rId2';else{const nm='fig'+(++figN)+'.png';files.push({name:'media/'+nm,data:await png(e.canvas)});rel='rId'+(10+figN);rels.push('<Relationship Id="'+rel+'" Type="'+REL+'image" Target="../media/'+nm+'"/>')}}
      if(e.t==='rect'&&e.w===W&&e.h===H)continue;sp+=shape(e,id++,rel)}
    rels.push('<Relationship Id="rId2" Type="'+REL+'image" Target="../media/logo.png"/>');
    slideXml.push(XH+'<p:sld '+NS+'><p:cSld>'+BG+'<p:spTree>'+GRP+sp+'</p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sld>');slideRels.push(XH+'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'+rels.join('')+'</Relationships>')}
  const out=[{name:'[Content_Types].xml',data:XH+'<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="png" ContentType="image/png"/><Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/><Override PartName="/ppt/slideMasters/slideMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml"/><Override PartName="/ppt/slideLayouts/slideLayout1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/><Override PartName="/ppt/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/>'+slides.map((_,i)=>'<Override PartName="/ppt/slides/slide'+(i+1)+'.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>').join('')+'</Types>'},
    {name:'_rels/.rels',data:XH+'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="'+REL+'officeDocument" Target="ppt/presentation.xml"/></Relationships>'},
    {name:'ppt/presentation.xml',data:XH+'<p:presentation '+NS+'><p:sldMasterIdLst><p:sldMasterId id="2147483648" r:id="rId1"/></p:sldMasterIdLst><p:sldIdLst>'+slides.map((_,i)=>'<p:sldId id="'+(256+i)+'" r:id="rId'+(3+i)+'"/>').join('')+'</p:sldIdLst><p:sldSz cx="12192000" cy="6858000"/><p:notesSz cx="6858000" cy="9144000"/></p:presentation>'},
    {name:'ppt/_rels/presentation.xml.rels',data:XH+'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="'+REL+'slideMaster" Target="slideMasters/slideMaster1.xml"/><Relationship Id="rId2" Type="'+REL+'theme" Target="theme/theme1.xml"/>'+slides.map((_,i)=>'<Relationship Id="rId'+(3+i)+'" Type="'+REL+'slide" Target="slides/slide'+(i+1)+'.xml"/>').join('')+'</Relationships>'},
    {name:'ppt/theme/theme1.xml',data:THEME},
    {name:'ppt/slideMasters/slideMaster1.xml',data:XH+'<p:sldMaster '+NS+'><p:cSld>'+BG+'<p:spTree>'+GRP+'</p:spTree></p:cSld><p:clrMap bg1="dk1" tx1="lt1" bg2="dk2" tx2="lt2" accent1="accent1" accent2="accent2" accent3="accent3" accent4="accent4" accent5="accent5" accent6="accent6" hlink="hlink" folHlink="folHlink"/><p:sldLayoutIdLst><p:sldLayoutId id="2147483649" r:id="rId1"/></p:sldLayoutIdLst></p:sldMaster>'},
    {name:'ppt/slideMasters/_rels/slideMaster1.xml.rels',data:XH+'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="'+REL+'slideLayout" Target="../slideLayouts/slideLayout1.xml"/><Relationship Id="rId2" Type="'+REL+'theme" Target="../theme/theme1.xml"/></Relationships>'},
    {name:'ppt/slideLayouts/slideLayout1.xml',data:XH+'<p:sldLayout '+NS+' type="blank" preserve="1"><p:cSld name="Blank"><p:spTree>'+GRP+'</p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sldLayout>'},
    {name:'ppt/slideLayouts/_rels/slideLayout1.xml.rels',data:XH+'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="'+REL+'slideMaster" Target="../slideMasters/slideMaster1.xml"/></Relationships>'}];
  slideXml.forEach((x,i)=>{out.push({name:'ppt/slides/slide'+(i+1)+'.xml',data:x},{name:'ppt/slides/_rels/slide'+(i+1)+'.xml.rels',data:slideRels[i]})});
  return zip([...out,...files.map(f=>({name:'ppt/'+f.name,data:f.data}))])}

/* ---------- public: build the file ---------- */
async function make({items,withSol,format,meta,onProgress,cancelled}){
  const c0=document.createElement('canvas');c0.width=W;c0.height=H;cx=c0.getContext('2d');
  const logo=await logoCanvas(),N=items.length,specs=[titleSlide(meta,N,withSol)];
  for(let i=0;i<N;i++){if(cancelled?.())throw new Error('cancelled');specs.push(await questionSlide(items[i].q,i,N,withSol,meta,items[i].topic));onProgress?.(i+1,N+1);if(i%4===3)await new Promise(r=>setTimeout(r))}
  for(const sp of specs)for(const e of sp)if(e.t==='text')e.h=e.paras.reduce((a,p)=>a+layout(p.s,p.fs,e.w-(p.lw||0),p.b).h+(p.gap||0),0);
  if(format==='ppt')return makePPTX(specs,logo);
  const jpgs=[];for(let i=0;i<specs.length;i++){if(cancelled?.())throw new Error('cancelled');const cv=drawSlide(specs[i],logo);jpgs.push(new Uint8Array(await new Promise(r=>cv.toBlob(r,'image/jpeg',.82)).then(b=>b.arrayBuffer())));onProgress?.(N+1,N+1,i+1,specs.length);await new Promise(r=>setTimeout(r))}
  return makePDF(jpgs)}
window.PhysicaRankExport={make};
})();
