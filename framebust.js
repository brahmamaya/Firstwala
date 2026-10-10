/* clickjacking guard for hosts that cannot send X-Frame-Options / frame-ancestors (GitHub Pages): never show inside another site's frame */
if(window.top!==window.self){document.documentElement.style.display='none';try{window.top.location=window.self.location.href}catch(e){}}
