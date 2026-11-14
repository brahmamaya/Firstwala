/* Shared parts of the wave labs (waves2d.js, youngs2d.js): light colour from a wavelength, text, round / pill buttons, radio buttons and
   check boxes drawn on the stage, and the wave clock with its play / pause / step / normal / slow / reset bar. Written once so every lab behaves the same. */
(() => {
'use strict';
const {clamp,TAU}=window.PhysicaLab,WK=window.PhysicaWaveKit={};
// Approximate colour of a vacuum wavelength (nm) as [r,g,b] 0-255.
WK.spectral=nm=>{let r=0,g=0,b=0;if(nm<440){r=(440-nm)/60;b=1}else if(nm<490){g=(nm-440)/50;b=1}else if(nm<510){g=1;b=(510-nm)/20}else if(nm<580){r=(nm-510)/70;g=1}else if(nm<645){r=1;g=(645-nm)/65}else r=1;
  const k=nm<420?.35+.65*(nm-380)/40:nm>700?.35+.65*(750-nm)/50:1;return[r,g,b].map(v=>Math.round(255*clamp(v*Math.max(.35,k),0,1)))};
// Text with the lab's usual font.
WK.txt=(c,s,x,y,col='#e9f6ff',size=12,align='left',w=600)=>{c.save();c.font=`${w} ${size}px system-ui, sans-serif`;c.fillStyle=col;c.textAlign=align;c.textBaseline='middle';c.fillText(s,x,y);c.restore()};
// Round button b = {x,y,r,hot} with an icon drawn by `icon(c,b)` in white.
WK.button=(c,b,on,icon)=>{c.save();c.shadowColor='rgba(66,217,202,.5)';c.shadowBlur=on?14:6;const g=c.createLinearGradient(0,b.y-b.r,0,b.y+b.r);g.addColorStop(0,b.hot?'#ffb26b':'#6ff0e2');g.addColorStop(1,b.hot?'#e8590c':'#1fb5a6');c.fillStyle=g;c.beginPath();c.arc(b.x,b.y,b.r,0,TAU);c.fill();c.restore();c.save();c.fillStyle='#fff';c.strokeStyle='#fff';c.lineWidth=2.4;icon(c,b);c.restore()};
// Radio button with a label.
WK.radio=(c,x,y,label,on)=>{c.save();c.strokeStyle='#8ca6b9';c.lineWidth=1.6;c.beginPath();c.arc(x,y,7,0,TAU);c.stroke();if(on){c.fillStyle='#42d9ca';c.beginPath();c.arc(x,y,4,0,TAU);c.fill()}c.restore();WK.txt(c,label,x+13,y,'#e9f6ff',13)};
// Check box with a label; returns its hit rectangle {x,y,w,h}.
WK.check=(c,x,y,label,on,col='#e9f6ff')=>{c.save();c.strokeStyle=on?'#42d9ca':'#8ca6b9';c.lineWidth=1.8;c.fillStyle=on?'rgba(66,217,202,.2)':'rgba(255,255,255,.04)';c.beginPath();c.roundRect(x,y-8,16,16,3);c.fill();c.stroke();
  if(on){c.strokeStyle='#42d9ca';c.lineWidth=2.4;c.beginPath();c.moveTo(x+3.5,y);c.lineTo(x+7,y+4);c.lineTo(x+13,y-4.5);c.stroke()}c.restore();WK.txt(c,label,x+24,y,col,12.5);return{x,y:y-10,w:24+label.length*6.6,h:20}};
// Dark rounded panel.
WK.panel=(c,x,y,w,h)=>{c.save();c.fillStyle='#0d2132';c.strokeStyle='#294358';c.lineWidth=1;c.beginPath();c.roundRect(x,y,w,h,10);c.fill();c.stroke();c.restore()};
// The wave clock: tau is the wave time in femtosecond-like units; 1 unit of wave time takes ~1.1 s on screen (a quarter of that when slow); nothing moves while paused.
WK.clock=()=>({paused:false,slow:false,tau:0,lastT:null,
  tick(t){if(this.lastT===null||t<this.lastT)this.lastT=t;const dt=clamp(t-this.lastT,0,.1);this.lastT=t;if(!this.paused)this.tau+=dt*(this.slow?.2:.9)},
  step(T){this.paused=true;this.tau+=T/12}});
const TB={play:{x:64,y:474,r:17},step:{x:108,y:474,r:14},reset:{x:922,y:474,r:15,hot:true}},NORM={x:158,y:474},SLOW={x:250,y:474};
// The bottom bar: play/pause, step, Normal/Slow radio buttons and reset.
WK.transport=(c,clk)=>{
  WK.button(c,TB.play,!clk.paused,(k,b)=>{if(clk.paused){k.beginPath();k.moveTo(b.x-5,b.y-8);k.lineTo(b.x+8,b.y);k.lineTo(b.x-5,b.y+8);k.closePath();k.fill()}else{k.fillRect(b.x-7,b.y-8,5,16);k.fillRect(b.x+2,b.y-8,5,16)}});
  WK.button(c,TB.step,false,(k,b)=>{k.beginPath();k.moveTo(b.x-6,b.y-7);k.lineTo(b.x+3,b.y);k.lineTo(b.x-6,b.y+7);k.closePath();k.fill();k.fillRect(b.x+5,b.y-7,3,14)});
  WK.radio(c,NORM.x,NORM.y,'Normal',!clk.slow);WK.radio(c,SLOW.x,SLOW.y,'Slow',clk.slow);WK.txt(c,'Step moves the wave by 1/12 of a period',320,474,'#8ca6b9',11,'left',600);
  WK.button(c,TB.reset,false,(k,b)=>{k.beginPath();k.arc(b.x,b.y,7,Math.PI*.25,Math.PI*1.85);k.stroke();k.beginPath();k.moveTo(b.x+9,b.y-6);k.lineTo(b.x+9,b.y+3);k.lineTo(b.x+1,b.y-1);k.closePath();k.fill()})};
// A press on the bottom bar: returns true when it was handled; `T` is the wave period (for Step) and `onReset` restores the lab.
WK.transportHit=(q,clk,T,onReset)=>{const near=(o,r)=>Math.hypot(q.x-o.x,q.y-o.y)<=r;
  if(near(TB.play,TB.play.r+4)){clk.paused=!clk.paused;return true}
  if(near(TB.step,TB.step.r+4)){clk.step(T);return true}
  if(near(TB.reset,TB.reset.r+4)){onReset();return true}
  if(q.y>454&&q.x<210&&q.x>140){clk.slow=false;return true}if(q.y>454&&q.x>=210&&q.x<300){clk.slow=true;return true}
  return false};
})();
