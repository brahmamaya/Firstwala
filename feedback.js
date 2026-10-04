/* Feedback: a small glass form (name, country, feedback) that sends straight to the Physica Google Form.
   The answers land in the owner's Google Form / Sheet. No keys or secrets are involved - the form URL is public. */
(() => {
'use strict';
const FORM='https://docs.google.com/forms/d/e/1FAIpQLSe0_6Z2gxTf1uxjnfLx4l7pkhyqiM5677GsGgmhVhWrbXHGjg/formResponse';
const F={name:'entry.1574339962',country:'entry.15669348',text:'entry.658520155'};
if(!window.fetch)return;
const el=(tag,props={},kids=[])=>{const e=document.createElement(tag);for(const [k,v] of Object.entries(props)){if(k==='class')e.className=v;else if(k==='text')e.textContent=v;else e.setAttribute(k,v)}for(const c of kids)e.append(c);return e};
// Entry points: the top bar, the foot of the chapter library (sidebar and phone drawer) and the "More" menu.
const opens=[];const right=document.querySelector('.topbar-right');
// Top bar: a compact glass pill at the far right, next to the theme picker (icon only on phones).
if(right){const b=el('button',{type:'button',class:'feedback-btn','aria-haspopup':'dialog','data-testid':'feedback-top',title:'Send feedback'},[el('span',{'aria-hidden':'true',text:'💬'}),el('b',{text:'Feedback'})]);
  const menu=right.querySelector('#mobile-topics');menu?right.insertBefore(b,menu):right.append(b);opens.push(b)}
const foot=document.querySelector('.sidebar-bottom');
if(foot){const b=el('button',{type:'button',class:'fb-entry','aria-haspopup':'dialog','data-testid':'feedback-btn'},[el('span',{'aria-hidden':'true',text:'💬'}),el('span',{class:'fb-entry-t'},[el('b',{text:'Share your feedback'}),el('small',{text:'Tell us what to improve'})])]);foot.before(b);opens.push(b)}
const pop=document.querySelector('.more-pop');if(pop){const b=el('button',{type:'button','aria-haspopup':'dialog','data-testid':'feedback-more'},[el('span',{'aria-hidden':'true',text:'💬 '}),document.createTextNode('Feedback')]);pop.append(b);opens.push(b)}
if(!opens.length)return;
const dlg=el('div',{class:'fb-backdrop',hidden:'',role:'presentation'});
const box=el('form',{class:'fb-card',role:'dialog','aria-modal':'true','aria-labelledby':'fb-title',novalidate:''});
const close=el('button',{type:'button',class:'panel-close fb-close','aria-label':'Close feedback',text:'✕'});
const field=(label,input)=>el('label',{class:'fb-field'},[el('span',{text:label}),input]);
const name=el('input',{type:'text',maxlength:'80',autocomplete:'name',required:'',placeholder:'Your name'});
const country=el('input',{type:'text',maxlength:'60',autocomplete:'country-name',required:'',placeholder:'e.g. India'});
const text=el('textarea',{maxlength:'2000',rows:'4',required:'',placeholder:'What do you like? What should we improve?'});
const trap=el('input',{type:'text',tabindex:'-1',autocomplete:'off',class:'fb-trap','aria-hidden':'true'});
const msg=el('p',{class:'fb-msg',role:'status','aria-live':'polite'});
const send=el('button',{type:'submit',class:'fb-send','data-testid':'feedback-send',text:'Send feedback'});
box.append(close,el('h2',{id:'fb-title',text:'Share your feedback'}),el('p',{class:'fb-sub',text:'Help us make Physica better. Your feedback means a lot to us!'}),
  field('What is your name?',name),field('Which country are you from?',country),field('Your feedback or suggestions',text),trap,msg,send,contact());
// Schools and coaching institutes can write directly.
function contact(){const mail='sahubrahmamaya@gmail.com',a=el('a',{href:`mailto:${mail}?subject=${encodeURIComponent('Physica for our school / coaching')}`,text:mail});
  return el('div',{class:'fb-contact'},[el('span',{'aria-hidden':'true',text:'🏫'}),el('p',{},[el('b',{text:'School or coaching owner?'}),document.createElement('br'),document.createTextNode('Contact us at:'),document.createElement('br'),a])])}
dlg.append(box);document.body.append(dlg);
let last=null;
function show(){last=document.activeElement;dlg.hidden=false;requestAnimationFrame(()=>dlg.classList.add('on'));msg.textContent='';msg.className='fb-msg';send.disabled=false;box.classList.remove('done');setTimeout(()=>name.focus(),60)}
function hide(){dlg.classList.remove('on');setTimeout(()=>{dlg.hidden=true},220);last?.focus?.()}
box.addEventListener('input',()=>{if(msg.classList.contains('err')){msg.textContent='';msg.className='fb-msg'}});
for(const b of opens)b.addEventListener('click',show);close.addEventListener('click',hide);
dlg.addEventListener('click',e=>{if(e.target===dlg)hide()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!dlg.hidden)hide()});
box.addEventListener('submit',async e=>{e.preventDefault();
  const v=[name.value.trim(),country.value.trim(),text.value.trim()];
  if(v.some(x=>!x)){msg.textContent='Please fill in all three boxes.';msg.className='fb-msg err';(v[0]?v[1]?text:country:name).focus();return}
  if(trap.value)return; // bots fill hidden fields
  let wait=0;try{wait=30000-(Date.now()-Number(localStorage.getItem('physica-fb')||0))}catch{}
  if(wait>0){msg.textContent=`Thanks! Please wait ${Math.ceil(wait/1000)} s before sending again.`;msg.className='fb-msg err';return}
  send.disabled=true;send.textContent='Sending…';
  const body=new URLSearchParams();body.append(F.name,v[0]);body.append(F.country,v[1]);body.append(F.text,v[2]);
  try{await fetch(FORM,{method:'POST',mode:'no-cors',body});try{localStorage.setItem('physica-fb',String(Date.now()))}catch{}
    box.classList.add('done');msg.textContent='Thank you! Your feedback has been sent.';msg.className='fb-msg ok';text.value='';setTimeout(hide,1800)}
  catch{msg.textContent='Could not send - please check your internet and try again.';msg.className='fb-msg err'}
  send.disabled=false;send.textContent='Send feedback'});
})();
