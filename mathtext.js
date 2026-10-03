/* Equations as they are written in a textbook: "X_L", "v_top", "e^(−kt)", "L^a" are shown with real
   subscripts and superscripts — in page text (<sub>/<sup>) and in canvas drawings (smaller, raised or
   lowered glyphs). Plain text without _ or ^ is untouched. */
(() => {
'use strict';
const HAS=/[A-Za-zα-ωΑ-Ω0-9)\]°′'²³]_[A-Za-zα-ωΑ-Ω0-9{]|[A-Za-zα-ωΑ-Ω0-9)\]]\^[(0-9A-Za-zα-ω−\-{½⅓]/;
// Split into segments {t, k:'n'|'b'|'p'} (normal, sub, sup).
function parse(s){const out=[];let buf='';const push=(t,k)=>{if(!t)return;const last=out[out.length-1];if(last&&last.k===k)last.t+=t;else out.push({t,k})};
  for(let i=0;i<s.length;i++){const ch=s[i],prev=s[i-1]||'';
    if((ch==='_'||ch==='^')&&prev&&/[A-Za-zα-ωΑ-Ω0-9)\]°′'²³]/.test(prev)){const k=ch==='_'?'b':'p',rest=s.slice(i+1);let tok=null,len=0;
      if(rest[0]==='{'||rest[0]==='('){const open=rest[0],close=open==='{'?'}':')';let d=0,j=0;for(;j<rest.length;j++){if(rest[j]===open)d++;else if(rest[j]===close&&--d===0)break}if(j<rest.length){tok=rest.slice(1,j);len=j+1}}
      if(tok==null){const m=k==='b'?/^([A-ZΑ-Ω]|[a-zα-ω0-9,]+)/.exec(rest):/^([0-9.]+|[−\-][0-9.]+|[−\-]?[A-Za-zα-ω]|[½⅓¼])/.exec(rest);if(m){tok=m[1];len=m[0].length}}
      if(tok!=null){push(buf,'n');buf='';push(tok,k);i+=len;continue}}
    buf+=ch}
  push(buf,'n');return out}
window.PhysicaMath={parse,has:s=>HAS.test(s)};
// ---------- canvas ----------
const C2=window.CanvasRenderingContext2D;
if(C2){const P=C2.prototype,fill=P.fillText,stroke=P.strokeText,measure=P.measureText;
  const sizeOf=f=>{const m=/(\d+(?:\.\d+)?)px/.exec(f);return m?+m[1]:10};
  function layout(ctx,text){const segs=parse(String(text)),font=ctx.font,sz=sizeOf(font),small=font.replace(/(\d+(?:\.\d+)?)px/,()=>(sz*.72).toFixed(1)+'px');let w=0;
    for(const s of segs){ctx.font=s.k==='n'?font:small;s.w=measure.call(ctx,s.t).width;w+=s.w}ctx.font=font;return{segs,w,font,small,sz}}
  function draw(fn,ctx,text,x,y,maxW){if(typeof text!=='string'||!HAS.test(text))return fn.call(ctx,text,x,y,...(maxW===undefined?[]:[maxW]));
    const L=layout(ctx,text),al=ctx.textAlign,dir=ctx.direction==='rtl';let sx=x;if(al==='center')sx=x-L.w/2;else if(al==='right'||(al==='end'&&!dir)||(al==='start'&&dir))sx=x-L.w;
    const k=maxW!==undefined&&L.w>maxW&&maxW>0?maxW/L.w:1;ctx.save();ctx.textAlign='left';if(k<1){ctx.translate(sx,0);ctx.scale(k,1);ctx.translate(-sx,0)}
    for(const s of L.segs){ctx.font=s.k==='n'?L.font:L.small;const dy=s.k==='b'?L.sz*.28:s.k==='p'?-L.sz*.4:0;fn.call(ctx,s.t,sx,y+dy);sx+=s.w}ctx.restore()}
  P.fillText=function(t,x,y,m){draw(fill,this,t,x,y,m)};P.strokeText=function(t,x,y,m){draw(stroke,this,t,x,y,m)};
  P.measureText=function(t){if(typeof t!=='string'||!HAS.test(t))return measure.call(this,t);const base=measure.call(this,t.replace(/[_^{}]/g,'')),w=layout(this,t).w;
    return{width:w,actualBoundingBoxLeft:base.actualBoundingBoxLeft,actualBoundingBoxRight:w,actualBoundingBoxAscent:base.actualBoundingBoxAscent,actualBoundingBoxDescent:base.actualBoundingBoxDescent,fontBoundingBoxAscent:base.fontBoundingBoxAscent,fontBoundingBoxDescent:base.fontBoundingBoxDescent}}}
// ---------- page text ----------
const SKIP='script,style,textarea,input,select,option,canvas,svg,sub,sup,code,pre,[data-nomath]';
function fix(node){const t=node.nodeValue;if(!t||!HAS.test(t))return;const el=node.parentElement;if(!el||el.closest(SKIP))return;
  const segs=parse(t);if(!segs.some(x=>x.k!=='n'))return;const frag=document.createDocumentFragment();for(const s of segs){if(s.k==='n')frag.append(s.t);else{const e=document.createElement(s.k==='b'?'sub':'sup');e.textContent=s.t;frag.append(e)}}node.replaceWith(frag)}
function scan(root){if(root.nodeType===3){fix(root);return}if(root.nodeType!==1||root.closest?.(SKIP))return;const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT),list=[];while(w.nextNode())if(HAS.test(w.currentNode.nodeValue))list.push(w.currentNode);list.forEach(fix)}
function start(){scan(document.body);new MutationObserver(ms=>{for(const m of ms){if(m.type==='characterData')fix(m.target);else for(const n of m.addedNodes)scan(n)}}).observe(document.body,{childList:true,subtree:true,characterData:true})}
if(document.body)start();else document.addEventListener('DOMContentLoaded',start);
})();
