/* After the page is up: fetch the detailed 3D scene pack in the background, and register the offline cache
   so the next visit opens instantly. Nothing here blocks the first paint. */
(() => {
'use strict';
const LAZY='__LAZY_URL__';
function loadPack(){if(document.querySelector('script[data-pack]'))return;const s=document.createElement('script');s.src=LAZY;s.async=true;s.dataset.pack='3d';s.onload=()=>{try{window.PhysicaApplyReal3D?.()}catch{}};document.head.append(s)}
const idle=window.requestIdleCallback||(f=>setTimeout(f,200));
const go=()=>idle(loadPack,{timeout:1500});
if(document.readyState==='complete')go();else window.addEventListener('load',go,{once:true});
if('serviceWorker' in navigator&&location.protocol==='https:')window.addEventListener('load',()=>{navigator.serviceWorker.register('./sw.js').catch(()=>{})},{once:true});
})();
