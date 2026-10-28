// Builds the two production bundles from the readable source files listed in index.src.html order.
// Usage: node tools/build.js   (needs esbuild: npm i -g esbuild, or run with npx)
const fs=require('fs'),path=require('path'),{execFileSync}=require('child_process');
const root=path.join(__dirname,'..'),ESB=process.env.ESBUILD||'esbuild';
require('./secret-guard.js')(root); // no API keys or tokens may ever ship
const CORE=['compat.js','mathtext.js','theme.js','physica3d.js'];
const MAIN=['physics.js','extras.js','enhancements.js','third.js','fourth.js','fifth.js','sixth.js','labkit.js','seventh.js','eighth.js','ninth.js','tenth.js','eleventh.js','class10-new.js','biokit.js','.subjects.tmp.js','phys3d-a.js','phys3d-b.js','phys3d-c.js','phys3d-d.js','instruments2d.js','optics2d.js','mirrors2d.js','experience.js','class10.js','app.js','focus.js','recorder.js','landing.js','feedback.js','install.js','series-loader.js','tutor-speech.js','tutor.js','lazy.js','stats.js'];
const TUTOR=['tutor-content.js','tutor-chapters.js','tutor-teacher-content.js','tutor-learned.js','phys-fig.js','tutor-mock.js']; // loaded only when a student opens the AI Tutor
const EXAM=['tutor-exam.js']; // Board/JEE/NEET questions and mock tests: loaded only when the Exam tab opens
// Botany/Zoology and Chemistry ship as their own packs; the main bundle carries only their index (tools/subject-manifest.js)
const SUBJECTS={bio:['bio1.js','bio2.js','bio3.js','bio4.js','bio5.js'],chem:['chem1.js','chem2.js','chem3.js','chem4.js']};
const PACK=['real3d-11a.js','real3d-11b.js','real3d-11c.js','real3d-11d.js','real3d-11e.js','ultra3d.js'];
function bundle(list,out){const src=list.map(f=>f.startsWith('vendor/')?fs.readFileSync(path.join(root,f),'utf8')+'\n;':`;(function(){${fs.readFileSync(path.join(root,f),'utf8')}\n})();`).join('\n');
  const tmp=path.join(root,'.build.tmp.js');fs.writeFileSync(tmp,src);execFileSync(ESB,[tmp,'--minify','--target=es2018','--legal-comments=none','--outfile='+path.join(root,out)],{stdio:'inherit'});fs.unlinkSync(tmp)}
bundle(CORE,'physica-core.min.js');bundle(PACK,'physica-3d.min.js');
// the Hinglish pronunciation map (tools/hinglish-voice.js) rides in the tutor pack
fs.writeFileSync(path.join(root,'.hlvoice.tmp.js'),require('./hinglish-voice.js')(root,TUTOR).js);
// the exam questions ship as their own pack; the tutor pack carries just the list of chapters that have them
bundle(EXAM,'physica-exam.min.js');
// PYQ: one bundle per chapter + an index (topic -> sub-topic -> count) built into physica-rank.min.js, so the PYQ tab lists topics without chapter data
const PYQ_FILES=fs.readdirSync(root).filter(f=>/^rank-pyq-[a-z]+\.js$/.test(f)).sort(),PYQ_IDX={},PYQ_MAP={};
for(const f of PYQ_FILES){const box={};require('vm').runInNewContext(fs.readFileSync(path.join(root,f),'utf8'),{window:box});const g=Object.keys(box).find(k=>/^PhysicaRankPyq/.test(k)),out='physica-pyq-'+f.slice(9,-3)+'.min.js';
  const T=new Map();for(const q of box[g]){if(!T.has(q.tp))T.set(q.tp,new Map());const m=T.get(q.tp);m.set(q.st,(m.get(q.st)||0)+1)}
  PYQ_IDX[g]=[...T].map(([tp,m])=>[tp,[...m]]);bundle([f],out);PYQ_MAP[g]=out}
