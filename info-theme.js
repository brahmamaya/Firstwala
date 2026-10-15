/* Dark / Light switch for the About, Help, Terms, Privacy and 404 pages. Shares the choice with the main app (localStorage "physica-theme"). */
(() => {
'use strict';
const KEY='physica-theme',root=document.documentElement;
const get=()=>{try{return localStorage.getItem(KEY)==='light'?'light':'dark'}catch{return 'dark'}};
let btn=null;
const paint=()=>{if(!btn)return;const l=root.dataset.theme==='light';btn.textContent=l?'☾ Dark':'☀ Light';btn.setAttribute('aria-label',l?'Switch to the dark theme':'Switch to the light theme');btn.title=btn.getAttribute('aria-label')};
const set=n=>{root.dataset.theme=n;try{localStorage.setItem(KEY,n)}catch{}paint()};
root.dataset.theme=get();
const mount=()=>{const h=document.querySelector('.ihead')||document.body;btn=document.createElement('button');btn.type='button';btn.className='theme-toggle'+(h.classList.contains('ihead')?'':' floating');btn.dataset.testid='theme-toggle';btn.addEventListener('click',()=>set(root.dataset.theme==='light'?'dark':'light'));
  const open=h.querySelector('.open');open?h.insertBefore(btn,open):h.append(btn);paint()};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
addEventListener('storage',e=>{if(e.key===KEY){root.dataset.theme=e.newValue==='light'?'light':'dark';paint()}});
})();
