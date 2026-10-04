/* Install Physica as an app (Add to Home Screen). Where the browser offers an install prompt (Chrome/Edge/Samsung) it is used; elsewhere
   (iPhone/iPad Safari, Chrome, Firefox, Edge; Android Firefox) the button shows the two taps for that browser. Hidden once Physica runs as an app. */
(() => {
'use strict';
const standalone=matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;if(standalone)return;
const ua=navigator.userAgent,ios=/iphone|ipad|ipod/i.test(ua)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1),android=/android/i.test(ua);
// Browsers without an install prompt get the steps for their own menu.
const steps=ios?(/CriOS/.test(ua)?['Tap the Share button ↑ (top right, next to the address bar)','Choose “Add to Home Screen”']
  :/FxiOS/.test(ua)?['Tap the menu ☰ (bottom right) and then Share','Choose “Add to Home Screen”']
  :/EdgiOS/.test(ua)?['Tap the menu ⋯ and then Share','Choose “Add to Home Screen”']
  :['Tap Safari’s Share button (the square with an arrow ↑)','Choose “Add to Home Screen”'])
  :android?(/SamsungBrowser/.test(ua)?['Tap the menu ☰ (bottom right)','Choose “Add page to” → “Home screen”']
  :/Firefox/.test(ua)?['Tap the menu ⋮','Choose “Install” or “Add to Home screen”']
  :['Tap the menu ⋮ (top right)','Choose “Install app” or “Add to Home screen”']):null;
let deferred=null;const btns=[];
const el=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text)e.textContent=text;return e};
function make(where,cls,label){if(!where)return;const b=el('button',cls,label);b.type='button';b.hidden=true;b.dataset.testid='install-app';b.addEventListener('click',install);where.append(b);btns.push(b)}
make(document.querySelector('.more-pop'),'','📲 Install app');
const lf=document.querySelector('.landing-foot');if(lf){const w=el('div','install-wrap');lf.before(w);make(w,'install-chip','📲 Install Physica app')}
const show=()=>{for(const b of btns)b.hidden=false};
const tip=el('div','install-tip');tip.setAttribute('role','dialog');tip.setAttribute('aria-label','Add Physica to your Home Screen');tip.hidden=true;
const tx=el('p','',null);tx.append(el('b','','Add Physica to your Home Screen'));if(steps)steps.forEach((t,i)=>{tx.append(document.createElement('br'),document.createTextNode(`${i+1}. ${t}`))});
const ok=el('button','install-ok','Got it');ok.type='button';ok.addEventListener('click',()=>{tip.hidden=true});tip.append(tx,ok);document.body.append(tip);
async function install(){if(deferred){deferred.prompt();try{await deferred.userChoice}catch{}deferred=null;for(const b of btns)b.hidden=true;return}
  if(steps){tip.hidden=false;ok.focus()}}
addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferred=e;show()});
addEventListener('appinstalled',()=>{deferred=null;for(const b of btns)b.hidden=true});
if(steps)show();
})();
