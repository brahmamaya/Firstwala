/* Install Physica as an app (Add to Home Screen). Chrome/Edge/Android get the real install prompt; iPhone/iPad
   Safari has no prompt, so the button shows the two taps needed there. Hidden once Physica runs as an app. */
(() => {
'use strict';
const standalone=matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;if(standalone)return;
const ios=/iphone|ipad|ipod/i.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
let deferred=null;const btns=[];
const el=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text)e.textContent=text;return e};
function make(where,cls,label){if(!where)return;const b=el('button',cls,label);b.type='button';b.hidden=true;b.dataset.testid='install-app';b.addEventListener('click',install);where.append(b);btns.push(b)}
make(document.querySelector('.more-pop'),'','📲 Install app');
const lf=document.querySelector('.landing-foot');if(lf){const w=el('div','install-wrap');lf.before(w);make(w,'install-chip','📲 Install Physica app')}
const show=()=>{for(const b of btns)b.hidden=false};
const tip=el('div','install-tip');tip.setAttribute('role','dialog');tip.setAttribute('aria-label','Add Physica to your Home Screen');tip.hidden=true;
const tx=el('p','',null);tx.append(el('b','','Add Physica to your Home Screen'),document.createElement('br'),document.createTextNode('1. Tap Safari’s Share button (the square with an arrow ↑)'),document.createElement('br'),document.createTextNode('2. Choose “Add to Home Screen”'));
const ok=el('button','install-ok','Got it');ok.type='button';ok.addEventListener('click',()=>{tip.hidden=true});tip.append(tx,ok);document.body.append(tip);
async function install(){if(deferred){deferred.prompt();try{await deferred.userChoice}catch{}deferred=null;for(const b of btns)b.hidden=true;return}
  if(ios){tip.hidden=false;ok.focus()}}
addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferred=e;show()});
addEventListener('appinstalled',()=>{deferred=null;for(const b of btns)b.hidden=true});
if(ios)show();
})();
