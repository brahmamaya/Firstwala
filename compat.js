/* Small polyfills so the lab also runs on older tablets and phones (Safari < 16, Chrome < 99). */
(() => {
'use strict';
// A shared link (#sim-id) opens the experiment directly: hide the landing page from the very first paint.
if(location.hash.length>1)document.documentElement.classList.add('deep');
if(!Object.hasOwn)Object.hasOwn=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
if(!Array.prototype.at)Object.defineProperty(Array.prototype,'at',{value(n){n=Math.trunc(n)||0;if(n<0)n+=this.length;return n<0||n>=this.length?undefined:this[n]},writable:true,configurable:true});
const rr=function(x,y,w,h,r=0){let a=Array.isArray(r)?r:[r];a=a.map(v=>typeof v==='object'&&v?v.x||0:+v||0);const [tl,tr=tl,br=tl,bl=tr]=a.length===1?[a[0],a[0],a[0],a[0]]:a.length===2?[a[0],a[1],a[0],a[1]]:a.length===3?[a[0],a[1],a[2],a[1]]:a,m=Math.min(Math.abs(w),Math.abs(h))/2,c=v=>Math.max(0,Math.min(v,m));
  this.moveTo(x+c(tl),y);this.arcTo(x+w,y,x+w,y+h,c(tr));this.arcTo(x+w,y+h,x,y+h,c(br));this.arcTo(x,y+h,x,y,c(bl));this.arcTo(x,y,x+w,y,c(tl));this.closePath()};
for(const P of[window.CanvasRenderingContext2D,window.Path2D,window.OffscreenCanvasRenderingContext2D])if(P&&!P.prototype.roundRect)P.prototype.roundRect=rr;
})();
