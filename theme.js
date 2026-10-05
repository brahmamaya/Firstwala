/* A shared palette recolours the interface and every canvas experiment. */
(() => {
  const themes = {
    midnight: {scheme:'dark',bg:'#07121f',start:'#0a1d2d',end:'#081624',surface:'#102638',line:'#29475b',text:'#e9f6ff',muted:'#8ca6b9',mint:'#42d9ca',gold:'#ffc36b',blue:'#7baaff',red:'#ff857e',purple:'#b89dff'},
    violet: {scheme:'dark',bg:'#120e22',start:'#211637',end:'#160f2a',surface:'#302044',line:'#53406c',text:'#f3edff',muted:'#b2a3c8',mint:'#c6a1ff',gold:'#ffcd83',blue:'#8dbaff',red:'#ff91af',purple:'#8fe3d8'},
    chalkboard: {scheme:'dark',bg:'#0b1b17',start:'#143127',end:'#0d231d',surface:'#1b3b30',line:'#385e4c',text:'#eff6e8',muted:'#a3bca7',mint:'#a9dfa0',gold:'#f4d381',blue:'#96cbdc',red:'#ed9b93',purple:'#c9b8e4'},
    ink: {scheme:'dark',bg:'#0a0a0a',start:'#151515',end:'#0b0b0b',surface:'#1c1c1c',line:'#3a3a3a',text:'#f6f6f6',muted:'#9a9a9a',mint:'#ffffff',gold:'#d8d8d8',blue:'#cfcfcf',red:'#f0f0f0',purple:'#b6b6b6'},
  };
  const key='physica-theme';
  let selected='midnight',colours=new Map();
  const contexts=new WeakMap(),gradientTargets=new WeakMap();
  const baseColours={'#42d9ca':'mint','#ffc36b':'gold','#7baaff':'blue','#ff857e':'red','#b89dff':'purple','#e9f6ff':'text','#eff8ff':'text','#8ca6b9':'muted','#0a1d2d':'start','#081624':'end','#29475b':'line','#1d3547':'line'};
  const blend=(a,b,t)=>'#'+[1,3,5].map(i=>Math.round(parseInt(a.slice(i,i+2),16)*(1-t)+parseInt(b.slice(i,i+2),16)*t).toString(16).padStart(2,'0')).join('');
  function colour(value){
    if(typeof value!=='string'||selected==='midnight')return value;
    if(colours.has(value))return colours.get(value);
    const match=/^#([\da-f]{6})([\da-f]{2})?$/i.exec(value);
    if(!match){const rgba=/^rgba?\(\s*(\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)$/.exec(value);if(!rgba)return value;const hex='#'+rgba.slice(1,4).map(n=>Number(n).toString(16).padStart(2,'0')).join(''),mapped=colour(hex);return `rgba(${parseInt(mapped.slice(1,3),16)},${parseInt(mapped.slice(3,5),16)},${parseInt(mapped.slice(5,7),16)},${rgba[4]||1})`;}
    const hex='#'+match[1].toLowerCase(),alpha=match[2]||'',p=themes[selected];
    let output=baseColours[hex]&&p[baseColours[hex]];
    if(!output){
      const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16),high=Math.max(r,g,b),low=Math.min(r,g,b);
      // Navy structural colours follow the palette; spectral/object colours stay meaningful.
      if(b>=r&&g>=r&&high<82)output=blend(p.end,p.surface,Math.min(1,high/65));
      else if(b>=r&&g>=r&&high<165&&high-low<80)output=p.line;
      else if(high>180&&high-low<65)output=p.text;
      else if(high-low<50&&high>=100)output=p.muted;
    }
    const result=(output||hex)+alpha;colours.set(value,result);return result;
  }
  function wrapContext(context){
    if(contexts.has(context))return contexts.get(context);
    const methods=new Map();
    const proxy=new Proxy(context,{
      get(target,property){
        if(methods.has(property))return methods.get(property);
        const value=Reflect.get(target,property,target);
        if(typeof value!=='function')return value;
        let fn;
        if(['createLinearGradient','createRadialGradient','createConicGradient'].includes(property))fn=(...args)=>{
          const gradient=value.apply(target,args);
          const wrapped=new Proxy(gradient,{get(g,k){if(k==='addColorStop')return(offset,c)=>g.addColorStop(offset,colour(c));const v=Reflect.get(g,k,g);return typeof v==='function'?v.bind(g):v}});
          gradientTargets.set(wrapped,gradient);return wrapped;
        };
        else fn=value.bind(target);
        methods.set(property,fn);return fn;
      },
      set(target,property,value){
        if(property==='shadowBlur'&&window.PhysicaLite)value=Math.min(value,2); // big boards: soft glows are the costliest canvas effect
        if(['fillStyle','strokeStyle','shadowColor'].includes(property))value=typeof value==='string'?colour(value):(gradientTargets.get(value)||value);
        return Reflect.set(target,property,value,target);
      }
    });
    contexts.set(context,proxy);return proxy;
  }
  function setTheme(name,persist=true){
    if(!Object.hasOwn(themes,name))name='midnight';
    selected=name;colours=new Map();
    document.documentElement.dataset.theme=name;
    document.documentElement.style.colorScheme=themes[name].scheme;
    const meta=document.querySelector('meta[name="theme-color"]');if(meta)meta.content=themes[name].bg;
    const select=document.getElementById('theme-select');if(select)select.value=name;
    if(persist)try{localStorage.setItem(key,name)}catch{}
    window.dispatchEvent(new Event('physica-theme-change'));
  }
  window.PhysicaTheme={wrapContext,setTheme,get current(){return selected},names:Object.keys(themes)};
  let remembered;try{remembered=localStorage.getItem(key)}catch{}
  setTheme(remembered||'midnight',false);
  const connect=()=>{const select=document.getElementById('theme-select');if(!select)return;select.value=selected;select.addEventListener('change',()=>setTheme(select.value));};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',connect,{once:true});else connect();
  window.addEventListener('storage',e=>{if(e.key===key)setTheme(e.newValue||'midnight',false)});
})();
