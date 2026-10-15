/* A shared palette recolours the interface and every canvas experiment. */
(() => {
  const themes = {
    dark: {scheme:'dark',bg:'#07121f',start:'#0a1d2d',end:'#081624',surface:'#102638',line:'#29475b',text:'#e9f6ff',muted:'#8ca6b9',mint:'#42d9ca',gold:'#ffc36b',blue:'#7baaff',red:'#ff857e',purple:'#b89dff'},
    light: {scheme:'light',bg:'#f4f7fb',start:'#ffffff',end:'#eef3f9',surface:'#dfe8f2',line:'#9db0c4',text:'#122033',muted:'#4c6076',mint:'#0b857c',gold:'#a86a00',blue:'#2a58c8',red:'#c8372f',purple:'#6b44c8'},
  };
  const key='physica-theme';
  let selected='dark',colours=new Map();
  const contexts=new WeakMap(),plainContexts=new WeakMap(),gradientTargets=new WeakMap();
  const baseColours={'#42d9ca':'mint','#ffc36b':'gold','#7baaff':'blue','#ff857e':'red','#b89dff':'purple','#e9f6ff':'text','#eff8ff':'text','#8ca6b9':'muted','#0a1d2d':'start','#081624':'end','#29475b':'line','#1d3547':'line'};
  const blend=(a,b,t)=>'#'+[1,3,5].map(i=>Math.round(parseInt(a.slice(i,i+2),16)*(1-t)+parseInt(b.slice(i,i+2),16)*t).toString(16).padStart(2,'0')).join('');
  function colour(value){
    if(typeof value!=='string'||selected==='dark')return value;
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
  /* keep=true: the experiment stage keeps its original colours in every theme (it sits on a dark viewport) */
  function wrapContext(context,keep){
    const cache=keep?plainContexts:contexts,tone=keep?(c=>c):colour;
    if(cache.has(context))return cache.get(context);
    const methods=new Map();
    const proxy=new Proxy(context,{
      get(target,property){
        if(methods.has(property))return methods.get(property);
        const value=Reflect.get(target,property,target);
        if(typeof value!=='function')return value;
        let fn;
        if(['createLinearGradient','createRadialGradient','createConicGradient'].includes(property))fn=(...args)=>{
          const gradient=value.apply(target,args);
          const wrapped=new Proxy(gradient,{get(g,k){if(k==='addColorStop')return(offset,c)=>g.addColorStop(offset,tone(c));const v=Reflect.get(g,k,g);return typeof v==='function'?v.bind(g):v}});
          gradientTargets.set(wrapped,gradient);return wrapped;
        };
        else fn=value.bind(target);
        methods.set(property,fn);return fn;
      },
      set(target,property,value){
        if(property==='shadowBlur'&&window.PhysicaLite)value=Math.min(value,2); // big boards: soft glows are the costliest canvas effect
        if(['fillStyle','strokeStyle','shadowColor'].includes(property))value=typeof value==='string'?tone(value):(gradientTargets.get(value)||value);
        return Reflect.set(target,property,value,target);
      }
    });
    cache.set(context,proxy);return proxy;
  }
  function setTheme(name,persist=true){
    if(!Object.hasOwn(themes,name))name='dark'; /* the older Midnight, Violet, Chalkboard and Ink palettes now map to Dark */
    selected=name;colours=new Map();
    document.documentElement.dataset.theme=name;
    document.documentElement.style.colorScheme=themes[name].scheme;
    const meta=document.querySelector('meta[name="theme-color"]');if(meta)meta.content=themes[name].bg;
    const select=document.getElementById('theme-select');if(select)select.value=name;
    if(persist)try{localStorage.setItem(key,name)}catch{}
    window.dispatchEvent(new Event('physica-theme-change'));
  }
  const toggle=()=>setTheme(selected==='light'?'dark':'light');
  /* a small Dark / Light switch that can be placed on any screen (landing page, Rank mode, information pages) */
  const toggles=new Set();
  const paintToggle=b=>{const light=selected==='light';b.textContent=light?'☾ Dark':'☀ Light';b.setAttribute('aria-label',light?'Switch to the dark theme':'Switch to the light theme');b.title=b.getAttribute('aria-label')};
  function mountToggle(parent,cls){if(!parent)return null;const old=parent.querySelector(':scope>.theme-toggle');if(old)return old;const b=document.createElement('button');b.type='button';b.className='theme-toggle'+(cls?' '+cls:'');b.dataset.testid='theme-toggle';b.addEventListener('click',toggle);toggles.add(b);paintToggle(b);parent.append(b);return b}
  window.addEventListener('physica-theme-change',()=>{for(const b of toggles){if(b.isConnected)paintToggle(b);else toggles.delete(b)}});
  window.PhysicaTheme={wrapContext,setTheme,toggle,mountToggle,get current(){return selected},names:Object.keys(themes)};
  let remembered;try{remembered=localStorage.getItem(key)}catch{}
  setTheme(remembered||'dark',false);
  const connect=()=>{mountToggle(document.getElementById('landing'),'landing-theme');const select=document.getElementById('theme-select');if(!select)return;select.value=selected;select.addEventListener('change',()=>setTheme(select.value));};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',connect,{once:true});else connect();
  window.addEventListener('storage',e=>{if(e.key===key)setTheme(e.newValue||'dark',false)});
})();
