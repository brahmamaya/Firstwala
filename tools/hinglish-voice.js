/* Builds the Hinglish pronunciation map for the tutor's voice.
   Every tutor line is written three ways - English, Hinglish (Roman) and Hindi (Devanagari) - so the Hinglish and
   Hindi versions of the same sentence are lined up word by word. A pair is kept only when the two words SOUND the
   same (kya → क्या, padhte → पढ़ते), never when the Hindi line uses a different word (energy → ऊर्जा): English words
   in Hinglish stay English. At run time the Hindi voice reads Hinglish with these Devanagari spellings, so it keeps
   its natural accent instead of guessing how Roman letters sound. */
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm');
const CONS={'क':'k','ख':'kh','ग':'g','घ':'gh','ङ':'n','च':'ch','छ':'chh','ज':'j','झ':'jh','ञ':'n','ट':'t','ठ':'th','ड':'d','ढ':'dh','ण':'n','त':'t','थ':'th','द':'d','ध':'dh','न':'n','प':'p','फ':'ph','ब':'b','भ':'bh','म':'m','य':'y','र':'r','ल':'l','व':'v','श':'sh','ष':'sh','स':'s','ह':'h','ड़':'r','ढ़':'rh','क़':'q','ख़':'kh','ग़':'g','ज़':'z','फ़':'f','ळ':'l'};
const VOW={'अ':'a','आ':'a','इ':'i','ई':'i','उ':'u','ऊ':'u','ए':'e','ऐ':'ai','ओ':'o','औ':'au','ऋ':'ri','ा':'a','ि':'i','ी':'i','ु':'u','ू':'u','े':'e','ै':'ai','ो':'o','ौ':'au','ृ':'ri','ं':'n','ँ':'n','ः':'h','्':'','़':'','ॉ':'o','ऑ':'o'};
// a rough reading of a Devanagari word in Roman letters, only to compare sounds
function roman(w){let out='';for(const ch of w.normalize('NFC'))out+=CONS[ch]??VOW[ch]??'';return out}
// consonant skeleton with common Hinglish spelling variants folded together
const skel=s=>s.toLowerCase().replace(/ph/g,'f').replace(/w/g,'v').replace(/z/g,'j').replace(/q/g,'k').replace(/x/g,'ks').replace(/c(?!h)/g,'k').replace(/(.)\1+/g,'$1').replace(/[aeiouy']/g,'').replace(/h/g,'');
function dist(a,b){const d=Array.from({length:a.length+1},(_,i)=>[i]);for(let j=1;j<=b.length;j++)d[0][j]=j;for(let i=1;i<=a.length;i++)for(let j=1;j<=b.length;j++)d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]===b[j-1]?0:1));return d[a.length][b.length]}
// the word must also END the same way (kaati ≠ काटते): final vowel, or no final vowel
const endOf=lat=>{lat=lat.toLowerCase().replace(/ein$/,'e').replace(/([aeiou])h$/,'$1').replace(/([aeiou])n$/,'$1');const m=lat.match(/(aa|ee|oo|ai|au|[aeiou])$/);return!m?'c':({a:'a',aa:'a',e:'e',ai:'e',i:'i',ee:'i',o:'o',au:'o',u:'u',oo:'u'})[m[1]]};
const endDev=dev=>{const last=[...dev.normalize('NFC')].filter(ch=>!/[ंँ़]/.test(ch)).pop();return({'ा':'a','आ':'a','े':'e','ै':'e','ए':'e','ऐ':'e','ि':'i','ी':'i','इ':'i','ई':'i','ो':'o','ौ':'o','ओ':'o','ु':'u','ू':'u','उ':'u','ऊ':'u'})[last]||'c'};
const same=(lat,dev)=>{const a=skel(lat.replace(/n$/,'')),b=skel(roman(dev).replace(/n$/,'')),ea=endOf(lat),eb=endDev(dev);if(ea!==eb&&!(ea==='a'&&eb==='c'))return false;if(!a||!b)return a===b&&lat.length<=3;return a===b||(Math.max(a.length,b.length)>=4&&dist(a,b)<=1)};
// everyday spoken forms the written Hindi lines spell formally
const SPOKEN={ye:'ये',yeh:'ये',wo:'वो',woh:'वो',vo:'वो',voh:'वो',nahi:'नहीं',nahin:'नहीं',hain:'हैं',main:'मैं',tum:'तुम',aap:'आप',kya:'क्या',kyun:'क्यों',kyunki:'क्योंकि',haan:'हाँ',accha:'अच्छा',achha:'अच्छा',acha:'अच्छा',chalo:'चलो',samjhe:'समझे',samajh:'समझ',aaj:'आज',kal:'कल',abhi:'अभी',bas:'बस',bilkul:'बिल्कुल',sahi:'सही',galat:'ग़लत',dekho:'देखो',socho:'सोचो',batao:'बताओ',bolo:'बोलो',padhte:'पढ़ते',padhai:'पढ़ाई',shabash:'शाबाश',wah:'वाह',waah:'वाह',arre:'अरे',haina:'है ना',na:'ना',ji:'जी',
  mein:'में',toh:'तो',nikaalo:'निकालो',sirf:'सिर्फ़',dono:'दोनों',karta:'करता',taraf:'तरफ़',cheez:'चीज़',pehle:'पहले',chahiye:'चाहिए',guna:'गुना',tumhe:'तुम्हें',sawaal:'सवाल',sakta:'सकता',sakte:'सकते',sakti:'सकती',jod:'जोड़',waqt:'वक़्त',lagao:'लगाओ',hoon:'हूँ',lo:'लो',chalta:'चलता',jaisi:'जैसी',lena:'लेना',jahan:'जहाँ',jodo:'जोड़ो',pal:'पल',jagah:'जगह',rakho:'रखो',likho:'लिखो',banao:'बनाओ',ulti:'उल्टी',ulta:'उल्टा',rassi:'रस्सी',insaan:'इंसान',chali:'चली',judte:'जुड़ते',gayi:'गई',jaaye:'जाए',hui:'हुई',deti:'देती',padhta:'पढ़ता',cheezein:'चीज़ें',bhool:'भूल',jaana:'जाना',jodna:'जोड़ना',unhe:'उन्हें',dimaag:'दिमाग़',chuno:'चुनो',dost:'दोस्त',pehla:'पहला',samtal:'समतल',aaya:'आया',inhi:'इन्हीं',naap:'नाप',milne:'मिलने',naapna:'नापना',hissa:'हिस्सा',batati:'बताती',chhoti:'छोटी',kai:'कई',naapo:'नापो',aati:'आती',zaroori:'ज़रूरी',roshni:'रोशनी',hon:'हों',badhti:'बढ़ती',lagega:'लगेगा',bada:'बड़ा',hogi:'होगी',kheenchti:'खींचती',badalta:'बदलता',chaaron:'चारों',pahunch:'पहुँच',yahi:'यही',yahin:'यहीं',inme:'इनमें',kaunsa:'कौनसा',jinke:'जिनके',motai:'मोटाई',naapa:'नापा',jitne:'जितने',akele:'अकेले',thodi:'थोड़ी',thoda:'थोड़ा',asli:'असली',andaaze:'अंदाज़े',andaaza:'अंदाज़ा',kitni:'कितनी',kaise:'कैसे',kahan:'कहाँ',kab:'कब',kaun:'कौन',tumhara:'तुम्हारा',mera:'मेरा',meri:'मेरी',mere:'मेरे',hamara:'हमारा',apna:'अपना',apni:'अपनी',apne:'अपने',karo:'करो',karna:'करना',karke:'करके',hoga:'होगा',hote:'होते',hoti:'होती',tha:'था',thi:'थी',raha:'रहा',rahi:'रही',rahe:'रहे',gaya:'गया',gaye:'गए',diya:'दिया',liya:'लिया',kiya:'किया',dekhte:'देखते',dekhna:'देखना',samjho:'समझो',samjha:'समझा',samjhna:'समझना',bataiye:'बताइए',suno:'सुनो',padho:'पढ़ो',seekho:'सीखो',seekhte:'सीखते',khana:'खाना',khaya:'खाया',ho:'हो',do:'दो',to:'तो',agar:'अगर',lekin:'लेकिन',phir:'फिर',fir:'फिर',ab:'अब',yahan:'यहाँ',wahan:'वहाँ',upar:'ऊपर',andar:'अंदर',bahar:'बाहर',saath:'साथ',pehli:'पहली',doosra:'दूसरा',teesra:'तीसरा',sawal:'सवाल',jawab:'जवाब',jawaab:'जवाब',zara:'ज़रा',bahot:'बहुत',bohot:'बहुत',ekdum:'एकदम',mast:'मस्त',badhiya:'बढ़िया',shukriya:'शुक्रिया',dhanyavaad:'धन्यवाद',namaste:'नमस्ते',dobara:'दोबारा',zor:'ज़ोर',tez:'तेज़',dheere:'धीरे',jaldi:'जल्दी',koshish:'कोशिश',mushkil:'मुश्किल',aasaan:'आसान',aasan:'आसान',zameen:'ज़मीन',teen:'तीन',din:'दिन',kiye:'किए',karti:'करती',wahin:'वहीं',ghante:'घंटे',samajhna:'समझना',unke:'उनके',waali:'वाली',lambi:'लंबी',achhi:'अच्छी',karein:'करें',padhein:'पढ़ें',karungi:'करूँगी',wajah:'वजह',halka:'हल्का',oonchai:'ऊँचाई',leti:'लेती',lagana:'लगाना',dheemi:'धीमी',chaudi:'चौड़ी',baarish:'बारिश',seekh:'सीख',bagal:'बग़ल',milte:'मिलते',mili:'मिली',patli:'पतली',kaunsi:'कौनसी'};

