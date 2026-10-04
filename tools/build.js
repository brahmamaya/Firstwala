// Builds the two production bundles from the readable source files listed in index.src.html order.
// Usage: node tools/build.js   (needs esbuild: npm i -g esbuild, or run with npx)
const fs=require('fs'),path=require('path'),{execFileSync}=require('child_process');
const root=path.join(__dirname,'..'),ESB=process.env.ESBUILD||'esbuild';
const CORE=['compat.js','mathtext.js','theme.js','physica3d.js'];
const MAIN=['physics.js','extras.js','enhancements.js','third.js','fourth.js','fifth.js','sixth.js','labkit.js','seventh.js','eighth.js','ninth.js','tenth.js','biokit.js','bio1.js','bio2.js','bio3.js','bio4.js','bio5.js','chem1.js','chem2.js','chem3.js','chem4.js','phys3d-a.js','phys3d-b.js','phys3d-c.js','phys3d-d.js','real3d-11a.js','real3d-11b.js','real3d-11c.js','real3d-11d.js','real3d-11e.js','instruments2d.js','optics2d.js','vendor/matter.min.js','experience.js','app.js','sandbox-studio.js','ultra3d.js','focus.js','landing-bg.js','landing.js'];
function bundle(list,out){const src=list.map(f=>f.startsWith('vendor/')?fs.readFileSync(path.join(root,f),'utf8')+'\n;':`;(function(){${fs.readFileSync(path.join(root,f),'utf8')}\n})();`).join('\n');
  const tmp=path.join(root,'.build.tmp.js');fs.writeFileSync(tmp,src);execFileSync(ESB,[tmp,'--minify','--target=es2018','--legal-comments=none','--outfile='+path.join(root,out)],{stdio:'inherit'});fs.unlinkSync(tmp)}
bundle(CORE,'physica-core.min.js');bundle(MAIN,'physica.min.js');console.log('built');
