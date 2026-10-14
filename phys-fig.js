/* Diagram renderer shared by the Rank mode pack and the tutor pack (window.PhysicaFig). */
(() => {
'use strict';
// Diagrams are small drawings kept as data: {w,h,alt,d:[item...]} with items
//   ['l',x1,y1,x2,y2,opt] line   ['p',pathData,opt] path   ['c',cx,cy,r,opt] circle   ['r',x,y,w,h,opt] box
//   ['t',x,y,text,opt] label.   opt letters: d dashed, a arrow at the end, b arrows at both ends, f light fill,
//   F solid fill, B thick, m centred text, e right-aligned text, s small text. Drawn with DOM calls (no HTML strings).
const SVG='http://www.w3.org/2000/svg',num=v=>typeof v==='number'&&isFinite(v),PATH=/^[MLHVCSQTAZmlhvcsqtaz0-9.,\s-]+$/;let figN=0;
function fig(f){if(!f||!Array.isArray(f.d))return null;
  const mk=(t,o)=>{const e=document.createElementNS(SVG,t);for(const k in o)e.setAttribute(k,o[k]);return e},w=num(f.w)?f.w:240,h=num(f.h)?f.h:140,id='pf'+(++figN);
  const s=mk('svg',{viewBox:`0 0 ${w} ${h}`,class:'fig',role:'img','aria-label':String(f.alt||'Diagram')}),defs=mk('defs',{}),m=mk('marker',{id,viewBox:'0 0 10 10',refX:'9',refY:'5',markerWidth:'7',markerHeight:'7',orient:'auto-start-reverse'});
  m.append(mk('path',{d:'M0 0L10 5L0 10z',fill:'currentColor',stroke:'none'}));defs.append(m);s.append(defs);
  for(const it of f.d){if(!Array.isArray(it))continue;const [t,...a]=it,n={l:4,c:3,r:4,t:2,p:0}[t];if(n===undefined||!a.slice(0,n).every(num))continue;
    const opt=String(a[t==='p'?1:t==='t'?3:n]||''),st={stroke:'currentColor',fill:opt.includes('F')?'currentColor':opt.includes('f')?'currentColor':'none','stroke-width':opt.includes('B')?'2.6':'1.6','stroke-linecap':'round','stroke-linejoin':'round'};
    if(opt.includes('f'))st['fill-opacity']='.16';if(opt.includes('d'))st['stroke-dasharray']='5 4';if(opt.includes('a')||opt.includes('b'))st['marker-end']=`url(#${id})`;if(opt.includes('b'))st['marker-start']=`url(#${id})`;
    let e;
    if(t==='l')e=mk('line',{x1:a[0],y1:a[1],x2:a[2],y2:a[3],...st});
    else if(t==='c')e=mk('circle',{cx:a[0],cy:a[1],r:a[2],...st});
    else if(t==='r')e=mk('rect',{x:a[0],y:a[1],width:a[2],height:a[3],...st});
    else if(t==='p'){if(typeof a[0]!=='string'||!PATH.test(a[0]))continue;e=mk('path',{d:a[0],...st})}
    else{e=mk('text',{x:a[0],y:a[1],fill:'currentColor',stroke:'none','font-size':opt.includes('s')?'10':'12','text-anchor':opt.includes('m')?'middle':opt.includes('e')?'end':'start'});e.textContent=String(a[2]??'')}
    s.append(e)}
  return s}
window.PhysicaFig=fig;
})();
