/* Refuses to build if anything that looks like an API key, token or private key is in the source.
   Physica uses no APIs and no keys; this keeps it that way even by accident. */
'use strict';
const fs=require('fs'),path=require('path'),{execFileSync}=require('child_process');
const PATTERNS=[[/AIza[0-9A-Za-z_-]{30,}/,'Google API key'],[/sk-ant-[A-Za-z0-9_-]{10,}/,'Anthropic key'],[/\bsk-[A-Za-z0-9]{32,}/,'OpenAI-style key'],
  [/gh[pousr]_[A-Za-z0-9]{30,}/,'GitHub token'],[/xox[baprs]-[0-9A-Za-z-]{10,}/,'Slack token'],[/AKIA[0-9A-Z]{16}/,'AWS key'],
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----/,'private key'],[/\b(api[_-]?key|secret[_-]?key|access[_-]?token)\s*[:=]\s*['"][^'"]{12,}['"]/i,'hard-coded key']];
module.exports=function guard(root){
  let files;try{files=execFileSync('git',['ls-files','-co','--exclude-standard'],{cwd:root}).toString().split('\n').filter(Boolean)}catch{files=fs.readdirSync(root)}
  const hits=[];
  for(const f of files){if(/\.(png|jpe?g|webp|gif|ico|woff2?|ttf|mp3|mp4|pdf)$/i.test(f))continue;let s;try{s=fs.readFileSync(path.join(root,f),'utf8')}catch{continue}
    for(const [re,what] of PATTERNS){const m=s.match(re);if(m)hits.push(`${f}: ${what} (${m[0].slice(0,8)}…)`)}}
  if(hits.length){console.error('\nSTOP: something that looks like a secret is in the project. Remove it before building:\n  '+hits.join('\n  ')+'\n');process.exit(1)}};