bundle(['rank-export.js'],'physica-export.min.js');
bundle(['series-exam.js'],'physica-series-exam.min.js'); // the exam screen, fetched when a test starts
bundle(['series.js'],'physica-series.min.js');           // Test Series hub, login, results; fetched when a student opens it
{const sp=path.join(root,'physica-series.min.js');fs.writeFileSync(sp,fs.readFileSync(sp,'utf8').replace('__SERIES_EXAM_URL__','./physica-series-exam.min.js?v='+require('crypto').createHash('md5').update(fs.readFileSync(path.join(root,'physica-series-exam.min.js'))).digest('hex').slice(0,8)))}
bundle(['phys-fig.js','rank-figs.js','rank-units.js','rank-units-jee.js','rank-kin-jee.js','rank-lom-jee.js','rank-wep-jee.js','rank-rot-jee.js','rank-grav-jee.js','rank-prop-jee.js','rank-thermo-jee.js','rank-ktg-jee.js','rank-osc-jee.js','rank-electro-jee.js','rank-current-jee.js','rank-em-jee.js','rank-optics-jee.js','rank-dual-jee.js','rank-neet.js'],'physica-rank.min.js');
{const rp=path.join(root,'physica-rank.min.js'),hh=f=>require('crypto').createHash('md5').update(fs.readFileSync(path.join(root,f))).digest('hex').slice(0,8),map={};for(const g of Object.keys(PYQ_MAP))map[g]='./'+PYQ_MAP[g]+'?v='+hh(PYQ_MAP[g]);
  fs.writeFileSync(rp,fs.readFileSync(rp,'utf8').replace('__PYQ_IDX__',()=>JSON.stringify(PYQ_IDX)).replace('__PYQ_MAP__',()=>JSON.stringify(map)).replace('__EXPORT_URL__','./physica-export.min.js?v='+hh('physica-export.min.js')))}
{const box={};require('vm').runInNewContext(fs.readFileSync(path.join(root,'tutor-exam.js'),'utf8'),{window:box});fs.writeFileSync(path.join(root,'.examidx.tmp.js'),'window.PhysicaExamChapters='+JSON.stringify(Object.keys(box.PhysicaExam))+';')}
try{bundle([...TUTOR,'.hlvoice.tmp.js','.examidx.tmp.js'],'physica-tutor.min.js')}finally{fs.unlinkSync(path.join(root,'.hlvoice.tmp.js'));fs.unlinkSync(path.join(root,'.examidx.tmp.js'))}
{const tp=path.join(root,'physica-tutor.min.js'),eh=require('crypto').createHash('md5').update(fs.readFileSync(path.join(root,'physica-exam.min.js'))).digest('hex').slice(0,8);fs.writeFileSync(tp,fs.readFileSync(tp,'utf8').replace('__EXAM_URL__','./physica-exam.min.js?v='+eh))}
const crypto0=require('crypto'),packV=crypto0.createHash('md5').update(fs.readFileSync(path.join(root,'physica-3d.min.js'))).digest('hex').slice(0,8);
const hashOf=f=>crypto0.createHash('md5').update(fs.readFileSync(path.join(root,f))).digest('hex').slice(0,8);
for(const k of Object.keys(SUBJECTS))bundle(SUBJECTS[k],'physica-'+k+'.min.js');
fs.writeFileSync(path.join(root,'.subjects.tmp.js'),require('./subject-manifest.js')(root,SUBJECTS));
try{bundle(MAIN,'physica.min.js')}finally{fs.unlinkSync(path.join(root,'.subjects.tmp.js'))}
{const pm=path.join(root,'physica.min.js');let js=fs.readFileSync(pm,'utf8');for(const k of Object.keys(SUBJECTS))js=js.replace('__'+k.toUpperCase()+'_URL__','./physica-'+k+'.min.js?v='+hashOf('physica-'+k+'.min.js'));fs.writeFileSync(pm,js
.replace('__SERIES_URL__','./physica-series.min.js?v='+hashOf('physica-series.min.js')).replace('__LAZY_URL__','./physica-3d.min.js?v='+packV).replace('__RANK_URL__','./physica-rank.min.js?v='+crypto0.createHash('md5').update(fs.readFileSync(path.join(root,'physica-rank.min.js'))).digest('hex').slice(0,8)).replace('__TUTOR_URL__','./physica-tutor.min.js?v='+crypto0.createHash('md5').update(fs.readFileSync(path.join(root,'physica-tutor.min.js'))).digest('hex').slice(0,8)))}
// styles: drop overridden declarations (tools/optimize-css.js), then serve a minified copy
execFileSync(process.execPath,[path.join(__dirname,'optimize-css.js')],{stdio:'inherit'});execFileSync(ESB,[path.join(root,'styles.css'),'--minify','--log-level=warning','--outfile='+path.join(root,'styles.min.css')],{stdio:'inherit'});
const crypto=require('crypto'),ip=path.join(root,'index.html');let html=fs.readFileSync(ip,'utf8');
html=html.replace(/\.\/styles\.css(\?v=[0-9a-f]+)?/g,'./styles.min.css');
for(const f of['physica-core.min.js','physica.min.js','styles.min.css']){const h=crypto.createHash('md5').update(fs.readFileSync(path.join(root,f))).digest('hex').slice(0,8);html=html.replace(new RegExp('\\./'+f.replace(/\./g,'\\.')+'(\\?v=[0-9a-f]+)?','g'),'./'+f+'?v='+h)}
fs.writeFileSync(ip,html);console.log('built');
require('./lockdown.js');
