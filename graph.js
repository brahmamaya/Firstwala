/* Shared SVG graph (axes, nice ticks, least-squares line or joined curve, marker, branch gaps) used by the Explore panel. */
(() => {
'use strict';
const el=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
const num=s=>{s=String(s).replace(/−/g,'-').replace(/≈/g,'');const sup='⁻⁰¹²³⁴⁵⁶⁷⁸⁹',m=s.match(/(-?\d+(?:\.\d+)?)(?:\s*×\s*10([⁻⁰¹²³⁴⁵⁶⁷⁸⁹]+))?/);if(!m)return NaN;
  let v=+m[1];if(m[2])v*=10**+[...m[2]].map(c=>'-0123456789'[sup.indexOf(c)]).join('');return v};
const fx=(v,d=2)=>Number.isFinite(v)?(Math.abs(v)<1e-12?0:v).toFixed(d):'—';
const mean=a=>a.reduce((s,v)=>s+v,0)/a.length;
// least squares y = a + b x (or y = b x through the origin)
function fit(P,origin){const n=P.length;if(n<2)return null;if(origin){const sxy=P.reduce((s,[x,y])=>s+x*y,0),sxx=P.reduce((s,[x])=>s+x*x,0);return sxx?{b:sxy/sxx,a:0}:null}
  const mx=mean(P.map(p=>p[0])),my=mean(P.map(p=>p[1])),sxx=P.reduce((s,[x])=>s+(x-mx)**2,0);if(!sxx)return null;const b=P.reduce((s,[x,y])=>s+(x-mx)*(y-my),0)/sxx;return{b,a:my-b*mx}}
/* Graph: axes with round ticks, points, and either a least-squares line or a joined curve. */
const NS='http://www.w3.org/2000/svg';
function svg(t,a){const e=document.createElementNS(NS,t);for(const k in a)e.setAttribute(k,a[k]);return e}
function nice(lo,hi){if(lo===hi){lo-=1;hi+=1}const step0=(hi-lo)/5,mag=10**Math.floor(Math.log10(step0)),st=[1,2,2.5,5,10].map(k=>k*mag).find(s=>s>=step0);return{lo:Math.floor(lo/st)*st,hi:Math.ceil(hi/st)*st,st}}
function graph(g,R){const P=R.map(r=>[g.x(r),g.y(r)]).filter(p=>p.every(Number.isFinite));if(P.length<2)return null;
  const W=480,H=300,L=62,B=48,T=14,Rm=28,xs=P.map(p=>p[0]),ys=P.map(p=>p[1]);
  const X=nice(Math.min(...xs,g.origin?0:Infinity),Math.max(...xs,g.origin?0:-Infinity)),Y=g.ylim?nice(g.ylim[0],g.ylim[1]):nice(Math.min(...ys,g.origin?0:Infinity),Math.max(...ys,g.origin?0:-Infinity));
  const sx=v=>L+(v-X.lo)/(X.hi-X.lo)*(W-L-Rm),sy=v=>H-B-(v-Y.lo)/(Y.hi-Y.lo)*(H-B-T);
  const s=svg('svg',{viewBox:`0 0 ${W} ${H}`,class:'lab-graph',role:'img','aria-label':`${g.yl} against ${g.xl}`});
  const dg=st=>Math.max(0,Math.min(4,-Math.floor(Math.log10(st)+1e-9)+(String(st).includes('.25')||String(st).includes('.5')?1:0)));
  const tk=(v,st)=>Math.abs(v)<st/1e6?'0':st<1e-3||Math.abs(v)>=1e5?(([m,e])=>m+'×10'+String(+e).replace(/[-0-9]/g,d=>'⁻⁰¹²³⁴⁵⁶⁷⁸⁹'['-0123456789'.indexOf(d)]))(v.toExponential(1).split('e')):fx(v,dg(st));
  for(let v=X.lo;v<=X.hi+X.st/2;v+=X.st){const x=sx(v);s.append(svg('line',{x1:x,y1:T,x2:x,y2:H-B,class:'lab-grid'}));const t=svg('text',{x,y:H-B+16,'text-anchor':'middle'});t.textContent=tk(v,X.st);s.append(t)}
  for(let v=Y.lo;v<=Y.hi+Y.st/2;v+=Y.st){const y=sy(v);s.append(svg('line',{x1:L,y1:y,x2:W-Rm,y2:y,class:'lab-grid'}));const t=svg('text',{x:L-6,y:y+4,'text-anchor':'end'});t.textContent=tk(v,Y.st);s.append(t)}
  s.append(svg('path',{d:`M${L} ${T}V${H-B}H${W-Rm}`,class:'lab-axis'}));
  const xl=svg('text',{x:(L+W-Rm)/2,y:H-8,'text-anchor':'middle',class:'lab-al'});xl.textContent=g.xl;const yl=svg('text',{x:14,y:(T+H-B)/2,'text-anchor':'middle',class:'lab-al',transform:`rotate(-90 14 ${(T+H-B)/2})`});yl.textContent=g.yl;s.append(xl,yl);
  let note='';
  if(g.curve){const Q=[...P].sort((a,b)=>a[0]-b[0]),cid='lc'+(++graph.n),cp=svg('clipPath',{id:cid});cp.append(svg('rect',{x:L,y:T,width:W-L-Rm,height:H-B-T}));s.append(cp);
    s.append(svg('path',{d:Q.map((p,i)=>(i&&!(g.gap&&Math.abs(p[1]-Q[i-1][1])>g.gap&&p[1]*Q[i-1][1]<0)?'L':'M')+sx(p[0]).toFixed(1)+' '+sy(p[1]).toFixed(1)).join(''),class:'lab-fit','clip-path':`url(#${cid})`}))}
  else{const f=fit(P,g.origin);if(f){const x0=g.origin?Math.min(0,X.lo):X.lo,x1=X.hi,cl=v=>Math.max(Y.lo,Math.min(Y.hi,v));
    // clip the fitted line to the plot box
    const pts=[];for(const x of[x0,x1]){const y=f.a+f.b*x;pts.push([x,y])}if(f.b){for(const yb of[Y.lo,Y.hi]){const x=(yb-f.a)/f.b;if(x>=x0&&x<=x1)pts.push([x,yb])}}
    const inb=pts.filter(([x,y])=>y>=Y.lo-1e-12&&y<=Y.hi+1e-12).sort((a,b)=>a[0]-b[0]);if(inb.length>1){const a=inb[0],b=inb[inb.length-1];s.append(svg('line',{x1:sx(a[0]),y1:sy(cl(a[1])),x2:sx(b[0]),y2:sy(cl(b[1])),class:'lab-fit'}))}
    note=`${g.slope||'slope'} = ${fx(f.b,g.sd??3)}`+(g.origin?'':`, intercept = ${fx(f.a,g.sd??3)}`)}}
  if(!g.nodots)for(const [x,y] of P)s.append(svg('circle',{cx:sx(x),cy:sy(y),r:4.5,class:'lab-pt'}));
  if(g.mark&&g.mark.every(Number.isFinite)&&g.mark[0]>=X.lo&&g.mark[0]<=X.hi)s.append(svg('circle',{cx:sx(g.mark[0]),cy:sy(Math.max(Y.lo,Math.min(Y.hi,g.mark[1]))),r:7,class:'lab-mark'}));
  const box=el('figure','lab-fig');box.append(s);const cap=el('figcaption','',`${g.yl} vs ${g.xl}${note?' — best-fit line: '+note:''}`);box.append(cap);return box}

graph.n=0;window.PhysicaLabGraph=graph;window.PhysicaNum=num;
})();
