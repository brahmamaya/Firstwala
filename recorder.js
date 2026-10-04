/* Record the simulation as a high-quality video. Everything that happens on the stage - playing, changing
   variables, rotating the 3D view - is captured at the chosen resolution, with the Physica logo in the top-right
   corner of the video. Saved as MP4 where the browser can, otherwise WebM. */
(() => {
'use strict';
const canvas=document.getElementById('simulation'),after=document.getElementById('snapshot-btn');
if(!canvas||!after||!window.MediaRecorder||!HTMLCanvasElement.prototype.captureStream)return;
const Q=[[1280,'720p',8e6],[1920,'1080p HD',16e6],[2560,'2K',28e6],[3840,'4K',45e6]];
const wrap=document.createElement('div');wrap.className='rec-group';
const btn=document.createElement('button');btn.type='button';btn.className='restart-button icon-tool rec-btn';btn.dataset.testid='rec-btn';btn.title='Record a video of the simulation';const ic=document.createElement('span');ic.setAttribute('aria-hidden','true');ic.textContent='⏺';const lb=document.createElement('b');lb.textContent='Record';btn.append(ic,lb);
const sel=document.createElement('select');sel.className='rec-quality';sel.dataset.testid='rec-quality';sel.setAttribute('aria-label','Video quality');
for(const [w,l] of Q){const o=document.createElement('option');o.value=w;o.textContent=l;sel.append(o)}
let saved='1920';try{saved=localStorage.getItem('physica-rec-q')||saved}catch{}sel.value=saved;sel.addEventListener('change',()=>{try{localStorage.setItem('physica-rec-q',sel.value)}catch{}});
wrap.append(btn,sel);after.after(wrap);
const MIME=['video/mp4;codecs=avc1.640028','video/mp4;codecs=avc1','video/mp4','video/webm;codecs=vp9','video/webm;codecs=vp8','video/webm'].find(m=>{try{return MediaRecorder.isTypeSupported(m)}catch{return false}})||'';
let rec=null,raf=0,t0=0,out=null,octx=null,chunks=[],tick=0;
function logo(g,W,H){const s=H/1080,pad=28*s,mh=54*s;g.save();g.font=`800 ${44*s}px Orbitron, 'Exo 2', system-ui, sans-serif`;const tw=g.measureText('physica.').width,w=mh+14*s+tw+pad*1.1,x=W-w-pad,y=pad;
  g.fillStyle='rgba(4,10,20,.55)';g.beginPath();g.roundRect(x-12*s,y-8*s,w+20*s,mh+16*s,mh/2);g.fill();const cx=x+mh/2,cy=y+mh/2,r=mh*.42;
  g.lineWidth=4*s;g.strokeStyle='#42d9ca';g.beginPath();g.arc(cx,cy,r,0,Math.PI*2);g.stroke();g.strokeStyle='#ffc36b';g.beginPath();g.ellipse(cx,cy,r*1.25,r*.45,-0.95,0,Math.PI*2);g.stroke();g.fillStyle='#fff';g.beginPath();g.arc(cx,cy,r*.22,0,Math.PI*2);g.fill();
  g.textBaseline='middle';g.textAlign='left';g.fillStyle='#ffffff';g.fillText('physica',x+mh+14*s,cy+2*s);g.fillStyle='#42d9ca';g.fillText('.',x+mh+14*s+g.measureText('physica').width,cy+2*s);g.restore()}
function frame(){if(!rec)return;octx.drawImage(canvas,0,0,out.width,out.height);logo(octx,out.width,out.height);const s=Math.floor((performance.now()-t0)/1000);if(s!==tick){tick=s;ic.textContent='●';lb.textContent=`REC ${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;btn.title='Stop recording';btn.setAttribute('aria-label',`Recording ${lb.textContent.slice(4)}. Stop recording`);if(s>=600)stop()}raf=requestAnimationFrame(frame)}
function start(){const q=Q.find(x=>String(x[0])===sel.value)||Q[1],W=q[0],H=Math.round(W*505/960/2)*2;window.PhysicaRecordWidth=W;window.PhysicaResize?.();
  out=document.createElement('canvas');out.width=W;out.height=H;octx=out.getContext('2d');octx.imageSmoothingQuality='high';chunks=[];
  const stream=out.captureStream(60);try{rec=new MediaRecorder(stream,MIME?{mimeType:MIME,videoBitsPerSecond:q[2]}:{videoBitsPerSecond:q[2]})}catch{rec=new MediaRecorder(stream)}
  rec.ondataavailable=e=>{if(e.data&&e.data.size)chunks.push(e.data)};rec.onstop=save;rec.start(1000);t0=performance.now();tick=-1;btn.classList.add('recording');sel.disabled=true;wrap.dataset.q=q[1];raf=requestAnimationFrame(frame)}
function stop(){if(!rec)return;cancelAnimationFrame(raf);const r=rec;rec=null;try{r.stop()}catch{}window.PhysicaRecordWidth=0;window.PhysicaResize?.();btn.classList.remove('recording');ic.textContent='⏺';lb.textContent='Record';btn.title='Record a video of the simulation';btn.removeAttribute('aria-label');sel.disabled=false}
function save(){const type=(MIME||'video/webm').split(';')[0],ext=type.includes('mp4')?'mp4':'webm',blob=new Blob(chunks,{type});chunks=[];if(!blob.size)return;
  const id=(location.hash.slice(1)||'simulation').replace(/[^a-z0-9-]/gi,''),q=(wrap.dataset.q||'').split(' ')[0],a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`physica-${id}-${q}.${ext}`;document.body.append(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},4000)}
btn.addEventListener('click',()=>rec?stop():start());
document.addEventListener('visibilitychange',()=>{if(document.hidden&&rec)stop()});
})();
