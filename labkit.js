/* Shared helpers for the 3D experiment packs (seventh.js – tenth.js).
   Each pack registers experiments exactly like the earlier packs, plus `view3d`
   so the stage offers orbit-camera controls. */
(() => {
'use strict';
const PI=Math.PI,TAU=2*PI;
const R=(key,label,min,max,step,initial,unit='',digits=0)=>({key,label,min,max,step,initial,unit,digits});
const S=(key,label,initial,options)=>({key,label,initial,options});
const f=(v,n=2)=>{if(!Number.isFinite(v))return'—';if(v===0||Math.abs(v)<1e-40)return'0';const a=Math.abs(v);if(a>=1e5||a<1e-3){const [m,e]=Number(v).toExponential(Math.max(1,Math.min(n,3))).split('e');const sup=String(Number(e)).replace(/[-0-9]/g,d=>'⁻⁰¹²³⁴⁵⁶⁷⁸⁹'['-0123456789'.indexOf(d)]);return`${m} × 10${sup}`}return Number(v).toFixed(n)};
const N=(label,v,unit='',n=2)=>({label,value:typeof v==='number'?`${f(v,n)} ${unit}`.trim():String(v)});
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),rad=d=>d*PI/180,deg=r=>r*180/PI,cycle=(t,n)=>((t%n)+n)%n;
const cache=new Map();
function memo(key,fn){if(cache.has(key))return cache.get(key);if(cache.size>60)cache.delete(cache.keys().next().value);const v=fn();cache.set(key,v);return v}

function tag(c,s,x,y,col='#e9f6ff',size=15,align='left',weight='600'){c.save();c.font=`${weight} ${size}px system-ui, sans-serif`;c.textAlign=align;c.textBaseline='middle';c.lineWidth=3;c.strokeStyle='#081624bb';c.strokeText(String(s),x,y);c.fillStyle=col;c.fillText(String(s),x,y);c.restore()}
// A compact HUD graph: series = [{fn|pts, col, dash}], with an optional marker.
function chart(c,x,y,w,h,o){(window.__chartRects||(window.__chartRects=[])).push([x-4,y-4,x+w+4,y+h+4]);const {xmin,xmax,series=[],marker,title,xl,yl}=o;const pts=series.map(s=>s.pts||Array.from({length:121},(_,i)=>{const X=xmin+(xmax-xmin)*i/120;return[X,s.fn(X)]}));
  const ys=pts.flat().map(p=>p[1]).filter(Number.isFinite);let lo=o.ymin??Math.min(0,...ys),hi=o.ymax??Math.max(...ys,lo+1e-9);if(hi-lo<1e-12)hi=lo+1;
  const X=v=>x+8+(v-xmin)/(xmax-xmin)*(w-16),Y=v=>y+h-8-(clamp(v,lo,hi)-lo)/(hi-lo)*(h-30);
  c.save();c.beginPath();c.roundRect(x,y,w,h,8);c.fillStyle='#0d2132e6';c.fill();c.strokeStyle='#294358';c.lineWidth=1;c.stroke();
  if(lo<0&&hi>0){c.beginPath();c.moveTo(x+8,Y(0));c.lineTo(x+w-8,Y(0));c.strokeStyle='#3c5a6e';c.stroke()}
  pts.forEach((P,i)=>{const s=series[i];c.beginPath();let on=false;for(const [a,b] of P){if(!Number.isFinite(b)){on=false;continue}on?c.lineTo(X(a),Y(b)):c.moveTo(X(a),Y(b));on=true}c.setLineDash(s.dash||[]);c.strokeStyle=s.col||'#42d9ca';c.lineWidth=s.w||2.2;c.stroke();c.setLineDash([])});
  if(marker&&Number.isFinite(marker[1])){c.beginPath();c.arc(X(marker[0]),Y(marker[1]),5,0,TAU);c.fillStyle=marker[2]||'#ffc36b';c.fill()}
  c.restore();if(title)tag(c,title,x+10,y+12,'#e9f6ff',12);if(xl)tag(c,xl,x+w-8,y+h-10,'#8ca6b9',11,'right','500');if(yl)tag(c,yl,x+w-8,y+12,'#8ca6b9',11,'right','500')}

function pack(){
  const entries=[];
  function add(o){
    const s={base:o.base,id:o.id,title:o.title,description:o.description,formula:o.formula,observe:o.observe,try:o.tryText,controls:o.controls,metrics:o.metrics,renderer:o.draw,draw:o.id,view3d:o.flat!==true};
    // Biology experiments declare their own NCERT chapter instead of extending a physics one.
    if(o.chapter)Object.assign(s,{subject:o.subject||'biology',grade:o.grade,group:o.group,chapter:o.chapter,chapterNo:o.chapterNo});
    entries.push(s);
    const numeric=o.controls.filter(c=>!c.options),last=numeric[numeric.length-1];
    const presets=(o.presets||[]).map(([label,values])=>({label,values}));
    if(!presets.length&&last)presets.push({label:'Starting values',values:Object.fromEntries(o.controls.map(c=>[c.key,c.initial]))},{label:'Minimum '+last.label.toLowerCase(),values:{[last.key]:last.min}},{label:'Maximum '+last.label.toLowerCase(),values:{[last.key]:last.max}});
    else presets.unshift({label:'Starting values',values:Object.fromEntries(o.controls.map(c=>[c.key,c.initial]))});
    window.SimulationLessons[o.id]={worked:(p,t)=>o.metrics(p,t).map(m=>m.label+': '+m.value).join(' · '),assumption:o.assumption,presets};
  }
  function done(){
    window.ExtraSimulations.push(...entries);
    const previous=window.PhysicsDraw.draw,byId=new Map(entries.map(s=>[s.id,s]));
    window.PhysicsDraw.draw=(c,id,p,t)=>{const s=byId.get(id);if(!s)return previous(c,id,p,t);window.PhysicaRenderExperiment(c,s,p,t,s.renderer)};
    window.PhysicsDraw.available.push(...byId.keys());
    // a subject pack that arrives after the library is built fills in the placeholders it listed
    const lib=window.PhysicaSims;if(!lib)return;const index=new Map(lib.map(s=>[s.id,s]));
    for(const e of entries){const s=index.get(e.id);if(!s)continue;const {subject,draw,...rest}=e;Object.assign(s,rest);delete s.lazy}
    window.dispatchEvent(new CustomEvent('physica-pack',{detail:[...byId.keys()]}));
  }
  return{add,done};
}
window.PhysicaLab={R,S,N,f,clamp,rad,deg,cycle,memo,tag,chart,pack,PI,TAU,G:9.81,
  C:{mint:'#42d9ca',gold:'#ffc36b',blue:'#7baaff',red:'#ff857e',purple:'#b89dff',white:'#e9f6ff',muted:'#8ca6b9',line:'#29475b',steel:'#9fb4c2',wood:'#b07a46',glass:'#7fc8e8',copper:'#d9844a'}};
})();
