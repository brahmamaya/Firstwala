/* Physica Tutor voice helpers: turn physics text into natural speech ("R = v² sin(2θ) / g" → "R equals v squared,
   sine of 2 theta, divided by g") and pick a female English voice (Indian English first) from the device. */
(() => {
'use strict';
const SUP={'⁰':'0','¹':'1','²':'2','³':'3','⁴':'4','⁵':'5','⁶':'6','⁷':'7','⁸':'8','⁹':'9','⁻':'minus ','ⁿ':'n'};
const SUB={'₀':' nought ','₁':' 1 ','₂':' 2 ','₃':' 3 ','ₙ':' n ','ₑ':' e ','ₜ':' t ','ₛ':' s '};
const GREEK={θ:'theta',λ:'lambda',ω:'omega',ρ:'rho',µ:'mu',μ:'mu',ε:'epsilon',Δ:'delta',δ:'delta',π:'pi',α:'alpha',β:'beta',γ:'gamma',φ:'phi',η:'eta',σ:'sigma',τ:'tau',χ:'chi',Φ:'phi',Ω:'ohms',ν:'nu'};
const UNITS=[[/m\/s²/g,' metres per second squared'],[/m\/s2\b/g,' metres per second squared'],[/km\/s/g,' kilometres per second'],[/m\/s/g,' metres per second'],[/N m²\/kg²/g,' newton metre squared per kilogram squared'],
  [/J\/kg K/g,' joules per kilogram kelvin'],[/kg\/m³/g,' kilograms per cubic metre'],[/N\/m²/g,' newtons per square metre'],[/W\/m²/g,' watts per square metre'],[/m³/g,' cubic metres'],[/m²/g,' square metres'],[/°C/g,' degrees Celsius']];
const AFTER={m:'metres',cm:'centimetres',mm:'millimetres',km:'kilometres',kg:'kilograms',s:'seconds',ms:'milliseconds',N:'newtons',J:'joules',W:'watts',Hz:'hertz',V:'volts',A:'amperes',K:'kelvin',eV:'electron volts',
  nm:'nanometres',fm:'femtometres',Å:'angstroms',µF:'microfarads',μF:'microfarads',F:'farads',Pa:'pascals',T:'tesla',C:'coulombs',D:'dioptres',H:'henry',mA:'milliamps',kV:'kilovolts',MeV:'mega electron volts',u:'atomic mass units'};
const sup=s=>[...s].map(c=>SUP[c]??c).join('');
function speakable(t){t=String(t||'');
  t=t.replace(/[“”"«»]/g,'').replace(/e\.g\./g,'for example').replace(/i\.e\./g,'that is').replace(/\betc\./g,'and so on').replace(/🎉|⭐|✓|✦/g,'');
  t=t.replace(/(\d)\s*×\s*10([⁻⁰¹²³⁴⁵⁶⁷⁸⁹]+)/g,(m,a,e)=>`${a} times 10 to the power ${sup(e)}`);
  for(const [r,w] of UNITS)t=t.replace(r,w);
  t=t.replace(/(\d)\s?(MeV|eV|kV|mA|µF|μF|nm|fm|cm|mm|km|kg|ms|Hz|Pa|m|s|N|J|W|V|A|K|Å|F|T|C|D|H|u)\b/g,(m,n,u)=>`${n} ${AFTER[u]||u}`).replace(/(\d)\s?Ω/g,'$1 ohms');
  t=t.replace(/(\d)\s?°/g,'$1 degrees').replace(/°/g,' degrees').replace(/(\d)\s?%/g,'$1 percent');
  t=t.replace(/√\(([^)]*)\)/g,' square root of $1 ').replace(/√\s?(\w+)/g,' square root of $1 ');
  t=t.replace(/\b(sin|cos|tan)\s?\(([^)]*)\)/g,(m,f,a)=>` ${f==='sin'?'sine':f} of ${a} `).replace(/\bsin(?=[²θ\s])/g,' sine ').replace(/\bcos(?=[²θ\s])/g,' cos ').replace(/\bln\b/g,' natural log of ');
  t=t.replace(/²/g,' squared ').replace(/³/g,' cubed ').replace(/([⁻⁰¹⁴-⁹ⁿ]+)/g,(m)=>` to the power ${sup(m)} `);
  t=t.replace(/[₀₁₂₃ₙₑₜₛ]/g,c=>SUB[c]||'');
  t=t.replace(/[θλωρµμεΔδπαβγφηστχΦΩν]/g,c=>` ${GREEK[c]} `);
  t=t.replace(/½/g,' half ').replace(/⅓/g,' one third ').replace(/¼/g,' one quarter ');
  t=t.replace(/\s=\s|=/g,' equals ').replace(/\s?×\s?|·/g,' times ').replace(/±/g,' plus or minus ').replace(/≈/g,' approximately ').replace(/∝/g,' is proportional to ').replace(/→/g,' to ').replace(/−/g,' minus ').replace(/\s\+\s/g,' plus ');
  t=t.replace(/_/g,' ').replace(/\s+/g,' ').replace(/(\w)\s*\/\s*(\w)/g,'$1 divided by $2').replace(/[()[\]{}]/g,' ').replace(/\s-\s/g,', ').replace(/\s+/g,' ').trim();
  return t}
const FEMALE=/female|woman|samantha|victoria|karen|moira|tessa|fiona|veena|lekha|heera|neerja|swara|kalpana|aditi|raveena|zira|aria|jenny|emma|sonia|libby|natasha|serena|allison|ava|susan|catherine|kate|google uk english female|google us english/i,MALE=/\bmale\b|daniel|alex|fred|rishi|ravi|prabhat|david|mark|george|guy|ryan|thomas/i;
function pickVoice(list,lang){if(lang==='hi'){const hi=list.filter(v=>/^hi/i.test(v.lang));return hi.find(v=>/swara|kalpana|lekha|female|google/i.test(v.name)&&!/madhur|hemant|male\b/i.test(v.name))||hi.find(v=>!/madhur|hemant|male\b/i.test(v.name))||hi[0]||null}
  const en=list.filter(v=>/^en/i.test(v.lang)),fem=en.filter(v=>FEMALE.test(v.name)&&!MALE.test(v.name.replace(/female/i,'')));
  return fem.find(v=>/en-IN/i.test(v.lang))||fem.find(v=>/en-GB/i.test(v.lang))||fem[0]||en.find(v=>/en-IN/i.test(v.lang)&&!MALE.test(v.name))||en.find(v=>!MALE.test(v.name))||en[0]||null}
window.PhysicaSpeech={speakable,pickVoice};
})();