module.exports=function hinglishVoice(root,files){
  // collect every {en, hl, hi} triple the tutor content defines
  const triples=[];const seen=new Set();
  const walk=o=>{if(!o||typeof o!=='object'||seen.has(o))return;seen.add(o);
    if(o.hl!==undefined&&o.hi!==undefined){const a=[].concat(o.hl),b=[].concat(o.hi);if(a.length===b.length)a.forEach((x,i)=>{if(typeof x==='string'&&typeof b[i]==='string')triples.push([x,b[i]])})}
    for(const v of Object.values(o))walk(v)};
  const win={};win.window=win;const ctx=vm.createContext(win);
  for(const f of files)try{vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),ctx,{filename:f})}catch(e){}
  walk(win);
  // tutor.js keeps a few short phrase lists inline as {en:[…],hl:[…],hi:[…]}
  const src=fs.readFileSync(path.join(root,'tutor.js'),'utf8');
  for(const m of src.matchAll(/\{en:\[[^\]]*\],hl:(\[[^\]]*\]),hi:(\[[^\]]*\])\}/g))try{const a=vm.runInNewContext(m[1]),b=vm.runInNewContext(m[2]);a.forEach((x,i)=>b[i]&&triples.push([x,b[i]]))}catch(e){}
  // line the words up; keep a pair only where the sentence has the same number of words and the two sound alike
  const votes={};let lines=0;
  for(const [hl,hi] of triples){const a=hl.match(/[A-Za-z']+/g)||[],b=hi.match(/[ऀ-ॿ]+|[A-Za-z']+/g)||[];if(a.length!==b.length||!a.length)continue;lines++;
    a.forEach((w,i)=>{const d=b[i];if(!/[ऀ-ॿ]/.test(d))return;const k=w.toLowerCase();(votes[k]=votes[k]||{})[d]=(votes[k][d]||0)+1})}
  // words that also appear in the English lines are English (static, metre, phone ...) and stay as they are -
  // except the short Hindi words that happen to be spelt like English ones
  const english=new Set();const wenS=new Set();const wen=o=>{if(!o||typeof o!=='object'||wenS.has(o))return;wenS.add(o);if(o.en!==undefined)for(const x of [].concat(o.en))if(typeof x==='string')for(const w of x.toLowerCase().match(/[a-z']+/g)||[])english.add(w);for(const v of Object.values(o))wen(v)};wen(win);
  const HINDI_TOO=new Set(['is','the','use','par','main','to','do','ho','jo','na','ye','wo','kal','bas','hum','ek','sab','tab','jab','ab','ki','ka','ke','se','hai','koi','kuch','bhi','hi','aur','mat','pal','bade','sake']);
  const map={};
  for(const [w,c] of Object.entries(votes)){if(english.has(w)&&!HINDI_TOO.has(w))continue;const best=Object.entries(c).sort((x,y)=>y[1]-x[1]);const [d,n]=best[0],all=best.reduce((s,x)=>s+x[1],0);if(n/all>=.6&&same(w,d))map[w]=d}
  Object.assign(map,SPOKEN);
  return{map,lines,triples:triples.length,
    js:`/* Generated by tools/hinglish-voice.js: how the Hindi voice should read Hinglish words (${Object.keys(map).length} words). */\nwindow.PhysicaHinglishVoice=${JSON.stringify(map)};\n`}};
