// Cascade-aware dead-declaration eliminator for styles.css (no dependencies).
// A declaration can never take effect if, for EVERY selector in its rule, a later declaration of the same
// property exists for that exact selector, with equal or higher importance (!important), in a context that is
// always active whenever the earlier one is (top level, or the very same @media/@supports chain). Same selector
// means same specificity, and later wins - so the earlier one is dead. Such declarations (and rules left empty)
// are removed; everything else, including comments and formatting, is kept as written.
// Safety: declarations repeated inside one rule (deliberate fallbacks) are kept, and so is anything overridden by
// a value that needs a newer browser feature (color-mix, dvh/svh/lvh) - older browsers may still need the fallback.
// Duplicate @keyframes with the same name in the same context: only the last one is used, earlier ones are removed.
// Usage: node tools/optimize-css.js [file]   (prints what it removed; rewrites the file)
const fs=require('fs'),path=require('path');
const file=process.argv[2]||path.join(__dirname,'..','styles.css');let css=fs.readFileSync(file,'utf8');
// --- tokenizer: find top-level/nested blocks with their source ranges, skipping comments and strings
function parse(src){const rules=[],stack=[{ctx:''}];let i=0,start=0;
  const skipStr=q=>{i++;while(i<src.length&&src[i]!==q){if(src[i]==='\\')i++;i++}};
  while(i<src.length){const ch=src[i];
    if(ch==='/'&&src[i+1]==='*'){const e=src.indexOf('*/',i+2);i=e<0?src.length:e+2;if(src.slice(start,i).trim().startsWith('/*'))start=i;continue}
    if(ch==='"'||ch==="'"){skipStr(ch);i++;continue}
    if(ch==='{'){const head=src.slice(start,i).replace(/\/\*[\s\S]*?\*\//g,'').trim();const top=stack[stack.length-1];
      if(head.startsWith('@media')||head.startsWith('@supports')||head.startsWith('@layer')||head.startsWith('@container')){stack.push({ctx:top.ctx+'|'+head.replace(/\s+/g,' '),group:true});i++;start=i;continue}
      // a leaf block: find its matching close brace
      let d=1,j=i+1;while(j<src.length&&d){if(src[j]==='/'&&src[j+1]==='*'){j=src.indexOf('*/',j+2)+2;continue}if(src[j]==='"'||src[j]==="'"){const q=src[j];j++;while(j<src.length&&src[j]!==q){if(src[j]==='\\')j++;j++}j++;continue}
        if(src[j]==='{')d++;else if(src[j]==='}')d--;j++}
      rules.push({ctx:top.ctx,head,headStart:start,open:i,close:j-1});i=j;start=i;continue}
    if(ch==='}'){stack.pop();i++;start=i;continue}
    if(ch===';'&&!src.slice(start,i).includes('{')){i++;start=i;continue} // @import/@charset lines
    i++}
  return rules}
// split a declaration block into declarations, respecting parentheses and strings
function decls(body){const out=[];let depth=0,cur='',q=null;for(let k=0;k<body.length;k++){const c=body[k];
    if(q){cur+=c;if(c==='\\'){cur+=body[++k];continue}if(c===q)q=null;continue}
    if(c==='"'||c==="'"){q=c;cur+=c;continue}if(c==='(')depth++;if(c===')')depth--;
    if(c===';'&&depth===0){if(cur.trim())out.push(cur);cur='';continue}cur+=c}
  if(cur.trim())out.push(cur);
  return out.map(raw=>{const t=raw.replace(/\/\*[\s\S]*?\*\//g,'').trim(),k=t.indexOf(':');if(k<0)return{raw,keep:true};
    const prop=t.slice(0,k).trim().toLowerCase(),val=t.slice(k+1).trim();return{raw,prop,val,imp:/!\s*important\s*$/i.test(val)}})}
const splitSel=h=>{const out=[];let d=0,cur='';for(const c of h){if(c==='('||c==='[')d++;if(c===')'||c===']')d--;if(c===','&&d===0){out.push(cur.trim().replace(/\s+/g,' '));cur=''}else cur+=c}out.push(cur.trim().replace(/\s+/g,' '));return out.filter(Boolean)};
const MODERN=/color-mix\(|\d(dvh|svh|lvh|dvw|svw|lvw)\b/i;
const rules=parse(css);
for(const r of rules){r.at=r.head.startsWith('@');r.sels=r.at?[]:splitSel(r.head);r.d=r.at?[]:decls(css.slice(r.open+1,r.close))}
// walk backwards: remember, per context+selector+property, the strongest later declaration
const later=new Map(),kfLater=new Set();let removed=0,removedRules=0;const log=[];
const covers=(laterCtx,ctx)=>laterCtx===''||laterCtx===ctx;
for(let n=rules.length-1;n>=0;n--){const r=rules[n];
  if(r.at){const m=r.head.match(/^@(-webkit-)?keyframes\s+(\S+)/);if(m){const key=r.ctx+'#'+m[2];if(kfLater.has(key)){r.drop=true;log.push('@keyframes '+m[2])}else kfLater.add(key)}continue}
  const seenHere=new Set(r.d.filter(x=>x.prop).map(x=>x.prop).filter((p,i,a)=>a.indexOf(p)!==i)); // repeated in this rule: fallbacks
  for(const dcl of r.d){if(!dcl.prop||seenHere.has(dcl.prop))continue;
    const dead=r.sels.every(sel=>{const hits=[...(later.get(sel+'\u0000'+dcl.prop)||[])];return hits.some(h=>covers(h.ctx,r.ctx)&&(h.imp||!dcl.imp)&&!MODERN.test(h.val))});
    if(dead){dcl.drop=true;removed++}}
  for(const dcl of r.d){if(!dcl.prop||dcl.drop)continue;for(const sel of r.sels){const k=sel+'\u0000'+dcl.prop;if(!later.has(k))later.set(k,[]);later.get(k).push({ctx:r.ctx,imp:dcl.imp,val:dcl.val})}}
  if(r.d.length&&r.d.every(x=>x.drop||!x.raw.trim()))r.drop=true}
// rebuild: edit from the end so earlier offsets stay valid
for(let n=rules.length-1;n>=0;n--){const r=rules[n];
  if(r.drop){css=css.slice(0,r.headStart)+css.slice(r.close+1);if(!r.at)removedRules++;continue}
  if(r.d.some(x=>x.drop)){const body=r.d.filter(x=>!x.drop).map(x=>x.raw.trim()).join(';');css=css.slice(0,r.open+1)+body+css.slice(r.close)}}
css=css.replace(/\n{3,}/g,'\n\n');
const before=fs.statSync(file).size;fs.writeFileSync(file,css);
console.log(`removed ${removed} overridden declarations, ${removedRules} empty rules, ${log.length} duplicate @keyframes; ${before} -> ${Buffer.byteLength(css)} bytes`);
