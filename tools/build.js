// Builds the two production bundles from the readable source files listed in index.src.html order.
// Usage: node tools/build.js   (needs esbuild: npm i -g esbuild, or run with npx)
const fs=require('fs'),path=require('path'),{execFileSync}=require('child_process');
const root=path.join(__dirname,'..'),ESB=process.env.ESBUILD||'esbuild';
const CORE=['compat.js','mathtext.js','theme.js','physica3d.js'];
const MAIN=['physics.js','extras.js','enhancements.js','third.js','fourth.js','fifth.js','sixth.js','labkit.js','seventh.js','eighth.js','ninth.js','tenth.js','biokit.js','bio1.js','bio2.js','bio3.js','bio4.js','bio5.js','chem1.js','chem2.js','chem3.js','chem4.js','phys3d-a.js','phys3d-b.js','phys3d-c.js','phys3d-d.js','instruments2d.js','optics2d.js','experience.js','app.js','focus.js','recorder.js','landing-bg.js','landing.js','feedback.js','install.js','tutor-content.js','tutor.js','lazy.js'];
const PACK=['real3d-11a.js','real3d-11b.js','real3d-11c.js','real3d-11d.js','real3d-11e.js','ultra3d.js'];
function bundle(list,out){const src=list.map(f=>f.startsWith('vendor/')?fs.readFileSync(path.join(root,f),'utf8')+'\n;':`;(function(){${fs.readFileSync(path.join(root,f),'utf8')}\n})();`).join('\n');
  const tmp=path.join(root,'.build.tmp.js');fs.writeFileSync(tmp,src);execFileSync(ESB,[tmp,'--minify','--target=es2018','--legal-comments=none','--outfile='+path.join(root,out)],{stdio:'inherit'});fs.unlinkSync(tmp)}
bundle(CORE,'physica-core.min.js');bundle(PACK,'physica-3d.min.js');
const crypto0=require('crypto'),packV=crypto0.createHash('md5').update(fs.readFileSync(path.join(root,'physica-3d.min.js'))).digest('hex').slice(0,8);
bundle(MAIN,'physica.min.js');{const pm=path.join(root,'physica.min.js');fs.writeFileSync(pm,fs.readFileSync(pm,'utf8').replace('__LAZY_URL__','./physica-3d.min.js?v='+packV))}
const crypto=require('crypto'),ip=path.join(root,'index.html');let html=fs.readFileSync(ip,'utf8');
for(const f of['physica-core.min.js','physica.min.js','styles.css']){const h=crypto.createHash('md5').update(fs.readFileSync(path.join(root,f))).digest('hex').slice(0,8);html=html.replace(new RegExp('\\./'+f.replace(/\./g,'\\.')+'(\\?v=[0-9a-f]+)?','g'),'./'+f+'?v='+h)}
fs.writeFileSync(ip,html);console.log('built');
