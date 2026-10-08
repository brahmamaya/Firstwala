/* Help page: sends a query to the Physica Google Form (public form URL, no keys). The query is labelled "Query" so it
   is easy to find among the form's responses. */
(() => {
'use strict';
const FORM='https://docs.google.com/forms/d/e/1FAIpQLSe0_6Z2gxTf1uxjnfLx4l7pkhyqiM5677GsGgmhVhWrbXHGjg/formResponse';
const F={name:'entry.1574339962',country:'entry.15669348',text:'entry.658520155'};
const f=document.getElementById('qform');if(!f||!window.fetch)return;
const $=id=>document.getElementById(id),msg=$('qmsg'),btn=f.querySelector('button');
let last=0;
f.addEventListener('submit',async e=>{e.preventDefault();msg.className='qmsg';
  if($('qtrap').value)return;
  const name=$('qname').value.trim(),mail=$('qmail').value.trim(),type=$('qtype').value,text=$('qtext').value.trim();
  if(!name||text.length<5){msg.textContent='Please write your name and your query.';msg.className='qmsg err';return}
  if(mail&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)){msg.textContent='That email does not look right.';msg.className='qmsg err';return}
  if(Date.now()-last<30000){msg.textContent='Please wait a few seconds before sending another query.';msg.className='qmsg err';return}
  const b=new URLSearchParams();b.append(F.name,name.slice(0,80));b.append(F.country,`Query | ${type} | ${mail.slice(0,120)||'no email'}`);b.append(F.text,text.slice(0,2000));
  btn.disabled=true;btn.textContent='Sending…';
  try{await fetch(FORM,{method:'POST',mode:'no-cors',body:b});last=Date.now();f.reset();msg.textContent='Thank you! Your query has reached the Physica team. If you left an email, we will reply there.';msg.className='qmsg ok'}
  catch{msg.textContent='Could not send right now. Please check your internet, or email easy@physica.in.';msg.className='qmsg err'}
  btn.disabled=false;btn.textContent='Send query'});
})();
