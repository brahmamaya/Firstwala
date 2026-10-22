/* PYQ split check: every chapter bundle holds exactly the questions of its source file, the index built into physica-rank.min.js
   matches the real counts, and (if OLD_PYQ=<path to the old single bundle> is set) the union equals the old bundle. */
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),root=path.join(__dirname,'..');
const run=f=>{const w={};vm.runInNewContext(fs.readFileSync(f,'utf8'),{window:w});return w};
let bad=0;const fail=m=>{bad++;console.log('FAIL '+m)};
const rank=fs.readFileSync(path.join(root,'physica-rank.min.js'),'utf8');
// the index is an object literal inside the rank bundle: cut it out by brace matching from its first key
const grab=name=>{const i=rank.search(/\{"PhysicaRankPyq[A-Za-z]*":\[\[/);if(i<0)return null;let d=0,j=i;for(;j<rank.length;j++){if(rank[j]==='{')d++;else if(rank[j]==='}'&&--d===0)break}return JSON.parse(rank.slice(i,j+1))};
const idx=grab('PhysicaRankPyq'),all={};let total=0;
if(!idx)fail('index not found in physica-rank.min.js');
for(const f of fs.readdirSync(root).filter(f=>/^rank-pyq-[a-z]+\.js$/.test(f)).sort()){
  const src=run(path.join(root,f)),g=Object.keys(src).find(k=>/^PhysicaRankPyq/.test(k)),bf='physica-pyq-'+f.slice(9,-3)+'.min.js';
  if(!fs.existsSync(path.join(root,bf))){fail(bf+' missing');continue}
  const bun=run(path.join(root,bf));
  if(JSON.stringify(Object.keys(bun))!==JSON.stringify([g]))fail(bf+' must export only '+g);
  if(JSON.stringify(bun[g])!==JSON.stringify(src[g]))fail(bf+' differs from '+f);
  const real=new Map();for(const q of bun[g]){const k=q.tp+'\u0001'+q.st;real.set(k,(real.get(k)||0)+1)}
  const ix=new Map();for(const [tp,sts] of (idx&&idx[g])||[])for(const [st,n] of sts)ix.set(tp+'\u0001'+st,n);
  if(JSON.stringify([...real].sort())!==JSON.stringify([...ix].sort()))fail('index counts differ from real counts for '+g);
  all[g]=bun[g];total+=bun[g].length;console.log('ok  '+g.padEnd(22)+String(bun[g].length).padStart(4)+' questions');
}
if(process.env.OLD_PYQ){const old=run(process.env.OLD_PYQ);
  if(JSON.stringify(Object.keys(old).sort())!==JSON.stringify(Object.keys(all).sort()))fail('chapter set differs from old bundle');
  for(const g of Object.keys(old))if(JSON.stringify(old[g])!==JSON.stringify(all[g]))fail('questions of '+g+' differ from old bundle');
  console.log('old bundle compared: '+Object.keys(old).length+' chapters');}
console.log('total '+total+' questions');process.exit(bad?1:0);
