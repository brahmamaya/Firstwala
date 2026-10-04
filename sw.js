/* Physica offline cache: versioned files (?v=hash) are served from the cache instantly; the page itself is
   fetched fresh when online (so updates appear at once) and falls back to the cache when offline. */
const CACHE='physica-v1';
self.addEventListener('install',e=>{self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil((async()=>{for(const k of await caches.keys())if(k!==CACHE)await caches.delete(k);await self.clients.claim()})())});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);if(u.origin!==location.origin)return;
  if(r.mode==='navigate'){e.respondWith((async()=>{try{const res=await fetch(r);const c=await caches.open(CACHE);c.put('./',res.clone());return res}catch{return(await caches.match('./'))||Response.error()}})());return}
  e.respondWith((async()=>{const c=await caches.open(CACHE),hit=await c.match(r);const net=fetch(r).then(res=>{if(res.ok)c.put(r,res.clone());return res}).catch(()=>hit);
    if(hit&&u.searchParams.has('v'))return hit;return hit||net})());});
