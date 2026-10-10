/* Builds _site/: only the files the public site needs. The readable sources, tools/, notes and configs are left out,
   because GitHub Pages serves everything in the published folder and cannot send headers or hide files. */
const fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),out=path.join(root,'_site');
const FILE=/^(CNAME|manifest\.webmanifest|styles\.min\.css|info\.css|ga\.js|sw\.js|help\.js|framebust\.js|[A-Za-z0-9._-]+\.html|[A-Za-z0-9._-]+\.min\.js)$/;
const DIRS=['fonts','icons','.well-known'];
fs.rmSync(out,{recursive:true,force:true});fs.mkdirSync(out);
const copy=(a,b)=>{const st=fs.statSync(a);if(st.isDirectory()){fs.mkdirSync(b,{recursive:true});for(const f of fs.readdirSync(a))copy(path.join(a,f),path.join(b,f))}else fs.copyFileSync(a,b)};
let n=0;for(const f of fs.readdirSync(root)){if(FILE.test(f)){copy(path.join(root,f),path.join(out,f));n++}}
for(const d of DIRS)if(fs.existsSync(path.join(root,d)))copy(path.join(root,d),path.join(out,d));
fs.writeFileSync(path.join(out,'.nojekyll'),'');
console.log('publish: '+n+' files + '+DIRS.join(', ')+' -> _site');
