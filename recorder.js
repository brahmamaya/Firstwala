/* Record the simulation as a high-quality video. Everything that happens on the stage - playing, changing
   variables, rotating the 3D view - is captured at the chosen resolution, with the Physica logo in the top-right
   corner of the video. Saved as MP4 where the browser can, otherwise WebM. */
(() => {
'use strict';
const canvas=document.getElementById('simulation'),after=document.getElementById('snapshot-btn');
if(!canvas||!after||!window.MediaRecorder||!HTMLCanvasElement.prototype.captureStream)return;
const Q=[[1280,'720p',5e6],[1920,'1080p HD',10e6],[2560,'2K',18e6],[3840,'4K',30e6]];
const wrap=document.createElement('div');wrap.className='rec-group';
const btn=document.createElement('button');btn.type='button';btn.className='restart-button icon-tool rec-btn';btn.dataset.testid='rec-btn';btn.title='Record a video of the simulation';const ic=document.createElement('span');ic.setAttribute('aria-hidden','true');ic.textContent='⏺';const lb=document.createElement('b');lb.textContent='Record';btn.append(ic,lb);
const sel=document.createElement('select');sel.className='rec-quality';sel.dataset.testid='rec-quality';sel.setAttribute('aria-label','Video quality');
for(const [w,l] of Q){const o=document.createElement('option');o.value=w;o.textContent=l;sel.append(o)}
let saved='1280';try{saved=localStorage.getItem('physica-rec-q')||saved}catch{}sel.value=saved;sel.addEventListener('change',()=>{try{localStorage.setItem('physica-rec-q',sel.value)}catch{}});
wrap.append(btn,sel);after.after(wrap);
const MIME=['video/mp4;codecs=avc1.640028','video/mp4;codecs=avc1','video/mp4','video/webm;codecs=vp9','video/webm;codecs=vp8','video/webm'].find(m=>{try{return MediaRecorder.isTypeSupported(m)}catch{return false}})||'';
let rec=null,raf=0,t0=0,lastF=0,out=null,octx=null,chunks=[],tick=0;
function logo(g,W,H){const s=H/1080,pad=34*s;g.save();g.font=`800 ${46*s}px Orbitron, 'Exo 2', system-ui, sans-serif`;g.textBaseline='top';g.textAlign='right';g.shadowColor='rgba(0,0,0,.55)';g.shadowBlur=8*s;g.fillStyle='#ffffff';g.fillText('Physica',W-pad,pad);g.restore()}
function frame(now){if(!rec)return;if(now-lastF<30){raf=requestAnimationFrame(frame);return}lastF=now;octx.drawImage(canvas,0,0,out.width,out.height);logo(octx,out.width,out.height);const s=Math.floor((performance.now()-t0)/1000);if(s!==tick){tick=s;ic.textContent='●';lb.textContent=`REC ${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;btn.title='Stop recording';btn.setAttribute('aria-label',`Recording ${lb.textContent.slice(4)}. Stop recording`);if(s>=600)stop()}raf=requestAnimationFrame(frame)}
function start(){const q=Q.find(x=>String(x[0])===sel.value)||Q[1],W=q[0],H=Math.round(W*505/960/2)*2;window.PhysicaRecordWidth=Math.min(W,matchMedia('(pointer:coarse)').matches?1280:1920);window.PhysicaResize?.();
  out=document.createElement('canvas');out.width=W;out.height=H;octx=out.getContext('2d');octx.imageSmoothingQuality='high';chunks=[];
  const stream=out.captureStream(30);try{rec=new MediaRecorder(stream,MIME?{mimeType:MIME,videoBitsPerSecond:q[2]}:{videoBitsPerSecond:q[2]})}catch{rec=new MediaRecorder(stream)}
  rec.ondataavailable=e=>{if(e.data&&e.data.size)chunks.push(e.data)};rec.onstop=save;rec.start(1000);t0=performance.now();tick=-1;btn.classList.add('recording');sel.disabled=true;wrap.dataset.q=q[1];raf=requestAnimationFrame(frame)}
function stop(){tourOn=false;if(!rec)return;cancelAnimationFrame(raf);const r=rec;rec=null;try{r.stop()}catch{}window.PhysicaRecordWidth=0;window.PhysicaResize?.();btn.classList.remove('recording');ic.textContent='⏺';lb.textContent='Record';btn.title='Record a video of the simulation';btn.removeAttribute('aria-label');sel.disabled=false}
function save(){const type=(MIME||'video/webm').split(';')[0],ext=type.includes('mp4')?'mp4':'webm',blob=new Blob(chunks,{type});chunks=[];if(!blob.size)return;
  const id=(location.hash.slice(1)||'simulation').replace(/[^a-z0-9-]/gi,''),q=(wrap.dataset.q||'').split(' ')[0],a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`physica-${id}-${q}.${ext}`;document.body.append(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},4000)}
/* ---- Auto mode: the recorder drives the simulation itself. It orbits and tilts the 3D camera, zooms, and sweeps every
   control from its minimum to its maximum and back (or steps through the options of a drop-down), then restores everything. ---- */
let tourOn=false,mode='manual';
const frameP=()=>new Promise(r=>requestAnimationFrame(r)),ease=t=>.5-.5*Math.cos(Math.PI*Math.min(1,Math.max(0,t)));
async function seg(ms,fn){const t0=performance.now();for(;;){if(!tourOn)return false;const t=(performance.now()-t0)/ms;fn(Math.min(1,t));if(t>=1)return true;await frameP()}}
const has3D=()=>{const P=window.Physica3D,b=document.getElementById('view3d-bar');return !!(P&&P.enabled&&b&&!b.hidden)};
const ctrls=()=>[...document.querySelectorAll('#controls .control-row')].map(r=>{const g=r.querySelector('input[type=range]'),o=r.querySelector('select');return g?{g}:o?{o}:null}).filter(Boolean);
const setRange=(el,v)=>{el.value=String(v);el.dispatchEvent(new Event('input',{bubbles:true}))};
const per=n=>Math.min(4000,Math.max(2200,45000/Math.max(1,n)));
const estimate=()=>{const n=ctrls().length;return Math.round(((has3D()?15000:0)+n*per(n)+4000)/1000)};
async function tour(){
  tourOn=true;const P=window.Physica3D,d3=has3D(),cs=ctrls(),n=cs.length,keep=d3?{yaw:P.cam.yaw,pitch:P.cam.pitch,zoom:P.cam.zoom,auto:P.cam.auto}:null,orig=cs.map(c=>c.g?Number(c.g.value):c.o.value);
  const cam=(dy,dp,dz,ms)=>{let last=0;return seg(ms,t=>{const e=ease(t),k=e-last;last=e;if(!d3)return;if(dy||dp)P.rotate(dy*k,dp*k);if(dz&&dz!==1)P.zoomBy(Math.pow(dz,k))})};
  try{
    if(d3){P.setAuto(false)}
    await seg(1500,()=>{});
    if(d3){await cam(Math.PI*2,0,1,7000);await cam(0,.4,1,2000);await cam(0,-.8,1,3000);await cam(0,.4,1,2000);await cam(0,0,1.5,2000);await cam(0,0,1/1.5,2000)}
    const T=per(n);
    for(let i=0;i<n&&tourOn;i++){const c=cs[i];
      if(c.g){const lo=Number(c.g.min),hi=Number(c.g.max),o=orig[i],run=(a,b,ms)=>seg(ms,t=>setRange(c.g,a+(b-a)*ease(t)));
        const camDrift=d3?cam(i%2?-.9:.9,i%3===0?.15:-.1,1,T):Promise.resolve();
        await Promise.all([camDrift,(async()=>{await run(o,lo,T*.25);await run(lo,hi,T*.5);await run(hi,o,T*.25)})()])}
      else{const opts=[...c.o.options].map(x=>x.value);for(const v of opts){if(!tourOn)break;c.o.value=v;c.o.dispatchEvent(new Event('change',{bubbles:true}));await seg(Math.max(1200,T/opts.length),()=>{})}}}
    await seg(1500,()=>{});
  }finally{
    cs.forEach((c,i)=>{try{if(c.g)setRange(c.g,orig[i]);else{c.o.value=orig[i];c.o.dispatchEvent(new Event('change',{bubbles:true}))}}catch{}});
    if(keep){P.setAuto(keep.auto);P.rotate(keep.yaw-P.cam.yaw,keep.pitch-P.cam.pitch);P.zoomBy(keep.zoom/P.cam.zoom)}
    const was=tourOn;tourOn=false;if(was&&rec)stop()}
}
const menu=document.createElement('div');menu.className='rec-menu';menu.hidden=true;menu.setAttribute('role','dialog');menu.setAttribute('aria-label','Recording mode');
const mk=(id,title,sub)=>{const b=document.createElement('button');b.type='button';b.dataset.testid='rec-'+id;b.title=sub;b.setAttribute('aria-label',title+': '+sub);b.textContent=title;b.addEventListener('click',()=>{menu.hidden=true;mode=id;start();if(id==='auto')tour()});return b};
const closeMenu=()=>{menu.hidden=true;btn.setAttribute('aria-expanded','false')};
wrap.append(menu);btn.setAttribute('aria-haspopup','dialog');btn.setAttribute('aria-expanded','false');
btn.addEventListener('click',()=>{if(rec){tourOn=false;stop();return}menu.replaceChildren(mk('manual','Manual','You change the controls and rotate the view yourself'),mk('auto','Auto · '+estimate()+' s','Records a tour: turns the view and sweeps every control'));menu.hidden=!menu.hidden;btn.setAttribute('aria-expanded',String(!menu.hidden));if(!menu.hidden)menu.querySelector('button')?.focus()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!menu.hidden){closeMenu();btn.focus()}});
document.addEventListener('pointerdown',e=>{if(!menu.hidden&&!wrap.contains(e.target))closeMenu()});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&rec)stop()});
})();
